//! 케이무비 데스크톱 껍데기 — 브라우저판(keduclass.com/kmovie/)에 "무거운 원본을 먹여 주는 손".
//! 하는 일 4가지: 접속 게이트 · 원본 → 프록시(ffmpeg) · 프록시/파일 읽기 · 원화질 프레임 파이프 + 저장.
//! 편집 로직은 한 줄도 없다. 설계: handoff/kmovie/케이무비_데스크톱_껍데기_설계_v1.md

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{BufRead, BufReader, Read, Seek, SeekFrom, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdout, Command, Stdio};
use std::sync::Mutex;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{AppHandle, Emitter, Manager, State, WebviewUrl, WebviewWindowBuilder};

const SITE: &str = "https://keduclass.com/kmovie/?shell=1";
const SITE_HOST: &str = "keduclass.com";
const FPS: i64 = 30;
const FRAME_W: u32 = 1920;
const FRAME_H: u32 = 1080;
const FRAME_BYTES: usize = (FRAME_W * FRAME_H * 4) as usize;
const MAX_SEC: f64 = 15.0 * 60.0; // 껍데기 원본 상한(프록시 샘플+PCM 이 브라우저 메모리에 다 올라가므로)
const MAX_SIDE_BYTES: u64 = 400 * 1024 * 1024; // 사진·음악 상한
const CHUNK_MAX: usize = 32 * 1024 * 1024;
const KEEP_DAYS: u64 = 30; // 안 쓴 프록시 보관 기간
const SEEK_EPS: f64 = 0.002; // 키프레임 pts 바로 앞으로 seek (float 오차로 키프레임을 놓치지 않게)
const REOPEN_GAP: i64 = 90; // 이만큼 앞으로 건너뛸 땐 읽어 버리는 것보다 다시 seek 이 싸다

/* ---------------- 상태 ---------------- */

pub struct Shell {
    proxy_dir: PathBuf,
    ffmpeg: PathBuf,
    ffprobe: PathBuf,
    metas: Mutex<HashMap<String, ProxyMeta>>,
    frames: Mutex<HashMap<String, FrameSession>>,
    exports: Mutex<HashMap<u32, File>>,
    export_seq: Mutex<u32>,
}

struct FrameSession {
    hash: String,
    child: Child,
    out: ChildStdout,
    cur: i64, // 다음에 stdout 에서 읽힐 프록시 프레임 번호
}

impl Drop for FrameSession {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

/// 프록시 옆에 저장되는 메타(<hash>.json). 원화질 프레임 파이프가 프록시와 같은 프레임을 뽑기 위한 정보 포함.
#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProxyMeta {
    pub hash: String,
    pub name: String,
    pub path: String,
    pub size: u64,
    pub mtime: u64,
    pub w: u32,
    pub h: u32,
    pub dur_sec: f64,
    pub fps: f64,
    pub codec: String,
    pub proxy_size: u64,
    pub made: u64,
    pub used: u64,
    // 프레임 정렬용 (전부 원본 스트림 타임베이스 정수)
    pub tb_num: i64,
    pub tb_den: i64,
    pub start_us: i64, // format.start_time (µs) — ffmpeg 가 기본으로 빼는 값
    pub first_pts: i64,
    pub keys: Vec<i64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportInfo {
    pub kind: String,
    pub name: String,
    pub path: String,
    pub size: u64,
    pub mtime: u64,
    pub hash: String,
    pub bytes: u64, // 읽어야 할 총 바이트(프록시 또는 파일)
    pub w: u32,
    pub h: u32,
    pub dur_sec: f64,
    pub fps: f64,
    pub codec: String,
    pub cached: bool,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Progress {
    pub path: String,
    pub stage: String,
    pub pct: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CacheInfo {
    pub count: usize,
    pub bytes: u64,
    pub dir: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ShellInfo {
    pub version: String,
    pub os: String,
    pub ffmpeg: bool,
    pub ffmpeg_version: String,
    pub max_sec: f64,
    pub frame_w: u32,
    pub frame_h: u32,
    pub cache: CacheInfo,
}

/* ---------------- 유틸 ---------------- */

fn now() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0)
}

fn cmd(bin: &Path) -> Command {
    let c = Command::new(bin);
    #[cfg(windows)]
    let c = {
        use std::os::windows::process::CommandExt;
        let mut c = c;
        c.creation_flags(0x0800_0000); // CREATE_NO_WINDOW — 콘솔 창 안 뜨게
        c
    };
    c
}

/// exe 옆(sidecar) → PATH 순으로 ffmpeg/ffprobe 를 찾는다.
fn find_bin(name: &str) -> PathBuf {
    let exe = std::env::current_exe().ok();
    let ext = if cfg!(windows) { ".exe" } else { "" };
    if let Some(dir) = exe.as_ref().and_then(|p| p.parent()) {
        let p = dir.join(format!("{name}{ext}"));
        if p.exists() {
            return p;
        }
    }
    PathBuf::from(format!("{name}{ext}"))
}

fn fnv1a(bytes: &[u8], mut h: u64) -> u64 {
    for &b in bytes {
        h ^= b as u64;
        h = h.wrapping_mul(0x0000_0100_0000_01B3);
    }
    h
}

/// 파일 정체성: 크기 + 수정시각 + 앞뒤 1MB. 경로가 바뀌어도 같은 파일이면 같은 프록시.
fn file_hash(path: &Path) -> Result<(String, u64, u64), String> {
    let md = fs::metadata(path).map_err(|e| format!("파일을 열 수 없어요: {e}"))?;
    let size = md.len();
    let mtime = md.modified().ok().and_then(|t| t.duration_since(UNIX_EPOCH).ok()).map(|d| d.as_secs()).unwrap_or(0);
    let mut f = File::open(path).map_err(|e| format!("파일을 열 수 없어요: {e}"))?;
    let mut h = 0xcbf2_9ce4_8422_2325u64;
    h = fnv1a(&size.to_le_bytes(), h);
    h = fnv1a(&mtime.to_le_bytes(), h);
    let mut buf = vec![0u8; 1024 * 1024];
    let n = f.read(&mut buf).map_err(|e| e.to_string())?;
    h = fnv1a(&buf[..n], h);
    if size > 2 * 1024 * 1024 {
        f.seek(SeekFrom::End(-(1024 * 1024))).map_err(|e| e.to_string())?;
        let n = f.read(&mut buf).map_err(|e| e.to_string())?;
        h = fnv1a(&buf[..n], h);
    }
    Ok((format!("{h:016x}{:x}", size), size, mtime))
}

fn kind_of(path: &Path) -> &'static str {
    let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("").to_ascii_lowercase();
    match ext.as_str() {
        "mp4" | "mov" | "m4v" | "mkv" | "avi" | "mts" | "m2ts" | "webm" | "3gp" | "wmv" | "ts" | "mpg" | "mpeg" => "video",
        "png" | "jpg" | "jpeg" | "webp" | "bmp" | "gif" => "image",
        "mp3" | "wav" | "m4a" | "aac" | "ogg" | "oga" | "flac" | "wma" => "audio",
        _ => "",
    }
}

/// av_rescale_q_rnd(a, b/c) — NEAR_INF (반올림, 0.5 는 0 에서 먼 쪽). ffmpeg 와 같은 규칙.
fn rescale_rnd(a: i128, b: i128, c: i128) -> i64 {
    let v = a * b;
    let r = if v >= 0 { (v + c / 2) / c } else { -((-v + c / 2) / c) };
    r as i64
}

impl ProxyMeta {
    /// 원본 pts(스트림 tb) → 30fps 슬롯. ffmpeg 가 기본으로 빼는 -start_time 오프셋까지 똑같이.
    fn slot(&self, pts: i64) -> i64 {
        let off = rescale_rnd(-(self.start_us as i128), self.tb_den as i128, 1_000_000i128 * self.tb_num as i128); // µs → 스트림 tb
        rescale_rnd((pts + off) as i128, (self.tb_num * FPS) as i128, self.tb_den as i128)
    }
    fn slot0(&self) -> i64 {
        self.slot(self.first_pts)
    }
    /// 프록시 프레임 idx 를 뽑기 위한 (seek 초, 건너뛸 프레임 수). seek 없으면 None.
    /// 규칙: 목표 슬롯보다 *작은* 슬롯의 마지막 키프레임에서 시작 — 그 키프레임 슬롯 자체는 버리고 다음 슬롯부터 쓰면
    /// 앞 GOP 의 프레임이 같은 슬롯을 먼저 차지했던 경우(60fps 원본)와도 완전히 같아진다. 검증: shell/test/frame-map.py
    fn plan(&self, idx: i64) -> (Option<f64>, i64) {
        let target = idx + self.slot0();
        let mut key: Option<i64> = None;
        for &k in &self.keys {
            if self.slot(k) < target {
                key = Some(k);
            } else {
                break;
            }
        }
        match key {
            Some(k) => {
                let ksec = k as f64 * self.tb_num as f64 / self.tb_den as f64;
                let ss = ksec - self.start_us as f64 / 1e6 - SEEK_EPS;
                if ss <= 0.0 {
                    (None, idx)
                } else {
                    (Some(ss), target - self.slot(k))
                }
            }
            None => (None, idx),
        }
    }
}

/* ---------------- ffprobe ---------------- */

fn probe_json(ffprobe: &Path, path: &Path) -> Result<serde_json::Value, String> {
    let out = cmd(ffprobe)
        .args(["-v", "error", "-select_streams", "v:0", "-show_entries",
            "stream=width,height,r_frame_rate,avg_frame_rate,codec_name,time_base,duration:stream_side_data=rotation:format=duration,start_time",
            "-of", "json"])
        .arg(path)
        .output()
        .map_err(|e| format!("ffprobe 실행 실패: {e}"))?;
    if !out.status.success() {
        return Err(format!("영상 정보를 읽을 수 없어요: {}", String::from_utf8_lossy(&out.stderr).trim()));
    }
    serde_json::from_slice(&out.stdout).map_err(|e| format!("ffprobe 결과 해석 실패: {e}"))
}

fn parse_ratio(s: &str) -> Option<(i64, i64)> {
    let mut it = s.split('/');
    let a = it.next()?.trim().parse::<i64>().ok()?;
    let b = it.next().map(|v| v.trim().parse::<i64>().unwrap_or(1)).unwrap_or(1);
    if b == 0 { None } else { Some((a, b)) }
}

/// 비디오 패킷 pts 표 → (첫 pts, 키프레임 pts 목록). 디코드 없이 컨테이너만 읽어 빠르다.
fn probe_packets(ffprobe: &Path, path: &Path) -> Result<(i64, Vec<i64>), String> {
    let out = cmd(ffprobe)
        .args(["-v", "error", "-select_streams", "v:0", "-show_entries", "packet=pts,flags", "-of", "csv=p=0"])
        .arg(path)
        .output()
        .map_err(|e| format!("ffprobe 실행 실패: {e}"))?;
    let text = String::from_utf8_lossy(&out.stdout);
    let mut first = i64::MAX;
    let mut keys = Vec::new();
    for line in text.lines() {
        let mut parts = line.split(',');
        let pts = match parts.next().and_then(|p| p.trim().parse::<i64>().ok()) { Some(v) => v, None => continue };
        let flags = parts.next().unwrap_or("");
        if pts < first { first = pts; }
        if flags.contains('K') { keys.push(pts); }
    }
    if first == i64::MAX {
        return Err("영상 프레임을 찾지 못했어요".into());
    }
    keys.sort_unstable();
    keys.dedup();
    Ok((first, keys))
}

/* ---------------- 프록시 ---------------- */

impl Shell {
    fn proxy_path(&self, hash: &str) -> PathBuf { self.proxy_dir.join(format!("{hash}.mp4")) }
    fn meta_path(&self, hash: &str) -> PathBuf { self.proxy_dir.join(format!("{hash}.json")) }

    fn load_meta(&self, hash: &str) -> Option<ProxyMeta> {
        if let Some(m) = self.metas.lock().ok().and_then(|m| m.get(hash).cloned()) {
            return Some(m);
        }
        let text = fs::read_to_string(self.meta_path(hash)).ok()?;
        let m: ProxyMeta = serde_json::from_str(&text).ok()?;
        if !self.proxy_path(hash).exists() { return None; }
        if let Ok(mut map) = self.metas.lock() { map.insert(hash.to_string(), m.clone()); }
        Some(m)
    }

    fn save_meta(&self, m: &ProxyMeta) -> Result<(), String> {
        fs::write(self.meta_path(&m.hash), serde_json::to_string(m).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
        if let Ok(mut map) = self.metas.lock() { map.insert(m.hash.clone(), m.clone()); }
        Ok(())
    }

    fn touch(&self, hash: &str) {
        if let Some(mut m) = self.load_meta(hash) {
            m.used = now();
            let _ = self.save_meta(&m);
        }
    }

    fn cache_info(&self) -> CacheInfo {
        let mut count = 0;
        let mut bytes = 0;
        if let Ok(rd) = fs::read_dir(&self.proxy_dir) {
            for e in rd.flatten() {
                let p = e.path();
                if p.extension().and_then(|x| x.to_str()) == Some("mp4") {
                    count += 1;
                    bytes += e.metadata().map(|m| m.len()).unwrap_or(0);
                }
            }
        }
        CacheInfo { count, bytes, dir: self.proxy_dir.to_string_lossy().to_string() }
    }

    /// 시작 시: KEEP_DAYS 동안 안 쓴 프록시·고아 파일 정리.
    fn sweep(&self) {
        let cutoff = now().saturating_sub(KEEP_DAYS * 86400);
        if let Ok(rd) = fs::read_dir(&self.proxy_dir) {
            for e in rd.flatten() {
                let p = e.path();
                let ext = p.extension().and_then(|x| x.to_str()).unwrap_or("");
                let stem = p.file_stem().and_then(|x| x.to_str()).unwrap_or("").to_string();
                if ext == "tmp" { let _ = fs::remove_file(&p); continue; }
                if ext == "json" {
                    let meta: Option<ProxyMeta> = fs::read_to_string(&p).ok().and_then(|t| serde_json::from_str(&t).ok());
                    let stale = meta.as_ref().map(|m| m.used < cutoff).unwrap_or(true) || !self.proxy_path(&stem).exists();
                    if stale { let _ = fs::remove_file(self.proxy_path(&stem)); let _ = fs::remove_file(&p); }
                } else if ext == "mp4" && !self.meta_path(&stem).exists() {
                    let _ = fs::remove_file(&p);
                }
            }
        }
    }

    fn make_proxy(&self, app: &AppHandle, path: &Path, hash: &str, size: u64, mtime: u64) -> Result<ProxyMeta, String> {
        let name = path.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_else(|| "영상".into());
        let emit = |stage: &str, pct: f64| {
            let _ = app.emit("kmv-proxy", Progress { path: path.to_string_lossy().to_string(), stage: stage.into(), pct });
        };
        emit("정보 읽는 중", 0.0);
        let j = probe_json(&self.ffprobe, path)?;
        let st = j["streams"].get(0).ok_or("영상 트랙이 없어요")?;
        let w = st["width"].as_u64().unwrap_or(0) as u32;
        let h = st["height"].as_u64().unwrap_or(0) as u32;
        let codec = st["codec_name"].as_str().unwrap_or("").to_string();
        let (tb_num, tb_den) = parse_ratio(st["time_base"].as_str().unwrap_or("1/90000")).ok_or("타임베이스를 읽을 수 없어요")?;
        let fps = parse_ratio(st["avg_frame_rate"].as_str().unwrap_or("30/1")).map(|(a, b)| a as f64 / b as f64).unwrap_or(30.0);
        let dur_sec = j["format"]["duration"].as_str().and_then(|s| s.parse::<f64>().ok())
            .or_else(|| st["duration"].as_str().and_then(|s| s.parse::<f64>().ok())).unwrap_or(0.0);
        let start_us = (j["format"]["start_time"].as_str().and_then(|s| s.parse::<f64>().ok()).unwrap_or(0.0) * 1e6).round() as i64;
        if dur_sec > MAX_SEC {
            return Err(format!("{}분 이하 원본만 넣을 수 있어요 (이 원본 {:.0}분) — 폰에서 먼저 잘라 주세요", (MAX_SEC / 60.0) as i64, dur_sec / 60.0));
        }
        if w == 0 || h == 0 {
            return Err("영상 크기를 읽을 수 없어요".into());
        }
        emit("프레임 표 만드는 중", 0.02);
        let (first_pts, keys) = probe_packets(&self.ffprobe, path)?;

        // 프록시 비트레이트: 길수록 낮게 (브라우저 메모리에 샘플이 통째로 올라간다)
        let vbr = if dur_sec <= 300.0 { "6M" } else if dur_sec <= 600.0 { "4500k" } else { "3M" };
        let tmp = self.proxy_dir.join(format!("{hash}.tmp"));
        let dst = self.proxy_path(hash);
        let _ = fs::remove_file(&tmp);
        // 규격: 긴 변 1280 · 30fps · H.264 baseline · GOP 15 · AAC 128k · faststart · yuv420p(10bit HEVC 대응) · 회전 굽기(자동)
        // -fps_mode passthrough: CLI 쪽 프레임 보정을 끄고 fps 필터만 프레임을 고르게 → 원화질 파이프와 같은 규칙
        let mut child = cmd(&self.ffmpeg)
            .args(["-v", "error", "-nostdin", "-y", "-progress", "pipe:1", "-i"]).arg(path)
            .args(["-map", "0:v:0", "-map", "0:a:0?", "-sn", "-dn",
                "-vf", "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,fps=30,format=yuv420p",
                "-fps_mode", "passthrough",
                "-c:v", "libx264", "-preset", "veryfast", "-profile:v", "baseline", "-level", "4.0", "-g", "15", "-keyint_min", "15", "-sc_threshold", "0",
                "-b:v", vbr, "-maxrate", vbr, "-bufsize", "12M",
                "-c:a", "aac", "-b:a", "128k", "-ac", "2", "-ar", "48000",
                "-movflags", "+faststart", "-f", "mp4"])
            .arg(&tmp)
            .stdout(Stdio::piped()).stderr(Stdio::piped()).stdin(Stdio::null())
            .spawn()
            .map_err(|e| format!("ffmpeg 실행 실패: {e}"))?;
        emit("프록시 만드는 중", 0.03);
        if let Some(out) = child.stdout.take() {
            let rd = BufReader::new(out);
            for line in rd.lines().flatten() {
                if let Some(v) = line.strip_prefix("out_time_us=").or_else(|| line.strip_prefix("out_time_ms=")) {
                    if let Ok(us) = v.trim().parse::<f64>() {
                        let p = if dur_sec > 0.0 { (us / 1e6 / dur_sec).clamp(0.0, 1.0) } else { 0.0 };
                        emit("프록시 만드는 중", 0.03 + p * 0.95);
                    }
                }
            }
        }
        let mut err = String::new();
        if let Some(mut e) = child.stderr.take() { let _ = e.read_to_string(&mut err); }
        let status = child.wait().map_err(|e| e.to_string())?;
        if !status.success() {
            let _ = fs::remove_file(&tmp);
            return Err(format!("프록시를 만들지 못했어요: {}", err.trim().lines().last().unwrap_or("")));
        }
        fs::rename(&tmp, &dst).map_err(|e| format!("프록시 저장 실패: {e}"))?;
        let proxy_size = fs::metadata(&dst).map(|m| m.len()).unwrap_or(0);
        let meta = ProxyMeta {
            hash: hash.to_string(), name, path: path.to_string_lossy().to_string(), size, mtime, w, h, dur_sec, fps, codec, proxy_size,
            made: now(), used: now(), tb_num, tb_den, start_us, first_pts, keys,
        };
        self.save_meta(&meta)?;
        emit("완료", 1.0);
        Ok(meta)
    }

    /// 원화질 프레임 파이프 세션을 (다시) 연다. idx 부터 순서대로 읽을 수 있는 상태로.
    fn open_frames(&self, meta: &ProxyMeta, idx: i64) -> Result<FrameSession, String> {
        let (ss, skip) = meta.plan(idx);
        let mut c = cmd(&self.ffmpeg);
        c.args(["-v", "error", "-nostdin"]);
        if let Some(s) = ss { c.args(["-ss", &format!("{s:.6}")]); }
        c.args(["-copyts", "-start_at_zero", "-i"]).arg(&meta.path)
            .args(["-an", "-sn", "-dn", "-map", "0:v:0",
                "-vf", &format!("fps={FPS},scale={FRAME_W}:{FRAME_H}:force_original_aspect_ratio=decrease:force_divisible_by=2,pad={FRAME_W}:{FRAME_H}:(ow-iw)/2:(oh-ih)/2:black,format=rgba"),
                "-fps_mode", "passthrough", "-f", "rawvideo", "pipe:1"])
            .stdout(Stdio::piped()).stderr(Stdio::null()).stdin(Stdio::null());
        let mut child = c.spawn().map_err(|e| format!("ffmpeg 실행 실패: {e}"))?;
        let out = child.stdout.take().ok_or("ffmpeg 출력을 열 수 없어요")?;
        Ok(FrameSession { hash: meta.hash.clone(), child, out, cur: idx - skip })
    }
}

fn read_frame(out: &mut ChildStdout, buf: &mut [u8]) -> Result<bool, String> {
    let mut got = 0;
    while got < buf.len() {
        let n = out.read(&mut buf[got..]).map_err(|e| format!("프레임 읽기 실패: {e}"))?;
        if n == 0 { return Ok(false); }
        got += n;
    }
    Ok(true)
}

fn online() -> bool {
    match (SITE_HOST, 443u16).to_socket_addrs() {
        Ok(addrs) => addrs.into_iter().any(|a| TcpStream::connect_timeout(&a, Duration::from_secs(4)).is_ok()),
        Err(_) => false,
    }
}

/* ---------------- 커맨드 ---------------- */

#[tauri::command(async)]
fn shell_info(app: AppHandle, shell: State<'_, Shell>) -> ShellInfo {
    let ver = cmd(&shell.ffmpeg).arg("-version").output().ok()
        .map(|o| String::from_utf8_lossy(&o.stdout).lines().next().unwrap_or("").to_string()).unwrap_or_default();
    ShellInfo {
        version: app.package_info().version.to_string(),
        os: std::env::consts::OS.into(),
        ffmpeg: !ver.is_empty(),
        ffmpeg_version: ver,
        max_sec: MAX_SEC,
        frame_w: FRAME_W,
        frame_h: FRAME_H,
        cache: shell.cache_info(),
    }
}

#[tauri::command(async)]
fn pick_files(app: AppHandle) -> Vec<String> {
    use tauri_plugin_dialog::DialogExt;
    app.dialog().file()
        .set_title("케이무비에 넣을 영상·사진·음악")
        .add_filter("영상·사진·음악", &["mp4", "mov", "m4v", "mkv", "avi", "mts", "m2ts", "webm", "3gp", "wmv", "png", "jpg", "jpeg", "webp", "mp3", "wav", "m4a", "aac", "ogg", "flac"])
        .blocking_pick_files()
        .map(|v| v.into_iter().filter_map(|p| p.into_path().ok()).map(|p| p.to_string_lossy().to_string()).collect())
        .unwrap_or_default()
}

/// 경로 하나를 케이무비가 읽을 수 있는 형태로: 영상 → 프록시(없으면 생성, 진행률은 kmv-proxy 이벤트), 사진·음악 → 그대로.
#[tauri::command(async)]
fn import_path(app: AppHandle, shell: State<'_, Shell>, path: String) -> Result<ImportInfo, String> {
    let p = PathBuf::from(&path);
    let kind = kind_of(&p);
    if kind.is_empty() { return Err("mp4·mov 영상, jpg·png 사진, mp3·wav·m4a 음악만 넣을 수 있어요".into()); }
    let (hash, size, mtime) = file_hash(&p)?;
    let name = p.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default();
    if kind != "video" {
        if size > MAX_SIDE_BYTES { return Err("사진·음악은 400MB 이하만".into()); }
        return Ok(ImportInfo { kind: kind.into(), name, path, size, mtime, hash, bytes: size, w: 0, h: 0, dur_sec: 0.0, fps: 0.0, codec: String::new(), cached: false });
    }
    let (meta, cached) = match shell.load_meta(&hash) {
        Some(mut m) => { m.path = path.clone(); m.used = now(); let _ = shell.save_meta(&m); (m, true) }
        None => (shell.make_proxy(&app, &p, &hash, size, mtime)?, false),
    };
    Ok(ImportInfo { kind: "video".into(), name, path, size, mtime, hash, bytes: meta.proxy_size, w: meta.w, h: meta.h, dur_sec: meta.dur_sec, fps: meta.fps, codec: meta.codec, cached })
}

/// 프록시(hash) 또는 파일(path)의 [offset, offset+len) 바이트. JS 가 이어 붙여 File 로 만든다.
#[tauri::command(async)]
fn read_chunk(shell: State<'_, Shell>, hash: Option<String>, path: Option<String>, offset: u64, len: u64) -> Result<Response, String> {
    let p = match (&hash, &path) {
        (Some(h), _) => shell.proxy_path(h),
        (None, Some(pp)) => PathBuf::from(pp),
        _ => return Err("읽을 대상이 없어요".into()),
    };
    let mut f = File::open(&p).map_err(|e| format!("파일을 열 수 없어요: {e}"))?;
    f.seek(SeekFrom::Start(offset)).map_err(|e| e.to_string())?;
    let mut buf = vec![0u8; (len as usize).min(CHUNK_MAX)];
    let mut got = 0;
    while got < buf.len() {
        let n = f.read(&mut buf[got..]).map_err(|e| e.to_string())?;
        if n == 0 { break; }
        got += n;
    }
    buf.truncate(got);
    if let Some(h) = &hash { shell.touch(h); }
    Ok(Response::new(buf))
}

/// 프록시가 아직 있는지 (새로고침 복원용).
#[tauri::command(async)]
fn proxy_check(shell: State<'_, Shell>, hash: String) -> Option<u64> {
    shell.load_meta(&hash).map(|m| m.proxy_size)
}

/// 원본에서 프록시 프레임 idx 와 같은 프레임을 1920×1080 RGBA(레터박스) 로. 앞으로만 읽고, 뒤로 가거나 멀리 건너뛰면 다시 seek.
#[tauri::command(async)]
fn frame_next(shell: State<'_, Shell>, session: String, hash: String, idx: i64) -> Result<Response, String> {
    let meta = shell.load_meta(&hash).ok_or("프록시 정보가 없어요")?;
    if !Path::new(&meta.path).exists() { return Err(format!("원본 파일을 찾을 수 없어요: {}", meta.path)); }
    let mut map = shell.frames.lock().map_err(|_| "세션 잠금 실패")?;
    let reopen = match map.get(&session) {
        Some(s) => s.hash != hash || idx < s.cur || idx - s.cur > REOPEN_GAP,
        None => true,
    };
    if reopen {
        map.remove(&session);
        map.insert(session.clone(), shell.open_frames(&meta, idx)?);
    }
    let s = map.get_mut(&session).ok_or("세션이 없어요")?;
    let mut buf = vec![0u8; FRAME_BYTES];
    while s.cur < idx {
        if !read_frame(&mut s.out, &mut buf)? { map.remove(&session); return Err("원본 끝을 넘었어요".into()); }
        s.cur += 1;
    }
    if !read_frame(&mut s.out, &mut buf)? { map.remove(&session); return Err("원본 끝을 넘었어요".into()); }
    s.cur += 1;
    Ok(Response::new(buf))
}

#[tauri::command(async)]
fn frame_close(shell: State<'_, Shell>, session: Option<String>) {
    if let Ok(mut map) = shell.frames.lock() {
        match session { Some(s) => { map.remove(&s); } None => map.clear() }
    }
}

/// 저장 창 → 파일 핸들. 취소면 None.
#[tauri::command(async)]
fn export_open(app: AppHandle, shell: State<'_, Shell>, name: String) -> Result<Option<u32>, String> {
    use tauri_plugin_dialog::DialogExt;
    let picked = app.dialog().file().set_title("MP4 저장").set_file_name(&name).add_filter("MP4 영상", &["mp4"]).blocking_save_file();
    let Some(fp) = picked else { return Ok(None) };
    let p = fp.into_path().map_err(|e| e.to_string())?;
    let f = File::create(&p).map_err(|e| format!("파일을 만들 수 없어요: {e}"))?;
    let mut seq = shell.export_seq.lock().map_err(|_| "잠금 실패")?;
    *seq += 1;
    let id = *seq;
    shell.exports.lock().map_err(|_| "잠금 실패")?.insert(id, f);
    Ok(Some(id))
}

/// 본문 = 바이트, 헤더 x-id · x-pos. (mp4-muxer StreamTarget 은 mdat 크기를 끝에 되돌아가 고치므로 위치 쓰기)
#[tauri::command(async)]
fn export_write(shell: State<'_, Shell>, request: Request<'_>) -> Result<(), String> {
    let hdr = |k: &str| request.headers().get(k).and_then(|v| v.to_str().ok()).map(|s| s.to_string());
    let id: u32 = hdr("x-id").and_then(|v| v.parse().ok()).ok_or("x-id 없음")?;
    let pos: u64 = hdr("x-pos").and_then(|v| v.parse().ok()).ok_or("x-pos 없음")?;
    let bytes: &[u8] = match request.body() {
        InvokeBody::Raw(b) => b,
        InvokeBody::Json(_) => return Err("본문이 바이트가 아니에요".into()),
    };
    let mut map = shell.exports.lock().map_err(|_| "잠금 실패")?;
    let f = map.get_mut(&id).ok_or("저장 세션이 없어요")?;
    f.seek(SeekFrom::Start(pos)).map_err(|e| e.to_string())?;
    f.write_all(bytes).map_err(|e| format!("쓰기 실패: {e}"))?;
    Ok(())
}

#[tauri::command(async)]
fn export_close(shell: State<'_, Shell>, id: u32, abort: bool) -> Result<(), String> {
    let mut map = shell.exports.lock().map_err(|_| "잠금 실패")?;
    if let Some(mut f) = map.remove(&id) {
        if abort { drop(f); } else { f.flush().map_err(|e| e.to_string())?; }
    }
    Ok(())
}

#[tauri::command(async)]
fn cache_info(shell: State<'_, Shell>) -> CacheInfo { shell.cache_info() }

#[tauri::command(async)]
fn cache_clear(shell: State<'_, Shell>) -> CacheInfo {
    if let Ok(mut m) = shell.frames.lock() { m.clear(); }
    if let Ok(mut m) = shell.metas.lock() { m.clear(); }
    if let Ok(rd) = fs::read_dir(&shell.proxy_dir) {
        for e in rd.flatten() {
            let p = e.path();
            if matches!(p.extension().and_then(|x| x.to_str()), Some("mp4") | Some("json") | Some("tmp")) { let _ = fs::remove_file(p); }
        }
    }
    shell.cache_info()
}

#[tauri::command(async)]
fn open_cache_dir(shell: State<'_, Shell>) {
    #[cfg(windows)]
    { let _ = Command::new("explorer").arg(&shell.proxy_dir).spawn(); }
    #[cfg(not(windows))]
    { let _ = Command::new("xdg-open").arg(&shell.proxy_dir).spawn(); }
}

/// 오프라인 화면의 「다시 시도」: 접속되면 사이트로 이동.
#[tauri::command(async)]
fn retry_online(app: AppHandle) -> bool {
    if !online() { return false; }
    if let Some(w) = app.get_webview_window("main") {
        if let Ok(u) = SITE.parse() { let _ = w.navigate(u); }
    }
    true
}

/* ---------------- 앱 ---------------- */

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let base = app.path().local_data_dir().unwrap_or_else(|_| std::env::temp_dir());
            let proxy_dir = base.join("KMovie").join("proxy");
            fs::create_dir_all(&proxy_dir)?;
            let shell = Shell {
                proxy_dir,
                ffmpeg: find_bin("ffmpeg"),
                ffprobe: find_bin("ffprobe"),
                metas: Mutex::new(HashMap::new()),
                frames: Mutex::new(HashMap::new()),
                exports: Mutex::new(HashMap::new()),
                export_seq: Mutex::new(0),
            };
            shell.sweep();
            app.manage(shell);
            let url = if online() { WebviewUrl::External(SITE.parse().expect("site url")) } else { WebviewUrl::App("offline.html".into()) };
            WebviewWindowBuilder::new(app, "main", url)
                .title("케이무비 — 케이에듀 영상 편집기")
                .inner_size(1440.0, 900.0)
                .min_inner_size(1100.0, 680.0)
                .maximized(true)
                .build()?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            shell_info, pick_files, import_path, read_chunk, proxy_check,
            frame_next, frame_close, export_open, export_write, export_close,
            cache_info, cache_clear, open_cache_dir, retry_online
        ])
        .run(tauri::generate_context!())
        .expect("케이무비 껍데기 실행 실패");
}

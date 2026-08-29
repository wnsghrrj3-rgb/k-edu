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
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{AppHandle, Emitter, Manager, State, WebviewUrl, WebviewWindowBuilder};

const SITE: &str = "https://keduclass.com/kmovie/?shell=1";
const SITE_HOST: &str = "keduclass.com";
const FPS: i64 = 30;
const FRAME_W: u32 = 1920;
const FRAME_H: u32 = 1080;
const FRAME_BYTES: usize = (FRAME_W * FRAME_H * 4) as usize;
const MAX_SEC: f64 = 60.0 * 60.0; // 껍데기 원본 상한 — 엔진이 구간 읽기(지연 로드)·프록시 디스크 직독을 하므로 60분
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
    stts: Mutex<HashMap<String, Arc<Mutex<Option<Child>>>>>,
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
    pub whisper: bool,
    pub whisper_model: String,
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
    pub fn new(proxy_dir: PathBuf, ffmpeg: PathBuf, ffprobe: PathBuf) -> Shell {
        Shell {
            proxy_dir,
            ffmpeg,
            ffprobe,
            metas: Mutex::new(HashMap::new()),
            frames: Mutex::new(HashMap::new()),
            exports: Mutex::new(HashMap::new()),
            export_seq: Mutex::new(0),
            stts: Mutex::new(HashMap::new()),
        }
    }
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

    /// 원본 → 프록시. `emit(단계, 진행률)` 은 화면으로 가는 진행 보고(테스트에선 빈 클로저). Tauri 에 안 묶여 있어 cargo test 로 실 ffmpeg 검증이 된다.
    fn make_proxy(&self, emit: &dyn Fn(&str, f64), path: &Path, hash: &str, size: u64, mtime: u64) -> Result<ProxyMeta, String> {
        let name = path.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_else(|| "영상".into());
        emit("정보 읽는 중", 0.0);
        let j = probe_json(&self.ffprobe, path)?;
        let st = j["streams"].get(0).ok_or("영상 트랙이 없어요")?;
        let mut w = st["width"].as_u64().unwrap_or(0) as u32;
        let mut h = st["height"].as_u64().unwrap_or(0) as u32;
        // 폰 세로 영상: 저장은 가로(1920×1080)+회전 태그. ffmpeg 가 프록시·원화질 파이프 둘 다 자동으로 돌려 굽으니 화면에 알리는 크기도 돌린 뒤 기준으로.
        let rot = st["side_data_list"].as_array().and_then(|a| a.iter().find_map(|d| d["rotation"].as_f64())).unwrap_or(0.0);
        if ((rot.abs() as i64) % 180) == 90 { std::mem::swap(&mut w, &mut h); }
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

        // 프록시 비트레이트: 길수록 낮게 (엔진은 구간 읽기라 메모리 걱정은 없고 — 디스크 용량·인코드 시간 몫)
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
    let model = find_whisper_model(&shell.proxy_dir);
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
        whisper: model.is_some() && whisper_ok(&find_bin("whisper-cli")),
        whisper_model: model.and_then(|p| p.file_name().map(|n| n.to_string_lossy().to_string())).unwrap_or_default(),
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
        None => {
            let emit = |stage: &str, pct: f64| {
                let _ = app.emit("kmv-proxy", Progress { path: path.clone(), stage: stage.into(), pct });
            };
            (shell.make_proxy(&emit, &p, &hash, size, mtime)?, false)
        }
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

/* ---------------- 받아쓰기 (whisper.cpp) ----------------
   프록시(원본과 같은 시간축)의 소리를 16kHz 모노 wav 로 뽑아 whisper-cli 에 먹이고,
   구간 JSON 을 초 단위 [{t0,t1,text}] 로 돌려준다. 결과는 <hash>.stt.json 캐시.
   실행 파일: exe 옆 whisper-cli(.exe) → PATH. 모델: exe 옆 · exe\models · %LOCALAPPDATA%\KMovie\models
   의 ggml*.bin 중 가장 큰 것 (small 권장 — README). */

#[derive(Serialize, Deserialize, Clone)]
pub struct SttSeg { pub t0: f64, pub t1: f64, pub text: String }

#[derive(Serialize, Deserialize, Clone)]
pub struct SttResult { pub segs: Vec<SttSeg> }

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SttProgress { pub hash: String, pub pct: f64, pub stage: String }

fn find_whisper_model(proxy_dir: &Path) -> Option<PathBuf> {
    let mut dirs: Vec<PathBuf> = Vec::new();
    if let Some(d) = std::env::current_exe().ok().and_then(|p| p.parent().map(|d| d.to_path_buf())) {
        dirs.push(d.join("models"));
        dirs.push(d);
    }
    if let Some(d) = proxy_dir.parent() { dirs.push(d.join("models")); } // %LOCALAPPDATA%\KMovie\models
    let mut best: Option<(u64, PathBuf)> = None;
    for dir in dirs {
        let Ok(rd) = fs::read_dir(&dir) else { continue };
        for e in rd.flatten() {
            let p = e.path();
            let name = p.file_name().and_then(|n| n.to_str()).unwrap_or("");
            if !(name.starts_with("ggml") && name.ends_with(".bin")) { continue; }
            let size = fs::metadata(&p).map(|m| m.len()).unwrap_or(0);
            if size < 1_000_000 { continue; }
            if best.as_ref().map(|(s, _)| size > *s).unwrap_or(true) { best = Some((size, p)); }
        }
    }
    best.map(|(_, p)| p)
}

fn whisper_ok(bin: &Path) -> bool {
    if bin.is_absolute() && bin.exists() { return true; }
    cmd(bin).arg("--help").stdout(Stdio::null()).stderr(Stdio::null()).stdin(Stdio::null())
        .status().map(|s| s.success()).unwrap_or(false)
}

impl Shell {
    fn stt_cache_path(&self, hash: &str) -> PathBuf { self.proxy_dir.join(format!("{hash}.stt.json")) }

    fn transcribe_impl(&self, emit: &dyn Fn(f64, &str), whisper: &Path, model: &Path, hash: &str) -> Result<SttResult, String> {
        if let Ok(text) = fs::read_to_string(self.stt_cache_path(hash)) {
            if let Ok(r) = serde_json::from_str::<SttResult>(&text) { return Ok(r); }
        }
        let proxy = self.proxy_path(hash);
        if !proxy.exists() { return Err("프록시가 없어요 — 원본을 다시 넣어 주세요".into()); }

        // 소리 트랙이 없는 원본은 받아쓸 것도 없다 (빈 결과를 캐시)
        // probe_json 은 -select_streams v:0 (영상만) — 소리는 따로 물어야 한다
        let aout = cmd(&self.ffprobe)
            .args(["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_type", "-of", "json"])
            .arg(&proxy).stdin(Stdio::null()).output().map_err(|e| format!("ffprobe 실행 실패: {e}"))?;
        let has_audio = serde_json::from_slice::<serde_json::Value>(&aout.stdout).ok()
            .and_then(|j| j["streams"].as_array().map(|a| !a.is_empty())).unwrap_or(false);
        if !has_audio {
            let r = SttResult { segs: Vec::new() };
            let _ = fs::write(self.stt_cache_path(hash), serde_json::to_string(&r).unwrap_or_default());
            return Ok(r);
        }

        emit(0.01, "소리 뽑는 중");
        let wav = self.proxy_dir.join(format!("{hash}.stt.wav"));
        let _ = fs::remove_file(&wav);
        let out = cmd(&self.ffmpeg)
            .args(["-v", "error", "-nostdin", "-y", "-i"]).arg(&proxy)
            .args(["-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", "-f", "wav"]).arg(&wav)
            .stdin(Stdio::null()).output().map_err(|e| format!("ffmpeg 실행 실패: {e}"))?;
        if !out.status.success() {
            let _ = fs::remove_file(&wav);
            return Err(format!("소리를 뽑지 못했어요: {}", String::from_utf8_lossy(&out.stderr).trim().lines().last().unwrap_or("")));
        }

        emit(0.04, "받아쓰는 중");
        let of = self.proxy_dir.join(format!("{hash}.stt.tmp"));       // whisper 가 .json 을 붙인다
        let json_path = self.proxy_dir.join(format!("{hash}.stt.tmp.json"));
        let _ = fs::remove_file(&json_path);
        let child = cmd(whisper)
            .args(["-m"]).arg(model)
            .args(["-f"]).arg(&wav)
            .args(["-l", "ko", "-oj", "-of"]).arg(&of)
            .args(["-np", "-pp"])
            .stdout(Stdio::null()).stderr(Stdio::piped()).stdin(Stdio::null())
            .spawn().map_err(|e| format!("whisper 실행 실패: {e}"))?;

        let slot = Arc::new(Mutex::new(Some(child)));
        if let Ok(mut m) = self.stts.lock() { m.insert(hash.to_string(), slot.clone()); }
        let err_pipe = slot.lock().ok().and_then(|mut c| c.as_mut().and_then(|c| c.stderr.take()));
        let mut tail = String::new();
        if let Some(errp) = err_pipe {
            for line in BufReader::new(errp).lines().flatten() {
                if let Some(i) = line.find("progress =") {
                    if let Ok(pct) = line[i + 10..].trim().trim_end_matches('%').trim().parse::<f64>() {
                        emit(0.04 + (pct / 100.0).clamp(0.0, 1.0) * 0.95, "받아쓰는 중");
                        continue;
                    }
                }
                tail = line;
            }
        }
        let status = { let taken = slot.lock().ok().and_then(|mut c| c.take()); taken.map(|mut c| c.wait().map_err(|e| e.to_string())).transpose()? };
        if let Ok(mut m) = self.stts.lock() { m.remove(hash); }
        let _ = fs::remove_file(&wav);
        let cancelled = status.is_none();                              // 취소가 child 를 kill+take 했다
        if cancelled { let _ = fs::remove_file(&json_path); return Err("받아쓰기를 취소했어요".into()); }
        if !status.map(|s| s.success()).unwrap_or(false) {
            let _ = fs::remove_file(&json_path);
            return Err(format!("whisper 가 실패했어요: {}", tail.trim()));
        }

        let text = fs::read_to_string(&json_path).map_err(|_| "whisper 결과 파일을 못 읽었어요".to_string())?;
        let _ = fs::remove_file(&json_path);
        let v: serde_json::Value = serde_json::from_str(&text).map_err(|e| format!("whisper 결과 해석 실패: {e}"))?;
        let mut segs = Vec::new();
        if let Some(arr) = v["transcription"].as_array() {
            for s in arr {
                let t0 = s["offsets"]["from"].as_f64().unwrap_or(-1.0) / 1000.0;
                let t1 = s["offsets"]["to"].as_f64().unwrap_or(-1.0) / 1000.0;
                let tx = s["text"].as_str().unwrap_or("").trim().to_string();
                if t0 >= 0.0 && t1 > t0 && !tx.is_empty() { segs.push(SttSeg { t0, t1, text: tx }); }
            }
        }
        let r = SttResult { segs };
        let _ = fs::write(self.stt_cache_path(hash), serde_json::to_string(&r).unwrap_or_default());
        emit(1.0, "완료");
        Ok(r)
    }
}

#[tauri::command(async)]
fn transcribe(app: AppHandle, shell: State<'_, Shell>, hash: String) -> Result<SttResult, String> {
    let model = find_whisper_model(&shell.proxy_dir).ok_or("whisper 모델(ggml-*.bin)을 못 찾았어요 — models 폴더에 넣어 주세요")?;
    let bin = find_bin("whisper-cli");
    let h = hash.clone();
    let emit = move |pct: f64, stage: &str| {
        let _ = app.emit("kmv-stt", SttProgress { hash: h.clone(), pct, stage: stage.into() });
    };
    shell.transcribe_impl(&emit, &bin, &model, &hash)
}

#[tauri::command(async)]
fn transcribe_cancel(shell: State<'_, Shell>, hash: String) {
    let slot = shell.stts.lock().ok().and_then(|m| m.get(&hash).cloned());
    if let Some(slot) = slot {
        if let Ok(mut c) = slot.lock() {
            if let Some(mut child) = c.take() { let _ = child.kill(); let _ = child.wait(); }
        }
    }
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
            if matches!(p.extension().and_then(|x| x.to_str()), Some("mp4") | Some("json") | Some("tmp") | Some("wav")) { let _ = fs::remove_file(p); }
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
            let shell = Shell::new(proxy_dir, find_bin("ffmpeg"), find_bin("ffprobe"));
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
            cache_info, cache_clear, open_cache_dir, retry_online,
            transcribe, transcribe_cancel
        ])
        .run(tauri::generate_context!())
        .expect("케이무비 껍데기 실행 실패");
}

/* ---------------- 테스트 (실 ffmpeg) ----------------
   cargo test -- --nocapture   (ffmpeg·ffprobe 가 PATH 에 있어야 한다. 합성 원본 5종을 임시 폴더에 만든다)
   프록시 규격·프레임 정렬(앞으로·뒤로 seek)·조각 읽기·해시 안정성·보관함 정리를 lib.rs 그 자체로 검증한다.
   test/mock-backend.mjs 는 이제 참고용 — 정답은 여기. */
#[cfg(test)]
mod tests {
    use super::*;
    use std::process::Command;
    use std::sync::OnceLock;

    struct Fx { dir: PathBuf, files: Vec<(&'static str, PathBuf)> }

    fn ff(args: &[&str]) {
        let st = Command::new("ffmpeg").args(["-hide_banner", "-loglevel", "error", "-y"]).args(args).status().expect("ffmpeg 실행");
        assert!(st.success(), "fixture 생성 실패: {args:?}");
    }

    /// 합성 원본: 25fps · 60fps · 시작 오프셋 1.5s(30fps) · HEVC 10bit(폰 흉내) · VFR(프레임 빠짐, 폰 가변 프레임 흉내). 각 4초, 키프레임 1초.
    fn fixtures() -> &'static Fx {
        static FX: OnceLock<Fx> = OnceLock::new();
        FX.get_or_init(|| {
            let dir = std::env::temp_dir().join(format!("kmv-rs-fx-{}", std::process::id()));
            fs::create_dir_all(&dir).unwrap();
            let src = |rate: &str| format!("testsrc2=size=1280x720:rate={rate}");
            let mk = |name: &str, rate: &str, extra: &[&str]| {
                let out = dir.join(format!("{name}.mp4"));
                let s0 = src(rate);
                let mut a: Vec<&str> = vec!["-f", "lavfi", "-i", &s0, "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000", "-t", "4"];
                a.extend_from_slice(extra);
                let s = out.to_string_lossy().to_string();
                let mut v: Vec<String> = a.iter().map(|x| x.to_string()).collect();
                v.push(s);
                let r: Vec<&str> = v.iter().map(|x| x.as_str()).collect();
                ff(&r);
                out
            };
            let mut files = Vec::new();
            files.push(("orig25", mk("orig25", "25", &["-c:v", "libx264", "-preset", "ultrafast", "-g", "25", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest"])));
            files.push(("orig60", mk("orig60", "60", &["-c:v", "libx264", "-preset", "ultrafast", "-g", "60", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest"])));
            files.push(("orig30off", mk("orig30off", "30", &["-c:v", "libx264", "-preset", "ultrafast", "-g", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", "-output_ts_offset", "1.5"])));
            files.push(("hevc10", mk("hevc10", "30", &["-c:v", "libx265", "-preset", "ultrafast", "-x265-params", "log-level=none:keyint=30:min-keyint=30", "-pix_fmt", "yuv420p10le", "-tag:v", "hvc1", "-c:a", "aac", "-shortest"])));
            // 세로 폰 영상 흉내: 가로로 인코딩한 뒤 회전 태그(display matrix 90°)만 얹는다 — 폰이 저장하는 방식 그대로
            let flat = mk("rot90-flat", "30", &["-c:v", "libx264", "-preset", "ultrafast", "-g", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest"]);
            let rot = dir.join("rot90.mp4");
            ff(&["-display_rotation", "90", "-i", &flat.to_string_lossy(), "-c", "copy", &rot.to_string_lossy()]);
            files.push(("rot90", rot));
            files.push(("vfr", mk("vfr", "30", &["-vf", "select=not(eq(mod(n\\,7)\\,3))", "-fps_mode", "vfr", "-c:v", "libx264", "-preset", "ultrafast", "-g", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest"])));
            Fx { dir, files }
        })
    }

    fn shell(sub: &str) -> Shell {
        let d = fixtures().dir.join(sub);
        fs::create_dir_all(&d).unwrap();
        Shell::new(d, PathBuf::from("ffmpeg"), PathBuf::from("ffprobe"))
    }

    /// 받아쓰기 파이프: 실 ffmpeg 로 wav 를 뽑고, 가짜 whisper(-of 에 JSON 을 쓰는 스크립트)로
    /// 인자 전달·진행률 파싱·JSON 해석·캐시·소리 없는 원본을 검증한다. (진짜 모델은 준호 PC 몫)
    #[cfg(unix)]
    #[test]
    fn transcribe_fake_whisper() {
        use std::os::unix::fs::PermissionsExt;
        let sh = shell("stt");
        let fx = fixtures();
        let (meta, _) = import(&sh, &fx.files.iter().find(|(n, _)| *n == "orig25").unwrap().1);

        let fake = fx.dir.join("fake-whisper.sh");
        fs::write(&fake, "#!/bin/sh\nof=\"\"; prev=\"\"\nfor a in \"$@\"; do [ \"$prev\" = \"-of\" ] && of=\"$a\"; prev=\"$a\"; done\n[ -n \"$of\" ] || exit 1\necho 'whisper_print_progress_callback: progress =  50%' 1>&2\nprintf '%s' '{\"transcription\":[{\"offsets\":{\"from\":0,\"to\":1500},\"text\":\" 안녕하세요\"},{\"offsets\":{\"from\":1600,\"to\":3800},\"text\":\" 금성초등학교입니다\"}]}' > \"$of.json\"\necho run >> \"$of.runs\"\n").unwrap();
        fs::set_permissions(&fake, fs::Permissions::from_mode(0o755)).unwrap();
        let model = fx.dir.join("ggml-fake.bin");
        fs::write(&model, vec![0u8; 1_100_000]).unwrap();

        let seen = Mutex::new(Vec::new());
        let emit = |p: f64, s: &str| { seen.lock().unwrap().push((p, s.to_string())); };
        let r = sh.transcribe_impl(&emit, &fake, &model, &meta.hash).unwrap();
        assert_eq!(r.segs.len(), 2);
        assert!((r.segs[0].t0 - 0.0).abs() < 1e-9 && (r.segs[0].t1 - 1.5).abs() < 1e-9);
        assert_eq!(r.segs[0].text, "안녕하세요");
        assert_eq!(r.segs[1].text, "금성초등학교입니다");
        let pts = seen.lock().unwrap().clone();
        assert!(pts.iter().any(|(p, _)| (*p - (0.04 + 0.5 * 0.95)).abs() < 1e-6), "진행률 50% 가 매핑돼야: {pts:?}");
        assert!(sh.stt_cache_path(&meta.hash).exists(), "결과가 캐시돼야");
        assert!(!sh.proxy_dir.join(format!("{}.stt.wav", meta.hash)).exists(), "임시 wav 는 지워져야");

        // 두 번째 호출은 캐시에서 — 가짜 whisper 가 다시 안 돈다
        let runs = sh.proxy_dir.join(format!("{}.stt.tmp.runs", meta.hash));
        let n0 = fs::read_to_string(&runs).map(|s| s.lines().count()).unwrap_or(0);
        let r2 = sh.transcribe_impl(&emit, &fake, &model, &meta.hash).unwrap();
        assert_eq!(r2.segs.len(), 2);
        let n1 = fs::read_to_string(&runs).map(|s| s.lines().count()).unwrap_or(0);
        assert_eq!(n0, n1, "캐시가 있으면 whisper 를 다시 안 돌려야");

        // 소리 없는 원본 → 빈 결과 (whisper 호출 없이)
        let mute = fx.dir.join("mute.mp4");
        ff(&["-f", "lavfi", "-i", "testsrc2=size=640x360:rate=30", "-t", "2", "-an", "-c:v", "libx264", "-preset", "ultrafast", "-g", "30", "-pix_fmt", "yuv420p", &mute.to_string_lossy()]);
        let (mmeta, _) = import(&sh, &mute);
        let r3 = sh.transcribe_impl(&emit, &fake, &model, &mmeta.hash).unwrap();
        assert!(r3.segs.is_empty(), "소리 없는 원본은 빈 결과");
        assert!(sh.stt_cache_path(&mmeta.hash).exists());

        // 모델 탐색: proxy 부모/models 의 ggml*.bin 을 찾는다
        let mdir = sh.proxy_dir.parent().unwrap().join("models");
        fs::create_dir_all(&mdir).unwrap();
        fs::write(mdir.join("ggml-small.bin"), vec![0u8; 2_000_000]).unwrap();
        let found = find_whisper_model(&sh.proxy_dir).expect("모델을 찾아야");
        assert_eq!(found.file_name().unwrap().to_string_lossy(), "ggml-small.bin");
    }

    fn import(sh: &Shell, p: &Path) -> (ProxyMeta, bool) {
        let (hash, size, mtime) = file_hash(p).unwrap();
        match sh.load_meta(&hash) {
            Some(m) => (m, true),
            None => (sh.make_proxy(&|_s, _p| {}, p, &hash, size, mtime).unwrap(), false),
        }
    }

    /// 프록시 프레임 idx-1..=idx+1 을 원화질 파이프와 같은 규격(1920×1080 RGBA 레터박스)으로. passthrough 라 select 의 n = 샘플 번호.
    fn proxy_frames(proxy: &Path, idx: i64) -> Vec<Vec<u8>> {
        let lo = (idx - 1).max(0);
        let out = Command::new("ffmpeg")
            .args(["-v", "error", "-i"]).arg(proxy)
            .args(["-vf", &format!("select=between(n\\,{lo}\\,{}),scale={FRAME_W}:{FRAME_H}:force_original_aspect_ratio=decrease:force_divisible_by=2,pad={FRAME_W}:{FRAME_H}:(ow-iw)/2:(oh-ih)/2:black,format=rgba", idx + 1),
                "-fps_mode", "passthrough", "-frames:v", "3", "-f", "rawvideo", "pipe:1"])
            .output().unwrap();
        assert!(out.status.success());
        let mut v: Vec<Vec<u8>> = out.stdout.chunks(FRAME_BYTES).map(|c| c.to_vec()).collect();
        if idx == 0 { v.insert(0, Vec::new()); } // idx-1 자리 비움
        assert_eq!(v.len(), 3, "프록시 프레임 {idx} 주변 3장");
        v
    }

    fn diff(a: &[u8], b: &[u8]) -> f64 {
        if a.is_empty() || b.is_empty() { return f64::INFINITY; }
        let mut d = 0u64;
        for i in (0..FRAME_BYTES).step_by(4) {
            d += (a[i] as i64 - b[i] as i64).unsigned_abs() + (a[i + 1] as i64 - b[i + 1] as i64).unsigned_abs() + (a[i + 2] as i64 - b[i + 2] as i64).unsigned_abs();
        }
        d as f64 / (FRAME_BYTES as f64 * 0.75)
    }

    #[test]
    fn rescale_matches_ffmpeg_near_inf() {
        assert_eq!(rescale_rnd(1, 1, 2), 1);   // 0.5 → 1 (0 에서 먼 쪽)
        assert_eq!(rescale_rnd(-1, 1, 2), -1);
        assert_eq!(rescale_rnd(3, 1, 4), 1);   // 0.75 → 1
        assert_eq!(rescale_rnd(1, 1, 4), 0);   // 0.25 → 0
        assert_eq!(rescale_rnd(90000 * 7, 30, 90000), 210);
    }

    #[test]
    fn plan_picks_keyframe_below_target_slot() {
        let m = ProxyMeta { hash: String::new(), name: String::new(), path: String::new(), size: 0, mtime: 0, w: 0, h: 0, dur_sec: 0.0, fps: 30.0, codec: String::new(), proxy_size: 0, made: 0, used: 0,
            tb_num: 1, tb_den: 90000, start_us: 0, first_pts: 0, keys: vec![0, 90000, 180000, 270000] };
        assert_eq!(m.slot0(), 0);
        assert_eq!(m.plan(0), (None, 0));           // 첫 GOP 는 seek 없이 처음부터
        assert_eq!(m.plan(29), (None, 29));
        let (ss, skip) = m.plan(30);                // 슬롯 30 = 키프레임 자체 → 그보다 작은 슬롯의 키프레임(0) 에서
        assert!(ss.is_none() && skip == 30);
        let (ss, skip) = m.plan(31);                // 키프레임 30(1.0s) 에서 시작, 슬롯 30 은 버림 → skip 1
        assert!((ss.unwrap() - (1.0 - SEEK_EPS)).abs() < 1e-9 && skip == 1);
        let (ss, skip) = m.plan(95);
        assert!((ss.unwrap() - (3.0 - SEEK_EPS)).abs() < 1e-9 && skip == 5);
        // 시작 오프셋 1.5s 원본: pts 135000 이 슬롯 0
        let m2 = ProxyMeta { start_us: 1_500_000, first_pts: 135000, keys: vec![135000, 225000, 315000], ..m.clone() };
        assert_eq!(m2.slot0(), 0);
        assert_eq!(m2.slot(225000), 30);
        let (ss, skip) = m2.plan(40);
        assert!((ss.unwrap() - (2.5 - 1.5 - SEEK_EPS)).abs() < 1e-9 && skip == 10);
    }

    #[test]
    fn hash_survives_rename_and_changes_on_edit() {
        let fx = fixtures();
        let src = &fx.files[0].1;
        let (h1, _, _) = file_hash(src).unwrap();
        let copy = fx.dir.join("renamed-copy.mp4");
        fs::copy(src, &copy).unwrap();
        let mt = fs::metadata(src).unwrap().modified().unwrap();
        File::options().write(true).open(&copy).unwrap().set_modified(mt).unwrap();
        let (h2, _, _) = file_hash(&copy).unwrap();
        assert_eq!(h1, h2, "경로가 바뀌어도 같은 프록시");
        let mut f = File::options().write(true).open(&copy).unwrap();
        f.seek(SeekFrom::Start(100)).unwrap(); f.write_all(&[1, 2, 3, 4]).unwrap(); drop(f);
        File::options().write(true).open(&copy).unwrap().set_modified(mt).unwrap();
        let (h3, _, _) = file_hash(&copy).unwrap();
        assert_ne!(h1, h3, "내용이 바뀌면 다른 해시");
    }

    #[test]
    fn proxy_spec_and_meta() {
        let sh = shell("spec");
        for (name, p) in &fixtures().files {
            let (m, cached) = import(&sh, p);
            assert!(!cached, "{name}: 첫 가져오기");
            if *name == "rot90" { assert_eq!((m.w, m.h), (720, 1280), "세로 폰 영상은 돌린 뒤 크기"); } else { assert_eq!((m.w, m.h), (1280, 720)); }
            assert!(m.dur_sec > 3.5 && m.dur_sec < 4.6, "{name} dur {}", m.dur_sec);
            assert!(!m.keys.is_empty(), "{name}: 키프레임 표");
            assert!(m.keys.windows(2).all(|w| w[0] < w[1]));
            // 첫 프레임 슬롯: 보통 0. 시작 오프셋 원본은 format.start_time(오디오 프라이밍 포함, 1.478s) 과 영상 첫 pts(1.5s) 가 달라 슬롯 1 — fps 필터도 거기서 시작하므로 프록시 idx 0 = 슬롯 1. plan() 이 slot0 으로 이걸 맞춘다.
            let s0 = m.slot0();
            assert!(s0 == 0 || (*name == "orig30off" && s0 == 1), "{name}: 첫 프레임 슬롯 {s0}");
            let j = probe_json(&sh.ffprobe, &sh.proxy_path(&m.hash)).unwrap();
            let st = &j["streams"][0];
            assert_eq!(st["codec_name"], "h264", "{name}");
            if *name == "rot90" { assert_eq!((st["width"].as_u64(), st["height"].as_u64()), (Some(720), Some(1280)), "{name}: 회전을 굽고 세로 720×1280"); }
            else { assert_eq!(st["width"], 1280, "{name}: 긴 변 1280"); }
            assert_eq!(st["avg_frame_rate"], "30/1", "{name}: 30fps 고정 (원본 {})", m.fps);
            let pj = Command::new("ffprobe").args(["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=profile,pix_fmt", "-of", "json"]).arg(sh.proxy_path(&m.hash)).output().unwrap();
            let pj: serde_json::Value = serde_json::from_slice(&pj.stdout).unwrap();
            assert_eq!(pj["streams"][0]["pix_fmt"], "yuv420p", "{name}: 10bit 도 8bit 로");
            assert!(pj["streams"][0]["profile"].as_str().unwrap_or("").contains("Baseline"), "{name}: baseline");
            if *name == "hevc10" { assert_eq!(m.codec, "hevc"); }
            // 두 번째는 캐시
            let (_, cached) = import(&sh, p);
            assert!(cached, "{name}: 캐시 재사용");
            // 프록시 프레임 수 = 원본 길이 × 30 근처 (fps 필터가 VFR 빈자리를 채운다)
            let (_, keys) = probe_packets(&sh.ffprobe, &sh.proxy_path(&m.hash)).unwrap();
            assert!(keys.len() >= 7, "{name}: GOP 15 → 4초에 키프레임 8개 근처, 실제 {}", keys.len());
        }
    }

    #[test]
    fn frame_pipe_matches_proxy_pixels() {
        let sh = shell("frames");
        let mut total = 0; let mut bad = 0; let mut spent = Duration::ZERO; let mut nread = 0u32;
        for (name, p) in &fixtures().files {
            let (m, _) = import(&sh, p);
            let proxy = sh.proxy_path(&m.hash);
            let mut sess: Option<FrameSession> = None;
            let mut buf = vec![0u8; FRAME_BYTES];
            for idx in [0i64, 1, 31, 90, 94, 110, 95, 60] {   // 95→60 은 뒤로 가기(재seek), 94→110 은 앞으로
                let reopen = match &sess { Some(s) => idx < s.cur || idx - s.cur > REOPEN_GAP, None => true };
                if reopen { sess = Some(sh.open_frames(&m, idx).unwrap()); }
                let s = sess.as_mut().unwrap();
                let t0 = std::time::Instant::now();
                while s.cur < idx { assert!(read_frame(&mut s.out, &mut buf).unwrap(), "{name} idx {idx}: 끝 넘음(건너뛰기)"); s.cur += 1; nread += 1; }
                assert!(read_frame(&mut s.out, &mut buf).unwrap(), "{name} idx {idx}: 끝 넘음");
                s.cur += 1; nread += 1;
                spent += t0.elapsed();
                let refs = proxy_frames(&proxy, idx);
                let d = diff(&buf, &refs[1]);
                let dn = diff(&buf, &refs[0]).min(diff(&buf, &refs[2]));
                total += 1;
                // 이웃과 동점(dn ≈ d) 은 fps 필터가 같은 원본 프레임을 두 슬롯에 복제한 자리(25fps→30, VFR 빈자리) — 어긋남이 아니다
                let ok = d <= 3.0 && dn + 0.05 >= d;
                if !ok { bad += 1; }
                eprintln!("{name} idx {idx} diff {d:.2} neighbor {dn:.2} {}", if ok { "ok" } else { "BAD" });
            }
        }
        eprintln!("원화질 파이프 1080p RGBA: {nread}장 {:.1}ms/장 (seek 포함, 이 CPU 기준)", spent.as_secs_f64() * 1000.0 / nread as f64);
        assert_eq!(bad, 0, "프레임 정렬 {total}중 {bad} 어긋남");
        assert_eq!(total, 8 * fixtures().files.len());
    }

    #[test]
    fn chunks_reassemble_exactly() {
        let sh = shell("chunks");
        let (m, _) = import(&sh, &fixtures().files[0].1);
        let proxy = sh.proxy_path(&m.hash);
        let whole = fs::read(&proxy).unwrap();
        let mut got = Vec::new();
        let mut off = 0u64;
        loop {
            let mut f = File::open(&proxy).unwrap();
            f.seek(SeekFrom::Start(off)).unwrap();
            let mut b = vec![0u8; 100_000.min(CHUNK_MAX)];
            let n = f.read(&mut b).unwrap();
            if n == 0 { break; }
            got.extend_from_slice(&b[..n]);
            off += n as u64;
        }
        assert_eq!(got, whole);
        assert_eq!(m.proxy_size as usize, whole.len(), "ImportInfo.bytes = 프록시 크기");
    }

    #[test]
    fn sweep_removes_stale_and_orphans() {
        let sh = shell("sweep");
        let (m, _) = import(&sh, &fixtures().files[0].1);
        // 고아 mp4 · 고아 json · tmp
        fs::write(sh.proxy_dir.join("orphan.mp4"), b"x").unwrap();
        fs::write(sh.proxy_dir.join("ghost.json"), "{}").unwrap();
        fs::write(sh.proxy_dir.join("half.tmp"), b"x").unwrap();
        sh.sweep();
        assert!(!sh.proxy_dir.join("orphan.mp4").exists());
        assert!(!sh.proxy_dir.join("ghost.json").exists());
        assert!(!sh.proxy_dir.join("half.tmp").exists());
        assert!(sh.proxy_path(&m.hash).exists(), "방금 쓴 프록시는 남는다");
        assert_eq!(sh.cache_info().count, 1);
        // 31일 전 사용 → 정리
        let mut old = m.clone();
        old.used = now().saturating_sub((KEEP_DAYS + 1) * 86400);
        sh.save_meta(&old).unwrap();
        sh.sweep();
        assert!(!sh.proxy_path(&m.hash).exists() && !sh.meta_path(&m.hash).exists(), "오래 안 쓴 프록시 정리");
        assert_eq!(sh.cache_info().count, 0);
    }

    #[test]
    fn rejects_unknown_kind_and_too_long() {
        assert_eq!(kind_of(Path::new("a.MOV")), "video");
        assert_eq!(kind_of(Path::new("a.HEIC")), "");
        assert_eq!(kind_of(Path::new("b.jpg")), "image");
        assert_eq!(kind_of(Path::new("c.m4a")), "audio");
        let sh = shell("long");
        let p = fixtures().dir.join("long.mp4");
        // 컨테이너 duration 만 길게 보이도록 61분짜리 검은 영상(초저비트, 1fps) — 실제 인코딩은 몇 초
        ff(&["-f", "lavfi", "-i", "color=c=black:size=64x64:rate=1", "-t", "3661", "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", &p.to_string_lossy()]);
        let (hash, size, mtime) = file_hash(&p).unwrap();
        let e = sh.make_proxy(&|_s, _p| {}, &p, &hash, size, mtime).unwrap_err();
        assert!(e.contains("60분"), "{e}");
    }
}

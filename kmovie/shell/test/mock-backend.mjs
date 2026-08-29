/* 껍데기 커맨드의 Node 판 — src-tauri/src/lib.rs 와 같은 규칙(프록시 규격·프레임 정렬·조각 읽기·위치 쓰기).
   Rust 를 여기서 컴파일할 수 없으니, 규칙 자체는 이 파일로 검증하고 Rust 는 이 파일의 번역이다.
   테스트 전용. 제품 코드가 아니다. */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const FPS = 30, FRAME_W = 1920, FRAME_H = 1080, FRAME_BYTES = FRAME_W * FRAME_H * 4;
const SEEK_EPS = 0.002, REOPEN_GAP = 90, CHUNK_MAX = 32 * 1024 * 1024;

/* av_rescale_q_rnd NEAR_INF — BigInt */
function rescaleRnd(a, b, c) {
  a = BigInt(a); b = BigInt(b); c = BigInt(c);
  const v = a * b;
  return Number(v >= 0n ? (v + c / 2n) / c : -((-v + c / 2n) / c));
}
export function slot(meta, pts) {
  const off = rescaleRnd(-meta.startUs, meta.tbDen, 1000000n * BigInt(meta.tbNum)); // µs → 스트림 tb
  return rescaleRnd(pts + off, meta.tbNum * FPS, meta.tbDen);
}
export function plan(meta, idx) {
  const target = idx + slot(meta, meta.firstPts);
  let key = null;
  for (const k of meta.keys) { if (slot(meta, k) < target) key = k; else break; }
  if (key == null) return { ss: null, skip: idx };
  const ss = key * meta.tbNum / meta.tbDen - meta.startUs / 1e6 - SEEK_EPS;
  if (ss <= 0) return { ss: null, skip: idx };
  return { ss, skip: target - slot(meta, key) };
}
function ratio(s) { const [a, b = '1'] = String(s || '').split('/'); const A = +a, B = +b; return B ? [A, B] : null; }

export function createBackend({ proxyDir, ffmpeg = 'ffmpeg', ffprobe = 'ffprobe', maxSec = 3600 }) {
  fs.mkdirSync(proxyDir, { recursive: true });
  const metas = new Map(), frames = new Map(), exports = new Map();
  let expSeq = 0;
  const listeners = new Map();
  const emit = (ev, payload) => { for (const cb of listeners.get(ev) || []) cb({ event: ev, payload }); };
  const proxyPath = h => path.join(proxyDir, h + '.mp4'), metaPath = h => path.join(proxyDir, h + '.json');

  function fileHash(p) {
    const st = fs.statSync(p); const size = st.size, mtime = Math.floor(st.mtimeMs / 1000);
    let h = 0xcbf29ce484222325n; const M = 0x100000001b3n, MASK = (1n << 64n) - 1n;
    const feed = buf => { for (const b of buf) { h ^= BigInt(b); h = (h * M) & MASK; } };
    const le = n => { const b = Buffer.alloc(8); b.writeBigUInt64LE(BigInt(n)); return b; };
    feed(le(size)); feed(le(mtime));
    const fd = fs.openSync(p, 'r'); const buf = Buffer.alloc(1024 * 1024);
    let n = fs.readSync(fd, buf, 0, buf.length, 0); feed(buf.subarray(0, n));
    if (size > 2 * 1024 * 1024) { n = fs.readSync(fd, buf, 0, buf.length, size - 1024 * 1024); feed(buf.subarray(0, n)); }
    fs.closeSync(fd);
    return { hash: h.toString(16).padStart(16, '0') + size.toString(16), size, mtime };
  }
  function loadMeta(h) {
    if (metas.has(h)) return metas.get(h);
    if (!fs.existsSync(metaPath(h)) || !fs.existsSync(proxyPath(h))) return null;
    const m = JSON.parse(fs.readFileSync(metaPath(h), 'utf8')); metas.set(h, m); return m;
  }
  function saveMeta(m) { fs.writeFileSync(metaPath(m.hash), JSON.stringify(m)); metas.set(m.hash, m); }

  function probe(p) {
    const r = spawnSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,avg_frame_rate,codec_name,time_base,duration:stream_side_data=rotation:format=duration,start_time', '-of', 'json', p]);
    if (r.status !== 0) throw new Error('영상 정보를 읽을 수 없어요: ' + r.stderr);
    return JSON.parse(r.stdout.toString());
  }
  function packets(p) {
    const r = spawnSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'packet=pts,flags', '-of', 'csv=p=0', p], { maxBuffer: 1 << 28 });
    let first = Infinity; const keys = [];
    for (const line of r.stdout.toString().split('\n')) { const [pts, fl = ''] = line.split(','); const v = parseInt(pts, 10); if (!Number.isFinite(v)) continue; if (v < first) first = v; if (fl.includes('K')) keys.push(v); }
    keys.sort((a, b) => a - b);
    return { first, keys: [...new Set(keys)] };
  }
  function makeProxy(p, hash, size, mtime) {
    const j = probe(p), st = j.streams[0];
    const [tbNum, tbDen] = ratio(st.time_base); const fr = ratio(st.avg_frame_rate) || [30, 1];
    const durSec = +(j.format.duration || st.duration || 0), startUs = Math.round(+(j.format.start_time || 0) * 1e6);
    if (durSec > maxSec) throw new Error('원본이 너무 길어요');
    const { first, keys } = packets(p);
    const vbr = durSec <= 300 ? '6M' : durSec <= 600 ? '4500k' : '3M';
    const tmp = path.join(proxyDir, hash + '.tmp');
    return new Promise((res, rej) => {
      const args = ['-v', 'error', '-nostdin', '-y', '-progress', 'pipe:1', '-i', p, '-map', '0:v:0', '-map', '0:a:0?', '-sn', '-dn',
        '-vf', "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,fps=30,format=yuv420p",
        '-fps_mode', 'passthrough', '-c:v', 'libx264', '-preset', 'veryfast', '-profile:v', 'baseline', '-level', '4.0', '-g', '15', '-keyint_min', '15', '-sc_threshold', '0',
        '-b:v', vbr, '-maxrate', vbr, '-bufsize', '12M', '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-ar', '48000', '-movflags', '+faststart', '-f', 'mp4', tmp];
      const c = spawn(ffmpeg, args); let err = '';
      c.stdout.on('data', d => { for (const line of d.toString().split('\n')) { const m = /^out_time_(?:us|ms)=(\d+)/.exec(line); if (m && durSec > 0) emit('kmv-proxy', { path: p, stage: '프록시 만드는 중', pct: 0.03 + Math.min(1, (+m[1] / 1e6) / durSec) * 0.95 }); } });
      c.stderr.on('data', d => err += d);
      c.on('close', code => {
        if (code !== 0) { try { fs.unlinkSync(tmp); } catch (e) {} return rej(new Error('프록시를 만들지 못했어요: ' + err.trim())); }
        fs.renameSync(tmp, proxyPath(hash));
        const meta = { hash, name: path.basename(p), path: p, size, mtime, w: st.width, h: st.height, durSec, fps: fr[0] / fr[1], codec: st.codec_name, proxySize: fs.statSync(proxyPath(hash)).size,
          made: Date.now() / 1000 | 0, used: Date.now() / 1000 | 0, tbNum, tbDen, startUs, firstPts: first, keys };
        saveMeta(meta); emit('kmv-proxy', { path: p, stage: '완료', pct: 1 }); res(meta);
      });
    });
  }
  function openFrames(meta, idx) {
    const { ss, skip } = plan(meta, idx);
    const args = ['-v', 'error', '-nostdin'];
    if (ss != null) args.push('-ss', ss.toFixed(6));
    args.push('-copyts', '-start_at_zero', '-i', meta.path, '-an', '-sn', '-dn', '-map', '0:v:0',
      '-vf', `fps=${FPS},scale=${FRAME_W}:${FRAME_H}:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=${FRAME_W}:${FRAME_H}:(ow-iw)/2:(oh-ih)/2:black,format=rgba`,
      '-fps_mode', 'passthrough', '-f', 'rawvideo', 'pipe:1');
    const child = spawn(ffmpeg, args, { stdio: ['ignore', 'pipe', 'ignore'] });
    const s = { hash: meta.hash, child, cur: idx - skip, plan: { ss, skip }, pending: [], buf: [], bufLen: 0, ended: false };
    child.stdout.on('data', d => { s.buf.push(d); s.bufLen += d.length; pump(s); });
    child.stdout.on('end', () => { s.ended = true; pump(s); });
    return s;
  }
  function pump(s) {
    while (s.pending.length) {
      if (s.bufLen >= FRAME_BYTES) {
        const all = Buffer.concat(s.buf); const fr = all.subarray(0, FRAME_BYTES); s.buf = [all.subarray(FRAME_BYTES)]; s.bufLen = s.buf[0].length;
        s.pending.shift()(Buffer.from(fr));
      } else if (s.ended) { s.pending.shift()(null); } else return;
    }
  }
  const readOne = s => new Promise(res => { s.pending.push(res); pump(s); });

  const invoke = async (cmd, args = {}, opts = {}) => {
    switch (cmd) {
      case 'shell_info': return { version: 'mock', os: process.platform, ffmpeg: true, ffmpegVersion: 'mock', maxSec, frameW: FRAME_W, frameH: FRAME_H, cache: cacheInfo() };
      case 'pick_files': return [];
      case 'import_path': {
        const p = args.path; const ext = path.extname(p).slice(1).toLowerCase();
        const kind = /^(mp4|mov|m4v|mkv|avi|mts|m2ts|webm|3gp|wmv)$/.test(ext) ? 'video' : /^(png|jpe?g|webp|bmp|gif)$/.test(ext) ? 'image' : /^(mp3|wav|m4a|aac|ogg|oga|flac)$/.test(ext) ? 'audio' : '';
        if (!kind) throw new Error('지원하지 않는 파일');
        const { hash, size, mtime } = fileHash(p); const name = path.basename(p);
        if (kind !== 'video') return { kind, name, path: p, size, mtime, hash, bytes: size, w: 0, h: 0, durSec: 0, fps: 0, codec: '', cached: false };
        let meta = loadMeta(hash), cached = !!meta;
        if (meta) { meta.path = p; meta.used = Date.now() / 1000 | 0; saveMeta(meta); } else meta = await makeProxy(p, hash, size, mtime);
        return { kind: 'video', name, path: p, size, mtime, hash, bytes: meta.proxySize, w: meta.w, h: meta.h, durSec: meta.durSec, fps: meta.fps, codec: meta.codec, cached };
      }
      case 'read_chunk': {
        const p = args.hash ? proxyPath(args.hash) : args.path; const fd = fs.openSync(p, 'r');
        const buf = Buffer.alloc(Math.min(args.len, CHUNK_MAX)); const n = fs.readSync(fd, buf, 0, buf.length, args.offset); fs.closeSync(fd);
        const out = new Uint8Array(n); out.set(buf.subarray(0, n)); return out.buffer;
      }
      case 'proxy_check': { const m = loadMeta(args.hash); return m ? m.proxySize : null; }
      case 'frame_next': {
        const meta = loadMeta(args.hash); if (!meta) throw new Error('프록시 정보가 없어요');
        let s = frames.get(args.session);
        if (!s || s.hash !== args.hash || args.idx < s.cur || args.idx - s.cur > REOPEN_GAP) { if (s) s.child.kill(); s = openFrames(meta, args.idx); frames.set(args.session, s); }
        while (s.cur < args.idx) { const f = await readOne(s); if (!f) { frames.delete(args.session); throw new Error('원본 끝을 넘었어요'); } s.cur++; }
        const f = await readOne(s); if (!f) { frames.delete(args.session); throw new Error('원본 끝을 넘었어요'); } s.cur++;
        return new Uint8Array(f).buffer;
      }
      case 'frame_close': { for (const [k, s] of frames) if (args.session == null || k === args.session) { s.child.kill(); frames.delete(k); } return; }
      case 'export_open': { const id = ++expSeq; const p = path.join(proxyDir, '..', args.name); exports.set(id, { fd: fs.openSync(p, 'w'), path: p }); return id; }
      case 'export_write': { const id = +opts.headers['x-id'], pos = +opts.headers['x-pos']; const e = exports.get(id); if (!e) throw new Error('저장 세션이 없어요'); fs.writeSync(e.fd, Buffer.from(args.buffer, args.byteOffset, args.byteLength), 0, args.byteLength, pos); return; }
      case 'export_close': { const e = exports.get(args.id); if (e) { fs.closeSync(e.fd); exports.delete(args.id); } return; }
      case 'cache_info': return cacheInfo();
      case 'cache_clear': for (const f of fs.readdirSync(proxyDir)) if (/\.(mp4|json|tmp)$/.test(f)) fs.unlinkSync(path.join(proxyDir, f)); metas.clear(); return cacheInfo();
      case 'open_cache_dir': return;
      case 'retry_online': return true;
      default: throw new Error('unknown command ' + cmd);
    }
  };
  function cacheInfo() { let count = 0, bytes = 0; for (const f of fs.readdirSync(proxyDir)) if (f.endsWith('.mp4')) { count++; bytes += fs.statSync(path.join(proxyDir, f)).size; } return { count, bytes, dir: proxyDir }; }
  const listen = async (ev, cb) => { if (!listeners.has(ev)) listeners.set(ev, new Set()); listeners.get(ev).add(cb); return () => listeners.get(ev).delete(cb); };
  const exportPath = id => exports.get(id) && exports.get(id).path;
  return { invoke, listen, emit, plan, slot, loadMeta, exportPath, __TAURI__: { core: { invoke }, event: { listen } } };
}

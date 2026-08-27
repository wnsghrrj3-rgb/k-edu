/* ============================================================
   케이무비 껍데기 접합점 (KMV_SHELL) — 데스크톱판 설계 초안 v1
   ------------------------------------------------------------
   · window.__TAURI__ 가 있으면 active. 없으면(보통 브라우저) 전부 no-op — 브라우저판 코드 변화 0.
   · 가져오기: 껍데기가 경로만 잡고 ffmpeg 프록시(긴 변 1280·30fps·H.264)를 만든 뒤,
     그 파일을 조각으로 받아 File 로 만들어 KMV_MEDIA.open 에 넘긴다. 사진·음악은 원본 그대로.
     File 에 kmvOrigin { path, hash, ... } 를 붙여 media.origin 으로 저장 → 새로고침 복원은 IndexedDB 대신 디스크.
   · 내보내기: drawExact 가 쓰는 프레임을 껍데기의 원화질 파이프(프록시 프레임 번호와 같은 프레임을 원본에서
     1920×1080 RGBA 로)로 바꾼다. 저장은 mp4-muxer StreamTarget → 껍데기 파일 쓰기(메모리 0).
   · 끌어놓기: 웹뷰의 HTML5 drop 대신 tauri://drag-drop(경로) 를 듣는다.
   ============================================================ */
(function (g) {
  'use strict';

  const T = g.__TAURI__;
  const active = !!(T && T.core && typeof T.core.invoke === 'function');
  const invoke = active ? T.core.invoke : null;
  const CHUNK = 16 * 1024 * 1024;

  let info = null;
  const sessions = new Map();     // mediaId → { session, hash, next }
  let exporting = false;

  class PathRef {
    constructor(path) { this.path = path; this.name = String(path).split(/[\\/]/).pop() || path; this.isPathRef = true; this.size = 0; this.type = ''; }
  }
  const ref = path => new PathRef(path);
  const basename = p => String(p).split(/[\\/]/).pop() || p;
  const mimeOf = name => {
    const e = (name.split('.').pop() || '').toLowerCase();
    if (/^(mp4|m4v)$/.test(e)) return 'video/mp4'; if (e === 'mov') return 'video/quicktime';
    if (/^(jpg|jpeg)$/.test(e)) return 'image/jpeg'; if (e === 'png') return 'image/png'; if (e === 'webp') return 'image/webp'; if (e === 'gif') return 'image/gif'; if (e === 'bmp') return 'image/bmp';
    if (e === 'mp3') return 'audio/mpeg'; if (e === 'wav') return 'audio/wav'; if (/^(m4a|aac)$/.test(e)) return 'audio/mp4'; if (/^(ogg|oga)$/.test(e)) return 'audio/ogg'; if (e === 'flac') return 'audio/flac';
    return '';
  };

  async function init() {
    if (!active) return null;
    try { info = await invoke('shell_info'); } catch (e) { console.warn('[KMV shell] info', e); info = { ffmpeg: false }; }
    if (g.KMV_MEDIA && g.KMV_MEDIA.limits) {
      // 프록시는 긴 변 1280·30fps 라 원본 한도 대신 껍데기 한도(시간)로. 파일 크기 한도는 프록시 기준으로 넉넉히.
      g.KMV_MEDIA.limits.maxSec = (info && info.maxSec) || 15 * 60;
      g.KMV_MEDIA.limits.maxFile = 1500 * 1024 * 1024;
    }
    return info;
  }

  /* ---------- 끌어놓기 (경로) ---------- */
  function listenDrop(onPaths, onHover) {
    if (!active || !T.event || !T.event.listen) return;
    const L = T.event.listen;
    L('tauri://drag-enter', () => onHover && onHover(true));
    L('tauri://drag-over', () => onHover && onHover(true));
    L('tauri://drag-leave', () => onHover && onHover(false));
    L('tauri://drag-drop', e => { onHover && onHover(false); const paths = (e && e.payload && (e.payload.paths || e.payload)) || []; if (Array.isArray(paths) && paths.length) onPaths(paths.map(ref)); });
  }

  async function pick() {
    if (!active) return [];
    const paths = await invoke('pick_files');
    return (paths || []).map(ref);
  }

  /* ---------- 조각 읽기 → File ---------- */
  async function readAll(where, total, onProgress) {
    const parts = []; let off = 0;
    while (off < total) {
      const len = Math.min(CHUNK, total - off);
      const buf = await invoke('read_chunk', Object.assign({ offset: off, len }, where));
      const u8 = buf instanceof ArrayBuffer ? new Uint8Array(buf) : new Uint8Array(buf.buffer || buf);
      if (!u8.length) break;
      parts.push(u8); off += u8.length;
      onProgress && onProgress(off / total);
    }
    return parts;
  }

  /* 경로 → File (kmvOrigin 부착). hooks: { status(text), progress(pct, label) } */
  async function file(pathOrRef, hooks) {
    if (!active) throw new Error('데스크톱판이 아니에요');
    const path = pathOrRef && pathOrRef.isPathRef ? pathOrRef.path : String(pathOrRef);
    hooks = hooks || {};
    const name = basename(path);
    let unlisten = null;
    if (T.event && T.event.listen) {
      unlisten = await T.event.listen('kmv-proxy', e => {
        const p = e && e.payload; if (!p || p.path !== path) return;
        hooks.progress && hooks.progress(p.pct * 0.85, (p.stage || '프록시 만드는 중') + ' — ' + name);
      });
    }
    let r;
    try { r = await invoke('import_path', { path }); }
    finally { if (unlisten) { try { unlisten(); } catch (e) {} } }
    hooks.status && hooks.status((r.cached ? '프록시 다시 쓰는 중' : '프록시 받는 중') + ' — ' + name);
    const where = r.kind === 'video' ? { hash: r.hash } : { path };
    const parts = await readAll(where, r.bytes, p => hooks.progress && hooks.progress(0.85 + p * 0.15, '프록시 받는 중 — ' + name));
    const f = new File(parts, r.name || name, { type: mimeOf(r.name || name) || (r.kind === 'video' ? 'video/mp4' : '') });
    f.kmvOrigin = { path, hash: r.hash, name: r.name || name, kind: r.kind, size: r.size, mtime: r.mtime, w: r.w, h: r.h, durSec: r.durSec, fps: r.fps, codec: r.codec };
    return f;
  }

  /* 새로고침 복원: media.origin → File. 프록시가 지워졌으면 원본에서 다시 만든다(원본이 있을 때). */
  async function restoreFile(origin, hooks) {
    if (!active || !origin || !origin.path) return null;
    return file(origin.path, hooks);
  }

  const hasOrigin = mediaId => { const P = g.KMV_PROJECT, m = P && P.media(mediaId); return !!(active && m && m.origin && m.origin.kind === 'video' && m.origin.hash); };
  const anyOrigin = () => !!(active && g.KMV_PROJECT && g.KMV_PROJECT.data.media.some(m => m.origin && m.origin.kind === 'video'));

  /* ---------- 원화질 프레임 (내보내기 전용) ---------- */
  function exactBegin() { exporting = true; sessions.clear(); }
  async function exactEnd() {
    exporting = false; sessions.clear();
    if (active) { try { await invoke('frame_close', { session: null }); } catch (e) {} }
  }
  /* 프록시 프레임 idx 와 같은 원본 프레임 → VideoFrame(RGBA, 1920×1080 레터박스). 실패하면 null(호출자가 프록시 프레임으로). */
  async function exact(mediaId, idx) {
    if (!active || !exporting || !hasOrigin(mediaId)) return null;
    const m = g.KMV_PROJECT.media(mediaId);
    let s = sessions.get(mediaId);
    if (!s) { s = { session: 'x' + mediaId, hash: m.origin.hash }; sessions.set(mediaId, s); }
    try {
      const buf = await invoke('frame_next', { session: s.session, hash: s.hash, idx: Math.max(0, idx | 0) });
      const u8 = buf instanceof ArrayBuffer ? new Uint8Array(buf) : new Uint8Array(buf.buffer || buf);
      const W = (info && info.frameW) || 1920, H = (info && info.frameH) || 1080;
      if (u8.length !== W * H * 4) return null;
      const vf = new VideoFrame(u8, { format: 'RGBA', codedWidth: W, codedHeight: H, timestamp: idx * 33333 });
      vf.kmvTemp = true;
      return vf;
    } catch (e) {
      if (!s.warned) { s.warned = true; console.warn('[KMV shell] 원화질 프레임 실패 → 프록시 프레임으로', mediaId, e); }
      return null;
    }
  }

  /* ---------- 저장 (mp4-muxer StreamTarget → 껍데기 파일) ---------- */
  async function saveTarget(name) {
    if (!active || !g.Mp4Muxer || !g.Mp4Muxer.StreamTarget) return null;
    const id = await invoke('export_open', { name });
    if (id == null) return { cancelled: true };
    let chain = Promise.resolve(), failed = null;
    const write = (data, pos) => {
      const bytes = data instanceof Uint8Array ? new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)) : new Uint8Array(data);
      chain = chain.then(() => invoke('export_write', bytes, { headers: { 'x-id': String(id), 'x-pos': String(pos) } })).catch(e => { failed = failed || e; });
      return chain;
    };
    const target = new g.Mp4Muxer.StreamTarget({ onData: (data, pos) => { write(data, pos); }, chunked: true, chunkSize: 8 * 1024 * 1024 });
    return {
      target,
      async close() { await chain; if (failed) throw failed; await invoke('export_close', { id, abort: false }); },
      async abort() { try { await chain; } catch (e) {} try { await invoke('export_close', { id, abort: true }); } catch (e) {} },
    };
  }

  /* ---------- 프록시 보관함 ---------- */
  const cacheInfo = () => active ? invoke('cache_info') : Promise.resolve(null);
  const cacheClear = () => active ? invoke('cache_clear') : Promise.resolve(null);
  const openCacheDir = () => active ? invoke('open_cache_dir') : Promise.resolve();
  const fmtBytes = b => b >= 1e9 ? (b / 1e9).toFixed(1) + 'GB' : b >= 1e6 ? Math.round(b / 1e6) + 'MB' : Math.round(b / 1e3) + 'KB';

  g.KMV_SHELL = {
    active, get info() { return info; },
    init, listenDrop, pick, ref, file, restoreFile, hasOrigin, anyOrigin,
    exactBegin, exactEnd, exact, saveTarget,
    cacheInfo, cacheClear, openCacheDir, fmtBytes,
    PathRef,
  };
})(typeof window !== 'undefined' ? window : globalThis);

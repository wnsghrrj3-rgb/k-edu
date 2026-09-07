/* ============================================================
   케이무비 내장 음원 라이브러리 (KMV_LIB) — 음원·폰트·효과 설계 v1 §2·§3
   ------------------------------------------------------------
   · assets/library.json 을 읽는다 — 파일은 준호가 assets/music/<무드>/ · assets/sfx/<효과음 id>/ 에
     넣고 `node kmovie/assets/scan.mjs` 로 목록을 다시 만든다(assets/README.md).
   · 음악: 무드별 목록 → 미리듣기(HTMLAudio) → 「＋ 넣기」 = 파일을 받아 음악 레인에 놓는다
     (가져오기 경로 그대로 — 파형·비트·덕킹·페이드 전부 같은 취급, 이 기기 IndexedDB 에도 보관).
   · 효과음: 목록에 있는 실음원은 합성(KMV_SFX)보다 우선 — 같은 id 의 버퍼로 바꿔 끼운다.
     한 id 에 여러 파일이면 카드 자리에 따라 하나를 고른다(같은 자리는 늘 같은 소리 — 결정적).
   ============================================================ */
(function (g) {
  'use strict';
  const BASE = 'assets/';
  let data = null, loading = null, audio = null, playingId = null;
  const listeners = new Set();
  function emit() { listeners.forEach(f => { try { f(); } catch (e) {} }); }

  function load() {
    if (loading) return loading;
    loading = fetch(BASE + 'library.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : { music: [], sfx: [] }).catch(() => ({ music: [], sfx: [] }))
      .then(j => { data = normalize(j); return data; })
      .then(d => { promoteSfx(d).catch(() => {}); emit(); return d; });
    return loading;
  }
  function normalize(j) {
    const music = ((j && j.music) || []).map((m, i) => Object.assign({ id: 'lib' + i, title: m.title || m.file, mood: m.mood || '기타', license: m.license || '', source: m.source || '', dur: m.dur || 0 }, m));
    const sfx = ((j && j.sfx) || []).map((s, i) => Object.assign({ id: 'sfx' + i, title: s.title || s.file }, s));
    music.sort((a, b) => a.mood.localeCompare(b.mood, 'ko') || a.title.localeCompare(b.title, 'ko'));
    const moods = []; music.forEach(m => { if (!moods.includes(m.mood)) moods.push(m.mood); });
    return { music, sfx, moods, credits: (j && j.credits) || '' };
  }
  function get() { return data; }
  function moods() { return data ? data.moods : []; }
  function music(mood) { return data ? data.music.filter(m => !mood || m.mood === mood) : []; }
  function url(item) { return BASE + item.file.split('/').map(encodeURIComponent).join('/'); }

  /* ---------- 미리듣기 ---------- */
  function preview(item) {
    if (playingId === item.id) { stop(); return false; }
    stop();
    audio = new Audio(url(item)); audio.volume = 0.85; playingId = item.id;
    audio.onended = () => { playingId = null; audio = null; emit(); };
    audio.play().catch(() => { playingId = null; audio = null; emit(); });
    emit(); return true;
  }
  function stop() { if (audio) { try { audio.pause(); } catch (e) {} audio = null; } playingId = null; emit(); }
  function playing() { return playingId; }

  /* ---------- 넣기 — 파일로 받아 가져오기 경로로 ---------- */
  async function fetchFile(item) {
    const r = await fetch(url(item)); if (!r.ok) throw new Error('음원을 못 받았어요 (' + r.status + ')');
    const b = await r.blob(), ext = (item.file.match(/\.[a-z0-9]+$/i) || [''])[0];
    const type = b.type || ({ '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.ogg': 'audio/ogg' }[ext.toLowerCase()] || 'audio/mpeg');
    return new File([b], item.title + ext, { type });
  }
  async function place(item) {
    stop();
    const f = await fetchFile(item);
    f.kmvLib = item.id;
    if (g.KMV_UI && g.KMV_UI.importFiles) await g.KMV_UI.importFiles([f]);
    return f;
  }

  /* ---------- 효과음 실음원 승격 ---------- */
  const realBufs = new Map();          // 합성 id → [AudioBuffer]
  async function promoteSfx(d) {
    const S = g.KMV_SFX, A = g.KMV_AUDIO; if (!S || !A || !d.sfx.length) return;
    const actx = A.ctx();
    for (const s of d.sfx) {
      if (!s.replace || !S.byId(s.replace)) continue;
      try {
        const ab = await (await fetch(url(s))).arrayBuffer();
        const buf = await actx.decodeAudioData(ab);
        if (!realBufs.has(s.replace)) realBufs.set(s.replace, []);
        realBufs.get(s.replace).push(buf);
      } catch (e) { console.warn('[KMV lib] 효과음', s.file, e); }
    }
    if (realBufs.size && S.setReal) S.setReal(realBufs);
    emit();
  }
  function realCount() { let n = 0; realBufs.forEach(v => n += v.length); return n; }

  g.KMV_LIB = { load, get, moods, music, url, preview, stop, playing, place, fetchFile, realCount, onChange: f => listeners.add(f) };
})(typeof window !== 'undefined' ? window : globalThis);

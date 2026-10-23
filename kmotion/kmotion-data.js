/* 케이모션 데이터 층 v0.1 — 관절 좌표·행동 이벤트 기록 (IndexedDB)
 * 원칙: 원본 영상은 절대 저장하지 않는다. 관절 좌표(거울 픽셀, 소수 1자리)·행동 이벤트·오류만.
 *      기록은 기본 꺼짐. 이 기기의 스위치(localStorage kmotion.rec)로 켜며, 켜진 동안만 쌓인다.
 *      (학급 적용 시 동의 체계를 이 스위치 앞에 붙인다 — 지금은 개발·테스트용)
 * 스키마 v1
 *   sessions : { id, activity, startedAt, endedAt, engine, action, model, modes, ua, W, H, frames, events, errors, schema:1 }
 *   frames   : { id*, session, t, hands:[[{x,y,z,v}×21]], pose:[{x,y,z,v}×33]|null, actions }
 *   events   : { id*, session, t, type, data, score, source, label, labelSource:'rule'|'user', verified:false, note }
 * 용량: 세션당 최대 프레임 MAX_FRAMES, 전체 약 QUOTA_MB 넘으면 오래된 세션부터 삭제.
 * 사용:
 *   KMotionData.attach(km, headerEl)  // 🔴 기록 스위치 버튼 + 자동 훅
 *   KMotionData.list() / events(session) / frames(session) / exportSession(id) / remove(id) / clear() / usage()
 *   KMotionData.setLabel(eventId, label, note)   // 라벨 수정(사람 검증)
 */
(function(){
  const DB = 'kmotion', VER = 1, SCHEMA = 1;
  const MAX_FRAMES = 9000;      // 세션당(30fps 5분)
  const QUOTA_MB = 150;         // 전체 상한(추정)
  const KEY = 'kmotion.rec';
  let dbp = null;
  function open(){
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB, VER);
      r.onupgradeneeded = () => { const d = r.result;
        if (!d.objectStoreNames.contains('sessions')) d.createObjectStore('sessions', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('frames')) d.createObjectStore('frames', { keyPath: 'id', autoIncrement: true }).createIndex('session', 'session');
        if (!d.objectStoreNames.contains('events')) { const s = d.createObjectStore('events', { keyPath: 'id', autoIncrement: true }); s.createIndex('session', 'session'); s.createIndex('type', 'type'); } };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  function tx(stores, mode, fn){ return open().then(d => new Promise((res, rej) => { const t = d.transaction(stores, mode); const out = fn(t); t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); })); }
  function req(r){ return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
  function allByIndex(store, idx, key){ return open().then(d => req(d.transaction(store).objectStore(store).index(idx).getAll(key))); }
  const r1 = n => Math.round(n * 10) / 10;
  const slimLm = lm => lm ? lm.map(p => ({ x: r1(p.x), y: r1(p.y), z: +p.z.toFixed(3), v: +p.v.toFixed(2) })) : null;

  const D = {
    enabled(){ return localStorage.getItem(KEY) === '1'; },
    setEnabled(v){ localStorage.setItem(KEY, v ? '1' : '0'); D._emit(); },
    _subs: [], onChange(fn){ D._subs.push(fn); }, _emit(){ D._subs.forEach(f => f(D.enabled())); },

    attach(km, headerEl){
      const rec = { session: null, frames: [], events: [], nFrames: 0, nEvents: 0, nErrors: 0, timer: 0, dropped: 0 };
      const btn = document.createElement('button'); btn.className = 'recbtn'; btn.type = 'button';
      const paint = () => { const on = D.enabled(); btn.textContent = on ? '🔴 기록 중' : '⚪ 기록'; btn.title = on ? '관절·행동 기록 켜짐(이 기기)' : '기록 꺼짐 — 누르면 켜짐'; btn.classList.toggle('on', on); };
      btn.onclick = () => D.setEnabled(!D.enabled()); D.onChange(paint); paint();
      const link = document.createElement('a'); link.href = './data.html'; link.textContent = '데이터'; link.className = 'datalink';
      if (headerEl) { const box = document.createElement('span'); box.className = 'recbox'; box.append(btn, link); headerEl.appendChild(box); }
      const flush = async () => {
        if (!rec.session || (!rec.frames.length && !rec.events.length)) return;
        const fr = rec.frames; rec.frames = []; const ev = rec.events; rec.events = [];
        try { await tx(['frames', 'events', 'sessions'], 'readwrite', t => { fr.forEach(f => t.objectStore('frames').add(f)); ev.forEach(e => t.objectStore('events').add(e));
          t.objectStore('sessions').put(Object.assign({}, rec.session, { frames: rec.nFrames, events: rec.nEvents, errors: rec.nErrors, endedAt: Date.now() })); }); }
        catch (e) { console.warn('[kmotion-data] flush 실패', e); }
      };
      km.on('session:start', e => { if (!D.enabled()) return;
        rec.session = { id: km.sessionId, activity: e.activity, startedAt: Date.now(), endedAt: null, engine: e.engine, action: e.action, model: km.MODEL_VERSION, modes: e.modes, ua: e.ua, W: e.W, H: e.H, frames: 0, events: 0, errors: 0, schema: SCHEMA };
        rec.nFrames = rec.nEvents = rec.nErrors = 0; tx(['sessions'], 'readwrite', t => t.objectStore('sessions').put(rec.session)); rec.timer = setInterval(flush, 1000); D.enforceQuota(); });
      km.on('session:stop', () => { if (!rec.session) return; clearInterval(rec.timer); flush().then(() => { rec.session = null; }); });
      km.on('frame', e => { if (!rec.session) return; if (rec.nFrames >= MAX_FRAMES) { rec.dropped++; return; }
        rec.nFrames++; rec.frames.push({ session: rec.session.id, t: Math.round(e.t), hands: e.hands.map(slimLm), pose: slimLm(e.pose), actions: e.actions }); });
      km.on('*', e => { if (!rec.session || e.type === 'frame' || e.type === 'hand:move' || e.type.startsWith('session')) return;
        const { type, t, score, source, session, engine, action, model, ...data } = e; if (data.pos) data.pos = { x: r1(data.pos.x), y: r1(data.pos.y) };
        rec.nEvents++; if (type === 'error') rec.nErrors++;
        rec.events.push({ session: rec.session.id, t: Math.round(t), type, data, score: +(score == null ? 1 : score).toFixed(2), source: source || 'rule', label: type, labelSource: 'rule', verified: false, note: '' }); });
      window.addEventListener('pagehide', () => { if (rec.session) { clearInterval(rec.timer); flush(); } });
      return rec;
    },

    async list(){ const d = await open(); const s = await req(d.transaction('sessions').objectStore('sessions').getAll()); return s.sort((a, b) => b.startedAt - a.startedAt); },
    async session(id){ const d = await open(); return req(d.transaction('sessions').objectStore('sessions').get(id)); },
    events(session){ return allByIndex('events', 'session', session); },
    frames(session){ return allByIndex('frames', 'session', session); },
    async eventsByType(type){ return allByIndex('events', 'type', type); },
    async setLabel(id, label, note){ const d = await open(); const st = d.transaction('events', 'readwrite').objectStore('events'); const e = await req(st.get(id)); if (!e) return null;
      e.label = label; e.labelSource = 'user'; e.verified = true; if (note != null) e.note = note; e.labeledAt = Date.now(); await req(st.put(e)); return e; },
    async exportSession(id){ const [s, ev, fr] = await Promise.all([D.session(id), D.events(id), D.frames(id)]); return { schema: SCHEMA, exportedAt: new Date().toISOString(), session: s, events: ev, frames: fr }; },
    async exportAll(){ const ss = await D.list(); const out = []; for (const s of ss) out.push(await D.exportSession(s.id)); return { schema: SCHEMA, exportedAt: new Date().toISOString(), sessions: out }; },
    async remove(id){ return tx(['sessions', 'frames', 'events'], 'readwrite', t => { t.objectStore('sessions').delete(id);
      for (const st of ['frames', 'events']) { const idx = t.objectStore(st).index('session'); idx.openKeyCursor(IDBKeyRange.only(id)).onsuccess = ev => { const c = ev.target.result; if (c) { t.objectStore(st).delete(c.primaryKey); c.continue(); } }; } }); },
    async clear(){ return tx(['sessions', 'frames', 'events'], 'readwrite', t => { ['sessions', 'frames', 'events'].forEach(s => t.objectStore(s).clear()); }); },
    async usage(){ if (!navigator.storage || !navigator.storage.estimate) return { usage: 0, quota: 0 }; const e = await navigator.storage.estimate(); return { usage: e.usage || 0, quota: e.quota || 0 }; },
    async estimateMB(){ const ss = await D.list(); return ss.reduce((m, s) => m + (s.frames || 0) * 0.0012 + (s.events || 0) * 0.0003, 0); }, // 프레임≈1.2KB, 이벤트≈0.3KB
    async enforceQuota(){ let ss = await D.list(); let mb = await D.estimateMB(); while (mb > QUOTA_MB && ss.length > 1) { const old = ss.pop(); await D.remove(old.id); mb -= (old.frames || 0) * 0.0012 + (old.events || 0) * 0.0003; } },
    download(obj, name){ const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); },
    LABELS: ['hand:open', 'hand:fist', 'hand:pinch', 'hand:point', 'hand:other', 'hand:grab', 'hand:release', 'hand:wave', 'hand:swipe', 'body:jump', 'body:land', 'body:squat', 'body:stand', 'body:arms_up', 'body:arms_down', 'body:found', 'body:lost', '오인식(없음)'],
    SCHEMA, MAX_FRAMES, QUOTA_MB
  };
  window.KMotionData = D;
})();

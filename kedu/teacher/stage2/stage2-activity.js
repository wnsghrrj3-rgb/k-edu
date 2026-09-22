/* ============================================================================
   stage2-activity.js — 케이티처 2세대 활동 층 v4 (2026-09-22 신설)
   · 헌법 v4 = handoff/kedu/activities/케이티처_활동시스템_설계_v4.md
   · 하는 일: ① 카탈로그(활동 30종) 읽기 ② 런처(이 차시 추천·단원·전체·⚡빠른 활동) ③ iframe 호스트(브리지 v1: READY→CONFIG, RESULT/EXIT, CLOSE)
     ④ 수첩(byType 오개념 한 장) ⑤ 복습 루프(수첩 → 다음 차시 ①복습 슬라이드) ⑥ 슬라이드 종류 `activity`(activityId) 카드
   · 제1원칙 유지: 도구는 호스트를 모른다 — 이 층은 URL 과 postMessage 로만 도구를 만난다.
   · 무대(stage2.js)와의 접점 4개: Stage 생성 끝 attach(stage) · renderSlide case 'activity' → renderCard(d) · act 'kact' → startFromSlide · HUD 'act' → open
   ============================================================================ */
(function (global) {
  'use strict';
  const doc = global.document;
  const CATALOG_URL = '/kedu/activities/_CATALOG.json';
  const READY_TIMEOUT_MS = 5000;
  const GENRE_KO = { duel_quiz: '선다 대결', balance: '저울 비교', bundle: '묶어 세기', sequence: '순서 잇기', relay: '반 전체 릴레이', explore: '개념 탐험', sort: '분류하기', text_hunt: '글 속 찾기', order_story: '순서 맞추기', claim_judge: '맞다·아니다', map_pin: '자리에 놓기', category_race: '분류 릴레이', fill_dialog: '대화 채우기', observe_pick: '관찰 고르기', catch_fall: '떨어지는 수 잡기' };
  const PHASE_KO = { intro: '도입', practice: '연습', wrapup: '정리' };
  const SUBJ_KO = { math: '수학', korean: '국어', science: '과학', social: '사회', english: '영어' };
  const LOG_KEY = 'kt2_act_log';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function lsGet(k, d) { try { const v = global.localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { global.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  // 차시 키 u1_l02_03 처럼 두 차시가 한 파일이면 둘 다 그 차시다
  function lessonNos(key) { const out = []; String(key || '').replace(/l(\d+)/g, (_, n) => { out.push('l' + pad2(+n)); }); return out; }
  // 다음 차시 = 데이터 파일(LESSONS) 등재 순서의 다음 키 — 키 번호로 짐작하지 않는다(u1_l02_03 → u1_l04_05)
  function nextLessonKey(stage) { const keys = Object.keys(stage.lessonsRef || {}); const i = keys.indexOf(stage.key); return i >= 0 && keys[i + 1] ? keys[i + 1] : null; }
  function isLocalHost() { const l = global.location || {}; return l.protocol === 'file:' || l.hostname === 'localhost' || l.hostname === '127.0.0.1' || !l.hostname; }
  function target() { return isLocalHost() ? '*' : global.location.origin; }

  const KA = { catalog: null, byId: {}, failed: false, session: null, stage: null, _lastLaunch: null };

  // ───────────────────────── 카탈로그 ─────────────────────────
  KA.loadCatalog = function () {
    if (KA._p) return KA._p;
    if (global.KT2_CATALOG) { KA.setCatalog(global.KT2_CATALOG); KA._p = Promise.resolve(KA.catalog); return KA._p; }
    if (typeof global.fetch !== 'function') { KA.failed = true; KA._p = Promise.resolve(null); return KA._p; }
    KA._p = global.fetch(CATALOG_URL).then(r => { if (!r.ok) throw new Error('catalog ' + r.status); return r.json(); }).then(arr => { KA.setCatalog(arr); return KA.catalog; }).catch(() => { KA.failed = true; return null; });
    return KA._p;
  };
  KA.setCatalog = function (arr) { KA.catalog = Array.isArray(arr) ? arr : []; KA.byId = {}; KA.catalog.forEach(a => { if (a && a.id) KA.byId[a.id] = a; }); KA.failed = false; };
  // 이 차시 = map.lessons 에 lNN 포함 · 이 단원 = 같은 학년·과목·단원 · 나머지 = 학년별
  KA.groups = function (stage) {
    const all = KA.catalog || []; const g = stage.g, s = stage.s, u = stage.u, lns = lessonNos(stage.key);
    const rec = all.filter(a => a.map && a.map.grade === g && a.map.subject === s && a.map.unit === u && lns.some(ln => (a.map.lessons || []).indexOf(ln) >= 0));
    const unit = all.filter(a => a.map && a.map.grade === g && a.map.subject === s && a.map.unit === u && rec.indexOf(a) < 0);
    const rest = all.filter(a => rec.indexOf(a) < 0 && unit.indexOf(a) < 0);
    return { rec, unit, rest };
  };
  KA.defaults = function (a, params) { const m = {}; Object.keys(a.paramsSchema || {}).forEach(k => { m[k] = a.paramsSchema[k].default; }); Object.keys(params || {}).forEach(k => { if (params[k] !== undefined && params[k] !== null && params[k] !== '') m[k] = params[k]; }); return m; };
  KA.genId = function (a) { const m = /([A-Za-z0-9_]+)\.js$/.exec(a.gen || ''); return m ? m[1] : null; };

  // ───────────────────────── 무대 접점 ─────────────────────────
  KA.attach = function (stage) {
    KA.stage = stage; KA.ensureDom();
    KA.loadCatalog().then(() => { KA.paintHudBadge(); });
    KA.applyPendingReview(stage);
  };
  KA.paintHudBadge = function () {
    const b = doc.querySelector('#hud button[data-h="act"]'); if (!b || !KA.stage) return;
    const n = KA.catalog ? KA.groups(KA.stage).rec.length : 0;
    b.innerHTML = '🎲 활동' + (n ? '<i class="kact-cnt">' + n + '</i>' : '');
  };
  KA.ensureDom = function () {
    if (doc.getElementById('ov-act')) return;
    const mk = (id, cls, html) => { const d = doc.createElement('div'); d.id = id; d.className = cls; d.innerHTML = html; doc.body.appendChild(d); return d; };
    const ov = mk('ov-act', 'ov', '<div class="panel kact-panel"><h3>🎲 활동 <span class="kact-h-sub"></span><span class="sp"></span><button class="x" data-x="1">✕</button></h3><div class="kact-tabs"></div><div class="kact-body"></div></div>');
    ov.addEventListener('click', e => { if (e.target === ov || e.target.getAttribute('data-x')) KA.closeLauncher(); });
    const host = mk('kact-host', 'kact-host', '');
    host.addEventListener('click', e => { const b = e.target.closest('[data-kh]'); if (!b) return; const k = b.getAttribute('data-kh'); if (k === 'close') KA.hostClose(); else if (k === 'retry') KA.createFrame(); });
    const note = mk('ov-note', 'ov', '<div class="panel kact-note"></div>');
    note.addEventListener('click', e => { if (e.target === note) note.classList.remove('on'); });
  };
  // 슬라이드 종류 activity(activityId) → 카드 HTML (renderSlide 가 부른다)
  KA.renderCard = function (d) {
    const a = KA.byId[d.activityId];
    const title = d.title || (a && a.title) || '활동';
    const short = d.desc || (a && a.short) || '';
    const meta = a ? '<span class="kact-tag">' + esc(GENRE_KO[a.genre] || a.genre || '') + '</span><span class="kact-tag">' + esc(PHASE_KO[a.phase] || '') + '</span>' + (a.minutesClass ? '<span class="kact-tag">⏱ ' + a.minutesClass + '분</span>' : '') : '<span class="kact-tag warn">카탈로그에 없는 활동</span>';
    const p = a ? KA.defaults(a, d.params) : (d.params || {});
    const chips = a ? Object.keys(a.paramsSchema || {}).map(k => '<span class="kact-chip">' + esc(a.paramsSchema[k].label || k) + ' <b>' + esc(p[k]) + '</b></span>').join('') : '';
    return '<div class="kact-slide"><div class="kact-slide-ic">🎲</div><div class="kact-slide-t">' + esc(title) + '</div>' + (short ? '<div class="kact-slide-s">' + esc(short) + '</div>' : '') + '<div class="kact-slide-m">' + meta + '</div>' + (chips ? '<div class="kact-slide-c">' + chips + '</div>' : '') + (d.note ? '<div class="kact-slide-n">' + esc(d.note) + '</div>' : '') + '<div class="kact-slide-b"><button class="kact-go" data-act="kact" data-id="' + esc(d.activityId) + '">▶ 활동 시작</button></div></div>';
  };
  KA.startFromSlide = function (stage, slide) {
    const d = slide.data || {}; const a = KA.byId[d.activityId];
    if (!a) { stage.toast('카탈로그에 없는 활동이에요: ' + (d.activityId || '')); return; }
    KA.launch(a, d.params || {});
  };

  // ───────────────────────── 런처 ─────────────────────────
  KA.openLauncher = function (tab, opt) {
    const stage = KA.stage; if (!stage) return; KA.ensureDom(); KA._insert = !!(opt && opt.insert);
    const ov = doc.getElementById('ov-act'); ov.querySelector('.kact-h-sub').textContent = KA._insert ? '— 슬라이드로 넣기' : '';
    KA.loadCatalog().then(() => {
      const G = KA.groups(stage); const tabs = ov.querySelector('.kact-tabs'); const body = ov.querySelector('.kact-body');
      const T = [['rec', '이 차시 ' + G.rec.length], ['unit', '이 단원 ' + G.unit.length], ['all', '모든 활동 ' + (KA.catalog || []).length], ['quick', '⚡ 빠른 활동' + (global.KT2_QUICK ? ' ' + global.KT2_QUICK.list.length : '')]];
      let cur = tab || (G.rec.length ? 'rec' : (G.unit.length ? 'unit' : (global.KT2_QUICK ? 'quick' : 'all')));
      if (KA._insert && cur === 'quick') cur = G.rec.length ? 'rec' : 'all';
      const paint = () => {
        tabs.innerHTML = T.filter(t => !(KA._insert && t[0] === 'quick')).map(t => '<button class="kact-tab' + (t[0] === cur ? ' on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>').join('');
        tabs.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { cur = b.getAttribute('data-t'); paint(); }));
        if (cur === 'quick') { body.innerHTML = global.KT2_QUICK ? global.KT2_QUICK.tiles() : '<div class="kact-empty">빠른 활동 층이 아직 안 실렸어요</div>'; if (global.KT2_QUICK) global.KT2_QUICK.bindTiles(body, stage); return; }
        if (KA.failed) { body.innerHTML = '<div class="kact-empty">😢 활동 목록(카탈로그)을 못 읽었어요 — 인터넷을 확인하고 다시 열어 주세요.<br><small>⚡ 빠른 활동은 목록 없이 돼요.</small></div>'; return; }
        const list = cur === 'rec' ? G.rec : cur === 'unit' ? G.unit : (KA.catalog || []);
        if (!list.length) { body.innerHTML = '<div class="kact-empty">' + (cur === 'rec' ? '이 차시에 맞춘 활동이 아직 없어요 — 「이 단원」이나 「⚡ 빠른 활동」을 열어 보세요.' : '활동이 없어요') + '</div>'; return; }
        if (cur === 'all') {
          const by = {}; list.forEach(a => { const k = (a.map ? a.map.grade + '학년 ' + (SUBJ_KO[a.map.subject] || a.map.subject) + ' ' + a.map.unit + '단원' : '기타'); (by[k] = by[k] || []).push(a); });
          body.innerHTML = Object.keys(by).sort().map(k => '<div class="kact-grp">' + esc(k) + '</div><div class="kact-grid">' + by[k].map(KA.cardHtml).join('') + '</div>').join('');
        } else body.innerHTML = '<div class="kact-grid">' + list.map(KA.cardHtml).join('') + '</div>';
        KA.bindCards(body);
      };
      paint(); stage.openOv('ov-act');
    });
  };
  KA.closeLauncher = function () { const o = doc.getElementById('ov-act'); if (o) o.classList.remove('on'); };
  KA.cardHtml = function (a) {
    const p = KA.defaults(a, {});
    const chips = Object.keys(a.paramsSchema || {}).map(k => { const ps = a.paramsSchema[k]; return '<div class="kact-prow" data-k="' + esc(k) + '"><span class="kact-plbl">' + esc(ps.label || k) + '</span>' + (ps.options || [ps.default]).map(o => '<button class="kact-chip' + (String(o) === String(p[k]) ? ' on' : '') + '" data-v="' + esc(o) + '">' + esc(ps.optionLabels && ps.optionLabels[o] != null ? ps.optionLabels[o] : (k === 'why' ? (o ? '켬' : '끔') : o)) + '</button>').join('') + '</div>'; }).join('');
    const modes = (a.modes || []).map(m => ({ class: '수업', solo: '혼자', assign: '과제' })[m] || m).join('·');
    return '<div class="kact-card" data-id="' + esc(a.id) + '"><div class="kact-c-top"><span class="kact-c-t">' + esc(a.title) + '</span>' + (a.status === 'live' ? '<span class="kact-tag ok">검수 완료</span>' : '<span class="kact-tag">검수 전</span>') + '</div><div class="kact-c-s">' + esc(a.short || '') + '</div><div class="kact-c-m"><span class="kact-tag">' + esc(GENRE_KO[a.genre] || a.genre) + '</span><span class="kact-tag">' + esc(PHASE_KO[a.phase] || '') + '</span>' + (a.minutesClass ? '<span class="kact-tag">⏱ ' + a.minutesClass + '분</span>' : '') + '<span class="kact-tag">' + esc(modes) + '</span>' + (a.pages ? '<span class="kact-tag">📖 ' + esc(a.pages) + '</span>' : '') + '</div>' + (chips ? '<div class="kact-params">' + chips + '</div>' : '') + '<div class="kact-c-b">' + (KA._insert ? '<button class="btn main" data-c="insert">＋ 이 자리에 슬라이드로</button>' : '<button class="btn main" data-c="start">▶ 시작</button><button class="btn" data-c="insert" title="이 슬라이드 뒤에 활동 슬라이드를 넣어요 — 이 기기에만 저장">＋ 슬라이드로</button>' + (KA.genId(a) ? '<button class="btn" data-c="ws" title="같은 문제로 A4 활동지를 새 창에">🖨 활동지</button>' : '')) + '</div></div>';
  };
  KA.readParams = function (card) { const p = {}; card.querySelectorAll('.kact-prow').forEach(r => { const on = r.querySelector('.kact-chip.on'); if (on) { const v = on.getAttribute('data-v'); p[r.getAttribute('data-k')] = /^-?\d+(\.\d+)?$/.test(v) ? +v : v; } }); return p; };
  KA.bindCards = function (root) {
    root.querySelectorAll('.kact-card').forEach(card => {
      card.querySelectorAll('.kact-prow').forEach(r => r.querySelectorAll('.kact-chip').forEach(ch => ch.addEventListener('click', () => { r.querySelectorAll('.kact-chip').forEach(c => c.classList.remove('on')); ch.classList.add('on'); })));
      card.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => {
        const a = KA.byId[card.getAttribute('data-id')]; if (!a) return; const p = KA.readParams(card); const c = b.getAttribute('data-c');
        if (c === 'start') { KA.closeLauncher(); KA.launch(a, p); }
        else if (c === 'insert') { KA.closeLauncher(); KA.insertSlide(a, p); }
        else if (c === 'ws') KA.openWorksheet(a, p);
      }));
    });
  };
  KA.insertSlide = function (a, p) {
    const st = KA.stage; const cur = st.cur(); const id = 'add_' + Date.now().toString(36);
    const sl = { id, stage: cur.stage, after: cur.id, block: 'activity', data: { activityId: a.id, title: a.title, desc: a.short, params: p, note: '' } };
    st.plan.added.push(sl); st.savePlan(); st.applyPlanKeepIdx(); const i = st.slides.findIndex(s => s.id === id); st.go(i, 1); st.toast('활동 슬라이드를 넣었어요 — 목차에서 🗑 로 뺄 수 있어요');
  };
  KA.openWorksheet = function (a, p) {
    const g = KA.genId(a); if (!g) return; const qs = ['gen=' + encodeURIComponent(g)]; Object.keys(p || {}).forEach(k => { if (p[k] != null && p[k] !== '') qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(p[k])); });
    const url = '/kedu/activities/worksheet.html?' + qs.join('&'); if (global.open) global.open(url, '_blank'); KA._lastWs = url;
  };

  // ───────────────────────── iframe 호스트 (브리지 v1) ─────────────────────────
  KA.teamNames = function () { const t = lsGet('kt2_act_teams', null); return Array.isArray(t) && t.length === 2 ? t : ['케이팀', '듀팀']; };
  KA.launch = function (a, params) {
    KA.ensureDom(); if (KA.session) KA.endSession(false);
    const merged = KA.defaults(a, params); const seed = 1 + Math.floor(Math.random() * 999999);
    KA.session = { a, params: merged, seed, readyTimer: null, result: null, iframe: null, at: Date.now() };
    KA._lastLaunch = { id: a.id, params: merged, seed };
    const host = doc.getElementById('kact-host');
    host.innerHTML = '<div class="kact-hud"><span class="kact-h-t">🎲 ' + esc(a.title) + '</span><span class="sp"></span><button data-kh="close">활동 닫기 ✕</button></div><div class="kact-wait"><div class="kact-w-ic">🎲</div><div>활동을 불러오고 있어요…</div></div>';
    host.classList.add('on'); doc.body.classList.add('kact-open');
    KA.createFrame();
  };
  KA.createFrame = function () {
    const s = KA.session; if (!s) return; const host = doc.getElementById('kact-host');
    if (s.iframe) { try { host.removeChild(s.iframe); } catch (e) { } }
    const f = doc.createElement('iframe'); f.className = 'kact-frame'; f.setAttribute('allow', 'autoplay');
    f.src = '/kedu/' + s.a.src + '?mode=class&seed=' + s.seed; s.iframe = f; host.appendChild(f);
    const w = host.querySelector('.kact-wait'); if (w) w.innerHTML = '<div class="kact-w-ic">🎲</div><div>활동을 불러오고 있어요…</div>';
    clearTimeout(s.readyTimer);
    s.readyTimer = setTimeout(() => { const w2 = host.querySelector('.kact-wait'); if (w2) w2.innerHTML = '<div class="kact-w-ic">😢</div><div>활동을 불러오지 못했어요</div><button class="btn main" data-kh="retry">다시 시도</button> <button class="btn" data-kh="close">닫기</button>'; }, READY_TIMEOUT_MS);
  };
  KA.onMessage = function (ev) {
    const s = KA.session; if (!s || !s.iframe) return;
    if (ev.source !== s.iframe.contentWindow) return;
    if (!isLocalHost() && ev.origin !== global.location.origin) return;
    const m = ev.data; if (!m || m.v !== 1) return;
    if (m.t === 'ACTIVITY_READY') {
      clearTimeout(s.readyTimer); const w = doc.querySelector('#kact-host .kact-wait'); if (w) w.remove();
      const st = KA.stage; const cfg = { t: 'ACTIVITY_CONFIG', v: 1, mode: 'class', params: s.params, meta: { teamNames: KA.teamNames(), mute: st ? !st.sound : false, roster: st && st.classNames && st.classNames.length ? st.classNames.slice() : null } };
      try { s.iframe.contentWindow.postMessage(cfg, target()); } catch (e) { }
    } else if (m.t === 'ACTIVITY_RESULT') { s.result = m; KA.endSession(true); }
    else if (m.t === 'ACTIVITY_EXIT') KA.endSession(false);
  };
  if (global.addEventListener) global.addEventListener('message', KA.onMessage);
  KA.hostClose = function () {
    const s = KA.session; if (!s) return; let sent = false;
    if (s.iframe && s.iframe.contentWindow) { try { s.iframe.contentWindow.postMessage({ t: 'ACTIVITY_CLOSE', v: 1 }, target()); sent = true; } catch (e) { } }
    setTimeout(() => { if (KA.session === s) KA.endSession(false); }, sent ? 800 : 0);
  };
  KA.endSession = function (showNotebook) {
    const s = KA.session; if (!s) return; clearTimeout(s.readyTimer);
    const host = doc.getElementById('kact-host'); if (s.iframe) { try { host.removeChild(s.iframe); } catch (e) { } }
    host.classList.remove('on'); host.innerHTML = ''; doc.body.classList.remove('kact-open'); KA.session = null;
    if (showNotebook && s.result) KA.openNotebook(s.a, s.result, s);
    else if (KA.stage && !showNotebook) KA.stage.toast('활동을 닫았어요 — 슬라이드로 돌아왔어요');
  };
  KA.isOpen = function () { return !!KA.session || !!(global.KT2_QUICK && global.KT2_QUICK.open); };

  // ───────────────────────── 수첩 ─────────────────────────
  KA.rowsOf = function (a, res) {
    const types = a.types || {}; const by = res.byType || {};
    return Object.keys(by).map(k => { const v = by[k] || {}; return { key: k, label: types[k] || k, ok: v.ok | 0, miss: v.miss | 0 }; }).sort((x, y) => y.miss - x.miss || y.ok - x.ok);
  };
  KA.openNotebook = function (a, res, s) {
    KA.ensureDom(); const st = KA.stage; const rows = KA.rowsOf(a, res); const top = rows.slice(0, 3);
    const allClear = rows.length > 0 && rows.every(r => r.miss === 0);
    const score = res.score != null ? res.score : null, max = res.max != null ? res.max : null;
    const team = (res.teams && res.teams.length === 2) ? '<div class="kn-team"><span>' + esc(res.teams[0].name) + ' <b>' + (res.teams[0].score | 0) + '</b></span><span class="kn-vs">:</span><span><b>' + (res.teams[1].score | 0) + '</b> ' + esc(res.teams[1].name) + '</span></div>' : '';
    const bar = r => { const n = r.ok + r.miss; if (!n) return ''; const okw = Math.round(100 * r.ok / n); return '<div class="kn-bar"><i style="width:' + okw + '%"></i></div>'; };
    const body = allClear ? '<div class="kn-clear">🎉 이번 판은 모든 유형을 맞혔어요</div>' : (top.length ? top.map(r => '<div class="kn-row"><div class="kn-lbl">' + esc(r.label) + '</div>' + bar(r) + '<div class="kn-miss">' + (r.miss ? '놓침 <b>' + r.miss + '</b>' : '<span class="ok">전부 맞힘</span>') + '<small>/ ' + (r.ok + r.miss) + '</small></div></div>').join('') : '<div class="kn-empty">유형별 기록이 없는 활동이에요</div>');
    const misses = rows.filter(r => r.miss > 0);
    const next = st ? nextLessonKey(st) : null;
    const canBox = typeof global.KEDU_BOXBAR_ADDACTIVITY === 'function';
    const p = doc.querySelector('#ov-note .kact-note');
    p.innerHTML = '<h3>📒 수첩 · ' + esc(a.title) + '<span class="sp"></span><button class="x" data-n="close">✕</button></h3>'
      + '<div class="kn-top"><div class="kn-judge">' + (allClear ? '🏆' : misses.length ? '🔍' : '✅') + '</div><div class="kn-score">' + (score != null && max != null ? '<b>' + score + '</b> / ' + max : '') + team + '</div></div>'
      + '<div class="kn-h">가장 많이 헷갈린 유형</div>' + body
      + '<div class="kn-hint">' + (misses.length ? '놓친 유형은 다음 차시 첫 슬라이드(①복습)로 보낼 수 있어요.' : '') + '</div>'
      + '<div class="kn-btns"><button class="btn" data-n="retry">🔁 같은 설정으로 다시</button>'
      + (misses.length && next ? '<button class="btn main" data-n="review">📌 다음 차시 복습으로 보내기</button>' : '')
      + '<button class="btn" data-n="box"' + (canBox ? '' : ' disabled title="교사 대시보드에서 케이박스 막대가 실린 화면에서만 돼요"') + '>📮 케이박스 과제로</button>'
      + '<button class="btn" data-n="close">닫기</button></div>';
    p.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => {
      const k = b.getAttribute('data-n'); const ov = doc.getElementById('ov-note');
      if (k === 'close') ov.classList.remove('on');
      else if (k === 'retry') { ov.classList.remove('on'); KA.launch(a, s.params); }
      else if (k === 'review') { KA.queueReview(st, a, misses); ov.classList.remove('on'); }
      else if (k === 'box' && canBox) { try { global.KEDU_BOXBAR_ADDACTIVITY({ activityId: a.id, params: s.params, seedMode: 'per_student', scoring: 'best', missTypes: misses.map(r => r.key) }); st.toast('케이박스 과제 만들기로 넘겼어요'); } catch (e) { st.toast('케이박스로 넘기지 못했어요'); } ov.classList.remove('on'); }
    }));
    KA.log({ at: new Date().toISOString().slice(0, 16), slug: st ? st.slug : '', key: st ? st.key : '', id: a.id, title: a.title, score, max, byType: res.byType || {}, seed: s.seed });
    doc.getElementById('ov-note').classList.add('on');
    if (st && st.sound && typeof st.pop === 'function') st.pop();
  };
  KA.log = function (e) { const arr = lsGet(LOG_KEY, []); arr.push(e); lsSet(LOG_KEY, arr.slice(-60)); };
  KA.history = function (slug, key) { return lsGet(LOG_KEY, []).filter(e => (!slug || e.slug === slug) && (!key || e.key === key)); };

  // ───────────────────────── 복습 루프 — 수첩 → 다음 차시 ①복습 슬라이드 ─────────────────────────
  KA.reviewKey = function (slug) { return 'kt2_act_review_' + slug; };
  KA.queueReview = function (st, a, misses) {
    const forKey = nextLessonKey(st); if (!forKey) return false;
    const q = lsGet(KA.reviewKey(st.slug), {});
    q[forKey] = { from: st.key, fromTitle: st.meta.subtitle || st.meta.title || st.key, activityId: a.id, title: a.title, at: new Date().toISOString().slice(0, 10), misses: misses.map(r => ({ key: r.key, label: r.label, miss: r.miss, ok: r.ok })), params: KA._lastLaunch && KA._lastLaunch.id === a.id ? KA._lastLaunch.params : {} };
    lsSet(KA.reviewKey(st.slug), q); st.toast('다음 차시(' + forKey + ') 첫 슬라이드에 복습으로 넣어 둘게요'); return true;
  };
  // 무대가 열릴 때: 이 차시 앞으로 보낸 복습이 있으면 표지 뒤에 ①복습 슬라이드를 넣는다(우리 반 판에 저장 → 목차에서 🗑 가능)
  KA.applyPendingReview = function (st) {
    const q = lsGet(KA.reviewKey(st.slug), {}); const r = q[st.key]; if (!r) return false;
    const id = 'act_review_' + st.key; if ((st.plan.added || []).some(s => s.id === id)) { delete q[st.key]; lsSet(KA.reviewKey(st.slug), q); return false; }
    const cover = st.slides.find(s => s.block === 'cover') || st.slides[0];
    const items = r.misses.slice(0, 4).map(m => ({ q: m.label, a: '지난 활동에서 ' + m.miss + '번 헷갈렸어요 — 다시 한 번!' }));
    const sl = { id, stage: cover ? cover.stage : '도입', after: cover ? cover.id : null, block: 'review', data: { title: '지난 활동 다시 보기', content: '「' + r.title + '」에서 헷갈렸던 유형이에요', items, tnote: '지난 차시 「' + r.fromTitle + '」 활동 수첩에서 온 복습 — 유형을 읽고 「왜 헷갈렸을까?」를 먼저 묻는다. 🎲 활동(H)에서 같은 활동을 다시 열어 짧게 확인해도 좋다.', _actReview: { activityId: r.activityId, params: r.params } } };
    st.plan.added.push(sl); delete q[st.key]; lsSet(KA.reviewKey(st.slug), q); st.savePlan(); st.applyPlanKeepIdx();
    if (typeof st.toast === 'function') setTimeout(() => st.toast('지난 활동 수첩에서 온 복습 슬라이드를 표지 뒤에 넣었어요'), 900);
    return true;
  };

  global.KT2_ACTIVITY = KA;
})(typeof window !== 'undefined' ? window : globalThis);

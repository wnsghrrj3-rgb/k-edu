/* ============================================================================
   stage2-learn-act.js — 자기주도 투영(learn.html)의 「🎲 혼자 해 보는 활동」 층 · 활동 13회차(D60) 2026-10-06
   · 활동 쪽은 11회차(D58 카탈로그 전부 solo)·12회차(D59 ⚡혼자 꼴)로 받을 준비가 끝났다 — 이 파일이 그 접점이다.
   · 하는 일: ① 카탈로그 읽기(늦거나 실패하면 활동 없이 차시가 선다 — 차시를 기다리게 하지 않는다)
              ② 이 차시 활동 고르기(KT2_PROJECT.actsFor — live 만 · ?act=all 이면 검수 전도 · ?act=off 면 없음)
              ③ 투영 장에 끼우기(KT2_PROJECT.withActivities) ④ 「▶ 혼자 해 보기」 → 전체 화면 iframe 호스트(브리지 v1, mode solo)
              ⑤ RESULT → 학생 기록 자리(kedu.recordAnswer — 원문 자기주도와 같은 트래커·같은 동의 규칙) · 카드에 결과 한 줄
   · 100점에 안 넣는다 · 넘김을 막지 않는다 — 활동은 덤이다(1학년이 활동에서 막혀 차시를 못 끝내면 안 된다).
   · 제1원칙: 활동은 호스트를 모른다 — URL 과 postMessage 로만 만난다(교사 무대 stage2-activity.js 와 같은 규약).
   ============================================================================ */
(function (global) {
  'use strict';
  const doc = global.document;
  const CATALOG_URL = '/kedu/activities/_CATALOG.json';
  const LOAD_WAIT_MS = 2500, READY_TIMEOUT_MS = 6000, CLOSE_GRACE_MS = 800;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const P = () => global.KT2_PROJECT;
  function isLocalHost() { const l = global.location || {}; return l.protocol === 'file:' || l.hostname === 'localhost' || l.hostname === '127.0.0.1' || !l.hostname; }
  function target() { return isLocalHost() ? '*' : global.location.origin; }
  function qp(k) { try { return new URLSearchParams(global.location.search || '').get(k); } catch (e) { return null; } }

  const LA = { catalog: null, failed: false, session: null, learn: null, results: {} };
  LA.mode = function () { const v = qp('act'); return v === 'off' ? 'off' : v === 'all' ? 'all' : 'live'; };

  // ① 카탈로그 — 기다림에 끝이 있다(LOAD_WAIT_MS). 못 읽으면 활동 없이.
  LA.ready = function () {
    if (LA._p) return LA._p;
    if (LA.mode() === 'off') { LA._p = Promise.resolve(null); return LA._p; }
    if (global.KT2_CATALOG) { LA.catalog = global.KT2_CATALOG; LA._p = Promise.resolve(LA.catalog); return LA._p; }
    if (typeof global.fetch !== 'function') { LA.failed = true; LA._p = Promise.resolve(null); return LA._p; }
    const load = global.fetch(CATALOG_URL).then(r => { if (!r.ok) throw new Error('catalog ' + r.status); return r.json(); }).then(arr => { LA.catalog = Array.isArray(arr) ? arr : []; return LA.catalog; }).catch(() => { LA.failed = true; return null; });
    const wait = new Promise(res => setTimeout(() => res(null), LOAD_WAIT_MS));
    LA._p = Promise.race([load, wait]); return LA._p;
  };
  // ②③ 투영 장에 끼우기 — Learn 생성자가 부른다
  LA.inject = function (slides, q) {
    if (LA.mode() === 'off' || !P() || !P().withActivities) return (slides || []).filter(s => !(s && s.act && !s.act.src));
    const acts = LA.catalog ? P().actsFor(LA.catalog, q, { all: LA.mode() === 'all' }) : [];
    return P().withActivities(slides, acts, LA.catalog || [], q);
  };

  // 카드 아래 학생 층 — 시작 단추 · 끝낸 뒤 결과 한 줄 + 한 번 더
  LA.widget = function (s, st) {
    const a = s.act || {}; const r = st && st.actResult;
    let h = '<div class="lw lw-act' + (r ? ' fin' : '') + '">';
    if (a.status !== 'live') h += '<div class="lw-tip sm la-draft">🔧 검수 전 활동 — 미리보기(?act=all)에서만 보여요</div>';
    if (r) h += '<div class="la-res">' + (r.total ? '✅ 한 판 했어요 — <b>' + esc(r.score) + '</b> / ' + esc(r.total) : '✅ 한 판 했어요' + (r.score != null ? ' — <b>' + esc(r.score) + '</b>' : '')) + '</div>';
    h += '<div class="lw-row"><button class="btn main" data-lact="act-go">' + (r ? '🔁 한 번 더' : '▶ 혼자 해 보기') + '</button>'
      + '<span class="lw-tip">' + (r ? '다음 ▶ 으로 넘어가도 돼요' : '해 봐도 되고, 다음 ▶ 으로 넘어가도 돼요') + '</span></div>';
    return h + '</div>';
  };

  // ④ 전체 화면 호스트
  LA.ensureDom = function () {
    let host = doc.getElementById('la-host'); if (host) return host;
    host = doc.createElement('div'); host.id = 'la-host'; host.className = 'la-host'; doc.body.appendChild(host);
    host.addEventListener('click', e => { const b = e.target.closest('[data-lh]'); if (!b) return; const k = b.getAttribute('data-lh'); if (k === 'close') LA.close(); else if (k === 'retry') LA.frame(); });
    return host;
  };
  LA.isOpen = function () { return !!LA.session; };
  LA.launch = function (learn, s) {
    if (!s || !s.act || !s.act.src) return false;
    if (LA.session) LA.end(null);
    LA.learn = learn; const host = LA.ensureDom();
    LA.session = { s, a: s.act, seed: 1 + Math.floor(Math.random() * 999999), iframe: null, timer: null, at: Date.now() };
    host.innerHTML = '<div class="la-bar"><span class="la-t">🎲 ' + esc(s.act.title || (s.data && s.data.title) || '활동') + '</span><span class="la-solo">🙋 혼자</span><span class="sp"></span><button class="la-x" data-lh="close">닫기 ✕</button></div><div class="la-wait"><div class="la-ic">🎲</div><div>활동을 불러오고 있어요…</div></div>';
    host.classList.add('on'); doc.body.classList.add('la-open');
    LA.frame(); return true;
  };
  LA.frame = function () {
    const ss = LA.session; if (!ss) return; const host = doc.getElementById('la-host');
    if (ss.iframe) { try { host.removeChild(ss.iframe); } catch (e) { } }
    const f = doc.createElement('iframe'); f.className = 'la-frame'; f.setAttribute('allow', 'autoplay'); f.setAttribute('title', ss.a.title || '활동');
    f.src = '/kedu/' + ss.a.src + '?mode=solo&seed=' + ss.seed; ss.iframe = f; host.appendChild(f);
    const w = host.querySelector('.la-wait'); if (w) w.innerHTML = '<div class="la-ic">🎲</div><div>활동을 불러오고 있어요…</div>';
    clearTimeout(ss.timer);
    ss.timer = setTimeout(() => { const w2 = host.querySelector('.la-wait'); if (w2) w2.innerHTML = '<div class="la-ic">😢</div><div>활동을 불러오지 못했어요</div><div class="la-btns"><button class="btn main" data-lh="retry">다시 해 볼래요</button><button class="btn" data-lh="close">닫고 계속 공부하기</button></div>'; }, READY_TIMEOUT_MS);
  };
  LA.onMessage = function (ev) {
    const ss = LA.session; if (!ss || !ss.iframe) return;
    if (ev.source !== ss.iframe.contentWindow) return;
    if (!isLocalHost() && ev.origin !== global.location.origin) return;
    const m = ev.data; if (!m || m.v !== 1) return;
    if (m.t === 'ACTIVITY_READY') {
      clearTimeout(ss.timer); const w = doc.querySelector('#la-host .la-wait'); if (w) w.remove();
      const cfg = { t: 'ACTIVITY_CONFIG', v: 1, mode: 'solo', params: ss.a.params || {}, meta: { mute: LA.learn ? LA.learn.sound === false : false, teamNames: null, roster: null } };
      try { ss.iframe.contentWindow.postMessage(cfg, target()); } catch (e) { }
    } else if (m.t === 'ACTIVITY_RESULT') LA.end(m);
    else if (m.t === 'ACTIVITY_EXIT') LA.end(null);
  };
  if (global.addEventListener) global.addEventListener('message', LA.onMessage);
  LA.close = function () {
    const ss = LA.session; if (!ss) return; let sent = false;
    if (ss.iframe && ss.iframe.contentWindow) { try { ss.iframe.contentWindow.postMessage({ t: 'ACTIVITY_CLOSE', v: 1 }, target()); sent = true; } catch (e) { } }
    setTimeout(() => { if (LA.session === ss) LA.end(null); }, sent ? CLOSE_GRACE_MS : 0);
  };
  // ⑤ 끝 — 결과가 있으면 학생 기록 자리로 · 카드에 한 줄
  LA.end = function (res) {
    const ss = LA.session; if (!ss) return; clearTimeout(ss.timer);
    const host = doc.getElementById('la-host'); if (ss.iframe) { try { host.removeChild(ss.iframe); } catch (e) { } }
    host.classList.remove('on'); host.innerHTML = ''; doc.body.classList.remove('la-open'); LA.session = null;
    const L = LA.learn; if (!L) return;
    if (res) {
      const score = res.score != null ? +res.score : null, total = res.total != null ? +res.total : (res.max != null ? +res.max : null);
      const st = L.ls(ss.s.id); st.actResult = { score, total, at: Date.now() }; st.actRuns = (st.actRuns || 0) + 1;
      LA.results[ss.s.id] = st.actResult;
      // 기록 — 원문 자기주도와 같은 트래커(동의 전 학생·방문자는 트래커·scope 가 막는다). 맞음 = 8할 이상(점수 없는 활동은 끝까지 = 맞음)
      const ok = total ? score != null && score / total >= 0.8 : true;
      try { if (global.kedu && global.kedu.recordAnswer) global.kedu.recordAnswer(L.qid(ss.s), ok, res.durationSec != null ? res.durationSec : Math.round((Date.now() - ss.at) / 1000), null, { src: 'kt2-learn-act', slug: L.slug, activityId: ss.a.id, kind: 'activity', score, total, byType: res.byType || {}, run: st.actRuns }); } catch (e) { }
      L.paint(0, true); if (typeof L.celebrate === 'function') L.celebrate();
    } else if (typeof L.toast === 'function') L.toast('활동을 닫았어요 — 이어서 공부해요');
  };
  LA.count = function () { return Object.keys(LA.results).length; };
  LA.reset = function () { LA.results = {}; };
  if (doc && doc.addEventListener) doc.addEventListener('keydown', e => { if (LA.session && e.key === 'Escape') { e.preventDefault(); LA.close(); } }, true);

  global.KT2_LEARN_ACT = LA;
})(typeof window !== 'undefined' ? window : globalThis);

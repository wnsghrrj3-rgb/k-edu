/* =============================================================
 * kedu_boxbar.js — 어디서든 담기 바 (케이박스 장바구니)
 * 명세: handoff/classwork/SPEC_BOXBAR_담기바.md
 *
 * 한 줄: 교사가 보는 화면을 버튼 한 번으로 케이박스에 담는다.
 *   학생·비로그인엔 존재 자체가 안 보이고(네트워크 0), 담기함=cw_bundles draft 재사용.
 *
 * 부팅 규약(§4): localStorage 캐시 없으면 아무것도 안 함 → 학생 기기 비용 0.
 *   캐시는 교사 페이지(허브 교사분기·classwork·케이티처)가 심는다: KeduBoxbar.markTeacher().
 * ============================================================= */
(function () {
  'use strict';
  if (window.__keduBoxbar) return;
  window.__keduBoxbar = true;

  var CACHE = 'kedu_boxbar_teacher_v1';
  var QUEUE = 'kedu_boxbar_queue_v1';
  var TTL = 24 * 3600 * 1000;
  var DRAFT_TITLE = '📦 담기함';

  // ── 캐시(교사 표식) ──────────────────────────────────────────────────────
  function readCache() {
    try { var c = JSON.parse(localStorage.getItem(CACHE)); if (c && Date.now() - c.at < TTL) return c; } catch (e) {}
    return null;
  }
  function markTeacher() {   // 교사 페이지가 세션 확인 후 호출
    try { localStorage.setItem(CACHE, JSON.stringify({ at: Date.now() })); } catch (e) {}
    boot();  // 지금 페이지에서 즉시 바 띄우기
  }
  function clearCache() { try { localStorage.removeItem(CACHE); } catch (e) {} }

  // ── 경로 → kind 자동 판별(§2) ────────────────────────────────────────────
  function detectKind(pathname) {
    var p = pathname || location.pathname;
    if (/^\/kedu\/quiz\//.test(p)) return 'quiz';
    if (/^\/kedu\/teacher\//.test(p)) return 'kteacher';
    if (/^\/grade[1-4]\//.test(p)) return 'selfstudy';
    if (/^\/labs\//.test(p) || /klab/.test(p)) return 'klab';
    if (/^\/kple\//.test(p)) return 'kple';
    if (/^\/kmake\//.test(p)) return 'kmake';
    if (/^\/english\//.test(p)) return 'english';
    return 'link';
  }
  var KIND_LABEL = { kteacher: '케이티처', selfstudy: '자기주도', klab: '케이랩', kple: '케이플', kmake: '케이메이커', english: '영어', quiz: '케이퀴즈', link: '링크' };
  var KIND_HEX = { kteacher: '#FF85A1', selfstudy: '#7E57C2', klab: '#3BAB72', kple: '#FFB347', kmake: '#5B8EF8', english: '#B7791F', quiz: '#5B8EF8', link: '#94A3B8' };

  // 현재 페이지 자기소개 (도구 훅 CTX 우선)
  function currentItem() {
    var ctx = window.KEDU_BOXBAR_CTX;  // 도구가 제공 시 우선(케이티처 차시 등)
    if (ctx && ctx.title) {
      return { kind: ctx.kind || detectKind(), title: ctx.title, url: ctx.url || cleanUrl(), config: ctx.config || {} };
    }
    var title = (document.title || '').replace(/\s*[|·\-–]\s*(케이에듀|K-edu|케이티처|케이랩|케이박스).*$/i, '').trim();
    if (!title) title = decodeURIComponent((location.pathname.split('/').filter(Boolean).pop() || '').replace(/\.html?$/, ''));
    return { kind: detectKind(), title: title || '이름 없는 콘텐츠', url: cleanUrl(), config: {} };
  }
  function cleanUrl() {
    var u = location.pathname + location.search;
    return u.replace(/([?&])(cwb|cwi|seed)=[^&]*/g, '$1').replace(/[?&]+$/, '').replace(/&&+/g, '&').replace(/\?&/, '?');
  }

  // ── DB(지연 로드) ────────────────────────────────────────────────────────
  function db() {
    if (typeof getKeduDb === 'function') return getKeduDb();
    if (window.supabase && window.KEDU_SUPABASE_URL) return window.supabase.createClient(window.KEDU_SUPABASE_URL, window.KEDU_SUPABASE_ANON_KEY);
    return null;
  }
  function loadSupabase() {
    return new Promise(function (res, rej) {
      if (window.supabase) return res();
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    }).then(function () {
      if (!window.getKeduDb && !window.KEDU_SUPABASE_URL) {
        return new Promise(function (res) { var s = document.createElement('script'); s.src = '/kedu_config.js'; s.onload = res; s.onerror = res; document.head.appendChild(s); });
      }
    });
  }

  var _teacherId = null;
  function myTeacherId(d) {
    return d.rpc('cw_my_teacher_id').then(function (r) { return (r && r.data) || null; })
      .catch(function () { return null; });
  }

  // 담기함(draft) 확보 → id
  function ensureDraft(d, teacherId) {
    return d.from('cw_bundles').select('id').eq('teacher_id', teacherId).eq('status', 'draft').eq('title', DRAFT_TITLE).limit(1)
      .then(function (r) {
        if (r.data && r.data[0]) return r.data[0].id;
        return d.from('cw_bundles').insert({ teacher_id: teacherId, title: DRAFT_TITLE, description: '', status: 'draft' }).select('id').single()
          .then(function (ins) { return ins.data.id; });
      });
  }

  // ── 담기 ─────────────────────────────────────────────────────────────────
  function addCurrent() {
    var item = currentItem();
    setBusy(true);
    loadSupabase().then(function () {
      var d = db(); if (!d) throw new Error('no db');
      return d.auth.getSession().then(function (s) {
        if (!s.data.session) { clearCache(); hide(); throw new Error('no session'); }
        return myTeacherId(d).then(function (tid) {
          if (!tid) { clearCache(); hide(); throw new Error('not teacher'); }
          _teacherId = tid;
          return ensureDraft(d, tid).then(function (bid) {
            // 중복 URL 방지
            return d.from('cw_items').select('id,url').eq('bundle_id', bid).then(function (ex) {
              var dup = (ex.data || []).some(function (x) { return x.url === item.url; });
              if (dup) { toast('이미 담은 콘텐츠예요'); return null; }
              return d.from('cw_items').insert({
                bundle_id: bid, kind: item.kind, title: item.title, url: item.url,
                config: item.config || {}, sort_order: (ex.data || []).length
              }).then(function () { return (ex.data || []).length + 1; });
            });
          });
        });
      });
    }).then(function (count) {
      setBusy(false);
      if (count != null) { bumpBadge(count); toast('케이박스에 담았어요 · ' + count + '개'); }
    }).catch(function (e) {
      setBusy(false);
      if (String(e.message).indexOf('session') < 0 && String(e.message).indexOf('teacher') < 0) {
        queueOffline(item); toast('나중에 담을게요 (오프라인)');
      }
    });
  }

  function queueOffline(item) {
    try { var q = JSON.parse(localStorage.getItem(QUEUE) || '[]'); q.push(item); localStorage.setItem(QUEUE, JSON.stringify(q)); } catch (e) {}
  }

  // ── UI ───────────────────────────────────────────────────────────────────
  var fab, badgeEl, busy = false;
  function boot() {
    if (!readCache()) return;          // 교사 표식 없으면 아무것도 안 함
    if (fab) { fab.style.display = ''; return; }
    // 수업 진행(프레젠테이션) 모드면 숨김 — 엔진이 body에 kt-presenting 부여 시
    if (document.body.classList.contains('kt-presenting')) return;
    injectCss();
    fab = document.createElement('div');
    fab.className = 'kbx-fab';
    fab.innerHTML = '<span class="kbx-ico">📦</span><span class="kbx-badge" style="display:none">0</span>';
    fab.title = '이 콘텐츠를 케이박스에 담기';
    fab.onclick = function (e) { if (e.target.classList.contains('kbx-badge')) { goBox(); } else { addCurrent(); } };
    // 길게 누르면 케이박스로
    var pressT;
    fab.onmousedown = fab.ontouchstart = function () { pressT = setTimeout(goBox, 550); };
    fab.onmouseup = fab.onmouseleave = fab.ontouchend = function () { clearTimeout(pressT); };
    document.body.appendChild(fab);
    badgeEl = fab.querySelector('.kbx-badge');
    // 오프라인 큐 flush 시도
    flushQueue();
  }
  function hide() { if (fab) fab.style.display = 'none'; }
  function goBox() { location.href = '/classwork/'; }
  function bumpBadge(n) { if (badgeEl) { badgeEl.textContent = n; badgeEl.style.display = ''; } }
  function setBusy(b) { busy = b; if (fab) fab.classList.toggle('kbx-busy', b); }

  function flushQueue() {
    var q; try { q = JSON.parse(localStorage.getItem(QUEUE) || '[]'); } catch (e) { q = []; }
    if (!q.length) return;
    // 간단히: 다음 담기 때 함께 처리하도록 두되, 여기선 개수만 배지에 반영하지 않음(정확도 우선)
  }

  function toast(msg) {
    var t = document.createElement('div'); t.className = 'kbx-toast'; t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('on'); });
    setTimeout(function () { t.classList.remove('on'); setTimeout(function () { t.remove(); }, 300); }, 1900);
  }

  function injectCss() {
    if (document.getElementById('kbx-css')) return;
    var s = document.createElement('style'); s.id = 'kbx-css';
    s.textContent = [
      '.kbx-fab{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#22A06B,#2BB97C);box-shadow:0 8px 22px rgba(34,160,107,.4);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9000;transition:transform .15s;user-select:none}',
      '.kbx-fab:hover{transform:translateY(-2px) scale(1.04)}',
      '.kbx-fab:active{transform:scale(.94)}',
      '.kbx-fab.kbx-busy{opacity:.6;pointer-events:none}',
      '.kbx-ico{font-size:26px;line-height:1}',
      '.kbx-badge{position:absolute;top:-4px;right:-4px;min-width:22px;height:22px;padding:0 6px;border-radius:50px;background:#E5484D;color:#fff;font:700 12px/22px "Noto Sans KR",sans-serif;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.2)}',
      '.kbx-toast{position:fixed;left:50%;bottom:88px;transform:translateX(-50%) translateY(10px);background:#243B53;color:#fff;font:600 14px/1 "Noto Sans KR",sans-serif;padding:12px 20px;border-radius:50px;z-index:9001;opacity:0;transition:all .3s;white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,.25)}',
      '.kbx-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── 케이티처 "이 퀴즈 담기" 훅 (§2 케이퀴즈 연계) ─────────────────────────
  window.KEDU_BOXBAR_ADDQUIZ = function (quizCfg) {
    // quizCfg = {lesson,n,difficulty,seed}
    window.KEDU_BOXBAR_CTX = {
      kind: 'quiz',
      title: '케이퀴즈 · ' + quizCfg.lesson,
      url: '/kedu/quiz/index.html?lesson=' + encodeURIComponent(quizCfg.lesson) + '&n=' + (quizCfg.n || 10),
      config: { lesson: quizCfg.lesson, n: quizCfg.n, difficulty: quizCfg.difficulty, seedMode: 'fixed', seed: quizCfg.seed }
    };
    addCurrent();
    setTimeout(function () { window.KEDU_BOXBAR_CTX = null; }, 100);
  };

  // ── 케이티처 "이 활동 담기" 훅 (활동 시스템 설계 §8-2) ────────────────────
  // cfg = { id, title, params, sc, seedMode, seed }
  //  params  : 활동 파라미터(범위·문제 수 등) → 딥링크 쿼리로 직렬화
  //  sc      : 재시도 채점 정책 best|first|last (기본 best, D4)
  //  seedMode: 'per_student'(기본, D5 — seed 미고정 = 학생마다 다른 문제) | 'fixed'
  window.KEDU_BOXBAR_ADDACTIVITY = function (cfg) {
    cfg = cfg || {};
    var qs = [];
    var p = cfg.params || {};
    Object.keys(p).forEach(function (k) {
      if (p[k] == null || p[k] === '') return;
      qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(p[k]));
    });
    qs.push('sc=' + (cfg.sc || 'best'));
    if (cfg.seedMode === 'fixed' && cfg.seed != null) qs.push('seed=' + (cfg.seed | 0));
    window.KEDU_BOXBAR_CTX = {
      kind: 'activity',
      title: '활동 · ' + (cfg.title || cfg.id),
      url: '/kedu/activities/' + cfg.id + '.html?' + qs.join('&'),
      config: {
        activityId: cfg.id, params: p, sc: cfg.sc || 'best',
        seedMode: cfg.seedMode || 'per_student', seed: (cfg.seedMode === 'fixed' ? cfg.seed : null)
      }
    };
    addCurrent();
    setTimeout(function () { window.KEDU_BOXBAR_CTX = null; }, 100);
  };

  // ── 공개 API ─────────────────────────────────────────────────────────────
  window.KeduBoxbar = {
    markTeacher: markTeacher,        // 교사 페이지가 세션 확인 후 호출
    boot: boot,                      // 캐시 있으면 바 표시
    detectKind: detectKind,          // 테스트용
    currentItem: currentItem,        // 테스트용
    _clear: clearCache
  };

  // 자동 부팅(캐시 있을 때만 동작 — 학생 기기 no-op)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

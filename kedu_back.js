/* ============================================================
   케이에듀 공용 돌아가기 버튼 (2026-07-25)
   목적: 모든 도구 화면에서 같은 자리(좌측 상단)·같은 문구·같은 모양.
   규칙:
     · 선생님 도구(/?role=teacher)에서 들어온 흐름 → 「← 선생님 도구」 → /?role=teacher
     · 그 외(학생·직접 진입 등)                   → 「🏠 케이에듀로 가기」 → /
     · 판단은 referrer + sessionStorage(같은 탭에서는 새로고침해도 유지)
   사용:
     <script src="/kedu_back.js"></script>                       → fixed 좌상단 흰 필 버튼
     <script src="/kedu_back.js" data-mount=".topbar"></script>  → 해당 요소 맨 앞에 인라인 삽입
     <script src="/kedu_back.js" data-mode="context"></script>   → 버튼 없이 window.KEDU_BACK만 제공
   제공: window.KEDU_BACK = { el, label, href, fromTeacher }
   ============================================================ */
(function () {
  var KEY = 'kedu_from_teacher';

  /* 0) 전면 롤아웃 가드 — 중복 로드 / iframe 임베드 / 홈 자체에서는 조용히 물러남 */
  try {
    if (document.getElementById('kedu-back')) return;              // 이미 버튼 있음
    if (window.top !== window) return;                             // 도구가 오버레이/iframe 으로 박힌 경우
    if (location.pathname === '/' || location.pathname === '/index.html') return;  // 홈에서 홈으로는 무의미
  } catch (e) {}

  /* 1) 진입 맥락 갱신 — 케이에듀 홈에서 넘어온 순간에만 기록을 덮어쓴다 */
  try {
    var ref = document.referrer || '';
    if (ref === location.origin || ref.indexOf(location.origin + '/') === 0) {
      var u = new URL(ref);
      if (u.pathname === '/' || u.pathname === '/index.html') {
        var t = /(\?|&)role=teacher(&|$)/.test(u.search) || u.hash === '#teacher';
        sessionStorage.setItem(KEY, t ? '1' : '0');
      }
    }
  } catch (e) {}

  var fromTeacher = false;
  try { fromTeacher = sessionStorage.getItem(KEY) === '1'; } catch (e) {}

  /* 1.5) 발자국 트레일 — 같은 탭에서 들어온 길을 그대로 한 층씩 되짚어 나간다.
     · 페이지 로드마다 현재 URL push (연속 중복 제외 · 되짚기 도착이면 제외)
     · 나가기 = pop 후 이전 발자국으로 이동. 발자국이 없으면 홈(또는 선생님 도구). */
  var TRAIL = 'kedu_back_trail_v1', BACKFLAG = 'kedu_back_going_v1', CAP = 40;
  function readTrail() { try { var t = JSON.parse(sessionStorage.getItem(TRAIL)); return Array.isArray(t) ? t : []; } catch (e) { return []; } }
  function writeTrail(t) { try { sessionStorage.setItem(TRAIL, JSON.stringify(t.slice(-CAP))); } catch (e) {} }
  var here = location.pathname + location.search;
  var trail = readTrail();
  var arrivedByBack = false;
  try { arrivedByBack = sessionStorage.getItem(BACKFLAG) === '1'; sessionStorage.removeItem(BACKFLAG); } catch (e) {}
  if (!arrivedByBack && trail[trail.length - 1] !== here) { trail.push(here); writeTrail(trail); }

  var prev = null;
  for (var ti = trail.length - 2; ti >= 0; ti--) {          // 바로 아래 발자국(자기 자신 제외)
    if (trail[ti] !== here) { prev = trail[ti]; break; }
  }

  function goBack() {
    var t = readTrail();
    while (t.length && t[t.length - 1] === here) t.pop();   // 현재 층 제거
    var target = null;
    while (t.length) {                                       // 혹시 남은 중복도 걷어냄
      var cand = t[t.length - 1];
      if (cand !== here) { target = cand; break; }
      t.pop();
    }
    if (target) {
      t.pop(); t.push(target); writeTrail(t);                // 트레일 = 도착지까지
      try { sessionStorage.setItem(BACKFLAG, '1'); } catch (e) {}
      location.href = target;
    } else {
      writeTrail([]);
      location.href = fromTeacher ? '/?role=teacher' : '/';
    }
  }

  var label = prev ? '← 나가기' : (fromTeacher ? '← 선생님 도구' : '🏠 케이에듀로 가기');
  var href  = prev ? prev : (fromTeacher ? '/?role=teacher' : '/');

  var script = document.currentScript ||
    (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var mode  = script && script.getAttribute('data-mode');
  var mount = script && script.getAttribute('data-mount');

  window.KEDU_BACK = { el: null, label: label, href: href, fromTeacher: fromTeacher, go: goBack };
  if (mode === 'context') return; /* 버튼 없이 맥락만 제공 (케이뮤지엄·케이메이크처럼 자체 버튼이 있는 화면) */

  /* 2) 공용 스타일 (1회 주입) */
  if (!document.getElementById('kedu-back-style')) {
    var css = ''
      + '#kedu-back{display:inline-flex;align-items:center;gap:6px;padding:9px 15px;'
      + 'border-radius:12px;border:none;background:#fff;color:#1a2540;font-weight:800;'
      + 'font-size:14px;line-height:1;text-decoration:none;cursor:pointer;'
      + 'box-shadow:0 2px 10px rgba(0,0,0,.22);font-family:inherit;white-space:nowrap;'
      + 'transition:transform .15s,box-shadow .15s}'
      + '#kedu-back:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(0,0,0,.26)}'
      + '#kedu-back.kb-fixed{position:fixed;top:14px;left:14px;z-index:9999}'
      + '#kedu-back.kb-inline{padding:7px 13px;font-size:13px;box-shadow:none;'
      + 'border:1.5px solid rgba(0,0,0,.12);margin-right:12px;flex-shrink:0}'
      + '@media(max-width:640px){#kedu-back{font-size:12.5px;padding:8px 12px}}';
    var st = document.createElement('style');
    st.id = 'kedu-back-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* 3) 버튼 생성 */
  function build() {
    if (document.getElementById('kedu-back')) return;
    var a = document.createElement('a');
    a.id = 'kedu-back';
    a.href = href;
    a.textContent = label;
    a.title = prev ? '한 층 나가기' : (fromTeacher ? '선생님 도구로 돌아가기' : '케이에듀 시작 화면으로');
    a.onclick = function (e) { e.preventDefault(); goBack(); };
    var target = mount ? document.querySelector(mount) : null;
    if (target) { a.className = 'kb-inline'; target.insertBefore(a, target.firstChild); }
    else { a.className = 'kb-fixed'; document.body.appendChild(a); }
    window.KEDU_BACK.el = a;
  }
  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();

/* ============================================================
   K-edu 교사 전용 게이트 (kedu_teacher_gate.js)
   ------------------------------------------------------------
   2026-08-27 — 준호 결정: 교사 공간(케이티처·케이플/케이배틀 호스트·케이박스·
   라이브 교사·케이랩 교사 허브)은 「승인된 교사」만 사용한다.
   학급코드 발급만 잠그면 학부모·일반 가입자가 교사 도구를 그대로 쓸 수 있기 때문.

   - 페이지 삽입: <script src="/kedu_teacher_gate.js"></script> 한 줄.
   - 판정: Supabase 세션 → teachers.approval ∈ ('auto','approved').
   - 통과는 sessionStorage 5분 캐시 (수업 중 매 화면 쿼리 방지).
   - 미통과는 전체 화면 잠금 카드 — 상태별 안내:
       · 로그인 없음      → 교사 로그인 안내 (/auth/)
       · teachers 행 없음 → 교사 계정 아님 (학부모 등)
       · pending/rejected → 교사 확인 안내 (/teacher/ 대시보드 신청 배너)
   - 학생 도구(/maker/·/kbattle/·케이랩 본체 등)는 이 게이트 대상이 아니다 —
     그쪽은 KeduTier(학급 개방 체계)가 담당한다.
   - DB(RLS)는 이미 잠겨 있으므로 이 게이트는 화면 층의 자리 지킴이다.
   ============================================================ */
(function () {
  'use strict';

  var CACHE_KEY = 'kedu_tgate_v1';
  var CACHE_MS  = 5 * 60 * 1000;

  try {
    var c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (c && c.ok === true && (Date.now() - c.at) < CACHE_MS) return;
  } catch (e) {}

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.async = false;
      s.onload = res; s.onerror = function () { rej(new Error('load fail ' + src)); };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  function overlay(icon, title, body, btnLabel, btnHref, retry) {
    function paint() {
      if (document.getElementById('ktg-ov')) return;
      var d = document.createElement('div');
      d.id = 'ktg-ov';
      d.setAttribute('style',
        'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;' +
        'background:#f6f4ef;font-family:Pretendard,-apple-system,"Noto Sans KR",sans-serif;padding:20px;');
      d.innerHTML =
        '<div style="max-width:420px;width:100%;background:#fff;border:1px solid #e3e0d8;border-radius:20px;' +
          'padding:36px 30px;text-align:center;box-shadow:0 12px 40px rgba(30,40,60,.08)">' +
          '<div style="font-size:44px;margin-bottom:14px">' + icon + '</div>' +
          '<div style="font-size:19px;font-weight:800;color:#22301f;margin-bottom:10px">' + title + '</div>' +
          '<div style="font-size:14px;line-height:1.7;color:#5c6a58;margin-bottom:22px">' + body + '</div>' +
          '<a href="' + btnHref + '" style="display:inline-block;background:#2e4a34;color:#fff;text-decoration:none;' +
            'font-size:14px;font-weight:700;padding:12px 22px;border-radius:12px">' + btnLabel + '</a>' +
          (retry
            ? '<button onclick="sessionStorage.removeItem(\'' + CACHE_KEY + '\');location.reload()" ' +
              'style="display:block;margin:14px auto 0;background:none;border:none;color:#8a93a8;' +
              'font-size:13px;cursor:pointer;text-decoration:underline">다시 확인</button>'
            : '') +
          '<div style="margin-top:18px"><a href="/" style="font-size:12px;color:#9aa39a;text-decoration:none">← 케이에듀 홈</a></div>' +
        '</div>';
      document.body.appendChild(d);
      document.documentElement.style.overflow = 'hidden';
    }
    if (document.body) paint();
    else document.addEventListener('DOMContentLoaded', paint);
  }

  function ensureDb() {
    var p = Promise.resolve();
    if (!window.supabase) p = p.then(function () { return loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'); });
    if (typeof window.getKeduDb !== 'function') p = p.then(function () { return loadScript('/kedu_config.js'); });
    return p.then(function () { return window.getKeduDb(); });
  }

  ensureDb().then(function (db) {
    return db.auth.getSession().then(function (r) {
      var session = r && r.data && r.data.session;
      if (!session) {
        overlay('🍎', '선생님을 위한 공간이에요',
          '교사 계정으로 로그인하면 이용할 수 있어요.<br>학생은 케이에듀 홈에서 학급코드로 입장해요.',
          '교사 로그인 →', '/auth/', false);
        return;
      }
      return db.from('teachers').select('approval').eq('user_id', session.user.id).maybeSingle()
        .then(function (q) {
          var row = q && q.data;
          if (q && q.error) {
            overlay('📡', '연결을 확인해 주세요',
              '교사 확인 정보를 불러오지 못했어요.<br>잠시 후 「다시 확인」을 눌러 주세요.',
              '교사 대시보드 →', '/teacher/', true);
            return;
          }
          if (!row) {
            /* 확인 메일 뒤 첫 접속 — 교사로 가입했지만 teachers 행이 아직 없다.
               교사 대시보드가 user_metadata 로 행을 만들어 주므로 그리로 보낸다 (2026-09-02). */
            var meta = (session.user && session.user.user_metadata) || {};
            if (meta.role === 'teacher' || meta.teacher_name) {
              overlay('🍎', '교사 정보를 마무리할게요',
                '가입은 됐고, 교사 대시보드에 한 번 들르면 준비가 끝나요.',
                '교사 대시보드 →', '/teacher/', false);
              return;
            }
            overlay('🍎', '교사 계정이 아니에요',
              '이 공간은 교사 확인을 마친 선생님만 사용할 수 있어요.<br>학부모님은 학부모 대시보드를 이용해 주세요.',
              '학부모 대시보드 →', '/parent/', false);
            return;
          }
          if (row.approval === 'auto' || row.approval === 'approved' || row.approval === undefined || row.approval === null) {
            /* approval 이 null/undefined = 승인 SQL 미적용 구버전 DB — 종전대로 통과 */
            try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ok: true, at: Date.now() })); } catch (e) {}
            return;
          }
          overlay('🔑', '교사 확인 후 열려요',
            row.approval === 'rejected'
              ? '교사 확인이 반려된 상태예요.<br>교사 대시보드에서 학교명·직위를 적어 다시 신청해 주세요.'
              : '가입은 완료됐고, 교사 확인만 남았어요.<br>교사 대시보드의 안내 배너에서 학교명·직위를 적어 신청하면<br>관리자가 확인한 뒤 열려요.',
            '교사 대시보드에서 신청 →', '/teacher/', true);
        });
    });
  }).catch(function () {
    overlay('📡', '연결을 확인해 주세요',
      '네트워크가 불안정해요. 잠시 후 「다시 확인」을 눌러 주세요.',
      '케이에듀 홈 →', '/', true);
  });
})();

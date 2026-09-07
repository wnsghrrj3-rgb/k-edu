/* =============================================================
 * kedu_artifact.js — 도구 산출물 「선생님께 보내기」 공용 어댑터 (2026-09-07)
 * 설계: handoff/kedu/케이학습지_3종_설계_v2.md §4-5 「2층」 — 케이박스로 열려 들어온 학생 화면의
 *       도구 안에서 버튼 한 번으로 산출물(그림)이 교사 케이박스에 꽂힌다. 저장 위치 고민 0.
 *
 * 한 줄: 도구는 그림 캡처 함수 하나만 등록한다 → 나머지(썸네일·저장소·결과봉투·복귀)는 여기.
 *
 *   KeduArtifact.register({
 *     tool: 'kmake',                                   // 결과봉투 tool 이름
 *     capture: async () => ({ pages: [dataURL, ...], title }) // PNG dataURL 1장 이상. 만들기 전이면 null.
 *   });
 *
 * 흐름: 케이박스 밖(cwb/cwi 없음) = 아무것도 안 그린다.
 *       케이박스 안 = kedu_back.js 의 「✓ 다 했어요」 띠 단추가 「📤 선생님께 보내기」로 바뀐다.
 *       누르면 ①capture ②썸네일(JPEG ≤480px, 봉투에 동봉 — 저장소 없이도 교사가 본다)
 *       ③원본 PNG 를 storage `perf` 버킷에 (경로 규약 {class_code_id}/box-{cwb}/{student_id}-{cwi}-{n}.png)
 *       ④KBox.submit({kind:'artifact', thumb, artifact_paths, pages}) → kedu_back 의 자동 복귀가 받은 박스로.
 *       저장소가 없거나 막히면 ③만 빠지고 나머지는 그대로(정직: 봉투에 storage:'skipped').
 * 로드 전제: kedu_config.js + supabase-js + kedu_kbox_adapter.js + kedu_back.js (순서 무관, 20초간 살핀다).
 * ============================================================= */
(function () {
  'use strict';
  if (window.KeduArtifact) return;

  var q = new URLSearchParams(location.search);
  var cwb = q.get('cwb'), cwi = q.get('cwi');
  var ACTIVE = !!(cwb && cwi);
  var reg = null, busy = false;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
      setTimeout(function () { rej(new Error('timeout ' + src)); }, 8000);
    });
  }
  /* 도구 화면이 supabase 를 안 실었을 수도 있다(케이메이커는 게이트가 지연 로드) — 보낼 때만 챙긴다 */
  async function client() {
    try {
      if (window.sb) return window.sb;
      if (typeof window.getKeduDb === 'function') { try { var d = window.getKeduDb(); if (d) return d; } catch (e) {} }
      if (!window.supabase) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      if (typeof window.getKeduDb !== 'function') await loadScript('/kedu_config.js');
      return typeof window.getKeduDb === 'function' ? window.getKeduDb() : null;
    } catch (e) { return null; }
  }

  /* dataURL → 축소 JPEG dataURL (봉투 동봉용) */
  function thumbOf(dataUrl, maxW) {
    return new Promise(function (res) {
      var im = new Image();
      im.onload = function () {
        var s = Math.min(1, (maxW || 480) / Math.max(1, im.width));
        var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * s)); c.height = Math.max(1, Math.round(im.height * s));
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.72));
      };
      im.onerror = function () { res(null); };
      im.src = dataUrl;
    });
  }
  function toBlob(dataUrl) {
    try {
      var p = dataUrl.split(','), mime = (p[0].match(/data:([^;]+)/) || [])[1] || 'image/png';
      var bin = atob(p[1]), u8 = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return new Blob([u8], { type: mime });
    } catch (e) { return null; }
  }

  async function profile(db) {
    try {
      var s = await db.auth.getSession(); var uid = s && s.data && s.data.session && s.data.session.user && s.data.session.user.id;
      if (!uid) return null;
      var r = await db.from('student_profiles').select('id, class_code_id').eq('user_id', uid).maybeSingle();
      return r && r.data && r.data.class_code_id ? r.data : null;
    } catch (e) { return null; }
  }

  async function upload(db, pages) {
    var pf = await profile(db);
    if (!pf) return { status: 'no_profile', paths: [] };
    var paths = [];
    for (var i = 0; i < pages.length; i++) {
      var blob = toBlob(pages[i]); if (!blob) continue;
      var path = pf.class_code_id + '/box-' + cwb + '/' + pf.id + '-' + cwi + '-' + (i + 1) + '.png';
      try {
        var r = await db.storage.from('perf').upload(path, blob, { upsert: true, contentType: 'image/png' });
        if (r && r.error) return { status: 'storage_error', message: r.error.message, paths: paths };
        paths.push(path);
      } catch (e) { return { status: 'storage_error', message: String(e && e.message || e), paths: paths }; }
    }
    return { status: 'ok', paths: paths };
  }

  function note(msg) {
    var n = document.getElementById('kedu-artifact-note');
    if (!n) {
      n = document.createElement('div'); n.id = 'kedu-artifact-note';
      n.style.cssText = 'position:fixed;left:50%;bottom:calc(64px + env(safe-area-inset-bottom,0));transform:translateX(-50%);z-index:2147483001;background:#1a2540;color:#fff;font-weight:800;font-size:15px;padding:12px 18px;border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,.3);font-family:inherit;white-space:nowrap';
      document.body.appendChild(n);
    }
    n.textContent = msg; n.style.display = '';
    return n;
  }

  async function send() {
    if (busy || !reg) return;
    busy = true;
    var btn = document.querySelector('#kedu-kbox-bar .kb-done');
    try {
      note('그림을 모으는 중…');
      var cap = await reg.capture();
      if (!cap || !cap.pages || !cap.pages.length) { note('아직 만든 것이 없어요 — 먼저 만들어 보세요'); setTimeout(hideNote, 2200); busy = false; return; }
      var pages = cap.pages.slice(0, 12);
      var thumb = await thumbOf(pages[0], 480);
      var db = await client(), up = { status: 'no_client', paths: [] };
      if (db) { note('선생님께 보내는 중…'); up = await upload(db, pages); }
      if (!window.KBox || typeof window.KBox.submit !== 'function') throw new Error('kbox adapter 없음');
      if (sentBefore && window.KBox._resetTimer) window.KBox._resetTimer();
      var r = await window.KBox.submit({
        tool: reg.tool || 'tool', kind: 'artifact', score: null, max: null,
        artifact_url: null,
        detail: { title: cap.title || '', pages: pages.length, thumb: thumb, artifact_paths: up.paths, storage: up.status === 'ok' ? 'ok' : 'skipped', storage_note: up.status !== 'ok' ? (up.message || up.status) : null }
      });
      if (!r || (r.status && r.status !== 'ok')) throw new Error((r && (r.message || r.status)) || '제출 실패');
      sentBefore = true;
      note('선생님께 보냈어요 🎉');
      if (btn) { btn.textContent = '✓ 보냈어요'; }
      /* kedu_back 의 자동 복귀가 KBox.submit ok 를 보고 받은 박스로 데려간다 — 혹시 안 걸렸으면 여기서 */
      setTimeout(function () { try { if (window.KEDU_BACK && window.KEDU_BACK.kbox) location.href = window.KEDU_BACK.kbox.done; } catch (e) {} }, 1600);
    } catch (e) {
      note('보내지 못했어요 — 한 번 더 눌러 보세요'); setTimeout(hideNote, 2600);
      busy = false;
    }
  }
  var sentBefore = false;
  function hideNote() { var n = document.getElementById('kedu-artifact-note'); if (n) n.style.display = 'none'; }

  /* kedu_back 의 띠를 찾아 단추를 바꾼다 (띠는 DOMContentLoaded 뒤 생김 — 20초간 살핀다) */
  function arm() {
    if (!ACTIVE || !reg) return;
    var tries = 0;
    (function tick() {
      var a = document.querySelector('#kedu-kbox-bar .kb-done');
      if (a) {
        if (!a.__artifact) {
          a.__artifact = true;
          a.textContent = '📤 선생님께 보내기';
          a.href = '#';
          a.onclick = function (e) { e.preventDefault(); e.stopPropagation(); send(); };
        }
        return;
      }
      if (tries++ < 100) setTimeout(tick, 200);
    })();
  }

  window.KeduArtifact = {
    active: ACTIVE,
    register: function (opt) {
      if (!opt || typeof opt.capture !== 'function') return false;
      reg = { tool: opt.tool || 'tool', capture: opt.capture };
      arm();
      return ACTIVE;
    },
    send: send,
    _thumbOf: thumbOf
  };
})();

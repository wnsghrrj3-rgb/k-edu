/* ============================================================
 * K-edu 영어 v3 — KProgress (진행 엔진 v1 / 동기 M1)
 * 단일 원천: 사다리 지도·종료 카드·도감(M2)이 전부 이것 하나를 본다.
 *
 * 칸 상태 (_V3_ENGAGEMENT 데이터 규칙):
 *   'lit'      점등(정상 통과) — 영구, 어떤 실패로도 꺼지지 않음
 *   'lit_skip' 점등(먼저 풀기 통과) — 아이 화면에선 lit과 동일한 불
 *   'open'     지금 도전 가능한 칸 (사슬: 첫 미점등 칸 하나만)
 *   'locked'   아직 잠김
 *
 * 먼저 풀기 규칙: open 칸에서 게이트② 직행. 실패 기록 시 그 칸은
 * 본 차시 진행으로 전환(재도전 불가). ★합류·미션 칸은 먼저 풀기 자체 불가.
 *
 * 저장: localStorage 'kedu-en-v3-progress' (v1).
 * 나중에 Supabase 동기화는 load/save 두 함수만 어댑터 교체.
 * ============================================================ */
(function (global) {
  'use strict';
  var KEY = 'kedu-en-v3-progress';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { lit: {}, skipFailed: {}, entry: null }; }
    catch (e) { return { lit: {}, skipFailed: {}, entry: null }; }
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }

  function steps() {
    var lv = (global.EN_LADDER && global.EN_LADDER.levels || []).find(function (l) { return l.open; });
    return lv ? lv.steps : [];
  }

  var KProgress = {
    /* 칸 상태 — 사슬 규칙 적용 */
    state: function (stepId) {
      var d = load(), ss = steps(), openFound = false;
      for (var i = 0; i < ss.length; i++) {
        var s = ss[i], rec = d.lit[s.id];
        if (s.id === stepId) {
          if (rec) return rec.skip ? 'lit_skip' : 'lit';
          return openFound ? 'locked' : 'open';
        }
        if (!d.lit[s.id]) openFound = true;
      }
      return 'locked';
    },

    /* 지금 도전 칸 (첫 미점등) — 없으면 null(레벨 완주) */
    current: function () {
      var d = load(), ss = steps();
      for (var i = 0; i < ss.length; i++) if (!d.lit[ss[i].id]) return ss[i];
      return null;
    },

    /* 다음 칸 (현재 칸의 바로 다음 — 종료 카드 예고용) */
    next: function () {
      var d = load(), ss = steps(), seen = false;
      for (var i = 0; i < ss.length; i++) {
        if (seen) return ss[i];
        if (!d.lit[ss[i].id]) seen = true;
      }
      return null;
    },

    /* 점등 — 영구. skip=true면 먼저 풀기 통과 */
    light: function (stepId, opt) {
      var d = load();
      if (!d.lit[stepId]) {
        d.lit[stepId] = { at: Date.now(), skip: !!(opt && opt.skip) };
        save(d);
      }
      return d.lit[stepId];
    },

    /* 먼저 풀기 가능 여부 */
    canSkip: function (step) {
      if (!step || step.star || step.mission) return false;     /* ★합류·미션 불가 */
      if (this.state(step.id) !== 'open') return false;         /* 사슬: open 칸만 */
      var d = load();
      return !d.skipFailed[step.id];                            /* 실패 후 재도전 불가 */
    },

    /* 먼저 풀기 실패 기록 → 본 차시 진행으로 전환 */
    failSkip: function (stepId) {
      var d = load(); d.skipFailed[stepId] = Date.now(); save(d);
    },

    counts: function () {
      var d = load(), ss = steps(), n = 0;
      ss.forEach(function (s) { if (d.lit[s.id]) n++; });
      return { lit: n, total: ss.length };
    },

    /* 오늘 점등한 칸 수 (종료 카드용) */
    today: function () {
      var d = load(), t0 = new Date(); t0.setHours(0, 0, 0, 0);
      var n = 0;
      Object.keys(d.lit).forEach(function (k) { if (d.lit[k].at >= t0.getTime()) n++; });
      return n;
    },

    /* ── 종료 카드 — 차시 끝·점등 직후 호출. 오버레이로 띄움 ── */
    showEndCard: function (opt) {
      opt = opt || {};
      var next = this.next();
      var c = this.counts();
      var old = document.getElementById('kp-endcard'); if (old) old.remove();
      var wrap = document.createElement('div');
      wrap.id = 'kp-endcard';
      wrap.style.cssText = 'position:fixed;inset:0;background:rgba(20,25,40,.45);z-index:90;display:flex;align-items:center;justify-content:center;padding:20px;';
      wrap.innerHTML =
        '<div style="background:#fff;border-radius:24px;max-width:380px;width:100%;padding:26px 22px;text-align:center;font-family:\'Noto Sans KR\',sans-serif;box-shadow:0 18px 50px rgba(0,0,0,.25);animation:kpPop .35s ease;">'
        + '<div style="font-size:44px;">' + (opt.emoji || '✨') + '</div>'
        + '<div style="font-family:Jua,sans-serif;font-size:22px;color:#1A202C;margin:6px 0 2px;">'
          + (opt.title || '칸에 불이 켜졌어요!') + '</div>'
        + (opt.stepName ? '<div style="font-size:15px;color:#4A5568;margin-bottom:10px;">오늘 오른 칸 — <b>' + opt.stepName + '</b></div>' : '')
        + '<div style="display:flex;gap:8px;justify-content:center;margin:12px 0;">'
          + '<div style="background:#EBF4FF;border-radius:14px;padding:10px 16px;"><div style="font-family:Jua;font-size:20px;color:#1565C0;">' + c.lit + ' / ' + c.total + '</div><div style="font-size:12px;color:#718096;">밝힌 칸</div></div>'
          + '<div style="background:#FFF6E6;border-radius:14px;padding:10px 16px;"><div style="font-family:Jua;font-size:20px;color:#D97706;">' + this.today() + '칸</div><div style="font-size:12px;color:#718096;">오늘</div></div>'
        + '</div>'
        + (next
            ? '<div style="background:#F0FDF4;border:2px dashed #34D399;border-radius:14px;padding:10px 14px;font-size:14px;color:#065F46;">다음 칸은 <b>' + next.name + '</b> <span style="color:#10B981;">(' + next.en + ')</span></div>'
            : '<div style="background:#F0FDF4;border-radius:14px;padding:10px;font-size:15px;color:#065F46;font-weight:700;">🏆 레벨 완주! 다음 레벨이 열려요!</div>')
        + '<button onclick="document.getElementById(\'kp-endcard\').remove()" style="margin-top:16px;font-family:Jua,sans-serif;font-size:18px;background:#1565C0;color:#fff;border:0;border-radius:14px;padding:12px 36px;cursor:pointer;">좋아!</button>'
        + '</div>';
      if (!document.getElementById('kpPopCss')) {
        var st = document.createElement('style'); st.id = 'kpPopCss';
        st.textContent = '@keyframes kpPop{0%{opacity:0;transform:scale(.85)}100%{opacity:1;transform:scale(1)}}';
        document.head.appendChild(st);
      }
      document.body.appendChild(wrap);
    },

    /* ── 입구 시험(레벨 점프) — 시작 레벨 기록. startedLv 이하 레벨은 일괄 인정 ── */
    setEntry: function (levelId) {
      var d = load(); d.entry = levelId; save(d);
    },
    entry: function () { return load().entry; },
    /* 첫 진입 여부 (시작 선택 화면 노출 조건) */
    isFresh: function () {
      var d = load();
      return !d.entry && Object.keys(d.lit).length === 0;
    },

    /* 검수·디버그용 초기화 */
    _reset: function () { localStorage.removeItem(KEY); }
  };

  global.KProgress = KProgress;
})(window);

/* ============================================================
 * K-edu 영어 v3 — 단어 도감 (동기 M2)
 * 명세: _V3_ENGAGEMENT.md §3 — "내가 읽어낸 단어"가 도감에 수집.
 *   - 차시 끝에서 add() 호출 → 처음 해독한 단어가 입고.
 *   - 누적 수 = 8레벨 진행도(목표 2400 = 도감 완성 = 완주).
 *   - 칸·도감은 영구(진행 데이터). SM-2 복습 큐는 이후 어휘 도구에서 같은 저장소 확장.
 * 저장: localStorage 단일 키. 항목 = { first, last, n }(처음/마지막 입고일·읽은 횟수).
 * ============================================================ */
window.KCollection = (function () {
  var KEY = 'kedu_en_dogam';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(o) {
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  return {
    /* words: ['cat','hat'] 또는 [{w:'cat'}] — 차시가 "오늘 읽어낸 단어"를 넘김
       반환: { added: 이번에 처음 입고된 수, total: 도감 누적 수 } */
    add: function (words) {
      var o = load(), t = today(), added = 0;
      (words || []).forEach(function (item) {
        var w = (typeof item === 'string') ? item : (item && item.w);
        if (!w) return;
        if (!o[w]) { o[w] = { first: t, n: 0 }; added++; }
        o[w].n++; o[w].last = t;
      });
      save(o);
      return { added: added, total: Object.keys(o).length };
    },
    count: function () { return Object.keys(load()).length; },
    list:  function () { return Object.keys(load()); },
    has:   function (w) { return !!load()[w]; },
    _reset: function () { save({}); }   /* 검수·초기화용 */
  };
})();

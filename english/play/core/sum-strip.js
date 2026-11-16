/* ============================================================
 * 영어 놀이터 — 셈 띠(PlaySum) (준호 11-16 「사과가 1+1+1=3개라는 것도 같이」 · WM1)
 *   모은 것을 덧셈 줄로 보여 준다. 하나 넣을 때마다 한 칸씩 자란다:  1  →  1 + 1 = 2  →  1 + 1 + 1 = 3
 *   더하는 수마다 그 물건 그림이 위에 붙는다(수 = 물건 몇 개 — 1학년 「9까지의 수 · 덧셈」).
 *   글은 수와 기호뿐(+ =) — 영어 낱말을 늘리지 않는다. 점수 · 타이머가 아니다(모은 물건의 수).
 *   PlaySum.line([1, 1, 1])         → [{k:'n',v:1,pic:true}, {k:'op',v:'+'}, …, {k:'op',v:'='}, {k:'sum',v:3}]
 *   PlaySum.html(addends, { art, fresh }) → 띠 안의 마크업(art = 그림 마크업 · fresh = 새로 붙은 칸 수만큼 끝에서 톡)
 * ============================================================ */
(function (g) {
  'use strict';
  function line(addends) {
    var a = (addends || []).filter(function (x) { return x > 0; }), out = [];
    a.forEach(function (v, i) { if (i) out.push({ k: 'op', v: '+' }); out.push({ k: 'n', v: v, pic: true }); });
    if (a.length > 1) { out.push({ k: 'op', v: '=' }); out.push({ k: 'sum', v: a.reduce(function (s, v) { return s + v; }, 0) }); }
    return out;
  }
  function html(addends, o) {
    o = o || {}; var t = line(addends), fresh = o.fresh || 0;
    return t.map(function (x, i) {
      var cls = 'sm-' + x.k + (i >= t.length - fresh ? ' sm-new' : ''), d = ' style="--i:' + Math.max(0, i - (t.length - fresh)) + '"';
      if (x.k === 'n') return '<span class="' + cls + '"' + d + '>' + (x.pic && o.art ? '<span class="sm-pic">' + o.art + '</span>' : '') + '<b>' + x.v + '</b></span>';
      return '<span class="' + cls + '"' + d + '>' + x.v + '</span>';
    }).join('');
  }
  g.PlaySum = { line: line, html: html, total: function (a) { return line(a).filter(function (x) { return x.k === 'sum'; }).map(function (x) { return x.v; })[0] || (a && a[0]) || 0; } };
})(window);

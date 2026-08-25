/* gens/math/treasure_mix.js — 수학 보물 탐험: 1학기 5단원 복습 혼합기 (1학년 수학 6단원)
 * 순수 함수·DOM 무관 (§9-3). **문항을 새로 만들지 않는다** — 기존 생성기 7종에 위임한다.
 *   1단원 count9 · 2단원 shape3d · 3단원 split_gather·compose10 · 4단원 compare_weight · 5단원 count_bundle·compare50
 * 경로: 1→2→3→4→5단원 순환. 주자 20명이면 단원당 4문항 — 반 전체가 1학기를 한 바퀴 돈다.
 *
 * type = 단원 키 (D31, §21-3 확정 2026-08-25)
 *   u1_count · u2_shape · u3_addsub · u4_compare · u5_count50
 *   부품의 원래 유형(small·tricky·gather_large …)은 `sub`에 남긴다. 수첩은 "어느 단원을 되짚을까"를 묻는다.
 * next() → 부품 문항 그대로 + { src, type(단원), sub(부품 유형), unit }
 *   a·b·shown·explain은 부품 것을 그대로 지나간다 — §6-9·§6-10 게이트가 그 자리에서 읽는다.
 * check(pick, p) → 부품의 check에 위임.
 *
 * 브라우저: 부품 7종이 먼저 로드돼야 한다 (카탈로그 `gens` — 조립기가 gen보다 먼저 인라인).
 * node: 형제 파일을 require.
 */
(function (root, factory) {
  var g = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['treasure_mix'] = g;
}(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';
  var IS_NODE = (typeof module === 'object' && module.exports);
  function part(name) {
    if (IS_NODE) return require('./' + name + '.js');
    var g = root.GENS && root.GENS[name];
    if (!g) throw new Error('[treasure_mix] 부품 생성기가 먼저 로드돼야 합니다: ' + name + ' (카탈로그 gens)');
    return g;
  }

  // 탐험 경로 — 단원 순. 한 칸 = { unit 키, 라벨, 부품 후보들 }
  var ROUTE = [
    { type: 'u1_count',   unit: 1, label: '9까지의 수',   parts: [{ name: 'count9',         params: { max: 9, arrange: 'mix' } }] },
    { type: 'u2_shape',   unit: 2, label: '여러 가지 모양', parts: [{ name: 'shape3d',        params: {} }] },
    { type: 'u3_addsub',  unit: 3, label: '덧셈과 뺄셈',   parts: [{ name: 'split_gather',   params: { max: 9, qmode: 'mix' } },
                                                                    { name: 'compose10',      params: { mode: 'mix' } }] },
    { type: 'u4_compare', unit: 4, label: '비교하기',     parts: [{ name: 'compare_weight', params: {} }] },
    { type: 'u5_count50', unit: 5, label: '50까지의 수',  parts: [{ name: 'count_bundle',   params: { range: 50 } },
                                                                    { name: 'compare50',      params: { range: 50 } }] }
  ];

  return {
    id: 'treasure_mix',
    title: '수학 보물 탐험 (1학기 복습)',
    route: ROUTE.map(function (r) { return { type: r.type, unit: r.unit, label: r.label }; }),
    create: function (params, rng) {
      rng = rng || Math.random;
      // 부품 인스턴스는 한 번만 만든다 — 같은 rng를 나눠 쓰므로 시드가 같으면 판이 같다
      var inst = {};
      ROUTE.forEach(function (r) {
        r.parts.forEach(function (pt) {
          if (!inst[pt.name]) inst[pt.name] = part(pt.name).create(pt.params, rng);
        });
      });
      var at = 0;
      return {
        next: function () {
          var r = ROUTE[at % ROUTE.length]; at++;
          var pt = r.parts.length === 1 ? r.parts[0] : r.parts[Math.floor(rng() * r.parts.length)];
          var q = inst[pt.name].next();
          var out = {};
          for (var k in q) if (Object.prototype.hasOwnProperty.call(q, k)) out[k] = q[k];
          out.src = pt.name;
          out.sub = q.type;            // 부품 유형 보존 (D31)
          out.type = r.type;           // 단원 키
          out.unit = r.unit;
          out.unitLabel = r.label;
          return out;
        },
        check: function (pick, p) {
          var g = inst[p.src];
          return (g && typeof g.check === 'function') ? g.check(pick, p) : (pick === p.answer);
        }
      };
    }
  };
}));

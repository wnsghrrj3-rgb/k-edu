/* ============================================================
 * 영어 놀이터 — 2D 판의 바탕(rooms/place-2d) (WA0 · 무대 설계 v1 R5)
 *   입체가 안 되는 기기의 걸음 화면(zone/step.html)도 걸음마다 다른 곳이어야 한다 — 바탕의 하늘 색 · 뒤 실루엣 · 땅 선을 그 걸음의 무대 여섯 칸(place)에서 그린다.
 *   입체 판과 같은 place 를 읽는다(방 파일 하나가 두 판의 무대를 정한다). 색은 토큰만(var · color-mix).
 *   backdrop2D(place) → { sky, back, land, html }   · mount2D(place) = 화면 뒤 한 겹(.place2d)으로 놓는다(배경 숨결 .amb 가 있으면 그 안 맨 뒤에)
 *   부품을 더하는 법: 터 부품 상자(lands.js)에 뒤 · 땅 · 바닥 · 하늘 부품을 더했으면 여기 BACK2D · LAND2D · FLOOR2D 에도 같은 이름으로 한 줄.
 * ============================================================ */
import { SKIES } from './lands.js';
const css = t => (Array.isArray(t) ? 'color-mix(in srgb, ' + css(t[0]) + ' ' + Math.round((1 - t[2]) * 100) + '%, ' + css(t[1]) + ')' : 'var(--' + t + ')');
const P = (d, tone, op) => '<path d="' + d + '" style="fill:' + css(tone) + '" opacity="' + op + '"/>';
const R = (x, y, w, h, tone, op, rx = 0) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" style="fill:' + css(tone) + '" opacity="' + op + '"/>';
const E = (cx, cy, rx, ry, tone, op) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" style="fill:' + css(tone) + '" opacity="' + op + '"/>';

/* 뒤 실루엣(그림 1200 × 800 · 땅 선은 600 언저리) */
export const BACK2D = {
  forestEdge: () => [80, 210, 330, 470, 760, 900, 1040, 1160].map((x, i) => E(x, 470 - (i % 3) * 26, 96 + (i % 2) * 22, 110 + (i % 3) * 16, i % 2 ? ['stage-deep', 'a-leaf', 0.35] : 'stage-deep', 0.34)).join('') + R(596, 430, 60, 170, ['stage-2-soft', 'a-wood', 0.3], 0.5, 20),      /* 나무 사이로 들어온 길 */
  trunkWall: () => E(600, 30, 760, 150, ['stage-deep', 'ink', 0.2], 0.5) + [40, 210, 400, 590, 800, 980, 1130].map((x, i) => R(x - 46 - (i % 2) * 14, 0, 92 + (i % 2) * 28, 640, ['a-wood', 'ink', 0.2 + (i % 3) * 0.08], 0.42, 26)).join(''),
  cliffFall: () => [0, 150, 300, 450, 690, 850, 1010].map((x, i) => R(x, -20, 190, 590 - (i % 3) * 22, ['ink-2', 'a-fish', 0.35 + (i % 2) * 0.12], 0.5, 14)).join('') + R(566, -20, 68, 600, 'surface', 0.8, 12) + E(600, 584, 110, 26, 'surface', 0.7),
  farHills: () => P('M0 520 Q220 420 470 500 T900 470 T1200 500 L1200 640 L0 640Z', ['a-fish', 'surface', 0.45], 0.5) + P('M0 560 Q300 470 620 550 T1200 520 L1200 660 L0 660Z', ['a-leaf', 'a-fish', 0.4], 0.45) + E(300, 150, 150, 46, 'surface', 0.85) + E(860, 230, 190, 54, 'surface', 0.8),
  gorgeGap: () => R(548, 0, 120, 640, 'warm-soft', 0.95) + P('M0 0 L500 0 L566 640 L0 700Z', ['ink-2', 'a-fish', 0.45], 0.5) + P('M1200 0 L700 0 L648 640 L1200 700Z', ['ink-2', 'a-fish', 0.55], 0.5) + P('M0 0 L210 0 L300 700 L0 760Z', ['ink-2', 'surface', 0.3], 0.4) + P('M1200 0 L1000 0 L920 700 L1200 760Z', ['ink-2', 'surface', 0.3], 0.4)
};
/* 땅 선(바닥 색 fl 로 칠한다) + 그 땅의 물 */
export const LAND2D = {
  meadow: fl => P('M0 610 Q300 580 600 600 T1200 596 L1200 800 L0 800Z', fl, 0.6) + P('M0 690 Q260 650 520 676 T1200 664 L1200 716 Q820 700 520 722 T0 738Z', ['a-fish', 'stage-soft', 0.3], 0.75),      /* 앞을 가로지르는 개울 */
  hollow: fl => P('M0 520 Q150 560 300 640 Q600 700 900 640 Q1050 560 1200 520 L1200 800 L0 800Z', fl, 0.6),                                                                    /* 둘레가 높고 가운데가 움푹 */
  cliffpool: fl => R(0, 566, 1200, 110, ['stage', 'word-blue', 0.42], 0.55) + P('M0 660 L420 660 L420 690 L800 690 L800 724 L1200 724 L1200 800 L0 800Z', fl, 0.62),            /* 물과 계단 물가 */
  hill: fl => P('M0 700 Q600 330 1200 700 L1200 800 L0 800Z', fl, 0.62),                                                                                                         /* 솟은 언덕 */
  gorge: fl => P('M0 540 L330 664 L870 664 L1200 540 L1200 800 L0 800Z', fl, 0.7)                                                                                                /* 좁은 골짜기 바닥 */
};
export const FLOOR2D = { dew: ['stage', 'a-leaf', 0.5], litter: ['a-wood', 'a-gold', 0.45], wetrock: ['ink-2', 'a-fish', 0.55], longgrass: ['a-leaf', 'a-gold', 0.45], snow: ['surface', 'a-fish', 0.2] };

export function backdrop2D(place){
  const sk = Object.assign({}, SKIES[place.sky.kind], place.sky), back = BACK2D[place.back.kind], land = LAND2D[place.land.kind], fl = FLOOR2D[place.floor.kind];
  if (!sk.stops || !back || !land || !fl) throw new Error('2D 바탕에 없는 부품 — ' + [place.sky.kind, place.back.kind, place.land.kind, place.floor.kind].join(' · '));
  const sky = 'linear-gradient(to bottom, ' + css(sk.stops[0]) + ' 0%, ' + css(sk.stops[1]) + ' 52%, ' + css(sk.stops[2]) + ' 100%)', b = back(), l = land(fl);
  return { sky, back: b, land: l, html: '<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + b + l + '</svg>' };
}
export function mount2D(place, doc = document){
  const bd = backdrop2D(place), amb = doc.querySelector('.amb'), el = doc.createElement('div'); el.className = 'place2d'; el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'position:' + (amb ? 'absolute' : 'fixed') + ';inset:0;z-index:' + (amb ? 0 : -1) + ';pointer-events:none;opacity:.62;background:' + bd.sky; el.innerHTML = bd.html;
  const svg = el.firstChild; svg.style.cssText = 'position:absolute;left:0;bottom:0;width:100%;height:100%';
  if (amb) amb.insertBefore(el, amb.firstChild); else doc.body.insertBefore(el, doc.body.firstChild);
  return el;
}

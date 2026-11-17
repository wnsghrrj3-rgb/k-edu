/* ============================================================
 * 영어 놀이터 — 펜 부품(PlayPens) (WD0 · 다름 설계 v1 §2 ⑫ · §6)
 *   걸음마다 쓰는 것이 다르다 — 도구마다 선의 굵기 · 끝 모양 · 색 · 번짐(겹선) · 바탕 · 긋는 소리. 글씨 판정은 그대로다(손 쓰기 엔진 engine/play-write.js 는 손대지 않는다).
 *   PlayPens.apply(el, kind)   쓰기 판(el 안의 .pw-svg)에 그 도구의 선을 입힌다 — CSS 변수(--pen-ink · --pen-w · --pen-cap · --pen-dash · --pen-op · --pen-bg)와 data-pen
 *   PlayPens.sound(kind)       그 도구로 한 획 긋는 소리(합성 — PlayAudio.play 에 그대로 넘긴다)
 *   PlayPens.PENS[kind] = { name, ink, w, cap, dash, op, bg, sound }   ink · bg 는 토큰 이름이나 [a, b, t](색 값 0)
 *   이번에 지은 다섯(A01~A05): charcoal 숯 막대 · chalk 분필 · wetfinger 물 묻힌 손가락 · chalkstone 분필돌 · frost 서리 긁기
 * ============================================================ */
(function (g) {
  'use strict';
  var css = function (t) { return Array.isArray(t) ? 'color-mix(in srgb, ' + css(t[0]) + ' ' + Math.round((1 - t[2]) * 100) + '%, ' + css(t[1]) + ')' : 'var(--' + t + ')'; };
  var PENS = {
    charcoal:   { name: '숯 막대',          ink: ['ink', 'a-wood', 0.25],      w: 8,  cap: 'round',  dash: 'none',  op: 0.92, bg: ['a-cream', 'a-wood', 0.12],     sound: { wave: 'triangle', vol: 0.05, notes: [[180, 0, 0.09, 140]] } },      /* 굵고 거칠다 — 나무 팻말에 */
    chalk:      { name: '분필',             ink: 'surface',                    w: 6,  cap: 'butt',   dash: '9 1.5', op: 0.9,  bg: ['stage-deep', 'ink', 0.3],      sound: { wave: 'square',   vol: 0.025, notes: [[1900, 0, 0.05, 2300]] } },   /* 흰 선이 군데군데 끊긴다 — 어두운 차림표에 */
    wetfinger:  { name: '물 묻힌 손가락',   ink: ['a-leaf', 'stage-deep', 0.4], w: 11, cap: 'round',  dash: 'none',  op: 0.7,  bg: ['ink-2', 'a-fish', 0.5],        sound: { wave: 'sine',     vol: 0.05, notes: [[520, 0, 0.12, 380]] } },      /* 넓고 촉촉하다 — 쓴 자리에 이끼 빛 */
    chalkstone: { name: '분필돌',           ink: ['a-cream', 'a-gold', 0.3],   w: 7,  cap: 'square', dash: 'none',  op: 0.95, bg: ['a-steel', 'ink-2', 0.45],      sound: { wave: 'square',   vol: 0.03, notes: [[900, 0, 0.07, 700]] } },      /* 각진 돌 선 — 납작 바위에 */
    frost:      { name: '서리 긁기',        ink: ['word-blue', 'ink', 0.3],    w: 5,  cap: 'round',  dash: 'none',  op: 0.95, bg: ['surface', 'a-fish', 0.25],     sound: { wave: 'sine',     vol: 0.035, notes: [[2600, 0, 0.05, 3200]] } }    /* 가늘게 긁어 밑이 드러난다 — 서리 낀 문패에 */
  };
  function apply(el, kind) { var p = PENS[kind]; if (!el || !p) return false; var s = el.style;
    s.setProperty('--pen-ink', css(p.ink)); s.setProperty('--pen-w', String(p.w)); s.setProperty('--pen-cap', p.cap); s.setProperty('--pen-dash', p.dash); s.setProperty('--pen-op', String(p.op)); s.setProperty('--pen-bg', css(p.bg));
    el.setAttribute('data-pen', kind); return true; }
  function clear(el) { if (!el) return; ['--pen-ink', '--pen-w', '--pen-cap', '--pen-dash', '--pen-op', '--pen-bg'].forEach(function (k) { el.style.removeProperty(k); }); el.removeAttribute('data-pen'); }
  g.PlayPens = { PENS: PENS, has: function (k) { return !!PENS[k]; }, apply: apply, clear: clear, sound: function (k) { return PENS[k] ? PENS[k].sound : null; }, css: css };
})(typeof window !== 'undefined' ? window : globalThis);

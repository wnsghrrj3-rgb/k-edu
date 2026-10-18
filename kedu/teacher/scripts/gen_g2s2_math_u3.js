/* gen_g2s2_math_u3.js — 2학년 2학기 수학 3단원 「길이 재기」 케이티처 2세대 차시 생성기 (142차, 베프).
   재료 = 자기주도 차시(grade2/semester2/math/3단원_길이재기/) → scripts/src_g2s2_math_u3.json (parse_selfdirected_g1s2.py figs10, 141차)
   골격 = u2 와 같은 19장·7요소. 개념 글·기본 문제·정리·예고·자기 점검 줄은 원문 그대로, 교사 층(발문·오개념·수준별·교실 활동+1인 흐름·생활 속·출구)은 T 표가 정본.
   그림 = 원문 그림을 부품으로: 길이 막대(mbar 여럿) → lbar 한 장(rows · 공통 눈금) · 자·줄자(rul) → ltape(문제 그림은 끝 눈금 빨강 없음)
          · 세로셈(mc) → tvert{m·cm, base 100, 빈칸 q} · 가로 식(mr) → eqt(답 「?」) · 표(est) → ngrid 머리 · 몸·물건 카드(body·uc) → lcard
          · 나누어 어림(ch) → lch · 전체·부분(pw) → lpw · 물건 카드(objs) → objs1 · 식 → eqt.
   기본 문제 「몇 m 몇 cm」 두 칸 답(two) = answer 글(「8 m 90 cm」)·input 없음 → 학생 투영 unitAnswer 가 nums 두 칸으로 채점(물음에 「몇/얼마」 필요 — 없는 곳은 QOVR).
   원문 warncard(틀린 답 글)가 추출에서 빠진 l04 P5·l05 P7 = POVR 로 지시문 보충.
   차단 어휘 — 원문 「해결해 볼까요」 → 「풀어 볼까요」.
   성취기준 = 임시 [2수03-11]·[2수03-12]·[2수03-13](1 m 와 1 cm · 어림 · 길이의 덧셈과 뺄셈) — 2-2 지도서 오면 문구 교체.
   slug = g2s2_math · 주소 stage.html?g=2&s=math&t=2&u=3&l=u3_lNN
   실행: node kedu/teacher/scripts/gen_g2s2_math_u3.js  → kedu/teacher/data/g2s2_math_u3.js */
'use strict';
const fs = require('fs'), path = require('path'), vmm = require('vm');
const SRC = JSON.parse(fs.readFileSync(path.join(__dirname, 'src_g2s2_math_u3.json'), 'utf8'));
const OUT = path.join(__dirname, '..', 'data', 'g2s2_math_u3.js');
const DIR = 'grade2/semester2/math/3단원_길이재기/', LIVE = '../../' + DIR;
const STD = '[2수03-11] 1 m와 1 cm의 관계를 이해하고, 길이를 ‘몇 m 몇 cm’와 ‘몇 cm’로 나타낼 수 있다 · [2수03-12] 여러 가지 물건의 길이를 어림하고, 길이에 대한 양감을 기른다 · [2수03-13] 실생활 문제 상황에서 길이의 덧셈과 뺄셈을 할 수 있다';
const PREV_KEY = 'g2s2_math:u2_l12';
const PREV_EXIT = (() => { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vmm.createContext(c); vmm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'g2s2_math_u2.js'), 'utf8'), c); return L.u2_l12.slides.find(s => s.block === 'exit_ticket').data.items; })();
const TN = (a1, a2, watch, min) => ({ ask: [a1, a2], watch, min });

/* 차단 어휘 — 「해결」 → 「풀」 */
const FIX = (s) => s.replace(/해결해 볼까요/g, '풀어 볼까요').replace(/해결해요/g, '풀어요').replace(/해결할 수/g, '풀 수').replace(/해결했어요/g, '풀었어요');
(function fix(o) { for (const k in o) { if (typeof o[k] === 'string') o[k] = FIX(o[k]); else if (o[k] && typeof o[k] === 'object') fix(o[k]); } })(SRC);

/* 원문 물음이 「몇/얼마」 없이 끝나 학생 화면 채점이 안 되는 곳 → 물음만 덧붙임(답·그림 그대로) */
const QOVR = { '자로 잰 두 물건의 길이를 차례로 쓰세요': '자로 잰 연필과 클립의 길이는 각각 몇 cm일까요?', '바다거북과 돌고래의 몸길이의 합은?': '바다거북과 돌고래의 몸길이의 합은 얼마일까요?' };
/* 원문 warncard(틀린 답) 글이 추출에서 빠진 곳 → 지시문 보충 */
const POVR = { u3_l04: { 5: '어떤 친구는 2 m 30 cm + 1 m 40 cm를 **3 m 7 cm**라고 했어요.' }, u3_l05: { 7: '어떤 친구는 5 m 64 cm − 3 m 22 cm를 **8 m 86 cm**라고 했어요.' } };
Object.keys(POVR).forEach(k => Object.keys(POVR[k]).forEach(i => { SRC[k].problems[i].prompt = POVR[k][i]; }));

/* 길이 글 — cm 수 → 「a m b cm」(b 0 이면 「a m」) */
const mcm = (m, c) => (c ? m + ' m ' + c + ' cm' : m + ' m');
const twoText = (p) => (p.unit === 'cm' ? p.a.map(x => x + ' cm').join(', ') : mcm(p.a[0], +p.a[1]));

/* ── 원문 그림 → 부품 ── prob=true 면 답을 그리지 않는다(끝 눈금 강조 없음 · 빈칸 「?」 그대로) */
function barRow(f) {
  if (f.join) return { join: true, segs: f.bars.map((b, i) => ({ cm: b.cm, col: b.col, lb: (f.pair || [])[i] || '' })), lb: f.lb };
  const b = f.bars[0]; return Object.assign({ cm: b.cm, col: b.col, lb: f.lb }, f.name ? { name: f.name } : {}, b.cut ? { cut: b.cut } : {}, b.m100 ? { m100: true } : {});
}
function partOf(f, prob) {
  if (f.k === 'rul') return Object.assign({ k: 'ltape', name: f.name, len: f.len, ticks: f.ticks }, f.brk ? { brk: true } : { s0: f.s0, s1: f.s1 }, f.shift ? { shift: true } : {}, !prob && f.on != null ? { on: f.on } : {});
  if (f.k === 'mc') { const q = f.r.map((v, i) => (v === '?' ? i : -1)).filter(i => i >= 0); return Object.assign({ k: 'tvert', units: ['m', 'cm'], base: 100, a: f.a, b: f.b, op: f.op === '-' ? '−' : '+' }, q.length ? { q } : {}); }
  if (f.k === 'mr') { const toks = [String(f.a[0]), 'm', String(f.a[1]), 'cm', f.op === '-' ? '−' : '+', String(f.b[0]), 'm', String(f.b[1]), 'cm', '=']; let q = [];
    if (f.r === '?') { q = [toks.length]; toks.push('?'); } else toks.push(String(f.r[0]), 'm', String(f.r[1]), 'cm');
    return { k: 'eqt', rows: [{ toks, hi: [], q }] }; }
  if (f.k === 'est') return { k: 'ngrid', head: true, rows: [f.heads].concat(f.rows.map(r => r.map(v => (v === '?' ? { q: true } : v)))) };
  if (f.k === 'body' || f.k === 'uc') return f.items.length ? { k: 'lcard', items: f.items } : null;
  if (f.k === 'ch') return { k: 'lch', segs: f.segs, cm: f.cm, tot: f.tot };
  if (f.k === 'pw') return { k: 'lpw', t: f.t, a: f.a, b: f.b, cm: f.cm };
  if (f.k === 'objs') return { k: 'objs1', items: f.items };
  return null;
}
function figOf(figs, prob) {
  const parts = []; let rows = [], bars = null;
  const flush = () => { if (rows.length) parts.push({ k: 'eqt', rows }); rows = []; };
  for (const f of figs || []) {
    if (f.k === 'eqt') rows.push({ toks: f.toks, hi: prob ? [] : f.hi, q: f.q });
    else if (f.k === 'steps') { flush(); rows = f.rows.map(r => ({ toks: r.toks, hi: prob ? [] : r.hi, q: r.q, no: r.no })); flush(); }
    else if (f.k === 'mbar') { flush(); if (!bars) { bars = { k: 'lbar', rows: [] }; parts.push(bars); } bars.rows.push(barRow(f)); }
    else { flush(); const p = partOf(f, prob); if (p) parts.push(p); }
  }
  flush();
  if (bars) bars.max = Math.max(...bars.rows.map(r => (r.join ? r.segs.reduce((a, g) => a + g.cm, 0) : r.cm)));
  if (!parts.length) return null;
  if (parts.length === 1) return parts[0];
  return { k: 'panels', items: parts.slice(0, 3).map(p => ({ fig: p })) };
}
/* 개념 글 = 원문 문장 줄(쉼표로 끝나 다음 줄로 이어지는 줄도 함께) · 네 줄까지 */
const conText = (s) => { const ls = s.text.split('\n'), keep = ls.map(l => l.length > 4 && (/[요다!?.」]$/.test(l) || /\*\*/.test(l))); for (let i = ls.length - 2; i >= 0; i--) if (/,$/.test(ls[i]) && keep[i + 1]) keep[i] = true; return ls.filter((l, i) => keep[i]).slice(0, 4).join('\n'); };
const ansOf = (p) => p.part === 'two' ? twoText(p) : p.opts ? p.opts[p.ci].replace(/\*\*/g, '') : p.a + (p.unit || '');

const T = {
  u3_l01: { cover: ['길이 재기 마을에\n가 봐요', '📏'],
    review: '2단원에서는 **곱셈구구**를 배웠어요. 오늘부터는 1학기에 배운 **cm**를 이어서 더 긴 길이를 재는 방법을 배워요.',
    kids: [['🐻', '곰이\n"마을에 자가 가득!"'], ['🐧', '펭이\n"무엇을 재고 있을까?"']],
    mot: ['마을 사람들은 무엇의 길이를 재고 있나요?', '우리는 어디에서 길이를 재 보았나요?', '', 3],
    con: [[2, TN('연필의 한끝은 어느 눈금에 맞추었나요?', '다른 끝은 몇 cm 눈금에 닿았나요?', '눈금 1부터 세어 9 cm라고 하는 경우', 4)], [3, TN('1 cm는 어떻게 읽나요?', '1 cm쯤 되는 물건을 찾아볼까요?', '', 3)], [4, TN('600 cm는 1 cm로 몇 번인가요?', '긴 길이를 cm로만 말하면 무엇이 불편한가요?', '', 5)], [5, TN('나무를 이어 붙이면 길이는 어떻게 되나요?', '쓰고 남은 나무는 어느 부분인가요?', '', 4)]],
    mis: ['자로 잴 때 물건의 한끝을 **눈금 1**에 맞추고 다른 끝의 눈금을 그대로 읽는다.', '물건의 한끝을 **눈금 0**에 맞추어야 다른 끝의 눈금이 바로 **길이**예요. 1에 맞추었다면 1 cm를 빼야 해요.', '자 위에 연필을 0과 1에 번갈아 맞추어 놓고, 끝 눈금이 어떻게 달라지는지 견주게 하세요.', TN('연필의 한끝은 어느 눈금에 있나요?', '눈금 1에 맞추면 길이는 몇 cm 늘어 보이나요?', '끝 눈금을 그대로 읽는 경우', 3)],
    basic: [0, 1, 3], scene: '길이 재기 마을을 둘러봐요.',
    lev: { 기본: { q: '8 cm + 5 cm는 얼마일까요?', a: '13 cm', steps: ['cm끼리 더해요', '8 + 5 = 13', '13 cm'] }, 도전: { q: '15 cm − 7 cm는 얼마일까요?', a: '8 cm', steps: ['cm끼리 빼요', '15 − 7 = 8', '8 cm'] }, 심화: { q: '300 cm는 1 cm로 몇 번일까요?', a: '300번', steps: ['1 cm가 한 번', '300 cm는 1 cm가 300개', '300번'] } },
    levTn: TN('기본에서 무엇끼리 더했나요?', '심화에서 300번을 세기 편한가요?', '심화를 3번이라고 하는 경우', 5),
    act: { t: '우리 교실 길이 탐정', type: 'group', goal: '모둠이 교실 물건 네 가지를 자로 재어 길이 카드에 쓰고, 자 하나로 재기 힘든 긴 물건을 따로 모으기', steps: ['모둠마다 30 cm 자와 길이 카드 여섯 장을 받는다', '교실 물건 네 가지를 골라 한끝을 눈금 0에 맞추어 잰다', '잰 길이를 카드에 「몇 cm」로 쓴다', '자 하나로 재기 힘든 긴 물건을 찾아 칠판에 따로 붙인다'], solo: ['자와 공책을 준비한다', '책상 위 물건 세 가지를 눈금 0에 맞추어 잰다', '잰 길이를 「몇 cm」로 공책에 쓴다', '자 하나로 재기 힘든 긴 물건 하나를 찾아 그림으로 그린다'], mats: ['30 cm 자', '길이 카드'], min: 10, tn: TN('한끝을 어느 눈금에 맞추었나요?', '자 하나로 재기 힘든 물건은 무엇이었나요?', '눈금 1에 맞추어 재는 경우', 10) },
    real: ['키 재기', '📐', '보건실에서 키를 잴 때, 신발을 살 때 발 길이를 볼 때처럼 생활 곳곳에서 길이를 재요.', '길이를 잴 때는 한끝을 **눈금 0**에 맞추어요.'],
    adv: [6, TN('가와 나의 한끝은 각각 어느 눈금에 있나요?', '나를 바르게 재면 몇 cm일까요?', '', 4)],
    exit: [{ q: '3 cm + 4 cm는 얼마일까요?', a: '7 cm' }, { q: '10 cm − 6 cm는 얼마일까요?', a: '4 cm' }, { q: '200 cm는 1 cm로 몇 번일까요?', a: '200번' }],
    arrows: ['길이 재기가 필요한 곳을 찾아요', '자의 눈금 0에 맞추어 재요', 'cm보다 큰 단위가 필요한 까닭을 알아요'],
    self: '오늘 잰 물건 하나의 길이를 짝에게 말해 볼까요?' },
  u3_l02: { cover: ['1 m를 만나요\n미술관 큰 그림', '🖼️'],
    kids: [['🐻', '곰이\n"600 cm는 너무 길어!"'], ['🐧', '펭이\n"더 큰 단위가 있을까?"']],
    mot: ['600 cm를 더 짧게 말할 수 없을까요?', 'cm보다 큰 단위는 무엇일까요?', '', 3],
    con: [[2, TN('100 cm는 몇 m인가요?', '1 m는 어떻게 읽나요?', '1 m를 10 cm로 생각하는 경우', 4)], [4, TN('120 cm를 무엇과 무엇으로 갈랐나요?', '1 m 20 cm는 어떻게 읽나요?', '120 cm를 12 m라고 하는 경우', 5)], [5, TN('1 m는 몇 cm로 바꾸나요?', '1 m 20 cm는 몇 cm인가요?', '', 4)], [6, TN('필통의 길이는 어느 단위가 알맞나요?', '칠판의 긴 쪽은 어느 단위가 알맞나요?', '', 4)]],
    mis: ['120 cm를 **12 m**나 **1 m 2 cm**로 쓴다.', '**100 cm가 1 m**예요. 120 cm는 100 cm와 20 cm라서 **1 m 20 cm**예요.', '1 m 막대 옆에 20 cm 막대를 이어 놓고, 1 m와 20 cm를 따로 읽게 하세요.', TN('120 cm 가운데 1 m는 몇 cm인가요?', '남은 길이는 몇 cm인가요?', '숫자를 그대로 나누어 쓰는 경우', 3)],
    basic: [0, 2, 3], scene: '미술관에서 큰 그림을 재어요.',
    lev: { 기본: { q: '200 cm는 몇 m일까요?', a: '2 m', steps: ['100 cm는 1 m', '200 cm는 100 cm가 2번', '2 m'] }, 도전: { q: '135 cm는 몇 m 몇 cm일까요?', a: '1 m 35 cm', steps: ['135 cm = 100 cm + 35 cm', '100 cm = 1 m', '1 m 35 cm'] }, 심화: { q: '4 m 7 cm는 몇 cm일까요?', a: '407 cm', steps: ['4 m = 400 cm', '400 cm + 7 cm', '407 cm'] } },
    levTn: TN('도전에서 135 cm를 어떻게 갈랐나요?', '심화에서 4 m는 몇 cm인가요?', '심화를 47 cm라고 하는 경우', 5),
    act: { t: '1 m 끈 만들기', type: 'group', goal: '모둠이 30 cm 자로 끈을 재어 1 m 끈을 만들고, 그 끈으로 교실에서 1 m보다 긴 물건과 짧은 물건을 찾기', steps: ['모둠마다 끈과 30 cm 자를 받는다', '자로 이어 재어 100 cm인 곳에 끈을 자른다', '1 m 끈을 교실 물건에 대어 본다', '1 m보다 긴 물건과 짧은 물건을 나누어 칠판에 쓴다'], solo: ['끈과 자를 준비한다', '자로 이어 재어 1 m 끈을 만든다', '집이나 교실 물건 네 가지에 끈을 대어 본다', '1 m보다 긴 것과 짧은 것을 나누어 공책에 쓴다'], mats: ['끈', '30 cm 자', '가위'], min: 12, tn: TN('30 cm 자로 몇 번쯤 이어 재었나요?', '1 m보다 긴 물건은 무엇이었나요?', '자를 이을 때 겹치거나 틈이 생기는 경우', 12) },
    real: ['내 키는 몇 m 몇 cm?', '🧍', '건강 기록장에는 키가 「130 cm」처럼 적혀 있어요. 같은 키를 1 m 30 cm라고도 말할 수 있어요.', '**100 cm = 1 m** — 길이를 두 가지로 나타내요.'],
    adv: [5, TN('248 cm를 100 cm 몇 개와 몇 cm로 가를 수 있나요?', '24 m 8 cm는 왜 틀렸을까요?', '', 4)],
    exit: [{ q: '300 cm는 몇 m일까요?', a: '3 m' }, { q: '160 cm는 몇 m 몇 cm일까요?', a: '1 m 60 cm' }, { q: '2 m 5 cm는 몇 cm일까요?', a: '205 cm' }],
    self: '1 m 20 cm와 120 cm가 같은 까닭을 짝에게 말해 볼까요?' },
  u3_l03: { cover: ['줄자로 재어요\n교실 탐험', '🧵'],
    kids: [['🐻', '곰이\n"책상이 자보다 길어!"'], ['🐧', '펭이\n"줄자를 써 보자"']],
    mot: ['곧은자와 줄자는 무엇이 다른가요?', '책상의 긴 쪽은 어느 자로 재면 좋을까요?', '', 3],
    con: [[2, TN('지우개는 어느 자로 재면 좋을까요?', '교실의 긴 쪽은 어느 자로 재면 좋을까요?', '', 4)], [3, TN('줄자의 눈금 0은 어디에 있나요?', '책상의 다른 끝은 몇 cm 눈금에 닿았나요?', '줄자 고리 끝을 0으로 읽는 경우', 5)], [4, TN('140 cm는 몇 m 몇 cm인가요?', '두 가지 방법 가운데 어느 쪽이 더 편한가요?', '', 4)], [6, TN('거리는 어디부터 어디까지 재나요?', '구불구불 재면 어떻게 될까요?', '', 4)]],
    mis: ['줄자의 **끝 고리**나 **눈금 1**에 물건을 맞추고 끝 눈금을 그대로 읽는다.', '줄자도 물건의 한끝을 **눈금 0**에 맞추어요. 그래야 다른 끝의 눈금이 바로 **길이**예요.', '줄자를 펴서 눈금 0이 어디인지 먼저 손가락으로 짚게 한 뒤 재게 하세요.', TN('줄자의 눈금 0은 어디에 있나요?', '물건의 한끝을 눈금 0에 맞추었나요?', '고리 끝에 맞추어 재는 경우', 3)],
    basic: [0, 1, 2], scene: '교실에서 줄자로 재어요.',
    lev: { 기본: { q: '150 cm는 몇 m 몇 cm일까요?', a: '1 m 50 cm', steps: ['150 cm = 100 cm + 50 cm', '100 cm = 1 m', '1 m 50 cm'] }, 도전: { q: '2 m 8 cm는 몇 cm일까요?', a: '208 cm', steps: ['2 m = 200 cm', '200 cm + 8 cm', '208 cm'] }, 심화: { q: '310 cm는 몇 m 몇 cm일까요?', a: '3 m 10 cm', steps: ['310 cm = 300 cm + 10 cm', '300 cm = 3 m', '3 m 10 cm'] } },
    levTn: TN('도전에서 2 m는 몇 cm인가요?', '심화에서 310 cm 가운데 m가 되는 부분은 얼마인가요?', '도전을 28 cm라고 하는 경우', 5),
    act: { t: '교실 줄자 탐험', type: 'group', goal: '모둠이 줄자로 교실에서 1 m보다 긴 물건 세 가지를 재고, 잰 길이를 「몇 cm」와 「몇 m 몇 cm」로 기록하기', steps: ['모둠마다 줄자와 기록지를 받는다', '1 m보다 긴 물건 세 가지를 고른다', '한 사람은 눈금 0을 잡고 한 사람은 끝 눈금을 읽는다', '잰 길이를 두 가지 방법으로 기록지에 쓴다'], solo: ['줄자와 공책을 준비한다', '집이나 교실에서 1 m보다 긴 물건 두 가지를 고른다', '한끝을 눈금 0에 맞추어 잰다', '잰 길이를 두 가지 방법으로 공책에 쓴다'], mats: ['줄자', '기록지'], min: 12, tn: TN('눈금 0을 잡은 사람은 누구였나요?', '잰 길이를 두 가지로 바르게 썼나요?', '줄자가 구부러진 채로 재는 경우', 12) },
    real: ['옷 치수 재기', '👕', '옷 가게에서는 줄자로 팔 길이나 허리둘레를 재요. 둥근 곳도 줄자는 감아서 잴 수 있어요.', '줄자로 잴 때도 한끝을 **눈금 0**에 맞추어요.'],
    adv: [5, TN('지아와 세미의 물건은 각각 어느 눈금에서 시작하나요?', '세미는 어떻게 다시 재야 할까요?', '', 4)],
    exit: [{ q: '170 cm는 몇 m 몇 cm일까요?', a: '1 m 70 cm' }, { q: '1 m 25 cm는 몇 cm일까요?', a: '125 cm' }, { q: '400 cm는 몇 m일까요?', a: '4 m' }],
    self: '줄자로 바르게 재는 방법을 짝에게 설명해 볼까요?' },
  u3_l04: { cover: ['길이의 합\n나무 표지판', '🪧'],
    kids: [['🐻', '곰이\n"나무 두 개를 이어 볼까?"'], ['🐧', '펭이\n"모두 몇 m 몇 cm일까?"']],
    mot: ['두 나무를 이으면 길이가 얼마나 될까요?', '자로 재지 않고 구할 수 있을까요?', '', 3],
    con: [[3, TN('이은 테이프는 몇 m 몇 cm인가요?', '두 길이를 어떻게 더하면 될까요?', '', 4)], [4, TN('m끼리 더하면 몇 m인가요?', 'cm끼리 더하면 몇 cm인가요?', 'm와 cm를 섞어 더하는 경우', 5)], [5, TN('세로셈에서 같은 단위는 어떻게 맞추나요?', '어느 자리부터 더하나요?', '', 4)], [6, TN('2 m 24 cm + 7 m 5 cm에서 cm끼리 더하면 얼마인가요?', '5 cm는 어느 칸에 써야 하나요?', '5를 20 쪽에 맞추어 쓰는 경우', 5)]],
    mis: ['2 m 30 cm + 1 m 40 cm에서 cm끼리 더한 70을 **7**로 써서 **3 m 7 cm**라고 한다.', 'cm끼리 더한 수는 그대로 **70 cm**예요. 그래서 **3 m 70 cm**예요.', 'm 칸과 cm 칸을 나눈 세로셈 틀에 쓰고, cm 칸의 수를 그대로 옮겨 쓰게 하세요.', TN('30 cm와 40 cm를 더하면 몇 cm인가요?', '70 cm와 7 cm는 같은 길이인가요?', 'cm 자리를 한 자리로 줄여 쓰는 경우', 3)],
    basic: [0, 1, 2], scene: '나무 공방에서 나무를 이어요.',
    lev: { 기본: { q: '2 m 10 cm + 1 m 50 cm는 얼마일까요?', a: '3 m 60 cm', steps: ['2 m + 1 m = 3 m', '10 cm + 50 cm = 60 cm', '3 m 60 cm'] }, 도전: { q: '4 m 35 cm + 3 m 42 cm는 얼마일까요?', a: '7 m 77 cm', steps: ['4 m + 3 m = 7 m', '35 cm + 42 cm = 77 cm', '7 m 77 cm'] }, 심화: { q: '1 m 25 cm + 2 m 30 cm + 3 m 40 cm는 얼마일까요?', a: '6 m 95 cm', steps: ['1 m + 2 m + 3 m = 6 m', '25 cm + 30 cm + 40 cm = 95 cm', '6 m 95 cm'] } },
    levTn: TN('기본에서 m끼리 더하면 얼마인가요?', '심화에서 세 길이도 같은 방법으로 더했나요?', 'm와 cm 수를 섞어 더하는 경우', 5),
    act: { t: '색 테이프 이어 붙이기', type: 'pair', goal: '짝과 색 테이프 두 도막을 「몇 m 몇 cm」로 재어 이어 붙이고, 더해서 구한 길이와 줄자로 잰 길이가 같은지 확인하기', steps: ['짝마다 색 테이프 두 도막과 줄자를 받는다', '도막마다 줄자로 재어 「몇 m 몇 cm」로 쓴다', '두 길이를 m는 m끼리, cm는 cm끼리 더한다', '테이프를 이어 붙여 줄자로 재고 더한 길이와 견준다'], solo: ['색 테이프 두 도막과 줄자를 준비한다', '도막마다 재어 「몇 m 몇 cm」로 쓴다', '세로셈으로 두 길이를 더한다', '이어 붙여 다시 재고 답과 견준다'], mats: ['색 테이프', '줄자'], min: 12, tn: TN('더해서 구한 길이는 얼마였나요?', '이어 붙여 잰 길이와 같았나요?', '테이프를 겹쳐 붙여 길이가 줄어드는 경우', 12) },
    real: ['줄넘기 줄 잇기', '🪢', '긴 줄넘기 줄 두 개를 이어 단체 줄넘기를 할 때, 두 줄의 길이를 더하면 이은 줄이 얼마나 긴지 미리 알 수 있어요.', '길이의 합은 **m는 m끼리, cm는 cm끼리** 더해요.'],
    adv: [5, TN('cm끼리 더하면 얼마인가요?', '3 m 7 cm와 3 m 70 cm는 무엇이 다른가요?', '', 4)],
    exit: [{ q: '1 m 20 cm + 2 m 30 cm는 얼마일까요?', a: '3 m 50 cm' }, { q: '5 m 15 cm + 2 m 4 cm는 얼마일까요?', a: '7 m 19 cm' }, { q: '3 m 60 cm + 4 m 25 cm는 얼마일까요?', a: '7 m 85 cm' }],
    self: '길이의 합을 구하는 방법을 짝에게 말해 볼까요?' },
  u3_l05: { cover: ['길이의 차\n남은 나무', '🪚'],
    kids: [['🐻', '곰이\n"나무를 잘라 썼어"'], ['🐧', '펭이\n"얼마나 남았을까?"']],
    mot: ['나무를 잘라 쓰고 나면 얼마나 남을까요?', '남은 길이는 어떻게 구할까요?', '', 3],
    con: [[3, TN('남은 테이프는 몇 m 몇 cm인가요?', '어떤 셈으로 구할 수 있을까요?', '', 4)], [4, TN('m끼리 빼면 몇 m인가요?', 'cm끼리 빼면 몇 cm인가요?', '', 5)], [5, TN('세로셈에서 같은 단위는 어떻게 맞추나요?', 'cm끼리 먼저 빼면 얼마인가요?', '', 4)], [6, TN('구한 차에 뺀 길이를 더하면 무엇이 나오나요?', '왜 다시 확인할까요?', '', 5)]],
    mis: ['길이의 차를 구할 때 **더해서** 5 m 64 cm − 3 m 22 cm를 **8 m 86 cm**라고 한다.', '「차」는 **빼기**예요. m는 m끼리, cm는 cm끼리 **빼서** **2 m 42 cm**예요.', '긴 테이프 위에 짧은 테이프를 겹쳐 놓고, 남는 부분을 가리키며 얼마나 더 긴지 말하게 하세요.', TN('차를 구할 때는 어떤 셈을 하나요?', '처음 길이보다 답이 더 길 수 있나요?', '더하기를 하는 경우', 3)],
    basic: [0, 1, 2], scene: '나무 공방에서 나무를 잘라요.',
    lev: { 기본: { q: '3 m 70 cm − 1 m 20 cm는 얼마일까요?', a: '2 m 50 cm', steps: ['3 m − 1 m = 2 m', '70 cm − 20 cm = 50 cm', '2 m 50 cm'] }, 도전: { q: '8 m 65 cm − 5 m 31 cm는 얼마일까요?', a: '3 m 34 cm', steps: ['8 m − 5 m = 3 m', '65 cm − 31 cm = 34 cm', '3 m 34 cm'] }, 심화: { q: '6 m 48 cm − 2 m 5 cm는 얼마일까요?', a: '4 m 43 cm', steps: ['6 m − 2 m = 4 m', '48 cm − 5 cm = 43 cm', '4 m 43 cm'] } },
    levTn: TN('도전에서 cm끼리 빼면 얼마인가요?', '심화에서 5 cm는 어느 칸에 맞추어 썼나요?', '심화에서 48 − 50 처럼 자리를 어긋나게 빼는 경우', 5),
    act: { t: '남은 끈 길이 맞히기', type: 'pair', goal: '짝이 긴 끈에서 잘라 낸 길이를 알려 주면, 남은 끈의 길이를 빼기로 구하고 줄자로 재어 맞히기', steps: ['짝마다 길이를 아는 긴 끈과 줄자, 가위를 받는다', '한 사람이 끈을 잘라 잘라 낸 길이를 재어 알려 준다', '다른 사람이 남은 길이를 m는 m끼리, cm는 cm끼리 빼서 구한다', '남은 끈을 줄자로 재어 답과 견주고 역할을 바꾼다'], solo: ['길이를 아는 긴 끈과 줄자, 가위를 준비한다', '끈을 조금 잘라 잘라 낸 길이를 잰다', '남은 길이를 세로셈으로 구한다', '남은 끈을 재어 답과 견준다'], mats: ['끈', '줄자', '가위'], min: 12, tn: TN('남은 길이를 어떻게 구했나요?', '줄자로 잰 길이와 같았나요?', '두 길이를 더하는 경우', 12) },
    real: ['남은 리본', '🎀', '선물 상자를 묶고 리본이 얼마나 남았는지 알고 싶을 때, 처음 길이에서 쓴 길이를 빼면 돼요.', '길이의 차는 **m는 m끼리, cm는 cm끼리** 빼요.'],
    adv: [7, TN('어떤 친구는 무슨 셈을 했나요?', '바르게 구하면 몇 m 몇 cm인가요?', '', 4)],
    exit: [{ q: '4 m 50 cm − 2 m 30 cm는 얼마일까요?', a: '2 m 20 cm' }, { q: '7 m 68 cm − 3 m 25 cm는 얼마일까요?', a: '4 m 43 cm' }, { q: '5 m 90 cm − 1 m 40 cm는 얼마일까요?', a: '4 m 50 cm' }],
    self: '구한 차를 다시 확인하는 방법을 짝에게 말해 볼까요?' },
  u3_l06: { cover: ['1 m로 어림해요\n바다악어', '🐊'],
    kids: [['🐻', '곰이\n"악어가 약 3 m래!"'], ['🐧', '펭이\n"자 없이 알 수 있을까?"']],
    mot: ['3 m는 얼마쯤일까요?', '자 없이 길이를 알 수 있을까요?', '', 3],
    con: [[2, TN('어림한 길이에는 무엇을 붙이나요?', '어림한 길이와 잰 길이는 어떻게 다른가요?', '', 4)], [3, TN('양팔을 벌린 길이는 약 몇 m인가요?', '1 m는 뼘으로 몇 번쯤인가요?', '', 5)], [5, TN('1 m가 몇 번이면 약 3 m인가요?', '어림한 뒤에는 무엇을 하나요?', '', 4)], [6, TN('어림한 길이와 잰 길이가 가장 가까운 것은 무엇인가요?', '다음엔 어떻게 더 가깝게 어림할까요?', '', 5)]],
    mis: ['어림한 길이를 말할 때 **「약」을 빼고** 잰 길이처럼 「1 m예요」라고 말한다.', '자로 재지 않고 짐작한 길이는 **「약 1 m」**처럼 「약」을 붙여요.', '어림한 길이와 잰 길이를 두 칸에 나누어 적게 하고, 어림 칸에는 「약」부터 쓰게 하세요.', TN('자로 재었나요, 짐작했나요?', '짐작한 길이 앞에는 무엇을 붙이나요?', '「약」을 빠뜨리는 경우', 3)],
    basic: [0, 1, 2], scene: '내 몸으로 1 m를 어림해요.',
    lev: { 기본: { q: '1 m가 약 2걸음이면 약 3 m는 약 몇 걸음일까요?', a: '약 6걸음', steps: ['1 m가 약 2걸음', '3 m는 1 m가 3번', '약 6걸음'] }, 도전: { q: '1 m가 약 7뼘이면 약 2 m는 약 몇 뼘일까요?', a: '약 14뼘', steps: ['1 m가 약 7뼘', '2 m는 1 m가 2번', '약 14뼘'] }, 심화: { q: '1 m가 약 3걸음이면 약 5 m는 약 몇 걸음일까요?', a: '약 15걸음', steps: ['1 m가 약 3걸음', '5 m는 1 m가 5번', '약 15걸음'] } },
    levTn: TN('기본에서 1 m가 몇 번인가요?', '심화의 걸음 수는 3단 곱셈구구로 구할 수 있나요?', '', 5),
    act: { t: '내 몸 1 m 자', type: 'pair', goal: '짝과 1 m 끈을 대어 양팔·뼘·걸음으로 1 m가 몇 번인지 재고, 그 몸 자로 교실 물건의 길이를 어림한 뒤 줄자로 확인하기', steps: ['짝마다 1 m 끈과 줄자를 받는다', '1 m 끈에 양팔·뼘·걸음을 대어 몇 번인지 기록한다', '몸 자로 교실 물건 두 가지를 어림해 「약 몇 m」로 쓴다', '줄자로 재어 어림한 길이와 견준다'], solo: ['1 m 끈과 줄자를 준비한다', '1 m가 내 뼘과 걸음으로 몇 번인지 잰다', '몸 자로 물건 두 가지를 어림해 「약」을 붙여 쓴다', '줄자로 재어 어림한 길이와 견준다'], mats: ['1 m 끈', '줄자', '기록지'], min: 12, tn: TN('1 m는 내 걸음으로 몇 번이었나요?', '어림한 길이와 잰 길이는 얼마나 달랐나요?', '어림한 길이에 「약」을 붙이지 않는 경우', 12) },
    real: ['가구 들여놓기', '🛋️', '새 책장을 놓을 자리가 약 2 m인지 알고 싶을 때, 내 걸음으로 어림해 보면 줄자가 없어도 대강 알 수 있어요.', '1 m를 알면 **「약 몇 m」**로 어림할 수 있어요.'],
    adv: [7, TN('1 m가 약 세 걸음이면 2 m는 몇 걸음인가요?', '4 m는 1 m가 몇 번인가요?', '', 4)],
    exit: [{ q: '1 m가 약 2걸음이면 약 4 m는 약 몇 걸음일까요?', a: '약 8걸음' }, { q: '1 m가 약 6뼘이면 약 2 m는 약 몇 뼘일까요?', a: '약 12뼘' }, { q: '1 m를 3번 이은 길이는 몇 m일까요?', a: '3 m' }],
    self: '내 몸으로 1 m를 어림하는 방법을 짝에게 보여 줄까요?' },
  u3_l07: { cover: ['긴 거리 어림\n운동장 탐험', '🏃'],
    kids: [['🐻', '곰이\n"운동장이 엄청 넓어!"'], ['🐧', '펭이\n"나누어 어림해 보자"']],
    mot: ['축구 골대의 긴 쪽은 약 몇 m일까요?', '운동장처럼 긴 거리는 어떻게 어림할까요?', '', 3],
    con: [[2, TN('1 m가 몇 번쯤이면 약 5 m인가요?', '깃발을 놓은 뒤에는 무엇을 하나요?', '', 4)], [3, TN('약 5 m를 기준 삼으면 10 m는 몇 배쯤인가요?', '기준이 있으면 무엇이 좋은가요?', '', 4)], [4, TN('운동장을 몇 부분으로 나누었나요?', '부분마다 어림한 길이를 더하면 약 몇 m인가요?', '', 5)], [5, TN('2 m 간격이 몇 개인가요?', '간격을 세면 약 몇 m인가요?', '', 5)]],
    mis: ['긴 거리를 **한 번에 눈으로만** 보고 정해 실제와 많이 다르게 어림한다.', '긴 거리는 아는 길이를 **기준 삼거나** 몇 부분으로 **나누어** 어림하면 더 가까워요.', '운동장을 깃발로 몇 부분으로 나눈 뒤 부분마다 어림해 더하게 하세요.', TN('기준으로 삼을 아는 길이는 무엇인가요?', '몇 부분으로 나누면 어림하기 쉬울까요?', '눈으로만 보고 정하는 경우', 3)],
    basic: [0, 1, 2], scene: '운동장에서 거리를 어림해요.',
    lev: { 기본: { q: '약 2 m 간격이 4개면 약 몇 m일까요?', a: '약 8 m', steps: ['약 2 m가 4번', '2 + 2 + 2 + 2 = 8', '약 8 m'] }, 도전: { q: '약 10 m, 약 5 m, 약 10 m를 모두 더하면 약 몇 m일까요?', a: '약 25 m', steps: ['부분마다 어림한 길이', '10 + 5 + 10 = 25', '약 25 m'] }, 심화: { q: '약 3 m 간격이 6개면 약 몇 m일까요?', a: '약 18 m', steps: ['약 3 m가 6번', '3 × 6 = 18', '약 18 m'] } },
    levTn: TN('기본에서 2 m를 몇 번 더했나요?', '심화를 곱셈구구로 구할 수 있나요?', '간격 수 대신 깃발 수를 세는 경우', 5),
    act: { t: '운동장 거리 어림 대회', type: 'group', goal: '모둠이 운동장에서 기준 삼기·나누기·간격 세기로 같은 거리를 어림하고, 줄자로 재어 어느 방법이 가장 가까웠는지 견주기', steps: ['모둠마다 깃발 네 개와 줄자, 기록지를 받는다', '정한 두 지점 사이를 세 가지 방법으로 어림해 「약 몇 m」로 쓴다', '줄자로 이어 재어 실제 거리를 쓴다', '가장 가깝게 어림한 방법을 발표한다'], solo: ['복도나 운동장에서 두 지점을 정한다', '걸음으로 기준을 삼아 거리를 어림한다', '같은 간격을 세어 한 번 더 어림한다', '줄자로 재어 두 어림과 견준다'], mats: ['깃발', '줄자', '기록지'], min: 15, tn: TN('어느 방법이 가장 가까웠나요?', '나누어 어림한 길이를 모두 더했나요?', '부분 하나를 빠뜨리고 더하는 경우', 15) },
    real: ['횡단보도 건너기', '🚸', '횡단보도의 흰 줄은 거의 같은 간격으로 그려져 있어요. 흰 줄이 몇 개인지 세면 길의 폭을 대강 어림할 수 있어요.', '긴 거리는 **기준 삼기·나누기·간격 세기**로 어림해요.'],
    adv: [4, TN('울타리 세 칸은 약 몇 m인가요?', '나무에서 나무까지 몇 부분으로 나누어 더했나요?', '', 5)],
    exit: [{ q: '약 2 m 간격이 3개면 약 몇 m일까요?', a: '약 6 m' }, { q: '약 5 m, 약 5 m, 약 10 m를 모두 더하면 약 몇 m일까요?', a: '약 20 m' }, { q: '약 4 m 간격이 2개면 약 몇 m일까요?', a: '약 8 m' }],
    arrows: ['아는 길이를 기준 삼아 어림해요', '긴 거리는 나누어 어림하고 더해요', '같은 간격을 세어 어림해요'],
    self: '운동장 거리를 어림한 방법 하나를 짝에게 말해 볼까요?' },
  u3_l08: { cover: ['수학이랑 확인해요\n길이 재기 마무리', '✅'],
    kids: [['🐻', '곰이\n"배운 걸 모아 보자!"'], ['🐧', '펭이\n"스스로 확인해"']],
    mot: ['이 단원에서 무엇을 배웠나요?', '가장 기억에 남는 길이 재기는 무엇인가요?', '', 3],
    con: [[2, TN('248 cm는 몇 m 몇 cm인가요?', '100 cm는 몇 m인가요?', '', 4)], [3, TN('줄자로 잴 때 한끝을 어디에 맞추나요?', '130 cm를 두 가지로 말해 볼까요?', '', 4)], [4, TN('세로셈에서 무엇끼리 맞추어 쓰나요?', '합과 차를 구하는 방법은 무엇이 같나요?', '', 5)], [5, TN('나누어 어림한 길이를 모두 더하면 약 몇 m인가요?', '어림한 값에는 무엇을 붙이나요?', '', 5)]],
    mis: ['3 m 52 cm를 「몇 cm」로 바꿀 때 m와 cm의 수를 그냥 더해 **55 cm**라고 쓴다.', '1 m는 **100 cm**예요. 3 m는 300 cm라서 300 cm와 52 cm를 모아 **352 cm**예요.', '1 m 막대 세 개와 52 cm 막대를 이어 놓고 cm로 세게 하세요.', TN('3 m는 몇 cm인가요?', '300 cm와 52 cm를 모으면 몇 cm인가요?', 'm와 cm의 수를 그냥 더하는 경우', 3)],
    basic: [0, 1, 3], scene: '길이 재기를 문제로 확인해요.',
    lev: { 기본: { q: '305 cm는 몇 m 몇 cm일까요?', a: '3 m 5 cm', steps: ['305 cm = 300 cm + 5 cm', '300 cm = 3 m', '3 m 5 cm'] }, 도전: { q: '6 m 45 cm − 3 m 12 cm는 얼마일까요?', a: '3 m 33 cm', steps: ['6 m − 3 m = 3 m', '45 cm − 12 cm = 33 cm', '3 m 33 cm'] }, 심화: { q: '2 m 36 cm + 4 m 52 cm는 얼마일까요?', a: '6 m 88 cm', steps: ['2 m + 4 m = 6 m', '36 cm + 52 cm = 88 cm', '6 m 88 cm'] } },
    levTn: TN('기본에서 5 cm는 어느 자리에 쓰나요?', '도전과 심화는 같은 방법으로 구했나요?', '기본을 3 m 50 cm라고 하는 경우', 5),
    act: { t: '길이 재기 문제 만들기', type: 'pair', goal: '짝과 교실 물건 두 가지를 줄자로 재어 길이의 합이나 차를 묻는 문제를 만들고, 서로 바꾸어 풀기', steps: ['짝마다 줄자와 문제 카드 두 장을 받는다', '교실 물건 두 가지를 재어 「몇 m 몇 cm」로 쓴다', '두 길이의 합이나 차를 묻는 문제를 카드에 쓴다', '짝과 카드를 바꾸어 풀고 서로 답을 확인한다'], solo: ['줄자와 공책을 준비한다', '물건 두 가지를 재어 「몇 m 몇 cm」로 쓴다', '두 길이의 합과 차를 묻는 문제를 하나씩 만든다', '스스로 풀고 줄자로 다시 확인한다'], mats: ['줄자', '문제 카드'], min: 12, tn: TN('어떤 물건으로 문제를 만들었나요?', '짝의 문제를 어떻게 풀었나요?', '단위를 빠뜨리고 답을 쓰는 경우', 12) },
    real: ['이사할 때', '🚚', '이사를 할 때는 줄자로 가구의 길이와 방의 길이를 재어 가구가 들어갈지 미리 알아봐요.', '길이를 **재고, 나타내고, 더하고 빼고, 어림**할 수 있어요.'],
    adv: [6, TN('처음 막대는 몇 m 몇 cm인가요?', '한 도막을 빼면 무엇이 남나요?', '', 5)],
    exit: [{ q: '4 m 15 cm는 몇 cm일까요?', a: '415 cm' }, { q: '2 m 40 cm + 3 m 35 cm는 얼마일까요?', a: '5 m 75 cm' }, { q: '8 m 90 cm − 6 m 40 cm는 얼마일까요?', a: '2 m 50 cm' }],
    arrows: ['100 cm는 1 m — 두 가지로 나타내요', 'm는 m끼리, cm는 cm끼리 더하고 빼요', '기준 삼거나 나누어 어림해요'],
    self: '이 단원에서 가장 자신 있는 것을 짝에게 말해 볼까요?' },
  u3_l09: { cover: ['수학이랑 만들어요\n동물 몸길이 사전', '🐋'],
    kids: [['🐻', '곰이\n"범고래가 제일 길대!"'], ['🐧', '펭이\n"바닥에 나타내 보자"']],
    mot: ['바다 동물들의 몸길이는 얼마나 될까요?', '교실 바닥에 나타내면 어떻게 보일까요?', '', 3],
    con: [[2, TN('범고래의 몸길이는 몇 m 몇 cm인가요?', '먼저 어림해 보면 약 몇 m일까요?', '', 4)], [3, TN('가장 짧은 동물은 누구인가요?', '바다표범은 몇 cm인가요?', '', 4)], [4, TN('바닥에 나타내기 전에 무엇을 하면 좋을까요?', '범고래와 바다거북은 얼마나 차이가 나 보이나요?', '', 5)], [5, TN('두 몸길이의 차는 어떻게 구하나요?', '차는 몇 m 몇 cm인가요?', '', 5)]],
    mis: ['몸길이를 견줄 때 **cm 자리 수만** 보고 1 m 80 cm인 바다표범이 2 m 20 cm인 돌고래보다 길다고 한다.', '길이를 견줄 때는 **m 자리부터** 견주어요. 2 m가 1 m보다 길어서 **돌고래**가 더 길어요.', '두 몸길이를 「몇 cm」로 바꾸어 220과 180을 견주게 하세요.', TN('m 자리 수는 각각 얼마인가요?', '「몇 cm」로 바꾸면 어느 쪽이 큰가요?', 'cm 자리만 견주는 경우', 3)],
    basic: [0, 1, 3], scene: '동물 몸길이 사전을 만들어요.',
    lev: { 기본: { q: '6 m 50 cm − 2 m 20 cm는 얼마일까요?', a: '4 m 30 cm', steps: ['6 m − 2 m = 4 m', '50 cm − 20 cm = 30 cm', '4 m 30 cm'] }, 도전: { q: '4 m 30 cm + 2 m 20 cm는 얼마일까요?', a: '6 m 50 cm', steps: ['4 m + 2 m = 6 m', '30 cm + 20 cm = 50 cm', '6 m 50 cm'] }, 심화: { q: '4 m 80 cm − 1 m 30 cm는 얼마일까요?', a: '3 m 50 cm', steps: ['4 m − 1 m = 3 m', '80 cm − 30 cm = 50 cm', '3 m 50 cm'] } },
    levTn: TN('기본은 어느 두 동물의 차인가요?', '도전의 답은 어느 동물의 몸길이와 같나요?', '', 5),
    act: { t: '동물 몸길이 사전', type: 'group', goal: '모둠이 동물 하나씩 맡아 줄자로 교실 바닥에 몸길이를 테이프로 나타내고, 동물 카드에 「몇 m 몇 cm」와 견준 말을 써서 사전으로 모으기', steps: ['모둠마다 줄자와 바닥 테이프, 동물 카드를 받는다', '맡은 동물의 몸길이를 먼저 걸음으로 어림한다', '줄자로 재어 교실 바닥에 테이프로 나타낸다', '카드에 몸길이와 다른 동물과의 차를 써서 사전에 붙인다'], solo: ['동물 하나를 골라 몸길이를 알아본다', '복도에서 걸음으로 어림한 뒤 줄자로 재어 나타낸다', '카드에 「몇 m 몇 cm」로 몸길이를 쓴다', '내 키와 몸길이의 차를 구해 카드에 덧붙인다'], mats: ['줄자', '바닥 테이프', '동물 카드'], min: 15, tn: TN('맡은 동물은 몇 m 몇 cm였나요?', '어림한 길이와 잰 길이는 얼마나 달랐나요?', '바닥 테이프를 구불구불하게 붙이는 경우', 15) },
    real: ['수족관 안내판', '🐬', '수족관 안내판에는 동물의 몸길이가 「약 2 m 20 cm」처럼 적혀 있어요. 내 키와 견주어 보면 동물이 얼마나 큰지 실감할 수 있어요.', '몸길이를 **재고 견주고 차를 구해** 사전을 만들었어요.'],
    adv: [5, TN('바다악어와 돌고래는 각각 몇 m 몇 cm인가요?', 'm는 m끼리, cm는 cm끼리 뺐나요?', '', 5)],
    exit: [{ q: '4 m 30 cm − 1 m 30 cm는 얼마일까요?', a: '3 m' }, { q: '2 m 20 cm는 몇 cm일까요?', a: '220 cm' }, { q: '1 m 80 cm + 2 m 10 cm는 얼마일까요?', a: '3 m 90 cm' }],
    arrows: ['동물의 몸길이를 줄자로 나타내요', '몸길이를 견주고 차를 구해요', '동물 몸길이 사전을 만들어요'],
    self: '내 키와 가장 비슷한 동물을 짝에게 말해 볼까요?',
    nextText: '**길이 재기** 단원을 모두 마쳤어요! 다음 단원은 **시각과 시간** — 시계를 읽고 시간을 알아봐요.', next: '🕐' }
};
/* ── extras ── */
function extras(n, t, s) {
  const id = (p, i) => p + '_l' + n + '_' + i, ex = [];
  ex.push({ id: id('v', 1), type: 'video', icon: '🎥', title: t.cover[0].split('\n')[0] + ' 영상', url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent('초등 2학년 수학 길이 재기 ' + t.cover[0].split('\n')[0]).replace(/%20/g, '+'), description: '수업 전 교사가 짧은 영상을 골라 두세요.', source: '유튜브 검색 (교사 사전 확인 권장)', fit_slides: ['concept', 'motivate'] });
  const app = s.problems.filter(p => p.stage === '응용문제');
  app.slice(0, 3).forEach((p, i) => ex.push({ id: id('q', i + 1), type: 'fun_question', icon: '💡', title: p.q, content: p.q + (p.prompt ? ' — ' + p.prompt.replace(/\*\*/g, '').replace(/\s*\n\s*/g, ' ') : ''), fit_slides: ['concept', 'basic_problem'] }));
  s.problems.filter(p => p.miss && typeof p.miss === 'string' && p.miss).slice(0, 2).forEach((p, i) => ex.push({ id: id('t', i + 1), type: 'tip', icon: '🧩', title: '자주 틀리는 곳', content: p.miss.replace(/<\/?b>/g, '**'), fit_slides: ['concept', 'misconception'] }));
  ex.push({ id: id('r', 1), type: 'real_world', icon: '🌍', title: t.real[0], content: t.real[2], fit_slides: ['real_world', 'summary'] });
  ex.push({ id: id('g', 1), type: 'game', icon: '🎮', title: t.act.t, content: t.act.goal, fit_slides: ['leveled_problem', 'offline_activity'] });
  ex.push({ id: id('x', 1), type: 'misconception', icon: '⚠️', title: '오개념 확인', content: t.mis[0].replace(/\*\*/g, '') + ' → ' + t.mis[1].replace(/\*\*/g, ''), fit_slides: ['misconception', 'basic_problem'] });
  return ex;
}

function problemData(p, title, scene) {
  const fig = figOf(p.figs, true);
  const q = QOVR[p.q] || p.q;
  const d = { title, scenario: { icon: '📏', body: (p.prompt || scene).replace(/\s*\n\s*/g, ' ') }, question: /[?.!]$/.test(q) || !/(까요|나요)$/.test(q) ? q : q + '?' };
  if (fig) d.fig = fig;
  const hint = (p.hints || []).join(' ');
  if (p.opts) { d.options = p.opts.map((t, i) => { const o = { text: t }; if (i === p.ci) o.correct = true; return o; }); d.note = '풀이: ' + hint + ' → **' + ansOf(p) + '**'; }
  else if (p.part === 'two') { d.answer = twoText(p); d.note = '풀이: ' + hint + ' → **' + d.answer + '**'; } // 두 칸 답 — 투영 unitAnswer 가 nums 로 채점
  else { d.input = 'count_input'; d.answer = isNaN(+p.a) ? p.a : +p.a; if (p.unit) d.unit = p.unit; d.note = '풀이: ' + hint + ' → **' + p.a + (p.unit ? ' ' + p.unit : '') + '**'; }
  return d;
}

const LESSONS = {}, keys = Object.keys(T);
keys.forEach((key, idx) => {
  const t = T[key], s = SRC[key], n = idx + 1; if (!s) throw new Error('원문 없음 ' + key);
  const ex = extras(n, t, s), has = (pre) => ex.filter(e => e.id.startsWith(pre + '_l' + n + '_')).map(e => e.id);
  const prevExit = idx === 0 ? PREV_EXIT : T[keys[idx - 1]].exit;
  const slides = [];
  const add = (block, stage, data, sug, tn) => { const sl = { id: 's' + String(slides.length + 1).padStart(2, '0'), stage, block, data }; if (tn) data.tnote = tn; sl.suggested_extras = (sug || []).filter(Boolean); slides.push(sl); };
  const S0 = s.slides[0];
  add('cover', '도입', { title: t.cover[0], emoji: t.cover[1] }, has('v'));
  add('review', '도입', { title: idx === 0 ? '지난 단원 마지막 시간엔 무엇을 했나요?' : '지난 시간엔 무엇을 했나요?', content: t.review || (s.slides.find(x => x.kind === '떠올리기') || {}).text || '', items: prevExit.map(x => ({ q: x.q, a: x.a })), from: idx === 0 ? PREV_KEY : keys[idx - 1] }, has('q').slice(0, 1));
  add('motivate', '도입', { scene_title: S0.title, kids: t.kids.map(([face, label]) => ({ face, label })), question: conText(S0) || S0.text.split('\n').slice(0, 2).join(' ') }, has('r'), TN(...t.mot));
  t.con.slice().sort((a, b) => a[0] - b[0]).forEach(([si, tn], i) => { const src = s.slides[si]; if (!src) throw new Error(key + ' 개념 장 ' + si);
    const fig = figOf(src.figs, false); if (!fig) throw new Error(key + ' 개념 장 그림 없음 ' + si);
    const content = conText(src) || src.title;
    add('concept', '전개', Object.assign({ title: src.title, content }, { fig }), [has('t')[i % 2], i === 3 ? has('q')[1] : null], tn); });
  add('misconception', '전개', { title: '이런 생각을 조심해요', label: '자주 하는 생각', wrong: t.mis[0], right: t.mis[1], hint: t.mis[2] }, has('x'), t.mis[3]);
  t.basic.forEach((pi, i) => { const p = s.problems[pi]; if (!p || !['pad', 'mcq', 'two'].includes(p.part)) throw new Error(key + ' 기본 문제 ' + pi + ' 꼴 ' + (p && p.part)); add('basic_problem', '기본문제', problemData(p, '기본 문제 ' + '①②③'[i], t.scene), [has('t')[0]]); });
  add('leveled_problem', '기본문제', { title: '수준을 골라 풀어요', levels: t.lev }, has('g'), t.levTn);
  add('offline_activity', '응용문제', { title: t.act.t, type: t.act.type, goal: t.act.goal, steps: t.act.steps, solo: t.act.solo, materials: t.act.mats, minutes: t.act.min }, has('g'), t.act.tn);
  add('real_world', '응용문제', { title: t.real[0], scenario: { icon: t.real[1], body: t.real[2] }, content: t.real[3] }, has('r'));
  const ap = s.problems[t.adv[0]]; if (!ap || !(ap.opts || ap.a)) throw new Error(key + ' 응용 ' + t.adv[0]);
  add('advanced_problem', '응용문제', { title: '생각을 넓혀요', context: (t.adv[2] || ap.prompt || t.scene).replace(/\*\*/g, '').replace(/\s*\n\s*/g, ' '), challenge: (QOVR[ap.q] || ap.q) + (ap.opts ? ' (' + ap.opts.map(o => o.replace(/\*\*/g, '')).join(' / ') + ')' : ''), note: '풀이: ' + (ap.hints || []).join(' ') + ' → **' + String(ansOf(ap)).replace(/\*\*/g, '') + '**' }, has('q').slice(2, 3), t.adv[1]);
  add('exit_ticket', '정리', { title: '오늘 확인해요', items: t.exit, self: ['오늘 배운 것을 혼자 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] }, []);
  add('summary', '정리', { title: '오늘 배운 것', points: s.summary.split('\n').filter(Boolean), arrows: (t.arrows || (s.goal && s.goal.length ? s.goal : t.exit.map(e => e.q))).slice(0, 3) }, has('r'));
  const selfL = (s.slides.find(x => x.kind === '스스로 점검') || { text: '' }).text.split('\n').filter(l => l && !/^잘했어요/.test(l));
  if (selfL.length !== 3) throw new Error(key + ' 스스로 점검 줄 ' + selfL.length);
  add('self_assessment', '정리', { title: '스스로 점검해요', items: ['📚 ' + selfL[0], '🔧 ' + selfL[1], '💛 ' + selfL[2]], prompts: [t.self] }, []);
  add('next_lesson', '정리', { title: idx === keys.length - 1 ? '다음 단원엔' : '다음 시간엔', preview: t.nextText || s.next, emoji: t.next || s.next_emoji }, []);
  LESSONS[key] = { meta: { grade: 2, subject: '수학', term: 2, unit: 3, unit_title: '길이 재기', n, title: s.title.replace(/ · K-edu.*$/, ''), std: STD, duration_min: 40, lesson_format: (n === 1 ? '단원 도입' : n === 8 ? '단원 평가' : n === 9 ? '수학이랑 만들어요' : '개념') + ' · 2세대 19장(7요소)', theme: '곰이·펭이 길이 재기 마을', live_url: LIVE + s.file, source: DIR + s.file }, slides, extras: ex };
});

const head = `/* ============================================================================
   2학년 2학기 수학 — 3단원 「길이 재기」 케이티처 2세대 차시 데이터 (9차시 × 19장)
   - 생성물: kedu/teacher/scripts/gen_g2s2_math_u3.js 가 만든다. 손으로 고치지 말고 생성기(T 표)를 고칠 것.
   - 키: window.LESSONS["u3_l{NN}"] · 주소 stage.html?g=2&s=math&t=2&u=3&l=u3_lNN · slug g2s2_math (2학년 2학기 — 2세대 전용).
   - 재료: 자기주도 2-2 「길이 재기」 9차시(개념 장·문제·정리·예고) → 19장·7요소 + 교사 층(발문·오개념·교실 활동+1인 흐름).
   - 계보: u3_l01 복습 = 2단원 마지막 g2s2_math u2_l12 출구 퀴즈 · 이후 차시 복습 = 직전 차시 출구 퀴즈.
   - 그림: lbar·ltape·lpw·lcard·lch(141차) · tvert(m·cm 세로셈) · eqt · ngrid(표) · objs1.
   ============================================================================ */
`;
fs.writeFileSync(OUT, head + '(function () {\n  if (!window.LESSONS) window.LESSONS = {};\n' + keys.map(k => '  window.LESSONS[' + JSON.stringify(k) + '] = ' + JSON.stringify(LESSONS[k]) + ';').join('\n') + '\n})();\n');
console.log('→', path.relative(process.cwd(), OUT), keys.length, '차시 ·', keys.reduce((a, k) => a + LESSONS[k].slides.length, 0), '장 ·', keys.reduce((a, k) => a + LESSONS[k].extras.length, 0), 'extras');

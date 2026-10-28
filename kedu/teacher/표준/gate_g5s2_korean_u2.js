/* gate_g5s2_korean_u2.js — 5학년 2학기 국어 2단원 「올바른 문장으로 글을 써요」 케이티처 2세대 게이트 (214차, 베프 — gate_g5s2_korean_u1 틀).
   지도서 직행(자기주도 원문 없음) — 원문 대조 대신 T 표 자체 규칙을 잰다.
   A 로드·meta · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 1단원 u1_l14 출구) · E 기본 문제 정답 · F 분 합계 560
   G 제재(자체 집필 글 · 교과서 원문 제재 이름 0 · 어색한 일기 문장 = 실제로 어색) · H 선행(주어·목적어·서술어 l02 · 호응 l03 · 개요 l05 · 첨부 l07 · 용어 노출 0)
   I 오개념·심화(고친 문장 여러 가지 + 까닭) · J 실렌더(부품 sents·tree·sound ox·post·letter·news·so-link·ko-text) · K 물음 끝 · L 차단 어휘(「결」 글자 0 · 결코 0 · 겹낫표 0) · M 5학년 인물 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_korean_u2.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g5s2_korean_u2.js'));
const KEYS = ['u2_l01', 'u2_l02', 'u2_l03', 'u2_l05', 'u2_l07', 'u2_l09', 'u2_l12', 'u2_l14'];
const COV = { u2_l01: [1, 1], u2_l02: [2, 2], u2_l03: [3, 4], u2_l05: [5, 6], u2_l07: [7, 8], u2_l09: [9, 11], u2_l12: [12, 13], u2_l14: [14, 14] };
const U1 = load(path.join(TDIR, 'data/g5s2_korean_u1.js'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '올바른 문장으로 글을 써요';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

console.log('═══ A. 로드·meta ═══');
T('8차시 키(3·4 → l03 · 5·6 → l05 · 7·8 → l07 · 9~11 → l09 · 12·13 → l12)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 국어 · unit 2 · 단원명 · n·covers·분 = 지도서 차시 · 성취기준 [6국04-04]·[6국03-04] · 목표 · 테마', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 5 && m.term === 2 && m.unit === 2 && m.unit_title === UT && m.subject === '국어' && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + (b - a > 1 ? '~' : '·') + b + '차시'), k + ' covers ' + m.covers);
  ok(/^(\[6국0(4-04|3-04)\])+$/.test(m.std), k + ' std ' + m.std); ok(m.goal && m.goal.length > 4, k + ' 목표'); ok(m.theme === '우리 반 문장 공방', k + ' theme'); }));
T('[6국04-04] 문법 = l01·l02·l03·l05·l09·l14 · [6국03-04] 매체 쓰기 = l01·l05·l07·l09·l12·l14', () => {
  ok(KEYS.filter(k => L[k].meta.std.indexOf('[6국04-04]') >= 0).join() === 'u2_l01,u2_l02,u2_l03,u2_l05,u2_l09,u2_l14', '04-04 ' + KEYS.filter(k => L[k].meta.std.indexOf('[6국04-04]') >= 0).join());
  ok(KEYS.filter(k => L[k].meta.std.indexOf('[6국03-04]') >= 0).join() === 'u2_l01,u2_l05,u2_l07,u2_l09,u2_l12,u2_l14', '03-04'); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img && /^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(s.data.img)), '②실사');
  ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length && ['pair', 'group', 'whole'].indexOf(s.data.type) >= 0), '④활동(1인 갈래 포함)'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));
T('실사 자리 8종 서로 다름 · 1단원 7종과도 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img), u1 = Object.keys(U1).map(k => U1[k].slides[2].data.img); ok(new Set(im).size === 8, im.join()); ok(!im.some(x => u1.indexOf(x) >= 0), '1단원 겹침'); });
T('extras 22 · id 차시마다 겹침 0 · 장 suggested_extras 가 있는 id', () => KEYS.forEach(k => { const ex = L[k].extras, ids = new Set(ex.map(e => e.id)); ok(ex.length === 22 && ids.size === 22, k + ' extras ' + ex.length); L[k].slides.forEach(s => s.suggested_extras.forEach(id => ok(ids.has(id), k + ' ' + s.id + ' ' + id))); }));
T('활동 분 = 발문 분 · 활동 분 ≤ 차시 분의 절반', () => KEYS.forEach(k => { const a = L[k].slides[12].data; ok(a.minutes === a.tnote.min, k); ok(a.minutes <= L[k].meta.duration_min / 2, k + ' ' + a.minutes); }));

console.log('═══ D. 복습 계보 ═══');
T('u2_l01 복습 = 1단원 u1_l14 출구 그대로 · from g5s2_korean:u1_l14', () => { const rv = L.u2_l01.slides[1].data, ex = U1.u1_l14.slides[15].data.items; ok(rv.from === 'g5s2_korean:u1_l14', rv.from); ok(/지난 단원/.test(rv.title), rv.title);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '1단원 출구 어긋남'); });
KEYS.slice(1).forEach((k, i) => T(k + ' 복습 = ' + KEYS[i] + ' 출구', () => { const rv = L[k].slides[1].data; const ex = L[KEYS[i]].slides[15].data.items; ok(rv.from === KEYS[i], 'from ' + rv.from);
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));
T('마지막 장: l14 = 「이 단원을 마쳐요」 · 나머지 「다음 시간엔」', () => KEYS.forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === (i === KEYS.length - 1 ? '이 단원을 마쳐요' : '다음 시간엔'), k); }));
T('1단원 l14 예고 = 이 단원 이름', () => ok(/올바른 문장으로 글을 써요/.test(U1.u1_l14.slides[18].data.preview), 'u1 예고'));

console.log('═══ E. 기본 문제 정답 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 셋 — 정답 표시 · 모두 고르기 ≥2 · 풀이 끝 = 정답', () => { const bp = L[k].slides.filter(s => s.block === 'basic_problem');
  ok(bp.length === 3, bp.length);
  bp.forEach(s => { const d = s.data, c = d.options.filter(o => o.correct); ok(d.options.length >= 2 && c.length >= 1, s.id + ' 정답');
    if (d.multi) { ok(c.length >= 2 && c.length < d.options.length, s.id + ' ms'); ok(d.note.indexOf(c.length + '개') >= 0, s.id + ' 개수'); ok(/모두 고르세요/.test(d.question), s.id + ' 모두 고르기 물음'); }
    else { ok(c.length === 1, s.id + ' 하나'); ok(nb(d.note).indexOf(nb(c[0].text)) >= 0, s.id + ' 풀이 끝 ' + d.note); ok(!/모두/.test(d.question), s.id + ' 하나인데 모두'); }
    ok(new Set(d.options.map(o => o.text)).size === d.options.length, s.id + ' 보기 겹침'); }); }));
T('단원 전체 모두 고르기 ≥ 6 · 정답 자리 첫째 쏠림 기록(정보)', () => { const n = KEYS.reduce((a, k) => a + L[k].slides.filter(s => s.block === 'basic_problem' && s.data.multi).length, 0); ok(n >= 6, n); });
// 호응 문항 다시 셈: 부정 부사(전혀·별로·도저히·여간) 보기의 정답 = 부정 끝말 · 「반드시」 정답 = 「해야」 · 「왜냐하면」 정답 = 「때문」
T('호응 문항 다시 셈 — 부정 부사 ↔ 부정 끝말 · 반드시 ↔ 해야 · 왜냐하면 ↔ 때문 · 높임 ↔ 께서·-시-', () => {
  const lev = (k) => L[k].slides[11].data.levels; let n = 0;
  ok(/해야 한다$/.test(lev('u2_l03').기본.a) && /반드시/.test(lev('u2_l03').기본.q), 'l03 기본 반드시'); n++;
  ok(/께서/.test(lev('u2_l03').도전.a) && /셨다/.test(lev('u2_l03').도전.a), 'l03 도전 높임'); n++;
  ok(/도저히 안 될/.test(lev('u2_l14').도전.a), 'l14 도전 도저히'); n++;
  ok(/드렸다/.test(lev('u2_l14').기본.a) && /할머니께/.test(lev('u2_l14').기본.q), 'l14 기본 드리다'); n++;
  const b03 = L.u2_l03.slides.filter(s => s.block === 'basic_problem');
  ok(b03[0].data.options.find(o => o.correct).text === '전혀' && /않았다/.test(b03[0].data.scenario.body), 'l03 ① 전혀'); n++;
  ok(/때문이다$/.test(b03[2].data.options.find(o => o.correct).text) && /왜냐하면/.test(b03[2].data.question), 'l03 ③ 왜냐하면'); n++;
  const bad = b03[1].data.options.filter(o => !o.correct).map(o => o.text).join(); ok(/모자를 신고/.test(bad), 'l03 ② 모자를 신고 = 오답'); n++;
  const l14x = L.u2_l14.slides[4].data.fig.rows; ok(/별로 좋아하지 않는다/.test(l14x[1][1].name) && /끼고/.test(l14x[0][1].name) && /두르고/.test(l14x[0][1].name) && /되는 것이다/.test(l14x[2][1].name), 'l14 고친 문장'); n++;
  ok(n === 8, n); });
T('수준별 세 계단 각 문항·답 · 심화 open', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels; ['기본', '도전', '심화'].forEach(n => ok(lv[n] && lv[n].q && lv[n].a, k + ' ' + n)); ok(lv.심화.open === true, k + ' 심화 open'); }));
T('수준별 기본 ≠ 출구 문항(복습 계보와 겹치지 않게)', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels, ex = L[k].slides[15].data.items.map(x => x.q); ok(ex.indexOf(lv.기본.q) < 0, k); }));

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 560 (14차시 × 40) · 80분 넷 · 120분 하나', () => { const d = KEYS.map(k => L[k].meta.duration_min); ok(d.reduce((a, b) => a + b, 0) === 560, d); ok(d.filter(x => x === 80).length === 4 && d.filter(x => x === 120).length === 1, d); });

console.log('═══ G. 제재 ═══');
T('자체 집필 글 판: l01 「이모 댁에 다녀온 날」 빈칸 둘 · l03 일기 「수수깡 집 짓기」 · l05 개요 「강변에서 다시 띄운 연」 처음·가운데·끝', () => {
  const fig = (k, re) => L[k].slides.map(s => s.data.fig).find(f => f && f.k === 'text' && re.test(f.title));
  const a = fig('u2_l01', /이모 댁/); ok(a && a.lines.filter(l => /\( \? \)/.test(l.t || l)).length === 2, 'l01 빈칸');
  const d = fig('u2_l03', /수수깡/); ok(d && d.lines.length === 5, 'l03 일기');
  const e = fig('u2_l05', /다시 띄운 연/); ok(e && ['처음', '가운데', '끝'].every(p => e.lines.some(l => (l.t || l).indexOf(p + ' —') === 0)), 'l05 개요'); });
T('l03 일기의 어색한 문장 = 실제로 어색(여간·도저히·별로 + 긍정 끝말) 셋 · 바른 문장 하나', () => { const lines = L.u2_l03.slides.map(s => s.data.fig).find(f => f && f.k === 'text').lines.map(l => nb(l.t || l));
  const NEG = /(않|못|아니|안 )/; const bad = lines.filter(l => /여간|도저히|별로/.test(l) && !NEG.test(l)); ok(bad.length === 3, bad.join(' / ')); ok(lines.some(l => /^내일.*것이다\.$/.test(l)), '시간 호응 바른 문장'); });
T('교과서 원문 제재 이름 0(태윤 · 형섭 · 장미꽃 접기 · 은우 · 보미 · 지한 편지 · 제주도 · 영화 감독 도전기 · 어린 왕자)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); const re = /태윤|형섭|장미꽃 접|은우|보미|지한|제주도|영화 감독|어린 왕자/; ok(!re.test(s), k + ' ' + (s.match(/.{8}(태윤|형섭|장미꽃 접|은우|보미|지한|제주도|영화 감독|어린 왕자).{8}/) || [''])[0]); }));
T('l07 매체 셋(휴대 전화 메시지·전자 우편·학급 누리집) 장 · 전자 우편 판 = 받는 사람·제목·첫인사·첨부 자료·끝인사', () => { const s = txt(L.u2_l07); ['휴대 전화 메시지', '전자 우편', '학급 누리집'].forEach(x => ok(s.indexOf(x) >= 0, x));
  const lt = L.u2_l07.slides.map(x => x.data.fig).find(f => f && f.k === 'letter'); ok(lt && lt.toTag === '받는 사람' && ['제목', '첫인사', '첨부 자료', '끝인사'].every(t => lt.lines.some(l => l.tag === t)), '전자 우편 판'); });
T('주의할 점 넷(맞춤법·개인 정보·출처·이름 밝히기) = l07 · 출처 l09 · 개인 정보 l14', () => { const s7 = txt(L.u2_l07); ['맞춤법', '개인 정보', '출처', '누가 썼는지'].forEach(x => ok(s7.indexOf(x) >= 0, 'l07 ' + x)); ok(/출처/.test(txt(L.u2_l09)), 'l09 출처'); ok(/개인 정보/.test(txt(L.u2_l14)), 'l14 개인 정보'); });

console.log('═══ H. 선행·용어 ═══');
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['주어', /주어/, 'u2_l02'], ['목적어', /목적어/, 'u2_l02'], ['서술어', /서술어/, 'u2_l02'], ['호응', /호응/, 'u2_l03'], ['개요', /개요/, 'u2_l05'], ['첨부', /첨부/, 'u2_l07'], ['그림말', /그림말/, 'u2_l07'], ['칭찬 댓글', /칭찬 댓글/, 'u2_l12'], ['디지털 안내문', /디지털 안내문/, 'u2_l12']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3) + ' (예고 장·「다음:」 줄 빼고)', () => ok(firstK(re) === at, firstK(re))));
T('지도서 「용어 노출 금지」: 부사어 · 자릿수 · 필수적 · 선택 제약 · 보어 0 (교사 층 발문 포함)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/부사어|자릿수|필수적|선택 제약|보어/.test(s), k + ' ' + (s.match(/.{8}(부사어|자릿수|필수적|선택 제약|보어).{8}/) || [''])[0]); }));
T('호응 네 갈래 모두 l03 에 = 성분끼리(sents ✗/○) · 시간(어제·내일) · 높임(께서) · 낱말 뜻(모자·양말)', () => { const s = txt(L.u2_l03); ok(/어제/.test(s) && /내일/.test(s) && /께서/.test(s) && /모자/.test(s) && /양말/.test(s), 'l03'); const sf = L.u2_l03.slides[3].data.fig; ok(sf.k === 'sents' && sf.items.filter(i => i.bad).length === 2 && sf.items.filter(i => i.ok).length === 2, 'sents ○✗'); });
T('「어디에·누구에게」 말이 꼭 필요한 서술어(넣다·드리다·두다·보내다) = l02 에서 용어 없이', () => { const s = txt(L.u2_l02); ['넣다', '드리다', '두다', '보내다', '어디에', '누구에게'].forEach(x => ok(s.indexOf(x) >= 0, x)); });

console.log('═══ I. 오개념·심화 ═══');
T('l02 오개념 = 「주어·목적어·서술어 늘 다」 ✗ · 서술어가 정함', () => { const m = L.u2_l02.slides[7].data; ok(/모두/.test(m.wrong) && /서술어가 정해요/.test(m.right), 'l02'); });
T('l07 오개념 = 좋은 매체 하나 ✗ · 읽을 사람과 상황', () => { const m = L.u2_l07.slides[7].data; ok(/하나/.test(m.wrong) && /읽을 사람과 상황/.test(m.right), 'l07'); });
T('l14 오개념 = 고친 문장 하나뿐 ✗ · 여러 가지 + 까닭', () => { const m = L.u2_l14.slides[7].data; ok(/한 가지뿐/.test(m.wrong) && /여러 가지/.test(m.right) && /까닭/.test(m.right), 'l14'); });
T('심화 장 「하나가 아님·다를 수」와 「까닭·근거」를 함께 둔 차시 ≥ 6', () => { const n = KEYS.filter(k => { const d = L[k].slides[14].data; return /하나가 아니|다를 수/.test(d.note) && /근거|까닭/.test(d.note); }).length; ok(n >= 6, n); });
T('l09 심화·l07 심화: 「누리집이 늘 낫다」 인상 금지 — 다른 매체가 나은 경우 함께', () => { ok(/메시지가 나을 수도/.test(L.u2_l07.slides[14].data.note), 'l07'); ok(/상황에 따라/.test(L.u2_l09.slides[3].data.tnote.watch), 'l09 발문'); });

console.log('═══ J. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('그림 부품 렌더(ko-text · ko-sents · ko-tree · ko-sound ox · ko-moods · so-link · so-post · ko-letter · so-news · ko-note · fig-chain)', () => { const all = KEYS.map(k => L[k].slides.filter(s => s.block === 'concept').map(s => String((render(s, L[k], true) || {}).body || '')).join('')).join('');
  ['ko-text', 'ko-sents', 'ko-tree', 'ko-sound', 'ko-prs ox', 'ko-moods', 'so-link', 'so-post', 'ko-letter', 'so-news', 'ko-note'].forEach(c => ok(all.indexOf(c) >= 0, c)); });
T('개념 장 그림 32장 전부 렌더 비지 않음', () => { let n = 0; KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const h = w.KT2_FIG ? w.KT2_FIG.render(s.data.fig) : 'x'; ok(h && h.length > 40, k + ' ' + s.id + ' ' + s.data.fig.k); n++; })); ok(n === 32, n); });

console.log('═══ K. 물음 끝 ═══');
T('기본 문제 물음 끝 「요?」·「세요.」 · 수준별 「요?·요.」 · 출구 「?」 · 동기 「요?」', () => KEYS.forEach(k => L[k].slides.forEach(s => {
  if (s.block === 'basic_problem') ok(/(요\?|세요\.)$/.test(s.data.question), k + ' ' + s.id + ' ' + s.data.question);
  if (s.block === 'leveled_problem') Object.values(s.data.levels).forEach(l => ok(/요[?.]$/.test(l.q), k + ' ' + l.q));
  if (s.block === 'exit_ticket') s.data.items.forEach(i => ok(/\?$/.test(i.q), k + ' ' + i.q));
  if (s.block === 'motivate') ok(/요\?/.test(s.data.question), k + ' 동기 물음'); })));

console.log('═══ L. 차단 어휘 ═══');
T('「결」 글자 0(결코 포함) · 박음·빵꾸·갈아엎 0 · 겹낫표 0 · 비속 줄임말 0', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/결|박음|빵꾸|갈아엎|『|』|ㅈㄴ|ㅅㅂ/.test(s), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎|『|ㅈㄴ).{10}/) || [''])[0]); }));

console.log('═══ M. 5학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0 · 테마에 인물 없음', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!L[k].slides[2].data.kids, k + ' kids'); ok(!/곰이|펭이/.test(L[k].meta.theme), k + ' theme'); }));

console.log(`\n${fail ? '❌' : '✅'} gate_g5s2_korean_u2: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);

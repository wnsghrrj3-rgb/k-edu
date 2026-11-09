/* gate_g6s2_social_u2.js — 6학년 2학기 사회 2단원 「시장경제와 국가 간 거래」 케이티처 2세대 게이트 (교과서판 2학기 준비본, 2026-11-09 · 오푸스 5.5 — gate_g5s2_social_u2 틀).
   지도서 직행(자기주도 원문 없음) — 교과서·지도서 수를 게이트 안에서 다시 세어 데이터와 맞댄다.
   A 로드·meta · B 19장 골격 · C 7요소(6학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 1단원 u1_l14 출구) · E 기본 문제 정답 · F 분 합계 800
   G 그날의 선택 꼴·차시 잇기 · H 차시별 지도서 핵심 사실 대조(수 다시 셈) · I 선행 용어 첫 등장·다루지 않는 것 · J 실렌더 · K 차단 어휘·영어 코드·「지도서」 · L 6학년 인물 0
   실행: NODE_PATH=$(cygpath -w ~/.jsdom/node_modules) node kedu/teacher/표준/gate_g6s2_social_u2.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g6s2_social_u2.js'));
const KEYS = ['u2_l01', 'u2_l02', 'u2_l03', 'u2_l05', 'u2_l06', 'u2_l08', 'u2_l09', 'u2_l10', 'u2_l11', 'u2_l13', 'u2_l14', 'u2_l15', 'u2_l17', 'u2_l19', 'u2_l20'];
const COV = { u2_l01: [1, 1], u2_l02: [2, 2], u2_l03: [3, 4], u2_l05: [5, 5], u2_l06: [6, 7], u2_l08: [8, 8], u2_l09: [9, 9], u2_l10: [10, 10], u2_l11: [11, 12], u2_l13: [13, 13], u2_l14: [14, 14], u2_l15: [15, 16], u2_l17: [17, 18], u2_l19: [19, 19], u2_l20: [20, 20] };
const PAGES = { u2_l01: 'p.54~59', u2_l02: 'p.60~62', u2_l03: 'p.63~68', u2_l05: 'p.69~71', u2_l06: 'p.72~77', u2_l08: 'p.78~80', u2_l09: 'p.81~84', u2_l10: 'p.85~87', u2_l11: 'p.88~93', u2_l13: 'p.94~96', u2_l14: 'p.97~99', u2_l15: 'p.100~105', u2_l17: 'p.106~111', u2_l19: 'p.112~113', u2_l20: 'p.114~117' };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '시장경제와 국가 간 거래';
const txt = (les) => JSON.stringify(les.slides.map(s => { const d = Object.assign({}, s.data); delete d.tnote; return d; }));
const nb = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const corr = (s) => s.data.options.filter(o => o.correct).map(o => o.text);
const has = (s, o) => s.data.options.some(x => x.text === o && !x.correct);
const D = (k, i) => L[k].slides[i].data;
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const render = (s, les, rev) => w.KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });

// ── 교과서·지도서 수(지도서 쪽을 직접 옮겨 게이트가 다시 셈) ──
const GNI_KR = [120, 280, 1870, 6450, 11030, 22290, 35490], GNI_OO = [230, 240, 770, 830, 1180, 2360, 4230], GNI_Y = ['1960', '1970', '1980', '1990', '2000', '2010', '2023']; // 지도서 177
const CARS = [{ seat: 7, price: 3000, warr: 5, km: 15 }, { seat: 5, price: 2000, warr: 3, km: 10 }, { seat: 9, price: 4000, warr: 5, km: 9 }], BUDGET = 5000; // 지도서 142 (만 원)
const PRICE = { ga: 2200, we: 2300, na: 2400, cost: 1500 }, AD = { 온라인: 46, 방송: 27, 기타: 12, 지면: 10, 현장: 5 }; // 지도서 163(광고비 = ㉰ 기업)
const RUBRIC = { 실천: [1, 1, 5], 효과: [5, 5, 5], 비용: [3, 1, 5], 시간: [3, 1, 4] }; // 지도서 199
const POV = [['코스타리카', 21.2], ['미국', 18.1], ['이스라엘', 16.8], ['대한민국', 14.9], ['뉴질랜드', 14.3], ['에스파냐', 13.7], ['캐나다', 11.9], ['영국', 11.8], ['프랑스', 8.3], ['노르웨이', 8.0]]; // 지도서 192
const RICE = [['인도', 40.5], ['타이', 15.3], ['베트남', 13.5], ['파키스탄', 6.5], ['미국', 3.8], ['기타', 20.4]], OIL = [['사우디아라비아', 7.3], ['러시아', 5.3], ['캐나다', 4.0], ['이라크', 3.8], ['미국', 3.5], ['아랍 에미리트', 3.5]]; // 지도서 231
const CONTENT = { y: ['2006', '2008', '2010', '2012', '2014', '2016', '2018', '2020', '2022'], v: [13.7, 23.4, 31.9, 46.1, 52.7, 60.1, 96.2, 119.2, 132.4] }; // 지도서 184
const LIFE = { y: ['1970', '1980', '1990', '2000', '2010', '2022'], v: [62.3, 66.1, 71.7, 76.0, 80.2, 82.7] }, EDU = [6.5, 7.8, 9.2, 10.8]; // 지도서 185
const U1_EXIT = [['세계의 기후를 구분하는 두 기준은 무엇일까요?', '기온과 강수량'], ['산지·하천·해안 지형에서 볼 수 있는 경관을 하나씩 말하면?', '산지 — 화산(고원·산맥) · 하천 — 계곡(평야·폭포) · 해안 — 갯벌(모래사장·절벽)'], ['이 단원에서 배운 자연환경과 생활 모습의 관계를 한 문장으로 말하면?', '지형 경관과 기후는 사람들의 생활 모습에 영향을 줌']];

console.log('═══ A. 로드·meta ═══');
T('키 15개 = 지도서 차시 묶음 첫 번호(1·2·3~4·5·6~7·8·9·10·11~12·13·14·15~16·17~18·19·20)', () => ok(JSON.stringify(Object.keys(L)) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 6학년 2학기 사회 · unit 2 · 단원명 · n·covers·분 = 지도서 차시 · 교과서 쪽 · 목표 · 테마에 인물 없음', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 6 && m.term === 2 && m.unit === 2 && m.unit_title === UT && m.subject === '사회' && m.n === a, k);
  ok(m.duration_min === 40 * (b - a + 1) && m.covers === (a === b ? a + '차시' : a + '·' + b + '차시'), k + ' 분·covers'); ok(m.textbook === PAGES[k], k + ' 쪽 ' + m.textbook); ok(m.goal && /할 수 있다$/.test(m.goal), k + ' 목표'); ok(m.theme && !/곰이|펭이/.test(m.theme), k + ' theme'); }));
T('topic·std: 1~7 = 우리나라 시장경제의 특징 [6사11-01] · 8~12 = 경제성장과 우리 생활 [6사11-02] · 13~18 = 세계 속의 무역 [6사11-03] · 19 = 창의·융합 · 20 = 단원 마무리(셋 다)', () => KEYS.forEach(k => { const m = L[k].meta, n = m.n;
  if (n <= 7) ok(m.topic === '우리나라 시장경제의 특징' && m.std === '[6사11-01]', k); else if (n <= 12) ok(m.topic === '경제성장과 우리 생활' && m.std === '[6사11-02]', k); else if (n <= 18) ok(m.topic === '세계 속의 무역' && m.std === '[6사11-03]', k);
  else ok(m.topic === (n === 19 ? '창의·융합 — 생각을 펼쳐요' : '단원 마무리') && m.std === '[6사11-01][6사11-02][6사11-03]', k + ' ' + m.topic); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block); ok(s.stage === STAGE[i], s.id + ' stage'); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
KEYS.forEach(k => T(k + ' extras — 장이 가리키는 id 모두 있음 · id 겹침 0 · 17개', () => { const ids = L[k].extras.map(e => e.id); ok(ids.length === 17, ids.length); ok(new Set(ids).size === ids.length, '겹침'); L[k].slides.forEach(s => (s.suggested_extras || []).forEach(x => ok(ids.indexOf(x) >= 0, s.id + ' ' + x))); }));

T('개념 장 글 ≤ 160자(** 빼고 · 측정 1.0배 넘침 예방 — 본보기 최대 136자)', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => { const n = s.data.content.replace(/\*\*/g, '').length; ok(n <= 160, k + ' ' + s.id + ' ' + n); })));
console.log('═══ C. 7요소 (6학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, hv = f => sl.some(f);
  ok(hv(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(hv(s => s.data.img && /^assets\/photo\/social\/[a-z_]+\.jpg$/.test(s.data.img)), '②실사');
  ok(hv(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(hv(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length), '④활동(1인 포함)'); ok(hv(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(hv(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문'); }));
T('실사 자리 이름 15개 서로 다름', () => { const im = KEYS.map(k => D(k, 2).img); ok(new Set(im).size === 15, im.join(',')); });
T('발문 tnote: ask 둘 · watch · min 숫자', () => KEYS.forEach(k => L[k].slides.filter(s => s.data.tnote).forEach(s => { const t = s.data.tnote; ok(Array.isArray(t.ask) && t.ask.length === 2 && t.ask.every(Boolean) && t.watch && typeof t.min === 'number', k + ' ' + s.id); })));

console.log('═══ D. 복습 계보 ═══');
T('u2_l01 복습 = 1단원 마지막 차시(g6s2_social:u1_l14) 출구 셋', () => { const rv = D('u2_l01', 1); ok(rv.from === 'g6s2_social:u1_l14', rv.from);
  let ex = U1_EXIT; const f1 = path.join(TDIR, 'data/g6s2_social_u1.js');
  if (fs.existsSync(f1)) { const U = load(f1); ok(U.u1_l14, '1단원 데이터에 u1_l14 없음'); ex = U.u1_l14.slides[15].data.items.map(x => [x.q, x.a]); }
  ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex), '1단원 출구 어긋남'); });
KEYS.slice(1).forEach((k, i) => T(k + ' 복습 = ' + KEYS[i] + ' 출구', () => { const rv = D(k, 1), ex = D(KEYS[i], 15).items;
  ok(rv.from === 'g6s2_social:' + KEYS[i], 'from ' + rv.from); ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));

console.log('═══ E. 기본 문제 정답 ═══');
KEYS.forEach(k => T(k + ' 기본 문제 셋 — 정답 표시 · 모두 고르기 ≥2 · 풀이 끝 = 정답', () => { const bp = L[k].slides.filter(s => s.block === 'basic_problem');
  ok(bp.length === 3, bp.length);
  bp.forEach(s => { const d = s.data, c = d.options.filter(o => o.correct); ok(d.options.length >= 2 && c.length >= 1, s.id + ' 정답');
    if (d.multi) { ok(c.length >= 2 && c.length < d.options.length, s.id + ' ms'); ok(d.note.indexOf(c.length + '개') >= 0, s.id + ' 개수'); }
    else { ok(c.length === 1, s.id + ' 하나'); ok(nb(d.note).indexOf(nb(c[0].text)) >= 0, s.id + ' 풀이 끝 ' + d.note); }
    ok(new Set(d.options.map(o => o.text)).size === d.options.length, s.id + ' 보기 겹침'); }); }));
T('수준별 세 계단 각 문항·답 있음 · 심화 = 열린 답 · 기본·도전 = 풀이 차례 셋', () => KEYS.forEach(k => { const lv = D(k, 11).levels; Object.entries(lv).forEach(([n, x]) => ok(x && x.q && x.a, k + ' 계단 ' + n)); ok(lv.심화.open, k + ' 심화 open'); ok(lv.기본.steps.length === 3 && lv.도전.steps.length === 3, k + ' steps'); }));

console.log('═══ F. 분 합계 ═══');
T('분 합계 = 800 (단원 20차시 × 40)', () => { const n = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0); ok(n === 800, n); });

console.log('═══ G. 그날의 선택 · 차시 잇기 ═══');
KEYS.forEach(k => T(k + ' s15 그날의 선택 = 상황 · ①② 고르기 · 그때 실제로는 · 다음 이야기', () => { const d = D(k, 14);
  ok(d.title === '그날의 선택', d.title); ok(d.context && d.context.length > 40, 'context'); ok(/①[^②]+②/.test(d.challenge) && /까닭/.test(d.challenge), 'challenge');
  ok(/^그때 실제로는:/.test(d.note) && /\n→ 다음 이야기: .+/.test(d.note), 'note'); }));
const LINK = [['u2_l01', '시장경제', '시장경제가'], ['u2_l02', '가계와 기업의 역할', '가계와 기업의 역할'], ['u2_l03', '근로자의 권리를 보호하는 모습', '근로자의 권리를 보호하는 모습'], ['u2_l05', '기업의 자유와 사회적 책임', '기업의 자유와 사회적 책임'], ['u2_l06', '경제성장', '경제성장이 무엇인지'], ['u2_l08', '경제성장이 우리 생활에 미치는 영향', '경제성장이 우리 생활에 미치는 영향'], ['u2_l09', '빠른 경제성장으로 발생한 문제', '빠른 경제성장으로 발생한 문제를 알아볼까요'], ['u2_l10', '빠른 경제성장으로 발생한 문제를 풀어 가는 방법', '문제를 풀어 볼까요'], ['u2_l11', '무역', '무역이 무엇인지'], ['u2_l13', '무역이 이루어지는 까닭', '무역이 이루어지는 까닭'], ['u2_l14', '무역이 이루어지는 다양한 모습', '무역이 이루어지는 다양한 모습'], ['u2_l15', '무역을 통한 상호 의존과 경쟁', '상호 의존과 경쟁 관계'], ['u2_l17', '생각을 펼쳐요', '생각을 펼쳐요'], ['u2_l19', '단원 마무리', '단원 마무리']];
T('s19 예고(**굵은 이름**) → 다음 차시 제목으로 이어짐 · 14쌍', () => LINK.forEach(([k, pv, tt]) => { const nx = KEYS[KEYS.indexOf(k) + 1]; ok(D(k, 18).preview.indexOf('**' + pv + '**') >= 0, k + ' 예고 ' + pv); ok(L[nx].meta.title.indexOf(tt) >= 0, nx + ' 제목 ' + tt); }));
const NEXTW = { u2_l01: '시장경제', u2_l02: '가계와 기업', u2_l03: '근로자', u2_l05: '기업', u2_l06: '경제성장', u2_l08: '생활', u2_l09: '문제', u2_l10: '풀어 갈', u2_l11: '나라와 나라 사이의 거래', u2_l13: '왜', u2_l14: '수입', u2_l15: '돕기만', u2_l17: '기업의 대표', u2_l19: '생각 그물', u2_l20: '지구촌' };
T('그날의 선택 「다음 이야기」 굵은 낱말 = 다음 차시 주제', () => KEYS.forEach(k => { const tail = D(k, 14).note.split('→ 다음 이야기:')[1]; ok(tail && tail.indexOf('**' + NEXTW[k]) >= 0, k + ' ' + NEXTW[k]); }));
T('인과 줄: 요약 화살표 ≥3 · 마지막 = 「다음:」 물음 · 요약 점 넷', () => KEYS.forEach(k => { const a = D(k, 16).arrows; ok(a.length >= 3 && a.slice(0, -1).every(x => /→/.test(x)) && /^다음: .+\?$/.test(a[a.length - 1]), k); ok(D(k, 16).points.length === 4, k + ' 점'); }));
T('next_lesson = 「다음 시간엔」 · 단원 끝(20차시) = 「이 단원을 마쳐요」 + 다음 단원 「지구촌 사람들」', () => { KEYS.forEach(k => ok(D(k, 18).title === (L[k].meta.n === 20 ? '이 단원을 마쳐요' : '다음 시간엔'), k)); ok(/\*\*지구촌 사람들\*\*/.test(D('u2_l20', 18).preview) && /지구촌 사람들/.test(D('u2_l20', 14).note), '3단원 예고'); });
T('주제 마무리(6~7·11~12·17~18차시) s18 = 「얼마나 잘했을까」 + 지도서 문항 셋(📚🔧💛) · 나머지 = 스스로 점검해요', () => KEYS.forEach(k => { const d = D(k, 17), endk = ['u2_l06', 'u2_l11', 'u2_l17'].indexOf(k);
  if (endk >= 0) { ok(d.title === '얼마나 잘했을까 — ' + (endk + 1) + '주제 마무리', k + ' ' + d.title); } else ok(d.title === '스스로 점검해요', k);
  ok(d.items.length === 3 && /^📚/.test(d.items[0]) && /^🔧/.test(d.items[1]) && /^💛/.test(d.items[2]), k + ' 셋'); }));
T('얼마나 잘했을까 문항 = 지도서 167·201·247쪽 그대로(가계와 기업의 역할 · 해결 방안 → 풀어 갈 방안 · 무역의 필요성을 존중)', () => { ok(/가계와 기업의 역할을 설명/.test(D('u2_l06', 17).items[0]) && /사회적 책임에 관심/.test(D('u2_l06', 17).items[2]), '1주제'); ok(/우리 생활에 미치는 영향을 설명/.test(D('u2_l11', 17).items[0]) && /풀어 갈 방안을 찾을/.test(D('u2_l11', 17).items[1]), '2주제'); ok(/무역이 발생하는 까닭을 설명/.test(D('u2_l17', 17).items[0]) && /무역의 필요성을 존중/.test(D('u2_l17', 17).items[2]), '3주제'); });

console.log('═══ H. 차시별 지도서 핵심 사실 대조 ═══');
T('l01(126~128): 항구 장면(경제활동·다른 나라와 교류) · 세 주제 차례 · 미션 = 네 사람의 말 → 소고기·오렌지·밀가루 · 첫째 말 = 포도주·키위·치즈 없음 · 공부할 내용 빈칸 · 탐구 질문 예 · 그날의 선택 = 사과 가격(맛 아님)', () => { const d = L.u2_l01.slides;
  ok(/\*\*경제활동\*\*/.test(d[2].data.desc) && /\*\*다른 나라와 교류\*\*/.test(d[2].data.desc), '동기');
  ok(['우리나라 시장경제의 특징', '경제성장과 우리 생활', '세계 속의 무역'].every((x, i) => d[3].data.fig.items[i].kind === x), '세 주제 차례');
  ok(['포도주·키위·치즈', '소고기', '바나나·오렌지', '밀가루'].every(x => d[5].data.content.indexOf('**' + x + '**') >= 0) && d[5].data.fig.items.length === 4, '네 사람의 말');
  ok(corr(d[10])[0] === '소고기·오렌지·밀가루' && has(d[10], '포도주·키위·치즈'), '기본 ③'); ok(/없다$/.test(corr(d[8])[0]), '기본 ① 없음');
  ok(corr(d[9]).length === 3 && has(d[9], '세계의 기후와 다양한 생활 모습'), '기본 ② 지난 단원 함정');
  ok(['시장경제·근로자·사회적 책임', '경제성장·우리 생활·문제', '무역·다양한 모습·상호 의존·경쟁'].every(x => d[6].data.content.indexOf(x) >= 0) && /기업은 어떤 역할/.test(d[6].data.content), '빈칸·탐구 질문');
  ok(/사과 가격/.test(d[14].data.context) && /맛 때문이 아니라/.test(d[14].data.note) && /\*\*사람들이 사고 싶어 하는 사과의 양\*\*/.test(d[14].data.note), '그날의 선택'); });
T('l02(134~136): 시장 = 거래가 이루어지는 곳 · 장소와 상관없이(온라인 쇼핑몰·거래소) · 네 곳 · 가계 = 생활 공동체 · 기업 = 이윤을 목적으로 · 이윤 = 수입 − 비용 · 가격 = 필요로 하는 양 + 제공하는 양 · 시장경제 · 꼭 기억해요(시장 / 시장경제) · 봉사 활동 함정', () => { const d = L.u2_l02.slides;
  ok(/물건이나 \*\*서비스\*\*의 거래가 이루어지는 곳/.test(d[3].data.content) && /\*\*장소와 상관없이\*\*/.test(d[3].data.content) && /\*\*온라인 쇼핑몰\*\*/.test(d[3].data.content), '시장');
  ok(['전통 시장', '대형 할인점', '문구점', '온라인 쇼핑'].every((x, i) => d[3].data.fig.items[i].name === x), '네 곳');
  ok(/\*\*생활 공동체\*\*/.test(d[4].data.content) && /\*\*이윤\*\*을 목적으로/.test(d[4].data.content) && /수입에서 생산하는 데 들어간 비용을 뺀/.test(d[4].data.content), '가계·기업·이윤');
  ok(/\*\*사람들이 필요로 하는 상품의 양\*\*/.test(d[5].data.content) && /\*\*기업에서 제공하는 상품의 양\*\*/.test(d[5].data.content), '가격');
  ok(/\*\*자유롭게 경쟁\*\*/.test(d[6].data.content) && /\*\*시장경제\*\*/.test(d[6].data.content), '시장경제');
  ok(corr(d[8])[0] === '시장' && has(d[8], '가계'), '꼭 기억해요 1'); ok(corr(d[10])[0] === '시장경제', '꼭 기억해요 2'); ok(corr(d[9]).length === 3 && d[9].data.options.some(o => /봉사 활동/.test(o.text) && !o.correct), '단원 평가 2 봉사 활동');
  ok(/건물/.test(d[7].data.wrong) && /장소와 상관없이/.test(d[7].data.right), '오개념 = 시장 ≠ 건물'); });
T('l03(141~146): 가족 일과 오전 10시·오후 5시·7시·10시 · 가계 역할 · 자동차 표 다시 셈(인승·가격·보증·연비 · 5천만 원) · 기업 역할 넷 · 고리 넷 · 꼭 기억해요(소득 / 기업) · 재미있게 확인해요 함정 · 사이버 평판 관리자 · 그날의 선택 = 『팜 뉴스』 생산 시설', () => { const d = L.u2_l03.slides;
  ok(['오전 10시', '오후 5시', '오후 7시', '오후 10시'].every(x => d[2].data.desc.indexOf('**' + x + '**') >= 0), '일과');
  ok(/\*\*생산 활동에 참여\*\*/.test(d[3].data.content) && /\*\*적은 비용으로 가장 큰 만족\*\*/.test(d[3].data.content) && /이자/.test(d[3].data.content), '가계 역할');
  const ci = d[4].data.fig.items; ok(ci.length === 3, '차 셋'); CARS.forEach((c, i) => ok(ci[i].kind === c.seat + '인승 · ' + (c.price / 1000) + '천만 원 · ' + c.warr + '년 · 1 L에 ' + c.km + ' km', '자동차 ' + (i + 1) + ' ' + ci[i].kind));
  ok(CARS.every(c => c.price <= BUDGET) && /\*\*5천만 원\*\*/.test(d[4].data.content) && /\*\*중고차\*\*/.test(d[4].data.content), '예산·중고차');
  const cheapest = CARS.reduce((m, c, i) => c.price < CARS[m].price ? i : m, 0); ok(cheapest === 1 && d[9].data.options.some(o => /②는 세 차 가운데 가장 싸다/.test(o.text) && o.correct), '가장 싼 차 = ②');
  ok(CARS[1].warr === 3 && d[9].data.options.some(o => /②는 구입 후 5년/.test(o.text) && !o.correct), '② 보증 3년 함정'); ok(corr(d[9]).length === 3, '기본 ② 셋');
  ok(['생산·판매', '고용·급여', '연구', '세금'].every((x, i) => d[5].data.fig.items[i].name === x), '기업 역할 넷'); ok(corr(d[10])[0] === '세금', '기본 ③');
  ok(['노동력', '소득', '물건·서비스', '이윤'].every((x, i) => d[6].data.fig.items[i].name === x) && d[6].data.fig.items[0].kind === '가계 → 기업' && d[6].data.fig.items[3].kind === '시장 → 기업', '고리');
  ok(corr(d[8])[0] === '소득' && has(d[8], '비용'), '꼭 기억해요 1'); ok(/기업은 가계의 생산 활동에 참여/.test(d[7].data.wrong), '재미있게 확인해요 함정');
  ok(/사이버 평판 관리자/.test(JSON.stringify(d[13].data)), '별별 직업'); ok(/『팜 뉴스』/.test(d[14].data.note) && /생산 시설을 늘리고 오래된 시설을 교체/.test(d[14].data.note), '그날의 선택');
  ok(!/생산 시설/.test(JSON.stringify(d.slice(0, 14).map(x => x.data))), 's01~s14 생산 시설 0(그날의 선택 답 미리 드러나지 않게)'); });
T('l05(151~153): 「근로 기준법」 제60조 80 %·15일·1일 · 28 %·42 % · 유급 휴가 뜻 · 까닭 = 노동력·상호 의존 · 방법 토의 · 법과 제도 셋 + 최저 임금·육아 휴직 · 꼭 기억해요(법 / 협의할 수 없다 ✗) · 복지 혜택 그림 · 그날의 선택 = 근무 시간을 자유롭게 운영', () => { const d = L.u2_l05.slides, mot = d[2].data.desc;
  ok(/\*\*80 % 이상\*\*/.test(mot) && /\*\*15일\*\*/.test(mot) && /\*\*28 %\*\*/.test(mot) && /\*\*42 %\*\*/.test(mot), '기사 수'); ok(/제60조/.test(d[3].data.content) && /\*\*1일\*\*/.test(d[3].data.content) && /\*\*급여가 지급되는\*\*/.test(d[3].data.content), '유급 휴가');
  ok(/\*\*노동력\*\*/.test(d[4].data.content) && /\*\*상호 의존\*\*/.test(d[4].data.content), '까닭'); ok(d[5].data.fig.items.length === 4, '방법 넷');
  ok(['단체 만들기·가입', '기업과 협의', '함께 단체 행동'].every((x, i) => d[6].data.fig.items[i].name === x) && /\*\*최저 임금 제도\*\*/.test(d[6].data.content) && /\*\*육아 휴직 제도\*\*/.test(d[6].data.content), '법과 제도');
  ok(corr(d[8])[0] === '법', '꼭 기억해요 1'); ok(/협의할 수 없다/.test(d[7].data.wrong) && /협의할 수 있다/.test(d[7].data.right), '꼭 기억해요 2 함정 = 오개념');
  ok(d[9].data.options.some(o => /협의할 수 없다/.test(o.text) && !o.correct), '기본 ② 함정'); ok(/복지 혜택/.test(d[10].data.scenario.body) && /단체로 행동/.test(corr(d[10])[0]), '기본 ③');
  ok(/정지 신호가 안전 신호/.test(JSON.stringify(d[11].data)), '캠페인 문구'); ok(/출퇴근 시간을 개인별 상황에 맞게/.test(d[14].data.context) && /근무 시간을 자유롭게 운영하면 어떨까요/.test(d[14].data.note), '그날의 선택'); });
T('l06(162~167): 헌법·설립·자유 경쟁 · 『연합 뉴스』 투자·일자리·삶의 질 · 세 장면 다시 셈(가격 2,200·2,300·2,400 · 비용 1,500 · 광고비 합 100 · 1위 = ㉰ 기업 온라인) · 문제 넷 · 『이투데이』 2016·4월 22일·100그루 · 꼭 기억해요 · 단원 평가 7·8 · 그날의 선택 = 태양광 · 환경·사회·투명 경영', () => { const d = L.u2_l06.slides, c2 = d[4].data.content;
  ok(/헌법/.test(d[3].data.content) && /\*\*설립\*\*/.test(d[3].data.content) && /『연합 뉴스』/.test(d[3].data.content) && /\*\*투자와 일자리\*\*/.test(d[3].data.content) && /\*\*국민 삶의 질\*\*/.test(d[3].data.content), '기업의 자유');
  const pr = d[4].data.fig.items[1].kind + ' ' + d[9].data.scenario.body; ok([PRICE.ga, PRICE.we, PRICE.na].every(v => pr.indexOf(fmt(v)) >= 0) && pr.indexOf(fmt(PRICE.cost) + '원') >= 0 && c2.indexOf(fmt(PRICE.cost) + '원') >= 0 && /\*\*2,200원\*\*으로 낮춰요/.test(c2), '가격 장면(그림 꼬리표·기본 ②)');
  ok(Object.values(AD).reduce((a, b) => a + b, 0) === 100, '광고비 합 100'); const top = Object.keys(AD).reduce((m, x) => AD[x] > AD[m] ? x : m); const lq = D('u2_l06', 11).levels.도전.q; ok(top === '온라인' && Object.entries(AD).every(([n, v]) => lq.indexOf(n + ' ' + v + ' %') >= 0) && /1위 ㉰ 기업 광고비/.test(lq) && /1위 ㉰ 기업/.test(c2) && /\*\*온라인 광고\*\*/.test(c2) && d[4].data.fig.items[2].kind === '1위 ㉰ 기업 온라인 46 %' && !/㉯ 기업 광고/.test(c2 + lq), '광고비 = ㉰ 기업(도전 문항에 다섯 칸)');
  const b2 = d[9].data.options; ok(b2.some(o => o.text === '*우리 기업 상품은 ㉮ 기업보다 100원 비싸다'.slice(1) && o.correct === (PRICE.we - PRICE.ga === 100)), '100원'); ok(b2.some(o => /700원 높다/.test(o.text) && o.correct === (PRICE.ga - PRICE.cost === 700)), '700원'); ok(b2.some(o => /1,400원/.test(o.text) && !o.correct) && 1400 < PRICE.cost, '1,400원 함정'); ok(b2.some(o => /㉯ 기업 상품이 가장 비싸다/.test(o.text) && o.correct) && PRICE.na === Math.max(PRICE.ga, PRICE.we, PRICE.na), '가장 비쌈');
  ok(['환경 오염', '함께 가격 올리기', '잘못된 정보', '사업 방해'].every((x, i) => d[5].data.fig.items[i].name === x) && /\*\*이윤만\*\*/.test(d[5].data.content), '문제 넷');
  ok(/『이투데이』/.test(d[6].data.content) && /\*\*2016년\*\*/.test(d[6].data.content) && /\*\*지구의 날\(4월 22일\)\*\*/.test(d[6].data.content) && /\*\*신갈나무와 갈참나무 100그루\*\*/.test(d[6].data.content), '나무 심기');
  ok(/적은 비용으로 큰 이윤/.test(corr(d[8])[0]) && has(d[8], '큰 비용으로 적은 이윤을 얻도록 정한다'), '꼭 기억해요 1·단원 평가 7'); ok(/연구한다$/.test(corr(d[10])[0]), '단원 평가 8');
  ok(/그 자체로 나쁜/.test(d[7].data.wrong) && /과도한 경쟁/.test(d[7].data.right), '오개념 = 경쟁 ≠ 나쁨(지도서 164)');
  ok(/\*\*태양광 패널\*\*/.test(d[14].data.note) && /\*\*환경·사회·투명 경영\*\*/.test(d[14].data.note), '그날의 선택'); ok(!/태양광/.test(JSON.stringify(d.slice(0, 14).map(x => x.data))), 's01~s14 태양광 0'); ok(/벽화/.test(JSON.stringify(d[13].data)), '실생활 = 벽화'); });
T('l08(176~178): 1960년대·2020년대 · 경제성장 뜻 · 1인당 국민 총소득 다시 셈(sbars = 우리나라 7개 · 캡션 = ○○ 나라 7개 · 1960 ○○ 나라 높음 · 2023 차이 8배 넘게 9배 아래) · 한강의 기적 · 1960년대 경공업 · 1970년대 중화학 · 1988 · 1996년 12월 29번째 · 가계·기업·정부 · 성장 속도 편견 · 그날의 선택 = 5천여만 달러 → 100억 → 6,300억', () => { const d = L.u2_l08.slides, f = d[4].data.fig;
  ok(/\*\*1960년대\*\*/.test(d[2].data.desc) && /\*\*2020년대\*\*/.test(d[2].data.desc), '사진 둘'); ok(/\*\*생산 수준\*\*/.test(d[3].data.content) && /\*\*국민 소득\*\*/.test(d[3].data.content) && /\*\*경제 규모가 커지는 것\*\*/.test(d[3].data.content), '뜻');
  ok(f.k === 'sbars' && JSON.stringify(f.v) === JSON.stringify(GNI_KR) && JSON.stringify(f.x) === JSON.stringify(GNI_Y), 'sbars 우리나라'); ok(f.caption.indexOf(GNI_OO.map(fmt).join(' · ')) >= 0, '캡션 ○○ 나라');
  ok(GNI_OO[0] > GNI_KR[0] && /230달러\)가 우리나라\(120달러\)보다 높았고/.test(d[4].data.content), '1960 ○○ 나라 높음'); const r = GNI_KR[6] / GNI_OO[6]; ok(r > 8 && r < 9 && /8배 넘게/.test(d[9].data.options.filter(o => o.correct).map(o => o.text).join()), '2023 배수 ' + r.toFixed(2));
  ok(!/9배/.test(txt(L.u2_l08)), '학생 화면 「9배」 0(그래프 수와 어긋남 — 교사 팁에만)'); ok(/9배가량/.test(JSON.stringify(L.u2_l08.extras)) && /8\.4배/.test(JSON.stringify(L.u2_l08.extras)), '교사 팁 = 9배가량 ↔ 8.4배');
  ok(/「\*\*한강의 기적\*\*」/.test(d[5].data.content) && /\*\*경제 개발 5개년 계획\*\*/.test(d[5].data.content) && /1970년대부터 \*\*중화학 공업\*\*/.test(d[5].data.content) && /1988년 \*\*서울 올림픽\*\*/.test(d[5].data.content) && /1996년 12월/.test(d[5].data.content) && /\*\*29번째\*\*/.test(d[5].data.content), '한강의 기적');
  ok(/\*\*가계와 기업, 정부가 함께 노력\*\*/.test(d[6].data.content) && /\*\*일제의 식민 통치\*\*/.test(d[6].data.content), '함께'); ok(/빠른 나라는 좋은 나라/.test(d[7].data.wrong), '오개념 = 성장 속도 편견(지도서 177)');
  ok(corr(d[8])[0] === '경제성장' && has(d[8], '한강의 기적'), '꼭 기억해요 1·단원 평가 9'); ok(/OECD/.test(corr(d[10])[0]), '기본 ③');
  ok(/\*\*5천여만 달러\*\*/.test(d[14].data.context) && /\*\*수출 100억 달러\*\*/.test(d[14].data.note) && /\*\*6,300억 달러\*\*/.test(d[14].data.note), '그날의 선택 = 연설문'); });
T('l09(183~186): 첨단 기술 넷 · 생성형 인공지능 뜻 · 콘텐츠 수출액 다시 셈(sbars 9개 · 늘기만 함 · 2022 = 132억 4,000만 · 6.3 % · 전기차·가전제품 · 화장품·식품 · 가장 크게 는 구간 2016→2018) · 기대 수명 다시 셈(sbars 6개 · 늘기만 함 · 62.3→82.7) · 에듀 테크 6.5·7.8·9.2·10.8 · 단원 평가 11 · 빅데이터 전문가 · 그날의 선택 = 올빼미 버스(자정~오전 5시)', () => { const d = L.u2_l09.slides, c = d[4].data.fig, lf = d[5].data.fig;
  ok(['드론', '로봇 자동화', '자율 주행', '생성형 인공지능'].every((x, i) => d[3].data.fig.items[i].name === x) && /\*\*생산하는 속도가 빨라지고 생산량이 늘어났어요\*\*/.test(d[3].data.content), '첨단 기술');
  ok(c.k === 'sbars' && JSON.stringify(c.v) === JSON.stringify(CONTENT.v) && JSON.stringify(c.x) === JSON.stringify(CONTENT.y), 'sbars 콘텐츠'); ok(CONTENT.v.every((v, i) => !i || v > CONTENT.v[i - 1]), '늘기만');
  ok(/\*\*132억 4,000만 달러\*\*/.test(d[4].data.content) && /\*\*6\.3 %\*\*/.test(d[4].data.content) && /\*\*전기차·가전제품\*\*/.test(d[4].data.content) && /\*\*화장품·식품\*\*/.test(d[4].data.content), '기사');
  let mi = 1; CONTENT.v.forEach((v, i) => { if (i && v - CONTENT.v[i - 1] > CONTENT.v[mi] - CONTENT.v[mi - 1]) mi = i; }); ok(CONTENT.y[mi - 1] === '2016' && /2016 → 2018: 60\.1 → 96\.2/.test(JSON.stringify(L.u2_l09.extras)), '가장 크게 는 구간');
  ok(lf.k === 'sbars' && JSON.stringify(lf.v) === JSON.stringify(LIFE.v) && LIFE.v.every((v, i) => !i || v > LIFE.v[i - 1]) && /\*\*62\.3세\*\*/.test(d[5].data.content) && /\*\*82\.7세\*\*/.test(d[5].data.content), '기대 수명');
  ok(EDU.every((v, i) => !i || v > EDU[i - 1]) && lf.caption.indexOf('6.5조 원') >= 0 && lf.caption.indexOf('7.8조 원') >= 0 && lf.caption.indexOf('9.2조 원') >= 0 && lf.caption.indexOf('10.8조 원(전망)') >= 0, '에듀 테크');
  ok(corr(d[8])[0] === '콘텐츠', '기본 ①'); ok(d[9].data.options.some(o => /기대 수명은 줄어들었다/.test(o.text) && !o.correct) && corr(d[9]).length === 3, '단원 평가 11'); ok(corr(d[10])[0] === '빅데이터 전문가', '기본 ③');
  ok(/「\*\*올빼미 버스\*\*」/.test(d[14].data.note) && /\*\*자정부터 오전 5시까지\*\*/.test(d[14].data.note), '그날의 선택'); ok(!/올빼미/.test(JSON.stringify(d.slice(0, 14).map(x => x.data))), 's01~s14 올빼미 0'); });
T('l10(191~193): 『와이티엔』 일주일도 안 돼·55 % · 환경 문제 셋 원인 · 빈부 격차 뜻 · 1950년대 → 세계 10위 · 과소비·자원 낭비 뜻·기사 제목 둘 · 저임금·노사 갈등 기사 제목 둘 · 꼭 기억해요(환경 문제 / 빈부 격차) · 단원 평가 12 · 그날의 선택 = 상대적 빈곤율 다시 셈(14.9 % · 열 나라 가운데 네 번째)', () => { const d = L.u2_l10.slides;
  ok(/『와이티엔』/.test(d[2].data.desc) && /\*\*일주일도 안 돼\*\*/.test(d[2].data.desc) && /\*\*55 %\*\*/.test(d[2].data.desc), '뉴스'); ok(/\*\*무분별한 개발\*\*/.test(d[3].data.content) && /\*\*오염 물질\*\*/.test(d[3].data.content) && /\*\*환경 문제\*\*/.test(d[3].data.content), '환경');
  ok(/\*\*부유한 사람과 가난한 사람의 소득 차이가 커지는 것\*\*/.test(d[4].data.content) && /\*\*세계 10위 경제 대국\*\*/.test(d[4].data.content), '빈부 격차'); ok(!/상대적 빈곤율|14\.9/.test(JSON.stringify(d.slice(0, 14).map(x => x.data))), 's01~s14 상대적 빈곤율 0');
  ok(/버려지는 옷 10만 톤/.test(d[5].data.content) && /과시욕이 만든 과소비 사회/.test(d[5].data.content) && /\*\*과소비\*\*/.test(d[5].data.content) && /\*\*자원 낭비\*\*/.test(d[5].data.content), '과소비');
  ok(/임금 인상 놓고 산업계 노사 갈등/.test(d[6].data.content) && /최저 임금 기준 없어 갈등 반복/.test(d[6].data.content) && /\*\*노사 갈등\*\*/.test(d[6].data.content), '노사 갈등');
  ok(/과소비 문제가 발생/.test(d[7].data.wrong) && /환경 문제/.test(d[7].data.right), '꼭 기억해요 1 함정'); ok(corr(d[8])[0] === '빈부 격차', '꼭 기억해요 2'); ok(corr(d[10])[0] === '환경 문제' && has(d[10], '저출산 문제'), '단원 평가 12');
  const sorted = POV.slice().sort((a, b) => b[1] - a[1]); const rank = sorted.findIndex(x => x[0] === '대한민국') + 1; ok(rank === 4 && POV.length === 10, '순위 ' + rank);
  const n = d[14].data.note; ok(/\*\*14\.9 %\*\*/.test(n) && /열 나라 가운데 네 번째로 높았어요/.test(n) && sorted.slice(0, 3).every(([c, v]) => n.indexOf(c + ' ' + v + ' %') >= 0) && [['영국', 11.8], ['프랑스', 8.3], ['노르웨이', 8.0]].every(([c, v]) => n.indexOf(c + ' ' + v.toFixed(1) + ' %') >= 0), '상대적 빈곤율');
  ok(/저절로 사라지지 않아요/.test(n) && /유엔 무역 개발 협의회/.test(d[14].data.context), '선진국 → 저절로 ✗'); });
T('l11(198~201): 할 수 있어요 차례 다섯 · 평가 기준 다시 셈(12·8·19 → 캠페인 · 도전 15·9·24) · 노력 셋(정부·기업과 근로자·시민 단체와 개인) · 꼭 기억해요 2 · 단원 평가 13 · 암호 TRADE · 그날의 선택 = ◊◊ 마을 공동 어장 → 공유지의 비극(몇 달 뒤)', () => { const d = L.u2_l11.slides;
  ok(d[3].data.fig.items.length === 5 && /\*\*평가 기준\*\*/.test(d[3].data.content) && /\*\*실천 계획\*\*/.test(d[3].data.content), '차례');
  const sums = [0, 1, 2].map(i => Object.values(RUBRIC).reduce((a, r) => a + r[i], 0)); ok(JSON.stringify(sums) === '[12,8,19]', '합계 ' + sums);
  const c = d[4].data.content; ok(Object.values(RUBRIC).every(r => c.indexOf(r.join('·')) >= 0) && /\*\*12점\*\*/.test(c) && /\*\*8점\*\*/.test(c) && /\*\*19점\*\*/.test(c), '평가표 글'); ok(d[4].data.fig.items.map(x => x.kind).join() === sums.map(s => '합계 ' + s + '점').join(), '그림 꼬리표');
  ok(sums.indexOf(Math.max.apply(null, sums)) === 2 && /캠페인/.test(corr(d[8])[0]), '기본 ① = 최고점'); ok(/24·15·9점/.test(D('u2_l11', 11).levels.도전.a) && sums[2] + 5 === 24 && sums[0] + 3 === 15 && sums[1] + 1 === 9, '도전 덧셈');
  ok(['정부', '기업과 근로자', '시민 단체와 개인'].every((x, i) => d[5].data.fig.items[i].name === x), '노력 셋'); ok(/정부 혼자/.test(d[7].data.wrong), '꼭 기억해요 2 함정');
  ok(/부유한 사람들을 지원/.test(corr(d[9])[0]), '단원 평가 13'); ok(/T·R·A·D·E/.test(JSON.stringify(L.u2_l11.extras)), '암호');
  ok(/◊◊ 마을/.test(d[14].data.context) && /\*\*일주일에 두 번씩\*\*/.test(d[14].data.context) && /\*\*몇 달 뒤 물고기가 하나도 남지 않았어요\*\*/.test(d[14].data.note) && /\*\*공유지의 비극\*\*/.test(d[14].data.note) && /\*\*소중히 여기고 공동의 이익\*\*/.test(d[14].data.note), '그날의 선택');
  ok(!/공유지/.test(JSON.stringify(d.slice(0, 14).map(x => x.data))), 's01~s14 공유지 0'); ok(/해결/.test(L.u2_l11.meta.title) === false, '제목에 해결 0'); });
T('l13(214~216): 교실 물건 여섯 나라 · 무역·수입·수출·물자 뜻 · 기사 제목 다섯 · 꼭 기억해요(무역 / 사 오는 것 = 수출 ✗) · 단원 평가 14(세연·진수) · 그날의 선택 = 벽란도(판 것 다섯·사 간 것 넷)', () => { const d = L.u2_l13.slides;
  ok(['인도네시아', '중국', '사우디아라비아', '미국', '오스트레일리아', '베트남'].every(x => d[2].data.desc.indexOf('**' + x + '**') >= 0), '여섯 나라');
  ok(/\*\*물자나 서비스를 사고팔거나 교환하는 일\*\*/.test(d[4].data.content) && /\*\*나라와 나라 사이\*\*/.test(d[4].data.content) && /\*\*물자\*\*는/.test(d[4].data.content), '무역·물자'); ok(/\*\*사 오는 것\*\*을 \*\*수입\*\*/.test(d[5].data.content) && /\*\*파는 것\*\*을 \*\*수출\*\*/.test(d[5].data.content), '수입·수출');
  ok(['수입 학용품, 안전 확인 필수', '어린이 입맛 맞춘 수입 과자 인기', '수출품 실은 컨테이너 55개, 중앙아시아 도착', '국내 떡볶이 수출 길 활짝', '드라마, 예능 수출로 한국 널리 알린다'].every(x => d[6].data.content.indexOf(x) >= 0), '기사 제목 다섯');
  ok(/수출이라고 한다/.test(d[7].data.wrong), '꼭 기억해요 2 함정'); ok(corr(d[8])[0] === '무역', '꼭 기억해요 1'); ok(corr(d[9])[0] === '무역 · 수입 · 수출' && /세연/.test(d[9].data.scenario.body) && /진수/.test(d[9].data.scenario.body), '단원 평가 14');
  ok(/\*\*벽란도\*\*/.test(d[14].data.context) && /\*\*개경\*\*/.test(d[14].data.context) && /\*\*비단·약재·서적·악기·보석\*\*/.test(d[14].data.context) && /\*\*삼베·모시·인삼·종이\*\*/.test(d[14].data.note), '그날의 선택 = 벽란도'); ok(!/벽란도/.test(JSON.stringify(d.slice(0, 14).map(x => x.data))), 's01~s14 벽란도 0'); });
T('l14(221~223): 비행기·천연가스 · ㉮ 나라 = 옷 · ㉯ 나라 = 쌀(㉮가 둘 다 더 많이) · 운동화·닭고기 · 까닭 넷 · 꼭 기억해요 1(O) · 조건이 비슷함 함정 · 무역 놀이(사과·기차·게임·아연 · 글자 카드 12) · 그날의 선택 = 흑연 → 배터리 → 전기차', () => { const d = L.u2_l14.slides;
  ok(/\*\*비행기\*\*/.test(d[2].data.desc) && /\*\*천연가스\*\*/.test(d[2].data.desc), '동기'); ok(/\*\*한 나라 안에서 구하기는 어려워요\*\*/.test(d[3].data.content), '구하기 어려움');
  ok(d[4].data.fig.items[0].kind === '기술 수준이 높음 → 옷' && d[4].data.fig.items[1].kind === '쌀 재배에 알맞음 → 쌀' && /\*\*쌀과 옷을 모두 더 많이\*\*/.test(d[4].data.content) && /\*\*두 나라 모두 더 풍족\*\*/.test(d[4].data.content), '㉮㉯');
  ok(['운동화', '닭고기'].every((x, i) => d[5].data.fig.items[i].name === x) && /\*\*더 좋은 품질\*\*/.test(d[5].data.content) && /\*\*더 값싼\*\*/.test(d[5].data.content), '국내에 있어도 수입');
  ok(['자연환경', '자원', '자본', '기술'].every((x, i) => d[6].data.fig.items[i].name === x), '까닭 넷'); ok(/^맞아요/.test(corr(d[8])[0]), '꼭 기억해요 1 = O'); ok(corr(d[9])[0] === '㉮ 나라 — 옷, ㉯ 나라 — 쌀', '기본 ②');
  ok(corr(d[10]).length === 4 && d[10].data.options.some(o => /비슷함/.test(o.text) && !o.correct), '조건이 비슷함 함정'); ok(/필요가 없다/.test(d[7].data.wrong), '오개념');
  const st = JSON.stringify(d[12].data.steps); ok(/사과·기차·게임·아연/.test(st) && /ㅅ·ㅏ·ㄱ·ㅘ·ㅣ·ㅊ·ㅏ·ㅔ·ㅇ·ㅁ·ㅕ·ㄴ/.test(st) && st.match(/ㅅ·ㅏ·ㄱ·ㅘ·ㅣ·ㅊ·ㅏ·ㅔ·ㅇ·ㅁ·ㅕ·ㄴ/)[0].split('·').length === 12 && /4등분/.test(st) && /12등분/.test(st), '무역 놀이');
  ok(/\*\*세계적인 흑연 생산국\*\*/.test(d[14].data.context) && /\*\*전기차 배터리\*\*/.test(d[14].data.note) && /\*\*전기차를 수입\*\*/.test(d[14].data.note), '그날의 선택 = 흑연'); ok(!/흑연/.test(JSON.stringify(d.slice(0, 14).map(x => x.data))), 's01~s14 흑연 0'); });
T('l15(228~233): 수입품 넷·수출품 넷(한국 무역 협회 2024) · 원유 ≠ 석유 제품 · 정밀 화학 원료 · 가공 무역 흐름 · 쌀 수출국 다시 셈(합 100 · 인도 1위) · 원유 수출국(줄어드는 차례) · 독일 백신·일본 로봇·미국 동영상 · 단원 평가 16(③⑤)·17 · 박람회 셋 · 그날의 선택 = 싱가포르(서울보다 약간 넓음·항로·큰 항구) + 무역항 넷', () => { const d = L.u2_l15.slides, m = d[2].data.desc;
  ok(/원유·정밀 화학 원료·천연가스·석탄/.test(m) && /반도체·석유 제품·무선 통신 기기·자동차/.test(m) && /한국 무역 협회/.test(m), '수출입품');
  ok(/\*\*원유\*\*는 불순물을 없애지 않은 자연 상태의 석유/.test(d[3].data.content) && /\*\*휘발유·경유\*\*/.test(d[3].data.content) && /\*\*정밀 화학 원료\*\*/.test(d[3].data.content), '원유·석유 제품');
  ok(['천연자원 수입', '상품 생산', '수출'].every((x, i) => d[4].data.fig.items[i].name === x) && /\*\*천연자원이 부족\*\*/.test(d[4].data.content) && /\*\*기술이 발달\*\*/.test(d[4].data.content), '가공 무역');
  const f = d[5].data.fig; ok(f.k === 'sbars' && JSON.stringify(f.v) === JSON.stringify(RICE.map(x => x[1])) && JSON.stringify(f.x) === JSON.stringify(RICE.map(x => x[0])), 'sbars 쌀'); ok(Math.abs(RICE.reduce((a, x) => a + x[1], 0) - 100) < 1e-9, '쌀 합 100');
  ok(RICE.slice(0, 5).reduce((m2, x) => x[1] > m2[1] ? x : m2)[0] === '인도' && corr(d[10])[0] === '인도', '인도 1위'); ok(OIL.every((x, i) => !i || x[1] <= OIL[i - 1][1]) && f.caption.indexOf(OIL.map(x => x[0] + ' ' + x[1].toFixed(1)).join(' · ')) >= 0, '원유 수출국');
  ok(['백신', '로봇', '온라인 동영상 서비스'].every((x, i) => d[6].data.fig.items[i].name === x) && ['독일', '일본', '미국'].every((x, i) => d[6].data.fig.items[i].kind === x), '기술·문화');
  ok(corr(d[8]).length === 2 && d[8].data.options.some(o => /노동력이 많이 필요한/.test(o.text) && !o.correct), '단원 평가 16'); ok(/뛰어난 기술/.test(corr(d[9])[0]), '단원 평가 17');
  ok(['라스베이거스', '서울', '뉘른베르크'].every(x => JSON.stringify(d[13].data).indexOf(x) >= 0), '박람회 셋'); ok(/천연자원을 주로 수출/.test(d[7].data.wrong), '재미있게 확인해요 함정');
  ok(/서울보다 약간 넓은/.test(d[14].data.context) && /\*\*유럽과 아시아를 잇는 항로\*\*/.test(d[14].data.context) && /\*\*큰 항구\*\*/.test(d[14].data.note) && /\*\*필요한 나라에 다시 파는\*\*/.test(d[14].data.note) && ['로스앤젤레스', '상하이', '로테르담', '부산항'].every(x => d[14].data.note.indexOf(x) >= 0), '그날의 선택 = 싱가포르');
  ok(!/싱가포르/.test(JSON.stringify(d.slice(0, 14).map(x => x.data))), 's01~s14 싱가포르 0'); });
T('l17(242~247): 『전자 신문』 핵심 광물 공동 연구 센터 · 니켈·주석 · 경쟁 셋 + 생성형 인공지능 37억 360만 → 363억 5,810만 · 인도의 다리 · 부산항 자동화 항만 · 항만 뜻 · 관세 뜻·수입량 제한 · 베트남 까닭 셋·좋은 점·문제점 · 단원 평가 19(㉢㉣)·20 · 관세사 · 그날의 선택 = 1970년대 철강 → 세계적 철강 산업 국가', () => { const d = L.u2_l17.slides;
  ok(/『전자 신문』/.test(d[3].data.content) && /「\*\*핵심 광물 공동 연구 센터\*\*」/.test(d[3].data.content) && /니켈·주석/.test(d[3].data.content) && /\*\*광물 탐사 기술\*\*/.test(d[3].data.content), '상호 의존');
  ok(['첨단 기술 개발', '다른 나라 시설 건설', '더 나은 무역 환경'].every((x, i) => d[4].data.fig.items[i].name === x) && /37억 360만 달러/.test(d[4].data.content) && /363억 5,810만 달러/.test(d[4].data.content) && /\*\*인도의 다리\*\*/.test(d[4].data.content) && /\*\*자동화 항만\*\*/.test(d[4].data.content) && /항만: 배가 머물고 화물이 오르내리는 곳/.test(d[4].data.content), '경쟁');
  ok(/관세는 다른 나라에서 수입하는 상품에 부과하는 세금/.test(d[5].data.content) && /\*\*수입을 제한\*\*/.test(d[5].data.content), '관세');
  ok(['저렴한 노동력', '중국과 국경', '낮은 관세 약속'].every((x, i) => d[6].data.fig.items[i].name === x) && /『한국 무역 신문』/.test(d[6].data.content) && /\*\*정당한 임금\*\*/.test(d[6].data.content), '베트남');
  ok(corr(d[8])[0] === '㉢, ㉣', '단원 평가 19'); ok(/피해를 입는 일이 줄어든다/.test(d[7].data.wrong), '단원 평가 20 = 오개념'); ok(corr(d[10])[0] === '관세', '기본 ③');
  ok(d[9].data.options.some(o => /모든 나라의 경제가 나빠진다/.test(o.text) && !o.correct) && corr(d[9]).length === 3, '재미있게 확인해요'); ok(/관세사/.test(JSON.stringify(d[13].data)), '별별 직업');
  ok(/1970년대/.test(d[14].data.context) && /\*\*제철소\*\*/.test(d[14].data.context) && /\*\*높은 관세\*\*/.test(d[14].data.note) && /\*\*세계적인 철강 산업 국가\*\*/.test(d[14].data.note), '그날의 선택 = 철강'); ok(!/철강/.test(JSON.stringify(d.slice(0, 14).map(x => x.data))), 's01~s14 철강 0'); });
T('l19(252~253): 창의·융합 · 표지 예시 문구 셋 · 대표 상품 온라인 게임 ☆☆ · 중국·인도 · 사회적 책임 목표 예 · 근로자 노력(성과급·임금 인상·휴가·매주 대화) · 혼자 활동·색칠 도구 · 그날의 선택 = 카카오(카이·10 m·6 kg) → 공정 무역', () => { const d = L.u2_l19.slides;
  ok(/1등 게임을 개발하여 지속가능한 성장/.test(d[2].data.desc) && /매주 근로자와 대화의 시간/.test(d[2].data.desc) && /중국과 인도에서 인기몰이/.test(d[2].data.desc), '표지 예시');
  ok(d[4].data.fig.items[0].kind === '온라인 게임 ☆☆' && d[4].data.fig.items[2].kind === '중국·인도' && corr(d[10])[0] === '중국·인도', '판매 전략'); ok(/\*\*지속가능한 성장\*\*/.test(d[5].data.content), '목표');
  ok(['성과급·임금 인상', '휴가 보장', '매주 대화의 시간'].every((x, i) => d[6].data.fig.items[i].name === x), '근로자 노력'); ok(d[12].data.type === 'solo' && d[12].data.materials.indexOf('색칠 도구') >= 0, '혼자 · 색칠 도구');
  ok(/카이/.test(d[14].data.context) && /10 m/.test(d[14].data.context) && /6 kg/.test(d[14].data.context) && /\*\*공정 무역\*\*/.test(d[14].data.note) && /\*\*정당한 임금\*\*/.test(d[14].data.note) && /\*\*아동 노동\*\*/.test(d[14].data.note), '그날의 선택 = 공정 무역'); });
T('l20(254~259): 생각 그물 세 주제(무역 둘로) · 고리 = 단원 평가 5 ⑤ · 스파이 카드 넷(거짓 = 파는 것을 수입) · 단원 평가 18 지리적 · 교실 놀이 차례(카드·조사·사실 셋 거짓 하나·출처·스파이) · 그날의 선택 = 인도네시아 설탕 → 브라질 · s19 이 단원을 마쳐요', () => { const d = L.u2_l20.slides;
  ok(/시장경제의 특징/.test(d[3].data.title) && /경제성장과 우리 생활/.test(d[4].data.title) && /세계 속의 무역 ①/.test(d[5].data.title) && /세계 속의 무역 ②/.test(d[6].data.title), '생각 그물');
  ok(corr(d[8])[0] === '물건이나 서비스 · 노동력' && /기업에서 가계로/.test(d[8].data.scenario.body), '단원 평가 5'); ok(d[9].data.options.some(o => /파는 것을 수입/.test(o.text) && !o.correct) && corr(d[9]).length === 3, '스파이 카드'); ok(corr(d[10])[0] === '지리적', '단원 평가 18');
  const st = JSON.stringify(d[12].data.steps); ok(/스파이를 찾아라/.test(d[12].data.title) && /사실 셋/.test(st) && /거짓 하나/.test(st) && /출처/.test(st) && /스파이 카드/.test(st), '교실 놀이');
  ok(/\*\*설탕 수입국\*\*/.test(d[14].data.context) && ['타이', '오스트레일리아', '인도'].every(x => d[14].data.context.indexOf('**' + x + '**') >= 0) && /\*\*가뭄\*\*/.test(d[14].data.context) && /\*\*브라질\*\*/.test(d[14].data.note) && /\*\*기후변화\*\*/.test(d[14].data.note), '그날의 선택 = 설탕'); });
T('꼭 기억해요·단원 평가 함정이 오답 보기로 들어감(봉사 활동 · 가장 많은 비용 · 국가의 뜻 · 기대 수명 줄어듦 · 부유한 사람 지원 · 노동력이 많이 필요한 · 수입 늘면 피해 줄어듦)', () => { const all = KEYS.map(k => JSON.stringify(L[k].slides.filter(s => s.block === 'basic_problem' || s.block === 'misconception').map(s => s.data))).join(); ['봉사 활동', '큰 비용으로 적은 이윤', '국가의 뜻', '기대 수명은 줄어들었다', '부유한 사람들을 지원', '노동력이 많이 필요한', '피해를 입는 일이 줄어든다', '협의할 수 없다', '수출이라고 한다', '천연자원을 주로 수출', '모든 나라의 경제가 나빠진다'].forEach(x => ok(all.indexOf(x) >= 0, x)); });

console.log('═══ I. 선행 용어 ═══');
const pre = (k) => JSON.stringify(L[k].slides.slice(0, 18).map(s => Object.assign({}, s.data, { tnote: 0 }))).replace(/"다음: [^"]*"/g, '');
const firstK = (re) => KEYS[KEYS.findIndex(k => re.test(pre(k)))];
[['시장경제', /시장경제/, 'u2_l01'], ['컨테이너', /컨테이너/, 'u2_l01'], ['근로자', /근로자/, 'u2_l01'], ['사회적 책임', /사회적 책임/, 'u2_l01'], ['상호 의존', /상호 의존/, 'u2_l01'], ['경제성장', /경제성장/, 'u2_l01'], ['무역', /무역/, 'u2_l01'], ['가격', /가격/, 'u2_l01'],
  ['가계', /가계/, 'u2_l02'], ['이윤', /이윤/, 'u2_l02'], ['서비스', /서비스/, 'u2_l01'], ['거래소', /거래소/, 'u2_l02'],
  ['소득', /소득/, 'u2_l03'], ['노동력', /노동력/, 'u2_l03'], ['합리적 선택', /합리적 선택/, 'u2_l03'], ['급여', /급여/, 'u2_l03'], ['세금', /세금/, 'u2_l03'], ['사이버 평판 관리자', /사이버 평판/, 'u2_l03'],
  ['유급 휴가', /유급 휴가/, 'u2_l05'], ['근로 기준법', /근로 기준법/, 'u2_l05'], ['협의', /협의/, 'u2_l05'], ['최저 임금', /최저 임금/, 'u2_l05'], ['육아 휴직', /육아 휴직/, 'u2_l05'],
  ['헌법', /헌법/, 'u2_l06'], ['과도한 경쟁', /과도한 경쟁/, 'u2_l06'], ['태양광', /태양광/, 'u2_l06'], ['투명 경영', /투명 경영/, 'u2_l06'],
  ['1인당 국민 총소득', /1인당 국민 총소득/, 'u2_l08'], ['한강의 기적', /한강의 기적/, 'u2_l08'], ['OECD', /OECD/, 'u2_l08'], ['경제 개발 5개년 계획', /경제 개발 5개년 계획/, 'u2_l08'], ['중화학 공업', /중화학 공업/, 'u2_l08'], ['반도체', /반도체/, 'u2_l08'],
  ['첨단 기술', /첨단 기술/, 'u2_l09'], ['생성형 인공지능', /생성형 인공지능/, 'u2_l09'], ['에듀 테크', /에듀 테크/, 'u2_l09'], ['기대 수명', /기대 수명/, 'u2_l09'], ['빅데이터', /빅데이터/, 'u2_l09'], ['올빼미 버스', /올빼미/, 'u2_l09'],
  ['환경 문제', /환경 문제/, 'u2_l10'], ['빈부 격차', /빈부 격차/, 'u2_l10'], ['과소비', /과소비/, 'u2_l10'], ['노사 갈등', /노사 갈등/, 'u2_l10'], ['상대적 빈곤율', /상대적 빈곤율/, 'u2_l10'],
  ['평가 기준', /평가 기준/, 'u2_l11'], ['공유지의 비극', /공유지의 비극/, 'u2_l11'],
  ['수입(무역)', /\*\*수입\*\*/, 'u2_l13'], ['물자', /물자/, 'u2_l13'], ['벽란도', /벽란도/, 'u2_l13'], ['원유', /원유/, 'u2_l13'],
  ['천연가스', /천연가스/, 'u2_l14'], ['흑연', /흑연/, 'u2_l14'],
  ['석유 제품', /석유 제품/, 'u2_l15'], ['정밀 화학 원료', /정밀 화학 원료/, 'u2_l15'], ['싱가포르', /싱가포르/, 'u2_l15'], ['박람회', /박람회/, 'u2_l15'],
  ['관세', /관세/, 'u2_l17'], ['항만', /항만/, 'u2_l17'], ['공정 무역', /공정 무역/, 'u2_l17'],
  ['스파이를 찾아라(예고 = 19차시 그날의 선택)', /스파이/, 'u2_l19'], ['설탕 수입', /설탕 수입/, 'u2_l20']].forEach(([n, re, at]) =>
  T('「' + n + '」 첫 등장 = ' + at.slice(3), () => ok(firstK(re) === at, firstK(re))));
T('다루지 않는 것 0(학생 화면 — 수요·공급 낱말 · 절대 우위·비교 우위 · 노동 삼권·단결권 · ESG · 기회비용 · 자유 무역 협정·FTA · 다국적 기업 · 국내 총생산·GDP · 산업 혁명 · 인플레이션·물가 상승률 · 중계 무역·가공 무역 낱말)', () => KEYS.forEach(k => { const s = txt(L[k]), re = /수요|공급|절대 우위|비교 우위|노동 삼권|단결권|ESG|기회비용|자유 무역 협정|FTA|다국적 기업|국내 총생산|GDP|산업 혁명|인플레이션|물가 상승률|중계 무역|가공 무역/; ok(!re.test(s), k + ' ' + (s.match(new RegExp('.{10}(' + re.source + ').{10}')) || [''])[0]); }));

console.log('═══ J. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × (가림·공개) 렌더 — 빈 장·undefined·NaN 0', () => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev) || {}; const h = String(r.body || r.html || '') + String(r.title || '');
  ok(h.length > 80, s.id + ' 빈 장'); ok(!/undefined|NaN|\[object/.test(h), s.id + ' ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]); }))));
T('막대그래프 실렌더 data-v = 지도서 수(1인당 국민 총소득 · 콘텐츠 수출액 · 기대 수명 · 쌀 수출국)', () => [['u2_l08', 4, GNI_KR], ['u2_l09', 4, CONTENT.v], ['u2_l09', 5, LIFE.v], ['u2_l15', 5, RICE.map(x => x[1])]].forEach(([k, i, v]) => { const r = render(L[k].slides[i], L[k], true) || {}; const h = String(r.body || r.html || ''); ok(h.indexOf('data-v="' + v.join(',') + '"') >= 0, k + ' s' + (i + 1)); }));

console.log('═══ K. 차단 어휘 · 영어 코드 · 「지도서」 ═══');
T('결·박음·빵꾸·갈아엎 0 (해결·결정·결과 같은 낱말 포함 전부)', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/결|박음|빵꾸|갈아엎/.test(s), k + ' ' + (s.match(/.{10}(결|박음|빵꾸|갈아엎).{10}/) || [''])[0]); }));
T('교사 화면 영어 코드 0(u2·l03·L01 꼴 — id·from·fit_slides·url 빼고 모든 글)', () => KEYS.forEach(k => { const les = L[k]; const strip = (o) => JSON.stringify(o, (key, v) => (['id', 'from', 'fit_slides', 'suggested_extras', 'url'].indexOf(key) >= 0 ? undefined : v));
  const s = strip(les.meta) + strip(les.slides) + strip(les.extras); ok(!/\b[uU]\d+_?[lL]\d+|\b[lL]\d{2}\b|\bu\d\b/.test(s), k + ' ' + (s.match(/.{10}(\b[uU]\d+_?[lL]\d+|\b[lL]\d{2}\b|\bu\d\b).{10}/) || [''])[0]); }));
T('학생 화면 글(장 data, tnote 빼고)에 「지도서」 0 · 교사 팁(extras)에는 쪽 근거 있음', () => KEYS.forEach(k => { ok(!/지도서/.test(txt(L[k])), k + ' ' + (txt(L[k]).match(/.{10}지도서.{10}/) || [''])[0]); ok(/지도서 \d+/.test(JSON.stringify(L[k].extras)), k + ' 팁 쪽 근거'); }));
T('겹낫표 『』 = 신문·누리집 출처 이름에만(교과서 표기 그대로)', () => KEYS.forEach(k => { const m = txt(L[k]).match(/『[^』]+』/g) || []; m.forEach(x => ok(['『비즈니스 포스트』', '『연합 뉴스』', '『이투데이』', '『팜 뉴스』', '『전자 신문』', '『와이티엔』', '『어린이 조선 일보』', '『한국 무역 신문』'].indexOf(x) >= 0, k + ' ' + x)); }));

console.log('═══ L. 6학년 인물 0 ═══');
T('곰이·펭이·🐻·🐧 0 · motivate kids 0', () => KEYS.forEach(k => { const s = JSON.stringify(L[k]); ok(!/곰이|펭이|🐻|🐧/.test(s), k); ok(!D(k, 2).kids, k + ' kids'); }));

console.log(`\n${fail ? '❌' : '✅'} gate_g6s2_social_u2: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);

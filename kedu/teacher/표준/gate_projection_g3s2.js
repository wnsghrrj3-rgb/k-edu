/* 표준/gate_projection_g3s2.js — 자기주도 투영(47차) 게이트 · 3학년 2학기 정본 전부 + 50차부터 3학년 1학기 정본(g3_*) 전부
   D1 50차: 1학기 물음 속 보기 → 하나 고르기(정답 = 정본 answer · 보기 수 · 물음 글에 보기 안 남음 · 정답 자리 쏠림 없음) · 글 답은 수 넣기 안 됨
   D2 51차: 짝 잇기·나눠 담기·차례 놓기·단위 붙은 수 답 — 떼어 낸 짝·갈래·차례 = 정본 answer 글(글자 자리로 따로 대조) ·
      보기는 섞였고 첫 화면에 이은 것·담은 것·놓은 것·✅ 없음 · check() 가 맞는 배치만 받는다(하나만 바꿔도 틀림) · 정본 answer 는 투영 data 에서 빠짐
   A 회수 지도: 케이티처 키마다 projmap 항목 · 원문 파일이 있고 id = 원문 <meta kedu-lesson-id> · 진도 키 = 원문 규칙
   B 교사 층 누출 0: 투영 데이터에 tnote·hint·👉·extras·suggested_extras·신호등 self 없음 · 교실 활동 = 혼자 흐름
   C 학생 화면(푼 전·첫 화면) 글에 정답·풀이·교사에게 하는 말 없음 — renderSlide + 학생 층(widget) 실제 HTML 로 검사
   B+ 48차: 출구 퀴즈 수 답 문항을 편 장(from) — 답 = 정본 출구 답 · 기본 문제와 같은 물음은 안 폄
   D 채점: 문항 점수 합 = 100 · check() 가 정답만 받는다(하나 고르기 보기마다 · 모두 고르기 · 수 넣기) · gained 규칙
   D+ 49차: 수준별 채점 — 수준마다 답 표(nums·frac·self) = 정본 답 글 · 식 문제는 따로 셈해 정본 답 검산 ·
      check() 가 맞는 답만 받는다 · 첫 화면(수준마다)에 답 없음 · 교사용 「정답 보기」 단추는 학생 화면에서 빠진다
   E 혼자 흐름: 투영 교실 활동 글에 짝·모둠 말 0 · 짝·모둠 말이 남은 문제는 혼자라면 줄이 붙는다
   G 52차 배정 링크: 케이박스 받은 박스가 선생님이 담은 자기주도 차시(원문 주소)를 켠 단원만 learn.html 로 연다 ·
      projmap 원문 주소 전부가 차시 지도(kedu_map)에 있다(= 어느 단원을 켜도 배정이 따라온다) · 켠 단원 차시마다 같은 키로 ·
      끈 단원·바깥 링크·다른 종류(link)는 그대로 · cwb/cwi 가 붙는다 · learn 의 목록 단추는 박스에서 왔으면 받은 박스로
   실행: NODE_PATH=…/jsdom/node_modules node kedu/teacher/표준/gate_projection_g3s2.js                 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const T = path.resolve(__dirname, '..'), ROOT = path.resolve(T, '../..'), S2 = path.join(T, 'stage2');
let pass = 0, fail = 0; const fails = []; const ok = (c, m) => { if (c) pass++; else { fail++; if (fails.length < 60) fails.push(m); } };
const sec = (t) => console.log('═══ ' + t + ' ═══');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const g = dom.window; g.KT2_NO_BOOT = true; g.KT2_LEARN_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js', 'stage2-project.js', 'stage2-learn.js', 'projmap.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = g.KT2, P = g.KT2_PROJECT, W = g.KT2_LEARN.widget, MAP = g.KT2_PROJMAP;
function load(f) { const L = {}; const ctx = { window: { LESSONS: L }, LESSONS: L }; ctx.window.window = ctx.window; vm.createContext(ctx); vm.runInContext(fs.readFileSync(f, 'utf8'), ctx); return ctx.window.LESSONS; }
const files = fs.readdirSync(path.join(T, 'data')).filter(f => /^g3(s2)?_[a-z]+_u\d+\.js$/.test(f)).sort();
const all = []; files.forEach(f => { const slug = f.replace(/_u\d+\.js$/, ''); const L = load(path.join(T, 'data', f)); Object.keys(L).forEach(k => all.push({ slug, key: k, L: L[k] })); });
const text = (html) => { const d = g.document.createElement('div'); d.innerHTML = html; return d.textContent.replace(/\s+/g, ' '); };
const fresh = () => ({ tries: 0, done: false, gaveUp: false, sel: [], wrong: [], val: '', shown: false });
console.log('정본 ' + all.length + '차시 키 · ' + files.length + '파일');

sec('A. 회수 지도');
all.forEach(({ slug, key }) => {
  const m = MAP[slug + ':' + key]; ok(!!m, slug + ':' + key + ' 지도 없음'); if (!m) return;
  const f = path.join(ROOT, decodeURI(m.url)); ok(fs.existsSync(f), m.url + ' 원문 없음'); if (!fs.existsSync(f)) return;
  const h = fs.readFileSync(f, 'utf8'); const meta = (h.match(/<meta name="kedu-lesson-id" content="([^"]+)"/) || [])[1];
  ok(m.id === (meta || path.basename(f, '.html')), key + ' id ' + m.id + ' ≠ 원문 ' + meta);
  if (m.ls) ok(h.indexOf(m.ls) >= 0 || (/['"`]kedu_progress_['"`]\s*\+\s*LESSON_ID/.test(h) && h.indexOf("'" + m.ls.replace('kedu_progress_', '') + "'") >= 0), key + ' 진도 키 ' + m.ls + ' 원문에 없음');
  else ok(!/localStorage\.setItem/.test(h), key + ' 원문은 기기 진도를 쓰는데 지도에 진도 키 없음');
});
console.log('  지도 ' + Object.keys(MAP).length + ' · 정본 키 ' + all.length);

sec('B. 교사 층 누출');
const TEACHER_KEYS = ['tnote', 'suggested_extras', 'extras'];
let nSlide = 0, nOff = 0;
const PJ = all.map(x => Object.assign(x, { pj: P.project(x.L) }));
PJ.forEach(({ slug, key, L, pj }) => {
  const js = JSON.stringify(pj); const tag = slug + ' ' + key;
  TEACHER_KEYS.forEach(k => ok(js.indexOf('"' + k + '"') < 0, tag + ' 투영에 ' + k));
  // 👉 쪽지 = 교사에게 주는 note(머리 👉) · 판 그림 안의 👉 항목(학생 글)은 쪽지가 아니다
  ok(!pj.slides.some(s => s.data && typeof s.data.note === 'string' && /^\s*👉/.test(s.data.note)), tag + ' 👉 쪽지');
  pj.slides.forEach(s => { nSlide++;
    if (s.block === 'misconception') ok(s.data.hint === undefined, tag + ' ' + s.id + ' 오개념 hint');
    if (s.block === 'exit_ticket') ok(s.data.self === undefined, tag + ' ' + s.id + ' 신호등');
    if (s.block === 'leveled_problem') { const src = L.slides.find(x => x.id === s.id).data.levels || {}; ok(!!s.lv && JSON.stringify(Object.keys(s.lv.levels)) === JSON.stringify(Object.keys(src)), tag + ' ' + s.id + ' 수준 답 표 = 정본 수준'); Object.values(s.data.levels || {}).forEach(lv => ok(lv.a === undefined && lv.steps === undefined, tag + ' ' + s.id + ' 투영 data 에 수준 답·풀이가 남음')); }
    if (s.block === 'offline_activity') { nOff++; const src = L.slides.find(x => x.id === s.id).data; ok(s.data.type === 'individual' && JSON.stringify(s.data.steps) === JSON.stringify(src.solo), tag + ' ' + s.id + ' 혼자 흐름 = 원 solo'); ok(s.data.minutes === undefined && s.data.materials === undefined, tag + ' ' + s.id + ' 타이머·준비물'); }
  });
  const own = pj.slides.filter(s => !s.from);
  const expectDrop = L.slides.filter(s => s.block === 'offline_activity' && !(s.data.solo || []).length).length;
  const exitGone = L.slides.filter(s => s.block === 'exit_ticket' && !own.some(x => x.id === s.id)).length;
  ok(own.length === L.slides.length - expectDrop - exitGone, tag + ' 장 수');
  // 48차 출구 펴기: 편 장의 답 = 정본 출구 문항 답 · 편 장이 없는데 출구 장이 사라지면 안 됨
  pj.slides.filter(s => s.from).forEach(s => { const ex = L.slides.find(x => x.id === s.from); const it = ex && (ex.data.items || []).find(i => i.q === s.data.question); ok(!!it && Number(String(it.a).replace(/,/g, '')) === s.learn.answer && s.learn.kind === 'num', tag + ' ' + s.id + ' 출구 편 장 답'); });
  ok(JSON.stringify(L).indexOf('"tnote"') >= 0 || true, '');
});
console.log('  투영 ' + nSlide + '장 · 혼자 활동 ' + nOff);

sec('C. 학생 첫 화면에 정답·풀이·교사 말 없음');
// 교사에게 하는 말 = 정본 tnote·hint 글 그 자체(학생 화면에 한 조각이라도 나오면 누출)
const TEACH_SAY = /(짚어 주세요|하게 하세요|확인시켜|물어보게|손을 들게|칠판에[^.!?]{0,14}(주세요|하세요|두세요)|판서)/; // 50차: 「칠판에 5분의 3이 적혀 있어요」(학생 장면)는 교사 말이 아니다
let nChk = 0;
PJ.forEach(({ slug, key, L, pj }) => pj.slides.forEach(s => {
  const src = L.slides.find(x => x.id === (s.from || s.id)); const tag = slug + ' ' + key + ' ' + s.id;
  const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: pj.meta, unitTitle: 'U', classNames: [] });
  const html = r.body + W(s, fresh()) + (s.solo || ''); const tx = text(html); nChk++;
  ok(!/풀이\s*[:：]/.test(tx), tag + ' 풀이가 첫 화면에');
  ok(!/class="opt[^"]*\bok\b/.test(html), tag + ' 정답 표시가 첫 화면에');
  ok(!TEACH_SAY.test(tx), tag + ' 교사에게 하는 말: ' + (tx.match(TEACH_SAY) || [])[0]);
  const d0 = src.data || {};
  const tn = d0.tnote; if (tn) (tn.ask || []).concat(tn.watch ? [tn.watch] : []).forEach(a => { const t = String(a).replace(/\*\*/g, ''); if (t.length >= 12 && JSON.stringify(s.data).replace(/\*\*/g, '').indexOf(t) < 0) ok(tx.indexOf(t) < 0, tag + ' 발문 글이 학생 화면에: ' + t.slice(0, 20)); });
  if (s.block === 'misconception' && d0.hint && d0.hint.length >= 12) ok(tx.indexOf(d0.hint.replace(/\*\*/g, '').slice(0, 20)) < 0, tag + ' 오개념 hint 가 학생 화면에');
  if (s.lv) Object.keys(s.lv.levels).forEach(k => {
    const LV = s.lv.levels[k]; const r2 = KT2.renderSlide(s, { revealed: false, state: { level: k }, meta: pj.meta, unitTitle: 'U', classNames: [] });
    const box = g.document.createElement('div'); box.innerHTML = r2.body + W(s, fresh(), k); box.querySelectorAll(g.KT2_LEARN.STRIP).forEach(b => b.remove());
    const t2 = box.textContent.replace(/\s+/g, ' '); const q = String((s.data.levels[k] || {}).q || ''); const a = String(LV.a == null ? '' : LV.a).replace(/\*\*/g, '').trim();
    ok(!box.querySelector('[data-act="reveal"]'), tag + ' ' + k + ' 교사용 정답 보기 단추가 학생 화면에');
    ok(t2.indexOf('✅') < 0 && !box.querySelector('.lv-a,.lv-steps'), tag + ' ' + k + ' 수준 답이 첫 화면에');
    if (!LV.open && a.length >= 2 && q.indexOf(a) < 0) ok(t2.indexOf(a) < 0, tag + ' ' + k + ' 수준 답 글이 첫 화면에: ' + a.slice(0, 16));
  });
  if (s.learn && s.learn.kind === 'num') ok(tx.indexOf(String(s.learn.answer)) < 0 || String(d0.question || '').indexOf(String(s.learn.answer)) >= 0 || text(r.body).indexOf(String(s.learn.answer)) >= 0, tag + ' 수 넣기 답이 학생 층에');
}));
console.log('  그린 장 ' + nChk);

sec('D. 채점');
const dist = {}; let nQ = 0;
PJ.forEach(({ slug, key, pj }) => {
  const tag = slug + ' ' + key; const n = pj.scored.length; dist[n] = (dist[n] || 0) + 1;
  const sum = pj.slides.reduce((a, s) => a + ((s.learn && s.learn.pts) || 0), 0); ok(n === 0 ? sum === 0 : sum === 100, tag + ' 점수 합 ' + sum);
  pj.slides.forEach(s => { const L = s.learn; if (!L || !P.SCORED.has(L.kind)) return; nQ++;
    if (L.kind === 'pick') { const c = L.options.map((o, i) => o.correct ? i : -1).filter(i => i >= 0); ok(c.length === 1, tag + ' ' + s.id + ' 하나 고르기 정답 ' + c.length); L.options.forEach((o, i) => ok(P.check(L, i) === !!o.correct, tag + ' ' + s.id + ' 보기 ' + i)); }
    if (L.kind === 'multi') { const c = L.options.map((o, i) => o.correct ? i : -1).filter(i => i >= 0); ok(c.length >= 1 && P.check(L, c) && !P.check(L, c.slice(1)) && (c.length === L.options.length || !P.check(L, L.options.map((_, i) => i))), tag + ' ' + s.id + ' 모두 고르기'); }
    if (L.kind === 'num') { ok(P.check(L, String(L.answer)) && P.check(L, ' ' + L.answer + ' ') && !P.check(L, String(Number(L.answer) + 1)) && !P.check(L, ''), tag + ' ' + s.id + ' 수 넣기'); if (Number(L.answer) >= 1000) ok(P.check(L, Number(L.answer).toLocaleString('en-US')), tag + ' 쉼표 수'); }
    ok(P.gained(L, 1) === L.pts && P.gained(L, 2) === Math.ceil(L.pts / 2) && P.gained(L, 3) === 0 && P.gained(L, 1, true) === 0, tag + ' ' + s.id + ' 점수 규칙');
  });
});
console.log('  채점 문항 ' + nQ + ' · 차시당 채점 문항 수 분포 ' + JSON.stringify(dist));

sec('D1. 1학기 물음 속 보기 → 하나 고르기 (50차)');
// 1세대 생성기 기본 문제: 보기를 물음 글 안에 적음. 투영은 그 보기를 떼어 하나 고르기로 — 정답 = 정본 answer 글자 그대로.
const nrm = (x) => String(x == null ? '' : x).replace(/\*\*/g, '').replace(/[‘’“”"'「」]/g, '').replace(/[.!?。]+$/, '').replace(/\s+/g, ' ').trim();
// 51차: 보기와 답 글이 괄호 풀이·띄어쓰기만 다른 경우(「어찌하다(움직임)」 = 「어찌하다」)
const same = (o, x) => o === x || o.replace(/\s/g, '') === x.replace(/\s/g, '') || o.replace(/\s*\([^)]*\)$/, '') === x;
let nInl = 0, nNum1 = 0, nMul1 = 0; const posDist = {}; const leftSelf = [];
PJ.forEach(({ slug, key, L, pj }) => { if (/s2_/.test(slug)) return; const tag = slug + ' ' + key;
  pj.slides.forEach(s => { if (s.block !== 'basic_problem' || s.from) return; const src = L.slides.find(x => x.id === s.id).data; const q0 = String(src.question || ''); const Lr = s.learn;
    if (Lr && Lr.inline) { nInl++;
      const c = Lr.options.filter(o => o.correct).map(o => o.text).sort();
      if (Lr.kind === 'multi') { const w = String(src.answer).split(/\s*,\s*|\s+·\s+/).map(nrm); nMul1++; ok(c.length >= 2 && c.length === w.length && w.every(x => c.some(o => same(o, x))) && c.length < Lr.options.length, tag + ' ' + s.id + ' 모두 고르기 정답 = 정본 답 조각'); }
      else ok(c.length === 1 && same(c[0], nrm(src.answer)), tag + ' ' + s.id + ' 떼어 낸 보기 정답 = 정본 답');
      ok(Lr.options.every(o => nrm(q0).indexOf(o.text) >= 0), tag + ' ' + s.id + ' 보기가 정본 물음 글에 없음');
      const want = /①/.test(q0) ? (q0.match(/[①②③④⑤⑥]/g) || []).length : (q0.split(/\s*(?:중에서|가운데|[—–])\s*/)[0].split(' · ').length);
      ok(Lr.options.length === want, tag + ' ' + s.id + ' 보기 수 ' + Lr.options.length + ' ≠ ' + want);
      ok(!/[①②③④]| · /.test(s.data.question) && !/\*\*/.test(Lr.options.map(o => o.text).join('')) && /(\?|요\.?)$/.test(s.data.question.trim()), tag + ' ' + s.id + ' 물음 글에 보기가 남음');
      const i = Lr.options.findIndex(o => o.correct); posDist[i] = (posDist[i] || 0) + 1;
    } else if (Lr && Lr.kind === 'num') { nNum1++; ok(Number(String(src.answer).replace(/,/g, '')) === Lr.answer && (src.input !== undefined || (Lr.a === String(src.answer).trim() && /몇|얼마|언제|며칠/.test(q0))), tag + ' ' + s.id + ' 1학기 수 답'); }
    else if (Lr && Lr.kind === 'self' && / · |①/.test(q0)) leftSelf.push(tag + ' ' + s.id);
    if (src.input !== undefined && !/^-?\d[\d,]*(\.\d+)?$/.test(String(src.answer).trim())) ok(!Lr || Lr.kind !== 'num', tag + ' ' + s.id + ' 글 답이 수 넣기로');
  });
});
ok(nInl >= 200, '1학기 하나 고르기 ' + nInl + ' (200 이상이어야)');
ok((posDist[0] || 0) < nInl * 0.4, '정답이 첫 보기에 몰림 ' + JSON.stringify(posDist));
console.log('  1학기 하나 고르기 ' + nInl + ' (모두 고르기 ' + nMul1 + ') · 수 넣기 ' + nNum1 + ' · 정답 자리 ' + JSON.stringify(posDist) + ' · 보기 꼴인데 스스로 확인으로 남은 것 ' + leftSelf.length);

sec('D2. 짝 잇기 · 나눠 담기 · 차례 놓기 · 단위 붙은 수 답 (51차)');
// 떼어 낸 것을 정본 answer 글자 자리로 따로 대조한다(파서와 독립): 짝은 「L<가름표>R」 이 답 글에 그대로 · 갈래는 통 이름 사이에 그 카드 · 차례는 「→」 로 이은 글 그대로.
const flat = (x) => String(x == null ? '' : x).replace(/\*\*/g, '').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
const SEPS = [' ↔ ', '↔', ' = ', ' — ', '—', ' – ', '-', ' - ', '='];
const kc = {}; let nD2 = 0;
PJ.forEach(({ slug, key, L, pj }) => pj.slides.forEach(s => {
  const Lr = s.learn; if (!Lr || ['match', 'sort', 'order', 'nums', 'frac'].indexOf(Lr.kind) < 0 || s.from) return;
  nD2++; kc[Lr.kind] = (kc[Lr.kind] || 0) + 1;
  const src = L.slides.find(x => x.id === s.id).data, A = flat(src.answer), tag = slug + ' ' + key + ' ' + s.id;
  ok(s.data.answer === undefined, tag + ' 투영 data 에 정본 answer 가 남음');
  const perm = (k, n) => k.length === n && new Set(k).size === n && k.every(v => v >= 0 && v < n);
  const box = g.document.createElement('div'); box.innerHTML = W(s, fresh());
  ok(!box.querySelector('.ok,.lw-got,.answer'), tag + ' 첫 화면에 정답 표시');
  if (Lr.kind === 'match') {
    const n = Lr.left.length; ok(n >= 2 && n <= 6 && Lr.right.length === n && perm(Lr.key, n), tag + ' 짝 모양');
    ok(Lr.key.some((v, i) => v !== i), tag + ' 오른쪽이 섞이지 않음');
    const A2 = A.replace(/(^|\/ )\d(?=[^\d\s.,])/g, '$1'); // 원문 줄 번호가 붙은 왼쪽(「2자리 때문에 …」)
    Lr.left.forEach((l, i) => { const r = Lr.right[Lr.key[i]];
      const direct = SEPS.some(sp => A.indexOf(l + sp + r) >= 0 || A2.indexOf(l + sp + r) >= 0);
      // 보이는 왼쪽이 물음 글 항목 전체(「우리 학교 도서관은 좋습니다」)일 때 — 답 글의 왼쪽(「도서관」)이 그 안에 있고 물음 글에도 그 항목이 있어야
      const viaQ = !direct && flat(src.question).indexOf(l) >= 0 && SEPS.some(sp => { const m = A.indexOf(sp + r); if (m < 0) return false; const lw = A.slice(0, m).split(/, | \/ /).pop(); return !!lw && l.indexOf(lw) > 0; });
      ok(direct || viaQ, tag + ' 짝 「' + l.slice(0, 12) + ' ↔ ' + r.slice(0, 12) + '」 이 정본 답 글에 없음'); });
    ok(!box.querySelector('.lm-it.on'), tag + ' 첫 화면에 이은 짝');
    { const k = Lr.key.slice(); [k[0], k[1]] = [k[1], k[0]]; ok(P.check(Lr, Lr.key.slice()) && !P.check(Lr, k) && !P.check(Lr, Lr.key.slice(0, -1)) && !P.check(Lr, []), tag + ' 짝 채점'); }
  }
  if (Lr.kind === 'sort') {
    const n = Lr.items.length, B = Lr.bins; ok(B.length >= 2 && B.length <= 4 && n >= 3 && Lr.key.length === n && Lr.key.every(k => k >= 0 && k < B.length) && B.every((_, k) => Lr.key.indexOf(k) >= 0), tag + ' 갈래 모양');
    const pos = []; B.forEach((b, k) => pos.push(A.indexOf(b, k ? pos[k - 1] + 1 : 0))); ok(pos.every(p => p >= 0), tag + ' 통 이름이 정본 답 글 차례대로 없음');
    Lr.items.forEach((t, i) => { const k = Lr.key[i], at = A.indexOf(t, pos[k] + B[k].length), end = k + 1 < B.length ? pos[k + 1] : A.length; ok(at >= 0 && at < end, tag + ' 카드 「' + t.slice(0, 12) + '」 가 ' + B[k] + ' 칸 글에 없음'); });
    ok(n === B.length + (A.match(/ · /g) || []).length, tag + ' 카드 수 ' + n + ' ≠ 답 글 조각 수');
    ok(!Lr.key.every((v, i) => !i || v >= Lr.key[i - 1]) && !Lr.key.every((v, i) => !i || v <= Lr.key[i - 1]), tag + ' 카드가 통 차례대로 놓여 있음(안 섞임)');
    ok(!box.querySelector('.ca-bin-in .ca-chip') && box.querySelectorAll('.ls-tray .ca-chip').length === n, tag + ' 첫 화면에 담긴 카드');
    { const k = Lr.key.slice(); const j = k.findIndex(v => v !== k[0]); [k[0], k[j]] = [k[j], k[0]]; ok(P.check(Lr, Lr.key.slice()) && !P.check(Lr, k) && !P.check(Lr, Lr.key.slice(0, -1)), tag + ' 갈래 채점'); }
  }
  if (Lr.kind === 'order') {
    const n = Lr.items.length; ok(n >= 3 && perm(Lr.key, n), tag + ' 차례 모양');
    ok(Lr.key.map(i => Lr.items[i]).join(' → ') === A.split(/\s*→\s*/).map(x => x.replace(/^\d+\s+/, '')).join(' → '), tag + ' 차례 = 정본 답 글');
    ok(Lr.key.some((v, i) => v !== i) && Lr.key.some((v, i) => v !== n - 1 - i), tag + ' 카드가 답 차례·거꾸로 차례 그대로');
    ok(!box.querySelector('.lo-slot.on') && box.querySelectorAll('.ls-tray .ca-chip').length === n, tag + ' 첫 화면에 놓인 칸');
    { const k = Lr.key.slice(); [k[0], k[1]] = [k[1], k[0]]; ok(P.check(Lr, Lr.key.slice()) && !P.check(Lr, k) && !P.check(Lr, Lr.key.slice(0, -1)), tag + ' 차례 채점'); }
  }
  if (Lr.kind === 'nums' || Lr.kind === 'frac') {
    ok(Lr.a === A, tag + ' 답 글 = 정본');
    ok(!/분의|약\s|보다/.test(A) && /몇|얼마|언제|며칠/.test(flat(src.question)), tag + ' 분수 말·어림·범위 답을 채점');
    if (Lr.kind === 'nums') {
      Lr.parts.forEach(p => ok(new RegExp('(^|[^\\d])' + p.v + '\\s*' + (p.unit || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-zA-Z가-힣])').test(A), tag + ' 칸 「' + p.v + p.unit + '」 가 정본 답 글에 없음'));
      const vs = Lr.parts.map(p => String(p.v)); ok(P.check(Lr, vs) && !P.check(Lr, vs.map((v, i) => i ? v : String(+v + 1))) && !P.check(Lr, vs.map(() => '')), tag + ' 단위 칸 채점');
      if (vs.length > 1) ok(!P.check(Lr, vs.slice().reverse()) || vs.every(v => v === vs[0]), tag + ' 칸 차례 바꿔도 맞음');
      const t = box.textContent, body = text(KT2.renderSlide(s, { revealed: false, state: {}, meta: pj.meta, unitTitle: 'U', classNames: [] }).body);
      ok(!box.querySelector('.lw-in[value]:not([value=""])'), tag + ' 첫 화면 칸에 수가 들어 있음');
      ok(t.indexOf(A) < 0 || body.indexOf(A) >= 0, tag + ' 답 글이 학생 층에');
    }
  }
}));
ok((kc.match || 0) >= 70 && (kc.sort || 0) >= 60 && (kc.order || 0) >= 3 && (kc.nums || 0) >= 25, '51차 새 꼴 수가 줄어듦 ' + JSON.stringify(kc));
{ // 파서 자체 확인 — 대표 꼴과 거절해야 할 꼴
  const S = P.structured;
  const m1 = S('보다 · 듣다 · 냄새 맡다는 각각 몸의 어느 기관과 이어질까요?', '보다-눈, 듣다-귀, 냄새 맡다-코');
  const m2 = S('이어요', '나이 ↔ 연세 / 이름 ↔ 성함');
  const s1 = S('고체일까요, 액체일까요?', '🧱 고체 — 지우개 · 가위 / 💧 액체 — 간장 · 우유');
  const o1 = S('차례대로 놓으면 어떻게 될까요?', 'A가 → B가 → C가');
  ok(m1 && m1.learn.kind === 'match' && m1.learn.left.join() === '보다,듣다,냄새 맡다' && m2 && m2.learn.kind === 'match' && s1 && s1.learn.kind === 'sort' && s1.learn.bins.length === 2 && o1 && o1.learn.kind === 'order', '파서 자체: 짝·갈래·차례');
  ok(!S('두 부분으로 나누면?', '콩이가 / 뛰어갑니다., 민주는 / 친절합니다.') && !S('한 문장으로 말해 봐요.', '여러 답 (예: …)') && !S('각각 무엇일까요?', '문단, 중심 문장, 뒷받침 문장') && !S('이어요', 'A ↔ B / A ↔ C'), '파서 자체: 짝이 아닌 꼴·같은 오른쪽은 거절');
  const U = P.unitAnswer; ok(U('몇 cm일까요?', '100 cm').kind === 'nums' && U('몇 분 몇 초일까요?', '3분 5초').parts.length === 2 && !U('얼마일까요?', '4분의 3') && !U('약 얼마일까요?', '약 6 cm') && !U('어느 쪽일까요?', '1보다 작아요'), '파서 자체: 단위 답');
}
console.log('  새 꼴 ' + nD2 + ' ' + JSON.stringify(kc));

sec('D+. 수준별 채점');
const NUMONLY = /^-?\d[\d,]*(\.\d+)?$/; let nLv = 0, nGr = 0, nCalc = 0; const lvKind = {};
// 식 문제는 따로 셈한다(생성기·파서와 독립) — 「a × b 는 얼마」 · 「a ÷ b 의 몫과 나머지」
function calc(q) { const t = String(q).replace(/\*\*/g, ''); let m = t.match(/^(\d[\d,]*)\s*([×÷+\-−])\s*(\d[\d,]*)\s*(은|는|의)/); if (!m) return null; const x = +m[1].replace(/,/g, ''), y = +m[3].replace(/,/g, '');
  if (m[2] === '×') return [x * y]; if (m[2] === '+') return [x + y]; if (m[2] === '-' || m[2] === '−') return [x - y]; if (m[2] === '÷') return /나머지/.test(t) ? [Math.floor(x / y), x % y] : (/몫/.test(t) || !(x % y)) ? [Math.floor(x / y)] : null; return null; }
PJ.forEach(({ slug, key, L, pj }) => pj.slides.filter(s => s.lv).forEach(s => {
  const src = L.slides.find(x => x.id === s.id).data.levels || {};
  Object.keys(s.lv.levels).forEach(k => { nLv++; const LV = s.lv.levels[k], o = src[k] || {}, tag = slug + ' ' + key + ' ' + s.id + ' ' + k; lvKind[LV.kind] = (lvKind[LV.kind] || 0) + 1;
    ok(LV.a === o.a && JSON.stringify(LV.steps) === JSON.stringify(o.steps), tag + ' 답 표 글 = 정본');
    if (o.open) { ok(LV.kind === 'self' && LV.open, tag + ' 여러 답인데 채점'); return; }
    const a = String(o.a == null ? '' : o.a).replace(/\*\*/g, '').trim();
    if (NUMONLY.test(a.replace(/\s/g, ''))) ok(LV.kind === 'nums' && LV.parts.length === 1 && LV.parts[0].v === Number(a.replace(/[\s,]/g, '')), tag + ' 수 답인데 채점 안 함');
    if (/^약\s|보다|[㉠-㉮]|·\d+\//.test(a)) ok(LV.kind === 'self', tag + ' 어림·범위·기호·대분수 답을 채점함');
    if (LV.kind === 'nums') { nGr++;
      const vs = LV.parts.map(p => String(p.v)); ok(LV.parts.every(p => a.indexOf(String(p.v).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) >= 0 || a.indexOf(String(p.v)) >= 0), tag + ' 답 칸 수가 정본 답 글에 없음');
      ok(P.check(LV, vs) && P.check(LV, vs.map(v => ' ' + v + ' ')) && !P.check(LV, vs.map((v, i) => i ? v : String(Number(v) + 1))) && !P.check(LV, vs.map(() => '')) && !P.check(LV, vs.slice(0, -1).concat(vs.length > 1 ? [] : ['x'])), tag + ' 수 칸 채점');
      if (LV.parts[0].v >= 1000) ok(P.check(LV, [LV.parts[0].v.toLocaleString('en-US')].concat(vs.slice(1))), tag + ' 쉼표 수');
      if (LV.parts.length > 1) ok(!P.check(LV, vs.slice().reverse()) || vs.every(v => v === vs[0]), tag + ' 칸 차례 바꿔도 맞음');
      const c = calc(o.q); if (c) { nCalc++; ok(c.length === LV.parts.length && c.every((v, i) => v === LV.parts[i].v), tag + ' 식을 셈한 값 ' + c.join('·') + ' ≠ 정본 답 ' + a); }
    }
    if (LV.kind === 'frac') { nGr++; const [x, y] = LV.answer.split('/'); ok(a.replace(/\s/g, '') === LV.answer && P.check(LV, LV.answer) && P.check(LV, x + ' / ' + y) && !P.check(LV, y + '/' + x) && !P.check(LV, ''), tag + ' 분수 채점'); }
  });
}));
ok(nGr >= 90, '채점 수준 ' + nGr + ' (90 아래로 줄어듦)'); ok(nCalc >= 20, '식 셈 검산 ' + nCalc);
{ const L0 = { parts: [{ v: 4 }, { v: 5 }], kind: 'nums' }; ok(P.check(L0, ['4', '5']) && !P.check(L0, ['5', '4']) && !P.check(L0, ['4']) && !P.check(L0, '4'), '검산기 자체: 몫·나머지 두 칸'); }
{ const t = P.parseLevelAnswer; ok(JSON.stringify(t('몫 4, 나머지 5').parts.map(p => [p.pre, p.v])) === '[["몫",4],["나머지",5]]' && t('6 L 50 mL').parts[1].unit === 'mL' && t('7봉지, 3개 남음').parts[1].post === '남음' && t('약 900 g') === null && t('241 × 3 (723 > 564)') === null && t('12,000원').parts[0].v === 12000, '파서 자체 확인'); }
console.log('  수준 ' + nLv + ' · 채점 ' + nGr + ' · 식 셈 검산 ' + nCalc + ' · 꼴 ' + JSON.stringify(lvKind));

sec('E. 혼자 흐름');
const PAIR = /짝|모둠|친구와|친구에게|다 함께/;
// 혼자 활동은 좁게: 짝·모둠과 함께 하는 말만(「짝을 맞춘다」·「짝이 되는 카드」·「친구에게 하는 말」처럼 혼자 해도 되는 글은 통과)
const SOLO_PAIR = /짝과|짝이 (말하|확인|들어|읽어)|짝에게 (말|보여|읽어)|모둠(에서|이|원)|다 함께/;
PJ.forEach(({ slug, key, pj }) => pj.slides.forEach(s => {
  const tag = slug + ' ' + key + ' ' + s.id;
  if (s.block === 'offline_activity') ok(!SOLO_PAIR.test(JSON.stringify(s.data.steps) + (s.data.goal || '')), tag + ' 혼자 활동에 짝·모둠 말');
  if (s.block === 'basic_problem' && PAIR.test(String(s.data.question || ''))) ok(!!s.solo, tag + ' 혼자라면 줄');
  if (s.block === 'leveled_problem') Object.values(s.data.levels || {}).forEach(lv => { if (PAIR.test(String(lv.q || '').split('\n')[0])) ok(String(lv.q).indexOf(P.SOLO_FALLBACK) >= 0, tag + ' 수준별 혼자라면 줄'); });
}));

sec('F. 정본 무개변');
all.forEach(({ slug, key, L }) => { const before = JSON.stringify(L); P.project(L); ok(JSON.stringify(L) === before, slug + ' ' + key + ' project() 가 정본을 바꿈'); });

sec('G. 배정 링크 (52차)');
{
  const SW = fs.readFileSync(path.join(S2, 'proj_switch.js'), 'utf8');
  const ON = JSON.parse((SW.match(/var ON = (\[[^\]]*\])/) || [])[1].replace(/'/g, '"'));
  const CTX = new Map();
  const mk = (href) => { const d = new JSDOM('<!doctype html><html><body></body></html>', { url: href, runScripts: 'outside-only' }); ['projmap.js', 'proj_switch.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), d.getInternalVMContext(), { filename: f })); CTX.set(d.window, d.getInternalVMContext()); return d.window; };
  const w = mk('https://keduclass.com/classwork/inbox.html'); const PJS = w.KT2_PROJ;
  ok(!!PJS && typeof PJS.to === 'function' && JSON.stringify(PJS.ON) === JSON.stringify(ON), 'KT2_PROJ.to 노출·ON 같음');
  // 차시 지도(선생님이 고르는 곳) — 3학년 여덟 장
  const KM = {}; ['g3_1_korean', 'g3_1_math', 'g3_1_science', 'g3_1_social', 'g3_2_korean', 'g3_2_math', 'g3_2_science', 'g3_2_social'].forEach(k => { const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(ROOT, 'kedu_map', k + '.js'), 'utf8'), c); Object.assign(KM, c.window.KEDU_MAP); });
  const kmUrls = new Set(); Object.values(KM).forEach(m => m.units.forEach(u => u.lessons.forEach(l => { if (l.url) kmUrls.add(decodeURIComponent(l.url)); })));
  let nIn = 0; Object.keys(MAP).forEach(k => { const u = decodeURIComponent(MAP[k].url); if (kmUrls.has(u)) nIn++; else ok(false, k + ' 원문 주소가 차시 지도에 없음 — 켜도 배정은 원문으로 감: ' + u); });
  ok(nIn === Object.keys(MAP).length, 'projmap 원문 ' + nIn + '/' + Object.keys(MAP).length + ' 가 차시 지도에 있음');
  let nOn = 0, nOff = 0;
  Object.keys(MAP).forEach(k => {
    const i = k.indexOf(':'), slug = k.slice(0, i), key = k.slice(i + 1), unit = key.split('_')[0], on = ON.indexOf(slug + ':' + unit) >= 0;
    const raw = MAP[k].url, enc = encodeURI(raw), to = PJS.to(raw);
    if (on) { nOn++; const m = slug.match(/^g(\d)(?:s(\d))?_([a-z]+)$/);
      ok(to === '/kedu/teacher/stage2/learn.html?g=' + m[1] + '&t=' + (m[2] || 1) + '&s=' + m[3] + '&u=' + unit.slice(1) + '&l=' + key, k + ' 켠 단원인데 투영 주소가 아님: ' + to);
      ok(PJS.to(enc) === to && PJS.to(enc + '?cwb=x') === to && PJS.to('https://keduclass.com' + enc) === to, k + ' 인코딩·쿼리·절대 주소에서 같은 투영'); }
    else { nOff++; ok(to === null, k + ' 끈 단원인데 투영으로 감'); }
  });
  ok(nOn >= 10, '켠 단원 차시 ' + nOn); ok(PJS.to('https://example.com/grade3/semester2/math/1단원_곱셈/x.html') === null && PJS.to('') === null && PJS.to(null) === null, '지도 밖·빈 주소 = null');
  // ?proj=off 목록에서도 받은 박스 판정은 같다(목록 카드만 안 돌림)
  ok(mk('https://keduclass.com/grade3/semester2/math/index.html?proj=off').KT2_PROJ.to(MAP[Object.keys(MAP).find(k => ON.some(o => k.indexOf(o + '_') === 0))].url) !== null, 'proj=off 는 목록 카드만 끔');
  // 받은 박스 배선 — 스크립트 차례 + boxOpenUrl 실제 동작
  const IB = fs.readFileSync(path.join(ROOT, 'classwork', 'inbox.html'), 'utf8');
  const iPm = IB.indexOf('/kedu/teacher/stage2/projmap.js'), iSw = IB.indexOf('/kedu/teacher/stage2/proj_switch.js'), iMain = IB.indexOf('function boxOpenUrl');
  ok(iPm > 0 && iSw > iPm && iMain > iSw, '받은 박스: projmap → proj_switch → 본문 차례');
  const fn = (IB.match(/function boxOpenUrl\(it\)\{[\s\S]*?\n\}/) || [])[0]; ok(!!fn, 'boxOpenUrl 찾음');
  if (fn) {
    w.current = { bundle: { id: '11111111-2222-3333-4444-555555555555' } }; vm.runInContext(fn, CTX.get(w));
    const kOn = Object.keys(MAP).find(k => ON.some(o => k.indexOf(o + '_') === 0)), kOff = Object.keys(MAP).find(k => !ON.some(o => k.indexOf(o + '_') === 0));
    const cw = '&cwb=11111111-2222-3333-4444-555555555555&cwi=99999999-8888-7777-6666-555555555555';
    const it = (kind, url) => ({ kind, url, id: '99999999-8888-7777-6666-555555555555' });
    ok(w.boxOpenUrl(it('selfstudy', MAP[kOn].url)) === PJS.to(MAP[kOn].url) + cw, '켠 단원 자기주도 항목 → learn + cwb/cwi: ' + w.boxOpenUrl(it('selfstudy', MAP[kOn].url)));
    ok(w.boxOpenUrl(it('selfstudy', MAP[kOff].url)) === MAP[kOff].url + '?' + cw.slice(1), '끈 단원 자기주도 항목 = 원문 + cwb/cwi');
    ok(w.boxOpenUrl(it('link', MAP[kOn].url)) === MAP[kOn].url + '?' + cw.slice(1), '자료(link) 종류는 켠 단원이어도 원문');
    const src = it('selfstudy', MAP[kOn].url); w.boxOpenUrl(src); ok(src.url === MAP[kOn].url, 'boxOpenUrl 이 항목(DB 주소)을 바꾸지 않음');
  }
  // learn 무대: 박스 파이프가 실려 있고, 목록 단추는 박스로
  const LH = fs.readFileSync(path.join(S2, 'learn.html'), 'utf8');
  ok(LH.indexOf('/kedu_kbox_adapter.js') > 0 && LH.indexOf('/kedu_back.js') > LH.indexOf('stage2-learn.js'), 'learn.html 에 케이박스 어댑터·kedu_back');
  const hub = (search) => { const d = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://keduclass.com/kedu/teacher/stage2/learn.html' + search, runScripts: 'outside-only' }); const c = d.getInternalVMContext(); d.window.KT2_NO_BOOT = true; d.window.KT2_LEARN_NO_BOOT = true; ['stage2-art.js', 'stage2-fig.js', 'stage2.js', 'stage2-project.js', 'stage2-learn.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), c, { filename: f })); const L = d.window.KT2_LEARN; const o = Object.create(L.Learn ? L.Learn.prototype : Object.getPrototypeOf(L)); o.map = { url: '/grade3/semester2/math/1단원_곱셈/x.html' }; return o.hubUrl(); };
  let hb, hn; try { hb = hub('?g=3&t=2&s=math&u=1&l=u1_l01&cwb=11111111-2222-3333-4444-555555555555&cwi=99999999-8888-7777-6666-555555555555'); hn = hub('?g=3&t=2&s=math&u=1&l=u1_l01'); } catch (e) { hb = 'ERR ' + e.message; }
  ok(hb === '/classwork/inbox.html?box=11111111-2222-3333-4444-555555555555', 'learn 목록 단추(박스에서) = 받은 박스: ' + hb);
  ok(hn === '/grade3/semester2/math/index.html', 'learn 목록 단추(목록에서) = 과목 목록: ' + hn);
  ok(hub('?cwb=../../evil') === '/grade3/semester2/math/index.html', 'learn: 이상한 cwb 는 무시');
  console.log('  켠 차시 ' + nOn + ' · 끈 차시 ' + nOff + ' · 차시 지도 안 ' + nIn);
}

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패'); if (fails.length) console.log(fails.join('\n'));
process.exit(fail ? 1 : 0);

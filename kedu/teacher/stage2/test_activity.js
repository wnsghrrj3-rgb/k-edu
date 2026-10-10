/* stage2/test_activity.js — 케이티처 2세대 활동 층 v4 하니스.
   ① 카탈로그 30종 스키마·추천 매핑(g1 수학 u1 열 차시 전부) ② 런처 세 탭 + 참수 조작 ③ iframe 호스트 브리지 v1 왕복(READY→CONFIG, RESULT→수첩, EXIT, CLOSE, READY 타임아웃)
   ④ 수첩 → 다음 차시 ①복습 슬라이드 루프 ⑤ 활동 슬라이드(activityId) 카드·「＋ 슬라이드로」 ⑥ ⚡빠른 활동 12종 준비→시작→조작→끝 전건 + 답 미노출
   ⑦ 역검증(활동 층을 빼면 무대가 그대로 서는가 · 정답 미노출 검사가 실제로 잡는가)
   실행: node kedu/teacher/stage2/test_activity.js */
'use strict';
const fs = require('fs'); const path = require('path'); const vm = require('vm'); const { JSDOM } = require('jsdom');
const ROOT = path.resolve(__dirname, '..'); const DATA = path.join(ROOT, 'data'); const KEDU = path.resolve(ROOT, '..');
let pass = 0, fail = 0; const fails = []; const ok = (c, m) => { if (c) pass++; else { fail++; fails.push(m); } };
const CATALOG = JSON.parse(fs.readFileSync(path.join(KEDU, 'activities/_CATALOG.json'), 'utf8'));
const html = fs.readFileSync(path.join(__dirname, 'stage.html'), 'utf8');
const manifest = (() => { const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(__dirname, 'manifest.js'), 'utf8'), c); return c.window.KT2_MANIFEST; })();

// ── ① 카탈로그 ──
ok(Array.isArray(CATALOG) && CATALOG.length >= 30, '카탈로그 ' + CATALOG.length + '종');
CATALOG.forEach(a => {
  ok(a.id && a.title && a.genre && a.src && a.map && a.map.grade && a.map.subject && a.map.unit && Array.isArray(a.map.lessons), '스키마 ' + a.id);
  ok(fs.existsSync(path.join(KEDU, a.src)), '실행 파일 존재 ' + a.src);
  ok((a.map.lessons || []).every(l => /^l\d\d$/.test(l)), '차시 키 꼴 lNN ' + a.id);
});

function boot(g, s, u, key, opt) {
  opt = opt || {};
  const url = 'https://keduclass.com/kedu/teacher/stage2/stage.html?g=' + g + '&s=' + s + '&u=' + u + '&l=' + key;
  const dom = new JSDOM(html.replace(/<script src="[^"]+"><\/script>/g, ''), { url, pretendToBeVisual: true, runScripts: 'outside-only' });
  const w = dom.window; const d = w.document; w.KT2_NO_BOOT = true; w.setInterval = () => 0;
  w.HTMLCanvasElement.prototype.getContext = () => null; w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  w.requestAnimationFrame = fn => setTimeout(fn, 0);
  if (!opt.noCatalog) w.KT2_CATALOG = CATALOG;
  const ctx = dom.getInternalVMContext(); const run = p => vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: path.basename(p) });
  const sj = manifest.subjects.find(x => x.slug === 'g' + g + '_' + s); const un = sj.units.find(x => x.unit === +u);
  w.LESSONS = {}; run(path.join(__dirname, 'manifest.js')); run(path.join(DATA, path.basename(un.file))); if (un.resources) run(path.join(ROOT, un.resources));
  run(path.join(ROOT, 'engine/klab.js')); run(path.join(ROOT, 'engine/tools/shape3d.js')); run(path.join(ROOT, 'engine/tools/place_value.js'));
  run(path.join(__dirname, 'stage2-art.js')); run(path.join(__dirname, 'stage2-fig.js'));
  if (!opt.noLayer) { run(path.join(__dirname, 'stage2-activity.js')); run(path.join(__dirname, 'stage2-quick.js')); }
  run(path.join(__dirname, 'stage2.js'));
  if (!w.LESSONS[key]) throw new Error('차시 키 없음 ' + key);
  const st = new w.KT2.Stage({ params: { g: String(g), s, u: String(u), l: key }, lessons: w.LESSONS, unitTitle: un.title });
  return { w, d, st, un, KA: w.KT2_ACTIVITY, Q: w.KT2_QUICK };
}
const tick = ms => new Promise(r => setTimeout(r, ms || 0));

(async () => {
  // ── ② 추천 매핑 + 런처: 1학년 수학 1단원 열 차시 전부 ──
  const g1u1 = manifest.subjects.find(x => x.slug === 'g1_math').units.find(x => x.unit === 1);
  let recTotal = 0;
  for (const l of g1u1.lessons) {
    const { d, st, KA } = boot(1, 'math', 1, l.key); await tick();
    const G = KA.groups(st); recTotal += G.rec.length;
    const lns = (l.key.match(/l(\d+)/g) || []).map(x => 'l' + x.slice(1).padStart(2, '0'));
    ok(G.rec.every(a => a.map.unit === 1 && lns.some(ln => a.map.lessons.indexOf(ln) >= 0)) && G.unit.every(a => a.map.unit === 1) && G.rec.length + G.unit.length + G.rest.length === CATALOG.length, l.key + ' 추천/단원/전체 분할 (추천 ' + G.rec.length + ' · 단원 ' + G.unit.length + ')');
    const hb = d.querySelector('#hud button[data-h="act"]'); ok(!!hb && (G.rec.length ? hb.querySelector('.kact-cnt') && +hb.querySelector('.kact-cnt').textContent === G.rec.length : !hb.querySelector('.kact-cnt')), l.key + ' HUD 🎲 배지 = 추천 수');
  }
  ok(recTotal >= 3, 'g1 수학 u1 열 차시에 걸린 추천 합계 ' + recTotal + ' (count9·seq9·step)');

  // ── ③ 런처 조작 · iframe 호스트 왕복 ──
  {
    const { w, d, st, KA } = boot(1, 'math', 1, 'u1_l07'); await tick();
    st.hudAct('act'); await tick();
    ok(d.querySelector('#ov-act.on') && d.querySelectorAll('#ov-act .kact-tab').length === 4, '런처 열림 · 탭 4개(이 차시·단원·전체·⚡)');
    ok(d.querySelector('#ov-act .kact-tab.on').getAttribute('data-t') === 'rec' && d.querySelectorAll('#ov-act .kact-card').length >= 1, '첫 탭 = 이 차시 추천 · 카드 있음');
    const card = d.querySelector('#ov-act .kact-card'); const aid = card.getAttribute('data-id'); const a = KA.byId[aid];
    // 매개변수 칩 바꾸기
    const row = card.querySelector('.kact-prow'); let changedKey = null, changedVal = null;
    if (row) { const chips = row.querySelectorAll('.kact-chip'); const off = Array.from(chips).find(c => !c.classList.contains('on')); if (off) { off.click(); changedKey = row.getAttribute('data-k'); changedVal = off.getAttribute('data-v'); } }
    d.querySelector('#ov-act .kact-tab[data-t="all"]').click(); ok(d.querySelectorAll('#ov-act .kact-grp').length >= 5 && d.querySelectorAll('#ov-act .kact-card').length === CATALOG.length, '전체 탭 = 학년·단원 묶음 + 카드 ' + CATALOG.length);
    d.querySelector('#ov-act .kact-tab[data-t="unit"]').click(); ok(d.querySelectorAll('#ov-act .kact-card').length === KA.groups(st).unit.length, '단원 탭 카드 수');
    d.querySelector('#ov-act .kact-tab[data-t="rec"]').click();
    const c2 = d.querySelector('#ov-act .kact-card[data-id="' + aid + '"]'); if (changedKey) { const r2 = c2.querySelector('.kact-prow[data-k="' + changedKey + '"]'); Array.from(r2.querySelectorAll('.kact-chip')).find(c => c.getAttribute('data-v') === changedVal).click(); }
    c2.querySelector('[data-c="start"]').click();
    ok(!d.querySelector('#ov-act.on') && d.querySelector('#kact-host.on') && d.body.classList.contains('kact-open'), '▶ 시작 → 런처 닫힘 · 호스트 열림 · HUD 숨김');
    const f = d.querySelector('#kact-host iframe'); ok(f && f.src.indexOf('/kedu/' + a.src + '?mode=class&seed=') > 0, 'iframe src = 활동 파일 · class · seed (' + (f && f.src) + ')');
    ok(KA.session && (changedKey ? String(KA.session.params[changedKey]) === String(changedVal) : true) && Object.keys(KA.session.params).length === Object.keys(a.paramsSchema || {}).length, '설정 = 기본값 + 교사가 고른 칩');
    // 도구 흉내: READY → CONFIG 받기
    let got = null; const src = f.contentWindow; src.addEventListener('message', ev => { got = ev.data; });
    const send = (m) => { const ev = new w.MessageEvent('message', { data: m, origin: 'https://keduclass.com', source: src }); w.dispatchEvent(ev); };
    send({ t: 'ACTIVITY_READY', v: 1 }); await tick(10);
    ok(got && got.t === 'ACTIVITY_CONFIG' && got.mode === 'class' && got.params && got.meta && Array.isArray(got.meta.teamNames) && got.meta.teamNames.length === 2, 'READY → CONFIG(class·params·teamNames)');
    ok(!d.querySelector('#kact-host .kact-wait'), 'READY 뒤 대기 화면 제거');
    // 낯선 창의 메시지는 무시
    const before = KA.session; w.dispatchEvent(new w.MessageEvent('message', { data: { t: 'ACTIVITY_RESULT', v: 1, byType: {} }, origin: 'https://keduclass.com', source: w })); ok(KA.session === before, '낯선 source 의 RESULT 무시');
    // RESULT → 수첩
    const types = Object.keys(a.types || {}); const byType = {}; types.forEach((t, i) => byType[t] = { ok: 3, miss: i % 2 ? 2 : 0 });
    send({ t: 'ACTIVITY_RESULT', v: 1, score: 7, max: 10, byType, teams: [{ name: '케이팀', score: 4 }, { name: '듀팀', score: 3 }] }); await tick(10);
    ok(!KA.session && !d.querySelector('#kact-host.on') && d.querySelector('#ov-note.on'), 'RESULT → 호스트 닫힘 · 수첩 열림');
    const rows = d.querySelectorAll('#ov-note .kn-row'); ok(rows.length === Math.min(3, types.length) && rows[0].querySelector('.kn-miss b') && +rows[0].querySelector('.kn-miss b').textContent === 2, '수첩: 놓친 유형 상위 3 · miss 내림차순');
    ok(/7/.test(d.querySelector('#ov-note .kn-score').textContent) && d.querySelector('#ov-note .kn-team'), '수첩: 점수 7/10 · 팀 점수');
    ok(!!d.querySelector('#ov-note [data-n="review"]') && d.querySelector('#ov-note [data-n="box"]').disabled, '수첩: 복습 보내기 있음 · 케이박스 버튼은 막대 없으면 비활성');
    ok(KA.history(st.slug, st.key).length === 1, '수첩 기록 1건 저장');
    // 복습 보내기 → 다음 차시
    d.querySelector('#ov-note [data-n="review"]').click();
    const q = JSON.parse(w.localStorage.getItem('kt2_act_review_g1_math') || '{}'); ok(q['u1_l08'] && q['u1_l08'].misses.length === types.filter((t, i) => i % 2).length && q['u1_l08'].activityId === aid, '복습 대기열: u1_l08 에 놓친 유형만');
    ok(!d.querySelector('#ov-note.on'), '수첩 닫힘');
    // 다시 하기 → 재시작(같은 설정) → EXIT
    KA.openNotebook(a, { byType, score: 7, max: 10 }, { params: KA._lastLaunch.params, seed: 1 }); d.querySelector('#ov-note [data-n="retry"]').click(); await tick();
    ok(KA.session && KA.session.a.id === aid && (changedKey ? String(KA.session.params[changedKey]) === String(changedVal) : true), '🔁 다시 = 같은 활동·같은 설정');
    const f2 = d.querySelector('#kact-host iframe'); w.dispatchEvent(new w.MessageEvent('message', { data: { t: 'ACTIVITY_EXIT', v: 1 }, origin: 'https://keduclass.com', source: f2.contentWindow })); await tick();
    ok(!KA.session && !d.querySelector('#ov-note.on') && !d.querySelector('#kact-host.on'), 'EXIT → 수첩 없이 슬라이드 복귀');
    // CLOSE: 교사 닫기 → 도구 무응답 800ms 강제 정리 · ESC 도 같다
    KA.launch(a, {}); await tick(); let closeMsg = null; d.querySelector('#kact-host iframe').contentWindow.addEventListener('message', ev => { if (ev.data && ev.data.t === 'ACTIVITY_CLOSE') closeMsg = ev.data; });
    d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await tick(10); ok(!!closeMsg, 'ESC → ACTIVITY_CLOSE 발신'); await tick(900); ok(!KA.session, '무응답 800ms → 강제 정리');
    // READY 타임아웃 → 다시 시도
    const realTO = w.setTimeout; KA.launch(a, {}); await tick(); const s0 = KA.session; s0.readyTimer && clearTimeout(s0.readyTimer);
    // 타임아웃 함수를 직접 부른 것과 같게: createFrame 의 타임아웃 콜백을 재현
    d.querySelector('#kact-host .kact-wait').innerHTML = '<div>😢</div><button class="btn main" data-kh="retry">다시 시도</button>'; d.querySelector('#kact-host [data-kh="retry"]').click();
    ok(KA.session === s0 && d.querySelectorAll('#kact-host iframe').length === 1 && /불러오고/.test(d.querySelector('#kact-host .kact-wait').textContent), '다시 시도 → iframe 교체 1개 · 대기 문구');
    d.querySelector('#kact-host [data-kh="close"]').click(); await tick(900); ok(!KA.session, '닫기 버튼');
    void realTO;
    // 활동지
    KA.openWorksheet(a, { n: 5 }); ok(/worksheet\.html\?gen=/.test(KA._lastWs || '') && /n=5/.test(KA._lastWs), '🖨 활동지 주소 gen·params');
  }

  // ── ④ 복습 루프: 다음 차시를 열면 표지 뒤에 ①복습 슬라이드 ──
  {
    const A = boot(1, 'math', 1, 'u1_l07'); await tick(); const a = A.KA.groups(A.st).rec[0] || CATALOG[0];
    A.KA.queueReview(A.st, a, [{ key: 'x', label: '십의 자리가 같은 두 수', miss: 3, ok: 2 }, { key: 'y', label: '경계에 있는 두 수', miss: 1, ok: 4 }]);
    const stash = A.w.localStorage.getItem('kt2_act_review_g1_math');
    const B = boot(1, 'math', 1, 'u1_l08'); B.w.localStorage.setItem('kt2_act_review_g1_math', stash);
    // attach 는 생성자에서 이미 돌았으므로 다시 한 번 적용(저장소를 뒤늦게 넣었으니)
    const n0 = B.st.slides.length; const applied = B.KA.applyPendingReview(B.st);
    ok(applied && B.st.slides.length === n0 + 1 && B.st.slides[1].block === 'review' && B.st.slides[1]._added && B.st.slides[1].data.items.length === 2 && /십의 자리/.test(B.st.slides[1].data.items[0].q), '다음 차시: 표지 뒤 ①복습 슬라이드(놓친 유형 2개) 삽입');
    B.st.go(1, 1); ok(B.d.querySelector('#kt2-paper .rv2-board') && !/헷갈렸어요/.test(B.d.querySelector('#kt2-paper').textContent), '복습 슬라이드 = 칠판(rv2) · 답 미노출');
    B.st.act(B.d.querySelector('#kt2-paper [data-act="flip"]')); ok(/헷갈렸어요/.test(B.d.querySelector('#kt2-paper').textContent), '카드 뒤집으면 열림');
    ok(!JSON.parse(B.w.localStorage.getItem('kt2_act_review_g1_math'))['u1_l08'], '적용한 복습은 대기열에서 삭제');
    ok(!B.KA.applyPendingReview(B.st), '두 번 넣지 않는다');
    ok(B.st.sevenOf()[0] === true, '7요소 ①복습 판정에 잡힌다');
    B.st.removeAdded('act_review_u1_l08'); ok(B.st.slides.length === n0, '목차 🗑 로 뺄 수 있다');
  }

  // ── ⑤ 활동 슬라이드 · ＋ 슬라이드로 ──
  {
    const { d, st, KA } = boot(1, 'math', 1, 'u1_l02_03'); await tick(); const a = CATALOG.find(x => x.id === 'g1m_u1_count9');
    const n0 = st.slides.length; KA.insertSlide(a, { n: 5 });
    ok(st.slides.length === n0 + 1 && st.cur().block === 'activity' && st.cur().data.activityId === a.id && st.cur().data.params.n === 5, '＋ 슬라이드로 → 현재 뒤에 activity 슬라이드');
    ok(d.querySelector('#kt2-paper .kact-slide .kact-go') && /활동 시작/.test(d.querySelector('#kt2-paper').textContent) && /5/.test(d.querySelector('#kt2-paper .kact-slide-c').textContent), '활동 카드 렌더 · 설정 칩 n=5');
    st.act(d.querySelector('#kt2-paper [data-act="kact"]')); ok(KA.session && KA.session.a.id === a.id && KA.session.params.n === 5, '카드 ▶ → 그 설정으로 호스트');
    KA.endSession(false);
    // 카탈로그에 없는 id → 카드는 뜨되 경고
    const bad = KA.renderCard({ activityId: 'nope', title: '없는 활동' }); ok(/카탈로그에 없는/.test(bad), '없는 활동 id 경고 카드');
    // 1세대 꼴(goal·steps) activity 데이터는 교실 활동으로 그린다
    const r = st.constructor === st.constructor && d.defaultView.KT2.renderSlide({ id: 'x', block: 'activity', data: { title: '모둠 수첩', type: 'group', goal: '목표', steps: ['하나', '둘'] } }, { revealed: false, state: {}, meta: {}, unitTitle: '', classNames: [] });
    ok(/offline/.test(r.body) && /하나/.test(r.body) && !/legacy/.test(r.body), '1세대 activity(goal·steps) → 교실 활동 렌더(legacy 안내 0)');
    // 목차 ＋활동 → 넣기 모드 런처
    st.openToc(); ok(!!d.querySelector('#ov-toc [data-a="activity"]'), '목차에 ＋ 활동'); d.querySelector('#ov-toc [data-a="activity"]').click(); await tick();
    ok(d.querySelector('#ov-act.on') && KA._insert && !d.querySelector('#ov-act .kact-tab[data-t="quick"]') && d.querySelector('#ov-act .kact-card [data-c="insert"]') && !d.querySelector('#ov-act .kact-card [data-c="start"]'), '넣기 모드: ⚡탭 없음 · 카드 버튼 = 넣기만');
    KA.closeLauncher();
    // 카탈로그 못 읽음 → 런처는 뜨되 안내 · 빠른 활동은 됨
    const N = boot(1, 'math', 1, 'u1_l02_03', { noCatalog: true }); N.w.fetch = () => Promise.reject(new Error('x')); await tick(); N.st.hudAct('act'); await tick(20); ok(N.d.querySelector('#ov-act .kact-tab.on').getAttribute('data-t') === 'quick', '카탈로그 실패 → 첫 탭이 ⚡빠른 활동'); N.d.querySelector('#ov-act .kact-tab[data-t="rec"]').click();
    ok(N.KA.failed && N.d.querySelector('#ov-act.on') && /카탈로그/.test(N.d.querySelector('#ov-act .kact-body').textContent), '카탈로그 실패 → 안내 문구'); N.d.querySelector('#ov-act .kact-tab[data-t="quick"]').click(); ok(N.d.querySelectorAll('#ov-act .kq-tile').length === 12, '실패해도 ⚡빠른 활동 12타일');
  }

  // ── ⑥ ⚡빠른 활동 12종 전건 ──
  {
    const { w, d, st, Q, KA } = boot(1, 'math', 1, 'u1_l06'); await tick();
    ok(Q.list.length === 12, '빠른 활동 12종'); const hv = Q.harvest(st); ok(hv.length >= 6 && hv.every(x => /^[가-힣]{2,5}$/.test(x)), '이 차시 낱말 수확 ' + hv.length + ' (' + hv.slice(0, 5).join('·') + ')');
    ok(Q.chosung('학교') === 'ㅎㄱ' && Q.chosung('사과 나무') === 'ㅅㄱ ㄴㅁ', '초성 변환');
    st.hudAct('act'); await tick(); d.querySelector('#ov-act .kact-tab[data-t="quick"]').click();
    const tiles = d.querySelectorAll('#ov-act .kq-tile'); ok(tiles.length === 12, '타일 12');
    const clickB = (sel) => { const b = d.querySelector('#kq-paper ' + sel); if (!b) return false; b.click(); return true; };
    const q = (sel) => d.querySelector('#kq-paper ' + sel); const qa = (sel) => Array.from(d.querySelectorAll('#kq-paper ' + sel));
    const txt = () => d.querySelector('#kq-paper').textContent;
    const setField = (k, v) => { const el = d.querySelector('#ov-act [data-f="' + k + '"]'); if (!el) return; if (el.tagName === 'TEXTAREA') el.value = v; else { const c = Array.from(el.querySelectorAll('.kact-chip')).find(x => x.getAttribute('data-v') === String(v)); if (c) c.click(); } };
    const startQ = async (id, fields) => { st.hudAct('act'); await tick(); d.querySelector('#ov-act .kact-tab[data-t="quick"]').click(); d.querySelector('#ov-act .kq-tile[data-q="' + id + '"]').click(); Object.keys(fields || {}).forEach(k => setField(k, fields[k])); d.querySelector('#ov-act [data-kqs="go"]').click(); await tick(); return Q.open && d.querySelector('#kq-host.on') && !d.querySelector('#ov-act.on'); };
    const endQ = async () => { Q.close(true); await tick(); return !Q.open && !d.querySelector('#kq-host.on') && !d.body.classList.contains('kact-open'); };
    // 준비 화면 검사(잘못된 입력은 시작 안 됨)
    d.querySelector('#ov-act .kq-tile[data-q="bingo"]').click(); ok(d.querySelector('#ov-act .kq-form textarea[data-f="words"]').value.split('\n').length >= 6, '빙고 준비: 낱말 자동 채움'); setField('words', '가\n나'); d.querySelector('#ov-act [data-kqs="go"]').click(); ok(!Q.open && /9개/.test(d.querySelector('#ov-act .kq-f-err').textContent), '빙고: 낱말 부족 → 시작 막고 안내');
    // 1 빙고
    ok(await startQ('bingo', { words: ['사과', '배', '감', '귤', '포도', '수박', '참외', '딸기', '복숭아', '자두', '살구'].join('\n'), size: 3 }), '빙고 시작');
    ok(qa('.kq-bingo div').length === 9 && q('.kq-big.dim'), '빙고판 9칸 · 아직 부른 낱말 없음');
    for (let i = 0; i < 6; i++) clickB('[data-b="draw"]'); ok(qa('.kq-strip span').length === 6 && q('.kq-big.call') && qa('.kq-bingo div.on').length >= 1, '뽑기 6번 → 띠 6 · 판 표시'); clickB('[data-b^="w:"]'); ok(qa('.kq-strip span').length === 7, '낱말 직접 부르기'); ok(await endQ(), '빙고 끝');
    // 2 초성
    ok(await startQ('chosung', { words: '학교\n연필\n지우개' }), '초성 시작'); const cho0 = txt(); ok(/ㅎㄱ|ㅇㅍ|ㅈㅇㄱ/.test(cho0) && !/학교|연필|지우개/.test(cho0), '초성만 · 답 미노출'); clickB('[data-b="hint"]'); clickB('[data-b="open"]'); ok(/학교|연필|지우개/.test(txt()), '공개'); clickB('[data-b="got"]'); ok(/2/.test(q('.kq-counter').textContent), '맞혔어요 → 다음'); ok(await endQ(), '초성 끝');
    // 3 OX
    ok(await startQ('ox', { items: '삼각형은 변이 세 개다 | O | 변 셋\n원은 꼭짓점이 있다 | X' }), 'OX 시작'); ok(/삼각형/.test(txt()) && !q('.kq-ox-ans') && !/변 셋/.test(txt()), 'OX 문장만 · 정답·해설 미노출'); clickB('[data-b="open"]'); ok(q('.kq-ox-ans.O') && /변 셋/.test(txt()), 'O 공개 + 해설'); clickB('[data-b="next"]'); clickB('[data-b="open"]'); ok(q('.kq-ox-ans.X'), 'X 공개'); ok(await endQ(), 'OX 끝');
    // 4 카드 짝짓기
    ok(await startQ('memory', { pairs: '3+4 = 7\n2+2 = 4\n5+1 = 6', teams: 2 }), '짝짓기 시작'); ok(qa('.kq-card').length === 6 && qa('.kq-card.on').length === 0 && qa('.kq-teams span').length === 2, '카드 6 · 뒤집힌 것 0 · 두 팀');
    { const cards = qa('.kq-card'); const t = c => c.querySelector('.b').textContent; const i7 = cards.findIndex(c => t(c) === '7'), i34 = cards.findIndex(c => t(c) === '3+4'), i4 = cards.findIndex(c => t(c) === '4'); clickB('[data-b="c:' + i34 + '"]'); clickB('[data-b="c:' + i7 + '"]'); ok(qa('.kq-card.done').length === 2 && /1/.test(qa('.kq-teams span')[0].textContent), '짝 맞음 → 팀 1점'); clickB('[data-b="c:' + i4 + '"]'); const j = cards.findIndex((c, k) => k !== i4 && k !== i7 && k !== i34 && t(c) !== '2+2'); clickB('[data-b="c:' + j + '"]'); await tick(950); ok(qa('.kq-card.on').length === 2 && qa('.kq-teams span.on')[0] && /듀팀|케이팀/.test(qa('.kq-teams span.on')[0].textContent) && qa('.kq-teams span')[1].classList.contains('on'), '틀림 → 다시 뒤집힘 · 팀 교대'); }
    ok(await endQ(), '짝짓기 끝');
    // 5 룰렛
    ok(await startQ('roulette', { items: '', remove: 1 }), '룰렛 시작(명단)'); ok(qa('.kq-wheel span').length === 24, '명단 24칸'); clickB('[data-b="spin"]'); await tick(2800); ok(qa('.kq-strip span').length === 1 && qa('.kq-wheel span').length === 23, '돌리기 → 1명 뽑히고 빠짐'); ok(await endQ(), '룰렛 끝');
    // 6 끝말잇기
    ok(await startQ('wordchain', { start: '학교', dueum: 1, sec: 0 }), '끝말잇기 시작'); const inp = () => q('.kq-in'); inp().value = '교실'; clickB('[data-b="add"]'); ok(qa('.kq-chain span').length === 2, '교실 잇기'); inp().value = '사과'; clickB('[data-b="add"]'); ok(qa('.kq-chain span').length === 2 && /❌/.test(q('.kq-msg').textContent), '실 → 사과 거절'); inp().value = '실내'; clickB('[data-b="add"]'); inp().value = '내리막'; clickB('[data-b="add"]'); inp().value = '악어'; clickB('[data-b="add"]'); ok(qa('.kq-chain span').length === 4 && /❌/.test(q('.kq-msg').textContent), '막 → 악어 거절'); inp().value = '학교'; clickB('[data-b="add"]'); ok(/❌/.test(q('.kq-msg').textContent) && qa('.kq-chain span').length === 4, '중복 거절'); ok(await endQ(), '끝말잇기 끝');
    // 7 분류
    ok(await startQ('classify', { groups: '동물: 개, 고양이\n식물: 소나무, 장미' }), '분류 시작'); ok(qa('.kq-pool .kq-word').length === 4 && qa('.kq-bin').length === 2, '4항목 · 2칸');
    { const put = (word, bin) => { const wb = qa('.kq-pool .kq-word').find(x => x.textContent === word); wb.click(); qa('.kq-bin')[bin].click(); }; put('개', 0); put('고양이', 0); put('소나무', 1); put('장미', 0); clickB('[data-b="check"]'); ok(qa('.kq-word.ok').length === 3 && qa('.kq-word.ng').length === 1, '채점: 초록 3 · 빨강 1'); }
    ok(await endQ(), '분류 끝');
    // 8 선 잇기
    ok(await startQ('linematch', { pairs: '사과 = 🍎\n바나나 = 🍌\n포도 = 🍇' }), '선 잇기 시작'); ok(qa('.kq-col.l .kq-word').length === 3 && qa('.kq-col.r .kq-word').length === 3, '좌우 3');
    { const link = (i, j) => { clickB('[data-b="l:' + i + '"]'); clickB('[data-b="r:' + j + '"]'); }; link(0, 0); link(1, 1); link(2, 2); ok(qa('.kq-lines line').length === 3, '선 3'); clickB('[data-b="check"]'); ok(qa('.kq-lines line.ok').length === 3 || qa('.kq-lines line.ng').length >= 1, '채점 색'); }
    ok(await endQ(), '선 잇기 끝');
    // 9 빈칸
    ok(await startQ('blank', { items: '삼각형은 변이 ___ 개다 | 3\n사각형은 변이 ___ 개다 | 4' }), '빈칸 시작'); ok(qa('.kq-blank').length === 2 && qa('.kq-pool .kq-word').length === 2 && !/개다 3|개다 4/.test(txt()), '빈칸 2 · 보기 2 · 답이 문장에 안 박힘');
    { clickB('[data-b="s:0"]'); qa('.kq-pool .kq-word').find(x => x.textContent === '3').click(); clickB('[data-b="s:1"]'); qa('.kq-pool .kq-word').find(x => x.textContent === '4').click(); clickB('[data-b="check"]'); ok(qa('.kq-blank.ok').length === 2, '채점 2/2'); }
    ok(await endQ(), '빈칸 끝');
    // 10 받아쓰기
    ok(await startQ('dictation', { items: '나는 학교에 간다\n하늘이 파랗다', lang: 'ko-KR' }), '받아쓰기 시작'); ok(q('.kq-ear') && !/학교에/.test(txt()), '귀 화면 · 문장 미노출'); clickB('[data-b="say"]'); clickB('[data-b="hint"]'); ok(qa('.kq-boxes i').length === 9 && qa('.kq-boxes i.sp').length === 2 && !/학교에/.test(txt()), '글자 수 상자 9(띄어쓰기 2 포함) · 아직 미노출'); clickB('[data-b="open"]'); ok(/나는 학교에 간다/.test(txt()), '정답 공개'); ok(await endQ(), '받아쓰기 끝');
    // 11 미로
    ok(await startQ('maze', { rule: '홀수만', ok: '1\n3\n5\n7\n9', ng: '2\n4\n6\n8' }), '미로 시작'); ok(qa('.kq-cell').length === 25 && q('.kq-cell.here.s'), '5×5 · 시작 칸');
    { // 길 따라 걷기: BFS 로 ok 칸 경로 찾아 밟는다 (길이 반드시 있어야 한다)
      const cells = qa('.kq-cell').map(c => ({ el: c, t: c.textContent.replace(/🚩|🏁/g, '').trim() })); const okSet = new Set(['1', '3', '5', '7', '9']); const N = 5; const isOk = (x, y) => okSet.has(cells[y * N + x].t); const prev = {}; const seen = { '0,0': 1 }; const qq = [[0, 0]]; let found = false;
      while (qq.length) { const [x, y] = qq.shift(); if (x === 4 && y === 4) { found = true; break; } [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N || seen[nx + ',' + ny] || !isOk(nx, ny)) return; seen[nx + ',' + ny] = 1; prev[nx + ',' + ny] = x + ',' + y; qq.push([nx, ny]); }); }
      ok(found, '미로에 길이 있다'); if (found) { const route = []; let k = '4,4'; while (k !== '0,0') { route.unshift(k); k = prev[k]; } clickB('[data-b="m:2,2"]'); const fellBefore = q('.kq-cell.bad'); route.forEach(r => clickB('[data-b="m:' + r + '"]')); ok(q('.kq-done') && q('.kq-cell.here.e'), '길 따라 도착 🏁'); void fellBefore; }
    }
    ok(await endQ(), '미로 끝');
    // 12 순서
    ok(await startQ('order', { items: '씨앗\n싹\n잎\n꽃' }), '순서 시작'); ok(qa('.kq-slot').length === 4 && qa('.kq-pool .kq-word').length === 4, '빈 자리 4 · 카드 4');
    { ['씨앗', '싹', '잎', '꽃'].forEach(t => qa('.kq-pool .kq-word').find(x => x.textContent === t).click()); ok(qa('.kq-slot.on').length === 4, '4장 놓음'); clickB('[data-b="check"]'); ok(qa('.kq-slot.ok').length === 4, '채점 4/4'); }
    ok(await endQ(), '순서 끝');
    ok(JSON.parse(w.localStorage.getItem('kt2_quick_log')).length === 12 && JSON.parse(w.localStorage.getItem('kt2_quick_log')).every(e => e.line), '빠른 활동 기록 12건 · 결과 한 줄 전부');
    // 준비 값 기억
    st.hudAct('act'); await tick(); d.querySelector('#ov-act .kact-tab[data-t="quick"]').click(); d.querySelector('#ov-act .kq-tile[data-q="bingo"]').click(); ok(/살구/.test(d.querySelector('#ov-act textarea[data-f="words"]').value), '지난 준비 값 기억'); d.querySelector('#ov-act [data-kqs="fill"]').click(); ok(!/살구/.test(d.querySelector('#ov-act textarea[data-f="words"]').value) && d.querySelector('#ov-act textarea[data-f="words"]').value.split('\n').length >= 6, '↻ 이 차시 낱말로 다시 채우기'); KA.closeLauncher();
    // ESC 로 빠른 활동 닫기
    await startQ('ox', { items: 'a | O\nb | X' }); d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await tick(); ok(!Q.open, 'ESC → 빠른 활동 닫힘');
  }

  // ── ⑥-b ⚡ 혼자 꼴 (D59 — 준호 09-28 「활동은 1인도 가능하게」·10-06 위임) ──
  {
    const { w, d, st, Q } = boot(1, 'math', 1, 'u1_l06'); await tick();
    const q = (sel) => d.querySelector('#kq-paper ' + sel); const qa = (sel) => Array.from(d.querySelectorAll('#kq-paper ' + sel)); const txt = () => d.querySelector('#kq-paper').textContent;
    const clickB = (sel) => { const b = d.querySelector('#kq-paper ' + sel); if (!b) return false; b.click(); return true; };
    ok(['bingo', 'roulette', 'wordchain', 'dictation'].every(id => !Q.soloable(id)) && ['chosung', 'ox', 'memory', 'classify', 'linematch', 'blank', 'maze', 'order'].every(id => Q.soloable(id)), '혼자 꼴 8종 · 교사 진행형 4종은 없음');
    ok(Q.startSolo('bingo', { words: 'a\nb' }, st) === null && !Q.open, 'bingo 혼자 진입 거절');
    ok(Q.startSolo('ox', { items: 'x' }, st).error && !Q.open, '혼자도 준비 검사는 같다(잘못된 입력 → 시작 안 됨)');
    let closed = null; Q.onSoloClose = o => { closed = o; };
    // OX 혼자: O·X 버튼 → 채점, 공개 버튼 없음
    Q.startSolo('ox', { items: '삼각형은 변이 세 개다 | O | 변 셋\n원은 꼭짓점이 있다 | X', seed: 3 }, st); await tick();
    ok(Q.open && /혼자/.test(d.querySelector('#kq-host .kq-h-t').textContent) && d.querySelector('#kq-host.solo'), 'OX 혼자 열림 · HUD 「혼자」');
    ok(qa('.kq-ox-pick .kq-word').length === 2 && !q('[data-b="open"]') && !q('.kq-ox-ans') && !/변 셋/.test(txt()), 'O·X 버튼 2 · 공개 버튼 없음 · 정답·해설 미노출');
    ok(q('[data-b="next"]').classList.contains('dis'), '답하기 전엔 다음 못 감');
    clickB('[data-b="a:O"]'); ok(q('.kq-ox-ans.O') && /맞았어요/.test(txt()) && /변 셋/.test(txt()), 'O → 맞음 + 해설'); clickB('[data-b="next"]');
    clickB('[data-b="a:O"]'); ok(q('.kq-ox-ans.X') && /다시 생각/.test(txt()), '2문항 O → 틀림(답 X)');
    ok(/🏁/.test(q('[data-b="next"]').textContent), '마지막은 🏁 끝'); clickB('[data-b="next"]'); await tick();
    ok(!Q.open && closed && closed.id === 'ox' && closed.ended && closed.result && closed.result.score === 1 && closed.result.total === 2 && closed.result.done, '끝 → onSoloClose 결과 1/2');
    ok(!w.localStorage.getItem('kt2_quick_log'), '★ 혼자 꼴은 기기 기록(kt2_quick_log) 없음 — 동의 원칙');
    // 초성 혼자: 보기 4 → 고르기
    closed = null; Q.startSolo('chosung', { words: '학교\n연필\n지우개\n책상\n의자', seed: 5 }, st); await tick();
    ok(qa('.kq-pool .kq-word').length === 4 && !q('[data-b="open"]') && !q('[data-b="got"]'), '보기 4 · 공개/맞혔어요 버튼 없음');
    const cho = q('.kq-big.cho').textContent; const opts = qa('.kq-pool .kq-word').map(b => b.textContent); const ans = opts.find(o => Q.chosung(o) === cho);
    ok(!!ans && !/학교|연필|지우개|책상|의자/.test(q('.kq-big').textContent), '보기 중 정답 하나 · 큰 글자엔 초성만');
    clickB('[data-b="hint"]'); ok(q('.kq-big').textContent.charAt(0) === ans.charAt(0), '힌트 한 글자는 그대로');
    qa('.kq-pool .kq-word').find(b => b.textContent === ans).click(); ok(q('.kq-word.ok') && q('.kq-big.ans').textContent === ans, '정답 고름 → 초록 · 낱말 공개');
    clickB('[data-b="next"]'); const wrong = qa('.kq-pool .kq-word').find(b => Q.chosung(b.textContent) !== q('.kq-big.cho').textContent); wrong.click(); ok(q('.kq-word.ng') && q('.kq-word.ok'), '오답 → 빨강 + 정답 초록');
    for (let k = 0; k < 4; k++) { clickB('[data-b="next"]'); if (Q.open) { const a2 = qa('.kq-pool .kq-word').find(b => Q.chosung(b.textContent) === q('.kq-big.cho').textContent); if (a2) a2.click(); } } await tick();
    ok(!Q.open && closed && closed.result.total === 5 && closed.result.score === 4 && closed.result.done, '5문제 끝 → 4/5');
    // 짝짓기 혼자: 팀 없음
    closed = null; Q.startSolo('memory', { pairs: '3+4 = 7\n2+2 = 4\n5+1 = 6', teams: 2, seed: 2 }, st); await tick();
    ok(qa('.kq-teams').length === 0 && /시도/.test(txt()), '혼자는 teams=2 를 줘도 팀 없음');
    { const cards = qa('.kq-card'); const t = c => c.querySelector('.b').textContent; const i7 = cards.findIndex(c => t(c) === '7'), i34 = cards.findIndex(c => t(c) === '3+4'); clickB('[data-b="c:' + i34 + '"]'); clickB('[data-b="c:' + i7 + '"]'); }
    Q.close(true); ok(closed && closed.result.score === 1 && closed.result.total === 3 && !closed.result.done, '중간 닫기 → 1/3 · done 아님');
    // 분류 혼자: 채점 전 0, 채점 후 점수
    closed = null; Q.startSolo('classify', { groups: '동물: 개, 고양이\n식물: 소나무, 장미', seed: 2 }, st); await tick();
    { const put = (word, bin) => { qa('.kq-pool .kq-word').find(x => x.textContent === word).click(); qa('.kq-bin')[bin].click(); }; put('개', 0); put('고양이', 0); put('소나무', 1); put('장미', 0); }
    Q.close(false); ok(closed && closed.result.score === 0 && !closed.result.done && !closed.ended, '채점 전 닫음 → 0 · done 아님');
    closed = null; Q.startSolo('classify', { groups: '동물: 개, 고양이\n식물: 소나무, 장미', seed: 2 }, st); await tick();
    { const put = (word, bin) => { qa('.kq-pool .kq-word').find(x => x.textContent === word).click(); qa('.kq-bin')[bin].click(); }; put('개', 0); put('고양이', 0); put('소나무', 1); put('장미', 0); clickB('[data-b="check"]'); }
    Q.close(true); ok(closed && closed.result.score === 3 && closed.result.total === 4 && closed.result.done, '채점 뒤 → 3/4');
    // 선잇기·빈칸·순서·미로 — 결과 있음
    closed = null; Q.startSolo('linematch', { pairs: '사과 = 🍎\n바나나 = 🍌\n포도 = 🍇', seed: 2 }, st); await tick(); [0, 1, 2].forEach(i => { clickB('[data-b="l:' + i + '"]'); clickB('[data-b="r:' + i + '"]'); }); clickB('[data-b="check"]'); Q.close(true); ok(closed && closed.result.total === 3 && closed.result.score === 3, '선 잇기 혼자 3/3');
    closed = null; Q.startSolo('blank', { items: '삼각형은 변이 ___ 개다 | 3\n사각형은 변이 ___ 개다 | 4', seed: 2 }, st); await tick(); clickB('[data-b="s:0"]'); qa('.kq-pool .kq-word').find(x => x.textContent === '4').click(); clickB('[data-b="s:1"]'); qa('.kq-pool .kq-word').find(x => x.textContent === '3').click(); clickB('[data-b="check"]'); Q.close(true); ok(closed && closed.result.total === 2 && closed.result.score === 0, '빈칸 혼자 0/2(바꿔 넣음)');
    closed = null; Q.startSolo('order', { items: '씨앗\n싹\n잎\n꽃', seed: 2 }, st); await tick(); ['씨앗', '싹', '잎', '꽃'].forEach(t => qa('.kq-pool .kq-word').find(x => x.textContent === t).click()); clickB('[data-b="check"]'); Q.close(true); ok(closed && closed.result.score === 4 && closed.result.total === 4, '순서 혼자 4/4');
    closed = null; Q.startSolo('maze', { rule: '홀수만', ok: '1\n3\n5\n7\n9', ng: '2\n4\n6\n8', seed: 9 }, st); await tick(); clickB('[data-b="m:1,0"]'); Q.close(false); ok(closed && closed.result.total === 1 && closed.result.score === 0 && typeof closed.result.fell === 'number', '미로 혼자 — 도착 전 0/1 · 헛디딤 수');
    // 역검증: 교사 꼴은 그대로(solo 없이 열면 공개 버튼·팀·기록)
    Q.onSoloClose = null; Q.start(Q.list.find(a => a.id === 'ox'), { items: 'a | O\nb | X', seed: 1 }, st); await tick();
    ok(q('[data-b="open"]') && !q('.kq-ox-pick') && !d.querySelector('#kq-host.solo'), '★ 역검증: 교사 꼴 OX 는 공개 버튼 그대로·O·X 버튼 없음'); const r0 = Q.close(true); ok(r0 === null && JSON.parse(w.localStorage.getItem('kt2_quick_log')).length === 1, '교사 꼴은 기록 남고 결과 반환 없음');
  }

  // ── ⑧ 투영 접점 (D60 — 13회차): 자기주도 학생 화면(learn.html)의 「🎲 혼자 해 보는 활동」 ──
  {
    const PJ = require(path.join(__dirname, 'stage2-project.js'));
    const ids = (arr) => arr.map(a => a.id).join(',');
    // (a) 고르기 — 학기·solo·live·phase 차례·둘까지
    ok(PJ.actsFor(CATALOG, { g: 3, t: 2, s: 'math', u: 1, l: 'u1_l03' }, { all: true }).length === 0, '3-2 수학 u1 에 3-1 활동이 끼지 않는다(학기)');
    ok(ids(PJ.actsFor(CATALOG, { g: 3, s: 'math', u: 1, l: 'u1_l03' }, { all: true })) === 'g3m_u1_addsub', '3-1 수학 u1_l03 → g3m_u1_addsub (t 없음 = 1학기)');
    ok(PJ.actsFor(CATALOG, { g: 3, s: 'math', u: 1, l: 'u1_l03' }).length === CATALOG.filter(a => a.status === 'live' && a.map.grade === 3 && a.map.unit === 1 && a.map.subject === 'math').length, '기본은 live 만(지금 live 0 → 학생 화면에 검수 전 활동 0)');
    ok(ids(PJ.actsFor(CATALOG, { g: 1, s: 'math', u: 3, l: 'u3_l09' }, { all: true })) === 'g1m_u3_explore,g1m_u3_duel_sg', 'phase 차례 — 도입(explore) 먼저, 연습(duel_sg) 다음');
    ok(PJ.actsFor(CATALOG, { g: 1, s: 'math', u: 1, l: 'u1_l02_03' }, { all: true }).some(a => a.id === 'g1m_u1_count9'), '두 차시 묶음 키(u1_l02_03)도 매칭');
    const noSolo = CATALOG.filter(a => a.id === 'g3m_u1_addsub').map(a => Object.assign({}, a, { modes: ['class'] }));
    ok(PJ.actsFor(noSolo, { g: 3, s: 'math', u: 1, l: 'u1_l03' }, { all: true }).length === 0, 'solo 없는 활동은 학생 화면에 안 간다');
    const many = [1, 2, 3].map(i => Object.assign({}, CATALOG.find(a => a.id === 'g3m_u1_addsub'), { id: 'x' + i }));
    ok(PJ.actsFor(many, { g: 3, s: 'math', u: 1, l: 'u1_l03' }, { all: true }).length === 2, '한 차시에 둘까지');
    // (b) 끼우기 — 실제 3-1 수학 u3_l04 정본
    const c3 = { window: {} }; c3.window.LESSONS = {}; vm.createContext(c3); vm.runInContext('var window=this.window;' + fs.readFileSync(path.join(DATA, 'g3_math_u3.js'), 'utf8'), c3);
    const L34 = c3.window.LESSONS.u3_l04; const pj = PJ.project(L34); const acts = PJ.actsFor(CATALOG, { g: 3, s: 'math', u: 3, l: 'u3_l04' }, { all: true });
    ok(ids(acts) === 'g3m_u3_quotient', '3-1 수학 u3_l04 → g3m_u3_quotient');
    const sl = PJ.withActivities(pj.slides, acts, CATALOG); const ai = sl.findIndex(x => x.act);
    const lastBasic = (() => { let k = -1; pj.slides.forEach((x, i) => { if (x.stage === '기본문제') k = i; }); return k; })();
    ok(sl.length === pj.slides.length + 1 && ai === lastBasic + 1 && sl[ai].stage === '기본문제', 'practice → 기본문제 끝 바로 뒤에 한 장');
    ok(sl[ai].act.src === 'activities/g3m_u3_quotient.html' && sl[ai].block === 'activity' && sl[ai].data.tag === '🎲 혼자 해 보는 활동', '활동 장 꼴(src·block·꼬리표)');
    ok(!sl[ai].learn && pj.scored.indexOf(sl[ai].id) < 0, '활동 장은 채점 문항이 아니다(100점 무개변)');
    ok(sl[sl.length - 1].id === pj.slides[pj.slides.length - 1].id, '마지막 장(다음 차시)은 그대로 마지막');
    ok(PJ.withActivities(pj.slides, [], CATALOG).length === pj.slides.length, '활동 없으면 장 수 그대로');
    const wrap = PJ.withActivities(pj.slides, [CATALOG.find(a => a.phase === 'wrapup')], CATALOG); const wi = wrap.findIndex(x => x.act);
    ok(wrap[wi].stage === '정리' && wrap[wi - 1].stage !== '정리', 'wrapup → 정리 첫 장 앞');
    const intro = PJ.withActivities(pj.slides, [CATALOG.find(a => a.phase === 'intro')], CATALOG); const ii = intro.findIndex(x => x.act);
    ok(intro[ii].stage === '도입' && intro[ii + 1].stage !== '도입', 'intro → 도입 끝');
    // (c) 정본에 박힌 활동 장(activityId) — 카탈로그로 채우거나 뺀다 · 1세대 교실 활동 꼴은 종전대로 건너뜀
    ok(PJ.projectSlide({ id: 'a', stage: '전개', block: 'activity', data: { title: '모둠 놀이', steps: ['x'] } }) === null, '1세대 activity(activityId 없음) → 투영에서 건너뜀(종전)');
    const emb = PJ.projectSlide({ id: 'e1', stage: '기본문제', block: 'activity', data: { activityId: 'g1m_u1_count9', title: '우리 반 세기', params: { n: 5 }, note: '👉 교사 쪽지' } });
    ok(emb && emb.act && emb.act.id === 'g1m_u1_count9' && !emb.act.src && !emb.data.note, '박힌 활동 장 → act(교사 쪽지 뺌)');
    const filled = PJ.withActivities([emb, { id: 'z', stage: '정리', block: 'summary', data: {} }], [], CATALOG);
    ok(filled.length === 2 && filled[0].act.src === 'activities/g1m_u1_count9.html' && filled[0].data.title === '우리 반 세기' && filled[0].act.params.n === 5, '박힌 활동 장 — src 채움 · 제목·설정 값은 정본 것');
    ok(PJ.withActivities([Object.assign({}, emb, { act: { id: 'nope' } })], [], CATALOG).length === 0, '카탈로그에 없는 박힌 활동 장 → 뺀다');
    ok(PJ.withActivities([emb], [CATALOG.find(a => a.id === 'g1m_u1_count9')], CATALOG).filter(x => x.act).length === 1, '박힌 활동과 추천이 같으면 한 번만');
    // (d) 교사 무대 KA.groups 학기 수리
    const KAc = { window: { document: null, location: { hostname: 'keduclass.com', origin: 'https://keduclass.com' } } }; vm.createContext(KAc); vm.runInContext('var window=this.window;' + fs.readFileSync(path.join(__dirname, 'stage2-activity.js'), 'utf8'), KAc);
    const KA2 = KAc.window.KT2_ACTIVITY; KA2.setCatalog(CATALOG);
    ok(KA2.groups({ g: 3, s: 'math', u: 1, t: 2, key: 'u1_l03' }).rec.length === 0 && KA2.groups({ g: 3, s: 'math', u: 1, t: 2, key: 'u1_l03' }).unit.length === 0, '교사 무대 — 3-2 수학 u1 에 3-1 활동 추천 0(학기)');
    ok(ids(KA2.groups({ g: 3, s: 'math', u: 1, t: 1, key: 'u1_l03' }).rec) === 'g3m_u1_addsub', '교사 무대 — 3-1 수학 u1_l03 추천 그대로');

    // (e) 학생 화면 jsdom — learn.html 실물 순서로 싣고 활동 장을 끝까지 걷는다
    const LH = fs.readFileSync(path.join(__dirname, 'learn.html'), 'utf8');
    ok(LH.indexOf('stage2-learn-act.js') > LH.indexOf('stage2-project.js') && LH.indexOf('stage2-learn-act.js') < LH.indexOf('stage2-learn.js"'), 'learn.html — 투영기 뒤·learn 무대 앞에 활동 층');
    const bootLearn = (search, opt) => {
      opt = opt || {};
      const dom = new JSDOM('<!doctype html><html><head></head><body class="learn"><div id="kt2-stage"></div><div id="lbar" class="lbar"></div><div id="toast"></div></body></html>', { url: 'https://keduclass.com/kedu/teacher/stage2/learn.html' + search, pretendToBeVisual: true, runScripts: 'outside-only' });
      const w = dom.window, d = w.document; w.KT2_NO_BOOT = true; w.KT2_LEARN_NO_BOOT = true; w.setInterval = () => 0; w.HTMLCanvasElement.prototype.getContext = () => null; w.requestAnimationFrame = fn => setTimeout(fn, 0);
      if (!opt.noCatalog) w.KT2_CATALOG = CATALOG; w.LESSONS = {};
      const rec = []; w.kedu = { recordAnswer: function () { rec.push([].slice.call(arguments)); } };
      const ctx = dom.getInternalVMContext(); const run = p => vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: path.basename(p) });
      ['manifest.js', 'stage2-art.js', 'stage2-fig.js', 'stage2.js', 'stage2-project.js'].concat(opt.noLayer ? [] : ['stage2-learn-act.js']).concat(['stage2-learn.js']).forEach(f => run(path.join(__dirname, f)));
      run(path.join(DATA, 'g3_math_u3.js'));
      return { w, d, rec, ctx };
    };
    const mk = async (search, opt) => { const B = bootLearn(search, opt); if (B.w.KT2_LEARN_ACT) await B.w.KT2_LEARN_ACT.ready(); const q = { g: '3', s: 'math', u: '3', l: 'u3_l04' }; const Lr = new B.w.KT2_LEARN.Learn({ params: q, lesson: B.w.LESSONS.u3_l04, unitTitle: '' }); return Object.assign(B, { Lr, LA: B.w.KT2_LEARN_ACT }); };
    {
      const { w, d, rec, Lr, LA } = await mk('?g=3&s=math&u=3&l=u3_l04&act=all');
      const i = Lr.slides.findIndex(x => x.act); ok(i > 0 && Lr.slides.length === pj.slides.length + 1, '학생 화면 — 활동 장 하나 끼워짐(?act=all)');
      ok(Lr.scoredIds.length === pj.scored.length && Lr.slides.filter(x => x.learn && x.learn.pts).reduce((t, x) => t + x.learn.pts, 0) === 100, '학생 화면 — 채점 문항·100점 합 무개변');
      Lr.go(i, 1); const btn = d.querySelector('[data-lact="act-go"]');
      ok(!!btn && /혼자 해 보기/.test(btn.textContent) && !Lr.locked(), '활동 장 — 「▶ 혼자 해 보기」 · 넘김 막지 않음');
      ok(!!d.querySelector('.la-draft'), '검수 전 활동은 미리보기 표시');
      ok(!d.querySelector('#kt2-paper [data-act="timer"]'), '활동 장에 타이머 단추 없음');
      Lr.lact(btn); const host = d.getElementById('la-host'); const f = host && host.querySelector('iframe');
      ok(host && host.classList.contains('on') && f && /^\/kedu\/activities\/g3m_u3_quotient\.html\?mode=solo&seed=\d+$/.test(f.getAttribute('src')), '누르면 전체 화면 호스트 · src = 활동?mode=solo&seed=');
      const sent = []; f.contentWindow.postMessage = (m) => sent.push(m);
      const idx0 = Lr.idx; d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); ok(Lr.idx === idx0, '활동이 열린 동안 → 키로 장이 안 넘어간다');
      w.dispatchEvent(new w.MessageEvent('message', { data: { t: 'ACTIVITY_READY', v: 1 }, origin: 'https://evil.example', source: f.contentWindow })); ok(sent.length === 0, '다른 origin READY 무시');
      w.dispatchEvent(new w.MessageEvent('message', { data: { t: 'ACTIVITY_READY', v: 1 }, origin: 'https://keduclass.com', source: f.contentWindow }));
      ok(sent.length === 1 && sent[0].t === 'ACTIVITY_CONFIG' && sent[0].mode === 'solo' && sent[0].params && sent[0].meta && sent[0].meta.roster === null && sent[0].meta.teamNames === null, 'READY → CONFIG mode solo · 명단·팀 없음');
      ok(Object.keys(sent[0].params).length === Object.keys(CATALOG.find(a => a.id === 'g3m_u3_quotient').paramsSchema || {}).length, 'CONFIG params = 카탈로그 기본값');
      w.dispatchEvent(new w.MessageEvent('message', { data: { t: 'ACTIVITY_RESULT', v: 1, mode: 'solo', score: 8, total: 10, durationSec: 95, byType: { a: { ok: 8, miss: 2 } } }, origin: 'https://keduclass.com', source: f.contentWindow }));
      ok(!host.classList.contains('on') && !host.querySelector('iframe') && !d.body.classList.contains('la-open'), 'RESULT → 호스트 닫힘');
      ok(/8<\/b> \/ 10/.test(d.querySelector('.la-res') ? d.querySelector('.la-res').innerHTML : '') && /한 번 더/.test(d.querySelector('[data-lact="act-go"]').textContent), '카드에 결과 한 줄 · 「한 번 더」');
      const r0 = rec[rec.length - 1]; ok(rec.length === 1 && r0[0] === 'u3_l04_' + Lr.slides[i].id && r0[1] === true && r0[2] === 95 && r0[4].src === 'kt2-learn-act' && r0[4].activityId === 'g3m_u3_quotient' && r0[4].score === 8 && r0[4].total === 10, '기록 — 트래커 recordAnswer(키_장, 8할 이상 = 맞음, 걸린 초, src·활동·점수)');
      ok(Lr.score === 0, '활동 결과는 ⭐ 점수에 안 들어간다');
      // 한 번 더 → EXIT 는 기록 없이 닫힘 · 결과 줄은 앞 판 그대로
      Lr.lact(d.querySelector('[data-lact="act-go"]')); const f2 = host.querySelector('iframe'); w.dispatchEvent(new w.MessageEvent('message', { data: { t: 'ACTIVITY_EXIT', v: 1, reason: 'user' }, origin: 'https://keduclass.com', source: f2.contentWindow }));
      ok(!host.classList.contains('on') && rec.length === 1 && !!d.querySelector('.la-res'), 'EXIT → 기록 없이 닫힘(앞 판 결과 줄 유지)');
      // 낮은 점수 = 맞음 아님
      Lr.lact(d.querySelector('[data-lact="act-go"]')); const f3 = host.querySelector('iframe'); w.dispatchEvent(new w.MessageEvent('message', { data: { t: 'ACTIVITY_RESULT', v: 1, score: 3, total: 10 }, origin: 'https://keduclass.com', source: f3.contentWindow }));
      ok(rec.length === 2 && rec[1][1] === false && rec[1][4].run === 2, '3/10 → 맞음 아님 · 몇 번째 판(run 2)');
      // Esc · 닫기 단추 → CLOSE 보내고 800ms 뒤 닫힘
      Lr.lact(d.querySelector('[data-lact="act-go"]')); const f4 = host.querySelector('iframe'); const sent4 = []; f4.contentWindow.postMessage = (m) => sent4.push(m);
      d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); ok(sent4.length === 1 && sent4[0].t === 'ACTIVITY_CLOSE' && host.classList.contains('on'), 'Esc → CLOSE 보냄(바로 안 닫음 — 활동이 RESULT 낼 틈)');
      await tick(900); ok(!host.classList.contains('on') && rec.length === 2, '800ms 뒤 닫힘 · 기록 없음');
      // 끝 카드 · 처음부터 다시
      Lr.go(Lr.slides.length - 1, 1); ok(/혼자 해 보는 활동 1개/.test(d.querySelector('.lw-done') ? d.querySelector('.lw-done').textContent : ''), '끝 카드에 「🎲 혼자 해 보는 활동 1개 했어요」');
      Lr.lact(d.querySelector('[data-lact="again"]')); ok(LA.count() === 0, '처음부터 다시 → 활동 결과도 비움');
    }
    {
      const A = await mk('?g=3&s=math&u=3&l=u3_l04'); ok(!A.Lr.slides.some(x => x.act), '기본(live 만) — 검수 전 활동은 학생 화면에 0');
      const B = await mk('?g=3&s=math&u=3&l=u3_l04&act=off'); ok(!B.Lr.slides.some(x => x.act), '?act=off → 활동 0');
      const C = await mk('?g=3&s=math&u=3&l=u3_l04&act=all', { noLayer: true }); ok(!C.LA && C.Lr.slides.length === pj.slides.length, '★ 역검증: 활동 층을 빼면 learn 은 종전 그대로(장 수 같음)');
      // live 하나 승격 가정 → 기본 모드에서도 뜬다(승격 = 카탈로그 한 줄의 효력이 학생 화면까지 닿는가)
      const liveCat = CATALOG.map(a => a.id === 'g3m_u3_quotient' ? Object.assign({}, a, { status: 'live' }) : a);
      const Bl = bootLearn('?g=3&s=math&u=3&l=u3_l04'); Bl.w.KT2_CATALOG = liveCat; await Bl.w.KT2_LEARN_ACT.ready(); const Ll = new Bl.w.KT2_LEARN.Learn({ params: { g: '3', s: 'math', u: '3', l: 'u3_l04' }, lesson: Bl.w.LESSONS.u3_l04, unitTitle: '' });
      const li = Ll.slides.findIndex(x => x.act); Ll.go(li, 1); ok(li > 0 && !Bl.d.querySelector('.la-draft'), 'live 승격 → 기본 모드에서도 활동 장 · 미리보기 표시 없음');
      // 카탈로그를 못 읽어도 차시는 선다(늦는 fetch 를 2.5초 뒤 포기)
      const N = bootLearn('?g=3&s=math&u=3&l=u3_l04&act=all', { noCatalog: true }); N.w.fetch = () => new Promise(() => { }); const t0 = Date.now(); await N.w.KT2_LEARN_ACT.ready(); const waited = Date.now() - t0;
      const Ln = new N.w.KT2_LEARN.Learn({ params: { g: '3', s: 'math', u: '3', l: 'u3_l04' }, lesson: N.w.LESSONS.u3_l04, unitTitle: '' });
      ok(waited >= 2400 && waited < 4000 && Ln.slides.length === pj.slides.length, '카탈로그가 안 오면 2.5초 뒤 활동 없이 선다');
      const F = bootLearn('?g=3&s=math&u=3&l=u3_l04&act=all', { noCatalog: true }); F.w.fetch = () => Promise.reject(new Error('x')); await F.w.KT2_LEARN_ACT.ready(); ok(F.w.KT2_LEARN_ACT.failed === true, '카탈로그 실패 → failed · 활동 없이');
      // 박힌 활동 장이 있는 정본을 층 없이 열면 그 장은 빠진다(실행 파일을 모르므로)
      const E = bootLearn('?g=3&s=math&u=3&l=u3_l04', { noLayer: true }); const les = JSON.parse(JSON.stringify(E.w.LESSONS.u3_l04)); les.slides.splice(3, 0, { id: 'emb', stage: '전개', block: 'activity', data: { activityId: 'g3m_u3_quotient' } });
      const Le = new E.w.KT2_LEARN.Learn({ params: { g: '3', s: 'math', u: '3', l: 'u3_l04' }, lesson: les, unitTitle: '' }); ok(!Le.slides.some(x => x.act), '층 없이 박힌 활동 장 → 빠짐(빈 카드 없음)');
    }
    // (f) 교사 무대 수첩 — 브리지 RESULT 는 total 로 온다
    {
      const { d, st, KA } = boot(1, 'math', 1, 'u1_l04_05'); await tick(); KA.launch(CATALOG[0], {}); await tick(); const f = d.querySelector('#kact-host iframe');
      KA.onMessage({ source: f.contentWindow, origin: 'https://keduclass.com', data: { t: 'ACTIVITY_RESULT', v: 1, score: 7, total: 9, byType: {} } });
      ok(/7<\/b> \/ 9/.test(d.querySelector('#ov-note .kn-score').innerHTML), '교사 수첩 — RESULT total 로 「7 / 9」');
    }
  }

  // ── ⑦ 역검증 ──
  {
    // (a) 활동 층을 빼도 무대는 선다 · 목차에 ＋활동 없음 · activity 데이터는 교실 활동으로
    const N = boot(1, 'math', 1, 'u1_l01', { noLayer: true }); ok(!N.KA && N.st.slides.length > 5 && N.d.querySelector('#hud button[data-h="act"]'), '층 없이 부팅 OK (HUD 버튼은 있되)'); N.st.hudAct('act'); ok(!N.d.querySelector('#ov-act'), '층 없이 H → 오버레이 없음(토스트만)'); N.st.openToc(); ok(!N.d.querySelector('#ov-toc [data-a="activity"]'), '층 없이 목차 ＋활동 없음');
    // (b) 정답 미노출 검사가 실제로 잡는가: OX 에서 공개 전 정답 글자를 심으면 검사가 빨개져야 한다
    const { d, st, Q } = boot(1, 'math', 1, 'u1_l01'); await tick(); const act = Q.list.find(a => a.id === 'ox');
    const leaky = Object.assign({}, act, { run(root, cfg, api) { act.run(root, cfg, api); root.innerHTML += '<div class="leak">O</div>'; } });
    Q.start(leaky, { items: 'x | O', seed: 1 }, st); const leakCaught = !!d.querySelector('#kq-paper .leak'); Q.close(false); ok(leakCaught, '역검증: 새는 정답을 심으면 검출된다');
    // (c) 낯선 origin 무시
    const K = boot(1, 'math', 1, 'u1_l04_05'); await tick(); K.KA.launch(CATALOG[0], {}); await tick(); const f = K.d.querySelector('#kact-host iframe'); K.w.dispatchEvent(new K.w.MessageEvent('message', { data: { t: 'ACTIVITY_RESULT', v: 1, byType: {} }, origin: 'https://evil.example', source: f.contentWindow })); ok(!!K.KA.session, '역검증: 다른 origin 의 RESULT 무시'); K.KA.endSession(false);
    // (d) 기존 무대 하니스가 여전히 그린인지는 test_stage2.js 가 잰다(여기서 안 겹친다)
  }

  console.log('활동 층 v4 하니스 — PASS ' + pass + ' / FAIL ' + fail);
  if (fails.length) { console.log('실패:'); fails.forEach(f => console.log('  ✗ ' + f)); process.exit(1); }
})().catch(e => { console.error('하니스 예외', e); process.exit(1); });

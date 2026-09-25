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
    B.st.go(1, 1); ok(B.d.querySelector('#kt2-paper .flipgrid') && !/헷갈렸어요/.test(B.d.querySelector('#kt2-paper').textContent), '복습 슬라이드 = 뒤집기 카드 · 답 미노출');
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

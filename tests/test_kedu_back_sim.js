#!/usr/bin/env node
/**
 * 돌아가기(kedu_back.js) 동선 시뮬레이션 — 동선·입구 점검 트랙 (handoff STATUS-kedu-nav-audit.md)
 *  같은 탭 sessionStorage 를 이어가며 실제 이동 순서를 재현하고, 마지막 화면의 「나가기」가 어디로 가는지 본다.
 *  기대 = "한 층 위(구조상 허브)". 2026-08-26 첫 실측: 8장면 중 4장면 ❌ (②③⑤⑦) — v2 가 고쳐야 할 목록.
 * 실행: NODE_PATH=/home/claude/.jsdom/node_modules node tests/test_kedu_back_sim.js   (k-edu 루트)
 */
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const R = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(R, 'kedu_back.js'), 'utf8');
const O = 'https://keduclass.com';
let pass = 0, fail = 0;
let store = {};
function visit(url, referrer, hasBack = true) {
  const opts = { url, runScripts: 'outside-only', pretendToBeVisual: true }; if (referrer) opts.referrer = referrer;
  const w = new JSDOM('<!doctype html><html><head></head><body><h1>x</h1></body></html>', opts).window;
  Object.keys(store).forEach(k => w.sessionStorage.setItem(k, store[k]));
  if (hasBack) w.eval(src);
  store = {}; for (let i = 0; i < w.sessionStorage.length; i++) { const k = w.sessionStorage.key(i); store[k] = w.sessionStorage.getItem(k); }
  return w.KEDU_BACK ? w.KEDU_BACK.href : null;
}
function scenario(name, steps, expect) {
  store = {}; let prev = '', got = null;
  for (const [u, hb] of steps) { got = visit(O + u, prev, hb); prev = O + u; }
  if (got === expect) pass++; else { fail++; console.log('  ✗', name, '\n      마지막', steps[steps.length - 1][0], '→', got, ' 기대', expect); }
}
scenario('① 홈→허브→차시', [['/', 1], ['/grade3/semester1/science/index.html', 1], ['/grade3/semester1/science/2단원/g3_sci_u2_l03.html', 1]], '/grade3/semester1/science/index.html');
scenario('② 아침활동을 거쳐 케이배틀로 — 최근 허브(아침활동)로 나간다', [['/', 1], ['/grade1/semester1/math/index.html', 1], ['/grade1/semester1/math/g1_math_01.html', 1], ['/morning/index.html', 1], ['/kbattle/index.html', 1]], '/morning/index.html');
scenario('③ 교사 대시보드에서 케이파크로 들어갔다 나가면 학생 입구로 떨어진다', [['/teacher/index.html', 0], ['/kpark/index.html', 1]], '/teacher/index.html');
scenario('④ 교사 도구 뒤 학생 허브(홈 안 거침)', [['/', 1], ['/?role=teacher', 1], ['/kedu/teacher/g3_math.html', 1], ['/classwork/index.html', 1], ['/grade3/semester1/math/index.html', 1]], '/classwork/index.html');
scenario('⑤ 새 탭으로 차시 직접 열면 허브가 아니라 홈', [['/grade4/semester1/math/g4_math_05.html', 1]], '/grade4/semester1/math/index.html');
scenario('⑥ 케이랩 도구', [['/', 1], ['/kedu/hub/klab.html', 1], ['/labs/scilab_states.html', 1]], '/kedu/hub/klab.html');
scenario('⑦ 차시→옆 차시→옆 차시 뒤 나가기가 허브가 아니라 이전 차시', [['/', 1], ['/grade3/semester1/math/index.html', 1], ['/grade3/semester1/math/g3_m_01.html', 1], ['/grade3/semester1/math/g3_m_02.html', 1], ['/grade3/semester1/math/g3_m_03.html', 1]], '/grade3/semester1/math/index.html');
scenario('⑧ 허브→차시→허브→다른 차시', [['/', 1], ['/grade3/semester1/math/index.html', 1], ['/grade3/semester1/math/g3_m_01.html', 1], ['/grade3/semester1/math/index.html', 1], ['/grade3/semester1/math/g3_m_02.html', 1]], '/grade3/semester1/math/index.html');
/* v2 추가 장면 (2026-08-27) */
scenario('⑨ 교사→학급과제→케이박스 활동', [['/?role=teacher', 1], ['/classwork/index.html', 1], ['/kedu/activities/g1m_u3_relay.html', 1]], '/kedu/activities/index.html');
scenario('⑩ 학부모 열람 화면에서 나가기 — 자기 자신으로 돌지 않는다', [['/', 1], ['/parent/index.html', 1]], '/');
scenario('⑪ 게이트 잠금 카드 — 직접 URL 로 연 차시', [['/grade5/semester1/science/1단원_지층과화석/g5_sci_u1_l01_열려라과학.html', 1]], '/grade5/semester1/science/index.html');
scenario('⑫ 한 기기에서 교사 뒤 학생이 홈 거쳐 들어옴 — 교사 맥락이 남지 않는다', [['/?role=teacher', 1], ['/teacher/index.html', 1], ['/', 1], ['/kbattle/index.html', 1]], '/');
scenario('⑬ 케이랩 도구를 새 탭으로 직접 열기', [['/labs/scilab_states.html', 1]], '/kedu/hub/klab.html');
scenario('⑭ 영어 차시 → 영어 허브', [['/', 1], ['/english/index.html', 1], ['/english/g3/reading/g3_english_adv_17_주제찾기.html', 1]], '/english/index.html');
scenario('⑮ 교사 도구에서 바로 활동으로(대시보드 발자국 없음)', [['/teacher/index.html', 0], ['/kple/host.html', 1]], '/teacher/index.html');
scenario('⑯ 보드게임 폴더 — 안내판이 아니라 케이파크 정문으로', [['/kpark/board/bolt/index.html', 1]], '/kpark/index.html');
/* 도구 구역 장면 — 준호 보고: "자기주도보다 다른 것들이 더 안 된다, 특히 케이파크" (2026-08-27) */
scenario('⑰ 케이파크 → 보드게임 → 나가기', [['/', 1], ['/kpark/index.html', 1], ['/kpark/board/bolt/index.html', 1]], '/kpark/index.html');
scenario('⑱ 케이파크 어트락션을 새 탭으로 직접', [['/kpark/marblerun/index.html', 1]], '/kpark/index.html');
scenario('⑲ 보드게임에서 옆 보드게임으로 옮겨 놀다 나가기', [['/', 1], ['/kpark/index.html', 1], ['/kpark/board/four/index.html', 1], ['/kpark/board/travel/index.html', 1]], '/kpark/index.html');
scenario('⑳ 케이뮤지엄 전시 → 뮤지엄 입구', [['/', 1], ['/museum/index.html', 1], ['/museum/math/ex01_gauss.html', 1]], '/museum/index.html');
scenario('㉑ 케이메이커 옛 주소(kmake) 아래 화면 — 안내판 아닌 새 주소로', [['/kmake/viewer.html', 1]], '/maker/index.html');
scenario('㉒ 케이영재 차시 — 다리(gifted/math) 말고 케이영재 허브로', [['/gifted/math/l2/kg_math_l2_com01_색칠경우세기.html', 1]], '/gifted/index.html');
scenario('㉓ 아침활동 하위 화면', [['/morning/index.html', 1], ['/morning/math.html', 1]], '/morning/index.html');
scenario('㉔ 케이배틀에서 나가기 — 학생', [['/', 1], ['/kbattle/index.html', 1]], '/');
/* 도구 구역 2차 (2026-08-27) — 케이랩·케이플·케이배틀·메이커·아침·라이브 */
scenario('㉕ 케이랩 도구에서 옆 도구로 옮긴 뒤 나가기', [['/', 1], ['/kedu/hub/klab.html', 1], ['/labs/scilab_states.html', 1], ['/labs/scilab_sound.html', 1]], '/kedu/hub/klab.html');
scenario('㉖ 케이박스 활동을 직접 주소로 연 경우', [['/kedu/activities/g1m_u1_count9.html', 1]], '/kedu/activities/index.html');
scenario('㉗ 케이플 방 참가 화면', [['/', 1], ['/kple/play.html', 1]], '/');
scenario('㉘ 교사가 케이플 사회자 화면을 열었다 나가기', [['/?role=teacher', 1], ['/kple/host.html', 1]], '/teacher/index.html');
scenario('㉙ 메이커 하위 화면', [['/', 1], ['/maker/index.html', 1], ['/maker/card/index.html', 1]], '/maker/index.html');
scenario('㉚ 케이메이커 놀이터 리포트', [['/maker-playground/report/stage4-builder.html', 1]], '/maker-playground/report/index.html');
scenario('㉛ 그림 그리기 하위 화면', [['/', 1], ['/draw/index.html', 1], ['/draw/coloring/index.html', 1]], '/draw/index.html');
scenario('㉜ 뮤지엄에서 케이랩으로 건너뛴 뒤 나가기 — 뮤지엄이 아니라 케이랩 허브', [['/', 1], ['/museum/index.html', 1], ['/museum/math/ex01_gauss.html', 1], ['/labs/scilab_states.html', 1]], '/kedu/hub/klab.html');
console.log(`돌아가기 동선 시뮬 — ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);

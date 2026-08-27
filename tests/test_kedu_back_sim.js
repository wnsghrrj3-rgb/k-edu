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
scenario('② 중간에 돌아가기 없는 페이지(아침활동)가 끼면 한 층 건너뛴다', [['/', 1], ['/grade1/semester1/math/index.html', 1], ['/grade1/semester1/math/g1_math_01.html', 1], ['/morning/index.html', 0], ['/kbattle/index.html', 1]], '/morning/index.html');
scenario('③ 교사 대시보드에서 케이파크로 들어갔다 나가면 학생 입구로 떨어진다', [['/teacher/index.html', 0], ['/kpark/index.html', 1]], '/teacher/index.html');
scenario('④ 교사 도구 뒤 학생 허브(홈 안 거침)', [['/', 1], ['/?role=teacher', 1], ['/kedu/teacher/g3_math.html', 1], ['/classwork/index.html', 1], ['/grade3/semester1/math/index.html', 1]], '/classwork/index.html');
scenario('⑤ 새 탭으로 차시 직접 열면 허브가 아니라 홈', [['/grade4/semester1/math/g4_math_05.html', 1]], '/grade4/semester1/math/index.html');
scenario('⑥ 케이랩 도구', [['/', 1], ['/kedu/hub/klab.html', 1], ['/labs/scilab_states.html', 1]], '/kedu/hub/klab.html');
scenario('⑦ 차시→옆 차시→옆 차시 뒤 나가기가 허브가 아니라 이전 차시', [['/', 1], ['/grade3/semester1/math/index.html', 1], ['/grade3/semester1/math/g3_m_01.html', 1], ['/grade3/semester1/math/g3_m_02.html', 1], ['/grade3/semester1/math/g3_m_03.html', 1]], '/grade3/semester1/math/index.html');
scenario('⑧ 허브→차시→허브→다른 차시', [['/', 1], ['/grade3/semester1/math/index.html', 1], ['/grade3/semester1/math/g3_m_01.html', 1], ['/grade3/semester1/math/index.html', 1], ['/grade3/semester1/math/g3_m_02.html', 1]], '/grade3/semester1/math/index.html');
console.log(`돌아가기 동선 시뮬 — ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);

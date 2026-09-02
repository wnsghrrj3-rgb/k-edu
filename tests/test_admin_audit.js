#!/usr/bin/env node
/**
 * 관리 화면 「케이점검」 패널 — admin/index.html 의 loadAudit/renderAudit/auDecide 를 jsdom 에서 굴린다.
 *  ① SQL #37 미적용(select 오류) → 안내 문구 · ② 실행 0건 → 첫 실행 안내 · ③ 항목 렌더·칩·승인 흐름 · ④ 규칙 표 자체(audit/rules.js) 가 로드되고 id 가 고유
 * 실행: node tests/test_admin_audit.js   (k-edu 루트 · jsdom 필요)
 */
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const R = path.join(__dirname, '..');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };

function boot(dbImpl) {
  const html = fs.readFileSync(path.join(R, 'admin/index.html'), 'utf8')
    .replace(/<script src="[^"]*"><\/script>/g, '')                 // 외부 스크립트 전부 끊는다
    .replace(/<script>\(function\(\)\{ try \{[\s\S]*?<\/script>/, ''); // 로그인 홀드 조각
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://keduclass.com/admin/' });
  const w = dom.window;
  w.getKeduDb = () => dbImpl; w.supabase = {}; w.confirm = () => true;
  const main = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(c => c.includes('function loadAudit'));
  w.eval(main);
  return w;
}
const table = rows => ({ select: () => ({ order: () => ({ limit: async () => rows }), in: () => ({ order: () => ({ limit: async () => ({ data: rows }) }) }) }) });

(async () => {
  // ① 표 없음
  let w = boot({ from: () => ({ select: () => ({ order: () => ({ limit: async () => ({ data: null, error: { message: 'relation does not exist' } }) }) }) }) });
  await w.loadAudit();
  ok(/setup_admin_audit/.test(w.document.getElementById('au-head').textContent), '① 미적용 안내');

  // ② 실행 0
  w = boot({ from: () => ({ select: () => ({ order: () => ({ limit: async () => ({ data: [] }) }) }) }) });
  await w.loadAudit();
  ok(/Run workflow/.test(w.document.getElementById('au-head').textContent), '② 첫 실행 안내');

  // ③ 항목
  const run = { id: 3, ran_at: new Date().toISOString(), commit: 'abc1234', files_scanned: 3800 };
  const items = [
    { fingerprint: 'f1', rule: 'r02', area: '자기주도 1학년', severity: 'high', file: 'grade1/x.html', msg: '차시인데 `/kedu_gate.js` 를 싣지 않음', fixable: true, status: 'open', first_seen: run.ran_at, last_seen: run.ran_at },
    { fingerprint: 'f2', rule: 'r12', area: '자기주도 영어', severity: 'low', file: 'english/g1/', msg: '고아 3개', fixable: false, status: 'open', first_seen: run.ran_at, last_seen: run.ran_at },
    { fingerprint: 'f3', rule: 'r08', area: 'DB', severity: 'mid', file: 'sql/a.sql', msg: '미등재', fixable: true, status: 'applied', applied_commit: 'dead001', first_seen: run.ran_at, last_seen: run.ran_at },
  ];
  const calls = [];
  const db = { from: t => t === 'admin_audit_runs' ? { select: () => ({ order: () => ({ limit: async () => ({ data: [run] }) }) }) } : table(items),
    rpc: async (fn, args) => { calls.push([fn, args]); return { data: 1, error: null }; } };
  w = boot(db); w.showToast = () => {};
  await w.loadAudit();
  const d = w.document;
  ok(/확인 대기 🔴 1 🟠 0 🟡 1/.test(d.getElementById('au-head').textContent.replace(/\s+/g, ' ')), '③ 머리글 집계');
  ok(d.querySelectorAll('#au-list li').length === 2, '③ open 2건 렌더');
  ok(d.querySelector('#au-list li .au-sev.high') && d.querySelector('#au-list li').textContent.includes('자기주도 1학년'), '③ high 가 먼저');
  ok(d.querySelector('.au-tag.fix'), '③ 자동 수정 배지');
  ok(d.querySelector('#au-list code') && d.querySelector('#au-list code').textContent === '/kedu_gate.js', '③ 백틱 → code');
  ok([...d.querySelectorAll('.au-chip')].some(c => c.textContent.startsWith('DB')) === false, '③ open 칩에는 DB(applied) 없음');
  await w.auDecide('f1', 'approved');
  ok(calls[0] && calls[0][0] === 'admin_audit_decide' && calls[0][1].p_status === 'approved', '③ 승인 RPC');
  ok(d.querySelectorAll('#au-list li').length === 1, '③ 승인 뒤 open 1건');
  w.auSet('status', 'approved');
  ok(d.querySelectorAll('#au-list li').length === 1 && /되돌리기/.test(d.querySelector('#au-list li').textContent), '③ 승인됨 탭·되돌리기');
  w.auSet('status', 'applied');
  ok(/dead001/.test(d.getElementById('au-list').textContent), '③ 고침 탭 커밋 표시');
  w.auSet('status', 'open');
  await w.auDecideAll('ignored');
  ok(calls.some(c => c[0] === 'admin_audit_decide_many' && c[1].p_status === 'ignored' && c[1].p_fingerprints.length === 1), '③ 일괄 무시');

  // ④ 규칙 표
  const rules = require(path.join(R, 'audit/rules.js'));
  ok(rules.length >= 15 && new Set(rules.map(r => r.id)).size === rules.length, '④ 규칙 id 고유');
  ok(rules.every(r => typeof r.run === 'function' && r.name), '④ 규칙 형식');
  const cfg = require(path.join(R, 'audit/config.json'));
  ok(Array.isArray(cfg.areas) && cfg.critical_areas.every(a => cfg.areas.some(x => x[1] === a)), '④ 설정 영역 정합');

  console.log(`관리 케이점검 패널 — ${pass} PASS / ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

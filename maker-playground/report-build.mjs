/* ============================================================
   report-build.mjs — GPT 검증용 정적 리포트 빌더
   ------------------------------------------------------------
   1) test-round*.mjs 전 스위트를 실제 실행해 결과 수집
   2) jsdom 으로 앱을 부팅해 전 엔진의 complete()·deliverables 판정 수집
   3) report/index.html(정적, JS 불필요) + report/report.json 생성
   사용: node report-build.mjs   (라운드 종료 시마다 실행 후 커밋)
   ============================================================ */
import { execSync } from 'child_process';
import { JSDOM } from 'jsdom';
import fs from 'fs';

const NOW = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

/* ---------- 1) 테스트 스위트 실행 ---------- */
const suites = fs.readdirSync('.').filter((f) => /^test-round.*\.mjs$/.test(f)).sort(
  (a, b) => (parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10)) || a.localeCompare(b));
const suiteResults = suites.map((f) => {
  let out = '', exit = 0;
  try { out = execSync(`node ${f}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { exit = e.status || 1; out = String(e.stdout || '') + String(e.stderr || ''); }
  const lines = out.trim().split('\n').filter(Boolean);
  const summary = [...lines].reverse().find((l) => /통과|pass/i.test(l)) || lines[lines.length - 1] || '';
  return { suite: f, exit, pass: exit === 0, summary: summary.trim().replace(/[═=]+/g, '').trim() };
});

/* ---------- 2) 엔진 판정 수집 (jsdom 부팅) ---------- */
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/home' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
for (const f of [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1])) {
  if (/^https?:/.test(f) || !fs.existsSync(f.replace(/^\//, ''))) continue; /* 외부 CDN·상위 공용 스크립트는 리포트 범위 밖 */
  window.eval(fs.readFileSync(f.replace(/^\//, ''), 'utf8'));
}
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const ENGINES = Object.keys(window).filter((k) => k.startsWith('MK_') && window[k] && typeof window[k] === 'object').sort();
const engineResults = ENGINES.map((name) => {
  const e = window[name];
  const r = { engine: name, complete: null, deliverables: null, note: '' };
  try { if (typeof e.complete === 'function') r.complete = !!e.complete(); } catch (x) { r.note = 'complete 오류: ' + x.message; }
  try {
    if (typeof e.deliverables === 'function') {
      const d = e.deliverables();
      if (Array.isArray(d)) r.deliverables = d.filter((x) => x.ready).length + '/' + d.length;
    }
  } catch (x) { /* 산출물 없는 엔진 */ }
  return r;
});

/* ---------- 3) 산출 ---------- */
const allPass = suiteResults.every((s) => s.pass);
const report = {
  project: 'K-MAKER Design Playground', generatedAt: NOW,
  verdict: allPass ? 'ALL PASS' : 'FAIL EXISTS',
  suites: suiteResults, engines: engineResults,
  note: '이 리포트는 report-build.mjs 가 테스트를 실제 실행해 생성한 정적 산출물이다. 시뮬 값 없음.',
};
fs.mkdirSync('report', { recursive: true });
fs.writeFileSync('report/report.json', JSON.stringify(report, null, 2));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const badge = (ok, t) => `<b style="color:${ok ? '#26766B' : '#C0392B'}">${esc(t)}</b>`;
fs.writeFileSync('report/index.html', `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>K-MAKER Playground — 검증 리포트</title>
<style>body{font-family:Pretendard,-apple-system,sans-serif;max-width:860px;margin:24px auto;padding:0 16px;color:#1F2733;line-height:1.6}
table{border-collapse:collapse;width:100%;margin:8px 0 24px}td,th{border:1px solid #ddd;padding:6px 10px;text-align:left;font-size:14px}
th{background:#f4f4f2}h1{font-size:22px}h2{font-size:17px;margin-top:28px}small{color:#777}</style></head><body>
<h1>K-MAKER Design Playground — 검증 리포트</h1>
<p>생성: ${esc(NOW)} · 종합 판정: ${badge(allPass, report.verdict)}<br>
<small>report-build.mjs 가 전 테스트 스위트를 실제 실행해 생성한 정적 페이지. JS 불필요 — 기계 열람용.
기계 판독: <a href="report.json">report.json</a></small></p>
<h2>테스트 스위트 (${suiteResults.length})</h2>
<table><tr><th>스위트</th><th>판정</th><th>요약</th></tr>
${suiteResults.map((s) => `<tr><td>${esc(s.suite)}</td><td>${badge(s.pass, s.pass ? 'PASS (exit 0)' : 'FAIL (exit ' + s.exit + ')')}</td><td>${esc(s.summary)}</td></tr>`).join('\n')}
</table>
<h2>엔진 판정 (${engineResults.length})</h2>
<table><tr><th>엔진</th><th>complete()</th><th>Deliverables</th></tr>
${engineResults.map((e) => `<tr><td>${esc(e.engine)}</td><td>${e.complete === null ? '<small>없음</small>' : badge(e.complete, e.complete ? '충족' : '미달')}${e.note ? ' <small>' + esc(e.note) + '</small>' : ''}</td><td>${e.deliverables ? esc(e.deliverables) : '<small>—</small>'}</td></tr>`).join('\n')}
</table>
<p><small>정직 원칙: 미실측 지표는 엔진 내부에서 null 로 유지되며 이 리포트에 수치로 나타나지 않는다.</small></p>
</body></html>`);

console.log(`리포트 생성 완료 — ${report.verdict} · 스위트 ${suiteResults.length} · 엔진 ${engineResults.length}`);
process.exit(0);

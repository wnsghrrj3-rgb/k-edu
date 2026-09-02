#!/usr/bin/env node
/* ============================================================
   케이점검 ↔ Supabase (sql/setup_admin_audit.sql #37)
   환경변수: SUPABASE_URL (없으면 kedu_config.js 의 값) · SUPABASE_SERVICE_KEY (필수, GitHub Secrets)
   명령:
     node audit/upload.js            report.json → admin_audit_runs 1줄 + admin_audit_findings upsert
                                     · 이번에 안 보인 open/approved 항목은 resolved 로 닫는다
                                     · ignored 는 다시 보여도 ignored 그대로(준호가 무시한 것)
                                     · applied 가 다시 보이면 open 으로 되살림(수정이 안 먹은 것)
     node audit/upload.js --applied <commit>   fixed.json 결과를 findings 에 반영(applied / 실패 메모)
   ============================================================ */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const URL_ = process.env.SUPABASE_URL || (/KEDU_SUPABASE_URL\s*=\s*'([^']+)'/.exec(fs.readFileSync(path.join(ROOT, 'kedu_config.js'), 'utf8')) || [])[1];
const KEY = process.env.SUPABASE_SERVICE_KEY;
const H = () => ({ 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' });

async function rest(pathq, opt = {}) {
  const r = await fetch(URL_ + '/rest/v1/' + pathq, { ...opt, headers: { ...H(), ...(opt.headers || {}) } });
  const t = await r.text();
  if (!r.ok) throw new Error(`${opt.method || 'GET'} ${pathq} → ${r.status} ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : null;
}
const chunk = (a, n) => { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };

async function upload() {
  if (!KEY) throw new Error('SUPABASE_SERVICE_KEY 가 없음');
  const rep = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/out/report.json'), 'utf8'));
  const [run] = await rest('admin_audit_runs', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ran_at: rep.ran_at, commit: rep.commit, files_scanned: rep.files_scanned, duration_ms: rep.duration_ms, total: rep.totals.total, high: rep.totals.high, mid: rep.totals.mid, low: rep.totals.low, by_area: rep.by_area, rules: rep.rules.map(r => ({ id: r.id, name: r.name, ok: r.ok, ms: r.ms })) }) });
  const now = new Date().toISOString();
  const rows = rep.findings.map(f => ({ fingerprint: f.fingerprint, run_id: run.id, last_seen: now, rule: f.rule, area: f.area, severity: f.severity, file: f.file || null, line: f.line || null, msg: f.msg, fix: f.fix || null, fixable: !!f.fixable }));
  /* upsert — first_seen 은 DB 기본값(now) 이라 처음 볼 때만 채워지고, status 는 보내지 않아 기존 값이 산다 */
  for (const c of chunk(rows, 200)) await rest('admin_audit_findings?on_conflict=fingerprint', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(c) });
  /* 이번에 안 보인 열린 항목 → resolved */
  const fps = new Set(rows.map(r => r.fingerprint));
  const open = await rest('admin_audit_findings?select=fingerprint,status&status=in.(open,approved,applied)');
  const gone = open.filter(o => !fps.has(o.fingerprint)).map(o => o.fingerprint);
  for (const c of chunk(gone, 100)) await rest(`admin_audit_findings?fingerprint=in.(${c.map(x => '"' + x + '"').join(',')})`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'resolved', decided_at: now }) });
  /* applied 였는데 다시 보임 → open (수정이 안 먹었다) */
  const back = open.filter(o => o.status === 'applied' && fps.has(o.fingerprint)).map(o => o.fingerprint);
  for (const c of chunk(back, 100)) await rest(`admin_audit_findings?fingerprint=in.(${c.map(x => '"' + x + '"').join(',')})`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'open', note: '자동 수정 뒤에도 다시 검출됨' }) });
  console.log(`업로드 — run #${run.id} · 항목 ${rows.length} · 닫힘 ${gone.length} · 되살림 ${back.length}`);
}

async function fetchApproved() {
  if (!KEY) throw new Error('SUPABASE_SERVICE_KEY 가 없음');
  return rest('admin_audit_findings?select=fingerprint,file,fix,rule&status=eq.approved&fixable=is.true');
}

async function markApplied(commit) {
  const res = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/out/fixed.json'), 'utf8'));
  const now = new Date().toISOString();
  for (const [fp, r] of Object.entries(res)) {
    await rest(`admin_audit_findings?fingerprint=eq.${fp}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(r.ok ? { status: 'applied', applied_commit: commit, decided_at: now, note: r.note || null } : { note: '자동 수정 실패: ' + (r.why || '') }) });
  }
  console.log(`상태 갱신 — ${Object.keys(res).length}건 (commit ${commit})`);
}

if (require.main === module) {
  const a = process.argv.slice(2);
  (a[0] === '--applied' ? markApplied(a[1] || '') : upload()).catch(e => { console.error(e.message || e); process.exit(1); });
}
module.exports = { upload, fetchApproved, markApplied };

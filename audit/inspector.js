#!/usr/bin/env node
/* ============================================================
   케이점검 — K-edu 전 영역 자동 점검 러너 (2026-09-02)
   역할: audit/rules.js 의 규칙을 전부 돌려 audit/out/report.json + report.md 를 만든다.
         업로드(Supabase)·수정(fix)은 각각 upload.js·fix.js 가 맡는다.
   실행: node audit/inspector.js            (k-edu 루트)
         node audit/inspector.js --rules r01,r03   (일부만)
         node audit/inspector.js --quiet
   결과: 종료코드 0 = high 없음 · 2 = high 있음 (워크플로가 요약에 쓴다, 실패로 보지 않음)
   ============================================================ */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const CFG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const OUT = path.join(__dirname, 'out');

/* ---------- 영역 판정 (경로 접두 → 영역 이름) ---------- */
function areaOf(rel) {
  for (const [prefix, name] of CFG.areas) {
    if (rel === prefix || rel.startsWith(prefix)) return name;
  }
  return '기타';
}
const isCritical = rel => CFG.critical_areas.includes(areaOf(rel));

/* ---------- 파일 걷기 ---------- */
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.relative(ROOT, p).split(path.sep).join('/');
    if (CFG.skip_dirs.some(s => rel === s || rel.startsWith(s + '/'))) continue;
    if (e.isDirectory()) walk(p, acc);
    else acc.push(rel);
  }
  return acc;
}
let _files = null;
const files = () => (_files ||= walk(ROOT).sort());
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = rel => { try { return fs.statSync(path.join(ROOT, rel)); } catch { return null; } };

/* 링크 → 실파일 (trailingSlash: /a/ → /a/index.html, /a → /a.html 도 허용) */
function resolveLink(fromRel, href) {
  let h = href.split('#')[0].split('?')[0].trim();
  if (!h) return { skip: true };
  if (/^(https?:|mailto:|tel:|data:|javascript:|blob:|\/\/|%23)/i.test(h)) return { skip: true };
  if (/[\$\{\}\+`]/.test(h) || h.includes('${')) return { skip: true }; // 템플릿·연결식
  try { h = decodeURIComponent(h); } catch {}
  let target = h.startsWith('/') ? h.slice(1) : path.posix.join(path.posix.dirname(fromRel), h);
  target = path.posix.normalize(target).replace(/^\.\//, '');
  if (target.startsWith('..')) return { skip: true };
  const cands = target === '' || target.endsWith('/') ? [path.posix.join(target, 'index.html')] : [target, target + '/index.html', target + '.html'];
  for (const c of cands) { const st = exists(c); if (st) return { ok: true, target: c, dir: st.isDirectory() }; }
  return { ok: false, target: cands[0] };
}

/* ---------- 결과 수집 ---------- */
const findings = [];
/**
 * add({rule, area?, severity, file, line?, msg, fix?})
 *  severity: high | mid | low
 *  fix: { type, ...params }  — fix.js 가 아는 type 만 자동 수정 대상
 */
function add(f) {
  f.area = f.area || (f.file ? areaOf(f.file) : '공용');
  if (f.file && isCritical(f.file) && f.severity === 'mid' && CFG.critical_bump_rules.includes(f.rule)) f.severity = 'high'; // 입구·계정·관리의 깨진 링크·구문은 한 단계 올림
  const key = [f.rule, f.file || '', f.msg.replace(/\d+줄/g, '').slice(0, 160)].join('|');
  f.fingerprint = crypto.createHash('sha1').update(key).digest('hex').slice(0, 16);
  f.fixable = !!(f.fix && f.fix.type);
  findings.push(f);
}

/* ---------- 실행 ---------- */
function main() {
  const argv = process.argv.slice(2);
  const only = (argv.find(a => a.startsWith('--rules=')) || '').replace('--rules=', '').split(',').filter(Boolean);
  const quiet = argv.includes('--quiet');
  const rules = require('./rules.js');
  const ctx = { ROOT, CFG, files, read, exists, walk, resolveLink, areaOf, add, findings, log: quiet ? () => {} : (...a) => console.log(...a) };
  const ran = [];
  const t0 = Date.now();
  for (const r of rules) {
    if (only.length && !only.includes(r.id)) continue;
    const t = Date.now();
    try { r.run(ctx); ran.push({ id: r.id, name: r.name, ms: Date.now() - t, ok: true }); }
    catch (e) { ran.push({ id: r.id, name: r.name, ms: Date.now() - t, ok: false, err: String(e && e.stack || e) });
      add({ rule: r.id, severity: 'mid', area: '케이점검', msg: `규칙 ${r.id} 자체가 실패함: ${String(e).slice(0, 200)}` }); }
    ctx.log(`  ${r.id} ${r.name} … ${findings.filter(f => f.rule === r.id).length}건`);
  }

  /* 지문 중복 제거(같은 파일·같은 문면) */
  const seen = new Set(); const uniq = [];
  for (const f of findings) { if (seen.has(f.fingerprint)) continue; seen.add(f.fingerprint); uniq.push(f); }

  let commit = '';
  try { commit = require('child_process').execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); } catch {}
  const count = s => uniq.filter(f => f.severity === s).length;
  const byArea = {};
  for (const f of uniq) { const a = byArea[f.area] ||= { high: 0, mid: 0, low: 0 }; a[f.severity]++; }
  const report = {
    tool: 'kedu-audit', version: CFG.version, ran_at: new Date().toISOString(), commit,
    files_scanned: files().length, duration_ms: Date.now() - t0,
    totals: { total: uniq.length, high: count('high'), mid: count('mid'), low: count('low') },
    by_area: byArea, rules: ran, findings: uniq,
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  fs.writeFileSync(path.join(OUT, 'report.md'), toMarkdown(report));
  ctx.log(`\n케이점검 완료 — ${report.files_scanned}파일 · high ${report.totals.high} · mid ${report.totals.mid} · low ${report.totals.low} (${report.duration_ms}ms)`);
  process.exit(report.totals.high ? 2 : 0);
}

function toMarkdown(r) {
  const ico = { high: '🔴', mid: '🟠', low: '🟡' };
  const L = [`# 케이점검 보고 — ${r.ran_at.slice(0, 16).replace('T', ' ')} · \`${r.commit}\``, '',
    `파일 ${r.files_scanned}개 · 🔴 ${r.totals.high} · 🟠 ${r.totals.mid} · 🟡 ${r.totals.low}`, '',
    '| 영역 | 🔴 | 🟠 | 🟡 |', '|---|---|---|---|'];
  for (const [a, c] of Object.entries(r.by_area).sort((x, y) => (y[1].high - x[1].high) || (y[1].mid - x[1].mid))) L.push(`| ${a} | ${c.high} | ${c.mid} | ${c.low} |`);
  L.push('', '## 항목', '');
  const order = { high: 0, mid: 1, low: 2 };
  for (const f of [...r.findings].sort((a, b) => order[a.severity] - order[b.severity] || a.area.localeCompare(b.area))) {
    L.push(`- ${ico[f.severity]} **[${f.area}]** \`${f.rule}\` ${f.file ? '`' + f.file + (f.line ? ':' + f.line : '') + '` ' : ''}${f.msg}${f.fixable ? ' _(자동 수정 가능)_' : ''}`);
  }
  const failed = r.rules.filter(x => !x.ok);
  if (failed.length) { L.push('', '## 규칙 실패', ''); for (const x of failed) L.push(`- ${x.id}: ${x.err.split('\n')[0]}`); }
  return L.join('\n') + '\n';
}

if (require.main === module) main();
module.exports = { areaOf, walk, resolveLink };

#!/usr/bin/env node
/* ============================================================
   케이점검 수정기 — 준호가 관리 화면에서 「승인」한 항목만 고친다.
   입력: (a) Supabase admin_audit_findings 에서 status='approved' AND fixable 인 줄
         (b) --local audit/out/report.json 의 fixable 전부 (승인 없이, 로컬 확인용)
   출력: 파일을 고치고 audit/out/fixed.json 에 { fingerprint → 결과 } 를 남긴다.
         커밋·푸시·상태 갱신은 워크플로(audit-fix.yml)가 한다.
   원칙: 여기 있는 type 만 자동 수정 대상. 새 type 을 넣을 땐 「고치는 줄이 하나이고
         되돌리기 쉬운가」를 먼저 물을 것. 그렇지 않으면 사람 몫으로 남긴다.
   ============================================================ */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const wr = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);

const FIXERS = {
  /* 깨진 링크를 유일한 후보로 바꿔 잇는다 (파일 안의 그 문자열 전부) */
  relink(f) {
    const s = rd(f.file); const { from, to } = f.fix;
    if (!s.includes(from)) return { ok: false, why: '원 문자열이 이미 없음 (손으로 고쳤거나 파일이 바뀜)' };
    if (!fs.existsSync(path.join(ROOT, to.replace(/^\//, '')))) return { ok: false, why: '대상 파일이 사라짐' };
    wr(f.file, s.split(from).join(to)); return { ok: true, note: `${from} → ${to}` };
  },
  /* 차시에 학급 게이트 삽입 — </head> 바로 앞 (레포 관례) */
  add_gate(f) {
    const s = rd(f.file);
    if (s.includes('/kedu_gate.js')) return { ok: false, why: '이미 실려 있음' };
    if (!/<\/head>/i.test(s)) return { ok: false, why: '</head> 가 없어 자리를 못 잡음' };
    wr(f.file, s.replace(/<\/head>/i, '<script src="/kedu_gate.js"></script>\n</head>')); return { ok: true, note: '</head> 앞에 kedu_gate.js' };
  },
  /* 돌아가기 버튼 — </body> 앞 (fixed 좌상단 기본형) */
  add_back(f) {
    const s = rd(f.file);
    if (s.includes('kedu_back.js')) return { ok: false, why: '이미 실려 있음' };
    if (!/<\/body>/i.test(s)) return { ok: false, why: '</body> 가 없음' };
    wr(f.file, s.replace(/<\/body>/i, '<script src="/kedu_back.js"></script>\n</body>')); return { ok: true, note: '</body> 앞에 kedu_back.js' };
  },
  /* SQL 원장에 미등재 줄 추가 (⏳ 미실행 표시 — 실행 확인은 준호 몫) */
  ledger_row(f) {
    const L = 'sql/APPLIED.md'; const s = rd(L); const name = f.fix.name;
    if (s.includes(name)) return { ok: false, why: '이미 등재됨' };
    const nums = [...s.matchAll(/^\|\s*(\d+)\s*\|/gm)].map(m => Number(m[1])); const n = (nums.length ? Math.max(...nums) : 0) + 1;
    const today = new Date().toISOString().slice(0, 10);
    const row = `| ${n} | ${name} | ${today} 케이점검이 등재 · **⏳ 미실행** | (용도 적을 것) 검산 (적을 것) |`;
    /* 표의 마지막 줄 뒤에 붙인다 */
    const lines = s.split('\n'); let last = -1; lines.forEach((l, i) => { if (/^\|\s*\d+\s*\|/.test(l)) last = i; });
    if (last < 0) return { ok: false, why: '원장 표를 찾지 못함' };
    lines.splice(last + 1, 0, row); wr(L, lines.join('\n')); return { ok: true, note: `#${n} ${name} 등재(⏳)` };
  },
};

/* 보안 — 자동 수정이 손댈 수 있는 곳의 상한 */
const MAX_PER_RUN = 300;
const FORBIDDEN = [/^\.github\//, /^audit\//, /^node_modules\//, /^kedu_config\.js$/, /^vercel\.json$/, /^package(-lock)?\.json$/, /^sql\/(?!APPLIED\.md$)/, /^\.gitignore$/];
const safePath = f => typeof f === 'string' && !f.includes('..') && !f.startsWith('/') && !FORBIDDEN.some(r => r.test(f));

async function main() {
  const local = process.argv.includes('--local');
  const cp = require('child_process');
  /* 항상 로컬에서 방금 다시 점검한 결과를 정본으로 쓴다 — DB 의 fix 지시는 「어느 지문을 승인했나」만 알려준다.
     (service_role 키가 새어 DB 줄이 조작돼도, 이 레포에서 지금 실제로 검출된 항목의 실제 fix 만 적용된다) */
  cp.spawnSync(process.execPath, [path.join(__dirname, 'inspector.js'), '--quiet'], { cwd: ROOT, stdio: 'ignore' });
  const fresh = new Map(JSON.parse(rd('audit/out/report.json')).findings.filter(f => f.fixable).map(f => [f.fingerprint, f]));
  let items = [];
  if (local) items = [...fresh.values()];
  else {
    const { fetchApproved } = require('./upload.js');
    const approved = await fetchApproved();
    for (const a of approved) {
      if (!/^[0-9a-f]{16}$/.test(a.fingerprint || '')) continue;
      const f = fresh.get(a.fingerprint);
      if (!f) { items.push({ fingerprint: a.fingerprint, _skip: '지금 레포에서는 검출되지 않음 (이미 고쳤거나 DB 줄이 어긋남)' }); continue; }
      items.push(f);
    }
  }
  if (items.length > MAX_PER_RUN) { console.log(`상한 ${MAX_PER_RUN} 초과 (${items.length}) — 앞 ${MAX_PER_RUN}건만`); items = items.slice(0, MAX_PER_RUN); }
  const results = {};
  for (const f of items) {
    if (f._skip) { results[f.fingerprint] = { ok: false, why: f._skip }; continue; }
    if (!safePath(f.file)) { results[f.fingerprint] = { ok: false, why: '자동 수정 금지 경로', file: f.file }; continue; }
    if (f.fix && f.fix.to && !safePath(String(f.fix.to).replace(/^\//, ''))) { results[f.fingerprint] = { ok: false, why: '대상 경로 금지', file: f.file }; continue; }
    const fn = FIXERS[f.fix && f.fix.type];
    if (!fn) { results[f.fingerprint] = { ok: false, why: '자동 수정 종류 아님' }; continue; }
    try { results[f.fingerprint] = { ...fn(f), file: f.file, type: f.fix.type }; }
    catch (e) { results[f.fingerprint] = { ok: false, why: String(e).slice(0, 200), file: f.file }; }
  }
  fs.mkdirSync(path.join(ROOT, 'audit/out'), { recursive: true });
  wr('audit/out/fixed.json', JSON.stringify(results, null, 1));
  const okN = Object.values(results).filter(r => r.ok).length;
  console.log(`케이점검 수정 — 대상 ${items.length} · 고침 ${okN} · 못 고침 ${items.length - okN}`);
  for (const [fp, r] of Object.entries(results)) console.log(`  ${r.ok ? '✔' : '✗'} ${fp} ${r.file || ''} ${r.note || r.why || ''}`);
}
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { FIXERS };

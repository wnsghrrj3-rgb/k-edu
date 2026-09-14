/* ============================================================
   tplpkg-build.mjs — 편집형 템플릿 패키지 굳히기 (R154)
   실행: node maker-playground/tplpkg-build.mjs
   assets/tplpkg/<dir>/{template.json, metadata.json, kmaker.json?} 전부를
   MK_TPLPKG.toTemplate 로 풀어 data/tplpkg-baked.js 로 굳힌다.
   패키지를 늘릴 때: 폴더만 얹고 이 스크립트 재실행 — 손으로 고칠 파일 0.
   결정적: 같은 입력 = 같은 바이트 (드리프트 검사는 test-round154).
   ============================================================ */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, 'assets', 'tplpkg');
const OUT = path.join(HERE, 'data', 'tplpkg-baked.js');

export function build() {
  globalThis.window = globalThis.window || {};
  /* R155 — Font Registry 를 먼저 올려 굳히는 시점에 fontId·대체 여부가 정해진다(런타임과 같은 해석) */
  const fr = fs.readFileSync(path.join(HERE, 'data', 'fontreg.js'), 'utf8');
  new Function('window', fr)(globalThis.window);
  const src = fs.readFileSync(path.join(HERE, 'data', 'tplpkg.js'), 'utf8');
  new Function('window', src)(globalThis.window);
  const T = globalThis.window.MK_TPLPKG;
  const dirs = fs.existsSync(ROOT) ? fs.readdirSync(ROOT).filter((d) => fs.existsSync(path.join(ROOT, d, 'template.json'))).sort() : [];
  const rows = [], report = [];
  for (const dir of dirs) {
    const rd = (f) => { const p = path.join(ROOT, dir, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; };
    const pkg = rd('template.json'), meta = rd('metadata.json') || {}, side = rd('kmaker.json') || {};
    const v = T.validate(pkg);
    if (!v.ok) { report.push({ dir, ok: false, violations: v.violations }); continue; }
    const { src, ov } = T.toTemplate(pkg, meta, side, { dir });
    rows.push({ src, ov });
    report.push({ dir, ok: true, id: src.templateId, title: src.title, count: src.scenes[0].elements.length, groups: Object.keys(src.scenes[0].groups || {}).length });
  }
  const body = `/* ============================================================
   MK_TPLPKG_BAKED — 편집형 템플릿 패키지 굳힌 것 (자동 생성 — 손으로 고치지 말 것)
   원본: assets/tplpkg/<dir>/template.json (+ metadata.json, kmaker.json)
   생성: node maker-playground/tplpkg-build.mjs
   로드되면 Template Engine(MK_TPL.register)에 등록돼 Templates·홈·만들기에 선다.
   ============================================================ */
window.MK_TPLPKG_BAKED = (() => {
  const ROWS = ${JSON.stringify(rows)};
  if (window.MK_TPLPKG) ROWS.forEach((r) => window.MK_TPLPKG.register(r.src, r.ov));
  else if (window.MK_TPL && window.MK_TPL.register) ROWS.forEach((r) => { try { window.MK_TPL.register(r.src, r.ov); } catch (_) {} });
  return ROWS;
})();
`;
  return { body, report };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { body, report } = build();
  fs.writeFileSync(OUT, body);
  report.forEach((r) => console.log(r.ok ? `✓ ${r.dir} → ${r.id} 「${r.title}」 요소 ${r.count} · 그룹 ${r.groups}` : `✗ ${r.dir}: ${r.violations.join(' / ')}`));
  console.log('data/tplpkg-baked.js 생성 완료 (' + report.filter((r) => r.ok).length + '종)');
}

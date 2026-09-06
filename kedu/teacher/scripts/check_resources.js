#!/usr/bin/env node
/* check_resources.js — 자료층(resources/) 형식·최소선 검사 (2026-09-07)
   사용: node scripts/check_resources.js [g1_math_u1 ...]  (인자 없으면 resources/*.js 전부)
   잰다: 차시 키가 LESSONS에 실존 · id 유일 · type ∈ {video,link,kedu} · video 확보면 video_id 11자 ·
         start<end · status ∈ {확보,미확보} · verified 날짜꼴 · kedu url 파일 실존 ·
         차시당 최소선(영상1 · 링크1 · 케이에듀1). 살아 있는지는 사람이 재생해 본다. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');            // kedu/teacher
const SITE = path.join(ROOT, '..', '..');           // 사이트 루트
const args = process.argv.slice(2);
const files = (args.length ? args.map(a => a + '.js') : fs.readdirSync(path.join(ROOT, 'resources')).filter(f => f.endsWith('.js')));
let fail = 0, pass = 0;
function ok(c, msg) { if (c) pass++; else { fail++; console.log('  ✗ ' + msg); } }

for (const f of files) {
  const m = f.match(/^(g\d_[a-z]+)_u(\d+)\.js$/);
  if (!m) { console.log('건너뜀 ' + f); continue; }
  const slug = m[1], unit = m[2];
  const ctx = { window: {} }; ctx.window.window = ctx.window; ctx.window.LESSONS = {}; ctx.LESSONS = ctx.window.LESSONS;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data', `${slug}_u${unit}.js`), 'utf8'), ctx);
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'resources', f), 'utf8'), ctx);
  const L = ctx.window.LESSONS || {}, R = (ctx.window.KT_RESOURCES || {})[slug] || {};
  console.log(`\n== resources/${f}`);
  const keys = Object.keys(R);
  ok(keys.length > 0, '차시 키 0개');
  const lessonKeys = Object.keys(L).filter(k => k.startsWith(`u${unit}_`) && !k.includes('{'));
  lessonKeys.forEach(k => ok(R[k], `LESSONS 키 ${k}에 자료 없음`));
  let nv = 0, nmiss = 0, nlink = 0, nkedu = 0;
  for (const k of keys) {
    ok(L[k], `${k}: LESSONS에 없는 키`);
    const ids = new Set(); let v = 0, lk = 0, kd = 0;
    for (const e of R[k]) {
      const tag = `${k}/${e.id}`;
      ok(e.id && !ids.has(e.id), `${tag}: id 중복·누락`); ids.add(e.id);
      ok(['video', 'link', 'kedu'].includes(e.type), `${tag}: type ${e.type}`);
      ok(e.title && (e.description || e.content), `${tag}: title/description 누락`);
      ok(typeof e.url === 'string' && e.url.length > 0, `${tag}: url 누락`);
      ok(['확보', '미확보'].includes(e.status), `${tag}: status ${e.status}`);
      ok(/^\d{4}-\d{2}-\d{2}$/.test(e.verified || ''), `${tag}: verified 날짜꼴 아님`);
      ok(Array.isArray(e.fit_slides) && e.fit_slides.length > 0, `${tag}: fit_slides 비어 있음`);
      if (e.type === 'video') {
        v++; if (e.status === '미확보') nmiss++;
        if (e.status === '확보') ok(/^[A-Za-z0-9_-]{11}$/.test(e.video_id || ''), `${tag}: video_id 11자 아님`);
        else ok(!e.video_id, `${tag}: 미확보인데 video_id 있음`);
        if (e.start != null || e.end != null) ok(e.start >= 0 && e.end > e.start, `${tag}: start/end`);
      }
      if (e.type === 'link') { lk++; ok(/^https?:\/\//.test(e.url), `${tag}: link url`); }
      if (e.type === 'kedu') {
        kd++;
        ok(e.url.startsWith('/'), `${tag}: kedu url은 사이트 루트 절대 경로`);
        ok(fs.existsSync(path.join(SITE, decodeURIComponent(e.url))), `${tag}: 파일 없음 ${e.url}`);
      }
    }
    ok(v >= 1, `${k}: 영상 0개(최소선 1)`); ok(lk >= 1, `${k}: 링크 0개(최소선 1)`); ok(kd >= 1, `${k}: 케이에듀 0개(최소선 1)`);
    nv += v; nlink += lk; nkedu += kd;
  }
  console.log(`  차시 ${keys.length} · 영상 ${nv}(미확보 ${nmiss}) · 링크 ${nlink} · 케이에듀 ${nkedu}`);
}
console.log(`\n${fail === 0 ? '✅' : '❌'} pass ${pass} / fail ${fail}`);
process.exit(fail ? 1 : 0);

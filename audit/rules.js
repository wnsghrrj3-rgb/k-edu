/* ============================================================
   케이점검 규칙 — 각 규칙은 { id, name, run(ctx) }.
   ctx: files() read() exists() resolveLink() areaOf() add() CFG ROOT
   심각도 기준:
     high = 사용자가 바로 막히거나(깨진 입구·404·구문 오류·시크릿 노출·테스트 실패) 데이터가 틀림
     mid  = 동작은 하나 어딘가 어긋남(지도 불일치·원장 누락·표 참조 불명)
     low  = 정리 대상(고아 파일·TODO·돌아가기 없음)
   새 규칙 추가 = 이 배열에 한 항목. id 는 rNN 고정(지문의 일부라 바꾸면 이력이 끊긴다).
   ============================================================ */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');

const isHtml = f => f.endsWith('.html');
const isJs = f => f.endsWith('.js') || f.endsWith('.mjs');
const lineOf = (s, idx) => s.slice(0, idx).split('\n').length;
/* 주석·스크립트·스타일을 뺀 마크업만 */
const stripScripts = s => s.replace(/<script[\s\S]*?<\/script>/gi, m => ' '.repeat(m.length)).replace(/<style[\s\S]*?<\/style>/gi, m => ' '.repeat(m.length)).replace(/<!--[\s\S]*?-->/g, m => ' '.repeat(m.length));
const inlineScripts = s => { const out = []; const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m; while ((m = re.exec(s))) out.push({ attrs: m[1], code: m[2], idx: m.index }); return out; };
const unesc = t => t.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
const isLessonFile = (ctx, f) => isHtml(f) && /kedu-lesson-id/.test(ctx.read(f));

module.exports = [

/* r01 — 내부 링크·자원 깨짐 (href/src/poster/data-src, iframe, meta refresh) */
{ id: 'r01', name: '내부 링크·자원 깨짐', run(ctx) {
  const attrRe = /\b(?:href|src|poster|data-src|data-href|action)\s*=\s*["']([^"']+)["']/gi;
  const refreshRe = /http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"'\s]+)/i;
  const basenames = {}; for (const f of ctx.files()) (basenames[path.posix.basename(f)] ||= []).push(f);
  for (const f of ctx.files().filter(isHtml)) {
    const raw = ctx.read(f); const s = stripScripts(raw); let m;
    const seenHere = new Set();
    const check = (href, idx) => {
      if (!/[\/.]/.test(href)) return;                                   // href="more" 같은 상태값은 링크가 아니다
      const r = ctx.resolveLink(f, href); if (r.skip || r.ok) return;
      if (seenHere.has(r.target)) return; seenHere.add(r.target);
      const bn = path.posix.basename(r.target); const cands = (basenames[bn] || []).filter(c => c !== f);
      const fix = cands.length === 1 ? { type: 'relink', from: href, to: '/' + cands[0] } : undefined;
      ctx.add({ rule: 'r01', severity: 'mid', file: f, line: lineOf(raw, idx), msg: `링크 대상 없음 \`${href}\`${cands.length === 1 ? ' → 같은 이름이 `/' + cands[0] + '` 에 있음' : cands.length > 1 ? ' (같은 이름 ' + cands.length + '곳 — 손으로 골라야)' : ''}`, fix });
    };
    while ((m = attrRe.exec(s))) check(m[1], m.index);
    const mr = refreshRe.exec(raw); if (mr) check(mr[1], mr.index);
    /* 인라인 스크립트 안의 location.href='…' / src:"…" 문자열 리터럴 (절대경로만 — 상대경로는 실행 맥락 의존이라 뺀다) */
    for (const sc of inlineScripts(raw)) {
      const re2 = /(?:location(?:\.href)?\s*=|window\.open\(|\.src\s*=|href\s*:|url\s*:|fetch\()\s*["'](\/[^"'`$]+?\.(?:html|js|css|json|png|jpg|jpeg|svg|webp|mp3|mp4|gif))["']/g; let k;
      while ((k = re2.exec(sc.code))) check(k[1], sc.idx + k.index);
    }
  }
  /* CSS url() + JS 파일 안의 절대경로 자원 */
  for (const f of ctx.files().filter(x => x.endsWith('.css'))) {
    const s = ctx.read(f); const re = /url\(\s*["']?([^"')]+)["']?\s*\)/g; let m;
    while ((m = re.exec(s))) { const r = ctx.resolveLink(f, m[1]); if (!r.skip && !r.ok) ctx.add({ rule: 'r01', severity: 'mid', file: f, line: lineOf(s, m.index), msg: `CSS 자원 없음 \`${m[1]}\`` }); }
  }
}},

/* r02 — 차시 메타·필수 스크립트·lessonId 중복 */
{ id: 'r02', name: '차시 메타·필수 스크립트', run(ctx) {
  const ids = {};
  for (const f of ctx.files().filter(isHtml)) {
    const s = ctx.read(f); const m = /<meta[^>]+name=["']kedu-lesson-id["'][^>]+content=["']([^"']+)["']/i.exec(s) || /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']kedu-lesson-id["']/i.exec(s);
    if (!m) continue;
    (ids[m[1]] ||= []).push(f);
    if (f.startsWith('gifted/')) continue; // 영재는 게이트 예외(기존 테스트 규약)
    for (const req of ctx.CFG.required_lesson_scripts) {
      if (!s.includes(`src="${req}"`) && !s.includes(`src='${req}'`)) ctx.add({ rule: 'r02', severity: 'high', file: f, msg: `차시인데 \`${req}\` 를 싣지 않음 — 학급 게이트 없이 누구나 들어온다`, fix: req === '/kedu_gate.js' && /<\/head>/i.test(s) ? { type: 'add_gate' } : undefined });
    }
    if (!/<meta[^>]+name=["']viewport["']/i.test(s)) ctx.add({ rule: 'r02', severity: 'mid', file: f, msg: 'viewport 메타 없음 (태블릿·폰에서 배율이 틀어진다)' });
  }
  for (const [id, fl] of Object.entries(ids)) if (fl.length > 1) ctx.add({ rule: 'r02', severity: 'high', file: fl[0], msg: `lessonId \`${id}\` 가 ${fl.length}개 파일에 겹침 — 진도 저장이 한 칸에 섞인다: ${fl.slice(1).join(', ')}` });
}},

/* r03 — kedu_map ↔ 허브 UNITS ↔ 실파일 ↔ 루트 CONTENT_MAP */
{ id: 'r03', name: '지도·허브·실파일 일치', run(ctx) {
  const mapUrls = new Map(); // url → mapfile
  for (const f of ctx.files().filter(x => x.startsWith('kedu_map/') && x.endsWith('.js') && !x.endsWith('_index.js'))) {
    const win = { KEDU_MAP: {} }; win.window = win;
    try { vm.runInNewContext(ctx.read(f), win); } catch (e) { ctx.add({ rule: 'r03', severity: 'high', file: f, msg: `kedu_map 파일 실행 실패: ${String(e).slice(0, 120)}` }); continue; }
    for (const [k, v] of Object.entries(win.KEDU_MAP)) {
      const hub = `grade${v.grade}/semester${v.semester}/${v.subject}/index.html`;
      if (!ctx.exists(hub)) ctx.add({ rule: 'r03', severity: 'mid', file: f, msg: `지도 \`${k}\` 의 허브 \`${hub}\` 가 없음` });
      for (const u of v.units || []) for (const l of u.lessons || []) {
        if (!l.url) continue;
        mapUrls.set(l.url, f);
        const r = ctx.resolveLink(f, l.url);
        if (l.ready !== false && !r.skip && !r.ok) ctx.add({ rule: 'r03', severity: 'high', file: f, msg: `지도 \`${l.key}\` 의 파일 없음 \`${l.url}\`` });
      }
    }
  }
  /* 허브 UNITS 의 file: 링크 */
  for (const hub of ctx.files().filter(x => /^grade\d\/semester\d\/[a-z]+\/index\.html$/.test(x))) {
    const s = ctx.read(hub); const dirs = {}; let m;
    const dre = /(?:const|var|let)\s+(DIR\w*)\s*=\s*["']([^"']*)["']/g; while ((m = dre.exec(s))) dirs[m[1]] = m[2];
    const fre = /file\s*:\s*(?:(DIR\w*)\s*\+\s*)?["']([^"']+)["'][^}]*?track\s*:\s*["'](\w+)["']/g; let n = 0, missingInMap = 0;
    while ((m = fre.exec(s))) {
      const rel = unesc((m[1] ? (dirs[m[1]] || '') : '') + m[2]); n++;
      const r = ctx.resolveLink(hub, rel);
      if (m[3] === 'soon') continue;                                     // 준비 중 표시는 파일이 없는 게 정상
      if (!r.skip && !r.ok) ctx.add({ rule: 'r03', severity: 'high', file: hub, line: lineOf(s, m.index), msg: `허브 UNITS 의 차시 파일 없음 \`${rel}\`` });
      else if (r.ok) { const abs = '/' + r.target; if (mapUrls.size && !mapUrls.has(abs) && !mapUrls.has(abs.replace(/^\//, ''))) missingInMap++; }
    }
    const sub = hub.split('/'); const g = sub[0].replace('grade', ''), sem = sub[1].replace('semester', ''), subj = sub[2];
    const hasMap = ctx.files().some(x => x === `kedu_map/g${g}_${sem}_${subj}.js`);
    if (n && !hasMap) ctx.add({ rule: 'r03', severity: 'mid', file: hub, msg: `허브에 차시 ${n}개가 있는데 \`kedu_map/g${g}_${sem}_${subj}.js\` 가 없음 (handoff/scripts/build_kedu_map.js 로 생성)` });
    else if (n && missingInMap) ctx.add({ rule: 'r03', severity: 'mid', file: hub, msg: `허브 차시 ${missingInMap}개가 kedu_map 에 없음 — 지도 재생성 필요` });
  }
  /* 루트 CONTENT_MAP ↔ 실제 허브 디렉터리 */
  const root = ctx.read('index.html'); const cm = /const CONTENT_MAP\s*=\s*(\{[\s\S]*?\});/.exec(root);
  if (!cm) { ctx.add({ rule: 'r03', severity: 'high', file: 'index.html', msg: 'CONTENT_MAP 을 찾지 못함 (404 가드가 안 붙는다)' }); return; }
  let CM = {}; try { CM = vm.runInNewContext('(' + cm[1] + ')'); } catch { ctx.add({ rule: 'r03', severity: 'high', file: 'index.html', msg: 'CONTENT_MAP 파싱 실패' }); return; }
  const live = {}; for (const h of ctx.files().filter(x => /^grade\d\/semester\d\/[a-z]+\/index\.html$/.test(x))) { const [g, s, subj] = h.split('/'); (live[`${g.slice(5)}-${s.slice(8)}`] ||= []).push(subj); }
  for (const [k, subs] of Object.entries(CM)) for (const sj of subs) if (!(live[k] || []).includes(sj)) ctx.add({ rule: 'r03', severity: 'high', file: 'index.html', msg: `CONTENT_MAP 에 \`${k} ${sj}\` 가 열려 있는데 허브 파일이 없음 → 학생이 404` });
  for (const [k, subs] of Object.entries(live)) for (const sj of subs) if (!(CM[k] || []).includes(sj)) ctx.add({ rule: 'r03', severity: 'mid', file: 'index.html', msg: `허브 \`grade${k.split('-')[0]}/semester${k.split('-')[1]}/${sj}/\` 가 있는데 CONTENT_MAP 에 안 열려 있음 (의도한 잠금이면 무시)` });
}},

/* r04 — 자바스크립트 구문 (인라인 + 외부) */
{ id: 'r04', name: 'JS 구문 오류', run(ctx) {
  const tryParse = (code, f, line) => {
    if (/^\s*(import|export)\b/m.test(code)) return; // ESM 은 vm.Script 가 못 읽는다 — module 검사는 r09 몫
    try { new vm.Script(code, { filename: f }); }
    catch (e) { const ln = (/:(\d+)/.exec(String(e.stack || '').split('\n')[0]) || [])[1]; ctx.add({ rule: 'r04', severity: 'high', file: f, line: ln ? line + Number(ln) - 1 : line, msg: `구문 오류: ${String(e.message || e).slice(0, 140)}` }); }
  };
  for (const f of ctx.files()) {
    if (isJs(f) && !f.startsWith('tests/') && !f.startsWith('audit/') && !/\/vendor\/|\.min\.js$/.test(f)) tryParse(ctx.read(f), f, 1);
    else if (isHtml(f)) { const s = ctx.read(f); for (const sc of inlineScripts(s)) { const ty = (/type\s*=\s*["']([^"']+)["']/i.exec(sc.attrs) || [])[1]; if ((ty && !/^(text\/javascript|application\/javascript|module)$/i.test(ty)) || /\bsrc=/.test(sc.attrs)) continue; if (!sc.code.trim()) continue; tryParse(sc.code, f, lineOf(s, sc.idx)); } }
  }
}},

/* r05 — HTML 뼈대: 중복 id·title 없음·태그 밸런스 */
{ id: 'r05', name: 'HTML 뼈대', run(ctx) {
  for (const f of ctx.files().filter(isHtml)) {
    const raw = ctx.read(f); const s = stripScripts(raw);
    if (!/<title>[^<]*\S[^<]*<\/title>/i.test(raw)) ctx.add({ rule: 'r05', severity: 'low', file: f, msg: '<title> 이 비어 있음 (탭·기록에 이름이 안 남는다)' });
    const ids = {}; const re = /\bid\s*=\s*["']([^"']+)["']/g; let m;
    while ((m = re.exec(s))) (ids[m[1]] ||= []).push(lineOf(s, m.index));
    const dup = Object.entries(ids).filter(([, l]) => l.length > 1);
    if (dup.length) ctx.add({ rule: 'r05', severity: 'mid', file: f, line: dup[0][1][1], msg: `정적 마크업에 id 중복 ${dup.length}종: ${dup.slice(0, 4).map(([k, l]) => `\`${k}\`×${l.length}`).join(', ')}${dup.length > 4 ? ' …' : ''} (getElementById 가 첫 것만 잡는다)` });
    const open = (s.match(/<div\b/gi) || []).length, close = (s.match(/<\/div>/gi) || []).length;
    if (open !== close) ctx.add({ rule: 'r05', severity: 'mid', file: f, msg: `<div> 여닫음 불일치 (열림 ${open} · 닫힘 ${close}) — 화면 일부가 밀리거나 겹칠 수 있음` });
  }
}},

/* r06 — 차단 어휘 (학생 화면) */
{ id: 'r06', name: '차단 어휘', run(ctx) {
  const words = ctx.CFG.blocked_vocab; if (!words.length) return;
  for (const f of ctx.files().filter(x => isHtml(x) && ctx.CFG.blocked_vocab_scope.some(p => x.startsWith(p)))) {
    const s = stripScripts(ctx.read(f)).replace(/<[^>]+>/g, ' ');
    for (const w of words) { const i = s.indexOf(w); if (i >= 0) ctx.add({ rule: 'r06', severity: 'mid', file: f, line: lineOf(s, i), msg: `차단 어휘 「${w}」 노출` }); }
  }
}},

/* r07 — 돌아가기(kedu_back.js) 배선 + 즉시 리다이렉트 대상 */
{ id: 'r07', name: '돌아가기 배선', run(ctx) {
  const toolAreas = ['케이티처', '케이랩', '케이뮤지엄', '케이플', '케이파크', '케이메이커', '케이무비', '케이아트', '케이배틀', '케이퀴즈', '케이라이브', '아침활동', '케이영재'];
  for (const f of ctx.files().filter(isHtml)) {
    const a = ctx.areaOf(f); if (!toolAreas.includes(a)) continue;
    if (/\/(tests?|parts|components|lib|core|engine\d?|assets|_)[\/]/.test('/' + f) || /\/_/.test(f)) continue;
    const s = ctx.read(f);
    if (/http-equiv=["']refresh["']/i.test(s)) continue;             // 안내판은 대상 아님
    if (/<iframe|frameset/i.test(s) && !/<body/i.test(s)) continue;
    if (!/<body/i.test(s)) continue;                                    // 조각 파일
    if (!s.includes('/kedu_back.js') && !s.includes('kedu_back.js')) ctx.add({ rule: 'r07', severity: 'low', file: f, msg: '돌아가기(kedu_back.js) 없음 — 학생이 이 화면에서 나갈 길이 브라우저 뒤로가기뿐', fix: { type: 'add_back' } });
  }
}},

/* r08 — SQL 원장(sql/APPLIED.md) */
{ id: 'r08', name: 'SQL 원장', run(ctx) {
  if (!ctx.exists('sql/APPLIED.md')) { ctx.add({ rule: 'r08', severity: 'mid', file: 'sql/', msg: 'APPLIED.md 원장이 없음' }); return; }
  const led = ctx.read('sql/APPLIED.md');
  for (const f of ctx.files().filter(x => x.startsWith('sql/') && x.endsWith('.sql'))) {
    const bn = path.posix.basename(f);
    const rng = /^(.*_)(\d+)\.sql$/.exec(bn); const inRange = rng && new RegExp(rng[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\d+\\s*~\\s*\\d+').test(led); // seed_x_1~4.sql 식 묶음 표기
    if (!led.includes(bn) && !inRange) ctx.add({ rule: 'r08', severity: 'mid', file: f, msg: 'APPLIED.md 에 등재되지 않은 SQL — 적용 여부를 아무도 모른다', fix: { type: 'ledger_row', name: bn } });
  }
  const pend = [...led.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|[^|]*⏳[^|]*\|/gm)];
  for (const p of pend) ctx.add({ rule: 'r08', severity: 'low', file: 'sql/APPLIED.md', msg: `#${p[1]} ${p[2]} 가 아직 ⏳ 미실행 — Supabase 에서 돌리고 원장을 갱신할 것` });
}},

/* r09 — 회귀 테스트 실행 (tests/*.js, 각 파일 독립) */
{ id: 'r09', name: '회귀 테스트', run(ctx) {
  let hasJsdom = false; try { require.resolve('jsdom', { paths: [ctx.ROOT] }); hasJsdom = true; } catch {}
  for (const f of ctx.files().filter(x => x.startsWith('tests/') && x.endsWith('.js'))) {
    const needsJsdom = /require\(['"]jsdom['"]\)/.test(ctx.read(f));
    if (needsJsdom && !hasJsdom) { ctx.add({ rule: 'r09', severity: 'low', file: f, msg: 'jsdom 이 없어 건너뜀 (npm ci 후 재실행)' }); continue; }
    const r = cp.spawnSync(process.execPath, [f], { cwd: ctx.ROOT, timeout: ctx.CFG.test_timeout_ms, encoding: 'utf8', env: { ...process.env, NODE_PATH: path.join(ctx.ROOT, 'node_modules') } });
    const out = (r.stdout || '') + (r.stderr || '');
    const failLines = out.split('\n').filter(l => /✗|FAIL|실패/.test(l) && !/\b0 FAIL\b|FAIL[: ]+0\b|실패[: ]+0\b|\b0 실패|✗ 0\b/.test(l));
    if (/Cannot find module 'jsdom'/.test(out)) { ctx.add({ rule: 'r09', severity: 'low', file: f, msg: 'jsdom 이 없어 건너뜀 (npm ci 후 재실행)' }); continue; }
    const nf = /Cannot find module '([^']+)'/.exec(out);
    if (r.status !== 0 || r.error) ctx.add({ rule: 'r09', severity: nf ? 'mid' : 'high', file: f, msg: nf ? `테스트가 \`${nf[1]}\` 를 못 찾음 — 옛 컨테이너 경로거나 지운 파일 (테스트 자체를 고쳐야)` : `테스트 실패 (exit ${r.status}${r.error ? ' · ' + r.error.code : ''}) ${failLines.slice(0, 3).join(' / ').slice(0, 300)}` });
    else if (failLines.length) ctx.add({ rule: 'r09', severity: 'mid', file: f, msg: `종료코드는 0인데 실패 문면이 보임: ${failLines.slice(0, 2).join(' / ').slice(0, 200)}` });
  }
}},

/* r10 — 크기·빈 파일 */
{ id: 'r10', name: '크기·빈 파일', run(ctx) {
  for (const f of ctx.files()) {
    const st = ctx.exists(f); if (!st) continue;
    if (isHtml(f) && st.size < 200) ctx.add({ rule: 'r10', severity: 'mid', file: f, msg: `HTML 이 ${st.size}바이트 — 빈 껍데기거나 저장 실패` });
    else if (isHtml(f) && st.size > ctx.CFG.big_html_bytes) ctx.add({ rule: 'r10', severity: 'low', file: f, msg: `HTML ${(st.size / 1e6).toFixed(1)}MB — 저사양 태블릿에서 느림, 자원 분리 후보` });
    else if (!isHtml(f) && !isJs(f) && st.size > ctx.CFG.big_asset_bytes) ctx.add({ rule: 'r10', severity: 'low', file: f, msg: `에셋 ${(st.size / 1e6).toFixed(1)}MB — 레포 비대, 외부 저장 후보` });
  }
}},

/* r11 — 시크릿 노출 */
{ id: 'r11', name: '시크릿 노출', run(ctx) {
  const pats = [[/ghp_[A-Za-z0-9]{30,}/, 'GitHub 토큰'], [/github_pat_[A-Za-z0-9_]{40,}/, 'GitHub 토큰'], [/sk-ant-[A-Za-z0-9\-_]{30,}/, 'Anthropic 키'], [/AKIA[0-9A-Z]{16}/, 'AWS 키'], [/-----BEGIN (RSA |EC )?PRIVATE KEY-----/, '개인키']];
  for (const f of ctx.files().filter(x => isHtml(x) || isJs(x) || /\.(json|md|sql|yml|yaml|env|txt)$/.test(x))) {
    if (f === 'audit/rules.js') continue;
    const s = ctx.read(f);
    for (const [re, name] of pats) { const m = re.exec(s); if (m) ctx.add({ rule: 'r11', severity: 'high', file: f, line: lineOf(s, m.index), msg: `${name} 로 보이는 문자열이 레포에 들어 있음 — 즉시 폐기·재발급` }); }
    /* Supabase service_role JWT (payload 에 role: service_role) */
    for (const m of s.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g)) {
      try { const p = JSON.parse(Buffer.from(m[0].split('.')[1], 'base64').toString()); if (p.role === 'service_role') ctx.add({ rule: 'r11', severity: 'high', file: f, line: lineOf(s, m.index), msg: 'Supabase service_role 키가 레포에 있음 — RLS 를 전부 우회하는 키, 즉시 회전' }); } catch {}
    }
  }
}},

/* r12 — 고아 HTML (어디서도 링크되지 않음) */
{ id: 'r12', name: '고아 HTML', run(ctx) {
  const html = ctx.files().filter(isHtml); const linked = new Set(['index.html', '404.html']);
  const attrRe = /\b(?:href|src|data-href|data-src)\s*=\s*["']([^"']+)["']|["'](\/[^"'`$]+?\.html)["']|["']([^"'`$\/][^"'`$]*?\.html)["']/g;
  for (const f of ctx.files().filter(x => isHtml(x) || isJs(x))) {
    const s = ctx.read(f); let m;
    while ((m = attrRe.exec(s))) { const h = m[1] || m[2] || m[3]; const r = ctx.resolveLink(f, h); if (r.ok) linked.add(r.target); }
  }
  /* 허브 UNITS(DIR+file) · kedu_map url · vercel rewrites */
  for (const f of html) { const s = ctx.read(f); const dirs = {}; let m; const dre = /(?:const|var|let)\s+(DIR\w*)\s*=\s*["']([^"']*)["']/g; while ((m = dre.exec(s))) dirs[m[1]] = m[2];
    const fre = /file\s*:\s*(?:(DIR\w*)\s*\+\s*)?["']([^"']+)["']/g; while ((m = fre.exec(s))) { const r = ctx.resolveLink(f, unesc((m[1] ? dirs[m[1]] || '' : '') + m[2])); if (r.ok) linked.add(r.target); } }
  const byDir = {};
  for (const f of html) {
    if (linked.has(f)) continue;
    if (/\/index\.html$/.test(f)) continue; // 디렉터리 진입점은 URL 로 들어온다
    if (ctx.CFG.orphan_ignore_prefixes.some(p => f.startsWith(p))) continue;
    if (/\/(tests?|parts|_)[^\/]*\//.test('/' + f) || /_test\.html$|\/test_/.test(f)) continue;
    (byDir[path.posix.dirname(f)] ||= []).push(f);
  }
  for (const [d, fl] of Object.entries(byDir)) ctx.add({ rule: 'r12', severity: 'low', file: d + '/', msg: `어느 화면·지도에서도 링크되지 않는 HTML ${fl.length}개 (${fl.slice(0, 3).map(x => path.posix.basename(x)).join(', ')}${fl.length > 3 ? ' …' : ''}) — 배선 누락이거나 보관 대상, 삭제는 준호 판단` });
}},

/* r13 — 영역 입구 존재 */
{ id: 'r13', name: '영역 입구', run(ctx) {
  const entries = { '관리': 'admin/index.html', '계정·입구': 'auth/index.html', '학부모': 'parent/index.html', '케이티처': 'teacher/index.html', '케이박스': 'classwork/index.html', '케이플': 'kple/play.html', '케이파크': 'kpark/index.html', '케이메이커': 'kmake/index.html', '케이뮤지엄': 'museum/index.html', '케이랩': 'kedu/hub/klab.html', '케이무비': 'kmovie/index.html', '아침활동': 'morning/index.html', '학습리포트': 'mylearning/index.html', '케이라이브': 'live/index.html', '게시판': 'board/index.html', '약관·정책': 'privacy/index.html' };
  for (const [a, e] of Object.entries(entries)) if (!ctx.exists(e)) ctx.add({ rule: 'r13', severity: 'high', area: a, file: e, msg: `영역 입구 \`${e}\` 가 없음 (이동했으면 audit/rules.js r13 표를 고칠 것)` });
}},

/* r14 — TODO·임시 표식 */
{ id: 'r14', name: 'TODO·임시 표식', run(ctx) {
  for (const f of ctx.files().filter(x => (isHtml(x) || isJs(x)) && !x.startsWith('audit/') && !x.startsWith('tests/'))) {
    const s = ctx.read(f); const re = /\b(TODO|FIXME|XXX|HACK)\b|\/\/\s*임시\b/g; let m; const hits = [];
    while ((m = re.exec(s))) hits.push(lineOf(s, m.index));
    if (hits.length) ctx.add({ rule: 'r14', severity: 'low', file: f, line: hits[0], msg: `미완 표식 ${hits.length}곳 (${hits.slice(0, 5).join(', ')}줄)` });
  }
}},

/* r15 — 코드가 부르는 Supabase 표·뷰·RPC 가 sql/ 에 정의돼 있는지 */
{ id: 'r15', name: 'DB 참조 정합', run(ctx) {
  const sql = ctx.files().filter(x => x.startsWith('sql/') && x.endsWith('.sql')).map(ctx.read).join('\n');
  const defined = new Set(); let m;
  for (m of sql.matchAll(/create\s+(?:or\s+replace\s+)?(?:table|view|materialized\s+view)\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-z_][a-z0-9_]*)/gi)) defined.add(m[1].toLowerCase());
  const rpcs = new Set(); for (m of sql.matchAll(/create\s+or\s+replace\s+function\s+(?:public\.)?([a-z_][a-z0-9_]*)/gi)) rpcs.add(m[1].toLowerCase());
  const used = {}, usedRpc = {};
  for (const f of ctx.files().filter(x => (isHtml(x) || isJs(x)) && !x.startsWith('audit/') && !x.startsWith('tests/'))) {
    const s = ctx.read(f);
    for (m of s.matchAll(/\.from\(\s*['"]([a-z_][a-z0-9_]*)['"]\s*\)/g)) (used[m[1]] ||= new Set()).add(f);
    for (m of s.matchAll(/\.rpc\(\s*['"]([a-z_][a-z0-9_]*)['"]/g)) (usedRpc[m[1]] ||= new Set()).add(f);
  }
  for (const [t, fl] of Object.entries(used)) if (!defined.has(t)) ctx.add({ rule: 'r15', severity: 'mid', file: [...fl][0], msg: `코드가 \`${t}\` 표를 부르는데 sql/ 어디에도 정의가 없음 (Supabase 에 손으로 만든 표거나 이름 오타) — 쓰는 곳 ${fl.size}개` });
  for (const [t, fl] of Object.entries(usedRpc)) if (!rpcs.has(t)) ctx.add({ rule: 'r15', severity: 'mid', file: [...fl][0], msg: `코드가 RPC \`${t}\` 를 부르는데 sql/ 에 함수 정의가 없음 — 쓰는 곳 ${fl.size}개` });
}},

/* r16 — vercel.json 규약: trailingSlash 와 상대경로 자원 (디렉터리 index 가 아닌 파일에서 ./ 상대 자원은 안전, index.html 에서 ../ 도 안전 — 여기서는 rewrite/redirect 대상만) */
{ id: 'r16', name: 'vercel 설정', run(ctx) {
  if (!ctx.exists('vercel.json')) return;
  let v; try { v = JSON.parse(ctx.read('vercel.json')); } catch { ctx.add({ rule: 'r16', severity: 'high', file: 'vercel.json', msg: 'vercel.json 이 JSON 으로 읽히지 않음 — 배포가 깨진다' }); return; }
  for (const r of [...(v.rewrites || []), ...(v.redirects || [])]) { const d = r.destination || ''; if (d.startsWith('/') && !/[:*(]/.test(d)) { const x = ctx.resolveLink('vercel.json', d); if (!x.skip && !x.ok) ctx.add({ rule: 'r16', severity: 'high', file: 'vercel.json', msg: `rewrite/redirect 대상 \`${d}\` 없음` }); } }
}},

/* r20 — (선택) AI 검토: 최근 바뀐 학생 화면을 Claude 가 읽고 내용·수준·오탈자 의견을 냄. ANTHROPIC_API_KEY 없으면 조용히 건너뜀 */
{ id: 'r20', name: 'AI 내용 검토(선택)', run(ctx) {
  const key = process.env.ANTHROPIC_API_KEY; if (!key) return;
  let changed = []; try { changed = cp.execSync('git diff --name-only HEAD~1 HEAD', { cwd: ctx.ROOT }).toString().split('\n').filter(Boolean); } catch {}
  const targets = changed.filter(f => isHtml(f) && /^(grade\d|english|gifted|morning)\//.test(f) && ctx.exists(f)).slice(0, 4);
  if (!targets.length) return;
  const https = require('https');
  const call = body => new Promise((res, rej) => { const req = https.request({ hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' } }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }); req.on('error', rej); req.end(JSON.stringify(body)); });
  const deasync = p => { let done = false, val, err; p.then(v => { val = v; done = true; }, e => { err = e; done = true; }); while (!done) cp.spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},200)']); if (err) throw err; return val; };
  for (const f of targets) {
    const text = stripScripts(ctx.read(f)).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 12000);
    const body = { model: 'claude-sonnet-4-5', max_tokens: 800, messages: [{ role: 'user', content: `아래는 한국 초등학생 자기주도 학습 화면(${f})의 보이는 글자 전부다. 사실 오류·오탈자·학년 수준에 안 맞는 표현·정답 표기 모순만 찾아라. 문체·취향 지적은 금지. JSON 배열만 답하라: [{"sev":"high|mid|low","msg":"한 줄"}]. 문제 없으면 [].\n\n${text}` }] };
    let out; try { out = JSON.parse(deasync(call(body))); } catch (e) { ctx.add({ rule: 'r20', severity: 'low', file: f, msg: 'AI 검토 호출 실패: ' + String(e).slice(0, 100) }); continue; }
    const t = ((out.content || [])[0] || {}).text || '[]'; let arr = []; try { arr = JSON.parse(t.replace(/```json|```/g, '').trim()); } catch {}
    for (const it of arr.slice(0, 5)) ctx.add({ rule: 'r20', severity: ['high', 'mid', 'low'].includes(it.sev) ? (it.sev === 'high' ? 'mid' : it.sev) : 'low', file: f, msg: 'AI 의견: ' + String(it.msg).slice(0, 200) });
  }
}},

];

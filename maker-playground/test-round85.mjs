/* ============================================================
   test-round85.mjs — R85 /kmake→/maker 최종 리다이렉트 (구버전 은퇴)
   ① 은퇴 실행 — 진입 3곳(메인·초대장·카드)이 리다이렉트 스텁이고,
      각각 정확한 신 주소를 가리킨다 (메인→/maker/, invite→/maker/invite/, card→/maker/card/)
   ② 이중 안전망 — meta refresh(무JS)와 location.replace(JS, search+hash 보존)가 함께 있고,
      noscript 사용자를 위한 실제 <a> 링크도 있다
   ③ 스텁 자립성 — 외부 스크립트 로드 0, 구 편집기 번들 참조 0, CDN 의존 0
   ④ 생존자 보존 — viewer.html은 무변(공유 링크 /kmake/viewer.html#c= 계약),
      viewer가 기대는 상대경로 자산(motion.js)도 생존
   ⑤ 착지점 실존 — /maker 3페이지가 살아 있고 /kmake 링크 잔존 0
   ⑥ jsdom 실행 — 스텁의 인라인 스크립트를 실제로 실행해
      location.replace가 정확한 대상(search·hash 포함)으로 호출됨을 검증
   ⑦ 사이트 회귀 — 진입 3곳(메인·teacher·hub2)은 여전히 /maker만 가리키고,
      boxbar 분류(/kmake·/maker → kmake)는 무변
   ============================================================ */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const site = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const exists = (p) => fs.existsSync(path.join(__dirname, '..', p));
let pass = 0, fail = 0;
const t = (name, ok, why) => { if (ok) { pass++; } else { fail++; console.log('  ✗', name, why ? '— ' + why : ''); } };

const STUBS = [
  ['메인', 'kmake/index.html', '/maker/'],
  ['초대장', 'kmake/invite/index.html', '/maker/invite/'],
  ['마음 카드', 'kmake/card/index.html', '/maker/card/'],
];

console.log('R85 ① 은퇴 실행 — 진입 3곳이 정확한 신 주소를 가리킨다');
for (const [name, p, target] of STUBS) {
  const src = site(p);
  t(`${name} 리다이렉트 마커`, src.includes('data-r85-redirect'));
  t(`${name} meta refresh → ${target}`, src.includes(`http-equiv="refresh"`) && src.includes(`content="0;url=${target}"`));
  t(`${name} JS replace → ${target}`, src.includes(`location.replace('${target}'`));
}

console.log('R85 ② 이중 안전망 — 무JS·JS·수동 링크 3중');
for (const [name, p, target] of STUBS) {
  const src = site(p);
  t(`${name} search+hash 보존식`, src.includes('location.search + location.hash'));
  t(`${name} 수동 <a> 링크`, src.includes(`<a href="${target}"`));
}

console.log('R85 ③ 스텁 자립성 — 외부 의존 0');
{
  const OLD_BUNDLE = ['kmake.js', 'templates.js', 'p0.js', 'p0_core.js', 'scene.js', 'motion.js', 'photo.js', 'video.js', 'merge.js', 'materials.js', 'icons.js', 'shapes.js', 'backgrounds.js'];
  for (const [name, p] of STUBS) {
    const src = site(p);
    t(`${name} 외부 스크립트 로드 0`, !/<script[^>]*\ssrc=/.test(src), '외부 <script src> 발견');
    t(`${name} 구 번들 참조 0`, !OLD_BUNDLE.some((b) => src.includes(b)));
    t(`${name} CDN 의존 0`, !src.includes('cdn.jsdelivr.net') && !src.includes('fonts.googleapis.com'));
  }
}

console.log('R85 ④ 생존자 보존 — 공유 뷰어는 은퇴하지 않는다');
{
  const v = site('kmake/viewer.html');
  t('viewer.html 생존·무변(마커 0)', !v.includes('data-r85-redirect'));
  t('viewer.html 뷰어 실체 유지', v.includes('카드가 도착했어요'));
  t('viewer 의존 motion.js 생존', exists('kmake/motion.js'));
  t('공유 URL 계약 문서 생존 (kmake.js)', exists('kmake/kmake.js') && site('kmake/kmake.js').includes("/kmake/viewer.html#c="));
}

console.log('R85 ⑤ 착지점 실존 — /maker 3페이지 + /kmake 링크 잔존 0');
for (const [name, p] of [['제품 홈', 'maker/index.html'], ['초대장 이주본', 'maker/invite/index.html'], ['카드 이주본', 'maker/card/index.html']]) {
  t(`${name} 존재`, exists(p));
  t(`${name} /kmake/ 앵커 잔존 0`, !site(p).includes('href="/kmake/'));
}

console.log('R85 ⑥ jsdom 실행 — replace가 실제로 정확히 불린다');
for (const [name, p, target] of STUBS) {
  const src = site(p);
  const m = src.match(/<script data-r85-redirect>([\s\S]*?)<\/script>/);
  t(`${name} 인라인 스크립트 추출`, !!m);
  if (m) {
    let calledWith = null;
    const location = { search: '?a=1', hash: '#h', replace: (u) => { calledWith = u; } };
    try { new Function('location', m[1])(location); } catch (e) { /* fall through */ }
    t(`${name} replace(${target}?a=1#h)`, calledWith === `${target}?a=1#h`, `호출값: ${calledWith}`);
  }
}

console.log('R85 ⑦ 사이트 회귀 — 진입로·분류 무변 (R79 계승)');
{
  for (const f of ['index.html', 'teacher/index.html', 'hub2/index.html']) {
    const src = site(f);
    t(`${f} → /maker/ 유지`, src.includes('href="/maker/"'));
    t(`${f} → /kmake/ 링크 0`, !src.includes('href="/kmake/"'));
  }
  const bx = site('kedu_boxbar.js');
  t('boxbar /kmake 분류 유지 (구 URL 열람 기록 호환)', /\/\^\\\/kmake\\\/\/\.test\(p\)\) return 'kmake'/.test(bx));
  t('boxbar /maker 분류 유지', /\/\^\\\/maker\\\/\/\.test\(p\)\) return 'kmake'/.test(bx));
}

console.log(`\nR85 결과: ${pass}/${pass + fail}${fail ? ' — 실패 ' + fail : ' ALL PASS'}`);
process.exit(fail ? 1 : 0);

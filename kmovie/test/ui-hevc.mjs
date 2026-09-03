// 케이무비 HEVC(H.265) 가져오기 — 디먹스 단계에서 무조건 거절하던 것을 걷어내고
// hvcC description 을 만들어 VideoDecoder.isConfigSupported 에 맡기는 경로 검증.
// 이 환경(Electron/리눅스 xvfb)엔 HEVC 하드웨어 디코더가 없는 게 보통이라 두 가지 결과 중 하나를 통과로 본다:
//   (A) 지원됨 → 파일이 열리고 프레임 0 이 그려짐 (준호 갤럭시·Windows 크롬이 이 길)
//   (B) 미지원 → 예전 "브라우저판에서 못 읽어요" 가 아니라 새 안내(하드웨어 디코더 없음) 로 거절
// 준비: bash make-fixtures.sh (fx/hevc.mp4) · npm i
// 실행: KMV_ELECTRON=<electron> xvfb-run node test/ui-hevc.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8791);
const FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const { page, close } = await launch({ width: 1500, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text() + ' @' + (m.location() && m.location().url)); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/fonts.googleapis.com/**', route => route.fulfill({ body: '', contentType: 'text/css' }));
await page.route('**/cdn.jsdelivr.net/**', route => route.fulfill({ body: '', contentType: /\.css/.test(route.request().url()) ? 'text/css' : 'application/javascript' }));   // 차단망 — supabase·프리텐다드 CSS 는 비움
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI);

// ---------- 안내문 ----------
ok(await page.evaluate(() => document.getElementById('empty').textContent.includes('HEVC')), '빈 화면 안내문에 HEVC');

// ---------- 가져오기: 열리거나(A) 새 안내로 거절(B) ----------
await page.evaluate(() => { window.__toasts = []; const t = document.getElementById('toast'); if (t) new MutationObserver(() => { if (t.textContent) window.__toasts.push(t.textContent); }).observe(t, { childList: true, characterData: true, subtree: true }); });
const sup = await page.evaluate(async () => {
  // 디먹스가 hvcC 로 무엇을 만드는지 먼저 본다 (open 과 같은 경로: demuxLazy → isConfigSupported)
  const r = await fetch('/kmovie/test/fx/hevc.mp4'); const f = new File([await r.blob()], 'hevc.mp4', { type: 'video/mp4' });
  try {
    const meta = await KMV_MEDIA.open(f, null, () => {});
    const s = KMV_MEDIA.get(meta.id);
    return { opened: true, codec: s.codec, desc: s.desc ? Array.from(s.desc.slice(0, 4)) : null, frames: s.frames, w: s.w, h: s.h, id: meta.id };
  } catch (e) { return { opened: false, msg: String(e.message || e) }; }
});
if (sup.opened) {
  ok(/^hvc1\./.test(sup.codec), '코덱 문자열 hvc1.* (' + sup.codec + ')');
  ok(sup.desc && sup.desc[0] === 1, 'hvcC description 있음 (configurationVersion=1)');
  ok(sup.frames === 90 && sup.w === 640 && sup.h === 360, '샘플 표 90장 · 640×360');
  const px = await page.evaluate(async id => {
    const s = KMV_MEDIA.get(id); const f = await s.getFrame(0); if (!f) return null;
    const cv = new OffscreenCanvas(32, 18), ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.drawImage(f, 0, 0, 32, 18);
    const d = ctx.getImageData(0, 0, 32, 18).data; let sum = 0; for (let i = 0; i < d.length; i += 4) sum += d[i] + d[i + 1] + d[i + 2]; return sum / (d.length / 4);
  }, sup.id);
  ok(px != null && px > 30, '(A) 하드웨어 디코더 있음 — 프레임 0 그려짐 (' + (px | 0) + ')');
} else {
  ok(/HEVC/.test(sup.msg) && /하드웨어 디코더/.test(sup.msg), '(B) 하드웨어 디코더 없음 — 새 안내로 거절: ' + sup.msg.slice(0, 60));
  ok(!/브라우저판에서 못 읽어요/.test(sup.msg), '예전 문구(디먹스 단계 무조건 거절) 아님');
  ok(/hvc1\./.test(sup.msg), '안내에 코덱 문자열 포함(hvc1.*)');
  // 이 문구는 isConfigSupported 뒤에서만 나온다 — 그 앞의 "hvcC 를 찾지 못했어요" 가 아니므로 hvcC description 이 만들어졌다는 뜻
  ok(!/hvcC/.test(sup.msg), 'hvcC description 생성됨 (설정 없음 오류 아님)');
}

// ---------- 시험 디코드(probeDecode): H.264 첫 키프레임은 true, 깨진 바이트는 false(4초 안) ----------
const pr = await page.evaluate(async () => {
  const r = await fetch('/kmovie/test/fx/aac.mp4'); const f = new File([await r.blob()], 'aac.mp4', { type: 'video/mp4' });
  const dm = await KMV_MEDIA._demuxLazy(f);
  const cfg = { codec: dm.codec, codedWidth: dm.w, codedHeight: dm.h, description: dm.desc };
  const t0 = performance.now(); const good = await KMV_MEDIA._probe(dm, cfg); const t1 = performance.now();
  const bad = { ...dm, samples: [{ is_sync: true, data: new Uint8Array(64) }] };
  const t2 = performance.now(); const b = await KMV_MEDIA._probe(bad, cfg); const t3 = performance.now();
  return { good, goodMs: t1 - t0, bad: b, badMs: t3 - t2 };
});
ok(pr.good === true, 'probeDecode: H.264 첫 키프레임 → true (' + (pr.goodMs | 0) + 'ms)');
ok(pr.bad === false && pr.badMs < 4500, 'probeDecode: 깨진 바이트 → false (' + (pr.badMs | 0) + 'ms)');

// ---------- 손가락: 부품 타일은 세로 스크롤 허용(touch-action pan-y), 끌기는 마우스만 ----------
const ta = await page.evaluate(() => { KMV_UI.tab && KMV_UI.tab('parts'); const el = document.querySelector('#partGrid .pc'); return el ? getComputedStyle(el).touchAction : null; });
ok(ta === 'pan-y', '부품 타일 touch-action pan-y (' + ta + ')');

// ---------- 회귀: H.264 는 그대로 ----------
const h264 = await page.evaluate(async () => {
  const r = await fetch('/kmovie/test/fx/aac.mp4'); const f = new File([await r.blob()], 'aac.mp4', { type: 'video/mp4' });
  try { const meta = await KMV_MEDIA.open(f, null, () => {}); const s = KMV_MEDIA.get(meta.id); return { opened: true, codec: s.codec, desc: !!s.desc }; }
  catch (e) { return { opened: false, msg: String(e.message || e) }; }
});
ok(h264.opened && /^avc1/.test(h264.codec) && h264.desc, 'H.264 회귀 — avcC 로 열림 (' + (h264.codec || h264.msg) + ')');

// ---------- 낯선 코덱은 여전히 코덱 이름과 함께 거절 ----------
ok(await page.evaluate(() => !!KMV_MEDIA.open), 'open 노출');
ok(errs.filter(e => !/hevc|HEVC/i.test(e)).length === 0, '콘솔 오류 0 (HEVC 안내 제외)' + (errs.length ? ' — ' + errs.slice(0, 2).join(' | ') : ''));

console.log(`\n${n - fail}/${n} 통과`); await close(); srv.kill(); process.exit(fail ? 1 : 0);

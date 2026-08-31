// 케이무비 받아쓰기 — KMV_STT(tidy·build 순수 계산) + 「🎙 받아쓰기」 UI 흐름(가짜 쉘 주입).
// 진짜 whisper 는 Rust 쪽 cargo test(가짜 whisper 스크립트)와 준호 PC 실검증 몫 — 여기는 그 결과가
// 자막 카드로 옮겨지는 길 전부를 검증한다.
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-stt.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8771);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules'), FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const { page, close } = await launch({ width: 1500, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'text/css' });
});
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KMV_STT);

// ---------- tidy: 잡음·다듬기 ----------
const tidy1 = await page.evaluate(() => KMV_STT.tidy([
  { t0: 0, t1: 1, text: ' [음악] ' },
  { t0: 1, t1: 2, text: '(박수)' },
  { t0: 2, t1: 3, text: '   ' },
  { t0: 3, t1: 5, text: ' ♪ 안녕하세요  여러분 ♪ ' },
  { t0: 6, t1: 7, text: '...' },
]));
ok(tidy1.length === 1 && tidy1[0].text === '안녕하세요 여러분', 'tidy — 잡음 표기·빈 구간 버리고 ♪·공백 다듬음 (' + JSON.stringify(tidy1) + ')');

// ---------- tidy: 짧은 조각 이웃에 합침 ----------
const tidy2 = await page.evaluate(() => ({
  fwd: KMV_STT.tidy([{ t0: 0, t1: 2, text: '오늘은' }, { t0: 2.1, t1: 2.4, text: '네' }]),
  back: KMV_STT.tidy([{ t0: 0, t1: 0.4, text: '자' }, { t0: 0.5, t1: 2.5, text: '시작해 볼까요' }]),
  far: KMV_STT.tidy([{ t0: 0, t1: 0.4, text: '네' }, { t0: 3, t1: 5, text: '다음은 과학실입니다' }]),
}));
ok(tidy2.fwd.length === 1 && tidy2.fwd[0].text === '오늘은 네' && Math.abs(tidy2.fwd[0].t1 - 2.4) < 1e-9, 'tidy — 짧은 조각을 앞 이웃에 (' + tidy2.fwd[0].text + ')');
ok(tidy2.back.length === 1 && tidy2.back[0].text === '자 시작해 볼까요' && Math.abs(tidy2.back[0].t0 - 0) < 1e-9, 'tidy — 앞 이웃이 없으면 뒤 이웃 앞에 (' + tidy2.back[0].text + ')');
ok(tidy2.far.length === 2, 'tidy — 틈이 멀면 안 합침 (짧아도 그대로 둠)');

// ---------- tidy: 긴 문장 나누기 ----------
const long = '우리 금성초등학교는 학생들이 스스로 배우고 함께 성장하는 행복한 배움터입니다 정말로요';
const tidy3 = await page.evaluate(t => KMV_STT.tidy([{ t0: 10, t1: 18, text: t }]), long);
ok(tidy3.length >= 2 && tidy3.every(s => s.text.length <= KMV_STT_MAX()), 'tidy — ' + long.length + '자 문장을 ' + tidy3.length + '조각으로 (전부 상한 이하)');
function KMV_STT_MAX() { return 36; }
ok(Math.abs(tidy3[0].t0 - 10) < 1e-9 && Math.abs(tidy3[tidy3.length - 1].t1 - 18) < 1e-9, 'tidy — 나눠도 전체 시간은 보존');
const propOK = tidy3.every((s, i) => i === 0 || s.t0 >= tidy3[i - 1].t1 - 1e-9);
ok(propOK, 'tidy — 나눈 조각 시간이 겹치지 않고 순서대로');

// ---------- build: 기본 매핑 (원본 초 → 타임라인 프레임) ----------
const b1 = await page.evaluate(() => KMV_STT.build(
  { m1: [{ t0: 2, t1: 4, text: '안녕하세요' }] },
  [{ media: 'm1', mfps: 30, in: 0, out: 300, at: 0, dur: 300 }], 30));
ok(b1.length === 1 && b1[0].at === 60 && b1[0].dur === 60 && b1[0].text === '안녕하세요', 'build — 2~4초 말 → 60프레임부터 60프레임 (' + JSON.stringify(b1[0]) + ')');

// ---------- build: 클립 트림에 맞춰 자름 + 꼬리 버림 ----------
const b2 = await page.evaluate(() => KMV_STT.build(
  { m1: [{ t0: 1, t1: 3, text: '앞이 잘린 말' }, { t0: 9.95, t1: 12, text: '살짝 걸친 말' }] },
  [{ media: 'm1', mfps: 30, in: 60, out: 300, at: 100, dur: 240 }], 30));
ok(b2.length === 1 && b2[0].at === 100 && b2[0].dur === 30, 'build — 클립 앞에서 잘린 말은 남은 만큼만 (at 100 · dur ' + b2[0].dur + ')');
ok(!b2.some(c => c.text === '살짝 걸친 말'), 'build — 0.2초도 안 겹치는 꼬리는 버림');

// ---------- build: 컷으로 나뉜 한 문장은 다시 하나로 ----------
const b3 = await page.evaluate(() => KMV_STT.build(
  { m1: [{ t0: 4, t1: 6, text: '이어지는 한 문장' }] },
  [{ media: 'm1', mfps: 30, in: 0, out: 150, at: 0, dur: 150 },
   { media: 'm1', mfps: 30, in: 150, out: 300, at: 150, dur: 150 }], 30));
ok(b3.length === 1 && b3[0].at === 120 && b3[0].dur === 60, 'build — 붙은 두 클립에 걸친 문장은 카드 하나로 (at ' + b3[0].at + ' · dur ' + b3[0].dur + ')');

// ---------- build: 속도 클립 — 타임라인 자리로 비례 ----------
const b4 = await page.evaluate(() => KMV_STT.build(
  { m1: [{ t0: 2, t1: 4, text: '느리게 나오는 말' }] },
  [{ media: 'm1', mfps: 30, in: 0, out: 300, at: 0, dur: 600 }], 30));  // 슬로 0.5× — dur 2배
ok(b4.length === 1 && b4[0].at === 120 && b4[0].dur === 120, 'build — 슬로 클립에선 자막도 2배 자리 (at 120 · dur 120)');

// ---------- build: 최소 길이 클램프 ----------
const b5 = await page.evaluate(() => KMV_STT.build(
  { m1: [{ t0: 1, t1: 1.25, text: '네' }] },
  [{ media: 'm1', mfps: 30, in: 0, out: 300, at: 0, dur: 300 }], 30));
ok(b5.length === 1 && b5[0].dur === 10, 'build — 아주 짧은 말도 최소 FPS/3 프레임 (dur ' + b5[0].dur + ')');

// ---------- UI: 브라우저(쉘 없음)에선 안내만 ----------
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
await page.evaluate(() => KMV_UI.tab('sub')); await page.click('#btnSubStt');
const toast1 = await page.evaluate(() => document.getElementById('toast').textContent);
ok(/데스크톱/.test(toast1) && (await page.evaluate(() => KMV_PROJECT.data.S.length)) === 0, 'UI — 쉘 없으면 데스크톱 안내 토스트, 카드 없음');

// ---------- UI: 가짜 쉘 주입 → 받아쓰기 → 카드 ----------
await page.evaluate(() => {
  window.__sttCalls = 0;
  KMV_SHELL.sttReady = () => true;
  KMV_SHELL.stt = async (m, hooks) => {
    window.__sttCalls++;
    hooks && hooks.progress && hooks.progress(0.5, '받아쓰는 중');
    return [
      { t0: 0.2, t1: 1.6, text: ' 안녕하세요 ' },
      { t0: 1.7, t1: 3.4, text: '금성초등학교입니다' },
      { t0: 3.5, t1: 4.2, text: '[음악]' },
    ];
  };
  KMV_PROJECT.data.media[0].origin = { kind: 'video', hash: 'fx-a' };
});
await page.evaluate(() => KMV_UI.tab('sub')); await page.click('#btnSubStt');
await page.waitForFunction(() => KMV_PROJECT.data.S.length > 0, null, { timeout: 15000 });
const st1 = await page.evaluate(() => ({ S: KMV_PROJECT.data.S.map(s => ({ text: s.text, at: s.at, dur: s.dur, style: s.style })), calls: window.__sttCalls, toast: document.getElementById('toast').textContent }));
ok(st1.S.length === 2, 'UI — 받아쓴 자막 2개 ([음악] 은 걸러짐): ' + JSON.stringify(st1.S.map(s => s.text)));
ok(st1.S[0].text === '안녕하세요' && st1.S[0].at === 6 && st1.S[0].dur === 42, 'UI — 첫 카드 자리·길이 정확 (at ' + st1.S[0].at + ' · dur ' + st1.S[0].dur + ')');
ok(st1.S.every(s => s.style === 'basic') && /자막 2개/.test(st1.toast), 'UI — 현재 자막 스타일 적용 + 개수 토스트');
ok(st1.calls === 1, 'UI — 원본 1개 = 받아쓰기 호출 1번');
const selOK = await page.evaluate(() => { const el = document.getElementById('subEdit'); return !el.classList.contains('hidden'); });
ok(selOK, 'UI — 첫 카드가 선택돼 편집 칸이 열림');

// ---------- UI: undo 한 번으로 전부 되돌림 ----------
await page.evaluate(() => KMV_PROJECT.undo());
ok((await page.evaluate(() => KMV_PROJECT.data.S.length)) === 0, 'UI — undo 한 번에 받아쓴 카드 전부 사라짐 (addManyS 커밋 1회)');
await page.evaluate(() => KMV_PROJECT.redo());
ok((await page.evaluate(() => KMV_PROJECT.data.S.length)) === 2, 'UI — redo 로 다시 살아남');

// ---------- UI: 소리 끈 클립은 받아쓰지 않음 ----------
await page.evaluate(() => { KMV_PROJECT.data.S = []; KMV_PROJECT.data.A1.forEach(a => a.vol = 0); });
await page.evaluate(() => KMV_UI.tab('sub')); await page.click('#btnSubStt');
await new Promise(r => setTimeout(r, 300));
const st2 = await page.evaluate(() => ({ S: KMV_PROJECT.data.S.length, toast: document.getElementById('toast').textContent }));
ok(st2.S === 0 && /현장음/.test(st2.toast), 'UI — 소리 전부 끄면 「현장음이 있는 클립이 없어요」');
await page.evaluate(() => { KMV_PROJECT.data.A1.forEach(a => a.vol = 1); });

// ---------- UI: 원본 연결 없는 파일은 건너뛰고 알림 ----------
await page.evaluate(() => { delete KMV_PROJECT.data.media[0].origin; });
await page.evaluate(() => KMV_UI.tab('sub')); await page.click('#btnSubStt');
await new Promise(r => setTimeout(r, 300));
const st3 = await page.evaluate(() => ({ S: KMV_PROJECT.data.S.length, toast: document.getElementById('toast').textContent }));
ok(st3.S === 0 && /원본 연결/.test(st3.toast), 'UI — origin 없는 파일은 건너뛰며 이유를 말함');

// ---------- 콘솔 오류 ----------
ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));

console.log(`\nui-stt: ${n - fail}/${n} 통과`);
srv.kill(); await close(); process.exit(fail ? 1 : 0);

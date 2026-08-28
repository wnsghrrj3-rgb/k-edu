// 케이무비 7.5단계 스트리밍 소리 검증 — 통 PCM(decodeAudioData) 없이 압축 샘플 + 구간 디코드.
// 정답지: 같은 파일을 decodeAudioData(예전 방식)로 푼 버퍼와 샘플 단위 비교.
// 준비: bash make-fixtures.sh (fx/au.mp4, fx/aac.mp4) · npm i mp4box@0.5.2 mp4-muxer@5.2.1
// 실행: node test/ui-audio.mjs  (KMV_ELECTRON=<electron> 이면 Electron — AAC 디코더까지 검증)
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8765);
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
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI);

// ---------- opus 30초: 가져오기 = 통 PCM 없음 ----------
await page.setInputFiles('#fileIn', [path.join(FX, 'au.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
const meta = await page.evaluate(() => {
  const m = KMV_PROJECT.data.media[0], s = KMV_MEDIA.get(m.id);
  return { audioFlag: m.audio, full: !!s.audio, pcm: !!s.pcm, dur: s.pcm ? s.pcm.durSec : -1 };
});
ok(meta.audioFlag && meta.pcm && !meta.full, '가져오기: 통 PCM 없음 · 스트리밍 pcm 사용 (audio=' + meta.audioFlag + ' full=' + meta.full + ')');
ok(Math.abs(meta.dur - 30) < 0.3, 'pcm 길이 ≈ 30초 (' + meta.dur.toFixed(2) + ')');

// ---------- 정답지: decodeAudioData(예전 방식) 와 샘플 비교 ----------
const cmp = await page.evaluate(async () => {
  const m = KMV_PROJECT.data.media[0], s = KMV_MEDIA.get(m.id), sr = 48000;
  const buf = await (await fetch('/kmovie/test/fx/au.mp4')).arrayBuffer();
  const ref = await new OfflineAudioContext(1, 1, sr).decodeAudioData(buf);
  await s.pcm.ensure(4.5, 6.5);
  const rd = s.pcm.read(5.0, Math.round(0.5 * sr));
  const a = rd.ch[0], b = ref.getChannelData(0);
  // ±16샘플 정렬 탐색 후 최대 오차
  let best = { off: 0, d: Infinity };
  for (let off = -16; off <= 16; off++) {
    let d = 0;
    for (let i = 0; i < a.length; i++) { const j = 5 * sr + i + off; const e = Math.abs(a[i] - (b[j] || 0)); if (e > d) d = e; }
    if (d < best.d) best = { off, d };
  }
  // 청크 경계(8초) 연속성
  await s.pcm.ensure(7, 9.5);
  const rb = s.pcm.read(7.9, Math.round(0.2 * sr)).ch[0];
  let step = 0; for (let i = 1; i < rb.length; i++) step = Math.max(step, Math.abs(rb[i] - rb[i - 1]));
  return { off: best.off, diff: best.d, sr: rd.sr, step };
});
ok(Math.abs(cmp.off) <= 4 && cmp.diff < 2e-3, '구간 디코드 = decodeAudioData 와 샘플 일치 (정렬 ' + cmp.off + '샘플, 최대 오차 ' + cmp.diff.toExponential(1) + ')');
ok(cmp.step < 0.09, '8초 청크 경계 이음매 없음 (최대 스텝 ' + cmp.step.toFixed(3) + ')');

// ---------- 파형(peaks): 스트리밍 패스 ----------
await page.waitForFunction(() => KMV_MEDIA.get(KMV_PROJECT.data.media[0].id).analyzed, null, { timeout: 120000 });
const pk = await page.evaluate(async () => {
  const m = KMV_PROJECT.data.media[0], s = KMV_MEDIA.get(m.id), sr = 48000;
  const buf = await (await fetch('/kmovie/test/fx/au.mp4')).arrayBuffer();
  const ref = await new OfflineAudioContext(1, 1, sr).decodeAudioData(buf);
  const d = ref.getChannelData(0); let acc = 0, c = 0;
  for (let i = 10 * sr; i < 10 * sr + 1600; i += 4) { acc += d[i] * d[i]; c++; }
  return { got: s.peaks ? s.peaks[300] : -1, want: Math.sqrt(acc / c) };
});
ok(pk.got > 0 && Math.abs(pk.got - pk.want) / pk.want < 0.2, '파형 RMS = 예전 방식과 일치 (' + pk.got.toFixed(3) + ' vs ' + pk.want.toFixed(3) + ')');

// ---------- renderMix: 창(15초) 단위 = 예전 한 방 렌더와 같은 소리 ----------
const mix = await page.evaluate(async () => {
  const sr = KMV_AUDIO.SR, total = KMV_PROJECT.total();
  const mixed = await KMV_AUDIO.renderMix(total);
  const buf = await (await fetch('/kmovie/test/fx/au.mp4')).arrayBuffer();
  const ref = await new OfflineAudioContext(1, 1, sr).decodeAudioData(buf);
  const a = mixed.getChannelData(0), b = ref.getChannelData(0);
  // 창 이음(15초) 앞뒤 1초: 정답지와 최대 오차 (클립 중간 — 페이드 없음, 볼륨 1)
  let d = 0; for (let i = Math.round(14.5 * sr); i < Math.round(15.5 * sr); i++) d = Math.max(d, Math.abs(a[i] - b[i]));
  // 이음 지점 스텝
  let step = 0; for (let i = Math.round(15 * sr) - 8; i < Math.round(15 * sr) + 8; i++) step = Math.max(step, Math.abs(a[i] - a[i - 1]));
  // onChunk 스트리밍 = 이어 붙인 결과와 동일
  const parts = []; await KMV_AUDIO.renderMix(total, (bf, f0) => { parts.push({ d: bf.getChannelData(0).slice(), f0 }); });
  let cd = 0, at = 0;
  for (const p of parts) { for (let i = 0; i < p.d.length; i++) cd = Math.max(cd, Math.abs(p.d[i] - a[at + i])); at += p.d.length; }
  return { len: mixed.length, want: Math.ceil(total / KMV_PROJECT.FPS * sr), diff: d, step, chunks: parts.length, chunkDiff: cd, lenSum: at };
});
ok(mix.len === mix.want, 'renderMix 길이 정확 (' + mix.len + ')');
ok(mix.diff < 3e-3, '창 이음 구간 = 원본과 일치 (최대 오차 ' + mix.diff.toExponential(1) + ')');
ok(mix.step < 0.09, '15초 창 이음 스텝 없음 (' + mix.step.toFixed(3) + ')');
ok(mix.chunks === 2 && mix.chunkDiff < 1e-4 && mix.lenSum === mix.len, 'onChunk 스트리밍 = 한 버퍼와 동일 (' + mix.chunks + '창, 오차 ' + mix.chunkDiff.toExponential(1) + ')');

// ---------- 재생 펌프: 창이 이어 붙는다 ----------
const live = await page.evaluate(async () => {
  KMV_AUDIO._tune({ win: 3, top: 2 });
  await KMV_AUDIO.play(0);
  const n0 = KMV_AUDIO.nodeCount();
  await new Promise(r => setTimeout(r, 4200));
  const n1 = KMV_AUDIO.nodeCount(), adv = KMV_AUDIO.now();
  const playing = KMV_AUDIO.isPlaying();
  KMV_AUDIO.stop();
  return { n0, n1, adv, playing, stopped: !KMV_AUDIO.isPlaying() };
});
ok(live.playing && live.n1 > live.n0, '재생 펌프: 다음 창 노드 이어 붙음 (' + live.n0 + '→' + live.n1 + ')');
ok(live.adv > 3 * 30 && live.stopped, '재생 시계 진행·정지 (now=' + Math.round(live.adv) + 'f)');

// ---------- 소스 모니터 재생(원본 소리) ----------
const srcp = await page.evaluate(async () => {
  const m = KMV_PROJECT.data.media[0];
  await KMV_AUDIO.playSource(m.id, 30);
  await new Promise(r => setTimeout(r, 1200));
  const adv = KMV_AUDIO.now(); KMV_AUDIO.stop();
  return { adv };
});
ok(srcp.adv > 50, '소스 재생 시계 진행 (' + Math.round(srcp.adv) + 'f)');

// ---------- AAC(H.264/AAC — AAC 디코더 있는 환경만): elst 프라이밍·싱크 ----------
const aacSup = await page.evaluate(async () => { try { return (await AudioDecoder.isConfigSupported({ codec: 'mp4a.40.2', sampleRate: 48000, numberOfChannels: 2 })).supported; } catch (e) { return false; } });
const h264Sup = await page.evaluate(async () => { try { return (await VideoDecoder.isConfigSupported({ codec: 'avc1.42001f', codedWidth: 320, codedHeight: 180 })).supported; } catch (e) { return false; } });
if (aacSup && h264Sup) {
  await page.setInputFiles('#fileIn', [path.join(FX, 'aac.mp4')]);
  await page.waitForFunction(() => KMV_PROJECT.data.media.length === 2, null, { timeout: 90000 });
  const aac = await page.evaluate(async () => {
    const m = KMV_PROJECT.data.media[1], s = KMV_MEDIA.get(m.id), sr = 48000;
    if (!s.pcm) return { pcm: false };
    const buf = await (await fetch('/kmovie/test/fx/aac.mp4')).arrayBuffer();
    const ref = await new OfflineAudioContext(1, 1, sr).decodeAudioData(buf);
    const find = (d, s0, s1) => { let bi = s0, bv = 0; for (let i = s0; i < s1; i++) { const v = Math.abs(d[i]); if (v > bv) { bv = v; bi = i; } } return bi / sr; };
    await s.pcm.ensure(1.5, 3.0);
    const rd = s.pcm.read(1.8, Math.round(0.5 * sr)).ch[0];
    const tNew = 1.8 + find(rd, 0, rd.length), tRef = find(ref.getChannelData(0), Math.round(1.8 * sr), Math.round(2.3 * sr));
    return { pcm: true, full: !!s.audio, tNew, tRef, d: Math.abs(tNew - tRef) };
  });
  ok(aac.pcm && !aac.full, 'AAC 원본도 스트리밍 pcm (통 PCM 없음)');
  ok(aac.d < 0.005, 'AAC 클릭 싱크 = 예전 방식과 일치 (차이 ' + (aac.d * 1000).toFixed(1) + 'ms, 클릭 t=' + aac.tNew.toFixed(3) + 's)');
} else console.log('  (이 환경엔 AAC/H.264 디코더가 없어 AAC 검사는 건너뜀 — 실크롬·Electron 에서 돈다)');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 2).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과${fail ? ' — 실패 ' + fail : ''}`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);

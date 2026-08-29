// 케이무비 9단계 — A2 음악 스트리밍화 검증. 마지막 통 디코드(decodeAudioData) 제거:
// mp3(프레임 파서+LAME 갭리스)·m4a(mp4box)·ADTS aac(프레임 파서)·wav(직독). ogg 는 폴백.
// 정답지: 같은 파일 decodeAudioData(예전 방식) 와 샘플·비트 비교.
// 준비: bash make-fixtures.sh · npm i (mp4box·mp4-muxer·electron·playwright-core)
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-music.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8767);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules'), FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
process.env.KMV_PORT = String(PORT);
const { page, close } = await launch({ width: 1500, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'text/css' });
});
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI);

ok(await page.evaluate(() => KMV_MEDIA.limits.maxSec === 60 * 60), '브라우저판 원본 상한 60분 (구간 읽기 후 상향)');

/* 파일 가져와서 소스 상태 + 정답지 비교를 돌려주는 공용 페이지 함수 */
const importMusic = async file => {
  await page.setInputFiles('#fileIn', [path.join(FX, file)]);
  return page.evaluate(async fname => {
    await new Promise((res, rej) => { const t0 = performance.now(); const iv = setInterval(() => { const m = KMV_PROJECT.data.media.find(x => x.name === fname); if (m && KMV_MEDIA.get(m.id)) { clearInterval(iv); res(); } else if (performance.now() - t0 > 60000) { clearInterval(iv); rej(new Error('import timeout')); } }, 100); });
    const m = KMV_PROJECT.data.media.find(x => x.name === fname), s = KMV_MEDIA.get(m.id);
    return { id: m.id, pcm: !!s.pcm, full: !!s.audio, dur: s.pcm ? s.pcm.durSec : (s.audio ? s.audio.duration : -1) };
  }, file);
};
/* pcm.read 를 decodeAudioData 정답지와 정렬 탐색 후 비교 */
const cmpRead = (id, file, t0, sec, search) => page.evaluate(async o => {
  const s = KMV_MEDIA.get(o.id);
  const buf = await (await fetch('/kmovie/test/fx/' + o.file)).arrayBuffer();
  await s.pcm.ensure(o.t0 - 0.2, o.t0 + o.sec + 0.2);
  const sr = s.pcm.sr || s.pcm.cfgSr;
  const ref2 = await new OfflineAudioContext(1, 1, sr).decodeAudioData(buf);   // pcm 과 같은 sr 로 풀어 리샘플 없이 비교
  const nS = Math.round(o.sec * sr), rd = s.pcm.read(o.t0, nS);
  const a = rd.ch[0], b = ref2.getChannelData(0), base = Math.round(o.t0 * sr);
  let best = { off: 0, d: Infinity };
  for (let off = -o.search; off <= o.search; off++) {
    let d = 0;
    for (let i = 0; i < nS; i += 3) { const e = Math.abs(a[i] - (b[base + i + off] || 0)); if (e > d) { d = e; if (d > best.d) break; } }
    if (d < best.d) best = { off, d };
  }
  return { off: best.off, diff: best.d, sr, refSr: ref2.sampleRate };
}, { id, file, t0, sec, search });
/* 분석(파형·비트) 완료 대기 후 비트 + 폴백 정답지 비트 */
const beatsOf = (id, file) => page.evaluate(async o => {
  await new Promise((res, rej) => { const t0 = performance.now(); const iv = setInterval(() => { if (KMV_MEDIA.get(o.id).analyzed) { clearInterval(iv); res(); } else if (performance.now() - t0 > 120000) { clearInterval(iv); rej(new Error('analyze timeout')); } }, 150); });
  const s = KMV_MEDIA.get(o.id);
  const buf = await (await fetch('/kmovie/test/fx/' + o.file)).arrayBuffer();
  const ref = await new OfflineAudioContext(1, 1, 48000).decodeAudioData(buf);
  const want = KMV_AUDIO.beats(ref);
  const pk = s.peaks; let pkMax = 0; for (const v of pk) pkMax = Math.max(pkMax, v);
  return { got: Array.from(s.beats || []), want, pkMax };
}, { id, file });
const gridOK = (bs, step) => { if (bs.length < 10) return false; let bad = 0; for (let i = 1; i < bs.length; i++) { const d = (bs[i] - bs[i - 1]) % step; if (Math.min(d, step - d) > 0.06) bad++; } return bad <= bs.length * 0.15; };

// ---------- mp3 (프레임 파서 + LAME 갭리스) ----------
const mp3 = await importMusic('music.mp3');
ok(mp3.pcm && !mp3.full, 'mp3: 통 PCM 없음 · 스트리밍 pcm (pcm=' + mp3.pcm + ' full=' + mp3.full + ')');
ok(Math.abs(mp3.dur - 24) < 0.25, 'mp3: pcm 길이 ≈ 24초 (' + mp3.dur.toFixed(2) + ')');
const mc = await cmpRead(mp3.id, 'music.mp3', 5.1, 0.5, 2400);
ok(Math.abs(mc.off) <= 96 && mc.diff < 3e-3, 'mp3: 구간 디코드 = decodeAudioData (LAME 갭리스 정렬 ' + mc.off + '샘플, 오차 ' + mc.diff.toExponential(1) + ')');
const mb = await beatsOf(mp3.id, 'music.mp3');
ok(mb.pkMax > 0.02, 'mp3: 스트리밍 파형 생성 (peak ' + mb.pkMax.toFixed(3) + ')');
ok(gridOK(mb.got, 0.5), 'mp3: 스트리밍 비트가 0.5초 격자 (' + mb.got.length + '개)');
ok(Math.abs(mb.got.length - mb.want.length) <= 3, 'mp3: 비트 개수 = 통 버퍼 방식과 일치 (' + mb.got.length + ' vs ' + mb.want.length + ')');

// ---------- wav (직독) ----------
const wav = await importMusic('music.wav');
ok(wav.pcm && !wav.full && Math.abs(wav.dur - 24) < 0.05, 'wav: 직독 pcm · 길이 ≈ 24초 (' + wav.dur.toFixed(2) + ')');
const wc = await cmpRead(wav.id, 'music.wav', 7.3, 0.5, 8);
ok(wc.off === 0 && wc.diff < 5e-5, 'wav: 직독 = decodeAudioData (16bit 반올림 차 이내, 오차 ' + wc.diff.toExponential(1) + ')');
const wb = await beatsOf(wav.id, 'music.wav');
ok(gridOK(wb.got, 0.5) && Math.abs(wb.got.length - wb.want.length) <= 3, 'wav: 비트 = 통 버퍼 방식과 일치 (' + wb.got.length + ' vs ' + wb.want.length + ')');

// ---------- m4a (mp4box 디먹스 — elst 프라이밍) ----------
const m4a = await importMusic('music.m4a');
ok(m4a.pcm && !m4a.full && Math.abs(m4a.dur - 24) < 0.3, 'm4a: 스트리밍 pcm · 길이 ≈ 24초 (' + m4a.dur.toFixed(2) + ')');
const ac = await cmpRead(m4a.id, 'music.m4a', 5.1, 0.5, 64);
ok(Math.abs(ac.off) <= 8 && ac.diff < 3e-3, 'm4a: 구간 디코드 = decodeAudioData (elst 정렬 ' + ac.off + '샘플, 오차 ' + ac.diff.toExponential(1) + ')');
const ab = await beatsOf(m4a.id, 'music.m4a');
ok(gridOK(ab.got, 0.5), 'm4a: 스트리밍 비트가 0.5초 격자 (' + ab.got.length + '개)');

// ---------- ADTS .aac (프레임 파서 — 갭리스 정보 없음, 정렬 허용) ----------
const adts = await importMusic('music.aac');
ok(adts.pcm && !adts.full, 'aac(ADTS): 스트리밍 pcm (pcm=' + adts.pcm + ')');
const dc = await cmpRead(adts.id, 'music.aac', 5.1, 0.5, 4200);
ok(Math.abs(dc.off) <= 4200 && dc.diff < 3e-3, 'aac(ADTS): 정렬 후 샘플 일치 (오프셋 ' + dc.off + '샘플, 오차 ' + dc.diff.toExponential(1) + ')');

// ---------- ogg (폴백 — 예전 통 디코드) ----------
const ogg = await importMusic('music.ogg');
ok(!ogg.pcm && ogg.full && Math.abs(ogg.dur - 24) < 0.3, 'ogg: 통 디코드 폴백 그대로 동작 (full=' + ogg.full + ')');
const ob = await beatsOf(ogg.id, 'music.ogg');
ok(gridOK(ob.got, 0.5), 'ogg: 폴백 비트 정상 (' + ob.got.length + '개)');

// ---------- A2 카드: 사진 타임라인 위 mp3 — 스트리밍 믹스 = 정답지 ----------
const mix = await page.evaluate(async mp3Id => {
  // 사진 대신 8초짜리 무음 캔버스 이미지 미디어를 흉내내기 어렵다 — 기존 addClip 에 쓸 이미지를 만든다
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 36;
  const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
  const meta = await KMV_MEDIA.open(new File([blob], 'bg.png', { type: 'image/png' }), undefined);
  KMV_PROJECT.data.media.push(meta);
  const c = KMV_PROJECT.addClip(meta.id); KMV_PROJECT.trim(c.id, 'out', 240);       // 8초
  for (const x of KMV_PROJECT.data.A2.slice()) KMV_PROJECT.removeA2(x.id);          // 가져오기가 자동으로 놓은 카드 제거
  KMV_PROJECT.addA2(mp3Id, 0);
  const sr = KMV_AUDIO.SR, total = KMV_PROJECT.total();
  const whole = await KMV_AUDIO.renderMix(total);
  const parts = []; await KMV_AUDIO.renderMix(total, async b => parts.push(b));
  const buf = await (await fetch('/kmovie/test/fx/music.mp3')).arrayBuffer();
  const ref = await new OfflineAudioContext(1, Math.ceil(25 * sr), sr).decodeAudioData(buf);
  const a = whole.getChannelData(0), b = ref.getChannelData(0);
  // 페이드 창 밖(1.2s~2.8s): 정답지와 정렬 탐색 비교
  let best = Infinity, s0 = Math.round(1.2 * sr), nS = Math.round(1.6 * sr);
  for (let off = -128; off <= 128; off++) { let d = 0; for (let i = 0; i < nS; i += 5) { const e = Math.abs(a[s0 + i] - (b[s0 + i + off] || 0)); if (e > d) { d = e; if (d > best) break; } } if (d < best) best = d; }
  // 창 조각 이음 = 통 버퍼와 동일
  let at = 0, dj = 0;
  for (const p of parts) { const pa = p.getChannelData(0); for (let i = 0; i < pa.length; i += 7) dj = Math.max(dj, Math.abs(pa[i] - a[at + i])); at += p.length; }
  // 페이드 인 동작: 0.1s 지점 진폭 < 1.5s 지점 진폭
  const rms = (from, sec) => { let acc = 0, c2 = 0; for (let i = Math.round(from * sr); i < Math.round((from + sec) * sr); i += 4) { acc += a[i] * a[i]; c2++; } return Math.sqrt(acc / c2); };
  return { diff: best, chunkDiff: dj, early: rms(0.05, 0.2), mid: rms(1.4, 0.4), fps: KMV_PROJECT.FPS };
}, mp3.id);
ok(mix.diff < 4e-3, 'A2 믹스(스트리밍) = decodeAudioData 정답지 (페이드 밖 오차 ' + mix.diff.toExponential(1) + ')');
ok(mix.chunkDiff < 1e-6, 'renderMix 15초 창 조각 = 통 버퍼와 동일 (오차 ' + mix.chunkDiff.toExponential(1) + ')');
ok(mix.early < mix.mid * 0.7, 'A2 기본 페이드 인 동작 (0.1s ' + mix.early.toFixed(3) + ' < 1.5s ' + mix.mid.toFixed(3) + ')');

// ---------- 재생 펌프에 A2 pcm 포함 ----------
const play = await page.evaluate(async () => {
  await KMV_AUDIO.play(0);
  await new Promise(r => setTimeout(r, 700));
  const adv = KMV_AUDIO.now(), nn = KMV_AUDIO.nodeCount();
  KMV_AUDIO.stop();
  return { adv, nn };
});
ok(play.adv > 5 && play.nn > 0, '재생: A2(스트리밍) 포함 시계 진행 (' + play.adv.toFixed(1) + 'f, 노드 ' + play.nn + ')');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);

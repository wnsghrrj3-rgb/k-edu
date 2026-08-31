// 케이무비 — 생성 배경음악(KMV_GEN)·효과음(KMV_SFX) 검증. 설계 v1 §2·§3 순서 1.
// 핵심 정답지: ① 결정성(같은 스펙 = 같은 샘플, 창을 어떻게 나눠 읽어도 같음)
//              ② 비트 격자가 BPM 그대로 ③ A2 경로(펌프·믹스·페이드·덕킹)를 그대로 탄다
//              ④ 효과음이 전환·부품·자막에 붙고 믹스에 실린다 ⑤ 새로고침 복원이 스펙만으로 된다
// 준비: bash make-fixtures.sh · npm i
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-gen.mjs
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
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI);

/* ---------- 1. 악보(plan) 수학 ---------- */
const pl = await page.evaluate(() => {
  const a = KMV_GEN.plan({ mood: 'morning', bpm: 92, key: 'C', seed: 1, durSec: 60 });
  const b = KMV_GEN.plan({ mood: 'morning', bpm: 92, key: 'C', seed: 1, durSec: 60 });
  const c = KMV_GEN.plan({ mood: 'morning', bpm: 92, key: 'C', seed: 2, durSec: 60 });
  const e = KMV_GEN.plan({ mood: 'ending', bpm: 64, key: 'A', seed: 1, durSec: 40 });
  const clamped = KMV_GEN.plan({ mood: 'morning', bpm: 300, key: 'C', seed: 1, durSec: 60 });
  const sorted = a.notes.every((x, i) => !i || x.t >= a.notes[i - 1].t);
  const insts = [...new Set(a.notes.map(x => x.inst))].sort();
  return {
    bars: a.bars, bpm: a.bpm, dur: a.durSec, notes: a.notes.length, sorted, insts,
    same: JSON.stringify(a.notes) === JSON.stringify(b.notes),
    diff: JSON.stringify(a.notes) !== JSON.stringify(c.notes),
    beat0: a.beats[0], beat1: a.beats[1], beatN: a.beats.length,
    endingNotes: e.notes.length, endingInsts: [...new Set(e.notes.map(x => x.inst))].sort(),
    clampBpm: clamped.bpm, moods: KMV_GEN.MOODS.length,
    lastPad: e.notes.filter(x => x.inst === 'pad').slice(-1)[0].dur,
  };
});
ok(pl.moods === 6, '무드 6종 (아침 교실·차분한 소개·설렘·따뜻한·활기·잔잔한 엔딩)');
ok(pl.bars >= 23 && pl.bars <= 24 && Math.abs(pl.dur - 60) < 5, `60초 요청 → ${pl.bars}마디 · ${pl.dur.toFixed(1)}초`);
ok(pl.same, '결정적 — 같은 스펙이면 악보가 같다');
ok(pl.diff, 'seed 를 바꾸면 악보가 달라진다(다시 섞기)');
ok(pl.sorted && pl.notes > 200, `음이 시각순 정렬 · ${pl.notes}개`);
ok(pl.insts.join() === 'bass,bell,pad,piano,shaker', '아침 교실 악기 = 피아노·패드·베이스·셰이커·벨');
ok(pl.endingInsts.join() === 'bass,bell,pad,piano' && pl.endingNotes > 40, '잔잔한 엔딩은 드럼 없음(피아노·패드·베이스·벨)');
ok(Math.abs(pl.beat1 - pl.beat0 - 60 / 92) < 1e-9 && pl.beatN > 90, `비트 격자 = BPM 그대로 (${(60 / 92).toFixed(4)}초 간격 · ${pl.beatN}개)`);
ok(pl.clampBpm === 104, 'BPM 은 무드 범위로 묶인다 (300 → 104)');
ok(pl.lastPad > 6, '엔딩 마지막 화음은 길게 남는다');

/* ---------- 2. 소스 읽기 — 결정성·창 나눔·무음 아님 ---------- */
const rd = await page.evaluate(() => {
  const sp = { mood: 'morning', bpm: 92, key: 'C', seed: 1, durSec: 30 };
  const s1 = KMV_GEN.source(sp), s2 = KMV_GEN.source(sp);
  const sr = s1.sr, N = sr * 2;                       // 5.0초부터 2초
  const a = s1.read(5, N), b = s2.read(5, N);
  let dmax = 0; for (let i = 0; i < N; i++) dmax = Math.max(dmax, Math.abs(a.ch[0][i] - b.ch[0][i]));
  // 같은 구간을 4조각으로 나눠 읽어도 통으로 읽은 것과 같아야 한다(창 펌프가 이렇게 부른다)
  const s3 = KMV_GEN.source(sp); let pmax = 0;
  for (let k = 0; k < 4; k++) {
    const part = s3.read(5 + k * 0.5, sr * 0.5);
    for (let i = 0; i < sr * 0.5; i++) pmax = Math.max(pmax, Math.abs(part.ch[0][i] - a.ch[0][k * sr * 0.5 + i]));
  }
  let rms = 0, peak = 0; for (let i = 0; i < N; i++) { rms += a.ch[0][i] * a.ch[0][i]; peak = Math.max(peak, Math.abs(a.ch[0][i])); }
  rms = Math.sqrt(rms / N);
  const st = s1.read(5, N); let dLR = 0; for (let i = 0; i < N; i++) dLR = Math.max(dLR, Math.abs(st.ch[0][i] - st.ch[1][i]));
  // 끝을 넘어선 구간은 조용
  const tail = s1.read(s1.durSec + 1, sr); let tmax = 0; for (let i = 0; i < sr; i++) tmax = Math.max(tmax, Math.abs(tail.ch[0][i]));
  const pk = s1.peaks(30);
  return { dmax, pmax, rms, peak, dLR, tmax, sr, peaksLen: pk.length, peaksMax: Math.max(...pk), durSec: s1.durSec };
});
ok(rd.dmax === 0, '같은 스펙 두 소스의 샘플이 완전히 같다 (오차 0)');
ok(rd.pmax === 0, '0.5초씩 4번 나눠 읽어도 통으로 읽은 것과 오차 0 (창 경계 이음매 없음)');
ok(rd.rms > 0.02 && rd.peak < 1.0, `소리가 실제로 난다 — RMS ${rd.rms.toFixed(3)} · 피크 ${rd.peak.toFixed(3)} (클리핑 없음)`);
ok(rd.dLR > 0, '좌우가 다르다(팬 적용)');
ok(rd.tmax < 1e-6, '끝을 넘어선 구간은 무음');
ok(rd.peaksLen === Math.round(rd.durSec * 30) && rd.peaksMax > 0.3, `파형 근사 ${rd.peaksLen}프레임 (A2 카드용)`);

/* 전 무드 — 악보가 나오고, 소리가 나고, 유한하고, 클리핑 없음 */
const allM = await page.evaluate(() => KMV_GEN.MOODS.map(m => {
  const sp = { mood: m.id, bpm: m.bpm.def, key: m.keys[0], seed: 1, durSec: 40 }, pl = KMV_GEN.plan(sp), src = KMV_GEN.source(sp), n = src.sr * 3, r = src.read(8, n);
  let rms = 0, peak = 0, fin = true; for (let i = 0; i < n; i++) { const v = r.ch[0][i]; if (!isFinite(v)) fin = false; rms += v * v; peak = Math.max(peak, Math.abs(v)); }
  return { id: m.id, notes: pl.notes.length, insts: [...new Set(pl.notes.map(x => x.inst))].length, rms: Math.sqrt(rms / n), peak, fin, bpm: pl.bpm, beats: pl.beats.length };
}));
for (const m of allM) ok(m.notes > 60 && m.insts >= 3 && m.fin && m.rms > 0.02 && m.peak < 1, `무드 ${m.id} — 음 ${m.notes}개·악기 ${m.insts}·RMS ${m.rms.toFixed(3)}·피크 ${m.peak.toFixed(2)}·${m.bpm}BPM`);

/* ---------- 3. UI — 놓기·A2 카드·비트 ---------- */
await page.evaluate(() => { document.getElementById('genLenSeg').querySelector('[data-k="60"]').click(); });
await page.evaluate(() => KMV_UI.tab('music')); await page.click('#btnGenPlace');
const placed = await page.evaluate(() => {
  const D = KMV_PROJECT.data, a = D.A2[0], m = KMV_PROJECT.media(a.media), s = KMV_MEDIA.get(a.media);
  return { n: D.A2.length, gen: !!m.gen, kind: m.kind, name: m.name, dur: a.out - a.in, fadeIn: a.fadeIn, fadeOut: a.fadeOut,
    beats: s.beats.length, analyzed: s.analyzed, peaks: !!s.peaks, uiBeats: KMV_UI.beatFrames().length, id: a.id,
    binHas: !!document.querySelector('#bin') && /배경음악/.test(document.getElementById('bin').textContent) };
});
ok(placed.n === 1 && placed.gen && placed.kind === 'audio', '놓기 → A2 카드 1장 + gen 미디어');
ok(/배경음악 · 아침 교실/.test(placed.name) && placed.binHas, '보관함에 「배경음악 · 아침 교실」로 보인다');
ok(placed.dur >= 60 * 30 && placed.dur <= 70 * 30, `1분 요청 → 카드 ${(placed.dur / 30).toFixed(1)}초`);
ok(placed.analyzed && placed.peaks && placed.beats > 80, `분석 없이 바로 완성 — 비트 ${placed.beats}개·파형 있음`);
ok(placed.uiBeats > 80, `타임라인 비트 격자 ${placed.uiBeats}개 (박자 스냅·몽타주가 쓰는 것)`);

/* 페이드·볼륨·트림 = 기존 A2 연산 그대로 */
const a2ops = await page.evaluate(id => {
  KMV_PROJECT.updateA2(id, { fadeIn: 60, vol: 0.5 });
  const a = KMV_PROJECT.a2(id), f1 = a.fadeIn, v = a.vol;
  KMV_PROJECT.trimA2(id, 'out', a.at + 300);
  const len = KMV_PROJECT.a2(id).out - KMV_PROJECT.a2(id).in;
  KMV_PROJECT.undo(); KMV_PROJECT.undo();
  return { f1, v, len, back: KMV_PROJECT.a2(id).vol };
}, placed.id);
ok(a2ops.f1 === 60 && a2ops.v === 0.5 && a2ops.len === 300 && a2ops.back === 1, '페이드·볼륨·트림·undo 가 기존 A2 연산 그대로 동작');

/* ---------- 4. 믹스에 실리는가 (renderMix = 내보내기 경로) ---------- */
const mix = await page.evaluate(async () => {
  const P = KMV_PROJECT;
  const a = P.data.A2[0]; P.updateA2(a.id, { at: 0, out: a.in + 90, fadeIn: 0, fadeOut: 0 });   // 3초
  const buf = await KMV_AUDIO.renderMix(90);
  let rms = 0; const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) rms += d[i] * d[i];
  return { len: buf.length, sr: buf.sampleRate, rms: Math.sqrt(rms / d.length) };
});
ok(mix.len > 0 && mix.rms > 0.02, `내보내기 믹스에 음악이 실린다 — ${mix.len} 샘플 · RMS ${mix.rms.toFixed(3)}`);

/* ---------- 6. 효과음 ---------- */
const sfx = await page.evaluate(() => {
  const S = KMV_SFX, ids = S.LIST.map(d => d.id);
  const dup = ids.length !== new Set(ids).size;
  const actx = KMV_AUDIO.ctx();
  const stat = S.LIST.map(d => {
    const b = S.buffer(actx, d.id), x = b.getChannelData(0);
    let peak = 0, rms = 0; for (let i = 0; i < x.length; i++) { const v = Math.abs(x[i]); if (v > peak) peak = v; rms += x[i] * x[i]; }
    return { id: d.id, dur: b.duration, peak, rms: Math.sqrt(rms / x.length), fin: x.every(v => isFinite(v)) };
  });
  return { count: ids.length, dup, quiet: stat.filter(s => s.rms < 0.001).map(s => s.id), loud: stat.filter(s => s.peak > 1).map(s => s.id), nan: stat.filter(s => !s.fin).map(s => s.id), longest: Math.max(...stat.map(s => s.dur)) };
});
ok(sfx.count === 18 && !sfx.dup, '합성 효과음 18종 (이름 겹침 없음)');
ok(!sfx.quiet.length, '18종 전부 실제로 소리가 난다' + (sfx.quiet.length ? ' — 무음: ' + sfx.quiet : ''));
ok(!sfx.loud.length && !sfx.nan.length, '클리핑·NaN 없음' + (sfx.loud.length ? ' — 넘침: ' + sfx.loud : ''));
ok(sfx.longest <= 3, `가장 긴 효과음 ${sfx.longest.toFixed(1)}초 (짧은 소리만)`);

/* 자동 매핑 — 전환·부품·자막에 붙는가 */
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4'), path.join(FX, 'b.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length >= 2, null, { timeout: 60000 });
const ev = await page.evaluate(() => {
  const P = KMV_PROJECT, D = P.data;
  const c2 = D.V[1];
  P.setTransition(c2.id, { type: 'whip', dur: 'normal', dir: 'ltr' });
  P.addP({ part: 'opening', at: 0 }); P.addS({ text: '금성초등학교', at: 60, dur: 60, style: 'gold' });
  P.setSfx({ on: true, gain: 1 });
  const on = KMV_SFX.events();
  P.setSfx({ on: false });
  const off = KMV_SFX.events();
  P.setSfx({ on: true });
  const p = D.P[0]; P.updateP(p.id, { sfx: false });
  const muted = KMV_SFX.events();
  P.updateP(p.id, { sfx: true });
  return { on: on.map(e => e.id + '@' + e.at), off: off.length, muted: muted.map(e => e.id), trAt: c2.at, sorted: on.every((e, i) => !i || e.at >= on[i - 1].at) };
});
ok(ev.on.some(x => x.startsWith('whooshLong@' + ev.trAt)), '휩 팬 전환 → 우시 길게 (전환 시작 자리에)');
ok(ev.on.some(x => x.startsWith('subBoom@0')), '오프닝 타이틀 부품 → 서브 붐');
ok(ev.on.some(x => x.startsWith('sparkle@60')), '금선 자막 → 반짝');
ok(ev.off === 0, '자동 효과음을 끄면 이벤트가 0');
ok(!ev.muted.includes('subBoom') && ev.muted.length === ev.on.length - 1, '카드마다 sfx:false 로 그 소리만 끌 수 있다');
ok(ev.sorted, '이벤트가 시각순');

/* ---------- 5. 재생 펌프 (창을 넘겨도 이어짐) ---------- */
const play = await page.evaluate(async () => {
  KMV_AUDIO._tune({ win: 1, top: 0.6 });                       // 창을 1초로 좁혀 펌프를 여러 번 태운다
  const t0 = await KMV_AUDIO.play(0);
  if (t0 == null) return { started: false };
  await new Promise(r => setTimeout(r, 1600));
  const f = KMV_AUDIO.now(), nodes = KMV_AUDIO.nodeCount();
  KMV_AUDIO.stop(); KMV_AUDIO._tune({ win: 12, top: 6 });
  return { started: true, f, nodes };
});
ok(play.started && play.f > 20, `재생 시계가 진행 — ${Math.round(play.f)}프레임 · 노드 ${play.nodes}개(창 펌프)`);

/* 효과음이 믹스에 실리는가 — 켠 것과 끈 것의 차이 */
const sfxMix = await page.evaluate(async () => {
  const P = KMV_PROJECT;
  for (const a of [...P.data.A2]) P.removeA2(a.id);            // 음악·현장음 없이 효과음만 남긴다
  for (const a of [...P.data.A1]) P.setVol(a.clip, 0);
  P.setSfx({ on: false });
  const off = await KMV_AUDIO.renderMix(90);
  P.setSfx({ on: true, gain: 1 });
  const on = await KMV_AUDIO.renderMix(90);
  const rms = b => { const d = b.getChannelData(0); let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i]; return Math.sqrt(s / d.length); };
  const loud = await (async () => { P.setSfx({ gain: 1.6 }); const b = await KMV_AUDIO.renderMix(90); P.setSfx({ gain: 1 }); return rms(b); })();
  return { off: rms(off), on: rms(on), loud };
});
ok(sfxMix.off < 1e-6 && sfxMix.on > 0.005, `효과음이 내보내기 믹스에 실린다 (끔 ${sfxMix.off.toFixed(5)} → 켬 ${sfxMix.on.toFixed(4)})`);
ok(sfxMix.loud > sfxMix.on * 1.3, `세기 3단이 실제로 반영 (크게 ${sfxMix.loud.toFixed(4)})`);

/* ---------- 7. 저장·복원 (파일 없이 스펙만으로) ---------- */
await page.evaluate(() => {
  const P = KMV_PROJECT;
  P.setSfx({ on: true, gain: 0.6 });
  const id = 'genX';
  const { meta } = KMV_GEN.mediaMeta({ mood: 'ending', bpm: 64, key: 'A', seed: 3, durSec: 20 }, id);
  KMV_MEDIA.addGen(meta); P.addMedia(meta); P.addA2(id, 0);
});
await page.waitForTimeout(1200);                                 // 자동 저장(IndexedDB) 한 바퀴
await page.reload(); await page.waitForFunction(() => window.KMV_UI && KMV_PROJECT.data.media.length, null, { timeout: 60000 });
await page.waitForTimeout(1500);
const rest = await page.evaluate(() => {
  const P = KMV_PROJECT, gm = P.data.media.filter(m => m.gen);
  const s = gm.length ? KMV_MEDIA.get(gm[0].id) : null;
  return { gm: gm.length, live: !!(s && s.pcm), beats: s ? s.beats.length : 0, sfxOn: !!(P.data.audio.sfx && P.data.audio.sfx.on), sfxGain: P.data.audio.sfx && P.data.audio.sfx.gain, a2: P.data.A2.length };
});
ok(rest.gm >= 1 && rest.live && rest.beats > 10, `새로고침 후 생성 음악이 스펙만으로 되살아남 (미디어 ${rest.gm}개·비트 ${rest.beats})`);
ok(rest.a2 >= 1, 'A2 카드도 복원');
ok(rest.sfxOn && Math.abs(rest.sfxGain - 0.6) < 1e-9, '효과음 설정(켬·세기)도 복원');

/* ---------- 8. 패널 UI ---------- */
const ui = await page.evaluate(() => {
  const moods = document.getElementById('genMoodSeg').children.length;
  const keys = document.getElementById('genKeySeg').children.length;
  const tries = document.getElementById('sfxTrySeg').children.length;
  document.getElementById('genMoodSeg').querySelector('[data-k="ending"]').click();
  const bpm = document.getElementById('genBpm');
  const r = { moods, keys, tries, min: +bpm.min, max: +bpm.max, val: +bpm.value, keysAfter: document.getElementById('genKeySeg').children.length };
  document.getElementById('genMoodSeg').querySelector('[data-k="morning"]').click();
  return r;
});
ok(ui.moods === 6 && ui.keys === 3, '무드 6칸·조성 3칸');
ok(ui.min === 56 && ui.max === 72 && ui.val === 64, '무드를 바꾸면 템포 범위도 그 무드 것으로 (엔딩 56~72, 기본 64)');
ok(ui.tries === 18, '효과음 들어보기 18칸');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill();
process.exit(fail ? 1 : 0);

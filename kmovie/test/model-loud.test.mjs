// 케이무비 — 소리 크기(LUFS) 미터·내보내기 게인 (순수, node)
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
require('../engine/loud.js'); const L = globalThis.KMV_LOUD;
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const sr = 48000;
const sine = (amp, sec, hz = 997) => { const a = new Float32Array(sr * sec); for (let i = 0; i < a.length; i++) a[i] = amp * Math.sin(2 * Math.PI * hz * i / sr); return a; };
const meas = (ch, sr2 = sr) => { const m = L.meter(sr2, 2); m.push(ch); return m.result(); };
// 1. 997Hz 스테레오 사인 -20 dBFS → -20 LUFS (BS.1770: 0 dBFS 스테레오 = 0 LUFS)
const r1 = meas([sine(0.1, 5), sine(0.1, 5)]);
ok(Math.abs(r1.lufs + 20) < 0.15 && Math.abs(r1.peak - 0.1) < 1e-3, `-20 dBFS 사인 → ${r1.lufs.toFixed(2)} LUFS · 피크 ${r1.peak.toFixed(3)}`);
// 2. 6 dB 내리면 6 LU 내려간다 · 한쪽 채널만이면 3 LU 낮다
const r2 = meas([sine(0.05, 5), sine(0.05, 5)]), r3 = meas([sine(0.1, 5), new Float32Array(sr * 5)]);
ok(Math.abs((r1.lufs - r2.lufs) - 6.02) < 0.1, `6 dB 낮추면 ${(r1.lufs - r2.lufs).toFixed(2)} LU 낮다`);
ok(Math.abs((r1.lufs - r3.lufs) - 3.01) < 0.1, `한 채널만이면 ${(r1.lufs - r3.lufs).toFixed(2)} LU 낮다`);
// 3. K-가중: 100Hz 저음은 같은 진폭에서 더 낮게 잰다(RLB 고역 통과), 고음(6kHz)은 더 높게(셸프 +4dB)
const lo = meas([sine(0.1, 5, 100), sine(0.1, 5, 100)]), hi = meas([sine(0.1, 5, 6000), sine(0.1, 5, 6000)]);
ok(lo.lufs < r1.lufs - 1 && hi.lufs > r1.lufs + 2.5, `K-가중 — 100Hz ${lo.lufs.toFixed(1)} < 997Hz ${r1.lufs.toFixed(1)} < 6kHz ${hi.lufs.toFixed(1)}`);
// 4. 게이트: 3초 소리 + 7초 무음 = 소리 부분만 잰다(무음이 평균을 끌어내리지 않음)
const g4 = new Float32Array(sr * 10); g4.set(sine(0.1, 3)); const r4 = meas([g4, g4.slice()]);
ok(Math.abs(r4.lufs - r1.lufs) < 0.3, `무음 7초를 붙여도 ${r4.lufs.toFixed(2)} LUFS (절대 게이트)`);
// 5. 상대 게이트: 큰 소리 3초 + 아주 작은 소리(-45 dB) 7초 → 큰 소리 쪽에 가깝다
const g5 = new Float32Array(sr * 10); g5.set(sine(0.3, 3)); g5.set(sine(0.3 / 178, 7), sr * 3); const r5 = meas([g5, g5.slice()]), r5b = meas([sine(0.3, 3), sine(0.3, 3)]);
ok(Math.abs(r5.lufs - r5b.lufs) < 0.5, `작은 소리 7초가 붙어도 ${r5.lufs.toFixed(2)} ≈ ${r5b.lufs.toFixed(2)} (상대 게이트)`);
// 6. 무음 → -Infinity, 게인 0 · 나눠서 push 해도 같은 값
const r6 = meas([new Float32Array(sr * 2), new Float32Array(sr * 2)]);
ok(r6.lufs === -Infinity && L.gainDb(r6.lufs, 0, -14) === 0, '무음은 -∞ LUFS · 게인 0 dB');
const m7 = L.meter(sr, 2); const s7 = sine(0.1, 5); for (let i = 0; i < 5; i++) m7.push([s7.subarray(i * sr, (i + 1) * sr), s7.subarray(i * sr, (i + 1) * sr)]);
ok(Math.abs(m7.result().lufs - r1.lufs) < 1e-9, '1초씩 5번 나눠 넣어도 통으로 넣은 것과 같은 값');
// 7. 게인 규칙: target - lufs, 피크 -1 dBFS 한도, ±24 dB 묶음
ok(Math.abs(L.gainDb(-20, 0.1, -14) - 6) < 1e-9, '-20 → -14: +6 dB');
ok(Math.abs(L.gainDb(-20, 0.5, -14) - (-1 - 20 * Math.log10(0.5))) < 1e-9, '피크 0.5 면 +5.02 dB 까지만(-1 dBFS 한도)');
ok(L.gainDb(-60, 0.001, -14) === 24 && L.gainDb(2, 0.9, -14) === -16, '+24 dB 상한 · 시끄러우면 내린다');
ok(Math.abs(L.gainDb(-20, 0.1, -16) - 4) < 1e-9, 'target -16 이면 +4 dB');
console.log(`\n${n - fail}/${n} 통과`); process.exit(fail ? 1 : 0);

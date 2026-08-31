// 자동 편집(KMV_AUTO) 모델 테스트 — node test/model-auto.test.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('../engine/project.js'); require('../engine/auto.js');
const P = globalThis.KMV_PROJECT, A = globalThis.KMV_AUTO, FPS = P.FPS;
let n = 0, fail = 0;
const ok = (cond, msg) => { n++; if (!cond) { fail++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), msg + ' → ' + JSON.stringify(a) + (JSON.stringify(a) === JSON.stringify(b) ? '' : ' ≠ ' + JSON.stringify(b)));
const vid = (id, sec, fps = 30) => ({ id, name: id + '.mp4', kind: 'video', fps, dur: sec * fps, w: 1920, h: 1080, audio: true });

console.log('무음');
// 말: 30~90, 150~210, 300~330 / 전체 360 — 여유 9f, 최소 24f
eq(A.silences([{ at: 30, dur: 60 }, { at: 150, dur: 60 }, { at: 300, dur: 30 }], 360, { pad: 9, min: 24 }), [{ at: 99, dur: 42 }, { at: 219, dur: 72 }], '사이·사이 (처음 30f·끝 30f 는 여유 빼면 21 < 24 라 남김)');
eq(A.silences([{ at: 30, dur: 60 }], 360, { pad: 9, min: 24, edge: false }), [], 'edge:false — 처음·끝은 안 자름');
eq(A.silences([{ at: 0, dur: 100 }, { at: 110, dur: 100 }], 210, { pad: 9, min: 24 }), [], '틈 10f 는 여유에 먹혀 없음');
eq(A.silences([], 300, { pad: 9, min: 24 }), [{ at: 0, dur: 300 }], '말이 하나도 없으면 전체가 무음');
eq(A.silences([{ at: 100, dur: 50 }], 300, { pad: 0, min: 1 }), [{ at: 0, dur: 100 }, { at: 150, dur: 150 }], '여유 0');
ok(A.sum(A.silences([{ at: 30, dur: 60 }, { at: 150, dur: 60 }, { at: 300, dur: 30 }], 360, { pad: 9, min: 24 })) === 114, 'sum');

console.log('시간 재매핑');
const f = A.timeMap([{ at: 10, dur: 5 }, { at: 30, dur: 10 }]);
eq([f(0), f(10), f(12), f(15), f(20), f(30), f(35), f(40), f(100)], [0, 10, 10, 10, 15, 25, 25, 25, 85], '옛 t → 새 t');
eq(A.remapCards([{ at: 0, dur: 10 }, { at: 12, dur: 2 }, { at: 8, dur: 10 }, { at: 50, dur: 5 }], [{ at: 10, dur: 5 }, { at: 30, dur: 10 }]), [{ at: 0, dur: 10 }, { at: 8, dur: 5 }, { at: 35, dur: 5 }], '카드: 안에 든 건 사라짐 · 걸친 건 줄어듦 · 뒤는 당겨짐');
eq(A.remapCards([{ at: 40, dur: 100 }], [{ at: 30, dur: 10 }], true), [{ at: 30, dur: 100 }], '음악(keepDur): 시작만 당김');
eq(A.remapPoints([{ at: 5 }, { at: 12 }, { at: 45 }], [{ at: 10, dur: 5 }, { at: 30, dur: 10 }]), [{ at: 5 }, { at: 30 }], '마커: 잘린 구간 안은 사라짐');

console.log('장면 경계');
const diff = new Float32Array(300).fill(0.01);
diff[100] = 0.4;                                     // 하드 컷
for (let i = 200; i < 215; i++) diff[i] = 0.3;       // 빠른 팬(여러 프레임)
diff[250] = 0.5; diff[251] = 0.5;                     // 두 프레임 걸친 컷(디졸브 짧게) — 격리 실패 → 안 잡힘이 맞다
diff[280] = 0.35; diff[286] = 0.3;                    // 12f 안 두 후보 → 큰 쪽
eq(A.sceneCuts(diff), [100, 280], '한 프레임 솟구침만 컷 · 팬은 제외 · 가까운 둘은 큰 쪽');
eq(A.sceneCuts(new Float32Array(300).fill(0.01)), [], '평평하면 컷 없음');
eq(A.sceneCuts(new Float32Array([0, 0.5, 0])), [1], '아주 짧아도');

console.log('흔들림');
const mo = new Float32Array(200).fill(0.2);
for (let i = 50; i < 80; i++) mo[i] = 0.9; mo[60] = 0.3; mo[61] = 0.3;   // 잠깐 내려앉음 2f 는 잇는다
for (let i = 120; i < 128; i++) mo[i] = 0.95;                            // 8f — 짧아서 제외
eq(A.shakes(mo).map(s => [s.at, s.dur]), [[50, 30]], '0.7 이상 15f 넘게 · 6f 이하 틈은 이어 붙임');

console.log('하이라이트');
const m2 = new Float32Array(300).fill(0.1), pk = new Float32Array(300).fill(0.01);
for (let i = 100; i < 160; i++) { m2[i] = 0.9; pk[i] = 0.3; }
for (let i = 220; i < 280; i++) m2[i] = 0.8;
const hl = A.highlights(m2, pk, { win: 60, top: 2 });
ok(hl.length === 2 && hl[0].at === 100 && hl[1].at >= 200 && hl[1].at <= 240 && hl[0].score > hl[1].score, '움직임+소리 창이 1등, 움직임만은 2등, 겹침 없음 → ' + JSON.stringify(hl.map(h => [h.at, +h.score.toFixed(2)])));
eq(A.highlights(new Float32Array(30), new Float32Array(30), { win: 60 }), [], '창보다 짧으면 없음');

console.log('군소리');
eq(A.fillers('어 그러니까 우리 학교는 음 텃밭이 있어요').map(x => x.word), ['어', '그러니까', '음'], '낱말 단위로 잡음');
eq(A.fillers('그 학교 그리고 어른').map(x => x.word), ['그'], '"그리고"·"어른" 은 아님 (낱말 경계)');
ok(A.fillerOnly('어... 음 어어') && !A.fillerOnly('어 안녕') && !A.fillerOnly('...'), '군소리뿐 판정');
eq(A.stripFillers('어 그러니까 우리 학교는 음, 텃밭이 있어요'), '우리 학교는, 텃밭이 있어요', '군소리 지운 문장');

console.log('removeRanges (프로젝트)');
P.reset(); P.addMedia(vid('A', 10)); P.addMedia(vid('B', 10));
const c1 = P.addClip('A'), c2 = P.addClip('B');                        // A 0-300 | B 300-600
P.addS({ text: '앞', at: 10, dur: 20 }); P.addS({ text: '안', at: 50, dur: 20 }); P.addS({ text: '걸침', at: 90, dur: 40 }); P.addS({ text: '뒤', at: 400, dur: 30 });
P.addP({ part: 'opening', at: 350, dur: 60 }); P.addMarker({ at: 60 }); P.addMarker({ at: 500 });
P.addMedia({ id: 'MU', name: 'm.mp3', kind: 'audio', fps: 30, dur: 3000 }); P.addA2('MU', 200);
const cut = P.removeRanges([{ at: 40, dur: 60 }, { at: 320, dur: 30 }]);  // A 40~100 · B 20~50
ok(cut === 90 && P.total() === 510, '두 구간 90f 잘림 · 전체 600→' + P.total());
eq(P.data.V.map(c => c.media + ':' + c.in + '-' + c.out), ['A:0-40', 'A:100-300', 'B:0-20', 'B:50-300'], 'V 가 경계에서 나뉘고 안쪽이 빠짐');
eq(P.data.V.map(c => c.at), [0, 40, 240, 260], '빈틈 없이 당겨짐');
eq(P.data.S.map(s => s.text + ':' + s.at + '+' + s.dur), ['앞:10+20', '걸침:40+30', '뒤:310+30'], '자막: 안에 든 건 사라짐 · 걸친 건 줄고 · 뒤는 당김');
eq(P.data.P.map(p => p.at), [260], '부품 당김 (앞 두 구간 90f)');
eq(P.data.markers.map(m => m.at), [410], '마커: 잘린 구간 안은 사라지고 뒤는 당김');
eq(P.data.A2.map(a => [a.at, a.dur]), [[140, P.data.A2[0].dur]], '음악: 시작만 당김');
P.undo(); ok(P.total() === 600 && P.data.S.length === 4 && P.data.markers.length === 2, 'undo 한 번으로 전부 복귀');
P.redo(); ok(P.total() === 510, 'redo');
P.undo();
const cut2 = P.removeRanges([{ at: 0, dur: 30 }, { at: 570, dur: 60 }], { follow: false });
ok(cut2 === 60 && P.total() === 540 && P.data.S[0].at === 10, '처음·끝 구간(넘치는 길이 클램프) · follow:false 면 자막 그대로');
ok(P.removeRanges([]) === 0 && P.removeRanges([{ at: 900, dur: 10 }]) === 0, '빈·범위 밖은 0');

console.log('splitMany');
P.reset(); P.addMedia(vid('A', 10)); P.addClip('A');
ok(P.splitMany([100, 200, 200, 0, 300, 250]) === 3 && P.data.V.length === 4, '중복·경계 제외하고 3번 분할 → 4 클립');
eq(P.data.V.map(c => c.at), [0, 100, 200, 250], '자리');
P.undo(); ok(P.data.V.length === 1, 'undo 한 번');

console.log(`\n${n - fail}/${n} 통과`);
process.exit(fail ? 1 : 0);

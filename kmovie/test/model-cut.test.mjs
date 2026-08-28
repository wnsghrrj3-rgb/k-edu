// 6단계 컷 도구 모델 테스트 — node test/model-cut.test.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('../engine/project.js');
const P = globalThis.KMV_PROJECT, FPS = P.FPS;
let n = 0, fail = 0;
const ok = (cond, msg) => { n++; if (!cond) { fail++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), msg + ' → ' + JSON.stringify(a) + (JSON.stringify(a) === JSON.stringify(b) ? '' : ' ≠ ' + JSON.stringify(b)));
const vid = (id, sec, fps = 30) => ({ id, name: id + '.mp4', kind: 'video', fps, dur: sec * fps, w: 1920, h: 1080, audio: true });
function fresh() { P.reset(); P.addMedia(vid('A', 10)); P.addMedia(vid('B', 10)); P.addMedia(vid('C', 10, 60)); P.addMedia({ id: 'IMG', name: 'p.png', kind: 'image', fps: 30, dur: 18000, w: 100, h: 100 }); }
const V = () => P.data.V, lens = () => V().map(c => c.dur), ins = () => V().map(c => c.media + ':' + c.in + '-' + c.out);

console.log('슬립');
fresh(); const a = P.addClip('A'); P.trim(a.id, 'in', 60); P.trim(a.id, 'out', 120);   // A 2s~4s
P.slip(a.id, 30); eq(ins(), ['A:90-150'], '슬립 +30: in/out 같이');
eq(lens(), [60], '슬립해도 길이 그대로');
P.slip(a.id, 1000); eq(ins(), ['A:240-300'], '슬립 상한: 원본 끝에서 멈춤');
P.slip(a.id, -1000); eq(ins(), ['A:0-60'], '슬립 하한: 0');
P.audioTrim(a.id, 'out', 100); ok(!P.audioOf(a.id).linked, 'J/L 걸어 둠'); P.slip(a.id, 10); ok(P.audioOf(a.id).linked, '슬립하면 J/L 링크 복귀');
P.undo(); P.undo(); P.undo(); P.undo(); P.undo(); eq(ins(), ['A:60-120'], '슬립 undo 5회 → 트림 직후');

console.log('롤');
fresh(); const c1 = P.addClip('A'), c2 = P.addClip('B'); P.trim(c1.id, 'out', 150); P.trim(c2.id, 'in', 90);  // A 0-150 | B 90-300
const tot0 = P.total();
ok(P.roll(c1.id, 30), '롤 +30 성공'); eq(ins(), ['A:0-180', 'B:120-300'], '롤 +30: 앞 out↑ 뒤 in↑');
ok(P.total() === tot0, '롤 후 전체 길이 그대로 (' + P.total() + ')');
P.roll(c1.id, -60); eq(ins(), ['A:0-120', 'B:60-300'], '롤 -60');
P.roll(c1.id, 10000); eq(ins(), ['A:0-300', 'B:240-300'], '롤 상한: A 원본 끝 & B 1프레임 (둘 중 빡빡한 쪽)');
P.roll(c1.id, -10000); eq(ins(), ['A:0-60', 'B:0-300'], '롤 하한: B in 0 (A 는 60 남음)');
ok(P.roll(c2.id, 5) === false, '마지막 클립 뒤엔 롤 없음');
ok(P.total() === tot0, '극단 롤에도 전체 길이 그대로');
// 60fps 원본과 롤
fresh(); const d1 = P.addClip('A'), d2 = P.addClip('C'); P.trim(d1.id, 'out', 150); P.trim(d2.id, 'in', 120);
const totC = P.total(); P.roll(d1.id, 30); eq(ins(), ['A:0-180', 'C:180-600'], '60fps 뒤 클립 롤: in 은 원본 60프레임(=30tl)');
ok(P.total() === totC, '60fps 롤 전체 길이 유지');
// 프리즈 롤
fresh(); const e1 = P.addClip('A'); P.freeze(60); const fz = V()[1]; ok(fz.freeze, '프리즈 생성');
const totF = P.total(); P.roll(V()[0].id, 15); eq([V()[0].out, V()[1].dur], [75, 45], '프리즈 앞 편집점 롤: 프리즈 길이가 줄어듦'); ok(P.total() === totF, '프리즈 롤 길이 유지');

console.log('3점 편집 — 삽입·덮어쓰기·끝에');
fresh(); const f1 = P.addClip('A'); P.trim(f1.id, 'out', 300);                                   // A 0-300 (10s)
P.insertRange('B', { in: 30, out: 90 }, 150, 'insert'); eq(ins(), ['A:0-150', 'B:30-90', 'A:150-300'], '삽입: 클립 안이면 분할하고 사이에');
eq(lens(), [150, 60, 150], '삽입 뒤 길이'); ok(P.total() === 360, '삽입은 전체가 늘어남');
P.undo(); eq(ins(), ['A:0-300'], '삽입 undo 한 번에 원복');
P.insertRange('B', { in: 30, out: 90 }, 150, 'overwrite'); eq(ins(), ['A:0-150', 'B:30-90', 'A:210-300'], '덮어쓰기: 그 길이만큼 지움');
ok(P.total() === 300, '덮어쓰기는 전체 길이 그대로');
P.undo(); P.insertRange('B', { in: 0, out: 300 }, 240, 'overwrite'); eq(ins(), ['A:0-240', 'B:0-300'], '덮어쓰기가 끝을 넘으면 끝까지 지우고 붙임');
P.undo(); P.insertRange('B', { in: 0, out: 30 }, 0, 'insert'); eq(ins(), ['B:0-30', 'A:0-300'], '0 에 삽입 = 맨 앞');
P.undo(); P.insertRange('B', { in: 0, out: 30 }, 0, 'overwrite'); eq(ins(), ['B:0-30', 'A:30-300'], '0 에 덮어쓰기');
P.undo(); P.insertRange('B', { in: 0, out: 30 }, null, 'append'); eq(ins(), ['A:0-300', 'B:0-30'], '끝에 붙이기');
P.undo(); P.insertRange('B', { in: 0, out: 30 }, 150, 'insert'); P.insertRange('IMG', { dur: 45 }, 150, 'overwrite'); eq(ins(), ['A:0-150', 'IMG:0-45', 'A:165-300'], '사진 45f 덮어쓰기: B(30f) 통째로 + 뒤 A 15f');
// 덮어쓰기가 여러 클립을 통째로 지우는 경우
fresh(); P.addClip('A'); P.addClip('B'); P.addClip('A'); V().forEach(c => P.trim(c.id, 'out', 60)); // 60|60|60
P.insertRange('B', { in: 0, out: 150 }, 30, 'overwrite'); eq(ins(), ['A:0-30', 'B:0-150'], '덮어쓰기가 뒤 클립 둘을 통째로 삼킴');

console.log('다중 선택 — 삭제·이동·복사·붙여넣기');
fresh(); const g = []; for (let i = 0; i < 5; i++) { const c = P.addClip(i % 2 ? 'B' : 'A'); P.trim(c.id, 'out', 30 * (i + 1)); g.push(c.id); }   // 30,60,90,120,150
P.removeClips([g[1], g[3]]); eq(lens(), [30, 90, 150], '둘 삭제(리플)');
P.undo(); eq(lens(), [30, 60, 90, 120, 150], '삭제 undo');
P.moveClips([g[0], g[1]], 4); eq(lens(), [90, 120, 30, 60, 150], '앞 둘을 4번 자리로 (순서 유지)');
P.moveClips([g[0], g[1]], 0); eq(lens(), [30, 60, 90, 120, 150], '다시 맨 앞으로');
P.moveClips([g[4], g[2]], 1); eq(lens(), [30, 90, 150, 60, 120], '떨어진 둘을 1번 자리로 (원래 순서로 묶임)');
P.undo(); P.moveClips([g[2]], 2); eq(lens(), [30, 60, 90, 120, 150], '한 개는 제자리면 무변화');
const items = P.copyClips([g[1], g[2]]); ok(items.length === 2 && items[0].audio, '복사 2개 + A1 동반');
P.setVol(g[1], 0.5);
const pasted = P.pasteClips(P.copyClips([g[1], g[2]]), 45); eq(lens(), [30, 15, 60, 90, 45, 90, 120, 150], '45 에 붙여넣기: 둘째 클립을 갈라 사이에 둘');
ok(P.audioOf(pasted[0].id).vol === 0.5, '붙여넣은 클립 볼륨도 같이');
P.undo(); eq(lens(), [30, 60, 90, 120, 150], '붙여넣기 undo 한 번');
P.pasteClips(P.copyClips([g[0]]), null); eq(lens(), [30, 60, 90, 120, 150, 30], 't 없으면 끝에');

console.log('마커');
fresh(); const m1 = P.addMarker({ at: 100, text: '오프닝' }); P.addMarker({ at: 40 }); eq(P.markerFrames(), [40, 100], '마커 정렬');
ok(P.markerAt(100).text === '오프닝', 'markerAt'); ok(P.markerAt(103, 5) === m1, 'markerAt 허용 오차');
P.updateMarker(m1.id, { at: 20, text: 'x' }); eq(P.markerFrames(), [20, 40], '마커 이동 후 재정렬');
P.removeMarker(m1.id); eq(P.markerFrames(), [40], '마커 삭제'); P.undo(); eq(P.markerFrames(), [20, 40], '마커 undo');
const j = P.toJSON(); P.load(j); eq(P.markerFrames(), [20, 40], '저장·복원');
P.load({ media: [vid('A', 3)], V: [] }); eq(P.data.markers, [], '옛 프로젝트(markers 없음) 복원');

console.log(`\n${n - fail}/${n} 통과${fail ? ' — 실패 ' + fail : ''}`);
process.exit(fail ? 1 : 0);

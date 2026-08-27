/* engine/shell.js 를 Node 에서 mock 백엔드에 붙여 검증: init(한도 교체)·file(조각→File·kmvOrigin)·사진 경로·saveTarget 위치 쓰기·exact 폴백.
   사용: D=/tmp/kmv-fixtures node test/shell-js.mjs (frame-map.mjs 먼저 돌려 프록시가 있으면 빠름) */
const D = process.env.D || '/tmp/kmv-fixtures';
import { createBackend } from './mock-backend.mjs';
import fs from 'node:fs';
const B = createBackend({ proxyDir: D + '/mockproxy' });
globalThis.__TAURI__ = B.__TAURI__;
globalThis.File = class { constructor(parts, name, o) { this.parts = parts; this.name = name; this.type = o && o.type; this.size = parts.reduce((a, p) => a + p.length, 0); } };
globalThis.KMV_MEDIA = { limits: { maxFile: 1, maxSec: 1 } };
await import('../../engine/shell.js');
const SH = globalThis.KMV_SHELL;
const info = await SH.init(); console.log('active', SH.active, 'limits', KMV_MEDIA.limits.maxSec, KMV_MEDIA.limits.maxFile / 1048576 | 0);
const prog = []; const f = await SH.file(SH.ref(D + '/orig60.mp4'), { progress: (p, l) => prog.push([p.toFixed(2), l]), status: () => {} });
const r = B.loadMeta(f.kmvOrigin.hash);
const whole = Buffer.concat(f.parts.map(p => Buffer.from(p)));
console.log('file', f.name, f.type, 'origin', f.kmvOrigin.kind, f.kmvOrigin.w + 'x' + f.kmvOrigin.h, 'bytes equal', whole.equals(fs.readFileSync(D + '/mockproxy/' + r.hash + '.mp4')), 'progress steps', prog.length, prog[prog.length - 1]);
// 사진 경로 → 원본 그대로
fs.writeFileSync(D + '/p.png', Buffer.from('89504e470d0a1a0a', 'hex'));
const im = await SH.file(D + '/p.png'); console.log('image', im.kmvOrigin.kind, im.size, im.type);
// 저장: StreamTarget 스텁 — 위치 쓰기 순서 뒤섞어도 파일이 맞는지
globalThis.Mp4Muxer = { StreamTarget: class { constructor(o) { this.o = o; } } };
const st = await SH.saveTarget('테스트.mp4');
st.target.o.onData(new Uint8Array([1,2,3,4,5,6,7,8]), 0); st.target.o.onData(new Uint8Array([9,9]), 2); st.target.o.onData(new Uint8Array([7]), 12);
await st.close();
console.log('saved', [...fs.readFileSync(B.exportPath(1) || D + '/테스트.mp4')].join(','));
// hasOrigin / exact (node 엔 VideoFrame 없음 → null 로 조용히 폴백)
globalThis.KMV_PROJECT = { media: id => ({ id, origin: f.kmvOrigin }), data: { media: [{ origin: f.kmvOrigin }] } };
SH.exactBegin(); console.log('hasOrigin', SH.hasOrigin('m1'), 'anyOrigin', SH.anyOrigin(), 'exact(no VideoFrame)→', await SH.exact('m1', 5)); await SH.exactEnd();
console.log('cache', await SH.cacheInfo());

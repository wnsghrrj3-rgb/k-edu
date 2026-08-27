/* 프레임 정렬 검증: 프록시 프레임 idx 와 원화질 파이프 frame_next(idx) 가 픽셀로 같은지 (앞으로·뒤로 seek 포함) + 조각 읽기.
   사용: sh test/make-fixtures.sh /tmp/kmv-fixtures && D=/tmp/kmv-fixtures node test/frame-map.mjs
   참고: 프록시를 ffmpeg 로 다시 풀 때는 -fps_mode passthrough 를 줘야 시작 오프셋 원본에서 CLI 가 첫 프레임을 복제하지 않는다(WebCodecs 는 샘플 그대로 푼다). */
const D = process.env.D || '/tmp/kmv-fixtures';
import { createBackend } from './mock-backend.mjs';
import { spawnSync } from 'node:child_process';
const B = createBackend({ proxyDir: D + '/mockproxy' });
let bad = 0, n = 0;
for (const f of ['orig25', 'orig60', 'orig30off']) {
  const r = await B.invoke('import_path', { path: `${D}/${f}.mp4` });
  // 프록시 전 프레임(1920x1080 레터박스로 확대해 같은 규격으로) 
  const pf = spawnSync('ffmpeg', ['-v','error','-i',`${D}/mockproxy/${r.hash}.mp4`,'-vf','scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,format=rgba','-fps_mode','passthrough','-f','rawvideo','pipe:1'],{maxBuffer:2**31}).stdout;
  const FB = 1920*1080*4;
  for (const idx of [0, 1, 31, 90, 94, 150, 95, 60]) {   // 95→60: 뒤로 가기(재seek)
    const buf = Buffer.from(await B.invoke('frame_next', { session: 's', hash: r.hash, idx }));
    const ref = pf.subarray(idx*FB, (idx+1)*FB);
    let d = 0; for (let i = 0; i < FB; i += 4) d += Math.abs(buf[i]-ref[i]) + Math.abs(buf[i+1]-ref[i+1]) + Math.abs(buf[i+2]-ref[i+2]);
    d /= FB * 0.75; n++;
    let dn = Infinity; for (const j of [idx-1, idx+1]) { if (j < 0) continue; const rr = pf.subarray(j*FB,(j+1)*FB); let e=0; for (let i=0;i<FB;i+=4) e+=Math.abs(buf[i]-rr[i]); dn=Math.min(dn,e/(FB/4)); }
    if (d > 3 || dn < d) bad++;
    console.log(f, 'idx', idx, 'diff', d.toFixed(2), 'neighbor', dn.toFixed(2), d > 3 || dn < d ? 'BAD' : 'ok');
  }
  await B.invoke('frame_close', { session: null });
}
// 조각 읽기 → 바이트 동일
const r = await B.invoke('import_path', { path: D + '/orig25.mp4' });
const parts=[]; let off=0; while (off < r.bytes) { const b = new Uint8Array(await B.invoke('read_chunk', { hash: r.hash, offset: off, len: 1<<20 })); if (!b.length) break; parts.push(b); off += b.length; }
const fs = await import('node:fs'); const whole = Buffer.concat(parts.map(p=>Buffer.from(p))); console.log('chunks equal', whole.equals(fs.readFileSync(`${D}/mockproxy/${r.hash}.mp4`)), 'cached', r.cached);
console.log('TOTAL', n, 'BAD', bad);

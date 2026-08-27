#!/usr/bin/env node
/* ============================================================
   케이메이커 영상 부품 렌더러 (node)
   부품 → 투명 PNG 프레임 → ffmpeg ProRes 4444 (알파) MOV
   → 필모라·프리미어·리졸브 어디든 얹는 오버레이 클립.

   사용:
     node render.mjs --part opening --preset presets/geumseong.json --out dist
     node render.mjs --all --preset presets/geumseong.json --out dist
     옵션: --w 1920 --h 1080 --fps 30 --png (프레임 시퀀스 남김) --still 2.4 (정지 PNG 한 장)

   요구: npm i canvas (이 폴더에서) + ffmpeg (prores_ks)
   폰트: 프리텐다드 otf 를 fonts/ 또는 node_modules/pretendard 에서 찾는다.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { createCanvas, registerFont } = require('canvas');

/* ---------- 인자 ---------- */
const argv = process.argv.slice(2);
const opt = { w: 1920, h: 1080, fps: 30, out: 'dist', preset: null, part: null, all: false, png: false, still: null };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--all') opt.all = true;
  else if (a === '--png') opt.png = true;
  else if (a.startsWith('--')) opt[a.slice(2)] = argv[++i];
}
opt.w = +opt.w; opt.h = +opt.h; opt.fps = +opt.fps;

/* ---------- 폰트 ---------- */
function findFont(name) {
  const cands = [
    path.join(__dirname, 'fonts', name),
    path.join(__dirname, 'node_modules/pretendard/dist/public/static', name),
    path.join(__dirname, '../../node_modules/pretendard/dist/public/static', name),
  ];
  return cands.find(f => fs.existsSync(f));
}
let fontOK = false;
for (const [file, weight] of [['Pretendard-Black.otf', '900'], ['Pretendard-ExtraBold.otf', '800'], ['Pretendard-Bold.otf', '700'], ['Pretendard-SemiBold.otf', '600'], ['Pretendard-Medium.otf', '500'], ['Pretendard-Regular.otf', '400']]) {
  const f = findFont(file);
  if (f) { registerFont(f, { family: 'Pretendard', weight }); fontOK = true; }
}
if (!fontOK) console.warn('⚠ 프리텐다드 못 찾음 — 시스템 폰트로 대체 (npm i pretendard 권장)');

/* ---------- 부품 로드 (브라우저 파일 그대로) ---------- */
for (const f of ['parts.js', ...fs.readdirSync(__dirname).filter(n => /^p-.*\.js$/.test(n)).sort()]) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), { filename: f });
}
const K = globalThis.KM_PARTS;

/* ---------- 프리셋 ---------- */
let preset = { theme: 'geumseong', parts: {} };
if (opt.preset) preset = Object.assign(preset, JSON.parse(fs.readFileSync(opt.preset, 'utf8')));
const theme = typeof preset.theme === 'string' ? K.THEMES[preset.theme] : preset.theme;
if (!theme) throw new Error('테마 없음: ' + preset.theme);

const ids = opt.all ? K.list().map(d => d.id) : opt.part ? [opt.part] : [];
if (!ids.length) { console.error('--part <id> 또는 --all 필요. 부품:', K.list().map(d => d.id).join(', ')); process.exit(1); }

fs.mkdirSync(opt.out, { recursive: true });

function renderFrame(id, t, p) {
  const cv = createCanvas(opt.w, opt.h);
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, opt.w, opt.h);
  K.frame(id, ctx, opt.w, opt.h, t, p, theme);
  return cv;
}

for (const id of ids) {
  const def = K.get(id);
  const p = Object.assign(K.defaults(id), preset.parts?.[id] || {});
  const tag = `${theme.id}_${id}`;

  if (opt.still != null) {
    const f = path.join(opt.out, `${tag}_t${opt.still}.png`);
    fs.writeFileSync(f, renderFrame(id, +opt.still, p).toBuffer('image/png'));
    console.log('정지 프레임:', f);
    continue;
  }

  const frames = Math.round(def.dur * opt.fps);
  const seqDir = path.join(opt.out, `_seq_${tag}`);
  fs.rmSync(seqDir, { recursive: true, force: true });
  fs.mkdirSync(seqDir, { recursive: true });
  for (let i = 0; i < frames; i++) {
    const t = i / opt.fps;
    fs.writeFileSync(path.join(seqDir, `f${String(i).padStart(5, '0')}.png`), renderFrame(id, t, p).toBuffer('image/png'));
  }
  const mov = path.join(opt.out, `${tag}.mov`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(opt.fps), '-i', path.join(seqDir, 'f%05d.png'),
    '-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0', mov]);
  if (!opt.png) fs.rmSync(seqDir, { recursive: true, force: true });
  const mb = (fs.statSync(mov).size / 1048576).toFixed(1);
  console.log(`✔ ${mov}  (${def.name}, ${def.dur}s, ${frames}f, ${mb}MB)`);
}

#!/usr/bin/env node
// 케이무비 내장 음원 목록 만들기 — assets/music/<무드>/*.(mp3|wav|m4a|aac|ogg) · assets/sfx/<효과음id>/* 를 훑어 library.json 을 다시 쓴다.
// 실행: node kmovie/assets/scan.mjs   (의존성 0 — 길이는 파일 머리만 읽어 어림)
// 출처·라이선스: 같은 이름의 .txt(예: 아침.mp3 → 아침.txt, 줄마다 "출처: …" "라이선스: …") 또는 폴더의 _출처.txt 가 폴더 전체에.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const EXT = /\.(mp3|wav|m4a|aac|ogg)$/i;

function wavDur(buf) { if (buf.toString('ascii', 0, 4) !== 'RIFF') return 0; let p = 12, rate = 0, bps = 0; while (p + 8 <= buf.length) { const id = buf.toString('ascii', p, p + 4), sz = buf.readUInt32LE(p + 4); if (id === 'fmt ') { rate = buf.readUInt32LE(p + 12); bps = buf.readUInt32LE(p + 16); } if (id === 'data') return bps ? sz / bps : 0; p += 8 + sz + (sz & 1); } return 0; }
const BR = { 3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], 2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160] };
function mp3Dur(buf, size) { let p = 0; if (buf.toString('ascii', 0, 3) === 'ID3') p = 10 + ((buf[6] & 127) << 21 | (buf[7] & 127) << 14 | (buf[8] & 127) << 7 | (buf[9] & 127)); for (; p + 4 < buf.length; p++) { if (buf[p] !== 0xFF || (buf[p + 1] & 0xE0) !== 0xE0) continue; const ver = (buf[p + 1] >> 3) & 3, layer = (buf[p + 1] >> 1) & 3, bi = buf[p + 2] >> 4; if (layer !== 1 || bi === 0 || bi === 15) continue; const kb = (ver === 3 ? BR[3] : BR[2])[bi]; if (!kb) continue; // Xing/Info 헤더가 있으면 정확한 프레임 수
  const x = buf.indexOf('Xing', p), inf = buf.indexOf('Info', p), xi = x > 0 && x - p < 60 ? x : inf > 0 && inf - p < 60 ? inf : -1; if (xi > 0 && (buf.readUInt32BE(xi + 4) & 1)) { const frames = buf.readUInt32BE(xi + 8), sr = [[11025, 12000, 8000], [0, 0, 0], [22050, 24000, 16000], [44100, 48000, 32000]][ver][(buf[p + 2] >> 2) & 3] || 44100; return frames * (ver === 3 ? 1152 : 576) / sr; } return size * 8 / (kb * 1000); } return 0; }
function mp4Dur(buf) { const i = buf.indexOf('mvhd'); if (i < 0) return 0; const v = buf[i + 4]; return v === 1 ? Number(buf.readBigUInt64BE(i + 24)) / buf.readUInt32BE(i + 20) : buf.readUInt32BE(i + 16) ? buf.readUInt32BE(i + 20) / buf.readUInt32BE(i + 16) : 0; }
function duration(file) { try { const st = fs.statSync(file), fd = fs.openSync(file, 'r'), buf = Buffer.alloc(Math.min(st.size, 262144)); fs.readSync(fd, buf, 0, buf.length, 0); fs.closeSync(fd); const ext = path.extname(file).toLowerCase(); return Math.round((ext === '.wav' ? wavDur(buf) : ext === '.mp3' ? mp3Dur(buf, st.size) : ext === '.m4a' ? mp4Dur(buf) : 0) * 10) / 10; } catch (e) { return 0; } }
function credit(dir, file) { const out = {}; const read = f => { if (!fs.existsSync(f)) return; for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) { const m = line.match(/^\s*(출처|source)\s*[:：]\s*(.+)$/i); if (m) out.source = m[2].trim(); const l = line.match(/^\s*(라이선스|license)\s*[:：]\s*(.+)$/i); if (l) out.license = l[2].trim(); } }; read(path.join(dir, '_출처.txt')); read(file.replace(EXT, '.txt')); return out; }
function title(name) { return name.replace(EXT, '').replace(/^\d+[\s._-]+/, '').replace(/[_]+/g, ' ').trim(); }
function walk(root) { const out = []; if (!fs.existsSync(root)) return out; for (const sub of fs.readdirSync(root, { withFileTypes: true })) { if (!sub.isDirectory()) continue; const dir = path.join(root, sub.name); for (const f of fs.readdirSync(dir)) if (EXT.test(f)) out.push({ dir, sub: sub.name, f }); } return out; }

const music = walk(path.join(HERE, 'music')).map(({ dir, sub, f }) => Object.assign({ file: 'music/' + sub + '/' + f, title: title(f), mood: sub, dur: duration(path.join(dir, f)) }, credit(dir, path.join(dir, f))));
const sfx = walk(path.join(HERE, 'sfx')).map(({ dir, sub, f }) => Object.assign({ file: 'sfx/' + sub + '/' + f, title: title(f), replace: sub, dur: duration(path.join(dir, f)) }, credit(dir, path.join(dir, f))));
music.sort((a, b) => a.mood.localeCompare(b.mood, 'ko') || a.title.localeCompare(b.title, 'ko'));
const lib = { generated: new Date().toISOString().slice(0, 10), music, sfx };
fs.writeFileSync(path.join(HERE, 'library.json'), JSON.stringify(lib, null, 1) + '\n');
console.log('library.json — 음악 ' + music.length + '곡 · 효과음 ' + sfx.length + '개' + (music.length ? '\n  무드: ' + [...new Set(music.map(m => m.mood))].join(', ') : ''));
const bad = sfx.filter(s => !['whooshShort', 'whooshLong', 'riser', 'impactLow', 'impactSoft', 'subBoom', 'lightSweep', 'sparkle', 'ding', 'typeTick', 'paper', 'click', 'popSoft', 'filmRoll', 'breath', 'cadence', 'shutter', 'countTick'].includes(s.replace));
if (bad.length) console.log('  ⚠ 효과음 폴더 이름이 합성 id 가 아니라 자동으로 안 붙어요: ' + [...new Set(bad.map(s => s.replace))].join(', ') + ' (README 표 참고)');

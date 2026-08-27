#!/usr/bin/env node
/* ============================================================
   컬러 룩 LUT 생성기 — .cube (필모라·프리미어·리졸브 공용)
   사용: node make-lut.mjs            → lut/*.cube 전부 생성
   룩은 "잘 만든 기본값" 원칙: 튀지 않게, 촬영 원본의 밋밋함만 걷어낸다.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const N = 33;
const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
const lerp = (a, b, u) => a + (b - a) * u;

// 부드러운 S커브 (대비) — 중간 회색 고정
function scurve(v, k) { return v < .5 ? .5 * Math.pow(2 * v, 1 + k) : 1 - .5 * Math.pow(2 * (1 - v), 1 + k); }
function lum(r, g, b) { return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function sat(r, g, b, s) { const l = lum(r, g, b); return [lerp(l, r, s), lerp(l, g, s), lerp(l, b, s)]; }
// 스플릿 톤: 그림자에 tone1, 하이라이트에 tone2 를 살짝
function split(r, g, b, shadow, high, amt) {
  const l = lum(r, g, b), sh = Math.pow(1 - l, 2) * amt, hi = Math.pow(l, 2) * amt;
  return [clamp(r + shadow[0] * sh + high[0] * hi), clamp(g + shadow[1] * sh + high[1] * hi), clamp(b + shadow[2] * sh + high[2] * hi)];
}

const LOOKS = {
  // 밝은 교실 — 화사하고 깨끗. 그림자 살짝 들어올리고, 하이라이트 따뜻하게, 채도 소폭.
  'classroom-bright': (r, g, b) => {
    let v = [r, g, b].map(c => scurve(c, 0.22));            // 대비
    v = v.map(c => lerp(0.035, 1.0, c));                    // 그림자 리프트 (뿌연 필름감 아주 조금)
    v = sat(...v, 1.12);                                    // 채도
    v = split(...v, [-0.015, 0.0, 0.03], [0.035, 0.02, -0.02], 0.9); // 그림자 차갑게·밝은 곳 따뜻하게
    return v.map(clamp);
  },
  // 시네마 네이비 — 금성초 브랜드용. 그림자를 네이비로, 피부톤은 유지. 인터뷰·소개 컷에.
  'cinema-navy': (r, g, b) => {
    let v = [r, g, b].map(c => scurve(c, 0.34));
    v = v.map(c => lerp(0.05, 0.985, c));
    v = sat(...v, 0.96);
    v = split(...v, [-0.02, 0.005, 0.06], [0.04, 0.025, -0.015], 1.1);
    return v.map(clamp);
  },
  // 따뜻한 회상 — 행사 기록·추억 컷. 노랗게 기울고 대비 낮춤.
  'warm-memory': (r, g, b) => {
    let v = [r, g, b].map(c => scurve(c, 0.08));
    v = v.map(c => lerp(0.06, 0.97, c));
    v = sat(...v, 0.9);
    v = split(...v, [0.02, 0.0, -0.03], [0.06, 0.035, -0.03], 1.2);
    return v.map(clamp);
  },
};

for (const [name, fn] of Object.entries(LOOKS)) {
  const lines = [`TITLE "K-Maker ${name}"`, `LUT_3D_SIZE ${N}`, 'DOMAIN_MIN 0 0 0', 'DOMAIN_MAX 1 1 1'];
  for (let bi = 0; bi < N; bi++) for (let gi = 0; gi < N; gi++) for (let ri = 0; ri < N; ri++) {
    const v = fn(ri / (N - 1), gi / (N - 1), bi / (N - 1));
    lines.push(v.map(c => c.toFixed(5)).join(' '));
  }
  const f = path.join(__dirname, `${name}.cube`);
  fs.writeFileSync(f, lines.join('\n') + '\n');
  console.log('✔', f, (fs.statSync(f).size / 1024).toFixed(0) + 'KB');
}

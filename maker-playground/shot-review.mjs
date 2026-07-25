/* shot-review.mjs — 검수용 캡처 일괄 생성
 *
 * 쓰는 법
 *   node shot-review.mjs                    기본 화면 세트
 *   node shot-review.mjs home,editor,ftue   플레이그라운드 화면 지정
 *   node shot-review.mjs /kpark/,/kmake/    일반 경로 지정 (슬래시 포함시 경로로 인식)
 *   node shot-review.mjs all                플레이그라운드 전체 화면
 *
 * 결과: shots/review/ 에 PNG + INDEX.md
 */
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import path from 'path';

const PORT = process.env.SHOT_PORT || 8913;
const ORIGIN = process.env.SHOT_ORIGIN || `http://127.0.0.1:${PORT}`;
const PG_URL = `${ORIGIN}/maker-playground/index.html`;
const OUT = 'shots/review';
const WAIT = Number(process.env.SHOT_WAIT || 1100);

const DEFAULT_SET = ['home', 'create', 'editor', 'library', 'export', 'ftue', 'mobile'];

const VIEWPORTS = [
  { tag: 'pc', width: 1440, height: 900 },
  { tag: 'mo', width: 420, height: 860 },
];

/* ── 대상 해석 ────────────────────────────────── */
const raw = (process.argv[2] || '').trim();
let targets;
if (!raw) targets = DEFAULT_SET.map((k) => ({ kind: 'pg', key: k }));
else if (raw === 'all') {
  const keys = fs.readdirSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'screens'))
    .filter((f) => f.endsWith('.js')).map((f) => f.replace(/\.js$/, '')).sort();
  targets = keys.map((k) => ({ kind: 'pg', key: k }));
} else {
  targets = raw.split(',').map((s) => s.trim()).filter(Boolean)
    .map((s) => (s.includes('/') ? { kind: 'url', key: s } : { kind: 'pg', key: s }));
}

/* ── 준비 ─────────────────────────────────────── */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pad = (n) => String(n).padStart(2, '0');

const br = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args,
  headless: 'shell',
});

const rows = [];
let idx = 0;

for (const t of targets) {
  idx += 1;
  const label = t.kind === 'pg' ? t.key : t.key.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'root';
  const url = t.kind === 'pg' ? `${PG_URL}#/${t.key}` : `${ORIGIN}${t.key.startsWith('/') ? t.key : '/' + t.key}`;

  for (const vp of VIEWPORTS) {
    const file = `${pad(idx)}_${label}_${vp.tag}.png`;
    const pg = await br.newPage();
    try {
      await pg.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
      await pg.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
      await wait(WAIT);
      if (t.kind === 'pg') {
        const ok = await pg.evaluate((k) => {
          if (!window.PG || !window.MK_SCREENS || !window.MK_SCREENS[k]) return false;
          window.PG.go(k);
          return true;
        }, t.key);
        if (!ok) throw new Error(`화면 키 없음: ${t.key}`);
        await wait(WAIT);
      }
      await pg.screenshot({ path: `${OUT}/${file}`, fullPage: true });
      rows.push({ file, vp: vp.tag, url, note: '' });
      console.log(`✓ ${file}`);
    } catch (e) {
      const msg = String(e.message).split('\n')[0].slice(0, 80);
      rows.push({ file: '—', vp: vp.tag, url, note: `실패: ${msg}` });
      console.log(`✗ ${file}  ${msg}`);
    } finally {
      await pg.close();
    }
  }
}

await br.close();

/* ── INDEX.md ─────────────────────────────────── */
const stamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
const okCount = rows.filter((r) => !r.note).length;
const lines = [
  `# 케이에듀 검수 캡처`,
  ``,
  `- 생성: ${stamp}`,
  `- 기준: ${ORIGIN}`,
  `- 성공 ${okCount} / 전체 ${rows.length}`,
  ``,
  `| 파일 | 화면폭 | 주소 | 비고 |`,
  `| --- | --- | --- | --- |`,
  ...rows.map((r) => `| ${r.file} | ${r.vp === 'pc' ? 'PC 1440' : '모바일 420'} | \`${r.url}\` | ${r.note} |`),
  ``,
  `## 검수 요청 문구 (복사해서 쓰세요)`,
  ``,
  `> 케이메이커 검수 캡처입니다. 위 표가 파일-화면 대응표입니다.`,
  `> 각 화면마다 (1) 즉시 눈에 걸리는 것 (2) 계층·여백·정렬 (3) 첫 사용자 관점 순으로`,
  `> P0/P1/P2 등급을 매겨 짚어주세요. 화면명과 위치를 함께 적어주세요.`,
  ``,
];
fs.writeFileSync(`${OUT}/INDEX.md`, lines.join('\n'), 'utf8');

console.log(`\n완료 → ${OUT}/  (성공 ${okCount}/${rows.length})`);
if (okCount === 0) process.exit(1);

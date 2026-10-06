/* parse_selfdirected_soc4.js — 자기주도 사회 4-1(「3-1 l01 구조 복제」 골격) 차시 HTML → 케이티처 재료 JSON (76차, 베프).
   사용: NODE_PATH=/home/claude/.jsdom/node_modules node parse_selfdirected_soc4.js <단원 폴더> <out.json>
   3-2 사회 추출기(parse_selfdirected_soc.js · 무개변)를 그대로 불러 18장·Q[8]를 읽고, 4-1 꼴에서 다른 셋만 더 읽는다:
   ① 제목 = <title> 앞쪽(머리 주석에 「」 없음) ② 지도서 차시 = 머리 주석 「지도서 N차시」·「N~M차시」(없으면 null — 생성기 T 표가 정본)
   ③ 판 표 = 페이지 맨 위 대문자 상수(PLACES·BANDS·LOC·STATIONS·ELEMENTS·LANDFORMS·YEARS·SEASONS·GEOINFO·PIXELS·TERMS …) — svg 조각(sym·path) 은 뺀다.
   4-1 18장: 1~3 들어가기(3 = 발문 답 reveal) · 4 살펴보기 뜻 · 5 직접조작 판 · 6 발문 답 reveal · 7 여기까지 정리 · 8~15 문항(확인 4 + 적용 4, 4택) · 16 정리 · 17 스스로 돌아봐요 · 18 끝. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const base = require('./parse_selfdirected_soc.js');
const SKIP = new Set(['SVG', 'POINTS_BASIC', 'POINTS_APPLY', 'META', 'Q', 'LS_KEY']);
function parse(file) {
  const out = base.parse(file);
  const src = fs.readFileSync(file, 'utf8');
  const head = src.slice(0, 2500);
  const tm = src.match(/<title>(.*?)<\/title>/); out.title = tm ? tm[1].replace(/\s*·\s*사회 4-1\s*$/, '').trim() : out.title;
  const g = head.match(/지도서[^\n]*?(\d+)(?:~(\d+))?차시/); out.guide_note = g ? g[0] : '';
  const sp = head.split('\n')[2] || ''; out.topic = (sp.match(/· (①[^·]*|②[^·]*|대단원 정리)/) || [, ''])[1].trim();
  out.board = (head.match(/직접조작[:：]?\s*([^\n]*)/) || [, ''])[1].trim();
  const dom = new JSDOM(src, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
  const w = dom.window;
  const scr = src.slice(src.indexOf('<script>'));
  const names = [...new Set((scr.match(/\n(?:const|let) ([A-Z][A-Z_0-9]*) *=/g) || []).map(m => m.replace(/\n(?:const|let) | *=/g, '')))].filter(n => !SKIP.has(n));
  const strip = (v) => { if (Array.isArray(v)) return v.map(strip); if (v && typeof v === 'object') { const o = {}; Object.keys(v).forEach(k => { const x = v[k]; if (typeof x === 'string' && /<(path|rect|circle|svg|text|g|line|polygon)\b/.test(x)) return; o[k] = strip(x); }); return o; } return v; };
  out.board_data = {};
  names.forEach(nm => { try { out.board_data[nm] = strip(JSON.parse(JSON.stringify(w.eval(nm)))); } catch (e) { } });
  out.q_scene = (w.eval('Q') || []).map(q => q.scene || null);
  w.close();
  return out;
}
module.exports = { parse };
if (require.main === module) {
  const [d, o] = process.argv.slice(2);
  const files = fs.readdirSync(d).filter(f => /^g\d_\w+_u\d+_l\d+.*\.html$/.test(f)).sort();
  const res = {};
  files.forEach(f => { res[f.match(/_(u\d+_l\d+)_/)[1]] = parse(path.join(d, f)); });
  fs.writeFileSync(o, JSON.stringify(res, null, 1));
  const ks = Object.keys(res);
  console.log(o, ks.length, '차시', ks.reduce((a, k) => a + res[k].slides.length, 0), '장', ks.reduce((a, k) => a + res[k].problems.length, 0), '문항');
}

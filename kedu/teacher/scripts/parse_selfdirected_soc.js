/* parse_selfdirected_soc.js — 자기주도 사회(3-2, ka- 사회 골격) 차시 HTML → 케이티처 재료 JSON (45차, 베프).
   사용: NODE_PATH=/home/claude/.jsdom/node_modules node parse_selfdirected_soc.js <단원 폴더> <out.json>
   사회 3-2 자기주도는 수학·국어·과학 꼴 모두와 다르다 — 페이지 스크립트가 slides.push({stage,badge,reveal,render}) 로 18장을 만든다:
   1 들어가기 · 2~7 살펴보기(개념 · reveal 장은 답 상자) · 8~15 문항 Q[8](모두 3택 mcq: stem·opts·correct·reason·h1·h2·pts) · 16 정리 · 17 스스로 돌아보기 · 18 끝.
   그래서 jsdom 으로 페이지를 띄우고 slides[i].render(state) 를 답 공개 상태로 불러 그린 HTML 을 읽는다(파일 무개변).
   차시마다: file·title·std·textbook·guide(지도서 차시)·n·covers·board(직접조작 머리 주석)·slides[{i,stage,badge,title,bub,scene,note,answer[],items[],panel}]·problems[{t,opts,ci,reason,hints,pts}]·summary[]·next·self[]·end_note.
   <b>/<span class="ka-emph"> → **굵게**. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const clean = (s) => String(s || '').replace(/\s*\n\s*/g, ' ').replace(/\*\*\*\*/g, '').replace(/\s+/g, ' ').trim();
function md(el) {
  if (!el) return '';
  const c = el.cloneNode(true);
  c.querySelectorAll('br').forEach(b => b.replaceWith('\n'));
  c.querySelectorAll('b,strong,.ka-emph').forEach(b => b.replaceWith('**' + b.textContent + '**'));
  return String(c.textContent).split('\n').map(clean).filter(Boolean).join('\n').replace(/\*\*\s*\*\*/g, '');
}
function parse(file) {
  const src = fs.readFileSync(file, 'utf8');
  const head = src.slice(0, 4000);
  const g = (re, d = '') => { const m = head.match(re); return m ? m[1].trim() : d; };
  const out = { file: path.basename(file), title: g(/「(.*?)」/), textbook: g(/교과서 (p\.[\d~]+)/), guide: g(/지도서 (\d+(?:~\d+)?)차시/), std: (head.match(/\[4사\d\d-\d\d\]/g) || []).filter((v, i, a) => a.indexOf(v) === i).join(''), topic: g(/(주제[①-⑨][^\n]*?) · l\d+/), method: g(/수업 기법 = (.*)/), board: g(/■ 직접조작 = (.*)/), slides: [], problems: [], summary: [], next: '', self: [], end_note: '' };
  const [a, b] = out.guide.split('~').map(Number); out.n = a; out.covers = b ? [a, b] : [a];
  const dom = new JSDOM(src, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
  const w = dom.window;
  const slides = w.eval('slides'), state = w.eval('state'), Q = w.eval('typeof Q!=="undefined"?Q:[]');
  out.problems = Q.map(q => ({ t: clean(q.stem.replace(/<[^>]+>/g, '')), stem_html: q.stem, opts: q.opts.map(o => clean(String(o).replace(/<[^>]+>/g, ''))), ci: q.correct, reason: clean(String(q.reason).replace(/<[^>]+>/g, '')), hints: [q.h1, q.h2].map(h => clean(String(h || '').replace(/<[^>]+>/g, ''))), pts: q.pts }));
  const box = w.document.createElement('div');
  slides.forEach((s, i) => {
    if (s.q != null) return;
    if (s.reveal) s._revealed = true;
    state.revealed = !!s.reveal;
    let html = ''; try { html = s.render(state); } catch (e) { html = '<h2 class="ka-t">(그리기 실패 ' + e.message + ')</h2>'; }
    box.innerHTML = html;
    const q = (sel) => box.querySelector(sel), qa = (sel) => [...box.querySelectorAll(sel)];
    const sl = { i, stage: s.stage, badge: s.badge, reveal: !!s.reveal, title: md(q('.ka-t')), bub: md(q('.ka-bub')), scene: qa('.scene-row .sc-cap,.scene-row figcaption,.scene-row .cap').map(md).filter(Boolean), note: qa('.note').map(md).join('\n'), answer: q('.answer-box') ? md(q('.answer-box')).split('\n').map(x => x.replace(/^·\s*/, '')) : [], items: qa('.sum-item').map(x => { const c = x.cloneNode(true); c.querySelectorAll('.n').forEach(n => n.remove()); return md(c); }) };
    if (!sl.scene.length) { const sr = q('.scene-row'); if (sr) sl.scene = [md(sr)].filter(Boolean); }
    if (!sl.bub && !sl.answer.length && !sl.items.length && s.stage === 2) { sl.kind = 'board'; sl.panel = md(box).slice(0, 1500); }
    if (s.stage === 1) sl.kind = 'intro';
    else if (s.end) { sl.kind = 'end'; out.end_note = md(q('.note')); }
    else if (qa('.check').length) { sl.kind = 'self'; out.self = qa('.check').map(md); }
    else if (s.stage === 5) { sl.kind = 'recap'; out.summary = sl.items; out.recap_note = md(q('.note')); out.next = out.recap_note.split('\n').filter(x => /다음 시간/.test(x)).join(' '); }
    else if (!sl.kind) sl.kind = sl.reveal ? 'reveal' : 'concept';
    out.slides.push(sl);
  });
  out.board_data = {}; /* 직접조작 판의 표(CH_SPOT·BW_BIRTH·DS_CARD … · *_READQ·*_FINQ 는 판 읽기·마무리 3택) — 그대로 읽는다 */
  [...new Set((src.match(/\nconst ([A-Z]{2}_[A-Z_]+) *=/g) || []).map(m => m.replace(/\nconst | *=/g, '')))].forEach(nm => { try { out.board_data[nm] = JSON.parse(JSON.stringify(w.eval(nm))); } catch (e) { } });
  w.close();
  return out;
}
if (require.main === module) {
  const [d, o] = process.argv.slice(2);
  const files = fs.readdirSync(d).filter(f => /^g\d_\w+_u\d+_l\d+.*\.html$/.test(f)).sort();
  const res = {};
  files.forEach(f => { res[f.match(/_(u\d+_l\d+)_/)[1]] = parse(path.join(d, f)); });
  fs.writeFileSync(o, JSON.stringify(res, null, 1));
  const ks = Object.keys(res);
  console.log(o, ks.length, '차시', ks.reduce((a, k) => a + res[k].slides.length, 0), '장', ks.reduce((a, k) => a + res[k].problems.length, 0), '문항');
}
module.exports = { parse };

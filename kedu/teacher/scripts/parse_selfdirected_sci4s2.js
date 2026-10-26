/* parse_selfdirected_sci4s2.js — 자기주도 과학 4-2(g4_sci, LESSON_ID g4_s2_sci_…) → 케이티처 재료 JSON (204차, 베프).
   4-1 추출기(parse_selfdirected_sci4.js) 를 그대로 쓰고, 4-2 원문은 intro-meta 에 차시가 없어 머리 주석 「(N/11차시)」·「성취기준 [...]」을 읽어
   키를 **차시 번호**(묶음은 첫 번호 — 4~5 → u1_l04)로 다시 단다 · file_key = 원문 파일 키(u1_l05 등).
   (build_projmap.js 는 재료 키를 그대로 케이티처 키로 쓰므로 반드시 차시 번호 키여야 함)
   (205차) 2단원 l04 머리 「(**4~5/10 연차시 통합 1파일」 꼴도 읽음.
   (206차) 3단원 l07·l08·l09 머리 「(8~9/11)」 꼴(차시 글자 없음)도 읽음 · l04·l05 처럼 머리에 차시가 아예 없으면
   셋째 인자 「l04=4/11,l05=5/11」(원문 파일 키 = 차시/전체, 핸드오프 _PLAN.md 차시 표 그대로)로 채움.
   사용: node parse_selfdirected_sci4s2.js <단원 폴더> <out.json> [l04=4/11,...] */
const fs = require('fs');
const path = require('path');
const { parse } = require('./parse_selfdirected_sci4.js');
const [d, o, ov] = process.argv.slice(2);
const OV = {}; (ov || '').split(',').filter(Boolean).forEach(x => { const [k, v] = x.split('='); const [n, of] = v.split('/'); OV[k] = [null, n, of]; });
const U = +(path.basename(d).match(/^(\d+)단원/) || [0, 0])[1];
const files = fs.readdirSync(d).filter(f => /^g\d_\w+_u\d+_l\d+.*\.html$/.test(f)).sort();
const res = {};
files.forEach(f => {
  const s = parse(path.join(d, f)); const head = fs.readFileSync(path.join(d, f), 'utf8').slice(0, 3000);
  const m = head.match(/\(\**(\d+(?:~\d+)?)\/(\d+)(?: ?연?차시|\))/) || OV[(f.match(/_u\d+_(l\d+)_/) || [])[1]]; if (!m) throw new Error(f + ' 차시 주석 없음');
  const st = head.match(/성취기준 (\[[^\]]+\])/);
  s.n = m[1]; s.of = +m[2]; s.std = st ? st[1] : ''; s.file_key = f.match(/_(u\d+_l\d+)_/)[1];
  res['u' + U + '_l' + String(+m[1].split('~')[0]).padStart(2, '0')] = s;
});
fs.writeFileSync(o, JSON.stringify(res, null, 1));
const ks = Object.keys(res);
console.log(o, ks.length, '차시 키', ks.join(','), '·', ks.reduce((a, k) => a + res[k].slides.length, 0), '장', ks.reduce((a, k) => a + res[k].problems.length, 0), '문제');

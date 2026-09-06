/* 케이탐정 화면 스모크 — jsdom 으로 두 페이지를 열고 한 판 돌린다. node kdetective/tests/pages.spec.js */
'use strict';
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } };
const ROOT = path.join(__dirname, '..', '..');
function open(rel) {
  let html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  // 공용 스크립트(게이트·박스바·돌아가기·폰트)는 스모크에서 뺀다
  html = html.replace(/<script src="\/kedu_[^"]+"><\/script>/g, '').replace(/<link [^>]*fonts[^>]*>/g, '');
  const dir = path.dirname(path.join(ROOT, rel));
  html = html.replace(/<script src="(\.\.?\/[^"]+)"><\/script>/g, (m, src) => '<script>' + fs.readFileSync(path.join(dir, src), 'utf8') + '</script>');
  const errors = [];
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://keduclass.com/' + rel.replace(/index\.html$/, '') });
  dom.window.addEventListener('error', e => errors.push(e.message));
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  return { dom, w: dom.window, d: dom.window.document, errors };
}

console.log('[사무소 입구]');
{
  const { d, errors } = open('kdetective/index.html');
  ok(errors.length === 0, '스크립트 오류 없음 ' + errors.join('|'));
  ok(d.querySelectorAll('#grid .folder').length === 4, '사건 파일 4개');
  ok(d.querySelectorAll('#grid a.folder').length === 1, '열린 파일 1개(사건 1)');
  ok(d.getElementById('rankNm').textContent === '견습 탐정', '빈 기록 = 견습');
  ok(d.querySelectorAll('#trusted span').length === 7, '수첩에 믿을 만한 곳 7');
}

console.log('[사건 1 · 찾기 한 판]');
{
  const { w, d, errors } = open('kdetective/case1/index.html');
  ok(errors.length === 0, '로드 오류 없음 ' + errors.join('|'));
  ok(d.querySelectorAll('#levels .opt').length === 5 && d.querySelectorAll('#levels .opt:disabled').length === 4, '레벨 5개 중 L1만 열림');
  d.getElementById('start').click();
  ok(d.getElementById('play').classList.contains('hide') === false, '사건 접수 → 판 열림');
  ok(d.getElementById('nTitle').textContent.length > 5, '기사 카드 채워짐');
  // 근거 없이 신고 → 막힘
  d.getElementById('submit').click();
  ok(d.getElementById('fb').classList.contains('on') === false, '아무것도 안 찍고 신고 → 막힘');
  // 5판 돌리기: 매번 제목을 찍고 과장 근거 → 결과 화면까지
  for (let i = 0; i < 5; i++) {
    d.getElementById('nTitle').click();
    const chips = d.querySelectorAll('#chips .opt');
    if (i === 0) ok(chips.length === 4, '자리 찍으면 근거 4개');
    chips[0].click();
    d.getElementById('submit').click();
    if (i === 0) ok(d.getElementById('fb').classList.contains('on') && /점/.test(d.getElementById('fb').textContent), '신고 → 피드백');
    d.getElementById('next').click();
  }
  ok(!d.getElementById('result').classList.contains('hide'), '5판 뒤 결과 화면');
  const rec = JSON.parse(w.localStorage.getItem('kdetective.v1'));
  ok(rec && rec.solved === 1 && typeof rec.best['case1.find.l1'] === 'number', '기록 저장(localStorage)');
  ok(errors.length === 0, '한 판 도중 오류 없음 ' + errors.join('|'));
}

console.log('[사건 1 · 만들기]');
{
  const { w, d, errors } = open('kdetective/case1/index.html');
  d.getElementById('tabMake').click();
  ok(!d.getElementById('make').classList.contains('hide') && d.getElementById('mTitle').textContent.length > 5, '만들기 탭 → 기사 로드');
  d.getElementById('send').click();
  ok(d.getElementById('verdict').classList.contains('on') === false, '안 바꾸고 보내면 탐정이 안 읽음');
  // 교묘한 제목 후보 B 선택 후 보내기
  const tChips = d.querySelectorAll('#mkTitle .opt'); tChips[2].click();
  ok(/\S/.test(d.getElementById('mTitle').textContent) && d.getElementById('mTitle').textContent !== d.getElementById('mBody').textContent, '미리보기 제목 바뀜');
  d.getElementById('send').click();
  ok(!d.getElementById('reading').classList.contains('hide'), '읽는 중 표시');
  return new Promise(res => setTimeout(res, 1600)).then(() => {
    ok(d.getElementById('verdict').classList.contains('on') && /통과|검거/.test(d.getElementById('vH').textContent), '판정 나옴');
    const rec = JSON.parse(w.localStorage.getItem('kdetective.v1'));
    ok(rec && typeof rec.best['case1.make'] === 'number', '만들기 기록 저장');
    ok(errors.length === 0, '만들기 오류 없음 ' + errors.join('|'));
    console.log(`\n${pass} pass / ${fail} fail`); process.exit(fail ? 1 : 0);
  });
}

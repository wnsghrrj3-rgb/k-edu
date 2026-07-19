/* 케이파크 · 칠교놀이 — UI 스모크 (jsdom)
 * 실행: node kpark/tangram/tests/ui.smoke.js  (jsdom 임시 설치 필요) */
'use strict';
const path = require('path');
const { JSDOM } = require('jsdom');

let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } }

(async () => {
  const dom = await JSDOM.fromFile(path.join(__dirname, '..', 'index.html'), {
    resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true
  });
  const { window } = dom;
  const doc = window.document;
  await new Promise(r => setTimeout(r, 900)); // core.js 로드 대기

  console.log('[고르기 화면]');
  const cards = doc.querySelectorAll('.pcard');
  ok(cards.length === 23, '카드 23개 (퍼즐 22 + 자유 만들기)');
  ok(doc.querySelectorAll('.pcard svg').length === 22, '미니 실루엣 22개');
  const names = Array.from(doc.querySelectorAll('.pcard .nm')).map(e => e.textContent);
  ok(names.includes('네모') && names.includes('나무'), '⭐1 이름 공개 (네모·나무)');
  ok(names.filter(n => n === '? ? ?').length === 19, '⭐2·⭐3·🧭 이름 가림 19개');

  console.log('[퍼즐 입장]');
  cards[0].dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 250));
  ok(doc.getElementById('playView').style.display === 'block', 'playView 표시');
  ok(doc.getElementById('dots').children.length === 7, '진행 점 7개');
  const board = doc.getElementById('board');
  const groups = board.querySelectorAll('g');
  const piecePolys = groups[groups.length - 1].querySelectorAll('polygon');
  ok(piecePolys.length === 7, '조각 폴리곤 7개');
  const silPolys = groups[0].querySelectorAll('polygon');
  ok(silPolys.length === 7, '실루엣 슬롯 7개');
  ok(!!board.getAttribute('viewBox'), 'viewBox 설정됨');
  ok(doc.getElementById('pname').textContent === '네모', '⭐1 퍼즐 제목 공개');

  console.log('[다음 그림 순환]');
  doc.getElementById('btnNext').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 200));
  ok(doc.getElementById('pname').textContent === '세모', '다음 → 세모');

  console.log('[자유 만들기]');
  doc.getElementById('btnBack').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 200));
  const freeCard = doc.querySelector('.pcard.freec');
  ok(!!freeCard, '자유 만들기 카드 존재');
  freeCard.dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 250));
  ok(doc.getElementById('btnSave').style.display !== 'none', '작품 저장 버튼 표시');
  ok(doc.getElementById('btnHint').style.display === 'none', '자유 모드 힌트 숨김');
  const g2 = board.querySelectorAll('g');
  ok(g2[g2.length - 1].querySelectorAll('polygon').length === 7, '자유 모드 조각 7개');

  console.log('[🧭 스스로 찾기]');
  doc.getElementById('btnBack').dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 200));
  const exCard = doc.querySelectorAll('.pcard')[10]; // 11번째 = 첫 🧭 카드(오리)
  exCard.dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 250));
  ok(doc.getElementById('pname').textContent === '? ? ?', '🧭 제목 가림');
  ok(doc.getElementById('pstars').textContent.indexOf('🧭') === 0, '🧭 표기');
  const gEx = board.querySelectorAll('g');
  ok(gEx[0].querySelectorAll('polygon').length === 7, '🧭 실루엣 7개');
  // ⭐1식 안내선 g가 없어야: 실루엣 g + (빈 힌트 g) + 조각 g = 3
  ok(gEx.length === 3, '🧭 안내선 레이어 없음 (g 3개)');
  ok(gEx[1].querySelectorAll('polygon').length === 0, '🧭 자리 안내 폴리곤 0개');

  console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
  window.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

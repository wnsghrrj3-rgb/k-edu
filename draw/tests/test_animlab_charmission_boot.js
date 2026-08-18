/* 애니 공방 — jsdom 실부팅 스모크 (캐릭터 미션 승격 + ✏️ 한 장 고치러 가기)
   본보기 적재로 8장을 채운 뒤 🦊 코코 달리기 미션 선택 → 즉시 완성 → 🎭 → 탭 점프 검증. */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
let html=fs.readFileSync(path.join(__dirname,'..','..','labs','animlab.html'),'utf8');
const kchar=fs.readFileSync(path.join(__dirname,'..','..','labs','kchar-core.js'),'utf8');
html=html.replace('<script src="kchar-core.js"></script>','<script>'+kchar+'</script>');
let pass=0,fail=0;
const t=(n,c)=>{if(c){pass++;console.log('  ✓ '+n)}else{fail++;console.log('  ✗ '+n)}};
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://keduclass.com/labs/animlab.html',pretendToBeVisual:true,
  beforeParse(w){ w.fetch=()=>Promise.reject(new Error('jsdom: no network')); w.confirm=()=>true; }});
const win=dom.window,doc=win.document;

t('부팅 — duetJumpFrame 로직 존재', !!win.AnimLab && typeof win.AnimLab.duetJumpFrame==='function');

/* ① 미션 패널 — 학년 탭마다 캐릭터 미션 카드(📽️ 배지 포함) */
doc.getElementById('missionBtn').click();
function cardsOf(g){
  const tab=[...doc.querySelectorAll('#gradeTabs .gt')].find(b=>b.dataset.g===g);
  tab.click();
  return [...doc.querySelectorAll('#mlist .mcard')];
}
t('1~2학년 탭 — 🤖 케이봇 두리번 카드+📽️',
  cardsOf('1-2').some(c=>c.textContent.includes('케이봇 두리번')&&c.querySelector('.mlink')));
t('3~4학년 탭 — 🐻 포근이 기지개 카드+📽️',
  cardsOf('3-4').some(c=>c.textContent.includes('포근이 기지개')&&c.querySelector('.mlink')));
const cards56=cardsOf('5-6');
t('5~6학년 탭 — 🦊 코코 달리기 카드+📽️ (총 4장)',
  cards56.length===4 && cards56.some(c=>c.textContent.includes('코코 달리기')&&c.querySelector('.mlink')));

/* ② 캐릭터 본보기 적재(8장 실그림) → 코코 미션 재선택 = 즉시 완성 */
doc.getElementById('t-sample').click();
const rows=[...doc.querySelectorAll('#sampleList > div')].filter(r=>r.querySelector('canvas'));
rows.find(r=>r.textContent.includes('코코 달리기')).querySelectorAll('button')[0].click();
t('본보기 적재 → 8장', doc.querySelectorAll('#frames .thumb').length===8);
doc.getElementById('missionBtn').click();
cardsOf('5-6').find(c=>c.textContent.includes('코코 달리기')).click();
t('미션 선택 → fps 10 자동', doc.getElementById('fpsLbl').textContent.indexOf('10')===0);
t('needGuide → 겹쳐보기 자동 켜짐', doc.getElementById('onionBtn').classList.contains('on'));
t('👻 따라 그리기 버튼 노출', doc.getElementById('ghostBtn').style.display!=='none');
const gd=doc.querySelector('#guideBand .gduet');
t('완성 → 🎭 버튼 노출', gd!==null);

/* ③ 🎭 열고 ✏️ 내 그림 탭 → 그 장으로 점프 */
gd.click();
const dw=doc.getElementById('duetWrap');
t('🎭 열림 — 본보기 이름 = 코코 달리기', dw.classList.contains('show')
  && doc.getElementById('duetSmpName').textContent==='코코 달리기');
doc.getElementById('duetMine').click();                       // 첫 rAF 전 = 0장으로
t('탭 → 듀엣 닫힘', !dw.classList.contains('show'));
const on0=doc.querySelector('#frames .thumb.on');
t('1장으로 점프(첫 순간 탭 = 0장)', on0 && +on0.dataset.i===0);
t('점프 토스트 — 장 번호 안내', doc.getElementById('toast').textContent.includes('1장'));
t('가이드밴드 복귀(고치기 이어가기)', doc.getElementById('guideBand').classList.contains('show'));

/* ④ 재생이 좀 흐른 뒤 탭 → 토스트의 장 번호와 실제 선택 장이 일치(자기 일관) */
doc.querySelector('#guideBand .gduet').click();
setTimeout(function(){
  doc.getElementById('duetMine').click();
  const mTx=doc.getElementById('toast').textContent.match(/(\d+)장/);
  const on=doc.querySelector('#frames .thumb.on');
  t('흐른 뒤 탭 — 토스트 장번호 = 선택된 장', !!mTx && !!on && (+mTx[1]-1)===+on.dataset.i);
  t('듀엣 상태 정리(재탭 무해)', !dw.classList.contains('show'));
  console.log('\n'+(fail?('실패 '+fail+'건 — '):'전체 통과 ')+pass+'/'+(pass+fail));
  process.exit(fail?1:0);
},320);

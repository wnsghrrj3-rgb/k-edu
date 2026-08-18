/* 애니 공방 — jsdom 실부팅 스모크 (👻 따라 그리기 배선)
   외부 스크립트(/kedu_*.js)는 jsdom에서 미적재 — 인라인 코드는 전부 가드됨. */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
let html=fs.readFileSync(path.join(__dirname,'..','..','labs','animlab.html'),'utf8');
/* kchar-core는 상대 src — 인라인으로 심어 리그 본보기까지 실동작 */
const kchar=fs.readFileSync(path.join(__dirname,'..','..','labs','kchar-core.js'),'utf8');
html=html.replace('<script src="kchar-core.js"></script>','<script>'+kchar+'</script>');
let pass=0,fail=0;
const t=(n,c)=>{if(c){pass++;console.log('  ✓ '+n)}else{fail++;console.log('  ✗ '+n)}};
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://keduclass.com/labs/animlab.html',pretendToBeVisual:true,
  beforeParse(w){ w.fetch=()=>Promise.reject(new Error('jsdom: no network')); w.confirm=()=>true; }});
const win=dom.window,doc=win.document;

t('부팅 — AnimLab 로직 존재', !!win.AnimLab && typeof win.AnimLab.ghostPlan==='function');
const gb=doc.getElementById('ghostBtn');
t('👻 버튼 존재·초기 숨김', !!gb && gb.style.display==='none');

/* 미션: 연결 미션 선택 → 👻 노출·꺼짐 상태 */
doc.getElementById('missionBtn').click();
const cards=[...doc.querySelectorAll('#mlist .mcard')];
t('1-2 미션 3장 + 📽️ 배지(ball·frog 연결)', cards.length===3 && doc.querySelectorAll('#mlist .mlink').length===2);
const ballCard=cards.find(c=>c.textContent.includes('공 튀기기'));
ballCard.click();
t('연결 미션 선택 → 👻 노출(꺼짐)', gb.style.display!=='none' && !gb.classList.contains('on'));
t('가이드 밴드에 👻 힌트', doc.querySelector('#guideBand .gghost')!==null);
gb.click();
t('👻 켬 → on 상태·힌트 제거', gb.classList.contains('on') && doc.querySelector('#guideBand .gghost')===null);

/* 미연결 미션 → 👻 숨김 */
doc.getElementById('missionBtn').click();
[...doc.querySelectorAll('#mlist .mcard')].find(c=>c.textContent.includes('깜빡이는 별')).click();
t('미연결 미션(blink) → 👻 숨김·해제', gb.style.display==='none' && !gb.classList.contains('on'));

/* 서랍: 21줄 × 따라 그리기 버튼 → 빈 장 + 👻 켜짐 */
doc.getElementById('t-sample').click();
const rows=[...doc.querySelectorAll('#sampleList > div')].filter(r=>r.querySelector('canvas'));
t('서랍 21줄 · 전 줄 ✏️ 따라 그리기', rows.length===21 && rows.every(r=>r.textContent.includes('따라')));
const chickRow=rows.find(r=>r.textContent.includes('병아리'));
chickRow.querySelectorAll('button')[1].click();
t('따라 그리기 → 본보기 장수(8)·👻 켜짐', doc.querySelectorAll('#frames .thumb').length===8 && gb.classList.contains('on'));
t('fps 본보기 값(8) 적용', doc.getElementById('fpsLbl').textContent==='8 fps');

/* 자유 그리기 복귀 → 👻 정리 */
doc.getElementById('missionBtn').click();
doc.getElementById('freeBtn').click();
t('자유 그리기 → 👻 숨김·해제', gb.style.display==='none' && !gb.classList.contains('on'));

console.log('\n'+(fail?('실패 '+fail+'건 — '):'전체 통과 ')+pass+'/'+(pass+fail));
process.exit(fail?1:0);

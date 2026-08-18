/* 애니 공방 — jsdom 실부팅 스모크 (🎭 본보기와 나란히 배선)
   본보기 적재로 8장을 채운 뒤 ball 미션 선택 → 즉시 완성 → 🎭 흐름 검증. */
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

t('부팅 — duet 로직 존재', !!win.AnimLab && typeof win.AnimLab.duetPlan==='function'
  && typeof win.AnimLab.duetIndices==='function');
const dw=doc.getElementById('duetWrap');
t('오버레이 존재·초기 닫힘', !!dw && !dw.classList.contains('show'));

/* 미완성 미션에는 🎭 버튼이 없어야 한다 */
doc.getElementById('missionBtn').click();
[...doc.querySelectorAll('#mlist .mcard')].find(c=>c.textContent.includes('공 튀기기')).click();
t('미완성(빈 장) → 🎭 버튼 없음', doc.querySelector('#guideBand .gduet')===null);

/* 본보기 적재(8장 실그림) → ball 미션 재선택 → 3장 채움 = 완성 */
doc.getElementById('t-sample').click();
const rows=[...doc.querySelectorAll('#sampleList > div')].filter(r=>r.querySelector('canvas'));
rows.find(r=>r.textContent.includes('공 튀기기')).querySelectorAll('button')[0].click();
t('본보기 적재 → 8장', doc.querySelectorAll('#frames .thumb').length===8);
doc.getElementById('missionBtn').click();
[...doc.querySelectorAll('#mlist .mcard')].find(c=>c.textContent.includes('공 튀기기')).click();
const gd=doc.querySelector('#guideBand .gduet');
t('완성 → 가이드밴드 🎭 버튼 노출', gd!==null && gd.textContent.includes('나란히'));

/* 열기 → 두 캔버스에 실그림, 본보기 이름 표기 */
gd.click();
t('🎭 열림', dw.classList.contains('show'));
t('본보기 이름 표기', doc.getElementById('duetSmpName').textContent==='공 튀기기');
function hasInk(cv,bgSkip){
  const g=cv.getContext('2d'); const d=g.getImageData(0,0,cv.width,cv.height).data;
  if(bgSkip){ // 본보기 쪽 = 종이색 채움 위 그림 → 색 다양성으로 판정
    const set=new Set();
    for(let i=0;i<d.length;i+=397*4) set.add(d[i]+','+d[i+1]+','+d[i+2]);
    return set.size>1;
  }
  for(let i=3;i<d.length;i+=4) if(d[i]>8) return true;
  return false;
}
t('내 애니 캔버스에 그림', hasInk(doc.getElementById('duetMine'),false));
t('본보기 캔버스에 그림', hasInk(doc.getElementById('duetSmp'),true));

/* 닫기 2경로 — ✕ / 배경 탭 */
doc.getElementById('duetClose').click();
t('✕ 닫기', !dw.classList.contains('show'));
doc.querySelector('#guideBand .gduet').click();
dw.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));
t('배경 탭 닫기', !dw.classList.contains('show'));

/* 미연결 미션(blink)은 완성해도 🎭 없음 */
doc.getElementById('missionBtn').click();
[...doc.querySelectorAll('#mlist .mcard')].find(c=>c.textContent.includes('깜빡이는 별')).click();
t('미연결 미션 완성 → 🎭 버튼 없음(장은 채워져 있음)',
  doc.querySelector('#guideBand .gduet')===null
  && doc.querySelector('#guideBand .gprog').textContent.includes('3 / 3'));

console.log('\n'+(fail?('실패 '+fail+'건 — '):'전체 통과 ')+pass+'/'+(pass+fail));
process.exit(fail?1:0);

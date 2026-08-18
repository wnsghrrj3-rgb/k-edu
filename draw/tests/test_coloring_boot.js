/* 색칠 놀이 — jsdom 실부팅 스모크 */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','coloring','index.html'),'utf8');
let pass=0,fail=0;
const t=(n,c)=>{if(c){pass++;console.log('  ✓ '+n)}else{fail++;console.log('  ✗ '+n)}};
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://keduclass.com/draw/coloring/'});
const doc=dom.window.document;
t('오류 없이 부팅', !!dom.window.KCL);
t('갤러리 카드 = 도안 12', doc.querySelectorAll('#g-grid .c-card').length===12);
t('카드마다 SVG 썸네일', [...doc.querySelectorAll('#g-grid .c-card')].every(c=>c.querySelector('svg path')));
t('팔레트 16색 + 지우개', doc.querySelectorAll('#palbar .chip').length===17);
t('첫 화면 = 갤러리', !doc.getElementById('scr-gallery').classList.contains('hidden'));
/* 색칠 흐름: 카드 탭 → 화면 전환 → 칸 탭 → 채움 */
doc.querySelectorAll('#g-grid .c-card')[0].click();
t('카드 탭 → 색칠 화면', !doc.getElementById('scr-paint').classList.contains('hidden'));
const part=doc.querySelector('#stage svg .part');
t('색칠 칸 존재', !!part);
part.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));
t('탭 → 현재 색으로 채움', part.getAttribute('fill')!=='#FFFFFF');
const und=doc.getElementById('btn-undo');und.click();
t('되돌리기 → 흰색 복원', part.getAttribute('fill')==='#FFFFFF');
t('저장 키 생성', dom.window.localStorage.getItem('kclv1:'+dom.window.KCL.DRAWINGS[0].id)!==null);
console.log('\n'+(fail?('실패 '+fail+'건 — '):'전체 통과 ')+pass+'/'+(pass+fail));
process.exit(fail?1:0);

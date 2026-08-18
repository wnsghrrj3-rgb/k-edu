/* 애니 공방 — 복귀 버튼 탑바 인라인 마운트 스모크 */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const base=path.join(__dirname,'..');
let html=fs.readFileSync(path.join(base,'..','labs','animlab.html'),'utf8');
const kchar=fs.readFileSync(path.join(base,'..','labs','kchar-core.js'),'utf8');
const back=fs.readFileSync(path.join(base,'..','kedu_back.js'),'utf8').replace(/<\/script/g,'<\\/script');
html=html.replace('<script src="kchar-core.js"></script>','<script>'+kchar+'</script>');
html=html.replace('<script src="/kedu_tool_bridge.js"></script>','');
html=html.replace('<script src="/kedu_back.js" data-mount=".topbar"></script>',
  '<script data-mount=".topbar">'+back+'</script>');
let pass=0,fail=0;
const t=(n,c)=>{if(c){pass++;console.log('  ✓ '+n)}else{fail++;console.log('  ✗ '+n)}};
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://keduclass.com/labs/animlab.html',pretendToBeVisual:true,
  beforeParse(w){ w.fetch=()=>Promise.reject(new Error('no net')); }});
const doc=dom.window.document;
const b=doc.getElementById('kedu-back');
t('복귀 버튼 존재', !!b);
t('탑바 인라인(kb-inline) — fixed 아님', !!b && b.classList.contains('kb-inline') && !b.classList.contains('kb-fixed'));
t('탑바 첫 자식으로 삽입', !!b && b.parentElement && b.parentElement.classList.contains('topbar')
  && b.parentElement.firstElementChild===b);
t('본문 위 떠다니는 fixed 버튼 없음', doc.querySelectorAll('.kb-fixed').length===0);
console.log('\n'+(fail?('실패 '+fail+'건 — '):'전체 통과 ')+pass+'/'+(pass+fail));
process.exit(fail?1:0);

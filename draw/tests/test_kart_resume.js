/* 케이아트 본체(draw/index.html) — 💾 이어하기 배선 jsdom 스모크
   가짜 KeduResume 로 「언제 저장을 부르는가 / 등급별 갈림 / 복원 시트 두 갈래」를 본다.
   Blob→Image 디코딩(실픽셀 왕복)은 jsdom 밖 — 실기기 몫으로 남긴다. */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
let pass=0,fail=0;
const t=(n,c)=>{if(c){pass++;console.log('  ✓ '+n)}else{fail++;console.log('  ✗ '+n)}};

function boot(fakeResume){
  let html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  ['/kedu_gate.js','/kedu_config.js','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
   '/kedu_tier.js','/kedu_resume.js','/kedu_boxbar.js','/kedu_back.js'].forEach(u=>{
    html=html.replace(new RegExp('<script src="'+u.replace(/[/.?]/g,'\\$&')+'"[^>]*></script>'),'');
  });
  /* dangerously = 인라인 스크립트가 진짜 전역에서 돈다.
     본체는 최상위 let(undo·hasDrawn 등)을 쓰므로 eval 실행으로는 스코프가 갈린다. */
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://keduclass.com/draw/',pretendToBeVisual:true,
    beforeParse(w){
      w.fetch=()=>Promise.reject(new Error('no net'));
      if(fakeResume!==undefined) w.KeduResume=fakeResume;
      w.HTMLCanvasElement.prototype.toBlob=function(cb){ cb(new w.Blob(['x'],{type:'image/png'})); };
    }});
  return dom;
}
function fake(can, stored){
  const calls={init:0,load:0,clear:0,marks:0,flush:0};
  let collect=null;
  return { calls, get collect(){ return collect; },
    init(){ calls.init++; return Promise.resolve({can, tier:can?'student':'visitor', available:can}); },
    load(){ calls.load++; return Promise.resolve(stored||null); },
    save(){ return Promise.resolve(true); },
    clear(){ calls.clear++; return Promise.resolve(true); },
    autosaver(slot,c){ collect=c; return { mark(){calls.marks++;}, flush(){calls.flush++; return Promise.resolve(true);} }; },
    canSave(){ return can; } };
}
const tick=()=>new Promise(r=>setTimeout(r,60));

(async function(){
  /* ① 학생 — 그리기가 저장을 부른다 */
  {
    const R=fake(true,null); const dom=boot(R); const w=dom.window;
    await tick();
    t('부팅 — init 1회', R.calls.init===1);
    t('저장 가능하면 지난 그림을 찾아본다', R.calls.load===1);
    t('지난 그림 없음 → 시트 안 뜸', !w.document.getElementById('resume-mask').classList.contains('on'));
    const b=R.calls.marks;
    w.eval('hasDrawn=true; pushUndo();');            // 획 하나
    t('그리기(pushUndo) → 저장 표시', R.calls.marks>b);
    const b2=R.calls.marks;
    w.eval('doUndo();');
    t('되돌리기도 저장 표시(상태가 바뀌었다)', R.calls.marks>b2);
    const payload=await R.collect();
    t('수집물에 도화지 크기 meta', payload && payload.meta && 'w' in payload.meta && 'h' in payload.meta);
    t('그린 게 있으면 draw 조각을 담는다', payload.parts.draw!==null);
    t('통째 교체 방식(replaceParts) — 한 장짜리 도구', payload.replaceParts===true);
  }

  /* ② 방문자 — 아무것도 하지 않는다 */
  {
    const R=fake(false,{parts:{draw:{}},meta:{at:Date.now()}}); const dom=boot(R); const w=dom.window;
    await tick();
    t('방문자 — 지난 그림을 찾지도 않는다', R.calls.load===0);
    t('방문자 — 시트 안 뜸', !w.document.getElementById('resume-mask').classList.contains('on'));
    w.eval('hasDrawn=true; pushUndo(); doUndo();');
    t('방문자 — 그려도 저장을 부르지 않는다', R.calls.marks===0);
  }

  /* ③ 지난 그림 있음 — 시트 두 갈래 */
  {
    const at=new Date(2026,7,17,15,0).getTime();
    const R=fake(true,{meta:{w:900,h:600,at}, parts:{draw:{}, bg:null}, at});
    const dom=boot(R); const doc=dom.window.document;
    await tick();
    const mask=doc.getElementById('resume-mask');
    t('지난 그림 있음 → 이어하기 시트 노출', mask.classList.contains('on'));
    t('언제 그리던 것인지 안내', /8월\s*17일/.test(doc.getElementById('resume-when').textContent));
    doc.getElementById('resume-yes').click();
    await tick();
    t('이어서 그리기 → 시트 닫힘', !mask.classList.contains('on'));
  }
  {
    const R=fake(true,{meta:{at:Date.now()}, parts:{draw:{}}, at:Date.now()});
    const dom=boot(R); const doc=dom.window.document;
    await tick();
    doc.getElementById('resume-no').click();
    await tick();
    t('새 도화지 → 시트 닫히고 지난 그림 삭제',
      !doc.getElementById('resume-mask').classList.contains('on') && R.calls.clear===1);
  }

  /* ④ 이탈 시 확정 */
  {
    const R=fake(true,null); const w=boot(R).window;
    await tick();
    w.dispatchEvent(new w.Event('pagehide'));
    t('페이지 이탈 → flush', R.calls.flush>=1);
    const f0=R.calls.flush;
    Object.defineProperty(w.document,'visibilityState',{value:'hidden',configurable:true});
    w.document.dispatchEvent(new w.Event('visibilitychange'));
    t('탭 숨김 → flush', R.calls.flush>f0);
  }

  /* ⑤ 계층 미탑재에서도 도구는 멀쩡 */
  {
    const w=boot(undefined).window;
    await tick();
    w.eval('hasDrawn=true; pushUndo();');
    t('KeduResume 미탑재 — 그리기 정상(회귀 0)', w.eval('undo.length')>=2);
    t('KeduResume 미탑재 — 시트 안 뜸',
      !w.document.getElementById('resume-mask').classList.contains('on'));
  }

  console.log('\n'+(fail?('실패 '+fail+'건 — '):'전체 통과 ')+pass+'/'+(pass+fail));
  process.exit(fail?1:0);
})();

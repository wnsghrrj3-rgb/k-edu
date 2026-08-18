/* 애니 공방 — 💾 이어하기 배선 jsdom 스모크
   가짜 KeduResume 를 심어 「언제 저장을 부르는가 / 등급별로 어떻게 갈리는가 /
   복원 시트 두 갈래」를 검증한다. 픽셀 왕복(Blob→Image 디코딩)은 jsdom 밖 —
   실기기 몫으로 정직하게 남기고, 여기서는 호출 계약만 본다. */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
let pass=0,fail=0;
const t=(n,c)=>{if(c){pass++;console.log('  ✓ '+n)}else{fail++;console.log('  ✗ '+n)}};

function boot(fakeResume){
  let html=fs.readFileSync(path.join(__dirname,'..','..','labs','animlab.html'),'utf8');
  const kchar=fs.readFileSync(path.join(__dirname,'..','..','labs','kchar-core.js'),'utf8');
  html=html.replace('<script src="kchar-core.js"></script>','<script>'+kchar+'</script>');
  /* 외부 의존(네트워크·인증)은 걷어내고 가짜 이어하기만 심는다 */
  ['/kedu_config.js','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
   '/kedu_tier.js','/kedu_resume.js','/kedu_collect.js','/kedu_boxbar.js',
   '/kedu_tool_bridge.js','/kedu_back.js'].forEach(u=>{
    html=html.replace(new RegExp('<script src="'+u.replace(/[/.]/g,'\\$&')+'"[^>]*></script>'),'');
  });
  const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://keduclass.com/labs/animlab.html',
    pretendToBeVisual:true});
  const w=dom.window;
  w.fetch=()=>Promise.reject(new Error('no net'));
  w.KeduResume=fakeResume;
  /* 캔버스 toBlob 스텁 — jsdom 캔버스는 인코딩을 안 한다 */
  w.HTMLCanvasElement.prototype.toBlob=function(cb){ cb(new w.Blob(['x'],{type:'image/png'})); };
  const inline=[...dom.window.document.querySelectorAll('script:not([src])')];
  inline.forEach(s=>{ try{ w.eval(s.textContent); }catch(e){ /* 부팅 실패는 아래 단언이 잡는다 */ } });
  return dom;
}
function fake(can, stored){
  const calls={init:0, load:0, save:0, clear:0, marks:0, flush:0};
  let collect=null;
  return { calls, get collect(){ return collect; },
    init(){ calls.init++; return Promise.resolve({can:can, tier:can?'student':'visitor', available:can}); },
    load(){ calls.load++; return Promise.resolve(stored||null); },
    save(){ calls.save++; return Promise.resolve(true); },
    clear(){ calls.clear++; return Promise.resolve(true); },
    autosaver(slot, c){ collect=c; return { mark(){ calls.marks++; }, flush(){ calls.flush++; return Promise.resolve(true); } }; },
    canSave(){ return can; } };
}
const tick=()=>new Promise(r=>setTimeout(r,60));

(async function(){
  /* ① 저장 가능(student) — 그리기·구조 변경이 저장을 부른다 */
  {
    const R=fake(true, null);
    const doc=boot(R).window.document;
    await tick();
    t('부팅 — init 1회 호출', R.calls.init===1);
    t('저장 가능하면 지난 작업을 찾아본다', R.calls.load===1);
    t('지난 작업 없음 → 이어하기 시트 안 뜸',
      !doc.getElementById('resumeSheet').classList.contains('show'));
    const before=R.calls.marks;
    doc.getElementById('addf').click();                       // 장 추가 = 구조 변경
    t('장 추가 → 저장 표시', R.calls.marks>before);
    const b2=R.calls.marks;
    doc.getElementById('t-clear').click();                    // 이 장 비우기 = 획 변경
    t('장 비우기 → 저장 표시', R.calls.marks>b2);
    const payload=await R.collect();
    t('수집물에 meta(장수·fps·현재장) 담김',
      payload && payload.meta && payload.meta.n>=2 && payload.meta.fps>0 && 'cur' in payload.meta);
    t('수집물에 조각(parts) 담김', payload && payload.parts && typeof payload.parts==='object');
    t('빈 장은 조각에 안 담는다(용량)', payload.parts.f0===null);
  }

  /* ② 저장 불가(방문자·게스트) — 아무것도 하지 않는다 */
  {
    const R=fake(false, {meta:{n:5},parts:{},at:Date.now()});
    const doc=boot(R).window.document;
    await tick();
    t('방문자 — 지난 작업을 찾지도 않는다', R.calls.load===0);
    t('방문자 — 이어하기 시트 안 뜸', !doc.getElementById('resumeSheet').classList.contains('show'));
    doc.getElementById('addf').click();
    doc.getElementById('t-clear').click();
    t('방문자 — 그려도 저장을 부르지 않는다', R.calls.marks===0 && R.calls.save===0);
  }

  /* ③ 지난 작업 있음 — 시트 두 갈래 */
  {
    const at=new Date(2026,7,17,15,30).getTime();
    const R=fake(true, {meta:{n:6, fps:9, mode:'pingpong', cur:2, mission:null, done:['ball']}, parts:{}, at});
    const dom=boot(R); const doc=dom.window.document;
    await tick();
    const sheet=doc.getElementById('resumeSheet');
    t('지난 작업 있음 → 이어하기 시트 노출', sheet.classList.contains('show'));
    t('언제·몇 장인지 안내', /6장/.test(doc.getElementById('resumeWhen').textContent)
      && /8월\s*17일/.test(doc.getElementById('resumeWhen').textContent));
    doc.getElementById('resumeYes').click();
    await tick();
    t('이어서 그리기 → 시트 닫힘', !sheet.classList.contains('show'));
    t('저장된 장수(6장)로 복원', doc.querySelectorAll('#frames .thumb').length===6);
    t('fps 복원(9)', doc.getElementById('fpsLbl').textContent.indexOf('9')===0);
    t('재생 모드 복원(왕복 버튼 켜짐)',
      doc.querySelector('#modeSeg .pbtn[data-mode="pingpong"]').classList.contains('on'));
    t('현재 장 복원(3번째)', +doc.querySelector('#frames .thumb.on').dataset.i===2);
  }
  {
    const R=fake(true, {meta:{n:4}, parts:{}, at:Date.now()});
    const doc=boot(R).window.document;
    await tick();
    doc.getElementById('resumeNo').click();
    await tick();
    t('새로 시작 → 시트 닫히고 지난 작업 삭제',
      !doc.getElementById('resumeSheet').classList.contains('show') && R.calls.clear===1);
    t('새로 시작 → 장수는 그대로 1장', doc.querySelectorAll('#frames .thumb').length===1);
  }

  /* ④ 나갈 때 밀어내기 */
  {
    const R=fake(true, null);
    const dom=boot(R); const w=dom.window;
    await tick();
    w.dispatchEvent(new w.Event('pagehide'));
    t('페이지 이탈 시 대기 중 저장을 확정(flush)', R.calls.flush>=1);
    const f0=R.calls.flush;
    Object.defineProperty(w.document,'visibilityState',{value:'hidden',configurable:true});
    w.document.dispatchEvent(new w.Event('visibilitychange'));
    t('탭 숨김 시에도 확정', R.calls.flush>f0);
  }

  /* ⑤ 이어하기 계층이 아예 없는 페이지에서도 도구는 멀쩡하다 */
  {
    const doc=boot(undefined).window.document;
    await tick();
    doc.getElementById('addf').click();
    t('KeduResume 미탑재 — 부팅·그리기 정상(회귀 0)',
      doc.querySelectorAll('#frames .thumb').length===2
      && !doc.getElementById('resumeSheet').classList.contains('show'));
  }

  console.log('\n'+(fail?('실패 '+fail+'건 — '):'전체 통과 ')+pass+'/'+(pass+fail));
  process.exit(fail?1:0);
})();

/* 살아나는 무대 — 💾 이어하기 배선 jsdom 스모크
   가짜 KeduResume 로 「무대 상태를 언제 담는가 / 등급별 갈림 / 복원 두 갈래」를 본다.
   dataURL→Image 디코딩(실스프라이트 왕복)은 jsdom 밖 — 실기기 몫. */
const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
let pass=0,fail=0;
const t=(n,c)=>{if(c){pass++;console.log('  ✓ '+n)}else{fail++;console.log('  ✗ '+n)}};

function boot(fakeResume){
  let html=fs.readFileSync(path.join(__dirname,'..','..','labs','livestage.html'),'utf8');
  const core=fs.readFileSync(path.join(__dirname,'..','..','labs','livestage-core.js'),'utf8');
  html=html.replace('<script src="/labs/livestage-core.js"></script>','<script>'+core+'</script>');
  ['/kedu_collect.js','/kedu_config.js','https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
   '/kedu_tier.js','/kedu_resume.js','/kedu_back.js'].forEach(u=>{
    html=html.replace(new RegExp('<script src="'+u.replace(/[/.?]/g,'\\$&')+'"[^>]*></script>'),'');
  });
  return new JSDOM(html,{runScripts:'dangerously',url:'https://keduclass.com/labs/livestage.html',
    pretendToBeVisual:true,
    beforeParse(w){
      w.fetch=()=>Promise.reject(new Error('no net'));
      w.ResizeObserver=class{ observe(){} unobserve(){} disconnect(){} };   /* jsdom 미구현 */
      if(fakeResume!==undefined) w.KeduResume=fakeResume;
      /* 스프라이트 인코딩·디코딩 스텁 — 무대 로직만 본다 */
      w.HTMLCanvasElement.prototype.toDataURL=function(){ return 'data:image/png;base64,STUB'; };
      Object.defineProperty(w.Image.prototype,'src',{
        set(v){ this._src=v; setTimeout(()=>this.onload&&this.onload(),0); },
        get(){ return this._src; }, configurable:true });
    }});
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
const tick=(ms=80)=>new Promise(r=>setTimeout(r,ms));

(async function(){
  /* ① 학생 — 무대가 바뀌면 저장을 부른다 */
  {
    const R=fake(true,null); const w=boot(R).window; const doc=w.document;
    await tick();
    t('부팅 — init 1회', R.calls.init===1);
    t('저장 가능하면 지난 무대를 찾아본다', R.calls.load===1);
    t('지난 무대 없음 → 시트 안 뜸', !doc.getElementById('resumeMask').classList.contains('on'));
    const b0=R.calls.marks;
    [...doc.querySelectorAll('#stagebar .stbtn')][2].click();       // 무대 전환
    t('무대 전환 → 저장 표시', R.calls.marks>b0);
    const b1=R.calls.marks;
    doc.getElementById('clearStage').click();                       // 비우기
    t('무대 비우기 → 저장 표시', R.calls.marks>b1);
  }

  /* ② 방생 → 수집물에 친구가 담긴다 */
  {
    const R=fake(true,null); const w=boot(R).window; const doc=w.document;
    await tick();
    /* 실제 사용자처럼 패드에 획을 긋는다 (drew 는 IIFE 안 변수 — 밖에서 못 세운다) */
    const pad=doc.getElementById('pad');
    pad.getBoundingClientRect=()=>({left:0,top:0,width:660,height:500,right:660,bottom:500});
    const pev=(type,x,y)=>{ const e=new w.Event(type,{bubbles:true,cancelable:true});
      e.clientX=x; e.clientY=y; e.pointerId=1; return e; };
    pad.dispatchEvent(pev('pointerdown',100,100));
    pad.dispatchEvent(pev('pointermove',180,160));
    w.dispatchEvent(new w.Event('pointerup'));
    doc.getElementById('who').value='지우';
    const b0=R.calls.marks;
    doc.getElementById('send').click();
    await tick(150);
    t('방생 → 저장 표시', R.calls.marks>b0);
    const payload=R.collect();
    t('수집물 meta 에 무대 종류', payload && payload.meta && !!payload.meta.stage);
    t('수집물에 친구 1명(이름·움직임 포함)',
      payload.meta.beings.length===1 && payload.meta.beings[0].name==='지우' && !!payload.meta.beings[0].mode);
    t('조각에 그림(dataURL) 담김 — 재인코딩 없이 방생 때 것 재사용',
      payload.parts.b0==='data:image/png;base64,STUB');
    t('통째 교체 방식(replaceParts)', payload.replaceParts===true);
  }

  /* ③ 방문자 — 아무것도 하지 않는다 */
  {
    const R=fake(false,{meta:{stage:'sky',beings:[{name:'A',mode:'fly',face:1,w:60,h:40,y:100}],at:Date.now()},
                        parts:{b0:'data:image/png;base64,STUB'}});
    const w=boot(R).window; const doc=w.document;
    await tick();
    t('방문자 — 지난 무대를 찾지도 않는다', R.calls.load===0);
    t('방문자 — 시트 안 뜸', !doc.getElementById('resumeMask').classList.contains('on'));
    [...doc.querySelectorAll('#stagebar .stbtn')][1].click();
    doc.getElementById('clearStage').click();
    t('방문자 — 무대를 바꿔도 저장을 부르지 않는다', R.calls.marks===0);
  }

  /* ④ 지난 무대 있음 — 두 갈래 */
  {
    const at=new Date(2026,7,17,16,0).getTime();
    const R=fake(true,{ meta:{ stage:'sky', at,
        beings:[{name:'지우',mode:'fly',face:1,w:60,h:40,y:120},
                {name:'하늘',mode:'hop',face:-1,w:50,h:50,y:200}] },
      parts:{ b0:'data:image/png;base64,STUB', b1:'data:image/png;base64,STUB' }, at });
    const w=boot(R).window; const doc=w.document;
    await tick();
    const mask=doc.getElementById('resumeMask');
    t('지난 무대 있음 → 시트 노출', mask.classList.contains('on'));
    t('몇 명·언제인지 안내', /2명/.test(doc.getElementById('resumeWhen').textContent)
      && /8월\s*17일/.test(doc.getElementById('resumeWhen').textContent));
    doc.getElementById('resumeYes').click();
    await tick(150);
    t('다시 불러오기 → 시트 닫힘', !mask.classList.contains('on'));
    t('친구 2명이 무대로 돌아옴', /2명/.test(doc.getElementById('tally').textContent));
    t('무대 종류도 복원(하늘 버튼 켜짐)',
      [...doc.querySelectorAll('#stagebar .stbtn')].some(b=>b.classList.contains('on')&&/하늘|🌤|☁/.test(b.textContent)));
  }
  {
    const R=fake(true,{meta:{stage:'sea',beings:[{name:'',mode:'swim',face:1,w:50,h:50,y:100}],at:Date.now()},
                       parts:{b0:'data:image/png;base64,STUB'}, at:Date.now()});
    const w=boot(R).window; const doc=w.document;
    await tick();
    doc.getElementById('resumeNo').click();
    await tick();
    t('빈 무대로 → 시트 닫히고 지난 무대 삭제',
      !doc.getElementById('resumeMask').classList.contains('on') && R.calls.clear===1);
    t('빈 무대로 → 무대는 비어 있다', /비어/.test(doc.getElementById('tally').textContent));
  }

  /* ⑤ 이탈 확정 · 계층 미탑재 회귀 */
  {
    const R=fake(true,null); const w=boot(R).window;
    await tick();
    w.dispatchEvent(new w.Event('pagehide'));
    t('페이지 이탈 → flush', R.calls.flush>=1);
  }
  {
    const w=boot(undefined).window; const doc=w.document;
    await tick();
    [...doc.querySelectorAll('#stagebar .stbtn')][1].click();
    t('KeduResume 미탑재 — 무대 전환 정상(회귀 0)',
      [...doc.querySelectorAll('#stagebar .stbtn')][1].classList.contains('on'));
    t('KeduResume 미탑재 — 시트 안 뜸',
      !doc.getElementById('resumeMask').classList.contains('on'));
  }

  console.log('\n'+(fail?('실패 '+fail+'건 — '):'전체 통과 ')+pass+'/'+(pass+fail));
  process.exit(fail?1:0);
})();

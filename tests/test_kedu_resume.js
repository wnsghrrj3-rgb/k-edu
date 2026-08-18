/* kedu_resume.js — 공용 「작업 이어하기」 검산
   ① 접근 사다리 게이트(visitor·guest 저장 0 / student·account 저장 O)
   ② 공용 태블릿 분리(소유자가 다르면 남의 작업이 안 보인다)
   ③ 조각 갱신(바뀐 것만 쓰기)·삭제·버전·만료
   ④ 자동 저장기 디바운스·중복 방지
   ⑤ IndexedDB 부재 환경에서 조용히 물러나되 사실을 드러낸다 */
const fs=require('fs'), path=require('path'), vm=require('vm');
require('fake-indexeddb/auto');

let pass=0,fail=0;
const t=(n,c)=>{ if(c){pass++;console.log('  ✓ '+n)} else {fail++;console.log('  ✗ '+n)} };
const src=fs.readFileSync(path.join(__dirname,'..','kedu_resume.js'),'utf8');

/* 매 케이스마다 깨끗한 창(window)과 새 IDB 를 준다 */
let dbSeq=0;
function makeWin(tierObj, sessionUser){
  const win={ setTimeout, clearTimeout, Promise, Date, Object, Error };
  win.window=win;
  win.indexedDB=indexedDB;
  win.KeduTier={
    resolve:()=>Promise.resolve(tierObj),
    canSave:(o)=>!!(o && o.tier==='student')
  };
  win.sb={ auth:{ getSession:()=>Promise.resolve({data:{session: sessionUser?{user:sessionUser}:null}}) } };
  vm.createContext(win);
  vm.runInContext(src, win);
  return win;
}
const A=(tier,extra)=>Object.assign({tier}, extra||{});

(async function(){
  /* ① 사다리 게이트 */
  for (const [tier,extra,expect] of [
    ['visitor',null,false], ['guest',{guest:{code:'ABCD'}},false],
    ['student',{profile:{profile_id:'p1'}},true], ['account',null,true],
  ]){
    const w=makeWin(A(tier,extra), tier==='account'?{id:'u9'}:null);
    const r=await w.KeduResume.init({app:'t_'+tier+(dbSeq++), version:1});
    t(tier+' → 저장 '+(expect?'허용':'차단'), r.can===expect);
    if(!expect){
      const ok=await w.KeduResume.save('main',{meta:{a:1}});
      const got=await w.KeduResume.load('main');
      t(tier+' → save 는 false, load 는 null (기기 안에도 안 남김)', ok===false && got===null);
    }
  }
  {
    const w=makeWin(A('student',{profile:{profile_id:'p1'}}));
    const r=await w.KeduResume.init({app:'app_reason'+(dbSeq++), version:1});
    t('허용 시 available·reason 정직 보고', r.available===true && r.reason===null);
  }
  {   /* 세션은 있는데 user id 를 못 얻는 경우 = 소유자 불명 → 저장 안 함 */
    const w=makeWin(A('account'), null);
    const r=await w.KeduResume.init({app:'app_noowner'+(dbSeq++), version:1});
    t('소유자 불명(account·세션 없음) → 저장 차단·reason=no_owner', r.can===false && r.reason==='no_owner');
  }

  /* ② 공용 태블릿 — 소유자 분리 */
  {
    const app='shared'+(dbSeq++);
    const a=makeWin(A('student',{profile:{profile_id:'child_A'}}));
    await a.KeduResume.init({app, version:1});
    await a.KeduResume.save('main',{meta:{who:'A'}});
    const b=makeWin(A('student',{profile:{profile_id:'child_B'}}));
    await b.KeduResume.init({app, version:1});
    t('다음 아이가 열면 앞 아이 작업이 안 보인다', (await b.KeduResume.load('main'))===null);
    await b.KeduResume.save('main',{meta:{who:'B'}});
    t('각자 제 작업은 그대로', (await a.KeduResume.load('main')).meta.who==='A'
      && (await b.KeduResume.load('main')).meta.who==='B');
    t('list() 는 제 것만 센다', (await a.KeduResume.list()).length===1);
  }

  /* ③ 조각 갱신·삭제·버전·만료 */
  {
    const app='parts'+(dbSeq++);
    const w=makeWin(A('student',{profile:{profile_id:'p1'}}));
    await w.KeduResume.init({app, version:1});
    await w.KeduResume.save('main',{meta:{n:3}, parts:{f0:'A', f1:'B', f2:'C'}});
    await w.KeduResume.save('main',{parts:{f1:'B2'}});                 // 한 조각만
    let g=await w.KeduResume.load('main');
    t('바뀐 조각만 갱신 — 나머지 보존', g.parts.f0==='A' && g.parts.f1==='B2' && g.parts.f2==='C');
    t('meta 미지정 시 기존 meta 유지', g.meta.n===3);
    await w.KeduResume.save('main',{parts:{f2:null}});                 // null = 삭제
    g=await w.KeduResume.load('main');
    t('null 조각 = 삭제', !('f2' in g.parts) && g.parts.f0==='A');
    await w.KeduResume.save('main',{parts:{z:'Z'}, replaceParts:true});
    g=await w.KeduResume.load('main');
    t('replaceParts = 통째 교체', Object.keys(g.parts).join()==='z');

    const w2=makeWin(A('student',{profile:{profile_id:'p1'}}));        // 같은 소유자·다른 포맷 버전
    await w2.KeduResume.init({app, version:2});
    t('버전 다르면 복원하지 않는다(깨진 포맷 방지)', (await w2.KeduResume.load('main'))===null);

    await w.KeduResume.clear('main');
    t('clear 후 없음', (await w.KeduResume.load('main'))===null);
  }
  {   /* 만료 — 31일 전 기록은 되살리지 않는다 */
    const app='ttl'+(dbSeq++);
    const w=makeWin(A('student',{profile:{profile_id:'p1'}}));
    await w.KeduResume.init({app, version:1});
    await w.KeduResume.save('main',{meta:{x:1}});
    const key=app+'|s_p1|main';
    await new Promise(res=>{
      const rq=indexedDB.open('kedu-resume',1);
      rq.onsuccess=()=>{ const db=rq.result, os=db.transaction('slots','readwrite').objectStore('slots');
        const g=os.get(key); g.onsuccess=()=>{ const v=g.result; v.at=Date.now()-31*24*3600*1000;
          const p=os.put(v); p.onsuccess=()=>{ db.close(); res(); }; }; };
    });
    t('30일 지난 작업은 복원하지 않는다', (await w.KeduResume.load('main'))===null);
  }

  /* ④ 자동 저장기 */
  {
    const app='auto'+(dbSeq++);
    const w=makeWin(A('student',{profile:{profile_id:'p1'}}));
    await w.KeduResume.init({app, version:1});
    let calls=0;
    const as=w.KeduResume.autosaver('main', ()=>{ calls++; return {meta:{c:calls}}; }, {wait:30});
    as.mark(); as.mark(); as.mark();                                   // 연타 = 한 번만
    await new Promise(r=>setTimeout(r,90));
    t('디바운스 — 연타해도 한 번만 쓴다', calls===1);
    t('쓰인 값이 실제로 복원된다', (await w.KeduResume.load('main')).meta.c===1);
    as.mark(); await as.flush();                                        // 즉시 밀어내기(나갈 때)
    t('flush — 대기 중인 저장을 즉시 확정', calls===2 && (await w.KeduResume.load('main')).meta.c===2);
  }
  {   /* 저장 못 하는 등급에서 autosaver 는 아무 일도 하지 않는다 */
    const w=makeWin(A('guest',{guest:{code:'ABCD'}}));
    await w.KeduResume.init({app:'auto_guest'+(dbSeq++), version:1});
    let calls=0;
    const as=w.KeduResume.autosaver('main', ()=>{ calls++; return {meta:{}}; }, {wait:10});
    as.mark(); await new Promise(r=>setTimeout(r,40)); await as.flush();
    t('게스트 — 자동 저장기가 수집조차 하지 않는다', calls===0);
  }

  /* ⑤ IndexedDB 부재 환경 — 조용히 물러나되 사실은 드러낸다 */
  {
    const w=makeWin(A('student',{profile:{profile_id:'p1'}}));
    w.indexedDB=null; w.KeduResume._useIDB(null);
    const r=await w.KeduResume.init({app:'noidb'+(dbSeq++), version:1});
    t('IDB 없음 → can=false·reason=no_idb (조용히 잃지 않게 드러냄)',
      r.can===false && r.available===false && r.reason==='no_idb');
    t('IDB 없음에서도 save/load 가 던지지 않는다',
      (await w.KeduResume.save('main',{meta:{}}))===false && (await w.KeduResume.load('main'))===null);
  }

  /* 규약 — 인증 계층이 없는 페이지에서는 저장하지 않는다 */
  {
    const w=makeWin(A('student',{profile:{profile_id:'p1'}}));
    delete w.KeduTier; delete w.sb;
    const r=await w.KeduResume.init({app:'notier'+(dbSeq++), version:1});
    t('KeduTier 미탑재 페이지 → 저장 차단(판정 없이 쓰지 않는다)', r.can===false);
  }

  console.log('\n'+(fail?('실패 '+fail+'건 — '):'전체 통과 ')+pass+'/'+(pass+fail));
  process.exit(fail?1:0);
})();

/* 케이메이커 — R129 접근 사다리 게이트 + 소유자 분리 검산
   ① 방문자·게스트는 저장하지 않는다 / 학생·교사는 한다
   ② 판정 전에는 쓰지 않는다 (부팅 창)
   ③ 공용 태블릿 — 소유자가 다르면 남의 문서가 안 보인다
   ④ 옛 키(소유자 없음) 작품은 읽기 폴백으로 승계된다
   ⑤ 계층 미탑재(플레이그라운드)·주입 백엔드 하니스 계약은 그대로 (R116 불변) */
const fs=require('fs'), path=require('path'), vm=require('vm');
let pass=0,fail=0;
const t=(n,c)=>{ if(c){pass++;console.log('  ✓ '+n)} else {fail++;console.log('  ✗ '+n)} };
const src=fs.readFileSync(path.join(__dirname,'..','maker-playground','data','live.js'),'utf8');

/* live.js 를 깨끗한 창에서 돌린다. MK_STORE 없이 localStorage 만 둔다. */
function boot(resumeState){
  const mem={};
  const win={ setTimeout, clearTimeout, Promise, Date, Math, JSON, Object, Array, String, Number, RegExp, Error, isNaN, parseInt, parseFloat };
  win.window=win;
  win.localStorage={
    _m:mem,
    getItem:(k)=> (k in mem ? mem[k] : null),
    setItem:(k,v)=>{ mem[k]=String(v); },
    removeItem:(k)=>{ delete mem[k]; },
    key:(i)=>Object.keys(mem)[i]||null,
    get length(){ return Object.keys(mem).length; }
  };
  if(resumeState!==undefined){
    win.KeduResume={ state:()=>resumeState, init:()=>Promise.resolve({can:!!resumeState.can}) };
  }
  win.MK_PROJ={ serialize:()=>'PROJ_DATA', hydrate:(raw)=>raw==='PROJ_DATA' };
  vm.createContext(win);
  vm.runInContext(src, win);
  return { win, mem, L:win.MK_LIVE };
}
const S=(tier,owner,inited)=>({ app:'kmaker', tier, owner, can: tier==='student'||tier==='account', inited: inited!==false });

/* ① 사다리 게이트 */
{
  const doc={id:'d1', scenes:[]};
  for(const [tier,owner,expect] of [
    ['visitor',null,false], ['guest',null,false],
    ['student','s_p1',true], ['account','a_u9',true],
  ]){
    const {L}=boot(S(tier,owner));
    const ok=L.saveDoc(doc);
    t(tier+' → 문서 저장 '+(expect?'허용':'차단'), ok===expect);
    t(tier+' → 프로젝트 저장 '+(expect?'허용':'차단'), L.saveProjects()===expect);
    if(!expect) t(tier+' → 읽기도 없음(기기에 안 남음)', L.loadDoc('d1')===null);
  }
}

/* ② 판정 전에는 쓰지 않는다 */
{
  const {L}=boot(S('student','s_p1',false));     // inited=false = 부팅 중
  t('판정 전 — 저장 보류(방문자일 수도 있으므로)', L.saveDoc({id:'d1',scenes:[]})===false);
}

/* ③ 공용 태블릿 — 소유자 분리 */
{
  const a=boot(S('student','s_childA'));
  a.L.saveDoc({id:'shared', scenes:[{id:'A'}]});
  a.L.saveProjects();
  /* 같은 기기(같은 localStorage)를 다음 아이가 연다 */
  const b=boot(S('student','s_childB'));
  Object.assign(b.mem, a.mem);
  t('다음 아이 — 앞 아이 문서가 안 보인다', b.L.loadDoc('shared')===null);
  b.L.saveDoc({id:'shared', scenes:[{id:'B'}]});
  const a2=boot(S('student','s_childA')); Object.assign(a2.mem, b.mem);
  t('각자 제 문서는 그대로', a2.L.loadDoc('shared').doc.scenes[0].id==='A');
  t('키가 소유자별로 갈린다', Object.keys(b.mem).some(k=>k.indexOf('mklive:s_childA:')===0)
    && Object.keys(b.mem).some(k=>k.indexOf('mklive:s_childB:')===0));
}

/* ④ 옛 키 승계 — 이미 만든 작품을 잃지 않는다 */
{
  const {L,mem}=boot(S('account','a_junho'));
  mem['mklive:doc:old1']=JSON.stringify({savedAt:1, doc:{id:'old1', scenes:[{id:'legacy'}]}});
  mem['mklive:projects']='PROJ_DATA';
  const got=L.loadDoc('old1');
  t('옛 키 문서를 읽기 폴백으로 승계', !!got && got.doc.scenes[0].id==='legacy');
  t('옛 키 프로젝트도 복원된다', L.restoreProjects()===true);
  L.saveDoc(got.doc);
  t('다음 저장부터는 새(소유자) 키로 옮겨 앉는다', 'mklive:a_junho:doc:old1' in mem);
  L.clearDoc('old1');
  t('삭제는 두 키 모두 — 지운 문서가 부활하지 않는다',
    !('mklive:a_junho:doc:old1' in mem) && !('mklive:doc:old1' in mem));
}
{  /* 새 키가 있으면 옛 키를 덮어 읽지 않는다 */
  const {L,mem}=boot(S('student','s_p1'));
  mem['mklive:doc:x']=JSON.stringify({savedAt:1, doc:{id:'x', scenes:[{id:'OLD'}]}});
  L.saveDoc({id:'x', scenes:[{id:'NEW'}]});
  t('새 키 우선 — 옛 키가 최신을 가리지 않는다', L.loadDoc('x').doc.scenes[0].id==='NEW');
}

/* ⑤ 옛 세계 보존 — R116 계약 불변 */
{
  const {L,mem}=boot(undefined);                  // KeduResume 미탑재 = 플레이그라운드
  t('계층 미탑재 — 종전대로 저장된다(검수 환경 무영향)', L.saveDoc({id:'p',scenes:[]})===true);
  t('계층 미탑재 — 키에 소유자가 붙지 않는다', 'mklive:doc:p' in mem);
}
{
  const {L}=boot(S('visitor',null));              // 저장 금지 등급이라도
  const bag={};
  L.useBackend({ getItem:(k)=>(k in bag?bag[k]:null), setItem:(k,v)=>{bag[k]=v;}, removeItem:(k)=>{delete bag[k];} });
  t('주입 백엔드는 항상 이긴다 (하니스 계약 R116 불변)',
    L.saveDoc({id:'h',scenes:[]})===true && L.loadDoc('h').doc.id==='h');
}
{
  const {L}=boot(S('student','s_p1'));
  const a=L.liveAudit();
  t('liveAudit 자가진단 통과(회귀 0)', a.ok===true);
}

console.log('\n'+(fail?('실패 '+fail+'건 — '):'전체 통과 ')+pass+'/'+(pass+fail));
process.exit(fail?1:0);

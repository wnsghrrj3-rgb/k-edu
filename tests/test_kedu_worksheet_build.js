// 케이학습지 조립 화면 — 범위(학년·학기·과목) 선택·단원 이름·추천안이 범위 안에서만 도는지 (2026-10-14)
const { JSDOM } = require('jsdom'); const fs = require('fs'); const vm = require('vm');
let html = fs.readFileSync(require('path').join(__dirname,'..','kedu','worksheet','build.html'),'utf8').replace(/<script src="[^"]*"[^>]*><\/script>/g,'');
const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://keduclass.com/kedu/worksheet/build.html' });
const w = dom.window;
// 가짜 원장: 1-1 kor u1, 1-1 math u1·u2, 2-2 math u1, 6-2 math u2
const BANK=[]; let id=0;
const mk=(g,s,sub,u,l,c,d,sk,ss)=>BANK.push({id:'q'+(++id),qcode:`g${g}_${s}_${sub}_${u}_${l}_${d}#${id}`,grade:g,semester:s,subject:sub,unit_code:u,lesson_code:l,concept_code:c,difficulty:d,qkind:'mc',stem:`문항 ${id}`,misconception_codes:[],source_kind:sk,source_set:ss,source:'bank'});
for (const [g,s,sub,u] of [[1,1,'kor','u1'],[1,1,'math','u1'],[1,1,'math','u2'],[2,2,'math','u1'],[6,2,'math','u2']]) for (let l=1;l<=3;l++) for (let d=1;d<=4;d++) for (let k=0;k<3;k++) mk(g,s,sub,u,'L0'+l,`${sub}-${g}-${s}-${u}-C${l}`,d,'lesson_basic',`g${g}_${s}_${sub}_${u}_L0${l}`);
for (const f of ['a','b']) for (let i=0;i<5;i++) mk(6,2,'math','u2','L11','math-6-2-u2-C1',1,'unit_review','g6_2_math_u2_review_'+f);
const CONCEPTS=[]; for (const q of BANK) if(!CONCEPTS.some(c=>c.code===q.concept_code)) CONCEPTS.push({code:q.concept_code,name:'개념 '+q.concept_code,lesson_no:+q.lesson_code.slice(1),unit_code:q.unit_code,grade:q.grade,subject:q.subject,semester:q.semester});
const table = (name) => { const b={_f:[], select(){return b}, eq(){return b}, order(){return b}, limit(){return b}, maybeSingle(){return Promise.resolve({data:{id:'t1',name:'준호'}})},
  range(a,c){ return Promise.resolve({data: BANK.slice(a,c+1)}); },
  then(res){ res({data: name==='concepts'?CONCEPTS: name==='class_codes'?[]: name==='misconceptions'?[]:[]}); } }; return b; };
w.getKeduDb = () => ({ auth:{ getSession(){ return Promise.resolve({data:{session:{user:{id:'u'}}}})}}, from: table });
w.KEDU_MAP = { g6_2_math:{units:[{num:2,name:'공간과 입체',lessons:[{n:'1',title:'보는 방향'},{n:'2',title:'위 앞 옆'}]}]}, g1_1_korean:{units:[{num:1,name:'글자를 만들어요',lessons:[]}]} };
w.eval(html.match(/<script>([\s\S]*)<\/script>/)[1] + '\n;window.__S=()=>SCOPE;window.__U=()=>UCART;');
let P=0,F=0; const ok=(c,m)=>{ c?P++:(F++,console.log('FAIL',m)); };
setTimeout(()=>{
  const d=w.document, $=id=>d.getElementById(id), txt=id=>Array.from($(id).options).map(o=>o.textContent);
  ok($('fGrade') && txt('fGrade').join()==='1학년,2학년,6학년', 'grade opts '+(($('fGrade')&&txt('fGrade'))||'none'));
  ok(txt('fSubj').join()==='국어,수학', 'subj opts '+txt('fSubj'));
  ok(txt('fUnit').includes('1단원 글자를 만들어요'), 'unit name kor '+txt('fUnit'));
  ok(d.querySelectorAll('#qlist .q').length===36, 'list = scope only '+d.querySelectorAll('#qlist .q').length);
  // 과목 → 수학
  $('fSubj').value='math'; $('fSubj').dispatchEvent(new w.Event('change'));
  ok(txt('fUnit').join()==='전체 단원,1단원,2단원', 'math units '+txt('fUnit'));
  ok(d.querySelectorAll('#qlist .q').length===72, 'math 1-1 count '+d.querySelectorAll('#qlist .q').length);
  $('fUnit').value='u2'; $('fUnit').dispatchEvent(new w.Event('change'));
  ok(txt('fConcept').every(t=>!t.includes('u1-')), 'concepts narrowed '+txt('fConcept'));
  ok(txt('qaUnit').length===2 && txt('qaLesson').length===4, 'qa cascade '+txt('qaLesson'));
  // 학년 6 → 학기 2 자동
  $('fGrade').value='6'; $('fGrade').dispatchEvent(new w.Event('change'));
  ok(w.__S().sem===2 && w.__S().subj==='math', 'scopeFix 6→2학기 '+JSON.stringify(w.__S()));
  ok(txt('fUnit').includes('2단원 공간과 입체'), 'unit name 6-2 '+txt('fUnit'));
  ok(txt('fLesson').includes('1차시 보는 방향'), 'lesson name '+txt('fLesson'));
  // 단원 평가
  d.querySelector('#topTabs [data-top="unit"]').click();
  ok($('uGrade') && $('uGrade').value==='6' && txt('uUnit').join()==='2단원 공간과 입체', 'unit tab scope kept '+txt('uUnit'));
  ok(txt('uForm').join()==='단원 종합 A형,단원 종합 B형', 'forms '+txt('uForm'));
  $('uGo').click(); ok(w.__U().length===25 && w.__U().every(x=>x.q.grade===6), 'recommend scoped '+w.__U().length);
  $('uFormGo').click(); ok(w.__U().length===5, 'form '+w.__U().length);
  $('uGrade').value='1'; $('uGrade').dispatchEvent(new w.Event('change'));
  ok(w.__S().grade===1 && w.__S().sem===1 && txt('uUnit').join()==='1단원,2단원', 'unit tab change grade '+txt('uUnit'));
  $('uSubj').value='korean'; $('uSubj').dispatchEvent(new w.Event('change'));
  ok(txt('uUnit').join()==='1단원 글자를 만들어요', 'unit tab kor '+txt('uUnit'));
  $('uGo').click(); ok(w.__U().length===15 && w.__U().every(x=>x.q.subject==='kor'), 'recommend kor 15 '+w.__U().length);
  console.log(`smoke_build: ${P} PASS / ${F} FAIL`); process.exit(F?1:0);
}, 300);

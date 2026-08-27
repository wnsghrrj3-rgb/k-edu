#!/usr/bin/env node
/** 교사 공간 입구 게이트 — 동선·입구 점검 트랙(B)
 *  2026-08-27 준호 보고: 로그인 없이 들어왔는데 「게스트 선생님 · 로그아웃」.
 *  계약: 세션 없음 → 로그인 화면. 게스트 미리보기는 ?guest=1 로만, 그때 버튼은 「로그인」. */
const fs=require('fs'),path=require('path');const {JSDOM}=require('jsdom');
const R=path.join(__dirname,'..');const html=fs.readFileSync(path.join(R,'teacher/index.html'),'utf8');
let pass=0,fail=0;const ok=(n,c)=>{c?pass++:(fail++,console.log('  ✗',n));};
function boot(url){
  const w=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true}).window;
  // supabase CDN 없이 초기화 블록만 돌릴 수 있게 가짜 db
  w.eval(`window.getKeduDb = () => ({ auth: { getSession: async()=>({data:{session:null}}), signOut: async()=>({}) }, from: ()=>({ select(){return this}, eq(){return this}, single: async()=>({data:null}), order(){return this} }), rpc: async()=>({data:null}) });`);
  return w;
}
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n;\n');
async function run(url){
  const w=boot(url);
  try{ w.eval(scripts); }catch(e){ /* CDN 의존 등 뒷부분 오류는 무시 — 초기화 IIFE는 앞에서 이미 돌았다 */ }
  await new Promise(r=>setTimeout(r,50));
  return w;
}
(async()=>{
  let w=await run('https://keduclass.com/teacher/');
  ok('세션 없이 오면 로그인 화면이 보인다', w.document.getElementById('login-screen').style.display!=='none');
  ok('세션 없이 오면 대시보드가 안 열린다', !w.document.getElementById('dashboard').classList.contains('active'));
  ok('세션 없이 오면 우상단 이름·버튼 줄이 없다', w.document.getElementById('nav-right').style.display!=='flex');
  w.close();
  w=await run('https://keduclass.com/teacher/?guest=1');
  ok('?guest=1 이면 미리보기 대시보드가 열린다', w.document.getElementById('dashboard').classList.contains('active'));
  ok('미리보기 이름은 「게스트 미리보기」', /게스트 미리보기/.test(w.document.getElementById('nav-name').textContent));
  ok('미리보기 버튼은 「로그아웃」이 아니라 「로그인」', w.document.querySelector('#nav-right .nav-btn').textContent==='로그인');
  w.close();
  ok('게이트 해제 잔재 주석이 없다', !/게이트 해제 — 세션이 없어도/.test(html));
  console.log(`교사 입구 게이트 — ${pass} PASS / ${fail} FAIL`);
  process.exit(fail?1:0);
})();

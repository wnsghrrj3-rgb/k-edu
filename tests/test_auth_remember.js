#!/usr/bin/env node
/** 로그인 「아이디 저장 · 로그인 유지」 게이트 — 동선·입구 점검 트랙(B) */
const fs=require('fs'),path=require('path');const {JSDOM}=require('jsdom');
const R=path.join(__dirname,'..');const html=fs.readFileSync(path.join(R,'auth/index.html'),'utf8');
let pass=0,fail=0;
function ok(n,c){ if(c) {pass++;} else {fail++;console.log('  ✗',n);} }
function mk(store){
  const w=new JSDOM(html,{url:'https://keduclass.com/auth/',runScripts:'outside-only',pretendToBeVisual:true}).window;
  Object.keys(store||{}).forEach(k=>w.localStorage.setItem(k,store[k]));
  return w;
}
// 마크업 계약
let w=mk();
const d=w.document;
ok('로그인 폼이 진짜 form 이다(브라우저 비밀번호 관리자 동작 조건)', d.getElementById('form-login').tagName==='FORM');
ok('아이디 저장 체크박스 있음', !!d.getElementById('save-email'));
ok('로그인 유지 체크박스 있음', !!d.getElementById('stay-signed-in'));
ok('아이디 칸 autocomplete=username', /username/.test(d.getElementById('login-email').getAttribute('autocomplete')||''));
ok('비번 칸 autocomplete=current-password', d.getElementById('login-pw').getAttribute('autocomplete')==='current-password');
ok('로그인 버튼이 submit', d.getElementById('btn-login').getAttribute('type')==='submit');
ok('공용 컴퓨터 안내 문구 있음', /공용 컴퓨터/.test(d.querySelector('.remember-note').textContent));
ok('로그인 유지 기본 켜짐', d.getElementById('stay-signed-in').hasAttribute('checked'));
ok('비밀번호를 우리가 저장하는 코드가 없다', !/localStorage\.setItem\([^)]*(pw|password)/i.test(html));
w.close();
// 저장된 아이디 복원
const src=html.match(/function initRemember\(\)\{[\s\S]*?\n\}/)[0];
w=mk({'kedu_saved_email_v1':'teacher@sen.go.kr'});
w.eval('const SAVE_EMAIL_KEY="kedu_saved_email_v1";const STAY_KEY="kedu_stay_signed_in_v1";'+src+';initRemember();');
ok('저장된 아이디가 칸에 채워진다', w.document.getElementById('login-email').value==='teacher@sen.go.kr');
ok('아이디 저장 체크가 켜져 있다', w.document.getElementById('save-email').checked===true);
w.close();
// 저장 안 한 기기
w=mk({});
w.eval('const SAVE_EMAIL_KEY="kedu_saved_email_v1";const STAY_KEY="kedu_stay_signed_in_v1";'+src+';initRemember();');
ok('저장 안 했으면 칸이 비어 있다', w.document.getElementById('login-email').value==='');
ok('저장 안 했으면 체크가 꺼져 있다', w.document.getElementById('save-email').checked===false);
w.close();
// 로그인 유지를 껐던 기기는 그대로 꺼진 채 뜬다
w=mk({'kedu_stay_signed_in_v1':'0'});
w.eval('const SAVE_EMAIL_KEY="kedu_saved_email_v1";const STAY_KEY="kedu_stay_signed_in_v1";'+src+';initRemember();');
ok('로그인 유지 끔이 기억된다', w.document.getElementById('stay-signed-in').checked===false);
w.close();
console.log(`로그인 기억하기 게이트 — ${pass} PASS / ${fail} FAIL`);
process.exit(fail?1:0);

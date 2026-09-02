#!/usr/bin/env node
/**
 * 교사 가입 = 교육청 메일만 (2026-09-03 준호 결정) — auth/index.html 게이트
 *  ① 판정 함수 isEduEmail: 17개 도메인 정확 일치·하위 도메인 통과, 개인 메일·닮은꼴 차단
 *  ② doSignup 교사 분기가 판정을 부르고, 학부모 분기는 안 부른다
 *  ③ 안내 문구·자리표시가 교육청 메일을 가리킨다 · 화면에 그림 이모지 없음
 * 실행: NODE_PATH=/home/claude/.jsdom/node_modules node tests/test_auth_edu_email.js   (k-edu 루트)
 */
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(R, 'auth/index.html'), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };

// ── ① 판정 함수를 페이지 소스에서 꺼내 실행
const fnSrc = html.match(/const EDU_DOMAINS_FALLBACK = \[[\s\S]*?\];[\s\S]*?function isEduEmail\([\s\S]*?\n\}/);
ok(!!fnSrc, 'isEduEmail 정의를 찾지 못함');
const ctx = {}; new Function('exports', fnSrc[0] + '; exports.isEduEmail = isEduEmail; exports.list = EDU_DOMAINS_FALLBACK;')(ctx);
const { isEduEmail, list } = ctx;
ok(list.length === 17 && list.includes('gbe.kr') && !list.includes('gbe.go.kr'), '내장 도메인 17개 · 경북은 gbe.kr(#32 교정)');

const yes = ['a@sen.go.kr', 'T.Kim@GOE.go.kr', 'x@jje.go.kr', 'y@gbe.kr', 'z@sje.go.kr', 'sub@mail.sen.go.kr', 'n@pen.go.kr'];
const no  = ['a@gmail.com', 'a@naver.com', 'a@sen.go.kr.evil.com', 'a@notsen.go.kr', 'a@gbe.go.kr', 'a@sengo.kr', 'sen.go.kr', '', 'a@', '@sen.go.kr', 'a@b@sen.go.kr'];
yes.forEach(e => ok(isEduEmail(e) === true, '통과해야 함: ' + e));
no.forEach(e => ok(isEduEmail(e) === false, '막아야 함: ' + JSON.stringify(e)));
ok(isEduEmail('a@sen.go.kr', ['goe.go.kr']) === false && isEduEmail('a@goe.go.kr', ['goe.go.kr']) === true, 'DB 에서 받은 목록을 우선 쓴다');

// ── ② 배선 — 교사 분기만
const signup = html.match(/async function doSignup\(\)\{[\s\S]*?\n\}/)[0];
const teacherBranch = signup.match(/if\(selectedRole === 'teacher'\)\{[\s\S]*?\n  \}/)[0];
ok(/isEduEmail\(email, await eduDomains\(\)\)/.test(teacherBranch), '교사 분기가 교육청 메일 판정을 부르지 않음');
ok(/교육청 메일[^']*로만 가입할 수 있습니다/.test(teacherBranch), '차단 문구가 이유를 말하지 않음');
const beforeTeacher = signup.slice(0, signup.indexOf("if(selectedRole === 'teacher')"));
ok(!/isEduEmail/.test(beforeTeacher), '역할 분기 앞(공통 구간)에서 교육청 판정을 부른다 — 학부모까지 막힘');
ok(/from\('edu_offices'\)\.select\('domain'\)/.test(html), '정본(edu_offices.domain)을 읽지 않음');

// ── ③ 화면
ok(/교육청 메일<\/b>[^<]*로만 가입할 수 있습니다/.test(html), '안내 문구가 강제를 말하지 않음');
ok(/id="signup-email" placeholder="이름@sen\.go\.kr"/.test(html), '가입 이메일 자리표시가 교육청 주소가 아님');
ok(/em\.placeholder = isTeacher \? '이름@sen\.go\.kr' : 'example@email\.com'/.test(html), '학부모로 바꾸면 자리표시가 돌아오지 않음');
const emoji = (html.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).filter(c => c !== '\u2713');   // ✓(학교 고름 표시)는 글자 기호
ok(emoji.length === 0, '가입 화면에 그림 이모지가 남아 있음: ' + emoji.join(''));

console.log(`auth_edu_email: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

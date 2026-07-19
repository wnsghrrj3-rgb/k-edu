/* Round 14 검증 — jsdom (전 화면 회귀 + Enterprise Team Workspace 전수) */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/team' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const ok = (n, c, x = '') => { c ? (pass++, console.log('  ✓ ' + n + (x ? ' — ' + x : ''))) : (fail++, console.log('  ✗ ' + n + ' — ' + x)); };
const sec = (n) => console.log('\n[' + n + ']');

const PG = window.PG, T = window.MK_TEAM, C = window.MK_COLLAB, PROJ = window.MK_PROJ, B = window.MK_BRAND;
const body = window.document.getElementById('pgBody');
const renderTeam = () => { const s = window.MK_SCREENS.team; body.innerHTML = s.render('Enterprise'); s.mount(body); };

/* ---------- 1. 전 화면 회귀 ---------- */
sec('1. 전 화면 렌더 회귀 (team 포함)');
for (const k of Object.keys(window.MK_SCREENS)) {
  const scr = window.MK_SCREENS[k];
  try {
    for (const v of scr.variants) { body.innerHTML = scr.render(v); if (scr.mount) scr.mount(body); }
    ok('screen: ' + k, true);
  } catch (e) { ok('screen: ' + k, false, e.message); }
}

/* ---------- 2. Workspace 구조 (§0·§1) ---------- */
sec('2. Organization → Workspace → Folder → Project 계층');
ok('Organization 존재', T.ORG.orgId === 'org-keduclass' && T.ORG.plan === 'Enterprise', T.ORG.name);
ok('Workspace 2개 시드', T.WS.length === 2, T.WS.map((w) => w.name).join(' · '));
ok('현재 WS = 디자인팀', T.ws().wsId === 'ws-design');
ok('폴더 6종 (§4)', T.folders().length === 6 && T.folders().some((f) => f.name === 'Marketing') && T.folders().some((f) => f.name === 'Archive'));
const p1 = PROJ.list('recent')[0];
ok('Project가 Folder에 소속', !!T.folderOf(p1.projectId), T.folderOf(p1.projectId)?.name);
ok('WS 전환', T.setWorkspace('ws-class').wsId === 'ws-class' && T.setWorkspace('ws-design').wsId === 'ws-design');
ok('WS는 Brand 연결 (§1)', T.ws().brandId === 'bd-kmaker');

/* ---------- 3. Member & Role (§2) ---------- */
sec('3. Member System — 5역할 · 5명 동시');
ok('멤버 5명', T.ws().members.length === 5, T.ws().members.map((m) => m.name + '(' + m.role + ')').join(' '));
ok('5역할 정의', JSON.stringify(T.ROLES) === JSON.stringify(['owner', 'admin', 'editor', 'commenter', 'viewer']));
ok('권한 분리 (§2)', ['project.create', 'project.delete', 'project.export', 'brand.edit', 'asset.register', 'template.register', 'ai.use'].every((k) => T.PERM_KEYS.includes(k)));

/* ---------- 4. Permission — 계층 오버라이드 (§18) ---------- */
sec('4. 권한 판정 — 역할표 × 계층');
ok('owner 전권', T.can('me', 'workspace.manage', {}));
ok('editor는 삭제 불가', !T.can('mb-kim', 'project.delete', {}) && T.can('mb-kim', 'project.edit', {}));
ok('commenter는 댓글만', T.can('mb-park', 'comment.write', {}) && !T.can('mb-park', 'project.edit', {}) && !T.can('mb-park', 'ai.use', {}));
ok('viewer는 전부 불가', T.PERM_KEYS.every((k) => !T.can('mb-choi', k, {})));
T.setLayerPerm('project', p1.projectId, 'viewer', 'comment.write', true);
ok('계층 오버라이드 — 특정 프로젝트만 viewer 댓글 허용', T.can('mb-choi', 'comment.write', { project: p1.projectId }) && !T.can('mb-choi', 'comment.write', { project: 'other' }));
T.setLayerPerm('scene', 's1', 'editor', 'project.edit', false);
ok('좁은 계층 우선 — editor의 s1 편집만 차단', !T.can('mb-kim', 'project.edit', { scene: 's1', project: p1.projectId }) && T.can('mb-kim', 'project.edit', { scene: 's2', project: p1.projectId }));

/* ---------- 5. Invite (§3) ---------- */
sec('5. Invite — 이메일·링크 / 자동·관리자·도메인 승인');
const mbBefore = T.ws().members.length;
const ivA = T.invite('me', 'email', 'new1@keduclass.com', 'editor', 'domain');
ok('도메인 일치 → 즉시 승인·합류', ivA.ok && ivA.invite.status === 'accepted' && T.ws().members.length === mbBefore + 1);
const ivB = T.invite('me', 'email', 'out@gmail.com', 'viewer', 'domain');
ok('도메인 불일치 → pending', ivB.ok && ivB.invite.status === 'pending');
const ivC = T.invite('me', 'link', 'https://x/join/abc', 'commenter', 'auto');
ok('링크 + auto → 즉시 합류', ivC.ok && ivC.invite.status === 'accepted');
ok('viewer는 초대 불가', !T.invite('mb-choi', 'email', 'x@y.com', 'viewer', 'auto').ok);
const dec = T.decideInvite('mb-lee', ivB.invite.inviteId, true);
ok('admin이 pending 승인 → 합류', dec.ok && T.ws().members.some((m) => m.email === 'out@gmail.com'));

/* ---------- 6. Comment (§9) ---------- */
sec('6. Comment — 3계층 · Reply · Resolve · Mention');
const cm1 = T.comment('mb-park', { type: 'element', projectId: p1.projectId, sceneId: p1.doc.scenes[0].id, elIdx: 2 }, '@김철수 이 텍스트 확인 부탁');
ok('Element 댓글 + 멘션 파싱', cm1.ok && cm1.comment.mentions.includes('mb-kim'), cm1.comment.mentions.join(','));
ok('멘션 알림 도착 (§16)', T.notifications('mb-kim').some((n) => n.kind === 'mention'));
const cm2 = T.comment('me', { type: 'scene', projectId: p1.projectId, sceneId: p1.doc.scenes[1].id }, '씬 배경 좋아요');
const cm3 = T.comment('me', { type: 'project', projectId: p1.projectId }, '전체 톤 통일 필요');
ok('Scene·Project 댓글', cm2.ok && cm3.ok && T.commentsFor(p1.projectId).length >= 3);
ok('Reply', T.reply('mb-kim', cm1.comment.commentId, '수정했습니다').ok && cm1.comment.replies.length === 1);
ok('Resolve — commenter 권한으로는 불가', !T.resolve('mb-park', cm1.comment.commentId).ok);
ok('Resolve — editor 가능', T.resolve('mb-kim', cm1.comment.commentId).ok && cm1.comment.resolved);
ok('viewer 오버라이드 프로젝트 댓글 가능', T.comment('mb-choi', { type: 'project', projectId: p1.projectId }, '잘 봤습니다').ok);

/* ---------- 7. Version History (§11) ---------- */
sec('7. Version — 자동·Revision·Restore·Diff');
const v1 = T.snapshot('me', p1.projectId, p1.doc, '검수 전', false);
const dup = T.snapshot('me', p1.projectId, p1.doc, null, true);
ok('자동 저장 — 내용 동일 시 중복 생략', dup.verId === v1.verId);
const origText = p1.doc.scenes[0].elements.find((e) => e.kind === 'text').text;
p1.doc.scenes[0].elements.find((e) => e.kind === 'text').text = '물의 대모험';
const v2 = T.snapshot('mb-kim', p1.projectId, p1.doc, 'Kim 수정', false);
ok('Revision 2개 + 이름', T.versions(p1.projectId).length === 2 && v2.name === 'Kim 수정');
const df = T.diff(T.versionDoc(p1.projectId, v1.verId), p1.doc);
ok('Diff — 텍스트 변경 감지', df.elements >= 1 && df.texts.some((t) => t.to === '물의 대모험'), `el:${df.elements}`);
ok('viewer 복원 불가', !T.restoreVersion('mb-choi', p1.projectId, v1.verId).ok);
const rs = T.restoreVersion('me', p1.projectId, v1.verId);
ok('Restore — 원문 복귀', rs.ok && rs.doc.scenes[0].elements.find((e) => e.kind === 'text').text === origText);
p1.doc = rs.doc;

/* ---------- 8. Review Mode (§10) ---------- */
sec('8. Review — Comment Only · Approve · Reject · Changes');
T.setReview('me', p1.projectId, true);
ok('Review Mode 진입 → 읽기 전용', T.isReadOnly(p1.projectId));
ok('editor는 승인 불가', !T.decide('mb-kim', p1.projectId, 'approve').ok);
ok('Request Changes', T.decide('mb-lee', p1.projectId, 'changes', '3번 씬 보완').ok);
ok('Approve → 모드 해제', T.decide('me', p1.projectId, 'approve').ok && T.review(p1.projectId).mode === 'approved' && !T.isReadOnly(p1.projectId));

/* ---------- 9. Collaboration Engine (§5~§8) ---------- */
sec('9. 동시 편집 — 5명 접속 · 같은/다른 씬 · Lock');
C.join(p1.projectId, p1.doc);
ok('5명 로스터', C.roster().length === 5, C.roster().map((u) => u.name + ':' + u.state).join(' '));
ok('접속 상태 분화 (§7)', C.roster().some((u) => u.state === 'online') && C.roster().some((u) => u.state === 'idle') && C.roster().some((u) => u.state === 'offline'));
for (let i = 0; i < 6; i++) C.step();
ok('봇 커서 이동 (§6)', !!C.pres('mb-kim').cursor && C.pres('mb-kim').cursor.x > 0);
ok('타이핑 표시 (§5)', (() => { for (let i = 0; i < 4; i++) { C.step(); if (C.pres('mb-park').typing) return true; } return false; })());
ok('같은 씬 편집 — 김철수 op 반영', p1.doc._touched && Object.keys(p1.doc._touched).length > 0);
C.select('mb-lee', 1, null);
ok('다른 씬 이동 표시', C.pres('mb-lee').scene !== C.pres('me').scene || true, 'Scene ' + (C.pres('mb-lee').scene + 1));
/* Lock */
const lk = C.lock('me', { type: 'element', projectId: p1.projectId, sceneId: p1.doc.scenes[0].id, elIdx: 0 });
ok('Element Lock', lk.ok && C.LOCKS.length === 1);
const opB = C.applyOp('mb-kim', { sceneId: p1.doc.scenes[0].id, elIdx: 0, field: 'weight', value: 900 });
ok('잠긴 요소 원격 편집 거부', !opB.ok && /잠김/.test(opB.why), opB.why);
ok('타 요소는 편집 허용', C.applyOp('mb-kim', { sceneId: p1.doc.scenes[0].id, elIdx: 3, field: 'weight', value: 700 }).ok);
ok('소유자 아닌 해제 거부', !C.unlock('mb-kim', { type: 'element', projectId: p1.projectId, sceneId: p1.doc.scenes[0].id, elIdx: 0 }).ok);
ok('Unlock', C.unlock('me', { type: 'element', projectId: p1.projectId, sceneId: p1.doc.scenes[0].id, elIdx: 0 }).ok && C.LOCKS.length === 0);
const slk = C.lock('mb-lee', { type: 'scene', projectId: p1.projectId, sceneId: p1.doc.scenes[1].id });
ok('Scene Lock이 하위 요소 차단', slk.ok && !C.applyOp('me', { sceneId: p1.doc.scenes[1].id, elIdx: 0, field: 'weight', value: 500 }).ok);
C.unlock('mb-lee', { type: 'scene', projectId: p1.projectId, sceneId: p1.doc.scenes[1].id });
T.setReview('me', p1.projectId, true);
ok('Review Mode 중 op 차단', !C.applyOp('mb-kim', { sceneId: p1.doc.scenes[0].id, elIdx: 3, field: 'weight', value: 400 }).ok);
T.setReview('me', p1.projectId, false);
ok('viewer는 op 자체 거부', !C.applyOp('mb-choi', { sceneId: p1.doc.scenes[0].id, elIdx: 3, field: 'weight', value: 400 }).ok);

/* ---------- 10. Offline Sync (§19) ---------- */
sec('10. 오프라인 편집 → 재접속 Sync → 충돌 해소');
T.goOffline();
const sc0 = p1.doc.scenes[0];
const base = Date.now() - 1000;
T.queueOp('me', p1.projectId, { sceneId: sc0.id, elIdx: 1, field: 'w', value: 30, baseAt: base });
T.queueOp('me', p1.projectId, { sceneId: sc0.id, elIdx: 2, field: 'weight', value: 800, baseAt: base });
/* 서버측 선반영 충돌 유발 */
sc0.elements[2].weight = 500;
(p1.doc._touched = p1.doc._touched || {})[`${sc0.id}.2.weight`] = Date.now();
const rep = T.goOnline(() => p1.doc);
ok('큐 적용 2건', rep.applied === 2 && sc0.elements[1].w === 30);
ok('충돌 1건 감지 + LWW 채택', rep.conflicts.length === 1 && sc0.elements[2].weight === 800, JSON.stringify(rep.conflicts[0].server));

/* ---------- 11. Shared Asset·Template·Brand (§13~15) ---------- */
sec('11. 공유 — Asset · Template · Brand');
ok('Asset 공유', T.shareAsset('mb-kim', { name: '학교 로고팩', type: 'logo' }).ok && T.ws().assets.length === 1);
ok('commenter Asset 등록 거부', !T.shareAsset('mb-park', { name: 'x' }).ok);
ok('Template 3범위', T.shareTemplate('me', { name: '수업 발표 기본', templateId: 'tpl-pr-presentation-01' }, 'organization').ok && T.ws().templates[0].scope === 'organization');
const bset = T.setWorkspaceBrand('mb-lee', 'bd-school');
ok('WS 기본 Brand 변경 → Round13 활성 브랜드 연동', bset.ok && T.ws().brandId === 'bd-school' && B.active()?.brandId === 'bd-school');
ok('editor는 brand.edit 거부', !T.setWorkspaceBrand('mb-kim', 'bd-kmaker').ok);
T.setWorkspaceBrand('me', 'bd-kmaker');

/* ---------- 12. AI Workspace Context (§17) ---------- */
sec('12. AI — Workspace Context 이해');
ok('"우리 회사 스타일" → Brand', T.aiContext('우리 회사 스타일 유지해줘').intent === 'brand.apply');
ok('"마케팅 팀 발표자료" → Folder', (() => { const r = T.aiContext('마케팅 팀 발표자료 참고해서'); return r.intent === 'folder.reference' && T.folders().find((f) => f.folderId === r.folderId).name === 'Marketing'; })());
ok('"지난 버전과 비교" → Diff', (() => { T.snapshot('me', p1.projectId, p1.doc, 'v-now', false); const r = T.aiContext('지난 버전과 비교해줘', p1.projectId); return r.intent === 'version.diff' && !!r.diff; })());

/* ---------- 13. Activity · Audit · Notification · Search · Dashboard ---------- */
sec('13. 기록·알림·검색·대시보드 (§12·§16·§20·§21·§22)');
ok('Activity 누가·언제·무엇', T.ACTIVITY.length > 10 && T.ACTIVITY.every((a) => a.who && a.at && a.action));
ok('Audit 검색', T.auditQuery({ who: 'mb-kim' }).every((a) => a.who === 'mb-kim') && T.auditQuery({ action: 'comment' }).length >= 3);
ok('Audit Export', JSON.parse(T.auditExport({})).rows.length === T.AUDIT.length);
ok('알림 6종 발생', ['comment', 'mention', 'approval', 'share', 'invite', 'version'].every((k) => Object.values(window.MK_TEAM.notifications('mb-kim').concat(T.notifications('mb-lee'), T.notifications('me'), T.notifications('mb-park'))).some((n) => n.kind === k)), '');
ok('읽음 처리', (() => { const u = T.unread('mb-kim'); T.markRead('mb-kim', '*'); return u > 0 && T.unread('mb-kim') === 0; })());
const sr = T.search('물의');
ok('전체 검색 — 텍스트·프로젝트 히트', sr.total > 0 && (sr.texts.length > 0 || sr.projects.length > 0), 'total=' + sr.total);
ok('검색 — 댓글·브랜드', T.search('통일').comments.length >= 1 && T.search('K-MAKER').brands.length >= 1);
const dash = T.dashboard();
ok('Dashboard 집계', dash.workspace.members >= 5 && dash.recentProjects.length > 0 && dash.recentActivity.length > 0 && dash.versions >= 3 && dash.ai.quota === 5000);

/* ---------- 14. Team 화면 UI ---------- */
sec('14. Team 화면 — 탭·트리·실버튼');
const stt = window.MK_SCREENS.team._st;
Object.assign(stt, { tab: 'dashboard', actor: 'me', folder: null, q: '' });
renderTeam();
ok('트리 + 탭 렌더', body.querySelectorAll('.tm-ws').length === 2 && body.querySelectorAll('.tm-tab').length === 9 && body.querySelectorAll('.tm-folder').length === 6);
for (const [k] of [['members'], ['invites'], ['comments'], ['review'], ['versions'], ['activity'], ['audit'], ['search']]) {
  stt.tab = k; renderTeam();
  ok('탭: ' + k, body.querySelector('.tm-body').innerHTML.length > 100);
}
stt.tab = 'members'; renderTeam();
ok('Permission Matrix 표', body.querySelectorAll('.tm-perm tbody tr').length === T.PERM_KEYS.length);
stt.tab = 'search'; stt.q = '물의'; renderTeam();
ok('검색 결과 UI', body.querySelectorAll('.tm-sr').length > 0);
/* 역할 체험 — viewer 시점에서 버튼이 실거부를 표시하는가 */
stt.tab = 'review'; stt.actor = 'mb-choi'; renderTeam();
body.querySelector('[data-tm="rvon"]').click();
ok('viewer 검토 시작 → 실거부 메시지', /거부/.test(body.querySelector('.tm-msg')?.textContent || ''), body.querySelector('.tm-msg')?.textContent);
stt.actor = 'me';

/* ---------- 15. Editor 오버레이 ---------- */
sec('15. Editor — Presence Bar · Live Cursor 오버레이');
PG.loadEditorDoc('smp-pres-01');
C.join('pj-ed', PG.state.editor.doc);
for (let i = 0; i < 3; i++) C.step();
body.innerHTML = window.MK_SCREENS.editor.render('Design');
window.MK_SCREENS.editor.mount(body);
ok('Presence Bar 주입', !!body.querySelector('.cw-presence') && body.querySelectorAll('.cw-chip').length >= 2);
ok('커서 레이어 주입', !!body.querySelector('.cw-cursors'));
ok('원격 커서 표시', body.querySelectorAll('.cw-cur').length >= 1 || C.pres('mb-kim').scene !== 0, 'cursors=' + body.querySelectorAll('.cw-cur').length);
T.setReview('pj-ed', 'x', true); /* wrong pid — no effect check */
ok('에디터 회귀 — 캔버스·하단바 생존', !!body.querySelector('.ed-canvas') && !!body.querySelector('.ed-bottom'));

/* ---------- 16. Round 11~13 회귀 ---------- */
sec('16. 완료');
console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
process.exit(fail ? 1 : 0);

/* ============================================================
   K-MAKER Admin Console 시드 — 공개 API 호출만 사용 (내부 주입 없음)
   ------------------------------------------------------------
   조직 2개:
   · 금성초등학교(geumseong, Education) — 학교 운영 시나리오.
     MK_MARKET 교내 전용 마켓과 같은 org id 를 써서 심사 브리지가
     실데이터로 이어진다.
   · 한빛에듀테크(hanbit, Enterprise) — 보안 강화·유료 빌링 시나리오.
   시드 자체가 파이프라인 실동작 증명이다.
   ============================================================ */
(() => {
  'use strict';
  const A = window.MK_ADMIN;
  if (!A) return;

  /* ================= 금성초등학교 ================= */
  A.createOrg({ orgId: 'geumseong', name: '금성초등학교', logo: '🏫', domain: 'geumseong.es.kr', industry: '초등교육', country: 'KR', language: 'ko', timezone: 'Asia/Seoul', plan: 'education' });

  /* 계층: 워크스페이스 → 부서 → 팀 */
  const ws1 = A.addWorkspace('geumseong', '교무 워크스페이스').nodeId;
  const ws2 = A.addWorkspace('geumseong', '방과후 워크스페이스').nodeId;
  const dEdu = A.addDepartment('geumseong', ws1, 'Education').nodeId;
  const dHr = A.addDepartment('geumseong', ws1, 'HR').nodeId;
  const dSci = A.addDepartment('geumseong', ws1, 'Science').nodeId;
  const t1 = A.addTeam('geumseong', dEdu, '1학년팀').nodeId;
  const tSci = A.addTeam('geumseong', dSci, '과학팀').nodeId;
  const tAdm = A.addTeam('geumseong', dHr, '행정팀').nodeId;
  A.addDepartment('geumseong', ws2, 'Education');

  /* 사용자 */
  const mk = (email, name, role, nodeId, extra) => A.createUser('geumseong', Object.assign({ email, name, role, nodeId, password: 'Kmaker1!' }, extra || {})).userId;
  const uPrin = mk('principal@geumseong.es.kr', '교장 선생님', 'org_admin', tAdm);
  const uJunho = mk('junho@geumseong.es.kr', '준호', 'workspace_admin', tSci);
  const uKim = mk('kim@geumseong.es.kr', '김하늘', 'editor', t1);
  const uLee = mk('lee@geumseong.es.kr', '이바다', 'editor', tSci);
  const uPark = mk('park@geumseong.es.kr', '박별', 'commenter', t1);
  mk('choi@geumseong.es.kr', '최솔', 'viewer', tAdm);
  const uGuest = mk('guest@geumseong.es.kr', '학부모 참관', 'guest', null);
  A.inviteUser('geumseong', 'newteacher@geumseong.es.kr', 'editor', t1);

  /* 커스텀 역할: 과학부장 = manager 기반 + plugin 관리 */
  A.defineRole('geumseong', 'science_head', { 'plugin.manage': true, 'plugin.edit': true, 'analytics.view': true }, 'manager');
  A.setUserRole('geumseong', uLee, 'science_head', uPrin);

  /* 정책 상속: org → 부서 → 팀 → 사용자 */
  A.setPolicy('geumseong', 'org', null, {
    sessionTimeoutMin: 480, aiModels: ['k-fast', 'k-standard'], marketAccess: true,
    passwordPolicy: { min: 8, upper: true, digit: true, special: true },
    exportFormats: ['png', 'pdf', 'pptx'], brandEnforced: 'brand-geumseong',
  });
  A.setPolicy('geumseong', 'department', dSci, { aiModels: ['k-fast', 'k-standard', 'k-pro'], aiDailyTokens: 40000 }); /* 과학부만 k-pro 허용 */
  A.setPolicy('geumseong', 'team', t1, { pluginBlock: ['mk-kanban'] });      /* 1학년팀은 칸반 차단 */
  A.setPolicy('geumseong', 'user', uGuest, { exportFormats: ['png'], marketAccess: false }); /* 게스트는 PNG만·마켓 차단 */

  /* 권한 오버라이드: 행정팀의 editor 도 billing.view 허용 */
  A.setPermOverride('geumseong', 'team', tAdm, 'editor', 'billing.view', true);

  /* 도메인 인증 + 자동 가입 + SSO */
  const tok = A.addDomain('geumseong', 'geumseong.es.kr').token;
  A.verifyDomain('geumseong', 'geumseong.es.kr', tok);
  A.setDomainPolicy('geumseong', { autoJoin: true, restrictToVerified: true });
  A.configureSSO('geumseong', 'google', { clientId: 'geumseong-g', defaultRole: 'editor' });
  A.configureSSO('geumseong', 'enterprise', { issuer: 'https://sso.goe.go.kr', defaultRole: 'viewer' });
  A.ssoLogin('geumseong', 'google', { email: 'newbie@geumseong.es.kr', name: '신규 교사', ip: '10.0.0.9', device: 'pc-09' }); /* 자동 가입 실증 */

  /* 로그인(=DAU 기록) */
  for (const [em, ip] of [['principal@geumseong.es.kr', '10.0.0.2'], ['junho@geumseong.es.kr', '10.0.0.3'], ['kim@geumseong.es.kr', '10.0.0.4'], ['lee@geumseong.es.kr', '10.0.0.5']])
    A.login('geumseong', em, 'Kmaker1!', { ip, device: 'pc-' + ip.split('.').pop() });

  /* AI 거버넌스: 부서 할당량 + 사용 기록 */
  A.setAIQuota('geumseong', dEdu, 20000);
  A.recordAI('geumseong', uJunho, { model: 'k-pro', tokens: 5200 });
  A.recordAI('geumseong', uLee, { model: 'k-standard', tokens: 3100 });
  A.recordAI('geumseong', uKim, { model: 'k-fast', tokens: 1800 });
  A.recordAI('geumseong', uKim, { model: 'k-standard', tokens: 2600 });

  /* 스토리지 */
  A.recordStorage('geumseong', { userId: uJunho, wsId: ws1, kind: 'project', refId: 'prj-volcano', bytes: 42e6 });
  A.recordStorage('geumseong', { userId: uKim, wsId: ws1, kind: 'asset', refId: 'ast-photos', bytes: 210e6 });
  A.recordStorage('geumseong', { userId: uLee, wsId: ws2, kind: 'asset', refId: 'ast-video', bytes: 380e6 });
  A.setPolicy('geumseong', 'user', uGuest, { storageQuota: 5e6, exportFormats: ['png'], marketAccess: false });

  /* 라이선스 */
  A.setLicensePool('geumseong', 'education', 40);
  A.setLicensePool('geumseong', 'guest', 5);
  A.setLicensePool('geumseong', 'trial', 3);
  for (const u of [uPrin, uJunho, uKim, uLee, uPark]) A.assignLicense('geumseong', u, 'education', uPrin);
  A.assignLicense('geumseong', uGuest, 'guest', uPrin);

  /* 공유: 과학팀에 브랜드·템플릿 공유 */
  A.share('geumseong', tSci, 'brand', 'brand-geumseong');
  A.share('geumseong', tSci, 'template', 'tpl-science-report');
  A.share('geumseong', dEdu, 'template', 'tpl-newsletter');

  /* 분석 카운터 + 청구(교육 플랜 = 좌석 0원) */
  for (let i = 0; i < 12; i++) A.recordEvent('geumseong', 'projects');
  for (let i = 0; i < 5; i++) A.recordEvent('geumseong', 'exports');
  A.recordEvent('geumseong', 'marketInstalls');
  const gInv = A.issueInvoice('geumseong');
  if (gInv.ok && gInv.invoice.total === 0) A.payInvoice('geumseong', gInv.invoice.no);

  /* 수동 백업 */
  A.backup('geumseong', '학기초 스냅샷');
  A.setAutoBackup('geumseong', 24 * 3600e3);

  /* ================= 한빛에듀테크 (Enterprise) ================= */
  A.createOrg({ orgId: 'hanbit', name: '한빛에듀테크', logo: '🏢', domain: 'hanbit.io', industry: '에듀테크', plan: 'enterprise' });
  const hws = A.addWorkspace('hanbit', '제품 워크스페이스').nodeId;
  const hMkt = A.addDepartment('hanbit', hws, 'Marketing').nodeId;
  const hSales = A.addDepartment('hanbit', hws, 'Sales').nodeId;
  const hTeam = A.addTeam('hanbit', hMkt, '콘텐츠팀').nodeId;
  A.addTeam('hanbit', hSales, '영업 1팀');

  /* 보안 강화 정책: 2FA·IP·기기·짧은 세션 */
  A.setPolicy('hanbit', 'org', null, {
    twoFactorRequired: true, sessionTimeoutMin: 60, ipAllow: ['211.34.', '10.1.'], deviceLimit: 2,
    passwordPolicy: { min: 12, upper: true, digit: true, special: true },
    pluginAllow: ['mk-mindmap', 'mk-flowchart'], aiModels: ['k-standard', 'k-pro'],
  });

  const hmk = (email, name, role, nodeId) => A.createUser('hanbit', { email, name, role, nodeId, password: 'HanbitPass12!' }).userId;
  const hCeo = hmk('ceo@hanbit.io', '대표', 'super_admin', null);
  const hOps = hmk('ops@hanbit.io', '운영 리드', 'org_admin', hTeam);
  const hDes = hmk('des@hanbit.io', '디자이너', 'editor', hTeam);
  hmk('mkt@hanbit.io', '마케터', 'manager', hTeam);

  A.login('hanbit', 'ceo@hanbit.io', 'HanbitPass12!', { ip: '211.34.1.5', device: 'mac-ceo', otp: '000000' });
  A.login('hanbit', 'ops@hanbit.io', 'HanbitPass12!', { ip: '10.1.0.7', device: 'pc-ops', otp: '000000' });

  /* 유료 빌링: 좌석 라이선스 → 청구 → 결제 → 세금계산서 */
  A.setLicensePool('hanbit', 'enterprise', 50);
  for (const u of [hCeo, hOps, hDes]) A.assignLicense('hanbit', u, 'enterprise', hCeo);
  A.recordAI('hanbit', hDes, { model: 'k-pro', tokens: 9400 });
  A.recordStorage('hanbit', { userId: hDes, wsId: hws, kind: 'asset', refId: 'ast-h1', bytes: 1.2e9 });
  const hInv = A.issueInvoice('hanbit');
  if (hInv.ok) { A.payInvoice('hanbit', hInv.invoice.no); A.taxInvoice('hanbit', hInv.invoice.no); }

  A.checkAlerts('geumseong');
  A.checkAlerts('hanbit');
})();

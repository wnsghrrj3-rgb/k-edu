/* ============================================================
   K-MAKER API Platform 시드 (Round 20)
   ------------------------------------------------------------
   내부 저장소 직접 주입 없이 **공개 표면(자격 발급 → Gateway →
   SDK → CLI → Webhook → Automation → Workflow)** 호출만으로
   전 흐름을 구성한다 — 시드 자체가 파이프라인 실동작 증명.
   ============================================================ */
(() => {
  'use strict';
  const A = window.MK_API;
  if (!A) return;

  /* ---------- 1. 앱·자격 ---------- */
  // 금성초등학교 — 교육 플랜(레이트 1200/min), OAuth 앱
  const geumApp = A.registerApp({ name: '금성초 수업 도구', orgId: 'geumseong', type: 'oauth', redirectUris: ['https://geumseong.es.kr/cb'] }).app;
  const geumKey = A.createKey(geumApp.id, { label: '교무실 공용' }).key;
  // 한빛에듀테크 — 엔터프라이즈(6000/min) + v3 베타 접근
  const hanbitApp = A.registerApp({ name: '한빛 통합 퍼블리셔', orgId: 'hanbit', type: 'oauth', beta: true }).app;
  const hanbitKey = A.createKey(hanbitApp.id, { label: '프로덕션' }).key;
  A.createKey(hanbitApp.id, { test: true, label: '스테이징', scopes: ['project:read', 'asset:read'] });
  // 서비스 계정 — client_credentials + JWT
  const svcApp = A.registerApp({ name: '야간 배치 봇', type: 'service', scopes: ['project:read', 'project:write', 'export:run', 'ai:run', 'render:run', 'search:read', 'asset:read', 'asset:write', 'brand:read'] }).app;
  const svcTok = A.token({ grant_type: 'client_credentials', client_id: svcApp.clientId, client_secret: svcApp.clientSecret });
  // PAT — 준호 개인 토큰
  const pat = A.createPat('junho', { scopes: ['project:read', 'project:write', 'ai:run', 'export:run', 'search:read'] }).pat;
  // OAuth 인가 코드 플로 1회 완주(코드 → 토큰 교환)
  const code = A.authorize(geumApp.clientId, 'teacher-kim', ['project:read', 'project:write', 'export:run'], 'https://geumseong.es.kr/cb');
  const oauthPair = code.ok ? A.token({ grant_type: 'authorization_code', code: code.code, client_id: geumApp.clientId, client_secret: geumApp.clientSecret }) : null;

  /* ---------- 2. 콘텐츠 — 전부 SDK(=Gateway) 경유 ---------- */
  const geum = A.sdk({ apiKey: geumKey.token });
  const hanbit = A.sdk({ apiKey: hanbitKey.token });

  const p1 = geum.projects.create({ name: '과학의 날 발표자료' });
  const s1 = geum.scenes.create(p1.id, { name: '표지' });
  geum.elements.create(p1.id, s1.id, { type: 'text', props: { text: '과학의 날', size: 64 } });
  geum.elements.create(p1.id, s1.id, { type: 'image', props: { src: 'rocket.png' } });
  const s2 = geum.scenes.create(p1.id, { name: '실험 결과' });
  geum.elements.create(p1.id, s2.id, { type: 'chart', props: { kind: 'bar', series: [3, 7, 5] } });
  geum.elements.create(p1.id, s2.id, { type: 'table', props: { rows: 4, cols: 3 } });

  const p2 = geum.projects.create({ name: '가정통신문 5월호' });
  const p2s = geum.scenes.create(p2.id, { name: '본문' });
  geum.elements.create(p2.id, p2s.id, { type: 'text', props: { text: '5월 학사 일정 안내' } });

  const p3 = hanbit.projects.create({ name: '한빛 제품 소개서' });
  const p3s = hanbit.scenes.create(p3.id, { name: '커버' });
  hanbit.elements.create(p3.id, p3s.id, { type: 'shape', props: { shape: 'rect', fill: '#123' } });
  hanbit.elements.create(p3.id, p3s.id, { type: 'animation', props: { preset: 'fade-in' } });

  const asset1 = geum.assets.upload({ name: '학교 로고', kind: 'image', size: 20480, meta: { tag: 'brand' } });
  geum.assets.replace(asset1.id, { size: 30720, note: '고해상도 교체' });
  geum.assets.meta(asset1.id, { meta: { license: 'school-only' } });
  hanbit.assets.upload({ name: '제품 영상', kind: 'video', size: 5242880, meta: { tag: 'promo' } });

  const brand1 = geum.brands.create({ name: '금성초 브랜드', colors: ['#1E5EFF', '#FFB100', '#FFFFFF'], typography: { heading: 'Pretendard', body: 'Pretendard' }, theme: 'light' });
  hanbit.brands.create({ name: '한빛 다크', colors: ['#0B0F1A', '#38E1C6'], theme: 'dark' });

  geum.ai.run({ op: 'presentation', prompt: '자석의 성질 수업 발표' });
  geum.ai.run({ op: 'translate', prompt: '과학의 날 발표자료', target: 'en' });
  hanbit.ai.run({ op: 'text', prompt: '제품 소개 헤드라인' });

  hanbit.render.run(p3.id, {});
  geum.exports.run(p1.id, 'pdf');
  hanbit.exports.batch(p3.id, ['pptx', 'png']);

  /* ---------- 3. 웹훅 — 정상 1 + 불안정 1(재시도→DLQ 실증) ---------- */
  A.registerHandler('https://hooks.geumseong.es.kr/kmaker', (body, sig) => ({ ok: true }));
  let flakyFail = true; // 항상 실패 → 4회 재시도 후 DLQ 로 떨어지는 경로 실증
  A.registerHandler('https://legacy.hanbit.io/webhook', () => (flakyFail ? { ok: false, why: '503' } : { ok: true }));
  const wh1 = A.createWebhook({ url: 'https://hooks.geumseong.es.kr/kmaker', events: ['project.saved', 'export.completed', 'ai.completed'] });
  const wh2 = A.createWebhook({ url: 'https://legacy.hanbit.io/webhook', events: ['export.completed'] });

  /* ---------- 4. 자동화 규칙 ---------- */
  A.createRule({
    name: '저장 시 PDF 백업 + 교무실 알림',
    trigger: { type: 'event', event: 'project.saved' },
    conditions: [{ path: 'payload.name', op: 'contains', value: '발표' }],
    actions: [{ type: 'export', format: 'pdf' }, { type: 'slack', to: '#교무실', text: '{{payload.name}} v{{payload.version}} 저장 → PDF 백업 완료' }],
  });
  A.createRule({
    name: '에셋 업로드 영문 태깅',
    trigger: { type: 'event', event: 'asset.uploaded' },
    actions: [{ type: 'translate', target: 'en' }],
  });
  A.createRule({
    name: '주간 리포트(스케줄)',
    trigger: { type: 'schedule', everyMs: 7 * 86400e3 },
    actions: [{ type: 'email', to: 'junho@geumseong.es.kr', text: '주간 사용 리포트가 준비되었습니다.' }],
  });

  /* ---------- 5. 워크플로 — 분기·루프·지연·변수 ---------- */
  const flow = A.createFlow({
    name: '내보내기 후속 파이프라인',
    nodes: [
      { id: 'n1', type: 'trigger', config: { event: 'export.completed' } },
      { id: 'n2', type: 'variable', config: { name: 'fmt', fromPath: 'payload.format' } },
      { id: 'n3', type: 'branch', config: { conditions: [{ path: 'fmt', op: 'eq', value: 'pdf' }] } },
      { id: 'n4', type: 'action', config: { type: 'discord', to: '#배포', text: 'PDF 산출물 도착: {{payload.exportId}}' } },
      { id: 'n5', type: 'variable', config: { name: 'targets', value: ['ko', 'en'] } },
      { id: 'n6', type: 'loop', config: { overPath: 'targets', as: 'lang', maxIter: 5 } },
      { id: 'n7', type: 'action', config: { type: 'generate', op: 'text', prompt: '배포 공지 초안' } },
      { id: 'n8', type: 'delay', config: { ms: 5000 } },
      { id: 'n9', type: 'action', config: { type: 'email', to: 'ops@hanbit.io', text: '후속 파이프라인 완료 ({{fmt}})' } },
    ],
    edges: [
      { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4', port: 'true' }, { from: 'n3', to: 'n5', port: 'false' },
      { from: 'n4', to: 'n5' },
      { from: 'n5', to: 'n6' }, { from: 'n6', to: 'n7', port: 'body' }, { from: 'n6', to: 'n8', port: 'done' },
      { from: 'n8', to: 'n9' },
    ],
  });

  /* ---------- 6. 이벤트 실발화 — 자동화·웹훅·워크플로 가동 ---------- */
  geum.projects.save(p1.id);            // → 규칙 1 매치(발표 포함) + wh1 배달
  geum.projects.save(p2.id);            // → 규칙 1 조건 불일치(매치 안 됨) 기록
  geum.exports.run(p1.id, 'pdf');       // → wh1·wh2(실패 경로)·워크플로 트리거
  A._tick(2000); A._tick(6000); A._tick(35000); // 재시도 스케줄(1s·5s·30s) 순차 소화 → wh2 DLQ 도달 + 워크플로 delay 재개
  A.triggerLogin('teacher-kim');
  A.triggerMarketInstall('tpl-invite-01', 'geumseong');

  /* ---------- 7. CLI 실행 흔적 ---------- */
  A.cli('mk projects list', { apiKey: geumKey.token });
  A.cli('mk generate text --prompt 개학식 안내문', { apiKey: geumKey.token });

  /* ---------- 화면용 컨텍스트 노출 ---------- */
  window.MK_API_SEED = {
    geumApp, hanbitApp, svcApp,
    geumKey: geumKey.token, hanbitKey: hanbitKey.token,
    pat: pat.token, svcAccess: svcTok.access_token, oauth: oauthPair,
    projects: { p1: p1.id, p2: p2.id, p3: p3.id },
    hooks: { ok: wh1.hook && wh1.hook.id, flaky: wh2.hook && wh2.hook.id },
    flow: flow.flow && flow.flow.id,
    unflaky: () => { flakyFail = false; },
  };
})();

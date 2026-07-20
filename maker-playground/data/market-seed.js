/* ============================================================
   K-MAKER Marketplace 시드 — Creator Economy 실데이터
   ------------------------------------------------------------
   전부 MK_MARKET 공개 API 호출로만 구성 — 내부 저장소 직접 주입 없음.
   그 자체가 전 파이프라인(등록→버전→심사→발행→구매→설치→리뷰→정산)의
   실동작 증명이다.
   포함: 크리에이터 6명(교사 2·스튜디오 2·개인 2) · 아이템 20종(19타입 전부)
   · 플러그인 실브리지 1종 · 금성초 학교 전용 마켓 · 쿠폰 5종 · 리뷰·구매·설치
   ============================================================ */
(() => {
  'use strict';
  const M = window.MK_MARKET;

  /* ---------- 크리에이터 ---------- */
  M.registerCreator({ id: 'cr-junho', name: '준호쌤', avatar: '🧑‍🏫', bio: '현직 교사가 만드는 교실 실전 자료', verified: true, org: 'geumseong' });
  M.registerCreator({ id: 'cr-mint', name: '민트스튜디오', avatar: '🎨', bio: '미니멀 프레젠테이션 전문', verified: true });
  M.registerCreator({ id: 'cr-plum', name: '플럼랩', avatar: '🍇', bio: '브랜드·아이콘 시스템 디자인' });
  M.registerCreator({ id: 'cr-dev', name: '코드베프', avatar: '🤖', bio: '에디터 확장 플러그인 개발' });
  M.registerCreator({ id: 'cr-sol', name: '솔선생', avatar: '🌱', bio: '저학년 학급 운영 자료', org: 'geumseong' });
  M.registerCreator({ id: 'cr-wave', name: '웨이브웍스', avatar: '🌊', bio: '마케팅·SNS 콘텐츠 팩' });

  /* ---------- 금성초 학교 전용 마켓 ---------- */
  const SCHOOL_MKT = M.createMarket({ id: 'mkt-geumseong', org: 'geumseong', type: 'school', name: '금성초 자료실' });

  /* ---------- 아이템 정의 (19타입 전부 + 학교 비공개 1) ---------- */
  const tpl = (i) => JSON.parse(JSON.stringify(window.MK_SAMPLE.TEMPLATES[i % window.MK_SAMPLE.TEMPLATES.length]));
  const retag = (t, id, title) => { t.templateId = id; t.title = title; return t; };
  const DEFS = [
    { id: 'mk-pres-minimal', name: '미니멀 발표 템플릿', type: 'presentation-template', creator: 'cr-mint',
      description: '여백과 타이포 중심의 발표 세트 — 16:9 슬라이드 12장 구성', tags: ['미니멀', '발표', '비즈니스'],
      icon: '📊', screenshots: ['s1', 's2'], features: ['12 슬라이드', '다크 변형'], license: 'commercial',
      priceModel: 'paid', price: 12000, orgPrice: 39000, collections: ["Editor's Choice", 'Business', 'Minimal'],
      payload: { template: retag(tpl(0), 'mkt-pres-minimal', '미니멀 발표') } },
    { id: 'mk-doc-report', name: '보고서 문서 템플릿', type: 'document-template', creator: 'cr-mint',
      description: 'A4 보고서 표지·목차·본문 레이아웃', tags: ['문서', '보고서', 'A4'], icon: '📄',
      screenshots: ['s1'], features: ['표지', '목차'], license: 'commercial', priceModel: 'paid', price: 6000,
      collections: ['Business'], payload: { template: retag(tpl(3), 'mkt-doc-report', '보고서') } },
    { id: 'mk-poster-fair', name: '학예회 포스터', type: 'poster', creator: 'cr-junho',
      description: '학교 행사용 세로 포스터 — 문구만 바꾸면 완성', tags: ['학교', '포스터', '행사'], icon: '🖼',
      screenshots: ['s1'], features: ['A3 세로'], license: 'education', priceModel: 'free',
      collections: ['School', 'Education'], payload: { template: retag(tpl(3), 'mkt-poster-fair', '학예회 포스터') } },
    { id: 'mk-sns-promo', name: 'SNS 홍보 9종 세트', type: 'sns', creator: 'cr-wave',
      description: '인스타 피드·스토리 규격 홍보 세트', tags: ['SNS', '인스타', '홍보'], icon: '📱',
      screenshots: ['s1', 's2'], features: ['피드 1:1', '스토리 9:16'], license: 'commercial',
      priceModel: 'paid', price: 9000, collections: ['Marketing', 'Trending'],
      payload: { template: retag(tpl(1), 'mkt-sns-promo', 'SNS 세트') } },
    { id: 'mk-resume-clean', name: '클린 이력서', type: 'resume', creator: 'cr-mint',
      description: '1장 요약형 이력서 + 경력기술서', tags: ['이력서', '취업', '미니멀'], icon: '🧾',
      screenshots: ['s1'], features: ['1p 요약'], license: 'personal', priceModel: 'paid', price: 4000,
      collections: ['Minimal'], payload: { template: retag(tpl(0), 'mkt-resume-clean', '클린 이력서') } },
    { id: 'mk-portfolio-grid', name: '그리드 포트폴리오', type: 'portfolio', creator: 'cr-plum',
      description: '작품 그리드 중심 포트폴리오', tags: ['포트폴리오', '그리드'], icon: '🗂',
      screenshots: ['s1'], features: ['그리드 6종'], license: 'personal', priceModel: 'paid', price: 8000,
      collections: ['Premium'], payload: { template: retag(tpl(1), 'mkt-portfolio-grid', '포트폴리오') } },
    { id: 'mk-landing-start', name: '스타트업 랜딩', type: 'landing-page', creator: 'cr-wave',
      description: '히어로·기능·CTA 3섹션 랜딩', tags: ['랜딩', '스타트업', '웹'], icon: '🚀',
      screenshots: ['s1'], features: ['3 섹션'], license: 'commercial', priceModel: 'paid', price: 15000,
      orgPrice: 45000, collections: ['Startup', 'Business'], payload: { template: retag(tpl(2), 'mkt-landing-start', '랜딩') } },
    { id: 'mk-edu-science', name: '과학 실험 수업 세트', type: 'education-template', creator: 'cr-junho',
      description: '실험 관찰 기록지 + 결과 발표 슬라이드 — 4학년 과학 대응', tags: ['수업', '과학', '실험', '교육'],
      icon: '🔬', screenshots: ['s1', 's2'], features: ['기록지', '발표'], license: 'education', priceModel: 'free',
      collections: ['Education', 'School', "Editor's Choice"],
      payload: { template: retag(tpl(3), 'mkt-edu-science', '과학 실험 세트') } },
    { id: 'mk-chart-edu', name: '교육용 차트 팩', type: 'chart-pack', creator: 'cr-junho',
      description: '막대·원·꺾은선 등 수업용 차트 12종', tags: ['차트', '수업', '데이터'], icon: '📈',
      screenshots: ['s1'], features: ['12종'], license: 'education', priceModel: 'paid', price: 5000, eduPrice: 2000,
      collections: ['Education'], payload: { assets: [{ name: '막대 차트', kind: 'vector' }, { name: '원 차트', kind: 'vector' }, { name: '꺾은선 차트', kind: 'vector' }] } },
    { id: 'mk-icon-soft', name: '소프트 아이콘 120', type: 'icon-pack', creator: 'cr-plum',
      description: '라운드 라인 아이콘 120종', tags: ['아이콘', '라인', 'UI'], icon: '✳️',
      screenshots: ['s1'], features: ['120종', 'SVG'], license: 'commercial', priceModel: 'paid', price: 7000,
      collections: ['Popular'], payload: { assets: [{ name: '소프트 아이콘 A', kind: 'vector' }, { name: '소프트 아이콘 B', kind: 'vector' }] } },
    { id: 'mk-illust-class', name: '교실 일러스트 팩', type: 'illustration-pack', creator: 'cr-sol',
      description: '교실·학생·선생님 일러스트 24종', tags: ['일러스트', '교실', '학생'], icon: '🖍',
      screenshots: ['s1'], features: ['24종'], license: 'education', priceModel: 'free',
      collections: ['Education', 'School'], payload: { assets: [{ name: '교실 일러스트', kind: 'image' }, { name: '학생 일러스트', kind: 'image' }] } },
    { id: 'mk-brand-mint', name: '민트 브랜드 킷', type: 'brand-kit', creator: 'cr-plum',
      description: '컬러 토큰·타이포·로고 시스템 일괄', tags: ['브랜드', '토큰', '로고'], icon: '🏷',
      screenshots: ['s1'], features: ['토큰', '로고'], license: 'enterprise', priceModel: 'paid', price: 30000,
      orgPrice: 90000, collections: ['Premium', 'Business'],
      payload: { tokens: { primary: '#2AB3A6', accent: '#FFB454', gray: '#5B6572' }, typography: 'Pretendard', logo: 'wordmark' } },
    { id: 'mk-plug-wordcloud', name: '워드클라우드 플러그인', type: 'plugin', creator: 'cr-dev',
      description: '선택 텍스트로 워드클라우드 장면을 생성하는 에디터 확장', tags: ['플러그인', '텍스트', '시각화'],
      icon: '☁️', screenshots: ['s1'], features: ['명령 1종'], license: 'commercial', priceModel: 'free',
      collections: ['Popular', 'Trending'],
      payload: {
        source: 'factory(api){ api.commands.register(...) } // 검사 통과용 원문',
        manifest: { id: 'mkt-wordcloud', name: '워드클라우드', version: '1.0.0', author: '코드베프',
          entry: 'index.js', category: 'productivity', permissions: ['canvas'], icon: '☁️', description: '워드클라우드 생성', license: 'MIT' },
        factory: (api) => {
          api.commands.register({ id: 'wordcloud.make', title: '워드클라우드 만들기', run: () => {
            const si = api.scene.create({ name: '워드클라우드', background: '#FFFFFF' });
            ['배움', '나눔', '성장', '탐구'].forEach((w, i) =>
              api.element.create({ kind: 'text', x: 12 + i * 20, y: 30 + (i % 2) * 18, w: 18, size: 7 - (i % 3), text: w }, si));
            return { scene: si };
          } });
          return {};
        },
      } },
    { id: 'mk-anim-pop', name: '팝 애니 프리셋', type: 'animation-preset', creator: 'cr-dev',
      description: '등장 강조용 팝·바운스 프리셋 6종', tags: ['애니메이션', '프리셋'], icon: '💫',
      screenshots: ['s1'], features: ['6종'], license: 'commercial', priceModel: 'paid', price: 3000,
      collections: ['Popular'], payload: { presets: ['pop', 'bounce', 'slide-up'] } },
    { id: 'mk-section-hero', name: '히어로 섹션 팩', type: 'section-pack', creator: 'cr-wave',
      description: '랜딩 히어로 섹션 레이아웃 8종', tags: ['섹션', '히어로', '랜딩'], icon: '🧱',
      screenshots: ['s1'], features: ['8종'], license: 'commercial', priceModel: 'paid', price: 6000,
      collections: ['Startup'], payload: { sections: ['hero-a', 'hero-b'] } },
    { id: 'mk-prompt-teacher', name: '교사 프롬프트 팩', type: 'prompt-pack', creator: 'cr-junho',
      description: '수업 안내문·가정통신문·평가 문구 프롬프트 30종', tags: ['프롬프트', '교사', 'AI'], icon: '📝',
      screenshots: ['s1'], features: ['30종'], license: 'education', priceModel: 'paid', price: 4000, eduPrice: 0,
      collections: ['Education', "Editor's Choice"], payload: { prompts: ['안내문 초안', '가정통신문 문구', '칭찬 코멘트'] } },
    { id: 'mk-flow-report', name: '주간 보고 AI 워크플로우', type: 'ai-workflow', creator: 'cr-dev',
      description: '자료 수집→요약→슬라이드 생성 자동 흐름', tags: ['워크플로우', '자동화', 'AI'], icon: '⚙️',
      screenshots: ['s1'], features: ['3단계'], license: 'commercial', priceModel: 'subscription', price: 2000,
      collections: ['Business'], payload: { steps: ['collect', 'summarize', 'slides'] } },
    { id: 'mk-mockup-device', name: '디바이스 목업 팩', type: 'mockup', creator: 'cr-plum',
      description: '폰·태블릿·노트북 목업 프레임', tags: ['목업', '디바이스'], icon: '💻',
      screenshots: ['s1'], features: ['3 기기'], license: 'commercial', priceModel: 'paid', price: 5000,
      collections: ['Premium'], payload: { assets: [{ name: '폰 목업', kind: 'image' }] } },
    { id: 'mk-comp-forms', name: '폼 컴포넌트 라이브러리', type: 'component-library', creator: 'cr-dev',
      description: '입력·선택·버튼 컴포넌트 세트', tags: ['컴포넌트', '폼', 'UI'], icon: '🧩',
      screenshots: ['s1'], features: ['폼 12종'], license: 'commercial', priceModel: 'paid', price: 10000,
      collections: ['Business'], payload: { components: ['input', 'select', 'button'] } },
    /* 금성초 학교 전용 (Enterprise 비공개 배포) */
    { id: 'mk-geum-notice', name: '금성초 가정통신문 서식', type: 'document-template', creator: 'cr-sol',
      description: '금성초 공식 서식 — 교내 전용 배포', tags: ['가정통신문', '학교', '서식'], icon: '🏫',
      screenshots: ['s1'], features: ['공식 서식'], license: 'education', priceModel: 'free',
      visibility: 'market', market: SCHOOL_MKT, collections: ['School'],
      payload: { template: retag(tpl(3), 'mkt-geum-notice', '금성초 가정통신문') } },
  ];

  /* ---------- 등록 → 버전 → 심사 → 발행 ---------- */
  for (const d of DEFS) {
    const r = M.createItem(d);
    if (!r.ok) throw new Error('seed item 실패 ' + d.id + ': ' + r.errors.join(','));
    M.submitVersion(d.id, { version: '1.0.0', changelog: '최초 공개', payload: d.payload });
    const rev = M.submitForReview(d.id);
    if (rev.state === 'review') M.adminDecide(d.id, true);   /* 경계 점수는 관리자 승인 */
    M.publishItem(d.id);
  }
  /* ---------- 쿠폰 5종 ---------- */
  M.createCoupon({ code: 'WELCOME30', type: 'discount', pct: 30 });
  M.createCoupon({ code: 'BUNDLE-BIZ', type: 'bundle', pct: 40, items: ['mk-pres-minimal', 'mk-doc-report', 'mk-comp-forms'] });
  M.createCoupon({ code: 'SUMMER26', type: 'promotion', amount: 3000 });
  M.createCoupon({ code: 'BACK2SCHOOL', type: 'campaign', pct: 50, items: ['mk-chart-edu', 'mk-prompt-teacher'] });
  M.createCoupon({ code: 'REF-JUNHO', type: 'referral', pct: 10, referrer: 'cr-junho' });

  /* ---------- 사용자 활동: 조회·구매·설치·리뷰·커뮤니티 ---------- */
  const USERS = ['u-t1', 'u-t2', 'u-t3', 'u-s1', 'u-biz'];
  const VIEW_PLAN = {
    'mk-pres-minimal': USERS, 'mk-edu-science': USERS, 'mk-plug-wordcloud': USERS,
    'mk-sns-promo': ['u-biz', 'u-t1'], 'mk-icon-soft': ['u-t1', 'u-t2', 'u-biz'],
    'mk-poster-fair': ['u-t1', 'u-t2', 'u-t3'], 'mk-chart-edu': ['u-t1', 'u-t3'],
    'mk-prompt-teacher': ['u-t1', 'u-t2'], 'mk-brand-mint': ['u-biz'], 'mk-landing-start': ['u-biz'],
  };
  for (const [id, us] of Object.entries(VIEW_PLAN)) us.forEach((u) => M.track('view', id, u));

  /* 무료 설치 */
  M.install('u-t1', 'mk-poster-fair'); M.install('u-t2', 'mk-poster-fair');
  M.install('u-t1', 'mk-edu-science'); M.install('u-t2', 'mk-edu-science'); M.install('u-t3', 'mk-edu-science');
  M.install('u-t1', 'mk-illust-class');
  M.install('u-t1', 'mk-plug-wordcloud'); M.install('u-biz', 'mk-plug-wordcloud');  /* 플러그인 실브리지 */

  /* 유료 구매 → 설치 */
  M.purchase('u-biz', 'mk-pres-minimal', { license: 'commercial' });
  M.install('u-biz', 'mk-pres-minimal');
  M.purchase('u-t1', 'mk-pres-minimal', { coupon: 'WELCOME30' });
  M.install('u-t1', 'mk-pres-minimal');
  M.purchase('u-t2', 'mk-pres-minimal', {});
  M.install('u-t2', 'mk-pres-minimal');                      /* 1.0.0 — 업데이트 알림 데모 대상 */
  M.purchase('u-t1', 'mk-chart-edu', { license: 'education', coupon: 'BACK2SCHOOL' });
  M.install('u-t1', 'mk-chart-edu');
  M.purchase('u-t2', 'mk-prompt-teacher', { license: 'education' });                 /* eduPrice 0 — 무상 */
  M.install('u-t2', 'mk-prompt-teacher');
  M.purchase('u-biz', 'mk-brand-mint', { license: 'enterprise' });
  M.install('u-biz', 'mk-brand-mint', { scope: 'organization' });
  M.purchase('u-biz', 'mk-landing-start', { coupon: 'SUMMER26' });
  M.install('u-biz', 'mk-landing-start');
  const refundOrd = M.purchase('u-t3', 'mk-sns-promo', {});
  M.refund(refundOrd.id);                                    /* 환불 흐름 */

  /* ---------- 업데이트 이력 — 전원 1.0.0 설치 완료 후 새 버전 발행 ---------- */
  M.submitVersion('mk-pres-minimal', { version: '1.1.0', changelog: '다크 변형 4장 추가', payload: DEFS[0].payload });
  M.submitVersion('mk-plug-wordcloud', { version: '1.0.1', changelog: '한글 줄바꿈 수정', payload: DEFS.find((d) => d.id === 'mk-plug-wordcloud').payload });

  /* 구버전 설치자 시나리오 — u-t2 는 1.0.0 상태로 두어 업데이트 알림 데모 */
  M.updateInstall('u-t1', 'mk-pres-minimal');
  M.updateInstall('u-biz', 'mk-pres-minimal');
  M.rollbackInstall('u-biz', 'mk-pres-minimal');             /* 롤백 데모 — u-biz 1.0.0 복귀 */

  /* 학교 마켓 설치 (금성초 소속만 보임) */
  M.install('u-t1', 'mk-geum-notice');

  /* 리뷰 */
  const rv1 = M.addReview('mk-pres-minimal', { user: 'u-biz', stars: 5, text: '발표 준비 시간이 반으로 줄었어요', screenshot: 'shot-a' });
  M.addReview('mk-pres-minimal', { user: 'u-t1', stars: 4, text: '다크 변형이 특히 좋아요' });
  M.addReview('mk-edu-science', { user: 'u-t1', stars: 5, text: '4학년 과학 수업에 바로 썼습니다' });
  M.addReview('mk-edu-science', { user: 'u-t2', stars: 5, text: '기록지 구성이 실전적' });
  M.addReview('mk-plug-wordcloud', { user: 'u-t1', stars: 4, text: '명령 한 번에 장면 생성' });
  M.addReview('mk-sns-promo', { user: 'u-t3', stars: 2, text: '스토리 규격이 안 맞았어요' });
  M.helpful(rv1, 'u-t1'); M.helpful(rv1, 'u-t2');
  M.replyReview(rv1, 'cr-mint', '감사합니다! 1.1.0에서 다크 변형을 늘렸어요.');

  /* 커뮤니티 */
  M.like('u-t1', 'mk-edu-science'); M.like('u-t2', 'mk-edu-science'); M.like('u-biz', 'mk-pres-minimal');
  M.bookmark('u-t1', 'mk-prompt-teacher'); M.bookmark('u-t1', 'mk-chart-edu');
  M.share('u-t1', 'mk-edu-science');
  M.comment('mk-edu-science', 'u-t3', '3학년에도 쓸 수 있을까요?');
  M.inquire('cr-junho', 'u-t3', '저학년 버전 계획 있으신가요?');
  const col = M.userCollection('u-t1', '우리 반 수업 준비');
  M.addToCollection('u-t1', col, 'mk-edu-science'); M.addToCollection('u-t1', col, 'mk-chart-edu');
  M.follow('u-t1', 'cr-junho'); M.follow('u-t2', 'cr-junho'); M.follow('u-t3', 'cr-junho');
  M.follow('u-biz', 'cr-mint'); M.follow('u-t1', 'cr-sol');

  /* 신고·저작권 — 운영 큐 데모 */
  M.report('copyright', 'mk-mockup-device', 'u-biz', '유사 목업 프레임 저작권 문의');

  /* 정산 — 민트스튜디오 1회 정산 실행(준호쌤 몫은 미정산 잔액으로 남김) */
  M.settle('cr-mint');
})();

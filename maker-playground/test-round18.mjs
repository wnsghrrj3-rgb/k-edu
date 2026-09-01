/* Round 18 — Creator Marketplace & Ecosystem 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/market' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) __ld(f);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const X = window.MK_MARKET;
const P = window.MK_PLUGIN;
let pass = 0, fail = 0;
const T = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name); } };
const throws = (fn) => { try { fn(); return false; } catch { return true; } };
const sec = (n) => console.log('—', n);

/* ============ 1. 상수 ============ */
sec('상수');
T('Item 19종', X.ITEM_TYPES.length === 19);
T('라이선스 6종', X.LICENSES.length === 6);
T('큐레이션 11종', X.CURATED.length === 11);
T('쿠폰 5종', X.COUPON_TYPES.length === 5);
T('FSM 8상태', X.PUB_STATES.length === 8);
T('수수료 20%', X.FEE_RATE === 0.20);

/* ============ 2. Creator ============ */
sec('Creator');
T('시드 크리에이터 조회', X.creator('cr-junho').name === '준호쌤');
T('인증 뱃지', X.creator('cr-junho').verified === true);
T('중복 등록 거부', throws(() => X.registerCreator({ id: 'cr-junho', name: 'x' })));
T('필수 필드', throws(() => X.registerCreator({ id: 'cr-x' })));
T('팔로워 집계', X.creator('cr-junho').followers === 3);
T('없는 creator 팔로우 거부', throws(() => X.follow('u-t1', 'cr-none')));
const rank = X.creatorRanking();
T('랭킹 산출', rank.length === 6 && rank[0].score >= rank[1].score);

/* ============ 3. Item · Version ============ */
sec('Item·Version');
T('type 불명 거부', !X.createItem({ name: 'x', type: 'nope', creator: 'cr-dev', license: 'personal' }).ok);
T('creator 미등록 거부', !X.createItem({ name: 'x', type: 'poster', creator: 'cr-none', license: 'personal' }).ok);
T('license 필수', !X.createItem({ name: 'x', type: 'poster', creator: 'cr-dev' }).ok);
T('유료 price 필수', !X.createItem({ name: 'x', type: 'poster', creator: 'cr-dev', license: 'personal', priceModel: 'paid' }).ok);
T('시드 19타입 전부 발행', new Set([...X._items.values()].filter((i) => i.state === 'published').map((i) => i.type)).size === 19);
T('semver 형식 거부', !X.submitVersion('mk-pres-minimal', { version: '2.0' }).ok);
T('버전 후퇴 거부', !X.submitVersion('mk-pres-minimal', { version: '0.9.0' }).ok);
T('최신 버전', X.latestVersion('mk-pres-minimal').version === '1.1.0');

/* ============ 4. Publishing FSM ============ */
sec('Publishing FSM');
const ni = X.createItem({ id: 't-fsm', name: 'FSM 테스트', type: 'poster', creator: 'cr-dev', license: 'personal',
  description: '전이 검증용 아이템 — 설명 20자 이상 확보', tags: ['a', 'b', 'c'], screenshots: ['s'], features: ['f'] });
T('생성 draft', ni.ok && X._items.get('t-fsm').state === 'draft');
T('버전 없이 심사 불가', throws(() => X.transition('t-fsm', 'review')));
X.submitVersion('t-fsm', { version: '1.0.0', changelog: 'c', payload: {} });
T('draft→published 직행 불가', throws(() => X.transition('t-fsm', 'published')));
T('심사 결정은 관리자만', (() => { X.transition('t-fsm', 'review'); return throws(() => X.transition('t-fsm', 'approved', 'user')); })());
T('관리자 승인', X.adminDecide('t-fsm', true) === 'approved');
T('발행', X.publishItem('t-fsm') === 'published');
T('published→deprecated→복구', (() => { X.transition('t-fsm', 'deprecated'); X.transition('t-fsm', 'published'); return X._items.get('t-fsm').state === 'published'; })());

/* ============ 5. Moderation ============ */
sec('Moderation');
X.createItem({ id: 't-mal', name: '악성 플러그인', type: 'plugin', creator: 'cr-dev', license: 'personal',
  description: '보안 검사 자동 반려 확인용 설명입니다', tags: ['a', 'b', 'c'], screenshots: ['s'], features: ['f'] });
X.submitVersion('t-mal', { version: '1.0.0', payload: { source: 'eval(document.cookie)' } });
const malRes = X.submitForReview('t-mal');
T('악성 코드 자동 반려', !malRes.ok && malRes.state === 'rejected' && malRes.checks.security.length >= 2);
X.createItem({ id: 't-thin', name: '부실', type: 'poster', creator: 'cr-dev', license: 'personal', description: '짧음' });
X.submitVersion('t-thin', { version: '1.0.0', payload: {} });
const thinRes = X.submitForReview('t-thin');
T('부실 상품 경계 → 관리자 대기', thinRes.state === 'review' && thinRes.ai.score < 60);
T('AI 심사 지적 사항', thinRes.ai.notes.length >= 3);
T('관리자 반려', X.adminDecide('t-thin', false) === 'rejected');
const repId = X.report('item', 't-fsm', 'u-t2', '오해 소지 설명');
T('신고 접수', X._reports.some((r) => r.id === repId && r.status === 'open'));
X.resolveReport(repId, 'takedown');
T('takedown → deprecated', X._items.get('t-fsm').state === 'deprecated');
T('시드 저작권 신고 존재', X._reports.some((r) => r.kind === 'copyright'));

/* ============ 6. Store 목록 · Enterprise ============ */
sec('Store·Enterprise');
const pub = X.storeList({});
T('미소속: 교내 전용 안 보임', !pub.some((d) => d.id === 'mk-geum-notice'));
T('금성초: 교내 전용 보임', X.storeList({ org: 'geumseong' }).some((d) => d.id === 'mk-geum-notice'));
T('detail 조직 차단', X.detail('mk-geum-notice') === null && X.detail('mk-geum-notice', 'geumseong') !== null);
T('type 필터', X.storeList({ type: 'icon-pack' }).every((d) => d.type === 'icon-pack'));
T('무료 필터', X.storeList({ price: 'free' }).every((d) => d.priceModel === 'free'));
T('tag 필터', X.storeList({ tag: '수업' }).length >= 2);
const byDl = X.storeList({ sort: 'downloads' });
T('다운로드순 정렬', byDl[0].downloads >= byDl[byDl.length - 1].downloads);
const byPrice = X.storeList({ sort: 'price', price: 'paid' });
T('가격순 정렬(낮은 우선)', byPrice[0].price <= byPrice[byPrice.length - 1].price);
T('마켓 조회', X.marketsOf('geumseong').length === 1);
T('마켓 유형 검증', throws(() => X.createMarket({ org: 'x', type: 'club' })));

/* ============ 7. Search ============ */
sec('Search');
const s1 = X.search('수업 자료');
T('키워드 검색 적중', s1.length >= 2 && s1[0].score > 0);
T('AI 의도 가점 — 수업→education', s1.some((d) => d.type === 'education-template'));
const s2 = X.search('발표');
T('의도 — 발표→presentation 상위', s2[0].type === 'presentation-template');
T('무결과', X.search('zzz없는검색어').length === 0);
T('크리에이터명 검색', X.search('민트스튜디오').every((d) => d.creatorName === '민트스튜디오'));

/* ============ 8. Recommendation ============ */
sec('Recommendation');
const sim = X.similar('mk-edu-science');
T('유사 — 태그·타입 기반', sim.length >= 1 && sim[0].score > 0);
const co = X.coUsed('mk-edu-science');
T('함께 사용 — 설치 동시출현', co.length >= 1 && co[0].coCount >= 1);
T('크리에이터 추천 — 보유·팔로우 제외', X.creatorsFor('u-t1').every((c) => !['cr-junho', 'cr-sol'].includes(c.id)));

/* ============ 9. Collections ============ */
sec('Collections');
T("Editor's Choice 큐레이션", X.collection("Editor's Choice").length >= 2);
T('New — 업데이트순', X.collection('New').length === 6);
T('Trending — 최근 설치 기반', X.collection('Trending').length >= 1);
T('Education 컬렉션', X.collection('Education').every((d) => d.collections.includes('Education')));

/* ============ 10. 결제·쿠폰·환불 ============ */
sec('결제·쿠폰');
const presDetail = X._items.get('mk-pres-minimal');
T('교육 라이선스 50%', X.priceFor(presDetail, 'education') === 6000);
T('조직 라이선스 orgPrice', X.priceFor(presDetail, 'enterprise') === 39000);
T('eduPrice 0 명시 존중', X.priceFor(X._items.get('mk-prompt-teacher'), 'education') === 0);
const ordC = X.purchase('u-t2', 'mk-icon-soft', { coupon: 'WELCOME30' });
T('할인 쿠폰 30%', ordC.discount === 2100 && ordC.paid === 4900);
T('번들 쿠폰 대상 제한', throws(() => X.purchase('u-t2', 'mk-icon-soft', { coupon: 'BUNDLE-BIZ' })));
const ordB = X.purchase('u-t2', 'mk-doc-report', { coupon: 'BUNDLE-BIZ' });
T('번들 쿠폰 적용 40%', ordB.discount === 2400);
T('없는 쿠폰 거부', throws(() => X.purchase('u-t2', 'mk-mockup-device', { coupon: 'NOPE' })));
X.createCoupon({ code: 'ONE', type: 'promotion', pct: 10, maxUses: 1 });
X.purchase('u-t3', 'mk-mockup-device', { coupon: 'ONE' });
T('쿠폰 소진', throws(() => X.purchase('u-t3', 'mk-anim-pop', { coupon: 'ONE' })));
T('쿠폰 유형 검증', throws(() => X.createCoupon({ code: 'X', type: 'magic' })));
const ordR = X.purchase('u-t3', 'mk-anim-pop', {});
X.refund(ordR.id);
T('환불 상태', X._orders.get(ordR.id).refunded === true);
T('환불 원장 반전', X._ledger.find((l) => l.order === ordR.id).reversed === true);
T('이중 환불 거부', throws(() => X.refund(ordR.id)));

/* ============ 11. Revenue·정산 ============ */
sec('Revenue');
const led = X._ledger.find((l) => l.order === ordC.id);
T('수수료 20% 계산', led.fee === Math.round(4900 * 0.2));
T('세금 3.3% net 기준', led.tax === Math.round((4900 - led.fee) * 0.033));
T('net = gross-fee-tax', led.net === led.gross - led.fee - led.tax);
T('시드 정산 존재(민트)', X._settlements.some((s) => s.creator === 'cr-mint'));
const set2 = X.settle('cr-mint');                            /* ordC·ordB 추가분 재정산 */
T('재정산 — 미정산분만', set2.ok && set2.settlement.count === 1);   /* 테스트 중 발생분(ordB)만 */
T('인보이스 7줄', set2.invoice.length === 7 && set2.invoice[0].startsWith('INVOICE'));
T('정산 후 잔액 0', X.creatorDashboard('cr-mint').unsettled === 0);
T('대상 없으면 거부', X.settle('cr-mint').ok === false);

/* ============ 12. Install 브리지 ============ */
sec('Install 브리지');
T('유료 미구매 설치 거부', throws(() => X.install('u-t3', 'mk-comp-forms')));
T('플러그인 브리지 — MK_PLUGIN 실설치', P._reg.has('mkt-wordcloud') && P.stateOf('mkt-wordcloud') === 'running');
window.PG.loadEditorDoc();
const cmdR = P.execCommand('wordcloud.make');
T('브리지 플러그인 명령 실행 — 장면 생성', cmdR && cmdR.scene != null);
/* 브리지의 계약은 「레지스트리 등재」다 — get() 이 그걸 정확히 본다.
   list() 는 갤러리 목록이라 같은 그림의 클론을 접는다(이 시드의 payload 는
   샘플 템플릿 복사본이라 접힌다). 등재 여부를 list() 로 재면 그 둘이 섞인다. */
T('템플릿 브리지 — MK_TPL 등재', !!window.MK_TPL.get('mkt-pres-minimal'));
const instRec = X.installedOf('u-t1').find((i) => i.itemId === 'mk-chart-edu');
T('에셋 브리지 기록', instRec && instRec.bridge === 'assets');
T('브랜드 킷 레코드 설치', X.installedOf('u-biz').find((i) => i.itemId === 'mk-brand-mint').bridge === 'record');
T('조직 스코프', X.installedOf('u-biz').find((i) => i.itemId === 'mk-brand-mint').scope === 'organization');
T('scope 검증', throws(() => X.install('u-t1', 'mk-poster-fair', { scope: 'galaxy' })));

/* ============ 13. Update·Rollback ============ */
sec('Update');
const upd = X.checkUpdates('u-t2');
T('업데이트 감지 — u-t2 구버전', upd.some((u) => u.itemId === 'mk-pres-minimal' && u.from === '1.0.0' && u.to === '1.1.0'));
T('changelog 포함', upd.find((u) => u.itemId === 'mk-pres-minimal').changelogs[0].includes('다크'));
T('u-biz 롤백 상태 — 1.0.0', X.installedOf('u-biz').find((i) => i.itemId === 'mk-pres-minimal').version === '1.0.0');
const auto = X.autoUpdateAll('u-t2');
T('자동 업데이트 일괄', auto.every((a) => a.ok) && X.checkUpdates('u-t2').length === 0);
T('최신에서 업데이트 시도', X.updateInstall('u-t2', 'mk-pres-minimal').ok === false);
T('이전 버전 없으면 롤백 거부', throws(() => X.rollbackInstall('u-t1', 'mk-poster-fair')));
X.uninstall('u-t1', 'mk-illust-class');
T('제거 후 목록 반영', !X.installedOf('u-t1').some((i) => i.itemId === 'mk-illust-class'));

/* ============ 14. Review ============ */
sec('Review');
T('별점 범위', throws(() => X.addReview('mk-pres-minimal', { user: 'u', stars: 6 })));
T('평점 집계', X.itemRating('mk-edu-science') === 5);
T('스크린샷 리뷰', X.reviewsFor('mk-pres-minimal').some((r) => r.screenshot));
T('helpful 집계', X.reviewsFor('mk-pres-minimal').some((r) => r.helpful === 2));
T('크리에이터 답글', X.reviewsFor('mk-pres-minimal').some((r) => r.reply && r.reply.creator === 'cr-mint'));
const rvX = X.reviewsFor('mk-sns-promo')[0];
T('타인 상품 답글 거부', throws(() => X.replyReview(rvX.id, 'cr-junho', 'x')));
X.reportReview(rvX.id, 'u-biz', '허위');
T('리뷰 신고 플래그', X.reviewsFor('mk-sns-promo')[0].reported === true);

/* ============ 15. Community ============ */
sec('Community');
T('좋아요 집계', X.detail('mk-edu-science').likes === 2);
T('북마크 목록', X.bookmarksOf('u-t1').length === 2);
T('댓글', X.commentsFor('mk-edu-science').length === 1);
T('사용자 컬렉션', X.collectionsOf('u-t1')[0].items.length === 2);
T('없는 컬렉션 추가 거부', throws(() => X.addToCollection('u-t1', 'col-none', 'x')));
T('문의 접수', X.creatorDashboard('cr-junho').inquiries === 1);

/* ============ 16. Analytics·대시보드 ============ */
sec('Analytics');
const an = X.itemAnalytics('mk-edu-science');
T('조회 5', an.views === 5);
T('설치 3·잔존 100%', an.installs === 3 && an.retention === 100);
T('설치율 산출', an.installRate === 60);
const anR = X.itemAnalytics('mk-sns-promo');
T('환불 반영 — 전환 존재', anR.conversion > 0);
const db = X.creatorDashboard('cr-junho');
T('대시보드 — 업로드·발행', db.uploads === 4 && db.published === 4);
T('대시보드 — 환불 카운트(민트)', X.creatorDashboard('cr-wave').refunds === 1);
T('이벤트 종류 검증', throws(() => X.track('teleport', 'x', 'u')));

/* ============ 17. API 표면 ============ */
sec('API');
T('search API', X.api.search('아이콘').length >= 1);
T('analytics API', X.api.analytics('mk-edu-science').views === 5);
T('revenue API', X.api.revenue('cr-mint').ledger.length >= 3);

/* ============ 18. 화면 ============ */
sec('화면');
window.location.hash = '#/market';
window.PG.go('market');
const html5 = (tab) => { window.MK_SCREENS.market && 0; return document.body.innerHTML; };
T('탐색 렌더 — 카드·컬렉션', document.body.innerHTML.includes('mkt-featured') && document.body.innerHTML.includes('미니멀 발표 템플릿'));
T('내비에 Market', document.body.innerHTML.includes('🛒'));
/* 탭 전환 렌더 스모크 */
const scr = window.MK_SCREENS.market;
for (const t of ['detail', 'creator', 'dash', 'admin']) {
  try {
    /* st 는 폐쇄 — 화면 탭 버튼 경유 */
    const btn = [...document.querySelectorAll('[data-mkt^="tab:"]')].find((b) => b.dataset.mkt === 'tab:' + t);
    btn.click();
    T('탭 렌더: ' + t, document.body.innerHTML.length > 1000);
  } catch (e) { T('탭 렌더: ' + t, false); }
}
T('대시보드 KPI 노출', (() => {
  [...document.querySelectorAll('[data-mkt^="tab:"]')].find((b) => b.dataset.mkt === 'tab:dash').click();
  return document.body.innerHTML.includes('mkt-kpi');
})());
T('운영 탭 — 신고 표시', (() => {
  [...document.querySelectorAll('[data-mkt^="tab:"]')].find((b) => b.dataset.mkt === 'tab:admin').click();
  return document.body.innerHTML.includes('copyright');
})());

console.log(`\nRound18: ${pass}/${pass + fail} 통과${fail ? ' — 실패 ' + fail : ''}`);
process.exit(fail ? 1 : 0);

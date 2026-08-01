/* R51 — Composition 10종 실구현 검증 (+ 지시서 §22 시나리오 A~E) */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://k.local/' });
global.window = dom.window; global.document = dom.window.document;
const load = (p) => dom.window.eval(fs.readFileSync(p, 'utf8'));
load('data/animations.js'); load('data/render.js'); load('data/compose.js'); load('data/compositions.js');

let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const C = window.MK_COMPOSE, R = window.MK_RENDER;
const mk = (n, o = {}) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: o.kind || 'image', src: 'data:image/png;base64,' + i, w: o.w ?? 800, h: o.h ?? 600 }));
const roles = (r) => r.doc.scenes.map((s) => s.role);
const renderAll = (r) => r.doc.scenes.forEach((s) => { const svg = R.toSVG(R.renderScene(s, {})); if (!/^<svg/.test(svg)) throw new Error('render ' + s.id); });

T('10종 등재 — 서로 다른 영상 흐름 (복제품 아님)', () => {
  const list = C.listCompositions();
  A(list.length === 10, 'n=' + list.length);
  const sigs = new Set();
  for (const c of list) {
    const comp = C.getComposition(c.id);
    sigs.add(comp.scenes.map((s) => s.role + (s.repeatable ? '*' : '')).join('>'));
  }
  A(sigs.size === 10, '흐름 중복: ' + sigs.size);
});

T('전 Composition × 전 테마 감사 통과', () => {
  const a = C.audit();
  A(a.ok && a.compositions === 10, JSON.stringify(a.violations.slice(0, 4)));
});

T('시나리오 A — 여행 사진 12장 · Slideshow · 9:16', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(12), texts: { title: '제주 여행' }, ratio: '9:16' });
  A(r.ok && r.doc.scenes[0].width === 1080 && r.doc.scenes[0].height === 1920);
  const placed = r.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.src).length, 0);
  A(placed === 12, '배치=' + placed);
  A(roles(r).includes('title') && roles(r).includes('highlight') && roles(r).at(-1) === 'outro');
  A(r.total >= 10 && r.total <= 90, '총길이=' + r.total);
  renderAll(r);
});

T('시나리오 B — 전후 3쌍(6장) · Before&After · 비교 3묶음', () => {
  const r = C.buildProject('cx-beforeafter', 'th-bold', { medias: mk(6), texts: { title: '교실 변신', result: '이렇게 달라졌어요' } });
  const pairs = r.doc.scenes.filter((s) => s.role === 'comparison');
  A(pairs.length === 3, '쌍=' + pairs.length);
  pairs.forEach((s) => {
    const ms = s.elements.filter((e) => e.src);
    A(ms.length === 2, '2슬롯 아님');
    A(ms[0].w === ms[1].w && ms[0].h === ms[1].h, '전후 크기 불일치'); /* 지시서 §5-4 크기 일치 */
    A(s.elements.some((e) => e.text === '전') && s.elements.some((e) => e.text === '후'), '전·후 라벨');
  });
  /* 9:16 = 상하 비교 */
  const v = C.buildProject('cx-beforeafter', 'th-bold', { medias: mk(2), texts: {}, ratio: '9:16' });
  const pv = v.doc.scenes.find((s) => s.role === 'comparison').elements.filter((e) => e.src);
  A(pv[0].w === 90 && pv[1].y > pv[0].y, '상하 비교 아님');
  /* 홀수(5장) = 마지막 단독, 빈 프레임 0 */
  const odd = C.buildProject('cx-beforeafter', 'th-bold', { medias: mk(5), texts: {} });
  odd.doc.scenes.forEach((s) => s.elements.forEach((e) => A(e.kind !== 'image' || e.src || e.fill, '빈 프레임')));
});

T('시나리오 C — 제품 소개 · 사진 5장 + 특징 3 + CTA · Story', () => {
  const items = [{ head: '가볍다', body: '한 손에 잡히는 무게' }, { head: '오래 간다', body: '배터리 이틀' }, { head: '튼튼하다', body: '떨어뜨려도 멀쩡' }];
  const r = C.buildProject('cx-story', 'th-minimal', { medias: mk(5), texts: { title: '새 제품', cta: '지금 만나 보세요' }, items });
  A(roles(r)[0] === 'title' && roles(r).at(-1) === 'call-to-action');
  const its = r.doc.scenes.filter((s) => s.role === 'media-text');
  A(its.length === 5, '항목3+흡수2 아님: ' + its.length);
  items.forEach((it, i) => A(its[i].elements.some((e) => e.text === it.head), '항목 순서: ' + i));
  A(its.every((s) => s.elements.some((e) => e.src)), '항목 사진 자동 매핑');
  const placedC = r.doc.scenes.reduce((c2, s2) => c2 + s2.elements.filter((e) => e.src).length, 0);
  A(placedC === 5 && r.unusedMedia === 0, '잔여 흡수 실패: ' + placedC); /* 과다 1단계 — repeatable 추가로 흡수 */
  /* CTA 없으면 생략 */
  const noCta = C.buildProject('cx-story', 'th-minimal', { medias: mk(3), texts: { title: 'T' }, items });
  A(!roles(noCta).includes('call-to-action'), 'CTA 미생략');
});

T('시나리오 D — 카드뉴스 · 긴 텍스트 8개 · 자동 분할·이탈 0', () => {
  const long = '이것은 화면에 다 들어가지 않을 만큼 아주 길게 작성된 카드뉴스 본문 문장입니다 계속 이어집니다 더 길게 씁니다 '.repeat(3);
  const items = Array.from({ length: 8 }, (_, i) => ({ body: (i + 1) + '번 소식. ' + long }));
  const r = C.buildProject('cx-cardnews', 'th-bold', { medias: [], texts: { title: '학급 소식' }, items });
  const cards = r.doc.scenes.filter((s) => s.role === 'list-item');
  A(cards.length > 8, '분할 미발생: ' + cards.length); /* 지시서 §5-3 텍스트 길면 다음 카드 */
  cards.forEach((s) => s.elements.filter((e) => e.kind === 'text').forEach((e) => {
    A(e.size >= 1, '가독 불가 크기');
    A(String(e.text).trim().length > 0, '빈 텍스트');
  }));
  A(r.doc.scenes[0].width === 1080 && r.doc.scenes[0].height === 1350, '4:5 기본 아님');
  renderAll(r);
});

T('시나리오 E — 리뷰 · 사진 8장 + 장점 3 + 단점 + 평점', () => {
  const items = [{ head: '뷰가 좋다' }, { head: '친절하다' }, { head: '깨끗하다' }];
  const r = C.buildProject('cx-review', 'th-minimal', { medias: mk(8), texts: { title: '카페 후기', weakness: '주차가 조금 불편해요', rating: '4.5', recommend: '조용한 곳 좋아하면 추천' }, items });
  const rs = roles(r);
  A(rs.includes('section') && rs.includes('highlight'), '단점·평점 씬 누락: ' + rs);
  A(r.doc.scenes.some((s) => s.elements.some((e) => e.text === '4.5')), '평점 미표시');
  /* 단점 없으면 생략 */
  const noW = C.buildProject('cx-review', 'th-minimal', { medias: mk(4), texts: { title: 'T', rating: '5' }, items });
  A(!roles(noW).includes('section'), '단점 미생략');
});

T('Ranking — 역순 카운트다운·1위 하이라이트·미디어 0 = 타이포 중심', () => {
  const items = [{ head: '셋째' }, { head: '둘째' }, { head: '첫째' }];
  const r = C.buildProject('cx-ranking', 'th-bold', { medias: [], texts: { title: 'Top 3', top: '첫째' }, items });
  const nums = r.doc.scenes.filter((s) => s.role === 'list-item').map((s) => s.elements.find((e) => /^\d+$/.test(e.text)).text);
  A(nums.join() === '3,2,1', '카운트다운 아님: ' + nums);
  A(roles(r).includes('highlight'), '1위 하이라이트 누락');
});

T('Timeline — 순번 자동·마지막 = 결실 씬 (reserveTail)', () => {
  const r = C.buildProject('cx-timeline', 'th-minimal', { medias: mk(5), texts: { title: '텃밭 일지' } });
  const steps = r.doc.scenes.filter((s) => s.role === 'timeline-item');
  A(steps.length === 4 && roles(r).includes('highlight'), 'steps=' + steps.length);
  const nums = steps.map((s) => s.elements.find((e) => /^\d+$/.test(e.text)).text);
  A(nums.join() === '1,2,3,4', '순번: ' + nums);
});

T('Q&A — 문답 쌍 유지·긴 답변 씬 분리·인물 사진 배치', () => {
  const longA = '아주 길게 대답하는 문장입니다 정말로 길게 계속 이어서 말합니다 그래서 한 장면에 다 들어갈 수가 없습니다 더 말합니다 계속 말합니다 '.repeat(3);
  const items = [{ q: '왜 시작했나요?', a: longA }, { q: '앞으로는?', a: '계속합니다' }];
  const r = C.buildProject('cx-qa', 'th-minimal', { medias: mk(1), texts: { title: '인터뷰', quote: '계속하는 힘' }, items });
  const qs = r.doc.scenes.filter((s) => s.role === 'media-text');
  A(qs.length >= 3, '답변 분리 안 됨: ' + qs.length);
  A(qs[0].elements.some((e) => e.text === items[0].q), '질문 누락');
  A(r.doc.scenes[0].elements.some((e) => e.src), '인물 사진 미배치');
  A(roles(r).includes('quote'), '인용 씬 누락');
});

T('Problem→Solution — 분위기 전환·수치 강조·없는 단계 생략', () => {
  const r = C.buildProject('cx-problem', 'th-bold', { medias: mk(2), texts: { hook: '숙제 관리 힘들죠', problem: '알림장을 놓쳐요', solution: '자동 알림으로 해결', metric: '98%', metricDesc: '전달률', cta: '지금 시작' } });
  const pr = r.doc.scenes.find((s) => s.name === '문제'), so = r.doc.scenes.find((s) => s.name === '해결');
  A(pr.background !== so.background, '분위기 전환 없음'); /* 지시서 §5-8 */
  A(r.doc.scenes.some((s) => s.elements.some((e) => e.text === '98%')), '수치 강조 누락');
  const min = C.buildProject('cx-problem', 'th-bold', { medias: [], texts: { problem: 'P', solution: 'S' } });
  A(!roles(min).includes('call-to-action') && !min.doc.scenes.some((s) => s.name === '결과 수치'), '생략 실패');
});

T('Narrative — 적으면 3단 축소·많으면 전개 반복·전환점 강조', () => {
  const few = C.buildProject('cx-narrative', 'th-minimal', { medias: mk(2), texts: { title: '이야기' } });
  A(few.doc.scenes.length <= 4, '축소 실패: ' + few.doc.scenes.length);
  const many = C.buildProject('cx-narrative', 'th-minimal', { medias: mk(10), texts: { title: '이야기', turning: '반전', ending: '끝' } });
  A(many.doc.scenes.filter((s) => s.role === 'media').length >= 6, '전개 반복 부족');
  A(roles(many).includes('highlight') && roles(many).at(-1) === 'outro');
});

T('테마 교차 — 10 Composition × 2 Theme = 20조합 전부 빌드·실렌더', () => {
  for (const c of C.listCompositions()) {
    const comp = C.getComposition(c.id);
    for (const th of C.listThemes()) {
      const r = C.buildProject(c.id, th.id, { medias: mk(4), texts: { title: 'T' }, items: comp.sampleItems || null });
      A(r.ok, c.id + '×' + th.id + ':' + r.why);
      renderAll(r);
    }
  }
});

T('선택 화면 메타 — 10종 목적·권장 수·길이·카테고리', () => {
  const list = C.listCompositions();
  A(list.every((c) => c.purpose && c.category && c.recommendedMediaCount && c.recommendedDuration), JSON.stringify(list.find((c) => !c.purpose)));
  A(new Set(list.map((c) => c.category)).size >= 6, '카테고리 편중');
});

console.log(`\nR51: ${pass}/${pass + fail} ${fail ? 'FAIL' : 'ALL PASS'}`);
process.exit(fail ? 1 : 0);

/* ============================================================
   MK_INTAKE — R97 구조가 제 재료를 요구한다
   ------------------------------------------------------------
   준호 관찰: 구조 템플릿 15종이 「들어가 보면 다 똑같다」.
   해부 결과 정의부(compositions.js)의 문법은 실제로 다르다 —
   카드뉴스=번호 카드, Q&A=문답, 랭킹=역순 순위, 문제→해결=훅·지표.
   똑같아지는 지점은 입구였다: 만들기 패널이 15종 전부에게 같은
   먹이(사진+제목+부제)만 줘서, items를 먹는 구조가 전부 사진 폴백
   으로 떨어져 「제목 + 사진 N장 + 아웃트로」로 수렴한다.

   이 모듈 = 컴포지션별 재료 명세(SPEC) + 순수 파서(parseItems).
   엔진(compose.js)은 무수정 — items·texts를 이미 다 먹게 돼 있다.
   빈 입력 = 오늘과 동일 동작(가짜 샘플 주입 없음 — 정직 원칙).
   ============================================================ */
window.MK_INTAKE = (() => {
  'use strict';
  const MAX_ITEMS = 24;

  /* ---- 컴포지션별 재료 명세 ----
     items: {kind, label, ph(placeholder), hint} — 한 줄 = 한 항목
     texts: [{key, label, ph, max}] — buildProject input.texts로 합류
     note : 입력창 없이도 알아야 할 구조 규칙 한 줄 */
  const SPEC = {
    'cx-slideshow': {
      texts: [
        { key: 'highlight', label: '하이라이트 한 줄', ph: '가장 빛난 순간 (선택)', max: 16 },
        { key: 'outro', label: '마지막 인사', ph: '고마워요 (선택)', max: 10 },
      ] },
    'cx-story': {
      items: { kind: 'headbody', label: '소개 항목 — 한 줄 = 장면 하나', ph: '항목 이름: 설명\n예) 아침 산책: 조림이와 함께 시작해요', hint: '「이름: 설명」 꼴 — 콜론 없으면 이름만' },
      texts: [
        { key: 'summary', label: '정리 한 줄', ph: '(선택)', max: 18 },
        { key: 'cta', label: '마무리 문구', ph: '(선택)', max: 14 },
      ] },
    'cx-cardnews': {
      items: { kind: 'body', label: '카드 내용 — 한 줄 = 카드 한 장', ph: '첫 번째 소식\n두 번째 소식', hint: '쓴 줄 수만큼 번호 카드가 생겨요' },
      texts: [
        { key: 'emphasis', label: '강조 한 줄', ph: '(선택)', max: 12 },
        { key: 'cta', label: '마무리 문구', ph: '팔로우하고 소식 받아 보세요', max: 14 },
      ] },
    'cx-beforeafter': {
      note: '사진 고르는 순서가 곧 쌍 — 전·후·전·후 차례로 골라 주세요',
      texts: [{ key: 'result', label: '결과 한 줄', ph: '이렇게 달라졌어요 (선택)', max: 14 }] },
    'cx-ranking': {
      items: { kind: 'headbody', label: '순위 — 한 줄 = 한 순위, 아랫순위부터', ph: '3위 이름: 한 줄 설명\n2위 이름: 한 줄 설명\n1위 이름: 한 줄 설명', hint: '마지막 줄이 1위 — 번호는 자동으로 붙어요' },
      texts: [
        { key: 'top', label: '1위 발표 문구', ph: '(선택)', max: 10 },
        { key: 'cta', label: '마무리 질문', ph: '여러분의 1위는?', max: 12 },
      ] },
    'cx-timeline': {
      items: { kind: 'step', label: '단계 — 한 줄 = 한 걸음, 순서대로', ph: '씨앗을 심었어요\n싹이 났어요\n꽃이 피었어요', hint: '번호는 자동 — 사진도 순서대로 짝지어져요' },
      texts: [{ key: 'finale', label: '마지막 한 줄', ph: '그리고 지금 (선택)', max: 14 }] },
    'cx-qa': {
      items: { kind: 'qa', label: '문답 — 한 줄 = 질문? 답변', ph: '가장 기억에 남는 순간은? 운동회 날이요\n장래 희망은? 수의사요', hint: '물음표(?)가 질문과 답의 경계예요' },
      texts: [
        { key: 'guest', label: '인터뷰이', ph: '누구와의 인터뷰인가요 (선택)', max: 16 },
        { key: 'quote', label: '남는 한마디', ph: '(선택)', max: 14 },
      ] },
    'cx-problem': {
      texts: [
        { key: 'hook', label: '훅 — 첫 화면 질문', ph: '이런 적 있나요?', max: 12 },
        { key: 'problem', label: '문제', ph: '무엇이 불편한가요', max: 14 },
        { key: 'solution', label: '해결', ph: '이렇게 해결해요', max: 14 },
        { key: 'metric', label: '숫자 하나', ph: '예) 3배, 90%', max: 6 },
      ] },
    'cx-review': {
      items: { kind: 'headbody', label: '장점 — 한 줄 = 장면 하나', ph: '장점 이름: 한 줄 평', hint: '「이름: 한 줄 평」 꼴' },
      texts: [
        { key: 'weakness', label: '아쉬운 점', ph: '정직 리뷰의 한 줄 (선택)', max: 18 },
        { key: 'rating', label: '평점', ph: '예) 4.5/5', max: 5 },
      ] },
    'cx-narrative': {
      texts: [
        { key: 'turning', label: '전환 — 그때,', ph: '그때, 모든 것이 달라졌다', max: 16 },
        { key: 'ending', label: '결말 한 줄', ph: '이야기는 계속됩니다', max: 14 },
      ] },
  };

  /* ---- R118: spec 2단 해석 — 마지막 카드 5종(tb 프리셋 4 + tm-magazine)의 재료 입구 ----
     tb id 는 부팅마다 재생성(newId)이라 리터럴 키로는 못 고친다 — id 가 아니라
     comp 「구조」로 판정한다 (R83 정신: 선언이 아니라 구조에서 판정).
     · pairMode === true → beforeafter 위임. pairMode 계약이 곧 「전·후·전·후」
       순서 규칙이므로 note 가 구조적으로 참. result 는 ba-result 씬이 베이스
       클론에 실려 오므로 함께 참.
     · 그 외 → slideshow 후보 texts 를 씬의 실제 bind 슬롯 실존으로 필터.
       없는 슬롯의 입력 필드를 보여주면 그게 새 거짓말 — 실존 0 이면 spec
       없음이 정직한 상태 (tm-magazine: highlight 없음·outro 실존 → outro 만).
     · items 위임 없음 — items 문법(headbody/qa/step/body)은 컴포지션 고유라
       일반 위임이 거짓을 만든다. 표적 5장은 전부 items 비소비 가족. */
  function bindSetOf(comp) {
    const set = new Set();
    const scan = (slots) => { for (const t of slots || []) if (t && t.bind) set.add(t.bind); };
    for (const sc of (comp && comp.scenes) || []) {
      scan(sc.texts); scan(sc.textSlots);
      if (sc.layoutByRatio) for (const d of Object.values(sc.layoutByRatio)) scan(d && d.textSlots);
    }
    return set;
  }
  /* 순수 — comp 객체만 보고 판정 (audit·하니스가 합성 comp 로 직접 고정 가능) */
  function specForComp(comp) {
    if (!comp) return null;
    if (comp.pairMode === true) return SPEC['cx-beforeafter'];
    const binds = bindSetOf(comp);
    const texts = SPEC['cx-slideshow'].texts.filter((f) => binds.has(f.key));
    return texts.length ? { texts } : null;
  }
  const spec = (compId) => {
    if (SPEC[compId]) return SPEC[compId]; /* ① 직접 — 종전 10장 바이트 동일 (회귀 0) */
    const CO = window.MK_COMPOSE;          /* ② 위임 — MK_COMPOSE 부재 시 종전 동작 폴백 */
    if (!CO || typeof CO.getComposition !== 'function') return null;
    return specForComp(CO.getComposition(compId));
  };

  /* ---- 순수 파서: 줄글 → items[] ----
     빈 줄 무시 · 앞뒤 공백 정리 · 24항목 상한. 반각/전각 콜론 모두 인식. */
  function parseItems(kind, raw) {
    const lines = String(raw == null ? '' : raw).split(/\r?\n/)
      .map((l) => l.trim()).filter(Boolean).slice(0, MAX_ITEMS);
    return lines.map((line) => {
      if (kind === 'body') return { body: line };
      if (kind === 'step') return { step: line };
      if (kind === 'qa') {
        const q = line.indexOf('?'), qf = line.indexOf('？');
        const cut = q >= 0 && (qf < 0 || q < qf) ? q : qf;
        if (cut >= 0 && cut < line.length - 1)
          return { q: line.slice(0, cut + 1).trim(), a: line.slice(cut + 1).trim() };
        const sl = line.indexOf('/');
        if (sl > 0) return { q: line.slice(0, sl).trim(), a: line.slice(sl + 1).trim() };
        return { q: line };
      }
      /* headbody — 「이름: 설명」, 콜론 없으면 이름만 */
      const c = line.indexOf(':'), cf = line.indexOf('：');
      const cut = c >= 0 && (cf < 0 || c < cf) ? c : cf;
      if (cut > 0) return { head: line.slice(0, cut).trim(), body: line.slice(cut + 1).trim() };
      return { head: line };
    }).filter((it) => Object.values(it).some((v) => v));
  }

  /* 자가 검증 */
  const audit = () => {
    const v = [];
    const hb = parseItems('headbody', '이름: 설명\n콜론없음\n\n  ');
    if (hb.length !== 2 || hb[0].head !== '이름' || hb[0].body !== '설명' || hb[1].head !== '콜론없음' || hb[1].body != null) v.push('headbody 위반');
    const qa = parseItems('qa', '질문은? 답변이다\n경계없는줄');
    if (qa[0].q !== '질문은?' || qa[0].a !== '답변이다' || qa[1].q !== '경계없는줄' || qa[1].a != null) v.push('qa 위반');
    if (parseItems('body', 'a\nb')[1].body !== 'b') v.push('body 위반');
    if (parseItems('step', '한 걸음')[0].step !== '한 걸음') v.push('step 위반');
    if (parseItems('body', Array.from({ length: 40 }, (_, i) => 'x' + i).join('\n')).length !== MAX_ITEMS) v.push('상한 위반');
    if (!SPEC['cx-cardnews'] || !SPEC['cx-qa'].items || SPEC['cx-problem'].items) v.push('SPEC 골격 위반');
    /* R118 위임 — 합성 comp 로 구조 판정을 고정 (id 무관·순수) */
    if (specForComp({ pairMode: true, scenes: [] }) !== SPEC['cx-beforeafter']) v.push('pairMode 위임 위반');
    const sf = specForComp({ scenes: [{ texts: [{ bind: 'outro' }] }] });
    if (!sf || sf.texts.length !== 1 || sf.texts[0].key !== 'outro') v.push('bind 필터 위반');
    if (specForComp({ scenes: [{ texts: [{ bind: 'title' }] }] }) !== null) v.push('실존 0 정직 위반');
    if (spec('cx-slideshow') !== SPEC['cx-slideshow']) v.push('직접 spec 동일성 위반');
    return { ok: !v.length, violations: v };
  };

  return { SPEC, spec, specForComp, parseItems, MAX_ITEMS, audit };
})();

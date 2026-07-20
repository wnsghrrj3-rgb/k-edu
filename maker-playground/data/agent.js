/* ============================================================
   K-MAKER AI Agent Studio — window.MK_AGENT  (Round 22)
   ------------------------------------------------------------
   AI는 Canvas 밖에 존재하지 않는다 — Canvas(doc)를 이해하는 AI.
   챗봇이 아니라 이해→계획→디자인→수정→협업하는 디지털 팀원.

   ★ 핵심 설계
     - Orchestrator 단일 진입 request()/voice()/invoke() —
       의도 분류 → Agent 파이프라인 → Job 기록(설명·전후 스냅샷).
     - 모든 변경은 Job 을 통과한다. 기록 없는 변경 경로 없음(§15·§20).
     - 파괴적·대규모 변경은 Safety 게이트(확인·Preview·Rollback §21).
     - 결정론 규칙 엔진 — LLM 미연결. Agent.run(task) 계약이
       {action,args,explain} 이므로 판정부만 API 로 교체 가능.
   내부 클록 _now/_tick — 예약 작업·자동화는 실시간에 의존하지 않는다.
   ============================================================ */
window.MK_AGENT = (() => {
  'use strict';
  const SEC = () => window.MK_SEC, BR = () => window.MK_BRAND,
        AS = () => window.MK_ASSETS, PR = () => window.MK_PROJ;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const uid = (p) => p + '-' + (SEQ++).toString(36).padStart(4, '0');
  let SEQ = 100;

  /* ---------- 내부 클록 (정오 앵커 — 시각 의존 플레이크 방지) ---------- */
  let CLOCK = new Date('2026-07-21T12:00:00+09:00').getTime();
  const _now = () => CLOCK;
  const _tick = (ms) => { CLOCK += ms; _runDue(); return CLOCK; };
  const DAY = 86400000, HOUR = 3600000;

  /* ============================================================
     1) Workspace Memory (§3) — AI 가 아는 것들
     ============================================================ */
  const PREFS = {                       /* §22 Learning 이 갱신 */
    tone: 'friendly', palette: null, density: 'normal',
    accepted: {}, rejected: {},         /* action별 수용/거부 카운트 */
    styleHints: [],
  };
  const FAVS = [];                      /* 즐겨찾는 에셋/템플릿 id */
  const WORKLOG = [];                   /* 작업 기록(전 Job 요약) */

  function mem(projectId) {
    const p = PR() && projectId ? PR().get(projectId) : (PR() ? PR().current() : null);
    const b = BR() && BR().active ? BR().active() : null;
    return {
      project: p ? { id: p.projectId, name: p.name, scenes: (p.doc && p.doc.scenes || []).length } : null,
      brand: b ? { id: b.brandId, name: b.name, primary: b.color.primary } : null,
      templates: SEC() ? Object.keys(SEC().SECTIONS).length : 0,
      assets: AS() ? AS().ASSETS.length : 0,
      prefs: clone(PREFS), favorites: FAVS.slice(), worklog: WORKLOG.length,
    };
  }

  /* ============================================================
     2) Project Understanding (§4) — doc 자동 분석
     ============================================================ */
  function understand(doc) {
    if (!doc || !doc.scenes || !doc.scenes.length) return null;
    const els = doc.scenes.flatMap((s) => s.elements || []);
    const texts = els.filter((e) => e.kind === 'text');
    const words = texts.map((e) => String(e.text || '')).join(' ');
    const heads = texts.filter((e) => (e.weight || 400) >= 700);
    const purpose =
      /투자|성장|매출|시장/.test(words) ? '투자 유치' :
      /수업|학년|단원|실험/.test(words) ? '수업·교육' :
      /회사|소개|팀|연혁/.test(words) ? '회사 소개' :
      /제품|기능|출시/.test(words) ? '제품 소개' : '일반 발표';
    const audience = /학년|어린이|학생/.test(words) ? '학생' : /투자|주주/.test(words) ? '투자자' : '일반';
    const darkN = doc.scenes.filter((s) => BR() ? BR().isDark && false : false).length; /* isDark는 색용 — 배경 휘도로 판정 */
    const dark = doc.scenes.filter((s) => { const c = String(s.background || '#fff'); return BR() ? BR().lum(c) < 0.35 : /^#[0-3]/.test(c); }).length;
    const style = dark > doc.scenes.length / 2 ? '다크·시네마틱' : heads.length / Math.max(texts.length, 1) > 0.4 ? '헤드라인 중심' : '밝은 정보형';
    const brand = BR() && BR().active() ? BR().active().name : null;
    const layout = els.length / doc.scenes.length > 9 ? '고밀도' : els.length / doc.scenes.length > 5 ? '보통' : '여백 중심';
    const tone = audience === '학생' ? 'student' : audience === '투자자' ? 'investor' : PREFS.tone;
    return { purpose, audience, style, brand, layout, tone,
      stats: { scenes: doc.scenes.length, elements: els.length, texts: texts.length, heads: heads.length, darkScenes: dark } };
  }

  /* ============================================================
     3) Design Planning (§5) — 프롬프트 → 목차 → 페이지 → 레이아웃
     ============================================================ */
  const PLANS = {
    '회사 소개서': { pal: 'pl-ink', pages: [
      ['cover', '표지', { label: 'COMPANY', title: '{T}', subtitle: '함께 만드는 내일', meta: '2026' }],
      ['agenda', '목차', { title: '목차', items: ['회사 소개', '핵심 가치', '제품과 서비스', '팀', '연락처'] }],
      ['statement', '미션', { title: '좋은 도구가\n좋은 수업을 만든다', sub: '우리가 믿는 한 문장' }],
      ['feature-grid', '제품과 서비스', { title: '무엇을 만드나', items: [{ t: '만들기', d: '누구나 10분 안에 완성' }, { t: '나누기', d: '팀과 실시간 협업' }, { t: '배우기', d: '교실에 바로 배포' }] }],
      ['team', '팀', { title: '만드는 사람들', members: [{ n: '준호', r: '대표·교사' }, { n: '베프', r: '엔지니어링' }, { n: 'GPT', r: '아트디렉션' }] }],
      ['cta', '마무리', { title: '함께하고 싶다면', sub: '언제든 연락 주세요', button: '문의하기' }]] },
    '수업 자료': { pal: 'pl-forest', pages: [
      ['cover', '표지', { label: 'LESSON', title: '{T}', subtitle: '오늘의 배움', meta: '2026 · 1교시' }],
      ['agenda', '오늘의 흐름', { title: '오늘의 흐름', items: ['들어가기', '핵심 개념', '함께 활동', '정리'] }],
      ['two-column', '핵심 개념', { label: 'KEY POINT', title: '핵심 개념', body: '한 슬라이드에는 하나의 메시지만 담습니다.', bullets: ['관찰하기', '비교하기', '정리하기'] }],
      ['gallery', '함께 보기', { title: '자료 살펴보기', captions: ['관찰 1', '관찰 2', '관찰 3'] }],
      ['summary', '정리', { title: '오늘 배운 것', points: ['핵심 개념 한 줄', '활동에서 발견한 것', '다음 시간 예고'] }]] },
    '피치덱': { pal: 'pl-noir', pages: [
      ['cover', '표지', { label: 'PITCH', title: '{T}', subtitle: '문제를 바꾸는 방법', meta: '2026' }],
      ['statement', '문제', { title: '지금의 방식은\n느리고 비싸다', sub: '우리가 발견한 균열' }],
      ['chart', '시장', { title: '시장 규모', insight: '연 24% 성장 — 진입 적기', bars: [{ k: '24', v: 40 }, { k: '25', v: 62 }, { k: '26', v: 84 }] }],
      ['statistics', '지표', { title: '핵심 지표', items: [{ v: '3×', k: '성장' }, { v: '92%', k: '만족도' }, { v: '10일', k: '단축' }], note: '핵심 수치 세 개면 충분합니다.' }],
      ['timeline', '로드맵', { title: '앞으로의 계획', steps: [{ k: 'NOW', title: '기반', desc: '핵심 기능 완성' }, { k: 'Q3', title: '확장', desc: '사용자 확대' }, { k: 'Q4', title: '수익화', desc: '요금제 개시' }] }],
      ['cta', '요청', { title: '함께 성장할\n파트너를 찾습니다', sub: '다음 라운드에 함께해요', button: '미팅 잡기' }]] },
    '보고서': { pal: 'pl-cobalt', pages: [
      ['cover', '표지', { label: 'REPORT', title: '{T}', subtitle: '주간 보고', meta: '2026-07' }],
      ['statistics', '핵심 수치', { title: '이번 주 지표', items: [{ v: '12', k: '완료' }, { v: '3', k: '진행' }, { v: '1', k: '지연' }], note: '지연 1건은 다음 주 초 해소 예정.' }],
      ['chart', '추이', { title: '추이 분석', insight: '완료율 상승세 유지', bars: [{ k: '1주', v: 40 }, { k: '2주', v: 55 }, { k: '3주', v: 72 }] }],
      ['summary', '요약', { title: '요약과 다음 단계', points: ['이번 주 성과 요약', '리스크와 대응', '다음 주 계획'] }]] },
  };
  function planKind(prompt) {
    const p = String(prompt);
    if (/피치|투자|IR/i.test(p)) return '피치덱';
    if (/수업|단원|학습/.test(p)) return '수업 자료';
    if (/보고서|리포트|주간/.test(p)) return '보고서';
    if (/소개서|회사|브랜드 소개/.test(p)) return '회사 소개서';
    return null;
  }
  function plan(prompt) {
    const kind = planKind(prompt) || '회사 소개서';
    const def = PLANS[kind];
    const title = (String(prompt).match(/[「"']([^"」']+)["」']/) || [])[1] ||
                  String(prompt).replace(/(만들어\s*줘?|생성|해줘|을|를|좀)/g, '').trim().slice(0, 16) || kind;
    const pal = PREFS.palette || def.pal;
    return { kind, title, palette: pal,
      outline: def.pages.map((p, i) => ({ n: i + 1, sec: p[0], name: p[1] })),
      pages: def.pages.map((p) => ({ sec: p[0], name: p[1],
        props: JSON.parse(JSON.stringify(p[2]).replace('{T}', title)) })),
      layoutNote: '표지→흐름→본론→마무리 · 씬당 요소 8개 이하 · 좌측 정렬 리듬' };
  }
  function build(pl) {
    if (!SEC()) return null;
    const json = { palette: pl.palette,
      meta: { templateId: 'ag-' + Date.now().toString(36), title: pl.title,
        contentType: 'presentation', category: 'AI 생성', style: '모던', ratio: '16:9' },
      sections: pl.pages.map((pg) => ({ id: pg.sec, name: pg.name, props: pg.props })) };
    const doc = SEC().buildTemplate(json);
    doc.title = pl.title;
    return doc;
  }

  /* ============================================================
     4) Agent 구현부 — 각자 독립 동작(§2), 계약 run(task)→result
     ============================================================ */

  /* ---- Layout Agent (§6): 여백·정렬·비율·시선·강조 ---- */
  function layoutOptimize(doc) {
    const fixes = [];
    doc.scenes.forEach((s, si) => {
      const ts = (s.elements || []).filter((e) => e.kind === 'text');
      /* 좌여백 스냅 — 6% 그리드 이탈 텍스트 정렬 */
      ts.forEach((e) => { if (e.x > 4 && e.x < 12 && Math.abs(e.x - 8) > 0.9) { e.x = 8; fixes.push(`씬${si + 1} 텍스트 좌측 8% 스냅`); } });
      /* 강조 — 헤드가 없으면 최대 크기 텍스트 승격 */
      if (ts.length && !ts.some((e) => (e.weight || 400) >= 700)) {
        const big = ts.reduce((a, b) => (a.size >= b.size ? a : b));
        big.weight = 700; fixes.push(`씬${si + 1} 제목 강조(700)`);
      }
      /* 시선 흐름 — 제목이 본문보다 아래면 위로 */
      const head = ts.find((e) => (e.weight || 400) >= 700);
      if (head && ts.some((e) => e !== head && e.y < head.y - 2)) { head.y = Math.min(head.y, 14); fixes.push(`씬${si + 1} 제목 상단 이동`); }
    });
    return { fixes, msg: fixes.length ? `레이아웃 ${fixes.length}건 최적화` : '이미 정렬돼 있어요.' };
  }

  /* ---- Writing Agent (§7): 작성·요약·확장·톤·교정·번역 ---- */
  const TYPO = { 됬: '됐', 어떡해요: '어떻게요', 왠지모르게: '왠지 모르게', 몇일: '며칠', 금새: '금세', 오랫만: '오랜만' };
  const GLOSS = { 표지: 'Cover', 목차: 'Agenda', 소개: 'Introduction', 팀: 'Team', 시장: 'Market',
    문제: 'Problem', 해결: 'Solution', 정리: 'Summary', 로드맵: 'Roadmap', 가격: 'Pricing',
    회사: 'Company', 제품: 'Product', 수업: 'Lesson', 발표: 'Presentation', 감사합니다: 'Thank you' };
  const W = {
    write: (t) => `${t} — 핵심을 한 문장으로 먼저 말하고, 근거 두 가지로 받친다.`,
    summarize: (t) => String(t).split(/[.\n·]/)[0].trim().slice(0, 24),
    expand: (t) => String(t) + '\n구체적인 근거와 사례를 덧붙여 설명합니다.',
    tone: (t, tone) => tone === 'student' ? String(t).replace(/합니다|입니다/g, '해요') :
          tone === 'investor' ? String(t).replace(/해요|예요/g, '합니다') : String(t),
    proof: (t) => { let x = String(t), n = 0; for (const [a, b] of Object.entries(TYPO)) { if (x.includes(a)) { x = x.split(a).join(b); n++; } } return { text: x, fixed: n }; },
    translate: (t) => String(t).split(/(\s+)/).map((w) => GLOSS[w.trim()] ? w.replace(w.trim(), GLOSS[w.trim()]) : w).join(''),
  };

  /* ---- Brand Agent (§8): 컬러·폰트·로고·톤앤매너 유지 ---- */
  function brandEnforce(doc) {
    const b = BR() && BR().active(); if (!b) return { msg: '활성 브랜드가 없어요.', changes: 0 };
    let n = 0;
    const allow = [b.color.primary, b.color.secondary, b.color.accent].map((c) => c.toUpperCase());
    doc.scenes.forEach((s) => (s.elements || []).forEach((e) => {
      if (e.kind === 'text' && e.color && !allow.includes(String(e.color).toUpperCase())) { e.color = b.color.primary; n++; }
      if (e.font && e.font !== b.typography.heading.family) { e.font = b.typography.heading.family; n++; }
    }));
    /* 표지에 브랜드 워드마크 보장 */
    const cov = doc.scenes[0];
    if (cov && !(cov.elements || []).some((e) => e.brandLogo)) {
      cov.elements.push({ kind: 'text', x: 8, y: 92, w: 30, size: 2.2, text: b.name, weight: 700, color: b.color.primary, brandLogo: true }); n++;
    }
    return { msg: `브랜드 「${b.name}」 유지 — ${n}건 정렬`, changes: n, brand: b.name };
  }
  function brandCheck(doc) {
    const b = BR() && BR().active(); if (!b) return { ok: true, issues: [] };
    const issues = [];
    const allow = [b.color.primary, b.color.secondary, b.color.accent, '#FFFFFF', '#1F2733'].map((c) => c.toUpperCase());
    doc.scenes.forEach((s, si) => (s.elements || []).forEach((e) => {
      if (e.color && !allow.includes(String(e.color).toUpperCase())) issues.push({ scene: si + 1, kind: 'color', detail: e.color });
    }));
    return { ok: !issues.length, issues };
  }

  /* ---- Asset Agent (§9): 이미지·아이콘·일러스트·영상 추천 ---- */
  function assetRecommend(query, limit) {
    if (!AS()) return [];
    const q = String(query || '').toLowerCase().replace(/(추천|해줘|해 줘|넣어줘|바꿔줘|찾아줘|좀)/g, ' ').trim();
    const toks = q.split(/\s+/).filter(Boolean);
    if (!toks.length || toks.every((t) => ['이미지', '사진', '아이콘', '에셋'].includes(t))) {
      const cat = toks.includes('아이콘') ? 'icons' : 'images';
      const pool = AS().ASSETS.filter((a) => a.category === cat || a.type === 'photo' || a.type === 'icon');
      return pool.sort((a, b) => (FAVS.includes(b.id) ? 1 : 0) - (FAVS.includes(a.id) ? 1 : 0) || b.date - a.date).slice(0, limit || 4);
    }
    return AS().ASSETS.map((a) => {
      let sc = 0;
      toks.forEach((t) => { if (a.name.toLowerCase().includes(t)) sc += 3;
        if ((a.tags || []).some((g) => g.toLowerCase().includes(t))) sc += 2;
        if (a.category.includes(t) || a.type.includes(t)) sc += 1; });
      if (FAVS.includes(a.id)) sc += 1;   /* §22 즐겨찾기 학습 반영 */
      return { a, sc };
    }).filter((x) => x.sc > 0).sort((x, y) => y.sc - x.sc).slice(0, limit || 4).map((x) => x.a);
  }

  /* ---- Presentation Agent (§10): 스토리 흐름·순서 ---- */
  function storyFlow(doc) {
    const rank = (s) => /표지|cover/i.test(s.name) ? 0 : /목차|흐름|agenda/i.test(s.name) ? 1 :
      /정리|요약|summary|마무리|cta|감사/i.test(s.name) ? 9 : 5;
    const cur = doc.scenes.map((s) => s.name);
    const ideal = doc.scenes.slice().sort((a, b) => rank(a) - rank(b) || a.order - b.order);
    const moved = ideal.filter((s, i) => doc.scenes[i] !== s).length;
    return { moved, ideal: ideal.map((s) => s.name), cur,
      apply() { doc.scenes = ideal; doc.scenes.forEach((s, i) => { s.order = i; }); return moved; } };
  }

  /* ---- Animation Agent (§11): 자동 제안·속도·강조·전환 ---- */
  const ANIM_RULE = { textHead: ['fade-up', 420], text: ['fade-in', 320], image: ['zoom-in', 520], chart: ['grow', 600], table: ['fade-in', 360] };
  function animateSuggest(doc) {
    let n = 0;
    doc.scenes.forEach((s) => { if (!s.transition || s.transition === 'none') s.transition = 'fade';
      (s.elements || []).forEach((e, i) => {
        const key = e.kind === 'text' ? ((e.weight || 400) >= 700 ? 'textHead' : 'text') : (ANIM_RULE[e.kind] ? e.kind : 'text');
        const [name, dur] = ANIM_RULE[key];
        if (!e.anim) { e.anim = { name, dur, delay: Math.min(i * 90, 540) }; n++; }
      }); });
    return { msg: `애니메이션 ${n}개 요소에 자동 배정 — 제목 fade-up · 이미지 zoom-in · 순차 지연`, applied: n };
  }

  /* ---- Review Agent (§12): 가독성·정렬·색·접근성·일관성·오탈자 ---- */
  function review(doc) {
    const issues = [];
    doc.scenes.forEach((s, si) => {
      const els = s.elements || [];
      els.forEach((e) => {
        if (e.kind === 'text') {
          const txt = String(e.text || '');
          if (e.size < 1.6) issues.push({ scene: si + 1, cat: '접근성', level: 'warn', msg: `본문 ${e.size} — 최소 1.6 미만`, fix: 'size' });
          if (txt.replace(/\n/g, '').length > 90) issues.push({ scene: si + 1, cat: '가독성', level: 'warn', msg: `텍스트 ${txt.length}자 — 요약 권장`, fix: 'summarize' });
          for (const bad of Object.keys(TYPO)) if (txt.includes(bad)) issues.push({ scene: si + 1, cat: '오탈자', level: 'error', msg: `"${bad}" → "${TYPO[bad]}"`, fix: 'proof' });
          if (BR() && e.color) { const c = BR().contrast(e.color, s.background || '#FFFFFF');
            if (c < 3) issues.push({ scene: si + 1, cat: '색상', level: 'error', msg: `대비 ${c.toFixed(1)}:1 — 3:1 미만`, fix: 'contrast' }); }
        }
      });
      if (els.length > 12) issues.push({ scene: si + 1, cat: '정렬', level: 'warn', msg: `요소 ${els.length}개 — 분할 권장`, fix: 'split' });
    });
    const bc = brandCheck(doc);
    bc.issues.forEach((i) => issues.push({ scene: i.scene, cat: '브랜드', level: 'warn', msg: `브랜드 외 색 ${i.detail}`, fix: 'brand' }));
    const score = Math.max(0, 100 - issues.filter((i) => i.level === 'error').length * 12 - issues.filter((i) => i.level === 'warn').length * 4);
    return { score, issues };
  }

  /* ---- Collaboration Agent (§13): 변경 요약·충돌 해결 ---- */
  function diffDocs(a, b) {
    const out = { scenesAdded: 0, scenesRemoved: 0, elsAdded: 0, elsRemoved: 0, textEdits: 0, elEdits: 0 };
    const an = a.scenes.length, bn = b.scenes.length;
    out.scenesAdded = Math.max(0, bn - an); out.scenesRemoved = Math.max(0, an - bn);
    for (let i = 0; i < Math.min(an, bn); i++) {
      const ae = a.scenes[i].elements || [], be = b.scenes[i].elements || [];
      out.elsAdded += Math.max(0, be.length - ae.length);
      out.elsRemoved += Math.max(0, ae.length - be.length);
      for (let j = 0; j < Math.min(ae.length, be.length); j++) {
        if (ae[j].kind === 'text' && be[j].kind === 'text' && String(ae[j].text) !== String(be[j].text)) out.textEdits++;
        else if (JSON.stringify(ae[j]) !== JSON.stringify(be[j])) out.elEdits++;
      }
    }
    out.total = out.scenesAdded + out.scenesRemoved + out.elsAdded + out.elsRemoved + out.textEdits + out.elEdits;
    return out;
  }
  function summarizeEdits(before, after, who) {
    const d = diffDocs(before, after);
    const parts = [];
    if (d.scenesAdded) parts.push(`씬 ${d.scenesAdded}개 추가`); if (d.scenesRemoved) parts.push(`씬 ${d.scenesRemoved}개 삭제`);
    if (d.elsAdded) parts.push(`요소 ${d.elsAdded}개 추가`); if (d.elsRemoved) parts.push(`요소 ${d.elsRemoved}개 삭제`);
    if (d.textEdits) parts.push(`텍스트 ${d.textEdits}곳 수정`);
    return { who: who || '팀원', summary: parts.length ? parts.join(' · ') : '변경 없음', diff: d };
  }
  function resolveConflict(base, mine, theirs) {
    /* 필드 단위 3-way — 한쪽만 바뀐 필드는 채택, 양쪽 변경은 제안으로 */
    const merged = clone(base), proposals = [];
    const walkScene = (i) => {
      ['name', 'background', 'transition'].forEach((k) => {
        const b0 = base.scenes[i] && base.scenes[i][k], m0 = mine.scenes[i] && mine.scenes[i][k], t0 = theirs.scenes[i] && theirs.scenes[i][k];
        if (m0 !== b0 && t0 !== b0 && m0 !== t0) proposals.push({ scene: i + 1, field: k, mine: m0, theirs: t0, suggest: '최근 수정(theirs) 채택 후 검토' });
        else if (t0 !== b0) merged.scenes[i][k] = t0;
        else if (m0 !== b0) merged.scenes[i][k] = m0;
      });
    };
    for (let i = 0; i < base.scenes.length; i++) if (mine.scenes[i] && theirs.scenes[i]) walkScene(i);
    return { merged, proposals, clean: !proposals.length };
  }

  /* ---- Agent Registry (§2) ---- */
  const AGENTS = [
    { id: 'planner', name: 'Planner', icon: '🗺', desc: '목차·페이지 구성·계획' },
    { id: 'designer', name: 'Designer', icon: '🎨', desc: '레이아웃·여백·시선 흐름' },
    { id: 'writer', name: 'Writer', icon: '✍️', desc: '문장 작성·요약·톤·교정' },
    { id: 'translator', name: 'Translator', icon: '🌐', desc: '번역·다국어 버전' },
    { id: 'illustrator', name: 'Illustrator', icon: '🖼', desc: '이미지·아이콘·일러스트 추천' },
    { id: 'presenter', name: 'Presenter', icon: '🎤', desc: '스토리 흐름·슬라이드 순서' },
    { id: 'animator', name: 'Animator', icon: '🎞', desc: '애니메이션·전환 자동화' },
    { id: 'developer', name: 'Developer', icon: '🔧', desc: '요소 스키마·데이터 변환' },
    { id: 'reviewer', name: 'Reviewer', icon: '🔍', desc: '가독성·접근성·일관성 검사' },
    { id: 'publisher', name: 'Publisher', icon: '📤', desc: '내보내기·SNS 버전·보고서' },
  ];
  const agent = (id) => AGENTS.find((a) => a.id === id) || null;

  /* ============================================================
     5) Timeline (§15) + Job 기록 — undo/redo/restore/compare
     ============================================================ */
  const JOBS = [];                       /* {id, at, agent, intent, prompt, explain, before, after, status} */
  let CURSOR = -1;                       /* undo/redo 위치 */
  const jobs = () => JOBS.map(({ before, after, ...j }) => ({ ...j, hasSnap: !!before }));
  const job = (id) => JOBS.find((j) => j.id === id) || null;
  function record(doc, meta, mutate) {
    const before = clone(doc);
    const res = mutate(doc);
    const j = { id: uid('job'), at: _now(), status: 'done', ...meta,
      explain: meta.explain || (res && res.msg) || '', before, after: clone(doc), result: res };
    JOBS.splice(CURSOR + 1);            /* undo 지점 이후의 redo 꼬리 절단 */
    JOBS.push(j); CURSOR = JOBS.length - 1;
    WORKLOG.push({ at: j.at, agent: j.agent, intent: j.intent });
    return j;
  }
  const restoreTo = (doc, snap) => { doc.scenes = clone(snap.scenes); if (snap.title) doc.title = snap.title; };
  function undo(doc) { if (CURSOR < 0) return null; const j = JOBS[CURSOR]; restoreTo(doc, j.before); CURSOR--; return j.id; }
  function redo(doc) { if (CURSOR >= JOBS.length - 1) return null; CURSOR++; const j = JOBS[CURSOR]; restoreTo(doc, j.after); return j.id; }
  function restore(doc, jobId) { const j = job(jobId); if (!j) return false; restoreTo(doc, j.after); CURSOR = JOBS.indexOf(j); return true; }
  function compare(idA, idB) { const a = job(idA), b = job(idB); if (!a || !b) return null; return diffDocs(a.after, b.after); }
  function rollback(doc, jobId) { const j = job(jobId); if (!j) return false; restoreTo(doc, j.before); j.status = 'rolledback'; CURSOR = JOBS.indexOf(j) - 1; return true; }
  const explain = (jobId) => { const j = job(jobId); return j ? j.explain : null; };  /* §20 */

  /* ============================================================
     6) Safety (§21) — 확인·Preview·Rollback
     ============================================================ */
  const DESTRUCTIVE = /삭제|지워|전부|모두 (바꿔|교체)|초기화/;
  const isDestructive = (p) => DESTRUCTIVE.test(String(p));
  function preview(doc, prompt) {
    const ghost = clone(doc);
    const r = _execute(ghost, prompt, { dry: true });
    return { diff: diffDocs(doc, ghost), plan: r.plan || null, explain: r.explain, wouldChange: diffDocs(doc, ghost).total };
  }

  /* ============================================================
     7) Conversation Memory (§14) — 프로젝트별 대화·지시 대명사
     ============================================================ */
  const CONVOS = {};                     /* pid → {msgs:[], lastTarget, lastAction} */
  const convo = (pid) => (CONVOS[pid] = CONVOS[pid] || { msgs: [], lastTarget: null, lastAction: null });
  function say(pid, role, text, meta) { const c = convo(pid); c.msgs.push({ at: _now(), role, text, ...(meta || {}) }); return c.msgs.length; }
  function resolveRef(pid, prompt) {
    const c = convo(pid);
    if (/^(그거|그것|아까 그|방금)/.test(String(prompt).trim()) && c.lastTarget)
      return String(prompt).replace(/^(그거|그것|아까 그|방금)\s*/, c.lastTarget + ' ');
    return prompt;
  }

  /* ============================================================
     8) Orchestrator (§1) — 의도 분류 → Agent 파이프라인
     ============================================================ */
  const INTENTS = [
    { re: /SNS|정사각|썸네일/, intent: 'sns', agent: 'publisher' },
    { re: /브랜드/, intent: 'brand', agent: 'designer' },
    { re: /요약/, intent: 'summarize', agent: 'writer' },
    { re: /번역|영어로/, intent: 'translate', agent: 'translator' },
    { re: /오탈자|교정|맞춤법/, intent: 'proof', agent: 'writer' },
    { re: /톤|말투/, intent: 'tone', agent: 'writer' },
    { re: /이미지|사진|아이콘|에셋/, intent: 'asset', agent: 'illustrator' },
    { re: /순서|흐름|스토리/, intent: 'flow', agent: 'presenter' },
    { re: /애니메이션|전환|움직/, intent: 'animate', agent: 'animator' },
    { re: /검사|리뷰|점검|접근성/, intent: 'review', agent: 'reviewer' },
    { re: /레이아웃|정렬|여백|배치/, intent: 'layout', agent: 'designer' },
    { re: /(만들어|생성|짜)\s*줘?|소개서|피치|보고서/, intent: 'create', agent: 'planner' },
  ];
  const classify = (p) => { for (const it of INTENTS) if (it.re.test(String(p))) return it; return { intent: 'unknown', agent: 'planner' }; };

  function _execute(doc, prompt, opts) {
    const it = classify(prompt);
    const o = opts || {};
    if (it.intent === 'create') {
      const pl = plan(prompt);
      if (o.dry) return { intent: it.intent, plan: pl, explain: `${pl.kind} ${pl.pages.length}장 구성 예정` };
      const built = build(pl);
      doc.scenes = built.scenes; doc.title = built.title;
      brandEnforce(doc);
      return { intent: it.intent, plan: pl, msg: `${pl.kind} 「${pl.title}」 ${pl.pages.length}장 생성 — ${pl.layoutNote}`,
        explain: `의도=${pl.kind} 판정 → 목차 ${pl.outline.length}항목 → ${pl.palette} 팔레트로 조립 → 브랜드 정렬` };
    }
    if (it.intent === 'layout') { const r = layoutOptimize(doc); return { intent: it.intent, ...r, explain: '8% 그리드 스냅·제목 강조·시선 상→하 확보' }; }
    if (it.intent === 'summarize') {
      let n = 0; doc.scenes.forEach((s) => (s.elements || []).forEach((e) => { if (e.kind === 'text' && String(e.text || '').length > 60) { e.text = W.summarize(e.text); n++; } }));
      return { intent: it.intent, msg: `긴 문장 ${n}곳 요약`, explain: '60자 초과 본문을 첫 문장 핵심으로 축약' };
    }
    if (it.intent === 'translate') {
      let n = 0; doc.scenes.forEach((s) => (s.elements || []).forEach((e) => { if (e.kind === 'text') { const t = W.translate(e.text); if (t !== e.text) { e.text = t; n++; } } }));
      return { intent: it.intent, msg: `용어 사전 기반 ${n}곳 번역`, explain: '핵심 용어 사전 매칭 — 전체 번역은 API 연결 시' };
    }
    if (it.intent === 'proof') {
      let n = 0; doc.scenes.forEach((s) => (s.elements || []).forEach((e) => { if (e.kind === 'text') { const r = W.proof(e.text); if (r.fixed) { e.text = r.text; n += r.fixed; } } }));
      return { intent: it.intent, msg: `오탈자 ${n}건 교정`, explain: '맞춤법 사전 매칭 교정' };
    }
    if (it.intent === 'tone') {
      const tone = /학생|친근/.test(prompt) ? 'student' : /격식|투자/.test(prompt) ? 'investor' : PREFS.tone;
      let n = 0; doc.scenes.forEach((s) => (s.elements || []).forEach((e) => { if (e.kind === 'text') { const t = W.tone(e.text, tone); if (t !== e.text) { e.text = t; n++; } } }));
      return { intent: it.intent, msg: `톤 「${tone}」 ${n}곳 적용`, explain: `어미 규칙으로 ${tone} 톤 변환` };
    }
    if (it.intent === 'asset') { const rec = assetRecommend(prompt); return { intent: it.intent, rec, msg: `에셋 ${rec.length}건 추천`, explain: '이름·태그·카테고리 가중 검색 + 즐겨찾기 가산' }; }
    if (it.intent === 'flow') { const f = storyFlow(doc); const m = f.apply(); return { intent: it.intent, msg: m ? `씬 ${m}개 순서 조정 — 표지→흐름→본론→마무리` : '흐름이 이미 좋아요.', explain: '스토리 랭크(표지0·목차1·본론5·마무리9) 정렬' }; }
    if (it.intent === 'animate') { const r = animateSuggest(doc); return { intent: it.intent, ...r, explain: '요소 종류별 규칙 배정 + 90ms 순차 지연' }; }
    if (it.intent === 'review') { const r = review(doc); return { intent: it.intent, ...r, msg: `검사 점수 ${r.score} — 이슈 ${r.issues.length}건`, explain: '가독성·접근성·색 대비·브랜드·오탈자 6종 검사' }; }
    if (it.intent === 'brand') { const r = brandEnforce(doc); return { intent: it.intent, ...r, explain: '허용 색 외 재배정·폰트 통일·표지 워드마크 보장' }; }
    if (it.intent === 'sns') {
      const src = doc.scenes[0]; const sq = clone(src); sq.id = 'sns-' + Date.now().toString(36); sq.name = (src.name || '표지') + ' · SNS 정사각'; sq.width = 1080; sq.height = 1080; sq.order = doc.scenes.length;
      doc.scenes.push(sq);
      return { intent: it.intent, msg: 'SNS 정사각(1080²) 버전 1장 생성', explain: '표지를 1:1 캔버스로 파생' };
    }
    return { intent: 'unknown', msg: '아직 못 알아듣는 요청이에요 — "회사 소개서 만들어줘" · "레이아웃 정리해줘" · "검사해줘" 처럼 말해 보세요.', explain: '의도 분류 실패' };
  }

  function request(doc, prompt, opts) {
    const o = opts || {}; const pid = o.projectId || 'pg';
    const p2 = resolveRef(pid, prompt);
    say(pid, 'user', prompt);
    const it = classify(p2);
    if (isDestructive(p2) && !o.confirm)
      return { ok: false, needsConfirm: true, msg: '파괴적 변경이에요 — confirm: true 로 다시 요청하면 실행할게요. Preview 로 먼저 볼 수도 있어요.' };
    const pv = diffPreviewSize(doc, p2);
    if (pv > 20 && !o.confirm && !o.previewShown)
      return { ok: false, needsPreview: true, wouldChange: pv, msg: `대규모 변경(${pv}곳) — preview() 확인 후 previewShown: true 로 실행해 주세요.` };
    const j = record(doc, { agent: it.agent, intent: it.intent, prompt: p2, voice: !!o.voice }, (d) => _execute(d, p2, {}));
    const c = convo(pid); c.lastAction = it.intent;
    if (it.intent === 'create' && j.result.plan) c.lastTarget = j.result.plan.title;
    say(pid, 'ai', j.result.msg || j.explain, { jobId: j.id });
    return { ok: j.result.intent !== 'unknown', jobId: j.id, ...j.result };
  }
  const diffPreviewSize = (doc, prompt) => { try { return preview(doc, prompt).wouldChange; } catch (e) { return 0; } };
  const voice = (doc, text, opts) => request(doc, text, { ...(opts || {}), voice: true });   /* §19 */
  const invoke = (agentId, doc, prompt, opts) => {                                          /* §24 Plugin API */
    if (!agent(agentId)) return { ok: false, msg: '없는 Agent: ' + agentId };
    return request(doc, prompt, { ...(opts || {}), via: 'api:' + agentId });
  };

  /* ============================================================
     9) Suggestions (§16) — 실시간 추천
     ============================================================ */
  function suggestions(doc) {
    if (!doc || !doc.scenes) return [];
    const out = [];
    const cov = doc.scenes[0];
    const head = cov && (cov.elements || []).find((e) => e.kind === 'text' && (e.weight || 400) >= 700);
    if (head && String(head.text || '').length > 18) out.push({ msg: '제목이 너무 깁니다.', fix: '제목 요약해줘' });
    const r = review(doc);
    r.issues.slice(0, 3).forEach((i) => out.push({ msg: `씬${i.scene} ${i.cat}: ${i.msg}`, fix: '검사해줘' }));
    const bc = brandCheck(doc);
    if (!bc.ok) out.push({ msg: '브랜드 컬러와 맞지 않습니다.', fix: '브랜드 정렬해줘' });
    if (doc.scenes.some((s) => (s.elements || []).some((e) => e.kind === 'image' && !e.label && !e.fill)))
      out.push({ msg: '이미지를 바꾸면 더 좋아집니다.', fix: '이미지 추천해줘' });
    return out.slice(0, 5);
  }

  /* ============================================================
     10) Tasks (§17) + Automation (§23) — 예약·백그라운드·자동화
     ============================================================ */
  const TASKS = [];                      /* {id, title, prompt, at?, everyMs?, lastRun, runs, status} */
  function taskCreate(o) {
    const t = { id: uid('task'), title: o.title || o.prompt, prompt: o.prompt,
      at: o.at || null, everyMs: o.everyMs || null, created: _now(), lastRun: null, runs: 0,
      status: (o.at || o.everyMs) ? 'scheduled' : 'queued', log: [] };
    TASKS.push(t); return t;
  }
  const tasks = () => TASKS.slice();
  let BOUND = null;                      /* 자동화가 작업할 doc 바인딩 */
  const bind = (doc) => { BOUND = doc; };
  function _runTask(t) {
    t.runs++; t.lastRun = _now();
    if (!BOUND) { t.log.push({ at: _now(), ok: false, msg: 'doc 미바인딩' }); return; }
    const r = request(BOUND, t.prompt, { confirm: true, previewShown: true });
    t.log.push({ at: _now(), ok: r.ok, msg: r.msg });
    if (!t.everyMs) t.status = 'done';
  }
  function _runDue() {
    TASKS.forEach((t) => {
      if (t.status === 'done') return;
      if (t.status === 'queued') { _runTask(t); return; }
      if (t.at && _now() >= t.at && !t.runs) { _runTask(t); return; }
      if (t.everyMs && (!t.lastRun || _now() - t.lastRun >= t.everyMs)) { if (t.lastRun || _now() - t.created >= t.everyMs) _runTask(t); }
    });
  }
  const AUTOMATIONS = [
    { id: 'auto-report', name: '매주 보고서 생성', prompt: '보고서 만들어줘', everyMs: 7 * DAY },
    { id: 'auto-brand', name: '브랜드 검사', prompt: '브랜드 검사해줘', everyMs: DAY },
    { id: 'auto-i18n', name: '번역 버전 갱신', prompt: '영어로 번역해줘', everyMs: 7 * DAY },
    { id: 'auto-sns', name: 'SNS 버전 생성', prompt: 'SNS 버전 만들어줘', everyMs: 7 * DAY },
  ];
  function automationEnable(id) {
    const a = AUTOMATIONS.find((x) => x.id === id); if (!a) return null;
    if (TASKS.some((t) => t.autoId === id && t.status !== 'done')) return null;
    const t = taskCreate({ title: a.name, prompt: a.prompt, everyMs: a.everyMs });
    t.autoId = id; return t;
  }

  /* ============================================================
     11) Command Palette (§18) — Ctrl+K
     ============================================================ */
  const COMMANDS = [
    { id: 'cmd-create', label: '회사 소개서 만들기', prompt: '회사 소개서 만들어줘', k: ['소개서', 'create'] },
    { id: 'cmd-pitch', label: '피치덱 만들기', prompt: '피치덱 만들어줘', k: ['피치', 'pitch'] },
    { id: 'cmd-lesson', label: '수업 자료 만들기', prompt: '수업 자료 만들어줘', k: ['수업'] },
    { id: 'cmd-layout', label: '레이아웃 정리', prompt: '레이아웃 정리해줘', k: ['정렬', 'layout'] },
    { id: 'cmd-review', label: '전체 검사', prompt: '검사해줘', k: ['리뷰', 'check'] },
    { id: 'cmd-brand', label: '브랜드 정렬', prompt: '브랜드 정렬해줘', k: ['brand'] },
    { id: 'cmd-anim', label: '애니메이션 자동 배정', prompt: '애니메이션 넣어줘', k: ['motion'] },
    { id: 'cmd-flow', label: '스토리 순서 정리', prompt: '순서 정리해줘', k: ['flow'] },
    { id: 'cmd-proof', label: '오탈자 교정', prompt: '오탈자 교정해줘', k: ['맞춤법'] },
    { id: 'cmd-sns', label: 'SNS 버전 생성', prompt: 'SNS 버전 만들어줘', k: ['정사각'] },
    { id: 'cmd-undo', label: '되돌리기', prompt: '@undo', k: ['undo'] },
    { id: 'cmd-redo', label: '다시 실행', prompt: '@redo', k: ['redo'] },
  ];
  function palette(q) {
    const s = String(q || '').toLowerCase().trim();
    if (!s) return COMMANDS.slice();
    return COMMANDS.filter((c) => c.label.toLowerCase().includes(s) || c.k.some((k) => k.toLowerCase().includes(s)) || c.prompt.includes(s));
  }

  /* ============================================================
     12) Learning (§22) — 선호·스타일 학습
     ============================================================ */
  function feedback(jobId, up) {
    const j = job(jobId); if (!j) return null;
    const bag = up ? PREFS.accepted : PREFS.rejected;
    bag[j.intent] = (bag[j.intent] || 0) + 1;
    if (j.intent === 'create' && j.result && j.result.plan) {
      if (up) PREFS.palette = j.result.plan.palette;               /* 수용한 팔레트를 기본으로 */
      else if (PREFS.palette === j.result.plan.palette) PREFS.palette = null;
    }
    if (j.intent === 'tone' && up) PREFS.tone = /student/.test(j.explain) ? 'student' : /investor/.test(j.explain) ? 'investor' : PREFS.tone;
    return clone(PREFS);
  }
  const favAsset = (id) => { if (!FAVS.includes(id)) FAVS.push(id); return FAVS.length; };
  const prefs = () => clone(PREFS);

  /* ============================================================
     13) Inspector (§25) — 현재 AI 상태
     ============================================================ */
  function state() {
    return {
      running: TASKS.filter((t) => t.status === 'queued').length,
      scheduled: TASKS.filter((t) => t.status === 'scheduled').length,
      jobs: JOBS.length, cursor: CURSOR,
      lastJob: JOBS.length ? { id: JOBS[JOBS.length - 1].id, intent: JOBS[JOBS.length - 1].intent, agent: JOBS[JOBS.length - 1].agent } : null,
      prefs: clone(PREFS), agents: AGENTS.length, memory: mem(),
    };
  }

  /* ---------- 공개 표면 ---------- */
  return {
    /* 클록 */ _now, _tick, DAY, HOUR,
    /* 메모리·이해 */ mem, understand, prefs, favAsset,
    /* 계획·생성 */ planKind, plan, build, PLANS,
    /* Agent */ AGENTS, agent, invoke,
    /* 개별 능력(테스트·화면 직결) */ layoutOptimize, W, brandEnforce, brandCheck,
    assetRecommend, storyFlow, animateSuggest, review, summarizeEdits, resolveConflict, diffDocs,
    /* 오케스트레이터 */ classify, request, voice, preview, isDestructive,
    /* 대화 */ say, convo, resolveRef,
    /* 타임라인 */ jobs, job, undo, redo, restore, compare, rollback, explain,
    /* 제안·팔레트 */ suggestions, palette, COMMANDS,
    /* 작업·자동화 */ taskCreate, tasks, bind, AUTOMATIONS, automationEnable, _runDue,
    /* 학습·상태 */ feedback, state,
  };
})();

/* ============================================================================
   stage2-project.js — 케이티처 정본 → 자기주도 학생용 투영 (47차, 2026-09-30)
   방향 결정(2026-09-28): 케이티처 차시가 정본, 자기주도는 교사 층을 뺀 **학생용 투영** ·
   「우선 만들고 나서 바꿔치기」 · 활동은 1인도 되게.
   · 데이터는 한 글자도 안 고친다 — 읽어서 새 사본을 만든다(정본과 투영이 따로 놀 수 없게).
   · 빼는 것(교사 층): 발문 띠 tnote · 교사에게 하는 말 hint(오개념 장) · 👉 쪽지 · 자료 extras·suggested_extras ·
     출구 신호등 self(손 든 수 세기) · 교실 활동의 짝·모둠 흐름(→ 🙋 혼자라면 흐름으로 바꿈) · 타이머 분
   · 바꾸는 것(학생이 스스로 푸는 자리): 기본 문제 → learn { kind: pick(하나 고르기) · multi(모두 고르기) ·
     num(수 넣기) · self(생각하고 정답 보기) } · 생각을 넓혀요 → self · 「풀이」 쪽지는 푼 뒤에만
   · 점수(자기주도와 같은 100점): pick·multi·num 이 채점 문항 — 한 번에 맞히면 만점, 두 번째면 절반, 정답 보기면 0.
   진입: KT2_PROJECT.project(lesson) → { meta, slides[] }  (node 에서도 돈다 — 게이트가 같은 함수를 쓴다)
   ============================================================================ */
(function (global) {
  'use strict';
  const SOLO_FALLBACK = '🙋 혼자라면: 공책에 써 보거나 소리 내어 말해 봐요.';
  const PAIRISH = /짝|모둠|친구와|친구에게|다 함께|발표/;
  const GROUPISH = /짝|모둠|친구|다 함께|우리 반|서로|돌아가며|발표/;
  const clone = (o) => JSON.parse(JSON.stringify(o == null ? null : o));
  const isStr = (x) => typeof x === 'string';

  function stripTeacher(d) {
    delete d.tnote;
    if (isStr(d.note) && /^\s*👉/.test(d.note)) delete d.note;
    return d;
  }

  function projectSlide(s0) {
    const s = { id: s0.id, stage: s0.stage, block: s0.block, data: stripTeacher(clone(s0.data || {})) };
    const d = s.data;
    switch (s.block) {
      case 'misconception': delete d.hint; break; // 「~하게 하세요」 — 교사에게 하는 말
      case 'exit_ticket': delete d.self; break;   // 손 든 수 세는 신호등 — 혼자서는 뜻이 없다(스스로 평가 장이 뒤에 있다)
      case 'offline_activity': {
        if (!Array.isArray(d.solo) || !d.solo.length) return null; // 1인 흐름이 없는 교실 활동은 투영에서 건너뛴다
        // 목표·준비물은 짝·모둠 판 글이라(「모둠에서 … 의견 모으기」·약속판 종이) 혼자 흐름과 어긋나면 뺀다 — 혼자 흐름 줄이 곧 할 일
        s.data = { title: d.title, type: 'individual', icon: '🙋', tag: '🙋 혼자 해요', goal: isStr(d.goal) && !GROUPISH.test(d.goal) ? d.goal : undefined, steps: d.solo.slice() };
        break;
      }
      case 'leveled_problem': {
        Object.values(d.levels || {}).forEach(lv => { if (lv && isStr(lv.q) && PAIRISH.test(lv.q)) lv.q += '\n' + SOLO_FALLBACK; });
        break;
      }
      case 'basic_problem': {
        const learn = { note: d.note };
        if (Array.isArray(d.options) && d.options.length) { learn.kind = d.multi ? 'multi' : 'pick'; learn.options = d.options; }
        else if (d.answer !== undefined && d.input !== undefined) { learn.kind = 'num'; learn.answer = d.answer; }
        else if (d.answer !== undefined) { learn.kind = 'self'; learn.answer = d.answer; }
        if (learn.kind) { ['options', 'multi', 'answer', 'input', 'note'].forEach(k => delete d[k]); s.learn = learn; }
        if (isStr(d.question) && PAIRISH.test(d.question)) s.solo = SOLO_FALLBACK;
        break;
      }
      case 'advanced_problem': {
        if (d.note) { s.learn = { kind: 'self', note: d.note }; delete d.note; }
        if ((isStr(d.challenge) && PAIRISH.test(d.challenge)) || (isStr(d.context) && PAIRISH.test(d.context))) s.solo = SOLO_FALLBACK;
        break;
      }
      case 'activity': return null; // 카탈로그 활동 — 1인 모드는 활동 트랙(STATUS-kedu-activity) 과제
    }
    return s;
  }

  const SCORED = new Set(['pick', 'multi', 'num']);
  const NUMERIC = /^-?\d[\d,]*(\.\d+)?$/;
  function project(lesson) {
    const L = lesson || {};
    let slides = (L.slides || []).map(projectSlide).filter(Boolean);
    // 48차 — 출구 퀴즈의 수 답 문항을 학생이 직접 넣어 채점하는 장으로 편다(자기주도 원문의 문제 8개 가운데
    // 정본 출구에 옮겨 둔 것을 되살림). 기본 문제와 같은 물음(식)은 두 번 채점하지 않는다. 글 답 문항은 출구 장에 남긴다.
    const qkey = (q) => String(q || '').replace(/\*\*/g, '').replace(/\s+/g, '').replace(/(은|는)?(얼마|몇)(인가요|일까요|이에요|예요)?\??$/, '');
    const basicQ = new Set(slides.filter(s => s.block === 'basic_problem').map(s => qkey(s.data.question)));
    slides = slides.flatMap(s => {
      if (s.block !== 'exit_ticket' || !Array.isArray(s.data.items)) return [s];
      const keep = [], out = [];
      s.data.items.forEach(it => {
        const a = String(it && it.a != null ? it.a : '').trim();
        if (NUMERIC.test(a) && !basicQ.has(qkey(it.q))) out.push(it); else if (!(NUMERIC.test(a) && basicQ.has(qkey(it.q)))) keep.push(it);
      });
      const made = out.map((it, i) => ({ id: s.id + '_' + (i + 1), from: s.id, stage: s.stage, block: 'basic_problem',
        data: { title: (s.data.title || '오늘 확인해요') + ' ' + '①②③④⑤⑥'.charAt(i), question: it.q },
        learn: { kind: 'num', answer: Number(String(it.a).replace(/,/g, '')) } }));
      if (keep.length) { s.data.items = keep; return [s].concat(made); }
      return made.length ? made : [s];
    });
    const scored = slides.filter(s => s.learn && SCORED.has(s.learn.kind)).map(s => s.id);
    const n = scored.length;
    // 100점을 채점 문항에 나눈다 — 나머지는 앞 문항부터 1점씩(합이 꼭 100)
    const pts = {}; scored.forEach((id, i) => { pts[id] = Math.floor(100 / n) + (i < 100 % n ? 1 : 0); });
    slides.forEach(s => { if (pts[s.id] !== undefined) s.learn.pts = pts[s.id]; });
    return { meta: clone(L.meta || {}), slides, scored };
  }

  // 채점 — 학생 답을 정본 정답과 맞대 본다
  function check(learn, ans) {
    if (!learn) return false;
    if (learn.kind === 'pick') return !!(learn.options[ans] && learn.options[ans].correct);
    if (learn.kind === 'multi') { const want = learn.options.map((o, i) => o.correct ? i : -1).filter(i => i >= 0); const got = (ans || []).slice().sort((a, b) => a - b); return want.length === got.length && want.every((v, i) => v === got[i]); }
    if (learn.kind === 'num') { const v = String(ans == null ? '' : ans).replace(/[\s,]/g, ''); return v !== '' && Number(v) === Number(learn.answer); }
    return false;
  }
  // 몇 번째에 맞혔나 → 얻는 점수
  function gained(learn, tries, gaveUp) { if (!learn || !learn.pts || gaveUp) return 0; return tries <= 1 ? learn.pts : tries === 2 ? Math.ceil(learn.pts / 2) : 0; }

  const API = { project, projectSlide, check, gained, SCORED, SOLO_FALLBACK };
  global.KT2_PROJECT = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);

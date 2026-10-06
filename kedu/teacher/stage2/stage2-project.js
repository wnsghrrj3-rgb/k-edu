/* ============================================================================
   stage2-project.js — 케이티처 정본 → 자기주도 학생용 투영 (47차, 2026-09-30)
   방향 결정(2026-09-28): 케이티처 차시가 정본, 자기주도는 교사 층을 뺀 **학생용 투영** ·
   「우선 만들고 나서 바꿔치기」 · 활동은 1인도 되게.
   · 데이터는 한 글자도 안 고친다 — 읽어서 새 사본을 만든다(정본과 투영이 따로 놀 수 없게).
   · 빼는 것(교사 층): 발문 띠 tnote · 교사에게 하는 말 hint(오개념 장) · 👉 쪽지 · 자료 extras·suggested_extras ·
     출구 신호등 self(손 든 수 세기) · 교실 활동의 짝·모둠 흐름(→ 🙋 혼자라면 흐름으로 바꿈) · 타이머 분
   · 바꾸는 것(학생이 스스로 푸는 자리): 기본 문제 → learn { kind: pick(하나 고르기) · multi(모두 고르기) ·
     num(수 넣기) · self(생각하고 정답 보기) } · 생각을 넓혀요 → self · 「풀이」 쪽지는 푼 뒤에만
   · 51차: 짝 잇기(match) · 나눠 담기(sort) · 차례 놓기(order) · 단위 붙은 수 답(nums) — 정본 answer 글에서 떼어 채점한다(답 글은 학생 층으로만)
   · 50차: 1학기 정본 — 물음 글 안 보기(「A · B 중에서」·「① … — 어느 것」) → 하나 고르기 · 답이 「A, B」면 모두 고르기 · 수 답만 num(글 답 input 은 스스로 확인)
   · 55차: 수준별 글 답의 보기·차례·갈래 꼴 → 수준 답 표에도 pick·multi·order·sort
   · 49차: 수준별 문제 → lv 답 표(수준마다 nums·frac·self) — 고른 수준의 답으로 채점, 100점과 따로 「도전 🏅」로 센다
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
        // 49차 — 수준별 답 표: 고른 수준의 답으로 채점(수·수+단위·몫과 나머지·분수) · 여러 답(open)·글 답은 스스로 확인.
        // 답 글(a)·풀이(steps)는 data 에서 빼 학생 층(lv)으로만 옮긴다 — 첫 화면 renderSlide 에 답이 섞일 틈을 없앤다.
        // 55차 — 글 답 가운데 보기·차례·갈래 꼴(lvStructured)은 기본 문제와 같은 하나/모두 고르기·차례 놓기·나눠 담기로.
        const lvs = {};
        Object.keys(d.levels || {}).forEach(k => {
          const lv = d.levels[k] || {}; let g = lv.open ? null : parseLevelAnswer(lv.a);
          if (!g && !lv.open) { const ch = lvStructured(lv.q, lv.a); if (ch) { g = ch.learn; if (ch.question) lv.q = ch.question; } }
          lvs[k] = Object.assign(g || { kind: 'self' }, { a: lv.a, steps: lv.steps, open: !!lv.open });
          delete lv.a; delete lv.steps; delete lv.open;
        });
        Object.values(d.levels || {}).forEach(lv => { if (lv && isStr(lv.q) && PAIRISH.test(lv.q)) lv.q += '\n' + SOLO_FALLBACK; });
        s.lv = { levels: lvs };
        break;
      }
      case 'basic_problem': {
        const learn = { note: d.note }; let ch;
        if (Array.isArray(d.options) && d.options.length) { learn.kind = d.multi ? 'multi' : 'pick'; learn.options = d.options; }
        else if (d.answer !== undefined && d.input !== undefined && NUMERIC.test(String(d.answer).trim())) { learn.kind = 'num'; learn.answer = Number(String(d.answer).replace(/,/g, '')); }
        else if (d.answer !== undefined && (ch = inlineChoices(d.question, d.answer))) { learn.kind = ch.multi ? 'multi' : 'pick'; learn.options = ch.options; learn.inline = true; d.question = ch.question; }
        else if (d.answer !== undefined && (ch = structured(d.question, d.answer))) { Object.assign(learn, ch.learn); if (ch.question) d.question = ch.question; }
        else if (d.answer !== undefined && d.input === undefined && (ch = unitAnswer(d.question, d.answer))) { Object.assign(learn, ch); }
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
      case 'activity': {
        // 활동 13회차(D60): 카탈로그 활동(activityId)은 「혼자 해 보는 활동」 장으로 남긴다 — 실행 파일(src)은 카탈로그가 아는 것이라
        //   withActivities() 가 카탈로그로 채운다(못 채우면 그때 뺀다). activityId 없는 1세대 교실 활동 꼴은 종전대로 건너뛴다.
        if (!d.activityId) return null;
        s.act = { id: d.activityId, params: clone(d.params || {}) };
        s.data = { title: d.title, desc: d.desc };
        break;
      }
    }
    return s;
  }

  // 50차 — 1학기(1세대 생성기) 기본 문제는 보기를 물음 글 안에 적는다: 「A · B · C 중에서 … ?」·「A · B — … ?」·「① … ② … — 어느 것일까요?」.
  //   보기를 떼어 하나 고르기로 바꾼다 — 정본 답과 글자가 꼭 같은 보기가 정확히 하나일 때만(아니면 스스로 확인 그대로).
  const norm = (x) => String(x == null ? '' : x).replace(/\*\*/g, '').replace(/[‘’“”"'「」]/g, '').replace(/[.!?。]+$/, '').replace(/\s+/g, ' ').trim();
  function inlineChoices(q0, ans) {
    const q = String(q0 || ''); let opts = null, rest = '';
    let m = q.match(/^([\s\S]*?)①([\s\S]*?)\s+[—–-]\s+([^—–]*\?)\s*$/);
    if (m) { opts = ('①' + m[2]).split(/[①②③④⑤⑥]/).map(norm).filter(Boolean); rest = (m[1].trim() ? m[1].trim() + ' ' : '') + m[3].trim(); }
    else if ((m = q.match(/^([^?—–]*? · [^?—–]*?)\s*(?:중에서|가운데|[—–])\s*([^—–]*(?:\?|요\.?))\s*$/))) { opts = m[1].split(' · ').map(norm).filter(Boolean); rest = m[2].trim(); }
    if (!opts || opts.length < 2 || opts.length > 6 || !rest) return null;
    // 51차: 보기 글과 답 글이 괄호 풀이·띄어쓰기만 다를 때도 같은 보기(「어찌하다(움직임)」 = 「어찌하다」 · 「설명 1(…)」 = 「설명 1 (…)」)
    const same = (o, x) => o === x || o.replace(/\s/g, '') === x.replace(/\s/g, '') || o.replace(/\s*\([^)]*\)$/, '') === x;
    const a = norm(ans); let want = opts.filter(o => same(o, a)); let multi = false;
    if (want.length !== 1) { // 「A, B」·「A · B」 — 모두 고르기(각 조각이 보기와 글자가 같고 둘 이상)
      const parts = String(ans == null ? '' : ans).split(/\s*,\s*|\s+·\s+/).map(norm).filter(Boolean);
      if (parts.length < 2 || parts.length >= opts.length || !parts.every(p => opts.filter(o => same(o, p)).length === 1) || new Set(parts).size !== parts.length) return null;
      want = parts.map(p => opts.find(o => same(o, p))); multi = true;
    }
    const isAns = (o) => want.indexOf(o) >= 0;
    if (opts.some(o => o.length > 40)) return null;
    // 원문은 정답을 맨 앞에 두는 일이 잦다 — 물음 글로 정한 차례로 섞는다(열 때마다 같은 차례)
    let h = 0; for (const c of q) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const idx = opts.map((o, i) => i); for (let i = idx.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = (h >>> 16) % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    if (idx.every((v, i) => v === i)) idx.push(idx.shift()); // 원래 차례 그대로면 한 칸 돌린다
    return { question: rest, multi, options: idx.map(i => ({ text: opts[i], correct: isAns(opts[i]) })) };
  }

  // 51차 — 답 글이 짝·갈래·차례로 된 문제: 정본 answer 에서 떼어 학생이 직접 잇고·담고·놓게 한다.
  //   짝 잇기   「L ↔ R / L ↔ R」(2학기) · 「L = R / L = R」 · 「A · B · C 는 각각 …?」 + 「A-x, B-y, C-z」(1학기)
  //   나눠 담기 「🧱 고체 — a · b / 💧 액체 — c」(2학기) · 「땅 = 다람쥐 · 너구리 / 땅속 = …」(1학기)
  //   차례 놓기 「… 차례대로 …?」 + 「A → B → C」
  //   떼어 낼 수 없거나 모양이 조금이라도 어긋나면 null(스스로 확인 그대로).
  const flat = (x) => String(x == null ? '' : x).replace(/\*\*/g, '').replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
  function shuffleIdx(n, seed) {
    let h = 0; for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const idx = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = (h >>> 16) % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    if (idx.every((v, i) => v === i)) idx.push(idx.shift());
    if (n > 2 && idx.every((v, i) => v === n - 1 - i)) idx.push(idx.shift()); // 거꾸로 차례도 피한다(뒤집기만 하면 풀리지 않게)
    return idx;
  }
  function splitPair(seg, arrowOnly) {
    const res = arrowOnly ? [/\s*↔\s*/] : [/\s+=\s+/, /\s+[—–]\s+/, /[—–]/, /\s*=\s*/, /(?<=[가-힣)\]])-(?=\S)/];
    for (const re of res) { const m = seg.match(re); if (m && m.index > 0) { const L = seg.slice(0, m.index).trim(), R = seg.slice(m.index + m[0].length).trim(); if (L && R) return [L, R]; } }
    return null;
  }
  const uniq = (a) => new Set(a).size === a.length;
  // 물음 글 앞에 담을 것·놓을 것을 늘어놓았으면(「다람쥐 · 지렁이 … — 땅 위에 사는 무리는?」) 떼어 뒷말만 남긴다 — 늘어놓은 것이 곧 보기일 때만
  function dropList(q, items) {
    const m = q.match(/^([^—–?]+ · [^—–?]+?)(?:\s*[—–]\s*|\s+가운데\s+|\s+을\s+)(.+)$/); if (!m) return null;
    const list = m[1].split(' · ').map(x => x.trim()); return list.length === items.length && list.every(x => items.indexOf(x) >= 0) ? m[2].trim() : null;
  }
  function structured(q0, ans) {
    const q = flat(q0), a = flat(ans); if (!a) return null;
    // 차례 놓기
    if (/차례/.test(q) && (a.match(/→/g) || []).length >= 2) {
      const items = a.split(/\s*→\s*/).map(x => x.replace(/^\d+\s+/, '').trim());
      if (items.length < 3 || items.length > 6 || !uniq(items) || items.some(x => !x || x.length > 40)) return null;
      const idx = shuffleIdx(items.length, q + a); const shown = idx.map(i => items[i]);
      return { learn: { kind: 'order', items: shown, key: items.map(t => shown.indexOf(t)) }, question: dropList(q, items) };
    }
    let segs, form;
    if (/↔/.test(a)) { segs = a.split(/\s+\/\s+/); form = 'arrow'; if (segs.some(x => (x.match(/↔/g) || []).length !== 1)) return null; }
    else if (/\s\/\s/.test(a)) { segs = a.split(/\s+\/\s+/); form = 'slash'; }
    else if (/각각/.test(q)) { segs = a.split(/,\s*(?=[^,]*?(?:[—–=]|[가-힣)\]]-\S))/); form = 'comma'; }
    else return null;
    const pairs = segs.map(x => splitPair(x, form === 'arrow')); if (pairs.some(p => !p)) return null;
    if (pairs.length < 2 || pairs.length > 6) return null;
    // 원문 글 판의 줄 번호가 붙어 온 왼쪽(「2자리 때문에 …」·「3학기 초에 …」 = 2·3·4번 줄) — 번호가 차례로 이어질 때만 뗀다
    const dg = pairs.map(p => (p[0].match(/^(\d)(?=[^\d\s.,])/) || [])[1]);
    if (dg.every(Boolean) && dg.every((d, i) => +d === +dg[0] + i)) pairs.forEach(p => { p[0] = p[0].slice(1); });
    const lefts = pairs.map(p => p[0]), rights = pairs.map(p => p[1]);
    if (!uniq(lefts)) return null;
    // 나눠 담기 — 「/」 로 가른 갈래에 「 · 」 로 여러 개가 담긴 꼴
    if (form === 'slash' && rights.some(r => / · /.test(r))) {
      const bins = lefts, groups = rights.map(r => r.split(/\s+·\s+/).map(x => x.trim()));
      const items = [].concat.apply([], groups); if (bins.length > 4 || items.length < 3 || items.length > 10 || !uniq(items) || items.some(x => !x || x.length > 40) || bins.some(b => b.length > 30)) return null;
      const bin = []; groups.forEach((g, k) => g.forEach(() => bin.push(k)));
      const idx = shuffleIdx(items.length, q + a);
      // 통 차례대로 몰려 있으면(「고체 고체 액체 액체」) 한 칸씩 돌려 섞는다 — 카드 차례만 보고 담을 수 없게
      const mono = (k) => k.every((v, i) => !i || v >= k[i - 1]) || k.every((v, i) => !i || v <= k[i - 1]);
      for (let t = 0; t < items.length && mono(idx.map(i => bin[i])); t++) idx.push(idx.shift());
      const shown = idx.map(i => items[i]), key = idx.map(i => bin[i]);
      // 1학기: 물음 글 앞에 담을 것들을 늘어놓았으면(「다람쥐 · 지렁이 … — 땅 위에 사는 무리는?」) 떼어 뒷말만 남긴다
      return { learn: { kind: 'sort', bins, items: shown, key }, question: dropList(q, items) };
    }
    // 짝 잇기
    if (!uniq(rights) || lefts.concat(rights).some(x => x.length > 60)) return null;
    if (pairs.some(([l, r]) => r.replace(/[\/\s.]/g, '') === l.replace(/[\s.]/g, ''))) return null; // 「콩이가 뛰어갑니다 ↔ 콩이가 / 뛰어갑니다」 같은 나누기 문제는 짝이 아니다
    let show = lefts;
    if (form === 'comma') { // 물음 글에 늘어놓은 왼쪽 수 = 짝 수 · 왼쪽 이름이 물음 글에 있어야
      const pre = q.split(/각각/)[0]; const list = pre.split(' · ').map(x => x.replace(/\s*[—–]\s*$/, '').trim()); if (list.length !== pairs.length || !lefts.every(l => pre.indexOf(l) >= 0)) return null;
      // 답 글이 줄여 적은 왼쪽(「도서관」)이 물음 글 항목 한가운데 있으면(「우리 학교 도서관은 좋습니다」) 물음 글 항목을 보인다
      show = lefts.map(l => { const hit = list.filter(x => x.indexOf(l) >= 0); return hit.length === 1 && hit[0].indexOf(l) > 0 && !/[—–]/.test(hit[0]) ? hit[0] : l; });
      if (!uniq(show)) show = lefts;
    }
    const idx = shuffleIdx(rights.length, q + a); const shown = idx.map(i => rights[i]);
    return { learn: { kind: 'match', left: show, right: shown, key: rights.map(r => shown.indexOf(r)) } };
  }
  // 55차 — 수준별 문제의 글 답 가운데 떼어 채점할 수 있는 꼴만: 물음 속 보기(하나/모두 고르기) · 차례 놓기 · 나눠 담기.
  //   수준별 글 답은 대개 까닭·견주기·예시를 곁들인 말하기라 짝 잇기(「밤나무 — 나무(줄기가 굵고…)」)는 받지 않는다.
  //   물음이 까닭·방법을 함께 묻거나(「까닭도」·「무엇을 보고」) 답이 예시·괄호 풀이·덧말을 달면 스스로 확인 그대로.
  const LV_ASKMORE = /까닭|왜|무엇을 보고|어떻게/, LV_LOOSE = /^예\s*[—–:]|^예\)|여러 답|[()（）]/, LV_MARK = /[—–=→↔]/;
  function lvStructured(q0, a0) {
    const q = flat(q0), a = flat(a0); if (!a || LV_ASKMORE.test(q) || LV_LOOSE.test(a)) return null;
    let ch = inlineChoices(q0, a0); if (ch) return { learn: { kind: ch.multi ? 'multi' : 'pick', options: ch.options, inline: true }, question: ch.question };
    ch = structured(q0, a0); if (!ch || (ch.learn.kind !== 'order' && ch.learn.kind !== 'sort')) return null;
    if (ch.learn.items.some(x => LV_MARK.test(x) || / · /.test(x)) || (ch.learn.bins || []).some(x => LV_MARK.test(x))) return null; // 덧말이 카드에 섞임(「담 · 첫 글자의 받침…」)
    return ch;
  }
  // 51차 — 기본 문제의 단위 붙은 수 답(「100 cm」·「7 cm 1 mm」·「3분 5초」·「4개」): 수준별과 같은 칸 넣기로 채점
  const UNITS = new Set(['', 'cm', 'mm', 'm', 'km', 'g', 'kg', 't', 'L', 'mL', '시', '분', '초', '시간', '개', '명', '원', '번', '장', '권', '살', '일', '달', '년', '층', '쪽', '칸', '묶음', '봉지', '상자', '배', '마리', '자루', '송이', '대', '켤레', '그루', '걸음', '바퀴', '뼘', '줄', '통', '병', '컵', '조각', '판', 'cm²', '개월']);
  function unitAnswer(q0, ans) {
    const q = flat(q0), a = flat(ans);
    if (!/몇|얼마|언제|며칠/.test(q) || /분의|약\s|보다/.test(a)) return null;
    const g = parseLevelAnswer(a); if (!g) return null;
    if (g.kind === 'frac') return { kind: 'frac', answer: g.answer, a };
    if (g.parts.some(p => !UNITS.has(p.unit) || p.post)) return null;
    if (g.parts.length === 1 && !g.parts[0].unit && !g.parts[0].pre) return { kind: 'num', answer: g.parts[0].v, a };
    return { kind: 'nums', parts: g.parts, a };
  }
  // 수준별 답 글 → 채점 꼴. 「약 ~」(어림)·「~보다 크고」·기호(㉠)·대분수는 채점하지 않는다(스스로 확인).
  //   '175개' → nums [175 개] · '몫 4, 나머지 5' → nums [몫 4][나머지 5] · '7봉지, 3개 남음' → [7 봉지][3 개 남음] ·
  //   '6 L 50 mL' → [6 L][50 mL] · '7/9' → frac
  const UNIT = '(?:\\s*(?!몫|나머지)(mL|mm|cm|km|kg|m|L|g|t|[가-힣]{1,3})(?=$|[\\s,]))';
  function parseLevelAnswer(a0) {
    const a = String(a0 == null ? '' : a0).replace(/\*\*/g, '').trim(); if (!a) return null;
    let m = a.match(/^(\d+)\s*\/\s*(\d+)$/); if (m) return { kind: 'frac', answer: m[1] + '/' + m[2] };
    const re = new RegExp('^(몫|나머지)?\\s*(-?(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?)' + UNIT + '?(\\s*남음)?'); const parts = []; let rest = a;
    while (rest.length) {
      m = rest.match(re); if (!m || !m[0].trim()) return null;
      parts.push({ pre: m[1] || '', v: Number(m[2].replace(/,/g, '')), unit: m[3] || '', post: m[4] ? '남음' : '' });
      rest = rest.slice(m[0].length); const sep = rest.match(/^\s*,\s*|^\s+(?=[\d몫나])/); if (!rest.length) break; if (!sep) return null; if (sep[0].indexOf(',') >= 0) parts[parts.length - 1].comma = true; rest = rest.slice(sep[0].length);
    }
    return parts.length && parts.length <= 4 ? { kind: 'nums', parts } : null;
  }
  const SCORED = new Set(['pick', 'multi', 'num', 'nums', 'frac', 'match', 'sort', 'order']);
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

  // ── 활동 13회차(D60) — 투영 접점: 카탈로그 활동을 학생 화면에 「🎲 혼자 해 보는 활동」 장으로 ─────────────
  //   · actsFor(catalog, q, opt): 이 차시(map.lessons 에 lNN) · 같은 학년·학기(map.semester 없으면 1)·과목·단원 · modes 에 solo ·
  //     status live 만(opt.all = 검수 전 draft 도 — 준호 미리보기 ?act=all). phase 차례(도입→연습→정리)로 둘까지.
  //   · withActivities(slides, acts, catalog): 정본에 이미 박힌 활동 장(act.id)은 카탈로그로 채우고(없거나 solo 아님 → 뺀다),
  //     자리 없는 추천 활동은 phase 자리에 넣는다 — intro: 도입 끝 · practice: 기본문제 끝(없으면 응용문제/정리 앞) · wrapup: 정리 앞.
  //   · 점수(100)에는 안 넣는다(scored 무개변) · 넘김을 막지 않는다(건너뛰어도 된다 — 활동은 덤).
  const PHASE_AT = { intro: 0, practice: 1, wrapup: 2 };
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function actsFor(catalog, q, opt) {
    opt = opt || {}; const g = +q.g, t = +q.t > 1 ? +q.t : 1, u = +q.u, sj = q.s;
    const lns = []; String(q.l || '').replace(/l(\d+)/g, (_, n) => { lns.push('l' + pad2(+n)); });
    return (Array.isArray(catalog) ? catalog : []).filter(a => a && a.map && a.src && +a.map.grade === g && (+a.map.semester > 1 ? +a.map.semester : 1) === t
      && a.map.subject === sj && +a.map.unit === u && lns.some(ln => (a.map.lessons || []).indexOf(ln) >= 0)
      && (a.modes || []).indexOf('solo') >= 0 && (opt.all || a.status === 'live'))
      .sort((x, y) => (PHASE_AT[x.phase] == null ? 1 : PHASE_AT[x.phase]) - (PHASE_AT[y.phase] == null ? 1 : PHASE_AT[y.phase])).slice(0, 2);
  }
  function actDefaults(a, params) { const m = {}; Object.keys(a.paramsSchema || {}).forEach(k => { m[k] = a.paramsSchema[k].default; }); Object.keys(params || {}).forEach(k => { if (params[k] !== undefined && params[k] !== null && params[k] !== '') m[k] = params[k]; }); return m; }
  function actSlide(a, params, id, stage) {
    return { id: id || ('act_' + a.id), stage, block: 'activity', data: { title: a.title, desc: a.short || '', icon: '🎲', tag: '🎲 혼자 해 보는 활동' },
      act: { id: a.id, src: a.src, title: a.title, genre: a.genre, phase: a.phase, params: actDefaults(a, params), status: a.status || 'draft' } };
  }
  function withActivities(slides0, acts, catalog) {
    const by = {}; (Array.isArray(catalog) ? catalog : []).concat(acts || []).forEach(a => { if (a && a.id) by[a.id] = a; });
    // ① 정본에 박힌 활동 장 — 카탈로그로 채우거나 뺀다
    let slides = (slides0 || []).map(s => {
      if (!s || !s.act || s.act.src) return s;
      const a = by[s.act.id]; if (!a || !a.src || (a.modes || []).indexOf('solo') < 0) return null;
      const n = actSlide(a, s.act.params, s.id, s.stage); if (s.data && s.data.title) n.data.title = s.data.title; if (s.data && s.data.desc) n.data.desc = s.data.desc; return n;
    }).filter(Boolean);
    const have = new Set(slides.filter(s => s.act).map(s => s.act.id));
    // ② 추천 활동 — phase 자리에
    (acts || []).forEach(a => {
      if (!a || have.has(a.id)) return; have.add(a.id);
      const lastOf = (st) => { let k = -1; slides.forEach((s, i) => { if (s.stage === st) k = i; }); return k; };
      const firstOf = (st) => slides.findIndex(s => s.stage === st);
      let at, stage;
      if (a.phase === 'intro' && lastOf('도입') >= 0) { at = lastOf('도입') + 1; stage = '도입'; }
      else if (a.phase === 'wrapup' && firstOf('정리') >= 0) { at = firstOf('정리'); stage = '정리'; }
      else if (lastOf('기본문제') >= 0) { at = lastOf('기본문제') + 1; stage = '기본문제'; }
      else if (firstOf('응용문제') >= 0) { at = firstOf('응용문제'); stage = '응용문제'; }
      else if (firstOf('정리') >= 0) { at = firstOf('정리'); stage = '정리'; }
      else { at = slides.length; stage = (slides[slides.length - 1] || {}).stage || '정리'; }
      // 마지막 장(다음 차시 예고·끝 카드)보다 뒤로는 안 간다
      if (at >= slides.length && slides.length) at = slides.length - 1;
      slides.splice(at, 0, actSlide(a, null, null, stage));
    });
    return slides;
  }

  // 채점 — 학생 답을 정본 정답과 맞대 본다
  function check(learn, ans) {
    if (!learn) return false;
    if (learn.kind === 'pick') return !!(learn.options[ans] && learn.options[ans].correct);
    if (learn.kind === 'multi') { const want = learn.options.map((o, i) => o.correct ? i : -1).filter(i => i >= 0); const got = (ans || []).slice().sort((a, b) => a - b); return want.length === got.length && want.every((v, i) => v === got[i]); }
    if (learn.kind === 'num') { const v = String(ans == null ? '' : ans).replace(/[\s,]/g, ''); return v !== '' && Number(v) === Number(learn.answer); }
    if (learn.kind === 'nums') { const a = Array.isArray(ans) ? ans : [ans]; return learn.parts.length === a.length && learn.parts.every((p, i) => { const v = String(a[i] == null ? '' : a[i]).replace(/[\s,]/g, ''); return v !== '' && Number(v) === p.v; }); }
    if (learn.kind === 'frac') { const v = String(Array.isArray(ans) ? ans[0] : ans == null ? '' : ans).replace(/\s/g, ''); return v === learn.answer; }
    if (learn.kind === 'match' || learn.kind === 'sort' || learn.kind === 'order') { const a = Array.isArray(ans) ? ans : []; return a.length === learn.key.length && learn.key.every((v, i) => a[i] === v); }
    return false;
  }
  // 몇 번째에 맞혔나 → 얻는 점수
  function gained(learn, tries, gaveUp) { if (!learn || !learn.pts || gaveUp) return 0; return tries <= 1 ? learn.pts : tries === 2 ? Math.ceil(learn.pts / 2) : 0; }

  const API = { project, projectSlide, actsFor, withActivities, actDefaults, check, gained, parseLevelAnswer, inlineChoices, structured, unitAnswer, lvStructured, SCORED, SOLO_FALLBACK };
  global.KT2_PROJECT = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);

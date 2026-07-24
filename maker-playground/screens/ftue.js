/* ============================================================
   화면: FTUE — First 10 Minutes (Round 34)
   ------------------------------------------------------------
   개요/타임라인·Welcome/첫 질문·대화/즉시 성공/가이드·자신감/
   Export·다음/감정·지표/산출물 8탭. 전 버튼 실함수 — 튜토리얼 스펙이
   실제로 거부되고, 제품 설명 스크립트가 실제로 기각되고, 6선택지가
   실제로 생성되고, ftueWalk() 가 첫 10분을 실제로 걷는다.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.ftue = (() => {
  const F = () => window.MK_FTUE, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'over', out: null, run: null, walk: null };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const row = (l, r) => `<div class="dls-lm-row"><span>${l}</span><span>${r}</span></div>`;
  const vio = (a) => a.ok ? badge(true, '위반 0') : a.violations.map((v) => badge(false, v)).join(' ');

  const TABS = [['over', '개요'], ['flow', '타임라인·Welcome'], ['ask', '첫 질문·대화'], ['win', '즉시 성공'],
                ['guide', '가이드·자신감'], ['next', 'Export·다음'], ['emo', '감정·지표'], ['out', '산출물']];

  /* ---------- 개요 ---------- */
  function Over() {
    const f = F(), tl = f.timelineAudit(), ft = f.firstTimeTest();
    return `
      <div class="adm-stats">
        ${Stat('첫 결과물', tl.firstResultSec + 's', '예산 ' + f.GOALS.firstResultSec + 's (§1)')}
        ${Stat('첫 10분', tl.totalSec + 's', '예산 ' + f.GOALS.impressionSec + 's')}
        ${Stat('선택지', f.OPTIONS.length, '전부 실생성 (§3)')}
        ${Stat('완료 조건', f.complete() ? '충족' : '미달', '§11')}
      </div>
      <div class="mk-card"><h4>핵심 철학 (§0)</h4>
        <p class="dev-note"><b>${esc(f.PHILOSOPHY.rule)}</b></p>
        <p class="dev-note">${esc(f.PHILOSOPHY.memory)}</p>
        <p class="dev-note">${esc(f.PHILOSOPHY.goal)}</p></div>
      <div class="mk-card"><h4>완료 조건 (§11)</h4>
        <p>${badge(ft.ok, ft.ok ? '설명 없이 첫 결과물 — 다시 돌아오고 싶다' : '미달')}</p>
        <p class="dev-note">기억하는 것: ${esc(ft.remembers)}</p></div>`;
  }

  /* ---------- 타임라인·Welcome ---------- */
  function Flow() {
    const f = F(), tl = f.timelineAudit(), wa = f.welcomeAudit();
    return `
      <div class="mk-card"><h4>First 10 Minutes Flow (§1) — 7국면</h4>
        <p>${vio(tl)}</p>
        <div class="dls-lm">${f.PHASES.map((p) => row(`<b>${esc(p.name)}</b> <small>${p.sec}s</small>`,
          `${esc(p.surface)} <small>→ #/${esc(p.route)}</small>`)).join('')}</div></div>
      <div class="mk-card"><h4>Welcome (§2) — 설명·튜토리얼·슬라이드 금지</h4>
        <p>${vio(wa)}</p>
        <p class="dev-note">금지 표면: ${wa.forbidden.map(esc).join(' · ')}</p>
        <button class="mk-btn" data-ft-tuto>튜토리얼 낀 Welcome 스펙 판정 시도</button>
        <button class="mk-btn" data-ft-slides>슬라이드 온보딩 스펙 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>`;
  }

  /* ---------- 첫 질문·대화 ---------- */
  function Ask() {
    const f = F(), qa = f.questionAudit(), ca = f.convAudit();
    return `
      <div class="mk-card"><h4>첫 질문 (§3) — ${esc(f.QUESTION)}</h4>
        <p>${vio(qa)}</p>
        <p>${f.OPTIONS.map((o) => `<button class="mk-btn" data-ft-opt="${o.id}">○ ${esc(o.label)}</button>`).join(' ')}</p>
        ${st.run ? `<p>${st.run}</p>` : ''}
        <button class="mk-btn" data-ft-survey>질문 3개 설문 스펙 판정 시도</button>
        <button class="mk-btn" data-ft-noauto>맡기기 없는 스펙 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>AI Conversation (§4) — 제품 설명 금지</h4>
        <p>${vio(ca)}</p>
        <div class="dls-lm">${f.SCRIPT.map((l) => row(`<small>${esc(l.kind)}</small>`, esc(l.say))).join('')}</div>
        <button class="mk-btn" data-ft-pitch>제품 설명 스크립트 판정 시도</button></div>`;
  }

  /* ---------- 즉시 성공 ---------- */
  function Win() {
    const f = F(), it = f.instant(), ba = f.blankAudit();
    return `
      <div class="mk-card"><h4>Instant Success (§5) — 30초 초안</h4>
        <p>${badge(it.ok, it.ok ? it.sec + 's / ' + it.budget + 's · 실생성 ' + it.scenes + '장 · 전 장면 글 실존' : '실패')}</p>
        <p class="dev-note">${esc(it.moment)}</p></div>
      <div class="mk-card"><h4>빈 화면 금지 (§5)</h4>
        <p>${vio(ba)}</p>
        <button class="mk-btn" data-ft-blank>빈 화면 낀 스펙 판정 시도</button>
        <button class="mk-btn" data-ft-slow>60초 초안 스펙 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>`;
  }

  /* ---------- 가이드·자신감 ---------- */
  function Guide() {
    const f = F(), ga = f.guidedAudit(), ca = f.confidenceAudit();
    return `
      <div class="mk-card"><h4>Guided Editing (§6) — 필요한 순간에만 한 가지씩</h4>
        <p>${vio(ga)}</p>
        <div class="dls-lm">${f.TIPS.map((t) => row(`<small>${esc(t.at)}</small>`, esc(t.teach))).join('')}</div>
        <button class="mk-btn" data-ft-all>전 기능 설명 스펙 판정 시도</button>
        <button class="mk-btn" data-ft-multi>동시 팁 3개 스펙 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>Confidence (§7) — "${esc(f.FEELING)}"</h4>
        <p>${vio(ca)}</p>
        <div class="dls-lm">${f.CONFIDENCE.map((c) => row(esc(c.act), `${esc(c.result)} <small>공: 사용자</small>`)).join('')}</div>
        <button class="mk-btn" data-ft-aicredit>AI 가 공을 갖는 스펙 판정 시도</button></div>`;
  }

  /* ---------- Export·다음 ---------- */
  function Next() {
    const f = F(), ea = f.exportAudit(), sa = f.secondAudit();
    return `
      <div class="mk-card"><h4>First Export (§8) — 1클릭 · 형식 결정 0</h4>
        <p>${vio(ea)}</p></div>
      <div class="mk-card"><h4>Second Project (§9) — AI 가 다음을 제안</h4>
        <p>${vio(sa)}</p>
        <div class="dls-lm">${f.OPTIONS.map((o) => { const s = f.secondRun(o.id);
          return row(esc(o.label), s.ok ? esc(s.suggest) : badge(false, '실패')); }).join('')}</div></div>
      <div class="mk-card"><h4>Prototype — ftueWalk() 첫 10분 실동작</h4>
        <button class="mk-btn primary" data-ft-walk>ftueWalk('present') 실행</button>
        ${st.walk ? `<p>${st.walk}</p>` : ''}</div>`;
  }

  /* ---------- 감정·지표 ---------- */
  function Emo() {
    const f = F(), ea = f.emotionMapAudit(), mts = f.metrics();
    return `
      <div class="mk-card"><h4>Emotion Map</h4>
        <p>${vio(ea)}</p>
        <div class="dls-lm">${f.EMOTION_MAP.map((e) => row(`<b>${esc(e.emotion)}</b>`,
          `${e.phases.map(esc).join('·')} — ${esc(e.device)}`)).join('')}</div></div>
      <div class="mk-card"><h4>Success Metrics — record() 유일 경로 · 미실측 = null</h4>
        <div class="dls-lm">${mts.map((m) => row(esc(m.key), m.measured ? '<b>' + m.value + '</b>' : '<small>null (미실측)</small>')).join('')}</div>
        <p class="dev-note">실사용 텔레메트리 연결 전까지 시뮬 값 주입 금지 — 정직 원칙.</p></div>`;
  }

  /* ---------- 산출물 ---------- */
  function Out() {
    const f = F(), d = f.deliverables(), a = f.deliverablesAudit(), wf = f.wireframe();
    return `
      <div class="mk-card"><h4>Deliverables (§10) — 8종</h4>
        <p>${badge(a.ok, a.ok ? '8/8 실존' : '미비 ' + a.open.join(','))}</p>
        <div class="dls-lm">${d.map((x) => row(esc(x.name), badge(x.ready, x.ready ? '준비' : '미비'))).join('')}</div></div>
      <div class="mk-card"><h4>Wireframe — 국면별 표면 · 실라우트</h4>
        <div class="dls-lm">${wf.map((w) => row(esc(w.phase), `${esc(w.surface)} <small>#/${esc(w.route)}</small> ${badge(w.live, w.live ? '라이브' : '없음')}`)).join('')}</div></div>
      <div class="mk-card"><h4>판정 한 줄</h4>
        <p>${badge(f.complete(), f.complete() ? 'complete() — 첫 성공을 기억하게 한다' : '미달')}</p></div>`;
  }

  const BODY = { over: Over, flow: Flow, ask: Ask, win: Win, guide: Guide, next: Next, emo: Emo, out: Out };

  function render() {
    return `
      <div class="mk-tabs">${TABS.map(([id, l]) => `<button class="mk-tab ${st.tab === id ? 'active' : ''}" data-ft-tab="${id}">${esc(l)}</button>`).join('')}</div>
      <div class="mk-tab-body">${BODY[st.tab]()}</div>`;
  }

  function mount(root) {
    const rerender = () => { root.innerHTML = render(); mount(root); };
    root.querySelectorAll('[data-ft-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.ftTab; st.out = null; st.run = null; st.walk = null; rerender(); });
    root.querySelectorAll('[data-ft-opt]').forEach((b) => b.onclick = () => {
      const r = window.MK_FTUE.optionRun(b.dataset.ftOpt);
      st.run = r.ok ? `<span class="mk-badge success">실생성 — ${esc(r.title)} (${r.scenes}장${r.auto ? ' · AI 위임' : ''})</span>`
                    : `<span class="mk-badge danger">생성 실패</span>`;
      rerender();
    });
    const on = (sel, fn) => { const b = root.querySelector(sel); if (b) b.onclick = () => { fn(window.MK_FTUE); rerender(); }; };
    const rej = (r) => { st.out = `<span class="mk-badge danger">거부 — ${esc(r.reason)}</span>`; };
    on('[data-ft-tuto]', (f) => rej(f.welcomeSpecAudit({ surfaces: ['tutorial', 'question'] })));
    on('[data-ft-slides]', (f) => rej(f.welcomeSpecAudit({ surfaces: ['slides'] })));
    on('[data-ft-survey]', (f) => rej(f.questionSpecAudit({ questions: 3 })));
    on('[data-ft-noauto]', (f) => rej(f.questionSpecAudit({ options: [{ label: '발표' }] })));
    on('[data-ft-pitch]', (f) => rej(f.convSpecAudit({ lines: [{ kind: 'pitch', say: 'K-MAKER 는 100가지 기능이 있습니다' }] })));
    on('[data-ft-blank]', (f) => rej(f.instantSpecAudit({ phases: [{ blank: true }] })));
    on('[data-ft-slow]', (f) => rej(f.instantSpecAudit({ draftSec: 60 })));
    on('[data-ft-all]', (f) => rej(f.guidedSpecAudit({ teachAll: true })));
    on('[data-ft-multi]', (f) => rej(f.guidedSpecAudit({ concurrent: 3 })));
    on('[data-ft-aicredit]', (f) => rej(f.confidenceSpecAudit({ moments: [{ act: 'x', credit: 'ai' }] })));
    on('[data-ft-walk]', (f) => {
      const w = f.ftueWalk('present');
      st.walk = w.ok ? `<span class="mk-badge success">첫 10분 실보행 — ${esc(w.made)} · 첫 결과물 ${w.firstResultSec}s · 다음: ${esc(w.suggest)}</span>`
                     : `<span class="mk-badge danger">보행 실패</span>`;
      window.PG.go('ftue');                                   /* 검수 화면으로 복귀 */
    });
  }

  return { title: 'FTUE — First 10 Minutes', variants: ['R34'], render, mount };
})();

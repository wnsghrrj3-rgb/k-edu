/* ============================================================
   K-MAKER AI Studio v1  (#/ai)
   ------------------------------------------------------------
   ⚠ AI API 미연결 — 전부 Placeholder 시뮬레이션. 목표 = AI UX 검증.
   구조:
   · window.MK_AI  — 독립 모듈 (분석·문서 생성·채팅 mount).
     화면과 분리되어 있어 향후 Editor 패널 안에도 그대로 장착 가능.
   · MK_SCREENS.ai — 3단 화면: 좌 작업 목록 / 중 채팅 / 우 AI 제안.
   ============================================================ */

/* ---------------- MK_AI 모듈 ---------------- */
window.MK_AI = (() => {
  const M = window.MK;

  /* ---- 유형 사전 ---- */
  const TYPES = [
    { key: 'presentation', name: '발표자료', kw: ['발표', 'ppt', '피피티', '프레젠테이션', '수업자료'], style: '모던', anim: '페이드 + 순차 등장' },
    { key: 'cardnews', name: '카드뉴스', kw: ['카드뉴스', '카드 뉴스', '소식', '뉴스'], style: '소프트', anim: '슬라이드 넘김' },
    { key: 'video', name: '홍보 영상', kw: ['영상', '비디오', '홍보'], style: '크리에이티브', anim: '씬 트랜지션 + 자막 팝' },
    { key: 'worksheet', name: '학습지', kw: ['학습지', '문제지', '활동지', '워크시트'], style: '에듀', anim: '없음 (인쇄용)' },
    { key: 'poster', name: '포스터', kw: ['포스터', '안내문', '홍보물'], style: '프리미엄', anim: '타이틀 등장 1회' },
    { key: 'thumbnail', name: '썸네일', kw: ['썸네일', '섬네일'], style: '볼드', anim: '없음' },
  ];
  const GRADES = [['1학년','1'],['2학년','2'],['3학년','3'],['4학년','4'],['5학년','5'],['6학년','6']];
  const PALETTES = {
    presentation: ['#4A54A8', '#E8EAF6', '#1F2733', '#FFFFFF'],
    cardnews: ['#E8735A', '#FBE9E4', '#2E8C7F', '#FFF7F2'],
    video: ['#8E4A97', '#F3E8F4', '#1F2733', '#FFD166'],
    worksheet: ['#26766B', '#E3F1EE', '#1F2733', '#FFFFFF'],
    poster: ['#8A7A55', '#F8F3E9', '#1F2733', '#C4573F'],
    thumbnail: ['#1F2733', '#FFD166', '#FFFFFF', '#D6453A'],
  };

  /* ---- 1) 목적 분석 (키워드 placeholder) ---- */
  function analyze(prompt) {
    const p = String(prompt).trim();
    const type = TYPES.find((t) => t.kw.some((k) => p.toLowerCase().includes(k))) || TYPES[0];
    const g = GRADES.find(([nm]) => p.includes(nm));
    /* 주제 = 유형·학년·명령어 걷어낸 나머지 */
    let topic = p;
    [...type.kw, '만들어줘', '만들어 줘', '만들기', '해줘', '초등학교', '초등', '용', ...(g ? [g[0]] : [])]
      .forEach((w) => { topic = topic.split(w).join(' '); });
    topic = topic.replace(/\s+/g, ' ').trim() || '우리 반 프로젝트';
    return { type: type.key, typeName: type.name, style: type.style, anim: type.anim, topic, grade: g ? g[0] : null, palette: PALETTES[type.key] };
  }

  /* ---- 2) 템플릿 매칭 ---- */
  const matchTemplate = (intent) =>
    window.MK_SAMPLE.TEMPLATES.find((t) => t.contentType === intent.type) || window.MK_SAMPLE.TEMPLATES[0];

  /* ---- 3) Scene 자동 생성 — 샘플 템플릿 복제 + 주제 주입 ---- */
  function buildDoc(intent) {
    const tpl = matchTemplate(intent);
    const doc = JSON.parse(JSON.stringify(tpl));
    doc.templateId = 'ai-' + Date.now();
    doc.title = `${intent.topic} ${intent.typeName}`;
    doc.aiGenerated = true;
    const grade = intent.grade ? `${intent.grade} · ` : '';
    const put = (scene, i, text, sub) => {
      const texts = scene.elements.filter((e) => e.kind === 'text');
      if (texts[0]) texts[0].text = text;
      if (sub && texts[1]) texts[1].text = sub;
    };
    doc.scenes.forEach((s, i) => {
      if (i === 0) put(s, i, intent.topic, `${grade}${intent.typeName} · AI 초안`);
      else if (i === doc.scenes.length - 1 && doc.scenes.length > 2) put(s, i, '함께해요!', `${intent.topic} — 마무리`);
      else put(s, i, `${intent.topic} ${i}`, '이 자리의 내용은 편집기에서 다듬어요');
    });
    return doc;
  }

  /* ---- AI 기능 버튼 10종 (지시서 고정) ---- */
  const ACTIONS = [
    ['fresh', 'AI로 처음부터 만들기'], ['improve', '현재 디자인 개선'], ['rewrite', '텍스트 다시 작성'],
    ['grade', '학년 수준 변경'], ['color', '색상 변경'], ['layout', '레이아웃 변경'],
    ['image', '이미지 추천'], ['scene', 'Scene 추가'], ['tovideo', '발표자료를 영상으로 변환'], ['tocard', '포스터를 카드뉴스로 변환'],
  ];
  const ACTION_REPLY = {
    fresh: '좋아요! 아래 입력창에 만들고 싶은 것을 말해 주세요. 예: "학교폭력 예방 발표자료 만들어줘"',
    improve: '현재 열려 있는 디자인의 여백·정렬·색 대비를 점검해서 3가지 개선안을 제안할게요. (Editor 연동 후속 — 지금은 흐름만)',
    rewrite: '선택한 텍스트를 더 자연스럽게 3가지 버전으로 다시 써 드릴게요. (Editor 연동 후속)',
    grade: '어느 학년 수준으로 바꿀까요? 문장 길이·어휘 난도를 함께 조정해요. (Editor 연동 후속)',
    color: '현재 팔레트 기준으로 조화로운 대체 팔레트 3세트를 제안할게요. (Editor 연동 후속)',
    layout: '내용은 그대로 두고 배치만 다른 레이아웃 3안을 만들어 볼게요. (Editor 연동 후속)',
    image: '주제에 맞는 이미지를 Asset Browser에서 골라 추천해요. 오른쪽 제안 패널을 확인하세요.',
    scene: '현재 문서 흐름에 맞는 다음 Scene을 한 장 제안해요. (Editor 연동 후속)',
    tovideo: '발표자료의 각 장을 Scene으로 옮기고 전환·자막을 입혀 영상으로 바꿔요. (변환 엔진 후속)',
    tocard: '포스터 내용을 3~4장 카드뉴스 흐름으로 재구성해요. (변환 엔진 후속)',
  };

  /* ---- 채팅 mount — root에 채팅 UI를 장착 (화면·Editor 공용) ----
     opts: { compact(에디터 내장용), onDone(doc, intent), onIntent(intent) } */
  function mountChat(root, opts = {}) {
    const EXAMPLES = [
      '학교폭력 예방 발표자료 만들어줘', '환경 보호 카드뉴스 만들어줘',
      '학교 축제 홍보 영상 만들어줘', '초등학교 3학년 과학 학습지 만들어줘',
    ];
    root.innerHTML = `
      <div class="ai-chat ${opts.compact ? 'compact' : ''}">
        <div class="ai-stream" data-ai-stream>
          <div class="ai-msg bot"><div class="bub">안녕하세요! 무엇을 만들든 옆에서 같이 만드는 <b>AI 제작 파트너</b>예요.<br>만들고 싶은 걸 그냥 말해 주세요.</div></div>
          <div class="ai-examples">${EXAMPLES.map((e) => `<button class="ai-ex" data-ai-ex="${M.esc(e)}">${M.esc(e)}</button>`).join('')}</div>
        </div>
        ${opts.compact ? '' : `<div class="ai-actions">${ACTIONS.map(([k, l]) => M.Chip({ label: l, attrs: `data-ai-act="${k}"` })).join('')}</div>`}
        <div class="ai-inputrow">
          <input data-ai-in type="text" placeholder="예: 우리 반 알뜰시장 포스터 만들어줘">
          ${M.Button({ label: '만들기', attrs: 'data-ai-send' })}
        </div>
      </div>`;

    const stream = root.querySelector('[data-ai-stream]');
    const input = root.querySelector('[data-ai-in]');
    const scroll = () => { stream.scrollTop = stream.scrollHeight; };
    const add = (side, html) => {
      const el = document.createElement('div');
      el.className = 'ai-msg ' + side;
      el.innerHTML = `<div class="bub">${html}</div>`;
      stream.appendChild(el); scroll();
      return el;
    };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    async function run(prompt) {
      add('me', M.esc(prompt));
      root.querySelector('.ai-examples')?.remove();
      const think = add('bot', '<span class="ai-dots"><i></i><i></i><i></i></span>');
      await wait(240);

      /* 제작 흐름: 분석 → 종류 → 스타일 → 템플릿 → Scene 생성 → Editor */
      const intent = analyze(prompt);
      if (opts.onIntent) opts.onIntent(intent);
      const steps = [
        `제작 목적 분석 — 주제 「<b>${M.esc(intent.topic)}</b>」${intent.grade ? ' · ' + M.esc(intent.grade) : ''}`,
        `콘텐츠 종류 결정 — <b>${M.esc(intent.typeName)}</b>`,
        `스타일 추천 — <b>${M.esc(intent.style)}</b> (오른쪽 제안 패널 참고)`,
        `템플릿 추천 — 「${M.esc(matchTemplate(intent).title)}」 기반`,
        `Scene 자동 생성 중…`,
      ];
      think.querySelector('.bub').innerHTML = `<ol class="ai-steps"></ol>`;
      const ol = think.querySelector('.ai-steps');
      for (const s of steps) {
        const li = document.createElement('li'); li.innerHTML = s;
        ol.appendChild(li); scroll();
        await wait(260);
      }
      const doc = buildDoc(intent);
      const li = document.createElement('li');
      li.innerHTML = `Scene ${doc.scenes.length}장 생성 완료 ✓`;
      ol.appendChild(li);

      /* 결과 카드 */
      const card = add('bot', `
        <div class="ai-result">
          <div class="thumb">${M.sceneThumb(doc.scenes[0])}</div>
          <div class="inf">
            <b>${M.esc(doc.title)}</b>
            <small>${M.esc(intent.typeName)} · ${M.esc(intent.style)} · Scene ${doc.scenes.length}장 — AI 초안 (Placeholder)</small>
            <div class="row">${M.Button({ label: 'Editor에서 열기', size: 'sm', attrs: 'data-ai-open' })}${M.Button({ label: '다시 만들기', kind: 'secondary', size: 'sm', attrs: 'data-ai-redo' })}</div>
          </div>
        </div>`);
      card.querySelector('[data-ai-open]').onclick = () => {
        if (opts.onDone) opts.onDone(doc, intent);
        else { PG.openEditorDoc(doc); }
      };
      card.querySelector('[data-ai-redo]').onclick = () => run(prompt);
      return { doc, intent };
    }

    function send() {
      const v = input.value.trim();
      if (!v) return;
      input.value = '';
      run(v);
    }
    root.querySelector('[data-ai-send]').onclick = send;
    input.onkeydown = (e) => { if (e.key === 'Enter') send(); };
    root.querySelectorAll('[data-ai-ex]').forEach((b) => b.onclick = () => { input.value = b.dataset.aiEx; send(); });
    root.querySelectorAll('[data-ai-act]').forEach((b) => b.onclick = () => {
      add('me', M.esc(b.textContent));
      setTimeout(() => add('bot', ACTION_REPLY[b.dataset.aiAct] || '준비 중이에요.'), 200);
    });

    return { run };
  }

  return { analyze, buildDoc, matchTemplate, mountChat, ACTIONS };
})();

/* ---------------- #/ai 화면 (3단) ---------------- */
(() => {
  const M = window.MK;
  const AI = window.MK_AI;

  const S = {
    recents: [],   /* { title, typeName } 세션 한정 */
    saved: [       /* 저장된 프롬프트 — placeholder 시드 */
      '우리 반 학급 규칙 포스터 만들어줘',
      '독서의 달 행사 카드뉴스 만들어줘',
      '과학의 날 발표자료 만들어줘',
    ],
    intent: null,  /* 마지막 분석 결과 — 우측 제안 패널 소스 */
  };

  function renderLeft() {
    return `
      <div class="ai-side">
        ${M.Button({ label: '＋ 새 프로젝트 만들기', attrs: 'data-ai-new', kind: '' })}
        <div class="grp"><h4>최근 AI 작업</h4>
          ${S.recents.length ? S.recents.map((r, i) => `<button class="itm" data-ai-recent="${i}"><b>${M.esc(r.title)}</b><small>${M.esc(r.typeName)}</small></button>`).join('') : '<p class="mut">아직 없어요 — 오른쪽에서<br>첫 작업을 시작해 보세요</p>'}
        </div>
        <div class="grp"><h4>저장된 프롬프트</h4>
          ${S.saved.map((p, i) => `<button class="itm" data-ai-saved="${i}">${M.esc(p)}</button>`).join('')}
        </div>
      </div>`;
  }

  function renderSuggest() {
    const it = S.intent;
    if (!it) return `<div class="ai-suggest empty"><span>✦</span><p>요청을 입력하면<br>여기에 AI 제안이 떠요</p></div>`;
    const tpl = AI.matchTemplate(it);
    const imgs = (window.MK_ASSETS.ASSETS.filter((a) => a.category === 'images')).slice(0, 3);
    const icons = (window.MK_ASSETS.ASSETS.filter((a) => a.category === 'icons')).slice(0, 4);
    return `<div class="ai-suggest">
      <div class="sg"><h4>추천 템플릿</h4>${M.TemplateCard(tpl, `data-ai-tpl="${tpl.templateId}"`)}</div>
      <div class="sg"><h4>추천 스타일</h4><div class="pillrow"><span class="pill on">${M.esc(it.style)}</span><span class="pill">미니멀</span><span class="pill">프리미엄</span></div></div>
      <div class="sg"><h4>추천 색상</h4><div class="swrow">${it.palette.map((c) => `<span class="sw" style="background:${c}" title="${c}"></span>`).join('')}</div></div>
      <div class="sg"><h4>추천 이미지</h4><div class="mini3">${imgs.map((a) => M.assetThumb(a)).join('')}</div></div>
      <div class="sg"><h4>추천 아이콘</h4><div class="mini4">${icons.map((a) => M.assetThumb(a)).join('')}</div></div>
      <div class="sg"><h4>추천 애니메이션</h4><p class="mut2">${M.esc(it.anim)}</p></div>
      <p class="ph-note">전부 Placeholder 제안 — AI API 연결 후 실추천으로 교체</p>
    </div>`;
  }

  window.MK_SCREENS.ai = {
    title: 'AI Studio', variants: ['v1'],
    render() {
      return `<span class="pg-note">AI Studio v1 — API 미연결 · Placeholder 시뮬레이션 (AI UX 검증용)</span>
        <div class="ai-shell">
          <aside class="ai-left" id="aiLeft">${renderLeft()}</aside>
          <section class="ai-mid" id="aiMid"></section>
          <aside class="ai-right" id="aiRight">${renderSuggest()}</aside>
        </div>`;
    },
    mount(root) {
      const rLeft = () => { root.querySelector('#aiLeft').innerHTML = renderLeft(); wireLeft(); };
      const rRight = () => { root.querySelector('#aiRight').innerHTML = renderSuggest(); };

      const chat = AI.mountChat(root.querySelector('#aiMid'), {
        onIntent(intent) { S.intent = intent; rRight(); },
        onDone(doc, intent) {
          S.recents = [{ title: doc.title, typeName: intent.typeName }, ...S.recents].slice(0, 6);
          PG.openEditorDoc(doc);
        },
      });

      function wireLeft() {
        const nw = root.querySelector('[data-ai-new]');
        if (nw) nw.onclick = () => root.querySelector('[data-ai-in]')?.focus();
        root.querySelectorAll('[data-ai-saved]').forEach((b) => b.onclick = () => chat.run(S.saved[b.dataset.aiSaved]));
        root.querySelectorAll('[data-ai-recent]').forEach((b) => b.onclick = () => {
          const r = S.recents[b.dataset.aiRecent];
          chat.run(`${r.title} 다시 만들어줘`);
        });
      }
      wireLeft();
    },
  };
})();

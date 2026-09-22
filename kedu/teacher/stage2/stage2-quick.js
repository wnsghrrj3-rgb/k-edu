/* ============================================================================
   stage2-quick.js — 케이티처 2세대 ⚡빠른 활동 12종 (2026-09-22 신설, 헌법 v4 §5)
   · 생성기·카탈로그·iframe 없이, 교사가 낱말 몇 줄만 넣으면 바로 TV 에 서는 활동.
   · 낱말은 이 차시 슬라이드 글에서 자동으로 골라 채워 두고(교사가 고쳐 씀), 이름은 케이에듀 학급 명단에서.
   · 수첩(byType) 없음 — 끝나면 「결과 한 줄」만 토스트·기록. 정답이 있는 활동은 정답을 화면에 미리 그리지 않는다(답 미노출).
   · 1600×900 캔버스를 통째로 축소·확대(무대와 같은 규칙) · 큰 글자 · 탭 조작 · 우상단 = 호스트 구역(닫기만).
   ============================================================================ */
(function (global) {
  'use strict';
  const doc = global.document;
  const W = 1600, H = 900;
  const STOP = new Set(['그리고', '그래서', '하지만', '어떻게', '무엇을', '생각해', '봅시다', '해요', '보세요', '있어요', '없어요', '함께', '오늘', '우리', '이번', '다음', '차시', '문제', '정답', '활동', '수업', '학년', '단원', '알아보기', '알아봐요', '말해', '말하기', '보기', '위해', '때문', '대해', '것을', '것이', '수가', '수를', '모두', '가장', '다시', '한번', '여러', '어떤', '이렇게', '저렇게', '그렇게', '그러면', '그런데', '먼저', '나중', '이제', '지금', '선생님', '친구', '친구들', '아이들', '학생', '문장', '낱말', '글자', '그림', '사진', '슬라이드']);
  const rnd = (seed) => { let s = (seed || Date.now()) % 2147483647; if (s <= 0) s += 2147483646; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const lsGet = (k, d) => { try { const v = global.localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const lsSet = (k, v) => { try { global.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const shuffle = (arr, r) => { const a = arr.slice(); r = r || Math.random; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const lines = t => String(t || '').split(/\n/).map(s => s.trim()).filter(Boolean);
  const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const chosung = w => Array.from(w).map(c => { const code = c.charCodeAt(0) - 0xAC00; return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : (/\s/.test(c) ? ' ' : '○'); }).join('');
  const DUEUM = { '녀': '여', '뇨': '요', '뉴': '유', '니': '이', '랴': '야', '려': '여', '례': '예', '료': '요', '류': '유', '리': '이', '라': '나', '래': '내', '로': '노', '뢰': '뇌', '루': '누', '르': '느' };

  // ───────────────────────── 재료: 이 차시 낱말 · 학급 명단 ─────────────────────────
  function harvest(stage) {
    const seen = {}; const walk = v => { if (typeof v === 'string') { (v.replace(/<[^>]+>/g, ' ').match(/[가-힣]{2,5}/g) || []).forEach(w => { if (!STOP.has(w)) seen[w] = (seen[w] || 0) + 1; }); } else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.keys(v).forEach(k => { if (k !== 'tnote' && k !== 'note') walk(v[k]); }); };
    (stage.slides || []).forEach(s => walk(s.data || {}));
    return Object.keys(seen).sort((a, b) => seen[b] - seen[a] || a.length - b.length).slice(0, 16);
  }
  function roster(stage) { return (stage && stage.classNames && stage.classNames.length) ? stage.classNames.slice() : Array.from({ length: 24 }, (_, i) => (i + 1) + '번'); }

  // ───────────────────────── 호스트(캔버스) ─────────────────────────
  const Q = { list: [], open: false, cur: null, stage: null };
  function ensureHost() {
    let h = doc.getElementById('kq-host'); if (h) return h;
    h = doc.createElement('div'); h.id = 'kq-host'; h.className = 'kq-host';
    h.innerHTML = '<div class="kq-hud"><span class="kq-h-t"></span><span class="sp"></span><span class="kq-h-line"></span><button data-kq="end">끝내기</button><button data-kq="close">✕</button></div><div class="kq-canvas" id="kq-canvas"><div class="kq-paper" id="kq-paper"></div></div>';
    doc.body.appendChild(h);
    h.addEventListener('click', e => { const b = e.target.closest('[data-kq]'); if (!b) return; const k = b.getAttribute('data-kq'); if (k === 'close') Q.close(false); else if (k === 'end') Q.close(true); });
    if (global.addEventListener) { global.addEventListener('resize', fit); doc.addEventListener('keydown', e => { if (!Q.open) return; if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); Q.close(false); } }, true); }
    return h;
  }
  function fit() { const c = doc.getElementById('kq-canvas'); if (!c || !Q.open) return; const vw = global.innerWidth || W, vh = (global.innerHeight || H) - 56; const k = Math.min(vw / W, vh / H); c.style.transform = 'translate(-50%,-50%) scale(' + k + ')'; }
  Q.start = function (act, cfg, stage) {
    Q.stage = stage || Q.stage; const h = ensureHost();
    // 종이를 새로 갈아 끼운다 — 앞 활동이 걸어 둔 클릭 리스너가 남지 않게(한 판에 한 활동)
    const old = doc.getElementById('kq-paper'); const paper = old.cloneNode(false); paper.innerHTML = ''; old.parentNode.replaceChild(paper, old); paper.className = 'kq-paper kq-' + act.id;
    h.querySelector('.kq-h-t').textContent = act.icon + ' ' + act.name; h.querySelector('.kq-h-line').textContent = '';
    h.classList.add('on'); doc.body.classList.add('kact-open'); Q.open = true; Q.cur = { act, cfg, at: Date.now(), summary: null }; fit();
    const api = {
      paper, cfg, rng: rnd(cfg.seed), stage: Q.stage,
      status: t => { const el = h.querySelector('.kq-h-line'); if (el) el.textContent = t || ''; },
      pop: () => { const s = Q.stage; if (s && s.sound && s.pop) s.pop(); },
      good: () => { const s = Q.stage; if (s && s.sound && s.tone) { s.tone(660, 0.08, 0.05, 'triangle'); setTimeout(() => s.tone(880, 0.12, 0.05, 'triangle'), 90); } },
      bad: () => { const s = Q.stage; if (s && s.sound && s.tone) s.tone(220, 0.16, 0.05, 'sawtooth'); },
      finish: line => { if (Q.cur) Q.cur.summary = line; },
      say: (text, lang) => { try { if (!global.speechSynthesis) return false; const u = new global.SpeechSynthesisUtterance(text); u.lang = lang || 'ko-KR'; u.rate = 0.9; global.speechSynthesis.cancel(); global.speechSynthesis.speak(u); return true; } catch (e) { return false; } }
    };
    try { act.run(paper, cfg, api); } catch (e) { paper.innerHTML = '<div class="kq-err">😢 활동을 그리지 못했어요<br><small>' + esc(e && e.message) + '</small></div>'; }
    return api;
  };
  Q.close = function (ended) {
    if (!Q.open) return; const h = doc.getElementById('kq-host'); const c = Q.cur; Q.open = false; Q.cur = null;
    h.classList.remove('on'); doc.body.classList.remove('kact-open'); doc.getElementById('kq-paper').innerHTML = '';
    if (global.speechSynthesis) { try { global.speechSynthesis.cancel(); } catch (e) { } }
    const line = c && c.summary; const st = Q.stage;
    if (c) { const arr = lsGet('kt2_quick_log', []); arr.push({ at: new Date().toISOString().slice(0, 16), slug: st ? st.slug : '', key: st ? st.key : '', id: c.act.id, line: line || '', sec: Math.round((Date.now() - c.at) / 1000) }); lsSet('kt2_quick_log', arr.slice(-60)); }
    if (st && st.toast) st.toast(line ? c.act.icon + ' ' + line : '활동을 닫았어요');
  };

  // ───────────────────────── 런처 타일 + 준비 화면 ─────────────────────────
  Q.tiles = function () {
    return '<div class="kq-tiles">' + Q.list.map(a => '<button class="kq-tile" data-q="' + a.id + '"><span class="kq-ic">' + a.icon + '</span><span class="kq-nm">' + esc(a.name) + '</span><span class="kq-ds">' + esc(a.desc) + '</span><span class="kq-mn">⏱ ' + a.minutes + '분 · ' + esc(a.needs) + '</span></button>').join('') + '</div><div class="kq-setup"></div>';
  };
  Q.bindTiles = function (root, stage) {
    Q.stage = stage; root.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { root.querySelectorAll('.kq-tile').forEach(t => t.classList.toggle('on', t === b)); Q.paintSetup(root.querySelector('.kq-setup'), Q.list.find(a => a.id === b.getAttribute('data-q')), stage); }));
  };
  Q.memKey = (id, stage) => 'kt2_quick_' + id + '_' + (stage ? stage.slug + '_' + stage.key : 'x');
  Q.paintSetup = function (box, act, stage) {
    if (!box || !act) return; const saved = lsGet(Q.memKey(act.id, stage), null);
    const fields = act.setup(stage, saved || {});
    box.innerHTML = '<div class="kq-form"><h4>' + act.icon + ' ' + esc(act.name) + ' <small>' + esc(act.help || '') + '</small></h4>' + fields.map(f => {
      if (f.type === 'text') return '<label class="kq-f"><span>' + esc(f.label) + '</span><textarea data-f="' + f.key + '" rows="' + (f.rows || 6) + '" placeholder="' + esc(f.ph || '') + '">' + esc(f.value || '') + '</textarea>' + (f.hint ? '<small>' + esc(f.hint) + '</small>' : '') + '</label>';
      if (f.type === 'chips') return '<div class="kq-f row" data-f="' + f.key + '"><span>' + esc(f.label) + '</span>' + f.options.map(o => '<button class="kact-chip' + (String(o.v) === String(f.value) ? ' on' : '') + '" data-v="' + esc(o.v) + '">' + esc(o.l) + '</button>').join('') + '</div>';
      return '';
    }).join('') + '<div class="kq-f-b"><button class="btn" data-kqs="fill">↻ 이 차시 낱말로 다시 채우기</button><span class="sp"></span><button class="btn main" data-kqs="go">▶ 시작</button></div><div class="kq-f-err"></div></div>';
    box.querySelectorAll('.kq-f.row').forEach(r => r.querySelectorAll('.kact-chip').forEach(ch => ch.addEventListener('click', () => { r.querySelectorAll('.kact-chip').forEach(c => c.classList.remove('on')); ch.classList.add('on'); })));
    const read = () => { const cfg = { seed: 1 + Math.floor(Math.random() * 999999) }; box.querySelectorAll('[data-f]').forEach(el => { const k = el.getAttribute('data-f'); if (el.tagName === 'TEXTAREA') cfg[k] = el.value; else { const on = el.querySelector('.kact-chip.on'); cfg[k] = on ? on.getAttribute('data-v') : null; } }); return cfg; };
    box.querySelector('[data-kqs="fill"]').addEventListener('click', () => { lsSet(Q.memKey(act.id, stage), null); Q.paintSetup(box, act, stage); });
    box.querySelector('[data-kqs="go"]').addEventListener('click', () => {
      const cfg = read(); const err = act.check ? act.check(cfg) : null; const e = box.querySelector('.kq-f-err');
      if (err) { e.textContent = '⚠ ' + err; return; } e.textContent = '';
      lsSet(Q.memKey(act.id, stage), cfg); if (global.KT2_ACTIVITY) global.KT2_ACTIVITY.closeLauncher(); Q.start(act, cfg, stage);
    });
  };
  const wordsField = (stage, saved, key, label, rows) => ({ type: 'text', key: key || 'words', label: label || '낱말 (한 줄에 하나)', rows: rows || 8, value: saved[key || 'words'] != null ? saved[key || 'words'] : harvest(stage).join('\n'), hint: '이 차시 슬라이드에서 골라 뒀어요 — 고쳐 쓰거나 지우고 다시 넣어요' });
  const pairsField = (stage, saved, label) => ({ type: 'text', key: 'pairs', label: label || '짝 (왼쪽 = 오른쪽, 한 줄에 한 쌍)', rows: 8, value: saved.pairs != null ? saved.pairs : harvest(stage).slice(0, 6).map(w => w + ' = ' + chosung(w)).join('\n'), hint: '예) 사과 = 🍎 · 3+4 = 7 · 물 = 액체' });
  const parsePairs = t => lines(t).map(l => l.split(/\s*=\s*/)).filter(p => p.length >= 2 && p[0] && p[1]).map(p => ({ a: p[0].trim(), b: p.slice(1).join('=').trim() }));
  const big = (t, cls) => '<div class="kq-big ' + (cls || '') + '">' + esc(t) + '</div>';
  const ctr = (i, n) => '<div class="kq-counter"><b>' + i + '</b> / ' + n + '</div>';
  const btnrow = (arr) => '<div class="kq-btns">' + arr.map(b => '<button class="kq-btn' + (b.main ? ' main' : '') + (b.dis ? ' dis' : '') + '" data-b="' + b.k + '">' + b.l + '</button>').join('') + '</div>';
  const bind = (root, fn) => { root.addEventListener('click', e => { const b = e.target.closest('[data-b]'); if (b && !b.classList.contains('dis')) fn(b.getAttribute('data-b'), b, e); }); };

  // ───────────────────────── 1. 빙고 ─────────────────────────
  Q.list.push({
    id: 'bingo', icon: '🎯', name: '빙고', desc: '낱말을 부르면 우리 반 판에 표시, 줄이 되면 빙고', minutes: 6, needs: '낱말 9개↑', help: '학생은 종이에 자기 빙고판을 그려요. TV 는 부른 낱말과 「우리 반 판」을 보여 줘요.',
    setup: (st, sv) => [wordsField(st, sv), { type: 'chips', key: 'size', label: '판 크기', value: sv.size || 3, options: [{ v: 3, l: '3×3' }, { v: 4, l: '4×4' }, { v: 5, l: '5×5' }] }],
    check: c => { const n = lines(c.words).length, s = +c.size || 3; return n < s * s ? '낱말이 ' + s * s + '개는 있어야 해요 (지금 ' + n + '개)' : null; },
    run(root, cfg, api) {
      const words = lines(cfg.words); const size = +cfg.size || 3; const board = shuffle(words, api.rng).slice(0, size * size); const called = []; const marked = {};
      const linesOf = () => { const on = (r, c) => marked[board[r * size + c]]; let n = 0; for (let r = 0; r < size; r++) if (Array.from({ length: size }, (_, c) => on(r, c)).every(Boolean)) n++; for (let c = 0; c < size; c++) if (Array.from({ length: size }, (_, r) => on(r, c)).every(Boolean)) n++; if (Array.from({ length: size }, (_, i) => on(i, i)).every(Boolean)) n++; if (Array.from({ length: size }, (_, i) => on(i, size - 1 - i)).every(Boolean)) n++; return n; };
      const paint = () => {
        const rest = words.filter(w => called.indexOf(w) < 0); const last = called[called.length - 1];
        root.innerHTML = '<div class="kq-two"><div class="kq-left">' + (last ? big(last, 'call') : big('낱말을 뽑아요', 'dim')) + '<div class="kq-strip">' + called.map(w => '<span>' + esc(w) + '</span>').join('') + '</div>' + btnrow([{ k: 'draw', l: '🎲 다음 낱말 뽑기', main: true, dis: !rest.length }]) + '<div class="kq-pool">' + rest.map(w => '<button class="kq-word" data-b="w:' + esc(w) + '">' + esc(w) + '</button>').join('') + '</div></div>'
          + '<div class="kq-right"><div class="kq-cap">우리 반 판 · 빙고 <b>' + linesOf() + '</b>줄</div><div class="kq-bingo n' + size + '">' + board.map(w => '<div class="' + (marked[w] ? 'on' : '') + '">' + esc(w) + '</div>').join('') + '</div></div></div>';
        api.status('부른 낱말 ' + called.length + '/' + words.length + ' · 빙고 ' + linesOf() + '줄'); api.finish('빙고 — 낱말 ' + called.length + '개 부름 · 우리 반 판 ' + linesOf() + '줄');
      };
      bind(root, (k) => { const rest = words.filter(w => called.indexOf(w) < 0); let w = null; if (k === 'draw') w = rest[Math.floor(api.rng() * rest.length)]; else if (k.indexOf('w:') === 0) w = k.slice(2); if (!w || called.indexOf(w) >= 0) return; called.push(w); marked[w] = board.indexOf(w) >= 0; const before = linesOf(); paint(); if (linesOf() > before) api.good(); else api.pop(); });
      paint();
    }
  });

  // ───────────────────────── 2. 초성 퀴즈 ─────────────────────────
  Q.list.push({
    id: 'chosung', icon: '🔤', name: '초성 퀴즈', desc: '초성만 보고 낱말 맞히기 — 힌트 한 글자씩', minutes: 5, needs: '낱말 5개↑', help: '초성 → 힌트(첫 글자) → 정답 순으로 열어요.',
    setup: (st, sv) => [wordsField(st, sv)], check: c => lines(c.words).length < 3 ? '낱말이 3개는 있어야 해요' : null,
    run(root, cfg, api) {
      const words = shuffle(lines(cfg.words), api.rng); let i = 0, hint = 0, open = false, got = 0;
      const paint = () => { const w = words[i]; const shown = open ? w : Array.from(w).map((c, k) => k < hint ? c : chosung(c)).join(''); root.innerHTML = ctr(i + 1, words.length) + big(shown, open ? 'ans' : 'cho') + btnrow([{ k: 'hint', l: '💡 힌트 한 글자', dis: open || hint >= w.length - 1 }, { k: 'open', l: '✅ 정답 공개', main: !open, dis: open }, { k: 'got', l: '👍 맞혔어요', dis: !open }, { k: 'next', l: '다음 ▶', dis: i >= words.length - 1 }]); api.status((i + 1) + '/' + words.length + ' · 맞힘 ' + got); api.finish('초성 퀴즈 — ' + words.length + '문제 중 ' + got + '개 맞힘'); };
      bind(root, k => { if (k === 'hint') { hint++; api.pop(); } else if (k === 'open') { open = true; api.pop(); } else if (k === 'got') { got++; api.good(); k = 'next'; } if (k === 'next' && i < words.length - 1) { i++; hint = 0; open = false; } paint(); });
      paint();
    }
  });

  // ───────────────────────── 3. OX 골든벨 ─────────────────────────
  Q.list.push({
    id: 'ox', icon: '⭕', name: 'OX 골든벨', desc: '맞으면 O, 틀리면 X — 정답은 눌러야 열려요', minutes: 6, needs: '문장 5개↑', help: '한 줄에 「문장 | O」 또는 「문장 | X | 왜 그런지」. 정답은 공개 전까지 화면에 없어요.',
    setup: (st, sv) => [{ type: 'text', key: 'items', label: '문장 | O·X | (해설)', rows: 8, value: sv.items != null ? sv.items : harvest(st).slice(0, 4).map((w, k) => '「' + w + '」은(는) 오늘 배운 말이다 | ' + (k % 2 ? 'X' : 'O')).join('\n'), hint: '예) 삼각형은 변이 세 개다 | O | 변이 세 개면 삼각형' }],
    check: c => { const it = lines(c.items).filter(l => /\|\s*[OXox○×]/.test(l)); return it.length < 2 ? '「문장 | O」 꼴로 2줄은 있어야 해요' : null; },
    run(root, cfg, api) {
      const items = lines(cfg.items).map(l => l.split('|').map(s => s.trim())).filter(p => p.length >= 2 && /^[OXox○×]$/.test(p[1])).map(p => ({ q: p[0], a: /^[Oo○]$/.test(p[1]) ? 'O' : 'X', why: p[2] || '' }));
      let i = 0, open = false, oc = 0, xc = 0;
      const paint = () => { const it = items[i]; root.innerHTML = ctr(i + 1, items.length) + big(it.q, 'q') + '<div class="kq-ox">' + (open ? '<div class="kq-ox-ans ' + it.a + '">' + it.a + '</div>' + (it.why ? '<div class="kq-why">' + esc(it.why) + '</div>' : '') : '<div class="kq-ox-hold">O ? X</div><div class="kq-why dim">손으로 O 나 X 를 만들어요</div>') + '</div>' + btnrow([{ k: 'open', l: '✅ 정답 공개', main: !open, dis: open }, { k: 'next', l: '다음 ▶', dis: i >= items.length - 1 }]); api.status((i + 1) + '/' + items.length); api.finish('OX 골든벨 — ' + items.length + '문항 (O ' + oc + ' · X ' + xc + ')'); };
      bind(root, k => { if (k === 'open' && !open) { open = true; if (items[i].a === 'O') oc++; else xc++; api.good(); } else if (k === 'next' && i < items.length - 1) { i++; open = false; } paint(); });
      paint();
    }
  });

  // ───────────────────────── 4. 카드 짝짓기(기억) ─────────────────────────
  Q.list.push({
    id: 'memory', icon: '🃏', name: '카드 짝짓기', desc: '뒤집어 짝을 찾아요 — 두 팀 번갈아', minutes: 7, needs: '짝 4~8쌍', help: '「왼쪽 = 오른쪽」 짝. 같은 그림 짝이면 「사과 = 사과」.',
    setup: (st, sv) => [pairsField(st, sv), { type: 'chips', key: 'teams', label: '팀', value: sv.teams || 2, options: [{ v: 1, l: '반 전체' }, { v: 2, l: '두 팀' }] }],
    check: c => { const n = parsePairs(c.pairs).length; return n < 3 ? '짝이 3쌍은 있어야 해요' : n > 10 ? '짝은 10쌍까지만' : null; },
    run(root, cfg, api) {
      const pairs = parsePairs(cfg.pairs).slice(0, 10); const teams = +cfg.teams === 1 ? 1 : 2; const names = global.KT2_ACTIVITY ? global.KT2_ACTIVITY.teamNames() : ['케이팀', '듀팀'];
      const cards = shuffle(pairs.flatMap((p, k) => [{ k, t: p.a }, { k, t: p.b }]), api.rng); const st = { up: [], done: {}, turn: 0, score: [0, 0], tries: 0, lock: false };
      const cols = cards.length <= 8 ? 4 : cards.length <= 12 ? 4 : 5;
      const paint = () => { const left = pairs.length - Object.keys(st.done).length; root.innerHTML = (teams === 2 ? '<div class="kq-teams">' + names.map((n, k) => '<span class="' + (st.turn === k ? 'on' : '') + '">' + esc(n) + ' <b>' + st.score[k] + '</b></span>').join('<i>:</i>') + '</div>' : '<div class="kq-cap">시도 <b>' + st.tries + '</b>번</div>') + '<div class="kq-cards c' + cols + '">' + cards.map((c, i) => { const on = st.up.indexOf(i) >= 0 || st.done[c.k]; return '<button class="kq-card' + (on ? ' on' : '') + (st.done[c.k] ? ' done' : '') + '" data-b="c:' + i + '"><span class="f">?</span><span class="b">' + esc(c.t) + '</span></button>'; }).join('') + '</div>'; api.status('남은 짝 ' + left); api.finish('카드 짝짓기 — ' + pairs.length + '쌍 · 시도 ' + st.tries + '번' + (teams === 2 ? ' · ' + names[0] + ' ' + st.score[0] + ' : ' + st.score[1] + ' ' + names[1] : '')); if (!left) { root.innerHTML += '<div class="kq-done">🎉 짝을 다 찾았어요</div>'; api.good(); } };
      bind(root, k => { if (k.indexOf('c:') !== 0 || st.lock) return; const i = +k.slice(2); const c = cards[i]; if (st.done[c.k] || st.up.indexOf(i) >= 0 || st.up.length >= 2) return; st.up.push(i); api.pop(); paint(); if (st.up.length === 2) { st.tries++; const [a, b] = st.up.map(x => cards[x]); if (a.k === b.k) { st.done[a.k] = true; st.score[st.turn]++; st.up = []; api.good(); paint(); } else { st.lock = true; setTimeout(() => { st.up = []; st.lock = false; if (teams === 2) st.turn = 1 - st.turn; paint(); }, 900); } } });
      paint();
    }
  });

  // ───────────────────────── 5. 룰렛 뽑기 ─────────────────────────
  Q.list.push({
    id: 'roulette', icon: '🎡', name: '룰렛 뽑기', desc: '돌려서 발표자·문제·모둠 뽑기', minutes: 3, needs: '이름·항목', help: '비워 두면 우리 반 명단으로 돌아요. 뽑힌 것은 빠져요.',
    setup: (st, sv) => [{ type: 'text', key: 'items', label: '항목 (비우면 학급 명단)', rows: 6, value: sv.items != null ? sv.items : '', ph: roster(st).slice(0, 5).join('\n') + '\n…' }, { type: 'chips', key: 'remove', label: '뽑힌 것', value: sv.remove || 1, options: [{ v: 1, l: '빼기' }, { v: 0, l: '남기기' }] }],
    run(root, cfg, api) {
      let items = lines(cfg.items); if (!items.length) items = roster(api.stage); const remove = String(cfg.remove) !== '0'; const picked = []; let angle = 0, spinning = false;
      const COL = ['#FF8A3D', '#4F8DF7', '#12B886', '#7C5CFF', '#2CB1D6', '#F2B534', '#EF5DA8', '#8BC34A'];
      const paint = () => { const pool = remove ? items.filter(x => picked.indexOf(x) < 0) : items; const n = pool.length; const grad = n ? 'conic-gradient(' + pool.map((x, i) => COL[i % COL.length] + ' ' + (360 * i / n) + 'deg ' + (360 * (i + 1) / n) + 'deg').join(',') + ')' : '#ccc';
        root.innerHTML = '<div class="kq-two"><div class="kq-left"><div class="kq-wheel-wrap"><div class="kq-pointer">▼</div><div class="kq-wheel" style="background:' + grad + ';transform:rotate(' + angle + 'deg)">' + pool.map((x, i) => '<span style="transform:rotate(' + (360 * (i + 0.5) / n) + 'deg) translateY(-190px) rotate(' + (-(360 * (i + 0.5) / n)) + 'deg)">' + esc(x.length > 6 ? x.slice(0, 6) + '…' : x) + '</span>').join('') + '</div></div>' + btnrow([{ k: 'spin', l: '🎡 돌리기', main: true, dis: !n || spinning }]) + '</div><div class="kq-right">' + (picked.length ? big(picked[picked.length - 1], 'call') : big('돌려 봐요', 'dim')) + '<div class="kq-cap">뽑힌 순서</div><div class="kq-strip">' + picked.map((x, i) => '<span>' + (i + 1) + '. ' + esc(x) + '</span>').join('') + '</div></div></div>';
        api.status('남은 ' + n + ' · 뽑힘 ' + picked.length); api.finish('룰렛 — ' + picked.length + '명(개) 뽑음' + (picked.length ? ': ' + picked.slice(0, 6).join(', ') + (picked.length > 6 ? ' …' : '') : '')); };
      bind(root, k => { if (k !== 'spin' || spinning) return; const pool = remove ? items.filter(x => picked.indexOf(x) < 0) : items; if (!pool.length) return; spinning = true; const n = pool.length; const idx = Math.floor(api.rng() * n); const target = 360 * 5 + (360 - (360 * (idx + 0.5) / n)); const start = angle % 360; const end = start + target; const t0 = Date.now(); const dur = 2600; api.pop();
        const wheel = root.querySelector('.kq-wheel'); const tick = () => { const p = Math.min(1, (Date.now() - t0) / dur); const e = 1 - Math.pow(1 - p, 3); angle = start + (end - start) * e; if (wheel) wheel.style.transform = 'rotate(' + angle + 'deg)'; if (p < 1) (global.requestAnimationFrame || setTimeout)(tick, 16); else { spinning = false; picked.push(pool[idx]); api.good(); angle = angle % 360; paint(); } }; tick(); });
      paint();
    }
  });

  // ───────────────────────── 6. 끝말잇기 ─────────────────────────
  Q.list.push({
    id: 'wordchain', icon: '🔗', name: '끝말잇기', desc: '아이들이 말한 낱말을 적으면 이어졌는지 판정', minutes: 5, needs: '시작 낱말', help: '학생이 말한 낱말을 교사가 적어요. 끝글자↔첫글자·중복을 판정해요.',
    setup: (st, sv) => [{ type: 'text', key: 'start', label: '시작 낱말', rows: 1, value: sv.start || (harvest(st)[0] || '학교') }, { type: 'chips', key: 'dueum', label: '두음법칙', value: sv.dueum || 1, options: [{ v: 1, l: '허용 (리→이)' }, { v: 0, l: '엄격' }] }, { type: 'chips', key: 'sec', label: '한 사람 시간', value: sv.sec || 0, options: [{ v: 0, l: '없음' }, { v: 10, l: '10초' }, { v: 20, l: '20초' }] }],
    check: c => !lines(c.start)[0] ? '시작 낱말을 적어요' : null,
    run(root, cfg, api) {
      const chain = [lines(cfg.start)[0]]; const dueum = String(cfg.dueum) !== '0'; const sec = +cfg.sec || 0; let msg = '', left = sec, tm = null;
      const okStart = (prev, w) => { const last = prev[prev.length - 1], first = w[0]; return first === last || (dueum && DUEUM[last] === first); };
      const paint = () => { const last = chain[chain.length - 1]; root.innerHTML = '<div class="kq-chain">' + chain.map((w, i) => '<span' + (i === chain.length - 1 ? ' class="last"' : '') + '>' + esc(w) + '</span>').join('<i>→</i>') + '</div>' + big('「' + last[last.length - 1] + '」' + (dueum && DUEUM[last[last.length - 1]] ? ' 또는 「' + DUEUM[last[last.length - 1]] + '」' : '') + ' 로 시작하는 낱말!', 'q') + (sec ? '<div class="kq-timer' + (left <= 3 ? ' hot' : '') + '">' + left + '</div>' : '') + '<div class="kq-inrow"><input class="kq-in" placeholder="아이가 말한 낱말" autocomplete="off"><button class="kq-btn main" data-b="add">잇기</button><button class="kq-btn" data-b="undo" ' + (chain.length < 2 ? 'disabled' : '') + '>한 칸 되돌리기</button></div><div class="kq-msg">' + esc(msg) + '</div>'; const inp = root.querySelector('.kq-in'); if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter') add(inp.value); e.stopPropagation(); }); } api.status('사슬 ' + chain.length + '개'); api.finish('끝말잇기 — 「' + chain[0] + '」부터 ' + chain.length + '개 이었어요'); };
      const add = v => { const w = (v || '').trim().replace(/\s+/g, ''); const prev = chain[chain.length - 1]; if (!w) return; if (!/^[가-힣]{2,}$/.test(w)) msg = '❌ 한글 두 글자 이상이어야 해요'; else if (!okStart(prev, w)) { msg = '❌ 「' + prev[prev.length - 1] + '」(으)로 시작해야 해요'; api.bad(); } else if (chain.indexOf(w) >= 0) { msg = '❌ 이미 나온 낱말이에요'; api.bad(); } else { chain.push(w); msg = '⭕ ' + w; api.good(); left = sec; } paint(); };
      bind(root, k => { if (k === 'add') add(root.querySelector('.kq-in').value); else if (k === 'undo' && chain.length > 1) { chain.pop(); msg = '한 칸 되돌렸어요'; paint(); } });
      if (sec) tm = setInterval(() => { if (!Q.open) { clearInterval(tm); return; } left = Math.max(0, left - 1); const t = root.querySelector('.kq-timer'); if (t) { t.textContent = left; t.classList.toggle('hot', left <= 3); } if (left === 0) { msg = '⏰ 시간! 다음 사람'; left = sec; paint(); } }, 1000);
      paint();
    }
  });

  // ───────────────────────── 7. 분류하기 ─────────────────────────
  Q.list.push({
    id: 'classify', icon: '🗂️', name: '분류하기', desc: '낱말을 알맞은 칸으로 — 채점하면 초록·빨강', minutes: 6, needs: '범주 2~4개', help: '한 줄에 「범주: 항목, 항목, 항목」.',
    setup: (st, sv) => [{ type: 'text', key: 'groups', label: '범주: 항목, 항목 …', rows: 6, value: sv.groups != null ? sv.groups : (() => { const w = harvest(st); return '첫째 칸: ' + w.slice(0, 3).join(', ') + '\n둘째 칸: ' + w.slice(3, 6).join(', '); })(), hint: '예) 동물: 개, 고양이, 소  /  식물: 소나무, 장미' }],
    check: c => { const g = lines(c.groups).filter(l => l.indexOf(':') > 0); return g.length < 2 ? '범주가 2개는 있어야 해요' : g.length > 4 ? '범주는 4개까지' : null; },
    run(root, cfg, api) {
      const groups = lines(cfg.groups).map(l => { const i = l.indexOf(':'); return { name: l.slice(0, i).trim(), items: l.slice(i + 1).split(/[,、·]/).map(s => s.trim()).filter(Boolean) }; }).filter(g => g.name && g.items.length).slice(0, 4);
      const all = shuffle(groups.flatMap((g, gi) => g.items.map(t => ({ t, gi }))), api.rng); const put = {}; let sel = null, checked = false;
      const paint = () => { const pool = all.filter((x, i) => put[i] == null); root.innerHTML = '<div class="kq-pool big">' + pool.map(x => { const i = all.indexOf(x); return '<button class="kq-word' + (sel === i ? ' sel' : '') + '" data-b="p:' + i + '">' + esc(x.t) + '</button>'; }).join('') + (pool.length ? '' : '<span class="dim">다 넣었어요 — 채점해 봐요</span>') + '</div><div class="kq-bins n' + groups.length + '">' + groups.map((g, gi) => '<div class="kq-bin" data-b="g:' + gi + '"><div class="kq-bin-h">' + esc(g.name) + '</div>' + all.map((x, i) => put[i] === gi ? '<button class="kq-word' + (checked ? (x.gi === gi ? ' ok' : ' ng') : '') + '" data-b="u:' + i + '">' + esc(x.t) + '</button>' : '').join('') + '</div>').join('') + '</div>' + btnrow([{ k: 'check', l: '✅ 채점', main: true, dis: checked || pool.length > 0 }, { k: 'reset', l: '다시' }]); const right = all.filter((x, i) => put[i] === x.gi).length; api.status(checked ? '맞음 ' + right + '/' + all.length : '남은 ' + pool.length); api.finish('분류하기 — ' + all.length + '개 중 ' + right + '개 맞음' + (checked ? '' : ' (채점 전)')); };
      bind(root, k => { if (k.indexOf('p:') === 0) { sel = sel === +k.slice(2) ? null : +k.slice(2); api.pop(); } else if (k.indexOf('g:') === 0 && sel != null) { put[sel] = +k.slice(2); sel = null; api.pop(); } else if (k.indexOf('u:') === 0 && !checked) { delete put[+k.slice(2)]; } else if (k === 'check') { checked = true; const right = all.filter((x, i) => put[i] === x.gi).length; if (right === all.length) api.good(); else api.bad(); } else if (k === 'reset') { Object.keys(put).forEach(i => delete put[i]); checked = false; sel = null; } paint(); });
      paint();
    }
  });

  // ───────────────────────── 8. 선 잇기 ─────────────────────────
  Q.list.push({
    id: 'linematch', icon: '🧵', name: '선 잇기', desc: '왼쪽과 오른쪽을 탭·탭으로 이어요', minutes: 5, needs: '짝 3~8쌍', help: '「왼쪽 = 오른쪽」 짝. 오른쪽은 섞여요.',
    setup: (st, sv) => [pairsField(st, sv)], check: c => { const n = parsePairs(c.pairs).length; return n < 3 ? '짝이 3쌍은 있어야 해요' : n > 8 ? '짝은 8쌍까지' : null; },
    run(root, cfg, api) {
      const pairs = parsePairs(cfg.pairs).slice(0, 8); const order = shuffle(pairs.map((_, i) => i), api.rng); const link = {}; let sel = null, checked = false; const n = pairs.length; const rowH = Math.min(96, 640 / n);
      const paint = () => { const y = i => 120 + i * rowH + rowH / 2; const svg = '<svg class="kq-lines" viewBox="0 0 1600 900">' + Object.keys(link).map(l => { const r = order.indexOf(link[l]); const ok = pairs[+l] && link[l] === +l; return '<line x1="560" y1="' + y(+l) + '" x2="1040" y2="' + y(r) + '" class="' + (checked ? (ok ? 'ok' : 'ng') : '') + '"/>'; }).join('') + '</svg>';
        root.innerHTML = svg + '<div class="kq-col l">' + pairs.map((p, i) => '<button class="kq-word' + (sel === i ? ' sel' : '') + (link[i] != null ? ' linked' : '') + '" style="height:' + (rowH - 14) + 'px" data-b="l:' + i + '">' + esc(p.a) + '</button>').join('') + '</div><div class="kq-col r">' + order.map(j => '<button class="kq-word' + (Object.values(link).indexOf(j) >= 0 ? ' linked' : '') + '" style="height:' + (rowH - 14) + 'px" data-b="r:' + j + '">' + esc(pairs[j].b) + '</button>').join('') + '</div>' + btnrow([{ k: 'check', l: '✅ 채점', main: true, dis: checked || Object.keys(link).length < n }, { k: 'reset', l: '다시' }]);
        const right = Object.keys(link).filter(l => link[l] === +l).length; api.status(checked ? '맞음 ' + right + '/' + n : '이은 선 ' + Object.keys(link).length + '/' + n); api.finish('선 잇기 — ' + n + '쌍 중 ' + right + '쌍 맞음' + (checked ? '' : ' (채점 전)')); };
      bind(root, k => { if (checked && k !== 'reset') return; if (k.indexOf('l:') === 0) { const i = +k.slice(2); if (link[i] != null) delete link[i]; sel = sel === i ? null : i; api.pop(); } else if (k.indexOf('r:') === 0 && sel != null) { const j = +k.slice(2); Object.keys(link).forEach(l => { if (link[l] === j) delete link[l]; }); link[sel] = j; sel = null; api.pop(); } else if (k === 'check') { checked = true; const right = Object.keys(link).filter(l => link[l] === +l).length; if (right === n) api.good(); else api.bad(); } else if (k === 'reset') { Object.keys(link).forEach(l => delete link[l]); sel = null; checked = false; } paint(); });
      paint();
    }
  });

  // ───────────────────────── 9. 빈칸 채우기 ─────────────────────────
  Q.list.push({
    id: 'blank', icon: '✏️', name: '빈칸 채우기', desc: '문장의 ___ 를 보기에서 골라 채워요', minutes: 5, needs: '문장 3개↑', help: '한 줄에 「문장 ___ 문장 | 답」. 보기는 답들을 섞어요.',
    setup: (st, sv) => [{ type: 'text', key: 'items', label: '문장 (빈칸은 ___) | 답', rows: 8, value: sv.items != null ? sv.items : harvest(st).slice(0, 4).map(w => '오늘 배운 낱말 ___ 을(를) 써 봐요 | ' + w).join('\n'), hint: '예) 삼각형은 변이 ___ 개다 | 3' }],
    check: c => lines(c.items).filter(l => l.indexOf('|') > 0 && l.indexOf('___') >= 0).length < 2 ? '「___ 가 있는 문장 | 답」이 2줄은 있어야 해요' : null,
    run(root, cfg, api) {
      const items = lines(cfg.items).map(l => l.split('|')).filter(p => p.length >= 2 && p[0].indexOf('___') >= 0).map(p => ({ q: p[0].trim(), a: p[1].trim() })); const pool = shuffle(items.map(x => x.a), api.rng); const fill = {}; let sel = null, checked = false;
      const paint = () => { const used = Object.values(fill); root.innerHTML = '<div class="kq-sents">' + items.map((it, i) => '<div class="kq-sent">' + esc(it.q).split('___').map((seg, k, arr) => seg + (k < arr.length - 1 ? '<button class="kq-blank' + (sel === i ? ' sel' : '') + (fill[i] != null ? ' filled' : '') + (checked ? (fill[i] === it.a ? ' ok' : ' ng') : '') + '" data-b="s:' + i + '">' + (fill[i] != null ? esc(fill[i]) : '　　') + '</button>' : '')).join('') + '</div>').join('') + '</div><div class="kq-pool big">' + pool.map((w, k) => '<button class="kq-word' + (used.indexOf(w) >= 0 ? ' used' : '') + '" data-b="w:' + k + '">' + esc(w) + '</button>').join('') + '</div>' + btnrow([{ k: 'check', l: '✅ 채점', main: true, dis: checked || Object.keys(fill).length < items.length }, { k: 'reset', l: '다시' }]); const right = items.filter((it, i) => fill[i] === it.a).length; api.status(checked ? '맞음 ' + right + '/' + items.length : '채운 칸 ' + Object.keys(fill).length + '/' + items.length); api.finish('빈칸 채우기 — ' + items.length + '칸 중 ' + right + '칸 맞음' + (checked ? '' : ' (채점 전)')); };
      bind(root, k => { if (checked && k !== 'reset') return; if (k.indexOf('s:') === 0) { const i = +k.slice(2); if (fill[i] != null) delete fill[i]; sel = sel === i ? null : i; api.pop(); } else if (k.indexOf('w:') === 0 && sel != null) { fill[sel] = pool[+k.slice(2)]; sel = null; api.pop(); } else if (k === 'check') { checked = true; const right = items.filter((it, i) => fill[i] === it.a).length; if (right === items.length) api.good(); else api.bad(); } else if (k === 'reset') { Object.keys(fill).forEach(i => delete fill[i]); sel = null; checked = false; } paint(); });
      paint();
    }
  });

  // ───────────────────────── 10. 받아쓰기 ─────────────────────────
  Q.list.push({
    id: 'dictation', icon: '🔊', name: '받아쓰기', desc: '들려주고 → 글자 수 힌트 → 정답 공개', minutes: 6, needs: '문장 3개↑', help: '교사가 읽어 주거나 🔊 로 기기가 읽어요(브라우저 음성). 정답은 공개 전까지 안 보여요.',
    setup: (st, sv) => [{ type: 'text', key: 'items', label: '문장 (한 줄에 하나)', rows: 8, value: sv.items != null ? sv.items : harvest(st).slice(0, 5).join('\n') }, { type: 'chips', key: 'lang', label: '읽기', value: sv.lang || 'ko-KR', options: [{ v: 'ko-KR', l: '한국어' }, { v: 'en-US', l: '영어' }] }],
    check: c => lines(c.items).length < 2 ? '문장이 2개는 있어야 해요' : null,
    run(root, cfg, api) {
      const items = lines(cfg.items); let i = 0, stepv = 0; // 0 듣기만 · 1 글자 수 · 2 정답
      const boxes = t => '<div class="kq-boxes">' + Array.from(t).map(c => c === ' ' ? '<i class="sp"></i>' : '<i></i>').join('') + '</div>';
      const paint = () => { const t = items[i]; root.innerHTML = ctr(i + 1, items.length) + '<div class="kq-dict">' + (stepv === 2 ? big(t, 'ans') : stepv === 1 ? boxes(t) : '<div class="kq-ear">👂</div>') + '</div>' + btnrow([{ k: 'say', l: '🔊 들려주기', main: stepv < 2 }, { k: 'hint', l: '🔢 글자 수', dis: stepv >= 1 }, { k: 'open', l: '✅ 정답 공개', dis: stepv >= 2 }, { k: 'next', l: '다음 ▶', dis: i >= items.length - 1 }]); api.status((i + 1) + '/' + items.length); api.finish('받아쓰기 — ' + items.length + '문장'); };
      bind(root, k => { if (k === 'say') { if (!api.say(items[i], cfg.lang)) api.stage && api.stage.toast && api.stage.toast('이 기기는 소리로 못 읽어요 — 선생님이 읽어 주세요'); } else if (k === 'hint') stepv = Math.max(stepv, 1); else if (k === 'open') { stepv = 2; api.good(); } else if (k === 'next' && i < items.length - 1) { i++; stepv = 0; } paint(); });
      paint();
    }
  });

  // ───────────────────────── 11. 미로 찾기 ─────────────────────────
  Q.list.push({
    id: 'maze', icon: '🌀', name: '미로 찾기', desc: '규칙에 맞는 칸만 밟아 🚩에서 🏁까지', minutes: 5, needs: '되는 것·안 되는 것', help: '「밟아도 되는 것」과 「안 되는 것」을 적으면 길이 있는 5×5 미로를 만들어요.',
    setup: (st, sv) => [{ type: 'text', key: 'rule', label: '규칙 한 줄', rows: 1, value: sv.rule || '오늘 배운 낱말만 밟아요' }, { type: 'text', key: 'ok', label: '밟아도 되는 것 (한 줄에 하나)', rows: 5, value: sv.ok != null ? sv.ok : harvest(st).slice(0, 8).join('\n') }, { type: 'text', key: 'ng', label: '밟으면 안 되는 것', rows: 5, value: sv.ng != null ? sv.ng : '', ph: '비우면 숫자·기호로 채워요' }],
    check: c => lines(c.ok).length < 3 ? '되는 것이 3개는 있어야 해요' : null,
    run(root, cfg, api) {
      const N = 5; const okw = lines(cfg.ok); let ngw = lines(cfg.ng); if (!ngw.length) ngw = ['1', '2', '3', '★', '♥', '☆', '4', '5', '6', '●']; const r = api.rng;
      // 길: (0,0)→(N-1,N-1) 오른쪽·아래로 가되 가끔 왼쪽·위로 돌아감(단, 자기 길과 안 붙게 단순화: 단조 경로 + 곁가지 없음)
      const path = [[0, 0]]; let x = 0, y = 0; while (x < N - 1 || y < N - 1) { if (x === N - 1) y++; else if (y === N - 1) x++; else if (r() < 0.5) x++; else y++; path.push([x, y]); }
      const onPath = {}; path.forEach(([a, b]) => onPath[a + ',' + b] = true);
      const cell = []; for (let yy = 0; yy < N; yy++) for (let xx = 0; xx < N; xx++) { const p = onPath[xx + ',' + yy]; // 길 밖 칸은 대부분 안 되는 것, 몇 칸은 되는 것(막다른 길)
        const useOk = p || r() < 0.22; const src = useOk ? okw : ngw; cell.push({ x: xx, y: yy, ok: useOk, t: src[Math.floor(r() * src.length)] }); }
      let cur = [0, 0]; const stepped = { '0,0': true }; let fell = 0, done = false;
      const adj = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
      const paint = () => { root.innerHTML = '<div class="kq-rule">' + esc(cfg.rule || '') + '</div><div class="kq-maze">' + cell.map(c => { const here = cur[0] === c.x && cur[1] === c.y; const st = stepped[c.x + ',' + c.y]; return '<button class="kq-cell' + (here ? ' here' : '') + (st ? ' step' : '') + (c.x === 0 && c.y === 0 ? ' s' : '') + (c.x === N - 1 && c.y === N - 1 ? ' e' : '') + '" data-b="m:' + c.x + ',' + c.y + '">' + (c.x === 0 && c.y === 0 ? '🚩 ' : c.x === N - 1 && c.y === N - 1 ? '🏁 ' : '') + esc(c.t) + '</button>'; }).join('') + '</div>' + (done ? '<div class="kq-done">🎉 도착!</div>' : '') + btnrow([{ k: 'reset', l: '처음부터' }]); api.status('걸음 ' + (Object.keys(stepped).length - 1) + ' · 헛디딤 ' + fell); api.finish('미로 찾기 — ' + (done ? '도착' : '진행 중') + ' · 걸음 ' + (Object.keys(stepped).length - 1) + ' · 헛디딤 ' + fell); };
      bind(root, k => { if (k === 'reset') { cur = [0, 0]; Object.keys(stepped).forEach(s => delete stepped[s]); stepped['0,0'] = true; fell = 0; done = false; paint(); return; } if (k.indexOf('m:') !== 0 || done) return; const [a, b] = k.slice(2).split(',').map(Number); if (!adj(cur, [a, b])) { api.stage && api.stage.toast && api.stage.toast('바로 옆 칸만 갈 수 있어요'); return; } const c = cell[b * N + a]; if (!c.ok) { fell++; api.bad(); const el = root.querySelector('[data-b="m:' + a + ',' + b + '"]'); if (el) el.classList.add('bad'); return; } cur = [a, b]; stepped[a + ',' + b] = true; api.pop(); if (a === N - 1 && b === N - 1) { done = true; api.good(); } paint(); });
      paint();
    }
  });

  // ───────────────────────── 12. 순서 맞추기 ─────────────────────────
  Q.list.push({
    id: 'order', icon: '🔢', name: '순서 맞추기', desc: '섞인 카드를 순서대로 — 이야기·절차·크기', minutes: 5, needs: '항목 3~8개', help: '올바른 순서대로 한 줄에 하나씩 적어요. 화면엔 섞여 나와요.',
    setup: (st, sv) => [{ type: 'text', key: 'items', label: '올바른 순서 (한 줄에 하나)', rows: 8, value: sv.items != null ? sv.items : '씨앗을 심어요\n싹이 나요\n잎이 자라요\n꽃이 피어요\n열매가 열려요' }],
    check: c => { const n = lines(c.items).length; return n < 3 ? '항목이 3개는 있어야 해요' : n > 8 ? '항목은 8개까지' : null; },
    run(root, cfg, api) {
      const items = lines(cfg.items).slice(0, 8); const idx = shuffle(items.map((_, i) => i), api.rng); const slots = []; let checked = false;
      const paint = () => { const left = idx.filter(i => slots.indexOf(i) < 0); root.innerHTML = '<div class="kq-slots">' + items.map((_, k) => '<button class="kq-slot' + (slots[k] != null ? ' on' : '') + (checked ? (slots[k] === k ? ' ok' : ' ng') : '') + '" data-b="s:' + k + '"><b>' + (k + 1) + '</b>' + (slots[k] != null ? esc(items[slots[k]]) : '') + '</button>').join('') + '</div><div class="kq-pool big">' + left.map(i => '<button class="kq-word" data-b="w:' + i + '">' + esc(items[i]) + '</button>').join('') + '</div>' + btnrow([{ k: 'check', l: '✅ 채점', main: true, dis: checked || left.length > 0 }, { k: 'reset', l: '다시' }]); const right = slots.filter((v, k) => v === k).length; api.status(checked ? '맞음 ' + right + '/' + items.length : '놓은 카드 ' + slots.filter(v => v != null).length + '/' + items.length); api.finish('순서 맞추기 — ' + items.length + '장 중 ' + right + '장 제자리' + (checked ? '' : ' (채점 전)')); };
      bind(root, k => { if (checked && k !== 'reset') return; if (k.indexOf('w:') === 0) { let k2 = 0; while (slots[k2] != null) k2++; if (k2 < items.length) { slots[k2] = +k.slice(2); api.pop(); } } else if (k.indexOf('s:') === 0) { const s = +k.slice(2); if (slots[s] != null) { slots[s] = null; api.pop(); } } else if (k === 'check') { checked = true; const right = slots.filter((v, k2) => v === k2).length; if (right === items.length) api.good(); else api.bad(); } else if (k === 'reset') { slots.length = 0; checked = false; } paint(); });
      paint();
    }
  });

  Q.harvest = harvest; Q.roster = roster; Q.chosung = chosung; Q.parsePairs = parsePairs;
  global.KT2_QUICK = Q;
})(typeof window !== 'undefined' ? window : globalThis);

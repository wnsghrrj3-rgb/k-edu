/* ============================================================
   K-MAKER Sample Plugins  —  Marketplace 시드
   ------------------------------------------------------------
   모든 플러그인은 factory(api) 형태로 Plugin API 만 사용한다.
   Core(window.PG / MK_* 전역)를 직접 만지지 않는다 — 그것이 증명이다.
   ------------------------------------------------------------
   포함: Mind Map · Timeline · Kanban · Quiz Generator · Flowchart ·
   Math Formula · QR Generator(실제 QR v1~4, Reed-Solomon ECC-L) ·
   Barcode(Code39 실규격) · Calendar · Whiteboard ·
   KEDU 교육 플러그인 · Enterprise(학교 비공개 배포) 예시
   ============================================================ */
(() => {
  'use strict';
  const P = window.MK_PLUGIN;

  /* ================================================================
     A. 실제 QR 인코더 — Byte mode · ECC L · v1~4 · mask 0
     (단일 블록 구간이라 인터리빙 불필요 — v1:19/7, v2:34/10, v3:55/15, v4:80/20)
     ================================================================ */
  const QR = (() => {
    /* GF(256) */
    const EXP = new Array(512), LOG = new Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
    const gmul = (a, b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;
    const genPoly = (n) => {
      let g = [1];
      for (let i = 0; i < n; i++) {
        const ng = new Array(g.length + 1).fill(0);
        for (let j = 0; j < g.length; j++) { ng[j] ^= gmul(g[j], EXP[i]); ng[j + 1] ^= g[j]; }
        g = ng;
      }
      return g;
    };
    const rs = (data, ecLen) => {
      const g = genPoly(ecLen), res = new Array(ecLen).fill(0);
      for (const d of data) {
        const f = d ^ res.shift(); res.push(0);
        if (f) for (let i = 0; i < ecLen; i++) res[i] ^= gmul(g[i + 1], f);
      }
      return res;
    };
    /* version: [총데이터 코드워드, ECC 개수, 정렬패턴 중심] */
    const VER = { 1: [19, 7, []], 2: [34, 10, [6, 18]], 3: [55, 15, [6, 22]], 4: [80, 20, [6, 26]] };
    /* ECC L · mask 0 포맷 비트(BCH 계산 완료 상수) */
    const FMT = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];

    function encode(text) {
      const bytes = [];
      for (const ch of String(text)) {          /* UTF-8 */
        const c = ch.codePointAt(0);
        if (c < 0x80) bytes.push(c);
        else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 63));
        else if (c < 0x10000) bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
        else bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      }
      let ver = 0;
      for (const v of [1, 2, 3, 4]) if (bytes.length <= VER[v][0] - 2) { ver = v; break; }
      if (!ver) throw new Error(`QR: 최대 ${VER[4][0] - 2}바이트 (현재 ${bytes.length})`);
      const [dataLen, ecLen, aligns] = VER[ver];
      /* 비트스트림: 모드 0100 + 길이(8bit) + 데이터 + 종단 */
      const bits = [];
      const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };
      put(4, 4); put(bytes.length, 8);
      for (const b of bytes) put(b, 8);
      put(0, Math.min(4, dataLen * 8 - bits.length));
      while (bits.length % 8) bits.push(0);
      const cw = [];
      for (let i = 0; i < bits.length; i += 8) cw.push(parseInt(bits.slice(i, i + 8).join(''), 2));
      const pad = [0xec, 0x11]; let pi = 0;
      while (cw.length < dataLen) cw.push(pad[pi++ % 2]);
      const all = cw.concat(rs(cw, ecLen));

      /* 매트릭스 */
      const N = 17 + ver * 4;
      const M = Array.from({ length: N }, () => new Array(N).fill(null));  /* null=미정 */
      const setF = (r, c, v) => { if (r >= 0 && r < N && c >= 0 && c < N) M[r][c] = v; };
      const finder = (r, c) => {
        for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr >= N || cc < 0 || cc >= N) continue;
          const on = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6 &&
            (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
          setF(rr, cc, on ? 1 : 0);
        }
      };
      finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
      for (let i = 8; i < N - 8; i++) { const v = i % 2 === 0 ? 1 : 0; if (M[6][i] == null) M[6][i] = v; if (M[i][6] == null) M[i][6] = v; }
      for (const r of aligns) for (const c of aligns) {
        if (M[r][c] != null) continue;                 /* finder 겹침 회피 */
        for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++)
          setF(r + dr, c + dc, (Math.max(Math.abs(dr), Math.abs(dc)) !== 1) ? 1 : 0);
      }
      /* 포맷 정보 배치 (mask0 · L) — FMT[i] = 비트 14-i (MSB 우선) */
      for (let i = 0; i < 15; i++) {
        const b = FMT[i];
        /* 사본 1: 좌상단 파인더 주변 */
        if (i < 6) M[8][i] = b;                         /* (8,0)~(8,5) */
        else if (i === 6) M[8][7] = b;
        else if (i === 7) M[8][8] = b;
        else if (i === 8) M[7][8] = b;
        else M[14 - i][8] = b;                          /* (5,8)~(0,8) */
        /* 사본 2: 우상·좌하 파인더 주변 */
        if (i < 7) M[N - 1 - i][8] = b;                 /* (N-1,8)~(N-7,8) */
        else M[8][N - 8 + (i - 7)] = b;                 /* (8,N-8)~(8,N-1) */
      }
      M[N - 8][8] = 1;                                  /* dark module */
      /* 데이터 지그재그 배치 + mask 0 ((r+c)%2==0 반전) */
      let bi = 0; const dataBits = [];
      for (const b of all) for (let i = 7; i >= 0; i--) dataBits.push((b >> i) & 1);
      let col = N - 1, up = true;
      while (col > 0) {
        if (col === 6) col--;
        for (let k = 0; k < N; k++) {
          const r = up ? N - 1 - k : k;
          for (const c of [col, col - 1]) {
            if (M[r][c] != null) continue;
            let bit = bi < dataBits.length ? dataBits[bi++] : 0;
            if ((r + c) % 2 === 0) bit ^= 1;            /* mask 0 */
            M[r][c] = bit;
          }
        }
        col -= 2; up = !up;
      }
      return { size: N, version: ver, modules: M };
    }
    const toSVG = (q, scale) => {
      const s = scale || 6, m = 4 * s, W = q.size * s + m * 2;
      let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}"><rect width="${W}" height="${W}" fill="#fff"/>`;
      for (let r = 0; r < q.size; r++) for (let c = 0; c < q.size; c++)
        if (q.modules[r][c]) out += `<rect x="${m + c * s}" y="${m + r * s}" width="${s}" height="${s}" fill="#111"/>`;
      return out + '</svg>';
    };
    return { encode, toSVG, VER };
  })();

  /* ================================================================
     B. Code39 바코드 — 실규격 (43문자 + '*')
     ================================================================ */
  const C39 = (() => {
    const T = {
      '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
      '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
      '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
      'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
      'G': '101010011011', 'H': '110101001101', 'I': '101101001101', 'J': '101011001101',
      'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
      'O': '110101101001', 'P': '101101101001', 'Q': '101010110011', 'R': '110101011001',
      'S': '101101011001', 'T': '101011011001', 'U': '110010101011', 'V': '100110101011',
      'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
      '-': '100101011011', '.': '110010101101', ' ': '100110101101', '$': '100100100101',
      '/': '100100101001', '+': '100101001001', '%': '101001001001', '*': '100101101101',
    };
    const encode = (text) => {
      const s = ('*' + String(text).toUpperCase() + '*').split('');
      for (const ch of s) if (!T[ch]) throw new Error(`Code39 미지원 문자: ${ch}`);
      return s.map((ch) => T[ch]).join('0');            /* 문자 간 narrow space */
    };
    const toSVG = (text, h) => {
      const bits = encode(text), H = h || 60, u = 2;
      let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bits.length * u + 20} ${H + 18}"><rect width="100%" height="100%" fill="#fff"/>`;
      for (let i = 0; i < bits.length; i++) if (bits[i] === '1') out += `<rect x="${10 + i * u}" y="6" width="${u}" height="${H}" fill="#111"/>`;
      return out + `<text x="50%" y="${H + 15}" font-size="9" text-anchor="middle" fill="#333">${String(text).toUpperCase()}</text></svg>`;
    };
    return { encode, toSVG, TABLE: T };
  })();

  /* ================================================================
     공용 헬퍼 — 요소 생성 축약
     ================================================================ */
  const tx = (x, y, w, size, text, weight, extra) => ({ kind: 'text', x, y, w, size, text, weight: weight || 400, ...(extra || {}) });
  const bx = (x, y, w, h, fill, label) => ({ kind: 'image', x, y, w, h, label: label || '', fill });

  /* ================================================================
     1. Mind Map
     ================================================================ */
  const mindmap = {
    manifest: { id: 'mindmap', name: '마인드맵', version: '1.1.0', author: 'K-MAKER Lab', company: 'KEDU', icon: '🧠',
      description: '중심 주제에서 가지를 뻗는 마인드맵 장면 생성', category: 'productivity',
      permissions: ['canvas'], entry: 'index.js', license: 'MIT' },
    factory(api) {
      api.commands.register({ id: 'mindmap.create', title: 'Create Mindmap', run: (topic, branches) => {
        const list = branches && branches.length ? branches : ['생각 1', '생각 2', '생각 3', '생각 4'];
        const si = api.scene.create({ name: '마인드맵', background: '#FBFAF7' });
        api.element.create(tx(38, 44, 24, 5, topic || '중심 주제', 700, { align: 'center' }), si);
        const pos = [[8, 14], [64, 14], [8, 72], [64, 72], [36, 8], [36, 82]];
        list.slice(0, 6).forEach((b, i) => {
          api.element.create(bx(pos[i][0], pos[i][1], 26, 12, '#EDF4F0'), si);
          api.element.create(tx(pos[i][0] + 2, pos[i][1] + 3, 22, 3.2, b, 600), si);
        });
        return si;
      }});
      api.ui.add('leftSidebar', { id: 'mindmap-panel', title: '마인드맵', icon: '🧠', command: 'mindmap.create' });
      return {};
    },
    reviews: [{ stars: 5, text: '수업 브레인스토밍에 딱', at: 1 }, { stars: 4, text: '가지 6개 제한이 아쉬움', at: 2 }], installs: 412,
  };

  /* ================================================================
     2. Timeline — "Convert to Timeline" (지시서 §15 예시 명령)
     ================================================================ */
  const timeline = {
    manifest: { id: 'timeline', name: '타임라인', version: '1.0.2', author: 'K-MAKER Lab', company: 'KEDU', icon: '📅',
      description: '항목 목록을 가로 타임라인으로 변환', category: 'presentation',
      permissions: ['canvas'], entry: 'index.js', license: 'MIT' },
    factory(api) {
      api.commands.register({ id: 'timeline.convert', title: 'Convert to Timeline', run: (items) => {
        const list = items && items.length ? items : ['1단계', '2단계', '3단계', '4단계'];
        const si = api.scene.create({ name: '타임라인', background: '#FFFFFF' });
        api.element.create(bx(6, 49, 88, 1.2, '#C9D2DE'), si);
        const step = 88 / list.length;
        list.forEach((it, i) => {
          const x = 6 + step * i + step / 2 - 6;
          api.element.create(bx(x + 4.5, 46.5, 3, 6, '#2A7A6C'), si);
          api.element.create(tx(x, i % 2 ? 56 : 34, 14, 2.8, it, 600, { align: 'center' }), si);
        });
        return si;
      }});
      api.ui.add('topToolbar', { id: 'timeline-btn', title: '타임라인', icon: '📅', command: 'timeline.convert' });
      return {};
    },
    reviews: [{ stars: 5, text: '역사 수업 연표 제작 최고', at: 1 }], installs: 298,
  };

  /* ================================================================
     3. Kanban
     ================================================================ */
  const kanban = {
    manifest: { id: 'kanban', name: '칸반 보드', version: '1.0.0', author: '집중력공방', icon: '🗂',
      description: '할 일·진행·완료 3열 칸반 장면', category: 'collaboration',
      permissions: ['canvas', 'storage'], entry: 'index.js', license: 'MIT' },
    factory(api) {
      api.commands.register({ id: 'kanban.create', title: '칸반 보드 만들기', run: (cols) => {
        const names = cols || ['할 일', '진행 중', '완료'];
        const si = api.scene.create({ name: '칸반', background: '#F6F7F9' });
        names.slice(0, 4).forEach((n, i) => {
          const x = 5 + i * (92 / names.length);
          api.element.create(bx(x, 10, 92 / names.length - 3, 80, '#FFFFFF'), si);
          api.element.create(tx(x + 2, 13, 20, 3.4, n, 700), si);
          for (let c = 0; c < 2; c++) api.element.create(bx(x + 2, 22 + c * 14, 92 / names.length - 7, 10, '#EDF1F6'), si);
        });
        api.storage.set('lastBoard', { cols: names, at: Date.now() });
        return si;
      }});
      return {};
    },
    reviews: [{ stars: 4, text: '모둠 활동 관리용', at: 1 }], installs: 155,
  };

  /* ================================================================
     4. Quiz Generator — "Generate Quiz" (§15) · AI 권한 사용
     ================================================================ */
  const quiz = {
    manifest: { id: 'quiz-gen', name: '퀴즈 생성기', version: '2.0.0', author: 'KEDU', company: 'KEDU', icon: '❓',
      description: '주제로 4지선다 퀴즈 슬라이드 생성 (AI 규칙 기반)', category: 'education',
      permissions: ['canvas', 'ai'], entry: 'index.js', license: 'KEDU-EDU' },
    factory(api) {
      api.commands.register({ id: 'quiz.generate', title: 'Generate Quiz', run: (topic, n) => {
        const made = [];
        for (let q = 1; q <= (n || 2); q++) {
          const si = api.scene.create({ name: `퀴즈 ${q}`, background: '#FFFDF6' });
          api.element.create(tx(8, 10, 84, 5.5, `Q${q}. ${topic || '주제'} 에 대한 설명으로 옳은 것은?`, 700), si);
          ['①', '②', '③', '④'].forEach((m, i) => {
            api.element.create(bx(10, 28 + i * 15, 80, 11, i === 1 ? '#EAF6EF' : '#F4F4F2'), si);
            api.element.create(tx(13, 31.5 + i * 15, 74, 3.4, `${m} ${api.ai.rewrite(`${topic || '주제'} 보기 ${i + 1}`, 'short')}`, 500), si);
          });
          made.push(si);
        }
        return made;
      }});
      api.ui.add('aiPanel', { id: 'quiz-ai', title: '퀴즈 생성', icon: '❓', command: 'quiz.generate' });
      return {};
    },
    reviews: [{ stars: 5, text: '단원 정리 퀴즈 3분 완성', at: 1 }, { stars: 5, text: '보기 자동 배치가 편함', at: 2 }], installs: 640,
  };

  /* ================================================================
     5. Flowchart
     ================================================================ */
  const flowchart = {
    manifest: { id: 'flowchart', name: '순서도', version: '1.0.1', author: 'K-MAKER Lab', icon: '🔀',
      description: '단계 목록을 세로 순서도로', category: 'chart',
      permissions: ['canvas'], entry: 'index.js', license: 'MIT' },
    factory(api) {
      api.commands.register({ id: 'flow.create', title: '순서도 만들기', run: (steps) => {
        const list = steps && steps.length ? steps : ['시작', '실험하기', '관찰 기록', '결론'];
        const si = api.scene.create({ name: '순서도', background: '#FFFFFF' });
        const gap = 84 / list.length;
        list.forEach((s, i) => {
          api.element.create(bx(32, 8 + i * gap, 36, gap * 0.55, i === 0 || i === list.length - 1 ? '#E4EEF9' : '#F1F3F5'), si);
          api.element.create(tx(34, 8 + i * gap + gap * 0.18, 32, 3, s, 600, { align: 'center' }), si);
          if (i < list.length - 1) api.element.create(tx(48.5, 8 + i * gap + gap * 0.62, 4, 3, '↓', 700), si);
        });
        return si;
      }});
      api.ui.add('contextMenu', { id: 'flow-ctx', title: '순서도로 변환', icon: '🔀', command: 'flow.create' });
      return {};
    },
    reviews: [{ stars: 4, text: '실험 절차 정리 좋음', at: 1 }], installs: 203,
  };

  /* ================================================================
     6. Math Formula
     ================================================================ */
  const mathf = {
    manifest: { id: 'math-formula', name: '수식', version: '1.0.0', author: '수학교실', icon: '➗',
      description: '자주 쓰는 수식 카드를 캔버스에 삽입', category: 'education',
      permissions: ['canvas'], entry: 'index.js', license: 'MIT' },
    factory(api) {
      const F = { area: '넓이 = 가로 × 세로', speed: '속력 = 거리 ÷ 시간', frac: 'a/b + c/d = (ad+bc)/bd', pyth: 'a² + b² = c²' };
      api.commands.register({ id: 'math.insert', title: '수식 넣기', run: (key) => {
        const f = F[key] || F.area;
        api.element.create(bx(28, 40, 44, 14, '#F3F6FB'));
        return api.element.create(tx(30, 45, 40, 4, f, 700, { align: 'center' }));
      }});
      api.ui.add('rightInspector', { id: 'math-panel', title: '수식', icon: '➗', command: 'math.insert' });
      return { formulas: Object.keys(F) };
    },
    reviews: [{ stars: 4, text: '공식 카드로 유용', at: 1 }], installs: 121,
  };

  /* ================================================================
     7. QR Generator — 실제 스캔 가능한 QR
     ================================================================ */
  const qrgen = {
    manifest: { id: 'qr-gen', name: 'QR 생성기', version: '1.2.0', author: 'K-MAKER Lab', icon: '🔳',
      description: '실제 스캔 가능한 QR(v1~4·ECC L)을 만들어 삽입', category: 'export',
      permissions: ['canvas', 'asset'], entry: 'index.js', license: 'MIT' },
    factory(api) {
      api.commands.register({ id: 'qr.make', title: 'QR Generator', run: (text) => {
        const q = QR.encode(text || 'https://keduclass.com');
        const svg = QR.toSVG(q);
        const aid = api.asset.upload({ name: 'QR · ' + String(text || 'keduclass').slice(0, 20), kind: 'image', meta: { svg: true, qrVersion: q.version } });
        const ei = api.element.create({ kind: 'image', x: 36, y: 26, w: 28, h: 48, label: 'QR: ' + String(text || 'keduclass.com').slice(0, 24), assetId: aid && aid.id, svg });
        return { version: q.version, size: q.size, element: ei };
      }});
      api.ui.add('assetBrowser', { id: 'qr-browser', title: 'QR 만들기', icon: '🔳', command: 'qr.make' });
      return { encode: QR.encode, toSVG: QR.toSVG };
    },
    reviews: [{ stars: 5, text: '학부모 안내장 링크 QR 실제로 찍힘', at: 1 }], installs: 530,
  };

  /* ================================================================
     8. Barcode — Code39
     ================================================================ */
  const barcode = {
    manifest: { id: 'barcode', name: '바코드', version: '1.0.0', author: 'K-MAKER Lab', icon: '📊',
      description: 'Code39 실규격 바코드 삽입', category: 'export',
      permissions: ['canvas'], entry: 'index.js', license: 'MIT' },
    factory(api) {
      api.commands.register({ id: 'barcode.make', title: 'Barcode', run: (text) => {
        const svg = C39.toSVG(text || 'KEDU-2026');
        return api.element.create({ kind: 'image', x: 30, y: 38, w: 40, h: 22, label: 'BARCODE: ' + String(text || 'KEDU-2026'), svg });
      }});
      return { encode: C39.encode, toSVG: C39.toSVG };
    },
    reviews: [{ stars: 4, text: '교구 관리 라벨용', at: 1 }], installs: 88,
  };

  /* ================================================================
     9. Calendar
     ================================================================ */
  const calendar = {
    manifest: { id: 'calendar', name: '달력', version: '1.0.0', author: '집중력공방', icon: '🗓',
      description: '월간 달력 그리드 장면 생성', category: 'productivity',
      permissions: ['canvas'], entry: 'index.js', license: 'MIT' },
    factory(api) {
      api.commands.register({ id: 'calendar.month', title: '월간 달력', run: (year, month) => {
        const y = year || 2026, m = month || 7;
        const first = new Date(y, m - 1, 1).getDay(), days = new Date(y, m, 0).getDate();
        const si = api.scene.create({ name: `${y}년 ${m}월`, background: '#FFFFFF' });
        api.element.create(tx(6, 5, 40, 5, `${y}년 ${m}월`, 700), si);
        ['일', '월', '화', '수', '목', '금', '토'].forEach((d, i) =>
          api.element.create(tx(6 + i * 13, 15, 12, 2.6, d, 600, { align: 'center' }), si));
        for (let d = 1; d <= days; d++) {
          const cell = first + d - 1, row = Math.floor(cell / 7), col = cell % 7;
          api.element.create(bx(6 + col * 13, 20 + row * 13, 12, 12, '#FAFBFC'), si);
          api.element.create(tx(7 + col * 13, 21.5 + row * 13, 6, 2.2, String(d), col === 0 ? 700 : 400), si);
        }
        return si;
      }});
      return {};
    },
    reviews: [{ stars: 5, text: '학급 달력 인쇄용', at: 1 }], installs: 240,
  };

  /* ================================================================
     10. Whiteboard — Canvas Overlay 확장 지점 시연
     ================================================================ */
  const whiteboard = {
    manifest: { id: 'whiteboard', name: '화이트보드', version: '1.0.0', author: 'K-MAKER Lab', icon: '🖊',
      description: '캔버스 위 자유 메모 스티커 오버레이', category: 'collaboration',
      permissions: ['canvas', 'storage'], entry: 'index.js', license: 'MIT' },
    factory(api) {
      api.commands.register({ id: 'wb.sticky', title: '메모 스티커', run: (text) => {
        const notes = api.storage.get('notes') || [];
        const i = notes.length;
        notes.push({ text: text || '메모', at: Date.now() });
        api.storage.set('notes', notes);
        api.element.create(bx(8 + (i % 5) * 18, 8 + Math.floor(i / 5) * 16, 16, 12, '#FFF3B0'));
        return api.element.create(tx(9 + (i % 5) * 18, 11 + Math.floor(i / 5) * 16, 14, 2.4, text || '메모', 500));
      }});
      api.ui.add('canvasOverlay', { id: 'wb-overlay', title: '메모', icon: '🖊', command: 'wb.sticky' });
      api.ui.add('bottomToolbar', { id: 'wb-bottom', title: '스티커', icon: '🟨', command: 'wb.sticky' });
      return {};
    },
    reviews: [{ stars: 4, text: '피드백 표시에 씀', at: 1 }], installs: 96,
  };

  /* ================================================================
     11. KEDU 교육 플러그인 (§24) — 실험·수학·사회·AI 문제·활동지
     Core 수정 없이 Plugin 하나로 교육 기능 전부 제공
     ================================================================ */
  const kedu = {
    manifest: { id: 'kedu-suite', name: 'KEDU 교육 도구', version: '3.0.0', author: 'KEDU', company: 'KEDU', icon: '🎒',
      description: '실험도구·수학도구·사회도구·AI 문제생성·학생 활동지 — 전부 Plugin으로', category: 'education',
      permissions: ['canvas', 'ai', 'asset', 'export'], entry: 'index.js', license: 'KEDU-EDU' },
    factory(api) {
      /* 실험도구: 관찰 기록 활동지 */
      api.commands.register({ id: 'kedu.sci', title: '실험 관찰 기록지', run: (title) => {
        const si = api.scene.create({ name: '관찰 기록', background: '#FDFEFB' });
        api.element.create(tx(8, 6, 84, 5, title || '실험 관찰 기록지', 700), si);
        ['예상', '관찰한 것', '알게 된 것'].forEach((s, i) => {
          api.element.create(tx(8, 18 + i * 26, 30, 3.4, `${i + 1}. ${s}`, 700), si);
          api.element.create(bx(8, 24 + i * 26, 84, 16, '#F5F8F3'), si);
        });
        return si;
      }});
      /* 수학도구: 수직선 */
      api.commands.register({ id: 'kedu.math', title: '수직선 넣기', run: (from, to) => {
        const a = from ?? 0, b = to ?? 10, si = api.scene.current();
        api.element.create(bx(8, 55, 84, 0.8, '#3A4454'), si);
        for (let i = 0; i <= b - a; i++) {
          const x = 8 + (84 / (b - a)) * i;
          api.element.create(bx(x, 52.5, 0.6, 5.5, '#3A4454'), si);
          api.element.create(tx(x - 1.6, 60, 5, 2.4, String(a + i), 600, { align: 'center' }), si);
        }
        return true;
      }});
      /* 사회도구: 비교표 */
      api.commands.register({ id: 'kedu.soc', title: '옛날·오늘날 비교표', run: (topic) => {
        const si = api.scene.create({ name: '비교하기', background: '#FFFFFF' });
        api.element.create(tx(8, 6, 84, 5, `${topic || '생활 모습'} — 옛날과 오늘날`, 700), si);
        ['옛날', '오늘날'].forEach((h, i) => {
          api.element.create(bx(8 + i * 44, 16, 40, 8, '#EFE9DC'), si);
          api.element.create(tx(10 + i * 44, 18.5, 36, 3.4, h, 700, { align: 'center' }), si);
          api.element.create(bx(8 + i * 44, 26, 40, 60, '#FAF8F3'), si);
        });
        return si;
      }});
      /* AI 문제생성: 퀴즈 플러그인 명령 재사용(플러그인 간 협업) */
      api.commands.register({ id: 'kedu.aiquiz', title: 'AI 문제 생성', run: (topic, n) => api.commands.exec('quiz.generate', topic, n) });
      /* 학생 활동지: 이름칸 + 문항 골격 */
      api.commands.register({ id: 'kedu.worksheet', title: '학생 활동지', run: (title, items) => {
        const si = api.scene.create({ name: '활동지', background: '#FFFFFF' });
        api.element.create(tx(8, 5, 60, 4.6, title || '활동지', 700), si);
        api.element.create(tx(70, 5, 24, 2.8, '이름: ____________', 500), si);
        (items || ['생각해 보기', '정리하기']).forEach((it, i) => {
          api.element.create(tx(8, 16 + i * 24, 80, 3.2, `${i + 1}. ${it}`, 600), si);
          api.element.create(bx(8, 21 + i * 24, 84, 15, '#F7F7F5'), si);
        });
        return si;
      }});
      api.ui.add('leftSidebar', { id: 'kedu-panel', title: 'KEDU', icon: '🎒', command: 'kedu.worksheet' });
      api.ui.add('templateBrowser', { id: 'kedu-tpl', title: 'KEDU 활동지', icon: '🎒', command: 'kedu.worksheet' });
      api.shortcuts.register('ctrl+shift+k', 'kedu.worksheet', 5);
      return {};
    },
    reviews: [{ stars: 5, text: '케이랩과 함께 쓰는 중', at: 1 }, { stars: 5, text: '활동지 자동 생성 미쳤다', at: 2 }], installs: 1180,
  };

  /* ================================================================
     12. Enterprise 예시 (§25) — 금성초 비공개 배포
     ================================================================ */
  const enterprise = {
    manifest: { id: 'gs-notice', name: '금성초 가정통신문', version: '1.0.0', author: '금성초 과학부', company: '금성초', icon: '🏫',
      description: '학교 서식이 미리 들어간 가정통신문 (교내 전용)', category: 'education',
      permissions: ['canvas'], entry: 'index.js', license: 'SCHOOL-INTERNAL' },
    visibility: 'school', audience: ['geumseong'],
    factory(api) {
      api.commands.register({ id: 'gs.notice', title: '가정통신문 서식', run: (title) => {
        const si = api.scene.create({ name: '가정통신문', background: '#FFFFFF' });
        api.element.create(bx(0, 0, 100, 12, '#2A4E7A'), si);
        api.element.create(tx(8, 4, 60, 4, '금성초등학교 가정통신문', 700, { color: '#FFFFFF' }), si);
        api.element.create(tx(8, 16, 84, 5, title || '안내드립니다', 700), si);
        api.element.create(bx(8, 26, 84, 58, '#FAFBFC'), si);
        api.element.create(tx(8, 88, 84, 3.4, '금성초등학교장', 700, { align: 'center' }), si);
        return si;
      }});
      return {};
    },
    reviews: [], installs: 12,
  };

  /* ================================================================
     스토어 등록 + 기본 설치
     ================================================================ */
  const ITEMS = [mindmap, timeline, kanban, quiz, flowchart, mathf, qrgen, barcode, calendar, whiteboard, kedu, enterprise];
  for (const it of ITEMS) P.publish(it);
  /* 기본 활성 세트 — 데모 즉시 체감용 */
  for (const id of ['quiz-gen', 'kedu-suite', 'qr-gen', 'timeline', 'mindmap']) P.installFromStore(id);

  window.MK_PLUGIN_SAMPLES = { QR, C39, count: ITEMS.length, ids: ITEMS.map((i) => i.manifest.id) };
})();

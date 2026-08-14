/* ============================================================
   MK_SELFCHECK — R120 실브라우저 자가 진단
   ------------------------------------------------------------
   R71 부터 거의 매 라운드 끝에 「실브라우저 사람 눈 확인 미실시(준호 몫)」
   가 붙었고, R116·R117·R118·R119 넉 대가 미확인으로 쌓였다. 확인이 안 된
   까닭은 게을러서가 아니라 **확인 비용**이다 — R116 하나가 「강력 새로고침
   → 사진 수십 장 → 프로젝트 → 완전 이탈 → 재진입 → F12 Application 탭」
   이고, 폰에는 F12 가 없다.

   그래서 확인을 코드로 옮긴다. 링크 하나를 열면 브라우저가 스스로 밟는다.

   ★ 무엇을 검사하는가 — 원칙 하나:
     **jsdom 이 원리적으로 못 닿는 것만 기계 검사에 넣는다.**
     이미 test-round116~119(109 스위트)가 순수 계층을 전량 덮고 있으므로,
     같은 것을 브라우저에서 한 번 더 도는 것은 「더 검사했다」는 착시만
     남긴다. 여기 있는 것은 전부 jsdom 에 **존재하지 않는 기관**이다:
       · 진짜 IndexedDB (jsdom 에 없음 — R116 하니스는 가짜 IDB 를 주입했다)
       · 브라우저가 px 로 해결한 transform-origin (jsdom 은 계산 안 함)
       · 브라우저가 실제로 합성한 변환 행렬 (jsdom 은 레이아웃이 없음)
       · 새로고침을 건너 살아남는 디스크 (프로세스 밖의 사실)
     R118(재료 입구)은 jsdom 이 이미 21/21 로 덮는다 — 그래서 기계 검사가
     아니라 **눈 확인** 목록으로 내린다. 덮이는 것을 또 재는 것은 정직하지
     않다.

   ★ 순수부와 탐침부를 가르는 까닭:
     행렬 수학(mul·about·cssNet·canvasNet)은 순수라 jsdom 이 전량 검사한다
     (test-round120). 브라우저는 **같은 그 함수**를 읽어 자기가 합성한 실제
     행렬과 대조한다 — R117 이 세운 「정본 하나를 양세계가 함께 읽어 패리티가
     구조로 성립한다」와 같은 결이다. 검사기 자체가 검사받지 않으면 초록불은
     아무 뜻이 없다.

   ★ 행렬 규약: CSS matrix(a,b,c,d,e,f) 와 동일.
       x' = a·x + c·y + e ,  y' = b·x + d·y + f
     캔버스 ctx 변환·SVG rotate 와 같은 부호(시계 방향·y 아래).
   ============================================================ */
window.MK_SELFCHECK = (() => {
  'use strict';

  const DB = 'mk-maker', ST = 'kv';            /* MK_STORE 와 같은 이름 — 여기선 직접 연다 */
  const VISIT = 'mklive:__selfcheck_visit';    /* 새로고침 생존 표식 (mklive: 접두라 이주 규약 안) */
  const BULK = 'mklive:__selfcheck_bulk';      /* 대용량 왕복 표식 */

  /* ---------- 순수: 어파인 행렬 ---------- */
  const I = () => [1, 0, 0, 1, 0, 0];
  const T = (x, y) => [1, 0, 0, 1, x, y];
  const rotM = (deg) => {
    const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [c, s, -s, c, 0, 0];
  };
  const scaleM = (s) => [s, 0, 0, s, 0, 0];

  /* A∘B — B 를 먼저 적용하고 A 를 적용 */
  const mul = (A, B) => [
    A[0] * B[0] + A[2] * B[1],
    A[1] * B[0] + A[3] * B[1],
    A[0] * B[2] + A[2] * B[3],
    A[1] * B[2] + A[3] * B[3],
    A[0] * B[4] + A[2] * B[5] + A[4],
    A[1] * B[4] + A[3] * B[5] + A[5],
  ];

  /* transform-origin 계약: 원점 o 를 기준으로 M 을 적용 = T(o)·M·T(−o) */
  const about = (M, ox, oy) => mul(mul(T(ox, oy), M), T(-ox, -oy));

  /* getComputedStyle(...).transform 문자열 → 행렬 6수. 'none'·미해결 = 단위행렬 */
  const parseMatrix = (str) => {
    if (!str || str === 'none') return I();
    const m3 = /^matrix3d\((.+)\)$/.exec(String(str).trim());
    if (m3) {
      const n = m3[1].split(',').map((v) => parseFloat(v));
      if (n.length !== 16 || n.some((v) => !isFinite(v))) return null;
      /* 3d 의 2d 부분만 — z 축 성분이 있으면 2d 로 못 읽는다(정직하게 null) */
      if (Math.abs(n[2]) > 1e-9 || Math.abs(n[6]) > 1e-9 || Math.abs(n[8]) > 1e-9
        || Math.abs(n[9]) > 1e-9 || Math.abs(n[11]) > 1e-9 || Math.abs(n[14]) > 1e-9) return null;
      return [n[0], n[1], n[4], n[5], n[12], n[13]];
    }
    const m2 = /^matrix\((.+)\)$/.exec(String(str).trim());
    if (!m2) return null;
    const n = m2[1].split(',').map((v) => parseFloat(v));
    if (n.length !== 6 || n.some((v) => !isFinite(v))) return null;
    return n;
  };

  /* '123px 45px' → [123, 45] (브라우저는 transform-origin 을 언제나 px 로 해결한다) */
  const parseOrigin = (str) => {
    if (!str) return null;
    const n = String(str).trim().split(/\s+/).map((v) => parseFloat(v));
    if (n.length < 2 || !isFinite(n[0]) || !isFinite(n[1])) return null;
    return [n[0], n[1]];
  };

  const near = (A, B, tol) => {
    if (!A || !B) return false;
    const t = tol == null ? 1e-3 : tol;
    for (let i = 0; i < 6; i++) if (Math.abs(A[i] - B[i]) > t) return false;
    return true;
  };
  const maxDiff = (A, B) => {
    if (!A || !B) return Infinity;
    let d = 0; for (let i = 0; i < 6; i++) d = Math.max(d, Math.abs(A[i] - B[i]));
    return d;
  };

  /* ---------- 순수: 두 세계의 net ---------- */
  /* 재생(CSS·R119 축 분리): 바깥 rotate(중앙축) ∘ 안쪽 scale(초점축).
     부모 변환이 자식 변환보다 바깥에서 곱해진다 — 그래서 mul(바깥, 안쪽). */
  const cssNet = (deg, cx, cy, s, fx, fy) =>
    mul(about(rotM(deg), cx, cy), about(scaleM(s), fx, fy));

  /* MP4(캔버스·R119): 스프라이트에 구워진 정적 회전 위에 애니 scale 을
     피벗 P=R(θ,C)·Fs 에서 얹는다 — S(s,P) ∘ R(θ,C). */
  const canvasNet = (deg, cx, cy, s, px, py) =>
    mul(about(scaleM(s), px, py), about(rotM(deg), cx, cy));

  /* ---------- 순수: 검사 명세 ----------
     화면이 이 목록을 그린다. 「무엇을 증명하나」와 「왜 jsdom 이 못 하나」를
     한 줄씩 못 박아 둔다 — 초록불의 뜻을 사람이 읽을 수 있어야 한다. */
  const CHECKS = [
    { id: 'idb-open', round: 'R116', title: 'IndexedDB 실개통',
      proves: '이 기기·이 브라우저에서 IDB 가 실제로 열렸고 폴백이 아니다',
      blind: 'jsdom 에 IndexedDB 자체가 없다(하니스는 가짜 IDB 를 주입했다)' },
    { id: 'idb-disk', round: 'R116', title: '디스크 왕복',
      proves: 'MK_STORE 로 쓴 값이 메모리 Map 이 아니라 실제 IDB 에 앉았다',
      blind: '별도 연결로 다시 열어 읽는 확인 — 진짜 DB 가 있어야만 가능' },
    { id: 'idb-survive', round: 'R116', title: '새로고침 생존',
      proves: '이전 방문의 기록이 디스크에서 살아 돌아온다(재진입 생존)',
      blind: '프로세스 밖의 사실 — 한 번의 jsdom 실행 안에서는 증명 불가' },
    { id: 'idb-bulk', round: 'R116', title: '5MB 벽 넘기',
      proves: 'localStorage 가 죽던 크기가 이 기기에서 실제로 저장·복원된다',
      blind: '실제 쿼터가 있어야 의미 있다 — 가짜 저장소엔 벽이 없다' },
    { id: 'focus-origin', round: 'R117', title: '초점 축 실좌표',
      proves: '브라우저가 px 로 해결한 변형 축이 초점 자리와 일치한다',
      blind: 'jsdom 은 transform-origin 백분율을 px 로 계산하지 않는다' },
    { id: 'focus-none', round: 'R117', title: '무초점은 종전 중앙',
      proves: '초점 없는 사진의 축은 여전히 정확히 가운데다(회귀)',
      blind: '위와 같음 — 실해결된 px 축을 읽어야 한다' },
    { id: 'rot-nest', round: 'R119', title: '회전 축 분리 실측',
      proves: '바깥은 중앙축 회전, 안쪽은 초점축 — 두 축이 실제로 갈려 있다',
      blind: 'jsdom 은 중첩 두 요소의 실해결 축을 각각 계산하지 못한다' },
    { id: 'rot-parity', round: 'R119', title: '브라우저 합성 = 캔버스 수학',
      proves: '브라우저가 실제 합성한 행렬이 MP4 켤레 피벗 수학과 같다',
      blind: 'jsdom 엔 합성 행렬이 없다 — 하니스는 순수 계산끼리만 대조했다' },
    { id: 'rot-pan', round: 'R119', title: 'pan 은 제외(종전)',
      proves: '회전+pan 은 축 분리 대상이 아니라 종전 단일 구조 그대로다',
      blind: '실렌더 구조 확인 — 방출 문자열이 아니라 실제 DOM 을 본다' },
  ];

  /* 눈으로만 확인되는 것 — 기계가 흉내내면 거짓이 된다. 정직하게 분리 */
  const EYES = [
    { round: 'R119', title: '기울인 사진 줌이 얼굴을 향하나',
      how: '아래 견본 재생에서, 기울어진 사진이 커질 때 초점(붉은 점) 쪽으로 파고드는지 본다' },
    { round: 'R118', title: '재료 입구가 실제로 실리나',
      how: '갤러리 →「스냅 비트」선택 → 하이라이트·마지막 인사 입력칸이 뜨고, 만든 뒤 그 글이 영상에 실렸는지 본다' },
    { round: 'R118', title: '임팩트 체인지 전·후 안내',
      how: '갤러리 →「임팩트 체인지」선택 → 전·후 순서 안내문이 보이는지 본다' },
    { round: 'R117', title: '무초점 사진은 종전 그대로',
      how: '초점 안 찍은 사진은 예전처럼 가운데서 커지는지 본다(달라졌으면 회귀)' },
  ];

  /* ---------- 순수: 판정 집계 ---------- */
  const verdict = (results) => {
    const r = Array.isArray(results) ? results : [];
    const n = { pass: 0, fail: 0, skip: 0 };
    r.forEach((x) => { n[x && x.state === 'pass' ? 'pass' : x && x.state === 'skip' ? 'skip' : 'fail']++; });
    return {
      pass: n.pass, fail: n.fail, skip: n.skip, total: r.length,
      /* 건너뜀은 합격이 아니다 — 「전부 초록」이라고 말하려면 실제로 다 밟아야 한다 */
      ok: r.length > 0 && n.fail === 0 && n.skip === 0,
      label: r.length === 0 ? '검사 전' : n.fail ? `불합격 ${n.fail}건` : n.skip ? `합격 ${n.pass} · 미확정 ${n.skip}` : `전부 합격 ${n.pass}`,
    };
  };

  /* ---------- 환경 게이트 ----------
     jsdom·구형에서는 탐침을 아예 시작하지 않는다. 화면(mount)이 이걸 먼저 묻는다. */
  const supported = (w) => {
    const win = w || window;
    try {
      if (!win.indexedDB) return { ok: false, why: '이 브라우저에 IndexedDB 가 없어요' };
      if (typeof win.getComputedStyle !== 'function') return { ok: false, why: '계산된 스타일을 읽을 수 없는 환경이에요' };
      if (!win.document || !win.document.body) return { ok: false, why: '문서가 아직 준비되지 않았어요' };
      return { ok: true, why: '' };
    } catch (_) { return { ok: false, why: '환경을 확인할 수 없어요' }; }
  };

  /* ---------- 탐침 도우미 ---------- */
  const R = (id, state, msg, detail) => ({ id, state, msg: msg || '', detail: detail || '' });

  /* 별도 연결로 IDB 를 직접 연다 — MK_STORE 의 메모리 Map 을 우회해야 「디스크에
     앉았다」가 증명된다. MK_STORE 를 통해 읽으면 Map 이 답해 버려 아무것도 못 밝힌다. */
  const rawIDB = (win) => new Promise((res) => {
    let done = false;
    const fin = (v) => { if (!done) { done = true; res(v); } };
    setTimeout(() => fin(null), 4000);                 /* 응답 없는 환경 대비 */
    try {
      const rq = win.indexedDB.open(DB);
      rq.onerror = () => fin(null);
      rq.onblocked = () => fin(null);
      rq.onsuccess = () => fin(rq.result || null);
      /* upgradeneeded 가 뜨면 DB 가 아직 없다는 뜻 — MK_STORE 가 안 만들었다.
         우리가 스키마를 만들지는 않는다(진단이 상태를 바꾸면 진단이 아니다). */
      rq.onupgradeneeded = () => { try { rq.transaction.abort(); } catch (_) {} fin(null); };
    } catch (_) { fin(null); }
  });

  const rawGet = (db, key) => new Promise((res) => {
    let done = false;
    const fin = (v) => { if (!done) { done = true; res(v); } };
    setTimeout(() => fin(undefined), 4000);
    try {
      if (!db.objectStoreNames.contains(ST)) return fin(undefined);
      const tx = db.transaction(ST, 'readonly');
      const rq = tx.objectStore(ST).get(key);
      rq.onsuccess = () => fin(rq.result);
      rq.onerror = () => fin(undefined);
      tx.onerror = () => fin(undefined);
    } catch (_) { fin(undefined); }
  });

  /* MK_STORE 쓰기는 비동기 IDB. whenIdle 이 **유일한 참 신호**다 —
     setItem→idbPut 이 pending 을 동기로 올리므로 whenIdle 은 착지 후에 발화한다.
     타임아웃을 짧게 걸어 경주시키면 저사양 기기에서 6MB 쓰기가 아직 날고 있는데
     먼저 읽어 **거짓 불합격**이 뜬다 — 하필 이 진단이 가장 필요한 그 기기에서.
     그래서 타임아웃은 판정 신호가 아니라 **먹통 방지 밧줄**(길게)이고,
     밧줄로 빠져나왔다는 사실 자체를 돌려줘 호출부가 정직하게 말할 수 있게 한다.
     반환: true = 쓰기 착지 확인 / false = 시간 안에 못 끝남(불합격 아님) */
  const settle = (win, hangMs) => new Promise((res) => {
    const S = win.MK_STORE;
    let d = false;
    const fin = (v) => { if (!d) { d = true; res(v); } };
    setTimeout(() => fin(false), hangMs || 20000);
    if (S && typeof S.whenIdle === 'function') { try { S.whenIdle(() => fin(true)); } catch (_) { fin(true); } return; }
    setTimeout(() => fin(true), 800);       /* 구버전 배포 — whenIdle 이 없으면 짧게 대기 */
  });

  /* ---------- 탐침: R116 ---------- */
  async function probeStore(win, out) {
    const S = win.MK_STORE;
    if (!S) { ['idb-open', 'idb-disk', 'idb-survive', 'idb-bulk'].forEach((id) => out.push(R(id, 'fail', 'MK_STORE 가 없어요 — 부팅이 덜 됐거나 배포가 옛 버전이에요'))); return; }

    /* ① 실개통 */
    if (S.ready && !S.degraded) out.push(R('idb-open', 'pass', 'IDB 로 열렸고 폴백 아님'));
    else if (S.ready && S.degraded) out.push(R('idb-open', 'fail', 'IDB 는 열렸지만 degraded — 쓰기가 localStorage 로 새고 있어요'));
    else out.push(R('idb-open', 'fail', 'IDB 미개통(ready=false) — 이 브라우저는 종전 localStorage 경로예요', '사생활 보호 모드면 정상 동작이에요'));

    const db = await rawIDB(win);

    /* ② 디스크 왕복 — MK_STORE 로 쓰고, 별도 연결로 읽는다 */
    const stamp = 'v' + Date.now();
    try { S.setItem(BULK + ':probe', stamp); } catch (_) {}
    const landed = await settle(win);
    if (!db) out.push(R('idb-disk', 'fail', 'IDB 를 직접 열지 못했어요 — 디스크에 앉았는지 확인 불가'));
    else if (!landed) out.push(R('idb-disk', 'skip', '쓰기가 시간 안에 안 끝났어요 — 불합격이 아니라 미확정이에요', '다시 검사해 주세요'));
    else {
      const got = await rawGet(db, BULK + ':probe');
      if (got === stamp) out.push(R('idb-disk', 'pass', '별도 연결로 읽어 같은 값 — 메모리가 아니라 디스크'));
      else out.push(R('idb-disk', 'fail', '별도 연결에서 값이 다르거나 없어요', '읽은 값: ' + String(got)));
    }

    /* ③ 새로고침 생존 — 이전 방문 표식이 디스크에서 돌아오나.
       첫 방문은 증명할 게 없다. 「합격」이라 말하면 거짓이므로 미확정(skip). */
    let prev;
    if (db) prev = await rawGet(db, VISIT);
    const now = String(Date.now());
    try { S.setItem(VISIT, now); } catch (_) {}
    if (!db) out.push(R('idb-survive', 'fail', 'IDB 를 못 열어 확인 불가'));
    else if (prev === undefined || prev === null) out.push(R('idb-survive', 'skip', '이번이 첫 검사 — 표식을 심었어요. 새로고침 후 한 번 더 검사하면 확정돼요'));
    else {
      const ago = Math.max(0, Date.now() - (+prev || 0));
      out.push(R('idb-survive', 'pass', '이전 검사 기록이 디스크에서 살아 돌아왔어요', ago < 86400000 ? Math.round(ago / 1000) + '초 전 기록' : '이전 방문 기록'));
    }

    /* ④ 5MB 벽 — localStorage 가 죽던 크기 */
    const big = new Array(6 * 1024 * 1024 / 16 + 1).join('0123456789abcdef'); /* ≈6MB */
    let wrote = true;
    try { S.setItem(BULK, big); } catch (_) { wrote = false; }
    const bulkLanded = await settle(win);
    if (!wrote) out.push(R('idb-bulk', 'fail', '6MB 쓰기가 예외로 죽었어요'));
    else if (S.degraded) out.push(R('idb-bulk', 'fail', '6MB 쓰기 후 degraded — 내구 저장에 실패했어요'));
    else if (!bulkLanded) out.push(R('idb-bulk', 'skip', '6MB 쓰기가 시간 안에 안 끝났어요 — 느린 기기일 뿐 불합격이 아니에요', '다시 검사해 주세요'));
    else if (!db) out.push(R('idb-bulk', 'skip', '6MB 를 썼지만 IDB 직접 확인 불가'));
    else {
      const back = await rawGet(db, BULK);
      if (typeof back === 'string' && back.length === big.length) out.push(R('idb-bulk', 'pass', '약 6MB 저장·복원 성공 (localStorage 였다면 죽던 크기)'));
      else out.push(R('idb-bulk', 'fail', '6MB 가 디스크에서 온전히 안 돌아왔어요', '길이: ' + (back && back.length)));
    }
    /* 뒷정리 — 진단이 6MB 쓰레기를 남기지 않는다. 생존 표식(VISIT)만 남긴다. */
    try { S.removeItem(BULK); S.removeItem(BULK + ':probe'); } catch (_) {}
    try { if (db) db.close(); } catch (_) {}
  }

  /* ---------- 탐침 무대 ----------
     화면 밖 고정 px 무대. 요소 좌표가 %라 무대 px 을 알면 실 px 이 결정된다. */
  const STAGE = { w: 640, h: 360 };
  function stageEl(win, html) {
    const d = win.document;
    const host = d.createElement('div');
    host.setAttribute('data-sc-stage', '1');
    host.style.cssText = `position:fixed;left:-99999px;top:0;width:${STAGE.w}px;height:${STAGE.h}px;overflow:hidden;contain:layout size style`;
    host.innerHTML = html;
    d.body.appendChild(host);
    return host;
  }
  const PX = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  /* ---------- 탐침: R117 ---------- */
  function probeFocus(win, out) {
    const P = win.MK_PLAY, F = win.MK_FOCAL;
    if (!P || !P.sceneHTML || !F) { ['focus-origin', 'focus-none'].forEach((id) => out.push(R(id, 'fail', 'MK_PLAY·MK_FOCAL 이 없어요'))); return; }
    const mk = (focal) => ({
      duration: 4, width: 1280, height: 720,
      elements: [{ kind: 'image', src: PX, x: 10, y: 20, w: 50, h: 60, focal: focal, anim: { preset: 'fade', idle: 'kb-zoom-in', idleDur: 4 } }],
    });

    /* ① 초점 있는 사진 — 실해결 px 축이 초점 자리인가 */
    let host = null;
    try {
      host = stageEl(win, P.sceneHTML(mk({ x: 0.3, y: 0.8 })));
      const node = host.querySelector('.mkp-el.mkp-img');
      if (!node) throw new Error('요소 미발견');
      const o = parseOrigin(win.getComputedStyle(node).transformOrigin);
      const ew = STAGE.w * 0.5, eh = STAGE.h * 0.6;
      const want = [ew * 0.3, eh * 0.8];
      if (!o) out.push(R('focus-origin', 'fail', '축을 px 로 읽지 못했어요'));
      else if (Math.abs(o[0] - want[0]) <= 1 && Math.abs(o[1] - want[1]) <= 1)
        out.push(R('focus-origin', 'pass', '실해결 축이 초점과 일치', `축 ${o[0].toFixed(1)}·${o[1].toFixed(1)}px = 초점 30%·80%`));
      else out.push(R('focus-origin', 'fail', '실해결 축이 초점과 어긋나요', `읽음 ${o[0].toFixed(1)}·${o[1].toFixed(1)} / 기대 ${want[0].toFixed(1)}·${want[1].toFixed(1)}px`));
    } catch (e) { out.push(R('focus-origin', 'fail', '탐침 실패', e.message)); }
    finally { if (host) host.remove(); }

    /* ② 무초점 — 정확히 가운데(회귀) */
    host = null;
    try {
      host = stageEl(win, P.sceneHTML(mk(null)));
      const node = host.querySelector('.mkp-el.mkp-img');
      if (!node) throw new Error('요소 미발견');
      const o = parseOrigin(win.getComputedStyle(node).transformOrigin);
      const want = [STAGE.w * 0.5 / 2, STAGE.h * 0.6 / 2];
      if (o && Math.abs(o[0] - want[0]) <= 1 && Math.abs(o[1] - want[1]) <= 1)
        out.push(R('focus-none', 'pass', '무초점은 정확히 가운데 축 — 종전 그대로'));
      else out.push(R('focus-none', 'fail', '무초점인데 축이 가운데가 아니에요', o ? `읽음 ${o[0].toFixed(1)}·${o[1].toFixed(1)}px` : '축 못 읽음'));
    } catch (e) { out.push(R('focus-none', 'fail', '탐침 실패', e.message)); }
    finally { if (host) host.remove(); }
  }

  /* ---------- 탐침: R119 ---------- */
  const ROT = 24, SCL = 1.18, FOC = { x: 0.28, y: 0.82 };

  function probeRot(win, out) {
    const P = win.MK_PLAY, F = win.MK_FOCAL;
    if (!P || !P.sceneHTML || !F || !F.rotPivot) { ['rot-nest', 'rot-parity', 'rot-pan'].forEach((id) => out.push(R(id, 'fail', 'MK_PLAY·MK_FOCAL.rotPivot 이 없어요 — 배포가 R119 이전이에요'))); return; }
    const mk = (idle) => ({
      duration: 4, width: 1280, height: 720,
      elements: [{ kind: 'image', src: PX, x: 10, y: 20, w: 50, h: 60, rot: ROT, focal: FOC, anim: { preset: 'fade', idle: idle, idleDur: 4 } }],
    });
    const ex = STAGE.w * 0.1, ey = STAGE.h * 0.2, ew = STAGE.w * 0.5, eh = STAGE.h * 0.6;
    const cx = ew / 2, cy = eh / 2;               /* 요소 로컬 좌표의 중앙 */

    let host = null;
    try {
      host = stageEl(win, P.sceneHTML(mk('kb-zoom-in')));
      const outer = host.querySelector('.mkp-el.mkp-img');
      const inner = outer && outer.querySelector('.mkp-inner');
      if (!outer || !inner) throw new Error('중첩 구조 미발견');

      const oOri = parseOrigin(win.getComputedStyle(outer).transformOrigin);
      const iOri = parseOrigin(win.getComputedStyle(inner).transformOrigin);

      /* ① 두 축이 실제로 갈려 있나 — 바깥=중앙, 안쪽=초점 */
      const okOuter = oOri && Math.abs(oOri[0] - cx) <= 1 && Math.abs(oOri[1] - cy) <= 1;
      const okInner = iOri && Math.abs(iOri[0] - ew * FOC.x) <= 1 && Math.abs(iOri[1] - eh * FOC.y) <= 1;
      if (okOuter && okInner) out.push(R('rot-nest', 'pass', '바깥=중앙축·안쪽=초점축, 두 축이 실제로 갈렸어요',
        `바깥 ${oOri[0].toFixed(1)}·${oOri[1].toFixed(1)} / 안쪽 ${iOri[0].toFixed(1)}·${iOri[1].toFixed(1)}px`));
      else out.push(R('rot-nest', 'fail', '축 분리가 실측에서 성립하지 않아요',
        `바깥 ${oOri ? oOri.join('·') : '?'} (기대 ${cx}·${cy}) / 안쪽 ${iOri ? iOri.join('·') : '?'} (기대 ${(ew * FOC.x).toFixed(1)}·${(eh * FOC.y).toFixed(1)})`));

      /* ② 브라우저 합성 == 캔버스 켤레 수학.
         켄번즈는 시간에 따라 변해 결정론이 안 서므로, 안쪽 scale 을 고정값으로
         **대체**해 축만 남긴다 — R119 가 바꾼 것이 축이지 배율이 아니기 때문이다.
         (정직 표기: 이 검사는 「고정 배율에서의 축 동치」를 증명한다.) */
      inner.style.animation = 'none';
      inner.style.transform = 'scale(' + SCL + ')';
      const oM = parseMatrix(win.getComputedStyle(outer).transform);
      const iM = parseMatrix(win.getComputedStyle(inner).transform);
      const oO = parseOrigin(win.getComputedStyle(outer).transformOrigin);
      const iO = parseOrigin(win.getComputedStyle(inner).transformOrigin);
      if (!oM || !iM || !oO || !iO) throw new Error('행렬·축을 읽지 못했어요');

      /* 브라우저가 실제로 만든 net (부모 ∘ 자식, 각자 자기 축 기준) */
      const browserNet = mul(about(oM, oO[0], oO[1]), about(iM, iO[0], iO[1]));
      /* MP4 세계 — 같은 요소의 캔버스 피벗을 실제 엔진에서 얻는다 */
      const pv = F.rotPivot({ rot: ROT, focal: FOC }, ex, ey, ew, eh);
      if (!pv) throw new Error('rotPivot 이 null 을 돌려줬어요');
      const mp4Net = canvasNet(ROT, cx, cy, SCL, pv.px - ex, pv.py - ey);   /* 요소 로컬 좌표로 */
      const d = maxDiff(browserNet, mp4Net);
      if (near(browserNet, mp4Net, 0.02))
        out.push(R('rot-parity', 'pass', '브라우저가 합성한 행렬 = MP4 켤레 피벗 수학', '최대 오차 ' + d.toExponential(1)));
      else out.push(R('rot-parity', 'fail', '재생과 MP4 의 변환이 어긋나요 — 화면과 파일이 달라집니다',
        `최대 오차 ${d.toExponential(2)} / 브라우저 [${browserNet.map((v) => v.toFixed(3))}] / MP4 [${mp4Net.map((v) => v.toFixed(3))}]`));
    } catch (e) {
      out.push(R('rot-nest', 'fail', '탐침 실패', e.message));
      out.push(R('rot-parity', 'fail', '탐침 실패', e.message));
    } finally { if (host) host.remove(); }

    /* ③ pan 은 제외 — 종전 단일 구조 */
    host = null;
    try {
      host = stageEl(win, P.sceneHTML(mk('kb-pan-left')));
      const outer = host.querySelector('.mkp-el.mkp-img');
      if (!outer) throw new Error('요소 미발견');
      if (!outer.querySelector('.mkp-inner')) out.push(R('rot-pan', 'pass', '회전+pan 은 중첩 없이 종전 구조 그대로'));
      else out.push(R('rot-pan', 'fail', 'pan 인데 축 분리가 걸렸어요 — 켤레가 pan 축을 돌려 어긋납니다'));
    } catch (e) { out.push(R('rot-pan', 'fail', '탐침 실패', e.message)); }
    finally { if (host) host.remove(); }
  }

  /* ---------- 실행 ---------- */
  async function run(w) {
    const win = w || window;
    const sup = supported(win);
    if (!sup.ok) return { results: [], skipped: sup.why };
    const out = [];
    try { await probeStore(win, out); } catch (e) { out.push(R('idb-open', 'fail', '저장 탐침이 예외로 죽었어요', e.message)); }
    try { probeFocus(win, out); } catch (e) { out.push(R('focus-origin', 'fail', '초점 탐침이 예외로 죽었어요', e.message)); }
    try { probeRot(win, out); } catch (e) { out.push(R('rot-nest', 'fail', '회전 탐침이 예외로 죽었어요', e.message)); }
    return { results: out, skipped: '' };
  }

  /* ---------- 자가 검증 (순수부만 — 이 파일이 스스로 옳은지) ---------- */
  const audit = () => {
    const v = [];
    /* 행렬 대수 */
    if (!near(mul(I(), I()), I())) v.push('단위행렬 곱 위반');
    if (!near(about(rotM(90), 0, 0), rotM(90))) v.push('원점 축 about 위반');
    /* 90° 를 (10,0) 축으로 → 점 (10,0) 은 불변이어야 한다 */
    const m = about(rotM(90), 10, 0);
    if (Math.abs(m[0] * 10 + m[4] - 10) > 1e-9 || Math.abs(m[1] * 10 + m[5] - 0) > 1e-9) v.push('about 불변점 위반');
    /* 축을 준 scale 은 그 축을 고정한다 */
    const s = about(scaleM(2), 30, 40);
    if (Math.abs(s[0] * 30 + s[4] - 30) > 1e-9 || Math.abs(s[3] * 40 + s[5] - 40) > 1e-9) v.push('scale 축 고정 위반');
    /* ★ R119 켤레 항등: cssNet == canvasNet (P = R(θ,C)·Fs) — 이 파일의 존재 이유 */
    const F = window.MK_FOCAL;
    if (F && F.rotPivot) {
      [[24, 1.18, 0.28, 0.82], [90, 1.5, 0.3, 1], [-37, 2, 0, 0.25], [200, 1.05, 0.9, 0.1]].forEach(([deg, sc, fx, fy]) => {
        const ew = 320, eh = 216, cx = ew / 2, cy = eh / 2;
        const pv = F.rotPivot({ rot: deg, focal: { x: fx, y: fy } }, 0, 0, ew, eh);
        if (!pv) { v.push('rotPivot null (' + deg + ')'); return; }
        const A = cssNet(deg, cx, cy, sc, ew * fx, eh * fy);
        const B = canvasNet(deg, cx, cy, sc, pv.px, pv.py);
        if (!near(A, B, 1e-9)) v.push('켤레 항등 위반 (' + deg + '°) 오차 ' + maxDiff(A, B).toExponential(2));
      });
      /* 반례 — 중앙 피벗(옛 세계)은 초점과 일치하면 안 된다(검사가 무엇이든 통과시키지 않음) */
      const ew = 320, eh = 216;
      if (near(cssNet(24, ew / 2, eh / 2, 1.4, ew * 0.28, eh * 0.82), canvasNet(24, ew / 2, eh / 2, 1.4, ew / 2, eh / 2), 1e-6)) v.push('반례 미검출 — 옛 중앙 피벗이 통과함');
    }
    /* 파서 */
    if (!near(parseMatrix('matrix(1, 0, 0, 1, 5, 6)'), [1, 0, 0, 1, 5, 6])) v.push('parseMatrix 2d 위반');
    if (!near(parseMatrix('none'), I())) v.push('parseMatrix none 위반');
    if (parseMatrix('rotate(20deg)') !== null) v.push('parseMatrix 미해결 문자열 위반');
    const po = parseOrigin('12.5px 30px');
    if (!po || po[0] !== 12.5 || po[1] !== 30) v.push('parseOrigin 위반');
    if (parseOrigin('') !== null) v.push('parseOrigin 빈값 위반');
    /* 판정 — 건너뜀은 합격이 아니다 */
    if (verdict([{ state: 'pass' }, { state: 'skip' }]).ok) v.push('skip 을 합격으로 셈');
    if (!verdict([{ state: 'pass' }]).ok) v.push('전량 합격 판정 위반');
    if (verdict([]).ok) v.push('빈 결과를 합격으로 셈');
    if (verdict([{ state: 'fail' }, { state: 'pass' }]).fail !== 1) v.push('불합격 집계 위반');
    /* 명세 */
    if (CHECKS.length !== 9) v.push('검사 명세 수 변경');
    if (!CHECKS.every((c) => c.id && c.round && c.title && c.proves && c.blind)) v.push('명세 항목 누락');
    if (new Set(CHECKS.map((c) => c.id)).size !== CHECKS.length) v.push('명세 id 중복');
    return { ok: !v.length, violations: v };
  };

  return {
    CHECKS, EYES, STAGE, VISIT, DB, ST,
    I, T, rotM, scaleM, mul, about, near, maxDiff, parseMatrix, parseOrigin,
    cssNet, canvasNet, verdict, supported, run, settle, audit,
  };
})();

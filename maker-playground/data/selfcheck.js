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
    /* R121 — 준호가 실기기에서 직접 잡아낸 결함의 회귀 감시.
       R88·R90·R95 는 전부 실브라우저에서만 드러났고, 지금 스위트는 「처방의 흔적」
       (scrollIntoView 호출·CSS 선언 문자열)까지만 지킨다. 증상 자체를 밟는 눈은
       준호 하나였다 — 같은 결함이 돌아와도 아무 불이 안 켜진다. */
    { id: 'touch-hit', round: 'R95', title: '손가락이 핸들을 잡는다',
      proves: '핸들의 실히트 영역이 손끝 크기만큼 실제로 넓다(보이는 8px 이 아니라)',
      blind: 'jsdom 엔 elementFromPoint 도 가상요소(::after) 레이아웃도 없다' },
    { id: 'anim-live', round: 'R90', title: '등장 애니가 살아서 해결된다',
      proves: '브라우저가 애니 선언을 실제로 받아들였고 끝나면 요소가 보인다',
      blind: 'jsdom 은 animation 단축선언을 실해결하지 않는다(콤마 하나로 죽던 자리)' },
    /* R122 — 내보내기. R38 부터 84라운드 이월된, 정본 전체에서 가장 오래되고
       가장 큰 미검증 자리다. 63개 엔진 스위트가 검증한 건 전부 「계획(plan)」
       계층까지고, **실제로 바이트가 나오는지는 아무도 확인한 적이 없다.**
       학생이 사진 고르고 영상 만들고 마지막에 누르는 버튼이 이 제품의 종착점인데,
       폰에서 깨져도 지금은 알 방법이 없었다. */
    { id: 'enc-support', round: 'R38', title: '이 기기 인코더가 우리 설정을 받나',
      proves: '내보내기가 실제로 쓰는 코덱·치수를 인코더에 물어 지원을 확정한다',
      blind: 'jsdom 에 VideoEncoder 가 없다 — 저장소 전체가 isConfigSupported 를 한 번도 안 불렀다' },
    { id: 'muxer-reach', round: 'R38', title: 'MP4 모듈이 이 망에서 닿나',
      proves: '먹서를 CDN 에서 실제로 받아온다 — 못 받으면 내보내기가 통째로 죽는다',
      blind: 'jsdom 은 네트워크를 안 탄다. 학교 방화벽은 여기서만 드러난다' },
    { id: 'enc-bytes', round: 'R38', title: '★ 진짜 MP4 바이트가 나온다',
      proves: '2프레임을 실제로 인코딩·먹싱해 ftyp 박스가 있는 MP4 가 손에 잡힌다',
      blind: '종단 증명 — 계획 계층만 덮는 스위트로는 원리적으로 닿을 수 없다' },
    { id: 'audio-cfg', round: 'R39', title: '소리 트랙을 얹을 수 있나',
      proves: 'AAC 설정 지원과 오프라인 오디오 해독기가 이 기기에 실제로 있다',
      blind: 'jsdom 에 AudioEncoder·OfflineAudioContext 가 없다(typeof 만 보고 있었다)' },
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

  /* ---------- R123: 결과를 기기 밖으로 옮기는 길 ----------
     R120·R121 은 「전부 합격이라 전달할 실패가 없다」며 두 번 미뤘다. R122 부터는
     전달할 실패가 생긴다 — 그런데 준호가 폰에서 본 걸 옮길 방법이 **스크린샷뿐**
     이고 스크린샷은 detail 문자열을 자른다(불합격의 정보 대부분이 거기 있다).

     ⚠ 이 함수는 값을 **읽기만** 한다 — 코덱·주소를 자기가 적으면 §5-③ 위반이라
     초록불이 「지금 이 코드가 된다」를 뜻하지 않게 된다. 전부 정본에서 가져온다.
     버스터를 같이 싣는 까닭: 지난 라운드마다 「배포 도달 전이었을 가능성」으로
     결함 판정이 흐려졌다. 어느 버전을 밟았는지가 결과에 붙어 와야 한다. */
  function busterOf(win) {
    try {
      const ss = win.document.querySelectorAll('script[src]');
      for (let i = 0; i < ss.length; i++) {
        const m = /[?&]v=([^&"']+)/.exec(ss[i].getAttribute('src') || '');
        if (m) return m[1];
      }
    } catch (_) {}
    return '';
  }

  function reportText(win, results) {
    const w = win || window;
    const nav = w.navigator || {};
    const V = w.MK_VIDEO;
    const S = V && V.EXPORT_SPEC;
    const rows = (Array.isArray(results) ? results : []).map((r) => {
      const c = CHECKS.find((x) => x.id === r.id);
      return { id: r.id, round: (c && c.round) || '', state: r.state,
        msg: r.msg || '', detail: r.detail || '' };
    });
    const obj = {
      kind: 'kmaker-selfcheck',
      at: new Date().toISOString(),
      buster: busterOf(w),
      url: (w.location && w.location.href) || '',
      verdict: verdict(results),
      env: {
        ua: nav.userAgent || '',
        platform: nav.platform || '',
        lang: nav.language || '',
        online: nav.onLine !== false,
        viewport: `${w.innerWidth || 0}×${w.innerHeight || 0}`,
        dpr: w.devicePixelRatio || 1,
        webcodecs: typeof w.VideoEncoder !== 'undefined',
        audioencoder: typeof w.AudioEncoder !== 'undefined',
        indexeddb: !!w.indexedDB,
      },
      /* 정본에서 읽는다 — 여기에 값을 적지 않는다 */
      spec: S ? { vcodec: S.vcodec, acodec: S.acodec, targetMin: S.targetMin, muxerUrl: S.muxerUrl } : null,
      ladder: (V && V.VIDEO_LADDER ? V.VIDEO_LADDER : []).map((r) => `${r.label} | ${r.codec} | ${r.targetMin}p | ${r.bitrate}`),
      checks: rows,
    };
    return JSON.stringify(obj, null, 2);
  }

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

  /* ---------- 히트 무대 (R121) ----------
     stageEl 은 left:-99999px 라 elementFromPoint 가 닿지 않는다. 히트 판정만은
     화면 안에 있어야 브라우저가 답한다 — 투명하게 띄우고 동기로 재고 즉시 걷는다.
     (opacity:0 은 히트가 살아 있고 visibility:hidden 은 죽는다 — 여기선 전자라야 한다.) */
  function stageHit(win, html) {
    const d = win.document;
    const host = d.createElement('div');
    host.setAttribute('data-sc-hit', '1');
    host.style.cssText = `position:fixed;left:0;top:0;width:${STAGE.w}px;height:${STAGE.h}px;`
      + 'opacity:0;z-index:2147483647;overflow:visible';
    host.innerHTML = html;
    d.body.appendChild(host);
    return host;
  }

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

  /* ---------- 탐침: R95 회귀 (손가락 히트) ----------
     R95 는 「핸들 8px vs 손가락 접촉면 ~40px」이었다. 처방의 한 축이 순수 CSS
     (.ws-hd::after 34px 히트패드 + coarse 확대)인데, 그 CSS 가 실제로 히트 영역을
     만드는지는 브라우저만 안다. 분업이 이렇게 선다:
       · jsdom(R95 T6) = workspace 가 .ws-hd 클래스를 붙인다
       · 여기(R121)   = 그 클래스가 실제로 손끝만 한 과녁을 만든다
     둘이 합쳐져야 「손가락이 핸들을 잡는다」가 증명된다. */
  const HIT_MIN = 12;                      /* 이 거리까지 빗나가도 잡혀야 한다(px) */
  const HIT_OLD = 7;                       /* 옛 세계 상한 — 여기 갇히면 회귀다 */

  function probeTouch(win, out) {
    const d = win.document;
    if (typeof d.elementFromPoint !== 'function') {
      out.push(R('touch-hit', 'skip', '이 브라우저에서 좌표 히트를 물어볼 수 없어요'));
      return;
    }
    let host = null;
    try {
      /* workspace 의 핸들 마크업과 같은 클래스 계약(.ws-el > .ws-hd.br).
         무대 안이라 좌표가 결정론이다. */
      host = stageHit(win,
        '<div class="ws-el media sel" style="left:120px;top:90px;width:200px;height:120px">'
        + '<i class="ws-hd br"></i></div>');
      const hd = host.querySelector('.ws-hd.br');
      if (!hd) throw new Error('핸들 미발견');
      const r = hd.getBoundingClientRect();
      if (!(r.width > 0)) { out.push(R('touch-hit', 'skip', '핸들이 아직 배치되지 않았어요')); return; }
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;

      /* 중심에서 축 방향으로 밀어 가며 「여기까지 잡히나」를 실제로 물어본다.
         가상요소는 자기 부모를 히트 대상으로 돌려준다 — hd 자신이면 성공. */
      const hits = (dx, dy) => {
        const t = d.elementFromPoint(Math.round(cx + dx), Math.round(cy + dy));
        return !!(t && (t === hd || hd.contains(t)));
      };
      let reach = 0;
      for (let k = 1; k <= 20; k++) {
        if (hits(k, 0) && hits(-k, 0) && hits(0, k) && hits(0, -k)) reach = k; else break;
      }
      const detail = `실측 히트 반경 ${reach}px (보이는 핸들 ${r.width.toFixed(0)}px)`;
      if (reach >= HIT_MIN) out.push(R('touch-hit', 'pass', '핸들이 손끝만 한 과녁을 실제로 가졌어요', detail));
      else if (reach <= HIT_OLD) out.push(R('touch-hit', 'fail', '히트 영역이 옛 세계로 돌아갔어요 — 태블릿에서 리사이즈가 안 잡힙니다', detail + ` / 필요 ${HIT_MIN}px 이상`));
      else out.push(R('touch-hit', 'fail', '히트 영역이 손끝에 못 미쳐요', detail + ` / 필요 ${HIT_MIN}px 이상`));
    } catch (e) { out.push(R('touch-hit', 'fail', '탐침 실패', e.message)); }
    finally { if (host) host.remove(); }
  }

  /* ---------- 탐침: R90 회귀 (등장 애니 실해결) ----------
     R90 은 콤마 하나가 애니 선언을 통째로 무효로 만들어 재생 장면이 빈 종이가 된
     사건이다(computed opacity 0 · animationName "none"). 문법의 심판은 브라우저의
     CSS 파서 하나뿐 — jsdom 의 cssstyle 은 animation 단축선언을 실해결하지 않아
     깨진 문자열도 조용히 통과시킨다. */
  function probeAnim(win, out) {
    const P = win.MK_PLAY;
    if (!P || !P.sceneHTML) { out.push(R('anim-live', 'fail', 'MK_PLAY.sceneHTML 이 없어요')); return; }
    let host = null;
    try {
      const scene = {
        duration: 4, width: 1280, height: 720,
        elements: [{ kind: 'image', src: PX, x: 10, y: 20, w: 50, h: 60,
          anim: { preset: 'fade', idle: 'kb-zoom-in', idleDur: 4 } }],
      };
      host = stageEl(win, P.sceneHTML(scene));
      const node = host.querySelector('.mkp-el');
      if (!node) throw new Error('요소 미발견');

      const name = String(win.getComputedStyle(node).animationName || '');
      if (!name || name === 'none') {
        out.push(R('anim-live', 'fail', '브라우저가 애니 선언을 못 받아들였어요 — 재생 장면이 빈 종이가 됩니다',
          'animationName = ' + (name || '(빈값)')));
        return;
      }
      /* 등장이 끝난 시점으로 강제로 밀어 「그래서 보이나」를 본다.
         선언 개수만큼 음수 지연을 맞춰 준다(개수가 어긋나면 브라우저가 통째로 무시). */
      const n = name.split(',').length;
      node.style.animationDelay = new Array(n).fill('-30s').join(',');
      const op = parseFloat(win.getComputedStyle(node).opacity);
      if (isFinite(op) && op >= 0.9)
        out.push(R('anim-live', 'pass', '애니가 실해결됐고 등장 뒤 요소가 보여요',
          `${n}개 선언 · 등장 후 불투명도 ${op.toFixed(2)}`));
      else
        out.push(R('anim-live', 'fail', '등장이 끝났는데 요소가 투명해요 — 빈 장면으로 재생됩니다',
          `불투명도 ${isFinite(op) ? op.toFixed(2) : '?'} / ${name}`));
    } catch (e) { out.push(R('anim-live', 'fail', '탐침 실패', e.message)); }
    finally { if (host) host.remove(); }
  }

  /* ---------- 탐침: R38·R39 내보내기 ----------
     ★ 이 탐침은 코덱 문자열도 CDN 주소도 출력 치수도 **자기가 적지 않는다.**
     전부 MK_VIDEO.EXPORT_SPEC 에서 읽는다. 내보내기가 코덱을 바꾸면 탐침이
     저절로 새 코덱을 묻는다 — 안 그러면 초록불이 「지금 이 코드가 된다」를
     뜻하지 않게 되고, 그건 검사가 아니라 착시다(R117 정본 규약과 같은 결).

     밧줄: 인코더 질의·CDN·인코딩 전부 응답 없는 환경이 있다. 시간 안에 못
     끝난 것을 불합격이라 부르면 느린 기기에서 거짓 경보가 뜬다 — 다만 CDN
     미도달은 「느린 것」이 아니라 그 자체가 발견이므로 정직하게 불합격이다. */
  const ROPE = { __rope: true };
  const rope = (p, ms) => Promise.race([
    Promise.resolve(p).catch(() => ROPE),
    new Promise((res) => setTimeout(() => res(ROPE), ms)),
  ]);

  async function probeExport(win, out) {
    const V = win.MK_VIDEO;
    const IDS = ['enc-support', 'muxer-reach', 'enc-bytes', 'audio-cfg'];
    if (!V || !V.EXPORT_SPEC || typeof V.outSize !== 'function' || typeof V.loadMuxer !== 'function') {
      IDS.forEach((id) => out.push(R(id, 'fail', '내보내기 정본(MK_VIDEO.EXPORT_SPEC)이 없어요 — 배포가 R122 이전이에요')));
      return;
    }
    const SPEC = V.EXPORT_SPEC;
    const VE = win.VideoEncoder, AE = win.AudioEncoder;
    const LADN = (v) => (v && v.VIDEO_LADDER ? v.VIDEO_LADDER.length : 1);

    /* ① enc-support — R123: 맹목 configure 도, 탐침의 자체 훑기도 그만둔다.
       **내보내기가 실제로 부르는 pickVideoRung 을 그대로 부른다** — 탐침이 따로
       훑으면 「탐침은 3단이라는데 제품은 1단으로 죽는」 어긋남이 생긴다. */
    let vSup = false, pick = null;
    if (typeof VE === 'undefined') {
      out.push(R('enc-support', 'skip', '이 브라우저엔 VideoEncoder 가 없어요 — 여기선 영상 저장 자체가 안 돼요',
        '불합격이 아니라 미확정이에요. 크롬·엣지에서 다시 검사해 주세요'));
    } else if (typeof VE.isConfigSupported !== 'function') {
      out.push(R('enc-support', 'fail', 'isConfigSupported 가 없어 지원 여부를 물어볼 수 없어요'));
    } else if (typeof V.pickVideoRung !== 'function') {
      out.push(R('enc-support', 'fail', '폴백 사다리(pickVideoRung)가 없어요 — 배포가 R123 이전이에요'));
    } else {
      const got = await rope(V.pickVideoRung(win, 1280, 720), 12000);
      const bmp = typeof win.createImageBitmap === 'function';
      if (got === ROPE) out.push(R('enc-support', 'skip', '지원 여부 질의가 시간 안에 안 끝났어요', '다시 검사해 주세요'));
      else if (!got || !got.rung) {
        out.push(R('enc-support', 'fail', '이 기기 인코더가 사다리 어느 단도 안 받아요 — 내보내기가 여기서 죽습니다',
          '거절당한 단: ' + ((got && got.tried) || []).join(' / ')));
      } else {
        vSup = true; pick = got;
        const top = got.index === 0;
        const where = `${got.rung.label} · ${got.rung.codec} ${got.W}×${got.H}`;
        if (!bmp) out.push(R('enc-support', 'fail', `${where} 는 되는데 createImageBitmap 이 없어요 — 삽입 영상이 있는 작품이 죽어요`));
        else if (top) out.push(R('enc-support', 'pass', `1단 그대로 통과 — ${where}`, `사다리 ${LADN(V)}단 중 1단`));
        else out.push(R('enc-support', 'pass', `${got.index + 1}단까지 내려가서 통과 — ${where}`,
          '거절당한 윗단: ' + (got.tried || []).join(' / ') + ' — 이 기기에선 그만큼 낮은 화질로 저장돼요'));
      }
    }

    /* ② muxer-reach — 학교 방화벽. jsdom 이 절대 못 잡고, 여기가 막히면 내보내기 전체가 죽는다 */
    let muxOK = !!win.Mp4Muxer;
    if (muxOK) out.push(R('muxer-reach', 'pass', 'MP4 모듈이 이미 올라와 있어요'));
    else {
      const t0 = Date.now();
      const got = await rope(V.loadMuxer(), 10000);
      const ms = Date.now() - t0;
      muxOK = !!win.Mp4Muxer;
      if (muxOK) out.push(R('muxer-reach', 'pass', `CDN 에서 MP4 모듈을 받았어요 (${ms}ms)`, SPEC.muxerUrl));
      else if (got === ROPE) out.push(R('muxer-reach', 'fail', '10초 안에 MP4 모듈을 못 받았어요 — 이 망에서는 내보내기가 통째로 죽어요',
        '학교 방화벽이 cdn.jsdelivr.net 을 막는 경우예요. 자체 호스팅이 필요합니다'));
      else out.push(R('muxer-reach', 'fail', 'MP4 모듈을 불러오지 못했어요', SPEC.muxerUrl));
    }

    /* ③ enc-bytes — 종단 증명. 여기까지 밟혀야 「바이트가 실제로 나온다」가 성립한다 */
    if (!vSup) out.push(R('enc-bytes', 'skip', '인코더 지원이 확정되지 않아 실인코딩을 건너뛰었어요'));
    else if (!muxOK) out.push(R('enc-bytes', 'skip', 'MP4 모듈이 없어 먹싱까지 못 밟았어요', '인코더는 살아 있지만 종단 증명은 미확정이에요'));
    else {
      const r = await rope(encodeTwoFrames(win, SPEC, pick.W, pick.H, pick.rung), 20000);
      if (r === ROPE) out.push(R('enc-bytes', 'skip', '2프레임 인코딩이 시간 안에 안 끝났어요 — 느린 기기일 뿐 불합격이 아니에요', '다시 검사해 주세요'));
      else if (r.ok) out.push(R('enc-bytes', 'pass', `진짜 MP4 ${r.bytes.toLocaleString()}바이트 · ftyp 확인`, `${pick.W}×${pick.H} 2프레임 · ${r.ms}ms · ${pick.rung.label}`));
      else out.push(R('enc-bytes', 'fail', '바이트가 안 나왔어요 — 학생이 마지막에 누르는 버튼이 이 기기에서 깨집니다', r.why));
    }

    /* ④ audio-cfg — typeof 만 보던 자리를 실제 질의로 바꾼다 */
    const OAC = win.OfflineAudioContext || win.webkitOfflineAudioContext;
    if (typeof AE === 'undefined') {
      out.push(R('audio-cfg', 'skip', '이 브라우저엔 AudioEncoder 가 없어요 — 영상은 무음으로 저장돼요',
        '내보내기는 이 경우를 이미 안내문으로 처리해요(불합격 아님)'));
    } else if (typeof AE.isConfigSupported !== 'function') {
      out.push(R('audio-cfg', 'fail', 'AudioEncoder 는 있는데 지원 질의가 없어요'));
    } else {
      /* R123 — 탐침이 자체 질의하던 자리를 내보내기와 같은 pickAudio 로 */
      const asup = await rope(typeof V.pickAudio === 'function' ? V.pickAudio(win) : Promise.resolve(null), 8000);
      if (asup === ROPE) out.push(R('audio-cfg', 'skip', '소리 지원 질의가 시간 안에 안 끝났어요', '다시 검사해 주세요'));
      else if (!asup) out.push(R('audio-cfg', 'fail', '소리 선택(pickAudio)이 없어요 — 배포가 R123 이전이에요'));
      else if (!asup.ok) out.push(R('audio-cfg', 'fail', '이 기기가 소리 형식을 못 받아요 — 무음으로 저장돼요',
        asup.why + ' (내보내기는 이제 강행하지 않고 무음으로 내려가요)'));
      else if (!OAC) out.push(R('audio-cfg', 'fail', '소리 형식은 되는데 OfflineAudioContext 가 없어요 — 음악 해독이 불가해요'));
      else out.push(R('audio-cfg', 'pass', `소리 형식 ${asup.cfg.sampleRate}Hz 지원 · 오프라인 해독기 있음`,
        asup.queried ? '인코더에 실제로 물어본 결과예요' : '지원 질의가 없는 브라우저라 종전대로 진행해요'));
    }
  }

  /* 실제 인코딩 — 내보내기와 **같은 설정·같은 먹서**로 2프레임. 정리까지 책임진다 */
  async function encodeTwoFrames(win, SPEC, W, H, rung) {
    /* R123 — 사다리 단을 받으면 그 단으로 인코딩한다. 안 주면 정본 1단(R122 계약 그대로) */
    const rg = rung || { codec: SPEC.vcodec, bitrate: SPEC.bitrate };
    const t0 = Date.now();
    let enc = null, err = null;
    const frames = [];
    try {
      const cv = win.document.createElement('canvas'); cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d');
      if (!ctx) return { ok: false, why: '2d 캔버스를 못 얻었어요' };
      const muxer = new win.Mp4Muxer.Muxer({
        target: new win.Mp4Muxer.ArrayBufferTarget(),
        video: { codec: SPEC.muxVideo, width: W, height: H },
        fastStart: 'in-memory',
      });
      enc = new win.VideoEncoder({
        output: (chunk, meta) => { try { muxer.addVideoChunk(chunk, meta); } catch (e) { err = err || e; } },
        error: (e) => { err = err || e; },
      });
      enc.configure({ codec: rg.codec, width: W, height: H, bitrate: rg.bitrate, framerate: SPEC.fps });
      const dur = Math.round(1e6 / SPEC.fps);
      for (let i = 0; i < 2; i++) {
        ctx.fillStyle = i ? '#1b2a3a' : '#3a2a1b';
        ctx.fillRect(0, 0, W, H);
        const fr = new win.VideoFrame(cv, { timestamp: i * dur, duration: dur });
        frames.push(fr);
        enc.encode(fr, { keyFrame: i === 0 });
      }
      await enc.flush();
      if (err) return { ok: false, why: (err && err.message) || '인코더가 error 콜백으로 죽었어요' };
      muxer.finalize();
      const buf = muxer.target.buffer;
      if (!buf || !buf.byteLength) return { ok: false, why: '먹서가 빈 버퍼를 돌려줬어요' };
      /* MP4 는 [size(4)][ftyp] 로 시작한다 — 바이트가 진짜 MP4 인지 형태로 확인 */
      const b = new Uint8Array(buf, 4, 4);
      const tag = String.fromCharCode(b[0], b[1], b[2], b[3]);
      if (tag !== 'ftyp') return { ok: false, why: `MP4 머리(ftyp)가 아니에요 — 읽은 값 "${tag}", ${buf.byteLength}바이트` };
      return { ok: true, bytes: buf.byteLength, ms: Date.now() - t0 };
    } catch (e) {
      return { ok: false, why: (e && e.message) || '인코딩이 예외로 죽었어요' };
    } finally {
      frames.forEach((f) => { try { f.close(); } catch (_) {} });
      try { if (enc && enc.state !== 'closed') enc.close(); } catch (_) {}
    }
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
    try { probeTouch(win, out); } catch (e) { out.push(R('touch-hit', 'fail', '히트 탐침이 예외로 죽었어요', e.message)); }
    try { probeAnim(win, out); } catch (e) { out.push(R('anim-live', 'fail', '애니 탐침이 예외로 죽었어요', e.message)); }
    try { await probeExport(win, out); } catch (e) { out.push(R('enc-support', 'fail', '내보내기 탐침이 예외로 죽었어요', e.message)); }
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
    if (CHECKS.length !== 15) v.push('검사 명세 수 변경');
    /* R123 — 결과 전달지가 정본을 읽는가. 값을 적으면 여기서 걸린다 */
    const rt = reportText({ navigator: {}, location: { href: '' }, document: { querySelectorAll: () => [] },
      MK_VIDEO: window.MK_VIDEO }, [{ id: 'enc-support', state: 'fail', msg: 'm', detail: 'd' }]);
    try {
      const o = JSON.parse(rt);
      if (o.kind !== 'kmaker-selfcheck') v.push('보고서 표식 위반');
      if (!o.checks || o.checks.length !== 1 || o.checks[0].round !== 'R38') v.push('보고서가 라운드를 못 붙임');
      if (o.checks[0].detail !== 'd') v.push('보고서가 detail 을 버림');
      if (o.verdict.fail !== 1 || o.verdict.ok) v.push('보고서 판정 위반');
      if (window.MK_VIDEO && window.MK_VIDEO.VIDEO_LADDER && o.ladder.length !== window.MK_VIDEO.VIDEO_LADDER.length) v.push('보고서 사다리 누락');
    } catch (e) { v.push('보고서가 JSON 이 아님'); }
    /* R122 — 탐침이 정본을 함께 읽는가. 이 파일이 코덱을 따로 적으면 규약 위반 */
    const V = window.MK_VIDEO;
    if (V && V.EXPORT_SPEC) {
      const os = V.outSize(1280, 720);
      if (os.W !== 1920 || os.H !== 1080) v.push('탐침 출력 치수가 정본과 어긋남');
      if (!/^avc1\./.test(V.EXPORT_SPEC.vcodec)) v.push('정본 코덱 형태 위반');
    }
    ['enc-support', 'muxer-reach', 'enc-bytes', 'audio-cfg'].forEach((id) => {
      if (!CHECKS.some((c) => c.id === id)) v.push('내보내기 명세 누락: ' + id);
    });
    if (!CHECKS.every((c) => c.id && c.round && c.title && c.proves && c.blind)) v.push('명세 항목 누락');
    if (new Set(CHECKS.map((c) => c.id)).size !== CHECKS.length) v.push('명세 id 중복');
    return { ok: !v.length, violations: v };
  };

  return {
    CHECKS, EYES, STAGE, VISIT, DB, ST,
    I, T, rotM, scaleM, mul, about, near, maxDiff, parseMatrix, parseOrigin,
    cssNet, canvasNet, verdict, supported, run, settle, audit, encodeTwoFrames,
    reportText, busterOf,
  };
})();

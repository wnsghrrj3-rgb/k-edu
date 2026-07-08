/* ═══════════════════════════════════════════════════════════════════════
   KClassLab — 학급 실험실 «30개의 곡선, 하나의 발견» 프로토콜 순수 로직 (P1)
   SPEC_CLASSLAB §2·§3·§5 구현. 케이플 broadcast 위에 얹는 데이터 계층.

   ★ 완전 순수: Supabase 참조 0 · THREE 참조 0 · DOM 참조 0.
     실제 채널(conn)·엔진(world)은 P2/P3 렌더층이 주입한다. 여기선 운반될
     페이로드의 «모양»과 «규칙»만 정의 — node 단독 테스트 대상.

   구성:
     1. 델타 인코더/병합기  — 학생→교사 곡선 전송(§2 모드B)
     2. 역할 게이트         — 동사 화이트리스트(§3 모드A, 변인 통제의 사회화)
     3. 스냅샷 압축기       — 호스트→게스트 상태 동기(§3 모드A, ≤2KB)
     4. 호스트 승계         — 이탈 시 다음 순번(§3)
   ═══════════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  const API = factory();
  if (typeof window !== 'undefined') { window.KClassLab = API; }
  if (typeof module !== 'undefined' && module.exports) { module.exports = API; }
})(this, function () {
  'use strict';

  const PROTO_V = 1;          // §5 페이로드 스키마 버전
  const REC_DT  = 0.25;       // 레코더 원 해상도(SPEC_LAB2 SAMPLE_DT)
  const SEND_RES = 0.5;       // §2 델타 전송 해상도(2:1 다운)
  const DOWN = Math.round(SEND_RES / REC_DT); // = 2 (2:1)
  const SNAP_BUDGET = 2048;   // §3 스냅샷 상한 2KB

  /* ── 공용 ── */
  function r2(x) { return Math.round((x || 0) * 100) / 100; } // 소수 2자리(대역폭)

  function channelName(classCode) {
    // §2 room = sci:{classCode} (케이플 kple: 문법과 동일 계층, prefix만 과학실)
    return 'sci:' + String(classCode).toUpperCase();
  }

  /* ═══ 1. 델타 인코더/병합기 (§2 모드B) ═══════════════════════════════
     레코더 샘플 [[t,v],…](0.25s 해상도)을 2:1 다운(0.5s) 후,
     직전 송신 이후 «신규분만» 페이로드로. 재전송 없음. 병합 시 무손실. */

  // 0.25s 배열 → 0.5s 배열(짝수 인덱스 추출 = 균일 다운샘플). 순수.
  function downsample(raw) {
    const out = [];
    for (let i = 0; i < raw.length; i += DOWN) out.push([raw[i][0], raw[i][1]]);
    return out;
  }

  // 한 (학생 sid · 스테이션 st · 채널 ch) 스트림의 델타 인코더.
  function createDeltaEncoder(sid, st, ch) {
    let sent = 0; // 다운샘플 배열 기준 이미 보낸 포인트 수
    return {
      // raw = 레코더 원 샘플 [[t,v],…]. 보낼 게 없으면 null(전송 스킵).
      encode(raw) {
        const ds = downsample(raw || []);
        if (ds.length <= sent) return null;   // 신규분 없음 → 미전송(재전송 금지)
        const fresh = ds.slice(sent);          // 직전 이후만
        sent = ds.length;
        return { v: PROTO_V, sid: sid, st: st, ch: ch, pts: fresh };
      },
      reset() { sent = 0; }
    };
  }

  // 교사측 병합기 — 여러 학생 델타를 곡선으로 재조립.
  function createMerger() {
    const curves = {}; // sid → { sid, st, ch, pts:[[t,v],…] }
    return {
      // 델타 페이로드 흡수. 스키마 불일치 거부(§5 v필드). 성공 시 true.
      ingest(p) {
        if (!p || p.v !== PROTO_V || !Array.isArray(p.pts)) return false;
        let c = curves[p.sid];
        if (!c) c = curves[p.sid] = { sid: p.sid, st: p.st, ch: p.ch, pts: [] };
        for (let i = 0; i < p.pts.length; i++) {
          const pt = p.pts[i];
          const last = c.pts[c.pts.length - 1];
          if (!last || pt[0] > last[0]) c.pts.push([pt[0], pt[1]]); // 시간 단조·중복 방어
        }
        return true;
      },
      getCurve(sid) { return curves[sid] || null; },
      all() { return Object.keys(curves).map(function (k) { return curves[k]; }); },
      count() { return Object.keys(curves).length; },
      // §2 교육 폭발 지점: 시각 t에서 전 곡선 값 → 중앙값·사분위(측정오차·평균이 저절로 태어남)
      statsAt(t) {
        const vals = [];
        this.all().forEach(function (c) {
          const v = sampleAt(c.pts, t);
          if (v != null) vals.push(v);
        });
        if (!vals.length) return null;
        vals.sort(function (a, b) { return a - b; });
        return { n: vals.length, median: quantile(vals, 0.5), q1: quantile(vals, 0.25), q3: quantile(vals, 0.75), min: vals[0], max: vals[vals.length - 1] };
      }
    };
  }

  // 곡선에서 시각 t의 값(가장 가까운 이전 샘플 유지 = 계단 보간). 순수.
  function sampleAt(pts, t) {
    if (!pts.length || t < pts[0][0]) return null;
    let v = pts[0][1];
    for (let i = 0; i < pts.length; i++) { if (pts[i][0] <= t) v = pts[i][1]; else break; }
    return v;
  }
  function quantile(sorted, q) {
    const pos = (sorted.length - 1) * q, base = Math.floor(pos), rest = pos - base;
    return sorted[base + 1] !== undefined ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base];
  }

  /* ═══ 2. 역할 게이트 (§3 모드A — 변인 통제의 사회화) ═══════════════════
     lab2 실제 동사(scilab_lab2.html _apply switch)를 4역할에 빠짐없이 분배.
     내 역할 밖 동사 → 로컬 차단 + 토스트. */
  const ROLES = {
    lamp:     { icon: '🔥', name: '램프사', verbs: ['moveLamp', 'ignite', 'ignflame'] },
    meter:    { icon: '🌡️', name: '측정사', verbs: ['placeThermo', 'placeScale', 'selectChannel'] },
    mixer:    { icon: '🥄', name: '조제사', verbs: ['placeVessel', 'placeLid', 'removeLid', 'addSpoon', 'addWater', 'addLiquid', 'addIce', 'stir', 'dropBase', 'coverCup', 'pour'] },
    recorder: { icon: '📋', name: '기록사', verbs: ['answerPrediction', 'selectChallenge'] }
  };
  const ROLE_ORDER = ['lamp', 'meter', 'mixer', 'recorder'];

  // 동사 → 소속 역할(없으면 null).
  function verbRole(verb) {
    for (let i = 0; i < ROLE_ORDER.length; i++) {
      if (ROLES[ROLE_ORDER[i]].verbs.indexOf(verb) >= 0) return ROLE_ORDER[i];
    }
    return null;
  }

  // 입장 순서 idx(0-based) + 총 인원 n → 그 자리가 맡는 역할 배열.
  //   n≥4 : 각자 1개(4명 초과는 순환 idx%4)
  //   n=3 : [lamp] / [meter] / [mixer+recorder]  ※SPEC 미명시 → 구현 확정(§1-④ 역반영)
  //   n=2 : [lamp+meter] / [mixer+recorder]      (SPEC §3 병합표)
  //   n=1 : 전부(혼자 실험)
  function assignRoles(idx, n) {
    if (n <= 1) return ROLE_ORDER.slice();
    if (n === 2) return idx % 2 === 0 ? ['lamp', 'meter'] : ['mixer', 'recorder'];
    if (n === 3) return [['lamp'], ['meter'], ['mixer', 'recorder']][idx % 3].slice();
    return [ROLE_ORDER[idx % 4]];
  }

  // 내 역할 배열 myRoles로 verb를 할 수 있는가.
  function canDo(myRoles, verb) {
    const r = verbRole(verb);
    return r != null && myRoles.indexOf(r) >= 0;
  }

  // 차단 시 안내 문구(§3 "그건 램프사가 할 수 있어!"). 소속 역할 없으면 일반 안내.
  function blockMsg(verb) {
    const r = verbRole(verb);
    if (!r) return '지금은 할 수 없는 동작이에요';
    return '그건 ' + ROLES[r].icon + ' ' + ROLES[r].name + '가 할 수 있어!';
  }

  /* ═══ 3. 스냅샷 압축기 (§3 모드A — 호스트→게스트, ≤2KB) ═══════════════
     lab2 world의 «파생 상태»만 짧은 키로 직렬화(액션로그 아님). 게스트는 렌더만. */
  function packSnapshot(world, phaseTagFn) {
    const snap = {
      v: PROTO_V,
      t: r2(world.t),
      lamp: { s: world.lamp.station, d: r2(world.lamp.dist), l: world.lamp.lit ? 1 : 0 },
      st: []
    };
    for (let i = 0; i < world.stations.length; i++) {
      const s = world.stations[i], c = s.contents;
      snap.st.push({
        ve: s.vessel || null,
        li: s.lid ? 1 : 0,
        th: s.thermo ? 1 : 0,
        sc: s.scale ? 1 : 0,
        tp: r2(c.temp),
        vo: r2(c.vol),
        ds: r2(c.dissolvedTotal || 0),
        pr: r2(c.precipTotal || 0),
        ms: r2(c.mass || 0),
        o2: r2(c.o2 != null ? c.o2 : 21),
        fl: (c.flame && c.flame.on) ? 1 : 0,
        cx: c.colorHex || null,
        tg: phaseTagFn ? phaseTagFn(s) : (c.tag || null)
      });
    }
    return snap;
  }

  // 게스트 렌더용 평탄 상태로 복원(pack의 역).
  function unpackSnapshot(snap) {
    return {
      t: snap.t,
      lamp: { station: snap.lamp.s, dist: snap.lamp.d, lit: !!snap.lamp.l },
      stations: snap.st.map(function (s) {
        return {
          vessel: s.ve, lid: !!s.li, thermo: !!s.th, scale: !!s.sc,
          contents: {
            temp: s.tp, vol: s.vo, dissolvedTotal: s.ds, precipTotal: s.pr,
            mass: s.ms, o2: s.o2, flame: { on: !!s.fl }, colorHex: s.cx, tag: s.tg
          }
        };
      })
    };
  }

  // 직렬화 바이트 근사(≤2KB 예산 검사용).
  function snapshotSize(snap) { return JSON.stringify(snap).length; }

  /* ═══ 4. 호스트 승계 (§3) ═══════════════════════════════════════════
     roster = 입장 순서 sid 배열. 호스트 이탈 시 남은 첫 순번이 승계.
     승계자는 마지막 스냅샷에서 재개(액션로그 이관 없음 — 정직한 트레이드오프). */
  function nextHost(roster, leavingSid) {
    const remain = roster.filter(function (x) { return x !== leavingSid; });
    return remain.length ? remain[0] : null;
  }

  return {
    PROTO_V: PROTO_V, REC_DT: REC_DT, SEND_RES: SEND_RES, DOWN: DOWN, SNAP_BUDGET: SNAP_BUDGET,
    channelName: channelName,
    // 델타
    downsample: downsample, createDeltaEncoder: createDeltaEncoder, createMerger: createMerger,
    sampleAt: sampleAt, quantile: quantile,
    // 역할
    ROLES: ROLES, ROLE_ORDER: ROLE_ORDER, verbRole: verbRole, assignRoles: assignRoles,
    canDo: canDo, blockMsg: blockMsg,
    // 스냅샷
    packSnapshot: packSnapshot, unpackSnapshot: unpackSnapshot, snapshotSize: snapshotSize,
    // 승계
    nextHost: nextHost
  };
});

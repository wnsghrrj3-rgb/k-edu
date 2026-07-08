// =============================================
// K-edu 공용 수집 런타임 (kedu_collect.js)
// 세계층 이음③ 「아이의 기록」 — S0 스키마의 구현체
// 명세: handoff/세계층/KEDU_COLLECT_스키마.md
//
// 한 줄: 도감·전시·제출이 도구마다 따로 놀지 않도록,
//        모든 도구가 이 한 함수만 부른다 → window.KEDU.collect(entry)
//
// 페이지 사용: 헤드에 <script src="/kedu_collect.js"> 한 줄 로드.
//   그 뒤 도구 코드에서 (KEDU 미탑재 페이지에서도 안전한 가드):
//   (window.KEDU && KEDU.collect) && KEDU.collect({
//     kind:"technique", app:"paintlab", id:"salt", title:"소금 기법", at:Date.now()
//   });
//
// 저장 2층:
//   1층 = localStorage["kedu_collect_v1"] (즉시·오프라인·서버 0) — 이 파일이 축조.
//   2층 = 케이박스 반코드 동기 — 물감 W7 케이박스 루프에 편승.
//         여기서는 seam(KEDU._sync)만 두고 no-op. W7이 주입한다.
//
// kind 5종 고정(도구 임의 신설 금지): badge·technique·artifact·artwork·record
// 중복 방지: 같은 (app,id) 재수집 = 덮어쓰기.
// =============================================

(function () {
  if (window.KEDU && window.KEDU.__v1) return; // 중복 실행 방지

  var NS = "kedu_collect_v1";
  var KINDS = ["badge", "technique", "artifact", "artwork", "record"];

  function read() {
    try { return JSON.parse(localStorage.getItem(NS)) || {}; }
    catch (e) { return {}; }
  }
  function write(map) {
    try { localStorage.setItem(NS, JSON.stringify(map)); return true; }
    catch (e) { return false; } // 사생활 모드·용량초과 등에서 조용히 실패
  }
  function keyOf(app, id) { return String(app) + ":" + String(id); }
  function warn(msg, x) { if (window.console && console.warn) console.warn("[KEDU] " + msg, x); }

  var KEDU = window.KEDU || {};
  KEDU.__v1 = true;
  KEDU.NS = NS;
  KEDU.KINDS = KINDS.slice();

  // ── 단일 진입점 — 도구는 이 한 줄만 호출 ────────────────
  KEDU.collect = function (entry) {
    if (!entry || typeof entry !== "object") { warn("entry 객체 필요", entry); return null; }
    if (KINDS.indexOf(entry.kind) < 0) { warn("미정의 kind 무시(5종만 허용):", entry.kind); return null; }
    if (!entry.app || entry.id == null || entry.id === "") { warn("app·id 필수:", entry); return null; }

    var rec = {
      kind:  entry.kind,
      app:   String(entry.app),
      id:    String(entry.id),
      title: entry.title != null ? String(entry.title) : String(entry.id),
      meta:  (entry.meta && typeof entry.meta === "object") ? entry.meta : {},
      thumb: entry.thumb || null,
      at:    typeof entry.at === "number" ? entry.at : Date.now()
    };

    var map = read();
    map[keyOf(rec.app, rec.id)] = rec; // 같은 (app,id) 재수집 = 덮어쓰기
    write(map);
    try { if (typeof KEDU._sync === "function") KEDU._sync(rec); } catch (e) {} // 2층 seam
    return rec;
  };

  // ── 읽기 도우미 (전시실 뷰어·도구가 사용) ─────────────────
  KEDU.all = function () {
    var map = read(), out = [];
    for (var k in map) if (map.hasOwnProperty(k)) out.push(map[k]);
    out.sort(function (a, b) { return (b.at || 0) - (a.at || 0); }); // 최신 먼저
    return out;
  };
  KEDU.list = function (filter) {
    filter = filter || {};
    return KEDU.all().filter(function (e) {
      if (filter.kind && e.kind !== filter.kind) return false;
      if (filter.app && e.app !== filter.app) return false;
      return true;
    });
  };
  KEDU.count = function (filter) { return KEDU.list(filter).length; };
  KEDU.remove = function (app, id) {
    var map = read(), k = keyOf(app, id);
    if (map[k]) { delete map[k]; write(map); return true; }
    return false;
  };
  KEDU.clear = function () { write({}); };

  // 2층 동기 seam — 기본 no-op. 케이박스 루프(물감 W7)가 KEDU._sync 를 주입한다.
  KEDU._sync = KEDU._sync || null;

  window.KEDU = KEDU;
})();

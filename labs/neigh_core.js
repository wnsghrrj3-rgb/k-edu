/* ============================================================
   케이랩 사회실 2.0 · R0 동네 무대 코어 — neigh_core.js
   ------------------------------------------------------------
   모든 트랙(R1 탐사대·R2 시간여행·R4 조사수첩)이 수입하는 공용 모듈.
   · 순수부 window.Neigh  : 네트워크·Leaflet 무관 = 검산 대상
   · 무대부 Neigh.mount…  : Leaflet + 브이월드 WMTS/검색 API 2.0 래퍼

   설계: klab/사회실2_설계.md (R0). 레퍼런스 스택 = jido_proto.html.
   정직 계약: 실도로 라우팅 API가 없어 시간은 "직선거리 × 도로우회계수 κ"의
   어림값 — 화면 표기는 반드시 "약 ○분", 도움말에 상시 명시.
   ============================================================ */
(function () {
  'use strict';
  var W = (typeof window !== 'undefined') ? window : this;
  var N = {};

  /* ── 상수 ───────────────────────────────────────────────── */
  var R_EARTH = 6371000;          // m (구 근사)
  var KAPPA   = 1.35;             // 도로 우회 계수(직선→실도로 어림 배율)
  var SPEED = { walk: 67, emerg: 500 }; // m/분: 도보 4km/h · 긴급차량 시내 30km/h
  var DEG = Math.PI / 180;

  // 카테고리 8종 → 브이월드 place 검색 질의어(재현율은 골든에서 실측 보정 = 질의어표만 손봄)
  var CATS = [
    { id:'fire',    nm:'소방서',       ico:'🚒', q:'소방서',       lens:{ mode:'emerg', limitMin:5,  color:'#F0616A' } },
    { id:'police',  nm:'경찰서',       ico:'🚨', q:'경찰서',       lens:{ mode:'emerg', limitMin:5,  color:'#5B8DEF' } },
    { id:'hospital',nm:'병원',         ico:'🏥', q:'병원',         lens:{ mode:'emerg', limitMin:10, color:'#E86AAE' } },
    { id:'library', nm:'도서관',       ico:'📚', q:'도서관',       lens:{ mode:'walk',  limitMin:15, color:'#7BC47F' } },
    { id:'school',  nm:'학교',         ico:'🏫', q:'초등학교',     lens:{ mode:'walk',  limitMin:15, color:'#F0A85B' } },
    { id:'post',    nm:'우체국',       ico:'📮', q:'우체국',       lens:{ mode:'walk',  limitMin:15, color:'#E8843C' } },
    { id:'market',  nm:'시장',         ico:'🍎', q:'전통시장',     lens:{ mode:'walk',  limitMin:15, color:'#F5C24B' } },
    { id:'office',  nm:'행정복지센터', ico:'🏛', q:'행정복지센터', lens:{ mode:'walk',  limitMin:15, color:'#9B7BF5' } }
  ];
  var CAT_BY = {};
  CATS.forEach(function (c) { CAT_BY[c.id] = c; });

  N.CATS = CATS;
  N.catInfo = function (id) { return CAT_BY[id] || null; };
  N.KAPPA = KAPPA;
  N.SPEED = SPEED;

  /* ── 순수부: 거리·방위 ──────────────────────────────────── */
  // 두 점 {lat,lng} → 미터(하버사인)
  N.haversine = function (a, b) {
    var la1 = a.lat * DEG, la2 = b.lat * DEG;
    var dla = (b.lat - a.lat) * DEG, dln = (b.lng - a.lng) * DEG;
    var h = Math.sin(dla / 2) * Math.sin(dla / 2) +
            Math.cos(la1) * Math.cos(la2) * Math.sin(dln / 2) * Math.sin(dln / 2);
    return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
  };

  var DIRS = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  // a에서 b로 가는 초기 방위각(도, 0~360, 북=0 시계방향)
  N.bearingDeg = function (a, b) {
    var la1 = a.lat * DEG, la2 = b.lat * DEG, dln = (b.lng - a.lng) * DEG;
    var y = Math.sin(dln) * Math.cos(la2);
    var x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dln);
    var d = Math.atan2(y, x) / DEG;
    return (d + 360) % 360;
  };
  // 8방위 한글(나침반 문구용): "북동쪽"
  N.bearing = function (a, b) {
    var idx = Math.round(N.bearingDeg(a, b) / 45) % 8;
    return DIRS[idx];
  };

  /* ── 순수부: 시간 근사(정직 계약) ───────────────────────── */
  N.roadMeters = function (straightM) { return straightM * KAPPA; };
  N.walkMin  = function (m) { return (m * KAPPA) / SPEED.walk; };
  N.emergMin = function (m) { return (m * KAPPA) / SPEED.emerg; };
  N.timeMin  = function (m, mode) { return (mode === 'emerg') ? N.emergMin(m) : N.walkMin(m); };
  // 등시권 원 반경(직선 m): time(r)=min 의 역함수 → r = min·speed/κ
  N.isoRadius = function (min, mode) {
    var sp = (mode === 'emerg') ? SPEED.emerg : SPEED.walk;
    return (min * sp) / KAPPA;
  };
  // 표시 문구: "약 7분" (반올림, 0분 방지)
  N.aboutMin = function (m, mode) {
    var v = Math.round(N.timeMin(m, mode));
    return '약 ' + (v < 1 ? 1 : v) + '분';
  };

  /* ── 순수부: POI 정규화·질의 ────────────────────────────── */
  // 브이월드 검색 API 2.0 place item → 표준 스키마
  N.poiNorm = function (raw, cat) {
    if (!raw) return null;
    var pt = raw.point || {};
    var lat = parseFloat(pt.y), lng = parseFloat(pt.x);
    if (!isFinite(lat) || !isFinite(lng)) return null;
    var addr = '';
    if (raw.address) addr = raw.address.road || raw.address.parcel || raw.address.bldnm || '';
    if (typeof raw.address === 'string') addr = raw.address;
    return {
      id:   String(raw.id || (raw.title || 'poi') + '_' + lat.toFixed(5) + '_' + lng.toFixed(5)),
      name: String(raw.title || raw.name || '이름 없음'),
      cat:  cat || raw.category || '',
      lat:  lat, lng: lng, addr: addr, src: 'vworld'
    };
  };
  // 응답 배열 → 정규화 + 반경 필터(키워드 검색 재현율 보정용 클라이언트 필터)
  N.poiListNorm = function (items, cat, center, radiusM) {
    var out = [];
    (items || []).forEach(function (it) {
      var p = N.poiNorm(it, cat);
      if (!p) return;
      if (center && radiusM && N.haversine(center, p) > radiusM) return;
      out.push(p);
    });
    return out;
  };

  /* ── 순수부: 최근접·커버리지·밀도 ───────────────────────── */
  // 한 점에서 가장 가까운 POI
  N.nearest = function (pt, pois) {
    var best = null, bd = Infinity;
    (pois || []).forEach(function (p) {
      var d = N.haversine(pt, p);
      if (d < bd) { bd = d; best = p; }
    });
    return best ? { poi: best, dist: bd } : null;
  };
  // 표본점(probe)들의 도달 시간·미달 목록 — 렌즈·미션 채점의 심장
  N.coverage = function (pois, probes, limitMin, mode) {
    var items = [], gaps = [], reached = 0;
    (probes || []).forEach(function (pr) {
      var nr = N.nearest(pr, pois);
      var min = nr ? N.timeMin(nr.dist, mode) : Infinity;
      var ok = isFinite(min) && min <= limitMin;
      var rec = { pt: pr, min: min, ok: ok, nearest: nr ? nr.poi : null };
      items.push(rec);
      if (ok) reached++; else gaps.push(rec);
    });
    return {
      items: items, gaps: gaps,
      reached: reached, total: (probes || []).length,
      ratio: (probes && probes.length) ? reached / probes.length : 0
    };
  };
  // 시설 밀도 커널(중심지 렌즈): grid cell별 가우시안 합, 0~1 정규화
  N.centerHeat = function (pois, cells, sigmaM) {
    var sig = sigmaM || 600, two = 2 * sig * sig, out = [], max = 0;
    (cells || []).forEach(function (c) {
      var s = 0;
      (pois || []).forEach(function (p) {
        var d = N.haversine(c, p);
        s += Math.exp(-(d * d) / two);
      });
      if (s > max) max = s;
      out.push({ pt: c, raw: s });
    });
    out.forEach(function (o) { o.v = max > 0 ? o.raw / max : 0; });
    return { cells: out, max: max };
  };

  /* ── 순수부: 미션 rule 채점(장소 독립) ──────────────────── */
  // rule + ctx{home, pois(전체), byCat(cat→pois), tapPt, virtualPois, probes, mode}
  N.evalRule = function (rule, ctx) {
    ctx = ctx || {};
    var byCat = ctx.byCat || {};
    function pool(cat) {
      var base = byCat[cat] || [];
      if (ctx.virtualPois && ctx.virtualPois.length) return base.concat(ctx.virtualPois);
      return base;
    }
    var facts = {}, ok = false, value = null;
    switch (rule.type) {
      case 'count_in_radius': {
        var list = (byCat[rule.cat] || []).filter(function (p) {
          return N.haversine(ctx.home, p) <= rule.radius_m;
        });
        value = list.length; facts.n = list.length;
        var nr = N.nearest(ctx.home, list.length ? list : (byCat[rule.cat] || []));
        if (nr) { facts.nearest_name = nr.poi.name; facts.min = Math.max(1, Math.round(N.timeMin(nr.dist, rule.mode || 'walk'))); }
        ok = true; break;
      }
      case 'nearest_time': {
        var nt = N.nearest(ctx.home, byCat[rule.cat] || []);
        if (nt) {
          value = N.timeMin(nt.dist, rule.mode || 'walk');
          facts.min = Math.max(1, Math.round(value));
          facts.nearest_name = nt.poi.name;
          facts.bearing = N.bearing(ctx.home, nt.poi);
        } else { value = Infinity; facts.min = null; }
        ok = (nt != null); break;
      }
      case 'coverage_gap': {
        // 성공 = 사용자가 '한도 밖' 지점을 탭했는가
        if (ctx.tapPt) {
          var g = N.nearest(ctx.tapPt, byCat[rule.cat] || []);
          var m = g ? N.timeMin(g.dist, rule.mode || 'emerg') : Infinity;
          facts.min = isFinite(m) ? Math.round(m) : null;
          value = m; ok = !isFinite(m) || m > rule.limit;
        }
        break;
      }
      case 'place_virtual': {
        // 성공 = 가상 배치 후 미달 표본이 목표 이하로 줄었는가
        var cov = N.coverage(pool(rule.cat), ctx.probes || [], rule.limit, rule.mode || 'emerg');
        facts.reached = cov.reached; facts.total = cov.total; facts.gaps = cov.gaps.length;
        value = cov.gaps.length;
        var goal = rule.goal || {};
        if (goal.metric === 'gaps_below') ok = cov.gaps.length <= (goal.n || 0);
        else if (goal.metric === 'all_reached') ok = cov.gaps.length === 0;
        else ok = cov.gaps.length === 0;
        break;
      }
      default: value = null; ok = false;
    }
    return { value: value, facts: facts, ok: ok };
  };

  // debrief 템플릿 치환: "{n}곳 · {nearest_name} · 약 {min}분"
  N.fillDebrief = function (tpl, facts) {
    return String(tpl || '').replace(/\{(\w+)\}/g, function (m, k) {
      return (facts && facts[k] != null) ? String(facts[k]) : m;
    });
  };

  /* ============================================================
     무대부 — Leaflet + 브이월드 (검산 무관, 준호 실기기 T-5)
     ============================================================ */
  // 인증키: keduclass.com 도메인 개발키(2026-12-15 만료). ?key= 로 덮어쓰기.
  var KEY = 'DEFAULT_VWORLD_KEY_PLACEHOLDER';
  try {
    KEY = new W.URLSearchParams(W.location.search).get('key') || '7ED25FC8-DA7D-331F-AA7F-B4B7B901BCD1';
  } catch (e) { KEY = '7ED25FC8-DA7D-331F-AA7F-B4B7B901BCD1'; }
  var ATTR = '공간정보 오픈플랫폼(브이월드)';
  N.KEY = function () { return KEY; };
  N.setKey = function (k) { if (k) KEY = k; };

  // 브이월드 WMTS 타일 레이어(jido_proto 검증 URL 형식)
  N.tileUrl = function (name, ext) {
    return 'https://api.vworld.kr/req/wmts/1.0.0/' + KEY + '/' + name + '/{z}/{y}/{x}.' + (ext || 'png');
  };

  // sessionStorage POI 캐시(bbox+cat 키, 15분) — 학급 동시 사용 사용량 방어
  var CACHE_TTL = 15 * 60 * 1000;
  function cacheKey(cat, center, radiusM) {
    var g = function (v) { return Math.round(v * 200) / 200; }; // ~5m 격자로 키 안정화
    return 'neigh:' + cat + ':' + g(center.lat) + ',' + g(center.lng) + ':' + Math.round(radiusM);
  }
  N.cacheGet = function (cat, center, radiusM) {
    try {
      var raw = W.sessionStorage.getItem(cacheKey(cat, center, radiusM));
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (Date.now() - o.t > CACHE_TTL) return null;
      return o.d;
    } catch (e) { return null; }
  };
  N.cacheSet = function (cat, center, radiusM, data) {
    try { W.sessionStorage.setItem(cacheKey(cat, center, radiusM), JSON.stringify({ t: Date.now(), d: data })); } catch (e) {}
  };

  // JSONP 전송(테스트에서 주입 교체 가능 = 네트워크 무의존 스모크)
  N._jsonp = function (url, cb) {
    var name = 'njcb' + Date.now() + Math.floor(Math.random() * 1e4);
    var s = W.document.createElement('script');
    W[name] = function (data) { delete W[name]; if (s.parentNode) s.parentNode.removeChild(s); cb(null, data); };
    s.onerror = function () { if (s.parentNode) s.parentNode.removeChild(s); cb(new Error('jsonp')); };
    s.src = url + (url.indexOf('?') < 0 ? '?' : '&') + 'callback=' + name;
    W.document.body.appendChild(s);
  };

  // 브이월드 검색 API 2.0 — 주소/장소 지오코딩(단일 결과)
  N.geocode = function (query, done) {
    if (!query) { done(null, null); return; }
    var order = ['place', 'address', 'district'], i = 0;
    (function tryType() {
      if (i >= order.length) { done(null, null); return; }
      var url = 'https://api.vworld.kr/req/search?service=search&request=search&version=2.0'
        + '&crs=EPSG:4326&size=1&page=1&type=' + order[i++]
        + '&query=' + encodeURIComponent(query) + '&format=json&errorformat=json&key=' + KEY;
      N._jsonp(url, function (err, d) {
        var r = d && d.response, it = r && r.result && r.result.items && r.result.items[0];
        if (!err && r && r.status === 'OK' && it && it.point) {
          done(null, { lat: parseFloat(it.point.y), lng: parseFloat(it.point.x), name: it.title || query });
        } else tryType();
      });
    })();
  };

  // 카테고리 POI 검색(캐시 → 브이월드 place → 정규화 + 반경 필터)
  N.poiSearch = function (catId, center, radiusM, done) {
    var cat = CAT_BY[catId]; if (!cat) { done(new Error('unknown cat'), []); return; }
    var hit = N.cacheGet(catId, center, radiusM);
    if (hit) { done(null, hit, true); return; }
    // bbox(대략): 반경을 위경도로 환산해 검색 상자 제한
    var dLat = radiusM / 111000, dLng = radiusM / (111000 * Math.cos(center.lat * DEG) || 1);
    var bbox = [center.lng - dLng, center.lat - dLat, center.lng + dLng, center.lat + dLat].join(',');
    var url = 'https://api.vworld.kr/req/search?service=search&request=search&version=2.0'
      + '&crs=EPSG:4326&size=100&page=1&type=place&category=&format=json&errorformat=json'
      + '&query=' + encodeURIComponent(cat.q) + '&bbox=' + encodeURIComponent(bbox) + '&key=' + KEY;
    N._jsonp(url, function (err, d) {
      if (err) { done(err, []); return; }
      var r = d && d.response;
      var items = (r && r.result && r.result.items) || [];
      var pois = N.poiListNorm(items, catId, center, radiusM);
      N.cacheSet(catId, center, radiusM, pois);
      done(null, pois, false);
    });
  };

  /* ── 무대: Leaflet 마운트 ───────────────────────────────── */
  N.mount = function (el, opts) {
    opts = opts || {};
    if (typeof W.L === 'undefined') return null;
    var L = W.L;
    var map = L.map(el, { zoomControl: true, attributionControl: true })
      .setView([opts.lat || 37.8315, opts.lng || 127.5106], opts.zoom || 15);
    var base = L.tileLayer(N.tileUrl('Base'), { attribution: ATTR, maxZoom: 19, minZoom: 6, errorTileUrl: '' });
    var sat  = L.tileLayer(N.tileUrl('Satellite', 'jpeg'), { attribution: ATTR, maxZoom: 19, minZoom: 6 });
    var hyb  = L.tileLayer(N.tileUrl('Hybrid'), { attribution: ATTR, maxZoom: 19, minZoom: 6 });
    base.addTo(map);
    var failed = false;
    base.on('tileerror', function () {
      if (failed) return; failed = true;
      if (opts.onTileError) opts.onTileError();
    });
    var stage = {
      map: map, L: L, base: base, sat: sat, hyb: hyb,
      layers: { markers: L.layerGroup().addTo(map), lens: L.layerGroup().addTo(map), aux: L.layerGroup().addTo(map) },
      setBase: function (which) {
        [base, sat, hyb].forEach(function (l) { if (map.hasLayer(l)) map.removeLayer(l); });
        if (which === 'sat') { sat.addTo(map); hyb.addTo(map); } else base.addTo(map);
      }
    };
    return stage;
  };

  // 카테고리 원형 마커 아이콘(SVG divIcon)
  N.markerIcon = function (catId, size) {
    var c = CAT_BY[catId] || { ico: '📍', lens: { color: '#9B7BF5' } };
    var s = size || 34;
    var html = '<div style="width:' + s + 'px;height:' + s + 'px;border-radius:50%;'
      + 'display:flex;align-items:center;justify-content:center;font-size:' + Math.round(s * 0.52) + 'px;'
      + 'background:' + c.lens.color + ';box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid #fff;">'
      + c.ico + '</div>';
    return { html: html, size: s };
  };

  W.Neigh = N;
  if (typeof module !== 'undefined' && module.exports) module.exports = N;
})();

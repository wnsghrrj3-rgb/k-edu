/* activity-host.js — 케이티처 활동 시스템 호스트 v1.0 (Phase 1)
 * 헌법 §6 구현: 활동 카드 · iframe 호스트(§4 시퀀스) · 수첩 오버레이(§6-2) · 카탈로그 탭(§6-3).
 * 엔진 접점 4개만 사용: renderSlide case 'activity' → .kact-mount / renderCurrentSlide 하이드레이션 /
 *   차시 로드 시 KActivity.setContext() / 삽입 훅 window.KEDU_INSERT_ACTIVITY.
 * 호스트 의무(§4-4): READY 5초 타임아웃 → 재시도 UI. 카탈로그 fetch 실패 → 카드는 뜨되 [시작] 비활성(§6-1).
 */
(function () {
  'use strict';
  var CATALOG_URL = '/kedu/activities/_CATALOG.json';
  var READY_TIMEOUT_MS = 5000;
  var catalog = null;        // id → 항목
  var catalogFailed = false;
  var ctx = { grade: null, subject: null, unit: null, lessons: [] }; // setContext로 갱신

  // ─────────────────────────── 스타일 (자체 주입) ───────────────────────────
  var css = [
    '.kact-card{background:#fffbf5;border:2px solid #f59e0b;border-radius:16px;padding:22px 26px;max-width:680px;margin:0 auto;font-family:Jua,sans-serif;box-shadow:0 4px 14px rgba(245,158,11,.15)}',
    '.kact-card .kact-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
    '.kact-card h3{margin:0;font-size:clamp(22px,3vw,32px);color:#92400e}',
    '.kact-badge{font-size:13px;padding:3px 10px;border-radius:999px;color:#fff}',
    '.kact-badge.intro{background:#3b82f6}.kact-badge.practice{background:#22c55e}.kact-badge.wrapup{background:#8b5cf6}',
    '.kact-short{color:#78350f;font-size:clamp(15px,2vw,19px);margin:8px 0 2px}',
    '.kact-meta{color:#b45309;font-size:14px;margin:6px 0 14px;display:flex;gap:14px;flex-wrap:wrap}',
    '.kact-note{background:#fef3c7;border-radius:10px;padding:8px 12px;font-size:15px;color:#92400e;margin-bottom:12px}',
    '.kact-btns{display:flex;gap:10px;flex-wrap:wrap}',
    '.kact-btn{font-family:Jua,sans-serif;font-size:18px;padding:12px 22px;border-radius:12px;border:none;cursor:pointer;min-height:44px}',
    '.kact-btn.primary{background:#f59e0b;color:#fff}.kact-btn.primary:hover{background:#d97706}',
    '.kact-btn[disabled]{background:#e5e7eb;color:#9ca3af;cursor:not-allowed}',
    '.kact-err{color:#b91c1c;font-size:14px;margin-top:8px}',
    // 전체화면 오버레이 (iframe 호스트)
    '#kact-overlay{position:fixed;inset:0;background:#1c1917;z-index:9000;display:none}',
    '#kact-overlay.active{display:block}',
    '#kact-overlay iframe{width:100%;height:100%;border:0;display:block}',
    '#kact-overlay .kact-x{position:absolute;top:12px;right:14px;z-index:2;background:rgba(0,0,0,.45);color:#fff;border:none;border-radius:10px;font-size:16px;padding:8px 14px;cursor:pointer;font-family:Jua,sans-serif}',
    '#kact-overlay .kact-wait{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#fde68a;font-family:Jua,sans-serif;font-size:22px}',
    // 수첩 오버레이
    '#kact-note-ov{position:fixed;inset:0;background:rgba(28,25,23,.72);z-index:9100;display:none;align-items:center;justify-content:center;padding:20px}',
    '#kact-note-ov.active{display:flex}',
    '.kact-note-card{background:#fffbf5;border-radius:22px;max-width:560px;width:100%;padding:28px 30px;font-family:Jua,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.35)}',
    '.kact-note-card .kn-top{display:flex;align-items:center;gap:14px;margin-bottom:14px}',
    '.kact-note-card .kn-judge{font-size:44px}',
    '.kact-note-card .kn-score{font-size:clamp(24px,4vw,34px);color:#92400e}',
    '.kn-row{display:flex;align-items:center;gap:10px;margin:9px 0}',
    '.kn-label{flex:0 0 46%;font-size:16px;color:#78350f}',
    '.kn-bar{flex:1;display:flex;gap:2px;font-size:14px;letter-spacing:1px}',
    '.kn-miss{flex:0 0 64px;text-align:right;color:#b91c1c;font-size:15px}',
    '.kn-clear{background:#dcfce7;color:#166534;border-radius:12px;padding:14px;text-align:center;font-size:18px;margin:10px 0}',
    '.kn-btns{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}',
    // 카탈로그 탭 (블록 추가 내 활동 카테고리)
    '.kact-pick-sec{margin-top:14px}',
    '.kact-pick-h{font-size:14px;color:#92400e;margin:10px 0 6px;font-weight:700}',
    '.kact-pick{border:1.5px solid #fbbf24;border-radius:12px;padding:10px 12px;margin-bottom:8px;cursor:pointer;background:#fffbf5}',
    '.kact-pick:hover{background:#fef3c7}',
    '.kact-pick .pk-t{font-size:15px;color:#92400e}.kact-pick .pk-s{font-size:12px;color:#b45309}',
    '.kact-chiprow{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}',
    '.kact-chip{border:1.5px solid #f59e0b;background:#fff;border-radius:999px;padding:5px 12px;font-size:13px;cursor:pointer;font-family:Jua,sans-serif;color:#92400e}',
    '.kact-chip.on{background:#f59e0b;color:#fff}',
    // §21-1 툴바 상설 버튼 + 팝오버
    '#kact-tool-btn{position:relative}',
    '#kact-tool-btn .kact-cnt{position:absolute;top:-7px;right:-7px;background:#ef4444;color:#fff;border-radius:999px;font-size:11px;min-width:18px;height:18px;line-height:18px;text-align:center;padding:0 4px}',
    '#kact-pop{position:fixed;z-index:8000;background:#fffbf5;border:2px solid #f59e0b;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.25);padding:14px 16px;width:min(92vw,380px);font-family:Jua,sans-serif;display:none}',
    '#kact-pop.active{display:block}',
    '#kact-pop .kp-h{font-size:15px;color:#92400e;margin-bottom:8px}',
    '.kp-item{border:1.5px solid #fbbf24;border-radius:12px;padding:10px 12px;margin-bottom:8px;background:#fff}',
    '.kp-item .pk-t{font-size:16px;color:#92400e}.kp-item .pk-s{font-size:12px;color:#b45309;margin:2px 0 8px}',
    '.kp-item .kact-btns{gap:8px}',
    '.kp-item .kact-btn{font-size:15px;padding:9px 14px;border-radius:10px}'
  ].join('\n');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // ─────────────────────────── 카탈로그 로더 (§6-1-4) ───────────────────────────
  var catalogPromise = fetch(CATALOG_URL).then(function (r) {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }).then(function (arr) {
    catalog = {};
    arr.forEach(function (a) { catalog[a.id] = a; });
    return catalog;
  }).catch(function () {
    catalogFailed = true;   // 카드가 [시작] 비활성으로라도 뜨게 — 수업 슬라이드는 계속 (§6-1)
    return null;
  });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var PHASE_KO = { intro: '도입', practice: '익힘', wrapup: '정리' };

  // ─────────────────────────── 활동 카드 (§6-1) ───────────────────────────
  // 엔진 renderCurrentSlide가 .kact-mount에 대해 호출. d = {id, params, minutes, note}
  function mount(el, d) {
    el.innerHTML = '<div class="kact-card"><div class="kact-short">활동을 불러오는 중…</div></div>';
    catalogPromise.then(function () {
      var a = catalog && catalog[d.id];
      if (!a) {
        el.innerHTML =
          '<div class="kact-card"><div class="kact-head"><h3>🎲 ' + esc(d.id) + '</h3></div>' +
          '<div class="kact-err">' + (catalogFailed ? '활동 목록을 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.' : '카탈로그에 없는 활동이에요.') + '</div>' +
          '<div class="kact-btns"><button class="kact-btn" disabled>시작</button></div></div>';
        return;
      }
      var minutes = d.minutes || a.minutesClass;
      el.innerHTML =
        '<div class="kact-card">' +
        '<div class="kact-head"><h3>🎲 ' + esc(a.title) + '</h3>' +
        '<span class="kact-badge ' + esc(a.phase) + '">' + (PHASE_KO[a.phase] || a.phase) + '</span></div>' +
        '<div class="kact-short">' + esc(a.short) + '</div>' +
        '<div class="kact-meta">' + (a.pages ? '<span>📖 ' + esc(a.pages) + '</span>' : '') +
        (minutes ? '<span>⏱ 약 ' + minutes + '분</span>' : '') + '</div>' +
        (d.note ? '<div class="kact-note">📝 ' + esc(d.note) + '</div>' : '') +
        '<div class="kact-btns">' +
        '<button class="kact-btn primary" data-kact-start>시작</button>' +
        '<button class="kact-btn" disabled title="Phase 3에서 열려요">활동지</button>' +
        '<button class="kact-btn" disabled title="Phase 2에서 열려요">케이박스로 보내기</button>' +
        '</div></div>';
      el.querySelector('[data-kact-start]').addEventListener('click', function () {
        launch(a, d.params || {});
      });
    });
    return function cleanup() { closeAll(); };
  }

  // ─────────────────────────── iframe 호스트 (§4 시퀀스) ───────────────────────────
  var ov = null, noteOv = null, session = null;

  function ensureOverlays() {
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'kact-overlay';
      document.body.appendChild(ov);
    }
    if (!noteOv) {
      noteOv = document.createElement('div');
      noteOv.id = 'kact-note-ov';
      document.body.appendChild(noteOv);
    }
  }

  function launch(a, params) {
    ensureOverlays();
    if (session) endSession(false);
    var merged = {};
    if (a.paramsSchema) Object.keys(a.paramsSchema).forEach(function (k) { merged[k] = a.paramsSchema[k].default; });
    Object.keys(params || {}).forEach(function (k) { merged[k] = params[k]; });

    session = { a: a, params: merged, readyTimer: null, result: null, iframe: null };
    ov.innerHTML = '<button class="kact-x" data-kact-close>활동 닫기 ✕</button>' +
      '<div class="kact-wait"><div>🎲</div><div>활동을 불러오고 있어요…</div></div>';
    ov.classList.add('active');
    ov.querySelector('[data-kact-close]').addEventListener('click', function () { hostClose(); });
    createFrame();
  }

  function createFrame() {
    var s = session; if (!s) return;
    if (s.iframe) { try { ov.removeChild(s.iframe); } catch (e) {} }
    var f = document.createElement('iframe');
    f.src = '/kedu/' + s.a.src + '?mode=class';
    f.allow = 'autoplay';
    s.iframe = f;
    ov.appendChild(f);
    clearTimeout(s.readyTimer);
    s.readyTimer = setTimeout(function () {   // §4-4: READY 5초 미도착
      var w = ov.querySelector('.kact-wait');
      if (w) w.innerHTML = '<div>😢</div><div>활동을 불러오지 못했어요</div>' +
        '<button class="kact-btn primary" data-kact-retry>다시 시도</button>';
      var rb = ov.querySelector('[data-kact-retry]');
      if (rb) rb.addEventListener('click', function () {
        var w2 = ov.querySelector('.kact-wait');
        if (w2) w2.innerHTML = '<div>🎲</div><div>활동을 불러오고 있어요…</div>';
        createFrame();
      });
    }, READY_TIMEOUT_MS);
  }

  window.addEventListener('message', function (ev) {
    if (!session || !session.iframe) return;
    if (ev.source !== session.iframe.contentWindow) return;
    var loc = location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!loc && ev.origin !== location.origin) return;
    var m = ev.data;
    if (!m || m.v !== 1) return;

    if (m.t === 'ACTIVITY_READY') {
      clearTimeout(session.readyTimer);
      var w = ov.querySelector('.kact-wait');
      if (w) w.remove();
      session.iframe.contentWindow.postMessage({
        t: 'ACTIVITY_CONFIG', v: 1, mode: 'class',
        params: session.params,
        meta: { teamNames: ['케이팀', '듀팀'], mute: false }
      }, loc ? '*' : location.origin);
    } else if (m.t === 'ACTIVITY_RESULT') {
      session.result = m;
      endSession(true);
    } else if (m.t === 'ACTIVITY_EXIT') {
      endSession(false);                      // §14-7: 수첩 없이 슬라이드 복귀
    }
    // ACTIVITY_PROGRESS는 Phase 1에서는 무시 (수신 무해)
  });

  function hostClose() {                       // 교사 [닫기] → CLOSE 발신 (§4-2 ⑥)
    if (!session) return;
    var loc = location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    var sent = false;
    if (session.iframe && session.iframe.contentWindow) {
      try { session.iframe.contentWindow.postMessage({ t: 'ACTIVITY_CLOSE', v: 1 }, loc ? '*' : location.origin); sent = true; } catch (e) {}
    }
    // 도구가 EXIT/RESULT로 응답하면 message 핸들러가 정리. 800ms 무응답(구버전 도구 등) 시 강제 정리.
    setTimeout(function () { if (session) endSession(false); }, sent ? 800 : 0);
  }

  function endSession(showNotebook) {
    if (!session) return;
    clearTimeout(session.readyTimer);
    var res = session.result;
    var a = session.a;
    if (session.iframe) { try { ov.removeChild(session.iframe); } catch (e) {} }
    ov.classList.remove('active');
    ov.innerHTML = '';
    session = null;
    if (showNotebook && res) openNotebook(a, res);
  }

  // ─────────────────────────── 수첩 오버레이 (§6-2) ───────────────────────────
  function openNotebook(a, res) {
    ensureOverlays();
    var types = a.types || {};
    var by = res.byType || {};
    var rows = Object.keys(by).map(function (k) {
      var v = by[k] || {};
      return { key: k, label: types[k] || '기타', ok: v.ok | 0, miss: v.miss | 0 };
    }).sort(function (x, y) { return y.miss - x.miss; }).slice(0, 3);   // miss 내림차순 상위 3개
    var allClear = Object.keys(by).length > 0 && rows.every(function (r) { return r.miss === 0; });

    var teamHtml = '';
    if (res.teams && res.teams.length === 2) {
      teamHtml = esc(res.teams[0].name) + ' ' + res.teams[0].score + ' : ' + res.teams[1].score + ' ' + esc(res.teams[1].name);
    } else {
      teamHtml = res.score + ' / ' + res.total;
    }

    var body;
    if (allClear) {
      body = '<div class="kn-clear">오늘은 다 맞았어요! 다음엔 범위를 올려볼까요? 🎉</div>';
    } else if (!rows.length) {
      body = '<div class="kn-clear" style="background:#fef3c7;color:#92400e">탐험 활동 — 유형 분석 없음</div>';
    } else {
      body = rows.map(function (r) {
        var tot = r.ok + r.miss;
        var okDots = tot ? Math.round(r.ok / tot * 10) : 0;
        var bar = '<span style="color:#22c55e">' + '●'.repeat(okDots) + '</span>' +
                  '<span style="color:#f87171">' + '○'.repeat(10 - okDots) + '</span>';
        return '<div class="kn-row"><div class="kn-label">' + esc(r.label) + '</div>' +
               '<div class="kn-bar">' + bar + '</div><div class="kn-miss">✗ ' + r.miss + '</div></div>';
      }).join('');
    }

    noteOv.innerHTML =
      '<div class="kact-note-card">' +
      '<div class="kn-top"><div class="kn-judge">🦉</div><div>' +
      '<div style="font-size:15px;color:#b45309">' + esc(a.title) + ' — 케이 심판의 수첩</div>' +
      '<div class="kn-score">' + teamHtml + '</div></div></div>' +
      body +
      '<div class="kn-btns">' +
      '<button class="kact-btn" disabled title="Phase 2에서 열려요">케이박스로 복습 보내기</button>' +
      '<button class="kact-btn primary" data-kn-retry>다시 하기</button>' +
      '<button class="kact-btn" data-kn-close>닫기</button>' +
      '</div></div>';
    noteOv.classList.add('active');
    noteOv.querySelector('[data-kn-close]').addEventListener('click', function () { noteOv.classList.remove('active'); });
    noteOv.querySelector('[data-kn-retry]').addEventListener('click', function () {
      noteOv.classList.remove('active');
      var d = { id: a.id, params: null };
      launch(a, {});
    });
  }

  function closeAll() {
    if (session) endSession(false);
    if (noteOv) noteOv.classList.remove('active');
  }

  // ─────────────────────────── 카탈로그 탭 (§6-3) ───────────────────────────
  function setContext(c) {
    ctx = c || ctx;
    catalogPromise.then(function () { renderPicker(); renderToolbar(); });
  }

  function renderPicker() {
    var panel = document.querySelector('[data-tab-panel="blocks"]');
    if (!panel || !catalog) return;
    var host = panel.querySelector('#kact-picker');
    if (!host) {
      host = document.createElement('div');
      host.id = 'kact-picker';
      host.className = 'kact-pick-sec';
      panel.appendChild(host);
    }
    var all = Object.keys(catalog).map(function (k) { return catalog[k]; }).filter(function (a) {
      if (a.status === 'retired') return false;
      if (ctx.grade && a.map.grade !== ctx.grade) return false;
      if (ctx.subject && a.map.subject !== ctx.subject) return false;
      return true;
    });
    if (!all.length) { host.innerHTML = ''; return; }
    var rec = all.filter(function (a) {
      return ctx.unit && a.map.unit === ctx.unit &&
        (ctx.lessons || []).some(function (l) { return (a.map.lessons || []).indexOf(l) >= 0; });
    });
    var unitOnly = all.filter(function (a) { return ctx.unit && a.map.unit === ctx.unit && rec.indexOf(a) < 0; });
    var rest = all.filter(function (a) { return rec.indexOf(a) < 0 && unitOnly.indexOf(a) < 0; });

    function card(a) {
      return '<div class="kact-pick" data-kact-id="' + esc(a.id) + '">' +
        '<div class="pk-t">🎲 ' + esc(a.title) + ' <span class="kact-badge ' + esc(a.phase) + '" style="font-size:11px">' + (PHASE_KO[a.phase] || '') + '</span></div>' +
        '<div class="pk-s">' + esc(a.short) + (a.pages ? ' · 📖' + esc(a.pages) : '') + '</div></div>';
    }
    host.innerHTML = '<div class="kact-pick-h">🎲 활동</div>' +
      (rec.length ? '<div class="kact-pick-h" style="font-weight:400">이 차시 추천</div>' + rec.map(card).join('') : '') +
      (unitOnly.length ? '<div class="kact-pick-h" style="font-weight:400">이 단원</div>' + unitOnly.map(card).join('') : '') +
      (rest.length ? '<details><summary class="kact-pick-h" style="cursor:pointer">전체 (' + rest.length + ')</summary>' + rest.map(card).join('') + '</details>' : '');

    host.querySelectorAll('.kact-pick').forEach(function (el) {
      el.addEventListener('click', function () { openParamsForm(catalog[el.dataset.kactId], host); });
    });
  }

  function openParamsForm(a, host) {
    var old = host.querySelector('.kact-form'); if (old) old.remove();
    var form = document.createElement('div');
    form.className = 'kact-form kact-pick';
    form.style.cursor = 'default';
    var chosen = {};
    var html = '<div class="pk-t">⚙️ ' + esc(a.title) + ' 설정</div>';
    Object.keys(a.paramsSchema || {}).forEach(function (k) {
      var p = a.paramsSchema[k];
      chosen[k] = p.default;
      html += '<div class="pk-s" style="margin-top:6px">' + esc(p.label) + '</div><div class="kact-chiprow" data-k="' + esc(k) + '">' +
        p.options.map(function (o) {
          return '<button class="kact-chip' + (o === p.default ? ' on' : '') + '" data-v="' + esc(JSON.stringify(o)) + '">' + esc(String(o)) + '</button>';
        }).join('') + '</div>';
    });
    html += '<div class="kact-btns" style="margin-top:8px"><button class="kact-btn primary" data-kact-insert>이 차시에 넣기</button></div>';
    form.innerHTML = html;
    host.appendChild(form);
    form.querySelectorAll('.kact-chiprow').forEach(function (row) {
      row.querySelectorAll('.kact-chip').forEach(function (ch) {
        ch.addEventListener('click', function () {
          row.querySelectorAll('.kact-chip').forEach(function (c) { c.classList.remove('on'); });
          ch.classList.add('on');
          chosen[row.dataset.k] = JSON.parse(ch.dataset.v);
        });
      });
    });
    form.querySelector('[data-kact-insert]').addEventListener('click', function () {
      if (typeof window.KEDU_INSERT_ACTIVITY === 'function') {
        window.KEDU_INSERT_ACTIVITY({ id: a.id, params: chosen, phase: a.phase });
        form.remove();
      } else {
        form.querySelector('[data-kact-insert]').textContent = '엔진 훅 없음 (버전 확인)';
      }
    });
  }

  // ─────────────────────────── 툴바 상설 버튼 (§21-1 발견성 원칙) ───────────────────────────
  var pop = null;

  function recsForContext() {
    if (!catalog) return { rec: [], unit: [] };
    var all = Object.keys(catalog).map(function (k) { return catalog[k]; }).filter(function (a) {
      return a.status !== 'retired' &&
        (!ctx.grade || a.map.grade === ctx.grade) &&
        (!ctx.subject || a.map.subject === ctx.subject);
    });
    var rec = all.filter(function (a) {
      return ctx.unit && a.map.unit === ctx.unit &&
        (ctx.lessons || []).some(function (l) { return (a.map.lessons || []).indexOf(l) >= 0; });
    });
    var unit = all.filter(function (a) { return ctx.unit && a.map.unit === ctx.unit && rec.indexOf(a) < 0; });
    return { rec: rec, unit: unit };
  }

  function renderToolbar() {
    var bar = document.querySelector('.toolbar');
    if (!bar || !catalog) return;
    var btn = document.getElementById('kact-tool-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'kact-tool-btn';
      btn.className = 'icon-btn';
      var anchor = bar.querySelector('.position');
      bar.insertBefore(btn, anchor || null);
      btn.addEventListener('click', function (e) { e.stopPropagation(); togglePop(btn); });
      document.addEventListener('click', function (e) {
        if (pop && pop.classList.contains('active') && !pop.contains(e.target)) pop.classList.remove('active');
      });
    }
    var r = recsForContext();
    btn.innerHTML = '🎲 활동' + (r.rec.length ? '<span class="kact-cnt">' + r.rec.length + '</span>' : '');
    btn.style.display = (r.rec.length || r.unit.length) ? '' : 'none';   // 이 단원에 아무것도 없으면 숨김
  }

  function togglePop(btn) {
    ensurePop();
    if (pop.classList.contains('active')) { pop.classList.remove('active'); return; }
    var r = recsForContext();
    var list = r.rec.length ? r.rec : r.unit;
    var head = r.rec.length ? '이 차시에 딱 맞는 활동' : '이 단원의 활동';
    function item(a) {
      return '<div class="kp-item" data-id="' + esc(a.id) + '">' +
        '<div class="pk-t">🎲 ' + esc(a.title) + '</div>' +
        '<div class="pk-s">' + esc(a.short) + (a.pages ? ' · 📖' + esc(a.pages) : '') + (a.minutesClass ? ' · ⏱' + a.minutesClass + '분' : '') + '</div>' +
        '<div class="kact-btns">' +
        '<button class="kact-btn primary" data-kp-go>바로 시작</button>' +
        '<button class="kact-btn" data-kp-ins>슬라이드에 넣기</button>' +
        '</div></div>';
    }
    pop.innerHTML = '<div class="kp-h">' + head + '</div>' + list.map(item).join('');
    var rect = btn.getBoundingClientRect();
    pop.style.top = (rect.bottom + 8) + 'px';
    pop.style.right = Math.max(8, window.innerWidth - rect.right) + 'px';
    pop.querySelectorAll('.kp-item').forEach(function (it) {
      var a = catalog[it.dataset.id];
      it.querySelector('[data-kp-go]').addEventListener('click', function () {
        pop.classList.remove('active');
        launch(a, {});                                   // 기본 파라미터로 즉시 실행 — 두 탭 목표
      });
      it.querySelector('[data-kp-ins]').addEventListener('click', function () {
        pop.classList.remove('active');
        if (typeof window.KEDU_INSERT_ACTIVITY === 'function') window.KEDU_INSERT_ACTIVITY({ id: a.id, params: null, phase: a.phase });
      });
    });
    pop.classList.add('active');
  }

  function ensurePop() {
    if (pop) return;
    pop = document.createElement('div');
    pop.id = 'kact-pop';
    document.body.appendChild(pop);
  }

  window.KActivity = { mount: mount, launch: launch, setContext: setContext };
})();

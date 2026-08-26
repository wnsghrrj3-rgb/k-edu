/* =============================================================
 * kedu_boxbar.js — 어디서든 담기 바 (케이박스 장바구니)
 * 명세: handoff/classwork/SPEC_BOXBAR_담기바.md
 *
 * 한 줄: 교사가 보는 화면을 버튼 한 번으로 케이박스에 담는다.
 *   학생·비로그인엔 존재 자체가 안 보이고(네트워크 0), 담기함=cw_bundles draft 재사용.
 *
 * 부팅 규약(§4): localStorage 캐시 없으면 아무것도 안 함 → 학생 기기 비용 0.
 *   캐시는 교사 페이지(허브 교사분기·classwork·케이티처)가 심는다: KeduBoxbar.markTeacher().
 *
 * 2026-08-26 「우리 반에 열기」(생태계설계_v2 §F · §J-3): 초대 패널에 열기/닫기 토글.
 *   열기 = class_openings 한 줄(open_for_class) + 케이박스 카드 한 장(같은 초대 파이프라인) — 한 통로.
 *   닫기 = close_for_class(원장만 지움, 카드는 이력). 키 규약 = /kedu_gate.js 와 동일:
 *     차시(<meta kedu-lesson-id>) → lesson-id 정확 일치 · 영역 허브(/kpark/, /kpark/index.html) → '/kpark/' 접두 · 그 외 → 경로.
 * ============================================================= */
(function () {
  'use strict';
  if (window.__keduBoxbar) return;
  window.__keduBoxbar = true;

  var CACHE = 'kedu_boxbar_teacher_v1';
  var QUEUE = 'kedu_boxbar_queue_v1';
  var TTL = 24 * 3600 * 1000;
  var DRAFT_TITLE = '📦 담기함';

  // ── 캐시(교사 표식) ──────────────────────────────────────────────────────
  function readCache() {
    try { var c = JSON.parse(localStorage.getItem(CACHE)); if (c && Date.now() - c.at < TTL) return c; } catch (e) {}
    return null;
  }
  function markTeacher() {   // 교사 페이지가 세션 확인 후 호출
    try { localStorage.setItem(CACHE, JSON.stringify({ at: Date.now() })); } catch (e) {}
    boot();  // 지금 페이지에서 즉시 바 띄우기
  }
  function clearCache() { try { localStorage.removeItem(CACHE); } catch (e) {} }

  // ── 경로 → kind 자동 판별(§2) ────────────────────────────────────────────
  function detectKind(pathname) {
    var p = pathname || location.pathname;
    if (/^\/kedu\/quiz\//.test(p)) return 'quiz';
    if (/^\/kedu\/teacher\//.test(p)) return 'kteacher';
    if (/^\/grade[1-6]\//.test(p)) return 'selfstudy';
    if (/^\/labs\//.test(p) || /klab/.test(p)) return 'klab';
    if (/^\/kple\//.test(p)) return 'kple';
    if (/^\/kmake\//.test(p)) return 'kmake';
    if (/^\/maker\//.test(p)) return 'kmake';   /* R79: 새 케이메이커(/maker)도 같은 분류 */
    if (/^\/english\//.test(p)) return 'english';
    if (/^\/kedu\/activities\//.test(p)) return 'activity';
    return 'link';
  }
  var KIND_LABEL = { kteacher: '케이티처', selfstudy: '자기주도', klab: '케이랩', kple: '케이플', kmake: '케이메이커', english: '영어', quiz: '케이퀴즈', activity: '활동', link: '링크' };
  var KIND_HEX = { kteacher: '#FF85A1', selfstudy: '#7E57C2', klab: '#3BAB72', kple: '#FFB347', kmake: '#5B8EF8', english: '#B7791F', quiz: '#5B8EF8', activity: '#7E57C2', link: '#94A3B8' };
  // 결과봉투 훅이 실제 배선된 도구 = 제출·자동채점이 케이박스로 모임 (정직 표기 §7-2)
  var HOOKED = { selfstudy: 1, quiz: 1, activity: 1, english: 1, klab: 1 };
  function hookLabel(kind) {
    if (HOOKED[kind]) return { t: '✅ 제출·자동채점이 케이박스로 모여요', ok: true };
    if (kind === 'kteacher') return { t: '🎬 수업 진행용 화면이에요', ok: false };
    return { t: '🔗 함께 열어보는 링크예요 (제출은 모이지 않아요)', ok: false };
  }

  // 현재 페이지 자기소개 (도구 훅 CTX 우선)
  function currentItem() {
    var ctx = window.KEDU_BOXBAR_CTX;  // 도구가 제공 시 우선(케이티처 차시 등)
    if (ctx && ctx.title) {
      return { kind: ctx.kind || detectKind(), title: ctx.title, url: ctx.url || cleanUrl(), config: ctx.config || {} };
    }
    var title = (document.title || '').replace(/\s*[|·\-–]\s*(케이에듀|K-edu|케이티처|케이랩|케이박스).*$/i, '').trim();
    if (!title) title = decodeURIComponent((location.pathname.split('/').filter(Boolean).pop() || '').replace(/\.html?$/, ''));
    return { kind: detectKind(), title: title || '이름 없는 콘텐츠', url: cleanUrl(), config: {} };
  }
  function cleanUrl() {
    var u = location.pathname + location.search;
    return u.replace(/([?&])(cwb|cwi|seed)=[^&]*/g, '$1').replace(/[?&]+$/, '').replace(/&&+/g, '&').replace(/\?&/, '?');
  }

  // ── DB(지연 로드) ────────────────────────────────────────────────────────
  function db() {
    if (typeof getKeduDb === 'function') return getKeduDb();
    if (window.supabase && window.KEDU_SUPABASE_URL) return window.supabase.createClient(window.KEDU_SUPABASE_URL, window.KEDU_SUPABASE_ANON_KEY);
    return null;
  }
  function loadSupabase() {
    return new Promise(function (res, rej) {
      if (window.supabase) return res();
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    }).then(function () {
      if (!window.getKeduDb && !window.KEDU_SUPABASE_URL) {
        return new Promise(function (res) { var s = document.createElement('script'); s.src = '/kedu_config.js'; s.onload = res; s.onerror = res; document.head.appendChild(s); });
      }
    });
  }

  var _teacherId = null;
  function myTeacherId(d) {
    return d.rpc('cw_my_teacher_id').then(function (r) { return (r && r.data) || null; })
      .catch(function () { return null; });
  }

  // ── 초대하기(§7): 학급 목록·최근 반 기억 ─────────────────────────────────
  var LASTCLASS = 'kedu_boxbar_lastclass_v1';   // {id,label,at}
  var RESENT = 'kedu_boxbar_lastinvite_v1';     // {url,classId,at} — 재발송 실수 가드
  var _classes = null;
  function lastClass() { try { return JSON.parse(localStorage.getItem(LASTCLASS)); } catch (e) { return null; } }
  function rememberClass(c) { try { localStorage.setItem(LASTCLASS, JSON.stringify({ id: c.id, label: c.label, at: Date.now() })); } catch (e) {} }
  function loadClasses(d, tid) {
    if (_classes) return Promise.resolve(_classes);
    return d.from('class_codes').select('id,label').eq('teacher_id', tid).eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(function (r) { _classes = r.data || []; return _classes; });
  }

  // 교사 세션 확정(공용): resolve → {d, tid}
  function withTeacher() {
    return loadSupabase().then(function () {
      var d = db(); if (!d) throw new Error('no db');
      return d.auth.getSession().then(function (s) {
        if (!s.data.session) { clearCache(); hide(); throw new Error('no session'); }
        if (_teacherId) return { d: d, tid: _teacherId };
        return myTeacherId(d).then(function (tid) {
          if (!tid) { clearCache(); hide(); throw new Error('not teacher'); }
          _teacherId = tid;
          return { d: d, tid: tid };
        });
      });
    });
  }

  // 바로 초대: 박스 자동 생성(sent) + 항목 1개 + 반 발송 — 기존 수합·채점 파이프라인 그대로
  function inviteCurrent(cls) {
    var item = currentItem();
    // 재발송 실수 가드: 같은 페이지·같은 반 3분 내 = 한 번 더 눌러야 재발송
    var last = null; try { last = JSON.parse(localStorage.getItem(RESENT)); } catch (e) {}
    if (last && last.url === item.url && last.classId === cls.id && Date.now() - last.at < 180000 && !inviteCurrent._again) {
      inviteCurrent._again = true;
      toast('방금 ' + cls.label + '에 보냈어요 — 한 번 더 누르면 다시 보내요');
      setTimeout(function () { inviteCurrent._again = false; }, 4000);
      return Promise.resolve(null);
    }
    inviteCurrent._again = false;
    setBusy(true);
    return withTeacher().then(function (ctx) {
      var d = ctx.d;
      return d.from('cw_bundles').insert({
        teacher_id: ctx.tid, title: item.title, description: '',
        status: 'sent', sent_at: new Date().toISOString()
      }).select('id').single().then(function (ins) {
        if (ins.error || !ins.data) throw new Error('bundle');
        var bid = ins.data.id;
        return d.from('cw_items').insert({
          bundle_id: bid, kind: item.kind, title: item.title, url: item.url,
          config: item.config || {}, sort_order: 0
        }).then(function (ir) {
          if (ir.error) throw new Error('item');
          return d.from('cw_sends').upsert(
            { bundle_id: bid, class_code_id: cls.id },
            { onConflict: 'bundle_id,class_code_id' }
          ).then(function (sr) {
            if (sr.error) throw new Error('send');
            return bid;
          });
        });
      });
    }).then(function (bid) {
      setBusy(false);
      rememberClass(cls);
      try { localStorage.setItem(RESENT, JSON.stringify({ url: item.url, classId: cls.id, at: Date.now() })); } catch (e) {}
      closePanel();
      toast('📨 ' + cls.label + '에 초대장을 보냈어요! 받은박스에 바로 떠요');
      return bid;
    }).catch(function (e) {
      setBusy(false);
      if (String(e.message).indexOf('session') < 0 && String(e.message).indexOf('teacher') < 0) {
        toast('보내기에 실패했어요 — 잠시 후 다시 눌러 주세요');
      }
      return null;
    });
  }

  // 담기함(draft) 확보 → id
  function ensureDraft(d, teacherId) {
    return d.from('cw_bundles').select('id').eq('teacher_id', teacherId).eq('status', 'draft').eq('title', DRAFT_TITLE).limit(1)
      .then(function (r) {
        if (r.data && r.data[0]) return r.data[0].id;
        return d.from('cw_bundles').insert({ teacher_id: teacherId, title: DRAFT_TITLE, description: '', status: 'draft' }).select('id').single()
          .then(function (ins) { return ins.data.id; });
      });
  }

  // ── 담기 ─────────────────────────────────────────────────────────────────
  function addCurrent() {
    var item = currentItem();
    setBusy(true);
    loadSupabase().then(function () {
      var d = db(); if (!d) throw new Error('no db');
      return d.auth.getSession().then(function (s) {
        if (!s.data.session) { clearCache(); hide(); throw new Error('no session'); }
        return myTeacherId(d).then(function (tid) {
          if (!tid) { clearCache(); hide(); throw new Error('not teacher'); }
          _teacherId = tid;
          return ensureDraft(d, tid).then(function (bid) {
            // 중복 URL 방지
            return d.from('cw_items').select('id,url').eq('bundle_id', bid).then(function (ex) {
              var dup = (ex.data || []).some(function (x) { return x.url === item.url; });
              if (dup) { toast('이미 담은 콘텐츠예요'); return null; }
              return d.from('cw_items').insert({
                bundle_id: bid, kind: item.kind, title: item.title, url: item.url,
                config: item.config || {}, sort_order: (ex.data || []).length
              }).then(function () { return (ex.data || []).length + 1; });
            });
          });
        });
      });
    }).then(function (count) {
      setBusy(false);
      if (count != null) { bumpBadge(count); toast('케이박스에 담았어요 · ' + count + '개'); }
    }).catch(function (e) {
      setBusy(false);
      if (String(e.message).indexOf('session') < 0 && String(e.message).indexOf('teacher') < 0) {
        queueOffline(item); toast('나중에 담을게요 (오프라인)');
      }
    });
  }

  function queueOffline(item) {
    try { var q = JSON.parse(localStorage.getItem(QUEUE) || '[]'); q.push(item); localStorage.setItem(QUEUE, JSON.stringify(q)); } catch (e) {}
  }

  // ── 「우리 반에 열기」(§F) ─────────────────────────────────────────────────
  // 현재 페이지의 개방 키 — 게이트(isOpened)와 같은 규약
  function openingKey(pathname, lessonId) {
    var p = (pathname || location.pathname || '/').toLowerCase();
    if (lessonId === undefined) {
      var m = document.querySelector('meta[name="kedu-lesson-id"]');
      lessonId = m ? (m.getAttribute('content') || '') : '';
    }
    if (lessonId) return { key: lessonId, scope: 'lesson' };
    var a = /^\/([a-z0-9_-]+)\/(index\.html?)?$/.exec(p);
    if (a) return { key: '/' + a[1] + '/', scope: 'area' };
    return { key: p, scope: 'page' };
  }
  var SCOPE_LABEL = { lesson: '이 차시', area: '이 영역 전체', page: '이 페이지' };

  // 케이박스 카드 한 장(sent 박스 + 항목 + 발송) — 초대와 같은 파이프라인. 실패해도 열기는 진행(bundle 없이).
  function createCard(d, tid, cls, item) {
    return d.from('cw_bundles').insert({
      teacher_id: tid, title: item.title, description: '', status: 'sent', sent_at: new Date().toISOString()
    }).select('id').single().then(function (ins) {
      if (ins.error || !ins.data) throw new Error('bundle');
      var bid = ins.data.id;
      return d.from('cw_items').insert({ bundle_id: bid, kind: item.kind, title: item.title, url: item.url, config: item.config || {}, sort_order: 0 })
        .then(function (ir) {
          if (ir.error) throw new Error('item');
          return d.from('cw_sends').upsert({ bundle_id: bid, class_code_id: cls.id }, { onConflict: 'bundle_id,class_code_id' })
            .then(function (sr) { if (sr.error) throw new Error('send'); return bid; });
        });
    });
  }
  function openingState(d, cls, key) {
    return d.from('class_openings').select('id,bundle_id').eq('class_code_id', cls.id).eq('content_key', key).maybeSingle()
      .then(function (r) { return (r && !r.error && r.data) ? r.data : null; });
  }
  function openForClass(cls) {
    var item = currentItem();
    var ok = openingKey();
    setBusy(true);
    return withTeacher().then(function (ctx) {
      var d = ctx.d;
      return openingState(d, cls, ok.key).then(function (st) {
        var cardP = (st && st.bundle_id) ? Promise.resolve(st.bundle_id)
          : createCard(d, ctx.tid, cls, item).catch(function () { return null; });
        return cardP.then(function (bid) {
          return d.rpc('open_for_class', {
            p_class_code_id: cls.id, p_content_key: ok.key, p_title: item.title, p_kind: item.kind, p_url: item.url, p_bundle_id: bid
          }).then(function (r) {
            if (r.error) throw new Error(r.error.message || 'open');
            return { id: r.data, bundle_id: bid };
          });
        });
      });
    }).then(function (res) {
      setBusy(false); rememberClass(cls);
      toast('🔓 ' + cls.label + '에 ' + SCOPE_LABEL[ok.scope] + '를 열었어요' + (res.bundle_id ? ' — 케이박스에도 카드가 떴어요' : ''));
      return res;
    }).catch(function (e) {
      setBusy(false);
      var msg = String(e && e.message || '');
      if (msg.indexOf('approval') >= 0) toast('교사 확인이 끝나야 열 수 있어요 — 선생님 공간에서 신청해 주세요');
      else if (msg.indexOf('session') < 0 && msg.indexOf('teacher') < 0) toast('열기에 실패했어요 — 잠시 후 다시 눌러 주세요');
      return null;
    });
  }
  function closeForClass(cls) {
    var ok = openingKey();
    setBusy(true);
    return withTeacher().then(function (ctx) {
      return ctx.d.rpc('close_for_class', { p_class_code_id: cls.id, p_content_key: ok.key }).then(function (r) {
        if (r.error) throw new Error(r.error.message || 'close');
        return r.data | 0;
      });
    }).then(function (n) {
      setBusy(false);
      toast('🔒 ' + cls.label + '에서 ' + SCOPE_LABEL[ok.scope] + '를 닫았어요');
      return n;
    }).catch(function (e) {
      setBusy(false);
      if (String(e.message).indexOf('session') < 0 && String(e.message).indexOf('teacher') < 0) toast('닫기에 실패했어요 — 잠시 후 다시 눌러 주세요');
      return null;
    });
  }

  // ── UI ───────────────────────────────────────────────────────────────────
  var fab, badgeEl, busy = false;
  function boot() {
    if (!readCache()) return;          // 교사 표식 없으면 아무것도 안 함
    if (fab) { fab.style.display = ''; return; }
    // 수업 진행(프레젠테이션) 모드면 숨김 — 엔진이 body에 kt-presenting 부여 시
    if (document.body.classList.contains('kt-presenting')) return;
    injectCss();
    fab = document.createElement('div');
    fab.className = 'kbx-fab';
    fab.innerHTML = '<span class="kbx-ico">📦</span><span class="kbx-badge" style="display:none">0</span>';
    fab.title = '학생 초대 · 케이박스에 담기';
    fab.onclick = function (e) { if (e.target.classList.contains('kbx-badge')) { goBox(); } else { openPanel(); } };
    // 길게 누르면 케이박스로
    var pressT;
    fab.onmousedown = fab.ontouchstart = function () { pressT = setTimeout(goBox, 550); };
    fab.onmouseup = fab.onmouseleave = fab.ontouchend = function () { clearTimeout(pressT); };
    document.body.appendChild(fab);
    badgeEl = fab.querySelector('.kbx-badge');
    // 오프라인 큐 flush 시도
    flushQueue();
  }

  // ── 초대 패널(§7) ────────────────────────────────────────────────────────
  var panel = null, selClass = null;
  function openPanel() {
    if (busy) return;
    if (panel) { closePanel(); return; }
    var item = currentItem();
    var hook = hookLabel(item.kind);
    panel = document.createElement('div');
    panel.className = 'kbx-panel';
    panel.innerHTML =
      '<div class="kbx-p-head"><span class="kbx-p-kind" style="background:' + (KIND_HEX[item.kind] || '#94A3B8') + '">' + (KIND_LABEL[item.kind] || '링크') + '</span>' +
      '<span class="kbx-p-title"></span></div>' +
      '<div class="kbx-p-hook ' + (hook.ok ? 'ok' : '') + '">' + hook.t + '</div>' +
      '<div class="kbx-p-classes"><span class="kbx-p-loading">우리 반 불러오는 중…</span></div>' +
      '<button class="kbx-p-invite" disabled>📤 바로 초대</button>' +
      '<div class="kbx-p-open"><span class="kbx-p-open-txt">반을 고르면 열기 상태가 보여요</span><button class="kbx-p-open-btn" disabled>🔓 우리 반에 열기</button></div>' +
      '<div class="kbx-p-row"><button class="kbx-p-add">📦 담기</button><button class="kbx-p-go">케이박스 열기 →</button></div>';
    panel.querySelector('.kbx-p-title').textContent = item.title;
    panel.querySelector('.kbx-p-add').onclick = function () { closePanel(); addCurrent(); };
    panel.querySelector('.kbx-p-go').onclick = goBox;
    var inviteBtn = panel.querySelector('.kbx-p-invite');
    inviteBtn.onclick = function () { if (selClass) inviteCurrent(selClass); };
    document.body.appendChild(panel);
    // 바깥 탭으로 닫기
    setTimeout(function () { document.addEventListener('click', outsideClose, true); }, 0);
    // 학급 로드 → 칩 렌더 (최근 반 자동 선택 = 두 번째부터 진짜 원클릭)
    withTeacher().then(function (ctx) { return loadClasses(ctx.d, ctx.tid); })
      .then(function (cs) { if (panel) renderClassChips(cs); })
      .catch(function () { if (panel) panel.querySelector('.kbx-p-classes').innerHTML = '<span class="kbx-p-loading">학급을 불러오지 못했어요</span>'; });
  }
  function renderClassChips(cs) {
    var box = panel.querySelector('.kbx-p-classes');
    var inviteBtn = panel.querySelector('.kbx-p-invite');
    if (!cs.length) { box.innerHTML = '<span class="kbx-p-loading">활성화된 학급 코드가 없어요 — 케이박스에서 만들 수 있어요</span>'; return; }
    box.innerHTML = '';
    var last = lastClass();
    selClass = null;
    cs.forEach(function (c) {
      var chip = document.createElement('button');
      chip.className = 'kbx-p-chip';
      chip.textContent = c.label;
      chip.onclick = function () {
        panel.querySelectorAll('.kbx-p-chip').forEach(function (x) { x.classList.remove('sel'); });
        chip.classList.add('sel');
        selClass = c;
        inviteBtn.disabled = false;
        inviteBtn.textContent = '📤 ' + c.label + '에 바로 초대';
        refreshOpening(c);
      };
      box.appendChild(chip);
      if ((last && last.id === c.id) || (!last && cs.length === 1)) chip.onclick();  // 최근 반(또는 유일 반) 자동 선택
    });
  }
  // 열기 블록 — 고른 반의 현재 상태를 보여주고 토글한다
  function refreshOpening(c) {
    if (!panel) return;
    var txt = panel.querySelector('.kbx-p-open-txt'), btn = panel.querySelector('.kbx-p-open-btn');
    if (!txt || !btn) return;
    var ok = openingKey();
    btn.disabled = true; txt.textContent = '열기 상태 확인 중…';
    withTeacher().then(function (ctx) { return openingState(ctx.d, c, ok.key); }).then(function (st) {
      if (!panel || selClass !== c) return;
      var opened = !!st;
      txt.textContent = (opened ? '🔓 ' : '🔒 ') + c.label + '에 ' + SCOPE_LABEL[ok.scope] + (opened ? '가 열려 있어요' : '는 닫혀 있어요');
      btn.textContent = opened ? '🔒 ' + c.label + '에서 닫기' : '🔓 ' + c.label + '에 열기';
      btn.classList.toggle('opened', opened);
      btn.disabled = false;
      btn.onclick = function () {
        btn.disabled = true;
        (opened ? closeForClass(c) : openForClass(c)).then(function () { refreshOpening(c); });
      };
    }).catch(function () { if (panel) txt.textContent = '열기 상태를 불러오지 못했어요'; });
  }
  function outsideClose(e) {
    if (panel && !panel.contains(e.target) && !(fab && fab.contains(e.target))) closePanel();
  }
  function closePanel() {
    if (!panel) return;
    document.removeEventListener('click', outsideClose, true);
    panel.remove(); panel = null; selClass = null;
  }

  function hide() { if (fab) fab.style.display = 'none'; }
  function goBox() { location.href = '/classwork/'; }
  function bumpBadge(n) { if (badgeEl) { badgeEl.textContent = n; badgeEl.style.display = ''; } }
  function setBusy(b) { busy = b; if (fab) fab.classList.toggle('kbx-busy', b); }

  function flushQueue() {
    var q; try { q = JSON.parse(localStorage.getItem(QUEUE) || '[]'); } catch (e) { q = []; }
    if (!q.length) return;
    // 간단히: 다음 담기 때 함께 처리하도록 두되, 여기선 개수만 배지에 반영하지 않음(정확도 우선)
  }

  function toast(msg) {
    var t = document.createElement('div'); t.className = 'kbx-toast'; t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('on'); });
    setTimeout(function () { t.classList.remove('on'); setTimeout(function () { t.remove(); }, 300); }, 1900);
  }

  function injectCss() {
    if (document.getElementById('kbx-css')) return;
    var s = document.createElement('style'); s.id = 'kbx-css';
    s.textContent = [
      '.kbx-fab{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#22A06B,#2BB97C);box-shadow:0 8px 22px rgba(34,160,107,.4);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9000;transition:transform .15s;user-select:none}',
      '.kbx-fab:hover{transform:translateY(-2px) scale(1.04)}',
      '.kbx-fab:active{transform:scale(.94)}',
      '.kbx-fab.kbx-busy{opacity:.6;pointer-events:none}',
      '.kbx-ico{font-size:26px;line-height:1}',
      '.kbx-badge{position:absolute;top:-4px;right:-4px;min-width:22px;height:22px;padding:0 6px;border-radius:50px;background:#E5484D;color:#fff;font:700 12px/22px "Noto Sans KR",sans-serif;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.2)}',
      '.kbx-toast{position:fixed;left:50%;bottom:88px;transform:translateX(-50%) translateY(10px);background:#243B53;color:#fff;font:600 14px/1 "Noto Sans KR",sans-serif;padding:12px 20px;border-radius:50px;z-index:9001;opacity:0;transition:all .3s;white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,.25)}',
      '.kbx-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}',
      '.kbx-panel{position:fixed;right:18px;bottom:calc(84px + env(safe-area-inset-bottom,0px));width:min(320px,calc(100vw - 36px));background:#fff;border-radius:18px;box-shadow:0 18px 50px rgba(33,52,94,.28);padding:16px;z-index:9002;font-family:"Noto Sans KR",sans-serif;animation:kbxUp .18s ease}',
      '@keyframes kbxUp{from{opacity:0;transform:translateY(10px)}}',
      '.kbx-p-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}',
      '.kbx-p-kind{flex-shrink:0;color:#fff;font:700 11px/1 "Noto Sans KR";padding:5px 10px;border-radius:50px}',
      '.kbx-p-title{font:700 14px/1.35 "Noto Sans KR";color:#1A202C;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}',
      '.kbx-p-hook{font:500 12px/1.5 "Noto Sans KR";color:#718096;background:#F4F6FB;border-radius:10px;padding:8px 11px;margin-bottom:11px}',
      '.kbx-p-hook.ok{color:#22A06B;background:#EAF8F1}',
      '.kbx-p-classes{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px;min-height:34px}',
      '.kbx-p-loading{font:500 12.5px/34px "Noto Sans KR";color:#A0AEC0}',
      '.kbx-p-chip{border:1.5px solid #E7ECF3;background:#fff;color:#1A202C;font:600 13px/1 "Noto Sans KR";padding:9px 15px;border-radius:50px;cursor:pointer;transition:all .12s}',
      '.kbx-p-chip.sel{border-color:#5B8EF8;background:#EBF4FF;color:#3B6FD8;box-shadow:0 2px 8px rgba(91,142,248,.25)}',
      '.kbx-p-invite{width:100%;height:48px;border:none;border-radius:13px;background:linear-gradient(120deg,#5B8EF8,#7AA6FF);color:#fff;font:700 15px "Noto Sans KR";cursor:pointer;box-shadow:0 6px 18px rgba(91,142,248,.35);transition:transform .12s}',
      '.kbx-p-invite:hover{transform:translateY(-1px)}',
      '.kbx-p-invite:disabled{background:#E7ECF3;color:#A0AEC0;box-shadow:none;cursor:default;transform:none}',
      '.kbx-p-open{margin-top:9px;padding:9px 11px;border:1.5px dashed #E7ECF3;border-radius:11px;display:flex;flex-direction:column;gap:7px}',
      '.kbx-p-open-txt{font:500 12px/1.4 "Noto Sans KR";color:#718096}',
      '.kbx-p-open-btn{height:40px;border:none;border-radius:11px;background:#EAF8F1;color:#1F7A4D;font:700 13px "Noto Sans KR";cursor:pointer}',
      '.kbx-p-open-btn.opened{background:#FFF5F5;color:#9B2C2C}',
      '.kbx-p-open-btn:disabled{background:#F4F6FB;color:#A0AEC0;cursor:default}',
      '.kbx-p-row{display:flex;gap:8px;margin-top:9px}',
      '.kbx-p-add,.kbx-p-go{flex:1;height:40px;border:1.5px solid #E7ECF3;background:#fff;border-radius:11px;font:600 13px "Noto Sans KR";color:#718096;cursor:pointer}',
      '.kbx-p-add:hover,.kbx-p-go:hover{border-color:#5B8EF8;color:#3B6FD8;background:#EBF4FF}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── 케이티처 "이 퀴즈 담기" 훅 (§2 케이퀴즈 연계) ─────────────────────────
  window.KEDU_BOXBAR_ADDQUIZ = function (quizCfg) {
    // quizCfg = {lesson,n,difficulty,seed}
    window.KEDU_BOXBAR_CTX = {
      kind: 'quiz',
      title: '케이퀴즈 · ' + quizCfg.lesson,
      url: '/kedu/quiz/index.html?lesson=' + encodeURIComponent(quizCfg.lesson) + '&n=' + (quizCfg.n || 10),
      config: { lesson: quizCfg.lesson, n: quizCfg.n, difficulty: quizCfg.difficulty, seedMode: 'fixed', seed: quizCfg.seed }
    };
    addCurrent();
    setTimeout(function () { window.KEDU_BOXBAR_CTX = null; }, 100);
  };

  // ── 케이티처 "이 활동 담기" 훅 (활동 시스템 설계 §8-2) ────────────────────
  // cfg = { id, title, params, sc, seedMode, seed }
  //  params  : 활동 파라미터(범위·문제 수 등) → 딥링크 쿼리로 직렬화
  //  sc      : 재시도 채점 정책 best|first|last (기본 best, D4)
  //  seedMode: 'per_student'(기본, D5 — seed 미고정 = 학생마다 다른 문제) | 'fixed'
  window.KEDU_BOXBAR_ADDACTIVITY = function (cfg) {
    cfg = cfg || {};
    var qs = [];
    var p = cfg.params || {};
    Object.keys(p).forEach(function (k) {
      if (p[k] == null || p[k] === '') return;
      qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(p[k]));
    });
    qs.push('sc=' + (cfg.sc || 'best'));
    if (cfg.seedMode === 'fixed' && cfg.seed != null) qs.push('seed=' + (cfg.seed | 0));
    window.KEDU_BOXBAR_CTX = {
      kind: 'activity',
      title: '활동 · ' + (cfg.title || cfg.id),
      url: '/kedu/activities/' + cfg.id + '.html?' + qs.join('&'),
      config: {
        activityId: cfg.id, params: p, sc: cfg.sc || 'best',
        seedMode: cfg.seedMode || 'per_student', seed: (cfg.seedMode === 'fixed' ? cfg.seed : null)
      }
    };
    addCurrent();
    setTimeout(function () { window.KEDU_BOXBAR_CTX = null; }, 100);
  };

  // ── 공개 API ─────────────────────────────────────────────────────────────
  window.KeduBoxbar = {
    markTeacher: markTeacher,        // 교사 페이지가 세션 확인 후 호출
    boot: boot,                      // 캐시 있으면 바 표시
    openPanel: openPanel,            // 초대 패널 열기(§7)
    invite: inviteCurrent,           // 바로 초대 실행 — invite({id,label})
    openingKey: openingKey,          // 현재 페이지 개방 키 {key, scope} (§F)
    openForClass: openForClass,      // 우리 반에 열기 — openForClass({id,label})
    closeForClass: closeForClass,    // 우리 반에서 닫기
    closePanel: closePanel,
    detectKind: detectKind,          // 테스트용
    currentItem: currentItem,        // 테스트용
    hookLabel: hookLabel,            // 테스트용
    _clear: clearCache
  };

  // 자동 부팅(캐시 있을 때만 동작 — 학생 기기 no-op)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

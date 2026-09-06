/* ============================================================
   케이탐정 사무소 — 공용 코어 (kd_core.js)
   ------------------------------------------------------------
   화면 없음. 규칙·점수·등급·기록만. node 테스트 대상.
   사용: 브라우저 <script src="/kdetective/kd_core.js"> → window.KD
         node    require('./kd_core.js')
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KD = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── 사건 파일 목록 (사무소 입구가 읽는다) ──
  var CASES = [
    { id: 'case1', no: 1, title: '가짜뉴스 공장', tag: '기사에서 조작된 곳을 찾고, 내가 만든 기사로 탐정을 속여라', icon: '📰', open: true,  href: './case1/' },
    { id: 'case2', no: 2, title: 'AI 잡기',       tag: 'AI가 만든 그림·글, 그럴듯하게 틀린 답을 잡아내라',           icon: '🤖', open: false, href: './case2/' },
    { id: 'case3', no: 3, title: '비밀번호 깨기', tag: '내 비밀번호는 몇 초면 뚫릴까 — 1년 버티기 도전',              icon: '🔐', open: false, href: './case3/' },
    { id: 'case4', no: 4, title: '추천 알고리즘', tag: '20번 클릭하면 내 피드가 어디로 쏠리는지 눈으로 본다',            icon: '🎯', open: false, href: './case4/' }
  ];

  // ── 탐정 등급 (누적 점수 기준) ──
  var RANKS = [
    { min: 0,    name: '견습 탐정',   em: '🔍' },
    { min: 150,  name: '신입 탐정',   em: '🕵️' },
    { min: 400,  name: '베테랑 탐정', em: '🎩' },
    { min: 900,  name: '명탐정',      em: '🏅' },
    { min: 1800, name: '전설의 탐정', em: '👑' }
  ];
  function rankOf(total) {
    var r = RANKS[0];
    for (var i = 0; i < RANKS.length; i++) if (total >= RANKS[i].min) r = RANKS[i];
    return r;
  }
  function nextRank(total) {
    for (var i = 0; i < RANKS.length; i++) if (total < RANKS[i].min) return RANKS[i];
    return null;
  }

  // ── 기록 (localStorage — 학급 저장은 2단계) ──
  var LS = 'kdetective.v1';
  function emptyRec() { return { total: 0, solved: 0, best: {}, level: {}, streakBest: 0 }; }
  function loadRec(store) {
    store = store || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return emptyRec();
    try { var v = JSON.parse(store.getItem(LS) || 'null'); return v && typeof v === 'object' ? merge(emptyRec(), v) : emptyRec(); }
    catch (e) { return emptyRec(); }
  }
  function saveRec(rec, store) {
    store = store || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return false;
    try { store.setItem(LS, JSON.stringify(rec)); return true; } catch (e) { return false; }
  }
  function merge(a, b) { for (var k in b) if (Object.prototype.hasOwnProperty.call(b, k)) a[k] = b[k]; return a; }
  /* 한 판 끝: 점수 반영. key = 'case1.find' / 'case1.make' 등 */
  function commitRound(rec, key, score, level, streak) {
    rec.total += Math.max(0, score | 0);
    rec.solved += 1;
    if (!rec.best[key] || score > rec.best[key]) rec.best[key] = score;
    if (level && (!rec.level[key] || level > rec.level[key])) rec.level[key] = level;
    if (streak > rec.streakBest) rec.streakBest = streak;
    return rec;
  }
  /* 다음 레벨 열림 조건: 그 레벨에서 만점의 60% 이상 */
  function unlockedLevel(rec, key, perfectPerLevel) {
    var lv = 1;
    for (var l = 1; l < 5; l++) {
      var b = rec.best[key + '.l' + l] || 0;
      if (b >= Math.ceil(perfectPerLevel(l) * 0.6)) lv = l + 1; else break;
    }
    return lv;
  }

  // ── 사건 1 · 가짜뉴스 공장 ─────────────────────────────
  // 조작 자리(slot) 4곳 · 근거(reason) 4종. reason 은 slot 과 1:1.
  var SLOTS = ['title', 'photo', 'source', 'date'];
  var REASONS = {
    title:  { id: 'exag',   label: '과장된 제목',     hint: '본문과 제목이 다른 말을 한다' },
    photo:  { id: 'photo',  label: '사진이 딴 얘기',  hint: '사진 설명(작은 글씨)을 본다' },
    source: { id: 'source', label: '출처가 수상함',   hint: '탐정 수첩의 믿을 만한 곳 목록에 없다' },
    date:   { id: 'date',   label: '날짜가 안 맞음',  hint: '오래된 기사가 [속보]로 돌고 있다' }
  };
  // 게임 세계의 믿을 만한 곳 (탐정 수첩에 그대로 공개) — 전부 가상
  var TRUSTED = ['어린이신문', '우리동네일보', '과학어린이', '날씨청', '교육부 알림', '케이에듀 뉴스', '학교 누리집'];
  // 수상한 출처 — 겉보기 단계별
  var FAKE_SRC = {
    obvious: ['대박뉴스24', '진실TV', '익명 게시판', '단톡방 캡처', '@소문쟁이'],
    subtle:  ['어린이신문24', '우리동내일보', '과학 어린이TV', '날씨청 팬카페', '교육부알림방']
  };

  /* 레벨 규칙: 1 = 뚜렷한 조작 1곳 · 2 = 교묘한 조작 1곳 · 3 = 뚜렷한 2곳 · 4 = 교묘한 2곳 · 5 = 교묘한 2곳 + 시간 */
  function levelRule(lv) {
    lv = Math.max(1, Math.min(5, lv | 0));
    return { level: lv, slots: lv >= 3 ? 2 : 1, subtle: lv === 2 || lv >= 4, timed: lv === 5, seconds: lv === 5 ? 40 : 0 };
  }
  function perfectFind(lv) { var r = levelRule(lv); return r.slots * 15 * 5; } // 5문제 기준 만점(자리10+근거5)

  // 결정적 난수 (같은 시드 → 같은 사건)
  function rng(seed) {
    var s = (seed >>> 0) || 1;
    return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  }
  function pick(arr, r) { return arr[Math.floor(r() * arr.length) % arr.length]; }

  /* 기사 1개 + 레벨 → 조작된 카드 만들기.
     art = { id, level, src, date, title, body, photo:{icon,cap}, fake:{ title:{obvious,subtle}, photo:{obvious,subtle}, date:{obvious,subtle} } } */
  function forge(art, lv, r) {
    var rule = levelRule(lv), k = rule.subtle ? 'subtle' : 'obvious';
    var avail = SLOTS.slice();
    var chosen = [];
    while (chosen.length < rule.slots && avail.length) {
      var s = pick(avail, r); avail.splice(avail.indexOf(s), 1); chosen.push(s);
    }
    var card = { id: art.id, src: art.src, date: art.date, title: art.title, body: art.body, photo: { icon: art.photo.icon, cap: art.photo.cap, file: art.photo.file || '' }, forged: chosen.slice().sort(), level: rule.level, why: {} };
    for (var i = 0; i < chosen.length; i++) {
      var sl = chosen[i];
      if (sl === 'title')  { card.title = art.fake.title[k]; card.why.title = '본문은 「' + art.fake.titleKey + '」인데 제목이 다른 말을 한다.'; }
      if (sl === 'photo')  { card.photo.cap = art.fake.photo[k]; card.photo.icon = art.fake.photoIcon || art.photo.icon; card.photo.file = ''; card.why.photo = '사진 설명을 보면 이 기사 장면이 아니다.'; }
      if (sl === 'source') { card.src = pick(FAKE_SRC[k], r); card.why.source = '「' + card.src + '」은 탐정 수첩의 믿을 만한 곳 목록에 없다' + (k === 'subtle' ? ' — 진짜 이름과 한 글자 다르다.' : '.'); }
      if (sl === 'date')   { card.date = art.fake.date[k]; card.title = (card.title.indexOf('[속보]') === 0 ? '' : '[속보] ') + card.title; card.why.date = '날짜를 보면 ' + card.date.slice(0, 4) + '년 기사다. 오래된 기사를 [속보]처럼 다시 돌리면 가짜 정보가 된다.'; }
    }
    return card;
  }

  /* 판정: 학생이 찍은 자리·근거 → 점수. picks = [{slot, reason}] */
  function judge(card, picks) {
    var res = { hits: [], misses: [], missed: [], score: 0, perfect: false };
    var forged = card.forged.slice();
    for (var i = 0; i < picks.length; i++) {
      var p = picks[i], idx = forged.indexOf(p.slot);
      if (idx >= 0) {
        forged.splice(idx, 1);
        var pts = 10 + (REASONS[p.slot].id === p.reason ? 5 : 0);
        res.hits.push({ slot: p.slot, reasonOk: pts === 15, pts: pts }); res.score += pts;
      } else { res.misses.push(p.slot); res.score -= 5; }
    }
    res.missed = forged;
    res.score = Math.max(0, res.score);
    res.perfect = res.misses.length === 0 && res.missed.length === 0 && res.hits.every(function (h) { return h.reasonOk; });
    return res;
  }
  function streakBonus(streak) { return streak >= 2 ? Math.min(10, streak * 2) : 0; }

  /* 제작 턴: 학생이 조작한 기사 → AI 탐정의 눈. 뚜렷할수록 잡힌다.
     made = { title, titleFree(bool), photo:'obvious'|'subtle'|null, source:'obvious'|'subtle'|null, date:'obvious'|'subtle'|null, titleKind:'obvious'|'subtle'|null } */
  function titleObviousness(t, orig) {
    var s = 0;
    if (/!|！/.test(t)) s += 25;
    if (/충격|경악|대박|난리|열광|모두|전부|절대|100%/.test(t)) s += 25;
    if (t.length > orig.length + 8) s += 15;
    if (/\d/.test(t) && !/\d/.test(orig)) s += 15;
    if (t === orig) return -1; // 안 바꿈
    return Math.min(100, 20 + s);
  }
  function detect(made, art) {
    var checks = [], caught = 0, changed = 0;
    if (made.title !== undefined && made.title !== art.title) {
      changed++;
      var ob = made.titleKind === 'obvious' ? 85 : made.titleKind === 'subtle' ? 45 : titleObviousness(made.title, art.title);
      checks.push({ slot: 'title', risk: ob, note: ob >= 60 ? '제목이 본문보다 너무 세다 — 바로 눈에 띈다' : '제목이 살짝만 부풀어서 넘어갈 뻔했다' });
    }
    ['photo', 'source', 'date'].forEach(function (sl) {
      if (made[sl]) { changed++; var risk = made[sl] === 'obvious' ? 85 : 45; checks.push({ slot: sl, risk: risk, note: risk >= 60 ? REASONS[sl].hint + ' — 탐정이 첫눈에 잡았다' : REASONS[sl].hint + ' — 아슬아슬하게 지나갔다' }); }
    });
    // 조작이 많을수록 합산 위험 상승. 하나도 안 바꾸면 무효.
    if (!changed) return { valid: false, caught: false, score: 0, checks: [] };
    var maxRisk = 0; checks.forEach(function (c) { maxRisk = Math.max(maxRisk, c.risk); });
    var risk = Math.min(100, maxRisk + (changed - 1) * 15);
    var isCaught = risk >= 60;
    // 점수: 안 잡히면 (100-risk) 기반 + 조작 수 보정, 잡히면 소액 위로
    var score = isCaught ? 5 : Math.round((100 - risk) * 0.8) + changed * 5;
    return { valid: true, caught: isCaught, risk: risk, score: score, checks: checks, changed: changed };
  }

  return {
    CASES: CASES, RANKS: RANKS, rankOf: rankOf, nextRank: nextRank,
    loadRec: loadRec, saveRec: saveRec, commitRound: commitRound, unlockedLevel: unlockedLevel,
    SLOTS: SLOTS, REASONS: REASONS, TRUSTED: TRUSTED, FAKE_SRC: FAKE_SRC,
    levelRule: levelRule, perfectFind: perfectFind, rng: rng, forge: forge, judge: judge, streakBonus: streakBonus, detect: detect, titleObviousness: titleObviousness
  };
});

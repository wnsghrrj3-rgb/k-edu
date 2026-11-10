/* ============================================================
 * 영어 놀이터 — 무대 진행(PlayStage) : 무대 페이지가 공통으로 쓰는 하루 흐름 (게임설계 v1 §5)
 *   무대 페이지(zone/*.html)는 구역과 겉모습만 넘긴다 — PlayStage.start({ zone, sign, host, wear, open, endNote, where })
 *   오늘 무엇을 할지는 조립기(core/assemble.js)가 자료에서 정한다:
 *   (돌볼 씨앗이 있으면) 정원 → 오늘의 사건이 입힌 놀이 → 채널이 겹치지 않는 놀이들 → 특별 손님 → 무대에 장식 하나.
 *   주소에 ?set=a,b,c 가 있으면 그 놀이들만(점검·다시 하기), ?event=이름 이면 그 사건으로, ?mode=care 면 돌보기만.
 *   화면 뼈대: #actbar · #stage · #toast · #bag · #snd (무대 페이지가 둔다)
 *   문(결정 §0-2): 칸의 문이 아직 「구경」이면 무대 주인이 반기고 「내일 또 와」 — 놀이는 없다(?set= 점검은 그대로 들어간다).
 *   알파벳 칸(구역 bundles): 조립기가 정한 오늘의 묶음을 소리 도구에 알리고(PlayPhonics.setBundle), 가방·끝 카드는 묶음 차례로.
 * ============================================================ */
(function (g) {
  'use strict';
  function start(conf) {
    var Z = conf.zone, WORDS = Z.words, W = WORDS.map(function(w){return w.w;});
    var document = g.document, location = g.location;
    var $ = function(id){ return document.getElementById(id); }, stage = $('stage');
    var byW = {}; WORDS.forEach(function(w){ byW[w.w] = w; });
    var QS = location.search, mode = /mode=care/.test(QS) ? 'care' : 'play';
    var unlocked = PlaySeed.bossDone(Z.id), DKEY = Z.decorKey || Z.id, HOST = conf.host || 'sam';
    if (Z.palette) document.body.setAttribute('data-palette', Z.palette);     /* 무대색(ui/tokens.css) */
    if (conf.icon && $('title')) $('title').innerHTML = PlayIcon.html(conf.icon) + ' ' + $('title').textContent.trim();

    /* ── 공통 ── */
    function h(tag, cls, html){ var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
    function toast(s){ var t = $('toast'); t.textContent = s; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(function(){ t.classList.remove('show'); }, 1600); }
    function confetti(){ PlayFx.confetti(); }
    function bag(){
      if (Z.bundles) { var k = typeof BUNDLE === 'number' ? BUNDLE : 0; $('bag').innerHTML = PlayIcon.html('abc') + ' ' + (k + 1) + '/' + Z.bundles.length; return; }     /* 알파벳 칸 — 소리 묶음 차례 */
      var n = 0, s = PlaySeed.all(); W.forEach(function(w){ if (s[w]) n++; }); $('bag').innerHTML = PlayIcon.html('seed') + ' ' + n + '/' + W.length; }
    function decor(fresh){ var d = $('decor'); if (d) d.innerHTML = PlayAssemble.decor(DKEY, Z).map(function(x){ return '<span title="' + x.name + '"' + (fresh && fresh.id === x.id ? ' class="new"' : '') + '>' + PlayIcon.html(x.icon) + '</span>'; }).join(''); }
    function shop(ev){
      var box = h('div','shop');
      box.innerHTML = '<div class="sign fx-glow' + (unlocked ? ' on' : '') + '" id="sign"><span>' + (conf.sign || '') + '</span></div><div class="decor" id="decor"></div>' +
        '<div class="sam"><div class="f" id="samf"></div><div class="bub" id="bub"></div></div>' +
        '<div id="body"></div>';
      stage.innerHTML = ''; stage.appendChild(box);
      PlayNpc.render($('samf'), HOST, { face: 'idle', wear: conf.wear });   /* 무대 주인 — 대기=기본 · 성공=웃음+손 번쩍 · 실패=갸웃+손을 턱에 */
      PlayEvent.dress(box, ev || null);
      glow(); decor();
      return $('body');
    }
    function samFace(kind){ var e = $('samf'); if (e) PlayNpc.react(e, kind); }
    function sam(en, ko, speak){ var b = $('bub'); if (b) b.innerHTML = '<b>' + en + '</b>' + (ko ? '<small>' + ko + '</small>' : ''); if (speak !== false && en) return KTTS.sentence(en); return Promise.resolve(); }

    /* 평판 불빛 — 증거 한 건마다 간판이 조금씩 밝아진다. 특별 손님을 넘으면 완전히 켜진다 */
    var REP = PlayFx.meter(1);
    function glow(){ var s = $('sign'); if (s) PlayFx.glow(s, unlocked ? 1 : REP.value()); }

    /* 놀이 모듈에 넘기는 것 */
    var micOK = PlaySpeech.available(), primed = false;   /* 첫 듣기는 손가락(탭)에서 시작 — 크롬 마이크 허용 창이 확실히 뜨게 */
    var MIC = { ok: function(){ return micOK; }, off: function(){ if (micOK) toast(PlaySpeech.errorKo(PlaySpeech.lastError() || 'unavailable')); micOK = false; }, primed: function(){ return primed; }, prime: function(){ primed = true; } };
    var SV = { tts: KTTS, speech: PlaySpeech, cam: PlayCam, seed: PlaySeed, audio: PlayAudio, npc: PlayNpc, fx: PlayFx, scene: PlayScene, evidence: PlayEvidence, char: PlayChar,
      sam: { say: sam, react: samFace, el: function(){ return $('samf'); } } };

    /* ── 문 — 아직 구경만 되는 칸(앞 칸의 특별 손님만 넘음)·안개 칸이면 놀이 없이 반기기만 ── */
    var DOOR = /[?&]set=/.test(QS) || !g.PLAY_ZONES || !g.PLAY_ZONES.door ? 'open' : g.PLAY_ZONES.door(Z.id, PlaySeed);
    if (DOOR !== 'open') return visit(DOOR);
    function visit(door) {
      $('actbar').style.display = 'none'; if ($('snd')) $('snd').style.display = 'none'; bag();     /* 구경 — 놀이도 효과음 단추도 없다 */
      var body = shop();
      samFace('ok');
      sam('Hi!', door === 'peek' ? '어서 와! 오늘은 구경만 — 앞 칸의 씨앗이 꽃이 되면 같이 놀자. 내일 또 와!' : '아직 안개가 끼어 있어 — 앞 칸을 마치면 열려요.');
      var hb = h('div', 'homebtn', '<button class="btn" id="home">놀이터로</button>'); body.appendChild(hb);
      $('home').onclick = function(){ location.href = conf.home || '../index.html'; };
      return { plan: null, zone: Z, door: door };
    }

    /* ── 오늘의 세트 — 조립기가 정한다 ── */
    function unplanted(){ var s = PlaySeed.all(); return W.filter(function(w){ return !s[w]; }); }
    function review(){ var sm = PlayEvidence.summary(Z.id, W); return W.filter(function(w){ var k = sm[w].skills; return Object.keys(k).some(function(x){ return k[x] !== 'independent'; }); }); }
    function makePlan(){
      var m = /[?&]set=([^&]+)/.exec(QS), e = /[?&]event=([\w-]+)/.exec(QS);
      if (m) return { manual: true, event: null, set: decodeURIComponent(m[1]).split(',').filter(function(id){ return !!PlayGame.get(id); }) };
      if (mode === 'care') return { manual: true, event: null, set: ['garden'] };
      return PlayAssemble.plan({ zone: Z, cell: Z.id, cam: PlayCam.available(), unplanted: unplanted().length, due: PlaySeed.due(Z.id).length, event: e ? e[1] : null });
    }
    var PLAN = makePlan(), SET = PLAN.set, INFO = { unplanted: unplanted(), review: review() };
    var BUNDLE = Z.bundles ? (PLAN.bundle != null ? PLAN.bundle : Math.min(PlayAssemble.history(Z.id).days.filter(function(d){ return d.day < PlayAssemble.today(); }).length, Z.bundles.length - 1)) : null;
    if (BUNDLE != null && g.PlayPhonics) g.PlayPhonics.setBundle(Z.id, BUNDLE);      /* 오늘 연습할 소리 = 이 묶음 */
    var EV = PLAN.event ? ((g.PLAY_EVENTS || {})[Z.stage] || []).filter(function(x){ return x.id === PLAN.event; })[0] : null;
    var TARGETS = SET.map(function(id){
      if (id === 'garden') return PlaySeed.due(Z.id).filter(function(w){ return byW[w]; }).map(function(w){ return byW[w]; });
      return PlayAssemble.targets(id, Z, INFO);
    });
    function optFor(i){ var o = { last: i === SET.length - 1 }, x = EV && SET[i] === PLAN.eventGame ? EV.opt : null; if (x) Object.keys(x).forEach(function(k){ o[k] = x[k]; }); return o; }
    function ctxFor(i, body, intro){
      return { host: body, zone: Z, cell: Z.id, targets: TARGETS[i], pool: WORDS, learner: { mic: MIC }, services: SV, intro: intro, opt: optFor(i), onEvidence: onEvidence };
    }
    REP = PlayFx.meter(SET.reduce(function(n, id, i){ return n + PlayGame.count(id, { zone: Z, cell: Z.id, targets: TARGETS[i], learner: { mic: MIC }, opt: optFor(i) }); }, 0) || 1);

    function actbar(i){ var b = $('actbar'); b.innerHTML = ''; if (SET.length < 2){ b.style.display = 'none'; return; } SET.forEach(function(id, k){ var d = PlayGame.get(id), s = h('span', k < i ? 'ok' : k === i ? 'on' : '', PlayIcon.html(d.icon)); s.title = d.name; b.appendChild(s); }); }

    /* 증거 한 건 — 씨앗 가방·도감·평판·첫 열매 파츠 */
    function onEvidence(v){
      if (byW[v.targetId]) KCollection.add([v.targetId]); bag(); REP.add(); glow();
      if (v.seed && v.seed.stage === 3 && Z.part && Z.part.when === 'firstFruit' && PlaySeed.givePart(Z.part.id)) { confetti(); toast(Z.part.name + '을 얻었어요!'); }
    }

    function run(i){
      if (i >= SET.length) return endCard();
      actbar(i);
      var id = SET[i], def = PlayGame.get(id), dressed = !!EV && id === PLAN.eventGame, body = shop(dressed ? EV : null), p;
      if (dressed) {       /* 오늘의 사건 — 등장·한마디 → 그 사건이 입힌 놀이 → 사건 끝 한마디 */
        p = PlayEvent.play(EV, { shop: body.parentNode, host: body, services: SV })
          .then(function(){ return PlayGame.run(id, ctxFor(i, body, Promise.resolve())); })
          .then(function(res){ return PlayEvent.end(EV, { shop: body.parentNode, services: SV }).then(function(){ return res; }); });
      } else { var it = Z.world === 'lv1' && def.intro1 ? def.intro1 : def.intro;     /* Lv1 무대 = 그때까지 배운 낱말·감탄만 */
        p = PlayGame.run(id, ctxFor(i, body, it ? sam(it.en, it.ko) : Promise.resolve())); }
      p.then(function(res){
        if (id === 'special-guest' && res.passed) return openShop(res.by);
        setTimeout(function(){ run(i + 1); }, 600);
      });
    }

    /* 특별 손님을 넘었다 — 무대가 열리고(사다리 칸 점등), 다음 자리의 안개가 걷힌다(결정 §0-2: 구경은 바로, 놀이 입장은 꽃 ¾ 뒤) */
    function openShop(by){
      PlaySeed.bossPassed(Z.id, by);
      KProgress.light(Z.id);   /* 사다리와 동기 — 그 칸 점등 */
      unlocked = true; $('sign').classList.add('on'); glow(); PlayAudio.play('done'); confetti();
      var o = conf.open || { en: 'Good!', ko: '해냈어!' };
      sam(o.en, o.ko).then(function(){ endCard(); });
    }

    /* ── 끝 카드 : 심은 씨앗 → 내일 돌보기 · 오늘 무대에 생긴 것 ── */
    function endCard(){
      var body = $('body') || shop();
      if (mode === 'care' || (SET.length === 1 && SET[0] === 'garden')) {
        var hb = h('div', 'homebtn', '<button class="btn" id="home">놀이터로</button>'); body.appendChild(hb);
        $('home').onclick = function(){ location.href = conf.home || '../index.html'; };
        return;
      }
      var deco = PLAN.manual ? null : PlayAssemble.finish(DKEY, Z);      /* 마무리 — 무대의 작은 변화 하나 */
      decor(deco);
      body.innerHTML = '';
      var s = PlaySeed.all(), card = h('div', 'endcard');
      var nSeed = W.filter(function(w){ return s[w]; }).length;
      if (Z.bundles) {       /* 알파벳 칸 — 오늘 익힌 소리 묶음 · 내일은 다음 묶음(마지막 묶음 날 특별 손님을 넘으면 칸 점등) */
        var last = BUNDLE >= Z.bundles.length - 1;
        card.innerHTML = '<div class="big">' + PlayIcon.html('abc') + '</div><h2>' + (unlocked ? (conf.opened || '해냈어요!') : '오늘의 소리 ' + (BUNDLE + 1) + '/' + Z.bundles.length) + '</h2>' +
          '<div class="seedrow" id="bundles">' + Z.bundles.map(function(b, k){ return '<span class="bd' + (k < BUNDLE ? ' done' : k === BUNDLE ? ' cur' : '') + '">' + (k <= BUNDLE ? b.join(' ') : PlayIcon.html('cloud')) + '</span>'; }).join('') + '</div>' +
          '<div class="note">' + (last ? (unlocked ? '알파벳 소리를 한 바퀴 다 만났어요.' : '내일 다시 와서 소리를 찾아 주면 나무에 불이 켜져요.') : '내일은 새 소리 묶음이 와요 — 소리 먼저, 글자 이름은 나중에.') + '</div>' +
          (deco ? '<div class="note" id="newdeco" style="margin-top:8px">' + PlayIcon.html(deco.icon) + ' ' + (conf.where || '무대') + '에 ' + deco.name + '이(가) 생겼어요</div>' : '') +
          (unlocked && conf.nextNote ? '<div class="note" style="margin-top:8px">' + conf.nextNote + '</div>' : '') +
          '<div class="homebtn"><button class="btn" id="home">놀이터로</button></div>';
        body.appendChild(card); $('home').onclick = function(){ location.href = conf.home || '../index.html'; };
        return;
      }
      card.innerHTML = '<div class="big">' + PlayIcon.html('seed') + '</div><h2>' + (nSeed ? '씨앗 ' + nSeed + '개를 심었어요' : unlocked ? (conf.opened || '해냈어요!') : '오늘 놀이 끝!') + '</h2>' +
        '<div class="seedrow">' + W.map(function(w){ var st = s[w] ? s[w].stage : -1; return '<span class="seed s' + st + '" title="' + w + '">' + (byW[w].pic || '<i class="seedw">' + w + '</i>') + '</span>'; }).join('') + '</div>' +
        (nSeed ? '' : '<div class="note" style="margin-bottom:6px">' + (conf.seedHint || '말로 하면 씨앗이 심겨요.') + '</div>') +
        '<div class="note">' + (conf.endNote || '내일 다시 와서 말해 주면 새싹이 돼요.') + '</div>' +
        (deco ? '<div class="note" id="newdeco" style="margin-top:8px">' + PlayIcon.html(deco.icon) + ' ' + (conf.where || '무대') + '에 ' + deco.name + '이(가) 생겼어요 — 내일은 또 무엇이 생길까요?</div>' : '') +
        (unlocked && conf.nextNote ? '<div class="note" style="margin-top:8px">' + conf.nextNote + '</div>' : '') +
        '<div class="homebtn"><button class="btn" id="home">놀이터로</button></div>';
      body.appendChild(card); $('home').onclick = function(){ location.href = conf.home || '../index.html'; };
    }

    /* ── 시작 — 설명 화면 0, 첫 터치에서 소리 잠금 해제 후 바로 ── */
    document.body.addEventListener('pointerdown', function once(){ KTTS.unlock(); PlayAudio.unlock(); document.body.removeEventListener('pointerdown', once); }, { once: true });
    /* 효과음 끄기 — 화면 설정이라 기기에 남는다(kedu-en-play-pref) */
    function sndBtn(){ var b = $('snd'), on = PlayAudio.enabled(); b.innerHTML = PlayIcon.html(on ? 'bell' : 'bell-off'); b.classList.toggle('off', !on); b.title = on ? '효과음 켜짐' : '효과음 꺼짐'; }
    $('snd').onclick = function(){ PlayAudio.setEnabled(!PlayAudio.enabled()); sndBtn(); PlayAudio.play('ok'); };
    sndBtn();
    bag();
    run(0);
    return { plan: PLAN, zone: Z, door: 'open', bundle: BUNDLE };
  }
  /* 그 무대에서 열 칸 — 주소 ?cell= 이 열린 칸이면 그 칸, 아니면 지금 열린 마지막 칸 */
  function pick(stage) {
    var Z = g.PLAY_ZONES, zs = Z.cells(stage), open = Z.openIndex(stage, g.PlaySeed);
    var m = /[?&]cell=([\w-]+)/.exec(g.location.search), want = m ? zs.filter(function (z) { return z.id === m[1]; })[0] : null;
    return want && zs.indexOf(want) <= open ? want : zs[open];
  }
  /* 칸 띠 — 한 무대의 칸들. 열린 칸은 누르면 옮겨 가고, 앞 칸의 특별 손님만 넘은 다음 칸은 「구경」(내일 또 와), 그 뒤는 안개(결정 §0-2) */
  function cellbar(el, stage, curId) {
    if (!el) return;
    var Z = g.PLAY_ZONES, S = g.PlaySeed, zs = Z.cells(stage), open = Z.openIndex(stage, S);
    el.innerHTML = ''; if (zs.length < 2) { el.style.display = 'none'; return; }
    zs.forEach(function (z, i) {
      var peek = i === open + 1 && S.bossDone(zs[i - 1].id), lock = i > open && !peek;
      var b = g.document.createElement('button'); b.type = 'button';
      b.className = 'cb' + (z.id === curId ? ' cur' : '') + (peek ? ' peek' : '') + (lock ? ' lock' : '') + (S.bossDone(z.id) ? ' on' : '');
      b.setAttribute('data-cell', z.id);
      b.innerHTML = lock ? g.PlayIcon.html('cloud') : ((g.PlayArt && g.PlayArt.html(z.cellIcon)) || g.PlayIcon.html(z.icon)) + (z.cellName || z.name || '');
      b.onclick = function () {
        if (lock || peek) { var t = g.document.getElementById('toast'); if (t) { t.textContent = peek ? '오늘은 구경만 — 씨앗이 꽃이 되면 들어올 수 있어. 내일 또 와!' : '앞 칸을 마치면 안개가 걷혀요'; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 2000); } return; }
        if (z.id !== curId) g.location.href = '?cell=' + z.id;
      };
      el.appendChild(b);
    });
  }
  g.PlayStage = { start: start, pick: pick, cellbar: cellbar };
})(window);

/* src/g1m_u5_ten_basket.js — 10 바구니 (1학년 수학 5단원 · 10 모으기와 가르기)
 * 장르: catch_fall — 무대형(자체 루프). 떨어지는 과일 수 세 개를 골라 바구니 10칸을 꽉 채운다.
 * 교육 목적: 10을 「세 수 모으기」로 만나기. 고를 때마다 바구니 10칸이 색깔별로 차서
 *   암산이 아니라 「몇 칸 남았나」를 눈으로 본다(10칸 틀). 식 □ + □ + □ = 10 이 같이 채워진다.
 *
 * 모드
 *   class — 두 팀이 화면 왼쪽·오른쪽 나무를 하나씩 맡아 동시에(멀티터치) 겨룬다.
 *           목표 개수(goal)를 먼저 채우면 승리, 시간이 다 되면 더 많이 채운 팀 승리.
 *   solo  — 제한 시간(time) 동안 채운 바구니 수. 최고 기록은 core가 남긴다.
 *
 * 판정(한 바구니 = 한 판정, §6-8 judged)
 *   세 개 합 10         → make10 ✔ (득점)
 *   합이 10을 넘음      → over10  ✘ (합이 넘는 수를 고름)
 *   세 개 합이 10 미만  → under10 ✘
 *   두 개로 이미 10     → pair10  ✘ (세 수 조건을 놓침 — 두 수 10 단짝은 아는 아이)
 * 떨어뜨리기는 생성기 drop() — 섞어 내되 화면 위쪽에 답이 늘 하나는 있다. 놓친 과일은 벌점 없음.
 */
(function () {
  'use strict';

  var SPEEDS = {                                   // fall = 화면 위→아래 초, gap = 과일 사이 평균 초
    1: { name: '🐌 달팽이', fall: 16, gap: 2.3 },
    2: { name: '🐢 거북이', fall: 12, gap: 1.8 },
    3: { name: '🐰 토끼', fall: 9, gap: 1.4 },
    4: { name: '🦌 사슴', fall: 6.5, gap: 1.07 },
    5: { name: '🐆 치타', fall: 4.8, gap: 0.83 }
  };
  var FRUIT = ['#FF7A45', '#E94F6B', '#43A85B', '#E0A800', '#3C8DDB', '#B45FC9'];
  var PICK = ['#E8453C', '#F2A516', '#7A4FD0'];      // 첫째·둘째·셋째로 고른 수의 칸 색
  var MAX_ON = 12;

  var app = ACore.create({
    activityId: 'g1m_u5_ten_basket',
    title: '🧺 10 바구니',
    subtitle: '떨어지는 과일 세 개로 바구니 10칸을 꽉 채워요',
    defaults: { speed: 2, time: 60, goal: 5 },
    settings: [
      { key: 'speed', label: '속도', options: [1, 2, 3, 4, 5].map(function (v) { return { v: v, label: SPEEDS[v].name }; }) },
      { key: 'time', label: '시간', options: [{ v: 60, label: '60초' }, { v: 90, label: '90초' }] }
    ],
    stageHtml: '<div id="tb-arena"></div>',
    onStart: function (app) {
      var sp = SPEEDS[app.settings.speed] || SPEEDS[2];
      var timeTotal = app.settings.time || 60;
      var goal = app.settings.goal || 5;
      var cls = app.mode === 'class';
      var arena = app.el('#tb-arena');
      var tLeft = timeTotal, last = 0, running = true;
      var P = [];

      app.el('#skip-btn').style.display = 'none';          // 넘길 문항이 없다 — 시간이 흐르는 판
      app.hideAnswers();
      arena.className = cls ? 'duo' : 'solo';
      arena.innerHTML = '';

      function side(i) {
        var root = document.createElement('section');
        root.className = 'tb-side t' + i;
        root.innerHTML =
          (cls ? '<div class="tb-head"><span class="tb-name">' + app.teams[i].name + '</span>' +
                 '<span class="tb-sc"><b class="num">0</b> / ' + goal + '</span></div>' : '') +
          '<div class="tb-field"></div>' +
          '<div class="tb-tray">' +
            '<div class="tb-eq"></div>' +
            '<div class="tb-row"><div class="tb-basket"></div><button class="tb-clear">비우기</button></div>' +
            '<div class="tb-msg"></div>' +
          '</div>';
        arena.appendChild(root);
        var p = { i: i, root: root, field: root.querySelector('.tb-field'), basketEl: root.querySelector('.tb-basket'),
          eqEl: root.querySelector('.tb-eq'), msgEl: root.querySelector('.tb-msg'), scEl: root.querySelector('.tb-sc b'),
          gen: GENS['ten_triple'].create({}, app.rng), fruits: [], basket: [], score: 0, locked: false,
          nextDrop: 0, W: 0, H: 0, size: 70, lanes: 5, laneW: 100 };
        root.querySelector('.tb-clear').addEventListener('click', function () {
          if (p.locked || !p.basket.length) return;
          p.basket = []; renderBasket(p); say(p, '과일 세 개를 골라요', '');
        });
        renderBasket(p); say(p, '과일 세 개를 골라요', '');
        return p;
      }
      for (var k = 0; k < (cls ? 2 : 1); k++) P.push(side(k));

      function measure(p) {
        var r = p.field.getBoundingClientRect();
        p.W = r.width; p.H = r.height;
        p.size = Math.max(50, Math.min(96, Math.min(p.W * 0.16, p.H * 0.13)));
        p.lanes = Math.max(3, Math.min(8, Math.floor(p.W / (p.size * 1.25))));
        p.laneW = p.W / p.lanes;
        p.field.style.setProperty('--size', p.size + 'px');
        p.fruits.forEach(function (f) { f.x = f.lane * p.laneW + (p.laneW - p.size) / 2; place(f); });
      }
      P.forEach(measure);
      window.addEventListener('resize', function () { P.forEach(measure); });

      function place(f) { f.el.style.transform = 'translate(' + f.x + 'px,' + f.y + 'px)'; }

      function spawn(p) {
        var free = [];
        for (var l = 0; l < p.lanes; l++) {
          if (!p.fruits.some(function (f) { return f.lane === l && f.y < p.size * 1.3; })) free.push(l);
        }
        if (!free.length) return false;
        var live = p.fruits.filter(function (f) { return f.y < p.H * 0.55; }).map(function (f) { return f.n; });
        var n = p.gen.drop(live);
        var lane = free[Math.floor(app.rng() * free.length)];
        var el = document.createElement('button');
        el.className = 'tb-fruit';
        el.textContent = n;
        el.setAttribute('aria-label', '과일 ' + n);
        el.style.setProperty('--fc', FRUIT[Math.floor(app.rng() * FRUIT.length)]);
        var f = { el: el, n: n, lane: lane, x: lane * p.laneW + (p.laneW - p.size) / 2, y: -p.size, picked: false };
        var go = function (e) { if (e && e.preventDefault) e.preventDefault(); pick(p, f); };
        el.addEventListener('pointerdown', go);
        el.addEventListener('click', go);
        p.field.appendChild(el); p.fruits.push(f); place(f);
        return true;
      }

      function hud() {
        app.el('#prog').textContent = '⏱ ' + Math.max(0, Math.ceil(tLeft)) + '초' + (cls ? ' · 먼저 ' + goal + '개' : '');
      }
      hud();

      function loop(now) {
        if (!running) return;
        if (app.over) { stop(); return; }
        var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        tLeft -= dt; hud();
        if (tLeft <= 0) return end();
        P.forEach(function (p) {
          p.nextDrop -= dt;
          if (p.nextDrop <= 0) {
            if (p.fruits.length < MAX_ON && spawn(p)) p.nextDrop = sp.gap * (0.7 + app.rng() * 0.6);
            else p.nextDrop = 0.25;
          }
          var v = (p.H + p.size) / sp.fall;
          for (var j = p.fruits.length - 1; j >= 0; j--) {
            var f = p.fruits[j];
            f.y += v * dt;
            if (f.y > p.H) { f.el.remove(); p.fruits.splice(j, 1); } else place(f);
          }
        });
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);

      function sum(p) { return p.basket.reduce(function (a, b) { return a + b; }, 0); }

      function pick(p, f) {
        if (!running || app.over || p.locked || f.picked || p.basket.length >= 3) return;
        f.picked = true; f.el.remove();
        p.fruits = p.fruits.filter(function (x) { return x !== f; });
        p.basket.push(f.n);
        app.sfx.tick();
        renderBasket(p);
        var s = sum(p), c = p.basket.length;
        if (s === 10 && c === 3) return win(p);
        // 키는 문자 그대로 적는다 — smoke_types 가 무대 태깅을 정적으로 모은다
        if (s > 10) { app.tally('over10', false); return miss(p, '10을 넘었어요. ' + p.basket.join(' + ') + ' = ' + s); }
        if (s === 10) { app.tally('pair10', false); return miss(p, p.basket.join(' + ') + ' = 10 — 과일 세 개로 만들어요'); }
        if (c === 3) { app.tally('under10', false); return miss(p, p.basket.join(' + ') + ' = ' + s + ' — 10까지 ' + (10 - s) + '칸 모자라요'); }
        say(p, '10까지 ' + (10 - s) + '칸 남았어요', '');
      }

      function win(p) {
        p.locked = true; p.score++;
        app.markJudged(); app.tally('make10', true);
        if (cls) { app.teamScore(p.i, 1); p.scEl.textContent = p.score; } else app.addScore(1);
        say(p, p.basket.join(' + ') + ' = 10  꽉 찼어요!', 'good');
        bump(p.basketEl, 'win');
        app.sfx.good();
        if (cls && p.score >= goal) { setTimeout(end, 500); return; }
        setTimeout(function () { reset(p); }, 900);
      }
      function miss(p, text) {
        p.locked = true;
        app.markJudged();
        say(p, text, 'bad');
        bump(p.basketEl, 'shake');
        app.sfx.bad();
        setTimeout(function () { reset(p); }, 1300);
      }
      function reset(p) {
        if (app.over) return;
        p.basket = []; p.locked = false; renderBasket(p); say(p, '과일 세 개를 골라요', '');
      }
      function bump(el, c) { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); }
      function say(p, t, c) { p.msgEl.textContent = t; p.msgEl.className = 'tb-msg ' + (c || ''); }

      function renderBasket(p) {
        var cells = [];
        p.basket.forEach(function (n, i) { for (var q = 0; q < n; q++) cells.push(PICK[i]); });
        var h = '';
        for (var c = 0; c < 10; c++) h += '<div class="tb-cell"' + (cells[c] ? ' style="background:' + cells[c] + '"' : '') + '></div>';
        p.basketEl.innerHTML = h;
        var e = '';
        for (var i = 0; i < 3; i++) {
          if (i) e += '<span>+</span>';
          e += p.basket[i] != null ? '<span class="n num" style="color:' + PICK[i] + '">' + p.basket[i] + '</span>' : '<span class="n blank">□</span>';
        }
        p.eqEl.innerHTML = e + '<span>=</span><span class="n num">10</span>';
      }

      function stop() {
        running = false;
        P.forEach(function (p) { p.fruits.forEach(function (f) { f.el.remove(); }); p.fruits = []; });
      }
      function end() {
        if (!running) return;
        stop();
        if (cls) app.finish({});
        else app.finish({ score: app.score, total: app.judged });
      }

      try { window.__TEN_BASKET__ = { players: P, end: end, get tLeft() { return tLeft; } }; } catch (e) {}   // 게이트 전용 읽기 참조(D21)
    }
  });
})();

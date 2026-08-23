/* src/g3m_u2_shape_sort.js — 도형 나누기 마당 (3학년 수학 2단원 평면도형)
 * 장르: sort(무대형) · 생성기: plane_shape
 * 원형: 기준을 정해 분류하기(g2m_u5_classify). 엔진 구조를 그대로 물려받고
 *       물건 그리기(svgOf)와 근거 문장만 이 단원 것으로 갈아낀다. sort 4회차.
 *
 * 도형은 **생성기가 내보낸 수(각·변 비율·회전각)에서 좌표를 계산해** 그린다.
 * 그림 에셋을 쓰지 않는 이유가 취향이 아니다 — tricky_rotate가 요구하는 것이
 * "돌아가 있어도 같은 도형"인데, 회전이 데이터가 아니면 채점 기준과 아이가 보는
 * 그림이 갈라진다. 회전은 장식이 아니라 이 단원의 학습 내용이다.
 *
 * §6-3(판독 우선)을 도형에 적용한 것 두 가지:
 *  ① 직각 표시(□)를 그리지 않는다. 그리면 아이가 각을 판단하지 않고 표시를 찾는다.
 *  ② 선분·반직선·직선은 **끝점의 생김새**로만 구별된다(● 막힘 / 화살표 뻗음).
 *     그래서 끝 표시를 선보다 굵게 그린다 — 거기가 판독 지점이다.
 */
(function () {
  'use strict';

  var INK = '#2f2a3f', ACC = '#7c5cc4';

  function svgLine(it) {
    var x1 = 10, x2 = 86, y = 48, t = it.tilt || 0;
    var body = '', head = '';
    // 뻗는 쪽은 화살표, 막힌 쪽은 점. 선분=양쪽 점, 반직선=한쪽 점 한쪽 화살표, 직선=양쪽 화살표
    var openL = (it.k === 'straight') || (it.k === 'ray' && it.from === 'b');
    var openR = (it.k === 'straight') || (it.k === 'ray' && it.from !== 'b');
    if (it.kind === 'ray') { openL = (it.from === 'b'); openR = (it.from === 'a'); }
    body = '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y +
           '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';
    function cap(x, open, dir) {
      if (open) {
        return '<path d="M' + (x + dir * 2) + ' ' + (y - 7) + ' L' + (x + dir * 12) + ' ' + y +
               ' L' + (x + dir * 2) + ' ' + (y + 7) + '" fill="none" stroke="' + ACC +
               '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
      }
      return '<circle cx="' + x + '" cy="' + y + '" r="6" fill="' + ACC + '"/>';
    }
    head = cap(x1, openL, -1) + cap(x2, openR, 1);
    var la = it.a || 'ㄱ', lb = it.b || 'ㄴ';
    var lab = '<text x="' + x1 + '" y="' + (y - 13) + '" font-size="15" text-anchor="middle" fill="' + INK + '">' + la + '</text>' +
              '<text x="' + x2 + '" y="' + (y - 13) + '" font-size="15" text-anchor="middle" fill="' + INK + '">' + lb + '</text>';
    return '<g transform="rotate(' + t + ' 48 48)">' + body + head + lab + '</g>';
  }

  function svgAngle(it) {
    var cx = 30, cy = 66, L = 46;
    var r0 = -it.rot * Math.PI / 180;
    var r1 = r0 - it.deg * Math.PI / 180;
    function pt(r) { return [cx + L * Math.cos(r), cy + L * Math.sin(r)]; }
    var p0 = pt(r0), p1 = pt(r1);
    var arcR = 15;
    var a0 = pt(r0), a1 = pt(r1);
    var q0 = [cx + arcR * Math.cos(r0), cy + arcR * Math.sin(r0)];
    var q1 = [cx + arcR * Math.cos(r1), cy + arcR * Math.sin(r1)];
    return '<g transform="translate(14 -8)">' +
      '<path d="M' + q0[0].toFixed(1) + ' ' + q0[1].toFixed(1) + ' A' + arcR + ' ' + arcR +
        ' 0 0 0 ' + q1[0].toFixed(1) + ' ' + q1[1].toFixed(1) + '" fill="none" stroke="' + ACC +
        '" stroke-width="3" opacity=".8"/>' +
      '<polyline points="' + p0[0].toFixed(1) + ',' + p0[1].toFixed(1) + ' ' + cx + ',' + cy +
        ' ' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1) + '" fill="none" stroke="' + INK +
        '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="4.5" fill="' + INK + '"/></g>';
  }

  function svgTri(it) {
    // 두 각 a·b로 세 꼭짓점을 계산한다 — 직각 여부가 그림에서 그대로 성립한다
    var A = it.a * Math.PI / 180, B = it.b * Math.PI / 180;
    var c = 1;                                  // 변 AB = 1 (사인법칙으로 나머지)
    var C = Math.PI - A - B;
    var b = Math.sin(B) / Math.sin(C) * c;      // 변 CA
    var P = [[0, 0], [c, 0], [b * Math.cos(A), b * Math.sin(A)]];
    // 정규화 → 88×88 안에 채운다
    var xs = P.map(p => p[0]), ys = P.map(p => p[1]);
    var mnx = Math.min.apply(null, xs), mxx = Math.max.apply(null, xs);
    var mny = Math.min.apply(null, ys), mxy = Math.max.apply(null, ys);
    var s = 62 / Math.max(mxx - mnx, mxy - mny);
    var pts = P.map(function (p) {
      return [(48 + (p[0] - (mnx + mxx) / 2) * s).toFixed(1),
              (48 - (p[1] - (mny + mxy) / 2) * s).toFixed(1)].join(',');
    }).join(' ');
    return '<g transform="rotate(' + it.rot + ' 48 48)"><polygon points="' + pts +
           '" fill="#efe9ff" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/></g>';
  }

  function svgQuad(it) {
    var w = 62, h = 62 * it.h, sk = (it.skew || 0) / 100 * w;
    if (h > 62) { w = 62 * 62 / h; h = 62; }
    var x = 48 - w / 2, y = 48 - h / 2;
    var pts = [[x + Math.max(0, sk), y], [x + w + Math.max(0, sk), y],
               [x + w - Math.max(0, -sk) + Math.min(0, sk) * -1 * 0, y + h], [x, y + h]];
    if (sk) pts = [[x + sk, y], [x + w + sk, y], [x + w, y + h], [x, y + h]];
    else pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    var d = pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    return '<g transform="rotate(' + it.rot + ' 48 48)"><polygon points="' + d +
           '" fill="#efe9ff" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/></g>';
  }

  function svgOf(it) {
    var inner;
    if (it.kind === 'name') {
      return '<span class="nm">' + it.text + '</span>';       // 각 이름은 글자가 물건이다
    }
    if (it.kind === 'line' || it.kind === 'ray') inner = svgLine(it);
    else if (it.kind === 'angle') inner = svgAngle(it);
    else if (it.kind === 'tri') inner = svgTri(it);
    else inner = svgQuad(it);
    return '<svg viewBox="0 0 96 96" width="72" height="72" font-family="Jua, sans-serif">' +
           inner + '</svg>';
  }

  ACore.create({
    activityId: 'g3m_u2_shape_sort',
    title: '📐 도형 나누기 마당',
    subtitle: '돌아가 있어도 이름은 그대로! 정의로 나눠요',
    defaults: { by: 'mix', per: 6, n: 3 },
    settings: [
      { key: 'by', label: '무엇으로', options: [
        { v: 'line_kind', label: '선의 종류' }, { v: 'ray_dir', label: '반직선 방향' },
        { v: 'angle_read', label: '각 읽기' }, { v: 'right_angle', label: '직각' },
        { v: 'rt_triangle', label: '직각삼각형' }, { v: 'rect_square', label: '직사각형·정사각형' },
        { v: 'tricky_rotate', label: '돌아간 도형' }, { v: 'mix', label: '판마다 다르게' }] },
      { key: 'per', label: '한 판 도형 수', options: [
        { v: 4, label: '4개' }, { v: 6, label: '6개' }, { v: 9, label: '9개' }] },
      { key: 'n', label: '판 수', options: [{ v: 2, label: '2' }, { v: 3, label: '3' }, { v: 5, label: '5' }] }
    ],
    stageHtml:
      '<div id="cy">' +
        '<div id="rule"></div>' +
        '<div id="hint"></div>' +
        '<div id="pool"></div>' +
        '<div id="baskets"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['plane_shape'].create({ by: app.settings.by, per: app.settings.per }, app.rng);
      var N = app.settings.n, i = 0, S = null;

      function render() {
        app.el('#rule').textContent = '📐 ' + S.round.prompt;
        app.el('#hint').innerHTML = (S.round.hint || '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        app.el('#pool').innerHTML = S.round.items.map(function (it, k) {
          return '<button class="item" data-k="' + k + '">' + svgOf(it) + '</button>';
        }).join('');
        // 바구니는 가로 일렬 (§6-2). 이름이 길어도 줄바꿈으로 버틴다 — 세로로 세우지 않는다.
        app.el('#baskets').innerHTML = S.round.bins.map(function (b) {
          return '<button class="basket" data-b="' + b.k + '">' +
                 '<div class="bn">' + b.ko + '</div><div class="cnt num">0</div></button>';
        }).join('');
        app.els('#pool .item').forEach(function (b) {
          b.addEventListener('click', function () {
            if (S.done) return;
            app.els('#pool .item').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
            S.sel = +b.dataset.k;
            app.sfx.tick();
          });
        });
        app.els('#baskets .basket').forEach(function (bk) {
          bk.addEventListener('click', function () { drop(bk); });
        });
      }

      function drop(bk) {
        if (!S || S.done) return;
        if (S.sel == null) { app.explain('먼저 담을 도형을 골라요!', false); return; }
        var it = S.round.items[S.sel];
        var want = gen.binOf(it, S.round.by);
        var el = app.el('#pool .item[data-k="' + S.sel + '"]');
        if (bk.dataset.b === want) {
          if (S.firstTry[S.sel] !== false) app.tally(S.round.type, true);
          app.sfx.good();
          el.classList.add('gone');
          bk.querySelector('.cnt').textContent = (+bk.querySelector('.cnt').textContent + 1);
          S.left--; S.sel = null;
          app.clearExplain();
          if (S.left === 0) endRound();
        } else {
          S.firstTry[S.sel] = false;
          S.miss++;
          app.tally(S.round.type, false);
          app.sfx.bad();
          app.shake(bk);
          var wantKo = S.round.bins.filter(function (b) { return b.k === want; })[0].ko;
          // 오분류는 버그가 아니라 수업이다 — 어느 정의에서 갈렸는지를 말해준다
          app.explain(gen.reasonOf(it, S.round.by, wantKo).replace(/\*\*/g, ''), false);
          if (app.mode === 'class' && S.miss % 2 === 0) {
            S.turn = 1 - S.turn;
            app.explain(app.teams[S.turn].name + ' 차례로 넘어갑니다!', false);
          }
        }
      }

      function endRound() {
        S.done = true;
        app.markJudged();
        var clean = S.firstTry.every(function (v) { return v !== false; });
        if (clean && app.mode !== 'class') app.addScore(1);
        if (app.mode === 'class') app.teamScore(S.turn, 1);
        app.sfx.win();
        app.explain('다 나눴어요! ' + (clean ? '한 번에 성공! 🎉' : '잘했어요 👏'), true);
        setTimeout(next, app.mode === 'class' ? 2000 : 1500);
      }

      function next() {
        if (i >= N) return app.finish({});
        var round = gen.deal();
        S = { round: round, left: round.items.length, sel: null, done: false,
              firstTry: round.items.map(function () { return true; }), miss: 0, turn: (i % 2) };
        i++;
        app.setProg(i, N);
        app.clearExplain();
        app.hideAnswers();
        render();
        if (app.mode === 'class') app.explain(app.teams[S.turn].name + ' 차례예요!', true);
      }

      app.onSkip(function () { if (S && !S.done) next(); });
      next();
    }
  });
})();

/* ============================================================
 * 영어 놀이터 — 움직이는 무대 부품(PlayScene) (게임설계 v1 §7)
 *   긴장은 숫자 시계가 아니라 흐름으로 — 놓쳐도 돌아오는 네 가지 부품을 놀이들이 같이 쓴다.
 *     queue  손님 줄   (앞 손님 + 뒤에서 기다리는 손님 + 말풍선 + 쟁반)
 *     holes  구멍      (톡톡 올라오는 자리)
 *     lanes  레인      (위에서 떨어지는 것 + 아래 쟁반)
 *     belt   벨트      (주문표가 옆으로 흘러가고, 지나가면 다시 돌아온다)
 *   여기는 화면 조각과 움직임만 — 무엇이 맞는지·몇 번째인지는 놀이 모듈이 정한다.
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 ── */
  var CONF = {
    frontX: 148,          /* 앞 손님 가운데의 가로 자리(px) — 쟁반이 날아가는 곳 */
    catchAt: 0.68,        /* 레인: 떨어지는 시간의 이 지점에서 쟁반 높이를 지난다 */
    ticketGap: 110,       /* 벨트: 주문표 사이 간격(px) */
    ticketW: 96
  };
  var POS = ['pre', 'back', 'front', 'out'];
  function h(tag, cls, html) { var e = g.document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  /* ── 손님 줄 ── */
  function queue(host, o) {
    o = o || {};
    var npc = o.npc || g.PlayNpc, guests = o.guests || ['mina', 'ben'];
    var line = h('div', 'oq-line'), G = {};
    guests.forEach(function (who) { var e = h('div', 'oq-g pre'); npc.render(e, who, { face: 'idle', wear: o.wear }); line.appendChild(e); G[who] = e; });
    var bub = h('button', 'oq-bub'); bub.type = 'button'; line.appendChild(bub);
    var tray = h('div', 'oq-tray'); line.appendChild(tray);
    line.appendChild(h('div', 'oq-clap c1', g.PlayIcon.html('clap'))); line.appendChild(h('div', 'oq-clap c2', g.PlayIcon.html('sparkle')));
    host.appendChild(line);
    var q = {
      el: line, G: G, bub: bub, tray: tray, guests: guests,
      place: function (who, pos) {
        var el = G[who]; if (!el || el.classList.contains(pos)) return;
        /* 나갔던 손님이 다시 줄 설 때는 왼쪽 밖에서부터 들어온다 */
        if (pos === 'back' && el.classList.contains('out')) { POS.forEach(function (c) { el.classList.remove(c); }); el.classList.add('pre'); void el.offsetWidth; }
        POS.forEach(function (c) { el.classList.remove(c); }); el.classList.add(pos);
      },
      /* front 가 앞으로, back(없으면 null) 이 뒤에 선다 */
      step: function (front, back) {
        guests.forEach(function (x) { if (x !== front) { if (back === x) { q.place(x, 'back'); npc.react(G[x], 'wait'); } else q.place(x, 'pre'); } });
        q.place(front, 'front'); npc.react(G[front], 'wait');
      },
      /* 말풍선 — html 을 보여 준다. ear 면 귀로 듣는 판(그림 가림) */
      say: function (html, ear) { bub.innerHTML = '<span>' + html + '</span>'; bub.classList.toggle('ear', !!ear); bub.classList.add('show'); },
      hush: function () { bub.classList.remove('show'); },
      /* 쟁반이 앞 손님에게 */
      serve: function (html, w) {
        var lw = line.offsetWidth || 0;
        tray.innerHTML = html; if (w) tray.setAttribute('data-w', w);
        tray.style.setProperty('--tx', (lw ? Math.round(CONF.frontX - lw / 2) : -70) + 'px');
        restart(tray, 'go');
      },
      clap: function (level, ms) {
        restart(line, 'clap'); line.setAttribute('data-combo', String(level || 1));
        setTimeout(function () { line.classList.remove('clap'); }, ms || 900);
      }
    };
    return q;
  }

  /* ── 구멍 ── */
  function holes(host, n) {
    var board = h('div', 'pp-board'), list = [];
    for (var k = 0; k < (n || 4); k++) {
      var el = h('button', 'pp-hole', '<span class="pp-food"></span>'); el.type = 'button';
      list.push({ i: k, el: el, food: el.firstChild, up: false, w: null, t: null });
      board.appendChild(el);
    }
    host.appendChild(board);
    return {
      el: board, list: list,
      raise: function (hl, html, w) { hl.up = true; hl.w = w; hl.food.innerHTML = html; hl.el.setAttribute('data-w', w); hl.el.classList.add('up'); },
      sink: function (hl) { clearTimeout(hl.t); hl.up = false; hl.w = null; hl.el.classList.remove('up'); hl.el.classList.remove('hit'); hl.el.classList.remove('no'); hl.el.removeAttribute('data-w'); }
    };
  }

  /* ── 레인 ── */
  function lanes(host, n) {
    n = n || 2;
    var box = h('div', 'ln'), list = [];
    box.style.gridTemplateColumns = 'repeat(' + n + ',1fr)';
    for (var k = 0; k < n; k++) { var l = h('button', 'ln-lane'); l.type = 'button'; l.setAttribute('data-lane', String(k)); box.appendChild(l); list.push(l); }
    var tray = h('div', 'ln-tray', '<span></span>'); tray.style.width = (100 / n) + '%'; box.appendChild(tray);
    host.appendChild(box);
    var s = {
      el: box, list: list, tray: tray, at: 0, n: n,
      move: function (i) { s.at = Math.max(0, Math.min(n - 1, i)); tray.setAttribute('data-at', String(s.at)); tray.style.transform = 'translateX(' + (s.at * 100) + '%)'; },
      shake: function () { restart(tray, 'shake'); },
      got: function (html) { tray.firstChild.innerHTML = html; restart(tray, 'got'); },
      /* lane 에 하나 떨어뜨린다. onLine = 쟁반 높이를 지날 때(잡혔으면 true 를 돌려주면 사라진다) · onEnd = 바닥까지 떨어짐 */
      drop: function (lane, html, w, ms, onLine, onEnd) {
        var it = h('div', 'ln-item', html); it.setAttribute('data-w', w); it.style.setProperty('--ms', ms + 'ms');
        list[lane].appendChild(it);
        var t1 = setTimeout(function () { if (!it.parentNode) return; if (onLine && onLine(it) === true) { clearTimeout(t2); it.parentNode.removeChild(it); } }, Math.round(ms * CONF.catchAt));
        var t2 = setTimeout(function () { if (it.parentNode) it.parentNode.removeChild(it); if (onEnd) onEnd(it); }, ms);
        return { el: it, cancel: function () { clearTimeout(t1); clearTimeout(t2); if (it.parentNode) it.parentNode.removeChild(it); } };
      }
    };
    s.move(0);
    return s;
  }

  /* ── 벨트 ── */
  function belt(host, o) {
    o = o || {};
    var box = h('div', 'bl'), list = [];
    host.appendChild(box);
    var b = {
      el: box, list: list, loop: o.loop || 16000,
      /* 주문표 하나 — total 장이 고르게 흐른다 */
      add: function (html, w, i, total) {
        var t = h('button', 'bl-ticket', html); t.type = 'button'; t.setAttribute('data-w', w);
        var path = Math.max(total * CONF.ticketGap, (box.offsetWidth || 0) + CONF.ticketGap);
        t.style.setProperty('--path', '-' + path + 'px');
        t.style.setProperty('--delay', '-' + Math.round((i * b.loop) / total) + 'ms');
        box.appendChild(t); list.push(t);
        return t;
      },
      speed: function (ms) { b.loop = ms; box.style.setProperty('--loop', ms + 'ms'); },
      pause: function (ms) { box.classList.add('paused'); clearTimeout(b._p); if (ms) b._p = setTimeout(function () { box.classList.remove('paused'); }, ms); },
      resume: function () { clearTimeout(b._p); box.classList.remove('paused'); }
    };
    b.speed(b.loop);
    return b;
  }

  g.PlayScene = { CONF: CONF, queue: queue, holes: holes, lanes: lanes, belt: belt };
})(window);

/* ============================================================
 * 영어 놀이터 — 오늘의 사건(PlayEvent) (게임설계 v1 §5-3)
 *   사건은 그날 미니게임 하나의 「포장」이다 — 놀이 자체는 그대로 쓰고, 대사·등장인물·배경만 바뀐다.
 *   play: 무대에 사건 배경을 입히고(가게 색·장식), 등장인물이 나타나고, Sam 이 한마디 한다 → 잠깐 뒤(또는 누르면) 놀이로.
 *   end : 사건이 끝났다는 한마디 + 작은 축하 → 배경을 걷는다.
 *   사건 자료는 content/events/*.js (무대별 목록) — { id, name, icon, game, who, cls, intro{en,ko}, outro{en,ko}, opt }
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 ── */
  var CONF = {
    introMs: 1800,     /* 사건 첫 장면을 보여 주는 시간(ms) — 누르면 바로 넘어간다 */
    outroMs: 1300      /* 사건 끝 한마디 */
  };
  function h(tag, cls, html) { var e = g.document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var PlayEvent = {
    CONF: CONF,
    /* 무대(shop)에 사건 배경을 입힌다 — 화면을 다시 그릴 때마다 불러도 된다 */
    dress: function (shop, ev) {
      if (!shop) return;
      PlayEvent.clear(shop);
      if (!ev) return;
      if (ev.cls) shop.classList.add(ev.cls);
      shop.classList.add('ev-on'); shop.setAttribute('data-ev', ev.id); shop.setAttribute('data-ev-icon', ev.icon || '');
    },
    clear: function (shop) {
      if (!shop) return;
      (shop.className.match(/\bev-[\w-]+/g) || []).forEach(function (c) { shop.classList.remove(c); });
      shop.removeAttribute('data-ev'); shop.removeAttribute('data-ev-icon');
    },
    /* o = { shop, host, services{ sam, audio, npc } } */
    play: function (ev, o) {
      o = o || {};
      var S = o.services || {}, npc = S.npc || g.PlayNpc, host = o.host;
      PlayEvent.dress(o.shop, ev);
      if (host) {
        host.innerHTML = '';
        var card = h('div', 'ev-card', '<div class="ev-icon">' + (g.PlayIcon ? g.PlayIcon.html(ev.icon) : '') + '</div><div class="ev-who"></div><div class="ev-name">' + ev.name + '</div>');
        host.appendChild(card);
        if (npc && ev.who) npc.render(card.querySelector('.ev-who'), ev.who, { face: 'wow', pose: 'ok' });
      }
      if (S.audio) S.audio.play('enter');
      if (S.sam) { if (S.sam.react) S.sam.react('wow'); if (ev.intro && S.sam.say) S.sam.say(ev.intro.en, ev.intro.ko); }
      return new Promise(function (resolve) {
        var done = false, fin = function () { if (done) return; done = true; resolve(ev); };
        if (host && host.firstChild) host.firstChild.onclick = fin;
        setTimeout(fin, CONF.introMs);
      });
    },
    end: function (ev, o) {
      o = o || {};
      var S = o.services || {};
      if (S.sam) { if (S.sam.react) S.sam.react('ok'); if (ev.outro && S.sam.say) S.sam.say(ev.outro.en, ev.outro.ko); }
      if (S.audio) S.audio.play('ok');
      return new Promise(function (resolve) { setTimeout(function () { PlayEvent.clear(o.shop); resolve(ev); }, CONF.outroMs); });
    }
  };
  g.PlayEvent = PlayEvent;
})(window);

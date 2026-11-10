/* ============================================================
 * 영어 놀이터 — 선 아이콘(PlayIcon) (게임설계 v1 §15 — UI 아이콘은 선 아이콘 1.75px 통일, 이모지 0)
 *   24×24 격자, 선만(색은 글자색 currentColor 를 따른다 — 색 값을 여기 적지 않는다).
 *   PlayIcon.html('mic')            → '<svg class="ic" …>…</svg>'
 *   PlayIcon.html('seed', 'ic-lg')  → 덧붙일 클래스
 *   PlayIcon.set(el, 'bell')        → el 안을 그 아이콘으로
 *   값이 '<' 로 시작하면 도형 그대로, 아니면 path 의 d.
 * ============================================================ */
(function (g) {
  'use strict';
  var I = {
    /* ── 공통 ── */
    speaker: 'M4 10v4h3l5 4V6L7 10H4z M15.5 9.5a3.5 3.5 0 010 5 M18 7a7 7 0 010 10',
    mic: 'M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z M6 11a6 6 0 0012 0 M12 17v4 M9 21h6',
    bell: 'M6 16v-5a6 6 0 0112 0v5l1.5 2h-15L6 16z M10 20.5a2 2 0 004 0',
    'bell-off': 'M6 16v-5a6 6 0 0112 0v5l1.5 2h-15L6 16z M10 20.5a2 2 0 004 0 M4 4l16 16',
    back: 'M14 6l-6 6 6 6',
    play: 'M8 5l11 7-11 7V5z',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    home: 'M4 11l8-7 8 7 M6 10v9h12v-9 M10 19v-5h4v5',
    cloud: 'M7 18a4 4 0 01-.5-8 5.5 5.5 0 0110.6-1.2A4.5 4.5 0 0117.5 18H7z',
    'sun-cloud': 'M8 19a3.5 3.5 0 01-.3-7 5 5 0 019.5-.8A4 4 0 0117 19H8z M6 7.5A3 3 0 0110.5 5 M7 2v1.5 M2 7h1.5 M3.5 3.5l1 1',
    flag: 'M6 21V4 M6 5h11l-2.5 3.5L17 12H6',
    crown: 'M4 17L3 8l5 4 4-6 4 6 5-4-1 9H4z M4 20h16',
    sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z',
    clap: 'M7 13l-2-2a1.4 1.4 0 012-2l4 4 M9 11L7 9a1.4 1.4 0 012-2l5 5 M11 9l-1-1a1.4 1.4 0 012-2l5 5a5 5 0 01-7 7l-3-3 M17 2.5v2 M20.5 4.5L19 6 M21.5 8.5h-2',
    note: 'M9 18V6l10-2v12 M9 18a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z M19 16a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    flame: 'M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z',
    bag: 'M8 8h8l2 10a2 2 0 01-2 2H8a2 2 0 01-2-2L8 8z M9 8a3 3 0 016 0',
    map: 'M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2V6z M9 4v14 M15 6v14',
    /* ── 씨앗 한살이 ── */
    seed: 'M12 4c4 3 5 7 3.5 11a4 4 0 01-7 0C7 11 8 7 12 4z',
    sprout: 'M12 20v-8 M12 12c0-3-2-5-6-5 0 3 2 5 6 5z M12 10c0-3 2-5 6-5 0 3-2 5-6 5z',
    flower: '<circle cx="12" cy="12" r="2"/><path d="M12 10c-1.6-1-1.6-4 0-5 1.6 1 1.6 4 0 5z M12 14c-1.6 1-1.6 4 0 5 1.6-1 1.6-4 0-5z M10 12c-1-1.6-4-1.6-5 0 1 1.6 4 1.6 5 0z M14 12c1-1.6 4-1.6 5 0-1 1.6-4 1.6-5 0z"/>',
    fruit: 'M12 8c-3-2-7 0-7 4.5S8 20 12 19c4 1 7-2 7-6.5S15 6 12 8z M12 8c0-2 1-3.5 3-4',
    /* ── 놀이 ── */
    order: 'M4 17h16 M6 17a6 6 0 0112 0 M12 8V6 M10 6h4',
    ear: 'M7 14a6 6 0 1111 0c-1 2-3 2.5-3 5a3 3 0 01-6 0 M10 12a2.5 2.5 0 114.5-1.5',
    body: '<circle cx="12" cy="6" r="2"/><path d="M5 8l7 3 7-3 M12 11v5 M12 16l-3 5 M12 16l3 5"/>',
    jump: '<circle cx="12" cy="5.5" r="2"/><path d="M6 6l6 4 6-4 M12 10v4 M12 14l-4 2 1 4 M12 14l4 2-1 4"/>',
    box: 'M4 8l8-4 8 4v8l-8 4-8-4V8z M4 8l8 4 8-4 M12 12v8',
    plate: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
    plant: 'M12 14V7 M12 9c-2 0-4-1.5-4-4 2 0 4 1.5 4 4z M12 11c2 0 4-1.5 4-4-2 0-4 1.5-4 4z M7 14h10l-1.5 6h-7L7 14z',
    wink: '<circle cx="12" cy="12" r="9"/><path d="M7.5 10h2.5 M14.5 9.5v1 M8 14c1.5 2.5 6.5 2.5 8 0"/>',
    monster: 'M6 20v-8a6 6 0 1112 0v8l-2-2-2 2-2-2-2 2-2-2z M9.5 11.5v1 M14.5 11.5v1 M8 5L6.5 3 M16 5l1.5-2',
    vending: 'M6 3h12v18H6V3z M9 6h6v6H9V6z M9 16h6',
    sandwich: 'M4 9l8-4 8 4-8 4-8-4z M4 13l8 4 8-4 M4 16.5l8 4 8-4',
    mirror: '<ellipse cx="12" cy="10" rx="6" ry="7"/><path d="M12 17v4 M8 21h8"/>',
    robot: 'M7 8h10v9H7V8z M12 8V5 M10 12v1 M14 12v1 M10 15h4 M5 11v4 M19 11v4',
    bridge: 'M3 16h18 M3 16c3-8 15-8 18 0 M8 16v-4.5 M12 16v-6 M16 16v-4.5 M3 16v4 M21 16v4',
    train: '<path d="M5 6h9a4 4 0 014 4v6H5V6z M5 11h13 M8 6V4"/><circle cx="8.5" cy="18" r="1.5"/><circle cx="14.5" cy="18" r="1.5"/>',
    wand: 'M5 19L15 9 M14 4l.8 2.2L17 7l-2.2.8L14 10l-.8-2.2L11 7l2.2-.8L14 4z M19 12l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L17 14l1.5-.5.5-1.5z',
    speech: 'M5 5h14v10H10l-4 4v-4H5V5z M9 9h6 M9 12h4',
    /* ── 사건 ── */
    mask: 'M4 9c3-3 13-3 16 0v3c-2 3-5 3-6 1-1-1-3-1-4 0-1 2-4 2-6-1V9z M9 11v.8 M15 11v.8',
    party: '<ellipse cx="9" cy="8" rx="3.5" ry="4"/><ellipse cx="16" cy="9.5" rx="3" ry="3.5"/><path d="M9 12c0 4 2 5 2 8 M16 13c0 3-2 4-2 7"/>',
    umbrella: 'M3 12a9 9 0 0118 0H3z M12 12v6a2 2 0 01-4 0 M12 3v-.5',
    menu: 'M7 5h10v15H7V5z M9.5 3.5h5v3h-5v-3z M10 10h4 M10 13h4 M10 16h2',
    wrench: 'M14.5 4.5a4 4 0 00-4 5.3L4 16.3 7.7 20l6.5-6.5a4 4 0 005.3-4L17 12l-2.5-.5-.5-2.5 2.5-2.5a4 4 0 00-2-2z',
    cards: 'M5 7h11v12H5V7z M8 7V4h11v12h-3 M8 11h5 M8 14h3',
    /* ── 무대·장식 ── */
    shop: 'M4 10l1.5-5h13L20 10 M4 10a2.7 2.7 0 005.3 0 2.7 2.7 0 005.4 0 2.7 2.7 0 005.3 0 M5.5 12v8h13v-8 M10 20v-5h4v5',
    school: 'M3 20V10l9-6 9 6v10H3z M12 4V2h3 M10 20v-5h4v5 M6.5 12.5h2 M15.5 12.5h2',
    tree: 'M12 3a6 6 0 00-4.5 10A4 4 0 0012 17a4 4 0 004.5-4A6 6 0 0012 3z M12 12v9 M9 21h6',
    barn: 'M4 20v-9l8-6 8 6v9H4z M9 20v-6h6v6 M9 14l6 6 M15 14l-6 6',
    door: 'M6 21V4h12v17 M4 21h16 M15 12v1',
    book: 'M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1V5z M12 6v13',
    abc: 'M3.5 17l3-9 3 9 M4.5 14h4 M13 8v9 M13 13a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0',
    paw: '<ellipse cx="12" cy="16" rx="4.5" ry="3.5"/><circle cx="6.5" cy="11" r="1.6"/><circle cx="10" cy="7.5" r="1.6"/><circle cx="14" cy="7.5" r="1.6"/><circle cx="17.5" cy="11" r="1.6"/>',
    lamp: 'M8 4h8l2 8H6l2-8z M12 12v6 M9 20h6',
    balloon: '<ellipse cx="12" cy="9" rx="5" ry="6"/><path d="M12 15v1 M12 16c-2 2 2 3 0 5"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    frame: 'M4 5h16v14H4V5z M7 16l3.5-4 2.5 3 2-2 2 3',
    basket: 'M4 10h16l-2 9H6l-2-9z M8 10l4-6 4 6 M9 13v3 M12 13v3 M15 13v3',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.2 2.2 M16.2 16.2l2.2 2.2 M18.4 5.6l-2.2 2.2 M7.8 16.2l-2.2 2.2"/>',
    bolt: 'M9 4h6l-1 4h-4L9 4z M10 8v11l2 2 2-2V8 M10 11l4 2 M10 14l4 2',
    radio: '<path d="M4 9h16v10H4V9z M13 12h4 M13 15h4 M7 9l8-5"/><circle cx="8" cy="14" r="2"/>',
    magnet: 'M6 4v8a6 6 0 0012 0V4h-4v8a2 2 0 01-4 0V4H6z M6 8h4 M14 8h4',
    bulb: 'M9 17h6 M10 20h4 M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0012 3z',
    dial: '<circle cx="12" cy="12" r="7"/><path d="M12 12l3-3 M12 2v1.5 M4 6l1 1 M20 6l-1 1"/>',
    torch: 'M7 4h10l-2 5v9a1 1 0 01-1 1h-4a1 1 0 01-1-1V9L7 4z M12 12v3',
    nest: 'M4 13c2 5 14 5 16 0 M4 13h16 M8 13a2 2.5 0 014 0 M12 13a2 2.5 0 014 0',
    leaf: 'M5 19c0-8 5-13 14-14 0 9-5 14-13 14 M5 19l8-8'
  };
  function html(name, cls) {
    var d = I[name]; if (!d) return '';
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-ic="' + name + '">' +
      (d.charAt(0) === '<' ? d : '<path d="' + d + '"/>') + '</svg>';
  }
  g.PlayIcon = {
    names: function () { return Object.keys(I); },
    has: function (name) { return !!I[name]; },
    html: html,
    set: function (el, name, cls) { if (el) el.innerHTML = html(name, cls); return el; }
  };
})(window);

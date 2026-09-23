/* ============================================================================
   stage2-art.js — 케이티처 2세대 「그림 층」 (2026-09-22)
   · 데이터의 그림 파일(assets/photo/…)은 131자리 전부 실물이 없다. 사진이 올 때까지 빈 자리로 두지 않고
     **코드로 그린 장면 무대(SVG)** 를 깐다 — 장면 제목의 낱말로 무대를 고른다(학교 길·공원·교실·운동장·바다·집·밤·숲·가게·기본).
   · 인물 장면(kids)은 무대 위에 선다. 사진이 오면(assets 실파일·교사 사진) 무대는 뒤로 물러난다.
   · 십 배열판은 칩으로, 연결 모형은 입체 큐브로, 숫자 카드는 종이 카드로 — 부품 외형만 바꾸고 데이터는 그대로.
   ============================================================================ */
(function (global) {
  'use strict';
  const KEYS = [
    ['school', /학교|등교|교문|가는 길|입학|길에/],
    ['park', /공원|놀이터|그네|미끄럼|소풍|나들이|산책/],
    ['classroom', /교실|학용품|정리|책상|사물함|칠판|급식|우리 반/],
    ['field', /운동장|달리기|시합|체육|줄넘기|공놀이|딱지|축구/],
    ['sea', /바다|조개|모래|해변|물고기|배 /],
    ['home', /집|가족|부엌|식탁|간식|사탕|과자|생일|케이크/],
    ['night', /밤|별|달|하늘|우주/],
    ['forest', /숲|나무|동물|토끼|다람쥐|꽃|들판|연못/],
    ['shop', /가게|시장|마트|장난감|사요|팔아|돈/],
    ['farm', /농장|밭|과일|사과|딸기|수확|텃밭/]
  ];
  function kindOf(text) { const t = String(text || ''); for (const k of KEYS) if (k[1].test(t)) return k[0]; return 'hill'; }

  // 무대 = 1200×420 viewBox. 부드러운 그라디언트 + 단순한 도형(그림책 톤). 글자 없음.
  function svg(inner, sky1, sky2, ground1, ground2) {
    const id = 'g' + Math.floor(Math.random() * 1e6);
    return '<svg class="bd" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>'
      + '<linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + sky1 + '"/><stop offset="1" stop-color="' + sky2 + '"/></linearGradient>'
      + '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + ground1 + '"/><stop offset="1" stop-color="' + ground2 + '"/></linearGradient></defs>'
      + '<rect width="1200" height="420" fill="url(#' + id + 's)"/>' + inner.replace(/GROUND/g, 'url(#' + id + 'g)') + '</svg>';
  }
  const sun = (x, y, r, c) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (c || '#FFD166') + '" opacity=".95"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 1.6) + '" fill="' + (c || '#FFD166') + '" opacity=".18"/>';
  const cloud = (x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="#fff" opacity=".9"><circle cx="0" cy="0" r="26"/><circle cx="28" cy="-10" r="34"/><circle cx="62" cy="2" r="26"/><rect x="-10" y="0" width="82" height="24" rx="12"/></g>';
  const tree = (x, y, s, c) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-8" y="-10" width="16" height="60" rx="6" fill="#8B5A2B"/><circle cx="0" cy="-40" r="46" fill="' + (c || '#3FBF7F') + '"/><circle cx="-30" cy="-18" r="30" fill="' + (c || '#3FBF7F') + '"/><circle cx="30" cy="-18" r="30" fill="' + (c || '#3FBF7F') + '"/></g>';
  const hills = (c1, c2) => '<ellipse cx="200" cy="420" rx="560" ry="150" fill="' + c1 + '"/><ellipse cx="1000" cy="430" rx="620" ry="170" fill="' + c2 + '"/>';
  const ground = '<rect x="0" y="330" width="1200" height="90" fill="GROUND"/>';
  const BACK = {
    hill: () => svg(sun(1020, 90, 44) + cloud(180, 90, 1) + cloud(760, 60, .8) + hills('#B7E4A7', '#9ED88C') + ground + tree(160, 330, 1.1) + tree(1040, 330, 1.3, '#5CC58F'), '#DFF3FF', '#F5FBFF', '#8FD08A', '#6FBF6A'),
    school: () => svg(sun(1040, 84, 42) + cloud(200, 80, .9) + hills('#C9E8B8', '#B4DEA1') + ground
      + '<g><rect x="720" y="150" width="330" height="190" rx="14" fill="#F6E7D2"/><rect x="700" y="130" width="370" height="30" rx="8" fill="#E0704A"/><rect x="860" y="250" width="50" height="90" rx="6" fill="#8B5A2B"/>' + [745, 805, 935, 995].map(x => '<rect x="' + x + '" y="180" width="40" height="44" rx="6" fill="#9DD6F5"/>').join('') + '<rect x="875" y="90" width="6" height="50" fill="#666"/><rect x="881" y="92" width="34" height="22" fill="#F0506E"/></g>'
      + '<path d="M0 420 C 300 340, 500 400, 760 350 L 900 340 L 1200 420 Z" fill="#E7D8C3"/><path d="M40 410 C 320 350, 520 405, 780 355" stroke="#fff" stroke-width="4" stroke-dasharray="26 22" fill="none" opacity=".8"/>'
      + tree(120, 320, 1.1) + tree(520, 340, .8, '#5CC58F') + tree(1130, 320, 1) + '<g transform="translate(1000 330)"><rect x="-70" y="-46" width="140" height="18" fill="#F5B942"/><rect x="-70" y="-40" width="140" height="10" fill="#fff"/><rect x="-70" y="-28" width="140" height="18" fill="#F5B942"/></g>', '#CFEBFF', '#F3FAFF', '#9FD48E', '#7CC27A'),
    park: () => svg(sun(140, 90, 46) + cloud(560, 70, .9) + cloud(980, 110, .7) + hills('#BDE6A8', '#A2DB92') + ground
      + '<g stroke="#8B5A2B" stroke-width="10" stroke-linecap="round"><line x1="820" y1="340" x2="880" y2="130"/><line x1="1080" y1="340" x2="1020" y2="130"/><line x1="870" y1="130" x2="1030" y2="130"/></g><g stroke="#666" stroke-width="4"><line x1="920" y1="132" x2="920" y2="260"/><line x1="980" y1="132" x2="980" y2="260"/></g><rect x="900" y="258" width="100" height="14" rx="6" fill="#E0704A"/>'
      + '<path d="M240 340 L 420 340 L 300 190 Z" fill="#9DD6F5"/><rect x="290" y="180" width="30" height="160" rx="8" fill="#F0506E"/><path d="M300 190 Q 470 240 500 340" stroke="#4F8DF7" stroke-width="22" fill="none" stroke-linecap="round"/>'
      + tree(120, 330, 1.2, '#5CC58F') + tree(640, 330, 1, '#3FBF7F') + '<g fill="#F0506E"><circle cx="560" cy="325" r="8"/><circle cx="590" cy="330" r="6"/></g><g fill="#F5B942"><circle cx="700" cy="328" r="7"/></g>', '#D6EEFF', '#F5FBFF', '#8FD08A', '#6FBF6A'),
    classroom: () => svg('<rect x="0" y="0" width="1200" height="330" fill="#FBF3E4"/><rect x="0" y="0" width="1200" height="24" fill="#EAD9C0"/><rect x="0" y="330" width="1200" height="90" fill="GROUND"/>'
      + '<rect x="120" y="70" width="560" height="200" rx="12" fill="#2F6B4F"/><rect x="110" y="60" width="580" height="220" rx="14" fill="none" stroke="#C99A5B" stroke-width="10"/><g stroke="#fff" stroke-width="4" opacity=".55" stroke-linecap="round"><line x1="170" y1="120" x2="380" y2="120"/><line x1="170" y1="170" x2="300" y2="170"/><line x1="170" y1="220" x2="420" y2="220"/></g>'
      + '<rect x="760" y="80" width="330" height="200" rx="10" fill="#9DD6F5"/><rect x="760" y="80" width="330" height="200" rx="10" fill="none" stroke="#fff" stroke-width="8"/><line x1="925" y1="80" x2="925" y2="280" stroke="#fff" stroke-width="8"/>' + sun(1010, 150, 30)
      + '<g><rect x="60" y="300" width="230" height="20" rx="6" fill="#E8B77D"/><rect x="80" y="320" width="14" height="60" fill="#C99A5B"/><rect x="256" y="320" width="14" height="60" fill="#C99A5B"/></g><g><rect x="380" y="300" width="230" height="20" rx="6" fill="#E8B77D"/><rect x="400" y="320" width="14" height="60" fill="#C99A5B"/><rect x="576" y="320" width="14" height="60" fill="#C99A5B"/></g>'
      + '<g><rect x="700" y="240" width="240" height="12" fill="#C99A5B"/>' + [['#F0506E', 710], ['#4F8DF7', 750], ['#F5B942', 790], ['#12B886', 830], ['#7C5CFF', 870]].map(b => '<rect x="' + b[1] + '" y="200" width="30" height="40" rx="4" fill="' + b[0] + '"/>').join('') + '</g>', '#FBF3E4', '#FBF3E4', '#D9B48A', '#C99A5B'),
    field: () => svg(sun(1000, 90, 44) + cloud(240, 80, 1) + cloud(640, 60, .7) + hills('#C9E8B8', '#B4DEA1')
      + '<ellipse cx="600" cy="430" rx="700" ry="120" fill="#E0704A"/><ellipse cx="600" cy="440" rx="560" ry="80" fill="#F0A07A"/><g stroke="#fff" stroke-width="5" fill="none" opacity=".9"><ellipse cx="600" cy="435" rx="640" ry="100"/><ellipse cx="600" cy="435" rx="480" ry="60"/></g>'
      + '<g><rect x="90" y="150" width="8" height="190" fill="#666"/><path d="M98 155 L 210 175 L 98 195 Z" fill="#F0506E"/></g><g><rect x="1100" y="180" width="8" height="160" fill="#666"/><path d="M1108 185 L 1180 200 L 1108 215 Z" fill="#4F8DF7"/></g>'
      + tree(40, 320, .9) + tree(1160, 320, .9), '#D6EEFF', '#F5FBFF', '#8FD08A', '#6FBF6A'),
    sea: () => svg(sun(180, 100, 50, '#FFE08A') + cloud(560, 70, .9) + cloud(1000, 100, .8)
      + '<rect x="0" y="230" width="1200" height="130" fill="#4FA8E8"/><path d="M0 240 Q 100 220 200 240 T 400 240 T 600 240 T 800 240 T 1000 240 T 1200 240 V 260 H 0 Z" fill="#7CC4F2"/><path d="M0 300 Q 150 285 300 300 T 600 300 T 900 300 T 1200 300 V 320 H 0 Z" fill="#fff" opacity=".35"/>'
      + '<path d="M0 420 L 0 350 Q 300 320 600 345 T 1200 340 L 1200 420 Z" fill="#F4E1B4"/><g fill="#E9D3A0"><ellipse cx="200" cy="385" rx="30" ry="10"/><ellipse cx="900" cy="395" rx="40" ry="12"/></g>'
      + '<g transform="translate(860 235)"><path d="M0 0 L 90 0 L 70 24 L 20 24 Z" fill="#E0704A"/><rect x="42" y="-70" width="6" height="70" fill="#666"/><path d="M48 -66 L 100 -10 L 48 -10 Z" fill="#fff"/></g>'
      + '<g fill="#F5B942"><path d="M300 372 q 12 -22 24 0 q -12 14 -24 0z"/><path d="M340 380 q 10 -18 20 0 q -10 12 -20 0z"/></g>', '#CFEBFF', '#E9F6FF', '#F4E1B4', '#E9D3A0'),
    home: () => svg('<rect x="0" y="0" width="1200" height="330" fill="#FFF3DC"/><rect x="0" y="330" width="1200" height="90" fill="GROUND"/>'
      + '<rect x="120" y="60" width="300" height="220" rx="12" fill="#9DD6F5" stroke="#fff" stroke-width="10"/><line x1="270" y1="60" x2="270" y2="280" stroke="#fff" stroke-width="8"/><rect x="100" y="40" width="340" height="30" rx="8" fill="#F0A07A"/>' + sun(200, 130, 28)
      + '<g><rect x="560" y="250" width="520" height="22" rx="8" fill="#E8B77D"/><rect x="590" y="272" width="16" height="70" fill="#C99A5B"/><rect x="1030" y="272" width="16" height="70" fill="#C99A5B"/><rect x="560" y="232" width="520" height="20" rx="8" fill="#F6E7D2"/></g>'
      + '<g><circle cx="700" cy="215" r="38" fill="#fff"/><circle cx="700" cy="215" r="28" fill="#F0506E"/><rect x="694" y="170" width="12" height="22" fill="#F5B942"/></g><g><rect x="880" y="180" width="70" height="60" rx="10" fill="#4F8DF7"/><rect x="880" y="180" width="70" height="14" rx="6" fill="#fff" opacity=".6"/></g>'
      + '<g><rect x="760" y="20" width="10" height="120" fill="#666"/><path d="M700 140 L 830 140 L 810 80 L 720 80 Z" fill="#F5B942"/></g>', '#FFF3DC', '#FFF3DC', '#D9B48A', '#C99A5B'),
    night: () => svg([80, 240, 420, 640, 760, 990, 1150, 300, 880].map((x, i) => '<circle cx="' + x + '" cy="' + (40 + (i * 37) % 200) + '" r="' + (3 + i % 3) + '" fill="#fff" opacity=".9"/>').join('') + '<circle cx="1000" cy="110" r="52" fill="#FFF1B8"/><circle cx="978" cy="96" r="44" fill="#1E2A44"/>'
      + hills('#2F4A6E', '#274063') + ground + tree(180, 330, 1.1, '#2E6B57') + tree(1080, 330, 1.2, '#2E6B57'), '#0F1A33', '#1E2A44', '#1F3B5A', '#16304A'),
    forest: () => svg(sun(1040, 80, 40) + cloud(240, 70, .8) + hills('#A6DE9A', '#8FD08A') + ground
      + tree(120, 330, 1.4, '#2E9E6B') + tree(300, 335, 1, '#3FBF7F') + tree(470, 330, 1.3, '#5CC58F') + tree(760, 335, 1.1, '#2E9E6B') + tree(940, 330, 1.4, '#3FBF7F') + tree(1120, 335, 1, '#5CC58F')
      + '<ellipse cx="620" cy="360" rx="120" ry="30" fill="#7CC4F2"/><ellipse cx="620" cy="358" rx="100" ry="20" fill="#9DD6F5"/><g fill="#F0506E"><circle cx="220" cy="350" r="7"/><circle cx="380" cy="352" r="6"/></g><g fill="#F5B942"><circle cx="860" cy="350" r="7"/><circle cx="1020" cy="354" r="6"/></g>', '#DDF3FF', '#F5FBFF', '#7FC97A', '#5FAF62'),
    shop: () => svg('<rect x="0" y="0" width="1200" height="330" fill="#FFF7E8"/><rect x="0" y="330" width="1200" height="90" fill="GROUND"/>'
      + '<rect x="100" y="40" width="1000" height="60" rx="10" fill="#F0506E"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => '<rect x="' + (100 + i * 100) + '" y="40" width="50" height="60" fill="#fff" opacity=".6"/>').join('')
      + '<g>' + [0, 1, 2].map(r => '<rect x="160" y="' + (130 + r * 70) + '" width="880" height="12" fill="#C99A5B"/>').join('') + [['#F0506E', 190, 130], ['#4F8DF7', 260, 130], ['#F5B942', 330, 130], ['#12B886', 420, 130], ['#7C5CFF', 490, 130], ['#F0A07A', 600, 130], ['#9DD6F5', 700, 130], ['#F0506E', 220, 200], ['#12B886', 330, 200], ['#F5B942', 440, 200], ['#4F8DF7', 560, 200], ['#7C5CFF', 680, 200], ['#F0A07A', 800, 200], ['#F0506E', 300, 270], ['#4F8DF7', 500, 270], ['#12B886', 700, 270], ['#F5B942', 900, 270]].map(b => '<rect x="' + b[1] + '" y="' + (b[2] - 44) + '" width="44" height="44" rx="8" fill="' + b[0] + '"/>').join('') + '</g>', '#FFF7E8', '#FFF7E8', '#D9B48A', '#C99A5B'),
    farm: () => svg(sun(1000, 90, 46) + cloud(300, 70, .9) + hills('#C9E8B8', '#B4DEA1') + ground
      + '<g>' + [0, 1, 2, 3, 4, 5].map(i => '<path d="M' + (60 + i * 200) + ' 340 q 100 -40 200 0" stroke="#8B5A2B" stroke-width="18" fill="none"/>').join('') + '</g>'
      + '<g fill="#F0506E">' + [120, 320, 520, 720, 920, 1120].map(x => '<circle cx="' + x + '" cy="315" r="10"/><circle cx="' + (x + 40) + '" cy="322" r="9"/>').join('') + '</g>'
      + tree(200, 250, 1.2, '#3FBF7F') + '<g fill="#F0506E"><circle cx="170" cy="200" r="9"/><circle cx="220" cy="190" r="9"/><circle cx="240" cy="230" r="9"/></g>'
      + '<g><rect x="760" y="130" width="220" height="120" fill="#E0704A"/><path d="M740 140 L 870 60 L 1000 140 Z" fill="#B54C0E"/><rect x="850" y="180" width="40" height="70" fill="#8B5A2B"/></g>', '#D6EEFF', '#F5FBFF', '#8FD08A', '#6FBF6A')
  };
  function backdrop(kind) { return (BACK[kind] || BACK.hill)(); }

  // 십 배열판 = 칩. 5개 단위로 색을 바꿔 「5 기준」이 보인다.
  function tenFrameChips(count, size) {
    size = size || 46; const gap = 6, cols = 5, rows = 2; const w = cols * size + (cols - 1) * gap, h = rows * size + (rows - 1) * gap;
    let cells = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c, x = c * (size + gap), y = r * (size + gap);
      cells += '<rect class="cell" x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" rx="9"/>';
      if (i < count) cells += '<g class="chip' + (i < 5 ? ' a' : ' b') + '" style="--i:' + i + '"><circle cx="' + (x + size / 2) + '" cy="' + (y + size / 2 + 2) + '" r="' + (size * 0.36) + '" class="sh"/><circle cx="' + (x + size / 2) + '" cy="' + (y + size / 2) + '" r="' + (size * 0.36) + '" class="c"/><circle cx="' + (x + size / 2 - size * 0.1) + '" cy="' + (y + size / 2 - size * 0.12) + '" r="' + (size * 0.11) + '" class="hi"/></g>';
    }
    const dx = 2 * size + 2 * gap + size + gap / 2;
    return '<svg class="tenframe chips" width="' + (w + 8) + '" height="' + (h + 8) + '" viewBox="-4 -4 ' + (w + 8) + ' ' + (h + 8) + '" xmlns="http://www.w3.org/2000/svg"><rect class="board" x="-4" y="-4" width="' + (w + 8) + '" height="' + (h + 8) + '" rx="14"/>' + cells + '<line class="div" x1="' + dx + '" y1="-4" x2="' + dx + '" y2="' + (h + 4) + '"/></svg>';
  }
  // ── 13차 인물 층 — 주인공 다섯(곰이·펭이·하나·두리·도토)을 이모지 대신 코드로 그린 그림책 인물로.
  //    140×160 viewBox · 발끝 y≈150. 숨쉬기(bodyg)·고개(head)·눈 깜빡임(eyes)·말할 때 입(m-open/m-closed)을 CSS 가 움직인다.
  //    데이터는 그대로(face 이모지) — 모르는 얼굴은 '' 를 돌려주고 이모지가 그대로 선다.
  const EYES = (lx, rx, y, r) => '<g class="eyes"><circle cx="' + lx + '" cy="' + y + '" r="' + r + '" fill="#2B1D12"/><circle cx="' + rx + '" cy="' + y + '" r="' + r + '" fill="#2B1D12"/><circle cx="' + (lx + r * .35) + '" cy="' + (y - r * .4) + '" r="' + (r * .34) + '" fill="#fff"/><circle cx="' + (rx + r * .35) + '" cy="' + (y - r * .4) + '" r="' + (r * .34) + '" fill="#fff"/></g>';
  const CHEEKS = (lx, rx, y) => '<circle cx="' + lx + '" cy="' + y + '" r="6.5" fill="#F28B82" opacity=".55"/><circle cx="' + rx + '" cy="' + y + '" r="6.5" fill="#F28B82" opacity=".55"/>';
  const MOUTH = (cx, y, ink) => '<g class="mouth"><path class="m-closed" d="M' + (cx - 7) + ' ' + y + ' Q' + cx + ' ' + (y + 7) + ' ' + (cx + 7) + ' ' + y + '" stroke="' + ink + '" stroke-width="2.6" fill="none" stroke-linecap="round"/><ellipse class="m-open" opacity="0" cx="' + cx + '" cy="' + (y + 3) + '" rx="5.5" ry="4.6" fill="#8A3030"/></g>';
  const SHADOW = '<ellipse cx="70" cy="153" rx="42" ry="6.5" fill="#000" opacity=".16"/>';
  const CHR = {
    bear: () => SHADOW
      + '<g class="bodyg"><ellipse cx="38" cy="114" rx="10" ry="17" fill="#A86A33" transform="rotate(22 38 114)"/><ellipse cx="102" cy="114" rx="10" ry="17" fill="#A86A33" transform="rotate(-22 102 114)"/>'
      + '<ellipse cx="70" cy="118" rx="35" ry="32" fill="#B5773E"/><ellipse cx="70" cy="124" rx="22" ry="20" fill="#EBC89F"/><ellipse cx="53" cy="148" rx="13" ry="7" fill="#8E5A2B"/><ellipse cx="87" cy="148" rx="13" ry="7" fill="#8E5A2B"/></g>'
      + '<g class="head"><circle cx="38" cy="36" r="15" fill="#B5773E"/><circle cx="38" cy="36" r="8" fill="#EBC89F"/><circle cx="102" cy="36" r="15" fill="#B5773E"/><circle cx="102" cy="36" r="8" fill="#EBC89F"/>'
      + '<circle cx="70" cy="60" r="38" fill="#B5773E"/><ellipse cx="70" cy="75" rx="18" ry="14" fill="#EBC89F"/><ellipse cx="70" cy="68" rx="6.5" ry="4.8" fill="#4A2E17"/>'
      + EYES(55, 85, 54, 4.6) + CHEEKS(45, 95, 72) + MOUTH(70, 79, '#4A2E17') + '</g>',
    penguin: () => SHADOW
      + '<g class="bodyg"><ellipse cx="34" cy="112" rx="9" ry="22" fill="#2D3A55" transform="rotate(24 34 112)"/><ellipse cx="106" cy="112" rx="9" ry="22" fill="#2D3A55" transform="rotate(-24 106 112)"/>'
      + '<ellipse cx="70" cy="112" rx="37" ry="40" fill="#2D3A55"/><ellipse cx="70" cy="120" rx="25" ry="29" fill="#FFFFFF"/><ellipse cx="55" cy="150" rx="12" ry="5.5" fill="#F5A623"/><ellipse cx="85" cy="150" rx="12" ry="5.5" fill="#F5A623"/></g>'
      + '<g class="head"><circle cx="70" cy="56" r="35" fill="#2D3A55"/><path d="M46 62 Q46 36 62 40 Q70 46 78 40 Q94 36 94 62 Q94 84 70 86 Q46 84 46 62 Z" fill="#FFFFFF"/>'
      + EYES(59, 81, 57, 4.4) + CHEEKS(51, 89, 70)
      + '<g class="mouth"><path class="m-closed" d="M61 67 L79 67 L70 77 Z" fill="#F5A623"/><g class="m-open" opacity="0"><path d="M61 65 L79 65 L70 72 Z" fill="#F5A623"/><path d="M63 74 L77 74 L70 81 Z" fill="#E0891A"/></g></g></g>',
    girl: () => SHADOW
      + '<g class="bodyg"><ellipse cx="45" cy="112" rx="7.5" ry="16" fill="#FFD9B8" transform="rotate(18 45 112)"/><ellipse cx="95" cy="112" rx="7.5" ry="16" fill="#FFD9B8" transform="rotate(-18 95 112)"/>'
      + '<rect x="58" y="134" width="8" height="14" rx="3" fill="#FFD9B8"/><rect x="74" y="134" width="8" height="14" rx="3" fill="#FFD9B8"/>'
      + '<path d="M44 140 L54 100 Q70 92 86 100 L96 140 Q70 146 44 140 Z" fill="#F76E8A"/><path d="M58 100 Q70 108 82 100" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>'
      + '<ellipse cx="60" cy="150" rx="10" ry="5" fill="#6B3E2A"/><ellipse cx="80" cy="150" rx="10" ry="5" fill="#6B3E2A"/></g>'
      + '<g class="head"><circle cx="30" cy="66" r="12" fill="#3B2A20"/><circle cx="110" cy="66" r="12" fill="#3B2A20"/><circle cx="38" cy="56" r="5" fill="#FFD166"/><circle cx="102" cy="56" r="5" fill="#FFD166"/>'
      + '<circle cx="70" cy="58" r="36" fill="#3B2A20"/><ellipse cx="70" cy="64" rx="29" ry="30" fill="#FFD9B8"/>'
      + '<path d="M40 58 Q44 28 70 28 Q96 28 100 58 Q90 44 76 46 Q72 38 66 46 Q50 44 40 58 Z" fill="#3B2A20"/>'
      + EYES(58, 82, 64, 4.3) + CHEEKS(49, 91, 76) + MOUTH(70, 80, '#8A4B3A') + '</g>',
    boy: () => SHADOW
      + '<g class="bodyg"><ellipse cx="43" cy="112" rx="7.5" ry="16" fill="#FFD9B8" transform="rotate(18 43 112)"/><ellipse cx="97" cy="112" rx="7.5" ry="16" fill="#FFD9B8" transform="rotate(-18 97 112)"/>'
      + '<rect x="57" y="138" width="9" height="11" rx="3" fill="#FFD9B8"/><rect x="74" y="138" width="9" height="11" rx="3" fill="#FFD9B8"/>'
      + '<path d="M46 102 Q70 92 94 102 L95 130 L45 130 Z" fill="#4F8DF7"/><rect x="47" y="128" width="46" height="13" rx="4" fill="#2D3A55"/><circle cx="70" cy="112" r="5" fill="#FFD166"/>'
      + '<ellipse cx="60" cy="150" rx="10" ry="5" fill="#2D3A55"/><ellipse cx="80" cy="150" rx="10" ry="5" fill="#2D3A55"/></g>'
      + '<g class="head"><circle cx="41" cy="66" r="6.5" fill="#F4C9A3"/><circle cx="99" cy="66" r="6.5" fill="#F4C9A3"/><circle cx="70" cy="62" r="31" fill="#FFD9B8"/>'
      + '<path d="M39 60 Q38 28 70 27 Q102 28 101 60 Q94 44 80 45 L74 36 L68 45 Q50 43 39 60 Z" fill="#2B2B2B"/>'
      + EYES(58, 82, 64, 4.3) + CHEEKS(49, 91, 75) + MOUTH(70, 79, '#8A4B3A') + '</g>',
    squirrel: () => SHADOW
      + '<g class="bodyg"><path d="M92 140 Q138 124 128 76 Q121 38 94 44 Q116 58 108 90 Q101 116 84 130 Z" fill="#D9822B"/><path d="M100 60 Q118 70 112 96" stroke="#F0A860" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>'
      + '<ellipse cx="64" cy="120" rx="26" ry="28" fill="#D9822B"/><ellipse cx="64" cy="126" rx="16" ry="19" fill="#F6D2A8"/>'
      + '<ellipse cx="64" cy="110" rx="8" ry="9" fill="#A0642B"/><path d="M55 106 Q64 96 73 106 Z" fill="#6B4423"/>'
      + '<ellipse cx="50" cy="112" rx="6" ry="9" fill="#C8731F" transform="rotate(30 50 112)"/><ellipse cx="78" cy="112" rx="6" ry="9" fill="#C8731F" transform="rotate(-30 78 112)"/>'
      + '<ellipse cx="52" cy="148" rx="11" ry="5.5" fill="#B5651C"/><ellipse cx="76" cy="148" rx="11" ry="5.5" fill="#B5651C"/></g>'
      + '<g class="head"><path d="M42 50 L46 24 L60 42 Z" fill="#D9822B"/><path d="M86 50 L82 24 L68 42 Z" fill="#D9822B"/><path d="M46 44 L48 31 L55 41 Z" fill="#F6D2A8"/><path d="M82 44 L80 31 L73 41 Z" fill="#F6D2A8"/>'
      + '<circle cx="64" cy="64" r="28" fill="#D9822B"/><ellipse cx="64" cy="76" rx="15" ry="11" fill="#F6D2A8"/><ellipse cx="64" cy="70" rx="4" ry="3" fill="#4A2E17"/>'
      + EYES(53, 75, 60, 4.8) + CHEEKS(44, 84, 72) + MOUTH(64, 77, '#4A2E17') + '</g>'
  };
  const FACE_CHR = { '🐻': 'bear', '🐧': 'penguin', '👧': 'girl', '👦': 'boy', '🐿️': 'squirrel', '🐿': 'squirrel' };
  function character(face) {
    const k = FACE_CHR[String(face || '').trim()]; if (!k) return '';
    return '<svg class="chr c-' + k + '" viewBox="0 0 140 160" width="150" height="171" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + face + '">' + CHR[k]() + '</svg>';
  }
  global.KT2_ART = { kindOf, backdrop, tenFrameChips, character, characters: Object.keys(CHR), kinds: Object.keys(BACK) };
})(typeof window !== 'undefined' ? window : globalThis);

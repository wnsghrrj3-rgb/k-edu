/* ============================================================
 * 영어 놀이터 — 그린 그림 : 점심 가게 (음식 칸 8 + 음식·놀이 칸 8)
 *   규격·색 규칙은 content/art/art.js 머리말. 큰 면 하나는 --art-main(색 바꾸기 연출용).
 *   단어 = 펼침 Lv2 #2 · #12 의 재료. 뜻은 v3 차시의 그림 근거를 따른다(dish·plate = 접시, chop = 썰다, date = 날짜, chase = 쫓아가다).
 * ============================================================ */
(function (g) {
  'use strict';
  var A = g.PlayArt; if (!A) return;
  var INK = A.INK, SURF = A.SURF;
  var M = function (fb) { return 'var(--art-main, ' + fb + ')'; };
  var sh = function (d, o) { return '<path d="' + d + '" fill="' + INK + '" opacity="' + (o || '.1') + '"/>'; };          /* 그림자 */
  var hi = function (d, o) { return '<path d="' + d + '" fill="' + SURF + '" opacity="' + (o || '.35') + '"/>'; };        /* 빛 */

  /* ── 음식 칸(lv2-02) ── */
  A.add('fish',
    '<path d="M70 48l16-14-3 14 3 14z" fill="' + M('var(--a-fish)') + '"/>' +
    '<path d="M38 34c4-8 14-10 20-4" fill="' + M('var(--a-fish)') + '"/>' +
    '<ellipse cx="44" cy="48" rx="28" ry="17" fill="' + M('var(--a-fish)') + '"/>' +
    sh('M18 52c10 14 42 14 52 0-14 6-38 6-52 0z', '.12') +
    '<path d="M36 40c4 5 4 11 0 16" stroke="' + INK + '" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".25"/>' +
    '<circle cx="27" cy="45" r="3.2" fill="' + INK + '"/>');
  A.add('chips',
    '<path d="M31 20h7v36h-7z" fill="var(--a-gold)" transform="rotate(-9 34 38)"/>' +
    '<path d="M41 13h7v40h-7z" fill="var(--a-gold)"/>' +
    '<path d="M50 17h7v36h-7z" fill="var(--a-gold)" transform="rotate(7 53 35)"/>' +
    '<path d="M58 25h7v30h-7z" fill="var(--a-gold)" transform="rotate(14 61 40)"/>' +
    '<path d="M26 42h44l-7 42H33z" fill="' + M('var(--a-red)') + '"/>' +
    '<path d="M30 54h36l-1.5 9h-33z" fill="var(--a-cream)" opacity=".9"/>' + sh('M56 42h14l-7 42h-5z', '.1'));
  A.add('lunch',
    '<rect x="12" y="28" width="72" height="48" rx="9" fill="' + M('var(--a-wood)') + '"/>' +
    '<rect x="18" y="34" width="60" height="36" rx="5" fill="var(--a-cream)"/>' +
    '<rect x="46" y="34" width="4" height="36" fill="' + M('var(--a-wood)') + '"/>' +
    '<circle cx="32" cy="52" r="5" fill="var(--a-red)"/>' + sh('M24 40h4v2h-4zM36 44h4v2h-4zM26 60h4v2h-4zM38 62h4v2h-4z', '.2') +
    '<rect x="54" y="38" width="20" height="13" rx="4" fill="var(--a-gold)"/>' +
    '<circle cx="59" cy="61" r="6" fill="var(--a-leaf)"/><circle cx="68" cy="60" r="5.5" fill="var(--a-leaf)"/>');
  A.add('shop',
    '<rect x="18" y="36" width="60" height="46" fill="var(--a-cream)"/>' +
    '<path d="M14 36l4-14h60l4 14z" fill="' + M('var(--stage)') + '"/>' +
    '<circle cx="19.7" cy="36" r="5.7" fill="' + M('var(--stage)') + '"/><circle cx="31" cy="36" r="5.7" fill="var(--a-cream)"/><circle cx="42.3" cy="36" r="5.7" fill="' + M('var(--stage)') + '"/>' +
    '<circle cx="53.7" cy="36" r="5.7" fill="var(--a-cream)"/><circle cx="65" cy="36" r="5.7" fill="' + M('var(--stage)') + '"/><circle cx="76.3" cy="36" r="5.7" fill="var(--a-cream)"/>' +
    '<rect x="40" y="54" width="16" height="28" rx="2" fill="var(--a-wood)"/>' +
    '<rect x="23" y="50" width="13" height="13" rx="2" fill="var(--a-fish)" opacity=".7"/><rect x="60" y="50" width="13" height="13" rx="2" fill="var(--a-fish)" opacity=".7"/>' +
    sh('M18 80h60v2H18z', '.15'));
  A.add('dish',
    '<rect x="6" y="50" width="12" height="7" rx="3.5" fill="' + M('var(--stage-2)') + '"/><rect x="78" y="50" width="12" height="7" rx="3.5" fill="' + M('var(--stage-2)') + '"/>' +
    '<ellipse cx="48" cy="56" rx="36" ry="17" fill="' + M('var(--stage-2)') + '"/>' +
    '<ellipse cx="48" cy="51" rx="28" ry="10" fill="var(--a-cream)"/>' +
    '<ellipse cx="48" cy="50" rx="17" ry="5" fill="var(--a-gold)"/>' + sh('M12 58c8 14 64 14 72 0-10 8-62 8-72 0z', '.12'));
  A.add('chop',
    '<rect x="10" y="60" width="76" height="18" rx="6" fill="var(--a-wood)"/>' +
    '<circle cx="22" cy="58" r="6" fill="' + M('var(--stage)') + '"/><circle cx="34" cy="58" r="6" fill="' + M('var(--stage)') + '"/>' + sh('M18 58h8v1h-8zM30 58h8v1h-8z', '.2') +
    '<path d="M44 60l30-10c4-1 6 2 4 5l-6 5z" fill="' + M('var(--stage)') + '"/>' +
    '<path d="M40 16l32 32-7 6-31-31z" fill="var(--a-steel)"/>' + hi('M42 18l26 26-2 2-25-25z', '.6') +
    '<path d="M34 23l-10-10 6-6 10 10z" fill="' + INK + '" opacity=".8"/>');
  A.add('ham',
    '<path d="M64 64l14 14" stroke="var(--a-cream)" stroke-width="7" stroke-linecap="round"/>' +
    '<circle cx="80" cy="84" r="5" fill="var(--a-cream)"/><circle cx="86" cy="77" r="5" fill="var(--a-cream)"/>' +
    '<path d="M22 30c14-16 36-14 48 2 12 16 6 32-8 40-16 9-34 4-42-10-6-11-6-23 2-32z" fill="' + M('var(--a-red)') + '"/>' +
    '<path d="M30 38c10-10 24-9 32 1 7 9 3 19-6 24-11 6-22 3-27-6-3-7-3-14 1-19z" fill="var(--a-pink)"/>' +
    sh('M20 62c8 14 26 18 42 10-14 2-30-2-42-10z', '.12'));
  A.add('jam',
    '<rect x="24" y="20" width="48" height="14" rx="4" fill="var(--a-wood)"/>' +
    '<rect x="26" y="32" width="44" height="52" rx="11" fill="' + M('var(--a-red)') + '"/>' +
    '<rect x="32" y="48" width="32" height="22" rx="4" fill="var(--a-cream)"/>' +
    '<path d="M48 54c-5 0-7 4-6 7 1 3 4 5 6 5s5-2 6-5c1-3-1-7-6-7z" fill="' + M('var(--a-red)') + '"/><path d="M45 54l3-3 3 3" stroke="var(--a-leaf)" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
    hi('M31 38h6v30h-6z', '.3'));

  /* ── 음식·놀이 칸(lv2-12) ── */
  A.add('cake',
    '<ellipse cx="48" cy="80" rx="36" ry="6" fill="var(--a-steel)"/>' +
    '<rect x="18" y="48" width="60" height="32" rx="6" fill="' + M('var(--a-gold)') + '"/>' +
    '<rect x="18" y="61" width="60" height="6" fill="var(--a-cream)"/>' +
    '<path d="M18 54c0-8 12-11 30-11s30 3 30 11v2c-2 4-6 4-8 0-2 4-6 4-8 0-2 4-6 4-8 0-2 4-6 4-8 0-2 4-6 4-8 0-2 4-6 4-8 0-2 4-6 4-8 0z" fill="var(--a-cream)"/>' +
    '<path d="M48 32c2-6 6-9 10-10" stroke="var(--a-leaf)" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="48" cy="37" r="6.5" fill="var(--a-red)"/>');
  A.add('grape',
    '<path d="M47 30l-2-12" stroke="var(--a-wood)" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M50 26c6-12 18-14 26-6-8 8-18 10-26 6z" fill="var(--a-leaf)"/>' +
    '<circle cx="34" cy="38" r="9" fill="' + M('var(--a-plum)') + '"/><circle cx="50" cy="37" r="9" fill="' + M('var(--a-plum)') + '"/><circle cx="66" cy="38" r="9" fill="' + M('var(--a-plum)') + '"/>' +
    '<circle cx="42" cy="52" r="9" fill="' + M('var(--a-plum)') + '"/><circle cx="58" cy="52" r="9" fill="' + M('var(--a-plum)') + '"/>' +
    '<circle cx="50" cy="66" r="9" fill="' + M('var(--a-plum)') + '"/><circle cx="34" cy="62" r="8" fill="' + M('var(--a-plum)') + '"/>' +
    sh('M42 61a9 9 0 0016 0 9 9 0 01-16 0zM26 62a8 8 0 0012 4 8 8 0 01-12-4z', '.15') + hi('M30 34a3 3 0 105 0 3 3 0 00-5 0zM46 33a3 3 0 105 0 3 3 0 00-5 0z', '.4'));
  A.add('game',
    '<path d="M20 40c0-6 4-9 10-9h36c6 0 10 3 10 9l6 26c1 6-3 9-8 9-5 0-8-3-11-9H33c-3 6-6 9-11 9-5 0-9-3-8-9z" fill="' + M('var(--a-fish)') + '"/>' +
    '<rect x="25" y="45" width="15" height="5" rx="1.5" fill="' + INK + '"/><rect x="30" y="40" width="5" height="15" rx="1.5" fill="' + INK + '"/>' +
    '<circle cx="62" cy="44" r="4" fill="var(--a-red)"/><circle cx="70" cy="51" r="4" fill="var(--a-gold)"/>' +
    '<rect x="43" y="44" width="10" height="4" rx="2" fill="var(--a-cream)"/>' + sh('M14 66c1 6 8 9 14 6M82 66c-1 6-8 9-14 6', '.12'));
  A.add('race',
    '<ellipse cx="27" cy="85" rx="11" ry="3" fill="' + INK + '" opacity=".15"/>' +
    '<rect x="24" y="12" width="5" height="73" rx="2.5" fill="var(--a-wood)"/>' +
    '<path d="M29 17c14-5 27 4 41-1v32c-14 5-27-4-41 1z" fill="' + M('var(--a-cream)') + '"/>' +
    '<path d="M29 17c4.6-1.6 9-1.4 13.5 0v8c-4.5-1.4-9-1.6-13.5 0zM56 18c4.6.9 9 .6 14-2v8c-5 2-9.4 2.3-14 2zM42.5 25c4.5 1.4 9 2.4 13.5 1v8c-4.5 1.4-9 .4-13.5-1zM29 33c4.6-1.6 9-1.4 13.5 0v8c-4.5-1.4-9-1.6-13.5 0zM56 34c4.6.9 9 .6 14-2v8c-5 2-9.4 2.3-14 2zM42.5 41c4.5 1.4 9 2.4 13.5 1v6c-4.5 1.4-9 .4-13.5-1z" fill="' + INK + '"/>');
  A.add('plate',
    '<rect x="8" y="24" width="4" height="48" rx="2" fill="var(--a-steel)"/><path d="M5 24v12a5 5 0 0010 0V24" stroke="var(--a-steel)" stroke-width="3" fill="none"/>' +
    '<path d="M84 24c4 6 4 18 0 24v24h-4V24z" fill="var(--a-steel)"/>' +
    '<circle cx="48" cy="48" r="30" fill="' + M('var(--a-cream)') + '"/>' +
    '<circle cx="48" cy="48" r="21" fill="' + INK + '" opacity=".06"/>' + hi('M28 36a24 24 0 0110-10 30 30 0 00-10 10z', '.6'));
  A.add('shake',
    '<path d="M54 26l12-20 4 3-11 19z" fill="var(--a-fish)"/>' +
    '<path d="M28 34c1-12 10-14 20-13 10-1 19 1 20 13z" fill="var(--a-cream)"/><circle cx="52" cy="20" r="5" fill="var(--a-red)"/>' +
    '<path d="M28 34h40l-6 50H34z" fill="' + M('var(--a-pink)') + '"/>' +
    '<path d="M30 48h36l-1 7H31z" fill="var(--a-cream)" opacity=".85"/>' + sh('M56 34h12l-6 50h-4z', '.1'));
  A.add('date',
    '<rect x="18" y="24" width="60" height="58" rx="8" fill="' + SURF + '"/>' + sh('M18 74h60v8H18z', '.05') +
    '<path d="M18 32a8 8 0 018-8h44a8 8 0 018 8v8H18z" fill="' + M('var(--a-red)') + '"/>' +
    '<rect x="29" y="16" width="5" height="14" rx="2.5" fill="' + INK + '"/><rect x="62" y="16" width="5" height="14" rx="2.5" fill="' + INK + '"/>' +
    sh('M25 48h9v7h-9zM38 48h9v7h-9zM51 48h9v7h-9zM64 48h7v7h-7zM25 60h9v7h-9zM51 60h9v7h-9zM64 60h7v7h-7zM25 72h9v4h-9zM38 72h9v4h-9z', '.18') +
    '<rect x="38" y="60" width="9" height="7" rx="1.5" fill="' + M('var(--a-red)') + '"/>');
  A.add('chase',
    '<path d="M6 46h10M4 56h12M8 66h8" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" opacity=".25"/>' +
    /* 개 */
    '<ellipse cx="34" cy="58" rx="15" ry="10" fill="' + M('var(--a-wood)') + '"/><circle cx="48" cy="48" r="9" fill="' + M('var(--a-wood)') + '"/>' +
    '<path d="M44 42c-4-2-6 2-5 8" fill="' + INK + '" opacity=".35"/><path d="M24 66l-4 10M42 66l3 10M20 52c-5-2-8-6-8-10" stroke="' + M('var(--a-wood)') + '" stroke-width="5" stroke-linecap="round" fill="none"/>' +
    '<circle cx="51" cy="46" r="1.8" fill="' + INK + '"/>' +
    /* 고양이 */
    '<ellipse cx="70" cy="58" rx="12" ry="8" fill="var(--a-gold)"/><circle cx="82" cy="48" r="8" fill="var(--a-gold)"/>' +
    '<path d="M77 42l1-8 5 6zM84 40l5-6 1 8z" fill="var(--a-gold)"/>' +
    '<path d="M62 64l-4 10M76 64l4 10M58 56c-6-4-6-12-2-16" stroke="var(--a-gold)" stroke-width="4" stroke-linecap="round" fill="none"/>' +
    '<circle cx="85" cy="47" r="1.6" fill="' + INK + '"/>');
})(window);

/* ============================================================
   MK_CHARS — 캐릭터 자산 라이브러리 (파일 기반)
   ------------------------------------------------------------
   MK_STOCK 이 절차생성 SVG 재료라면, 이쪽은 실제 이미지 파일 자산.
   · 팩 단위로 늘린다 (첫 팩: golden — 골든리트리버 39종)
   · srcOf(id) = 정적 파일 URL (dataURL 아님 — 문서 용량 0)
   · 톤이 플랫 SVG 와 다르므로 「캐릭터」 서랍으로 분리 배치
   · 편집 능력은 kind:'image' 요소 기본값 그대로
     (이동·크기·회전·좌우반전·투명도·복제·삭제·층순서)
   ============================================================ */
window.MK_CHARS = (() => {
  'use strict';

  const BASE = '/maker-playground/assets/chars/';

  const PACKS = [
    { key: 'golden', name: '골든리트리버', dir: 'golden', ext: 'webp' },
  ];

  const CATS = ['포즈', '얼굴', '착용', '장난감', '장식'];

  const LIB = [
    { id: 'gr-dog-hero', name: '하이파이브 강아지', cat: '포즈', tags: ['강아지', '골든리트리버', '인사', '하이파이브', '환영'], w: 416, h: 720 },
    { id: 'gr-dog-run', name: '달리는 강아지', cat: '포즈', tags: ['강아지', '달리기', '점프', '신남'], w: 238, h: 345 },
    { id: 'gr-dog-glasses', name: '안경 쓴 강아지', cat: '포즈', tags: ['강아지', '안경', '박사', '똑똑'], w: 228, h: 322 },
    { id: 'gr-dog-sleep-toy', name: '인형 안고 자는 강아지', cat: '포즈', tags: ['강아지', '잠', '인형', '휴식'], w: 250, h: 183 },
    { id: 'gr-bubble-heart', name: '하트 말풍선', cat: '장식', tags: ['말풍선', '하트', '좋아요'], w: 58, h: 56 },
    { id: 'gr-dog-raincoat', name: '노란 우비 강아지', cat: '포즈', tags: ['강아지', '우비', '비', '노랑'], w: 224, h: 333 },
    { id: 'gr-dog-hiking', name: '배낭 멘 강아지', cat: '포즈', tags: ['강아지', '배낭', '소풍', '탐험'], w: 230, h: 358 },
    { id: 'gr-dog-rollover', name: '뒹구는 강아지', cat: '포즈', tags: ['강아지', '뒹굴', '장난', '배'], w: 260, h: 325 },
    { id: 'gr-face-smile', name: '웃는 얼굴', cat: '얼굴', tags: ['얼굴', '웃음', '기쁨'], w: 172, h: 162 },
    { id: 'gr-face-tongue', name: '혀 내민 얼굴', cat: '얼굴', tags: ['얼굴', '혀', '귀여움'], w: 147, h: 150 },
    { id: 'gr-face-happy', name: '활짝 웃는 얼굴', cat: '얼굴', tags: ['얼굴', '활짝', '신남'], w: 137, h: 160 },
    { id: 'gr-face-wink', name: '윙크 얼굴', cat: '얼굴', tags: ['얼굴', '윙크', '장난'], w: 127, h: 149 },
    { id: 'gr-face-sleep', name: '자는 얼굴', cat: '얼굴', tags: ['얼굴', '잠', '졸림'], w: 171, h: 137 },
    { id: 'gr-zzz', name: 'Zzz', cat: '장식', tags: ['잠', '졸림', 'Zzz'], w: 58, h: 58 },
    { id: 'gr-bandana-navy', name: '네이비 반다나', cat: '착용', tags: ['반다나', '네이비', '발자국', '스카프'], w: 134, h: 141 },
    { id: 'gr-bandana-red', name: '빨강 반다나', cat: '착용', tags: ['반다나', '빨강', '하트', '스카프'], w: 127, h: 140 },
    { id: 'gr-bandana-yellow', name: '노랑 반다나', cat: '착용', tags: ['반다나', '노랑', '오리', '스카프'], w: 131, h: 127 },
    { id: 'gr-bandana-green', name: '초록 반다나', cat: '착용', tags: ['반다나', '초록', '뼈다귀', '스카프'], w: 133, h: 131 },
    { id: 'gr-collar-blue', name: '파랑 목줄', cat: '착용', tags: ['목줄', '파랑', '목걸이'], w: 127, h: 111 },
    { id: 'gr-collar-red', name: '빨강 목줄', cat: '착용', tags: ['목줄', '빨강', '하트', '목걸이'], w: 127, h: 114 },
    { id: 'gr-cap', name: '볼캡', cat: '착용', tags: ['모자', '볼캡', '캡'], w: 146, h: 125 },
    { id: 'gr-beanie', name: '비니', cat: '착용', tags: ['모자', '비니', '겨울'], w: 140, h: 155 },
    { id: 'gr-glasses', name: '동그란 안경', cat: '착용', tags: ['안경', '동그란', '박사'], w: 135, h: 59 },
    { id: 'gr-sunhat', name: '밀짚모자', cat: '착용', tags: ['모자', '밀짚', '여름'], w: 172, h: 106 },
    { id: 'gr-bowtie', name: '나비넥타이', cat: '착용', tags: ['나비넥타이', '정장', '네이비'], w: 116, h: 73 },
    { id: 'gr-plushie', name: '강아지 인형', cat: '장난감', tags: ['인형', '강아지', '장난감'], w: 147, h: 168 },
    { id: 'gr-rope-toy', name: '로프 장난감', cat: '장난감', tags: ['로프', '장난감', '파랑'], w: 169, h: 73 },
    { id: 'gr-bone', name: '뼈다귀', cat: '장난감', tags: ['뼈다귀', '간식'], w: 116, h: 96 },
    { id: 'gr-tennis-ball', name: '테니스공', cat: '장난감', tags: ['공', '테니스', '놀이'], w: 81, h: 82 },
    { id: 'gr-bubble-hello', name: 'Hello! 말풍선', cat: '장식', tags: ['말풍선', '안녕', '인사', 'Hello'], w: 127, h: 124 },
    { id: 'gr-bubble-goodboy', name: 'Good Boy! 말풍선', cat: '장식', tags: ['말풍선', '칭찬', '잘했어', 'Good Boy'], w: 144, h: 126 },
    { id: 'gr-bubble-letsgo', name: '출발 말풍선 (Let’s Go!)', cat: '장식', tags: ['말풍선', '출발', '시작', 'Lets Go'], w: 122, h: 122 },
    { id: 'gr-bubble-heart-pink', name: '분홍 하트 말풍선', cat: '장식', tags: ['말풍선', '하트', '분홍', '좋아요'], w: 105, h: 105 },
    { id: 'gr-paw-black-1', name: '검정 발자국 1', cat: '장식', tags: ['발자국', '검정', '발바닥'], w: 75, h: 80 },
    { id: 'gr-paw-gold', name: '금색 발자국', cat: '장식', tags: ['발자국', '금색', '발바닥'], w: 61, h: 69 },
    { id: 'gr-paw-black-2', name: '검정 발자국 2', cat: '장식', tags: ['발자국', '검정', '발바닥'], w: 72, h: 73 },
    { id: 'gr-paw-black-3', name: '검정 발자국 3', cat: '장식', tags: ['발자국', '검정', '발바닥'], w: 77, h: 80 },
    { id: 'gr-sparkle', name: '반짝임', cat: '장식', tags: ['반짝', '별', '포인트'], w: 51, h: 76 },
    { id: 'gr-sparkle-sm', name: '작은 반짝임', cat: '장식', tags: ['반짝', '별', '포인트'], w: 33, h: 39 },
  ].map((x) => ({ ...x, pack: 'golden' }));

  const P = (k) => PACKS.find((p) => p.key === k) || PACKS[0];
  const get = (id) => LIB.find((x) => x.id === id) || null;

  function srcOf(id) {
    const it = get(id); if (!it) return null;
    const p = P(it.pack);
    return BASE + p.dir + '/' + it.id.replace(/^gr-/, '') + '.' + p.ext;
  }

  function search(q, cat) {
    const s = String(q || '').trim().toLowerCase();
    let out = cat ? LIB.filter((x) => x.cat === cat) : LIB.slice();
    if (!s) return out;
    return out.filter((x) => x.name.toLowerCase().includes(s) || x.cat.includes(s)
      || x.tags.some((t) => t.toLowerCase().includes(s)));
  }

  /* 기계검증 — id 중복·메타 누락·미지 카테고리 */
  function audit() {
    const bad = [], seen = new Set();
    LIB.forEach((x) => {
      if (seen.has(x.id)) bad.push(x.id + ':dup'); seen.add(x.id);
      if (!x.name || !x.tags.length) bad.push(x.id + ':meta');
      if (!CATS.includes(x.cat)) bad.push(x.id + ':cat');
      if (!(x.w > 0 && x.h > 0)) bad.push(x.id + ':size');
      if (!srcOf(x.id)) bad.push(x.id + ':src');
    });
    return { ok: !bad.length, violations: bad, count: LIB.length };
  }

  return { LIB, CATS, PACKS, get, srcOf, search, audit };
})();

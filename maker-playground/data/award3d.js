/* ============================================================
   MK_AWARD3D — R143: 케이메이커 안의 「3D 상장」 문 (2026-09-10)
   ------------------------------------------------------------
   3D 상장은 케이메이커 문서 모델(scene·element) 이 아니다.
   틀은 블렌더로 한 번 구운 mp4(/kmake/plates/), 글자만 브라우저가
   원근 맞춰 얹는 별도 화면(/kmake/plates/award/). 그래서 여기서는
   **틀을 흉내내지 않고 문만 연다** — 목록 카드·홈 칩·만들기 1단계에
   같은 문 하나. 주소에 6칸 글자를 실어 보내므로 (①케이박스 과제
   ②명단 대량 30장) 이 문 하나로 뒤에 자연스럽게 이어진다.
   외부 API 0 · 서버 0 · 새 탭(편집 중인 작업은 그대로).
   ============================================================ */
window.MK_AWARD3D = (() => {
  'use strict';
  const URL_BASE = '/kmake/plates/award/';
  const POSTER = '/kmake/plates/award-wood-warm.poster.png';
  /* 화면(plates/award/index.html)의 입력 6칸과 이름이 같다 — 한쪽만 바꾸면 test-round143 이 잡는다 */
  const FIELDS = ['title', 'cls', 'name', 'body', 'date', 'school'];
  const PLATES = [
    { id: 'award-wood-warm', name: '원목 책상 · 따뜻한 빛', ready: true },
    /* 2종째(대리석·시원) — 굽는 대로 여기에 한 줄 */
  ];

  /* 목록 카드 한 장 — TemplateCard 와 같은 껍데기(mk-tplcard)라 격자에 그대로 섞인다 */
  const CARD = Object.freeze({
    id: 'award3d', title: '3D 상장 (영상)', category: '인쇄물', contentType: 'print', ratio: '16:9',
    desc: '책상 위로 카메라가 내려오고 도장·리본이 움직이는 상장 영상 — 글자만 바꾸면 완성',
  });

  const url = (fields, plate) => {
    const q = new URLSearchParams();
    if (plate) q.set('plate', plate);
    for (const k of FIELDS) {
      const v = fields && fields[k];
      if (v != null && String(v) !== '') q.set(k, String(v));
    }
    const s = q.toString();
    return URL_BASE + (s ? '?' + s : '');
  };

  /* open — 새 탭. 팝업 차단이면 같은 탭으로 (문이 아예 안 열리는 것보다 낫다) */
  const open = (fields, plate) => {
    const u = url(fields, plate);
    let w = null;
    try { w = window.open(u, '_blank', 'noopener'); } catch (_) { w = null; }
    if (!w) { try { window.location.assign(u); } catch (_) {} }
    return u;
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cardHTML = (attrs) => `<button class="mk-tplcard mk-award3d" ${attrs || ''} aria-label="${esc(CARD.title)} 열기 (새 탭)">
      <div class="thumb"><span class="type">${esc(CARD.category)}</span><span class="airec">🎬 3D</span>
        <span class="thumbwrap" style="display:block;aspect-ratio:16/9;background:#000;overflow:hidden"><img src="${POSTER}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"></span>
      </div>
      <div class="meta"><b>${esc(CARD.title)}</b><small>${esc(CARD.desc)}</small></div>
    </button>`;

  return { URL_BASE, POSTER, FIELDS, PLATES, CARD, url, open, cardHTML };
})();

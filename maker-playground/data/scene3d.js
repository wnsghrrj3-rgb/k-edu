/* ============================================================
   MK_SCENE3D — R147: 케이메이커 안의 「3D 장면」 문 (2026-09-10)
   ------------------------------------------------------------
   블렌더로 한 번 구운 3D 틀(/kmake/plates/) 위에 브라우저가 글자·실사만
   얹는 화면들의 **목록**. 3D 상장(MK_AWARD3D, R143) 과 같은 원리이되
   상장은 「인쇄물」 갈래, 여기는 「영상」 갈래 — 학교가 지어진다(R144~146)
   가 첫 장면이고, 다음 장면(교실·강당·운동회…)은 SCENES 에 한 줄이면 문이
   같이 열린다(목록 카드·홈 칩·만들기 1단계). 문서 모델 밖 — 틀을 흉내내지
   않고 문만 연다. 외부 API 0 · 서버 0 · 새 탭.
   ============================================================ */
window.MK_SCENE3D = (() => {
  'use strict';
  /* 장면 한 줄 = 화면 주소 + 포스터 + 주소에 실을 칸 이름(그 화면의 입력 id 와 1:1 — test-round147 이 잡는다) */
  const SCENES = [
    {
      id: 'school', title: '학교가 지어진다 (영상)', ico: '🏫', category: '영상', contentType: 'video', ratio: '16:9',
      desc: '빈 운동장에 우리 학교가 순서대로 올라오고 끝에 실사로 녹아드는 학교 소개 영상 — 이름·한 줄만 바꾸면 완성',
      url: '/kmake/plates/school/', poster: '/kmake/plates/school-build.poster.png', fields: ['school', 'sub', 'plate'],
    },
  ];
  const get = (id) => SCENES.find((s) => s.id === id) || SCENES[0];

  const url = (id, fields) => {
    const s = get(id);
    const q = new URLSearchParams();
    for (const k of s.fields) {
      const v = fields && fields[k];
      if (v != null && String(v) !== '') q.set(k, String(v));
    }
    const qs = q.toString();
    return s.url + (qs ? '?' + qs : '');
  };
  const open = (id, fields) => {
    const u = url(id, fields);
    let w = null;
    try { w = window.open(u, '_blank', 'noopener'); } catch (_) { w = null; }
    if (!w) { try { window.location.assign(u); } catch (_) {} }
    return u;
  };

  const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* 목록 카드 — TemplateCard 와 같은 껍데기(mk-tplcard) */
  const cardHTML = (id, attrs) => {
    const s = get(id);
    return `<button class="mk-tplcard mk-scene3d" ${attrs || ''} data-scene3d="${esc(s.id)}" aria-label="${esc(s.title)} 열기 (새 탭)">
      <div class="thumb"><span class="type">${esc(s.category)}</span><span class="airec">🎬 3D</span>
        <span class="thumbwrap" style="display:block;aspect-ratio:16/9;background:#000;overflow:hidden"><img src="${esc(s.poster)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"></span>
      </div>
      <div class="meta"><b>${esc(s.title)}</b><small>${esc(s.desc)}</small></div>
    </button>`;
  };
  /* 어느 화면이든: 카드·칩·종류 버튼에 data-scene3d="<id>" 만 두면 이 한 줄이 문을 단다 */
  const wire = (root) => root.querySelectorAll('[data-scene3d]').forEach((b) => { b.onclick = () => API.open(b.dataset.scene3d); });   /* API 경유 — 바꿔 끼울 수 있게(테스트·후속) */
  /* 갈래(contentType) 에 속한 장면 카드들 */
  const cardsFor = (cat, attrs) => SCENES.filter((s) => cat === 'all' || s.contentType === cat).map((s) => cardHTML(s.id, attrs)).join('');

  const API = { SCENES, get, url, open, cardHTML, cardsFor, wire };
  return API;
})();

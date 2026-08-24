/* ============================================================
   케이파크 공용 놀이 방법 안내 (kpark_guide.js)
   ------------------------------------------------------------
   사용: 페이지에서 window.KPARK_GUIDE 정의 후 이 스크립트 로드.
   window.KPARK_GUIDE = {
     key:   'marblerun',          // localStorage 키 (게임 고유)
     title: '🌀 마블런',           // 카드 제목
     tag:   '한 줄 소개',          // 제목 아래 소개 (선택)
     steps: [ { em:'🎲', tx:'설명 <b>강조</b> 가능' }, ... ],
     ok:    '알겠어! 시작하자'      // 버튼 문구 (선택)
   };
   동작: 첫 방문 자동 표시 + 좌하단 ❓ 버튼으로 언제든 다시 보기.
   ============================================================ */
(function () {
  'use strict';
  var G = window.KPARK_GUIDE;
  if (!G || !G.key || !G.steps) return;

  var LS = 'kpark.' + G.key + '.howto';

  function build() {
    if (document.getElementById('kpkGuide')) return;

    var st = document.createElement('style');
    st.textContent =
      '#kpkGuide{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:120;background:rgba(4,6,18,.76);backdrop-filter:blur(3px)}' +
      '#kpkGuide.on{display:flex}' +
      '#kpkGuide .gcard{background:#141a33;border:2px solid #ffd35c;border-radius:22px;padding:26px 24px 22px;max-width:min(480px,92vw);max-height:86vh;overflow-y:auto;box-shadow:0 0 60px rgba(255,211,92,.25);animation:kpkPop .38s cubic-bezier(.2,.85,.3,1.15)}' +
      '@keyframes kpkPop{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}' +
      '#kpkGuide h2{font-size:22px;color:#ffd35c;margin:0 0 4px;text-align:center}' +
      '#kpkGuide .gtag{font-size:13px;color:#aeb6d8;text-align:center;margin:0 0 14px}' +
      '#kpkGuide .gstep{display:flex;gap:10px;align-items:flex-start;margin:0 0 11px;font-size:14px;line-height:1.65;color:#e8ecff}' +
      '#kpkGuide .gstep .gem{font-size:19px;flex:none;margin-top:1px}' +
      '#kpkGuide .gstep b{color:#ffd35c}' +
      '#kpkGuide .gok{display:block;width:100%;margin-top:16px;padding:13px 0;border:0;border-radius:14px;background:linear-gradient(135deg,#ffd35c,#ffb02e);color:#2a1d00;font-size:16px;font-weight:800;cursor:pointer;font-family:inherit}' +
      '#kpkGuide .gok:active{transform:scale(.97)}' +
      '#kpkHowBtn{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:110;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,211,92,.5);background:rgba(20,26,51,.85);color:#ffd35c;font-size:19px;cursor:pointer;box-shadow:0 2px 12px rgba(0,0,0,.4)}' +
      '#kpkHowBtn:active{transform:scale(.92)}';
    document.head.appendChild(st);

    var ov = document.createElement('div');
    ov.id = 'kpkGuide';
    var html = '<div class="gcard"><h2>' + G.title + '</h2>';
    if (G.tag) html += '<p class="gtag">' + G.tag + '</p>';
    for (var i = 0; i < G.steps.length; i++) {
      html += '<div class="gstep"><span class="gem">' + (G.steps[i].em || '•') + '</span><span>' + G.steps[i].tx + '</span></div>';
    }
    html += '<button class="gok" id="kpkGuideOk">' + (G.ok || '알겠어! 시작하자') + '</button></div>';
    ov.innerHTML = html;
    document.body.appendChild(ov);

    var btn = document.createElement('button');
    btn.id = 'kpkHowBtn';
    btn.title = '놀이 방법';
    btn.textContent = '❓';
    document.body.appendChild(btn);

    function show() { ov.classList.add('on'); }
    function hide() {
      ov.classList.remove('on');
      try { localStorage.setItem(LS, '1'); } catch (e) { }
    }
    btn.onclick = show;
    document.getElementById('kpkGuideOk').onclick = hide;
    ov.addEventListener('click', function (e) { if (e.target === ov) hide(); });

    var seen = null;
    try { seen = localStorage.getItem(LS); } catch (e) { }
    if (!seen) setTimeout(show, 550);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();

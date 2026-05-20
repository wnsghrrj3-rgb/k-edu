/* =====================================================
 * K-edu Components — 단일 진입점
 *
 * 사용:
 *   <script src="/kedu/components/index.js" defer></script>
 *
 * 부품 추가 시 본 파일에 한 줄 import만 추가.
 * ===================================================== */

(function () {
  'use strict';

  // 현재 스크립트가 위치한 디렉터리를 기준으로 부품을 로드.
  // (페이지 경로와 무관하게 동작)
  function currentDir() {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = scripts[i].src;
      if (src && /\/kedu\/components\/index\.js(\?|$)/.test(src)) {
        return src.replace(/index\.js(\?.*)?$/, '');
      }
    }
    // fallback — 기본 경로
    return '/kedu/components/';
  }

  const BASE = currentDir();
  const PARTS = [
    'kedu-ten-frame.js',
    'kedu-linking-cube.js',
    'kedu-compare-picker.js',
    'kedu-number-path.js',
    'kedu-sequence-arrange.js'
    // 부품 추가 시 본 배열에 한 줄.
  ];

  function loadPart(name) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = BASE + name;
      s.defer = true;
      s.dataset.keduPart = name;
      s.onload = () => resolve(name);
      s.onerror = () => reject(new Error('kedu component load failed: ' + name));
      document.head.appendChild(s);
    });
  }

  // 중복 로드 방지
  if (window.__keduComponentsLoaded) return;
  window.__keduComponentsLoaded = true;

  Promise.all(PARTS.map(loadPart))
    .then(() => {
      window.dispatchEvent(new CustomEvent('kedu-components-ready', {
        detail: { parts: PARTS }
      }));
    })
    .catch(err => {
      console.error('[kedu-components]', err);
    });
})();

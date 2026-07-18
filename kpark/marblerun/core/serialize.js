/* 케이파크 · 마블런 — serialize.js
 * 트랙 JSON 직렬화. M0: 버전 스탬프 + 검증 로드. (공유 코드 압축은 M4)
 */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  root.MarbleSim = Object.assign(root.MarbleSim || {}, mod);
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const FORMAT = 'kpark-marblerun';
  const VERSION = 1;

  function saveTrack(name, pieces) {
    return JSON.stringify({ format: FORMAT, version: VERSION, name: name || '이름 없는 트랙', pieces }, null, 0);
  }

  function loadTrack(json) {
    const d = typeof json === 'string' ? JSON.parse(json) : json;
    if (d.format !== FORMAT) throw new Error('마블런 트랙 파일이 아님');
    if (d.version > VERSION) throw new Error('상위 버전 트랙 (v' + d.version + ')');
    if (!Array.isArray(d.pieces)) throw new Error('pieces 배열 없음');
    return { name: d.name, pieces: d.pieces };
  }

  return { serialize: { FORMAT, VERSION, saveTrack, loadTrack } };
});

/* 케이파크 · 마블런 — serialize.js
 * M0: 트랙 JSON 직렬화 (saveTrack/loadTrack).
 * M4: 🔗 공유 코드 — 빌더 상태 {startH, seq}를 짧은 문자 코드로.
 *     "내 트랙 코드 줄게, 너도 돌려봐" = 동아리 문화의 씨앗.
 *
 * 코드 형식:  K1<시작높이><몸통>.<체크섬2>
 *   부품 1글자:  S직선 L커브좌 R커브우 D경사 G골 H언덕 O루프 Y자이로
 *               J점프 B부스터 Z지그재그 C대포 T트램펄린 U리프터
 *   갈림길:     스위치 (왼길|오른길)   신호기 [왼길|오른길]
 *   합류:       (왼길|오른길>꼬리)  — 꼬리 속 갈림길 재귀 허용
 *   체크섬:     djb2 해시 → base36 두 글자 (오타·훼손 감지)
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

  // ---- M4 공유 코드 ----

  const P2C = {
    straight: 'S', curve_l: 'L', curve_r: 'R', slope: 'D', goal: 'G',
    hill: 'H', loop: 'O', gyro: 'Y', jump: 'J', booster: 'B', zigzag: 'Z',
    cannon: 'C', trampoline: 'T', lifter: 'U',
    racegate: 'F', domino: 'M', orgol: 'Q',
  };
  // 🎨 색 게이트: 'A' + 색 숫자 (1=🔵 2=🩷 3=🟡)
  const C2P = {};
  for (const k in P2C) C2P[P2C[k]] = k;

  function hash2(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
    return (h % 1296).toString(36).padStart(2, '0'); // 36² = 1296
  }

  function encodeSeq(seq) {
    let out = '';
    for (const item of seq || []) {
      if (typeof item === 'string') {
        const ch = P2C[item];
        if (!ch) throw new Error('코드로 만들 수 없는 부품: ' + item);
        out += ch;
      } else if (item && item.type === 'colorgate') {
        out += 'A' + (((item.color || 0) % 3) + 1);
      } else if (item && (item.type === 'switch' || item.type === 'splitter')) {
        const open = item.type === 'switch' ? '(' : '[';
        const close = item.type === 'switch' ? ')' : ']';
        out += open + encodeSeq(item.left) + '|' + encodeSeq(item.right);
        if (item.merged) out += '>' + encodeSeq(item.tail);
        out += close;
      } else {
        throw new Error('알 수 없는 시퀀스 항목');
      }
    }
    return out;
  }

  function encodeCode(state) {
    if (!state || typeof state.startH !== 'number') throw new Error('시작 높이 없음');
    if (state.startH < 1 || state.startH > 9) throw new Error('시작 높이 범위 밖');
    const payload = 'K' + VERSION + state.startH + encodeSeq(state.seq || []);
    return payload + '.' + hash2(payload);
  }

  function decodeCode(code) {
    const raw = String(code || '').trim().toUpperCase().replace(/\s+/g, '');
    const dot = raw.lastIndexOf('.');
    if (dot < 0) throw new Error('체크섬이 없어 — 코드 전체를 복사했는지 확인해봐');
    const payload = raw.slice(0, dot);
    const sum = raw.slice(dot + 1).toLowerCase();
    if (hash2(payload) !== sum) throw new Error('코드가 손상됐어 — 빠진 글자가 없는지 확인해봐');
    if (payload[0] !== 'K') throw new Error('마블런 트랙 코드가 아니야');
    const ver = parseInt(payload[1], 10);
    if (!(ver >= 1)) throw new Error('버전을 읽을 수 없어');
    if (ver > VERSION) throw new Error('더 새로운 버전의 코드야 (v' + ver + ')');
    const startH = parseInt(payload[2], 10);
    if (!(startH >= 1 && startH <= 9)) throw new Error('시작 높이를 읽을 수 없어');

    let i = 3;
    function parseSeq(stopChars) {
      const seq = [];
      while (i < payload.length) {
        const ch = payload[i];
        if (stopChars.indexOf(ch) >= 0) return seq;
        i++;
        if (ch === 'A') {
          const d = parseInt(payload[i], 10);
          if (!(d >= 1 && d <= 3)) throw new Error('색 게이트의 색을 읽을 수 없어');
          i++;
          seq.push({ type: 'colorgate', color: d - 1 });
          continue;
        }
        if (C2P[ch]) { seq.push(C2P[ch]); continue; }
        if (ch === '(' || ch === '[') {
          const type = ch === '(' ? 'switch' : 'splitter';
          const close = ch === '(' ? ')' : ']';
          const left = parseSeq('|');
          if (payload[i] !== '|') throw new Error('갈림길에 | 가 없어');
          i++;
          const right = parseSeq('>' + close);
          const node = { type, left, right };
          if (payload[i] === '>') {
            i++;
            node.merged = true;
            node.tail = parseSeq(close);
          }
          if (payload[i] !== close) throw new Error('갈림길 괄호가 안 닫혔어');
          i++;
          seq.push(node);
          continue;
        }
        throw new Error('모르는 글자야: ' + ch);
      }
      return seq;
    }
    const seq = parseSeq('');
    if (i !== payload.length) throw new Error('코드 끝이 이상해');
    return { startH, seq };
  }

  return { serialize: { FORMAT, VERSION, saveTrack, loadTrack, encodeCode, decodeCode } };
});

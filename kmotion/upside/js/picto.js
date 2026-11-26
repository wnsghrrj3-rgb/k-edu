// K-MOTION 거꾸로 나라 · 동작 그림(힌트·명령 안내)
// 학생이 거울을 보듯 그린다: 그림의 왼쪽 = 학생의 왼쪽. 움직이는 부분은 노랗게.
const HL = '#ffd166', BODY = '#7fe3ff', SK = '#ffd9bf', LINE = '#1d2a4a';
export const PICTO_LABEL = { stand: '바르게 서기', armL: '내 왼팔 들기', armR: '내 오른팔 들기', spread: '크게 펼치기', crouch: '몸 웅크리기', moveL: '내 왼쪽으로 가기', moveR: '내 오른쪽으로 가기',
  tiltL: '고개를 왼쪽으로', bothUp: '두 손 번쩍', tiltR: '고개를 오른쪽으로', walk: '제자리 걷기', still: '가만히 멈추기', up: '몸 일으키기' };

export function picto(kind, { size = 150, label = true } = {}){
  const arm = (x1, y1, x2, y2, hl) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${hl ? HL : BODY}" stroke-width="13" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="8" fill="${SK}"/>`;
  const leg = (x1, y1, x2, y2, hl) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${hl ? HL : '#5b74c9'}" stroke-width="14" stroke-linecap="round"/>`;
  let cx = 80, top = 26, tilt = 0, crouch = 0, extra = '', aL = [56, 64, 46, 104], aR = [104, 64, 114, 104], lL = [70, 112, 64, 146], lR = [90, 112, 96, 146], hl = {};
  switch (kind) {
    case 'armL': aL = [56, 64, 34, 22]; hl.aL = 1; break;
    case 'armR': aR = [104, 64, 126, 22]; hl.aR = 1; break;
    case 'spread': aL = [56, 64, 14, 46]; aR = [104, 64, 146, 46]; lL = [70, 112, 48, 146]; lR = [90, 112, 112, 146]; hl = { aL: 1, aR: 1, lL: 1, lR: 1 }; break;
    case 'crouch': crouch = 34; aL = [58, 64, 72, 92]; aR = [102, 64, 88, 92]; lL = [0, 0, 0, 0]; lR = [0, 0, 0, 0]; hl = { aL: 1, aR: 1 };
      extra = `<path d="M70 132 L56 140 L66 152 M90 132 L104 140 L94 152" stroke="${HL}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`; break;
    case 'up': aL = [56, 64, 44, 30]; aR = [104, 64, 116, 30]; extra = arrowSvg(80, 22, 'up'); top = 30; break;
    case 'bothUp': aL = [56, 64, 50, 18]; aR = [104, 64, 110, 18]; hl = { aL: 1, aR: 1 }; break;
    case 'moveL': cx = 92; extra = arrowSvg(30, 80, 'left'); break;
    case 'moveR': cx = 68; extra = arrowSvg(130, 80, 'right'); break;
    case 'tiltL': tilt = -22; break;
    case 'tiltR': tilt = 22; break;
    case 'walk': lL = [70, 112, 60, 132]; lR = [90, 112, 94, 148]; aL = [56, 64, 42, 92]; aR = [104, 64, 116, 98]; hl = { lL: 1, lR: 1 }; extra = `<text x="128" y="40" font-size="26">🎵</text>`; break;
    case 'still': extra = `<text x="118" y="36" font-size="30">✋</text><circle cx="80" cy="80" r="74" fill="none" stroke="${HL}" stroke-width="4" stroke-dasharray="8 8"/>`; break;
  }
  const dx = cx - 80, oy = crouch;
  const sh = (p) => [p[0] + dx, p[1] + oy, p[2] + dx, p[3] + oy];
  const L = sh(aL), R = sh(aR), LL = sh(lL).map((v, i) => i % 2 ? v - oy : v), RR = sh(lR).map((v, i) => i % 2 ? v - oy : v);
  const headY = top + 12 + oy;
  const svg = `<svg viewBox="0 0 160 160" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="80" cy="80" r="76" fill="rgba(20,16,60,.55)"/>
    ${extra}
    ${kind === 'crouch' ? '' : leg(...LL, hl.lL) + leg(...RR, hl.lR)}
    <rect x="${58 + dx}" y="${56 + oy}" width="44" height="${kind === 'crouch' ? 42 : 60}" rx="16" fill="${BODY}" stroke="${LINE}" stroke-width="2"/>
    ${arm(...L, hl.aL)}${arm(...R, hl.aR)}
    <g transform="rotate(${tilt} ${80 + dx} ${headY + 20})"><circle cx="${80 + dx}" cy="${headY}" r="20" fill="${SK}" stroke="${tilt ? HL : LINE}" stroke-width="${tilt ? 4 : 2}"/>
    <circle cx="${73 + dx}" cy="${headY - 2}" r="2.6" fill="${LINE}"/><circle cx="${87 + dx}" cy="${headY - 2}" r="2.6" fill="${LINE}"/><path d="M${73 + dx} ${headY + 7} Q${80 + dx} ${headY + 12} ${87 + dx} ${headY + 7}" stroke="${LINE}" stroke-width="2" fill="none"/></g>
    <text x="14" y="154" font-size="13" fill="#bcd" font-weight="700">왼</text><text x="132" y="154" font-size="13" fill="#bcd" font-weight="700">오</text>
  </svg>`;
  return `<div class="picto">${svg}${label ? `<b>${PICTO_LABEL[kind] || ''}</b>` : ''}</div>`;
}
function arrowSvg(x, y, dir){ const r = { left: 180, right: 0, up: -90 }[dir]; return `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-16 -9 L4 -9 L4 -19 L22 0 L4 19 L4 9 L-16 9 Z" fill="${HL}" stroke="${LINE}" stroke-width="2"/></g>`; }

/* 로컬 @font-face CSS (구글 폰트 링크 대체 — 헤드리스에 실제 글꼴을 준다) */
import fs from 'fs';
const P = 'http://127.0.0.1:8913/maker-playground/node_modules/';
const face = (fam, w, file, style = 'normal') => `@font-face{font-family:'${fam}';font-style:${style};font-weight:${w};font-display:block;src:url(${P}${file}) format('woff')}`;
let css = '';
for (const w of [300, 400, 500, 600, 700]) { css += face('Cormorant Garamond', w, `@fontsource/cormorant-garamond/files/cormorant-garamond-latin-${w}-normal.woff`); css += face('Cormorant Garamond', w, `@fontsource/cormorant-garamond/files/cormorant-garamond-latin-${w}-italic.woff`, 'italic'); }
const dir = 'node_modules/@fontsource/noto-sans-kr/files/';
for (const sub of ['korean', 'latin']) for (const w of [400, 700]) css += face('Noto Sans KR', w, `@fontsource/noto-sans-kr/files/noto-sans-kr-${sub}-${w}-normal.woff`);
for (const [w, n] of [[400, 'Regular'], [700, 'Bold'], [500, 'Medium'], [600, 'SemiBold']]) css += face('Pretendard', w, `pretendard/dist/web/static/woff/Pretendard-${n}.woff`);
export default css;

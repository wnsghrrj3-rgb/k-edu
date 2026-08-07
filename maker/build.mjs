/* ============================================================
   maker/build.mjs — /maker 제품 진입 페이지 생성기 (R77)
   원리: 플레이그라운드 index.html 을 읽어 ① 제품 깃발 선주입
   ② 자산 경로를 ../maker-playground/ 로 보정 ③ 제품 브랜딩 교체
   만 수행해 정적 maker/index.html 로 굳힌다.
   정적이므로 DOMContentLoaded 가 원래 순서로 발화 — 부트 의미론이
   플레이그라운드와 완전 동일하다(런타임 조립의 이벤트 유실 없음).
   드리프트 방지: test-round77 이 이 변환을 재실행해 커밋본과
   비교한다. 플레이그라운드 index.html 변경 후엔
   `node maker/build.mjs` 를 다시 실행해 함께 커밋할 것.
   ============================================================ */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export function transform(html) {
  let out = html;
  /* ① 제품 브랜딩 */
  out = out.replace('<title>K-MAKER Design Playground</title>', '<title>케이메이커 — K-Maker</title>');
  out = out.replace('K-MAKER<small>Design Playground v0.1</small>', 'K-MAKER<small>케이메이커</small>');
  out = out.replace(/<div class="pg-nav-foot">[\s\S]*?<\/div>/, '<div class="pg-nav-foot">K-edu · 완전 무료</div>');
  /* ② 상대 자산 경로 보정 — http(s)·프로토콜상대·절대·data: 는 제외 */
  out = out.replace(/(src|href)="(?!https?:\/\/|\/\/|\/|data:|#)([^"]+)"/g, '$1="../maker-playground/$2"');
  /* ③ 제품 깃발 — 모든 스크립트보다 먼저 */
  out = out.replace('<script src=', '<script>window.MK_PRODUCT = true; /* R77 제품 진입 — app.js 가 검수 화면을 차단 */</script>\n<script src=');
  return out;
}

/* 직접 실행일 때만 생성 — 테스트의 import 는 부작용 없음 */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const src = fs.readFileSync(path.join(HERE, '..', 'maker-playground', 'index.html'), 'utf8');
  fs.writeFileSync(path.join(HERE, 'index.html'), transform(src));
  console.log('maker/index.html 생성 완료');
}

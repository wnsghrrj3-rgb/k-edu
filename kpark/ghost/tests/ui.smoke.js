/* 🏚️ 유령의 집 · UI 스모크 — jsdom + 스텁 무대 + 실제 core
 * 실행: NODE_PATH=<jsdom 위치> node tests/ui.smoke.js */
'use strict';
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');

let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } }

const base = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
const coreSrc = fs.readFileSync(path.join(base, 'core.js'), 'utf8');

const modSrc = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1]
  .replace(/import \* as THREE from 'three';/, '')
  .replace(/import \{[^}]*\} from '\.\/stage\/scene3d\.js';/, '')
  .replace(/import \{[^}]*\} from '\.\/stage\/fx\.js';/, '');

const domHtml = html
  .replace(/<script type="importmap">[\s\S]*?<\/script>/, '')
  .replace(/<script type="module">[\s\S]*?<\/script>/, '')
  .replace(/<script src="[^"]*"><\/script>/g, '');

const STUB = `
class V3 {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  clone(){return new V3(this.x,this.y,this.z);}
  copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  lerpVectors(a,b,k){this.x=a.x+(b.x-a.x)*k;this.y=a.y+(b.y-a.y)*k;this.z=a.z+(b.z-a.z)*k;return this;}
  distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}
  addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;}
}
const THREE = { Vector3: V3 };
const PLANE_Z = -1.2;
const mkGrp = () => ({ position:new V3(), scale:{x:1,y:1,z:1,setScalar(){}}, visible:false, userData:{} });
function createStage(){ return {
  renderer:{ render(){} }, scene:{ add(){}, remove(){} },
  camera:{ position:new V3(0,1.4,3.4), fov:52, updateProjectionMatrix(){} },
  resize(){}
}; }
function buildRoom(){ return { group:{}, dust:{} }; }
function makeGhost(){ return { group: mkGrp(), set(){}, }; }
function makeFlashlight(){ return { update(){} }; }
function makeLantern(){ return { group: mkGrp(), pulse(){} }; }
const snd = new Proxy({}, { get: () => () => {} });
function createSparkles(){ return { burst(){}, trail(){}, update(){} }; }
function domConfetti(){}
`;

(async () => {
  const dom = new JSDOM(domHtml, {
    runScripts: 'dangerously', pretendToBeVisual: true,
    url: 'https://keduclass.com/kpark/ghost/'
  });
  const w = dom.window, d = w.document;
  let err = null;
  w.addEventListener('error', e => { err = e.message; });

  w.eval(coreSrc);
  ok(!!w.KGhostCore, 'core.js 로드');
  try { w.eval(STUB + modSrc); } catch (e) { err = e.message; }
  ok(!err, '스텁 무대로 모듈 초기화 (오류: ' + (err || '없음') + ')');

  /* 타이틀 */
  ok(d.getElementById('title').style.display !== 'none', '타이틀이 보인다');
  ok(d.querySelectorAll('.rcard').length === 5, '방 카드 5장');
  ok(d.querySelectorAll('#shelfFriends .p').length === 5, '진열대 친구 자리 5칸');
  ok(!!w.__KG, '디버그 훅 존재');

  /* 방 입장 */
  w.__KG.startRoom(0);
  ok(d.getElementById('title').style.display === 'none', '입장하면 타이틀이 사라진다');
  ok(d.getElementById('hud').style.display === 'flex', 'HUD 표시');
  ok(d.getElementById('riNm').textContent.includes('현관 로비'), '방 이름 표시');
  ok(d.getElementById('total').textContent === '3', '유령 3 표시');
  ok(d.getElementById('howto').style.display === 'flex', '첫 방문 놀이 방법');
  d.getElementById('btnHowOk').click();
  ok(d.getElementById('howto').style.display === 'none', '놀이 방법 닫힘');

  ok(d.querySelectorAll('.ring').length === 3, '캡처 링 3개 생성');

  /* 졸음유령 캡처 (코어 직접 전진) */
  const g0 = w.__KG.world.ghosts[0];
  w.__KG.advance(2.0, { x: g0.x, y: g0.y, on: true });
  ok(g0.state === 'captured', '졸음유령 친구가 됐다');
  ok(d.getElementById('caught').textContent === '1', '랜턴 카운트 1');

  /* 남은 둘도 봇처럼 캡처 → 클리어 */
  for (let s = 0; s < 300 && !w.__KG.world.done; s++) {
    const vis = w.__KG.world.ghosts.filter(g => g.state === 'peek');
    if (vis.length && !w.__KG.world.battDead && w.__KG.world.batt > 0.06) {
      vis.sort((a, b) => b.meter - a.meter);
      w.__KG.advance(0.2, { x: vis[0].x, y: vis[0].y, on: true });
    } else w.__KG.advance(0.2, { x: 0, y: 0, on: false });
  }
  ok(w.__KG.world.done && w.__KG.world.result.clear, '방 클리어');
  await new Promise(r => setTimeout(r, 1400));
  ok(d.getElementById('result').style.display === 'flex', '결과 오버레이 표시');
  ok(d.getElementById('rDetail').textContent.includes('졸음유령'), '결과에 친구 이름');
  ok(d.getElementById('rMedal').textContent !== '💨', '메달 획득');

  /* 한 번 더 → 새 판 */
  d.getElementById('btnRetry').click();
  ok(w.__KG.world.caught === 0 && !w.__KG.world.done, '한 번 더 = 새 판');

  /* 다음 방 이동 */
  w.__KG.advance(0.1, { x: 9, y: 9, on: false });
  d.getElementById('btnBack').click();
  ok(d.getElementById('title').style.display === 'flex', '타이틀 복귀');
  ok(d.querySelector('#shelfFriends .p:not(.empty)'), '진열대에 친구 걸림');
  ok(d.querySelector('.rcard .medal').textContent !== '', '카드에 메달 표시');

  /* 시간 초과 흐름 */
  w.__KG.startRoom(1);
  w.__KG.advance(61, { x: 9, y: 9, on: false });
  ok(w.__KG.world.done && !w.__KG.world.result.clear, '시간 초과 종료');
  await new Promise(r => setTimeout(r, 1000));
  ok(d.getElementById('rTitle').textContent.includes('시간'), '시간 초과 안내');
  d.getElementById('btnTitle').click();
  ok(d.getElementById('title').style.display === 'flex', '목록 복귀');

  ok(!err, '전 과정 스크립트 오류 없음' + (err ? ' — ' + err : ''));
  dom.window.close();
  console.log('\n스모크: ' + pass + ' 통과 / ' + fail + ' 실패');
  process.exit(fail ? 1 : 0);
})();

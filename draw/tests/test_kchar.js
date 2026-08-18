/* ============================================================
   test_kchar.js — 캐릭터 리그 코어(KChar) 검산 (node-canvas 실렌더)
   ============================================================ */
const fs=require('fs'),path=require('path');
const {createCanvas}=require('canvas');
const w={};
new Function('window',fs.readFileSync(path.join(__dirname,'..','..','labs','kchar-core.js'),'utf8'))(w);
const K=w.KChar;
let pass=0,fail=0;
const t=(n,c)=>{if(c){pass++;console.log('  ✓ '+n)}else{fail++;console.log('  ✗ '+n)}};

console.log('[1] 캐릭터 명단');
t('9종', K.CHARS.length===9);
t('id 유일·이름·이모지·역할', new Set(K.CHARS.map(c=>c.id)).size===9 && K.CHARS.every(c=>c.name&&c.emoji&&c.role));
t('findChar 왕복', K.CHARS.every(c=>K.findChar(c.id)===c) && K.findChar('없음')===null);

function render(id,pose){const c=createCanvas(900,620);K.draw(c.getContext('2d'),id,Object.assign({x:450,y:560,s:0.9},pose));return c.toBuffer('raw')}
const ink=b=>{let n=0;for(let p=3;p<b.length;p+=4*89)if(b[p]>8)n++;return n};

console.log('[2] 실렌더 — 전 캐릭터 × 전 무드');
const MOODS=['base','joy','wow','sleep'];
let okInk=true, okMood=true, okDet=true;
for(const c of K.CHARS){
  let prev=null;
  for(const m of MOODS){
    const a=render(c.id,{mood:m});
    if(ink(a)<30){okInk=false;console.log('    ⚠ 희박:',c.id,m)}
    if(!a.equals(render(c.id,{mood:m}))){okDet=false;console.log('    ⚠ 비결정:',c.id,m)}
    if(prev&&a.equals(prev)){okMood=false;console.log('    ⚠ 무드 무변화:',c.id,m)}
    prev=a;
  }
}
t('모든 캐릭터×무드에 그림', okInk);
t('무드가 그림을 바꿈', okMood);
t('결정적', okDet);

console.log('[3] 리그 파라미터가 실제로 움직임');
t('팔 각도 (문어 제외 — 팔 없음)', K.CHARS.filter(c=>c.id!=='mundol').every(c=>!render(c.id,{}).equals(render(c.id,{armR:2}))));
t('문어는 다리 물결(tail)', !render('mundol',{}).equals(render('mundol',{tail:1})));
t('점프', K.CHARS.every(c=>!render(c.id,{}).equals(render(c.id,{jump:120}))));
t('기울기', K.CHARS.every(c=>!render(c.id,{}).equals(render(c.id,{tilt:0.2}))));
t('없는 캐릭터 = false·무출력', (()=>{const c=createCanvas(90,62);return K.draw(c.getContext('2d'),'ghost',{})===false})());

console.log('[4] 캐릭터 간 상이 (전부 다른 그림)');
const bases=K.CHARS.map(c=>render(c.id,{}));
let distinct=true;
for(let i=0;i<bases.length;i++)for(let j=i+1;j<bases.length;j++)if(bases[i].equals(bases[j]))distinct=false;
t('9종 전부 서로 다름', distinct);

console.log('\n전체 통과 '+pass+'/'+(pass+fail));
process.exit(fail?1:0);

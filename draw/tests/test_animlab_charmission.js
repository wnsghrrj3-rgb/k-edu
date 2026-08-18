/* 애니 공방 — 캐릭터 미션 승격(24차) 순수 로직 검산
   ① 캐릭터 미션 3종(학년별 1) 데이터 무결
   ② 본보기 다리 — 장수 정합이라 👻 고스트가 장마다 정확한 포즈
   ③ 🎭 듀엣 노출 + duetJumpFrame(한 장 고치러 가기) 클램프
   ④ node-canvas 실렌더 — 고스트 대상 장이 실제로 그려지고 서로 다른가 */
const fs=require('fs'), path=require('path'), vm=require('vm');
const {createCanvas}=require('canvas');
const html=fs.readFileSync(path.join(__dirname,'..','..','labs','animlab.html'),'utf8');
const kchar=fs.readFileSync(path.join(__dirname,'..','..','labs','kchar-core.js'),'utf8');
const m=html.match(/<script id="animlab-logic">([\s\S]*?)<\/script>/);
if(!m){ console.error('animlab-logic 블록 없음'); process.exit(1); }
const ctx={ window:{} }; ctx.window=ctx; vm.createContext(ctx);
vm.runInContext(kchar,ctx); vm.runInContext(m[1],ctx);
const L=ctx.AnimLab;
let pass=0,fail=0;
const t=(n,c)=>{ if(c){pass++;console.log('  ✓ '+n)} else {fail++;console.log('  ✗ '+n)} };

/* ① 캐릭터 미션 3종 — 학년별 1개, guides 장수 일치 */
const CM=L.MISSIONS.filter(M=>M.char);
t('캐릭터 미션 = 정확히 3종', CM.length===3);
t('학년 분포 1-2·3-4·5-6 각 1', ['1-2','3-4','5-6'].every(g=>CM.filter(M=>M.grade===g).length===1));
t('guides 길이 = frames (3종 전부)', CM.every(M=>Array.isArray(M.guides)&&M.guides.length===M.frames));
t('fps 전부 2~12 범위', CM.every(M=>M.fps>=2&&M.fps<=12));
t('학년 탭마다 미션 4종(원리3+캐릭터1)', ['1-2','3-4','5-6'].every(g=>L.missionsByGrade(g).length===4));
t('코코 달리기 = needGuide(겹쳐보기 안내)', L.findMission('koko').needGuide===true);

/* ② 본보기 다리 — 전부 KChar 리그 본보기 + 장수 정합 */
t('3종 전부 캐릭터 본보기에 연결(rig)', CM.every(M=>{ const S=L.linkedSample(M.id); return S&&S.rig&&S.grp==='char'; }));
t('kbot 3장 ↔ 본보기 6장 = [0,2,4] (눈동자 좌·중·우)',
  [0,1,2].map(c=>L.ghostFrameFor(3,6,c)).join()==='0,2,4');
t('pogeun·koko = 1:1 항등 매핑',
  [0,5].every(c=>L.ghostFrameFor(6,6,c)===c) && [0,3,7].every(c=>L.ghostFrameFor(8,8,c)===c));
t('고스트 계획 — 캐릭터 미션에서 show + 청록',
  CM.every(M=>{ const S=L.linkedSample(M.id);
    const g=L.ghostPlan({on:true,sampleId:S.id,count:M.frames,cur:0,playing:false});
    return g.show&&g.tint==='#0FA98E'; }));

/* ③ 🎭 듀엣 + 한 장 고치러 가기 */
t('완성 시 3종 전부 듀엣 노출(본보기 제목 병기)',
  CM.every(M=>{ const d=L.duetPlan({done:true,missionId:M.id,fps:M.fps});
    return d.show&&d.sampleFrames===L.linkedSample(M.id).frames&&!!d.sampleTitle; }));
t('duetJumpFrame — 정상 값 통과', L.duetJumpFrame({mine:5,sample:2},8)===5);
t('duetJumpFrame — 첫 rAF 전(null) = 0장', L.duetJumpFrame(null,8)===0);
t('duetJumpFrame — 초과·음수·NaN 클램프',
  L.duetJumpFrame({mine:99},8)===7 && L.duetJumpFrame({mine:-3},8)===0
  && L.duetJumpFrame({mine:NaN},8)===0 && L.duetJumpFrame({mine:2.9},8)===2);
t('duetJumpFrame — count 방어(0·음수 → 0장)', L.duetJumpFrame({mine:3},0)===0 && L.duetJumpFrame({mine:3},-2)===0);

/* ④ 실렌더 — 고스트가 비출 장들이 실제 그려지고 서로 다른가 */
function render(sid,i){ const cv=createCanvas(900,620); L.drawSample(cv.getContext('2d'),sid,i); return cv; }
function inkCount(cv){ const d=cv.getContext('2d').getImageData(0,0,900,620).data; let n=0;
  for(let i=3;i<d.length;i+=4) if(d[i]>8) n++; return n; }
function diff(a,b){ const da=a.getContext('2d').getImageData(0,0,900,620).data,
  db=b.getContext('2d').getImageData(0,0,900,620).data; let n=0;
  for(let i=0;i<da.length;i+=4) if(Math.abs(da[i]-db[i])>12||Math.abs(da[i+3]-db[i+3])>12) n++; return n; }
t('kbot 고스트 3장 전부 그림 존재', [0,2,4].every(i=>inkCount(render('ch_kbot',i))>4000));
{ const a=render('ch_kbot',0), b=render('ch_kbot',2), c=render('ch_kbot',4);
  t('kbot 고스트 3장 서로 다름(눈동자 이동)', diff(a,b)>50 && diff(b,c)>50 && diff(a,c)>50); }
t('pogeun 6장·koko 8장 전 장 그림 존재',
  [0,1,2,3,4,5].every(i=>inkCount(render('ch_pogeun',i))>4000)
  && [0,1,2,3,4,5,6,7].every(i=>inkCount(render('ch_koko',i))>4000));
t('koko 이웃 장 상이(달리기 = 움직임)',
  [0,1,2,3,4,5,6].every(i=>diff(render('ch_koko',i),render('ch_koko',i+1))>100));

console.log('\n'+(fail?('실패 '+fail+'건 — '):'전체 통과 ')+pass+'/'+(pass+fail));
process.exit(fail?1:0);

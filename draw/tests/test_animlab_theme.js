/* 애니 공방 — 밝은 공방 테마 정적 검산 (2026-08-18 준호 결정: 다크 → 밝게)
   ① 다크 전제 잔재 부재 ② WCAG 대비(본문 4.5:1·큰글 3:1) ③ 밝은 형제 화면과의 이웃성 */
const fs=require('fs'),path=require('path');
const css=fs.readFileSync(path.join(__dirname,'..','..','labs','animlab.html'),'utf8');
let pass=0,fail=0;
const t=(n,c)=>{if(c){pass++;console.log('  ✓ '+n)}else{fail++;console.log('  ✗ '+n)}};

/* ── 대비 계산 (WCAG 2.1 상대휘도) ── */
function lum(hex){
  const v=hex.replace('#','');
  const c=[0,2,4].map(i=>parseInt(v.substr(i,2),16)/255)
    .map(x=>x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4));
  return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
}
function ratio(a,b){ const l1=lum(a),l2=lum(b); const [hi,lo]=l1>l2?[l1,l2]:[l2,l1];
  return (hi+0.05)/(lo+0.05); }
function tok(name){ const m=css.match(new RegExp('--'+name+':\\s*(#[0-9A-Fa-f]{6})')); return m&&m[1]; }

/* ① 다크 잔재 — 옛 팔레트 색이 남아 있으면 밝은 면 위에서 사라지거나 튄다 */
const DARK=['#12161c','#1b2129','#232a34','#191e26','#2b3340','#E8EEF5','#8fa3b8'];
DARK.forEach(d=>t('다크 잔재 없음 '+d, css.indexOf(d)<0));
t('흰 반투명 표면(rgba(255,255,255,.0x)) 잔재 없음',
  !/rgba\(255,255,255,\.(0[0-9]|1[0-9])\)/.test(css));
t('body 배경 = 밝은 그라데이션', /body\{[^}]*background:linear-gradient\(180deg,#F3F6FB/.test(css));

/* ② 대비 — 본문·보조 텍스트가 실제 면 위에서 읽히는가 */
const ink=tok('ink'), mut=tok('mut'), acc=tok('accent'), acc2=tok('accent2'),
      surf=tok('surf'), glass=tok('glass'), paper=tok('paper'), soft=tok('accent-soft'),
      accInk=tok('accent-ink');
t('토큰 전부 6자리 hex로 해석됨', [ink,mut,acc,acc2,surf,glass,paper,soft,accInk].every(Boolean));
const BG='#EAEFF7';                                  // body 그라데이션 중간값
t('본문(--ink) / 배경 ≥ 4.5', ratio(ink,BG)>=4.5);
t('본문(--ink) / 흰 패널 ≥ 4.5', ratio(ink,glass)>=4.5);
t('본문(--ink) / 버튼면(--surf) ≥ 4.5', ratio(ink,surf)>=4.5);
t('본문(--ink) / 종이(--paper) ≥ 4.5', ratio(ink,paper)>=4.5);
t('보조(--mut) / 흰 패널 ≥ 4.5', ratio(mut,glass)>=4.5);
t('보조(--mut) / 버튼면(--surf) ≥ 4.5', ratio(mut,surf)>=4.5);
t('액센트 글자(--accent-ink) / 선택 면 ≥ 4.5', ratio(accInk,soft)>=4.5);
t('액센트 글자(--accent-ink) / 흰 패널 ≥ 4.5', ratio(accInk,glass)>=4.5);
t('액센트 글자(--accent-ink) / 버튼면 ≥ 4.5', ratio(accInk,surf)>=4.5);
t('면용 --accent와 글자용 --accent-ink는 서로 다른 값(역할 분리)', acc!==accInk);
t('액센트 그라데이션 위 흰 글자 ≥ 3 (큰글·버튼)',
  ratio('#FFFFFF',acc)>=3 && ratio('#FFFFFF',acc2)>=3);
t('👻 켬 상태 청록 글자 / 면 ≥ 4.5', ratio('#0A6E60','#E3F7F2')>=4.5);
t('토스트 — 어두운 알약 위 밝은 글자 ≥ 4.5', ratio('#F5F8FD','#2A3242')>=4.5);
t('가이드 밴드(도화지 위 자막 띠) 보조색 ≥ 4.5', ratio('#C3CEDD','#141920')>=4.5);

/* ③ 종이가 배경에서 떠 보이는가 — 색온도 차 + 윤곽 */
t('종이 ≠ 배경 (같은 색이면 도화지 경계가 사라진다)', paper.toUpperCase()!==BG);
t('종이가 배경보다 밝음', lum(paper)>lum(BG));
t('도화지에 윤곽선(1px 테두리) 있음', /canvas-wrap\{[\s\S]{0,220}0 0 0 1px var\(--glass-bd\)/.test(css));

/* ④ 케이아트 형제 화면과 이웃성 — 밝은 계열 여부만(정확 일치는 요구 안 함) */
const draw=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const dbg=(draw.match(/--bg:(#[0-9A-Fa-f]{6})/)||[])[1];
t('케이아트 본체도 밝은 배경 — 같은 계열로 이웃', !!dbg && lum(dbg)>0.6 && lum(BG)>0.6);

console.log('\n'+(fail?('실패 '+fail+'건 — '):'전체 통과 ')+pass+'/'+(pass+fail));
process.exit(fail?1:0);

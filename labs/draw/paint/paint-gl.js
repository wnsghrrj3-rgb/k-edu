/* =========================================================================
 * 케이아트 물감 엔진 — paint-gl.js  (WebGL2 포트 · paint-core.js와 동일 수식)
 * 상위: draw/물감엔진_설계.md · SPEC: draw/SPEC_물감엔진_구현.md · 인수인계: draw/_HANDOFF_물감_W1.md
 *
 * paint-core.js(CPU)가 물리의 "진실 기준". 이 파일은 같은 §1 시뮬을 GPU로 옮긴 체감·성능판.
 *   - scatter(이웃에 밀기)는 GPU에서 불가 → 전부 gather(이웃에서 모으기)로 변환(쌍별 플럭스 = 완전 질량보존).
 *   - 커피링 보완 3축(증발 테두리집중 · 외향 모세관 드리프트 · stain 핀) 동일 이식.
 * 검산은 CPU에서만(P-8). GL은 데모 ?cpu=1 오버레이로 준호 실기기 육안 대조.
 *
 * 함정 방어(SPEC §7):
 *   P-1 state 핑퐁 스왑(읽기≠쓰기)  P-2 16F 미지원 폴백(supported=false)  P-3 §1-⑤ 클램프 유지
 *   P-6 dry는 state 핑퐁과 분리(전용 핑퐁)  P-7 흰 특례 ×0.55(가법 금지)  P-8 CPU 픽셀일치 불요
 * ========================================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PaintGL = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── 공용 정점 셰이더(풀스크린 삼각형). uv는 top-down(y 아래로 증가) = 마우스/캔버스 css 좌표계와 일치.
  //   (WebGL 기본 화면 y는 아래가 0이므로 여기서 뒤집어 브러시 입력·텍스처·화면 출력을 일관되게 맞춤.)
  const VERT = `#version 300 es
  precision highp float;
  const vec2 P[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
  out vec2 uv;
  void main(){ vec2 p = P[gl_VertexID]; uv = vec2(p.x*0.5+0.5, 0.5-p.y*0.5); gl_Position = vec4(p,0.0,1.0); }`;

  // ── 공용 헤더(상수·유틸) — CPU와 동일 수치
  const HEAD = `#version 300 es
  precision highp float;
  in vec2 uv;
  uniform sampler2D uState;   // r=wat, gba=pig[3]
  uniform sampler2D uDry;     // rgb=dry[3]
  uniform sampler2D uPaper;   // r=ph, g=pd(각/2π), b=pa
  uniform sampler2D uWax;     // r=wax
  uniform vec2  uTexel;       // 1/size
  uniform vec2  uSize;        // px
  uniform float uKd;          // 0.16(4방) | 0.09(8방)
  uniform int   uDiff;        // 4 | 8
  uniform float uAniso;       // 종이 이방성
  uniform float uMobility;    // 매질
  uniform float uEvapBulk, uEvapEdge, uStainHold, uDrift, uWetKnee, uDepBase, uDepGranK, uClampMax;
  uniform float uLocalEvap;   // 전역 국소증발(드라이어/싹말리기)
  const float PI = 3.14159265;

  bool oob(vec2 p){ return p.x<0.0||p.y<0.0||p.x>uSize.x-1.0||p.y>uSize.y-1.0; }
  vec4 stAt(vec2 p){ return texture(uState, (p+0.5)*uTexel); }
  vec3 dryAt(vec2 p){ return texture(uDry, (p+0.5)*uTexel).rgb; }
  float phAt(vec2 p){ return texture(uPaper,(p+0.5)*uTexel).r; }
  float pdAt(vec2 p){ return texture(uPaper,(p+0.5)*uTexel).g*2.0*PI; }
  float paAt(vec2 p){ return texture(uPaper,(p+0.5)*uTexel).b; }
  float waxAt(vec2 p){ return texture(uWax,(p+0.5)*uTexel).r; }

  // 반사율 R(ks)=1+ks−sqrt(ks²+2ks)
  float reflectKS(float ks){ ks=max(ks,0.0); return 1.0+ks-sqrt(ks*ks+2.0*ks); }
  `;

  // ── ①확산 + ②이류 (gather). 쌍별 flow를 양쪽에서 동일 계산 → 완전 질량보존.
  const FRAG_DIFFUSE = HEAD + `
  layout(location=0) out vec4 outState;
  // src→dst flow (CPU flowFn과 동일): dh>0일 때만. fiber=source pd, pin=dest pa/wat, wax=dest.
  float flowFn(float wSrc, float wDst, float waxDst, float paDst, float pdSrc, float dirAng, bool diag){
    float dh = wSrc - wDst; if(dh<=0.0) return 0.0;
    float fiber = 1.0;
    if(uAniso>0.0){ fiber = 1.0 + 0.8*abs(cos(dirAng - pdSrc)); }
    float jWet = min(wDst/0.06, 1.0);
    float pin  = 1.0 - paDst*(1.0-jWet)*0.97;
    float wij  = (1.0 - 0.85*waxDst)*fiber*pin;
    float f = uKd*wij*dh;
    if(uDiff==8 && diag) f *= 0.7071;
    return f;
  }
  void main(){
    vec2 P = floor(uv*uSize);
    vec4 si = stAt(P);
    float wi = si.r; vec3 pi = si.gba;
    if(wi<=0.0){ outState = si; return; }
    float paI = paAt(P), pdI = pdAt(P), waxI = waxAt(P);
    float netW = 0.0; vec3 netP = vec3(0.0);
    // 이웃 오프셋(최대 8)
    vec2 offs[8] = vec2[8](vec2(1,0),vec2(-1,0),vec2(0,1),vec2(0,-1),
                           vec2(1,1),vec2(1,-1),vec2(-1,1),vec2(-1,-1));
    int nN = (uDiff==8)?8:4;
    for(int k=0;k<8;k++){
      if(k>=nN) break;
      vec2 o = offs[k]; vec2 Q = P+o;
      if(oob(Q)) continue;
      bool diag = (o.x!=0.0 && o.y!=0.0);
      vec4 sj = stAt(Q); float wj = sj.r; vec3 pj = sj.gba;
      float paJ = paAt(Q), pdJ = pdAt(Q), waxJ = waxAt(Q);
      float dirIJ = atan(o.y, o.x);
      float dirJI = atan(-o.y, -o.x);
      float fOut = flowFn(wi, wj, waxJ, paJ, pdI, dirIJ, diag); // i→j
      float fIn  = flowFn(wj, wi, waxI, paI, pdJ, dirJI, diag); // j→i
      netW += fIn - fOut;
      float denomI = max(wi,0.02), denomJ = max(wj,0.02);
      netP += pj*uMobility*fIn/denomJ - pi*uMobility*fOut/denomI;
    }
    float wn = clamp(wi+netW, 0.0, 1.0);
    vec3  pn = max(pi+netP, vec3(0.0));
    outState = vec4(wn, pn);
  }`;

  // ── ②′ 외향 모세관 드리프트(Deegan). 쌍별 반대칭 플럭스(상류 안료), 물 비동반.
  const FRAG_DRIFT = HEAD + `
  layout(location=0) out vec4 outState;
  void main(){
    vec2 P = floor(uv*uSize);
    vec4 si = stAt(P); float wi = si.r; vec3 pi = si.gba;
    vec3 net = vec3(0.0);
    vec2 offs[4] = vec2[4](vec2(1,0),vec2(-1,0),vec2(0,1),vec2(0,-1));
    for(int k=0;k<4;k++){
      vec2 Q = P+offs[k]; if(oob(Q)) continue;
      vec4 sj = stAt(Q); float wj = sj.r; vec3 pj = sj.gba;
      float dw = wi - wj;
      // 상류(더 젖은 쪽) → 하류. driftK*|dw| 비율, 셀당 유출 상한 보호(0.5).
      if(dw>0.0 && wj>0.005 && wi>0.02){
        float share = min(uDrift*dw, 0.5);
        net -= pi*share;                 // i가 상류: 유출
      } else if(dw<0.0 && wi>0.005 && wj>0.02){
        float share = min(uDrift*(-dw), 0.5);
        net += pj*share;                 // j가 상류: i로 유입
      }
    }
    outState = vec4(wi, max(pi+net, vec3(0.0)));
  }`;

  // ── ③ 증발(테두리 집중 + stain 핀). 로컬 + 4이웃 dryN.
  const FRAG_EVAP = HEAD + `
  layout(location=0) out vec4 outState;
  void main(){
    vec2 P = floor(uv*uSize);
    vec4 si = stAt(P); float wi = si.r;
    if(wi<=0.0){ outState = si; return; }
    float dryN = 0.0;
    vec2 offs[4] = vec2[4](vec2(1,0),vec2(-1,0),vec2(0,1),vec2(0,-1));
    for(int k=0;k<4;k++){
      vec2 Q = P+offs[k];
      if(oob(Q)){ dryN += 1.0; continue; }
      if(stAt(Q).r < 0.02) dryN += 1.0;
    }
    float ev = uEvapBulk + uEvapEdge*(dryN/4.0);
    if(uStainHold>0.0){
      float dsum = dot(dryAt(P), vec3(1.0));
      ev *= 1.0/(1.0 + uStainHold*dsum);
    }
    float wn = max(wi - ev - uLocalEvap, 0.0);
    outState = vec4(wn, si.gba);
  }`;

  // ── ④ 침착 + ⑤ 클램프. MRT: state(pig↓) + dry(누적↑). (건조전선 흡인 pull은 CPU 전용, GL 생략—P-8)
  const FRAG_DEPOSIT = HEAD + `
  uniform float uGran;
  layout(location=0) out vec4 outState;
  layout(location=1) out vec4 outDry;
  void main(){
    vec2 P = floor(uv*uSize);
    vec4 si = stAt(P); float wi = si.r; vec3 pi = si.gba;
    vec3 dpre = dryAt(P);
    float gate = clamp(1.0 - wi/uWetKnee, 0.04, 1.0);
    float ph = phAt(P);
    float depF = (uDepBase + uGran*ph*uDepGranK)*gate;
    vec3 dep = min(pi*depF, pi);
    vec3 pn = pi - dep;
    vec3 dn = dpre + dep;
    // ⑤ 클램프 dry+pig ≤ clampMax (채널별)
    for(int c=0;c<3;c++){
      float tot = dn[c]+pn[c];
      if(tot>uClampMax){ float s=uClampMax/tot; dn[c]*=s; pn[c]*=s; }
    }
    outState = vec4(wi, pn);
    outDry   = vec4(dn, 1.0);
  }
  `;

  // ── 렌더(KM 합성) → 화면
  const FRAG_RENDER = HEAD + `
  out vec4 frag;
  uniform sampler2D uHgt;
  uniform vec3 uBg;
  uniform float uLit;
  uniform float uInkAlpha;   // 1=잉크 있는 곳만 불투명(본체 합성/bake), 0=배경 불투명(데모)
  float hgtAt(vec2 p){ return texture(uHgt,(p+0.5)*uTexel).r; }
  void main(){
    vec2 P = floor(uv*uSize);
    vec4 si = stAt(P); vec3 pig = si.gba; vec3 dry = dryAt(P);
    float ph = phAt(P);
    float shade = 0.94 + 0.12*ph;
    vec3 col;
    for(int c=0;c<3;c++){
      float ks = dry[c] + 1.15*pig[c];
      float lin = clamp(reflectKS(ks)*shade, 0.0, 1.0);
      col[c] = pow(lin, 1.0/2.2);
    }
    float ink = clamp(dot(pig+dry, vec3(1.0))*4.0, 0.0, 1.0);
    // 🖌️ 임파스토 조명(SPEC §3): 유화일 때 hgt 구배 → 좌상 광원 shade
    if(uLit>0.5){
      float dhx = (hgtAt(P+vec2(1,0)) - hgtAt(P-vec2(1,0)))*0.5;
      float dhy = (hgtAt(P+vec2(0,1)) - hgtAt(P-vec2(0,1)))*0.5;
      vec3 n = normalize(vec3(-dhx*14.0, -dhy*14.0, 1.0));
      vec3 L = normalize(vec3(-0.5,-0.7,0.6));
      col *= (0.75 + 0.45*max(dot(n,L),0.0));
    }
    col = clamp(col, 0.0, 1.0);
    if(uInkAlpha>0.5){ frag = vec4(col*ink, ink); }     // 프리멀티플(본체 위 합성)
    else { frag = vec4(mix(uBg, col, ink), 1.0); }      // 배경 포함(단독 데모)
  }`;

  // ── 🖌️ 유화 스탬프(브리슬 1개): MRT state(pig+=) + hgt(+=0.008·p·f). 확산 없음.
  const FRAG_OILSTAMP = HEAD + `
  uniform sampler2D uHgt;
  uniform vec2 uBrush; uniform float uRadius; uniform vec3 uKS; uniform float uP;
  layout(location=0) out vec4 outState;
  layout(location=1) out vec4 outHgt;
  void main(){
    vec2 P = floor(uv*uSize);
    vec4 si = stAt(P); float hg = texture(uHgt,(P+0.5)*uTexel).r;
    float d = distance(P+0.5, uBrush);
    if(d<=uRadius){
      float t = cos((d/uRadius)*PI*0.5); float f=t*t;
      hg += 0.008*uP*f;
      si = vec4(si.r, si.gba + uKS*(0.9*uP*f));
    }
    outState = si; outHgt = vec4(hg,0.0,0.0,1.0);
  }`;

  // ── 🔪 나이프: hgt 3×3 평활(lerp 0.5) + 진행 방향 pig 끌기 0.5(반경 내).
  const FRAG_KNIFE = HEAD + `
  uniform sampler2D uHgt;
  uniform vec2 uBrush; uniform float uRadius; uniform vec2 uDir;
  layout(location=0) out vec4 outState;
  layout(location=1) out vec4 outHgt;
  float hgtAt(vec2 p){ return texture(uHgt,(p+0.5)*uTexel).r; }
  void main(){
    vec2 P = floor(uv*uSize);
    vec4 si = stAt(P); float hg = hgtAt(P); vec3 pig = si.gba;
    if(distance(P+0.5, uBrush)<=uRadius){
      float sum=0.0,n=0.0;
      for(int yy=-1;yy<=1;yy++)for(int xx=-1;xx<=1;xx++){
        vec2 Q=P+vec2(float(xx),float(yy)); if(oob(Q))continue; sum+=hgtAt(Q); n+=1.0; }
      hg += (sum/n - hg)*0.5;
      vec2 Su = P - uDir; if(!oob(Su)) pig = mix(pig, stAt(Su).gba, 0.5);
    }
    outState = vec4(si.r, pig); outHgt = vec4(hg,0.0,0.0,1.0);
  }`;

  // ── 💨 스미어: pig = lerp(pig, pig[P−dir], 0.35·p) (반경 내)
  const FRAG_SMEAR = HEAD + `
  uniform vec2 uBrush; uniform float uRadius; uniform vec2 uDir; uniform float uP;
  layout(location=0) out vec4 outState;
  void main(){
    vec2 P = floor(uv*uSize);
    vec4 si = stAt(P); vec3 pig = si.gba;
    if(distance(P+0.5, uBrush)<=uRadius){ vec2 Su=P-uDir; if(!oob(Su)) pig = mix(pig, stAt(Su).gba, 0.35*uP); }
    outState = vec4(si.r, pig);
  }`;

  // ── 브러시 스탬프(폴오프 cos²). type: 0 water · 1 color · 2 lift · 3 dry(갈필)
  const FRAG_BRUSH = HEAD + `
  layout(location=0) out vec4 outState;
  uniform vec2  uBrush;   // px 중심
  uniform float uRadius;
  uniform int   uType;
  uniform vec3  uKS;      // 색 K/S
  uniform float uDensity; // 안료량
  uniform float uWet;     // 물 주입(=media.wet*p)
  uniform float uP;       // 압력
  void main(){
    vec2 P = floor(uv*uSize);
    vec4 si = stAt(P); float wat = si.r; vec3 pig = si.gba;
    float d = distance(P+0.5, uBrush);
    if(d>uRadius){ outState = si; return; }
    float t = cos((d/uRadius)*PI*0.5); float f = t*t;
    if(uType==0){                       // 맑은 물
      wat = min(1.0, wat + uWet*uP*f);
    } else if(uType==2){                // 닦기(lift)
      float k = 1.0 - f;
      wat *= (0.15 + 0.85*k);
      pig *= (0.25 + 0.75*k);
    } else {                            // 채색/갈필
      if(uType==1) wat = min(1.0, wat + uWet*uP*f);
      float phw = 1.0;
      if(uType==3){                     // 갈필: 봉우리만 smoothstep(0.3,0.8)
        float s = smoothstep(0.3, 0.8, phAt(P));
        phw = 0.08 + 0.92*s;
      }
      float amt = uDensity*uP*f*phw;
      pig += uKS*amt;
    }
    outState = vec4(wat, pig);
  }`;

  // ── 🦋 데칼코마니: 좌우 미러 합성 (자기+거울)×0.55. 중앙열 이중합산 없음(대칭식이라 안전).
  const FRAG_FOLD = HEAD + `
  layout(location=0) out vec4 outState;
  void main(){
    vec2 P = floor(uv*uSize);
    vec2 Pm = vec2(uSize.x-1.0-P.x, P.y);   // 좌우 거울
    vec4 a = stAt(P); vec4 b = stAt(Pm);
    // wat·pig 동시 미러 평균 ×0.55
    outState = (a + b)*0.55;
  }`;

  // ── 🧂 소금 패스 (gather·질량보존): 활성 소금 이웃이 i로 밀어준 안료 수취 + i 자신이 활성이면 유출.
  //   MRT: state(wat 증발·pig 재분배) + salt(프레임 감소). paint-core ③′와 동형.
  const FRAG_SALT = HEAD + `
  uniform sampler2D uSalt;   // r = 잔여 프레임
  uniform float uEvap;
  layout(location=0) out vec4 outState;
  layout(location=1) out vec4 outSalt;
  float saltAt(vec2 p){ return texture(uSalt,(p+0.5)*uTexel).r; }
  void main(){
    vec2 P = floor(uv*uSize);
    vec4 si = stAt(P); float wi = si.r; vec3 pi = si.gba;
    float sI = saltAt(P);
    bool activeI = (sI>0.0 && wi>0.15);
    vec3 net = vec3(0.0);
    vec2 offs[4] = vec2[4](vec2(1,0),vec2(-1,0),vec2(0,1),vec2(0,-1));
    // 수취: 활성 소금 이웃 j가 i로 0.03(=0.12/4)씩 밀어줌
    for(int k=0;k<4;k++){
      vec2 Q=P+offs[k]; if(oob(Q)) continue;
      float sJ = saltAt(Q); vec4 sj = stAt(Q);
      if(sJ>0.0 && sj.r>0.15) net += sj.gba*0.03;
    }
    float wn = wi; float sn = sI;
    if(activeI){
      wn = max(wi - uEvap*2.0, 0.0);   // 증발 ×3(추가분)
      net -= pi*0.12;                   // 유출(총 0.12)
      sn = sI - 1.0;                    // 프레임 소진
    }
    outState = vec4(wn, max(pi+net, vec3(0.0)));
    outSalt  = vec4(max(sn,0.0), 0.0, 0.0, 1.0);
  }`;

  // ── 소금 스탬프(반경 내 희소 입자 = 프레임 40 기록)
  const FRAG_SALTBRUSH = HEAD + `
  uniform sampler2D uSalt;
  uniform vec2 uBrush; uniform float uRadius; uniform float uSeed;
  layout(location=0) out vec4 outSalt;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7))+uSeed)*43758.5453); }
  void main(){
    vec2 P = floor(uv*uSize);
    float cur = texture(uSalt,(P+0.5)*uTexel).r;
    float d = distance(P+0.5, uBrush);
    if(d<=uRadius && hash(P)<0.22) cur = 40.0;   // 희소
    outSalt = vec4(cur,0.0,0.0,1.0);
  }`;

  // KM 11색 K/S (CPU PIGMENTS와 동일)
  const PIGMENTS = {
    yellow:[0.10,0.14,2.60], orange:[0.10,1.10,2.50], red:[0.18,2.40,2.20],
    lime:[0.90,0.12,2.30], green:[1.90,0.25,2.00], teal:[2.20,0.30,0.90],
    blue:[2.30,1.00,0.15], navy:[2.60,1.90,0.35], violet:[1.20,2.30,0.50],
    brown:[0.70,1.50,2.00], black:[2.80,2.80,2.80],
  };
  const MEDIA = {
    watercolor:{mobility:0.85,gran:1.0,wet:0.30},
    ink:{mobility:0.98,gran:0.25,wet:0.34},
    gouache:{mobility:0.25,gran:0.15,wet:0.10},
    acrylic:{mobility:0.30,gran:0.15,wet:0.10},
  };

  // ── GL 헬퍼
  function compile(gl, type, src){
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw new Error('셰이더 컴파일 실패: ' + gl.getShaderInfoLog(s) + '\n' + src.split('\n').slice(0,3).join('\n'));
    return s;
  }
  function program(gl, fragSrc){
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p, gl.LINK_STATUS))
      throw new Error('프로그램 링크 실패: ' + gl.getProgramInfoLog(p));
    return p;
  }

  /* ---------------------------------------------------------------------
   * PaintGL — 캔버스 하나에 물감 시뮬을 GPU로.
   * ------------------------------------------------------------------- */
  function PaintGL(canvas, opts){
    opts = opts || {};
    const W = opts.width || opts.size || 512;
    const H = opts.height || opts.size || W;
    this.w = W; this.h = H; this.size = W; // size=하위호환(정사각일 때 W=H)
    this.supported = false;
    const gl = canvas.getContext('webgl2', { antialias:false, preserveDrawingBuffer:true });
    if(!gl){ this._reason = 'webgl2-none'; return; }
    // 16F 렌더 가능 여부(P-2)
    const extF = gl.getExtension('EXT_color_buffer_float');
    if(!extF){ this._reason = 'no-float-render'; return; }
    this.gl = gl; this.supported = true;

    // 프로그램들
    this.progDiffuse = program(gl, FRAG_DIFFUSE);
    this.progDrift   = program(gl, FRAG_DRIFT);
    this.progEvap    = program(gl, FRAG_EVAP);
    this.progDeposit = program(gl, FRAG_DEPOSIT);
    this.progRender  = program(gl, FRAG_RENDER);
    this.progBrush   = program(gl, FRAG_BRUSH);
    this.progFold    = program(gl, FRAG_FOLD);
    this.progSalt    = program(gl, FRAG_SALT);
    this.progSaltBrush = program(gl, FRAG_SALTBRUSH);
    this.progOilStamp = program(gl, FRAG_OILSTAMP);
    this.progKnife   = program(gl, FRAG_KNIFE);
    this.progSmear   = program(gl, FRAG_SMEAR);

    this.vao = gl.createVertexArray();

    // 텍스처: state 핑퐁 2 · dry 핑퐁 2 · paper · wax · salt · hgt (전부 w×h)
    this.stateA = this._tex(gl, W, H, gl.RGBA16F, gl.RGBA);
    this.stateB = this._tex(gl, W, H, gl.RGBA16F, gl.RGBA);
    this.dryA   = this._tex(gl, W, H, gl.RGBA16F, gl.RGBA);
    this.dryB   = this._tex(gl, W, H, gl.RGBA16F, gl.RGBA);
    this.paperT = this._tex(gl, W, H, gl.RGBA16F, gl.RGBA);
    this.waxT   = this._tex(gl, W, H, gl.RGBA16F, gl.RGBA);
    this.saltA  = this._tex(gl, W, H, gl.RGBA16F, gl.RGBA);
    this.saltB  = this._tex(gl, W, H, gl.RGBA16F, gl.RGBA);
    this.hgtA   = this._tex(gl, W, H, gl.RGBA16F, gl.RGBA);
    this.hgtB   = this._tex(gl, W, H, gl.RGBA16F, gl.RGBA);
    this.lit = false;
    this.fbo = gl.createFramebuffer();

    this.media = MEDIA[opts.media || 'watercolor'];
    this.diff = opts.diff === 8 ? 8 : 4;
    this.aniso = 0;
    this.localEvap = 0;
    // 물리 상수(paint-core Field 생성자와 동일)
    this.k = {
      evapBulk:0.0004, evapEdge:0.010, stainHold:5.0, drift:1.0,
      wetKnee:0.12, depBase:0.020, depGranK:0.05, clampMax:6.0,
    };
    this.reset(opts.paperKind || 'watercolor', opts.seed);
  }

  PaintGL.prototype._tex = function(gl, w, h, internal, fmt){
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, fmt, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };

  // 종이 필드 업로드(CPU makePaper 결과가 있으면 그걸, 없으면 GL 자체 노이즈). paint-core 있으면 재사용.
  PaintGL.prototype.reset = function(paperKind, seed){
    const gl = this.gl, W = this.w, H = this.h, N = W*H;
    const G = (typeof globalThis!=='undefined'?globalThis:(typeof window!=='undefined'?window:{}));
    const PC = G.PaintCore;
    const buf = new Float32Array(N*4);
    let aniso = 0, bg = [1,1,1];
    if(PC && PC.makePaper){
      const pp = PC.makePaper(W, H, paperKind, seed);
      aniso = pp.aniso || 0;
      for(let i=0;i<N;i++){
        buf[i*4]   = pp.ph[i];
        buf[i*4+1] = pp.aniso>0 ? (pp.pd[i]/(2*Math.PI)) : 0;
        buf[i*4+2] = pp.pa[i];
        buf[i*4+3] = 1;
      }
      if(pp.bg && pp.bg[0]==='#'){ const h=pp.bg; bg=[parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255]; }
    } else {
      for(let i=0;i<N;i++){ buf[i*4]=0.5; buf[i*4+2]=0.6; buf[i*4+3]=1; }
    }
    this.aniso = aniso; this.bg = bg;
    gl.bindTexture(gl.TEXTURE_2D, this.paperT);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,W,H,0,gl.RGBA,gl.FLOAT,buf);
    // state/dry/wax = 0
    const zero = new Float32Array(W*H*4);
    for(const t of [this.stateA,this.stateB,this.dryA,this.dryB,this.waxT,this.saltA,this.saltB,this.hgtA,this.hgtB]){
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,W,H,0,gl.RGBA,gl.FLOAT,zero);
    }
    this.cur = 0; // stateA=현재
    this.curDry = 0; // dryA=현재
    this.curSalt = 0; // saltA=현재
    this.curHgt = 0; // hgtA=현재
    this.lit = false;
    this._saltActive = false;
  };

  PaintGL.prototype._state = function(){ return this.cur===0?this.stateA:this.stateB; };
  PaintGL.prototype._stateBack = function(){ return this.cur===0?this.stateB:this.stateA; };
  PaintGL.prototype._dry = function(){ return this.curDry===1?this.dryB:this.dryA; };
  PaintGL.prototype._dryBack = function(){ return this.curDry===1?this.dryA:this.dryB; };
  PaintGL.prototype._salt = function(){ return this.curSalt===1?this.saltB:this.saltA; };
  PaintGL.prototype._saltBack = function(){ return this.curSalt===1?this.saltA:this.saltB; };
  PaintGL.prototype._hgt = function(){ return this.curHgt===1?this.hgtB:this.hgtA; };
  PaintGL.prototype._hgtBack = function(){ return this.curHgt===1?this.hgtA:this.hgtB; };

  // 공통 유니폼 세팅
  PaintGL.prototype._bindCommon = function(prog){
    const gl = this.gl, k = this.k;
    gl.useProgram(prog);
    gl.uniform2f(gl.getUniformLocation(prog,'uTexel'), 1/this.w, 1/this.h);
    gl.uniform2f(gl.getUniformLocation(prog,'uSize'), this.w, this.h);
    gl.uniform1f(gl.getUniformLocation(prog,'uKd'), this.diff===8?0.09:0.16);
    gl.uniform1i(gl.getUniformLocation(prog,'uDiff'), this.diff);
    gl.uniform1f(gl.getUniformLocation(prog,'uAniso'), this.aniso);
    gl.uniform1f(gl.getUniformLocation(prog,'uMobility'), this.media.mobility);
    gl.uniform1f(gl.getUniformLocation(prog,'uEvapBulk'), k.evapBulk);
    gl.uniform1f(gl.getUniformLocation(prog,'uEvapEdge'), k.evapEdge);
    gl.uniform1f(gl.getUniformLocation(prog,'uStainHold'), k.stainHold);
    gl.uniform1f(gl.getUniformLocation(prog,'uDrift'), k.drift);
    gl.uniform1f(gl.getUniformLocation(prog,'uWetKnee'), k.wetKnee);
    gl.uniform1f(gl.getUniformLocation(prog,'uDepBase'), k.depBase);
    gl.uniform1f(gl.getUniformLocation(prog,'uDepGranK'), k.depGranK);
    gl.uniform1f(gl.getUniformLocation(prog,'uClampMax'), k.clampMax);
    gl.uniform1f(gl.getUniformLocation(prog,'uLocalEvap'), this.localEvap);
    const g = gl.getUniformLocation(prog,'uGran'); if(g) gl.uniform1f(g, this.media.gran);
  };

  // 텍스처 3종 바인딩(state, dry, paper, wax)
  PaintGL.prototype._bindTex = function(prog, stateTex, dryTex){
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, stateTex);
    gl.uniform1i(gl.getUniformLocation(prog,'uState'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, dryTex||this._dry());
    gl.uniform1i(gl.getUniformLocation(prog,'uDry'), 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.paperT);
    gl.uniform1i(gl.getUniformLocation(prog,'uPaper'), 2);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, this.waxT);
    gl.uniform1i(gl.getUniformLocation(prog,'uWax'), 3);
  };

  // state만 렌더타겟으로 1패스(핑퐁 스왑) — P-1
  PaintGL.prototype._pass = function(prog){
    const gl = this.gl;
    this._bindCommon(prog);
    this._bindTex(prog, this._state());
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._stateBack(), 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.viewport(0,0,this.w,this.h);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES,0,3);
    this.cur ^= 1; // 스왑
  };

  // deposit: MRT(state+dry) → 양쪽 스왑
  PaintGL.prototype._passDeposit = function(){
    const gl = this.gl, prog = this.progDeposit;
    this._bindCommon(prog);
    this._bindTex(prog, this._state(), this._dry());
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._stateBack(), 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this._dryBack(), 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    gl.viewport(0,0,this.w,this.h);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES,0,3);
    // COLOR_ATTACHMENT1 해제(다음 단일 패스 오염 방지)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, null, 0);
    this.cur ^= 1; this.curDry ^= 1;
  };

  // 🧂 소금 패스: MRT(state+salt) → 양쪽 스왑
  PaintGL.prototype._passSalt = function(){
    const gl = this.gl, prog = this.progSalt;
    this._bindCommon(prog);
    this._bindTex(prog, this._state(), this._dry());
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, this._salt());
    gl.uniform1i(gl.getUniformLocation(prog,'uSalt'), 4);
    gl.uniform1f(gl.getUniformLocation(prog,'uEvap'), this.k.evapBulk); // ×2 는 셰이더 내
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._stateBack(), 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this._saltBack(), 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    gl.viewport(0,0,this.w,this.h);
    gl.bindVertexArray(this.vao); gl.drawArrays(gl.TRIANGLES,0,3);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, null, 0);
    this.cur ^= 1; this.curSalt ^= 1;
  };

  // 한 시뮬 스텝: ①② → ②′ → ③ → ③′(소금) → ④⑤. 유화/아크릴은 §1 우회(높이필드 전용).
  PaintGL.prototype.step = function(){
    if(!this.supported) return;
    if(this.media && this.media.height){ this.lit = true; return; } // 유화·아크릴: 시뮬 없음
    this._pass(this.progDiffuse);
    if(this.k.drift>0) this._pass(this.progDrift);
    this._pass(this.progEvap);
    if(this._saltActive) this._passSalt();
    this._passDeposit();
  };

  // 🦋 데칼코마니: 좌우 미러 합성 1패스
  PaintGL.prototype.fold = function(){
    if(!this.supported) return;
    this._pass(this.progFold);
  };

  // 🧂 소금 살포: salt 텍스처에 프레임 기록
  PaintGL.prototype.saltBrush = function(x, y, r){
    if(!this.supported) return;
    const gl = this.gl, prog = this.progSaltBrush;
    this._bindCommon(prog);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, this._salt());
    gl.uniform1i(gl.getUniformLocation(prog,'uSalt'), 4);
    gl.uniform2f(gl.getUniformLocation(prog,'uBrush'), x, y);
    gl.uniform1f(gl.getUniformLocation(prog,'uRadius'), r);
    gl.uniform1f(gl.getUniformLocation(prog,'uSeed'), Math.random()*1000.0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._saltBack(), 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.viewport(0,0,this.w,this.h);
    gl.bindVertexArray(this.vao); gl.drawArrays(gl.TRIANGLES,0,3);
    this.curSalt ^= 1; this._saltActive = true;
  };

  // 🪥 스퍼터: 원뿔 방울을 채색 브러시 반복으로(방울=시뮬 합류)
  PaintGL.prototype.spatter = function(x, y, dir, colorName){
    if(!this.supported) return;
    const n = 6 + (Math.random()*9|0);
    for(let d=0; d<n; d++){
      const ang = dir + (Math.random()-0.5)*(50*Math.PI/180);
      const dist = 6 + Math.random()*34, dr = 2 + Math.random()*3;
      this.brush('color', x+Math.cos(ang)*dist, y+Math.sin(ang)*dist, dr, 0.6+Math.random()*0.5, colorName, {density:1.0});
    }
  };

  PaintGL.prototype.setMedia = function(name){ if(MEDIA[name]){ this.media = MEDIA[name]; if(this.media.height) this.lit = true; } };

  // bake 후: 종이·프로그램은 유지하고 잉크 상태만 0으로.
  PaintGL.prototype.clearInk = function(){
    if(!this.supported) return;
    const gl = this.gl, zero = new Float32Array(this.w*this.h*4);
    for(const t of [this.stateA,this.stateB,this.dryA,this.dryB,this.saltA,this.saltB,this.hgtA,this.hgtB]){
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,this.w,this.h,0,gl.RGBA,gl.FLOAT,zero);
    }
    this.cur=0; this.curDry=0; this.curSalt=0; this.curHgt=0; this._saltActive=false; this.lit=false;
  };

  // 🖌️ 유화붓: 브리슬 6~10개(JS에서 위치 산포) 각각 MRT 스탬프(state pig + hgt)
  PaintGL.prototype.oilBrush = function(x, y, r, p, colorName){
    if(!this.supported) return;
    const gl = this.gl, prog = this.progOilStamp;
    const ks = Array.isArray(colorName) ? colorName : (PIGMENTS[colorName] || PIGMENTS.blue);
    const nB = 6 + (Math.random()*5|0);
    for(let b=0;b<nB;b++){
      const ang = Math.random()*Math.PI*2, rad = Math.random()*r*0.8;
      const bx = x+Math.cos(ang)*rad, by = y+Math.sin(ang)*rad, br = r*(0.28+Math.random()*0.18);
      this._bindCommon(prog);
      this._bindTex(prog, this._state());
      gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, this._hgt());
      gl.uniform1i(gl.getUniformLocation(prog,'uHgt'), 5);
      gl.uniform2f(gl.getUniformLocation(prog,'uBrush'), bx, by);
      gl.uniform1f(gl.getUniformLocation(prog,'uRadius'), br);
      gl.uniform3f(gl.getUniformLocation(prog,'uKS'), ks[0],ks[1],ks[2]);
      gl.uniform1f(gl.getUniformLocation(prog,'uP'), p!=null?p:1.0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._stateBack(), 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this._hgtBack(), 0);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      gl.viewport(0,0,this.w,this.h);
      gl.bindVertexArray(this.vao); gl.drawArrays(gl.TRIANGLES,0,3);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, null, 0);
      this.cur ^= 1; this.curHgt ^= 1;
    }
    this.lit = true;
  };

  // 🔪 나이프 / 💨 스미어
  PaintGL.prototype.knife = function(x, y, r, dx, dy){
    if(!this.supported) return;
    const gl = this.gl, prog = this.progKnife;
    this._bindCommon(prog); this._bindTex(prog, this._state());
    gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, this._hgt());
    gl.uniform1i(gl.getUniformLocation(prog,'uHgt'), 5);
    gl.uniform2f(gl.getUniformLocation(prog,'uBrush'), x, y);
    gl.uniform1f(gl.getUniformLocation(prog,'uRadius'), r);
    gl.uniform2f(gl.getUniformLocation(prog,'uDir'), Math.round(dx||0), Math.round(dy||0));
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._stateBack(), 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this._hgtBack(), 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    gl.viewport(0,0,this.w,this.h); gl.bindVertexArray(this.vao); gl.drawArrays(gl.TRIANGLES,0,3);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, null, 0);
    this.cur ^= 1; this.curHgt ^= 1;
  };
  PaintGL.prototype.smear = function(x, y, r, dx, dy, p){
    if(!this.supported) return;
    const gl = this.gl, prog = this.progSmear;
    this._bindCommon(prog); this._bindTex(prog, this._state());
    gl.uniform2f(gl.getUniformLocation(prog,'uBrush'), x, y);
    gl.uniform1f(gl.getUniformLocation(prog,'uRadius'), r);
    gl.uniform2f(gl.getUniformLocation(prog,'uDir'), Math.round(dx||0), Math.round(dy||0));
    gl.uniform1f(gl.getUniformLocation(prog,'uP'), p!=null?p:1.0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._stateBack(), 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.viewport(0,0,this.w,this.h); gl.bindVertexArray(this.vao); gl.drawArrays(gl.TRIANGLES,0,3);
    this.cur ^= 1;
  };

  // 브러시 스탬프
  PaintGL.prototype.brush = function(type, x, y, r, p, colorName, o){
    if(!this.supported) return; o = o||{};
    const gl = this.gl, prog = this.progBrush;
    const typeMap = { water:0, color:1, lift:2, dry:3 };
    const t = typeMap[type] != null ? typeMap[type] : 1;
    const ks = Array.isArray(colorName) ? colorName : (PIGMENTS[colorName] || PIGMENTS.blue);
    this._bindCommon(prog);
    this._bindTex(prog, this._state());
    gl.uniform2f(gl.getUniformLocation(prog,'uBrush'), x, y);
    gl.uniform1f(gl.getUniformLocation(prog,'uRadius'), r);
    gl.uniform1i(gl.getUniformLocation(prog,'uType'), t);
    gl.uniform3f(gl.getUniformLocation(prog,'uKS'), ks[0],ks[1],ks[2]);
    gl.uniform1f(gl.getUniformLocation(prog,'uDensity'), o.density!=null?o.density:1.0);
    gl.uniform1f(gl.getUniformLocation(prog,'uWet'), (t===3?0:this.media.wet));
    gl.uniform1f(gl.getUniformLocation(prog,'uP'), p!=null?p:1.0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._stateBack(), 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.viewport(0,0,this.w,this.h);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES,0,3);
    this.cur ^= 1;
  };

  // 화면 렌더(캔버스 기본 프레임버퍼)
  PaintGL.prototype.render = function(){
    if(!this.supported) return;
    const gl = this.gl, prog = this.progRender;
    this._bindCommon(prog);
    this._bindTex(prog, this._state(), this._dry());
    gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, this._hgt());
    gl.uniform1i(gl.getUniformLocation(prog,'uHgt'), 5);
    gl.uniform1f(gl.getUniformLocation(prog,'uLit'), this.lit?1.0:0.0);
    gl.uniform1f(gl.getUniformLocation(prog,'uInkAlpha'), this.inkAlpha?1.0:0.0);
    gl.uniform3f(gl.getUniformLocation(prog,'uBg'), this.bg[0],this.bg[1],this.bg[2]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0,0,this.w,this.h);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES,0,3);
  };

  PaintGL.prototype.setDrying = function(on){ this.localEvap = on ? 0.005 : 0; };

  return { PaintGL, PIGMENTS, MEDIA };
});

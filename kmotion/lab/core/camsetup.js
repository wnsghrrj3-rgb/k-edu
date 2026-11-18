// 케이모션 과학실 — 카메라 설정(전자칠판 캠·USB 캠·내장 캠): ① 카메라 고르기 ② 거리(확대) · 미리보기 · 손 잡힘 확인
// 왜: 엔진은 고른 카메라를 못 열면 말없이 기본 카메라로 돌아간다(kmotion.js openCamera). 그래서 여기서
//      「정말 그 카메라가 켜졌는지(km.camId)」를 확인하고, 아니면 이유를 알려 주고 저장하지 않는다. 엔진 코드는 고치지 않는다.
// 저장 자리는 엔진과 같다: 'kmotion.camId'(카메라) · 'kmotion.camRange'(km.setRange 가 저장) → 다른 케이모션 활동에도 같이 쓰인다.
const CAM_KEY = 'kmotion.camId';
const DIST = [   // 거리 단추: 확대 배율(엔진 범위). 멀리 있는 캠일수록 손이 작게 잡혀 인식이 흔들린다 → 가운데를 크게 잘라 쓴다
  { z: 1, t: '가까이', s: '노트북 · USB 캠' },
  { z: 1.8, t: '멀리', s: '전자칠판 캠' },
  { z: 2.5, t: '아주 멀리', s: '교실 뒤에서' },
];
const store = { get(){ try { return localStorage.getItem(CAM_KEY) || ''; } catch (_) { return ''; } }, set(id){ try { if (id) localStorage.setItem(CAM_KEY, id); else localStorage.removeItem(CAM_KEY); } catch (_) {} } };

export function createCamSetup({ input, $ }){
  const km = input.km; if (!km) return { open(){}, close(){} };
  const box = $('camPick'), list = $('camList'), msg = $('camMsg'), prev = $('camPrev'), hand = $('camHand'), dist = $('camDist'), camCanvas = $('c'), video = $('v');
  const pc = prev && prev.getContext('2d');
  let isOpen = false, raf = 0, busy = false, noHandT = 0, lastT = 0, autoAsked = false;

  const say = (text, kind = '') => { msg.className = 'msg' + (kind ? ' ' + kind : ''); msg.textContent = text; };
  const nice = (c, i) => c.label ? c.label.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*$/i, '') : '카메라 ' + (i + 1);   // 「(046d:0825)」 같은 장치 번호는 떼고 보여 준다

  // ── ① 카메라 목록
  async function fill(){
    const cams = await input.listCameras(); const cur = km.camId || '';
    list.innerHTML = '';
    if (!cams.length) { list.innerHTML = '<div class="none">카메라를 찾지 못했어요. USB 캠이 꽂혀 있는지 확인하고, 주소창 왼쪽 자물쇠에서 카메라를 「허용」으로 바꿔 주세요.</div>'; return cams; }
    const noNames = cams.every(c => !c.label);
    cams.forEach((c, i) => {
      const on = !!c.id && c.id === cur, b = document.createElement('button'); b.type = 'button'; b.className = 'cs-cam' + (on ? ' on' : '');
      b.innerHTML = '<span class="ic"></span><span class="nm"></span><span class="st"></span>';
      b.querySelector('.ic').textContent = on ? '✔' : '📷'; b.querySelector('.nm').textContent = nice(c, i); b.querySelector('.st').textContent = on ? '지금 쓰는 중' : '';
      b.onclick = () => choose(c, i); list.appendChild(b); });
    if (noNames) say('카메라 사용을 허용하면 카메라 이름이 보여요.');
    return cams;
  }

  // ── 카메라 바꾸기: 정말 켜졌는지 확인하고 나서만 저장
  async function choose(c, i){
    if (busy) return; busy = true; list.querySelectorAll('button').forEach(b => b.disabled = true);
    const name = nice(c, i), before = km.camId || '';
    say('「' + name + '」을(를) 켜는 중…');
    try {
      if (km.running) await km.switchCamera(c.id, false);
      else { store.set(c.id); await input.useCamera(c.id); }
      const ok = !c.id || km.camId === c.id;
      if (ok) { store.set(c.id); say('「' + name + '」으로 바꿨어요. 손을 화면에 보여 주세요. 손이 작게 보이면 아래 「② 거리」에서 「멀리」를 눌러요.', 'ok'); }
      else {
        say('「' + name + '」을(를) 열지 못했어요. 전자칠판 프로그램이나 화상 수업 프로그램이 이 카메라를 쓰고 있으면 그 프로그램을 끄고 다시 눌러 주세요. USB 캠이면 다른 USB 구멍에 꽂아 보세요.', 'err');
        if (before && km.camId !== before) { try { await km.switchCamera(before, false); } catch (_) {} }   // 엔진이 기본 카메라로 돌아갔으면 원래 쓰던 카메라로
      }
    } catch (e) { say((e && e.message) || '카메라를 켜지 못했어요.', 'err'); }
    busy = false; await fill(); markDist(); $('camRange').disabled = !km.running;
  }

  // ── ② 거리(확대)
  function markDist(){ const z = km.getRange ? km.getRange().zoom : 1; let best = 0; DIST.forEach((d, k) => { if (Math.abs(d.z - z) < Math.abs(DIST[best].z - z)) best = k; });
    dist.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === best && Math.abs(DIST[best].z - z) < .2)); }
  if (dist) { dist.innerHTML = ''; DIST.forEach(d => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<b></b><small></small>'; b.querySelector('b').textContent = d.t; b.querySelector('small').textContent = d.s;
    b.onclick = () => { if (km.setRange) km.setRange({ zoom: d.z, cx: .5, cy: .5 }, true); markDist(); say(d.z > 1 ? '가운데를 크게 봐요. 아이가 서는 자리가 화면 가운데에 오게 카메라를 맞춰 주세요. 더 맞추려면 「직접 맞추기」.' : '카메라 화면 전체를 써요.', 'ok'); };
    dist.appendChild(b); }); }

  // ── 미리보기 + 손 잡힘 (열려 있는 동안만 그린다)
  function loop(t){
    if (!isOpen) return; raf = requestAnimationFrame(loop);
    const dt = lastT ? Math.min(.2, (t - lastT) / 1000) : 0; lastT = t;
    if (pc) { try {
      if (km.running && camCanvas) pc.drawImage(camCanvas, 0, 0, prev.width, prev.height);                         // 엔진이 보는 그대로(확대 범위·손 뼈대 포함)
      else if (video && video.readyState >= 2) { pc.save(); pc.translate(prev.width, 0); pc.scale(-1, 1); pc.drawImage(video, 0, 0, prev.width, prev.height); pc.restore(); }   // 인식이 아직 안 돌면 카메라 영상만(거울)
      else { pc.fillStyle = '#0d0f12'; pc.fillRect(0, 0, prev.width, prev.height); }
    } catch (_) {} }
    const n = input.hands.filter(h => h.present).length;
    if (!km.running) {
      if (input.camError && video && video.readyState >= 2) { hand.className = 'cs-hand bad'; hand.textContent = '카메라는 켜졌는데 손 인식을 켜지 못했어요 — 아래 글을 봐 주세요'; return; }   // 준비 중이 아니라 실패: 끝없이 「준비 중」을 띄우지 않는다
      hand.className = 'cs-hand'; hand.textContent = video && video.readyState >= 2 ? '카메라는 켜졌어요 · 손 인식을 준비하는 중…' : '카메라를 켜는 중…'; return; }
    if (n) { noHandT = 0; hand.className = 'cs-hand ok'; hand.textContent = n > 1 ? '손 두 개가 보여요 ✓' : '손이 보여요 ✓'; }
    else { noHandT += dt; hand.className = 'cs-hand' + (noHandT > 2.5 ? ' bad' : ''); hand.textContent = noHandT > 2.5 ? '손이 안 보여요 — 다른 카메라를 고르거나 「멀리」를 눌러 보세요' : '손을 화면에 보여 주세요'; }
  }

  async function open(err){
    box.style.display = ''; isOpen = true; lastT = 0; noHandT = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    if (err) say(err + (/허용/.test(err) ? '' : ' 아래에서 다른 카메라를 골라 보세요.'), 'err');
    else say('① 손이 잘 보이는 카메라를 누르고, ② 카메라와의 거리를 골라요. 고른 것은 다른 케이모션에도 같이 쓰여요.');
    const cams = await fill(); markDist(); $('camRange').disabled = !km.running; return cams;
  }
  function close(){ box.style.display = 'none'; isOpen = false; cancelAnimationFrame(raf); }

  $('camClose').onclick = close;
  $('camRange').onclick = () => { close(); input.openRange(() => open()); };
  $('bCam').style.display = ''; $('bCam').onclick = () => open(); $('camBox').onclick = () => open();
  try { navigator.mediaDevices.addEventListener('devicechange', () => { if (isOpen) fill(); }); } catch (_) {}   // USB 캠을 꽂거나 뽑으면 목록을 새로

  // 처음 켰을 때: 카메라가 둘 이상인데 아직 고른 적이 없으면 설정 창을 한 번 연다(전자칠판 캠 + USB 캠 교실)
  const prevReady = input.onReady;
  input.onReady = async () => { if (prevReady) prevReady(); if (isOpen) { fill(); markDist(); $('camRange').disabled = false; return; }
    if (!autoAsked && !store.get()) { autoAsked = true; const cams = await input.listCameras(); if (cams.length > 1) open(); } };
  return { open, close, get isOpen(){ return isOpen; } };
}

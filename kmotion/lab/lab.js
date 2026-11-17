// 케이모션 과학실 — 시작(입력 고르기) → 무대·입력·기구·흐름 켜기
// L01 회색 판: 동사 여덟 개(집기·옮기기·놓기·기울여 붓기·담그기·내리치기·펌프질·쓰기)를 손에 익히는 판.
import { createStage } from './core/stage.js';
import { createInput } from './core/input.js';
import { createProps } from './core/props.js';
import { createLiquid } from './core/liquid.js';
import { createAudio } from './core/audio.js';
import { createFlow } from './core/flow.js';
import { BODY_ZONE, inZone } from './core/hands.js';

const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);

function makeHud(){
  const hud = $('hud');
  return {
    pop(text, x, y, rem = 2){ const d = document.createElement('div'); d.className = 'pop'; d.textContent = text; d.style.left = (x * 100) + '%'; d.style.top = (y * 100) + '%'; d.style.fontSize = rem + 'rem'; hud.appendChild(d); setTimeout(() => d.remove(), 1000); },
    wear(which){ if (which === 'face') $('goggle').classList.add('on'); },
    ripple(){},
    askHands(on){ $('camBox').classList.toggle('big', !!on); },
  };
}

async function start(mode){
  $('ov').classList.add('wait'); $('err').textContent = '과학실 문을 여는 중…'; $('back').style.display = 'none';   /* 방 그림이 다 올라올 때까지 시작 화면을 덮어 둔다 */
  const audio = createAudio({ muted: Q.has('mute') }); audio.unlock();
  const stage = createStage($('app'), { capture: Q.has('capture') });
  if (!Q.has('grey')) { for (let k = 0; k < 3 && !stage.pictured; k++) { try { await stage.loadRoom(); } catch (e) { console.warn('[lab] 방 그림을 못 올림(' + (k + 1) + '번째) — 다시 해 보고 안 되면 회색 판으로', e); } } }   /* 블렌더에서 구운 과학실. ?grey=1 이면 회색 판 */
  $('ov').classList.add('hidden'); $('ov').classList.remove('wait'); $('err').textContent = ''; $('tools').style.display = ''; document.documentElement.dataset.lab = 'ready';
  const input = createInput({ mode, el: stage.renderer.domElement, camBox: $('camBox'), camStatus: $('camSt'), video: $('v'), camCanvas: $('c') });
  input.onError = e => { $('camSt').textContent = e.message; if (mode === 'cam') openCamPick(e.message); };
  // ── 카메라 고르기 (카메라 손 모드만): 도구 줄 「📷 카메라」·카메라 창 누르기 · 켜기에 실패하면 저절로 열림
  async function fillCamList(){
    const list = $('camList'); const cams = await input.listCameras(); const cur = input.currentCamera();
    if (!cams.length) { list.innerHTML = '<div class="none">카메라를 찾지 못했어요. 카메라가 꽂혀 있는지, 주소창 옆에서 카메라를 허용했는지 확인해 주세요.</div>'; return; }
    list.innerHTML = ''; cams.forEach((c, i) => { const b = document.createElement('button'); b.textContent = (c.id && c.id === cur ? '✔ ' : '📷 ') + (c.label || '카메라 ' + (i + 1)); if (c.id && c.id === cur) b.classList.add('on');
      b.onclick = async () => { list.querySelectorAll('button').forEach(x => x.disabled = true); $('camMsg').className = 'msg'; $('camMsg').textContent = '카메라를 켜는 중…';
        try { await input.useCamera(c.id); $('camMsg').textContent = '켜졌어요. 손을 카메라에 보여 주세요.'; } catch (e) { $('camMsg').className = 'msg err'; $('camMsg').textContent = e.message || '이 카메라는 켤 수 없어요. 다른 카메라를 골라 주세요.'; }
        fillCamList(); $('camRange').disabled = !input.camOk; };
      list.appendChild(b); });
  }
  function openCamPick(err){ $('camPick').style.display = ''; $('camMsg').className = err ? 'msg err' : 'msg'; $('camMsg').textContent = err ? err + (/허용/.test(err) ? '' : ' 다른 카메라를 골라 보세요.') : '손이 잘 보이는 카메라를 눌러요. 고른 카메라는 다른 케이모션에도 같이 쓰여요.'; $('camRange').disabled = !input.camOk; fillCamList(); }
  input.onReady = () => { if ($('camPick').style.display !== 'none') { fillCamList(); $('camRange').disabled = false; } };
  if (mode === 'cam') { $('bCam').style.display = ''; $('bCam').onclick = () => openCamPick(); $('camBox').onclick = () => openCamPick();
    $('camClose').onclick = () => { $('camPick').style.display = 'none'; };
    $('camRange').onclick = () => { $('camPick').style.display = 'none'; input.openRange(); };
    if (Q.has('campick')) setTimeout(() => openCamPick(), 1500); }
  const hud = makeHud(), liquid = createLiquid(stage);
  const props = createProps({ stage, input, audio, liquid, hud });
  const flow = createFlow({ noteEl: $('note'), props, mode, audio });

  // 컷: 손을 선반 높이로 올리면 A, 실험대에 기구가 모이고 손이 내려와 있으면 B — 아이가 카메라를 조작하지 않는다
  let hiT = 0, loT = 0;
  function cutRule(dt){
    const P = input.hands.filter(H => H.present); if (!P.length) { hiT = loT = 0; return; }
    const cut = stage.cut; if (cut === 'C') return;
    const high = P.some(H => H.y < (cut === 'B' ? .16 : .30)), low = P.every(H => H.y > .55);
    hiT = cut === 'B' && high ? hiT + dt : 0; loT = cut === 'A' && low && props.benchCount() >= 3 ? loT + dt : 0;
    if (hiT > .25) { stage.setCut('A'); hiT = 0; } if (loT > .6) { stage.setCut('B'); loT = 0; }
  }
  const dbg = Q.has('dbg') ? $('dbg') : null; if (dbg) dbg.style.display = '';
  stage.onTick((dt, rdt, now) => {
    input.update(now); props.update(dt, now); cutRule(rdt); flow.update();
    const holdingWear = props.hs.some(s => s.held && s.held.kind === 'wear');
    $('bodySpot').classList.toggle('show', holdingWear); $('bodySpot').classList.toggle('hot', holdingWear && input.hands.some(H => H.present && inZone(H, BODY_ZONE)));
    if (dbg) { const c = props.counters; dbg.textContent = `컷 ${stage.cut} · ${Math.round(stage.fps)}fps · 쪽지 ${flow.step + 1}/${flow.total}\n집기 ${c.grabs} 놓기 ${c.placed} 제자리 ${c.returned} 놓침 ${c.lost} 쓰기 ${c.wears}\n붓기 ${c.poursStarted}회 알갱이 ${c.grains} 그릇 ${Math.round(props.bowl.level * 100)}% · 담그기 ${c.dips}\n치기 톡${c.strikes[1]} 탁${c.strikes[2]} 쾅${c.strikes[3]} (토막 ${c.strikesOnTarget.slice(1).join('/')}) · 펌프 ${c.pumps}`; }
  });

  $('bSnd').onclick = () => { audio.on = !audio.on; $('bSnd').textContent = audio.on ? '🔊 소리' : '🔇 소리'; if (audio.on) audio.unlock(); };
  if (!audio.on) $('bSnd').textContent = '🔇 소리';
  $('bFs').onclick = () => { const d = document.documentElement; if (!document.fullscreenElement) d.requestFullscreen && d.requestFullscreen(); else document.exitFullscreen(); };

  const lab = window.__lab = { stage, input, props, flow, audio, mode };
  lab.auto = async (opt) => (await import('./auto.js')).autoplay(lab, opt);
  // ?auto=1 자동 한 판 · &fast=1 시간을 손으로 흘림(숨은 창·머리 없는 브라우저) · &fr=n&ft=초 그 순간에 멈춤(화면 찍기)
  if (Q.has('auto')) setTimeout(async () => { if (Q.has('fast')) { window.__pause = true; stage.advance(.3); }
    let r; try { r = await lab.auto({ freezeRun: +Q.get('fr') || 0, freezeT: +Q.get('ft') || 0 }); } catch (e) { r = e && e.freeze ? { frozen: true } : { error: String(e) }; }
    if (Q.get('cut')) { stage.setCut(Q.get('cut'), .01); } input.freeze(); stage.advance(1 / 30); window.__pause = false; document.title = 'AUTO ' + JSON.stringify({ done: r.done, step: r.step, frozen: r.frozen, error: r.error }); console.log('[lab auto]', JSON.stringify(r)); }, 300);
  return lab;
}

document.querySelectorAll('.pick').forEach(b => b.addEventListener('click', () => start(b.dataset.mode)));
if (Q.has('mouse') || Q.has('auto')) start('touch');
else if (Q.get('input')) start(Q.get('input'));

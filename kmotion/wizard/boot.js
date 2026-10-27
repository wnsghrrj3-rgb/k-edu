// MATH WIZARD 진입 — 시스템(sim/) 과 스킨(skins/*) 을 잇는 유일한 곳(13 문서 2절)
// ?skin=proto|empty|hq  ?q=low|medium|high  ?spells=all(마법 5종 시험)  ?dev=1  ?mouse=1(마우스 모드로 바로)  ?seed=n  ?grade=n  ?check=1(스킨 검사기 상시)
import { createFlow } from './sim/flow/screens.js';
import { checkInterface, checkTelegraphs, checkTargets, CONTRACT } from './contract/validate.js';

const qs = new URLSearchParams(location.search);
const DEFAULT_SKIN = 'proto';               // hq 완성·준호 확인 뒤 이 한 줄만 바꾼다(13 문서 6절 8)
const DEV = qs.has('dev'), CHECK = DEV || qs.has('check');
const QUALITY = ['low', 'medium', 'high'].includes(qs.get('q')) ? qs.get('q') : 'medium';
const GRADE = Math.min(6, Math.max(1, +qs.get('grade') || 1));
const CAL_KEY = 'kmwiz.cal', TICK = 1 / 60;
const $ = id => document.getElementById(id), bootEl = $('boot');
const say = m => { if (bootEl) bootEl.textContent = m; };

// ── 데이터(노드 시험 tests/sim/load.mjs 와 같은 묶음)
const J = async p => { const r = await fetch(new URL(p, import.meta.url)); if (!r.ok) throw new Error(p + ' ' + r.status); return r.json(); };
const [spells, enemies, anim, layout, textKo, camera, forest11] = await Promise.all(['data/spells.json', 'data/enemies.json', 'data/anim-timing.json', 'data/layout/targets.json', 'data/text/ko.json', 'contract/camera.json', 'data/stages/forest-1-1.json'].map(J));
const data = { spells, enemies, anim, layout, text: textKo, camera, stages: { 'forest-1-1': forest11 } };
const text = (key, args) => { const s = textKo[key] != null ? textKo[key] : key; return args ? s.replace(/\{(\w+)\}/g, (_, k) => args[k] != null ? args[k] : '') : s; };

let cal = null; try { cal = JSON.parse(localStorage.getItem(CAL_KEY) || 'null'); } catch (_) {}
const flow = createFlow({ data, grade: GRADE, freeze: DEV, cal, unlock: qs.get('spells') === 'all' ? 'all' : null, ...(qs.has('seed') ? { seed: +qs.get('seed') } : {}) });
let savedCal = flow.cal;

// ── 스킨
const root = $('root');
let skin = null, skinId = null, skinErr = 0, curScr = null, lastToast = null, lastSnap = null;
async function loadSkin(id){
  const meta = await J(`skins/${id}/skin.json`);
  if (String(meta.contract) !== CONTRACT) throw new Error(`스킨 ${id} 계약 ${meta.contract} ≠ 시스템 ${CONTRACT}`);
  const mod = await import(`./skins/${id}/index.js`);
  const sk = mod.createSkin({ root, quality: QUALITY, text, assetBase: new URL(`skins/${id}/assets/`, import.meta.url).href, dev: DEV, camera, layout, anim });
  const chk = checkInterface(sk); if (!chk.ok) throw new Error(`스킨 ${id} 빠진 함수: ${chk.miss.join(', ')}`);
  await sk.load(p => say(`마법 숲을 준비하는 중… ${Math.round(p * 100)}%`)); return sk;
}
async function useSkin(id){
  let sk; try { sk = await loadSkin(id); } catch (e) { console.warn('[boot] 스킨 실패 → proto', e); if (id === 'proto') throw e; id = 'proto'; sk = await loadSkin('proto'); }
  if (skin) { try { skin.dispose(); } catch (_) {} }
  skin = sk; skinId = id; skinErr = 0; skin.ui.bind({ action: onAction }); skin.mount(); skin.resize(innerWidth, innerHeight, devicePixelRatio || 1);
  curScr = null; lastToast = null;
}
function safe(fn){ try { fn(); if (skinErr) skinErr = 0; } catch (e) { skinErr++; console.error('[boot] 스킨 오류', skinErr, e);
  if (skinErr >= 3 && skinId !== 'proto') { skinErr = 0; useSkin('proto'); } } }   // 3번 연속 → proto, 게임 시간은 계속 흐름

// ── 엔진(입력만 — 스킨은 엔진을 모른다)
let km = null, kmMouse = false, kmStarting = null;
async function ensureEngine(mouse){
  if (km && kmMouse === mouse && km.running) return km;
  if (km && kmMouse !== mouse) { km.stop(); km = null; }
  if (!km) { kmMouse = mouse;
    km = KMotion.create({ video: $('kmv'), canvas: $('kmc'), modes: ['pose', 'hands'], active: ['pose'], numHands: 1, handConf: .3, handSmooth: { minCut: 2.5, beta: .3 },
      rangeButton: false, mouse, modelBase: '../vendor/models/', activity: 'math-wizard' });
    km.onFrame = f => { if (!f.fresh) return; const tMs = flow.t * 1000;
      if (km.isActive('pose')) flow.pose(f.pose || null, tMs, f.W, f.H);
      if (km.isActive('hands')) flow.hand((f.hands && f.hands[0]) || null, f.W, f.H); };
    km.on('error', e => console.warn('[kmotion]', e)); }
  if (!km.running) { kmStarting = kmStarting || km.start().finally(() => { kmStarting = null; }); await kmStarting; }
  $('btnRange').hidden = mouse; return km;
}
addEventListener('mousemove', e => { if (km && kmMouse) $('kmc').dispatchEvent(new MouseEvent('mousemove', { clientX: e.clientX, clientY: e.clientY })); });
$('btnRange').hidden = false;
$('btnRange').onclick = async () => { try { const k = await ensureEngine(false); k.openRangeUI(); } catch (e) { alert('카메라를 켤 수 없어요: ' + (e.message || e)); } };

function onAction(id, p = {}){
  if (id === 'start') {
    const mode = qs.has('mouse') && p.mode === 'camera' ? 'mouse' : p.mode;
    if (mode === 'camera' || mode === 'mouse') ensureEngine(mode === 'mouse').catch(e => { alert('카메라를 쓸 수 없어요: ' + (e.message || e) + '\n키보드로 해 볼까요?'); flow.action('home'); });
    else if (km && km.running) km.stop();
    flow.action('start', Object.assign({}, p, { mode }));
    return;
  }
  flow.action(id, p);
}

// ── 키
const BLOCK = new Set(['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);
addEventListener('keydown', e => { if (BLOCK.has(e.code)) e.preventDefault(); flow.key(e.code, true, flow.t * 1000);
  if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') { /* 키보드 모드는 KeyInput 이 SELECT 를 냄 — 카메라 모드에선 마우스·손 */ } });
addEventListener('keyup', e => flow.key(e.code, false, flow.t * 1000));
addEventListener('resize', () => skin && safe(() => skin.resize(innerWidth, innerHeight, devicePixelRatio || 1)));
document.addEventListener('visibilitychange', () => { if (document.hidden && flow.game && !flow.game.paused && (flow.game.screen === 'S08' || flow.game.screen === 'S08Q')) flow.action('pause'); });

// ── 고정 틱 60Hz + 그리기
await useSkin(qs.get('skin') || DEFAULT_SKIN);
if (bootEl) bootEl.remove();
let acc = 0, last = performance.now(), fpsN = 0, fpsT = last, fps = 0, devEl = null;
if (DEV) { devEl = document.createElement('div'); devEl.id = 'dev'; document.body.append(devEl); }
function frame(now){
  let dt = (now - last) / 1000; last = now; if (dt > .25) dt = .25; acc += dt; let n = 0;
  while (acc >= TICK && n < 5) { flow.step(TICK); acc -= TICK; n++; } if (n >= 5) acc = 0;
  if (flow.game) flow.game.aspect = innerWidth / innerHeight;
  if (km && km.running) { const want = flow.wantModes(); for (const m of ['pose', 'hands']) { const on = want.includes(m); if (km.isActive(m) !== on) km.setActive(m, on); } }
  const evs = flow.drainEvents(); for (const ev of evs) safe(() => skin.onEvent(ev));
  const snap = flow.snapshot(), scr = snap.screen; lastSnap = snap;
  if (scr !== curScr) { const prev = curScr; curScr = scr; safe(() => { if (prev) skin.ui.hide(prev); skin.ui.show(scr, snap); }); }
  safe(() => skin.ui.update(scr, snap));
  if (snap.toast && snap.toast !== lastToast) safe(() => skin.ui.toast(snap.toast)); lastToast = snap.toast || null;
  safe(() => skin.render(snap, acc / TICK));
  if (flow.cal && flow.cal !== savedCal) { savedCal = flow.cal; try { localStorage.setItem(CAL_KEY, JSON.stringify(flow.cal)); } catch (_) {} }
  fpsN++; if (now - fpsT > 500) { fps = Math.round(fpsN * 1000 / (now - fpsT)); fpsN = 0; fpsT = now; if (devEl) devLine(snap); }
  requestAnimationFrame(frame);
}
function devLine(s){
  let st = {}; try { st = skin.stats() || {}; } catch (_) {}
  let chk = ''; if (CHECK && s.enemies) { const a = checkTelegraphs(s, st.telegraphs), b = s.targets && s.targets.length ? checkTargets(s, st.targetRects) : { ok: true }; chk = ` · 검사 예고${a.ok ? '✓' : '✗' + a.lack} 대상${b.ok ? '✓' : '✗' + (b.bad || [])}`; }
  devEl.textContent = `${fps}fps · ${skinId} · ${s.screen}${s.paused ? '(멈춤:' + s.paused + ')' : ''} · draw ${st.drawCalls} tri ${st.triangles} · 엔진 ${km ? (km.running ? Math.round(km.fps) + 'fps ' + ['pose', 'hands'].filter(m => km.isActive(m)).join('+') + ' ' + (km.modelSource || (kmMouse ? 'mouse' : '-')) : '꺼짐') : '없음'} · 시드 ${flow.seed}${chk}`
    + (s.player ? ` · hp ${s.player.hp} mp ${s.player.mana} 적 ${s.enemies.length} 탄 ${s.projectiles.length}` : '');
}
requestAnimationFrame(frame);
if (qs.has('mouse') && !qs.has('dev')) { /* ?mouse=1 은 시작 화면에서 카메라를 골라도 마우스 모드로 돈다 */ }
window.__mw = { flow, get skin(){ return skin; }, get snap(){ return lastSnap; } };

// 케이모션 과학실 — 시작(입력 고르기) → 무대·입력 켜기
import { createStage } from './core/stage.js';
import { createInput } from './core/input.js';

const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);

function start(mode){
  $('ov').classList.add('hidden'); $('back').style.display = 'none';
  const stage = createStage($('app'), { capture: Q.has('capture') });
  const input = createInput({ mode, el: stage.renderer.domElement, camBox: $('camBox'), camStatus: $('camSt'), video: $('v'), camCanvas: $('c') });
  input.onError = e => { $('err').textContent = e.message; };
  stage.onTick((dt, rdt, now) => input.update(now));
  window.__lab = { stage, input, mode };
  return window.__lab;
}

document.querySelectorAll('.pick').forEach(b => b.addEventListener('click', () => start(b.dataset.mode)));
if (Q.has('mouse')) start('touch');
else if (Q.get('input')) start(Q.get('input'));

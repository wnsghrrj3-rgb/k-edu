// 엔진 마우스 모드 가짜 몸(kmotion.js mockPose, 0.7.1 시험 키) → WizardInput 실제 판정 경로로 7종이 나오는지
// 엔진 파일에서 mockPose 함수만 떼어 와 같은 코드로 돌린다(브라우저 없이)
import { readFileSync } from 'node:fs';
import { WizardInput } from '../../sim/input/wizardInput.js';
const src = readFileSync(new URL('../../../kmotion.js', import.meta.url), 'utf8');
const i0 = src.indexOf('function mockPose(){'), body = src.slice(i0, src.indexOf('km.drawMouseHelp = function', i0));
let now = 0; const performance = { now: () => now };
const W = 640, H = 480, mouse = { x: W / 2, y: H / 2, down: false, keys: {}, kt: {}, jumpT: -1e9 };
const mockPose = new Function('mouse', 'W', 'H', 'performance', body + '; return mockPose;')(mouse, W, H, performance);
const wi = new WizardInput({ stage: 'C' }); wi.charge.chargeTime = .5; wi.charge.canCharge = () => true;
const got = []; const tick = (ms, fn) => { for (let s = 0; s < ms; s += 33) { now += 33; if (fn) fn(s); wi.pose(mockPose(), now, W, H); for (const e of wi.drain()) if (e.type !== 'MOVE' && !(e.type === 'CHARGE' && !e.value.start)) got.push(e.type + (e.value.on != null ? ':' + e.value.on : e.value.side ? ':' + e.value.side : e.value.dir ? ':' + e.value.dir : '')); } };
const press = (k, ms) => { mouse.keys[k] = true; mouse.kt[k] = now; tick(ms); mouse.keys[k] = false; };
tick(1800);                                  // 자동 보정(1.5초)
press('z', 300); tick(600); press('x', 300); tick(600);    // 휙 왼손·오른손
press('v', 900); tick(600);                                // 모으기 → 내림 = 시전
press('b', 600); tick(600);                                // X자 막기
press('s', 500); tick(600);                                // 숙이기
tick(400, s => { mouse.x = W / 2 - (s / 400) * 600; }); tick(600);   // 빠르게 옆으로(회피)
let u = 0; tick(1500, s => { mouse.x = W / 2 + (s / 1500) * 200; }); u = wi.u;   // 천천히 이동
console.log(got.join(' · ')); console.log('천천히 이동 뒤 u =', u.toFixed(2));
const need = ['ATTACK:L', 'ATTACK:R', 'CHARGE', 'CAST', 'BLOCK:true', 'DUCK:true', 'DODGE:-1'];
const miss = need.filter(k => !got.includes(k)); console.log(miss.length ? '빠짐: ' + miss.join(', ') : '7종 전부 나옴');

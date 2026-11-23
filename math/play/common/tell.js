/* 수학 놀이터 「소리로 말하기」(정본 27 문서 5-10절 · T04) — 브라우저의 말하기(speechSynthesis · ko-KR)로 손님의 말을 들려준다.
 * 목소리가 없거나 막혀 있으면 조용히 넘어간다(오류 없음) — 소리가 없어도 끝까지 할 수 있어야 한다. 켜고 끄는 단추 하나(지갑 칸에 남김 — 동의 전에는 화면이 열려 있는 동안만).
 * 화면 위 표시(단추)만 코드로. 그림은 art 이름표. */
import * as wallet from './wallet.js?v=1';
import { art } from './art.js?v=9';
export const TELL = { LANG: 'ko-KR', RATE: .9, PITCH: 1.15 };
const box = () => wallet.island('tell');
/** 이 기기가 말할 수 있는가(목소리 유무와 상관없이 기능이 있는가). */
export function can(){ try { return typeof window !== 'undefined' && !!window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function'; } catch (_) { return false; } }
export const on = () => box().off !== true;
/** 한국어 목소리가 실제로 있는가(작은 목소리 사건은 이때만 — 말로만 주문하니까). */
export function voiced(){ try { return can() && on() && speechSynthesis.getVoices().some(v => /^ko/i.test(v.lang)); } catch (_) { return false; } }
export function stop(){ try { if (can()) speechSynthesis.cancel(); } catch (_) {} }
/** 말한다 → 말하기를 시작했는가(못 하면 false · 오류 없음). */
export function say(text){ if (!can() || !on() || !text) return false;
  try { if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = TELL.LANG; u.rate = TELL.RATE; u.pitch = TELL.PITCH; try { const v = speechSynthesis.getVoices().find(x => /^ko/i.test(x.lang)); if (v) u.voice = v; } catch (_) {} speechSynthesis.speak(u); return true; } catch (_) { return false; } }
/** 켜고 끄기 단추(오른쪽 위 · 동전 아래). 누르면 바뀐다. */
const CSS = `#snd{position:fixed;right:calc(14px + env(safe-area-inset-right,0px));top:calc(96px + env(safe-area-inset-top,0px));z-index:31;width:46px;height:46px;border-radius:50%;border:3px solid rgba(255,255,255,.9);background:rgba(10,20,40,.5);color:#fff;font-size:1.4rem;line-height:1;cursor:pointer;touch-action:manipulation;font-family:inherit}#snd.off{opacity:.6}
@media (max-width:520px){#snd{top:auto;bottom:calc(64px + env(safe-area-inset-bottom,0px))}}`;
export function button(onChange){ if (!can()) return null; let b = document.getElementById('snd'); if (b) return b; const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);
  b = document.createElement('button'); b.id = 'snd'; b.type = 'button'; const draw = () => { b.innerHTML = art(on() ? 'sound.on' : 'sound.off'); b.classList.toggle('off', !on()); b.setAttribute('aria-label', on() ? '소리 끄기' : '소리 켜기'); };
  b.addEventListener('pointerdown', e => { e.stopPropagation(); }); b.addEventListener('click', e => { e.stopPropagation(); box().off = on(); wallet.save(); if (!on()) stop(); draw(); if (onChange) onChange(on()); });
  draw(); document.body.appendChild(b); return b; }

if (typeof window !== 'undefined') addEventListener('pagehide', () => stop());   /* 나갈 때 말을 멈춘다 */

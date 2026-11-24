/* 공통 엔진 · 영어 한마디 — 낱말이 대상 위에 뜨고 소리가 난다.
 * · 같은 말은 한동안 되풀이하지 않는다 · 말하는 중에 다음 말이 오면 끊지 않고 뒤에 한 마디만 줄 세운다("Apple" → "Big")
 * · 녹음한 목소리가 있으면 그것을 먼저 쓰고, 없으면 기기 음성(임시)이다 · 마지막 말 다시 듣기 · 음소거는 sound.js 를 따른다. */
import { clamp } from './stage.js';
import { isMuted, onMute } from './sound.js';

// ── 수치
export const VOICE = {
  GAP: 2.5, SHOW: 1.15,            // 외침(Big! · Yummy!): 되풀이하지 않는 시간(초) · 떠 있는 시간
  NAME_GAP: 0.8, NAME_SHOW: 1.0,   // 이름(Apple · Cup): 되풀이하지 않는 시간 · 떠 있는 시간
  PITCH: 1.15, RATE: 0.95,         // 기기 음성의 높낮이 · 빠르기
  STUCK: 3000,                     // 기기 음성이 끝났다는 알림이 이만큼(밀리초) 안 오면 끝난 것으로 본다
};
/** 녹음한 목소리 자리: { 'apple': '주소.mp3', … }. 지금은 비어 있다(전부 기기 음성 — 임시). */
export const RECORDED = {};

/** el = 낱말을 띄울 요소(#word). screenOf = 세계의 점 → 화면 자리. onSaid(낱말, 대상 이름) = 말할 때마다 알림(기록용). */
export function createVoice({ el, screenOf, onSaid }) {
  const saidAt = {}, said = [], talk = { busy: false, next: null, since: 0 }; let clock = 0, showT = 0, showAt = null, last = null;
  function speak(text, pitch = VOICE.PITCH, rate = VOICE.RATE) {
    if (isMuted()) return;
    if (talk.busy && performance.now() - talk.since < VOICE.STUCK) { talk.next = [text, pitch, rate]; return; }
    const done = () => { talk.busy = false; if (talk.next) { const n = talk.next; talk.next = null; speak(...n); } };
    talk.busy = true; talk.since = performance.now();
    const file = RECORDED[text.toLowerCase()];
    if (file) { const a = new Audio(file); a.onended = a.onerror = done; a.play().catch(done); return; }
    if (!('speechSynthesis' in window)) { talk.busy = false; return; }
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.pitch = pitch; u.rate = rate; u.onend = u.onerror = done; speechSynthesis.speak(u);      // 기기 음성(임시)
  }
  onMute(m => { if (m && 'speechSynthesis' in window) { speechSynthesis.cancel(); talk.busy = false; talk.next = null; } });
  /** 한마디. where = 낱말이 뜰 자리를 주는 함수(→ Vector3) 또는 Vector3. o = { name:이름인가, cls:글씨 모양, pitch, rate, by:누구 것인가 } */
  function word(text, where, o = {}) {
    const name = o.name ?? !text.endsWith('!'), gap = o.gap ?? (name ? VOICE.NAME_GAP : VOICE.GAP); if (clock - (saidAt[text] ?? -99) < gap) return false;
    saidAt[text] = clock; said.push(text + (o.by ? '@' + o.by : '')); last = [text.replace('!', ''), o.pitch, o.rate];
    el.textContent = text; el.className = 'on ' + (o.cls || (name ? 'name' : 'shout')); showAt = where; showT = o.show ?? (name ? VOICE.NAME_SHOW : VOICE.SHOW);
    speak(text.replace('!', ''), o.pitch, o.rate); if (onSaid) onSaid(text.replace('!', ''), o.by || '', name); return true;
  }
  /** 마지막 말을 다시 듣는다. */
  const again = () => { if (last) speak(...last); };
  /** 매 장면: 낱말이 대상을 따라다니다 사라진다. */
  function tick(dt) {
    clock += dt; if (showT <= 0) return; showT -= dt;
    const p = screenOf(typeof showAt === 'function' ? showAt() : showAt); el.style.left = clamp(p.x, 90, innerWidth - 90) + 'px'; el.style.top = Math.max(70, p.y - 46) + 'px'; if (showT <= 0) el.className = '';
  }
  return { word, speak, again, tick, said };
}

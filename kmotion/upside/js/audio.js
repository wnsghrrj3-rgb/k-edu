// K-MOTION 거꾸로 나라 · 소리
// 배경음악·효과음 모두 Web Audio 합성(파일·외부 API 없음). 음성 안내는 브라우저 Speech Synthesis(한국어).
// 배경음악과 음성 안내는 선생님이 따로 켜고 끈다.
import { AudioManager } from '../../run/js/audio.js';

// 지역별 음악: 조(근음)·빠르기·화음 진행
const SONGS = {
  title:  { bpm: 92,  root: 57, prog: [[0, 4, 7, 11], [5, 9, 12, 16], [2, 5, 9, 12], [7, 11, 14, 17]] },
  mirror: { bpm: 84,  root: 55, prog: [[0, 3, 7, 10], [8, 12, 15, 19], [5, 8, 12, 15], [7, 10, 14, 17]] },
  forest: { bpm: 100, root: 60, prog: [[0, 4, 7, 9], [5, 9, 12, 14], [9, 12, 16, 19], [7, 11, 14, 17]] },
  town:   { bpm: 112, root: 62, prog: [[0, 4, 7, 12], [7, 11, 14, 19], [9, 12, 16, 21], [5, 9, 12, 17]] },
  lab:    { bpm: 96,  root: 58, prog: [[0, 4, 8, 11], [2, 5, 9, 12], [0, 4, 7, 11], [5, 8, 12, 15]] },
  castle: { bpm: 88,  root: 53, prog: [[0, 3, 7, 12], [5, 8, 12, 17], [3, 7, 10, 15], [7, 11, 14, 19]] },
  run:    { bpm: 132, root: 57, drums: true, prog: [[0, 3, 7, 12], [8, 12, 15, 20], [5, 8, 12, 17], [7, 11, 14, 19]] },
  ending: { bpm: 104, root: 60, prog: [[0, 4, 7, 12], [5, 9, 12, 17], [7, 11, 14, 19], [0, 4, 7, 16]] },
};
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

export class UpsideAudio extends AudioManager {
  constructor(){ super(); this.bgmOn = true; this.voiceOn = true; this.song = null; this.timer = null; this.step = 0; this.bus = null; }
  ensure(){ super.ensure(); if (this.ac && !this.bus) { this.bus = this.ac.createGain(); this.bus.gain.value = this.bgmOn ? .55 : 0; this.bus.connect(this.master);
    // 부드러운 잔향(짧은 지연 되먹임)
    const d = this.ac.createDelay(1); d.delayTime.value = .32; const fb = this.ac.createGain(); fb.gain.value = .32; const lp = this.ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; this.rev = this.ac.createGain(); this.rev.gain.value = .5;
    this.rev.connect(d).connect(lp).connect(fb).connect(d); lp.connect(this.bus); } }
  setBgm(on){ this.bgmOn = on; if (this.bus) this.bus.gain.setTargetAtTime(on ? .55 : 0, this.ac.currentTime, .2); }
  // 음악 버스로 가는 소리
  note(f, dur, { type = 'sine', g = .1, delay = 0, attack = .01, rev = .4 } = {}){ if (!this.ac || !this.bus) return; const t = this.ac.currentTime + delay, o = this.ac.createOscillator(), gn = this.ac.createGain(); o.type = type; o.frequency.value = f;
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(g, t + attack); gn.gain.exponentialRampToValueAtTime(.0006, t + dur); o.connect(gn); gn.connect(this.bus); if (rev) { const rg = this.ac.createGain(); rg.gain.value = rev; gn.connect(rg).connect(this.rev); } o.start(t); o.stop(t + dur + .05); }
  play(name){ this.ensure(); if (!this.ac) return; if (this.song === name) return; this.song = name; this.step = 0; clearInterval(this.timer);
    const S = SONGS[name] || SONGS.title, beat = 60 / S.bpm / 2; // 8분음표
    this.timer = setInterval(() => { if (!this.bgmOn || this.muted || document.hidden) { this.step++; return; }
      const bar = (this.step >> 3) % S.prog.length, k = this.step & 7, ch = S.prog[bar];
      if (k === 0) { ch.forEach((n, i) => this.note(hz(S.root - 12 + n), beat * 8.5, { type: 'triangle', g: .028, attack: .25, rev: .6 })); this.note(hz(S.root - 24 + ch[0]), beat * 7, { type: 'sine', g: .09, attack: .02, rev: .1 }); }
      if (k === 4) this.note(hz(S.root - 24 + ch[0] + 7), beat * 3, { type: 'sine', g: .05, rev: .1 });
      if (S.drums) { if (k % 2 === 0) this.tone(110, .18, { type: 'sine', g: .22, slide: 40 }); if (k % 4 === 2) this.noise(.12, { g: .07, hp: 1500, lp: 6000 }); if (k % 2 === 1) this.noise(.04, { g: .035, hp: 7000, lp: 14000 }); }
      // 반짝이는 첼레스타 아르페지오(위로 오르기 = 거꾸로)
      const arp = [0, 1, 2, 3, 2, 3, 1, 2]; const n = ch[arp[k]] + 12 + ((this.step >> 5) % 2 ? 12 : 0);
      if (k % 2 === 0 || Math.random() < .5) this.note(hz(S.root + n), beat * 2.2, { type: 'sine', g: .045, rev: .7 });
      if (k === 6 && Math.random() < .35) this.note(hz(S.root + ch[3] + 24), beat * 3, { type: 'triangle', g: .025, rev: .9 });
      this.step++; }, beat * 1000); }
  stopMusic(){ clearInterval(this.timer); this.timer = null; this.song = null; }
  // 효과음
  click(){ this.tone(880, .06, { type: 'triangle', g: .06 }); }
  starGet(n = 0){ const b = 988 * Math.pow(1.06, n % 8); [0, .06, .12].forEach((d, i) => this.tone(b * [1, 1.26, 1.5][i], .3, { type: 'triangle', g: .09, delay: d })); this.tone(b * 2, .5, { type: 'sine', g: .05, delay: .16 }); }
  magic(){ for (let i = 0; i < 7; i++) this.tone(600 + i * 180, .4, { type: 'sine', g: .05, delay: i * .035 }); this.noise(.6, { g: .05, hp: 3000, lp: 9000 }); }
  grow(){ this.tone(180, .5, { type: 'triangle', g: .1, slide: 90 }); this.tone(360, .5, { type: 'sine', g: .05, slide: 180 }); }
  shrink(){ this.tone(500, .4, { type: 'triangle', g: .09, slide: 1300 }); }
  success(){ [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .45, { type: 'triangle', g: .11, delay: i * .1 })); this.tone(1318, .9, { type: 'sine', g: .08, delay: .42 }); this.noise(.8, { g: .03, hp: 4000, lp: 10000, delay: .4 }); }
  fanfare(){ [392, 523, 659, 784, 659, 784, 1046].forEach((f, i) => this.tone(f, .5, { type: 'square', g: .045, delay: i * .13 })); [523, 659, 784].forEach(f => this.tone(f, 1.6, { type: 'triangle', g: .06, delay: .95 })); }
  boing(){ this.tone(220, .35, { type: 'sine', g: .14, slide: 520 }); this.tone(520, .3, { type: 'sine', g: .08, slide: 200, delay: .2 }); } // 재미있는 실패음
  bonk(){ this.noise(.15, { g: .2, hp: 100, lp: 900 }); this.tone(300, .25, { type: 'triangle', g: .12, slide: 150 }); this.tone(1200, .4, { type: 'sine', g: .03, slide: 1500, delay: .1 }); }
  whoosh(){ this.noise(.5, { g: .08, hp: 500, lp: 3000, q: 3 }); }
  tick(){ this.tone(1500, .03, { type: 'square', g: .03 }); }
  smash(){ this.noise(.7, { g: .25, hp: 800, lp: 12000 }); for (let i = 0; i < 6; i++) this.tone(1800 + Math.random() * 2400, .25, { type: 'triangle', g: .05, delay: i * .03 }); this.tone(90, .3, { type: 'sine', g: .25, slide: 40 }); }
  squeak(){ this.tone(900, .12, { type: 'sine', g: .1, slide: 1600 }); this.tone(1400, .15, { type: 'sine', g: .06, delay: .08 }); }
  coin(n = 0){ this.tone(1320 * Math.pow(1.03, n % 12), .12, { type: 'square', g: .035 }); this.tone(1980 * Math.pow(1.03, n % 12), .18, { type: 'sine', g: .05, delay: .05 }); }
  alarm(){ this.tone(660, .12, { type: 'square', g: .05 }); this.tone(880, .12, { type: 'square', g: .05, delay: .14 }); }
  piece(){ [784, 988, 1175, 1568, 1976].forEach((f, i) => this.tone(f, .6, { type: 'sine', g: .08, delay: i * .08 })); this.noise(1.2, { g: .04, hp: 5000, lp: 12000, delay: .2 }); }
}

// 한국어 음성 안내(브라우저 내장). 문장이 끝나면 resolve
let voiceCache = null;
export function say(text, audio, { rate = 1.0, pitch = 1.15 } = {}){
  return new Promise(res => {
    try { const s = window.speechSynthesis; if (!s || (audio && !audio.voiceOn)) return res();
      s.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/[🌟⭐✨🪞]/g, '')); u.lang = 'ko-KR'; u.rate = rate; u.pitch = pitch;
      if (!voiceCache) voiceCache = s.getVoices().find(v => /ko/i.test(v.lang)) || null; if (voiceCache) u.voice = voiceCache;
      u.onend = u.onerror = () => res(); s.speak(u); setTimeout(res, 600 + text.length * 170); }
    catch (e) { res(); } });
}
if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = () => { voiceCache = null; };

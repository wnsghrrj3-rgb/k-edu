/* 수 카드 모험 — 화면. 규칙은 engine.js 가 전부 정하고, 여기는 보여 주고 누른 것을 넘길 뿐이다. */
import * as E from './engine.js';
import * as grow from '/kmotion/taste/grow.js';
const $ = id => document.getElementById(id), sleep = ms => new Promise(r => setTimeout(r, ms));
const qs = new URLSearchParams(location.search);
const OPT = { term: qs.get('g') && qs.get('s') ? `${qs.get('g')}-${qs.get('s')}` : '1-2', sum: 'hide', hard: 0 };
if (!E.TERMS.some(t => t.id === OPT.term)) OPT.term = '1-2';
const META_KEY = 'kedu_mathplay_cards_v1';
const meta = (() => { try { return Object.assign({ wins: 0, best: 0, mon: [], relic: [], hard: 0 }, JSON.parse(localStorage.getItem(META_KEY) || '{}')); } catch (_) { return { wins: 0, best: 0, mon: [], relic: [], hard: 0 }; } })();
const saveMeta = () => { try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (_) {} };
let S = null, sel = [], busy = false;        // sel = [{id, neg, dbl}]

// ── 소리
let ac = null; const audio = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (_) {} };
function tone(f, d = .14, type = 'triangle', g = .14, delay = 0, to){ if (!ac) return; try { const t = ac.currentTime + delay, o = ac.createOscillator(), a = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d); a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(a); a.connect(ac.destination); o.start(t); o.stop(t + d + .02); } catch (_) {} }
const SFX = { pick: () => tone(620, .05, 'square', .05), hit: () => tone(240, .12, 'sawtooth', .12, 0, 120), exact: () => { [660, 880, 1320].forEach((f, i) => tone(f, .16, 'triangle', .15, i * .07)); }, over: () => tone(300, .25, 'sine', .12, 0, 150), block: () => tone(180, .2, 'square', .1), hurt: () => tone(120, .4, 'sawtooth', .2, 0, 60), relic: () => { tone(988, .3, 'sine', .14); tone(1480, .4, 'sine', .1, .08); }, bolt: () => tone(1800, .25, 'sawtooth', .12, 0, 200), win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .25, 'triangle', .16, i * .1)), draw: () => tone(700, .06, 'sine', .07) };

// ── 몬스터 그림(도형)
const eyes = (x1, x2, y, r = 9) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x1 + 2}" cy="${y + 2}" r="${r * .5}" fill="#122"/><circle cx="${x2 + 2}" cy="${y + 2}" r="${r * .5}" fill="#122"/>`;
const ART = {
  slime: c => `<path d="M20 120C8 70 40 22 80 22s72 48 60 98c-4 14-116 14-120 0Z" fill="url(#g${c})" stroke="#fff" stroke-opacity=".6" stroke-width="4"/><ellipse cx="54" cy="52" rx="16" ry="8" fill="#fff" opacity=".35"/>${eyes(62, 100, 34)}`,
  shield: c => `<path d="M80 14 140 34v44c0 30-26 50-60 62-34-12-60-32-60-62V34Z" fill="#8aa0c8" stroke="#e8eefc" stroke-width="5"/><path d="M80 26v108M32 62h96" stroke="#e8eefc" stroke-opacity=".5" stroke-width="5"/>${eyes(62, 100, 40, 8)}`,
  bat: c => `<path d="M80 40C60 10 20 20 6 52c18-8 26 4 30 16 8-10 20-10 26 0h36c6-10 18-10 26 0 4-12 12-24 30-16C140 20 100 10 80 40Z" fill="#6a3fb0" stroke="#d9c2ff" stroke-width="4"/><ellipse cx="80" cy="84" rx="40" ry="44" fill="#7d4fd0" stroke="#d9c2ff" stroke-width="4"/>${eyes(66, 96, 52, 8)}`,
  shroom: c => `<path d="M12 78C12 34 44 12 80 12s68 22 68 66c0 10-136 10-136 0Z" fill="#e5484d" stroke="#fff" stroke-width="5"/><circle cx="52" cy="46" r="10" fill="#fff"/><circle cx="104" cy="38" r="13" fill="#fff"/><circle cx="122" cy="66" r="7" fill="#fff"/><rect x="46" y="76" width="68" height="62" rx="26" fill="#f6ead2" stroke="#fff" stroke-width="4"/>${eyes(66, 96, 96, 7)}`,
  twin: c => `<path d="M20 120C8 70 40 22 80 22s72 48 60 98c-4 14-116 14-120 0Z" fill="#ff8fd0" stroke="#fff" stroke-opacity=".7" stroke-width="4"/><path d="M80 22v112" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-dasharray="8 8"/>${eyes(58, 104, 34)}`,
  golem: c => `<rect x="18" y="18" width="124" height="118" rx="18" fill="#7d7468" stroke="#d9d2c4" stroke-width="5"/><path d="M30 60 60 44 86 66 120 40" stroke="#4a433c" stroke-width="5" fill="none"/><rect x="46" y="26" width="24" height="12" rx="4" fill="#ffd35c"/><rect x="92" y="26" width="24" height="12" rx="4" fill="#ffd35c"/>` };
const COLS = [['#8ff0a8', '#2f9e58'], ['#8fe3f0', '#2b8fa6'], ['#ffd98a', '#d98a12'], ['#c9b0ff', '#6a3fb0']];
const monSVG = (type, k) => `<svg viewBox="0 0 160 144"><defs><linearGradient id="g${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COLS[k % 4][0]}"/><stop offset="1" stop-color="${COLS[k % 4][1]}"/></linearGradient></defs>${ART[type](k)}</svg>`;

// ── 그리기
function render(){ if (!S) return;
  $('map').innerHTML = E.NODES.map((n, i) => `<b class="${i < S.node ? 'done' : i === S.node ? 'now' : ''}">${n}</b>`).join('<s></s>');
  $('hearts').innerHTML = Array.from({ length: S.maxHp }, (_, i) => `<i class="${i < S.hp ? '' : 'off'}"></i>`).join('');
  $('cry').textContent = '수정 ' + S.crystals; $('relics').innerHTML = S.relics.map(id => `<span data-r="${id}" title="${E.RELICS[id].desc}">${E.RELICS[id].name}</span>`).join('');
  const f = $('field'); const have = new Set([...f.children].map(n => +n.dataset.id));
  S.enemies.forEach((e, k) => { let n = f.querySelector(`[data-id="${e.id}"]`); if (!n) { n = document.createElement('div'); n.className = 'mon'; n.dataset.id = e.id; n.innerHTML = monSVG(e.type, k) + `<div class="hp"></div><div class="cd"></div><div class="nm"></div><div class="tip"></div>`; n.onclick = () => strike(e.id); f.appendChild(n); }
    n.classList.toggle('dead', e.dead); n.querySelector('.hp').textContent = e.dead ? '' : e.hp; const cd = n.querySelector('.cd'); cd.textContent = e.cd <= 1 ? '곧 공격!' : `${e.cd}턴 뒤`; cd.classList.toggle('hot', e.cd <= 1); cd.style.display = e.dead ? 'none' : '';
    n.querySelector('.nm').textContent = e.name; n.querySelector('.tip').textContent = e.type === 'golem' ? `딱 ${e.weak}으로 치면 두 배!` : (e.type === 'slime' ? '' : E.MON[e.type].tip); n.classList.toggle('aim', sel.length > 0 && !e.dead); have.delete(e.id); });
  for (const id of have) f.querySelector(`[data-id="${id}"]`)?.remove();
  const h = $('hand'); h.innerHTML = ''; S.hand.forEach((c, i) => { const p = sel.find(x => x.id === c.id), b = document.createElement('button'); b.className = 'card' + (p ? ' sel' : '') + (p?.neg ? ' neg' : '') + (p?.dbl ? ' dbl' : ''); b.style.animationDelay = (i * .04) + 's'; b.textContent = p?.neg ? '−' + c.v : p?.dbl ? c.v + '×2' : c.v; if (p?.dbl) b.style.fontSize = 'clamp(1.2rem,3.4vw,2rem)';
    b.onclick = () => { if (busy) return; audio(); SFX.pick(); const j = sel.findIndex(x => x.id === c.id); if (j >= 0) sel.splice(j, 1); else sel.push({ id: c.id }); render(); };
    if (p) { const mods = []; if (S.relics.includes('minus') && !S.used.minus && !sel.some(x => x.neg && x.id !== c.id)) mods.push(['neg', p.neg ? '더하기로' : '빼기로']); if (S.relics.includes('double') && !S.used.double && !sel.some(x => x.dbl && x.id !== c.id)) mods.push(['dbl', p.dbl ? '그대로' : '두 배']);
      if (mods.length) { const m = document.createElement('span'); m.className = 'mod'; mods.forEach(([k, label]) => { const mb = document.createElement('b'); mb.textContent = label; mb.onclick = ev => { ev.stopPropagation(); p[k] = !p[k]; if (k === 'neg' && p.neg) p.dbl = false; if (k === 'dbl' && p.dbl) p.neg = false; render(); }; m.appendChild(mb); }); b.appendChild(m); } }
    h.appendChild(b); });
  $('acts').innerHTML = '칠 수 있는 횟수 ' + Array.from({ length: Math.max(E.ACTS, S.acts) }, (_, i) => `<i class="${i < S.acts ? '' : 'off'}"></i>`).join(''); $('endTurn').disabled = busy || S.phase !== 'battle';
  expr(); }
function vals(){ return sel.map(p => { const c = S.hand.find(h => h.id === p.id); return c ? (p.dbl ? c.v * 2 : c.v) * (p.neg ? -1 : 1) : 0; }); }
const fmt = v => v.map((x, i) => (i ? (x < 0 ? ' − ' : ' + ') : (x < 0 ? '−' : '')) + Math.abs(x)).join('');
function expr(extra){ const v = vals(); if (extra) { $('expr').innerHTML = extra; return; } if (!v.length) { $('expr').innerHTML = `<small>${S.acts > 0 ? '카드를 고르고 몬스터를 눌러요' : '다 쳤어요 — 턴 넘기기'}</small>`; return; } const sum = v.reduce((a, b) => a + b, 0); $('expr').innerHTML = fmt(v) + (v.length > 1 || OPT.sum === 'show' ? ` = <span class="q">${OPT.sum === 'show' ? sum : '?'}</span>` : ''); }
function float(id, text, col = '#fff'){ const n = $('field').querySelector(`[data-id="${id}"]`); if (!n) return; const f = document.createElement('div'); f.className = 'fl'; f.style.color = col; f.textContent = text; n.appendChild(f); setTimeout(() => f.remove(), 1100); }
function flash(col){ const f = $('flash'); f.style.background = col; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
function shake(id){ const n = $('field').querySelector(`[data-id="${id}"]`); if (!n) return; n.classList.remove('hit'); void n.offsetWidth; n.classList.add('hit'); }
function popRelic(id){ const n = $('relics').querySelector(`[data-r="${id}"]`); if (n) { n.classList.remove('pop'); void n.offsetWidth; n.classList.add('pop'); } SFX.relic(); }

// ── 일어난 일을 차례로 보여 준다
async function play(ev){ busy = true; render();
  for (const e of ev) { switch (e.t) {
    case 'nope': expr(`<small>${e.why}</small>`); await sleep(600); break;
    case 'sum': expr(`${fmt(e.vals)} = <span class="q">${e.sum}</span>`); await sleep(e.vals.length > 1 ? 520 : 240); break;
    case 'weak': float(e.id, `두 배! ${e.dmg}`, '#ffd35c'); flash('#ffd35c'); SFX.bolt(); await sleep(350); break;
    case 'blocked': float(e.id, e.why, '#9fb6ff'); SFX.block(); shake(e.id); await sleep(650); break;
    case 'over': float(e.id, `${e.by} 넘쳤어`, '#ffb3b3'); SFX.over(); await sleep(450); break;
    case 'hit': shake(e.id); float(e.id, (e.bolt ? '번개 ' : '') + '−' + e.dmg, e.bolt ? '#8fe3ff' : '#fff'); e.bolt ? SFX.bolt() : SFX.hit(); render(); await sleep(420); break;
    case 'exact': float(e.id, '딱!', '#6dffb0'); flash('#6dffb0'); SFX.exact(); render(); await sleep(520); break;
    case 'kill': shake(e.id); render(); await sleep(360); break;
    case 'draw': SFX.draw(); render(); await sleep(200); break;
    case 'relic': popRelic(e.id); await sleep(380); break;
    case 'heal': render(); await sleep(200); break;
    case 'revive': render(); float(e.id, '다시 일어났어!', '#ff8fd0'); await sleep(700); break;
    case 'enemyHit': shake(e.id); float(e.id, '공격!', '#ff6b81'); await sleep(380); break;
    case 'grow': render(); float(e.id, '쑥 +1', '#ffd35c'); await sleep(360); break;
    case 'guard': expr('<small>짝수 방패가 막았어!</small>'); await sleep(500); break;
    case 'hurt': flash('#ff3050'); SFX.hurt(); render(); await sleep(520); break;
    case 'turn': render(); break; } }
  busy = false; sel = sel.filter(p => S.hand.some(c => c.id === p.id)); render(); after(); }
function strike(id){ if (busy || !S || S.phase !== 'battle') return; audio(); if (!sel.length) { expr('<small>먼저 카드를 골라요</small>'); return; } const picks = sel.slice(); sel = []; play(E.attack(S, picks, id)); }
$('endTurn').onclick = () => { if (busy || !S || S.phase !== 'battle') return; audio(); sel = []; play(E.endTurn(S)); };

// ── 방 사이
function after(){ if (S.phase === 'reward') { $('rwK').textContent = `${E.NODES[S.node]} 방을 깼어!`; const box = $('rwPick'); box.innerHTML = ''; S.reward.forEach((r, i) => { const b = document.createElement('button'); b.innerHTML = r.kind === 'relic' ? `<b>${E.RELICS[r.id].name}</b><span>${E.RELICS[r.id].desc}</span>` : `<em>${r.v}</em><b>새 카드</b><span>내 카드 묶음에 ${r.v} 카드가 한 장 들어와요</span>`; b.onclick = () => { E.takeReward(S, i); $('reward').classList.add('hidden'); $('field').innerHTML = ''; sel = []; render(); after(); }; box.appendChild(b); }); SFX.win(); $('reward').classList.remove('hidden'); }
  else if (S.phase === 'rest') $('rest').classList.remove('hidden');
  else if (S.phase === 'won' || S.phase === 'lost') finish(); }
$('restGo').onclick = () => { E.rest(S); $('rest').classList.add('hidden'); $('field').innerHTML = ''; render(); };
function finish(){ const won = S.phase === 'won', pts = E.score(S); for (const m of S.seen.mon) if (!meta.mon.includes(m)) meta.mon.push(m); for (const r of S.seen.relic) if (!meta.relic.includes(r)) meta.relic.push(r);
  meta.best = Math.max(meta.best, S.node + (won ? 1 : 0)); if (won) { meta.wins++; meta.hard = Math.min(5, Math.max(meta.hard, S.hard + 1)); } saveMeta();
  const gr = grow.apply({ id: 'cards', term: S.term, pts, ok: S.stat.exact, glevel: S.node + (won ? 1 : 0) });
  $('eK').textContent = `${E.TERMS.find(t => t.id === S.term).label}` + (S.hard ? ` · 오름 ${S.hard}` : ''); $('eScore').textContent = pts.toLocaleString('ko-KR') + '점'; $('eTitle').textContent = won ? '골렘을 쓰러뜨렸어!' : `${E.NODES[S.node]} 방에서 쓰러졌어`;
  $('eLine').textContent = `딱 맞힘 ${S.stat.exact}번 · 쓰러뜨림 ${S.stat.kills} · 넘침 ${S.stat.over}번 · 능력 ${S.relics.length}개` + (won && S.hard < 5 ? ` · 오름 ${S.hard + 1} 이 열렸어` : '');
  $('eGrow').textContent = `성장 +${gr.gained} · 레벨 ${gr.after.lv} 「${gr.after.title}」` + (gr.after.lv > gr.before.lv ? ' — 레벨 업!' : ''); won ? SFX.win() : SFX.hurt(); $('end').classList.remove('hidden'); }
function start(){ audio(); S = E.newRun(OPT.term, (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, OPT.hard); sel = []; busy = false; $('field').innerHTML = ''; ['title', 'end', 'reward', 'rest'].forEach(k => $(k).classList.add('hidden')); render(); }
function title(){ const row = $('rHard'); row.innerHTML = ''; for (let h = 0; h <= meta.hard; h++) { const b = document.createElement('button'); b.textContent = h ? `오름 ${h}` : '기본'; b.dataset.v = h; b.className = OPT.hard === h ? 'on' : ''; b.onclick = () => { OPT.hard = h; title(); }; row.appendChild(b); } row.style.display = meta.hard ? '' : 'none';
  $('dex').textContent = `도감 — 몬스터 ${meta.mon.length}/${Object.keys(E.MON).length} · 능력 ${meta.relic.length}/${Object.keys(E.RELICS).length} · 이긴 횟수 ${meta.wins} · 가장 멀리 간 방 ${meta.best}/${E.NODES.length}` + (grow.persists() ? '' : '  (지금은 이 화면을 닫으면 사라져요)');
  ['end', 'reward', 'rest'].forEach(k => $(k).classList.add('hidden')); $('title').classList.remove('hidden'); }
E.TERMS.forEach(t => { const b = document.createElement('button'); b.dataset.v = t.id; b.textContent = t.label; $('rTerm').appendChild(b); });
[['rTerm', 'term'], ['rSum', 'sum']].forEach(([row, key]) => { const set = () => $(row).querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === OPT[key])); set(); $(row).querySelectorAll('button').forEach(b => b.onclick = () => { OPT[key] = b.dataset.v; set(); }); });
$('go').onclick = start; $('again').onclick = start; $('toTitle').onclick = title;
for (let i = 0; i < 40; i++) { const s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 60 + '%'; s.style.animationDelay = Math.random() * 3 + 's'; $('bg').appendChild(s); }
title();
window.__cards = { get S(){ return S; }, E, OPT, meta, start, strike, get sel(){ return sel; }, set sel(v){ sel = v; }, render };

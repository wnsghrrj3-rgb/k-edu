/* 수 카드 모험 — 화면. 규칙은 engine.js 가 전부 정하고, 여기는 보여 주고 누른 것을 넘길 뿐이다. */
import * as E from './engine.js';
import * as grow from '/kmotion/taste/grow.js';
const $ = id => document.getElementById(id), sleep = ms => new Promise(r => setTimeout(r, ms));
const qs = new URLSearchParams(location.search);
const OPT = { term: qs.get('g') && qs.get('s') ? `${qs.get('g')}-${qs.get('s')}` : '1-2', sum: 'show', hard: 0 };      // sum 'show' = 도움 눈금 켬(기본) · 'hide' = 혼자 셈하기
if (!E.TERMS.some(t => t.id === OPT.term)) OPT.term = '1-2';
const META_KEY = 'kedu_mathplay_cards_v1';
const meta = (() => { try { return Object.assign({ wins: 0, best: 0, mon: [], relic: [], hard: 0, tut: 0 }, JSON.parse(localStorage.getItem(META_KEY) || '{}')); } catch (_) { return { wins: 0, best: 0, mon: [], relic: [], hard: 0 }; } })();
const saveMeta = () => { try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (_) {} };
let S = null, sel = [], busy = false, TUT = 0, tutMsg = '';      // TUT = 배우는 방 단계(0 = 아님)        // sel = [{id, neg, dbl}]

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
  S.enemies.forEach((e, k) => { let n = f.querySelector(`[data-id="${e.id}"]`); if (!n) { n = document.createElement('div'); n.className = 'mon'; n.dataset.id = e.id; n.innerHTML = monSVG(e.type, k) + `<div class="hp"></div><div class="cd"></div><div class="gauge"></div><div class="nm"></div><div class="tip"></div>`; n.onclick = () => strike(e.id); f.appendChild(n); }
    n.classList.toggle('dead', e.dead); n.querySelector('.hp').textContent = e.dead ? '' : e.hp; const cd = n.querySelector('.cd'); cd.textContent = e.cd <= 1 ? '곧 공격!' : `${e.cd}턴 뒤`; cd.classList.toggle('hot', e.cd <= 1); cd.style.display = e.dead ? 'none' : '';
    n.querySelector('.nm').textContent = e.name; n.querySelector('.tip').textContent = e.type === 'golem' ? `딱 ${e.weak}으로 치면 두 배!` : (e.type === 'slime' ? '' : E.MON[e.type].tip); n.classList.toggle('aim', sel.length > 0 && !e.dead); gauge(n.querySelector('.gauge'), e); have.delete(e.id); });
  for (const id of have) f.querySelector(`[data-id="${id}"]`)?.remove();
  const h = $('hand'); h.innerHTML = ''; S.hand.forEach((c, i) => { const p = sel.find(x => x.id === c.id), b = document.createElement('button'); b.className = 'card' + (p ? ' sel' : '') + (p?.neg ? ' neg' : '') + (p?.dbl ? ' dbl' : ''); b.style.animationDelay = (i * .04) + 's'; b.innerHTML = `<span>${p?.neg ? '−' + c.v : p?.dbl ? c.v + '×2' : c.v}</span>` + (c.v <= 10 ? `<span class="dots">${'<i></i>'.repeat(c.v)}</span>` : ''); if (p?.dbl) b.style.fontSize = 'clamp(1.2rem,3.4vw,2rem)';
    b.onclick = () => { if (busy) return; audio(); SFX.pick(); const j = sel.findIndex(x => x.id === c.id); if (j >= 0) sel.splice(j, 1); else sel.push({ id: c.id }); render(); };
    if (p) { const mods = []; if (S.relics.includes('minus') && !S.used.minus && !sel.some(x => x.neg && x.id !== c.id)) mods.push(['neg', p.neg ? '더하기로' : '빼기로']); if (S.relics.includes('double') && !S.used.double && !sel.some(x => x.dbl && x.id !== c.id)) mods.push(['dbl', p.dbl ? '그대로' : '두 배']);
      if (mods.length) { const m = document.createElement('span'); m.className = 'mod'; mods.forEach(([k, label]) => { const mb = document.createElement('b'); mb.textContent = label; mb.onclick = ev => { ev.stopPropagation(); p[k] = !p[k]; if (k === 'neg' && p.neg) p.dbl = false; if (k === 'dbl' && p.dbl) p.neg = false; render(); }; m.appendChild(mb); }); b.appendChild(m); } }
    h.appendChild(b); });
  $('acts').innerHTML = '칠 수 있는 횟수 ' + Array.from({ length: Math.max(E.ACTS, S.acts) }, (_, i) => `<i class="${i < S.acts ? '' : 'off'}"></i>`).join(''); $('endTurn').disabled = busy || S.phase !== 'battle';
  expr(); }
/* 도움 눈금: 몬스터 수만큼 칸이 있고, 고른 카드의 합이 몇 칸을 채우는지 미리 보인다(딱 = 초록, 모자람 = 노랑, 넘침 = 빨강) */
function gauge(g, e){ if (e.dead || OPT.sum !== 'show') { g.innerHTML = ''; return; } const v = vals(), sum = v.reduce((a, b) => a + b, 0), on = v.length > 0 && sum > 0;
  const blocked = on && ((e.type === 'shield' && sum % 2) || (e.type === 'bat' && sum % 2 === 0)), dmg = e.type === 'golem' && sum === e.weak ? sum * 2 : sum, cls = !on ? '' : blocked ? 'no' : dmg === e.hp ? 'ok' : dmg > e.hp ? 'over' : 'part';
  if (e.hp <= 20) g.innerHTML = Array.from({ length: e.hp }, (_, i) => `<i class="${on && !blocked && i < dmg ? cls : ''}"></i>`).join('') + (cls === 'over' ? `<em>+${dmg - e.hp}</em>` : '');
  else g.innerHTML = `<u><b class="${cls}" style="width:${on && !blocked ? Math.min(100, dmg / e.hp * 100) : 0}%"></b></u>` + (cls === 'over' ? `<em>+${dmg - e.hp}</em>` : '');
  g.dataset.s = cls; g.title = blocked ? (e.type === 'shield' ? '짝수만' : '홀수만') : ''; }
function vals(){ return sel.map(p => { const c = S.hand.find(h => h.id === p.id); return c ? (p.dbl ? c.v * 2 : c.v) * (p.neg ? -1 : 1) : 0; }); }
const fmt = v => v.map((x, i) => (i ? (x < 0 ? ' − ' : ' + ') : (x < 0 ? '−' : '')) + Math.abs(x)).join('');
function expr(extra){ const v = vals(); coach(); if (extra) { $('expr').innerHTML = extra; return; } if (!v.length) { $('expr').innerHTML = '&nbsp;'; return; } const sum = v.reduce((a, b) => a + b, 0); $('expr').innerHTML = fmt(v) + (v.length > 1 || OPT.sum === 'show' ? ` = <span class="q">${OPT.sum === 'show' ? sum : '?'}</span>` : ''); }
/* 지금 무엇을 하면 되는지 한 줄 + 누를 곳이 반짝 */
function coach(){ const c = $('coach'); if (!S || S.phase !== 'battle') { c.textContent = ''; return; } const en = E.alive(S), hot = en.find(e => e.cd <= 1); let m, glow = null;
  if (busy) m = c.textContent; else if (S.acts <= 0 || !S.hand.length) { m = '이번 차례에 칠 수 있는 만큼 다 쳤어요. 「내 차례 끝」을 눌러요'; glow = 'end'; }
  else if (!sel.length) { m = TUT ? tutMsg : (hot ? `「곧 공격!」 붙은 몬스터부터! 그 수를 만들 카드를 골라요` : `몬스터 수와 같아지게 카드를 골라요 (여러 장을 더해도 돼요)`); glow = 'hand'; }
  else { const sum = vals().reduce((a, b) => a + b, 0), ex = en.find(e => e.hp === sum); m = ex ? `${sum}! 수가 ${sum}인 몬스터를 누르면 「딱」` : `지금 ${OPT.sum === 'show' ? sum : '?'}. 카드를 더 고르거나, 칠 몬스터를 눌러요`; glow = 'mon'; }
  c.textContent = m; $('hand').classList.toggle('glow', glow === 'hand'); $('field').classList.toggle('glow', glow === 'mon'); $('endTurn').classList.toggle('glow', glow === 'end'); }
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
  busy = false; sel = sel.filter(p => S.hand.some(c => c.id === p.id)); render(); after(ev); }
function strike(id){ if (busy || !S || S.phase !== 'battle') return; audio(); if (!sel.length) { expr('<small>먼저 카드를 골라요</small>'); return; } const picks = sel.slice(); sel = []; const me = $('me'); me.classList.remove('cast'); void me.offsetWidth; me.classList.add('cast'); play(E.attack(S, picks, id)); }
$('endTurn').onclick = () => { if (busy || !S || S.phase !== 'battle') return; audio(); sel = []; play(E.endTurn(S)); };

// ── 방 사이
function after(ev = []){ if (TUT) return tutAfter(ev); if (S.phase === 'reward') { $('rwK').textContent = `${E.NODES[S.node]} 방을 깼어!`; const box = $('rwPick'); box.innerHTML = ''; S.reward.forEach((r, i) => { const b = document.createElement('button'); b.innerHTML = r.kind === 'relic' ? `<b>${E.RELICS[r.id].name}</b><span>${E.RELICS[r.id].desc}</span>` : `<em>${r.v}</em><b>새 카드</b><span>내 카드 묶음에 ${r.v} 카드가 한 장 들어와요</span>`; b.onclick = () => { E.takeReward(S, i); $('reward').classList.add('hidden'); $('field').innerHTML = ''; sel = []; render(); after(); }; box.appendChild(b); }); SFX.win(); $('reward').classList.remove('hidden'); }
  else if (S.phase === 'rest') $('rest').classList.remove('hidden');
  else if (S.phase === 'won' || S.phase === 'lost') finish(); }
$('restGo').onclick = () => { E.rest(S); $('rest').classList.add('hidden'); $('field').innerHTML = ''; render(); };
function finish(){ const won = S.phase === 'won', pts = E.score(S); for (const m of S.seen.mon) if (!meta.mon.includes(m)) meta.mon.push(m); for (const r of S.seen.relic) if (!meta.relic.includes(r)) meta.relic.push(r);
  meta.best = Math.max(meta.best, S.node + (won ? 1 : 0)); if (won) { meta.wins++; meta.hard = Math.min(5, Math.max(meta.hard, S.hard + 1)); } saveMeta();
  const gr = grow.apply({ id: 'cards', term: S.term, pts, ok: S.stat.exact, glevel: S.node + (won ? 1 : 0) });
  $('eK').textContent = `${E.TERMS.find(t => t.id === S.term).label}` + (S.hard ? ` · 오름 ${S.hard}` : ''); $('eScore').textContent = pts.toLocaleString('ko-KR') + '점'; $('eTitle').textContent = won ? '골렘을 쓰러뜨렸어!' : `${E.NODES[S.node]} 방에서 쓰러졌어`;
  $('eLine').textContent = `딱 맞힘 ${S.stat.exact}번 · 쓰러뜨림 ${S.stat.kills} · 넘침 ${S.stat.over}번 · 능력 ${S.relics.length}개` + (won && S.hard < 5 ? ` · 오름 ${S.hard + 1} 이 열렸어` : '');
  $('eGrow').textContent = `성장 +${gr.gained} · 레벨 ${gr.after.lv} 「${gr.after.title}」` + (gr.after.lv > gr.before.lv ? ' — 레벨 업!' : ''); won ? SFX.win() : SFX.hurt(); $('end').classList.remove('hidden'); }
/* ── 배우는 방: 세 걸음. 말로 읽히는 규칙 대신 손으로 한 번씩 해 본다 */
const TUTS = [null,
  { en: [['slime', 5, 3]], hand: [5, 2, 3], msg: '슬라임 배에 5가 적혀 있어요. 아래에서 5 카드를 눌러요', done: '수가 같으면 「딱!」 한 번에 쓰러져요' },
  { en: [['slime', 7, 3]], hand: [3, 4, 6], msg: '이번엔 7이에요. 카드 두 장을 골라 7을 만들어요', done: '3 + 4 = 7. 카드를 더해서 딱 맞췄어요!' },
  { en: [['slime', 4, 1], ['slime', 6, 3]], hand: [4, 1, 5, 2], draw: [3, 2], msg: '둘이에요. 「곧 공격!」이 붙은 4부터! 딱 맞히면 한 번 더 칠 수 있어요', done: '딱 맞히면 카드도 한 장 더, 한 번 더! 이제 진짜 모험을 떠나요' }];
function tutStart(n){ audio(); TUT = n; S = E.newRun(OPT.term, 7, 0); const T = TUTS[n]; E.custom(S, T.en, T.hand, T.draw || []); tutMsg = T.msg; sel = []; busy = false; $('field').innerHTML = ''; ['title', 'end', 'reward', 'rest', 'tutEnd'].forEach(k => $(k).classList.add('hidden')); $('tutBar').textContent = `하는 법 ${n} / 3`; render(); }
function tutAfter(ev){ const T = TUTS[TUT];
  if (S.phase === 'tutdone') { const over = ev.some(e => e.t === 'over'), clean = S.stat.over === 0;
    if (!clean) { $('coach').textContent = '넘치게 쳐도 쓰러지긴 해요. 하지만 딱 맞혀야 덤이 있어요 — 한 번 더 해 봐요'; setTimeout(() => tutStart(TUT), 1900); return; }
    $('coach').textContent = T.done; setTimeout(() => { if (TUT < 3) tutStart(TUT + 1); else { TUT = 0; meta.tut = 1; saveMeta(); $('tutBar').textContent = ''; $('tutEnd').classList.remove('hidden'); } }, 1900); return; }
  if (S.phase === 'lost') { tutStart(TUT); return; }
  const left = E.alive(S)[0]; if (left) tutMsg = S.acts <= 0 ? '' : `${left.hp} 남았어요. ${left.hp}을(를) 만들 카드를 골라요`.replace('을(를)', [0, 1, 3, 6, 7, 8].includes(left.hp % 10) ? '을' : '를'); render(); }
function start(){ if (!meta.tut && !TUT) return tutStart(1); audio(); TUT = 0; $('tutBar').textContent = ''; S = E.newRun(OPT.term, (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, OPT.hard); sel = []; busy = false; $('field').innerHTML = ''; ['title', 'end', 'reward', 'rest', 'tutEnd'].forEach(k => $(k).classList.add('hidden')); render(); }
function title(){ const row = $('rHard'); row.innerHTML = ''; for (let h = 0; h <= meta.hard; h++) { const b = document.createElement('button'); b.textContent = h ? `오름 ${h}` : '기본'; b.dataset.v = h; b.className = OPT.hard === h ? 'on' : ''; b.onclick = () => { OPT.hard = h; title(); }; row.appendChild(b); } row.style.display = meta.hard ? '' : 'none';
  $('dex').textContent = `도감 — 몬스터 ${meta.mon.length}/${Object.keys(E.MON).length} · 능력 ${meta.relic.length}/${Object.keys(E.RELICS).length} · 이긴 횟수 ${meta.wins} · 가장 멀리 간 방 ${meta.best}/${E.NODES.length}` + (grow.persists() ? '' : '  (지금은 이 화면을 닫으면 사라져요)');
  ['end', 'reward', 'rest'].forEach(k => $(k).classList.add('hidden')); $('title').classList.remove('hidden'); }
E.TERMS.forEach(t => { const b = document.createElement('button'); b.dataset.v = t.id; b.textContent = t.label; $('rTerm').appendChild(b); });
[['rTerm', 'term'], ['rSum', 'sum']].forEach(([row, key]) => { const set = () => $(row).querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === OPT[key])); set(); $(row).querySelectorAll('button').forEach(b => b.onclick = () => { OPT[key] = b.dataset.v; set(); }); });
$('go').onclick = start; $('again').onclick = start; $('toTitle').onclick = title; $('howto').onclick = () => tutStart(1); $('tutGo').onclick = () => { meta.tut = 1; start(); };
$('me').innerHTML = `<svg viewBox="0 0 160 190"><ellipse cx="80" cy="180" rx="52" ry="9" fill="rgba(0,0,0,.35)"/><path d="M40 176 54 96h52l14 80Z" fill="#5b3fd6" stroke="#c9b8ff" stroke-width="4"/><circle cx="80" cy="78" r="30" fill="#ffd9b3"/><circle cx="70" cy="76" r="4" fill="#122"/><circle cx="92" cy="76" r="4" fill="#122"/><path d="M70 90q10 8 22 0" stroke="#122" stroke-width="3" fill="none"/><path d="M38 58h84L88 4Z" fill="#3a2bb0" stroke="#c9b8ff" stroke-width="4"/><rect x="30" y="54" width="100" height="10" rx="5" fill="#3a2bb0" stroke="#c9b8ff" stroke-width="3"/><circle cx="88" cy="6" r="7" fill="#ffd35c"/><path d="M118 120 150 70" stroke="#8a5a2b" stroke-width="7" stroke-linecap="round"/><circle cx="152" cy="66" r="11" fill="#8fe3ff" stroke="#fff" stroke-width="3"/></svg>나`;
for (let i = 0; i < 40; i++) { const s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 60 + '%'; s.style.animationDelay = Math.random() * 3 + 's'; $('bg').appendChild(s); }
title();
window.__cards = { get S(){ return S; }, get TUT(){ return TUT; }, E, OPT, meta, start, tutStart, strike, get sel(){ return sel; }, set sel(v){ sel = v; }, render };

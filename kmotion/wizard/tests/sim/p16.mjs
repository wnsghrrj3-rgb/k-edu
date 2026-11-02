// v2.12 월드 2 「도형의 신전」 도형 정령 모양 보호막(16 문서 8절 ② · 06 문서 44행) — node tests/sim/p16.mjs
// 학년 줄(1 입체 · 2 평면 · 3·4 직각 도형) 이름 판 정답 하나 · 정사각형 보호막에 직사각형·사각형 이름 없음 / 보호막 ×.3 · 이름 정답 → 깨짐·약점 4초 ×1.5 → 다른 모양으로 다시 / 오답 = 그대로·재도전 예약 0 / 봇 1~4학년 완주 / 숲 4판 정령 0(골든은 golden.mjs)
import { GAME } from '../../sim/game/config.js';
import { createFlow } from '../../sim/flow/screens.js';
import { QuestionEngine, GENERATORS } from '../../sim/learn/questionEngine.js';
import { SPIRIT_SETS, spiritSet, pickSpiritShape } from '../../sim/learn/spirit.js';
import { PIC, FAMILY, CODES, NAME_CODE } from '../../sim/learn/pics.js';
import { picHtml, svgMarkup } from '../../skins/proto/pics.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const T = data.text, ST = data.stages['temple-2-1'], NAME_FAM = Object.fromEntries(Object.entries(NAME_CODE).map(([f, c]) => [c, f]));
const BAN = /예각|둔각|이등변|정삼각형|수직|평행|사다리꼴|마름모|다각형|대각선|90°|원주율|둘레|이등분|타원|π/;

// ── 1. 데이터·문구
{ const D = data.enemies['shape-spirit']; ok('enemies shape-spirit: 원거리·spirit·조각(shard)·HP 45', D && D.ranged && D.spirit && D.attack.proj === 'shard' && D.hp === 45 && D.kind === 'shape-spirit');
  const a2 = ST.zones.find(z => z.id === 'arena-2'), kinds = a2.waves.flatMap(w => w.spawn.map(s => s.kind));
  ok('temple-2-1 전투장 2: 정령 2 · 계산 고블린 1', kinds.filter(k => k === 'shape-spirit').length === 2 && kinds.filter(k => k === 'calc-goblin').length === 1, kinds.join());
  ok('숲 4판·신전 전투장 1·길 = 정령 0', ['forest-1-1', 'forest-1-2', 'forest-1-3', 'forest-1-boss'].every(id => JSON.stringify(data.stages[id]).indexOf('shape-spirit') < 0) && JSON.stringify(ST.zones.filter(z => z.id !== 'arena-2')).indexOf('shape-spirit') < 0);
  const keys = ['q.spirit.name', 'q.spirit', 'toast.spirit', 'toast.spiritBroke', 'learn.g1.solid.name', 'learn.g2.plane.name', 'learn.g3.rshape.name', ...Object.keys(NAME_CODE).flatMap(f => ['hint.spirit.' + f, 'why.nm-' + f])];
  ok(`문구 키 ${keys.length}`, keys.every(k => typeof T[k] === 'string' && T[k].length > 0), keys.filter(k => !T[k]).join());
  ok('4학년↑ 낱말 0', !BAN.test(keys.map(k => T[k]).join('\n')));
  ok('이름 판 코드 40~48: PIC nm-* · FAMILY nm · proto 글자 판 SVG', Object.values(NAME_CODE).every(c => /^nm-/.test(PIC[c]) && FAMILY[PIC[c]] === 'nm' && /<text/.test(picHtml(PIC[c]))) && Object.keys(NAME_CODE).length === 9);
  ok('보호막 그림 svgMarkup: 학년 줄 모양 전부 · CSS 변수 0(이미지로 읽힘)', Object.values(SPIRIT_SETS).flatMap(S => S.fams.flatMap(f => CODES[f])).every(c => { const m = svgMarkup(PIC[c]); return /^<svg xmlns/.test(m) && m.indexOf('var(') < 0; })); }

// ── 2. 생성기 fixed 300 · 엔진 통과(학년별)
for (const [gk, S] of Object.entries(SPIRIT_SETS)) { const qe = new QuestionEngine({ rng: createRng(7), concepts: [] }); let bad = 0, fams = new Set(), note = '';
  for (let i = 0; i < 300; i++) { const sh = pickSpiritShape(qe.rng, gk === 'g1' ? 1 : gk === 'g2' ? 2 : 3); const b = qe.next({ fixed: { concept: sh.concept, fam: sh.fam, code: sh.code } }); fams.add(sh.fam);
    const names = b.choices.map(c => NAME_FAM[c.num]), right = names[b.correctSlot], wr = names.filter((_, k) => k !== b.correctSlot);
    const good = b.concept === S.concept && b.verified && b.choicePic && b.pic === PIC[sh.code] && right === sh.fam && new Set(b.choices.map(c => c.num)).size === 3 && b.choices.every(c => /^nm-/.test(c.pic)) && wr.every(w => S.wrongs[sh.fam].includes(w))
      && !(sh.fam === 'square' && (wr.includes('rect') || wr.includes('quad'))) && !(sh.fam === 'rect' && wr.includes('quad'));
    if (!good) { bad++; note = note || JSON.stringify({ sh, names }); } }
  ok(`${gk} 300: 문제 그림 = 보호막 모양 · 보기 이름 판 3 · 정답 = 그 이름 · 오답 = 그 모양에 틀린 이름(정사각형에 직사각형·사각형 없음) · 모양 묶음 ${S.fams.length} 다 나옴`, bad === 0 && fams.size === S.fams.length, bad ? note : `묶음 ${[...fams]}`); }
{ const rng = createRng(3); let same = 0; for (let g = 1; g <= 4; g++) { let prev = null; for (let i = 0; i < 200; i++) { const s = pickSpiritShape(rng, g, prev); if (s.fam === prev) same++; prev = s.fam; } }
  ok('다시 켜지는 보호막은 늘 다른 모양 묶음(1~4학년 200번씩)', same === 0 && spiritSet(4) === SPIRIT_SETS.g3);
  ok('fixedOnly: 정령 이름 3종은 보통 풀·want 풀에 안 들어감', ['g1.solid.name', 'g2.plane.name', 'g3.rshape.name'].every(k => GENERATORS[k].fixedOnly && !GENERATORS[k].word && !GENERATORS[k].compare && !GENERATORS[k].pattern) && ['forest-1-1', 'temple-2-1'].every(id => !data.stages[id].concepts.some(k => GENERATORS[k].fixedOnly))); }

// ── 3. 판 안: 전투장 2 정령 — 보호막 ×.3 · 수정 → 이름 문제 → 깨짐·약점 ×1.5 → 4초 뒤 다른 모양 / 오답은 그대로
const push = (g, type, value = {}) => g.input.push({ type, t: g.t * 1000, via: 'key', value });
function toSpirit(grade, seed){ const f = createFlow({ data, grade, seed, startZone: 3, stage: 'temple-2-1', forceStage: true }); f.action('start', { mode: 'keyboard' }); f.action('enter'); const g = f.game; const evs = [];
  for (let i = 0; i < 60 * 8; i++) { f.step(1 / 60); evs.push(...f.drainEvents()); const sp = g.enemies.find(e => e.spirit && e.state !== 'spawn' && e.state !== 'dead'); if (sp) return { f, g, sp, evs }; } return { f, g, sp: null, evs }; }
function run(f, g, sec, evs, until = null){ for (let i = 0; i < 60 * sec; i++) { f.step(1 / 60); evs.push(...f.drainEvents()); if (until && until()) return true; } return false; }
function openSpiritQ(f, g, evs){   // 수정이 뜨면 그 자리로 가서 연다(정령 몸은 안 때림)
  return run(f, g, 25, evs, () => { if (g.q) return true; const c = g.crystals.find(x => x.kind === 'math'); if (c) { push(g, 'MOVE', { u: c.pos[0] / GAME.player.xMax }); if (Math.abs(c.pos[0] - g.player.pos[0]) <= GAME.crystal.reach) push(g, 'ATTACK', { zone: 1, side: 'R' }); } g.player.hp = g.player.hpMax; return false; }); }
for (const grade of [1, 2, 3]) {
  const { f, g, sp, evs } = toSpirit(grade, 60 + grade); const S0 = sp && g.snapshot().enemies.find(e => e.uid === sp.uid);
  ok(`${grade}학년 정령 등장: 스냅샷 spirit {pic·up·weak false} · 모양 = 학년 줄 · 첫 정령 토스트`, !!(S0 && S0.spirit && S0.spirit.up && !S0.spirit.weak && spiritSet(grade).fams.includes(FAMILY[S0.spirit.pic]) && evs.some(e => e.type === 'enemy:spawn' && e.kind === 'shape-spirit')), S0 ? JSON.stringify(S0.spirit) : '정령 없음');
  if (!sp) continue;
  // 보호막 ×.3: 같은 rng 상태를 보장할 수 없어 공식으로 — 켜짐/약점의 기대 피해 비
  const hp0 = sp.hp; const before = evs.length; g.input.length = 0;
  { const atk = g.player.atk, D = sp.def.def; const up = Math.max(1, Math.round(atk * GAME.spirit.shieldMul - D * .5)), weak = Math.max(1, Math.round(atk * GAME.spirit.weakMul - D * .5)); ok(`${grade}학년 수치: 마법탄 보호막 ${up} · 약점 ${weak}(치명 없을 때) — 약점이 ${(weak / up).toFixed(1)}배`, weak >= up * 3); }
  // 수정 → 이름 문제
  const opened = openSpiritQ(f, g, evs); const s1 = g.snapshot(), Q = s1.question;
  ok(`${grade}학년 수정 → 문제 kind spirit · spiritUid · 그림 = 보호막 그림 · 보기 이름 판 3`, opened && Q && Q.kind === 'spirit' && Q.spiritUid === sp.uid && Q.pic === PIC[sp.spirit.code] && Q.choices.every(c => /^nm-/.test(c.pic)) && Q.prompt.key === 'q.spirit.name', Q ? Q.kind + ' ' + Q.pic : '안 열림');
  if (!opened || !Q || Q.kind !== 'spirit') continue;
  // 오답 먼저(1학년만) → 보호막 그대로 · 재도전 예약 0
  if (grade === 1) { run(f, g, 2.2, evs, () => g.t >= g.q.readUntil); const w = [0, 1, 2].find(x => x !== g.q.v.correctSlot); push(g, 'SELECT', { slot: w }); run(f, g, 6, evs, () => !g.q);
    ok('1학년 오답: 보호막 그대로 · 약점 없음 · 「why.nm-*」 · 재도전 예약 0', sp.spirit.up && !evs.some(e => e.type === 'enemy:spiritBreak') && evs.some(e => e.type === 'q:wrong' && /^nm-/.test(e.tag)) && g.qe.retry.length === 0, `retry ${g.qe.retry.length}`);
    openSpiritQ(f, g, evs); if (!g.q || g.q.kind !== 'spirit') { ok('1학년 두 번째 정령 문제', false); continue; } }
  run(f, g, 2.2, evs, () => g.t >= g.q.readUntil); const fam0 = sp.spirit.fam; push(g, 'SELECT', { slot: g.q.v.correctSlot }); run(f, g, .2, evs);
  const brk = evs.find(e => e.type === 'enemy:spiritBreak' && e.uid === sp.uid), s2 = g.snapshot().enemies.find(e => e.uid === sp.uid);
  ok(`${grade}학년 정답 → enemy:spiritBreak · up false · weak true · 비틀 · 토스트`, !!brk && s2 && !s2.spirit.up && s2.spirit.weak && s2.spirit.weakT > .8 && g.toast && g.toast.key === 'toast.spiritBroke' && sp.state === 'hurt');
  run(f, g, 1.5, evs, () => !g.q);
  // 약점 중 마법탄 → hit weak:true
  const n0 = evs.length; push(g, 'MOVE', { u: sp.pos[0] / GAME.player.xMax }); for (let i = 0; i < 6; i++) { push(g, 'ATTACK', { zone: 1, side: 'R' }); run(f, g, .35, evs); }
  const wh = evs.slice(n0).filter(e => e.type === 'hit' && e.target === sp.uid);
  ok(`${grade}학년 약점 중 마법탄 = weak:true (보호막 표시 없음)`, wh.length > 0 && wh.every(e => e.weak && !e.shielded) || sp.state === 'dead', `맞음 ${wh.length} ${sp.state}`);
  if (sp.state === 'dead') { ok(`${grade}학년 약점 시간에 처치`, true); continue; }
  const re = run(f, g, GAME.spirit.weakT + 1, evs, () => sp.spirit.up); const sh = evs.find(e => e.type === 'enemy:spiritShield' && e.uid === sp.uid);
  ok(`${grade}학년 약점 4초 뒤 → enemy:spiritShield · 다른 모양 묶음 · 다시 ×.3`, re && !!sh && sh.fam !== fam0 && sh.pic === PIC[sp.spirit.code] && spiritSet(grade).fams.includes(sh.fam), sh ? fam0 + '→' + sh.fam : '안 켜짐');
  const n1 = evs.length; for (let i = 0; i < 4 && sp.state !== 'dead'; i++) { push(g, 'ATTACK', { zone: 1, side: 'R' }); run(f, g, .35, evs); }
  const uh = evs.slice(n1).filter(e => e.type === 'hit' && e.target === sp.uid); ok(`${grade}학년 다시 켜진 보호막에 마법탄 = shielded`, uh.length === 0 || uh.every(e => e.shielded && !e.weak), `맞음 ${uh.length}`);
}
// 조각 탄: 정령 공격 = shard(pic), 숙이면 지나감
{ const { f, g, sp, evs } = toSpirit(2, 77); let shot = null; if (sp) run(f, g, 20, evs, () => { g.player.hp = g.player.hpMax; shot = g.projectiles.find(p => p.kind === 'shard'); return !!shot; });
  const ps = shot && g.snapshot().projectiles.find(p => p.uid === shot.uid);
  ok('정령 공격 = 모양 조각 shard · 스냅샷 pic = 보호막 그림 · 라벨 없음', !!(ps && ps.pic && /^(tri|quad|circ)/.test(ps.pic) && ps.label === null && evs.some(e => e.type === 'telegraph:start' && e.uid === sp.uid && e.shape === 'line'))); }

// ── 4. 봇 완주 1~4학년
for (const grade of [1, 2, 3, 4]) { let wins = 0, brk = 0, note = []; for (let i = 0; i < 3; i++) { const r = playOne({ data, seed: 900 + grade * 10 + i, acc: .85, react: .35, grade, stage: 'temple-2-1', maxT: 900, rand: (() => { let x = 7 + i; return () => (x = (x * 16807) % 2147483647) / 2147483647; })() });
    if (r.win) wins++; brk += r.spiritBreaks || 0; note.push(`${r.win ? '승' : '패'}${r.q}`); }
  ok(`${grade}학년 temple-2-1 봇 3판 완주 · 보호막 깬 수 > 0`, wins === 3 && brk > 0, note.join(' ') + ` 깸 ${brk}`); }

console.table(out); console.log(fail ? `✗ ${fail}개 실패` : '✓ 전부 통과'); process.exit(fail ? 1 : 0);

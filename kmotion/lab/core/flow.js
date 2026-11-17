// 케이모션 과학실 — 흐름: 의뢰 쪽지(지금 할 일은 언제나 하나) · 다음에 집을 기구가 은은히 빛남
// L01 회색 판: 동사 여덟 개를 한 번씩 손에 익히는 연습 쪽지. 화면 글자는 전부 여기(L04 부터 exp.json 문구).

export const DRILL = [
  { say: '보안경을 집어서 화면 아래 「내 몸」 자리에 놓아 써요', glow: 'goggles', done: L => L.worn.face },
  { say: '장갑도 집어서 「내 몸」 자리에 놓아 껴요', glow: 'gloves', done: L => L.worn.hands },
  { say: '그릇을 선반에서 집어 실험대에 내려놓아요', glow: 'bowl', done: L => /^bench_/.test(L.items.get('bowl').slot || '') },
  { say: '통을 가져와 그릇 위에서 손목을 기울여 부어요', glow: 'can', done: L => L.bowl.level >= .3,
    hint: { cam: '쥔 손목을 옆으로 돌리면 그만큼 부어져요', touch: '통을 누른 채 다른 손가락으로 아래로 끌기 · 마우스는 휠' } },
  { say: '집게로 그릇 속을 담가 봐요', glow: 'tongs', done: L => L.counters.dips >= 1 },
  { say: '망치로 나무토막을 쳐요 — 톡, 탁, 쾅! 세 가지 세기로', glow: 'hammer', done: L => L.counters.strikesOnTarget[1] && L.counters.strikesOnTarget[2] && L.counters.strikesOnTarget[3],
    hint: { cam: '망치를 쥐고 아래로 휙 — 빠를수록 세게', touch: '망치를 누른 채 아래로 빠르게 쓸기' } },
  { say: '펌프 손잡이를 쥐고 위아래로 다섯 번', glow: 'pump', done: L => L.counters.pumps >= 5 },
  { say: '다 익혔어요! 이제 마음대로 집고, 붓고, 쳐 봐요', glow: null, done: () => false },
];

export function createFlow({ noteEl, props, mode, audio }){
  let i = -1; const strikeSeen = () => props.counters.strikesOnTarget;
  function show(){ const s = DRILL[i]; const hint = s.hint ? (s.hint[mode] || s.hint.touch) : '';
    let extra = ''; if (s.glow === 'hammer') { const st = strikeSeen(); extra = ['톡', '탁', '쾅'].map((w, k) => (st[k + 1] ? '✔' : '·') + w).join('  '); }
    noteEl.innerHTML = s.say + (hint || extra ? `<small>${[extra, hint].filter(Boolean).join(' · ')}</small>` : ''); noteEl.style.display = ''; props.glow(s.glow);
    noteEl.classList.add('flip'); setTimeout(() => noteEl.classList.remove('flip'), 260); }
  function next(){ i = Math.min(DRILL.length - 1, i + 1); show(); }
  next();
  let lastExtra = '';
  return {
    get step(){ return i; }, get total(){ return DRILL.length; },
    update(){ const s = DRILL[i]; if (s.done(props)) { audio.ok(); next(); return; }
      if (s.glow === 'hammer') { const e = strikeSeen().join(); if (e !== lastExtra) { lastExtra = e; show(); } } },
  };
}

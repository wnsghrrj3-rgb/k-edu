// 케이히스토리 엔진 · jokbo.js — 「족보」 한 장. 열 시대를 산 흔적(끝 갈림·신분·값·흔적)을 대(代)별로 한 장에 편다.
//  · 코어는 시대 이름을 모른다 — 순서·이름·사슬 한 줄은 eras/chain.json 이 준다.
//  · 읽는 것 = 지난 시대 끝 카드가 남긴 localStorage kworld_carry:<era> + 지금 사는 시대(g.life). 쓰지 않는다(끝 카드가 쓴다).
//  · 「이 집」 = 시각이 앞 대보다 뒤인 줄만. 앞 대보다 먼저 끝난 줄(지난 판에서 남은 것)은 「지난 집」으로 흐리게.
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const V = { craft: '✋', heart: '🤝', grain: '🌾', rank: '🎖' };
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };

/** 이 기기에서 찾은 물려줄 것(core/pulse.js 숨은 것이 kworld_heirlooms 에 쓴다) — era 를 주면 그 시대 것만 */
export function heirloomsOf(era = null, store = (k) => read(k)) { const all = store('kworld_heirlooms') || []; return (era ? all.filter((h) => h.era === era) : all).map((h) => ({ id: h.id, name: h.name, tag: h.tag || null, fact: h.fact || null, from: h.from || null, t: h.t || 0 })); }
/** 숨은 것으로 찾은 수 — 벗의 선물(from)은 n/3 셈에서 뺀다(80) */
const relicN = (list) => (list || []).filter((h) => !h.from).length;
/** 줄마다 물려줄 것 합치기 — carry 에 실린 것(서버에서 와도 됨) + 이 기기 kworld_heirlooms, id 로 겹침 제거 */
const mergeHeir = (a, b) => { const out = []; const seen = new Set(); for (const h of [...(a || []), ...(b || [])]) { if (!h || !h.id || seen.has(h.id)) continue; seen.add(h.id); out.push(h); } return out; };

/** 끝 카드가 남길 한 줄 — life.end() 가 kworld_carry 에 같이 쓴다(제목·신분 이름·흔적 이름까지 적어 두면 족보가 life.json 을 다시 읽을 필요가 없다) */
/** 이 기기에서 붙은 이름(core/spark.js 칭호가 kworld_titles 에 쓴다) — era 를 주면 그 시대 것만 */
export function titlesOf(era = null, store = (k) => read(k)) { const all = store('kworld_titles') || []; return (era ? all.filter((t) => t.era === era) : all).map((t) => ({ id: t.id, name: t.name, line: t.line || null, bitter: !!t.bitter, t: t.t || 0 })); }
/** 운명의 사람 — world.spark.bond.name + 깃발(bond:friend/enemy/met) → { name, how } 또는 null */
export function bondOf(g) { const name = g?.world?.spark?.bond?.name; if (!name || !g.flags) return null; const how = g.flags.has('bond:mended') ? 'mended' : g.flags.has('bond:friend') ? 'friend' : g.flags.has('bond:enemy') ? 'enemy' : g.flags.has('bond:met') ? 'met' : null; return how ? { name, how } : null; }
export const bondLine = (b) => !b ? '' : b.how === 'mended' ? `👤 ${b.name}과 다시 벗` : b.how === 'friend' ? `👤 ${b.name}의 벗` : b.how === 'enemy' ? `👤 ${b.name}과 등졌다` : `👤 ${b.name}을 만났다`;
export function carryRecord(life, branch) {
  const v = life.values; const d = life.d;
  return { craft: v.craft, heart: v.heart, grain: v.grain || 0, rank: v.rank || 0, cap: life.cap(), branch: branch.id, title: branch.title || null, status: life.status || null, statusName: life.statusName || null, nation: life.nation || null, nationName: life.nationName || null, hurt: [...life.hurt], marks: [...life.hurt].map((h) => d.hurts?.[h]?.name || h), sits: life.log.length, heirlooms: heirloomsOf(life.g?.era), titles: titlesOf(life.g?.era), bond: bondOf(life.g), t: Date.now() };
}

/** 줄 모으기 — chain.eras 순서대로. g 가 있으면 지금 사는 시대 줄은 산 채로(값·신분은 지금 것) */
export function collect(chain, g = null, store = (k) => read(k)) {
  const rows = []; let prevT = 0; let seen = false, broken = false;   // seen: 이 집 줄이 하나라도 나왔나(앞쪽 「아직」은 집을 끊지 않는다 — 신석기부터 시작해도 된다)
  for (const e of chain.eras || []) {
    const c = store('kworld_carry:' + e.era); const now = g && g.era === e.era && g.life && !g.flags?.has('life:end') ? g.life : null;
    if (now) { rows.push({ ...e, kind: 'now', nationName: now.nationName, statusName: now.statusName, values: { ...now.values }, cap: now.cap(), marks: [...now.hurt].map((h) => now.d.hurts?.[h]?.name || h), sits: now.log.length, heirlooms: heirloomsOf(e.era, store), titles: titlesOf(e.era, store), bond: bondOf(g) }); seen = true; broken = true; continue; }
    if (!c) { rows.push({ ...e, kind: 'none', heirlooms: heirloomsOf(e.era, store) }); if (seen) broken = true; continue; }
    const inHouse = !broken && c.t >= prevT; if (inHouse) { prevT = c.t; seen = true; } else broken = true;
    rows.push({ ...e, kind: inHouse ? 'lived' : 'old', title: c.title || c.branch, nationName: c.nationName, statusName: c.statusName, values: { craft: c.craft, heart: c.heart, grain: c.grain, rank: c.rank }, cap: c.cap ?? null, marks: c.marks || c.hurt || [], sits: c.sits, heirlooms: mergeHeir(c.heirlooms, heirloomsOf(e.era, store)), titles: (c.titles?.length ? c.titles : titlesOf(e.era, store)), bond: c.bond || null, t: c.t });
  }
  return rows;
}

const vals = (r) => { const v = r.values || {}; const out = [`${V.craft} ${v.craft ?? 0}`, `${V.heart} ${v.heart ?? 0}`]; if (v.grain) out.push(`${V.grain} ${v.grain}`); if (v.rank) out.push(`${V.rank} ${v.rank}${r.cap != null ? `/${r.cap}` : ''}`); return out.join(' · '); };
const when = (t) => t ? new Date(t).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }) : '';

/** 한 장 HTML — #panel 안에서도, 따로 연 페이지에서도 같은 모양 */
export function jokboHtml(chain, rows, opts = {}) {
  const lived = rows.filter((r) => r.kind === 'lived' || r.kind === 'now').length; const total = rows.length;
  const marks = rows.filter((r) => r.kind !== 'old').flatMap((r) => r.marks || []);
  const hist = opts.history || []; const houses = hist.filter((h) => h.era === chain.eras?.[0]?.era).length;
  const head = `<div class="tag">${esc(opts.tag || '족보')}</div><h3>${esc(chain.title || '우리 집 족보')}</h3><p class="sub">${esc(chain.note || '')}</p><p class="jsum">${lived}대 / ${total}대 ${lived === total ? `— ${total}대를 다 살았다` : lived ? '— 아직 가는 중' : '— 아직 아무 대도 살지 않았다'}${marks.length ? ` · 남은 흔적 ${marks.length}` : ''}${houses > 1 ? ` · 지난 집 ${houses - 1}채` : ''}${(() => { const all = rows.filter((r) => r.kind !== 'old').reduce((a, r) => a + (r.heirlooms?.length || 0), 0); const n = rows.filter((r) => r.kind !== 'old').reduce((a, r) => a + relicN(r.heirlooms), 0); const tot = rows.reduce((a, r) => a + (r.relics || 0), 0); return all ? ` · 집에 내려오는 것 ${n}${tot ? `/${tot}` : ''}${all > n ? ` +👤${all - n}` : ''}` : ''; })()}</p>`;
  const body = rows.map((r, i) => {
    const n = `${i + 1}대`;
    if (r.kind === 'none') return `<li class="jrow none"><span class="jn">${n}</span><div><b class="je">${esc(r.short)}</b><span class="jy">${esc(r.years || '')}</span><div class="jt">아직 오지 않은 대</div>${r.heirlooms?.length ? `<div class="jg">🎁 ${esc(r.heirlooms.map((h) => h.name).join(' · '))}</div>` : ''}</div></li>`;
    const who = [r.nationName ? `🏳️ ${esc(r.nationName)}` : '', r.statusName ? `🏠 ${esc(r.statusName)}` : ''].filter(Boolean).join(' · ');
    const tt = r.kind === 'now' ? '지금 사는 중' : r.title || '';
    const tl = (r.kind !== 'old' && (r.titles?.length || r.bond)) ? `<div class="jg jtb">${r.titles?.length ? `🏅 ${esc(r.titles.map((t) => (t.bitter ? '🩹' : '') + t.name).join(' · '))}` : ''}${r.titles?.length && r.bond ? ' · ' : ''}${esc(bondLine(r.bond))}</div>` : '';
    const hl = r.heirlooms?.length ? `<div class="jg">🎁 ${esc(r.heirlooms.map((h) => h.name).join(' · '))}${r.relics ? ` <span class="jd">${relicN(r.heirlooms)}/${r.relics}${r.heirlooms.length > relicN(r.heirlooms) ? ` +👤${r.heirlooms.length - relicN(r.heirlooms)}` : ''}</span>` : ''}</div>` : '';
    return `<li class="jrow ${r.kind}"><span class="jn">${n}</span><div><b class="je">${esc(r.short)}</b><span class="jy">${esc(r.years || '')}${r.kind === 'old' ? ' · 지난 집' : ''}</span>${who ? `<div class="jw">${who}</div>` : ''}<div class="jt">${r.kind === 'now' ? '🔶 ' : '✦ '}${esc(tt)}</div><div class="jv">${vals(r)}${r.marks?.length ? ` · <span class="jh">흔적 ${esc(r.marks.join(', '))}</span>` : ''}${r.sits ? ` · 겪은 상황 ${r.sits}` : ''}${r.t ? ` <span class="jd">${when(r.t)}</span>` : ''}</div>${hl}${tl}${r.chain && r.kind !== 'old' ? `<div class="jc">${esc(r.chain)}</div>` : ''}</div></li>`;
  }).join('');
  return `<div class="chk life jokbo">${head}<ol class="jlist">${body}</ol>${chestHtml(rows)}${titlesHtml(rows, opts.store || ((k) => read(k)))}</div>`;
}

/** 「집에 내려오는 것」 상자 — 이 집 줄(지난 집 제외)에서 찾은 물건을 시대 순으로 한 줄씩. 📜는 찾을 때 적힌 실제 한 줄 */
export function chestHtml(rows) {
  const items = rows.filter((r) => r.kind !== 'old').flatMap((r) => (r.heirlooms || []).map((h) => ({ ...h, era: r.short, idx: rows.indexOf(r) + 1 })));
  if (!items.length) return '';
  const tot = rows.reduce((a, r) => a + (r.relics || 0), 0);
  return `<div class="jchest"><div class="jct">🎁 집에 내려오는 것 <span class="jd">${relicN(items)}${tot ? `/${tot}` : ''}${items.length > relicN(items) ? ` +👤${items.length - relicN(items)}` : ''}</span></div><ul>${items.map((h) => `<li><b>${esc(h.name)}</b><span class="jce">${h.idx}대 ${esc(h.era)}${h.tag ? ` · ${esc(h.tag)}` : ''}${h.from === 'bond' ? ' · 벗의 선물' : ''}</span>${h.fact ? `<div class="jcf">📜 ${esc(h.fact)}</div>` : ''}</li>`).join('')}</ul><p class="sub">시대마다 길에서 안 보이는 자리에 숨어 있다. 찾은 것은 다음 대로 내려간다. 벗이 준 것(👤)도 함께 내려간다.</p></div>`;
}

/** 붙은 이름(core/spark.js 칭호가 kworld_titles 에 쓴다) — 이 집 줄(지난 집 제외)의 시대 순, 쓴 이름은 🩹 */
export function titlesHtml(rows, store = (k) => read(k)) {
  const all = store('kworld_titles') || []; const items = rows.filter((r) => r.kind !== 'old').flatMap((r) => all.filter((t) => t.era === r.era).map((t) => ({ ...t, short: r.short, idx: rows.indexOf(r) + 1 })));
  if (!items.length) return '';
  return `<div class="jchest jtitles"><div class="jct">🏅 붙은 이름 <span class="jd">${items.length}</span></div><ul>${items.map((t) => `<li><b>${t.bitter ? '🩹' : '🏅'} ${esc(t.name)}</b><span class="jce">${t.idx}대 ${esc(t.short)}</span>${t.line ? `<div class="jcf">${esc(t.line)}</div>` : ''}</li>`).join('')}</ul><p class="sub">한 일로 붙는 이름. 쓴 것도 같이 내려간다.</p></div>`;
}

export const JOKBO_CSS = `.jtitles{border-color:#9fb8d8;background:rgba(235,242,255,.6)}.jrow .jg{font-size:12.5px;color:#2d6b3f;margin-top:2px}.jchest{margin:16px 0 4px;padding:12px 14px;border:1px dashed #c9a45c;border-radius:12px;background:rgba(255,250,235,.7)}.jchest .jct{font-weight:700;font-size:15px;margin-bottom:6px}.jchest ul{list-style:none;padding:0;margin:0}.jchest li{padding:5px 0;border-top:1px solid rgba(201,164,92,.25);font-size:13.5px}.jchest li:first-child{border-top:0}.jchest .jce{font-size:11px;opacity:.6;margin-left:8px}.jchest .jcf{font-size:12px;color:#5a4a2a;margin-top:2px;line-height:1.5}.jokbo .jsum{font-weight:700;margin:4px 0 10px}.jlist{list-style:none;padding:0;margin:0;border-left:2px solid #d9caa6;margin-left:14px}.jrow{display:flex;gap:12px;padding:8px 0 8px 16px;position:relative;line-height:1.5}.jrow::before{content:"";position:absolute;left:-7px;top:16px;width:12px;height:12px;border-radius:50%;background:#dfa53f;border:2px solid #fbf6ea;box-shadow:0 0 0 1px #c9a45c}.jrow.none::before{background:#e8dfca}.jrow.old::before{background:#bfb49a}.jrow.now::before{background:#e86a4a;box-shadow:0 0 0 3px rgba(232,106,74,.3)}.jrow .jn{flex:none;width:34px;font-size:12px;color:#9a6a1c;font-weight:700;padding-top:3px}.jrow .je{font-family:var(--serif);font-size:16px}.jrow .jy{font-size:11px;opacity:.6;margin-left:6px}.jrow .jw{font-size:13px;color:#8a5a12}.jrow .jt{font-size:15px;font-weight:700;margin-top:1px}.jrow .jv{font-size:12.5px;opacity:.85;font-variant-numeric:tabular-nums}.jrow .jh{color:#b7492b}.jrow .jd{opacity:.5;font-size:11px}.jrow .jc{font-size:12px;color:#5a4a2a;margin-top:3px;background:rgba(255,255,255,.55);border-radius:8px;padding:4px 8px}.jrow.none{opacity:.45}.jrow.none .jt{font-weight:400;font-size:13px}.jrow.old{opacity:.55}`;

/** 게임 안에서 열기 — 끝 카드·HUD·J 키. chain.json 은 base 의 한 단계 위(eras/) */
export async function openJokbo(g, onClose = null, opts = {}) {
  let chain = null; try { chain = await fetch(g.base.replace(/[^/]+\/$/, '') + 'chain.json').then((r) => r.json()); } catch { }
  if (!chain) { g.ui.say('족보를 못 찾았다.', 3000); return; }
  if (typeof document !== 'undefined' && !document.getElementById('jokbo-css')) { const st = document.createElement('style'); st.id = 'jokbo-css'; st.textContent = JOKBO_CSS; document.head.appendChild(st); }
  const rows = collect(chain, g); const history = read('kworld_jokbo') || [];
  const wasOpen = g.ui.isOpen?.(); g.p.enabled = false;
  const btns = [];
  if (opts.go) btns.push({ label: opts.go.label, primary: true, onClick: () => { g.ui.close(); opts.go.onClick(); } });   // 시대 사이 — 족보 한 장이 먼저 펼쳐지고 다음 시대로
  btns.push({ label: opts.go ? '돌아가기' : '닫기', primary: !opts.go, onClick: () => { g.ui.close(); if (onClose) onClose(); else if (!wasOpen) g.p.enabled = true; } });
  g.ui.open(jokboHtml(chain, rows, { history, tag: opts.tag }), btns);
}

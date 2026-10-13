// 케이히스토리 엔진 · dogam.js — 「신분 도감」. 시대마다 어떤 집이 있었나를 한 장에 펴고, 살아 본 집만 안이 보인다(다른 집은 그림자 — 다시 태어나 보고 싶게).
//  · 코어는 시대 이름을 모른다 — 목록은 eras/dogam.json(tools/build_dogam.py 가 life.json·items.json 에서 굽는다).
//  · 살아 본 기록 = localStorage kworld_dogam { era: { statusId: { n, first, last, name } } } — life.setStatus(태어남)·setStatusTo(삶 중간) 가 적는다(recordStatus).
//    예전 기록(kworld_jokbo 의 끝 신분)도 합친다 — statusId 가 없으면 그 시대의 이름으로 맞춘다. 서버 족보를 syncJokbo 가 채우면 거기서도 따라온다.
//  · 비밀 유지: 삶 중간에 갈리는 집(mid)은 「선택으로 갈린다」까지만 — 어느 자리에서인지는 안 적는다.
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };

/** 산 기록 한 줄 — 태어날 때(setStatus)·삶 중간(setStatusTo) 둘 다. 같은 집을 또 살면 n 만 오른다 */
export function recordStatus(era, id, name, store = { read, write }) {
  if (!era || !id) return null;
  const all = store.read('kworld_dogam') || {}; const e = (all[era] ??= {}); const t = Date.now();
  const r = e[id] || { n: 0, first: t, name }; r.n += 1; r.last = t; if (name) r.name = name; e[id] = r; store.write('kworld_dogam', all); return r;
}

/** 살아 본 집 지도 — kworld_dogam + kworld_jokbo(끝 신분) 합침. { era: { id: rec } } */
export function livedMap(data, store = { read }) {
  const out = {}; const all = store.read('kworld_dogam') || {};
  for (const era in all) { out[era] = { ...(all[era] || {}) }; }
  const hist = store.read('kworld_jokbo') || [];
  for (const h of hist) {
    if (!h?.era) continue; const E = (data?.eras || []).find((x) => x.era === h.era); let id = h.statusId || null;
    if (!id && h.status && E) { const s = E.statuses.find((x) => x.name === h.status || (x.aka || []).includes(h.status)); id = s?.id || null; }
    if (!id) continue; const e = (out[h.era] ??= {}); const r = e[id] || { n: 0, first: h.t || 0, name: h.status }; if (!e[id]) { r.n = 1; r.last = h.t || 0; e[id] = r; }   // 끝 신분은 도감이 없던 때 기록 — 한 번으로 친다
  }
  return out;
}

/** 요약 — 살아 본 집 / 전체 */
export function tally(data, lived) {
  let total = 0, n = 0;
  for (const E of data?.eras || []) for (const s of E.statuses || []) { total++; if (lived?.[E.era]?.[s.id]) n++; }
  return { n, total };
}

const capText = (c) => c == null ? '' : c === 0 ? '🎖 벼슬 계단 없음' : `🎖 천장 ${c}`;

/** 한 장 HTML — #panel 안에서도, 따로 연 페이지에서도 같은 모양. opts.era 가 있으면 그 시대를 맨 위에·펼쳐서 */
export function dogamHtml(data, lived, opts = {}) {
  const { n, total } = tally(data, lived); const nowEra = opts.era || null;
  const eras = [...(data?.eras || [])]; if (nowEra) { const i = eras.findIndex((e) => e.era === nowEra); if (i > 0) eras.unshift(...eras.splice(i, 1)); }
  const head = `<div class="tag">${esc(opts.tag || '신분 도감')}</div><h3>${esc(data?.title || '신분 도감')}</h3><p class="sub">${esc(data?.note || '')}</p><p class="dsum">살아 본 집 <b>${n}</b> / ${total}${n === total && total ? ' — 다 살아 봤다' : ''}</p>`;
  const body = eras.map((E) => {
    const L = lived?.[E.era] || {}; const open = !nowEra || E.era === nowEra; const cnt = (E.statuses || []).filter((s) => L[s.id]).length;
    const cards = (E.statuses || []).map((s) => {
      const r = L[s.id];
      if (!r) return `<li class="dc ghost"><b class="dn">${esc(s.name)}</b><div class="dm">${s.mid ? '삶 중간에 — 선택으로 갈린다' : (s.ways[0] ? `가는 길 — ${esc(s.ways[0])}` : '')}${s.cap != null ? ` · ${capText(s.cap)}` : ''}</div>${s.only?.length || s.closed?.length ? `<div class="dm">${s.only?.length ? `이 집에만 열리는 일 ${s.only.length}` : ''}${s.only?.length && s.closed?.length ? ' · ' : ''}${s.closed?.length ? `닫힌 일 ${s.closed.length}` : ''}</div>` : ''}<div class="dq">아직 살아 보지 않은 집</div></li>`;
      return `<li class="dc lived"><b class="dn">${esc(s.name)}</b>${r.n > 1 ? `<span class="dx">×${r.n}</span>` : ''}${s.cap != null ? `<div class="dm">${capText(s.cap)}</div>` : ''}<p class="ds">${esc(s.say)}</p>${s.ways.length ? `<div class="dw"><i>가는 길</i>${s.ways.map((w) => `<span>${esc(w)}</span>`).join('')}${s.mid ? '<span>삶 중간에 — 선택으로</span>' : ''}</div>` : (s.mid ? '<div class="dw"><i>가는 길</i><span>삶 중간에 — 선택으로</span></div>' : '')}${s.only?.length ? `<div class="dw ok"><i>이 집에만 열리는 일</i>${s.only.map((w) => `<span>${esc(w)}</span>`).join('')}</div>` : ''}${s.closed?.length ? `<div class="dw no"><i>이 집엔 닫힌 일</i>${s.closed.map((w) => `<span>${esc(w)}</span>`).join('')}</div>` : ''}</li>`;
    }).join('');
    const none = !E.statuses?.length ? `<p class="dnone">${esc(E.none || '신분이 없다.')}</p>` : '';
    return `<details class="dera${E.era === nowEra ? ' now' : ''}"${open ? ' open' : ''}><summary><b>${esc(E.short)}</b><span class="dy">${esc(E.years || '')}</span><span class="dcnt">${E.statuses?.length ? `${cnt}/${E.statuses.length}` : '—'}</span></summary>${E.chain ? `<p class="dchain">${esc(E.chain)}</p>` : ''}${none}<ul class="dlist">${cards}</ul></details>`;
  }).join('');
  return `<div class="chk life dogam">${head}${body}</div>`;
}

export const DOGAM_CSS = `.dogam .dsum{font-weight:700;margin:4px 0 10px}.dogam .dsum b{color:#b7692b}.dera{border-top:1px solid rgba(150,120,70,.25);padding:6px 0}.dera summary{cursor:pointer;display:flex;gap:10px;align-items:baseline;font-size:16px;font-family:var(--serif);list-style:none}.dera summary::-webkit-details-marker{display:none}.dera summary::before{content:"▸";font-size:12px;opacity:.6}.dera[open] summary::before{content:"▾"}.dera.now summary b{color:#b7492b}.dera .dy{font-size:11px;opacity:.6}.dera .dcnt{margin-left:auto;font-size:12px;color:#9a6a1c;font-variant-numeric:tabular-nums}.dchain{font-size:12px;color:#5a4a2a;background:rgba(255,255,255,.55);border-radius:8px;padding:4px 8px;margin:4px 0 6px}.dnone{font-size:13px;opacity:.7;margin:4px 0 8px}.dlist{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}.dc{border-radius:12px;padding:10px 12px;line-height:1.45;font-size:12.5px;background:rgba(255,255,255,.6);border:1px solid rgba(150,120,70,.25);text-align:left}.dc .dn{font-size:14px;font-family:var(--serif)}.dc.lived{border-color:#dfa53f;box-shadow:0 2px 10px rgba(223,165,63,.18)}.dc.ghost{opacity:.55;background:repeating-linear-gradient(135deg,rgba(0,0,0,.025) 0 6px,transparent 6px 12px)}.dc.ghost .dn{color:#6a5a3a}.dc .dx{margin-left:6px;font-size:11px;color:#9a6a1c}.dc .dm{font-size:11.5px;color:#8a5a12;margin-top:2px}.dc .ds{margin:6px 0 4px;font-size:12.5px}.dc .dq{margin-top:6px;font-size:11px;color:#8a7a5a;font-style:italic}.dc .dw{margin-top:6px;font-size:11.5px;display:flex;flex-wrap:wrap;gap:4px}.dc .dw i{font-style:normal;color:#9a6a1c;flex-basis:100%;font-size:10.5px;letter-spacing:.3px}.dc .dw span{background:rgba(154,106,28,.08);border:1px solid rgba(154,106,28,.2);border-radius:999px;padding:1px 8px}.dc .dw.ok span{background:rgba(70,140,90,.1);border-color:rgba(70,140,90,.3)}.dc .dw.no span{background:rgba(183,73,43,.08);border-color:rgba(183,73,43,.3);text-decoration:line-through;opacity:.8}@media(max-width:760px){.dlist{grid-template-columns:1fr}}`;

/** 게임 안에서 열기 — HUD 단추·B 키. dogam.json 은 base 의 한 단계 위(eras/) */
export async function openDogam(g, onClose = null, opts = {}) {
  let data = null; try { data = await fetch(g.base.replace(/[^/]+\/$/, '') + 'dogam.json').then((r) => r.json()); } catch { }
  if (!data) { g.ui.say('도감을 못 찾았다.', 3000); return; }
  if (typeof document !== 'undefined' && !document.getElementById('dogam-css')) { const st = document.createElement('style'); st.id = 'dogam-css'; st.textContent = DOGAM_CSS; document.head.appendChild(st); }
  const lived = livedMap(data); const wasOpen = g.ui.isOpen?.(); g.p.enabled = false;
  g.ui.open(dogamHtml(data, lived, { era: g.era, tag: opts.tag }), [{ label: '닫기', primary: true, onClick: () => { g.ui.close(); if (onClose) onClose(); else if (!wasOpen) g.p.enabled = true; } }]);
}

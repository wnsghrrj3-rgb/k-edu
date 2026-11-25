/* 공통 엔진 · 색 겉 — 물건 넷과 고고의 `color` 상태(own · red · blue · yellow · pink · purple · orange · green · brown · white)를 겉에 입힌다(연구소 설계 v1 · 묶음 3-2).
 * 상태를 바꾸는 길은 `t.color = 'blue'` 한 줄이다 — 이 겉이 매 장면 그 값을 읽고 알아서 따라간다(어느 자리에서나: 파란 사과는 둥둥 자리에서도 파랗다).
 *   물들 때: DYE 초에 위에서 아래로 번진다 · 씻길 때(own): WASH 초에 제 색으로 · `t.dyeHalf = true` 면 아래쪽 반만(큰 것을 수조에 한 번 담갔을 때 — 다 못 들어가서. 위 반은 제 색).
 * 꼭짓점 색만 덧칠한다(틈새 그늘 · 밝고 어두움은 남긴다). `material.emissive` 와 고고의 `actor.tint` 는 건드리지 않는다 — 닿았을 때의 빛(things.js)과 온도 겉(skin_temp.js)의 것이다.
 * 고고는 살빛(초록)만 물든다 — 배 · 볼 · 눈은 남긴다. 색 값 · 시간은 자료(data/lab.js stations.potion 의 colors.hex · T.DYE · T.WASH)에서 읽는다. */
import * as THREE from 'three';
import { clamp } from './stage.js';

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** C = 껍데기가 넘기는 것({ things, GOGO, gogo, LAB }). 돌려주는 것: { tick(dt), plain(물건 이름) → 물들지 않은 제 색의 모양(생각 방울용), busy(물건) → 번지는 중인가 }.
 *  한 화면에 하나만 있다 — 두 번 불러도 같은 것을 돌려준다(C.colorSkin). */
export function createColorSkin(C) {
  if (C.colorSkin) return C.colorSkin;
  const { things, GOGO, gogo, LAB } = C, PT = LAB.stations.potion, DYE = PT.T.DYE || 0.35, WASH = PT.T.WASH || 0.6;      // 번지는 시간(자료 v1.2 에는 DYE 가 없다 — 물속에서 물든다. 겉이 번지는 0.35초는 여기 값)
  const HEX = Object.fromEntries(Object.entries(PT.colors.hex).map(([k, v]) => [k, new THREE.Color(v)])), plains = {};
  /** 덧칠할 준비: 꼭짓점마다 제 색 · 물드는 정도(keep) · 높이(0 아래 ~ 1 위) · 아래쪽 반만 물들 때의 금(조금 구불구불하게)을 적어 둔다. */
  function prep(meshes, y0, y1, keep) {
    return meshes.map(m => {
      const g = m.geometry, src = g.attributes.color, pos = g.attributes.position, n = src.count, orig = new Float32Array(n * 3), w = new Float32Array(n), yn = new Float32Array(n), hk = new Float32Array(n); let sum = 0, cnt = 0;
      for (let i = 0; i < n; i++) {
        const r = src.getX(i), gg = src.getY(i), b = src.getZ(i); orig.set([r, gg, b], i * 3); w[i] = keep ? keep(r, gg, b) : 1; yn[i] = clamp((pos.getY(i) - y0) / (y1 - y0), 0, 1);
        hk[i] = clamp((0.56 - yn[i] - 0.035 * Math.sin(pos.getX(i) * 19 + pos.getZ(i) * 13)) / 0.12, 0, 1); if (w[i] > 0.5) { sum += lum(r, gg, b); cnt++; }
      }
      const attr = new THREE.BufferAttribute(Float32Array.from(orig), 3); g.setAttribute('color', attr);
      return { attr, orig, w, yn, hk, avg: Math.max(sum / Math.max(cnt, 1), 0.02), base: Float32Array.from(orig), tgt: Float32Array.from(orig) };
    });
  }
  const items = [];
  for (const t of Object.values(things)) {
    plains[t.name] = t.mesh.geometry.clone();                                    // 물들기 전의 모양(생각 방울에는 상태를 보여 주지 않는다)
    t.mesh.geometry.computeBoundingBox(); const b = t.mesh.geometry.boundingBox; items.push({ t, parts: prep([t.mesh], b.min.y, b.max.y), key: 'own', p: 1, dur: DYE });
  }
  const skins = []; gogo.root.traverse(o => { if (o.isMesh && o.material && o.material.name === 'gogo_skin' && o.geometry.attributes.color) skins.push(o); });
  items.push({ t: GOGO, parts: prep(skins, 0, 1.05, (r, g, b) => clamp((g - Math.max(r, b)) / 0.1, 0, 1)), key: 'own', p: 1, dur: DYE });

  /** 새 색을 정한다: 지금 보이는 색에서 → 그 색으로(밝고 어두움은 제 것을 따른다). color = null 이면 제 색. half = 아래쪽 반만. */
  function repaint(it, color, half) {
    for (const q of it.parts) { q.base.set(q.attr.array);
      for (let i = 0, n = q.w.length; i < n; i++) { const j = i * 3, o = q.orig, k = color ? q.w[i] * (half ? q.hk[i] : 1) : 0;
        if (k <= 0) { q.tgt[j] = o[j]; q.tgt[j + 1] = o[j + 1]; q.tgt[j + 2] = o[j + 2]; continue; }
        const sh = clamp(lum(o[j], o[j + 1], o[j + 2]) / q.avg, 0.42, 1.3);
        q.tgt[j] = o[j] + (color.r * sh - o[j]) * k; q.tgt[j + 1] = o[j + 1] + (color.g * sh - o[j + 1]) * k; q.tgt[j + 2] = o[j + 2] + (color.b * sh - o[j + 2]) * k; } }
    it.p = 0; it.dur = color ? DYE : WASH;
  }
  /** 매 장면: 상태가 바뀐 것을 알아채고, 번지는 중인 것을 위에서 아래로 칠해 간다. */
  function tick(dt) {
    for (const it of items) {
      const c = HEX[it.t.color] ? it.t.color : 'own', key = c === 'own' ? 'own' : c + (it.t.dyeHalf ? '|half' : '');
      if (key !== it.key) { it.key = key; repaint(it, c === 'own' ? null : HEX[c], !!it.t.dyeHalf); }
      if (it.p >= 1) continue; it.p = Math.min(1, it.p + dt / it.dur);
      for (const q of it.parts) { const a = q.attr.array;
        for (let i = 0, n = q.w.length; i < n; i++) { const k = clamp((it.p * 1.4 - (1 - q.yn[i])) / 0.4, 0, 1), j = i * 3; a[j] = q.base[j] + (q.tgt[j] - q.base[j]) * k; a[j + 1] = q.base[j + 1] + (q.tgt[j + 1] - q.base[j + 1]) * k; a[j + 2] = q.base[j + 2] + (q.tgt[j + 2] - q.base[j + 2]) * k; }
        q.attr.needsUpdate = true; }
    }
  }
  return C.colorSkin = { tick, hex: HEX, plain: n => plains[n] || null, busy: t => items.some(it => it.t === t && it.p < 1) };
}

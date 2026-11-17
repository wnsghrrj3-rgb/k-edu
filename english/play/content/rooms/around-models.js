/* ============================================================
 * 둘레 모형 놓기 (모형 설계 v1 · WG0)
 *   방 자료 place.around 의 두 칸을 읽는다:
 *     swap   { rocks: [모형…], mushrooms: [모형…], bushes: [모형…], plants: { 풀 이름: [모형…] } }
 *            — 손으로 지은 바위 · 버섯 · 덤불 · 풀을 **같은 자리에서** 모형으로 바꿔 세운다(자리는 이미 비어 있음이 검사된 자리)
 *     models [[모형, x, z, 크기, 돌림?]] — 더 세우는 것(빈터 밖 뒤쪽의 큰 나무 · 물 위의 연잎)
 *   모형이 안 온 것(set 에 없음)은 null 을 돌려준다 — 부르는 쪽(터 부품)이 손으로 지은 것을 그대로 세운다(G3).
 *   크기: 큰 나무는 키, 나머지는 가장 긴 쪽의 길이. 색은 그 걸음의 잎 색 · 바위 색(around.leaf · around.rock)으로.
 * ============================================================ */
import { modelOf } from '../../core/models.js';
import { MODEL_CONF, TALL } from '../models/kit.js';

/* 손으로 지은 것의 크기 → 모형의 크기(가장 긴 쪽) */
export const SWAP_SIZE = { rocks: r => r * 2.5, mushrooms: s => s * 0.62, bushes: r => r * 1.5, plants: s => s * 1.05 };

export function swapName(around, set, kind, i, sub){
  const sw = (around && around.swap) || {}, list = kind === 'plants' ? (sw.plants || {})[sub] : sw[kind];
  if (!set || !list || !list.length) return null; const n = list[i % list.length]; return n && set[n] ? n : null;      /* 목록의 빈 칸(null)은 「이 차례는 손으로 지은 것 그대로」 */
}
export function putModel(K, set, name, x, y, z, size, around, rot){
  const tones = { leaf: around && around.leaf, rock: around && around.rock };
  const g = modelOf(K, set[name], Object.assign(TALL.test(name) ? { h: size } : { s: size }, { tones, rot: rot == null ? x * 1.7 + z * 0.9 : rot }));
  g.position.set(x, y, z); g.userData.name = name; return g;
}
/* 더 세우는 것 — 낮은 화질에서는 둘 가운데 하나만(큰 나무는 남긴다) */
export function extraModels(K, group, around, set, env){
  const out = []; if (!set) return out;
  ((around && around.models) || []).forEach((m, i) => { const [name, x, z, size, rot] = m; if (!set[name]) return; if (K.LOW && !TALL.test(name) && i % MODEL_CONF.lowEvery) return;
    const wet = env.inWater && env.inWater(x, z), g = putModel(K, set, name, x, env.heightAt(x, z) + (wet ? 0.03 : -0.03), z, size, around, rot); group.add(g); out.push(g); });
  return out;
}

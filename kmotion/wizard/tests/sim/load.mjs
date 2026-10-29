// 노드에서 data/ 읽기(브라우저는 boot.js 가 fetch)
import { readFileSync } from 'node:fs';
const here = new URL('../../', import.meta.url);
const j = p => JSON.parse(readFileSync(new URL(p, here), 'utf8'));
export function loadData(){ return { spells: j('data/spells.json'), enemies: j('data/enemies.json'), anim: j('data/anim-timing.json'), layout: j('data/layout/targets.json'), worlds: j('data/worlds.json'), gradeTable: j('data/concepts-by-grade.json'),
  text: j('data/text/ko.json'), camera: j('contract/camera.json'), stages: { 'forest-1-1': j('data/stages/forest-1-1.json'), 'forest-1-2': j('data/stages/forest-1-2.json'), 'forest-1-3': j('data/stages/forest-1-3.json'), 'forest-1-boss': j('data/stages/forest-1-boss.json') } }; }

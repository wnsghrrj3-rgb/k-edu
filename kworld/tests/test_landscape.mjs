// Run with the vendored Three.js resolver described in run.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {buildLandscape} from '../eras/paleo/landscape.js';
import {Engine} from '../core/engine.js';
const base=new URL('../eras/paleo/',import.meta.url);
const buffer=fs.readFileSync(new URL('paleo.glb',base));
const data=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString());
const e={scene:new THREE.Scene(),colliders:[],interactables:new Map(),onFrame:[],hm:JSON.parse(fs.readFileSync(new URL('height.json',base))),groundY:Engine.prototype.groundY};
for(const node of data.nodes.filter(n=>n.name?.startsWith('ix_'))){
 const center=new THREE.Vector3(...(node.translation||[0,0,0]));
 const obj=new THREE.Group();obj.position.copy(center);e.scene.add(obj);
 e.interactables.set(node.name.slice(3),{obj,center,box:new THREE.Box3().setFromCenterAndSize(center,new THREE.Vector3(.4,.4,.4))});
}
const ids=[...e.interactables.keys()];
const group=buildLandscape(e);
assert.deepEqual([...e.interactables.keys()],ids,'All mission targets must survive');
assert.ok(group.children.length<=20,'Static scenery should be batched');
assert.ok(e.landscapeStats.trees>=50,'Forest should be populated');
assert.ok(e.landscapeStats.grassClumps>5000,'Meadow should be populated');
let vertices=0;
e.scene.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;vertices+=p.count;for(const v of p.array)assert.ok(Number.isFinite(v));if(o.isInstancedMesh)for(const v of o.instanceMatrix.array)assert.ok(Number.isFinite(v));}});
const blocked=(x,z)=>e.colliders.some(b=>b.containsPoint(new THREE.Vector3(x,e.groundY(x,z)+.8,z)));
assert.ok(!blocked(-4,6.5),'Spawn must stay clear');
for(const [id,it] of e.interactables){
 let reachable=false;
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;if(!blocked(it.center.x+Math.cos(a)*1.5,it.center.z+Math.sin(a)*1.5))reachable=true;}
 assert.ok(reachable,`Scenery must not enclose target ${id}`);
}
for(const frame of e.onFrame)frame(.016);
assert.ok(e.interactables.get('npc_elder').box.max.y>1,'Guide must retain a body-sized interaction box');
console.log(`Landscape passed: ${ids.length} targets retained, ${e.landscapeStats.trees} trees, ${group.children.length} scenery batches, ${vertices} shared vertices; clear spawn and target approaches.`);

// Third-person reach must be measured from the student, not the following camera.
const camera=new THREE.PerspectiveCamera();camera.position.set(0,1.5,3.5);camera.lookAt(0,1.5,-3);
const target={center:new THREE.Vector3(0,1.5,-2),box:new THREE.Box3(new THREE.Vector3(-.2,1.3,-2.2),new THREE.Vector3(.2,1.7,-1.8))};
const picker={interactables:new Map([['target',target]])};
assert.equal(Engine.prototype.pickTarget.call(picker,camera,3.2,new THREE.Vector3(0,1.5,0)),target,'Third-person interaction reach');
console.log('Third-person interaction reach passed.');

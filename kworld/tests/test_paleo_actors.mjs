// Headless structural/behavior checks, explicitly NOT a browser rendering test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {animateExplorer,bindDeer} from '../core/paleo-actors.js';
import {Engine} from '../core/engine.js';
const loader=new GLTFLoader();
loader.register(()=>({name:'HEADLESS_TEXTURE_PLACEHOLDER',loadTexture:()=>Promise.resolve(new THREE.Texture())}));
async function asset(name){
 const b=fs.readFileSync(new URL('../assets/actors/'+name+'.glb',import.meta.url));
 const gltf=await loader.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 const bones={};let triangles=0,meshes=0;
 gltf.scene.traverse(o=>{
  if(o.isBone)bones[o.name]=o;
  if(o.isMesh){
   assert.ok(o.isSkinnedMesh);meshes++;triangles+=o.geometry.index.count/3;
   const attrs=o.geometry.attributes;
   for(const v of attrs.position.array)assert.ok(Number.isFinite(v));
   for(let i=0;i<attrs.skinWeight.count;i++){
    const sum=attrs.skinWeight.getX(i)+attrs.skinWeight.getY(i)+attrs.skinWeight.getZ(i)+attrs.skinWeight.getW(i);
    assert.ok(Math.abs(sum-1)<1e-5,'Skin weights normalized');
   }
  }
 });
 gltf.scene.updateMatrixWorld(true);
 gltf.scene.traverse(o=>{if(o.isSkinnedMesh){o.skeleton.update();const p=new THREE.Vector3().fromBufferAttribute(o.geometry.attributes.position,0);const skinned=o.getVertexPosition(0,new THREE.Vector3());assert.ok(skinned.distanceTo(p)<1e-5,'Bind pose unchanged');}});
 console.log(name,{meshes,triangles,bones:Object.keys(bones).length});return {actor:gltf.scene,bones};
}
const h=await asset('paleo-explorer');animateExplorer(h.actor,h.bones);
for(let i=1;i<=240;i++)h.actor.userData.animate(i/60,i<120);
assert.ok(Math.abs(h.bones.thigh_L.rotation.x)<.001,'Walk blends to idle');
h.actor.userData.animate(4.02,false);assert.notEqual(h.bones.head.rotation.y,0,'Idle head movement');
const d=await asset('red-deer');
const original=new THREE.Group(),scene=new THREE.Scene();scene.add(original);
const target={name:'deer_1',id:'1',type:'deer',obj:original,center:new THREE.Vector3(0,1,0),box:new THREE.Box3()};
const engine={scene,onFrame:[],interactables:new Map([['deer_1',target]]),groundY:()=>0,collides:()=>false};
const player={pos:new THREE.Vector3(0,1.55,10),enabled:true,bounds:60};
const frame=bindDeer(engine,player,target,d.actor,d.bones);
frame(.016);assert.equal(d.actor.userData.behavior,'graze');
player.pos.z=6;frame(.016);assert.equal(d.actor.userData.behavior,'alert');
player.pos.z=3;frame(.016);assert.equal(d.actor.userData.behavior,'watch');
player.pos.z=1;frame(.05);assert.equal(d.actor.userData.behavior,'retreat');
for(let i=0;i<100;i++)frame(.016);
assert.ok(d.actor.position.distanceTo(new THREE.Vector3())<=3.001,'Retreat remains near original mission');
assert.ok(target.center.distanceTo(d.actor.position.clone().add(new THREE.Vector3(0,.95,0)))<1e-7,'Interaction center follows animal');
engine.collides=()=>true;player.pos.copy(d.actor.position).add(new THREE.Vector3(0,1.55,.5));
for(let i=0;i<400;i++)frame(.016);
const old=d.actor.position.clone();for(let i=0;i<100;i++)frame(.016);assert.ok(old.distanceTo(d.actor.position)<1e-7,'Collision stops retreat');
Engine.prototype.removeInteractable.call(engine,'deer_1');frame(.016);
assert.equal(original.parent,null);assert.equal(engine.onFrame.length,0,'Removed deer stops updating');
assert.equal(engine.interactables.size,0);
console.log('Actor skeletons, blend-to-idle, distance reactions, bounded movement, collision, moving target and hunt removal passed.');

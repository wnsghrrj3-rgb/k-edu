import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createAvatar } from '../../core/avatar.js';

// Deterministic, native geometry. Shared instanced meshes keep the woodland inexpensive.
export function buildLandscape(e, quality = 'high') {
  const LOW = quality === 'low'; // 태블릿: 나무·잎·풀을 줄이고 캐노피 그림자 끔
  const group = new THREE.Group(); group.name = 'paleo-landscape'; e.scene.add(group);
  let seed = 1847;
  const rnd = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const between = (a, b) => a + (b - a) * rnd();
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.94, ...extra });
  const rock = mat(0x888678), darkRock = mat(0x56594f), bark = mat(0x51402e), wood = mat(0x91734f);
  const hide = mat(0xae8660, { side: THREE.DoubleSide }), rope = mat(0xc5ab7d);
  const leaf = mat(0x60774a, { side: THREE.DoubleSide }), grass = mat(0x768052, { side: THREE.DoubleSide });
  const moss = mat(0x667451), soil = mat(0x80735c);
  for (const [material, source] of [[rock,'stone'],[darkRock,'stone'],[bark,'bark'],[wood,'wood']]) {
    const original=e.materials?.get(source);
    if(original) for(const key of ['map','normalMap','roughnessMap']) if(original[key]) material[key]=original[key];
  }
  const pixels=new Uint8Array(128*128*4);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    const stitch=(x%42<1 || y%63<1)?-.22:0,n=(rnd()-.5)*.16+stitch;
    const i=(y*128+x)*4;pixels[i]=Math.max(0,210+n*255);pixels[i+1]=Math.max(0,186+n*255);pixels[i+2]=Math.max(0,149+n*255);pixels[i+3]=255;
  }
  const hideTexture=new THREE.DataTexture(pixels,128,128);hideTexture.colorSpace=THREE.SRGBColorSpace;hideTexture.magFilter=THREE.LinearFilter;hideTexture.minFilter=THREE.LinearMipmapLinearFilter;hideTexture.generateMipmaps=true;hideTexture.needsUpdate=true;hide.map=hideTexture;
  const dummy = new THREE.Object3D(), color = new THREE.Color();
  const rockGeo = new THREE.IcosahedronGeometry(1, 2);
  const pos = rockGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const r = 1 + 0.13 * Math.sin(x * 8 + z * 4) * Math.cos(y * 7 - z * 3) + 0.05 * Math.sin(y * 19 + x * 6);
    pos.setXYZ(i, x * r, y * r, z * r);
  }
  rockGeo.computeVertexNormals();
  const add = (geometry, material, xyz, scale = [1, 1, 1]) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...xyz); mesh.scale.set(...scale);
    mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
  };
  const stone = (x, y, z, sx, sy, sz, material = rock) => {
    const m = add(rockGeo, material, [x, y, z], [sx, sy, sz]); m.rotation.set(between(-.15, .15), rnd() * 6.28, between(-.12, .12)); return m;
  };
  const branchGeo = new THREE.CylinderGeometry(.3, 1, 1, 7);
  const pole = (a, b, radius, material = bark) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), delta = vb.clone().sub(va);
    const m = add(branchGeo, material, va.clone().add(vb).multiplyScalar(.5).toArray(), [radius, delta.length(), radius]);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); return m;
  };
  const collider = (x, z, radius, height) => {
    const y = e.groundY(x, z); e.colliders.push(new THREE.Box3(new THREE.Vector3(x-radius,y,z-radius), new THREE.Vector3(x+radius,y+height,z+radius)));
  };
  // An irregular rock shelter, open toward the east/camp. The entrance remains walkable.
  for (let i = 0; i < 19; i++) {
    const angle = Math.PI * .34 + i / 18 * Math.PI * 1.32;
    const x = -29 + Math.cos(angle) * 6.3, z = 5 + Math.sin(angle) * 5.6;
    stone(x, e.groundY(x, z) + between(1.6, 2.6), z, between(2.3, 3.5), between(3, 4.5), between(2, 3.4));
    collider(x,z,1.8,6);
  }
  for (let i = 0; i < 9; i++) {
    const x = -31 + (i % 3) * 3, z = 1.5 + Math.floor(i / 3) * 3.1;
    stone(x, 6.1 + between(-.4, .6), z, 3.2, 1.8, 2.9);
  }
  stone(-23.1, 4.95, 5, 2.6, 1.05, 3.7); // overhanging lintel, well above player height
  stone(-22.6, 1.9, 1.8, 1.25, 2.5, 1.4);
  stone(-22.6, 1.9, 8.5, 1.3, 2.5, 1.4);
  collider(-22.6, 1.8, 1.0, 4); collider(-22.6, 8.5, 1.0, 4);
  add(new THREE.CircleGeometry(4.4, 40), soil, [-26.2, .44, 5]).rotation.x = -Math.PI / 2;
  // Replace the guide's block mannequin without changing its interaction identifier.
  const guide=e.interactables.get('npc_elder');
  if(guide){
    const center=guide.center.clone();e.scene.remove(guide.obj);
    const actor=createAvatar(true);actor.position.set(center.x,e.groundY(center.x,center.z),center.z);actor.rotation.y=-1.2;e.scene.add(actor);
    guide.obj=actor;guide.box=new THREE.Box3().setFromObject(actor);guide.center=guide.box.getCenter(new THREE.Vector3());
    let time=0;e.onFrame.push(dt=>{time+=dt;actor.userData.animate(time,false);});
  }
  // A dark recess is actual rock, not a black rectangular doorway.
  stone(-31.8, 2.1, 5, 1.2, 3, 4, darkRock);
  for (let i = 0; i < 18; i++) {
    const x = between(-35, -24), z = between(-1, 11);
    stone(x, between(5.7, 6.5), z, between(.4, 1), .17, between(.3, .8), moss);
  }
  // Hide shelters with sewn panels, ridge poles, ties and a clearly open entrance.
  function shelter(x, z, angle, size = 1) {
    const base = e.groundY(x, z);
    const P = (a,b,c) => [x + (a*Math.cos(angle)-c*Math.sin(angle))*size, base+b*size, z+(a*Math.sin(angle)+c*Math.cos(angle))*size];
    for (const end of [-1.65, 1.65]) {
      pole(P(-1.55,0,end),P(0,2.7,end),.065*size,wood);
      pole(P(1.55,0,end),P(0,2.7,end),.065*size,wood);
    }
    pole(P(0,2.62,-2),P(0,2.62,2),.08*size,wood);
    for (const side of [-1,1]) {
      const vertices = [], uv = [], indices = [], nx=8, nz=12;
      for(let j=0;j<=nz;j++) for(let i=0;i<=nx;i++) {
        const u=i/nx,v=j/nz, sag=Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*.16;
        vertices.push(...P(side*(1.48*u+sag),2.48*(1-u)+.16-sag,-1.62+v*3.24)); uv.push(u,v);
      }
      for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;indices.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();add(geo,hide,[0,0,0]);
      for(const zz of [-1.65,-.55,.55,1.65]) pole(P(side*1.46,.2,zz),P(side*1.95,.05,zz),.012*size,rope);
    }
    for(let i=0;i<5;i++)pole(P(-.6+i*.28,.09,-1),P(-.6+i*.28,.09,.65),.08*size,wood);
    // Only the side supports block movement; the middle remains accessible.
    for (const side of [-1,1]) for(const end of [-1.6,1.6]) { const p=P(side*1.5,0,end);collider(p[0],p[2],.17,2.5); }
  }
  shelter(-.6,4.5,.25,1.1); shelter(-5,11,1.6,.8);
  // Stacked firewood, camp seats and stone-working station.
  for(let row=0;row<3;row++)for(let i=0;i<4-row;i++)pole([1+i*.24+row*.12,.3+row*.2,7.1],[1+i*.24+row*.12,.3+row*.2,8.4],.11,wood);
  pole([-7,.6,6.5],[-4,.6,7.3],.28,bark);
  stone(-10.8,e.groundY(-10.8,3)+.28,3,.95,.35,.65);
  for(let i=0;i<6;i++)stone(-10.8+between(-.6,.6),e.groundY(-10.8,3)+.65,3+between(-.4,.4),.12,.06,.09,darkRock);
  // Distant ridges give the play space a valley silhouette instead of a flat horizon.
  const ridgeMat = mat(0x728379);
  for(let i=0;i<26;i++){
    const a=i/26*Math.PI*2, radius=between(87,108),x=Math.cos(a)*radius,z=Math.sin(a)*radius;
    stone(x,between(0,5),z,between(12,22),between(8,17),between(12,20),ridgeMat);
  }
  // Instanced trees: branching trunks and hundreds of individual leaf clusters.
  const trunks=[], foliage=[], blades=[], pebbles=[];
  const pushPole=(a,b,r)=>{
    const v=new THREE.Vector3(...a),d=new THREE.Vector3(...b).sub(v);
    dummy.position.copy(v.addScaledVector(d,.5));dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());dummy.scale.set(r,d.length(),r);dummy.updateMatrix();trunks.push(dummy.matrix.clone());
  };
  // Pointed leaf silhouettes, rather than solid polygon balls.
  const leafVertices=[];
  for(let i=0;i<9;i++){
    const a=i*2.399,cx=between(-.65,.65),cy=between(-.3,.3),cz=between(-.65,.65);
    const length=between(.35,.65),width=length*.3;
    const point=(u,v,w=0)=>[cx+Math.cos(a)*u-Math.sin(a)*v,cy+w,cz+Math.sin(a)*u+Math.cos(a)*v];
    const start=point(-length*.5,0),tip=point(length*.5,0,.06),left=point(0,width,.025),right=point(0,-width,.025),mid=point(0,0,.11);
    for(const triangle of [[start,left,mid],[left,tip,mid],[tip,right,mid],[right,start,mid]])leafVertices.push(...triangle.flat());
  }
  const leafGeo=new THREE.BufferGeometry();leafGeo.setAttribute('position',new THREE.Float32BufferAttribute(leafVertices,3));leafGeo.computeVertexNormals();
  function tree(x,z,h){
    if([...e.interactables.values()].some(it=>Math.hypot(x-it.center.x,z-it.center.z)<2))return;
    const y=e.groundY(x,z);pushPole([x,y,z],[x+.12,y+h,z],.16+h*.013);collider(x,z,.32,h);
    for(let k=0;k<9;k++){
      const a=k*2.399, yy=y+h*(.5+k*.047), len=between(1.3,2.4)*(h/8);
      const end=[x+Math.cos(a)*len,yy+.6,z+Math.sin(a)*len];pushPole([x,y+h*.42,z],end,.045);
      for(let l=0;l<(LOW?6:12);l++){
        dummy.position.set(end[0]+between(-.9,.9),end[1]+between(-.3,.7),end[2]+between(-.9,.9));
        dummy.rotation.set(rnd(),rnd()*6.28,rnd());dummy.scale.set(between(.7,1.05),between(.3,.55),between(.65,1));dummy.updateMatrix();foliage.push(dummy.matrix.clone());
      }
    }
  }
  for(let i=0;i<(LOW?48:95);i++){
    const a=rnd()*6.28,r=between(32,64),x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(z>-35&&z<-18 || x<-20&&x>-40&&z>-5&&z<17)continue;
    tree(x,z,between(6,11));
  }
  for(const [x,z,h] of [[8,11,8],[13,5,9],[5,17,7],[-16,15,8],[-16,9,7],[-12,-8,8],[4,-9,8],[17,-11,7]])tree(x,z,h);
  const bladeGeo=new THREE.BufferGeometry();
  bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.055,0,0,.055,0,0,.035,.35,.025,.11,.65,.07,0,0,-.055,0,0,.055,.025,.35,.035,.07,.6,.11],3));
  bladeGeo.setIndex([0,1,2,2,1,3,4,5,6,6,5,7]);bladeGeo.computeVertexNormals();
  // Avoid mission targets, paths, the cave and the water; scenery never hides collectables.
  const targets=[...e.interactables.values()].map(it=>it.center);
  const pathDistance=(x,z,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,t=THREE.MathUtils.clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(x-ax-t*dx,z-az-t*dz);};
  for(let i=0;i<(LOW?6000:18000);i++){
    const x=between(-53,53),z=between(-16,53),y=e.groundY(x,z);
    if(y<-.3 || Math.hypot((x+5)/1.3,z-4)<7 || x<-20&&x>-39&&z>-5&&z<14)continue;
    if(pathDistance(x,z,-6,3,-20,-3)<1.8||pathDistance(x,z,-6,3,0,-17)<1.8||pathDistance(x,z,-6,3,32,10)<1.8)continue;
    if(targets.some(p=>Math.hypot(x-p.x,z-p.z)<1.25))continue;
    dummy.position.set(x,y+.01,z);dummy.rotation.set(0,rnd()*6.28,0);const s=between(.35,1.1);dummy.scale.set(s,s,s);dummy.updateMatrix();blades.push(dummy.matrix.clone());
  }
  for(let i=0;i<350;i++){
    const x=between(-54,54),z=between(-19,-15.7),y=e.groundY(x,z);
    dummy.position.set(x,y+.06,z);dummy.rotation.set(rnd(),rnd()*6.28,rnd());dummy.scale.set(between(.08,.35),between(.05,.17),between(.08,.3));dummy.updateMatrix();pebbles.push(dummy.matrix.clone());
  }
  function instances(geometry,material,matrices,name,shadows){
    const mesh=new THREE.InstancedMesh(geometry,material,matrices.length);mesh.name=name;
    matrices.forEach((m,i)=>{mesh.setMatrixAt(i,m);color.setRGB(1,1,1).multiplyScalar(between(.72,1.18));mesh.setColorAt(i,color);});
    mesh.castShadow=shadows;mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);return mesh;
  }
  instances(branchGeo,bark,trunks,'woodland-trunks',true);
  const canopy=instances(leafGeo,leaf,foliage,'woodland-leaves',!LOW);
  const meadow=instances(bladeGeo,grass,blades,'meadow',false);
  instances(rockGeo,rock,pebbles,'river-stones',false);
  const water=e.materials?.get('water');
  if(water){
    const data=new Uint8Array(64*64*4);
    for(let y=0;y<64;y++)for(let x=0;x<64;x++){
      const i=(y*64+x)*4, u=x/64*Math.PI*2,v=y/64*Math.PI*2;
      data[i]=128+Math.sin(u*4+Math.sin(v*2)) * 28;data[i+1]=128+Math.cos(v*3+u*2)*24;data[i+2]=248;data[i+3]=255;
    }
    const normal=new THREE.DataTexture(data,64,64);normal.wrapS=normal.wrapT=THREE.RepeatWrapping;normal.magFilter=THREE.LinearFilter;normal.minFilter=THREE.LinearFilter;normal.repeat.set(16,4);normal.needsUpdate=true;
    water.normalMap=normal;water.normalScale.set(.35,.35);water.color.set(0x557e80);water.roughness=.2;water.opacity=.82;water.needsUpdate=true;
    e.onFrame.push(dt=>{normal.offset.x=(normal.offset.x+dt*.018)%1;normal.offset.y=(normal.offset.y+dt*.009)%1;});
  }
  // Tiny wind deformation happens on the GPU; no per-blade JavaScript animation.
  const wind={value:0};
  for(const material of [leaf,grass]){
    material.onBeforeCompile=(shader)=>{shader.uniforms.uWind=wind;shader.vertexShader='uniform float uWind;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      #ifdef USE_INSTANCING
        float phase = instanceMatrix[3].x * .7 + instanceMatrix[3].z * .4;
        transformed.x += sin(uWind * 1.3 + phase) * max(position.y, 0.0) * .09;
      #endif`);};
    material.customProgramCacheKey=()=> 'paleo-wind-v1';
  }
  e.onFrame.push(dt=>{wind.value+=dt;});
  // Batch all non-moving props by material. The cave and campsite cost a handful of draws.
  const batches=new Map();
  for(const child of [...group.children]){
    if(!child.isMesh||child.isInstancedMesh)continue;
    child.updateMatrix();const geometry=(child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone()).applyMatrix4(child.matrix);
    if(!batches.has(child.material))batches.set(child.material,[]);
    batches.get(child.material).push(geometry);group.remove(child);
  }
  for(const [material,geometries] of batches){
    const geometry=mergeGeometries(geometries,false);
    if(geometry){const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
    geometries.forEach(g=>g.dispose());
  }
  e.landscapeStats={trees:trunks.length/10,leafClusters:foliage.length,grassClumps:blades.length};
  return group;
}

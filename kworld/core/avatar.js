import * as THREE from 'three';

// A small articulated explorer; the same rig also dresses the camp guide.
export function createAvatar(elder = false) {
  const rig = new THREE.Group();
  const material = color => new THREE.MeshStandardMaterial({ color, roughness: .92 });
  const skin=material(0xb98663), cloth=material(elder?0x8b7355:0x506a62), leather=material(0x66503b), hair=material(elder?0x817b6e:0x302d28), trim=material(0xc1b391);
  function shape(parent,geo,mat,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const sphere=new THREE.SphereGeometry(1,16,12), capsule=new THREE.CapsuleGeometry(.09,.38,4,8);
  shape(rig,sphere,cloth,0,1.0,0,.27,.38,.17);
  shape(rig,new THREE.CylinderGeometry(.25,.34,.38,16),cloth,0,.76,0);
  shape(rig,new THREE.CylinderGeometry(.272,.272,.06,16),leather,0,.93,0,1,1,.67);
  shape(rig,sphere,skin,0,1.48,0,.17,.22,.17);
  shape(rig,sphere,hair,0,1.58,.025,.182,.15,.177);
  shape(rig,sphere,skin,0,1.46,-.165,.048,.058,.043);
  for(const side of [-1,1]){
    shape(rig,sphere,skin,side*.173,1.47,0,.035,.06,.04);
    shape(rig,sphere,hair,side*.065,1.52,-.156,.018,.012,.014);
  }
  const arms=[],legs=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.28,1.22,0);rig.add(arm);arms.push(arm);
    shape(arm,capsule,cloth,side*.025,-.14,0,1,.85,1);
    shape(arm,capsule,skin,side*.04,-.43,-.015,.72,.65,.72);
    shape(arm,sphere,skin,side*.04,-.63,-.015,.068,.083,.058);
    const leg=new THREE.Group();leg.position.set(side*.13,.66,0);rig.add(leg);legs.push(leg);
    shape(leg,capsule,leather,0,-.2,0,1.15,1,1.15);
    shape(leg,capsule,skin,0,-.44,0,.85,.5,.85);
    shape(leg,sphere,leather,0,-.59,-.075,.1,.075,.18);
  }
  if(elder){shape(rig,sphere,hair,0,1.34,-.1,.13,.12,.12);}
  else{
    shape(rig,new THREE.BoxGeometry(.35,.42,.19),leather,0,1.04,.2);
    shape(rig,new THREE.CylinderGeometry(.085,.085,.43,12),trim,0,1.3,.22).rotation.z=Math.PI/2;
    for(const side of [-1,1]) shape(rig,new THREE.BoxGeometry(.038,.48,.034),leather,side*.17,1.08,-.155);
  }
  rig.userData.animate=(time,moving)=>{
    const stride=moving?Math.sin(time*9)*.5:Math.sin(time*1.5)*.025;
    arms[0].rotation.x=stride;arms[1].rotation.x=-stride;
    legs[0].rotation.x=-stride;legs[1].rotation.x=stride;
  };
  return rig;
}

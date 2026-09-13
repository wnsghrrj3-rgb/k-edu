import * as THREE from 'three';

export function createFire(engine, position) {
  const group=new THREE.Group();group.position.copy(position);group.position.y=engine.groundY(position.x,position.z)+.1;
  const time={value:0};
  const material=new THREE.ShaderMaterial({
    uniforms:{uTime:time},transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
    vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec2 vUv;uniform float uTime;
      void main(){
        float y=vUv.y;float bend=sin(y*8.0-uTime*4.0)*.055*y;
        float x=abs(vUv.x-.5+bend);
        float width=(1.0-y)*.32+.025*sin(y*27.0-uTime*8.0);
        float flame=1.0-smoothstep(max(0.0,width-.10),max(.01,width),x);
        float alpha=flame*smoothstep(0.0,.09,y)*(1.0-smoothstep(.65,1.0,y));
        vec3 color=mix(vec3(1.0,.75,.20),vec3(1.0,.17,.015),y);
        gl_FragColor=vec4(color,alpha*.8);
      }`
  });
  for(let i=0;i<3;i++){
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(.9,1.2),material);plane.position.y=.6;plane.rotation.y=i*Math.PI/3;group.add(plane);
  }
  const sparksGeo=new THREE.BufferGeometry(),points=new Float32Array(18*3);
  for(let i=0;i<18;i++){points[i*3]=Math.sin(i*2.4)*.22;points[i*3+1]=(i/18)*1.8;points[i*3+2]=Math.cos(i*2.4)*.22;}
  sparksGeo.setAttribute('position',new THREE.BufferAttribute(points,3));
  const sparks=new THREE.Points(sparksGeo,new THREE.PointsMaterial({color:0xffbd58,size:.025,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));group.add(sparks);
  group.visible=false;engine.scene.add(group);
  engine.onFrame.push(dt=>{if(!group.visible)return;time.value+=dt;for(let i=0;i<18;i++)points[i*3+1]=(points[i*3+1]+dt*(.35+i*.015))%1.8;sparksGeo.attributes.position.needsUpdate=true;});
  return group;
}

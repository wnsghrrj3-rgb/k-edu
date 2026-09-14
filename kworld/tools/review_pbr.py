"""Standalone GLB material inspection via EGL. Not the game's Three.js renderer."""
from pathlib import Path
import json,struct,io
import numpy as np
from PIL import Image,ImageDraw
import moderngl
R=Path(__file__).resolve().parents[1];ctx=moderngl.create_standalone_context(backend='egl')
prog=ctx.program(vertex_shader='''#version 330
in vec3 p;in vec3 n;in vec3 c;in vec2 uv;uniform mat4 mvp;out vec3 N;out vec3 C;out vec3 P;out vec2 U;
void main(){N=n;C=c;P=p;U=uv;gl_Position=mvp*vec4(p,1);}''',fragment_shader='''#version 330
in vec3 N;in vec3 C;in vec3 P;in vec2 U;out vec4 color;
uniform sampler2D albedo;uniform sampler2D normalMap;uniform sampler2D roughMap;uniform bool textured;uniform float roughness;uniform float normalScale;uniform vec3 eye;
vec3 light(vec3 n,vec3 v,vec3 l,vec3 base,float r,vec3 energy){
 float nl=max(dot(n,l),0.);vec3 h=normalize(v+l);float nv=max(dot(n,v),.001),nh=max(dot(n,h),0.),vh=max(dot(v,h),0.);
 float a=r*r;float D=a*a/(3.14159*pow(nh*nh*(a*a-1.)+1.,2.));float k=pow(r+1.,2.)/8.;float G=nv/(nv*(1.-k)+k)*nl/(nl*(1.-k)+k);
 vec3 F=vec3(.035)+(1.-.035)*pow(1.-vh,5.);return (base/3.14159+F*D*G/max(4.*nv*nl,.001))*nl*energy;
}
void main(){vec3 n=normalize(N);if(!gl_FrontFacing)n=-n;vec3 base=C;float r=roughness;
 if(textured){base*=pow(texture(albedo,U).rgb,vec3(2.2));r*=texture(roughMap,U).g;vec3 mapN=texture(normalMap,U).xyz*2.-1.;mapN.xy*=normalScale;
 vec3 q1=dFdx(P),q2=dFdy(P);vec2 st1=dFdx(U),st2=dFdy(U);vec3 t=normalize(q1*st2.t-q2*st1.t);vec3 b=normalize(-q1*st2.s+q2*st1.s);n=normalize(mat3(t,b,n)*mapN);}
 vec3 v=normalize(eye-P);vec3 col=base*vec3(.19,.22,.26);
 col+=light(n,v,normalize(vec3(-.6,1.2,-1.5)),base,max(r,.15),vec3(3.3,3.1,2.8));
 col+=light(n,v,normalize(vec3(1.,.6,.8)),base,max(r,.15),vec3(1.2,1.4,1.7));
 col=(col*(2.51*col+.03))/(col*(2.43*col+.59)+.14);color=vec4(pow(clamp(col,0.,1.),vec3(1./2.2)),1.);
}''')
def norm(v):return v/np.linalg.norm(v)
def matrix(eye,target,aspect):
 eye=np.array(eye);target=np.array(target);z=norm(eye-target);x=norm(np.cross([0,1,0],z));y=np.cross(z,x);view=np.eye(4);view[:3,:3]=[x,y,z];view[:3,3]=-view[:3,:3]@eye
 f=1/np.tan(np.deg2rad(35)/2);proj=np.zeros((4,4));proj[0,0]=f/aspect;proj[1,1]=f;proj[2,2]=-1.0005;proj[2,3]=-.020005;proj[3,2]=-1;return (proj@view).T.astype('f4').tobytes()
for name in ['paleo-explorer','red-deer']:
 raw=(R/'assets/actors'/(name+'.glb')).read_bytes();jslen=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+jslen]);binary=raw[28+jslen:]
 def access(index):
  a=doc['accessors'][index];vw=doc['bufferViews'][a['bufferView']];components={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']];dtype={5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']];return np.frombuffer(binary,dtype=dtype,count=a['count']*components,offset=vw.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,components)
 textures=[]
 for texture in doc['textures']:
  im=doc['images'][texture['source']];vw=doc['bufferViews'][im['bufferView']];im=Image.open(io.BytesIO(binary[vw['byteOffset']:vw['byteOffset']+vw['byteLength']])).convert('RGB');tx=ctx.texture(im.size,3,im.tobytes());tx.build_mipmaps();textures.append(tx)
 vaos=[]
 for mesh in doc['meshes']:
  p=mesh['primitives'][0];at=p['attributes'];m=doc['materials'][p['material']];data=np.concatenate([access(at['POSITION']),access(at['NORMAL']),access(at['COLOR_0'])*m['pbrMetallicRoughness']['baseColorFactor'][:3],access(at['TEXCOORD_0'])],axis=1).astype('f4');buf=ctx.buffer(data.tobytes());idx=ctx.buffer(access(p['indices']).astype('u4').tobytes());vao=ctx.vertex_array(prog,[(buf,'3f 3f 3f 2f','p','n','c','uv')],idx);vaos.append((vao,m))
 views=[([1.2,1.3,-3.2],[0,.88,0]),([.22,1.60,-.64],[0,1.57,-.03])] if name=='paleo-explorer' else [([3.4,2.,-4.5],[0,1.28,-.25]),([.92,1.9,-2.25],[0,1.68,-.97])]
 canvas=Image.new('RGB',(1600,950),'#19232a');draw=ImageDraw.Draw(canvas);fb=ctx.simple_framebuffer((800,900));fb.use();ctx.enable(moderngl.DEPTH_TEST)
 for j,(eye,target) in enumerate(views):
  fb.clear(.11,.145,.17,1,depth=1);prog['mvp'].write(matrix(eye,target,800/900));prog['eye'].value=eye
  for vao,m in vaos:
   pbr=m['pbrMetallicRoughness'];textured='baseColorTexture' in pbr;prog['textured'].value=textured;prog['roughness'].value=pbr['roughnessFactor'];prog['normalScale'].value=m.get('normalTexture',{}).get('scale',1)
   if textured:
    for unit,(field,key) in enumerate([('albedo',pbr['baseColorTexture']),('normalMap',m['normalTexture']),('roughMap',pbr['metallicRoughnessTexture'])]):textures[key['index']].use(unit);prog[field].value=unit
   vao.render()
  im=Image.frombytes('RGB',(800,900),fb.read(components=3)).transpose(Image.Transpose.FLIP_TOP_BOTTOM);canvas.paste(im,(j*800,35))
 draw.text((20,10),name+' / asset material review / standalone EGL - NOT a game screenshot',fill='white');canvas.save(R/'review'/(name+'-materials.jpg'),quality=95);print(name)

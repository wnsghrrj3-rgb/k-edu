"""Offline geometry review. NOT a browser screenshot or final Three.js/PBR validation."""
from pathlib import Path
import sys
import numpy as np
from PIL import Image,ImageDraw
import moderngl
R=Path(__file__).resolve().parents[1];ctx=moderngl.create_standalone_context(backend='egl')
prog=ctx.program(vertex_shader='''#version 330
in vec3 p; in vec3 n; in vec3 c;uniform mat4 mvp;out vec3 N;out vec3 C;void main(){N=n;C=c;gl_Position=mvp*vec4(p,1);}''',fragment_shader='''#version 330
in vec3 N;in vec3 C;out vec4 color;void main(){vec3 n=normalize(N);if(!gl_FrontFacing)n=-n;float key=max(dot(n,normalize(vec3(-.6,1.,1.8))),0.);float fill=max(dot(n,normalize(vec3(1.,.3,-1.))),0.);vec3 c=C*(.30+.72*key+.30*fill);color=vec4(pow(c,vec3(.85)),1);}''')
def norm(v):return v/np.linalg.norm(v)
def matrix(eye,target,aspect,fov=36):
 eye=np.array(eye);target=np.array(target);z=norm(eye-target);x=norm(np.cross([0,1,0],z));y=np.cross(z,x);view=np.eye(4);view[:3,:3]=[x,y,z];view[:3,3]=-view[:3,:3]@eye
 f=1/np.tan(np.deg2rad(fov)/2);proj=np.zeros((4,4));proj[0,0]=f/aspect;proj[1,1]=f;proj[2,2]=-1.0005;proj[2,3]=-.020005;proj[3,2]=-1
 return (proj@view).T.astype('f4')
round_=sys.argv[1] if len(sys.argv)>1 else '01'
for name in ['paleo-explorer','red-deer']:
 d=np.load(R/'review'/(name+'-geometry.npz'));human=name=='paleo-explorer';views=[([2.1,1.65,-3.5],[0,.90,0]),([0,1.1,-4.0],[0,.90,0]),([3.8,1.5,.1],[0,1,0]),([.43,1.62,-.90],[0,1.56,-.03])] if human else [([2.4,1.8,-4.3],[0,1.21,-.20]),([3.7,1.75,.3],[0,1.2,-.25]),([0,1.65,-4.6],[0,1.3,-.1]),([1.0,1.80,-2.45],[0,1.62,-1.0])]
 canvas=Image.new('RGB',(1600,1050),'#19232a');draw=ImageDraw.Draw(canvas)
 vaos=[]
 for i,mat in enumerate(d['materials']):
  v=d[f'{i}_v'];n=d[f'{i}_n'];f=d[f'{i}_f'];c=d[f'{i}_col']*mat
  data=np.concatenate([v,n,c],axis=1).astype('f4');buf=ctx.buffer(data.tobytes());idx=ctx.buffer(f.astype('u4').tobytes());vaos.append(ctx.vertex_array(prog,[(buf,'3f 3f 3f','p','n','c')],idx))
 fb=ctx.simple_framebuffer((800,500));fb.use();ctx.enable(moderngl.DEPTH_TEST)
 for j,(eye,target) in enumerate(views):
  fb.clear(.11,.145,.17,1,depth=1);prog['mvp'].write(matrix(eye,target,1.6).tobytes());
  for vao in vaos:vao.render()
  im=Image.frombytes('RGB',(800,500),fb.read(components=3)).transpose(Image.Transpose.FLIP_TOP_BOTTOM);canvas.paste(im,((j%2)*800,(j//2)*520+25))
 draw.text((20,7),f'{name} / geometry review {round_} / offline OpenGL - not browser/PBR',fill='white')
 canvas.save(R/'review'/f'{name}-round{round_}.jpg',quality=94)
 print(R/'review'/f'{name}-round{round_}.jpg')

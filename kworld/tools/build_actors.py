"""Original paleo actor assets. Offline sculpt/UV/rig generator; no downloaded models.
Requires numpy, scipy, scikit-image, Pillow. Run from any working directory.
Coordinates: metres, Y up, forward -Z. glTF skin uses smooth two-bone weights.
"""
from pathlib import Path
import json, struct, io, math
import numpy as np
from scipy.interpolate import CubicSpline
from scipy.ndimage import gaussian_filter
from skimage.measure import marching_cubes
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/actors'; OUT.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(7319)

def unit(a):
 a=np.asarray(a,float); return a/np.maximum(np.linalg.norm(a,axis=-1,keepdims=True),1e-10)
def smoothmin(a,b,k):
 h=np.maximum(k-np.abs(a-b),0)/k; return np.minimum(a,b)-h*h*k*.25

def sculpt(shapes,step=.008,blend=.035,subtract=()):
 # Ellipsoidal distance fields blended BEFORE surface extraction: one continuous surface.
 lo=np.min([np.array(c)-np.array(r)*1.25 for c,r in shapes],axis=0)-blend
 hi=np.max([np.array(c)+np.array(r)*1.25 for c,r in shapes],axis=0)+blend
 axes=[np.arange(lo[i],hi[i]+step,step) for i in range(3)]
 p=np.stack(np.meshgrid(*axes,indexing='ij'),axis=-1).astype(np.float32)
 def field(c,r):
  q=p-np.array(c); r=np.array(r); k0=np.linalg.norm(q/r,axis=-1); k1=np.linalg.norm(q/r**2,axis=-1)
  return k0*(k0-1)/np.maximum(k1,1e-8)
 d=np.full(p.shape[:-1],100.,dtype=np.float32)
 for c,r in shapes: d=smoothmin(d,field(c,r),blend)
 for c,r in subtract: d=np.maximum(d,-field(c,r))
 v,f,n,_=marching_cubes(d,0,spacing=(step,)*3,gradient_direction='ascent');v+=lo
 return v,f

def loft(points,radii,sides=20,steps=40):
 points=np.array(points,float); radii=np.array(radii,float)
 if radii.ndim==1:radii=np.stack([radii,radii],axis=1)
 t=np.linspace(0,1,len(points)); s=np.linspace(0,1,steps)
 centers=CubicSpline(t,points,bc_type='natural')(s); r=CubicSpline(t,radii,bc_type='natural')(s)
 r=np.maximum(r,.00015); tang=unit(np.gradient(centers,axis=0))
 # Stable frame avoids twists on almost-straight limbs.
 axis=np.eye(3)[np.argmin(np.abs(tang.mean(axis=0)))]; u=unit(np.cross(tang,axis)); w=unit(np.cross(tang,u))
 a=np.arange(sides)*2*np.pi/sides
 v=(centers[:,None,:]+u[:,None,:]*np.cos(a)[None,:,None]*r[:,0,None,None]+w[:,None,:]*np.sin(a)[None,:,None]*r[:,1,None,None]).reshape(-1,3)
 f=[]
 for j in range(steps-1):
  for k in range(sides):
   a0=j*sides+k;b=j*sides+(k+1)%sides;c=b+sides;d=a0+sides;f.extend([[a0,b,c],[a0,c,d]])
 v=np.vstack([v,centers[0],centers[-1]])
 for k in range(sides):f.extend([[len(v)-2,(k+1)%sides,k],[len(v)-1,(steps-1)*sides+k,(steps-1)*sides+(k+1)%sides]])
 return v,np.array(f)

def ellipsoid(c,r,segments=32,rings=20):
 # Only used for inset eyes, nostrils and small anatomical accents.
 c=np.array(c);r=np.array(r);v=[]
 for j in range(rings+1):
  phi=np.pi*j/rings
  for i in range(segments):
   a=2*np.pi*i/segments;v.append(c+r*np.array([np.sin(phi)*np.cos(a),np.cos(phi),np.sin(phi)*np.sin(a)]))
 f=[]
 for j in range(rings):
  for i in range(segments):
   a=j*segments+i;b=j*segments+(i+1)%segments;f.extend([[a,b,a+segments],[b,b+segments,a+segments]])
 return np.array(v),np.array(f)

class Asset:
 def __init__(self,name):
  self.name=name;self.meshes=[];self.bones=[];self.materials=[];self.tex=[]
 def bone(self,name,world,parent=None):
  self.bones.append(dict(name=name,world=np.array(world,float),parent=parent));return len(self.bones)-1
 def material(self,name,color,kind='skin',rough=.8):
  self.materials.append(dict(name=name,color=color,kind=kind,rough=rough));return len(self.materials)-1
 def add(self,name,geo,mat,bone=0,weights=None,color=None):
  v,f=geo; v=np.array(v,dtype=np.float32);f=np.array(f,dtype=np.uint32)
  # Consistent outward normals for generated closed meshes.
  ns=np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]])
  if np.sum(ns*(v[f].mean(axis=1)-v.mean(axis=0)))<0:f=f[:,::-1]
  n=np.zeros_like(v); ns=np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]])
  for k in range(3):np.add.at(n,f[:,k],ns)
  n=unit(n).astype(np.float32)
  joints=np.zeros((len(v),4),np.uint16); wt=np.zeros((len(v),4),np.float32)
  joints[:,0]=bone;wt[:,0]=1
  if weights is not None:joints,wt=weights(v)
  # Cylinder UV, long axis chosen per surface; textures are periodic.
  d=np.ptp(v,axis=0);axis=int(np.argmax(d));other=[i for i in range(3) if i!=axis];c=(v.min(axis=0)+v.max(axis=0))/2
  uv=np.column_stack([np.arctan2(v[:,other[0]]-c[other[0]],v[:,other[1]]-c[other[1]])/(2*np.pi)+.5,(v[:,axis]-v[:,axis].min())/max(d[axis],.001)])
  col=np.ones((len(v),3),np.float32) if color is None else np.array(color(v),np.float32)
  self.meshes.append(dict(name=name,v=v,f=f,n=n,uv=uv.astype(np.float32),j=joints,w=wt,col=col,mat=mat))
 def save(self):
  batches=[]
  for mat in range(len(self.materials)):
   parts=[m for m in self.meshes if m['mat']==mat]
   if not parts:continue
   offset=0;faces=[]
   for m in parts:faces.append(m['f']+offset);offset+=len(m['v'])
   merged={k:np.concatenate([m[k] for m in parts]) for k in ['v','n','uv','j','w','col']}
   merged.update(name=self.materials[mat]['name'],mat=mat,f=np.concatenate(faces));batches.append(merged)
  self.meshes=batches
  binary=bytearray();views=[];access=[];images=[];textures=[];mats=[];texture_ids={}
  def blob(b):
   while len(binary)%4:binary.append(0)
   i=len(views);views.append(dict(buffer=0,byteOffset=len(binary),byteLength=len(b)));binary.extend(b);return i
  def acc(a,typ,component):
   a=np.ascontiguousarray(a);vi=blob(a.tobytes());d=dict(bufferView=vi,componentType=component,count=len(a),type=typ)
   if typ=='VEC3' and component==5126:d.update(min=a.min(axis=0).tolist(),max=a.max(axis=0).tolist())
   access.append(d);return len(access)-1
  for m in self.materials:
   mat=dict(name=m['name'],pbrMetallicRoughness=dict(baseColorFactor=[*m['color'],1],metallicFactor=0,roughnessFactor=m['rough']),doubleSided=False)
   if m['kind'] not in ['eye','dark']:
    for kind,img in make_maps(m['kind']).items():
     key=(m['kind'],kind)
     if key not in texture_ids:
      buf=io.BytesIO();img.save(buf,format='JPEG',quality=90);images.append(dict(bufferView=blob(buf.getvalue()),mimeType='image/jpeg'));textures.append(dict(source=len(images)-1,sampler=0));texture_ids[key]=len(textures)-1
     idx=texture_ids[key]
     if kind=='color':mat['pbrMetallicRoughness']['baseColorTexture']={'index':idx}
     elif kind=='normal':mat['normalTexture']={'index':idx,'scale':{'skin':.10,'fur':.14,'hair':.16,'hide':.16,'antler':.19}.get(m['kind'],.15)}
     else:mat['pbrMetallicRoughness']['metallicRoughnessTexture']={'index':idx}
   mats.append(mat)
  nodes=[dict(name=self.name,children=list(range(1,len(self.bones)+1)))]; roots=[]
  for i,b in enumerate(self.bones):
   par=b['parent'];delta=b['world']-(self.bones[par]['world'] if par is not None else 0)
   nodes.append(dict(name=b['name'],translation=delta.tolist(),children=[]))
   if par is not None:nodes[par+1]['children'].append(i+1)
   else:roots.append(i+1)
  nodes[0]['children']=roots
  meshes=[]
  for m in self.meshes:
   attrs={'POSITION':acc(m['v'],'VEC3',5126),'NORMAL':acc(m['n'],'VEC3',5126),'TEXCOORD_0':acc(m['uv'],'VEC2',5126),'COLOR_0':acc(m['col'],'VEC3',5126),'JOINTS_0':acc(m['j'],'VEC4',5123),'WEIGHTS_0':acc(m['w'],'VEC4',5126)}
   meshes.append(dict(name=m['name'],primitives=[dict(attributes=attrs,indices=acc(m['f'].reshape(-1),'SCALAR',5125),material=m['mat'])]));nodes[0]['children'].append(len(nodes));nodes.append(dict(name=m['name'],mesh=len(meshes)-1,skin=0))
  ibm=[]
  for b in self.bones:
   matrix=np.eye(4,dtype=np.float32);matrix[:3,3]=-b['world'];ibm.append(matrix.T.reshape(16))
  skin=dict(joints=list(range(1,len(self.bones)+1)),inverseBindMatrices=acc(np.array(ibm),'MAT4',5126),skeleton=1)
  doc=dict(asset={'version':'2.0','generator':'K-HISTORY original anatomical sculpt 1'},scene=0,scenes=[{'nodes':[0]}],nodes=nodes,meshes=meshes,skins=[skin],materials=mats,textures=textures,images=images,samplers=[{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}],buffers=[{'byteLength':len(binary)}],bufferViews=views,accessors=access)
  js=json.dumps(doc,separators=(',',':')).encode();js+=b' '*((-len(js))%4);binary+=b'\0'*((-len(binary))%4)
  out=struct.pack('<III',0x46546c67,2,28+len(js)+len(binary))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(binary),0x004e4942)+binary
  (OUT/(self.name+'.glb')).write_bytes(out)
  print(self.name,len(out),'bytes',sum(len(m['f']) for m in self.meshes),'triangles',len(meshes),'meshes')
  return self

_mapcache={}
def make_maps(kind):
 if kind in _mapcache:return _mapcache[kind]
 size=1024; noise=rng.normal(0,1,(size,size));large=gaussian_filter(noise,12);large/=max(large.std(),.001)
 fine=gaussian_filter(noise,.7);fine/=fine.std();y,x=np.mgrid[:size,:size]
 if kind in ['fur','hair']:
  # Thousands of overlapping fine fibres, with broad colour variation.
  streak=gaussian_filter(noise,(8,.6));streak/=streak.std();h=.35*streak+.1*fine
  variation=1+large*.012+streak*.035
 elif kind=='hide':
  h=.26*fine+.28*large;variation=1+large*.020+fine*.012
 elif kind=='antler':
  streak=gaussian_filter(noise,(5,.8));streak/=streak.std();h=.4*streak+.1*fine;variation=1+large*.025+streak*.025
 else:h=.10*fine;variation=1+large*.025+fine*.006
 rgb=np.clip(variation[:,:,None]*np.array([236,232,225])[None,None,:],0,255).astype('uint8')
 dx=np.roll(h,-1,1)-np.roll(h,1,1);dy=np.roll(h,-1,0)-np.roll(h,1,0)
 normal=unit(np.stack([-dx,-dy,np.ones_like(dx)],axis=-1));normal=((normal*.5+.5)*255).astype('uint8')
 rough=np.zeros_like(rgb);rough[:,:,0]=255;rough[:,:,1]=np.clip(225+large*12,150,255).astype('uint8')
 result={'color':Image.fromarray(rgb),'normal':Image.fromarray(normal),'rough':Image.fromarray(rough)};_mapcache[kind]=result;return result

def two_weights(a,b,axis,low,high):
 def fn(v):
  t=np.clip((v[:,axis]-low)/(high-low),0,1);t=t*t*(3-2*t)
  j=np.zeros((len(v),4),np.uint16);w=np.zeros((len(v),4),np.float32);j[:,:2]=[a,b];w[:,0]=1-t;w[:,1]=t;return j,w
 return fn

def human_face():
 ys=np.array([1.407,1.428,1.47,1.515,1.555,1.60,1.65,1.69,1.729])
 widths=[.004,.057,.086,.105,.117,.119,.11,.08,.003]
 fronts=[-.052,-.078,-.092,-.097,-.099,-.096,-.067,-.025,.013]
 backs=[.025,.058,.091,.109,.118,.121,.107,.070,.016]
 fns=[CubicSpline(ys,a,bc_type='natural') for a in [widths,fronts,backs]]
 v=[];f=[];rows=100;cols=100
 for y in np.linspace(ys[0],ys[-1],rows):
  w,front,back=[float(fn(y)) for fn in fns];mid=(front+back)/2;depth=(back-front)/2
  for t in np.linspace(0,2*np.pi,cols,endpoint=False):
   x=w*np.cos(t);z=mid+depth*np.sin(t)
   if np.sin(t)<0:
    facing=(-np.sin(t))**7
    nose=.032*np.exp(-(x/.013)**2-((y-1.554)/.036)**2)+.031*np.exp(-(x/.021)**2-((y-1.526)/.014)**2)
    cheek=.007*np.exp(-((abs(x)-.067)/.032)**2-((y-1.539)/.032)**2)
    muzzle=.009*np.exp(-(x/.040)**2-((y-1.486)/.025)**2)
    socket=.009*np.exp(-((abs(x)-.048)/.030)**2-((y-1.58)/.018)**2)
    z-=facing*(nose+cheek+muzzle-socket)
   v.append([x,y,z])
 for j in range(rows-1):
  for i in range(cols):
   a=j*cols+i;b=j*cols+(i+1)%cols;f.extend([[a,b,a+cols],[b,b+cols,a+cols]])
 return np.array(v),np.array(f)

def human():
 a=Asset('paleo-explorer');root=a.bone('hips',[0,.88,0]);spine=a.bone('spine',[0,1.09,0],root);head=a.bone('head',[0,1.42,0],spine)
 skin=a.material('Skin • pores', [.40,.25,.16],'skin',.78);hide=a.material('Smoked hide • grain',[.22,.135,.073],'hide',.94);lining=a.material('Hide underside',[.64,.48,.31],'hide',.95)
 hair=a.material('Hair • fibres',[.026,.017,.011],'hair',.88);fur=a.material('Shoulder fur',[.28,.22,.16],'fur',1);cord=a.material('Twisted rawhide',[.27,.18,.11],'hide',.95)
 white=a.material('Warm sclera',[.69,.66,.56],'eye',.33);iris=a.material('Brown iris',[.12,.068,.026],'eye',.29);pupil=a.material('Pupil',[.009,.008,.006],'dark',.25);lip=a.material('Lips',[.48,.30,.22],'skin',.8);nail=a.material('Nails',[.61,.45,.34],'skin',.68)
 torso=[([0,1.19,.005],[.208,.185,.119]),([0,1.04,.01],[.157,.15,.105]),([0,.895,.006],[.177,.145,.126]),([0,1.365,.01],[.067,.095,.069])]
 for s in [-1,1]:torso.append(([s*.13,1.315,.01],[.105,.066,.085]))
 a.add('Continuous neck and torso',sculpt(torso,.010,.034),skin,spine,weights=two_weights(root,spine,1,.91,1.13))
 face=[([0,1.551,.008],[.128,.179,.114]),([0,1.47,-.028],[.096,.078,.085]),([0,1.429,-.060],[.066,.034,.054]),([0,1.558,-.104],[.021,.062,.026]),([0,1.523,-.137],[.025,.022,.026])]
 for s in [-1,1]:face.extend([([s*.072,1.532,-.067],[.044,.038,.051]),([s*.022,1.519,-.119],[.016,.015,.019])])
 holes=[([s*.049,1.578,-.106],[.029,.020,.025]) for s in [-1,1]]
 a.add('Sculpted face with eye sockets',human_face(),skin,head)
 for s in [-1,1]:
  ex=s*.049;ey=1.578;ez=-.082
  a.add('Sclera',ellipsoid([ex,ey,ez],[.023,.011,.017],32,20),white,head)
  a.add('Iris',ellipsoid([ex,ey,-.0984],[.0095,.010,.0024]),iris,head)
  a.add('Pupil',ellipsoid([ex,ey,-.1008],[.0042,.005,.001]),pupil,head)
  for top in [True,False]:
   pts=[]
   for t in np.linspace(0,np.pi,9):pts.append([ex+.025*np.cos(t),ey+(.011 if top else -.009)*np.sin(t),-.083-.014*np.sin(t)])
   a.add('Upper eyelid' if top else 'Lower eyelid',loft(pts,[.0025]*9,10,25),skin,head)
  pts=[[s*.025,1.607,-.095],[s*.047,1.611,-.089],[s*.072,1.605,-.077]]
  a.add('Brow',loft(pts,[.002,.004,.001],10,22),hair,head)
  a.add('Ear helix',sculpt([([s*.124,1.546,.006],[.025,.043,.024])],.0025,.006, [([s*.137,1.55,-.01],[.014,.026,.015])]),skin,head)
  a.add('Ear concha',ellipsoid([s*.13,1.546,-.002],[.013,.024,.008]),lip,head)
  a.add('Nostril',ellipsoid([s*.013,1.517,-.129],[.004,.002,.002]),lip,head)
 for yy,rr in [(1.490,.0028),(1.483,.0035)]:
  pts=[[-.030,1.486,-.101],[-.016,yy,-.109],[0,yy+.001,-.114],[.016,yy,-.109],[.030,1.486,-.101]]
  a.add('Lip vermilion',loft(pts,[.0008,rr,rr,.004,.0008],12,35),lip,head)
 a.add('Mouth seam',loft([[-.025,1.486,-.106],[0,1.487,-.115],[.025,1.486,-.106]],[.0005,.001,.0005],8,24),lip,head)
 # Hair cap follows skull, then tapered sculpted locks create the silhouette.
 capv,capf=ellipsoid([0,1.559,.018],[.133,.18,.12],64,36)
 centers=capv[capf].mean(axis=1);capf=capf[(centers[:,1]>1.63)|((centers[:,2]>-.015)&(centers[:,1]>1.535))]
 a.add('Hair underlayer',(capv,capf),hair,head)
 for i in range(88):
  theta=2*np.pi*i/88;side=np.sin(theta);back=np.cos(theta)
  endy=1.56 if back>.1 else 1.636+rng.uniform(-.022,.019)+side*.012
  points=[[side*.024-.025,1.733+rng.uniform(-.003,.005),back*.025+.018],[side*.085-.017,1.713,back*.079+.018],[side*.131,1.665 if back<.1 else 1.63,back*.121+.016],[side*.128,endy,back*.115+.018]]
  a.add('Tapered hair lock',loft(points,[[.001,.001],[.009,.004],[.008,.003],[.0003,.0003]],10,20),hair,head)
 # Separate layered hide shell; deliberately irregular hem, stitched side seam.
 v=[];f=[];rows=32;cols=80
 for j in range(rows):
  t=j/(rows-1); y=1.37-.68*t
  rx=np.interp(t,[0,.12,.35,.63,1],[.083,.224,.230,.200,.25]);rz=np.interp(t,[0,.12,.4,.63,1],[.09,.139,.151,.144,.17])
  for i in range(cols):
   p=2*np.pi*i/cols;fold=.006*np.sin(p*9+t*2)*np.sin(t*np.pi)+.004*np.cos(p*15-t*4)*t
   hem=(.016*np.sin(3*p)+.009*np.sin(11*p))*t**8
   v.append([(rx+fold)*np.cos(p),y+hem,(rz+fold)*np.sin(p)+.008])
 for j in range(rows-1):
  for i in range(cols):
   k=j*cols+i;l=j*cols+(i+1)%cols;f.extend([[k,l,k+cols],[l,l+cols,k+cols]])
 v=np.array(v);f=np.array(f);inner=v.copy();inner[:,0]*=.973;inner[:,2]*=.97
 shellv=np.vstack([v,inner]);shellf=np.vstack([f,f[:,::-1]+len(v)])
 edge=[]
 for row in [0,rows-1]:
  for i in range(cols):
   k=row*cols+i;l=row*cols+(i+1)%cols;edge.extend([[k,k+len(v),l],[l,k+len(v),l+len(v)]])
 a.add('Thick hide tunic with folded hem',(shellv,np.vstack([shellf,edge])),hide,spine,weights=two_weights(root,spine,1,.92,1.22))
 for offset in [0,.015]:
  pts=[[.181*np.cos(p),.98+offset,.128*np.sin(p)+.008] for p in np.linspace(0,2*np.pi,65)]
  a.add('Rawhide waist tie',loft(pts,[.007]*65,8,96),cord,root)
 for s in [-1,1]:
  shoulder=[s*.217,1.294,0];elbow=[s*.275,1.022,-.002];wrist=[s*.287,.797,-.019]
  arm=a.bone('arm_L' if s<0 else 'arm_R',shoulder,spine);fore=a.bone('forearm_L' if s<0 else 'forearm_R',elbow,arm)
  pts=[shoulder,[s*.252,1.217,.005],[s*.269,1.09,.002],elbow,[s*.28,.942,-.003],wrist]
  radii=[[.062,.073],[.066,.069],[.044,.048],[.039,.041],[.043,.048],[.025,.031]]
  a.add('Anatomical arm',loft([[s*.17,1.32,0],*pts],[[.019,.020],*radii],32,72),skin,arm,weights=two_weights(fore,arm,1,.989,1.073))
  palm=[s*.29,.756,-.021]
  a.add('Palm',sculpt([(palm,[.033,.058,.024])],.0035,.005),skin,fore)
  for finger in range(4):
   x=s*(.263+finger*.017);length=[.059,.067,.061,.045][finger]
   pts=[[x,.735,-.024],[x,.712,-.021],[x,.735-length,-.034],[x,.735-length-.005,-.043]]
   a.add('Articulated finger',loft(pts,[.009,.008,.006,.003],12,20),skin,fore)
   a.add('Fingernail',ellipsoid([x,.735-length,-.039],[.005,.008,.0015],12,8),nail,fore)
  a.add('Opposed thumb',loft([[s*.267,.768,-.021],[s*.245,.738,-.039],[s*.246,.713,-.053]],[.013,.011,.006],16,22),skin,fore)
  hip=[s*.098,.865,0];knee=[s*.106,.463,-.012];ankle=[s*.105,.125,.008]
  thigh=a.bone('thigh_L' if s<0 else 'thigh_R',hip,root);shin=a.bone('shin_L' if s<0 else 'shin_R',knee,thigh);foot=a.bone('foot_L' if s<0 else 'foot_R',ankle,shin)
  a.add('Thigh knee calf',loft([hip,[s*.10,.73,.012],[s*.105,.55,-.01],knee,[s*.105,.365,.033],[s*.105,.24,.025],ankle],[[.091,.089],[.086,.084],[.058,.062],[.05,.053],[.062,.058],[.043,.04],[.029,.033]],32,80),skin,thigh,weights=two_weights(shin,thigh,1,.42,.515))
  a.add('Soft hide foot wrap',sculpt([([s*.105,.071,-.063],[.049,.067,.116]),([s*.105,.126,.006],[.039,.073,.048])],.005,.017),hide,foot)
  for y in [.14,.17]:
   pts=[[s*.105+.041*np.cos(p),y,.047*np.sin(p)+.004] for p in np.linspace(0,2*np.pi,33)]
   a.add('Foot wrap tie',loft(pts,[.003]*33,8,40),cord,foot)
  # Fur shoulder mantle: compact overlapping tapered locks rather than a solid plastic pad.
  for i in range(48):
   ph=rng.uniform(-np.pi,np.pi);x=s*rng.uniform(.055,.216);y=1.325-abs(x)*.16;z=.105*np.sin(ph)
   a.add('Fur mantle fibres',loft([[x,y,z],[x+s*.012,y-.025,z+.008],[x+s*.017,y-.066-rng.uniform(0,.025),z+.009]],[[.011,.006],[.012,.008],[.0006,.0006]],8,10),fur,spine)
 for y in np.arange(.76,1.28,.024):
  rx=np.interp(y,[.69,.94,1.14,1.30],[.24,.178,.214,.20]);a.add('Side seam stitch',loft([[rx,y,-.012],[rx+.004,y+.007,0],[rx,y+.012,.012]],[.0015]*3,6,8),lining,spine,weights=two_weights(root,spine,1,.92,1.22))
 # Reduce head to adolescent proportions while keeping the original player height.
 for m in a.meshes:
  if np.all(m['j'][:,0]==head):
   m['v'][:,0]*=.90;m['v'][:,2]*=.90;m['v'][:,1]=(m['v'][:,1]-1.40)*.90+1.42
 a.save();return a

def deer():
 a=Asset('red-deer');root=a.bone('body',[0,1.03,0]);neck=a.bone('neck',[0,1.21,-.54],root);head=a.bone('head',[0,1.59,-.92],neck)
 fur=a.material('Deer coat • directional hair',[.25,.125,.055],'fur',.97);light=a.material('Cream inner ear',[.73,.61,.44],'fur',1);dark=a.material('Nose and cloven hooves',[.07,.052,.035],'skin',.75);eye=a.material('Deer eye',[.032,.024,.012],'eye',.22);antler=a.material('Antler • bone ridges',[.60,.45,.29],'antler',.94)
 bones=[];shapes=[([0,1.03,-.12],[.248,.32,.55]),([0,1.04,.41],[.215,.273,.29]),([0,1.10,-.47],[.226,.285,.238]),([0,1.29,-.66],[.166,.25,.22]),([0,1.47,-.78],[.116,.22,.161])]
 for s in [-1,1]:
  for front in [True,False]:
   if front: pts=[[s*.163,1.11,-.455],[s*.171,.76,-.40],[s*.175,.42,-.513],[s*.177,.13,-.56]];radii=[[.053,.060],[.057,.061],[.033,.039],[.025,.029]]
   else:pts=[[s*.15,1.065,.445],[s*.173,.72,.385],[s*.184,.405,.555],[s*.184,.13,.510]];radii=[[.074,.085],[.073,.071],[.032,.038],[.025,.030]]
   tag=('front' if front else 'hind')+('_L' if s<0 else '_R');upper=a.bone(tag,pts[0],root);lower=a.bone(tag+'_lower',pts[1],upper);ankle=a.bone(tag+'_ankle',pts[2],lower)
   bones.append((pts,upper,lower,ankle,front))
   # Haunch and shoulder are sculpted in the body, not separate spheres.
   a.add(tag+' anatomical leg',loft([[s*.10,1.25,pts[0][2]],*pts],[[.018,.020],*radii],28,72),fur,upper,weights=leg_weights(pts,[upper,lower,ankle]),color=deer_color)
   hx,hy,hz=pts[-1]
   for split in [-1,1]:
    # Separate weight-bearing toes, sloped toe profile and visible interdigital cleft.
    v,f=ellipsoid([hx+split*.022,.064,hz-.022],[.020,.060,.061],24,16);v[:,1]=np.maximum(v[:,1],.011);v[:,2]-=.014*(1-v[:,1]/.12)
    a.add('Cloven hoof',(v,f),dark,ankle)
   for split in [-1,1]:a.add('Dewclaw',ellipsoid([hx+split*.024,.155,hz+.029],[.011,.022,.015],12,8),dark,ankle)
 a.add('Continuous ribcage shoulder haunch neck',sculpt(shapes,.013,.15),fur,root,weights=two_weights(root,neck,1,1.22,1.48),color=deer_color)
 faces=[([0,1.646,-.922],[.105,.131,.16]),([0,1.575,-1.055],[.083,.092,.19]),([0,1.503,-1.191],[.072,.071,.115]),([0,1.488,-1.07],[.066,.068,.16])]
 a.add('Long facial planes and jaw',sculpt(faces,.006,.060),fur,head,color=deer_color)
 a.add('Moist nose',ellipsoid([0,1.506,-1.293],[.071,.044,.027]),dark,head)
 for s in [-1,1]:
  a.add('Nostril fold',loft([[s*.026,1.523,-1.317],[s*.051,1.52,-1.313],[s*.057,1.498,-1.306]],[.004,.005,.002],10,18),eye,head)
  a.add('Eye socket rim',ellipsoid([s*.101,1.65,-.990],[.015,.022,.026]),dark,head)
  a.add('Amber eye',ellipsoid([s*.113,1.652,-.998],[.010,.014,.019]),eye,head)
  ear=a.bone('ear_L' if s<0 else 'ear_R',[s*.088,1.721,-.862],head)
  # Curved leaf-shaped pinna, thickness and recessed pale interior.
  v=[];f=[];rows=30;cols=24
  for j in range(rows):
   t=j/(rows-1);cx=s*(.082+.18*t);cy=1.719+.145*t;cz=-.855+.02*t;width=.055*np.sin(np.pi*t)**.72
   for i in range(cols):
    q=2*np.pi*i/cols;v.append([cx+width*np.cos(q)*.50,cy-width*np.cos(q)*.72,cz+.021*np.sin(q)*np.sin(np.pi*t)])
  for j in range(rows-1):
   for k in range(cols):
    x=j*cols+k;y=j*cols+(k+1)%cols;f.extend([[x,y,x+cols],[y,y+cols,x+cols]])
  a.add('Large sculpted ear',(v,f),fur,ear)
  vv=np.array(v);vv[:,2]-=.003;ff=np.array(f);cent=vv[ff].mean(axis=1);ff=ff[cent[:,2]<-.858]
  a.add('Pale ear lining',(vv,ff),light,ear)
  # Swept antler beam, brow tine, bez tine and branching crown. Not a Y shape.
  points=[[s*.063,1.738,-.901],[s*.105,1.87,-.83],[s*.21,2.08,-.71],[s*.29,2.27,-.67],[s*.32,2.40,-.75]]
  a.add('Swept antler main beam',loft(points,[.029,.027,.023,.015,.001],18,65),antler,head)
  branches=[([points[1],[s*.135,1.985,-1.06],[s*.15,2.04,-1.17]],[.021,.012,.001]),([[s*.153,1.97,-.77],[s*.25,2.10,-.995],[s*.27,2.18,-1.04]],[.017,.009,.001]),([[s*.245,2.155,-.69],[s*.38,2.28,-.83],[s*.415,2.37,-.89]],[.016,.008,.001]),([[s*.27,2.22,-.67],[s*.34,2.39,-.56],[s*.40,2.46,-.53]],[.015,.007,.001]),([[s*.29,2.29,-.68],[s*.25,2.46,-.59],[s*.26,2.51,-.63]],[.012,.006,.001])]
  for ps,rs in branches:a.add('Antler tine',loft(ps,rs,14,32),antler,head)
  for k in range(12):
   p=k*np.pi/6; a.add('Pedicle burr',ellipsoid([s*.063+.030*np.cos(p),1.76,-.90+.028*np.sin(p)],[.008,.012,.007],10,6),antler,head)
 tail=a.bone('tail',[0,1.17,.62],root)
 a.add('Short tail',loft([[0,1.17,.60],[0,1.08,.76],[0,.995,.775]],[[.05,.039],[.057,.039],[.006,.005]],20,30),fur,tail,color=deer_color)
 a.add('Lower muzzle cream',ellipsoid([0,1.466,-1.208],[.064,.025,.081]),light,head)
 a.save();return a

def leg_weights(pts,bones):
 def fn(v):
  # Smooth interpolation at elbow/stifle and carpus/hock; upper leg stays anchored.
  y=v[:,1];k1=pts[1][1];k2=pts[2][1];t1=np.clip((k1+.085-y)/.17,0,1);t2=np.clip((k2+.055-y)/.11,0,1)
  t1=t1*t1*(3-2*t1);t2=t2*t2*(3-2*t2)
  w=np.zeros((len(v),4),np.float32);w[:,0]=1-t1;w[:,1]=t1*(1-t2);w[:,2]=t1*t2
  j=np.zeros((len(v),4),np.uint16);j[:,:3]=bones;return j,w
 return fn

def deer_color(v):
 y=v[:,1];z=v[:,2];belly=np.exp(-((y-.80)/.20)**2)*(1-np.clip(abs(z)/.8,0,1));rump=np.exp(-((z-.65)/.20)**2)*np.exp(-((y-1.05)/.23)**2)
 col=np.ones((len(v),3))*.84;col+=belly[:,None]*np.array([.18,.29,.40]);col+=rump[:,None]*np.array([.12,.22,.34]);col-=np.exp(-((y-1.34)/.14)**2)[:,None]*.12
 return col.clip(0,1)

if __name__=='__main__':
 assets=[human(),deer()]
 # Geometry sidecar only for independent offline QA, not loaded by the game.
 for a in assets:
  np.savez_compressed(ROOT/'review'/(a.name+'-geometry.npz'),**{f'{i}_{k}':m[k] for i,m in enumerate(a.meshes) for k in ['v','f','n','col']},materials=np.array([a.materials[m['mat']]['color'] for m in a.meshes]))

# -*- coding: utf-8 -*-
"""
R146 — 금성초 엠블럼 3D 굽기 (케이메이커 뒷공장)
==================================================
남색 엠블럼(emblem.py)이 금선을 두르고 비스듬히 돌아 들어와 정면에 멈춘다.
배경 투명(RGBA) — 오프닝·상장 도장 자리·학교 장면 끝 어디에나 얹는다.

산출 (OUT 폴더):
  emblem_####.png    프레임 시퀀스(투명)
  emblem.json        fps·frames·hold_from·해상도
  poster.png         정면 고정 프레임

쓰는 법:
  시험(여기·CPU):  python hero_emblem.py -- OUT --w 640 --h 640 --fps 12 --samples 16
  원화질(준호 PC): blender -b -P hero_emblem.py -- OUT --w 1080 --h 1080 --fps 24 --samples 128
  한 장만:         python hero_emblem.py -- OUT --still 3.0
  한 바퀴(루프):   python hero_emblem.py -- OUT --spin 1      (6초 360°, 반복 재생용)
  등장까지만:      python hero_emblem.py -- OUT --sec 2.6     (영상 부품 스프라이트용 — parts/assets/make-sprite.py)
  → ffmpeg -framerate 24 -i emblem_%04d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le emblem.mov
"""
import bpy, math, json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import emblem

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '/tmp/emblem'
def arg(k, d):
    return type(d)(argv[argv.index(k) + 1]) if k in argv else d
W, H, FPS, SAMPLES = arg('--w', 640), arg('--h', 640), arg('--fps', 12), arg('--samples', 16)
STILL, SPIN, TILT = arg('--still', -1.0), arg('--spin', 0), arg('--tilt', 1)   # tilt 0 = 완전 정면
SEC, HOLD = (6.0, 6.0) if SPIN else (arg('--sec', 4.0), 2.6)     # --sec 2.6 이면 등장까지만(스프라이트용)
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- 씬
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'; sc.cycles.max_bounces = 6
sc.render.resolution_x, sc.render.resolution_y = W, H; sc.render.resolution_percentage = 100
sc.render.fps = FPS; sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
sc.view_settings.view_transform = 'Filmic' if 'Filmic' in [i.identifier for i in sc.view_settings.bl_rna.properties['view_transform'].enum_items] else 'Standard'

# ---------------------------------------------------------------- 엠블럼
em = emblem.build('emblem', size=1.0, depth=0.12, gold=True)
em.rotation_euler = (math.radians(90), 0, 0)          # 정면(-Y) 을 봄, 위 = +Z
em.location = (0, 0, 0)

# ---------------------------------------------------------------- 빛 (3점 + 금선용 림)
def light(name, kind, loc, energy, rgb=(1, 1, 1), size=1.0):
    l = bpy.data.lights.new(name, kind); l.energy = energy; l.color = rgb
    if kind == 'AREA': l.size = size
    o = bpy.data.objects.new(name, l); sc.collection.objects.link(o); o.location = loc
    tgt = bpy.data.objects.get('tgt') or bpy.data.objects.new('tgt', None)
    if tgt.name not in sc.collection.objects: sc.collection.objects.link(tgt)
    c = o.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
    return o
light('key',  'AREA', (-2.6, -3.2, 2.8), 260, (1.0, 0.97, 0.92), size=2.5)
light('fill', 'AREA', (3.0, -3.5, 0.6), 70, (0.85, 0.9, 1.0), size=3.5)
light('rim',  'AREA', (2.2, 2.4, 2.2), 420, (1.0, 0.85, 0.55), size=1.2)     # 뒤·위에서 금선을 켬
light('rim2', 'AREA', (-2.4, 2.0, -1.2), 180, (1.0, 0.9, 0.7), size=1.2)
sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True
sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.35, 0.38, 0.45, 1)
sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35

# ---------------------------------------------------------------- 카메라
cam = bpy.data.cameras.new('cam'); cam.lens = 65; cam.sensor_width = 36; cam.sensor_fit = 'HORIZONTAL'
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
co.location = (0, -6.2, 0.05)
c = co.constraints.new('TRACK_TO'); c.target = bpy.data.objects['tgt']; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
bpy.data.objects['tgt'].location = (0, 0, -0.05)

# ---------------------------------------------------------------- 애니메이션
def f(sec): return max(1, int(round(sec * FPS)) + 1)
def ease_out(u): u = max(0.0, min(1.0, u)); return 1 - (1 - u) ** 4
def smooth(u): u = max(0.0, min(1.0, u)); return u * u * (3 - 2 * u)

def pose(sec):
    """(회전z, 회전y(기울기), 스케일) — 비스듬히 돌아 들어와(0.3~2.6s) 정면에 멈춤. spin 모드는 한 바퀴."""
    if SPIN:
        return (2 * math.pi * sec / SEC, 0.0, 1.0)
    u = ease_out((sec - 0.3) / 2.3)
    ez, ey = (math.radians(-12), math.radians(-6)) if TILT else (0.0, 0.0)   # 멈춘 자세(살짝 비스듬 = 두께가 보임)
    rz = math.radians(-95) * (1 - u) + ez * u              # 옆에서 → 정면
    ry = math.radians(-14) * (1 - u) + ey * u
    s = 0.82 + 0.18 * smooth((sec - 0.2) / 1.6)
    return (rz, ry, s)

def set_pose(sec):
    rz, ry, s = pose(sec)
    em.rotation_euler = (math.radians(90), ry, rz)
    em.scale = (s, s, s)

# ---------------------------------------------------------------- 출력
def render(path):
    sc.render.filepath = path; bpy.ops.render.render(write_still=True)

if STILL >= 0:
    set_pose(STILL); render(os.path.join(OUT, 'still.png')); sys.exit(0)

frames = f(SEC)
for fr in range(1, frames + 1):
    set_pose((fr - 1) / FPS)
    render(os.path.join(OUT, f'emblem_{fr:04d}.png'))
set_pose(HOLD); render(os.path.join(OUT, 'poster.png'))
json.dump({'name': 'emblem', 'width': W, 'height': H, 'fps': FPS, 'frames': frames,
           'hold_from': f(HOLD), 'spin': bool(SPIN), 'alpha': True},
          open(os.path.join(OUT, 'emblem.json'), 'w'), ensure_ascii=False)
print('done', OUT, frames)

# -*- coding: utf-8 -*-
"""
R144 — 「학교가 지어진다」 금성초 3D 조립 틀 굽기 (케이메이커 뒷공장)
==================================================
빈 운동장 위에 금성초가 순서대로 올라온다: 관람석 → 벽돌 몸통(왼쪽 동·박공동·탑·오른쪽 동)
→ 콘크리트 띠·기둥 → 창문 → 지붕·빨간 코핑 → 옥상 정자·캐노피 → 교명·엠블럼·깃발 → 나무.
카메라는 왼쪽 위에서 돌아 들어와 **사진(DSC00031, 정면) 과 비슷한 자리**에 멈춘다(hold).
hold 이후는 브라우저가 실사 사진으로 녹여 넣는 자리(plates/school/).

형태 근거: 사진 한 장(정면). 실측이 아니라 비율 읽기 — 닮은 학교를 새로 짓는다.

산출 (OUT 폴더):
  school-build_####.png   프레임 시퀀스
  school-build.json       fps·frames·hold_from·해상도
  poster.png              마지막(고정 카메라) 프레임

쓰는 법:
  시험(여기·CPU):  python hero_school.py -- OUT --w 640 --h 360 --fps 12 --samples 8
  원화질(준호 PC): blender -b -P hero_school.py -- OUT --w 1920 --h 1080 --fps 24 --samples 128
  한 장만:         python hero_school.py -- OUT --still 5.0   (5.0초 시점 한 프레임)
  → 이어서: ffmpeg -framerate 24 -i school-build_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 school-build.mp4
"""
import bpy, math, json, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '/tmp/school'
def arg(k, d):
    return type(d)(argv[argv.index(k) + 1]) if k in argv else d
W, H, FPS, SAMPLES = arg('--w', 640), arg('--h', 360), arg('--fps', 12), arg('--samples', 8)
SEC = 7.0
HOLD = 5.6
STILL = arg('--still', -1.0)
FR_START = arg('--from', 1)
NAME = 'school-build'
FONT = arg('--font', '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc')
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- 씬
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 4
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.resolution_percentage = 100
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, int(SEC * FPS)
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGB'
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Base Contrast'
sc.render.film_transparent = False

# 하늘: 흐린 날(사진과 같은 빛)
wd = bpy.data.worlds.new('sky'); sc.world = wd; wd.use_nodes = True
wn = wd.node_tree; bg = wn.nodes['Background']
# 흐린 날 하늘 = 위로 갈수록 살짝 푸른 회백 그라데이션 (해 원반 없음)
tc = wn.nodes.new('ShaderNodeTexCoord'); sep = wn.nodes.new('ShaderNodeSeparateXYZ')
ramp = wn.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = (0.86, 0.87, 0.88, 1)   # 지평선: 밝은 회백
ramp.color_ramp.elements[1].position = 0.6; ramp.color_ramp.elements[1].color = (0.55, 0.62, 0.72, 1)   # 천정: 옅은 청회
wn.links.new(tc.outputs['Generated'], sep.inputs['Vector']); wn.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
wn.links.new(ramp.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 1.0

# ---------------------------------------------------------------- 재질
def new_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    return m, m.node_tree, m.node_tree.nodes['Principled BSDF']

def mat_brick():
    m, nt, b = new_mat('brick')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    br = nt.nodes.new('ShaderNodeTexBrick')
    br.inputs['Scale'].default_value = 1.0
    br.inputs['Mortar Size'].default_value = 0.035; br.inputs['Mortar Smooth'].default_value = 0.4
    br.inputs['Bias'].default_value = 0.0; br.inputs['Brick Width'].default_value = 0.42; br.inputs['Row Height'].default_value = 0.14
    br.inputs['Color1'].default_value = (0.30, 0.09, 0.05, 1); br.inputs['Color2'].default_value = (0.21, 0.065, 0.04, 1)
    br.inputs['Mortar'].default_value = (0.36, 0.33, 0.30, 1)
    noise = nt.nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 0.35
    mixc = nt.nodes.new('ShaderNodeMix'); mixc.data_type = 'RGBA'; mixc.blend_type = 'MULTIPLY'; mixc.inputs['Factor'].default_value = 0.2
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.2
    sep = nt.nodes.new('ShaderNodeSeparateXYZ'); comb = nt.nodes.new('ShaderNodeCombineXYZ')   # 벽돌은 XY 평면 무늬 → 정면(XZ)에 깔리게 (x, z, y)
    L = nt.links
    L.new(tc.outputs['Object'], sep.inputs['Vector'])
    L.new(sep.outputs['X'], comb.inputs['X']); L.new(sep.outputs['Z'], comb.inputs['Y']); L.new(sep.outputs['Y'], comb.inputs['Z'])
    L.new(comb.outputs['Vector'], br.inputs['Vector']); L.new(tc.outputs['Object'], noise.inputs['Vector'])
    L.new(br.outputs['Color'], mixc.inputs[6]); L.new(noise.outputs['Color'], mixc.inputs[7])
    L.new(mixc.outputs[2], b.inputs['Base Color'])
    L.new(br.outputs['Fac'], bump.inputs['Height']); L.new(bump.outputs['Normal'], b.inputs['Normal'])
    b.inputs['Roughness'].default_value = 0.85
    return m

def mat_flat(name, rgb, rough=0.7, metal=0.0, spec=0.5):
    m, nt, b = new_mat(name)
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    return m

def mat_glass_dark():
    m, nt, b = new_mat('glassdark')
    b.inputs['Base Color'].default_value = (0.06, 0.08, 0.11, 1); b.inputs['Roughness'].default_value = 0.08
    b.inputs['Coat Weight'].default_value = 1.0
    return m

def mat_green_glass():
    m, nt, b = new_mat('greenglass')
    b.inputs['Base Color'].default_value = (0.55, 0.85, 0.75, 1); b.inputs['Roughness'].default_value = 0.15
    b.inputs['Transmission Weight'].default_value = 0.55; b.inputs['Alpha'].default_value = 1.0
    return m

def mat_sand():
    m, nt, b = new_mat('sand')
    noise = nt.nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 40.0; noise.inputs['Detail'].default_value = 8
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (0.55, 0.50, 0.42, 1); ramp.color_ramp.elements[1].color = (0.72, 0.66, 0.55, 1)
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.15
    L = nt.links
    L.new(noise.outputs['Fac'], ramp.inputs['Fac']); L.new(ramp.outputs['Color'], b.inputs['Base Color'])
    L.new(noise.outputs['Fac'], bump.inputs['Height']); L.new(bump.outputs['Normal'], b.inputs['Normal'])
    b.inputs['Roughness'].default_value = 0.95
    return m

def mat_leaf():
    m, nt, b = new_mat('leaf')
    noise = nt.nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 3.0
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (0.10, 0.22, 0.05, 1); ramp.color_ramp.elements[1].color = (0.32, 0.45, 0.10, 1)
    L = nt.links; L.new(noise.outputs['Fac'], ramp.inputs['Fac']); L.new(ramp.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.8
    return m

M = dict(brick=mat_brick(), concrete=mat_flat('concrete', (0.62, 0.62, 0.58), 0.9), concrete_dark=mat_flat('cdark', (0.42, 0.42, 0.40), 0.9),
         red=mat_flat('red', (0.55, 0.12, 0.08), 0.6), glass=mat_glass_dark(), green=mat_flat('green', (0.18, 0.42, 0.30), 0.45, 0.3),
         gglass=mat_green_glass(), sand=mat_sand(), grey=mat_flat('grey', (0.40, 0.42, 0.44), 0.8),
         white=mat_flat('white', (0.85, 0.85, 0.85), 0.7), navy=mat_flat('navy', (0.05, 0.05, 0.25), 0.5),
         leaf=mat_leaf(), bark=mat_flat('bark', (0.22, 0.16, 0.10), 0.95), steel=mat_flat('steel', (0.6, 0.6, 0.62), 0.35, 0.8),
         gold=mat_flat('gold', (0.7, 0.55, 0.2), 0.4, 0.8), pool=mat_flat('pool', (0.70, 0.72, 0.74), 0.9))

# ---------------------------------------------------------------- 도형 (원점 = 바닥 중심 → scale.z 로 "자라남")
BUILD = []   # (obj, kind, t0, t1)  kind: rise(z 0→1) · pop(전체 0→1) · drop(위에서 내려옴) · slidex(x 0→1)
def _finish(o, mat, kind, t0, t1, base_z):
    o.data.materials.append(mat)
    o.location.z = base_z
    BUILD.append((o, kind, t0, t1))
    return o

def box(name, x0, x1, y0, y1, z0, z1, mat, kind='rise', t0=0, t1=0, origin='bottom'):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.object; o.name = name
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    sx, sy, sz = x1 - x0, y1 - y0, z1 - z0
    for v in o.data.vertices:
        v.co.x = v.co.x * sx; v.co.y = v.co.y * sy
        v.co.z = (v.co.z + 0.5) * sz if origin == 'bottom' else v.co.z * sz
    if origin == 'left':
        for v in o.data.vertices: v.co.x += sx / 2
        o.location = (x0, cy, 0); base = (z0 + z1) / 2
    else:
        o.location = (cx, cy, 0); base = z0 if origin == 'bottom' else (z0 + z1) / 2
    return _finish(o, mat, kind, t0, t1, base)

def gable(name, x0, x1, y0, y1, z_eave, z_peak, mat, t0, t1):
    """박공(삼각 프리즘) — 위에서 내려앉음"""
    import bmesh
    me = bpy.data.meshes.new(name); o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    bm = bmesh.new()
    h = z_peak - z_eave; cx = (x0 + x1) / 2
    vs = [bm.verts.new(v) for v in [(x0, y0, 0), (x1, y0, 0), (cx, y0, h), (x0, y1, 0), (x1, y1, 0), (cx, y1, h)]]
    bm.faces.new([vs[0], vs[1], vs[2]]); bm.faces.new([vs[5], vs[4], vs[3]])
    bm.faces.new([vs[0], vs[3], vs[4], vs[1]]); bm.faces.new([vs[0], vs[2], vs[5], vs[3]]); bm.faces.new([vs[1], vs[4], vs[5], vs[2]])
    bm.to_mesh(me); bm.free()
    for v in me.vertices: v.co.x -= cx; v.co.y -= (y0 + y1) / 2
    o.location = ((x0 + x1) / 2, (y0 + y1) / 2, 0)
    return _finish(o, mat, 'drop', t0, t1, z_eave)

def cyl(name, x, y, z0, z1, r, mat, kind='rise', t0=0, t1=0, seg=16):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=z1 - z0, vertices=seg)
    o = bpy.context.object; o.name = name
    for v in o.data.vertices: v.co.z += (z1 - z0) / 2
    o.location = (x, y, 0)
    return _finish(o, mat, kind, t0, t1, z0)

def ball(name, x, y, z, r, mat, t0, t1):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=14, ring_count=10)
    o = bpy.context.object; o.name = name; o.location = (x, y, 0)
    bpy.ops.object.shade_smooth()
    return _finish(o, mat, 'pop', t0, t1, z)

# ---------------------------------------------------------------- 지형 (정적)
bpy.ops.mesh.primitive_plane_add(size=400); g = bpy.context.object; g.name = 'ground'; g.data.materials.append(M['sand'])
g.location = (15, 20, 0)

# ---------------------------------------------------------------- 학교 (X 오른쪽 · Y 안쪽 · Z 위)  단위 m
# 앞면 y=0. 박공동 중심 x=0.  오른쪽 동 x 13~60. 왼쪽 동 x -34~-12.
# 0) 관람석·옹벽 (회색 계단)
for i, (y0, y1, z1) in enumerate([(-9.0, -7.5, 0.35), (-7.5, -6.0, 0.7), (-6.0, -4.5, 1.05)]):
    box(f'bleach{i}', -34, 62, y0, y1, 0, z1, M['grey'], 'rise', 0.15 + i * 0.12, 0.65 + i * 0.12)
box('platform', -34, 62, -4.5, -0.2, 0, 1.1, M['grey'], 'rise', 0.5, 0.9)
box('rail', -34, 62, -4.6, -4.4, 1.1, 2.15, M['steel'], 'rise', 0.9, 1.2)

# 1) 왼쪽 동 (3층, 낮음)
box('leftwing', -34, -12, 0, 24, 0, 10.8, M['brick'], 'rise', 0.6, 1.7)
box('leftwing_cop', -34.1, -11.9, -0.1, 24.1, 10.8, 11.2, M['red'], 'drop', 2.9, 3.4)

# 2) 박공동 (본관 정면)
box('gableblock', -12, 13, 0, 20, 0, 12.4, M['brick'], 'rise', 0.8, 2.2)
gable('gable_front', -12.3, 13.3, -0.15, 20.15, 12.4, 16.2, M['brick'], 2.9, 3.5)
box('gable_cop_l', -12.4, 0.6, -0.2, 0.15, 12.4, 12.7, M['red'], 'drop', 3.1, 3.5)   # 경사 코핑 대신 처마선 표시
box('gable_band', -12.3, 13.3, -0.12, 20.1, 12.2, 12.5, M['red'], 'drop', 3.0, 3.5)
# 처마 경사 빨간 선(박공 위 얇은 띠) — 두 경사면
for side, (xa, xb) in enumerate([(-12.3, 0.5), (0.5, 13.3)]):
    L_ = math.hypot(xb - xa, 3.8); ang = math.atan2(3.8, xb - xa) * (1 if side == 0 else -1)
    bpy.ops.mesh.primitive_cube_add(size=1); o = bpy.context.object; o.name = f'gable_edge{side}'
    o.scale = (L_, 0.35, 0.28); o.rotation_euler = (0, -ang, 0)
    o.location = ((xa + xb) / 2, -0.15, 12.4 + 1.9); o.data.materials.append(M['red'])
    BUILD.append((o, 'drop', 3.0, 3.5))
# 창: 위 줄 7개 (어두운 개구부), 아래 유리 벽
for i in range(7):
    x = -8.4 + i * 2.8
    box(f'gwin{i}', x - 0.55, x + 0.55, -0.3, 0.05, 8.3, 10.2, M['glass'], 'pop', 2.4 + i * 0.07, 2.8 + i * 0.07, origin='center')
    box(f'gwin{i}_sill', x - 0.7, x + 0.7, -0.35, 0.05, 8.1, 8.3, M['red'], 'pop', 2.5 + i * 0.07, 2.9 + i * 0.07, origin='center')
box('glasswall', -11.0, 8.0, -0.3, 0.05, 1.2, 5.6, M['glass'], 'pop', 2.5, 3.0, origin='center')
box('glasswall_mul', -11.0, 8.0, -0.32, 0.02, 3.3, 3.5, M['steel'], 'pop', 2.6, 3.0, origin='center')
# 엠블럼(원판) · 교명
bpy.ops.mesh.primitive_cylinder_add(radius=1.2, depth=0.2, vertices=32); em = bpy.context.object; em.name = 'emblem'
em.rotation_euler = (math.radians(90), 0, 0); em.location = (1.4, -0.2, 0); em.data.materials.append(M['green'])
BUILD.append((em, 'pop', 4.0, 4.5)); em.location.z = 13.9
bpy.ops.mesh.primitive_cylinder_add(radius=0.9, depth=0.24, vertices=32); em2 = bpy.context.object; em2.name = 'emblem_in'
em2.rotation_euler = (math.radians(90), 0, 0); em2.location = (1.4, -0.22, 0); em2.data.materials.append(M['gold'])
BUILD.append((em2, 'pop', 4.05, 4.55)); em2.location.z = 13.9
if os.path.exists(FONT):
    cu = bpy.data.curves.new('schoolname', 'FONT'); cu.body = '금성초등학교'; cu.font = bpy.data.fonts.load(FONT)
    cu.size = 1.75; cu.extrude = 0.12; cu.align_x = 'CENTER'
    tx = bpy.data.objects.new('schoolname', cu); sc.collection.objects.link(tx)
    tx.rotation_euler = (math.radians(90), 0, 0); tx.location = (0.3, -0.25, 0); tx.data.materials.append(M['navy'])
    BUILD.append((tx, 'pop', 4.1, 4.7)); tx.location.z = 6.3
# 입구 캐노피 (초록 유리 아치) + 기둥
bpy.ops.mesh.primitive_cylinder_add(radius=3.6, depth=6.5, vertices=24); arch = bpy.context.object; arch.name = 'entry_arch'
arch.rotation_euler = (0, math.radians(90), 0); arch.scale = (0.45, 1, 1)
for v in arch.data.vertices: pass
arch.location = (6.5, -3.0, 0); arch.data.materials.append(M['gglass']); BUILD.append((arch, 'pop', 3.6, 4.1)); arch.location.z = 3.4
box('entry_cut', 2.5, 10.5, -6.6, 0.4, 0, 3.4, M['sand'], 'rise', 0, 0.01)   # 아치 아랫부분 가리개(바닥색) — 반원처럼 보이게
for i, x in enumerate([3.6, 9.4]):
    cyl(f'arch_post{i}', x, -5.9, 1.1, 3.6, 0.12, M['steel'], 'rise', 3.4, 3.7)

# 3) 탑 (박공동 뒤, 더 높음)
box('tower', -6.5, 2.5, 8, 17, 0, 19.0, M['brick'], 'rise', 1.4, 2.7)
gable('tower_gable', -6.8, 2.8, 7.8, 17.2, 19.0, 22.0, M['brick'], 3.2, 3.7)
box('tower_band', -6.8, 2.8, 7.8, 17.2, 18.8, 19.1, M['red'], 'drop', 3.3, 3.7)
for side, (xa, xb) in enumerate([(-6.8, -2.0), (-2.0, 2.8)]):
    L_ = math.hypot(xb - xa, 3.0); ang = math.atan2(3.0, xb - xa) * (1 if side == 0 else -1)
    bpy.ops.mesh.primitive_cube_add(size=1); o = bpy.context.object; o.name = f'tower_edge{side}'
    o.scale = (L_, 0.35, 0.28); o.rotation_euler = (0, -ang, 0)
    o.location = ((xa + xb) / 2, 7.85, 19.0 + 1.5); o.data.materials.append(M['red'])
    BUILD.append((o, 'drop', 3.3, 3.7))

# 4) 오른쪽 동 (4층 · 벽돌 + 콘크리트 띠·기둥 + 창 띠)
box('rightwing', 13, 60, 0, 22, 0, 15.2, M['brick'], 'rise', 1.0, 2.6)
box('rightwing_cop', 12.9, 60.1, -0.1, 22.1, 15.2, 15.6, M['red'], 'drop', 3.0, 3.5)
for fl, z in enumerate([3.5, 7.1, 10.7, 14.0]):
    box(f'band{fl}', 13, 60, -0.25, 0.0, z, z + 0.5, M['concrete'], 'slidex', 2.0 + fl * 0.12, 2.5 + fl * 0.12, origin='left')
for i in range(9):
    x = 13.2 + i * 5.8
    box(f'pil{i}', x, x + 0.55, -0.3, 0.0, 0, 15.2, M['concrete'], 'rise', 1.9 + i * 0.05, 2.35 + i * 0.05)
for fl, z in enumerate([1.3, 4.6, 8.2, 11.8]):
    for i in range(8):
        x0 = 14.2 + i * 5.8
        box(f'rwin{fl}_{i}', x0, x0 + 4.4, -0.2, 0.0, z, z + 1.9, M['glass'], 'pop', 2.5 + fl * 0.1 + i * 0.04, 2.85 + fl * 0.1 + i * 0.04, origin='center')
        box(f'rsill{fl}_{i}', x0 - 0.1, x0 + 4.5, -0.28, 0.0, z - 0.18, z, M['white'], 'pop', 2.55 + fl * 0.1 + i * 0.04, 2.9 + fl * 0.1 + i * 0.04, origin='center')
# 옥상 정자 2개 (콘크리트 기둥 + 초록 곡선 지붕)
for k, x0 in enumerate([17.5, 36.5]):
    for i, (dx, dy) in enumerate([(0, 3), (11, 3), (0, 12), (11, 12)]):
        box(f'perg{k}_post{i}', x0 + dx, x0 + dx + 0.6, dy, dy + 0.6, 15.6, 19.6, M['concrete'], 'rise', 3.5 + k * 0.2, 3.9 + k * 0.2)
    roof = box(f'perg{k}_roof', x0 - 1.2, x0 + 12.8, 1.8, 13.8, 19.6, 20.2, M['green'], 'drop', 3.9 + k * 0.2, 4.3 + k * 0.2)
    box(f'perg{k}_rim', x0 - 1.3, x0 + 12.9, 1.7, 13.9, 20.2, 20.45, M['concrete'], 'drop', 3.9 + k * 0.2, 4.3 + k * 0.2)
    ball(f'perg{k}_fin', x0 + 5.8, 7.8, 20.6, 0.45, M['green'], 4.3 + k * 0.2, 4.6 + k * 0.2)
# 긴 초록 캐노피 (앞쪽 통로)
box('canopy', -34, 62, -6.9, -4.7, 4.3, 4.75, M['gglass'], 'drop', 3.7, 4.2)
for i in range(17):
    x = -33 + i * 5.9
    cyl(f'cpost{i}', x, -4.8, 1.1, 4.3, 0.08, M['steel'], 'rise', 3.4 + i * 0.02, 3.7 + i * 0.02)
# 깃대 3
for i, x in enumerate([-3.5, -0.5, 2.5]):
    cyl(f'flag{i}', x, -3.2, 1.1, 12.5, 0.07, M['steel'], 'rise', 4.2 + i * 0.1, 4.6 + i * 0.1)
    box(f'flagc{i}', x + 0.05, x + 1.5, -3.25, -3.15, 10.4, 12.0, M['white'], 'pop', 4.5 + i * 0.1, 4.8 + i * 0.1, origin='center')
# 나무 (앞줄)
for i, (x, y, hgt, r) in enumerate([(-27, -11, 6.8, 2.4), (-19, -10.5, 6.0, 2.2), (4, -10, 6.3, 2.3), (12.5, -10.5, 6.6, 2.5),
                                     (24, -10, 6.8, 2.6), (37, -10.5, 6.4, 2.5), (49, -10, 6.6, 2.4), (60, -10.5, 6.0, 2.2)]):
    t0 = 4.4 + i * 0.1
    cyl(f'trunk{i}', x, y, 0, hgt, 0.22, M['bark'], 'rise', t0, t0 + 0.35, seg=8)
    for j, (dx, dy, dz, rr) in enumerate([(0, 0, hgt + 0.8, r), (-r * 0.5, 0.3, hgt - 0.2, r * 0.72), (r * 0.5, -0.2, hgt - 0.4, r * 0.7), (0, r * 0.5, hgt + 0.2, r * 0.6)]):
        ball(f'leaf{i}_{j}', x + dx, y + dy, dz, rr, M['leaf'], t0 + 0.25 + j * 0.05, t0 + 0.6 + j * 0.05)

# ---------------------------------------------------------------- 빛
sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 2.2; sun.angle = math.radians(25); sun.color = (1.0, 0.98, 0.95)
so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so)
so.rotation_euler = (math.radians(50), 0, math.radians(-35))

# ---------------------------------------------------------------- 카메라
cam = bpy.data.cameras.new('cam'); cam.lens = 40; cam.sensor_width = 36
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
tgt = bpy.data.objects.new('tgt', None); sc.collection.objects.link(tgt)
con = co.constraints.new('TRACK_TO'); con.target = tgt; con.track_axis = 'TRACK_NEGATIVE_Z'; con.up_axis = 'UP_Y'

# ---------------------------------------------------------------- 애니메이션
def f(sec): return max(1, int(round(sec * FPS)) + 1)
def ease(t): return t * t * (3 - 2 * t)
def keyv(o, path, frame, value):
    setattr(o, path, value); o.keyframe_insert(data_path=path, frame=frame)

def clamp01(v): return max(0.0, min(1.0, v))
def overshoot(u):                      # pop 용: 살짝 넘쳤다 제자리 (1.12 → 1.0)
    return 1.0 + 0.12 * math.sin(u * math.pi) if u < 1 else 1.0
NF = sc.frame_end
for o, kind, t0, t1 in BUILD:
    z = o.location.z; x, y = o.location.x, o.location.y
    B = tuple(o.scale)                 # 기본 스케일(박공 처마 막대처럼 미리 늘려 둔 것) 보존
    span = max(1e-3, t1 - t0)
    for fr in range(1, NF + 1):
        sec = (fr - 1) / FPS
        u = clamp01((sec - t0) / span); e = ease(u)
        if kind == 'rise':
            o.scale = (B[0], B[1], B[2] * max(0.001, e)); o.keyframe_insert('scale', frame=fr)
        elif kind == 'pop':
            sv = max(0.001, e * overshoot(u)); o.scale = (B[0] * sv, B[1] * sv, B[2] * sv); o.keyframe_insert('scale', frame=fr)
        elif kind == 'drop':
            sv = 1.0 if sec >= t0 else 0.001
            o.scale = (B[0] * sv, B[1] * sv, B[2] * sv); o.keyframe_insert('scale', frame=fr)
            o.location = (x, y, z + 9.0 * (1 - e) ** 2); o.keyframe_insert('location', frame=fr)
        elif kind == 'slidex':
            o.scale = (B[0] * max(0.001, e), B[1], B[2]); o.keyframe_insert('scale', frame=fr)
        if sec > t1 + 0.5: break        # 완료 후엔 마지막 값 유지 — 더 키 안 박음

# 카메라: 왼쪽 위에서 돌아 들어와 정면 사진 자리로 (프레임마다 직접 계산)
CAM_PATH = [(0.0, (-75, -70, 30), (8, 8, 8)), (2.6, (-30, -85, 16), (14, 4, 8)), (HOLD, (15.5, -66, 1.8), (15.5, 0, 6.8))]
def cam_at(sec):
    if sec >= HOLD: return Vector(CAM_PATH[-1][1]), Vector(CAM_PATH[-1][2])
    for (ta, pa, la), (tb, pb, lb) in zip(CAM_PATH, CAM_PATH[1:]):
        if ta <= sec <= tb:
            e = ease((sec - ta) / (tb - ta))
            return Vector(pa).lerp(Vector(pb), e), Vector(la).lerp(Vector(lb), e)
    return Vector(CAM_PATH[0][1]), Vector(CAM_PATH[0][2])
for fr in range(1, NF + 1):
    p, l = cam_at((fr - 1) / FPS)
    co.location = p; co.keyframe_insert('location', frame=fr)
    tgt.location = l; tgt.keyframe_insert('location', frame=fr)

# ---------------------------------------------------------------- 출력
meta = dict(name=NAME, width=W, height=H, fps=FPS, frames=int(SEC * FPS), hold_from=f(HOLD), sec=SEC,
            camera=dict(loc=CAM_PATH[2][1], look=CAM_PATH[2][2], lens=cam.lens))
with open(os.path.join(OUT, NAME + '.json'), 'w', encoding='utf-8') as fh: json.dump(meta, fh, ensure_ascii=False, indent=1)

if STILL >= 0:
    sc.frame_set(f(STILL)); sc.render.filepath = os.path.join(OUT, f'still_{STILL:.1f}.png'); bpy.ops.render.render(write_still=True)
    print('still ->', sc.render.filepath); sys.exit(0)

for fr in range(FR_START, sc.frame_end + 1):
    sc.frame_set(fr); sc.render.filepath = os.path.join(OUT, f'{NAME}_{fr:04d}.png')
    bpy.ops.render.render(write_still=True); print('frame', fr, '/', sc.frame_end, flush=True)
sc.frame_set(sc.frame_end); sc.render.filepath = os.path.join(OUT, 'poster.png'); bpy.ops.render.render(write_still=True)
print('done')

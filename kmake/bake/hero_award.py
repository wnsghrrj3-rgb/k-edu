# -*- coding: utf-8 -*-
"""
R142 — 「3D 상장」 틀 굽기 (케이메이커 뒷공장)
==================================================
무거운 것(책상·종이·금테·도장·리본·빛·카메라 움직임)은 블렌더로 한 번 굽고,
바뀌는 것(상 이름·이름·학년반·본문·날짜·학교명)은 브라우저가 원근 맞춰 얹는다.
그래서 이 틀에는 **글자가 없다** — 종이는 빈 채로 굽는다.

산출 (OUT 폴더):
  award-wood-warm_####.png   프레임 시퀀스 (알파 없음)
  award-wood-warm.json       프레임별 종이 네 모서리 화면 좌표(px) + hold_from + fps + 해상도
  poster.png                 마지막(고정 카메라) 프레임 = 정지 포스터

쓰는 법:
  시험(여기·CPU):  python hero_award.py -- OUT_DIR --w 640 --h 360 --fps 12 --samples 8
  원화질(준호 PC): blender -b -P hero_award.py -- OUT_DIR --w 1920 --h 1080 --fps 24 --samples 128
  좌표만(렌더 0초): python hero_award.py -- OUT_DIR --json-only
  → 이어서: ffmpeg -framerate 24 -i award-wood-warm_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 award-wood-warm.mp4

타임라인(초): 0.0~2.0 카메라 진입 · 1.6~2.4 도장 내려앉기 · 2.3~3.3 리본 풀림 · 2.0~ 카메라 고정(hold) → 글자층 시간
"""
import bpy, math, json, sys, os
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

# ---------------------------------------------------------------- 인자
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '/tmp/award'
def arg(k, d):
    return type(d)(argv[argv.index(k) + 1]) if k in argv else d
W, H, FPS, SAMPLES = arg('--w', 640), arg('--h', 360), arg('--fps', 12), arg('--samples', 8)
SEC = 4.0
JSON_ONLY = '--json-only' in argv
FR_START = arg('--from', 1)     # 이어 굽기용
NAME = 'award-wood-warm'
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- 씬 초기화
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.resolution_percentage = 100
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, int(SEC * FPS)
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGB'
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Medium High Contrast'

# ---------------------------------------------------------------- 재질
def new_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; bsdf = nt.nodes['Principled BSDF']
    return m, nt, bsdf

def mat_wood():
    m, nt, b = new_mat('wood')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    wave = nt.nodes.new('ShaderNodeTexWave'); wave.bands_direction = 'Y'     # 결이 가로로 흐름
    wave.inputs['Scale'].default_value = 9.0; wave.inputs['Distortion'].default_value = 4.0
    wave.inputs['Detail'].default_value = 5.0; wave.inputs['Detail Scale'].default_value = 2.5
    wave.inputs['Detail Roughness'].default_value = 0.6
    big = nt.nodes.new('ShaderNodeTexNoise'); big.inputs['Scale'].default_value = 2.5     # 널판 톤 차이
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (0.028, 0.013, 0.006, 1)
    ramp.color_ramp.elements[1].color = (0.14, 0.07, 0.028, 1)
    mixc = nt.nodes.new('ShaderNodeMix'); mixc.data_type = 'RGBA'; mixc.blend_type = 'MULTIPLY'; mixc.inputs['Factor'].default_value = 0.5
    noise = nt.nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 500.0
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.06
    L = nt.links
    L.new(tc.outputs['Object'], wave.inputs['Vector']); L.new(tc.outputs['Object'], big.inputs['Vector'])
    L.new(wave.outputs['Fac'], ramp.inputs['Fac'])
    L.new(ramp.outputs['Color'], mixc.inputs[6]); L.new(big.outputs['Color'], mixc.inputs[7])
    L.new(mixc.outputs[2], b.inputs['Base Color'])
    L.new(wave.outputs['Fac'], bump.inputs['Height']); L.new(bump.outputs['Normal'], b.inputs['Normal'])
    b.inputs['Roughness'].default_value = 0.42
    b.inputs['Coat Weight'].default_value = 0.30                 # 니스 칠
    return m

def mat_paper():
    m, nt, b = new_mat('paper')
    b.inputs['Base Color'].default_value = (0.92, 0.88, 0.78, 1)
    b.inputs['Roughness'].default_value = 0.85
    noise = nt.nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 900.0
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.05
    nt.links.new(noise.outputs['Fac'], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
    return m

def mat_gold(rough=0.22):
    m, nt, b = new_mat('gold')
    b.inputs['Base Color'].default_value = (1.0, 0.72, 0.28, 1)
    b.inputs['Metallic'].default_value = 1.0
    b.inputs['Roughness'].default_value = rough
    noise = nt.nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 300.0
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.03
    nt.links.new(noise.outputs['Fac'], bump.inputs['Height']); nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
    return m

def mat_ribbon():
    m, nt, b = new_mat('ribbon')
    b.inputs['Base Color'].default_value = (0.62, 0.05, 0.08, 1)
    b.inputs['Roughness'].default_value = 0.45
    b.inputs['Sheen Weight'].default_value = 0.35; b.inputs['Sheen Tint'].default_value = (0.62, 0.05, 0.08, 1)  # 새틴 광
    return m

M_WOOD, M_PAPER, M_GOLD, M_RIB = mat_wood(), mat_paper(), mat_gold(), mat_ribbon()

# ---------------------------------------------------------------- 부품
def box(name, size, loc, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = size
    o.data.materials.append(mat)
    return o

# 책상 (넓게 — 카메라 진입 때 가장자리 안 보이게)
desk = box('desk', (2.0, 1.4, 0.04), (0, 0, -0.02), M_WOOD)

# 종이 A4 세로 210×297mm, 두께 0.6mm — 원점은 종이 중심 윗면 (0,0,0.0006)
PW, PH, PT = 0.210, 0.297, 0.0006
paper = box('paper', (PW, PH, PT), (0, 0, PT / 2), M_PAPER)
bpy.ops.object.transform_apply(scale=True)           # 종이는 실치수 메시(scale 1) — 자식·모서리 좌표가 종이 로컬 = 미터
bpy.ops.object.shade_smooth()
# (종이 기울임은 부품을 다 붙인 뒤 맨 아래에서)

# 금테: 바깥 이중선 + 안쪽 선. 종이 로컬 좌표로 만들고 종이에 부모
def frame_ring(name, w, h, t, z, mat):
    """폭 w·높이 h 사각 링, 선 굵기 t. 부품 4개(막대)로 만든 뒤 하나로 합침."""
    parts = []
    for i, (sx, sy, x, y) in enumerate([(w, t, 0, h / 2 - t / 2), (w, t, 0, -h / 2 + t / 2),
                                         (t, h, w / 2 - t / 2, 0), (t, h, -w / 2 + t / 2, 0)]):
        parts.append(box(f'{name}_{i}', (sx, sy, 0.0003), (x, y, z), mat))
    bpy.ops.object.select_all(action='DESELECT')
    for p in parts: p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join(); o = bpy.context.object; o.name = name
    return o

gold_thick = mat_gold(0.28)
ring_o = frame_ring('frame_outer', PW - 0.020, PH - 0.020, 0.0028, PT + 0.00015, gold_thick)
ring_m = frame_ring('frame_mid',   PW - 0.028, PH - 0.028, 0.0010, PT + 0.00015, gold_thick)
ring_i = frame_ring('frame_inner', PW - 0.036, PH - 0.036, 0.0006, PT + 0.00015, gold_thick)
# 모서리 장식(작은 금 마름모 4개)
corners = []
for sx in (-1, 1):
    for sy in (-1, 1):
        d = box(f'corner_{sx}{sy}', (0.008, 0.008, 0.0004),
                (sx * (PW / 2 - 0.014), sy * (PH / 2 - 0.014), PT + 0.0002), gold_thick, rot=(0, 0, math.radians(45)))
        corners.append(d)
for o in [ring_o, ring_m, ring_i] + corners:
    o.parent = paper                                   # 종이 로컬 좌표 그대로(역행렬 없음)

# 도장(금 메달): 종이 오른쪽 아래. 원판 + 위 얹힌 링 + 가운데 별
SEAL_R, SEAL_T = 0.024, 0.0032
SEAL_XY = (PW / 2 - 0.045, -PH / 2 + 0.052)
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=SEAL_R, depth=SEAL_T, location=(0, 0, 0))
seal = bpy.context.object; seal.name = 'seal'; seal.data.materials.append(M_GOLD)
bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_torus_add(major_radius=SEAL_R * 0.80, minor_radius=0.0009, major_segments=96, minor_segments=12,
                                 location=(0, 0, SEAL_T / 2))
tor = bpy.context.object; tor.name = 'seal_ring'; tor.data.materials.append(M_GOLD)
bpy.ops.object.shade_smooth()
# 가운데 별 (오각별 — 진짜 별 모양)
verts, faces = [], []
for i in range(10):
    r = 0.0105 if i % 2 == 0 else 0.0045
    a = math.radians(90 + i * 36)
    verts.append((r * math.cos(a), r * math.sin(a), 0))
verts.append((0, 0, 0.0016))                         # 꼭짓점을 살짝 올려 피라미드형
for i in range(10):
    faces.append((i, (i + 1) % 10, 10))
me = bpy.data.meshes.new('star'); me.from_pydata(verts, [], faces); me.update()
star = bpy.data.objects.new('seal_star', me); sc.collection.objects.link(star)
star.location = (0, 0, SEAL_T / 2); star.data.materials.append(mat_gold(0.15))
# 도장 물결 테두리(자잘한 구슬)
beads = []
for i in range(36):
    a = math.radians(i * 10)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0012, segments=12, ring_count=8,
                                         location=(SEAL_R * 0.93 * math.cos(a), SEAL_R * 0.93 * math.sin(a), SEAL_T / 2))
    b = bpy.context.object; b.data.materials.append(M_GOLD); bpy.ops.object.shade_smooth(); beads.append(b)
bpy.ops.object.select_all(action='DESELECT')
for o in [tor, star] + beads: o.select_set(True)
seal.select_set(True); bpy.context.view_layer.objects.active = seal
bpy.ops.object.join(); seal = bpy.context.object; seal.name = 'seal'
# 도장을 종이에 부모(종이가 -3° 돌아 있으므로 같이 돌게)
seal.parent = paper
SEAL_Z_DOWN = PT + SEAL_T / 2 + 0.0004                # 내려앉은 높이 (종이 위)
seal.location = (SEAL_XY[0], SEAL_XY[1], SEAL_Z_DOWN)

# 리본 두 가닥: 도장 밑에서 종이 아래쪽으로 비스듬히 늘어짐. 원점을 도장 중심에 두고 -Y로 자람 → scale.y 로 풀림 연출
def ribbon(name, ang_deg):
    L_, W_ = 0.085, 0.013
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
    o = bpy.context.object; o.name = name
    # 평면을 -Y 방향으로 길게, 원점은 위 끝
    o.scale = (W_, L_, 1)
    bpy.ops.object.transform_apply(scale=True)
    for v in o.data.vertices: v.co.y -= L_ / 2
    # 세로로 잘라 부드럽게 휘게
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.subdivide(number_cuts=12); bpy.ops.object.mode_set(mode='OBJECT')
    # 끝을 제비꼬리로
    for v in o.data.vertices:
        if v.co.y < -L_ + 0.004:
            v.co.y += 0.006 * (1 - abs(v.co.x) / (W_ / 2))
    # 살짝 파도 — 종이 위에 붙어 있으므로 두께감만
    o.data.materials.append(M_RIB)
    sol = o.modifiers.new('sol', 'SOLIDIFY'); sol.thickness = 0.0005
    bpy.ops.object.shade_smooth()
    o.rotation_euler = (0, 0, math.radians(ang_deg))
    o.parent = seal
    o.location = (0, 0, -SEAL_T / 2 - 0.0002)
    return o
rib_l = ribbon('ribbon_l', 22)
rib_r = ribbon('ribbon_r', -22)
# 살짝 비스듬히 놓인 느낌 (책상 위 자연스러움) — 자식·모서리 좌표가 다 같이 돈다
paper.rotation_euler = (0, 0, math.radians(-3))

# ---------------------------------------------------------------- 빛
def light(name, kind, loc, energy, color=(1, 1, 1), size=0.5, target=(0, 0, 0)):
    bpy.ops.object.light_add(type=kind, location=loc)
    o = bpy.context.object; o.name = name
    o.data.energy = energy; o.data.color = color
    if kind == 'AREA': o.data.size = size
    if kind == 'SPOT': o.data.spot_size = math.radians(40); o.data.spot_blend = 0.6; o.data.shadow_soft_size = 0.15
    d = Vector(target) - Vector(loc); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return o
light('key',  'AREA', (-0.55, -0.45, 0.75), 24, (1.0, 0.92, 0.80), size=0.8)
light('fill', 'AREA', ( 0.95,  0.55, 0.85),  6, (0.85, 0.90, 1.0), size=1.6)   # 반사 하이라이트가 카메라로 안 오게 뒤쪽 위
light('rim',  'SPOT', ( 0.10,  0.60, 0.55), 40, (1.0, 0.85, 0.65))
world = bpy.data.worlds.new('w'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.02, 0.015, 0.012, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0

# ---------------------------------------------------------------- 카메라
bpy.ops.object.camera_add(location=(0, -0.52, 0.50))
cam = bpy.context.object; cam.name = 'cam'; sc.camera = cam
cam.data.lens = 50; cam.data.sensor_width = 36
cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 5.6
bpy.ops.object.empty_add(location=(0, -0.005, 0)); tgt = bpy.context.object; tgt.name = 'cam_target'
con = cam.constraints.new('TRACK_TO'); con.target = tgt; con.track_axis = 'TRACK_NEGATIVE_Z'; con.up_axis = 'UP_Y'
cam.data.dof.focus_object = tgt

# ---------------------------------------------------------------- 애니메이션
def f(sec): return max(1, int(round(sec * FPS)) + 1)
def ease(t): return t * t * (3 - 2 * t)                      # smoothstep
def key(o, path, frame, value, idx=-1):
    if idx >= 0: getattr(o, path)[idx] = value
    else: setattr(o, path, value)
    o.keyframe_insert(data_path=path, frame=frame, index=idx)

# 카메라: 0.0~2.0s 높고 먼 데서 → 고정 자리. 이후 고정(hold)
CAM_A, CAM_B = Vector((0.24, -0.86, 0.90)), Vector((0.0, -0.52, 0.50))
HOLD_FROM = f(2.0)
for fr in range(1, sc.frame_end + 1):
    t = min(1.0, (fr - 1) / (f(2.0) - 1)); e = ease(t)
    cam.location = CAM_A.lerp(CAM_B, e)
    cam.keyframe_insert('location', frame=fr)
    if fr >= HOLD_FROM: break
cam.location = CAM_B; cam.keyframe_insert('location', frame=sc.frame_end)

# 도장: 1.6~2.4s 위에서 내려앉기 (마지막에 살짝 튕김)
z_up = SEAL_Z_DOWN + 0.16
for fr in range(1, sc.frame_end + 1):
    s = (fr - 1) / FPS
    if s <= 1.6: z = z_up
    elif s < 2.3: z = z_up + (SEAL_Z_DOWN - z_up) * (((s - 1.6) / 0.7) ** 2.2)   # 가속 낙하
    elif s < 2.42: z = SEAL_Z_DOWN + 0.004 * math.sin((s - 2.3) / 0.12 * math.pi)  # 튕김 한 번
    else: z = SEAL_Z_DOWN
    key(seal, 'location', fr, z, 2)
    seal.hide_render = s < 1.55; seal.keyframe_insert('hide_render', frame=fr)   # 떨어지기 전엔 화면에 없음
    # 내려오며 살짝 회전(도장 찍는 손목)
    key(seal, 'rotation_euler', fr, math.radians(18 * (1 - min(1, max(0, (s - 1.6) / 0.7)))) if s < 2.3 else 0.0, 2)

# 리본: 2.3~3.3s 도장 밑에서 풀려 나옴 (scale.y 0.02 → 1, 끝에 살랑)
for o, ph in ((rib_l, 0.0), (rib_r, 0.08)):
    for fr in range(1, sc.frame_end + 1):
        s = (fr - 1) / FPS
        u = min(1.0, max(0.0, (s - 2.3 - ph) / 1.0))
        key(o, 'scale', fr, 0.02 + 0.98 * ease(u), 1)
        key(o, 'rotation_euler', fr, math.radians((22 if o is rib_l else -22) + 3 * math.sin(s * 7) * (1 - u) * u * 4), 2)

# ---------------------------------------------------------------- 종이 모서리 화면좌표 JSON (글자층 원근 변환용)
def paper_corners_px(frame):
    sc.frame_set(frame); bpy.context.view_layer.update()
    pts = []
    for sx, sy in ((-1, 1), (1, 1), (1, -1), (-1, -1)):       # TL, TR, BR, BL (종이 기준 위=+Y)
        w = paper.matrix_world @ Vector((sx * PW / 2, sy * PH / 2, PT / 2))
        v = world_to_camera_view(sc, cam, w)
        pts.append([round(v.x * W, 2), round((1 - v.y) * H, 2)])
    return pts

meta = {
    'name': NAME, 'width': W, 'height': H, 'fps': FPS, 'frames': sc.frame_end,
    'hold_from': HOLD_FROM,                                   # 이 프레임부터 카메라 고정 → 글자층 시작
    'paper_mm': [210, 297],
    'seal_px': None,
    'text_safe_mm': [24, 24, 24, 70],                         # 종이 안 여백 (위·오른·아래·왼) — 도장 자리 피해 아래 여백 큼
    'corners': {},                                             # frame → [[x,y]×4] TL,TR,BR,BL
}
for fr in range(1, sc.frame_end + 1):
    meta['corners'][fr] = paper_corners_px(fr)
sc.frame_set(sc.frame_end)
sw = paper.matrix_world @ Vector((SEAL_XY[0], SEAL_XY[1], PT))
v = world_to_camera_view(sc, cam, sw); meta['seal_px'] = [round(v.x * W, 2), round((1 - v.y) * H, 2)]
with open(os.path.join(OUT, NAME + '.json'), 'w', encoding='utf-8') as fp:
    json.dump(meta, fp, ensure_ascii=False)
print('JSON ok — hold_from', HOLD_FROM, 'corners@end', meta['corners'][sc.frame_end])

if JSON_ONLY:
    sys.exit(0)

# ---------------------------------------------------------------- 렌더
for fr in range(FR_START, sc.frame_end + 1):
    sc.frame_set(fr)
    sc.render.filepath = os.path.join(OUT, f'{NAME}_{fr:04d}.png')
    bpy.ops.render.render(write_still=True)
    print('frame', fr, '/', sc.frame_end, flush=True)
# 포스터 = 마지막 프레임 복사
import shutil
shutil.copy(os.path.join(OUT, f'{NAME}_{sc.frame_end:04d}.png'), os.path.join(OUT, 'poster.png'))
print('DONE')

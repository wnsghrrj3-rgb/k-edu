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
  드론 인트로:     python hero_school.py -- OUT --shot orbit   (R148 「하늘에서 한 바퀴」 — 다 지어진 학교를 드론이 앞쪽 하늘에서
                   왼쪽 높이 → 정면 사진 자리로 반 바퀴 훑어 내려온다 · 조립 애니 없음 · 산출 school-orbit_####.png / .json)
  불 켜지는 저녁:  python hero_school.py -- OUT --shot night   (R149 「불이 켜지는 저녁」 — 정면 사진 자리에서 시작해(브라우저가 실사→3D 로 녹임)
                   해가 지며 하늘이 네이비로, 창마다 불이 켜지고 카메라가 천천히 물러나 떠오른다 · 조립 애니 없음 · 산출 school-night_####.png / .json)
  → 이어서: ffmpeg -framerate 24 -i school-build_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 school-build.mp4
"""
import bpy, math, json, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '/tmp/school'
def arg(k, d):
    return type(d)(argv[argv.index(k) + 1]) if k in argv else d
W, H, FPS, SAMPLES = arg('--w', 640), arg('--h', 360), arg('--fps', 12), arg('--samples', 8)
SHOT = arg('--shot', 'build')       # R148: build(지어진다) · orbit(하늘에서 한 바퀴) · R149: night(불이 켜지는 저녁)
V2 = SHOT == 'build'                                       # R150: 「지어진다」 v2 — 도면선·층별 차오름·창틀→유리·지붕 얹힘·금선·계단·깃대·창 보강·카메라 곡선 (orbit·night 무접촉)
SEC = {'build': 10.0 if V2 else 7.0, 'orbit': 8.0, 'night': 8.0}[SHOT]
HOLD = {'build': 8.4 if V2 else 5.6, 'orbit': 6.6, 'night': 7.0}[SHOT]
T_V2 = (1.25, 1.30)                                       # R150: 옛 조립 시각(0~4.8s) → 1.25 + t×1.30 (도면선 1.25초 앞에, 마지막 조각 ≈7.5s, HOLD 8.4)   # night: 카메라가 멈춰 자막이 뜨는 끝 자리(사진 자리는 시작 쪽 — PHOTO_AT)
PHOTO_AT = 'start' if SHOT == 'night' else 'end'          # R149: 실사와 맞닿는 프레임이 앞인가 뒤인가 — 페이지가 디졸브 방향을 정한다
PHOTO_HOLD = 1.6                                          # night: 이 초까지 카메라가 사진 자리에 고정(브라우저 실사→3D 디졸브 구간)
T_DUSK = (1.0, 6.2)                                       # night: 해 지는 구간(하늘·해·사진 발광)
T_CAM = (PHOTO_HOLD, 7.0)                                 # night: 카메라 물러나 떠오르는 구간
STILL = arg('--still', -1.0)
FR_START = arg('--from', 1)
FEATHER = arg('--feather', 0.18)   # R146 운동장 사진 가장자리 페더 폭(UV, 0=끄기)
NAME = 'school-' + SHOT
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
NIGHT = None   # R149: 밤 정도(0 낮 → 1 저녁) — 월드·해·사진 발광·창불이 전부 이 한 값의 키를 따른다
if SHOT == 'night':
    NIGHT = wn.nodes.new('ShaderNodeValue'); NIGHT.name = 'night'; NIGHT.outputs[0].default_value = 0.0
    dusk = wn.nodes.new('ShaderNodeValToRGB')                                   # 저녁 하늘: 지평선 주황 → 보랏빛 → 천정 네이비(케이메이커 결)
    dusk.color_ramp.elements[0].position = 0.0; dusk.color_ramp.elements[0].color = (0.95, 0.42, 0.16, 1)
    dusk.color_ramp.elements[1].position = 0.55; dusk.color_ramp.elements[1].color = (0.020, 0.028, 0.10, 1)
    e2 = dusk.color_ramp.elements.new(0.18); e2.color = (0.34, 0.16, 0.26, 1)
    wn.links.new(sep.outputs['Z'], dusk.inputs['Fac'])
    vor = wn.nodes.new('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 300.0; vor.inputs['Randomness'].default_value = 1.0   # 별: 보로노이 셀 중심 근처만 흰 점
    wn.links.new(tc.outputs['Generated'], vor.inputs['Vector'])
    st = wn.nodes.new('ShaderNodeMapRange'); st.inputs['From Min'].default_value = 0.0; st.inputs['From Max'].default_value = 0.06
    st.inputs['To Min'].default_value = 1.0; st.inputs['To Max'].default_value = 0.0; st.clamp = True
    wn.links.new(vor.outputs['Distance'], st.inputs['Value'])
    up = wn.nodes.new('ShaderNodeMapRange'); up.inputs['From Min'].default_value = 0.12; up.inputs['From Max'].default_value = 0.45; up.clamp = True   # 지평선 근처엔 별 없음(노을)
    wn.links.new(sep.outputs['Z'], up.inputs['Value'])
    m1 = wn.nodes.new('ShaderNodeMath'); m1.operation = 'MULTIPLY'; wn.links.new(st.outputs['Result'], m1.inputs[0]); wn.links.new(up.outputs['Result'], m1.inputs[1])
    m2 = wn.nodes.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'; wn.links.new(m1.outputs['Value'], m2.inputs[0]); wn.links.new(NIGHT.outputs[0], m2.inputs[1])
    m3 = wn.nodes.new('ShaderNodeMath'); m3.operation = 'MULTIPLY'; wn.links.new(m2.outputs['Value'], m3.inputs[0]); wn.links.new(NIGHT.outputs[0], m3.inputs[1])   # night² — 어두워진 뒤에야 별
    stars = wn.nodes.new('ShaderNodeMix'); stars.data_type = 'RGBA'; stars.blend_type = 'ADD'
    wn.links.new(m3.outputs['Value'], stars.inputs['Factor']); wn.links.new(dusk.outputs['Color'], stars.inputs[6]); stars.inputs[7].default_value = (0.9, 0.92, 1.0, 1)
    mixsky = wn.nodes.new('ShaderNodeMix'); mixsky.data_type = 'RGBA'
    wn.links.new(NIGHT.outputs[0], mixsky.inputs['Factor']); wn.links.new(ramp.outputs['Color'], mixsky.inputs[6]); wn.links.new(stars.outputs[2], mixsky.inputs[7])
    wn.links.new(mixsky.outputs[2], bg.inputs['Color'])

PXM, PX0, HORIZ, EYE, CAMD = 26.4, 768.0, 790.0, 1.8, 64.7
FPX = 40 / 36 * 1536                                  # 40mm·36mm 센서·1536px
PITCH = math.atan((HORIZ - 512) / FPX)               # 지평선이 화면 중심보다 아래 → 카메라가 위를 본다
LOOKZ = EYE + CAMD * math.tan(PITCH)
PROJ_POS = (0.0, -CAMD, EYE)

# ---------------------------------------------------------------- 재질
def new_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    return m, m.node_tree, m.node_tree.nodes['Principled BSDF']

def brick_color(nt, vec_xy=None):
    """R148: 벽돌 색 노드 한 벌을 nt 안에 만들어 색 소켓을 돌려준다. vec_xy=None 이면 정면(x,z), 아니면 준 벡터 소켓을 씀."""
    br = nt.nodes.new('ShaderNodeTexBrick')
    br.inputs['Scale'].default_value = 1.0
    br.inputs['Mortar Size'].default_value = 0.035; br.inputs['Mortar Smooth'].default_value = 0.4
    br.inputs['Bias'].default_value = 0.0; br.inputs['Brick Width'].default_value = 0.42; br.inputs['Row Height'].default_value = 0.14
    br.inputs['Color1'].default_value = (0.30, 0.09, 0.05, 1); br.inputs['Color2'].default_value = (0.21, 0.065, 0.04, 1)
    br.inputs['Mortar'].default_value = (0.36, 0.33, 0.30, 1)
    if vec_xy is not None: nt.links.new(vec_xy, br.inputs['Vector'])
    return br

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

def make_ground_ext(path, feather, fallback):
    """사진을 사방으로 feather(UV 비율)만큼 늘린 PNG 를 OUT/ 에 만든다. 안쪽=원본 그대로, 바깥=가장자리 색을 흐려 대체색으로 smoothstep. (R146)"""
    import numpy as np
    src = bpy.data.images.load(path); w, h = src.size
    px = np.array(src.pixels[:], dtype=np.float32).reshape(h, w, 4)[:, :, :3]     # 바이트 이미지 pixels = sRGB 값 그대로(0~1)
    bpy.data.images.remove(src)
    fx = feather; fy = feather * w / h                                             # 가로·세로 같은 픽셀 폭이 되게
    padx, pady = int(round(w * fx)), int(round(h * fy))
    ext = np.pad(px, ((pady, pady), (padx, padx), (0, 0)), mode='edge')
    def box(a, r):                                                                 # 분리형 박스 흐림 3회 ≈ 가우시안
        for _ in range(3):
            for ax in (0, 1):
                c = np.cumsum(np.pad(a, [(r, r) if i == ax else (0, 0) for i in range(3)], mode='edge'), axis=ax)
                a = (np.take(c, np.arange(2 * r, c.shape[ax]), axis=ax) - np.take(c, np.arange(0, c.shape[ax] - 2 * r), axis=ax)) / (2 * r)
        return a
    blur = box(ext, max(4, min(padx, pady) // (2 if V2 else 6)))                 # R150 v2: 흐림 반경을 크게 — 옆에서 볼 때 늘린 가장자리 줄무늬가 부드러운 톤으로
    H2, W2 = ext.shape[:2]
    yy, xx = np.mgrid[0:H2, 0:W2]
    dx = np.maximum(np.maximum(padx - xx, xx - (padx + w - 1)), 0) / max(padx, 1)   # 원본 밖 거리(0~1)
    dy = np.maximum(np.maximum(pady - yy, yy - (pady + h - 1)), 0) / max(pady, 1)
    d = np.clip(np.sqrt(dx * dx + dy * dy) * (1.6 if V2 else 1.0), 0, 1); t = (d * d * (3 - 2 * d))[:, :, None]   # smoothstep (R150 v2: 대체색으로 더 일찍)
    fb = np.array([c * 12.92 if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055 for c in fallback], dtype=np.float32)[None, None, :]   # 바이트 이미지 pixels 는 sRGB 값이라 대체색(선형)을 sRGB 로
    out = np.where((dx == 0)[:, :, None] & (dy == 0)[:, :, None], ext, blur * (1 - t) + fb * t)
    img = bpy.data.images.new('ground_ext', W2, H2, alpha=True, float_buffer=False)
    rgba = np.concatenate([out, np.ones((H2, W2, 1), np.float32)], axis=2)
    img.pixels = rgba.ravel().tolist(); img.filepath_raw = os.path.join(OUT, 'school-photo-ground-ext.png'); img.file_format = 'PNG'; img.save()
    print('ground-ext', W2, 'x', H2, '->', img.filepath_raw, flush=True)
    return img.filepath_raw, fx, fy

REVEAL = []   # R148: hold 직전에 드러낼 배경판 재질(노드트리)들
def mat_photo(path, facing=True, name='photo', fallback=(0.30, 0.14, 0.10), feather=0.0):
    m, nt, b = new_mat(name)
    img = bpy.data.images.load(path); tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img; tex.extension = 'CLIP'
    uv = nt.nodes.new('ShaderNodeUVMap'); uv.uv_map = 'proj'
    nt.links.new(uv.outputs['UV'], tex.inputs['Vector']); nt.links.new(tex.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.8
    # 사진 그대로가 정답 → 발광(무음영) 0.78 + 햇빛 음영 0.22 섞음: 끝 프레임은 사진, 짓는 동안은 입체감
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = 1.0; em.name = 'dayem'   # R149: night 에선 이 강도가 낮의 사진빛 → 저녁으로 키를 탄다
    nt.links.new(tex.outputs['Color'], em.inputs['Color'])
    mix = nt.nodes.new('ShaderNodeMixShader'); mix.inputs['Fac'].default_value = 0.78; mix.name = 'daymix'   # R150 v2: 짓는 동안 0.60(입체감) → HOLD-0.8 에 0.78(사진 그대로)
    out = nt.nodes['Material Output']
    nt.links.new(b.outputs['BSDF'], mix.inputs[1]); nt.links.new(em.outputs['Emission'], mix.inputs[2])
    # 영사기를 등진 면(옆면·지붕 위)은 사진이 늘어져 보인다 → 그런 면은 무광 벽돌색으로
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    tocam = nt.nodes.new('ShaderNodeVectorMath'); tocam.operation = 'SUBTRACT'; tocam.inputs[1].default_value = (PROJ_POS[0], PROJ_POS[1], PROJ_POS[2])
    nrm = nt.nodes.new('ShaderNodeVectorMath'); nrm.operation = 'NORMALIZE'
    dot = nt.nodes.new('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'
    ramp = nt.nodes.new('ShaderNodeMapRange'); ramp.inputs['From Min'].default_value = -0.35; ramp.inputs['From Max'].default_value = -0.12
    ramp.inputs['To Min'].default_value = 1.0; ramp.inputs['To Max'].default_value = 0.0
    side = nt.nodes.new('ShaderNodeBsdfDiffuse'); side.inputs['Color'].default_value = (*fallback, 1); side.name = 'side'   # R149 night: 사진 밖 땅은 이 색이 어두워진다
    if SHOT in ('orbit', 'night') and facing:       # R148 드론 시점: 영사기를 등진 옆벽이 큰 면으로 보임 → 민무늬 대신 벽돌 무늬(옆벽·앞벽 둘 다 서게 x+y, z 로 깔음)
        gco = nt.nodes.new('ShaderNodeTexCoord'); gsep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(gco.outputs['Object'], gsep.inputs['Vector'])
        gadd = nt.nodes.new('ShaderNodeMath'); gadd.operation = 'ADD'; nt.links.new(gsep.outputs['X'], gadd.inputs[0]); nt.links.new(gsep.outputs['Y'], gadd.inputs[1])
        gcomb = nt.nodes.new('ShaderNodeCombineXYZ'); nt.links.new(gadd.outputs['Value'], gcomb.inputs['X']); nt.links.new(gsep.outputs['Z'], gcomb.inputs['Y'])
        nt.links.new(brick_color(nt, gcomb.outputs['Vector']).outputs['Color'], side.inputs['Color'])
    mix2 = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(geo.outputs['Position'], tocam.inputs[0]); nt.links.new(tocam.outputs['Vector'], nrm.inputs[0])
    nt.links.new(nrm.outputs['Vector'], dot.inputs[0]); nt.links.new(geo.outputs['Normal'], dot.inputs[1])
    nt.links.new(dot.outputs['Value'], ramp.inputs['Value'])
    if not facing and SHOT in ('orbit', 'night') and name == 'photo_sky':   # R149 night: 사진 하늘이 저녁 하늘(월드)로 걷힘 — reveal 1→0   # R148: 드론 구간엔 배경판을 투명(세계 하늘 그라데이션)으로 두고 hold 1.2초 전부터 사진 하늘로 드러냄 — 비스듬한 시점에서 판이 벽처럼 보이던 것
        REVEAL.append(nt)
    if not facing:                       # 운동장·배경판: 스침각이라도 사진, 사진 밖만 대체색
        if feather > 0:                  # R146 운동장 가장자리 페더: 사진을 밖으로 늘려(가장자리 흐림→대체색) 미리 만든 이미지를 씀 — 사진 안쪽 픽셀은 그대로(hold 프레임 무변화)
            ext_path, fx, fy = make_ground_ext(path, feather, fallback)
            tex.image = bpy.data.images.load(ext_path); tex.extension = 'CLIP'
            mp = nt.nodes.new('ShaderNodeMapping'); mp.vector_type = 'POINT'
            mp.inputs['Scale'].default_value = (1 / (1 + 2 * fx), 1 / (1 + 2 * fy), 1); mp.inputs['Location'].default_value = (fx / (1 + 2 * fx), fy / (1 + 2 * fy), 0)
            nt.links.new(uv.outputs['UV'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], tex.inputs['Vector'])
            nt.links.new(tex.outputs['Alpha'], mix2.inputs['Fac'])
        else:
            nt.links.new(tex.outputs['Alpha'], mix2.inputs['Fac'])
        nt.links.new(side.outputs['BSDF'], mix2.inputs[1]); nt.links.new(mix.outputs['Shader'], mix2.inputs[2])
        if nt in REVEAL:
            tr = nt.nodes.new('ShaderNodeBsdfTransparent'); rv = nt.nodes.new('ShaderNodeValue'); rv.name = 'reveal'; rv.outputs[0].default_value = 0.0
            mix3 = nt.nodes.new('ShaderNodeMixShader'); nt.links.new(rv.outputs[0], mix3.inputs['Fac'])
            nt.links.new(tr.outputs['BSDF'], mix3.inputs[1]); nt.links.new(mix2.outputs['Shader'], mix3.inputs[2])
            nt.links.new(mix3.outputs['Shader'], out.inputs['Surface']); return m
        nt.links.new(mix2.outputs['Shader'], out.inputs['Surface']); return m
    # 사진 밖(UV 0~1 바깥)도 벽돌색 — 사진 오른쪽 끝 너머가 늘어지지 않게
    inpic = nt.nodes.new('ShaderNodeMath'); inpic.operation = 'MULTIPLY'
    nt.links.new(ramp.outputs['Result'], inpic.inputs[0]); nt.links.new(tex.outputs['Alpha'], inpic.inputs[1])
    nt.links.new(inpic.outputs['Value'], mix2.inputs['Fac']); nt.links.new(side.outputs['BSDF'], mix2.inputs[1]); nt.links.new(mix.outputs['Shader'], mix2.inputs[2])
    if SHOT in ('orbit', 'night'):                  # R148 드론 시점: 위를 보는 면(옥상)은 벽돌색 대신 콘크리트 — 하늘에서 내려다보면 옥상이 큰 면이라
        sepn = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(geo.outputs['Normal'], sepn.inputs['Vector'])
        upr = nt.nodes.new('ShaderNodeMapRange'); upr.inputs['From Min'].default_value = 0.35; upr.inputs['From Max'].default_value = 0.7
        nt.links.new(sepn.outputs['Z'], upr.inputs['Value'])
        roof = nt.nodes.new('ShaderNodeBsdfDiffuse'); roof.inputs['Color'].default_value = (0.50, 0.50, 0.48, 1); roof.inputs['Roughness'].default_value = 0.9
        mix3 = nt.nodes.new('ShaderNodeMixShader'); nt.links.new(upr.outputs['Result'], mix3.inputs['Fac'])
        nt.links.new(mix2.outputs['Shader'], mix3.inputs[1]); nt.links.new(roof.outputs['BSDF'], mix3.inputs[2])
        nt.links.new(mix3.outputs['Shader'], out.inputs['Surface']); return m
    nt.links.new(mix2.outputs['Shader'], out.inputs['Surface'])
    return m

M = dict(brick=mat_brick(), concrete=mat_flat('concrete', (0.62, 0.62, 0.58), 0.9), concrete_dark=mat_flat('cdark', (0.42, 0.42, 0.40), 0.9),
         red=mat_flat('red', (0.55, 0.12, 0.08), 0.6), glass=mat_glass_dark(), green=mat_flat('green', (0.18, 0.42, 0.30), 0.45, 0.3),
         gglass=mat_green_glass(), sand=mat_sand(), grey=mat_flat('grey', (0.40, 0.42, 0.44), 0.8),
         white=mat_flat('white', (0.85, 0.85, 0.85), 0.7), navy=mat_flat('navy', (0.05, 0.05, 0.25), 0.5),
         leaf=mat_leaf(), bark=mat_flat('bark', (0.22, 0.16, 0.10), 0.95), steel=mat_flat('steel', (0.6, 0.6, 0.62), 0.35, 0.8),
         gold=mat_flat('gold', (0.7, 0.55, 0.2), 0.4, 0.8), pool=mat_flat('pool', (0.70, 0.72, 0.74), 0.9))
def mat_gold_glow():
    m, nt, b = new_mat('goldglow'); em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (0.95, 0.78, 0.36, 1); em.inputs['Strength'].default_value = 9.0
    nt.links.new(em.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface']); return m
M['glow'] = mat_gold_glow()
LINES = []   # R150: (obj, t_draw0, t_draw1, t_off0, t_off1) 도면선 — 새 시간축(초) 그대로
EDGES = []   # R150: (edge_obj, wall_obj, z0, h) 벽이 차오르는 윗선을 따라가는 금선
_SKY = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'plates', 'school-photo-sky.png')   # 하늘만 남긴 RGBA(건물·땅 알파 0)
_PHOTO0 = arg('--photo', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'plates', 'school-photo-clean.png'))
if os.path.exists(_PHOTO0): M['photo'] = mat_photo(_PHOTO0); M['photo_ground'] = mat_photo(_PHOTO0, facing=False, name='photo_ground', fallback=(0.74, 0.69, 0.60) if SHOT == 'build' else (0.52, 0.50, 0.43), feather=FEATHER); M['photo_sky'] = mat_photo(_SKY if os.path.exists(_SKY) else _PHOTO0, facing=False, name='photo_sky', fallback=(0.80, 0.82, 0.85))   # R145: 배경판엔 하늘만(알파) — 비스듬한 카메라에서 건물 사진이 뒤판에 한 번 더 비치던 문제 · R148 orbit: 땅 대체색은 사진 밖 땅이 화면 대부분이라 덜 하얗게

LIT = []   # R149: (obj, t_on) — 창·등·현관 불 켜지는 시각. 재질은 오브젝트 속성 'lit'(0→1) 을 읽어 발광을 섞는다(재질 하나·오브젝트마다 키)
def _lit_attr(nt):
    a = nt.nodes.new('ShaderNodeAttribute'); a.attribute_type = 'OBJECT'; a.attribute_name = 'lit'; return a
def mat_photo_window():
    """창: 사진 재질 그대로 + 오브젝트 'lit' 만큼 따뜻한 빛 (R149)"""
    m = mat_photo(_PHOTO0, name='photo_win'); nt = m.node_tree; out = nt.nodes['Material Output']
    prev = out.inputs['Surface'].links[0].from_socket
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (1.0, 0.52, 0.20, 1); em.inputs['Strength'].default_value = 1.4   # AgX 에서 하얗게 타지 않는 선(첫 시험 7.0 은 흰 판이 됨)
    mx = nt.nodes.new('ShaderNodeMixShader'); nt.links.new(_lit_attr(nt).outputs['Fac'], mx.inputs['Fac'])
    nt.links.new(prev, mx.inputs[1]); nt.links.new(em.outputs['Emission'], mx.inputs[2]); nt.links.new(mx.outputs['Shader'], out.inputs['Surface'])
    return m
def mat_lamp(rgb, strength):
    m, nt, b = new_mat('lamp'); out = nt.nodes['Material Output']
    b.inputs['Base Color'].default_value = (0.9, 0.9, 0.9, 1); b.inputs['Roughness'].default_value = 0.4
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (*rgb, 1); em.inputs['Strength'].default_value = strength
    mx = nt.nodes.new('ShaderNodeMixShader'); nt.links.new(_lit_attr(nt).outputs['Fac'], mx.inputs['Fac'])
    nt.links.new(b.outputs['BSDF'], mx.inputs[1]); nt.links.new(em.outputs['Emission'], mx.inputs[2]); nt.links.new(mx.outputs['Shader'], out.inputs['Surface'])
    return m
if SHOT == 'night' and 'photo' in M:
    M['photo_win'] = mat_photo_window(); M['lamp'] = mat_lamp((1.0, 0.76, 0.48), 22.0)

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
    return _finish(o, mat, 'rise' if V2 else 'drop', t0, t1, z_eave)   # R150: v2 는 처마선에서 마루로 세워짐(위에서 떨어지지 않음)

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
bpy.ops.mesh.primitive_grid_add(size=400, x_subdivisions=120, y_subdivisions=120); g = bpy.context.object; g.name = 'ground'; g.data.materials.append(M['sand'])
g.location = (15, 20, 0)
if SHOT in ('orbit', 'night'): g.scale = (5, 5, 1)   # R148 드론 높이에선 400m 땅 끝이 지평선 아래로 보임 → 2km 로(사진 밖은 어차피 대체색)

# ---------------------------------------------------------------- 사진 단위 (R144-2: 나무 없는 사진 school-photo-clean.png 1536×1024 에서 읽음)
# 앞면(y=0) 기준 px/m=26.4, 화면 가로 원점 px 700 → x=0, 지평선 py 790(카메라 눈높이 1.8m).
# 깊이 d 만큼 안쪽 점은 px/m 이 26.4*D/(D+d) 로 줄어든다(D=카메라 거리).
PHOTO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'plates', 'school-photo-clean.png')
PHOTO = arg('--photo', PHOTO)

def X(px, d=0.0): return (px - PX0) / (PXM * CAMD / (CAMD + d))
def Z(py, d=0.0): return EYE + (HORIZ - py) / (PXM * CAMD / (CAMD + d))

# ---------------------------------------------------------------- 학교 (X 오른쪽 · Y 안쪽 · Z 위)
PH = M['photo'] if 'photo' in M else M['brick']
def win(name, x0, x1, y0, y1, zb, zt, t0, t1, frame=True):
    """R150: 창 = 흰 틀(먼저) → 유리(0.15s 뒤). v1 은 유리만."""
    if V2 and frame:
        box(name + '_f', x0 - 0.08, x1 + 0.08, y0 - 0.04, y1, zb - 0.08, zt + 0.08, M['white'], 'pop', t0 - 0.18, t1 - 0.18, origin='center')
    box(name, x0, x1, y0, y1, zb, zt, M['glass'], 'pop', t0, t1, origin='center')
if V2:
    # 왼쪽 동 창 2×2 (px 36~110 · py 467~660)
    for r, (pa, pb) in enumerate([(467, 553), (573, 660)]):
        for c, (qa, qb) in enumerate([(36, 67), (80, 110)]):
            win(f'lwin{r}_{c}', X(qa), X(qb), -0.3, 0.05, Z(pb), Z(pa), 2.45 + r * 0.1 + c * 0.05, 2.8 + r * 0.1 + c * 0.05)
    # 박공동 유리벽 양옆 작은 창 2×2 (px 148~175 · 553~587)
    for r, (pa, pb) in enumerate([(493, 547), (600, 650)]):
        for c, (qa, qb) in enumerate([(148, 175), (553, 587)]):
            win(f'gsm{r}_{c}', X(qa), X(qb), -0.3, 0.05, Z(pb), Z(pa), 2.55 + r * 0.1 + c * 0.05, 2.9 + r * 0.1 + c * 0.05)
    # 현관 양쪽 계단 5단 (관람석 앞 땅 → 승강장) + 깃대 3
    for side, (qa, qb) in enumerate([(190, 300), (540, 620)]):
        for k in range(5):
            y0 = -10.5 + k * 0.9; zt = Z(770, -6) * (k + 1) / 5
            box(f'step{side}_{k}', X(qa, -6), X(qb, -6), y0, -6.0, 0, zt, PH, 'rise', 0.95 + k * 0.08 + side * 0.05, 1.25 + k * 0.08 + side * 0.05)
    for i, px in enumerate([320, 360, 400]):
        cyl(f'flag{i}', X(px, -4), -4.0, Z(770, -6), Z(400, -4), 0.06, M['steel'], 'rise', 4.3 + i * 0.1, 4.7 + i * 0.1, seg=10)
        box(f'flagcloth{i}', X(px, -4) + 0.06, X(px, -4) + 0.9, -4.02, -3.98, Z(400, -4) - 0.6, Z(400, -4) - 0.05, M['white'], 'slidex', 4.75 + i * 0.1, 4.95 + i * 0.1, origin='left')
# 0) 관람석·옹벽 (앞으로 9m 나와 있음)
for i, (y0, y1, py) in enumerate([(-10.5, -9.0, 830), (-9.0, -7.5, 800), (-7.5, -6.0, 785)]):
    box(f'bleach{i}', -36, 46, y0, y1, 0, Z(py, y1), PH, 'rise', 0.15 + i * 0.12, 0.65 + i * 0.12)
box('platform', -36, 46, -6.0, -0.2, 0, Z(770, -6), PH, 'rise', 0.5, 0.9)
box('rail', -36, 46, -6.1, -5.9, Z(770, -6), Z(770, -6) + 1.05, M['steel'], 'rise', 0.9, 1.2)

# 1) 왼쪽 동
box('leftwing', -36, X(140), 0, 24, 0, Z(440), PH, 'rise', 0.6, 1.7)
box('leftwing_cop', -36.1, X(140) + 0.1, -0.1, 24.1, Z(440), Z(440) + 0.35, M['red'], 'drop', 2.9, 3.4)

# 2) 박공동 (본관 정면)  px 140~640 · 처마 py 335 · 마루 py 275 @px 385
GX0, GX1, GZE, GZP, GXP = X(140), X(640), Z(335), Z(275), X(385)
box('gableblock', GX0, GX1, 0, 20, 0, GZE, PH, 'rise', 0.8, 2.2)
gable('gable_front', GX0 - 0.3, GX1 + 0.3, -0.15, 20.15, GZE, GZP, PH, 2.9, 3.5)
box('gable_band', GX0 - 0.3, GX1 + 0.3, -0.12, 20.1, GZE - 0.2, GZE + 0.1, M['red'], 'drop', 3.0, 3.5)
for side, (xa, xb) in enumerate([(GX0 - 0.3, GXP), (GXP, GX1 + 0.3)]):
    rise = GZP - GZE
    L_ = math.hypot(xb - xa, rise); ang = math.atan2(rise, xb - xa) * (1 if side == 0 else -1)
    bpy.ops.mesh.primitive_cube_add(size=1); o = bpy.context.object; o.name = f'gable_edge{side}'
    o.scale = (L_, 0.35, 0.28); o.rotation_euler = (0, -ang, 0)
    o.location = ((xa + xb) / 2, -0.15, GZE + rise / 2); o.data.materials.append(M['red'])
    BUILD.append((o, 'drop', 3.0, 3.5))
for i in range(7):                                             # 위 창 7 (px 210~555, py 375~440)
    cx = X(210 + i * 57.5)
    win(f'gwin{i}', cx - 0.55, cx + 0.55, -0.35, 0.05, Z(440), Z(375), 2.4 + i * 0.07, 2.8 + i * 0.07)
box('glasswall', X(180), X(610), -0.3, 0.05, Z(600), Z(520), M['glass'], 'pop', 2.5, 3.0, origin='center')   # 2층 유리벽
box('entry_glass', X(425), X(620), -0.3, 0.05, Z(770, -6), Z(640), M['glass'], 'pop', 2.6, 3.0, origin='center')   # 현관 유리
# 엠블럼 · 교명 (사진 모드: 사진에 이미 찍혀 있으므로 살짝 돌출만 — 질감은 사진이 입힘 / 모형 모드: 진짜 엠블럼 3D, R146 emblem.py)
if 'photo' in M:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.95, depth=0.25, vertices=32); em = bpy.context.object; em.name = 'emblem'
    em.rotation_euler = (math.radians(90), 0, 0); em.location = (X(405), -0.2, 0); em.data.materials.append(PH)
    BUILD.append((em, 'pop', 4.0, 4.5)); em.location.z = Z(320)
else:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import emblem
    em = emblem.build('emblem', size=0.62, depth=0.16, gold=True)          # 원 반지름 0.62m → 날개 폭 약 2m
    em.rotation_euler = (math.radians(90), 0, 0); em.location = (X(405), -0.2, 0)
    BUILD.append((em, 'pop', 4.0, 4.5)); em.location.z = Z(320)
if os.path.exists(FONT) and 'photo' not in M:   # 사진 모드에선 벽에 사진 글자가 이미 찍혀 있어 3D 글자를 겹치지 않는다(R145: 이중으로 보이던 문제)
    cu = bpy.data.curves.new('schoolname', 'FONT'); cu.body = '금성초등학교'; cu.font = bpy.data.fonts.load(FONT)
    cu.size = 1.55; cu.extrude = 0.12; cu.align_x = 'CENTER'
    tx = bpy.data.objects.new('schoolname', cu); sc.collection.objects.link(tx)
    tx.rotation_euler = (math.radians(90), 0, 0); tx.location = (X(400), -0.28, 0); tx.data.materials.append(M['navy'])
    BUILD.append((tx, 'pop', 4.1, 4.7)); tx.location.z = Z(470) - 0.7
# 입구 캐노피 (초록 유리 아치, 앞으로 6m) + 기둥
AX0, AX1, AZT = X(425, -6), X(760, -6), Z(590, -6)
bpy.ops.mesh.primitive_cylinder_add(radius=(AX1 - AX0) / 2, depth=6.0, vertices=28); arch = bpy.context.object; arch.name = 'entry_arch'
arch.rotation_euler = (0, math.radians(90), 0); arch.scale = (0.32, 1, 1)
arch.location = ((AX0 + AX1) / 2, -3.0, 0); arch.data.materials.append(M['gglass']); BUILD.append((arch, 'pop', 3.6, 4.1))
arch.location.z = AZT - (AX1 - AX0) / 2 * 0.32
box('entry_cut', AX0 - 0.5, AX1 + 0.5, -6.6, 0.4, 0, AZT - (AX1 - AX0) / 2 * 0.32 - 0.05, PH, 'rise', 0.8 if V2 else 0, 2.2 if V2 else 0.01)   # 아치 아랫부분 가리개 (R150 v2: 박공동과 같이 올라옴 — 0초부터 덩그러니 서 있던 것)
for i, px in enumerate([445, 740]):
    cyl(f'arch_post{i}', X(px, -6), -5.9, Z(770, -6), AZT - 1.5, 0.12, M['steel'], 'rise', 3.4, 3.7)

# 3) 탑 (박공동 뒤 9m, 평지붕 — 정리 사진 기준)
box('tower', X(242, 9), X(490, 9), 8, 17, 0, Z(200, 9), PH, 'rise', 1.4, 2.7)
box('tower_cop', X(242, 9) - 0.2, X(490, 9) + 0.2, 7.8, 17.2, Z(200, 9), Z(200, 9) + 0.35, M['red'], 'drop', 3.3, 3.7)

# 4) 오른쪽 동  px 640~1400 · 파라펫 py 355 · 창 띠 4줄 · 기둥 9
RX0, RX1, RZT = X(640), X(1400), Z(355)
box('rightwing', RX0, RX1, 0, 22, 0, RZT, PH, 'rise', 1.0, 2.6)
box('rightwing_cop', RX0 - 0.1, RX1 + 0.1, -0.1, 22.1, RZT, RZT + 0.35, M['red'], 'drop', 3.0, 3.5)
box('farblock', RX1, X(1560, 8), 8, 30, 0, Z(360, 8), PH, 'rise', 1.2, 2.6)          # 오른쪽 끝 뒤로 물러난 동
if V2:   # R150: 물러난 동에도 창 띠(3줄 × 2) — 비어 있던 벽
    for fl, (pa, pb) in enumerate([(390, 450), (490, 540), (575, 620)]):
        for i, (qa, qb) in enumerate([(1418, 1470), (1490, 1545)]):
            win(f'fwin{fl}_{i}', X(qa, 8), X(qb, 8), 7.8, 8.0, Z(pb, 8), Z(pa, 8), 2.7 + fl * 0.1 + i * 0.05, 3.05 + fl * 0.1 + i * 0.05)
BANDS = [(360, 380), (455, 475), (548, 565), (640, 660)]
for fl, (pa, pb) in enumerate(BANDS):
    box(f'band{fl}', RX0, RX1, -0.25, 0.0, Z(pb), Z(pa), M['concrete'], 'slidex', 2.0 + fl * 0.12, 2.5 + fl * 0.12, origin='left')
PILS = [640, 740, 845, 950, 1050, 1150, 1250, 1350, 1440]
for i, px in enumerate(PILS[:-1]):
    box(f'pil{i}', X(px), X(px) + 0.6, -0.3, 0.0, 0, RZT, M['concrete'], 'rise', 1.9 + i * 0.05, 2.35 + i * 0.05)
ROWS = [(390, 450), (490, 540), (575, 620), (670, 710)]
for fl, (pa, pb) in enumerate(ROWS):
    for i in range(8):
        x0, x1 = X(PILS[i] + 18), X(PILS[i + 1] - 18)
        win(f'rwin{fl}_{i}', x0, x1, -0.2, 0.0, Z(pb), Z(pa), 2.5 + fl * 0.1 + i * 0.04, 2.85 + fl * 0.1 + i * 0.04, frame=False)   # 띠·기둥·창턱이 틀 노릇 — 틀 생략
        box(f'rsill{fl}_{i}', x0 - 0.1, x1 + 0.1, -0.28, 0.0, Z(pb) - 0.18, Z(pb), M['white'], 'pop', 2.55 + fl * 0.1 + i * 0.04, 2.9 + fl * 0.1 + i * 0.04, origin='center')
# 옥상 정자 2 (4m 안쪽) — 콘크리트 기둥 + 초록 곡면 지붕
for k, (pa, pb, ptop) in enumerate([(605, 885, 235), (960, 1200, 270)]):
    x0, x1, zt = X(pa, 4), X(pb, 4), Z(ptop, 4)
    for i, (dx, dy) in enumerate([(0.6, 3), (x1 - x0 - 1.2, 3), (0.6, 10), (x1 - x0 - 1.2, 10)]):
        box(f'perg{k}_post{i}', x0 + dx, x0 + dx + 0.6, dy, dy + 0.6, RZT, zt - 0.7, M['concrete'], 'rise', 3.5 + k * 0.2, 3.9 + k * 0.2)
    box(f'perg{k}_roof', x0, x1, 1.6, 11.6, zt - 0.7, zt - 0.15, M['green'], 'drop', 3.9 + k * 0.2, 4.3 + k * 0.2)
    box(f'perg{k}_rim', x0 - 0.1, x1 + 0.1, 1.5, 11.7, zt - 0.15, zt + 0.1, M['concrete'], 'drop', 3.9 + k * 0.2, 4.3 + k * 0.2)
    ball(f'perg{k}_fin', (x0 + x1) / 2, 6.5, zt + 0.3, 0.4, M['green'], 4.3 + k * 0.2, 4.6 + k * 0.2)
# 긴 초록 캐노피 (앞으로 7m)
CZ = Z(660, -7)
box('canopy', -36, 46, -8.2, -5.8, CZ - 0.45, CZ, M['gglass'], 'drop', 3.7, 4.2)
for i in range(24):
    x = -35 + i * 3.5
    cyl(f'cpost{i}', x, -6.0, Z(770, -6), CZ - 0.45, 0.07, M['steel'], 'rise', 3.4 + i * 0.015, 3.7 + i * 0.015)
if SHOT == 'night':                                             # R149: 먼 산 능선 — 저녁 하늘에 검은 실루엣(낮엔 사진 하늘판 뒤라 안 보이고, 하늘판이 걷히며 드러남)
    import random as _r; _m = _r.Random(149); hill = mat_flat('hill', (0.05, 0.06, 0.10), 0.95)
    for i in range(38):
        x = -1400 + i * 76 + _m.uniform(-25, 25); h = _m.uniform(45, 130) * (1.0 if abs(x) > 300 else 0.75); w = _m.uniform(120, 260)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=16, ring_count=10); o = bpy.context.object; o.name = f'hill{i}'
        o.scale = (w, w * 0.6, h); o.location = (x, 900 + _m.uniform(-60, 60), -h * 0.15); o.data.materials.append(hill); bpy.ops.object.shade_smooth()
    # 캐노피 아래 등 12 (기둥 하나 걸러) · 정문 아치 · 현관·유리벽·창은 아래 LIT 표에서 (기둥 하나 걸러) · 정문 아치 · 현관·유리벽·창은 아래 LIT 표에서
    for i in range(0, 24, 2):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.22, segments=12, ring_count=8); o = bpy.context.object; o.name = f'lamp{i}'
        o.location = (-35 + i * 3.5, -6.0, CZ - 0.75); o.data.materials.append(M['lamp']); bpy.ops.object.shade_smooth()
        LIT.append((o, 2.2 + i * 0.03))
# 나무: 정리 사진엔 없음 — 끝에 실사(원본, 나무 있음)로 녹아들 때 나무가 생긴다
# R150 도면선: 큰 덩어리 발자국을 금선으로 먼저 그린 뒤(0.25~1.2s), 그 벽이 올라오면 걷힌다 — 새 시간축 그대로(T_V2 무관)
if V2:
    FOOT = [('bleach', -36, 46, -10.5, -6.0, 0.25), ('leftwing', -36, X(140), 0, 24, 0.40), ('gable', GX0, GX1, 0, 20, 0.50),
            ('right', RX0, RX1, 0, 22, 0.60), ('far', RX1, X(1560, 8), 8, 30, 0.72), ('tower', X(242, 9), X(490, 9), 8, 17, 0.84)]
    WALL_T0 = {'bleach': 0.15, 'leftwing': 0.6, 'gable': 0.8, 'right': 1.0, 'far': 1.2, 'tower': 1.4}
    for nm, x0, x1, y0, y1, td in FOOT:
        toff = T_V2[0] + WALL_T0[nm] * T_V2[1] + 0.25
        for k, (ax, ay, L_, rot) in enumerate([(x0, y0, x1 - x0, 0), (x1, y0, y1 - y0, 90), (x1, y1, x1 - x0, 180), (x0, y1, y1 - y0, -90)]):
            bpy.ops.mesh.primitive_cube_add(size=1); o = bpy.context.object; o.name = f'bp_{nm}_{k}'
            for v in o.data.vertices: v.co.x = (v.co.x + 0.5) * L_; v.co.y *= 0.09; v.co.z = (v.co.z + 0.5) * 0.035
            o.location = (ax, ay, 0.02); o.rotation_euler = (0, 0, math.radians(rot)); o.data.materials.append(M['glow'])
            LINES.append((o, td + k * 0.13, td + 0.30 + k * 0.13, toff, toff + 0.35))
# 뒤 배경판(하늘) — 사진 하늘을 그대로 (먼 평면, 카메라가 움직여도 시차 작음)
box('backdrop', -400 if SHOT == 'build' else -1500, 400 if SHOT == 'build' else 1500, 120, 121, 0, 260 if SHOT != 'night' else 420, PH, 'rise', 0, 0.01)   # R149 night: 떠오르는 카메라가 판 위를 넘겨보지 않게 높임   # R148 orbit: 비스듬한 시점에서 판 끝이 안 보이게 넓힘
# R148 드론 시점: 건물 뒤 땅은 정면 사진의 영사 그늘(관람석 픽셀이 늘어짐) → 건물 발자국 뒤에 무광 뒷마당 판을 깐다(정면 hold 카메라에선 건물에 가려 안 보임)
BACKLOT = None
if SHOT in ('orbit', 'night'):
    BACKLOT = box('backlot', -1000, 1000, 26, 1000, 0, 0.03, mat_flat('backlot', (0.60, 0.58, 0.50), 0.95), 'rise', 0, 0.01)
    if SHOT == 'night': BACKLOT.data.materials[0].node_tree.nodes['Principled BSDF'].name = 'lotbsdf'   # 건물 뒷선(y 24·30) 뒤 전부 — 정면 hold 에선 관람석·건물에 가림
g.data.materials.clear(); g.data.materials.append(PH)   # 운동장도 사진

# ---------------------------------------------------------------- 사진 영사 (고정 카메라 자리에서 사진을 모형 위로)
pc = bpy.data.cameras.new('proj'); pc.lens = 40; pc.sensor_width = 36; pc.sensor_fit = 'HORIZONTAL'
proj = bpy.data.objects.new('proj', pc); sc.collection.objects.link(proj)
proj.location = (0, -CAMD, EYE); proj.rotation_euler = (math.radians(90) + PITCH, 0, 0)      # 정면(+Y), 사진과 같은 올려봄
if 'photo' in M:
    for o in sc.objects:
        if o.type != 'MESH' or o.name == 'backlot' or o.name.startswith(('lamp', 'hill', 'bp_', 'edge_')): continue   # R150: 도면선·금선은 발광 그대로
        iswin = SHOT == 'night' and (o.name.startswith(('gwin', 'rwin')) or o.name in ('glasswall', 'entry_glass'))
        o.data.materials.clear(); o.data.materials.append(M['photo_ground'] if o.name == 'ground' else M['photo_sky'] if o.name == 'backdrop' else M['photo_win'] if iswin else M['photo'])      # 모형 전체에 사진 (교명 3D 글자만 남색)
        if 'proj' not in o.data.uv_layers: o.data.uv_layers.new(name='proj')
        if o.name != 'ground':
            dim = max(o.dimensions)
            sd = o.modifiers.new('sub', 'SUBSURF'); sd.subdivision_type = 'SIMPLE'; sd.levels = sd.render_levels = 5 if dim > 60 else 4 if dim > 15 else 2 if dim > 3 else 1
        md = o.modifiers.new('proj', 'UV_PROJECT'); md.uv_layer = 'proj'; md.aspect_x = 1536; md.aspect_y = 1024
        md.projectors[0].object = proj

# ---------------------------------------------------------------- 빛
sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 2.2; sun.angle = math.radians(25); sun.color = (1.0, 0.98, 0.95)
so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so)
so.rotation_euler = (math.radians(50), 0, math.radians(-35))

# ---------------------------------------------------------------- 카메라
cam = bpy.data.cameras.new('cam'); cam.lens = 40; cam.sensor_width = 36; cam.sensor_fit = 'HORIZONTAL'
# R145 카메라 역산: 디졸브 상대(school-photo.jpg 1920×1080)는 원본 3:2 를 위에서 66px(1536 기준) 잘라낸 16:9 라
# 가운데 자름(80px)보다 14px 위 → SIFT 로 잰 값 17.6px/1920 = 0.0092 만큼 화면을 내린다(shift_y, 화면 너비 비율).
cam.shift_y = arg('--shifty', 0.0092)
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
DROP_H = 2.2 if V2 else 9.0               # R150: 지붕·코핑은 2.2m 위에서 살짝 얹힘(9m 낙하 아님)
def _edge_for(o, z0, h):                  # R150: 벽 윗선을 따라 올라가는 금선(첫 프레임엔 안 보임)
    bpy.ops.mesh.primitive_cube_add(size=1); e = bpy.context.object; e.name = 'edge_' + o.name
    d = o.dimensions
    for v in e.data.vertices: v.co.x *= d.x + 0.16; v.co.y *= d.y + 0.16; v.co.z *= 0.12
    e.location = (o.location.x, o.location.y, z0); e.data.materials.append(M['glow']); e.scale = (0.001, 0.001, 0.001)
    return e
for o, kind, t0, t1 in (BUILD if SHOT == 'build' else []):   # orbit: 다 지어진 채(키 없음 = 최종 상태)
    if V2 and t1 > 0.02: t0, t1 = T_V2[0] + t0 * T_V2[1], T_V2[0] + t1 * T_V2[1]   # R150 시간축 재배치(즉시 조각은 그대로)
    z = o.location.z; x, y = o.location.x, o.location.y
    B = tuple(o.scale)                 # 기본 스케일(박공 처마 막대처럼 미리 늘려 둔 것) 보존
    span = max(1e-3, t1 - t0)
    if V2 and kind == 'rise' and o.dimensions.z > 3.0 and not o.name.startswith(('backdrop', 'entry_cut')): EDGES.append((_edge_for(o, z, o.dimensions.z), o, z, o.dimensions.z, t0, t1))
    for fr in range(1, NF + 1):
        sec = (fr - 1) / FPS
        u = clamp01((sec - t0) / span); e = ease(u)
        if V2: o.hide_render = sec < t0 - 1e-6; o.keyframe_insert('hide_render', frame=fr)   # R150: 시작 전엔 아예 안 그림(납작한 발자국 판이 보이던 것)
        if kind == 'rise':
            o.scale = (B[0], B[1], B[2] * max(0.001, e)); o.keyframe_insert('scale', frame=fr)
        elif kind == 'pop':
            sv = max(0.001, e * overshoot(u)); o.scale = (B[0] * sv, B[1] * sv, B[2] * sv); o.keyframe_insert('scale', frame=fr)
        elif kind == 'drop':
            sv = 1.0 if sec >= t0 else 0.001
            o.scale = (B[0] * sv, B[1] * sv, B[2] * sv); o.keyframe_insert('scale', frame=fr)
            o.location = (x, y, z + DROP_H * (1 - e) ** 2); o.keyframe_insert('location', frame=fr)
        elif kind == 'slidex':
            o.scale = (B[0] * max(0.001, e), B[1], B[2]); o.keyframe_insert('scale', frame=fr)
        if sec > t1 + 0.5: break        # 완료 후엔 마지막 값 유지 — 더 키 안 박음
# R150: 금선 — 벽 윗선 동행(rise 구간) → 끝나면 0.4s 사이 사라짐 · 도면선 — 그리기(길이 0→1) → 벽 올라온 뒤 걷힘(길이 1→0)
for e, o, z0, h, t0, t1 in EDGES:
    for fr in range(1, NF + 1):
        sec = (fr - 1) / FPS; u = clamp01((sec - t0) / max(1e-3, t1 - t0)); ev = ease(u)
        vis = 1.0 if t0 <= sec <= t1 + 0.05 else (1.0 - clamp01((sec - t1 - 0.05) / 0.4)) if sec > t1 else 0.0
        e.scale = (max(0.001, vis), max(0.001, vis), max(0.001, vis)); e.keyframe_insert('scale', frame=fr)
        e.location = (e.location.x, e.location.y, z0 + h * ev); e.keyframe_insert('location', frame=fr)
        if sec > t1 + 0.6: break
for o, d0, d1, f0, f1 in LINES:
    for fr in range(1, NF + 1):
        sec = (fr - 1) / FPS
        L_ = ease(clamp01((sec - d0) / (d1 - d0))) * (1.0 - ease(clamp01((sec - f0) / (f1 - f0))))
        o.scale = (max(0.001, L_), 1, 1); o.keyframe_insert('scale', frame=fr)
        if sec > f1 + 0.2: break
if V2:                                       # R150: 사진 재질의 발광 비율 — 짓는 동안 0.60 → HOLD-0.8 에 0.78(사진 그대로, hold 프레임 무변화)
    for nm in ('photo', 'photo_ground'):
        if nm in M:
            fac = M[nm].node_tree.nodes['daymix'].inputs['Fac']
            for fr in range(1, NF + 1):
                sec = (fr - 1) / FPS
                fac.default_value = 0.60 + 0.18 * ease(clamp01((sec - (HOLD - 2.0)) / 1.2)); fac.keyframe_insert('default_value', frame=fr)

# 카메라: 왼쪽 위에서 돌아 들어와 정면 사진 자리로 (프레임마다 직접 계산)
CAM_PATH = [(0.0, (-40, -55, 16), (-6, 6, 9)), (2.6, (-22, -66, 9), (-3, 2, 6)), (HOLD, (0, -CAMD, EYE), (0, 0, LOOKZ))]
CAM_V2 = [((-36, -64, 13.5), (-4, 6, 9)), ((-26, -69, 9.5), (-2.5, 3, 9.5)), ((-13, -69, 4.8), (-1, 1.5, 10.5)), ((-5, -67, 2.6), (-0.5, 0.5, 11.5)), ((0, -CAMD, EYE), (0, 0, LOOKZ))]   # R150: 경유점 5, 캣멀롬 한 번 ease — 꺾임 없이 사진 자리로
PHOTO_CAM = dict(loc=(0, -CAMD, EYE), look=(0, 0, LOOKZ))   # 세 틀이 공유하는 「사진 자리」(build·orbit 끝 · night 시작) — JSON 의 camera
if SHOT == 'night':   # R149: 사진 자리에 PHOTO_HOLD 초 고정 → 한 번 ease 로 뒤·위로 물러나며 떠오름(드론이 멀어지듯) → HOLD 부터 고정
    CAM_PATH = [(0.0, PHOTO_CAM['loc'], PHOTO_CAM['look']), (T_CAM[0], PHOTO_CAM['loc'], PHOTO_CAM['look']), (T_CAM[1], (-4, -104, 22), (1, 3, 9))]
# R148 orbit: 앞쪽 하늘 반 바퀴 — 왼쪽 높이(운동장 너머) → 정면 앞 멀리 → 오른쪽 살짝 지나 → 사진 자리로 가라앉음. 경유점을 캣멀롬 곡선으로 잇고
# 시간은 전체 한 번 ease(드론처럼 천천히 떠서 천천히 멈춤). 건물 뒤(y>24)로는 안 감 — 영사 사진의 뒷면은 없다.
ORBIT = [((-84, -66, 46), (-6, 8, 9)), ((-72, -88, 32), (-3, 5, 9)), ((-30, -108, 21), (0, 3, 8)), ((14, -96, 10), (1, 1, 7)), ((0, -CAMD, EYE), (0, 0, LOOKZ))]
def _catmull(pts, u):
    n = len(pts) - 1; u = clamp01(u) * n; i = min(int(u), n - 1); t = u - i
    p0, p1, p2, p3 = [Vector(pts[max(0, min(n, i + k))]) for k in (-1, 0, 1, 2)]
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
def cam_at(sec):
    if SHOT == 'orbit':
        u = ease(clamp01(sec / HOLD))
        if sec >= HOLD: return Vector(ORBIT[-1][0]), Vector(ORBIT[-1][1])
        return _catmull([p for p, _ in ORBIT], u), _catmull([l for _, l in ORBIT], u)
    if sec >= HOLD: return Vector(CAM_PATH[-1][1]), Vector(CAM_PATH[-1][2])
    if V2:
        u = ease(clamp01(sec / HOLD))
        return _catmull([Vector(p[0]) for p in CAM_V2], u), _catmull([Vector(p[1]) for p in CAM_V2], u)
    for (ta, pa, la), (tb, pb, lb) in zip(CAM_PATH, CAM_PATH[1:]):
        if ta <= sec <= tb:
            e = ease((sec - ta) / (tb - ta))
            return Vector(pa).lerp(Vector(pb), e), Vector(la).lerp(Vector(lb), e)
    return Vector(CAM_PATH[0][1]), Vector(CAM_PATH[0][2])
for fr in range(1, NF + 1):
    p, l = cam_at((fr - 1) / FPS)
    co.location = p; co.keyframe_insert('location', frame=fr)
    tgt.location = l; tgt.keyframe_insert('location', frame=fr)
for nt in REVEAL:                      # R148 배경판 드러내기: HOLD-1.2s → HOLD 에 0→1 (hold 프레임은 build 틀과 같은 사진 하늘) · R149 night: 사진 하늘 1→0 (해 지는 동안 월드 저녁 하늘로)
    rv = nt.nodes['reveal']
    for fr in range(1, NF + 1):
        sec = (fr - 1) / FPS
        v = ease(clamp01((sec - (HOLD - 1.2)) / 1.2)) if SHOT != 'night' else 1.0 - ease(clamp01((sec - T_DUSK[0]) / (T_DUSK[1] - T_DUSK[0])))
        rv.outputs[0].default_value = v; rv.outputs[0].keyframe_insert('default_value', frame=fr)
if SHOT == 'night':                    # R149: 해 지기 — 한 값(night 0→1)을 월드·해·사진 발광이 같이 탄다 / 불 켜기 — 창마다 제 시각에 0.5초 만에
    def night_at(sec): return ease(clamp01((sec - T_DUSK[0]) / (T_DUSK[1] - T_DUSK[0])))
    dayems = [m.node_tree.nodes['dayem'] for m in (M['photo'], M['photo_ground'], M['photo_sky'], M['photo_win'])]
    for fr in range(1, NF + 1):
        n = night_at((fr - 1) / FPS)
        NIGHT.outputs[0].default_value = n; NIGHT.outputs[0].keyframe_insert('default_value', frame=fr)
        sun.energy = 2.2 * (1 - n) ** 1.6 + 0.10 * n; sun.keyframe_insert('energy', frame=fr)
        sun.color = (1.0, 0.98 - 0.36 * n, 0.95 - 0.60 * n); sun.keyframe_insert('color', frame=fr)
        so.rotation_euler = (math.radians(50 + 34 * n), 0, math.radians(-35 - 30 * n)); so.keyframe_insert('rotation_euler', frame=fr)
        for em in dayems:
            em.inputs['Strength'].default_value = 1.0 * (1 - n) + 0.05 * n; em.inputs['Strength'].keyframe_insert('default_value', frame=fr)
        for sock, day in ((M['photo_ground'].node_tree.nodes['side'].inputs['Color'], (0.52, 0.50, 0.43)), (BACKLOT.data.materials[0].node_tree.nodes['lotbsdf'].inputs['Base Color'], (0.60, 0.58, 0.50))):
            sock.default_value = (*[d * (1 - n) + k * n for d, k in zip(day, (0.31, 0.27, 0.24))], 1); sock.keyframe_insert('default_value', frame=fr)   # 사진 밖 땅·뒷마당은 밤에 검게(밝은 모래가 보랏빛 판이 되던 것)
    import random; rnd = random.Random(20260911)   # 결정적 — 같은 순서로 구워짐
    wins = [o for o in sc.objects if o.type == 'MESH' and o.name.startswith(('gwin', 'rwin'))]
    for o in wins:
        if rnd.random() < 0.15: continue                       # 몇 창은 끝까지 어둡게(퇴근한 교실)
        LIT.append((o, 2.6 + rnd.random() * 3.0, 0.55 + rnd.random() * 0.45))   # 교실마다 밝기가 다르다(형광등·커튼)
    LIT += [(sc.objects['entry_glass'], 2.8, 0.9), (sc.objects['glasswall'], 3.3, 0.7)]
    for o, t_on, *peak in LIT:
        pk = peak[0] if peak else 1.0; o['lit'] = 0.0
        for fr in range(1, NF + 1):
            sec = (fr - 1) / FPS
            o['lit'] = pk * ease(clamp01((sec - t_on) / 0.5)); o.keyframe_insert('["lit"]', frame=fr)
            if sec > t_on + 1.0: break

# ---------------------------------------------------------------- 출력
meta = dict(name=NAME, width=W, height=H, fps=FPS, frames=int(SEC * FPS), hold_from=f(HOLD), sec=SEC, shot=SHOT,
            camera=dict(loc=PHOTO_CAM['loc'], look=PHOTO_CAM['look'], lens=cam.lens), photo_at=PHOTO_AT)
if SHOT == 'night': meta['photo_until'] = f(PHOTO_HOLD)   # 이 프레임까지 사진 자리 — 페이지가 실사→3D 디졸브를 이 앞에서 끝낸다
with open(os.path.join(OUT, NAME + '.json'), 'w', encoding='utf-8') as fh: json.dump(meta, fh, ensure_ascii=False, indent=1)

if STILL >= 0:
    sc.frame_set(f(STILL)); sc.render.filepath = os.path.join(OUT, f'still_{STILL:.1f}.png'); bpy.ops.render.render(write_still=True)
    print('still ->', sc.render.filepath); sys.exit(0)

for fr in range(FR_START, sc.frame_end + 1):
    sc.frame_set(fr); sc.render.filepath = os.path.join(OUT, f'{NAME}_{fr:04d}.png')
    bpy.ops.render.render(write_still=True); print('frame', fr, '/', sc.frame_end, flush=True)
sc.frame_set(sc.frame_end); sc.render.filepath = os.path.join(OUT, 'poster.png'); bpy.ops.render.render(write_still=True)
print('done')

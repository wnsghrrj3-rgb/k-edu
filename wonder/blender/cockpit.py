"""케이원더 · 장면 4 블랙홀 — 우주선 조종석(창틀과 계기판)을 Cycles 로 한 장 굽는다.
   blender -b --python cockpit.py -- <out_dir> [samples]
   눈 = (0,0,0), 앞 = +Y, 위 = +Z, 세로 화각 50°, 1920×1080, 창은 투명(알파 0).
   만드는 것: cockpit.png(RGBA) + cockpit.json(계기 화면 네 귀의 그림 좌표 0~1, 왼쪽 위가 0,0)
"""
import bpy, bmesh, sys, os, math, json, random
from mathutils import Vector, Matrix, Euler
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '.'; SAMPLES = int(argv[1]) if len(argv) > 1 else 96
os.makedirs(OUT, exist_ok=True); random.seed(4)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def mat(name, base=(.03, .03, .03), rough=.5, metal=0., emit=None, estr=0., coat=0.):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*base, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = estr
    if coat and 'Coat Weight' in b.inputs: b.inputs['Coat Weight'].default_value = coat
    return m
def scratched(m, scale=60., amt=.12):                     # 닦은 자국·잔흠: 거칠기를 흔든다
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    n = nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = scale; n.inputs['Detail'].default_value = 8
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 14, 1); tc = nt.nodes.new('ShaderNodeTexCoord')
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], n.inputs['Vector'])
    r = nt.nodes.new('ShaderNodeMapRange'); r.inputs['To Min'].default_value = b.inputs['Roughness'].default_value - amt; r.inputs['To Max'].default_value = b.inputs['Roughness'].default_value + amt
    nt.links.new(n.outputs['Fac'], r.inputs['Value']); nt.links.new(r.outputs['Result'], b.inputs['Roughness'])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .06; nt.links.new(n.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m
M_HULL  = scratched(mat('hull', (.035, .038, .045), .42, .9))
M_DASH  = scratched(mat('dash', (.022, .024, .028), .55, .3), 90, .1)
M_BEZEL = scratched(mat('bezel', (.16, .165, .17), .32, 1.), 140, .1)
M_RUB   = mat('rubber', (.008, .008, .009), .85)
M_GLASS = mat('glass', (.002, .003, .004), .06, 0., emit=(.05, .35, .45), estr=.03, coat=1.)
M_SLOT  = mat('slot', (.003, .003, .003), .7)
M_TEAL  = mat('led_teal', (0, 0, 0), .4, emit=(.15, .85, 1.), estr=9.)
M_AMBER = mat('led_amber', (0, 0, 0), .4, emit=(1., .55, .12), estr=7.)
M_RED   = mat('led_red', (0, 0, 0), .4, emit=(1., .1, .06), estr=6.)
M_WHITE = mat('led_white', (0, 0, 0), .4, emit=(.9, .95, 1.), estr=5.)
M_KNOB  = scratched(mat('knob', (.05, .05, .055), .28, 1.), 200, .08)

def obj(name, bm, m, smooth=False, bevel=0.):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(m)
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    if smooth:
        for f in me.polygons: f.use_smooth = True
    if bevel:
        md = o.modifiers.new('bv', 'BEVEL'); md.width = bevel; md.segments = 3; md.limit_method = 'ANGLE'; md.angle_limit = math.radians(40)
    return o
def box(x0, x1, y0, y1, z0, z1):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation(((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)) @ Matrix.Diagonal((x1 - x0, y1 - y0, z1 - z0, 1))); return bm
def cyl(r, d, loc, seg=48, r2=None):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=d, matrix=Matrix.Translation(loc)); return bm

# ── 창틀: 두꺼운 벽에서 둥근 모서리 창을 파낸다
WY = 1.62; WL, WR, WB, WT, WRAD = -1.33, 1.33, -.36, .70, .24
hull = obj('hull', box(-3.2, 3.2, WY, WY + .11, -2.2, 2.2), M_HULL)
cut = obj('cut', box(WL, WR, WY - .3, WY + .7, WB, WT), M_HULL); bv = cut.modifiers.new('r', 'BEVEL'); bv.width = WRAD; bv.segments = 48; bv.limit_method = 'NONE'
# 세로 모서리(Y 방향)만 둥글게: 가중치 대신, 앞뒤로 긴 상자를 써서 앞뒤 면의 둥글림은 벽 밖에 있게 한다
bo = hull.modifiers.new('hole', 'BOOLEAN'); bo.object = cut; bo.operation = 'DIFFERENCE'; bo.solver = 'EXACT'
hb = hull.modifiers.new('bv', 'BEVEL'); hb.width = .022; hb.segments = 4; hb.limit_method = 'ANGLE'; hb.angle_limit = math.radians(50)
cut.hide_render = True; cut.display_type = 'WIRE'
# 창 안쪽 고무 테와 불빛 띠(창턱 아래)
gasket = obj('gasket', box(-3.0, 3.0, WY - .012, WY, -2.0, 2.0), M_RUB)
cut2 = obj('cut2', box(WL + .035, WR - .035, WY - .4, WY + .7, WB + .035, WT - .035), M_RUB); b2 = cut2.modifiers.new('r', 'BEVEL'); b2.width = WRAD - .03; b2.segments = 48; b2.limit_method = 'NONE'
g = gasket.modifiers.new('hole', 'BOOLEAN'); g.object = cut2; g.operation = 'DIFFERENCE'; g.solver = 'EXACT'; cut2.hide_render = True
# 벽의 볼트와 이음매
bm = bmesh.new()
for x in [i * .3 - 1.35 for i in range(10)]:
    for z in (WB - .03,):
        bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=.011, radius2=.009, depth=.008, matrix=Matrix.Translation((x, WY - .004, z)) @ Euler((math.radians(90), 0, 0)).to_matrix().to_4x4())
for z in [i * .2 - .3 for i in range(6)]:
    for x in (WL - .05, WR + .05):
        bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=.011, radius2=.009, depth=.008, matrix=Matrix.Translation((x, WY - .004, z)) @ Euler((math.radians(90), 0, 0)).to_matrix().to_4x4())
obj('bolts', bm, M_BEZEL, True)

# ── 계기판: 평평하게 만든 뒤 기울여 놓는다 (u = 가로, v = 눈 쪽 0 → 창 쪽 .86)
TILT = math.atan2(.23, .38); NEAR = Vector((0, 1.17, -.60))
XF = Matrix.Translation(NEAR) @ Euler((TILT, 0, 0)).to_matrix().to_4x4()
parts = []
def put(o): o.matrix_world = XF @ o.matrix_world; parts.append(o); return o
put(obj('dash', box(-1.9, 1.9, -.3, .47, -.14, 0), M_DASH, bevel=.012))
put(obj('dash_lip', box(-1.9, 1.9, .435, .50, 0, .03), M_HULL, bevel=.01))
put(obj('led_sill', box(-1.16, 1.16, .428, .433, .004, .011), M_TEAL))
SCREENS = {}
V0, V1 = .105, .385
def screen(name, x0, x1, v0, v1):
    put(obj(name + '_bezel', box(x0 - .018, x1 + .018, v0 - .018, v1 + .018, 0, .014), M_BEZEL, bevel=.005))
    put(obj(name + '_glass', box(x0, x1, v0, v1, .010, .017), M_GLASS, bevel=.002))
    SCREENS[name] = [XF @ Vector(p) for p in ((x0, v1, .017), (x1, v1, .017), (x1, v0, .017), (x0, v0, .017))]     # 왼쪽 위·오른쪽 위·오른쪽 아래·왼쪽 아래
screen('left', -1.0, -.215, V0, V1); screen('right', .215, .80, V0, V1)
# 가운데 둥근 화면(위에서 본 판)
R = .14; CV = (V0 + V1) / 2
put(obj('scope_bezel', cyl(R + .02, .018, (0, CV, .009), 72), M_BEZEL, True, .004)); put(obj('scope_glass', cyl(R, .008, (0, CV, .019), 72), M_GLASS, True))
SCREENS['scope'] = [XF @ Vector(p) for p in ((-R, CV + R, .023), (R, CV + R, .023), (R, CV - R, .023), (-R, CV - R, .023))]
# 거리 레버 홈(손잡이는 화면에서 그린다)과 눈금
put(obj('slot', box(.885, .915, V0, V1, .002, .009), M_SLOT)); put(obj('slot_rim', box(.862, .938, V0 - .02, V1 + .02, 0, .007), M_BEZEL, bevel=.004))
SCREENS['lever'] = [XF @ Vector(p) for p in ((.85, V1 + .02, .012), (.95, V1 + .02, .012), (.95, V0 - .02, .012), (.85, V0 - .02, .012))]
bm = bmesh.new()
for i in range(9): bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation((.965, V0 + i * (V1 - V0) / 8, .002)) @ Matrix.Diagonal((.026 if i % 4 == 0 else .014, .003, .003, 1)))
put(obj('ticks', bm, M_WHITE))
# 단추 줄·돌림 손잡이·작은 등
bm_btn = bmesh.new(); leds = {M_TEAL: bmesh.new(), M_AMBER: bmesh.new(), M_RED: bmesh.new(), M_WHITE: bmesh.new()}
for i in range(30):
    x = -1.22 + i * .084
    bmesh.ops.create_cube(bm_btn, size=1, matrix=Matrix.Translation((x, .052, .007)) @ Matrix.Diagonal((.05, .03, .014, 1)))
    m = random.choice([M_TEAL, M_TEAL, M_AMBER, M_WHITE, M_RED]) if random.random() < .75 else None
    if m: bmesh.ops.create_cube(leds[m], size=1, matrix=Matrix.Translation((x, .063, .0145)) @ Matrix.Diagonal((.028, .004, .002, 1)))
put(obj('buttons', bm_btn, M_KNOB, bevel=.004))
for m, b in leds.items(): put(obj('leds_' + m.name, b, m))
for x in (-1.2, -1.1, 1.06, 1.16, 1.26):
    put(obj('knob', cyl(.028, .028, (x, .32, .014), 28, .024), M_KNOB, True, .003)); put(obj('knob_led', box(x - .003, x + .003, .32, .345, .0285, .03), M_WHITE))
    put(obj('gauge_b', cyl(.034, .012, (x, .18, .006), 36), M_BEZEL, True, .003)); put(obj('gauge_g', cyl(.028, .004, (x, .18, .0135), 36), M_GLASS, True))

# ── 빛: 창밖의 원반 빛(따뜻함) + 안쪽 흐린 푸른 빛
def area(name, loc, rot, size, color, power):
    l = bpy.data.lights.new(name, 'AREA'); l.size = size[0]; l.shape = 'RECTANGLE'; l.size_y = size[1]; l.color = color; l.energy = power
    o = bpy.data.objects.new(name, l); o.location = loc; o.rotation_euler = rot; sc.collection.objects.link(o)
    if name != 'disk_glow': o.visible_glossy = False            # 계기 유리에 네모난 등이 비치지 않게
area('disk_glow', (.2, 5.5, .35), (math.radians(-93), 0, 0), (3.2, .35), (1., .62, .32), 40)
area('fill', (0, -1.2, 1.6), (math.radians(38), 0, 0), (4.0, 2.5), (.5, .62, 1.), 60)
area('under', (0, .6, -.2), (math.radians(60), 0, 0), (2.4, .4), (.3, .8, 1.), 12)
w = bpy.data.worlds.new('w'); w.use_nodes = True; sc.world = w; w.node_tree.nodes['Background'].inputs[0].default_value = (.0015, .002, .004, 1)

# ── 카메라와 굽기
cam = bpy.data.cameras.new('cam'); cam.sensor_fit = 'VERTICAL'; cam.angle_y = math.radians(50); cam.clip_start = .05
co = bpy.data.objects.new('cam', cam); co.rotation_euler = (math.radians(90), 0, 0); sc.collection.objects.link(co); sc.camera = co
sc.render.engine = 'CYCLES'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True; sc.cycles.use_adaptive_sampling = True
sc.render.film_transparent = True; sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
try: sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'
except Exception as e: print('view', e)
sc.view_settings.exposure = .3
bpy.context.view_layer.update()
quads = {k: [[round(c.x, 5), round(1 - c.y, 5)] for c in (world_to_camera_view(sc, co, p) for p in v)] for k, v in SCREENS.items()}
json.dump({'size': [1920, 1080], 'fovY': 50, 'screens': quads}, open(os.path.join(OUT, 'cockpit.json'), 'w'), indent=1)
print('QUADS', json.dumps(quads))
sc.render.filepath = os.path.join(OUT, 'cockpit.png'); bpy.ops.render.render(write_still=True); print('RENDER done')

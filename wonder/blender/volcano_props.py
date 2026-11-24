"""케이원더 · 장면 8 화산이 만든 땅 — 크기를 견줄 물건: 등대와 고깃배 (bpy, 화면 없이 실행)
   blender -b --python volcano_props.py -- <out_dir>          (bpy 모듈만 있으면: python volcano_props.py -- <out_dir>)
   블렌더 좌표: X 오른쪽 · Y 멀어지는 쪽 · Z 위.  1 = 1m(실제 치수).  물건의 밑 가운데가 원점.
   만드는 것: props.glb — 'lighthouse'(높이 약 27m: 바위 받침·흰 탑·난간 두른 등롱·붉은 지붕·관리동)
                         'boat'(길이 약 19m 고깃배, 뱃머리가 +X: 선체·갑판·조타실·돛대·집어등)
   장면에서는 멀리서도 보이게 1.7배로 세운다(scene.js PROP_SCALE).
"""
import bpy, bmesh, sys, os, math
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '.'
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def mat(name, base, rough=.7, metal=0, emit=None, estr=0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*base, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = estr
    return m
M_WHITE = mat('white_paint', (.82, .80, .76), .62)
M_RED   = mat('red_roof', (.55, .07, .05), .5)
M_ROCK  = mat('rock', (.05, .048, .046), .95)
M_IRON  = mat('iron', (.03, .032, .035), .5, .7)
M_GLASS = mat('lantern', (.1, .09, .06), .2, emit=(1, .82, .5), estr=9)
M_WIN   = mat('window', (.02, .02, .02), .3, emit=(1, .7, .35), estr=3)
M_HULL  = mat('hull_blue', (.03, .16, .22), .55)
M_KEEL  = mat('hull_red', (.32, .05, .04), .7)
M_DECK  = mat('deck', (.22, .17, .11), .85)
M_LAMP  = mat('boat_lamp', (.1, .1, .1), .3, emit=(1, .9, .7), estr=12)

def ring(bm, r, z, n=24, cx=0, cy=0, sx=1, sy=1):
    return [bm.verts.new((cx + math.cos(i / n * math.tau) * r * sx, cy + math.sin(i / n * math.tau) * r * sy, z)) for i in range(n)]
def skin(bm, a, b, mi, cap=None):
    n = len(a)
    for i in range(n):
        f = bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i])); f.material_index = mi
def cap(bm, r, mi, flip=False):
    f = bm.faces.new(r[::-1] if flip else r); f.material_index = mi
def lathe(bm, prof, mi, n=24, cx=0, cy=0, close_top=True, close_bottom=True):
    """prof = [(r, z), …] 아래에서 위로"""
    rings = [ring(bm, r, z, n, cx, cy) for r, z in prof]
    for a, b in zip(rings, rings[1:]): skin(bm, a, b, mi)
    if close_bottom: cap(bm, rings[0], mi, True)
    if close_top: cap(bm, rings[-1], mi)
def box(bm, x0, x1, y0, y1, z0, z1, mi):
    vs = [bm.verts.new(p) for p in ((x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1))]
    for f in ((0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7),(3,2,1,0)):
        fc = bm.faces.new([vs[i] for i in f]); fc.material_index = mi
def finish(name, bm, mats, bevel=.06):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for m in mats: me.materials.append(m)
    ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob)
    if bevel:
        md = ob.modifiers.new('bevel', 'BEVEL'); md.width = bevel; md.segments = 2; md.limit_method = 'ANGLE'; md.angle_limit = math.radians(40)
    for p in me.polygons: p.use_smooth = True
    return ob

# ───────────── 등대 ─────────────
def lighthouse():
    mats = [M_WHITE, M_RED, M_ROCK, M_IRON, M_GLASS, M_WIN]
    bm = bmesh.new()
    # 바위 받침(울퉁불퉁)
    import random; random.seed(8)
    rings = []
    for r, z in ((7.5, -3.0), (7.0, -.6), (5.6, .9), (4.4, 1.3)):
        rings.append([bm.verts.new((math.cos(i / 14 * math.tau) * r * random.uniform(.82, 1.12), math.sin(i / 14 * math.tau) * r * random.uniform(.82, 1.12), z + random.uniform(-.25, .25))) for i in range(14)])
    for a, b in zip(rings, rings[1:]): skin(bm, a, b, 2)
    cap(bm, rings[-1], 2)
    # 탑: 아래 3.1m → 위 2.2m, 높이 20m. 밑단과 허리띠
    lathe(bm, [(3.5, 1.2), (3.5, 2.0), (3.1, 2.2), (2.75, 9.0), (2.45, 15.5), (2.2, 21.0)], 0, 24)
    lathe(bm, [(2.86, 8.6), (2.86, 9.4)], 1, 24, close_top=True, close_bottom=True)        # 붉은 띠
    # 발코니와 난간
    lathe(bm, [(2.3, 20.6), (3.3, 21.0), (3.3, 21.25), (2.2, 21.25)], 3, 24)
    for i in range(16):
        a = i / 16 * math.tau; x, y = math.cos(a) * 3.2, math.sin(a) * 3.2
        box(bm, x - .05, x + .05, y - .05, y + .05, 21.25, 22.35, 3)
    lathe(bm, [(3.26, 22.3), (3.26, 22.4), (3.14, 22.4), (3.14, 22.3)], 3, 24, close_top=False, close_bottom=False)
    # 등롱(빛나는 유리)과 창살, 붉은 지붕, 피뢰침
    lathe(bm, [(1.75, 21.25), (1.75, 24.3)], 4, 16, close_bottom=False)
    for i in range(8):
        a = i / 8 * math.tau; x, y = math.cos(a) * 1.78, math.sin(a) * 1.78
        box(bm, x - .06, x + .06, y - .06, y + .06, 21.25, 24.3, 3)
    lathe(bm, [(2.05, 24.3), (2.05, 24.5), (1.5, 25.2), (.7, 25.9), (.22, 26.2), (.22, 26.5)], 1, 16)
    box(bm, -.04, .04, -.04, .04, 26.5, 27.6, 3)
    # 탑의 창과 문
    for z in (6.0, 12.0, 17.5):
        box(bm, 2.6 - (z - 6) * .035, 3.05 - (z - 6) * .045, -.28, .28, z, z + 1.1, 5)
    box(bm, 3.0, 3.6, -.55, .55, 2.0, 4.1, 3)
    # 관리동(붉은 지붕)
    box(bm, -9.5, -4.2, -3.0, 3.0, .9, 4.4, 0)
    v = [bm.verts.new(p) for p in ((-9.9, -3.4, 4.4), (-3.8, -3.4, 4.4), (-3.8, 3.4, 4.4), (-9.9, 3.4, 4.4), (-9.9, 0, 6.2), (-3.8, 0, 6.2))]
    for f in ((0, 1, 5, 4), (2, 3, 4, 5), (1, 2, 5), (3, 0, 4), (3, 2, 1, 0)):
        fc = bm.faces.new([v[i] for i in f]); fc.material_index = 1
    for y in (-1.6, 1.6): box(bm, -6.9, -6.0, y - .45, y + .45, 2.2, 3.4, 5)
    for fc in list(bm.faces):                                   # 관리동 창은 벽 밖으로 살짝
        pass
    return finish('lighthouse', bm, mats, .07)

# ───────────── 고깃배 ─────────────
def boat():
    mats = [M_HULL, M_KEEL, M_DECK, M_WHITE, M_IRON, M_LAMP, M_WIN]
    bm = bmesh.new()
    L, B, D = 19.0, 5.0, 2.6                                    # 길이·너비·깊이(m)
    secs = []                                                   # 단면: 뱃꼬리(-L/2) → 뱃머리(+L/2)
    NS = 11
    for k in range(NS):
        t = k / (NS - 1); x = -L / 2 + L * t
        half = B / 2 * (math.sin(min(1, t * 1.35 + .25) * math.pi / 2) ** .7) * (1 - max(0, t - .55) / .45) ** .62 if t < 1 else 0.02
        half = max(half, .04)
        sheer = 1.2 + .25 * (1 - t) ** 2 + 1.5 * t ** 2.4      # 뱃전 높이(뱃머리가 들린다)
        keel = -1.0 + .35 * t ** 3 + .12 * (1 - t) ** 3
        pts = [(x, 0, keel), (x, half * .55, keel + .35), (x, half * .93, -.1), (x, half, sheer * .55), (x, half * .97, sheer)]
        secs.append(pts)
    vs = [[bm.verts.new(p) for p in s] + [bm.verts.new((p[0], -p[1], p[2])) for p in s[-1:0:-1]] for s in secs]   # 오른쪽 5 + 왼쪽 4(용골 빼고)
    n = len(vs[0])
    for a, b in zip(vs, vs[1:]):
        for i in range(n - 1):
            f = bm.faces.new((a[i], a[i + 1], b[i + 1], b[i])); f.material_index = 1 if i in (0, 1, n - 3, n - 2) and False else 0
            lo = min(a[i].co.z, a[i + 1].co.z, b[i].co.z, b[i + 1].co.z); f.material_index = 1 if max(a[i].co.z, a[i + 1].co.z) < -.05 else 0
    cap(bm, vs[0], 0, True)
    # 갑판(뱃전 조금 아래)
    deck = []
    for s in secs:
        x, y, z = s[4]; deck.append((bm.verts.new((x, y * .96, z - .35)), bm.verts.new((x, -y * .96, z - .35))))
    for a, b in zip(deck, deck[1:]):
        f = bm.faces.new((a[0], b[0], b[1], a[1])); f.material_index = 2
    # 조타실(뱃꼬리 쪽)과 지붕, 창
    box(bm, -6.2, -2.4, -1.5, 1.5, 1.0, 3.6, 3)
    box(bm, -6.5, -2.0, -1.75, 1.75, 3.6, 3.78, 4)
    box(bm, -2.42, -2.36, -1.2, 1.2, 2.5, 3.3, 6)
    for y in (-1.52, 1.52): box(bm, -5.4, -3.2, y - .02, y + .02, 2.5, 3.3, 6)
    # 돛대·가로대·집어등 줄
    box(bm, -1.9, -1.7, -.1, .1, 3.6, 8.2, 4)
    box(bm, 3.9, 4.06, -.08, .08, 1.6, 6.0, 4)
    box(bm, -1.8, 4.0, -.04, .04, 5.5, 5.6, 4)
    for i in range(7):
        x = -1.2 + i * .78; box(bm, x - .16, x + .16, -.16, .16, 5.12, 5.48, 5)
    box(bm, -1.95, -1.65, -.15, .15, 8.2, 8.5, 5)
    # 뱃머리 난간과 어구 상자
    box(bm, 5.4, 7.6, -.9, .9, 1.9, 2.5, 4)
    box(bm, .2, 2.6, -1.2, 1.2, 1.0, 1.7, 2)
    return finish('boat', bm, mats, .05)

lh = lighthouse(); bt = boat()
bt.location = (40, 0, 0)                                         # 파일 안에서 겹치지 않게(장면에서 원점으로 옮긴다)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'props.glb'), export_format='GLB', export_yup=True, export_apply=True, export_extras=False, export_cameras=False, export_lights=False)
print('GLB', os.path.getsize(os.path.join(OUT, 'props.glb')) // 1024, 'KB', '등대', tuple(round(v, 1) for v in lh.dimensions), '배', tuple(round(v, 1) for v in bt.dimensions))

# 기준 그림 한 장(render 를 주면): 모양 확인용
if len(argv) > 1 and argv[1] == 'render':
    scene.render.engine = 'CYCLES'; scene.cycles.samples = 24; scene.render.resolution_x = 1100; scene.render.resolution_y = 620
    w = bpy.data.worlds.new('w'); scene.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.5, .42, .45, 1); w.node_tree.nodes['Background'].inputs[1].default_value = .9
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 4; sun.data.color = (1, .7, .45); sun.rotation_euler = (math.radians(68), 0, math.radians(120)); scene.collection.objects.link(sun)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); scene.collection.objects.link(cam); scene.camera = cam
    cam.location = (22, -92, 20); cam.data.lens = 50
    d = Vector((21, 0, 12)) - cam.location; cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = os.path.join(OUT, 'ref_volcano_props.png'); bpy.ops.render.render(write_still=True)

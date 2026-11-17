"""케이원더 · 장면 1 불꽃놀이 공장 — 밤 강변 (bpy, 화면 없이 실행)
   blender -b --python riverside.py -- <out_dir> [render]
   블렌더 좌표: X 오른쪽 · Y 멀어지는 쪽 · Z 위.  1 = 1m.  보는 자리 = (0, 0, 1.6)
   만드는 것: riverside.glb (도시·다리·둑·산·바지선·난간·가로등) + 기준 그림(render 를 주면)
"""
import bpy, bmesh, sys, os, math, random
import numpy as np
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '.'
DO_RENDER = len(argv) > 1 and argv[1] == 'render'
os.makedirs(OUT, exist_ok=True)
random.seed(20261117); np.random.seed(20261117)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ───────────── 창문 불빛 그림(1024, 칸 16px) ─────────────
CELL, N = 16, 64
def window_atlas():
    img = np.zeros((N * CELL, N * CELL, 4), np.float32); img[..., 3] = 1
    warm = np.array([1.0, .78, .46]); cool = np.array([.72, .86, 1.0]); tv = np.array([.45, .6, 1.0])
    for r in range(N):
        floor_on = random.random() < .05            # 층 전체가 켜진 사무실
        floor_off = random.random() < .14
        for c in range(N):
            p = .27
            if floor_on: p = .9
            if floor_off: p = .03
            if random.random() > p: continue
            col = warm if random.random() < .6 else cool
            if random.random() < .05: col = tv
            b = random.uniform(.18, 1.0) ** 2.2                     # 대부분 어둑하고 몇 개만 환하다
            y0, x0 = r * CELL + 4, c * CELL + 4
            h, w = 8, random.choice((7, 7, 8, 5))
            img[y0:y0 + h, x0:x0 + w, :3] = col * b
            img[y0:y0 + 2, x0:x0 + w, :3] *= random.uniform(.45, 1.0)   # 창 안의 얼룩(커튼·가구)
            if random.random() < .35: img[y0:y0 + h, x0:x0 + 3, :3] *= .35
            if random.random() < .12: img[y0 + 3:y0 + h, x0:x0 + w, :3] *= .2
    im = bpy.data.images.new('windows', N * CELL, N * CELL, alpha=False)
    im.pixels.foreach_set(img.ravel()); im.filepath_raw = os.path.join(OUT, 'windows.png'); im.file_format = 'PNG'; im.save()
    im.pack()
    return im
WIN = window_atlas()

# ───────────── 재질 ─────────────
def mat(name, base=(.02, .02, .02), rough=.7, metal=0, emit=None, estr=0, emit_img=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*base, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = estr
    if emit_img:
        t = m.node_tree.nodes.new('ShaderNodeTexImage'); t.image = emit_img; t.interpolation = 'Linear'
        m.node_tree.links.new(t.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = estr
    return m
M_BLD   = mat('city_windows', (.012, .014, .02), .55, 0, emit_img=WIN, estr=2.2)
M_DARK  = mat('dark', (.008, .009, .012), .9)
M_HILL  = mat('hill', (.004, .006, .008), 1)
M_STEEL = mat('steel', (.03, .033, .04), .45, .8)
M_CONC  = mat('concrete', (.09, .09, .085), .85)
M_RAIL  = mat('rail_metal', (.05, .05, .055), .35, 1)
M_WARM  = mat('light_warm', (0, 0, 0), .5, emit=(1, .72, .38), estr=14)
M_COOL  = mat('light_cool', (0, 0, 0), .5, emit=(.55, .78, 1.0), estr=10)
M_RED   = mat('light_red', (0, 0, 0), .5, emit=(1, .08, .05), estr=10)
M_SIGN  = [mat('sign_' + n, (0, 0, 0), .5, emit=c, estr=6) for n, c in
           (('pink', (1, .2, .55)), ('cyan', (.1, .9, 1)), ('green', (.2, 1, .45)), ('amber', (1, .6, .1)))]
M_BARGE = mat('barge', (.03, .028, .025), .8)
M_TUBE  = mat('tube', (.06, .06, .065), .5, .6)
M_LAMPH = mat('lamp_glass', (0, 0, 0), .3, emit=(1, .8, .5), estr=22)

def link(ob):
    scene.collection.objects.link(ob); return ob

def box(bm, x0, x1, y0, y1, z0, z1, uvfn=None, uvl=None):
    """상자 하나. uvfn(면 법선, 꼭짓점) → (u, v)"""
    vs = [bm.verts.new(p) for p in ((x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1))]
    faces = [(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7),(3,2,1,0)]
    out = []
    for f in faces:
        fc = bm.faces.new([vs[i] for i in f]); out.append(fc)
    if uvfn and uvl:
        for fc in out:
            fc.normal_update()
            for lp in fc.loops: lp[uvl].uv = uvfn(fc.normal, lp.vert.co)
    return out

# ───────────── 도시 ─────────────
def city():
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new('UVMap')
    extra = []  # (종류, 위치, 크기)
    rows = [(705, 28, 95, 1.0), (765, 60, 175, .78), (845, 110, 310, .42)]
    for (yy, hmin, hmax, dens) in rows:
        x = -1250
        while x < 1250:
            w = random.uniform(22, 58); d = random.uniform(22, 46)
            if random.random() < dens:
                # 가운데로 갈수록 높게(스카이라인의 봉우리)
                peak = math.exp(-((x + w / 2 - 120) / 520) ** 2)
                h = random.uniform(hmin, hmin + (hmax - hmin) * (.25 + .75 * peak)) * random.choice((1, 1, 1, .7, 1.25))
                u0 = random.randint(0, N - 1); v0 = random.randint(0, N - 1)
                def uvfn(n, co, x=x, w=w, d=d, yy=yy, u0=u0, v0=v0):
                    if abs(n.z) > .5: return (.0005, .0005)          # 지붕·바닥 = 검은 틈
                    hcoord = (co.x - x) if abs(n.y) > .5 else (co.y - yy)
                    return ((u0 + hcoord / 3.2) / N, (v0 + co.z / 3.4) / N)
                box(bm, x, x + w, yy, yy + d, 0, h, uvfn, uvl)
                # 단 지은 윗부분
                if h > 110 and random.random() < .6:
                    s = random.uniform(.5, .72); hh = h * random.uniform(.12, .3)
                    box(bm, x + w * (1 - s) / 2, x + w * (1 + s) / 2, yy + d * (1 - s) / 2, yy + d * (1 + s) / 2, h, h + hh, uvfn, uvl); h += hh
                if h > 90: extra.append(('beacon', (x + w / 2, yy + d / 2, h + 1.5)))
                if h > 200: extra.append(('spire', (x + w / 2, yy + d / 2, h)))
                if h < 80 and random.random() < .22: extra.append(('sign', (x + w / 2, yy - .4, h * random.uniform(.55, .9)), w * random.uniform(.4, .8)))
                if 120 < h and random.random() < .25: extra.append(('crown', (x, x + w, yy, yy + d, h)))
            x += w + random.uniform(2, 16)
    me = bpy.data.meshes.new('city'); bm.to_mesh(me); bm.free(); me.materials.append(M_BLD)
    link(bpy.data.objects.new('city', me))
    # 지붕 등·첨탑·간판
    bmr = bmesh.new(); bmd = bmesh.new(); bmc = bmesh.new(); signs = [bmesh.new() for _ in M_SIGN]
    for e in extra:
        if e[0] == 'beacon':
            x, y, z = e[1]; box(bmr, x - 1.1, x + 1.1, y - 1.1, y + 1.1, z - 1.1, z + 1.1)
        elif e[0] == 'spire':
            x, y, z = e[1]; hh = random.uniform(30, 60)
            box(bmd, x - 1.2, x + 1.2, y - 1.2, y + 1.2, z, z + hh); box(bmr, x - 1.3, x + 1.3, y - 1.3, y + 1.3, z + hh, z + hh + 2.6)
        elif e[0] == 'sign':
            (x, y, z), w = e[1], e[2]; box(random.choice(signs), x - w / 2, x + w / 2, y - .3, y, z, z + random.uniform(3, 7))
        elif e[0] == 'crown':
            x0, x1, y0, y1, h = e[1]; box(bmc, x0 - .3, x1 + .3, y0 - .3, y0, h - 1.6, h - .2)
    for nm, b, m in [('city_beacons', bmr, M_RED), ('city_spires', bmd, M_DARK), ('city_crowns', bmc, M_COOL)] + [('city_sign_%d' % i, s, M_SIGN[i]) for i, s in enumerate(signs)]:
        me = bpy.data.meshes.new(nm); b.to_mesh(me); b.free(); me.materials.append(m); link(bpy.data.objects.new(nm, me))
city()

# ───────────── 건너편 둑과 산책로 등 ─────────────
def far_bank():
    bm = bmesh.new(); box(bm, -1400, 1400, 640, 700, -1, 7)
    me = bpy.data.meshes.new('far_bank'); bm.to_mesh(me); bm.free(); me.materials.append(M_DARK); link(bpy.data.objects.new('far_bank', me))
    bl = bmesh.new()
    x = -1380
    while x < 1380:
        box(bl, x - .45, x + .45, 641, 641.9, 11.4, 12.3); x += random.uniform(17, 21)
    me = bpy.data.meshes.new('far_bank_lights'); bl.to_mesh(me); bl.free(); me.materials.append(M_WARM); link(bpy.data.objects.new('far_bank_lights', me))
far_bank()

# ───────────── 산 ─────────────
def hills():
    bm = bmesh.new(); n = 160; prev = None
    for i in range(n + 1):
        x = -2600 + 5200 * i / n
        h = 120 + 90 * math.sin(i * .11 + 1) + 60 * math.sin(i * .29) + 30 * math.sin(i * .73 + 2) + random.uniform(-8, 8)
        a = bm.verts.new((x, 1700, -5)); b = bm.verts.new((x, 1700, max(40, h)))
        if prev: bm.faces.new((prev[0], a, b, prev[1]))
        prev = (a, b)
    me = bpy.data.meshes.new('hills'); bm.to_mesh(me); bm.free(); me.materials.append(M_HILL); link(bpy.data.objects.new('hills', me))
hills()

# ───────────── 다리(아치) ─────────────
def tube_along(bm, pts, r, seg=6):
    rings = []
    for i, p in enumerate(pts):
        p = Vector(p); t = (Vector(pts[min(i + 1, len(pts) - 1)]) - Vector(pts[max(i - 1, 0)])).normalized()
        a = t.cross(Vector((0, 1, 0))); a = a.normalized() if a.length > 1e-4 else Vector((1, 0, 0)); b = t.cross(a).normalized()
        rings.append([bm.verts.new(p + (a * math.cos(k * 2 * math.pi / seg) + b * math.sin(k * 2 * math.pi / seg)) * r) for k in range(seg)])
    for i in range(len(rings) - 1):
        for k in range(seg):
            bm.faces.new((rings[i][k], rings[i][(k + 1) % seg], rings[i + 1][(k + 1) % seg], rings[i + 1][k]))
def bridge():
    Y, DECK = 560, 24
    bm = bmesh.new(); bl = bmesh.new(); ba = bmesh.new(); bh = bmesh.new()
    box(bm, -1500, 1500, Y - 9, Y + 9, DECK - 2.2, DECK)                       # 상판
    box(bm, -1500, 1500, Y - 9.3, Y - 8.9, DECK, DECK + 1.1); box(bm, -1500, 1500, Y + 8.9, Y + 9.3, DECK, DECK + 1.1)  # 난간
    for px in range(-1440, 1441, 160):                                          # 다릿발
        box(bm, px - 5, px + 5, Y - 7, Y + 7, -3, DECK - 2.2); box(bm, px - 7, px + 7, Y - 9, Y + 9, -3, 2.5)
    for cx in (-320, 0, 320):                                                   # 아치 세 개
        span, rise = 300, (62 if cx == 0 else 46)
        for side in (-8.2, 8.2):
            pts = [(cx - span / 2 + span * i / 28, Y + side, DECK + rise * (1 - (2 * i / 28 - 1) ** 2)) for i in range(29)]
            tube_along(bm, pts, 1.5)
            tube_along(ba, [(p[0], p[1], p[2] + 1.75) for p in pts], .32, 4)   # 아치 위 불빛 띠
            for i in range(2, 27, 2):                                           # 매단 줄
                p = pts[i]; box(bh, p[0] - .12, p[0] + .12, p[1] - .12, p[1] + .12, DECK, p[2])
    x = -1490
    while x < 1490:                                                             # 가로등
        box(bm, x - .12, x + .12, Y - 9.1, Y - 8.9, DECK, DECK + 8.5)
        box(bl, x - .5, x + .5, Y - 9.6, Y - 8.6, DECK + 8.5, DECK + 9.2); x += 34
    for nm, b, m in (('bridge', bm, M_STEEL), ('bridge_lights', bl, M_WARM), ('bridge_arch_lights', ba, M_COOL), ('bridge_hangers', bh, M_STEEL)):
        me = bpy.data.meshes.new(nm); b.to_mesh(me); b.free(); me.materials.append(m); link(bpy.data.objects.new(nm, me))
bridge()

# ───────────── 바지선(쏘는 자리, 강 가운데) ─────────────
def barge():
    bm = bmesh.new(); box(bm, -17, 17, 394, 406, -.6, 1.6); box(bm, 9, 15, 396, 401, 1.6, 4.4)
    me = bpy.data.meshes.new('barge'); bm.to_mesh(me); bm.free(); me.materials.append(M_BARGE); link(bpy.data.objects.new('barge', me))
    bt = bmesh.new()
    for i in range(5):
        x = -12 + i * 4.2
        bmesh.ops.create_cone(bt, cap_ends=True, segments=14, radius1=.42, radius2=.42, depth=2.2, matrix=__import__('mathutils').Matrix.Translation((x, 400, 2.7)))
        e = bpy.data.objects.new('launch_%d' % (i + 1), None); e.location = (x, 400, 3.8); link(e)     # 빈 점: 쏘는 자리
    me = bpy.data.meshes.new('barge_tubes'); bt.to_mesh(me); bt.free(); me.materials.append(M_TUBE); link(bpy.data.objects.new('barge_tubes', me))
    bl = bmesh.new(); box(bl, 11.6, 12.4, 397, 397.8, 5.0, 5.5); box(bl, -16.6, -15.9, 394.3, 395, 2.4, 2.9)
    me = bpy.data.meshes.new('barge_lights', ); bl.to_mesh(me); bl.free(); me.materials.append(M_WARM); link(bpy.data.objects.new('barge_lights', me))
barge()

# ───────────── 이쪽 둑: 바닥·턱·난간·가로등 ─────────────
def quay():
    bm = bmesh.new(); box(bm, -60, 60, -12, 6.6, -3, 0); box(bm, -60, 60, 6.2, 6.6, 0, .22)
    me = bpy.data.meshes.new('quay'); bm.to_mesh(me); bm.free(); me.materials.append(M_CONC); ob = link(bpy.data.objects.new('quay', me))
    br = bmesh.new()
    for z in (1.08, .62, .2):                                                   # 가로대 셋
        tube_along(br, [(-60, 6.4, z), (60, 6.4, z)], .028 if z < 1 else .04, 8)
    x = -60
    while x <= 60:
        tube_along(br, [(x, 6.4, 0), (x, 6.4, 1.1)], .035, 8); x += 1.9
    me = bpy.data.meshes.new('railing'); br.to_mesh(me); br.free(); me.materials.append(M_RAIL); ob = link(bpy.data.objects.new('railing', me))
    for f in me.polygons: f.use_smooth = True
    # 가로등 둘(화면 양옆)
    for sx in (-11.5, 13.0):
        bp = bmesh.new(); tube_along(bp, [(sx, 5.6, 0), (sx, 5.6, 4.6), (sx + (.9 if sx < 0 else -.9), 5.6, 5.1)], .07, 10)
        me = bpy.data.meshes.new('lamp_post'); bp.to_mesh(me); bp.free(); me.materials.append(M_RAIL); o = link(bpy.data.objects.new('lamp_post', me))
        for f in me.polygons: f.use_smooth = True
        bg = bmesh.new(); bmesh.ops.create_uvsphere(bg, u_segments=14, v_segments=8, radius=.2, matrix=__import__('mathutils').Matrix.Translation((sx + (1.0 if sx < 0 else -1.0), 5.6, 5.02)))
        me = bpy.data.meshes.new('lamp_head'); bg.to_mesh(me); bg.free(); me.materials.append(M_LAMPH); link(bpy.data.objects.new('lamp_head', me))
        e = bpy.data.objects.new('lamp_point', None); e.location = (sx + (1.0 if sx < 0 else -1.0), 5.6, 4.95); link(e)
quay()

def props():
    import mathutils
    bm = bmesh.new()
    def cyl(r, d, loc, rot=None, seg=20):
        m = mathutils.Matrix.Translation(loc) @ (rot.to_matrix().to_4x4() if rot else mathutils.Matrix.Identity(4))
        bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=d, matrix=m)
    X, Y = 4.1, 5.5                                                             # 오른쪽 난간 앞의 관광 망원경
    cyl(.16, .05, (X, Y, .025)); cyl(.055, 1.25, (X, Y, .65)); cyl(.085, .1, (X, Y, 1.3))
    tilt = mathutils.Euler((math.radians(82), 0, 0))
    for sx in (-.075, .075):
        cyl(.07, .46, (X + sx, Y + .02, 1.44), tilt); cyl(.082, .05, (X + sx, Y + .24, 1.47), tilt); cyl(.05, .07, (X + sx, Y - .24, 1.41), tilt)
    box(bm, X - .13, X + .13, Y - .1, Y + .12, 1.34, 1.52)
    me = bpy.data.meshes.new('props'); bm.to_mesh(me); bm.free(); me.materials.append(M_RAIL); ob = link(bpy.data.objects.new('quay_props', me))
    for f in me.polygons: f.use_smooth = True
props()

# 보는 자리(빈 점)
e = bpy.data.objects.new('eye', None); e.location = (0, 0, 1.6); link(e)

# ───────────── 내보내기 ─────────────
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'riverside.glb'), export_format='GLB', export_yup=True,
                          export_apply=True, export_image_format='AUTO', export_extras=False, export_cameras=False, export_lights=False)
print('GLB', os.path.getsize(os.path.join(OUT, 'riverside.glb')) // 1024, 'KB')

# ───────────── 기준 그림(Cycles) ─────────────
if DO_RENDER:
    cam = bpy.data.cameras.new('cam'); cam.sensor_fit = 'VERTICAL'; cam.angle_y = math.radians(56); cam.clip_end = 6000
    co = link(bpy.data.objects.new('cam', cam)); co.location = (0, 0, 1.6); co.rotation_euler = (math.radians(90 + 11), 0, 0); scene.camera = co
    w = bpy.data.worlds.new('w'); w.use_nodes = True; scene.world = w
    bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (.006, .01, .03, 1); bg.inputs[1].default_value = 1
    # 강물(기준 그림용)
    bm = bmesh.new(); box(bm, -3000, 3000, 6.6, 1700, -2, -.02); me = bpy.data.meshes.new('water'); bm.to_mesh(me); bm.free()
    mw = mat('water', (.005, .008, .012), .08, 0); me.materials.append(mw); link(bpy.data.objects.new('water', me))
    for o in bpy.data.objects:
        if o.name.startswith('lamp_point'):
            l = bpy.data.lights.new('l', 'POINT'); l.energy = 900; l.color = (1, .8, .55); lo = link(bpy.data.objects.new('l', l)); lo.location = o.location
    scene.render.engine = 'CYCLES'; scene.cycles.samples = 40; scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = 960, 540
    scene.view_settings.view_transform = 'Filmic' if 'Filmic' in [i.identifier for i in type(scene.view_settings).bl_rna.properties['view_transform'].enum_items] else scene.view_settings.view_transform
    scene.view_settings.exposure = 1.2
    scene.render.filepath = os.path.join(OUT, 'ref_riverside.png'); bpy.ops.render.render(write_still=True)
    print('RENDER done')

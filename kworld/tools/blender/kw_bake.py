"""케이월드 — 구워 입히는 모델 도구(준호 11-23 「블렌더로 해서 좀 더 제대로」).
kw_lib 의 모델은 도형에 민짜 색만 입혔다. 여기서는 절차 재질(이엉 결·나뭇결·돌·회벽·기와·털·옷감)을 만들고,
Cycles 로 ①색 ②구석 그늘(AO) ③노멀을 구워 묶음마다 무늬 한 장(색×그늘) + 노멀 한 장으로 내보낸다.
모양은 kw_lib.B 로 쌓되(재질 이름 = MATS 의 절차 재질), 곡면은 매끈하게(smooth) · 모서리는 둥글게(bevel).
실행: blender -b --python make_<묶음>.py → scene/assets/<묶음>.glb (무늬가 들어 있다). 읽는 쪽 = kworld/farm/models.js."""
import bpy, bmesh, math, os, random, time
import numpy as np
from mathutils import Vector
from kw_lib import B, MATS, OUT, rgb


def reset_bake(samples=24):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATS.clear()
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = samples
    try:
        sc.cycles.use_denoising = False
    except Exception:
        pass
    w = bpy.data.worlds.new('w'); sc.world = w
    w.light_settings.distance = 2.5
    return sc


# ───────── 노드 도우미 ─────────
def nmat(name, rough=0.85):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); bs = nt.nodes.new('ShaderNodeBsdfPrincipled')
    nt.links.new(bs.outputs['BSDF'], out.inputs['Surface'])
    bs.inputs['Roughness'].default_value = rough
    MATS[name] = m
    return m, nt, bs


def N(nt, kind, **kw):
    n = nt.nodes.new(kind)
    for k, v in kw.items():
        if k in n.inputs:
            n.inputs[k].default_value = v
        else:
            setattr(n, k, v)
    return n


def L(nt, a, b):
    nt.links.new(a, b)


def ramp(nt, stops, fac=None):
    r = nt.nodes.new('ShaderNodeValToRGB'); e = r.color_ramp.elements
    e[0].position, e[0].color = stops[0][0], (*rgb(stops[0][1]), 1)
    e[1].position, e[1].color = stops[-1][0], (*rgb(stops[-1][1]), 1)
    for p, c in stops[1:-1]:
        el = e.new(p); el.color = (*rgb(c), 1)
    if fac is not None:
        nt.links.new(fac, r.inputs['Fac'])
    return r


def coords(nt, scale=(1, 1, 1), rot=(0, 0, 0)):
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = scale; mp.inputs['Rotation'].default_value = rot
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    return mp.outputs['Vector']


def mix(nt, a, b, fac, mode='MIX'):
    m = nt.nodes.new('ShaderNodeMix'); m.data_type = 'RGBA'; m.blend_type = mode
    for sock, v in ((m.inputs[0], fac), (m.inputs[6], a), (m.inputs[7], b)):
        if hasattr(v, 'links'):
            nt.links.new(v, sock)
        elif isinstance(v, (int, float)):
            sock.default_value = v
        else:
            sock.default_value = (*v, 1) if len(v) == 3 else v
    return m.outputs[2]


def bump(nt, bs, height, strength=0.4, dist=0.02):
    b = nt.nodes.new('ShaderNodeBump'); b.inputs['Strength'].default_value = strength; b.inputs['Distance'].default_value = dist
    nt.links.new(height, b.inputs['Height']); nt.links.new(b.outputs['Normal'], bs.inputs['Normal'])


def math1(nt, op, a, b=None):
    m = nt.nodes.new('ShaderNodeMath'); m.operation = op
    for i, v in enumerate((a, b)):
        if v is None:
            continue
        if hasattr(v, 'links'):
            nt.links.new(v, m.inputs[i])
        else:
            m.inputs[i].default_value = v
    return m.outputs[0]


# ───────── 재질 ─────────
def m_plain(name, hexv, rough=0.85, var=0.08, scale=6.0):
    """거의 한 색 — 아주 옅은 얼룩만."""
    m, nt, bs = nmat(name, rough)
    n = N(nt, 'ShaderNodeTexNoise', Scale=scale, Detail=3.0)
    L(nt, coords(nt), n.inputs['Vector'])
    c = rgb(hexv)
    L(nt, mix(nt, tuple(x * (1 - var) for x in c), tuple(min(1, x * (1 + var)) for x in c), n.outputs['Fac']), bs.inputs['Base Color'])
    return m


def m_thatch(name='thatch', cols=(0x8e6c30, 0xcfa650, 0xe8cc80), old=0x8a7a5a):
    """이엉: 처마 쪽으로 흘러내리는 짚 가닥(세로로 길게 늘인 무늬) + 켜켜이 얹은 단 + 묵은 얼룩."""
    m, nt, bs = nmat(name, 0.95)
    v = coords(nt, (22, 22, 1.6))
    n1 = N(nt, 'ShaderNodeTexNoise', Scale=1.0, Detail=5.0, Roughness=0.65); L(nt, v, n1.inputs['Vector'])
    v2 = coords(nt, (55, 55, 3.0)); n2 = N(nt, 'ShaderNodeTexNoise', Scale=1.0, Detail=2.0); L(nt, v2, n2.inputs['Vector'])
    f = math1(nt, 'ADD', math1(nt, 'MULTIPLY', n1.outputs['Fac'], 0.65), math1(nt, 'MULTIPLY', n2.outputs['Fac'], 0.35))
    col = ramp(nt, [(0.28, cols[0]), (0.5, cols[1]), (0.72, cols[2])], f).outputs['Color']
    big = N(nt, 'ShaderNodeTexNoise', Scale=0.9, Detail=3.0); L(nt, coords(nt), big.inputs['Vector'])
    col = mix(nt, col, rgb(old), math1(nt, 'MULTIPLY', math1(nt, 'SUBTRACT', big.outputs['Fac'], 0.42), 1.5))
    # 켜: 높이마다 단 아래쪽이 조금 어둡다
    sep = nt.nodes.new('ShaderNodeSeparateXYZ'); L(nt, coords(nt), sep.inputs['Vector'])
    saw = math1(nt, 'FRACT', math1(nt, 'MULTIPLY', sep.outputs['Z'], 3.2))
    col = mix(nt, col, (0.12, 0.08, 0.03), math1(nt, 'MULTIPLY', math1(nt, 'POWER', math1(nt, 'SUBTRACT', 1.0, saw), 6.0), 0.5))
    L(nt, col, bs.inputs['Base Color'])
    bump(nt, bs, math1(nt, 'ADD', f, math1(nt, 'MULTIPLY', saw, 0.6)), 0.9, 0.05)
    return m


def m_wood(name='wood', cols=(0x4a3320, 0x7a5632, 0x9a7244), axis='Z', scale=1.0):
    """나무: 결이 axis 쪽으로 길게, 옹이 얼룩."""
    m, nt, bs = nmat(name, 0.8)
    s = {'Z': (14, 14, 0.9), 'X': (0.9, 14, 14), 'Y': (14, 0.9, 14)}[axis]
    v = coords(nt, tuple(q * scale for q in s))
    n1 = N(nt, 'ShaderNodeTexNoise', Scale=1.0, Detail=4.0, Roughness=0.6, Distortion=0.6); L(nt, v, n1.inputs['Vector'])
    col = ramp(nt, [(0.3, cols[0]), (0.52, cols[1]), (0.75, cols[2])], n1.outputs['Fac']).outputs['Color']
    L(nt, col, bs.inputs['Base Color']); bump(nt, bs, n1.outputs['Fac'], 0.5, 0.02)
    return m


def m_plaster(name='plaster', base=0xe9dfc6, stain=0xb8a47c, crack=True):
    """회벽·흙벽: 손자국 같은 얼룩 + 아래로 번진 때 + 가는 금."""
    m, nt, bs = nmat(name, 0.92)
    n1 = N(nt, 'ShaderNodeTexNoise', Scale=1.6, Detail=5.0, Roughness=0.7); L(nt, coords(nt), n1.inputs['Vector'])
    n2 = N(nt, 'ShaderNodeTexNoise', Scale=9.0, Detail=2.0); L(nt, coords(nt, (1, 1, 0.25)), n2.inputs['Vector'])
    f = math1(nt, 'ADD', math1(nt, 'MULTIPLY', n1.outputs['Fac'], 0.7), math1(nt, 'MULTIPLY', n2.outputs['Fac'], 0.3))
    col = ramp(nt, [(0.3, stain), (0.62, base)], f).outputs['Color']
    if crack:
        vo = N(nt, 'ShaderNodeTexVoronoi', Scale=1.7); vo.feature = 'DISTANCE_TO_EDGE'; L(nt, coords(nt), vo.inputs['Vector'])
        ck = math1(nt, 'LESS_THAN', vo.outputs['Distance'], 0.012)
        col = mix(nt, col, rgb(0x6a5a44), math1(nt, 'MULTIPLY', ck, 0.55))
    L(nt, col, bs.inputs['Base Color']); bump(nt, bs, n1.outputs['Fac'], 0.25, 0.02)
    return m


def m_mud(name='mud', base=0xb89464, dark=0x8a6a40, straw=0xd8c080):
    """황토벽: 흙빛 얼룩에 짚 여물이 점점이."""
    m, nt, bs = nmat(name, 0.95)
    n1 = N(nt, 'ShaderNodeTexNoise', Scale=2.2, Detail=5.0, Roughness=0.7); L(nt, coords(nt), n1.inputs['Vector'])
    col = ramp(nt, [(0.3, dark), (0.65, base)], n1.outputs['Fac']).outputs['Color']
    n2 = N(nt, 'ShaderNodeTexNoise', Scale=1.0, Detail=1.0); L(nt, coords(nt, (60, 60, 14)), n2.inputs['Vector'])
    col = mix(nt, col, rgb(straw), math1(nt, 'MULTIPLY', math1(nt, 'GREATER_THAN', n2.outputs['Fac'], 0.66), 0.6))
    L(nt, col, bs.inputs['Base Color']); bump(nt, bs, n1.outputs['Fac'], 0.5, 0.03)
    return m


def m_stone(name='stone', cols=(0x6e6a62, 0x9a968c, 0xb8b4a8), scale=3.0, moss=0x6a7a4a):
    """돌: 얼룩덜룩한 결 + 이끼 낀 자리."""
    m, nt, bs = nmat(name, 0.9)
    n1 = N(nt, 'ShaderNodeTexNoise', Scale=scale, Detail=6.0, Roughness=0.7); L(nt, coords(nt), n1.inputs['Vector'])
    vo = N(nt, 'ShaderNodeTexVoronoi', Scale=scale * 4); L(nt, coords(nt), vo.inputs['Vector'])
    f = math1(nt, 'ADD', math1(nt, 'MULTIPLY', n1.outputs['Fac'], 0.75), math1(nt, 'MULTIPLY', vo.outputs['Distance'], 0.3))
    col = ramp(nt, [(0.3, cols[0]), (0.55, cols[1]), (0.8, cols[2])], f).outputs['Color']
    if moss:
        n3 = N(nt, 'ShaderNodeTexNoise', Scale=1.1, Detail=3.0); L(nt, coords(nt), n3.inputs['Vector'])
        col = mix(nt, col, rgb(moss), math1(nt, 'MULTIPLY', math1(nt, 'GREATER_THAN', n3.outputs['Fac'], 0.6), 0.45))
    L(nt, col, bs.inputs['Base Color']); bump(nt, bs, f, 0.7, 0.03)
    return m


def m_tile(name='tile', cols=(0x30343c, 0x4a505c, 0x666c78), period=0.34, axis='X'):
    """기와: 용마루와 직각으로 기왓골(둥근 수키와 줄) + 가로로 겹친 이음 + 이끼·때."""
    m, nt, bs = nmat(name, 0.7)
    sep = nt.nodes.new('ShaderNodeSeparateXYZ'); L(nt, coords(nt), sep.inputs['Vector'])
    u = sep.outputs[axis]; w = sep.outputs['Y' if axis == 'X' else 'X']
    ph = math1(nt, 'FRACT', math1(nt, 'DIVIDE', u, period))
    rnd = math1(nt, 'SINE', math1(nt, 'MULTIPLY', ph, math.pi))            # 0(골) → 1(등)
    lap = math1(nt, 'FRACT', math1(nt, 'MULTIPLY', w, 2.6))
    n1 = N(nt, 'ShaderNodeTexNoise', Scale=2.5, Detail=4.0); L(nt, coords(nt), n1.inputs['Vector'])
    f = math1(nt, 'ADD', math1(nt, 'MULTIPLY', rnd, 0.55), math1(nt, 'MULTIPLY', n1.outputs['Fac'], 0.45))
    col = ramp(nt, [(0.2, cols[0]), (0.55, cols[1]), (0.9, cols[2])], f).outputs['Color']
    col = mix(nt, col, (0.02, 0.02, 0.025), math1(nt, 'MULTIPLY', math1(nt, 'LESS_THAN', lap, 0.07), 0.6))
    L(nt, col, bs.inputs['Base Color'])
    bump(nt, bs, math1(nt, 'ADD', rnd, math1(nt, 'MULTIPLY', lap, 0.25)), 1.0, 0.08)
    return m


def m_cloth(name, hexv, weave=90.0, var=0.1):
    """천: 올이 보이는 무늬."""
    m, nt, bs = nmat(name, 0.95)
    c = rgb(hexv)
    wv = N(nt, 'ShaderNodeTexWave', Scale=weave, Distortion=0.4); L(nt, coords(nt), wv.inputs['Vector'])
    n1 = N(nt, 'ShaderNodeTexNoise', Scale=3.0, Detail=3.0); L(nt, coords(nt), n1.inputs['Vector'])
    f = math1(nt, 'ADD', math1(nt, 'MULTIPLY', wv.outputs['Fac'], 0.3), math1(nt, 'MULTIPLY', n1.outputs['Fac'], 0.7))
    L(nt, mix(nt, tuple(x * (1 - var * 2) for x in c), tuple(min(1, x * (1 + var)) for x in c), f), bs.inputs['Base Color'])
    bump(nt, bs, wv.outputs['Fac'], 0.15, 0.005)
    return m


def m_jar(name='jar', cols=(0x2e1c14, 0x5a3626, 0x7a4c34)):
    """옹기: 윤이 도는 짙은 갈색에 유약 흐른 자국."""
    m, nt, bs = nmat(name, 0.35)
    n1 = N(nt, 'ShaderNodeTexNoise', Scale=2.0, Detail=4.0); L(nt, coords(nt, (3, 3, 0.6)), n1.inputs['Vector'])
    L(nt, ramp(nt, [(0.3, cols[0]), (0.55, cols[1]), (0.8, cols[2])], n1.outputs['Fac']).outputs['Color'], bs.inputs['Base Color'])
    return m


# ───────── 모양 다듬기 ─────────
def smooth_obj(ob, angle=45):
    for p in ob.data.polygons:
        p.use_smooth = True
    if hasattr(ob.data, 'set_sharp_from_angle'):
        ob.data.set_sharp_from_angle(angle=math.radians(angle))


# ───────── 굽기 ─────────
def _sel(objs):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]


def bake_set(objs, fname, size=2048, nsize=1024, ao_lo=0.38, ao_pow=0.9, normal=True, quality=86, uv_angle=66, keep_color=False, uv_weight=None):
    """objs 를 무늬 한 장에 굽고 fname(.glb)으로 내보낸다."""
    t0 = time.time(); sc = bpy.context.scene
    objs = [o for o in objs if o.type == 'MESH']
    # 1) UV: 모두 함께 펼치고 크기를 고르게 맞춰 한 장에 채운다
    _sel(objs)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(uv_angle), island_margin=0.002)
    bpy.ops.uv.average_islands_scale()
    bpy.ops.object.mode_set(mode='OBJECT')
    for o in objs:   # 눈에 덜 띄는 것(갓 양태 따위)은 무늬를 덜 쓰고, 얼굴은 더 쓴다
        k = (uv_weight or {}).get(o.name, 1.0)
        if k != 1.0:
            for d in o.data.uv_layers.active.data:
                d.uv = d.uv * k
    _sel(objs); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.uv.select_all(action='SELECT')
    try:
        bpy.ops.uv.pack_islands(margin=0.0025, rotate=True)
    except TypeError:
        bpy.ops.uv.pack_islands(margin=0.0025)
    bpy.ops.object.mode_set(mode='OBJECT')
    # 2) 서로 그늘지지 않게 띄워 놓고, 바닥 판을 깐다(벽 밑동이 어둡게)
    home = [o.location.copy() for o in objs]
    for i, o in enumerate(objs):
        o.location.x += (i % 8) * 60; o.location.y += (i // 8) * 60
    bpy.ops.mesh.primitive_plane_add(size=2000, location=(0, 0, -0.002)); ground = bpy.context.active_object
    imgs = {}
    mats = {m for o in objs for m in o.data.materials if m}
    def bake(kind, btype, **kw):
        img = bpy.data.images.new(f'{fname}_{kind}', size if kind != 'n' else nsize, size if kind != 'n' else nsize, alpha=False)
        if kind == 'n':
            img.colorspace_settings.name = 'Non-Color'
        tns = []
        for m in mats:
            nt = m.node_tree; tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = img
            for n in nt.nodes:
                n.select = False
            tn.select = True; nt.nodes.active = tn; tns.append((nt, tn))
        _sel(objs)
        sc.render.bake.margin = 6; sc.render.bake.use_clear = False
        bpy.ops.object.bake(type=btype, **kw)
        for nt, tn in tns:
            nt.nodes.remove(tn)
        imgs[kind] = img
    sc.render.bake.use_pass_direct = False; sc.render.bake.use_pass_indirect = False; sc.render.bake.use_pass_color = True
    smp = sc.cycles.samples; sc.cycles.samples = 1
    bake('c', 'DIFFUSE')
    if normal:
        bake('n', 'NORMAL', normal_space='TANGENT')
    sc.cycles.samples = smp
    bake('ao', 'AO')
    bpy.data.objects.remove(ground)
    for o, h in zip(objs, home):
        o.location = h
    # 3) 색 × 그늘
    n = size * size * 4
    c = np.empty(n, dtype=np.float32); a = np.empty(n, dtype=np.float32)
    imgs['c'].pixels.foreach_get(c); imgs['ao'].pixels.foreach_get(a)
    c = c.reshape(-1, 4); a = a.reshape(-1, 4)
    k = ao_lo + (1 - ao_lo) * np.power(np.clip(a[:, :1], 0, 1), ao_pow)
    c[:, :3] *= k
    imgs['c'].pixels.foreach_set(c.ravel())
    tex = os.path.join(OUT, '_tex'); os.makedirs(tex, exist_ok=True)
    for kind in (['c', 'n'] if normal else ['c']):
        img = imgs[kind]; img.filepath_raw = os.path.join(tex, f"{fname}_{kind}.jpg"); img.file_format = 'JPEG'
        sc.render.image_settings.quality = quality; img.save()
        img.source = 'FILE'; img.filepath = img.filepath_raw; img.reload()
    # 4) 무늬 재질 하나로 바꾼다
    m = bpy.data.materials.new('atlas_' + fname); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes.get('Principled BSDF')
    tc = nt.nodes.new('ShaderNodeTexImage'); tc.image = imgs['c']; nt.links.new(tc.outputs['Color'], bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value = 0.88
    if normal:
        tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = imgs['n']; nm = nt.nodes.new('ShaderNodeNormalMap')
        nt.links.new(tn.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], bs.inputs['Normal'])
    for o in objs:
        o.data.materials.clear(); o.data.materials.append(m)
        for p in o.data.polygons:
            p.material_index = 0
        if not keep_color:
            for ca in list(o.data.color_attributes):
                o.data.color_attributes.remove(ca)
        elif len(o.data.color_attributes):
            o.data.color_attributes.active_color = o.data.color_attributes[0]
            try:
                o.data.color_attributes.render_color_index = 0
            except Exception:
                pass
    # 5) 내보내기
    _sel(objs)
    path = os.path.join(OUT, fname + '.glb')
    kw = dict(use_selection=True, filepath=path, export_format='GLB', export_yup=True, export_apply=True, export_normals=True, export_texcoords=True, export_animations=False, export_cameras=False, export_lights=False, export_image_format='JPEG', export_materials='EXPORT')
    try:
        bpy.ops.export_scene.gltf(export_vertex_color='ACTIVE' if keep_color else 'NONE', export_jpeg_quality=quality, **kw)
    except TypeError:
        bpy.ops.export_scene.gltf(**kw)
    faces = sum(len(o.data.polygons) for o in objs)
    print('BAKED', fname, 'objects', len(objs), 'faces', faces, 'bytes', os.path.getsize(path), 'sec', round(time.time() - t0))


def preview(path, objs=None, cols=4, gap=3.0, res=(1280, 720), samples=24, elev=32, dist=1.0, layout=True, look=None, yaw=0.0):
    """구운 모델을 줄지어 놓고 놀이 시점(비스듬히 내려다봄)으로 한 장 그린다 — 놀이에 넣기 전에 모양·무늬를 눈으로 본다."""
    sc = bpy.context.scene
    objs = objs or [o for o in sc.objects if o.type == 'MESH']
    home = [o.location.copy() for o in objs]
    hid = [o for o in sc.objects if o.type == 'MESH' and o not in objs]
    for o in hid:
        o.hide_render = True
    x = 0.0; y = 0.0; rowh = 0.0; n = 0; xs = []
    for o in (objs if layout else []):
        bb = [Vector(c) for c in o.bound_box]; w = max(c.x for c in bb) - min(c.x for c in bb); d = max(c.y for c in bb) - min(c.y for c in bb)
        if n and n % cols == 0:
            x = 0.0; y -= rowh + gap; rowh = 0.0
        o.location = (x + w / 2, y - d / 2, o.location.z); xs.append(x + w)
        x += w + gap; rowh = max(rowh, d); n += 1
    W = max(xs) if layout else 0.0; H = -(y - rowh) if layout else 0.0
    bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, 0)); g = bpy.context.active_object
    gm = bpy.data.materials.new('pv_ground'); gm.use_nodes = True; gm.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value = (0.36, 0.5, 0.2, 1); g.data.materials.append(gm)
    sun = bpy.data.objects.new('pv_sun', bpy.data.lights.new('pv_sun', 'SUN')); sun.data.energy = 3.2; sun.data.angle = 0.06; sun.rotation_euler = (math.radians(52), 0, math.radians(-38)); sc.collection.objects.link(sun)
    w = sc.world; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.62, 0.74, 0.9, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.9
    cam = bpy.data.objects.new('pv_cam', bpy.data.cameras.new('pv_cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = 60; r = max(W, H * 1.6) * 1.25 * dist + 6; e = math.radians(elev)
    c = Vector(look) if look else Vector((W / 2, -H / 2, 1.2)); cam.data.sensor_fit = 'HORIZONTAL'
    if not layout:
        r = 9 * dist
    cam.location = c + Vector((math.sin(yaw) * math.cos(e) * r, -math.cos(yaw) * math.cos(e) * r, math.sin(e) * r))
    cam.rotation_euler = (c - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.render.resolution_x, sc.render.resolution_y = res; sc.cycles.samples = samples; sc.render.filepath = path
    try:
        sc.cycles.use_denoising = True
    except Exception:
        pass
    sc.view_settings.view_transform = 'Standard'
    bpy.ops.render.render(write_still=True)
    for o in (g, sun, cam):
        bpy.data.objects.remove(o)
    for o, h in zip(objs, home):
        o.location = h
    for o in hid:
        o.hide_render = False
    print('PREVIEW', path)


def seg(b, p0, p1, r0, r1, m, n=7, **k):
    """p0 → p1 로 뻗은 둥근 토막(서까래·가지·다리).
    꼭짓점을 먼저 옮기고 면 방향을 새로 셈한 뒤 넘긴다 — kw_lib._take 는 옮기기 전 면 방향으로 안팎을 가려서, 기울어진 토막이 뒤집힌 채 구워졌다(그늘이 안쪽 기준)."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0; h = d.length
    Q = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix()
    t = bmesh.new()
    bmesh.ops.create_cone(t, cap_ends=True, cap_tris=False, segments=n, radius1=max(r0, 1e-4), radius2=max(r1, 1e-4), depth=h)
    for v in t.verts:
        v.co = p0 + Q @ (v.co + Vector((0, 0, h / 2)))
    t.normal_update()
    return b._take(t, m, (0, 0, 0), **k)


def m_fur(name, cols, axis='Y', scale=1.0, rough=0.9):
    """털: 몸을 따라 누운 잔결 + 얼룩."""
    m, nt, bs = nmat(name, rough)
    s = {'Y': (38, 5, 38), 'Z': (38, 38, 5), 'X': (5, 38, 38)}[axis]
    n1 = N(nt, 'ShaderNodeTexNoise', Scale=1.0, Detail=3.0, Roughness=0.6); L(nt, coords(nt, tuple(q * scale for q in s)), n1.inputs['Vector'])
    n2 = N(nt, 'ShaderNodeTexNoise', Scale=3.0 * scale, Detail=2.0); L(nt, coords(nt), n2.inputs['Vector'])
    f = math1(nt, 'ADD', math1(nt, 'MULTIPLY', n1.outputs['Fac'], 0.6), math1(nt, 'MULTIPLY', n2.outputs['Fac'], 0.4))
    L(nt, ramp(nt, [(0.3, cols[0]), (0.5, cols[1]), (0.72, cols[2])], f).outputs['Color'], bs.inputs['Base Color'])
    bump(nt, bs, n1.outputs['Fac'], 0.3, 0.01)
    return m


def mask_by(ob, r=(), g=()):
    """색 가리개: 재질 이름이 r 에 있으면 R, g 에 있으면 G — 읽는 쪽이 그 자리에 색을 곱한다."""
    me = ob.data
    for ca in list(me.color_attributes):
        me.color_attributes.remove(ca)
    ca = me.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
    for p in me.polygons:
        nm = me.materials[p.material_index].name
        c = (1, 0, 0, 1) if nm in r else (0, 1, 0, 1) if nm in g else (0, 0, 0, 1)
        for li in p.loop_indices:
            ca.data[li].color = c
    return ob


def _take_fixed(self, tmp, m, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), f=None, tone=1.0, jit=0.05, bevel=0, bseg=1):
    """kw_lib.B._take 와 같되, 꼭짓점을 옮긴 뒤 면 방향을 새로 셈하고 나서 안팎을 가린다(돌리거나 휘게 한 조각이 뒤집혀 구워지던 것).
    구워 입히는 모델에서만 바꿔 끼운다 — kw_lib 로 만든 예전 모델은 양면 재질이라 티가 나지 않았다."""
    from mathutils import Matrix
    if bevel > 0:
        bmesh.ops.bevel(tmp, geom=list(tmp.edges), offset=bevel, segments=bseg, affect='EDGES', profile=0.5)
    M = Matrix.Translation(Vector(loc)) @ Matrix.Rotation(rot[2], 4, 'Z') @ Matrix.Rotation(rot[1], 4, 'Y') @ Matrix.Rotation(rot[0], 4, 'X')
    S = Matrix.Diagonal((scale[0], scale[1], scale[2], 1))
    for v in tmp.verts:
        if f:
            v.co = Vector(f(v.co.copy()))
        v.co = M @ (S @ v.co)
    tmp.normal_update()
    bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
    me = bpy.data.meshes.new('tmp')
    tmp.to_mesh(me)
    tmp.free()
    n0 = len(self.bm.faces)
    self.bm.from_mesh(me)
    bpy.data.meshes.remove(me)
    self.bm.faces.ensure_lookup_table()
    mi = self._mi(m)
    for i in range(n0, len(self.bm.faces)):
        fc = self.bm.faces[i]
        fc.material_index = mi
        fc[self.tone] = tone
        fc[self.jit] = jit
    return self


B._take = _take_fixed


def skin(ob, voxel=0.014, faces=600, keep=(), smooth_it=6, smooth_f=0.6):
    """겹쳐 쌓은 덩이들을 한 겹 살갗으로: 복셀 리메시(합치기) → 다듬기 → 면 줄이기. 재질은 가까운 원래 면에서 옮겨 온다.
    keep 에 든 재질(눈·코·뿔·발굽처럼 또렷해야 하는 것)은 합치지 않고 그대로 붙인다."""
    from mathutils.bvhtree import BVHTree
    me = ob.data; names = [m.name for m in me.materials]
    det = None
    if keep and any(names[p.material_index] in keep for p in me.polygons):
        det = ob.copy(); det.data = me.copy(); bpy.context.scene.collection.objects.link(det)
        for o, want in ((ob, False), (det, True)):
            bm = bmesh.new(); bm.from_mesh(o.data)
            bmesh.ops.delete(bm, geom=[f for f in bm.faces if (names[f.material_index] in keep) != want], context='FACES')
            bm.to_mesh(o.data); bm.free()
    src = ob.data.copy()
    bvh = BVHTree.FromPolygons([v.co.copy() for v in src.vertices], [tuple(p.vertices) for p in src.polygons])
    smi = [p.material_index for p in src.polygons]
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    md = ob.modifiers.new('rm', 'REMESH'); md.mode = 'VOXEL'; md.voxel_size = voxel; md.adaptivity = 0.0; bpy.ops.object.modifier_apply(modifier=md.name)
    md = ob.modifiers.new('sm', 'SMOOTH'); md.factor = smooth_f; md.iterations = smooth_it; bpy.ops.object.modifier_apply(modifier=md.name)
    n = len(ob.data.polygons) * 2
    if n > faces:
        md = ob.modifiers.new('dc', 'DECIMATE'); md.ratio = faces / n; bpy.ops.object.modifier_apply(modifier=md.name)
    me = ob.data
    for p in me.polygons:
        hit = bvh.find_nearest(p.center)
        p.material_index = smi[hit[2]] if hit and hit[2] is not None else 0
        p.use_smooth = True
    bpy.data.meshes.remove(src)
    if det:
        bpy.ops.object.select_all(action='DESELECT'); det.select_set(True); ob.select_set(True); bpy.context.view_layer.objects.active = ob
        nm = ob.name; bpy.ops.object.join(); ob.name = nm
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob

# 케이모션 거인 나라 탈출 · 자산 생성기 (bpy, 화면 없이)
#   python3 kmotion/giant/tools/giant_assets.py [props|table|env|all]
# 단위 = 아이 키 기준(아이 ≈ 1.6). 거인 배율 G = 40 → 실제 1cm = 0.4.
# 절차 재질은 glTF 로 못 나가므로 굽기(bake)로 사진 같은 질감(색·노멀·거칠기)을 이미지로 만든 뒤 내보낸다.
import bpy, bmesh, math, os, sys, random
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'assets'))
TEX = os.path.join(OUT, 'tex')
os.makedirs(TEX, exist_ok=True)
G = 0.4  # 1cm
random.seed(7)

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 1
    return sc

# ───────── 노드 도우미
def node_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); bs = nt.nodes.new('ShaderNodeBsdfPrincipled')
    nt.links.new(bs.outputs['BSDF'], out.inputs['Surface'])
    return m, nt, bs

def N(nt, kind, **kw):
    n = nt.nodes.new(kind)
    for k, v in kw.items():
        if k in n.inputs: n.inputs[k].default_value = v
        else: setattr(n, k, v)
    return n

def L(nt, a, b): nt.links.new(a, b)

def ramp(nt, stops):
    r = nt.nodes.new('ShaderNodeValToRGB'); e = r.color_ramp.elements
    e[0].position, e[0].color = stops[0][0], (*stops[0][1], 1)
    e[1].position, e[1].color = stops[-1][0], (*stops[-1][1], 1)
    for p, c in stops[1:-1]:
        el = e.new(p); el.color = (*c, 1)
    return r

def hexc(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)

def simple(name, color, rough=.5, metal=0., trans=0., ior=1.45, clear=0.):
    m, nt, bs = node_mat(name)
    bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = metal
    if trans: bs.inputs['Transmission Weight'].default_value = trans; bs.inputs['IOR'].default_value = ior
    if clear: bs.inputs['Coat Weight'].default_value = clear
    return m

def obj_from(mesh_op, name, **kw):
    mesh_op(**kw); o = bpy.context.active_object; o.name = name; return o

def shade(o, smooth=True, angle=50):
    bpy.context.view_layer.objects.active = o
    for p in o.data.polygons: p.use_smooth = smooth
    if smooth:
        try: bpy.ops.object.shade_auto_smooth(angle=math.radians(angle))
        except Exception: pass

def apply_mods(o):
    bpy.context.view_layer.objects.active = o
    for md in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=md.name)

def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join(); o = bpy.context.active_object; o.name = name
    return o

def to_origin_floor(o):
    # 바닥(z 최소)을 0, 가운데를 원점으로
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    vs = [o.matrix_world @ v.co for v in o.data.vertices]
    minz = min(v.z for v in vs); cx = sum(v.x for v in vs) / len(vs); cy = sum(v.y for v in vs) / len(vs)
    for v in o.data.vertices: v.co -= Vector((cx, cy, minz))

def uv_smart(o, margin=.02):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=margin)
    bpy.ops.object.mode_set(mode='OBJECT')

def uv_sphere_proj(o):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.sphere_project(); bpy.ops.object.mode_set(mode='OBJECT')

# ───────── 굽기: 절차 재질 → 이미지(색·노멀·거칠기) → 이미지 재질
def bake(o, size, tag, rough_default=None):
    sc = bpy.context.scene
    mats = [m for m in o.data.materials if m]; src = mats[-1]; o.data.materials.clear(); o.data.materials.append(src); nt = src.node_tree
    bs = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    imgs = {}
    for kind in ('color', 'normal', 'rough'):
        img = bpy.data.images.new(f'{tag}_{kind}', size, size, alpha=False, float_buffer=False)
        if kind != 'color': img.colorspace_settings.name = 'Non-Color'
        tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = img
        for n in nt.nodes: n.select = False
        tn.select = True; nt.nodes.active = tn
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
        sc.render.bake.margin = 8
        if kind == 'color':
            sc.render.bake.use_pass_direct = False; sc.render.bake.use_pass_indirect = False; sc.render.bake.use_pass_color = True
            # 금속이면 디퓨즈 굽기가 검게 나와 잠깐 끈다
            mv = bs.inputs['Metallic'].default_value; bs.inputs['Metallic'].default_value = 0
            bpy.ops.object.bake(type='DIFFUSE'); bs.inputs['Metallic'].default_value = mv
        elif kind == 'normal':
            bpy.ops.object.bake(type='NORMAL', normal_space='TANGENT')
        else:
            bpy.ops.object.bake(type='ROUGHNESS')
        path = os.path.join(TEX, f'{tag}_{kind}.jpg')
        img.filepath_raw = path; img.file_format = 'JPEG'
        sc.render.image_settings.quality = 88
        img.save(); imgs[kind] = img
        nt.nodes.remove(tn)
    # 이미지 재질로 교체
    m, nt2, b2 = node_mat(tag)
    tc = N(nt2, 'ShaderNodeTexImage', image=imgs['color']); L(nt2, tc.outputs['Color'], b2.inputs['Base Color'])
    tr = N(nt2, 'ShaderNodeTexImage', image=imgs['rough']); L(nt2, tr.outputs['Color'], b2.inputs['Roughness'])
    tn = N(nt2, 'ShaderNodeTexImage', image=imgs['normal']); nm = N(nt2, 'ShaderNodeNormalMap')
    L(nt2, tn.outputs['Color'], nm.inputs['Color']); L(nt2, nm.outputs['Normal'], b2.inputs['Normal'])
    b2.inputs['Metallic'].default_value = bs.inputs['Metallic'].default_value
    b2.inputs['Coat Weight'].default_value = bs.inputs['Coat Weight'].default_value
    b2.inputs['Coat Roughness'].default_value = bs.inputs['Coat Roughness'].default_value
    b2.inputs['Subsurface Weight'].default_value = 0
    o.data.materials.clear(); o.data.materials.append(m)
    return m

# ───────── 재질 묶음 (절차)
def mat_wood(scale=1.0):
    m, nt, bs = node_mat('wood_proc')
    tc = N(nt, 'ShaderNodeTexCoord'); mp = N(nt, 'ShaderNodeMapping')
    L(nt, tc.outputs['Object'], mp.inputs['Vector'])
    # 판자: x 방향으로 판자 폭 6(=15cm). 판자마다 색·결 어긋남
    sep = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, mp.outputs['Vector'], sep.inputs['Vector'])
    div = N(nt, 'ShaderNodeMath', operation='DIVIDE'); div.inputs[1].default_value = 6.0 * scale; L(nt, sep.outputs['X'], div.inputs[0])
    fl = N(nt, 'ShaderNodeMath', operation='FLOOR'); L(nt, div.outputs['Value'], fl.inputs[0])
    fr = N(nt, 'ShaderNodeMath', operation='FRACT'); L(nt, div.outputs['Value'], fr.inputs[0])
    wn = N(nt, 'ShaderNodeTexWhiteNoise', noise_dimensions='1D'); L(nt, fl.outputs['Value'], wn.inputs['W'])
    # 결: 판자 안 좌표에 판자별 오프셋을 더한 wave
    off = N(nt, 'ShaderNodeVectorMath', operation='ADD'); L(nt, mp.outputs['Vector'], off.inputs[0])
    cxyz = N(nt, 'ShaderNodeCombineXYZ'); L(nt, wn.outputs['Value'], cxyz.inputs['X']); L(nt, wn.outputs['Value'], cxyz.inputs['Y'])
    sc1 = N(nt, 'ShaderNodeVectorMath', operation='SCALE'); sc1.inputs['Scale'].default_value = 37.0; L(nt, cxyz.outputs['Vector'], sc1.inputs[0]); L(nt, sc1.outputs['Vector'], off.inputs[1])
    def stretched(sx, sy):
        v = N(nt, 'ShaderNodeVectorMath', operation='MULTIPLY'); v.inputs[1].default_value = (sx, sy, 1.0); L(nt, off.outputs['Vector'], v.inputs[0]); return v.outputs['Vector']
    # 큰 얼룩(판자 안 밝고 어두운 흐름)
    big = N(nt, 'ShaderNodeTexNoise'); big.inputs['Scale'].default_value = 1.0; big.inputs['Detail'].default_value = 4; L(nt, stretched(.35, .025), big.inputs['Vector'])
    # 나이테 선: 결 방향으로 길게 늘인 띠 + 왜곡
    wave = N(nt, 'ShaderNodeTexWave', wave_type='BANDS', bands_direction='X', wave_profile='SAW')
    wave.inputs['Scale'].default_value = 0.42 / scale; wave.inputs['Distortion'].default_value = 7.5
    wave.inputs['Detail'].default_value = 8.0; wave.inputs['Detail Scale'].default_value = .8; wave.inputs['Detail Roughness'].default_value = .62
    L(nt, stretched(1.0, .075), wave.inputs['Vector'])
    lines = ramp(nt, [(0.0, (1, 1, 1)), (0.72, (1, 1, 1)), (0.9, (.55, .55, .55)), (0.97, (.38, .38, .38)), (1.0, (.8, .8, .8))]); L(nt, wave.outputs['Fac'], lines.inputs['Fac'])
    # 미세 결(물관)
    fine = N(nt, 'ShaderNodeTexNoise'); fine.inputs['Scale'].default_value = 2.4 / scale; fine.inputs['Detail'].default_value = 10.0; fine.inputs['Roughness'].default_value = .7
    L(nt, stretched(16.0, .22), fine.inputs['Vector'])
    pores = ramp(nt, [(0.35, (.82, .82, .82)), (0.6, (1, 1, 1))]); L(nt, fine.outputs['Fac'], pores.inputs['Fac'])
    r = ramp(nt, [(0.25, hexc('7a4b28')), (0.5, hexc('9b6639')), (0.72, hexc('b5804c')), (0.9, hexc('c6925b'))])
    L(nt, big.outputs['Fac'], r.inputs['Fac'])
    m1 = N(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); m1.inputs['Factor'].default_value = 1.0; L(nt, r.outputs['Color'], m1.inputs['A']); L(nt, lines.outputs['Color'], m1.inputs['B'])
    m2 = N(nt, 'ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY'); m2.inputs['Factor'].default_value = 1.0; L(nt, m1.outputs['Result'], m2.inputs['A']); L(nt, pores.outputs['Color'], m2.inputs['B'])
    add = N(nt, 'ShaderNodeMath', operation='MULTIPLY_ADD'); add.inputs[1].default_value = .6; L(nt, wave.outputs['Fac'], add.inputs[0]); L(nt, fine.outputs['Fac'], add.inputs[2])
    class _R: pass
    r = _R(); r.outputs = {'Color': m2.outputs['Result']}
    # 판자별 밝기 차이
    hsv = N(nt, 'ShaderNodeHueSaturation'); L(nt, r.outputs['Color'], hsv.inputs['Color'])
    vmap = N(nt, 'ShaderNodeMapRange'); vmap.inputs['To Min'].default_value = .78; vmap.inputs['To Max'].default_value = 1.15; L(nt, wn.outputs['Value'], vmap.inputs['Value']); L(nt, vmap.outputs['Result'], hsv.inputs['Value'])
    # 판자 틈(어두운 선)
    edge = N(nt, 'ShaderNodeMapRange'); edge.inputs['From Min'].default_value = 0.0; edge.inputs['From Max'].default_value = 0.012; L(nt, fr.outputs['Value'], edge.inputs['Value'])
    edge2 = N(nt, 'ShaderNodeMapRange'); edge2.inputs['From Min'].default_value = 1.0; edge2.inputs['From Max'].default_value = 0.988; L(nt, fr.outputs['Value'], edge2.inputs['Value'])
    gap = N(nt, 'ShaderNodeMath', operation='MINIMUM'); L(nt, edge.outputs['Result'], gap.inputs[0]); L(nt, edge2.outputs['Result'], gap.inputs[1])
    dark = N(nt, 'ShaderNodeMix', data_type='RGBA'); dark.inputs['B'].default_value = (0.04, 0.025, 0.015, 1)
    inv = N(nt, 'ShaderNodeMath', operation='SUBTRACT'); inv.inputs[0].default_value = 1; L(nt, gap.outputs['Value'], inv.inputs[1])
    L(nt, inv.outputs['Value'], dark.inputs['Factor']); L(nt, hsv.outputs['Color'], dark.inputs['A'])
    L(nt, dark.outputs['Result'], bs.inputs['Base Color'])
    # 흠집·자국
    scr = N(nt, 'ShaderNodeTexNoise'); scr.inputs['Scale'].default_value = 0.35; scr.inputs['Detail'].default_value = 6
    L(nt, tc.outputs['Object'], scr.inputs['Vector'])
    rr = N(nt, 'ShaderNodeMapRange'); rr.inputs['To Min'].default_value = .28; rr.inputs['To Max'].default_value = .55; L(nt, scr.outputs['Fac'], rr.inputs['Value'])
    L(nt, rr.outputs['Result'], bs.inputs['Roughness'])
    bump = N(nt, 'ShaderNodeBump'); bump.inputs['Strength'].default_value = .35; bump.inputs['Distance'].default_value = .02
    bh = N(nt, 'ShaderNodeMath', operation='MULTIPLY'); L(nt, add.outputs['Value'], bh.inputs[0]); L(nt, gap.outputs['Value'], bh.inputs[1])
    L(nt, bh.outputs['Value'], bump.inputs['Height']); L(nt, bump.outputs['Normal'], bs.inputs['Normal'])
    bs.inputs['Coat Weight'].default_value = .25; bs.inputs['Coat Roughness'].default_value = .15
    return m

def mat_skin(name, base, dots, spec=.35, dot_scale=60, bumpst=.15, stripe=None):
    # 과일 껍질 공용: 얼룩 + 반점 + 미세 요철
    m, nt, bs = node_mat(name)
    tc = N(nt, 'ShaderNodeTexCoord')
    n1 = N(nt, 'ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 2.2; n1.inputs['Detail'].default_value = 5; L(nt, tc.outputs['Object'], n1.inputs['Vector'])
    r = ramp(nt, base); L(nt, n1.outputs['Fac'], r.inputs['Fac'])
    col = r.outputs['Color']
    if stripe:
        # 사과 줄무늬: 위아래 방향으로 늘린 노이즈
        sv = N(nt, 'ShaderNodeVectorMath', operation='MULTIPLY'); sv.inputs[1].default_value = (stripe, stripe, .4); L(nt, tc.outputs['Object'], sv.inputs[0])
        n3 = N(nt, 'ShaderNodeTexNoise'); n3.inputs['Scale'].default_value = 1.0; n3.inputs['Detail'].default_value = 4; L(nt, sv.outputs['Vector'], n3.inputs['Vector'])
        r3 = ramp(nt, [(0.35, (0, 0, 0)), (0.65, (1, 1, 1))]); L(nt, n3.outputs['Fac'], r3.inputs['Fac'])
        mx = N(nt, 'ShaderNodeMix', data_type='RGBA'); mx.inputs['B'].default_value = (*hexc('f2c14e'), 1)
        sep = N(nt, 'ShaderNodeSeparateColor'); L(nt, r3.outputs['Color'], sep.inputs['Color'])
        k = N(nt, 'ShaderNodeMath', operation='MULTIPLY'); k.inputs[1].default_value = .12; L(nt, sep.outputs['Red'], k.inputs[0])
        L(nt, k.outputs['Value'], mx.inputs['Factor']); L(nt, col, mx.inputs['A']); col = mx.outputs['Result']
    v = N(nt, 'ShaderNodeTexVoronoi'); v.inputs['Scale'].default_value = dot_scale; L(nt, tc.outputs['Object'], v.inputs['Vector'])
    dr = ramp(nt, [(0.0, (1, 1, 1)), (0.06, (1, 1, 1)), (0.1, (0, 0, 0)), (1.0, (0, 0, 0))]); L(nt, v.outputs['Distance'], dr.inputs['Fac'])
    mx2 = N(nt, 'ShaderNodeMix', data_type='RGBA'); mx2.inputs['B'].default_value = (*dots, 1)
    sep2 = N(nt, 'ShaderNodeSeparateColor'); L(nt, dr.outputs['Color'], sep2.inputs['Color'])
    k2 = N(nt, 'ShaderNodeMath', operation='MULTIPLY'); k2.inputs[1].default_value = .6; L(nt, sep2.outputs['Red'], k2.inputs[0])
    L(nt, k2.outputs['Value'], mx2.inputs['Factor']); L(nt, col, mx2.inputs['A'])
    L(nt, mx2.outputs['Result'], bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value = spec
    b = N(nt, 'ShaderNodeBump'); b.inputs['Strength'].default_value = bumpst
    nb = N(nt, 'ShaderNodeTexNoise'); nb.inputs['Scale'].default_value = dot_scale * 1.3; nb.inputs['Detail'].default_value = 2; L(nt, tc.outputs['Object'], nb.inputs['Vector'])
    L(nt, nb.outputs['Fac'], b.inputs['Height']); L(nt, b.outputs['Normal'], bs.inputs['Normal'])
    return m

def mat_baked_goods(name, crust, inner=None, crack=3.0, rough=.8):
    m, nt, bs = node_mat(name)
    tc = N(nt, 'ShaderNodeTexCoord')
    n1 = N(nt, 'ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 1.6; n1.inputs['Detail'].default_value = 8; n1.inputs['Roughness'].default_value = .65; L(nt, tc.outputs['Object'], n1.inputs['Vector'])
    r = ramp(nt, crust); L(nt, n1.outputs['Fac'], r.inputs['Fac'])
    L(nt, r.outputs['Color'], bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value = rough
    v = N(nt, 'ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE'); v.inputs['Scale'].default_value = crack; L(nt, tc.outputs['Object'], v.inputs['Vector'])
    b = N(nt, 'ShaderNodeBump'); b.inputs['Strength'].default_value = .5; b.inputs['Distance'].default_value = .08
    cm = N(nt, 'ShaderNodeMath', operation='MULTIPLY_ADD'); cm.inputs[1].default_value = .4; L(nt, v.outputs['Distance'], cm.inputs[0]); L(nt, n1.outputs['Fac'], cm.inputs[2])
    L(nt, cm.outputs['Value'], b.inputs['Height']); L(nt, b.outputs['Normal'], bs.inputs['Normal'])
    return m

# ───────── 모델
def make_apple():
    o = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'apple', segments=40, ring_count=24, radius=1)
    for v in o.data.vertices:
        x, y, z = v.co; r = math.sqrt(x*x + y*y)
        # 위·아래 오목, 아래쪽 살짝 좁게
        dip = .28 * math.exp(-(r*r) / .05)
        v.co.z = z * .92 - (dip if z > 0 else -dip * .6)
        k = 1 + .06 * z; v.co.x *= k; v.co.y *= k
    stem = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'stem', vertices=8, radius=.035 * 4 * G, depth=.45 * 4 * G, location=(0, 0, .82 * 4 * G))
    stem.rotation_euler = (.25, 0, 0)
    stem.data.materials.append(simple('stem', hexc('4a3220'), .9))
    o.scale = (4.0 * G,) * 3  # 지름 8cm
    o.data.materials.append(mat_skin('apple_proc', [(0.2, hexc('6e0b10')), (0.5, hexc('a3141b')), (0.8, hexc('c92a22'))], hexc('f0d27a'), spec=.32, dot_scale=26, stripe=6))
    uv_sphere_proj(o); shade(o)
    return o, stem

def make_orange():
    o = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'orange', segments=40, ring_count=24, radius=1)
    for v in o.data.vertices: v.co.z *= .93
    o.scale = (3.75 * G,) * 3  # 지름 7.5cm
    o.data.materials.append(mat_skin('orange_proc', [(0.2, hexc('e2700f')), (0.6, hexc('f28a1a')), (0.9, hexc('f7a531'))], hexc('c85d0a'), spec=.45, dot_scale=90, bumpst=.45))
    uv_sphere_proj(o); shade(o)
    return o

def make_grape():
    o = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'grape', segments=24, ring_count=16, radius=1)
    for v in o.data.vertices: v.co.z *= 1.12
    o.scale = (1.0 * G,) * 3  # 지름 2cm
    m = simple('grape', hexc('3b1446'), .38); m.node_tree.nodes['Principled BSDF'].inputs['Coat Weight'].default_value = .4
    o.data.materials.append(m); shade(o); uv_sphere_proj(o)
    return o

def make_pea():
    o = obj_from(bpy.ops.mesh.primitive_ico_sphere_add, 'pea', subdivisions=3, radius=.6 * G)  # 지름 1.2cm
    o.data.materials.append(simple('pea', hexc('5d9b2b'), .45)); shade(o); uv_sphere_proj(o)
    return o

def make_marble():
    o = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'marble', segments=28, ring_count=18, radius=.8 * G)  # 1.6cm
    m = simple('marble_glass', hexc('bfe6ff'), .03, trans=1.0, ior=1.5); o.data.materials.append(m)
    core = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'marble_core', segments=16, ring_count=10, radius=.45 * G)
    core.scale = (1, .25, 1); core.data.materials.append(simple('marble_core', hexc('1f6fe0'), .3))
    shade(o); shade(core)
    return o, core

def make_button():
    o = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'button', vertices=40, radius=1.1 * G, depth=.35 * G)  # 지름 2.2cm
    md = o.modifiers.new('bev', 'BEVEL'); md.width = .12 * G; md.segments = 4; apply_mods(o)
    # 구멍 4개
    holes = []
    for dx, dy in [(-.22, -.22), (.22, -.22), (-.22, .22), (.22, .22)]:
        h = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'h', vertices=12, radius=.11 * G, depth=1 * G, location=(dx * G, dy * G, 0)); holes.append(h)
    for h in holes:
        md = o.modifiers.new('b', 'BOOLEAN'); md.object = h; md.operation = 'DIFFERENCE'; apply_mods(o); bpy.data.objects.remove(h)
    o.data.materials.clear(); o.data.materials.append(simple('button', hexc('d8362f'), .3, clear=.6)); shade(o, angle=35)
    return o

def make_coin():
    o = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'coin', vertices=48, radius=1.3 * G, depth=.18 * G)  # 500원 2.65cm
    md = o.modifiers.new('bev', 'BEVEL'); md.width = .05 * G; md.segments = 2; apply_mods(o)
    m, nt, bs = node_mat('coin_proc')
    bs.inputs['Base Color'].default_value = (*hexc('c9ccd1'), 1); bs.inputs['Metallic'].default_value = 1; bs.inputs['Roughness'].default_value = .28
    tc = N(nt, 'ShaderNodeTexCoord'); nz = N(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 40; nz.inputs['Detail'].default_value = 6; L(nt, tc.outputs['Object'], nz.inputs['Vector'])
    rr = N(nt, 'ShaderNodeMapRange'); rr.inputs['To Min'].default_value = .18; rr.inputs['To Max'].default_value = .42; L(nt, nz.outputs['Fac'], rr.inputs['Value']); L(nt, rr.outputs['Result'], bs.inputs['Roughness'])
    # 테두리 홈 + 가운데 무늬(원 고리)
    wv = N(nt, 'ShaderNodeTexWave', wave_type='RINGS'); wv.inputs['Scale'].default_value = 1.4; L(nt, tc.outputs['Object'], wv.inputs['Vector'])
    b = N(nt, 'ShaderNodeBump'); b.inputs['Strength'].default_value = .25; L(nt, wv.outputs['Fac'], b.inputs['Height']); L(nt, b.outputs['Normal'], bs.inputs['Normal'])
    o.data.materials.append(m); uv_smart(o); shade(o, angle=30)
    return o

def make_sugar():
    o = obj_from(bpy.ops.mesh.primitive_cube_add, 'sugar', size=1.6 * G)
    md = o.modifiers.new('bev', 'BEVEL'); md.width = .08 * G; md.segments = 2; apply_mods(o)
    bpy.context.view_layer.objects.active = o
    md = o.modifiers.new('sub', 'SUBSURF'); md.levels = 1; apply_mods(o)
    m, nt, bs = node_mat('sugar_proc'); tc = N(nt, 'ShaderNodeTexCoord')
    v = N(nt, 'ShaderNodeTexVoronoi'); v.inputs['Scale'].default_value = 60; L(nt, tc.outputs['Object'], v.inputs['Vector'])
    r = ramp(nt, [(0.0, hexc('ffffff')), (0.7, hexc('e9e6df')), (1, hexc('cfcac0'))]); L(nt, v.outputs['Distance'], r.inputs['Fac']); L(nt, r.outputs['Color'], bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value = .7
    b = N(nt, 'ShaderNodeBump'); b.inputs['Strength'].default_value = .8; L(nt, v.outputs['Distance'], b.inputs['Height']); L(nt, b.outputs['Normal'], bs.inputs['Normal'])
    o.data.materials.append(m); uv_smart(o); shade(o, angle=30)
    return o

def make_cookie():
    o = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'cookie', vertices=40, radius=3 * G, depth=.8 * G)  # 지름 6cm
    md = o.modifiers.new('bev', 'BEVEL'); md.width = .35 * G; md.segments = 4; apply_mods(o)
    md = o.modifiers.new('sub', 'SUBSURF'); md.levels = 1; apply_mods(o)
    for v in o.data.vertices: v.co += v.normal * random.uniform(-.04, .04) * G * 2
    o.data.materials.append(mat_baked_goods('cookie_proc', [(0.25, hexc('9a5a24')), (0.6, hexc('c98a45')), (0.9, hexc('e0b06a'))], crack=1.2))
    chips = []
    for i in range(9):
        a = random.uniform(0, 6.28); r = random.uniform(0, 2.3) * G
        c = obj_from(bpy.ops.mesh.primitive_ico_sphere_add, 'chip', subdivisions=1, radius=random.uniform(.28, .45) * G, location=(math.cos(a) * r, math.sin(a) * r, .38 * G))
        c.scale.z = .6; chips.append(c)
    choc = simple('choc', hexc('2e1a10'), .5)
    for c in chips: c.data.materials.append(choc)
    uv_smart(o); shade(o)
    return o, chips

def make_tomato():
    o = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'tomato', segments=32, ring_count=20, radius=1.5 * G)  # 방울토마토 3cm
    for v in o.data.vertices: v.co.z *= .9
    o.data.materials.append(simple('tomato', hexc('d4231c'), .18, clear=.5))
    cal = obj_from(bpy.ops.mesh.primitive_cone_add, 'calyx', vertices=5, radius1=.7 * G, depth=.15 * G, location=(0, 0, 1.38 * G))
    cal.data.materials.append(simple('leaf', hexc('3f7a22'), .6))
    shade(o); uv_sphere_proj(o)
    return o, cal

def make_watermelon():
    # 추격용 큰 수박(지름 25cm → 10): 줄무늬를 위아래 방향으로 굽는다
    o = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'watermelon', segments=48, ring_count=28, radius=1)
    for v in o.data.vertices: v.co.x *= 1.0; v.co.y *= 1.12
    o.scale = (12.5 * G,) * 3
    m, nt, bs = node_mat('melon_proc'); tc = N(nt, 'ShaderNodeTexCoord')
    # 줄무늬: 각도(atan2) 기반 + 노이즈로 들쭉날쭉
    sep = N(nt, 'ShaderNodeSeparateXYZ'); L(nt, tc.outputs['Object'], sep.inputs['Vector'])
    at = N(nt, 'ShaderNodeMath', operation='ARCTAN2'); L(nt, sep.outputs['Z'], at.inputs[0]); L(nt, sep.outputs['X'], at.inputs[1])
    nz = N(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 4.0; nz.inputs['Detail'].default_value = 6; L(nt, tc.outputs['Object'], nz.inputs['Vector'])
    ad = N(nt, 'ShaderNodeMath', operation='MULTIPLY_ADD'); ad.inputs[1].default_value = .9; L(nt, nz.outputs['Fac'], ad.inputs[0]); L(nt, at.outputs['Value'], ad.inputs[2])
    sn = N(nt, 'ShaderNodeMath', operation='SINE'); mul = N(nt, 'ShaderNodeMath', operation='MULTIPLY'); mul.inputs[1].default_value = 8.0
    L(nt, ad.outputs['Value'], mul.inputs[0]); L(nt, mul.outputs['Value'], sn.inputs[0])
    st = ramp(nt, [(0.0, hexc('1f4d1a')), (0.45, hexc('24561c')), (0.62, hexc('5e9a3a')), (1.0, hexc('6fae45'))]); 
    mr = N(nt, 'ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -1; L(nt, sn.outputs['Value'], mr.inputs['Value']); L(nt, mr.outputs['Result'], st.inputs['Fac'])
    fine = N(nt, 'ShaderNodeTexNoise'); fine.inputs['Scale'].default_value = 25; fine.inputs['Detail'].default_value = 4; L(nt, tc.outputs['Object'], fine.inputs['Vector'])
    hv = N(nt, 'ShaderNodeHueSaturation'); L(nt, st.outputs['Color'], hv.inputs['Color'])
    vm = N(nt, 'ShaderNodeMapRange'); vm.inputs['To Min'].default_value = .85; vm.inputs['To Max'].default_value = 1.1; L(nt, fine.outputs['Fac'], vm.inputs['Value']); L(nt, vm.outputs['Result'], hv.inputs['Value'])
    L(nt, hv.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = .35; bs.inputs['Coat Weight'].default_value = .3
    b = N(nt, 'ShaderNodeBump'); b.inputs['Strength'].default_value = .12; L(nt, fine.outputs['Fac'], b.inputs['Height']); L(nt, b.outputs['Normal'], bs.inputs['Normal'])
    o.data.materials.append(m); uv_sphere_proj(o); shade(o)
    return o

def make_star():
    # 손 뻗어 잡는 보물: 금빛 별(지름 4cm), 모서리 둥글게
    bm = bmesh.new(); R1, R2 = 2.0 * G, .9 * G; vs = []
    for i in range(10):
        a = math.pi / 2 + i * math.pi / 5; r = R1 if i % 2 == 0 else R2
        vs.append(bm.verts.new((math.cos(a) * r, 0, math.sin(a) * r)))
    f = bm.faces.new(vs); ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]: v.co.y += .7 * G
    me = bpy.data.meshes.new('star'); bm.to_mesh(me); o = bpy.data.objects.new('star', me); bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    md = o.modifiers.new('bev', 'BEVEL'); md.width = .3 * G; md.segments = 4; apply_mods(o)
    for v in o.data.vertices: v.co.y -= .35 * G
    o.data.materials.append(simple('gold', hexc('ffc93c'), .22, metal=1.0)); shade(o, angle=40)
    return o

def make_candy():
    # 사탕: 동그란 알 + 비틀린 포장 양 끝(지름 3cm)
    o = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'candy', segments=32, ring_count=18, radius=1.5 * G)
    m, nt, bs = node_mat('candy_proc'); tc = N(nt, 'ShaderNodeTexCoord')
    wv = N(nt, 'ShaderNodeTexWave', wave_type='BANDS', bands_direction='DIAGONAL'); wv.inputs['Scale'].default_value = 1.2; L(nt, tc.outputs['Object'], wv.inputs['Vector'])
    r = ramp(nt, [(0.45, hexc('ff3d6e')), (0.55, hexc('fff4f6'))]); L(nt, wv.outputs['Fac'], r.inputs['Fac']); L(nt, r.outputs['Color'], bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value = .12; bs.inputs['Coat Weight'].default_value = 1.0
    o.data.materials.append(m); uv_sphere_proj(o); shade(o)
    wraps = []
    for sx in (-1, 1):
        c = obj_from(bpy.ops.mesh.primitive_cone_add, 'wrap', vertices=10, radius1=.2 * G, radius2=1.2 * G, depth=1.8 * G, location=(sx * 2.2 * G, 0, 0), rotation=(0, sx * math.pi / 2, 0))
        md = c.modifiers.new('tw', 'SIMPLE_DEFORM'); md.deform_method = 'TWIST'; md.angle = 1.2; apply_mods(c)
        c.data.materials.append(simple('wrapper', hexc('ffd6e4'), .2, trans=.4)); shade(c); wraps.append(c)
    return o, wraps

def make_heart():
    # 하트 젤리(4cm): 반투명 빨강
    bm = bmesh.new(); pts = []
    for i in range(48):
        t = i / 48 * math.pi * 2; x = 16 * math.sin(t) ** 3; z = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append(bm.verts.new((x * .12 * G, 0, z * .12 * G)))
    f = bm.faces.new(pts); ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]: v.co.y += 1.0 * G
    me = bpy.data.meshes.new('heart'); bm.to_mesh(me); o = bpy.data.objects.new('heart', me); bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    md = o.modifiers.new('bev', 'BEVEL'); md.width = .45 * G; md.segments = 5; apply_mods(o)
    for v in o.data.vertices: v.co.y -= .5 * G
    o.data.materials.append(simple('jelly', hexc('ff2d55'), .08, trans=.7, ior=1.35)); shade(o, angle=60)
    return o

def make_plate():
    # 접시: 단면 회전
    prof = [(0, 0), (8.5, 0), (9.2, .35), (11.5, 1.6), (13.5, 2.1), (13.6, 2.4), (11.4, 1.95), (9.0, .75), (0, .62)]
    bm = bmesh.new(); vs = [bm.verts.new((x * G, 0, z * G)) for x, z in prof]
    for a, b in zip(vs, vs[1:]): bm.edges.new((a, b))
    me = bpy.data.meshes.new('plate'); bm.to_mesh(me); o = bpy.data.objects.new('plate', me); bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    md = o.modifiers.new('sc', 'SCREW'); md.steps = 64; md.render_steps = 64; md.use_merge_vertices = True; apply_mods(o)
    m = simple('ceramic', hexc('f4f1ea'), .12, clear=.8)
    o.data.materials.append(m); shade(o, angle=40)
    # 테두리 파란 선
    ring = obj_from(bpy.ops.mesh.primitive_torus_add, 'plate_rim', major_radius=12.6 * G, minor_radius=.09 * G, location=(0, 0, 1.95 * G))
    ring.data.materials.append(simple('blue_line', hexc('2c4f8c'), .2))
    return o, ring

def make_mug():
    o = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'mug', vertices=48, radius=4.3 * G, depth=10 * G, location=(0, 0, 5 * G))
    md = o.modifiers.new('sol', 'SOLIDIFY'); md.thickness = .45 * G
    bpy.context.view_layer.objects.active = o; bpy.ops.object.mode_set(mode='EDIT'); bm = bmesh.from_edit_mesh(o.data)
    top = [f for f in bm.faces if f.normal.z > .9]; bmesh.ops.delete(bm, geom=top, context='FACES'); bmesh.update_edit_mesh(o.data); bpy.ops.object.mode_set(mode='OBJECT')
    apply_mods(o); md = o.modifiers.new('bev', 'BEVEL'); md.width = .15 * G; md.segments = 3; md.limit_method = 'ANGLE'; apply_mods(o)
    h = obj_from(bpy.ops.mesh.primitive_torus_add, 'handle', major_radius=2.6 * G, minor_radius=.55 * G, location=(4.8 * G, 0, 5.2 * G), rotation=(math.pi / 2, 0, 0))
    h.scale = (.85, 1.2, 1)
    m = simple('mug', hexc('2f6d8f'), .18, clear=.9)
    for x in (o, h): x.data.materials.append(m)
    cocoa = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'cocoa', vertices=48, radius=3.85 * G, depth=.1 * G, location=(0, 0, 8.6 * G))
    cocoa.data.materials.append(simple('cocoa', hexc('5a3420'), .15))
    shade(o, angle=40); shade(h)
    return o, h, cocoa

def make_glass_milk():
    o = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'glass', vertices=40, radius=3.4 * G, depth=12 * G, location=(0, 0, 6 * G))
    md = o.modifiers.new('sol', 'SOLIDIFY'); md.thickness = .25 * G
    bpy.context.view_layer.objects.active = o; bpy.ops.object.mode_set(mode='EDIT'); bm = bmesh.from_edit_mesh(o.data)
    top = [f for f in bm.faces if f.normal.z > .9]; bmesh.ops.delete(bm, geom=top, context='FACES'); bmesh.update_edit_mesh(o.data); bpy.ops.object.mode_set(mode='OBJECT')
    apply_mods(o)
    o.data.materials.append(simple('glass', hexc('eef6ff'), .02, trans=1.0, ior=1.45))
    milk = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'milk', vertices=40, radius=3.12 * G, depth=8 * G, location=(0, 0, 4.25 * G))
    milk.data.materials.append(simple('milk', hexc('f7f5ee'), .25))
    shade(o); shade(milk)
    return o, milk

def make_bread():
    o = obj_from(bpy.ops.mesh.primitive_cube_add, 'bread', size=1)
    o.scale = (10 * G, 24 * G, 9 * G)
    md = o.modifiers.new('sub', 'SUBSURF'); md.levels = 3; apply_mods(o)
    for v in o.data.vertices:
        if v.co.z > 0: v.co.z += .18 * (1 - (v.co.x * 2) ** 2)
        v.co.z += .5
    bpy.context.view_layer.objects.active = o; bpy.ops.object.transform_apply(scale=True)
    # 칼집
    for i in range(4):
        y = (-7.5 + i * 5) * G
        c = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'cut', vertices=12, radius=.8 * G, depth=12 * G, location=(0, y, 9.6 * G), rotation=(0, math.pi / 2, .5))
        md = o.modifiers.new('b', 'BOOLEAN'); md.object = c; md.operation = 'DIFFERENCE'; apply_mods(o); bpy.data.objects.remove(c)
    for v in o.data.vertices: v.co += v.normal * random.uniform(-.03, .03)
    o.data.materials.append(mat_baked_goods('bread_proc', [(0.2, hexc('8a5424')), (0.5, hexc('c08043')), (0.85, hexc('e6bd7e'))], crack=.35, rough=.85))
    uv_smart(o); shade(o)
    return o

def make_cheese():
    bm = bmesh.new(); R = 11 * G; H = 6 * G; ang = math.radians(38)
    pts = [(0, 0)] + [(R * math.cos(-ang / 2 + ang * i / 8), R * math.sin(-ang / 2 + ang * i / 8)) for i in range(9)]
    bot = [bm.verts.new((x, y, 0)) for x, y in pts]; top = [bm.verts.new((x, y, H)) for x, y in pts]
    bm.faces.new(bot[::-1]); bm.faces.new(top)
    n = len(pts)
    for i in range(n): bm.faces.new((bot[i], bot[(i + 1) % n], top[(i + 1) % n], top[i]))
    me = bpy.data.meshes.new('cheese'); bm.to_mesh(me); o = bpy.data.objects.new('cheese', me); bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    md = o.modifiers.new('bev', 'BEVEL'); md.width = .2 * G; md.segments = 3; apply_mods(o)
    md = o.modifiers.new('rem', 'REMESH'); md.mode = 'VOXEL'; md.voxel_size = .25 * G; apply_mods(o)
    for i in range(10):
        p = Vector((random.uniform(3, 10) * G, random.uniform(-2.5, 2.5) * G, random.uniform(.5, 5.5) * G))
        s = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'hole', segments=12, ring_count=8, radius=random.uniform(.5, 1.2) * G, location=p)
        md = o.modifiers.new('b', 'BOOLEAN'); md.object = s; md.operation = 'DIFFERENCE'; apply_mods(o); bpy.data.objects.remove(s)
    md = o.modifiers.new('dec', 'DECIMATE'); md.ratio = .35; apply_mods(o)
    o.data.materials.append(mat_skin('cheese_proc', [(0.2, hexc('e9b53c')), (0.6, hexc('f2c64f')), (0.9, hexc('f6d36b'))], hexc('e3a72f'), spec=.55, dot_scale=12, bumpst=.08))
    uv_smart(o); shade(o, angle=40)
    return o

def make_cutlery():
    steel = simple('steel', hexc('d6d9de'), .16, metal=1.0)
    parts = []
    # 포크: 손잡이 + 목 + 날 4
    f = obj_from(bpy.ops.mesh.primitive_cube_add, 'fork_handle', size=1); f.scale = (1.2 * G, 11 * G, .3 * G); f.location = (0, -4 * G, .15 * G)
    nk = obj_from(bpy.ops.mesh.primitive_cube_add, 'fork_neck', size=1); nk.scale = (2.0 * G, 3 * G, .25 * G); nk.location = (0, 3 * G, .5 * G); nk.rotation_euler.x = .15
    tines = []
    for i in range(4):
        t = obj_from(bpy.ops.mesh.primitive_cube_add, 'tine', size=1); t.scale = (.28 * G, 4.5 * G, .22 * G); t.location = ((-.75 + i * .5) * G, 6.8 * G, .85 * G); t.rotation_euler.x = .12; tines.append(t)
    fork = join([f, nk] + tines, 'fork'); md = fork.modifiers.new('bev', 'BEVEL'); md.width = .08 * G; md.segments = 2; apply_mods(fork)
    # 숟가락
    sh = obj_from(bpy.ops.mesh.primitive_cube_add, 'spoon_handle', size=1); sh.scale = (1.1 * G, 12 * G, .28 * G); sh.location = (0, -4.5 * G, .14 * G)
    bowl = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'spoon_bowl', segments=24, ring_count=12, radius=1); bowl.scale = (2.0 * G, 3.0 * G, .7 * G); bowl.location = (0, 4.5 * G, .7 * G)
    bpy.context.view_layer.objects.active = bowl; bpy.ops.object.mode_set(mode='EDIT'); bm = bmesh.from_edit_mesh(bowl.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > .2], context='VERTS'); bmesh.update_edit_mesh(bowl.data); bpy.ops.object.mode_set(mode='OBJECT')
    md = bowl.modifiers.new('sol', 'SOLIDIFY'); md.thickness = .25; apply_mods(bowl)
    spoon = join([sh, bowl], 'spoon')
    # 칼
    kh = obj_from(bpy.ops.mesh.primitive_cube_add, 'knife_handle', size=1); kh.scale = (1.4 * G, 10 * G, .45 * G); kh.location = (0, -5 * G, .22 * G)
    kb = obj_from(bpy.ops.mesh.primitive_cube_add, 'knife_blade', size=1); kb.scale = (2.0 * G, 11 * G, .12 * G); kb.location = (.2 * G, 5.5 * G, .1 * G)
    knife = join([kh, kb], 'knife'); md = knife.modifiers.new('bev', 'BEVEL'); md.width = .1 * G; md.segments = 2; apply_mods(knife)
    for o in (fork, spoon, knife): o.data.materials.clear(); o.data.materials.append(steel); shade(o, angle=40)
    return fork, spoon, knife

def make_jar():
    o = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'jar', vertices=40, radius=3.6 * G, depth=9 * G, location=(0, 0, 4.5 * G))
    md = o.modifiers.new('bev', 'BEVEL'); md.width = .8 * G; md.segments = 4; apply_mods(o)
    o.data.materials.append(simple('jam_glass', hexc('a01828'), .05, trans=.6, ior=1.45))
    lid = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'lid', vertices=40, radius=3.7 * G, depth=1.6 * G, location=(0, 0, 9.6 * G))
    md = lid.modifiers.new('bev', 'BEVEL'); md.width = .3 * G; md.segments = 3; apply_mods(lid)
    m, nt, bs = node_mat('lid_check'); tc = N(nt, 'ShaderNodeTexCoord')
    ch = N(nt, 'ShaderNodeTexChecker'); ch.inputs['Scale'].default_value = 3.5; ch.inputs['Color1'].default_value = (*hexc('c8202a'), 1); ch.inputs['Color2'].default_value = (*hexc('f4efe6'), 1)
    L(nt, tc.outputs['Object'], ch.inputs['Vector']); L(nt, ch.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = .8
    lid.data.materials.append(m); shade(o); shade(lid, angle=40); uv_smart(lid)
    return o, lid

def make_shaker():
    o = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'shaker', vertices=32, radius=2 * G, depth=7 * G, location=(0, 0, 3.5 * G))
    o.data.materials.append(simple('shaker_glass', hexc('f2f6fa'), .05, trans=.9))
    cap = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'cap', segments=24, ring_count=12, radius=2.05 * G, location=(0, 0, 7 * G)); cap.scale.z = .55
    cap.data.materials.append(simple('steel2', hexc('cfd3d8'), .2, metal=1))
    salt = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'salt', vertices=32, radius=1.8 * G, depth=4.5 * G, location=(0, 0, 2.4 * G))
    salt.data.materials.append(simple('salt', hexc('f8f8f6'), .8))
    shade(o); shade(cap)
    return o, cap, salt

def make_napkin():
    o = obj_from(bpy.ops.mesh.primitive_grid_add, 'napkin', x_subdivisions=40, y_subdivisions=40, size=20 * G)
    for v in o.data.vertices:
        x, y = v.co.x, v.co.y
        v.co.z = .25 * G + .35 * G * (math.sin(x * 1.3 + y * .4) * .5 + math.sin(y * 2.1) * .3) + max(0, .6 * G - abs(x) * .1)
        v.co.z = max(.05 * G, v.co.z)
    md = o.modifiers.new('sol', 'SOLIDIFY'); md.thickness = .1 * G; apply_mods(o)
    m, nt, bs = node_mat('napkin_proc'); tc = N(nt, 'ShaderNodeTexCoord')
    br = N(nt, 'ShaderNodeTexChecker'); br.inputs['Scale'].default_value = 1.2; br.inputs['Color1'].default_value = (*hexc('f1e6cf'), 1); br.inputs['Color2'].default_value = (*hexc('8fb7d9'), 1)
    L(nt, tc.outputs['Object'], br.inputs['Vector']); L(nt, br.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = .95
    weave = N(nt, 'ShaderNodeTexWave', wave_type='BANDS'); weave.inputs['Scale'].default_value = 60
    L(nt, tc.outputs['Object'], weave.inputs['Vector'])
    b = N(nt, 'ShaderNodeBump'); b.inputs['Strength'].default_value = .3; L(nt, weave.outputs['Fac'], b.inputs['Height']); L(nt, b.outputs['Normal'], bs.inputs['Normal'])
    o.data.materials.append(m); uv_smart(o); shade(o)
    return o

def finish(o, parts=()):
    # 부품을 합쳐 한 물체로, 바닥 0, 이름 고정
    if parts:
        name = o.name; o = join([o] + list(parts), name)
    to_origin_floor(o)
    return o

def export(objs, path):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_apply=True,
                              export_image_format='JPEG', export_jpeg_quality=85, export_materials='EXPORT')
    print('GLB', path, os.path.getsize(path) // 1024, 'KB')

# ───────── 묶음: 물건(장애물·식탁 소품)
def build_props():
    sc = reset()
    out = []
    a, st = make_apple(); bake(a, 512, 'apple'); out.append(finish(a, [st]))
    o = make_orange(); bake(o, 512, 'orange'); out.append(finish(o))
    out.append(finish(make_grape()))
    out.append(finish(make_pea()))
    m, c = make_marble(); out.append(finish(m, [c]))
    out.append(finish(make_button()))
    o = make_coin(); bake(o, 256, 'coin'); out.append(finish(o))
    o = make_sugar(); bake(o, 256, 'sugar'); out.append(finish(o))
    o, chips = make_cookie(); bake(o, 512, 'cookie'); out.append(finish(o, chips))
    t, cal = make_tomato(); out.append(finish(t, [cal]))
    p, r = make_plate(); out.append(finish(p, [r]))
    mg, h, cc = make_mug(); out.append(finish(mg, [h, cc]))
    gl, mk = make_glass_milk(); out.append(finish(gl, [mk]))
    o = make_bread(); bake(o, 1024, 'bread'); out.append(finish(o))
    o = make_cheese(); bake(o, 512, 'cheese'); out.append(finish(o))
    f, s, k = make_cutlery(); out += [finish(f), finish(s), finish(k)]
    j, lid = make_jar(); bake(lid, 256, 'lid'); out.append(finish(j, [lid]))
    sh, cap, salt = make_shaker(); out.append(finish(sh, [cap, salt]))
    o = make_napkin(); bake(o, 512, 'napkin'); out.append(finish(o))
    o = make_watermelon(); bake(o, 1024, 'watermelon'); out.append(finish(o))
    out.append(finish(make_star()))
    c, w = make_candy(); out.append(finish(c, w))
    out.append(finish(make_heart()))
    # 나란히 놓아 미리보기용으로도 쓸 수 있게 x 로 벌림
    x = 0
    for o in out: o.location.x = x; x += 14
    export(out, os.path.join(OUT, 'props.glb'))
    for o in out: o.location.x = 0
    return out

# ───────── 묶음: 식탁 상판(판자 나뭇결 굽기)
def build_table():
    sc = reset()
    W, Lh = 36.0, 60.0
    o = obj_from(bpy.ops.mesh.primitive_plane_add, 'table', size=1); o.scale = (W, Lh, 1)
    bpy.ops.object.transform_apply(scale=True)
    # 판자 방향이 길이(y)를 따르도록: 재질은 x 로 판자를 나누므로 그대로
    o.data.materials.append(mat_wood())
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.uv.reset(); bpy.ops.object.mode_set(mode='OBJECT')
    # 결 방향: wave 는 X 밴드 → 판자 길이(y)를 따라 늘림
    bake(o, 2048, 'table')
    print('table baked')

# ───────── 배경: 거인 부엌 파노라마(Cycles 등장방형)
def build_env(samples=48, w=2048):
    sc = reset()
    sc.cycles.samples = samples; sc.cycles.use_denoising = True
    try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    sc.render.resolution_x = w; sc.render.resolution_y = w // 2
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast' if 'AgX - Medium High Contrast' in [l.identifier for l in bpy.types.ColorManagedViewSettings.bl_rna.properties['look'].enum_items] else 'None'
    sc.render.film_transparent = False
    world = bpy.data.worlds.new('w'); sc.world = world; world.use_nodes = True
    world.node_tree.nodes['Background'].inputs['Color'].default_value = (*hexc('cfe3f5'), 1); world.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.2
    # 실제 미터 단위 부엌 (가로 5 × 세로 6, 높이 2.7), 식탁 위 0.78 에 카메라
    def box(name, loc, size, mat, rot=(0, 0, 0)):
        b = obj_from(bpy.ops.mesh.primitive_cube_add, name, size=1, location=loc, rotation=rot); b.scale = size; b.data.materials.append(mat)
        md = b.modifiers.new('bev', 'BEVEL'); md.width = min(size) * .04 if min(size) > 0 else .01; md.segments = 2
        return b
    wall = simple('wall', hexc('efe6d6'), .9); floor = simple('floor', hexc('9c7350'), .5)
    cab = simple('cab', hexc('6f8f7a'), .45, clear=.2); counter = simple('counter', hexc('e9e4dc'), .3); steelm = simple('steelk', hexc('c9ccd0'), .25, metal=1)
    woodm = simple('woodk', hexc('8a5a34'), .55)
    # 바닥·벽·천장
    box('floor', (0, 0, -.01), (5, 6, .02), floor); box('ceil', (0, 0, 2.71), (5, 6, .02), wall)
    box('wN', (0, 3.0, 1.35), (5, .05, 2.7), wall); box('wS', (0, -3.0, 1.35), (5, .05, 2.7), wall)
    box('wE', (2.5, 0, 1.35), (.05, 6, 2.7), wall); box('wW', (-2.5, 0, 1.35), (.05, 6, 2.7), wall)
    # 큰 창(북쪽, 달려가는 방향): 바깥 빛
    win = obj_from(bpy.ops.mesh.primitive_plane_add, 'window', size=1, location=(0, 2.96, 1.55), rotation=(math.pi / 2, 0, 0)); win.scale = (2.2, 1.4, 1)
    em, nt, bs = node_mat('sky_out'); nt.nodes.remove(bs); e = N(nt, 'ShaderNodeEmission'); e.inputs['Strength'].default_value = 6.0
    gr = N(nt, 'ShaderNodeTexGradient'); tc = N(nt, 'ShaderNodeTexCoord'); mp = N(nt, 'ShaderNodeMapping'); mp.inputs['Rotation'].default_value = (0, 0, math.pi / 2)
    L(nt, tc.outputs['UV'], mp.inputs['Vector']); L(nt, mp.outputs['Vector'], gr.inputs['Vector'])
    rr = ramp(nt, [(0.0, hexc('dbeeff')), (0.6, hexc('9cc8ef')), (1.0, hexc('6aa7e0'))]); L(nt, gr.outputs['Fac'], rr.inputs['Fac']); L(nt, rr.outputs['Color'], e.inputs['Color'])
    L(nt, e.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface'])
    win.data.materials.append(em)
    for x in (-1.1, 0, 1.1): box('mull', (x, 2.93, 1.55), (.05, .05, 1.42), simple('frame', hexc('f7f4ee'), .5))
    box('mullH', (0, 2.93, 1.55), (2.25, .05, .05), simple('frame2', hexc('f7f4ee'), .5))
    box('sill', (0, 2.88, .82), (2.4, .18, .05), woodm)
    # 창밖 나무 실루엣 느낌: 창 바로 뒤 초록 덩이
    for i in range(6):
        t = obj_from(bpy.ops.mesh.primitive_ico_sphere_add, 'tree', subdivisions=2, radius=random.uniform(.35, .6), location=(random.uniform(-1, 1), 3.4, random.uniform(.9, 1.7)))
        t.data.materials.append(simple('leafo', hexc('6f9e5a'), .8))
    # 해 들어오는 빛
    sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 3.5; sun.angle = math.radians(3); sun.color = hexc('fff1dc')
    so = bpy.data.objects.new('sun', sun); bpy.context.collection.objects.link(so); so.rotation_euler = (math.radians(60), 0, math.radians(165))
    area = bpy.data.lights.new('fill', 'AREA'); area.energy = 600; area.size = 2.2; area.color = hexc('dcebff')
    ao = bpy.data.objects.new('fill', area); bpy.context.collection.objects.link(ao); ao.location = (0, 2.7, 1.55); ao.rotation_euler = (math.radians(90), 0, 0)
    # 동쪽 벽: 싱크대 하부장·상부장·냉장고
    for i in range(4):
        box(f'base{i}', (2.2, -1.8 + i * .62, .44), (.6, .6, .86), cab)
        box(f'knob{i}', (1.88, -1.8 + i * .62, .75), (.03, .12, .02), steelm)
        box(f'up{i}', (2.33, -1.8 + i * .62, 1.95), (.34, .6, .75), cab)
    box('counterE', (2.2, -.87, .89), (.64, 2.6, .04), counter)
    box('fridge', (2.15, 1.55, .95), (.7, .8, 1.9), simple('fridge', hexc('e8e9ea'), .2, clear=.6))
    box('fhandle', (1.78, 1.25, 1.2), (.03, .03, .6), steelm)
    # 서쪽 벽: 시계·액자·선반
    clk = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'clock', vertices=48, radius=.22, depth=.05, location=(-2.45, .6, 2.0), rotation=(0, math.pi / 2, 0)); clk.data.materials.append(simple('clockf', hexc('f9f6ef'), .4))
    for k, (ln, ang) in enumerate([(.15, .5), (.1, 2.2)]):
        hd = box(f'hand{k}', (-2.42, .6 + math.sin(ang) * ln / 2, 2.0 + math.cos(ang) * ln / 2), (.01, .012, ln), simple('blk', hexc('202020'), .5), rot=(-ang, 0, 0))
    fr = box('frame', (-2.46, -1.2, 1.6), (.03, .7, .5), woodm); box('art', (-2.44, -1.2, 1.6), (.01, .6, .4), simple('art', hexc('d9a35a'), .7))
    box('shelf', (-2.35, 1.8, 1.4), (.25, 1.0, .03), woodm)
    for i in range(5): box(f'jar{i}', (-2.33, 1.4 + i * .2, 1.5), (.1, .1, .16 + (i % 2) * .05), simple(f'j{i}', [hexc('c84a3a'), hexc('e8c45a'), hexc('6aa67a')][i % 3], .3))
    # 식탁(카메라가 그 위): 상판은 배경에선 아주 가까워 흐릿하게만, 다리·의자
    box('tabletop', (0, 0, .76), (1.6, 3.0, .04), woodm)
    for sx in (-1, 1):
        for sy in (-1, 1): box('leg', (sx * .72, sy * 1.4, .37), (.06, .06, .74), woodm)
    for sx in (-1, 1):
        for sy in (-.6, .6):
            box('seat', (sx * 1.05, sy, .45), (.42, .42, .04), woodm); box('back', (sx * 1.24, sy, .72), (.04, .4, .55), woodm)
    # 펜던트 등
    lamp = obj_from(bpy.ops.mesh.primitive_cone_add, 'lamp', vertices=40, radius1=.28, radius2=.05, depth=.25, location=(0, .6, 2.0)); lamp.data.materials.append(simple('lampm', hexc('2f3b46'), .4))
    cord = box('cord', (0, .6, 2.4), (.01, .01, .6), simple('cordm', hexc('111111'), .5))
    bulb = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'bulb', segments=16, ring_count=8, radius=.06, location=(0, .6, 1.87))
    bm_, nt2, b2 = node_mat('bulbm'); b2.inputs['Emission Color'].default_value = (*hexc('ffd9a0'), 1); b2.inputs['Emission Strength'].default_value = 20; bulb.data.materials.append(bm_)
    pl = bpy.data.lights.new('lampL', 'POINT'); pl.energy = 60; pl.color = hexc('ffd9a0'); po = bpy.data.objects.new('lampL', pl); bpy.context.collection.objects.link(po); po.location = (0, .6, 1.8)
    # 카메라: 식탁 위 4cm, 파노라마
    cam = bpy.data.cameras.new('cam'); cam.type = 'PANO'
    try: cam.panorama_type = 'EQUIRECTANGULAR'
    except Exception: cam.cycles.panorama_type = 'EQUIRECTANGULAR'
    cam.clip_start = .002
    co = bpy.data.objects.new('cam', cam); bpy.context.collection.objects.link(co); sc.camera = co
    co.location = (0, -.6, .82); co.rotation_euler = (math.pi / 2, 0, 0)  # -> +y 가 화면 가운데(진행 방향)
    sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 88
    sc.render.filepath = os.path.join(TEX, 'kitchen_pano.jpg')
    bpy.ops.render.render(write_still=True)
    print('env', sc.render.filepath)

if __name__ == '__main__':
    what = sys.argv[-1] if len(sys.argv) > 1 else 'all'
    if what in ('props', 'all'): build_props()
    if what in ('table', 'all'): build_table()
    if what in ('env', 'all'): build_env()

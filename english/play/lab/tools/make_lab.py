"""마법 연구소 실험대와 물건 넷(사과 · 컵 · 의자 · 공) · 지팡이를 블렌더로 빚는다(3단계). 받아 온 모형 없음.
실행(화면 없이):  blender -b --python english/play/lab/tools/make_lab.py   → english/play/lab/assets/lab.glb
물체 이름이 약속이다: room(실험대 · 벽 선반 · 병 · 책 · 창 — 제자리에 놓인 채로) / apple · cup · chair · ball · wand · jar(원점에 — 놀이가 자리를 정한다).
좌표: 블렌더 z 위 · 앞 -y → 내보내면 y 위 · 앞 +z. 실험대 윗면이 높이 0. 고고의 키는 1.05.
색은 꼭짓점 색(무늬 그림 없음) — 아래가 조금 어둡고 틈새가 그늘진다.
"""
import bpy, bmesh, math, os, random
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'lab.glb'))
# ── 치수(놀이 코드 index.html 의 T.BENCH 와 맞춘다)
BENCH = dict(w=7.4, d=2.6, top=0.22, body_h=2.3)     # 실험대 너비 · 깊이 · 윗판 두께 · 몸통 높이
WALL_Y = 1.75                                        # 뒷벽(블렌더 y)

def lin(c): return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def rgb(h): h = h.lstrip('#'); return Vector((lin(int(h[0:2], 16) / 255), lin(int(h[2:4], 16) / 255), lin(int(h[4:6], 16) / 255)))
mix = lambda a, b, t: a + (b - a) * t
PAL = {k: rgb(v) for k, v in dict(wood='#dba869', wood2='#b97c48', wood3='#9a6238', knob='#ffcc70', cream='#f7ebd5', coral='#f29a83', sky='#83c9ea', purple='#9b8ad4',
       green='#78b985', sun='#ffcc70', red='#e9483c', red2='#f8a24b', leaf='#5cab58', stem='#7a4a25', white='#ffffff', glass='#dff3f7', dark='#4a3560', gold='#ffd766', star='#fff0a0',
       book1='#e07a6a', book2='#6fb3d9', book3='#8bc48a', page='#fbf3df', pot='#5b4a7a').items()}

class Mk:
    """조각을 얹어 한 물체를 만든다. 조각마다 색(또는 높이에 따른 색 함수)을 준다."""
    def __init__(s): s.bm = bmesh.new(); s.col = {}
    def _paint(s, verts, col):
        for v in verts: s.col[v] = col(v.co) if callable(col) else col
    def lathe(s, prof, col, at=(0, 0, 0), segs=32, rot=None):
        """옆모습 금 [(반지름, 높이)…] 을 돌려 만든다. 반지름 0 인 끝은 한 점으로 막는다."""
        rows = []; M = Matrix.Translation(at) @ (rot.to_4x4() if rot else Matrix.Identity(4))
        for r, z in prof:
            rows.append([s.bm.verts.new(M @ Vector((0, 0, z)))] if r < 1e-6 else [s.bm.verts.new(M @ Vector((r * math.cos(j / segs * math.tau), r * math.sin(j / segs * math.tau), z))) for j in range(segs)])
        fs = []
        for a, b in zip(rows, rows[1:]):
            for j in range(segs):
                k = (j + 1) % segs
                if len(a) == 1 and len(b) == 1: continue
                fs.append(s.bm.faces.new((a[0], b[j], b[k]) if len(a) == 1 else (a[j], a[k], b[0]) if len(b) == 1 else (a[j], a[k], b[k], b[j])))
        vs = [v for row in rows for v in row]; s._paint(vs, col); return vs
    def box(s, size, at, col, bevel=0.03, rot=None):
        r = bmesh.ops.create_cube(s.bm, size=1.0, matrix=Matrix.Translation(at) @ (rot.to_4x4() if rot else Matrix.Identity(4)) @ Matrix.Diagonal((size[0], size[1], size[2], 1)))
        vs = r['verts']; es = list({e for v in vs for e in v.link_edges})
        if bevel > 0:
            before = set(s.bm.verts); bmesh.ops.bevel(s.bm, geom=es, offset=min(bevel, min(size) * 0.45), segments=3, profile=0.5, affect='EDGES'); vs = [v for v in s.bm.verts if v not in before or v in vs and v.is_valid]
        s._paint([v for v in vs if v.is_valid], col); return vs
    def ball(s, r, at, col, scale=(1, 1, 1), segs=28):
        v = bmesh.ops.create_uvsphere(s.bm, u_segments=segs, v_segments=segs // 2, radius=r, matrix=Matrix.Translation(at) @ Matrix.Diagonal((*scale, 1)))['verts']; s._paint(v, col); return v
    def torus(s, R, r, at, col, arc=math.tau, rot=None, segs=28, tube=12):
        M = Matrix.Translation(at) @ (rot.to_4x4() if rot else Matrix.Identity(4)); rows = []; n = segs if arc >= math.tau - 1e-6 else segs + 1
        for i in range(n):
            a = arc * i / segs; c = Vector((math.cos(a) * R, 0, math.sin(a) * R)); row = []
            for j in range(tube):
                b = j / tube * math.tau; row.append(s.bm.verts.new(M @ (c + Vector((math.cos(a), 0, math.sin(a))) * (r * math.cos(b)) + Vector((0, r * math.sin(b), 0)))))
            rows.append(row)
        for i in range(len(rows) - (0 if arc >= math.tau - 1e-6 else 1)):
            a, b = rows[i], rows[(i + 1) % len(rows)]
            for j in range(tube): s.bm.faces.new((a[j], a[(j + 1) % tube], b[(j + 1) % tube], b[j]))
        vs = [v for row in rows for v in row]; s._paint(vs, col); return vs
    def done(s, name, mat, ground=None, ao=0.5, shade=0.16):
        """틈새 그늘을 굽고 물체로 만든다. ground = 바닥 높이(그 아래로 그림자가 진다)."""
        bm = s.bm; bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.verts.ensure_lookup_table(); bm.verts.index_update(); bm.normal_update()
        bvh = BVHTree.FromBMesh(bm); rnd = random.Random(5); dirs = []
        while len(dirs) < 22:
            d = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-1, 1)))
            if 0.05 < d.length < 1: dirs.append(d.normalized())
        zs = [v.co.z for v in bm.verts]; z0, z1 = min(zs), max(zs); cols = []
        for v in bm.verts:
            p, n = v.co, v.normal; occ = tot = 0.0
            for d in dirs:
                k = d.dot(n)
                if k < 0: d, k = -d, -k
                tot += k; hit = bvh.ray_cast(p + n * 0.004, d, 0.35)
                if hit[0] is not None: occ += k * (1 - hit[3] / 0.35)
                elif ground is not None and d.z < -0.05 and (p.z - ground) / -d.z < 0.35: occ += k * (1 - (p.z - ground) / -d.z / 0.35)
            c = s.col.get(v, PAL['cream']) * (1 - ao * occ / tot) * mix(1 - shade, 1.0, (p.z - z0) / max(z1 - z0, 1e-6)); cols.append(c)
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
        for p in me.polygons: p.use_smooth = True
        ca = me.color_attributes.new(name='Col', type='FLOAT_COLOR', domain='POINT')
        for i, c in enumerate(cols): ca.data[i].color = (c[0], c[1], c[2], 1.0)
        me.color_attributes.active_color = ca; me.materials.append(mat)
        ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); print('MADE', name, len(me.vertices), 'verts'); return ob

def material(name, rough):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes.get('Principled BSDF'); b.inputs['Roughness'].default_value = rough
    at = nt.nodes.new('ShaderNodeVertexColor'); at.layer_name = 'Col'; nt.links.new(at.outputs['Color'], b.inputs['Base Color']); return m

RX = lambda d: Matrix.Rotation(math.radians(d), 3, 'X'); RY = lambda d: Matrix.Rotation(math.radians(d), 3, 'Y'); RZ = lambda d: Matrix.Rotation(math.radians(d), 3, 'Z')

def bottle(m, x, z, liquid, tall=0.5, fat=0.17):
    y = WALL_Y - 0.22; glass = lambda p, l=liquid, z=z, t=tall: mix(l, PAL['glass'], 0.0 if p.z < z + t * 0.62 else 0.85)
    m.lathe([(0, 0), (fat * 0.8, 0), (fat, 0.05), (fat, tall * 0.55), (fat * 0.45, tall * 0.8), (fat * 0.4, tall), (fat * 0.5, tall + 0.02), (0, tall + 0.02)], glass, (x, y, z), 20)
    m.lathe([(0, 0), (fat * 0.36, 0), (fat * 0.42, 0.09), (0, 0.1)], PAL['wood2'], (x, y, z + tall), 12)

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    matte, gloss = material('lab_matte', 0.78), material('lab_gloss', 0.28); B = BENCH; hw, hd = B['w'] / 2, B['d'] / 2

    # ── 방(제자리): 실험대 · 서랍 · 벽 선반 · 병 · 책 · 둥근 창 · 화분
    m = Mk(); grain = lambda p: mix(PAL['wood'], PAL['wood2'], 0.12 + 0.10 * math.sin(p.x * 9.0) * math.sin(p.x * 2.3 + p.y * 3.0))
    m.box((B['w'], B['d'], B['top']), (0, 0, -B['top'] / 2), grain, 0.05)
    m.box((B['w'] - 0.35, B['d'] - 0.3, B['body_h']), (0, 0.05, -B['top'] - B['body_h'] / 2 + 0.02), PAL['wood2'], 0.06)
    for i, x in enumerate((-2.4, 0, 2.4)):
        m.box((2.05, 0.1, 0.62), (x, -hd + 0.2, -0.75), mix(PAL['wood'], PAL['wood2'], 0.45), 0.04); m.ball(0.085, (x, -hd + 0.12, -0.75), PAL['knob'])
        m.box((2.05, 0.1, 0.9), (x, -hd + 0.2, -1.62), mix(PAL['wood'], PAL['wood2'], 0.55), 0.04); m.ball(0.085, (x, -hd + 0.12, -1.55), PAL['knob'])
    for x, w in ((2.15, 3.0), (-2.5, 2.2)):                      # 벽 선반 둘
        z = 1.72 if x > 0 else 1.5; m.box((w, 0.44, 0.09), (x, WALL_Y - 0.22, z), PAL['wood2'], 0.03)
        for sx in (-w / 2 + 0.25, w / 2 - 0.25): m.box((0.08, 0.3, 0.26), (x + sx, WALL_Y - 0.14, z - 0.16), PAL['wood3'], 0.02)
    bottle(m, 1.05, 1.765, PAL['coral'], 0.52, 0.17); bottle(m, 1.62, 1.765, PAL['sky'], 0.4, 0.2); bottle(m, 2.2, 1.765, PAL['purple'], 0.6, 0.15); bottle(m, 2.72, 1.765, PAL['sun'], 0.36, 0.19); bottle(m, 3.25, 1.765, PAL['green'], 0.48, 0.16)
    for i, (c, w, h, d) in enumerate(((PAL['book1'], 0.62, 0.11, 2), (PAL['book2'], 0.56, 0.1, -5), (PAL['book3'], 0.5, 0.09, 4))):   # 책 더미(왼쪽 선반)
        z = 1.545 + sum(x[2] for x in ((0, 0, 0.11), (0, 0, 0.1), (0, 0, 0.09))[:i]) + h / 2
        m.box((w, 0.36, h), (-3.0, WALL_Y - 0.24, z), c, 0.015, RZ(d)); m.box((w - 0.04, 0.33, h - 0.03), (-3.0, WALL_Y - 0.265, z), PAL['page'], 0.0, RZ(d))
    m.lathe([(0, 0), (0.17, 0), (0.22, 0.26), (0.24, 0.28), (0.2, 0.3), (0, 0.3)], PAL['coral'], (-2.0, WALL_Y - 0.22, 1.545), 20)                       # 화분
    for a, l in ((-28, 0.34), (6, 0.42), (34, 0.3)): m.ball(0.1, (-2.0 + math.sin(math.radians(a)) * l * 0.6, WALL_Y - 0.22, 1.86 + math.cos(math.radians(a)) * l * 0.5), PAL['green'], (0.55, 0.3, 1.5))
    m.torus(0.95, 0.1, (-0.35, WALL_Y - 0.03, 2.55), PAL['wood2'], rot=RX(0))                                                                          # 둥근 창
    m.lathe([(0, 0), (0.95, 0)], lambda p: mix(PAL['sky'], PAL['white'], 0.25 + 0.3 * (p.z - 1.6) / 1.9), (-0.35, WALL_Y - 0.02, 2.55), 40, RX(90))
    m.box((1.9, 0.07, 0.07), (-0.35, WALL_Y - 0.05, 2.55), PAL['wood2'], 0.02); m.box((0.07, 0.07, 1.9), (-0.35, WALL_Y - 0.05, 2.55), PAL['wood2'], 0.02)
    m.done('room', matte, ao=0.45, shade=0.0)

    # ── 사과(바닥 가운데가 원점 · 키 0.6)
    m = Mk(); skin = lambda p: mix(mix(PAL['red'], PAL['red2'], max(0.0, min(1.0, (p.z - 0.3) / 0.5 + 0.25 * math.sin(math.atan2(p.y, p.x) * 3)))), PAL['red'], 0.35)
    m.lathe([(0, 0.035), (0.1, 0.008), (0.2, 0.03), (0.285, 0.13), (0.325, 0.28), (0.31, 0.42), (0.24, 0.535), (0.15, 0.578), (0.07, 0.56), (0.03, 0.52), (0, 0.51)], skin, segs=36)
    m.lathe([(0, 0), (0.022, 0), (0.018, 0.16), (0.026, 0.17), (0, 0.172)], PAL['stem'], (0, 0, 0.5), 10, RY(12)); m.ball(0.1, (0.1, 0, 0.66), PAL['leaf'], (1.25, 0.5, 0.22))
    m.done('apple', gloss, ground=0)

    # ── 컵(안이 빈 머그 · 키 0.62 · 안 반지름 0.33 · 손잡이는 +x)
    m = Mk(); cupc = lambda p: mix(PAL['sky'], PAL['cream'], 1.0 if 0.2 < p.z < 0.3 and math.hypot(p.x, p.y) > 0.36 else 0.0)
    m.lathe([(0, 0), (0.3, 0), (0.335, 0.03), (0.385, 0.6), (0.375, 0.62), (0.345, 0.62), (0.335, 0.6), (0.3, 0.09), (0.28, 0.07), (0, 0.07)], cupc, segs=40)
    m.torus(0.17, 0.045, (0.42, 0, 0.32), PAL['sky'], arc=math.pi * 1.16, rot=RY(104))
    m.done('cup', gloss, ground=0)

    # ── 의자(앉는 높이 0.42 · 키 0.95 · 등받이는 뒤(+y))
    m = Mk()
    for x in (-0.22, 0.22):
        m.box((0.075, 0.075, 0.4), (x, -0.2, 0.2), PAL['wood2'], 0.02); m.box((0.075, 0.075, 0.95), (x, 0.21, 0.475), PAL['wood2'], 0.02)
    m.box((0.58, 0.54, 0.075), (0, 0, 0.42), PAL['wood'], 0.03); m.box((0.5, 0.46, 0.06), (0, -0.01, 0.475), PAL['coral'], 0.028)
    m.box((0.5, 0.06, 0.22), (0, 0.21, 0.8), PAL['wood'], 0.03); m.box((0.44, 0.05, 0.05), (0, 0.21, 0.6), PAL['wood'], 0.02)
    m.done('chair', matte, ground=0)

    # ── 공(가운데가 원점 · 반지름 0.27 · 띠 무늬)
    m = Mk(); band = lambda p: (PAL['coral'], PAL['cream'], PAL['sky'], PAL['cream'], PAL['sun'])[min(4, int((Vector((0.35, 0.2, 0.92)).normalized().dot(p) / 0.27 + 1) * 2.5))]
    m.ball(0.27, (0, 0, 0), band, segs=40); m.done('ball', gloss, ao=0.0, shade=0.1)

    # ── 지팡이(별 가운데가 원점 · 자루는 아래로 0.78) · 지팡이 꽂이
    m = Mk(); stick = lambda p: PAL['gold'] if (-0.2 > p.z > -0.25) or (-0.72 > p.z > -0.78) else PAL['dark']
    m.lathe([(0, -0.8), (0.03, -0.79), (0.034, -0.74), (0.024, -0.7), (0.02, -0.14), (0.03, -0.12), (0, -0.1)], stick, segs=14)
    pts = [Vector((math.sin(i * math.pi / 5) * (0.2 if i % 2 == 0 else 0.092), 0, math.cos(i * math.pi / 5) * (0.2 if i % 2 == 0 else 0.092))) for i in range(10)]
    f = [m.bm.verts.new(p + Vector((0, -0.035, 0))) for p in pts]; b = [m.bm.verts.new(p + Vector((0, 0.035, 0))) for p in pts]; cf = m.bm.verts.new((0, -0.075, 0)); cb = m.bm.verts.new((0, 0.075, 0))
    for i in range(10):
        k = (i + 1) % 10; m.bm.faces.new((cf, f[i], f[k])); m.bm.faces.new((cb, b[k], b[i])); m.bm.faces.new((f[i], b[i], b[k], f[k]))
    m._paint(f + b, PAL['gold']); m._paint([cf, cb], PAL['star']); m.done('wand', gloss, ao=0.25, shade=0.0)
    m = Mk(); m.lathe([(0, 0), (0.17, 0), (0.2, 0.04), (0.16, 0.3), (0.19, 0.34), (0.15, 0.34), (0.13, 0.3), (0.15, 0.08), (0, 0.07)], lambda p: PAL['purple'] if p.z < 0.25 else PAL['cream'], segs=24)
    m.done('jar', gloss, ground=0)

def export():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    build(); export()

"""마법 연구소 · 자리 ③ 「무지개 물약」의 장소 — 「지하 물약 방」 한 벌을 블렌더로 빚는다(묶음 3-6 · 11-26 준호 「장소를 바꿔도 될 것 같아」). 받아 온 모형 없음.
실행(화면 없이):  blender -b --python english/play/world/tools/make_place_potion.py   → english/play/world/assets/place_potion.glb (400KB 아래 · 삼각형 4만 아래)
무섭지 않은 아늑한 비밀 방이다: 둥근 돌 · 따뜻한 등불 · 귀여운 통. 천장이 낮고 하늘이 안 보인다(다른 세 자리와 실루엣부터 다르게).
놓은 것: 돌 작업대(윗면 y=0 · 가로 세로는 make_lab.py 의 BENCH 그대로) · 뒤 돌벽과 큰 아치 벽감(수조 뒤 — 물빛이 여기에 비친다) · 벽 앞 돌 턱 · 벽에 박힌 누운 통(왼쪽) · 선 작은 통(오른쪽)
        · 등불 셋(벽 둘 · 바닥 궤짝 위 하나) · 구리 배관(벽을 가로질러 내려온다 · 눈금판 · 돌리는 바퀴 · 수조의 물 채우는 대롱으로 이어지는 관) · 병 걸이 줄이 매이는 천장 들보 · 돌바닥과 통 · 궤짝(세로 화면의 아래쪽).
물체 이름이 약속이다(모두 제자리에 놓인 채로): place(돌 · 나무 — 무광) / place_metal(구리 관 · 등불 틀 — 유광) / lamp_0 · lamp_1 · lamp_2(등불의 유리 — 놀이가 빛나는 재질을 입히고 일렁이게 한다)
빚는 도구(Mk · PAL · material)는 make_lab.py 의 것을 빌린다. 돌은 「베개 돌」(가운데가 볼록한 네모 — 모서리가 둥글어 보인다)로 깔아 삼각형을 아낀다.
등불 둘레의 따뜻한 빛과 구석 · 천장의 어둠은 꼭짓점 색에 구워 넣는다(진짜 빛을 더 달지 않는다 — 태블릿).
좌표: 아래 코드는 놀이의 좌표(X 오른쪽 · Y 위 · Z 앞)로 적고 V() 가 블렌더(z 위 · 앞 -y)로 옮긴다. 작업대 윗면이 높이 0 · 뒷벽 Z=-1.75 · 바닥 Y=-2.5.
"""
import bpy, bmesh, math, os, sys, random, json, struct
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_lab as L
from make_lab import Mk, PAL, mix, rgb, RX, RY, RZ, BENCH

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'place_potion.glb'))
rnd = random.Random(11)
V = lambda X, Y, Z: Vector((X, -Z, Y))                                   # 놀이 좌표 → 블렌더
c01 = lambda x: max(0.0, min(1.0, x))
mul = lambda a, b: Vector((a.x * b.x, a.y * b.y, a.z * b.z))

# ── 치수
WALL_Z, NICHE_Z, FLOOR_Y, LEDGE_Y, LEDGE_Z = -1.75, -2.25, -2.5, 0.34, -1.28      # 뒷벽 · 벽감의 안쪽 벽 · 바닥 · 벽 앞 돌 턱의 높이와 앞 끝
ARCH = dict(hw=2.25, spring=1.6, crown=3.05, t=0.42, n=9)                          # 아치: 안쪽 반 너비 · 홍예가 시작하는 높이 · 안쪽 꼭대기 · 홍예돌 두께 · 돌 수(가로 1200×800 에서 벽은 y 3.59 까지 보인다)
ARCH['R'] = (ARCH['hw'] ** 2 + (ARCH['crown'] - ARCH['spring']) ** 2) / (2 * (ARCH['crown'] - ARCH['spring'])); ARCH['cy'] = ARCH['crown'] - ARCH['R']; ARCH['a'] = math.asin(ARCH['hw'] / ARCH['R'])
LAMPS = [(-3.18, 2.72, -1.4), (3.2, 2.72, -1.4), (2.25, -1.3, 2.2)]              # 등불 셋(유리 몸의 가운데)
BEAM_Y = 6.1                                                                       # 천장 들보(병 걸이의 줄이 y 6.15 까지 올라간다)

# ── 색(sRGB → 선형). 배경은 채도 · 대비를 한 단 낮춘다: 보랏빛 도는 잿빛 돌 + 따뜻한 등불
C = {k: rgb(v) for k, v in dict(stone1='#8d8297', stone2='#82778f', stone3='#978c9c', stone4='#7c7289', mortar='#40364f', niche='#6f6580', ledge='#8f8498', body='#958a9d', key='#b3a7b0',
     slab='#c6b9ad', slab2='#b3a59c', floor='#6f657c', floor2='#665c74', wood='#b8875a', wood2='#9a6a42', wood3='#7d5434', face='#d2a771', hoop='#5e4a4c', iron='#4a4252', copper='#d0804e', copper2='#b06438',
     brass='#e0b45c', cream='#f4e6c8', coral='#f29a83', warm='#ffb866', glass='#fff0c0').items()}

def lit(base, amb=1.0, warm=1.0):
    """구워 넣는 빛: 옆과 위로 갈수록 어두워지고, 등불 둘레는 따뜻하게 밝다. base = 색(또는 자리 → 색)."""
    def f(p):
        X, Y, Z = p.x, p.z, -p.y; b = base(p) if callable(base) else base
        side, high = c01((abs(X) - 3.3) / 3.6), c01((Y - 3.7) / 3.2); low = c01((-Y - 0.4) / 2.1); a = amb * 0.4 * (1 - 0.62 * side * side) * (1 - 0.6 * high) * (1 - 0.3 * low)
        w = sum(1.0 / (1.0 + (math.dist((X, Y, Z), q) / 0.8) ** 2) for q in LAMPS) * warm
        return b * a + mul(b, C['warm']) * (w * 1.9)
    return f

class Mk2(Mk):
    """Mk 에 손으로 감은 면(베개 돌 · 네모 면)을 더한다. 그런 면은 방향을 내가 정했으니 다시 뒤집지 않는다(열린 조각이 섬마다 제멋대로 뒤집히지 않게)."""
    def __init__(s): super().__init__(); s.fixed = []
    def quad(s, pts, col, toward=None):
        """네(세) 꼭짓점으로 면 하나. toward(블렌더 좌표) 쪽을 보게 감는다."""
        vs = [s.bm.verts.new(p) for p in pts]
        if toward is not None:
            n = (pts[1] - pts[0]).cross(pts[-1] - pts[0]); cen = sum(pts, Vector()) / len(pts)
            if n.dot(toward - cen) < 0: vs.reverse()
        s.fixed.append(s.bm.faces.new(vs)); s._paint(vs, col); return vs
    def grid(s, c, nu, nv, col, f=None):
        """네 귀(시계 반대 방향 = 보는 쪽)를 잇는 nu×nv 칸 면. f(u, v, 자리) → 자리(굽히기)."""
        g = []
        for i in range(nu + 1):
            row = []
            for j in range(nv + 1):
                u, v = i / nu, j / nv; p = c[0] * ((1 - u) * (1 - v)) + c[1] * (u * (1 - v)) + c[2] * (u * v) + c[3] * ((1 - u) * v); row.append(s.bm.verts.new(f(u, v, p) if f else p))
            g.append(row)
        for i in range(nu):
            for j in range(nv): s.fixed.append(s.bm.faces.new((g[i][j], g[i + 1][j], g[i + 1][j + 1], g[i][j + 1])))
        vs = [v for row in g for v in row]; s._paint(vs, col); return g
    def pillow(s, c, d, col, edge=0.1, rnd_k=0.55):
        """베개 돌: 네 귀 c(보는 쪽에서 시계 반대 방향)의 네모가 가운데로 d 만큼 볼록하다. 16 꼭짓점 · 삼각형 18."""
        n = (c[1] - c[0]).cross(c[3] - c[0]).normalized(); eu = min(0.32, edge / max((c[1] - c[0]).length, 1e-6)); ev = min(0.32, edge / max((c[3] - c[0]).length, 1e-6))
        B = lambda u, v: c[0] * ((1 - u) * (1 - v)) + c[1] * (u * (1 - v)) + c[2] * (u * v) + c[3] * ((1 - u) * v); us, vs_ = (0, eu, 1 - eu, 1), (0, ev, 1 - ev, 1); g = []
        for i, u in enumerate(us):
            row = []
            for j, v in enumerate(vs_):
                inner = i in (1, 2) and j in (1, 2); p = B(u, v)
                if inner: p = p + n * d
                elif i in (0, 3) and j in (0, 3): p = p.lerp(B(us[1 if i == 0 else 2], vs_[1 if j == 0 else 2]), rnd_k)       # 모서리를 안으로 당겨 둥글게
                row.append(s.bm.verts.new(p))
            g.append(row)
        for i in range(3):
            for j in range(3): s.fixed.append(s.bm.faces.new((g[i][j], g[i + 1][j], g[i + 1][j + 1], g[i][j + 1])))
        vs = [v for row in g for v in row]; s._paint(vs, col); return vs
    def tube(s, a, b, r, col, segs=8):
        """놀이 좌표의 두 점을 잇는 관."""
        A, Bp = V(*a), V(*b); d = Bp - A; s.lathe([(r, 0), (r, d.length)], col, A, segs, Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix())
    def done(s, name, mat, ao=0.5, reach=0.35):
        bm = s.bm; fx = {f for f in s.fixed if f.is_valid}; bmesh.ops.recalc_face_normals(bm, faces=[f for f in bm.faces if f not in fx]); bm.verts.ensure_lookup_table(); bm.verts.index_update(); bm.normal_update()
        bvh = BVHTree.FromBMesh(bm); r2 = random.Random(5); dirs = []
        while len(dirs) < 18:
            d = Vector((r2.uniform(-1, 1), r2.uniform(-1, 1), r2.uniform(-1, 1)))
            if 0.05 < d.length < 1: dirs.append(d.normalized())
        cols = []
        for v in bm.verts:
            p, n = v.co, v.normal; occ = tot = 0.0
            if ao > 0:
                for d in dirs:
                    k = d.dot(n)
                    if k < 0: d, k = -d, -k
                    tot += k; hit = bvh.ray_cast(p + n * 0.004, d, reach)
                    if hit[0] is not None: occ += k * (1 - hit[3] / reach)
            cols.append(s.col.get(v, PAL['cream']) * (1 - ao * occ / max(tot, 1e-6)))
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
        for p in me.polygons: p.use_smooth = True
        ca = me.color_attributes.new(name='Col', type='FLOAT_COLOR', domain='POINT')
        for i, c in enumerate(cols): ca.data[i].color = (c[0], c[1], c[2], 1.0)
        me.color_attributes.active_color = ca; me.materials.append(mat)
        ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); print('MADE', name, len(me.vertices), 'verts', sum(len(p.vertices) - 2 for p in me.polygons), 'tris'); return ob

arch_pt = lambda a, r: (r * math.sin(a), ARCH['cy'] + r * math.cos(a))            # 아치 위의 한 점(a = 꼭대기에서 잰 각 · r = 반지름) → (X, Y)
FRONT = V(0, 2, 30)                                                                # 「보는 쪽」(면을 감을 때)

def barrel(m, base, rot, r_end, r_mid, Ln, segs=16, face=True, tone=1.0):
    """나무 통: base(블렌더 좌표 · 밑바닥 가운데)에서 rot 의 z 쪽으로 Ln 만큼. 금빛 테 넷 · 널빤지 결. face = 위(앞) 뚜껑을 밝게."""
    ax = (rot.to_4x4() @ Vector((0, 0, 1))).normalized() if rot else Vector((0, 0, 1)); side = ax.orthogonal().normalized(); side2 = ax.cross(side)
    R = lambda t: r_end + (r_mid - r_end) * math.sin(math.pi * t) ** 0.8
    def col(p):
        q = p - base; t = q.dot(ax) / Ln; rr = (q - ax * q.dot(ax)).length; ang = math.atan2(q.dot(side2), q.dot(side))
        if t > 0.97 and rr < r_end - 0.03: return lit(C['face'] * (0.9 + 0.1 * math.sin(q.dot(side) * 14)))(p) * tone          # 뚜껑(널빤지 줄)
        if 0.099 < t < 0.211 or 0.789 < t < 0.901: return lit(C['hoop'])(p) * tone
        return lit(mix(C['wood'], C['wood2'], 0.5 + 0.22 * math.sin(ang * segs / 2 + 0.4)) * (0.85 + 0.15 * math.sin(math.pi * t)))(p) * tone
    H = 0.014; prof = [(0, 0), (r_end * 0.9, 0), (R(0.0), 0.02 * Ln)]
    for t, h in ((0.097, 0), (0.1, H), (0.21, H), (0.213, 0), (0.5, 0), (0.787, 0), (0.79, H), (0.9, H), (0.903, 0)): prof.append((R(t) + h, t * Ln))
    prof += [(R(1.0), 0.985 * Ln), (r_end - 0.035, Ln), (r_end - 0.06, Ln - 0.05), (0, Ln - 0.05)]
    m.lathe(prof, col, base, segs, rot)

def lantern(m, g, X, Y, Z, k=1.0):
    """등불 하나: 틀(m — 유광)과 유리(g — 따로, 놀이가 빛나게 한다). (X, Y, Z) = 유리 몸의 가운데."""
    at = V(X, Y, Z); iron = C['iron'] * 1.5; br = C['brass'] * 0.8
    m.lathe([(0, 0.33 * k), (0.035 * k, 0.32 * k), (0.06 * k, 0.26 * k), (0.2 * k, 0.17 * k), (0.215 * k, 0.15 * k), (0.17 * k, 0.145 * k)], br, at, 10)       # 지붕
    m.lathe([(0.17 * k, -0.17 * k), (0.215 * k, -0.18 * k), (0.2 * k, -0.23 * k), (0, -0.23 * k)], br, at, 10)                                            # 받침
    for i in range(4):
        a = math.pi / 4 + i * math.pi / 2; m.lathe([(0.016 * k, -0.18 * k), (0.016 * k, 0.15 * k)], iron, at + Vector((math.cos(a) * 0.165 * k, math.sin(a) * 0.165 * k, 0)), 5)
    m.torus(0.05 * k, 0.014 * k, at + Vector((0, 0, 0.37 * k)), iron, rot=RY(0), segs=10, tube=5)
    g.lathe([(0, -0.17 * k), (0.15 * k, -0.17 * k), (0.16 * k, 0), (0.15 * k, 0.15 * k), (0, 0.15 * k)], C['glass'], at, 10)

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    matte, gloss = L.material('place_potion_matte', 0.86), L.material('place_potion_gloss', 0.32); A = ARCH; hw, hd = BENCH['w'] / 2, BENCH['d'] / 2
    m = Mk2()

    # ── 돌 작업대: 윗판(가운데가 밝다 — 놀이판에 눈이 간다) · 둥근 턱 · 몸통의 큰 베개 돌
    def slab(p):
        X, Z = p.x, -p.y; k = 0.9 + 0.06 * math.sin(X * 2.1 + Z * 1.3) * math.sin(X * 0.7 - Z * 2.9) + 0.1 * (1 - c01((abs(X) - 1.5) / 2.4)) - 0.1 * c01((-Z - 0.5) / 0.8)
        return mix(C['slab2'], C['slab'], c01(k)) * (0.7 + 0.14 * c01(k))
    nx, nz, bv = 16, 6, 0.05
    g = m.grid([V(-hw + bv, 0, hd - bv), V(hw - bv, 0, hd - bv), V(hw - bv, 0, -hd + bv), V(-hw + bv, 0, -hd + bv)], nx, nz, slab)
    ring = [g[i][0] for i in range(nx + 1)] + [g[nx][j] for j in range(1, nz + 1)] + [g[i][nz] for i in range(nx - 1, -1, -1)] + [g[0][j] for j in range(nz - 1, 0, -1)]      # 윗면의 테두리(시계 반대 방향)
    for out, dy in ((bv * 0.7, -0.015), (bv, -0.05), (bv, -BENCH['top'])):                                                                                    # 둥근 턱 → 옆면
        nxt = []
        for v in ring:
            X, Z = v.co.x, -v.co.y; sx = (1 if X > 0 else -1) if abs(abs(X) - (hw - bv)) < 1e-4 or abs(X) > hw - bv else 0; sz = (1 if Z > 0 else -1) if abs(abs(Z) - (hd - bv)) < 1e-4 or abs(Z) > hd - bv else 0
            bx = max(-hw + bv, min(hw - bv, X)); bz = max(-hd + bv, min(hd - bv, Z)); nxt.append(m.bm.verts.new(V(bx + sx * out, dy, bz + sz * out)))
        for i in range(len(ring)):
            k = (i + 1) % len(ring); m.fixed.append(m.bm.faces.new((ring[i], nxt[i], nxt[k], ring[k])))
        m._paint(nxt, lambda p: slab(p) * (0.92 if dy > -0.1 else 0.62)); ring = nxt
    BZ, BX = hd - 0.18, hw - 0.18                                                                                                                              # 몸통(윗판보다 조금 들어가 있다)
    m.quad([V(-BX, -BENCH['top'], BZ - 0.02), V(BX, -BENCH['top'], BZ - 0.02), V(BX, FLOOR_Y, BZ - 0.02), V(-BX, FLOOR_Y, BZ - 0.02)], lit(C['body'] * 0.5), FRONT)
    for sx in (-1, 1): m.quad([V(sx * BX, -BENCH['top'], BZ), V(sx * BX, -BENCH['top'], -hd), V(sx * BX, FLOOR_Y, -hd), V(sx * BX, FLOOR_Y, BZ)], lit(C['body'] * 0.6), V(sx * 30, 0, 0))
    y = -BENCH['top'] - 0.03
    for r, h in enumerate((1.08, 1.12)):
        x = -BX; off = 0 if r == 0 else 0.6
        while x < BX - 0.05:
            w = min(BX - x, (rnd.uniform(1.05, 1.4) if x > -BX or not off else off)); w = BX - x if BX - x - w < 0.45 else w
            m.pillow([V(x + 0.03, y - h + 0.03, BZ), V(x + w - 0.03, y - h + 0.03, BZ), V(x + w - 0.03, y - 0.03, BZ), V(x + 0.03, y - 0.03, BZ)], 0.08, lit(C['body'] * rnd.uniform(0.88, 1.05)), 0.12, 0.2); x += w
        y -= h

    # ── 바닥: 넓은 어두운 판 + 보이는 데만 넓적한 돌(세로 화면의 아래쪽)
    m.grid([V(-9, FLOOR_Y, 7.5), V(9, FLOOR_Y, 7.5), V(9, FLOOR_Y, -1.3), V(-9, FLOOR_Y, -1.3)], 10, 5, lit(C['mortar'] * 0.9))
    z = BZ + 0.04
    for r in range(4):
        x = -4.6 - (0.5 if r % 2 else 0); d = (0.95, 1.0, 1.1, 1.2)[r]
        while x < 4.6:
            w = rnd.uniform(1.0, 1.5); m.pillow([V(x + 0.03, FLOOR_Y, z + d - 0.03), V(x + w - 0.03, FLOOR_Y, z + d - 0.03), V(x + w - 0.03, FLOOR_Y, z + 0.03), V(x + 0.03, FLOOR_Y, z + 0.03)], 0.05, lit(mix(C['floor'], C['floor2'], rnd.random()) * rnd.uniform(0.92, 1.06)), 0.11); x += w
        z += d

    # ── 벽 앞 돌 턱(작업대 뒤에서 벽감 안까지 이어진다 — 통과 배관이 여기에 선다)
    sec = [(FLOOR_Y, LEDGE_Z), (LEDGE_Y - 0.07, LEDGE_Z), (LEDGE_Y - 0.015, LEDGE_Z - 0.02), (LEDGE_Y, LEDGE_Z - 0.07), (LEDGE_Y, NICHE_Z - 0.02)]; xs = [-12, -8, -5.5, -4.2, -3.2, -2.25, -1.1, 0, 1.1, 2.25, 3.2, 4.2, 5.5, 8, 12]
    rows = [[m.bm.verts.new(V(x, yy, zz)) for (yy, zz) in sec] for x in xs]
    for a, b in zip(rows, rows[1:]):
        for j in range(len(sec) - 1): m.fixed.append(m.bm.faces.new((a[j], b[j], b[j + 1], a[j + 1])))
    m._paint([v for r in rows for v in r], lit(lambda p: C['ledge'] * (1.0 if p.z > LEDGE_Y - 0.1 else 0.72)))

    # ── 뒷벽: 줄눈 바탕(벽감 자리는 뚫려 있다) + 베개 돌 줄쌓기
    bk = lit(C['mortar']); TOP = 9.5; Zb = WALL_Z - 0.012
    for sx in (-1, 1):
        cs = [V(sx * 12, 0.2, Zb), V(sx * A['hw'], 0.2, Zb), V(sx * A['hw'], TOP, Zb), V(sx * 12, TOP, Zb)]; m.grid(cs if sx > 0 else [cs[1], cs[0], cs[3], cs[2]], 8, 8, bk)
    N = 16; arc = [arch_pt(-A['a'] + 2 * A['a'] * i / N, A['R']) for i in range(N + 1)]
    for (x0, y0), (x1, y1) in zip(arc, arc[1:]):
        ym = max(y0, y1) + 0.9; m.quad([V(x0, y0, Zb), V(x1, y1, Zb), V(x1, ym, Zb), V(x0, ym, Zb)], bk, FRONT); m.quad([V(x0, ym, Zb), V(x1, ym, Zb), V(x1, 6.5, Zb), V(x0, 6.5, Zb)], bk, FRONT); m.quad([V(x0, 6.5, Zb), V(x1, 6.5, Zb), V(x1, TOP, Zb), V(x0, TOP, Zb)], bk, FRONT)
    tones = (C['stone1'], C['stone2'], C['stone3'], C['stone4']); rh = 0.52; y = LEDGE_Y - 0.02; r = 0
    while y < 7.4:
        y1 = y + rh; ex = A['hw'] + A['t'] + 0.14 if y < A['spring'] + 0.1 else 0.0
        if y >= A['spring'] + 0.1 and y < A['cy'] + A['R'] + A['t'] + 0.05: ex = math.sqrt(max(0.0, (A['R'] + A['t'] + 0.05) ** 2 - (y - A['cy']) ** 2))
        spans = [(-5.6 - (0.45 if r % 2 else 0), -ex), (ex, 5.6 + (0.45 if r % 2 else 0))] if ex > 0.3 else [(-5.6 - (0.45 if r % 2 else 0), 5.6)]
        for i, (xa, xb) in enumerate(spans):
            x = xa; ws = []
            while x < xb - 0.02:
                w = rnd.uniform(0.8, 1.3); w = xb - x if xb - x - w < 0.4 else w; ws.append((x, w)); x += w
            for x, w in ws:
                d = rnd.uniform(0.05, 0.085); m.pillow([V(x + 0.03, y + 0.03, WALL_Z), V(x + w - 0.03, y + 0.03, WALL_Z), V(x + w - 0.03, y1 - 0.03, WALL_Z), V(x + 0.03, y1 - 0.03, WALL_Z)], d, lit(tones[rnd.randrange(4)] * rnd.uniform(0.9, 1.06)), 0.1)
        y = y1; r += 1

    # ── 큰 아치 벽감(수조 뒤): 안쪽 벽 · 옆과 천장(안쪽 면) · 기둥 돌 · 받침돌 · 홍예돌 아홉(가운데가 이맛돌)
    nb = lambda p: C['niche'] * (0.78 + 0.3 * (1 - c01(math.hypot(p.x * 0.6, p.z - 1.4) / 2.6)))                                      # 수조 쪽이 밝다
    m.grid([V(-A['hw'] - 0.1, LEDGE_Y - 0.05, NICHE_Z), V(A['hw'] + 0.1, LEDGE_Y - 0.05, NICHE_Z), V(A['hw'] + 0.1, A['crown'] + 0.1, NICHE_Z), V(-A['hw'] - 0.1, A['crown'] + 0.1, NICHE_Z)], 8, 5, lit(lambda p: nb(p) * 0.62, warm=0.3))
    y = LEDGE_Y
    for r, h in enumerate((0.9, 0.85, 0.9)):
        x = -A['hw'] - (0.5 if r % 2 else 0.05)
        while x < A['hw']:
            w = rnd.uniform(1.0, 1.4); m.pillow([V(x + 0.03, y + 0.03, NICHE_Z + 0.01), V(x + w - 0.03, y + 0.03, NICHE_Z + 0.01), V(x + w - 0.03, y + h - 0.03, NICHE_Z + 0.01), V(x + 0.03, y + h - 0.03, NICHE_Z + 0.01)], 0.05, lit(lambda p, k=rnd.uniform(0.92, 1.05): nb(p) * k, warm=0.3), 0.1); x += w
        y += h
    out = [(-A['hw'], LEDGE_Y - 0.05), (-A['hw'], A['spring'])] + arc[1:-1] + [(A['hw'], A['spring']), (A['hw'], LEDGE_Y - 0.05)]; cen = V(0, 1.6, (WALL_Z + NICHE_Z) / 2)
    for (x0, y0), (x1, y1) in zip(out, out[1:]): m.quad([V(x0, y0, WALL_Z), V(x1, y1, WALL_Z), V(x1, y1, NICHE_Z), V(x0, y0, NICHE_Z)], lit(lambda p: C['niche'] * (0.5 if -p.y < WALL_Z - 0.2 else 0.72), warm=0.3), cen)
    for sx in (-1, 1):
        xa, xb = sorted((sx * (A['hw'] - 0.0), sx * (A['hw'] + A['t'])))
        for y0, y1 in ((LEDGE_Y, 0.98), (0.98, A['spring'] - 0.12)): m.pillow([V(xa, y0 + 0.02, WALL_Z), V(xb, y0 + 0.02, WALL_Z), V(xb, y1 - 0.02, WALL_Z), V(xa, y1 - 0.02, WALL_Z)], 0.3, lit(C['stone3'] * rnd.uniform(0.98, 1.08)), 0.07)
        m.pillow([V(xa - 0.08, A['spring'] - 0.12, WALL_Z), V(xb + 0.08, A['spring'] - 0.12, WALL_Z), V(xb + 0.08, A['spring'] + 0.08, WALL_Z), V(xa - 0.08, A['spring'] + 0.08, WALL_Z)], 0.37, lit(C['key']), 0.05)
    da = 2 * (A['a'] - 0.065) / A['n']
    for i in range(A['n']):
        a0 = -(A['a'] - 0.065) + da * i; a1 = a0 + da; key = i == A['n'] // 2; t = A['t'] + (0.1 if key else 0); g2 = 0.012
        pts = [arch_pt(a0 + g2, A['R'] - (0.03 if key else 0)), arch_pt(a1 - g2, A['R'] - (0.03 if key else 0)), arch_pt(a1 - g2, A['R'] + t), arch_pt(a0 + g2, A['R'] + t)]
        m.pillow([V(px, py, WALL_Z) for px, py in pts], 0.4 if key else 0.3, lit((C['key'] if key else (C['stone3'], C['stone1'])[i % 2]) * rnd.uniform(0.98, 1.07)), 0.07)

    # ── 통: 왼쪽 — 벽에 박힌 큰 누운 통(뚜껑이 이쪽을 본다 · 놋쇠 꼭지 · 코르크) / 오른쪽 — 턱 위에 선 작은 통 / 바닥 — 선 통 둘 · 궤짝
    bx, by, br_ = -3.3, 1.06, 0.57
    barrel(m, V(bx, by, -2.05), RX(90), 0.47, br_, 0.92)
    for sx in (-1, 1): m.box((0.24, 0.6, 0.3), V(bx + sx * 0.38, LEDGE_Y + 0.13, -1.52), lit(C['wood3']), 0.03, RY(sx * 28))                    # 굄목
    m.lathe([(0.06, 0), (0.06, 0.05), (0.035, 0.06), (0.035, 0.16), (0.05, 0.17), (0, 0.18)], lit(C['brass']), V(bx, by - 0.24, -1.18), 8, RX(90))   # 꼭지
    m.box((0.05, 0.05, 0.12), V(bx, by - 0.17, -1.06), lit(C['coral']), 0.015); m.ball(0.05, V(bx, by + 0.22, -1.165), lit(C['wood3']), (1, 0.6, 1), 8)
    barrel(m, V(3.36, LEDGE_Y, -1.5), None, 0.28, 0.34, 0.78, 14)
    barrel(m, V(-2.3, FLOOR_Y, 2.25), None, 0.47, 0.6, 1.4, 16); barrel(m, V(-1.2, FLOOR_Y, 2.75), None, 0.33, 0.42, 0.92, 14)
    plank = lambda p: mix(C['wood'], C['wood2'], 0.5 + 0.5 * math.sin((p.z - FLOOR_Y) * 21)) * 0.92
    m.box((1.0, 1.0, 0.95), V(2.25, FLOOR_Y + 0.475, 2.2), lit(plank), 0.035, RZ(14))
    for sx in (-1, 1): m.box((0.12, 1.04, 0.97), V(2.25 + sx * 0.44 * math.cos(math.radians(14)), FLOOR_Y + 0.48, 2.2 - sx * 0.44 * math.sin(math.radians(14))), lit(C['wood3']), 0.02, RZ(14))

    # ── 천장 들보(병 걸이의 줄이 여기에 매인다) · 등불 걸이 팔
    m.box((13, 0.36, 0.36), V(0, BEAM_Y, -0.35), lit(lambda p: mix(C['wood2'], C['wood3'], 0.5 + 0.5 * math.sin(p.x * 5)), amb=1.5), 0.04)
    for X, Y, Z in LAMPS[:2]:
        m.box((0.06, abs(WALL_Z - Z) + 0.12, 0.06), V(X, Y + 0.52, (WALL_Z + Z) / 2 - 0.02), lit(C['iron'] * 1.4), 0.012); m.box((0.05, 0.05, 0.3), V(X, Y + 0.4, WALL_Z + 0.06), lit(C['iron'] * 1.4), 0.012, RX(-35))
    m.done('place', matte, ao=0.55)

    # ── 구리 배관 · 눈금판 · 돌리는 바퀴 · 등불 틀(유광)
    k = Mk2(); cu = lambda p: C['copper'] * (0.75 + 0.25 * c01(1 - (p.z - 3.6) / 3)); PZ, PR = -1.6, 0.075
    k.tube((-6.5, 4.45, PZ), (2.9, 4.45, PZ), PR, cu); k.tube((2.9, 4.45, PZ), (2.9, LEDGE_Y, PZ), PR, cu); k.tube((-1.4, 4.45, PZ), (-1.4, 9.2, PZ), PR, cu)
    for (X, Y) in ((2.9, 4.45), (-1.4, 4.45)): k.ball(PR * 1.55, V(X, Y, PZ), cu, segs=10)
    for (X, Y, rot) in ((2.9, 3.3, None), (2.9, 1.0, None), (-1.4, 5.3, None), (0.2, 4.45, RY(90)), (-3.6, 4.45, RY(90))): k.lathe([(PR, -0.05), (PR * 1.5, -0.05), (PR * 1.5, 0.05), (PR, 0.05)], C['copper2'], V(X, Y, PZ), 8, rot)   # 이음 테
    k.tube((1.68, 2.5, -2.0), (1.68, 1.48, -2.0), 0.055, cu); k.ball(0.08, V(1.68, 1.48, -2.0), cu, segs=8); k.tube((1.68, 1.48, -2.0), (1.68, 1.48, -0.4), 0.05, cu)                # 수조의 물 채우는 대롱으로 가는 관(벽감 안에서 내려와 앞으로)
    gy = 2.05; k.lathe([(0, 0), (0.2, 0), (0.22, 0.03), (0.22, 0.1), (0.18, 0.12), (0.17, 0.1), (0, 0.1)], lambda p: C['cream'] if math.hypot(p.x - 2.9, p.z - gy) < 0.175 else C['brass'], V(2.9, gy, PZ + 0.06), 14, RX(90))      # 눈금판
    k.box((0.03, 0.02, 0.15), V(2.9 + 0.04, gy + 0.045, PZ + 0.175), C['coral'], 0.0, RY(40)); k.ball(0.028, V(2.9, gy, PZ + 0.18), C['iron'] * 1.5, segs=6)
    wx = 1.15; k.torus(0.2, 0.032, V(wx, 4.45, PZ + 0.2), C['coral'], rot=RY(0), segs=14, tube=6); k.lathe([(0.03, 0), (0.03, 0.2), (0.055, 0.2), (0.055, 0.25), (0, 0.25)], C['brass'], V(wx, 4.45, PZ), 8, RX(90))                 # 돌리는 바퀴
    for d in (0, 90): k.box((0.4, 0.03, 0.04), V(wx, 4.45, PZ + 0.2), C['coral'], 0.0, RY(d + 45))
    g = [Mk2(), Mk2(), Mk2()]
    for i, (X, Y, Z) in enumerate(LAMPS): lantern(k, g[i], X, Y, Z, 1.0 if i < 2 else 0.9)
    for X, Y, Z in LAMPS[:2]: k.tube((X, Y + 0.38, Z), (X, Y + 0.5, Z), 0.012, C['iron'] * 1.5, 5)
    k.done('place_metal', gloss, ao=0.3)
    for i in range(3): g[i].done('lamp_%d' % i, matte, ao=0.0)

def export():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    b = open(OUT, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); tris = sum(j['accessors'][p['indices']]['count'] // 3 for me in j['meshes'] for p in me['primitives'])
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes', tris, 'tris')

if __name__ == '__main__':
    build(); export()

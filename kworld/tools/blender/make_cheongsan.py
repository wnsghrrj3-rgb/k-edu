"""청산리 — 엿새(1920년 10월 말 만주) 장면 모델 — cheongsan.glb.
자연(잎 진 자작나무·노란 잎갈나무·검은 가문비·서리·첫눈) · 바위 · 진지(천막·모닥불·짐) · 귀틀집 · 사람에 붙이는 것 · 한꺼번에 그리는 병사(인스턴스) · 까마귀·산포·기관총.
좌표: 블렌더 z 위 · 앞 = -y · 미터. 물체마다 원점 = 바닥 가운데(발밑).
재질 이름이 약속: tint_shirt · tint_pants(독립군 옷) · tint_cloth(신호 깃발) · tint_leaf · tint_bark(먼 산 나무) 는 장면이 색을 정한다. glow_fire = 스스로 빛나는 불꽃.
사람에 붙이는 것(cs_hat_* · cs_rifle · cs_pack · cs_scope)은 people.glb 의 사람(머리 가운데 z 1.66, 0.54 너비)에 맞춘 자리다.
인스턴스 병사(cs_jp · cs_jp_off · cs_ia · cs_ia_prone · cs_ia_kneel)는 키 ≈1.75 m 의 한 덩이(면 ≤ 450). 깃발·표지·휘장은 없다."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [
    # 자연
    ('birch', 0xece8df), ('birch_d', 0x3a3530), ('twig', 0x5e5048), ('leaf_y', 0xe0b84a),
    ('larch', 0xd9a441), ('larch_d', 0xb8832f), ('bark_l', 0x5e4430),
    ('spruce', 0x2c4a3a), ('spruce_d', 0x233c30), ('snow', 0xf2f6fb), ('frost', 0xdfe7ec),
    ('tint_leaf', 0x2c4a3a), ('tint_bark', 0x5a4632),
    ('brush', 0x6e5038), ('brush_d', 0x54402e), ('dry', 0xc2a466), ('dry_d', 0x9a7c48), ('dry_h', 0xd8c08a),
    ('granite', 0x8d8a84), ('granite_d', 0x5e5b57), ('granite_l', 0xa29f98), ('moss', 0x6b7a45),
    # 진지
    ('canvas', 0xcdc3a6), ('canvas_p', 0xb5aa8b), ('canvas_d', 0x9e937a), ('canvas_in', 0x6e6656), ('dark', 0x2a2420),
    ('pole', 0x7a5632), ('wood', 0x8a6440), ('wood_d', 0x5a4028), ('wood_l', 0xb89868), ('rope', 0xc8b080), ('rope_d', 0x8a7550),
    ('stone', 0x8a8780), ('char', 0x2a2522), ('ash', 0x9a968f), ('glow_fire', 0xffa040),
    ('bojagi', 0x5a6e8a), ('iron', 0x3a3a3e), ('blanket', 0x7e7e78), ('crate', 0x7a6a48), ('tint_cloth', 0xe8e0d0), ('cloth_w', 0xf2eee4),
    ('log', 0x8a6a48), ('log_d', 0x6e5236), ('log_end', 0xc8a878), ('bark_roof', 0x5e4a3a), ('thatch', 0xc9a456), ('thatch_d', 0xa8843e),
    ('mud', 0xa88a62), ('paper', 0xe8dcc0),
    # 사람
    ('skin', 0xeec39a), ('ink', 0x2b2118), ('khaki', 0x8a7f55), ('khaki_d', 0x746a46), ('khaki_t', 0x7a7350), ('puttee', 0xb0a27a),
    ('boot', 0x5a3e28), ('leather', 0x6a4a30), ('brim', 0x4a4232), ('brass', 0xc8a040), ('gunmetal', 0x2e3034), ('stock', 0x7a5232),
    ('fur', 0x6a4c34), ('hatcloth', 0x9a8a6a), ('tint_shirt', 0x4a4f58), ('tint_pants', 0x5a5448), ('legging', 0xc8bca0),
    ('straw', 0xd2b06c), ('bag', 0xa89878),
    ('horse', 0x7a4a2a), ('horse_d', 0x3a2618), ('hoof', 0x2a2220), ('saddle', 0x4a3020), ('saddlecloth', 0x4e4c3c),
    # 그 밖
    ('crow', 0x1e2230), ('crow_b', 0x2c3650), ('beak', 0x3a3a3a),
    ('gun_g', 0x4e5648), ('gun_d', 0x33382f), ('wheel', 0x5a5446), ('mg_box', 0x5a6248)]:
    mat(n, c)
mat('glow_fire', 0xffa040, emit=0xffa040)


# ───────── 도구 ─────────
def wob(k=0.12, seed=1):
    rr = random.Random(seed)
    table = {}

    def f(v):
        key = (round(v.x, 3), round(v.y, 3), round(v.z, 3))
        if key not in table:
            table[key] = 1 + (rr.random() - 0.5) * 2 * k
        return v * table[key]
    return f


def frame(p0, p1, hint=(1, 0, 0)):
    """p0→p1 축(Z)과 옆(X, hint 쪽), Y = Z×X. 사람 몸통이면 +Y 가 등."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    L = d.length
    Z = d / L
    h = Vector(hint)
    if abs(Z.dot(h.normalized())) > 0.95:
        h = Vector((0, 1, 0)) if abs(Z.y) < 0.95 else Vector((1, 0, 0))
    Y = Z.cross(h).normalized()
    X = Y.cross(Z)
    return (p0, X, Y, Z, L)


def fmat(F, t0, t1, ox=0.0, oy=0.0):
    p0, X, Y, Z, L = F
    T = p0 + Z * (L * (t0 + t1) / 2) + X * ox + Y * oy
    return Matrix(((X.x, Y.x, Z.x, T.x), (X.y, Y.y, Z.y, T.y), (X.z, Y.z, Z.z, T.z), (0, 0, 0, 1))), L * (t1 - t0)


def fbox(b, F, t0, t1, w, d, m, ox=0.0, oy=0.0, taper=0.0, dtaper=0.0, **k):
    M, h = fmat(F, t0, t1, ox, oy)

    def f(v):
        s = v.z / (h / 2)
        return M @ Vector((v.x * (1 + taper * s), v.y * (1 + dtaper * s), v.z))
    b.box((w, d, h), (0, 0, 0), m, f=f, **k)


def fcone(b, F, t0, t1, r0, r1, m, ox=0.0, oy=0.0, seg=6, **k):
    M, h = fmat(F, t0, t1, ox, oy)
    b.cone(r0, r1, h, (0, 0, 0), m, seg=seg, f=lambda v: M @ v, **k)


def limb(b, p0, p1, r0, r1, m, seg=6, hint=(1, 0, 0), **k):
    fcone(b, frame(p0, p1, hint), 0, 1, r0, r1, m, seg=seg, **k)


def obox(b, p0, p1, w, d, m, hint=(1, 0, 0), **k):
    fbox(b, frame(p0, p1, hint), 0, 1, w, d, m, **k)


def sheet(b, nx, ny, fn, th, m, **k):
    """얇은 천(앞뒤가 다 보이는 닫힌 판). fn(u, v) → (x, y, z), 두께는 y 쪽."""
    t = bmesh.new()

    def mk(off):
        return [[t.verts.new(Vector(fn(i / nx, j / ny)) + Vector((0, off, 0))) for j in range(ny + 1)] for i in range(nx + 1)]
    A, Bv = mk(-th / 2), mk(th / 2)
    for i in range(nx):
        for j in range(ny):
            t.faces.new((A[i][j], A[i + 1][j], A[i + 1][j + 1], A[i][j + 1]))
            t.faces.new((Bv[i][j + 1], Bv[i + 1][j + 1], Bv[i + 1][j], Bv[i][j]))
    ring = [(i, 0) for i in range(nx)] + [(nx, j) for j in range(ny)] + [(i, ny) for i in range(nx, 0, -1)] + [(0, j) for j in range(ny, 0, -1)]
    for q in range(len(ring)):
        a, c = ring[q], ring[(q + 1) % len(ring)]
        t.faces.new((A[a[0]][a[1]], Bv[a[0]][a[1]], Bv[c[0]][c[1]], A[c[0]][c[1]]))
    return b._take(t, m, **k)


def rzp(p, rz, c):
    """점 p 를 z 축으로 rz 돌리고 c 만큼 옮긴다."""
    x, y, z = p
    return (c[0] + x * math.cos(rz) - y * math.sin(rz), c[1] + x * math.sin(rz) + y * math.cos(rz), c[2] + z)


def blades(b, n, r, h, m, m2=None, seed=1, head=None, every=1):
    rr = random.Random(seed)
    for i in range(n):
        a = rr.random() * 6.28
        d = rr.random() * r
        hh = h * (0.6 + rr.random() * 0.6)
        lean = 0.15 + rr.random() * 0.35
        b.cone(0.045, 0.004, hh, (math.cos(a) * d + math.cos(a) * lean * hh / 2, math.sin(a) * d + math.sin(a) * lean * hh / 2, hh / 2 * math.cos(lean)), m if (i % 3 or not m2) else m2, seg=3, cap=False, jit=0.12, rot=(0, lean, a))
        if head and i % every == 0:
            b.ball(0.04, (math.cos(a) * d + math.cos(a) * math.sin(lean) * hh, math.sin(a) * d + math.sin(a) * math.sin(lean) * hh, hh * math.cos(lean)), head, sub=1, scale=(0.7, 0.7, 2.4), jit=0.1)


def tongue(b, m, x, y, r, h, tw, seed, z0=0.0):
    ph = random.Random(seed).random() * 6

    def f(v):
        k = (v.z - z0) / h
        a = tw * k
        return Vector((v.x * math.cos(a) - v.y * math.sin(a) + math.sin(k * 3 + ph) * 0.06 * k, v.x * math.sin(a) + v.y * math.cos(a) + math.cos(k * 2.3 + ph) * 0.06 * k, v.z))
    b.lathe([(r * 0.4, z0), (r, z0 + h * 0.14), (r * 0.92, z0 + h * 0.32), (r * 0.6, z0 + h * 0.58), (r * 0.28, z0 + h * 0.82), (0.012, z0 + h)], (x, y, 0), m, seg=5, jit=0.07, f=f)


# ═════════ 1~5 자연 ═════════
def birch(name, trunks, seed, leaves=3, nb=8, nd=9):
    b = B()
    rr = random.Random(seed)
    tips = []
    for h, r0, (lx, ly), (bx, by) in trunks:
        r1 = r0 * 0.28
        b.cone(r0, r1, h, (bx + lx * h / 2, by + ly * h / 2, h / 2), 'birch', seg=6, jit=0.04, f=lambda v, lx=lx, ly=ly: Vector((v.x + lx * v.z, v.y + ly * v.z, v.z)))
        P = lambda z, lx=lx, ly=ly, bx=bx, by=by: Vector((bx + lx * z, by + ly * z, z))
        R = lambda z, r0=r0, r1=r1, h=h: r0 + (r1 - r0) * z / h
        # 밑동의 거친 검은 띠 둘 · 위로 갈수록 가로 검은 무늬
        for z in (0.35, 0.95):
            p = P(z)
            b.lathe([(R(z) * 1.08 + 0.006, z - 0.12), (R(z) * 1.08 + 0.004, z + 0.12)], (p.x, p.y, 0), 'birch_d', seg=6, cap=False, jit=0.05)
        for i in range(nd):
            z = 1.6 + i * (h * 0.62 - 1.6) / (nd - 1) + rr.random() * 0.3
            a = rr.random() * 6.28
            p = P(z) + Vector((math.cos(a), math.sin(a), 0)) * R(z) * 0.98
            b.box((0.06 + R(z) * 0.7, 0.03, 0.035), tuple(p), 'birch_d', rot=(0, 0, a + math.pi / 2), jit=0.05)
        # 가지: 굵은 가지(흰) + 끝의 처진 잔가지(밤색)
        for i in range(nb):
            z = h * 0.38 + (h * 0.55) * i / (nb - 1) + rr.random() * 0.3
            a = i * 2.4 + rr.random() * 0.8
            up = 0.5 + 0.35 * i / nb + rr.random() * 0.15
            ln = (2.0 - 1.1 * i / nb) * (0.85 + rr.random() * 0.3)
            p0 = P(z)
            d = Vector((math.cos(a) * math.sin(up), math.sin(a) * math.sin(up), math.cos(up)))
            p1 = p0 + d * ln
            limb(b, tuple(p0), tuple(p1), 0.05, 0.016, 'birch', seg=4, tone=0.92, jit=0.05)
            pm = p0 + d * ln * 0.6
            d2 = Vector((math.cos(a + 0.7) * 0.8, math.sin(a + 0.7) * 0.8, 0.45)).normalized()
            limb(b, tuple(pm), tuple(pm + d2 * ln * 0.45), 0.02, 0.006, 'twig', seg=3, cap=False, jit=0.06)
            d3 = Vector((d.x * 0.9, d.y * 0.9, -0.35)).normalized()
            limb(b, tuple(p1), tuple(p1 + d3 * 0.55), 0.014, 0.005, 'twig', seg=3, cap=False, jit=0.06)
            tips.append(p1)
        # 꼭대기 잔가지
        pt = P(h * 0.97)
        for a in (0.5, 2.6, 4.6):
            limb(b, tuple(pt), tuple(pt + Vector((math.cos(a) * 0.35, math.sin(a) * 0.35, 0.7))), 0.02, 0.005, 'twig', seg=3, cap=False)
    for i, p in enumerate(tips[1:1 + leaves * 2:2]):
        b.ball(0.2, (p.x, p.y, p.z - 0.05), 'leaf_y', sub=1, scale=(1.3, 1.3, 0.75), jit=0.12, f=wob(0.18, seed + i))
    b.done(name, smooth=0, shade=(0.74, 1.08), under=0.3)


birch('cs_birch', [(9.0, 0.17, (0.025, 0.01), (0, 0))], 3)
birch('cs_birch_b', [(8.0, 0.15, (0.09, 0.03), (0.1, 0.0)), (7.0, 0.13, (-0.1, -0.04), (-0.12, 0.03))], 8, leaves=2, nb=6, nd=5)


def larch():
    b = B()
    rr = random.Random(21)
    b.cone(0.21, 0.035, 9.8, (0, 0, 4.9), 'bark_l', seg=6, jit=0.05)
    n = 8
    for i in range(n):
        k = i / (n - 1)
        z = 2.2 + 6.8 * k
        rad = 1.7 * (1 - k) + 0.3
        hh = 0.85 * (1 - 0.3 * k)
        nc = 3 if i < n - 2 else 2
        a0 = rr.random() * 6.28
        for j in range(nc):
            a = a0 + j * 2 * math.pi / nc + (rr.random() - 0.5) * 0.6
            off = rad * 0.38
            cr = rad * (0.62 + rr.random() * 0.12)
            zz = z + (rr.random() - 0.5) * 0.3
            b.cone(cr, cr * 0.2, hh, (math.cos(a) * off, math.sin(a) * off, zz), 'larch' if (i + j) % 2 == 0 else 'larch_d', seg=6, jit=0.1, rot=(0.12 * math.sin(a), -0.12 * math.cos(a), rr.random() * 3), f=wob(0.14, 30 + i * 5 + j))
            if j == 0 and i < n - 2:
                limb(b, (0, 0, zz - hh * 0.5), (math.cos(a) * rad * 0.9, math.sin(a) * rad * 0.9, zz - hh * 0.5 - 0.12), 0.04, 0.012, 'bark_l', seg=3, cap=False)
    b.cone(0.22, 0.01, 0.9, (0, 0, 10.0), 'larch', seg=6, jit=0.08)
    b.done('cs_larch', smooth=0, shade=(0.66, 1.1), under=0.4)


larch()


def spruce(name, snow=False, seed=41):
    b = B()
    rr = random.Random(seed)
    b.cone(0.2, 0.08, 3.0, (0, 0, 1.5), 'bark_l', seg=6, jit=0.05)
    n = 8
    for i in range(n):
        k = i / (n - 1)
        z = 1.55 + 6.6 * k
        rad = 1.45 * (1 - 0.82 * k) + 0.12
        hh = 1.55 * (1 - 0.3 * k)
        b.cone(rad, rad * 0.08, hh, ((rr.random() - 0.5) * 0.08, (rr.random() - 0.5) * 0.08, z), 'spruce' if i % 2 == 0 else 'spruce_d', seg=7, jit=0.1, rot=(0, 0, rr.random() * 3), f=wob(0.09, seed + i))
        if snow:
            b.cone(rad * 0.8, rad * 0.06, hh * 0.55, (0, 0, z + hh * 0.24), 'snow', seg=7, jit=0.03, rot=(0, 0, rr.random() * 3), f=wob(0.1, seed + i + 20))
    b.cone(0.14, 0.01, 1.0, (0, 0, 9.0), 'spruce_d', seg=5, jit=0.06)
    if snow:
        b.ball(0.12, (0, 0, 9.05), 'snow', sub=1, scale=(1, 1, 1.4))
    b.done(name, smooth=0, shade=(0.64, 1.1), under=0.4)


spruce('cs_spruce')
spruce('cs_spruce_snow', snow=True)

b = B()
b.cone(0.13, 0.09, 1.3, (0, 0, 0.65), 'tint_bark', seg=4, jit=0.05)
b.cone(1.35, 0.01, 5.6, (0, 0, 1.0 + 2.8), 'tint_leaf', seg=7, jit=0.1, f=wob(0.08, 3))
b.done('cs_tree_far', smooth=0, shade=(0.62, 1.1), under=0.45)

# 잎 진 떨기나무 · 마른 풀
b = B()
rr = random.Random(55)
for i in range(15):
    a = i * 2.39 + rr.random() * 0.5
    up = 0.2 + rr.random() * 0.6
    ln = 0.75 + rr.random() * 0.55
    p0 = Vector((math.cos(a) * 0.08, math.sin(a) * 0.08, 0.0))
    d = Vector((math.cos(a) * math.sin(up), math.sin(a) * math.sin(up), math.cos(up)))
    p1 = p0 + d * ln
    limb(b, tuple(p0), tuple(p1), 0.028, 0.007, 'brush' if i % 3 else 'brush_d', seg=3, cap=False, jit=0.08)
    pm = p0 + d * ln * (0.45 + rr.random() * 0.2)
    d2 = Vector((math.cos(a + 0.9) * 0.6, math.sin(a + 0.9) * 0.6, 0.8)).normalized()
    limb(b, tuple(pm), tuple(pm + d2 * ln * 0.4), 0.014, 0.004, 'brush_d', seg=3, cap=False, jit=0.08)
b.ball(0.13, (0, 0, 0.05), 'brush_d', sub=1, scale=(1.4, 1.4, 0.6), jit=0.1)
for i, (x, y, z) in enumerate([(0.3, -0.2, 0.75), (-0.25, 0.3, 0.9)]):
    b.ball(0.05, (x, y, z), 'dry_d', sub=1, scale=(1.2, 0.5, 0.8), jit=0.1)
blades(b, 6, 0.25, 0.35, 'dry', 'dry_d', seed=56)
b.done('cs_bush_dry', smooth=0, shade=(0.7, 1.1), under=0.2)

b = B()
blades(b, 15, 0.24, 0.62, 'dry', 'dry_d', seed=4, head='dry_h', every=3)
b.done('cs_grass_dry', smooth=0, shade=(0.66, 1.12), under=0.1)


# ═════════ 6~7 바위 ═════════
b = B()
blocks = [((9.0, 6.0, 2.6), (0, 0, 1.2), 0.05, 0.94), ((7.4, 5.2, 2.8), (-0.4, 0.3, 3.75), -0.08, 1.0), ((5.6, 4.4, 2.5), (0.3, 0.0, 6.2), 0.12, 1.03),
          ((3.6, 3.2, 1.5), (-0.2, 0.3, 7.95), -0.1, 1.06), ((3.2, 2.8, 3.6), (3.6, -1.1, 2.1), 0.2, 0.92), ((2.8, 2.4, 2.8), (-3.8, 1.0, 2.3), -0.25, 0.9),
          ((2.2, 2.0, 1.8), (2.6, 1.6, 4.6), 0.3, 0.97), ((1.8, 1.6, 1.3), (-2.4, -3.3, 0.55), 0.4, 0.88), ((2.4, 2.0, 2.2), (-2.6, -1.4, 5.4), 0.15, 0.98)]
for i, (sz, loc, rz, tn) in enumerate(blocks):
    b.box(sz, loc, 'granite', rot=(0, 0, rz), bevel=0.28, tone=tn, jit=0.07, f=wob(0.05, 70 + i))
for i, (x, z, h) in enumerate([(-1.6, 1.4, 2.0), (1.2, 1.1, 1.6), (-0.8, 3.9, 2.2), (1.6, 4.0, 1.8), (0.4, 6.3, 1.9), (-1.4, 6.0, 1.4), (2.9, 2.2, 2.4)]):
    y = -3.0 if z < 2.5 else (-2.3 if z < 5 else -1.9)
    if x > 2.5:
        y = -2.45
    b.box((0.12, 0.7, h), (x, y, z), 'granite_d', rot=(0, (i % 3 - 1) * 0.15, 0), jit=0.05)
for x, y in ((-3.2, 0.2), (4.0, 0.4)):
    b.box((0.7, 0.12, 1.6), (x * 1.12, y, 1.4), 'granite_d', jit=0.05)
for i, (x, y, z, r) in enumerate([(-2.5, -2.2, 2.62, 0.9), (2.2, -1.6, 5.0, 0.7), (-0.6, -1.5, 7.25, 0.8), (3.4, -0.4, 3.95, 0.6)]):
    b.ball(r, (x, y, z), 'moss', sub=1, scale=(1.4, 1.0, 0.22), jit=0.1, f=wob(0.18, 80 + i))
b.ball(1.5, (-0.2, 0.3, 8.7), 'frost', sub=1, scale=(1.15, 1.0, 0.18), jit=0.04, f=wob(0.12, 90))
b.ball(1.0, (1.6, 1.4, 7.45), 'frost', sub=1, scale=(1.2, 1.0, 0.16), jit=0.04, f=wob(0.12, 91))
for i, (x, y, r) in enumerate([(3.3, -3.4, 0.45), (-4.6, -1.6, 0.4), (1.0, -3.6, 0.3)]):
    b.ball(r, (x, y, r * 0.5), 'granite_l', sub=1, scale=(1.2, 1.0, 0.8), jit=0.08, f=wob(0.18, 95 + i))
b.done('cs_crag', smooth=0, shade=(0.6, 1.12), under=0.35)

b = B()
b.ball(1.0, (0, 0, 1.0), 'granite', sub=2, scale=(1.5, 1.1, 1.12), jit=0.08, f=wob(0.12, 101))
b.ball(0.75, (0.15, 0.1, 1.93), 'moss', sub=1, scale=(1.2, 0.9, 0.3), jit=0.1, f=wob(0.15, 102))
b.ball(0.45, (-0.55, -0.2, 1.9), 'frost', sub=1, scale=(1.1, 0.9, 0.28), jit=0.04, f=wob(0.12, 103))
b.box((0.08, 0.5, 1.0), (0.45, -1.02, 0.85), 'granite_d', rot=(0, 0.2, 0.15), jit=0.05)
b.done('cs_boulder', smooth=0, shade=(0.6, 1.12), under=0.35)

b = B()
for i, (r, sc, loc) in enumerate([(0.55, (1.1, 0.9, 1.0), (-0.55, 0.05, 0.5)), (0.46, (1.05, 0.9, 0.85), (0.5, 0.18, 0.36)), (0.34, (1.2, 1.0, 0.7), (0.12, -0.42, 0.22))]):
    b.ball(r, loc, 'granite', sub=1, scale=sc, jit=0.08, f=wob(0.16, 110 + i))
b.ball(0.3, (-0.52, 0.05, 0.94), 'moss', sub=1, scale=(1.1, 0.9, 0.35), jit=0.1, f=wob(0.15, 115))
b.done('cs_rocks', smooth=0, shade=(0.6, 1.12), under=0.35)

b = B()
b.lathe([(0.5, -0.1), (0.56, 0.35), (0.52, 1.1), (0.46, 1.7), (0.32, 2.2), (0.1, 2.42)], (0, 0, 0), 'granite', seg=7, scale=(1, 0.78, 1), jit=0.08, f=wob(0.05, 120))
b.lathe([(0.535, 1.38), (0.525, 1.52)], (0, 0, 0), 'cloth_w', seg=7, cap=False, scale=(1, 0.78, 1), jit=0.03)
b.box((0.1, 0.06, 0.1), (0.16, -0.4, 1.45), 'cloth_w', bevel=0.02, jit=0)
b.box((0.07, 0.02, 0.46), (0.13, -0.42, 1.2), 'cloth_w', rot=(0.12, 0.08, 0.1), jit=0)
b.box((0.07, 0.02, 0.36), (0.21, -0.405, 1.25), 'cloth_w', rot=(0.1, 0.12, 0.1), jit=0)
b.ball(0.26, (0.05, 0.0, 2.22), 'moss', sub=1, scale=(1, 0.8, 0.35), jit=0.1)
b.done('cs_marker_rock', smooth=0, shade=(0.62, 1.12), under=0.3)


# ═════════ 8 천막 ═════════
b = B()
SL = math.atan2(1.8, 1.15)
b.prism([(-1.15, 0), (1.15, 0), (0, 1.8)], 3.0, (0, 0, 0), 'canvas', jit=0.04)
for s, u, y, w, h, m in [(1, 0.3, 0.6, 0.6, 0.45, 'canvas_p'), (1, 0.62, -0.7, 0.4, 0.35, 'canvas_d'), (-1, 0.4, 0.2, 0.55, 0.5, 'canvas_d'), (-1, 0.22, -1.0, 0.35, 0.3, 'canvas_p')]:
    L = math.hypot(1.15, 1.8)
    px = s * 1.15 * (1 - u)
    pz = 1.8 * u
    nx, nz = s * math.sin(SL), math.cos(SL)
    b.box((h, w, 0.02), (px + nx * 0.012, y, pz + nz * 0.012), m, rot=(0, s * SL, 0), jit=0.03)
b.prism([(-0.42, 0), (0.42, 0), (0, 1.25)], 0.02, (0, -1.505, 0), 'dark', jit=0)
b.prism([(-0.8, 0.02), (-0.42, 0.0), (-0.05, 1.22)], 0.03, (0, -1.53, 0), 'canvas_p', jit=0.03)
b.prism([(0.42, 0.0), (0.82, 0.02), (0.05, 1.22)], 0.03, (0, -1.53, 0), 'canvas_p', jit=0.03)
limb(b, (0, -1.68, 1.81), (0, 1.68, 1.81), 0.035, 0.035, 'pole', seg=5)
for s in (-1, 1):
    limb(b, (0, s * 1.56, 0), (0, s * 1.56, 1.95), 0.035, 0.03, 'pole', seg=5)
    limb(b, (0, s * 1.56, 1.9), (0, s * 2.45, 0.02), 0.008, 0.008, 'rope', seg=3)
    b.box((0.05, 0.05, 0.22), (0, s * 2.47, 0.06), 'wood', rot=(s * 0.3, 0, 0))
    for y in (-1.2, 0, 1.2):
        b.box((0.04, 0.04, 0.18), (s * 1.28, y, 0.05), 'wood', rot=(0, s * 0.3, 0))
b.done('cs_tent', smooth=0, shade=(0.74, 1.08), under=0.25)

# 적 천막(반듯한 것 — 같은 크기, 무늬 없이 한 빛깔) — 11-23 장 3 천수평
mat('canvas_jp', 0x7c7a5c); mat('canvas_jpd', 0x5c5a44)
b = B()
b.prism([(-1.15, 0), (1.15, 0), (0, 1.8)], 3.0, (0, 0, 0), 'canvas_jp', jit=0.01)
b.prism([(-0.42, 0), (0.42, 0), (0, 1.25)], 0.02, (0, -1.505, 0), 'canvas_jpd', jit=0)
limb(b, (0, -1.68, 1.81), (0, 1.68, 1.81), 0.035, 0.035, 'pole', seg=5)
for s in (-1, 1):
    limb(b, (0, s * 1.56, 0), (0, s * 1.56, 1.95), 0.035, 0.03, 'pole', seg=5)
    limb(b, (0, s * 1.56, 1.9), (0, s * 2.45, 0.02), 0.008, 0.008, 'rope', seg=3)
    b.box((0.05, 0.05, 0.22), (0, s * 2.47, 0.06), 'wood', rot=(s * 0.3, 0, 0))
b.done('cs_tent_jp', smooth=0, shade=(0.74, 1.08), under=0.25)

# 지휘 천막(벽 천막) — 앞 자락을 걷어 묶었고 안에 접이 탁자·걸상
b = B()
W2, D2, WH, RH = 1.8, 2.3, 1.5, 2.6
for s in (-1, 1):
    b.box((0.05, 2 * D2, WH), (s * W2, 0, WH / 2), 'canvas', jit=0.04)
    b.box((0.02, 2 * D2 - 0.1, WH - 0.05), (s * (W2 - 0.04), 0, WH / 2), 'canvas_in', jit=0.02)
    L = math.hypot(W2 + 0.15, RH - WH + 0.1)
    ang = math.atan2(RH - WH, W2)
    b.box((L, 2 * D2 + 0.3, 0.05), (s * (W2 + 0.15) / 2, 0, (RH + WH) / 2 - 0.02), 'canvas', rot=(0, s * ang, 0), jit=0.04)
    b.box((L - 0.1, 2 * D2, 0.02), (s * (W2 + 0.15) / 2 - s * 0.02, 0, (RH + WH) / 2 - 0.07), 'canvas_in', rot=(0, s * ang, 0), jit=0.02)
b.prism([(-W2, 0), (W2, 0), (W2, WH), (0, RH), (-W2, WH)], 0.05, (0, D2, 0), 'canvas', jit=0.04)
b.prism([(-W2 + 0.05, 0), (W2 - 0.05, 0), (W2 - 0.05, WH), (0, RH - 0.06), (-W2 + 0.05, WH)], 0.02, (0, D2 - 0.04, 0), 'canvas_in', jit=0.02)
b.prism([(-W2, 0), (-0.6, 0), (-0.6, 1.95), (0.6, 1.95), (0.6, 0), (W2, 0), (W2, WH), (0, RH), (-W2, WH)], 0.05, (0, -D2, 0), 'canvas', jit=0.04)
b.box((2 * W2 - 0.1, 2 * D2 - 0.1, 0.02), (0, 0, 0.01), 'canvas_d', jit=0.03)
for s in (-1, 1):
    limb(b, (s * 0.72, -D2 - 0.08, 0.15), (s * 0.72, -D2 - 0.08, 1.95), 0.11, 0.13, 'canvas_p', seg=6, jit=0.05)
    for z in (0.7, 1.55):
        b.lathe([(0.135, z), (0.135, z + 0.04)], (s * 0.72, -D2 - 0.08, 0), 'rope', seg=6, cap=False, jit=0)
    for p in (Vector((s * 2.2, -D2, 0.02)), Vector((s * 2.2, D2, 0.02))):
        limb(b, (s * W2, p.y, WH), tuple(p + Vector((s * 0.5, 0, 0))), 0.01, 0.01, 'rope', seg=3)
        b.box((0.05, 0.05, 0.22), tuple(p + Vector((s * 0.52, 0, 0.04))), 'wood', rot=(0, s * 0.3, 0))
limb(b, (0, -D2 - 0.25, RH + 0.02), (0, D2 + 0.25, RH + 0.02), 0.04, 0.04, 'pole', seg=5)
for s in (-1, 1):
    limb(b, (0, s * (D2 - 0.12), 0), (0, s * (D2 - 0.12), RH + 0.25), 0.045, 0.04, 'pole', seg=5)
# 접이 탁자 · 걸상 · 지도 통(글자 없음) · 등잔
TY = -1.05
b.box((1.0, 0.62, 0.04), (0, TY, 0.74), 'wood_l', bevel=0.01, jit=0.03)
for s in (-1, 1):
    limb(b, (s * 0.42, TY - 0.26, 0.02), (s * 0.42, TY + 0.26, 0.72), 0.02, 0.02, 'wood', seg=4)
    limb(b, (s * 0.42, TY + 0.26, 0.02), (s * 0.42, TY - 0.26, 0.72), 0.02, 0.02, 'wood', seg=4)
b.box((0.5, 0.36, 0.01), (0.08, TY + 0.02, 0.765), 'paper', rot=(0, 0, 0.12), jit=0)
limb(b, (-0.38, TY - 0.1, 0.79), (-0.1, TY - 0.15, 0.79), 0.03, 0.03, 'leather', seg=6)
b.lathe([(0.05, 0.76), (0.06, 0.8), (0.04, 0.86), (0.045, 0.9)], (0.34, TY + 0.15, 0), 'iron', seg=6, jit=0)
b.box((0.36, 0.36, 0.04), (0.55, TY - 0.55, 0.45), 'wood_l', bevel=0.01, jit=0.03)
for s in (-1, 1):
    limb(b, (0.55 + s * 0.15, TY - 0.7, 0.02), (0.55 - s * 0.15, TY - 0.4, 0.43), 0.018, 0.018, 'wood', seg=4)
b.box((0.6, 0.45, 0.4), (-1.1, 1.6, 0.2), 'crate', bevel=0.015, jit=0.04)
b.box((0.9, 1.8, 0.18), (1.2, 1.0, 0.09), 'blanket', bevel=0.04, jit=0.05)
b.done('cs_tent_cmd', smooth=0, shade=(0.74, 1.08), under=0.25)


# ═════════ 9 모닥불 ═════════
def stones(b, n, r, seed, sz=0.13):
    for i in range(n):
        a = i * 2 * math.pi / n + 0.2
        b.ball(sz, (math.cos(a) * r, math.sin(a) * r, sz * 0.55), 'stone', sub=1, scale=(1.25, 1.0, 0.75), tone=0.9 + (i % 3) * 0.06, jit=0.08, f=wob(0.18, seed + i), rot=(0, 0, a))


b = B()
stones(b, 9, 0.52, 130)
b.cone(0.44, 0.4, 0.03, (0, 0, 0.015), 'ash', seg=9, jit=0.05)
for i, a in enumerate((0.3, 1.9, 3.4, 4.9)):
    p0 = Vector((math.cos(a) * 0.42, math.sin(a) * 0.42, 0.04))
    p1 = Vector((math.cos(a) * 0.05, math.sin(a) * 0.05, 0.55))
    limb(b, tuple(p0), tuple(p0.lerp(p1, 0.55)), 0.055, 0.05, 'wood_d', seg=5)
    limb(b, tuple(p0.lerp(p1, 0.55)), tuple(p1), 0.05, 0.025, 'char', seg=5)
for (p0, p1) in (((-0.48, -0.16, 0.07), (0.48, 0.16, 0.07)), ((-0.14, 0.46, 0.12), (0.14, -0.46, 0.12))):
    limb(b, p0, p1, 0.06, 0.06, 'wood', seg=5)
    b.ball(0.07, ((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, p0[2] + 0.02), 'char', sub=1, scale=(1.6, 1.6, 0.8))
tongue(b, 'glow_fire', 0, 0.02, 0.24, 0.95, 0.9, 1, z0=0.06)
tongue(b, 'glow_fire', 0.14, -0.1, 0.17, 0.7, -0.8, 2, z0=0.06)
tongue(b, 'glow_fire', -0.13, -0.08, 0.14, 0.55, 0.7, 3, z0=0.06)
tongue(b, 'glow_fire', -0.04, 0.17, 0.12, 0.48, -0.6, 4, z0=0.06)
for i in range(7):
    a = i * 0.9 + 0.3
    d = 0.15 + (i % 3) * 0.08
    b.cone(0.045, 0.015, 0.04, (math.cos(a) * d, math.sin(a) * d, 0.03), 'glow_fire', seg=4, rot=(0, 0, a), jit=0.1)
b.done('cs_fire', smooth=0, shade=(0.72, 1.06), under=0.2)

b = B()
stones(b, 9, 0.52, 140)
b.ball(0.36, (0, 0, 0.0), 'ash', sub=1, scale=(1.15, 1.1, 0.28), jit=0.06, f=wob(0.15, 141))
for (p0, p1) in (((-0.4, -0.12, 0.08), (0.38, 0.14, 0.1)), ((-0.12, 0.4, 0.12), (0.18, -0.36, 0.08)), ((0.3, 0.25, 0.06), (-0.1, 0.05, 0.14))):
    limb(b, p0, p1, 0.055, 0.035, 'char', seg=5, jit=0.08)
limb(b, (0.42, -0.3, 0.05), (0.62, -0.42, 0.05), 0.05, 0.05, 'wood_d', seg=5)
b.done('cs_fire_cold', smooth=0, shade=(0.72, 1.06), under=0.2)


# ═════════ 10 짐 · 들것 · 탄약 상자 · 솥 ═════════
b = B()
b.ball(0.3, (-0.3, 0.12, 0.2), 'bojagi', sub=1, scale=(1.25, 1.0, 0.72), jit=0.08, f=wob(0.12, 150))
for s in (-1, 1):
    b.cone(0.07, 0.02, 0.16, (-0.3 + s * 0.07, 0.12, 0.45), 'bojagi', seg=4, rot=(0, s * 0.6, 0), tone=0.85, jit=0.05)
b.ball(0.06, (-0.3, 0.12, 0.41), 'bojagi', sub=1, tone=0.8)
# 깨진 나무 상자
BX = (0.32, -0.18, 0)
b.box((0.52, 0.36, 0.03), (BX[0], BX[1], 0.015), 'wood_l', rot=(0, 0, 0.2), jit=0.05)
for p, sz, rot in [((0, 0.17, 0.16), (0.52, 0.03, 0.3), (0, 0, 0)), ((-0.25, 0, 0.16), (0.03, 0.36, 0.3), (0, 0, 0)), ((0.25, 0, 0.12), (0.03, 0.36, 0.22), (0.15, 0, 0))]:
    b.box(sz, rzp(p, 0.2, BX), 'wood_l', rot=(rot[0], rot[1], 0.2), tone=0.95, jit=0.05)
b.box((0.5, 0.15, 0.025), rzp((0.05, -0.36, 0.02), 0.2, BX), 'wood', rot=(0, 0.05, 0.5), jit=0.05)
b.box((0.3, 0.14, 0.025), rzp((0.42, -0.25, 0.02), 0.2, BX), 'wood', rot=(0, 0, -0.4), jit=0.05)
b.box((0.55, 0.12, 0.025), (0.62, 0.25, 0.08), 'wood_l', rot=(0, -0.25, 1.1), jit=0.05)
# 찌그러진 솥(옆으로 누움)
b.lathe([(0.11, 0), (0.16, 0.04), (0.18, 0.15), (0.165, 0.21), (0.18, 0.23)], (0.02, 0.42, 0.17), 'iron', seg=8, jit=0.06,
        f=lambda v: Vector((v.x * (0.72 if v.x > 0.09 else 1.0), v.y, v.z)), rot=(math.pi / 2 - 0.15, 0, 2.2))
b.done('cs_pack_drop', smooth=0, shade=(0.72, 1.08), under=0.25)

b = B()
for s in (-1, 1):
    limb(b, (s * 0.3, -1.0, 0.16), (s * 0.3, 1.0, 0.16), 0.026, 0.026, 'pole', seg=5)
    for y in (-0.72, 0.72):
        b.box((0.04, 0.04, 0.14), (s * 0.3, y, 0.07), 'wood_d')
for y in (-0.76, 0.76):
    limb(b, (-0.32, y, 0.18), (0.32, y, 0.18), 0.02, 0.02, 'wood', seg=4)
b.box((0.58, 1.48, 0.02), (0, 0, 0.17), 'canvas', jit=0.04)
limb(b, (-0.27, 0.5, 0.27), (0.27, 0.5, 0.27), 0.095, 0.095, 'blanket', seg=8, jit=0.05)
for x in (-0.15, 0.15):
    b.lathe([(0.1, 0.17), (0.1, 0.37)], (x, 0.5, 0), 'rope', seg=6, cap=False, scale=(0.15, 1.0, 1.0), jit=0)
b.box((0.5, 0.75, 0.05), (0, -0.25, 0.205), 'blanket', bevel=0.02, tone=0.9, rot=(0, 0, 0.05), jit=0.05)
b.done('cs_stretcher', smooth=0, shade=(0.74, 1.08), under=0.25)


def crate(b, c, rz=0.0, tone=1.0):
    W, D, H = 0.8, 0.5, 0.4
    b.box((W, D, H), rzp((0, 0, H / 2), rz, c), 'crate', rot=(0, 0, rz), bevel=0.012, tone=tone, jit=0.05)
    for z in (H / 3, 2 * H / 3):
        b.box((W - 0.06, D + 0.006, 0.012), rzp((0, 0, z), rz, c), 'wood_d', rot=(0, 0, rz), jit=0)
    for s in (-1, 1):
        b.box((0.03, D + 0.02, H + 0.01), rzp((s * (W / 2 - 0.01), 0, H / 2), rz, c), 'wood_d', rot=(0, 0, rz), tone=1.1, jit=0.03)
        b.box((W + 0.02, 0.03, 0.04), rzp((0, s * (D / 2 + 0.002), H - 0.02), rz, c), 'wood_d', rot=(0, 0, rz), tone=1.1, jit=0.03)
        q = [rzp((s * (W / 2 + 0.015), yy, zz), rz, c) for yy, zz in ((-0.12, 0.29), (-0.1, 0.21), (0.1, 0.21), (0.12, 0.29))]
        q[1] = rzp((s * (W / 2 + 0.05), -0.1, 0.21), rz, c)
        q[2] = rzp((s * (W / 2 + 0.05), 0.1, 0.21), rz, c)
        for qa, qb in zip(q, q[1:]):
            limb(b, qa, qb, 0.011, 0.011, 'rope_d', seg=4)


b = B(); crate(b, (0, 0, 0)); b.done('cs_crate', smooth=0, shade=(0.76, 1.08), under=0.25)
b = B()
for c, rz, tn in [((-0.84, 0.0, 0), 0.03, 1.0), ((0.0, 0.06, 0), -0.04, 0.94), ((0.84, -0.03, 0), 0.06, 1.04), ((-0.42, 0.03, 0.41), -0.06, 1.02), ((0.43, 0.0, 0.41), 0.08, 0.96)]:
    crate(b, c, rz, tn)
b.done('cs_crate_pile', smooth=0, shade=(0.72, 1.08), under=0.25)

b = B()
for i in range(3):
    a = i * 2 * math.pi / 3 + 0.5
    b.ball(0.16, (math.cos(a) * 0.32, math.sin(a) * 0.32, 0.12), 'stone', sub=1, scale=(1.0, 0.9, 1.0), jit=0.08, f=wob(0.18, 160 + i))
b.lathe([(0.16, 0.2), (0.33, 0.26), (0.42, 0.4), (0.41, 0.56), (0.38, 0.62), (0.43, 0.64), (0.43, 0.67)], (0, 0, 0), 'iron', seg=10, jit=0.04)
b.lathe([(0.4, 0.66), (0.3, 0.72), (0.08, 0.75)], (0, 0, 0), 'iron', seg=10, tone=0.88, jit=0.04)
b.cone(0.05, 0.04, 0.06, (0, 0, 0.78), 'wood', seg=6)
for s in (-1, 1):
    b.box((0.08, 0.1, 0.06), (s * 0.45, 0, 0.6), 'iron', bevel=0.015)
for (p0, p1) in (((-0.25, -0.05, 0.05), (0.25, 0.08, 0.05)), ((0.05, -0.25, 0.06), (-0.05, 0.25, 0.06))):
    limb(b, p0, p1, 0.04, 0.035, 'char', seg=5)
b.cone(0.3, 0.26, 0.02, (0, 0, 0.01), 'ash', seg=8)
b.done('cs_pot', smooth=0, shade=(0.72, 1.08), under=0.25)


# ═════════ 11 신호 깃발 ═════════
b = B()
b.cone(0.035, 0.026, 2.6, (0, 0, 1.3), 'pole', seg=6, jit=0.04)
b.ball(0.045, (0, 0, 2.63), 'wood_d', sub=1)
sheet(b, 6, 2, lambda u, v: (0.035 + u * 1.0, 0.07 * math.sin(u * math.pi * 1.7) * u, 1.85 + 0.7 * v - 0.06 * u * u), 0.014, 'tint_cloth', jit=0.04)
for z in (1.88, 2.5):
    b.lathe([(0.042, z), (0.042, z + 0.04)], (0, 0, 0), 'rope', seg=6, cap=False, jit=0)
b.done('cs_flag', smooth=0, shade=(0.8, 1.06), under=0.15)


# ═════════ 12 귀틀집 · 울타리 ═════════
def loghouse(name, W, D, courses=8, thatch=False, chim_x=1, windows=((1.25, -1),)):
    b = B()
    r = 0.13
    step = 2 * r * 0.92
    ov = 0.3
    for i in range(courses):
        z = r + i * step
        for s in (-1, 1):
            limb(b, (-W / 2 - ov, s * D / 2, z), (W / 2 + ov, s * D / 2, z), r * 0.96, r, 'log' if (i + (s > 0)) % 2 else 'log_d', seg=5, hint=(0, 0, 1), jit=0.06)
        zz = z + step / 2
        for s in (-1, 1):
            limb(b, (s * W / 2, -D / 2 - ov, zz), (s * W / 2, D / 2 + ov, zz), r, r * 0.96, 'log_d' if (i + (s > 0)) % 2 else 'log', seg=5, hint=(0, 0, 1), jit=0.06)
            limb(b, (s * W / 2, -D / 2 - ov - 0.025, zz), (s * W / 2, -D / 2 - ov + 0.02, zz), r * 0.9, r * 0.9, 'log_end', seg=5, hint=(0, 0, 1), jit=0.04)
    top = r + (courses - 1) * step + step / 2 + r
    b.box((W - 0.06, D - 0.06, top - 0.1), (0, 0, (top - 0.1) / 2), 'mud', jit=0.04)
    fy = -D / 2 - r
    # 문 · 창(창호지)
    DX = -0.55 if W < 6 else -1.2
    b.box((0.82, 0.08, 1.62), (DX, fy - 0.02, 0.81), 'wood_d', jit=0.04)
    for k in range(3):
        b.box((0.02, 0.09, 1.5), (DX - 0.27 + k * 0.27, fy - 0.025, 0.81), 'dark', jit=0)
    for s in (-1, 1):
        b.box((0.1, 0.12, 1.8), (DX + s * 0.46, fy - 0.03, 0.9), 'wood', jit=0.04)
    b.box((1.04, 0.12, 0.1), (DX, fy - 0.03, 1.75), 'wood', jit=0.04)
    for wx, side in windows:
        b.box((0.62, 0.1, 0.5), (wx, fy - 0.03, 1.3), 'wood', jit=0.03)
        b.box((0.5, 0.11, 0.4), (wx, fy - 0.035, 1.3), 'paper', jit=0.02)
        b.box((0.02, 0.12, 0.4), (wx, fy - 0.04, 1.3), 'wood_d', jit=0)
        b.box((0.5, 0.12, 0.02), (wx, fy - 0.04, 1.3), 'wood_d', jit=0)
    # 박공 · 지붕
    E = 0.55
    RZ = top + 1.15
    for s in (-1, 1):
        b.prism([(-D / 2 - 0.05, 0), (D / 2 + 0.05, 0), (0, RZ - top)], 0.1, (s * (W / 2 + 0.02), 0, top - 0.02), 'wood_d', rot=(0, 0, math.pi / 2), jit=0.04)
        for k in (-1, 0, 1):
            b.box((0.02, 0.11, (RZ - top) * (0.85 - abs(k) * 0.45)), (s * (W / 2 + 0.03), k * 0.55, top + (RZ - top) * (0.85 - abs(k) * 0.45) / 2), 'dark', jit=0, rot=(0, 0, math.pi / 2))
    if not thatch:
        ang = math.atan2(RZ - top, D / 2 + E)
        L = math.hypot(D / 2 + E, RZ - top) + 0.08
        for s in (-1, 1):
            cy = s * (D / 2 + E) / 2
            b.box((W + 1.0, L, 0.14), (0, cy, (top + RZ) / 2 - 0.02), 'bark_roof', rot=(-s * ang, 0, 0), jit=0.08)
            for k, t in enumerate((0.3, 0.72)):
                y = s * (D / 2 + E) * (1 - t)
                z = top + (RZ - top) * t + 0.1
                limb(b, (-W / 2 - 0.45, y, z), (W / 2 + 0.45, y, z), 0.06, 0.055, 'log_d', seg=5, hint=(0, 0, 1))
                for j in range(2):
                    x = -W / 2 + (j + 0.5) * W / 2 + (k - 0.5) * 0.6
                    b.box((0.24, 0.2, 0.15), (x, y + s * 0.02, z + 0.08), 'stone', rot=(-s * ang, 0, j + k), jit=0.08)
        limb(b, (-W / 2 - 0.5, 0, RZ + 0.06), (W / 2 + 0.5, 0, RZ + 0.06), 0.08, 0.075, 'log', seg=5, hint=(0, 0, 1))
    else:
        prof = [(-D / 2 - E - 0.05, top - 0.12), (-D / 2 - E + 0.12, top + 0.1), (-0.9, RZ - 0.25), (-0.35, RZ + 0.08), (0.35, RZ + 0.08), (0.9, RZ - 0.25), (D / 2 + E - 0.12, top + 0.1), (D / 2 + E + 0.05, top - 0.12)]
        b.prism(prof, W + 0.9, (0, 0, 0), 'thatch', rot=(0, 0, math.pi / 2), jit=0.08)
        for k in range(5):
            x = -W / 2 + (k + 0.5) * W / 5
            for s in (-1, 1):
                obox(b, (x, s * (D / 2 + E - 0.05), top + 0.02), (x, s * 0.6, RZ - 0.1), 0.04, 0.03, 'thatch_d', jit=0)
        limb(b, (-W / 2 - 0.45, 0, RZ + 0.08), (W / 2 + 0.45, 0, RZ + 0.08), 0.12, 0.12, 'thatch_d', seg=6, hint=(0, 0, 1), jit=0.06)
    # 굴뚝(흙·돌)
    cx = chim_x * (W / 2 + 0.38)
    b.box((0.5, 0.5, RZ + 0.25), (cx, 0.9, (RZ + 0.25) / 2), 'mud', jit=0.06, f=lambda v: Vector((v.x * (1 - 0.15 * (v.z / (RZ + 0.25) + 0.5)), v.y * (1 - 0.15 * (v.z / (RZ + 0.25) + 0.5)), v.z)))
    b.box((0.56, 0.56, 0.12), (cx, 0.9, RZ + 0.3), 'stone', jit=0.06)
    for k in range(3):
        b.box((0.52, 0.52, 0.05), (cx, 0.9, 0.5 + k * 0.9), 'stone', jit=0.06, tone=0.9)
    b.done(name, smooth=0, shade=(0.7, 1.08), under=0.25)


loghouse('cs_loghouse', 5.0, 4.0, courses=8, chim_x=1, windows=((1.25, -1),))
loghouse('cs_loghouse_b', 7.0, 4.0, courses=8, thatch=True, chim_x=-1, windows=((0.4, -1), (2.0, -1)))

b = B()
rr = random.Random(170)
for i in range(16):
    x = -1.9 + i * 0.253
    h = 1.0 + rr.random() * 0.3
    lean = (rr.random() - 0.5) * 0.1
    limb(b, (x, 0, -0.05), (x + lean * h, 0.0, h), 0.035, 0.022, 'pole' if i % 2 else 'wood_d', seg=4, jit=0.08)
for z in (0.38, 0.85):
    limb(b, (-2.05, -0.05, z), (2.05, -0.05, z + 0.03), 0.03, 0.028, 'wood', seg=5, jit=0.06)
for x in (-1.9, -0.1, 1.67):
    for z in (0.38, 0.85):
        b.lathe([(0.045, z - 0.03), (0.045, z + 0.03)], (x, -0.02, 0), 'rope', seg=5, cap=False, jit=0)
b.done('cs_fence', smooth=0, shade=(0.72, 1.08), under=0.2)


# ═════════ 13~17 사람에 붙이는 것(사람 머리 가운데 z 1.66) ═════════
def furhat(b, c, sc=1.0, seg=10, lite=False):
    cx, cy, cz = c
    z0 = cz + 0.085 * sc
    b.lathe([(0.225 * sc, z0 + 0.04 * sc), (0.232 * sc, z0 + 0.14 * sc), (0.2 * sc, z0 + 0.215 * sc), (0.11 * sc, z0 + 0.25 * sc), (0.02 * sc, z0 + 0.255 * sc)], (cx, cy, 0), 'hatcloth', seg=seg, jit=0.04)
    b.lathe([(0.238 * sc, z0), (0.256 * sc, z0 + 0.025 * sc), (0.262 * sc, z0 + 0.11 * sc), (0.245 * sc, z0 + 0.145 * sc), (0.21 * sc, z0 + 0.15 * sc)], (cx, cy, 0), 'fur', seg=seg, jit=0.12, f=lambda v: Vector((v.x, v.y, v.z + (0.025 * sc if v.y < cy - 0.15 * sc else 0))))
    bv = 0 if lite else 0.015 * sc
    for s in (-1, 1):
        b.box((0.05 * sc, 0.25 * sc, 0.15 * sc), (cx + s * 0.238 * sc, cy + 0.01 * sc, z0 + 0.12 * sc), 'fur', rot=(0, -s * 0.55, 0), bevel=bv, jit=0.12)
    b.box((0.3 * sc, 0.05 * sc, 0.1 * sc), (cx, cy - 0.245 * sc, z0 + 0.105 * sc), 'fur', rot=(-0.4, 0, 0), bevel=bv, jit=0.12)
    if lite:
        b.cone(0.03 * sc, 0.01 * sc, 0.04 * sc, (cx, cy + 0.01 * sc, z0 + 0.26 * sc), 'hatcloth', seg=4, tone=0.8)
    else:
        b.ball(0.032 * sc, (cx, cy + 0.01 * sc, z0 + 0.255 * sc), 'hatcloth', sub=1, tone=0.8)
    if not lite:
        for s in (-1, 1):
            limb(b, (cx + s * 0.19 * sc, cy + 0.01 * sc, z0 + 0.2 * sc), (cx + s * 0.03 * sc, cy + 0.01 * sc, z0 + 0.26 * sc), 0.008 * sc, 0.008 * sc, 'hatcloth', seg=3, tone=0.75)


def jcap(b, c, sc=1.0, seg=10, flap=True, visor=1.0):
    cx, cy, cz = c
    z0 = cz + 0.1 * sc
    lift = lambda v: Vector((v.x, v.y, v.z + (0.02 * sc if v.y < cy - 0.1 * sc and v.z < z0 + 0.01 * sc else 0)))
    b.lathe([(0.226 * sc, z0), (0.232 * sc, z0 + 0.09 * sc), (0.228 * sc, z0 + 0.165 * sc), (0.19 * sc, z0 + 0.2 * sc), (0.02 * sc, z0 + 0.21 * sc)], (cx, cy, 0), 'khaki', seg=seg, jit=0.03, f=lift)
    b.lathe([(0.236 * sc, z0 + 0.005 * sc), (0.238 * sc, z0 + 0.05 * sc)], (cx, cy, 0), 'khaki_d', seg=seg, cap=False, jit=0, f=lift)
    b.box((0.26 * sc * visor, 0.11 * sc * visor, 0.018 * sc), (cx, cy - (0.215 + 0.05 * visor) * sc, z0 + 0.02 * sc), 'brim', rot=(0.28, 0, 0), jit=0)
    if flap:
        b.box((0.34 * sc, 0.02 * sc, 0.13 * sc), (cx, cy + 0.215 * sc, z0 - 0.055 * sc), 'khaki', rot=(-0.22, 0, 0), jit=0.03)
        for s in (-1, 1):
            b.box((0.02 * sc, 0.16 * sc, 0.11 * sc), (cx + s * 0.225 * sc, cy + 0.12 * sc, z0 - 0.045 * sc), 'khaki', rot=(0, s * 0.12, 0), jit=0.03)


def rifle(b, butt, muzzle, hint, lite=False):
    F = frame(butt, muzzle, hint)
    fbox(b, F, 0.0, 0.27, 0.045, 0.12, 'stock', oy=-0.018, dtaper=-0.35, jit=0.03)
    fbox(b, F, 0.27, 0.8, 0.038, 0.05, 'stock', jit=0.03)
    fbox(b, F, 0.3, 0.43, 0.036, 0.035, 'gunmetal', oy=0.035, jit=0)
    fcone(b, F, 0.4, 1.0, 0.013, 0.011, 'gunmetal', oy=0.022, seg=4, jit=0)
    if not lite:
        fbox(b, F, 0.36, 0.38, 0.09, 0.02, 'gunmetal', ox=0.04, oy=0.035, jit=0)
        for t in (0.55, 0.78):
            fbox(b, F, t - 0.01, t + 0.01, 0.044, 0.058, 'gunmetal', jit=0)
        fbox(b, F, 0.33, 0.38, 0.03, 0.04, 'gunmetal', oy=-0.045, jit=0)
    return F


KH = (0, 0.01, 1.66)   # 사람(people.glb) 머리 가운데
KS = 0.54 / 0.38       # 인스턴스 병사 머리 → 사람 머리 비율

b = B(); furhat(b, KH, sc=KS, seg=12); b.done('cs_hat_fur', smooth=0, shade=(0.8, 1.1), under=0.15)
b = B(); jcap(b, KH, sc=KS, seg=12); b.done('cs_hat_jcap', shade=(0.84, 1.08), under=0.15)

b = B()
rifle(b, (0.28, 0.26, 0.55), (-0.22, 0.26, 1.7), (0, 1, 0))
SP = [(-0.17, 0.25, 1.58), (-0.26, 0.12, 1.4), (-0.27, -0.06, 1.38), (-0.22, -0.215, 1.22), (0.26, -0.215, 0.82), (0.36, -0.02, 0.68), (0.27, 0.24, 0.6)]
for p0, p1 in zip(SP, SP[1:]):
    obox(b, p0, p1, 0.05, 0.012, 'leather', hint=(0, 1, 0) if abs(p0[1] - p1[1]) < 0.1 else (1, 0, 0), jit=0)
b.done('cs_rifle', smooth=0, shade=(0.85, 1.06), under=0.1)

b = B()
b.box((0.5, 0.19, 0.36), (0, 0.315, 1.12), 'khaki_d', bevel=0.04, jit=0.04)
b.box((0.46, 0.04, 0.16), (0, 0.42, 1.2), 'khaki_d', bevel=0.015, tone=0.9, jit=0.03)
limb(b, (-0.3, 0.31, 1.37), (0.3, 0.31, 1.37), 0.08, 0.08, 'blanket', seg=8, hint=(0, 0, 1), jit=0.05)
for x in (-0.16, 0.16):
    limb(b, (x - 0.02, 0.31, 1.37), (x + 0.02, 0.31, 1.37), 0.087, 0.087, 'leather', seg=8, hint=(0, 0, 1), cap=False, jit=0)
for s in (-1, 1):
    for p0, p1 in (((s * 0.17, 0.22, 1.3), (s * 0.17, 0.03, 1.41)), ((s * 0.17, 0.03, 1.41), (s * 0.18, -0.21, 1.16)), ((s * 0.18, -0.21, 1.16), (s * 0.24, -0.2, 0.95))):
        obox(b, p0, p1, 0.05, 0.014, 'leather', hint=(1, 0, 0), jit=0)
b.done('cs_pack', smooth=0, shade=(0.8, 1.08), under=0.2)

b = B()
SCOPE_C = (0.08, -0.42, 1.68)
Fs = frame((SCOPE_C[0], SCOPE_C[1] + 0.19, SCOPE_C[2]), (SCOPE_C[0], SCOPE_C[1] - 0.19, SCOPE_C[2]))
fcone(b, Fs, 0.0, 0.18, 0.03, 0.032, 'brass', seg=8, jit=0)
fcone(b, Fs, 0.18, 0.7, 0.038, 0.042, 'leather', seg=8, jit=0.03)
fcone(b, Fs, 0.7, 1.0, 0.046, 0.052, 'brass', seg=8, jit=0)
for t in (0.18, 0.7):
    fcone(b, Fs, t - 0.015, t + 0.015, 0.05, 0.05, 'brass', seg=8, jit=0)
fcone(b, Fs, 0.99, 1.0, 0.04, 0.04, 'ink', seg=8, jit=0)
b.done('cs_scope', shade=(0.85, 1.1), under=0.1)


# ═════════ 18~22 한꺼번에 그리는 병사(키 ≈1.75, 한 덩이) ═════════
HEAD = (0.38, 0.36, 0.38)


def face(b, c):
    b.box(HEAD, c, 'skin', bevel=0.07, jit=0)
    for s in (-1, 1):
        b.box((0.045, 0.012, 0.055), (c[0] + s * 0.08, c[1] - 0.181, c[2] + 0.01), 'ink', jit=0)
        b.box((0.035, 0.06, 0.08), (c[0] + s * 0.197, c[1] + 0.0, c[2] - 0.01), 'skin', tone=0.93, jit=0)
    b.box((0.05, 0.03, 0.06), (c[0], c[1] - 0.19, c[2] - 0.045), 'skin', tone=0.94, jit=0)


def arm(b, sh, el, ha, m, r=0.07):
    limb(b, sh, el, r, r * 0.88, m, seg=6, jit=0.02)
    limb(b, el, ha, r * 0.88, r * 0.74, m, seg=6, jit=0.02)
    d = (Vector(ha) - Vector(el)).normalized()
    limb(b, tuple(Vector(ha) - d * 0.03), tuple(Vector(ha) + d * 0.08), 0.045, 0.035, 'skin', seg=5, jit=0)


def leg(b, hip, kn, an, toe, thigh, shin, foot, r=0.1, rings=True, fw=0.12):
    limb(b, hip, kn, r, r * 0.82, thigh, seg=6, jit=0.02)
    F = frame(kn, an)
    fcone(b, F, 0, 1, r * 0.76, r * 0.6, shin, seg=6, jit=0.02)
    if rings:
        for t in (0.3, 0.65):
            fcone(b, F, t - 0.02, t + 0.02, r * (0.78 - 0.16 * t), r * (0.78 - 0.16 * t), shin, seg=6, cap=False, tone=0.8, jit=0)
    heel = Vector(an) + (Vector(an) - Vector(toe)).normalized() * 0.06
    obox(b, tuple(heel), toe, fw, 0.095, foot, jit=0.02)


def torso(b, p0, p1, w, d, m, taper=0.12, bands=(), hint=(1, 0, 0)):
    F = frame(p0, p1, hint)
    fbox(b, F, 0, 1, w, d, m, taper=taper, bevel=0.05, jit=0)
    for t in bands:
        ww = w * (1 + taper * (2 * t - 1)) + 0.018
        fbox(b, F, t - 0.018, t + 0.018, ww, d + 0.018, m, taper=0, tone=0.76, jit=0)
    return F


def jp_body(b, J):
    """일본군 보병(제복·모자·각반·배낭) — 몸통 앞 = 몸통 틀의 -Y."""
    F = torso(b, J['pel'], J['neck'], 0.42, 0.25, 'khaki', taper=0.1)
    fbox(b, F, 0.1, 0.2, 0.44, 0.27, 'leather', jit=0)
    for s in (-1, 1):
        fbox(b, F, 0.08, 0.24, 0.1, 0.06, 'leather', ox=s * 0.1, oy=-0.15, jit=0)
    fbox(b, F, 0.94, 1.04, 0.2, 0.22, 'khaki_d', jit=0)
    fbox(b, F, 0.25, 0.92, 0.035, 0.02, 'khaki_d', oy=-0.128, jit=0)
    face(b, J['head'])
    jcap(b, J['head'], 1.0, seg=8, flap=J.get('flap', True))
    arm(b, J['shL'], J['elL'], J['haL'], 'khaki')
    arm(b, J['shR'], J['elR'], J['haR'], 'khaki')
    for s in 'LR':
        leg(b, J['hip' + s], J['kn' + s], J['an' + s], J['toe' + s], 'khaki_t', J.get('shin', 'puttee'), 'boot', rings=J.get('rings', True))
    return F


def ia_body(b, J):
    """독립군(누빈 솜옷 · 바지 · 행전 · 짚신 · 털모자) — 옷 색은 tint_shirt · tint_pants."""
    F = torso(b, J['pel'], J['neck'], 0.46, 0.29, 'tint_shirt', taper=0.06, bands=(0.32, 0.56, 0.8))
    fbox(b, F, 0.04, 0.96, 0.03, 0.02, 'tint_shirt', ox=0.04, oy=-0.153, tone=0.72, jit=0)
    fbox(b, F, 0.13, 0.21, 0.47, 0.3, 'legging', tone=0.82, jit=0)
    face(b, J['head'])
    furhat(b, J['head'], 1.0, seg=8, lite=True)
    for s in 'LR':
        arm(b, J['sh' + s], J['el' + s], J['ha' + s], 'tint_shirt', r=0.078)
        Fa = frame(J['sh' + s], J['el' + s])
        fcone(b, Fa, 0.62, 0.68, 0.08, 0.078, 'tint_shirt', seg=6, cap=False, tone=0.76, jit=0)
        leg(b, J['hip' + s], J['kn' + s], J['an' + s], J['toe' + s], 'tint_pants', 'legging', 'straw', r=0.108, fw=0.12)
    return F


def scale_all(b, k):
    for v in b.bm.verts:
        v.co *= k


# 18 일본군 보병(행군): 왼발 앞 · 오른 어깨에 총(위·뒤로)
JJ = dict(head=(0, -0.01, 1.43), pel=(0, 0, 0.7), neck=(0, 0, 1.24),
          shL=(-0.27, 0, 1.15), elL=(-0.3, 0.08, 0.9), haL=(-0.3, 0.12, 0.66),
          shR=(0.27, 0, 1.15), elR=(0.33, -0.07, 0.9), haR=(0.29, -0.19, 1.0),
          hipL=(-0.11, 0, 0.8), knL=(-0.11, -0.1, 0.45), anL=(-0.11, -0.13, 0.09), toeL=(-0.11, -0.33, 0.05),
          hipR=(0.11, 0, 0.8), knR=(0.11, 0.07, 0.44), anR=(0.11, 0.17, 0.1), toeR=(0.11, -0.02, 0.04))
b = B()
jp_body(b, JJ)
b.box((0.38, 0.17, 0.32), (0, 0.215, 1.0), 'khaki_d', bevel=0.03, jit=0.03)
limb(b, (-0.24, 0.215, 1.22), (0.24, 0.215, 1.22), 0.065, 0.065, 'blanket', seg=6, hint=(0, 0, 1))
for s in (-1, 1):
    limb(b, (s * 0.24, 0.215, 1.22), (s * 0.24, 0.215, 0.92), 0.06, 0.055, 'blanket', seg=6)
    obox(b, (s * 0.15, 0.13, 1.16), (s * 0.15, -0.145, 1.08), 0.045, 0.012, 'leather', hint=(1, 0, 0), jit=0)
rifle(b, (0.3, -0.22, 0.99), (0.33, 0.53, 1.97), (1, 0, 0), lite=True)
b.done('cs_jp', shade=(0.8, 1.08), under=0.2)

def horse_body(b, saddle=True, graze=0.0):
    Fh = frame((0, 0.72, 1.18), (0, -0.66, 1.22))
    fbox(b, Fh, 0, 1, 0.56, 0.6, 'horse', bevel=0.13, dtaper=0.04, jit=0.03)
    b.ball(0.31, (0, 0.52, 1.24), 'horse', sub=1, scale=(0.95, 1, 1), jit=0.03)
    b.ball(0.3, (0, -0.52, 1.2), 'horse', sub=1, scale=(0.95, 1, 1.02), jit=0.03)
    NK = ((0, -0.58, 1.3), (0, -0.92, 1.86))
    Fn = frame(*NK)
    fbox(b, Fn, 0, 1, 0.22, 0.38, 'horse', taper=-0.2, dtaper=-0.25, bevel=0.05, jit=0.03)
    fbox(b, Fn, 0.12, 1.04, 0.06, 0.08, 'horse_d', oy=0.17, jit=0.06)
    Fhd = frame((0, -0.86, 1.98), (0, -1.22, 1.62))
    fbox(b, Fhd, 0, 1, 0.2, 0.26, 'horse', taper=-0.25, dtaper=-0.15, bevel=0.05, jit=0.03)
    fbox(b, Fhd, 0.6, 0.7, 0.21, 0.24, 'saddle', jit=0)
    for s in (-1, 1):
        b.cone(0.04, 0.008, 0.13, (s * 0.06, -0.82, 2.05), 'horse', seg=4, rot=(-0.2, s * 0.25, 0))
        b.box((0.02, 0.04, 0.04), (s * 0.08, -1.0, 1.84), 'ink', jit=0)
    limb(b, (0, 0.76, 1.38), (0, 0.98, 0.78), 0.075, 0.045, 'horse_d', seg=5, jit=0.06)
    limb(b, (0, 0.98, 0.78), (0, 1.02, 0.6), 0.045, 0.02, 'horse_d', seg=5, jit=0.06)
    for x, y, dk, dh in [(-0.16, -0.5, -0.12, -0.1), (0.16, -0.5, 0.05, 0.03), (-0.16, 0.5, 0.08, 0.02), (0.16, 0.5, -0.06, -0.1)]:
        back = y > 0
        top = (x, y, 1.05)
        kn = (x, y + dk + (0.1 if back else 0), 0.55)
        ft = (x, y + dh, 0.12)
        limb(b, top, kn, 0.085, 0.058, 'horse', seg=6, jit=0.03)
        limb(b, kn, ft, 0.055, 0.045, 'horse', seg=5, jit=0.03)
        b.cone(0.07, 0.06, 0.12, (ft[0], ft[1] - 0.01, 0.06), 'hoof', seg=6)
    b.box((0.64, 0.66, 0.32), (0, -0.04, 1.4), 'saddlecloth', bevel=0.03, jit=0.03)
    b.box((0.4, 0.5, 0.1), (0, -0.04, 1.58), 'saddle', bevel=0.04, jit=0.03)
    for s in (-1, 1):
        limb(b, (s * 0.1, -1.1, 1.68), (s * 0.14, -0.4, 1.73), 0.008, 0.008, 'saddle', seg=3)
        limb(b, (s * 0.31, -0.04, 1.42), (s * 0.33, -0.14, 1.0), 0.01, 0.01, 'saddle', seg=3)


# 19 말 탄 장교
b = B()
horse_body(b)
JO = dict(head=(0, -0.04, 2.28), pel=(0, 0.0, 1.62), neck=(0, -0.02, 2.09), flap=False, shin='boot', rings=False,
          shL=(-0.27, -0.02, 2.0), elL=(-0.31, -0.2, 1.8), haL=(-0.14, -0.4, 1.73),
          shR=(0.27, -0.02, 2.0), elR=(0.31, -0.2, 1.8), haR=(0.14, -0.4, 1.73),
          hipL=(-0.13, -0.02, 1.64), knL=(-0.33, -0.26, 1.42), anL=(-0.33, -0.16, 1.03), toeL=(-0.33, -0.36, 0.99),
          hipR=(0.13, -0.02, 1.64), knR=(0.33, -0.26, 1.42), anR=(0.33, -0.16, 1.03), toeR=(0.33, -0.36, 0.99))
jp_body(b, JO)
b.done('cs_jp_off', shade=(0.74, 1.08), under=0.25)

# 말(매어 둔 것 · 안장만) — 11-23 장 3 천수평
b = B()
horse_body(b)
b.done('cs_horse', shade=(0.74, 1.08), under=0.25)

# 20 독립군(서 있음, 총은 등에 비스듬히 · 허리에 천 주머니)
JI = dict(head=(0, -0.01, 1.43), pel=(0, 0, 0.66), neck=(0, 0, 1.24),
          shL=(-0.29, 0, 1.15), elL=(-0.33, 0.02, 0.89), haL=(-0.33, -0.02, 0.64),
          shR=(0.29, 0, 1.15), elR=(0.32, -0.04, 0.89), haR=(0.28, -0.1, 0.65),
          hipL=(-0.12, 0, 0.8), knL=(-0.13, -0.02, 0.45), anL=(-0.13, 0.0, 0.09), toeL=(-0.14, -0.2, 0.05),
          hipR=(0.12, 0, 0.8), knR=(0.13, -0.02, 0.45), anR=(0.13, 0.0, 0.09), toeR=(0.14, -0.2, 0.05))
b = B()
ia_body(b, JI)
rifle(b, (0.22, 0.2, 0.42), (-0.2, 0.2, 1.6), (0, 1, 0), lite=True)
for p0, p1 in (((-0.2, -0.165, 1.2), (0.22, -0.165, 0.78)), ((-0.2, 0.165, 1.2), (0.22, 0.165, 0.78)), ((-0.2, -0.165, 1.2), (-0.22, 0.0, 1.25)), ((-0.22, 0.0, 1.25), (-0.2, 0.165, 1.2))):
    obox(b, p0, p1, 0.055, 0.015, 'leather', hint=(0, 1, 0) if abs(p0[1] - p1[1]) < 0.1 else (1, 0, 0), jit=0)
b.box((0.16, 0.08, 0.17), (0.27, -0.06, 0.72), 'bag', bevel=0.025, jit=0.04)
b.done('cs_ia', shade=(0.8, 1.08), under=0.2)

# 21 독립군 엎드려 쏴(앞 = -y, 총구 y ≈ -1.4)
JP = dict(head=(-0.05, -0.43, 0.27), pel=(0, 0.36, 0.14), neck=(0, -0.2, 0.18),
          shL=(-0.25, -0.16, 0.2), elL=(-0.14, -0.55, 0.06), haL=(0.13, -0.76, 0.15),
          shR=(0.25, -0.16, 0.2), elR=(0.33, -0.42, 0.06), haR=(0.2, -0.52, 0.14),
          hipL=(-0.12, 0.38, 0.12), knL=(-0.17, 0.78, 0.09), anL=(-0.22, 1.16, 0.1), toeL=(-0.24, 1.22, -0.06),
          hipR=(0.12, 0.38, 0.12), knR=(0.17, 0.78, 0.09), anR=(0.24, 1.15, 0.1), toeR=(0.26, 1.21, -0.06))
b = B()
ia_body(b, JP)
rifle(b, (0.17, -0.2, 0.2), (0.15, -1.42, 0.23), (1, 0, 0), lite=True)
b.box((0.16, 0.17, 0.08), (0.3, 0.3, 0.08), 'bag', bevel=0.025, jit=0.04)
b.done('cs_ia_prone', shade=(0.8, 1.08), under=0.2)

# 22 독립군 무릎 쏴(오른 무릎을 땅에 · 총은 어깨에 앞으로)
JK = dict(head=(-0.04, -0.1, 1.1), pel=(0, 0.08, 0.42), neck=(0, -0.04, 0.93),
          shL=(-0.25, -0.08, 0.85), elL=(-0.06, -0.36, 0.8), haL=(0.15, -0.58, 0.94),
          shR=(0.27, -0.06, 0.86), elR=(0.38, -0.24, 0.8), haR=(0.2, -0.38, 0.93),
          hipL=(-0.11, 0.06, 0.5), knL=(-0.14, -0.36, 0.47), anL=(-0.14, -0.4, 0.09), toeL=(-0.15, -0.6, 0.05),
          hipR=(0.11, 0.08, 0.48), knR=(0.13, -0.02, 0.08), anR=(0.13, 0.38, 0.1), toeR=(0.13, 0.52, 0.03))
b = B()
ia_body(b, JK)
rifle(b, (0.19, -0.14, 0.97), (0.16, -1.37, 1.01), (1, 0, 0), lite=True)
b.box((0.16, 0.08, 0.17), (0.29, 0.0, 0.5), 'bag', bevel=0.025, jit=0.04)
b.done('cs_ia_kneel', shade=(0.8, 1.08), under=0.2)


# ═════════ 23~25 까마귀 · 산포 · 기관총 ═════════
b = B()
b.ball(0.07, (0, 0.0, 0.0), 'crow', sub=1, scale=(0.85, 1.9, 0.8), jit=0.04)
b.ball(0.05, (0, -0.15, 0.025), 'crow', sub=1, jit=0.04)
b.cone(0.022, 0.003, 0.07, (0, -0.215, 0.018), 'beak', seg=4, rot=(math.pi / 2 + 0.15, 0, 0))
for s in (-1, 1):
    b.box((0.012, 0.01, 0.012), (s * 0.03, -0.18, 0.04), 'beak', jit=0)
    W = [(0.03, -0.06), (0.2, -0.07), (0.33, -0.04), (0.37, 0.0), (0.33, 0.03), (0.3, 0.07), (0.25, 0.05), (0.2, 0.1), (0.14, 0.07), (0.08, 0.1), (0.03, 0.06)]
    pts = [(s * x, -y) for x, y in W]
    if s < 0:
        pts = list(reversed(pts))
    b.prism(pts, 0.012, (0, 0, 0.01), 'crow_b', rot=(math.pi / 2, s * -0.12, 0), jit=0.06)
b.prism([(-0.03, -0.08), (0.03, -0.08), (0.08, -0.22), (-0.08, -0.22)], 0.01, (0, 0, 0.0), 'crow_b', rot=(math.pi / 2, 0, 0), jit=0.06)
b.done('cs_crow', smooth=0, shade=(0.85, 1.1), under=0.1)

b = B()


def wheel(b, x, R=0.45, seg=10):
    b.lathe([(R - 0.05, -0.035), (R, -0.035), (R, 0.035), (R - 0.05, 0.035), (R - 0.05, -0.035)], (0, 0, 0), 'gun_d', seg=seg, cap=False, jit=0.03,
            f=lambda v: Vector((v.z + x, v.x, v.y + R)))
    b.cone(0.08, 0.08, 0.14, (x, 0, R), 'gun_d', seg=6, rot=(0, math.pi / 2, 0))
    for k in range(6):
        a = k * math.pi / 6
        b.box((0.03, 0.035, 2 * R - 0.08), (x, 0, R), 'wheel', rot=(a, 0, 0), jit=0)


for s in (-1, 1):
    wheel(b, s * 0.55)
limb(b, (-0.62, 0, 0.45), (0.62, 0, 0.45), 0.035, 0.035, 'gun_d', seg=5)
b.box((0.34, 0.5, 0.28), (0, -0.05, 0.62), 'gun_g', bevel=0.03, jit=0.03)
limb(b, (0, 0.1, 0.72), (0, -1.05, 0.8), 0.07, 0.055, 'gun_g', seg=8, jit=0.03)
limb(b, (0, -0.15, 0.72), (0, -0.72, 0.76), 0.085, 0.08, 'gun_d', seg=8, jit=0.03)
b.box((0.2, 0.3, 0.18), (0, 0.25, 0.73), 'gun_d', bevel=0.02)
for s in (-1, 1):
    limb(b, (s * 0.14, 0.05, 0.52), (s * 0.05, 1.2, 0.08), 0.05, 0.04, 'gun_g', seg=5, jit=0.03)
b.box((0.24, 0.12, 0.1), (0, 1.18, 0.05), 'gun_d', bevel=0.02)
b.box((0.9, 0.04, 0.5), (0, -0.33, 0.95), 'gun_g', rot=(-0.12, 0, 0), bevel=0.01, jit=0.03)
b.done('cs_gun', smooth=0, shade=(0.72, 1.08), under=0.2)

b = B()
for a, ln in ((math.pi / 2, 0.62), (math.pi / 2 + 2.3, 0.6), (math.pi / 2 - 2.3, 0.6)):
    a2 = a + math.pi
    limb(b, (0, 0.05, 0.42), (math.cos(a2) * ln * 0.85 * (1 if abs(math.cos(a2)) > 0.1 else 0), 0.05 + math.sin(a2) * ln * 0.85, 0.02), 0.025, 0.02, 'gunmetal', seg=4)
b.box((0.1, 0.1, 0.1), (0, 0.05, 0.43), 'gunmetal', bevel=0.015)
b.box((0.13, 0.42, 0.13), (0, 0.06, 0.52), 'gunmetal', bevel=0.015, jit=0.03)
limb(b, (0, -0.15, 0.53), (0, -0.62, 0.53), 0.05, 0.05, 'gunmetal', seg=8, jit=0.03)
for k in range(5):
    y = -0.2 - k * 0.08
    limb(b, (0, y, 0.53), (0, y - 0.025, 0.53), 0.065, 0.065, 'gunmetal', seg=8, tone=0.85, jit=0)
limb(b, (0, -0.62, 0.53), (0, -0.82, 0.53), 0.016, 0.016, 'gunmetal', seg=5)
for s in (-1, 1):
    limb(b, (s * 0.045, 0.27, 0.53), (s * 0.06, 0.37, 0.5), 0.015, 0.015, 'gunmetal', seg=4)
    b.box((0.03, 0.03, 0.08), (s * 0.06, 0.38, 0.5), 'stock', rot=(0.3, 0, 0))
b.box((0.18, 0.08, 0.02), (0.13, 0.03, 0.56), 'brass', rot=(0, 0.2, 0), jit=0)
b.box((0.3, 0.16, 0.2), (0.42, 0.15, 0.1), 'mg_box', bevel=0.012, jit=0.04)
b.box((0.1, 0.03, 0.03), (0.42, 0.15, 0.215), 'gunmetal', jit=0)
b.done('cs_mg', smooth=0, shade=(0.74, 1.08), under=0.2)


NAMES = ['cs_birch', 'cs_birch_b', 'cs_larch', 'cs_spruce', 'cs_spruce_snow', 'cs_tree_far', 'cs_bush_dry', 'cs_grass_dry', 'cs_crag', 'cs_boulder', 'cs_rocks', 'cs_marker_rock',
         'cs_tent', 'cs_tent_cmd', 'cs_fire', 'cs_fire_cold', 'cs_pack_drop', 'cs_stretcher', 'cs_crate', 'cs_crate_pile', 'cs_pot', 'cs_flag', 'cs_loghouse', 'cs_loghouse_b', 'cs_fence',
         'cs_hat_fur', 'cs_hat_jcap', 'cs_rifle', 'cs_pack', 'cs_scope', 'cs_jp', 'cs_jp_off', 'cs_ia', 'cs_ia_prone', 'cs_ia_kneel', 'cs_crow', 'cs_gun', 'cs_mg', 'cs_tent_jp', 'cs_horse']
have = {o.name for o in bpy.context.scene.objects}
print('MISSING', [n for n in NAMES if n not in have], 'EXTRA', [n for n in have if n not in NAMES])
for o in bpy.context.scene.objects:
    zs = [v.co.z for v in o.data.vertices]
    print('FACES %-16s %4d  z %.2f..%.2f  mats %s' % (o.name, len(o.data.polygons), min(zs), max(zs), ','.join(m.name for m in o.data.materials)))
export('cheongsan.glb')

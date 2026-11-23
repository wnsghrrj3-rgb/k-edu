"""청산리 — 엿새 장면 모델 둘째 묶음 — cheongsan2.glb (2026-11-23).
먼 산(눈 덮인 봉우리) · 화강암 벼랑 · 흩어진 돌 · 쓰러진 자작나무 · 눈 자리 · 갈대 · 개울 돌 · 늙은 소나무 ·
진지·마을 물건 · 큰 귀틀집(ㄱ자) · 사람에 붙이는 것 · 걸음이 엇갈리는 병사(인스턴스 짝) · 달리는 기병 · 마을 사람 · 먼 거리용 낮은 나무.
좌표: 블렌더 z 위 · 앞 = -y · 미터. 물체마다 원점 = 바닥 가운데(팔다리에 붙는 것은 그 팔다리의 돌림 중심).
make_cheongsan.py 는 불러오면 그 자리에서 다 짓기 때문에 불러오지 않고, 필요한 도구·몸 짓는 함수를 그대로 옮겨 왔다(크기·색·재질이 cs_jp · cs_ia 와 같다).
재질 이름이 약속: tint_* 는 장면이 색을 정하고 glow_* 는 스스로 빛난다. 깃발·표지·휘장·글자는 없다."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
mat('glow_lamp', 0xffd890, emit=0xffd890)
for n, c in [
    ('birch', 0xece8df), ('birch_d', 0x3a3530), ('twig', 0x5e5048), ('leaf_y', 0xe0b84a),
    ('larch', 0xd9a441), ('larch_d', 0xb8832f), ('bark_l', 0x5e4430),
    ('spruce', 0x2c4a3a), ('spruce_d', 0x233c30), ('snow', 0xf2f6fb), ('frost', 0xdfe7ec),
    ('brush', 0x6e5038), ('brush_d', 0x54402e), ('dry', 0xc2a466), ('dry_d', 0x9a7c48), ('dry_h', 0xd8c08a),
    ('granite', 0x8d8a84), ('granite_d', 0x5e5b57), ('granite_l', 0xa29f98), ('moss', 0x6b7a45),
    ('mt_forest', 0x4a5a58), ('mt_rock', 0x8a94a4), ('ice', 0xcfe0e8),
    ('pine_bark', 0xa4583a), ('pine_bark_d', 0x6e4a3a), ('pine', 0x2e4a34), ('pine_d', 0x243c2a),
    ('reed', 0xc8ae78), ('reed_d', 0x9a8256), ('reed_h', 0x8a6a48),
    ('canvas', 0xcdc3a6), ('canvas_d', 0x9e937a), ('dark', 0x2a2420),
    ('pole', 0x7a5632), ('wood', 0x8a6440), ('wood_d', 0x5a4028), ('wood_l', 0xb89868), ('rope', 0xc8b080), ('rope_d', 0x8a7550),
    ('stone', 0x8a8780), ('char', 0x2a2522), ('ash', 0x9a968f),
    ('bojagi', 0x5a6e8a), ('iron', 0x3a3a3e), ('blanket', 0x7e7e78), ('tint_cloth', 0xe8e0d0), ('cloth_w', 0xf2eee4),
    ('log', 0x8a6a48), ('log_d', 0x6e5236), ('log_end', 0xc8a878), ('bark_roof', 0x5e4a3a), ('thatch', 0xc9a456), ('thatch_d', 0xa8843e),
    ('mud', 0xa88a62), ('paper', 0xe8dcc0), ('pepper', 0xb8302a), ('corn', 0xe0b040), ('basket', 0xb08a50),
    ('skin', 0xeec39a), ('ink', 0x2b2118), ('khaki', 0x8a7f55), ('khaki_d', 0x746a46), ('khaki_t', 0x7a7350), ('puttee', 0xb0a27a),
    ('boot', 0x5a3e28), ('leather', 0x6a4a30), ('brim', 0x4a4232), ('brass', 0xc8a040), ('gunmetal', 0x2e3034), ('stock', 0x7a5232),
    ('fur', 0x6a4c34), ('hatcloth', 0x9a8a6a), ('tint_shirt', 0x4a4f58), ('tint_pants', 0x5a5448), ('legging', 0xc8bca0),
    ('straw', 0xd2b06c), ('bag', 0xa89878), ('hair_g', 0xb4b0a8), ('beard_g', 0xd8d4cc),
    ('horse', 0x7a4a2a), ('horse_d', 0x3a2618), ('hoof', 0x2a2220), ('saddle', 0x4a3020), ('saddlecloth', 0x4e4c3c)]:
    mat(n, c)


# ───────── 도구(make_cheongsan.py 와 같은 것) ─────────
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


def tp(F, x, y, t):
    """몸통 틀 F 안의 점(x 옆, y 등 쪽, t = 몸통 길이 비율)."""
    p0, X, Y, Z, L = F
    return tuple(p0 + X * x + Y * y + Z * (t * L))


def shell(b, nx, ny, outer, inner, m, **k):
    """두께 있는 휜 판: outer(u, v)·inner(u, v) → 점. 앞뒤와 가장자리를 다 닫는다."""
    t = bmesh.new()
    A = [[t.verts.new(Vector(outer(i / nx, j / ny))) for j in range(ny + 1)] for i in range(nx + 1)]
    Bv = [[t.verts.new(Vector(inner(i / nx, j / ny))) for j in range(ny + 1)] for i in range(nx + 1)]
    for i in range(nx):
        for j in range(ny):
            t.faces.new((A[i][j], A[i + 1][j], A[i + 1][j + 1], A[i][j + 1]))
            t.faces.new((Bv[i][j + 1], Bv[i + 1][j + 1], Bv[i + 1][j], Bv[i][j]))
    ring = [(i, 0) for i in range(nx)] + [(nx, j) for j in range(ny)] + [(i, ny) for i in range(nx, 0, -1)] + [(0, j) for j in range(ny, 0, -1)]
    for q in range(len(ring)):
        a, c = ring[q], ring[(q + 1) % len(ring)]
        t.faces.new((A[a[0]][a[1]], Bv[a[0]][a[1]], Bv[c[0]][c[1]], A[c[0]][c[1]]))
    return b._take(t, m, **k)


def sheet(b, nx, ny, fn, th, m, **k):
    return shell(b, nx, ny, lambda u, v: Vector(fn(u, v)) + Vector((0, -th / 2, 0)), lambda u, v: Vector(fn(u, v)) + Vector((0, th / 2, 0)), m, **k)


def paint(b, n0, pred, m):
    """n0 번째 면부터, pred(법선, 가운데) 가 참인 면의 재질을 m 으로."""
    b.bm.normal_update()
    b.bm.faces.ensure_lookup_table()
    mi = b._mi(m)
    for i in range(n0, len(b.bm.faces)):
        fc = b.bm.faces[i]
        if pred(fc.normal, fc.calc_center_median()):
            fc.material_index = mi


def nf(b):
    return len(b.bm.faces)


def card(b, pts, m, **k):
    """양면 한 장(납작한 다각형 앞·뒤 두 면) — 먼 거리용."""
    t = bmesh.new()
    vs = [t.verts.new(p) for p in pts]
    t.faces.new(vs)
    vs2 = [t.verts.new(p) for p in pts]
    t.faces.new(list(reversed(vs2)))
    me = bpy.data.meshes.new('tmp')
    t.to_mesh(me)
    t.free()
    n0 = len(b.bm.faces)
    b.bm.from_mesh(me)
    bpy.data.meshes.remove(me)
    b.bm.faces.ensure_lookup_table()
    mi = b._mi(m)
    for i in range(n0, len(b.bm.faces)):
        fc = b.bm.faces[i]
        fc.material_index = mi
        fc[b.tone] = k.get('tone', 1.0)
        fc[b.jit] = k.get('jit', 0.05)


def rzp(p, rz, c):
    x, y, z = p
    return (c[0] + x * math.cos(rz) - y * math.sin(rz), c[1] + x * math.sin(rz) + y * math.cos(rz), c[2] + z)


def ring_lathe(b, w, d, z0, z1, th, loc, m, **k):
    """네모 고리(몸통·머리를 두르는 띠): 바깥 반폭 w·d, 두께 th, z0~z1."""
    cx, cy = loc[0], loc[1]
    h = z1 - z0
    zc = (z0 + z1) / 2
    b.box((2 * w, th, h), (cx, cy - d + th / 2, zc), m, **k)
    b.box((2 * w, th, h), (cx, cy + d - th / 2, zc), m, **k)
    for s in (-1, 1):
        b.box((th, 2 * d - 2 * th, h), (cx + s * (w - th / 2), cy, zc), m, **k)


# ═════════ 1 먼 산 ═════════
def mountain(name, R, Ry, peaks, seed, nx=20, ny=12):
    rr = random.Random(seed)
    xs = [-R + 2 * R * i / nx for i in range(nx + 1)]
    ys = [-Ry + 2 * Ry * j / ny for j in range(ny + 1)]
    pk = set()
    for px, py, ph, pw in peaks:
        i = min(range(1, nx), key=lambda i: abs(xs[i] - px))
        j = min(range(1, ny), key=lambda j: abs(ys[j] - py))
        xs[i], ys[j] = px, py
        pk.add((i, j))

    def raw(x, y):
        s = sum((ph * max(0.0, 1 - math.hypot(x - px, y - py) / pw) ** 1.15) ** 4 for px, py, ph, pw in peaks) ** 0.25
        e = 1 - (x / R) ** 2 - (y / Ry) ** 2
        if e <= 0:
            return None, 0
        return s * min(1.0, e * 2.4) ** 0.55, e

    Hm = max(p[2] for p in peaks)

    def gully(x, y):
        return 0.5 + 0.5 * math.sin(0.12 * x + 0.9 * math.sin(0.045 * y + seed) + seed)

    t = bmesh.new()
    V = {}
    for i in range(nx + 1):
        for j in range(ny + 1):
            x, y = xs[i], ys[j]
            if (i, j) not in pk and 0 < i < nx and 0 < j < ny:
                x += (rr.random() - 0.5) * 0.45 * (2 * R / nx)
                y += (rr.random() - 0.5) * 0.45 * (2 * Ry / ny)
            h, e = raw(x, y)
            if h is None:
                z = -4.0
            else:
                fr = h / Hm
                h *= 1 - 0.2 * gully(x, y) * (1 - fr) * min(1.0, fr * 4)
                if (i, j) not in pk:
                    h *= 1 + (rr.random() - 0.5) * 0.08
                z = max(-4.0, h - 4.0 * (1 - min(1.0, e * 6)))
            V[(i, j)] = t.verts.new((x, y, z))
    for i in range(nx):
        for j in range(ny):
            q = [V[(i, j)], V[(i + 1, j)], V[(i + 1, j + 1)], V[(i, j + 1)]]
            if all(v.co.z < 0 for v in q):
                continue
            t.faces.new(q)
    b = B()
    n0 = nf(b)
    b._take(t, 'mt_rock', jit=0.07)
    b.bm.normal_update()
    b.bm.faces.ensure_lookup_table()
    ms, mf = b._mi('snow'), b._mi('mt_forest')
    for k in range(n0, len(b.bm.faces)):
        fc = b.bm.faces[k]
        c = fc.calc_center_median()
        fr = c.z / Hm
        g = gully(c.x, c.y)
        line = 0.6 + 0.07 * math.sin(0.05 * c.x + seed) + (rr.random() - 0.5) * 0.1 - 0.08 * g
        if fr > line or max(v.co.z for v in fc.verts) > Hm * 0.93:
            fc.material_index = ms
        elif fr < 0.24 + 0.05 * math.sin(0.07 * c.x + seed * 2):
            fc.material_index = mf
    b.done(name, smooth=0, shade=(0.66, 1.08), under=0.3)


mountain('cs_mount_a', 130, 105, [(6, -4, 165, 118), (-62, 14, 96, 70), (55, 20, 70, 60)], 3)
mountain('cs_mount_b', 130, 62, [(-52, 0, 142, 92), (46, 0, 130, 88), (-4, 0, 104, 70)], 5)
mountain('cs_mount_c', 130, 95, [(-42, 0, 152, 104), (44, 6, 146, 100), (0, -30, 70, 60)], 9)


# ═════════ 2 화강암 벼랑(옆으로 이어 붙임 · 뒤는 평평) ═════════
def cliff(name, blocks, tufts, seed, tree=None):
    """덩이(낮은 이십면체)를 쌓아 깎인 화강암 벽을 만든다. 뒤(y=+2.5)와 양옆(x=±7)은 잘라 평평하게 — 옆으로 이어 붙인다."""
    b = B()
    rr = random.Random(seed)
    BACK = 2.5
    S = []
    for i, (x0, x1, z0, z1, yf) in enumerate(blocks):
        cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
        hx = (x1 - x0) / 2 * (1.5 if (x0 <= -7 or x1 >= 7) else 1.3)
        hz = (z1 - z0) / 2 * 1.38
        sy = (BACK - yf) * 0.75
        cy = yf + sy
        S.append((cx, cy, cz, hx, sy, hz))
        tab = {}

        def f(v, cx=cx, cy=cy, cz=cz, hx=hx, sy=sy, hz=hz, tab=tab):
            key = (round(v.x, 3), round(v.y, 3), round(v.z, 3))
            if key not in tab:
                tab[key] = 1 + (rr.random() - 0.5) * 0.3
            k = tab[key]
            p = Vector((cx + v.x * hx * k, cy + v.y * sy * k, cz + v.z * hz * k))
            p.y = min(BACK, max(p.y, cy - sy * 0.6 + 0.1 * (p.z - cz) + (k - 1) * 0.6))
            p.x = max(-7.0, min(7.0, p.x))
            p.z = max(-0.3, p.z)
            return p
        b.ball(1.0, (0, 0, 0), 'granite', sub=1, tone=0.92 + rr.random() * 0.12, jit=0.08, f=f)
    paint(b, 0, lambda n, c: n.z > 0.72 and c.z > 1.0, 'frost')
    paint(b, 0, lambda n, c: abs(n.z) < 0.45 and n.y < -0.3 and rr.random() < 0.18, 'granite_d')
    paint(b, 0, lambda n, c: abs(n.z) < 0.5 and n.y < -0.3 and rr.random() < 0.12, 'granite_l')

    def top(x, y):
        best = None
        for cx, cy, cz, hx, sy, hz in S:
            if y < cy - sy * 0.6 + 0.1 * hz:
                continue
            q = 1 - ((x - cx) / hx) ** 2 - ((y - cy) / sy) ** 2
            if q > 0:
                z = cz + hz * math.sqrt(q)
                best = z if best is None else max(best, z)
        return (best or 0.0) - 0.15
    for tx, ty, n in tufts:
        tz = top(tx, ty)
        for k in range(n):
            a = rr.random() * 6.28
            hh = 0.5 + rr.random() * 0.4
            lean = 0.2 + rr.random() * 0.35
            b.cone(0.07, 0.006, hh, (tx + math.cos(a) * lean * hh / 2, ty + math.sin(a) * lean * hh / 2, tz + hh / 2), 'dry' if k % 2 else 'dry_d', seg=3, cap=False, rot=(0, lean, a), jit=0.1)
    if tree:
        tx, ty = tree
        tz = top(tx, ty) - 0.1
        limb(b, (tx, ty, tz - 0.1), (tx + 0.4, ty - 0.2, tz + 2.2), 0.12, 0.05, 'twig', seg=4, jit=0.06)
        for p1 in ((tx + 1.3, ty - 0.6, tz + 2.8), (tx - 0.5, ty - 0.3, tz + 2.6), (tx + 0.9, ty + 0.2, tz + 3.0)):
            limb(b, (tx + 0.3, ty - 0.15, tz + 1.6), p1, 0.05, 0.012, 'twig', seg=3, cap=False, jit=0.06)
    b.done(name, smooth=0, shade=(0.6, 1.1), under=0.35)


cliff('cs_cliff_a',
      [(-7, -3.5, 0, 4.2, -2.6), (-3.8, 0.2, 0, 3.8, -2.3), (-0.2, 3.6, 0, 4.4, -2.5), (3.3, 7, 0, 4.0, -2.4),
       (-7, -2.8, 3.6, 8.3, -1.5), (-3.0, 1.8, 3.8, 8.0, -1.1), (1.5, 7, 3.6, 8.2, -1.3),
       (-7, -3.4, 7.6, 12, -0.4), (-3.6, 0.9, 7.8, 11.8, 0.0), (0.6, 4.4, 7.5, 12.1, -0.3), (4.2, 7, 7.7, 11.9, -0.5)],
      [(-4.8, -0.75, 4), (4.6, -0.6, 4)], 11)
cliff('cs_cliff_b',
      [(-7, -2.6, 0, 4.0, -2.4), (-2.9, 1.4, 0, 4.6, -2.7), (1.1, 7, 0, 4.1, -2.3),
       (-7, -1.8, 3.7, 7.9, -1.0), (-2.1, 3.0, 4.2, 8.4, -1.6), (2.7, 7, 3.8, 8.0, -1.2),
       (-7, -2.0, 7.6, 12.0, 0.0), (-2.3, 2.6, 8.1, 11.8, -0.5), (2.3, 7, 7.8, 12.1, -0.2)],
      [(-5.0, -0.5, 3), (1.5, -0.9, 3)], 13, tree=(-4.6, 0.15))


# ═════════ 3 흩어진 돌 ═════════
def rock(name, r, sc, seed, top):
    b = B()
    n0 = nf(b)
    b.ball(r, (0, 0, r * sc[2] * 0.72), 'granite', sub=1, scale=sc, jit=0.09, f=wob(0.2, seed))
    paint(b, n0, lambda n, c: n.z > 0.72, top)
    b.done(name, smooth=0, shade=(0.62, 1.12), under=0.35)


rock('cs_rock_s1', 0.28, (1.2, 0.95, 0.8), 201, 'frost')
rock('cs_rock_s2', 0.42, (1.3, 1.0, 0.85), 202, 'moss')
rock('cs_rock_s3', 0.6, (1.15, 0.9, 0.95), 203, 'frost')


# ═════════ 4 쓰러진 자작나무 · 그루터기 ═════════
b = B()
n0 = nf(b)
limb(b, (-2.5, 0.0, 0.17), (2.4, 0.12, 0.13), 0.19, 0.12, 'birch', seg=6, jit=0.04)
paint(b, n0, lambda n, c: abs(n.x) > 0.9, 'log_end')
for x, a in ((-1.9, 0.3), (-0.8, 2.1), (0.6, 2.6), (1.7, 1.0)):
    b.box((0.14, 0.03, 0.04), (x, 0.03 + math.cos(a) * -0.16, 0.16 + math.sin(a) * 0.16), 'birch_d', rot=(a, 0, 0), jit=0.05)
for p0, p1 in (((-1.4, 0.05, 0.3), (-1.2, -0.3, 0.75)), ((0.2, 0.08, 0.3), (0.5, 0.3, 0.7)), ((1.2, 0.0, 0.25), (1.35, -0.45, 0.3))):
    limb(b, p0, p1, 0.06, 0.035, 'birch', seg=4, tone=0.92, jit=0.05)
b.box((4.2, 0.2, 0.06), (-0.1, 0.05, 0.33), 'snow', bevel=0.02, jit=0.03, f=wob(0.05, 211))
b.cone(0.2, 0.16, 0.12, (-2.55, 0.0, 0.17), 'log_end', seg=6, rot=(0, math.pi / 2, 0), jit=0.06, f=wob(0.15, 212))
b.done('cs_log_fallen', smooth=0, shade=(0.7, 1.08), under=0.3)

b = B()
b.cone(0.3, 0.24, 0.5, (0, 0, 0.25), 'bark_l', seg=7, jit=0.06, f=wob(0.06, 220))
b.cone(0.25, 0.27, 0.07, (0, 0, 0.53), 'snow', seg=7, jit=0.03, f=wob(0.08, 221))
for a in (0.4, 2.5, 4.4):
    limb(b, (math.cos(a) * 0.2, math.sin(a) * 0.2, 0.15), (math.cos(a) * 0.5, math.sin(a) * 0.5, 0.0), 0.09, 0.03, 'bark_l', seg=3, cap=False, jit=0.06)
b.done('cs_stump', smooth=0, shade=(0.7, 1.08), under=0.3)


# ═════════ 5 눈 자리 ═════════
def snowpatch(name, R, seed, n=10):
    rr = random.Random(seed)
    rad = [R * (0.7 + rr.random() * 0.45) for _ in range(n)]
    t = bmesh.new()
    c = t.verts.new((0, 0, 0.085))
    mid = [t.verts.new((math.cos(i * 6.283 / n) * rad[i] * 0.55, math.sin(i * 6.283 / n) * rad[i] * 0.55 * 0.8, 0.06)) for i in range(n)]
    out = [t.verts.new((math.cos(i * 6.283 / n) * rad[i], math.sin(i * 6.283 / n) * rad[i] * 0.8, -0.01)) for i in range(n)]
    for i in range(n):
        j = (i + 1) % n
        t.faces.new((c, mid[i], mid[j]))
        t.faces.new((mid[i], out[i], out[j], mid[j]))
    t.faces.new(list(reversed(out)))
    b = B()
    b._take(t, 'snow', jit=0.03)
    b.done(name, smooth=0, shade=(0.92, 1.04), under=0.1)


snowpatch('cs_snowpatch_a', 2.0, 231)
snowpatch('cs_snowpatch_b', 2.5, 232, n=12)


# ═════════ 6 갈대 · 개울 돌 ═════════
b = B()
rr = random.Random(240)
for i in range(17):
    a = rr.random() * 6.28
    d = rr.random() * 0.28
    hh = 1.1 + rr.random() * 0.55
    lean = 0.06 + rr.random() * 0.22
    x, y = math.cos(a) * d, math.sin(a) * d
    b.cone(0.03, 0.004, hh, (x + math.cos(a) * lean * hh / 2, y + math.sin(a) * lean * hh / 2, hh / 2), 'reed' if i % 3 else 'reed_d', seg=3, cap=False, rot=(0, lean, a), jit=0.1)
    if i % 3 == 0:
        tx, ty, tz = x + math.cos(a) * math.sin(lean) * hh, y + math.sin(a) * math.sin(lean) * hh, hh * math.cos(lean)
        b.cone(0.045, 0.01, 0.24, (tx + math.cos(a) * 0.02, ty + math.sin(a) * 0.02, tz - 0.02), 'reed_h', seg=3, cap=False, rot=(0, lean + 0.3, a), jit=0.1)
b.done('cs_reeds', smooth=0, shade=(0.66, 1.12), under=0.1)

b = B()
for i, (x, y, r, h) in enumerate([(0, 0, 0.42, 0.34), (0.62, 0.22, 0.32, 0.26), (-0.55, 0.3, 0.3, 0.22), (0.2, -0.55, 0.26, 0.2), (-0.35, -0.42, 0.22, 0.16)]):
    b.lathe([(r * 0.9, -0.02), (r, h * 0.45), (r * 0.35, h)], (x, y, 0), 'stone' if i % 2 else 'granite_l', seg=6, jit=0.08, rot=(0, 0, i), scale=(1.15, 0.9, 1), f=wob(0.12, 250 + i))
b.cone(1.15, 1.05, 0.03, (0.02, -0.04, 0.012), 'ice', seg=9, jit=0.04, f=wob(0.14, 256))
b.done('cs_river_rocks', smooth=0, shade=(0.66, 1.1), under=0.3)


# ═════════ 7 늙은 소나무(적송) ═════════
b = B()
rr = random.Random(260)
T0, T1, T2 = Vector((0, 0, -0.1)), Vector((0.55, 0.15, 6.0)), Vector((1.35, 0.25, 12.6))
limb(b, tuple(T0), tuple(T1), 0.46, 0.33, 'pine_bark_d', seg=6, jit=0.06)
limb(b, tuple(T1), tuple(T2), 0.33, 0.13, 'pine_bark', seg=6, jit=0.05)
for a in (0.3, 2.4, 4.3):
    limb(b, (math.cos(a) * 0.3, math.sin(a) * 0.3, 0.35), (math.cos(a) * 0.85, math.sin(a) * 0.85, -0.05), 0.2, 0.06, 'pine_bark_d', seg=3, cap=False, jit=0.06)
CL = []
for z, a, ln, up, R in ((7.6, 0.4, 3.4, 0.35, 1.9), (8.6, 2.8, 3.0, 0.4, 1.7), (9.6, 4.6, 2.6, 0.45, 1.6), (10.6, 1.6, 2.4, 0.5, 1.5), (11.4, 3.8, 1.9, 0.6, 1.3)):
    k = (z - 6.0) / 6.6
    p0 = T1.lerp(T2, k)
    d = Vector((math.cos(a), math.sin(a), up)).normalized()
    p1 = p0 + d * ln
    limb(b, tuple(p0), tuple(p1), 0.15, 0.07, 'pine_bark', seg=4, jit=0.05)
    CL.append((p1, R))
CL.append((T2 + Vector((0, 0, 0.2)), 1.8))
CL.append((T1.lerp(T2, 0.75) + Vector((-1.0, 0.8, 0.3)), 1.2))
for i, (p, R) in enumerate(CL):
    b.ball(R, tuple(p), 'pine' if i % 2 else 'pine_d', sub=1, scale=(1.25, 1.1, 0.42), jit=0.1, rot=(0, 0, i), f=wob(0.16, 270 + i))
    b.cone(R * 0.95, R * 0.35, R * 0.18, (p.x, p.y, p.z + R * 0.4), 'snow', seg=6, jit=0.04, rot=(0, 0, i * 0.7), scale=(1.15, 1.0, 1.0), f=wob(0.12, 280 + i))
b.done('cs_pine_big', smooth=0, shade=(0.62, 1.1), under=0.4)


# ═════════ 8 진지·마을 물건 ═════════
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


def stones(b, n, r, seed, sz=0.13):
    for i in range(n):
        a = i * 2 * math.pi / n + 0.2
        b.ball(sz, (math.cos(a) * r, math.sin(a) * r, sz * 0.55), 'stone', sub=1, scale=(1.25, 1.0, 0.75), tone=0.9 + (i % 3) * 0.06, jit=0.08, f=wob(0.18, seed + i), rot=(0, 0, a))


# 총 세 자루 세워 묶음
b = B()
TOP = Vector((0, 0, 1.28))
for i in range(3):
    a = i * 2 * math.pi / 3 + 0.3
    butt = Vector((math.cos(a) * 0.38, math.sin(a) * 0.38, 0.0))
    muz = TOP + (TOP - butt).normalized() * 0.08 + Vector((math.cos(a + 1.2) * 0.03, math.sin(a + 1.2) * 0.03, 0))
    rifle(b, tuple(butt), tuple(muz), (-math.sin(a), math.cos(a), 0))
b.done('cs_rifle_stack', smooth=0, shade=(0.78, 1.08), under=0.2)

# 말아 둔 담요 + 작은 짐
b = B()
n0 = nf(b)
limb(b, (-0.45, 0, 0.14), (0.45, 0, 0.14), 0.14, 0.14, 'blanket', seg=8, hint=(0, 0, 1), jit=0.05)
paint(b, n0, lambda n, c: abs(n.x) > 0.9, 'canvas_d')
for x in (-0.25, 0.25):
    limb(b, (x - 0.025, 0, 0.14), (x + 0.025, 0, 0.14), 0.147, 0.147, 'leather', seg=8, hint=(0, 0, 1), jit=0)
b.box((0.42, 0.24, 0.3), (0.12, 0.34, 0.15), 'bag', bevel=0.04, rot=(0, 0, 0.15), jit=0.05)
b.box((0.4, 0.2, 0.08), (0.12, 0.31, 0.29), 'bag', bevel=0.025, tone=0.88, rot=(0.25, 0, 0.15), jit=0.04)
for s in (-1, 1):
    obox(b, rzp((s * 0.1, -0.12, 0.29), 0.15, (0.12, 0.34, 0)), rzp((s * 0.1, -0.13, 0.08), 0.15, (0.12, 0.34, 0)), 0.03, 0.01, 'leather', jit=0)
b.done('cs_bedroll', smooth=0, shade=(0.74, 1.08), under=0.25)

# 세 발 장대 + 매단 무쇠 주전자 · 돌 둘레 · 탄 나무(불 없음)
b = B()
stones(b, 9, 0.55, 300)
b.cone(0.45, 0.4, 0.03, (0, 0, 0.015), 'ash', seg=9, jit=0.05)
for (p0, p1) in (((-0.42, -0.1, 0.06), (0.4, 0.14, 0.08)), ((-0.1, 0.4, 0.1), (0.15, -0.38, 0.07)), ((0.25, 0.25, 0.05), (-0.15, 0.0, 0.12))):
    limb(b, p0, p1, 0.05, 0.035, 'char', seg=5, jit=0.08)
APEX = Vector((0, 0, 1.6))
for i in range(3):
    a = i * 2 * math.pi / 3 + 0.5
    foot = Vector((math.cos(a) * 0.95, math.sin(a) * 0.95, 0.0))
    limb(b, tuple(foot), tuple(APEX + (APEX - foot).normalized() * 0.22), 0.04, 0.03, 'pole', seg=5, jit=0.05)
b.lathe([(0.065, APEX.z - 0.04), (0.065, APEX.z + 0.06)], (0, 0, 0), 'rope', seg=6, cap=False, jit=0)
limb(b, (0, 0, 1.58), (0, 0, 0.86), 0.012, 0.012, 'iron', seg=4)
b.lathe([(0.1, 0.42), (0.19, 0.46), (0.22, 0.56), (0.2, 0.66), (0.13, 0.72), (0.07, 0.74), (0.07, 0.77)], (0, 0, 0), 'iron', seg=9, jit=0.04)
limb(b, (0.17, 0, 0.55), (0.32, 0, 0.7), 0.035, 0.018, 'iron', seg=5)
BAIL = [(-0.2, 0, 0.66), (-0.17, 0, 0.8), (0, 0, 0.87), (0.17, 0, 0.8), (0.2, 0, 0.66)]
for p0, p1 in zip(BAIL, BAIL[1:]):
    limb(b, p0, p1, 0.01, 0.01, 'iron', seg=4)
b.done('cs_tripod_pot', smooth=0, shade=(0.72, 1.08), under=0.25)

# 지도 탁자(빈 종이 · 돌로 누름 · 등잔)
b = B()
for k, y in enumerate((-0.3, 0.0, 0.3)):
    b.box((1.5, 0.29, 0.05), (0.02 * (k - 1), y, 0.8), 'wood_l' if k % 2 else 'wood', bevel=0.01, jit=0.05, f=wob(0.01, 310 + k))
for s in (-1, 1):
    for t in (-1, 1):
        limb(b, (s * 0.64, t * 0.36, 0.0), (s * 0.6, t * 0.33, 0.78), 0.045, 0.04, 'wood_d', seg=5, jit=0.05)
    limb(b, (s * 0.62, -0.34, 0.3), (s * 0.62, 0.34, 0.3), 0.025, 0.025, 'wood_d', seg=4)
limb(b, (-0.62, 0, 0.3), (0.62, 0, 0.3), 0.025, 0.025, 'wood_d', seg=4)
b.box((0.8, 0.56, 0.006), (-0.12, 0.0, 0.828), 'paper', rot=(0, 0, 0.06), jit=0)
for i, (x, y) in enumerate([(-0.5, -0.24), (0.27, -0.25), (-0.54, 0.26), (0.28, 0.27)]):
    b.ball(0.045, (x, y, 0.85), 'stone', sub=1, scale=(1.3, 1.0, 0.7), jit=0.08, f=wob(0.2, 320 + i))
LX, LY = 0.55, 0.12
b.lathe([(0.07, 0.825), (0.07, 0.86)], (LX, LY, 0), 'iron', seg=6, jit=0)
b.lathe([(0.05, 0.86), (0.06, 0.94), (0.05, 1.02)], (LX, LY, 0), 'glow_lamp', seg=6, jit=0)
b.cone(0.07, 0.02, 0.06, (LX, LY, 1.05), 'iron', seg=6, jit=0)
for s in (-1, 1):
    limb(b, (LX + s * 0.06, LY, 0.86), (LX + s * 0.06, LY, 1.03), 0.006, 0.006, 'iron', seg=3)
limb(b, (LX - 0.04, LY, 1.08), (LX + 0.04, LY, 1.08), 0.006, 0.006, 'iron', seg=3)
b.done('cs_map_table', smooth=0, shade=(0.74, 1.08), under=0.25)

# 장작더미
b = B()
rr = random.Random(330)
for s in (-1, 1):
    limb(b, (s * 1.05, 0, -0.05), (s * 1.02, 0, 1.15), 0.05, 0.04, 'pole', seg=5, jit=0.05)
for row in range(5):
    z = 0.09 + row * 0.17
    n = 12 - (row % 2)
    for k in range(n):
        x = -0.92 + (k + 0.5 * (row % 2)) * (1.84 / 11) + (rr.random() - 0.5) * 0.03
        r = 0.085 + rr.random() * 0.02
        kind = rr.randrange(3)
        if kind == 0:
            pts = [(-r, -r * 0.7), (r, -r * 0.7), (0, r)]
        elif kind == 1:
            pts = [(-r, -r * 0.6), (r * 0.9, -r * 0.7), (r * 0.6, r * 0.6), (-r * 0.7, r * 0.7)]
        else:
            pts = [(-r, -r * 0.6), (r, -r * 0.6), (r * 0.7, r * 0.5), (0, r * 0.9), (-r * 0.7, r * 0.5)]
        n0 = nf(b)
        b.prism(pts, 0.5 + rr.random() * 0.06, (x, (rr.random() - 0.5) * 0.06, z), 'wood', rot=(0, rr.random() * 6.28, 0), tone=0.9 + rr.random() * 0.15, jit=0.06)
        paint(b, n0, lambda nn, c: abs(nn.y) > 0.9, 'log_end')
b.box((2.1, 0.62, 0.05), (0, 0, 0.95), 'snow', bevel=0.02, jit=0.03, f=wob(0.04, 331))
b.done('cs_woodpile', smooth=0, shade=(0.72, 1.08), under=0.25)

# 돌 우물 + 나무 틀 · 두레박
b = B()
b.lathe([(0.78, 0.0), (0.8, 0.72), (0.6, 0.76), (0.58, 0.0), (0.78, 0.0)], (0, 0, 0), 'stone', seg=12, cap=False, jit=0.07, f=wob(0.03, 340))
b.cone(0.6, 0.6, 0.02, (0, 0, 0.35), 'dark', seg=12, jit=0)
rr = random.Random(341)
for i in range(14):
    a = i * 2 * math.pi / 14 + (i % 2) * 0.2
    z = 0.15 + (i % 3) * 0.22
    b.box((0.26, 0.08, 0.16), (math.cos(a) * 0.8, math.sin(a) * 0.8, z), 'stone', rot=(0, 0, a + math.pi / 2), tone=0.85 + rr.random() * 0.25, jit=0.05)
for s in (-1, 1):
    limb(b, (s * 0.92, 0, 0.0), (s * 0.9, 0, 1.85), 0.06, 0.05, 'wood', seg=5, jit=0.05)
    b.box((0.12, 0.12, 0.06), (s * 0.9, 0, 1.87), 'wood_d', jit=0.04)
limb(b, (-1.0, 0, 1.72), (1.08, 0, 1.72), 0.06, 0.06, 'wood_l', seg=6, hint=(0, 0, 1), jit=0.04)
limb(b, (-0.25, 0, 1.72), (0.15, 0, 1.72), 0.08, 0.08, 'rope', seg=6, hint=(0, 0, 1), jit=0)
limb(b, (1.08, 0, 1.72), (1.1, -0.22, 1.72), 0.02, 0.02, 'iron', seg=4)
limb(b, (1.1, -0.22, 1.72), (1.1, -0.22, 1.55), 0.02, 0.02, 'iron', seg=4)
limb(b, (0, -0.07, 1.66), (0, -0.07, 1.12), 0.012, 0.012, 'rope', seg=4)
b.lathe([(0.12, 0.85), (0.15, 1.08)], (0, -0.07, 0), 'wood', seg=8, jit=0.05)
b.cone(0.12, 0.12, 0.01, (0, -0.07, 0.85), 'wood_d', seg=8)
for z in (0.89, 1.04):
    b.lathe([(0.128 + (z - 0.85) * 0.13, z), (0.13 + (z - 0.85) * 0.13, z + 0.025)], (0, -0.07, 0), 'iron', seg=8, cap=False, jit=0)
for s in (-1, 1):
    limb(b, (s * 0.15, -0.07, 1.07), (0, -0.07, 1.13), 0.008, 0.008, 'iron', seg=3)
b.done('cs_well', smooth=0, shade=(0.7, 1.08), under=0.25)

# 수숫대(조짚) 낟가리 + 눈
b = B()
b.lathe([(0.95, 0.0), (1.05, 0.35), (0.98, 1.1), (0.68, 1.7), (0.3, 2.15), (0.12, 2.3)], (0, 0, 0), 'thatch', seg=11, jit=0.08, f=wob(0.05, 350))
b.lathe([(0.7, 1.7), (0.6, 1.84), (0.32, 2.16), (0.14, 2.32), (0.02, 2.35)], (0, 0, 0), 'snow', seg=11, jit=0.03, f=wob(0.02, 351))
for z, r in ((0.9, 1.02), (1.5, 0.82)):
    b.lathe([(r + 0.01, z), (r - 0.01, z + 0.06)], (0, 0, 0), 'rope_d', seg=11, cap=False, jit=0)
b.cone(0.11, 0.03, 0.22, (0, 0, 2.42), 'thatch_d', seg=6, jit=0.06)
rr = random.Random(352)
for i in range(14):
    a = i * 2 * math.pi / 14 + rr.random() * 0.2
    b.cone(0.05, 0.005, 0.5, (math.cos(a) * 1.05, math.sin(a) * 1.05, 0.2), 'thatch_d' if i % 2 else 'dry', seg=3, cap=False, rot=(0, 0.35, a), jit=0.1)
b.done('cs_haystack', smooth=0, shade=(0.7, 1.1), under=0.25)


# 빈 두 바퀴 수레(채는 땅에)
def wwheel(b, x, R=0.62, cy=0.0):
    b.lathe([(R - 0.07, -0.04), (R, -0.04), (R, 0.04), (R - 0.07, 0.04), (R - 0.07, -0.04)], (0, 0, 0), 'wood_d', seg=12, cap=False, jit=0.03,
            f=lambda v: Vector((v.z + x, v.x + cy, v.y + R)))
    b.cone(0.1, 0.1, 0.2, (x, cy, R), 'wood', seg=6, rot=(0, math.pi / 2, 0))
    for k in range(6):
        b.box((0.035, 0.045, 2 * R - 0.1), (x, cy, R), 'wood', rot=(k * math.pi / 6, 0, 0), jit=0.03)


b = B()
for s in (-1, 1):
    wwheel(b, s * 0.78)
limb(b, (-0.9, 0, 0.62), (0.9, 0, 0.62), 0.045, 0.045, 'wood_d', seg=5)
TILT = math.atan2(0.26, 2.0)
for k in range(5):
    x = -0.52 + k * 0.26
    b.box((0.24, 2.0, 0.05), (x, 0.0, 0.8), 'wood' if k % 2 else 'wood_l', rot=(TILT, 0, 0), jit=0.05)
for s in (-1, 1):
    b.box((0.06, 2.0, 0.22), (s * 0.66, 0.0, 0.93), 'wood_d', rot=(TILT, 0, 0), jit=0.05)
    for y in (-0.8, 0.0, 0.8):
        b.box((0.05, 0.05, 0.36), (s * 0.66, y, 0.92 + y * math.tan(TILT)), 'wood', rot=(TILT, 0, 0), jit=0.04)
    limb(b, (s * 0.5, 1.0, 0.86), (s * 0.48, -1.0, 0.6), 0.045, 0.045, 'wood_d', seg=5)
    limb(b, (s * 0.48, -1.0, 0.6), (s * 0.36, -2.5, 0.04), 0.045, 0.035, 'wood_d', seg=5)
b.box((1.38, 0.06, 0.24), (0, 1.0, 1.0), 'wood_d', rot=(TILT, 0, 0), jit=0.05)
limb(b, (-0.4, -1.95, 0.25), (0.4, -1.95, 0.25), 0.03, 0.03, 'wood', seg=4)
b.done('cs_cart', smooth=0, shade=(0.72, 1.08), under=0.25)

# 장대 등롱
b = B()
limb(b, (0, 0, 0), (0, 0, 1.45), 0.045, 0.035, 'wood_d', seg=5, jit=0.05)
for i in range(3):
    a = i * 2 * math.pi / 3
    limb(b, (0, 0, 0.3), (math.cos(a) * 0.3, math.sin(a) * 0.3, 0.0), 0.03, 0.025, 'wood_d', seg=4)
b.box((0.24, 0.24, 0.03), (0, 0, 1.46), 'wood', jit=0.04)
b.box((0.16, 0.16, 0.24), (0, 0, 1.6), 'glow_lamp', jit=0)
for sx in (-1, 1):
    for sy in (-1, 1):
        b.box((0.025, 0.025, 0.26), (sx * 0.09, sy * 0.09, 1.6), 'iron', jit=0)
b.box((0.24, 0.24, 0.03), (0, 0, 1.73), 'wood', jit=0.04)
b.cone(0.17, 0.03, 0.1, (0, 0, 1.8), 'iron', seg=4, rot=(0, 0, math.pi / 4), jit=0)
limb(b, (0, 0, 1.85), (0, 0, 1.92), 0.015, 0.015, 'iron', seg=4)
b.done('cs_lantern', smooth=0, shade=(0.78, 1.06), under=0.2)

# 안장 걸이(안장 셋)
b = B()
limb(b, (-1.6, 0, 1.0), (1.6, 0, 1.0), 0.06, 0.06, 'wood', seg=6, hint=(0, 0, 1), jit=0.05)
for s in (-1, 1):
    for t in (-1, 1):
        limb(b, (s * 1.45, t * 0.4, 0.0), (s * 1.48, 0, 1.06), 0.05, 0.045, 'wood_d', seg=5, jit=0.05)
for i, x in enumerate((-0.95, 0.0, 0.95)):
    sheet(b, 4, 1, lambda u, v, x=x: (x - 0.3 + 0.6 * v, -0.42 + 0.84 * u, 1.06 - 1.4 * (abs(u - 0.5) ** 1.3)), 0.025, 'saddlecloth', rot=(0, 0, 0), jit=0.04)
    sheet(b, 4, 1, lambda u, v, x=x: (x - 0.22 + 0.44 * v, -0.3 + 0.6 * u, 1.13 - 1.1 * (abs(u - 0.5) ** 1.5)), 0.07, 'saddle', jit=0.04)
    b.box((0.1, 0.12, 0.12), (x - 0.2, 0, 1.17), 'saddle', bevel=0.02, tone=0.9)
    b.box((0.12, 0.14, 0.08), (x + 0.2, 0, 1.15), 'saddle', bevel=0.02, tone=0.9)
    for s in (-1, 1):
        obox(b, (x, s * 0.26, 0.98), (x, s * 0.3, 0.55), 0.04, 0.012, 'leather', jit=0)
        b.box((0.11, 0.02, 0.07), (x, s * 0.3, 0.5), 'iron', jit=0)
b.done('cs_saddle_rack', smooth=0, shade=(0.72, 1.08), under=0.25)

# 말 매는 막대(4 m) + 여물통 둘
b = B()
limb(b, (-2.05, 0, 1.0), (2.05, 0, 1.02), 0.06, 0.055, 'wood', seg=6, hint=(0, 0, 1), jit=0.05)
for x in (-1.9, 0.0, 1.9):
    limb(b, (x, 0, -0.05), (x, 0, 1.12), 0.08, 0.07, 'wood_d', seg=6, jit=0.05)
    b.box((0.18, 0.18, 0.05), (x, 0, 1.13), 'wood_d', jit=0.04)
for x, y in ((-0.9, -0.5), (1.05, -0.45)):
    b.lathe([(0.17, 0.0), (0.21, 0.32)], (x, y, 0), 'wood', seg=8, jit=0.05)
    b.cone(0.17, 0.17, 0.01, (x, y, 0.005), 'wood_d', seg=8)
    b.cone(0.19, 0.19, 0.02, (x, y, 0.27), 'dry', seg=8, jit=0.06)
    for z in (0.06, 0.24):
        b.lathe([(0.175 + z * 0.125, z), (0.178 + z * 0.125, z + 0.03)], (x, y, 0), 'iron', seg=8, cap=False, jit=0)
limb(b, (-1.2, 0, 0.98), (-1.25, -0.06, 0.7), 0.012, 0.012, 'rope', seg=3)
b.done('cs_hitch', smooth=0, shade=(0.72, 1.08), under=0.25)


# ═════════ 9 큰 귀틀집(ㄱ자) ═════════
b = B()
r = 0.14
step = 2 * r * 0.92
NC = 8
ov = 0.28
WALLS = [  # (축, 고정값, 시작, 끝)  x 축 벽은 y 고정
    ('x', -1.0, -4.0, 1.5), ('x', 3.0, -4.0, 4.0), ('x', -3.0, 1.5, 4.0),
    ('y', -4.0, -1.0, 3.0), ('y', 4.0, -3.0, 3.0), ('y', 1.5, -3.0, -1.0)]
for i in range(NC):
    for k, (ax, c, s0, s1) in enumerate(WALLS):
        z = r + i * step + (step / 2 if ax == 'y' else 0)
        m = 'log' if (i + k) % 2 else 'log_d'
        n0 = nf(b)
        if ax == 'x':
            limb(b, (s0 - ov, c, z), (s1 + ov, c, z), r * 0.96, r, m, seg=5, hint=(0, 0, 1), jit=0.06)
            paint(b, n0, lambda n, cc: abs(n.x) > 0.9, 'log_end')
        else:
            limb(b, (c, s0 - ov, z), (c, s1 + ov, z), r, r * 0.96, m, seg=5, hint=(0, 0, 1), jit=0.06)
            paint(b, n0, lambda n, cc: abs(n.y) > 0.9, 'log_end')
TOPZ = r + (NC - 1) * step + step / 2 + r
b.box((7.9, 3.9, TOPZ - 0.1), (0, 1.0, (TOPZ - 0.1) / 2), 'mud', jit=0.04)
b.box((2.4, 2.1, TOPZ - 0.1), (2.75, -2.0, (TOPZ - 0.1) / 2), 'mud', jit=0.04)
# 문 · 창
FY = -1.0 - r
b.box((0.85, 0.08, 1.65), (-1.2, FY - 0.02, 0.83), 'wood_d', jit=0.04)
for k in range(2):
    b.box((0.02, 0.09, 1.5), (-1.34 + k * 0.27, FY - 0.025, 0.83), 'dark', jit=0)
for s in (-1, 1):
    b.box((0.1, 0.12, 1.85), (-1.2 + s * 0.47, FY - 0.03, 0.92), 'wood', jit=0.04)
b.box((1.06, 0.12, 0.1), (-1.2, FY - 0.03, 1.8), 'wood', jit=0.04)


def window(b, x, y, z, m, axis='x', side=-1):
    if axis == 'x':
        b.box((0.62, 0.1, 0.5), (x, y, z), 'wood', jit=0.03)
        b.box((0.5, 0.11, 0.4), (x, y + side * 0.005, z), m, jit=0.02)
        b.box((0.02, 0.12, 0.4), (x, y + side * 0.01, z), 'wood_d', jit=0)
        b.box((0.5, 0.12, 0.02), (x, y + side * 0.01, z), 'wood_d', jit=0)
    else:
        b.box((0.1, 0.62, 0.5), (x, y, z), 'wood', jit=0.03)
        b.box((0.11, 0.5, 0.4), (x + side * 0.005, y, z), m, jit=0.02)
        b.box((0.12, 0.02, 0.4), (x + side * 0.01, y, z), 'wood_d', jit=0)
        b.box((0.12, 0.5, 0.02), (x + side * 0.01, y, z), 'wood_d', jit=0)


window(b, -3.0, FY - 0.03, 1.3, 'paper')
window(b, 0.5, FY - 0.03, 1.3, 'glow_lamp')
window(b, 2.75, -3.0 - r - 0.03, 1.3, 'paper')
window(b, -4.0 - r - 0.03, 1.0, 1.3, 'paper', axis='y')
# 박공 · 지붕(바깥 겹은 나무껍질, 누름대)
RZ = TOPZ + 1.35
E = 0.5
for xg in (-4.02, 4.02):
    b.prism([(-2.0 - 0.05, 0), (2.0 + 0.05, 0), (0, RZ - TOPZ)], 0.1, (xg, 1.0, TOPZ - 0.02), 'wood_d', rot=(0, 0, math.pi / 2), jit=0.04)
b.prism([(1.5 - 0.05, 0), (4.0 + 0.05, 0), (2.75, RZ - TOPZ)], 0.1, (0, -3.02, TOPZ - 0.02), 'wood_d', jit=0.04)
ang = math.atan2(RZ - TOPZ, 2.0 + E)
L = math.hypot(2.0 + E, RZ - TOPZ) + 0.08
b.box((8.9, L, 0.14), (0, 1.0 + (2.0 + E) / 2, (TOPZ + RZ) / 2 - 0.02), 'bark_roof', rot=(ang, 0, 0), jit=0.08)
# 앞 지붕은 툇마루까지 길게(처마 깊이 1.5)
EF = 1.5
angf = math.atan2(RZ - TOPZ + 0.25, 2.0 + EF)
Lf = math.hypot(2.0 + EF, RZ - TOPZ + 0.25) + 0.08
b.box((5.95, Lf, 0.14), (-4.45 + 5.95 / 2, 1.0 - (2.0 + EF) / 2, (TOPZ - 0.25 + RZ) / 2 - 0.02), 'bark_roof', rot=(-angf, 0, 0), jit=0.08)
# 날개 지붕(용마루가 y 쪽)
angw = math.atan2(RZ - TOPZ, 1.25 + E)
Lw = math.hypot(1.25 + E, RZ - TOPZ) + 0.08
for s in (-1, 1):
    b.box((Lw, 4.4, 0.14), (2.75 + s * (1.25 + E) / 2, -1.25, (TOPZ + RZ) / 2 - 0.02), 'bark_roof', rot=(0, s * angw, 0), jit=0.08)
limb(b, (-4.5, 1.0, RZ + 0.06), (4.5, 1.0, RZ + 0.06), 0.08, 0.075, 'log', seg=5, hint=(0, 0, 1))
limb(b, (2.75, -3.55, RZ + 0.05), (2.75, 1.0, RZ + 0.05), 0.075, 0.075, 'log', seg=5, hint=(0, 0, 1))
for t in (0.35, 0.75):
    yb = 1.0 + (2.0 + E) * (1 - t)
    limb(b, (-4.4, yb, TOPZ + (RZ - TOPZ) * t + 0.12), (4.4, yb, TOPZ + (RZ - TOPZ) * t + 0.12), 0.055, 0.05, 'log_d', seg=5, hint=(0, 0, 1))
    yf = 1.0 - (2.0 + EF) * (1 - t)
    limb(b, (-4.4, yf, TOPZ - 0.25 + (RZ - TOPZ + 0.25) * t + 0.12), (1.3, yf, TOPZ - 0.25 + (RZ - TOPZ + 0.25) * t + 0.12), 0.055, 0.05, 'log_d', seg=5, hint=(0, 0, 1))
# 툇마루 기둥 · 도리 · 마루
PY = -1.0 - EF + 0.25
for x in (-3.8, -1.9, 0.0, 1.3):
    limb(b, (x, PY, 0.0), (x, PY, TOPZ - 0.32), 0.07, 0.06, 'wood', seg=5, jit=0.05)
limb(b, (-4.0, PY, TOPZ - 0.3), (1.45, PY, TOPZ - 0.3), 0.07, 0.07, 'wood_d', seg=5, hint=(0, 0, 1))
b.box((5.5, 1.2, 0.08), (-1.25, -1.0 - 0.62, 0.32), 'wood_l', jit=0.04)
b.box((5.4, 1.1, 0.28), (-1.25, -1.0 - 0.62, 0.14), 'stone', jit=0.06)
# 처마 밑 말리는 옥수수·고추 줄
rr = random.Random(370)
for x0, m in ((-3.4, 'corn'), (-2.4, 'pepper'), (-0.5, 'pepper'), (0.9, 'corn')):
    zt = TOPZ - 0.4
    limb(b, (x0, PY + 0.25, zt + 0.12), (x0, PY + 0.25, zt - 0.8), 0.008, 0.008, 'rope', seg=3)
    for k in range(4):
        z = zt - k * 0.18
        a = k * 2.1
        if m == 'corn':
            b.cone(0.05, 0.03, 0.15, (x0 + math.cos(a) * 0.04, PY + 0.25 + math.sin(a) * 0.04, z), 'corn', seg=4, rot=(0.3 * math.sin(a), 0.3 * math.cos(a), 0), jit=0.06)
        else:
            b.cone(0.028, 0.004, 0.13, (x0 + math.cos(a) * 0.035, PY + 0.25 + math.sin(a) * 0.035, z - 0.03), 'pepper', seg=3, rot=(math.pi + 0.3 * math.sin(a), 0.3 * math.cos(a), 0), jit=0.06)
# 굴뚝(흙·돌) — 왼쪽 벽 뒤
CX, CY = -4.4, 2.2
b.box((0.55, 0.55, RZ + 0.4), (CX, CY, (RZ + 0.4) / 2), 'mud', jit=0.06, f=lambda v: Vector((v.x * (1 - 0.15 * (v.z / (RZ + 0.4) + 0.5)), v.y * (1 - 0.15 * (v.z / (RZ + 0.4) + 0.5)), v.z)))
b.box((0.6, 0.6, 0.12), (CX, CY, RZ + 0.45), 'stone', jit=0.06)
b.box((0.56, 0.56, 0.05), (CX, CY, 1.2), 'stone', jit=0.06, tone=0.9)
# 오른쪽 벽에 기댄 장작
for row in range(2):
    for k in range(5):
        n0 = nf(b)
        b.prism([(-0.09, -0.065), (0.09, -0.065), (0.0, 0.09)], 0.55, (4.0 + r + 0.33, -2.3 + k * 0.2 + (row % 2) * 0.1, 0.08 + row * 0.15), 'wood', rot=(0, (k + row) * 1.3, math.pi / 2), tone=0.9 + ((k + row) % 4) * 0.05, jit=0.06)
        paint(b, n0, lambda n, c: abs(n.x) > 0.9, 'log_end')
b.done('cs_loghouse_c', smooth=0, shade=(0.7, 1.08), under=0.25)


# ═════════ 10~16 사람(people.glb)에 붙이는 것 ═════════
# 몸통 torso_coat: x ±0.335, y -0.225 … +0.205, z 0.75 … 1.375 · 머리 아래 z 1.33
TF, TB = -0.232, 0.212   # 몸통 앞·뒤 바로 바깥


def strap(b, pts, w, m, th=0.012, **k):
    for p0, p1 in zip(pts, pts[1:]):
        obox(b, p0, p1, w, th, m, hint=(0, 1, 0) if abs(p0[1] - p1[1]) < 0.1 else (1, 0, 0), jit=0, **k)


# 10 가죽 띠 · 탄약 주머니 · 어깨 탄띠
b = B()
ring_lathe(b, 0.348, 0.225, 0.805, 0.875, 0.03, (0, -0.01, 0), 'leather', jit=0)
b.box((0.08, 0.02, 0.06), (0, TF - 0.018, 0.84), 'brass', jit=0)
for s in (-1, 1):
    b.box((0.13, 0.065, 0.11), (s * 0.16, TF - 0.04, 0.83), 'leather', bevel=0.012, tone=0.92, jit=0.03)
    b.box((0.135, 0.07, 0.035), (s * 0.16, TF - 0.042, 0.885), 'leather', bevel=0.008, tone=0.8, jit=0)
BAND = [(-0.3, TF, 0.88), (0.2, TF, 1.375), (0.2, -0.01, 1.392), (0.2, TB, 1.375), (-0.3, TB, 0.88)]
strap(b, BAND, 0.075, 'leather', th=0.014)
for k in range(5):
    t = 0.15 + k * 0.17
    p = Vector(BAND[0]).lerp(Vector(BAND[1]), t)
    b.box((0.03, 0.03, 0.05), (p.x, TF - 0.018, p.z), 'brass', rot=(0, -math.atan2(0.5, 0.495), 0), jit=0)
b.done('cs_belt', smooth=0, shade=(0.85, 1.06), under=0.1)

# 11 누빈 솜옷 덧판 · 선 깃 · 목도리
b = B()
for z in (0.86, 0.98, 1.1, 1.22, 1.33):
    for yy in (TF + 0.004, TB - 0.004):
        b.box((0.6, 0.024, 0.024), (0, yy, z), 'tint_shirt', tone=0.82, jit=0)
ring_lathe(b, 0.315, 0.27, 1.34, 1.45, 0.03, (0, -0.02, 0), 'tint_shirt', tone=0.82, jit=0)
ring_lathe(b, 0.34, 0.29, 1.33, 1.4, 0.05, (0, -0.02, 0), 'tint_cloth', jit=0.03)
b.ball(0.06, (0.1, -0.32, 1.35), 'tint_cloth', sub=1, scale=(1.1, 0.8, 0.9), jit=0.04)
b.box((0.08, 0.025, 0.24), (0.07, -0.325, 1.22), 'tint_cloth', rot=(0.08, 0.15, 0), jit=0.03)
b.box((0.075, 0.025, 0.2), (0.14, -0.322, 1.24), 'tint_cloth', rot=(0.06, -0.12, 0), tone=0.92, jit=0.03)
b.done('cs_quilt', smooth=0, shade=(0.88, 1.04), under=0.1)


# 12 행전(감은 천) + 짚신 감개 — 원점 = 다리 돌림 중심
def puttee(name, sx):
    b = B()
    cx = sx * 0.17
    for k in range(6):
        z = 0.15 + k * 0.047
        b.lathe([(0.158, z - 0.032), (0.168, z), (0.158, z + 0.032)], (cx, -0.0, 0), 'legging', seg=8, cap=False,
                rot=(0.16 if k % 2 else -0.06, 0, 0), tone=1.0 if k % 2 else 0.88, jit=0.02)
    b.lathe([(0.16, 0.37), (0.172, 0.39), (0.16, 0.41)], (cx, 0, 0), 'rope_d', seg=8, cap=False, jit=0)
    b.lathe([(0.15, 0.1), (0.158, 0.125), (0.15, 0.15)], (cx, 0.0, 0), 'straw', seg=8, cap=False, jit=0.03)
    for y, a in ((-0.12, 0.5), (-0.05, -0.5)):
        b.box((0.33, 0.025, 0.02), (cx, y, 0.1), 'straw', rot=(0, 0, a), jit=0.03)
    b.box((0.025, 0.2, 0.02), (cx, -0.1, 0.112), 'straw', jit=0.03)
    b.done(name, origin=(cx, 0, 0.62), smooth=0, shade=(0.85, 1.05), under=0.1)


puttee('cs_puttee_L', -1)
puttee('cs_puttee_R', 1)

# 13 왼쪽 엉덩이의 천 가방 + 어깨끈
b = B()
b.box((0.3, 0.1, 0.24), (-0.25, TB + 0.06, 0.79), 'bag', bevel=0.025, jit=0.04)
b.box((0.31, 0.105, 0.11), (-0.25, TB + 0.062, 0.87), 'bag', bevel=0.02, tone=0.86, jit=0.03)
b.box((0.04, 0.02, 0.04), (-0.25, TB + 0.115, 0.83), 'leather', jit=0)
strap(b, [(-0.33, TF, 0.92), (0.2, TF, 1.375), (0.2, -0.01, 1.392), (0.2, TB, 1.375), (-0.15, TB, 0.92)], 0.05, 'canvas_d')
b.done('cs_satchel', smooth=0, shade=(0.84, 1.06), under=0.15)

b = B()
b.box((0.15, 0.08, 0.13), (0.0, TF - 0.05, 1.08), 'leather', bevel=0.015, jit=0.03)
b.box((0.155, 0.085, 0.04), (0.0, TF - 0.05, 1.15), 'leather', bevel=0.01, tone=0.8, jit=0)
b.box((0.025, 0.01, 0.03), (0.0, TF - 0.095, 1.12), 'brass', jit=0)
for s in (-1, 1):
    strap(b, [(s * 0.065, TF - 0.03, 1.14), (s * 0.16, TF, 1.375), (s * 0.16, -0.01, 1.392), (s * 0.16, TB, 1.375)], 0.025, 'leather', th=0.01)
b.done('cs_bincase', smooth=0, shade=(0.85, 1.06), under=0.1)

# 14 콧수염 · 턱수염
b = B()
for s in (-1, 1):
    b.box((0.1, 0.03, 0.032), (s * 0.052, -0.262, 1.565), 'ink', rot=(0, s * 0.28, 0), bevel=0.008, jit=0)
b.box((0.11, 0.035, 0.07), (0, -0.258, 1.455), 'ink', bevel=0.012, jit=0, f=lambda v: Vector((v.x * (1 - 0.5 * max(0, -v.z) / 0.035), v.y, v.z)))
b.done('cs_mustache', smooth=0, shade=(0.95, 1.0), under=0.05)

# 15 지휘관 긴 솜 외투 자락(앞이 트임) · 털 단 · 가죽 띠 · 어깨끈(무기 없음)
b = B()
GAP = 0.32


def coat_pt(u, v, off):
    th = GAP + u * (2 * math.pi - 2 * GAP)
    z = 0.87 - v * 0.42
    rx = 0.352 + v * 0.08 + off
    ry = 0.232 + v * 0.07 + off
    return (math.sin(th) * rx, -0.01 - math.cos(th) * ry, z)


shell(b, 14, 2, lambda u, v: coat_pt(u, v, 0.0), lambda u, v: coat_pt(u, v, -0.022), 'tint_shirt', jit=0.03)
shell(b, 14, 1, lambda u, v: (lambda p: (p[0], p[1], 0.45 + v * 0.07 - 0.035))(coat_pt(u, 1, 0.02)), lambda u, v: (lambda p: (p[0], p[1], 0.45 + v * 0.07 - 0.035))(coat_pt(u, 1, -0.03)), 'fur', jit=0.1)
for s in (-1, 1):
    shell(b, 1, 2, lambda u, v, s=s: coat_pt((u * 0.03) if s > 0 else (1 - u * 0.03), v, 0.004),
          lambda u, v, s=s: coat_pt((u * 0.03) if s > 0 else (1 - u * 0.03), v, -0.026), 'fur', jit=0.1)
ring_lathe(b, 0.36, 0.24, 0.84, 0.91, 0.03, (0, -0.01, 0), 'leather', jit=0)
b.box((0.08, 0.02, 0.06), (0, -0.26, 0.875), 'brass', jit=0)
strap(b, [(-0.2, -0.252, 0.9), (0.2, TF, 1.375), (0.2, -0.01, 1.392), (0.2, TB, 1.375), (-0.2, 0.232, 0.9)], 0.05, 'leather')
b.done('cs_coat_long', smooth=0, shade=(0.82, 1.06), under=0.15)

# 16 일본군 순찰병 장비(배낭·담요 말이·가죽 띠·탄약 주머니·선 깃) — 휘장 없음
b = B()
b.box((0.48, 0.19, 0.38), (0, TB + 0.1, 1.08), 'khaki_d', bevel=0.04, jit=0.04)
b.box((0.44, 0.04, 0.16), (0, TB + 0.2, 1.16), 'khaki_d', bevel=0.015, tone=0.9, jit=0.03)
limb(b, (-0.3, TB + 0.1, 1.33), (0.3, TB + 0.1, 1.33), 0.075, 0.075, 'blanket', seg=8, hint=(0, 0, 1), jit=0.05)
for s in (-1, 1):
    limb(b, (s * 0.3, TB + 0.1, 1.33), (s * 0.3, TB + 0.1, 0.98), 0.065, 0.06, 'blanket', seg=6, jit=0.05)
    strap(b, [(s * 0.17, TB + 0.02, 1.3), (s * 0.17, -0.01, 1.392), (s * 0.17, TF, 1.36), (s * 0.2, TF, 0.88)], 0.05, 'leather', th=0.012)
ring_lathe(b, 0.348, 0.225, 0.805, 0.875, 0.03, (0, -0.01, 0), 'leather', jit=0)
b.box((0.08, 0.02, 0.06), (0, TF - 0.018, 0.84), 'brass', jit=0)
for s in (-1, 1):
    for x in (0.1, 0.24):
        b.box((0.11, 0.065, 0.1), (s * x, TF - 0.04, 0.83), 'leather', bevel=0.012, tone=0.92, jit=0.03)
ring_lathe(b, 0.315, 0.27, 1.34, 1.44, 0.03, (0, -0.02, 0), 'khaki', jit=0)
b.done('cs_jp_gear', smooth=0, shade=(0.84, 1.06), under=0.15)


# ═════════ 17~21 한꺼번에 그리는 몸(make_cheongsan.py 의 몸과 같은 크기·재질) ═════════
HEAD = (0.38, 0.36, 0.38)


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


# 17 일본군 보병 — 반대 걸음(오른발 앞 · 팔 흔듦도 반대 · 총은 그대로 오른 어깨)
JJB = dict(head=(0, -0.01, 1.43), pel=(0, 0, 0.7), neck=(0, 0, 1.24),
           shL=(-0.27, 0, 1.15), elL=(-0.3, -0.07, 0.9), haL=(-0.29, -0.14, 0.67),
           shR=(0.27, 0, 1.15), elR=(0.33, -0.07, 0.9), haR=(0.29, -0.19, 1.0),
           hipL=(-0.11, 0, 0.8), knL=(-0.11, 0.07, 0.44), anL=(-0.11, 0.17, 0.1), toeL=(-0.11, -0.02, 0.04),
           hipR=(0.11, 0, 0.8), knR=(0.11, -0.1, 0.45), anR=(0.11, -0.13, 0.09), toeR=(0.11, -0.33, 0.05))
b = B()
jp_body(b, JJB)
b.box((0.38, 0.17, 0.32), (0, 0.215, 1.0), 'khaki_d', bevel=0.03, jit=0.03)
limb(b, (-0.24, 0.215, 1.22), (0.24, 0.215, 1.22), 0.065, 0.065, 'blanket', seg=6, hint=(0, 0, 1))
for s in (-1, 1):
    limb(b, (s * 0.24, 0.215, 1.22), (s * 0.24, 0.215, 0.92), 0.06, 0.055, 'blanket', seg=6)
    obox(b, (s * 0.15, 0.13, 1.16), (s * 0.15, -0.145, 1.08), 0.045, 0.012, 'leather', hint=(1, 0, 0), jit=0)
rifle(b, (0.3, -0.22, 0.99), (0.33, 0.53, 1.97), (1, 0, 0), lite=True)
b.done('cs_jp_b', shade=(0.8, 1.08), under=0.2)


def ia_gear(b, F, sling=True):
    """cs_ia 의 어깨띠 둘(앞·뒤 비스듬히)과 허리 천 주머니 — 몸통 틀을 따라간다."""
    for p0, p1 in (((-0.2, -0.165, 0.931), (0.22, -0.165, 0.207)), ((-0.2, 0.165, 0.931), (0.22, 0.165, 0.207)),
                   ((-0.2, -0.165, 0.931), (-0.22, 0.0, 1.017)), ((-0.22, 0.0, 1.017), (-0.2, 0.165, 0.931))):
        a, c = tp(F, *p0), tp(F, *p1)
        obox(b, a, c, 0.055, 0.015, 'leather', hint=(0, 1, 0) if abs(p0[1] - p1[1]) < 0.1 else (1, 0, 0), jit=0)
    b.box((0.16, 0.08, 0.17), tp(F, 0.27, -0.06, 0.103), 'bag', bevel=0.025, jit=0.04)


# 18 독립군 달리기(앞으로 기울고 총은 오른손에 낮게)
def ia_run(name, J, butt, muz):
    b = B()
    F = ia_body(b, J)
    ia_gear(b, F)
    rifle(b, butt, muz, (1, 0, 0), lite=True)
    b.done(name, shade=(0.8, 1.08), under=0.2)


RUN = dict(head=(0, -0.25, 1.37), pel=(0, 0.03, 0.66), neck=(0, -0.16, 1.18),
           shL=(-0.29, -0.14, 1.1), shR=(0.29, -0.14, 1.1))
ia_run('cs_ia_run_a', dict(RUN,
       elL=(-0.33, 0.1, 0.9), haL=(-0.31, 0.0, 0.71),
       elR=(0.34, -0.14, 0.86), haR=(0.31, -0.3, 0.74),
       hipL=(-0.12, 0.02, 0.77), knL=(-0.13, -0.3, 0.5), anL=(-0.13, -0.25, 0.1), toeL=(-0.14, -0.45, 0.05),
       hipR=(0.12, 0.02, 0.77), knR=(0.13, 0.1, 0.42), anR=(0.13, 0.42, 0.3), toeR=(0.13, 0.5, 0.12)),
       (0.31, 0.26, 0.69), (0.33, -0.95, 0.85))
ia_run('cs_ia_run_b', dict(RUN,
       elL=(-0.33, -0.3, 0.95), haL=(-0.27, -0.4, 1.12),
       elR=(0.34, -0.1, 0.84), haR=(0.31, -0.27, 0.71),
       hipR=(0.12, 0.02, 0.77), knR=(0.13, -0.3, 0.5), anR=(0.13, -0.25, 0.1), toeR=(0.14, -0.45, 0.05),
       hipL=(-0.12, 0.02, 0.77), knL=(-0.13, 0.1, 0.42), anL=(-0.13, 0.42, 0.3), toeL=(-0.13, 0.5, 0.12)),
       (0.31, 0.3, 0.66), (0.33, -0.92, 0.8))


# 19 독립군 줄지어 걷기(총은 등에 · 지친 걸음)
def ia_walk(name, J):
    b = B()
    F = ia_body(b, J)
    ia_gear(b, F)
    rifle(b, tp(F, 0.22, 0.2, -0.414), tp(F, -0.2, 0.2, 1.62), (0, 1, 0), lite=True)
    b.done(name, shade=(0.8, 1.08), under=0.2)


WALK = dict(head=(0, -0.11, 1.4), pel=(0, 0, 0.66), neck=(0, -0.06, 1.22),
            shL=(-0.29, -0.05, 1.13), shR=(0.29, -0.05, 1.13))
ia_walk('cs_ia_walk_a', dict(WALK,
        elL=(-0.33, 0.05, 0.88), haL=(-0.32, 0.1, 0.64), elR=(0.33, -0.09, 0.88), haR=(0.3, -0.17, 0.65),
        hipL=(-0.12, 0, 0.79), knL=(-0.13, -0.14, 0.45), anL=(-0.13, -0.17, 0.09), toeL=(-0.14, -0.37, 0.05),
        hipR=(0.12, 0, 0.79), knR=(0.13, 0.06, 0.44), anR=(0.13, 0.19, 0.11), toeR=(0.13, 0.0, 0.04)))
ia_walk('cs_ia_walk_b', dict(WALK,
        elR=(0.33, 0.05, 0.88), haR=(0.32, 0.1, 0.64), elL=(-0.33, -0.09, 0.88), haL=(-0.3, -0.17, 0.65),
        hipR=(0.12, 0, 0.79), knR=(0.13, -0.14, 0.45), anR=(0.13, -0.17, 0.09), toeR=(0.14, -0.37, 0.05),
        hipL=(-0.12, 0, 0.79), knL=(-0.13, 0.06, 0.44), anL=(-0.13, 0.19, 0.11), toeL=(-0.13, 0.0, 0.04)))


# 20 일본군 기병(달리는 말) — 말 몸은 horse_body 와 같고 다리·목·꼬리만 다시 놓음
def horse_gallop(b, legs, lift):
    up = Vector((0, 0, lift))
    P = lambda p: tuple(Vector(p) + up)
    Fh = frame(P((0, 0.72, 1.18)), P((0, -0.66, 1.22)))
    fbox(b, Fh, 0, 1, 0.56, 0.6, 'horse', bevel=0.13, dtaper=0.04, jit=0.03)
    b.ball(0.31, P((0, 0.52, 1.24)), 'horse', sub=1, scale=(0.95, 1, 1), jit=0.03)
    b.ball(0.3, P((0, -0.52, 1.2)), 'horse', sub=1, scale=(0.95, 1, 1.02), jit=0.03)
    Fn = frame(P((0, -0.58, 1.3)), P((0, -1.02, 1.8)))
    fbox(b, Fn, 0, 1, 0.22, 0.38, 'horse', taper=-0.2, dtaper=-0.25, bevel=0.05, jit=0.03)
    fbox(b, Fn, 0.12, 1.04, 0.06, 0.08, 'horse_d', oy=0.17, jit=0.06)
    Fhd = frame(P((0, -0.96, 1.92)), P((0, -1.4, 1.62)))
    fbox(b, Fhd, 0, 1, 0.2, 0.26, 'horse', taper=-0.25, dtaper=-0.15, bevel=0.05, jit=0.03)
    fbox(b, Fhd, 0.6, 0.7, 0.21, 0.24, 'saddle', jit=0)
    for s in (-1, 1):
        b.cone(0.04, 0.008, 0.13, P((s * 0.06, -0.9, 2.0)), 'horse', seg=4, rot=(-0.6, s * 0.25, 0))
        b.box((0.02, 0.04, 0.04), P((s * 0.08, -1.13, 1.8)), 'ink', jit=0)
    limb(b, P((0, 0.76, 1.38)), P((0, 1.12, 1.18)), 0.075, 0.05, 'horse_d', seg=5, jit=0.06)
    limb(b, P((0, 1.12, 1.18)), P((0, 1.38, 1.02)), 0.05, 0.02, 'horse_d', seg=5, jit=0.06)
    for (x, y), (kn, ft) in zip([(-0.16, -0.5), (0.16, -0.5), (-0.16, 0.5), (0.16, 0.5)], legs):
        top = P((x, y, 1.05))
        knp, ftp = P((x, kn[0], kn[1])), P((x, ft[0], ft[1]))
        limb(b, top, knp, 0.085, 0.058, 'horse', seg=6, jit=0.03)
        limb(b, knp, ftp, 0.055, 0.045, 'horse', seg=5, jit=0.03)
        d = (Vector(ftp) - Vector(knp)).normalized()
        limb(b, tuple(Vector(ftp) - d * 0.02), tuple(Vector(ftp) + d * 0.1), 0.065, 0.06, 'hoof', seg=6)
    b.box((0.64, 0.66, 0.32), P((0, -0.04, 1.4)), 'saddlecloth', bevel=0.03, jit=0.03)
    b.box((0.4, 0.5, 0.1), P((0, -0.04, 1.58)), 'saddle', bevel=0.04, jit=0.03)
    for s in (-1, 1):
        limb(b, P((s * 0.31, -0.04, 1.42)), P((s * 0.33, -0.14, 1.0)), 0.01, 0.01, 'saddle', seg=3)
    return P


def cavalry(name, legs, lift):
    b = B()
    P = horse_gallop(b, legs, lift)
    J = dict(head=(0, -0.3, 2.22), pel=(0, 0.02, 1.64), neck=(0, -0.2, 2.04), flap=False, shin='boot', rings=False,
             shL=(-0.27, -0.19, 1.96), elL=(-0.3, -0.42, 1.8), haL=(-0.12, -0.64, 1.76),
             shR=(0.27, -0.19, 1.96), elR=(0.3, -0.42, 1.8), haR=(0.12, -0.64, 1.76),
             hipL=(-0.13, 0.0, 1.66), knL=(-0.33, -0.28, 1.46), anL=(-0.33, -0.12, 1.07), toeL=(-0.33, -0.32, 1.03),
             hipR=(0.13, 0.0, 1.66), knR=(0.33, -0.28, 1.46), anR=(0.33, -0.12, 1.07), toeR=(0.33, -0.32, 1.03))
    J = {k: (P(v) if isinstance(v, tuple) else v) for k, v in J.items()}
    F = jp_body(b, J)
    rifle(b, tp(F, 0.2, 0.17, -0.15), tp(F, -0.18, 0.17, 1.2), (0, 1, 0), lite=True)
    obox(b, tp(F, -0.2, -0.14, 0.95), tp(F, 0.22, -0.14, 0.2), 0.04, 0.012, 'leather', jit=0)
    for s in (-1, 1):
        limb(b, J['ha' + ('R' if s > 0 else 'L')], P((s * 0.1, -1.3, 1.68)), 0.008, 0.008, 'saddle', seg=3)
    b.done(name, shade=(0.74, 1.08), under=0.25)


# 다리: [앞왼, 앞오른, 뒤왼, 뒤오른] 각각 (무릎(y, z), 발굽(y, z))
cavalry('cs_cav_a', [((-0.85, 0.72), (-0.6, 0.48)), ((-0.78, 0.6), (-0.74, 0.18)), ((0.6, 0.62), (0.05, 0.08)), ((0.66, 0.66), (0.15, 0.28))], 0.08)
cavalry('cs_cav_b', [((-0.98, 0.74), (-1.3, 0.42)), ((-0.92, 0.7), (-1.18, 0.3)), ((0.96, 0.74), (1.32, 0.42)), ((0.9, 0.68), (1.26, 0.26))], 0.12)


# 21 마을 사람 — 흰옷
def vil_woman():
    b = B()
    H = (0, -0.03, 1.42)
    face(b, H)
    b.box((0.4, 0.37, 0.2), (0, 0.02, H[2] + 0.13), 'ink', bevel=0.06, jit=0)
    b.box((0.42, 0.4, 0.13), (0, 0.0, H[2] + 0.19), 'cloth_w', bevel=0.04, tone=1.02, jit=0.03)
    b.box((0.3, 0.04, 0.22), (0, 0.2, H[2] + 0.06), 'cloth_w', rot=(-0.15, 0, 0), jit=0.03)
    # 똬리 · 바구니 · 덮개 보자기
    b.lathe([(0.12, H[2] + 0.25), (0.15, H[2] + 0.28), (0.12, H[2] + 0.31), (0.09, H[2] + 0.28), (0.12, H[2] + 0.25)], (0, 0, 0), 'straw', seg=8, cap=False, jit=0.05)
    b.lathe([(0.18, H[2] + 0.29), (0.27, H[2] + 0.42), (0.29, H[2] + 0.53)], (0, 0, 0), 'basket', seg=10, jit=0.05)
    b.lathe([(0.3, H[2] + 0.52), (0.26, H[2] + 0.57), (0.12, H[2] + 0.61), (0.02, H[2] + 0.62)], (0, 0, 0), 'bojagi', seg=10, jit=0.06, f=wob(0.04, 400))
    b.ball(0.045, (0, 0, H[2] + 0.64), 'bojagi', sub=1, tone=0.85)
    # 저고리 · 높이 맨 치마
    F = torso(b, (0, 0, 0.98), (0, 0, 1.23), 0.4, 0.25, 'cloth_w', taper=0.08)
    b.box((0.04, 0.015, 0.2), (0.07, -0.135, 1.03), 'bojagi', rot=(0, 0.2, 0), jit=0)
    b.lathe([(0.34, 0.03), (0.33, 0.25), (0.27, 0.6), (0.22, 0.9), (0.2, 1.05)], (0, 0.0, 0), 'cloth_w', seg=10, jit=0.03, tone=0.95,
            f=lambda v: Vector((v.x, v.y - 0.06 * max(0, 0.5 - v.z) * (1 if v.y < 0 else 0.2), v.z)))
    for s, y in ((-1, -0.3), (1, -0.18)):
        b.box((0.1, 0.18, 0.08), (s * 0.09, y, 0.04), 'cloth_w', bevel=0.03, tone=0.9, jit=0)
    arm(b, (0.25, 0, 1.18), (0.38, -0.02, 1.42), (0.22, 0, 1.73), 'cloth_w', r=0.065)
    arm(b, (-0.25, 0, 1.18), (-0.29, -0.06, 0.93), (-0.27, -0.15, 0.7), 'cloth_w', r=0.065)
    scale_all(b, 0.93)
    b.done('cs_villager_a', shade=(0.8, 1.06), under=0.2)


def scale_all(b, k):
    for v in b.bm.verts:
        v.co *= k


vil_woman()


def vil_oldman():
    b = B()
    J = dict(head=(0, -0.13, 1.38), pel=(0, 0, 0.66), neck=(0, -0.08, 1.19),
             shL=(-0.28, -0.06, 1.1), elL=(-0.32, -0.04, 0.88), haL=(-0.24, -0.16, 0.76),
             shR=(0.28, -0.06, 1.1), elR=(0.37, -0.15, 0.9), haR=(0.34, -0.3, 1.0),
             hipL=(-0.12, 0, 0.78), knL=(-0.13, -0.14, 0.45), anL=(-0.13, -0.16, 0.09), toeL=(-0.14, -0.36, 0.05),
             hipR=(0.12, 0, 0.78), knR=(0.13, 0.06, 0.44), anR=(0.13, 0.18, 0.11), toeR=(0.13, -0.01, 0.04))
    F = torso(b, J['pel'], J['neck'], 0.44, 0.28, 'cloth_w', taper=0.06)
    fbox(b, F, 0.12, 0.2, 0.45, 0.29, 'cloth_w', tone=0.84, jit=0)
    fbox(b, F, 0.3, 0.75, 0.04, 0.02, 'cloth_w', ox=0.05, oy=-0.148, tone=0.8, jit=0)
    H = J['head']
    face(b, H)
    b.box((0.4, 0.38, 0.12), (H[0], H[1] + 0.01, H[2] + 0.15), 'hair_g', bevel=0.05, jit=0)
    b.lathe([(0.205, H[2] + 0.1), (0.205, H[2] + 0.15)], (H[0], H[1] + 0.01, 0), 'ink', seg=8, cap=False, scale=(1, 0.95, 1), jit=0)
    b.ball(0.06, (H[0], H[1] + 0.02, H[2] + 0.25), 'hair_g', sub=1, scale=(1, 1, 1.3))
    for s in (-1, 1):
        b.box((0.08, 0.025, 0.025), (H[0] + s * 0.045, H[1] - 0.19, H[2] - 0.07), 'beard_g', rot=(0, s * 0.3, 0), jit=0)
    b.box((0.12, 0.05, 0.14), (H[0], H[1] - 0.17, H[2] - 0.2), 'beard_g', bevel=0.02, jit=0, f=lambda v: Vector((v.x * (1 - 0.5 * max(0, -v.z) / 0.07), v.y, v.z)))
    for s in 'LR':
        arm(b, J['sh' + s], J['el' + s], J['ha' + s], 'cloth_w', r=0.075)
        leg(b, J['hip' + s], J['kn' + s], J['an' + s], J['toe' + s], 'cloth_w', 'legging', 'straw', r=0.112, rings=True, fw=0.12)
    # 지팡이
    limb(b, (0.36, -0.42, 0.0), (0.33, -0.27, 1.32), 0.02, 0.018, 'wood_d', seg=4)
    # 지게(등)
    for s in (-1, 1):
        limb(b, tp(F, s * 0.24, 0.26, -0.95), tp(F, s * 0.14, 0.18, 1.25), 0.03, 0.025, 'wood', seg=4, jit=0.05)
        limb(b, tp(F, s * 0.22, 0.24, -0.25), tp(F, s * 0.26, 0.56, 0.35), 0.025, 0.02, 'wood_d', seg=4, jit=0.05)
        strap(b, [tp(F, s * 0.15, 0.2, 0.95), tp(F, s * 0.15, 0.0, 1.03), tp(F, s * 0.17, -0.15, 0.85), tp(F, s * 0.2, -0.13, 0.4)], 0.04, 'straw', th=0.012)
    for t in (-0.6, 0.0, 0.55, 1.05):
        w = 0.24 - (t + 0.95) / 2.2 * 0.1
        limb(b, tp(F, -w, 0.24 - t * 0.03, t), tp(F, w, 0.24 - t * 0.03, t), 0.018, 0.018, 'wood_d', seg=4)
    for k in range(4):
        limb(b, tp(F, -0.3, 0.39 + (k % 2) * 0.07, 0.0 + k * 0.08), tp(F, 0.3, 0.39 + (k % 2) * 0.07, 0.02 + k * 0.08), 0.04, 0.035, 'wood' if k % 2 else 'wood_l', seg=5, jit=0.06)
    b.done('cs_villager_b', shade=(0.8, 1.06), under=0.2)


vil_oldman()


# ═════════ 먼 거리용 낮은 나무·풀(면 ≤ 30 / 8 / 12) ═════════
b = B()
b.cone(0.17, 0.05, 9.0, (0, 0, 4.5), 'birch', seg=4, cap=False, jit=0.04, f=lambda v: Vector((v.x + 0.025 * (v.z + 4.5), v.y + 0.01 * (v.z + 4.5), v.z)))
b.lathe([(0.175, 0.3), (0.17, 1.0)], (0, 0, 0), 'birch_d', seg=4, cap=False, scale=(1.06, 1.06, 1), jit=0)
for i, (z, a, ln, up) in enumerate(((4.0, 0.3, 2.0, 0.6), (5.0, 2.5, 1.8, 0.65), (6.0, 4.4, 1.6, 0.7), (6.9, 1.4, 1.4, 0.75), (7.7, 3.4, 1.2, 0.8))):
    p0 = Vector((0.025 * z, 0.01 * z, z))
    d = Vector((math.cos(a) * math.sin(up), math.sin(a) * math.sin(up), math.cos(up)))
    limb(b, tuple(p0), tuple(p0 + d * ln), 0.05, 0.012, 'twig' if i % 2 else 'birch', seg=3, cap=False, jit=0.05)
b.cone(0.45, 0.05, 0.5, (0.18, 0.05, 7.3), 'leaf_y', seg=3, jit=0.1)
b.done('cs_birch_lo', smooth=0, shade=(0.74, 1.08), under=0.3)

b = B()
b.cone(0.21, 0.04, 9.8, (0, 0, 4.9), 'bark_l', seg=4, cap=False, jit=0.05)
for i, (z, r, h) in enumerate(((3.4, 1.95, 2.6), (5.8, 1.5, 2.4), (8.2, 0.95, 2.6))):
    b.cone(r, r * 0.25, h, (0, 0, z), 'larch' if i % 2 == 0 else 'larch_d', seg=6, jit=0.1, rot=(0, 0, i), f=wob(0.1, 500 + i))
b.done('cs_larch_lo', smooth=0, shade=(0.66, 1.1), under=0.4)

b = B()
b.cone(0.2, 0.08, 2.2, (0, 0, 1.1), 'bark_l', seg=4, cap=False, jit=0.05)
for i, (z, r, h) in enumerate(((3.0, 1.55, 3.0), (5.3, 1.1, 2.7), (7.5, 0.65, 2.4))):
    b.cone(r, r * 0.08, h, (0, 0, z), 'spruce' if i % 2 == 0 else 'spruce_d', seg=5, jit=0.1, rot=(0, 0, i * 0.6))
b.cone(0.14, 0.01, 1.1, (0, 0, 9.0), 'spruce_d', seg=3, cap=False, jit=0.06)
b.done('cs_spruce_lo', smooth=0, shade=(0.64, 1.1), under=0.4)

b = B()
b.cone(0.2, 0.08, 2.2, (0, 0, 1.1), 'bark_l', seg=3, cap=False, jit=0.05)
for i, (z0, r, h) in enumerate(((1.5, 1.55, 3.0), (3.8, 1.1, 2.7), (6.1, 0.7, 3.2))):
    zm = z0 + h * 0.5
    b.lathe([(r, z0), (r * 0.5, zm)], (0, 0, 0), 'spruce' if i % 2 == 0 else 'spruce_d', seg=4, cap=False, rot=(0, 0, i * 0.8), jit=0.1)
    b.lathe([(r * 0.5, zm), (0.0, z0 + h)], (0, 0, 0), 'snow', seg=4, cap=False, rot=(0, 0, i * 0.8), jit=0.03,
            f=lambda v: Vector((v.x * 1.08, v.y * 1.08, v.z)))
b.done('cs_spruce_snow_lo', smooth=0, shade=(0.64, 1.1), under=0.4)

b = B()
for i, a in enumerate((0.2, 1.25, 2.3)):
    c, s = math.cos(a), math.sin(a)
    prof = [(-0.12, 0), (0.12, 0), (0.3, 0.5), (0.1, 0.22), (0.07, 0.66), (-0.02, 0.24), (-0.12, 0.58), (-0.1, 0.2), (-0.3, 0.44)]
    card(b, [(u * c, u * s, z) for u, z in prof], 'dry' if i % 2 == 0 else 'dry_d', jit=0.1)
b.done('cs_grass_lo', smooth=0, shade=(0.66, 1.12), under=0.1)

b = B()
for i, a in enumerate((0.1, 1.15, 2.2)):
    c, s = math.cos(a), math.sin(a)
    prof = [(-0.12, 0), (0.12, 0), (0.85, 0.75), (0.5, 0.6), (0.55, 1.15), (0.25, 0.75), (0.1, 1.4), (-0.12, 0.8), (-0.45, 1.2), (-0.35, 0.65), (-0.85, 0.85)]
    card(b, [(u * c, u * s, z * (0.9 + 0.1 * i)) for u, z in prof], 'brush' if i % 2 == 0 else 'brush_d', jit=0.1)
b.done('cs_bush_lo', smooth=0, shade=(0.7, 1.1), under=0.2)


NAMES = ['cs_mount_a', 'cs_mount_b', 'cs_mount_c', 'cs_cliff_a', 'cs_cliff_b', 'cs_rock_s1', 'cs_rock_s2', 'cs_rock_s3', 'cs_log_fallen', 'cs_stump',
         'cs_snowpatch_a', 'cs_snowpatch_b', 'cs_reeds', 'cs_river_rocks', 'cs_pine_big',
         'cs_rifle_stack', 'cs_bedroll', 'cs_tripod_pot', 'cs_map_table', 'cs_woodpile', 'cs_well', 'cs_haystack', 'cs_cart', 'cs_lantern', 'cs_saddle_rack', 'cs_hitch',
         'cs_loghouse_c', 'cs_belt', 'cs_quilt', 'cs_puttee_L', 'cs_puttee_R', 'cs_satchel', 'cs_bincase', 'cs_mustache', 'cs_coat_long', 'cs_jp_gear',
         'cs_jp_b', 'cs_ia_run_a', 'cs_ia_run_b', 'cs_ia_walk_a', 'cs_ia_walk_b', 'cs_cav_a', 'cs_cav_b', 'cs_villager_a', 'cs_villager_b',
         'cs_birch_lo', 'cs_larch_lo', 'cs_spruce_lo', 'cs_spruce_snow_lo', 'cs_grass_lo', 'cs_bush_lo']
have = {o.name for o in bpy.context.scene.objects}
print('MISSING', [n for n in NAMES if n not in have], 'EXTRA', [n for n in have if n not in NAMES])
for o in bpy.context.scene.objects:
    ws = [o.matrix_world @ v.co for v in o.data.vertices]
    print('FACES %-18s %4d  x %.2f..%.2f y %.2f..%.2f z %.2f..%.2f  mats %s' % (o.name, len(o.data.polygons), min(p.x for p in ws), max(p.x for p in ws), min(p.y for p in ws), max(p.y for p in ws), min(p.z for p in ws), max(p.z for p in ws), ','.join(m.name for m in o.data.materials)))
export('cheongsan2.glb')

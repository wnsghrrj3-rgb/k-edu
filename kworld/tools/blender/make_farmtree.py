"""케이월드 「다섯 해」 나무(준호 11-23 「좀 더 정교하게」) — farmtree.glb.
덩어리 공 하나 대신 줄기가 갈라져 가지가 보이고, 그 끝마다 잎 뭉치(작은 덩이 여럿)가 달린다. 잎 뭉치 사이로 가지가 비친다.
· 소나무 둘(붉은 껍질이 굽어 오르는 줄기 · 층층이 납작한 솔잎 구름)
· 버드나무(짧고 굵은 줄기에서 휘어 늘어진 가지 — 잎 따로)
· 느티나무(꽃병처럼 퍼지는 가지 · 넓은 잎 지붕 — 잎 따로)
· 감나무(굽은 줄기 · 잎 · 감 따로) — 잎이 따로인 나무는 겨울에 잎을 끄고 가을엔 물든다(farm.js).
좌표: 블렌더 z 위. 밑동 가운데가 원점."""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *
import bmesh
from mathutils import Vector

reset()
for n, c in [('bark_r', 0x8a4a32), ('bark_rd', 0x5e3424), ('bark', 0x6a5440), ('bark_d', 0x4a3a2c), ('bark_g', 0x7a6e5e),
             ('pine', 0x3e6a3a), ('pine_d', 0x2c5230), ('pine_l', 0x55803e), ('leaf', 0x5a9a3e), ('leaf_d', 0x427a30), ('leaf_l', 0x7ab852),
             ('willow', 0x8cbc4e), ('willow_d', 0x6a9a3a), ('tint_leaf', 0x5a9a3e), ('tint_leafd', 0x427a30), ('tint_leafl', 0x7ab852), ('tint_wil', 0x8cbc4e), ('tint_wild', 0x6a9a3a), ('persim', 0xf07a22), ('persim_d', 0xc85a14)]:
    mat(n, c)


def seg(b, p0, p1, r0, r1, m, n=6, **k):
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0; h = d.length
    Q = d.normalized().to_track_quat('Z', 'Y').to_matrix()
    t = bmesh.new()
    bmesh.ops.create_cone(t, cap_ends=True, cap_tris=False, segments=n, radius1=max(r0, 1e-4), radius2=max(r1, 1e-4), depth=h)
    return b._take(t, m, (0, 0, 0), f=lambda co: p0 + Q @ (co + Vector((0, 0, h / 2))), **k)


def wob(k, seed):
    rr = random.Random(seed); table = {}
    def f(v):
        key = (round(v.x, 3), round(v.y, 3), round(v.z, 3))
        if key not in table:
            table[key] = 1 + (rr.random() - 0.5) * 2 * k
        return v * table[key]
    return f


def limb(b, pts, r0, r1, m, n=6):
    """굽은 가지: 점들을 잇는 토막 + 마디 공"""
    L = len(pts) - 1
    for i in range(L):
        ra = r0 + (r1 - r0) * i / L; rb = r0 + (r1 - r0) * (i + 1) / L
        seg(b, pts[i], pts[i + 1], ra, rb, m, n=n, jit=0.06)
        if i:
            b.ball(ra * 1.02, pts[i], m, sub=1, jit=0.04)


def tuft(b, c, r, mats, rr, n=5, flat=0.62, tone=1.0):
    """잎 뭉치 하나 = 작은 덩이 n 개(가운데 크게, 둘레 작게)"""
    b.ball(r, c, mats[0], sub=1, scale=(1, 1, flat), jit=0.12, tone=tone, f=wob(0.16, int(rr.random() * 1e6)))
    for i in range(n - 1):
        a = i / (n - 1) * 6.283 + rr.random() * 0.5; d = r * (0.55 + rr.random() * 0.35)
        cc = (c[0] + math.cos(a) * d, c[1] + math.sin(a) * d, c[2] + (rr.random() - 0.4) * r * 0.5)
        b.ball(r * (0.5 + rr.random() * 0.25), cc, mats[(i + 1) % len(mats)], sub=1, scale=(1, 1, flat), jit=0.12, tone=tone * (0.92 + 0.12 * (cc[2] - c[2]) / r), f=wob(0.16, int(rr.random() * 1e6)))


# ── 소나무: 붉은 줄기가 굽어 오르고, 가지 끝마다 납작한 솔잎 구름 ──
def sonamu(name, seed, h=6.0, lean=0.5):
    rr = random.Random(seed); b = B()
    pts = [(0, 0, 0)]
    x = y = 0.0
    for i in range(1, 6):
        t = i / 5; x += math.sin(t * 2.4 + seed) * lean * 0.5; y += math.cos(t * 1.7 + seed) * lean * 0.25
        pts.append((x, y, h * t * 0.82))
    limb(b, pts, 0.26, 0.09, 'bark_r', n=7)
    b.cone(0.42, 0.26, 0.4, (0, 0, 0.2), 'bark_rd', seg=7, jit=0.1)       # 밑동
    tips = []
    for k in range(5):
        i = 2 + k % 3; base = Vector(pts[i]) * 0.6 + Vector(pts[i + 1]) * 0.4 if i + 1 < len(pts) else Vector(pts[-1])
        a = k * 2.4 + rr.random(); ln = 1.2 + rr.random() * 1.2
        tip = base + Vector((math.cos(a) * ln, math.sin(a) * ln, 0.35 + rr.random() * 0.6))
        limb(b, [tuple(base), tuple((base + tip) / 2 + Vector((0, 0, 0.25))), tuple(tip)], 0.09, 0.04, 'bark_r', n=5)
        tips.append(tip)
    tips.append(Vector(pts[-1]) + Vector((0, 0, 0.3)))
    for t in tips:
        tuft(b, (t.x, t.y, t.z + 0.15), 0.9 + rr.random() * 0.35, ['pine', 'pine_d', 'pine_l', 'pine_d'], rr, n=6, flat=0.42)
    b.done(name, smooth=0, shade=(0.6, 1.12), under=0.45)


sonamu('ft_pine', 3, 6.2, 0.6)
sonamu('ft_pine2', 11, 5.0, 0.9)


# ── 느티나무: 꽃병처럼 퍼지는 가지 · 넓은 잎 지붕(잎 따로) ──
def neuti(seed, h=3.0):
    rr = random.Random(seed); b = B(); lv = B()
    b.cone(0.55, 0.36, h, (0, 0, h / 2), 'bark_g', seg=8, jit=0.08)
    for k in range(5):
        a = k * 1.256 + rr.random() * 0.4
        p0 = Vector((math.cos(a) * 0.2, math.sin(a) * 0.2, h * 0.75))
        p1 = p0 + Vector((math.cos(a) * 1.4, math.sin(a) * 1.4, 1.6))
        p2 = p1 + Vector((math.cos(a + 0.3) * 1.2, math.sin(a + 0.3) * 1.2, 1.0))
        limb(b, [tuple(p0), tuple(p1), tuple(p2)], 0.24, 0.08, 'bark_g', n=6)
        q = p1 + Vector((math.cos(a - 0.8) * 0.9, math.sin(a - 0.8) * 0.9, 0.8))
        limb(b, [tuple(p1), tuple(q)], 0.1, 0.05, 'bark_g', n=5)
        tuft(lv, tuple(p2 + Vector((0, 0, 0.4))), 1.3, ['tint_leaf', 'tint_leafd', 'tint_leafl'], rr, n=6)
        tuft(lv, tuple(q + Vector((0, 0, 0.3))), 0.95, ['tint_leafd', 'tint_leaf', 'tint_leafl'], rr, n=5)
    tuft(lv, (0, 0, h + 3.2), 1.4, ['tint_leafl', 'tint_leaf', 'tint_leafd'], rr, n=6)
    b.done('ft_zel_trunk', smooth=0, shade=(0.62, 1.08), under=0.3)
    lv.done('ft_zel_leaf', smooth=0, shade=(0.6, 1.14), under=0.45)


neuti(21)


# ── 버드나무: 굵고 짧은 줄기, 휘어 늘어지는 가지(잎 따로) ──
def beodeul(seed):
    rr = random.Random(seed); b = B(); lv = B()
    limb(b, [(0, 0, 0), (0.2, 0, 1.2), (0.3, 0.1, 2.2)], 0.36, 0.24, 'bark', n=7)
    for k in range(6):
        a = k * 1.05 + rr.random() * 0.4
        p0 = Vector((0.3, 0.1, 2.1)); p1 = p0 + Vector((math.cos(a) * 0.9, math.sin(a) * 0.9, 1.3)); p2 = p1 + Vector((math.cos(a) * 1.0, math.sin(a) * 1.0, 0.3))
        limb(b, [tuple(p0), tuple(p1), tuple(p2)], 0.12, 0.05, 'bark', n=5)
        # 늘어진 잎 가닥: 가지 끝 둘레에서 아래로
        for j in range(7):
            aa = j * 0.9 + rr.random(); rad = 0.3 + rr.random() * 0.7
            top = p2 + Vector((math.cos(aa) * rad, math.sin(aa) * rad, 0.2 + rr.random() * 0.3)) - Vector((math.cos(a), math.sin(a), 0)) * rr.random() * 0.8
            ln = 2.0 + rr.random() * 1.4
            bot = top + Vector((math.cos(a) * 0.25, math.sin(a) * 0.25, -ln))
            seg(lv, tuple(top), tuple(bot), 0.14, 0.04, 'tint_wil' if j % 2 else 'tint_wild', n=4, jit=0.08)
        tuft(lv, tuple(p1 + Vector((0, 0, 0.5))), 0.75, ['tint_wil', 'tint_wild'], rr, n=4, flat=0.55)
    b.done('ft_wil_trunk', smooth=0, shade=(0.62, 1.08), under=0.3)
    lv.done('ft_wil_leaf', smooth=0, shade=(0.66, 1.12), under=0.35)


beodeul(31)


# ── 감나무: 굽은 줄기, 잎 뭉치, 감(따로) ──
rr = random.Random(41); b = B(); lv = B(); fr = B()
limb(b, [(0, 0, 0), (0.25, 0.05, 1.1), (0.15, 0.1, 2.1)], 0.24, 0.15, 'bark_d', n=7)
GT = []
for k in range(5):
    a = k * 1.3 + 0.4
    p0 = Vector((0.15, 0.1, 1.9)); p1 = p0 + Vector((math.cos(a) * 0.9, math.sin(a) * 0.9, 0.9)); p2 = p1 + Vector((math.cos(a + 0.4) * 0.6, math.sin(a + 0.4) * 0.6, 0.6))
    limb(b, [tuple(p0), tuple(p1), tuple(p2)], 0.1, 0.04, 'bark_d', n=5)
    GT.append(p2)
GT.append(Vector((0.1, 0.1, 3.9)))
for t in GT:
    tuft(lv, tuple(t), 0.85, ['tint_leaf', 'tint_leafd', 'tint_leafl'], rr, n=5)
    for j in range(5):
        a = rr.random() * 6.28; d = 0.5 + rr.random() * 0.5
        fr.ball(0.17, (t.x + math.cos(a) * d, t.y + math.sin(a) * d, t.z - 0.25 - rr.random() * 0.45), 'persim' if j % 3 else 'persim_d', sub=1, jit=0.08)
b.done('gam_trunk', smooth=0, shade=(0.66, 1.06), under=0.3)
lv.done('gam_leaf', smooth=0, shade=(0.62, 1.14), under=0.45)
fr.done('gam_fruit', smooth=30, shade=(0.85, 1.1))

# ── 숲 덤불(나무 사이를 메우는 키 작은 떨기) ──
rr = random.Random(51); b = B()
for i in range(4):
    a = i * 1.6; tuft(b, (math.cos(a) * 0.6, math.sin(a) * 0.6, 0.55), 0.6, ['leaf_d', 'leaf', 'pine_d'], rr, n=4)
b.done('ft_bush', smooth=0, shade=(0.58, 1.1), under=0.4)

export('farmtree.glb')

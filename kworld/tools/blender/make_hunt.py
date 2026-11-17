"""케이월드 「몰이」(구석기) 장면에만 쓰는 모델 — hunt.glb.
사슴·늑대는 조각(몸통 · 목 · 다리 넷)으로 나눠 낸다 — 장면이 다리를 흔들고 목을 숙인다(풀 뜯는 떼 / 고개 든 떼가 놀이의 신호).
벼랑(cliffs)은 장면 좌표 그대로 지은 한 덩이다(three x = 블렌더 x, three z = -블렌더 y) — hunt.js 의 SOLID 'cliff' 네모와 맞춘다.
tint_fur(털) · tint_leaf(덤불 잎) · tint_c(땅 얼룩·먼 산) 는 장면이 색을 정한다. glow_f* 는 스스로 빛나는 불꽃."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_fur', 0xc08748), ('tint_leaf', 0x3e9a4c), ('tint_c', 0x7fd062), ('fur_d', 0x9a6a36), ('cream', 0xf0dcc0), ('white', 0xfbf6ea), ('ink', 0x2b2118), ('horn', 0xd8ccb2),
             ('wolf', 0x7d828c), ('wolf_d', 0x565b66), ('wolf_l', 0xb4b8be), ('eye', 0xffe27a),
             ('hide', 0xb07a44), ('hide_l', 0xc8955a), ('hide_d', 0x94663a), ('hide_p', 0xdcb47c), ('dark', 0x2a1a10), ('wood', 0x7a5632), ('wood_d', 0x57391f), ('rope', 0xc8b080),
             ('stone', 0x9a968e), ('stone_d', 0x7d7a74), ('flint', 0xd6d2c8), ('flintc', 0xc9c3b4), ('flint_d', 0x8e8a82), ('stickc', 0x8a5a2b), ('stick_d', 0x6e4520),
             ('berry', 0xd8324a), ('berry_d', 0xa81e36), ('dirt', 0x7a5a3a), ('rootleaf', 0x5aa040), ('rootleaf_d', 0x437f34), ('tuber', 0xe0bc8e), ('smoke', 0xd8d4cc),
             ('cliff_a', 0xa08a70), ('cliff_b', 0x8f7a62), ('cliff_c', 0xb09a7c), ('cliff_l', 0xc2ad8c), ('cliff_d', 0x77654f), ('moss', 0x6f9a48), ('moss_d', 0x557a3a),
             ('glow_f1', 0xff5a2a), ('glow_f2', 0xffa23a), ('glow_f3', 0xffe07a)]:
    mat(n, c)


def wob(k=0.12, seed=1):
    rr = random.Random(seed)
    table = {}

    def f(v):
        key = (round(v.x, 3), round(v.y, 3), round(v.z, 3))
        if key not in table:
            table[key] = 1 + (rr.random() - 0.5) * 2 * k
        return v * table[key]
    return f


def limb(b, p0, p1, r0, r1, m, seg=6, **k):
    """p0 에서 p1 로 가는 막대(p0 쪽 반지름 r0)."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    L = d.length
    b.cone(r0, r1, L, tuple((p0 + p1) / 2), m, seg=seg, rot=(0, math.acos(max(-1, min(1, d.z / L))), math.atan2(d.y, d.x)), **k)


def face(b, m, pts, out=None, tone=1.0, jit=0.08):
    """면 하나를 바로 얹는다(바깥쪽 = out 쪽)."""
    f = b.bm.faces.new([b.bm.verts.new(p) for p in pts])
    f.normal_update()
    if out is not None and f.normal.dot(Vector(out)) < 0:
        f.normal_flip()
    f.material_index = b._mi(m)
    f[b.tone] = tone
    f[b.jit] = jit


def sheet(b, m, nx, ny, fn, out, tone=1.0, jit=0.07):
    """fn(u, v) 로 휘어진 면(가죽). out = 바깥쪽을 알려 주는 함수(가운데 점 → 방향) 또는 방향."""
    vs = [[Vector(fn(i / nx, j / ny)) for j in range(ny + 1)] for i in range(nx + 1)]
    for i in range(nx):
        for j in range(ny):
            q = [vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1]]
            c = (q[0] + q[1] + q[2] + q[3]) / 4
            face(b, m, q, out(c) if callable(out) else out, tone, jit)


# ───── 사슴: 몸통 · 목(머리) · 뿔 · 다리 넷 ─────
def deer(pre, L=1.3, W=0.5, H=0.52, leg=0.72):
    zb = leg + H / 2
    b = B()
    b.box((W, L, H), (0, 0, zb), 'tint_fur', bevel=min(W, H) * 0.3, bseg=2, jit=0.03, f=lambda v: Vector((v.x * (1 - 0.16 * v.y / L), v.y, v.z * (1 - 0.14 * v.y / L))))
    b.box((W * 0.44, L * 0.9, 0.1), (0, 0.02, leg + H - 0.035), 'fur_d', bevel=0.035, jit=0.03)
    b.box((W * 0.8, L * 0.7, H * 0.3), (0, 0, leg + H * 0.14), 'cream', bevel=H * 0.1, jit=0.02)
    b.box((W * 0.52, 0.1, H * 0.46), (0, L / 2 - 0.03, zb + 0.03), 'white', bevel=0.045, bseg=2, jit=0.02)
    limb(b, (0, L / 2 - 0.02, zb + H * 0.4), (0, L / 2 + 0.12, zb + H * 0.02), 0.065, 0.03, 'tint_fur', seg=5, tone=0.9)
    for s in (-1, 1):
        b.ball(0.2, (s * W * 0.36, L * 0.3, zb - 0.02), 'tint_fur', sub=1, scale=(0.5, 1.0, 1.15), jit=0.03)
        b.ball(0.17, (s * W * 0.38, -L * 0.32, zb - 0.03), 'tint_fur', sub=1, scale=(0.45, 0.9, 1.1), jit=0.03)
    b.done(pre + '_body', smooth=40, shade=(0.74, 1.08), under=0.25)
    hip = leg + 0.12
    for nm, sx, sy in (('legFL', -1, -1), ('legFR', 1, -1), ('legBL', -1, 1), ('legBR', 1, 1)):
        b = B()
        x, y = sx * W * 0.3, sy * L * 0.36
        if sy > 0:
            limb(b, (x, y + 0.1, 0.4), (x, y - 0.02, hip + 0.1), 0.05, 0.105, 'tint_fur', seg=6, tone=0.9, jit=0.03)
            limb(b, (x, y + 0.03, 0.05), (x, y + 0.1, 0.44), 0.04, 0.052, 'fur_d', seg=5, jit=0.03)
            b.cone(0.052, 0.045, 0.08, (x, y + 0.03, 0.04), 'ink', seg=5)
        else:
            limb(b, (x, y, 0.38), (x, y, hip + 0.1), 0.047, 0.088, 'tint_fur', seg=6, tone=0.9, jit=0.03)
            limb(b, (x, y, 0.05), (x, y, 0.42), 0.04, 0.048, 'fur_d', seg=5, jit=0.03)
            b.cone(0.052, 0.045, 0.08, (x, y, 0.04), 'ink', seg=5)
        b.done(pre + '_' + nm, origin=(x, y, hip), smooth=0, shade=(0.7, 1.05), under=0.1)
    ny, nz = -L / 2 + 0.12, zb + H * 0.28
    top = Vector((0, ny - 0.26, nz + 0.54))
    hy, hz = top.y - 0.1, top.z + 0.05
    b = B()
    limb(b, (0, ny + 0.03, nz - 0.08), top, 0.17, 0.105, 'tint_fur', seg=7, jit=0.03)
    limb(b, (0, ny - 0.11, nz - 0.02), (0, top.y - 0.09, top.z - 0.1), 0.09, 0.07, 'cream', seg=5, jit=0.02)
    b.box((0.25, 0.4, 0.27), (0, hy, hz), 'tint_fur', bevel=0.07, bseg=2, jit=0.02)
    b.box((0.16, 0.2, 0.15), (0, hy - 0.26, hz - 0.045), 'cream', bevel=0.04, jit=0.02)
    b.box((0.09, 0.04, 0.07), (0, hy - 0.365, hz - 0.01), 'ink')
    for s in (-1, 1):
        b.ball(0.036, (s * 0.118, hy - 0.08, hz + 0.045), 'ink', sub=1)
        limb(b, (s * 0.1, hy + 0.14, hz + 0.08), (s * 0.28, hy + 0.2, hz + 0.3), 0.075, 0.015, 'tint_fur', seg=4, tone=0.9)
    b.done(pre + '_neck', origin=(0, ny, nz), smooth=40, shade=(0.8, 1.08), under=0.25)
    b = B()
    for s in (-1, 1):
        p0, p1, p2 = Vector((s * 0.08, hy + 0.1, hz + 0.1)), Vector((s * 0.25, hy + 0.3, hz + 0.5)), Vector((s * 0.36, hy + 0.2, hz + 0.88))
        limb(b, p0, p1, 0.05, 0.038, 'horn', seg=5, jit=0.04)
        limb(b, p1, p2, 0.038, 0.014, 'horn', seg=5, jit=0.04)
        limb(b, p0 + (p1 - p0) * 0.3, p0 + Vector((s * 0.12, -0.22, 0.3)), 0.03, 0.01, 'horn', seg=4)
        limb(b, p1, p1 + Vector((s * 0.05, -0.24, 0.26)), 0.03, 0.01, 'horn', seg=4)
        limb(b, p1 + (p2 - p1) * 0.5, p1 + (p2 - p1) * 0.5 + Vector((-s * 0.03, 0.2, 0.2)), 0.024, 0.01, 'horn', seg=4)
    b.done(pre + '_antler', origin=(0, ny, nz), smooth=0, shade=(0.85, 1.05), under=0.1)


deer('hdeer')

# ───── 늑대: 몸통(머리·꼬리) · 다리 넷 ─────
L, W, H, leg = 1.2, 0.4, 0.44, 0.5
zb = leg + H / 2
b = B()
b.box((W, L, H), (0, 0, zb), 'wolf', bevel=0.13, bseg=2, jit=0.03, f=lambda v: Vector((v.x * (1 - 0.2 * v.y / L), v.y, v.z * (1 - 0.22 * v.y / L))))
b.box((W * 0.5, L * 0.95, 0.1), (0, 0, leg + H - 0.02), 'wolf_d', bevel=0.035, jit=0.03)
b.box((W * 0.7, L * 0.6, 0.12), (0, 0.05, leg + 0.04), 'wolf_l', bevel=0.04, jit=0.02)
b.ball(0.27, (0, -L / 2 + 0.06, zb + 0.1), 'wolf', sub=1, scale=(0.85, 1.0, 1.0), jit=0.05, f=wob(0.1, 3))        # 목덜미 털
b.ball(0.2, (0, -L / 2 + 0.0, zb - 0.1), 'wolf_l', sub=1, scale=(0.8, 0.9, 0.9), jit=0.04)                         # 가슴 털
hy, hz = -L / 2 - 0.3, zb + 0.2
b.box((0.34, 0.38, 0.3), (0, hy, hz), 'wolf', bevel=0.08, bseg=2, jit=0.02)
b.box((0.17, 0.3, 0.14), (0, hy - 0.3, hz - 0.06), 'wolf_l', bevel=0.04, jit=0.02)
b.box((0.19, 0.3, 0.05), (0, hy - 0.29, hz + 0.02), 'wolf', bevel=0.015, jit=0.02)
b.box((0.1, 0.05, 0.07), (0, hy - 0.455, hz - 0.03), 'ink')
for s in (-1, 1):
    b.box((0.04, 0.07, 0.07), (s * 0.165, hy - 0.1, hz + 0.05), 'eye')
    limb(b, (s * 0.11, hy + 0.1, hz + 0.1), (s * 0.15, hy + 0.14, hz + 0.34), 0.08, 0.012, 'wolf_d', seg=4)
limb(b, (0, L / 2 - 0.05, zb + 0.12), (0, L / 2 + 0.32, zb - 0.06), 0.07, 0.11, 'wolf', seg=6, jit=0.04)
limb(b, (0, L / 2 + 0.3, zb - 0.05), (0, L / 2 + 0.6, zb - 0.26), 0.11, 0.03, 'wolf_d', seg=6, jit=0.04)
b.done('hwolf_body', smooth=40, shade=(0.74, 1.08), under=0.25)
for nm, sx, sy in (('legFL', -1, -1), ('legFR', 1, -1), ('legBL', -1, 1), ('legBR', 1, 1)):
    b = B()
    x, y = sx * W * 0.32, sy * L * 0.36
    if sy > 0:
        limb(b, (x, y + 0.08, 0.26), (x, y - 0.02, leg + 0.12), 0.045, 0.09, 'wolf', seg=6, tone=0.9, jit=0.03)
        limb(b, (x, y + 0.01, 0.04), (x, y + 0.08, 0.29), 0.04, 0.046, 'wolf_d', seg=5, jit=0.03)
        b.box((0.1, 0.14, 0.06), (x, y - 0.02, 0.03), 'wolf_d', bevel=0.02)
    else:
        limb(b, (x, y, 0.04), (x, y, leg + 0.12), 0.042, 0.075, 'wolf', seg=6, tone=0.9, jit=0.03)
        b.box((0.1, 0.14, 0.06), (x, y - 0.03, 0.03), 'wolf_d', bevel=0.02)
    b.done('hwolf_' + nm, origin=(x, y, leg + 0.02), smooth=0, shade=(0.7, 1.05), under=0.1)

# ───── 막집: 나뭇가지를 기대 세우고 가죽을 덮은 집(문 = 앞) ─────
b = B()
n = 9
da = 2 * math.pi / n
a0 = -math.pi / 2 - da / 2
R0, Rt, Ht = 1.6, 0.2, 2.62
rr = random.Random(4)


def cone_pt(a, v, off=0.0):
    r = R0 + (Rt - R0) * v + off
    return (math.cos(a) * r, math.sin(a) * r, Ht * v)


radial = lambda c: (c.x, c.y, 0.5)
for i in range(n):
    aa, ab = a0 + i * da, a0 + (i + 1) * da
    v0 = 0.46 if i == 0 else 0.0

    def fn(u, v, aa=aa, ab=ab, v0=v0):
        vv = v0 + (1 - v0) * v
        return cone_pt(aa + (ab - aa) * u, vv, -0.1 * math.sin(math.pi * u) * math.sin(math.pi * min(1.0, vv * 1.2)))
    sheet(b, ('hide', 'hide_l', 'hide_d')[i % 3], 2, 3, fn, radial, tone=0.94 + rr.random() * 0.12)
    if i == 0:
        sheet(b, 'dark', 1, 1, lambda u, v: cone_pt(aa + (ab - aa) * u, 0.47 * v, -0.16), radial, jit=0.0)
        limb(b, cone_pt(aa + 0.06, 0.47, 0.05), cone_pt(ab - 0.06, 0.47, 0.05), 0.085, 0.075, 'hide_p', seg=6, jit=0.05)      # 말아 올린 문 가죽
    top = Vector((-math.cos(aa) * 0.26 + (rr.random() - 0.5) * 0.14, -math.sin(aa) * 0.26 + (rr.random() - 0.5) * 0.14, 3.3 + rr.random() * 0.45))
    base = Vector((math.cos(aa) * (R0 + 0.06), math.sin(aa) * (R0 + 0.06), 0))
    mid = Vector((0, 0, Ht + 0.39))      # 꼭대기에서 서로 엇갈려 묶인다
    limb(b, base, mid, 0.06, 0.04, 'wood' if i % 2 else 'wood_d', seg=5, jit=0.06)
    limb(b, mid, top, 0.04, 0.028, 'wood' if i % 2 else 'wood_d', seg=5, jit=0.06)
for a, v, w, hh, m in [(a0 + 2.4 * da, 0.22, 0.2, 0.16, 'hide_p'), (a0 + 6.5 * da, 0.4, 0.22, 0.14, 'hide_p'), (a0 + 8.45 * da, 0.18, 0.18, 0.16, 'hide_l'), (a0 + 4.5 * da, 0.55, 0.2, 0.12, 'hide_p')]:      # 기운 자리
    sheet(b, m, 1, 1, lambda u, vv: cone_pt(a + (u - 0.5) * w, v + vv * hh, -0.06), radial, jit=0.04)
b.cone(0.17, 0.13, 0.16, (0, 0, Ht + 0.36), 'rope', seg=7, jit=0.05)
b.cone(0.2, 0.2, 0.02, (0, 0, Ht - 0.03), 'dark', seg=9)
for i in range(11):
    a = a0 + da * 1.15 + i * (2 * math.pi - da * 1.3) / 10
    r = 0.14 + rr.random() * 0.1
    b.ball(r, (math.cos(a) * (R0 + 0.12), math.sin(a) * (R0 + 0.12), r * 0.35), 'stone' if i % 2 else 'stone_d', sub=1, scale=(1.2, 1.0, 0.75), jit=0.1, f=wob(0.16, 30 + i))
b.done('makjip', smooth=0, shade=(0.66, 1.1), under=0.3)

# ───── 가죽 걸이 · 땅에 펴 말리는 가죽 ─────
HIDE = [(-0.8, 1.92), (-0.46, 1.78), (-0.16, 1.84), (0, 1.94), (0.16, 1.84), (0.46, 1.78), (0.8, 1.92), (0.6, 1.5), (0.56, 1.12), (0.82, 0.74), (0.42, 0.86), (0.12, 0.8), (0, 0.66), (-0.12, 0.8), (-0.42, 0.86), (-0.82, 0.74), (-0.56, 1.12), (-0.6, 1.5)]
b = B()
for s in (-1, 1):
    limb(b, (s * 1.3, 0, -0.1), (s * 1.24, 0, 2.02), 0.065, 0.05, 'wood_d', seg=6, jit=0.06)
    limb(b, (s * 1.24, 0, 1.98), (s * 1.36, 0.02, 2.24), 0.04, 0.025, 'wood_d', seg=5)
    limb(b, (s * 1.24, 0, 1.98), (s * 1.12, -0.02, 2.22), 0.04, 0.025, 'wood_d', seg=5)
    limb(b, (s * 1.28, 0.05, 0.0), (s * 1.6, 0.5, -0.02), 0.03, 0.03, 'wood', seg=4)
    for x, z in ((0.8, 1.92), (0.82, 0.74), (0.56, 1.3)):
        limb(b, (s * x, 0, z), (s * 1.25, 0, z + (0.08 if z > 1.5 else -0.1)), 0.012, 0.012, 'rope', seg=3)
limb(b, (-1.5, 0, 2.06), (1.5, 0, 2.1), 0.05, 0.04, 'wood', seg=6, jit=0.06)
for x in (-0.46, 0, 0.46):
    limb(b, (x, 0, 1.8 if x else 1.92), (x, 0, 2.08), 0.012, 0.012, 'rope', seg=3)
b.prism(HIDE, 0.035, (0, 0, 0), 'hide_l', jit=0.03)
b.prism([(x * 0.62, 1.34 + (z - 1.34) * 0.66) for x, z in HIDE], 0.06, (0, 0, 0), 'hide', jit=0.03)
b.done('hiderack', smooth=0, shade=(0.74, 1.08), under=0.15)
b = B()
flat = [(x, z - 1.3) for x, z in HIDE]
b.prism(flat, 0.03, (0, 0, 0.035), 'hide_l', rot=(math.pi / 2, 0, 0), jit=0.03)
b.prism([(x * 0.62, z * 0.66) for x, z in flat], 0.03, (0, 0, 0.05), 'hide_d', rot=(math.pi / 2, 0, 0), jit=0.03)
for x, z in ((0.8, 0.62), (-0.8, 0.62), (0.82, -0.56), (-0.82, -0.56), (0, 0.64), (0, -0.64)):
    limb(b, (x * 1.06, -z * 1.06, 0.0), (x * 1.0, -z * 1.0, 0.16), 0.022, 0.03, 'wood_d', seg=4)
b.done('hide_flat', smooth=0, shade=(0.9, 1.05), under=0.0)

# ───── 불꽃(스스로 빛남) · 연기 덩이 ─────
def tongue(b, m, x, y, r, h, tw, seed):
    ph = random.Random(seed).random() * 6

    def f(v):
        k = v.z / h
        a = tw * k
        return Vector((v.x * math.cos(a) - v.y * math.sin(a) + math.sin(k * 3 + ph) * 0.08 * k, v.x * math.sin(a) + v.y * math.cos(a) + math.cos(k * 2.3 + ph) * 0.08 * k, v.z))
    b.lathe([(r * 0.4, 0), (r, h * 0.14), (r * 0.92, h * 0.32), (r * 0.6, h * 0.58), (r * 0.28, h * 0.82), (0.012, h)], (x, y, 0), m, seg=5, jit=0.07, f=f)


b = B()
tongue(b, 'glow_f1', 0, 0.06, 0.34, 1.25, 0.9, 1)
tongue(b, 'glow_f2', 0.17, -0.12, 0.25, 0.95, -0.8, 2)
tongue(b, 'glow_f3', -0.15, -0.1, 0.18, 0.72, 0.7, 3)
tongue(b, 'glow_f2', -0.06, 0.24, 0.15, 0.6, -0.6, 4)
b.done('flame', smooth=0, shade=(0.8, 1.0), under=0.0)
b = B()
b.ball(0.5, (0, 0, 0), 'smoke', sub=1, jit=0.05, f=wob(0.16, 9))
b.done('puff', smooth=0, shade=(0.82, 1.04), under=0.1)

# ───── 줍는 것: 돌멩이 · 몸돌(주먹도끼가 될 돌) · 나뭇가지 · 열매 덤불 · 뿌리 · 돌 조각 ─────
b = B()
b.ball(0.22, (0, 0, 0), 'flint', sub=1, scale=(1.15, 0.95, 0.9), jit=0.08, f=wob(0.16, 12))
b.done('pebble', smooth=0, shade=(0.78, 1.05), under=0.2)
b = B()
b.ball(0.3, (0, 0, 0), 'flintc', sub=1, scale=(0.95, 0.7, 1.05), jit=0.1, f=lambda v: wob(0.14, 14)(Vector((v.x * (1 - 0.35 * v.z / 0.3 * (1 if v.z > 0 else 0)), v.y, v.z))))
b.done('flint', smooth=0, shade=(0.78, 1.06), under=0.2)
b = B()
limb(b, (-0.55, 0.02, 0.0), (0.2, -0.03, 0.01), 0.05, 0.04, 'stickc', seg=5, jit=0.08)
limb(b, (0.2, -0.03, 0.01), (0.58, 0.1, 0.03), 0.04, 0.025, 'stickc', seg=5, jit=0.08)
limb(b, (0.18, -0.03, 0.01), (0.5, -0.24, 0.06), 0.03, 0.015, 'stick_d', seg=4, jit=0.08)
limb(b, (-0.2, 0.0, 0.0), (-0.02, 0.22, 0.05), 0.026, 0.012, 'stick_d', seg=4, jit=0.08)
b.done('branch', smooth=0, shade=(0.85, 1.06), under=0.15)
BUSH = [(0, 0, 0.62, 0.78), (0.62, 0.1, 0.46, 0.55), (-0.6, -0.12, 0.5, 0.58), (0.05, 0.52, 0.42, 0.5), (0.1, -0.52, 0.42, 0.5)]
b = B()
for i, (x, y, z, r) in enumerate(BUSH):
    b.ball(r, (x, y, z), 'tint_leaf', sub=1, scale=(1, 1, 0.85), tone=0.92 + 0.14 * z, jit=0.1, f=wob(0.13, 70 + i))
b.done('hbush', smooth=0, shade=(0.62, 1.1), under=0.4)
b = B()
rr = random.Random(6)
for i, (x, y, z, r) in enumerate(BUSH):
    for k in range(5 if i == 0 else 3):
        d = Vector((rr.random() - 0.5 + x * 0.9, rr.random() - 0.5 + y * 0.9, 0.25 + rr.random() * 0.75)).normalized()
        b.ball(0.085 + rr.random() * 0.025, (x + d.x * r * 0.99, y + d.y * r * 0.99, z + d.z * r * 0.85), 'berry' if (i + k) % 4 else 'berry_d', sub=1, jit=0.05)
b.done('hberries', smooth=0, shade=(0.86, 1.06), under=0.1)
b = B()
b.ball(0.42, (0, 0, -0.01), 'dirt', sub=1, scale=(1.0, 0.85, 0.16), jit=0.1, f=wob(0.14, 16))
b.ball(0.1, (0.04, -0.05, 0.08), 'tuber', sub=1, scale=(1.2, 0.9, 0.9), jit=0.05)
rr = random.Random(8)
for i in range(8):
    a = i * 0.8 + rr.random() * 0.3
    ln = 0.34 + rr.random() * 0.26
    lean = 0.35 + rr.random() * 0.5
    p0 = Vector((math.cos(a) * 0.05, math.sin(a) * 0.05, 0.05))
    p1 = p0 + Vector((math.cos(a) * math.sin(lean), math.sin(a) * math.sin(lean), math.cos(lean))) * ln
    limb(b, p0, p1, 0.02, 0.07, 'rootleaf' if i % 3 else 'rootleaf_d', seg=4, jit=0.1)
    limb(b, p1, p1 + (p1 - p0).normalized() * 0.16 + Vector((0, 0, -0.03)), 0.07, 0.006, 'rootleaf' if i % 3 else 'rootleaf_d', seg=4, jit=0.1)
b.done('rootplant', smooth=0, shade=(0.72, 1.12), under=0.15)
b = B()
rr = random.Random(9)
for i in range(9):
    a = rr.random() * 6.28
    d = 0.15 + rr.random() * 0.55
    b.ball(0.06 + rr.random() * 0.05, (math.cos(a) * d, math.sin(a) * d, 0.02), 'flint' if i % 3 else 'flint_d', sub=1, scale=(1.3, 0.8, 0.35), rot=(0, 0, a * 2), jit=0.1, f=wob(0.25, 40 + i))
b.done('flakes', smooth=0, shade=(0.9, 1.05), under=0.1)

# ───── 땅 얼룩(납작한 조각) · 먼 산 ─────
b = B()
pw = wob(0.2, 18)
b.cone(1.0, 0.95, 0.07, (0, 0, 0.035), 'tint_c', seg=9, jit=0.03, f=lambda v: Vector((pw(Vector((v.x, v.y, 0))).x, pw(Vector((v.x, v.y, 0))).y, v.z)))
b.done('patch', smooth=0, shade=(1.0, 1.0), under=0.0)
b = B()
b.ball(1.0, (0, 0, -0.06), 'tint_c', sub=2, scale=(1, 1, 0.62), jit=0.05, f=wob(0.1, 19))
b.done('hill', smooth=0, shade=(0.74, 1.06), under=0.0)


# ───── 벼랑: 장면 좌표의 네모 위에 층층이 깎인 바위벽 + 풀 덮인 마루 ─────
def crag(b, x0, z0, x1, z1, h, seed, step=1.9):
    rr = random.Random(seed)
    w, d = x1 - x0, z1 - z0
    s = min(1.0, min(w, d) / 5.0)
    half = min(w, d) / 2 * 0.985
    per = []
    for ax, az, bx, bz in ((x0, z0, x1, z0), (x1, z0, x1, z1), (x1, z1, x0, z1), (x0, z1, x0, z0)):
        n = max(2, round(math.hypot(bx - ax, bz - az) / step))
        for i in range(n):
            t = (i + (rr.random() - 0.5) * 0.5 if i else 0) / n
            per.append((ax + (bx - ax) * t, az + (bz - az) * t))
    cols = []
    for px, pz in per:
        qx, qz = min(max(px, x0 + half), x1 - half), min(max(pz, z0 + half), z1 - half)
        ix, iz = qx - px, qz - pz
        il = math.hypot(ix, iz) or 1
        ix, iz = ix / il, iz / il
        c = rr.uniform(-0.15, 0.35)
        ins, zs = [0.03 + rr.uniform(0, 0.28) * s], [-0.3]
        ins.append(max(0.02, (0.14 + c * 0.6) * s + rr.uniform(-0.06, 0.12))); zs.append(h * (0.33 + rr.uniform(-0.07, 0.07)))
        ins.append(ins[-1] + (0.3 + rr.uniform(0, 0.25)) * s); zs.append(zs[-1] + rr.uniform(0.0, 0.12))
        ins.append(ins[-1] + (0.08 + c * 0.3) * s + rr.uniform(-0.04, 0.12)); zs.append(h * (0.68 + rr.uniform(-0.07, 0.07)))
        ins.append(ins[-1] + (0.26 + rr.uniform(0, 0.22)) * s); zs.append(zs[-1] + rr.uniform(0.0, 0.1))
        ins.append(ins[-1] + (0.06 + rr.uniform(0, 0.14)) * s); zs.append(h - 0.1 + rr.uniform(-0.12, 0.06))
        ins.append(ins[-1] - 0.18); zs.append(zs[-1] - 0.03)
        ins.append(ins[-1] + 0.06); zs.append(h + 0.2)
        ins.append(ins[-1] + min(0.5, il * 0.4)); zs.append(h + 0.27)
        ring = []
        for k, (t, z) in enumerate(zip(ins, zs)):
            j = rr.uniform(-0.22, 0.22) if 0 < k < 6 else 0
            ring.append(Vector((px + ix * t - iz * j, -(pz + iz * t + ix * j), z)))
        ring.append(Vector((qx, -qz, h + 0.3)))
        cols.append((ring, Vector((-ix, iz, 0))))
    BAND = [('cliff_a', 0.95, 0), ('cliff_l', 1.0, 1), ('cliff_b', 1.0, 0), ('cliff_l', 1.03, 1), ('cliff_c', 1.04, 0), ('moss_d', 0.9, -1), ('moss', 1.0, 0), ('moss', 1.04, 1), ('moss', 1.06, 1)]
    N = len(cols)
    for i in range(N):
        (ra, oa), (rb, ob) = cols[i], cols[(i + 1) % N]
        for k, (m, tone, up) in enumerate(BAND):
            out = Vector((0, 0, up)) if up else (oa + ob + Vector((0, 0, 0.3)))
            if up == 0 and k < 5 and rr.random() < 0.16:
                m = ('cliff_a', 'cliff_b', 'cliff_c', 'cliff_d')[rr.randrange(4)]
            q = [ra[k], rb[k], rb[k + 1], ra[k + 1]]
            if (q[2] - q[3]).length < 1e-4:
                face(b, m, q[:3], out, tone, 0.03 if k >= 5 else 0.1)
            elif k >= 5 or up:
                face(b, m, q, out, tone, 0.035)
            elif rr.random() < 0.5:
                face(b, m, [q[0], q[1], q[2]], out, tone, 0.1); face(b, m, [q[0], q[2], q[3]], out, tone, 0.1)
            else:
                face(b, m, [q[0], q[1], q[3]], out, tone, 0.1); face(b, m, [q[1], q[2], q[3]], out, tone, 0.1)


b = B()
crag(b, 60, 0, 63.5, 16.5, 7, 1)             # 골짜기 서쪽 벽
crag(b, 78.5, 0, 96, 16.5, 7, 2)             # 골짜기 동쪽 벽
crag(b, 60.3, -0.6, 78.9, 3, 8, 3)           # 막다른 벽
crag(b, 89, 15.7, 96, 72, 6, 4)              # 동쪽 벼랑
crag(b, 46, 0, 60.4, 10.5, 5, 5)             # 북서 벼랑
crag(b, 50, -13, 92, 0.4, 11.5, 6, step=2.6) # 뒤로 솟은 산마루(놀이판 밖)
crag(b, 57, -24, 86, -9, 15.5, 7, step=3.0)
b.done('cliffs', smooth=0, shade=(0.6, 1.08), under=0.3)

export('hunt.glb')

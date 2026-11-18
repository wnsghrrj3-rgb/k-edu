"""케이월드 「골품의 문」(통일신라·발해) 장면에만 쓰는 모델 — gate.glb. 바닥 가운데가 원점, 앞은 -y(three 에서 +z).
판축 흙담(기와 얹은 담 · 넘을 낮은 담) · 문 셋(누런·푸른 = 맞배 한 칸 · 붉은 = 공포 얹은 팔작 · 자줏빛 = 문루 두 층) · 문짝 ·
가장 안쪽 전각(두 단 기단 · 일곱 칸 · 팔작지붕 · 치미) · 서고 · 객관 · 시험장 · 관청 · 책 시렁 · 시험 책상 · 신라 석등(목표 등불) ·
당나라 가는 배 · 나루 잔교 · 절 일주문 · 삼층 석탑 · 먼 언덕 · 바닥 돌 · 돌 받침.
지붕·창호 함수는 make_build.py 와 같은 꼴(그 파일은 여럿이 같이 써서 불러오지 않고 옮겨 적었다)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_rank', 0xc0302a), ('tint_door', 0xc0302a), ('tint_roof', 0x5a6272), ('tint_wall', 0xcfae7c),
             ('earth', 0xcfae7c), ('earth_d', 0xb8955f), ('earth_l', 0xe0c496), ('stone', 0xaaa69c), ('stone_d', 0x88847b), ('stone_l', 0xc8c4b8),
             ('tile', 0x5a6272), ('tile_l', 0x8d95a3), ('dark', 0x2a2420), ('plaster', 0xf2ede0), ('red', 0xa8402a), ('red_d', 0x7a2a1a),
             ('green', 0x3f8a6e), ('green_l', 0x72b89c), ('blue', 0x3c5c9c), ('gold', 0xd8b048), ('paper', 0xeae2c8), ('wood', 0x7a5632),
             ('wood_d', 0x4e3620), ('wood_l', 0xb08a5a), ('bronze', 0xb08a3a), ('iron', 0x3a3a42), ('ink', 0x2b2118), ('scroll', 0xf0e6c6),
             ('silk_r', 0xb83a30), ('silk_b', 0x3a5a8a), ('silk_y', 0xd8b048), ('silk_g', 0x4a8a5a), ('sail', 0xc9a670), ('sail_d', 0x9a7a4a),
             ('rope', 0xc8b080), ('hill', 0x6a9a50), ('hill_d', 0x52803e), ('hill_l', 0x86b064), ('cushion', 0x8a3a3a), ('glow_fire', 0xffd27a)]:
    mat(n, c)


def sgnpow(v, p):
    return math.copysign(abs(v) ** p, v)


def beam(b, p0, p1, r, m, seg=4, **k):
    """p0 에서 p1 까지 곧은 막대(용마루 내림·돛대 줄)."""
    d = Vector(p1) - Vector(p0)
    ln = d.length
    th = math.acos(max(-1, min(1, d.z / ln)))
    ph = math.atan2(d.y, d.x)
    b.cone(r, r, ln, tuple((Vector(p0) + Vector(p1)) / 2), m, seg=seg, rot=(0, th, ph), **k)


def tile_roof(b, w, d, z0, h, over=0.7, lift=0.45, m='tile', nx=14, gable='plaster'):
    """맞배 기와지붕: 처마 끝이 살짝 들리고, 기왓골이 줄무늬로 보인다."""
    W, D = w + 2 * over, d + 2 * over

    def surf(u, v, dz=0.0):
        e = abs(2 * v - 1)
        return ((u - 0.5) * W, (v - 0.5) * D, z0 + h * (1 - e ** 1.25) + lift * (abs(2 * u - 1) ** 3) * e + 0.12 * e * e + dz)
    for i in range(nx):
        u0, u1 = i / nx, (i + 1) / nx
        b.grid(1, 8, lambda u, v, u0=u0, u1=u1: surf(u0 + (u1 - u0) * u, v), m, tone=1.0 if i % 2 else 0.84, jit=0.04)
    b.grid(nx, 8, lambda u, v: surf(1 - u, v, -0.14), 'dark', jit=0)
    b.box((W + 0.1, 0.3, 0.24), (0, 0, z0 + h + 0.08), 'tile_l', bevel=0.05, f=lambda v: Vector((v.x, v.y, v.z + lift * 0.5 * (abs(v.x) / (W / 2)) ** 3)))
    for s in (-1, 1):
        b.box((0.3, 0.34, 0.5), (s * (W / 2 - 0.08), 0, z0 + h + 0.3 + lift * 0.5), 'tile_l', bevel=0.06, rot=(0, -s * 0.35, 0))
        if gable:
            b.prism([(-d / 2, 0), (d / 2, 0), (0, h * 0.82)], 0.14, (s * (w / 2 - 0.02), 0, z0), gable, rot=(0, 0, math.pi / 2))


def hip_roof(b, w, d, z0, h, over=1.0, lift=0.7, vb=0.6, m='tile', nx=22, ns=8, nv=5, chimi=True, gable='green'):
    """팔작 기와지붕: 네 귀가 들린 처마 · 위쪽 양옆에 합각(세모 벽) · 용마루 끝에 치미(신라 지붕의 큰 꼬리 장식)."""
    Wx, Dy = w / 2 + over, d / 2 + over
    rh = max(0.4, Wx - Dy * 0.9)
    zp = lambda v: z0 + h * (v ** 1.45)
    xe = lambda v: Wx - (Wx - rh) * min(1.0, v / vb)
    lf = lambda c, v: lift * (abs(c) ** 3) * max(0.0, 1 - v / vb) ** 2

    def front(u, v, s, dz=0.0):
        c = 2 * u - 1
        return (c * xe(v), s * Dy * (1 - v), zp(v) + lf(c, v) + dz)

    def side(t, sv, s, dz=0.0):
        v = sv * vb
        c = 2 * t - 1
        return (s * (Wx - (Wx - rh) * sv), c * Dy * (1 - v), zp(v) + lf(c, v) + dz)
    for s in (-1, 1):
        for i in range(nx):
            u0, u1 = i / nx, (i + 1) / nx
            if s < 0:
                b.grid(1, nv, lambda u, v, u0=u0, u1=u1: front(u0 + (u1 - u0) * u, v, -1), m, tone=1.0 if i % 2 else 0.84, jit=0.04)
            else:
                b.grid(1, nv, lambda u, v, u0=u0, u1=u1: front(u0 + (u1 - u0) * (1 - u), v, 1), m, tone=1.0 if i % 2 else 0.84, jit=0.04)
        for i in range(ns):
            t0, t1 = i / ns, (i + 1) / ns
            if s > 0:
                b.grid(1, 3, lambda u, v, t0=t0, t1=t1: side(t0 + (t1 - t0) * u, v, 1), m, tone=1.0 if i % 2 else 0.84, jit=0.04)
            else:
                b.grid(1, 3, lambda u, v, t0=t0, t1=t1: side(t0 + (t1 - t0) * (1 - u), v, -1), m, tone=1.0 if i % 2 else 0.84, jit=0.04)
        # 처마 밑(어두운 면)
        b.grid(12, 3, lambda u, v, s=s: front(u if s > 0 else 1 - u, v * 0.55, s, -0.2), 'dark', jit=0)
        b.grid(6, 3, lambda u, v, s=s: side(u if s < 0 else 1 - u, v * 0.8, s, -0.2), 'dark', jit=0)
        # 합각 · 내림마루
        zb, yb = zp(vb), Dy * (1 - vb)
        b.prism([(-yb, zb), (yb, zb), (0, z0 + h)], 0.12, (s * rh, 0, 0), gable, rot=(0, 0, math.pi / 2), jit=0.03)
        b.box((0.16, 2 * yb + 0.2, 0.14), (s * rh, 0, zb + 0.04), 'tile_l', jit=0.03)
        for t in (-1, 1):
            c0 = (s * Wx, t * Dy, zp(0) + lift + 0.08)
            mid = (s * (Wx - (Wx - rh) * 0.5), t * Dy * (1 - vb * 0.5), zp(vb * 0.5) + lf(1, vb * 0.5) + 0.08)
            c1 = (s * rh, t * yb, zb + 0.08)
            beam(b, c0, mid, 0.11, 'tile_l')
            beam(b, mid, c1, 0.11, 'tile_l')
            b.box((0.2, 0.2, 0.36), (s * Wx * 0.99, t * Dy * 0.99, zp(0) + lift + 0.2), 'tile_l', rot=(0, -s * 0.4, 0), jit=0.03)
            beam(b, (s * rh, t * yb, zb + 0.08), (s * rh, 0, z0 + h + 0.06), 0.1, 'tile_l')
    b.box((2 * rh + 0.3, 0.42, 0.32), (0, 0, z0 + h + 0.1), 'tile_l', bevel=0.05, jit=0.03)
    if chimi:
        for s in (-1, 1):
            k = 0.55 + h * 0.18
            pts = [(0, 0), (0.62 * k, 0), (0.7 * k, 0.35 * k), (0.5 * k, 0.95 * k), (0.2 * k, 1.35 * k), (0.05 * k, 1.2 * k), (0.1 * k, 0.55 * k)]
            b.prism([(s * -x, z) for x, z in (pts if s < 0 else list(reversed(pts)))], 0.3, (s * (rh + 0.1), 0, z0 + h + 0.18), 'tile_l', jit=0.04)
    return Wx, Dy


def lattice(b, x, y, z, w, h, m='paper', side=None, frame='green', nv=3):
    """창호: 종이 + 살. side 가 None 이면 앞(-y)을 본다."""
    t = 0.05
    if side is None:
        b.box((w, t, h), (x, y, z), m, jit=0)
        b.box((w + 0.1, t + 0.03, 0.07), (x, y, z + h / 2), frame, jit=0); b.box((w + 0.1, t + 0.03, 0.07), (x, y, z - h / 2), frame, jit=0)
        for i in range(nv):
            b.box((0.04, t + 0.03, h), (x - w / 2 + w * i / (nv - 1), y, z), frame, jit=0)
        b.box((w, t + 0.03, 0.035), (x, y, z), frame, jit=0)
    else:
        b.box((t, w, h), (x, y, z), m, jit=0)
        for i in range(3):
            b.box((t + 0.03, 0.04, h), (x, y - w / 2 + w * i / 2, z), frame, jit=0)


def quad(b, m, p, tone=1.0, jit=0.05):
    """네 점으로 얇은 면 하나(돌 줄눈·판축 띠처럼 같은 면 위에 색만 다르게)."""
    b.grid(1, 1, lambda u, v: tuple(Vector(p[0]) * (1 - u) * (1 - v) + Vector(p[1]) * u * (1 - v) + Vector(p[2]) * u * v + Vector(p[3]) * (1 - u) * v), m, tone=tone, jit=jit)


# ═════ 판축 흙담(길이 4 · 두께 1 · 몸 높이 3, x 로 길다): 돌 바닥 · 켜켜이 다진 흙 띠 · 회 바른 머리 · 기와 ═════
def wall_seg(name, H=3.0, low=False):
    b = B()
    rr = random.Random(hash(name) & 0xff)
    FT = 0.5 if not low else 0.38
    b.box((4.0, 1.12, FT), (0, 0, FT / 2), 'stone', jit=0.06)
    for s in (-1, 1):
        y = s * 0.565
        for j in range(1):
            xs = [-2.0, -1.0, -0.05, 1.05, 2.0]
            for i, (xa, xb) in enumerate(zip(xs, xs[1:])):
                z0, z1 = 0.04, FT - 0.04
                p = [(xa + 0.03, y, z0), (xb - 0.03, y, z0), (xb - 0.03, y, z1), (xa + 0.03, y, z1)]
                quad(b, 'stone_d' if (i + j) % 2 else 'stone_l', p if s < 0 else list(reversed(p)), tone=0.9 + rr.random() * 0.15, jit=0.04)
    top = H if not low else 1.5
    b.box((4.0, 1.0, top - FT), (0, 0, FT + (top - FT) / 2), 'tint_wall', jit=0.03)
    nb = 5 if not low else 3
    for s in (-1, 1):
        y = s * 0.502
        for k in range(nb):
            z0 = FT + (top - FT) * k / nb
            z1 = FT + (top - FT) * (k + 1) / nb
            if k == nb - 1:
                continue
            p = [(-2.0, y * 1.002, z1 - 0.025), (2.0, y * 1.002, z1 - 0.025), (2.0, y * 1.002, z1), (-2.0, y * 1.002, z1)]
            quad(b, 'tint_wall', p if s < 0 else list(reversed(p)), tone=0.87, jit=0)
    if low:
        # 무너진 머리: 기와가 반쯤 빠지고 흙이 드러난 곳 · 앞(-y)에 떨어진 돌과 기와 조각(밟고 오르는 자리)
        b.box((4.0, 1.06, 0.1), (0, 0, top + 0.05), 'earth_l', jit=0.06)
        for i, (x0, x1) in enumerate([(-2.0, -0.9), (0.55, 2.0)]):
            for s in (-1, 1):
                p = [(x0, s * 0.62, top + 0.06), (x1, s * 0.62, top + 0.06), (x1, 0, top + 0.36), (x0, 0, top + 0.36)]
                quad(b, 'tile', p if s > 0 else list(reversed(p)), tone=0.92, jit=0.05)
            b.box((x1 - x0, 0.22, 0.14), ((x0 + x1) / 2, 0, top + 0.4), 'tile_l', jit=0.03)
        for x, y, r in [(-0.4, -0.62, 0.17), (0.05, -0.66, 0.14), (0.35, -0.6, 0.12), (-0.15, -0.72, 0.1)]:
            b.ball(r, (x, y, r * 0.6), 'stone_d' if x > 0 else 'stone', sub=1, scale=(1.3, 1, 0.75), jit=0.1)
        for x, a in [(-0.2, 0.4), (0.25, -0.8)]:
            b.box((0.3, 0.2, 0.04), (x, -0.78, 0.04), 'tile', rot=(0.2, 0.1, a), jit=0.06)
        b.done(name, smooth=0, shade=(0.76, 1.08), under=0.28)
        return
    b.box((4.0, 1.12, 0.12), (0, 0, top + 0.06), 'plaster', jit=0.02)
    zr, ze, ye = top + 0.62, top + 0.14, 0.74
    for s in (-1, 1):
        for i in range(6):
            x0, x1 = -2.0 + i * 4 / 6, -2.0 + (i + 1) * 4 / 6
            p = [(x0, s * ye, ze), (x1, s * ye, ze), (x1, s * 0.05, zr), (x0, s * 0.05, zr)]
            quad(b, 'tile', p if s > 0 else list(reversed(p)), tone=1.0 if i % 2 else 0.83, jit=0.04)
        p = [(-2.0, s * ye, ze - 0.06), (2.0, s * ye, ze - 0.06), (2.0, s * 0.05, zr - 0.08), (-2.0, s * 0.05, zr - 0.08)]
        quad(b, 'dark', p if s < 0 else list(reversed(p)), jit=0)
        p = [(-2.0, s * (ye + 0.01), ze - 0.08), (2.0, s * (ye + 0.01), ze - 0.08), (2.0, s * (ye + 0.01), ze + 0.03), (-2.0, s * (ye + 0.01), ze + 0.03)]
        quad(b, 'tile_l', p if s < 0 else list(reversed(p)), jit=0.02)
    b.box((4.0, 0.2, 0.16), (0, 0, zr + 0.04), 'tile_l', jit=0.02)
    b.done(name, smooth=0, shade=(0.74, 1.08), under=0.3)


wall_seg('sil_wall')
wall_seg('sil_wall_low', low=True)


# ═════ 문(가운데 원점 · 기둥 둘이 x = ±2.5, 문짝은 따로) ═════
def gate_frame(b, H=4.4, post='red', grand=0):
    for s in (-1, 1):
        b.box((0.9, 1.3, 0.3), (s * 2.5, 0, 0.15), 'stone', bevel=0.05, jit=0.06)
        b.cone(0.3, 0.27, H, (s * 2.5, 0, 0.3 + H / 2), post, seg=8, jit=0.03)
    b.box((5.0, 0.24, 0.12), (0, 0, 0.06), 'stone_l', bevel=0.03, jit=0.05)    # 문지방 돌
    b.box((5.6, 0.44, 0.42), (0, 0, H + 0.2), 'tint_rank', jit=0.03)          # 문 위 가로대(문 빛깔)
    b.box((5.6, 0.48, 0.08), (0, 0, H + 0.03), 'wood_d', jit=0.02)
    b.box((1.2, 0.08, 0.5), (0, -0.25, H - 0.32), 'wood_d', jit=0.02)          # 현판
    b.box((1.04, 0.1, 0.36), (0, -0.25, H - 0.32), 'tint_rank', jit=0.02)
    b.box((0.7, 0.11, 0.08), (0, -0.25, H - 0.32), 'gold', jit=0)
    for s in (-1, 1):
        b.box((0.08, 0.12, 0.42), (s * 0.55, -0.25, H - 0.32), 'gold', jit=0)


# 누런·푸른 문: 맞배 한 칸
b = B()
gate_frame(b, 4.4, 'wood')
for x in (-1.6, 0, 1.6):
    b.box((0.36, 0.5, 0.26), (x, 0, 4.73), 'wood_l', jit=0.04)
tile_roof(b, 5.4, 1.4, 4.86, 1.0, over=0.55, lift=0.32, nx=12, gable='tint_rank')
b.done('gate_a', smooth=0, shade=(0.76, 1.07), under=0.28)

# 붉은 문: 공포(겹친 받침) · 단청 띠 · 팔작지붕
b = B()
gate_frame(b, 4.4, 'red')
b.box((5.8, 0.6, 0.18), (0, 0, 4.73), 'green', jit=0.03)
for x in (-2.5, -1.25, 0, 1.25, 2.5):
    b.box((0.5, 0.7, 0.18), (x, 0, 4.91), 'wood_l', jit=0.03)
    b.box((0.34, 0.9, 0.16), (x, 0, 5.08), 'green_l', jit=0.03)
    b.box((0.44, 0.44, 0.16), (x, 0, 5.24), 'red', jit=0.03)
b.box((5.9, 0.12, 0.08), (0, -0.33, 4.73), 'blue', jit=0); b.box((5.9, 0.12, 0.08), (0, 0.33, 4.73), 'blue', jit=0)
hip_roof(b, 5.6, 1.4, 5.32, 1.35, over=0.75, lift=0.5, nx=12, ns=4, nv=4, chimi=False, gable='tint_rank')
b.done('gate_b', smooth=0, shade=(0.76, 1.07), under=0.28)

# 자줏빛 문: 진골만 드나드는 문루(아래 문 · 위 다락 · 두 겹 지붕)
b = B()
gate_frame(b, 4.6, 'red')
b.box((6.0, 1.8, 0.24), (0, 0, 4.98), 'wood_d', jit=0.03)                   # 다락 바닥
b.box((6.3, 2.1, 0.12), (0, 0, 4.86), 'green', jit=0.03)
XI, YI, ZI, XO, YO, ZO, LF = 2.95, 0.95, 5.3, 3.85, 1.9, 4.66, 0.3          # 아래 처마(둘레를 두른 짧은 지붕)


def skirt(u, v, s, side):
    c = 2 * u - 1
    zl = LF * abs(c) ** 3 * (1 - v)
    if side:
        return (s * (XO + (XI - XO) * v), c * (YO + (YI - YO) * v), ZO + (ZI - ZO) * v + zl)
    return (c * (XO + (XI - XO) * v), s * (YO + (YI - YO) * v), ZO + (ZI - ZO) * v + zl)
for s in (-1, 1):
    for i in range(14):
        u0, u1 = i / 14, (i + 1) / 14
        b.grid(1, 2, lambda u, v, u0=u0, u1=u1, s=s: skirt(u0 + (u1 - u0) * (u if s > 0 else 1 - u), v, s, False), 'tile', tone=1.0 if i % 2 else 0.84, jit=0.04)
    for i in range(6):
        u0, u1 = i / 6, (i + 1) / 6
        b.grid(1, 2, lambda u, v, u0=u0, u1=u1, s=s: skirt(u0 + (u1 - u0) * (u if s < 0 else 1 - u), v, s, True), 'tile', tone=1.0 if i % 2 else 0.84, jit=0.04)
    b.grid(8, 1, lambda u, v, s=s: tuple(Vector(skirt(u if s < 0 else 1 - u, v, s, False)) - Vector((0, 0, 0.12))), 'dark', jit=0)
    for t in (-1, 1):
        beam(b, (s * XO, t * YO, ZO + LF + 0.06), (s * XI, t * YI, ZI + 0.06), 0.09, 'tile_l')
for x in (-2.5, -0.85, 0.85, 2.5):                                           # 다락 기둥 · 난간
    for y in (-0.75, 0.75):
        b.cone(0.13, 0.13, 1.7, (x, y, 5.95), 'red', seg=6, jit=0.03)
b.box((5.0, 1.3, 1.05), (0, 0, 6.2), 'wood', jit=0.03)
for s in (-1, 1):
    b.box((5.6, 0.07, 0.07), (0, s * 0.95, 5.66), 'red_d', jit=0)
    for i in range(14):
        b.box((0.05, 0.05, 0.36), (-2.6 + i * 0.4, s * 0.95, 5.48), 'red_d', jit=0)
    for x in (-1.67, 0, 1.67):
        lattice(b, x, s * 0.67, 6.2, 1.3, 0.85, frame='green', nv=4)
    lattice(b, s * 2.52, 0, 6.2, 0.9, 0.7, side='L', frame='green')
b.box((5.9, 1.8, 0.16), (0, 0, 6.86), 'green', jit=0.03)
b.box((6.0, 1.84, 0.05), (0, 0, 6.96), 'blue', jit=0)
for x in (-2.5, -1.67, -0.85, 0, 0.85, 1.67, 2.5):
    b.box((0.4, 0.5, 0.16), (x, -0.85, 7.04), 'red', jit=0.03); b.box((0.4, 0.5, 0.16), (x, 0.85, 7.04), 'red', jit=0.03)
hip_roof(b, 5.6, 1.7, 7.08, 1.6, over=0.85, lift=0.6, nx=14, ns=4, nv=4, chimi=True, gable='tint_rank')
b.done('gate_c', smooth=0, shade=(0.74, 1.07), under=0.28)

# 문짝(너비 2.5 · 높이 3.6 · 두께 0.2, 돌쩌귀가 x = 0, +x 로 뻗는다): 널 · 띠장 · 둥근 못 · 문고리
b = B()
for i in range(5):
    b.box((0.49, 0.2, 3.6), (0.25 + i * 0.5, 0, 1.8), 'tint_door', tone=1.0 if i % 2 else 0.9, jit=0.05)
for z in (0.5, 1.8, 3.1):
    b.box((2.44, 0.06, 0.18), (1.25, -0.12, z), 'wood_d', jit=0.03)
    for i in range(4):
        b.box((0.09, 0.05, 0.09), (0.35 + i * 0.6, -0.16, z), 'bronze', jit=0.02)
b.cone(0.13, 0.13, 0.03, (2.25, -0.13, 1.85), 'bronze', seg=8, rot=(math.pi / 2, 0, 0))
b.cone(0.1, 0.1, 0.03, (2.25, -0.16, 1.68), 'bronze', seg=8, rot=(math.pi / 2, 0, 0))
b.done('gate_leaf', smooth=0, shade=(0.8, 1.06), under=0.2)


# ═════ 가장 안쪽 전각(막는 네모 18 x 5 에 꼭 맞는 기단, 가운데 원점): 두 단 기단 · 앞 돌계단 · 붉은 기둥 일곱 칸 · 창호 · 단청 · 팔작지붕 ═════
b = B()
b.box((18.0, 4.4, 0.55), (0, 0.3, 0.275), 'stone', jit=0.05)
for i in range(13):
    b.box((0.06, 0.04, 0.42), (-8.6 + i * 1.433, -1.92, 0.27), 'stone_d', jit=0)
b.box((18.1, 4.5, 0.08), (0, 0.3, 0.57), 'stone_l', jit=0.04)
b.box((16.6, 3.9, 0.45), (0, 0.45, 0.835), 'stone', jit=0.05)
b.box((16.7, 4.0, 0.07), (0, 0.45, 1.08), 'stone_l', jit=0.04)
for k in range(3):     # 앞 계단(가운데) · 양쪽 작은 계단
    b.box((3.4, 0.24, 0.37 * (k + 1)), (0, -2.38 + k * 0.24, 0.185 * (k + 1)), 'stone_l' if k % 2 else 'stone', jit=0.04)
    for x in (-6.2, 6.2):
        b.box((1.6, 0.24, 0.37 * (k + 1)), (x, -2.38 + k * 0.24, 0.185 * (k + 1)), 'stone_l' if k % 2 else 'stone', jit=0.04)
for x in (-1.85, 1.85, -7.1, -5.3, 5.3, 7.1):
    b.box((0.3, 0.8, 1.15), (x, -2.1, 0.575), 'stone_d', bevel=0.04, jit=0.05)
ZF = 1.12
HC = 3.1
xs = [-7.5 + i * 2.5 for i in range(7)]
for x in xs:
    for y in (-1.3, 1.7):
        b.cone(0.32, 0.36, 0.16, (x, y, ZF + 0.08), 'stone_l', seg=8, jit=0.03)
        b.cone(0.21, 0.24, HC, (x, y, ZF + 0.16 + HC / 2), 'red', seg=8, jit=0.03)
b.box((15.2, 2.5, HC), (0, 0.55, ZF + HC / 2), 'plaster', jit=0.02)
for i in range(6):     # 앞 창호(가운데 세 칸은 문)
    x = -6.25 + i * 2.5
    door = 1 <= i <= 4
    lattice(b, x, -0.73, ZF + (1.35 if door else 1.75), 2.1, 2.5 if door else 1.4, frame='green', nv=4)
    if not door:
        b.box((2.2, 0.05, 1.0), (x, -0.73, ZF + 0.5), 'earth_d', jit=0.03)
b.box((15.4, 0.06, 0.3), (0, -0.74, ZF + 2.85), 'red_d', jit=0)
for s in (-1, 1):
    lattice(b, s * 7.62, 0.55, ZF + 1.7, 1.4, 1.5, side='L', frame='green')
for y in (-1.3, 1.7):  # 창방 · 평방 · 공포(단청)
    b.box((15.6, 0.34, 0.34), (0, y, ZF + HC + 0.3), 'green', jit=0.02)
    b.box((15.6, 0.36, 0.06), (0, y, ZF + HC + 0.46), 'blue', jit=0)
    b.box((15.8, 0.4, 0.2), (0, y, ZF + HC + 0.6), 'red_d', jit=0.02)
    for x in xs:
        b.box((0.42, 0.62, 0.18), (x, y, ZF + HC + 0.8), 'wood_l', jit=0.03)
        b.box((0.3, 0.86, 0.16), (x, y, ZF + HC + 0.97), 'green_l', jit=0.03)
        b.box((0.42, 0.42, 0.16), (x, y, ZF + HC + 1.12), 'red', jit=0.03)
for s in (-1, 1):
    b.box((0.34, 3.3, 0.34), (s * 7.5, 0.2, ZF + HC + 0.3), 'green', jit=0.02)
b.box((1.9, 0.1, 0.8), (0, -1.45, ZF + HC + 0.0), 'wood_d', jit=0.02)       # 현판
b.box((1.7, 0.12, 0.6), (0, -1.45, ZF + HC + 0.0), 'blue', jit=0.02)
for k in range(3):
    b.box((0.18, 0.13, 0.14), (-0.4 + k * 0.4, -1.47, ZF + HC + 0.0), 'gold', jit=0)
hip_roof(b, 15.6, 3.4, ZF + HC + 1.2, 2.5, over=1.6, lift=0.95, vb=0.62, nx=24, ns=8, nv=5, chimi=True, gable='green')
b.done('jeongak', smooth=0, shade=(0.74, 1.07), under=0.28)


# ═════ 관청 건물(막는 네모에 맞춘 크기, 가운데 원점) ═════
def office(name, w, d, bays, kind):
    """kind: 'lib' 서고(앞이 트인 툇간 · 뒤에 책장) · 'guest' 객관(툇마루 · 처마 밑 등) · 'exam' 시험장(앞이 트인 대청 · 낮은 책상들) · 'office' 관청."""
    b = B()
    pl = 0.15 if kind == 'lib' else 0.35
    b.box((w + 0.2, d + 0.2, pl), (0, 0, pl / 2), 'stone', jit=0.06)
    b.box((w + 0.3, d + 0.3, 0.05), (0, 0, pl), 'stone_l', jit=0.04)
    hg = 2.5
    bw = w / bays
    yb = d / 2 - 0.18
    yf = -d / 2 + 0.18
    open_front = kind in ('lib', 'exam')
    yw = (d / 2 - 0.62) if kind == 'lib' else (yf + 0.9 if kind == 'exam' else yf + 0.05)
    for i in range(bays + 1):
        x = -w / 2 + 0.18 + (w - 0.36) * i / bays
        for y in (yf, yb):
            b.cone(0.16, 0.18, hg, (x, y, pl + hg / 2), 'red', seg=7, jit=0.03)
    wd = yb - yw
    b.box((w - 0.4, max(0.2, wd), hg), (0, (yb + yw) / 2, pl + hg / 2), 'plaster', jit=0.02)
    if not open_front:
        for i in range(bays):
            x = -w / 2 + bw * (i + 0.5)
            lattice(b, x, yw - 0.12, pl + 1.3, bw * 0.62, 1.4, frame='green')
            b.box((bw * 0.8, 0.06, 0.5), (x, yw - 0.12, pl + 0.28), 'earth_d', jit=0.03)
    else:
        b.box((w - 0.4, 0.04, 0.12), (0, yw - 0.1, pl + hg - 0.3), 'red_d', jit=0)
        b.box((w - 0.4, d - 0.4, 0.08), (0, 0, pl + 0.04), 'wood_l', jit=0.04)
        for i in range(bays * 2 + 1):
            b.box((0.03, d - 0.4, 0.02), (-w / 2 + 0.2 + (w - 0.4) * i / (bays * 2), 0, pl + 0.085), 'wood', jit=0)
    for s in (-1, 1):
        lattice(b, s * (w / 2 - 0.22), (yb + yw) / 2, pl + 1.5, max(0.3, wd * 0.5), 1.0, side='L', frame='green')
    if kind == 'lib':      # 뒤 벽에 붙은 책장 · 두루마리 함
        for i in range(bays):
            x = -w / 2 + bw * (i + 0.5)
            if abs(x - 5.0) < 1.6:
                continue
            b.box((bw * 0.7, 0.36, 1.9), (x, yw - 0.2, pl + 0.95), 'wood_d', jit=0.04)
            for r in range(3):
                for k in range(5):
                    c = ['silk_r', 'silk_b', 'scroll', 'silk_y', 'silk_g'][(i + r + k) % 5]
                    b.box((0.13, 0.04, 0.13), (x - bw * 0.27 + k * bw * 0.135, yw - 0.4, pl + 0.35 + r * 0.6), c, jit=0.04)
    if kind == 'exam':     # 대청 안 낮은 책상 줄
        for i in range(bays):
            x = -w / 2 + bw * (i + 0.5)
            b.box((1.1, 0.5, 0.36), (x, yf + 0.45, pl + 0.26), 'wood', jit=0.05)
            b.box((0.5, 0.36, 0.02), (x, yf + 0.45, pl + 0.45), 'paper', jit=0)
            b.box((0.7, 0.5, 0.06), (x, yf + 0.0, pl + 0.11), 'cushion', jit=0.04)
    if kind == 'guest':    # 툇마루 · 처마 밑 등롱
        b.box((w - 0.4, 0.75, 0.12), (0, yf + 0.3, pl + 0.42), 'wood_l', jit=0.05)
        for x in (-w / 2 + bw, w / 2 - bw):
            b.box((0.05, 0.05, 0.4), (x, yf, pl + hg - 0.2), 'wood_d')
            b.cone(0.16, 0.16, 0.36, (x, yf, pl + hg - 0.55), 'silk_r', seg=6, jit=0.03)
    for y in (yf, yb):
        b.box((w + 0.1, 0.3, 0.28), (0, y, pl + hg + 0.14), 'green', jit=0.02)
        b.box((w + 0.2, 0.34, 0.06), (0, y, pl + hg + 0.3), 'blue', jit=0)
        for i in range(bays + 1):
            x = -w / 2 + 0.18 + (w - 0.36) * i / bays
            b.box((0.32, 0.5, 0.16), (x, y, pl + hg + 0.4), 'red', jit=0.03)
    tile_roof(b, w - 0.2, d, pl + hg + 0.45, 1.2 + d * 0.12, over=0.8, lift=0.42, m='tint_roof', nx=max(12, int(w * 2.2)), gable='green')
    b.done(name, smooth=0, shade=(0.76, 1.07), under=0.28)


office('lib_hall', 18.0, 2.1, 7, 'lib')
office('guest_hall', 12.0, 3.0, 5, 'guest')
office('exam_hall', 14.0, 3.0, 5, 'exam')
office('office_hall', 8.0, 3.5, 3, 'office')

# ═════ 책 시렁(너비 1.8 · 깊이 0.5 · 높이 1.8): 나무 틀 · 세 칸 · 두루마리와 꿰맨 책 ═════
b = B()
for s in (-1, 1):
    b.box((0.1, 0.5, 1.85), (s * 0.85, 0, 0.925), 'wood_d', jit=0.04)
for z in (0.1, 0.68, 1.26, 1.82):
    b.box((1.8, 0.5, 0.06), (0, 0, z), 'wood', jit=0.05)
b.box((1.7, 0.04, 1.75), (0, 0.24, 0.92), 'wood_d', jit=0.03)
rr = random.Random(4)
for r, z in enumerate((0.13, 0.71, 1.29)):
    x = -0.74
    while x < 0.7:
        if (r + int(x * 10)) % 3 == 0:      # 꿰맨 책 더미
            for k in range(3):
                b.box((0.3, 0.38, 0.06), (x + 0.15, 0, z + 0.03 + k * 0.065), ['scroll', 'silk_y', 'paper'][(k + r) % 3], jit=0.05)
            x += 0.36
        else:                               # 두루마리(끝이 비단 빛)
            for k in range(2):
                c = ['silk_r', 'silk_b', 'silk_g', 'silk_y'][(r + k + int(x * 7)) % 4]
                b.cone(0.07, 0.07, 0.44, (x + 0.08, 0, z + 0.07 + k * 0.13), 'scroll', seg=5, rot=(math.pi / 2, 0, 0), jit=0.03)
                b.cone(0.072, 0.072, 0.01, (x + 0.08, -0.225, z + 0.07 + k * 0.13), c, seg=5, cap=True, rot=(math.pi / 2, 0, 0), jit=0)
            x += 0.18
b.done('bookshelf', smooth=0, shade=(0.8, 1.06), under=0.2)

# ═════ 시험 책상(1.6 x 0.9 x 0.5): 종이 · 벼루 · 붓 · 두루마리 · 방석 ═════
b = B()
b.box((1.6, 0.9, 0.08), (0, 0, 0.46), 'wood', bevel=0.02, jit=0.05)
for x in (-0.7, 0.7):
    b.box((0.1, 0.8, 0.42), (x, 0, 0.21), 'wood_d', jit=0.04)
    b.box((0.18, 0.86, 0.06), (x, 0, 0.03), 'wood_d', jit=0.04)
b.box((0.7, 0.5, 0.012), (-0.1, 0, 0.506), 'paper', jit=0)
for i in range(4):
    b.box((0.03, 0.4, 0.004), (-0.35 + i * 0.12, 0, 0.514), 'ink', jit=0)
b.box((0.24, 0.32, 0.05), (0.5, 0.12, 0.525), 'stone_d', jit=0.04)
b.box((0.16, 0.12, 0.012), (0.5, 0.2, 0.555), 'ink', jit=0)
b.cone(0.012, 0.01, 0.32, (0.48, -0.22, 0.52), 'wood_l', seg=5, rot=(0, math.pi / 2, 0.3))
b.cone(0.022, 0.004, 0.06, (0.33, -0.27, 0.52), 'ink', seg=5, rot=(0, math.pi / 2, 0.3))
b.cone(0.05, 0.05, 0.5, (-0.45, 0.32, 0.55), 'scroll', seg=6, rot=(0, math.pi / 2, 0.1))
b.box((0.9, 0.8, 0.1), (0, 0.85, 0.05), 'cushion', bevel=0.04, jit=0.04)
b.done('exam_desk', smooth=0, shade=(0.8, 1.06), under=0.2)

# ═════ 신라 석등(목표 등불, 높이 3.6 · 불 창 가운데가 2.9): 팔각 받침 · 연꽃 · 기둥 · 화사석(불 창 넷) · 지붕돌 · 보주 ═════
b = B()
b.cone(0.62, 0.62, 0.22, (0, 0, 0.11), 'stone', seg=8, jit=0.05)
b.lathe([(0.55, 0.22), (0.5, 0.32), (0.34, 0.5), (0.3, 0.56)], (0, 0, 0), 'stone_l', seg=8, jit=0.05)
for k in range(8):     # 엎은 연꽃잎
    a = k * math.pi / 4 + math.pi / 8
    b.ball(0.17, (math.cos(a) * 0.42, math.sin(a) * 0.42, 0.36), 'stone_l', sub=1, scale=(1, 0.7, 0.5), rot=(0, 0.5, a), jit=0.05)
b.cone(0.16, 0.15, 1.3, (0, 0, 1.2), 'stone', seg=8, jit=0.04)
b.cone(0.18, 0.18, 0.08, (0, 0, 1.2), 'stone_d', seg=8)
b.lathe([(0.2, 1.85), (0.38, 2.05), (0.46, 2.18), (0.44, 2.26)], (0, 0, 0), 'stone_l', seg=8, jit=0.05)
for k in range(8):     # 받친 연꽃잎
    a = k * math.pi / 4
    b.ball(0.15, (math.cos(a) * 0.36, math.sin(a) * 0.36, 2.1), 'stone_l', sub=1, scale=(1, 0.7, 0.5), rot=(0, -0.5, a), jit=0.05)
b.cone(0.36, 0.36, 0.06, (0, 0, 2.29), 'stone_d', seg=8)
b.cone(0.31, 0.31, 0.62, (0, 0, 2.62), 'stone', seg=8, jit=0.04)        # 화사석(2.31~2.93)
b.cone(0.18, 0.18, 0.5, (0, 0, 2.62), 'glow_fire', seg=8)
for k in range(4):     # 불 창
    a = k * math.pi / 2 + math.pi / 8
    b.box((0.2, 0.06, 0.38), (math.cos(a) * 0.29, math.sin(a) * 0.29, 2.62), 'glow_fire', rot=(0, 0, a + math.pi / 2))
b.lathe([(0.34, 2.93), (0.62, 3.0), (0.64, 3.06), (0.42, 3.18), (0.12, 3.32)], (0, 0, 0), 'stone', seg=8, jit=0.05)
for k in range(8):     # 지붕돌 귀(살짝 들림)
    a = k * math.pi / 4 + math.pi / 8
    b.box((0.12, 0.08, 0.08), (math.cos(a) * 0.62, math.sin(a) * 0.62, 3.07), 'stone_l', rot=(0, 0, a), jit=0.03)
b.cone(0.12, 0.08, 0.12, (0, 0, 3.38), 'stone_l', seg=8)
b.ball(0.12, (0, 0, 3.52), 'stone_l', sub=1, scale=(1, 1, 1.2), jit=0.03)
b.done('seokdeung', smooth=0, shade=(0.74, 1.08), under=0.25)

# ═════ 당나라 가는 배(길이 7.6 · 너비 2.5, 이물 = -y): 넓은 바닥 · 뱃전 · 뒤 집 · 돛대 · 대발 돛 · 키 ═════
b = B()
L, HW = 7.6, 1.25
hw = lambda u: HW * (0.22 + 0.78 * math.sin(math.pi * min(1.0, u * 1.6) / 2) ** 0.7) * (1 - 0.3 * max(0.0, u - 0.75) / 0.25)
zt = lambda u: 0.95 + 0.55 * (1 - u) ** 3 + 0.35 * max(0, u - 0.8) / 0.2
zb = lambda u: -0.3 + 0.55 * (1 - u) ** 4


def hullp(u, v, k=1.0, dz=0.0):
    w = hw(u) * k
    pts = [(-w, zt(u)), (-0.8 * w, zb(u) + dz), (0.8 * w, zb(u) + dz), (w, zt(u))]
    i = min(int(v * 3 + 1e-6), 2)
    t = v * 3 - i
    return (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, (u - 0.5) * L, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t)
b.grid(3, 12, lambda v, u: hullp(u, v), 'wood_l', jit=0.07)
b.grid(3, 12, lambda v, u: hullp(u, 1 - v, 0.9, 0.08), 'wood_d', jit=0.05)
for s in (-1, 1):
    for i in range(12):
        u0, u1 = i / 12, (i + 1) / 12
        p0 = Vector((s * hw(u0), (u0 - 0.5) * L, zt(u0) + 0.03)); p1 = Vector((s * hw(u1), (u1 - 0.5) * L, zt(u1) + 0.03))
        beam(b, p0, p1, 0.07, 'wood_l', seg=4)
    b.box((0.06, 3.0, 0.22), (s * 1.22, 0.4, 0.62), 'red_d', jit=0.03)
b.box((2.2, 5.4, 0.08), (0, 0.4, 0.62), 'wood_l', jit=0.06)                 # 갑판
b.box((1.9, 1.6, 1.0), (0, 2.6, 1.12), 'wood', jit=0.05)                   # 뒤 집
b.prism([(-1.15, 0), (1.15, 0), (0.0, 0.5)], 1.9, (0, 2.6, 1.62), 'sail_d', rot=(0, 0, 0), jit=0.05)
lattice(b, 0, 1.78, 1.15, 0.8, 0.5, frame='wood_d')
b.cone(0.11, 0.08, 7.4, (0, -0.2, 4.2), 'wood_d', seg=6, jit=0.04)          # 돛대
sw, sh, s0 = 3.0, 4.6, 1.8
b.grid(1, 6, lambda u, v: ((u - 0.5) * sw * (0.9 + 0.1 * v), -0.05 + 0.18 * math.sin(v * math.pi) * (1 - abs(2 * u - 1) * 0.4), s0 + v * sh), 'sail', jit=0.08)
b.grid(1, 6, lambda u, v: ((0.5 - u) * sw * (0.9 + 0.1 * v), -0.08 + 0.18 * math.sin(v * math.pi) * (1 - abs(2 * u - 1) * 0.4), s0 + v * sh), 'sail_d', jit=0.06)
for k in range(7):     # 대나무 살
    v = k / 6
    b.box((sw * (0.9 + 0.1 * v) + 0.12, 0.06, 0.05), (0, -0.09 - 0.18 * math.sin(v * math.pi) * 0.8, s0 + v * sh), 'wood_d', jit=0)
beam(b, (0, -0.2, 7.8), (0, -3.6, 1.5), 0.02, 'rope')
beam(b, (0, -0.2, 7.8), (0, 3.4, 1.7), 0.02, 'rope')
b.box((0.08, 0.6, 1.4), (0, 3.95, 0.4), 'wood_d', jit=0.04)               # 키
b.box((0.06, 0.06, 1.2), (0, 3.6, 1.5), 'wood_d', rot=(0.9, 0, 0))
for x, y, r in [(-0.55, -1.6, 0.32), (0.4, -1.5, 0.28), (0.0, -2.3, 0.26)]:   # 짐(비단·차 꾸러미)
    b.box((r * 2, r * 1.6, r * 1.4), (x, y, 0.66 + r * 0.7), 'rope' if x else 'silk_r', bevel=0.05, jit=0.06)
b.done('tang_ship', smooth=0, shade=(0.98, 1.08), under=0.1)

# ═════ 나루 잔교(너비 3.4, x 로 길다: 뭍 쪽 x = -1.25 에 오르는 널, 물 쪽 끝 x = +1.75, 윗면 0.3) ═════
b = B()
rr = random.Random(9)
for i in range(8):
    x = -0.75 + i * 0.33
    b.box((0.31, 3.4 - rr.random() * 0.14, 0.08), (x, (rr.random() - 0.5) * 0.06, 0.26), 'wood' if i % 3 else 'wood_l', jit=0.1)
for y in (-1.4, 0, 1.4):
    b.box((2.7, 0.14, 0.14), (0.4, y, 0.15), 'wood_d', jit=0.04)
for y in (-1.55, 1.55):
    for x in (-0.6, 0.6, 1.6):
        b.cone(0.1, 0.09, 1.4 if x > 1 else 1.0, (x, y, 0.2 if x > 1 else 0.0), 'wood_d', seg=6, jit=0.08)
b.box((0.8, 2.2, 0.06), (-1.25, 0, 0.13), 'wood_l', rot=(0, 0.35, 0), jit=0.08)
b.lathe([(0.18, 0.3), (0.22, 0.34), (0.18, 0.38)], (1.3, -1.1, 0), 'rope', seg=8, cap=False, jit=0.08)
b.box((0.5, 0.4, 0.3), (1.2, 1.0, 0.45), 'rope', bevel=0.04, jit=0.06)
b.done('naru', smooth=0, shade=(0.72, 1.08), under=0.3)

# ═════ 절 일주문(기둥 둘이 x = ±1.6, 앞 = -y): 돌 받침 · 굵은 기둥 · 겹친 공포 · 현판 · 팔작지붕 ═════
b = B()
for s in (-1, 1):
    b.box((0.9, 0.9, 0.35), (s * 1.6, 0, 0.175), 'stone', bevel=0.05, jit=0.05)
    b.cone(0.3, 0.27, 3.4, (s * 1.6, 0, 2.05), 'red', seg=8, jit=0.03)
b.box((4.2, 0.5, 0.4), (0, 0, 3.7), 'green', jit=0.03)
b.box((4.4, 0.6, 0.12), (0, 0, 3.96), 'blue', jit=0)
for x in (-1.6, -0.8, 0, 0.8, 1.6):
    for k, (wx, wy, m) in enumerate([(0.5, 0.8, 'wood_l'), (0.36, 1.2, 'green_l'), (0.5, 0.5, 'red'), (0.36, 1.5, 'green_l')]):
        b.box((wx, wy, 0.16), (x, 0, 4.1 + k * 0.17), m, jit=0.03)
b.box((1.0, 0.1, 0.62), (0, -0.32, 3.5), 'wood_d', jit=0.02)
b.box((0.84, 0.12, 0.46), (0, -0.33, 3.5), 'blue', jit=0.02)
for k in range(2):
    b.box((0.18, 0.13, 0.14), (-0.2 + k * 0.4, -0.35, 3.5), 'gold', jit=0)
hip_roof(b, 4.0, 1.4, 4.75, 1.4, over=1.0, lift=0.6, nx=16, ns=6, nv=4, chimi=True, gable='green')
b.done('iljumun', smooth=0, shade=(0.76, 1.07), under=0.28)

# ═════ 삼층 석탑(높이 8.3): 두 단 받침 · 몸돌 셋 · 지붕돌(층급 받침 · 귀가 살짝 들림) · 머리 장식 ═════
b = B()
b.box((3.6, 3.6, 0.3), (0, 0, 0.15), 'stone', jit=0.05)
b.box((3.2, 3.2, 0.9), (0, 0, 0.75), 'stone_l', jit=0.04)
b.box((3.4, 3.4, 0.16), (0, 0, 1.28), 'stone', jit=0.04)
b.box((2.4, 2.4, 0.9), (0, 0, 1.81), 'stone_l', jit=0.04)
b.box((2.6, 2.6, 0.14), (0, 0, 2.33), 'stone', jit=0.04)
for s in (-1, 1):
    for x in (-0.6, 0.6):
        quad(b, 'stone_d', [(x - 0.04, s * 1.205, 1.4), (x + 0.04, s * 1.205, 1.4), (x + 0.04, s * 1.205, 2.24), (x - 0.04, s * 1.205, 2.24)] if s < 0 else [(x + 0.04, s * 1.205, 1.4), (x - 0.04, s * 1.205, 1.4), (x - 0.04, s * 1.205, 2.24), (x + 0.04, s * 1.205, 2.24)], jit=0)
z = 2.4
for k, (bw, bh, rw) in enumerate([(1.6, 1.25, 2.9), (1.3, 0.62, 2.5), (1.1, 0.55, 2.2)]):
    b.box((bw, bw, bh), (0, 0, z + bh / 2), 'stone_l', jit=0.04)
    z += bh
    for st in range(4):     # 층급 받침
        b.box((bw + 0.12 + st * 0.12, bw + 0.12 + st * 0.12, 0.07), (0, 0, z + 0.035 + st * 0.07), 'stone', jit=0.03)
    z += 0.28
    r = rw / 2
    b.grid(4, 1, lambda u, v, z=z, r=r: ((math.cos(u * 2 * math.pi + math.pi / 4) * r * 1.414 * (1 - v * 0.72)), (math.sin(u * 2 * math.pi + math.pi / 4) * r * 1.414 * (1 - v * 0.72)), z + v * 0.32 + 0.1 * (1 - v)), 'stone', jit=0.04)
    b.box((rw, rw, 0.1), (0, 0, z + 0.05), 'stone_d', jit=0.03, f=lambda v: Vector((v.x, v.y, v.z + 0.06 * (abs(v.x) * abs(v.y) > 0.9 * (rw / 2) ** 2))))
    z += 0.34
b.box((0.6, 0.6, 0.2), (0, 0, z + 0.1), 'stone', jit=0.03)
b.cone(0.22, 0.15, 0.3, (0, 0, z + 0.35), 'stone_l', seg=8)
b.cone(0.05, 0.05, 1.1, (0, 0, z + 0.95), 'iron', seg=5)
for k in range(3):
    b.cone(0.17 - k * 0.03, 0.17 - k * 0.03, 0.06, (0, 0, z + 0.65 + k * 0.25), 'iron', seg=8)
b.ball(0.09, (0, 0, z + 1.55), 'bronze', sub=1)
b.done('pagoda', smooth=0, shade=(0.72, 1.08), under=0.3)

# ═════ 먼 언덕(지름 1 · 높이 1 로 만들고 크기로 늘린다) · 바닥 돌(1 x 1 · 두께 0.06) ═════
for nm, seed in (('hill_a', 3), ('hill_b', 8)):
    b = B()
    rh_ = random.Random(seed)
    tab = {}

    def hf(u, v, rh_=rh_, tab=tab):
        a = u * 2 * math.pi
        r = 1 - v
        key = (round(u % 1.0, 4), round(v, 4))
        if key not in tab:
            tab[key] = 1 + (rh_.random() - 0.5) * 0.25 * (1 - abs(2 * v - 1) ** 3 if 0 < v < 1 else 0)
        n = tab[key]
        return (math.cos(a) * r * n * 0.5, math.sin(a) * r * n * 0.5 * (0.8 if seed == 8 else 1), (1 - r ** 2) ** 0.75 * n)
    b.grid(14, 5, hf, 'hill', jit=0.12)
    b.done(nm, smooth=0, shade=(0.72, 1.1), under=0.0)

b = B()
b.box((1.0, 1.0, 0.06), (0, 0, 0.03), 'stone_l', jit=0.08)
b.done('pave', smooth=0, shade=(0.92, 1.03), under=0.0)
b = B()
b.box((1.0, 1.0, 0.06), (0, 0, 0.03), 'stone', jit=0.1)
b.done('pave_d', smooth=0, shade=(0.92, 1.03), under=0.0)

export('gate.glb')

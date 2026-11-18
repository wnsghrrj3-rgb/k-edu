"""케이월드 「벽란도」(고려) 장면에만 쓰는 모델 — port.glb. 바닥 가운데가 원점, 블렌더 앞 -y = three +z, 블렌더 +y = three -z(북쪽, 강).
나무 부두(6 m 토막) · 배 넷(송나라 정크선 · 왜선 · 아라비아 다우선 · 고려 배 — 몸통과 돛은 따로, 돛은 아래가 원점이라 늘이면 위로 올라간다) · 건널 널 ·
창고(문 넷이 물건 더미 넷과 마주 본다) · 물건 더미(인삼 · 종이 · 먹 · 나전칠기) · 은병 · 저울(받침 · 저울대 · 접시) · 가게 셋(청자 · 비단 · 약재와 차) ·
청자 가마(오름가마 · 불 아궁이는 빛나는 조각) · 청자 시렁 · 물때 깃대와 깃발 · 짐(실은 물건 · 손에 든 물건) · 부두 짐(나무 상자 · 밧줄 · 짚 짐 · 청자 상자) ·
벽란정(송나라 사신을 맞던 정자) · 먼 언덕 · 고깃배.
배는 길이가 x(이물 = +x), 부두 쪽 뱃전이 블렌더 -y(three +z). 지붕 함수는 make_gate.py 와 같은 꼴(옮겨 적었다)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_cargo', 0xffffff), ('wood', 0x7a5632), ('wood_d', 0x4e3620), ('wood_l', 0xb08a5a), ('wood_w', 0x9a8468), ('wood_wd', 0x6e5c48),
             ('hull_s', 0x5a3a26), ('hull_sd', 0x3e2818), ('red', 0xa8402a), ('red_d', 0x7a2a1a), ('gold', 0xd8b048), ('white', 0xeee6d2), ('black', 0x262220),
             ('sail_s', 0xb8703e), ('sail_sd', 0x9a5a30), ('cedar', 0xc49a66), ('cedar_d', 0x8a6640), ('bark', 0x5a4030), ('mat', 0xd8c28c), ('mat_d', 0xb8a070),
             ('teak', 0xb07a48), ('teak_d', 0x7e5430), ('lime', 0xe8e2cc), ('cotton', 0xf2ecdc), ('cotton_d', 0xd8d0bc),
             ('pine', 0x9a6a3c), ('pine_d', 0x6a4626), ('peg', 0x3a2818), ('sail_k', 0xeadfc4), ('sail_kd', 0xcfc2a2), ('bamboo', 0xb89a5a),
             ('rope', 0xc8b080), ('rope_d', 0x9a8458), ('tile', 0x5a6272), ('tile_l', 0x8d95a3), ('dark', 0x2a2420), ('plaster', 0xf0e8d6),
             ('stone', 0xaaa69c), ('stone_d', 0x88847b), ('stone_l', 0xc8c4b8), ('earth', 0xc8a878), ('void', 0x1e1812),
             ('cel', 0x8ac8b0), ('cel_d', 0x5f9c86), ('cel_l', 0xb4e0cc), ('inlay_w', 0xf4f2ea), ('inlay_k', 0x34302c),
             ('silk_r', 0xc04a6a), ('silk_b', 0x3a5a9a), ('silk_y', 0xd8b048), ('silk_g', 0x4a8a5a), ('silk_p', 0x8a4a9a),
             ('paper', 0xf4efe2), ('paper_d', 0xdcd2ba), ('gins', 0xe2c98e), ('gins_d', 0xb89a5a), ('leaf', 0x4e8a3a), ('berry', 0xd83a2a),
             ('ink', 0x2a2826), ('ink_l', 0x4a4644), ('lacq', 0x2a1a18), ('lacq_r', 0x8a2a20), ('pearl', 0xdceef0), ('pearl_b', 0xa8d0e0),
             ('silver', 0xdde2ea), ('silver_d', 0xa4aab6), ('bronze', 0xb08a3a), ('bronze_d', 0x7e6024),
             ('clay', 0xb0704a), ('clay_d', 0x8a5034), ('clay_l', 0xc89068), ('soot', 0x3a3430), ('brick', 0x9a5a40),
             ('straw', 0xd8c080), ('straw_d', 0xb09a5a), ('herb', 0x6a9a4a), ('herb_d', 0x4a7a3a), ('tea', 0x5a3e2a), ('spice', 0xd88a3a), ('spice_r', 0xb04a2a),
             ('awn_b', 0x3a5a8a), ('awn_r', 0xb84a3a), ('awn_g', 0x5a8a5a), ('awn_w', 0xf0e6d0), ('flag_b', 0x3a7ad8), ('flag_w', 0xf4f0e6),
             ('hill', 0x6a9a50), ('hill_d', 0x52803e), ('green', 0x3f8a6e), ('blue', 0x3c5c9c), ('net', 0x8a7a5a),
             ('glow_fire', 0xffa040)]:
    mat(n, c)


def beam(b, p0, p1, r, m, seg=4, **k):
    """p0 에서 p1 까지 곧은 막대(돛대 줄 · 난간)."""
    d = Vector(p1) - Vector(p0)
    ln = d.length
    th = math.acos(max(-1, min(1, d.z / ln)))
    ph = math.atan2(d.y, d.x)
    b.cone(r, r, ln, tuple((Vector(p0) + Vector(p1)) / 2), m, seg=seg, rot=(0, th, ph), **k)


def quad(b, m, p, tone=1.0, jit=0.05):
    b.grid(1, 1, lambda u, v: tuple(Vector(p[0]) * (1 - u) * (1 - v) + Vector(p[1]) * u * (1 - v) + Vector(p[2]) * u * v + Vector(p[3]) * (1 - u) * v), m, tone=tone, jit=jit)


def tile_roof(b, w, d, z0, h, over=0.7, lift=0.45, m='tile', nx=14, gable='plaster'):
    """맞배 기와지붕: 처마 끝이 살짝 들리고, 기왓골이 줄무늬로 보인다(용마루가 x 로)."""
    W, D = w + 2 * over, d + 2 * over

    def surf(u, v, dz=0.0):
        e = abs(2 * v - 1)
        return ((u - 0.5) * W, (v - 0.5) * D, z0 + h * (1 - e ** 1.25) + lift * (abs(2 * u - 1) ** 3) * e + 0.12 * e * e + dz)
    for i in range(nx):
        u0, u1 = i / nx, (i + 1) / nx
        b.grid(1, 6, lambda u, v, u0=u0, u1=u1: surf(u0 + (u1 - u0) * u, v), m, tone=1.0 if i % 2 else 0.84, jit=0.04)
    b.grid(nx, 6, lambda u, v: surf(1 - u, v, -0.14), 'dark', jit=0)
    b.box((W + 0.1, 0.3, 0.24), (0, 0, z0 + h + 0.08), 'tile_l', bevel=0.05, f=lambda v: Vector((v.x, v.y, v.z + lift * 0.5 * (abs(v.x) / (W / 2)) ** 3)))
    for s in (-1, 1):
        b.box((0.3, 0.34, 0.5), (s * (W / 2 - 0.08), 0, z0 + h + 0.3 + lift * 0.5), 'tile_l', bevel=0.06, rot=(0, -s * 0.35, 0))
        if gable:
            b.prism([(-d / 2, 0), (d / 2, 0), (0, h * 0.82)], 0.14, (s * (w / 2 - 0.02), 0, z0), gable, rot=(0, 0, math.pi / 2))


def hip_roof(b, w, d, z0, h, over=1.0, lift=0.7, vb=0.6, m='tile', nx=16, ns=6, nv=4, gable='green'):
    """팔작 기와지붕(네 귀가 들린 처마 · 합각)."""
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
            b.grid(1, nv, lambda u, v, u0=u0, u1=u1, s=s: front(u0 + (u1 - u0) * (u if s < 0 else 1 - u), v, s), m, tone=1.0 if i % 2 else 0.84, jit=0.04)
        for i in range(ns):
            t0, t1 = i / ns, (i + 1) / ns
            b.grid(1, 3, lambda u, v, t0=t0, t1=t1, s=s: side(t0 + (t1 - t0) * (u if s > 0 else 1 - u), v, s), m, tone=1.0 if i % 2 else 0.84, jit=0.04)
        b.grid(10, 2, lambda u, v, s=s: front(u if s > 0 else 1 - u, v * 0.55, s, -0.2), 'dark', jit=0)
        b.grid(5, 2, lambda u, v, s=s: side(u if s < 0 else 1 - u, v * 0.8, s, -0.2), 'dark', jit=0)
        zb, yb = zp(vb), Dy * (1 - vb)
        b.prism([(-yb, zb), (yb, zb), (0, z0 + h)], 0.12, (s * rh, 0, 0), gable, rot=(0, 0, math.pi / 2), jit=0.03)
        for t in (-1, 1):
            c0 = (s * Wx, t * Dy, zp(0) + lift + 0.08)
            c1 = (s * rh, t * yb, zb + 0.08)
            beam(b, c0, c1, 0.1, 'tile_l')
            beam(b, (s * rh, t * yb, zb + 0.08), (s * rh, 0, z0 + h + 0.06), 0.09, 'tile_l')
    b.box((2 * rh + 0.3, 0.4, 0.3), (0, 0, z0 + h + 0.1), 'tile_l', bevel=0.05, jit=0.03)


def lattice(b, x, y, z, w, h, m='paper', frame='wood_d', nv=3):
    t = 0.05
    b.box((w, t, h), (x, y, z), m, jit=0)
    b.box((w + 0.1, t + 0.03, 0.07), (x, y, z + h / 2), frame, jit=0); b.box((w + 0.1, t + 0.03, 0.07), (x, y, z - h / 2), frame, jit=0)
    for i in range(nv):
        b.box((0.04, t + 0.03, h), (x - w / 2 + w * i / (nv - 1), y, z), frame, jit=0)
    b.box((w, t + 0.03, 0.035), (x, y, z), frame, jit=0)


def disc_y(b, r, loc, m, side, seg=10, rot=(math.pi / 2, 0, 0), **k):
    """뱃전에 붙는 동그라미(배 눈 · 둥근 장식). rot 을 주면 다른 쪽을 본다."""
    b.cone(r, r, 0.03, loc, m, seg=seg, rot=rot, **k)


# ═════ 배 몸통: 길이 L 을 x 로, hw(u)·zt(u)·zb(u) 는 고물(u=0)에서 이물(u=1)까지 반너비 · 뱃전 높이 · 바닥 높이 ═════
def hull(b, L, hw, zt, zb, band='red', upper='hull_s', lower='hull_sd', bottom='hull_sd', inner='wood_d', midk=0.55, bandh=0.3, nu=16, rim='wood_d'):
    def pts(u, k=1.0, dz=0.0):
        w = hw(u) * k
        t, bot = zt(u), zb(u) + dz
        mid = bot + (t - bot) * midk
        return [(-w, t), (-w * 0.995, t - bandh), (-0.93 * w, mid), (-0.6 * w, bot), (0.6 * w, bot), (0.93 * w, mid), (w * 0.995, t - bandh), (w, t)]

    def P(u, s, k=1.0, dz=0.0):
        ps = pts(u, k, dz)
        i = min(int(s), 6)
        f = s - i
        a, c = ps[i], ps[i + 1]
        return ((u - 0.5) * L, a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f)
    mats = [band, upper, lower, bottom, lower, upper, band]
    for i in range(7):
        b.grid(nu, 1, lambda u, v, i=i: P(u, i + v), mats[i], jit=0.06 if i in (1, 5) else 0.04)
    for i in (0, 1, 5, 6):
        b.grid(nu, 1, lambda u, v, i=i: P(u, i + v, 0.93, 0.0), inner, jit=0.05, tone=0.9)
    for u in (0.0, 1.0):
        if hw(u) > 0.05:
            ps = pts(u)
            b.prism([(y, z) for y, z in ps], 0.08, ((u - 0.5) * L + (0.04 if u == 0 else -0.04), 0, 0), upper, rot=(0, 0, math.pi / 2), jit=0.05)
    for s in (-1, 1):
        n = 12
        for i in range(n):
            u0, u1 = i / n, (i + 1) / n
            p0 = ((u0 - 0.5) * L, s * hw(u0), zt(u0) + 0.04)
            p1 = ((u1 - 0.5) * L, s * hw(u1), zt(u1) + 0.04)
            if hw(u0) > 0.02 or hw(u1) > 0.02:
                beam(b, p0, p1, 0.07, rim, seg=4)
    return pts


def wale(b, L, hw, zfun, m, r=0.05, n=10, k=1.0):
    for s in (-1, 1):
        for i in range(n):
            u0, u1 = 0.03 + 0.94 * i / n, 0.03 + 0.94 * (i + 1) / n
            beam(b, ((u0 - 0.5) * L, s * hw(u0) * k, zfun(u0)), ((u1 - 0.5) * L, s * hw(u1) * k, zfun(u1)), r, m, seg=4)


def mast(b, x, z0, h, r=0.13, m='wood_d', rake=0.0):
    beam(b, (x, 0, z0), (x + rake, 0, z0 + h), r, m, seg=6)
    b.ball(r * 1.3, (x + rake, 0, z0 + h + 0.05), m, sub=1)


def lug_sail(b, x0, x1, z0, za, zf, nb, m, md, batten='wood_d', yoff=0.0, billow=0.22, yaw=0.0, cx=0.0):
    """대발 돛(가로 살): 아래 x0~x1 · 높이 z0, 위는 고물 쪽 za · 이물 쪽 zf. yaw 로 돛대(cx) 둘레를 돌린다."""
    cy, sy = math.cos(yaw), math.sin(yaw)

    def P(u, v):
        x = x0 + (x1 - x0) * u
        ztop = za + (zf - za) * u
        z = z0 + (ztop - z0) * v
        x += (0.25 * (1 - v)) * (u - 0.5)
        y = yoff + billow * math.sin(math.pi * v) * (1 - abs(2 * u - 1) * 0.5)
        dx = x - cx
        return (cx + dx * cy - y * sy, dx * sy + y * cy, z)
    for k in range(nb):
        v0, v1 = k / nb, (k + 1) / nb
        b.grid(4, 1, lambda u, v, v0=v0, v1=v1: P(u, v0 + (v1 - v0) * v), m if k % 2 else md, jit=0.06)
    for k in range(nb + 1):
        v = k / nb
        pa, pb = P(-0.03, v), P(1.03, v)
        beam(b, (pa[0], pa[1] - 0.03, pa[2]), (pb[0], pb[1] - 0.03, pb[2]), 0.035 if 0 < k < nb else 0.06, batten, seg=4)


def square_sail(b, cx, w, z0, h, m, md, strips=6, yard='wood_d', yaw=0.0, billow=0.3, vertical=True):
    """네모 돛: 돛대(cx) 둘레로 yaw 만큼 돌린다. vertical 이면 세로 띠(짚 돗자리 돛)."""
    cy, sy = math.cos(yaw), math.sin(yaw)

    def P(u, v):
        x = (u - 0.5) * w
        y = billow * math.sin(math.pi * u) * (0.6 + 0.4 * math.sin(math.pi * v)) - 0.12
        return (cx + x * cy - y * sy, x * sy + y * cy, z0 + v * h)
    for k in range(strips):
        a, c = k / strips, (k + 1) / strips
        if vertical:
            b.grid(1, 4, lambda u, v, a=a, c=c: P(a + (c - a) * u, v), m if k % 2 else md, jit=0.06)
        else:
            b.grid(4, 1, lambda u, v, a=a, c=c: P(u, a + (c - a) * v), m if k % 2 else md, jit=0.06)
    for v in (0.0, 1.0):
        pa, pb = P(-0.04, v), P(1.04, v)
        beam(b, pa, pb, 0.07, yard, seg=5)


# ═════ 나무 부두 한 토막(x 로 6 m · 깊이 4.2 · 윗면 0.08): 널 · 강 쪽 큰 각목과 말뚝 · 매는 기둥 ═════
b = B()
rr = random.Random(11)
for i in range(10):
    y = -2.1 + 0.21 + i * 0.42
    ln = 6.0 - rr.random() * 0.06
    b.box((ln, 0.4, 0.1), ((rr.random() - 0.5) * 0.05, y, 0.03), 'wood_w' if i % 3 else 'wood_wd', jit=0.12)
for x in (-2.9, 0, 2.9):
    b.box((0.14, 4.2, 0.03), (x, 0, 0.085), 'wood_wd', jit=0.05)
b.box((6.02, 0.3, 1.0), (0, 2.0, -0.45), 'wood_d', jit=0.06)
b.box((6.02, 0.36, 0.16), (0, 2.02, 0.06), 'wood', jit=0.05)
for x in (-2.25, -0.75, 0.75, 2.25):
    b.cone(0.17, 0.15, 1.9, (x, 2.22, -0.65), 'wood_d', seg=5, jit=0.08)
for x in (-1.5, 1.5):
    b.box((3.0, 0.08, 0.12), (x, 2.38, -0.75), 'wood_d', rot=(0, 0.42 if x < 0 else -0.42, 0), jit=0.05)
b.box((6.02, 0.2, 0.12), (0, -2.05, 0.02), 'wood', jit=0.05)
b.cone(0.22, 0.19, 0.75, (-1.5, 1.65, 0.45), 'wood_d', seg=8, jit=0.06)
b.cone(0.26, 0.26, 0.08, (-1.5, 1.65, 0.85), 'wood', seg=8, jit=0.05)
b.lathe([(0.24, 0.42), (0.27, 0.48), (0.24, 0.54)], (-1.5, 1.65, 0), 'rope', seg=8, cap=False, jit=0.08)
b.done('pier_seg', smooth=0, shade=(0.72, 1.06), under=0.3)

# 건널 널(배 → 부두): 블렌더 -y 로 뻗는다. 배 쪽 끝 y=-1.95 · z=1.45, 부두 쪽 끝 y=-4.6 · z=0.1
b = B()
p0, p1 = Vector((0, -1.85, 1.45)), Vector((0, -4.65, 0.1))
d = p1 - p0
ang = math.atan2(-d.z, -d.y)
b.box((0.72, d.length, 0.07), tuple((p0 + p1) / 2), 'wood_l', rot=(-ang, 0, 0), jit=0.08)
for k in range(7):
    p = p0 + d * ((k + 0.5) / 7)
    b.box((0.7, 0.06, 0.05), (p.x, p.y, p.z + 0.06), 'wood_d', rot=(-ang, 0, 0), jit=0)
for s in (-1, 1):
    b.box((0.06, d.length, 0.06), (s * 0.36, (p0.y + p1.y) / 2, (p0.z + p1.z) / 2 + 0.03), 'wood_d', rot=(-ang, 0, 0), jit=0)
b.done('gangplank', smooth=0, shade=(0.8, 1.06), under=0.3)


# ═════ 송나라 정크선(길이 12): 넓은 고물 판 · 높은 고물 집 · 붉은 뱃전 띠 · 이물 눈 · 큰 키 · 돛대 둘 ═════
b = B()
L = 12.0
hw = lambda u: 2.1 * (1 - 0.18 * (1 - u) ** 3 - 0.45 * u ** 3)
zt = lambda u: 1.6 + 1.45 * (1 - u) ** 4 + 0.75 * u ** 3
zb = lambda u: -0.55 + 0.9 * u ** 3 + 0.5 * (1 - u) ** 3
hull(b, L, hw, zt, zb, band='red', upper='hull_s', lower='hull_sd', bottom='hull_sd', bandh=0.32)
wale(b, L, hw, lambda u: zt(u) - 0.55, 'black', r=0.06, k=0.985)
wale(b, L, hw, lambda u: 0.55 + 0.3 * u ** 3 + 0.2 * (1 - u) ** 3, 'black', r=0.05, k=0.95)
b.box((10.4, 3.5, 0.08), (0.4, 0, 1.38), 'wood_l', jit=0.06)
for x in (-1.6, 1.0, 3.2):
    b.box((0.08, 3.6, 0.1), (x, 0, 1.44), 'wood_d', jit=0)
# 고물 집: 두 칸 · 창 · 붉은 기둥 · 휜 지붕
b.box((2.6, 3.0, 1.5), (-4.5, 0, 2.15), 'wood', jit=0.05)
for y in (-1.5, 1.5):
    for x in (-5.7, -4.5, -3.3):
        b.box((0.14, 0.14, 1.55), (x, y, 2.15), 'red', jit=0.02)
lattice(b, -4.5, -1.53, 2.3, 1.4, 0.7, frame='red_d')
lattice(b, -4.5, 1.53, 2.3, 1.4, 0.7, frame='red_d')
b.grid(6, 4, lambda u, v: (-4.5 + (u - 0.5) * 3.4, (v - 0.5) * 3.8, 3.05 + 0.5 * (1 - abs(2 * v - 1) ** 1.3) + 0.25 * abs(2 * u - 1) ** 3), 'wood_d', jit=0.05)
b.box((3.5, 0.2, 0.16), (-4.5, 0, 3.6), 'red_d', jit=0)
for y in (-1.75, 1.75):
    beam(b, (-6.0, y * 0.9, 3.1), (-3.2, y * 0.95, 2.0), 0.04, 'red', seg=4)
# 고물 판 장식 · 키
b.box((0.06, 2.4, 1.0), (-6.04, 0, 2.3), 'red', jit=0.03)
disc_y(b, 0.32, (-6.08, 0, 2.3), 'gold', 1, seg=10, rot=(0, math.pi / 2, 0))
b.box((0.12, 1.0, 2.6), (-6.3, 0, 0.9), 'wood_d', jit=0.04)
b.box((0.1, 0.1, 1.6), (-6.2, 0, 2.6), 'wood_d', jit=0)
# 이물 눈(용의 눈)
for s in (-1, 1):
    y = s * (hw(0.86) + 0.02)
    disc_y(b, 0.34, (4.3, y, 1.75), 'white', s, seg=12)
    disc_y(b, 0.17, (4.3, y + s * 0.02, 1.75), 'black', s, seg=10)
b.box((0.1, 2.2, 0.9), (6.02, 0, 1.95), 'red', jit=0.03)
# 닻(나무 닻에 돌 막대) · 감개
beam(b, (5.7, 0.9, 2.3), (6.4, 1.0, 0.6), 0.07, 'wood_d', seg=5)
b.box((0.2, 0.9, 0.18), (6.4, 1.0, 0.6), 'stone_d', jit=0.05)
b.cone(0.18, 0.18, 1.6, (5.2, 0, 1.75), 'wood', seg=8, rot=(math.pi / 2, 0, 0), jit=0.05)
mast(b, 0.6, 1.4, 7.9, r=0.15)
mast(b, 4.3, 1.4, 5.4, r=0.11, rake=0.5)
for s in (-1, 1):
    beam(b, (0.6, 0, 9.2), (0.0, s * 1.9, 1.7), 0.02, 'rope', seg=3)
    beam(b, (4.8, 0, 6.7), (4.4, s * 1.6, 1.8), 0.018, 'rope', seg=3)
beam(b, (0.6, 0, 9.2), (5.9, 0, 2.2), 0.02, 'rope', seg=3)
for x, y, sz, m in [(-1.0, 0.8, 0.6, 'wood'), (-1.6, -0.6, 0.5, 'straw'), (2.0, 0.9, 0.55, 'wood_l'), (2.4, -0.8, 0.5, 'silk_r')]:
    b.box((sz * 1.3, sz, sz), (x, y, 1.42 + sz / 2), m, bevel=0.04, jit=0.06)
b.done('ship_song', smooth=0, shade=(0.86, 1.08), under=0.2)

b = B()
lug_sail(b, -2.4, 1.5, 2.2, 6.5, 7.3, 7, 'sail_s', 'sail_sd', yaw=0.12, cx=0.6)
lug_sail(b, 3.0, 5.2, 2.5, 5.6, 6.2, 5, 'sail_s', 'sail_sd', yaw=0.12, cx=4.6, billow=0.16)
b.done('sail_song', origin=(0, 0, 2.2), smooth=0, shade=(0.86, 1.06), under=0.1)


# ═════ 왜선(길이 10.5): 밝은 삼나무 · 검은 띠 · 가운데 지붕 집 · 짚 돗자리 네모 돛 · 노 · 고물 키 노 ═════
b = B()
L = 10.5
hw = lambda u: 1.7 * (1 - 0.2 * (1 - u) ** 2 - 0.62 * u ** 2.2)
zt = lambda u: 1.45 + 0.45 * (1 - u) ** 3 + 1.1 * u ** 3
zb = lambda u: -0.5 + 1.0 * u ** 2.5 + 0.2 * (1 - u) ** 3
hull(b, L, hw, zt, zb, band='black', upper='cedar', lower='cedar_d', bottom='cedar_d', inner='cedar_d', bandh=0.22, rim='black')
wale(b, L, hw, lambda u: zt(u) - 0.5, 'cedar_d', r=0.06, k=0.99)
b.box((9.0, 2.8, 0.08), (0.0, 0, 1.3), 'cedar', jit=0.06)
# 가운데 집: 기둥 · 흰 휘장 · 붉은 띠 · 노송나무 껍질 맞배지붕
b.box((3.2, 2.4, 0.08), (-1.9, 0, 2.9), 'cedar_d', jit=0)
for x in (-3.4, -1.9, -0.4):
    for y in (-1.15, 1.15):
        b.box((0.12, 0.12, 1.6), (x, y, 2.1), 'black', jit=0)
for y in (-1.17, 1.17):
    b.grid(6, 1, lambda u, v, y=y: (-3.4 + 3.0 * u, y + 0.04 * math.sin(u * 18), 2.85 - 0.9 * v), 'white', jit=0.04)
    b.box((3.0, 0.05, 0.14), (-1.9, y * 1.01, 2.8), 'red', jit=0)
b.prism([(-1.55, 0), (1.55, 0), (0, 0.85)], 3.8, (-1.9, 0, 2.95), 'bark', rot=(0, 0, math.pi / 2), jit=0.06)
b.box((3.9, 0.16, 0.12), (-1.9, 0, 3.82), 'black', jit=0)
# 고물 판 · 키 노 · 이물 꼭지
b.box((0.5, 0.18, 1.6), (-5.4, -0.9, 1.0), 'cedar_d', rot=(0.0, 0.5, 0), jit=0.04)
beam(b, (-4.6, -0.9, 2.2), (-5.9, -1.0, -0.4), 0.07, 'wood_d', seg=5)
b.box((0.4, 0.16, 1.0), (-5.95, -1.0, -0.3), 'wood_d', jit=0.03)
beam(b, (5.0, 0, 2.6), (5.7, 0, 3.3), 0.09, 'black', seg=5)
# 노(양 뱃전에 셋씩, 올려 둠)
for s in (-1, 1):
    for x in (0.8, 2.0, 3.2):
        beam(b, (x, s * 1.2, 1.7), (x - 0.6, s * 2.9, 0.5), 0.035, 'wood_l', seg=4)
        b.box((0.07, 0.24, 0.5), (x - 0.62, s * 2.95, 0.42), 'wood_l', rot=(s * 0.6, 0, 0), jit=0)
mast(b, 1.3, 1.35, 7.4, r=0.13, m='black')
for s in (-1, 1):
    beam(b, (1.3, 0, 8.6), (0.6, s * 1.5, 1.6), 0.02, 'rope', seg=3)
beam(b, (1.3, 0, 8.6), (5.1, 0, 2.6), 0.02, 'rope', seg=3)
for x, y, sz in [(2.6, 0.5, 0.5), (3.2, -0.5, 0.45), (3.8, 0.3, 0.4)]:
    b.box((sz * 1.2, sz, sz), (x, y, 1.34 + sz / 2), 'straw', bevel=0.05, jit=0.08)
b.done('ship_wae', smooth=0, shade=(0.86, 1.08), under=0.2)

b = B()
square_sail(b, 1.3, 3.6, 2.3, 4.6, 'mat', 'mat_d', strips=9, yard='black', yaw=-0.95, billow=0.35)
b.done('sail_wae', origin=(0, 0, 2.3), smooth=0, shade=(0.86, 1.06), under=0.1)


# ═════ 아라비아 다우선(길이 11.5): 뾰족한 두 끝 · 앞으로 뻗은 이물 대 · 높은 고물 · 흰 석회 바른 밑 · 앞으로 기운 돛대 · 세모 돛 ═════
b = B()
L = 11.5
hw = lambda u: 1.85 * max(0.0, math.sin(math.pi * (0.07 + 0.93 * u))) ** 0.55
zt = lambda u: 1.35 + 0.95 * u ** 3 + 1.25 * (1 - u) ** 3
zb = lambda u: -0.5 + 0.9 * u ** 4 + 0.45 * (1 - u) ** 4
hull(b, L, hw, zt, zb, band='teak_d', upper='teak', lower='lime', bottom='lime', inner='teak_d', midk=0.42, bandh=0.25)
wale(b, L, hw, lambda u: zt(u) - 0.45, 'teak_d', r=0.05, k=0.99)
b.box((8.8, 2.6, 0.08), (0.2, 0, 1.25), 'teak', jit=0.06)
# 이물 대 · 고물 다락 · 난간 · 키
beam(b, (5.6, 0, 0.6), (7.0, 0, 2.9), 0.13, 'teak_d', seg=6)
b.ball(0.16, (7.05, 0, 3.0), 'teak_d', sub=1)
b.box((2.4, 2.0, 0.1), (-4.4, 0, 2.3), 'teak', jit=0.05)
for x in (-5.4, -4.8, -4.2, -3.6):
    for y in (-0.95, 0.95):
        b.box((0.07, 0.07, 0.5), (x, y, 2.6), 'teak_d', jit=0)
for y in (-0.95, 0.95):
    b.box((2.2, 0.08, 0.07), (-4.5, y, 2.85), 'teak_d', jit=0)
b.box((0.06, 1.4, 0.8), (-5.72, 0, 2.2), 'teak_d', jit=0.03)
for k in range(3):
    disc_y(b, 0.12, (-5.76, -0.45 + k * 0.45, 2.25), 'lime', 1, seg=8, rot=(0, math.pi / 2, 0))
b.box((0.12, 0.8, 2.4), (-6.0, 0, 0.7), 'teak_d', rot=(0, 0.12, 0), jit=0.04)
beam(b, (-6.0, 0, 1.9), (-4.9, 0, 2.6), 0.05, 'teak_d', seg=4)
mast(b, 1.2, 1.3, 7.2, r=0.15, m='teak_d', rake=0.7)
for s in (-1, 1):
    beam(b, (1.9, 0, 8.4), (0.4, s * 1.6, 1.4), 0.02, 'rope', seg=3)
beam(b, (1.9, 0, 8.4), (-3.6, 0, 2.4), 0.02, 'rope', seg=3)
for x, y, r, m in [(-1.4, 0.5, 0.36, 'cotton_d'), (-0.8, -0.5, 0.32, 'spice'), (2.8, 0.4, 0.34, 'cotton_d'), (3.3, -0.4, 0.3, 'teak_d')]:
    b.ball(r, (x, y, 1.28 + r * 0.75), m, sub=1, scale=(1.3, 1, 0.8), jit=0.06)
b.box((0.8, 0.5, 0.45), (-2.4, 0, 1.52), 'teak_d', bevel=0.04, jit=0.04)
b.box((0.84, 0.54, 0.06), (-2.4, 0, 1.76), 'gold', jit=0)
b.done('ship_arab', smooth=0, shade=(0.86, 1.08), under=0.2)

b = B()
tack, peak, clew = Vector((5.9, 0.0, 2.2)), Vector((-4.4, 0.0, 9.0)), Vector((-2.4, 0.0, 2.6))


def lat(u, v):
    f = tack + (clew - tack) * u
    y = tack + (peak - tack) * u
    p = f + (y - f) * v
    return (p.x, p.y - 0.35 * math.sin(math.pi * v) * math.sin(math.pi * u) - 0.2, p.z)
n = 8
for k in range(n):
    a, c = k / n, (k + 1) / n
    b.grid(1, 4, lambda u, v, a=a, c=c: lat(a + (c - a) * u, v), 'cotton' if k % 2 else 'cotton_d', jit=0.05)
beam(b, (6.4, -0.25, 1.85), (-4.9, -0.25, 9.4), 0.08, 'teak_d', seg=5)
beam(b, (tack.x, -0.22, tack.z), (clew.x, -0.22, clew.z), 0.025, 'rope', seg=3)
b.done('sail_arab', origin=(0, 0, 2.2), smooth=0, shade=(0.86, 1.06), under=0.1)


# ═════ 고려 배(내 배, 길이 11.5): 평평한 밑 · 넓은 이물 판(가로 널) · 나무못 · 짐 칸(갑판 1.38) · 돛대 둘 · 무명 돛에 대나무 살 ═════
b = B()
L = 11.5
hw = lambda u: 2.05 * (1 - 0.2 * (1 - u) ** 2 - 0.32 * u ** 3)
zt = lambda u: 1.72 + 0.55 * (1 - u) ** 3 + 0.8 * u ** 3
zb = lambda u: -0.45 + 0.35 * u ** 2
hull(b, L, hw, zt, zb, band='pine_d', upper='pine', lower='pine_d', bottom='pine_d', inner='pine_d', midk=0.5, bandh=0.22)
for s in (-1, 1):
    for z in (0.75, 1.3):
        for i in range(14):
            u = 0.06 + i * 0.065
            b.box((0.08, 0.05, 0.08), ((u - 0.5) * L, s * (hw(u) * (0.97 if z < 1 else 0.995) + 0.02), z), 'peg', jit=0)
wale(b, L, hw, lambda u: 1.05, 'pine_d', r=0.05, k=0.965)
for k in range(5):
    b.box((0.05, 2.6 - k * 0.12, 0.05), (L / 2 + 0.02, 0, 0.6 + k * 0.38), 'pine_d', jit=0)
b.box((10.0, 3.3, 0.08), (0.0, 0, 1.34), 'wood_l', jit=0.06)
for x in (-3.6, 3.6):
    b.box((0.12, 3.5, 0.18), (x, 0, 1.42), 'pine_d', jit=0)
# 고물 뜸집(초가 지붕) · 키 · 닻 · 감개
b.box((1.4, 2.4, 1.1), (-4.6, 0, 1.95), 'pine', jit=0.05)
b.prism([(-1.45, 0), (1.45, 0), (0, 0.7)], 1.8, (-4.6, 0, 2.5), 'straw', rot=(0, 0, math.pi / 2), jit=0.08)
b.box((0.14, 0.9, 3.2), (-5.95, 0, 0.6), 'pine_d', rot=(0, 0.25, 0), jit=0.04)
beam(b, (-5.6, 0, 2.3), (-4.4, 0, 2.9), 0.06, 'pine_d', seg=4)
b.cone(0.2, 0.2, 2.0, (4.9, 0, 1.75), 'wood', seg=8, rot=(math.pi / 2, 0, 0), jit=0.05)
beam(b, (5.4, -1.2, 2.2), (6.0, -1.3, 0.3), 0.08, 'wood_d', seg=5)
beam(b, (5.6, -1.6, 0.5), (6.4, -1.0, 0.5), 0.06, 'wood_d', seg=5)
mast(b, 0.75, 1.38, 9.0, r=0.14, m='pine_d')
mast(b, 4.4, 1.38, 6.2, r=0.11, m='pine_d', rake=0.3)
for s in (-1, 1):
    beam(b, (0.75, 0, 10.3), (-0.3, s * 2.0, 1.8), 0.02, 'rope', seg=3)
beam(b, (0.75, 0, 10.3), (5.7, 0, 2.6), 0.02, 'rope', seg=3)
beam(b, (0.75, 0, 10.3), (-5.2, 0, 2.6), 0.02, 'rope', seg=3)
b.done('ship_goryeo', smooth=0, shade=(0.86, 1.08), under=0.2)

b = B()
lug_sail(b, -1.3, 2.6, 4.1, 8.3, 8.3, 6, 'sail_k', 'sail_kd', batten='bamboo', yaw=0.1, cx=0.75, billow=0.25)
lug_sail(b, 3.4, 5.6, 3.6, 6.6, 6.6, 4, 'sail_k', 'sail_kd', batten='bamboo', yaw=0.1, cx=4.6, billow=0.18)
b.done('sail_goryeo', origin=(0, 0, 4.1), smooth=0, shade=(0.86, 1.06), under=0.1)


# ═════ 창고(19 x 6, 앞 = 블렌더 +y = 북쪽 길): 돌 기단 · 기둥 아홉 · 아래 널벽 · 위 흰 벽 · 문 넷(물건 더미와 마주) · 살창 · 맞배 기와지붕 ═════
b = B()
b.box((19.4, 6.4, 0.42), (0, 0, 0.21), 'stone', bevel=0.04, jit=0.06)
b.box((19.0, 6.0, 0.06), (0, 0, 0.45), 'stone_l', jit=0.04)
DOORS = [-6.5, -2.0, 2.5, 7.0]
for i in range(9):
    x = -9.4 + i * 18.8 / 8
    for y in (-2.9, 2.9):
        b.box((0.3, 0.3, 3.0), (x, y, 1.95), 'wood', jit=0.04)
for s in (-1, 1):
    b.box((0.3, 5.8, 3.0), (s * 9.4, 0, 1.95), 'plaster', jit=0.03)
    b.box((0.34, 5.8, 1.1), (s * 9.42, 0, 1.0), 'wood_d', jit=0.06)
for y in (-2.9, 2.9):
    b.box((19.0, 0.36, 0.3), (0, y, 3.35), 'wood_d', jit=0.03)
    b.box((18.8, 0.2, 3.0), (0, y * 0.985, 1.95), 'plaster', jit=0.03)
    b.box((18.8, 0.24, 1.1), (0, y * 0.995, 1.0), 'wood_d', jit=0.06)
    for i in range(8):
        x = -9.4 + (i + 0.5) * 18.8 / 8
        if y > 0 and any(abs(x - dx) < 1.2 for dx in DOORS):
            continue
        lattice(b, x, y * 1.02, 2.85, 1.0, 0.55, frame='wood_d')
for dx in DOORS:
    b.box((1.9, 0.1, 2.35), (dx, 2.98, 1.62), 'void', jit=0)
    b.box((2.2, 0.32, 0.22), (dx, 3.0, 2.86), 'wood_d', jit=0.02)
    for s in (-1, 1):
        b.box((0.16, 0.3, 2.5), (dx + s * 1.02, 3.0, 1.7), 'wood_d', jit=0.02)
        b.box((0.92, 0.08, 2.3), (dx + s * 1.58, 3.12, 1.62), 'wood', jit=0.06)
        for z in (0.9, 2.3):
            b.box((0.88, 0.1, 0.06), (dx + s * 1.58, 3.17, z), 'black', jit=0)
    b.box((1.9, 0.6, 0.12), (dx, 3.1, 0.5), 'stone_l', jit=0.04)
    for k, (sx, sy) in enumerate([(-0.45, 2.4), (0.35, 2.3), (0.0, 2.0)]):
        b.ball(0.38, (dx + sx, sy, 0.75 + (0.3 if k == 2 else 0)), 'straw_d', sub=1, scale=(1.2, 0.9, 0.8), jit=0.08)
b.box((2.0, 0.1, 0.6), (0.25, 3.1, 3.05), 'wood_d', jit=0)
b.box((1.7, 0.12, 0.42), (0.25, 3.12, 3.05), 'blue', jit=0)
tile_roof(b, 19.0, 6.0, 3.45, 2.1, over=0.75, lift=0.5, nx=16, gable='plaster')
b.done('storehouse', smooth=0, shade=(0.74, 1.08), under=0.28)


# ═════ 물건 더미(너비 ~1.9, 앞 = 블렌더 +y = 북쪽): 짚자리 위에 ═════
def mat_base(b, w=2.0, d=1.1):
    b.box((w, d, 0.05), (0, 0, 0.025), 'straw', jit=0.08)
    for k in range(4):
        b.box((w, 0.03, 0.055), (0, -d / 2 + d * (k + 0.5) / 4, 0.03), 'straw_d', jit=0)


# 인삼: 나무 상자에 묶은 뿌리 · 둥근 바구니 둘(뿌리 더미 · 잎과 붉은 열매)
b = B()
mat_base(b)
rr = random.Random(3)
b.box((0.95, 0.6, 0.42), (-0.4, -0.15, 0.26), 'wood', bevel=0.03, jit=0.06)
b.box((0.85, 0.5, 0.04), (-0.4, -0.15, 0.47), 'wood_d', jit=0)
for i in range(6):
    x = -0.75 + i * 0.13
    b.cone(0.055, 0.012, 0.42, (x, -0.15 + (rr.random() - 0.5) * 0.12, 0.53), 'gins', seg=5, rot=(math.pi / 2 + (rr.random() - 0.5) * 0.3, 0, (rr.random() - 0.5) * 0.4), jit=0.1)
b.box((0.8, 0.06, 0.07), (-0.4, -0.15, 0.56), 'berry', jit=0)
for k, (x, y) in enumerate([(0.5, 0.1), (0.2, 0.5)]):
    b.lathe([(0.26, 0.05), (0.36, 0.12), (0.4, 0.3), (0.42, 0.34)], (x, y, 0), 'straw_d', seg=10, cap=True, jit=0.08)
    for j in range(7):
        a = j * 0.9 + k
        b.cone(0.06, 0.015, 0.36, (x + math.cos(a) * 0.17, y + math.sin(a) * 0.17, 0.42), 'gins', seg=5, rot=(math.pi / 2, 0, a + 1.4), jit=0.1)
    b.ball(0.2, (x, y, 0.38), 'gins_d', sub=1, scale=(1.4, 1.4, 0.5), jit=0.1)
    if k == 1:
        for j in range(3):
            a = j * 2.1
            b.cone(0.012, 0.012, 0.3, (x + math.cos(a) * 0.08, y + math.sin(a) * 0.08, 0.55), 'leaf', seg=3, jit=0)
            b.cone(0.13, 0.0, 0.05, (x + math.cos(a) * 0.15, y + math.sin(a) * 0.15, 0.7), 'leaf', seg=5, jit=0.1)
        b.ball(0.05, (x, y, 0.74), 'berry', sub=1)
b.done('pile_ginseng', smooth=0, shade=(0.76, 1.08), under=0.25)

# 종이: 깔판 위 한지 묶음 셋(켜켜이) · 짚 끈 · 말아 둔 두루마리
b = B()
mat_base(b)
b.box((1.8, 0.9, 0.1), (0, 0, 0.1), 'wood_l', jit=0.06)
rr = random.Random(5)
for i, (x, n) in enumerate([(-0.55, 6), (0.05, 8), (0.62, 5)]):
    for k in range(n):
        b.box((0.52, 0.66, 0.065), (x + (rr.random() - 0.5) * 0.03, (rr.random() - 0.5) * 0.03, 0.18 + k * 0.066), 'paper' if k % 2 else 'paper_d', jit=0.03)
    b.box((0.06, 0.7, 0.07 * n + 0.04), (x, 0, 0.15 + 0.033 * n), 'straw_d', jit=0)
for k in range(3):
    b.cone(0.07, 0.07, 0.7, (-0.3 + k * 0.17, 0.62, 0.22 + (0.12 if k == 1 else 0)), 'paper', seg=8, rot=(0, math.pi / 2, 0), jit=0.03)
b.done('pile_paper', smooth=0, shade=(0.82, 1.06), under=0.2)

# 먹: 낮은 나무 시렁에 먹 막대를 엇갈려 쌓음 · 먹 상자 · 벼루
b = B()
mat_base(b)
b.box((1.4, 0.8, 0.08), (-0.2, 0, 0.32), 'wood', jit=0.05)
for x in (-0.8, 0.4):
    for y in (-0.33, 0.33):
        b.box((0.08, 0.08, 0.32), (x, y, 0.16), 'wood_d', jit=0)
for st, cx in enumerate([-0.55, 0.15]):
    for layer in range(4):
        for k in range(4):
            if layer % 2 == 0:
                b.box((0.5, 0.1, 0.07), (cx, -0.18 + k * 0.12, 0.4 + layer * 0.075), 'ink' if k % 2 else 'ink_l', jit=0.04)
            else:
                b.box((0.1, 0.5, 0.07), (cx - 0.18 + k * 0.12, 0, 0.4 + layer * 0.075), 'ink' if k % 2 else 'ink_l', jit=0.04)
b.box((0.5, 0.36, 0.22), (0.68, 0.15, 0.16), 'wood_l', bevel=0.02, jit=0.05)
b.box((0.52, 0.38, 0.04), (0.68, 0.15, 0.29), 'wood_d', jit=0)
b.box((0.36, 0.26, 0.07), (0.62, -0.32, 0.08), 'stone_d', bevel=0.02, jit=0.05)
b.done('pile_ink', smooth=0, shade=(0.8, 1.08), under=0.2)

# 나전칠기: 검은 옻칠 상자를 쌓고 앞면에 자개 무늬 · 붉은 쟁반 · 금빛 장식
b = B()
mat_base(b)
for (x, y, w, d, h, z0, m) in [(-0.45, 0, 0.8, 0.6, 0.36, 0.05, 'lacq'), (-0.45, 0, 0.66, 0.5, 0.28, 0.41, 'lacq'), (0.42, 0.05, 0.7, 0.55, 0.42, 0.05, 'lacq'), (0.42, 0.05, 0.5, 0.4, 0.2, 0.47, 'lacq_r')]:
    b.box((w, d, h), (x, y, z0 + h / 2), m, bevel=0.02, jit=0.04)
    b.box((w + 0.02, d + 0.02, 0.03), (x, y, z0 + h - 0.06), 'gold', jit=0)
    yf = y + d / 2 + 0.006
    for k in range(3):
        cx = x - w * 0.3 + k * w * 0.3
        quad(b, 'pearl' if k != 1 else 'pearl_b', [(cx - 0.05, yf, z0 + h * 0.3), (cx + 0.05, yf, z0 + h * 0.3), (cx + 0.05, yf, z0 + h * 0.62), (cx - 0.05, yf, z0 + h * 0.62)][::-1], jit=0.02)
        quad(b, 'pearl', [(cx - 0.09, yf, z0 + h * 0.42), (cx + 0.09, yf, z0 + h * 0.42), (cx + 0.09, yf, z0 + h * 0.5), (cx - 0.09, yf, z0 + h * 0.5)][::-1], jit=0.02)
b.lathe([(0.2, 0.05), (0.26, 0.08), (0.27, 0.11)], (0.0, 0.62, 0), 'lacq_r', seg=12, jit=0.03)
b.done('pile_najeon', smooth=0, shade=(0.8, 1.08), under=0.2)


# ═════ 은병(은 10닢 값 — 고려의 은 화폐, 병 모양): 낮은 탁자 · 붉은 보 · 은병 ═════
def silver_bottle(b, x, y, z, k=1.0):
    b.lathe([(0.16 * k, z), (0.3 * k, z + 0.1 * k), (0.42 * k, z + 0.36 * k), (0.4 * k, z + 0.56 * k), (0.24 * k, z + 0.76 * k), (0.12 * k, z + 0.86 * k), (0.11 * k, z + 1.0 * k), (0.18 * k, z + 1.1 * k), (0.16 * k, z + 1.14 * k)], (x, y, 0), 'silver', seg=12, jit=0.03)
    b.lathe([(0.425 * k, z + 0.34 * k), (0.43 * k, z + 0.4 * k)], (x, y, 0), 'silver_d', seg=12, cap=False, jit=0)


b = B()
b.box((1.0, 0.8, 0.1), (0, 0, 0.45), 'wood', bevel=0.02, jit=0.05)
for x in (-0.42, 0.42):
    for y in (-0.32, 0.32):
        b.box((0.08, 0.08, 0.4), (x, y, 0.2), 'wood_d', jit=0)
b.box((0.8, 0.64, 0.03), (0, 0, 0.51), 'red', jit=0.02)
silver_bottle(b, 0, 0, 0.52)
b.done('eunbyeong', smooth=30, shade=(0.8, 1.08), under=0.2)

b = B()
silver_bottle(b, 0, 0, 0.0, 0.5)
b.done('carry_bottle', smooth=30, shade=(0.84, 1.08), under=0.15)

b = B()
b.lathe([(0.1, 0), (0.14, 0.04), (0.24, 0.24), (0.26, 0.34), (0.2, 0.46), (0.07, 0.54), (0.06, 0.6), (0.1, 0.64)], (0, 0, 0), 'cel', seg=12, jit=0.03)
for k in range(5):
    a = k * 1.256
    b.ball(0.025, (math.cos(a) * 0.255, math.sin(a) * 0.255, 0.3), 'inlay_w', sub=1)
b.done('carry_cel', smooth=30, shade=(0.84, 1.08), under=0.15)

# 짐(실은 물건 · 든 물건): 천으로 싼 짐에 새끼줄 — tint_cargo 를 흰색으로 두고 장면에서 재질 빛을 곱한다
b = B()
b.box((1.1, 1.1, 0.8), (0, 0, 0.42), 'tint_cargo', bevel=0.12, bseg=2, jit=0.05)
b.ball(0.16, (0, 0, 0.86), 'tint_cargo', sub=1, scale=(1.2, 1.2, 0.8), jit=0.05)
for s in (0, 1):
    b.box((1.14 if s == 0 else 0.06, 0.06 if s == 0 else 1.14, 0.84), (0, 0, 0.42), 'rope_d', jit=0)
b.done('cargo', origin=(0, 0, 0), smooth=0, shade=(0.8, 1.06), under=0.25)


# ═════ 저울: 받침(탁자 · 기둥 · 꼭지 높이 1.8) · 저울대(가운데 원점) · 접시(가운데 원점, 끈 셋) ═════
b = B()
b.box((1.6, 1.2, 0.1), (0, 0, 0.75), 'wood', bevel=0.03, jit=0.05)
for x in (-0.7, 0.7):
    for y in (-0.5, 0.5):
        b.box((0.1, 0.1, 0.7), (x, y, 0.35), 'wood_d', jit=0)
b.box((1.4, 1.0, 0.05), (0, 0, 0.18), 'wood_d', jit=0.04)
b.box((0.3, 0.3, 0.1), (0, 0, 0.85), 'bronze_d', jit=0)
b.cone(0.05, 0.04, 1.0, (0, 0, 1.3), 'bronze_d', seg=6)
b.box((0.1, 0.16, 0.12), (0, 0, 1.8), 'bronze', jit=0)
for k in range(4):
    b.cone(0.07, 0.07, 0.03, (0.45 + (k % 2) * 0.05, -0.25, 0.82 + k * 0.03), 'silver', seg=8)
b.box((0.36, 0.24, 0.14), (-0.45, -0.2, 0.87), 'wood_l', bevel=0.02, jit=0.05)
b.done('scale_base', smooth=0, shade=(0.78, 1.08), under=0.2)
b = B()
b.box((1.42, 0.06, 0.06), (0, 0, 0), 'bronze', jit=0.02)
for s in (-1, 1):
    b.ball(0.05, (s * 0.71, 0, 0), 'bronze_d', sub=1)
b.cone(0.0, 0.06, 0.18, (0, 0, 0.12), 'bronze_d', seg=4)
b.done('scale_beam', smooth=0, shade=(0.9, 1.06), under=0.1)
b = B()
b.lathe([(0.0, -0.03), (0.22, -0.02), (0.3, 0.03), (0.31, 0.05)], (0, 0, 0), 'bronze', seg=12, jit=0.03)
for k in range(3):
    a = k * 2.094
    beam(b, (math.cos(a) * 0.27, math.sin(a) * 0.27, 0.04), (0, 0, 0.3), 0.008, 'rope_d', seg=3)
b.done('scale_pan', smooth=0, shade=(0.9, 1.06), under=0.1)


# ═════ 가게(4 x 2.5, 가운데 원점): 판매대 · 기둥 넷 · 천 차양 · 물건 ═════
def stall_frame(b, awn, awn2):
    b.box((3.9, 2.3, 0.1), (0, 0, 0.82), 'wood', bevel=0.02, jit=0.05)
    for y in (-1.1, 1.1):
        b.box((3.9, 0.06, 0.6), (0, y, 0.48), 'wood_d', jit=0.06)
    for s in (-1, 1):
        b.box((0.06, 2.2, 0.6), (s * 1.92, 0, 0.48), 'wood_d', jit=0.06)
        for y in (-1.15, 1.15):
            b.cone(0.06, 0.06, 2.45, (s * 1.95, y, 1.22), 'wood_d', seg=5)
    for s in (-1, 1):
        def P(u, v, s=s):
            return ((u - 0.5) * 4.4, s * (1.45 * (1 - v)), 2.2 + 0.45 * v - 0.05 * math.sin(math.pi * u * 4) * (1 - v))
        for k in range(6):
            a, c = k / 6, (k + 1) / 6
            b.grid(2, 2, lambda u, v, a=a, c=c, s=s: P(a + (c - a) * u, v), awn if k % 2 else awn2, jit=0.05)
        for k in range(9):
            x = -2.2 + k * 0.55
            b.prism([(x, 0), (x + 0.55, 0), (x + 0.275, -0.18)], 0.02, (0, s * 1.45, 2.2), awn if k % 2 else awn2, jit=0.03)
    b.box((4.5, 0.08, 0.08), (0, 0, 2.66), 'wood_d', jit=0)


def maebyeong(b, x, y, z, k=1.0, m='cel', inlay=True):
    b.lathe([(0.1 * k, z), (0.12 * k, z + 0.04 * k), (0.15 * k, z + 0.3 * k), (0.24 * k, z + 0.5 * k), (0.25 * k, z + 0.58 * k), (0.16 * k, z + 0.7 * k), (0.06 * k, z + 0.74 * k), (0.07 * k, z + 0.8 * k)], (x, y, 0), m, seg=10, jit=0.03)
    if inlay:
        for j in range(4):
            a = j * 1.57 + 0.4
            b.ball(0.022 * k * 1.5, (x + math.cos(a) * 0.235 * k, y + math.sin(a) * 0.235 * k, z + 0.5 * k), 'inlay_w', sub=1)
            b.ball(0.016 * k * 1.5, (x + math.cos(a + 0.7) * 0.2 * k, y + math.sin(a + 0.7) * 0.2 * k, z + 0.34 * k), 'inlay_k', sub=1)


def bowl(b, x, y, z, r=0.18, m='cel'):
    b.lathe([(r * 0.35, z), (r * 0.5, z + r * 0.12), (r * 0.9, z + r * 0.45), (r, z + r * 0.6)], (x, y, 0), m, seg=10, cap=False, jit=0.03)
    b.cone(r * 0.35, r * 0.35, 0.01, (x, y, z), m, seg=10)


# 청자 가게: 매병 · 대접 · 주전자 · 향로 · 짚 상자 · 남색 차양
b = B()
stall_frame(b, 'awn_b', 'awn_w')
z = 0.87
for x, y, k in [(-1.3, 0.35, 1.0), (-0.75, -0.35, 0.85), (1.35, 0.3, 1.1)]:
    maebyeong(b, x, y, z, k)
for x, y in [(-0.1, 0.5), (0.35, 0.5), (0.12, 0.05), (0.6, -0.1)]:
    bowl(b, x, y, z, 0.17)
bowl(b, 0.12, 0.05, z + 0.1, 0.14, 'cel_l')
b.ball(0.17, (0.75, -0.6, z + 0.2), 'cel', sub=1, scale=(1, 1, 0.9), jit=0.03)
beam(b, (0.88, -0.6, z + 0.22), (1.06, -0.6, z + 0.38), 0.03, 'cel', seg=4)
b.lathe([(0.04, z + 0.33), (0.07, z + 0.4), (0.04, z + 0.42)], (0.75, -0.6, 0), 'cel_d', seg=8, jit=0)
b.lathe([(0.12, z), (0.16, z + 0.12), (0.17, z + 0.2)], (-0.15, -0.6, 0), 'cel_d', seg=10, jit=0.03)
b.ball(0.12, (-0.15, -0.6, z + 0.26), 'cel', sub=1, scale=(1, 1, 0.7))
for s in (-1, 1):
    b.box((0.7, 0.6, 0.5), (s * 2.35, 0.6, 0.25), 'wood_l', bevel=0.02, jit=0.06)
    b.ball(0.3, (s * 2.35, 0.6, 0.5), 'straw', sub=1, scale=(1.1, 0.9, 0.4), jit=0.1)
b.done('stall_cel', smooth=0, shade=(0.78, 1.08), under=0.22)

# 비단 가게: 층층 시렁에 말아 둔 비단 · 개어 둔 비단 · 차양에 걸린 비단 띠
b = B()
stall_frame(b, 'awn_r', 'awn_w')
z = 0.87
b.box((3.2, 0.5, 0.3), (0, -0.55, z + 0.15), 'wood_l', jit=0.05)
cols = ['silk_r', 'silk_b', 'silk_y', 'silk_g', 'silk_p', 'silk_r', 'silk_b']
for k in range(7):
    b.cone(0.13, 0.13, 0.5, (-1.35 + k * 0.45, -0.55, z + 0.43), cols[k], seg=8, rot=(math.pi / 2, 0, 0), jit=0.03)
for k in range(5):
    b.cone(0.12, 0.12, 0.5, (-1.0 + k * 0.5, 0.1, z + 0.12), cols[(k + 2) % 7], seg=8, rot=(math.pi / 2, 0, 0), jit=0.03)
for k, (x, m) in enumerate([(-1.3, 'silk_y'), (1.25, 'silk_g')]):
    for j in range(4):
        b.box((0.5, 0.42, 0.05), (x, 0.6, z + 0.03 + j * 0.055), m if j % 2 else 'silk_r', jit=0.03)
for k, (x, m) in enumerate([(-1.6, 'silk_r'), (-0.6, 'silk_b'), (0.6, 'silk_y'), (1.6, 'silk_g')]):
    b.grid(1, 4, lambda u, v, x=x: (x - 0.18 + 0.36 * u, 1.3 + 0.03 * math.sin(v * 6), 2.15 - 1.0 * v), m, jit=0.03)
b.done('stall_silk', smooth=0, shade=(0.78, 1.08), under=0.22)

# 약재 · 차 · 향료 가게: 약초 바구니 · 덩이차 쌓음 · 향료 단지 · 자루 · 초록 차양
b = B()
stall_frame(b, 'awn_g', 'awn_w')
z = 0.87
for x, y, m in [(-1.25, 0.3, 'herb'), (-0.55, 0.45, 'herb_d'), (-1.0, -0.45, 'spice')]:
    b.lathe([(0.22, z), (0.3, z + 0.06), (0.32, z + 0.16)], (x, y, 0), 'straw_d', seg=10, jit=0.06)
    b.ball(0.27, (x, y, z + 0.15), m, sub=1, scale=(1, 1, 0.35), jit=0.12)
for k in range(3):
    for j in range(3 - k):
        b.cone(0.16, 0.16, 0.08, (0.2 + j * 0.34 + k * 0.17, -0.35, z + 0.04 + k * 0.085), 'tea', seg=10, jit=0.06)
for x, y, h, m in [(1.0, 0.45, 0.42, 'spice_r'), (1.42, 0.3, 0.34, 'spice'), (1.25, -0.4, 0.38, 'clay_d')]:
    b.lathe([(0.1, z), (0.16, z + h * 0.4), (0.13, z + h * 0.85), (0.08, z + h), (0.1, z + h + 0.04)], (x, y, 0), m, seg=8, jit=0.04)
for s in (-1, 1):
    b.ball(0.32, (s * 2.35, 0.55, 0.3), 'straw_d', sub=1, scale=(1, 0.8, 0.95), jit=0.08)
    b.cone(0.1, 0.06, 0.18, (s * 2.35, 0.55, 0.64), 'rope_d', seg=6)
b.done('stall_herb', smooth=0, shade=(0.78, 1.08), under=0.22)


# ═════ 청자 가마(8 x 4.5, 앞 = 블렌더 +y = 북쪽): 돌 받침 · 흙 둥근 굴 네 칸(오름가마) · 불창 · 가운데 아궁이(빛남) · 연기 구멍 ═════
b = B()
b.box((8.4, 4.9, 0.3), (0, 0, 0.15), 'stone', bevel=0.05, jit=0.07)
RS = [1.95, 2.02, 2.1, 2.18]
for i in range(4):
    x0 = -4.0 + i * 2.0
    R = RS[i]
    b.grid(4, 8, lambda u, v, x0=x0, R=R: (x0 + u * 2.0, math.cos(math.pi * v) * R * (1 - 0.03 * math.sin(math.pi * u)), 0.3 + math.sin(math.pi * v) * R * 1.08 * (1 + 0.06 * math.sin(math.pi * u))), 'clay', jit=0.1)
    b.grid(1, 8, lambda u, v, x0=x0, R=R: (x0 + 0.02, math.cos(math.pi * v) * (R + 0.06) * (1 - 0.2 * u), 0.3 + math.sin(math.pi * v) * (R + 0.06) * 1.08 * (1 - 0.2 * u)), 'clay_d', jit=0.05)
    sx = x0 + 1.0
    if abs(sx) > 0.5:
        b.box((0.36, 0.2, 0.42), (sx, R * 0.97, 0.75), 'soot', jit=0.05)
        b.box((0.24, 0.1, 0.28), (sx, R * 0.99 + 0.06, 0.72), 'void', jit=0)
b.grid(1, 8, lambda u, v: (4.0, math.cos(math.pi * v) * 2.18 * (1 - u), 0.3 + math.sin(math.pi * v) * 2.18 * 1.08 * (1 - u)), 'clay_d', jit=0.05)
b.grid(1, 8, lambda u, v: (-4.0, math.cos(math.pi * v) * 1.95 * u, 0.3 + math.sin(math.pi * v) * 1.95 * 1.08 * u), 'clay_d', jit=0.05)
b.box((1.9, 0.9, 1.6), (0, 2.05, 1.0), 'stone_d', bevel=0.06, jit=0.08)
b.prism([(-0.95, 0), (0.95, 0), (0.0, 0.45)], 0.9, (0, 2.05, 1.8), 'stone', rot=(0, 0, 0), jit=0.06)
b.box((1.0, 0.1, 0.95), (0, 2.52, 0.85), 'soot', jit=0)
b.cone(0.42, 0.42, 0.02, (0, 2.575, 0.85), 'glow_fire', seg=8, rot=(math.pi / 2, 0, 0))
for k, (x, z) in enumerate([(-0.75, 0.6), (0.75, 0.6), (-0.7, 1.25), (0.7, 1.25)]):
    b.ball(0.2, (x, 2.55, z), 'stone_l', sub=1, scale=(1, 0.7, 0.9), jit=0.08)
b.cone(0.42, 0.32, 1.0, (0, 0, 2.75), 'brick', seg=8, jit=0.06)
b.cone(0.36, 0.36, 0.06, (0, 0, 3.26), 'soot', seg=8, jit=0)
for x in (-3.0, -1.0, 1.0, 3.0):
    b.ball(0.12, (x, -0.3, 2.45 + (x + 4) * 0.02), 'soot', sub=1, scale=(1, 1, 0.4))
# 뒤쪽 장작 더미(서쪽 뒤)
for k in range(9):
    lay = k // 3
    b.cone(0.11, 0.11, 1.4, (-3.0 + (k % 3) * 0.25 + lay * 0.12, -2.65, 0.4 + lay * 0.21), 'wood' if k % 2 else 'wood_d', seg=6, rot=(0, math.pi / 2, 0), jit=0.08)
b.done('kiln', smooth=0, shade=(0.72, 1.1), under=0.3)

# 청자 시렁: 두 칸 시렁에 말리는 그릇 · 구운 매병
b = B()
for x in (-0.9, 0.9):
    for y in (-0.3, 0.3):
        b.box((0.07, 0.07, 1.4), (x, y, 0.7), 'wood_d', jit=0)
for z in (0.5, 1.1):
    b.box((1.9, 0.7, 0.05), (0, 0, z), 'wood_l', jit=0.06)
for k in range(4):
    bowl(b, -0.65 + k * 0.43, 0, 0.53, 0.15, 'clay_l' if k % 2 else 'cel')
for k in range(3):
    maebyeong(b, -0.55 + k * 0.55, 0, 1.13, 0.6, 'cel', inlay=(k != 1))
b.done('cel_shelf', smooth=0, shade=(0.78, 1.08), under=0.2)


# ═════ 물때 깃대(높이 6.3): 돌 받침 · 기둥 · 붉은 눈금 · 꼭지 / 깃발(1.4 x 0.9, 가운데 원점, 깃대 쪽 끝 x=-0.75) ═════
b = B()
b.cone(0.55, 0.45, 0.35, (0, 0, 0.175), 'stone', seg=8, jit=0.06)
b.cone(0.11, 0.09, 6.2, (0, 0, 3.3), 'wood_d', seg=6, jit=0.03)
for k in range(6):
    b.cone(0.125, 0.125, 0.16, (0, 0, 0.9 + k * 0.95), 'red' if k % 2 else 'white', seg=6, jit=0)
b.ball(0.16, (0, 0, 6.45), 'gold', sub=1)
b.done('tide_pole', smooth=0, shade=(0.78, 1.08), under=0.2)
b = B()
b.grid(6, 2, lambda u, v: (-0.7 + 1.4 * u, 0.08 * math.sin(u * 5.5) * u, -0.45 + 0.9 * v), 'flag_b', jit=0.03)
b.grid(6, 1, lambda u, v: (-0.7 + 1.4 * u, 0.08 * math.sin(u * 5.5) * u - 0.012, -0.08 + 0.16 * v), 'flag_w', jit=0)
b.cone(0.03, 0.03, 0.95, (-0.72, 0, 0), 'wood_d', seg=4)
b.done('tide_flag', smooth=0, shade=(0.88, 1.06), under=0.05)


# ═════ 부두 짐: 나무 상자 · 밧줄 사리 · 짚 짐 · 청자 상자 · 돌 닻 ═════
b = B()
b.box((0.9, 0.7, 0.62), (0, 0, 0.31), 'wood_l', bevel=0.03, jit=0.06)
for s in (-1, 1):
    b.box((0.94, 0.06, 0.08), (0, s * 0.355, 0.12), 'wood_d', jit=0); b.box((0.94, 0.06, 0.08), (0, s * 0.355, 0.5), 'wood_d', jit=0)
    b.box((0.08, 0.74, 0.66), (s * 0.43, 0, 0.31), 'wood_d', jit=0)
b.box((0.06, 0.74, 0.64), (0, 0, 0.31), 'rope', jit=0)
b.done('crate', smooth=0, shade=(0.78, 1.08), under=0.25)
b = B()
for k in range(4):
    b.lathe([(0.32 - k * 0.02, 0.0 + k * 0.07), (0.38 - k * 0.02, 0.035 + k * 0.07), (0.32 - k * 0.02, 0.07 + k * 0.07)], (0, 0, 0), 'rope' if k % 2 else 'rope_d', seg=10, cap=False, jit=0.06)
b.cone(0.2, 0.2, 0.02, (0, 0, 0.02), 'rope_d', seg=10)
b.done('rope_coil', smooth=0, shade=(0.8, 1.08), under=0.2)
b = B()
b.ball(0.5, (0, 0, 0.42), 'straw', sub=2, scale=(1.25, 0.8, 0.8), jit=0.08)
for x in (-0.3, 0.3):
    b.lathe([(0.44, 0.06), (0.47, 0.42), (0.44, 0.78)], (x, 0, 0), 'rope_d', seg=10, cap=False, rot=(0, 0, 0), scale=(0.25, 1, 1), jit=0)
b.done('bale', smooth=0, shade=(0.76, 1.08), under=0.25)
b = B()
b.box((0.9, 0.7, 0.5), (0, 0, 0.25), 'wood_l', bevel=0.03, jit=0.06)
b.ball(0.35, (0, 0, 0.48), 'straw', sub=1, scale=(1.2, 0.9, 0.35), jit=0.1)
for x, y in [(-0.22, -0.12), (0.2, 0.1)]:
    bowl(b, x, y, 0.55, 0.15)
maebyeong(b, 0.05, -0.15, 0.5, 0.55)
b.done('cel_crate', smooth=0, shade=(0.78, 1.08), under=0.25)
b = B()
b.box((0.5, 0.36, 1.3), (0, 0, 0.65), 'stone', bevel=0.06, rot=(0, 0.1, 0), jit=0.08)
b.box((0.14, 0.4, 0.14), (0, 0, 1.1), 'void', jit=0)
b.done('anchor_stone', smooth=0, shade=(0.78, 1.08), under=0.25)


# ═════ 벽란정(송나라 사신을 맞던 정자, 앞 = 블렌더 +y = 강): 두 단 돌 기단 · 붉은 기둥 · 난간 · 팔작지붕 ═════
b = B()
b.box((9.0, 6.0, 0.5), (0, 0, 0.25), 'stone', bevel=0.05, jit=0.06)
b.box((8.2, 5.2, 0.4), (0, 0, 0.7), 'stone_l', bevel=0.04, jit=0.05)
for k in range(3):
    b.box((2.0, 0.4, 0.3), (0, 3.0 + 0.35 * k, 0.75 - k * 0.3), 'stone', jit=0.05)
for x in (-3.6, -1.2, 1.2, 3.6):
    for y in (-2.2, 2.2):
        b.box((0.38, 0.38, 0.2), (x, y, 1.0), 'stone_d', jit=0.04)
        b.cone(0.18, 0.16, 3.0, (x, y, 2.6), 'red', seg=8, jit=0.03)
b.box((7.6, 4.8, 0.12), (0, 0, 1.18), 'wood_l', jit=0.05)
for y in (-2.2, 2.2):
    b.box((7.6, 0.3, 0.36), (0, y, 4.0), 'green', jit=0.03)
    for x in (-2.4, 0, 2.4):
        b.box((0.08, 0.08, 0.6), (x - 0.9, y, 1.5), 'red_d', jit=0); b.box((0.08, 0.08, 0.6), (x + 0.9, y, 1.5), 'red_d', jit=0)
    b.box((7.4, 0.1, 0.08), (0, y, 1.8), 'red_d', jit=0)
for s in (-1, 1):
    b.box((0.3, 4.6, 0.36), (s * 3.6, 0, 4.0), 'green', jit=0.03)
b.box((1.4, 0.1, 0.6), (0, 2.42, 3.6), 'wood_d', jit=0)
b.box((1.2, 0.12, 0.44), (0, 2.44, 3.6), 'blue', jit=0)
hip_roof(b, 7.6, 4.6, 4.2, 2.0, over=1.1, lift=0.7, nx=14, ns=6, nv=4)
b.done('byeokranjeong', smooth=0, shade=(0.76, 1.07), under=0.28)


# ═════ 먼 언덕(지름 1 · 높이 1, 크기로 늘린다) ═════
for nm, seed in (('hill_p', 4), ('hill_q', 9)):
    b = B()
    rh_ = random.Random(seed)
    tab = {}

    def hf(u, v, rh_=rh_, tab=tab, seed=seed):
        a = u * 2 * math.pi
        r = 1 - v
        key = (round(u % 1.0, 4), round(v, 4))
        if key not in tab:
            tab[key] = 1 + (rh_.random() - 0.5) * 0.25 * (1 - abs(2 * v - 1) ** 3 if 0 < v < 1 else 0)
        n = tab[key]
        return (math.cos(a) * r * n * 0.5, math.sin(a) * r * n * 0.5 * (0.8 if seed == 9 else 1), (1 - r ** 2) ** 0.75 * n)
    b.grid(14, 5, hf, 'hill', jit=0.12)
    b.done(nm, smooth=0, shade=(0.72, 1.1), under=0.0)

# 고깃배(길이 4): 작은 거룻배 · 노 · 그물
b = B()
L = 4.0
hw = lambda u: 0.75 * max(0.0, math.sin(math.pi * (0.12 + 0.88 * u))) ** 0.6
zt = lambda u: 0.45 + 0.35 * u ** 3 + 0.2 * (1 - u) ** 3
zb = lambda u: -0.25 + 0.3 * u ** 3
hull(b, L, hw, zt, zb, band='wood_d', upper='wood', lower='wood_d', bottom='wood_d', inner='wood_d', bandh=0.12, nu=10)
b.box((3.0, 1.0, 0.05), (0, 0, 0.18), 'wood_l', jit=0.06)
beam(b, (-1.6, 0.3, 0.6), (-2.6, 0.5, -0.1), 0.03, 'wood_l', seg=4)
b.ball(0.3, (0.6, 0, 0.3), 'net', sub=1, scale=(1.4, 1.0, 0.5), jit=0.1)
b.done('fishboat', smooth=0, shade=(0.8, 1.08), under=0.2)

export('port.glb')

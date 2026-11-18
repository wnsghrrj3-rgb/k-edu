"""케이월드 「성을 지켜라」(삼국·가야) 장면에만 쓰는 모델 — fort.glb. 앞(문·안쪽)은 -y(three 에서 +z). 바닥 가운데가 원점.
산성 성벽 마디(들여쌓은 바깥면 · 다듬은 돌 · 위는 걷는 길) · 여장 한 칸 · 성벽 계단 · 화살 시렁 · 북문(닫힌 문) · 남문(문루) · 치(모서리 돌출부) ·
망루 · 부경(다락 곳간) · 대장간(화덕·풀무·모루·덩이쇠·갑옷 걸이) · 우물 · 성돌 무더기 · 봉수대 · 불꽃 · 깃발 · 사다리 · 흙더미 · 무너진 돌 ·
들고 나르는 것(화살 다발 · 물동이 · 성돌) · 먼 산.
지붕 함수는 make_night.py 와 같은 꼴(공통 파일이라 불러오지 않고 옮겨 적었다)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_cloth', 0xc0302a), ('stone', 0xbdb6a6), ('stone_l', 0xd2ccbc), ('stone_d', 0x9c9584), ('mortar', 0x6e6858), ('stone_top', 0xc9c2b0),
             ('dark', 0x2a2420), ('wood', 0x8a6236), ('wood_d', 0x5a3e24), ('wood_l', 0xbe9a66), ('wood_r', 0xa4442c), ('thatch', 0xd9b25a), ('thatch_d', 0xb08a3e),
             ('tile', 0x56627a), ('tile_l', 0x9aa4b6), ('plaster', 0xeee6d2), ('mud', 0xb89868), ('earth', 0x8a6e48), ('earth_d', 0x6a5236), ('iron', 0x4a4c54), ('iron_l', 0x7a7e88),
             ('rope', 0xc8b080), ('straw', 0xd9b25a), ('onggi', 0x6a4030), ('onggi_l', 0x8a5a40), ('water', 0x58a6ea), ('gold', 0xf0c040), ('white', 0xf2eee2), ('feather', 0xe8e2d0),
             ('hill', 0x41703c), ('hill_d', 0x335a32), ('rockh', 0x8a8a80), ('charcoal', 0x2e2a28), ('sack', 0xcbb88a),
             ('glow_coal', 0xff7a2a), ('glow_fire_o', 0xff5a24), ('glow_fire_m', 0xffa23a), ('glow_fire_y', 0xffe27a)]:
    mat(n, c)


def qy(b, x0, x1, z0, z1, y, m, tone=1.0, jit=0.06):
    """y 를 보는 네모 한 장(돌 한 장의 얼굴)."""
    b.grid(1, 1, lambda u, v: (x0 + (x1 - x0) * u, y, z0 + (z1 - z0) * v), m, tone=tone, jit=jit)


def qx(b, y0, y1, z0, z1, x, m, tone=1.0, jit=0.06):
    b.grid(1, 1, lambda u, v: (x, y0 + (y1 - y0) * u, z0 + (z1 - z0) * v), m, tone=tone, jit=jit)


def courses(rr, a0, a1, z0, z1, rows, blen):
    """돌 쌓은 줄: [(a0, a1, z0, z1, 밝기, 재질)] — 줄마다 엇갈려 쌓는다."""
    out, h = [], (z1 - z0) / rows
    for r in range(rows):
        a = a0
        first = True
        while a < a1 - 1e-6:
            L = blen * (0.55 + rr.random() * 0.4) if first and r % 2 else blen * (0.75 + rr.random() * 0.5)
            first = False
            bb = min(a1, a + L)
            if a1 - bb < blen * 0.35:
                bb = a1
            m = 'stone' if rr.random() < 0.55 else ('stone_l' if rr.random() < 0.55 else 'stone_d')
            out.append((a, bb, z0 + r * h, z0 + (r + 1) * h, 0.9 + rr.random() * 0.18, m))
            a = bb
    return out


def wall_face_y(b, rr, x0, x1, z0, z1, y, rows, blen, out=1, g=0.045):
    for a, bb, za, zb, t, m in courses(rr, x0, x1, z0, z1, rows, blen):
        qy(b, a + g / 2, bb - g / 2, za + g / 2, zb - g / 2, y + out * 0.012, m, tone=t)


def wall_face_x(b, rr, y0, y1, z0, z1, x, rows, blen, out=1, g=0.045):
    for a, bb, za, zb, t, m in courses(rr, y0, y1, z0, z1, rows, blen):
        qx(b, a + g / 2, bb - g / 2, za + g / 2, zb - g / 2, x + out * 0.012, m, tone=t)


def sgnpow(v, p):
    return math.copysign(abs(v) ** p, v)


def thatch_roof(b, w, d, z0, h, over=0.55, m='thatch', seg=16):
    prof = [(0.0, -0.16), (0.1, 0.0), (0.45, 0.5), (0.8, 0.86), (1.0, 1.0)]
    ridge = max(0.25, (w - d) / 2 + 0.25)

    def fn(u, v):
        a = u * 2 * math.pi
        i = min(int(v * (len(prof) - 1)), len(prof) - 2)
        t = v * (len(prof) - 1) - i
        k = prof[i][0] + (prof[i + 1][0] - prof[i][0]) * t
        zz = prof[i][1] + (prof[i + 1][1] - prof[i][1]) * t
        rx = (w / 2 + over) * (1 - k) + ridge * k
        ry = (d / 2 + over) * (1 - k) + 0.12 * k
        return (rx * sgnpow(math.cos(a), 0.62), ry * sgnpow(math.sin(a), 0.62), z0 + h * zz)
    b.grid(seg, 6, fn, m, jit=0.1)
    b.box((ridge * 2 + 0.5, 0.34, 0.16), (0, 0, z0 + h + 0.02), 'thatch_d', bevel=0.05, jit=0.06)
    for i in range(-2, 3):
        b.box((0.07, d * 0.9, 0.05), (i * ridge * 0.42, 0, z0 + h * 0.99), 'thatch_d', jit=0.05, f=lambda v: Vector((v.x, v.y, v.z - 1.1 * h * (abs(v.y) / (d / 2 + over)) ** 1.6 * 0.35)))
    b.grid(seg, 1, lambda u, v: ((w / 2 + over) * sgnpow(math.cos(u * 2 * math.pi), 0.62) * (0.3 + 0.67 * v), (d / 2 + over) * sgnpow(math.sin(u * 2 * math.pi), 0.62) * (0.3 + 0.67 * v), z0 - 0.1), 'dark', jit=0)


def tile_roof(b, w, d, z0, h, over=0.7, lift=0.45, m='tile', nx=14):
    """맞배 기와지붕(용마루가 x 로): 처마 끝이 살짝 들리고 기왓골이 줄무늬로."""
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
        b.prism([(-d / 2, 0), (d / 2, 0), (0, h * 0.82)], 0.14, (s * (w / 2 - 0.02), 0, z0), 'plaster', rot=(0, 0, math.pi / 2))


def hip_roof(b, w, d, z0, h, over=0.8, lift=0.5, m='tile', n=10):
    """우진각 기와지붕(문루): 네 귀가 들린다."""
    W, D = w / 2 + over, d / 2 + over
    rx = max(0.3, W - D * 0.9)

    def fn(u, v, dz=0.0):
        a = u * 2 * math.pi
        cx, cy = sgnpow(math.cos(a), 0.35), sgnpow(math.sin(a), 0.35)
        x0, y0 = W * cx, D * cy
        x1, y1 = rx * cx, 0.1 * cy
        corner = (abs(cx) * abs(cy)) ** 2
        return (x0 + (x1 - x0) * v, y0 + (y1 - y0) * v, z0 + h * (v ** 0.8) + lift * corner * (1 - v) ** 2 + dz)
    b.grid(n * 2, 5, fn, m, jit=0.05)
    b.grid(n * 2, 1, lambda u, v: fn(1 - u, v * 0.6, -0.12), 'dark', jit=0)
    b.box((rx * 2 + 0.6, 0.32, 0.26), (0, 0, z0 + h + 0.06), 'tile_l', bevel=0.05)
    for s in (-1, 1):
        b.box((0.3, 0.3, 0.46), (s * (rx + 0.25), 0, z0 + h + 0.3), 'tile_l', bevel=0.06, rot=(0, -s * 0.3, 0))


def jar(b, x, y, z=0.0, s=1.0, m='onggi', lid=False, water=False):
    b.lathe([(0.2 * s, z), (0.36 * s, z + 0.14 * s), (0.44 * s, z + 0.42 * s), (0.4 * s, z + 0.7 * s), (0.27 * s, z + 0.86 * s), (0.29 * s, z + 0.92 * s)], (x, y, 0), m, seg=8, cap=not water, jit=0.05)
    if water:
        b.cone(0.27 * s, 0.27 * s, 0.02, (x, y, z + 0.84 * s), 'water', seg=8)
        b.cone(0.2 * s, 0.2 * s, 0.02, (x, y, z + 0.04), 'onggi', seg=8)
    if lid:
        b.lathe([(0.33 * s, z + 0.92 * s), (0.2 * s, z + 1.0 * s), (0.06 * s, z + 1.03 * s), (0.06 * s, z + 1.08 * s)], (x, y, 0), 'onggi_l', seg=8, jit=0.05)


def arrow_bundle(b, x, y, z, L=0.95, n=7, rot=0.0, r=0.07, up=False):
    """화살 다발(묶음): 대 + 깃 + 끈 두 줄. up 이면 세워 둔다."""
    for i in range(n):
        a = i * 2.4
        dx, dy = math.cos(a) * r * (0.4 + 0.6 * (i % 2)), math.sin(a) * r * (0.4 + 0.6 * (i % 2))
        if up:
            b.cone(0.016, 0.016, L, (x + dx, y + dy, z + L / 2), 'wood_l', seg=3, cap=False, jit=0.05)
            b.box((0.05, 0.005, 0.16), (x + dx, y + dy, z + L - 0.1), 'feather', rot=(0, 0, a), jit=0.03)
        else:
            cx, cy = x + math.cos(rot) * 0 - math.sin(rot) * dx, y + math.sin(rot) * 0 + math.cos(rot) * dx
            b.cone(0.016, 0.016, L, (cx, cy, z + dy + r), 'wood_l', seg=3, cap=False, rot=(0, math.pi / 2, rot), jit=0.05)
            b.box((0.16, 0.005, 0.05), (cx + math.cos(rot) * (L / 2 - 0.1), cy + math.sin(rot) * (L / 2 - 0.1), z + dy + r), 'feather', rot=(0.6 * i, 0, rot), jit=0.03)
    for k in (-0.2, 0.15):
        if up:
            b.cone(r + 0.025, r + 0.025, 0.05, (x, y, z + L * (0.5 + k)), 'rope', seg=6, jit=0.04)
        else:
            b.cone(r + 0.025, r + 0.025, 0.05, (x + math.cos(rot) * k * L, y + math.sin(rot) * k * L, z + r), 'rope', seg=6, rot=(0, math.pi / 2, rot), jit=0.04)


# ───── 성벽 마디(길이 4 · x 로 길다 · 두께 3 · 높이 4): 안쪽(-y)은 곧은 면, 바깥(+y)은 한 자씩 들여쌓았다. 위는 걷는 길 ─────
def fwall(name, seed):
    rr = random.Random(seed)
    b = B()
    for k in range(4):
        yo = 1.5 + (3 - k) * 0.09
        zt = k + 1 if k < 3 else 3.96
        b.box((4.0, yo + 1.5, zt - k), (0, (yo - 1.5) / 2, (k + zt) / 2), 'mortar', jit=0.03)
        for a, bb, za, zb, t, m in courses(rr, -2.0, 2.0, k, zt, 2, 0.95):
            qy(b, a + 0.025, bb - 0.025, za + 0.025, zb - 0.025, yo + 0.012, m, tone=t)
    b.box((4.0, 0.3, 0.36), (0, -1.6, 0.18), 'stone_d', jit=0.06)
    for a, bb, za, zb, t, m in courses(rr, -2.0, 2.0, 0.36, 3.96, 7, 1.05):
        qy(b, a + 0.025, bb - 0.025, za + 0.025, zb - 0.025, -1.512, m, tone=t)
    b.box((4.0, 3.0, 0.06), (0, 0, 3.97), 'stone_top', jit=0.05)
    b.done(name, smooth=0, shade=(0.8, 1.06), under=0.25)


fwall('fwall_a', 11)
fwall('fwall_b', 23)

# ───── 여장 한 칸(길이 1.6): 낮은 담 + 솟은 타 + 총안(어두운 구멍) — 성벽 바깥 가장자리에 줄지어 선다 ─────
b = B()
b.box((1.6, 0.55, 0.48), (0, 0, 0.24), 'stone', jit=0.08)
b.box((0.9, 0.6, 0.46), (0, 0, 0.71), 'stone_l', jit=0.08)
b.box((1.0, 0.68, 0.08), (0, 0, 0.98), 'stone_top', jit=0.05)
b.box((1.64, 0.62, 0.06), (0, 0, 0.5), 'stone_d', jit=0.04)
for s in (-1, 1):
    qy(b, -0.07, 0.07, 0.56, 0.84, s * 0.312, 'dark', jit=0)
    for x in (-0.55, 0.5):
        qy(b, x - 0.18, x + 0.18, 0.04, 0.44, s * 0.287, 'stone_d' if x < 0 else 'stone_l', tone=0.95, jit=0.08)
b.done('merlon', smooth=0, shade=(0.82, 1.06), under=0.2)

# ───── 성벽 계단(x 로 5.6, +x 쪽이 높다 · 깊이 1.3 · 높이 4): 뒤(+y)를 성벽 안쪽 면에 붙인다 ─────
b = B()
N = 10
for i in range(N):
    x0 = -2.8 + i * 0.56
    top = 0.4 * (i + 1)
    b.box((0.56, 1.3, top), (x0 + 0.28, 0, top / 2), 'stone' if i % 2 else 'stone_d', jit=0.06)
    b.box((0.6, 1.36, 0.07), (x0 + 0.28, -0.02, top - 0.02), 'stone_top', jit=0.05)
b.box((0.4, 1.36, 4.0), (3.0, 0, 2.0), 'stone', jit=0.05)
rr = random.Random(3)
for a, bb, za, zb, t, m in courses(rr, -0.68, 0.68, 0.0, 3.9, 6, 0.6):
    qx(b, a + 0.02, bb - 0.02, za + 0.02, zb - 0.02, 3.212, m, tone=t)
b.box((5.6, 0.12, 0.5), (0, -0.7, 0.25), 'stone_d', jit=0.05, f=lambda v: Vector((v.x, v.y, v.z * (1 + 6.6 * max(0, (v.x + 2.8) / 5.6)) if v.z > 0 else v.z)))
b.done('stair_w', smooth=0, shade=(0.8, 1.06), under=0.25)

# ───── 깃발 아래 놓는 자리(3 x 2.4 · 높이 0.16): 다듬은 판돌을 깔고 테두리 돌을 둘렀다 ─────
b = B()
rr = random.Random(17)
b.box((3.0, 2.4, 0.1), (0, 0, 0.05), 'mortar', jit=0.03)
for a, bb, za, zb, t, m in courses(rr, -1.38, 1.38, -1.08, 1.08, 4, 0.75):
    h = 0.13 + rr.random() * 0.03
    b.box((bb - a - 0.05, zb - za - 0.05, h), ((a + bb) / 2, (za + zb) / 2, h / 2), m, tone=t, bevel=0.025, jit=0.06)
for s in (-1, 1):
    b.box((3.0, 0.14, 0.2), (0, s * 1.13, 0.1), 'stone_d', bevel=0.02, jit=0.06)
    b.box((0.14, 2.4, 0.2), (s * 1.43, 0, 0.1), 'stone_d', bevel=0.02, jit=0.06)
b.done('pave', smooth=0, shade=(0.86, 1.04), under=0.2)

# ───── 화살 시렁(너비 1.6): 깃발 아래 놓는 자리 곁 — 다발을 세워 둔다 ─────
b = B()
for s in (-1, 1):
    b.box((0.09, 0.4, 1.25), (s * 0.75, 0, 0.62), 'wood_d', jit=0.04)
    b.box((0.12, 0.6, 0.08), (s * 0.75, 0, 0.04), 'wood_d', jit=0.04)
for z in (0.32, 1.0):
    b.box((1.6, 0.08, 0.08), (0, -0.12, z), 'wood', jit=0.05)
    b.box((1.6, 0.08, 0.08), (0, 0.12, z), 'wood', jit=0.05)
for i in range(4):
    arrow_bundle(b, -0.5 + i * 0.33, 0, 0.06, L=1.15, n=6, r=0.06, up=True)
b.lathe([(0.12, 0), (0.15, 0.1), (0.15, 0.7), (0.17, 0.74)], (0.95, -0.3, 0), 'wood_r', seg=7, rot=(0.25, 0, 0), jit=0.05)
arrow_bundle(b, 0.95, -0.4, 0.55, L=0.5, n=5, r=0.07, up=True)
b.done('arrow_rack', smooth=0, shade=(0.8, 1.06), under=0.15)

# ───── 북문(성벽 안쪽 면에 붙는 닫힌 문 — 너비 3.8 · 앞으로 0.5) ─────
b = B()
for s in (-1, 1):
    b.box((0.6, 0.5, 3.2), (s * 1.6, -0.25, 1.6), 'stone_l', bevel=0.03, jit=0.08)
    for k in range(4):
        b.box((0.66, 0.54, 0.05), (s * 1.6, -0.25, 0.8 * k + 0.4), 'stone_d', jit=0)
b.box((3.8, 0.55, 0.6), (0, -0.27, 3.5), 'stone_l', bevel=0.04, jit=0.06)
b.box((2.6, 0.06, 2.95), (0, -0.05, 1.5), 'dark', jit=0)
for s in (-1, 1):
    b.box((1.28, 0.12, 2.9), (s * 0.65, -0.14, 1.47), 'wood', jit=0.06)
    for i in range(3):
        b.box((0.03, 0.14, 2.9), (s * 0.65 + (i - 1) * 0.42, -0.15, 1.47), 'wood_d', jit=0)
    for z in (0.5, 1.5, 2.5):
        b.box((1.28, 0.16, 0.09), (s * 0.65, -0.16, z), 'iron', jit=0.03)
        for i in range(3):
            b.ball(0.035, (s * 0.65 + (i - 1) * 0.4, -0.24, z), 'iron_l', sub=1)
b.box((3.0, 0.2, 0.2), (0, -0.32, 1.45), 'wood_d', jit=0.04)
for s in (-1, 1):
    b.box((0.16, 0.26, 0.36), (s * 1.38, -0.32, 1.45), 'iron', jit=0.03)
b.done('gate_n', smooth=0, shade=(0.78, 1.06), under=0.25)

# ───── 남문(문길 너비 5.8 · 바깥 = -y): 돌로 쌓은 문 둔덕 둘 + 문루(우진각 기와) · 문짝은 안으로 활짝 ─────
b = B()
rr = random.Random(41)
for s in (-1, 1):
    xa, xb = s * 2.9, s * 5.5
    x0, x1 = min(xa, xb), max(xa, xb)
    b.box((2.6, 3.4, 4.6), ((x0 + x1) / 2, 0, 2.3), 'mortar', jit=0.03)
    for yy, o in ((-1.7, -1), (1.7, 1)):
        for a, bb, za, zb, t, m in courses(rr, x0, x1, 0.0, 4.6, 9, 0.9):
            qy(b, a + 0.025, bb - 0.025, za + 0.025, zb - 0.025, yy + o * 0.012, m, tone=t)
    for xx in (x0, x1):
        o = 1 if xx == x1 else -1
        for a, bb, za, zb, t, m in courses(rr, -1.7, 1.7, 0.0, 4.6, 9, 0.9):
            qx(b, a + 0.025, bb - 0.025, za + 0.025, zb - 0.025, xx + o * 0.012, m, tone=t)
    b.box((2.8, 3.6, 0.14), ((x0 + x1) / 2, 0, 4.67), 'stone_top', bevel=0.03, jit=0.05)
    # 문짝(안쪽으로 젖혀 둔덕 안쪽 면에 붙었다)
    b.box((0.12, 2.9, 3.6), (s * 2.8, 0.35, 1.85), 'wood', jit=0.06)
    for k in range(4):
        b.box((0.14, 0.03, 3.6), (s * 2.79, -0.8 + k * 0.75, 1.85), 'wood_d', jit=0)
    for z in (0.6, 1.8, 3.0):
        b.box((0.16, 2.9, 0.1), (s * 2.78, 0.35, z), 'iron', jit=0.03)
b.box((5.9, 3.0, 0.4), (0, 0, 4.4), 'wood_d', jit=0.04)
b.box((5.8, 0.06, 0.32), (0, -1.53, 4.4), 'wood_r', jit=0.04)
b.box((10.8, 3.6, 0.16), (0, 0, 4.8), 'wood_l', jit=0.06)
for x in (-4.8, -1.6, 1.6, 4.8):
    for y in (-1.3, 1.3):
        b.cone(0.17, 0.15, 2.3, (x, y, 6.0), 'wood_r', seg=8, jit=0.03)
for y in (-1.6, 1.6):
    for z in (5.2, 5.5):
        b.box((10.4, 0.07, 0.07), (0, y, z), 'wood_r', jit=0.03)
    for i in range(14):
        b.box((0.05, 0.05, 0.62), (-5.2 + i * 0.8, y, 5.18), 'wood_r', jit=0)
b.box((10.2, 3.0, 0.26), (0, 0, 7.2), 'wood_d', jit=0.03)
b.box((9.8, 0.08, 0.36), (0, -1.36, 6.95), 'tile', jit=0.03)
b.box((1.5, 0.05, 0.5), (0, -1.42, 6.85), 'wood_d', jit=0.03)
b.box((1.3, 0.06, 0.36), (0, -1.45, 6.85), 'gold', jit=0.02)
hip_roof(b, 10.0, 2.8, 7.3, 1.5, over=0.9, lift=0.55, n=10)
b.done('gate_s', smooth=0, shade=(0.78, 1.06), under=0.28)

# ───── 치(성벽 모서리에서 밖으로 내민 네모 돌 대, 4.4 x 4.4 · 높이 4.3) ─────
b = B()
rr = random.Random(55)
b.box((4.4, 4.4, 4.3), (0, 0, 2.15), 'mortar', jit=0.03)
for yy, o in ((-2.2, -1), (2.2, 1)):
    for a, bb, za, zb, t, m in courses(rr, -2.2, 2.2, 0, 4.3, 8, 0.95):
        qy(b, a + 0.025, bb - 0.025, za + 0.025, zb - 0.025, yy + o * 0.012, m, tone=t)
for xx, o in ((-2.2, -1), (2.2, 1)):
    for a, bb, za, zb, t, m in courses(rr, -2.2, 2.2, 0, 4.3, 8, 0.95):
        qx(b, a + 0.025, bb - 0.025, za + 0.025, zb - 0.025, xx + o * 0.012, m, tone=t)
b.box((4.6, 4.6, 0.3), (0, 0, 0.15), 'stone_d', jit=0.06)
b.box((4.4, 4.4, 0.06), (0, 0, 4.33), 'stone_top', jit=0.05)
for i in range(3):
    for s in (-1, 1):
        x = -1.45 + i * 1.45
        b.box((0.95, 0.5, 0.95), (x, s * 1.95, 4.75), 'stone_l', bevel=0.03, jit=0.08)
        b.box((0.5, 0.95, 0.95), (s * 1.95, x, 4.75), 'stone_l', bevel=0.03, jit=0.08)
b.done('chi', smooth=0, shade=(0.8, 1.06), under=0.25)

# ───── 망루(4 x 3): 돌 기단 위 널벽 · 앞(-y)에 문 · 초가 우진각 지붕(불화살이 붙는 곳) ─────
b = B()
b.box((4.1, 3.1, 0.35), (0, 0, 0.175), 'stone', bevel=0.05, jit=0.08)
b.box((3.8, 2.8, 1.75), (0, 0, 0.35 + 0.875), 'wood_l', jit=0.05)
for i in range(1, 7):
    b.box((3.84, 2.84, 0.025), (0, 0, 0.35 + i * 0.25), 'wood', jit=0)
for x in (-1.9, 0, 1.9):
    for y in (-1.4, 1.4):
        b.box((0.16, 0.16, 1.9), (x, y, 1.3), 'wood_d', jit=0.03)
for y in (-1.4, 0, 1.4):
    for x in (-1.9, 1.9):
        b.box((0.16, 0.16, 1.9), (x, y, 1.3), 'wood_d', jit=0.03)
b.box((3.96, 2.96, 0.14), (0, 0, 2.17), 'wood_d', jit=0.03)
b.box((0.95, 0.07, 1.4), (0.8, -1.43, 1.05), 'wood', jit=0.05)
b.box((0.05, 0.09, 1.4), (0.8, -1.45, 1.05), 'wood_d', jit=0)
b.box((0.8, 0.06, 0.4), (-0.9, -1.43, 1.65), 'dark', jit=0)
for i in range(4):
    b.box((0.04, 0.08, 0.4), (-1.2 + i * 0.2, -1.45, 1.65), 'wood_d', jit=0)
b.box((0.7, 0.4, 0.16), (0.8, -1.75, 0.08), 'stone_d', bevel=0.03, jit=0.06)
thatch_roof(b, 3.8, 2.8, 2.2, 1.15, over=0.45, seg=14)
b.done('watch_hut', smooth=0, shade=(0.76, 1.07), under=0.3)

# ───── 부경(고구려 다락 곳간, 8 x 6): 기둥 아홉 위에 마루, 널벽 · 맞배 기와 · 통나무 사다리 ─────
b = B()
for x in (-3.6, 0, 3.6):
    for y in (-2.6, 0, 2.6):
        b.cone(0.2, 0.17, 1.5, (x, y, 0.75), 'wood_d', seg=7, jit=0.04)
        b.cone(0.32, 0.36, 0.14, (x, y, 0.07), 'stone_d', seg=7, jit=0.05)
for y in (-2.6, 2.6):
    b.box((7.6, 0.26, 0.26), (0, y, 1.38), 'wood_d', jit=0.03)
b.box((8.2, 6.2, 0.2), (0, 0, 1.6), 'wood', jit=0.05)
b.box((7.4, 5.4, 2.0), (0, 0, 2.7), 'wood_l', jit=0.05)
for i in range(1, 8):
    b.box((7.44, 5.44, 0.03), (0, 0, 1.7 + i * 0.25), 'wood', jit=0)
for x in (-3.7, -1.85, 0, 1.85, 3.7):
    for y in (-2.7, 2.7):
        b.box((0.18, 0.18, 2.1), (x, y, 2.75), 'wood_d', jit=0.03)
b.box((7.7, 5.7, 0.18), (0, 0, 3.75), 'wood_d', jit=0.03)
b.box((1.1, 0.08, 1.5), (0.9, -2.72, 2.5), 'wood', jit=0.05)
for z in (2.0, 3.0):
    b.box((1.14, 0.1, 0.07), (0.9, -2.74, z), 'iron', jit=0)
b.box((0.4, 0.12, 2.0), (0.9, -3.4, 0.85), 'wood', rot=(-0.42, 0, 0), jit=0.05)
for k in range(5):
    b.box((0.42, 0.1, 0.05), (0.9, -3.7 + k * 0.17, 0.3 + k * 0.33), 'wood_d', jit=0)
tile_roof(b, 7.4, 5.4, 3.86, 1.55, over=0.6, lift=0.4, nx=14)
for x, y, r in [(-2.2, -1.2, 0.35), (-1.6, 0.9, 0.3), (1.9, 1.1, 0.33), (2.5, -0.9, 0.3), (-2.7, 0.0, 0.28)]:
    b.ball(r, (x, y, r * 0.8), 'sack', sub=1, scale=(1.3, 1, 0.85), jit=0.08)
jar(b, -0.6, -1.4, 0, 0.8, 'onggi', lid=True)
jar(b, 0.3, -1.6, 0, 0.6, 'onggi_l', lid=True)
b.done('bugyeong', smooth=0, shade=(0.76, 1.07), under=0.28)

# ───── 대장간(8 x 4.5, 앞 = -y = 화덕이 있는 쪽): 뒷벽·옆벽 흙벽 · 초가 · 화덕(불씨) · 발풀무 · 모루 · 갑옷 걸이 · 창 시렁 · 덩이쇠 ─────
b = B()
b.box((8.0, 4.4, 0.18), (0, 0, 0.09), 'earth_d', jit=0.05)
b.box((7.8, 0.4, 2.3), (0, 2.0, 1.15), 'mud', jit=0.05)
for s in (-1, 1):
    b.box((0.4, 2.6, 2.3), (s * 3.7, 0.9, 1.15), 'mud', jit=0.05)
    b.box((0.44, 2.64, 0.3), (s * 3.7, 0.9, 0.15), 'stone_d', jit=0.06)
b.box((7.84, 0.44, 0.3), (0, 2.0, 0.15), 'stone_d', jit=0.06)
for x in (-3.8, -1.3, 1.3, 3.8):
    b.box((0.2, 0.2, 2.4), (x, -2.0, 1.2), 'wood_d', jit=0.03)
b.box((7.9, 0.2, 0.2), (0, -2.0, 2.4), 'wood_d', jit=0.03)
b.box((7.9, 4.3, 0.12), (0, 0, 2.46), 'wood_d', jit=0.03)
thatch_roof(b, 7.6, 4.2, 2.45, 1.4, over=0.5, seg=16)
# 화덕(돌로 쌓고 흙을 바른 불 자리) + 굴뚝
b.box((1.5, 1.3, 0.9), (0, -1.75, 0.45), 'stone', bevel=0.06, jit=0.1)
b.box((1.56, 1.36, 0.1), (0, -1.75, 0.92), 'stone_d', jit=0.06)
b.cone(0.48, 0.42, 0.06, (0, -1.85, 0.95), 'charcoal', seg=8)
for i in range(7):
    a = i * 0.9
    b.ball(0.11, (math.cos(a) * 0.25, -1.85 + math.sin(a) * 0.22, 0.99), 'glow_coal', sub=1, scale=(1, 1, 0.6))
b.box((0.5, 0.06, 0.3), (0, -2.42, 0.45), 'glow_coal', jit=0)
b.cone(0.42, 0.26, 2.2, (0, -1.35, 2.0), 'mud', seg=7, jit=0.06)
b.cone(0.3, 0.3, 0.3, (0, -1.35, 3.25), 'mud', seg=7, jit=0.06)
# 발풀무(널을 밟아 바람을 넣는다)
b.box((1.1, 0.7, 0.42), (-1.55, -1.8, 0.21), 'wood', jit=0.06)
b.box((1.5, 0.36, 0.07), (-1.55, -1.8, 0.47), 'wood_l', rot=(0, 0.12, 0), jit=0.05)
b.cone(0.07, 0.07, 0.75, (-1.0, -1.75, 0.3), 'wood_d', seg=6, rot=(0, math.pi / 2, 0))
for s in (-1, 1):
    b.box((0.08, 0.08, 1.1), (-1.55 + s * 0.6, -1.9, 0.55), 'wood_d', jit=0.03)
b.box((1.3, 0.08, 0.08), (-1.55, -1.9, 1.1), 'wood_d')
# 모루(그루터기 위 쇠) · 망치 · 집게
b.cone(0.32, 0.28, 0.5, (1.4, -1.9, 0.25), 'wood', seg=8, jit=0.06)
b.box((0.5, 0.26, 0.22), (1.4, -1.9, 0.6), 'iron', bevel=0.02, jit=0.04)
b.cone(0.11, 0.01, 0.26, (1.78, -1.9, 0.64), 'iron', seg=6, rot=(0, math.pi / 2, 0))
b.box((0.04, 0.04, 0.42), (1.3, -1.72, 0.74), 'wood_l', rot=(0.0, 1.35, 0.4))
b.box((0.14, 0.08, 0.08), (1.48, -1.68, 0.77), 'iron')
b.box((0.5, 0.03, 0.03), (1.2, -2.08, 0.73), 'iron', rot=(0, 0, 0.3))
b.box((0.5, 0.03, 0.03), (1.2, -2.12, 0.73), 'iron', rot=(0, 0, 0.42))
b.lathe([(0.25, 0), (0.28, 0.4), (0.26, 0.44)], (2.0, -1.4, 0), 'wood', seg=8, cap=False, jit=0.06)
b.cone(0.24, 0.24, 0.02, (2.0, -1.4, 0.32), 'water', seg=8)
# 갑옷 걸이(비늘 갑옷 · 투구) — 그저 걸어 둔 물건
b.box((0.08, 0.08, 1.6), (-2.85, 0.9, 0.8), 'wood_d')
b.box((0.8, 0.07, 0.07), (-2.85, 0.9, 1.52), 'wood_d')
b.box((0.5, 0.5, 0.06), (-2.85, 0.9, 0.03), 'wood_d')
b.lathe([(0.27, 0.62), (0.31, 0.8), (0.3, 1.1), (0.33, 1.36), (0.22, 1.5), (0.1, 1.53)], (-2.85, 0.9, 0), 'iron', seg=9, jit=0.04)
for k in range(5):
    b.cone(0.32 + (0.02 if k % 2 else 0), 0.32, 0.03, (-2.85, 0.9, 0.7 + k * 0.17), 'iron_l', seg=9, jit=0)
for s in (-1, 1):
    b.box((0.2, 0.16, 0.34), (-2.85 + s * 0.36, 0.9, 1.38), 'iron', rot=(0, s * 0.35, 0), jit=0.04)
b.ball(0.2, (-2.85, 0.9, 1.72), 'iron', sub=1, scale=(1, 1, 1.15), jit=0.04)
b.cone(0.05, 0.01, 0.2, (-2.85, 0.9, 1.98), 'iron_l', seg=5)
b.box((0.34, 0.03, 0.18), (-2.85, 0.72, 1.62), 'iron_l', jit=0)
# 창 시렁(창날은 쇠 · 세워 둔 것)
for s in (-1, 1):
    b.box((0.08, 0.08, 1.3), (2.4 + s * 0.6, 1.5, 0.65), 'wood_d')
b.box((1.4, 0.07, 0.07), (2.4, 1.45, 1.2), 'wood_d')
b.box((1.4, 0.07, 0.07), (2.4, 1.45, 0.35), 'wood_d')
for i in range(4):
    x = 1.95 + i * 0.3
    b.cone(0.025, 0.025, 2.0, (x, 1.42, 1.0), 'wood', seg=4, jit=0.04)
    b.cone(0.045, 0.002, 0.24, (x, 1.42, 2.12), 'iron_l', seg=4)
# 덩이쇠(가야의 쇠 판) 쌓음 · 숯 가마니 · 화살 다발 더미(만든 것)
for k in range(5):
    for j in range(3):
        a = (k % 2) * math.pi / 2
        b.box((0.62, 0.14, 0.035), (-3.0 + (j - 1) * 0.17 * math.sin(a) * 1, -1.55 + (j - 1) * 0.17 * math.cos(a), 0.2 + k * 0.04), 'iron', rot=(0, 0, a), jit=0.08, f=lambda v: Vector((v.x, v.y * (1 + 1.1 * abs(v.x) / 0.31), v.z)))
b.ball(0.32, (-3.15, -0.6, 0.3), 'sack', sub=1, scale=(1.2, 1, 0.9), jit=0.08)
b.ball(0.28, (-2.55, -0.45, 0.27), 'sack', sub=1, scale=(1.2, 1, 0.9), jit=0.08)
for i in range(3):
    arrow_bundle(b, 2.9, -1.75 + i * 0.22, 0.18 + (i % 2) * 0.05, L=0.9, n=6, r=0.06, rot=0.0)
for i in range(2):
    arrow_bundle(b, 2.9, -1.64 + i * 0.22, 0.32, L=0.9, n=6, r=0.06, rot=0.0)
# 뒷벽 밖(+y) 장작 · 연장 걸이
for k in range(3):
    for i in range(6):
        b.cone(0.09, 0.09, 1.3, (-2.6 + k * 0.0 + (i - 2.5) * 0.19, 2.42, 0.12 + k * 0.17 + (0.08 if i % 2 else 0)), 'wood' if (i + k) % 2 else 'wood_l', seg=5, rot=(0, math.pi / 2, math.pi / 2), jit=0.08)
b.box((1.2, 0.07, 0.07), (1.4, 1.78, 1.7), 'wood_d')
for i in range(4):
    b.box((0.04, 0.04, 0.4), (1.0 + i * 0.27, 1.76, 1.48), 'wood_l')
    b.box((0.13, 0.07, 0.07), (1.0 + i * 0.27, 1.75, 1.3), 'iron')
b.done('smithy', smooth=0, shade=(0.74, 1.08), under=0.3)

# ───── 우물(2.8 칸): 다듬은 돌을 둥글게 쌓았다 · 맑은 물 · 두레박 틀 · 물동이 ─────
b = B()
seg = 12
for k in range(3):
    for i in range(seg):
        a0 = (i + 0.5 * (k % 2)) * 2 * math.pi / seg
        b.box((0.56, 0.3, 0.27), (math.cos(a0) * 1.0, math.sin(a0) * 1.0, 0.135 + k * 0.28), 'stone' if (i + k) % 3 else ('stone_l' if k % 2 else 'stone_d'), rot=(0, 0, a0 + math.pi / 2), jit=0.1)
for i in range(seg):
    a0 = i * 2 * math.pi / seg
    b.box((0.58, 0.36, 0.1), (math.cos(a0) * 1.0, math.sin(a0) * 1.0, 0.89), 'stone_top', rot=(0, 0, a0 + math.pi / 2), jit=0.08)
b.cone(0.86, 0.86, 0.04, (0, 0, 0.7), 'water', seg=12, jit=0.03)
b.cone(0.86, 0.86, 0.04, (0, 0, 0.3), 'dark', seg=12, jit=0)
for s in (-1, 1):
    b.box((0.14, 0.14, 2.1), (s * 1.25, 0, 1.05), 'wood_d', jit=0.04)
b.box((2.7, 0.12, 0.12), (0, 0, 2.05), 'wood_d', jit=0.03)
b.cone(0.17, 0.17, 0.1, (0, 0, 2.05), 'wood', seg=10, rot=(math.pi / 2, 0, 0))
b.box((0.02, 0.02, 0.9), (0.15, 0, 1.55), 'rope')
b.lathe([(0.12, 1.0), (0.15, 1.24)], (0.15, 0, 0), 'wood', seg=7, jit=0.05)
for x, y, s, m in [(-1.15, -1.2, 0.55, 'onggi'), (1.18, -1.15, 0.5, 'onggi_l'), (1.2, 1.15, 0.6, 'onggi'), (-1.2, 1.15, 0.45, 'onggi_l')]:
    jar(b, x, y, 0, s, m, water=True)
b.done('well_f', smooth=0, shade=(0.78, 1.07), under=0.25)

# ───── 성돌 무더기(5 x 3): 네모나게 다듬은 돌을 층층이 · 앞(-y)에는 썰매에 실린 돌 ─────
b = B()
rr = random.Random(77)
for lay, (nx, ny) in enumerate([(5, 3), (4, 2), (2, 1)]):
    for i in range(nx):
        for j in range(ny):
            x = (i - (nx - 1) / 2) * 0.82 + (rr.random() - 0.5) * 0.1
            y = (j - (ny - 1) / 2) * 0.62 + 0.25 + (rr.random() - 0.5) * 0.08
            b.box((0.74, 0.52, 0.36), (x, y, 0.18 + lay * 0.37), rr.choice(['stone', 'stone_l', 'stone_d']), rot=(0, 0, (rr.random() - 0.5) * 0.18), bevel=0.03, jit=0.1)
b.box((1.8, 0.8, 0.1), (0.4, -1.05, 0.12), 'wood', jit=0.05)
for s in (-1, 1):
    b.box((1.9, 0.1, 0.12), (0.4, -1.05 + s * 0.36, 0.06), 'wood_d', jit=0.04, f=lambda v: Vector((v.x, v.y, v.z + (0.12 if v.x > 0.8 else 0))))
for x in (-0.05, 0.75):
    b.box((0.7, 0.5, 0.34), (x, -1.05, 0.34), 'stone_l', bevel=0.03, jit=0.1)
b.box((0.04, 0.04, 0.9), (-1.6, -1.0, 0.45), 'wood_l', rot=(0.0, 1.2, 0.3))
b.box((0.3, 0.16, 0.16), (-1.25, -0.9, 0.62), 'wood_d', rot=(0.0, 1.2, 0.3))
for i in range(5):
    a = rr.random() * 6.28
    b.ball(0.1 + rr.random() * 0.08, (math.cos(a) * 2.3, -0.2 + math.sin(a) * 1.2, 0.06), 'stone_d', sub=1, scale=(1.2, 1, 0.7), jit=0.1)
b.done('stone_pile', smooth=0, shade=(0.78, 1.07), under=0.25)

# ───── 봉수대(5 x 4, 앞 = -y): 돌을 세 단으로 들여쌓은 대 · 둥근 굴뚝(연조) · 옆으로 오르는 계단 · 땔감과 짚 ─────
b = B()
rr = random.Random(91)
for k, (w, d, z0, z1) in enumerate([(5.0, 4.0, 0.0, 0.7), (4.7, 3.7, 0.7, 1.4), (4.4, 3.4, 1.4, 2.0)]):
    b.box((w, d, z1 - z0), (0, 0, (z0 + z1) / 2), 'mortar', jit=0.03)
    for yy, o in ((-d / 2, -1), (d / 2, 1)):
        for a, bb, za, zb, t, m in courses(rr, -w / 2, w / 2, z0, z1, 2, 0.8):
            qy(b, a + 0.025, bb - 0.025, za + 0.025, zb - 0.025, yy + o * 0.012, m, tone=t)
    for xx, o in ((-w / 2, -1), (w / 2, 1)):
        for a, bb, za, zb, t, m in courses(rr, -d / 2, d / 2, z0, z1, 2, 0.8):
            qx(b, a + 0.025, bb - 0.025, za + 0.025, zb - 0.025, xx + o * 0.012, m, tone=t)
b.box((4.4, 3.4, 0.05), (0, 0, 2.02), 'stone_top', jit=0.05)
for i in range(5):
    top = 0.4 * (i + 1)
    b.box((0.5, 0.7, top), (2.0 - i * 0.5, -2.35, top / 2), 'stone' if i % 2 else 'stone_d', jit=0.06)
b.lathe([(1.3, 2.0), (1.2, 2.6), (1.05, 3.3), (1.1, 3.36), (0.8, 3.36), (0.8, 2.6)], (0, 0.2, 0), 'stone_l', seg=10, cap=False, jit=0.08)
for k in range(4):
    b.lathe([(1.3 - k * 0.065 + 0.012, 2.15 + k * 0.3), (1.3 - k * 0.065 - 0.008, 2.17 + k * 0.3)], (0, 0.2, 0), 'stone_d', seg=10, cap=False, jit=0)
b.cone(0.8, 0.8, 0.04, (0, 0.2, 2.9), 'charcoal', seg=10)
for i in range(4):
    b.cone(0.08, 0.08, 1.3, (0, 0.2, 3.05 + i * 0.07), 'wood', seg=5, rot=(math.pi / 2, 0, i * 0.8), jit=0.08)
for x, y in [(-1.6, 1.1), (-1.85, 0.5), (1.65, 1.15)]:
    b.cone(0.3, 0.3, 0.9, (x, y, 2.47), 'straw', seg=7, rot=(0.12, 0.1, 0), jit=0.08)
    b.cone(0.32, 0.32, 0.06, (x, y, 2.6), 'rope', seg=7, rot=(0.12, 0.1, 0))
for k in range(2):
    for i in range(4):
        b.cone(0.08, 0.08, 1.0, (1.4 + (i - 1.5) * 0.17, -1.1, 2.12 + k * 0.15 + (0.07 if i % 2 else 0)), 'wood' if (i + k) % 2 else 'wood_l', seg=5, rot=(math.pi / 2, 0, 0), jit=0.08)
jar(b, -1.7, -1.1, 2.04, 0.5, 'onggi', lid=True)
b.done('beacon', smooth=0, shade=(0.78, 1.07), under=0.25)

# ───── 불꽃(스스로 빛남, 높이 1.6 · 밑 가운데 원점) ─────
b = B()
for i, (r, h, m, d) in enumerate([(0.42, 1.2, 'glow_fire_o', 0.22), (0.36, 1.0, 'glow_fire_o', 0.2), (0.34, 1.4, 'glow_fire_o', 0.1), (0.28, 1.6, 'glow_fire_m', 0.0), (0.22, 1.1, 'glow_fire_m', 0.18), (0.15, 0.9, 'glow_fire_y', 0.05)]):
    a = i * 2.1
    b.cone(r, 0.01, h, (math.cos(a) * d, math.sin(a) * d, h / 2), m, seg=5, rot=(math.sin(a) * 0.18, math.cos(a) * 0.18, a), jit=0.02)
b.done('flame', smooth=0, shade=(1.0, 1.0), under=0)

# ───── 깃발: 깃대(받침은 -0.8 = 성벽 위) · 깃 천(깃대 쪽이 원점, +x 로 1.8, 가운데 높이 0) ─────
b = B()
b.cone(0.085, 0.06, 5.1, (0, 0, 1.75), 'wood_d', seg=6, jit=0.04)
b.box((0.6, 0.6, 0.3), (0, 0, -0.65), 'stone_d', bevel=0.04, jit=0.08)
b.ball(0.11, (0, 0, 4.36), 'gold', sub=1)
b.cone(0.05, 0.01, 0.3, (0, 0, 4.58), 'gold', seg=5)
b.box((0.05, 0.05, 0.45), (0.06, 0, 4.1), 'tint_cloth', jit=0)
b.done('flag_pole', smooth=0, shade=(0.8, 1.06))
b = B()
b.grid(6, 2, lambda u, v: (0.06 + u * 1.75, 0.09 * math.sin(u * 4.2) * u, (v - 0.5) * 1.1 - 0.06 * u), 'tint_cloth', jit=0.04)
for s in (-1, 1):
    b.grid(8, 1, lambda u, v, s=s: (1.0 + 0.25 * math.cos(u * 6.283) * (v + 0.2) / 1.2, 0.09 * math.sin(1.0 / 1.81 * 4.2) * 0.55 + s * 0.015, -0.06 + 0.25 * math.sin(u * 6.283) * (v + 0.2) / 1.2), 'gold', jit=0)
for i in range(4):
    b.box((0.04, 0.02, 0.18), (0.25 + i * 0.5, 0.09 * math.sin((0.25 + i * 0.5) / 1.81 * 4.2) * (0.25 + i * 0.5) / 1.81, -0.64 - 0.06 * (0.25 + i * 0.5) / 1.81), 'gold', jit=0)
b.done('flag_cloth', smooth=0, shade=(0.88, 1.04), under=0.05)

# ───── 사다리(길이 5, 밑이 원점, 위로 곧게 — 장면이 기울인다) ─────
b = B()
for s in (-1, 1):
    b.cone(0.07, 0.06, 5.0, (s * 0.45, 0, 2.5), 'wood', seg=5, jit=0.06)
for r in range(5):
    z = 0.6 + r * 0.95
    b.cone(0.04, 0.04, 0.95, (0, 0, z), 'wood_l', seg=4, rot=(0, math.pi / 2, 0), jit=0.06)
    for s in (-1, 1):
        b.cone(0.085, 0.085, 0.07, (s * 0.45, 0, z), 'rope', seg=5, jit=0)
b.done('ladder', smooth=0, shade=(0.8, 1.06), under=0.1)

# ───── 흙더미(가운데 원점 · 반지름 1 · 높이 -1~1 — 장면이 늘이고 쌓는다): 흙 · 돌 · 섶 다발 ─────
b = B()
rr = random.Random(13)
b.ball(1.0, (0, 0, 0), 'earth', sub=2, jit=0.12, f=lambda v: Vector((v.x * (1 + 0.08 * math.sin(v.y * 9 + v.z * 3)), v.y * (1 + 0.08 * math.cos(v.x * 7)), v.z * (0.95 + 0.1 * math.sin(v.x * 11 + v.y * 5)))))
for i in range(9):
    a = rr.random() * 6.28
    rad = 0.3 + rr.random() * 0.55
    z = math.sqrt(max(0.0, 1 - rad * rad)) * 0.92
    b.ball(0.07 + rr.random() * 0.05, (math.cos(a) * rad, math.sin(a) * rad, z), 'stone_d', sub=1, scale=(1.4, 1, 0.7), jit=0.1)
for i in range(5):
    a = rr.random() * 6.28
    rad = 0.35 + rr.random() * 0.4
    z = math.sqrt(max(0.0, 1 - rad * rad)) * 0.9
    b.cone(0.07, 0.07, 0.42, (math.cos(a) * rad, math.sin(a) * rad, z), 'thatch_d', seg=5, rot=(0, math.pi / 2, a + 1.5), jit=0.08)
b.done('mound', smooth=0, shade=(0.62, 1.1), under=0.3)

# ───── 무너진 돌(성벽 위 가운데 원점, 너비 6): 위에는 흩어진 돌, 안쪽 발치(-y · 4 아래)에는 떨어진 성돌 ─────
b = B()
rr = random.Random(29)
for i in range(16):
    x = (rr.random() - 0.5) * 5.6
    y = 0.4 + rr.random() * 1.0
    b.box((0.5 + rr.random() * 0.3, 0.4, 0.3), (x, y, 0.12 + rr.random() * 0.1), rr.choice(['stone', 'stone_l', 'stone_d']), rot=(rr.random() * 0.5, rr.random() * 0.5, rr.random() * 3), bevel=0.03, jit=0.1)
b.box((5.4, 0.9, 0.18), (0, 0.9, 0.05), 'earth', jit=0.1, f=lambda v: Vector((v.x, v.y, v.z + 0.12 * math.sin(v.x * 2.3))))
for i in range(9):
    x = (rr.random() - 0.5) * 4.4
    y = -1.8 - rr.random() * 0.9
    b.box((0.55, 0.42, 0.32), (x, y, -3.86 + rr.random() * 0.15), rr.choice(['stone', 'stone_l', 'stone_d']), rot=(rr.random() * 0.4, rr.random() * 0.4, rr.random() * 3), bevel=0.03, jit=0.1)
b.done('rubble', smooth=0, shade=(0.8, 1.06), under=0.2)

# ───── 들고 나르는 것(머리 위, 밑이 원점): 화살 다발 · 물동이 · 성돌 ─────
b = B()
arrow_bundle(b, 0, 0, 0.0, L=0.95, n=9, r=0.1, rot=0.0)
b.done('carry_arrows', smooth=0, shade=(0.9, 1.05), under=0.1)
b = B()
b.cone(0.18, 0.2, 0.06, (0, 0, 0.03), 'straw', seg=8)
jar(b, 0, 0, 0.05, 0.62, 'onggi_l', water=True)
for s in (-1, 1):
    b.box((0.08, 0.08, 0.06), (s * 0.24, 0, 0.47), 'onggi', jit=0)
b.done('carry_water', smooth=30, shade=(0.8, 1.08), under=0.1)
b = B()
b.box((0.62, 0.44, 0.36), (0, 0, 0.18), 'stone_l', bevel=0.04, jit=0.08)
b.box((0.66, 0.04, 0.38), (0.1, 0, 0.19), 'rope', jit=0)
b.done('carry_stone', smooth=0, shade=(0.82, 1.06), under=0.1)

# ───── 먼 산(반지름 1 · 높이 1 — 장면이 크게 늘인다) ─────
for name, seed, peaks in (('hill_a', 5, 3), ('hill_b', 8, 2)):
    rr = random.Random(seed)
    ph = [rr.random() * 6.28 for _ in range(4)]

    def hfn(u, v, ph=ph, peaks=peaks):
        a = u * 2 * math.pi
        r = 1.0 - v
        bump = 1 + 0.12 * math.sin(a * peaks + ph[0]) + 0.07 * math.sin(a * 5 + ph[1])
        h = (v ** 1.25) * (0.85 + 0.15 * math.sin(a * peaks + ph[2])) + 0.05 * math.sin(a * 7 + ph[3]) * v * (1 - v)
        return (math.cos(a) * r * bump, math.sin(a) * r * bump * 0.8, h)
    b = B()
    b.grid(18, 5, hfn, 'hill', jit=0.1)
    b.done(name, smooth=0, shade=(0.55, 1.15), under=0.2)

export('fort.glb')

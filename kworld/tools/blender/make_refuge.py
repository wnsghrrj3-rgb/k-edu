"""케이월드 피란길(S10) 장면 묶음 — refuge.glb. 이 장면에만 쓰는 모델(이름은 모두 rf_ 로 시작한다).
앞(문·열린 쪽)은 -y(three 에서 +z). 바닥 가운데가 원점. 눈 덮인 1950년 겨울.
tint_wall(벽) · tint_roof(지붕) · tint_cloth(천) 는 장면이 색을 바꿀 수 있다. glow_* 는 스스로 빛난다.
인파(rf_cbody · rf_chead · rf_cpack)만 앞이 +y(three 에서 -z = 걸어가는 쪽)이고, 원점이 장면이 놓는 높이(0.95 · 1.8 · 1.3)다."""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_wall', 0xcdbb98), ('tint_roof', 0x5c6470), ('tint_cloth', 0xc8a050), ('canvas', 0xcfc6a8), ('canvas_d', 0xb4aa8c), ('patch', 0x94886e), ('dark', 0x2a2420), ('wood', 0x7a5632), ('wood_d', 0x4e3620), ('wood_l', 0xb08a5a),
             ('plank', 0x8a6a48), ('plank_g', 0x7c7468), ('stone', 0x9a968e), ('stone_d', 0x7d7a74), ('conc', 0x9496a0), ('conc_d', 0x767884), ('iron', 0x34343c), ('iron_l', 0x4a4a54), ('rust', 0x7a4a34), ('snow', 0xf2f6fb), ('ice', 0xcfe2f2),
             ('paper', 0xf4ecd4), ('paper_d', 0xb6ae9c), ('white', 0xf6f4ee), ('ink', 0x2b2118), ('board', 0x2c3a32), ('straw', 0xd9b25a), ('straw_d', 0xb08a3e), ('tile', 0x4c586c), ('onggi', 0x6a4030), ('onggi_l', 0x8a5a40), ('rope', 0xc8b080),
             ('skin', 0xffd9a8), ('hair', 0x2b2118), ('cwhite', 0xffffff), ('red', 0xc84a5a), ('green', 0x4a7a5a), ('brown', 0x7a5a32), ('brown_d', 0x54391e), ('bronze', 0xb8923a), ('photo', 0x8a8a84), ('glow_win', 0xffd88a)]:
    mat(n, c)

PI = math.pi


def blanket(b, fn, nx, ny, th=0.14, seed=0, m='snow', up=(0, 0, 1), lo=0.62, **k):
    """눈 이불: fn(u, v) 면 위에 th 만큼 뜬 울퉁불퉁한 면. 가장자리 한 줄은 바닥에 붙어 옆면이 된다."""
    rr = random.Random(seed)
    lump = [[rr.uniform(lo, 1.0) for _ in range(ny + 3)] for _ in range(nx + 3)]
    U = Vector(up)

    def g(u, v):
        i, j = round(u * (nx + 2)), round(v * (ny + 2))
        uu, vv = min(max((i - 1) / nx, 0.0), 1.0), min(max((j - 1) / ny, 0.0), 1.0)
        edge = i == 0 or i == nx + 2 or j == 0 or j == ny + 2
        return tuple(Vector(fn(uu, vv)) + U * (0.0 if edge else th * lump[i][j]))
    b.grid(nx + 2, ny + 2, g, m, jit=0.035, **k)


def flat_snow(b, w, d, loc, th=0.12, nx=2, ny=2, seed=0, **k):
    blanket(b, lambda u, v: ((u - 0.5) * w, (v - 0.5) * d, 0.0), nx, ny, th=th, seed=seed, loc=loc, **k)


def gable(b, L, D, z0, H, m='tint_roof', over=0.5, snow=0.86, seed=1, strips=8, th=0.16, end='wood_d'):
    """용마루가 x 로 긴 맞배지붕. 골함석처럼 줄이 지고, 위에 눈이 덮인다(snow = 덮인 비율)."""
    hw = D / 2 + over
    b.prism([(-hw + 0.08, 0), (hw - 0.08, 0), (0, H - 0.06)], L - 0.24, (0, 0, z0), end, rot=(0, 0, PI / 2), jit=0.03)
    for s in (-1, 1):
        for i in range(strips):
            x0, x1 = -L / 2 + L * i / strips, -L / 2 + L * (i + 1) / strips
            b.grid(1, 1, lambda u, v, x0=x0, x1=x1, s=s: (x0 + (x1 - x0) * u, s * hw * (1 - v), z0 + H * v + 0.04), m, tone=1.0 if i % 2 else 0.86, jit=0.03)
    b.box((L + 0.1, 0.22, 0.12), (0, 0, z0 + H + 0.05), 'iron', jit=0.03)
    if snow > 0:
        blanket(b, lambda u, v: ((u - 0.5) * (L - 0.25), (2 * v - 1) * hw * snow, z0 + H * (1 - abs(2 * v - 1) * snow) + 0.05), 6, 4, th=th, seed=seed)


def hip(b, w, d, tw, td, h, z, m, **k):
    """네모뿔대(우진각 지붕 · 눈 더미)"""
    b.box((w, d, h), (0, 0, z + h / 2), m, f=lambda v: Vector((v.x * (tw / w if v.z > 0 else 1), v.y * (td / d if v.z > 0 else 1), v.z)), **k)


def icicles(b, x0, x1, y, z, n, seed=0):
    rr = random.Random(seed)
    for i in range(n):
        x, h = x0 + (x1 - x0) * (i + rr.random() * 0.7) / n, 0.16 + rr.random() * 0.3
        b.cone(0.004, 0.045, h, (x, y, z - h / 2), 'ice', seg=4, cap=False, jit=0.02)


def shutters(b, x0, x1, y, z0, h, n, m='plank', board=()):
    """닫힌 덧문 n 짝. board 에 든 짝은 널을 엇대어 못질했다."""
    bw = (x1 - x0) / n
    for i in range(n):
        x = x0 + bw * (i + 0.5)
        b.box((bw - 0.06, 0.08, h), (x, y, z0 + h / 2), m, tone=0.9 + 0.07 * ((i * 7) % 3), jit=0.06)
        b.box((bw - 0.06, 0.1, 0.07), (x, y - 0.012, z0 + h * 0.3), 'wood_d', jit=0)
        b.box((bw - 0.06, 0.1, 0.07), (x, y - 0.012, z0 + h * 0.78), 'wood_d', jit=0)
    for i in board:
        x = x0 + bw * (i + 0.5)
        b.box((bw * 1.25, 0.05, 0.15), (x, y - 0.08, z0 + h * 0.55), 'wood_l', rot=(0, 0.42, 0), jit=0.08)
        b.box((bw * 1.25, 0.05, 0.15), (x, y - 0.11, z0 + h * 0.5), 'wood_l', rot=(0, -0.42, 0), jit=0.08)


# ───── 읍내: 닫힌 가게 셋 · 먼 집 · 담 · 벽보 ─────
# 가게 1 — 널문 단층(양철 맞배)
b = B(); w, d, h, p = 7.0, 5.2, 2.7, 0.22
b.box((w + 0.3, d + 0.3, p), (0, 0, p / 2), 'stone', jit=0.08)
b.box((w, d, h), (0, 0, p + h / 2), 'tint_wall', jit=0.05)
for x in (-w / 2, w / 2):
    for y in (-d / 2, d / 2):
        b.box((0.2, 0.2, h), (x, y, p + h / 2), 'wood_d', jit=0.03)
b.box((w + 0.12, 0.16, 0.52), (0, -d / 2 - 0.02, p + h - 0.26), 'wood_d', jit=0.03)
b.box((3.2, 0.07, 0.36), (-0.9, -d / 2 - 0.12, p + h - 0.26), 'paper', jit=0.02)
shutters(b, -w / 2 + 0.15, w / 2 - 0.15, -d / 2 - 0.03, p + 0.04, h - 0.6, 5, board=(3,))
gable(b, w + 0.7, d, p + h, 1.35, seed=3)
b.box((0.42, 0.42, 1.3), (2.3, 1.1, p + h + 0.85), 'stone_d', jit=0.06)
flat_snow(b, 0.5, 0.5, (2.3, 1.1, p + h + 1.5), th=0.14, nx=1, ny=1, seed=2)
icicles(b, -w / 2, w / 2, -d / 2 - 0.5, p + h + 0.03, 9, seed=5)
blanket(b, lambda u, v: ((u - 0.5) * (w - 0.8), -d / 2 - 0.04 - v * 0.5, p * (1 - v)), 5, 1, th=0.2, seed=8)
b.done('rf_shop_a', smooth=0, shade=(0.76, 1.06), under=0.28)

# 가게 2 — 이층 목조(아래는 덧문, 위는 불 꺼진 창)
b = B(); w, d, h1, h2, p = 6.4, 5.2, 2.6, 2.2, 0.22
b.box((w + 0.3, d + 0.3, p), (0, 0, p / 2), 'stone', jit=0.08)
b.box((w, d, h1), (0, 0, p + h1 / 2), 'tint_wall', tone=0.9, jit=0.05)
b.box((w - 0.12, d - 0.12, h2), (0, 0, p + h1 + h2 / 2), 'tint_wall', jit=0.05)
for x in (-w / 2, w / 2):
    for y in (-d / 2, d / 2):
        b.box((0.2, 0.2, h1 + h2), (x, y, p + (h1 + h2) / 2), 'wood_d', jit=0.03)
b.box((w + 0.1, d + 0.1, 0.16), (0, 0, p + h1), 'wood_d', jit=0.03)
shutters(b, -w / 2 + 0.15, w / 2 - 0.15, -d / 2 - 0.03, p + 0.04, h1 - 0.5, 4, board=(0,))
b.grid(4, 1, lambda u, v: ((u - 0.5) * (w + 0.5), -d / 2 - 0.02 - v * 0.95, p + h1 + 0.3 - v * 0.42), 'tint_roof', jit=0.06)
blanket(b, lambda u, v: ((u - 0.5) * (w + 0.3), -d / 2 - 0.1 - v * 0.8, p + h1 + 0.29 - v * 0.36), 4, 1, th=0.12, seed=4)
for i, x in enumerate((-2.0, 0.0, 2.0)):
    zc = p + h1 + 1.15
    b.box((1.2, 0.06, 1.0), (x, -d / 2 + 0.04, zc), 'plank' if i == 1 else 'paper_d', jit=0.04)
    b.box((1.32, 0.09, 0.07), (x, -d / 2 + 0.03, zc + 0.5), 'wood_d', jit=0); b.box((1.32, 0.12, 0.08), (x, -d / 2 + 0.02, zc - 0.5), 'wood_d', jit=0)
    b.box((0.05, 0.09, 1.0), (x, -d / 2 + 0.03, zc), 'wood_d', jit=0); b.box((1.2, 0.09, 0.04), (x, -d / 2 + 0.03, zc + 0.1), 'wood_d', jit=0)
gable(b, w + 0.7, d - 0.1, p + h1 + h2, 1.25, m='tile', seed=11, end='tint_wall')
icicles(b, -w / 2, w / 2, -d / 2 - 0.45, p + h1 + h2 + 0.03, 8, seed=7)
b.done('rf_shop_b', smooth=0, shade=(0.74, 1.06), under=0.28)

# 가게 3 — 앞에 높은 간판 벽을 세운 가게(차양 · 널로 막은 창)
b = B(); w, d, h, p = 6.0, 5.2, 2.9, 0.22; yf = -d / 2
b.box((w + 0.3, d + 0.3, p), (0, 0, p / 2), 'stone', jit=0.08)
b.box((w, d, h), (0, 0, p + h / 2), 'tint_wall', jit=0.05)
b.box((w + 0.3, d + 0.2, 0.12), (0, 0.15, p + h + 0.26), 'tint_roof', rot=(-0.09, 0, 0), jit=0.05)
blanket(b, lambda u, v: ((u - 0.5) * (w - 0.1), yf + 0.3 + v * (d - 0.3), p + h + 0.55 - v * 0.46), 4, 3, th=0.18, seed=6)
b.box((w + 0.24, 0.22, 1.15), (0, yf + 0.02, p + h + 0.5), 'tint_wall', tone=1.06, jit=0.04)
b.box((w * 0.46, 0.24, 0.42), (0, yf + 0.02, p + h + 1.26), 'tint_wall', tone=1.06, jit=0.04)
b.box((w + 0.36, 0.3, 0.1), (0, yf + 0.02, p + h + 1.1), 'wood_d', jit=0.03); b.box((w * 0.46 + 0.14, 0.3, 0.09), (0, yf + 0.02, p + h + 1.5), 'wood_d', jit=0.03)
for x, ww in ((-w * 0.37, w * 0.24), (w * 0.37, w * 0.24)):
    flat_snow(b, ww, 0.3, (x, yf + 0.02, p + h + 1.15), th=0.12, nx=2, ny=1, seed=int(x * 9))
flat_snow(b, w * 0.46, 0.3, (0, yf + 0.02, p + h + 1.545), th=0.13, nx=2, ny=1, seed=31)
b.box((w * 0.62 + 0.14, 0.05, 0.74), (0, yf - 0.1, p + h + 0.5), 'wood_d', jit=0.02); b.box((w * 0.62, 0.06, 0.6), (0, yf - 0.12, p + h + 0.5), 'paper', jit=0.02)
b.box((1.1, 0.08, 2.05), (0, yf - 0.03, p + 1.03), 'wood', jit=0.06)
b.box((1.5, 0.05, 0.15), (0, yf - 0.09, p + 1.2), 'wood_l', rot=(0, 0.9, 0), jit=0.08); b.box((1.5, 0.05, 0.15), (0, yf - 0.12, p + 1.1), 'wood_l', rot=(0, -0.9, 0), jit=0.08)
for s in (-1, 1):
    b.box((1.6, 0.06, 1.25), (s * 1.95, yf - 0.02, p + 1.45), 'dark', jit=0)
    b.box((1.74, 0.1, 0.09), (s * 1.95, yf - 0.03, p + 2.1), 'wood_d', jit=0); b.box((1.74, 0.14, 0.1), (s * 1.95, yf - 0.03, p + 0.8), 'wood_d', jit=0)
    for k in range(3):
        b.box((1.8, 0.05, 0.17), (s * 1.95, yf - 0.07, p + 1.05 + k * 0.4), 'wood_l', rot=(0, (k - 1) * 0.1 * s, 0), jit=0.1)
b.grid(4, 2, lambda u, v: ((u - 0.5) * (w - 0.2), yf - 0.05 - v * 1.0, p + 2.62 - v * 0.4 - 0.07 * math.sin(u * PI) * v), 'tint_cloth', jit=0.05)
blanket(b, lambda u, v: ((u - 0.5) * (w - 0.5), yf - 0.12 - v * 0.8, p + 2.6 - v * 0.33 - 0.07 * math.sin(u * PI) * v), 4, 1, th=0.1, seed=9)
b.done('rf_shop_c', smooth=0, shade=(0.76, 1.06), under=0.28)

# 먼 집(가게 뒤 골목의 지붕들 — 면이 적다)
b = B()
b.box((5.0, 3.6, 2.2), (0, 0, 1.1), 'tint_wall', jit=0.06)
b.box((0.9, 0.06, 1.5), (-0.7, -1.81, 0.8), 'wood_d', jit=0.04); b.box((0.9, 0.06, 0.7), (1.2, -1.81, 1.35), 'paper_d', jit=0.03)
hip(b, 5.9, 4.5, 2.3, 0.3, 1.4, 2.2, 'tint_roof', jit=0.07)
hip(b, 5.4, 4.0, 2.1, 0.28, 1.3, 2.44, 'snow', jit=0.035)
b.box((0.4, 0.4, 1.3), (2.75, 0.6, 0.65), 'stone_d', jit=0.06)
b.done('rf_house', smooth=0, shade=(0.76, 1.06), under=0.28)

# 담(길이 4, x 로 길다) — 기와 얹은 흙담에 눈
b = B()
b.box((4.0, 0.5, 1.45), (0, 0, 0.72), 'tint_wall', jit=0.05)
for i in range(5):
    b.box((0.76, 0.6, 0.32), (-1.6 + i * 0.8, 0, 0.16), 'stone' if i % 2 else 'stone_d', jit=0.1)
b.prism([(-0.42, 0), (0.42, 0), (0, 0.3)], 4.0, (0, 0, 1.45), 'tile', rot=(0, 0, PI / 2), jit=0.06)
blanket(b, lambda u, v: ((u - 0.5) * 3.96, (2 * v - 1) * 0.36, 1.45 + 0.3 * (1 - abs(2 * v - 1) * 0.86)), 4, 2, th=0.12, seed=13)
b.done('rf_wall', smooth=0, shade=(0.76, 1.07), under=0.28)

# 벽보: 담에 붙은 쪽지들(가운데는 비워 둔다 — 내 쪽지 자리)
b = B(); rr = random.Random(3)
for i, (x, z) in enumerate([(-1.45, 1.05), (-0.95, 0.72), (-0.55, 1.12), (0.6, 1.1), (1.0, 0.7), (1.45, 1.08), (-1.9, 0.75), (1.9, 0.8)]):
    a = rr.uniform(-0.16, 0.16)
    b.box((0.3, 0.012, 0.4), (x, 0, z), 'paper' if i % 2 else 'white', rot=(0, a, 0), jit=0.05)
    for k in range(3):
        dz = 0.1 - k * 0.09
        b.box((0.2 - 0.04 * (k == 2), 0.014, 0.024), (x + dz * math.sin(a), -0.004, z + dz * math.cos(a)), 'ink', rot=(0, a, 0), jit=0)
b.done('rf_notes', smooth=0, shade=(0.94, 1.02), under=0.0)

# ───── 고갯길: 돌담 · 장독대 · 서낭당 돌무더기 ─────
b = B(); rr = random.Random(9)
for j in range(3):
    n = 7 if j % 2 == 0 else 6
    for i in range(n):
        w0 = 4.0 / n
        b.box((w0 * rr.uniform(0.86, 1.0), rr.uniform(0.5, 0.62), 0.36), (-2 + w0 * (i + 0.5), rr.uniform(-0.03, 0.03), 0.18 + j * 0.34), 'stone' if (i + j) % 2 else 'stone_d', rot=(0, 0, rr.uniform(-0.08, 0.08)), jit=0.14)
flat_snow(b, 3.96, 0.56, (0, 0, 1.03), th=0.15, nx=4, ny=1, seed=17)
b.done('rf_doldam', smooth=0, shade=(0.72, 1.08), under=0.3)


def jar(b, x, y, s, m):
    b.lathe([(0.2 * s, 0), (0.38 * s, 0.16 * s), (0.44 * s, 0.44 * s), (0.38 * s, 0.72 * s), (0.27 * s, 0.86 * s), (0.3 * s, 0.92 * s)], (x, y, 0.22), m, seg=8, jit=0.05)
    b.lathe([(0.34 * s, 0.92 * s), (0.25 * s, 1.04 * s), (0.05 * s, 1.1 * s)], (x, y, 0.22), 'snow', seg=8, jit=0.03)


b = B()
b.box((2.6, 1.7, 0.22), (0, 0, 0.11), 'stone', bevel=0.05, jit=0.1)
for x, y, s, m in [(-0.8, 0.3, 1.1, 'onggi'), (0.05, 0.4, 1.25, 'onggi'), (0.85, 0.3, 0.95, 'onggi_l'), (-0.45, -0.4, 0.7, 'onggi_l'), (0.4, -0.45, 0.75, 'onggi')]:
    jar(b, x, y, s, m)
flat_snow(b, 0.7, 0.5, (1.0, -0.55, 0.22), th=0.1, nx=1, ny=1, seed=3)
b.done('rf_jangdok', smooth=35, shade=(0.7, 1.08))

b = B(); rr = random.Random(4)
for n, rad, z in [(7, 0.85, 0.2), (5, 0.5, 0.55), (3, 0.24, 0.9), (1, 0.0, 1.2)]:
    for i in range(n):
        a = i * 2 * PI / n + z
        b.ball(rr.uniform(0.3, 0.4), (math.cos(a) * rad, math.sin(a) * rad, z), 'stone' if (i + n) % 2 else 'stone_d', sub=1, scale=(1.2, 1.0, 0.72), rot=(0, 0, rr.random() * 3), jit=0.12)
for x, y, z, s in [(0, 0, 1.42, 1.0), (0.35, 0.2, 1.08, 0.8), (-0.5, -0.3, 0.75, 0.9), (0.7, -0.5, 0.4, 0.9), (-0.8, 0.5, 0.4, 0.8)]:
    b.ball(0.3 * s, (x, y, z), 'snow', sub=1, scale=(1.3, 1.2, 0.4), jit=0.03)
b.done('rf_cairn', smooth=0, shade=(0.68, 1.08), under=0.3)

# ───── 짐: 솥 · 이불 · 사진첩 · 책보 · 가방 ─────
b = B()
b.lathe([(0.2, 0.0), (0.34, 0.08), (0.4, 0.24), (0.38, 0.34), (0.45, 0.36), (0.45, 0.4)], (0, 0, 0), 'iron', seg=10, jit=0.05)
b.lathe([(0.41, 0.4), (0.27, 0.48), (0.08, 0.51), (0.08, 0.57), (0.03, 0.58)], (0, 0, 0), 'iron_l', seg=10, jit=0.05)
for s in (-1, 1):
    b.box((0.14, 0.09, 0.05), (s * 0.48, 0, 0.37), 'iron', jit=0)
b.done('rf_pot', smooth=30, shade=(0.74, 1.12))

b = B()
b.box((1.0, 0.68, 0.2), (0, 0, 0.1), 'tint_cloth', bevel=0.07, bseg=2, jit=0.05)
b.box((0.94, 0.62, 0.08), (0.02, 0.0, 0.23), 'white', jit=0.03)
b.box((1.0, 0.68, 0.2), (0, 0, 0.36), 'tint_cloth', bevel=0.07, bseg=2, jit=0.05)
b.box((0.2, 0.7, 0.02), (0, 0, 0.465), 'green', jit=0.03)
for x in (-0.3, 0.3):
    b.box((0.05, 0.72, 0.5), (x, 0, 0.24), 'rope', jit=0.04)
b.done('rf_quilt', smooth=40, shade=(0.74, 1.08))

b = B()
b.box((0.5, 0.38, 0.02), (0, 0, 0.01), 'brown', jit=0.04); b.box((0.46, 0.35, 0.08), (0.015, 0, 0.06), 'paper', jit=0.03); b.box((0.5, 0.38, 0.02), (0, 0, 0.11), 'brown', jit=0.04)
b.box((0.03, 0.38, 0.12), (-0.25, 0, 0.06), 'brown_d', jit=0)
b.box((0.22, 0.17, 0.012), (0.04, 0, 0.126), 'paper', rot=(0, 0, 0.12)); b.box((0.16, 0.11, 0.014), (0.04, 0, 0.128), 'photo', rot=(0, 0, 0.12))
b.done('rf_album', smooth=0, shade=(0.8, 1.08))

b = B()
b.box((0.5, 0.34, 0.2), (0, 0, 0.11), 'paper', jit=0.04)
for z, m in ((0.01, 'brown'), (0.075, 'green'), (0.14, 'brown_d'), (0.21, 'brown')):
    b.box((0.52, 0.36, 0.016), (0, 0, z), m, jit=0.03)
b.box((0.3, 0.4, 0.25), (0, 0, 0.115), 'tint_cloth', bevel=0.03, jit=0.05)
b.ball(0.07, (0, 0, 0.27), 'tint_cloth', sub=1, tone=0.85, scale=(1.6, 1, 0.8)); b.box((0.2, 0.05, 0.03), (0, 0.04, 0.3), 'tint_cloth', tone=0.9, rot=(0, 0.5, 0.5))
b.done('rf_books', smooth=0, shade=(0.8, 1.08))

b = B()
b.box((0.85, 0.28, 0.55), (0, 0, 0.3), 'brown', bevel=0.03, jit=0.05)
for x in (-0.24, 0.24):
    b.box((0.06, 0.3, 0.57), (x, 0, 0.3), 'brown_d', jit=0)
b.box((0.26, 0.04, 0.04), (0, 0, 0.62), 'brown_d'); b.box((0.04, 0.04, 0.06), (-0.12, 0, 0.59), 'brown_d'); b.box((0.04, 0.04, 0.06), (0.12, 0, 0.59), 'brown_d')
b.done('rf_suitcase', smooth=0, shade=(0.78, 1.08))

# ───── 강: 끊어진 다리 · 나루터 · 눈 쓴 볏가리 · 얼음 조각 · 눈 더미 ─────
# 끊어진 다리 — 원점 = 여울 한가운데(장면에서 x 16, z 81). three 의 z 는 여기서 -y. 가운데 칸이 내려앉았다.
b = B(); rr = random.Random(21)
for dz in (-5.0, 5.0):
    for s in (-1, 1):
        b.box((1.5, 1.8, 0.4), (s * 2.4, -dz, 0.1), 'conc_d', bevel=0.07, jit=0.08)
        b.box((1.0, 1.15, 2.75), (s * 2.4, -dz, 1.4), 'conc', jit=0.07, f=lambda v: Vector((v.x * (1 - 0.06 * (v.z + 1.375) / 2.75), v.y * (1 - 0.1 * (v.z + 1.375) / 2.75), v.z)))
        flat_snow(b, 0.5, 1.5, (s * 3.0, -dz, 0.3), th=0.1, nx=1, ny=2, seed=int(dz + s))
    b.box((6.5, 1.35, 0.5), (0, -dz, 2.98), 'conc_d', bevel=0.05, jit=0.06)


def span(b, z0, z1, ends, seed):
    r = random.Random(seed)
    for x in (-2.25, 0.0, 2.25):
        a, c = z0 + (r.uniform(0.0, 1.2) if ends[0] else 0), z1 - (r.uniform(0.0, 1.2) if ends[1] else 0)
        b.box((0.5, c - a - 0.5, 0.42), (x, -(a + c) / 2, 3.44), 'conc_d', jit=0.05)
        b.box((2.24, c - a, 0.26), (x, -(a + c) / 2, 3.78), 'conc', jit=0.06)
        for e, zz, sg in ((ends[0], a, -1), (ends[1], c, 1)):
            if e:
                for i in range(3):
                    ln = 0.6 + r.random() * 0.6
                    b.box((0.035, ln, 0.035), (x - 0.7 + i * 0.7, -(zz + sg * ln * 0.4), 3.74 - r.random() * 0.2), 'rust', rot=(sg * (0.25 + r.random() * 0.5), 0, r.uniform(-0.3, 0.3)), jit=0)
    a, c = z0 + (1.3 if ends[0] else 0.1), z1 - (1.3 if ends[1] else 0.1)
    for s in (-1, 1):
        b.box((0.3, c - a + 0.2, 0.16), (s * 3.2, -(a + c) / 2, 3.99), 'conc_d', jit=0.04)
        n = max(2, int((c - a) / 1.3))
        for i in range(n + 1):
            b.box((0.2, 0.2, 0.75), (s * 3.2, -(a + (c - a) * i / n), 4.44), 'conc', jit=0.05)
        b.box((0.16, c - a + 0.2, 0.14), (s * 3.2, -(a + c) / 2, 4.85), 'conc', jit=0.04)
    blanket(b, lambda u, v: ((u - 0.5) * 5.9, -(a - 0.1 + (c - a + 0.2) * v), 3.91), 3, 4, th=0.17, seed=seed)


span(b, 2.6, 9.4, (True, True), 3)
span(b, -8.6, -2.5, (True, True), 8)
# 내려앉은 조각: 물에 비스듬히 박힌 바닥판 · 들보 · 부스러기(여울 길 x ±3.4 안쪽은 비운다)
b.box((2.3, 3.6, 0.28), (4.5, -0.4, 0.62), 'conc', rot=(0.34, -0.5, 0.2), jit=0.07)
blanket(b, lambda u, v: ((u - 0.5) * 2.24, (v - 0.5) * 3.54, 0.14), 2, 2, th=0.12, seed=5, loc=(4.5, -0.4, 0.62), rot=(0.34, -0.5, 0.2))
b.box((0.5, 3.2, 0.42), (-4.6, 1.2, 0.3), 'conc_d', rot=(0.16, 0.2, 1.0), jit=0.06)
b.box((2.2, 4.2, 0.26), (-4.6, -9.0, 0.56), 'conc', rot=(0.27, 0.06, 0.16), jit=0.07)
blanket(b, lambda u, v: ((u - 0.5) * 2.14, (v - 0.5) * 4.14, 0.13), 2, 2, th=0.12, seed=6, loc=(-4.6, -9.0, 0.56), rot=(0.27, 0.06, 0.16))
for i in range(9):
    s = -1 if i % 2 else 1
    x, y, sz = s * rr.uniform(3.7, 5.4), rr.uniform(-7.5, 7.5), rr.uniform(0.45, 1.0)
    b.box((sz, sz * rr.uniform(0.7, 1.3), sz * 0.6), (x, y, sz * 0.18), 'conc' if i % 3 else 'conc_d', rot=(rr.uniform(-0.4, 0.4), rr.uniform(-0.4, 0.4), rr.random() * 3), bevel=0.05, jit=0.1)
    b.ball(sz * 0.36, (x, y, sz * 0.5), 'snow', sub=1, scale=(1.3, 1.2, 0.4), jit=0.03)
b.done('rf_bridge', smooth=0, shade=(0.7, 1.06), under=0.3)

# 나루터(4 x 5) — 물 쪽 끝이 +y(three 에서 -z). 널을 깐 낮은 바닥과 말뚝.
b = B(); rr = random.Random(5)
for i in range(10):
    b.box((4.0 + rr.uniform(-0.15, 0.1), 0.46, 0.08), (rr.uniform(-0.05, 0.05), -2.25 + i * 0.5, 0.12), 'wood_l' if i % 3 else 'wood', rot=(0, 0, rr.uniform(-0.02, 0.02)), jit=0.1)
for x in (-1.7, 1.7):
    b.box((0.16, 5.0, 0.14), (x, 0, 0.03), 'wood_d', jit=0.04)
for x in (-1.95, 1.95):
    b.cone(0.12, 0.1, 1.3, (x, 2.3, 0.4), 'wood_d', seg=6, jit=0.06); b.ball(0.13, (x, 2.3, 1.07), 'snow', sub=1, scale=(1.1, 1.1, 0.6), jit=0.03)
    b.cone(0.11, 0.09, 0.7, (x, 0.4, 0.2), 'wood_d', seg=6, jit=0.06); b.ball(0.12, (x, 0.4, 0.57), 'snow', sub=1, scale=(1.1, 1.1, 0.6), jit=0.03)
b.lathe([(0.2, 0.16), (0.3, 0.2), (0.3, 0.26), (0.2, 0.3)], (1.25, 1.5, 0), 'rope', seg=8, jit=0.06)
flat_snow(b, 1.5, 1.9, (-1.15, -1.3, 0.16), th=0.1, seed=2); flat_snow(b, 1.0, 1.2, (1.35, -0.4, 0.16), th=0.08, seed=4)
b.done('rf_dock', smooth=0, shade=(0.8, 1.06), under=0.2)

b = B()
b.lathe([(1.0, 0), (1.05, 0.5), (0.85, 1.3), (0.3, 2.0), (0.04, 2.25)], (0, 0, 0), 'straw', seg=9, jit=0.14)
b.lathe([(0.9, 1.22), (0.92, 1.3)], (0, 0, 0), 'straw_d', seg=9, cap=False)
b.lathe([(0.8, 1.42), (0.74, 1.56), (0.33, 2.06), (0.05, 2.33)], (0, 0, 0), 'snow', seg=9, jit=0.035)
b.done('rf_stack', smooth=0, shade=(0.66, 1.08))

b = B()
b.lathe([(1.0, 0.0), (1.06, 0.14), (0.94, 0.2)], (0, 0, 0), 'ice', seg=7, jit=0.06, f=lambda v: Vector((v.x * (1 + 0.22 * math.sin(3 * math.atan2(v.y, v.x))), v.y * (1 + 0.18 * math.cos(2 * math.atan2(v.y, v.x))), v.z)))
b.done('rf_floe', smooth=0, shade=(0.86, 1.04), under=0.1)


def drift(name, rx, ry, h, seed):
    b = B(); r = random.Random(seed); n = 8
    rad, top = [r.uniform(0.78, 1.1) for _ in range(n)], [r.uniform(0.7, 1.0) for _ in range(n)]

    def fn(u, v):
        i, j = round(u * n) % n, round(v * 3)
        a = i * 2 * PI / n
        k = [1.0, 0.74, 0.38, 0.0][j]
        return (math.cos(a) * rx * k * rad[i], math.sin(a) * ry * k * rad[i], [0.0, 0.5, 0.9, 1.0][j] * h * (top[i] if j in (1, 2) else 1))
    b.grid(n, 3, fn, 'snow', jit=0.04)
    b.done(name, smooth=0, shade=(0.87, 1.03), under=0.1)


drift('rf_drift', 1.6, 1.1, 0.42, 1)
drift('rf_drift_l', 3.2, 0.8, 0.5, 2)

# ───── 천막촌: 천막 둘 · 판잣집 · 천막 교실 · 화덕 ─────
# 천막 1 — 맞배 천막(용마루가 y 로 길다, 문은 -y). 한쪽 자락이 걷혀 안의 불빛이 보인다.
b = B(); L, hw, H = 3.8, 2.1, 2.25
for s in (-1, 1):
    for i in range(3):
        y0, y1 = -L / 2 + L * i / 3, -L / 2 + L * (i + 1) / 3
        b.grid(1, 2, lambda u, v, y0=y0, y1=y1, s=s: (s * (hw * (1 - v) + 0.12 * v - 0.07 * math.sin(v * PI)), y0 + (y1 - y0) * u, H * v), 'canvas', tone=1.0 if (i + (s > 0)) % 2 else 0.9, jit=0.04)
    px, pz = s * (hw * 0.55 + 0.12 * 0.45 + 0.03), H * 0.45 + 0.03
    b.box((0.55, 0.6, 0.02), (px, 0.5 * s, pz), 'patch', rot=(0, s * 0.849, 0), jit=0.04)
    blanket(b, lambda u, v, s=s: (s * (hw - 0.1 + v * 0.55), (u - 0.5) * (L - 0.4), 0.3 * (1 - v)), 3, 1, th=0.15, seed=30 + s)
    for y in (-1.3, 0, 1.3):
        b.box((0.05, 0.05, 0.3), (s * (hw + 0.2), y, 0.1), 'wood_l', rot=(0, s * 0.5, 0), jit=0.05)
b.prism([(-hw, 0), (hw, 0), (0.12, H), (-0.12, H)], 0.04, (0, L / 2, 0), 'canvas_d', jit=0.03)
b.prism([(-hw, 0), (-0.12, 0), (-0.03, H * 0.96), (-0.12, H)], 0.04, (0, -L / 2, 0), 'canvas_d', jit=0.03)
b.prism([(0.8, 0), (hw, 0), (0.12, H), (0.05, H * 0.9)], 0.04, (0, -L / 2, 0), 'canvas_d', jit=0.03)
b.prism([(-0.12, 0), (0.8, 0), (0.05, H * 0.9), (-0.03, H * 0.96)], 0.03, (0, -L / 2 + 0.08, 0), 'glow_win', jit=0)
b.box((0.3, 0.05, 1.5), (0.62, -L / 2 - 0.03, 0.8), 'canvas', rot=(0, -0.42, 0), jit=0.04)
for y in (-L / 2 - 0.03, L / 2 + 0.03):
    b.box((0.07, 0.07, H + 0.25), (0, y, (H + 0.25) / 2), 'wood_d', jit=0.03)
blanket(b, lambda u, v: ((1 if v > 0.5 else -1) * (0.12 + (hw - 0.12) * abs(2 * v - 1) * 0.62) if abs(2 * v - 1) > 0.01 else 0.0, (u - 0.5) * (L - 0.2), H * (1 - abs(2 * v - 1) * 0.62) + 0.02), 3, 4, th=0.14, seed=22)
b.cone(0.07, 0.07, 1.3, (0.9, 0.9, 1.85), 'iron', seg=6, jit=0.04); b.cone(0.14, 0.03, 0.12, (0.9, 0.9, 2.56), 'iron', seg=6)
b.done('rf_tent', smooth=0, shade=(0.74, 1.06), under=0.25)

# 천막 2 — 낮은 벽이 선 천막(기운 자국 · 연통)
b = B(); L, hw, E, H = 3.8, 1.9, 1.0, 2.3
for s in (-1, 1):
    b.box((0.04, L, E), (s * hw, 0, E / 2), 'canvas_d', jit=0.05)
    for i in range(3):
        y0, y1 = -L / 2 - 0.1 + (L + 0.2) * i / 3, -L / 2 - 0.1 + (L + 0.2) * (i + 1) / 3
        b.grid(1, 2, lambda u, v, y0=y0, y1=y1, s=s: (s * ((hw + 0.22) * (1 - v) + 0.1 * v), y0 + (y1 - y0) * u, E - 0.08 + (H - E + 0.08) * v - 0.06 * math.sin(v * PI)), 'canvas', tone=0.9 if (i + (s > 0)) % 2 else 1.0, jit=0.04)
    blanket(b, lambda u, v, s=s: (s * (hw + 0.02 + v * 0.5), (u - 0.5) * (L - 0.4), 0.32 * (1 - v)), 3, 1, th=0.14, seed=40 + s)
b.box((0.5, 0.02, 0.5), (-hw - 0.03, 0.6, 0.55), 'patch', rot=(0, 0, PI / 2), jit=0.04)
b.prism([(-hw, 0), (hw, 0), (hw, E), (0, H - 0.04), (-hw, E)], 0.04, (0, L / 2, 0), 'canvas_d', jit=0.03)
b.prism([(-hw, 0), (-0.55, 0), (-0.55, 1.75), (0, H - 0.04), (-hw, E)], 0.04, (0, -L / 2, 0), 'canvas_d', jit=0.03)
b.prism([(0.55, 0), (hw, 0), (hw, E), (0, H - 0.04), (0.55, 1.75)], 0.04, (0, -L / 2, 0), 'canvas_d', jit=0.03)
b.prism([(-0.55, 0), (0.55, 0), (0.55, 1.75), (-0.55, 1.75)], 0.03, (0, -L / 2 + 0.08, 0), 'dark', jit=0)
b.prism([(-0.55, 0), (-0.1, 0), (-0.25, 1.75), (-0.55, 1.75)], 0.03, (0, -L / 2 + 0.05, 0), 'glow_win', jit=0)
b.cone(0.1, 0.1, 1.1, (0, -L / 2 - 0.06, 1.84), 'canvas', seg=6, rot=(0, PI / 2, 0), jit=0.04)
blanket(b, lambda u, v: ((1 if v > 0.5 else -1) * (0.1 + (hw + 0.12) * abs(2 * v - 1) * 0.7) if abs(2 * v - 1) > 0.01 else 0.0, (u - 0.5) * (L - 0.1), E - 0.08 + (H - E + 0.08) * (1 - abs(2 * v - 1) * 0.7) + 0.02), 3, 4, th=0.14, seed=26)
b.cone(0.07, 0.07, 1.2, (-1.0, 0.9, 2.1), 'iron', seg=6, jit=0.04); b.cone(0.14, 0.03, 0.12, (-1.0, 0.9, 2.76), 'iron', seg=6)
b.done('rf_tent_b', smooth=0, shade=(0.74, 1.06), under=0.25)

# 판잣집 — 널을 이어 붙인 벽에 양철 외쪽 지붕(돌로 눌러 놓았다)
b = B(); rr = random.Random(12); w, d, hf, hb = 3.4, 3.0, 2.3, 1.85; PL = ['plank', 'plank_g', 'wood_l', 'wood', 'plank']
n = 9
for i in range(n):
    x = -w / 2 + w * (i + 0.5) / n
    if i not in (3, 4):
        hh = hf + rr.uniform(-0.05, 0.05); b.box((w / n - 0.02, 0.06, hh), (x, -d / 2, hh / 2), rr.choice(PL), jit=0.08)
    hh = hb + rr.uniform(-0.05, 0.05); b.box((w / n - 0.02, 0.06, hh), (x, d / 2, hh / 2), rr.choice(PL), jit=0.08)
n = 7
for i in range(n):
    y = -d / 2 + d * (i + 0.5) / n; hh = hf + (hb - hf) * (i + 0.5) / n
    for s in (-1, 1):
        b.box((0.06, d / n - 0.02, hh), (s * w / 2, y, hh / 2), rr.choice(PL), jit=0.08)
xd = -w / 2 + w * 4 / 9
b.box((w * 2 / 9 + 0.1, 0.07, 0.4), (xd, -d / 2, hf - 0.2), 'wood_d', jit=0.04)
b.box((0.7, 0.05, 1.75), (xd - 0.02, -d / 2 - 0.03, 0.9), 'straw', jit=0.1); b.box((0.72, 0.07, 0.06), (xd - 0.02, -d / 2 - 0.03, 1.4), 'straw_d', jit=0)
b.box((0.07, 0.03, 1.6), (xd + 0.36, -d / 2 + 0.01, 0.85), 'glow_win', jit=0)
b.box((0.5, 0.05, 0.4), (1.05, -d / 2 - 0.03, 1.5), 'glow_win', jit=0); b.box((0.58, 0.07, 0.05), (1.05, -d / 2 - 0.04, 1.5), 'wood_d', jit=0); b.box((0.05, 0.07, 0.4), (1.05, -d / 2 - 0.04, 1.5), 'wood_d', jit=0)
ang = -math.atan((hf - hb) / d)
b.box((w + 0.5, d + 0.7, 0.06), (0, 0, (hf + hb) / 2 + 0.07), 'tint_roof', rot=(ang, 0, 0), jit=0.06)
blanket(b, lambda u, v: ((u - 0.5) * (w + 0.2), (v - 0.5) * (d + 0.3), 0.04), 3, 3, th=0.15, seed=14, loc=(0, 0, (hf + hb) / 2 + 0.07), rot=(ang, 0, 0))
for x, y in ((-1.2, -0.9), (1.0, 0.6), (0.2, -0.2)):
    b.ball(0.2, (x, y, (hf + hb) / 2 + 0.3 - y * (hf - hb) / d), 'stone_d', sub=1, scale=(1.2, 1, 0.7), jit=0.1)
b.cone(0.07, 0.07, 1.5, (w / 2 + 0.2, 0.4, 1.95), 'iron', seg=6, jit=0.04); b.cone(0.07, 0.07, 0.3, (w / 2 + 0.1, 0.4, 1.25), 'iron', seg=6, rot=(0, PI / 2, 0)); b.cone(0.14, 0.03, 0.12, (w / 2 + 0.2, 0.4, 2.76), 'iron', seg=6)
blanket(b, lambda u, v: ((u - 0.5) * (w - 0.3), d / 2 + 0.03 + v * 0.5, 0.3 * (1 - v)), 3, 1, th=0.14, seed=15)
b.done('rf_shack', smooth=0, shade=(0.72, 1.06), under=0.25)

# 먼 천막 · 먼 판잣집(길 밖 뒤쪽 겹 — 면이 적다)
b = B(); L, hw, H = 3.8, 2.1, 2.25
b.prism([(-hw, 0), (hw, 0), (0.12, H), (-0.12, H)], L, (0, 0, 0), 'canvas', jit=0.07)
b.prism([(-hw * 0.66, H * 0.36), (hw * 0.66, H * 0.36), (0.15, H + 0.08), (-0.15, H + 0.08)], L - 0.16, (0, 0, 0.07), 'snow', jit=0.035)
b.prism([(-0.5, 0), (0.5, 0), (0.04, H * 0.82)], 0.05, (0, -L / 2 - 0.01, 0), 'dark', jit=0)
b.prism([(0.04, 0), (0.34, 0), (0.05, H * 0.7)], 0.03, (0, -L / 2 - 0.04, 0), 'glow_win', jit=0)
b.box((0.07, 0.07, H + 0.25), (0, -L / 2 - 0.05, (H + 0.25) / 2), 'wood_d', jit=0.03)
b.done('rf_tent_far', smooth=0, shade=(0.74, 1.06), under=0.25)
b = B(); w, d, hf, hb = 3.4, 3.0, 2.3, 1.85
b.box((w, d, 2.05), (0, 0, 1.02), 'plank', jit=0.1, f=lambda v: Vector((v.x, v.y, v.z + (0.22 if v.y < 0 else -0.2) * (1 if v.z > 0 else 0))))
b.box((w * 0.45, 0.03, 2.0), (0.7, -d / 2 - 0.01, 1.0), 'plank_g', jit=0.06); b.box((0.7, 0.05, 1.7), (-0.4, -d / 2 - 0.03, 0.87), 'straw', jit=0.08)
b.box((0.5, 0.04, 0.4), (1.0, -d / 2 - 0.04, 1.5), 'glow_win', jit=0)
ang = -math.atan((hf - hb) / d)
b.box((w + 0.5, d + 0.7, 0.06), (0, 0, (hf + hb) / 2 + 0.07), 'tint_roof', rot=(ang, 0, 0), jit=0.06)
b.box((w + 0.2, d + 0.3, 0.14), (0, 0, (hf + hb) / 2 + 0.17), 'snow', rot=(ang, 0, 0), jit=0.035)
b.cone(0.07, 0.07, 1.5, (w / 2 + 0.2, 0.4, 1.95), 'iron', seg=5, jit=0.04)
b.done('rf_shack_far', smooth=0, shade=(0.72, 1.06), under=0.25)

# 천막 교실 — 뒤(북, +y)에 천 벽과 외쪽 천 지붕, 앞(남, -y)은 한데. 눈을 치운 자리에 멍석을 깔고 아이들이 앉는다. 칠판 · 교탁 · 화로 · 종 · 팻말.
b = B(); W2, YB, YF, HB, HF = 2.45, 3.15, 0.2, 2.0, 3.25


def rz(v):
    return HF + 0.06 + (HB - HF) * v - 0.12 * math.sin(v * PI)


for x in (-W2, 0, W2):
    b.cone(0.07, 0.06, HB, (x, YB, HB / 2), 'wood_d', seg=6, jit=0.05)
for x in (-W2, W2):
    b.cone(0.08, 0.07, HF, (x, YF, HF / 2), 'wood_d', seg=6, jit=0.05)
    b.box((0.07, math.hypot(YB - YF, HF - HB), 0.07), (x, (YB + YF) / 2, (HB + HF) / 2), 'wood', rot=(-math.atan((HF - HB) / (YB - YF)), 0, 0), jit=0.04)
    b.box((0.025, 0.025, 3.6), (x * 1.12, YF - 1.25, HF / 2 + 0.05), 'rope', rot=(-0.72, 0, 0), jit=0)
    b.box((0.06, 0.06, 0.3), (x * 1.12, YF - 2.42, 0.1), 'wood_l', rot=(0.4, 0, 0), jit=0.05)
b.box((2 * W2 + 0.5, 0.1, 0.1), (0, YF, HF), 'wood_d', jit=0.04); b.box((2 * W2 + 0.3, 0.09, 0.09), (0, YB, HB), 'wood', jit=0.04)
for i in range(4):
    x0, x1 = -W2 - 0.25 + (2 * W2 + 0.5) * i / 4, -W2 - 0.25 + (2 * W2 + 0.5) * (i + 1) / 4
    b.grid(1, 3, lambda u, v, x0=x0, x1=x1: (x0 + (x1 - x0) * u, YF - 0.35 + (YB + 0.25 - YF + 0.35) * v, rz(v)), 'canvas', tone=1.0 if i % 2 else 0.9, jit=0.04)
b.box((2 * W2 + 0.5, 0.03, 0.3), (0, YF - 0.36, HF - 0.1), 'canvas_d', jit=0.04)
b.box((2 * W2, 0.04, HB - 0.05), (0, YB, (HB - 0.05) / 2), 'canvas_d', jit=0.05)
b.box((0.9, 0.02, 0.7), (1.5, YB + 0.03, 1.1), 'patch', jit=0.04)
for s in (-1, 1):
    y0 = 1.5
    b.prism([(y0, 0), (YB, 0), (YB, HB), (y0, HF + (HB - HF) * (y0 - YF) / (YB - YF))], 0.04, (s * W2, 0, 0), 'canvas_d', rot=(0, 0, PI / 2), jit=0.04)
    blanket(b, lambda u, v, s=s: (s * (2.22 + v * 0.42), -3.1 + u * 4.4, 0.0), 3, 1, th=0.26, seed=50 + s)
blanket(b, lambda u, v: ((u - 0.5) * 5.2, -3.0 - v * 0.32, 0.0), 4, 1, th=0.26, seed=57)
for i in range(2):
    for j in range(3):
        b.box((2.12, 1.95, 0.04), (-1.08 + i * 2.16, -2.0 + j * 2.0, 0.03), 'straw' if (i + j) % 2 else 'straw_d', jit=0.08)
b.box((2.5, 0.07, 1.3), (0, YB - 0.1, 1.32), 'wood_d', jit=0.03); b.box((2.3, 0.05, 1.1), (0, YB - 0.15, 1.32), 'board', jit=0.03)
for x, z, ww in ((-0.4, 1.62, 1.2), (-0.6, 1.4, 0.8), (-0.3, 1.18, 1.0), (0.75, 1.05, 0.4)):
    b.box((ww, 0.02, 0.045), (x, YB - 0.18, z), 'white', jit=0)
b.box((0.9, 0.5, 0.72), (-1.6, YB - 0.85, 0.4), 'wood', bevel=0.02, jit=0.05); b.box((1.0, 0.6, 0.05), (-1.6, YB - 0.85, 0.78), 'wood_l', jit=0.04)
b.box((0.3, 0.22, 0.06), (-1.6, YB - 0.85, 0.83), 'paper', rot=(0, 0, 0.2), jit=0.03)
b.lathe([(0.15, 0.04), (0.27, 0.2), (0.25, 0.32)], (1.95, YB - 0.7, 0), 'iron', seg=8, jit=0.05); b.cone(0.22, 0.22, 0.03, (1.95, YB - 0.7, 0.3), 'glow_win', seg=8)
for a in range(3):
    b.box((0.04, 0.04, 0.2), (1.95 + math.cos(a * 2.1) * 0.16, YB - 0.7 + math.sin(a * 2.1) * 0.16, 0.1), 'iron', jit=0)
b.box((0.45, 0.05, 0.05), (W2 - 0.24, YF - 0.05, HF - 0.75), 'wood_d', jit=0)
b.lathe([(0.14, 0.0), (0.13, 0.12), (0.07, 0.2), (0.02, 0.23)], (W2 - 0.42, YF - 0.05, HF - 1.0), 'bronze', seg=8, jit=0.04)
b.box((1.8, 0.06, 0.44), (0, YF - 0.42, HF - 0.52), 'wood_l', jit=0.05); b.box((1.5, 0.02, 0.3), (0, YF - 0.46, HF - 0.52), 'paper', jit=0.02)
for i in range(4):
    x = -0.52 + i * 0.35
    b.box((0.17, 0.02, 0.05), (x, YF - 0.475, HF - 0.44), 'ink', jit=0); b.box((0.05, 0.02, 0.17), (x - 0.03, YF - 0.475, HF - 0.54), 'ink', jit=0); b.box((0.15, 0.02, 0.045), (x + 0.01, YF - 0.475, HF - 0.61), 'ink', jit=0)
blanket(b, lambda u, v: ((u - 0.5) * (2 * W2 + 0.3), YF - 0.2 + (YB - YF + 0.3) * v, rz((0.15 + (YB - YF + 0.3) * v) / (YB + 0.25 - YF + 0.35)) + 0.02), 4, 3, th=0.15, seed=28)
b.done('rf_class', smooth=0, shade=(0.76, 1.06), under=0.22)

# 화덕(돌 여섯 · 재 · 장작)
b = B()
for i in range(6):
    a = i * 1.05
    b.ball(0.15, (math.cos(a) * 0.42, math.sin(a) * 0.42, 0.08), 'stone' if i % 2 else 'stone_d', sub=1, scale=(1.2, 1, 0.8), jit=0.1)
b.cone(0.3, 0.26, 0.04, (0, 0, 0.03), 'ink', seg=8)
for i in range(3):
    b.cone(0.05, 0.045, 0.7, (0, 0, 0.12), 'wood_d' if i % 2 else 'wood', seg=5, rot=(0, 1.35, i * 1.1 + 0.2), jit=0.08)
b.done('rf_hearth', smooth=0, shade=(0.7, 1.08))

# ───── 인파(앞 = +y) — 몸(옷 색은 장면이 사람마다 입힌다) · 머리와 손 · 등짐 ─────
b = B()
b.box((0.2, 0.26, 0.62), (-0.15, 0.07, 0.31), 'cwhite', tone=0.5, jit=0.04)
b.box((0.2, 0.26, 0.62), (0.15, -0.07, 0.31), 'cwhite', tone=0.5, jit=0.04)
b.box((0.62, 0.4, 0.5), (0, 0, 0.75), 'cwhite', tone=0.9, f=lambda v: Vector((v.x * (1.14 if v.z < 0 else 0.98), v.y * (1.18 if v.z < 0 else 1.0), v.z)), jit=0.04)
b.box((0.6, 0.38, 0.44), (0, 0, 1.2), 'cwhite', jit=0.04, f=lambda v: Vector((v.x * (0.9 if v.z > 0 else 1.0), v.y * (0.9 if v.z > 0 else 1.0), v.z)))
for s in (-1, 1):
    b.box((0.16, 0.2, 0.56), (s * 0.38, 0.07, 1.1), 'cwhite', tone=0.95, rot=(-0.28, 0, 0), jit=0.04)
b.done('rf_cbody', origin=(0, 0, 0.95), smooth=0, shade=(0.74, 1.05), under=0.2)
b = B()
b.box((0.42, 0.4, 0.44), (0, 0.01, 1.66), 'skin', jit=0.03, f=lambda v: Vector((v.x * (0.9 if v.z < 0 else 1.0), v.y * (0.9 if v.z < 0 else 1.0), v.z)))
b.box((0.49, 0.37, 0.44), (0, -0.075, 1.75), 'hair', bevel=0.08, jit=0.05)
for s in (-1, 1):
    b.box((0.06, 0.02, 0.075), (s * 0.1, 0.215, 1.68), 'hair', jit=0)
for s in (-1, 1):
    b.box((0.13, 0.13, 0.13), (s * 0.38, 0.16, 0.82), 'skin', jit=0.03)
b.done('rf_chead', origin=(0, 0, 1.8), smooth=0, shade=(0.86, 1.04), under=0.15)
b = B()
b.lathe([(0.12, -0.33), (0.31, -0.2), (0.36, 0.0), (0.26, 0.2), (0.08, 0.28)], (0, 0.1, -0.03), 'cwhite', seg=7, scale=(1.0, 0.72, 1.0), jit=0.07)
b.box((0.24, 0.1, 0.1), (0, 0.11, 0.3), 'cwhite', tone=0.82, rot=(0, 0.3, 0.3), jit=0.04)
b.done('rf_cpack', origin=(0, 0, 0), smooth=40, shade=(0.72, 1.06), under=0.2)

export('refuge.glb')

"""케이월드 「다섯 해」(farm) — 고을을 채우는 것들(준호 11-23 「조선 후기 큰 판, 블렌더로 디자인 해 보자」). farmset.glb.
집마다 마당이 있고(돌담·싸리울·사립문·장독대·텃밭·외양간·감나무), 마을 어귀에 정자나무와 평상·서낭당, 개울에 섶다리·물레방아,
읍내에 주막·차일 친 가게·관아 담과 삼문·방 붙이는 판. 다 낮은 면 수 — 여러 번 깔아도 가볍게."""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('stone', 0x9a968c), ('stone_d', 0x7c786e), ('stone_l', 0xb4b0a4), ('mud', 0xb89a6a), ('mud_d', 0x8a6e48), ('wood', 0x7a5a36), ('wood_d', 0x5a4028), ('wood_l', 0xa88454),
             ('twig', 0x8a6a40), ('twig_d', 0x6a4e2c), ('straw', 0xdcc074), ('straw_d', 0xb89448), ('leaf', 0x5a9a3e), ('leaf_d', 0x437a30), ('leaf_l', 0x7ab852), ('leaf_y', 0xd8b440),
             ('persim', 0xf07a22), ('jar', 0x5a3a2a), ('jar_d', 0x40281c), ('soil', 0x6a4c30), ('cabbage', 0x8ac860), ('radish', 0x4a9a3a), ('tile', 0x4a4e58), ('tile_l', 0x646a76),
             ('plaster', 0xe8dcc0), ('red', 0xb0302a), ('cloth', 0xf0e8d4), ('cloth_b', 0x3a5a9a), ('paper', 0xf4ecd6), ('ink', 0x2a2a2a), ('water', 0x5aa6e0), ('rope', 0x7a5a32), ('flower', 0xf4d04a), ('flower_p', 0xe888b0)]:
    mat(n, c)
R = random.Random(23)
mat('dark', 0x2a2420)


def sgnpow(v, p):
    return math.copysign(abs(v) ** p, v)


def thatch_roof(b, w, d, z0, h, over=0.5, m='straw', m2='straw_d', seg=18, y0=0.0):
    """둥근 우진각 초가지붕(make_build 의 초가와 같은 결): 처마는 처지고 용마루는 x 로 길다, 이엉을 묶은 새끼줄, 처마 밑 그늘."""
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
        return (rx * sgnpow(math.cos(a), 0.62), y0 + ry * sgnpow(math.sin(a), 0.62), z0 + h * zz)
    b.grid(seg, 8, fn, m, jit=0.1)
    b.box((ridge * 2 + 0.5, 0.34, 0.16), (0, y0, z0 + h + 0.02), m2, bevel=0.05, jit=0.06)
    for i in range(-2, 3):
        b.box((0.07, d * 0.9, 0.05), (i * ridge * 0.42, y0, z0 + h * 0.99), m2, jit=0.05, f=lambda v: Vector((v.x, v.y, v.z - 1.1 * h * (abs(v.y - y0) / (d / 2 + over)) ** 1.6 * 0.35)))
    b.box((w + over * 1.5, d + over * 1.5, 0.06), (0, y0, z0 - 0.08), 'dark')


# ── 돌담 한 칸(4m) · 모서리 돌 ──
def stone_wall(name, L=4.0, h=1.15, seed=1):
    r = random.Random(seed); b = B()
    b.box((L, 0.5, 0.18), (0, 0, 0.09), 'stone_d', bevel=0.03)
    z = 0.16
    for row in range(4):
        x = -L / 2 + (0.15 if row % 2 else 0)
        while x < L / 2 - 0.1:
            w = 0.42 + r.random() * 0.34; hh = 0.24 + r.random() * 0.08
            if x + w > L / 2: w = L / 2 - x
            b.box((w - 0.03, 0.44 - row * 0.03 + r.random() * 0.05, hh), (x + w / 2, (r.random() - 0.5) * 0.05, z + hh / 2), ['stone', 'stone_l', 'stone_d', 'stone'][int(r.random() * 4)], rot=(0, 0, (r.random() - 0.5) * 0.08), bevel=0.05, jit=0.1)
            x += w
        z += 0.25
    b.box((L, 0.5, 0.07), (0, 0, z + 0.02), 'straw_d', bevel=0.02)   # 담 위에 얹은 이엉
    b.box((L - 0.1, 0.34, 0.06), (0, 0, z + 0.08), 'straw', bevel=0.02)
    b.done(name, smooth=0, shade=(0.74, 1.08))
stone_wall('dam_stone', seed=1); stone_wall('dam_stone2', seed=5)

# ── 싸리울 한 칸(4m) · 사립문 ──
b = B()
for i in range(21):
    x = -2 + i * 0.2; hh = 1.15 + R.random() * 0.25
    b.box((0.05, 0.05, hh), (x, (R.random() - 0.5) * 0.04, hh / 2), 'twig' if i % 3 else 'twig_d', rot=((R.random() - 0.5) * 0.08, (R.random() - 0.5) * 0.1, 0), jit=0.12)
for z in (0.35, 0.9):
    b.box((4.0, 0.05, 0.06), (0, 0.04, z), 'twig_d'); b.box((4.0, 0.05, 0.06), (0, -0.04, z), 'twig')
for x in (-2, 0, 2):
    b.cone(0.07, 0.06, 1.4, (x, 0, 0.7), 'wood', seg=6)
b.done('ul_ssari', smooth=0, shade=(0.7, 1.08))
b = B()
for x in (-1.0, 1.0):
    b.cone(0.09, 0.07, 1.7, (x, 0, 0.85), 'wood_d', seg=6)
for i in range(9):
    x = -0.8 + i * 0.2
    b.box((0.045, 0.045, 1.2), (x, 0.5 + x * 0.35, 0.65), 'twig', rot=(0, 0, 0), jit=0.12)   # 반쯤 열린 문
b.box((1.8, 0.05, 0.05), (0, 0.5, 0.4), 'twig_d', rot=(0, 0, 0.34)); b.box((1.8, 0.05, 0.05), (0, 0.5, 0.95), 'twig_d', rot=(0, 0, 0.34))
b.done('sarip', smooth=0, shade=(0.7, 1.08))

# ── 장독대 ──
b = B()
b.box((2.6, 1.8, 0.22), (0, 0, 0.11), 'stone', bevel=0.04); b.box((2.4, 1.6, 0.08), (0, 0, 0.26), 'stone_l', bevel=0.02)
for (x, y, s) in [(-0.8, 0.4, 1.0), (0.0, 0.45, 1.15), (0.8, 0.4, 0.9), (-0.55, -0.35, 0.7), (0.2, -0.4, 0.62), (0.8, -0.35, 0.5)]:
    b.lathe([(0.16 * s, 0), (0.34 * s, 0.25 * s), (0.36 * s, 0.5 * s), (0.26 * s, 0.72 * s), (0.2 * s, 0.76 * s)], (x, y, 0.3), 'jar' if s > 0.65 else 'jar_d', seg=9)
    b.cone(0.24 * s, 0.05, 0.08 * s, (x, y, 0.3 + 0.8 * s), 'jar_d', seg=9)
b.done('jangdokdae', smooth=35, shade=(0.72, 1.1))

# ── 텃밭(이랑 넷 · 배추와 무) ──
b = B()
for i in range(4):
    y = -1.2 + i * 0.8
    b.box((4.0, 0.5, 0.2), (0, y, 0.08), 'soil', bevel=0.08, jit=0.08)
    for k in range(7):
        x = -1.7 + k * 0.56 + (R.random() - 0.5) * 0.1
        if i < 2:
            b.ball(0.17, (x, y, 0.27), 'cabbage', sub=1, scale=(1, 1, 0.8), jit=0.12); b.ball(0.1, (x, y, 0.36), 'leaf_l', sub=1)
        else:
            for a in range(4):
                b.box((0.05, 0.28, 0.02), (x + math.cos(a * 1.57) * 0.1, y + math.sin(a * 1.57) * 0.1, 0.3), 'radish', rot=(0.7, 0, a * 1.57 + 0.4), jit=0.12)
b.done('teotbat', smooth=0, shade=(0.78, 1.08))

# ── 외양간(짚 지붕 · 구유 · 한쪽이 트임) ──
b = B()
for (x, y) in [(-1.7, -1.2), (1.7, -1.2), (-1.7, 1.2), (1.7, 1.2)]:
    b.cone(0.1, 0.09, 2.0, (x, y, 1.0), 'wood_d', seg=6)
b.box((3.5, 0.12, 1.5), (0, 1.2, 0.85), 'mud', bevel=0.03); b.box((0.12, 2.4, 1.5), (-1.7, 0, 0.85), 'mud', bevel=0.03)
b.box((3.4, 0.08, 0.08), (0, -1.2, 0.9), 'wood'); b.box((3.4, 0.08, 0.08), (0, -1.2, 0.45), 'wood')
thatch_roof(b, 3.5, 2.5, 1.95, 1.0, over=0.4)
b.box((1.4, 0.5, 0.3), (0.6, -0.6, 0.3), 'wood', bevel=0.04); b.box((1.2, 0.34, 0.1), (0.6, -0.6, 0.45), 'straw')
b.done('oeyanggan', smooth=0, shade=(0.7, 1.08))

# ── 나뭇단 · 짚가리 ──
b = B()
for row in range(3):
    for i in range(6 - row):
        b.cone(0.11, 0.11, 1.5, (-0.6 + i * 0.24 + row * 0.12, 0, 0.12 + row * 0.2), 'wood' if (i + row) % 2 else 'wood_l', seg=6, rot=(1.5708, 0, 0), jit=0.12)
b.done('namutdan', smooth=0, shade=(0.74, 1.08))

# (감나무는 make_farmtree.py — 가지와 잎 뭉치가 보이게 다시 만듦)

# ── 정자나무(큰 느티나무) · 평상 ──
b = B()
b.cone(0.75, 0.5, 2.4, (0, 0, 1.2), 'wood_d', seg=8, jit=0.1)
for k in range(6):
    a = k * 1.05; b.cone(0.3, 0.1, 0.9, (math.cos(a) * 0.7, math.sin(a) * 0.7, 0.25), 'wood_d', seg=5, rot=(math.sin(a) * 0.9, -math.cos(a) * 0.9, 0))
ZB = [(2.2, 0.4, 4.6), (-2.0, 1.0, 4.9), (0.3, -2.3, 4.8), (-1.2, -1.2, 5.6), (1.3, 1.6, 5.8), (0, 0, 6.6), (2.6, -1.4, 5.3), (-2.7, -0.6, 5.2)]
for (x, y, z) in ZB:
    b.cone(0.2, 0.09, 2.6, (x * 0.5, y * 0.5, z - 1.5), 'wood_d', seg=5, rot=(-y * 0.28, x * 0.28, 0))
b.done('jeongja_trunk', smooth=0, shade=(0.68, 1.05))
b = B()
for i, (x, y, z) in enumerate(ZB):
    b.ball(1.5, (x, y, z), ['leaf', 'leaf_d', 'leaf_l'][i % 3], sub=1, scale=(1.15, 1.15, 0.72), jit=0.16)
    for k in range(4):
        a = k * 1.57 + i; b.ball(0.95, (x + math.cos(a) * 1.15, y + math.sin(a) * 1.15, z - 0.15 + (k % 2) * 0.35), ['leaf_d', 'leaf_l', 'leaf'][(i + k) % 3], sub=1, scale=(1.1, 1.1, 0.7), jit=0.16)   # 잎 뭉치 사이로 가지가 비치게
b.done('jeongja_leaf', smooth=0, shade=(0.66, 1.14))
b = B()
b.box((2.6, 1.8, 0.08), (0, 0, 0.5), 'wood_l', bevel=0.02)
for i in range(7):
    b.box((0.02, 1.8, 0.09), (-1.2 + i * 0.4, 0, 0.5), 'wood')
for (x, y) in [(-1.15, -0.75), (1.15, -0.75), (-1.15, 0.75), (1.15, 0.75)]:
    b.box((0.12, 0.12, 0.46), (x, y, 0.23), 'wood', bevel=0.02)
b.done('pyeongsang', smooth=0, shade=(0.78, 1.06))

# ── 서낭당(돌무더기 + 오색 천을 건 나무) ──
b = B()
for i in range(46):
    a = R.random() * 6.28; rr = R.random() ** 0.6 * 1.3; z = (1.3 - rr) * 0.95 * R.random()
    b.ball(0.2 + R.random() * 0.14, (math.cos(a) * rr, math.sin(a) * rr, 0.12 + z), ['stone', 'stone_l', 'stone_d'][i % 3], sub=1, scale=(1, 1, 0.7), jit=0.14)
b.cone(0.14, 0.07, 3.4, (1.6, 0.2, 1.7), 'wood_d', seg=6, rot=(0, 0.1, 0))
for i, c in enumerate(['red', 'cloth_b', 'flower', 'cloth', 'leaf']):
    b.box((0.05, 0.3, 1.0), (1.75 + i * 0.02, -0.5 + i * 0.25, 2.6 - i * 0.1), c, rot=(0.25 * (i - 2), 0, 0), jit=0.05)
b.done('seonang', smooth=0, shade=(0.72, 1.08))

# ── 섶다리(나무 기둥 위에 솔가지와 흙을 덮은 다리, 길이 12m) ──
b = B()
for i in range(7):
    x = -6 + i * 2
    for y in (-1.0, 1.0):
        b.cone(0.12, 0.1, 1.6, (x, y, 0.2), 'wood_d', seg=6, rot=(0.12 * (1 if y > 0 else -1), 0, 0))
    b.cone(0.1, 0.1, 2.4, (x, 0, 0.95), 'wood', seg=6, rot=(1.5708, 0, 0))
b.box((12.4, 2.3, 0.22), (0, 0, 1.12), 'twig_d', bevel=0.06, jit=0.1); b.box((12.2, 1.9, 0.12), (0, 0, 1.27), 'mud', bevel=0.04, jit=0.1)
for i in range(40):
    b.box((0.5, 0.05, 0.05), (-6 + R.random() * 12, (1.1 if i % 2 else -1.1), 1.1 + R.random() * 0.1), 'leaf_d', rot=(0, 0, 1.2 + R.random()), jit=0.15)
b.done('seopdari', smooth=0, shade=(0.7, 1.08))

# ── 물레방아(바퀴는 따로 — 돌린다) ──
b = B()
b.box((3.2, 2.8, 2.0), (0, 1.6, 1.0), 'mud', bevel=0.05); b.box((3.0, 0.1, 1.2), (0, 0.18, 1.0), 'wood', bevel=0.02)
thatch_roof(b, 3.2, 2.8, 2.0, 1.15, over=0.45, y0=1.6)
b.cone(0.14, 0.14, 1.6, (0, -0.5, 1.5), 'wood_d', seg=8, rot=(1.5708, 0, 0))
for y in (-1.25, -0.25):
    b.box((0.22, 0.22, 1.5), (0, y, 0.75), 'wood_d', bevel=0.03)
b.box((0.5, 3.6, 0.1), (0.9, -2.6, 2.75), 'wood', rot=(0.12, 0, 0)); b.box((0.08, 3.6, 0.2), (0.65, -2.6, 2.82), 'wood_d', rot=(0.12, 0, 0)); b.box((0.08, 3.6, 0.2), (1.15, -2.6, 2.82), 'wood_d', rot=(0.12, 0, 0))   # 홈통
b.done('mulle_house', smooth=0, shade=(0.7, 1.08))
b = B()
for k in range(10):
    a = k * 0.628
    b.box((0.08, 0.5, 2.5), (0, 0, 0), 'wood', rot=(0, a, 0)) if k < 5 else None
    b.box((0.6, 0.62, 0.08), (math.sin(a) * 1.25, 0, math.cos(a) * 1.25), 'wood_l', rot=(0, a, 0), jit=0.1)
for s in (-0.3, 0.3):
    b.lathe([(1.18, 0), (1.32, 0), (1.32, 0.06), (1.18, 0.06)], (0, s, 0), 'wood_d', seg=20, rot=(1.5708, 0, 0), cap=False)
b.done('mulle_wheel', smooth=0, shade=(0.8, 1.05))

# ── 주막(초가 + 술 깃발 + 평상 + 가마솥 아궁이) ──
b = B()
b.box((6.4, 4.0, 0.3), (0, 0, 0.15), 'stone', bevel=0.05)
b.box((6.0, 3.6, 2.1), (0, 0, 1.35), 'plaster', bevel=0.04)
for x in (-3.0, -1.0, 1.0, 3.0):
    b.box((0.2, 0.2, 2.2), (x, -1.82, 1.4), 'wood_d', bevel=0.02)
b.box((1.5, 0.06, 1.5), (-1.9, -1.84, 1.25), 'wood', bevel=0.02); b.box((1.5, 0.06, 1.0), (1.9, -1.84, 1.6), 'paper', bevel=0.02)
thatch_roof(b, 6.0, 3.6, 2.3, 1.55, over=0.6, seg=22)
b.box((2.4, 1.6, 0.5), (3.9, -1.4, 0.25), 'mud', bevel=0.08); b.lathe([(0.3, 0), (0.62, 0.2), (0.66, 0.45), (0.5, 0.5)], (3.9, -1.4, 0.45), 'ink', seg=10)   # 아궁이와 가마솥
b.cone(0.06, 0.05, 4.4, (-3.9, -2.6, 2.2), 'wood_d', seg=6); b.box((0.04, 0.9, 1.3), (-3.9, -2.14, 3.6), 'cloth', jit=0.03); b.box((0.05, 0.5, 0.5), (-3.9, -2.14, 3.6), 'red')   # 술 깃발
b.done('jumak', smooth=0, shade=(0.72, 1.08))

# ── 차일 친 가게(기둥 넷 + 처진 천 + 좌판) ──
def chail(name, cloth):
    b = B()
    for (x, y) in [(-1.8, -1.3), (1.8, -1.3), (-1.8, 1.3), (1.8, 1.3)]:
        b.cone(0.07, 0.06, 2.5 if y > 0 else 2.1, (x, y, (2.5 if y > 0 else 2.1) / 2), 'wood_d', seg=6)
    b.grid(4, 3, lambda u, v: (-2.0 + u * 4.0, -1.5 + v * 3.0, 2.1 + v * 0.42 - math.sin(u * math.pi) * 0.16 - math.sin(v * math.pi) * 0.1), cloth, jit=0.04)
    b.box((3.2, 1.3, 0.1), (0, 0.2, 0.7), 'wood_l', bevel=0.02)
    for (x, y) in [(-1.4, -0.3), (1.4, -0.3), (-1.4, 0.7), (1.4, 0.7)]:
        b.box((0.1, 0.1, 0.7), (x, y, 0.35), 'wood')
    b.done(name, smooth=0, shade=(0.76, 1.08))
chail('chail_w', 'cloth'); chail('chail_b', 'cloth_b')

# ── 관아 담(기와 얹은 흙돌담 4m) · 삼문 ──
b = B()
b.box((4.0, 0.6, 0.4), (0, 0, 0.2), 'stone_d', bevel=0.04, jit=0.1)
b.box((4.0, 0.5, 1.5), (0, 0, 1.15), 'plaster', bevel=0.03)
for i in range(8):
    b.box((0.36, 0.52, 0.12), (-1.75 + i * 0.5, 0, 0.75 + (i % 2) * 0.5), 'stone_l', bevel=0.03, jit=0.1)
b.prism([(-0.5, 1.9), (0, 2.25), (0.5, 1.9), (0.5, 2.0), (0, 2.38), (-0.5, 2.0)], 4.0, (0, 0, 0), 'tile', rot=(0, 0, 1.5708), jit=0.06)
for i in range(9):
    b.box((0.08, 1.02, 0.07), (-2 + i * 0.5, 0, 2.2), 'tile_l', rot=(0, 0, 0))
b.done('gwana_dam', smooth=0, shade=(0.74, 1.06))
b = B()
for x in (-3.0, -1.0, 1.0, 3.0):
    b.cone(0.2, 0.18, 3.2, (x, 0, 1.6), 'red', seg=8); b.box((0.5, 0.5, 0.25), (x, 0, 0.12), 'stone', bevel=0.04)
for x in (-2.0, 0.0, 2.0):
    b.box((1.7, 0.1, 2.4), (x, 0, 1.3), 'wood_d', bevel=0.02); b.box((0.06, 0.12, 2.4), (x, -0.02, 1.3), 'wood')
b.box((6.8, 0.4, 0.3), (0, 0, 3.2), 'red', bevel=0.03)
b.prism([(-1.5, 3.4), (0, 4.5), (1.5, 3.4), (1.5, 3.55), (0, 4.7), (-1.5, 3.55)], 8.0, (0, 0, 0), 'tile', rot=(0, 0, 1.5708), jit=0.06)
for i in range(15):
    b.box((0.09, 3.0, 0.08), (-3.7 + i * 0.53, 0, 4.0), 'tile_l')
b.done('sammun', smooth=0, shade=(0.72, 1.06))

# ── 방 붙이는 판 ──
b = B()
for x in (-0.9, 0.9):
    b.cone(0.08, 0.07, 2.4, (x, 0, 1.2), 'wood_d', seg=6)
b.box((2.2, 0.1, 1.3), (0, 0, 1.6), 'wood', bevel=0.02); b.box((1.0, 0.02, 1.0), (-0.45, -0.06, 1.6), 'paper'); b.box((0.7, 0.02, 0.8), (0.6, -0.06, 1.55), 'paper', rot=(0, 0.06, 0))
for i in range(5):
    b.box((0.03, 0.01, 0.7), (-0.8 + i * 0.16, -0.075, 1.62), 'ink')
b.prism([(-1.3, 2.3), (0, 2.6), (1.3, 2.3)], 0.5, (0, 0, 0), 'straw', jit=0.08)
b.done('bang_pan', smooth=0, shade=(0.76, 1.06))

# ── 풀 포기 · 들꽃 · 디딤돌 ──
b = B()
for i in range(7):
    a = i * 0.9; b.box((0.05, 0.02, 0.5 + (i % 3) * 0.12), (math.cos(a) * 0.1, math.sin(a) * 0.1, 0.25), 'leaf' if i % 2 else 'leaf_l', rot=(math.sin(a) * 0.4, -math.cos(a) * 0.4, a), jit=0.12)
b.done('pul', smooth=0, shade=(0.6, 1.15))
b = B()
for i in range(6):
    a = i * 1.05; x, y = math.cos(a) * 0.3, math.sin(a) * 0.3
    b.box((0.03, 0.03, 0.4), (x, y, 0.2), 'leaf'); b.ball(0.07, (x, y, 0.43), 'flower' if i % 2 else 'flower_p', sub=1)
b.done('deulkkot', smooth=0, shade=(0.7, 1.15))
b = B()
for i in range(5):
    b.lathe([(0.34, 0), (0.4, 0.05), (0.36, 0.1)], (i * 0.85 - 1.7, math.sin(i * 1.7) * 0.15, 0), 'stone' if i % 2 else 'stone_l', seg=7, jit=0.1)
b.done('didimdol', smooth=0, shade=(0.8, 1.05))

export('farmset.glb')

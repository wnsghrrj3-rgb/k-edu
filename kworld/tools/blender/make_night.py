"""케이월드 「그믐밤」 장면에만 쓰는 모델 — night.glb. 앞(문)은 -y(three 에서 +z). 바닥 가운데가 원점.
안채(대청·툇마루가 있는 기와집) · 열린 솟을대문 · 담 모서리 기둥 · 무너진 담 · 수챗구멍 · 나루 잔교 · 등불 장대 · 청사초롱 ·
빨랫줄과 옷 · 노비 문서 · 주먹밥 · 장독 숨을 곳 · 멍석 · 달 구름.
지붕·창호 함수는 make_build.py 와 같은 꼴(그 파일은 여럿이 같이 써서 불러오지 않고 옮겨 적었다)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_wall', 0xd9c6a2), ('tint_cloth', 0x7fc8c0), ('thatch', 0xd9b25a), ('thatch_d', 0xb08a3e), ('dark', 0x2a2420), ('wood', 0x7a5632), ('wood_d', 0x4e3620), ('wood_l', 0xb08a5a),
             ('stone', 0x9a968e), ('stone_d', 0x7d7a74), ('plaster', 0xf0ebdc), ('paper', 0xd9d2bc), ('tile', 0x4c586c), ('tile_l', 0x8892a4), ('mud', 0xb89868), ('iron', 0x3a3a40), ('white', 0xf6f4ee), ('red', 0xc8402e),
             ('onggi', 0x6a4030), ('onggi_l', 0x8a5a40), ('straw', 0xd9b25a), ('straw_d', 0xb08a3e), ('rope', 0xc8b080), ('ink', 0x2b2118), ('water', 0x3d8fd0), ('green', 0x5a8a4a), ('cloud', 0x3a4f80), ('hemp', 0xcfc2a0),
             ('reed_n', 0xdccc8c), ('reed_nh', 0xa67c4c), ('glow_win', 0xffd88a), ('glow_red', 0xff5a4a), ('glow_blue', 0x4a8cff), ('glow_paper', 0xfff6dc), ('glow_rice', 0xf7f3e6)]:
    mat(n, c)


def tile_roof(b, w, d, z0, h, over=0.7, lift=0.45, m='tile', nx=14):
    """맞배 기와지붕: 처마 끝이 살짝 들리고, 기왓골이 줄무늬로 보인다."""
    W, D = w + 2 * over, d + 2 * over

    def surf(u, v, dz=0.0):
        e = abs(2 * v - 1)
        return ((u - 0.5) * W, (v - 0.5) * D, z0 + h * (1 - e ** 1.25) + lift * (abs(2 * u - 1) ** 3) * e + 0.12 * e * e + dz)
    for i in range(nx):
        u0, u1 = i / nx, (i + 1) / nx
        b.grid(1, 8, lambda u, v, u0=u0, u1=u1: surf(u0 + (u1 - u0) * u, v), m, tone=1.0 if i % 2 else 0.84, jit=0.04)
        b.grid(1, 8, lambda u, v, u0=u0, u1=u1: surf(u0 + (u1 - u0) * (1 - u), v, -0.14), 'dark', jit=0)
    b.box((W + 0.1, 0.3, 0.24), (0, 0, z0 + h + 0.08), 'tile_l', bevel=0.05, f=lambda v: Vector((v.x, v.y, v.z + lift * 0.5 * (abs(v.x) / (W / 2)) ** 3)))
    for s in (-1, 1):
        b.box((0.3, 0.34, 0.5), (s * (W / 2 - 0.08), 0, z0 + h + 0.3 + lift * 0.5), 'tile_l', bevel=0.06, rot=(0, -s * 0.35, 0))
        b.prism([(-d / 2, 0), (d / 2, 0), (0, h * 0.82)], 0.14, (s * (w / 2 - 0.02), 0, z0), 'plaster', rot=(0, 0, math.pi / 2))


def lattice(b, x, y, z, w, h, m='paper', glow=False, side=None, nv=3):
    """창호: 종이 + 살. side 가 None 이면 앞(-y)을 본다. 'L' 이면 옆."""
    t = 0.05
    if side is None:
        b.box((w, t, h), (x, y, z), 'glow_win' if glow else m, jit=0)
        b.box((w + 0.1, t + 0.03, 0.07), (x, y, z + h / 2), 'wood_d', jit=0); b.box((w + 0.1, t + 0.03, 0.07), (x, y, z - h / 2), 'wood_d', jit=0)
        for i in range(nv):
            b.box((0.035, t + 0.03, h), (x - w / 2 + w * i / (nv - 1), y, z), 'wood_d', jit=0)
        for k in (-0.25, 0.25):
            b.box((w, t + 0.03, 0.03), (x, y, z + h * k), 'wood_d', jit=0)
    else:
        b.box((t, w, h), (x, y, z), 'glow_win' if glow else m, jit=0)
        for i in range(3):
            b.box((t + 0.03, 0.035, h), (x, y - w / 2 + w * i / 2, z), 'wood_d', jit=0)
        b.box((t + 0.03, w, 0.035), (x, y, z), 'wood_d', jit=0)


def jar(b, x, y, s=1.0, m='onggi', lid=True):
    b.lathe([(0.2 * s, 0), (0.36 * s, 0.14 * s), (0.44 * s, 0.42 * s), (0.4 * s, 0.7 * s), (0.27 * s, 0.86 * s), (0.29 * s, 0.92 * s)], (x, y, 0), m, seg=7, jit=0.05)
    if lid:
        b.lathe([(0.33 * s, 0.92 * s), (0.2 * s, 1.0 * s), (0.06 * s, 1.03 * s), (0.06 * s, 1.08 * s)], (x, y, 0), 'onggi_l', seg=7, jit=0.05)


# ───── 안채: 다섯 칸 기와집(안방 두 칸 · 대청 두 칸 · 건넌방) — 벽 몸통이 11 x 5(막는 네모)에 꼭 맞는다 ─────
W, D, PL, HG = 11.0, 5.0, 0.42, 2.3
BW = W / 5
YF = -D / 2 + 0.95      # 방 앞벽(그 앞은 툇마루)
b = B()
b.box((W + 0.9, D + 0.9, PL), (0, 0, PL / 2), 'stone', bevel=0.06, jit=0.08)
for i in range(9):      # 기단 앞면의 돌 이음
    b.box((0.04, 0.05, PL - 0.1), (-W / 2 + 0.2 + i * (W - 0.4) / 8, -D / 2 - 0.45, PL / 2 - 0.02), 'stone_d', jit=0)
for x in (-2.2, 2.2):   # 댓돌
    b.box((1.3, 0.36, 0.16), (x, -D / 2 - 0.2, PL + 0.08), 'stone_d', bevel=0.04, jit=0.06)
for k, s in enumerate((-1, 1)):   # 댓돌 위 짚신 한 켤레
    b.box((0.11, 0.26, 0.06), (-2.2 + s * 0.09, -D / 2 - 0.2, PL + 0.19), 'straw', jit=0.05)
ZF = PL + 0.3           # 마루 높이
# 방: 왼쪽 두 칸(안방) · 오른쪽 한 칸(건넌방)
for x0, x1 in ((-W / 2, -W / 2 + 2 * BW), (W / 2 - BW, W / 2)):
    b.box((x1 - x0 - 0.16, D / 2 - YF - 0.1, HG), ((x0 + x1) / 2, (YF + D / 2 - 0.1) / 2 + 0.0, PL + HG / 2), 'plaster', jit=0.03)
# 대청: 마루 · 뒤 널문 · 안쪽 어둠
hx0, hx1 = -W / 2 + 2 * BW, W / 2 - BW
b.box((hx1 - hx0, D - 0.3, 0.14), ((hx0 + hx1) / 2, 0, ZF - 0.02), 'wood_l', jit=0.05)
for i in range(1, 8):
    b.box((0.03, D - 0.3, 0.02), (hx0 + (hx1 - hx0) * i / 8, 0, ZF + 0.055), 'wood', jit=0)
b.box((hx1 - hx0, 0.12, HG), ((hx0 + hx1) / 2, D / 2 - 0.16, PL + HG / 2), 'wood', jit=0.05)
for i in range(4):
    xx = hx0 + (hx1 - hx0) * (i + 0.5) / 4
    b.box((0.9, 0.05, HG * 0.62), (xx, D / 2 - 0.24, PL + HG * 0.52), 'wood_d', jit=0.04)
    b.box((0.03, 0.06, HG * 0.62), (xx, D / 2 - 0.26, PL + HG * 0.52), 'wood', jit=0)
b.box((hx1 - hx0, D - 0.3, 0.3), ((hx0 + hx1) / 2, 0, PL + 0.1), 'dark', jit=0)
# 툇마루(방 앞)
for x0, x1 in ((-W / 2, hx0), (hx1, W / 2)):
    b.box((x1 - x0 - 0.1, 0.92, 0.1), ((x0 + x1) / 2, -D / 2 + 0.5, ZF), 'wood_l', jit=0.06)
    b.box((x1 - x0 - 0.1, 0.07, 0.16), ((x0 + x1) / 2, -D / 2 + 0.06, ZF - 0.03), 'wood', jit=0.04)
    b.box((x1 - x0 - 0.3, 0.8, 0.26), ((x0 + x1) / 2, -D / 2 + 0.52, PL + 0.12), 'dark', jit=0)
# 창호: 안방 두 칸(한 칸은 불 켜짐) · 건넌방
for i, glow in ((0, False), (1, True), (4, False)):
    xx = -W / 2 + BW * (i + 0.5)
    b.box((BW * 0.74, 0.06, 0.26), (xx, YF - 0.03, ZF + 0.18), 'wood', jit=0.04)
    lattice(b, xx, YF - 0.04, ZF + 0.31 + 0.72, BW * 0.66, 1.44, glow=glow, nv=5)
# 기둥(앞줄 · 뒷줄) · 창방
for i in range(6):
    xx = -W / 2 + BW * i
    for yy in (-D / 2 + 0.14, D / 2 - 0.14):
        b.cone(0.15, 0.14, HG, (xx * 0.987, yy, PL + HG / 2), 'wood_d', seg=8, jit=0.03)
        b.cone(0.22, 0.2, 0.1, (xx * 0.987, yy, PL + 0.05), 'stone_d', seg=8, jit=0.04)
for s in (-1, 1):
    b.cone(0.15, 0.14, HG, (s * (W / 2) * 0.987, 0, PL + HG / 2), 'wood_d', seg=8, jit=0.03)
    lattice(b, s * (W / 2 - 0.05), 1.1, PL + HG * 0.6, 1.0, 0.8, side='L')
b.box((W + 0.3, D + 0.3, 0.22), (0, 0, PL + HG + 0.02), 'wood_d', jit=0.03)
b.box((W + 0.1, 0.1, 0.12), (0, -D / 2 + 0.14, PL + HG - 0.28), 'wood_d', jit=0.03)
tile_roof(b, W, D, PL + HG + 0.14, 1.7, over=0.9, lift=0.5, nx=22)
b.done('anchae', smooth=0, shade=(0.76, 1.07), under=0.28)

# ───── 열린 솟을대문: 문길 4(기둥 사이), 문짝은 안쪽(+y)으로 활짝 젖혀 담에 붙었다 ─────
b = B()
b.box((4.3, 1.3, 0.07), (0, 0, 0.035), 'stone', bevel=0.02, jit=0.06)
for s in (-1, 1):
    b.box((0.28, 0.28, 3.0), (s * 1.96, 0, 1.5), 'wood_d', jit=0.03)
    b.box((0.8, 1.14, 2.45), (s * 2.44, 0, 1.225), 'plaster', jit=0.03)
    b.box((0.86, 1.2, 0.5), (s * 2.44, 0, 0.25), 'stone', bevel=0.05, jit=0.1)
    b.box((0.86, 1.2, 0.08), (s * 2.44, 0, 2.47), 'wood_d', jit=0.03)
    # 문짝(젖혀 열림)
    a = 0.13
    cx, cy = s * (1.98 + 0.9 * math.cos(a)), 0.63 + 0.9 * math.sin(a)
    b.box((1.8, 0.09, 2.35), (cx, cy, 1.33), 'wood', rot=(0, 0, s * a), jit=0.06)
    for k in (-0.6, 0, 0.6):
        b.box((0.04, 0.11, 2.35), (cx + s * k * math.cos(a), cy + k * math.sin(a), 1.33), 'wood_d', rot=(0, 0, s * a), jit=0)
    for z in (0.55, 2.1):
        b.box((1.8, 0.12, 0.1), (cx, cy, z), 'iron', rot=(0, 0, s * a), jit=0)
    b.cone(0.09, 0.09, 0.04, (cx + s * 0.55 * math.cos(a), cy + 0.55 * math.sin(a) + 0.07, 1.35), 'iron', seg=8, rot=(math.pi / 2, 0, 0))
b.box((4.2, 0.32, 0.24), (0, 0, 2.72), 'wood_d', jit=0.03)
b.box((1.5, 0.05, 0.42), (0, -0.19, 2.72), 'wood', jit=0.04)
b.box((5.0, 1.0, 0.16), (0, 0, 2.96), 'wood_d', jit=0.03)
tile_roof(b, 4.8, 1.3, 3.04, 0.82, over=0.5, lift=0.3, nx=10)
b.done('gate_open', smooth=0, shade=(0.76, 1.07), under=0.28)

# ───── 담 모서리 기둥 ─────
b = B()
b.box((0.9, 0.9, 1.95), (0, 0, 0.975), 'tint_wall', jit=0.05)
b.box((0.98, 0.98, 0.62), (0, 0, 0.31), 'stone', bevel=0.05, jit=0.1)
b.cone(0.82, 0.14, 0.4, (0, 0, 2.15), 'tile', seg=4, rot=(0, 0, math.pi / 4), jit=0.06)
b.box((0.2, 0.2, 0.14), (0, 0, 2.4), 'tile_l', bevel=0.03)
b.done('wall_post', smooth=0, shade=(0.76, 1.07), under=0.28)

# ───── 무너진 담(길이 2, x 로 길다): 양 끝은 층층이 헐리고 가운데는 흙더미, 돌이 굴러 나왔다 ─────
b = B()
rr = random.Random(5)
for x, w, h in [(-0.84, 0.36, 1.3), (-0.5, 0.4, 0.86), (0.85, 0.34, 1.05), (0.52, 0.4, 0.62)]:
    b.box((w, 0.46, h), (x, 0, h / 2), 'tint_wall', jit=0.08, f=lambda v, h=h: Vector((v.x, v.y, v.z + (0.08 * math.sin(v.x * 9 + v.y * 5) if v.z > 0 else 0))))
for x in (-0.76, -0.34, 0.36, 0.77):
    b.box((0.42, 0.56, 0.3), (x, 0, 0.17), 'stone' if x < 0 else 'stone_d', bevel=0.05, jit=0.1)
for x, w, h, y in [(-0.2, 0.5, 0.4, 0.02), (0.14, 0.4, 0.5, -0.03), (0.0, 0.9, 0.24, 0.1)]:
    b.box((w, 0.56, h), (x, y, h / 2), 'mud', bevel=0.08, jit=0.1, rot=(0, 0, rr.random() * 0.3 - 0.15))
for i in range(12):
    a, d = rr.random() * 6.28, 0.5 + rr.random() * 0.75
    x, y = math.cos(a) * d * 1.1, math.sin(a) * d
    if abs(y) < 0.36:
        y = math.copysign(0.4 + rr.random() * 0.4, y or 1)
    r = 0.11 + rr.random() * 0.13
    b.ball(r, (x, y, r * 0.6), 'stone' if i % 2 else 'stone_d', sub=1, scale=(1.2, 1, 0.75), jit=0.12, rot=(0, 0, a))
for i in range(5):      # 떨어진 기와 조각
    a = rr.random() * 6.28
    b.box((0.26, 0.16, 0.04), (math.cos(a) * (0.5 + rr.random() * 0.6), math.copysign(0.45 + rr.random() * 0.4, math.sin(a)), 0.04), 'tile', rot=(rr.random() * 0.3, rr.random() * 0.3, a), jit=0.1)
b.done('wall_broken', smooth=0, shade=(0.8, 1.06), under=0.25)

# ───── 수챗구멍(길이 2, x 로 길다): 담 밑에 돌로 짠 구멍, 물이 빠져나간다 — 담(wall_mud)과 같은 굵기 ─────
b = B()
for s in (-1, 1):
    b.box((0.6, 0.5, 1.5), (s * 0.7, 0, 0.75), 'tint_wall', jit=0.05)
    b.box((0.22, 0.6, 0.84), (s * 0.5, 0, 0.42), 'stone_d', bevel=0.04, jit=0.1)
    for j in range(2):
        b.box((0.36, 0.56, 0.3), (s * 0.82, 0, 0.17 + j * 0.3), 'stone' if j else 'stone_d', bevel=0.05, jit=0.1)
b.box((0.8, 0.5, 0.66), (0, 0, 1.17), 'tint_wall', jit=0.05)
b.box((1.26, 0.62, 0.24), (0, 0, 0.94), 'stone', bevel=0.05, jit=0.08)
b.prism([(-0.42, 0), (0.42, 0), (0, 0.3)], 2.0, (0, 0, 1.5), 'tile', rot=(0, 0, math.pi / 2), jit=0.06)
b.box((2.0, 0.12, 0.1), (0, 0, 1.8), 'tile_l')
b.box((0.74, 2.5, 0.04), (0, 0, 0.045), 'water', jit=0.04)
for s in (-1, 1):
    for k in range(5):
        y = -1.15 + k * 0.56
        if abs(y) < 0.3:
            continue
        b.ball(0.13, (s * 0.44, y, 0.05), 'stone' if k % 2 else 'stone_d', sub=1, scale=(1, 1.5, 0.7), jit=0.1)
b.done('drain', smooth=0, shade=(0.76, 1.07), under=0.28)

# ───── 나루 잔교(너비 3.4 · 길이 4.6, 강 쪽이 +y): 널 바닥 윗면 0.4 ─────
b = B()
rr = random.Random(9)
for i in range(11):
    y = -2.3 + 0.21 + i * 0.418
    b.box((3.4 - rr.random() * 0.14, 0.38, 0.1), ((rr.random() - 0.5) * 0.08, y, 0.35), 'wood' if i % 3 else 'wood_l', jit=0.1, rot=(0, 0, (rr.random() - 0.5) * 0.02))
for x in (-1.25, 1.25):
    b.box((0.16, 4.5, 0.16), (x, 0, 0.23), 'wood_d', jit=0.04)
for x in (-1.6, 1.6):
    for k, y in enumerate((-2.05, -0.7, 0.7, 2.05)):
        top = 1.0 if y > 0.5 else 0.62
        b.cone(0.13, 0.11, top + 0.7, (x, y, (top - 0.7) / 2), 'wood_d', seg=6, jit=0.08)
        b.cone(0.135, 0.135, 0.07, (x, y, top - 0.16), 'rope', seg=6, jit=0.04)
b.box((1.5, 1.0, 0.08), (0, -2.72, 0.17), 'wood_l', rot=(0.36, 0, 0), jit=0.08)      # 오르는 널
for k in range(3):      # 밧줄 사리
    b.lathe([(0.22 - k * 0.03, 0.4 + k * 0.05), (0.27 - k * 0.03, 0.43 + k * 0.05), (0.22 - k * 0.03, 0.46 + k * 0.05)], (1.0, 1.5, 0), 'rope', seg=8, cap=False, jit=0.08)
b.done('dock', smooth=0, shade=(0.72, 1.08), under=0.3)

# ───── 등불 장대(팔은 +x 로 0.9) · 청사초롱(가운데가 원점, 위 붉고 아래 푸르다) ─────
b = B()
b.cone(0.1, 0.07, 3.2, (0, 0, 1.6), 'wood_d', seg=6, jit=0.06)
b.box((1.3, 0.07, 0.08), (0.42, 0, 3.0), 'wood_d', jit=0.04)
b.box((0.07, 0.06, 0.8), (0.27, 0, 2.72), 'wood', rot=(0, 0.72, 0), jit=0.04)
b.cone(0.1, 0.1, 0.1, (0, 0, 2.98), 'rope', seg=6, jit=0.05)
b.cone(0.035, 0.035, 0.06, (0.9, 0, 2.99), 'rope', seg=5, rot=(math.pi / 2, 0, 0))
for i in range(4):
    a = i * 1.7 + 0.4
    b.ball(0.17, (math.cos(a) * 0.2, math.sin(a) * 0.2, 0.08), 'stone' if i % 2 else 'stone_d', sub=1, scale=(1.2, 1, 0.8), jit=0.1)
b.done('lamp_pole', smooth=0, shade=(0.8, 1.05))
b = B()
b.box((0.025, 0.025, 0.22), (0, 0, 0.36), 'ink')
b.cone(0.22, 0.13, 0.07, (0, 0, 0.24), 'wood_d', seg=8)
b.lathe([(0.17, 0.21), (0.29, 0.1), (0.33, -0.04), (0.335, -0.2)], (0, 0, 0), 'glow_red', seg=8, cap=False, jit=0.05)
b.lathe([(0.335, -0.2), (0.31, -0.42), (0.2, -0.6)], (0, 0, 0), 'glow_blue', seg=8, cap=False, jit=0.05)
RIB = [(0.2, -0.6), (0.31, -0.42), (0.335, -0.2), (0.33, -0.04), (0.29, 0.1), (0.17, 0.21)]
for i in range(8):
    a = i * math.pi / 4
    for (r0, z0), (r1, z1) in zip(RIB, RIB[1:]):
        rm, zm = (r0 + r1) / 2 + 0.006, (z0 + z1) / 2
        b.box((0.018, 0.018, math.hypot(r1 - r0, z1 - z0) + 0.01), (math.cos(a) * rm, math.sin(a) * rm, zm), 'wood_d', rot=(0, math.atan2(r1 - r0, z1 - z0), a), jit=0)
b.cone(0.21, 0.17, 0.06, (0, 0, -0.62), 'wood_d', seg=8)
b.cone(0.05, 0.012, 0.3, (0, 0, -0.8), 'red', seg=5)
b.done('chorong', smooth=0, shade=(0.86, 1.06), under=0.05)

# ───── 빨랫줄(x 로 3) · 저고리(상민 옷, 왼쪽) · 흰 빨래(오른쪽) ─────
ROPE = lambda x: 2.1 - 0.13 * (1 - (x / 1.5) ** 2)
b = B()
for s in (-1, 1):
    b.cone(0.055, 0.04, 2.3, (s * 1.54, 0, 1.15), 'wood', seg=5, jit=0.06, rot=(0, s * 0.05, 0))
    for t in (-1, 1):
        b.cone(0.03, 0.02, 0.3, (s * 1.6 + t * 0.07, 0, 2.36), 'wood', seg=4, rot=(0, t * 0.45, 0))
    b.ball(0.12, (s * 1.5, 0.05, 0.04), 'stone_d', sub=1, scale=(1.2, 1, 0.6), jit=0.1)
for i in range(8):
    x0, x1 = -1.56 + i * 0.39, -1.56 + (i + 1) * 0.39
    z0, z1 = ROPE(x0), ROPE(x1)
    b.box((math.hypot(x1 - x0, z1 - z0) + 0.01, 0.03, 0.03), ((x0 + x1) / 2, 0, (z0 + z1) / 2), 'rope', rot=(0, -math.atan2(z1 - z0, x1 - x0), 0), jit=0.05)
for x in (1.05, 1.25):  # 버선 한 켤레
    b.box((0.13, 0.03, 0.3), (x, 0, ROPE(x) - 0.16), 'white', jit=0.03)
    b.box((0.2, 0.03, 0.11), (x + 0.04, 0, ROPE(x) - 0.33), 'white', jit=0.03)
b.done('clothesline', smooth=0, shade=(0.8, 1.06), under=0.1)
b = B()
wave = lambda v: Vector((v.x, v.y + 0.035 * math.sin(v.x * 7) * (2.0 - v.z), v.z))
zc = ROPE(-0.6)
b.box((1.34, 0.04, 0.3), (-0.6, 0, zc - 0.15), 'tint_cloth', jit=0.04, f=None)
b.box((0.62, 0.045, 0.66), (-0.6, 0, zc - 0.36), 'tint_cloth', jit=0.04)
for s in (-1, 1):
    b.box((0.07, 0.055, 0.42), (-0.6 + s * 0.1, -0.005, zc - 0.2), 'white', rot=(0, s * 0.42, 0), jit=0)
b.box((0.05, 0.055, 0.34), (-0.52, -0.01, zc - 0.52), 'white', rot=(0, 0.2, 0), jit=0)
b.done('cloth_jeogori', smooth=0, shade=(0.84, 1.06), under=0.05)
b = B()
zc = ROPE(0.45)
b.box((0.86, 0.035, 0.8), (0.42, -0.035, zc - 0.4), 'hemp', jit=0.04)
b.box((0.86, 0.035, 0.46), (0.42, 0.035, zc - 0.23), 'hemp', tone=0.9, jit=0.04)
b.box((0.86, 0.1, 0.04), (0.42, 0, zc + 0.01), 'hemp', jit=0.02)
b.done('cloth_sheet', smooth=0, shade=(0.84, 1.06), under=0.05)

# ───── 노비 문서(궤 위, 궤 윗면 0.71) · 주먹밥(작은 소반에 담아, 떠서 돈다) ─────
b = B()
b.box((0.52, 0.36, 0.05), (-0.08, 0, 0.745), 'glow_paper', rot=(0, 0, 0.12), jit=0.02)
b.box((0.1, 0.1, 0.012), (0.06, -0.08, 0.775), 'red', rot=(0, 0, 0.12))
b.cone(0.055, 0.055, 0.56, (0.2, 0.06, 0.8), 'glow_paper', seg=6, rot=(math.pi / 2, 0, -0.35), jit=0.03)
b.cone(0.062, 0.062, 0.06, (0.2, 0.06, 0.8), 'red', seg=6, rot=(math.pi / 2, 0, -0.35))
b.done('doc_scroll', smooth=0, shade=(0.9, 1.04), under=0.05)
b = B()
b.lathe([(0.2, -0.06), (0.34, -0.02), (0.37, 0.04)], (0, 0, 0), 'wood', seg=10, jit=0.06)
b.cone(0.33, 0.33, 0.02, (0, 0, 0.02), 'wood_l', seg=10, jit=0.03)
b.cone(0.26, 0.24, 0.015, (0, 0, 0.04), 'green', seg=7, jit=0.06)
for i in range(3):
    a = i * 2.094 + 0.5
    b.ball(0.15, (math.cos(a) * 0.15, math.sin(a) * 0.15, 0.16), 'glow_rice', sub=1, scale=(1, 1, 0.85), jit=0.05)
b.ball(0.14, (0, 0, 0.36), 'glow_rice', sub=1, scale=(1, 1, 0.85), jit=0.05)
b.done('riceball', smooth=0, shade=(0.84, 1.05), under=0.12)

# ───── 장독 숨을 곳: 크고 작은 독이 둥글게 — 가운데에 웅크릴 틈 ─────
b = B()
b.lathe([(1.5, 0), (1.46, 0.07)], (0, 0, 0), 'stone', seg=9, jit=0.1)
for deg, r, s, m in [(15, 0.98, 1.22, 'onggi'), (78, 0.93, 0.95, 'onggi_l'), (140, 1.0, 1.28, 'onggi'), (205, 0.9, 0.82, 'onggi_l'), (262, 0.96, 1.12, 'onggi'), (322, 0.9, 0.74, 'onggi_l')]:
    a = math.radians(deg)
    jar(b, math.cos(a) * r, math.sin(a) * r, s, m)
b.cone(0.2, 0.26, 0.1, (math.cos(math.radians(322)) * 0.9, math.sin(math.radians(322)) * 0.9, 0.86), 'onggi', seg=8, jit=0.05)   # 엎어 둔 뚜껑 그릇
b.done('jar_hide', smooth=35, shade=(0.68, 1.1))

# ───── 멍석 · 달을 가리는 구름 ─────
b = B()
b.box((1.9, 1.4, 0.035), (0, 0, 0.018), 'straw', jit=0.06)
for i in range(7):
    b.box((1.9, 0.035, 0.04), (0, -0.6 + i * 0.2, 0.02), 'straw_d', jit=0.08)
for s in (-1, 1):
    b.cone(0.05, 0.05, 1.4, (s * 0.95, 0, 0.05), 'straw_d', seg=5, rot=(math.pi / 2, 0, 0), jit=0.06)
b.done('mat_straw', smooth=0, shade=(0.9, 1.05), under=0.05)
b = B()
for i, (x, y, z, r) in enumerate([(-2.3, 0, 0.0, 1.25), (-1.0, 0.2, 0.3, 1.7), (0.6, -0.1, 0.45, 1.95), (2.1, 0.1, 0.1, 1.45), (3.2, 0, -0.1, 0.95)]):
    b.ball(r, (x, y, z), 'cloud', sub=2, scale=(1.35, 0.8, 0.72), jit=0.04, f=lambda v: Vector((v.x, v.y, max(v.z, -0.45))))
b.done('cloud', smooth=0, shade=(0.78, 1.25), under=0.3)

# ───── 나룻배(x 로 길다, 길이 6): 바닥이 평평한 배 — 널 바닥 윗면 0.47(사람이 0.5 에 선다), 물은 -0.2 ─────
b = B()
HWF = lambda u: 0.98 * (0.42 + 0.58 * max(0.0, math.sin(u * math.pi)) ** 0.5)
ZT = lambda u: 0.74 + 0.4 * abs(2 * u - 1) ** 2.5
ZB = lambda u: -0.42 + 0.72 * abs(2 * u - 1) ** 3


def hull(u, v, k=1.0, dz=0.0):
    hw = HWF(u) * k
    pts = [(-hw, ZT(u)), (-0.74 * hw, ZB(u) + dz), (0.74 * hw, ZB(u) + dz), (hw, ZT(u))]
    i = min(int(v * 3 + 1e-6), 2)
    t = v * 3 - i
    return ((u - 0.5) * 6.0, pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t)
b.grid(10, 3, lambda u, v: hull(u, v), 'wood', jit=0.08)
b.grid(10, 3, lambda u, v: hull(u, 1 - v, 0.92, 0.07), 'wood_d', jit=0.06)
for s in (-1, 1):
    b.box((0.1, 0.86, 0.82), (s * 2.98, 0, 0.76), 'wood_d', jit=0.05)
    b.box((0.3, 1.5, 0.07), (s * 2.35, 0, 0.7), 'wood_d', jit=0.04)
    for i in range(10):     # 뱃전
        u0, u1 = i / 10, (i + 1) / 10
        x0, x1, y0, y1, z0, z1 = (u0 - 0.5) * 6, (u1 - 0.5) * 6, HWF(u0), HWF(u1), ZT(u0), ZT(u1)
        b.box((math.hypot(x1 - x0, y1 - y0, z1 - z0) + 0.02, 0.1, 0.09), ((x0 + x1) / 2, s * (y0 + y1) / 2, (z0 + z1) / 2 + 0.02), 'wood_l', rot=(0, -math.atan2(z1 - z0, x1 - x0), s * math.atan2(y1 - y0, x1 - x0)), jit=0.06)
for i in range(7):          # 널 바닥
    b.box((4.4, 0.215, 0.06), (0, -0.66 + i * 0.22, 0.44), 'wood_l' if i % 2 else 'wood', jit=0.08)
b.cone(0.035, 0.03, 4.2, (-0.2, -0.62, 0.52), 'wood_l', seg=5, rot=(0, math.pi / 2, 0.02), jit=0.05)     # 삿대
b.box((0.07, 0.07, 3.3), (3.35, 0.25, 0.5), 'wood_d', rot=(0, 1.05, 0.12), jit=0.05)                   # 노
b.box((0.05, 0.26, 0.9), (4.45, 0.39, -0.05), 'wood_d', rot=(0, 1.05, 0.12), jit=0.05)
b.box((0.12, 0.12, 0.5), (2.5, 0.25, 0.95), 'wood', jit=0.05)
for x, y, r in [(-1.95, 0.25, 0.3), (-1.75, -0.2, 0.26)]:     # 짐 보따리
    b.ball(r, (x, y, 0.47 + r * 0.7), 'hemp', sub=1, scale=(1.15, 1, 0.8), jit=0.06)
b.done('ferry', smooth=0, shade=(0.7, 1.08), under=0.1)

# ───── 가벼운 담(길이 4, x 로 길다 — build 의 wall_mud 와 같은 치수, 면 수는 3분의 1) · 가벼운 갈대(밤에도 보이게 조금 밝다) ─────
b = B()
b.box((4.0, 0.5, 1.5), (0, 0, 0.75), 'tint_wall', jit=0.05)
for j in range(2):
    xs = [-2.0, -1.2, -0.3, 0.45, 1.3, 2.0] if j == 0 else [-2.0, -1.55, -0.7, 0.1, 0.95, 1.6, 2.0]
    for i, (xa, xb) in enumerate(zip(xs, xs[1:])):
        b.box((xb - xa - 0.04, 0.56 + 0.02 * ((i + j) % 2), 0.28), ((xa + xb) / 2, 0, 0.16 + j * 0.3), 'stone' if (i + j) % 2 else 'stone_d', jit=0.12)
b.prism([(-0.42, 0), (0.42, 0), (0, 0.3)], 4.0, (0, 0, 1.5), 'tile', rot=(0, 0, math.pi / 2), jit=0.06)
b.box((4.0, 0.12, 0.1), (0, 0, 1.8), 'tile_l')
for i in range(8):      # 기왓골(얇은 면 한 장씩)
    for s in (-1, 1):
        x = -1.75 + i * 0.5
        b.grid(1, 1, lambda u, v, x=x, s=s: (x - 0.045 + 0.09 * u, s * (0.03 + 0.4 * v), 1.812 - 0.3 * (0.03 + 0.4 * v) / 0.42), 'tile_l', tone=0.82, jit=0.05)
b.done('wall_n', smooth=0, shade=(0.76, 1.07), under=0.28)
b = B()
rr = random.Random(21)
for i in range(7):
    a = i * 0.9 + rr.random() * 0.5
    d = 0.06 + rr.random() * 0.26
    hh = 1.15 + rr.random() * 0.6
    lean = 0.04 + rr.random() * 0.22
    cx, cy = math.cos(a) * d, math.sin(a) * d
    b.cone(0.03, 0.012, hh, (cx + math.cos(a) * math.sin(lean) * hh / 2, cy + math.sin(a) * math.sin(lean) * hh / 2, hh / 2 * math.cos(lean)), 'reed_n', seg=3, cap=False, jit=0.1, rot=(0, lean, a))
    b.cone(0.045, 0.008, 0.32, (cx + math.cos(a) * math.sin(lean) * (hh + 0.1), cy + math.sin(a) * math.sin(lean) * (hh + 0.1), (hh + 0.1) * math.cos(lean)), 'reed_nh', seg=3, cap=False, jit=0.1, rot=(0, lean, a))
for i in range(3):
    a = i * 2.094 + 0.4
    hh = 0.7 + rr.random() * 0.4
    lean = 0.5 + rr.random() * 0.3
    b.cone(0.04, 0.004, hh, (math.cos(a) * (0.1 + math.sin(lean) * hh / 2), math.sin(a) * (0.1 + math.sin(lean) * hh / 2), hh / 2 * math.cos(lean)), 'reed_n', seg=3, cap=False, tone=0.85, jit=0.1, rot=(0, lean, a))
b.done('reed_n', smooth=0, shade=(0.72, 1.1), under=0.1)

# ───── 초가(build 의 thatch_a·thatch_b 와 같은 치수) — 처마 밑 그늘판을 지붕 둘레를 따라 둥글게(위에서 볼 때 검은 네모가 삐져나오지 않게) ─────
def sgnpow(v, p):
    return math.copysign(abs(v) ** p, v)


def thatch_roof(b, w, d, z0, h, over=0.55, m='thatch', seg=18):
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
    b.grid(seg, 8, fn, m, jit=0.1)
    b.box((ridge * 2 + 0.5, 0.34, 0.16), (0, 0, z0 + h + 0.02), 'thatch_d', bevel=0.05, jit=0.06)
    for i in range(-2, 3):
        b.box((0.07, d * 0.9, 0.05), (i * ridge * 0.42, 0, z0 + h * 0.99), 'thatch_d', jit=0.05, f=lambda v: Vector((v.x, v.y, v.z - 1.1 * h * (abs(v.y) / (d / 2 + over)) ** 1.6 * 0.35)))
    b.grid(seg, 1, lambda u, v: ((w / 2 + over) * sgnpow(math.cos(u * 2 * math.pi), 0.62) * (0.3 + 0.67 * v), (d / 2 + over) * sgnpow(math.sin(u * 2 * math.pi), 0.62) * (0.3 + 0.67 * v), z0 - 0.1), 'dark', jit=0)


def choga(name, w, d, bays, door, glow=False):
    b = B()
    h, z0, plinth = 2.0, 0.3, 0.3
    b.box((w + 0.7, d + 0.7, plinth), (0, 0, plinth / 2), 'stone', bevel=0.06, jit=0.08)
    b.box((w, d, h), (0, 0, z0 + h / 2), 'tint_wall', jit=0.05)
    b.box((w + 0.06, d + 0.06, 0.14), (0, 0, z0 + h - 0.07), 'wood_d', jit=0.03)
    b.box((w + 0.06, d + 0.06, 0.12), (0, 0, z0 + 0.06), 'wood_d', jit=0.03)
    for i in range(bays + 1):
        x = -w / 2 + w * i / bays
        for y in (-d / 2, d / 2):
            b.box((0.17, 0.17, h), (x, y, z0 + h / 2), 'wood_d', jit=0.03)
    bw = w / bays
    for i in range(bays):
        x = -w / 2 + bw * (i + 0.5)
        if i == door:
            b.box((bw * 0.52, 0.07, h * 0.78), (x, -d / 2 - 0.03, z0 + h * 0.4), 'wood', jit=0.05)
            b.box((0.04, 0.09, h * 0.78), (x, -d / 2 - 0.04, z0 + h * 0.4), 'wood_d', jit=0)
            b.box((bw * 0.6, 0.1, 0.08), (x, -d / 2 - 0.03, z0 + h * 0.8), 'wood_d', jit=0)
        else:
            lattice(b, x, -d / 2 - 0.03, z0 + h * 0.56, bw * 0.5, h * 0.42, glow=glow)
    b.box((w * 0.62, 0.8, 0.1), (w * 0.08, -d / 2 - 0.42, 0.5), 'wood_l', jit=0.06)
    for x in (w * 0.08 - w * 0.29, w * 0.08 + w * 0.29):
        b.box((0.12, 0.12, 0.46), (x, -d / 2 - 0.74, 0.23), 'wood_d')
    b.box((0.7, 0.4, 0.16), (-w / 2 + w / bays * (door + 0.5), -d / 2 - 0.5, 0.08), 'stone_d', bevel=0.04, jit=0.06)
    b.box((0.42, 0.42, 1.5), (w / 2 + 0.36, d / 4, 0.75), 'mud', bevel=0.05, jit=0.08)
    b.box((0.5, 0.5, 0.1), (w / 2 + 0.36, d / 4, 1.52), 'stone_d', jit=0.05)
    thatch_roof(b, w, d, 2.3, 1.35)
    b.done(name, smooth=0, shade=(0.74, 1.08), under=0.3)


choga('choga_a', 6.4, 3.6, 3, 1)
choga('choga_b', 4.4, 3.2, 2, 0)
choga('choga_b_lit', 4.4, 3.2, 2, 0, glow=True)

export('night.glb')

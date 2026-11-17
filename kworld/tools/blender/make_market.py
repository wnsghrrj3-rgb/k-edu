"""케이월드 「장날」(조선 후기) 장면에만 쓰는 모델 — market.glb. 바닥 가운데가 원점, 앞은 -y(three 에서 +z).
쌀독(열린 독·쌀 더미) · 세금 궤(열린 궤·엽전 더미) · 좌판 물건 셋(쌀·무명·담배) · 등짐 셋 · 담배 포기 · 홍살문 · 서낭당 돌무더기 · 탈춤 마당 · 여물통 · 고추 멍석 · 허수아비 · 볏단 · 못줄."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('onggi', 0x6a4030), ('onggi_l', 0x8a5a40), ('onggi_in', 0x3a2418), ('straw', 0xd9b25a), ('straw_d', 0xb08a3e), ('straw_l', 0xe8cc7a), ('wood', 0x7a5632), ('wood_d', 0x4e3620), ('wood_l', 0xb08a5a), ('wood_r', 0xa8321e), ('stone', 0x9a968e), ('stone_d', 0x7d7a74), ('moss', 0x6f8f4a), ('rope', 0xc8b080), ('iron', 0x34343c), ('bronze', 0xb8923a), ('brass', 0xe0b84a), ('brass_d', 0x8a6a2a), ('rice', 0xf7f3e4), ('cotton', 0xf2f0e8), ('cotton_d', 0xd8d4c4), ('indigo', 0x4a5e8e), ('leaf_tob', 0xb07e3c), ('leaf_tob_d', 0x8a5626), ('leaf_g', 0x5a8a3a), ('leaf_gl', 0x7aa84a), ('pink', 0xe8a0b0), ('red', 0xc8402e), ('blue', 0x3a5aa8), ('yellow', 0xe8c040), ('white', 0xf6f4ee), ('green', 0x3f8a5a), ('gourd', 0xd8c890), ('ink', 0x2b2118), ('pepper', 0xb4342a), ('pepper_d', 0x8a241c), ('rag', 0xd8d0bc), ('rag_d', 0x8a9ab0)]:
    mat(n, c)
R = random.Random(23)


def wob(k=0.12, seed=1):
    rr = random.Random(seed)
    table = {}

    def f(v):
        key = (round(v.x, 3), round(v.y, 3), round(v.z, 3))
        if key not in table:
            table[key] = 1 + (rr.random() - 0.5) * 2 * k
        return v * table[key]
    return f


# ── 쌀독: 넓적한 돌 위에 놓인 열린 독(안이 보인다) · 기대 놓은 나무 뚜껑 · 바가지. 안쪽 벽의 반지름은 market.js 의 JP 와 맞춘다.
b = B()
b.box((2.0, 1.9, 0.12), (0, 0, 0.06), 'stone', bevel=0.04, jit=0.1)
b.lathe([(0.36, 0.12), (0.55, 0.3), (0.7, 0.62), (0.72, 0.92), (0.62, 1.2), (0.52, 1.34), (0.57, 1.42), (0.5, 1.45)], (0, 0, 0), 'onggi', seg=12, cap=False, jit=0.05)
b.lathe([(0.5, 1.45), (0.47, 1.42)], (0, 0, 0), 'onggi_l', seg=12, cap=False, jit=0.03)
b.lathe([(0.47, 1.42), (0.47, 1.32), (0.56, 1.18), (0.65, 0.92), (0.63, 0.62), (0.5, 0.34), (0.3, 0.26)], (0, 0, 0), 'onggi_in', seg=12, cap=False, jit=0.04)
b.cone(0.3, 0.3, 0.01, (0, 0, 0.26), 'onggi_in', seg=12)
for z in (0.9, 0.97):
    b.lathe([(0.725 - (z - 0.9) * 0.1, z), (0.73 - (z - 0.9) * 0.1, z + 0.03)], (0, 0, 0), 'onggi_l', seg=12, cap=False, jit=0)
b.cone(0.5, 0.5, 0.07, (-0.78, 0.5, 0.56), 'wood_l', seg=12, rot=(1.25, 0, -0.5), jit=0.06)
b.box((0.1, 0.5, 0.06), (-0.75, 0.46, 0.6), 'wood_d', rot=(1.25, 0, -0.5), jit=0.03)
b.ball(0.2, (0.72, -0.6, 0.2), 'gourd', sub=1, scale=(1, 1, 0.6), jit=0.06)
b.cone(0.16, 0.16, 0.01, (0.72, -0.6, 0.27), 'rice', seg=8)
b.done('ssaldok', smooth=35, shade=(0.7, 1.1), under=0.25)

b = B()
b.lathe([(1.0, 0.0), (0.82, 0.07), (0.45, 0.13), (0.04, 0.16)], (0, 0, 0), 'rice', seg=12, jit=0.035)
b.done('rice_top', smooth=0, shade=(0.96, 1.04), under=0.0)

# ── 세금 궤: 뚜껑을 뒤로 젖힌 큰 나무 궤(안이 보인다) · 엽전 더미(따로 — 오르내린다)
b = B()
W, D, Hh, t = 1.7, 1.1, 0.8, 0.08
b.box((W, D, 0.1), (0, 0, 0.05), 'wood_d', jit=0.04)
for s in (-1, 1):
    b.box((W, t, Hh), (0, s * (D / 2 - t / 2), Hh / 2), 'wood', jit=0.06)
    b.box((t, D - 2 * t, Hh), (s * (W / 2 - t / 2), 0, Hh / 2), 'wood', jit=0.06)
    for sy in (-1, 1):
        b.box((0.09, 0.03, Hh), (s * 0.55, sy * (D / 2 + 0.005), Hh / 2), 'iron', jit=0.03)
        b.box((0.14, 0.14, 0.14), (s * (W / 2 - 0.05), sy * (D / 2 - 0.05), 0.07), 'iron', jit=0.03)
        b.box((0.12, 0.12, 0.1), (s * (W / 2 - 0.04), sy * (D / 2 - 0.04), Hh - 0.05), 'bronze', jit=0.03)
    b.box((0.03, 0.3, 0.06), (s * (W / 2 + 0.02), 0, Hh * 0.62), 'iron')
b.box((W + 0.02, 0.03, 0.07), (0, -D / 2 - 0.005, Hh - 0.035), 'wood_d', jit=0.02)
b.box((0.2, 0.05, 0.24), (0, -D / 2 - 0.03, Hh * 0.6), 'bronze', bevel=0.02, jit=0.03)
b.box((0.05, 0.06, 0.08), (0, -D / 2 - 0.04, Hh * 0.56), 'ink')
rx = 1.2
lc = (0, D / 2 + 0.02 + 0.55 * math.cos(rx), Hh + 0.55 * math.sin(rx))
b.box((W + 0.1, 1.1, 0.09), lc, 'wood', rot=(rx, 0, 0), jit=0.06)
for s in (-1, 1):
    b.box((0.09, 1.12, 0.11), (s * 0.55, lc[1], lc[2]), 'iron', rot=(rx, 0, 0), jit=0.03)
    b.box((W + 0.12, 0.05, 0.1), (0, lc[1] + s * 0.52 * math.cos(rx), lc[2] + s * 0.52 * math.sin(rx)), 'wood_d', rot=(rx, 0, 0), jit=0.03)
b.done('gwe', smooth=0, shade=(0.72, 1.08), under=0.25)

b = B()
b.box((1.5, 0.9, 0.1), (0, 0, 0.05), 'bronze', jit=0.12)
for i in range(22):
    x, y = (R.random() - 0.5) * 1.36, (R.random() - 0.5) * 0.76
    b.cone(0.085, 0.085, 0.025, (x, y, 0.11 + R.random() * 0.03), 'brass' if i % 3 else 'bronze', seg=6, rot=((R.random() - 0.5) * 0.7, (R.random() - 0.5) * 0.7, 0), jit=0.1)
for x, y, a in [(-0.35, 0.1, 0.4), (0.3, -0.15, -0.5)]:   # 엽전 꾸러미 둘
    for k in range(7):
        b.cone(0.09, 0.09, 0.04, (x + math.cos(a) * (k - 3) * 0.058, y + math.sin(a) * (k - 3) * 0.058, 0.2), 'brass' if k % 2 else 'bronze', seg=6, rot=(0, math.pi / 2, a), jit=0.08)
b.done('coins', smooth=0, shade=(0.9, 1.08), under=0.1)


# ── 좌판에 올리는 물건(원점 = 좌판 위 가운데, 너비 2 안쪽 · 깊이 0.8 안쪽)
def open_sack(b, x, y, s=1.0, heap='rice'):
    b.lathe([(0.24 * s, 0), (0.33 * s, 0.1 * s), (0.34 * s, 0.3 * s), (0.3 * s, 0.4 * s), (0.34 * s, 0.46 * s)], (x, y, 0), 'straw', seg=9, cap=True, jit=0.08)
    b.lathe([(0.305 * s, 0.4 * s), (0.31 * s, 0.43 * s)], (x, y, 0), 'straw_d', seg=9, cap=False, jit=0)
    b.lathe([(0.3 * s, 0.42 * s), (0.2 * s, 0.5 * s), (0.02 * s, 0.56 * s)], (x, y, 0), heap, seg=9, cap=True, jit=0.03)


b = B()
open_sack(b, -0.66, 0.05, 1.0)
open_sack(b, 0.02, 0.1, 0.92)
b.box((0.42, 0.42, 0.26), (0.68, 0.0, 0.13), 'wood_l', jit=0.06)      # 말(곡식을 되는 네모 그릇)
b.box((0.44, 0.44, 0.03), (0.68, 0.0, 0.255), 'wood_d', jit=0.03)
b.cone(0.26, 0.02, 0.14, (0.68, 0.0, 0.33), 'rice', seg=4, rot=(0, 0, math.pi / 4), jit=0.03)
b.box((0.2, 0.2, 0.12), (0.34, -0.3, 0.06), 'wood', jit=0.05)          # 되
b.cone(0.11, 0.01, 0.07, (0.34, -0.3, 0.15), 'rice', seg=4, rot=(0, 0, math.pi / 4), jit=0.03)
b.done('goods_rice', smooth=0, shade=(0.8, 1.08), under=0.2)

b = B()
for x, n, tw in [(-0.66, 4, 0.05), (0.02, 3, -0.08), (0.66, 2, 0.1)]:
    for k in range(n):
        dyed = (x > 0.5 and k == n - 1) or (x < -0.5 and k == 1)
        b.box((0.56, 0.36, 0.13), (x + (k % 2) * 0.03, 0.02, 0.07 + k * 0.135), 'indigo' if dyed else ('cotton' if k % 2 == 0 else 'cotton_d'), bevel=0.045, rot=(0, 0, tw * (k + 1) * 0.5), jit=0.04)
b.cone(0.11, 0.11, 0.6, (0.62, 0.02, 0.42), 'cotton', seg=8, rot=(0, math.pi / 2, 0.25), jit=0.05)   # 말아 둔 한 필
b.cone(0.03, 0.03, 0.66, (0.62, 0.02, 0.42), 'wood_l', seg=5, rot=(0, math.pi / 2, 0.25))
b.box((0.5, 0.3, 0.02), (0.05, -0.02, 0.485), 'cotton', rot=(0, 0, 0.3), jit=0.03)
b.done('goods_cloth', smooth=30, shade=(0.82, 1.06), under=0.2)


def tob_bundle(b, x, y, z, a, s=1.0):
    """엮은 담뱃잎 한 묶음: 넓적한 잎 여러 장을 부채꼴로 겹치고 꼭지를 새끼로 묶는다."""
    for k in range(5):
        aa = a + (k - 2) * 0.2
        b.ball(0.3 * s, (x + math.cos(aa) * 0.22 * s, y + math.sin(aa) * 0.22 * s, z + 0.03 + k * 0.012), 'leaf_tob' if k % 2 else 'leaf_tob_d', sub=1, scale=(1.0, 0.5, 0.1), rot=(0, 0, aa), jit=0.12)
    b.cone(0.045 * s, 0.045 * s, 0.08 * s, (x - math.cos(a) * 0.06 * s, y - math.sin(a) * 0.06 * s, z + 0.05), 'rope', seg=6, rot=(0, math.pi / 2, a))


b = B()
tob_bundle(b, -0.72, 0.05, 0.0, 0.3); tob_bundle(b, -0.6, -0.1, 0.07, 1.2, 0.9); tob_bundle(b, -0.1, 0.1, 0.0, -0.4); tob_bundle(b, 0.0, -0.05, 0.07, 0.7, 0.9); tob_bundle(b, -0.38, 0.0, 0.14, 0.1, 0.85)
b.box((0.5, 0.4, 0.07), (0.66, 0.05, 0.035), 'wood', jit=0.05)          # 썬 담배 목판
b.box((0.42, 0.32, 0.06), (0.66, 0.05, 0.08), 'leaf_tob_d', jit=0.14)
b.cone(0.016, 0.016, 0.62, (0.5, -0.3, 0.03), 'wood_l', seg=5, rot=(0, math.pi / 2, 0.12))   # 곰방대
b.cone(0.045, 0.03, 0.06, (0.81, -0.26, 0.05), 'bronze', seg=6)
b.cone(0.02, 0.012, 0.08, (0.17, -0.34, 0.03), 'bronze', seg=5, rot=(0, math.pi / 2, 0.12))
b.done('goods_tob', smooth=0, shade=(0.82, 1.08), under=0.2)

# ── 등에 진 짐 셋(원점 = 한가운데, 0.56 × 0.4 × 0.44)
b = B()
b.cone(0.2, 0.2, 0.54, (0, 0, 0), 'straw', seg=9, rot=(0, math.pi / 2, 0), bevel=0.05, jit=0.08)
for x in (-0.17, 0, 0.17):
    b.cone(0.207, 0.207, 0.035, (x, 0, 0), 'straw_d', seg=9, rot=(0, math.pi / 2, 0), cap=False)
for s in (-1, 1):
    b.cone(0.12, 0.12, 0.012, (s * 0.272, 0, 0), 'straw_l', seg=9, rot=(0, math.pi / 2, 0))
b.done('pk_rice', smooth=30, shade=(0.8, 1.08), under=0.25)
b = B()
for k in range(3):
    b.box((0.54, 0.4, 0.125), (0, 0, -0.13 + k * 0.13), 'cotton' if k != 1 else 'cotton_d', bevel=0.045, jit=0.04)
for x in (-0.14, 0.14):
    b.box((0.03, 0.42, 0.41), (x, 0, 0), 'indigo', jit=0)
b.done('pk_cloth', smooth=30, shade=(0.82, 1.06), under=0.25)
b = B()
for k in range(6):
    b.ball(0.3, (0, (k % 2 - 0.5) * 0.06, -0.14 + k * 0.055), 'leaf_tob' if k % 2 else 'leaf_tob_d', sub=1, scale=(0.95, 0.66, 0.12), rot=(0, 0, (k - 2.5) * 0.12), jit=0.1)
for x in (-0.13, 0.13):
    b.box((0.03, 0.4, 0.2), (x, 0, 0.0), 'rope', jit=0)
b.done('pk_tob', smooth=0, shade=(0.8, 1.08), under=0.25)

# ── 담배 포기: 곧은 줄기에 넓은 잎이 돌려 나고 꼭대기에 분홍 꽃
b = B()
b.cone(0.05, 0.03, 1.0, (0, 0, 0.5), 'leaf_g', seg=5, jit=0.05)
for k in range(8):
    a = k * 2.4
    z = 0.14 + k * 0.1
    ln = 0.46 - k * 0.035
    droop = 0.42 - k * 0.1
    b.ball(1.0, (math.cos(a) * ln * 0.8, math.sin(a) * ln * 0.8, z + 0.04 - max(0, droop) * ln * 0.3), 'leaf_g' if k % 2 else 'leaf_gl', sub=1, scale=(ln, ln * 0.46, 0.035), rot=(0, droop, a), jit=0.1)
for k in range(4):
    a = k * 1.6
    b.ball(0.075, (math.cos(a) * 0.07, math.sin(a) * 0.07, 1.03 + (k % 2) * 0.05), 'pink', sub=1, jit=0.05)
b.done('tob_plant', smooth=0, shade=(0.66, 1.12), under=0.3)

# ── 홍살문(관아 앞 붉은 문): 기둥 둘 · 가로대 둘 · 살 · 가운데 태극
b = B()
for s in (-1, 1):
    b.box((0.56, 0.56, 0.5), (s * 2.1, 0, 0.25), 'stone', bevel=0.06, jit=0.08)
    b.cone(0.15, 0.13, 4.7, (s * 2.1, 0, 2.75), 'wood_r', seg=8, jit=0.04)
    b.cone(0.16, 0.02, 0.22, (s * 2.1, 0, 5.2), 'wood_r', seg=8, jit=0.04)
b.box((4.9, 0.14, 0.16), (0, 0, 3.75), 'wood_r', jit=0.04)
b.box((4.9, 0.14, 0.16), (0, 0, 4.45), 'wood_r', jit=0.04)
for i in range(-5, 6):
    if i == 0:
        continue
    hh = 1.25 + (0.12 if abs(i) % 2 else 0)
    b.box((0.06, 0.06, hh), (i * 0.34, 0, 3.75 + hh / 2), 'wood_r', jit=0.05)
    b.cone(0.07, 0.005, 0.2, (i * 0.34, 0, 3.75 + hh + 0.1), 'wood_r', seg=4, jit=0.05)
b.box((0.07, 0.07, 1.5), (0, 0, 4.5), 'wood_r')
rr_ = 0.3
b.prism([(math.cos(i * math.pi / 8) * rr_, math.sin(i * math.pi / 8) * rr_) for i in range(9)], 0.09, (0, 0, 5.3), 'red', jit=0.02)
b.prism([(math.cos(math.pi + i * math.pi / 8) * rr_, math.sin(math.pi + i * math.pi / 8) * rr_) for i in range(9)], 0.09, (0, 0, 5.3), 'blue', jit=0.02)
b.done('hongsal', smooth=0, shade=(0.82, 1.06), under=0.15)

# ── 서낭당 돌무더기(고갯마루): 돌을 쌓은 무더기 · 오색 천을 맨 장대
b = B()
rs = random.Random(5)
for tier, (n, rad, z, r) in enumerate([(9, 0.95, 0.2, 0.36), (7, 0.66, 0.55, 0.32), (5, 0.4, 0.9, 0.28), (3, 0.2, 1.2, 0.24), (1, 0.0, 1.46, 0.2)]):
    for i in range(n):
        a = i * 6.283 / n + tier * 0.5
        b.ball(r * (0.85 + rs.random() * 0.3), (math.cos(a) * rad, math.sin(a) * rad, z), 'stone' if (i + tier) % 2 else 'stone_d', sub=1, scale=(1.15, 1.0, 0.8), rot=(0, 0, a), jit=0.1, f=wob(0.16, tier * 10 + i))
b.ball(0.5, (0, 0, 0.5), 'stone_d', sub=1, scale=(1.3, 1.3, 1.6), jit=0.08)
b.ball(0.3, (0.5, -0.5, 0.52), 'moss', sub=1, scale=(1.2, 1.0, 0.3), jit=0.1)
b.cone(0.045, 0.03, 2.6, (-1.25, 0.2, 1.3), 'wood', seg=5, rot=(0, -0.08, 0), jit=0.05)
for k, m in enumerate(['red', 'blue', 'yellow', 'white', 'green']):
    z = 2.45 - k * 0.2
    b.grid(1, 3, lambda u, v, z=z, k=k: (-1.33 + (0.05 + v * 0.55) * math.cos(0.5 + k * 1.1) + 0.02 * k, 0.2 + (0.05 + v * 0.55) * math.sin(0.5 + k * 1.1), z - v * v * 0.5 - u * 0.12), m, jit=0.04)
b.done('cairn', smooth=0, shade=(0.84, 1.12), under=0.18)

# ── 탈춤 마당: 낮은 널마루(7 × 1.8 × 0.4) · 뒤 장대 둘 · 오색 천 줄
b = B()
b.box((7.0, 1.8, 0.26), (0, 0, 0.13), 'wood_d', jit=0.05)
for i in range(14):
    b.box((0.47, 1.84, 0.1), (-3.25 + i * 0.5, 0, 0.35), 'wood_l' if i % 2 else 'wood', jit=0.07)
for s in (-1, 1):
    b.box((7.04, 0.06, 0.12), (0, s * 0.9, 0.34), 'wood_d', jit=0.03)
    b.cone(0.07, 0.05, 3.3, (s * 3.42, 0.95, 1.65), 'wood_d', seg=6, jit=0.05)
    b.ball(0.09, (s * 3.42, 0.95, 3.34), 'red', sub=1, jit=0.04)
sag = lambda u: 3.2 - 0.5 * math.sin(u * math.pi)
for i in range(12):
    u0, u1 = i / 12, (i + 1) / 12
    x0, x1 = -3.42 + u0 * 6.84, -3.42 + u1 * 6.84
    b.box((math.hypot(x1 - x0, sag(u1) - sag(u0)) + 0.02, 0.03, 0.03), ((x0 + x1) / 2, 0.95, (sag(u0) + sag(u1)) / 2), 'rope', rot=(0, -math.atan2(sag(u1) - sag(u0), x1 - x0), 0))
for i in range(11):
    u = (i + 1) / 12
    x = -3.42 + u * 6.84
    m = ['red', 'blue', 'yellow', 'white', 'green'][i % 5]
    b.grid(1, 2, lambda p, q, x=x, u=u: (x - 0.17 + p * 0.34 * (1 - q * 0.5) + q * 0.085, 0.95 + 0.04 * math.sin(x * 3 + q * 2), sag(u) - 0.02 - q * 0.56), m, jit=0.04)
b.done('stage', smooth=0, shade=(0.78, 1.07), under=0.25)

# ── 여물통(통나무를 판 구유) · 고추 말리는 멍석 · 허수아비 · 볏단(세워 말리는 것)
b = B()
b.box((1.5, 0.5, 0.34), (0, 0, 0.33), 'wood', bevel=0.07, jit=0.07)
b.box((1.3, 0.34, 0.05), (0, 0, 0.5), 'straw', jit=0.14)
b.ball(0.2, (0.2, 0.02, 0.5), 'straw_l', sub=1, scale=(2.2, 0.8, 0.5), jit=0.12)
for x in (-0.5, 0.5):
    b.box((0.16, 0.56, 0.2), (x, 0, 0.1), 'wood_d', jit=0.05)
b.done('trough', smooth=0, shade=(0.72, 1.08), under=0.25)
b = B()
b.box((2.6, 1.8, 0.04), (0, 0, 0.03), 'straw', jit=0.07)
for i in range(7):
    b.box((0.03, 1.8, 0.045), (-1.2 + i * 0.4, 0, 0.032), 'straw_d', jit=0.05)
for s in (-1, 1):
    b.cone(0.05, 0.05, 1.8, (s * 1.3, 0, 0.05), 'straw_d', seg=5, rot=(math.pi / 2, 0, 0), jit=0.05)
b.box((2.2, 1.4, 0.04), (0, 0, 0.07), 'pepper', jit=0.16)
rp = random.Random(9)
for i in range(34):
    b.cone(0.05, 0.012, 0.3, ((rp.random() - 0.5) * 2.1, (rp.random() - 0.5) * 1.3, 0.115), 'pepper' if i % 3 else 'pepper_d', seg=4, cap=False, rot=(0, math.pi / 2, rp.random() * 6.2), jit=0.14)
b.done('meongseok', smooth=0, shade=(0.9, 1.06), under=0.05)
b = B()
b.cone(0.05, 0.04, 2.0, (0, 0, 1.0), 'wood', seg=5, jit=0.05)
b.cone(0.035, 0.03, 1.7, (0, 0, 1.42), 'wood', seg=5, rot=(0, math.pi / 2, 0), jit=0.05)
b.box((0.86, 0.2, 0.62), (0, 0, 1.2), 'rag', bevel=0.05, jit=0.06, f=lambda v: Vector((v.x * (1 + 0.25 * (0.31 - v.z)), v.y, v.z)))
for s in (-1, 1):
    b.box((0.52, 0.17, 0.2), (s * 0.6, 0, 1.4), 'rag', bevel=0.04, jit=0.06)
    b.ball(0.07, (s * 0.88, 0, 1.4), 'straw', sub=1, scale=(1.6, 1, 1), jit=0.1)
b.box((0.9, 0.22, 0.06), (0, 0, 1.0), 'rag_d', jit=0.04)
b.ball(0.22, (0, 0, 1.76), 'straw_l', sub=1, scale=(1, 1, 1.05), jit=0.08)
b.box((0.05, 0.02, 0.05), (-0.08, -0.2, 1.8), 'ink'); b.box((0.05, 0.02, 0.05), (0.08, -0.2, 1.8), 'ink'); b.box((0.12, 0.02, 0.03), (0, -0.2, 1.69), 'ink')
b.cone(0.5, 0.03, 0.3, (0, 0, 2.02), 'straw', seg=9, jit=0.1)
b.cone(0.06, 0.1, 0.3, (0, 0, 0.9), 'straw', seg=6, jit=0.1)
b.done('scarecrow', smooth=0, shade=(0.74, 1.08), under=0.25)
b = B()
for i in range(5):   # 여럿을 세우므로 면을 아낀다(한 단 92면)
    a = i * 1.257
    b.cone(0.22, 0.07, 1.0, (math.cos(a) * 0.3, math.sin(a) * 0.3, 0.48), 'straw' if i % 2 else 'straw_l', seg=4, cap=False, rot=(0, -0.38, a), jit=0.1)
    b.cone(0.15, 0.03, 0.46, (math.cos(a) * 0.06, math.sin(a) * 0.06, 1.1), 'brass', seg=4, cap=False, rot=(0, 0.5, a), jit=0.14)
b.lathe([(0.2, 0.62), (0.21, 0.69)], (0, 0, 0), 'straw_d', seg=6, cap=False, jit=0)
b.done('sheaf', smooth=0, shade=(0.7, 1.1), under=0.25)

# ── 못줄: 논을 가로질러 친 줄(붉은 눈금마다 모를 꽂는다) · 양 끝 말뚝
b = B()
for s in (-1, 1):
    b.cone(0.05, 0.035, 1.0, (s * 10.6, 0, 0.45), 'wood', seg=5, rot=(0, s * 0.12, 0), jit=0.05)
for i in range(14):
    x0, x1 = -10.6 + i * 21.2 / 14, -10.6 + (i + 1) * 21.2 / 14
    z0, z1 = 0.62 - 0.1 * math.sin(i / 14 * math.pi), 0.62 - 0.1 * math.sin((i + 1) / 14 * math.pi)
    b.box((math.hypot(x1 - x0, z1 - z0) + 0.01, 0.03, 0.03), ((x0 + x1) / 2, 0, (z0 + z1) / 2), 'rope', rot=(0, -math.atan2(z1 - z0, x1 - x0), 0), jit=0.04)
    if i < 13:
        b.box((0.05, 0.035, 0.14), (x1 - 0.01, 0, z1 - 0.07), 'red', jit=0.05)
b.done('motjul', smooth=0, shade=(0.9, 1.05), under=0.05)

export('market.glb')

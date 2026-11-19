"""케이월드 「다섯 해」(farm) — 논에 서는 것: 모 · 자라는 벼 · 익은 벼(고개 숙인 이삭) · 마른 벼 · 그루터기 · 볏단 · 모 다발 · 콩. farm.glb.
준호 11-20: 「벼가 뿔 모양이다」 → 원뿔 대신 휘어진 잎(띠)으로. 한 그루 = 포기 넷(2×2) — 논 한 배미에 88그루씩 깔아 빽빽하게 보이게.
잎은 앞뒤 없는 띠(그리는 쪽이 DoubleSide)라 면이 적다: 잎 하나 = 세모 넷."""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('mo_g', 0x8fd45a), ('mo_g2', 0x74c04a), ('rice_g', 0x5fae3c), ('rice_g2', 0x4a9634), ('ripe_l', 0xb8b452), ('ripe_l2', 0xa8a040), ('ripe_g', 0xe8b83a),
             ('dead', 0xb09a5a), ('dead2', 0x9a8448), ('straw', 0xdcc074), ('straw_d', 0xb09048), ('rope', 0x7a5a32), ('mud', 0x5a4630), ('bean_l', 0x6aa848), ('bean_l2', 0x5a9a3e), ('stem', 0x5a8a3a)]:
    mat(n, c)


def leaf(b, bx, by, ang, lean, L, w, m, droop=0.0, ny=2, z0=0.0):
    """휘어진 잎 띠. ang = 바라보는 쪽, lean = 기울기(0 = 곧게 위), droop = 끝이 처지는 정도(이삭은 크게)."""
    sl, cl, ca, sa = math.sin(lean), math.cos(lean), math.cos(ang), math.sin(ang)

    def fn(u, v):
        wid = (u - 0.5) * w * (1 - 0.82 * v)
        dx = sl * L * v + droop * L * v * v * 0.55
        z = z0 + cl * L * v - droop * L * v * v * 0.75
        return (bx + ca * dx - sa * wid, by + sa * dx + ca * wid, max(0.0, z))
    b.grid(1, ny, fn, m, jit=0)


HILLS = [(-0.55, -0.55), (0.55, -0.5), (-0.5, 0.55), (0.55, 0.55)]


def patch(b, seed, per, Ls, leans, w, mats, droop=0.0, extra=None):
    rr = random.Random(seed)
    for hi, (hx, hy) in enumerate(HILLS):
        hx += (rr.random() - 0.5) * 0.18; hy += (rr.random() - 0.5) * 0.18
        a0 = rr.random() * 6.28
        for i in range(per):
            a = a0 + i * 6.28 / per + (rr.random() - 0.5) * 0.6
            leaf(b, hx, hy, a, leans[0] + rr.random() * (leans[1] - leans[0]), Ls[0] + rr.random() * (Ls[1] - Ls[0]), w, mats[(i + hi) % len(mats)], droop=droop * (0.7 + rr.random() * 0.6))
        if extra:
            extra(b, hx, hy, rr)


# 모(옮겨 심은 지 얼마 안 된 어린 벼) — 곧고 짧고 밝다
b = B(); patch(b, 1, 5, (0.34, 0.48), (0.08, 0.34), 0.075, ['mo_g', 'mo_g2'], droop=0.12); b.done('rice_young', smooth=0, shade=(0.7, 1.12), under=0.12)
# 자라는 벼 — 잎이 길고 바깥으로 휜다
b = B(); patch(b, 2, 5, (0.8, 1.05), (0.16, 0.5), 0.11, ['rice_g', 'rice_g2'], droop=0.3); b.done('rice_grow', smooth=0, shade=(0.62, 1.14), under=0.12)


def ears(b, hx, hy, rr):
    for k in range(2):   # 이삭: 무거워 고개를 숙인다
        a = rr.random() * 6.28
        leaf(b, hx, hy, a, 0.16 + rr.random() * 0.2, 0.95 + rr.random() * 0.15, 0.17, 'ripe_g', droop=0.8, ny=3)


# 익은 벼 — 누런 잎 셋 + 고개 숙인 이삭 둘
b = B(); patch(b, 3, 3, (0.72, 0.95), (0.2, 0.45), 0.1, ['ripe_l', 'ripe_l2'], droop=0.35, extra=ears); b.done('rice_ripe', smooth=0, shade=(0.7, 1.14), under=0.12)
# 마른 벼(가뭄) — 낮고 처지고 바랬다
b = B(); patch(b, 4, 4, (0.45, 0.7), (0.35, 0.8), 0.1, ['dead', 'dead2'], droop=0.7); b.done('rice_dead', smooth=0, shade=(0.7, 1.08), under=0.12)

# 그루터기 — 벤 자리(짧은 짚이 엇갈려 선다)
b = B()
rr = random.Random(5)
for hx, hy in HILLS:
    for k in range(2):
        a = rr.random() * 3.14 + k * 1.57
        h = 0.13 + rr.random() * 0.07
        b.grid(1, 1, lambda u, v, hx=hx, hy=hy, a=a, h=h: (hx + math.cos(a) * (u - 0.5) * 0.34, hy + math.sin(a) * (u - 0.5) * 0.34, v * h), 'straw' if k else 'straw_d', jit=0)
b.done('rice_stub', smooth=0, shade=(0.7, 1.1), under=0.35)

# 볏단 — 밑동을 펴서 세워 말린다. 허리를 새끼로 묶고, 위로 이삭이 숙인다
b = B()
b.lathe([(0.0, 0.0), (0.26, 0.0), (0.2, 0.25), (0.12, 0.5), (0.13, 0.58), (0.17, 0.78), (0.1, 0.9), (0.0, 0.94)], (0, 0, 0), 'straw', seg=7, jit=0)
b.lathe([(0.135, 0.5), (0.14, 0.58)], (0, 0, 0), 'rope', seg=7, cap=False, jit=0)
rr = random.Random(6)
for k in range(7):
    a = k * 0.9 + rr.random() * 0.4
    leaf(b, math.cos(a) * 0.06, math.sin(a) * 0.06, a, 0.25, 0.5 + rr.random() * 0.12, 0.09, 'ripe_g', droop=0.9, ny=3, z0=0.8)
b.done('rice_sheaf', smooth=0, shade=(0.66, 1.12), under=0.12)

# 모 다발(지고 가는 것) — 뿌리에 흙이 붙은 모 셋 묶음
b = B()
rr = random.Random(7)
for k, (ox, oy) in enumerate([(-0.17, 0), (0.17, 0), (0, 0.14)]):
    b.lathe([(0.0, 0.0), (0.08, 0.0), (0.09, 0.08), (0.06, 0.16)], (ox, oy, 0), 'mud', seg=6, jit=0)
    b.lathe([(0.062, 0.12), (0.066, 0.16)], (ox, oy, 0), 'rope', seg=6, cap=False, jit=0)
    for i in range(5):
        leaf(b, ox, oy, i * 1.26 + rr.random() * 0.4, 0.12 + rr.random() * 0.22, 0.42 + rr.random() * 0.12, 0.05, 'mo_g' if i % 2 else 'mo_g2', droop=0.15, z0=0.14)
b.done('mo_bundle', smooth=0, shade=(0.72, 1.1), under=0.2)

# 콩 — 줄기에 넓은 잎이 처진다
b = B()
rr = random.Random(8)
for hx, hy in [(-0.45, -0.35), (0.45, -0.3), (0.0, 0.45)]:
    b.cone(0.03, 0.015, 0.42, (hx, hy, 0.21), 'stem', seg=3, cap=False, jit=0)
    for i in range(4):
        leaf(b, hx, hy, i * 1.57 + rr.random() * 0.5, 0.6 + rr.random() * 0.3, 0.3, 0.2, 'bean_l' if i % 2 else 'bean_l2', droop=0.45, z0=0.18 + i * 0.05)
b.done('bean', smooth=0, shade=(0.68, 1.12), under=0.12)

export('farm.glb')

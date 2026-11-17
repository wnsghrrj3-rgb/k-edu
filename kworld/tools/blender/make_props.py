"""케이월드 소품·짐승 — props.glb. 바닥 가운데가 원점, 앞은 -y(짐승 머리는 -y 쪽).
tint_cloth(보따리·깃발 천) · tint_fur(털) 는 장면이 바꿀 수 있다. glow_fire·glow_lamp 는 스스로 빛난다."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_cloth', 0xc8a050), ('tint_fur', 0xb07a48), ('onggi', 0x6a4030), ('onggi_l', 0x8a5a40), ('clay', 0xc89868), ('iron', 0x34343c), ('straw', 0xd9b25a), ('straw_d', 0xb08a3e), ('wood', 0x7a5632), ('wood_d', 0x4e3620), ('wood_l', 0xb08a5a), ('stone', 0x9a968e), ('stone_d', 0x7d7a74), ('rope', 0xc8b080), ('white', 0xf6f4ee), ('ink', 0x2b2118), ('red', 0xc8402e), ('paper', 0xf4ecd4), ('bronze', 0xb8923a), ('glow_fire', 0xffb04a), ('glow_lamp', 0xffd88a), ('rice', 0xf4f0e0), ('hide', 0x8a6a4a), ('cream', 0xe8dcc0), ('pink', 0xd89a8a), ('horn', 0xd8ccb0), ('green', 0x5a8a4a), ('water', 0x4a7a9a)]:
    mat(n, c)


def jar(b, x, y, s=1.0, m='onggi', lid=True):
    b.lathe([(0.2 * s, 0), (0.36 * s, 0.14 * s), (0.44 * s, 0.42 * s), (0.4 * s, 0.7 * s), (0.27 * s, 0.86 * s), (0.29 * s, 0.92 * s)], (x, y, 0), m, seg=10, jit=0.05)
    if lid:
        b.lathe([(0.33 * s, 0.92 * s), (0.2 * s, 1.0 * s), (0.06 * s, 1.03 * s), (0.06 * s, 1.08 * s)], (x, y, 0), 'onggi_l', seg=10, jit=0.05)


b = B(); jar(b, 0, 0, 1.15); b.done('jar_a', smooth=35, shade=(0.66, 1.1))
b = B(); jar(b, 0, 0, 0.7, 'onggi_l'); b.done('jar_b', smooth=35, shade=(0.66, 1.1))
b = B()
b.box((2.6, 1.7, 0.24), (0, 0, 0.12), 'stone', bevel=0.05, jit=0.1)
for x, y, s, m in [(-0.8, 0.3, 1.1, 'onggi'), (0.05, 0.4, 1.25, 'onggi'), (0.85, 0.3, 0.95, 'onggi_l'), (-0.45, -0.4, 0.7, 'onggi_l'), (0.4, -0.45, 0.75, 'onggi')]:
    jar(b, x, y, s, m)
b.done('jangdok', smooth=35, shade=(0.7, 1.1))

# 빗살무늬 토기(뾰족 바닥) · 민무늬 토기
b = B(); b.lathe([(0.03, 0), (0.2, 0.25), (0.31, 0.6), (0.34, 0.86), (0.36, 0.9)], (0, 0, 0), 'clay', seg=10, jit=0.06)
for z in (0.45, 0.62, 0.78):
    b.lathe([(0.27 + z * 0.09, z), (0.275 + z * 0.09, z + 0.03)], (0, 0, 0), 'wood', seg=10, cap=False, jit=0)
b.done('pot_comb', smooth=0, shade=(0.7, 1.1))
b = B(); b.lathe([(0.2, 0), (0.33, 0.2), (0.36, 0.5), (0.28, 0.72), (0.31, 0.8)], (0, 0, 0), 'clay', seg=10, jit=0.06); b.done('pot_plain', smooth=35, shade=(0.7, 1.1))

# 가마솥 걸린 부뚜막
b = B()
b.box((1.5, 1.2, 0.6), (0, 0, 0.3), 'stone', bevel=0.08, jit=0.12)
b.box((0.5, 0.1, 0.34), (0, -0.6, 0.2), 'ink'); b.box((0.4, 0.04, 0.22), (0, -0.62, 0.16), 'glow_fire')
b.lathe([(0.3, 0.55), (0.5, 0.66), (0.52, 0.82), (0.44, 0.86)], (0, 0, 0), 'iron', seg=12, jit=0.04)
b.lathe([(0.46, 0.86), (0.3, 0.96), (0.08, 0.99), (0.08, 1.06)], (0, 0, 0), 'iron', seg=12, jit=0.04)
b.done('gamasot', smooth=30, shade=(0.7, 1.1))

# 볏가리 · 가마니 · 가마니 더미 · 광주리 · 궤 · 통
b = B(); b.lathe([(1.0, 0), (1.05, 0.5), (0.85, 1.3), (0.3, 2.0), (0.04, 2.25)], (0, 0, 0), 'straw', seg=10, jit=0.14)
b.lathe([(0.9, 1.22), (0.92, 1.3)], (0, 0, 0), 'straw_d', seg=10, cap=False); b.done('straw_stack', smooth=0, shade=(0.66, 1.1))


def sack(b, x, y, z, rot=0, m='straw'):
    b.box((0.85, 0.5, 0.4), (x, y, z + 0.2), m, bevel=0.14, bseg=2, rot=(0, 0, rot), jit=0.08)
    for s in (-0.25, 0.25):
        b.box((0.03, 0.53, 0.42), (x + math.cos(rot) * s, y + math.sin(rot) * s, z + 0.2), 'straw_d', rot=(0, 0, rot), jit=0)


b = B(); sack(b, 0, 0, 0); b.done('sack', smooth=30, shade=(0.72, 1.08))
b = B(); sack(b, -0.45, 0, 0); sack(b, 0.45, 0.05, 0, 0.1); sack(b, 0, -0.5, 0, 1.5); sack(b, 0, 0.05, 0.4, 0.05); sack(b, 0.05, -0.4, 0.4, 1.45); sack(b, 0, -0.1, 0.8, 0.2)
b.done('sack_pile', smooth=30, shade=(0.66, 1.1))
b = B(); b.lathe([(0.3, 0), (0.46, 0.3), (0.48, 0.36)], (0, 0, 0), 'wood_l', seg=10, cap=False, jit=0.12); b.cone(0.3, 0.3, 0.03, (0, 0, 0.02), 'wood_l', seg=10); b.cone(0.44, 0.38, 0.1, (0, 0, 0.25), 'rice', seg=10, jit=0.04)
b.done('basket', smooth=0, shade=(0.72, 1.08))
b = B(); b.box((1.1, 0.6, 0.6), (0, 0, 0.34), 'wood', bevel=0.03, jit=0.06); b.box((1.16, 0.66, 0.1), (0, 0, 0.66), 'wood_d', bevel=0.02)
for x in (-0.5, 0.5):
    b.box((0.06, 0.64, 0.62), (x, 0, 0.34), 'iron')
b.box((0.14, 0.04, 0.18), (0, -0.32, 0.5), 'bronze'); b.done('chest', smooth=0, shade=(0.72, 1.08))
b = B(); b.lathe([(0.3, 0), (0.37, 0.3), (0.37, 0.55), (0.3, 0.85)], (0, 0, 0), 'wood', seg=10, jit=0.08)
for z in (0.14, 0.72):
    b.lathe([(0.345 if z < 0.5 else 0.335, z), (0.35 if z < 0.5 else 0.34, z + 0.05)], (0, 0, 0), 'iron', seg=10, cap=False)
b.done('barrel', smooth=0, shade=(0.7, 1.08))

# 수레(소달구지) · 지게 · 리어카(1950)
b = B()
b.box((1.5, 2.4, 0.12), (0, 0, 0.75), 'wood_l', jit=0.08)
for s in (-1, 1):
    b.box((0.08, 2.4, 0.4), (s * 0.75, 0, 0.98), 'wood', jit=0.06)
    b.cone(0.62, 0.62, 0.1, (s * 0.9, 0.2, 0.62), 'wood_d', seg=12, rot=(0, math.pi / 2, 0), jit=0.06)
    b.cone(0.12, 0.12, 0.16, (s * 0.92, 0.2, 0.62), 'wood_l', seg=8, rot=(0, math.pi / 2, 0))
    b.box((0.08, 1.9, 0.08), (s * 0.55, -2.1, 0.72), 'wood', jit=0.05)
b.box((1.2, 0.08, 0.08), (0, -3.0, 0.72), 'wood')
b.done('cart', smooth=0, shade=(0.7, 1.08))
b = B()
for s in (-1, 1):
    b.box((0.07, 0.07, 1.5), (s * 0.28, 0.1, 0.72), 'wood', rot=(0.22, s * 0.1, 0), jit=0.05)
    b.box((0.06, 0.6, 0.06), (s * 0.3, -0.1, 0.62), 'wood_l', rot=(0.5, 0, 0))
for z in (0.4, 0.8, 1.15):
    b.box((0.62, 0.05, 0.05), (0, 0.02 + z * 0.2, z), 'wood_l')
b.box((0.05, 0.05, 1.2), (0, -0.42, 0.55), 'wood_d', rot=(-0.5, 0, 0))
b.done('jige', smooth=0, shade=(0.72, 1.08))
b = B()
b.box((1.2, 1.9, 0.5), (0, 0.1, 0.72), 'wood_l', jit=0.08); b.box((1.1, 1.8, 0.44), (0, 0.1, 0.78), 'wood_d')
for s in (-1, 1):
    b.cone(0.42, 0.42, 0.08, (s * 0.68, 0.3, 0.42), 'iron', seg=12, rot=(0, math.pi / 2, 0))
    b.cone(0.3, 0.3, 0.1, (s * 0.68, 0.3, 0.42), 'stone_d', seg=12, rot=(0, math.pi / 2, 0))
    b.box((0.05, 1.3, 0.05), (s * 0.5, -1.4, 0.8), 'iron')
b.box((1.05, 0.05, 0.05), (0, -2.05, 0.8), 'iron'); b.box((0.06, 0.06, 0.5), (0, -0.7, 0.25), 'iron')
b.done('handcart', smooth=0, shade=(0.7, 1.08))

# 보따리 · 등짐 · 소반
b = B(); b.ball(0.38, (0, 0, 0.3), 'tint_cloth', sub=2, scale=(1.1, 1, 0.8), jit=0.05); b.ball(0.1, (0, 0, 0.62), 'tint_cloth', sub=1, tone=0.8, scale=(1.6, 0.8, 0.8)); b.done('bundle', smooth=40, shade=(0.7, 1.08))
b = B(); b.box((0.7, 0.7, 0.05), (0, 0, 0.3), 'wood_d', bevel=0.02)
for x in (-0.28, 0.28):
    for y in (-0.28, 0.28):
        b.box((0.06, 0.06, 0.3), (x, y, 0.15), 'wood_d')
b.lathe([(0.1, 0.33), (0.17, 0.4), (0.18, 0.43)], (0, 0, 0), 'white', seg=8); b.cone(0.15, 0.15, 0.02, (0, 0, 0.42), 'rice', seg=8)
b.done('soban', smooth=0, shade=(0.74, 1.08))

# 모닥불(돌 두른 장작 — 불꽃은 장면이 얹는다) · 장대 등롱 · 석등 · 횃대
b = B()
for i in range(7):
    a = i * 0.9
    b.ball(0.16, (math.cos(a) * 0.62, math.sin(a) * 0.62, 0.1), 'stone' if i % 2 else 'stone_d', sub=1, scale=(1.2, 1, 0.8), jit=0.1)
for i in range(4):
    a = i * 0.8 + 0.3
    b.cone(0.08, 0.07, 0.95, (0, 0, 0.2), 'wood_d' if i % 2 else 'wood', seg=5, rot=(0, 1.2, a), jit=0.08)
b.cone(0.3, 0.26, 0.06, (0, 0, 0.05), 'glow_fire', seg=8)
b.done('bonfire', smooth=0, shade=(0.7, 1.1))
b = B()
b.cone(0.07, 0.06, 2.6, (0, 0, 1.3), 'wood_d', seg=6); b.box((0.06, 0.7, 0.06), (0, -0.3, 2.5), 'wood_d')
b.box((0.34, 0.34, 0.44), (0, -0.6, 2.1), 'glow_lamp', bevel=0.04)
b.box((0.4, 0.4, 0.05), (0, -0.6, 2.34), 'wood_d'); b.box((0.4, 0.4, 0.05), (0, -0.6, 1.86), 'wood_d'); b.box((0.02, 0.02, 0.2), (0, -0.6, 2.42), 'ink')
b.done('lamp_post', smooth=0, shade=(0.8, 1.05))
b = B()
b.box((0.7, 0.7, 0.16), (0, 0, 0.08), 'stone', bevel=0.03, jit=0.08); b.cone(0.16, 0.13, 0.9, (0, 0, 0.6), 'stone', seg=8, jit=0.06)
b.box((0.6, 0.6, 0.1), (0, 0, 1.1), 'stone_d', bevel=0.03); b.box((0.4, 0.4, 0.4), (0, 0, 1.35), 'glow_lamp', bevel=0.03)
for x in (-0.2, 0.2):
    for y in (-0.2, 0.2):
        b.box((0.07, 0.07, 0.42), (x, y, 1.35), 'stone')
b.cone(0.5, 0.06, 0.34, (0, 0, 1.72), 'stone_d', seg=4, rot=(0, 0, math.pi / 4), jit=0.06)
b.done('stone_lamp', smooth=0, shade=(0.74, 1.08))

# 북(받침) · 종(틀) · 깃대 · 솟대 · 장승
b = B()
for s in (-1, 1):
    b.box((0.1, 0.1, 1.5), (s * 0.7, 0, 0.75), 'wood_d'); b.box((0.3, 0.5, 0.1), (s * 0.7, 0, 0.05), 'wood_d')
b.box((1.5, 0.1, 0.1), (0, 0, 1.5), 'wood_d')
b.cone(0.5, 0.5, 0.5, (0, 0, 0.95), 'red', seg=12, rot=(math.pi / 2, 0, 0), jit=0.04)
for s in (-1, 1):
    b.cone(0.47, 0.47, 0.02, (0, s * 0.26, 0.95), 'cream', seg=12, rot=(math.pi / 2, 0, 0))
b.done('drum', smooth=0, shade=(0.76, 1.06))
b = B()
for s in (-1, 1):
    b.box((0.14, 0.14, 2.2), (s * 0.7, 0, 1.1), 'wood_d'); b.box((0.34, 0.6, 0.12), (s * 0.7, 0, 0.06), 'wood_d')
b.box((1.7, 0.16, 0.16), (0, 0, 2.2), 'wood_d')
b.lathe([(0.34, 1.0), (0.31, 1.3), (0.28, 1.75), (0.16, 1.92), (0.04, 1.96)], (0, 0, 0), 'bronze', seg=12, jit=0.04)
b.cone(0.34, 0.34, 0.02, (0, 0, 1.0), 'ink', seg=12); b.box((0.03, 0.03, 0.26), (0, 0, 2.06), 'iron')
b.done('bell', smooth=30, shade=(0.74, 1.1))
b = B()
b.cone(0.06, 0.045, 4.2, (0, 0, 2.1), 'wood_d', seg=6)
b.grid(4, 2, lambda u, v: (0.06 + u * 1.3, 0.1 * math.sin(u * 5), 4.1 - v * 0.85), 'tint_cloth', jit=0.03)
b.grid(4, 2, lambda u, v: (0.06 + (1 - u) * 1.3, 0.1 * math.sin((1 - u) * 5) + 0.01, 4.1 - v * 0.85), 'tint_cloth', tone=0.85, jit=0.03)
b.done('flag', smooth=0, shade=(0.8, 1.06), under=0.05)
b = B()
b.cone(0.07, 0.04, 4.4, (0, 0, 2.2), 'wood', seg=6, jit=0.05)
b.box((0.5, 0.06, 0.06), (0, 0, 4.35), 'wood')
b.ball(0.14, (0, -0.05, 4.52), 'wood_d', sub=1, scale=(0.8, 1.6, 0.8)); b.cone(0.03, 0.005, 0.2, (0, -0.36, 4.56), 'wood_l', seg=4, rot=(math.pi / 2, 0, 0)); b.box((0.04, 0.3, 0.1), (0, 0.28, 4.6), 'wood_d', rot=(0.5, 0, 0))
b.done('sotdae', smooth=0, shade=(0.8, 1.06))
b = B()
b.cone(0.22, 0.19, 2.3, (0, 0, 1.15), 'wood', seg=7, jit=0.06)
b.box((0.34, 0.1, 0.1), (0, -0.19, 1.95), 'ink'); b.box((0.1, 0.06, 0.26), (0, -0.2, 1.72), 'wood_d'); b.box((0.3, 0.06, 0.08), (0, -0.2, 1.5), 'red')
for s in (-1, 1):
    b.ball(0.05, (s * 0.1, -0.19, 2.02), 'white', sub=1)
b.cone(0.26, 0.2, 0.16, (0, 0, 2.36), 'wood_d', seg=7)
b.done('jangseung', smooth=0, shade=(0.74, 1.06))

# 나룻배 · 고인돌(다 세운 것) · 전봇대
b = B()
b.grid(8, 2, lambda u, v: ((v - 0.5) * 2.0 * (0.35 + 0.65 * math.sin(u * math.pi) ** 0.6), (u - 0.5) * 5.6, 0.75 - 0.6 * math.sin(v * math.pi) + 0.35 * (abs(u - 0.5) * 2) ** 2.5), 'wood', jit=0.08)
b.grid(8, 2, lambda u, v: ((0.5 - v) * 1.84 * (0.35 + 0.65 * math.sin(u * math.pi) ** 0.6), (u - 0.5) * 5.4, 0.8 - 0.56 * math.sin(v * math.pi) + 0.35 * (abs(u - 0.5) * 2) ** 2.5), 'wood_l', jit=0.08)
for y in (-1.2, 0, 1.2):
    b.box((1.5, 0.3, 0.06), (0, y, 0.62), 'wood_d')
b.box((0.07, 0.07, 3.2), (0.9, 1.4, 0.9), 'wood_d', rot=(0.9, 0, 0.3)); b.box((0.24, 0.05, 0.7), (1.3, 2.6, 0.02), 'wood_d', rot=(0.9, 0, 0.3))
b.done('boat', smooth=0, shade=(0.7, 1.08), under=0.1)
b = B()
for s in (-1, 1):
    b.box((2.6, 0.7, 1.7), (0, s * 1.1, 0.85), 'stone', bevel=0.12, jit=0.14, f=lambda v: Vector((v.x * (1 - 0.1 * (v.z + 0.85) / 1.7), v.y, v.z)))
b.ball(1.0, (0.1, 0, 2.15), 'stone_d', sub=2, scale=(2.6, 2.0, 0.6), jit=0.12)
b.ball(0.8, (0.4, -0.2, 2.5), 'stone', sub=1, scale=(1.6, 1.3, 0.4), jit=0.12)
b.done('dolmen', smooth=0, shade=(0.66, 1.1), under=0.35)
b = B()
b.cone(0.12, 0.1, 6.4, (0, 0, 3.2), 'wood_d', seg=6); b.box((1.7, 0.1, 0.1), (0, 0, 5.9), 'wood_d'); b.box((1.2, 0.1, 0.1), (0, 0, 5.4), 'wood_d')
for x in (-0.75, -0.3, 0.3, 0.75):
    b.cone(0.045, 0.045, 0.14, (x, 0, 6.02), 'white', seg=6)
b.done('power_pole', smooth=0, shade=(0.8, 1.05))


# 짐승: 몸통 · 머리 · 다리 넷 · 꼬리(머리는 -y)
def beast(name, L, W, H, leg, m='tint_fur', head=(0.34, 0.5, 0.36), neck=0.3, ear=True, antler=0, snout=None, tail=0.2, belly='cream', horn=0, hump=0.0):
    b = B()
    zb = leg + H / 2
    b.box((W, L, H), (0, 0, zb), m, bevel=min(W, H) * 0.3, bseg=2, jit=0.03)
    b.box((W * 0.8, L * 0.7, H * 0.3), (0, 0, leg + H * 0.14), belly, bevel=H * 0.1, jit=0.02)
    if hump:
        b.ball(W * 0.5, (0, -L * 0.25, zb + H * 0.4), m, sub=1, scale=(1, 1.3, hump), jit=0.03)
    for sx in (-1, 1):
        for sy in (-1, 1):
            b.cone(W * 0.16, W * 0.12, leg + 0.05, (sx * W * 0.32, sy * L * 0.36, (leg + 0.05) / 2), m, seg=6, tone=0.86, jit=0.03)
            b.cone(W * 0.13, W * 0.13, 0.07, (sx * W * 0.32, sy * L * 0.36, 0.035), 'ink', seg=6)
    hy, hz = -L / 2 - neck * 0.5, zb + H * 0.3 + neck * 0.7
    b.cone(W * 0.3, W * 0.24, neck + 0.2, (0, -L / 2 + 0.02 - neck * 0.2, zb + H * 0.25 + neck * 0.3), m, seg=7, rot=(-0.7, 0, 0), jit=0.03)
    b.box(head, (0, hy, hz), m, bevel=head[0] * 0.28, bseg=2, jit=0.02)
    sn = snout or (head[0] * 0.6, head[1] * 0.4, head[2] * 0.55)
    b.box(sn, (0, hy - head[1] * 0.55, hz - head[2] * 0.14), belly if not snout else m, bevel=sn[0] * 0.25, jit=0.02)
    b.box((sn[0] * 0.5, 0.04, sn[2] * 0.4), (0, hy - head[1] * 0.55 - sn[1] / 2, hz - head[2] * 0.1), 'ink')
    for s in (-1, 1):
        b.ball(0.035, (s * head[0] * 0.42, hy - head[1] * 0.18, hz + head[2] * 0.12), 'ink', sub=1)
        if ear:
            b.cone(0.07, 0.01, 0.2, (s * head[0] * 0.5, hy + head[1] * 0.3, hz + head[2] * 0.55), m, seg=4, rot=(0, s * 0.5, 0), tone=0.9)
        for k in range(antler):
            b.cone(0.03, 0.012, 0.42, (s * (0.1 + k * 0.1), hy + head[1] * 0.15 + k * 0.05, hz + head[2] * 0.5 + 0.18 + k * 0.1), 'horn', seg=4, rot=(0.3 - k * 0.5, s * (0.5 + k * 0.25), 0))
        if horn:
            b.cone(0.05, 0.012, horn, (s * (head[0] * 0.5 + horn * 0.3), hy + head[1] * 0.25, hz + head[2] * 0.45), 'horn', seg=5, rot=(0, s * 1.1, 0))
    if tail:
        b.cone(0.04, 0.02, tail, (0, L / 2 + tail * 0.3, zb + H * 0.2), m, seg=4, rot=(0.9, 0, 0), tone=0.85)
    b.done(name, smooth=40, shade=(0.74, 1.08), under=0.25)


mat('deer', 0xb8824a); mat('boarc', 0x5a4636); mat('dogc', 0xd8b070); mat('oxc', 0xb8763c); mat('horsec', 0x7a4a2a)
beast('deer', 1.3, 0.5, 0.52, 0.7, m='deer', head=(0.26, 0.42, 0.3), neck=0.42, tail=0.14)
beast('deer_buck', 1.45, 0.54, 0.56, 0.78, m='deer', head=(0.28, 0.44, 0.32), neck=0.46, antler=3, tail=0.14)
beast('boar', 1.4, 0.7, 0.66, 0.36, m='boarc', head=(0.44, 0.5, 0.44), neck=0.05, snout=(0.26, 0.3, 0.24), tail=0.2, belly='boarc', hump=0.5)
beast('dog', 0.85, 0.36, 0.36, 0.34, m='dogc', head=(0.3, 0.34, 0.28), neck=0.12, tail=0.34)
beast('ox', 2.0, 0.86, 0.9, 0.7, m='oxc', head=(0.46, 0.6, 0.48), neck=0.2, horn=0.3, tail=0.6, hump=0.35)
beast('horse', 1.9, 0.6, 0.72, 0.95, m='horsec', head=(0.3, 0.6, 0.36), neck=0.6, tail=0.7, belly='horsec')
b = B()
b.ball(0.2, (0, 0, 0.3), 'white', sub=1, scale=(0.9, 1.2, 0.9), jit=0.04); b.ball(0.11, (0, -0.2, 0.5), 'white', sub=1, jit=0.03)
b.cone(0.03, 0.005, 0.1, (0, -0.34, 0.5), 'bronze', seg=4, rot=(math.pi / 2, 0, 0)); b.box((0.03, 0.1, 0.08), (0, -0.2, 0.63), 'red')
b.box((0.04, 0.18, 0.2), (0, 0.26, 0.42), 'white', rot=(-0.5, 0, 0), tone=0.9)
for s in (-1, 1):
    b.cone(0.015, 0.015, 0.16, (s * 0.07, 0, 0.08), 'bronze', seg=4)
b.done('chicken', smooth=0, shade=(0.8, 1.06))

export('props.glb')

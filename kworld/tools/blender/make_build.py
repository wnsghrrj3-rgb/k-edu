"""케이월드 집·담 — build.glb. 앞(문)은 -y(three 에서 +z). 바닥 가운데가 원점.
tint_wall(벽) · tint_cloth(천) · tint_roof(양철·판자 지붕) 는 장면이 바꿀 수 있다. glow_win = 불 켜진 창(스스로 빛남)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_wall', 0xd9c6a2), ('tint_cloth', 0xe8dcc0), ('tint_roof', 0x6a7078), ('thatch', 0xd9b25a), ('thatch_d', 0xb08a3e), ('dark', 0x2a2420), ('wood', 0x7a5632), ('wood_d', 0x4e3620), ('wood_l', 0xb08a5a), ('wood_r', 0x9a3e2a), ('green', 0x3f7a62), ('stone', 0x9a968e), ('stone_d', 0x7d7a74), ('plaster', 0xf0ebdc), ('paper', 0xf4ecd4), ('tile', 0x4c586c), ('tile_l', 0x8892a4), ('mud', 0xb89868), ('canvas', 0xcfc6a8), ('glow_win', 0xffd88a), ('iron', 0x3a3a40), ('white', 0xf6f4ee), ('red', 0xc8402e), ('snow', 0xf2f6fb)]:
    mat(n, c)


def sgnpow(v, p):
    return math.copysign(abs(v) ** p, v)


def thatch_roof(b, w, d, z0, h, over=0.55, m='thatch', seg=18, snow=False):
    """둥근 우진각 초가지붕: 처마는 처지고 용마루는 x 로 길다."""
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
    b.box((w + over * 1.5, d + over * 1.5, 0.06), (0, 0, z0 - 0.08), 'dark')
    if snow:
        b.grid(seg, 4, lambda u, v: tuple(Vector(fn(u, 0.35 + v * 0.65)) + Vector((0, 0, 0.07))), 'snow', jit=0.03)


def tile_roof(b, w, d, z0, h, over=0.7, lift=0.45, m='tile', nx=14, snow=False):
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
    if snow:
        b.grid(6, 6, lambda u, v: surf(0.04 + u * 0.92, 0.12 + v * 0.76, 0.06), 'snow', jit=0.03)


def lattice(b, x, y, z, w, h, m='paper', glow=False, side=None):
    """창호: 종이 + 살. side 가 None 이면 앞(-y)을 본다. 'L'·'R' 이면 옆."""
    t = 0.05
    if side is None:
        b.box((w, t, h), (x, y, z), 'glow_win' if glow else m, jit=0)
        b.box((w + 0.1, t + 0.03, 0.07), (x, y, z + h / 2), 'wood_d', jit=0); b.box((w + 0.1, t + 0.03, 0.07), (x, y, z - h / 2), 'wood_d', jit=0)
        for i in range(3):
            b.box((0.035, t + 0.03, h), (x - w / 2 + w * i / 2, y, z), 'wood_d', jit=0)
        b.box((w, t + 0.03, 0.035), (x, y, z), 'wood_d', jit=0)
    else:
        b.box((t, w, h), (x, y, z), 'glow_win' if glow else m, jit=0)
        for i in range(3):
            b.box((t + 0.03, 0.035, h), (x, y - w / 2 + w * i / 2, z), 'wood_d', jit=0)
        b.box((t + 0.03, w, 0.035), (x, y, z), 'wood_d', jit=0)


def frame_walls(b, w, d, h, z0, wall='tint_wall', post='wood_d', bays=3, door=1, glow=False, plinth=0.3):
    b.box((w + 0.7, d + 0.7, plinth), (0, 0, plinth / 2), 'stone', bevel=0.06, jit=0.08)
    b.box((w, d, h), (0, 0, z0 + h / 2), wall, jit=0.05)
    b.box((w + 0.06, d + 0.06, 0.14), (0, 0, z0 + h - 0.07), post, jit=0.03)
    b.box((w + 0.06, d + 0.06, 0.12), (0, 0, z0 + 0.06), post, jit=0.03)
    for i in range(bays + 1):
        x = -w / 2 + w * i / bays
        for y in (-d / 2, d / 2):
            b.box((0.17, 0.17, h), (x, y, z0 + h / 2), post, jit=0.03)
    bw = w / bays
    for i in range(bays):
        x = -w / 2 + bw * (i + 0.5)
        if i == door:
            b.box((bw * 0.52, 0.07, h * 0.78), (x, -d / 2 - 0.03, z0 + h * 0.4), 'wood', jit=0.05)
            b.box((0.04, 0.09, h * 0.78), (x, -d / 2 - 0.04, z0 + h * 0.4), 'wood_d', jit=0)
            b.box((bw * 0.6, 0.1, 0.08), (x, -d / 2 - 0.03, z0 + h * 0.8), 'wood_d', jit=0)
        else:
            lattice(b, x, -d / 2 - 0.03, z0 + h * 0.56, bw * 0.5, h * 0.42, glow=glow)


# 움집(신석기·청동기): 땅을 판 자리에 원뿔 지붕
b = B()
b.cone(2.75, 2.75, 0.14, (0, 0, 0.07), 'mud', seg=14, jit=0.08)
for i, (r0, r1, z, hh) in enumerate([(2.6, 1.75, 0.55, 0.95), (1.95, 1.05, 1.3, 0.9), (1.25, 0.28, 2.0, 0.9)]):
    b.cone(r0, r1, hh, (0, 0, z), 'thatch' if i != 1 else 'thatch_d', seg=13, cap=False, jit=0.12)
b.cone(0.33, 0.2, 0.16, (0, 0, 2.5), 'wood_d', seg=8)
for a in range(6):
    b.cone(0.035, 0.03, 0.6, (math.cos(a * 1.05) * 0.16, math.sin(a * 1.05) * 0.16, 2.72), 'wood', seg=4, rot=(0, 0.3, a * 1.05))
b.box((1.25, 1.0, 1.25), (0, -2.15, 0.62), 'thatch_d', jit=0.1, f=lambda v: Vector((v.x * (1 - 0.35 * (v.z + 0.62) / 1.25), v.y, v.z)))
b.box((0.72, 0.1, 0.95), (0, -2.62, 0.5), 'dark')
for s in (-1, 1):
    b.box((0.1, 0.12, 1.15), (s * 0.44, -2.66, 0.57), 'wood', rot=(0, -s * 0.12, 0), jit=0.05)
b.box((1.05, 0.12, 0.1), (0, -2.66, 1.13), 'wood', jit=0.05)
b.done('pithouse', smooth=0, shade=(0.7, 1.1), under=0.35)


def thatch_house(name, w, d, bays, door, glow=False, porch=True, snow=False, chimney=True):
    b = B()
    frame_walls(b, w, d, 2.0, 0.3, bays=bays, door=door, glow=glow)
    if porch:
        b.box((w * 0.62, 0.8, 0.1), (w * 0.08, -d / 2 - 0.42, 0.5), 'wood_l', jit=0.06)
        for x in (w * 0.08 - w * 0.29, w * 0.08 + w * 0.29):
            b.box((0.12, 0.12, 0.46), (x, -d / 2 - 0.74, 0.23), 'wood_d')
        b.box((0.7, 0.4, 0.16), (-w / 2 + bw_c(w, bays, door), -d / 2 - 0.5, 0.08), 'stone_d', bevel=0.04, jit=0.06)
    if chimney:
        b.box((0.42, 0.42, 1.5), (w / 2 + 0.36, d / 4, 0.75), 'mud', bevel=0.05, jit=0.08)
        b.box((0.5, 0.5, 0.1), (w / 2 + 0.36, d / 4, 1.52), 'stone_d', jit=0.05)
    thatch_roof(b, w, d, 2.3, 1.35, snow=snow)
    b.done(name, smooth=0, shade=(0.74, 1.08), under=0.3)


def bw_c(w, bays, door):
    return w / bays * (door + 0.5)


thatch_house('thatch_a', 6.4, 3.6, 3, 1)
thatch_house('thatch_a_lit', 6.4, 3.6, 3, 1, glow=True)
thatch_house('thatch_b', 4.4, 3.2, 2, 0)
thatch_house('thatch_b_lit', 4.4, 3.2, 2, 0, glow=True)
thatch_house('thatch_snow', 6.4, 3.6, 3, 1, snow=True)

# 헛간(기둥과 지붕만) · 다락 곳간
b = B()
for x in (-1.9, 1.9):
    for y in (-1.3, 1.3):
        b.box((0.18, 0.18, 2.2), (x, y, 1.1), 'wood_d', jit=0.04)
b.box((3.9, 0.12, 0.12), (0, 1.3, 1.2), 'wood', jit=0.04); b.box((3.9, 0.12, 0.9), (0, 1.3, 0.55), 'wood', jit=0.08)
thatch_roof(b, 4.0, 2.8, 2.2, 1.1, over=0.45)
b.done('shed', smooth=0, shade=(0.74, 1.08), under=0.3)
b = B()
for x in (-1.3, 1.3):
    for y in (-1.1, 1.1):
        b.cone(0.13, 0.11, 1.3, (x, y, 0.65), 'wood_d', seg=6)
        b.cone(0.34, 0.34, 0.06, (x, y, 1.3), 'wood', seg=8)
b.box((3.3, 2.9, 0.16), (0, 0, 1.41), 'wood', jit=0.05)
b.box((3.0, 2.6, 1.6), (0, 0, 2.3), 'wood_l', jit=0.08)
for i in range(7):
    b.box((3.06, 2.66, 0.035), (0, 0, 1.62 + i * 0.22), 'wood_d', jit=0)
b.box((0.8, 0.08, 1.0), (0, -1.32, 2.15), 'wood_d')
b.box((0.5, 0.14, 1.9), (0, -1.75, 0.85), 'wood', rot=(-0.55, 0, 0), jit=0.05)
thatch_roof(b, 3.0, 2.6, 3.1, 1.15, over=0.5)
b.done('granary', smooth=0, shade=(0.74, 1.08), under=0.3)


def tile_house(name, w, d, bays, glow=False, pillar='wood_d', wall='plaster', hgt=2.3, roofh=1.5, snow=False, big=False):
    b = B()
    pl = 0.5 if not big else 0.8
    b.box((w + 1.3, d + 1.3, pl), (0, 0, pl / 2), 'stone', bevel=0.06, jit=0.08)
    b.box((1.6, 0.5, pl * 0.5), (0, -d / 2 - 0.85, pl * 0.25), 'stone_d', bevel=0.04, jit=0.06)
    b.box((w - 0.3, d - 0.3, hgt), (0, 0.0, pl + hgt / 2), wall, jit=0.03)
    bw = w / bays
    for i in range(bays + 1):
        x = -w / 2 + bw * i
        for y in (-d / 2, d / 2):
            b.cone(0.14 if not big else 0.2, 0.13 if not big else 0.18, hgt, (x, y, pl + hgt / 2), pillar, seg=8, jit=0.03)
    b.box((w + 0.3, d + 0.3, 0.2), (0, 0, pl + hgt + 0.02), pillar if not big else 'green', jit=0.03)
    if big:
        b.box((w + 0.5, d + 0.5, 0.16), (0, 0, pl + hgt + 0.2), 'wood_r', jit=0.03)
    for i in range(bays):
        x = -w / 2 + bw * (i + 0.5)
        lattice(b, x, -d / 2 + 0.12, pl + hgt * 0.5, bw * 0.66, hgt * 0.72, glow=glow and i % 2 == 0)
        b.box((bw * 0.7, 0.06, hgt * 0.2), (x, -d / 2 + 0.13, pl + hgt * 0.1), 'wood' if not big else 'wood_r', jit=0.04)
    for s in (-1, 1):
        lattice(b, s * (w / 2 - 0.12), 0, pl + hgt * 0.56, d * 0.34, hgt * 0.4, side='L')
    tile_roof(b, w, d, pl + hgt + (0.12 if not big else 0.3), roofh, over=0.8 if not big else 1.1, lift=0.45 if not big else 0.7, snow=snow)
    b.done(name, smooth=0, shade=(0.76, 1.07), under=0.28)


tile_house('tile_a', 7.4, 4.0, 3)
tile_house('tile_a_lit', 7.4, 4.0, 3, glow=True)
tile_house('tile_b', 5.0, 3.6, 2)
tile_house('tile_snow', 7.4, 4.0, 3, snow=True)
tile_house('hall', 12.0, 6.4, 5, pillar='wood_r', wall='plaster', hgt=3.0, roofh=2.3, big=True)

# 솟을대문(양반집) · 성문·궁문(붉은 문짝)
b = B()
b.box((3.6, 1.2, 0.2), (0, 0, 0.1), 'stone', bevel=0.04, jit=0.06)
for x in (-1.25, 1.25):
    b.box((0.26, 0.26, 2.9), (x, 0, 1.65), 'wood_d', jit=0.03)
    b.box((0.9, 0.5, 2.2), (x * 1.72, 0, 1.3), 'plaster', jit=0.03)
for s in (-1, 1):
    b.box((1.1, 0.1, 2.3), (s * 0.57, 0, 1.4), 'wood', jit=0.06)
    b.cone(0.07, 0.07, 0.04, (s * 0.2, -0.07, 1.4), 'iron', seg=8, rot=(math.pi / 2, 0, 0))
b.box((2.8, 0.3, 0.2), (0, 0, 2.7), 'wood_d')
tile_roof(b, 3.4, 1.4, 3.0, 0.8, over=0.5, lift=0.3, nx=8)
b.done('gate_house', smooth=0, shade=(0.76, 1.07), under=0.28)
b = B()
b.box((9.0, 3.2, 3.6), (0, 0, 1.8), 'stone', jit=0.1, bevel=0.05)
for i in range(6):
    for j in range(4):
        b.box((1.42, 0.05, 0.8), (-3.75 + i * 1.5 + (0.4 if j % 2 else 0), -1.62, 0.5 + j * 0.9), 'stone_d', jit=0.1)
b.box((2.8, 3.3, 2.8), (0, 0, 1.4), 'dark')
for s in (-1, 1):
    b.box((1.3, 0.14, 2.7), (s * 0.68, -1.5, 1.38), 'wood_r', jit=0.05)
    for k in range(3):
        b.cone(0.06, 0.06, 0.05, (s * 0.68, -1.6, 0.7 + k * 0.7), 'iron', seg=6, rot=(math.pi / 2, 0, 0))
for i in range(5):
    x = -3.6 + i * 1.8
    for y in (-1.1, 1.1):
        b.cone(0.16, 0.15, 2.0, (x, y, 4.6), 'wood_r', seg=8)
b.box((7.6, 2.5, 0.2), (0, 0, 5.62), 'green')
tile_roof(b, 7.6, 2.6, 5.75, 1.5, over=0.9, lift=0.6, nx=14)
b.done('gate_fort', smooth=0, shade=(0.74, 1.07), under=0.28)


# 담 · 성벽 · 목책 · 울타리(길이 4, 가운데 원점, x 로 길다)
b = B()
b.box((4.0, 0.5, 1.5), (0, 0, 0.75), 'tint_wall', jit=0.05)
for i in range(8):
    for j in range(2):
        b.box((0.42, 0.56, 0.3), (-1.75 + i * 0.5 + (0.12 if j else 0), 0, 0.17 + j * 0.3), 'stone' if (i + j) % 2 else 'stone_d', bevel=0.05, jit=0.1)
b.prism([(-0.42, 0), (0.42, 0), (0, 0.3)], 4.0, (0, 0, 1.5), 'tile', rot=(0, 0, math.pi / 2), jit=0.06)
b.box((4.0, 0.12, 0.1), (0, 0, 1.8), 'tile_l')
b.done('wall_mud', smooth=0, shade=(0.76, 1.07), under=0.28)
b = B()
for j in range(4):
    for i in range(5):
        b.box((0.78, 1.5, 0.74), (-1.6 + i * 0.8, 0, 0.38 + j * 0.76), 'stone' if (i + j) % 2 else 'stone_d', bevel=0.06, jit=0.12)
for i in range(3):
    b.box((0.8, 0.5, 0.7), (-1.6 + i * 1.6, -0.5, 3.4), 'stone', bevel=0.05, jit=0.1)
b.box((4.0, 1.0, 0.1), (0, 0.25, 3.05), 'stone_d')
b.done('rampart', smooth=0, shade=(0.72, 1.08), under=0.3)
b = B()
for i in range(10):
    hh = 2.3 + (i * 37 % 5) * 0.07
    b.cone(0.19, 0.17, hh, (-1.8 + i * 0.4, 0, hh / 2), 'wood' if i % 3 else 'wood_d', seg=6, jit=0.1)
    b.cone(0.17, 0.02, 0.36, (-1.8 + i * 0.4, 0, hh + 0.18), 'wood_l', seg=6, jit=0.08)
b.box((4.0, 0.1, 0.14), (0, -0.2, 1.5), 'wood_d', jit=0.04); b.box((4.0, 0.1, 0.14), (0, -0.2, 0.7), 'wood_d', jit=0.04)
b.done('palisade', smooth=0, shade=(0.72, 1.08), under=0.3)
b = B()
for i in range(13):
    b.cone(0.035, 0.03, 1.15 + (i % 3) * 0.06, (-1.45 + i * 0.24, 0, 0.58), 'wood_l' if i % 2 else 'wood', seg=4, rot=(0, 0.12 if i % 2 else -0.12, 0), jit=0.1)
for z in (0.35, 0.8):
    b.box((3.0, 0.06, 0.07), (0, 0, z), 'thatch_d', jit=0.08)
for x in (-1.5, 0, 1.5):
    b.cone(0.07, 0.06, 1.3, (x, 0, 0.65), 'wood_d', seg=5)
b.done('fence', smooth=0, shade=(0.74, 1.08), under=0.2)

# 망루
b = B()
for x in (-1.1, 1.1):
    for y in (-1.1, 1.1):
        b.cone(0.15, 0.12, 5.4, (x * 0.92, y * 0.92, 2.7), 'wood_d', seg=6, jit=0.05, f=lambda v, x=x, y=y: Vector((v.x - x * 0.05 * v.z, v.y - y * 0.05 * v.z, v.z)))
for z in (1.6, 3.3):
    b.box((2.2, 0.1, 0.1), (0, -1.0, z), 'wood'); b.box((2.2, 0.1, 0.1), (0, 1.0, z), 'wood'); b.box((0.1, 2.2, 0.1), (-1.0, 0, z), 'wood'); b.box((0.1, 2.2, 0.1), (1.0, 0, z), 'wood')
b.box((2.9, 2.9, 0.16), (0, 0, 4.7), 'wood_l', jit=0.06)
for s in (-1, 1):
    b.box((2.9, 0.1, 0.8), (0, s * 1.4, 5.2), 'wood', jit=0.08); b.box((0.1, 2.9, 0.8), (s * 1.4, 0, 5.2), 'wood', jit=0.08)
    for t in (-1, 1):
        b.cone(0.08, 0.08, 1.9, (s * 1.3, t * 1.3, 5.7), 'wood_d', seg=5)
b.box((0.4, 0.1, 4.8), (0.6, -1.25, 2.3), 'wood_l', rot=(0.12, 0, 0), jit=0.05)
thatch_roof(b, 2.8, 2.8, 6.6, 0.9, over=0.4, seg=12)
b.done('tower', smooth=0, shade=(0.74, 1.08), under=0.3)

# 장터 좌판(천 지붕) · 천막(1950) · 가게(1950) · 예배당 · 우물
b = B()
for x in (-1.5, 1.5):
    for y, hh in ((-0.9, 2.0), (0.9, 2.5)):
        b.cone(0.07, 0.06, hh, (x, y, hh / 2), 'wood_d', seg=5)
b.grid(4, 3, lambda u, v: ((u - 0.5) * 3.6, (v - 0.5) * 2.4, 2.0 + v * 0.55 - 0.12 * math.sin(u * math.pi)), 'tint_cloth', jit=0.05)
b.grid(4, 3, lambda u, v: ((0.5 - u) * 3.6, (v - 0.5) * 2.4, 1.97 + v * 0.55 - 0.12 * math.sin(u * math.pi)), 'tint_cloth', tone=0.7, jit=0.03)
b.box((3.0, 1.1, 0.1), (0, -0.2, 0.75), 'wood_l', jit=0.06)
for x in (-1.3, 1.3):
    for y in (-0.6, 0.2):
        b.box((0.1, 0.1, 0.72), (x, y, 0.36), 'wood_d')
b.done('stall', smooth=0, shade=(0.76, 1.07), under=0.2)
b = B()
b.prism([(-1.25, 0), (1.25, 0), (0.18, 1.7), (-0.18, 1.7)], 3.8, (0, 0, 0), 'canvas', jit=0.05)
b.prism([(-0.45, 0), (0.45, 0), (0.06, 1.25), (-0.06, 1.25)], 0.06, (0, -1.9, 0), 'dark')
for s in (-1, 1):
    b.box((0.06, 0.06, 1.9), (0, s * 1.9, 0.95), 'wood_d')
    for t in (-1, 1):
        b.box((0.03, 0.03, 1.5), (t * 1.6, s * 1.5, 0.5), 'wood_l', rot=(0, t * 0.9, 0))
b.done('tent', smooth=0, shade=(0.72, 1.06), under=0.25)
b = B()
b.box((6.2, 4.4, 0.2), (0, 0, 0.1), 'stone', jit=0.06)
b.box((6.0, 4.2, 2.9), (0, 0, 1.65), 'tint_wall', jit=0.04)
b.box((6.1, 0.1, 0.5), (0, -2.12, 2.75), 'wood_d'); b.box((3.6, 0.06, 0.34), (0, -2.19, 2.75), 'white')
for i in range(4):
    b.box((1.2, 0.08, 1.9), (-2.1 + i * 1.4, -2.12, 1.2), 'wood', jit=0.08)
    b.box((0.04, 0.1, 1.9), (-2.1 + i * 1.4, -2.13, 1.2), 'wood_d')
b.prism([(-2.5, 0), (2.5, 0), (0, 1.3)], 6.6, (0, 0, 3.1), 'tint_roof', rot=(0, 0, math.pi / 2), jit=0.06)
b.box((6.8, 0.2, 0.12), (0, 0, 4.42), 'iron')
b.box((0.4, 0.4, 1.1), (2.0, 1.0, 4.0), 'stone_d', jit=0.06)
b.done('shop', smooth=0, shade=(0.76, 1.06), under=0.28)
b = B()
b.box((7.0, 9.4, 0.3), (0, 0, 0.15), 'stone', jit=0.06)
b.box((6.6, 9.0, 3.4), (0, 0, 2.0), 'tint_wall', jit=0.04)
b.prism([(-3.7, 0), (3.7, 0), (0, 2.6)], 9.6, (0, 0, 3.7), 'tint_roof', jit=0.06)
b.box((0.2, 9.8, 0.14), (0, 0, 6.32), 'iron')
b.box((1.5, 0.12, 2.3), (0, -4.52, 1.45), 'wood_d'); b.box((0.05, 0.14, 2.3), (0, -4.54, 1.45), 'wood')
for s in (-1, 1):
    for k in range(3):
        b.box((0.08, 0.9, 1.5), (s * 3.32, -2.6 + k * 2.6, 2.3), 'paper', jit=0)
        b.box((0.1, 0.05, 1.5), (s * 3.33, -2.6 + k * 2.6, 2.3), 'wood_d')
b.box((1.5, 1.5, 2.2), (0, -3.4, 6.2), 'tint_wall', jit=0.04)
b.cone(1.2, 0.02, 1.5, (0, -3.4, 8.05), 'tint_roof', seg=4, rot=(0, 0, math.pi / 4), jit=0.05)
b.box((0.12, 0.12, 1.2), (0, -3.4, 9.3), 'white'); b.box((0.7, 0.12, 0.12), (0, -3.4, 9.5), 'white')
b.done('church', smooth=0, shade=(0.76, 1.06), under=0.28)
b = B()
b.lathe([(0.85, 0), (0.85, 0.75), (0.7, 0.75), (0.7, 0.1)], (0, 0, 0), 'stone', seg=10, cap=False, jit=0.12)
b.cone(0.7, 0.7, 0.02, (0, 0, 0.3), 'dark', seg=10)
for s in (-1, 1):
    b.cone(0.07, 0.06, 2.0, (s * 0.8, 0, 1.0), 'wood_d', seg=5)
b.box((2.0, 0.12, 0.12), (0, 0, 1.95), 'wood_d')
b.prism([(-0.7, 0), (0.7, 0), (0, 0.5)], 2.2, (0, 0, 2.0), 'thatch', rot=(0, 0, math.pi / 2), jit=0.1)
b.box((0.03, 0.03, 1.1), (0, 0, 1.4), 'wood_l'); b.cone(0.16, 0.13, 0.26, (0, 0, 0.85), 'wood', seg=7)
b.done('well', smooth=0, shade=(0.74, 1.08), under=0.3)

export('build.glb')

"""케이월드 자연 — 나무·바위·풀·곡식. nature.glb.
tint_leaf(잎) · tint_bark(줄기) 는 장면이 바꿀 수 있다(안 주면 모델의 색)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_leaf', 0x4f8f45), ('tint_bark', 0x6a4a30), ('pine', 0x2f5f42), ('pine_d', 0x254c36), ('snow', 0xf2f6fb), ('rock', 0x8d8a84), ('rock_d', 0x74726e), ('moss', 0x6f8f4a), ('grass', 0x6fae4e), ('grass_d', 0x4f8a3e), ('reed', 0xc8b06a), ('reed_h', 0x7a5a3a), ('rice', 0x9ac85a), ('gold', 0xe0b84a), ('flower_y', 0xffd84a), ('flower_w', 0xfff4e8), ('flower_p', 0xe87a9a), ('wood', 0x7a5632), ('wood_cut', 0xd8b888)]:
    mat(n, c)
R = random.Random(11)


def wob(k=0.12, seed=1):
    rr = random.Random(seed)
    table = {}

    def f(v):
        key = (round(v.x, 3), round(v.y, 3), round(v.z, 3))
        if key not in table:
            table[key] = 1 + (rr.random() - 0.5) * 2 * k
        return v * table[key]
    return f


def trunk(b, h, r0, r1, m='tint_bark', lean=(0, 0), seg=6, z0=0):
    b.cone(r0, r1, h, (lean[0] * h / 2, lean[1] * h / 2, z0 + h / 2), m, seg=seg, jit=0.06, f=lambda v: Vector((v.x + lean[0] * v.z, v.y + lean[1] * v.z, v.z)))


# 소나무(층층 솔잎) 셋: 보통 · 키 큰 · 눈 덮인
def pine(name, h=4.4, r=1.35, tiers=4, snow=False, seed=1):
    b = B()
    trunk(b, h * 0.42, 0.17, 0.11)
    rr = random.Random(seed)
    for i in range(tiers):
        k = i / (tiers - 1)
        rz = h * 0.3 + (h * 0.62) * k
        rad = r * (1 - 0.68 * k)
        hh = h * 0.34 * (1 - 0.25 * k)
        b.cone(rad, rad * 0.12, hh, ((rr.random() - 0.5) * 0.12, (rr.random() - 0.5) * 0.12, rz), 'pine' if i % 2 == 0 else 'pine_d', seg=7, jit=0.1, rot=(0, 0, rr.random() * 3), f=wob(0.08, seed + i))
        if snow:
            b.cone(rad * 0.78, rad * 0.1, hh * 0.72, (0, 0, rz + hh * 0.2), 'snow', seg=7, jit=0.03, rot=(0, 0, rr.random() * 3), f=wob(0.08, seed + i + 9))
    b.done(name, smooth=0, shade=(0.66, 1.1), under=0.4)


pine('pine_a', 4.4, 1.35, 4, seed=1)
pine('pine_b', 5.6, 1.5, 5, seed=5)
pine('pine_snow', 4.6, 1.4, 4, snow=True, seed=3)

# 우리 소나무(굽은 줄기 · 구름 같은 잎) — 마을 어귀·언덕
b = B()
trunk(b, 1.5, 0.2, 0.16, lean=(0.22, 0.05))
b.cone(0.16, 0.12, 1.3, (0.52, 0.1, 2.05), 'tint_bark', seg=6, jit=0.06, rot=(0.1, -0.5, 0))
b.cone(0.1, 0.06, 1.0, (0.2, 0.0, 2.5), 'tint_bark', seg=5, jit=0.06, rot=(0, 0.9, 0))
for x, y, z, r, m in [(0.95, 0.15, 2.95, 0.85, 'pine'), (0.2, -0.1, 3.25, 0.7, 'pine_d'), (-0.45, 0.05, 2.85, 0.62, 'pine'), (1.5, 0.0, 2.6, 0.55, 'pine_d'), (0.6, 0.3, 3.5, 0.5, 'pine')]:
    b.ball(r, (x, y, z), m, sub=1, scale=(1.25, 1.1, 0.5), jit=0.1, f=wob(0.14, int(x * 10 + 20)))
b.done('pine_k', smooth=0, shade=(0.68, 1.1), under=0.4)


def leafy(name, h, canopy, m='tint_leaf', tr=0.2, seed=2):
    b = B()
    trunk(b, h, tr, tr * 0.6, lean=(0.04, 0.02))
    for i, (x, y, z, r) in enumerate(canopy):
        b.ball(r, (x, y, z), m, sub=1, scale=(1, 1, 0.82), tone=0.9 + 0.2 * (z - h) / 2, jit=0.09, f=wob(0.13, seed + i))
    b.done(name, smooth=0, shade=(0.62, 1.12), under=0.42)


leafy('tree_a', 1.9, [(0, 0, 2.5, 1.15), (0.75, 0.2, 2.2, 0.8), (-0.7, -0.15, 2.25, 0.85), (0.1, 0.5, 3.15, 0.75), (-0.2, -0.6, 2.9, 0.7)], seed=2)
leafy('tree_b', 2.6, [(0, 0, 3.4, 1.0), (0.5, 0.2, 2.9, 0.75), (-0.5, -0.1, 3.0, 0.7), (0.05, 0.1, 4.2, 0.7)], seed=7, tr=0.16)
# 느티나무(마을 큰 나무)
b = B()
trunk(b, 2.6, 0.5, 0.34, seg=8)
for a, ln, up in [(0.4, 1.9, 0.9), (2.3, 1.8, 0.8), (4.2, 2.0, 1.0), (5.5, 1.6, 0.7)]:
    b.cone(0.2, 0.1, ln, (math.cos(a) * 0.75, math.sin(a) * 0.75, 3.1), 'tint_bark', seg=5, jit=0.06, rot=(0, up, a))
for i, (x, y, z, r) in enumerate([(0, 0, 4.9, 2.0), (1.8, 0.5, 4.2, 1.5), (-1.7, 0.6, 4.3, 1.5), (0.4, -1.7, 4.2, 1.45), (-0.5, 1.7, 4.4, 1.4), (1.2, -1.0, 5.3, 1.2), (-1.1, -0.8, 5.4, 1.25), (0.3, 0.9, 5.9, 1.15)]):
    b.ball(r, (x, y, z), 'tint_leaf', sub=1, scale=(1, 1, 0.8), tone=0.88 + 0.08 * (z - 4.2), jit=0.09, f=wob(0.13, 40 + i))
b.done('tree_big', smooth=0, shade=(0.6, 1.12), under=0.42)

# 겨울나무(잎 없음) · 눈 얹힌 것
for name, sn in (('tree_bare', False), ('tree_bare_snow', True)):
    b = B()
    trunk(b, 1.9, 0.17, 0.11, lean=(0.05, 0))
    for a, up, ln, z in [(0.3, 0.75, 1.5, 2.1), (2.4, 0.9, 1.3, 2.2), (4.4, 0.7, 1.4, 1.9), (1.4, 0.4, 1.2, 2.7), (3.6, 0.5, 1.0, 2.8), (5.4, 0.35, 1.1, 2.9)]:
        d = Vector((math.cos(a) * math.sin(up), math.sin(a) * math.sin(up), math.cos(up)))
        c = Vector((0.08, 0, z)) + d * ln / 2
        b.cone(0.07, 0.025, ln, tuple(c), 'tint_bark', seg=4, jit=0.06, rot=(0, up, a))
        if sn:
            e = Vector((0.08, 0, z)) + d * ln * 0.7
            b.ball(0.16, (e.x, e.y, e.z + 0.06), 'snow', sub=1, scale=(1.5, 1.5, 0.5), jit=0.03)
    b.done(name, smooth=0, shade=(0.7, 1.08), under=0.3)

# 덤불 · 풀 · 갈대 · 꽃
b = B()
for i, (x, y, z, r) in enumerate([(0, 0, 0.42, 0.55), (0.45, 0.1, 0.32, 0.4), (-0.42, -0.1, 0.34, 0.42), (0.05, 0.38, 0.3, 0.36)]):
    b.ball(r, (x, y, z), 'tint_leaf', sub=1, scale=(1, 1, 0.8), jit=0.1, f=wob(0.14, 60 + i))
b.done('bush', smooth=0, shade=(0.62, 1.1), under=0.4)


def blades(b, n, r, h, m, m2=None, seed=1, head=None):
    rr = random.Random(seed)
    for i in range(n):
        a = rr.random() * 6.28
        d = rr.random() * r
        hh = h * (0.6 + rr.random() * 0.6)
        lean = 0.15 + rr.random() * 0.35
        b.cone(0.045, 0.004, hh, (math.cos(a) * d + math.cos(a) * lean * hh / 2, math.sin(a) * d + math.sin(a) * lean * hh / 2, hh / 2 * math.cos(lean)), m if (i % 3 or not m2) else m2, seg=3, cap=False, jit=0.12, rot=(0, lean, a))
        if head:
            b.ball(0.05, (math.cos(a) * d + math.cos(a) * math.sin(lean) * hh, math.sin(a) * d + math.sin(a) * math.sin(lean) * hh, hh * math.cos(lean)), head, sub=1, scale=(0.7, 0.7, 2.2), jit=0.1)


b = B(); blades(b, 7, 0.16, 0.42, 'grass', 'grass_d', seed=3); b.done('grass_a', smooth=0, shade=(0.6, 1.15), under=0.1)
b = B(); blades(b, 11, 0.3, 0.3, 'grass', 'grass_d', seed=5); b.done('grass_b', smooth=0, shade=(0.6, 1.15), under=0.1)
b = B(); blades(b, 9, 0.22, 1.5, 'reed', None, seed=8, head='reed_h'); b.done('reed', smooth=0, shade=(0.7, 1.1), under=0.1)
b = B(); blades(b, 8, 0.14, 0.62, 'rice', 'grass', seed=9); b.done('crop_rice', smooth=0, shade=(0.6, 1.15), under=0.1)
b = B(); blades(b, 8, 0.14, 0.7, 'gold', 'reed', seed=10, head='gold'); b.done('crop_gold', smooth=0, shade=(0.7, 1.12), under=0.1)
for name, m in (('flower_y', 'flower_y'), ('flower_w', 'flower_w'), ('flower_p', 'flower_p')):
    b = B()
    blades(b, 4, 0.1, 0.22, 'grass_d', None, seed=hash(name) & 255)
    for i in range(3):
        a = i * 2.1 + 0.4
        b.cone(0.012, 0.012, 0.26, (math.cos(a) * 0.09, math.sin(a) * 0.09, 0.13), 'grass_d', seg=3, jit=0)
        b.ball(0.06, (math.cos(a) * 0.09, math.sin(a) * 0.09, 0.28), m, sub=1, scale=(1, 1, 0.6), jit=0.05)
    b.done(name, smooth=0, shade=(0.8, 1.1), under=0.1)


# 바위 다섯: 작은 것 둘 · 넓적한 것 · 큰 것 · 이끼 낀 것
def rock(name, r, sc, seed, sub=1, moss=False, k=0.2):
    b = B()
    b.ball(r, (0, 0, r * sc[2] * 0.55), 'rock', sub=sub, scale=sc, jit=0.08, f=wob(k, seed))
    if moss:
        b.ball(r * 0.7, (0.1, 0.05, r * sc[2] * 1.0), 'moss', sub=1, scale=(sc[0] * 0.9, sc[1] * 0.9, 0.3), jit=0.1, f=wob(0.15, seed + 3))
    b.done(name, smooth=0, shade=(0.62, 1.12), under=0.35)


rock('rock_a', 0.5, (1.1, 0.9, 0.7), 21)
rock('rock_b', 0.75, (1.2, 1.0, 0.8), 22, moss=True)
rock('rock_flat', 0.8, (1.4, 1.1, 0.35), 23)
rock('rock_big', 1.5, (1.2, 1.0, 0.95), 24, sub=2, k=0.16, moss=True)
rock('rock_tall', 1.0, (0.8, 0.75, 1.7), 25, sub=2, k=0.16)

# 그루터기 · 통나무 · 장작더미
b = B(); b.cone(0.34, 0.28, 0.42, (0, 0, 0.21), 'tint_bark', seg=8, jit=0.07); b.cone(0.26, 0.26, 0.02, (0, 0, 0.43), 'wood_cut', seg=8, jit=0.03)
b.done('stump', smooth=0, shade=(0.7, 1.08))
b = B(); b.cone(0.24, 0.2, 2.6, (0, 0, 0.24), 'tint_bark', seg=7, jit=0.07, rot=(0, math.pi / 2, 0))
for s in (-1, 1):
    b.cone(0.2 if s > 0 else 0.16, 0.2 if s > 0 else 0.16, 0.02, (s * 1.31, 0, 0.24), 'wood_cut', seg=7, rot=(0, math.pi / 2, 0), jit=0.03)
b.done('log', smooth=0, shade=(0.7, 1.08))
b = B()
for i, (x, z) in enumerate([(-0.3, 0.13), (0, 0.13), (0.3, 0.13), (-0.15, 0.37), (0.15, 0.37), (0, 0.61)]):
    b.cone(0.13, 0.13, 0.9, (x, 0, z), 'wood' if i % 2 else 'tint_bark', seg=6, rot=(math.pi / 2, 0, 0), jit=0.08)
    for s in (-1, 1):
        b.cone(0.105, 0.105, 0.02, (x, s * 0.455, z), 'wood_cut', seg=6, rot=(math.pi / 2, 0, 0), jit=0.04)
b.done('firewood', smooth=0, shade=(0.7, 1.08))

export('nature.glb')

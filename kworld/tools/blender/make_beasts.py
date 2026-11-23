"""케이월드 「다섯 해」 짐승 — 움직이는 짐승(준호 11-23 「강아지도 움직임이 있어야 하는데 그냥 통통 튀면서 움직인다」). beasts.glb.
짐승마다 조각을 따로 둔다: 몸통 · 머리 · 다리 넷 · 꼬리(+ 개 아래턱, 소 귀 둘·멍에, 닭 날개 둘·다리 둘).
물체마다 원점 = 돌림 중심(어깨·엉덩이·목·꼬리뿌리) — farm.js 가 그 자리를 축으로 다리를 엇갈려 돌린다.
좌표: 블렌더 z 위 · 앞 -y(내보내면 three 의 +z 가 앞). 크기는 사람(키 2.0) 기준.
개 = 누렁이(진돗개 — 선 귀 · 말아 올린 꼬리) · 닭 = tint_fur 로 깃 색을 바꾼다 · 소 = 한우 황소(코뚜레 · 짧게 굽은 뿔)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *
import bmesh
from mathutils import Vector

reset()
for n, c in [('dogc', 0xc98e4e), ('dogd', 0xa86e38), ('dogl', 0xecd6ae), ('ink', 0x2b2118), ('pink', 0xd8848a), ('tint_fur', 0xf2eee4), ('tint_tail', 0x3a3a34),
             ('comb', 0xd8382c), ('beak', 0xe8b03a), ('oxc', 0xb8763c), ('oxd', 0x8e5428), ('oxl', 0xd8b080), ('oxn', 0x4a3428), ('horn', 0xd8ccb0), ('hoof', 0x3a2c22),
             ('wood', 0x7a5632), ('wood_l', 0xa8845a), ('rope', 0xc8b080)]:
    mat(n, c)


def seg(b, p0, p1, r0, r1, m, n=7, **k):
    """p0 → p1 로 뻗은 원뿔 토막(다리·목·꼬리)."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    h = d.length
    Q = d.normalized().to_track_quat('Z', 'Y').to_matrix()
    t = bmesh.new()
    bmesh.ops.create_cone(t, cap_ends=True, cap_tris=False, segments=n, radius1=max(r0, 1e-4), radius2=max(r1, 1e-4), depth=h)
    return b._take(t, m, (0, 0, 0), f=lambda co: p0 + Q @ (co + Vector((0, 0, h / 2))), **k)


def egg(b, c, r, m, sub=2, rot=(0, 0, 0), **k):
    """타원 덩이(몸통·머리·허벅지)."""
    return b.ball(1.0, c, m, sub=sub, scale=r, rot=rot, **k)


def chain(b, pts, rads, m, n=7, **k):
    for i in range(len(pts) - 1):
        seg(b, pts[i], pts[i + 1], rads[i], rads[i + 1], m, n=n, **k)
        if 0 < i:
            b.ball(rads[i] * 1.0, pts[i], m, sub=1, **k)


# ───────── 개(누렁이) ─────────
HIP = (0, 0.26, 0.5)
b = B()
egg(b, (0, -0.02, 0.5), (0.155, 0.35, 0.165), 'dogc', jit=0.02)
egg(b, (0, -0.25, 0.48), (0.165, 0.17, 0.2), 'dogc', jit=0.02)
egg(b, (0, -0.3, 0.43), (0.12, 0.1, 0.15), 'dogl', jit=0.02)            # 앞가슴 흰 털
egg(b, (0, 0.2, 0.5), (0.155, 0.17, 0.17), 'dogc', jit=0.02)
egg(b, (0, 0.0, 0.38), (0.11, 0.26, 0.07), 'dogl', jit=0.02)            # 배
egg(b, (0, -0.12, 0.62), (0.12, 0.26, 0.06), 'dogd', jit=0.02)          # 등줄기 짙은 털
b.done('dog_body', origin=HIP, smooth=50, shade=(0.78, 1.06), under=0.22)

NECK = (0, -0.33, 0.6)
b = B()
seg(b, (0, -0.31, 0.56), (0, -0.42, 0.78), 0.115, 0.095, 'dogc', n=8)
egg(b, (0, -0.45, 0.83), (0.13, 0.13, 0.12), 'dogc', jit=0.02)
egg(b, (0, -0.47, 0.78), (0.11, 0.1, 0.08), 'dogl', jit=0.02)           # 볼
seg(b, (0, -0.5, 0.8), (0, -0.655, 0.775), 0.075, 0.042, 'dogl', n=8)  # 윗주둥이
b.ball(0.032, (0, -0.665, 0.785), 'ink', sub=1)
for s in (-1, 1):
    b.ball(0.02, (s * 0.068, -0.555, 0.865), 'ink', sub=1)
    seg(b, (s * 0.07, -0.43, 0.92), (s * 0.095, -0.41, 1.05), 0.055, 0.006, 'dogc', n=4, tone=0.95)   # 선 귀
    seg(b, (s * 0.07, -0.44, 0.93), (s * 0.09, -0.425, 1.02), 0.032, 0.004, 'pink', n=4, tone=0.9)
b.done('dog_head', origin=NECK, smooth=50, shade=(0.8, 1.06), under=0.2)

JAW = (0, -0.5, 0.755)
b = B()
seg(b, (0, -0.49, 0.755), (0, -0.635, 0.74), 0.05, 0.03, 'dogl', n=7)
seg(b, (0, -0.52, 0.765), (0, -0.62, 0.762), 0.032, 0.022, 'pink', n=6)  # 혀
b.done('dog_jaw', origin=JAW, smooth=40, shade=(0.82, 1.04), under=0.2)

for nm, s, front in (('dog_legFL', -1, True), ('dog_legFR', 1, True), ('dog_legBL', -1, False), ('dog_legBR', 1, False)):
    b = B(); x = s * 0.092
    if front:
        o = (x, -0.27, 0.47)
        egg(b, (x, -0.27, 0.4), (0.055, 0.075, 0.1), 'dogc', sub=1)
        seg(b, (x, -0.27, 0.42), (x, -0.27, 0.2), 0.052, 0.04, 'dogc')
        seg(b, (x, -0.27, 0.2), (x, -0.255, 0.04), 0.04, 0.033, 'dogl')
        egg(b, (x, -0.275, 0.03), (0.04, 0.055, 0.03), 'dogl', sub=1)
    else:
        o = (x, 0.24, 0.49)
        egg(b, (s * 0.1, 0.25, 0.38), (0.06, 0.105, 0.135), 'dogc', sub=2)
        seg(b, (x, 0.29, 0.3), (x, 0.33, 0.14), 0.042, 0.034, 'dogc')
        seg(b, (x, 0.33, 0.14), (x, 0.29, 0.04), 0.034, 0.03, 'dogl')
        b.ball(0.034, (x, 0.33, 0.14), 'dogc', sub=1)
        egg(b, (x, 0.28, 0.03), (0.04, 0.055, 0.03), 'dogl', sub=1)
    b.done(nm, origin=o, smooth=50, shade=(0.8, 1.04), under=0.2)

b = B()
chain(b, [(0, 0.36, 0.6), (0, 0.44, 0.72), (0, 0.43, 0.85), (0, 0.34, 0.9), (0, 0.25, 0.85)], [0.05, 0.058, 0.058, 0.046, 0.03], 'dogc', n=7)
b.ball(0.034, (0, 0.25, 0.85), 'dogl', sub=1)
b.done('dog_tail', origin=(0, 0.36, 0.6), smooth=50, shade=(0.82, 1.06), under=0.15)

# ───────── 닭(tint_fur 로 깃 색) ─────────
b = B()
egg(b, (0, 0.02, 0.3), (0.145, 0.2, 0.14), 'tint_fur', jit=0.03)
egg(b, (0, -0.1, 0.29), (0.125, 0.12, 0.13), 'tint_fur', jit=0.03)
for i, (a, l) in enumerate(((-0.45, 0.24), (0.0, 0.27), (0.45, 0.24))):
    b.box((0.03, 0.09, l), (math.sin(a) * 0.05, 0.2, 0.4), 'tint_tail', rot=(-0.55, a * 0.6, 0), bevel=0.012, tone=0.95)   # 꽁지깃
b.done('hen_body', origin=(0, 0, 0.3), smooth=40, shade=(0.82, 1.06), under=0.2)

b = B()
seg(b, (0, -0.12, 0.35), (0, -0.17, 0.5), 0.07, 0.05, 'tint_fur', n=7)
b.ball(0.062, (0, -0.18, 0.53), 'tint_fur', sub=2)
seg(b, (0, -0.225, 0.535), (0, -0.285, 0.52), 0.022, 0.003, 'beak', n=5)
for i, (y, z, r) in enumerate(((-0.215, 0.585, 0.025), (-0.185, 0.6, 0.03), (-0.155, 0.588, 0.025))):
    b.ball(r, (0, y, z), 'comb', sub=1, scale=(0.55, 1, 1))
b.ball(0.022, (0, -0.225, 0.49), 'comb', sub=1, scale=(0.6, 1, 1.3))
for s in (-1, 1):
    b.ball(0.012, (s * 0.045, -0.2, 0.545), 'ink', sub=1)
b.done('hen_head', origin=(0, -0.13, 0.38), smooth=40, shade=(0.84, 1.06), under=0.18)

for nm, s in (('hen_wingL', -1), ('hen_wingR', 1)):
    b = B()
    egg(b, (s * 0.142, 0.04, 0.31), (0.03, 0.145, 0.085), 'tint_fur', sub=2, rot=(0.25, 0, 0), tone=0.86)
    b.done(nm, origin=(s * 0.135, -0.06, 0.36), smooth=40, shade=(0.8, 1.04), under=0.2)
for nm, s in (('hen_legL', -1), ('hen_legR', 1)):
    b = B(); x = s * 0.06
    seg(b, (x, 0.0, 0.2), (x, 0.0, 0.02), 0.018, 0.014, 'beak', n=5)
    for a in (-0.5, 0, 0.5):
        b.box((0.012, 0.075, 0.012), (x + math.sin(a) * 0.035, -math.cos(a) * 0.035, 0.008), 'beak', rot=(0, 0, a))
    b.box((0.012, 0.04, 0.012), (x, 0.022, 0.008), 'beak')
    b.done(nm, origin=(x, 0, 0.2), smooth=0, shade=(0.86, 1.04), under=0.1)

# ───────── 소(한우 황소) ─────────
b = B()
egg(b, (0, 0.0, 1.15), (0.43, 0.98, 0.41), 'oxc', jit=0.02)
egg(b, (0, -0.55, 1.28), (0.42, 0.45, 0.43), 'oxc', jit=0.02)
egg(b, (0, 0.62, 1.22), (0.39, 0.4, 0.37), 'oxc', jit=0.02)
egg(b, (0, -0.85, 0.98), (0.13, 0.22, 0.22), 'oxc', jit=0.02)           # 턱밑살
egg(b, (0, -0.05, 0.86), (0.3, 0.7, 0.14), 'oxl', jit=0.02)             # 배
egg(b, (0, -0.15, 1.5), (0.22, 0.7, 0.08), 'oxd', jit=0.02)             # 등줄기
b.done('ox_body', origin=(0, 0, 1.15), smooth=50, shade=(0.76, 1.06), under=0.22)

OXNECK = (0, -0.92, 1.36)
b = B()
seg(b, (0, -0.86, 1.32), (0, -1.24, 1.26), 0.3, 0.24, 'oxc', n=9)
egg(b, (0, -1.36, 1.22), (0.21, 0.25, 0.23), 'oxc', rot=(0.5, 0, 0))
seg(b, (0, -1.44, 1.13), (0, -1.6, 0.94), 0.19, 0.165, 'oxl', n=9)
egg(b, (0, -1.63, 0.91), (0.16, 0.08, 0.11), 'oxn', sub=2, rot=(0.6, 0, 0))
egg(b, (0, -1.3, 1.44), (0.13, 0.1, 0.06), 'oxd', sub=1)                # 앞머리 털
pts = [(math.sin(a) * 0.1, -1.69 - (1 - math.cos(a)) * 0.0, 0.84 + math.cos(a) * 0.1) for a in [i * math.pi * 2 / 10 for i in range(11)]]
for i in range(10):
    seg(b, pts[i], pts[i + 1], 0.016, 0.016, 'wood_l', n=4)              # 코뚜레
for s in (-1, 1):
    b.ball(0.028, (s * 0.17, -1.42, 1.28), 'ink', sub=1)
    chain(b, [(s * 0.13, -1.3, 1.42), (s * 0.27, -1.29, 1.47), (s * 0.34, -1.34, 1.58)], [0.055, 0.04, 0.016], 'horn', n=6)
b.done('ox_head', origin=OXNECK, smooth=50, shade=(0.78, 1.06), under=0.2)
for nm, s in (('ox_earL', -1), ('ox_earR', 1)):
    b = B()
    egg(b, (s * 0.33, -1.27, 1.36), (0.13, 0.035, 0.065), 'oxc', sub=1, rot=(0, s * 0.3, 0))
    egg(b, (s * 0.34, -1.285, 1.36), (0.09, 0.012, 0.04), 'pink', sub=1, rot=(0, s * 0.3, 0), tone=0.9)
    b.done(nm, origin=(s * 0.2, -1.28, 1.38), smooth=40, shade=(0.82, 1.04), under=0.1)

for nm, s, front in (('ox_legFL', -1, True), ('ox_legFR', 1, True), ('ox_legBL', -1, False), ('ox_legBR', 1, False)):
    b = B(); x = s * 0.25
    if front:
        o = (x, -0.6, 1.02)
        egg(b, (x, -0.6, 0.86), (0.14, 0.18, 0.24), 'oxc', sub=2)
        seg(b, (x, -0.61, 0.8), (x, -0.62, 0.42), 0.12, 0.085, 'oxc', n=8)
        b.ball(0.088, (x, -0.62, 0.42), 'oxc', sub=1)
        seg(b, (x, -0.62, 0.42), (x, -0.6, 0.1), 0.078, 0.07, 'oxc', n=8)
    else:
        o = (x, 0.64, 1.06)
        egg(b, (s * 0.26, 0.66, 0.86), (0.15, 0.24, 0.3), 'oxc', sub=2)
        seg(b, (x, 0.72, 0.64), (x, 0.78, 0.36), 0.1, 0.08, 'oxc', n=8)
        b.ball(0.082, (x, 0.78, 0.36), 'oxc', sub=1)
        seg(b, (x, 0.78, 0.36), (x, 0.7, 0.1), 0.075, 0.068, 'oxc', n=8)
    seg(b, (x, o[1] + (0.0 if front else 0.06), 0.11), (x, o[1] + (0.0 if front else 0.06) - 0.02, 0.0), 0.08, 0.088, 'hoof', n=8)
    b.done(nm, origin=o, smooth=50, shade=(0.78, 1.04), under=0.2)

b = B()
seg(b, (0, 0.98, 1.38), (0, 1.05, 0.72), 0.05, 0.028, 'oxc', n=6)
egg(b, (0, 1.05, 0.62), (0.065, 0.065, 0.14), 'oxn', sub=1)
b.done('ox_tail', origin=(0, 0.98, 1.38), smooth=40, shade=(0.8, 1.04), under=0.1)

b = B()   # 멍에(달구지를 끌 때 목에 얹는 굽은 나무) + 끈
pts = [(x, -0.86, 1.58 + 0.12 * math.cos(x * 2.2)) for x in (-0.55, -0.3, 0.0, 0.3, 0.55)]
chain(b, pts, [0.05, 0.06, 0.065, 0.06, 0.05], 'wood', n=6)
for s in (-1, 1):
    seg(b, (s * 0.36, -0.86, 1.62), (s * 0.36, -0.86, 1.1), 0.028, 0.024, 'wood_l', n=5)
    seg(b, (s * 0.5, -0.86, 1.6), (s * 0.5, 1.0, 1.1), 0.015, 0.015, 'rope', n=4)
b.done('ox_yoke', origin=(0, 0, 1.15), smooth=0, shade=(0.8, 1.06), under=0.15)

export('beasts.glb')

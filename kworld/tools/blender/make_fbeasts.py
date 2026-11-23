"""케이월드 「다섯 해」 짐승 — 구워 입힌 모델(준호 11-23 「블렌더로 해서 좀 더 제대로」). fbeasts.glb.
make_beasts.py 와 같은 조각·같은 돌림 중심(farm/beasts.js 가 그대로 움직인다) — 모양을 더 둥글게(곡면 매끈), 털 결·얼룩을 굽고 구석 그늘을 넣는다.
닭 깃 색은 굽지 않고 가리개(R 깃 · G 꽁지)로 내보내 흰 닭·누런 닭을 색으로 가른다. 앞 = -y."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *
from kw_bake import *
import bmesh
from mathutils import Vector

PREVIEW = '--preview' in sys.argv
reset_bake(samples=24)
m_fur('dogc', (0xa87438, 0xc98e4e, 0xddaa66)); m_fur('dogd', (0x8a5a2a, 0xa86e38, 0xb88044)); m_fur('dogl', (0xdcc49a, 0xecd6ae, 0xf6e8c8))
m_plain('ink', 0x1a1410, var=0.1, rough=0.4); m_plain('pink', 0xd8848a, var=0.05); m_fur('tint_fur', (0xdedad0, 0xf2eee4, 0xfcfaf4), scale=1.6); m_fur('tint_tail', (0xd0ccc4, 0xeeeae0, 0xfaf8f2), axis='Z', scale=1.4)
m_plain('comb', 0xd8382c, var=0.08); m_plain('beak', 0xe8b03a, var=0.08)
m_fur('oxc', (0x9a5e2c, 0xb8763c, 0xcc8e52), scale=0.6); m_fur('oxd', (0x7a4420, 0x8e5428, 0xa26634), scale=0.6); m_fur('oxl', (0xc89e6c, 0xd8b080, 0xe8c89c), scale=0.6)
m_plain('oxn', 0x3a2a20, var=0.12, rough=0.5); m_plain('horn', 0xd8ccb0, var=0.1, rough=0.5); m_plain('hoof', 0x2a201a, var=0.1, rough=0.5)
m_wood('wood', axis='X'); m_wood('wood_l', cols=(0x8a6a40, 0xa8845a, 0xc4a070), axis='Z'); m_plain('rope', 0xb89a58, var=0.2, scale=30)
OBJ = []
KEEP = ('ink', 'pink', 'comb', 'beak', 'horn', 'hoof', 'oxn', 'wood', 'wood_l', 'rope', 'tint_tail')
SKIN = {'dog_body': (0.012, 700), 'dog_head': (0.009, 700), 'dog_jaw': (0.008, 120), 'dog_legFL': (0.008, 240), 'dog_legFR': (0.008, 240), 'dog_legBL': (0.008, 280), 'dog_legBR': (0.008, 280), 'dog_tail': (0.008, 220),
        'hen_body': (0.008, 420), 'hen_head': (0.006, 300), 'hen_wingL': (0.006, 120), 'hen_wingR': (0.006, 120),
        'ox_body': (0.03, 800), 'ox_head': (0.018, 800), 'ox_earL': (0.008, 80), 'ox_earR': (0.008, 80), 'ox_legFL': (0.014, 300), 'ox_legFR': (0.014, 300), 'ox_legBL': (0.014, 340), 'ox_legBR': (0.014, 340), 'ox_tail': (0.01, 140)}


def fin(ob):
    """겹친 덩이를 한 겹 살갗으로 합치고(skin) 색 가리개를 단다."""
    if ob.name in SKIN:
        skin(ob, voxel=SKIN[ob.name][0], faces=SKIN[ob.name][1], keep=KEEP)
    return mask_by(ob, r=('tint_fur',), g=('tint_tail',))




def egg(b, c, r, m, sub=2, rot=(0, 0, 0), **k):
    """타원 덩이(몸통·머리·허벅지)."""
    k.pop('jit', None)
    return b.ball(1.0, c, m, sub=max(sub, 2), scale=r, rot=rot, jit=0, **k)


def chain(b, pts, rads, m, n=7, **k):
    for i in range(len(pts) - 1):
        seg(b, pts[i], pts[i + 1], rads[i], rads[i + 1], m, n=n, jit=0)
        if 0 < i:
            b.ball(rads[i] * 1.0, pts[i], m, sub=2, jit=0)


# ───────── 개(누렁이) ─────────
HIP = (0, 0.26, 0.5)
b = B()
egg(b, (0, -0.02, 0.5), (0.155, 0.35, 0.165), 'dogc', jit=0)
egg(b, (0, -0.25, 0.48), (0.165, 0.17, 0.2), 'dogc', jit=0)
egg(b, (0, -0.3, 0.43), (0.12, 0.1, 0.15), 'dogl', jit=0)            # 앞가슴 흰 털
egg(b, (0, 0.2, 0.5), (0.155, 0.17, 0.17), 'dogc', jit=0)
egg(b, (0, 0.0, 0.38), (0.11, 0.26, 0.07), 'dogl', jit=0)            # 배
egg(b, (0, -0.12, 0.62), (0.12, 0.26, 0.06), 'dogd', jit=0)          # 등줄기 짙은 털
OBJ.append(fin(b.done('dog_body', origin=HIP, smooth=60, shade=(1, 1), under=0)))
NECK = (0, -0.33, 0.6)
b = B()
seg(b, (0, -0.31, 0.56), (0, -0.42, 0.78), 0.115, 0.095, 'dogc', n=8)
egg(b, (0, -0.45, 0.83), (0.13, 0.13, 0.12), 'dogc', jit=0)
egg(b, (0, -0.47, 0.78), (0.11, 0.1, 0.08), 'dogl', jit=0)           # 볼
seg(b, (0, -0.5, 0.8), (0, -0.655, 0.775), 0.075, 0.042, 'dogl', n=8)  # 윗주둥이
b.ball(0.032, (0, -0.665, 0.785), 'ink', sub=2)
for s in (-1, 1):
    b.ball(0.02, (s * 0.068, -0.555, 0.865), 'ink', sub=2)
    seg(b, (s * 0.07, -0.43, 0.92), (s * 0.095, -0.41, 1.05), 0.055, 0.006, 'dogc', n=4, tone=0.95)   # 선 귀
    seg(b, (s * 0.07, -0.44, 0.93), (s * 0.09, -0.425, 1.02), 0.032, 0.004, 'pink', n=4, tone=0.9)
OBJ.append(fin(b.done('dog_head', origin=NECK, smooth=60, shade=(1, 1), under=0)))
JAW = (0, -0.5, 0.755)
b = B()
seg(b, (0, -0.49, 0.755), (0, -0.635, 0.74), 0.05, 0.03, 'dogl', n=7)
seg(b, (0, -0.52, 0.765), (0, -0.62, 0.762), 0.032, 0.022, 'pink', n=6)  # 혀
OBJ.append(fin(b.done('dog_jaw', origin=JAW, smooth=60, shade=(1, 1), under=0)))
for nm, s, front in (('dog_legFL', -1, True), ('dog_legFR', 1, True), ('dog_legBL', -1, False), ('dog_legBR', 1, False)):
    b = B(); x = s * 0.092
    if front:
        o = (x, -0.27, 0.47)
        egg(b, (x, -0.27, 0.4), (0.055, 0.075, 0.1), 'dogc', sub=2)
        seg(b, (x, -0.27, 0.42), (x, -0.27, 0.2), 0.052, 0.04, 'dogc')
        seg(b, (x, -0.27, 0.2), (x, -0.255, 0.04), 0.04, 0.033, 'dogl')
        egg(b, (x, -0.275, 0.03), (0.04, 0.055, 0.03), 'dogl', sub=2)
    else:
        o = (x, 0.24, 0.49)
        egg(b, (s * 0.1, 0.25, 0.38), (0.06, 0.105, 0.135), 'dogc', sub=2)
        seg(b, (x, 0.29, 0.3), (x, 0.33, 0.14), 0.042, 0.034, 'dogc')
        seg(b, (x, 0.33, 0.14), (x, 0.29, 0.04), 0.034, 0.03, 'dogl')
        b.ball(0.034, (x, 0.33, 0.14), 'dogc', sub=2)
        egg(b, (x, 0.28, 0.03), (0.04, 0.055, 0.03), 'dogl', sub=2)
    OBJ.append(fin(b.done(nm, origin=o, smooth=60, shade=(1, 1), under=0)))
b = B()
chain(b, [(0, 0.36, 0.6), (0, 0.44, 0.72), (0, 0.43, 0.85), (0, 0.34, 0.9), (0, 0.25, 0.85)], [0.05, 0.058, 0.058, 0.046, 0.03], 'dogc', n=7)
b.ball(0.034, (0, 0.25, 0.85), 'dogl', sub=2)
OBJ.append(fin(b.done('dog_tail', origin=(0, 0.36, 0.6), smooth=60, shade=(1, 1), under=0)))
# ───────── 닭(tint_fur 로 깃 색) ─────────
b = B()
egg(b, (0, 0.02, 0.3), (0.145, 0.2, 0.14), 'tint_fur', jit=0)
egg(b, (0, -0.1, 0.29), (0.125, 0.12, 0.13), 'tint_fur', jit=0)
for i, (a, l) in enumerate(((-0.45, 0.24), (0.0, 0.27), (0.45, 0.24))):
    b.box((0.03, 0.09, l), (math.sin(a) * 0.05, 0.2, 0.4), 'tint_tail', rot=(-0.55, a * 0.6, 0), bevel=0.012, tone=0.95)   # 꽁지깃
OBJ.append(fin(b.done('hen_body', origin=(0, 0, 0.3), smooth=60, shade=(1, 1), under=0)))
b = B()
seg(b, (0, -0.12, 0.35), (0, -0.17, 0.5), 0.07, 0.05, 'tint_fur', n=7)
b.ball(0.062, (0, -0.18, 0.53), 'tint_fur', sub=2)
seg(b, (0, -0.225, 0.535), (0, -0.285, 0.52), 0.022, 0.003, 'beak', n=5)
for i, (y, z, r) in enumerate(((-0.215, 0.585, 0.025), (-0.185, 0.6, 0.03), (-0.155, 0.588, 0.025))):
    b.ball(r, (0, y, z), 'comb', sub=2, scale=(0.55, 1, 1))
b.ball(0.022, (0, -0.225, 0.49), 'comb', sub=2, scale=(0.6, 1, 1.3))
for s in (-1, 1):
    b.ball(0.012, (s * 0.045, -0.2, 0.545), 'ink', sub=2)
OBJ.append(fin(b.done('hen_head', origin=(0, -0.13, 0.38), smooth=60, shade=(1, 1), under=0)))
for nm, s in (('hen_wingL', -1), ('hen_wingR', 1)):
    b = B()
    egg(b, (s * 0.142, 0.04, 0.31), (0.03, 0.145, 0.085), 'tint_fur', sub=2, rot=(0.25, 0, 0), tone=0.86)
    OBJ.append(fin(b.done(nm, origin=(s * 0.135, -0.06, 0.36), smooth=60, shade=(1, 1), under=0)))
for nm, s in (('hen_legL', -1), ('hen_legR', 1)):
    b = B(); x = s * 0.06
    seg(b, (x, 0.0, 0.2), (x, 0.0, 0.02), 0.018, 0.014, 'beak', n=5)
    for a in (-0.5, 0, 0.5):
        b.box((0.012, 0.075, 0.012), (x + math.sin(a) * 0.035, -math.cos(a) * 0.035, 0.008), 'beak', rot=(0, 0, a))
    b.box((0.012, 0.04, 0.012), (x, 0.022, 0.008), 'beak')
    OBJ.append(fin(b.done(nm, origin=(x, 0, 0.2), smooth=60, shade=(1, 1), under=0)))
# ───────── 소(한우 황소) ─────────
b = B()
egg(b, (0, 0.0, 1.15), (0.43, 0.98, 0.41), 'oxc', jit=0)
egg(b, (0, -0.55, 1.28), (0.42, 0.45, 0.43), 'oxc', jit=0)
egg(b, (0, 0.62, 1.22), (0.39, 0.4, 0.37), 'oxc', jit=0)
egg(b, (0, -0.85, 0.98), (0.13, 0.22, 0.22), 'oxc', jit=0)           # 턱밑살
egg(b, (0, -0.05, 0.86), (0.3, 0.7, 0.14), 'oxl', jit=0)             # 배
egg(b, (0, -0.15, 1.5), (0.22, 0.7, 0.08), 'oxd', jit=0)             # 등줄기
OBJ.append(fin(b.done('ox_body', origin=(0, 0, 1.15), smooth=60, shade=(1, 1), under=0)))
OXNECK = (0, -0.92, 1.36)
b = B()
seg(b, (0, -0.86, 1.32), (0, -1.24, 1.26), 0.3, 0.24, 'oxc', n=9)
egg(b, (0, -1.36, 1.22), (0.21, 0.25, 0.23), 'oxc', rot=(0.5, 0, 0))
seg(b, (0, -1.44, 1.13), (0, -1.6, 0.94), 0.19, 0.165, 'oxl', n=9)
egg(b, (0, -1.63, 0.91), (0.16, 0.08, 0.11), 'oxn', sub=2, rot=(0.6, 0, 0))
egg(b, (0, -1.3, 1.44), (0.13, 0.1, 0.06), 'oxd', sub=2)                # 앞머리 털
pts = [(math.sin(a) * 0.1, -1.69 - (1 - math.cos(a)) * 0.0, 0.84 + math.cos(a) * 0.1) for a in [i * math.pi * 2 / 10 for i in range(11)]]
for i in range(10):
    seg(b, pts[i], pts[i + 1], 0.016, 0.016, 'wood_l', n=4)              # 코뚜레
for s in (-1, 1):
    b.ball(0.028, (s * 0.17, -1.42, 1.28), 'ink', sub=2)
    chain(b, [(s * 0.13, -1.3, 1.42), (s * 0.27, -1.29, 1.47), (s * 0.34, -1.34, 1.58)], [0.055, 0.04, 0.016], 'horn', n=6)
OBJ.append(fin(b.done('ox_head', origin=OXNECK, smooth=60, shade=(1, 1), under=0)))
for nm, s in (('ox_earL', -1), ('ox_earR', 1)):
    b = B()
    egg(b, (s * 0.33, -1.27, 1.36), (0.13, 0.035, 0.065), 'oxc', sub=2, rot=(0, s * 0.3, 0))
    egg(b, (s * 0.34, -1.285, 1.36), (0.09, 0.012, 0.04), 'pink', sub=2, rot=(0, s * 0.3, 0), tone=0.9)
    OBJ.append(fin(b.done(nm, origin=(s * 0.2, -1.28, 1.38), smooth=60, shade=(1, 1), under=0)))
for nm, s, front in (('ox_legFL', -1, True), ('ox_legFR', 1, True), ('ox_legBL', -1, False), ('ox_legBR', 1, False)):
    b = B(); x = s * 0.25
    if front:
        o = (x, -0.6, 1.02)
        egg(b, (x, -0.6, 0.86), (0.14, 0.18, 0.24), 'oxc', sub=2)
        seg(b, (x, -0.61, 0.8), (x, -0.62, 0.42), 0.12, 0.085, 'oxc', n=8)
        b.ball(0.088, (x, -0.62, 0.42), 'oxc', sub=2)
        seg(b, (x, -0.62, 0.42), (x, -0.6, 0.1), 0.078, 0.07, 'oxc', n=8)
    else:
        o = (x, 0.64, 1.06)
        egg(b, (s * 0.26, 0.66, 0.86), (0.15, 0.24, 0.3), 'oxc', sub=2)
        seg(b, (x, 0.72, 0.64), (x, 0.78, 0.36), 0.1, 0.08, 'oxc', n=8)
        b.ball(0.082, (x, 0.78, 0.36), 'oxc', sub=2)
        seg(b, (x, 0.78, 0.36), (x, 0.7, 0.1), 0.075, 0.068, 'oxc', n=8)
    seg(b, (x, o[1] + (0.0 if front else 0.06), 0.11), (x, o[1] + (0.0 if front else 0.06) - 0.02, 0.0), 0.08, 0.088, 'hoof', n=8)
    OBJ.append(fin(b.done(nm, origin=o, smooth=60, shade=(1, 1), under=0)))
b = B()
seg(b, (0, 0.98, 1.38), (0, 1.05, 0.72), 0.05, 0.028, 'oxc', n=6)
egg(b, (0, 1.05, 0.62), (0.065, 0.065, 0.14), 'oxn', sub=2)
OBJ.append(fin(b.done('ox_tail', origin=(0, 0.98, 1.38), smooth=60, shade=(1, 1), under=0)))
b = B()   # 멍에(달구지를 끌 때 목에 얹는 굽은 나무) + 끈
pts = [(x, -0.86, 1.58 + 0.12 * math.cos(x * 2.2)) for x in (-0.55, -0.3, 0.0, 0.3, 0.55)]
chain(b, pts, [0.05, 0.06, 0.065, 0.06, 0.05], 'wood', n=6)
for s in (-1, 1):
    seg(b, (s * 0.36, -0.86, 1.62), (s * 0.36, -0.86, 1.1), 0.028, 0.024, 'wood_l', n=5)
    seg(b, (s * 0.5, -0.86, 1.6), (s * 0.5, 1.0, 1.1), 0.015, 0.015, 'rope', n=4)
OBJ.append(fin(b.done('ox_yoke', origin=(0, 0, 1.15), smooth=60, shade=(1, 1), under=0)))
for o in OBJ:
    print('FACES', o.name, len(o.data.polygons))
bake_set(OBJ, 'fbeasts', size=1024, normal=False, keep_color=True, ao_lo=0.5, uv_angle=86, uv_weight={'dog_head': 1.4, 'ox_head': 1.2, 'ox_yoke': 0.6})
if PREVIEW:
    by = {o.name: o for o in OBJ}
    for i, (pre, look, dist) in enumerate((('dog_', (0, 0, 0.5), 0.3), ('hen_', (0, 0, 0.3), 0.2), ('ox_', (0, 0, 1.0), 0.6))):
        preview(os.path.join(OUT, '_tex', f'fbeasts_preview{i}.png'), [o for o in OBJ if o.name.startswith(pre)], samples=24, elev=14, dist=dist, layout=False, look=look, yaw=-0.9, res=(560, 420))

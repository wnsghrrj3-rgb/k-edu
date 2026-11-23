"""케이월드 「다섯 해」 나무와 마당 소품 — 구워 입힌 모델(준호 11-23 「블렌더로 해서 좀 더 제대로」). fyard.glb.
나무: 줄기·가지는 매끈한 토막에 껍질 결, 잎은 울퉁불퉁한 둥근 뭉치에 잎 무늬와 속 그늘을 굽는다.
 · ft_pine · ft_pine2 · tree_big(늙은 소나무) — 솔잎 색까지 구움(늘 푸름)
 · ft_zel_*(느티) · ft_wil_*(버들) · gam_*(감) · jeongja_*(정자나무): 줄기와 잎이 따로 — 잎은 흰 바탕으로 굽고 가리개(R)에 철마다 색을 곱한다(봄 연두·여름 초록·가을 단풍, 겨울엔 끈다)
 · ft_bush(떨기)
소품: 텃밭(이랑·배추·무) · 나뭇단 · 서낭당(돌무더기·오색 천) · 섶다리 · 디딤돌. 이름·크기는 예전(farmtree·farmset)과 같다."""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *
from kw_bake import *
from mathutils import Vector

PREVIEW = '--preview' in sys.argv
reset_bake(samples=20)


def m_leaf(name, cols, cell=7.0):
    """잎 뭉치: 잎사귀만 한 얼룩(밝은 잎·그늘진 잎)."""
    m, nt, bs = nmat(name, 0.9)
    vo = N(nt, 'ShaderNodeTexVoronoi', Scale=cell); L(nt, coords(nt), vo.inputs['Vector'])
    n1 = N(nt, 'ShaderNodeTexNoise', Scale=2.0, Detail=3.0); L(nt, coords(nt), n1.inputs['Vector'])
    f = math1(nt, 'ADD', math1(nt, 'MULTIPLY', vo.outputs['Distance'], 0.9), math1(nt, 'MULTIPLY', n1.outputs['Fac'], 0.45))
    L(nt, ramp(nt, [(0.2, cols[0]), (0.5, cols[1]), (0.8, cols[2])], f).outputs['Color'], bs.inputs['Base Color'])
    bump(nt, bs, vo.outputs['Distance'], 0.6, 0.04)
    return m


m_wood('bark_r', cols=(0x5a2e20, 0x8a4a32, 0xa86244), axis='Z', scale=0.6); m_wood('bark', cols=(0x3e3024, 0x6a5440, 0x86705a), axis='Z', scale=0.6); m_wood('bark_g', cols=(0x5a5044, 0x7a6e5e, 0x9a8e7c), axis='Z', scale=0.5)
m_leaf('pine', (0x24462a, 0x3e6a3a, 0x5a8644), cell=11); m_leaf('tint_leaf', (0xb4b4b4, 0xe0e0e0, 0xffffff)); m_leaf('tint_wil', (0xb8b8b8, 0xe4e4e4, 0xffffff), cell=12)
m_plain('persim', 0xf07a22, var=0.15, scale=20); m_leaf('bushc', (0x2e5a2a, 0x4a8038, 0x6a9c48), cell=9)
m_stone('stone'); m_stone('stone_d', cols=(0x55524c, 0x7a766e, 0x969288)); m_stone('stone_l', cols=(0x8a867c, 0xb0aca0, 0xc8c4b8))
m_wood('wood', axis='Y'); m_wood('wood_l', cols=(0x7a5a36, 0xa88454, 0xc4a070), axis='Y'); m_wood('wood_d', cols=(0x2e2014, 0x4e3620, 0x6a4a2c), axis='Z')
m_plain('twig_d', 0x4e3a22, var=0.3, scale=20); m_mud('mud'); m_plain('soil', 0x5a4028, var=0.3, scale=14); m_leaf('cabbage', (0x5a9a40, 0x8ac860, 0xc4e49a), cell=14); m_plain('leaf_l', 0xb8dc8a, var=0.15); m_plain('radish', 0x4a9a3a, var=0.2)
m_cloth('red', 0xb0302a); m_cloth('cloth_b', 0x3a5a9a); m_cloth('flower', 0xf4d04a); m_cloth('cloth', 0xf0e8d4); m_cloth('leaf', 0x4a8a3a); m_plain('leaf_d', 0x3a6a2c, var=0.25, scale=16)
OBJ = []


def wob(k, sd):
    rr = random.Random(sd); table = {}
    def f(v):
        key = (round(v.x, 3), round(v.y, 3), round(v.z, 3))
        if key not in table:
            table[key] = 1 + (rr.random() - 0.5) * 2 * k
        return v * table[key]
    return f


def limb(b, pts, r0, r1, m, n=7):
    Ln = len(pts) - 1
    for i in range(Ln):
        ra = r0 + (r1 - r0) * i / Ln; rb = r0 + (r1 - r0) * (i + 1) / Ln
        seg(b, pts[i], pts[i + 1], ra, rb, m, n=n, jit=0)



def blob(b, c, r, m, flat, sd, rings=7, sg=9):
    """울퉁불퉁한 둥근 덩이(면을 아껴서): 반원을 돌려 만든 공을 납작하게 누르고 꼭짓점마다 조금씩 밀고 당긴다."""
    prof = [(max(0.02, math.sin(math.pi * k / (rings - 1))) * r, -math.cos(math.pi * k / (rings - 1)) * r * flat) for k in range(rings)]
    rr2 = random.Random(sd); table = {}
    def f(v):
        key = (round(v.x, 3), round(v.y, 3), round(v.z, 3))
        if key not in table:
            table[key] = 1 + (rr2.random() - 0.5) * 0.26
        return v * table[key]
    b.lathe(prof, c, m, seg=sg, cap=False, jit=0, f=f)


def tuft(b, c, r, m, rr, n=5, flat=0.62):
    """잎 뭉치: 큰 덩이 하나 + 둘레 작은 덩이들."""
    blob(b, c, r, m, flat, int(rr.random() * 1e6))
    for i in range(n - 1):
        a = i / (n - 1) * 6.283 + rr.random() * 0.5; d = r * (0.55 + rr.random() * 0.35)
        cc = (c[0] + math.cos(a) * d, c[1] + math.sin(a) * d, c[2] + (rr.random() - 0.4) * r * 0.5)
        blob(b, cc, r * (0.5 + rr.random() * 0.25), m, flat, int(rr.random() * 1e6), rings=4, sg=6)


def fin(b, name, leafy=False):
    o = b.done(name, smooth=70, shade=(1, 1), under=0)
    OBJ.append(mask_by(o, r=('tint_leaf', 'tint_wil')))
    return o


def sonamu(name, sd, h=6.0, lean=0.5, big=1.0):
    rr = random.Random(sd); b = B(); pts = [(0, 0, 0)]; x = y = 0.0
    for i in range(1, 6):
        t = i / 5; x += math.sin(t * 2.4 + sd) * lean * 0.5; y += math.cos(t * 1.7 + sd) * lean * 0.25; pts.append((x, y, h * t * 0.82))
    limb(b, pts, 0.26 * big, 0.09 * big, 'bark_r', n=8)
    b.cone(0.44 * big, 0.27 * big, 0.45, (0, 0, 0.2), 'bark_r', seg=8, jit=0)
    tips = []
    for k in range(5):
        i = 2 + k % 3; base = Vector(pts[i]) * 0.6 + Vector(pts[i + 1]) * 0.4
        a = k * 2.4 + rr.random(); ln = (1.2 + rr.random() * 1.2) * big
        tip = base + Vector((math.cos(a) * ln, math.sin(a) * ln, 0.35 + rr.random() * 0.6))
        limb(b, [tuple(base), tuple((base + tip) / 2 + Vector((0, 0, 0.25))), tuple(tip)], 0.09 * big, 0.04, 'bark_r', n=6); tips.append(tip)
    tips.append(Vector(pts[-1]) + Vector((0, 0, 0.3)))
    for t in tips:
        tuft(b, (t.x, t.y, t.z + 0.15), (0.9 + rr.random() * 0.35) * big, 'pine', rr, n=4, flat=0.42)
    fin(b, name)


sonamu('ft_pine', 3, 6.2, 0.6); sonamu('ft_pine2', 11, 5.0, 0.9); sonamu('tree_big', 17, 7.0, 0.8, big=1.25)

# 느티나무
rr = random.Random(21); b = B(); lv = B(); h = 3.0
b.cone(0.55, 0.36, h, (0, 0, h / 2), 'bark_g', seg=9, jit=0)
for k in range(5):
    a = k * 1.256 + rr.random() * 0.4
    p0 = Vector((math.cos(a) * 0.2, math.sin(a) * 0.2, h * 0.75)); p1 = p0 + Vector((math.cos(a) * 1.4, math.sin(a) * 1.4, 1.6)); p2 = p1 + Vector((math.cos(a + 0.3) * 1.2, math.sin(a + 0.3) * 1.2, 1.0))
    limb(b, [tuple(p0), tuple(p1), tuple(p2)], 0.24, 0.08, 'bark_g'); q = p1 + Vector((math.cos(a - 0.8) * 0.9, math.sin(a - 0.8) * 0.9, 0.8)); limb(b, [tuple(p1), tuple(q)], 0.1, 0.05, 'bark_g', n=6)
    tuft(lv, tuple(p2 + Vector((0, 0, 0.4))), 1.3, 'tint_leaf', rr, n=5); tuft(lv, tuple(q + Vector((0, 0, 0.3))), 0.95, 'tint_leaf', rr, n=4)
tuft(lv, (0, 0, h + 3.2), 1.4, 'tint_leaf', rr, n=5)
fin(b, 'ft_zel_trunk'); fin(lv, 'ft_zel_leaf')

# 버드나무
rr = random.Random(31); b = B(); lv = B()
limb(b, [(0, 0, 0), (0.2, 0, 1.2), (0.3, 0.1, 2.2)], 0.36, 0.24, 'bark', n=8)
for k in range(6):
    a = k * 1.05 + rr.random() * 0.4
    p0 = Vector((0.3, 0.1, 2.1)); p1 = p0 + Vector((math.cos(a) * 0.9, math.sin(a) * 0.9, 1.3)); p2 = p1 + Vector((math.cos(a) * 1.0, math.sin(a) * 1.0, 0.3))
    limb(b, [tuple(p0), tuple(p1), tuple(p2)], 0.12, 0.05, 'bark', n=6)
    for j in range(7):
        aa = j * 0.9 + rr.random(); rad = 0.3 + rr.random() * 0.7
        top = p2 + Vector((math.cos(aa) * rad, math.sin(aa) * rad, 0.2 + rr.random() * 0.3)) - Vector((math.cos(a), math.sin(a), 0)) * rr.random() * 0.8
        bot = top + Vector((math.cos(a) * 0.25, math.sin(a) * 0.25, -(2.0 + rr.random() * 1.4)))
        seg(lv, tuple(top), tuple(bot), 0.14, 0.04, 'tint_wil', n=5, jit=0)
    tuft(lv, tuple(p1 + Vector((0, 0, 0.5))), 0.75, 'tint_wil', rr, n=4, flat=0.55)
fin(b, 'ft_wil_trunk'); fin(lv, 'ft_wil_leaf')

# 감나무
rr = random.Random(41); b = B(); lv = B(); fr = B()
limb(b, [(0, 0, 0), (0.25, 0.05, 1.1), (0.15, 0.1, 2.1)], 0.24, 0.15, 'bark', n=8)
GT = []
for k in range(5):
    a = k * 1.3 + 0.4
    p0 = Vector((0.15, 0.1, 1.9)); p1 = p0 + Vector((math.cos(a) * 0.9, math.sin(a) * 0.9, 0.9)); p2 = p1 + Vector((math.cos(a + 0.4) * 0.6, math.sin(a + 0.4) * 0.6, 0.6))
    limb(b, [tuple(p0), tuple(p1), tuple(p2)], 0.1, 0.04, 'bark', n=6); GT.append(p2)
GT.append(Vector((0.1, 0.1, 3.9)))
for t in GT:
    tuft(lv, tuple(t), 0.85, 'tint_leaf', rr, n=4)
    for j in range(5):
        a = rr.random() * 6.28; d = 0.5 + rr.random() * 0.5
        fr.ball(0.17, (t.x + math.cos(a) * d, t.y + math.sin(a) * d, t.z - 0.25 - rr.random() * 0.45), 'persim', sub=1, jit=0)
fin(b, 'gam_trunk'); fin(lv, 'gam_leaf'); fin(fr, 'gam_fruit')

# 정자나무(마을 어귀 큰 느티나무)
b = B(); lv = B(); rr = random.Random(61)
b.cone(0.78, 0.5, 2.4, (0, 0, 1.2), 'bark_g', seg=10, jit=0)
for k in range(6):
    a = k * 1.05; seg(b, (math.cos(a) * 0.45, math.sin(a) * 0.45, 0.5), (math.cos(a) * 1.0, math.sin(a) * 1.0, 0.0), 0.3, 0.1, 'bark_g', n=6, jit=0)   # 드러난 뿌리
ZB = [(2.2, 0.4, 4.6), (-2.0, 1.0, 4.9), (0.3, -2.3, 4.8), (-1.2, -1.2, 5.6), (1.3, 1.6, 5.8), (0, 0, 6.6), (2.6, -1.4, 5.3), (-2.7, -0.6, 5.2)]
for (x, y, z) in ZB:
    limb(b, [(x * 0.08, y * 0.08, 2.1), (x * 0.45, y * 0.45, z * 0.62), (x * 0.85, y * 0.85, z - 0.6)], 0.24, 0.08, 'bark_g')
    tuft(lv, (x, y, z), 1.55, 'tint_leaf', rr, n=5, flat=0.7)
fin(b, 'jeongja_trunk'); fin(lv, 'jeongja_leaf')

# 떨기
rr = random.Random(51); b = B()
for i in range(4):
    a = i * 1.6; tuft(b, (math.cos(a) * 0.6, math.sin(a) * 0.6, 0.55), 0.6, 'bushc', rr, n=2)
fin(b, 'ft_bush')

# ── 마당 소품 ──
R = random.Random(23)
b = B()   # 텃밭
for i in range(4):
    y = -1.2 + i * 0.8
    b.box((4.0, 0.52, 0.22), (0, y, 0.08), 'soil', bevel=0.09, bseg=2, jit=0)
    for k in range(7):
        x = -1.7 + k * 0.56 + (R.random() - 0.5) * 0.1
        if i < 2:
            b.ball(0.17, (x, y, 0.27), 'cabbage', sub=1, scale=(1, 1, 0.8), jit=0); b.ball(0.1, (x, y, 0.36), 'leaf_l', sub=1, jit=0)
        else:
            for a in range(4):
                b.box((0.05, 0.28, 0.02), (x + math.cos(a * 1.57) * 0.1, y + math.sin(a * 1.57) * 0.1, 0.3), 'radish', rot=(0.7, 0, a * 1.57 + 0.4), jit=0)
fin(b, 'teotbat')
b = B()   # 나뭇단
for row in range(3):
    for i in range(6 - row):
        x = -0.6 + i * 0.24 + row * 0.12; z = 0.12 + row * 0.2
        seg(b, (x, -0.75, z), (x, 0.75, z + 0.01), 0.11, 0.105, 'wood' if (i + row) % 2 else 'wood_l', n=7, jit=0)
fin(b, 'namutdan')
b = B()   # 서낭당
for i in range(46):
    a = R.random() * 6.28; rad = R.random() ** 0.6 * 1.3; z = (1.3 - rad) * 0.95 * R.random()
    b.ball(0.2 + R.random() * 0.14, (math.cos(a) * rad, math.sin(a) * rad, 0.12 + z), ['stone', 'stone_l', 'stone_d'][i % 3], sub=1, scale=(1, 1, 0.7), jit=0)
seg(b, (1.55, 0.2, 0), (1.72, 0.2, 3.4), 0.14, 0.07, 'wood_d', n=7, jit=0)
for i, c in enumerate(['red', 'cloth_b', 'flower', 'cloth', 'leaf']):
    b.box((0.05, 0.3, 1.0), (1.75 + i * 0.02, -0.5 + i * 0.25, 2.6 - i * 0.1), c, rot=(0.25 * (i - 2), 0, 0), jit=0)
fin(b, 'seonang')
b = B()   # 섶다리
for i in range(7):
    x = -6 + i * 2
    for y in (-1.0, 1.0):
        seg(b, (x, y * 1.15, -0.6), (x, y * 0.95, 1.05), 0.12, 0.1, 'wood_d', n=7, jit=0)
    seg(b, (x, -1.2, 0.95), (x, 1.2, 0.95), 0.1, 0.1, 'wood', n=7, jit=0)
b.box((12.4, 2.3, 0.24), (0, 0, 1.12), 'twig_d', bevel=0.08, bseg=2, jit=0); b.box((12.2, 1.9, 0.12), (0, 0, 1.28), 'mud', bevel=0.05, jit=0)
for i in range(40):
    b.box((0.5, 0.05, 0.05), (-6 + R.random() * 12, (1.12 if i % 2 else -1.12), 1.1 + R.random() * 0.1), 'leaf_d', rot=(0, 0, 1.2 + R.random()), jit=0)
fin(b, 'seopdari')
b = B()   # 디딤돌
for i in range(5):
    b.ball(0.4, (i * 0.85 - 1.7, math.sin(i * 1.7) * 0.15, 0.03), 'stone' if i % 2 else 'stone_l', sub=1, scale=(1, 0.9, 0.2), jit=0, f=wob(0.08, i))
fin(b, 'didimdol')

b = B()   # 보에 쌓는 돌(한 칸 3.2m — 개울 바닥부터 물 위까지): 큰 막돌 서넛을 포개고 틈에 잔돌
rr = random.Random(77)
for (x, y, z, r, sc) in [(-0.9, 0.1, 0.55, 0.95, (1.0, 1.0, 0.62)), (0.85, -0.15, 0.6, 1.0, (1.0, 0.95, 0.64)), (0.0, 0.2, 1.35, 0.9, (1.15, 0.9, 0.55)), (-1.2, -0.5, 1.2, 0.5, (1, 1, 0.7)), (1.25, 0.55, 1.25, 0.5, (1, 1, 0.7))]:
    b.ball(r, (x, y, z), ['stone', 'stone_d', 'stone_l'][int(rr.random() * 3)], sub=2, scale=sc, jit=0, f=wob(0.1, int(rr.random() * 999)))
for i in range(7):
    b.ball(0.26 + rr.random() * 0.12, (-1.4 + i * 0.47, (rr.random() - 0.5) * 1.6, 1.75 + rr.random() * 0.2), ['stone', 'stone_l'][i % 2], sub=1, scale=(1, 1, 0.6), jit=0)
fin(b, 'bo_stone')

for o in OBJ:
    print('FACES', o.name, len(o.data.polygons))
bake_set(OBJ, 'fyard', size=1024 if PREVIEW else 2048, normal=False, keep_color=True, ao_lo=0.42, uv_angle=80, uv_weight={'seopdari': 0.6, 'jeongja_leaf': 0.8, 'tree_big': 0.8})
if PREVIEW:
    preview(os.path.join(OUT, '_tex', 'fyard_preview.png'), OBJ, cols=7, gap=1.5, samples=16, dist=0.75, elev=24)

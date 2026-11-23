"""케이월드 「다섯 해」 집 — 구워 입힌 모델(준호 11-23 「블렌더로 해서 좀 더 제대로」). fhouse.glb (무늬 한 장 + 노멀).
초가(큰·작은): 둥글게 부푼 이엉 지붕(처마 두께·용마름·새끼줄 그물·서까래 끝) · 황토벽과 기둥·중방 · 띠살문·봉창 · 툇마루와 댓돌 · 낮은 굴뚝 · 처마 밑 곶감.
이름과 크기는 예전 모델(build.glb·farmset.glb)과 같다 — farm.js 가 같은 이름으로 갈아 끼운다. 앞 = -y."""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *
from kw_bake import *
from mathutils import Vector

PREVIEW = '--preview' in sys.argv
reset_bake(samples=20)
R = random.Random(5)

# ── 재질 ──
m_thatch('thatch'); m_thatch('thatch_cut', cols=(0x5e4a22, 0x9a7c3c, 0xc8a85c), old=0x5a4a30)
m_plain('rope', 0x9a7a3c, var=0.25, scale=30); m_plain('dark', 0x1e1a16, var=0.2)
m_wood('wood', axis='Z'); m_wood('wood_x', axis='X'); m_wood('wood_y', axis='Y')
m_wood('wood_d', cols=(0x2e2014, 0x4e3620, 0x6a4a2c), axis='Z'); m_wood('wood_dx', cols=(0x2e2014, 0x4e3620, 0x6a4a2c), axis='X'); m_wood('wood_dy', cols=(0x2e2014, 0x4e3620, 0x6a4a2c), axis='Y')
m_wood('plank', cols=(0x6a4c2c, 0x9a7646, 0xb89260), axis='X', scale=0.7)
m_mud('mud'); m_plaster('plaster'); m_plaster('plaster_y', base=0xdcc79c, stain=0xa88a5a)
m_stone('stone'); m_stone('stone_d', cols=(0x55524c, 0x7a766e, 0x969288))
m_jar('jar'); m_plain('persim', 0xe8742a, var=0.15, scale=20); m_plain('meju', 0x8a6a40, var=0.2, scale=14); m_plain('iron', 0x2a2a30, rough=0.5)


def m_lattice(name, paper=0xf2e8cc, wood=0x4a3422, pitch=0.085, bands=(0.18, 0.5, 0.82)):
    """띠살문·봉창: 한지 위에 세로 살 촘촘히 + 가로 띠살 세 묶음. 얇은 판에 구워 넣는다(살을 하나하나 만들지 않는다)."""
    m, nt, bs = nmat(name, 0.9)
    sep = nt.nodes.new('ShaderNodeSeparateXYZ'); tc = nt.nodes.new('ShaderNodeTexCoord'); L(nt, tc.outputs['Generated'], sep.inputs['Vector'])
    so = nt.nodes.new('ShaderNodeSeparateXYZ'); L(nt, tc.outputs['Object'], so.inputs['Vector'])
    u = math1(nt, 'ADD', so.outputs['X'], so.outputs['Y'])
    vert = math1(nt, 'LESS_THAN', math1(nt, 'FRACT', math1(nt, 'DIVIDE', u, pitch)), 0.2)
    hz = None
    for bnd in bands:
        for k in (-0.035, 0.0, 0.035):
            q = math1(nt, 'LESS_THAN', math1(nt, 'ABSOLUTE', math1(nt, 'SUBTRACT', sep.outputs['Z'], bnd + k)), 0.008)
            hz = q if hz is None else math1(nt, 'MAXIMUM', hz, q)
    n1 = N(nt, 'ShaderNodeTexNoise', Scale=5.0, Detail=2.0); L(nt, coords(nt), n1.inputs['Vector'])
    pc = mix(nt, tuple(x * 0.86 for x in rgb(paper)), rgb(paper), n1.outputs['Fac'])
    L(nt, mix(nt, pc, rgb(wood), math1(nt, 'MAXIMUM', vert, hz)), bs.inputs['Base Color'])
    bump(nt, bs, math1(nt, 'MAXIMUM', vert, hz), 0.6, 0.02)
    return m


m_lattice('lattice'); m_lattice('lattice_w', pitch=0.11, bands=(0.3, 0.7))


segc = seg   # thatch_roof 의 seg(칸 수) 인자와 이름이 겹쳐서


def sgnpow(v, p):
    return math.copysign(abs(v) ** p, v)


def thatch_roof(b, w, d, z0, h, over=0.6, seg=20, y0=0.0, ropes=True, rafters=True):
    """둥근 우진각 초가지붕. 처마는 두툼하게 말려 내려오고(자른 짚 단면), 용마름을 얹고, 새끼줄로 그물처럼 묶는다."""
    prof = [(0.0, -0.2), (0.04, -0.08), (0.12, 0.06), (0.3, 0.34), (0.5, 0.6), (0.72, 0.83), (0.9, 0.96), (1.0, 1.0)]
    ridge = max(0.3, (w - d) / 2 + 0.3)

    def at(k, zz, a, lift=0.0):
        rx = (w / 2 + over) * (1 - k) + ridge * k; ry = (d / 2 + over) * (1 - k) + 0.14 * k
        return (rx * sgnpow(math.cos(a), 0.6), y0 + ry * sgnpow(math.sin(a), 0.6), z0 + h * zz + lift)

    def fn(u, v, lift=0.0):
        a = u * 2 * math.pi; f = v * (len(prof) - 1); i = min(int(f), len(prof) - 2); t = f - i
        return at(prof[i][0] + (prof[i + 1][0] - prof[i][0]) * t, prof[i][1] + (prof[i + 1][1] - prof[i][1]) * t, a, lift)
    b.grid(seg, 8, fn, 'thatch', jit=0.0)
    # 처마 끝 단면(자른 짚) — 바깥 가장자리에서 안쪽 아래로 말려 들어간다
    b.grid(seg, 2, lambda u, v: at(-0.0 + 0.1 * v, -0.2 - 0.07 * math.sin(v * math.pi) - 0.02 * v, u * 2 * math.pi), 'thatch_cut', jit=0.0)
    b.grid(seg, 1, lambda u, v: at(0.1 + 0.9 * v, -0.2 + 0.02 * v, u * 2 * math.pi), 'dark', jit=0.0)       # 지붕 속(어두움)
    # 용마름
    b.box((ridge * 2 + 0.7, 0.46, 0.24), (0, y0, z0 + h + 0.03), 'thatch_cut', bevel=0.11, bseg=3, jit=0.0)
    for i in range(-3, 4):
        b.box((0.06, 0.52, 0.27), (i * (ridge * 2 + 0.5) / 7, y0, z0 + h + 0.03), 'rope', bevel=0.02, jit=0.0)
    if ropes:   # 새끼줄: 처마로 내려가는 줄 + 가로 두 줄
        nr = max(8, int((w + d) * 1.1)); du = 0.0016
        for i in range(nr):
            u0 = (i + 0.5) / nr
            b.grid(1, 6, lambda u, v, u0=u0: fn(u0 + (u - 0.5) * 2 * du, 0.02 + v * 0.9, 0.03), 'rope', jit=0.0)
        for vv in (0.3, 0.58):
            b.grid(seg, 1, lambda u, v, vv=vv: fn(u, vv + (v - 0.5) * 0.012, 0.03), 'rope', jit=0.0)
    if rafters:   # 서까래 끝: 처마 밑으로 내민 둥근 나무
        n = max(10, int((w + d) * 1.5))
        for i in range(n):
            a = (i + 0.5) / n * 2 * math.pi; segc(b, at(0.34, -0.1, a), at(0.05, -0.25, a), 0.055, 0.05, 'wood_d', n=6, jit=0.0)


def walls(b, w, d, h, z0, bays, door, wall='mud', plinth=0.3, back_win=True):
    """기단 · 흙벽 · 기둥 · 도리/중방/하방 · 띠살문 · 봉창."""
    b.box((w + 0.9, d + 0.9, plinth), (0, 0, plinth / 2), 'stone', bevel=0.07, bseg=2, jit=0.0)
    for i in range(int((w + 0.9) / 0.55)):   # 기단 앞줄 막돌
        x = -(w + 0.9) / 2 + 0.3 + i * 0.55 + (R.random() - 0.5) * 0.1
        b.ball(0.2 + R.random() * 0.06, (x, -(d + 0.9) / 2 - 0.02, 0.15), 'stone_d' if i % 3 else 'stone', sub=1, scale=(1.3, 0.7, 0.75), jit=0.0)
    b.box((w, d, h), (0, 0, z0 + h / 2), wall, jit=0.0)
    for zz, th in ((z0 + h - 0.09, 0.2), (z0 + 0.08, 0.16)):
        b.box((w + 0.1, 0.2, th), (0, -d / 2, zz), 'wood_dx', bevel=0.02, jit=0.0); b.box((w + 0.1, 0.2, th), (0, d / 2, zz), 'wood_dx', bevel=0.02, jit=0.0)
        b.box((0.2, d + 0.1, th), (-w / 2, 0, zz), 'wood_dy', bevel=0.02, jit=0.0); b.box((0.2, d + 0.1, th), (w / 2, 0, zz), 'wood_dy', bevel=0.02, jit=0.0)
    bw = w / bays
    for i in range(bays + 1):
        x = -w / 2 + bw * i
        for y in (-d / 2, d / 2):
            b.box((0.21, 0.21, h), (x, y, z0 + h / 2), 'wood_d', bevel=0.03, jit=0.0)
            b.box((0.3, 0.3, 0.1), (x, y, z0 - 0.02), 'stone_d', bevel=0.03, jit=0.0)     # 주춧돌
    for i in range(bays):
        x = -w / 2 + bw * (i + 0.5)
        if i == door:   # 띠살문 두 짝
            for s in (-1, 1):
                b.box((bw * 0.3, 0.05, h * 0.74), (x + s * bw * 0.155, -d / 2 - 0.05, z0 + 0.14 + h * 0.37), 'lattice', jit=0.0)
                b.box((bw * 0.3 + 0.04, 0.07, 0.05), (x + s * bw * 0.155, -d / 2 - 0.05, z0 + 0.14 + h * 0.74), 'wood_dx', jit=0.0)
                b.box((bw * 0.3 + 0.04, 0.07, 0.05), (x + s * bw * 0.155, -d / 2 - 0.05, z0 + 0.15), 'wood_dx', jit=0.0)
            for s in (-1, 0, 1):
                b.box((0.05, 0.08, h * 0.76), (x + s * bw * 0.31, -d / 2 - 0.05, z0 + 0.14 + h * 0.37), 'wood_d', jit=0.0)
            b.box((bw * 0.72, 0.12, 0.09), (x, -d / 2 - 0.04, z0 + 0.18 + h * 0.76), 'wood_dx', bevel=0.02, jit=0.0)
        else:           # 중방 + 봉창(작은 살창)
            b.box((bw - 0.2, 0.16, 0.12), (x, -d / 2, z0 + h * 0.42), 'wood_dx', bevel=0.02, jit=0.0)
            b.box((bw * 0.4, 0.05, h * 0.3), (x, -d / 2 - 0.05, z0 + h * 0.66), 'lattice_w', jit=0.0)
            for zz in (h * 0.5, h * 0.82):
                b.box((bw * 0.46, 0.08, 0.05), (x, -d / 2 - 0.05, z0 + zz), 'wood_dx', jit=0.0)
            for s in (-1, 1):
                b.box((0.05, 0.08, h * 0.34), (x + s * bw * 0.22, -d / 2 - 0.05, z0 + h * 0.66), 'wood_d', jit=0.0)
        b.box((bw - 0.2, 0.16, 0.1), (x, d / 2, z0 + h * 0.45), 'wood_dx', bevel=0.02, jit=0.0)
    for s in (-1, 1):   # 옆벽 중방
        b.box((0.16, d - 0.2, 0.1), (s * w / 2, 0, z0 + h * 0.45), 'wood_dy', bevel=0.02, jit=0.0)


def porch(b, x, y, w, dp, z=0.52):
    """툇마루: 널을 깐 마루 + 동바리 + 댓돌."""
    n = max(3, int(w / 0.34))
    for i in range(n):
        b.box((w / n - 0.02, dp, 0.07), (x - w / 2 + (i + 0.5) * w / n, y, z), 'plank' if i % 2 else 'wood_y', bevel=0.012, jit=0.0)
    b.box((w + 0.06, 0.09, 0.12), (x, y - dp / 2, z - 0.06), 'wood_dx', bevel=0.02, jit=0.0)
    for s in (-1, 0, 1):
        b.box((0.11, 0.11, z - 0.05), (x + s * (w / 2 - 0.1), y - dp / 2 + 0.06, (z - 0.05) / 2), 'wood_d', jit=0.0)
    b.ball(0.3, (x - w * 0.18, y - dp / 2 - 0.34, 0.1), 'stone', sub=2, scale=(1.5, 0.75, 0.42), jit=0.0)   # 댓돌


def chimney(b, x, y, h=1.45):
    b.box((0.46, 0.46, h), (x, y, h / 2), 'mud', bevel=0.09, bseg=2, jit=0.0)
    b.lathe([(0.15, 0), (0.2, 0.12), (0.19, 0.3), (0.13, 0.4), (0.15, 0.44)], (x, y, h - 0.02), 'jar', seg=10)


def gotgam(b, x0, x1, y, z, n=7, m='persim'):
    """처마 밑에 꿰어 매단 곶감(또는 메주)."""
    b.box((x1 - x0, 0.025, 0.025), ((x0 + x1) / 2, y, z), 'rope', jit=0.0)
    for i in range(n):
        x = x0 + (i + 0.5) * (x1 - x0) / n
        for k in range(3 if m == 'persim' else 1):
            if m == 'persim':
                b.ball(0.07, (x, y, z - 0.1 - k * 0.14), m, sub=1, scale=(1, 1, 0.85), jit=0.0)
            else:
                b.box((0.2, 0.14, 0.16), (x, y, z - 0.16), m, bevel=0.04, bseg=2, jit=0.0)


def thatch_house(name, w, d, bays, door, wall='mud', deco='persim'):
    b = B()
    walls(b, w, d, 2.0, 0.3, bays, door, wall=wall)
    porch(b, w * 0.08, -d / 2 - 0.5, w * 0.62, 0.86)
    chimney(b, w / 2 + 0.36, d / 4)
    thatch_roof(b, w, d, 2.3, 1.42)
    bw = w / bays; k = 0 if door != 0 else bays - 1
    gotgam(b, -w / 2 + bw * k + 0.25, -w / 2 + bw * (k + 1) - 0.25, -d / 2 - 0.3, 2.12, n=5, m=deco)
    return b.done(name, smooth=50, shade=(1, 1), under=0)


m_cloth('cloth', 0xf0e8d4); m_cloth('cloth_r', 0xb8302a); m_plain('straw', 0xd8bc6c, var=0.2, scale=24); m_plain('twig', 0x7a5c36, var=0.3, scale=20); m_plain('twig_d', 0x5a4226, var=0.3, scale=20)
m_plain('water', 0x2a4a5a, rough=0.2); m_plain('soot', 0x1a1816, rough=0.6); m_plain('leaf', 0x4e8a3a, var=0.25, scale=12)

OBJ = []
OBJ.append(thatch_house('thatch_a', 6.4, 3.6, 3, 1))
OBJ.append(thatch_house('thatch_b', 4.4, 3.2, 2, 0, wall='plaster_y', deco='meju'))

# ── 헛간(기둥과 지붕 · 뒤에 널벽 · 볏짚 더미와 멍석) ──
b = B()
for x in (-1.9, 1.9):
    for y in (-1.3, 1.3):
        b.box((0.2, 0.2, 2.2), (x, y, 1.1), 'wood_d', bevel=0.03, jit=0); b.box((0.32, 0.32, 0.1), (x, y, 0.05), 'stone_d', bevel=0.03, jit=0)
for i in range(9):
    b.box((0.4, 0.06, 1.5 + (i % 3) * 0.06), (-1.68 + i * 0.42, 1.3, 0.8), 'wood' if i % 2 else 'wood_d', jit=0)
b.box((3.9, 0.1, 0.1), (0, 1.26, 1.3), 'wood_dx', jit=0); b.box((3.9, 0.12, 0.14), (0, -1.3, 2.1), 'wood_dx', jit=0); b.box((3.9, 0.12, 0.14), (0, 1.3, 2.1), 'wood_dx', jit=0)
for (x, y, s) in [(-1.0, 0.5, 1.0), (-0.2, 0.7, 0.85), (-0.7, -0.1, 0.7)]:
    b.cone(0.5 * s, 0.42 * s, 0.9 * s, (x, y, 0.45 * s), 'straw', seg=10, jit=0); b.cone(0.44 * s, 0.05, 0.3 * s, (x, y, 1.05 * s), 'thatch_cut', seg=10, jit=0); b.cone(0.52 * s, 0.52 * s, 0.05, (x, y, 0.6 * s), 'rope', seg=10, cap=False, jit=0)
b.cone(0.22, 0.22, 1.3, (1.1, 0.7, 0.24), 'straw', seg=10, rot=(0, math.pi / 2, 0.5), jit=0)    # 말아 둔 멍석
thatch_roof(b, 4.0, 2.8, 2.2, 1.12, over=0.5, seg=24)
OBJ.append(b.done('shed', smooth=50, shade=(1, 1), under=0))

# ── 외양간(뒤와 왼쪽은 흙벽 · 앞은 가로대 · 구유와 여물) ──
b = B()
for (x, y) in [(-1.7, -1.2), (1.7, -1.2), (-1.7, 1.2), (1.7, 1.2)]:
    b.box((0.19, 0.19, 2.0), (x, y, 1.0), 'wood_d', bevel=0.03, jit=0); b.box((0.3, 0.3, 0.1), (x, y, 0.05), 'stone_d', bevel=0.03, jit=0)
b.box((3.4, 0.14, 1.6), (0, 1.2, 0.85), 'mud', jit=0); b.box((0.14, 2.3, 1.6), (-1.7, 0, 0.85), 'mud', jit=0)
for z in (0.45, 0.9):
    seg(b, (-1.7, -1.2, z), (1.7, -1.2, z), 0.05, 0.045, 'wood', n=6, jit=0)
b.box((3.5, 0.14, 0.14), (0, -1.2, 1.88), 'wood_dx', jit=0); b.box((3.5, 0.14, 0.14), (0, 1.2, 1.88), 'wood_dx', jit=0)
b.box((1.5, 0.52, 0.32), (0.6, -0.6, 0.3), 'wood_x', bevel=0.05, jit=0); b.box((1.3, 0.36, 0.1), (0.6, -0.6, 0.44), 'straw', jit=0)
for s in (-1, 1):
    b.box((0.12, 0.44, 0.3), (0.6 + s * 0.6, -0.6, 0.14), 'wood_d', jit=0)
b.box((3.0, 2.0, 0.06), (0, 0.1, 0.03), 'straw', jit=0)   # 깔짚
thatch_roof(b, 3.5, 2.5, 1.95, 1.02, over=0.45, seg=22)
OBJ.append(b.done('oeyanggan', smooth=50, shade=(1, 1), under=0))

# ── 주막(회벽 초가 · 술 깃발 · 가마솥 걸린 아궁이 · 술독) ──
b = B()
walls(b, 6.0, 3.6, 2.0, 0.3, 3, 0, wall='plaster')
porch(b, 1.0, -3.6 / 2 - 0.5, 3.6, 0.86)
thatch_roof(b, 6.0, 3.6, 2.3, 1.55, over=0.65, seg=30)
b.box((2.4, 1.6, 0.55), (3.9, -1.4, 0.275), 'mud', bevel=0.12, bseg=2, jit=0); b.box((0.5, 0.1, 0.3), (3.9, -2.2, 0.2), 'soot', jit=0)
b.lathe([(0.3, 0), (0.62, 0.2), (0.68, 0.42), (0.6, 0.5), (0.56, 0.5)], (3.9, -1.4, 0.5), 'iron', seg=14); b.lathe([(0.6, 0), (0.3, 0.14), (0.08, 0.18)], (3.9, -1.4, 1.0), 'wood_d', seg=14)
for (x, y, s) in [(-3.6, -2.3, 1.0), (-2.9, -2.4, 0.8)]:
    b.lathe([(0.2 * s, 0), (0.42 * s, 0.3 * s), (0.44 * s, 0.6 * s), (0.3 * s, 0.86 * s), (0.24 * s, 0.9 * s)], (x, y, 0), 'jar', seg=12); b.cone(0.28 * s, 0.06, 0.1 * s, (x, y, 0.95 * s), 'jar', seg=12, jit=0)
seg(b, (-3.9, -2.6, 0), (-3.9, -2.6, 4.4), 0.06, 0.045, 'wood_d', n=6, jit=0)
b.grid(4, 3, lambda u, v: (-3.9 + 0.02 * math.sin(v * 5), -2.56 + u * 0.95 + 0.04 * math.sin(u * 6), 4.25 - v * 1.3), 'cloth', jit=0)
b.box((0.03, 0.5, 0.5), (-3.92, -2.1, 3.6), 'cloth_r', jit=0)
gotgam(b, -2.7, -1.3, -3.6 / 2 - 0.3, 2.12, n=4, m='meju')
OBJ.append(b.done('jumak', smooth=50, shade=(1, 1), under=0))

# ── 물레방아 집 · 바퀴(따로 — 돌린다) ──
b = B()
b.box((3.2, 2.8, 2.0), (0, 1.6, 1.0), 'mud', jit=0)
for x in (-1.6, 1.6):
    for y in (0.2, 3.0):
        b.box((0.2, 0.2, 2.05), (x, y, 1.02), 'wood_d', bevel=0.03, jit=0)
for i in range(7):
    b.box((0.42, 0.06, 1.3), (-1.3 + i * 0.43, 0.17, 0.95), 'wood' if i % 2 else 'wood_d', jit=0)
thatch_roof(b, 3.2, 2.8, 2.0, 1.15, over=0.5, y0=1.6, seg=22)
seg(b, (0, 0.3, 1.5), (0, -1.3, 1.5), 0.14, 0.14, 'wood_d', n=8, jit=0)
for y in (-1.25, -0.25):
    b.box((0.22, 0.22, 1.5), (0, y, 0.75), 'wood_d', bevel=0.03, jit=0)
b.box((0.5, 3.6, 0.08), (0.9, -2.6, 2.72), 'wood_y', rot=(0.12, 0, 0), jit=0)
for s in (-1, 1):
    b.box((0.08, 3.6, 0.22), (0.9 + s * 0.25, -2.6, 2.8), 'wood_dy', rot=(0.12, 0, 0), jit=0)
for y in (-3.9, -2.4):
    b.box((0.12, 0.12, 2.9), (0.9, y, 1.4), 'wood_d', jit=0)
OBJ.append(b.done('mulle_house', smooth=50, shade=(1, 1), under=0))
b = B()
for k in range(12):
    a = k * math.pi / 6
    if k < 6:
        b.box((0.09, 0.44, 2.5), (0, 0, 0), 'wood', rot=(0, a, 0), jit=0)
    b.box((0.62, 0.66, 0.06), (math.sin(a) * 1.22, 0, math.cos(a) * 1.22), 'plank', rot=(0, a, 0), jit=0)
    b.box((0.05, 0.6, 0.3), (math.sin(a) * 1.18, 0, math.cos(a) * 1.18), 'wood_d', rot=(0, a, 0), jit=0)
for s in (-0.3, 0.3):
    b.lathe([(1.14, 0), (1.32, 0), (1.32, 0.07), (1.14, 0.07)], (0, s, 0), 'wood_d', seg=24, rot=(1.5708, 0, 0), cap=False)
b.cone(0.2, 0.2, 0.8, (0, 0, 0), 'wood_d', seg=10, rot=(1.5708, 0, 0), jit=0)
OBJ.append(b.done('mulle_wheel', smooth=30, shade=(1, 1), under=0))

# ── 우물(막돌로 쌓은 둘레 · 도르래 지붕 · 두레박) ──
b = B()
for row in range(3):
    n = 11
    for i in range(n):
        a = (i + row * 0.5) / n * 2 * math.pi
        b.ball(0.24, (math.cos(a) * 0.8, math.sin(a) * 0.8, 0.14 + row * 0.26), ['stone', 'stone_d'][(i + row) % 2], sub=1, scale=(1.0, 1.0, 0.62), rot=(0, 0, a), jit=0)
b.cone(0.72, 0.72, 0.02, (0, 0, 0.42), 'water', seg=14, jit=0)
for s in (-1, 1):
    b.box((0.13, 0.13, 2.05), (s * 0.95, 0, 1.02), 'wood_d', bevel=0.02, jit=0)
b.box((2.2, 0.13, 0.13), (0, 0, 1.98), 'wood_dx', jit=0)
thatch_roof(b, 2.2, 1.3, 2.0, 0.55, over=0.25, seg=16, ropes=False, rafters=False)
seg(b, (0, 0, 1.92), (0, 0, 0.95), 0.015, 0.015, 'rope', n=4, jit=0); b.cone(0.17, 0.13, 0.28, (0, 0, 0.85), 'wood', seg=9, jit=0)
OBJ.append(b.done('well', smooth=50, shade=(1, 1), under=0))


# ── 돌담 한 칸(4m) 둘 · 싸리울 한 칸 · 사립문 ──
def stone_wall(name, sd):
    r = random.Random(sd); b = B()
    b.box((4.0, 0.34, 0.95), (0, 0, 0.5), 'mud', jit=0)
    for side in (-1, 1):
        z = 0.16
        for row in range(3):
            x = -2.0 + (0.24 if row % 2 else 0.0)
            while x < 1.95:
                w = 0.7 + r.random() * 0.4; w = min(w, 2.0 - x)
                b.ball(0.5, (x + w / 2, side * 0.17, z), ['stone', 'stone_d', 'stone'][int(r.random() * 3)], sub=1, scale=(w * 1.05, 0.26, 0.34 + r.random() * 0.05), rot=(r.random() * 0.3, 0, 0), jit=0)
                x += w
            z += 0.32
    b.grid(3, 4, lambda u, v: ((u - 0.5) * 4.0, (v - 0.5) * 0.66, 1.06 + 0.13 * math.sin(v * math.pi) - 0.03 * (abs(2 * v - 1) ** 3)), 'thatch', jit=0)   # 담 위 이엉
    for s in (-1, 1):
        b.box((4.0, 0.03, 0.06), (0, s * 0.33, 1.05), 'thatch_cut', jit=0)
    return b.done(name, smooth=50, shade=(1, 1), under=0)


OBJ.append(stone_wall('dam_stone', 1)); OBJ.append(stone_wall('dam_stone2', 5))
b = B()
for i in range(27):
    x = -2 + i * 0.154; hh = 1.15 + R.random() * 0.3
    seg(b, (x, (R.random() - 0.5) * 0.05, 0), (x + (R.random() - 0.5) * 0.12, (R.random() - 0.5) * 0.05, hh), 0.03, 0.018, 'twig' if i % 3 else 'twig_d', n=4, jit=0)
for z in (0.35, 0.9):
    for s in (-1, 1):
        seg(b, (-2.0, s * 0.045, z), (2.0, s * 0.045, z + 0.02), 0.028, 0.028, 'twig_d', n=4, jit=0)
for x in (-2, 0, 2):
    seg(b, (x, 0, 0), (x, 0, 1.45), 0.07, 0.055, 'wood_d', n=6, jit=0)
OBJ.append(b.done('ul_ssari', smooth=30, shade=(1, 1), under=0))
b = B()
for x in (-1.0, 1.0):
    seg(b, (x, 0, 0), (x, 0, 1.75), 0.09, 0.07, 'wood_d', n=7, jit=0)
for i in range(12):
    x = -0.85 + i * 0.15
    seg(b, (x, 0.5 + x * 0.35, 0.05), (x, 0.5 + x * 0.35, 1.2 + (i % 3) * 0.08), 0.026, 0.018, 'twig' if i % 2 else 'twig_d', n=4, jit=0)
for z in (0.4, 0.95):
    seg(b, (-0.9, 0.5 - 0.9 * 0.35, z), (0.9, 0.5 + 0.9 * 0.35, z), 0.03, 0.03, 'twig_d', n=4, jit=0)
OBJ.append(b.done('sarip', smooth=30, shade=(1, 1), under=0))

# ── 장독대(돌 단 위에 크고 작은 독 · 뚜껑) · 평상 ──
b = B()
b.box((2.6, 1.8, 0.24), (0, 0, 0.12), 'stone', bevel=0.06, bseg=2, jit=0)
for i in range(9):
    b.ball(0.2, (-1.2 + i * 0.3, -0.92, 0.12), 'stone_d' if i % 2 else 'stone', sub=1, scale=(1.2, 0.6, 0.7), jit=0)
for (x, y, s) in [(-0.8, 0.4, 1.0), (0.0, 0.45, 1.15), (0.8, 0.4, 0.9), (-0.55, -0.35, 0.7), (0.2, -0.4, 0.62), (0.8, -0.35, 0.5)]:
    b.lathe([(0.15 * s, 0), (0.27 * s, 0.1 * s), (0.36 * s, 0.32 * s), (0.37 * s, 0.5 * s), (0.31 * s, 0.68 * s), (0.22 * s, 0.76 * s), (0.24 * s, 0.8 * s)], (x, y, 0.24), 'jar', seg=12)
    b.lathe([(0.27 * s, 0), (0.2 * s, 0.06 * s), (0.06 * s, 0.1 * s), (0.06 * s, 0.14 * s), (0.0, 0.14 * s)], (x, y, 0.24 + 0.8 * s), 'jar', seg=12, cap=False)
OBJ.append(b.done('jangdokdae', smooth=50, shade=(1, 1), under=0))
b = B()
for i in range(8):
    b.box((0.31, 1.8, 0.06), (-1.14 + i * 0.326, 0, 0.5), 'plank' if i % 2 else 'wood_y', bevel=0.012, jit=0)
b.box((2.66, 0.09, 0.12), (0, -0.86, 0.44), 'wood_dx', jit=0); b.box((2.66, 0.09, 0.12), (0, 0.86, 0.44), 'wood_dx', jit=0)
for (x, y) in [(-1.2, -0.78), (1.2, -0.78), (-1.2, 0.78), (1.2, 0.78)]:
    b.box((0.13, 0.13, 0.46), (x, y, 0.23), 'wood_d', bevel=0.02, jit=0)
OBJ.append(b.done('pyeongsang', smooth=30, shade=(1, 1), under=0))

for o in OBJ:
    print('FACES', o.name, len(o.data.polygons))
bake_set(OBJ, 'fhouse', size=1024 if PREVIEW else 2048, normal=False)
if PREVIEW:
    preview(os.path.join(OUT, '_tex', 'fhouse_preview.png'), OBJ, cols=5, samples=16, dist=0.8)


# ═════════ 둘째 묶음 ftown.glb: 기와집(양반댁) · 관아 동헌·삼문·담 · 솟을대문 · 장터 좌판·가게·차일 · 방 붙이는 판 ═════════
m_tile('tile'); m_plain('tile_l', 0x6a707c, var=0.15, scale=10, rough=0.7); m_plain('lime', 0xe8e4d8, var=0.06, scale=8)
m_wood('wood_r', cols=(0x5a2418, 0x8a3a26, 0xa85038), axis='Z'); m_wood('wood_rx', cols=(0x5a2418, 0x8a3a26, 0xa85038), axis='X')
m_plain('green', 0x2f6a58, var=0.12, scale=14); m_plain('red', 0xb02e26, var=0.1, scale=14); m_plain('paper', 0xf2ead2, var=0.06, scale=10); m_plain('ink', 0x1c1a18, var=0.1)
m_cloth('cloth_b', 0x3a5a9a); m_cloth('cloth_w', 0xf0e8d4); m_plain('white', 0xf4f0e6, var=0.05)


def tile_roof(b, w, d, z0, h, over=0.8, lift=0.45, nx=18, raft='wood_d', gable='plaster'):
    """맞배 기와지붕: 처마 끝이 살짝 들리고(처마 곡선), 용마루·내림마루에 회를 바르고, 처마 밑에 서까래가 줄지어 보인다. 기왓골은 무늬로 굽는다."""
    W, D = w + 2 * over, d + 2 * over

    def surf(u, v, dz=0.0):
        e = abs(2 * v - 1)
        return ((u - 0.5) * W, (v - 0.5) * D, z0 + h * (1 - e ** 1.25) + lift * (abs(2 * u - 1) ** 3) * e + 0.12 * e * e + dz)
    b.grid(nx, 12, surf, 'tile', jit=0)
    b.grid(nx, 12, lambda u, v: surf(1 - u, v, -0.16), 'dark', jit=0)
    for vv in (0.0, 1.0):   # 처마 끝 마구리(막새 줄)
        b.grid(nx, 1, lambda u, v, vv=vv: surf(u if vv else 1 - u, vv, -0.16 * (1 - v)), 'tile_l', jit=0)
    for uu in (0.0, 1.0):   # 박공 쪽 마구리
        b.grid(1, 12, lambda u, v, uu=uu: surf(uu, v if uu else 1 - v, -0.16 * (1 - u)), 'tile_l', jit=0)
    # 용마루(양 끝이 들림) + 망와
    b.grid(10, 1, lambda u, v: ((u - 0.5) * (W + 0.1), (v - 0.5) * 0.34, z0 + h + 0.3 + lift * 0.5 * abs(2 * u - 1) ** 3), 'lime', jit=0)
    for s in (-1, 1):
        b.grid(10, 1, lambda u, v, s=s: ((u - 0.5) * (W + 0.1) * s * -1, s * 0.17, z0 + h + 0.02 + 0.28 * v + lift * 0.5 * abs(2 * u - 1) ** 3), 'tile_l', jit=0)
        b.box((0.3, 0.4, 0.5), (s * (W / 2 + 0.02), 0, z0 + h + 0.34 + lift * 0.5), 'tile_l', bevel=0.07, rot=(0, -s * 0.35, 0), jit=0)
        # 내림마루: 박공 가장자리를 따라 내려오는 등
        for q in (0.0, 1.0):
            pts = [Vector(surf(0.5 + s * 0.49, 0.5 + (q - 0.5) * t, 0.1)) for t in (0.08, 0.5, 0.96)]
            for a2, b2 in zip(pts, pts[1:]):
                segc(b, a2, b2, 0.11, 0.1, 'lime', n=6, jit=0)
        b.prism([(-d / 2 - over * 0.5, 0), (d / 2 + over * 0.5, 0), (0, h * 0.86)], 0.12, (s * (w / 2 + 0.02), 0, z0 - 0.02), gable, rot=(0, 0, math.pi / 2), jit=0)
    n = max(6, int(W / 0.55))   # 서까래
    for i in range(n):
        u = (i + 0.5) / n
        for vv, v2 in ((0.03, 0.3), (0.97, 0.7)):
            segc(b, surf(u, v2, -0.22), surf(u, vv, -0.2), 0.065, 0.06, raft, n=6, jit=0)


def hanok(name, w, d, bays, hgt=2.3, roofh=1.5, big=False):
    b = B(); pl = 0.55 if not big else 0.9; pil = 'wood_r' if big else 'wood_d'
    b.box((w + 1.5, d + 1.5, pl), (0, 0, pl / 2), 'stone', bevel=0.07, bseg=2, jit=0)
    for k in range(2 if big else 1):   # 섬돌
        b.box((2.2 - k * 0.3 if big else 1.6, 0.5, pl * (0.66 - k * 0.33) if big else pl * 0.5), (0, -d / 2 - 1.0 - (0.5 if big else 0) + k * 0.5, (pl * (0.66 - k * 0.33) if big else pl * 0.5) / 2), 'stone_d', bevel=0.05, jit=0)
    b.box((w - 0.3, d - 0.3, hgt), (0, 0, pl + hgt / 2), 'plaster', jit=0)
    bw = w / bays
    for i in range(bays + 1):
        x = -w / 2 + bw * i
        for y in (-d / 2, d / 2):
            b.cone(0.16 if not big else 0.22, 0.14 if not big else 0.2, hgt, (x, y, pl + hgt / 2), pil, seg=10, jit=0)
            b.cone(0.26 if not big else 0.34, 0.2 if not big else 0.26, 0.12, (x, y, pl + 0.02), 'stone_d', seg=10, jit=0)
    for y in (-d / 2, d / 2):   # 창방·도리(관아는 단청)
        b.box((w + 0.4, 0.24, 0.24), (0, y, pl + hgt + 0.02), 'green' if big else 'wood_dx', bevel=0.03, jit=0)
        if big:
            b.box((w + 0.5, 0.2, 0.14), (0, y, pl + hgt + 0.22), 'red', jit=0)
    for x in (-w / 2, w / 2):
        b.box((0.24, d + 0.4, 0.24), (x, 0, pl + hgt + 0.02), 'green' if big else 'wood_dy', bevel=0.03, jit=0)
    for i in range(bays):
        x = -w / 2 + bw * (i + 0.5)
        b.box((bw * 0.72, 0.06, hgt * 0.66), (x, -d / 2 + 0.08, pl + hgt * 0.56), 'lattice', jit=0)     # 세살문
        b.box((bw * 0.76, 0.09, 0.07), (x, -d / 2 + 0.08, pl + hgt * 0.9), 'wood_rx' if big else 'wood_dx', jit=0)
        b.box((bw * 0.76, 0.1, hgt * 0.2), (x, -d / 2 + 0.08, pl + hgt * 0.12), 'wood_rx' if big else 'wood_x', jit=0)                    # 머름
        b.box((0.05, 0.09, hgt * 0.66), (x, -d / 2 + 0.07, pl + hgt * 0.56), 'wood_r' if big else 'wood_d', jit=0)
        b.box((bw * 0.5, 0.05, hgt * 0.34), (x, d / 2 - 0.1, pl + hgt * 0.62), 'lattice_w', jit=0)
    for s in (-1, 1):
        b.box((0.05, d * 0.34, hgt * 0.4), (s * (w / 2 - 0.13), 0, pl + hgt * 0.58), 'lattice_w', jit=0)
    tile_roof(b, w, d, pl + hgt + (0.14 if not big else 0.32), roofh, over=0.85 if not big else 1.15, lift=0.45 if not big else 0.7, nx=18 if not big else 24, raft='wood_d' if not big else 'green')
    return b.done(name, smooth=50, shade=(1, 1), under=0)


T = []
T.append(hanok('tile_a', 7.4, 4.0, 3)); T.append(hanok('tile_b', 5.0, 3.6, 2)); T.append(hanok('hall', 12.0, 6.4, 5, hgt=3.0, roofh=2.3, big=True))

# ── 솟을대문(양반댁) ──
b = B()
b.box((3.8, 1.3, 0.22), (0, 0, 0.11), 'stone', bevel=0.05, jit=0)
for x in (-1.25, 1.25):
    b.box((0.28, 0.28, 2.9), (x, 0, 1.65), 'wood_d', bevel=0.03, jit=0); b.box((0.95, 0.5, 2.2), (x * 1.74, 0, 1.3), 'plaster', jit=0); b.box((1.0, 0.56, 0.5), (x * 1.74, 0, 0.45), 'stone_d', bevel=0.04, jit=0)
for s in (-1, 1):
    b.box((1.1, 0.1, 2.3), (s * 0.57, 0, 1.4), 'wood', jit=0)
    for zz in (0.7, 1.4, 2.1):
        b.box((1.06, 0.13, 0.08), (s * 0.57, 0, zz), 'iron', jit=0)
    b.cone(0.07, 0.07, 0.05, (s * 0.16, -0.08, 1.4), 'iron', seg=8, rot=(math.pi / 2, 0, 0), jit=0)
b.box((2.9, 0.32, 0.22), (0, 0, 2.7), 'wood_dx', bevel=0.03, jit=0)
tile_roof(b, 3.4, 1.4, 3.0, 0.8, over=0.5, lift=0.3, nx=10)
T.append(b.done('gate_house', smooth=50, shade=(1, 1), under=0))

# ── 관아 삼문(붉은 기둥 넷 · 문 셋 · 가운데 태극) ──
b = B()
for x in (-3.0, -1.0, 1.0, 3.0):
    b.cone(0.2, 0.18, 3.2, (x, 0, 1.6), 'red', seg=10, jit=0); b.box((0.52, 0.52, 0.26), (x, 0, 0.13), 'stone', bevel=0.05, jit=0)
for x in (-2.0, 0.0, 2.0):
    b.box((1.72, 0.1, 2.4), (x, 0, 1.3), 'wood_rx', jit=0); b.box((0.06, 0.13, 2.4), (x, 0, 1.3), 'wood_d', jit=0)
    for zz in (0.5, 2.1):
        b.box((1.7, 0.13, 0.08), (x, 0, zz), 'iron', jit=0)
b.cone(0.3, 0.3, 0.03, (0, -0.07, 1.5), 'red', seg=14, rot=(math.pi / 2, 0, 0), jit=0)   # 태극(가운데 문)
b.cone(0.3, 0.3, 0.034, (0, -0.07, 1.5), 'cloth_b', seg=14, rot=(math.pi / 2, 0, 0), jit=0, f=lambda v: Vector((v.x, v.y, v.z)) if v.y < 0.0 else Vector((v.x * 0.0, v.y * 0.0, v.z)))
b.box((6.9, 0.42, 0.32), (0, 0, 3.2), 'red', bevel=0.03, jit=0); b.box((6.9, 0.3, 0.14), (0, 0, 3.44), 'green', jit=0)
tile_roof(b, 6.6, 1.6, 3.5, 1.05, over=0.7, lift=0.35, nx=16, raft='green')
T.append(b.done('sammun', smooth=50, shade=(1, 1), under=0))

# ── 관아 담 한 칸(4m): 돌 받침 · 회 바른 흙돌담(박아 넣은 돌) · 기와 지붕 ──
b = B()
b.box((4.0, 0.62, 0.42), (0, 0, 0.21), 'stone_d', bevel=0.05, jit=0)
b.box((4.0, 0.5, 1.5), (0, 0, 1.15), 'plaster', jit=0)
for i in range(8):
    for s in (-1, 1):
        b.ball(0.5, (-1.75 + i * 0.5, s * 0.25, 0.78 + (i % 2) * 0.5), 'stone', sub=1, scale=(0.36, 0.06, 0.2), jit=0)
b.grid(1, 6, lambda u, v: ((u - 0.5) * 4.0, (v - 0.5) * 1.1, 1.92 + 0.36 * (1 - abs(2 * v - 1) ** 1.3)), 'tile', jit=0)
b.box((4.0, 0.2, 0.14), (0, 0, 2.33), 'lime', bevel=0.04, jit=0)
for s in (-1, 1):
    b.box((4.0, 0.04, 0.1), (0, s * 0.55, 1.9), 'tile_l', jit=0)
T.append(b.done('gwana_dam', smooth=50, shade=(1, 1), under=0))


# ── 장터: 좌판(천 지붕) · 차일 가게 둘 · 가게(기와 얹은 시전 — 앞이 트이고 들창을 받쳐 올림) · 방 붙이는 판 ──
def canopy(b, w, d, z0, z1, cloth, sag=0.14):
    f = lambda u, v, dz=0.0: ((u - 0.5) * w, (v - 0.5) * d, z0 + v * (z1 - z0) - sag * math.sin(u * math.pi) - sag * 0.6 * math.sin(v * math.pi) + dz)
    b.grid(6, 4, f, cloth, jit=0); b.grid(6, 4, lambda u, v: f(1 - u, v, -0.03), cloth, jit=0)


b = B()
for x in (-1.5, 1.5):
    for y, hh in ((-0.9, 2.0), (0.9, 2.5)):
        segc(b, (x, y, 0), (x, y, hh), 0.07, 0.06, 'wood_d', n=6, jit=0)
canopy(b, 3.6, 2.4, 2.0, 2.55, 'cloth_w')
for i in range(4):
    b.box((3.0, 0.27, 0.07), (0, -0.6 + i * 0.275, 0.75), 'plank' if i % 2 else 'wood_x', bevel=0.012, jit=0)
for x in (-1.3, 1.3):
    for y in (-0.6, 0.2):
        b.box((0.1, 0.1, 0.72), (x, y, 0.36), 'wood_d', jit=0)
T.append(b.done('stall', smooth=40, shade=(1, 1), under=0))
for nm, cl in (('chail_w', 'cloth_w'), ('chail_b', 'cloth_b')):
    b = B()
    for (x, y) in [(-1.8, -1.3), (1.8, -1.3), (-1.8, 1.3), (1.8, 1.3)]:
        segc(b, (x, y, 0), (x, y, 2.5 if y > 0 else 2.1), 0.07, 0.06, 'wood_d', n=6, jit=0)
    canopy(b, 4.0, 3.0, 2.1, 2.52, cl, sag=0.16)
    for i in range(4):
        b.box((3.2, 0.32, 0.07), (0, -0.28 + i * 0.325, 0.7), 'plank' if i % 2 else 'wood_x', bevel=0.012, jit=0)
    for (x, y) in [(-1.4, -0.3), (1.4, -0.3), (-1.4, 0.7), (1.4, 0.7)]:
        b.box((0.1, 0.1, 0.68), (x, y, 0.34), 'wood_d', jit=0)
    T.append(b.done(nm, smooth=40, shade=(1, 1), under=0))
b = B()
b.box((6.4, 4.6, 0.3), (0, 0, 0.15), 'stone', bevel=0.06, jit=0)
b.box((5.9, 0.16, 2.5), (0, 2.0, 1.55), 'plaster', jit=0)
for s in (-1, 1):
    b.box((0.16, 4.1, 2.5), (s * 2.95, 0, 1.55), 'plaster', jit=0)
for x in (-3.0, -1.0, 1.0, 3.0):
    for y in (-2.05, 2.05):
        b.box((0.22, 0.22, 2.55), (x, y, 1.57), 'wood_d', bevel=0.03, jit=0)
b.box((6.2, 0.22, 0.2), (0, -2.05, 2.86), 'wood_dx', bevel=0.03, jit=0); b.box((6.2, 0.22, 0.2), (0, 2.05, 2.86), 'wood_dx', bevel=0.03, jit=0)
for i, x in enumerate((-2.0, 0.0, 2.0)):
    b.box((1.7, 0.9, 0.08), (x, -1.75, 1.05), 'plank', jit=0); b.box((1.7, 0.08, 0.75), (x, -2.1, 0.66), 'wood_x', jit=0)                 # 좌판과 앞널
    b.box((1.7, 0.06, 1.0), (x, -2.5, 2.5), 'wood_x', rot=(1.0, 0, 0), jit=0); segc(b, (x + 0.7, -2.15, 1.1), (x + 0.7, -2.8, 2.3), 0.03, 0.03, 'wood_d', n=5, jit=0)   # 받쳐 올린 들창
    for k in range(3):
        b.lathe([(0.1, 0), (0.17, 0.1), (0.17, 0.22), (0.11, 0.3)], (x - 0.5 + k * 0.5, -1.7, 1.09), ['jar', 'straw', 'cloth_b'][(i + k) % 3], seg=8)
b.box((5.6, 3.6, 0.08), (0, 0.1, 0.34), 'plank', jit=0)
tile_roof(b, 6.0, 4.2, 3.0, 1.3, over=0.7, lift=0.4, nx=16)
T.append(b.done('shop', smooth=50, shade=(1, 1), under=0))
b = B()
for x in (-0.9, 0.9):
    segc(b, (x, 0, 0), (x, 0, 2.4), 0.08, 0.07, 'wood_d', n=6, jit=0)
b.box((2.2, 0.1, 1.3), (0, 0, 1.6), 'wood_x', bevel=0.02, jit=0); b.box((1.0, 0.02, 1.0), (-0.45, -0.065, 1.6), 'paper', jit=0); b.box((0.7, 0.02, 0.8), (0.6, -0.065, 1.55), 'paper', rot=(0, 0.06, 0), jit=0)
for i in range(5):
    b.box((0.03, 0.012, 0.7), (-0.8 + i * 0.16, -0.08, 1.62), 'ink', jit=0)
b.grid(4, 4, lambda u, v: ((u - 0.5) * 2.6, (v - 0.5) * 0.6, 2.28 + 0.3 * (1 - abs(2 * v - 1) ** 1.4)), 'thatch', jit=0)
T.append(b.done('bang_pan', smooth=40, shade=(1, 1), under=0))

for o in T:
    print('FACES', o.name, len(o.data.polygons))
bake_set(T, 'ftown', size=1024 if PREVIEW else 2048, normal=False)
if PREVIEW:
    preview(os.path.join(OUT, '_tex', 'ftown_preview.png'), T, cols=4, samples=16, dist=0.9)

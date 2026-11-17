"""케이월드 「첫 겨울」(신석기) 장면에만 쓰는 모델 — winter.glb.
움집(이엉 지붕 · 눈 덮개 · 문 불빛) · 나무(줄기와 잎 덩이를 따로 — 장면이 철 따라 잎 색을 바꾸고 떨군다) · 조(익은 것 · 벤 그루 · 파헤쳐진 것) ·
건조대 · 볏단 · 거적 · 갈돌과 갈판 · 화덕 · 빗살무늬토기 · 강가(통나무배 · 물고기 말리는 대 · 그물 · 그물추 · 조개더미 · 진흙 캐는 자리) · 개 · 멧돼지 · 새.
tint_c 는 장면이 색을 정한다(잎 · 풀 · 땅 얼룩 · 먼 산 · 볏단). glow_* 는 스스로 빛나는 조각(불꽃 · 불씨 · 문 안 불빛).
나무의 가지 끝 자리(TIPS_A · TIPS_B)는 winter.js 의 같은 이름 표와 맞춘다(three: x = 블렌더 x, y = 블렌더 z, z = -블렌더 y)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_c', 0xffffff),
             ('thatch', 0xd2a650), ('thatch_l', 0xe4be6c), ('thatch_d', 0xb48a3e), ('thatch_o', 0xa98c52), ('rope', 0xc8b080), ('rope_d', 0x9a8256),
             ('wood', 0x7a5632), ('wood_d', 0x57391f), ('wood_l', 0x9c7648), ('wood_cut', 0xd8b888), ('bark', 0x6a4a30), ('bark_l', 0x8a7458),
             ('earth', 0x8a6a40), ('earth_d', 0x6e5230), ('earth_l', 0xa5844f), ('dark', 0x2a1a10), ('ash', 0x8a8478), ('char', 0x2e2622),
             ('stone', 0x9a968e), ('stone_d', 0x7d7a74), ('stone_l', 0xb6b2a8), ('quern', 0xa39c8e), ('quern_l', 0xbdb6a6),
             ('clay', 0xd09662), ('clay_m', 0xb87a48), ('clay_d', 0x8a5530), ('clay_l', 0xdfae7c), ('clay_in', 0x6a4228), ('clay_raw', 0x9a7458), ('clay_wet', 0x80604a),
             ('snow', 0xf4f8fc), ('snow_d', 0xdfe8f2),
             ('mstalk', 0xa8b85a), ('mleaf', 0x8fae4a), ('mleaf_d', 0x7c9a40), ('ear', 0xe8b84a), ('ear_d', 0xd09a34), ('straw', 0xd8c078), ('straw_d', 0xb89a56), ('grain', 0xf2d06a),
             ('mat', 0xb08a52), ('mat_d', 0x8f6e40), ('mat_l', 0xc8a468),
             ('net', 0xb8a070), ('net_d', 0x8e7a50), ('float', 0xe8d8a8), ('shell', 0xf0e8d8), ('shell_d', 0xd0c4ae), ('shell_p', 0xe8c8b8),
             ('fish', 0xc8d4e0), ('fish_d', 0x8a9aae), ('fish_b', 0xeef2f6),
             ('dogc', 0xd2a058), ('dog_d', 0xa87838), ('cream', 0xf2e2c4), ('ink', 0x2b2118),
             ('boarc', 0x5e4838), ('boar_d', 0x3e2e24), ('boar_l', 0x7a6250), ('snout', 0x8a6a5e), ('tusk', 0xf4ecd8),
             ('bird', 0x6a5a48), ('bird_d', 0x3e3630), ('bird_l', 0xc8b8a0), ('beak', 0xe0b040),
             ('pampas', 0xc8b46a), ('pampas_d', 0xa8924e), ('plume', 0xf2ead8), ('plume_d', 0xdccfb4), ('smoke', 0xd8d4cc), ('acorn', 0x8a5a2e),
             ('glow_f1', 0xff5a2a), ('glow_f2', 0xffa23a), ('glow_f3', 0xffe07a), ('glow_ember', 0xff7a2a), ('glow_door', 0xffb85a), ('glow_door2', 0xffe09a)]:
    mat(n, c)

PI = math.pi


def wob(k=0.12, seed=1):
    rr = random.Random(seed)
    table = {}

    def f(v):
        key = (round(v.x, 3), round(v.y, 3), round(v.z, 3))
        if key not in table:
            table[key] = 1 + (rr.random() - 0.5) * 2 * k
        return v * table[key]
    return f


def limb(b, p0, p1, r0, r1, m, seg=6, **k):
    """p0 에서 p1 로 가는 막대(p0 쪽 반지름 r0)."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    L = d.length
    b.cone(r0, r1, L, tuple((p0 + p1) / 2), m, seg=seg, rot=(0, math.acos(max(-1, min(1, d.z / L))), math.atan2(d.y, d.x)), **k)


def face(b, m, pts, out=None, tone=1.0, jit=0.08):
    """면 하나를 바로 얹는다(바깥쪽 = out 쪽)."""
    f = b.bm.faces.new([b.bm.verts.new(p) for p in pts])
    f.normal_update()
    if out is not None and f.normal.dot(Vector(out)) < 0:
        f.normal_flip()
    f.material_index = b._mi(m)
    f[b.tone] = tone
    f[b.jit] = jit


def sheet(b, m, nx, ny, fn, out, tone=1.0, jit=0.07):
    """fn(u, v) 로 휘어진 면. m 은 재질 이름 또는 (i, j) → 이름. out = 바깥쪽(방향 또는 가운데 점 → 방향)."""
    vs = [[Vector(fn(i / nx, j / ny)) for j in range(ny + 1)] for i in range(nx + 1)]
    for i in range(nx):
        for j in range(ny):
            q = [vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1]]
            c = (q[0] + q[1] + q[2] + q[3]) / 4
            face(b, m(i, j) if callable(m) else m, q, out(c) if callable(out) else out, tone, jit)


def rock(b, r, loc, m, seed=1, sq=0.7, seg=5):
    h = r * 2 * sq * 0.62
    b.cone(r, r * 0.58, h, (loc[0], loc[1], loc[2] + h * 0.42), m, seg=seg, rot=(0, 0, seed * 1.7), jit=0.1, f=wob(0.2, seed))


def blob(b, r, loc, m, seg=6, sq=0.84, seed=1, tone=1.0, jit=0.09, k=0.15):
    b.lathe([(r * 0.52, -r * sq * 0.8), (r, -r * sq * 0.16), (r * 0.8, r * sq * 0.5), (r * 0.3, r * sq * 0.94)], loc, m, seg=seg, tone=tone, jit=jit, rot=(0, 0, seed * 1.3), f=wob(k, seed))


def up(c):
    return (0, 0, 1)


radial = lambda c: (c.x, c.y, 0.4)

# ════════ 움집: 둥글게 판 자리 위에 이엉을 세 겹 두른 원뿔 지붕 · 서까래가 꼭대기에서 엇갈린다 · 앞(문) = -y ════════
R0, RT, HT, NSEG = 3.8, 0.42, 3.95, 14
DA = 2 * PI / NSEG
A0 = -PI / 2 - DA / 2


def roof_r(t):
    return R0 + (RT - R0) * t + 0.2 * math.sin(PI * t)


def roof_z(t):
    return 0.1 + (HT - 0.1) * t


def roof_pt(a, t, off=0.0, dz=0.0):
    r = roof_r(t) + off
    return (math.cos(a) * r, math.sin(a) * r, roof_z(t) + dz)


def pit_house():
    b = B()
    rr = random.Random(21)
    TIERS = [(0.0, 0.38, 0.0), (0.31, 0.7, 0.17), (0.63, 1.0, 0.15)]
    PAL = ('thatch', 'thatch_l', 'thatch', 'thatch_d', 'thatch_l', 'thatch_o', 'thatch')
    for ti, (t0, t1, off) in enumerate(TIERS):
        edge = [(rr.random() * 0.12, (rr.random() - 0.5) * 0.14) for _ in range(NSEG)]      # 이엉 끝자락이 들쭉날쭉
        for i in range(NSEG):
            aa, ab = A0 + i * DA, A0 + (i + 1) * DA
            e0, e1 = edge[i], edge[(i + 1) % NSEG]
            tm = (t0 + t1) / 2
            q0 = [roof_pt(aa, t0, off + e0[0], e0[1]), roof_pt(ab, t0, off + e1[0], e1[1]), roof_pt(ab, tm, off * 0.55 + 0.02), roof_pt(aa, tm, off * 0.55 + 0.02)]
            q1 = [roof_pt(aa, tm, off * 0.55 + 0.02), roof_pt(ab, tm, off * 0.55 + 0.02), roof_pt(ab, t1, 0.02), roof_pt(aa, t1, 0.02)]
            m = PAL[(i * 3 + ti * 2 + (i * i) % 3) % len(PAL)]
            tn = 0.93 + rr.random() * 0.13
            c = Vector(q0[0]) + Vector(q0[1])
            face(b, m, q0, (c.x, c.y, 1.2), tn, 0.05)
            face(b, m, q1, (c.x, c.y, 1.2), tn * 1.03, 0.05)
            if ti > 0:      # 겹친 자락의 밑면(어두운 띠)
                face(b, 'thatch_d', [roof_pt(aa, t0, off + e0[0], e0[1]), roof_pt(ab, t0, off + e1[0], e1[1]), roof_pt(ab, t0 + 0.02, -0.02), roof_pt(aa, t0 + 0.02, -0.02)], (0, 0, -1), 0.62, 0.03)
    # 이엉을 누르는 새끼줄 두 줄 · 누름대
    for t in (0.2, 0.53, 0.83):
        z = roof_z(t)
        r = roof_r(t) + (0.08 if t < 0.3 else 0.12)
        b.lathe([(r + 0.015, z - 0.045), (r, z + 0.045)], (0, 0, 0), 'rope' if t < 0.8 else 'rope_d', seg=NSEG, cap=False, rot=(0, 0, A0), jit=0.05)
    for i in range(NSEG):
        if i % 2 == 0 or i in (0, 1, NSEG - 1):
            continue
        a = A0 + i * DA + (rr.random() - 0.5) * 0.12
        limb(b, roof_pt(a, 0.0, 0.2, -0.05), roof_pt(a, 0.62, 0.2), 0.055, 0.045, 'wood' if i % 4 == 1 else 'wood_d', seg=4, jit=0.06)
    # 꼭대기: 연기 구멍을 두른 띠 · 엇갈려 솟은 서까래 끝
    b.cone(0.56, 0.4, 0.3, (0, 0, HT - 0.02), 'thatch_d', seg=9, jit=0.07)
    b.cone(0.44, 0.38, 0.12, (0, 0, HT + 0.16), 'rope', seg=9, jit=0.05)
    b.cone(0.3, 0.3, 0.02, (0, 0, HT + 0.225), 'dark', seg=8)
    for i in range(7):
        a = i * 2 * PI / 7 + 0.3 + (rr.random() - 0.5) * 0.3
        top = (-math.cos(a) * (0.42 + rr.random() * 0.2), -math.sin(a) * (0.42 + rr.random() * 0.2), HT + 0.75 + rr.random() * 0.4)
        limb(b, (math.cos(a) * 0.5, math.sin(a) * 0.5, HT - 0.45), top, 0.06, 0.035, 'wood_d' if i % 2 else 'wood', seg=5, jit=0.06)
    # 둘레 흙 두둑 · 눌러 둔 돌
    b.lathe([(R0 + 0.5, 0.0), (R0 + 0.36, 0.2), (R0 + 0.1, 0.3), (R0 - 0.2, 0.24)], (0, 0, 0), 'earth', seg=NSEG, cap=False, rot=(0, 0, A0), jit=0.08, f=wob(0.025, 5))
    for i in range(12):
        a = A0 + DA * 1.6 + i * (2 * PI - DA * 2.2) / 11 + (rr.random() - 0.5) * 0.12
        rock(b, 0.2 + rr.random() * 0.13, (math.cos(a) * (R0 + 0.42), math.sin(a) * (R0 + 0.42), 0.1), ('stone', 'stone_d', 'stone_l')[i % 3], seed=40 + i)
    # 문간: 앞으로 낸 박공 이엉 지붕 · 흙벽 · 문틀 · 말아 올린 거적문 · 디딤돌
    yb, yf = -2.2, -4.12
    for s in (-1, 1):
        for j, (ya, yc) in enumerate(((yb, (yb + yf) / 2), ((yb + yf) / 2, yf - 0.14))):
            face(b, ('thatch_l', 'thatch')[(j + (s > 0)) % 2], [(0, ya, 1.98), (0, yc, 1.98), (s * 1.34, yc - 0.03, 0.06), (s * 1.34, ya, 0.06)], (s, 0, 0.8), 0.98 + j * 0.05, 0.05)
        face(b, 'thatch_d', [(0, yf - 0.14, 1.98), (s * 1.34, yf - 0.17, 0.06), (s * 1.2, yf, 0.06), (0, yf, 1.82)], (0, -1, 0), 0.7, 0.03)
        limb(b, (s * 0.52, yf - 0.05, 0.0), (s * 0.47, yf - 0.05, 1.3), 0.075, 0.06, 'wood', seg=5, jit=0.06)
        limb(b, (s * 1.36, yb + 0.5, 0.0), (s * 0.02, yb + 0.5, 2.06), 0.05, 0.04, 'wood_d', seg=4)
    b.prism([(-1.2, 0.0), (1.2, 0.0), (0, 1.82)], 0.08, (0, yf - 0.0, 0), 'earth_l', jit=0.04)
    b.box((0.86, 0.1, 1.2), (0, yf - 0.02, 0.6), 'dark')
    limb(b, (-0.62, yf - 0.06, 1.31), (0.62, yf - 0.06, 1.33), 0.065, 0.06, 'wood_d', seg=5, jit=0.06)
    limb(b, (-0.5, yf - 0.12, 1.2), (0.5, yf - 0.12, 1.2), 0.09, 0.09, 'mat', seg=6, jit=0.08)
    limb(b, (0, yb + 0.1, 2.0), (0, yf - 0.32, 2.03), 0.06, 0.05, 'wood', seg=5)
    b.box((0.95, 0.55, 0.12), (0, yf - 0.48, 0.05), 'stone', bevel=0.04, jit=0.08)
    b.done('wpit', smooth=0, shade=(0.68, 1.1), under=0.3)

    # 눈 덮개(지붕 위쪽 · 문간 지붕 · 흙 두둑) — 장면이 첫눈에 서서히 드러낸다
    b = B()
    rr = random.Random(23)
    edge = [0.2 + rr.random() * 0.2 for _ in range(NSEG)]
    for i in range(NSEG):
        aa, ab = A0 + i * DA, A0 + (i + 1) * DA
        e0, e1 = edge[i], edge[(i + 1) % NSEG]
        c = Vector(roof_pt(aa, 0.5)) + Vector(roof_pt(ab, 0.5))
        face(b, 'snow', [roof_pt(aa, e0, 0.24), roof_pt(ab, e1, 0.24), roof_pt(ab, 0.66, 0.2), roof_pt(aa, 0.66, 0.2)], (c.x, c.y, 1.2), 0.96 + rr.random() * 0.06, 0.02)
        face(b, 'snow', [roof_pt(aa, 0.66, 0.2), roof_pt(ab, 0.66, 0.2), roof_pt(ab, 1.0, 0.12, 0.1), roof_pt(aa, 1.0, 0.12, 0.1)], (c.x, c.y, 1.2), 1.0, 0.02)
        face(b, 'snow_d', [roof_pt(aa, e0, 0.24), roof_pt(ab, e1, 0.24), roof_pt(ab, e1 + 0.02, 0.05), roof_pt(aa, e0 + 0.02, 0.05)], (0, 0, -1), 0.9, 0.02)
        if i % 2 == 0 and i not in (0,):
            am = (aa + ab) / 2
            blob(b, 0.3 + rr.random() * 0.12, (math.cos(am) * (R0 + 0.3), math.sin(am) * (R0 + 0.3), 0.26), 'snow', seg=5, sq=0.45, seed=60 + i, jit=0.02)
    for s in (-1, 1):
        face(b, 'snow', [(0, yb + 0.6, 2.1), (0, yf - 0.2, 2.1), (s * 0.95, yf - 0.22, 0.75), (s * 0.95, yb + 0.6, 0.75)], (s, 0, 0.8), 1.0, 0.02)
    b.box((0.9, 0.5, 0.08), (0, yf - 0.48, 0.14), 'snow', bevel=0.03, jit=0.02)
    b.done('wpit_snow', smooth=0, shade=(0.9, 1.04), under=0.1)

    # 문 안 불빛(끝 장면 — 움집 안 화덕)
    b = B()
    b.box((0.8, 0.02, 1.14), (0, yf - 0.085, 0.6), 'glow_door')
    b.box((0.5, 0.02, 0.6), (0, yf - 0.1, 0.36), 'glow_door2')
    b.done('wpit_glow', smooth=0, shade=(1.0, 1.0), under=0.0)


pit_house()

# ════════ 나무: 줄기(가지가 잎 덩이 자리까지 뻗는다) + 잎 덩이 하나 + 눈 덩이 하나. 가지 끝 자리는 winter.js 와 같다 ════════
TIPS_A = [(0.0, 0.0, 4.15, 1.3), (1.2, 0.25, 3.25, 1.02), (-1.15, -0.2, 3.35, 1.08), (0.2, 1.05, 3.55, 0.92), (-0.15, -1.1, 3.45, 0.98)]
TIPS_B = [(0.05, 0.0, 5.1, 0.95), (0.62, 0.15, 4.05, 0.86), (-0.58, -0.2, 4.3, 0.82), (0.1, -0.62, 3.35, 0.8), (-0.12, 0.58, 3.1, 0.74)]


def tree_trunk(name, tips, h, r0, r1, bark, seed):
    b = B()
    rr = random.Random(seed)
    lx, ly = 0.05, 0.02
    b.cone(r0 * 1.5, r0 * 0.95, 0.4, (0, 0, 0.18), bark, seg=5, cap=False, jit=0.07, f=wob(0.1, seed))
    b.cone(r0, r1, h, (lx * h / 2, ly * h / 2, h / 2 + 0.2), bark, seg=5, cap=False, jit=0.07, f=lambda v: Vector((v.x + lx * v.z, v.y + ly * v.z, v.z)))
    fork = Vector((lx * h, ly * h, h + 0.15))
    for i, (x, y, z, r) in enumerate(tips):
        tip = Vector((x, y, z - r * 0.25))
        if i == 0:
            limb(b, fork - Vector((0, 0, 0.1)), tip, r1 * 1.02, r1 * 0.4, bark, seg=4, cap=False, jit=0.07)
        else:
            mid = fork + (tip - fork) * 0.55 + Vector((0, 0, -0.14))
            st = fork + Vector((0, 0, -0.35 - 0.12 * i))
            limb(b, st, mid, r1 * 0.72, r1 * 0.45, bark, seg=3, cap=False, jit=0.07)
            limb(b, mid, tip, r1 * 0.45, 0.03, bark, seg=3, cap=False, jit=0.07)
            tw = mid + Vector((rr.random() - 0.5, rr.random() - 0.5, 0.5 + rr.random() * 0.3)) * 0.8
            if i % 2:
                limb(b, mid, tw, 0.04, 0.012, bark, seg=3, cap=False, jit=0.07)
    b.done(name, smooth=0, shade=(0.7, 1.08), under=0.25)


tree_trunk('wtrunk_a', TIPS_A, 2.0, 0.27, 0.19, 'bark', 3)
tree_trunk('wtrunk_b', TIPS_B, 2.6, 0.2, 0.15, 'bark_l', 4)
b = B()
blob(b, 1.0, (0, 0, 0), 'tint_c', seg=5, seed=7, jit=0.1)
b.done('wblob_a', smooth=0, shade=(0.6, 1.14), under=0.42)
b = B()
blob(b, 1.0, (0, 0, 0), 'tint_c', seg=5, seed=11, jit=0.1, sq=0.74, k=0.2)
b.done('wblob_b', smooth=0, shade=(0.6, 1.14), under=0.42)
b = B()      # 가지에 얹힌 눈
b.lathe([(0.64, 0.0), (0.5, 0.2), (0.16, 0.3)], (0, 0, 0), 'snow', seg=5, jit=0.02, f=wob(0.14, 15))
b.done('wsnowcap', smooth=0, shade=(0.9, 1.04), under=0.15)
b = B()      # 땅에 쌓인 눈 더미
b.lathe([(1.0, 0.0), (0.82, 0.12), (0.45, 0.22), (0.12, 0.26)], (0, 0, 0), 'snow', seg=8, jit=0.02, f=wob(0.12, 16))
b.done('wdrift', smooth=0, shade=(0.93, 1.03), under=0.0)

# ════════ 땅: 얼룩 · 풀섶 · 떨어진 잎 · 억새 · 먼 산 · 밭이랑 ════════
b = B()      # 옆면 없는 납작한 얼룩(마당의 다져진 자리 · 길) — 땅에 바짝 붙인다
rr = random.Random(20)
face(b, 'tint_c', [(math.cos(i * 2 * PI / 9) * (0.8 + rr.random() * 0.4), math.sin(i * 2 * PI / 9) * (0.8 + rr.random() * 0.4), 0.0) for i in range(9)], (0, 0, 1), 1.0, 0.0)
b.done('wblot', smooth=0, shade=(1.0, 1.0), under=0.0)
b = B()
rr = random.Random(31)
for i in range(5):
    a = i * 1.26 + rr.random() * 0.4
    d = rr.random() * 0.14
    hh = 0.34 + rr.random() * 0.3
    lean = 0.15 + rr.random() * 0.4
    p0 = Vector((math.cos(a) * d, math.sin(a) * d, 0))
    limb(b, p0, p0 + Vector((math.cos(a) * math.sin(lean), math.sin(a) * math.sin(lean), math.cos(lean))) * hh, 0.05, 0.004, 'tint_c', seg=3, cap=False, jit=0.14, tone=0.86 + rr.random() * 0.2)
b.done('wtuft', smooth=0, shade=(0.62, 1.12), under=0.1)
b = B()
rr = random.Random(33)
for i in range(11):
    a = rr.random() * 6.28
    d = 0.15 + rr.random() * 1.1
    c = Vector((math.cos(a) * d, math.sin(a) * d, 0.012 + i * 0.002))
    t = rr.random() * 6.28
    u, v = Vector((math.cos(t), math.sin(t), 0)), Vector((-math.sin(t), math.cos(t), 0))
    L, w = 0.16 + rr.random() * 0.1, 0.07 + rr.random() * 0.04
    face(b, 'tint_c', [c - u * L, c + v * w, c + u * L, c - v * w], (0, 0, 1), 0.8 + rr.random() * 0.35, 0.1)
b.done('wleaves', smooth=0, shade=(1.0, 1.0), under=0.0)
b = B()      # 억새: 가을 강가 · 밭둑
rr = random.Random(35)
for i in range(7):
    a = i * 0.9 + rr.random() * 0.4
    d = rr.random() * 0.2
    hh = 1.1 + rr.random() * 0.6
    lean = 0.1 + rr.random() * 0.3
    p0 = Vector((math.cos(a) * d, math.sin(a) * d, 0))
    dr = Vector((math.cos(a) * math.sin(lean), math.sin(a) * math.sin(lean), math.cos(lean)))
    p1 = p0 + dr * hh
    limb(b, p0, p1, 0.035, 0.012, 'pampas' if i % 3 else 'pampas_d', seg=3, cap=False, jit=0.12)
    if i % 2 == 0:
        p2 = p1 + (dr + Vector((math.cos(a) * 0.5, math.sin(a) * 0.5, -0.1))).normalized() * (0.34 + rr.random() * 0.14)
        limb(b, p1 - dr * 0.05, (p1 + p2) / 2, 0.02, 0.085, 'plume' if i % 4 else 'plume_d', seg=3, cap=False, jit=0.06)
        limb(b, (p1 + p2) / 2, p2, 0.085, 0.008, 'plume', seg=3, cap=False, jit=0.06)
b.done('wpampas', smooth=0, shade=(0.66, 1.1), under=0.1)
b = B()
b.ball(1.0, (0, 0, -0.06), 'tint_c', sub=2, scale=(1, 1, 0.62), jit=0.05, f=wob(0.1, 19))
b.done('whill', smooth=0, shade=(0.74, 1.06), under=0.0)
b = B()      # 밭이랑(길이 1 — 장면이 늘인다)
for j in range(4):
    y0, y1 = -0.5 + j * 0.25, -0.25 + j * 0.25
    w0, w1 = 0.3 + (j % 2) * 0.03, 0.3 + ((j + 1) % 2) * 0.03
    for s in (-1, 1):
        face(b, 'tint_c', [(s * w0, y0, 0.0), (s * w1, y1, 0.0), (s * 0.1, y1, 0.13), (s * 0.1, y0, 0.13)], (s, 0, 0.6), 0.86 if s < 0 else 1.0, 0.07)
    face(b, 'tint_c', [(-0.1, y0, 0.13), (0.1, y0, 0.13), (0.1, y1, 0.13), (-0.1, y1, 0.13)], (0, 0, 1), 1.08, 0.07)
b.done('wfurrow', smooth=0, shade=(1.0, 1.0), under=0.0)

# ════════ 조: 익은 포기(이삭이 고개를 숙인다) · 벤 그루 · 멧돼지가 파헤친 자리 ════════
b = B()
rr = random.Random(41)
for i in range(3):
    a = i * 2.1 + rr.random() * 0.6
    d = 0.08 + rr.random() * 0.08
    h = 1.12 + rr.random() * 0.3
    lean = 0.07 + rr.random() * 0.1
    o = Vector((math.cos(a), math.sin(a), 0))
    p0 = o * d
    dr = (o * math.sin(lean) + Vector((0, 0, math.cos(lean))))
    top = p0 + dr * h
    limb(b, p0, top, 0.034, 0.02, 'mstalk', seg=3, cap=False, jit=0.08)
    p1 = top + o * 0.13 + Vector((0, 0, 0.07))
    p2 = p1 + o * 0.17 + Vector((0, 0, -0.2))
    limb(b, top - dr * 0.03, p1, 0.028, 0.08, 'ear', seg=3, cap=False, jit=0.07)
    limb(b, p1, p2, 0.08, 0.022, 'ear' if i % 2 else 'ear_d', seg=3, cap=False, jit=0.07, tone=1.05)
    for k in range(2):
        al = a + 1.6 + k * 2.6 + rr.random()
        ol = Vector((math.cos(al), math.sin(al), 0))
        sd = Vector((-math.sin(al), math.cos(al), 0)) * 0.045
        lb = p0 + dr * h * (0.35 + k * 0.27)
        lm = lb + ol * 0.2 + Vector((0, 0, 0.17))
        lt = lm + ol * 0.26 + Vector((0, 0, -0.1))
        m = 'mleaf' if (i + k) % 2 else 'mleaf_d'
        face(b, m, [lb - sd * 0.5, lb + sd * 0.5, lm + sd, lm - sd], (0, 0, 1), 1.0, 0.1)
        face(b, m, [lm - sd, lm + sd, lt], (0, 0, 1), 1.08, 0.1)
b.done('wmillet', smooth=0, shade=(0.7, 1.12), under=0.1)
b = B()      # 조 포기의 그림자 대역(엇갈린 판 둘 — 장면이 보이지 않게 두고 그림자만 드리운다)
for a in (0.4, 0.4 + PI / 2):
    u = Vector((math.cos(a), math.sin(a), 0))
    face(b, 'mstalk', [u * -0.2 + Vector((0, 0, 0.2)), u * 0.2 + Vector((0, 0, 0.2)), u * 0.42 + Vector((0, 0, 1.36)), u * -0.42 + Vector((0, 0, 1.36))], None, 1.0, 0.0)
b.done('wmillet_sh', smooth=0, shade=(1.0, 1.0), under=0.0)
b = B()
rr = random.Random(43)
for i in range(3):
    a = i * 2.1 + rr.random() * 0.6
    d = 0.08 + rr.random() * 0.08
    hh = 0.2 + rr.random() * 0.12
    b.cone(0.05, 0.04, hh, (math.cos(a) * d, math.sin(a) * d, hh / 2), 'straw' if i % 2 else 'straw_d', seg=3, jit=0.1)
for i in range(3):
    a = rr.random() * 6.28
    c = Vector((math.cos(a * 2) * 0.22, math.sin(a * 2) * 0.22, 0.02))
    u = Vector((math.cos(a), math.sin(a), 0)) * 0.2
    limb(b, c - u, c + u, 0.016, 0.012, 'straw_d' if i % 2 else 'mleaf_d', seg=3, cap=False, jit=0.1)
b.done('wstubble', smooth=0, shade=(0.8, 1.08), under=0.1)
b = B()
rr = random.Random(45)
b.cone(0.62, 0.5, 0.05, (0, 0, 0.022), 'earth_d', seg=7, jit=0.08, f=wob(0.12, 46))
for i in range(4):
    a = i * 1.6 + rr.random() * 0.5
    u = Vector((math.cos(a), math.sin(a), 0))
    p0 = u * 0.12
    p1 = u * (0.85 + rr.random() * 0.3) + Vector((0, 0, 0.05))
    limb(b, p0 + Vector((0, 0, 0.05)), p1, 0.03, 0.02, 'mstalk' if i % 2 else 'straw_d', seg=3, cap=False, jit=0.1)
    if i < 2:
        limb(b, p1, p1 + u * 0.22, 0.05, 0.02, 'ear_d', seg=3, cap=False, jit=0.1)
for i in range(4):
    a = 0.8 + i * 1.5
    rock(b, 0.1 + rr.random() * 0.07, (math.cos(a) * 0.42, math.sin(a) * 0.42, 0.0), 'earth' if i % 2 else 'earth_d', seed=50 + i, seg=4)
b.done('wruined', smooth=0, shade=(0.85, 1.06), under=0.1)

# ════════ 건조대 · 널어 둔 볏단 · 덮는 거적 · 거적 더미 ════════
b = B()
for s in (-1, 1):
    x = s * 1.7
    limb(b, (x, 0, -0.1), (x, 0, 1.62), 0.075, 0.06, 'wood_d', seg=6, jit=0.06)
    limb(b, (x, 0, 1.56), (x + 0.02, 0.13, 1.82), 0.045, 0.028, 'wood_d', seg=5)
    limb(b, (x, 0, 1.56), (x - 0.02, -0.13, 1.8), 0.045, 0.028, 'wood_d', seg=5)
    for sy in (-1, 1):
        limb(b, (x, sy * 0.36, 0.0), (x, sy * 0.02, 1.02), 0.04, 0.035, 'wood', seg=4, jit=0.06)
    b.cone(0.09, 0.09, 0.07, (x, 0, 1.5), 'rope', seg=6, jit=0.05)
    b.cone(0.085, 0.085, 0.06, (x, 0, 1.0), 'rope_d', seg=6, jit=0.05)
limb(b, (-1.98, 0, 1.5), (1.98, 0, 1.52), 0.055, 0.045, 'wood', seg=6, jit=0.06)
limb(b, (-1.9, 0, 1.0), (1.9, 0, 0.99), 0.045, 0.04, 'wood_l', seg=5, jit=0.06)
b.done('wrack', smooth=0, shade=(0.72, 1.08), under=0.15)
b = B()      # 볏단: 가로대에 걸쳐 양쪽으로 늘어뜨린 이삭 묶음(색은 장면이 — 풋것에서 누렇게)
rr = random.Random(47)
for s in (-1, 1):
    for k in range(4):
        x = (k - 1.5) * 0.13 + (rr.random() - 0.5) * 0.04
        top = Vector((x * 0.5, s * 0.03, 0.06))
        mid = Vector((x, s * 0.13, -0.3 - rr.random() * 0.06))
        end = Vector((x * 1.25, s * (0.15 + rr.random() * 0.05), -0.58 - rr.random() * 0.12))
        limb(b, top, mid, 0.03, 0.03, 'tint_c', seg=3, cap=False, jit=0.08, tone=0.8)
        limb(b, mid, end, 0.045, 0.085, 'tint_c', seg=4, cap=False, jit=0.08, tone=1.0 + (k % 2) * 0.08)
        b.cone(0.085, 0.02, 0.1, (end.x, end.y, end.z - 0.05), 'tint_c', seg=4, jit=0.06, tone=1.05)
b.cone(0.2, 0.2, 0.07, (0, 0, 0.07), 'tint_c', seg=6, scale=(1.3, 0.55, 1), jit=0.05, tone=0.72)
b.done('wsheaf', smooth=0, shade=(0.78, 1.1), under=0.1)
b = B()      # 덮은 거적: 가로대에 걸쳐 양쪽으로 드리운다(엮은 줄 무늬)
NS = 16
for i in range(NS):
    x0, x1 = -2.05 + i * 4.1 / NS, -2.05 + (i + 1) * 4.1 / NS
    m = ('mat', 'mat_l', 'mat', 'mat_d')[i % 4]
    for s in (-1, 1):
        e = 0.02 * ((i * 7) % 3)
        face(b, m, [(x0, 0, 1.66), (x1, 0, 1.66), (x1, s * 0.34, 1.2), (x0, s * 0.34, 1.2)], (0, s, 1), 1.0, 0.06)
        face(b, m, [(x0, s * 0.34, 1.2), (x1, s * 0.34, 1.2), (x1, s * 0.56, 0.6 - e), (x0, s * 0.56, 0.6 - e)], (0, s, 0.4), 0.92, 0.06)
for x in (-1.4, 0, 1.4):
    for s in (-1, 1):
        face(b, 'rope_d', [(x - 0.04, 0, 1.675), (x + 0.04, 0, 1.675), (x + 0.04, s * 0.345, 1.215), (x - 0.04, s * 0.345, 1.215)], (0, s, 1), 1.0, 0.03)
        face(b, 'rope_d', [(x - 0.04, s * 0.345, 1.215), (x + 0.04, s * 0.345, 1.215), (x + 0.04, s * 0.575, 0.6), (x - 0.04, s * 0.575, 0.6)], (0, s, 0.4), 0.95, 0.03)
b.done('wmatcover', smooth=0, shade=(0.78, 1.08), under=0.1)
b = B()      # 거적 더미: 말아 둔 거적 셋 + 접어 둔 것
b.box((1.5, 1.0, 0.09), (0, 0.08, 0.045), 'mat_d', jit=0.06)
b.box((1.4, 0.9, 0.08), (0.03, 0.1, 0.13), 'mat', jit=0.06, rot=(0, 0, 0.06))
for x, y, z, m in ((-0.32, -0.12, 0.33, 'mat'), (0.32, -0.1, 0.33, 'mat_l'), (0.0, -0.1, 0.62, 'mat')):
    limb(b, (x - 0.02, y - 0.55, z), (x + 0.02, y + 0.55, z), 0.17, 0.17, m, seg=7, jit=0.07)
    limb(b, (x - 0.02, y - 0.56, z), (x - 0.02, y - 0.54, z), 0.1, 0.1, 'mat_d', seg=6)
    for yy in (-0.3, 0.3):
        b.cone(0.18, 0.18, 0.045, (x, y + yy, z), 'rope_d', seg=7, rot=(PI / 2, 0, 0), jit=0.04)
b.done('wmatpile', smooth=0, shade=(0.74, 1.08), under=0.2)


# ════════ 빗살무늬토기: 뾰족한 밑 · 아가리 띠의 짧은 빗금 · 몸통의 생선뼈 무늬(세모 면을 번갈아 칠해 무늬를 낸다) ════════
def comb_pot(b, prof, inner, seg=12, loc=(0, 0, 0), s=1.0, rim=2, plain=1, lines=1):
    """몸통은 흙빛 그대로 두고, 그 위에 가는 빗금(어두운 좁은 면)을 얹는다 — 아가리 띠는 한쪽으로 누운 짧은 빗금, 몸통은 띠마다 방향을 바꿔 생선뼈 무늬."""
    L = Vector(loc)
    rings = [[Vector((math.cos(i * 2 * PI / seg) * r * s, math.sin(i * 2 * PI / seg) * r * s, z * s)) + L for i in range(seg)] for r, z in prof]
    nb = len(prof) - 1
    for k in range(nb):
        isrim = k >= nb - rim
        for i in range(seg):
            a0, a1, b0, b1 = rings[k][i], rings[k][(i + 1) % seg], rings[k + 1][i], rings[k + 1][(i + 1) % seg]
            c = (a0 + a1 + b0 + b1) / 4 - L
            n = Vector((c.x, c.y, 0.0)).normalized()
            face(b, 'clay_l' if isrim else 'clay', [a0, a1, b1, b0], n, 0.97 + 0.05 * (k % 2), 0.04)
            if k < plain:
                continue
            t = (a1 - a0).normalized()
            nl = lines * 2 if isrim else lines
            for j in range(nl):
                u0, u1 = (j + 0.16) / nl, (j + 0.84) / nl
                if isrim or k % 2 == 0:
                    P, Q = a0.lerp(a1, u0), b0.lerp(b1, u1)
                else:
                    P, Q = a0.lerp(a1, u1), b0.lerp(b1, u0)
                P, Q = P.lerp(Q, 0.1), P.lerp(Q, 0.9)
                w = t * (0.008 * s)
                o = n * (0.007 * s)
                face(b, 'clay_d', [P - w + o, P + w + o, Q + w + o, Q - w + o], n, 1.0, 0.05)
    face(b, 'clay_m', list(reversed(rings[0])), (0, 0, -1), 0.9, 0.0)
    irings = [[Vector((math.cos(i * 2 * PI / seg) * r * s, math.sin(i * 2 * PI / seg) * r * s, z * s)) + L for i in range(seg)] for r, z in inner]
    for i in range(seg):
        face(b, 'clay_l', [rings[-1][i], rings[-1][(i + 1) % seg], irings[0][(i + 1) % seg], irings[0][i]], (0, 0, 1), 1.04, 0.03)
    for k in range(len(inner) - 1):
        for i in range(seg):
            a0, a1, b0, b1 = irings[k][i], irings[k][(i + 1) % seg], irings[k + 1][i], irings[k + 1][(i + 1) % seg]
            c = (a0 + a1 + b0 + b1) / 4 - L
            face(b, 'clay_in', [a0, a1, b1, b0], (-c.x, -c.y, 0.3), 0.95 - k * 0.12, 0.03)
    face(b, 'clay_in', irings[-1], (0, 0, 1), 0.7, 0.0)


POT = [(0.03, 0.0), (0.13, 0.1), (0.245, 0.3), (0.34, 0.54), (0.41, 0.78), (0.455, 0.98), (0.48, 1.1), (0.5, 1.2)]
POT_IN = [(0.44, 1.2), (0.41, 1.0), (0.34, 0.68), (0.27, 0.46)]
b = B()
comb_pot(b, POT, POT_IN)
b.done('wpot', smooth=0, shade=(0.66, 1.1), under=0.25)
BOWL = [(0.05, 0.0), (0.2, 0.08), (0.36, 0.24), (0.46, 0.42), (0.5, 0.56), (0.52, 0.62)]
BOWL_IN = [(0.46, 0.62), (0.42, 0.44), (0.3, 0.22), (0.16, 0.12)]
b = B()
comb_pot(b, BOWL, BOWL_IN, rim=1)
b.done('wbowl', smooth=0, shade=(0.7, 1.1), under=0.25)
b = B()      # 토기를 꽂아 세우는 자리(뾰족한 밑을 흙에 묻고 돌로 괸다)
b.cone(0.5, 0.3, 0.14, (0, 0, 0.06), 'earth', seg=8, jit=0.08, f=wob(0.1, 55))
for i in range(4):
    a = 0.5 + i * 1.57
    rock(b, 0.1 + (i % 2) * 0.03, (math.cos(a) * 0.36, math.sin(a) * 0.36, 0.02), 'stone' if i % 2 else 'stone_d', seed=56 + i, seg=4)
b.done('wpotstand', smooth=0, shade=(0.8, 1.06), under=0.1)
b = B()      # 담긴 곡식(반지름 1 — 장면이 줄인다)
b.lathe([(1.0, 0.0), (0.7, 0.1), (0.3, 0.17), (0.05, 0.19)], (0, 0, 0), 'grain', seg=10, jit=0.08, cap=False)
b.done('wfill', smooth=0, shade=(0.92, 1.06), under=0.0)

# ════════ 갈판과 갈돌 · 화덕 · 불꽃 · 연기 ════════
b = B()


def saddle(u, v):
    x = (u - 0.5) * 1.56
    y = (v - 0.5) * 0.8 * (1 - 0.14 * abs(u - 0.5) * 2)
    return (x, y, 0.3 - 0.085 * math.sin(PI * u) * (0.6 + 0.4 * math.sin(PI * v)) + 0.03 * (u - 0.5))


sheet(b, lambda i, j: 'quern_l' if (i in (2, 3) and j == 1) else 'quern', 6, 3, saddle, (0, 0, 1), 1.0, 0.06)
for i in range(6):
    for (va, vb, out) in ((0, 0, (0, -1, 0.2)), (1, 1, (0, 1, 0.2))):
        pa, pb = Vector(saddle(i / 6, va)), Vector(saddle((i + 1) / 6, vb))
        face(b, 'stone', [pa, pb, (pb.x * 0.94, pb.y * 0.86, 0.0), (pa.x * 0.94, pa.y * 0.86, 0.0)], out, 0.92, 0.07)
for j in range(3):
    for (u, out) in ((0, (-1, 0, 0.2)), (1, (1, 0, 0.2))):
        pa, pb = Vector(saddle(u, j / 3)), Vector(saddle(u, (j + 1) / 3))
        face(b, 'stone_d', [pa, pb, (pb.x * 0.94, pb.y * 0.86, 0.0), (pa.x * 0.94, pa.y * 0.86, 0.0)], out, 0.95, 0.07)
rr = random.Random(57)
for i in range(7):
    b.cone(0.03, 0.01, 0.025, (-0.3 + rr.random() * 0.6, -0.2 + rr.random() * 0.4, 0.235), 'grain', seg=4)
rock(b, 0.14, (-0.95, 0.3, 0.0), 'stone_d', seed=58)
rock(b, 0.1, (0.9, -0.42, 0.0), 'stone_l', seed=59)
b.cone(0.3, 0.16, 0.05, (0.2, 0.62, 0.02), 'straw', seg=7, jit=0.08)      # 떨어낸 겨
b.done('wquern', smooth=0, shade=(0.74, 1.08), under=0.25)
b = B()      # 갈돌: 두 손으로 쥐고 미는 길쭉한 돌(긴 쪽 = y)
b.cone(0.15, 0.15, 0.88, (0, 0, 0.0), 'stone_l', seg=7, rot=(PI / 2, 0, 0), scale=(1, 1, 0.8), jit=0.06, bevel=0.035)
b.done('wroller', smooth=0, shade=(0.8, 1.08), under=0.25)

b = B()      # 화덕: 돌을 두르고 재 위에 장작을 얹었다
rr = random.Random(61)
b.cone(0.82, 0.7, 0.06, (0, 0, 0.03), 'ash', seg=10, jit=0.06)
b.cone(0.5, 0.3, 0.05, (0, 0, 0.075), 'char', seg=8, jit=0.06)
for i in range(10):
    a = i * 2 * PI / 10 + (rr.random() - 0.5) * 0.15
    rock(b, 0.2 + rr.random() * 0.1, (math.cos(a) * 0.92, math.sin(a) * 0.92, 0.0), ('stone', 'stone_d', 'stone_l', 'stone_d')[i % 4], seed=62 + i, sq=0.8)
for i in range(5):
    a = i * 2 * PI / 5 + 0.3
    limb(b, (math.cos(a) * 0.62, math.sin(a) * 0.62, 0.08), (-math.cos(a) * 0.12, -math.sin(a) * 0.12, 0.42), 0.085, 0.07, 'wood_d' if i % 2 else 'char', seg=5, jit=0.08)
for i in range(6):
    a = i * 1.05 + 0.5
    b.cone(0.07, 0.04, 0.05, (math.cos(a) * 0.3, math.sin(a) * 0.3, 0.11), 'glow_ember', seg=4)
b.done('whearth', smooth=0, shade=(0.72, 1.08), under=0.2)


def tongue(b, m, x, y, r, h, tw, seed):
    ph = random.Random(seed).random() * 6

    def f(v):
        k = v.z / h
        a = tw * k
        return Vector((v.x * math.cos(a) - v.y * math.sin(a) + math.sin(k * 3 + ph) * 0.08 * k, v.x * math.sin(a) + v.y * math.cos(a) + math.cos(k * 2.3 + ph) * 0.08 * k, v.z))
    b.lathe([(r * 0.4, 0), (r, h * 0.14), (r * 0.92, h * 0.32), (r * 0.6, h * 0.58), (r * 0.28, h * 0.82), (0.012, h)], (x, y, 0), m, seg=5, jit=0.07, f=f)


b = B()
tongue(b, 'glow_f1', 0, 0.05, 0.3, 1.1, 0.9, 1)
tongue(b, 'glow_f2', 0.15, -0.1, 0.22, 0.85, -0.8, 2)
tongue(b, 'glow_f3', -0.13, -0.09, 0.16, 0.64, 0.7, 3)
tongue(b, 'glow_f2', -0.05, 0.2, 0.13, 0.52, -0.6, 4)
b.done('wflame', smooth=0, shade=(0.8, 1.0), under=0.0)
b = B()
b.ball(0.5, (0, 0, 0), 'smoke', sub=1, jit=0.05, f=wob(0.16, 9))
b.done('wpuff', smooth=0, shade=(0.82, 1.04), under=0.1)

# ════════ 빚는 자리 · 진흙 캐는 자리 · 저장 구덩이 · 연장 · 장작 ════════
b = B()      # 빚는 자리: 깔개 · 받침돌 · 흙 타래 · 빗(무늬 긋는 연장) · 물그릇 — 가운데는 비워 둔다(빚는 토기가 선다)
for i in range(8):
    x0 = -0.88 + i * 0.22
    b.box((0.21, 1.36, 0.05), (x0 + 0.11, 0, 0.03), ('mat', 'mat_l', 'mat', 'mat_d')[i % 4], jit=0.06)
for y in (-0.5, 0.5):
    b.box((1.8, 0.05, 0.065), (0, y, 0.035), 'rope_d', jit=0.04)
b.cone(0.26, 0.22, 0.06, (-0.6, 0.42, 0.09), 'stone', seg=7, jit=0.08)
for k in range(3):
    b.lathe([(0.15 - k * 0.03, 0), (0.17 - k * 0.03, 0.03), (0.15 - k * 0.03, 0.06)], (-0.6, 0.42, 0.12 + k * 0.055), 'clay_raw', seg=8, jit=0.06)
limb(b, (0.5, 0.45, 0.075), (0.82, 0.3, 0.075), 0.03, 0.022, 'clay_raw', seg=5, jit=0.06)
limb(b, (0.45, 0.3, 0.075), (0.8, 0.5, 0.08), 0.028, 0.02, 'clay_wet', seg=5, jit=0.06)
b.box((0.2, 0.09, 0.02), (0.62, -0.46, 0.07), 'shell', rot=(0, 0, 0.5))
for k in range(5):
    b.box((0.022, 0.07, 0.016), (0.55 + k * 0.035 + 0.02, -0.5 + k * 0.02 - 0.05, 0.07), 'shell_d', rot=(0, 0, 0.5))
comb_pot(b, [(0.04, 0.0), (0.14, 0.05), (0.2, 0.14), (0.21, 0.18)], [(0.18, 0.18), (0.14, 0.1), (0.08, 0.07)], seg=8, loc=(-0.62, -0.4, 0.055), rim=1, lines=1)
b.done('wpotter', smooth=0, shade=(0.8, 1.08), under=0.15)

b = B()      # 진흙 캐는 자리: 파낸 구덩이 · 젖은 흙무더기 · 뒤지개(세워 둔 막대)
b.cone(1.2, 1.0, 0.06, (0, 0, 0.03), 'clay_wet', seg=9, jit=0.06, f=wob(0.12, 71))
b.cone(0.55, 0.4, 0.03, (0.25, -0.15, 0.065), 'dark', seg=8, f=wob(0.1, 72))
blob(b, 0.55, (-0.45, 0.25, 0.2), 'clay_raw', seg=6, sq=0.6, seed=73, jit=0.08)
blob(b, 0.36, (-0.1, 0.62, 0.14), 'clay_wet', seg=5, sq=0.6, seed=74, jit=0.08)
blob(b, 0.3, (-0.86, -0.2, 0.12), 'clay_raw', seg=5, sq=0.6, seed=75, jit=0.08)
for i, (x, y) in enumerate(((0.7, 0.5), (0.86, 0.24), (0.6, 0.76))):
    rock(b, 0.13, (x, y, 0.03), 'clay_raw' if i % 2 else 'clay_wet', seed=76 + i)
limb(b, (0.3, -0.2, 0.0), (0.52, -0.3, 1.25), 0.04, 0.03, 'wood_l', seg=5, jit=0.06)
limb(b, (0.28, -0.19, -0.02), (0.31, -0.2, 0.2), 0.02, 0.05, 'wood_l', seg=5)
b.done('wclay', smooth=0, shade=(0.76, 1.08), under=0.15)

b = B()      # 저장 구덩이: 도토리를 담아 묻어 두는 구덩이 — 엮은 뚜껑을 반쯤 열어 두었다
b.lathe([(1.0, 0.0), (0.9, 0.14), (0.72, 0.18), (0.62, 0.06)], (0, 0, 0), 'earth', seg=10, cap=False, jit=0.08, f=wob(0.05, 81))
b.cone(0.64, 0.64, 0.02, (0, 0, 0.05), 'dark', seg=10)
rr = random.Random(82)
for i in range(9):
    a = rr.random() * 6.28
    d = rr.random() * 0.4
    b.cone(0.07, 0.05, 0.08, (0.12 + math.cos(a) * d * 0.7, -0.15 + math.sin(a) * d * 0.7, 0.09), 'acorn' if i % 3 else 'wood_l', seg=5, jit=0.08)
for i in range(6):
    b.box((0.2, 1.3 - abs(i - 2.5) * 0.16, 0.05), (-0.92 + i * 0.2, 0.32, 0.2 + i * 0.025), ('mat', 'mat_l', 'mat_d')[i % 3], rot=(0, -0.12, 0.25), jit=0.06)
limb(b, (-1.0, -0.2, 0.19), (0.2, 0.82, 0.33), 0.03, 0.03, 'wood', seg=4)
rock(b, 0.2, (0.95, 0.5, 0.0), 'stone', seed=83)
rock(b, 0.15, (0.6, -0.95, 0.0), 'stone_d', seed=84)
b.done('wstorepit', smooth=0, shade=(0.76, 1.08), under=0.15)

b = B()      # 연장: 그루터기에 기대 세운 돌괭이 · 돌낫 · 박아 둔 돌도끼
b.cone(0.36, 0.3, 0.42, (0, 0, 0.21), 'bark', seg=8, jit=0.07, f=wob(0.06, 85))
b.cone(0.29, 0.29, 0.02, (0, 0, 0.425), 'wood_cut', seg=8, jit=0.05)
limb(b, (0.1, 0.06, 0.4), (0.42, 0.14, 0.95), 0.03, 0.035, 'wood_l', seg=5, jit=0.06)       # 돌도끼(그루터기에 박힘)
b.box((0.09, 0.2, 0.3), (0.1, 0.06, 0.5), 'stone_l', rot=(0, 0.52, 0.2), bevel=0.02, jit=0.06)
limb(b, (-0.5, -0.38, 0.0), (-0.28, -0.1, 1.35), 0.035, 0.03, 'wood_l', seg=5, jit=0.06)     # 돌괭이
b.box((0.3, 0.07, 0.2), (-0.36, -0.2, 1.25), 'stone', rot=(0.5, 0, 0.9), bevel=0.02, jit=0.06)
b.cone(0.05, 0.05, 0.1, (-0.3, -0.12, 1.24), 'rope', seg=5, rot=(0.2, 0.15, 0))
limb(b, (0.42, -0.42, 0.0), (0.3, -0.2, 0.75), 0.03, 0.028, 'wood', seg=5, jit=0.06)        # 돌낫
b.box((0.34, 0.03, 0.1), (0.43, -0.2, 0.76), 'stone_d', rot=(0, -0.25, 1.0), bevel=0.012, jit=0.06)
b.done('wtools', smooth=0, shade=(0.74, 1.08), under=0.2)

# ════════ 강가: 통나무배 · 물고기 말리는 대 · 그물 · 그물추 · 조개더미 ════════
def hull_pt(u, th, k=1.0, lift=0.0):
    y = (u - 0.5) * 4.6
    w = 0.44 * (max(0.0, math.sin(PI * u)) ** 0.55) * 0.92 + 0.06
    rise = 0.22 * (abs(u - 0.5) * 2) ** 2.4
    return (math.cos(th) * w * k, y * (0.985 if k < 1 else 1.0), 0.43 - math.sin(th) * (0.42 - rise) * k + lift)


b = B()
sheet(b, lambda i, j: 'wood' if (i + j) % 3 else 'wood_d', 8, 5, lambda u, v: hull_pt(u, PI * v), lambda c: (c.x, 0, c.z - 0.45), 1.0, 0.08)
sheet(b, 'wood_cut', 8, 5, lambda u, v: hull_pt(0.03 + u * 0.94, PI * v, 0.8, 0.02), lambda c: (-c.x, 0, 0.5), 0.8, 0.07)
for i in range(8):
    for th in (0, PI):
        a0, a1 = hull_pt(i / 8, th), hull_pt((i + 1) / 8, th)
        c0, c1 = hull_pt(0.03 + i / 8 * 0.94, th, 0.8, 0.02), hull_pt(0.03 + (i + 1) / 8 * 0.94, th, 0.8, 0.02)
        face(b, 'wood_l', [a0, a1, c1, c0], (0, 0, 1), 1.05, 0.06)
limb(b, (-0.12, -1.3, 0.3), (0.2, 1.0, 0.5), 0.03, 0.03, 'wood_l', seg=5, jit=0.06)       # 노
b.box((0.2, 0.62, 0.035), (0.24, 1.3, 0.52), 'wood_l', rot=(0.08, 0, -0.13), bevel=0.012, jit=0.06)
b.box((0.5, 0.1, 0.05), (0, 0.35, 0.36), 'wood_d', jit=0.06)
limb(b, (-0.2, -1.2, 0.0), (0.2, -1.25, 0.02), 0.07, 0.07, 'wood_d', seg=6, jit=0.06)       # 받침 통나무
limb(b, (-0.22, 1.15, 0.0), (0.22, 1.2, 0.02), 0.07, 0.07, 'wood_d', seg=6, jit=0.06)
b.done('wcanoe', smooth=0, shade=(0.7, 1.08), under=0.3)


def fish(b, c, L, ang=0.0, flat=(0.3, 1.0), m='fish'):
    """머리를 위로 매단 물고기(c = 주둥이 자리, 아래로 L)."""
    c = Vector(c)
    b.lathe([(0.01, 0), (L * 0.16, L * 0.2), (L * 0.2, L * 0.45), (L * 0.1, L * 0.82), (L * 0.03, L * 0.95)], (c.x, c.y, c.z), m, seg=4, cap=False, rot=(PI, 0, ang), scale=(flat[1], flat[0], 1), jit=0.06, tone=1.0)
    t = c + Vector((0, 0, -L * 0.93))
    u = Vector((math.cos(ang), math.sin(ang), 0)) * L * 0.2
    face(b, 'fish_d', [t, t + u + Vector((0, 0, -L * 0.2)), t - u + Vector((0, 0, -L * 0.2))], None, 1.0, 0.05)


b = B()      # 물고기 말리는 대: 두 다리 틀 두 개 + 장대 + 꿰어 단 물고기 몇 마리
for s in (-1, 1):
    x = s * 1.25
    limb(b, (x, -0.42, 0.0), (x, 0.04, 1.86), 0.05, 0.04, 'wood_d', seg=5, jit=0.06)
    limb(b, (x, 0.42, 0.0), (x, -0.04, 1.86), 0.05, 0.04, 'wood', seg=5, jit=0.06)
    b.cone(0.07, 0.07, 0.07, (x, 0, 1.7), 'rope', seg=6)
limb(b, (-1.5, 0, 1.73), (1.5, 0, 1.75), 0.04, 0.035, 'wood_l', seg=5, jit=0.06)
for i, x in enumerate((-0.95, -0.2, 0.75)):
    limb(b, (x, 0, 1.72), (x, 0, 1.6), 0.008, 0.008, 'rope_d', seg=3, cap=False)
    fish(b, (x, 0, 1.62), 0.5 + (i % 2) * 0.08, ang=0.2 * i)
b.done('wfishrack', smooth=0, shade=(0.74, 1.08), under=0.15)
b = B()      # 그물로 건진 물고기(대에 더 걸린다)
for i, x in enumerate((-0.58, 0.1, 0.42, 1.02)):
    limb(b, (x, 0, 1.72), (x, 0, 1.6), 0.008, 0.008, 'rope_d', seg=3, cap=False)
    fish(b, (x, 0, 1.62), 0.46 + (i % 3) * 0.07, ang=0.25 * i - 0.3, m='fish' if i % 2 else 'fish_b')
b.done('wfishrow', smooth=0, shade=(0.8, 1.08), under=0.1)
b = B()      # 물 위로 튀는 물고기(앞 = -y)
b.lathe([(0.01, 0), (0.07, 0.1), (0.09, 0.24), (0.045, 0.42), (0.012, 0.5)], (0, -0.25, 0), 'fish', seg=4, cap=False, rot=(-PI / 2, 0, 0), scale=(0.45, 1, 1), jit=0.06)
face(b, 'fish_d', [(0, 0.24, 0), (0, 0.38, 0.1), (0, 0.38, -0.1)], None, 1.0, 0.05)
b.done('wfish', smooth=0, shade=(0.85, 1.08), under=0.15)

b = B()      # 그물 더미: 개켜 둔 그물 · 뜸(나무 조각) · 말뚝에 감은 줄 — 그물 치는 자리의 표시
blob(b, 0.62, (0, 0, 0.2), 'net', seg=7, sq=0.5, seed=91, jit=0.08, k=0.1)
blob(b, 0.4, (0.4, 0.25, 0.22), 'net_d', seg=6, sq=0.5, seed=92, jit=0.08, k=0.1)
rr = random.Random(93)
for i in range(7):
    a = i * 0.9
    p0 = Vector((math.cos(a) * 0.62, math.sin(a) * 0.62, 0.1))
    p1 = Vector((math.cos(a + 2.4) * 0.5, math.sin(a + 2.4) * 0.5, 0.14))
    pm = (p0 + p1) / 2 + Vector((0, 0, 0.36))
    limb(b, p0, pm, 0.014, 0.014, 'rope_d', seg=3, cap=False)
    limb(b, pm, p1, 0.014, 0.014, 'rope_d', seg=3, cap=False)
for i, (x, y, z) in enumerate(((0.3, -0.4, 0.3), (-0.42, -0.2, 0.32), (0.0, 0.45, 0.36), (0.66, 0.3, 0.32), (-0.2, 0.1, 0.5))):
    b.cone(0.09, 0.09, 0.14, (x, y, z), 'float', seg=6, rot=(1.2, 0.4 * i, i), jit=0.06, bevel=0.02)
limb(b, (-0.85, 0.5, 0.0), (-0.9, 0.52, 1.25), 0.055, 0.045, 'wood_d', seg=5, jit=0.06)
b.lathe([(0.1, 0), (0.12, 0.06), (0.1, 0.12)], (-0.885, 0.515, 0.78), 'rope', seg=7, jit=0.05)
b.lathe([(0.09, 0), (0.11, 0.05), (0.09, 0.1)], (-0.89, 0.517, 0.9), 'rope_d', seg=7, jit=0.05)
limb(b, (-0.87, 0.5, 0.8), (-0.3, 0.2, 0.4), 0.014, 0.014, 'rope', seg=3, cap=False)
b.done('wnetheap', smooth=0, shade=(0.74, 1.08), under=0.2)
b = B()      # 뜸 하나(물에 뜬다)
b.cone(0.16, 0.16, 0.26, (0, 0, 0), 'float', seg=7, rot=(PI / 2, 0, 0.3), jit=0.06, bevel=0.03)
b.cone(0.165, 0.165, 0.04, (0, 0, 0), 'rope_d', seg=7, rot=(PI / 2, 0, 0.3))
b.done('wfloat', smooth=0, shade=(0.8, 1.06), under=0.2)
b = B()      # 그물 말뚝(강가에 박아 줄을 맨다)
limb(b, (0, 0, -0.2), (0.06, 0.02, 1.7), 0.07, 0.05, 'wood_d', seg=6, jit=0.06)
b.lathe([(0.1, 0), (0.12, 0.06), (0.1, 0.12)], (0.04, 0.01, 1.1), 'rope', seg=7, jit=0.05)
b.lathe([(0.09, 0), (0.11, 0.05), (0.09, 0.1)], (0.045, 0.012, 1.22), 'rope_d', seg=7, jit=0.05)
b.done('wstake', smooth=0, shade=(0.72, 1.08), under=0.15)
b = B()      # 그물추: 양쪽에 홈을 낸 납작한 돌 여섯 — 줄 타래 위에
b.lathe([(0.3, 0), (0.36, 0.035), (0.3, 0.07)], (0, 0, 0), 'rope', seg=9, jit=0.06)
rr = random.Random(95)
for i, (x, y, z) in enumerate(((-0.34, 0.06, 0.07), (-0.02, -0.16, 0.07), (0.3, 0.02, 0.07), (-0.16, 0.22, 0.09), (0.16, 0.24, 0.08), (0.02, 0.04, 0.2))):
    b.cone(0.15, 0.13, 0.1, (x, y, z + 0.04), 'stone_l' if i % 2 else 'quern', seg=7, scale=(1.15, 0.85, 1), rot=(0.1 * i, 0, i * 1.1), jit=0.07, bevel=0.025)
    b.box((0.36, 0.035, 0.035), (x, y, z + 0.09), 'rope_d', rot=(0.1 * i, 0, i * 1.1 + PI / 2))
b.done('wweights', smooth=0, shade=(0.8, 1.08), under=0.2)

b = B()      # 조개더미: 먹고 버린 조개껍데기가 쌓인 무더기
b.lathe([(1.5, 0.0), (1.25, 0.16), (0.8, 0.34), (0.3, 0.44)], (0, 0, 0), 'shell_d', seg=10, jit=0.08, f=wob(0.1, 97), scale=(1.15, 0.85, 1))
rr = random.Random(98)
for i in range(34):
    a = rr.random() * 6.28
    d = rr.random() ** 0.7 * 1.38
    z = 0.44 - 0.3 * d + 0.03
    x, y = math.cos(a) * d * 1.15, math.sin(a) * d * 0.85
    b.cone(0.11 + rr.random() * 0.06, 0.02, 0.06, (x, y, max(0.04, z)), ('shell', 'shell', 'shell_p', 'stone_l')[i % 4], seg=5, rot=((rr.random() - 0.5) * 0.9, (rr.random() - 0.5) * 0.9, a), jit=0.08)
b.done('wshells', smooth=0, shade=(0.8, 1.06), under=0.15)

# ════════ 손에 든 것: 이삭 단(색은 장면이) · 곡식 담은 바구니 · 흙덩이 ════════
b = B()
rr = random.Random(101)
for k in range(5):
    x = (k - 2) * 0.05
    limb(b, (x * 0.4, 0, -0.26), (x * 1.6, (rr.random() - 0.5) * 0.08, 0.12), 0.022, 0.03, 'tint_c', seg=3, cap=False, tone=0.8, jit=0.08)
    limb(b, (x * 1.6, 0, 0.1), (x * 2.6, 0.03, 0.3), 0.05, 0.02, 'tint_c', seg=4, cap=False, tone=1.05, jit=0.08)
b.cone(0.06, 0.06, 0.05, (0, 0, -0.1), 'tint_c', seg=5, tone=0.6)
b.done('wc_sheaf', smooth=0, shade=(0.8, 1.1), under=0.1)
b = B()
b.lathe([(0.1, -0.2), (0.17, -0.1), (0.19, 0.04)], (0, 0, 0), 'straw_d', seg=8, jit=0.1)
b.lathe([(0.2, 0.02), (0.2, 0.06)], (0, 0, 0), 'rope_d', seg=8, cap=False)
b.lathe([(0.175, 0.04), (0.1, 0.1), (0.02, 0.12)], (0, 0, 0), 'grain', seg=8, cap=False, jit=0.08)
b.done('wc_grain', smooth=0, shade=(0.8, 1.1), under=0.2)
b = B()
blob(b, 0.2, (0, 0, -0.04), 'clay_raw', seg=6, sq=0.8, seed=103, jit=0.08)
b.done('wc_clay', smooth=0, shade=(0.76, 1.1), under=0.25)


# ════════ 개 · 멧돼지: 몸통(머리) + 다리 넷(+ 개 꼬리) — 장면이 다리를 흔든다. 새: 몸 + 날개 둘 ════════
def legs(pre, W, L, leg, r0, r1, m, md, foot, hipz):
    for nm, sx, sy in (('legFL', -1, -1), ('legFR', 1, -1), ('legBL', -1, 1), ('legBR', 1, 1)):
        b = B()
        x, y = sx * W * 0.31, sy * L * 0.35
        if sy > 0:
            limb(b, (x, y + 0.06, leg * 0.48), (x, y - 0.02, hipz + 0.1), r1 * 1.05, r0 * 1.25, m, seg=6, tone=0.92, jit=0.03)
            limb(b, (x, y, 0.04), (x, y + 0.06, leg * 0.52), r1 * 0.9, r1 * 1.05, md, seg=5, jit=0.03)
        else:
            limb(b, (x, y, 0.04), (x, y, hipz + 0.1), r1, r0, m, seg=6, tone=0.92, jit=0.03)
        b.box((foot[0], foot[1], 0.06), (x, y - foot[1] * 0.2, 0.03), md, bevel=0.02)
        b.done(pre + '_' + nm, origin=(x, y, hipz), smooth=0, shade=(0.7, 1.05), under=0.1)


# 개(누렁이): 쫑긋한 귀 · 말아 올린 꼬리 · 크림색 주둥이와 가슴
L, W, H, leg = 0.86, 0.34, 0.36, 0.38
zb = leg + H / 2
b = B()
b.box((W, L, H), (0, 0, zb), 'dogc', bevel=0.11, bseg=2, jit=0.03, f=lambda v: Vector((v.x * (1 - 0.18 * v.y / L), v.y, v.z * (1 - 0.2 * v.y / L))))
b.box((W * 0.5, L * 0.9, 0.08), (0, 0.02, leg + H - 0.02), 'dog_d', bevel=0.03, jit=0.03)
b.box((W * 0.74, L * 0.62, 0.1), (0, 0.0, leg + 0.035), 'cream', bevel=0.035, jit=0.02)
b.ball(0.19, (0, -L / 2 + 0.03, zb - 0.04), 'cream', sub=1, scale=(0.85, 0.9, 1.0), jit=0.04)
limb(b, (0, -L / 2 + 0.1, zb + 0.06), (0, -L / 2 - 0.12, zb + 0.3), 0.15, 0.12, 'dogc', seg=6, jit=0.03)
hy, hz = -L / 2 - 0.2, zb + 0.36
b.box((0.3, 0.3, 0.27), (0, hy, hz), 'dogc', bevel=0.075, bseg=2, jit=0.02)
b.box((0.15, 0.22, 0.13), (0, hy - 0.23, hz - 0.055), 'cream', bevel=0.035, jit=0.02)
b.box((0.075, 0.045, 0.06), (0, hy - 0.345, hz - 0.02), 'ink')
for s in (-1, 1):
    b.ball(0.03, (s * 0.118, hy - 0.11, hz + 0.045), 'ink', sub=1)
    limb(b, (s * 0.1, hy + 0.08, hz + 0.09), (s * 0.135, hy + 0.1, hz + 0.3), 0.075, 0.012, 'dog_d', seg=4)
b.done('wdog_body', smooth=40, shade=(0.74, 1.08), under=0.25)
b = B()
tb = Vector((0, L / 2 - 0.03, zb + 0.12))
p1, p2, p3 = tb + Vector((0, 0.14, 0.2)), tb + Vector((0, 0.06, 0.4)), tb + Vector((0, -0.12, 0.42))
limb(b, tb, p1, 0.06, 0.07, 'dogc', seg=5, jit=0.04)
limb(b, p1, p2, 0.07, 0.065, 'dogc', seg=5, jit=0.04)
limb(b, p2, p3, 0.065, 0.03, 'cream', seg=5, jit=0.04)
b.done('wdog_tail', origin=tuple(tb), smooth=0, shade=(0.8, 1.08), under=0.15)
legs('wdog', W, L, leg, 0.07, 0.042, 'dogc', 'dog_d', (0.09, 0.13), leg + 0.02)

# 멧돼지: 어깨가 솟은 몸 · 쐐기 머리와 긴 주둥이 · 등줄기 갈기 · 엄니
L, W, H, leg = 1.3, 0.6, 0.62, 0.34
zb = leg + H / 2
b = B()
b.box((W, L, H), (0, 0, zb), 'boarc', bevel=0.2, bseg=2, jit=0.04, f=lambda v: Vector((v.x * (1 - 0.2 * v.y / L), v.y, v.z * (1 - 0.3 * v.y / L) + (0.08 if v.y < 0 and v.z > 0 else 0))))
b.ball(0.36, (0, -L / 2 + 0.3, zb + 0.14), 'boarc', sub=1, scale=(0.82, 1.0, 0.9), jit=0.05, f=wob(0.08, 111))
b.box((W * 0.7, L * 0.6, 0.12), (0, 0.05, leg + 0.04), 'boar_l', bevel=0.04, jit=0.03)
for i in range(6):      # 등줄기 갈기
    y = -L / 2 + 0.12 + i * 0.19
    b.cone(0.07, 0.01, 0.2 - i * 0.015, (0, y, zb + H / 2 + 0.16 - i * 0.03), 'boar_d', seg=4, rot=(0.35, 0, 0), jit=0.06)
hy, hz = -L / 2 - 0.16, zb + 0.0
b.box((0.46, 0.5, 0.46), (0, hy, hz), 'boarc', bevel=0.12, bseg=2, jit=0.03, f=lambda v: Vector((v.x * (1 + 0.5 * v.y), v.y, v.z * (1 + 0.55 * v.y) - 0.06 * (v.y < 0))))
b.box((0.22, 0.34, 0.2), (0, hy - 0.36, hz - 0.1), 'boar_d', bevel=0.05, jit=0.03)
b.cone(0.11, 0.11, 0.04, (0, hy - 0.54, hz - 0.1), 'snout', seg=7, rot=(PI / 2, 0, 0))
for s in (-1, 1):
    b.ball(0.03, (s * 0.17, hy - 0.12, hz + 0.1), 'ink', sub=1)
    limb(b, (s * 0.15, hy + 0.14, hz + 0.16), (s * 0.27, hy + 0.2, hz + 0.34), 0.09, 0.02, 'boar_d', seg=4)
    limb(b, (s * 0.1, hy - 0.4, hz - 0.16), (s * 0.15, hy - 0.44, hz - 0.03), 0.03, 0.008, 'tusk', seg=4)
limb(b, (0, L / 2 - 0.04, zb + 0.08), (0, L / 2 + 0.14, zb - 0.1), 0.03, 0.012, 'boar_d', seg=4)
b.done('wboar_body', smooth=40, shade=(0.72, 1.08), under=0.25)
legs('wboar', W, L, leg, 0.095, 0.055, 'boarc', 'boar_d', (0.12, 0.15), leg + 0.04)

# 새(참새 떼): 몸 + 날개 둘(어깨가 돌림 중심)
b = B()
b.ball(0.11, (0, 0, 0), 'bird', sub=1, scale=(0.85, 1.5, 0.85), jit=0.05)
b.ball(0.07, (0, 0.02, -0.03), 'bird_l', sub=1, scale=(0.8, 1.6, 0.7), jit=0.04)
b.ball(0.075, (0, -0.15, 0.06), 'bird_d', sub=1, jit=0.04)
b.cone(0.028, 0.004, 0.07, (0, -0.24, 0.05), 'beak', seg=4, rot=(PI / 2, 0, 0))
face(b, 'bird_d', [(-0.05, 0.12, 0.0), (0.05, 0.12, 0.0), (0.07, 0.3, 0.03), (-0.07, 0.3, 0.03)], (0, 0, 1), 1.0, 0.05)
b.done('wbird', smooth=0, shade=(0.8, 1.08), under=0.2)
for nm, s in (('wbird_wingL', -1), ('wbird_wingR', 1)):
    b = B()
    face(b, 'bird', [(s * 0.06, -0.08, 0.03), (s * 0.3, -0.03, 0.03), (s * 0.3, 0.07, 0.03), (s * 0.06, 0.12, 0.03)], (0, 0, 1), 1.0, 0.05)
    face(b, 'bird_d', [(s * 0.3, -0.03, 0.03), (s * 0.46, 0.06, 0.03), (s * 0.3, 0.07, 0.03)], (0, 0, 1), 1.0, 0.05)
    b.done(nm, origin=(s * 0.06, 0, 0.03), smooth=0, shade=(1.0, 1.0), under=0.0)

export('winter.glb')
for o in sorted(bpy.context.scene.objects, key=lambda o: o.name):
    me = o.data
    print('TRI', o.name, sum(len(p.vertices) - 2 for p in me.polygons), [round(v, 2) for v in o.dimensions])

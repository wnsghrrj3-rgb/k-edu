"""케이월드 「고인돌」(청동기) 장면에만 쓰는 모델 — dolmen.glb.
덮개돌(capstone) · 묶은 줄(cap_ropes) · 받침돌 둘(support_a/b) · 굴림대(roller) · 줄 마디(rope_seg, 길이 1 — 장면이 늘여 잇는다) · 줄 사리(rope_coil) · 흙 비탈(ramp, 높이 1 — 장면이 y 로 키운다)
무덤 언덕(mound, dolmen.js 의 groundH 와 같은 꼴) · 언덕 끌길(mound_track) · 채석 벼랑(quarry, SOLID 'cliff' 네모에 맞춤) · 뒤 벼랑(quarry_back)
목책(palisade_ring) · 도랑(ditch) — 둘 다 마을 가운데(44, 45)가 원점 · 둥근 집(bhut) · 긴 집(bhut_long) · 족장 집(chief_house) · 망루(watchtower) · 다락 곳간(granary_raised)
논 셋(paddy_gold · paddy_green · paddy_cut) · 밭(field_dry) · 새참 상(meal_table) · 밥 함지(meal_bowl) · 제단(altar) · 청동 검과 거울(bronze_set) · 흙더미(dirt_pile) · 흙 바구니(basket_earth)
족장 머리 장식(chief_crown — 사람 머리에 합친다) · 족장 차림(chief_gear) · 토기 무리(pots_set) · 볏단 말리는 걸이(drying_rack) · 화덕(hearth) · 선돌(menhir) · 돌 부스러기(chips) · 땅 얼룩(dpatch) · 먼 산(dhill) · 연기(dpuff)
좌표: 블렌더 x = three x, 블렌더 y = -three z, z 위. 앞(문) = -y. tint_wall(집 벽) · tint_c(땅 얼룩·먼 산·밭 작물) 는 장면이 색을 정한다. glow_* 는 스스로 빛난다."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_wall', 0xc8a878), ('tint_c', 0x7fc060),
             ('gran', 0x9c978e), ('gran_l', 0xb5afa3), ('gran_d', 0x7e7a72), ('gran_w', 0xcac2b2), ('moss', 0x7c9658), ('lichen', 0xa8a48c),
             ('rbark', 0x8a5a2b), ('rbark_d', 0x74481f), ('cut', 0xe2c492), ('cut_d', 0xb88c56),
             ('wood', 0x7a5632), ('wood_d', 0x57391f), ('wood_l', 0xb08a5a), ('wood_r', 0x8a4630), ('wattle', 0xa88454),
             ('rope', 0xdcc696), ('rope_d', 0xb89c68),
             ('earth', 0x9a7a50), ('earth_d', 0x7c5e3c), ('earth_l', 0xb49668), ('mud', 0xb89868), ('mud_d', 0x94764c),
             ('track', 0xc4a474), ('track_d', 0xb6966a), ('ditch_d', 0x5e4a34), ('ditch_w', 0x5f8fa0),
             ('mg', 0x7cb854), ('mg_d', 0x70ac4c), ('mg_l', 0x88be5c), ('me', 0xa88f60),
             ('thatch', 0xd9b25a), ('thatch_d', 0xb08a3e), ('thatch_l', 0xe8cc7a), ('dark', 0x2a2018),
             ('clay', 0xc89868), ('clay_d', 0xa87848), ('clay_r', 0xb8523a), ('rice', 0xf7f3e4), ('soot', 0x3a3028),
             ('bronze', 0xd8b04a), ('bronze_l', 0xf0d070), ('bronze_d', 0x9a7a2a), ('glow_bz', 0xfff0a8), ('glow_fire', 0xffa040),
             ('hide', 0xb07a44), ('hide_d', 0x8a5c34), ('fur', 0x6a4a34), ('fur_l', 0x9a7a5a), ('white', 0xf4efe2), ('ink', 0x2b2118), ('red', 0xc8402e), ('bone', 0xe6dcc4),
             ('water', 0x7ab0c8), ('water_d', 0x6aa0ba), ('paddy_mud', 0xa89060), ('gold', 0xe0b84a), ('gold_d', 0xc09a3a), ('green', 0x7ab84a), ('green_d', 0x5a9a3e), ('millet', 0xc8943a), ('straw', 0xd9b25a), ('straw_d', 0xb08a3e),
             ('cliff_a', 0xa08a70), ('cliff_b', 0x8f7a62), ('cliff_c', 0xb09a7c), ('cliff_l', 0xc2ad8c), ('cliff_d', 0x77654f), ('cmoss', 0x6f9a48), ('cmoss_d', 0x557a3a),
             ('smoke', 0xffffff)]:
    mat(n, c)


def sgnpow(v, p):
    return math.copysign(abs(v) ** p, v)


def hsh(*k):
    """정해진 흩뿌림: 같은 수를 넣으면 늘 같은 0~1."""
    h = 1469598103934665603
    for v in k:
        h = ((h ^ (int(v) & 0xffffffff)) * 1099511628211) % (1 << 64)
    h ^= h >> 29
    h = (h * 0xBF58476D1CE4E5B9) % (1 << 64)
    h ^= h >> 32
    return (h % 1000003) / 1000003.0


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
    if L < 1e-6:
        return
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


def put(b, pts, out, pick):
    """pick(가운데, 바깥 방향) → (재질, 밝기, 흩음) 으로 면 하나."""
    pts = [Vector(p) for p in pts]
    n = (pts[1] - pts[0]).cross(pts[2] - pts[0])
    if n.length < 1e-9:
        return
    n.normalize()
    if n.dot(Vector(out)) < 0:
        n = -n
    c = Vector((0, 0, 0))
    for p in pts:
        c += p
    c /= len(pts)
    m, tone, jit = pick(c, n)
    face(b, m, pts, n, tone, jit)


def mean(ring):
    c = Vector((0, 0, 0))
    for p in ring:
        c += p
    return c / len(ring)


def loft(b, rings, pick, caps=(True, True), split=True, seed=0):
    """고리들을 차례로 이어 덩어리를 만든다(면마다 따로 — 깎인 돌처럼 각이 선다)."""
    n = len(rings[0])
    for i in range(len(rings) - 1):
        ra, rb = rings[i], rings[i + 1]
        mid = (mean(ra) + mean(rb)) / 2
        for j in range(n):
            q = [ra[j], ra[(j + 1) % n], rb[(j + 1) % n], rb[j]]
            out = (q[0] + q[1] + q[2] + q[3]) / 4 - mid
            if not split:
                put(b, q, out, pick)
            elif hsh(i, j, seed, 77) < 0.5:
                put(b, [q[0], q[1], q[2]], out, pick); put(b, [q[0], q[2], q[3]], out, pick)
            else:
                put(b, [q[0], q[1], q[3]], out, pick); put(b, [q[1], q[2], q[3]], out, pick)
    for k, ring, nb in ((0, rings[0], rings[1]), (1, rings[-1], rings[-2])):
        if caps[k]:
            c = mean(ring)
            out = c - mean(nb)
            for j in range(n):
                put(b, [c, ring[j], ring[(j + 1) % n]], out, pick)


def stone_pick(seed, mats=('gran', 'gran_l', 'gran_d'), moss=0.3, cell=0.8):
    def pick(c, n):
        r = hsh(round(c.x * 37), round(c.y * 37), round(c.z * 37), seed)
        r2 = hsh(math.floor(c.x / cell), math.floor(c.y / cell), seed + 5)
        if n.z > 0.7 and r2 < moss:
            return ('lichen' if r < 0.55 else 'moss', 1.0, 0.06)
        if n.z < -0.5:
            return (mats[2], 0.9, 0.05)
        return (mats[0] if r < 0.55 else mats[1] if r < 0.8 else mats[2], 1.0, 0.08)
    return pick


def flat_pick(mats, seed=0, jit=0.06):
    def pick(c, n):
        r = hsh(round(c.x * 23), round(c.y * 23), seed)
        acc = 0
        for m, w in mats:
            acc += w
            if r < acc:
                return (m, 1.0, jit)
        return (mats[0][0], 1.0, jit)
    return pick


def rope_path(b, pts, r=0.06, seg=5):
    for k in range(len(pts) - 1):
        limb(b, pts[k], pts[k + 1], r, r, 'rope' if k % 2 else 'rope_d', seg=seg, jit=0.05)


def tier(b, rx0, ry0, z0, rx1, ry1, z1, m, m2=None, seg=14, rag=0.07, seed=0, p=1.0, tone=1.0, a0=0.0, cx=0.0, cy=0.0):
    """초가 한 켜: 아래 끝이 들쭉날쭉한 띠(둥근 집 p=1, 네모난 집은 p<1 로 모서리가 선다)."""
    def P(k, top):
        a = a0 + k * 2 * math.pi / seg
        ux, uy = sgnpow(math.cos(a), p), sgnpow(math.sin(a), p)
        if top:
            return Vector((cx + rx1 * ux, cy + ry1 * uy, z1))
        j = 1 + (hsh(k % seg, seed) - 0.5) * rag
        return Vector((cx + rx0 * ux * j, cy + ry0 * uy * j, z0 + (hsh(k % seg, seed + 1) - 0.5) * rag * 2.2))
    for k in range(seg):
        q = [P(k, 0), P(k + 1, 0), P(k + 1, 1), P(k, 1)]
        c = (q[0] + q[1] + q[2] + q[3]) / 4
        face(b, m if (m2 is None or hsh(k, seed + 2) < 0.68) else m2, q, Vector((c.x - cx, c.y - cy, 1.5)), tone, 0.1)


def pot(b, x, y, s=1.0, m='clay', z=0.0, seg=8, rice=False):
    """민무늬 토기: 납작한 바닥, 배가 부르고 아가리가 살짝 벌어진다."""
    b.lathe([(0.16 * s, 0), (0.3 * s, 0.16 * s), (0.36 * s, 0.42 * s), (0.3 * s, 0.66 * s), (0.27 * s, 0.74 * s), (0.31 * s, 0.82 * s)], (x, y, z), m, seg=seg, jit=0.06)
    b.cone(0.26 * s, 0.26 * s, 0.01, (x, y, z + 0.79 * s), 'rice' if rice else 'soot', seg=seg, jit=0.02)


def clump(b, x, y, h, m, m2=None, head=None, seed=0, n=2, lean=0.3, r=0.045):
    """벼·조 한 포기."""
    for i in range(n):
        a = hsh(seed, i, 1) * 6.28
        ln = lean * (0.4 + hsh(seed, i, 2))
        hh = h * (0.8 + 0.4 * hsh(seed, i, 3))
        p0 = Vector((x + math.cos(a) * 0.04, y + math.sin(a) * 0.04, 0.03))
        d = Vector((math.cos(a) * math.sin(ln), math.sin(a) * math.sin(ln), math.cos(ln)))
        p1 = p0 + d * hh
        limb(b, p0, p1, r, 0.012, m if (i % 2 == 0 or not m2) else m2, seg=3, cap=False, jit=0.12)
        if head:
            limb(b, p1 - d * 0.06, p1 + Vector((math.cos(a) * 0.16, math.sin(a) * 0.16, -0.1)), 0.04, 0.012, head, seg=3, cap=False, jit=0.1)


# ═════ 덮개돌: 납작하고 큰 너럭바위(가운데가 원점 — 장면이 굴림대 위·받침돌 위에 얹는다) ═════
CAPT = [-0.97, -0.88, -0.7, -0.48, -0.24, 0.0, 0.24, 0.48, 0.7, 0.88, 0.97]
CAPN = 12


def cap_pt(i, j, off=0.0):
    t = CAPT[i]
    a = (j % CAPN) * 2 * math.pi / CAPN
    yc = 0.1 * math.sin(1.7 * t + 0.4)
    wy = 1.85 * (1 - abs(t) ** 3.2) ** 0.55 * (1 + 0.06 * math.sin(3.1 * t + 1.0))
    top = (0.74 - 0.2 * t * t + 0.07 * math.sin(2.3 * t + 2.0)) * (1 - 0.45 * abs(t) ** 4)
    bot = 0.56 * (1 - 0.3 * abs(t) ** 5)
    c, s = math.cos(a), math.sin(a)
    x = 2.62 * t
    if s >= -1e-6:
        y = wy * sgnpow(c, 0.8) * (1 + (hsh(i, j, 3) - 0.5) * 0.1)
        z = top * sgnpow(max(0.0, s), 0.85)
        if s > 0.3:
            z += 0.17 * math.exp(-((x - 0.5) / 1.1) ** 2 - ((y + 0.2) / 0.8) ** 2) * s
            z *= 1 + (hsh(i, j, 4) - 0.5) * 0.14
    else:   # 바닥은 평평하다(굴림대·받침돌에 얹힌다)
        y = wy * sgnpow(c, 0.5) * (1 + (hsh(i, j, 3) - 0.5) * 0.04)
        z = -bot * min(1.0, -s * 3) ** 0.5
    if off:
        l = math.hypot(y, z) or 1
        y += y / l * off
        z += z / l * off
    return Vector((x, yc + y, z))


b = B()
loft(b, [[cap_pt(i, j) for j in range(CAPN)] for i in range(len(CAPT))], stone_pick(1, moss=0.1, cell=1.3), seed=1)
b.done('capstone', smooth=0, shade=(0.66, 1.1), under=0.35)

# 덮개돌을 묶은 줄: 허리 두 군데 · 등줄 · 남쪽 옆줄(옆줄 매듭에 아이가 잡는 줄이 달린다) · 앞 매듭(끄는 줄이 달린다)
b = B()
for i in (3, 7):
    rope_path(b, [cap_pt(i, j, 0.055) for j in range(CAPN + 1)], 0.062)
rope_path(b, [cap_pt(i, 3, 0.055) for i in range(3, 11)] + [Vector((2.62, 0.02, 0.26)), Vector((2.7, 0.0, -0.1))], 0.058)
rope_path(b, [cap_pt(i, 6, 0.055) for i in range(3, 8)], 0.058)
KNOT_SIDE = cap_pt(5, 6, 0.1)
b.ball(0.12, tuple(KNOT_SIDE), 'rope_d', sub=1, jit=0.06)
b.ball(0.14, (2.7, 0.0, -0.12), 'rope_d', sub=1, jit=0.06)
for i in (3, 7):
    b.ball(0.1, tuple(cap_pt(i, 3, 0.07)), 'rope', sub=1, jit=0.06)
b.done('cap_ropes', smooth=0, shade=(0.8, 1.06), under=0.2)
print('KNOT_SIDE', tuple(KNOT_SIDE))


# ═════ 받침돌: 세워 놓은 넓적한 돌(바닥 가운데가 원점, 위는 평평 — 높이 1.7) + 굄돌 ═════
def support(b, seed, lean, oy, flip):
    zs = [-0.5, 0.0, 0.45, 0.9, 1.3, 1.58, 1.7]
    rings = []
    for i, z in enumerate(zs):
        zz = max(0.0, z)
        topk = 0.9 if i == len(zs) - 1 else 1.0
        hx = 1.36 * (1 - 0.14 * zz / 1.7) * topk
        hy = 0.4 * (1 - 0.22 * zz / 1.7) * topk
        ring = []
        for j in range(10):
            a = j * 2 * math.pi / 10 + 0.31
            kk = 1 + (hsh(i, j, seed) - 0.5) * 0.1
            ring.append(Vector((flip * (hx * sgnpow(math.cos(a), 0.45) * kk + lean * zz), oy + flip * hy * sgnpow(math.sin(a), 0.6) * kk, z)))
        rings.append(ring)
    loft(b, rings, stone_pick(seed, moss=0.12, cell=0.9), caps=(False, True), seed=seed)
    rr = random.Random(seed)
    for k in range(7):
        x = -1.35 + k * 0.45 + rr.uniform(-0.1, 0.1)
        sy = 1 if k % 2 else -1
        r = 0.16 + rr.random() * 0.1
        b.ball(r, (flip * x, oy + flip * sy * (0.5 + rr.random() * 0.12), r * 0.3), 'gran_d' if k % 3 else 'gran', sub=1, scale=(1.3, 1.0, 0.75), jit=0.1, f=wob(0.16, seed * 10 + k))


b = B()
support(b, 21, 0.03, 1.5, 1)      # three z -1.5 (북쪽)
support(b, 22, -0.025, -1.5, -1)  # three z +1.5 (남쪽, 반 바퀴)
b.done('supports', smooth=0, shade=(0.7, 1.08), under=0.3)

# ═════ 굴림대: 껍질이 군데군데 벗겨진 통나무(길이 3.6 = three z, 가운데가 원점). 벗겨진 자리와 옹이로 구르는 것이 보인다 ═════
b = B()
rings = []
for i, y in enumerate([-1.8, -1.1, -0.35, 0.4, 1.15, 1.8]):
    r = 0.28 * (1 + (hsh(i, 0, 9) - 0.5) * 0.08)
    cx, cz = 0.018 * math.sin(i * 1.3), 0.018 * math.cos(i * 1.7)
    rings.append([Vector((cx + r * math.cos(j * math.pi / 4), y, cz + r * math.sin(j * math.pi / 4))) for j in range(8)])


def bark_pick(c, n):
    if abs(n.y) > 0.9:
        return ('cut', 1.0, 0.03)
    a = math.atan2(c.z, c.x)
    if (0.3 < a < 1.3 and -1.0 < c.y < 0.3) or (-2.6 < a < -1.9 and 0.5 < c.y < 1.5):
        return ('wood_l', 1.0, 0.05)
    return ('rbark' if hsh(round(c.y * 5), round(a * 3), 2) < 0.62 else 'rbark_d', 1.0, 0.08)


loft(b, rings, bark_pick, split=False)
for s in (-1, 1):
    b.cone(0.17, 0.17, 0.012, (0, s * 1.803, 0), 'cut_d', seg=8, rot=(math.pi / 2, 0, 0), jit=0.03)
    b.cone(0.07, 0.07, 0.012, (0.01, s * 1.808, 0.01), 'cut', seg=6, rot=(math.pi / 2, 0, 0), jit=0.03)
for a, y in ((2.2, 0.8), (-0.6, -0.9), (4.0, -0.2)):
    limb(b, (math.cos(a) * 0.24, y, math.sin(a) * 0.24), (math.cos(a) * 0.36, y + 0.03, math.sin(a) * 0.36), 0.07, 0.045, 'rbark_d', seg=5, jit=0.06)
b.done('roller', smooth=0, shade=(0.9, 1.03), under=0.1)

# ═════ 줄 마디(x 로 0→1, 꼬인 두 가닥 빛) · 줄 사리 ═════
b = B()
for i in range(3):
    for j in range(6):
        def P(u, v):
            a = v * math.pi / 3 + u * math.pi * 2 / 9
            return Vector((u / 3, math.cos(a) * 0.058, math.sin(a) * 0.058))
        q = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)]
        c = (q[0] + q[1] + q[2] + q[3]) / 4
        face(b, 'rope' if j % 2 else 'rope_d', q, Vector((0, c.y, c.z)), 1.0, 0.04)
b.done('rope_seg', smooth=0, shade=(0.86, 1.05), under=0.15)
b = B()
pts = []
for k in range(22):
    a = k * 0.62
    r = 0.36 - k * 0.006
    pts.append(Vector((math.cos(a) * r, math.sin(a) * r, 0.06 + k * 0.007)))
rope_path(b, pts, 0.055, seg=4)
rope_path(b, [pts[0], Vector((0.62, -0.1, 0.05)), Vector((0.9, 0.12, 0.05))], 0.055, seg=4)
b.done('rope_coil', smooth=0, shade=(0.86, 1.05), under=0.1)


# ═════ 흙 비탈: 받침돌 사이를 메우고 서쪽으로 흘러내린 흙(높이 1 — 장면이 y 로 0→1.6 키운다). 바닥 가운데가 원점, x -2.5~2.5 ═════
def ramp_h(x):
    if x <= -2.5:
        return 0.0
    if x < -0.2:
        t = (x + 2.5) / 2.3
        return t * t * (3 - 2 * t)
    return 1.0


def ramp_w(x):
    if x >= -0.1:
        return 1.15
    t = (-0.1 - x) / 2.4
    return 1.15 + 0.7 * math.sqrt(max(0.0, 1 - (2 * t - 1) ** 2))


b = B()
RX = [-2.5, -2.1, -1.7, -1.3, -0.9, -0.5, -0.1, 0.4, 1.0, 1.6, 2.2, 2.5]
RV = [0.0, 0.1, 0.27, 0.42, 0.58, 0.73, 0.9, 1.0]


def ramp_pt(i, j):
    x = RX[i]
    w = ramp_w(x)
    v = RV[j]
    edge = j in (0, len(RV) - 1)
    if not edge and j in (1, len(RV) - 2):
        y = (1 if v > 0.5 else -1) * w * (0.95 if x >= -0.1 else 0.72)
    else:
        y = (v * 2 - 1) * w
    z = 0.0 if (edge or i == 0 or i == len(RX) - 1) else ramp_h(x) * (0.9 + 0.14 * hsh(i, j, 31))
    return Vector((x + (hsh(i, j, 32) - 0.5) * 0.12, y + (hsh(i, j, 33) - 0.5) * 0.06, z))


pk = flat_pick([('earth', 0.5), ('earth_d', 0.27), ('earth_l', 0.23)], 5, 0.08)
for i in range(len(RX) - 1):
    for j in range(len(RV) - 1):
        q = [ramp_pt(i, j), ramp_pt(i + 1, j), ramp_pt(i + 1, j + 1), ramp_pt(i, j + 1)]
        up = Vector((0, 0, 1)) + ((q[0] + q[2]) / 2 - Vector((0, 0, 0.5))) * 0.2
        if hsh(i, j, 34) < 0.5:
            put(b, [q[0], q[1], q[2]], up, pk); put(b, [q[0], q[2], q[3]], up, pk)
        else:
            put(b, [q[0], q[1], q[3]], up, pk); put(b, [q[1], q[2], q[3]], up, pk)
for k, (x, y, r) in enumerate([(-1.4, 0.7, 0.13), (-0.8, -0.9, 0.11), (0.6, 0.3, 0.1), (1.7, -0.5, 0.12), (-1.9, -0.2, 0.1)]):
    b.ball(r, (x, y, ramp_h(x) * 0.93), 'gran' if k % 2 else 'gran_d', sub=1, scale=(1.2, 1, 0.5), jit=0.1)
b.done('ramp', smooth=0, shade=(0.84, 1.06), under=0.0)


# ═════ 무덤 언덕: dolmen.js 의 groundH 와 똑같은 꼴(마루 반지름 4 · 높이 2.2 · 자락 반지름 11.5). 가운데가 원점 ═════
def gh(x, y):
    return 2.2 * max(0.0, min(1.0, (11.5 - math.hypot(x, y)) / 7.5))


b = B()
MR = [(0.0, 2.2), (2.0, 2.2), (4.0, 2.2), (5.875, 1.65), (7.75, 1.1), (9.625, 0.55), (11.5, 0.0), (12.9, -0.14)]
MSEG = 32


def mpt(i, k):
    a = (k % MSEG) * 2 * math.pi / MSEG + (0.5 * math.pi / MSEG if i % 2 else 0)
    r, z = MR[i]
    if i == len(MR) - 1:
        r *= 1 + (hsh(k % MSEG, 41) - 0.5) * 0.12
    return Vector((math.cos(a) * r, math.sin(a) * r, z))


def mound_pick(i):
    def pick(c, n):
        r = hsh(round(c.x * 9), round(c.y * 9), 43)
        if i == 0:
            return ('me' if r < 0.55 else 'mg_l', 1.0, 0.04)
        if i == 1:
            return ('mg_l' if r < 0.45 else 'me' if r < 0.55 else 'mg', 1.0, 0.04)
        if i == len(MR) - 2:
            return ('mg_d' if r < 0.6 else 'mg', 1.0, 0.04)
        return ('mg' if r < 0.6 else 'mg_d' if r < 0.85 else 'mg_l', 1.0, 0.04)
    return pick


for i in range(len(MR) - 1):
    pk = mound_pick(i)
    for k in range(MSEG):
        if i == 0:
            put(b, [Vector((0, 0, 2.2)), mpt(1, k), mpt(1, k + 1)], (0, 0, 1), pk)
        else:
            q = [mpt(i, k), mpt(i, k + 1), mpt(i + 1, k + 1), mpt(i + 1, k)]
            if i % 2:
                put(b, [q[0], q[1], q[3]], (0, 0, 1), pk); put(b, [q[1], q[2], q[3]], (0, 0, 1), pk)
            else:
                put(b, [q[0], q[1], q[2]], (0, 0, 1), pk); put(b, [q[0], q[2], q[3]], (0, 0, 1), pk)
# 언덕 끌길: 서쪽 비탈을 타고 오르는 흙길(언덕 꼴을 그대로 따라 4cm 위에 깔린다) — 언덕과 한 덩이
TX = [-12.1 + k * 0.72 for k in range(12)]
TY = [-2.25, -1.5, -0.75, 0.0, 0.75, 1.5, 2.25]


def tpt(i, j):
    x, y = TX[i], TY[j]
    if j in (0, 6):
        y *= 1 + (hsh(i, j, 51) - 0.5) * 0.28
    if i == 11:
        x += (hsh(j, 52) - 0.5) * 0.5
    return Vector((x, y, gh(x, y) + 0.04))


for i in range(11):
    for j in range(6):
        q = [tpt(i, j), tpt(i + 1, j), tpt(i + 1, j + 1), tpt(i, j + 1)]
        face(b, 'track_d' if hsh(i, j, 53) < 0.3 else 'track', q, (0, 0, 1), 1.0, 0.04)
b.done('mound', smooth=0, shade=(0.92, 1.03), under=0.0)


# ═════ 채석 벼랑: 장면 좌표 그대로(three x = 블렌더 x, three z = -블렌더 y). SOLID [0, 8, 9, 40] 을 채운다 ═════
def crag(b, x0, z0, x1, z1, h, seed, step=1.9, mats=('cliff_a', 'cliff_l', 'cliff_b', 'cliff_l', 'cliff_c')):
    rr = random.Random(seed)
    w, d = x1 - x0, z1 - z0
    s = min(1.0, min(w, d) / 5.0)
    half = min(w, d) / 2 * 0.985
    per = []
    for ax, az, bx, bz in ((x0, z0, x1, z0), (x1, z0, x1, z1), (x1, z1, x0, z1), (x0, z1, x0, z0)):
        n = max(2, round(math.hypot(bx - ax, bz - az) / step))
        for i in range(n):
            t = (i + (rr.random() - 0.5) * 0.5 if i else 0) / n
            per.append((ax + (bx - ax) * t, az + (bz - az) * t))
    cols = []
    for px, pz in per:
        qx, qz = min(max(px, x0 + half), x1 - half), min(max(pz, z0 + half), z1 - half)
        ix, iz = qx - px, qz - pz
        il = math.hypot(ix, iz) or 1
        ix, iz = ix / il, iz / il
        c = rr.uniform(-0.15, 0.35)
        ins, zs = [0.03 + rr.uniform(0, 0.28) * s], [-0.3]
        ins.append(max(0.02, (0.14 + c * 0.6) * s + rr.uniform(-0.06, 0.12))); zs.append(h * (0.33 + rr.uniform(-0.07, 0.07)))
        ins.append(ins[-1] + (0.3 + rr.uniform(0, 0.25)) * s); zs.append(zs[-1] + rr.uniform(0.0, 0.12))
        ins.append(ins[-1] + (0.08 + c * 0.3) * s + rr.uniform(-0.04, 0.12)); zs.append(h * (0.68 + rr.uniform(-0.07, 0.07)))
        ins.append(ins[-1] + (0.26 + rr.uniform(0, 0.22)) * s); zs.append(zs[-1] + rr.uniform(0.0, 0.1))
        ins.append(ins[-1] + (0.06 + rr.uniform(0, 0.14)) * s); zs.append(h - 0.1 + rr.uniform(-0.12, 0.06))
        ins.append(ins[-1] - 0.18); zs.append(zs[-1] - 0.03)
        ins.append(ins[-1] + 0.06); zs.append(h + 0.2)
        ins.append(ins[-1] + min(0.5, il * 0.4)); zs.append(h + 0.27)
        ring = []
        for k, (t, z) in enumerate(zip(ins, zs)):
            j = rr.uniform(-0.22, 0.22) if 0 < k < 6 else 0
            ring.append(Vector((px + ix * t - iz * j, -(pz + iz * t + ix * j), z)))
        ring.append(Vector((qx, -qz, h + 0.3)))
        cols.append((ring, Vector((-ix, iz, 0))))
    BAND = [(mats[0], 0.95, 0), (mats[1], 1.0, 1), (mats[2], 1.0, 0), (mats[3], 1.03, 1), (mats[4], 1.04, 0), ('cmoss_d', 0.9, -1), ('cmoss', 1.0, 0), ('cmoss', 1.04, 1), ('cmoss', 1.06, 1)]
    N = len(cols)
    for i in range(N):
        (ra, oa), (rb, ob) = cols[i], cols[(i + 1) % N]
        for k, (m, tone, up) in enumerate(BAND):
            out = Vector((0, 0, up)) if up else (oa + ob + Vector((0, 0, 0.3)))
            if up == 0 and k < 5 and rr.random() < 0.16:
                m = ('cliff_a', 'cliff_b', 'cliff_c', 'cliff_d')[rr.randrange(4)]
            q = [ra[k], rb[k], rb[k + 1], ra[k + 1]]
            if (q[2] - q[3]).length < 1e-4:
                face(b, m, q[:3], out, tone, 0.03 if k >= 5 else 0.1)
            elif k >= 5 or up:
                face(b, m, q, out, tone, 0.035)
            elif rr.random() < 0.5:
                face(b, m, [q[0], q[1], q[2]], out, tone, 0.1); face(b, m, [q[0], q[2], q[3]], out, tone, 0.1)
            else:
                face(b, m, [q[0], q[1], q[3]], out, tone, 0.1); face(b, m, [q[1], q[2], q[3]], out, tone, 0.1)


b = B()
crag(b, 0, 8, 5.9, 40, 6, 1)                 # 뒤 덩이(벼랑 마루)
crag(b, 5.0, 8, 7.5, 21.2, 4.6, 2)           # 앞 덩이 — 북쪽
crag(b, 5.0, 26.8, 7.5, 40, 4.9, 3)          # 앞 덩이 — 남쪽 (사이 = 덮개돌을 떼어 낸 자리)
rr = random.Random(5)
# 떼어 낸 자리: 갓 드러난 밝은 돌 바닥과 벽 · 떼다 만 돌 · 쐐기 구멍 줄
b.box((3.4, 5.4, 0.16), (7.3, -24.0, 0.06), 'gran_w', bevel=0.04, jit=0.06)
b.box((0.5, 5.3, 2.4), (5.75, -24.0, 1.2), 'gran_w', bevel=0.08, jit=0.1, f=wob(0.03, 61))
b.box((1.9, 1.3, 0.8), (6.9, -22.3, 0.5), 'gran_l', bevel=0.08, jit=0.1, rot=(0, 0.0, 0.12), f=wob(0.05, 62))
b.box((1.3, 1.0, 0.55), (7.0, -25.7, 0.38), 'gran_w', bevel=0.07, jit=0.1, rot=(0, 0.06, -0.2), f=wob(0.05, 63))
for k in range(5):
    b.box((0.09, 0.2, 0.2), (6.02, -22.4 - k * 0.8, 2.3), 'wood_d', rot=(0, 0.3, 0), jit=0.05)
# 깎아 낸 단(벼랑 앞 x 7~9): 네모나게 떼어 낸 돌이 층층이
for z0, z1 in ((8.3, 21.2), (26.8, 39.7)):
    z = z0
    while z < z1 - 0.9:
        d = min(z1 - z, 1.7 + rr.random() * 1.2)
        h1 = 0.8 + rr.random() * 0.75
        xf = 9.0 - rr.random() * 0.3
        b.box((xf - 6.9, d - 0.06, h1), ((xf + 6.9) / 2, -(z + d / 2), h1 / 2), 'gran_w' if rr.random() < 0.45 else 'gran_l', bevel=0.07, jit=0.1, f=wob(0.035, int(z * 10)))
        if rr.random() < 0.75:
            h2 = h1 + 0.8 + rr.random() * 0.9
            xb = 7.7 + rr.random() * 0.5
            b.box((xb - 6.3, d - 0.1, h2), ((xb + 6.3) / 2, -(z + d / 2), h2 / 2), 'gran' if rr.random() < 0.5 else 'gran_l', bevel=0.07, jit=0.1, f=wob(0.035, int(z * 10) + 1))
        if rr.random() < 0.5:   # 쐐기 줄(나무 쐐기를 박아 물을 부어 쪼갠다)
            for k in range(int(d / 0.45)):
                b.box((0.1, 0.1, 0.16), (xf - 0.35, -(z + 0.25 + k * 0.45), h1 + 0.03), 'wood_d', rot=(0, 0.25, 0), jit=0.05)
        z += d
# 지렛대 통나무 둘 · 밧줄 사리
limb(b, (9.25, -19.2, 0.05), (8.1, -18.6, 2.3), 0.09, 0.07, 'wood', seg=6, jit=0.06)
limb(b, (9.3, -29.6, 0.05), (8.2, -30.3, 2.0), 0.09, 0.07, 'wood_d', seg=6, jit=0.06)
b.done('quarry', smooth=0, shade=(0.62, 1.08), under=0.3)

b = B()
crag(b, -21, -18, 1.2, 64, 9.5, 12, step=3.4)        # 서쪽으로 이어진 벼랑(놀이판 밖)
crag(b, -40, -30, -14, 76, 15, 13, step=4.5)
crag(b, 0.4, -9, 13.5, 8.3, 4.6, 14, step=2.4)       # 북서 모퉁이
crag(b, -3, 39.7, 3.6, 60, 3.0, 15, step=2.4)        # 남서 턱
b.done('quarry_back', smooth=0, shade=(0.6, 1.08), under=0.3)


# ═════ 목책: 마을 가운데(44, 45)가 원점. 타원(8.5 × 5.6)을 따라 끝을 깎은 통나무 · 북쪽에 어귀(문) ═════
def ell(a, rx, rz):
    return Vector((math.cos(a) * rx, -math.sin(a) * rz, 0))


GATE = (4.30, 4.97)
b = B()
a = 0.0
k = 0
posts = []
while a < 2 * math.pi - 0.02:
    if not (GATE[0] - 0.03 < a < GATE[1] + 0.03):
        posts.append(a)
    a += 0.43 / math.hypot(8.5 * math.sin(a), 5.6 * math.cos(a))
for k, a in enumerate(posts):
    p = ell(a, 8.5, 5.6)
    hh = 2.15 + hsh(k, 71) * 0.5
    lx, ly = (hsh(k, 72) - 0.5) * 0.07, (hsh(k, 73) - 0.5) * 0.07
    m = ('wood', 'wood_d', 'wood', 'wood_r')[k % 4] if hsh(k, 74) < 0.85 else 'wood_l'
    limb(b, (p.x, p.y, -0.05), (p.x + lx * hh, p.y + ly * hh, hh), 0.17, 0.14, m, seg=6, cap=False, jit=0.1)
    limb(b, (p.x + lx * hh, p.y + ly * hh, hh), (p.x + lx * (hh + 0.36), p.y + ly * (hh + 0.36), hh + 0.36), 0.14, 0.015, 'cut' if hsh(k, 75) < 0.5 else 'wood_l', seg=6, cap=False, jit=0.08)
for z, r in ((1.55, 0.06), (0.72, 0.06)):   # 가로로 엮은 띠
    prev = None
    for k, a in enumerate(posts):
        if k % 3 and k != len(posts) - 1:
            continue
        p = ell(a, 8.5 + 0.2, 5.6 + 0.2) + Vector((0, 0, z + (hsh(k, 76) - 0.5) * 0.08))
        if prev is not None and not (prev[1] < GATE[0] and a > GATE[1]):
            limb(b, prev[0], p, r, r, 'wood_d', seg=4, cap=False, jit=0.06)
        prev = (p, a)
# 어귀: 굵은 기둥 둘 · 가로 통나무 · 나무 새 · 안으로 열어 둔 사립문
g0, g1 = ell(GATE[0], 8.5, 5.6), ell(GATE[1], 8.5, 5.6)
for g in (g0, g1):
    limb(b, (g.x, g.y, -0.05), (g.x, g.y, 3.35), 0.27, 0.22, 'wood_d', seg=7, jit=0.08)
    limb(b, (g.x, g.y, 3.35), (g.x, g.y, 3.75), 0.22, 0.03, 'cut', seg=7, cap=False, jit=0.06)
    for z in (2.72, 2.84):
        b.cone(0.26, 0.26, 0.07, (g.x, g.y, z), 'rope', seg=7, jit=0.05)
dg = (g1 - g0).normalized()
limb(b, g0 - dg * 0.7 + Vector((0, -0.02, 3.0)), g1 + dg * 0.7 + Vector((0, -0.02, 3.0)), 0.17, 0.15, 'wood', seg=7, jit=0.08)
limb(b, g0 - dg * 0.4 + Vector((0, 0.0, 2.55)), g1 + dg * 0.4 + Vector((0, 0.0, 2.55)), 0.1, 0.1, 'wood_d', seg=6, jit=0.08)
for t, s in ((0.3, 1), (0.68, -1)):   # 가로대에 앉은 나무 새(솟대의 새)
    c = g0 + (g1 - g0) * t + Vector((0, 0, 3.17))
    b.ball(0.16, (c.x, c.y, c.z + 0.1), 'wood_l', sub=1, scale=(1.7, 0.8, 0.8), rot=(0, 0, math.atan2(dg.y, dg.x)), jit=0.06)
    hd = c + dg * 0.24 * s + Vector((0, 0, 0.26))
    limb(b, c + dg * 0.14 * s + Vector((0, 0, 0.12)), hd, 0.07, 0.05, 'wood_l', seg=5, jit=0.05)
    b.ball(0.085, tuple(hd), 'wood_l', sub=1, jit=0.05)
    limb(b, hd, hd + dg * 0.2 * s + Vector((0, 0, -0.03)), 0.035, 0.008, 'wood_d', seg=4)
    limb(b, c - dg * 0.2 * s + Vector((0, 0, 0.12)), c - dg * 0.5 * s + Vector((0, 0, 0.22)), 0.09, 0.02, 'wood', seg=4)
inn = Vector((0.25, -1, 0)).normalized()   # 마을 안쪽(남쪽)
for g, s in ((g0, 1), (g1, -1)):
    e0 = g + dg * 0.3 * s
    dirv = (inn + dg * 0.35 * s).normalized()
    e1 = e0 + dirv * 2.3
    for z in (0.35, 1.0, 1.7):
        limb(b, e0 + Vector((0, 0, z)), e1 + Vector((0, 0, z)), 0.05, 0.05, 'wood_d', seg=4, cap=False)
    for i in range(9):
        p = e0 + dirv * (0.12 + i * 0.26)
        limb(b, p + Vector((0, 0, 0.12)), p + Vector((0, 0, 1.9 + (i % 3) * 0.07)), 0.04, 0.03, 'wattle' if i % 2 else 'wood_l', seg=4, cap=False, jit=0.08)
b.done('palisade_ring', smooth=0, shade=(0.7, 1.08), under=0.25)

# 도랑(환호): 목책 밖을 두른 얕은 도랑 — 바깥 턱 · 젖은 바닥(군데군데 물) · 안쪽 둑. 어귀 앞은 흙다리로 남긴다
b = B()
DG = (4.39, 4.96)
PROF = [(0.78, 0.0), (0.5, 0.1), (0.3, 0.035), (-0.3, 0.035), (-0.52, 0.17), (-0.82, 0.0)]
angs = []
a = DG[1]
while a < DG[0] + 2 * math.pi:
    angs.append(a)
    a += 1.15 / math.hypot(9.75 * math.sin(a), 6.75 * math.cos(a))
angs.append(DG[0] + 2 * math.pi)


def dpt(i, k):
    a = angs[i]
    o, z = PROF[k]
    end = 1.0 if 0 < i < len(angs) - 1 else 0.0
    if not end:
        z = 0.0 if k in (0, 5) else 0.03
    c = ell(a, 9.75, 6.75)
    nx, ny = math.cos(a) / 9.75, -math.sin(a) / 6.75
    nl = math.hypot(nx, ny)
    o *= 1 + (hsh(i, k, 81) - 0.5) * 0.25
    return Vector((c.x + nx / nl * o, c.y + ny / nl * o, z))


DM = [('earth_l', 'earth'), ('earth_d', 'earth'), ('ditch_d', 'ditch_d'), ('earth_d', 'earth'), ('earth', 'earth_l')]
for i in range(len(angs) - 1):
    wet = hsh(i // 3, 82) < 0.45
    for k in range(5):
        m = DM[k][0] if hsh(i, k, 83) < 0.6 else DM[k][1]
        if k == 2 and wet:
            m = 'ditch_w'
        face(b, m, [dpt(i, k), dpt(i + 1, k), dpt(i + 1, k + 1), dpt(i, k + 1)], (0, 0, 1), 1.0, 0.06)
b.done('ditch', smooth=0, shade=(1.0, 1.0), under=0.0)


# ═════ 집: 둥근 집(송국리식) · 긴 집 · 족장 집 — 앞(문) = -y ═════
def door(b, x, y, w=0.7, h=0.95, post='wood', deep=0.5):
    b.box((w + 0.36, deep, h + 0.12), (x, y + deep / 2 - 0.02, (h + 0.12) / 2), 'tint_wall', jit=0.06, f=lambda v: Vector((v.x * (1 - 0.18 * (v.z + 0.5)), v.y, v.z)))
    b.box((w, 0.08, h), (x, y - 0.04, h / 2 + 0.02), 'dark')
    for s in (-1, 1):
        b.box((0.11, 0.13, h + 0.1), (x + s * (w / 2 + 0.05), y - 0.06, (h + 0.1) / 2), post, rot=(0, -s * 0.07, 0), jit=0.06)
    b.box((w + 0.44, 0.15, 0.12), (x, y - 0.06, h + 0.1), post, jit=0.06)


def round_hut(name, R=2.0, wh=1.0, seed=1):
    b = B()
    b.cone(R + 0.35, R + 0.3, 0.12, (0, 0, 0.05), 'mud_d', seg=14, jit=0.07)
    b.cone(R, R, wh, (0, 0, wh / 2 + 0.08), 'tint_wall', seg=14, cap=False, jit=0.08)
    for k in range(9):
        a = -math.pi / 2 + (k + 0.5) * 2 * math.pi / 9
        if abs(math.cos(a)) < 0.3 and math.sin(a) < 0:
            continue
        b.cone(0.08, 0.07, wh + 0.1, (math.cos(a) * (R + 0.02), math.sin(a) * (R + 0.02), wh / 2 + 0.08), 'wood' if k % 2 else 'wood_d', seg=5, cap=False, jit=0.06)
    b.cone(R + 0.62, R + 0.62, 0.03, (0, 0, wh - 0.04), 'dark', seg=14)
    tier(b, R + 0.78, R + 0.78, wh - 0.2, R - 0.12, R - 0.12, wh + 0.72, 'thatch', 'thatch_l', seg=14, seed=seed, rag=0.08)
    tier(b, R + 0.02, R + 0.02, wh + 0.56, R * 0.52, R * 0.52, wh + 1.5, 'thatch_d', 'thatch', seg=14, seed=seed + 3, rag=0.09, a0=0.22)
    tier(b, R * 0.6, R * 0.6, wh + 1.36, 0.2, 0.2, wh + 2.25, 'thatch', 'thatch_l', seg=12, seed=seed + 6, rag=0.1)
    b.cone(0.3, 0.15, 0.3, (0, 0, wh + 2.28), 'thatch_d', seg=8, jit=0.08)
    b.cone(0.22, 0.22, 0.06, (0, 0, wh + 2.2), 'rope', seg=8, jit=0.04)
    for k in range(5):
        a = k * 1.26 + seed
        limb(b, (math.cos(a) * 0.1, math.sin(a) * 0.1, wh + 2.3), (math.cos(a) * 0.3, math.sin(a) * 0.3, wh + 2.85), 0.035, 0.02, 'wood_d', seg=4, cap=False)
    door(b, 0, -R - 0.42)
    b.prism([(-0.72, 1.05), (0.72, 1.05), (0.0, 1.62)], 0.95, (0, -R - 0.12, 0), 'thatch_d', jit=0.1)
    pot(b, 1.05, -R - 0.42, 0.75, 'clay')
    pot(b, 1.5, -R - 0.12, 0.5, 'clay_r')
    for i, (x, z) in enumerate([(-1.2, 0.1), (-1.44, 0.1), (-1.32, 0.3)]):
        b.cone(0.11, 0.11, 0.7, (x, -R - 0.3, z), 'rbark' if i % 2 else 'wood', seg=5, rot=(math.pi / 2, 0, 0.3), jit=0.08)
    b.done(name, smooth=0, shade=(0.68, 1.1), under=0.3)


round_hut('bhut', 2.0, 1.0, 1)


def long_house(name, w, d, wh, rh, seed=1, chief=False):
    b = B()
    post = 'wood_r' if chief else 'wood'
    if chief:
        for k in range(18):   # 돌 기단
            a = k * 2 * math.pi / 18
            b.ball(0.3, (sgnpow(math.cos(a), 0.5) * (w / 2 + 0.2), sgnpow(math.sin(a), 0.5) * (d / 2 + 0.2), 0.1), 'gran' if k % 2 else 'gran_d', sub=1, scale=(1.3, 1.3, 0.7), jit=0.1, f=wob(0.14, 90 + k))
    b.box((w + 0.3, d + 0.3, 0.14), (0, 0, 0.07), 'mud_d', bevel=0.05, jit=0.06)
    b.box((w, d, wh), (0, 0, wh / 2 + 0.1), 'tint_wall', bevel=0.12, jit=0.08)
    nx = 5 if w > 4.4 else 4
    for i in range(nx):
        x = -w / 2 + 0.12 + i * (w - 0.24) / (nx - 1)
        for s in (-1, 1):
            b.cone(0.085, 0.075, wh + 0.1, (x, s * (d / 2 + 0.01), wh / 2 + 0.1), post if i % 2 == 0 else 'wood_d', seg=5, cap=False, jit=0.06)
    for s in (-1, 1):
        b.cone(0.085, 0.075, wh + 0.1, (s * (w / 2 + 0.01), 0, wh / 2 + 0.1), 'wood_d', seg=5, cap=False, jit=0.06)
    ov = 0.58 if chief else 0.5
    rl = max(0.5, (w - d) / 2 + 0.45)      # 용마루 반 길이
    tier(b, w / 2 + ov, d / 2 + ov, wh - 0.18, w / 2 - 0.35, d / 2 - 0.45, wh + rh * 0.38, 'thatch', 'thatch_l', seg=16, seed=seed, rag=0.07, p=0.6)
    tier(b, w / 2 - 0.22, d / 2 - 0.32, wh + rh * 0.3, rl + 0.5, d / 2 * 0.42, wh + rh * 0.74, 'thatch_d', 'thatch', seg=16, seed=seed + 3, rag=0.08, p=0.62)
    tier(b, rl + 0.62, d / 2 * 0.5, wh + rh * 0.66, rl, 0.1, wh + rh, 'thatch', 'thatch_l', seg=12, seed=seed + 6, rag=0.08, p=0.66)
    b.box((rl * 2 + 0.3, 0.3, 0.16), (0, 0, wh + rh + 0.02), 'thatch_d', bevel=0.05, jit=0.08)
    for s in (-1, 1):   # 용마루 끝의 엇건 나무
        for t in (-1, 1):
            limb(b, (s * (rl + 0.05), t * 0.42, wh + rh - 0.36), (s * (rl + 0.05), -t * 0.34, wh + rh + (0.62 if chief else 0.42)), 0.05, 0.035, 'wood_d', seg=4, cap=False)
    for i in range(-1, 2):
        b.box((0.07, d * 0.5, 0.05), (i * rl * 0.6, 0, wh + rh - 0.02), 'thatch_d', jit=0.05, f=lambda v: Vector((v.x, v.y, v.z - abs(v.y) * 0.5)))
    dx = 0.0 if chief else -w * 0.2
    door(b, dx, -d / 2 - 0.3, w=1.0 if chief else 0.72, h=1.25 if chief else 0.95, post=post, deep=0.4)
    if chief:
        # 문 위의 청동 해 무늬 · 사슴뿔 · 문 옆 붉은 칠 기둥과 가죽
        b.cone(0.26, 0.26, 0.05, (0, -d / 2 - 0.5, 1.78), 'bronze', seg=10, rot=(math.pi / 2, 0, 0), jit=0.04)
        b.cone(0.12, 0.12, 0.07, (0, -d / 2 - 0.52, 1.78), 'bronze_l', seg=8, rot=(math.pi / 2, 0, 0), jit=0.03)
        for s in (-1, 1):
            p0 = Vector((s * 0.36, -d / 2 - 0.5, 1.72))
            p1 = p0 + Vector((s * 0.42, 0, 0.42))
            limb(b, p0, p1, 0.04, 0.03, 'bone', seg=4, cap=False)
            limb(b, p1, p1 + Vector((s * 0.1, 0, 0.36)), 0.03, 0.01, 'bone', seg=4, cap=False)
            limb(b, p0 + (p1 - p0) * 0.5, p0 + (p1 - p0) * 0.5 + Vector((-s * 0.04, 0, 0.3)), 0.028, 0.01, 'bone', seg=4, cap=False)
            limb(b, p1, p1 + Vector((s * 0.3, 0, 0.1)), 0.028, 0.01, 'bone', seg=4, cap=False)
            b.box((0.62, 0.05, 0.86), (s * 1.5, -d / 2 - 0.05, 0.9), 'hide' if s > 0 else 'hide_d', bevel=0.02, jit=0.06, f=lambda v: Vector((v.x * (1 + 0.5 * v.z), v.y, v.z)))
        pot(b, 1.25, -d / 2 - 0.55, 0.85, 'clay_r')
        pot(b, 1.85, -d / 2 - 0.4, 0.6, 'clay')
        pot(b, -1.3, -d / 2 - 0.5, 0.95, 'clay')
    else:
        pot(b, dx + 1.1, -d / 2 - 0.42, 0.7, 'clay')
        b.box((1.5, 0.06, 0.06), (1.2, -d / 2 - 0.32, 1.02), 'wood_d', jit=0.05)   # 처마 밑에 건 이삭 다발
        for i in range(5):
            b.cone(0.07, 0.03, 0.42, (0.6 + i * 0.3, -d / 2 - 0.34, 0.8), 'gold' if i % 2 else 'gold_d', seg=4, cap=False, jit=0.08)
    b.done(name, smooth=0, shade=(0.68, 1.1), under=0.3)


long_house('bhut_long', 4.4, 2.9, 1.1, 1.75, seed=11)
long_house('chief_house', 4.5, 3.9, 1.55, 2.5, seed=21, chief=True)

# ═════ 망루: 통나무 다리 넷 · 버팀 · 마루 · 난간 · 사다리 · 불 바구니(연기가 오르는 곳) ═════
b = B()
LEG = lambda z: 1.45 - 0.4 * (z + 0.1) / 5.1
for sx in (-1, 1):
    for sy in (-1, 1):
        limb(b, (sx * LEG(-0.1), sy * LEG(-0.1), -0.1), (sx * LEG(5.0), sy * LEG(5.0), 5.0), 0.14, 0.1, 'wood_d', seg=6, jit=0.07)
for z in (1.5, 3.2):
    r = LEG(z)
    for (x0, y0, x1, y1) in ((-r, -r, r, -r), (r, -r, r, r), (r, r, -r, r), (-r, r, -r, -r)):
        limb(b, (x0 * 1.08, y0 * 1.08, z), (x1 * 1.08, y1 * 1.08, z), 0.065, 0.06, 'wood', seg=5, cap=False, jit=0.06)
    for sx in (-1, 1):
        for sy in (-1, 1):
            b.cone(0.16, 0.16, 0.1, (sx * r, sy * r, z), 'rope', seg=6, jit=0.05)
for s in (-1, 1):
    limb(b, (s * LEG(1.5), -LEG(1.5) * s, 1.5), (s * LEG(3.2), LEG(3.2) * s, 3.2), 0.05, 0.05, 'wood', seg=4, cap=False)
    limb(b, (-LEG(1.5) * s, s * LEG(1.5), 1.5), (LEG(3.2) * s, s * LEG(3.2), 3.2), 0.05, 0.05, 'wood', seg=4, cap=False)
for i in range(9):
    b.box((3.0, 0.33, 0.13), (0, -1.36 + i * 0.34, 4.72 + (i % 2) * 0.02), 'wood_l' if i % 2 else 'wattle', jit=0.08)
for sx in (-1, 1):
    for sy in (-1, 1):
        limb(b, (sx * 1.42, sy * 1.42, 4.7), (sx * 1.42, sy * 1.42, 5.85), 0.07, 0.06, 'wood_d', seg=5, jit=0.06)
for (x0, y0, x1, y1, full) in ((-1.42, 1.42, 1.42, 1.42, 1), (-1.42, -1.42, -1.42, 1.42, 1), (1.42, -1.42, 1.42, 1.42, 1), (-1.42, -1.42, 1.42, -1.42, 0)):
    limb(b, (x0, y0, 5.68), (x1, y1, 5.68), 0.055, 0.055, 'wood', seg=5, cap=False, jit=0.06)
    if full:
        limb(b, (x0, y0, 5.2), (x1, y1, 5.2), 0.045, 0.045, 'wood', seg=4, cap=False)
        for i in range(7):
            t = (i + 0.5) / 7
            limb(b, (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 4.78), (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 5.66), 0.035, 0.03, 'wattle', seg=4, cap=False, jit=0.08)
for s in (-0.28, 0.28):
    limb(b, (0.55 + s, -2.25, 0.0), (0.55 + s, -1.5, 4.95), 0.05, 0.045, 'wood_l', seg=5, jit=0.06)
for i in range(9):
    z = 0.5 + i * 0.5
    b.box((0.66, 0.07, 0.07), (0.55, -2.25 + 0.75 * z / 4.95, z), 'wood', jit=0.06)
# 불 바구니(북동 모서리): 세 발 위의 큰 토기 · 장작 · 불씨
FB = (0.72, 0.72)
for k in range(3):
    a = k * 2.094 + 0.5
    limb(b, (FB[0] + math.cos(a) * 0.36, FB[1] + math.sin(a) * 0.36, 4.78), (FB[0], FB[1], 5.42), 0.035, 0.03, 'wood_d', seg=4, cap=False)
b.lathe([(0.12, 5.36), (0.3, 5.46), (0.36, 5.62), (0.33, 5.7)], (FB[0], FB[1], 0), 'clay_d', seg=8, jit=0.06)
b.cone(0.3, 0.26, 0.05, (FB[0], FB[1], 5.68), 'soot', seg=8)
for k in range(3):
    b.cone(0.045, 0.04, 0.5, (FB[0], FB[1], 5.76), 'wood_d' if k % 2 else 'rbark', seg=4, rot=(0, 1.25, k * 2.1), jit=0.08)
b.cone(0.16, 0.05, 0.14, (FB[0], FB[1], 5.78), 'glow_fire', seg=6)
b.done('watchtower', smooth=0, shade=(0.72, 1.08), under=0.25)

# ═════ 다락 곳간(고상 창고): 기둥 위에 올린 곳간 — 쥐막이 판 · 통나무 사다리 ═════
b = B()
for sx in (-1, 1):
    for sy in (-1, 1):
        b.cone(0.11, 0.09, 1.3, (sx * 0.95, sy * 0.72, 0.65), 'wood_d', seg=6, jit=0.06)
        b.cone(0.26, 0.26, 0.06, (sx * 0.95, sy * 0.72, 1.28), 'wood_l', seg=8, jit=0.05)
b.box((2.6, 2.1, 0.14), (0, 0, 1.4), 'wood_l', jit=0.08)
b.box((2.3, 1.8, 1.1), (0, 0, 2.02), 'wattle', bevel=0.05, jit=0.1)
for x in (-1.15, -0.4, 0.4, 1.15):
    for s in (-1, 1):
        b.box((0.08, 0.08, 1.12), (x, s * 0.91, 2.02), 'wood_d', jit=0.06)
b.box((0.6, 0.06, 0.7), (0, -0.92, 1.9), 'dark')
b.box((0.76, 0.08, 0.08), (0, -0.94, 2.3), 'wood', jit=0.05)
b.box((3.0, 2.5, 0.03), (0, 0, 2.55), 'dark')
tier(b, 1.75, 1.5, 2.42, 1.05, 0.75, 3.05, 'thatch', 'thatch_l', seg=14, seed=31, rag=0.08, p=0.62)
tier(b, 1.15, 0.85, 2.95, 0.6, 0.08, 3.6, 'thatch_d', 'thatch', seg=12, seed=34, rag=0.09, p=0.66)
b.box((1.4, 0.24, 0.14), (0, 0, 3.6), 'thatch_d', bevel=0.04, jit=0.08)
limb(b, (0.15, -2.0, 0.0), (0.05, -1.08, 1.42), 0.11, 0.1, 'rbark', seg=6, jit=0.06)
for i in range(4):
    b.box((0.26, 0.1, 0.07), (0.13 - i * 0.02, -1.85 + i * 0.2, 0.28 + i * 0.3), 'cut', jit=0.04)
b.done('granary_raised', smooth=0, shade=(0.7, 1.08), under=0.3)


# ═════ 논: 논두렁 + 바닥 + 벼(6.6 × 4.6, 가운데가 원점). 누렇게 익은 논 · 아직 푸른 논 · 벤 논(그루터기와 볏단) ═════
def paddy(name, kind, seed):
    b = B()
    W, D = 6.6, 4.6
    fm = {'gold': [('paddy_mud', 0.6), ('straw_d', 0.4)], 'green': [('water', 0.6), ('water_d', 0.4)], 'cut': [('paddy_mud', 0.7), ('earth_l', 0.3)]}[kind]
    pk = flat_pick(fm, seed, 0.05)
    for i in range(4):
        for j in range(3):
            x0, x1 = -W / 2 + 0.2 + i * (W - 0.4) / 4, -W / 2 + 0.2 + (i + 1) * (W - 0.4) / 4
            y0, y1 = -D / 2 + 0.2 + j * (D - 0.4) / 3, -D / 2 + 0.2 + (j + 1) * (D - 0.4) / 3
            put(b, [Vector((x0, y0, 0.06)), Vector((x1, y0, 0.06)), Vector((x1, y1, 0.06)), Vector((x0, y1, 0.06))], (0, 0, 1), pk)
    for (sx, sy, cx, cy) in ((W, 0.42, 0, -D / 2 + 0.17), (W, 0.42, 0, D / 2 - 0.17), (0.42, D - 0.5, -W / 2 + 0.17, 0), (0.42, D - 0.5, W / 2 - 0.17, 0)):
        b.box((sx, sy, 0.24), (cx, cy, 0.08), 'earth' if cx == 0 else 'earth_l', bevel=0.09, jit=0.08, f=wob(0.06, seed * 7 + int(cx * 3 + cy * 5)))
    for k in range(5):   # 두렁의 풀
        x = -W / 2 + 0.6 + hsh(seed, k, 1) * (W - 1.2)
        clump(b, x, (D / 2 - 0.17) * (1 if k % 2 else -1), 0.32, 'green_d', seed=seed * 31 + k, n=2, r=0.04)
    rows, cols = 5, 8
    for r in range(rows):
        y = -D / 2 + 0.75 + r * (D - 1.5) / (rows - 1)
        for c in range(cols):
            x = -W / 2 + 0.8 + c * (W - 1.6) / (cols - 1) + (hsh(seed, r, c) - 0.5) * 0.18
            yy = y + (hsh(seed, c, r, 9) - 0.5) * 0.14
            sd = seed * 1000 + r * 37 + c
            if kind == 'gold':
                clump(b, x, yy, 0.62, 'gold', 'gold_d', head='gold', seed=sd, n=2, lean=0.4, r=0.06)
            elif kind == 'green':
                clump(b, x, yy, 0.5, 'green', 'green_d', seed=sd, n=2, lean=0.3, r=0.055)
            elif (r * cols + c) % 3 != 1:
                b.cone(0.07, 0.05, 0.1, (x, yy, 0.1), 'straw_d', seg=3, cap=False, jit=0.1)
    if kind == 'cut':
        for k, (x, y) in enumerate([(-1.9, 0.5), (0.3, -0.7), (1.9, 0.8), (-0.4, 1.1)]):
            b.cone(0.3, 0.09, 0.82, (x, y, 0.45), 'straw' if k % 2 else 'gold', seg=6, cap=False, jit=0.1)
            b.cone(0.1, 0.1, 0.07, (x, y, 0.78), 'straw_d', seg=6, jit=0.04)
            b.cone(0.09, 0.22, 0.24, (x, y, 0.95), 'gold_d', seg=6, cap=False, jit=0.1)
    b.done(name, smooth=0, shade=(0.86, 1.08), under=0.0)


paddy('paddy_gold', 'gold', 1)
paddy('paddy_green', 'green', 2)
paddy('paddy_cut', 'cut', 3)

# 밭: 이랑과 고랑 + 조(이삭이 숙었다). 7 × 4.4. 작물 잎은 tint_c
b = B()
for r in range(6):
    y = -1.85 + r * 0.74
    b.box((6.7, 0.5, 0.24), (0, y, 0.07), 'earth' if r % 2 else 'earth_l', bevel=0.1, jit=0.08, f=wob(0.05, 100 + r))
    for c in range(7):
        x = -2.9 + c * 0.97 + (hsh(r, c, 101) - 0.5) * 0.3
        clump(b, x, y, 0.62, 'tint_c', None, head='millet', seed=r * 50 + c, n=1, lean=0.3, r=0.065)
b.box((7.0, 4.6, 0.04), (0, 0, 0.02), 'earth_d', jit=0.04)
b.done('field_dry', smooth=0, shade=(0.86, 1.08), under=0.0)

# ═════ 새참 상: 굄돌 둘 위의 널 + 작은 토기들(밥 함지는 따로 — 가져가면 사라진다) ═════
b = B()
for s in (-1, 1):
    b.ball(0.3, (s * 0.52, 0, 0.2), 'gran' if s > 0 else 'gran_d', sub=1, scale=(1.0, 1.3, 0.8), jit=0.1, f=wob(0.12, 110 + s))
for i in range(3):
    b.box((1.7, 0.33, 0.09), (0, -0.34 + i * 0.34, 0.45 + (i % 2) * 0.012), 'wood_l' if i % 2 else 'wattle', jit=0.08, f=wob(0.02, 113 + i))
pot(b, -0.7, 0.24, 0.4, 'clay_r', z=0.5)
pot(b, 0.72, -0.24, 0.34, 'clay', z=0.5, rice=True)
b.lathe([(0.08, 0.5), (0.15, 0.56), (0.16, 0.6)], (0.7, 0.26, 0), 'clay_d', seg=7, jit=0.05)
pot(b, 1.25, 0.2, 0.95, 'clay')
pot(b, -1.3, -0.1, 0.7, 'clay_d')
b.done('meal_table', smooth=0, shade=(0.74, 1.08), under=0.25)
b = B()
b.lathe([(0.24, 0.0), (0.4, 0.1), (0.5, 0.28), (0.52, 0.36), (0.48, 0.38)], (0, 0, 0), 'clay', seg=10, jit=0.06)
b.lathe([(0.47, 0.36), (0.4, 0.46), (0.24, 0.54), (0.03, 0.58)], (0, 0, 0), 'rice', seg=10, jit=0.03)
limb(b, (0.1, -0.1, 0.5), (0.5, -0.36, 0.66), 0.03, 0.025, 'wood', seg=4)
b.done('meal_bowl', smooth=0, shade=(0.8, 1.08), under=0.15)

# ═════ 제단: 넓적한 돌 + 가죽 깔개 · 붉은간토기 / 청동 검(비파 모양)과 거울 ═════
b = B()
b.ball(0.5, (0, 0, 0.36), 'gran', sub=2, scale=(1.4, 1.0, 0.8), jit=0.1, f=lambda v: wob(0.08, 120)(Vector((v.x, v.y, min(v.z, 0.36)))))
b.box((1.0, 0.72, 0.05), (0, -0.03, 0.74), 'hide', bevel=0.02, jit=0.06)
b.box((1.0, 0.05, 0.3), (0, -0.4, 0.6), 'hide_d', jit=0.06, f=lambda v: Vector((v.x * (1 - 0.3 * (0.15 - v.z)), v.y, v.z)))
pot(b, -1.0, 0.1, 0.62, 'clay_r')
pot(b, 0.98, -0.05, 0.5, 'clay_r')
b.done('altar', smooth=0, shade=(0.72, 1.08), under=0.25)

b = B()
b.box((1.0, 0.36, 0.06), (0, 0, 0.03), 'red', bevel=0.02, jit=0.05)
# 비파형 동검: 날 가운데가 불룩하고 양쪽에 돌기가 있다. 세워 꽂았다(날 끝이 위)
HALF = [(0.0, 1.08), (0.036, 0.97), (0.062, 0.84), (0.078, 0.75), (0.118, 0.71), (0.088, 0.65), (0.072, 0.57), (0.1, 0.47), (0.138, 0.39), (0.122, 0.33), (0.04, 0.31)]
OUT = HALF + [(-x, z) for x, z in reversed(HALF[1:])]
DX = -0.24
b.prism(OUT, 0.04, (DX, 0, 0), 'bronze', jit=0.05)
b.box((0.03, 0.065, 0.74), (DX, 0, 0.69), 'bronze_l', jit=0.03)
b.box((0.19, 0.07, 0.045), (DX, 0, 0.3), 'bronze_d', jit=0.03)
b.cone(0.034, 0.03, 0.2, (DX, 0, 0.19), 'bronze_d', seg=6, jit=0.04)
b.box((0.24, 0.08, 0.05), (DX, 0, 0.085), 'bronze', bevel=0.015, jit=0.03)
b.prism([(0.02, 0.9), (0.05, 0.78), (0.03, 0.76)], 0.05, (DX, 0, 0), 'glow_bz', jit=0)
# 거울: 둥근 판 · 테두리 · 꼭지 둘 · 햇살 무늬 — 나무 받침에 기대 세웠다
MX, MZ, TILT = 0.27, 0.36, math.pi / 2 - 0.22
b.cone(0.3, 0.3, 0.03, (MX, 0.03, MZ), 'bronze_d', seg=14, rot=(TILT, 0, 0), jit=0.04)
b.cone(0.26, 0.26, 0.05, (MX, 0.015, MZ), 'bronze', seg=14, rot=(TILT, 0, 0), jit=0.04)
for k in range(4):
    b.box((0.44, 0.012, 0.026), (MX, -0.012, MZ + 0.004), 'bronze_d', rot=(-0.22, k * math.pi / 4, 0), jit=0)
b.cone(0.09, 0.09, 0.05, (MX, -0.02, MZ + 0.004), 'bronze_l', seg=8, rot=(TILT, 0, 0), jit=0.03)
for s in (-1, 1):
    b.ball(0.03, (MX + s * 0.05, -0.05, MZ + 0.05), 'bronze_d', sub=1)
b.prism([(0.1, 0.12), (0.17, 0.1), (0.14, 0.17)], 0.03, (MX, -0.03, MZ - 0.02), 'glow_bz', jit=0)
limb(b, (MX, 0.26, 0.04), (MX, 0.06, 0.5), 0.03, 0.025, 'wood_d', seg=4)
b.done('bronze_set', smooth=0, shade=(0.86, 1.08), under=0.1)

# ═════ 흙더미: 파낸 흙 + 따비(나무 삽) + 바구니 / 흙 담은 바구니 ═════
def basket(b, x, y, z=0.0, s=1.0, full=True):
    b.lathe([(0.2 * s, 0), (0.3 * s, 0.14 * s), (0.34 * s, 0.34 * s), (0.36 * s, 0.38 * s)], (x, y, z), 'wattle', seg=8, jit=0.1)
    b.lathe([(0.345 * s, 0.3 * s), (0.35 * s, 0.34 * s)], (x, y, z), 'wood_d', seg=8, cap=False, jit=0.04)
    if full:
        b.lathe([(0.33 * s, 0.37 * s), (0.22 * s, 0.47 * s), (0.03 * s, 0.52 * s)], (x, y, z), 'earth', seg=8, jit=0.1)


b = B()
b.ball(1.0, (0, 0, -0.1), 'earth', sub=2, scale=(1.9, 1.5, 1.0), jit=0.1, f=wob(0.1, 130))
b.ball(0.6, (1.3, -0.5, -0.05), 'earth_d', sub=1, scale=(1.3, 1.1, 0.8), jit=0.1, f=wob(0.12, 131))
b.ball(0.45, (-1.4, 0.5, -0.05), 'earth_l', sub=1, scale=(1.3, 1.1, 0.7), jit=0.1, f=wob(0.12, 132))
b.cone(1.1, 1.0, 0.05, (-0.3, -1.75, 0.03), 'earth_d', seg=9, jit=0.06, f=wob(0.1, 133))
limb(b, (0.5, -0.7, 0.5), (0.95, -1.3, 1.75), 0.045, 0.04, 'wood', seg=5, jit=0.06)
b.box((0.2, 0.05, 0.42), (0.47, -0.66, 0.42), 'wood_l', rot=(0.42, -0.32, 0), jit=0.06)
limb(b, (0.8, -1.12, 1.25), (1.05, -0.95, 1.25), 0.03, 0.03, 'wood_d', seg=4)
basket(b, -1.2, -1.2, 0, 1.0, True)
basket(b, -0.5, -1.55, 0, 0.9, False)
for k, (x, y, r) in enumerate([(1.9, 0.5, 0.14), (-1.9, -0.2, 0.12), (0.2, 1.5, 0.13), (1.2, -1.5, 0.1)]):
    b.ball(r, (x, y, r * 0.4), 'gran' if k % 2 else 'gran_d', sub=1, scale=(1.2, 1, 0.7), jit=0.1)
b.done('dirt_pile', smooth=0, shade=(0.72, 1.08), under=0.2, origin=(0, 0, 0))
b = B()
basket(b, 0, 0, 0, 1.25, True)
b.done('basket_earth', smooth=0, shade=(0.78, 1.08), under=0.15)

# ═════ 족장: 머리 장식(머리띠 · 새 깃 · 청동 단추) — 사람 머리 조각에 합친다 / 차림(가슴 거울 · 허리 검 · 털 망토 · 방울 지팡이) ═════
b = B()
b.lathe([(0.305, 1.82), (0.315, 1.86), (0.305, 1.9)], (0, 0.012, 0), 'red', seg=12, cap=False, jit=0.04)
b.cone(0.07, 0.07, 0.03, (0, -0.305, 1.865), 'bronze_l', seg=8, rot=(math.pi / 2, 0, 0), jit=0.03)
for k, (x, hgt, tl) in enumerate([(-0.17, 0.5, -0.3), (0.0, 0.66, 0.0), (0.17, 0.5, 0.3), (-0.3, 0.34, -0.55), (0.3, 0.34, 0.55)]):
    y = 0.2 - abs(x) * 0.5
    b.box((0.1, 0.02, hgt), (x + math.sin(tl) * hgt / 2, y, 1.9 + math.cos(tl) * hgt / 2), 'white', rot=(0.18, tl, 0), jit=0.04, f=lambda v: Vector((v.x * (1 - 0.7 * max(0, v.z) * 2 / 1.0), v.y, v.z)))
    b.box((0.07, 0.024, hgt * 0.26), (x + math.sin(tl) * hgt * 0.86, y - 0.035, 1.9 + math.cos(tl) * hgt * 0.86), 'ink', rot=(0.18, tl, 0), jit=0.03)
# 가슴 거울과 끈
b.cone(0.2, 0.2, 0.04, (0, -0.25, 1.06), 'bronze', seg=12, rot=(math.pi / 2, 0, 0), jit=0.04)
b.cone(0.085, 0.085, 0.05, (0, -0.262, 1.06), 'bronze_l', seg=8, rot=(math.pi / 2, 0, 0), jit=0.03)
b.prism([(0.06, 0.1), (0.13, 0.07), (0.1, 0.14)], 0.02, (0, -0.275, 1.06), 'glow_bz', jit=0)
for s in (-1, 1):
    limb(b, (s * 0.1, -0.25, 1.22), (s * 0.22, -0.12, 1.4), 0.016, 0.016, 'rope_d', seg=3, cap=False)
# 허리의 검
b.prism([(0.0, 0.0), (0.05, 0.1), (0.035, 0.2), (0.07, 0.3), (0.03, 0.36), (-0.03, 0.36), (-0.07, 0.3), (-0.035, 0.2), (-0.05, 0.1)], 0.03, (-0.3, -0.25, 0.42), 'bronze', rot=(0, 0.25, 0), jit=0.04)
b.box((0.14, 0.05, 0.035), (-0.21, -0.25, 0.79), 'bronze_d', rot=(0, 0.25, 0))
b.box((0.045, 0.045, 0.14), (-0.19, -0.25, 0.87), 'bronze_d', rot=(0, 0.25, 0))
b.box((0.8, 0.5, 0.07), (0, 0, 0.8), 'hide_d', bevel=0.03, jit=0.05)
# 털 망토: 어깨를 덮고 등 뒤로 내려온다
for i in range(6):
    a0, a1 = math.pi * (-0.08 + i * 1.16 / 6), math.pi * (-0.08 + (i + 1) * 1.16 / 6)
    for (zt, zb, rt, rb, m) in ((1.42, 1.12, 0.32, 0.46, 'fur_l'), (1.14, 0.6, 0.45, 0.5, 'fur'), (0.62, 0.34 + (i % 2) * 0.08, 0.5, 0.5, 'fur_l' if i % 2 else 'fur')):
        q = [Vector((math.cos(a0) * rt * 1.25, 0.04 + math.sin(a0) * rt * 0.75, zt)), Vector((math.cos(a1) * rt * 1.25, 0.04 + math.sin(a1) * rt * 0.75, zt)), Vector((math.cos(a1) * rb * 1.25, 0.04 + math.sin(a1) * rb * 0.75, zb)), Vector((math.cos(a0) * rb * 1.25, 0.04 + math.sin(a0) * rb * 0.75, zb))]
        c = (q[0] + q[1] + q[2] + q[3]) / 4
        face(b, m, q, Vector((c.x, c.y + 0.2, 0.2)), 1.0, 0.1)
# 방울 지팡이(청동 방울 여덟)
SX, SY = 0.66, -0.22
limb(b, (SX, SY, 0.0), (SX, SY, 2.2), 0.04, 0.032, 'wood_d', seg=5, jit=0.05)
b.cone(0.17, 0.17, 0.035, (SX, SY, 2.32), 'bronze', seg=8, rot=(math.pi / 2, 0, 0), jit=0.04)
for k in range(8):
    a = k * math.pi / 4
    b.ball(0.05, (SX + math.cos(a) * 0.2, SY, 2.32 + math.sin(a) * 0.2), 'bronze_l' if k % 2 else 'bronze', sub=1, jit=0.04)
for s in (-1, 1):
    limb(b, (SX, SY, 2.1), (SX + s * 0.12, SY, 1.82), 0.02, 0.012, 'red', seg=3, cap=False)
b.done('chief_gear', smooth=0, shade=(0.8, 1.08), under=0.15)

# ═════ 마을 살림: 토기 무리 · 볏단 걸이 · 화덕 · 선돌 ═════
b = B()
b.box((1.9, 1.3, 0.06), (0, 0, 0.03), 'straw_d', bevel=0.02, jit=0.06)
for (x, y, s, m, rc) in [(-0.6, 0.25, 1.15, 'clay', False), (0.15, 0.3, 0.9, 'clay_d', False), (0.7, 0.1, 1.0, 'clay', True), (-0.25, -0.35, 0.7, 'clay_r', False), (0.4, -0.4, 0.6, 'clay_r', False), (-0.8, -0.35, 0.55, 'clay', True)]:
    pot(b, x, y, s, m, z=0.05, rice=rc)
b.done('pots_set', smooth=0, shade=(0.72, 1.08), under=0.25)
b = B()
for s in (-1, 1):
    limb(b, (s * 1.3, 0.3, 0), (s * 1.2, 0, 1.75), 0.06, 0.05, 'wood_d', seg=5, jit=0.06)
    limb(b, (s * 1.3, -0.3, 0), (s * 1.2, 0, 1.75), 0.06, 0.05, 'wood', seg=5, jit=0.06)
limb(b, (-1.45, 0, 1.7), (1.45, 0, 1.72), 0.055, 0.05, 'wood_l', seg=5, jit=0.06)
for i in range(7):
    x = -1.0 + i * 0.33
    b.cone(0.07, 0.2, 0.6, (x, 0.0, 1.36), 'gold' if i % 2 else 'straw', seg=5, cap=False, jit=0.1)
    b.cone(0.085, 0.085, 0.06, (x, 0.0, 1.66), 'straw_d', seg=5, jit=0.04)
b.done('drying_rack', smooth=0, shade=(0.74, 1.08), under=0.2)
b = B()
for i in range(8):
    a = i * 0.785
    r = 0.15 + hsh(i, 141) * 0.06
    b.ball(r, (math.cos(a) * 0.6, math.sin(a) * 0.6, r * 0.4), 'gran' if i % 2 else 'gran_d', sub=1, scale=(1.2, 1, 0.8), jit=0.1, f=wob(0.14, 140 + i))
b.cone(0.5, 0.45, 0.05, (0, 0, 0.03), 'soot', seg=8)
for i in range(4):
    b.cone(0.07, 0.06, 0.85, (0, 0, 0.2), 'wood_d' if i % 2 else 'rbark', seg=5, rot=(0, 1.22, i * 0.8 + 0.3), jit=0.08)
b.cone(0.24, 0.2, 0.05, (0, 0, 0.07), 'glow_fire', seg=7)
for k in range(3):
    a = k * 2.094
    limb(b, (math.cos(a) * 0.78, math.sin(a) * 0.78, 0), (math.cos(a) * 0.05, math.sin(a) * 0.05, 1.5), 0.04, 0.03, 'wood_d', seg=4, cap=False)
pot(b, 0, 0, 0.8, 'clay_d', z=0.42)
b.done('hearth', smooth=0, shade=(0.72, 1.08), under=0.2)
b = B()
zs = [-0.3, 0.0, 0.7, 1.5, 2.2, 2.7, 2.95]
rings = []
for i, z in enumerate(zs):
    k = (1 - 0.5 * (max(0, z) / 2.95) ** 1.6)
    rings.append([Vector((0.5 * k * sgnpow(math.cos(j * 0.785 + 0.2), 0.7) * (1 + (hsh(i, j, 150) - 0.5) * 0.12) + 0.04 * z, 0.34 * k * sgnpow(math.sin(j * 0.785 + 0.2), 0.7) * (1 + (hsh(i, j, 151) - 0.5) * 0.12), z)) for j in range(8)])
loft(b, rings, stone_pick(150, moss=0.3, cell=0.5), caps=(False, True), seed=150)
b.done('menhir', smooth=0, shade=(0.66, 1.1), under=0.3)

# ═════ 돌 부스러기 · 땅 얼룩 · 먼 산 · 연기 덩이 ═════
b = B()
rr = random.Random(9)
for i in range(9):
    a = rr.random() * 6.28
    d = 0.15 + rr.random() * 0.7
    b.ball(0.08 + rr.random() * 0.08, (math.cos(a) * d, math.sin(a) * d, 0.03), 'gran_w' if i % 3 else 'gran_l', sub=1, scale=(1.4, 0.9, 0.4), rot=(0, 0, a * 2), jit=0.1, f=wob(0.25, 160 + i))
b.done('chips', smooth=0, shade=(0.9, 1.05), under=0.1)
b = B()
pw = wob(0.2, 18)
b.cone(1.0, 0.95, 0.07, (0, 0, 0.035), 'tint_c', seg=9, jit=0.03, f=lambda v: Vector((pw(Vector((v.x, v.y, 0))).x, pw(Vector((v.x, v.y, 0))).y, v.z)))
b.done('dpatch', smooth=0, shade=(1.0, 1.0), under=0.0)
b = B()
b.ball(1.0, (0, 0, -0.06), 'tint_c', sub=2, scale=(1, 1, 0.62), jit=0.05, f=wob(0.1, 19))
b.done('dhill', smooth=0, shade=(0.74, 1.06), under=0.0)
b = B()
b.ball(0.5, (0, 0, 0), 'smoke', sub=1, jit=0.05, f=wob(0.16, 9))
b.done('dpuff', smooth=0, shade=(0.82, 1.04), under=0.1)

export('dolmen.glb')
for o in bpy.context.scene.objects:
    if o.type == 'MESH':
        me = o.data
        me.calc_loop_triangles()
        xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
        print('MODEL %-16s tris %5d  x %.2f..%.2f  y %.2f..%.2f  z %.2f..%.2f' % (o.name, len(me.loop_triangles), min(xs) + o.location.x, max(xs) + o.location.x, min(ys) + o.location.y, max(ys) + o.location.y, min(zs) + o.location.z, max(zs) + o.location.z))

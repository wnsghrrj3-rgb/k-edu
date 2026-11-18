"""케이월드 「여덟 가지 법」(고조선) 장면에만 쓰는 모델 — law.glb. 앞(문)은 -y(three 에서 +z). 바닥 가운데가 원점.
흙성(law_wall · 길이 4) · 흙성 모서리 망루(law_tower) · 남문(law_gate) · 다락 곳간(law_granary, 8 x 7) · 집 셋(law_house_a/b/c, 6 x 4.8) ·
대장간(law_smithy, 9 x 6 — 앞이 트였다, 풀무 화덕) · 장터 가게 셋(law_stall_a 토기 / b 가죽·물고기 / c 곡식·소금, 3 x 2) · 우물(law_well) ·
재판 북(law_drum) · 족장 자리(law_seat) · 청동 거울 장대(law_pole) · 제단(law_altar — 비파형 동검·거울·민무늬 토기) ·
곡식 자루(law_sack) · 자루 매듭(law_knot — 흰색, 장면이 재질 색으로 끈 색을 정한다) · 발자국(law_print, 길이·너비 1) · 낟알(law_grain) · 쏟아진 낟알(law_spill) ·
띠(law_belt — 흰색, 재질 색) · 신(law_shoe) · 머리 싸맨 천(law_bandage) · 솥(law_pot_full / law_pot_empty) · 깃대(law_flagpole) · 깃발(law_flag, tint_cloth) ·
돼지(law_pig) · 우리(law_pen) · 조 말리는 걸이(law_rack) · 장작(law_wood) · 갈돌·갈판(law_quern) · 토기 무리(law_pots) · 밭(law_field, 8 x 5) · 먼 산(law_hill) · 땅 얼룩(law_patch).
돕는 함수(hsh·wob·limb·face·tier·pot)는 make_dolmen.py 와 같은 꼴(그 파일은 다른 장면 것이라 불러오지 않고 옮겨 적었다)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_wall', 0xc8a878), ('tint_cloth', 0xc0503a), ('tint_c', 0xc8a878),
             ('ram', 0xc0a070), ('ram_d', 0xa4845a), ('ram_l', 0xd2b486), ('grass', 0x86b556), ('grass_d', 0x6f9a48), ('grass_l', 0x9cc464),
             ('earth', 0x9a7a50), ('earth_d', 0x7c5e3c), ('earth_l', 0xb49668), ('mud', 0xb89868), ('mud_d', 0x94764c),
             ('wood', 0x7a5632), ('wood_d', 0x57391f), ('wood_l', 0xb08a5a), ('rbark', 0x8a5a2b), ('wattle', 0xa88454), ('cut', 0xe2c492),
             ('thatch', 0xd9b25a), ('thatch_d', 0xb08a3e), ('thatch_l', 0xe8cc7a), ('dark', 0x2a2018),
             ('clay', 0xc89868), ('clay_d', 0xa87848), ('clay_r', 0xb8523a), ('soot', 0x3a3028), ('millet', 0xe0b040), ('millet_d', 0xc08a2a), ('millet_g', 0x9aab48),
             ('bronze', 0xd8b04a), ('bronze_l', 0xf0d070), ('bronze_d', 0x9a7a2a), ('glow_bz', 0xfff0a8), ('glow_fire', 0xffa040), ('glow_coal', 0xff6a2a),
             ('iron', 0x4a4a52), ('iron_l', 0x74747e), ('hide', 0xb07a44), ('hide_d', 0x8a5c34), ('hide_l', 0xd0a06a), ('fur', 0x6a4a34), ('fur_l', 0x9a7a5a),
             ('rope', 0xdcc696), ('rope_d', 0xb89c68), ('hemp', 0xd8c49a), ('hemp_d', 0xb8a070), ('white', 0xf4efe2), ('wk', 0xffffff), ('ink', 0x2b2118), ('red', 0xc8402e),
             ('gran', 0x9c978e), ('gran_l', 0xb5afa3), ('gran_d', 0x7e7a72), ('moss', 0x7c9658),
             ('water', 0x4a8ab8), ('water_d', 0x3a72a0), ('fish', 0xa8b0b4), ('fish_d', 0x7a8488), ('salt', 0xf4f2ec), ('shell', 0xe8dcc8), ('bean', 0x9a6a3a),
             ('pig', 0x3a3230), ('pig_l', 0x5a4c48), ('snout', 0xc89080), ('hill', 0x7aa65a), ('hill_d', 0x5f8a4a), ('hill_l', 0x93b86a), ('rock', 0x9a9284)]:
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
    f = b.bm.faces.new([b.bm.verts.new(p) for p in pts])
    f.normal_update()
    if out is not None and f.normal.dot(Vector(out)) < 0:
        f.normal_flip()
    f.material_index = b._mi(m)
    f[b.tone] = tone
    f[b.jit] = jit


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


def lid(b, rx, ry, z, p=0.6, seg=16, m='dark'):
    """처마 밑 그늘 판: 초가 켜(tier) 아래 끝과 같은 꼴로 조금 작게 — 네모 판이면 모서리가 지붕 밖으로 삐져 보인다."""
    pts = [Vector((rx * sgnpow(math.cos(k * 2 * math.pi / seg), p), ry * sgnpow(math.sin(k * 2 * math.pi / seg), p), z)) for k in range(seg)]
    face(b, m, pts, (0, 0, -1), 1.0, 0.0)


def pot(b, x, y, s=1.0, m='clay', z=0.0, seg=8, fill=None):
    """민무늬 토기: 납작한 바닥, 배가 부르고 아가리가 살짝 벌어진다."""
    b.lathe([(0.16 * s, 0), (0.3 * s, 0.16 * s), (0.36 * s, 0.42 * s), (0.3 * s, 0.66 * s), (0.27 * s, 0.74 * s), (0.31 * s, 0.82 * s)], (x, y, z), m, seg=seg, jit=0.06)
    b.cone(0.26 * s, 0.26 * s, 0.01, (x, y, z + (0.79 if fill else 0.6) * s), fill or 'soot', seg=seg, jit=0.02)


def stone(b, x, y, r, m='gran', seed=0, flat=0.7, z=None):
    b.ball(r, (x, y, r * 0.35 if z is None else z), m, sub=1, scale=(1.2, 1.0, flat), jit=0.1, f=wob(0.14, seed))


def sack(b, x, y, z=0.0, s=1.0, m='hemp', lean=0.0):
    b.lathe([(0.26 * s, 0.0), (0.42 * s, 0.08 * s), (0.48 * s, 0.34 * s), (0.44 * s, 0.62 * s), (0.3 * s, 0.82 * s), (0.12 * s, 0.92 * s), (0.1 * s, 0.98 * s), (0.17 * s, 1.1 * s), (0.04 * s, 1.16 * s)], (x, y, z), m, seg=8, jit=0.08, rot=(lean, 0, 0), f=wob(0.05, int(x * 10 + y * 7) + 3))


def basket(b, x, y, z=0.0, s=1.0, fill='millet'):
    b.lathe([(0.2 * s, 0), (0.3 * s, 0.14 * s), (0.34 * s, 0.34 * s), (0.36 * s, 0.38 * s)], (x, y, z), 'wattle', seg=8, jit=0.1)
    b.lathe([(0.345 * s, 0.3 * s), (0.35 * s, 0.34 * s)], (x, y, z), 'wood_d', seg=8, cap=False, jit=0.04)
    if fill:
        b.lathe([(0.33 * s, 0.36 * s), (0.22 * s, 0.44 * s), (0.03 * s, 0.48 * s)], (x, y, z), fill, seg=8, jit=0.1)


def dagger(b, x, y, z, s=1.0, rot=(0, 0, 0), glow=True):
    """비파형 동검(날 끝이 +z): 가운데가 불룩하고 양쪽에 돌기."""
    HALF = [(0.0, 1.08), (0.036, 0.97), (0.062, 0.84), (0.078, 0.75), (0.118, 0.71), (0.088, 0.65), (0.072, 0.57), (0.1, 0.47), (0.138, 0.39), (0.122, 0.33), (0.04, 0.31)]
    OUT = [(px * s, (pz - 0.31) * s) for px, pz in HALF + [(-a, c) for a, c in reversed(HALF[1:])]]
    b.prism(OUT, 0.035 * s, (x, y, z), 'bronze', rot=rot, jit=0.05)
    b.box((0.03 * s, 0.05 * s, 0.74 * s), (x, y, z + 0.38 * s), 'bronze_l', rot=rot, jit=0.03)
    b.box((0.2 * s, 0.06 * s, 0.045 * s), (x, y, z), 'bronze_d', rot=rot, jit=0.03)
    b.cone(0.034 * s, 0.03 * s, 0.22 * s, (x, y, z - 0.12 * s), 'wood_d', seg=5, rot=rot, jit=0.04)
    if glow:
        b.prism([(0.02 * s, 0.6 * s), (0.05 * s, 0.48 * s), (0.03 * s, 0.46 * s)], 0.045 * s, (x, y, z), 'glow_bz', rot=rot, jit=0)


def mirror(b, x, y, z, r=0.26, tilt=0.0):
    """청동 거울(잔무늬 거울): 둥근 판 · 테 · 꼭지 · 햇살 무늬 — 앞(-y)을 본다."""
    T = math.pi / 2 - tilt
    b.cone(r + 0.04, r + 0.04, 0.03, (x, y + 0.02, z), 'bronze_d', seg=12, rot=(T, 0, 0), jit=0.04)
    b.cone(r, r, 0.05, (x, y, z), 'bronze', seg=12, rot=(T, 0, 0), jit=0.04)
    for k in range(4):
        b.box((r * 1.7, 0.012, 0.024), (x, y - 0.03, z), 'bronze_d', rot=(-tilt, k * math.pi / 4, 0), jit=0)
    b.cone(r * 0.34, r * 0.34, 0.05, (x, y - 0.03, z), 'bronze_l', seg=8, rot=(T, 0, 0), jit=0.03)
    b.prism([(r * 0.35, r * 0.45), (r * 0.65, r * 0.38), (r * 0.52, r * 0.65)], 0.03, (x, y - 0.045, z - 0.0), 'glow_bz', jit=0)


# ═════ 흙성: 판축으로 다진 흙둑(켜마다 빛깔이 조금 다르다) + 풀 덮인 등 + 위에 뾰족한 나무 울(길이 4, x 로 길다) ═════
b = B()
L = 4.04
# 크롬북: 이 조각이 성 둘레에 60번(그림자까지 두 번) 그려진다 — 이어 붙는 끝 면·바닥 면은 만들지 않고, 말뚝은 세모 기둥으로 아낀다(세모 97)


def band(b, m, prof, L, z0=0.0, tone=1.0, jit=0.06):
    """x 로 길이 L 인 띠: prof = 단면(y, z) 꺾은선 — 옆면만(끝 면 없음)."""
    for (y0, z0_), (y1, z1_) in zip(prof, prof[1:]):
        face(b, m, [Vector((-L / 2, y0, z0 + z0_)), Vector((L / 2, y0, z0 + z0_)), Vector((L / 2, y1, z0 + z1_)), Vector((-L / 2, y1, z0 + z1_))], Vector((0, (y0 + y1) / 2, 0.4)), tone, jit)


def stake(b, x, y, z0, h, r, m, mt, k=0):
    """세모 말뚝 + 뾰족한 끝(세모 9)."""
    a0 = hsh(k, 41) * 2
    P = [Vector((x + math.cos(a0 + j * 2.094) * r, y + math.sin(a0 + j * 2.094) * r, 0)) for j in range(3)]
    tip = Vector((x, y, z0 + h + 0.26))
    for j in range(3):
        p0, p1 = P[j], P[(j + 1) % 3]
        c = (p0 + p1) / 2
        o = Vector((c.x - x, c.y - y, 0))
        face(b, m, [Vector((p0.x, p0.y, z0)), Vector((p1.x, p1.y, z0)), Vector((p1.x, p1.y, z0 + h)), Vector((p0.x, p0.y, z0 + h))], o, 1.0, 0.08)
        face(b, mt, [Vector((p0.x, p0.y, z0 + h)), Vector((p1.x, p1.y, z0 + h)), tip], Vector((o.x, o.y, 0.5)), 1.0, 0.06)


LAY = [(0.0, 0.92, 0.5, 'ram_d'), (0.5, 0.82, 0.5, 'ram'), (1.0, 0.72, 0.45, 'ram_l'), (1.45, 0.62, 0.4, 'ram')]
for i, (z, hw, hh, m) in enumerate(LAY):
    hw2 = hw - 0.1
    band(b, m, [(-hw, 0), (-hw2, hh), (hw2, hh), (hw, 0)], L, z, 1.0 - 0.03 * (i % 2))
band(b, 'grass', [(-0.6, 0), (-0.42, 0.16), (0.42, 0.16), (0.6, 0)], L + 0.02, 1.84, 1.0, 0.08)
for i in range(7):
    x = -1.75 + i * 0.58
    hh = 0.95 + hsh(i, 3) * 0.2
    stake(b, x, 0.05, 1.95, hh, 0.09, 'wood' if i % 3 else 'wood_d', 'wood_l', i)
face(b, 'wood_d', [Vector((-L / 2, -0.09, 2.38)), Vector((L / 2, -0.09, 2.38)), Vector((L / 2, -0.09, 2.47)), Vector((-L / 2, -0.09, 2.47))], Vector((0, -1, 0)), 1.0, 0.04)
face(b, 'wood_d', [Vector((-L / 2, 0.19, 2.38)), Vector((L / 2, 0.19, 2.38)), Vector((L / 2, 0.19, 2.47)), Vector((-L / 2, 0.19, 2.47))], Vector((0, 1, 0)), 1.0, 0.04)
b.done('law_wall', smooth=0, shade=(0.74, 1.08), under=0.25)

# 모서리 망루: 흙 둔덕 위 네 기둥 + 망대 + 둥근 초가 갓
b = B()
b.cone(1.7, 1.15, 2.0, (0, 0, 1.0), 'ram', seg=8, jit=0.08, f=wob(0.04, 21))
b.cone(1.2, 1.05, 0.14, (0, 0, 2.06), 'grass', seg=8, jit=0.08)
for sx in (-1, 1):
    for sy in (-1, 1):
        limb(b, (sx * 0.72, sy * 0.72, 2.0), (sx * 0.62, sy * 0.62, 4.6), 0.09, 0.08, 'wood_d', seg=5, cap=False, jit=0.06)
b.box((1.7, 1.7, 0.14), (0, 0, 3.6), 'wood_l', jit=0.08)
for s in (-1, 1):
    b.box((1.7, 0.06, 0.5), (0, s * 0.82, 3.92), 'wattle', jit=0.08)
    b.box((0.06, 1.7, 0.5), (s * 0.82, 0, 3.92), 'wattle', jit=0.08)
tier(b, 1.35, 1.35, 4.45, 0.1, 0.1, 5.6, 'thatch', 'thatch_l', seg=8, seed=22, rag=0.1, p=0.8, a0=0.39)
b.done('law_tower', smooth=0, shade=(0.72, 1.08), under=0.25)

# 남문: 문길 8 — 양쪽에 굵은 기둥 둘과 흙 둔덕, 위에 가로보(뿔 엇건 끝) · 문짝은 바깥(-y)으로 활짝 · 문 밖 솟대 둘
b = B()
for s in (-1, 1):
    b.cone(1.2, 0.9, 2.2, (s * 4.75, 0, 1.1), 'ram', seg=8, jit=0.08, f=wob(0.04, 30 + s))
    for t in (-1, 1):
        limb(b, (s * 4.15, t * 0.42, 0), (s * 4.15, t * 0.42, 4.15), 0.17, 0.15, 'wood_d', seg=6, cap=False, jit=0.06)
    b.box((0.5, 1.2, 0.14), (s * 4.15, 0, 3.0), 'wood', jit=0.06)
    a = 1.15
    hx, hy = s * 3.95, -0.5
    for k in range(5):
        r = 0.2 + k * 0.38
        limb(b, (hx - s * math.cos(a) * r, hy - math.sin(a) * r, 0.05), (hx - s * math.cos(a) * r, hy - math.sin(a) * r, 2.6 + hsh(k, s) * 0.2), 0.11, 0.1, 'wood' if k % 2 else 'wood_l', seg=5, jit=0.06)
    for z in (0.6, 2.0):
        limb(b, (hx - s * math.cos(a) * 0.1, hy - math.sin(a) * 0.1, z), (hx - s * math.cos(a) * 1.85, hy - math.sin(a) * 1.85, z), 0.06, 0.06, 'wood_d', seg=4, cap=False)
    # 솟대: 긴 장대 끝의 나무 새
    px, py = s * 5.6, -1.6
    limb(b, (px, py, 0), (px, py, 4.6), 0.06, 0.04, 'wood_l', seg=5, jit=0.05)
    b.box((0.12, 0.42, 0.12), (px, py - 0.04, 4.66), 'wood', bevel=0.03, jit=0.05)
    b.cone(0.05, 0.0, 0.16, (px, py - 0.3, 4.7), 'wood_d', seg=4, rot=(math.pi / 2, 0, 0))
    b.box((0.36, 0.14, 0.03), (px, py + 0.02, 4.7), 'wood_l', jit=0.04)
b.box((9.6, 0.42, 0.32), (0, 0, 4.15), 'wood', jit=0.05)
b.box((9.0, 0.3, 0.2), (0, 0, 3.7), 'wood_d', jit=0.05)
for s in (-1, 1):
    limb(b, (s * 4.8, 0, 4.0), (s * 5.3, 0, 4.9), 0.09, 0.05, 'wood_d', seg=4)
for i in range(5):
    b.box((0.06, 0.06, 0.44), (-1.6 + i * 0.8, -0.24, 3.92), 'rope_d', jit=0.04)
b.done('law_gate', smooth=0, shade=(0.72, 1.08), under=0.25)


# ═════ 다락 곳간: 8 x 7 — 아홉 기둥(쥐막이 판) 위에 통나무를 엇쌓은 곳간 · 큰 초가지붕 · 앞 가운데 널문(밤사이 열린 채) ═════
b = B()
GX, GY = 3.6, 3.0
for x in (-GX, 0, GX):
    for y in (-GY, 0, GY):
        b.cone(0.17, 0.15, 1.36, (x, y, 0.68), 'wood_d', seg=6, jit=0.06)
        b.cone(0.44, 0.44, 0.06, (x, y, 1.3), 'wood_l', seg=8, jit=0.05)
        stone(b, x, y, 0.3, 'gran_d' if (x + y) > 0 else 'gran', seed=int(x * 3 + y * 5) + 40, flat=0.5)
b.box((8.2, 7.2, 0.18), (0, 0, 1.45), 'wood_l', jit=0.08)
for i in range(11):
    b.box((0.04, 7.24, 0.19), (-3.9 + i * 0.78, 0, 1.45), 'wood_d', jit=0)
b.box((7.5, 6.5, 2.0), (0, 0, 2.55), 'wattle', jit=0.05)
for r in range(7):
    z = 1.7 + r * 0.29
    off = 0.0 if r % 2 else 0.12
    for s in (-1, 1):
        if not (s < 0 and r < 5):
            b.cone(0.15, 0.15, 8.1 + off * 2, (0, s * 3.3, z), 'wood' if (r + (s > 0)) % 2 else 'wood_l', seg=5, rot=(0, math.pi / 2, 0), jit=0.08)
        b.cone(0.15, 0.15, 7.0 + (0.12 - off) * 2, (s * 3.82, 0, z + 0.145), 'wood' if (r + (s < 0)) % 2 else 'rbark', seg=5, rot=(math.pi / 2, 0, 0), jit=0.08)
for r in range(5):   # 앞면 아래 다섯 켜는 문 양쪽으로 나뉜다
    z = 1.7 + r * 0.29
    for s in (-1, 1):
        b.cone(0.15, 0.15, 3.25, (s * 2.43, -3.3, z), 'wood' if (r + (s > 0)) % 2 else 'wood_l', seg=5, rot=(0, math.pi / 2, 0), jit=0.08)
# 널문: 왼짝은 닫힌 채, 오른짝은 밖으로 열렸다 · 문틀 · 빗장은 바닥에
b.box((1.5, 0.1, 1.42), (0, -3.36, 2.3), 'dark')
for s in (-1, 1):
    b.box((0.16, 0.2, 1.62), (s * 0.8, -3.42, 2.38), 'wood_d', jit=0.05)
b.box((1.9, 0.22, 0.18), (0, -3.42, 3.2), 'wood_d', jit=0.05)
b.box((0.72, 0.08, 1.36), (-0.38, -3.44, 2.3), 'wood_l', jit=0.06)
for k in range(3):
    b.box((0.03, 0.1, 1.36), (-0.62 + k * 0.24, -3.46, 2.3), 'wood_d', jit=0)
b.box((0.72, 0.08, 1.36), (0.78 + 0.32 * math.cos(1.25), -3.4 - 0.36 * math.sin(1.25), 2.3), 'wood_l', rot=(0, 0, -1.25), jit=0.06)
b.box((1.0, 0.12, 0.1), (0.6, -3.75, 1.6), 'wood_d', rot=(0, 0, 0.3), jit=0.04)
# 앞 툇마루 · 기대 세운 통나무 사다리
b.box((3.0, 0.9, 0.12), (0, -3.95, 1.46), 'wood_l', jit=0.06)
for s in (-1, 1):
    b.cone(0.09, 0.08, 1.4, (s * 1.35, -4.3, 0.7), 'wood_d', seg=5, jit=0.06)
limb(b, (2.35, -4.25, 0.0), (2.0, -3.75, 1.55), 0.13, 0.11, 'rbark', seg=6, jit=0.06)
for i in range(4):
    b.box((0.3, 0.12, 0.07), (2.3 - i * 0.08, -4.18 + i * 0.12, 0.3 + i * 0.32), 'cut', jit=0.04)
# 지붕: 세 켜 우진각 초가 · 용마루 · 엇건 나무 · 새끼줄 누름
lid(b, 4.75 * 0.95, 4.15 * 0.95, 3.6, 0.6, 20)
tier(b, 4.75, 4.15, 3.5, 3.9, 3.0, 4.55, 'thatch', 'thatch_l', seg=20, seed=51, rag=0.07, p=0.6)
tier(b, 4.0, 3.15, 4.4, 2.5, 1.35, 5.45, 'thatch_d', 'thatch', seg=20, seed=54, rag=0.08, p=0.62)
tier(b, 2.65, 1.5, 5.3, 1.7, 0.12, 6.05, 'thatch', 'thatch_l', seg=16, seed=57, rag=0.08, p=0.66)
b.box((3.8, 0.36, 0.2), (0, 0, 6.08), 'thatch_d', bevel=0.05, jit=0.08)
for s in (-1, 1):
    for t in (-1, 1):
        limb(b, (s * 1.85, t * 0.4, 5.75), (s * 1.85, -t * 0.32, 6.65), 0.06, 0.04, 'wood_d', seg=4, cap=False)
for i in range(-2, 3):
    b.box((0.07, 7.6, 0.06), (i * 1.55, 0, 4.95), 'rope_d', jit=0.04, f=lambda v: Vector((v.x, v.y, v.z + 1.0 - 1.45 * (abs(v.y) / 3.8) ** 1.3)))
# 다락 밑: 쌓아 둔 곡식 자루 · 토기 · 고무래
for k, (x, y, s, ln) in enumerate([(-2.4, 1.2, 0.9, 0), (-1.7, 1.5, 0.85, 0.2), (-2.1, 0.4, 0.8, -0.15), (1.8, 1.4, 0.9, 0.1), (2.5, 1.0, 0.8, 0)]):
    sack(b, x, y, 0, s, 'hemp' if k % 2 else 'hemp_d', ln)
pot(b, 0.9, 2.0, 0.9, 'clay_d')
pot(b, -0.6, 2.2, 0.75, 'clay')
b.done('law_granary', smooth=0, shade=(0.7, 1.08), under=0.3)


# ═════ 집: 6 x 4.8 — 흙벽 + 기둥 · 세 켜 초가 · 앞 가운데 문 / 살림이 집마다 다르다 ═════
def door(b, x, y, w=0.82, h=1.2):
    b.box((w + 0.4, 0.5, h + 0.14), (x, y + 0.23, (h + 0.14) / 2), 'tint_wall', jit=0.06, f=lambda v: Vector((v.x * (1 - 0.14 * (v.z + 0.5)), v.y, v.z)))
    b.box((w, 0.08, h), (x, y - 0.03, h / 2 + 0.03), 'dark')
    for s in (-1, 1):
        b.box((0.12, 0.14, h + 0.12), (x + s * (w / 2 + 0.06), y - 0.05, (h + 0.12) / 2), 'wood_d', rot=(0, -s * 0.06, 0), jit=0.06)
    b.box((w + 0.5, 0.16, 0.13), (x, y - 0.05, h + 0.12), 'wood_d', jit=0.06)
    b.box((w * 0.9, 0.05, h * 0.9), (x - 0.06, y - 0.08, h / 2 + 0.03), 'hide_d', jit=0.06, f=lambda v: Vector((v.x * (1 + 0.25 * (0.5 - v.z)), v.y, v.z)))


def house(name, seed, kind):
    b = B()
    w, d, wh, rh = 6.0, 4.8, 1.35, 2.45
    b.box((w + 0.5, d + 0.5, 0.14), (0, 0, 0.07), 'mud_d', bevel=0.05, jit=0.06)
    b.box((w, d, wh), (0, 0, wh / 2 + 0.1), 'tint_wall', bevel=0.12, jit=0.07)
    for i in range(5):
        x = -w / 2 + 0.12 + i * (w - 0.24) / 4
        for s in (-1, 1):
            b.cone(0.09, 0.08, wh + 0.12, (x, s * (d / 2 + 0.01), wh / 2 + 0.1), 'wood' if i % 2 == 0 else 'wood_d', seg=5, cap=False, jit=0.06)
    for s in (-1, 1):
        b.cone(0.09, 0.08, wh + 0.12, (s * (w / 2 + 0.01), 0, wh / 2 + 0.1), 'wood_d', seg=5, cap=False, jit=0.06)
        b.box((0.05, 0.9, 0.5), (s * (w / 2 + 0.02), 0.8, 0.95), 'dark')          # 옆 들창
        b.box((0.06, 1.0, 0.07), (s * (w / 2 + 0.04), 0.8, 1.22), 'wood_d', jit=0)
    rl = (w - d) / 2 + 0.5
    lid(b, (w / 2 + 0.58) * 0.95, (d / 2 + 0.6) * 0.95, wh - 0.12, 0.6, 16)
    tier(b, w / 2 + 0.58, d / 2 + 0.6, wh - 0.18, w / 2 - 0.35, d / 2 - 0.45, wh + rh * 0.38, 'thatch', 'thatch_l', seg=16, seed=seed, rag=0.07, p=0.6)
    tier(b, w / 2 - 0.22, d / 2 - 0.32, wh + rh * 0.3, rl + 0.5, d / 2 * 0.42, wh + rh * 0.74, 'thatch_d', 'thatch', seg=16, seed=seed + 3, rag=0.08, p=0.62)
    tier(b, rl + 0.62, d / 2 * 0.5, wh + rh * 0.66, rl, 0.1, wh + rh, 'thatch', 'thatch_l', seg=12, seed=seed + 6, rag=0.08, p=0.66)
    b.box((rl * 2 + 0.3, 0.3, 0.16), (0, 0, wh + rh + 0.02), 'thatch_d', bevel=0.05, jit=0.08)
    for s in (-1, 1):
        for t in (-1, 1):
            limb(b, (s * (rl + 0.05), t * 0.42, wh + rh - 0.36), (s * (rl + 0.05), -t * 0.34, wh + rh + 0.44), 0.05, 0.035, 'wood_d', seg=4, cap=False)
    for i in range(-1, 2):
        b.box((0.07, d * 0.55, 0.05), (i * rl * 0.6, 0, wh + rh - 0.04), 'rope_d', jit=0.05, f=lambda v: Vector((v.x, v.y, v.z - abs(v.y) * 0.6)))
    door(b, 0, -d / 2 - 0.3)
    b.prism([(-0.8, 1.22), (0.8, 1.22), (0.0, 1.78)], 1.0, (0, -d / 2 - 0.15, 0), 'thatch_d', jit=0.1)
    # 살림(앞 왼쪽 x -2 ~ 0.5, y -3 ~ -4 는 비워 둔다 — 식구가 선다)
    if kind == 'a':     # 조 말리는 걸이 · 장작
        for s in (-1, 1):
            limb(b, (3.35, s * 1.3, 0), (3.3, s * 1.2, 1.6), 0.05, 0.045, 'wood_d', seg=4)
        limb(b, (3.3, -1.45, 1.55), (3.3, 1.45, 1.55), 0.045, 0.045, 'wood_l', seg=4)
        for i in range(7):
            y = -1.05 + i * 0.35
            b.cone(0.06, 0.17, 0.55, (3.3, y, 1.26), 'millet' if i % 2 else 'millet_d', seg=5, cap=False, jit=0.1)
        for i in range(6):
            b.cone(0.1, 0.1, 1.2, (-3.35, -1.4 + (i % 3) * 0.22, 0.12 + (i // 3) * 0.2), 'rbark' if i % 2 else 'wood', seg=5, rot=(math.pi / 2, 0, 0.1 * i), jit=0.08)
        pot(b, 1.6, -2.9, 0.75, 'clay')
    elif kind == 'b':   # 토기 무리 · 갈돌과 갈판 · 바구니
        for (x, y, s, m) in [(1.4, -2.95, 0.85, 'clay'), (1.95, -2.75, 0.65, 'clay_r'), (2.4, -3.05, 0.55, 'clay_d')]:
            pot(b, x, y, s, m)
        b.box((0.9, 0.5, 0.14), (-3.45, -1.0, 0.07), 'gran', bevel=0.05, jit=0.08)
        b.cone(0.09, 0.09, 0.6, (-3.45, -1.0, 0.2), 'gran_l', seg=6, rot=(0, math.pi / 2, 0.3), jit=0.06)
        basket(b, -3.4, 0.2, 0, 1.0, 'millet')
        basket(b, 3.4, 1.0, 0, 0.9, 'bean')
    else:               # 짐승 우리 쪽 · 걸어 둔 물고기와 박 · 독
        limb(b, (3.3, -1.6, 0), (3.3, -1.6, 1.7), 0.05, 0.045, 'wood_d', seg=4)
        limb(b, (3.3, 1.6, 0), (3.3, 1.6, 1.7), 0.05, 0.045, 'wood_d', seg=4)
        limb(b, (3.3, -1.7, 1.62), (3.3, 1.7, 1.62), 0.035, 0.035, 'rope_d', seg=4)
        for i in range(6):
            y = -1.2 + i * 0.48
            b.box((0.05, 0.12, 0.5), (3.3, y, 1.3), 'fish' if i % 2 else 'fish_d', jit=0.06, f=lambda v: Vector((v.x, v.y * (1 - 1.4 * abs(v.z)), v.z)))
        b.ball(0.24, (-3.3, -0.6, 0.22), 'thatch_l', sub=1, scale=(1, 1, 0.9), jit=0.06)
        b.ball(0.2, (-3.35, -0.1, 0.18), 'millet_g', sub=1, scale=(1, 1, 0.9), jit=0.06)
        pot(b, 1.7, -2.95, 1.0, 'clay_d')
        sack(b, 2.4, -2.8, 0, 0.6, 'hemp_d')
    b.done(name, smooth=0, shade=(0.68, 1.1), under=0.3)


house('law_house_a', 61, 'a')
house('law_house_b', 71, 'b')
house('law_house_c', 81, 'c')


# ═════ 대장간: 9 x 6 — 앞(-y)이 트였다. 뒷벽 · 맞배 초가 · 풀무 화덕(x 2, y -2.8 — 장면의 불빛 자리) · 모루 돌 · 물통 · 연장 걸이 · 거푸집 · 숯 ═════
b = B()
SW, SD = 9.0, 6.0
b.box((SW + 0.3, SD + 0.3, 0.1), (0, 0, 0.05), 'earth_d', jit=0.06)
for x in (-4.3, -1.45, 1.45, 4.3):
    for y in (-2.8, 2.8):
        b.cone(0.14, 0.12, 2.5, (x, y, 1.25), 'wood_d', seg=6, jit=0.05)
b.box((SW - 0.3, 0.2, 2.3), (0, 2.85, 1.2), 'tint_wall', bevel=0.06, jit=0.07)
for s in (-1, 1):
    b.box((0.2, SD - 0.4, 1.3), (s * 4.32, 0.4, 0.7), 'wattle', jit=0.08)
b.box((SW + 0.2, 0.18, 0.18), (0, -2.8, 2.45), 'wood', jit=0.05)
b.box((SW + 0.2, 0.18, 0.18), (0, 2.8, 2.45), 'wood', jit=0.05)
# 맞배 초가: 용마루가 x 로 길다
for s in (-1, 1):
    b.grid(10, 4, lambda u, v, s=s: ((u - 0.5) * (SW + 1.4), s * (SD / 2 + 0.7) * (1 - v), 2.4 + 1.9 * v - 0.12 * (1 - v) ** 2 + 0.05 * math.sin(u * 37 + v * 11)), 'thatch' if s < 0 else 'thatch_d', jit=0.1)
    b.grid(10, 1, lambda u, v, s=s: ((u - 0.5) * (SW + 1.4), s * (SD / 2 + 0.7) * (1 - v * 0.04), 2.32 + 0.1 * v), 'thatch_d', jit=0.1)
    b.prism([(-SD / 2, 0), (SD / 2, 0), (0, 1.85)], 0.1, (s * (SW / 2 - 0.1), 0, 2.45), 'wattle', rot=(0, 0, math.pi / 2), jit=0.06)
b.box((SW + 1.5, 0.4, 0.22), (0, 0, 4.32), 'thatch_d', bevel=0.05, jit=0.08)
# 위에서 보아도 맞배인 줄 알게: 비탈마다 덧얹은 이엉 띠(밝은 켜) · 처마에서 용마루로 넘는 새끼줄 누름 · 용마루를 따라 엇건 나무
for s in (-1, 1):
    for v0 in (0.3, 0.62):
        b.grid(10, 1, lambda u, v, s=s, v0=v0: ((u - 0.5) * (SW + 1.2), s * (SD / 2 + 0.7) * (1 - v0 - 0.1 * v), 2.42 + 1.9 * (v0 + 0.1 * v) - 0.12 * (1 - v0) ** 2 + 0.07 + 0.04 * math.sin(u * 29 + v0 * 7)), 'thatch_l', jit=0.1)
    for i in range(6):
        x = (i - 2.5) * 1.75
        limb(b, (x, s * (SD / 2 + 0.72), 2.34), (x, s * 0.12, 4.38), 0.045, 0.045, 'rope_d', seg=4, cap=False, jit=0.03)
for i in range(7):
    x = (i - 3) * 1.45
    limb(b, (x, 0.42, 4.2), (x, -0.3, 4.75), 0.05, 0.035, 'wood_d', seg=4, cap=False)
    limb(b, (x, -0.42, 4.2), (x, 0.3, 4.75), 0.05, 0.035, 'wood_d', seg=4, cap=False)
for s in (-1, 1):
    limb(b, (s * (SW / 2 + 0.5), 0.4, 4.1), (s * (SW / 2 + 0.5), -0.3, 4.9), 0.06, 0.04, 'wood_d', seg=4, cap=False)
    limb(b, (s * (SW / 2 + 0.5), -0.4, 4.1), (s * (SW / 2 + 0.5), 0.3, 4.9), 0.06, 0.04, 'wood_d', seg=4, cap=False)
# 화덕: 흙 둥근 가마 · 굴뚝 · 앞 아궁이(빛남) · 가죽 풀무
FX, FY = 2.0, -2.75
b.lathe([(0.8, 0), (0.82, 0.3), (0.7, 0.8), (0.45, 1.15), (0.3, 1.3)], (FX, FY, 0), 'clay_d', seg=10, jit=0.08, f=wob(0.04, 70))
b.cone(0.28, 0.22, 1.4, (FX, FY + 0.05, 1.95), 'mud', seg=7, jit=0.08)
b.cone(0.26, 0.26, 0.06, (FX, FY + 0.05, 2.66), 'soot', seg=7)
b.box((0.5, 0.2, 0.45), (FX, FY - 0.72, 0.35), 'soot')
b.box((0.36, 0.1, 0.3), (FX, FY - 0.8, 0.32), 'glow_fire')
b.cone(0.14, 0.05, 0.12, (FX, FY, 1.33), 'glow_coal', seg=6)
for k in range(3):
    b.ball(0.07, (FX - 0.12 + k * 0.12, FY - 0.86, 0.12), 'glow_coal', sub=1)
b.ball(0.42, (FX + 1.15, FY + 0.15, 0.4), 'hide', sub=1, scale=(1.2, 0.8, 0.55), jit=0.08, f=wob(0.06, 71))
b.box((0.9, 0.08, 0.06), (FX + 1.15, FY + 0.15, 0.62), 'wood_d', jit=0.04)
limb(b, (FX + 0.75, FY + 0.15, 0.35), (FX + 0.35, FY + 0.1, 0.3), 0.06, 0.05, 'wood', seg=5)
# 모루 돌 · 망치 · 물통
stone(b, 0.4, -2.0, 0.42, 'gran', 72, 1.0)
b.box((0.5, 0.32, 0.08), (0.4, -2.0, 0.56), 'iron', bevel=0.02, jit=0.04)
limb(b, (0.2, -2.1, 0.62), (-0.2, -2.35, 0.62), 0.03, 0.03, 'wood', seg=4)
b.box((0.12, 0.2, 0.1), (0.24, -2.08, 0.64), 'iron')
b.box((1.1, 0.55, 0.42), (-1.0, -2.25, 0.21), 'wood', bevel=0.04, jit=0.06)
b.box((0.96, 0.42, 0.04), (-1.0, -2.25, 0.4), 'water')
# 연장 걸이(뒷벽): 집게 · 망치 · 쇠도끼 · 낫 / 칼 걸이: 비파형 동검 넷
b.box((3.2, 0.08, 0.1), (-1.6, 2.68, 1.8), 'wood_d', jit=0.04)
for i in range(5):
    x = -2.9 + i * 0.65
    limb(b, (x, 2.66, 1.78), (x + 0.02, 2.62, 1.0), 0.025, 0.025, 'iron' if i % 2 else 'wood', seg=4)
    if i % 2 == 0:
        b.box((0.24, 0.06, 0.16), (x, 2.6, 1.02), 'iron_l', jit=0.04)
    else:
        b.box((0.08, 0.05, 0.22), (x + 0.07, 2.6, 1.1), 'iron', jit=0.04)
b.box((1.8, 0.08, 0.1), (2.6, 2.68, 1.85), 'wood_d', jit=0.04)
for i in range(4):
    dagger(b, 1.95 + i * 0.44, 2.6, 1.1, 0.75, glow=(i == 1))
# 거푸집(돌 틀) · 숯 더미 · 쇠덩이 · 다 된 것 둔 널판
for i in range(3):
    b.box((0.5, 0.3, 0.12), (-3.4, 1.2 + i * 0.36, 0.06 + (i % 2) * 0.02), 'gran_l' if i % 2 else 'gran', bevel=0.03, jit=0.06)
    b.box((0.06, 0.24, 0.02), (-3.4, 1.2 + i * 0.36, 0.13), 'bronze_d', jit=0)
b.ball(0.7, (-3.3, -1.6, -0.05), 'soot', sub=1, scale=(1.1, 0.9, 0.55), jit=0.1, f=wob(0.12, 73))
basket(b, -2.4, -2.3, 0, 0.9, 'soot')
b.box((1.6, 0.7, 0.08), (-1.2, 1.9, 0.6), 'wood_l', jit=0.06)
for s in (-1, 1):
    b.box((0.08, 0.6, 0.56), (-1.2 + s * 0.7, 1.9, 0.3), 'wood_d', jit=0.04)
for i in range(4):
    b.box((0.36, 0.2, 0.1), (-1.7 + i * 0.34, 1.9, 0.69), 'iron' if i % 2 else 'bronze_d', bevel=0.02, jit=0.06)
b.done('law_smithy', smooth=0, shade=(0.7, 1.08), under=0.3)


# ═════ 장터 가게: 3 x 2 — 낮은 널 마루 + 앞이 낮은 거적 차양(네 기둥) · 물건이 가게마다 다르다 ═════
def stall(name, kind):
    b = B()
    for sx in (-1, 1):
        for sy in (-1, 1):
            b.cone(0.07, 0.06, 0.55, (sx * 1.3, sy * 0.7, 0.27), 'wood_d', seg=5, jit=0.05)
    b.box((2.9, 1.7, 0.1), (0, 0, 0.58), 'wood_l', jit=0.06)
    for i in range(6):
        b.box((0.03, 1.72, 0.11), (-1.2 + i * 0.48, 0, 0.58), 'wood_d', jit=0)
    b.box((2.6, 1.5, 0.03), (0, 0.02, 0.645), 'thatch_l' if kind != 'b' else 'hide_l', jit=0.08)
    for sx in (-1, 1):
        limb(b, (sx * 1.42, 0.92, 0), (sx * 1.42, 0.92, 2.45), 0.07, 0.06, 'wood_d', seg=5, cap=False, jit=0.05)
        limb(b, (sx * 1.42, -0.98, 0), (sx * 1.42, -0.98, 1.95), 0.06, 0.05, 'wood', seg=5, cap=False, jit=0.05)
    awn = 'thatch' if kind != 'b' else 'hide'
    b.grid(6, 3, lambda u, v: ((u - 0.5) * 3.3, 1.12 - 2.4 * v, 2.5 - 0.6 * v - 0.12 * math.sin(v * math.pi) - 0.05 * math.sin(u * math.pi * 3)), awn, jit=0.1)
    b.grid(6, 1, lambda u, v: ((u - 0.5) * 3.3, -1.28, 1.9 - 0.18 * v - 0.05 * math.sin(u * math.pi * 3)), awn + '_d' if awn == 'thatch' else 'hide_d', jit=0.1)
    if kind == 'a':     # 토기: 민무늬 토기 · 붉은 간 토기 · 그릇
        for (x, y, s, m) in [(-0.95, 0.3, 0.75, 'clay'), (-0.4, 0.4, 0.62, 'clay_r'), (0.2, 0.3, 0.8, 'clay_d'), (0.85, 0.35, 0.6, 'clay'), (-0.7, -0.35, 0.45, 'clay_r'), (0.0, -0.4, 0.42, 'clay'), (0.6, -0.35, 0.48, 'clay_r')]:
            pot(b, x, y, s, m, z=0.66)
        for x in (1.05, 1.25):
            b.lathe([(0.08, 0.66), (0.2, 0.72), (0.24, 0.8)], (x, -0.4, 0), 'clay_d', seg=7, jit=0.05)
        pot(b, -1.85, -0.1, 0.9, 'clay_d')
    elif kind == 'b':   # 가죽 · 털 · 엮어 건 물고기 · 사슴뿔
        for i, (x, m) in enumerate([(-0.8, 'hide'), (-0.2, 'fur_l'), (0.45, 'hide_d')]):
            b.box((0.62, 0.9, 0.06 + i * 0.01), (x, 0.15, 0.68 + i * 0.04), m, bevel=0.03, jit=0.06, rot=(0, 0, 0.1 * (i - 1)))
        b.box((0.7, 0.5, 0.18), (0.95, 0.2, 0.75), 'fur', bevel=0.06, jit=0.08)
        limb(b, (-1.42, -0.98, 1.8), (1.42, -0.98, 1.8), 0.025, 0.025, 'rope_d', seg=4)
        for i in range(7):
            x = -1.15 + i * 0.38
            b.box((0.12, 0.05, 0.5), (x, -0.98, 1.45), 'fish' if i % 2 else 'fish_d', jit=0.06, f=lambda v: Vector((v.x * (1 - 1.4 * abs(v.z)), v.y, v.z)))
        for s in (-1, 1):
            limb(b, (-0.5, -0.4, 0.68), (-0.5 + s * 0.3, -0.45, 1.1), 0.03, 0.015, 'cut', seg=4)
    else:               # 곡식(조·기장·콩) 바구니 · 소금 · 조개
        for (x, y, s, f) in [(-0.9, 0.3, 1.0, 'millet'), (-0.15, 0.35, 1.0, 'millet_d'), (0.6, 0.3, 0.95, 'bean'), (-0.6, -0.4, 0.8, 'salt'), (0.25, -0.4, 0.8, 'shell')]:
            basket(b, x, y, 0.66, s, f)
        sack(b, 1.05, -0.35, 0.66, 0.6, 'hemp')
        sack(b, -1.85, 0.0, 0, 0.9, 'hemp_d')
        sack(b, -1.95, 0.6, 0, 0.8, 'hemp')
    b.done(name, smooth=0, shade=(0.72, 1.08), under=0.25)


stall('law_stall_a', 'a')
stall('law_stall_b', 'b')
stall('law_stall_c', 'c')


# ═════ 우물: 돌 둘레(반지름 1.2) · 물 · 두레박 걸이 · 물동이 ═════
b = B()
for k in range(12):
    a = k * math.pi / 6
    for j in range(2):
        aa = a + j * math.pi / 12
        b.box((0.62, 0.4, 0.42), (math.cos(aa) * 1.0, math.sin(aa) * 1.0, 0.21 + j * 0.42), 'gran' if (k + j) % 3 else ('gran_l' if j else 'gran_d'), bevel=0.06, jit=0.1, rot=(0, 0, aa + math.pi / 2))
b.cone(0.82, 0.82, 0.05, (0, 0, 0.72), 'water', seg=12, jit=0.04)
b.cone(0.5, 0.5, 0.055, (0.1, 0.1, 0.72), 'water_d', seg=8, jit=0.03)
for s in (-1, 1):
    limb(b, (s * 1.25, 0.15, 0), (s * 1.15, 0.15, 2.1), 0.07, 0.06, 'wood_d', seg=5, jit=0.05)
limb(b, (-1.35, 0.15, 2.0), (1.35, 0.15, 2.0), 0.06, 0.06, 'wood', seg=5)
limb(b, (0.1, 0.15, 1.98), (0.1, 0.15, 1.2), 0.012, 0.012, 'rope_d', seg=3)
b.lathe([(0.12, 1.0), (0.17, 1.08), (0.18, 1.2), (0.15, 1.24)], (0.1, 0.15, 0), 'wood_l', seg=7, jit=0.05)
pot(b, 1.25, -0.85, 0.75, 'clay')
pot(b, -1.2, -0.95, 0.6, 'clay_r')
b.done('law_well', smooth=0, shade=(0.72, 1.08), under=0.25)


# ═════ 재판 북: 북면이 앞뒤(±y)를 본다 · 지름 2 · 붉은 몸통에 쇠못 · 두 기둥 틀 · 꼭대기에 나무 새 · 북채 둘 ═════
b = B()
DZ = 1.75
prof = [(0.94, -0.6), (1.02, -0.45), (1.06, -0.2), (1.07, 0.0), (1.06, 0.2), (1.02, 0.45), (0.94, 0.6)]
b.lathe([(r, z) for r, z in prof], (0, 0, DZ), 'red', seg=16, rot=(math.pi / 2, 0, 0), cap=False, jit=0.04)
for s in (-1, 1):
    b.cone(0.96, 0.96, 0.04, (0, s * 0.6, DZ), 'white', seg=16, rot=(math.pi / 2, 0, 0), jit=0.03)
    b.cone(0.98, 0.98, 0.08, (0, s * 0.56, DZ), 'hide_d', seg=16, rot=(math.pi / 2, 0, 0), cap=False, jit=0.03)
    b.cone(0.36, 0.36, 0.045, (0, s * 0.605, DZ), 'hide_l', seg=12, rot=(math.pi / 2, 0, 0), jit=0.03)
    for k in range(16):
        a = k * math.pi / 8
        b.box((0.06, 0.06, 0.06), (math.cos(a) * 0.96, s * 0.52, DZ + math.sin(a) * 0.96), 'bronze_l', jit=0)
for z in (-0.25, 0.25):
    b.lathe([(1.075, z - 0.04), (1.085, z), (1.075, z + 0.04)], (0, 0, DZ), 'bronze', seg=16, rot=(math.pi / 2, 0, 0), cap=False, jit=0.03)
for s in (-1, 1):
    b.box((0.2, 0.24, 3.15), (s * 1.18, 0, 1.575), 'wood_d', bevel=0.03, jit=0.05)
    b.box((0.5, 0.6, 0.12), (s * 1.18, 0, 0.06), 'gran', bevel=0.04, jit=0.08)
    limb(b, (s * 1.18, 0.0, 0.25), (s * 1.6, 0.0, 0.0), 0.06, 0.06, 'wood', seg=4)
    b.box((0.36, 0.16, 0.12), (s * 1.08, 0, DZ), 'wood', jit=0.05)
b.box((2.8, 0.26, 0.2), (0, 0, 3.12), 'wood', jit=0.05)
for s in (-1, 1):
    limb(b, (s * 1.3, 0, 3.1), (s * 1.62, 0, 3.5), 0.07, 0.04, 'wood_d', seg=4)
# 나무 새(솟대 새) 하나 — 앞을 본다
b.box((0.16, 0.5, 0.18), (0, 0, 3.4), 'wood_l', bevel=0.05, jit=0.05)
b.box((0.13, 0.16, 0.14), (0, -0.28, 3.5), 'wood_l', bevel=0.04, jit=0.04)
b.cone(0.05, 0.0, 0.16, (0, -0.42, 3.5), 'wood_d', seg=4, rot=(math.pi / 2, 0, 0))
b.box((0.6, 0.18, 0.03), (0, 0.04, 3.46), 'wood', jit=0.04)
limb(b, (0, 0.2, 3.38), (0, 0.38, 3.5), 0.05, 0.02, 'wood_l', seg=4)
for s in (-1, 1):
    limb(b, (s * 0.3, -0.72, 0.03), (s * 0.55, -1.2, 0.08), 0.035, 0.03, 'wood', seg=5)
    b.ball(0.07, (s * 0.3, -0.72, 0.06), 'hide_l', sub=1)
b.done('law_drum', smooth=0, shade=(0.8, 1.06), under=0.2)

# 족장 자리: 통나무 걸상 + 털가죽
b = B()
b.box((1.3, 0.7, 0.42), (0, 0, 0.21), 'wood', bevel=0.06, jit=0.07)
b.box((1.4, 0.8, 0.06), (0, 0, 0.44), 'fur', bevel=0.03, jit=0.08, f=lambda v: Vector((v.x, v.y, v.z - 0.06 * (abs(v.x) > 0.5))))
b.box((1.0, 0.1, 0.7), (0, 0.38, 0.75), 'wood_d', bevel=0.04, jit=0.06)
b.box((1.6, 1.2, 0.03), (0, -0.4, 0.015), 'hide_l', bevel=0.02, jit=0.06)
b.done('law_seat', smooth=0, shade=(0.76, 1.08), under=0.2)

# 청동 거울 장대: 높은 장대 끝의 거울(앞을 본다) · 방울 · 붉은 천
b = B()
limb(b, (0, 0, 0), (0, 0, 3.8), 0.07, 0.05, 'wood_d', seg=5, jit=0.05)
stone(b, 0, 0, 0.35, 'gran', 90, 0.6)
mirror(b, 0, -0.08, 3.55, 0.3, 0.1)
for s in (-1, 1):
    limb(b, (0, 0, 3.2), (s * 0.35, 0, 3.0), 0.02, 0.02, 'wood', seg=3)
    b.ball(0.07, (s * 0.35, 0, 2.92), 'bronze_l', sub=1)
b.box((0.12, 0.03, 0.9), (0.12, 0.04, 2.7), 'red', jit=0.05, f=lambda v: Vector((v.x + 0.08 * math.sin(v.z * 7), v.y, v.z)))
b.done('law_pole', smooth=0, shade=(0.8, 1.08), under=0.15)

# 제단: 너럭돌 위 가죽 · 비파형 동검(세워 꽂음) · 거울 · 민무늬 토기 둘
b = B()
b.ball(0.5, (0, 0, 0.36), 'gran', sub=2, scale=(1.4, 1.0, 0.8), jit=0.1, f=lambda v: wob(0.08, 120)(Vector((v.x, v.y, min(v.z, 0.36)))))
b.box((1.0, 0.72, 0.05), (0, -0.03, 0.74), 'hide', bevel=0.02, jit=0.06)
b.box((1.0, 0.05, 0.3), (0, -0.4, 0.6), 'hide_d', jit=0.06, f=lambda v: Vector((v.x * (1 - 0.3 * (0.15 - v.z)), v.y, v.z)))
dagger(b, -0.22, 0.0, 1.05, 0.9)
b.box((0.24, 0.12, 0.06), (-0.22, 0.0, 0.79), 'wood_d', jit=0.04)
mirror(b, 0.24, 0.06, 1.05, 0.24, 0.25)
limb(b, (0.24, 0.3, 0.77), (0.24, 0.1, 1.15), 0.025, 0.02, 'wood_d', seg=4)
pot(b, -0.95, 0.1, 0.6, 'clay_r')
pot(b, 0.95, -0.05, 0.5, 'clay', fill='millet')
b.done('law_altar', smooth=0, shade=(0.76, 1.08), under=0.2)


# ═════ 증거: 곡식 자루 · 매듭 · 발자국 · 낟알 · 쏟아진 낟알 ═════
b = B()
b.lathe([(0.3, 0.0), (0.5, 0.1), (0.58, 0.42), (0.52, 0.72), (0.34, 0.9), (0.14, 1.0), (0.11, 1.08), (0.2, 1.22), (0.26, 1.3), (0.05, 1.34)], (0, 0, 0), 'hemp', seg=10, jit=0.08, f=wob(0.05, 101))
for k in range(5):
    b.ball(0.05, (0.42 + k * 0.08, -0.35 + k * 0.03, 0.03), 'millet', sub=1, scale=(1, 1, 0.6))
b.cone(0.5, 0.42, 0.04, (0, 0, 0.02), 'millet_d', seg=8, jit=0.06)
b.done('law_sack', smooth=0, shade=(0.74, 1.08), under=0.2)
b = B()
b.lathe([(0.15, 1.05), (0.17, 1.1), (0.15, 1.15)], (0, 0, 0), 'wk', seg=8, cap=False, jit=0.02)
b.ball(0.085, (0, -0.15, 1.1), 'wk', sub=1, jit=0.02)
for s in (-1, 1):
    limb(b, (s * 0.02, -0.18, 1.08), (s * 0.12, -0.26, 0.82), 0.03, 0.025, 'wk', seg=4, jit=0.02)
    b.box((0.13, 0.04, 0.08), (s * 0.08, -0.2, 1.12), 'wk', rot=(0, s * 0.6, 0), jit=0.02)
b.done('law_knot', smooth=0, shade=(0.86, 1.04), under=0.1)

# 발자국: 길이·너비 1(장면이 크기를 준다), 발끝 = +x(블렌더 x), 두께 0.03(가운데 아래)
b = B()
SOLE = [(0.5, 0.0), (0.46, 0.2), (0.32, 0.36), (0.12, 0.4), (-0.06, 0.3), (-0.22, 0.28), (-0.4, 0.3), (-0.5, 0.15), (-0.5, -0.15), (-0.4, -0.3), (-0.22, -0.28), (-0.06, -0.3), (0.12, -0.4), (0.32, -0.36), (0.46, -0.2)]
b.prism(SOLE, 0.03, (0, 0, -0.02), 'earth_d', rot=(math.pi / 2, 0, 0), jit=0)
b.done('law_print', smooth=0, shade=(1, 1), under=0.0)
b = B()
for k, (x, y, z) in enumerate([(0, 0, 0), (0.12, 0.07, 0.01), (-0.1, 0.09, 0), (0.04, -0.12, 0.01)]):
    b.cone(0.055, 0.0, 0.07, (x, y, z + 0.035), 'millet', seg=4, rot=(0, 0, k * 0.7), jit=0)
    b.cone(0.055, 0.0, 0.05, (x, y, z - 0.025), 'millet', seg=4, rot=(math.pi, 0, k * 0.7), jit=0)
b.done('law_grain', smooth=0, shade=(1, 1), under=0.0)
b = B()
b.ball(0.5, (0, 0, -0.32), 'millet', sub=1, scale=(1.4, 0.8, 0.85), jit=0.08, f=wob(0.1, 103))
b.ball(0.3, (0.6, 0.15, -0.2), 'millet_d', sub=1, scale=(1.2, 1.0, 0.8), jit=0.08, f=wob(0.1, 104))
b.box((0.5, 0.26, 0.06), (-0.75, 0.3, 0.04), 'wood_l', bevel=0.02, rot=(0, 0, 0.5), jit=0.04)
limb(b, (-0.55, 0.42, 0.06), (-0.15, 0.62, 0.08), 0.03, 0.03, 'wood', seg=4)
b.done('law_spill', smooth=0, shade=(0.86, 1.06), under=0.1)


# ═════ 의심받는 사람의 표: 띠(흰색 — 장면이 끈 색으로) · 신 · 다친 사람 머리 천 ═════
b = B()
b.box((0.76, 0.46, 0.1), (0, 0, 0), 'wk', bevel=0.04, jit=0.02)
b.ball(0.08, (0.12, -0.25, 0.0), 'wk', sub=1, jit=0.02)
for s in (-1, 1):
    b.box((0.08, 0.03, 0.28), (0.12 + s * 0.05, -0.25, -0.16), 'wk', rot=(0, s * 0.25, 0), jit=0.02)
b.done('law_belt', smooth=0, shade=(0.9, 1.04), under=0.1)
b = B()
b.box((0.26, 0.4, 0.1), (0, -0.02, 0), 'hide_d', bevel=0.04, jit=0.04, f=lambda v: Vector((v.x * (1 - 0.3 * max(0, -v.y * 2)), v.y, v.z * (1 - 0.4 * max(0, -v.y * 2)))))
b.box((0.2, 0.18, 0.03), (0, 0.06, 0.05), 'hide', jit=0.04)
b.done('law_shoe', smooth=0, shade=(0.8, 1.06), under=0.2)
b = B()
b.lathe([(0.33, -0.2), (0.34, -0.14), (0.32, -0.08)], (0, 0, 0), 'white', seg=10, cap=False, jit=0.02)
b.box((0.16, 0.66, 0.06), (0, 0, 0.0), 'white', rot=(0, 0, 0.5), jit=0.02, f=lambda v: Vector((v.x, v.y, v.z - 0.5 * v.y * v.y)))
for s in (-1, 1):
    b.box((0.06, 0.04, 0.24), (0.3 + s * 0.04, 0.12, -0.28), 'white', rot=(0, 0.2 * s, 0), jit=0.02)
b.ball(0.05, (-0.12, -0.33, -0.14), 'red', sub=1)
b.done('law_bandage', smooth=0, shade=(0.88, 1.04), under=0.1)

# 솥: 고임돌 셋 위 민무늬 토기 — 조죽이 담김 / 텅 빔(그을음만)
for nm, fill in (('law_pot_full', 'millet'), ('law_pot_empty', None)):
    b = B()
    for k in range(3):
        a = k * 2.094 + 0.3
        stone(b, math.cos(a) * 0.36, math.sin(a) * 0.36, 0.13, 'gran_d' if k else 'gran', 110 + k, 1.1)
    b.cone(0.3, 0.26, 0.04, (0, 0, 0.02), 'soot', seg=8)
    b.lathe([(0.16, 0.12), (0.32, 0.24), (0.38, 0.44), (0.33, 0.62), (0.3, 0.68), (0.34, 0.74)], (0, 0, 0), 'clay_d' if fill else 'clay', seg=9, jit=0.06)
    b.cone(0.3, 0.3, 0.01, (0, 0, 0.71 if fill else 0.5), fill or 'soot', seg=9, jit=0.02)
    if fill:
        limb(b, (0.05, 0.05, 0.68), (0.36, -0.3, 0.98), 0.025, 0.02, 'wood', seg=4)
    else:
        b.lathe([(0.04, 0.0), (0.15, 0.06), (0.17, 0.1)], (0.62, -0.1, 0), 'clay_d', seg=7, jit=0.05)
    b.done(nm, smooth=0, shade=(0.76, 1.08), under=0.2)

# 깃대 · 깃발(천은 tint_cloth — 집 주인 옷 색)
b = B()
limb(b, (0, 0, 0), (0, 0, 3.3), 0.06, 0.045, 'wood_d', seg=5, jit=0.05)
b.cone(0.07, 0.0, 0.18, (0, 0, 3.38), 'wood_l', seg=5)
stone(b, 0.0, 0.0, 0.22, 'gran', 115, 0.6)
b.done('law_flagpole', smooth=0, shade=(0.76, 1.08), under=0.2)
b = B()
b.grid(6, 2, lambda u, v: (u * 1.0 - 0.5, 0.06 * math.sin(u * 5.0) * u, (v - 0.5) * 0.66 * (1 - 0.15 * u)), 'tint_cloth', jit=0.05)
b.grid(6, 2, lambda u, v: (u * 1.0 - 0.5, 0.06 * math.sin(u * 5.0) * u - 0.002, (0.5 - v) * 0.66 * (1 - 0.15 * u)), 'tint_cloth', jit=0.05, tone=0.86)
b.done('law_flag', smooth=0, shade=(0.92, 1.04), under=0.0)


# ═════ 마을 살림: 돼지 · 우리 · 조 걸이 · 장작 · 갈돌 · 토기 무리 ═════
b = B()
b.ball(0.4, (0, 0.05, 0.55), 'pig', sub=2, scale=(0.85, 1.45, 0.85), jit=0.06, f=wob(0.04, 120))
b.ball(0.26, (0, -0.58, 0.6), 'pig', sub=1, scale=(0.9, 1.0, 0.9), jit=0.06)
b.cone(0.12, 0.1, 0.16, (0, -0.84, 0.55), 'snout', seg=7, rot=(math.pi / 2, 0, 0))
for s in (-1, 1):
    b.cone(0.09, 0.0, 0.16, (s * 0.15, -0.52, 0.86), 'pig_l', seg=4, rot=(0.4, s * 0.4, 0))
    for t in (-1, 1):
        b.cone(0.08, 0.07, 0.36, (s * 0.2, t * 0.38, 0.18), 'pig', seg=5)
b.cone(0.03, 0.01, 0.2, (0, 0.62, 0.65), 'pig_l', seg=4, rot=(-0.8, 0, 0))
b.box((0.36, 0.7, 0.2), (0, 0.1, 0.82), 'pig_l', bevel=0.08, jit=0.06)
b.done('law_pig', smooth=0, shade=(0.8, 1.1), under=0.2)
b = B()
PW, PD = 3.4, 2.6
pts = [(-PW / 2, -PD / 2), (PW / 2, -PD / 2), (PW / 2, PD / 2), (-PW / 2, PD / 2)]
for i in range(4):
    (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % 4]
    n = max(2, int(math.hypot(x1 - x0, y1 - y0) / 0.6))
    for k in range(n):
        t = k / n
        limb(b, (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 0), (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 0.95 + hsh(i, k, 7) * 0.12), 0.045, 0.04, 'wood_d' if k % 2 else 'wood', seg=4, cap=False)
    for z in (0.35, 0.75):
        b.box((math.hypot(x1 - x0, y1 - y0), 0.07, 0.16), ((x0 + x1) / 2, (y0 + y1) / 2, z), 'wattle', rot=(0, 0, math.atan2(y1 - y0, x1 - x0)), jit=0.08)
b.cone(PW / 2 * 1.2, PW / 2 * 1.2, 0.03, (0, 0, 0.015), 'mud_d', seg=8, scale=(1, PD / PW, 1), jit=0.08)
b.box((1.0, 0.36, 0.24), (0.8, 0.8, 0.12), 'wood', bevel=0.04, jit=0.06)
b.box((0.86, 0.24, 0.03), (0.8, 0.8, 0.23), 'millet_g')
b.done('law_pen', smooth=0, shade=(0.76, 1.08), under=0.2)
b = B()
for s in (-1, 1):
    limb(b, (s * 1.3, 0.3, 0), (s * 1.2, 0, 1.75), 0.06, 0.05, 'wood_d', seg=5, jit=0.06)
    limb(b, (s * 1.3, -0.3, 0), (s * 1.2, 0, 1.75), 0.06, 0.05, 'wood', seg=5, jit=0.06)
limb(b, (-1.45, 0, 1.7), (1.45, 0, 1.72), 0.055, 0.05, 'wood_l', seg=5, jit=0.06)
for i in range(7):
    x = -1.0 + i * 0.33
    b.cone(0.07, 0.2, 0.6, (x, 0.0, 1.36), 'millet' if i % 2 else 'thatch', seg=5, cap=False, jit=0.1)
    b.cone(0.085, 0.085, 0.06, (x, 0.0, 1.66), 'thatch_d', seg=5, jit=0.04)
b.done('law_rack', smooth=0, shade=(0.74, 1.08), under=0.2)
b = B()
for i in range(9):
    r, c = i // 4 if i < 8 else 2, i % 4 if i < 8 else 1.5
    b.cone(0.13, 0.13, 1.3, (-0.42 + c * 0.28, 0, 0.14 + r * 0.24), 'rbark' if i % 3 else 'wood', seg=6, rot=(math.pi / 2, 0, 0.06 * (i % 3 - 1)), jit=0.08)
    b.cone(0.11, 0.11, 0.01, (-0.42 + c * 0.28, -0.655, 0.14 + r * 0.24), 'cut', seg=6, rot=(math.pi / 2, 0, 0))
b.done('law_wood', smooth=0, shade=(0.74, 1.08), under=0.2)
b = B()
b.box((1.0, 0.55, 0.16), (0, 0, 0.08), 'gran', bevel=0.06, jit=0.08, f=lambda v: Vector((v.x, v.y, v.z - 0.05 * (1 - (2 * v.x) ** 2) * (v.z > 0))))
b.cone(0.1, 0.1, 0.62, (0.05, 0, 0.24), 'gran_l', seg=6, rot=(0, math.pi / 2, 0.35), jit=0.06)
for k in range(5):
    b.ball(0.035, (-0.3 + k * 0.12, 0.2, 0.17), 'millet', sub=1)
b.done('law_quern', smooth=0, shade=(0.76, 1.08), under=0.2)
b = B()
b.box((1.9, 1.3, 0.06), (0, 0, 0.03), 'thatch_d', bevel=0.02, jit=0.06)
for (x, y, s, m, f) in [(-0.6, 0.25, 1.15, 'clay', None), (0.15, 0.3, 0.9, 'clay_d', None), (0.7, 0.1, 1.0, 'clay', 'millet'), (-0.25, -0.35, 0.7, 'clay_r', None), (0.4, -0.4, 0.6, 'clay_r', None), (-0.8, -0.35, 0.55, 'clay', 'bean')]:
    pot(b, x, y, s, m, z=0.05, fill=f)
b.done('law_pots', smooth=0, shade=(0.72, 1.08), under=0.25)


# ═════ 성 밖: 밭(8 x 5, 조 이랑) · 먼 산 · 땅 얼룩 ═════
def field(name, ripe, seed):
    """밭 8 x 5: 바닥 판(윗면·옆면) · 고랑 · 조 이랑 넷(천막꼴 띠). 성 밖에 54번 그려지니 세모를 아낀다(세모 ~116)."""
    b = B()
    X, Y, T = 4.1, 2.6, 0.04
    face(b, 'earth', [Vector((-X, -Y, T)), Vector((X, -Y, T)), Vector((X, Y, T)), Vector((-X, Y, T))], (0, 0, 1), 1.0, 0.06)
    for (ax, ay, bx, by_, o) in ((-X, -Y, X, -Y, (0, -1, 0)), (X, Y, -X, Y, (0, 1, 0)), (-X, Y, -X, -Y, (-1, 0, 0)), (X, -Y, X, Y, (1, 0, 0))):
        face(b, 'earth_d', [Vector((ax, ay, -0.04)), Vector((bx, by_, -0.04)), Vector((bx, by_, T)), Vector((ax, ay, T))], o, 1.0, 0.04)
    for r in range(4):
        y = -1.95 + r * 1.3
        face(b, 'earth_d' if r % 2 else 'earth_l', [Vector((-3.9, y + 0.42, T + 0.01)), Vector((3.9, y + 0.42, T + 0.01)), Vector((3.9, y + 0.86, T + 0.01)), Vector((-3.9, y + 0.86, T + 0.01))], (0, 0, 1), 1.0, 0.06)
        def crop(u, v, y=y, r=r):
            x = (u - 0.5) * 7.6
            hh = (0.6 if ripe else 0.46) * (0.8 + 0.4 * hsh(int(u * 6 + 0.5), r, seed))
            return (x, y + (v - 0.5) * 0.62, T + 0.02 + hh * math.sin(v * math.pi))
        b.grid(6, 2, crop, ('millet' if r % 2 else 'millet_d') if ripe else ('millet_g' if r % 2 else 'grass_d'), jit=0.12)
    b.done(name, smooth=0, shade=(0.8, 1.06), under=0.0)


field('law_field', True, 3)
field('law_field_g', False, 7)

b = B()
NX, NY = 14, 6
def hill(u, v):
    x = (u - 0.5) * 46
    y = (v - 0.5) * 16
    e = (1 - (2 * u - 1) ** 2) * (1 - (2 * v - 1) ** 2)
    h = 14 * e ** 0.9 * (0.75 + 0.5 * hsh(int(u * NX), int(v * NY), 9)) + 3.0 * math.sin(u * 9.0) * e
    return (x, y, h - 0.6)
for i in range(NX):
    for j in range(NY):
        u0, u1, v0, v1 = i / NX, (i + 1) / NX, j / NY, (j + 1) / NY
        q = [hill(u0, v0), hill(u1, v0), hill(u1, v1), hill(u0, v1)]
        c = Vector(((q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2, (q[0][2] + q[2][2]) / 2))
        r = hsh(i, j, 11)
        m = 'rock' if c.z > 11 and r < 0.5 else 'hill_d' if r < 0.35 else 'hill_l' if r < 0.55 else 'hill'
        face(b, m, [Vector(q[0]), Vector(q[1]), Vector(q[2])], (0, 0, 1), 1.0, 0.06)
        face(b, m, [Vector(q[0]), Vector(q[2]), Vector(q[3])], (0, 0, 1), 1.0, 0.06)
b.done('law_hill', smooth=0, shade=(0.8, 1.08), under=0.0)

b = B()
pts = [Vector((math.cos(k * 0.785) * (0.5 + hsh(k, 5) * 0.18), math.sin(k * 0.785) * (0.5 + hsh(k, 6) * 0.18), 0.0)) for k in range(8)]
for k in range(8):
    face(b, 'tint_c', [Vector((0, 0, 0.01)), pts[k], pts[(k + 1) % 8]], (0, 0, 1), 1.0, 0.0)
b.done('law_patch', smooth=0, shade=(1, 1), under=0.0)

export('law.glb')

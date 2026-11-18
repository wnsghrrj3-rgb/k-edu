"""케이월드 「만세 전날 밤」(S09) 장면에만 쓰는 모델 — manse.glb. 이름은 모두 mn_ 로 시작한다.
1919년 3월 어느 읍내의 밤: 벽돌 예배당 · 헌병 주재소 · 다섯 집(초가·기와) · 기와집 · 초가 · 이층 상점 · 상점 · 인쇄소 · 학교 ·
장터 가게(거적 덮음) · 장터 종 · 거리 등 · 숨을 곳(볏짚 더미 · 장독대) · 등사기 · 지하 뚜껑 · 태극기 그리는 상 · 손 태극기 ·
납작 돌 · 돌담 · 먼 집 · 장작 더미.
앞(문)은 -y(three 에서 +z). 바닥 가운데가 원점. tint_wall(벽) · tint_roof(지붕) · tint_cloth(천) · tint_stone(돌) 는 장면이 색을 바꿀 수 있다. glow_* 는 스스로 빛난다.
지붕·창호 함수는 make_night.py · make_refuge.py 와 같은 꼴(그 파일들은 다른 장면 것이라 불러오지 않고 옮겨 적었다)."""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
PI = math.pi
for n, c in [('tint_wall', 0xd9c6a2), ('tint_roof', 0x55505e), ('tint_cloth', 0x8a7a5a), ('tint_stone', 0x8a7a64),
             ('thatch', 0xd9b25a), ('thatch_d', 0xb08a3e), ('dark', 0x2a2420), ('wood', 0x7a5632), ('wood_d', 0x4e3620), ('wood_l', 0xb08a5a),
             ('stone', 0x9a968e), ('stone_d', 0x7d7a74), ('plaster', 0xf0ebdc), ('plaster_g', 0xd6d2c4), ('paper', 0xcfc6ac), ('tile', 0x5a5b62), ('tile_l', 0x8e8e94),
             ('mud', 0xb89868), ('iron', 0x3a3a40), ('white', 0xf6f4ee), ('red', 0xc8302e), ('blue', 0x1f4aa0), ('ink', 0x1e1a18),
             ('brick', 0x9a5440), ('brick_d', 0x74402f), ('brick_l', 0xc89a7a), ('glass', 0x34465e), ('glass_l', 0x5a7088),
             ('onggi', 0x6a4030), ('onggi_l', 0x8a5a40), ('straw', 0xd9b25a), ('straw_d', 0xb08a3e), ('rope', 0xc8b080), ('bronze', 0xb08a40), ('bronze_d', 0x7a5e2a),
             ('board', 0xe6dcc0), ('cream', 0xe8dcbc), ('green', 0x4a6a4a), ('mat', 0xb89a5c), ('mat_d', 0x8f7442),
             ('glow_win', 0xffd88a), ('glow_dim', 0xd8b878), ('glow_lamp', 0xfff0c8), ('glow_red', 0xff5a4a), ('glow_cellar', 0xffb860)]:
    mat(n, c)


def sgnpow(v, p):
    return math.copysign(abs(v) ** p, v)


# ───────── 공통 조각 ─────────
def tile_roof(b, w, d, z0, h, over=0.7, lift=0.45, m='tile', nx=14, gable='plaster'):
    """맞배 기와지붕(용마루는 x 로): 처마 끝이 살짝 들리고, 기왓골이 줄무늬로 보인다."""
    W, D = w + 2 * over, d + 2 * over

    def surf(u, v, dz=0.0):
        e = abs(2 * v - 1)
        return ((u - 0.5) * W, (v - 0.5) * D, z0 + h * (1 - e ** 1.25) + lift * (abs(2 * u - 1) ** 3) * e + 0.12 * e * e + dz)
    for i in range(nx):
        u0, u1 = i / nx, (i + 1) / nx
        b.grid(1, 6, lambda u, v, u0=u0, u1=u1: surf(u0 + (u1 - u0) * u, v), m, tone=1.0 if i % 2 else 0.84, jit=0.04)
    b.grid(max(2, nx // 3), 6, lambda u, v: surf(1 - u, v, -0.14), 'dark', jit=0)
    b.box((W + 0.1, 0.3, 0.24), (0, 0, z0 + h + 0.08), 'tile_l', bevel=0.05, f=lambda v: Vector((v.x, v.y, v.z + lift * 0.5 * (abs(v.x) / (W / 2)) ** 3)))
    for s in (-1, 1):
        b.box((0.3, 0.34, 0.5), (s * (W / 2 - 0.08), 0, z0 + h + 0.3 + lift * 0.5), 'tile_l', bevel=0.06, rot=(0, -s * 0.35, 0))
        if gable:
            b.prism([(-d / 2, 0), (d / 2, 0), (0, h * 0.82)], 0.14, (s * (w / 2 - 0.02), 0, z0), gable, rot=(0, 0, PI / 2))


def thatch_roof(b, w, d, z0, h, over=0.55, m='thatch', seg=16):
    """초가지붕: 둥근 짚 덩이 + 용마루 + 새끼줄 · 처마 밑 그늘판."""
    prof = [(0.0, -0.16), (0.1, 0.0), (0.45, 0.5), (0.8, 0.86), (1.0, 1.0)]
    ridge = max(0.25, (w - d) / 2 + 0.25)

    def fn(u, v):
        a = u * 2 * PI
        i = min(int(v * (len(prof) - 1)), len(prof) - 2)
        t = v * (len(prof) - 1) - i
        k = prof[i][0] + (prof[i + 1][0] - prof[i][0]) * t
        zz = prof[i][1] + (prof[i + 1][1] - prof[i][1]) * t
        rx = (w / 2 + over) * (1 - k) + ridge * k
        ry = (d / 2 + over) * (1 - k) + 0.12 * k
        return (rx * sgnpow(math.cos(a), 0.62), ry * sgnpow(math.sin(a), 0.62), z0 + h * zz)
    b.grid(seg, 6, fn, m, jit=0.1)
    b.box((ridge * 2 + 0.5, 0.34, 0.16), (0, 0, z0 + h + 0.02), 'thatch_d', bevel=0.05, jit=0.06)
    for v0 in (0.42, 0.7):                           # 새끼줄 두 둘레(지붕 면을 따라)
        def band(u, v, v0=v0):
            x, y, z = fn(u, v0 + v * 0.04)
            return (x * 1.012, y * 1.02, z + 0.025)
        b.grid(seg, 1, band, 'thatch_d', jit=0.03)
    b.grid(seg, 1, lambda u, v: ((w / 2 + over) * sgnpow(math.cos(u * 2 * PI), 0.62) * (0.3 + 0.67 * v), (d / 2 + over) * sgnpow(math.sin(u * 2 * PI), 0.62) * (0.3 + 0.67 * v), z0 - 0.1), 'dark', jit=0)


def gable(b, L, D, z0, H, m='tint_roof', over=0.5, strips=8, end='wood_d', ridge='iron'):
    """용마루가 x 로 긴 맞배(함석·슬레이트) 지붕. 골이 줄무늬로 진다."""
    hw = D / 2 + over
    b.prism([(-hw + 0.08, 0), (hw - 0.08, 0), (0, H - 0.06)], L - 0.24, (0, 0, z0), end, rot=(0, 0, PI / 2), jit=0.03)
    for s in (-1, 1):
        for i in range(strips):
            x0, x1 = -L / 2 + L * i / strips, -L / 2 + L * (i + 1) / strips
            b.grid(1, 1, lambda u, v, x0=x0, x1=x1, s=s: (x0 + (x1 - x0) * u, s * hw * (1 - v), z0 + H * v + 0.04), m, tone=1.0 if i % 2 else 0.86, jit=0.03)
    b.box((L + 0.1, 0.22, 0.12), (0, 0, z0 + H + 0.05), ridge, jit=0.03)


def hip(b, w, d, tw, td, h, z, m, **k):
    """네모뿔대(우진각 지붕)."""
    b.box((w, d, h), (0, 0, z + h / 2), m, f=lambda v: Vector((v.x * (tw / w if v.z > 0 else 1), v.y * (td / d if v.z > 0 else 1), v.z)), **k)


def lattice(b, x, y, z, w, h, m='paper', nv=3, pane=True):
    """창호(앞 -y): 종이 + 살. pane 이 거짓이면 살만(창 종이는 장면이 따로 둔다)."""
    t = 0.05
    if pane:
        b.box((w, t, h), (x, y, z), m, jit=0)
    yy = y - (0 if pane else 0.03)
    b.box((w + 0.1, t + 0.03, 0.07), (x, yy, z + h / 2), 'wood_d', jit=0); b.box((w + 0.1, t + 0.03, 0.07), (x, yy, z - h / 2), 'wood_d', jit=0)
    for i in range(nv):
        b.box((0.035 if 0 < i < nv - 1 else 0.07, t + 0.03, h), (x - w / 2 + w * i / (nv - 1), yy, z), 'wood_d', jit=0)
    b.box((w, t + 0.03, 0.03), (x, yy, z), 'wood_d', jit=0)


def sash(b, x, y, z, w, h, glassm='glass', frame='white', side=False):
    """유리 미닫이 창(근대 건물): 흰 테 · 유리 · 십자 살 · 창턱."""
    if not side:
        b.box((w + 0.16, 0.06, h + 0.16), (x, y + 0.01, z), frame, jit=0)
        b.box((w, 0.07, h), (x, y - 0.005, z), glassm, jit=0.02)
        b.box((0.05, 0.09, h), (x, y - 0.02, z), frame, jit=0); b.box((w, 0.09, 0.05), (x, y - 0.02, z + h * 0.1), frame, jit=0)
        b.box((w + 0.3, 0.16, 0.07), (x, y - 0.06, z - h / 2 - 0.08), frame, jit=0)
    else:
        b.box((0.06, w + 0.16, h + 0.16), (x, y, z), frame, jit=0)
        b.box((0.07, w, h), (x, y, z), glassm, jit=0.02)
        b.box((0.09, 0.05, h), (x, y, z), frame, jit=0)


def arch_window(b, x, y, z, w, h, glassm='glass', frame='plaster'):
    """뾰족 아치 창(예배당): 아래는 네모, 위는 세모 뾰족."""
    b.box((w + 0.18, 0.08, h), (x, y + 0.01, z), frame, jit=0)
    b.prism([(-(w + 0.18) / 2, 0), ((w + 0.18) / 2, 0), (0, w * 0.62)], 0.08, (x, y + 0.01, z + h / 2), frame, jit=0)
    b.box((w, 0.09, h - 0.06), (x, y - 0.004, z), glassm, jit=0.02)
    b.prism([(-w / 2, 0), (w / 2, 0), (0, w * 0.5)], 0.09, (x, y - 0.004, z + h / 2 - 0.03), glassm, jit=0.02)
    b.box((0.045, 0.11, h + w * 0.4), (x, y - 0.02, z + w * 0.18), 'wood_d', jit=0)
    b.box((w, 0.11, 0.045), (x, y - 0.02, z + h * 0.12), 'wood_d', jit=0)
    b.box((w + 0.34, 0.2, 0.08), (x, y - 0.07, z - h / 2 - 0.06), frame, jit=0)


def jar(b, x, y, s=1.0, m='onggi', lid=True, z0=0.0):
    b.lathe([(0.2 * s, z0), (0.36 * s, z0 + 0.14 * s), (0.44 * s, z0 + 0.42 * s), (0.4 * s, z0 + 0.7 * s), (0.27 * s, z0 + 0.86 * s), (0.29 * s, z0 + 0.92 * s)], (x, y, 0), m, seg=7, jit=0.05)
    if lid:
        b.lathe([(0.33 * s, z0 + 0.92 * s), (0.2 * s, z0 + 1.0 * s), (0.06 * s, z0 + 1.03 * s), (0.06 * s, z0 + 1.08 * s)], (x, y, 0), 'onggi_l', seg=7, jit=0.05)


def shutters(b, x0, x1, y, z0, h, n, m='wood'):
    """닫힌 널 덧문 n 짝(가게 앞)."""
    bw = (x1 - x0) / n
    for i in range(n):
        x = x0 + bw * (i + 0.5)
        b.box((bw - 0.05, 0.08, h), (x, y, z0 + h / 2), m, tone=0.88 + 0.08 * ((i * 7) % 3), jit=0.06)
    b.box((x1 - x0 + 0.1, 0.1, 0.07), ((x0 + x1) / 2, y - 0.012, z0 + h * 0.3), 'wood_d', jit=0)
    b.box((x1 - x0 + 0.1, 0.1, 0.07), ((x0 + x1) / 2, y - 0.012, z0 + h * 0.78), 'wood_d', jit=0)


def plinth(b, w, d, h, m='stone'):
    b.box((w, d, h), (0, 0, h / 2), m, bevel=0.05, jit=0.08)


# ═════ 예배당(벽 9 x 7, 용마루는 x 로) — 서쪽 끝에 종탑, 남쪽 벽에 뾰족 아치 창 셋 · 옆문 · 지하 창(등사기 자리 x=+2.5 에 불빛) ═════
b = B()
W, D, P, HW = 9.0, 7.0, 0.35, 3.6
plinth(b, W + 0.3, D + 0.3, P)
b.box((W, D, HW), (0, 0, P + HW / 2), 'brick', jit=0.04)
for z in (P + 0.05, P + 1.05, P + HW - 0.12):      # 회색 띠(벽돌 사이 가로 줄)
    b.box((W + 0.04, D + 0.04, 0.1 if z > P + 0.5 else 0.14), (0, 0, z), 'brick_d' if z < P + 0.5 else 'brick_l', jit=0)
for sx in (-1, 1):                                  # 모서리 벽돌 기둥
    for sy in (-1, 1):
        b.box((0.42, 0.42, HW), (sx * (W / 2 - 0.08), sy * (D / 2 - 0.08), P + HW / 2), 'brick_l', tone=0.92, jit=0.03)
for x in (-1.6, 0.2, 2.0):
    for sy in (-1, 1):
        arch_window(b, x, sy * (D / 2 + 0.02), P + 1.95, 0.72, 1.45)
for sy in (-1, 1):                                   # 벽 기둥(창 사이)
    for x in (-0.7, 1.1, 2.9):
        b.box((0.24, 0.1, HW - 0.3), (x, sy * (D / 2 + 0.03), P + HW / 2 - 0.1), 'brick_d', jit=0.03)
# 남쪽 옆문(x=3.75) — 문 위 작은 맞배 처마 · 돌계단
b.box((0.95, 0.1, 2.1), (3.75, -D / 2 - 0.02, P + 1.05), 'wood', jit=0.05)
b.box((0.04, 0.12, 2.1), (3.75, -D / 2 - 0.04, P + 1.05), 'wood_d', jit=0)
b.box((1.15, 0.12, 0.1), (3.75, -D / 2 - 0.02, P + 2.15), 'brick_l', jit=0)
b.prism([(-0.75, 0), (0.75, 0), (0, 0.45)], 0.7, (3.75, -D / 2 - 0.3, P + 2.3), 'tint_roof', jit=0.03)
for k in range(2):
    b.box((1.3 - k * 0.2, 0.4 - k * 0.1, 0.16), (3.75, -D / 2 - 0.35 + k * 0.08, 0.08 + k * 0.16), 'stone_d', bevel=0.03, jit=0.06)
# 지하 창(등사기 곁) — 땅에 붙은 낮은 창으로 불빛이 샌다
b.box((1.1, 0.08, 0.42), (2.5, -D / 2 - 0.03, 0.26), 'glow_cellar', jit=0)
b.box((1.26, 0.1, 0.07), (2.5, -D / 2 - 0.05, 0.49), 'stone_d', jit=0)
for k in range(4):
    b.box((0.04, 0.11, 0.42), (2.05 + k * 0.3, -D / 2 - 0.06, 0.26), 'iron', jit=0)
# 지붕(가파른 맞배) · 서쪽 박공 둥근 창
gable(b, W + 0.6, D, P + HW, 2.9, m='tint_roof', over=0.45, strips=10, end='brick', ridge='stone_d')
b.box((W + 0.7, 0.14, 0.18), (0, -D / 2 - 0.42, P + HW + 0.02), 'wood_d', jit=0); b.box((W + 0.7, 0.14, 0.18), (0, D / 2 + 0.42, P + HW + 0.02), 'wood_d', jit=0)
b.cone(0.38, 0.38, 0.1, (W / 2 + 0.06, 0, P + HW + 1.2), 'glass', seg=10, rot=(0, PI / 2, 0))
b.cone(0.46, 0.46, 0.06, (W / 2 + 0.03, 0, P + HW + 1.2), 'plaster', seg=10, rot=(0, PI / 2, 0))
# 종탑(서쪽 끝, 1.9 x 1.9) — 지붕 위로 솟고 뾰족 지붕과 십자가
TX, TS, TH = -W / 2 + 0.95, 1.9, P + HW + 5.0
b.box((TS, TS, TH), (TX, 0, TH / 2), 'brick', tone=1.03, jit=0.04)
for sx in (-1, 1):
    for sy in (-1, 1):
        b.box((0.3, 0.3, TH), (TX + sx * (TS / 2 - 0.05), sy * (TS / 2 - 0.05), TH / 2), 'brick_l', tone=0.92, jit=0.03)
for z in (P + HW + 0.2, TH - 0.15):
    b.box((TS + 0.16, TS + 0.16, 0.16), (TX, 0, z), 'plaster', jit=0)
for a in range(4):                                   # 종 칸 열린 창(네 면)
    ca, sa = math.cos(a * PI / 2), math.sin(a * PI / 2)
    b.box((0.62 if ca == 0 else 0.08, 0.62 if sa == 0 else 0.08, 1.0), (TX + ca * (TS / 2 + 0.01), sa * (TS / 2 + 0.01), TH - 0.85), 'dark', jit=0)
    b.prism([(-0.31, 0), (0.31, 0), (0, 0.3)], 0.09, (TX + ca * (TS / 2 + 0.01), sa * (TS / 2 + 0.01), TH - 0.35), 'dark', rot=(0, 0, a * PI / 2 + PI / 2), jit=0)
b.lathe([(0.22, TH - 1.25), (0.3, TH - 0.95), (0.08, TH - 0.7)], (TX, 0, 0), 'bronze', seg=8, jit=0.04)   # 종(어둠 속 빛)
b.box((TS + 0.5, TS + 0.5, 0.12), (TX, 0, TH + 0.02), 'wood_d', jit=0)
b.cone(1.45, 0.06, 2.3, (TX, 0, TH + 1.2), 'tint_roof', seg=4, rot=(0, 0, PI / 4), jit=0.05)
b.box((0.12, 0.12, 1.15), (TX, 0, TH + 2.8), 'white', jit=0)
b.box((0.62, 0.12, 0.12), (TX, 0, TH + 2.98), 'white', jit=0)
b.box((0.6, 0.06, 1.1), (TX, -TS / 2 - 0.02, P + 1.0), 'wood', jit=0.05)   # 종탑 아래 문(남쪽)
b.cone(0.28, 0.28, 0.06, (TX, -TS / 2 - 0.02, P + 2.6), 'glass', seg=10, rot=(PI / 2, 0, 0))
b.done('mn_church', smooth=0, shade=(0.76, 1.07), under=0.28)

# ═════ 헌병 주재소(벽 12 x 6) — 아래는 검은 널, 위는 회벽, 유리 창(불 켜짐), 가운데 현관(붉은 등 · 세로 간판) · 우진각 기와 ═════
b = B()
W, D, P, HW = 11.6, 5.6, 0.4, 3.0
plinth(b, W + 0.4, D + 0.4, P)
b.box((W, D, HW), (0, 0, P + HW / 2), 'plaster_g', jit=0.03)
b.box((W + 0.05, D + 0.05, 1.0), (0, 0, P + 0.5), 'wood_d', jit=0.03)
for i in range(4):                                   # 널 줄
    b.box((W + 0.08, D + 0.08, 0.04), (0, 0, P + 0.22 + i * 0.24), 'dark', jit=0)
for x in (-W / 2, -W / 4, 0, W / 4, W / 2):          # 기둥 띠
    for sy in (-1, 1):
        b.box((0.16, 0.1, HW), (x * 0.995, sy * (D / 2 + 0.02), P + HW / 2), 'wood_d', jit=0.03)
b.box((W + 0.1, D + 0.1, 0.14), (0, 0, P + HW - 0.07), 'wood_d', jit=0)
for x in (-4.4, -2.2, 2.2, 4.4):
    sash(b, x, -D / 2 - 0.02, P + 1.75, 1.05, 1.15, glassm='glow_dim')
for x in (-3.3, 0, 3.3):
    sash(b, x, D / 2 + 0.02, P + 1.75, 1.0, 1.0)
for sx in (-1, 1):
    sash(b, sx * (W / 2 + 0.02), 0, P + 1.75, 1.0, 1.1, side=True)
# 현관: 앞으로 1.3 나온 지붕 · 기둥 둘 · 유리 문 · 붉은 등 · 세로 간판(글은 없음)
b.box((1.6, 0.1, 2.3), (0, -D / 2 - 0.02, P + 1.15), 'wood', jit=0.04)
for s in (-1, 1):
    b.box((0.62, 0.11, 1.0), (s * 0.38, -D / 2 - 0.04, P + 1.55), 'glow_dim', jit=0)
    b.box((0.16, 0.16, 2.6), (s * 1.15, -D / 2 - 1.2, P + 1.3), 'wood_d', jit=0.03)
b.box((0.04, 0.13, 2.3), (0, -D / 2 - 0.06, P + 1.15), 'wood_d', jit=0)
b.box((2.8, 1.6, 0.12), (0, -D / 2 - 0.65, P + 2.66), 'wood_d', jit=0)
b.prism([(-1.65, 0), (1.65, 0), (0, 0.65)], 1.8, (0, -D / 2 - 0.6, P + 2.72), 'tile', jit=0.04)
b.box((2.5, 1.4, 0.2), (0, -D / 2 - 0.6, P + 0.1), 'stone_d', bevel=0.03, jit=0.05)
b.ball(0.2, (0, -D / 2 - 1.15, P + 2.38), 'glow_red', sub=1)
b.box((0.06, 0.06, 0.24), (0, -D / 2 - 1.15, P + 2.6), 'iron', jit=0)
b.box((0.36, 0.06, 1.5), (1.15, -D / 2 - 1.32, P + 1.3), 'board', jit=0.02)
b.box((0.44, 0.05, 1.6), (1.15, -D / 2 - 1.29, P + 1.3), 'wood_d', jit=0)
# 우진각 기와지붕 · 굴뚝
b.box((W + 1.3, D + 1.3, 0.16), (0, 0, P + HW + 0.05), 'wood_d', jit=0.03)
hip(b, W + 1.4, D + 1.4, W - 3.6, 0.3, 2.0, P + HW + 0.1, 'tile', jit=0.05)
for i in range(9):                                   # 기왓골(비탈 위에 눕힌 줄)
    x = -3.8 + i * 0.95
    for sy in (-1, 1):
        b.box((0.08, 0.05, 3.85), (x, sy * (1.83 + 0.018), P + HW + 0.1 + 1.0 + 0.03), 'tile_l', rot=(sy * 1.03, 0, 0), tone=0.85, jit=0.03)
b.box((W - 3.4, 0.36, 0.22), (0, 0, P + HW + 2.15), 'tile_l', bevel=0.05)
b.box((0.6, 0.6, 1.6), (3.4, 1.1, P + HW + 1.7), 'brick', jit=0.05)
b.box((0.72, 0.72, 0.12), (3.4, 1.1, P + HW + 2.5), 'stone_d', jit=0)
b.done('mn_police', smooth=0, shade=(0.76, 1.07), under=0.28)


# ═════ 다섯 집(벽 5 x 4) — 문은 가운데, 오른쪽 창(x=+1.4, 높이 1.3)은 살만 두고 창 종이는 장면이 켠다(불 켜짐) ═════
def home(name, roof):
    b = B()
    w, d, p, h = 5.0, 4.0, 0.3, 2.0
    b.box((w + 0.4, d + 0.4, p), (0, 0, p / 2), 'stone', bevel=0.05, jit=0.08)
    b.box((w - 0.04, d - 0.04, h), (0, 0, p + h / 2), 'tint_wall', jit=0.05)
    b.box((w + 0.02, d + 0.02, 0.12), (0, 0, p + h - 0.06), 'wood_d', jit=0.03)
    b.box((w + 0.02, d + 0.02, 0.1), (0, 0, p + 0.05), 'wood_d', jit=0.03)
    for x in (-w / 2, -0.75, 0.75, w / 2):
        for y in (-d / 2, d / 2):
            b.box((0.16, 0.16, h), (x * 0.99, y * 0.99, p + h / 2), 'wood_d', jit=0.03)
    # 문(가운데)
    b.box((0.95, 0.07, 1.62), (0, -d / 2 - 0.03, p + 0.81), 'wood', jit=0.05)
    b.box((0.04, 0.09, 1.62), (0, -d / 2 - 0.04, p + 0.81), 'wood_d', jit=0)
    b.box((1.1, 0.1, 0.08), (0, -d / 2 - 0.04, p + 1.64), 'wood_d', jit=0)
    b.box((0.08, 0.1, 0.06), (0.15, -d / 2 - 0.08, p + 0.85), 'iron', jit=0)
    # 왼쪽 창(불 꺼진 종이) · 오른쪽 창틀(창 종이는 장면이)
    lattice(b, -1.4, -d / 2 - 0.04, 1.3, 0.9, 0.7, nv=4)
    lattice(b, 1.4, -d / 2 - 0.1, 1.3, 0.9, 0.7, nv=4, pane=False)
    b.box((1.1, 0.14, 0.06), (1.4, -d / 2 - 0.1, 0.9), 'wood', jit=0)
    b.box((0.8, 0.4, 0.15), (0, -d / 2 - 0.42, 0.075), 'stone_d', bevel=0.04, jit=0.06)     # 댓돌
    # 옆 · 뒤
    lattice(b, 0.6, d / 2 + 0.04, 1.4, 0.8, 0.6, nv=3)
    b.box((0.4, 0.4, 1.4), (-w / 2 - 0.3, d / 4, 0.7), 'mud', bevel=0.05, jit=0.08)        # 굴뚝
    b.box((0.48, 0.48, 0.1), (-w / 2 - 0.3, d / 4, 1.42), 'stone_d', jit=0.05)
    if roof == 'thatch':
        thatch_roof(b, w, d, p + h, 1.3, over=0.55, seg=16)
    else:
        b.box((w + 0.3, d + 0.3, 0.18), (0, 0, p + h + 0.04), 'wood_d', jit=0.03)
        tile_roof(b, w, d, p + h + 0.12, 1.3, over=0.6, lift=0.4, nx=12)
    b.done(name, smooth=0, shade=(0.74, 1.08), under=0.3)


home('mn_home_a', 'thatch')
home('mn_home_b', 'tile')


# ═════ 거리 집(벽 6 x 4) ═════
def giwa(name):
    """기와집: 세 칸 · 툇마루(네모 앞쪽 0.9 안) · 창호 · 기와."""
    b = B()
    w, d, p, h = 6.0, 4.0, 0.42, 2.1
    yf = -d / 2 + 0.95
    b.box((w + 0.3, d + 0.2, p), (0, 0.05, p / 2), 'stone', bevel=0.05, jit=0.08)
    b.box((w - 0.1, d / 2 - yf, h), (0, (yf + d / 2) / 2, p + h / 2), 'tint_wall', jit=0.04)
    b.box((w - 0.2, 0.85, 0.1), (0, -d / 2 + 0.5, p + 0.28), 'wood_l', jit=0.06)
    b.box((w - 0.4, 0.75, 0.28), (0, -d / 2 + 0.52, p + 0.1), 'dark', jit=0)
    bw = w / 3
    for i in range(4):
        x = -w / 2 + bw * i
        for yy in (-d / 2 + 0.12, d / 2 - 0.1):
            b.cone(0.13, 0.12, h, (x * 0.98, yy, p + h / 2), 'wood_d', seg=7, jit=0.03)
    for i in range(3):
        xx = -w / 2 + bw * (i + 0.5)
        if i == 1:
            b.box((bw * 0.62, 0.06, 1.6), (xx, yf - 0.03, p + 0.38 + 0.8), 'wood', jit=0.05)
            for k in (-1, 1):
                b.box((0.03, 0.08, 1.6), (xx + k * bw * 0.155, yf - 0.04, p + 1.18), 'wood_d', jit=0)
        else:
            lattice(b, xx, yf - 0.04, p + 1.2, bw * 0.62, 1.0, nv=4)
    b.box((w + 0.2, d + 0.2, 0.18), (0, 0, p + h + 0.04), 'wood_d', jit=0.03)
    tile_roof(b, w, d, p + h + 0.12, 1.45, over=0.75, lift=0.48, nx=14)
    b.box((0.4, 0.4, 1.5), (w / 2 + 0.25, d / 4, 0.75), 'mud', bevel=0.05, jit=0.08)
    b.done(name, smooth=0, shade=(0.76, 1.07), under=0.28)


def choga(name):
    """초가: 세 칸 · 부엌 널문 · 창호 · 쪽마루."""
    b = B()
    w, d, p, h = 6.0, 4.0, 0.3, 2.0
    b.box((w + 0.3, d + 0.3, p), (0, 0, p / 2), 'stone', bevel=0.05, jit=0.08)
    b.box((w - 0.04, d - 0.04, h), (0, 0, p + h / 2), 'tint_wall', jit=0.05)
    b.box((w + 0.02, d + 0.02, 0.12), (0, 0, p + h - 0.06), 'wood_d', jit=0.03)
    for i in range(4):
        x = -w / 2 + w * i / 3
        for y in (-d / 2, d / 2):
            b.box((0.16, 0.16, h), (x * 0.99, y * 0.99, p + h / 2), 'wood_d', jit=0.03)
    b.box((1.1, 0.07, 1.6), (-2.0, -d / 2 - 0.03, p + 0.8), 'wood', jit=0.06)
    for k in (-0.3, 0.3):
        b.box((0.04, 0.09, 1.6), (-2.0 + k, -d / 2 - 0.04, p + 0.8), 'wood_d', jit=0)
    lattice(b, 0.0, -d / 2 - 0.04, p + 1.05, 0.9, 0.8, nv=4)
    lattice(b, 2.0, -d / 2 - 0.04, p + 1.05, 0.9, 0.8, nv=4)
    b.box((3.6, 0.6, 0.08), (1.0, -d / 2 - 0.32, 0.55), 'wood_l', jit=0.06)
    for x in (-0.6, 2.6):
        b.box((0.1, 0.1, 0.5), (x, -d / 2 - 0.55, 0.25), 'wood_d', jit=0)
    b.box((0.42, 0.42, 1.5), (w / 2 + 0.3, d / 4, 0.75), 'mud', bevel=0.05, jit=0.08)
    thatch_roof(b, w, d, p + h, 1.35, over=0.55, seg=16)
    b.done(name, smooth=0, shade=(0.74, 1.08), under=0.3)


giwa('mn_giwa')
choga('mn_choga')

# 이층 상점(6 x 4): 아래는 닫힌 덧문 · 차양 · 간판, 위는 유리 창 셋 · 맞배 기와
b = B()
w, d, p, h1, h2 = 6.0, 4.0, 0.25, 2.7, 2.3
plinth(b, w + 0.2, d + 0.2, p)
b.box((w, d, h1), (0, 0, p + h1 / 2), 'tint_wall', tone=0.9, jit=0.05)
b.box((w - 0.1, d - 0.1, h2), (0, 0, p + h1 + h2 / 2), 'tint_wall', jit=0.05)
for x in (-w / 2, w / 2):
    for y in (-d / 2, d / 2):
        b.box((0.2, 0.2, h1 + h2), (x, y, p + (h1 + h2) / 2), 'wood_d', jit=0.03)
b.box((w + 0.1, d + 0.1, 0.16), (0, 0, p + h1), 'wood_d', jit=0.03)
shutters(b, -w / 2 + 0.15, w / 2 - 0.15, -d / 2 - 0.03, p + 0.04, h1 - 0.55, 6)
b.grid(4, 1, lambda u, v: ((u - 0.5) * (w + 0.4), -d / 2 - 0.02 - v * 0.9, p + h1 + 0.25 - v * 0.38), 'tile', jit=0.06)   # 차양
b.box((w * 0.62, 0.08, 0.5), (0, -d / 2 - 0.12, p + h1 - 0.3), 'board', jit=0.02)
b.box((w * 0.62 + 0.14, 0.06, 0.62), (0, -d / 2 - 0.08, p + h1 - 0.3), 'wood_d', jit=0)
for k in range(4):                                   # 간판의 붓글씨 같은 검은 줄(글자는 아님)
    b.box((0.12, 0.09, 0.3), (-1.2 + k * 0.8, -d / 2 - 0.15, p + h1 - 0.3), 'ink', rot=(0, (k % 2 - 0.5) * 0.3, 0), jit=0)
for x in (-1.9, 0.0, 1.9):
    sash(b, x, -d / 2 + 0.03, p + h1 + 1.1, 1.0, 1.0)
b.box((w - 0.2, 0.3, 0.06), (0, -d / 2 - 0.12, p + h1 + 0.45), 'wood_d', jit=0)
for i in range(13):                                  # 난간
    b.box((0.04, 0.04, 0.4), (-w / 2 + 0.25 + i * (w - 0.5) / 12, -d / 2 - 0.22, p + h1 + 0.65), 'wood_d', jit=0)
b.box((w - 0.2, 0.06, 0.05), (0, -d / 2 - 0.22, p + h1 + 0.86), 'wood_d', jit=0)
b.box((w + 0.5, d + 0.5, 0.14), (0, 0, p + h1 + h2 + 0.02), 'wood_d', jit=0.03)
tile_roof(b, w, d, p + h1 + h2 + 0.1, 1.25, over=0.5, lift=0.25, nx=12, gable='tint_wall')
b.done('mn_store', smooth=0, shade=(0.74, 1.06), under=0.28)

# 상점(6 x 4): 앞에 높은 판벽(간판 벽) · 천 차양 · 덧문 · 옆은 벽돌
b = B()
w, d, p, h = 6.0, 4.0, 0.22, 2.9
yf = -d / 2
plinth(b, w + 0.2, d + 0.2, p)
b.box((w, d, h), (0, 0, p + h / 2), 'brick', tone=0.95, jit=0.05)
b.box((w + 0.3, d + 0.2, 0.12), (0, 0.15, p + h + 0.26), 'tint_roof', rot=(-0.09, 0, 0), jit=0.05)
b.box((w + 0.24, 0.22, 1.25), (0, yf + 0.02, p + h + 0.5), 'tint_wall', tone=1.06, jit=0.04)
b.box((w * 0.46, 0.24, 0.42), (0, yf + 0.02, p + h + 1.3), 'tint_wall', tone=1.06, jit=0.04)
b.box((w + 0.36, 0.3, 0.1), (0, yf + 0.02, p + h + 1.12), 'wood_d', jit=0.03); b.box((w * 0.46 + 0.14, 0.3, 0.09), (0, yf + 0.02, p + h + 1.55), 'wood_d', jit=0.03)
b.box((w * 0.62 + 0.14, 0.05, 0.74), (0, yf - 0.1, p + h + 0.5), 'wood_d', jit=0.02); b.box((w * 0.62, 0.06, 0.6), (0, yf - 0.12, p + h + 0.5), 'board', jit=0.02)
for k in range(3):
    b.box((0.14, 0.08, 0.36), (-0.9 + k * 0.9, yf - 0.16, p + h + 0.5), 'ink', rot=(0, (k % 2 - 0.5) * 0.35, 0), jit=0)
shutters(b, -w / 2 + 0.2, w / 2 - 0.2, yf - 0.03, p + 0.04, 2.25, 6, m='wood_l')
b.grid(4, 2, lambda u, v: ((u - 0.5) * (w - 0.2), yf - 0.05 - v * 1.0, p + 2.7 - v * 0.42 - 0.07 * math.sin(u * PI) * v), 'tint_cloth', jit=0.05)
for s in (-1, 1):
    b.box((0.06, 1.0, 0.06), (s * (w / 2 - 0.15), yf - 0.5, p + 2.5), 'iron', rot=(0.42, 0, 0), jit=0)
b.done('mn_store_b', smooth=0, shade=(0.76, 1.06), under=0.28)

# 인쇄소(6 x 4): 회벽 + 벽돌 기둥 · 둥근 머리 문 · 큰 간판 · 유리 창 둘 · 문 곁에 종이 묶음 · 맞배 함석
b = B()
w, d, p, h = 6.0, 4.0, 0.25, 3.2
plinth(b, w + 0.2, d + 0.2, p)
b.box((w, d, h), (0, 0, p + h / 2), 'cream', jit=0.04)
for x in (-w / 2 + 0.15, -0.95, 0.95, w / 2 - 0.15):
    b.box((0.36, d + 0.04, h), (x, 0, p + h / 2), 'brick', jit=0.04)
b.box((w + 0.08, d + 0.08, 0.3), (0, 0, p + h - 0.1), 'brick_d', jit=0)
b.box((w + 0.08, d + 0.08, 0.4), (0, 0, p + 0.2), 'brick_d', jit=0)
b.box((1.2, 0.08, 2.1), (0, -d / 2 - 0.02, p + 1.05), 'wood', jit=0.05)
b.cone(0.6, 0.6, 0.08, (0, -d / 2 - 0.02, p + 2.1), 'wood', seg=10, rot=(PI / 2, 0, 0))
b.box((0.04, 0.1, 2.1), (0, -d / 2 - 0.04, p + 1.05), 'wood_d', jit=0)
for s in (-1, 1):
    b.box((0.36, 0.1, 0.5), (s * 0.3, -d / 2 - 0.04, p + 1.6), 'glass', jit=0)
    sash(b, s * 1.95, -d / 2 - 0.02, p + 1.5, 1.0, 1.3)
b.box((w - 0.8, 0.1, 0.7), (0, -d / 2 - 0.08, p + h - 0.65), 'board', jit=0.02)
b.box((w - 0.66, 0.08, 0.82), (0, -d / 2 - 0.04, p + h - 0.65), 'wood_d', jit=0)
for k in range(5):
    b.box((0.14, 0.08, 0.42), (-1.6 + k * 0.8, -d / 2 - 0.14, p + h - 0.65), 'ink', rot=(0, ((k * 3) % 3 - 1) * 0.25, 0), jit=0)
gable(b, w + 0.5, d, p + h, 1.1, m='tint_roof', over=0.35, strips=8, end='cream')
b.box((0.5, 0.5, 1.1), (1.8, 1.0, p + h + 1.0), 'brick', jit=0.05)
for i, (x, y, z) in enumerate([(-2.55, -d / 2 - 0.35, 0.17), (-2.55, -d / 2 - 0.35, 0.47), (-2.1, -d / 2 - 0.32, 0.17)]):
    b.box((0.42, 0.32, 0.3), (x, y, z), 'paper', bevel=0.02, tone=1.0 - i * 0.04, jit=0.03)
    b.box((0.44, 0.04, 0.32), (x, y, z), 'rope', jit=0)
b.done('mn_print', smooth=0, shade=(0.76, 1.06), under=0.28)

# 학교(6 x 4): 흰 널벽 · 높은 유리 창 넷 · 가운데 현관 · 우진각 지붕 위 작은 종각
b = B()
w, d, p, h = 6.0, 4.0, 0.35, 2.9
plinth(b, w + 0.3, d + 0.3, p)
b.box((w, d, h), (0, 0, p + h / 2), 'white', tone=0.93, jit=0.03)
for i in range(7):
    b.box((w + 0.04, d + 0.04, 0.03), (0, 0, p + 0.3 + i * 0.38), 'plaster_g', jit=0)
b.box((w + 0.06, d + 0.06, 0.55), (0, 0, p + 0.27), 'wood_d', jit=0.03)
for x in (-w / 2, w / 2):
    for y in (-d / 2, d / 2):
        b.box((0.18, 0.18, h), (x, y, p + h / 2), 'wood_d', jit=0.03)
for x in (-2.25, -1.25, 1.25, 2.25):
    sash(b, x, -d / 2 - 0.02, p + 1.6, 0.7, 1.45, frame='wood_d')
for x in (-1.8, 0, 1.8):
    sash(b, x, d / 2 + 0.02, p + 1.6, 0.7, 1.3, frame='wood_d')
b.box((1.4, 0.8, 0.12), (0, -d / 2 - 0.4, p + 2.45), 'wood_d', jit=0)
b.prism([(-0.95, 0), (0.95, 0), (0, 0.55)], 1.0, (0, -d / 2 - 0.45, p + 2.5), 'tint_roof', rot=(0, 0, PI / 2), jit=0.03)
for s in (-1, 1):
    b.box((0.12, 0.12, 2.4), (s * 0.62, -d / 2 - 0.78, p + 1.2), 'wood_d', jit=0)
b.box((0.9, 0.08, 2.0), (0, -d / 2 - 0.02, p + 1.0), 'wood', jit=0.04)
b.box((0.04, 0.1, 2.0), (0, -d / 2 - 0.04, p + 1.0), 'wood_d', jit=0)
b.box((1.6, 1.0, 0.18), (0, -d / 2 - 0.45, p - 0.09 + 0.09), 'stone_d', bevel=0.03, jit=0.05)
b.box((w + 1.1, d + 1.1, 0.14), (0, 0, p + h + 0.05), 'wood_d', jit=0.03)
hip(b, w + 1.2, d + 1.2, w - 2.4, 0.3, 1.5, p + h + 0.1, 'tint_roof', jit=0.05)
CZ = p + h + 1.2
b.box((0.8, 0.8, 0.9), (0, 0, CZ + 0.45), 'white', jit=0.03)
for a in range(2):
    b.box((0.4 if a == 0 else 0.84, 0.84 if a == 0 else 0.4, 0.45), (0, 0, CZ + 0.55), 'dark', jit=0)
b.lathe([(0.14, CZ + 0.38), (0.19, CZ + 0.55), (0.05, CZ + 0.72)], (0, 0, 0), 'bronze', seg=7)
b.cone(0.7, 0.04, 0.7, (0, 0, CZ + 1.25), 'tint_roof', seg=4, rot=(0, 0, PI / 4), jit=0.04)
b.done('mn_school', smooth=0, shade=(0.78, 1.06), under=0.25)


# ═════ 장터 가게(4 x 1.5, 높이 2): 널 평상 · 기둥 넷 · 거적 지붕 · 거적 덮은 짐 ═════
def stall(name, roofm, goods):
    b = B()
    w, d = 4.0, 1.5
    b.box((w, d, 0.1), (0, 0, 0.68), 'wood_l', jit=0.06)
    for i in range(6):
        b.box((w, 0.02, 0.02), (0, -d / 2 + 0.12 + i * 0.25, 0.735), 'wood', jit=0)
    for sx in (-1, 1):
        for sy in (-1, 1):
            b.box((0.1, 0.1, 0.66), (sx * (w / 2 - 0.1), sy * (d / 2 - 0.1), 0.33), 'wood_d', jit=0.04)
            b.box((0.09, 0.09, 2.0 + (0.25 if sy > 0 else 0)), (sx * (w / 2 - 0.05), sy * (d / 2 - 0.05), 1.0 + (0.12 if sy > 0 else 0)), 'wood_d', jit=0.04)
    b.box((w + 0.1, 0.08, 0.08), (0, d / 2 - 0.05, 2.22), 'wood_d', jit=0); b.box((w + 0.1, 0.08, 0.08), (0, -d / 2 + 0.05, 1.98), 'wood_d', jit=0)
    b.grid(5, 2, lambda u, v: ((u - 0.5) * (w + 0.5), (v - 0.5) * (d + 0.8), 2.07 + 0.25 * v - 0.06 * math.sin(u * PI * 5) * 0.3), roofm, jit=0.07)
    rr = random.Random(len(name))
    for i, x in enumerate((-1.4, -0.45, 0.5, 1.45)):
        if goods == 'mat':
            b.box((0.9, 1.1, 0.42), (x, 0, 0.94), 'mat' if i % 2 else 'mat_d', bevel=0.12, bseg=1, jit=0.08, rot=(0, 0, rr.random() * 0.2 - 0.1))
        else:
            jar(b, x, -0.1, 0.42 + rr.random() * 0.12, 'onggi' if i % 2 else 'onggi_l', z0=0.73)
    b.box((w - 0.4, 0.06, 0.4), (0, -d / 2 - 0.02, 0.45), 'mat_d', jit=0.06)
    b.done(name, smooth=0, shade=(0.74, 1.07), under=0.2)


stall('mn_stall_a', 'mat', 'mat')
stall('mn_stall_b', 'tint_cloth', 'jar')

# ═════ 장터 종(원점 = 기둥, 팔은 +x 로 0.8, 종은 x=+0.5 · 높이 3.3) · 종 줄(따로 — 걸면 보인다) ═════
b = B()
b.box((0.8, 0.8, 0.3), (0, 0, 0.15), 'stone', bevel=0.06, jit=0.08)
b.cone(0.14, 0.12, 4.0, (0, 0, 2.0), 'wood_d', seg=7, jit=0.04)
b.box((1.8, 0.16, 0.18), (0.1, 0, 3.92), 'wood_d', jit=0.03)
b.box((0.08, 0.1, 0.9), (0.28, 0, 3.55), 'wood', rot=(0, -0.75, 0), jit=0.03)
b.prism([(-1.15, 0), (1.15, 0), (0, 0.32)], 0.5, (0.1, 0, 4.0), 'tile', rot=(0, 0, 0), jit=0.04)
b.box((0.04, 0.04, 0.22), (0.5, 0, 3.74), 'iron', jit=0)
b.lathe([(0.56, 2.9), (0.52, 3.05), (0.42, 3.35), (0.34, 3.55), (0.18, 3.66), (0.06, 3.68)], (0.5, 0, 0), 'bronze', seg=12, jit=0.04)
b.lathe([(0.58, 2.96), (0.58, 3.02)], (0.5, 0, 0), 'bronze_d', seg=12, cap=False)
b.done('mn_bellpost', smooth=30, shade=(0.8, 1.12), under=0.2)
b = B()
b.cone(0.03, 0.03, 2.55, (0.5, 0, 1.62), 'rope', seg=5, jit=0.04)
b.ball(0.07, (0.5, 0, 0.36), 'rope', sub=1)
b.ball(0.07, (0.5, 0, 2.9), 'iron', sub=1)
b.done('mn_bellrope', smooth=0, shade=(0.9, 1.05), under=0.1)

# ═════ 거리 등(높이 3.3 에 유리 등) ═════
b = B()
b.box((0.5, 0.5, 0.2), (0, 0, 0.1), 'stone', bevel=0.04, jit=0.08)
b.cone(0.1, 0.07, 3.0, (0, 0, 1.6), 'wood_d', seg=6, jit=0.05)
b.box((0.5, 0.06, 0.06), (0, 0, 2.95), 'iron', jit=0)
b.box((0.28, 0.28, 0.06), (0, 0, 3.05), 'iron', jit=0)
b.box((0.24, 0.24, 0.42), (0, 0, 3.3), 'glow_lamp', jit=0)
for sx in (-1, 1):
    for sy in (-1, 1):
        b.box((0.03, 0.03, 0.44), (sx * 0.125, sy * 0.125, 3.3), 'iron', jit=0)
b.cone(0.26, 0.04, 0.22, (0, 0, 3.62), 'iron', seg=4, rot=(0, 0, PI / 4))
b.done('mn_lamp', smooth=0, shade=(0.8, 1.05))

# ═════ 숨을 곳(반지름 1.4 기준): 볏짚 낟가리와 가마니 · 장독대 ═════
b = B()
b.lathe([(1.25, 0.0), (1.32, 0.35), (1.2, 1.05), (0.85, 1.65), (0.35, 2.1), (0.08, 2.3)], (0, 0, 0), 'straw', seg=9, jit=0.09)
for z, r in ((0.7, 1.29), (1.4, 1.05)):
    b.lathe([(r + 0.02, z - 0.04), (r + 0.05, z), (r + 0.02, z + 0.04)], (0, 0, 0), 'rope', seg=9, cap=False)
b.cone(0.25, 0.05, 0.4, (0, 0, 2.38), 'straw_d', seg=6, jit=0.06)
for a, s in ((0.3, 1.0), (1.1, 0.9), (-0.6, 0.95)):
    b.box((0.75 * s, 0.4 * s, 0.95 * s), (math.cos(a) * 1.38, -math.sin(a) * 1.38, 0.44 * s), 'straw_d', bevel=0.1, rot=(0.25, 0, -a + PI / 2), jit=0.08)
b.done('mn_hide_straw', smooth=0, shade=(0.66, 1.1), under=0.25)
b = B()
b.lathe([(1.35, 0), (1.3, 0.16), (0.0, 0.16)], (0, 0, 0), 'stone', seg=9, jit=0.1)
for deg, r, s, m in [(20, 0.62, 1.15, 'onggi'), (110, 0.66, 0.95, 'onggi_l'), (200, 0.6, 1.08, 'onggi'), (290, 0.64, 0.82, 'onggi_l'), (0, 0.0, 0.6, 'onggi_l')]:
    a = math.radians(deg)
    jar(b, math.cos(a) * r, math.sin(a) * r, s, m, z0=0.16)
b.done('mn_hide_jars', smooth=35, shade=(0.7, 1.12))

# ═════ 등사기(앞 = -y 쪽에 사람이 선다): 낮은 상 · 바탕판과 비단 틀(열림) · 잉크 밀대 · 찍은 종이 · 작은 등잔 ═════
b = B()
b.box((1.4, 1.0, 0.08), (0, 0, 0.56), 'wood', jit=0.05)
for sx in (-1, 1):
    for sy in (-1, 1):
        b.box((0.08, 0.08, 0.52), (sx * 0.62, sy * 0.42, 0.26), 'wood_d', jit=0)
b.box((1.3, 0.06, 0.06), (0, 0.42, 0.14), 'wood_d', jit=0)
b.box((0.8, 0.6, 0.05), (-0.15, 0, 0.625), 'wood_d', jit=0.03)
b.box((0.66, 0.46, 0.012), (-0.15, 0, 0.656), 'white', jit=0)
b.box((0.8, 0.06, 0.06), (-0.15, 0.3, 0.68), 'iron', jit=0)
for sx in (-1, 1):                                   # 비단 틀(뒤 경첩으로 열림)
    b.box((0.05, 0.6, 0.05), (-0.15 + sx * 0.38, 0.12, 0.84), 'wood_l', rot=(-0.65, 0, 0), jit=0)
b.box((0.8, 0.05, 0.05), (-0.15, -0.12, 0.66), 'wood_l', rot=(-0.65, 0, 0), jit=0)
b.box((0.8, 0.05, 0.05), (-0.15, 0.32, 1.0), 'wood_l', rot=(-0.65, 0, 0), jit=0)
b.box((0.72, 0.012, 0.52), (-0.15, 0.1, 0.83), 'paper', rot=(0.92, 0, 0), jit=0)
b.cone(0.07, 0.07, 0.5, (-0.15, -0.36, 0.67), 'ink', seg=8, rot=(0, PI / 2, 0))
for sx in (-1, 1):
    b.box((0.03, 0.18, 0.03), (-0.15 + sx * 0.27, -0.44, 0.69), 'iron', jit=0)
b.box((0.04, 0.2, 0.04), (-0.15, -0.53, 0.69), 'wood', jit=0)
for k in range(5):                                   # 찍은 종이 더미
    b.box((0.38, 0.28, 0.022), (0.45, -0.12 + (k % 2) * 0.02, 0.61 + k * 0.022), 'white', rot=(0, 0, (k - 2) * 0.06), jit=0.02)
b.cone(0.07, 0.06, 0.08, (0.48, 0.3, 0.64), 'ink', seg=7)
b.cone(0.06, 0.05, 0.06, (0.36, 0.33, 0.63), 'bronze', seg=6)
b.cone(0.012, 0.03, 0.08, (0.36, 0.33, 0.7), 'glow_lamp', seg=4)
b.done('mn_press', smooth=0, shade=(0.8, 1.06), under=0.15)

# ═════ 지하 뚜껑(2.2 x 1.8, 원점 높이 0.05 에 놓인다 — 바닥이 땅에 닿게 -0.05 부터): 널 마루 · 한 귀퉁이 뚜껑이 열려 아래 불빛 · 사다리 ═════
b = B()
b.box((2.2, 1.8, 0.1), (0, 0, 0.0), 'stone_d', bevel=0.03, jit=0.08)
for i in range(8):
    x = -1.0 + i * 0.27
    if x > 0.45 and x < 1.0:
        continue
    b.box((0.25, 1.62, 0.05), (x + 0.1, 0, 0.07), 'wood' if i % 2 else 'wood_l', jit=0.08)
b.box((0.56, 0.62, 0.05), (0.75, -0.48, 0.07), 'wood', jit=0.08)
b.box((0.56, 0.98, 0.05), (0.75, 0.31, 0.03), 'glow_cellar', jit=0)
for s in (-1, 1):
    b.box((0.04, 0.05, 0.42), (0.75 + s * 0.18, 0.55, 0.12), 'wood_l', rot=(0.5, 0, 0), jit=0)
for k in range(3):
    b.box((0.36, 0.035, 0.035), (0.75, 0.47 + k * 0.08, 0.06 + k * 0.08), 'wood_l', jit=0)
b.box((0.56, 0.05, 0.9), (0.75, 0.86, 0.48), 'wood', rot=(0.35, 0, 0), jit=0.06)
b.done('mn_hatch', origin=(0, 0, 0.0), smooth=0, shade=(0.78, 1.05), under=0.1)

# ═════ 태극기 그리는 상(1.4 x 0.9, 높이 0.62): 흰 천에 가운데 태극만 그려 둠 · 벼루 · 붓 · 물감 그릇 · 초 ═════
b = B()
b.box((1.4, 0.9, 0.07), (0, 0, 0.585), 'wood', jit=0.05)
for sx in (-1, 1):
    b.box((0.08, 0.8, 0.55), (sx * 0.6, 0, 0.275), 'wood_d', jit=0.03)
b.box((1.0, 0.68, 0.01), (-0.05, 0, 0.625), 'white', jit=0)
CXT, CYT, RT = -0.05, 0.0, 0.11
b.grid(6, 1, lambda u, v: (CXT + math.cos(-0.588 + u * PI) * RT * v, CYT + math.sin(-0.588 + u * PI) * RT * v, 0.632), 'red', jit=0)
b.grid(6, 1, lambda u, v: (CXT + math.cos(2.554 + u * PI) * RT * v, CYT + math.sin(2.554 + u * PI) * RT * v, 0.632), 'blue', jit=0)
b.box((0.2, 0.12, 0.03), (0.52, 0.25, 0.635), 'ink', jit=0)
b.cone(0.012, 0.004, 0.26, (0.52, -0.2, 0.64), 'wood_l', seg=4, rot=(0, PI / 2, 0.3))
for x, m in ((0.48, 'red'), (0.6, 'blue')):
    b.cone(0.055, 0.045, 0.04, (x, 0.05, 0.64), 'white', seg=7)
    b.cone(0.045, 0.045, 0.01, (x, 0.05, 0.66), m, seg=7)
b.cone(0.04, 0.04, 0.12, (-0.58, 0.32, 0.68), 'cream', seg=6)
b.cone(0.01, 0.025, 0.05, (-0.58, 0.32, 0.765), 'glow_lamp', seg=4)
b.done('mn_flagdesk', smooth=0, shade=(0.82, 1.05), under=0.15)

# ═════ 손 태극기(원점 = 깃대 밑, 깃대 높이 1.62, 천은 +x 로 0.84 x 0.56, 가운데 (0.44, 1.36)) — 앞뒤 두 면에 태극과 괘 ═════
b = B()
b.cone(0.022, 0.018, 1.62, (0, 0, 0.81), 'wood', seg=5)
b.ball(0.035, (0, 0, 1.64), 'bronze', sub=1)
FW, FH, FCX, FCZ = 0.84, 0.56, 0.44, 1.36
b.box((FW, 0.008, FH), (FCX + 0.01, 0, FCZ), 'white', jit=0)
R = 0.14
L = Vector((3, 0, -2)).normalized()


def fan(cx, cz, r, a0, y, m, seg=8):
    b.grid(seg, 1, lambda u, v: (cx + math.cos(a0 + u * PI) * r * v, y, cz + math.sin(a0 + u * PI) * r * v), m, jit=0)


def fdisc(cx, cz, r, y, m, seg=8):
    b.grid(seg, 1, lambda u, v: (cx + math.cos(u * 2 * PI) * r * v, y, cz + math.sin(u * 2 * PI) * r * v), m, jit=0)


AL = math.atan2(-2, 3)
for sy in (-1, 1):
    y0 = sy * 0.006
    fan(FCX, FCZ, R, AL, y0, 'red')
    fan(FCX, FCZ, R, AL + PI, y0, 'blue')
    fdisc(FCX + L.x * R / 2, FCZ + L.z * R / 2, R / 2, sy * 0.009, 'red', seg=8)
    fdisc(FCX - L.x * R / 2, FCZ - L.z * R / 2, R / 2, sy * 0.009, 'blue', seg=8)
# 괘: 건(왼위 ☰) · 감(오른위 ☵) · 리(왼아래 ☲) · 곤(오른아래 ☷) — 1 = 이어진 막대, 0 = 끊긴 막대(안쪽부터)
BL, BT, BG = 0.14, 0.023, 0.0117
for (dx, dz), pat in [((-3, 2), (1, 1, 1)), ((3, 2), (0, 1, 0)), ((-3, -2), (1, 0, 1)), ((3, -2), (0, 0, 0))]:
    dl = math.hypot(dx, dz)
    ux, uz = dx / dl, dz / dl
    px, pz = -uz, ux
    th = math.atan2(-pz, px)
    for k, solid in enumerate(pat):
        dd = R + 0.07 + BT / 2 + k * (BT + BG)
        cx, cz = FCX + ux * dd, FCZ + uz * dd
        parts = [(0.0, BL)] if solid else [(-(BG / 2 + (BL - BG) / 4), (BL - BG) / 2), ((BG / 2 + (BL - BG) / 4), (BL - BG) / 2)]
        for off, ln in parts:
            for sy in (-1, 1):
                b.box((ln, 0.003, BT), (cx + px * off, sy * 0.006, cz + pz * off), 'ink', rot=(0, th, 0), jit=0)
b.done('mn_flag', smooth=0, shade=(0.96, 1.02), under=0.0)

# ═════ 납작 돌(1 x 1, 장면이 크기와 색을 정한다) ═════
b = B()
rr = random.Random(11)
pts = []
for i in range(7):
    a = i * 2 * PI / 7 + rr.random() * 0.3
    r = 0.44 + rr.random() * 0.08
    pts.append((math.cos(a) * r, math.sin(a) * r))
b.prism(pts, 0.07, (0, 0, 0.035), 'tint_stone', rot=(PI / 2, 0, 0), jit=0.06)
b.done('mn_slab', smooth=0, shade=(0.9, 1.04), under=0.0)

# ═════ 돌담(길이 4, x 로 길다, 높이 1.3): 막돌을 엇갈려 쌓고 위에 넓적한 갓돌 ═════
b = B()
rr = random.Random(4)
for row in range(3):
    x = -2.0
    while x < 1.95:
        sw = min(0.6 + rr.random() * 0.5, 2.0 - x)
        sh = 0.36 + rr.random() * 0.06
        b.box((sw - 0.05, 0.62 - row * 0.06, sh), (x + sw / 2, (rr.random() - 0.5) * 0.06, 0.2 + row * 0.38), 'stone' if rr.random() > 0.45 else 'stone_d', jit=0.14, rot=(0, (rr.random() - 0.5) * 0.06, 0))
        x += sw
b.box((4.0, 0.7, 0.14), (0, 0, 1.24), 'stone_d', jit=0.1)
b.done('mn_doldam', smooth=0, shade=(0.68, 1.08), under=0.3)

# ═════ 먼 집(울타리 밖 — 면이 적다): 초가 · 기와 ═════
b = B()
b.box((5.0, 3.6, 2.1), (0, 0, 1.05), 'tint_wall', jit=0.06)
b.box((0.9, 0.06, 1.5), (-0.8, -1.81, 0.8), 'wood_d', jit=0.04); b.box((0.8, 0.06, 0.6), (1.2, -1.81, 1.3), 'paper', jit=0.03)
b.lathe([(3.1, 1.9), (2.9, 2.5), (1.9, 3.2), (0.3, 3.5)], (0, 0, 0), 'thatch', seg=8, jit=0.08, scale=(1.0, 0.78, 1.0))
b.done('mn_far_choga', smooth=0, shade=(0.74, 1.06), under=0.28)
b = B()
b.box((5.6, 3.6, 2.2), (0, 0, 1.1), 'tint_wall', jit=0.06)
b.box((1.0, 0.06, 1.5), (0.0, -1.81, 0.8), 'wood_d', jit=0.04); b.box((0.8, 0.06, 0.6), (-1.7, -1.81, 1.3), 'paper', jit=0.03); b.box((0.8, 0.06, 0.6), (1.7, -1.81, 1.3), 'paper', jit=0.03)
b.prism([(-2.3, 0), (2.3, 0), (0, 1.35)], 6.4, (0, 0, 2.15), 'dark', rot=(0, 0, PI / 2), jit=0)
for sy in (-1, 1):
    for i in range(7):
        x0, x1 = -3.4 + i * 6.8 / 7, -3.4 + (i + 1) * 6.8 / 7
        b.grid(1, 1, lambda u, v, x0=x0, x1=x1, sy=sy: (x0 + (x1 - x0) * u, sy * 2.55 * (1 - v), 2.1 + 1.5 * v + 0.12 * (1 - v) ** 2 * 0), 'tile', tone=1.0 if i % 2 else 0.8, jit=0.04)
b.box((6.9, 0.3, 0.2), (0, 0, 3.66), 'tile_l')
b.done('mn_far_giwa', smooth=0, shade=(0.74, 1.06), under=0.28)

# ═════ 장작 더미(벽에 기대어, 1.6 x 0.6) ═════
b = B()
rr = random.Random(8)
for row in range(4):
    for i in range(6 - (row % 2)):
        x = -0.68 + i * 0.27 + (row % 2) * 0.135
        b.cone(0.12, 0.12, 0.6, (x, 0, 0.12 + row * 0.22), 'wood' if (i + row) % 3 else 'wood_l', seg=6, rot=(PI / 2, 0, rr.random()), jit=0.1)
b.box((1.8, 0.75, 0.08), (0, 0.05, 1.0), 'wood_d', rot=(-0.15, 0, 0), jit=0.05)
b.done('mn_firewood', smooth=0, shade=(0.72, 1.06), under=0.2)

export('manse.glb')

"""마법 연구소 · 자리 ④ 「얼음과 불」의 장소 — 뒷마당(왼쪽 반은 겨울, 오른쪽 반은 여름)을 블렌더로 빚는다(묶음 3-6). 받아 온 모형 없음. 빚는 틀(Mk)과 색(PAL) · 실험대 치수(BENCH)는 make_lab.py 것을 그대로 쓴다.
실행(화면 없이):  blender -b --python english/play/world/tools/make_place_frost.py   → english/play/world/assets/place_frost.glb (400KB 아래 · 삼각형 4만 아래)
물체 이름이 약속이다(모두 제자리에 놓인 채로 — 놀이 stations/frost.js 는 묶어서 보이고 감추기만 한다):
  table(마당의 긴 나무 탁자 — 윗면이 높이 0, 가로 · 세로는 실험대와 같다) · icicles(탁자 왼쪽 앞 · 옆에 달린 고드름 — 반들거리는 재질)
  yard(땅 — 왼쪽 눈밭 · 오른쪽 풀밭이 가운데에서 맞닿는다 · 가까운 눈 둔덕과 풀 둔덕 · 눈 덮인 나무 · 풀 포기 · 작은 꽃)
  back(뒤판 — 하늘(왼쪽 차가운 파랑 · 오른쪽 따뜻한 노랑) · 먼 눈 언덕과 풀 언덕 · 해. 코드에서 빛을 받지 않는 재질을 입힌다 — 칠한 색 그대로)
  sunrays(해의 햇살 — 해 가운데가 원점. 코드에서 천천히 돈다) · cloudsC(왼쪽 눈구름들) · cloudsW(오른쪽 뭉게구름들 — 코드에서 천천히 흐른다)
  flowerA · flowerB · flowerC(해바라기 — 밑동이 원점. 코드에서 살랑인다)
좌표: 블렌더 z 위 · 앞 -y → 내보내면 y 위 · 앞 +z. 아래 W(x, y, z) 는 놀이 좌표(y 위 · 앞 +z)를 블렌더 좌표로 옮긴다. 땅은 y = -2.5(연구소 바닥과 같다).
카메라는 자료의 cam(26도 내려다봄) 그대로다 — 가로 화면은 탁자 뒤 z=-6.5 에서 y -2.6 ~ 2.2 를, 세로 화면은 y 6 까지 본다. 그래서 언덕은 낮게(y 0 쯤), 하늘 판은 높게(y 11) 세웠다.
"""
import bpy, math, os, sys, random
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from make_lab import Mk, material, PAL, BENCH, rgb, mix, RX, RY, RZ

OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'place_frost.glb'))
GROUND = -2.5                                         # 땅 높이(놀이 좌표 y)
BACK_Z = -8.4                                         # 하늘 판이 서는 깊이(놀이 좌표 z)
SUN = (3.3, 1.12)                                      # 해(놀이 좌표 x, y — 하늘 판 바로 앞)
C = {k: rgb(v) for k, v in dict(
    skyC0='#7fa3d2', skyC1='#d6e5f4', skyW0='#f8dc9a', skyW1='#fdf2d2',                    # 하늘: 차가운 쪽 위 · 아래 / 따뜻한 쪽 위 · 아래
    farS0='#96b4dc', farS1='#cbdcf1', farG0='#7dba78', farG1='#b4dc8c',                    # 먼 언덕: 눈(그늘 · 마루) / 풀(그늘 · 마루)
    snow='#eef3fb', snow2='#b7cbe8', grass='#70bb4e', grass2='#559f43', grass3='#8acc5a',
    pine='#3f7d6c', pine2='#2f6558', bark='#7a5238', ice='#e4f5ff', ice2='#9fd4ff',
    cloudC0='#93a8c8', cloudC1='#c9d7ea', cloudW0='#fbe6b8', cloudW1='#ffffff',
    sun='#fff1a8', sun2='#ffd35c', ray='#ffe58a', petal='#ffcf3d', petal2='#f5a524', seed='#7a4b24', seed2='#5a3418', stem='#4a9642', leaf='#5fae4e',
    top='#dcae74', top2='#c6935a', leg='#a8703f', leg2='#8c5a31', daisy='#ffffff', pink='#f7a3bd').items()}
smooth = lambda t: max(0.0, min(1.0, t))
sstep = lambda a, b, x: (lambda t: t * t * (3 - 2 * t))(smooth((x - a) / (b - a)))
W = lambda x, y, z: Vector((x, -z, y))               # 놀이 좌표 → 블렌더 좌표

def dome(m, x, z, rx, rz, top, col, base=GROUND, segs=18, rings=5, sharp=1.0):
    """둔덕 · 언덕: 땅(base)에 놓인 반쪽 알. (x, z) 가운데 · 반지름 rx(가로) · rz(깊이) · 마루 높이 top(놀이 좌표). sharp < 1 이면 어깨가 넓다."""
    rows = []
    for i in range(rings):
        a = i / rings * math.pi / 2; k = math.cos(a) ** sharp; h = base + (top - base) * math.sin(a)
        rows.append([m.bm.verts.new(W(x + math.cos(j / segs * math.tau) * rx * k, h, z + math.sin(j / segs * math.tau) * rz * k)) for j in range(segs)])
    cap = m.bm.verts.new(W(x, top, z))
    for a, b in zip(rows, rows[1:]):
        for j in range(segs): m.bm.faces.new((a[j], a[(j + 1) % segs], b[(j + 1) % segs], b[j]))
    for j in range(segs): m.bm.faces.new((rows[-1][j], rows[-1][(j + 1) % segs], cap))
    vs = [v for r in rows for v in r] + [cap]; m._paint(vs, col); return vs

def sheet(m, pts, col):
    """점 격자 [[Vector…]…] 를 네모 면으로 잇는다(하늘 판 · 땅)."""
    rows = [[m.bm.verts.new(p) for p in row] for row in pts]
    for a, b in zip(rows, rows[1:]):
        for j in range(len(a) - 1): m.bm.faces.new((a[j], a[j + 1], b[j + 1], b[j]))
    vs = [v for r in rows for v in r]; m._paint(vs, col); return vs

def star(m, M, n, r0, r1, r2, col, z=0.0, turn=0.0):
    """꽃잎 고리(납작한 별): 안쪽 반지름 r0 · 골 r1 · 끝 r2. M = 놓는 자리와 기울기."""
    c = m.bm.verts.new(M @ Vector((0, 0, z))); ring = []
    for i in range(n * 2):
        a = turn + i / (n * 2) * math.tau; r = r2 if i % 2 else r1
        ring.append(m.bm.verts.new(M @ Vector((math.cos(a) * r, math.sin(a) * r, z - (0.03 if i % 2 else 0)))))
    for i in range(n * 2): m.bm.faces.new((c, ring[i], ring[(i + 1) % (n * 2)]))
    m._paint([c], col(0)); m._paint([v for i, v in enumerate(ring) if i % 2 == 0], col(0.4)); m._paint([v for i, v in enumerate(ring) if i % 2], col(1))

def pine(m, x, z, base, k=1.0):
    """눈 덮인 나무: 세 층. 층마다 아래 테두리만 초록이고 위는 눈이다(위에서 내려다보므로 눈이 먼저 보인다)."""
    at = W(x, base, z); m.lathe([(0, 0), (0.13 * k, 0), (0.1 * k, 0.6 * k), (0, 0.6 * k)], C['bark'], at, 8)
    for R, z0, hh in ((0.98, 0.42, 0.95), (0.76, 0.98, 0.85), (0.52, 1.5, 0.8)):
        R *= k; z0 *= k; hh *= k
        col = lambda p, a=at.z + z0, h=hh: mix(C['pine2'], C['pine'], smooth((p.z - a) / (h * 0.22))) if p.z < a + h * 0.25 else mix(C['snow2'], C['snow'], smooth((p.z - a) / h + 0.25))
        m.lathe([(0, z0), (R, z0), (R * 0.93, z0 + hh * 0.2), (R * 0.74, z0 + hh * 0.3), (R * 0.3, z0 + hh * 0.78), (0, z0 + hh)], col, at, 12)

def sunflower(name, x, z, base, h, matte, lean=0.0):
    """해바라기 한 송이(밑동이 원점): 줄기 · 잎 둘 · 앞쪽 위를 보는 얼굴. 놓을 자리는 물체의 자리로 준다(코드에서 밑동을 축으로 살랑인다)."""
    m = Mk(); m.lathe([(0, 0), (0.05, 0), (0.038, h), (0, h)], C['stem'], segs=7, rot=RY(lean))
    for sx, hz in ((-1, 0.42), (1, 0.6)): m.ball(0.24, (sx * 0.2, -0.03, h * hz), lambda p: mix(C['stem'], C['leaf'], smooth(abs(p.x) / 0.4)), (1.0, 0.3, 0.55), 8)
    M = Matrix.Translation((math.sin(math.radians(lean)) * h, -0.07, h)) @ RX(62).to_4x4()
    star(m, M, 9, 0, 0.26, 0.5, lambda t: mix(C['petal2'], C['petal'], 0.3 + 0.5 * t), z=-0.012, turn=math.pi / 9)      # 뒤 꽃잎(조금 어둡다)
    star(m, M, 9, 0, 0.25, 0.47, lambda t: mix(C['petal2'], C['petal'], 0.55 + 0.45 * t), z=0.0)
    m.lathe([(0.225, 0.0), (0.2, 0.035), (0.11, 0.06), (0, 0.068)], lambda p: C['seed'], M.to_translation(), 14, RX(62))
    m.lathe([(0.1, 0.062), (0, 0.075)], C['seed2'], M.to_translation(), 14, RX(62))
    ob = m.done(name, matte, ao=0.25, shade=0.0); ob.location = W(x, base, z); return ob

def cloud(m, x, y, k, col, z=BACK_Z + 0.5):
    for dx, dy, r in ((0, 0.05, 0.62), (-0.7, -0.12, 0.44), (0.72, -0.14, 0.42), (-0.3, 0.28, 0.4), (0.34, 0.24, 0.38)):
        m.ball(r * k, W(x + dx * k, y + dy * k, z), col, (1, 0.35, 0.86), 10)

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True); rnd = random.Random(7)
    matte, gloss = material('place_frost_matte', 0.86), material('place_frost_gloss', 0.22); B = BENCH; hw, hd = B['w'] / 2, B['d'] / 2

    # ── 탁자: 널 다섯 장을 이은 윗판(윗면 높이 0 · 가로 · 세로는 실험대와 같다) · 앞뒤 옆 가름대 · 굵은 다리 넷 · 아래 버팀대
    m = Mk(); pd = B['d'] / 5
    for i in range(5):
        y = -hd + pd * (i + 0.5); tone = (0.10, 0.26, 0.04, 0.2, 0.12)[i]
        m.box((B['w'], pd - 0.012, B['top']), (0, y, -B['top'] / 2), lambda p, t=tone: mix(C['top'], C['top2'], t + 0.10 * math.sin(p.x * 7.0 + t * 40) * math.sin(p.x * 1.9 + 1)), 0.035)
    az = -B['top'] - 0.21
    for y in (-hd + 0.2, hd - 0.2): m.box((B['w'] - 0.5, 0.1, 0.42), (0, y, az), mix(C['top2'], C['leg'], 0.5), 0.03)
    for x in (-hw + 0.3, hw - 0.3): m.box((0.1, B['d'] - 0.5, 0.42), (x, 0, az), mix(C['top2'], C['leg'], 0.5), 0.03)
    for x in (-hw + 0.42, hw - 0.42):
        for y in (-hd + 0.32, hd - 0.32): m.box((0.3, 0.3, -GROUND - B['top'] + 0.02), (x, y, (GROUND - B['top']) / 2), lambda p: mix(C['leg2'], C['leg'], smooth((p.z - GROUND) / 2.2)), 0.045)
        m.box((0.16, B['d'] - 0.9, 0.16), (x, 0, -1.75), C['leg2'], 0.03)
    m.box((B['w'] - 1.1, 0.16, 0.16), (0, 0, -1.75), C['leg2'], 0.03)
    # 오른쪽(여름): 앞 가름대에 감긴 풀 줄기와 작은 꽃 / 왼쪽(겨울): 다리 밑동에 쌓인 눈
    for i in range(9):
        x = 0.55 + i * 0.36; z = az + 0.02 + 0.1 * math.sin(i * 1.9)
        m.ball(0.13, (x, -hd + 0.13, z), mix(C['stem'], C['leaf'], 0.3 + 0.5 * (i % 2)), (1.25, 0.3, 0.62), 8)
        if i % 3 == 1: m.ball(0.075, (x + 0.16, -hd + 0.09, z + 0.07), (C['petal'], C['pink'], C['daisy'])[i // 3], (1, 0.5, 1), 8)
    for x, y in ((-hw + 0.42, -hd + 0.32), (-hw + 0.42, hd - 0.32)): dome(m, x, -y, 0.62, 0.55, GROUND + 0.34, lambda p: mix(C['snow2'], C['snow'], smooth((p.z - GROUND) / 0.3)), segs=12, rings=3)
    m.done('table', matte, ground=GROUND, ao=0.45, shade=0.0)

    # ── 고드름: 탁자 왼쪽 절반의 앞 가장자리와 왼쪽 옆 가장자리에(왼쪽 = Cold 가 탁자에서도 읽힌다)
    m = Mk(); ic = lambda z0: (lambda p: mix(C['ice2'], C['ice'], smooth((p.z - z0) / 0.25 + 1)))
    for i in range(13):
        x = -hw + 0.16 + i * 0.27 + rnd.uniform(-0.05, 0.05); L = rnd.uniform(0.16, 0.5) * (1 - 0.45 * i / 13); r = 0.035 + L * 0.07
        m.lathe([(0, -L), (r * 0.45, -L * 0.5), (r, 0), (0, 0.01)], ic(-B['top']), (x, -hd + 0.03, -B['top'] + 0.01), 6)
    for i in range(5):
        y = -hd + 0.3 + i * 0.5; L = rnd.uniform(0.2, 0.42); r = 0.035 + L * 0.07
        m.lathe([(0, -L), (r * 0.45, -L * 0.5), (r, 0), (0, 0.01)], ic(-B['top']), (-hw + 0.03, y, -B['top'] + 0.01), 6)
    m.done('icicles', gloss, ao=0.0, shade=0.0)

    # ── 마당: 땅(눈밭 | 풀밭 — 가운데 금이 구불구불 맞닿는다) · 가까운 둔덕 · 눈 덮인 나무 · 눈 무더기 · 풀 포기 · 작은 꽃
    m = Mk(); seam = lambda z: 0.28 * math.sin(z * 1.3) + 0.13 * math.sin(z * 3.1 + 1.0); zs = [-10 + i * 0.7 for i in range(29)]
    snowc = lambda p: mix(C['snow2'], C['snow'], 0.62 + 0.3 * math.sin(p.x * 1.7 + p.y * 2.3)); grassc = lambda p: mix(C['grass2'], C['grass'], 0.55 + 0.4 * math.sin(p.x * 2.1 + 1) * math.sin(p.y * 1.7))
    sheet(m, [[W(x if x is not None else seam(z), GROUND, z) for x in (-16, -10, -6, -3, -1.2, None)] for z in zs], snowc)
    sheet(m, [[W(x if x is not None else seam(z), GROUND, z) for x in (None, 1.2, 3, 6, 10, 16)] for z in zs], grassc)
    snowh = lambda p: mix(C['snow2'], C['snow'], smooth((p.z - GROUND) / 1.7)); grassh = lambda p: mix(C['grass2'], C['grass3'], smooth((p.z - GROUND) / 2.0))
    # 가까운 둔덕(탁자 뒤 — 마루가 탁자 뒤 가장자리 위로 올라와 보인다). 가운데는 낮은 골짜기다
    dome(m, -2.9, -3.7, 3.1, 1.7, -0.42, snowh, sharp=0.6); dome(m, -8.2, -4.4, 4.4, 2.2, -0.9, snowh, sharp=0.6)      # 눈구름 걸이 뒤(왼쪽 끝)는 낮게 — 흰 구름이 흰 둔덕에 묻히지 않고 푸른 먼 언덕 앞에 온다
    dome(m, 3.0, -3.7, 3.1, 1.7, -0.46, grassh, sharp=0.6); dome(m, 8.2, -4.4, 4.4, 2.2, -0.9, grassh, sharp=0.6)
    pine(m, -2.25, -3.75, -0.55, 1.0); pine(m, -6.4, -4.6, -1.25, 0.9)
    # 앞마당(세로 화면에서 탁자 아래로 넓게 보인다): 왼쪽 눈 무더기 · 오른쪽 풀 포기와 꽃
    for x, z, r, h in ((-4.6, 2.2, 0.9, 0.36), (-2.2, 3.6, 1.1, 0.3), (-0.9, 2.0, 0.6, 0.24), (-3.4, 5.2, 0.8, 0.3), (-5.6, -0.6, 0.9, 0.4), (-1.5, 6.0, 1.0, 0.26), (-4.9, -2.2, 0.8, 0.36)):
        dome(m, x, z, r, r * 0.7, GROUND + h, lambda p, h=h: mix(C['snow2'], C['snow'], smooth((p.z - GROUND) / h)), segs=12, rings=3)
    for x, z, k in ((1.0, 2.2, 1.0), (2.6, 3.4, 1.2), (4.4, 2.0, 1.0), (3.5, 5.0, 1.1), (1.7, 4.6, 0.9), (5.4, -0.4, 1.2), (0.9, 6.2, 1.0), (4.9, -2.0, 1.1), (5.6, 3.9, 1.0)):
        for a, l in ((-24, 0.42), (2, 0.56), (26, 0.4)): m.lathe([(0, 0), (0.07 * k, 0), (0.035 * k, l * k * 0.6), (0, l * k)], lambda p: mix(C['grass2'], C['grass3'], smooth((p.z - GROUND) / 0.5)), W(x + a * 0.004, GROUND, z), 5, RY(a))
    for i, (x, z) in enumerate(((1.6, 2.9), (3.3, 2.5), (2.2, 5.4), (4.2, 4.2), (0.8, 3.9), (3.0, 6.3), (5.0, 1.2), (1.9, 1.7))):
        m.lathe([(0, 0), (0.016, 0), (0.016, 0.26), (0, 0.26)], C['stem'], W(x, GROUND, z), 5); m.ball(0.1, W(x, GROUND + 0.3, z), (C['daisy'], C['petal'], C['pink'])[i % 3], (1, 1, 0.55), 8); m.ball(0.045, W(x, GROUND + 0.345, z), C['petal2'], segs=6)
    m.done('yard', matte, ground=GROUND, ao=0.3, shade=0.0)

    # ── 뒤판: 하늘(왼쪽은 차갑게 · 오른쪽은 따뜻하게 — 가운데에서 스르르 넘어간다) · 먼 언덕(눈 | 풀이 겹쳐 맞닿는다) · 해
    m = Mk()
    def sky(p):
        k = sstep(-1.5, 1.5, p.x + 0.35 * math.sin(p.z * 1.1)); t = smooth((p.z + 1.0) / 6.5) ** 0.8
        return mix(mix(C['skyC1'], C['skyC0'], t), mix(C['skyW1'], C['skyW0'], t), k)
    sheet(m, [[W(-17 + i * 34 / 34, GROUND - 0.5 + j * 14 / 12, BACK_Z) for i in range(35)] for j in range(13)], sky)
    farS = lambda top: (lambda p: mix(C['farS0'], C['farS1'], sstep(GROUND + 0.8, top, p.z))); farG = lambda top: (lambda p: mix(C['farG0'], C['farG1'], sstep(GROUND + 0.8, top, p.z)))
    dome(m, 5.2, -7.0, 6.4, 1.3, 0.25, farG(0.25), segs=22, sharp=0.7); dome(m, 11.5, -6.6, 5.5, 1.4, -0.25, farG(-0.25), segs=22, sharp=0.7)
    dome(m, -5.6, -6.7, 6.6, 1.4, 0.35, farS(0.35), segs=22, sharp=0.7); dome(m, -12, -6.4, 5.5, 1.4, -0.2, farS(-0.2), segs=22, sharp=0.7)       # 눈 언덕이 풀 언덕 앞에 겹친다 — 가운데에 맞닿는 금이 선다
    for x, z, k in ((-7.6, -6.6, 0.75), (-8.3, -6.5, 0.6), (-1.7, -6.3, 0.6), (-10.6, -6.2, 0.7)):                                                   # 먼 나무(작고 단순하게)
        y = 0.35 - 0.02 * (x + 5.6) ** 2 - 0.25; m.lathe([(0, 0), (0.42 * k, 0), (0.2 * k, 0.6 * k), (0, 1.25 * k)], lambda p, y=y, k=k: mix(C['pine'], C['farS1'], 0.35 + 0.5 * smooth((p.z - y - 0.3 * k) / (0.5 * k))), W(x, y, z), 7)
    for i in range(11):                                                                                                                          # 먼 풀 언덕의 노란 꽃 점(해바라기 밭)
        x = 1.6 + i * 0.72 + 0.2 * math.sin(i * 2.3); y = 0.25 - 0.016 * (x - 5.2) ** 2 - 0.42 - 0.2 * (i % 2); m.ball(0.1, W(x, y, -5.95 - 0.1 * (i % 2)), C['petal'], (1, 0.5, 1), 6)
    m.lathe([(0, 0), (0.62, 0)], lambda p: C['sun'], W(SUN[0], SUN[1], BACK_Z + 0.2), 28, RX(90)); m.lathe([(0, 0), (0.92, 0)], lambda p: mix(C['skyW0'], C['sun'], 0.45), W(SUN[0], SUN[1], BACK_Z + 0.1), 28, RX(90))
    m.done('back', matte, ao=0.0, shade=0.0)

    # ── 햇살(해 가운데가 원점 — 코드에서 돈다)
    m = Mk()
    for i in range(10):
        a = i / 10 * math.tau; r0, r1, wdt = 1.02, (1.5 if i % 2 else 1.3), 0.11; d = Vector((math.cos(a), 0, math.sin(a))); n = Vector((-math.sin(a), 0, math.cos(a)))
        vs = [m.bm.verts.new(d * r0 + n * wdt), m.bm.verts.new(d * r0 - n * wdt), m.bm.verts.new(d * r1)]; m.bm.faces.new(vs); m._paint(vs, C['ray'])
    ob = m.done('sunrays', matte, ao=0.0, shade=0.0); ob.location = W(SUN[0], SUN[1], BACK_Z + 0.15)

    # ── 구름: 왼쪽은 잿빛 푸른 눈구름 · 오른쪽은 흰 뭉게구름(세로 화면의 높은 하늘도 채운다)
    m = Mk(); cc = lambda y0, k: (lambda p: mix(C['cloudC0'], C['cloudC1'], smooth((p.z - y0) / (0.6 * k) + 0.45)))
    for x, y, k in ((-4.7, 1.25, 1.0), (-1.9, 3.3, 1.25), (-5.9, 4.9, 1.4), (-9.0, 1.9, 1.2), (-2.6, 6.8, 1.3)): cloud(m, x, y, k, cc(y, k))
    m.done('cloudsC', matte, ao=0.0, shade=0.0)
    m = Mk(); cw = lambda y0, k: (lambda p: mix(C['cloudW0'], C['cloudW1'], smooth((p.z - y0) / (0.6 * k) + 0.6)))
    for x, y, k in ((6.3, 1.2, 0.9), (1.9, 3.5, 1.1), (5.2, 5.2, 1.35), (9.2, 2.4, 1.2), (2.4, 7.0, 1.2)): cloud(m, x, y, k, cw(y, k))
    m.done('cloudsW', matte, ao=0.0, shade=0.0)

    # ── 해바라기 셋(오른쪽 풀 둔덕 위 — 컵과 공 뒤 위쪽. 햇살 등 걸이 뒤는 비워 둔다)
    sunflower('flowerA', 1.45, -3.35, -0.8, 1.75, matte, 4); sunflower('flowerB', 2.3, -3.6, -0.62, 1.9, matte, -3); sunflower('flowerC', 3.15, -3.3, -0.7, 1.55, matte, 5)

def export():
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    tris = sum(len(p.vertices) - 2 for o in bpy.data.objects if o.type == 'MESH' for p in o.data.polygons)
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes', tris, 'tris')

if __name__ == '__main__':
    build(); export()

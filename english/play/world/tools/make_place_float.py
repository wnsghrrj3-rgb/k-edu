"""마법 연구소 · 자리 ② 「둥둥 띄우기」의 장소 — 「지붕 위」를 블렌더로 빚는다(묶음 3-6 · 11-26 준호: 「장소를 바꿔도 될 것 같아」). 받아 온 모형 없음.
실행(화면 없이):  blender -b --python english/play/world/tools/make_place_float.py   → world/assets/place_float.glb
놀이는 그대로다 — 놀이판 윗면(y=0 · 가로 7.4 · 세로 2.6)은 연구소 실험대와 같은 자리 · 같은 크기(make_lab.py 의 BENCH).
물체(이름이 약속이다 — zones/lab/stations/float.js 가 scenery 한 묶음으로 엮는다):
  p_deck    제자리. 지붕 위 나무 평상(놀이판) · 다리 · 용마루
  p_roof    제자리. 평상이 올라앉은 기와 지붕(카메라 쪽으로 내려가는 비탈 — 세로 화면에서 평상 아래로 보인다)
  p_wall    제자리. 지붕창(다락 박공벽) — 둥근 구멍이 진짜로 뚫려 있다(창짝이 열리면 하늘이 보이고 바람이 든다. 둥근 창의 자리 · 크기는 방의 것 그대로)
  p_near    제자리. 지붕창의 창틀과 지붕 · 굴뚝(높은 선반이 여기에 달린다 — 앞면이 방의 벽 자리) · 풍향계 기둥
  p_far     제자리. 멀리 마을 지붕들 · 시계탑 · 언덕(흐리게 — 놀이판 위의 것이 더 또렷하게)
  p_trees   제자리. 둥근 나무들
  p_beam    퍼걸러 들보(아랫면 가운데가 원점 — lab_float.glb 의 beam 과 같은 약속. 기둥은 위가 아니라 아래로 지붕까지 내려간다)
  vane      풍향계 머리(도는 축이 원점 — 바람이 불면 코드가 돌린다)
  cloud0~4  뭉게구름(저마다 제 가운데가 원점 · 놓인 자리는 물체의 위치 — 코드가 천천히 흘려보낸다)
좌표: 아래 글은 놀이 좌표(x 오른쪽 · y 위 · z 앞)로 적고 V() 가 블렌더 좌표(z 위 · 앞 -y)로 옮긴다. 색은 꼭짓점 색 · 재질 하나.
"""
import bpy, bmesh, math, os, sys, random
from mathutils import Vector, Matrix
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import make_lab as M
from make_lab import Mk, PAL, rgb, mix, RX, RY, RZ, BENCH

OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'place_float.glb'))
P = {k: rgb(v) for k, v in dict(
    haze='#cfe8f6', plank1='#dfae78', plank2='#d39c66', plank3='#e6b986', frame='#a8703f', leg='#8f5d38', under='#6b452c',
    tile1='#cf6650', tile2='#d97c5e', tile3='#bd5645', tile4='#e09570', tileD='#8a4234', ridge='#b55544',
    plaster='#f3dfb2', plaster2='#e3c795', slate='#6fa3b6', slate2='#5b8da3', stone='#d3c5b3', stone2='#bdac99', brick='#c99f8c', potc='#d98566', iron='#5a4a6a', gold='#f2c14e',
    wall1='#f1e3cb', wall2='#ecd6bb', rose='#de7d66', teal='#5fa7bb', mustard='#e8b05a', lavender='#9d88cc', lit='#fff1c2',
    hill='#7fbf9e', hill2='#93cc8f', grass='#a6d68f', hedge='#7fc084', tree='#6db67a', tree2='#93cf8a', cloud='#fcfeff', cloud2='#cfe6f7').items()}
ROOF = dict(y=-0.3, z=-1.5, a=math.radians(30))      # 용마루의 높이 · 깊이 · 앞 비탈의 기울기
WIN = dict(x=-0.35, y=2.55, r=0.9, z=-1.76)          # 둥근 창(make_lab.py 의 창 가운데 · 창틀 반지름 0.95) · 박공벽 앞면(방의 벽 자리)
CHIM = dict(x=2.72, z0=-1.75, w=1.5, d=0.95, top=4.05)   # 굴뚝: 가운데(높은 선반의 자리) · 앞면(선반이 닿는 곳) · 너비 · 깊이 · 몸통 끝

def V(x, y, z): return Vector((x, -z, y))            # 놀이 좌표 → 블렌더 좌표
hz = lambda c, k: mix(c, P['haze'], k)               # 멀수록 하늘빛에 묻힌다

def box(m, size, at, col, bevel=0.03, rot=None):
    """상자. size = (가로 x, 높이 y, 깊이 z) · at = 가운데(놀이 좌표). 모서리는 한 번만 깎는다(가볍게)."""
    sx, sy, sz = size; r = bmesh.ops.create_cube(m.bm, size=1.0, matrix=Matrix.Translation(V(*at)) @ (rot.to_4x4() if rot else Matrix.Identity(4)) @ Matrix.Diagonal((sx, sz, sy, 1)))
    vs = r['verts']
    if bevel > 0:
        es = list({e for v in vs for e in v.link_edges}); before = set(m.bm.verts)
        bmesh.ops.bevel(m.bm, geom=es, offset=min(bevel, min(size) * 0.45), segments=1, profile=0.5, affect='EDGES'); vs = [v for v in m.bm.verts if v not in before or v in vs and v.is_valid]
    m._paint([v for v in vs if v.is_valid], col)

def poly(m, pts, col):
    """낱장 면(제 꼭짓점을 따로 가진다). pts = 놀이 좌표 · col = 색 하나 또는 꼭짓점마다의 색."""
    vs = [m.bm.verts.new(V(*p)) for p in pts]; m.bm.faces.new(vs)
    for i, v in enumerate(vs): m.col[v] = col[i] if isinstance(col, (list, tuple)) else col
    return vs

def fin(m, name, mat, flat=False, loc=None):
    """틈새 그늘 없이 물체로 만든다(낱장 면이 많은 것 · 먼 것). flat = 면마다 각지게."""
    bm = m.bm; bm.verts.ensure_lookup_table(); bm.verts.index_update(); cols = [m.col.get(v, PAL['cream']) for v in bm.verts]
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = not flat
    ca = me.color_attributes.new(name='Col', type='FLOAT_COLOR', domain='POINT')
    for i, c in enumerate(cols): ca.data[i].color = (c[0], c[1], c[2], 1.0)
    me.color_attributes.active_color = ca; me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    if loc: ob.location = loc
    print('MADE', name, len(me.vertices), 'verts'); return ob

# ───────────────────────── 평상(놀이판) ─────────────────────────
def deck(mat):
    m = Mk(); B = BENCH; hw, hd = B['w'] / 2, B['d'] / 2; n = 14; pw = B['w'] / n; tones = (P['plank1'], P['plank2'], P['plank3'], P['plank1'], P['plank3'], P['plank2'])
    for i in range(n):                                                         # 널 열넷(앞뒤로 놓인다 — 윗면이 높이 0)
        box(m, (pw - 0.022, 0.1, B['d']), (-hw + pw * (i + 0.5), -0.05, 0), tones[(i * 5) % 6], 0.018)
    box(m, (B['w'] - 0.1, 0.06, B['d'] - 0.1), (0, -0.12, 0), P['under'], 0.0)   # 널 틈으로 보이는 어두운 밑
    for z in (hd - 0.07, -hd + 0.07): box(m, (B['w'], 0.3, 0.12), (0, -0.25, z), P['frame'], 0.03)
    for x in (hw - 0.07, -hw + 0.07): box(m, (0.12, 0.3, B['d']), (x, -0.25, 0), P['frame'], 0.03)
    for x in (-3.42, -1.15, 1.15, 3.42): box(m, (0.22, 2.2, 0.22), (x, -1.2, hd - 0.2), P['leg'], 0.03)     # 앞다리는 길다(지붕이 앞으로 내려가니까)
    for x in (-3.42, 3.42): box(m, (0.22, 0.9, 0.22), (x, -0.55, -hd + 0.2), P['leg'], 0.03)
    box(m, (B['w'] - 0.5, 0.12, 0.1), (0, -1.15, hd - 0.2), P['frame'], 0.025)                              # 앞 가로대
    box(m, (15.4, 0.22, 0.34), (0, ROOF['y'] - 0.02, ROOF['z'] - 0.02), P['ridge'], 0.09)                   # 용마루
    return m.done('p_deck', mat, ao=0.4, shade=0.0)

# ───────────────────────── 기와 지붕(앞 비탈) ─────────────────────────
def roof(mat):
    """물고기 비늘 기와: 줄마다 반 칸씩 어긋나고, 아랫줄이 윗줄 밑으로 반쯤 들어간다. 평상 밑에 가려 안 보이는 것은 빚지 않는다."""
    m = Mk(); rnd = random.Random(7); a = ROOF['a']; ca, sa = math.cos(a), math.sin(a); w, p, h, rows, x0, x1 = 0.9, 0.56, 0.06, 14, -7.65, 7.65
    at = lambda u, s, l: (u, ROOF['y'] - s * sa + l * ca, ROOF['z'] + s * ca + l * sa)      # 비탈 위의 점(가로 u · 비탈을 따라 s · 겉에서 뜬 높이 l)
    poly(m, [at(x0, 0, -0.03), at(x1, 0, -0.03), at(x1, rows * p + 0.1, -0.03), at(x0, rows * p + 0.1, -0.03)], P['tileD'])
    tones = (P['tile1'], P['tile1'], P['tile2'], P['tile3'], P['tile2'], P['tile4'])
    for r in range(rows):
        s0 = r * p; st = max(0.0, s0 - 0.5 * p); lift = lambda s: h * (s - st) / (s0 + p - st); u = x0 - (w / 2 if r % 2 else 0)
        while u < x1:
            c = tones[rnd.randrange(6)]; ww = w - 0.03; zb = ROOF['z'] + (s0 + p) * ca
            if not (abs(u + w / 2) < 3.1 and zb < -0.5):                    # 평상 밑
                pts = [(0, st), (ww, st), (ww, s0 + 0.55 * p), (ww * 0.82, s0 + 0.87 * p), (ww * 0.5, s0 + p), (ww * 0.18, s0 + 0.87 * p), (0, s0 + 0.55 * p)]
                poly(m, [at(u + q[0], q[1], lift(q[1])) for q in pts], [c * 0.72, c * 0.72, c, c * 1.06, c * 1.1, c * 1.06, c])
            u += w
    return fin(m, 'p_roof', mat)

# ───────────────────────── 지붕창의 박공벽(둥근 구멍) ─────────────────────────
def wall(mat):
    m = Mk(); cx, cy, R, z = WIN['x'], WIN['y'], WIN['r'], WIN['z']; hw, y0, eave, apex = 1.14, -1.0, 3.19, 4.0
    out = [(cx - hw, y0), (cx + hw, y0), (cx + hw, eave), (cx, apex), (cx - hw, eave)]
    def edge(t):                                                              # 창 가운데에서 t 쪽으로 나간 금이 벽 테두리와 만나는 점
        dx, dy = math.cos(t), math.sin(t); best = 1e9
        for (ax, ay), (bx, by) in zip(out, out[1:] + out[:1]):
            ex, ey = bx - ax, by - ay; den = dx * ey - dy * ex
            if abs(den) < 1e-9: continue
            k = ((ax - cx) * ey - (ay - cy) * ex) / den; q = ((ax - cx) * dy - (ay - cy) * dx) / den
            if k > 0 and -1e-6 <= q <= 1 + 1e-6: best = min(best, k)
        return (cx + dx * best, cy + dy * best)
    angs = sorted({round(i / 56 * math.tau, 5) for i in range(56)} | {round(math.atan2(y - cy, x - cx) % math.tau, 5) for x, y in out})
    col = lambda x, y: mix(P['plaster2'], P['plaster'], max(0.0, min(1.0, (y + 0.4) / 2.2))) * (0.9 if y > eave - 0.25 else 1.0)
    ins = []; outs = []; backs = []
    for t in angs:
        ix, iy = cx + math.cos(t) * R, cy + math.sin(t) * R; ox, oy = edge(t)
        vi = m.bm.verts.new(V(ix, iy, z)); vo = m.bm.verts.new(V(ox, oy, z)); vb = m.bm.verts.new(V(ix, iy, z - 0.3)); m.col[vi] = col(ix, iy) * 0.93; m.col[vo] = col(ox, oy); m.col[vb] = P['plaster2'] * 0.6
        ins.append(vi); outs.append(vo); backs.append(vb)
    for i in range(len(angs)):
        k = (i + 1) % len(angs); m.bm.faces.new((ins[i], ins[k], outs[k], outs[i])); m.bm.faces.new((backs[i], backs[k], ins[k], ins[i]))      # 벽 · 구멍 안쪽 두께
    return fin(m, 'p_wall', mat)

# ───────────────────────── 창틀 · 지붕창 지붕 · 굴뚝 · 풍향계 기둥 ─────────────────────────
def near(mat):
    m = Mk(); cx, cy, z = WIN['x'], WIN['y'], WIN['z']
    m.torus(0.95, 0.1, V(cx, cy, z + 0.04), PAL['wood2'], rot=RX(0), segs=32, tube=8)                       # 둥근 창틀(방의 것과 같은 치수)
    ang = math.degrees(math.atan2(0.81, 1.14)); L = math.hypot(1.44, 1.44 * 0.81 / 1.14); zc = -2.12
    for sd in (-1, 1):                                                        # 박공 지붕 두 장 + 앞 널
        mx, my = cx + sd * 0.72, 4.0 - 0.72 * 0.81 / 1.14 + 0.1
        box(m, (L + 0.08, 0.14, 1.3), (mx, my, zc), lambda p: mix(P['slate2'], P['slate'], 0.5 + 0.5 * math.sin(p.y * 9.0)), 0.03, RY(sd * ang))
        box(m, (L + 0.1, 0.2, 0.07), (mx, my - 0.03, zc + 0.68), P['plaster'], 0.02, RY(sd * ang))
    box(m, (0.2, 0.2, 1.4), (cx, 4.13, zc), P['slate2'], 0.05)
    # 굴뚝(높은 선반의 받침 둘이 다 얹히게 너비 1.5) · 띠 · 갓 · 연통 둘
    C = CHIM; zc = C['z0'] - C['d'] / 2; stone = lambda p: mix(P['stone2'], P['stone'], max(0.0, min(1.0, (p.z + 0.5) / 3.0)))
    box(m, (C['w'], C['top'] + 1.0, C['d']), (C['x'], (C['top'] - 1.0) / 2, zc), stone, 0.05)
    for bx, by, bw in ((-0.42, 0.55, 0.36), (0.3, 0.95, 0.4), (-0.1, 1.5, 0.34), (0.45, 2.05, 0.32), (-0.48, 2.3, 0.36), (0.1, 3.72, 0.38), (-0.4, 3.9, 0.3)):     # 도드라진 벽돌 몇 장
        box(m, (bw, 0.16, 0.05), (C['x'] + bx, by, C['z0'] + 0.012), P['brick'], 0.02)
    box(m, (C['w'] + 0.12, 0.13, C['d'] + 0.12), (C['x'], C['top'] - 0.1, zc), P['brick'], 0.03)
    box(m, (C['w'] + 0.3, 0.2, C['d'] + 0.3), (C['x'], C['top'] + 0.1, zc), P['slate'], 0.05)
    for dx, hh in ((-0.33, 0.42), (0.33, 0.3)): m.lathe([(0.15, 0), (0.17, hh - 0.08), (0.2, hh - 0.06), (0.2, hh), (0.13, hh), (0.13, 0.05)], P['potc'], V(C['x'] + dx, C['top'] + 0.2, zc), 12)
    # 풍향계 기둥(왼쪽 용마루 뒤) — 동서남북 살
    vx, vz = VANE[0], VANE[2]
    m.lathe([(0, 0), (0.09, 0), (0.05, 0.12), (0.032, 0.16), (0.028, VANE[1] + 0.9), (0, VANE[1] + 0.9)], P['iron'], V(vx, -0.9, vz), 8)
    box(m, (0.9, 0.035, 0.035), (vx, VANE[1] - 0.45, vz), P['iron'], 0.012); box(m, (0.035, 0.035, 0.9), (vx, VANE[1] - 0.45, vz), P['iron'], 0.012)
    for dx, dz in ((0.45, 0), (-0.45, 0), (0, 0.45), (0, -0.45)): m.ball(0.05, V(vx + dx, VANE[1] - 0.45, vz + dz), P['gold'], segs=8)
    return m.done('p_near', mat, ao=0.4, shade=0.0)

VANE = (-3.2, 2.2, -2.0)                              # 풍향계 머리가 도는 축
def vane(mat):
    m = Mk(); g = P['gold']
    box(m, (1.1, 0.04, 0.04), (0, 0, 0), g, 0.012); box(m, (0.2, 0.2, 0.035), (0.55, 0, 0), g, 0.012, RY(45)); box(m, (0.26, 0.24, 0.03), (-0.5, 0, 0), g, 0.012)     # 화살
    m.ball(0.05, V(0, 0.02, 0), P['iron'], segs=8)
    m.ball(0.17, V(-0.02, 0.3, 0), g, (1.25, 0.55, 0.95), 12); m.ball(0.095, V(0.2, 0.47, 0), g, (1, 0.6, 1), 10)                                                   # 새(몸 · 머리 · 부리 · 꼬리)
    box(m, (0.1, 0.05, 0.03), (0.32, 0.46, 0), P['potc'], 0.01); box(m, (0.26, 0.1, 0.035), (-0.27, 0.42, 0), g, 0.015, RY(-35))
    m.lathe([(0, 0), (0.018, 0), (0.018, 0.16), (0, 0.16)], P['iron'], V(0, 0, 0), 6)
    ob = m.done('vane', mat, ao=0.2, shade=0.0); ob.location = V(*VANE); return ob

# ───────────────────────── 퍼걸러 들보 ─────────────────────────
def beam(mat):
    """들보(길이 9 · 아랫면 가운데가 원점) + 지붕까지 내려가는 기둥 둘 + 버팀목 + 쇠 띠 + 위에 걸친 서까래. 등은 코드가 이 들보에 단다(방의 들보와 같은 자리)."""
    m = Mk(); grain = lambda p: mix(PAL['wood2'], PAL['wood3'], 0.25 + 0.2 * math.sin(p.x * 5.0) * math.sin(p.x * 1.7 + p.z * 8.0)); PX = 3.97
    box(m, (9.0, 0.32, 0.36), (0, 0.16, 0), grain, 0.05)
    for sd in (-1, 1):
        box(m, (0.24, 9.4, 0.28), (sd * PX, 0.32 - 4.7, -0.02), PAL['wood3'], 0.04); box(m, (0.34, 0.12, 0.42), (sd * PX, 0.16, 0), rgb('#5a4a6a'), 0.025)
        box(m, (0.9, 0.13, 0.13), (sd * (PX - 0.36), -0.32, -0.02), PAL['wood3'], 0.03, RY(sd * 45))
    for x in (-1.6, 0, 1.6): box(m, (0.1, 0.36, 0.4), (x, 0.16, 0), rgb('#5a4a6a'), 0.02)
    for i in range(7): box(m, (0.13, 0.15, 1.7), (-3.3 + i * 1.1, 0.395, -0.3), PAL['wood2'], 0.03)
    return m.done('p_beam', mat, ao=0.4, shade=0.0)

# ───────────────────────── 멀리 마을 ─────────────────────────
def band(m, z, x0, x1, n, top, bottom, c_top, c_bot):
    """물결치는 윗금을 가진 긴 띠(언덕 · 숲 · 풀밭)."""
    vs = []
    for i in range(n + 1):
        x = x0 + (x1 - x0) * i / n; a = m.bm.verts.new(V(x, top(x), z)); b = m.bm.verts.new(V(x, bottom, z)); m.col[a] = c_top; m.col[b] = c_bot; vs.append((a, b))
    for (a, b), (c, d) in zip(vs, vs[1:]): m.bm.faces.new((a, c, d, b))

def house(m, x, z, w, d, eave, rh, wc, rc, gable=False, k=0.3, chim=True, bottom=-12.0):
    """집 한 채(위에서 내려다보인다): 몸통 + 지붕. gable = 박공이 앞을 본다(용마루가 앞뒤로), 아니면 지붕 비탈이 앞을 본다."""
    wc, rc, o = hz(wc, k), hz(rc, k), 0.18; hw, hd, zf = w / 2, d / 2, z + d / 2
    box(m, (w, eave - bottom, d), (x, (eave + bottom) / 2, z), wc, 0.0)
    if gable:
        dl = o * rh / hw; poly(m, [(x - hw, eave, zf), (x + hw, eave, zf), (x, eave + rh, zf)], wc * 0.97)
        for sd, c in ((-1, rc), (1, rc * 0.9)): poly(m, [(x + sd * (hw + o), eave - dl, zf + o), (x, eave + rh, zf + o), (x, eave + rh, z - hd), (x + sd * (hw + o), eave - dl, z - hd)], [c, c * 1.08, c * 1.08, c])
        poly(m, [(x - 0.2, eave + rh * 0.25, zf + 0.02), (x + 0.2, eave + rh * 0.25, zf + 0.02), (x + 0.2, eave + rh * 0.25 + 0.4, zf + 0.02), (x - 0.2, eave + rh * 0.25 + 0.4, zf + 0.02)], hz(P['lit'], k))
    else:
        dl = o * rh / hd; rows = 4; E = (eave - dl, zf + o); R = (eave + rh, z)
        for i in range(rows):
            t0, t1 = i / rows, (i + 1) / rows; c = rc * (1.0 if i % 2 == 0 else 0.86)
            poly(m, [(x - hw - o, E[0] + (R[0] - E[0]) * t0, E[1] + (R[1] - E[1]) * t0), (x + hw + o, E[0] + (R[0] - E[0]) * t0, E[1] + (R[1] - E[1]) * t0), (x + hw + o, E[0] + (R[0] - E[0]) * t1, E[1] + (R[1] - E[1]) * t1), (x - hw - o, E[0] + (R[0] - E[0]) * t1, E[1] + (R[1] - E[1]) * t1)], [c, c, c * 1.07, c * 1.07])
        poly(m, [(x - hw - o, R[0], R[1]), (x + hw + o, R[0], R[1]), (x + hw + o, eave, z - hd), (x - hw - o, eave, z - hd)], rc * 0.8)
        for sd in (-1, 1): poly(m, [(x + sd * hw, eave, zf), (x + sd * hw, eave, z - hd), (x + sd * hw, eave + rh, z)], wc * 0.92)
    if chim: box(m, (0.34, 0.7, 0.34), (x + (0.28 if gable else -0.3) * w, eave + rh * 0.62 + 0.2, z - (0.1 if gable else -0.15) * d), hz(P['stone2'], k), 0.0)

def far(mat):
    m = Mk()
    band(m, -25.0, -27, 27, 44, lambda x: -2.5 + 0.75 * math.sin(x * 0.21 + 1.0) + 0.3 * math.sin(x * 0.52), -17, hz(P['hill'], 0.5), hz(P['hill'], 0.72))      # 먼 언덕 둘
    band(m, -21.5, -24, 24, 40, lambda x: -3.3 + 0.55 * math.sin(x * 0.27 + 2.4) + 0.25 * math.sin(x * 0.7), -16, hz(P['hill2'], 0.36), hz(P['hill2'], 0.55))
    band(m, -17.5, -20, 20, 30, lambda x: -3.75 + 0.15 * math.sin(x * 0.9), -14, hz(P['grass'], 0.26), hz(P['grass'], 0.42))                                     # 마을 터
    band(m, -9.8, -15, 15, 30, lambda x: -2.95 + 0.22 * math.sin(x * 1.3) + 0.12 * math.sin(x * 3.1), -11, hz(P['hedge'], 0.12), hz(P['hedge'], 0.3))           # 가까운 울타리 숲
    # 가까운 이웃 지붕 넷(우리보다 낮다 — 지붕이 내려다보인다)
    house(m, -6.4, -6.6, 5.2, 4.0, -1.35, 1.5, P['wall1'], P['rose'], False, 0.1)
    house(m, -2.3, -8.6, 3.2, 4.0, -1.7, 1.4, P['wall2'], P['teal'], True, 0.14)
    house(m, 1.6, -7.6, 3.4, 3.6, -1.3, 1.2, P['wall1'], P['mustard'], False, 0.12, chim=False)
    house(m, 6.5, -6.2, 4.6, 4.2, -1.3, 1.6, P['wall2'], P['lavender'], True, 0.1)
    # 마을(멀리 · 더 흐리게)
    rc = (P['rose'], P['teal'], P['mustard'], P['lavender'], P['rose'], P['mustard'], P['teal'], P['rose'], P['lavender'], P['teal']); rnd = random.Random(3)
    for i, x in enumerate((-17.0, -13.2, -10.0, -5.2, -1.6, 2.2, 5.6, 9.4, 13.0, 16.8)):
        house(m, x, -14.0 - rnd.uniform(0, 2.4), rnd.uniform(2.6, 3.8), 3.0, -3.1 + rnd.uniform(0, 0.6), rnd.uniform(1.0, 1.5), (P['wall1'], P['wall2'])[i % 2], rc[i], i % 3 == 1, 0.3, chim=i % 2 == 0, bottom=-14.0)
    # 시계탑(왼쪽 하늘에 솟는다 — 마을의 표지)
    tx, tz, k = -8.2, -16.2, 0.32; box(m, (1.5, 14.6, 1.5), (tx, -6.6, tz), hz(P['wall1'], k), 0.0)
    for sd, c in ((-1, 1.0), (1, 0.88)): poly(m, [(tx + sd * 0.95, 0.6, tz + 0.95), (tx, 2.3, tz), (tx + sd * 0.95, 0.6, tz - 0.95)], hz(P['teal'], k) * c)
    poly(m, [(tx - 0.95, 0.6, tz + 0.95), (tx + 0.95, 0.6, tz + 0.95), (tx, 2.3, tz)], hz(P['teal'], k) * 1.05)
    cf = [(tx + math.cos(i / 12 * math.tau) * 0.42, -0.1 + math.sin(i / 12 * math.tau) * 0.42, tz + 0.77) for i in range(12)]; poly(m, cf, hz(P['lit'], k))
    return fin(m, 'p_far', mat, flat=True)

def trees(mat):
    m = Mk(); rnd = random.Random(11)
    for x, z, r, k in ((-9.6, -9.2, 1.25, 0.12), (-3.9, -9.4, 1.0, 0.14), (4.1, -9.0, 1.15, 0.12), (9.8, -9.3, 1.3, 0.12), (12.2, -9.6, 1.0, 0.14), (-12.6, -9.6, 1.1, 0.14),
                       (-15.0, -13.4, 1.1, 0.3), (-11.6, -15.6, 1.0, 0.32), (-3.4, -13.2, 1.05, 0.3), (0.4, -15.8, 0.95, 0.32), (7.6, -13.4, 1.1, 0.3), (11.2, -15.8, 1.0, 0.32), (15.0, -13.0, 1.15, 0.3)):
        y = (-2.7 if z > -11 else -3.5) + r * 0.55; c1, c2 = hz(P['tree'], k), hz(P['tree2'], k)
        m.ball(r, V(x, y, z), lambda p, y=y, r=r, c1=c1, c2=c2: mix(c1, c2, max(0.0, min(1.0, (p.z - y) / r * 0.6 + 0.4))), (1, 0.9, 1.05), 10)
    return fin(m, 'p_trees', mat)

def cloud(mat, i, at, s):
    m = Mk(); c = lambda p: mix(P['cloud2'], P['cloud'], max(0.0, min(1.0, p.z / (0.7 * s) + 0.45)))
    for dx, dy, r in ((-1.25, -0.08, 0.72), (-0.2, 0.22, 1.0), (0.95, 0.02, 0.82), (1.95, -0.16, 0.56)): m.ball(r * s, V(dx * s, dy * s, 0), c, (1, 0.5, 0.82), 18)
    return fin(m, 'cloud%d' % i, mat, loc=V(*at))

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True); mat = M.material('place_float_matte', 0.85)
    deck(mat); roof(mat); wall(mat); near(mat); vane(mat); beam(mat); far(mat); trees(mat)
    for i, (at, s) in enumerate((((-8.0, 4.4, -21.0), 1.35), ((4.2, 5.6, -22.0), 1.15), ((11.5, 2.6, -20.0), 1.0), ((-2.5, 8.6, -23.0), 1.6), ((-13.5, 0.9, -22.5), 0.95))): cloud(mat, i, at, s)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    build()

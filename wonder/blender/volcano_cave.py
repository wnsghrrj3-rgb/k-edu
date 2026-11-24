"""케이원더 · 화산 탐방 ① 용암 동굴 — 굴 한 토막과 바깥 용암 강의 땅, 겉 그림 석 장 (bpy, 화면 없이 실행)
   blender -b --python volcano_cave.py -- <out_dir>          (bpy 모듈만 있으면: python volcano_cave.py -- <out_dir>)
   블렌더 좌표: X 오른쪽 · Y 굴 안쪽(용암이 흘러간 쪽) · Z 위.  1 = 1m.  눈(무인기)은 Y = 0 에 있다.
   굴 바닥은 Y 쪽으로 조금씩 내려간다(SLOPE). 「굴 안 높이」 = Z + SLOPE × Y.
   만드는 것(cave.glb):
     'tube'    굴 벽·바닥·천장. 벽에 가로줄 둘(H1 무릎 높이 · H2 굴의 반) — 용암이 차 있던 높이의 턱
               색 R = 바닥인 정도(밧줄 무늬를 입힐 곳)
     'plug'    뚫리기 전의 천장 조각(옛날 장면에서만 보임)
     'shaft'   뚫린 천장 위로 난 구멍 벽
     'stal'    천장의 돌 고드름.  색 R = 끝 쪽인 정도, G = 길이(m)
     'rubble'  천장이 무너져 쌓인 돌무더기
     'ground'  굴이 되기 전의 땅 위(용암 강이 흐르는 골과 둑).  색 R = 강 가운데에서 떨어진 정도(÷ 강 반너비 ÷ 4)
   cave.json: 굴 가운데 줄·너비·높이·뚫린 자리·고드름 끝 자리(코드가 용암 면과 떨어지는 방울에 쓴다)
   겉 그림(1K, 이어 붙는 무늬, 계산으로 만든 것 — 실제 암석 스캔으로 바꿀 것):
     basalt_n.jpg(요철) · basalt_m.jpg(R 밝기 · G 거칠기 · B 높이) · ropy_n.jpg(밧줄 무늬 요철)
"""
import bpy, sys, os, math, json
import numpy as np
from PIL import Image

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else '.'
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
rng = np.random.default_rng(1124)

SLOPE = 0.035            # 바닥이 내려가는 정도
H1, H2 = 0.55, 3.10      # 벽 가로줄(용암이 차 있던 높이): 무릎 · 굴의 반
H0 = 1.7                 # 굴이 가장 넓은 높이
S0, S1, DS = -14.0, 72.0, 0.36
HOLE_S = 31.0            # 천장이 뚫린 자리
GL = 7.6                 # 굴 바닥에서 땅 위까지

# ── 굴이 가는 길
def cx(s):
    s = np.asarray(s, float)
    return 1.5 * np.sin(s / 21.0) + 0.021 * np.clip(s - 50, 0, None) ** 2 - 0.035 * np.clip(-s - 3, 0, None) ** 2
def halfw(s): s = np.asarray(s, float); return 4.15 + 0.65 * np.sin(s / 9.0 + 1.0) + 0.35 * np.sin(s / 3.7)
def height(s): s = np.asarray(s, float); return 5.9 + 0.7 * np.sin(s / 13.0 + 2.0) + 0.3 * np.sin(s / 5.0 + .4)

# ── 부드러운 잡음(사인 겹치기) — 굴 벽의 울퉁불퉁
class Lump:
    def __init__(self, seed, freq, n=7):
        r = np.random.default_rng(seed)
        self.k = r.normal(size=(n, 3)); self.k /= np.linalg.norm(self.k, axis=1)[:, None]; self.k *= freq * r.uniform(.6, 1.5, (n, 1))
        self.p = r.uniform(0, 6.28, n); self.n = n
    def __call__(self, x, y, z):
        v = 0
        for i in range(self.n): v = v + np.sin(self.k[i, 0] * x + self.k[i, 1] * y + self.k[i, 2] * z + self.p[i])
        return v / math.sqrt(self.n)
L_BIG, L_MID, L_SML = Lump(1, .23), Lump(2, .75), Lump(3, 2.3)
def sstep(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

# ── 굴의 옆모습: 반쪽(오른쪽) 벽을 바닥 구석에서 꼭대기까지
WALL_H = [0.10, 0.26, 0.42, 0.50, 0.55, 0.60, 0.85, 1.2, 1.7, 2.2, 2.6, 2.85, 3.0, 3.07, 3.10, 3.16, 3.4, 3.8, 4.2]
N_CROWN, N_FLOOR = 9, 22
def section(s):
    """한 고리의 점들(x, z 굴 안 높이)과 바닥인 정도. 왼쪽 바닥 구석에서 시작해 바닥 → 오른쪽 벽 → 천장 → 왼쪽 벽."""
    A, H = float(halfw(s)), float(height(s))
    h1 = H1 + .035 * math.sin(s * .9) + .02 * math.sin(s * 2.3 + 1); h2 = H2 + .05 * math.sin(s * .5 + 2) + .025 * math.sin(s * 1.9)
    b1 = .30 + .06 * math.sin(s * 1.3); b2 = .30 + .10 * math.sin(s * .37 + 1) + .05 * math.sin(s * 1.7)
    def w(h, side):
        ww = A * (1 - .10 * ((H0 - h) / H0) ** 2) if h <= H0 else A * math.sqrt(max(0, 1 - ((h - H0) / (H - H0)) ** 2))
        gap = .55 + .45 * sstep(-.35, .1, math.sin(s * .21 + side * 2.2) + .5 * math.sin(s * .83 + side))      # 턱이 군데군데 떨어져 나감
        inset = b2 * gap * (1 - sstep(h2 - .03, h2 + .05, h)) * (.55 + .45 * sstep(1.2, h2, h)) + b1 * (1 - sstep(h1 - .02, h1 + .05, h))
        return ww - inset
    hs = [h + (h1 - H1 if h < 1 else h2 - H2 if 2.5 < h < 3.5 else 0) for h in WALL_H]
    a0 = math.asin((hs[-1] - H0) / (H - H0))
    crown = [H0 + (H - H0) * math.sin(a0 + (math.pi / 2 - a0) * (i + 1) / N_CROWN) for i in range(N_CROWN)]
    right = [(w(h, 1), h) for h in hs] + [(w(h, 1), h) for h in crown[:-1]]
    left = [(-w(h, -1), h) for h in hs] + [(-w(h, -1), h) for h in crown[:-1]]
    w0r, w0l = w(0, 1), w(0, -1)
    floor = []
    for i in range(N_FLOOR + 1):
        t = i / N_FLOOR; x = -w0l + (w0l + w0r) * t; u = 2 * t - 1
        z = .05 * (1 - u * u) - .07 * math.exp(-((abs(u) - .93) / .07) ** 2)                           # 가운데가 조금 봉긋, 벽 밑에 도랑
        z += .045 * math.sin(2.6 * (s + 1.6 * u * u) + .8 * math.sin(s * .31 + u * 2)) * (1 - u ** 4)    # 밧줄 주름(흘러간 쪽으로 볼록한 활)
        floor.append((x, z))
    pts = floor + right + [(0.0, H)] + left[::-1]
    fl = [1.0] * len(floor) + [max(0, 1 - h / .16) for _, h in right] + [0] + [max(0, 1 - h / .16) for _, h in left[::-1]]
    return pts, fl
NC = (N_FLOOR + 1) + 2 * (len(WALL_H) + N_CROWN - 1) + 1
ss = np.arange(S0, S1 + 1e-6, DS); NR = len(ss)
P = np.zeros((NR, NC, 3)); FL = np.zeros((NR, NC))
for r, s in enumerate(ss):
    pts, fl = section(s)
    for c, (x, h) in enumerate(pts): P[r, c] = (x, s, h)
    FL[r] = fl
# 울퉁불퉁: 고리 가운데에서 바깥쪽으로 밀고 당김(바닥은 조금만)
ctr = np.array([0, 0, 2.6])
d = P - np.array([0, 1, 0]) * P[..., 1:2] - ctr; dl = np.linalg.norm(d, axis=2, keepdims=True); dn = d / dl
X, Y, Z = P[..., 0], P[..., 1], P[..., 2]
bump = .34 * L_BIG(X, Y, Z) + .11 * L_MID(X, Y, Z) + .035 * L_SML(X, Y, Z)
bump *= (1 - .85 * FL)
P += dn * bump[..., None]
P[..., 0] += cx(P[..., 1]); P[..., 2] -= SLOPE * P[..., 1]
# 겉 그림 자리: 둘레 길이와 굴 길이(3m 마다 되풀이)
mid = P[NR // 3]; seg = np.linalg.norm(np.diff(np.vstack([mid, mid[:1]]), axis=0), axis=1); arc = np.concatenate([[0], np.cumsum(seg)])
TILE = 3.0; arc *= round(arc[-1] / TILE) / (arc[-1] / TILE)                                           # 둘레가 무늬 몇 장에 딱 맞게

def obj_from(name, verts, faces, uvs=None, cols=None, smooth=True):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in verts], [], [tuple(int(i) for i in f) for f in faces]); me.update()
    if uvs is not None:
        uv = me.uv_layers.new(name='UVMap'); uv.data.foreach_set('uv', np.asarray(uvs, 'f').ravel())
    if cols is not None:
        ca = me.color_attributes.new(name='Color', type='FLOAT_COLOR', domain='CORNER'); ca.data.foreach_set('color', np.asarray(cols, 'f').ravel())
        me.color_attributes.active_color = ca; me.color_attributes.render_color_index = 0
    for p in me.polygons: p.use_smooth = smooth
    m = bpy.data.materials.new(name); m.use_nodes = True; me.materials.append(m)
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); return o

# ── 굴: 면 만들기. 뚫린 천장 조각은 따로('plug')
hole_x = float(cx(HOLE_S))
def hole_r(a): return 1.75 * (1 + .2 * math.sin(3 * a + 1) + .11 * math.sin(7 * a + 2))
V = P.reshape(-1, 3); faces, uvs, cols, pf, pu, pc = [], [], [], [], [], []
for r in range(NR - 1):
    for c in range(NC):
        c2 = (c + 1) % NC; q = [r * NC + c, r * NC + c2, (r + 1) * NC + c2, (r + 1) * NC + c]
        uu = [(arc[c] / TILE, ss[r] / TILE), (arc[c + 1] / TILE, ss[r] / TILE), (arc[c + 1] / TILE, ss[r + 1] / TILE), (arc[c] / TILE, ss[r + 1] / TILE)]
        cc = [(FL[r, c], 0, 0, 1), (FL[r, c2], 0, 0, 1), (FL[r + 1, c2], 0, 0, 1), (FL[r + 1, c], 0, 0, 1)]
        cen = V[q].mean(0); dx, dy = cen[0] - hole_x, cen[1] - HOLE_S
        inhole = cen[2] + SLOPE * cen[1] > 3.8 and math.hypot(dx, dy) < hole_r(math.atan2(dy, dx))
        (pf if inhole else faces).append(q[::-1]); (pu if inhole else uvs).extend(uu[::-1]); (pc if inhole else cols).extend(cc[::-1])
tube = obj_from('tube', V, faces, uvs, cols)
plug = obj_from('plug', V, pf, pu, pc)
for o in (tube, plug):                                                     # 안 쓰는 점 지우기
    bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.delete_loose(); bpy.ops.object.mode_set(mode='OBJECT'); o.select_set(False)

# 천장 높이 찾기(고드름·구멍 벽 자리에 쓴다)
crown0 = (N_FLOOR + 1) + len(WALL_H) + 2                                    # 천장 쪽 점들의 첫 칸
crown_cols = list(range(crown0, crown0 + 2 * (N_CROWN - 3) + 1))
def ceil_at(r, c): return P[r, c]

# ── 뚫린 구멍의 벽(위로 3m 남짓, 삐죽빼죽)
sv, sf, su = [], [], []
hz = float(height(HOLE_S)) - SLOPE * HOLE_S - .9; NA, NZ = 26, 7
for j in range(NZ):
    for i in range(NA):
        a = i / NA * math.tau; rr = hole_r(a) * (1.0 + .05 * j) + .16 * math.sin(a * 5 + j * 1.7) + .1 * math.sin(a * 11 + j)
        sv.append((hole_x + math.cos(a) * rr, HOLE_S + math.sin(a) * rr, hz + j * .62 + .12 * math.sin(a * 4 + j)))
for j in range(NZ - 1):
    for i in range(NA):
        i2 = (i + 1) % NA; sf.append((j * NA + i, j * NA + i2, (j + 1) * NA + i2, (j + 1) * NA + i))
        su.extend([(i / NA * 4, j * .2), ((i + 1) / NA * 4, j * .2), ((i + 1) / NA * 4, (j + 1) * .2), (i / NA * 4, (j + 1) * .2)])
obj_from('shaft', sv, sf, su, [(0, 0, 0, 1)] * len(su))

# ── 돌 고드름: 천장에서 곧게 아래로. 무리 지어 달린다
st_v, st_f, st_c, tips = [], [], [], []
def stal(root, L, R):
    b = len(st_v); n = 6; fat = rng.uniform(.8, 1.25, 6)                     # 뿌리는 천장에 퍼져 붙고, 끝에는 굳다 만 방울
    rings = [(0, 2.1), (.10, 1.0 * fat[0]), (.38, .68 * fat[1]), (.68, .46 * fat[2]), (.86, .50 * fat[3]), (1.0, .0)]
    ph = rng.uniform(0, 6.28); lean = rng.normal(0, .05, 2)
    for t, k in rings:
        for i in range(n):
            a = ph + i / n * math.tau; rr = R * k * (1 + .18 * math.sin(a * 2 + t * 5))
            st_v.append((root[0] + math.cos(a) * rr + lean[0] * t, root[1] + math.sin(a) * rr + lean[1] * t, root[2] + .07 - L * t - .05 * L * t * math.sin(a * 1 + ph))); st_c.append((t, L))
    for j in range(len(rings) - 1):
        for i in range(n):
            i2 = (i + 1) % n; st_f.append((b + j * n + i, b + (j + 1) * n + i, b + (j + 1) * n + i2, b + j * n + i2))
    tips.append((root[0], root[1], root[2] - L))
clusters = [(rng.uniform(S0 + 2, 62), rng.normal(0, 1.2)) for _ in range(64)]
for cs, cxo in clusters:
    for _ in range(int(rng.integers(6, 17))):
        s = cs + rng.normal(0, .8); xo = cxo + rng.normal(0, .55)
        r = int(np.clip(round((s - S0) / DS), 1, NR - 2)); row = P[r, crown_cols]
        c = crown_cols[int(np.argmin(np.abs(row[:, 0] - cx(ss[r]) - xo)))]; root = ceil_at(r, c)
        if math.hypot(root[0] - hole_x, root[1] - HOLE_S) < 2.6: continue
        L = float(np.clip(rng.gamma(1.7, .10), .06, .8)); stal(root + rng.normal(0, .05, 3) * (1, 1, 0), L, .035 + .10 * L * rng.uniform(.6, 1.2))
st_cols = []
for f in st_f:
    for i in f: st_cols.append((st_c[i][0], st_c[i][1], 0, 1))
obj_from('stal', st_v, st_f, None, st_cols)

# ── 무너져 쌓인 돌무더기(뚫린 천장 아래)
rv, rf = [], []
def rock(c, size):
    b = len(rv); n1, n2 = 7, 5; lump = Lump(int(rng.integers(1e6)), 1.8 / size, 4); sq = rng.uniform(.55, .9)
    for j in range(n2 + 1):
        th = j / n2 * math.pi
        for i in range(n1):
            a = i / n1 * math.tau; dv = np.array([math.sin(th) * math.cos(a), math.sin(th) * math.sin(a), math.cos(th) * sq])
            p = dv * size * (1 + .28 * lump(*(dv * size))); rv.append(tuple(c + p))
    for j in range(n2):
        for i in range(n1):
            i2 = (i + 1) % n1; rf.append((b + j * n1 + i, b + j * n1 + i2, b + (j + 1) * n1 + i2, b + (j + 1) * n1 + i))
fz = -SLOPE * HOLE_S
for _ in range(74):
    rr = abs(rng.normal(0, 1.5)); a = rng.uniform(0, 6.28); size = float(np.clip(rng.gamma(2.5, .14), .14, .8)) * (1 - .25 * min(1, rr / 3))
    mound = 1.25 * math.exp(-(rr / 1.9) ** 2)
    rock(np.array([hole_x + math.cos(a) * rr, HOLE_S + math.sin(a) * rr * 1.25, fz + mound + size * .28]), size)
obj_from('rubble', rv, rf, None, None, smooth=False)

# ── 굴이 되기 전의 땅 위: 용암 강이 흐르는 골과 둑
OFF = [0, .8, 1.6, 2.3, 2.8, 3.15, 3.5, 3.9, 4.5, 5.5, 7, 9, 12, 16, 21, 28, 38, 52, 75, 110]
offs = np.array([-o for o in OFF[:0:-1]] + OFF); GS = np.concatenate([np.arange(-30, 60, .5), np.arange(60, 120, 1.5), np.arange(120, 330, 8.0)])
def riverw(s): return 3.0 + .5 * np.sin(np.asarray(s, float) / 9 + 1)
G_BIG, G_SML = Lump(11, .16, 9), Lump(12, .9, 7)
gv, gf, gu, gc, across = [], [], [], [], []
for s in GS:
    hw = float(riverw(s)); c0 = float(cx(min(s, 62)) + (s - 62) * .5 if s > 62 else cx(s))
    for o in offs:
        x = c0 + o; a = abs(o)
        z = -SLOPE * s + GL + .42 * G_BIG(x, s, 0) * sstep(hw, hw + 6, a) + .06 * G_SML(x, s, 0)
        z -= 1.9 * (1 - sstep(hw - .7, hw + .1, a)); z += .7 * math.exp(-((a - hw - .7) / .9) ** 2)
        gv.append((x, s, z)); across.append(min(1, a / hw / 4))
ng = len(offs)
for r in range(len(GS) - 1):
    for c in range(ng - 1):
        q = [r * ng + c, r * ng + c + 1, (r + 1) * ng + c + 1, (r + 1) * ng + c]; gf.append(q)
        for i in q: gu.append((gv[i][0] / 4, gv[i][1] / 4)); gc.append((across[i], 0, 0, 1))
obj_from('ground', gv, gf, gu, gc)

bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'cave.glb'), export_format='GLB', export_apply=True, export_yup=True,
                          export_vertex_color='ACTIVE', export_all_vertex_colors=True, export_active_vertex_color_when_no_material=True,
                          export_materials='EXPORT', export_normals=True, export_texcoords=True)
tri = sum(len(o.data.polygons) for o in bpy.data.objects) * 2
js = { 'slope': SLOPE, 'h1': H1, 'h2': H2, 'gl': GL, 's0': -14, 'ds': 1.0,
       'cx': [round(float(cx(s)), 3) for s in np.arange(-14, 73, 1.0)], 'hw': [round(float(halfw(s)), 3) for s in np.arange(-14, 73, 1.0)],
       'ht': [round(float(height(s)), 3) for s in np.arange(-14, 73, 1.0)], 'rw': [round(float(riverw(s)), 3) for s in np.arange(-14, 73, 1.0)],
       'hole': { 's': HOLE_S, 'x': round(hole_x, 3), 'r': 1.75, 'top': round(hz + (NZ - 1) * .62, 3), 'ceil': round(float(height(HOLE_S)) - SLOPE * HOLE_S, 3) },
       'tips': [[round(float(v), 3) for v in t] for t in tips if -6 < t[1] < 40][::5] }
json.dump(js, open(os.path.join(OUT, 'cave.json'), 'w'))
print('삼각형 약', tri, '· 고드름', len(tips), '· cave.glb', os.path.getsize(os.path.join(OUT, 'cave.glb')) // 1024, 'KB')

# ── 겉 그림: 이어 붙는 무늬를 계산으로
N = 1024
def spec(beta, seed, n=N):
    r = np.random.default_rng(seed); f = np.fft.fftfreq(n)[:, None] ** 2 + np.fft.fftfreq(n)[None, :] ** 2; f[0, 0] = 1
    a = np.fft.ifft2((r.normal(size=(n, n)) + 1j * r.normal(size=(n, n))) / f ** (beta / 2)).real
    a -= a.min(); return a / a.max()
def normal_map(h, strength):
    dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * strength; dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * strength
    n = np.dstack([-dx, dy, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    return ((n * .5 + .5) * 255).astype(np.uint8)
def save(name, arr): Image.fromarray(arr).save(os.path.join(OUT, name), quality=90)
# 현무암 벽: 큰 굴곡 + 갈라진 금 + 흘러내리다 굳은 자국 + 기체가 빠진 구멍
big, midn, fine = spec(2.6, 1), spec(1.9, 2), spec(1.1, 3)
crack = 1 - np.abs(spec(2.2, 4) - .5) * 2; crack = np.clip((crack - .9) / .1, 0, 1)
h = .55 * big + .3 * midn + .12 * fine - .22 * crack
yy, xx = np.mgrid[0:N, 0:N]
for _ in range(2600):                                                      # 구멍(크고 작게)
    px, py, pr = rng.integers(N), rng.integers(N), rng.gamma(2, 2.2) + 1.5; k = int(pr * 2.5) + 1
    ys = (np.arange(py - k, py + k + 1) % N)[:, None]; xs = (np.arange(px - k, px + k + 1) % N)[None, :]
    dd = (np.arange(-k, k + 1)[:, None] ** 2 + np.arange(-k, k + 1)[None, :] ** 2) / pr ** 2
    h[ys, xs] -= .16 * np.exp(-dd * 1.6)
h -= h.min(); h /= h.max()
save('basalt_n.jpg', normal_map(h, 17))
wet = spec(2.4, 7)
rough = np.clip(.30 + .5 * sstep(.45, .8, wet) + .25 * (1 - h) * (h < .35) + .1 * fine, .12, 1)
alb = np.clip(.35 + .5 * midn + .25 * (spec(2.0, 9) - .5) - .3 * crack, 0, 1)
save('basalt_m.jpg', (np.dstack([alb, rough, h]) * 255).astype(np.uint8))
# 밧줄 무늬(바닥): 흘러간 쪽으로 볼록한 주름이 겹겹이
u, v = xx / N, yy / N
warp = spec(2.6, 21) - .5; warp2 = spec(2.2, 22) - .5
ph = 2 * math.pi * (7 * v + 1.15 * np.cos(2 * math.pi * u) + 5.0 * warp)
ridge = (.5 + .5 * np.sin(ph)) ** .7
ph2 = 2 * math.pi * (19 * v + 2.2 * np.cos(2 * math.pi * u + 1) + 8 * warp2)
hr = .62 * ridge + .16 * (.5 + .5 * np.sin(ph2)) * ridge + .16 * spec(2.4, 23) + .06 * fine
save('ropy_n.jpg', normal_map(hr, 6))
print('겉 그림 석 장')

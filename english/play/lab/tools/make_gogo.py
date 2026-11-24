"""고고(Gogo) — 영어 놀이터 「커졌다 작아졌다」 시험판의 주인공 몬스터를 블렌더로 빚는다.
실행(화면 없이):  blender -b --python english/play/lab/tools/make_gogo.py      → english/play/lab/assets/gogo.glb
동작 클립까지:    make_gogo_clips.py (2단계) 가 이 파일의 build() 를 불러 쓴다.

모양  한 덩어리 몸(공·알약 모양을 합쳐 빚은 뒤 문질러 이음) + 더듬이 + 눈(흰자·눈동자·빛점·눈꺼풀 위아래·어지러움 소용돌이) + 입(모양 키)
뼈대  root › hips › belly › head › (ant1·ant2, 눈 뼈들) · belly › arm·fore·hand · hips › leg·foot · tail
표정  눈 크기 = eye_* 뼈 크기 · 눈꺼풀 = lidU_*/lidD_* 뼈 돌림 · 눈길 = pupil_* 뼈 돌림 · 입 = 모양 키(smile·open·oh·wavy·worry)
색    꼭짓점 색(무늬 그림 없음): 위가 밝은 초록 · 크림색 배 · 등 점무늬 · 볼 · 틈새 그늘
좌표  블렌더 z 위 · 앞 -y · 고고의 왼쪽 +x. 내보내면 y 위 · 앞 +z (three). 발바닥 가운데가 원점, 키 약 1.05(더듬이 끝 1.27).
"""
import bpy, bmesh, math, os, random
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'gogo.glb'))

# ───────────────────────── 치수 ─────────────────────────
VOX = 0.017                     # 빚는 알갱이 크기(작을수록 촘촘)
SMOOTH = 8                      # 문지르는 횟수
TORSO = [((0, 0, 0.48), (0.36, 0.33, 0.33)), ((0, 0, 0.61), (0.345, 0.32, 0.30)), ((0, -0.01, 0.74), (0.33, 0.31, 0.31))]
ARM = ((0.29, -0.02, 0.55), 0.082, (0.47, -0.04, 0.39), 0.068)        # 어깨 → 손목 (왼쪽)
HAND = ((0.502, -0.052, 0.342), 0.088)
FINGER = (0.082, 40, 0.044)                                           # 손가락 셋: 손 가운데에서 나간 거리 · 벌어진 각(도, 앞에서 볼 때) · 굵기
LEG = ((0.16, 0, 0.27), 0.088, (0.17, 0, 0.09), 0.078)
FOOT = ((0.176, -0.066, 0.045), (0.116, 0.168, 0.078))                # 발(바닥 아래는 잘라 낸다)
TOES = ((0.068, -0.185), (0.0, -0.222), (-0.068, -0.185), 0.047)       # 발가락 셋의 (x, y) 와 굵기
TAIL = ((0, 0.29, 0.33), 0.075, (0, 0.425, 0.40), 0.034)
ANT = ((0.115, 0.0, 1.00), (0.15, 0.03, 1.16), (0.235, -0.03, 1.225))  # 더듬이 밑 · 굽이 · 끝 (왼쪽)
ANT_R, ANT_TIP = (0.026, 0.019), 0.052
EYE_C, EYE_R = (0.132, -0.212, 0.782), 0.122
MOUTH_Z = 0.612
Z_HIPS, Z_HEAD = (0.28, 0.42), (0.50, 0.64)                            # 몸통 뼈 사이가 섞이는 높이

BONES = [  # 이름, 머리, 꼬리, 부모
    ('root', (0, 0, 0), (0, 0, 0.22), None),
    ('hips', (0, 0, 0.22), (0, 0, 0.36), 'root'),
    ('belly', (0, 0, 0.36), (0, 0, 0.58), 'hips'),
    ('head', (0, 0, 0.58), (0, 0, 1.03), 'belly'),
    ('tail', (0, 0.28, 0.32), (0, 0.44, 0.405), 'hips'),
]
for s, n in ((1, 'L'), (-1, 'R')):
    m = lambda p: (p[0] * s, p[1], p[2])
    el = ((ARM[0][0] + ARM[2][0]) / 2, (ARM[0][1] + ARM[2][1]) / 2, (ARM[0][2] + ARM[2][2]) / 2)
    BONES += [
        ('arm_' + n, m(ARM[0]), m(el), 'belly'), ('fore_' + n, m(el), m(ARM[2]), 'arm_' + n), ('hand_' + n, m(ARM[2]), m((0.525, -0.06, 0.28)), 'fore_' + n),
        ('leg_' + n, m((0.16, 0, 0.27)), m((0.17, 0, 0.085)), 'hips'), ('foot_' + n, m((0.17, 0, 0.085)), m((0.172, -0.19, 0.03)), 'leg_' + n),
        ('ant1_' + n, m(ANT[0]), m(ANT[1]), 'head'), ('ant2_' + n, m(ANT[1]), m(ANT[2]), 'ant1_' + n),
    ]
    ec, ef = m(EYE_C), m((EYE_C[0], EYE_C[1] - 0.08, EYE_C[2]))
    BONES += [('eye_' + n, ec, ef, 'head')] + [(k + '_' + n, ec, ef, 'eye_' + n) for k in ('pupil', 'lidU', 'lidD', 'swirl')]

# ───────────────────────── 색 ─────────────────────────
def lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def rgb(h):
    h = h.lstrip('#'); return Vector((lin(int(h[0:2], 16) / 255), lin(int(h[2:4], 16) / 255), lin(int(h[4:6], 16) / 255)))

C = {k: rgb(v) for k, v in {
    'top': '#7fd66e', 'mid': '#4fbd62', 'low': '#2f9a55', 'belly': '#f7f0c0', 'spot': '#2f8c50', 'toe': '#2b8a50', 'blush': '#ff8a8a',
    'stalk': '#3fa45c', 'tip': '#ffcc70', 'tipHi': '#ffe6a8', 'white': '#ffffff', 'pupil': '#2a1a14', 'iris': '#3b2a5c', 'lip': '#2c6f47',
    'cavTop': '#2b0a16', 'cavLow': '#6a1d33', 'tongue': '#ff8fa6', 'tongueRim': '#ec6a88', 'fang': '#fffbe9', 'lidRim': '#3c9c5a'}.items()}
SPOTS = [((0.21, 0.20, 0.87), 0.075), ((-0.13, 0.27, 0.70), 0.065), ((0.06, 0.31, 0.52), 0.08), ((-0.26, 0.12, 0.94), 0.052), ((-0.21, -0.13, 0.985), 0.046),
         ((0.275, -0.08, 0.955), 0.034), ((-0.30, 0.17, 0.46), 0.06), ((0.31, 0.14, 0.60), 0.045), ((0.02, 0.10, 1.03), 0.05)]

sst = lambda a, b, x: (lambda t: t * t * (3 - 2 * t))(min(1.0, max(0.0, (x - a) / (b - a))))
mix = lambda a, b, t: a + (b - a) * t
V3 = lambda p: Vector(p)

def base_green(z):
    return mix(C['low'], C['mid'], sst(0.02, 0.5, z)) if z < 0.5 else mix(C['mid'], C['top'], sst(0.5, 1.02, z))

def q_torso(p):
    return min(math.sqrt(((p.x - c[0]) / r[0]) ** 2 + ((p.y - c[1]) / r[1]) ** 2 + ((p.z - c[2]) / r[2]) ** 2) for c, r in TORSO)

def torso_w(z):
    wh, wd = 1 - sst(*Z_HIPS, z), sst(*Z_HEAD, z)
    return {'hips': wh, 'belly': max(0.0, 1 - wh - wd), 'head': wd}

def seg_t(p, a, b):
    ab = b - a; return (p - a).dot(ab) / ab.length_squared

# ───────────────────────── 몸 ─────────────────────────
def ball(bm, c, r):
    r = (r, r, r) if isinstance(r, (int, float)) else r
    bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=20, radius=1.0, matrix=Matrix.Translation(c) @ Matrix.Diagonal((r[0], r[1], r[2], 1.0)))

def chain(bm, p0, r0, p1, r1, n=7):
    for i in range(n + 1):
        t = i / n; ball(bm, V3(p0).lerp(V3(p1), t), mix(r0, r1, t))

def build_body():
    bm = bmesh.new()
    for c, r in TORSO: ball(bm, c, r)
    for s in (1, -1):
        m = lambda p: (p[0] * s, p[1], p[2])
        chain(bm, m(ARM[0]), ARM[1], m(ARM[2]), ARM[3]); ball(bm, m(HAND[0]), HAND[1]); ad = (V3(ARM[2]) - V3(ARM[0])).normalized()
        for k in (-1, 0, 1): ball(bm, m(tuple(V3(HAND[0]) + (Matrix.Rotation(math.radians(k * FINGER[1]), 3, 'Y') @ ad) * FINGER[0] + Vector((0, -0.018 * abs(k), 0)))), FINGER[2])
        chain(bm, m(LEG[0]), LEG[1], m(LEG[2]), LEG[3], 5); ball(bm, m(FOOT[0]), FOOT[1])
        for tx, ty in TOES[:3]: ball(bm, m((FOOT[0][0] + tx, ty, 0.04)), TOES[3])
    chain(bm, TAIL[0], TAIL[1], TAIL[2], TAIL[3], 6)
    raw = bpy.data.meshes.new('raw'); bm.to_mesh(raw); bm.free()
    ob = bpy.data.objects.new('raw', raw); bpy.context.collection.objects.link(ob)
    md = ob.modifiers.new('rm', 'REMESH'); md.mode = 'VOXEL'; md.voxel_size = VOX; md.adaptivity = 0.0
    sm = ob.modifiers.new('sm', 'SMOOTH'); sm.factor = 0.5; sm.iterations = SMOOTH
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    bpy.data.objects.remove(ob); bpy.data.meshes.remove(raw)

    bm = bmesh.new(); bm.from_mesh(me); bpy.data.meshes.remove(me)
    cut = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, 0), plane_no=(0, 0, 1), clear_inner=True)   # 발바닥은 평평하게 잘라 막는다
    bmesh.ops.holes_fill(bm, edges=[e for e in cut['geom_cut'] if isinstance(e, bmesh.types.BMEdge)], sides=0)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    tags = {}                                            # 더듬이 꼭짓점 → (쪽, t, 끝인가)
    for s, n in ((1, 'L'), (-1, 'R')):
        p0, p1, p2 = (V3((p[0] * s, p[1], p[2])) for p in ANT)
        p0 = p0 - Vector((0, 0, 0.07)); rings = []
        for i in range(13):
            t = i / 12; c = p0 * (1 - t) ** 2 + p1 * 2 * t * (1 - t) + p2 * t * t; tg = ((p1 - p0) * (1 - t) + (p2 - p1) * t).normalized()
            nx = tg.cross(Vector((0, 1, 0))).normalized(); ny = tg.cross(nx); r = mix(ANT_R[0], ANT_R[1], t); ring = []
            for j in range(10):
                a = j / 10 * math.tau; v = bm.verts.new(c + (nx * math.cos(a) + ny * math.sin(a)) * r); tags[v] = (n, t, False); ring.append(v)
            rings.append(ring)
        for a, b in zip(rings, rings[1:]):
            for j in range(10): bm.faces.new((a[j], a[(j + 1) % 10], b[(j + 1) % 10], b[j]))
        tip = bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=12, radius=ANT_TIP, matrix=Matrix.Translation(p2 + (p2 - p1).normalized() * 0.02))
        for v in tip['verts']: tags[v] = (n, 1.0, True)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.verts.ensure_lookup_table(); bm.verts.index_update(); bm.normal_update()
    bvh = BVHTree.FromBMesh(bm)

    # 틈새 그늘(꼭짓점마다 반구로 빛줄기를 쏘아 가려진 만큼 어둡게)
    rnd = random.Random(3); dirs = []
    while len(dirs) < 28:
        d = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-1, 1)))
        if 0.05 < d.length < 1: dirs.append(d.normalized())
    cols, wts = [], []
    for v in bm.verts:
        p, nrm = v.co, v.normal; occ = tot = 0.0
        for d in dirs:
            k = d.dot(nrm)
            if k < 0: d, k = -d, -k
            tot += k; hit = bvh.ray_cast(p + nrm * 0.006, d, 0.30)
            if hit[0] is not None: occ += k * (1 - hit[3] / 0.30)
        ao = 1 - 0.62 * (occ / tot); ao *= mix(0.80, 1.0, sst(0.0, 0.10, p.z + max(0.0, nrm.z) * 0.1))   # 바닥 가까이는 조금 더 어둡게
        tg = tags.get(v)
        if tg:
            col = mix(C['tip'], C['tipHi'], sst(-0.2, 1.0, nrm.z)) if tg[2] else mix(base_green(1.0), C['stalk'], sst(0.0, 0.35, tg[1]))
            w = {'head': 1.0} if tg[1] < 0.08 else {'ant1_' + tg[0]: 1 - sst(0.35, 0.65, tg[1]), 'ant2_' + tg[0]: sst(0.35, 0.65, tg[1])}
            if tg[1] < 0.3 and not tg[2]: w = {'head': 1 - sst(0.08, 0.3, tg[1]), 'ant1_' + tg[0]: sst(0.08, 0.3, tg[1])}
        else:
            col = base_green(p.z); q = q_torso(p)
            for sc, sr in SPOTS: col = mix(col, C['spot'], 0.85 * (1 - sst(sr * 0.72, sr, (p - V3(sc)).length)))
            if p.y < 0.02:                                # 배
                e = math.hypot(p.x / 0.225, (p.z - 0.375) / 0.20); col = mix(col, C['belly'], (1 - sst(0.80, 1.0, e)) * sst(-0.02, -0.10, p.y))
                for sx in (1, -1):                        # 볼
                    d = math.hypot(p.x - sx * 0.258, p.z - 0.66); col = mix(col, C['blush'], 0.6 * (1 - sst(0.012, 0.056, d)))
            if p.z < 0.15: col = mix(col, C['toe'], (1 - sst(0.03, 0.15, p.z)) * 0.55 * sst(1.0, 1.1, q))
            # 뼈 무게
            sn = 'L' if p.x > 0 else 'R'; ax = abs(p.x); pm = Vector((ax, p.y, p.z)); w = torso_w(p.z); limb = {}
            if ax > 0.24 and p.z > 0.2 and q > 1.0:       # 팔
                k = sst(1.0, 1.34, q); t = seg_t(pm, V3(ARM[0]), V3(ARM[2])); hand = sst(0.9, 1.12, t); fore = sst(0.36, 0.64, t) * (1 - hand)
                limb = {'arm_' + sn: k * (1 - fore - hand), 'fore_' + sn: k * fore, 'hand_' + sn: k * hand}
                col = mix(col, C['low'], 0.35 * sst(0.9, 1.5, t))
            elif p.z < 0.30 and ax > 0.03 and p.y < 0.2 and q > 1.0:   # 다리 · 발
                k = sst(1.02, 1.14, q); f = 1 - sst(0.07, 0.12, p.z); limb = {'leg_' + sn: k * (1 - f), 'foot_' + sn: k * f}
            elif p.y > 0.2 and ax < 0.14 and q > 1.0:     # 꼬리
                k = sst(1.02, 1.2, q); limb = {'tail': k}; col = mix(col, C['top'], 0.5 * sst(1.15, 1.5, q))
            ks = sum(limb.values()); w = {b: x * (1 - ks) for b, x in w.items()}; w.update(limb)
        cols.append(col * ao); wts.append(w)
    for _ in range(3):                                   # 뼈 무게를 이웃끼리 문질러 접히는 자리가 각지지 않게
        nxt = []
        for v in bm.verts:
            if v in tags: nxt.append(wts[v.index]); continue
            acc = {b: x * 0.5 for b, x in wts[v.index].items()}; nb = [e.other_vert(v).index for e in v.link_edges]
            for i in nb:
                for b, x in wts[i].items(): acc[b] = acc.get(b, 0.0) + x * 0.5 / len(nb)
            nxt.append(acc)
        wts = nxt
    return bm, cols, wts, bvh

# ───────────────────────── 눈 ─────────────────────────
class Parts:
    """뼈 하나에 통째로 붙는 조각들을 한 물체에 모은다."""
    def __init__(self): self.bm = bmesh.new(); self.cols = []; self.bones = []

    def vert(self, co, col, bone):
        self.cols.append(col); self.bones.append(bone); return self.bm.verts.new(co)

    def band(self, center, R, axis, a0, a1, col, bone, mat=0, rings=10, segs=32, rim_to=None, col_fn=None):
        """공 껍질의 띠(축에서 잰 각 a0~a1 도). rim_to 를 주면 가장자리에서 그 반지름까지 안쪽으로 테를 두른다."""
        center = V3(center); rot = V3(axis).normalized().to_track_quat('Z', 'Y').to_matrix(); rows = []
        for i in range(rings + 1):
            a = math.radians(mix(a0, a1, i / rings)); row = []
            for j in range(1 if a < 1e-6 else segs):
                f = j / segs * math.tau; d = rot @ Vector((math.sin(a) * math.cos(f), math.sin(a) * math.sin(f), math.cos(a)))
                row.append(self.vert(center + d * R, col_fn(d) if col_fn else col, bone))
            rows.append(row)
        faces = []
        for a, b in zip(rows, rows[1:]):
            for j in range(segs):
                k = (j + 1) % segs
                faces.append(self.bm.faces.new((a[0], b[j], b[k]) if len(a) == 1 else (a[j], b[j], b[k], a[k])))
        for f in faces:
            f.material_index = mat; f.smooth = True; f.normal_update()
            if f.normal.dot(f.calc_center_median() - center) < 0: f.normal_flip()
        if rim_to:
            inner = [self.vert(center + (v.co - center).normalized() * rim_to, C['lidRim'], bone) for v in rows[-1]]; ax = rot @ Vector((0, 0, 1))
            for j in range(segs):
                k = (j + 1) % segs; f = self.bm.faces.new((rows[-1][j], inner[j], inner[k], rows[-1][k])); f.material_index = mat; f.normal_update()
                if f.normal.dot(ax) > 0: f.normal_flip()

def build_eyes():
    P = Parts(); R = EYE_R
    for s, n in ((1, 'L'), (-1, 'R')):
        c = V3((EYE_C[0] * s, EYE_C[1], EYE_C[2])); front = Vector((0.10 * s, -1, 0.04)).normalized()   # 눈은 살짝 바깥·위를 본다
        shade = lambda d: C['white'] * mix(0.80, 1.0, sst(-0.75, 0.25, d.z))                            # 흰자 아래는 살짝 그늘
        P.band(c, R, front, 0, 112, None, 'eye_' + n, 0, rings=14, col_fn=shade)
        P.band(c, R * 1.012, front, 0, 34, None, 'pupil_' + n, 0, rings=8, col_fn=lambda d, f=front: mix(C['pupil'], C['iris'], sst(0.90, 0.83, d.dot(f))))
        hi = (front + Vector((0.20, 0, 0.30))).normalized(); P.band(c, R * 1.024, hi, 0, 8.5, C['white'], 'pupil_' + n, 0, rings=4, segs=16)
        lo = (front + Vector((-0.24, 0, -0.26))).normalized(); P.band(c, R * 1.024, lo, 0, 4.0, C['white'], 'pupil_' + n, 0, rings=3, segs=12)
        # 어지러움 소용돌이: 쉴 때는 흰자 속(반지름 0.47)에 숨어 있다가 swirl 뼈를 2.2배 하면 겉으로 나온다
        rot = front.to_track_quat('Z', 'Y').to_matrix(); prev = None
        for i in range(97):
            u = i / 96; f = u * math.tau * 2.3; a = math.radians(mix(4, 43, u)); hw = math.radians(mix(2.6, 3.6, u)); pair = []
            for da in (-hw, hw):
                d = rot @ Vector((math.sin(a + da) * math.cos(f), math.sin(a + da) * math.sin(f), math.cos(a + da))); pair.append(P.vert(c + d * R * 0.47, C['pupil'], 'swirl_' + n))
            if prev:
                fc = P.bm.faces.new((prev[0], prev[1], pair[1], pair[0])); fc.normal_update()
                if fc.normal.dot(fc.calc_center_median() - c) < 0: fc.normal_flip()
            prev = pair
        # 눈꺼풀: 반구 껍질. 위 눈꺼풀은 쉴 때 뒤로 58도(아래는 80도) 젖혀져 눈 위에 조금만 걸친다(앞으로 돌리면 감긴다)
        lid = base_green(c.z + 0.04) * 0.93
        up = Matrix.Rotation(math.radians(-58), 3, 'X') @ Vector((0, 0, 1)); dn = Matrix.Rotation(math.radians(80), 3, 'X') @ Vector((0, 0, -1))
        P.band(c, R * 1.065, up, 0, 90, None, 'lidU_' + n, 1, rings=14, rim_to=R * 1.03, col_fn=lambda d, a=up, k=lid: mix(C['lip'], k, sst(0.02, 0.13, d.dot(a))))   # 가장자리는 짙게 — 감으면 눈금이 보인다
        P.band(c, R * 1.06, dn, 0, 90, None, 'lidD_' + n, 1, rings=14, rim_to=R * 1.03, col_fn=lambda d, a=dn, k=base_green(c.z - 0.06) * 0.93: mix(C['lidRim'], k, sst(0.02, 0.13, d.dot(a))))
    return P

# ───────────────────────── 입 ─────────────────────────
NU = 28
EXPR = {   # hw 반 너비 · U/L 윗·아랫 금(가운데에서 잰 높이) · tongue (x, z, rx, rz) · fangs [(u, 길이, 반 너비) 왼쪽, 오른쪽]
    'Basis': dict(hw=0.072, U=lambda u: -0.020 * (1 - u * u) + 0.0052 * math.sqrt(1 - u * u), L=lambda u: -0.020 * (1 - u * u) - 0.0052 * math.sqrt(1 - u * u), tongue=None, fangs=[(0.42, 0.024, 0.013), None]),
    'smile': dict(hw=0.112, U=lambda u: 0.016 - 0.046 * (1 - u * u) + 0.006 * math.sqrt(1 - u * u), L=lambda u: 0.016 - 0.046 * (1 - u * u) - 0.006 * math.sqrt(1 - u * u), tongue=None, fangs=[(0.40, 0.024, 0.013), None]),
    'open': dict(hw=0.112, U=lambda u: 0.030 - 0.016 * (1 - u * u), L=lambda u: 0.030 - 0.128 * (1 - u * u) ** 0.62, tongue=(0, -0.078, 0.062, 0.036), fangs=[(0.46, 0.026, 0.014), (-0.46, 0.026, 0.014)]),
    'oh': dict(hw=0.047, U=lambda u: -0.012 + 0.056 * math.sqrt(1 - u * u), L=lambda u: -0.012 - 0.056 * math.sqrt(1 - u * u), tongue=(0, -0.052, 0.03, 0.02), fangs=[None, None]),
    'wavy': dict(hw=0.098, U=lambda u: -0.008 + 0.015 * math.sin(u * 6.6) + 0.0062 * math.sqrt(1 - u * u), L=lambda u: -0.008 + 0.015 * math.sin(u * 6.6) - 0.0062 * math.sqrt(1 - u * u), tongue=None, fangs=[None, None]),
    'worry': dict(hw=0.058, U=lambda u: -0.034 + 0.040 * (1 - u * u) ** 0.8, L=lambda u: -0.034 + 0.012 * (1 - u * u), tongue=None, fangs=[(0.38, 0.018, 0.011), (-0.38, 0.018, 0.011)]),
}
LIPW = 0.0075

def mouth_points(e, bvh):
    """표정 하나의 꼭짓점 자리들(차례가 언제나 같다) — 얼굴 면(x, z)에서 금을 긋고 몸 겉에 붙인다."""
    hw, U, L = e['hw'], e['U'], e['L']; us = [-math.cos(math.pi * i / NU) for i in range(NU + 1)]
    T = [Vector((u * hw, U(u))) for u in us]; B = [Vector((u * hw, L(u))) for u in us]; B[0] = T[0].copy(); B[-1] = T[-1].copy()
    loop = T + B[-2:0:-1]; N = len(loop); nrm = []
    for i in range(N):
        t = loop[(i + 1) % N] - loop[i - 1]; nrm.append(Vector((-t.y, t.x)).normalized() if t.length > 1e-9 else Vector((0, 1)))
    nT = nrm[:NU + 1]; nB = [nrm[0]] + [nrm[N - i] for i in range(1, NU)] + [nrm[NU]]

    def on(x, z, off):
        hit = bvh.ray_cast(Vector((x, -3, MOUTH_Z + z)), Vector((0, 1, 0)))
        return Vector((x, hit[0].y - off, MOUTH_Z + z)) if hit[0] is not None else Vector((x, -0.3, MOUTH_Z + z))
    pts = []
    for i in range(NU + 1):
        t, b = T[i], B[i]; to, bo = t + nT[i] * LIPW, b + nB[i] * LIPW
        col = [(to, 0.0052), (t, 0.0052), (t, 0.0034)] + [(t.lerp(b, k), 0.0034) for k in (0.25, 0.5, 0.75)] + [(b, 0.0034), (b, 0.0052), (bo, 0.0052)]
        pts += [on(p.x, p.y, off) for p, off in col]
    tg = e['tongue']                                     # 혀: 가운데 + 둘레 14. 없을 때는 입 가운데 살 속에 접어 둔다
    def inside(x, z):
        x = max(-hw * 0.86, min(hw * 0.86, x)); u = x / hw; return x, max(L(u) + 0.005, min(U(u) - 0.005, z))
    if tg:
        pts.append(on(*inside(tg[0], tg[1]), 0.0068))
        for j in range(14):
            a = j / 14 * math.tau; pts.append(on(*inside(tg[0] + math.cos(a) * tg[2], tg[1] + math.sin(a) * tg[3]), 0.0064))
    else:
        mid = on(0, (U(0) + L(0)) / 2, -0.012); pts += [mid] * 15
    for fg in e['fangs']:                                # 송곳니: 윗금에 매달린 둥근 세모(꼭짓점 다섯). 없을 때는 접어 둔다
        if fg:
            u0, h, w = fg; x0 = u0 * hw; zt = U(u0)
            for dx, dz in ((-w, 0.004), (w, 0.004), (w * 0.62, -h * 0.62), (0, -h), (-w * 0.62, -h * 0.62)): pts.append(on(x0 + dx, zt + dz, 0.0086))
        else:
            pts += [on(0, U(0), -0.012)] * 5
    return pts

def build_mouth(bvh):
    base = mouth_points(EXPR['Basis'], bvh); bm = bmesh.new(); vs = [bm.verts.new(p) for p in base]; cols = []
    rows = 9; cav = [C['cavTop'], mix(C['cavTop'], C['cavLow'], 0.35), mix(C['cavTop'], C['cavLow'], 0.7), C['cavLow'], C['cavLow']]
    for i in range(NU + 1): cols += [C['lip'], C['lip']] + cav + [C['lip'], C['lip']]
    for i in range(NU):
        for r in (0, 2, 3, 4, 5, 7):
            a, b = i * rows + r, (i + 1) * rows + r; bm.faces.new((vs[a], vs[a + 1], vs[b + 1], vs[b]))
    o = (NU + 1) * rows; cols += [C['tongue']] + [C['tongueRim']] * 14
    for j in range(14): bm.faces.new((vs[o], vs[o + 1 + j], vs[o + 1 + (j + 1) % 14]))
    o += 15
    for k in range(2):
        cols += [C['fang']] * 5; bm.faces.new([vs[o + k * 5 + j] for j in range(5)])
    for f in bm.faces:
        f.smooth = True; f.normal_update()
        if f.normal.y > 0: f.normal_flip()
    keys = {k: mouth_points(e, bvh) for k, e in EXPR.items() if k != 'Basis'}
    return bm, cols, keys

# ───────────────────────── 물체 · 뼈대 · 내보내기 ─────────────────────────
def material(name, rough):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes.get('Principled BSDF')
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = 0.0
    for key in ('Specular IOR Level', 'Specular'):
        if key in b.inputs: b.inputs[key].default_value = 0.5; break
    at = nt.nodes.new('ShaderNodeVertexColor'); at.layer_name = 'Col'; nt.links.new(at.outputs['Color'], b.inputs['Base Color'])
    return m

def make_object(name, bm, cols, weights, mats, rig):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    ca = me.color_attributes.new(name='Col', type='FLOAT_COLOR', domain='POINT')
    for i, c in enumerate(cols): ca.data[i].color = (c[0], c[1], c[2], 1.0)
    me.color_attributes.active_color = ca
    try: me.color_attributes.render_color_index = 0
    except Exception: pass
    for m in mats: me.materials.append(m)
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    groups = {}
    for i, w in enumerate(weights):
        tot = sum(w.values())
        for b, x in w.items():
            if x / tot < 0.004: continue
            if b not in groups: groups[b] = ob.vertex_groups.new(name=b)
            groups[b].add([i], x / tot, 'REPLACE')
    ob.parent = rig; md = ob.modifiers.new('Armature', 'ARMATURE'); md.object = rig
    return ob

def build():
    """빈 장면에 고고를 짓고 (뼈대 물체, [몸, 눈, 입]) 을 돌려준다."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    arm = bpy.data.armatures.new('GogoRig'); rig = bpy.data.objects.new('Gogo', arm); bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='EDIT')
    for name, head, tail, parent in BONES:
        eb = arm.edit_bones.new(name); eb.head = head; eb.tail = tail; eb.roll = 0.0
        if parent: eb.parent = arm.edit_bones[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    skin, eye = material('gogo_skin', 0.62), material('gogo_eye', 0.12)

    bm, cols, wts, bvh = build_body()
    nv, nf = len(bm.verts), sum(len(f.verts) - 2 for f in bm.faces)
    zs = [v.co.z for v in bm.verts]; xs = [v.co.x for v in bm.verts]; ys = [v.co.y for v in bm.verts]
    print('BODY verts', nv, 'tris', nf, 'x', round(min(xs), 3), round(max(xs), 3), 'y', round(min(ys), 3), round(max(ys), 3), 'z', round(min(zs), 3), round(max(zs), 3))
    mbm, mcols, keys = build_mouth(bvh)
    body = make_object('GogoBody', bm, cols, wts, [skin], rig)
    P = build_eyes(); eyes = make_object('GogoEyes', P.bm, P.cols, [{b: 1.0} for b in P.bones], [eye, skin], rig)
    mw = [torso_w(v.co.z) for v in mbm.verts]; mouth = make_object('GogoMouth', mbm, mcols, mw, [skin], rig)
    mouth.shape_key_add(name='Basis')
    for k, pts in keys.items():
        kb = mouth.shape_key_add(name=k)
        for i, p in enumerate(pts): kb.data[i].co = p
        kb.value = 0.0
    return rig, [body, eyes, mouth]

def export(path=OUT, animations=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    kw = dict(filepath=path, export_format='GLB', export_yup=True, export_apply=False, export_skins=True, export_morph=True, export_morph_normal=True,
              export_animations=animations, export_def_bones=False, export_all_influences=False)
    for extra in (dict(export_vertex_color='ACTIVE', export_all_vertex_colors=False), dict(export_colors=True), {}):
        try:
            bpy.ops.export_scene.gltf(**kw, **extra); break
        except TypeError as err:
            print('export option retry:', err)
    print('EXPORTED', path, os.path.getsize(path), 'bytes')

if __name__ == '__main__':
    build(); export()

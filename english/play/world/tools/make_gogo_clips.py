"""고고의 동작 클립 아홉을 만들어 모형과 함께 내보낸다(2단계).
실행(화면 없이):  blender -b --python english/play/lab/tools/make_gogo_clips.py
                  → english/play/lab/assets/gogo.glb (모형 + 클립) · assets/gogo_clips.json (클립 길이 · 한 바퀴에 가는 거리)

클립은 모두 제자리 동작이다 — 앞으로 가는 것은 코드가 맡고, 걸음 클립은 「한 바퀴에 가는 거리(stride)」를 알려 준다.
디딘 발이 몸에 대해 한결같은 빠르기로 뒤로 가게 만들었으므로, 코드가 (stride ÷ 길이 × 몸 크기)로 나아가면 발이 미끄러지지 않는다.
얼굴 · 더듬이 · 꼬리는 클립에 넣지 않는다(코드가 눈길 · 표정 · 출렁임으로 다룬다).
돌림은 고고 기준 축(x = 왼쪽, y = 위, z = 앞)의 도. x+ = 앞으로 숙임 · y+ = 왼쪽으로 돌아봄 · z+ = 오른쪽으로 기울임. 팔 · 다리는 x- 가 앞으로.
"""
import bpy, math, os, sys, json
from mathutils import Vector, Quaternion
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import make_gogo as G

FPS = 30
LEG = 0.185                              # 엉덩이 돌림 중심에서 발목까지(발은 늘 바닥과 나란하므로 발바닥은 발목 바로 아래에 있다)
ANIM = ['hips', 'belly', 'head'] + [b + s for s in ('_L', '_R') for b in ('arm', 'fore', 'hand', 'leg', 'foot')]
AX = {'x': Vector((1, 0, 0)), 'y': Vector((0, 0, 1)), 'z': Vector((0, -1, 0))}     # 고고 기준 축을 블렌더 좌표로
# 걸음 셋: 길이(초) · 다리 벌림(도) · 발 들기 · 좌우 쏠림 · 좌우 기울임(도) · 윗몸 비틀기(도) · 숙임(도) · 팔 흔들기(도) · 디딜 때 눌림 · 팔 벌림(도)
GAITS = {
    'walk':   dict(T=0.66, A=27, lift=0.050, sway=0.018, roll=2.5, twist=7, lean=3,  arm=26, squash=0.025, out=0),
    'heavy':  dict(T=1.16, A=30, lift=0.085, sway=0.050, roll=6.5, twist=11, lean=5, arm=34, squash=0.075, out=12),
    'scurry': dict(T=0.26, A=18, lift=0.030, sway=0.006, roll=1.5, twist=4, lean=13, arm=12, squash=0.012, out=30),
}

rad, sin, cos, pi = math.radians, math.sin, math.cos, math.pi
ease = lambda t: t * t * (3 - 2 * t)
def keys(t, ks):
    """(때, 값) 줄에서 t 때의 값 — 사이는 부드럽게."""
    if t <= ks[0][0]: return ks[0][1]
    for (t0, v0), (t1, v1) in zip(ks, ks[1:]):
        if t <= t1: return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0))
    return ks[-1][1]

class Pose(dict):
    def add(self, bone, r=(0, 0, 0), l=(0, 0, 0), s=(0, 0, 0)):
        d = self.setdefault(bone, {'r': [0, 0, 0], 'l': [0, 0, 0], 's': [1, 1, 1]})
        for i in range(3): d['r'][i] += r[i]; d['l'][i] += l[i]; d['s'][i] += s[i]
        return self
    def squash(self, q, bone='belly'):   # q > 0 납작 · q < 0 길쭉
        return self.add(bone, s=(q, -q, q))
    def arms(self, up=0, fwd=0, bend=0): # 두 팔을 같이: 올림 · 앞으로 · 굽힘
        return self.add('arm_L', (-fwd, 0, up)).add('arm_R', (-fwd, 0, -up)).add('fore_L', (-bend, 0, 0)).add('fore_R', (-bend, 0, 0))

def base():
    """팔을 편하게 내린 바탕 자세(쉬는 뼈대는 팔을 벌린 A 꼴)."""
    return Pose().add('arm_L', (0, 0, -24)).add('arm_R', (0, 0, 24)).add('fore_L', (-12, 0, -8)).add('fore_R', (-12, 0, 8)).add('hand_L', (0, 0, -6)).add('hand_R', (0, 0, 6))

# ───────────────────────── 클립 ─────────────────────────
def idle(t, T=2.4):                      # 서 있기: 숨 쉬기 · 살짝 무게 옮기기
    P = base(); b = sin(2 * pi * t / T); w = sin(2 * pi * t / T + 1.1)
    P.add('belly', s=(0.016 * b, 0.010 * b, 0.022 * b)).add('hips', (0, 0, 0.9 * w), (0.004 * w, 0.004 * b, 0)).add('head', (-1.4 * b, 0, -0.7 * w))
    return P.add('arm_L', (0, 0, 2.2 * b)).add('arm_R', (0, 0, -2.2 * b))

def look(t, T=3.6):                      # 두리번: 왼쪽 → 오른쪽 → 가운데
    P = idle(t % 2.4); y = keys(t, [(0, 0), (0.55, 40), (1.25, 36), (1.95, -42), (2.65, -37), (3.3, 0), (T, 0)]); k = abs(y) / 40
    P.add('head', (5 * k, y * 0.62, -y * 0.10)).add('belly', (2 * k, y * 0.26, 0)).add('hips', (0, y * 0.12, 0))
    return P.add('arm_L', (0, 0, 6 * k)).add('arm_R', (0, 0, -6 * k))

def surprise(t, T=0.9):                  # 놀람: 움찔 눌렸다가 펄쩍, 두 팔 번쩍
    P = base(); z = keys(t, [(0, 0), (0.10, -0.035), (0.24, 0.15), (0.40, 0), (0.48, -0.02), (0.62, 0), (T, 0)])
    q = keys(t, [(0, 0), (0.10, 0.13), (0.22, -0.13), (0.38, -0.03), (0.44, 0.10), (0.60, -0.02), (0.74, 0), (T, 0)])
    up = keys(t, [(0, 0), (0.08, -6), (0.24, 112), (0.46, 96), (0.66, 80), (T, 66)]); back = keys(t, [(0, 0), (0.24, -12), (0.5, -7), (T, -5)])
    sp = keys(t, [(0, 0), (0.24, 16), (0.42, 4), (T, 0)])
    P.add('hips', (back * 0.4, 0, 0), (0, z, 0)).squash(q).add('head', (back, 0, 0)).arms(up, -10 * up / 100, -14 * up / 100)
    return P.add('leg_L', (0, 0, sp)).add('leg_R', (0, 0, -sp))

def jump(t, T=0.84):                     # 기뻐서 뛰기: 웅크렸다가 폴짝(되풀이할 수 있다)
    P = base(); a0, a1, H = 0.22, 0.60, 0.27
    if t < a0: z = keys(t, [(0, 0), (0.14, -0.055), (a0, 0)])
    elif t < a1: u = (t - a0) / (a1 - a0); z = H * 4 * u * (1 - u)
    else: z = keys(t, [(a1, 0), (a1 + 0.07, -0.05), (a1 + 0.18, 0), (T, 0)])
    q = keys(t, [(0, 0), (0.15, 0.15), (0.26, -0.15), (0.41, -0.02), (0.56, -0.10), (0.66, 0.16), (0.76, -0.03), (T, 0)])
    up = keys(t, [(0, 0), (0.14, -10), (0.30, 120), (0.48, 138), (0.62, 90), (0.72, 20), (T, 0)]); tuck = keys(t, [(0, 0), (0.24, 0), (0.41, 1), (0.58, 0), (T, 0)])
    P.add('hips', (keys(t, [(0, 0), (0.15, 6), (0.3, -6), (0.6, 0), (T, 0)]), 0, 0), (0, z, 0)).squash(q).add('head', (-9 * tuck - 2 * sin(pi * t / T), 0, 0)).arms(up, 0, -10 * tuck)
    for s, n in ((1, 'L'), (-1, 'R')): P.add('leg_' + n, (14 * tuck, 0, s * 20 * tuck), (0, 0.035 * tuck, 0)).add('foot_' + n, (24 * tuck, 0, 0))
    return P

def gait(t, T, A, lift, sway, roll, twist, lean, arm, squash, out):
    P = base(); ph = (t / T) % 1.0; S = sin(rad(A)); w = sin(2 * pi * ph); c = cos(2 * pi * ph)      # w = +1 왼발로 설 때 한가운데
    rl = -roll * w                                                                                   # 디딘 발 쪽으로 몸이 기운다
    for sx, n, off in ((1, 'L', 0.0), (-1, 'R', 0.5)):
        u = (ph + off) % 1.0
        if u < 0.5: phi = math.degrees(math.asin(S * (1 - 4 * u))); up = 0.0; toe = 0.0               # 디딤: 앞 → 뒤로 한결같이
        else:
            v = (u - 0.5) * 2; phi = math.degrees(math.asin(S * -cos(pi * v))); up = lift * sin(pi * v) ** 1.3   # 내딛기: 뒤 → 앞, 발을 든다
            toe = 26 * sin(pi * v) * (1 - v) - 16 * sin(pi * v) * v                                              # 뗄 때 발끝이 처지고 디딜 때 들린다
        # 몸이 쏠리고 기울어도 발은 제자리에: 다리를 그만큼 되돌린다
        P.add('leg_' + n, (-phi, 0, -rl), (-sway * w, up - sx * 0.16 * sin(rad(rl)), 0)).add('foot_' + n, (phi + toe, 0, 0))
    st = (ph % 0.5) / 0.5; s = S * (1 - 2 * st); pend = LEG * (math.sqrt(1 - s * s) - 1)             # 디딘 다리를 타고 넘는다(가운데서 가장 높다)
    hit = (c * c) ** 3 * squash                                                                       # 발이 닿는 때 눌림
    P.add('hips', (lean, 0, rl), (sway * w, pend, 0)).add('belly', (lean * 0.4, twist * c, -rl * 0.35)).squash(hit)
    P.add('head', (-lean * 0.7 + 2.5 * (c * c - 0.5), -twist * 0.75 * c, -rl * 0.5))
    P.add('arm_L', (arm * c, 0, out)).add('arm_R', (-arm * c, 0, -out)).add('fore_L', (-max(0, -arm * c) * 0.5 - out * 0.4, 0, 0)).add('fore_R', (-max(0, arm * c) * 0.5 - out * 0.4, 0, 0))
    return P

def fall(t, T=2.5):                      # 넘어졌다 일어나기: 휘청 → 뒤로 벌렁 → 발 버둥 → 반동으로 굴러 일어남
    P = base(); th = keys(t, [(0, 0), (0.12, -7), (0.30, 26), (0.52, 101), (0.66, 84), (0.82, 93), (1.30, 90), (1.52, 108), (1.84, 32), (2.04, -10), (2.24, 2), (T, 0)])
    a, b = 0.47, 0.32; roll = math.sqrt((a * cos(rad(th))) ** 2 + (b * sin(rad(th))) ** 2); k = ease(min(1, max(0, (th - 12) / 33)))
    up = (0.60 + (roll - 0.60) * k) - 0.22 - 0.38 * cos(rad(th)); back = 0.17 * ease(min(1, max(0, th / 90)))
    q = keys(t, [(0, 0), (0.46, 0), (0.54, 0.15), (0.68, -0.05), (0.84, 0.03), (1.0, 0), (1.95, 0), (2.06, 0.10), (2.22, -0.03), (T, 0)])
    P.add('hips', (-th, 0, 0), (0, up, -back)).squash(q)
    P.add('head', (keys(t, [(0, 0), (0.30, 12), (0.52, -13), (0.82, 2), (1.30, 0), (1.52, 16), (2.04, 9), (T, 0)]), 0, 0))
    lg = keys(t, [(0, 0), (0.30, -22), (0.52, -58), (0.82, -28), (1.30, -26), (1.52, -72), (1.80, 12), (2.04, 0), (T, 0)])
    kick = keys(t, [(0, 0), (0.50, 0), (0.62, 26), (1.20, 12), (1.34, 0), (T, 0)]) * sin(2 * pi * 2.6 * t)
    for s, n in ((1, 'L'), (-1, 'R')): P.add('leg_' + n, (lg + s * kick, 0, s * 8 * k)).add('foot_' + n, (-lg * 0.35 - s * kick * 0.4, 0, 0))
    au = keys(t, [(0, 0), (0.12, 60), (0.30, 118), (0.52, 142), (0.82, 100), (1.30, 96), (1.52, 132), (1.84, 46), (2.04, 6), (T, 0)])
    wind = keys(t, [(0, 0), (0.10, 46), (0.40, 30), (0.52, 0), (T, 0)]) * sin(2 * pi * 4.2 * t)
    P.add('arm_L', (wind, 0, au)).add('arm_R', (-wind, 0, -au)).add('fore_L', (-au * 0.12, 0, 0)).add('fore_R', (-au * 0.12, 0, 0))
    return P

def peek(t, T=3.4):                      # 컵에서 내다보기: 쏙 숨었다가 테두리를 잡고 빼꼼, 두리번, 다시 쏙
    P = base(); d = keys(t, [(0, 1), (0.30, 1), (0.52, -0.12), (0.66, 0.04), (0.8, 0), (2.75, 0), (2.92, 1.06), (3.05, 1), (T, 1)]); dn = 0.15 * d
    y = keys(t, [(0, 0), (0.9, 0), (1.3, 32), (1.75, 30), (2.15, -34), (2.5, -30), (2.8, 0), (T, 0)])
    P.add('hips', (9 * d, 0, 0), (0, -dn, 0)).squash(0.07 * d).add('head', (-6 + 10 * d, y * 0.75, -y * 0.12)).add('belly', (0, y * 0.25, 0))
    P.arms(54 - 22 * d, 62 - 20 * d, 34 + 20 * d).add('hand_L', (-30, 0, 0)).add('hand_R', (-30, 0, 0))
    for n in ('L', 'R'): P.add('leg_' + n, (-9 * d, 0, 0), (0, dn, 0))    # 몸이 내려간 만큼 다리는 몸속으로 들어간다(발은 바닥에)
    return P

# ── 부탁 · 기쁨(연구소 설계 v1 — 어느 자리에서나 쓴다. 뒤에 덧붙이기만 한다: 앞의 아홉은 그대로)
def ask(t, T=1.2):                       # 조르기: 두 손을 가슴 앞에 모으고 아이 쪽을 올려다보며 까치발로 들썩인다
    P = base(); b = sin(2 * pi * t / T); c = sin(4 * pi * t / T)
    P.add('hips', (7 + 1.5 * b, 0, 0), (0, 0.012 + 0.012 * b, 0)).squash(-0.03 - 0.025 * b).add('head', (-15 - 2 * b, 0, 3 * c))
    P.arms(-4, 58 + 4 * b, 74).add('arm_L', (0, -30, 0)).add('arm_R', (0, 30, 0)).add('hand_L', (-18, 0, 0)).add('hand_R', (-18, 0, 0))
    for n in ('L', 'R'): P.add('foot_' + n, (10 + 8 * b, 0, 0))
    return P

def cheer(t, T=1.2):                     # 기뻐 뛰기: 두 팔을 번쩍 들고 두 번 폴짝
    P = base(); h = T / 2; u = (t % h) / h if t < T else 1.0; H = 0.24
    if u < 0.22: z = keys(u, [(0, 0), (0.13, -0.05), (0.22, 0)]); air = 0
    elif u < 0.78: v = (u - 0.22) / 0.56; z = H * 4 * v * (1 - v); air = sin(pi * v)
    else: z = keys(u, [(0.78, 0), (0.86, -0.045), (1, 0)]); air = 0
    q = keys(u, [(0, 0), (0.13, 0.14), (0.26, -0.14), (0.5, -0.04), (0.74, -0.08), (0.86, 0.14), (1, 0)])
    k = keys(t, [(0, 0), (0.16, 1), (T - 0.22, 1), (T, 0)]); wv = sin(2 * pi * 3 * t / T)
    P.add('hips', (-5 * k, 0, 4 * wv * k), (0, z, 0)).squash(q).add('head', (-12 * k, 0, -5 * wv * k))
    P.add('arm_L', (0, 0, (150 + 12 * wv) * k)).add('arm_R', (0, 0, -(150 - 12 * wv) * k)).add('fore_L', (-10 * k, 0, 0)).add('fore_R', (-10 * k, 0, 0))
    for sx, n in ((1, 'L'), (-1, 'R')): P.add('leg_' + n, (10 * air, 0, sx * 22 * air), (0, 0.03 * air, 0)).add('foot_' + n, (22 * air, 0, 0))
    return P

def shrug(t, T=0.9):                     # 으쓱: 두 팔을 옆으로 살짝 벌려 올리고 고개를 갸웃
    P = base(); k = keys(t, [(0, 0), (0.22, 1.08), (0.32, 1), (0.6, 1), (0.8, -0.04), (T, 0)])
    P.add('hips', (0, 0, 2 * k), (0, 0.012 * k, 0)).squash(-0.05 * k).add('head', (-4 * k, 6 * k, 15 * k))
    P.add('arm_L', (0, 0, 46 * k)).add('arm_R', (0, 0, -46 * k)).add('fore_L', (-30 * k, 0, 34 * k)).add('fore_R', (-30 * k, 0, -34 * k)).add('hand_L', (0, 0, 30 * k)).add('hand_R', (0, 0, -30 * k))
    return P

CLIPS = [  # 이름, 함수, 길이, 되풀이
    ('idle', idle, 2.4, True), ('look', look, 3.6, False), ('surprise', surprise, 0.9, False), ('jump', jump, 0.84, False),
    ('fall', fall, 2.5, False), ('peek', peek, 3.4, True),
] + [(n, (lambda t, g=g: gait(t, **g)), g['T'], True) for n, g in GAITS.items()] + [('ask', ask, 1.2, True), ('cheer', cheer, 1.2, False), ('shrug', shrug, 0.9, False)]

# ───────────────────────── 굽기 ─────────────────────────
def qchar(x, y, z):
    return Quaternion(AX['y'], rad(y)) @ Quaternion(AX['x'], rad(x)) @ Quaternion(AX['z'], rad(z))

def bake(rig):
    ad = rig.animation_data_create(); info = {}; rest = {b: rig.pose.bones[b].bone.matrix_local.to_quaternion() for b in ANIM}
    for b in ANIM: rig.pose.bones[b].rotation_mode = 'QUATERNION'
    for name, fn, T, loop in CLIPS:
        act = bpy.data.actions.new(name); ad.action = act; n = round(T * FPS); prev = {}
        for f in range(n + 1):
            P = fn((f % n) * T / n if loop else min(f / FPS, T))
            for b in ANIM:
                pb = rig.pose.bones[b]; d = P.get(b, {'r': (0, 0, 0), 'l': (0, 0, 0), 's': (1, 1, 1)}); R = rest[b]
                q = R.inverted() @ qchar(*d['r']) @ R
                if b in prev and prev[b].dot(q) < 0: q.negate()
                prev[b] = q.copy(); pb.rotation_quaternion = q; pb.scale = d['s']
                pb.location = R.inverted() @ (AX['x'] * d['l'][0] + AX['y'] * d['l'][1] + AX['z'] * d['l'][2])
                for path in ('rotation_quaternion', 'location', 'scale'): pb.keyframe_insert(path, frame=f)
        ad.action = None
        tr = ad.nla_tracks.new(); tr.name = name; st = tr.strips.new(name, 0, act)
        if hasattr(st, 'action_slot') and st.action_slot is None and len(act.slots): st.action_slot = act.slots[0]
        info[name] = {'dur': round(n / FPS, 4), 'loop': loop}
        if name in GAITS: info[name]['stride'] = round(4 * LEG * sin(rad(GAITS[name]['A'])), 4)
        print('CLIP', name, n, 'frames', info[name])
    for b in ANIM:
        pb = rig.pose.bones[b]; pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0); pb.scale = (1, 1, 1)
    return info

# ── 연구소 자리 ② ③ ④ 의 동작 스물하나(연구소 설계 v1 부록 C — 뒤에 덧붙이기만 한다: 앞의 열둘은 그대로)
# 고고는 팔이 짧다(어깨에서 손바닥 가운데까지 0.30). 손이 가야 할 자리를 몸 기준 자리(x 왼쪽 · y 위 · z 앞, 쉬는 자세의 치수)로 주면
# 어깨 · 팔꿈치 돌림을 풀어 준다(reach). 닿지 않는 자리는 닿는 데까지만 뻗는다.
_b = lambda v: Vector((v[0], -v[2], v[1]))                                # 고고 기준 자리 → 블렌더 좌표
_SH, _PA = Vector(G.ARM[0]), Vector(G.HAND[0]); _EL = (_SH + Vector(G.ARM[2])) / 2
BASE_ARM = {'arm_': (0, 0, -24), 'fore_': (-12, 0, -8)}                   # base() 의 왼팔 값

def _eul(q):
    """qchar 의 거꾸로: 돌림 → 고고 기준 축의 도 (x, y, z)."""
    e = q.to_euler('YXZ'); return (math.degrees(e.x), math.degrees(e.z), -math.degrees(e.y))

def _ik(tgt, pole):
    """왼팔: 손바닥 가운데가 tgt 에 가도록 (윗팔 돌림, 아랫팔 돌림). pole = 팔꿈치가 향할 쪽."""
    a, b = _EL - _SH, _PA - _EL; la, lb = a.length, b.length; d = _b(tgt) - _SH
    L = min(max(d.length, abs(la - lb) + 0.02), (la + lb) * 0.985); dn = d.normalized()
    x = (la * la - lb * lb + L * L) / (2 * L); h = math.sqrt(max(0.0, la * la - x * x))
    p = _b(pole); p = p - dn * p.dot(dn); p.normalize(); E = dn * x + p * h
    qa = a.rotation_difference(E); qw = (qa @ b).rotation_difference(dn * L - E)
    return qa, qa.inverted() @ qw @ qa

def reach(P, n, tgt, k=1.0, pole=(0.55, -0.8, -0.25)):
    """n('L'|'R') 손을 몸 기준 자리 tgt 로(k = 0 편히 내림 ~ 1 다 감). base() 위에 한 번만 얹는다."""
    s = 1 if n == 'L' else -1; qs = _ik((tgt[0] * s, tgt[1], tgt[2]), pole)
    for (bone, b0), q in zip(BASE_ARM.items(), qs):
        e = _eul(qchar(*b0).slerp(q, min(1.0, max(0.0, k))))
        P.add(bone + n, (e[0] - b0[0], s * (e[1] - b0[1]), s * (e[2] - b0[2])))
    return P

def lean(P, x, roll=0.0):
    """몸을 앞(+) · 뒤(-)로 숙이고 옆으로 기울여도 발은 바닥에 둔다."""
    P.add('hips', (x, 0, roll))
    for sx, n in ((1, 'L'), (-1, 'R')): P.add('leg_' + n, (-x, 0, -roll), (0, -sx * 0.16 * sin(rad(roll)), 0))
    return P

def sink(P, d):
    """몸을 d 만큼 낮춘다(다리는 몸속으로 들어가고 발은 바닥에)."""
    P.add('hips', l=(0, -d, 0))
    for n in ('L', 'R'): P.add('leg_' + n, l=(0, d, 0))
    return P

# 자리 ② 둥둥
def flail(t, T=0.8):                     # 허우적: 몸이 뒤로 젖혀진 채 팔다리를 번갈아 휘젓는다
    P = base(); a = 2 * pi * t / T; s, c = sin(a), cos(a)
    P.add('hips', (-15 + 3 * sin(2 * a), 0, 5 * s), (0, 0.01 * sin(2 * a), 0)).squash(0.03 * sin(2 * a + 1)).add('head', (-9 + 3 * c, 0, -4 * s)).add('belly', (0, 7 * c, 0))
    for sx, n, k, k2 in ((1, 'L', s, c), (-1, 'R', -s, -c)):
        P.add('arm_' + n, (34 * k2, 0, sx * (100 + 30 * k))).add('fore_' + n, (-18 - 10 * k, 0, 0))
        P.add('leg_' + n, (-12 - 26 * k, 0, sx * 10), (0, 0.012 * (1 + k), 0)).add('foot_' + n, (16 + 14 * k, 0, 0))
    return P

def swim(t, T=1.0):                      # 개구리헤엄: 두 손을 얼굴 앞에 모으고 다리를 오므렸다가 → 팔은 옆으로 크게 젓고 다리는 쭉 찬다 → 미끄러지듯 돌아옴
    P = base(); u = (t / T) % 1.0
    g = keys(u, [(0, 0), (0.30, 1), (0.42, 1), (0.60, 0), (1, 0)]); sw = keys(u, [(0, 0), (0.42, 0), (0.60, 1), (0.82, 0.3), (1, 0)]); kk = keys(u, [(0, 0), (0.42, 0), (0.56, 1), (0.80, 0.25), (1, 0)])
    P.add('hips', (14 - 8 * kk + 6 * g, 0, 0), (0, 0.03 * kk - 0.02 * g, 0)).squash(0.09 * g - 0.11 * kk).add('head', (-16 + 6 * g, 0, 0))
    A, B, C = (0.40, 0.38, -0.05), (0.16, 0.68, 0.30), (0.56, 0.56, 0.02)             # 손 자리: 미끄러질 때 · 모았을 때 · 옆으로 저을 때
    for sx, n in ((1, 'L'), (-1, 'R')):
        h = [A[i] + g * (B[i] - A[i]) + sw * (C[i] - A[i]) for i in range(3)]; reach(P, n, (sx * h[0], h[1], h[2]), pole=(0.6, -0.1, -0.8))
        P.add('leg_' + n, (-40 * g + 18 * kk, 0, sx * (34 * g + 14 * kk)), (0, 0.06 * g, 0)).add('foot_' + n, (20 * g + 34 * kk, 0, 0))
    return P

def hang(t, T=1.6):                      # 매달림: 두 손을 위로 뻗고 몸이 손 아래로 늘어져 앞뒤로 흔들린다(손이 축 — 뜬 높이는 코드가)
    P = base(); a = 2 * pi * t / T; th = 13 * sin(a); lag = 20 * sin(a - 0.9); R = 0.70
    P.add('hips', (th, 0, 0), (0, R * (1 - cos(rad(th))), -R * sin(rad(th)))).squash(-0.09 + 0.015 * cos(2 * a)).add('head', (-10 - 0.4 * lag, 0, 0))
    P.add('arm_L', (0, 0, 140)).add('arm_R', (0, 0, -140)).add('fore_L', (12, 0, 8)).add('fore_R', (12, 0, -8)).add('hand_L', (0, 0, 6)).add('hand_R', (0, 0, -6))
    for sx, n in ((1, 'L'), (-1, 'R')): P.add('leg_' + n, (0.9 * lag, 0, sx * 3)).add('foot_' + n, (24 + 0.5 * lag, 0, 0))
    return P

def splat(t, T=1.6):                     # 쿵: 세로 0.55배로 납작 → 잠깐 퍼져 있다가 → 출렁출렁 일어섬
    P = base(); q = keys(t, [(0, 0), (0.07, 0.45), (0.16, 0.40), (0.34, 0.43), (0.52, -0.13), (0.70, 0.09), (0.88, -0.05), (1.06, 0.025), (1.24, 0), (T, 0)])
    f = min(1.0, max(0.0, q / 0.45)); P.add('belly', s=(0.62 * q, -q, 0.62 * q)); sink(P, 0.085 * f)
    P.add('head', (-10 * f, 0, 0)).arms(52 * f, -8 * f, -8 * f)
    for sx, n in ((1, 'L'), (-1, 'R')): P.add('leg_' + n, (0, 0, sx * 20 * f)).add('hand_' + n, (0, 0, sx * 20 * f))
    return P

def reachJump(t, T=1.0):                 # 한 손(오른손)을 위로 쭉 뻗으며 뛰어오른다
    P = base(); a0, a1, H = 0.22, 0.66, 0.30
    if t < a0: z = keys(t, [(0, 0), (0.14, -0.06), (a0, 0)])
    elif t < a1: u = (t - a0) / (a1 - a0); z = H * 4 * u * (1 - u)
    else: z = keys(t, [(a1, 0), (a1 + 0.07, -0.05), (a1 + 0.18, 0), (T, 0)])
    q = keys(t, [(0, 0), (0.14, 0.16), (0.27, -0.17), (0.44, -0.12), (0.60, -0.06), (0.72, 0.15), (0.84, -0.03), (0.9, 0), (T, 0)])
    k = keys(t, [(0, 0), (0.12, -0.08), (0.30, 1), (0.52, 1), (0.72, 0.25), (0.86, 0), (T, 0)]); air = keys(t, [(0, 0), (a0, 0), (0.44, 1), (a1, 0), (T, 0)])
    P.add('hips', (keys(t, [(0, 0), (0.14, 7), (0.3, -5), (0.66, 0), (T, 0)]), 0, -13 * k), (0, z, 0)).squash(q).add('head', (-16 * k, 0, 8 * k))
    P.add('arm_R', (8 * k, 0, -128 * k)).add('fore_R', (12 * k, 0, -8 * k)).add('hand_R', (0, 0, -6 * k)).add('arm_L', (20 * k, 0, -10 * k))
    for sx, n in ((1, 'L'), (-1, 'R')): P.add('leg_' + n, (10 * air, 0, sx * 8 * air), (0, 0.02 * air, 0)).add('foot_' + n, (26 * air, 0, 0))
    return P

def blow(t, T=1.4):                      # 방울 고리(오른손)를 입에 대고 — 숨을 들이쉬어 부풀었다가 → 앞으로 숙이며 길게 분다
    P = base(); k = keys(t, [(0, 0), (0.24, 1), (1.06, 1), (1.26, 0), (T, 0)])
    inh = keys(t, [(0, 0), (0.20, 0), (0.46, 1), (0.60, 0.15), (0.8, 0), (T, 0)]); out = keys(t, [(0, 0), (0.48, 0), (0.62, 1), (1.0, 0.8), (1.2, 0), (T, 0)])
    lean(P, -7 * inh + 9 * out); P.add('belly', s=(0.05 * inh - 0.035 * out, 0.03 * inh - 0.01 * out, 0.07 * inh - 0.045 * out)).add('head', (-6 * inh + 5 * out, -8 * k, 0))
    reach(P, 'R', (-0.13, 0.62 + 0.02 * inh, 0.34), k)
    return P.add('arm_L', (10 * k, 0, 8 * inh))

def pat(t, T=1.0):                       # 오른손으로 앞의 것을 두 번 쓰다듬는다
    P = base(); k = keys(t, [(0, 0), (0.2, 1), (0.74, 1), (0.9, 0), (T, 0)]); b = keys(t, [(0, 0), (0.2, 0), (0.32, 1), (0.44, 0), (0.56, 1), (0.68, 0), (T, 0)])
    lean(P, 14 * k + 3 * b); P.add('head', (10 * k, -12 * k, 0)).add('belly', (0, 18 * k, 0))
    reach(P, 'R', (-0.24, 0.46 - 0.07 * b, 0.36), k)
    return P.add('arm_L', (8 * k, 0, 0))

# 자리 ③ 무지개 물약
def stir(t, T=1.2):                      # 두 손으로 국자를 잡고 크게 원을 그린다(팔이 짧아 몸이 통째로 국자를 따라 돈다)
    P = base(); a = 2 * pi * t / T; s, c = sin(a), cos(a); cx, cz = 0.05 * s, 0.035 * c
    lean(P, 10 + 5 * c, -7 * s); P.add('hips', l=(0.03 * s, 0, 0)).add('belly', (0, 18 * s, 0)).add('head', (7, -11 * s, 0)).squash(0.025 * c)
    for n in ('L', 'R'): P.add('leg_' + n, l=(-0.03 * s, 0, 0))
    reach(P, 'L', (cx + 0.17, 0.50, 0.33 + cz)); reach(P, 'R', (cx - 0.17, 0.47, 0.33 + cz))
    return P

def sip(t, T=1.1):                       # 국자(오른손)를 입에 대고 고개를 젖혀 후루룩
    P = base(); k = keys(t, [(0, 0), (0.26, 1), (0.80, 1), (0.97, 0), (T, 0)]); tip = keys(t, [(0, 0), (0.26, 0), (0.44, 1), (0.72, 1), (0.86, 0), (T, 0)])
    lean(P, -5 * tip); P.add('head', (-13 * tip, -10 * k, 0)).squash(-0.03 * tip)
    reach(P, 'R', (-0.12, 0.62 + 0.04 * tip, 0.35 - 0.02 * tip), k)
    return P.add('arm_L', (8 * k, 0, 0))

def hiccup(t, T=0.5):                    # 딸꾹: 온몸이 한 번 톡 튄다
    P = base(); z = keys(t, [(0, 0), (0.04, -0.01), (0.14, 0.075), (0.26, 0), (0.31, -0.012), (0.38, 0), (T, 0)])
    q = keys(t, [(0, 0), (0.04, 0.06), (0.12, -0.15), (0.24, -0.02), (0.30, 0.09), (0.38, 0), (T, 0)]); k = keys(t, [(0, 0), (0.10, 1), (0.2, 0.7), (0.36, 0), (T, 0)])
    P.add('hips', (-4 * k, 0, 0), (0, z, 0)).squash(q).add('head', (-10 * k, 0, 0)).arms(26 * k, 0, 10 * k)
    for n in ('L', 'R'): P.add('foot_' + n, (14 * k, 0, 0))
    return P

def shake(t, T=1.0):                     # 젖은 강아지처럼: 살짝 웅크렸다가 몸을 좌우로 빠르게 턴다(머리가 뒤늦게 따라온다)
    P = base(); e = keys(t, [(0, 0), (0.10, 0), (0.22, 1), (0.66, 1), (0.86, 0), (T, 0)]); pre = keys(t, [(0, 0), (0.10, 1), (0.24, 0), (T, 0)])
    w = 2 * pi * 5.5 * t; y = 32 * e * sin(w)
    sink(P, 0.02 * pre + 0.01 * e); P.add('hips', (4 * e, 0, 0)).add('belly', (0, y, -0.12 * y)).squash(0.06 * pre - 0.03 * e)
    P.add('head', (3 * e, -0.5 * y + 16 * e * sin(w - 1.2), 8 * e * sin(w - 0.6))).arms(44 * e + 8 * e * cos(2 * w), 0, -6 * e)
    return P

def hopFeet(t, T=0.6):                   # 동동: 발을 번갈아 들며 제자리에서 구른다
    P = base(); u = (t / T) % 1.0; w = sin(2 * pi * u); c = cos(2 * pi * u)
    lL = sin(2 * pi * u) ** 1.2 if u < 0.5 else 0.0; lR = sin(2 * pi * (u - 0.5)) ** 1.2 if u >= 0.5 else 0.0; rl = 5 * (lL - lR)
    P.add('hips', (3, 0, rl), (-0.012 * (lL - lR), 0.03 * abs(w), 0)).squash((c * c) ** 3 * 0.07).add('head', (-3, 0, -0.5 * rl)).arms(40, 6, 34)
    P.add('arm_L', (8 * w, 0, 0)).add('arm_R', (-8 * w, 0, 0))
    for sx, n, l in ((1, 'L', lL), (-1, 'R', lR)): P.add('leg_' + n, (-38 * l, 0, -rl), (0, 0.10 * l - sx * 0.16 * sin(rad(rl)), 0)).add('foot_' + n, (18 * l, 0, 0))
    return P

def noseHold(t, T=1.0):                  # 코를 쥠: 팔이 짧아서 고개를 숙여 오른쪽으로 돌려 손(오른손) 쪽으로 가져간다
    P = base(); k = keys(t, [(0, 0), (0.22, 1), (0.74, 1), (0.9, 0), (T, 0)]); wig = sin(2 * pi * 2.5 * t) * keys(t, [(0, 0), (0.3, 0), (0.4, 1), (0.66, 1), (0.76, 0), (T, 0)])
    lean(P, -4 * k); P.add('belly', (0, 8 * k, 0)).add('head', (9 * k, -36 * k + 4 * wig, 5 * k)).squash(0.03 * k)
    reach(P, 'R', (-0.236, 0.63, 0.337), k)
    return P.add('arm_L', (12 * k, 0, 10 * k))

# 자리 ④ 얼음과 불
def shiver(t, T=0.4):                    # 오들오들: 어깨를 움츠려 두 손을 가슴께에 붙이고 잘게 떤다
    P = base(); a = 2 * pi * t / T; j = sin(3 * a); j2 = sin(2 * a + 0.7)
    lean(P, 6); sink(P, 0.012); P.add('belly', (0, 2.2 * j, 1.2 * j2)).squash(0.035 + 0.012 * j2).add('head', (7 + 1.5 * j2, -2.6 * j, 1.5 * j))
    reach(P, 'L', (0.17 + 0.004 * j, 0.52, 0.28)); reach(P, 'R', (-0.17 + 0.004 * j, 0.50, 0.28))
    for sx, n in ((1, 'L'), (-1, 'R')): P.add('leg_' + n, (0, 0, -sx * 4 + 1.2 * j))
    return P

def slip(t, T=1.4):                      # 미끄덩: 발이 앞으로 빠지며 엉덩방아 → 앉은 채 잠깐(눈 끔벅은 코드가) → 앞으로 굴러 일어남
    P = base(); th = keys(t, [(0, 0), (0.10, -8), (0.30, -34), (0.42, -20), (0.56, -24), (0.86, -22), (1.02, 10), (1.16, 6), (1.28, 0), (T, 0)])
    lg = keys(t, [(0, 0), (0.10, -30), (0.30, -88), (0.86, -84), (1.02, -20), (1.14, 0), (T, 0)]); f = min(1.0, -lg / 80)
    dn = keys(t, [(0, 0), (0.10, 0.01), (0.30, 0.125), (0.36, 0.14), (0.44, 0.118), (0.86, 0.12), (1.02, 0.015), (1.14, 0), (T, 0)])
    back = keys(t, [(0, 0), (0.30, -0.07), (0.86, -0.07), (1.06, 0), (T, 0)])
    q = keys(t, [(0, 0), (0.28, -0.04), (0.36, 0.17), (0.50, -0.06), (0.64, 0.03), (0.78, 0), (1.0, 0), (1.10, 0.07), (1.22, -0.02), (1.3, 0), (T, 0)])
    P.add('hips', (th, 0, 0), (0, -dn, back)).squash(q).add('head', (keys(t, [(0, 0), (0.12, 10), (0.30, -12), (0.44, 8), (0.6, 0), (T, 0)]), 0, 0))
    for sx, n in ((1, 'L'), (-1, 'R')): P.add('leg_' + n, (lg - th, 0, sx * 9 * f)).add('foot_' + n, (18 * f, 0, 0))
    au = keys(t, [(0, 0), (0.10, 70), (0.28, 125), (0.42, 60), (0.86, 44), (1.02, 30), (1.2, 0), (T, 0)]); wind = keys(t, [(0, 0), (0.08, 40), (0.28, 30), (0.4, 0), (T, 0)]) * sin(2 * pi * 4.5 * t)
    return P.add('arm_L', (wind, 0, au)).add('arm_R', (-wind, 0, -au))

def skate(t, T=1.2):                     # 지치기: 양팔을 벌리고, 한 발로 서서 다른 발로 뒤 · 옆으로 민다(번갈아)
    P = base(); u = (t / T) % 1.0; w = sin(2 * pi * u); c = cos(2 * pi * u); pR = max(0.0, w) ** 1.4; pL = max(0.0, -w) ** 1.4; rl = -7 * w
    P.add('hips', (12 - 3 * abs(w), 0, rl), (0.05 * w, -0.015 + 0.012 * abs(w), 0)).add('belly', (3, -9 * w, -rl * 0.4)).add('head', (-9, 6 * w, -rl * 0.5)).squash(0.02 * c * c)
    P.add('arm_L', (14 * w, 0, 62 + 8 * w)).add('arm_R', (14 * w, 0, -62 + 8 * w)).add('fore_L', (4, 0, 10)).add('fore_R', (4, 0, -10))
    for sx, n, p in ((1, 'L', pL), (-1, 'R', pR)):
        P.add('leg_' + n, (-12 + 3 * abs(w) + 30 * p, 0, -rl + sx * 22 * p), (-0.05 * w, 0.015 - 0.012 * abs(w) + 0.035 * p - sx * 0.16 * sin(rad(rl)), 0)).add('foot_' + n, (22 * p, 0, 0))
    return P

def fan(t, T=0.6):                       # 부채질: 오른손을 얼굴 옆에 들고 팔랑팔랑(한 바퀴에 두 번)
    P = base(); a = 2 * pi * t / T; f = sin(2 * a)
    P.add('hips', (-3, 0, 2)).add('head', (-7 + 1.2 * f, -10, 4)).squash(-0.01 * cos(a))
    reach(P, 'R', (-0.28 + 0.04 * f, 0.66 + 0.012 * f, 0.29))
    return P.add('hand_R', (45 * f, 0, 0)).add('arm_L', (4, 0, 3 * sin(a)))

def warm(t, T=1.5):                      # 쬐기: 두 손을 앞으로 내밀고 살짝 웅크려 손을 번갈아 까딱인다
    P = base(); a = 2 * pi * t / T; b = sin(a); r = sin(2 * a)
    lean(P, 7 + 1.5 * b); sink(P, 0.012 + 0.006 * b); P.add('head', (4 - 2 * b, 0, 2 * r)).squash(0.02 + 0.012 * b)
    reach(P, 'L', (0.25, 0.56 + 0.012 * r, 0.31)); reach(P, 'R', (-0.25, 0.56 - 0.012 * r, 0.31))
    return P.add('hand_L', (-38, 0, 0)).add('hand_R', (-38, 0, 0))

def catchMouth(t, T=0.7):                # 받아먹기: 고개를 젖히고 까치발로(입은 코드가 벌린다)
    P = base(); k = keys(t, [(0, 0), (0.16, 1.06), (0.24, 1), (0.42, 1), (0.56, -0.04), (0.62, 0), (T, 0)])
    lean(P, -9 * k); P.add('hips', l=(0, 0.012 * k, 0)).squash(-0.07 * k).add('head', (-27 * k, 0, 0)).arms(22 * k, -24 * k, 6 * k)
    for n in ('L', 'R'): P.add('foot_' + n, (8 * k, 0, 0))
    return P

def rollSnow(t, T=1.6):                  # 눈 굴리기: 몸을 숙여 두 손으로 번갈아 밀며 제자리걸음(한 바퀴에 네 걸음)
    P = base(); a = 2 * pi * t / T; st = 2 * a; w = sin(st); lL = max(0.0, w) ** 1.3; lR = max(0.0, -w) ** 1.3
    lean(P, 30 + 3 * sin(2 * st), -2.5 * w); sink(P, 0.03); P.add('head', (-24, 0, 0)).add('belly', (4, 5 * w, 0)).squash(0.03 + 0.015 * cos(2 * st))
    reach(P, 'L', (0.22, 0.42 + 0.035 * sin(st), 0.31 + 0.02 * cos(st))); reach(P, 'R', (-0.22, 0.42 - 0.035 * sin(st), 0.31 - 0.02 * cos(st)))
    for n, l in (('L', lL), ('R', lR)): P.add('leg_' + n, (-22 * l, 0, 0), (0, 0.05 * l, 0)).add('foot_' + n, (16 * l, 0, 0))
    return P

def sneeze(t, T=0.9):                    # 에취: 숨을 들이쉬며 고개를 젖혔다가 → 앞으로 확 숙이며 톡 튄다
    P = base(); inh = keys(t, [(0, 0), (0.34, 1), (0.42, 1), (0.48, 0), (T, 0)]); out = keys(t, [(0, 0), (0.42, 0), (0.50, 1), (0.58, 0.8), (0.76, 0), (T, 0)])
    z = keys(t, [(0, 0), (0.44, 0), (0.51, 0.035), (0.58, 0), (T, 0)])
    lean(P, -9 * inh + 20 * out); P.add('hips', l=(0, z, 0)).squash(-0.08 * inh + 0.10 * out).add('head', (-20 * inh + 22 * out, 0, 0))
    return P.arms(28 * inh + 30 * out, 22 * inh - 34 * out, 34 * inh)

CLIPS += [
    ('flail', flail, 0.8, True), ('swim', swim, 1.0, True), ('hang', hang, 1.6, True), ('splat', splat, 1.6, False), ('reachJump', reachJump, 1.0, False), ('blow', blow, 1.4, False), ('pat', pat, 1.0, False),
    ('stir', stir, 1.2, True), ('sip', sip, 1.1, False), ('hiccup', hiccup, 0.5, False), ('shake', shake, 1.0, False), ('hopFeet', hopFeet, 0.6, True), ('noseHold', noseHold, 1.0, False),
    ('shiver', shiver, 0.4, True), ('slip', slip, 1.4, False), ('skate', skate, 1.2, True), ('fan', fan, 0.6, True), ('warm', warm, 1.5, True), ('catchMouth', catchMouth, 0.7, False), ('rollSnow', rollSnow, 1.6, True), ('sneeze', sneeze, 0.9, False),
]

# ── 자리 ③ 이 큰 수조로 바뀌며 더한 동작 하나(뒤에 덧붙이기만 한다: 앞의 서른셋은 그대로)
def dive(t, T=1.2):                      # 퐁당: 웅크렸다가 두 팔을 머리 위로 모아 뛰어올라 → 몸 가운데를 축으로 앞으로 돌아 머리부터 내려간다(0.85~0.98초는 거의 거꾸로) → 한 바퀴를 마저 돌아 선다
    P = base(); th = keys(t, [(0, 0), (0.16, -7), (0.34, 18), (0.62, 118), (0.85, 168), (0.98, 174), (1.08, 360), (T, 360)]); c = 0.38
    z = keys(t, [(0, 0), (0.14, -0.06), (0.22, 0), (0.55, 0.32), (0.90, 0.12), (1.08, 0), (T, 0)])
    q = keys(t, [(0, 0), (0.14, 0.15), (0.28, -0.15), (0.62, -0.10), (0.98, -0.12), (1.08, 0), (T, 0)]); k = keys(t, [(0, 0), (0.14, -0.10), (0.34, 1), (0.98, 1), (1.08, 0), (T, 0)])
    P.add('hips', (th, 0, 0), (0, z + c * (1 - cos(rad(th))), -c * sin(rad(th)))).squash(q).add('head', (-12 * k, 0, 0))
    P.add('arm_L', (6 * k, 0, 152 * k)).add('arm_R', (6 * k, 0, -152 * k)).add('fore_L', (12 * k, 0, 8 * k)).add('fore_R', (12 * k, 0, -8 * k)).add('hand_L', (0, 0, 6 * k)).add('hand_R', (0, 0, -6 * k))
    for sx, n in ((1, 'L'), (-1, 'R')): P.add('leg_' + n, (6 * k, 0, -sx * 3 * k)).add('foot_' + n, (34 * k, 0, 0))
    return P

CLIPS += [('dive', dive, 1.2, False)]

if __name__ == '__main__':
    rig, _ = G.build(); bpy.context.scene.render.fps = FPS; info = bake(rig)
    bpy.context.scene.frame_start = 0; bpy.context.scene.frame_end = 120
    G.export(animations=True, export_animation_mode='NLA_TRACKS', export_force_sampling=True, export_optimize_animation_size=True,
             export_anim_slide_to_zero=True, export_rest_position_armature=True, export_frame_range=False)
    with open(os.path.join(os.path.dirname(G.OUT), 'gogo_clips.json'), 'w', encoding='utf-8') as fp: json.dump(info, fp, indent=1)

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

CLIPS = [  # 이름, 함수, 길이, 되풀이
    ('idle', idle, 2.4, True), ('look', look, 3.6, False), ('surprise', surprise, 0.9, False), ('jump', jump, 0.84, False),
    ('fall', fall, 2.5, False), ('peek', peek, 3.4, True),
] + [(n, (lambda t, g=g: gait(t, **g)), g['T'], True) for n, g in GAITS.items()]

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

if __name__ == '__main__':
    rig, _ = G.build(); bpy.context.scene.render.fps = FPS; info = bake(rig)
    bpy.context.scene.frame_start = 0; bpy.context.scene.frame_end = 120
    G.export(animations=True, export_animation_mode='NLA_TRACKS', export_force_sampling=True, export_optimize_animation_size=True,
             export_anim_slide_to_zero=True, export_rest_position_armature=True, export_frame_range=False)
    with open(os.path.join(os.path.dirname(G.OUT), 'gogo_clips.json'), 'w', encoding='utf-8') as fp: json.dump(info, fp, indent=1)

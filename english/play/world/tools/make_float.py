"""마법 연구소 ③ 「둥둥 떠다니는 물건」에 더하는 것들을 블렌더로 빚는다. 받아 온 모형 없음.
실행(화면 없이):  blender -b --python english/play/world/tools/make_float.py   → world/assets/float.glb
물체(이름이 약속이다 — 전부 원점에, 놀이가 자리를 정한다):
  machine 중력 장치의 몸(바닥 가운데가 원점 · 키 1.2 · 앞(-y)에 손잡이가 오르내리는 홈과 ▲ ▼)
  knob    손잡이(공 가운데가 원점 · 자루는 뒤로) — 홈을 따라 높이 KNOB_Z0 ~ KNOB_Z1 을 오르내린다
  orb · ring  장치 꼭대기의 빛 구슬과 그 둘레를 도는 고리(가운데가 원점)
  car     장난감 자동차의 몸(바닥 가운데가 원점 · 앞은 -x · 길이 0.92 · 키 0.5) / wheel 바퀴(가운데가 원점 · 굴대는 y)
  apple_bite  한 입 베어 문 사과(make_lab 의 사과와 같은 치수 · 앞 오른쪽이 파였다)
  star    어지러울 때 머리 위를 도는 작은 별(가운데가 원점)
방 · 실험대 · 사과 · 의자 · 공은 lab.glb(make_lab.py)의 것을 그대로 쓴다. 색도 그 PAL 을 쓴다.
"""
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import make_lab as M
from make_lab import Mk, PAL, rgb, mix, RX, RZ

OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'float.glb'))
P = {k: rgb(v) for k, v in dict(body='#9b8ad4', body2='#7f6cc0', tire='#4a3560', flesh='#fbf3df', flesh2='#f3dfae', car='#ffc04d', car2='#f29a52').items()}
KNOB_Y = -0.6            # 손잡이 공이 놓이는 앞뒤 자리(놀이 코드 float.js 의 T.MACHINE 과 맞춘다 — 높이는 0.3 ~ 0.74)
WHEEL = dict(r=0.13, x=0.27, y=0.215)   # 바퀴 반지름 · 앞뒤 · 좌우 자리(float.js 의 T.WHEEL 과 맞춘다)

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True); matte, gloss = M.material('float_matte', 0.78), M.material('float_gloss', 0.28)

    # ── 중력 장치: 통통한 종 모양 몸 + 금테 + 앞판(홈 · ▲ ▼) + 꼭대기 목
    m = Mk(); body = lambda p: PAL['gold'] if 0.1 < p.z < 0.17 else mix(P['body2'], P['body'], min(1.0, max(0.0, p.z / 0.9)))
    m.lathe([(0, 0), (0.5, 0), (0.54, 0.04), (0.54, 0.1), (0.515, 0.13), (0.515, 0.17), (0.53, 0.42), (0.49, 0.7), (0.39, 0.92), (0.24, 1.05), (0.12, 1.1), (0.075, 1.12), (0.06, 1.2), (0.085, 1.22), (0.085, 1.25), (0, 1.25)], body, segs=44)
    m.box((0.36, 0.14, 0.86), (0, -0.47, 0.52), PAL['cream'], 0.06)                                   # 앞판
    m.box((0.085, 0.03, 0.56), (0, -0.535, 0.52), PAL['dark'], 0.012)                                  # 손잡이 홈
    m.lathe([(0, 0), (0.062, 0), (0.05, 0.02), (0, 0.022)], PAL['sun'], (0, -0.54, 0.875), 3, RX(90) @ RZ(90))      # ▲
    m.lathe([(0, 0), (0.062, 0), (0.05, 0.02), (0, 0.022)], PAL['sky'], (0, -0.54, 0.165), 3, RX(90) @ RZ(-90))     # ▼
    for sx in (-1, 1):                                                                                # 양옆의 둥근 창(안이 하늘빛) · 작은 발
        m.torus(0.105, 0.03, (sx * 0.36, -0.36, 0.62), PAL['gold'], rot=RZ(sx * 45)); m.ball(0.095, (sx * 0.345, -0.345, 0.62), PAL['sky'], (1, 1, 1), 16)
    for a in (35, 145, 215, 325): m.ball(0.075, (math.cos(math.radians(a)) * 0.43, math.sin(math.radians(a)) * 0.43, 0.035), PAL['dark'], (1, 1, 0.6), 12)
    m.done('machine', gloss, ground=0, ao=0.5, shade=0.1)
    m = Mk(); m.ball(0.115, (0, 0, 0), lambda p: mix(PAL['coral'], PAL['red2'], max(0.0, p.z / 0.115) * 0.5), segs=24); m.lathe([(0, 0), (0.035, 0), (0.035, 0.1), (0, 0.1)], PAL['dark'], (0, 0, 0), 12, RX(-90))
    m.done('knob', gloss, ao=0.15, shade=0.05)
    m = Mk(); m.ball(0.14, (0, 0, 0), lambda p: mix(PAL['sun'], PAL['star'], 0.5 + 0.5 * p.z / 0.14), segs=24); m.done('orb', gloss, ao=0.0, shade=0.0)
    m = Mk(); m.torus(0.25, 0.024, (0, 0, 0), PAL['gold'], rot=RX(90)); m.ball(0.045, (0.25, 0, 0), PAL['star'], segs=12); m.done('ring', gloss, ao=0.0, shade=0.0)

    # ── 장난감 자동차(앞은 -x): 둥근 몸 + 지붕 + 창 + 전조등 눈 + 범퍼. 바퀴는 따로(굴러야 하므로)
    m = Mk(); W = WHEEL
    m.box((0.92, 0.44, 0.2), (0, 0, 0.2), lambda p: mix(P['car2'], P['car'], min(1.0, max(0.0, (p.z - 0.1) / 0.16))), 0.085)
    m.box((0.5, 0.4, 0.22), (0.07, 0, 0.385), P['car'], 0.095)
    m.box((0.33, 0.415, 0.105), (0.07, 0, 0.405), PAL['sky'], 0.04); m.box((0.06, 0.3, 0.105), (-0.165, 0, 0.405), PAL['sky'], 0.025); m.box((0.06, 0.3, 0.1), (0.305, 0, 0.405), PAL['sky'], 0.025)
    m.box((0.05, 0.4, 0.07), (-0.455, 0, 0.14), PAL['cream'], 0.025); m.box((0.05, 0.4, 0.07), (0.455, 0, 0.14), PAL['cream'], 0.025)                 # 범퍼
    for sy in (-1, 1):
        m.ball(0.052, (-0.45, sy * 0.125, 0.235), PAL['white'], (0.6, 1, 1), 14); m.ball(0.03, (0.455, sy * 0.14, 0.23), PAL['coral'], (0.6, 1, 1), 10)   # 전조등 · 꼬리등
        for sx in (-1, 1): m.torus(W['r'] + 0.025, 0.028, (sx * W['x'], sy * 0.205, W['r'] + 0.01), P['car2'], arc=math.pi, rot=RX(0), segs=14, tube=8)   # 바퀴 덮개
    m.box((0.3, 0.05, 0.03), (0.07, 0, 0.5), PAL['coral'], 0.012)                                                                                       # 지붕 줄무늬
    m.done('car', gloss, ground=0, ao=0.45, shade=0.12)
    m = Mk(); r = W['r']; tire = lambda p: P['tire'] if math.hypot(p.x, p.z) > r * 0.6 else PAL['cream']
    m.lathe([(0, -0.045), (r * 0.55, -0.047), (r * 0.62, -0.04), (r * 0.9, -0.045), (r, -0.025), (r, 0.025), (r * 0.9, 0.045), (r * 0.62, 0.04), (r * 0.55, 0.047), (0, 0.045)], tire, segs=24, rot=RX(90))
    for i in range(3):                                                                                 # 굴러가는 것이 보이게 바퀴살 점 셋(양쪽 면)
        a = i / 3 * math.tau
        for sy in (-1, 1): m.ball(0.022, (math.cos(a) * r * 0.33, sy * 0.046, math.sin(a) * r * 0.33), PAL['coral'], (1, 0.5, 1), 8)
    m.done('wheel', matte, ao=0.2, shade=0.0)

    # ── 한 입 베어 문 사과: make_lab 의 사과 금을 촘촘히 돌리고, 앞 오른쪽을 공 모양으로 파낸다(파인 곳은 속살 빛)
    m = Mk(); skin = lambda p: mix(mix(PAL['red'], PAL['red2'], max(0.0, min(1.0, (p.z - 0.3) / 0.5 + 0.25 * math.sin(math.atan2(p.y, p.x) * 3)))), PAL['red'], 0.35)
    prof = [(0, 0.035), (0.1, 0.008), (0.2, 0.03), (0.285, 0.13), (0.325, 0.28), (0.31, 0.42), (0.24, 0.535), (0.15, 0.578), (0.07, 0.56), (0.03, 0.52), (0, 0.51)]; fine = [prof[0]]
    for a, b in zip(prof, prof[1:]): fine += [(a[0] + (b[0] - a[0]) * k / 4, a[1] + (b[1] - a[1]) * k / 4) for k in range(1, 5)]
    vs = m.lathe(fine, skin, segs=72); c = Vector((0.2, -0.22, 0.33)); R = 0.165; core = Vector((0, 0, 0.3))
    for v in vs:
        d = v.co - c
        if d.length >= R: continue
        o = (core - c).normalized(); b = d.dot(o); t = -b + math.sqrt(max(0.0, b * b - (d.length_squared - R * R)))   # 안쪽으로 밀어 공 겉에 닿는 자리
        depth = t / R; v.co = v.co + o * t; m.col[v] = mix(P['flesh2'], P['flesh'], min(1.0, depth * 1.6))
    m.lathe([(0, 0), (0.022, 0), (0.018, 0.16), (0.026, 0.17), (0, 0.172)], PAL['stem'], (0, 0, 0.5), 10, M.RY(12)); m.ball(0.1, (0.1, 0, 0.66), PAL['leaf'], (1.25, 0.5, 0.22))
    m.done('apple_bite', gloss, ground=0)

    # ── 작은 별(어지러울 때)
    m = Mk(); pts = [Vector((math.sin(i * math.pi / 5) * (0.1 if i % 2 == 0 else 0.048), 0, math.cos(i * math.pi / 5) * (0.1 if i % 2 == 0 else 0.048))) for i in range(10)]
    f = [m.bm.verts.new(p + Vector((0, -0.02, 0))) for p in pts]; b = [m.bm.verts.new(p + Vector((0, 0.02, 0))) for p in pts]; cf = m.bm.verts.new((0, -0.045, 0)); cb = m.bm.verts.new((0, 0.045, 0))
    for i in range(10):
        k = (i + 1) % 10; m.bm.faces.new((cf, f[i], f[k])); m.bm.faces.new((cb, b[k], b[i])); m.bm.faces.new((f[i], b[i], b[k], f[k]))
    m._paint(f + b, PAL['gold']); m._paint([cf, cb], PAL['star']); m.done('star', gloss, ao=0.0, shade=0.0)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    build()

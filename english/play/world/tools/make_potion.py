"""마법 연구소 「무지개 마법 물약」의 물건 — 가마솥 · 물약 병 셋(유리 · 속 물약 · 목 띠) · 국자 · 물 양동이를 블렌더로 빚는다. 받아 온 모형 없음.
실행(화면 없이):  blender -b --python english/play/world/tools/make_potion.py   → english/play/world/assets/potion.glb
빚는 도구(Mk · PAL · material)는 make_lab.py 의 것을 그대로 쓴다(같은 색감 · 같은 틈새 그늘).
물체 이름이 약속이다(모두 원점에 — 놀이가 자리를 정한다):
  cauldron(바닥 가운데가 원점 · 키 0.69 · 입 안쪽 반지름 0.5)
  glass_red · glass_blue · glass_yellow(병 유리 — 놀이가 투명 재질을 입힌다) / liq_*(속 물약 — 놀이가 색을 입히고 수면에서 자른다) / cap_*(목 띠 — 병 색)
  ladle(국자 — 바가지 가운데가 원점 · 자루는 위로) / bucket(물 양동이 — 바닥 가운데가 원점 · 키 0.36)
좌표: 블렌더 z 위 · 앞 -y → 내보내면 y 위 · 앞 +z. 실험대 윗면이 높이 0.
"""
import bpy, math, os, sys
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_lab as L
from make_lab import Mk, PAL, mix, rgb, RX, RY, RZ

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'potion.glb'))
INK = dict(red=rgb('#e9483c'), blue=rgb('#4a86e0'), yellow=rgb('#ffd23c'))          # 목 띠의 색(물약 색은 놀이 코드가 정한다)
# 병의 옆모습(반지름, 높이) — 셋이 다르게: 둥근 플라스크 · 세모 플라스크 · 조롱박
SHAPE = dict(
    red=[(0, 0), (0.1, 0), (0.18, 0.05), (0.215, 0.16), (0.19, 0.29), (0.11, 0.38), (0.07, 0.44), (0.065, 0.56), (0.09, 0.6)],
    blue=[(0, 0), (0.19, 0), (0.225, 0.04), (0.215, 0.1), (0.085, 0.46), (0.07, 0.5), (0.07, 0.62), (0.1, 0.66)],
    yellow=[(0, 0), (0.1, 0), (0.17, 0.05), (0.19, 0.14), (0.15, 0.25), (0.1, 0.3), (0.135, 0.37), (0.14, 0.43), (0.09, 0.5), (0.075, 0.53), (0.075, 0.6), (0.105, 0.64)])
K = 1.3                                                                               # 병 크기(옆모습에 곱한다)
SHAPE = {k: [(r * K, z * K) for r, z in v] for k, v in SHAPE.items()}
COLLAR = dict(red=0.5 * K, blue=0.56 * K, yellow=0.565 * K)                                       # 목 띠의 높이

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    matte, gloss = L.material('potion_matte', 0.7), L.material('potion_gloss', 0.26)

    # ── 가마솥: 배가 부른 무쇠 솥 · 넓은 입 · 발 셋 · 고리 둘 · 금빛 징
    m = Mk(); iron = PAL['pot']; lip = mix(PAL['pot'], PAL['purple'], 0.55)
    m.lathe([(0, 0.06), (0.3, 0.06), (0.5, 0.16), (0.6, 0.32), (0.585, 0.46), (0.52, 0.56), (0.5, 0.6), (0.56, 0.64), (0.585, 0.665), (0.57, 0.69), (0.5, 0.69)], lambda p: lip if p.z > 0.6 else iron, segs=44)
    m.lathe([(0.5, 0.69), (0.455, 0.62), (0.5, 0.5), (0.53, 0.34), (0.44, 0.2), (0.26, 0.13), (0, 0.12)], iron * 0.6, segs=44)          # 안쪽(어둡게)
    for i in range(3):
        a = math.radians(90 + i * 120); m.ball(0.1, (math.cos(a) * 0.36, math.sin(a) * 0.36, 0.07), iron * 0.85, (1, 1, 0.75))
    for sx in (-1, 1):
        m.torus(0.1, 0.03, (sx * 0.63, 0, 0.42), PAL['gold'], rot=RZ(90)); m.ball(0.05, (sx * 0.6, 0, 0.5), PAL['gold'])
    for i in range(7):
        a = math.radians(-90 + (i - 3) * 22); m.ball(0.036, (math.cos(a) * 0.598, math.sin(a) * 0.598, 0.33), PAL['gold'], (1, 1, 1))
    m.done('cauldron', matte, ground=0, ao=0.5, shade=0.2)

    # ── 물약 병 셋
    for name, prof in SHAPE.items():
        m = Mk(); m.lathe(prof, PAL['glass'], segs=28); m.done('glass_' + name, gloss, ao=0.0, shade=0.0)
        top = prof[-1][1] - 0.11; inner = [(0, 0.018)] + [(max(r - 0.022, 0.03), max(z, 0.018)) for r, z in prof[1:] if z < top] + [(max(_r_at(prof, top) - 0.022, 0.03), top), (0, top)]
        m = Mk(); m.lathe(inner, PAL['white'], segs=24); m.done('liq_' + name, gloss, ao=0.0, shade=0.0)
        m = Mk(); z = COLLAR[name]; r = _r_at(prof, z)
        m.torus(r + 0.014, 0.036, (0, 0, z), INK[name], rot=RX(90), segs=24, tube=10); m.torus(prof[-1][0], 0.017, (0, 0, prof[-1][1]), PAL['cream'], rot=RX(90), segs=24, tube=8)
        m.done('cap_' + name, gloss, ao=0.2, shade=0.0)

    # ── 국자: 금빛 바가지 + 나무 자루(오른쪽 위로 조금 기울어 선다) + 끝 구슬
    m = Mk()
    m.lathe([(0, -0.105), (0.07, -0.09), (0.118, -0.045), (0.135, 0.0), (0.145, 0.012), (0.125, 0.008), (0.105, -0.04), (0.06, -0.075), (0, -0.085)], PAL['gold'], segs=26)
    m.lathe([(0, 0), (0.032, 0), (0.028, 0.7), (0.036, 0.72), (0, 0.74)], lambda p: PAL['wood'] if p.z < 0.62 else PAL['wood2'], (0.125, 0, -0.01), 12, RY(12))
    m.ball(0.07, (0.125 + math.sin(math.radians(12)) * 0.76, 0, -0.01 + math.cos(math.radians(12)) * 0.76), PAL['coral'])
    m.done('ladle', gloss, ao=0.35, shade=0.0)

    # ── 물 양동이: 하늘빛 통 · 흰 띠 · 손잡이
    m = Mk(); pail = lambda p: PAL['cream'] if 0.2 < p.z < 0.27 and math.hypot(p.x, p.y) > 0.2 else PAL['sky']
    m.lathe([(0, 0), (0.17, 0), (0.19, 0.02), (0.25, 0.34), (0.265, 0.36), (0.24, 0.36), (0.225, 0.33), (0.175, 0.04), (0, 0.04)], pail, segs=32)
    m.torus(0.262, 0.02, (0, 0, 0.3), PAL['dark'], arc=math.pi, segs=22, tube=8)
    for sx in (-1, 1): m.ball(0.035, (sx * 0.262, 0, 0.3), PAL['gold'])
    m.done('bucket', gloss, ground=0, ao=0.4)

def _r_at(prof, z):
    for (r0, z0), (r1, z1) in zip(prof, prof[1:]):
        if z0 <= z <= z1 and z1 > z0: return r0 + (r1 - r0) * (z - z0) / (z1 - z0)
    return prof[-1][0]

def export():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    build(); export()

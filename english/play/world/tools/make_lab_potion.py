"""마법 연구소 · 자리 ③ 「무지개 물약」의 가구 — 냄비와 받침 · 뚜껑문 · 병 걸이 · 물약 병 넷 · 국자 · 수도꼭지 · 마개 줄을 블렌더로 빚는다. 받아 온 모형 없음.
실행(화면 없이):  blender -b --python english/play/world/tools/make_lab_potion.py   → english/play/world/assets/lab_potion.glb (450KB 아래)
빚는 도구(Mk · PAL · material)는 make_lab.py 의 것을 그대로 쓴다(같은 색감 · 같은 틈새 그늘). 치수는 자료(data/lab.js stations.potion.T)의 CAULDRON · RAIL 과 맞춘다.
물체 이름이 약속이다(모두 원점에 — 자리 파일 stations/potion.js 가 자리를 정한다):
  pot(냄비와 받침 — 받침 바닥 가운데가 원점 · 바깥 반지름 0.62 · 테두리 높이 0.62 · 입 안쪽 반지름 0.5)
  lid(뚜껑문 반쪽 — 온 원의 가운데가 원점, -x 쪽 반원. 놀이가 하나를 뒤집어 둘로 쓴다)
  rail(병 걸이 — 가로대 가운데가 원점 · 줄 둘은 위로 길게 · 고리 넷은 RAIL.xs 에)
  glass_* · liq_* · band_* · cork_*  (* = red · yellow · blue · white — 병 유리 / 속 물약(놀이가 색을 입힌다) / 목 띠와 매단 줄 / 코르크. 매달린 꼭대기가 원점, 몸은 아래로)
  ladle(국자 — 바가지 가운데가 원점 · 자루는 위로) / tap(수도꼭지 — 밑동 가운데가 원점 · 물 나오는 곳 (-0.48, 0.62)) · tap_handle(돌리는 손잡이 — 가운데가 원점) · basin(물받이 — 바닥 가운데가 원점)
  plug(마개 줄 — 매단 꼭대기가 원점 · 금빛 고리가 아래에)
좌표: 블렌더 z 위 · 앞 -y → 내보내면 y 위 · 앞 +z. 실험대 윗면이 높이 0.
"""
import bpy, math, os, sys
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_lab as L
from make_lab import Mk, PAL, mix, rgb, RX, RY, RZ

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'lab_potion.glb'))
RAIL_XS = (-0.9, -0.3, 0.3, 0.9)                                                     # 자료 RAIL.xs
INK = dict(red=rgb('#E8574E'), yellow=rgb('#FFD24A'), blue=rgb('#4E9BE8'), white=rgb('#FFF7EC'))   # 목 띠의 색(자료 colors.hex — 속 물약의 색은 놀이 코드가 입힌다)
# 병의 옆모습(반지름, 바닥에서의 높이) — 넷이 다르게: 둥근 플라스크 · 조롱박 · 세모 플라스크 · 길쭉한 병
SHAPE = dict(
    red=[(0, 0), (0.1, 0), (0.18, 0.05), (0.215, 0.16), (0.19, 0.29), (0.11, 0.38), (0.07, 0.44), (0.065, 0.54), (0.085, 0.57)],
    yellow=[(0, 0), (0.1, 0), (0.17, 0.05), (0.19, 0.14), (0.15, 0.25), (0.1, 0.3), (0.135, 0.37), (0.14, 0.43), (0.09, 0.5), (0.07, 0.53), (0.07, 0.59), (0.09, 0.62)],
    blue=[(0, 0), (0.19, 0), (0.225, 0.04), (0.215, 0.1), (0.085, 0.44), (0.07, 0.48), (0.07, 0.58), (0.09, 0.61)],
    white=[(0, 0), (0.12, 0), (0.15, 0.04), (0.155, 0.3), (0.13, 0.38), (0.075, 0.45), (0.068, 0.56), (0.088, 0.59)])
K = 1.12                                                                              # 병 크기(옆모습에 곱한다)
SHAPE = {k: [(r * K, z * K) for r, z in v] for k, v in SHAPE.items()}
HANG = 0.11                                                                           # 병 입에서 매단 꼭대기까지(줄 고리)

def _r_at(prof, z):
    for (r0, z0), (r1, z1) in zip(prof, prof[1:]):
        if z0 <= z <= z1 and z1 > z0: return r0 + (r1 - r0) * (z - z0) / (z1 - z0)
    return prof[-1][0]

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    matte, gloss = L.material('lab_potion_matte', 0.7), L.material('lab_potion_gloss', 0.26)

    # ── 냄비와 받침: 둥근 나무 받침(뚜껑문 자리를 메운다) 위에 배가 부른 무쇠 냄비 · 발 셋 · 고리 둘 · 금빛 징
    m = Mk(); iron = PAL['pot']; lip = mix(PAL['pot'], PAL['purple'], 0.55)
    m.lathe([(0, 0), (0.56, 0), (0.585, 0.02), (0.56, 0.045), (0, 0.045)], mix(PAL['wood2'], PAL['wood3'], 0.5), segs=36)
    m.lathe([(0, 0.1), (0.28, 0.1), (0.48, 0.17), (0.6, 0.31), (0.6, 0.42), (0.53, 0.52), (0.5, 0.555), (0.56, 0.585), (0.585, 0.6), (0.57, 0.62), (0.5, 0.62)], lambda p: lip if p.z > 0.55 else iron, segs=36)
    m.lathe([(0.5, 0.62), (0.465, 0.56), (0.5, 0.47), (0.53, 0.36), (0.45, 0.24), (0.27, 0.15), (0, 0.14)], iron * 0.6, segs=36)          # 안쪽(어둡게)
    for i in range(3):
        a = math.radians(90 + i * 120); m.ball(0.1, (math.cos(a) * 0.36, math.sin(a) * 0.36, 0.09), iron * 0.85, (1, 1, 0.75), segs=14)
    for sx in (-1, 1):
        m.torus(0.09, 0.028, (sx * 0.635, 0, 0.4), PAL['gold'], rot=RZ(90), segs=16, tube=8); m.ball(0.045, (sx * 0.605, 0, 0.48), PAL['gold'], segs=10)
    for i in range(7):
        a = math.radians(-90 + (i - 3) * 22); m.ball(0.034, (math.cos(a) * 0.6, math.sin(a) * 0.6, 0.365), PAL['gold'], segs=8)
    m.done('pot', matte, ground=0, ao=0.5, shade=0.2)

    # ── 뚜껑문 반쪽(-x 쪽 반원 · 얇은 나무 판 · 금빛 손잡이 고리)
    m = Mk(); R = 0.66; top, bot = [], []
    for i in range(19):
        a = math.radians(90 + i * 10); top.append(m.bm.verts.new((R * math.cos(a), R * math.sin(a), 0.012))); bot.append(m.bm.verts.new((R * math.cos(a), R * math.sin(a), 0)))
    c1, c0 = m.bm.verts.new((0, 0, 0.012)), m.bm.verts.new((0, 0, 0))
    for i in range(18):
        m.bm.faces.new((c1, top[i], top[i + 1])); m.bm.faces.new((c0, bot[i + 1], bot[i])); m.bm.faces.new((top[i], bot[i], bot[i + 1], top[i + 1]))
    m.bm.faces.new((top[0], c1, c0, bot[0])); m.bm.faces.new((c1, top[18], bot[18], c0))
    m._paint(top + bot + [c1, c0], lambda p: mix(PAL['wood2'], PAL['wood3'], 0.25 + 0.2 * math.sin(p.y * 14)))
    m.torus(0.05, 0.014, (-0.3, 0, 0.02), PAL['gold'], rot=RX(90), segs=12, tube=6)
    m.done('lid', matte, ao=0.2, shade=0.0)

    # ── 병 걸이: 나무 가로대 · 천장으로 가는 줄 둘 · 금빛 고리 넷
    m = Mk()
    m.lathe([(0, -1.28), (0.05, -1.26), (0.045, 1.26), (0, 1.28)], lambda p: PAL['wood2'] if abs(p.x) < 1.15 else PAL['gold'], (0, 0, 0), 12, RY(90))
    for sx in (-1.12, 1.12):
        m.lathe([(0.016, 0.03), (0.016, 3.6)], PAL['cream'] * 0.8, (sx, 0, 0), 6); m.ball(0.06, (sx, 0, 0.03), PAL['gold'], segs=10)
    for x in RAIL_XS: m.torus(0.035, 0.012, (x, 0, -0.07), PAL['gold'], rot=RY(0), segs=12, tube=6)
    m.done('rail', gloss, ao=0.25, shade=0.0)

    # ── 물약 병 넷(매달린 꼭대기가 원점)
    for name, prof in SHAPE.items():
        H = prof[-1][1]; dz = -(H + HANG); at = (0, 0, dz)
        m = Mk(); m.lathe(prof, PAL['glass'], at, segs=20); m.done('glass_' + name, gloss, ao=0.0, shade=0.0)
        top = H * 0.74; inner = [(0, 0.018)] + [(max(r - 0.02, 0.03), max(z, 0.018)) for r, z in prof[1:] if z < top] + [(max(_r_at(prof, top) - 0.02, 0.03), top), (0, top)]
        m = Mk(); m.lathe(inner, PAL['white'], at, segs=16); m.done('liq_' + name, gloss, ao=0.0, shade=0.0)
        m = Mk(); z = H - 0.1 * K; r = _r_at(prof, z)
        m.torus(r + 0.012, 0.03, (0, 0, dz + z), INK[name], rot=RX(90), segs=16, tube=8)                                             # 목 띠(병 색)
        m.torus(0.05, 0.011, (0, 0, -0.05), PAL['cream'] * 0.85, rot=RY(0), segs=12, tube=6)                                         # 매단 줄 고리
        m.lathe([(0.012, 0), (0.012, HANG - 0.09)], PAL['cream'] * 0.85, (0, 0, dz + H), 6)
        m.done('band_' + name, gloss, ao=0.15, shade=0.0)
        m = Mk(); m.lathe([(0, -0.03), (0.055, -0.03), (0.07, 0.035), (0.062, 0.05), (0, 0.055)], PAL['wood'], (0, 0, dz + H), 10); m.done('cork_' + name, matte, ao=0.1, shade=0.0)

    # ── 국자: 금빛 바가지 + 나무 자루(오른쪽 위로 조금 기울어 선다) + 끝 구슬
    m = Mk()
    m.lathe([(0, -0.105), (0.07, -0.09), (0.118, -0.045), (0.135, 0.0), (0.145, 0.012), (0.125, 0.008), (0.105, -0.04), (0.06, -0.075), (0, -0.085)], PAL['gold'], segs=20)
    m.lathe([(0, 0), (0.032, 0), (0.028, 0.7), (0.036, 0.72), (0, 0.74)], lambda p: PAL['wood'] if p.z < 0.62 else PAL['wood2'], (0.125, 0, -0.01), 10, RY(12))
    m.ball(0.07, (0.125 + math.sin(math.radians(12)) * 0.76, 0, -0.01 + math.cos(math.radians(12)) * 0.76), PAL['coral'], segs=14)
    m.done('ladle', gloss, ao=0.35, shade=0.0)

    # ── 수도꼭지: 밑동 · 대롱 · 거위 목(왼쪽으로 굽어 아래를 본다) · 주둥이 / 돌리는 손잡이 / 물받이
    m = Mk(); brass = mix(PAL['gold'], PAL['wood2'], 0.25)
    m.lathe([(0, 0), (0.17, 0), (0.18, 0.03), (0.1, 0.07), (0.07, 0.11), (0, 0.11)], brass * 0.9, segs=18)
    m.lathe([(0.055, 0.08), (0.055, 0.72)], brass, segs=12)
    m.torus(0.24, 0.055, (-0.24, 0, 0.72), brass, arc=math.pi, segs=14, tube=10)
    m.lathe([(0.055, 0.72), (0.075, 0.68), (0.075, 0.62), (0.05, 0.62)], PAL['gold'], (-0.48, 0, 0), 12)
    m.lathe([(0, 0), (0.07, 0), (0.07, 0.07), (0, 0.07)], brass * 0.9, (0, -0.05, 0.42), 10, RX(90))                               # 손잡이가 끼는 목(앞으로)
    m.done('tap', gloss, ground=0, ao=0.4, shade=0.1)
    m = Mk(); m.ball(0.06, (0, 0, 0), PAL['gold'], segs=10)
    for i in range(4):
        a = i * math.pi / 2; m.lathe([(0.022, 0), (0.022, 0.13)], PAL['gold'], (0, 0, 0), 6, RY(math.degrees(a))); m.ball(0.05, (math.sin(a) * 0.15, 0, math.cos(a) * 0.15), PAL['coral'], segs=10)
    m.done('tap_handle', gloss, ao=0.2, shade=0.0)
    m = Mk(); m.lathe([(0, 0), (0.27, 0), (0.31, 0.035), (0.3, 0.06), (0.26, 0.035), (0.07, 0.02), (0, 0.02)], lambda p: PAL['dark'] if math.hypot(p.x, p.y) < 0.08 else PAL['sky'], segs=24)
    m.done('basin', gloss, ground=0, ao=0.4, shade=0.0)

    # ── 마개 줄: 걸쇠 구슬 · 줄 · 금빛 고리(잡아당기는 곳)
    m = Mk(); m.ball(0.04, (0, 0, 0), PAL['gold'], segs=10); m.lathe([(0.013, -0.3), (0.013, 0)], PAL['cream'] * 0.85, segs=6)
    m.torus(0.075, 0.022, (0, 0, -0.37), PAL['gold'], rot=RY(0), segs=16, tube=8); m.ball(0.03, (0, 0, -0.3), PAL['coral'], segs=8)
    m.done('plug', gloss, ao=0.2, shade=0.0)

def export():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    build(); export()

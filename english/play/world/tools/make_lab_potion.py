"""마법 연구소 · 자리 ③ 「무지개 물약」(설계 v1.2 — 큰 유리 수조)의 가구 — 수조 받침과 틀 · 수조 뒤 빛 판 · 병 걸이 · 물약 병 넷 · 젓는 노 · 물 빼는 꼭지 · 물 채우는 대롱을 블렌더로 빚는다. 받아 온 모형 없음.
실행(화면 없이):  blender -b --python english/play/world/tools/make_lab_potion.py   → english/play/world/assets/lab_potion.glb (450KB 아래)
빚는 도구(Mk · PAL · material)는 make_lab.py 의 것을 그대로 쓴다. 치수는 자료(data/lab.js stations.potion.T)의 TANK(너비 3.3 · 높이 1.7 · 깊이 0.95) · RAIL 과 맞춘다.
물체 이름이 약속이다(모두 원점에 — 자리 파일 stations/potion.js 가 자리를 정한다):
  tank(받침과 틀 — 받침 바닥 가운데가 원점. 받침 높이 0.1, 그 위로 유리가 설 자리. 유리 · 물은 놀이 코드가 그린다) / backlight(수조 뒤 빛 판 — 놀이가 빛나는 재질을 입힌다)
  rail(병 걸이 — 가로대 가운데가 원점) / glass_* · liq_* · band_* · cork_*  (* = red · yellow · blue · white — 매달린 꼭대기가 원점, 몸은 아래로)
  paddle(젓는 노 — 손잡이 꼭대기가 원점, 넓적한 끝이 아래로 1.5) / spigot(물 빼는 꼭지 — 수조 벽에 붙는 자리가 원점, 앞(+z)으로 나온다) · spigot_handle / pipe(물 채우는 대롱 — 수조 오른쪽 테두리에 걸친다. 테두리 위 자리가 원점)
좌표: 블렌더 z 위 · 앞 -y → 내보내면 y 위 · 앞 +z. 실험대 윗면이 높이 0.
"""
import bpy, math, os, sys
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_lab as L
from make_lab import Mk, PAL, mix, rgb, RX, RY, RZ

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'lab_potion.glb'))
RAIL_XS = (-1.05, -0.35, 0.35, 1.05)                                                     # 자료 RAIL.xs
INK = dict(red=rgb('#E8574E'), yellow=rgb('#FFD24A'), blue=rgb('#4E9BE8'), white=rgb('#FFF7EC'))   # 목 띠의 색(자료 colors.hex — 속 물약의 색은 놀이 코드가 입힌다)
# 병의 옆모습(반지름, 바닥에서의 높이) — 넷이 다르게: 둥근 플라스크 · 조롱박 · 세모 플라스크 · 길쭉한 병
SHAPE = dict(
    red=[(0, 0), (0.1, 0), (0.18, 0.05), (0.215, 0.16), (0.19, 0.29), (0.11, 0.38), (0.07, 0.44), (0.065, 0.54), (0.085, 0.57)],
    yellow=[(0, 0), (0.1, 0), (0.17, 0.05), (0.19, 0.14), (0.15, 0.25), (0.1, 0.3), (0.135, 0.37), (0.14, 0.43), (0.09, 0.5), (0.07, 0.53), (0.07, 0.59), (0.09, 0.62)],
    blue=[(0, 0), (0.19, 0), (0.225, 0.04), (0.215, 0.1), (0.085, 0.44), (0.07, 0.48), (0.07, 0.58), (0.09, 0.61)],
    white=[(0, 0), (0.12, 0), (0.15, 0.04), (0.155, 0.3), (0.13, 0.38), (0.075, 0.45), (0.068, 0.56), (0.088, 0.59)])
K = 0.95                                                                              # 병 크기(옆모습에 곱한다)
SHAPE = {k: [(r * K, z * K) for r, z in v] for k, v in SHAPE.items()}
HANG = 0.11                                                                           # 병 입에서 매단 꼭대기까지(줄 고리)

def _r_at(prof, z):
    for (r0, z0), (r1, z1) in zip(prof, prof[1:]):
        if z0 <= z <= z1 and z1 > z0: return r0 + (r1 - r0) * (z - z0) / (z1 - z0)
    return prof[-1][0]

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    matte, gloss = L.material('lab_potion_matte', 0.7), L.material('lab_potion_gloss', 0.26)

    # ── 수조 받침과 틀: 나무 받침 · 놋쇠 기둥 넷 · 위 테두리(유리와 물은 놀이 코드가 그린다)
    m = Mk(); TW, TH, TD, B0 = 3.3, 1.7, 0.95, 0.1; brass = mix(PAL['gold'], PAL['wood2'], 0.3)
    m.box((TW + 0.16, TD + 0.16, B0), (0, 0, B0 / 2), mix(PAL['wood2'], PAL['wood3'], 0.5), 0.03)
    for sx in (-1, 1):
        for sy in (-1, 1): m.box((0.07, 0.07, TH - B0), (sx * (TW / 2 - 0.02), sy * (TD / 2 - 0.02), B0 + (TH - B0) / 2), brass, 0.015)
        m.box((0.06, TD, 0.06), (sx * (TW / 2 - 0.02), 0, TH - 0.03), brass, 0.012)
    for sy in (-1, 1): m.box((TW, 0.06, 0.06), (0, sy * (TD / 2 - 0.02), TH - 0.03), brass, 0.012)
    m.done('tank', matte, ground=0, ao=0.35, shade=0.0)
    m = Mk(); m.box((TW - 0.1, 0.03, TH - B0 - 0.08), (0, 0, B0 + (TH - B0 - 0.08) / 2), PAL['white'], 0.0); m.done('backlight', matte, ao=0.0, shade=0.0)

    # ── 병 걸이: 나무 가로대 · 천장으로 가는 줄 둘 · 금빛 고리 넷
    m = Mk()
    m.lathe([(0, -1.5), (0.05, -1.48), (0.045, 1.48), (0, 1.5)], lambda p: PAL['wood2'] if abs(p.x) < 1.38 else PAL['gold'], (0, 0, 0), 12, RY(90))
    for sx in (-1.42, 1.42):
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

    # ── 젓는 노: 긴 나무 자루 + 넓적한 끝(손잡이 꼭대기가 원점)
    m = Mk(); m.lathe([(0, -1.2), (0.03, -1.2), (0.034, -0.02), (0.05, 0), (0, 0.03)], lambda p: PAL['wood'] if p.z < -0.25 else PAL['wood2'], segs=10)
    m.box((0.3, 0.05, 0.42), (0, 0, -1.36), PAL['wood'], 0.04); m.ball(0.055, (0, 0, 0.02), PAL['coral'], segs=10)
    m.done('paddle', matte, ao=0.3, shade=0.0)

    # ── 물 빼는 꼭지(수조 벽에서 앞으로 나온다) · 돌리는 손잡이 / 물 채우는 대롱(테두리에 걸쳐 아래를 본다)
    m = Mk(); brass2 = mix(PAL['gold'], PAL['wood2'], 0.25)
    m.lathe([(0.1, 0), (0.1, 0.05), (0.065, 0.07), (0.065, 0.3), (0.08, 0.32), (0, 0.32)], brass2, (0, 0, 0), 14, RX(90))
    m.lathe([(0.05, 0), (0.06, -0.16), (0.045, -0.16)], PAL['gold'], (0, -0.24, 0), 12)
    m.done('spigot', gloss, ao=0.35, shade=0.0)
    m = Mk(); m.ball(0.05, (0, 0, 0), PAL['gold'], segs=10)
    for i in range(4):
        a = i * math.pi / 2; m.lathe([(0.02, 0), (0.02, 0.12)], PAL['gold'], (0, 0, 0), 6, RY(math.degrees(a))); m.ball(0.048, (math.sin(a) * 0.14, 0, math.cos(a) * 0.14), PAL['coral'], segs=10)
    m.done('spigot_handle', gloss, ao=0.2, shade=0.0)
    m = Mk(); m.lathe([(0.05, 0), (0.05, 0.3)], brass2, (0.3, 0, -0.3), 12); m.torus(0.15, 0.05, (0.15, 0, 0), brass2, arc=math.pi, segs=12, tube=10)
    m.lathe([(0.05, 0), (0.065, -0.08), (0.05, -0.08)], PAL['gold'], (0, 0, 0), 12); m.ball(0.07, (0.3, 0, -0.32), PAL['gold'], segs=10)
    m.done('pipe', gloss, ao=0.3, shade=0.0)

def export():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    build(); export()

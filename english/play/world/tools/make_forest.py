"""첫 접속 「문 뒤에 누가 있을까?」의 숲 무대를 블렌더로 빚는다. 받아 온 모형 없음.
실행(화면 없이):  blender -b --python english/play/world/tools/make_forest.py   → world/assets/forest.glb
물체: glade(풀밭 · 그루터기 집 · 나무 · 덤불 · 꽃 · 버섯 · 길 · 팻말 — 제자리에) / door(경첩이 원점 — 왼쪽 가장자리) / chest · chest_lid(경첩이 원점 — 뒤쪽 윗모서리) / redball(가운데가 원점)
      / village(언덕 위 마을: 연구소 탑 · 식당 · 햄버거 가게 — 제자리에. 놀이가 카메라를 옮겨 보여 준다).
좌표: 블렌더 z 위 · 앞 -y → 내보내면 y 위 · 앞 +z. 땅이 높이 0. 집의 문은 x = -2.7, 상자는 x = 3.0, 마을은 오른쪽 뒤 언덕.
"""
import bpy, math, os, sys, random
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import make_lab as M
from make_lab import Mk, rgb, mix, RX, RY, RZ

OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'forest.glb'))
DOOR_X, DOOR_Y, DOOR_R = -2.7, -0.32, 0.62          # 문 가운데(가로) · 집 앞면(블렌더 y) · 문 반지름
P = {k: rgb(v) for k, v in dict(grass='#8fcf6e', grass2='#6fb85c', path='#e8d3a2', bark='#a9744a', bark2='#8a5a36', leaf='#5fb869', leaf2='#8fd67a', leaf3='#3f9a5c', door='#f29a83', door2='#d97a63', gold='#ffcc70', dark='#3a2a22',
     glow='#ffe9a8', white='#ffffff', cream='#f7ebd5', sky='#83c9ea', purple='#9b8ad4', purple2='#7a69b8', coral='#f29a83', red='#e8493f', rock='#b8b4ae', cap='#e8605a', stem='#f4ead2', wood='#dba869', wood2='#b97c48', sun='#ffcc70', pink='#ff9ebb', roof='#e07a6a').items()}
rnd = random.Random(11)

def tree(m, x, y, s=1.0, c=None):
    c = c or P['leaf']; m.lathe([(0, 0), (0.16 * s, 0), (0.12 * s, 0.5 * s), (0.1 * s, 1.1 * s), (0, 1.12 * s)], P['bark2'], (x, y, 0), 10)
    for dx, dz, r in ((0, 1.55, 0.62), (-0.34, 1.25, 0.46), (0.36, 1.22, 0.48), (0.05, 1.98, 0.42)): m.ball(r * s, (x + dx * s, y, dz * s), lambda p, c=c, z=dz * s: mix(c * 0.86, mix(c, P['leaf2'], 0.5), min(1, max(0, (p.z - z) / (r * s) * 0.5 + 0.5))), (1, 0.9, 0.95), 16)

def bush(m, x, y, s=1.0, c=None):
    c = c or P['leaf3']
    for dx, dz, r in ((0, 0.26, 0.34), (-0.3, 0.2, 0.26), (0.3, 0.2, 0.27)): m.ball(r * s, (x + dx * s, y, dz * s), mix(c, P['leaf2'], 0.25 + 0.3 * rnd.random()), (1, 0.85, 0.9), 14)

def flower(m, x, y, c):
    m.lathe([(0, 0), (0.014, 0), (0.012, 0.2), (0, 0.2)], P['leaf3'], (x, y, 0), 6); m.ball(0.035, (x, y, 0.21), P['gold'], (1, 1, 0.7), 8)
    for i in range(5): a = i / 5 * math.tau; m.ball(0.04, (x + math.cos(a) * 0.05, y, 0.21 + math.sin(a) * 0.05), c, (1, 0.5, 1), 8)

def mushroom(m, x, y, s=1.0):
    m.lathe([(0, 0), (0.05 * s, 0), (0.04 * s, 0.12 * s), (0, 0.12 * s)], P['stem'], (x, y, 0), 10); m.lathe([(0, 0.1 * s), (0.12 * s, 0.1 * s), (0.11 * s, 0.15 * s), (0.06 * s, 0.2 * s), (0, 0.215 * s)], P['cap'], (x, y, 0), 14)

def house(m, x, y, z, w, h, wall, roof, s=1.0):
    m.box((w, w * 0.8, h), (x, y, z + h / 2), wall, 0.05); m.lathe([(0, 0), (w * 0.78, 0), (w * 0.55, h * 0.3), (0, h * 0.62)], roof, (x, y, z + h), 4, RZ(45))
    m.box((w * 0.26, 0.05, h * 0.5), (x, y - w * 0.4, z + h * 0.25), P['wood2'], 0.02); m.box((w * 0.2, 0.05, w * 0.2), (x + w * 0.27, y - w * 0.4, z + h * 0.62), P['glow'], 0.02)

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True); matte, gloss = M.material('forest_matte', 0.85), M.material('forest_gloss', 0.35)
    # ── 숲(제자리)
    m = Mk()
    def ground(p):                                        # 풀밭 위에 오른쪽 뒤 언덕으로 가는 길
        t = (p.x - 2.2) / 6.0; py = 0.2 + 1.9 * max(0, t) ** 1.4; d = abs(p.y - py) if p.x > 1.6 else 9
        return mix(P['path'], mix(P['grass'], P['grass2'], 0.5 + 0.5 * math.sin(p.x * 1.7) * math.cos(p.y * 2.1)), min(1, max(0, (d - 0.32) / 0.25)))
    N = 46
    vs = [[m.bm.verts.new((-11 + 26 * i / N, -7.0 + 16 * j / N, 0)) for j in range(N + 1)] for i in range(N + 1)]
    for row in vs:
        for v in row:
            x, y = v.co.x, v.co.y; v.co.z = 2.1 * max(0, min(1, (x - 3.0) / 6.5)) ** 1.6 * max(0, min(1, (y + 0.4) / 3.0)) + 0.05 * math.sin(x * 1.3) * math.sin(y * 1.1)   # 오른쪽 뒤가 언덕으로 솟는다
            if abs(x) < 4.6 and -1.4 < y < 0.9: v.co.z *= 0.15                                                                                                   # 놀이터는 평평하게
    for i in range(N):
        for j in range(N): m.bm.faces.new((vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1]))
    m._paint([v for row in vs for v in row], ground)
    # 그루터기 집: 굵은 줄기 + 잎 지붕 + 둥근 문틀 + 창 + 굴뚝
    hx = DOOR_X
    m.lathe([(0, 0), (1.5, 0), (1.34, 0.25), (1.2, 1.2), (1.16, 2.3), (1.3, 2.6), (0, 2.6)], lambda p: mix(P['bark'], P['bark2'], 0.5 + 0.5 * math.sin(math.atan2(p.y - 1.2, p.x - hx) * 16)), (hx, 1.2, 0), 40)
    for dx, dy, dz, r in ((0, 1.2, 3.0, 1.55), (-1.0, 1.3, 2.75, 1.0), (1.05, 1.25, 2.8, 1.05), (0.1, 1.2, 3.85, 0.95)): m.ball(r, (hx + dx, dy, dz), lambda p, z=dz, r=r: mix(P['leaf3'], P['leaf2'], min(1, max(0, (p.z - z) / r * 0.6 + 0.45))), (1, 0.95, 0.72), 22)
    m.lathe([(DOOR_R + 0.16, 0), (DOOR_R + 0.16, 0.6), (DOOR_R + 0.02, 0.6), (DOOR_R + 0.02, 0)], P['bark2'], (hx, DOOR_Y + 0.6, DOOR_R + 0.08), 32, RX(90))   # 줄기 밖으로 내민 둥근 문간
    m.torus(DOOR_R + 0.07, 0.085, (hx, DOOR_Y + 0.02, DOOR_R + 0.08), P['bark2']); m.lathe([(0, 0), (DOOR_R + 0.02, 0)], P['dark'], (hx, DOOR_Y + 0.06, DOOR_R + 0.08), 32, RX(90))   # 문틀 · 어두운 안쪽
    for wx in (-0.78, 0.86): m.torus(0.2, 0.05, (hx + wx, 0.12, 1.75), P['bark2']); m.lathe([(0, 0), (0.19, 0)], P['glow'], (hx + wx, 0.15, 1.75), 20, RX(90))
    m.lathe([(0, 0), (0.16, 0), (0.14, 0.55), (0.2, 0.6), (0.2, 0.68), (0, 0.68)], P['rock'], (hx + 0.75, 1.5, 3.55), 12)
    for i in range(4): m.box((0.5, 0.36, 0.07), (hx + (i % 2) * 0.12 - 0.06, DOOR_Y - 0.45 - i * 0.02, 0.02), P['rock'], 0.03, RZ(i * 13))                       # 문 앞 디딤돌
    for x, y, s, c in ((-6.3, 2.2, 1.5, None), (-4.9, 3.4, 1.9, P['leaf3']), (-0.4, 3.6, 1.8, None), (1.4, 4.4, 2.2, P['leaf3']), (3.3, 5.6, 1.7, None), (-7.6, 0.6, 1.3, P['leaf3']), (5.6, 6.4, 1.6, P['leaf3']), (0.6, 6.2, 2.4, None)): tree(m, x, y, s, c)
    for x, y, s in ((-5.0, 0.5, 1.1), (-0.6, 1.4, 1.0), (0.8, 1.7, 1.2), (3.9, 0.55, 1.15), (4.7, 0.2, 0.8), (-4.4, -1.6, 0.8), (2.0, 2.2, 1.0)): bush(m, x, y, s)
    for i in range(16): flower(m, rnd.uniform(-5.5, 4.6), rnd.choice((rnd.uniform(0.75, 1.6), rnd.uniform(-2.3, -1.5))), rnd.choice((P['pink'], P['white'], P['sun'], P['purple'])))
    for x, y, s in ((-4.3, 0.2, 1.3), (-4.05, 0.05, 0.8), (1.5, 0.95, 1.1), (4.3, -1.5, 1.0)): mushroom(m, x, y, s)
    for x, y, s in ((-1.2, -2.2, 0.26), (0.9, 1.1, 0.2), (4.9, -0.6, 0.3)): m.ball(s, (x, y, s * 0.4), P['rock'], (1.2, 0.9, 0.6), 10)
    m.lathe([(0, 0), (0.045, 0), (0.04, 0.9), (0, 0.9)], P['wood2'], (4.75, 1.2, 0.25), 8); m.box((0.62, 0.05, 0.2), (4.95, 1.18, 1.02), P['wood'], 0.02, RZ(-12))   # 길머리 팻말(화살 꼴)
    m.done('glade', matte, ao=0.35, shade=0.0)

    # ── 문(경첩 = 왼쪽 가장자리가 원점)
    m = Mk(); R = DOOR_R; m.lathe([(0, 0), (R, 0), (R, 0.07), (R - 0.03, 0.09), (0, 0.09)], lambda p: mix(P['door'], P['door2'], 0.5 + 0.5 * math.sin(p.x * 22)), (R, 0, 0), 36, RX(90))
    m.torus(R * 0.36, 0.035, (R, -0.1, 0.16), P['bark2']); m.lathe([(0, 0), (R * 0.36, 0)], P['glow'], (R, -0.095, 0.16), 20, RX(90)); m.ball(0.065, (R * 1.62, -0.13, -0.05), P['gold'])
    m.done('door', gloss, ao=0.2, shade=0.0)

    # ── 상자 · 뚜껑(경첩 = 뒤쪽 윗모서리가 원점) · 빨간 공
    m = Mk(); m.box((0.9, 0.62, 0.46), (0, 0, 0.23), lambda p: mix(P['wood'], P['wood2'], 0.5 + 0.5 * math.sin(p.x * 14)), 0.04)
    for x in (-0.36, 0.36): m.box((0.09, 0.66, 0.5), (x, 0, 0.24), P['gold'], 0.02)
    m.ball(0.06, (0, -0.33, 0.36), P['gold'], (1, 0.6, 1.3)); m.done('chest', matte, ground=0, ao=0.3)
    m = Mk(); vs = m.box((0.94, 0.66, 0.3), (0, -0.33, 0.1), lambda p: mix(P['wood'], P['wood2'], 0.5 + 0.5 * math.sin(p.x * 14)), 0.11)
    for x in (-0.36, 0.36): m.box((0.09, 0.7, 0.34), (x, -0.33, 0.1), P['gold'], 0.1)
    m.done('chest_lid', matte, ao=0.2, shade=0.0)
    m = Mk(); m.ball(0.25, (0, 0, 0), lambda p: P['white'] if abs(Vector((0.3, 0.2, 0.93)).normalized().dot(p)) < 0.06 else P['red'], segs=36); m.done('redball', gloss, ao=0.0, shade=0.1)

    # ── 언덕 위 마을(멀리): 연구소 탑 · 식당 · 햄버거 가게
    m = Mk(); vx, vy, vz = 8.2, 4.6, 2.05
    m.lathe([(0, 0), (0.55, 0), (0.5, 1.5), (0.62, 1.6), (0.62, 1.75), (0, 1.75)], P['purple'], (vx - 1.7, vy + 0.3, vz), 16); m.lathe([(0, 0), (0.7, 0), (0, 0.9)], P['purple2'], (vx - 1.7, vy + 0.3, vz + 1.75), 16)   # 연구소 탑
    m.ball(0.14, (vx - 1.7, vy + 0.3, vz + 2.78), P['gold'], (1, 0.5, 1)); m.box((0.24, 0.05, 0.3), (vx - 1.7, vy - 0.24, vz + 0.95), P['glow'], 0.02); m.box((0.3, 0.05, 0.55), (vx - 1.7, vy - 0.25, vz + 0.28), P['wood2'], 0.02)
    house(m, vx, vy, vz - 0.05, 1.5, 1.0, P['cream'], P['roof']); m.box((1.6, 0.4, 0.08), (vx, vy - 0.78, vz + 0.72), P['coral'], 0.03, RX(-18))                    # 식당(차양)
    m.lathe([(0, 0), (0.22, 0), (0.26, 0.18), (0.2, 0.3), (0, 0.32)], P['white'], (vx, vy, vz + 1.62), 14)                                                       # 요리사 모자 간판
    house(m, vx + 1.9, vy + 0.4, vz + 0.1, 1.2, 0.85, P['sun'], P['wood2'])
    for i, (c, dz) in enumerate(((P['wood'], 0), (P['bark2'], 0.1), (P['sun'], 0.17), (P['red'], 0.22), (P['wood'], 0.3))): m.lathe([(0, 0), (0.3 - (0.04 if i == 4 else 0), 0), (0.3 - (0.1 if i == 4 else 0), 0.09), (0, 0.11)], c, (vx + 1.9, vy + 0.4, vz + 1.5 + dz), 14)   # 햄버거 간판
    for x, y, s in ((vx - 2.9, vy + 0.8, 1.2), (vx + 3.1, vy + 1.0, 1.3), (vx + 0.9, vy + 1.6, 1.5)): tree(m, x, y, s, P['leaf3']);
    for v in m.bm.verts:
        if v.co.z < 1.9 and v.is_valid: pass
    m.done('village', matte, ao=0.3, shade=0.0)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    build()

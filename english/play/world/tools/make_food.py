"""몬스터 식당의 무대와 음식을 블렌더로 빚는다. 받아 온 모형 없음.
실행(화면 없이):  blender -b --python english/play/world/tools/make_food.py   → world/assets/food.glb
물체 이름이 약속이다: kitchen(식탁 · 몬스터가 서는 단 · 벽 선반 · 그릇 · 창 — 제자리에 놓인 채로) / plate / bread · milk · egg · egg_fried · cake · lemon · pepper(가운데가 원점 — 던지면 돈다).
좌표: 블렌더 z 위 · 앞 -y → 내보내면 y 위 · 앞 +z. 식탁 윗면이 높이 0, 몬스터가 서는 단은 -0.15(식탁 뒤에 앉은 것처럼 보인다).
"""
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import make_lab as M
from make_lab import Mk, rgb, mix, RX, RY, RZ

OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'food.glb'))
TABLE = dict(w=9.0, d=1.3, y=-0.58, top=0.16)        # 식탁: 너비 · 깊이 · 가운데(블렌더 y) · 두께
STAND = -0.15                                        # 몬스터가 서는 단의 높이
WALL_Y = 1.75
P = {k: rgb(v) for k, v in dict(cloth='#fff3de', cloth2='#f29a83', wood='#dba869', wood2='#b97c48', wood3='#9a6238', white='#ffffff', cream='#fbf1dc', sky='#83c9ea', coral='#f29a83', sun='#ffcc70', green='#78b985',
     purple='#9b8ad4', steel='#b9c2cc', steel2='#8d98a6', crust='#d99548', crust2='#f3cf94', red='#e23b2e', red2='#b8261e', stem='#4f9b4b', lemon='#ffd93b', lemon2='#f5b82a', pink='#ff9ebb', cake='#f6dfb8',
     berry='#e23b4e', milk='#ffffff', cap='#5aa9e6', yolk='#ffb52e', glass='#dff3f7', dark='#5a4326').items()}

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    matte, gloss = M.material('food_matte', 0.8), M.material('food_gloss', 0.3); T = TABLE; hw = T['w'] / 2

    # ── 무대(제자리)
    m = Mk()
    m.box((T['w'], T['d'], T['top']), (0, T['y'], -T['top'] / 2), P['cloth'], 0.05)                                   # 식탁보 덮인 윗판
    m.box((T['w'] - 0.1, 0.08, 0.62), (0, T['y'] - T['d'] / 2 + 0.03, -0.42), P['cloth'], 0.02)                        # 앞으로 늘어진 식탁보
    m.box((T['w'] - 0.08, 0.1, 0.12), (0, T['y'] - T['d'] / 2 + 0.03, -0.62), P['cloth2'], 0.02)                       # 아랫단의 코랄 띠
    m.box((T['w'] - 0.5, T['d'] - 0.3, 1.8), (0, T['y'] + 0.05, -1.05), P['wood2'], 0.05)
    m.box((10.4, 2.3, 0.3), (0, 0.72, STAND - 0.15), lambda p: mix(P['wood'], P['wood2'], 0.25 + 0.12 * math.sin(p.x * 7)), 0.04)   # 몬스터가 서는 단
    for x, w, z in ((2.6, 3.0, 1.9), (-2.75, 2.6, 2.05)):                                                               # 벽 선반 둘
        m.box((w, 0.44, 0.09), (x, WALL_Y - 0.22, z), P['wood2'], 0.03)
        for sx in (-w / 2 + 0.25, w / 2 - 0.25): m.box((0.08, 0.3, 0.26), (x + sx, WALL_Y - 0.14, z - 0.16), P['wood3'], 0.02)
    y = WALL_Y - 0.22
    for x, c, h, r in ((1.5, P['coral'], 0.42, 0.17), (2.05, P['cream'], 0.3, 0.2), (2.6, P['sky'], 0.5, 0.15), (3.2, P['sun'], 0.34, 0.19), (3.75, P['green'], 0.44, 0.16)):   # 양념 단지(뚜껑 달린)
        m.lathe([(0, 0), (r * 0.85, 0), (r, 0.04), (r, h * 0.8), (r * 0.8, h), (0, h)], c, (x, y, 1.945), 20); m.lathe([(0, 0), (r * 0.88, 0), (r * 0.88, 0.05), (r * 0.3, 0.07), (r * 0.3, 0.11), (0, 0.12)], P['wood3'], (x, y, 1.945 + h), 16)
    m.lathe([(0, 0), (0.3, 0), (0.36, 0.06), (0.36, 0.3), (0.38, 0.32), (0.33, 0.32), (0.32, 0.08), (0, 0.07)], P['steel'], (-3.3, y, 2.095), 28)             # 냄비
    for sx in (-1, 1): m.torus(0.07, 0.022, (-3.3 + sx * 0.4, y, 2.33), P['steel2'], rot=RX(90))
    for i, c in enumerate((P['sky'], P['coral'], P['sun'])): m.lathe([(0, 0), (0.24 - i * 0.02, 0.0), (0.27 - i * 0.02, 0.05), (0.25 - i * 0.02, 0.06), (0, 0.03)], c, (-2.3, y, 2.095 + i * 0.05), 24)   # 접시 더미
    m.torus(0.9, 0.1, (0.05, WALL_Y - 0.03, 2.75), P['wood2'])                                                           # 둥근 창
    m.lathe([(0, 0), (0.9, 0)], lambda p: mix(P['sky'], P['white'], 0.3 + 0.3 * (p.z - 1.85) / 1.8), (0.05, WALL_Y - 0.02, 2.75), 40, RX(90))
    m.box((1.8, 0.07, 0.07), (0.05, WALL_Y - 0.05, 2.75), P['wood2'], 0.02); m.box((0.07, 0.07, 1.8), (0.05, WALL_Y - 0.05, 2.75), P['wood2'], 0.02)
    for x in (-1.75, -1.35):                                                                                             # 벽에 걸린 국자 · 뒤집개
        m.box((0.035, 0.03, 0.55), (x, WALL_Y - 0.05, 2.45), P['steel2'], 0.01)
        if x < -1.5: m.ball(0.09, (x, WALL_Y - 0.08, 2.14), P['steel'], (1, 0.6, 1))
        else: m.box((0.16, 0.03, 0.2), (x, WALL_Y - 0.05, 2.1), P['steel'], 0.012)
    m.done('kitchen', matte, ao=0.45, shade=0.0)

    m = Mk(); m.lathe([(0, 0), (0.2, 0), (0.3, 0.035), (0.38, 0.075), (0.36, 0.085), (0.27, 0.05), (0.18, 0.03), (0, 0.03)], lambda p: P['sky'] if math.hypot(p.x, p.y) > 0.31 else P['white'], segs=36); m.done('plate', gloss, ground=0, ao=0.3)

    # ── 음식(가운데가 원점)
    m = Mk(); m.box((0.52, 0.3, 0.27), (0, 0, 0), lambda p: mix(P['crust'], P['crust2'], max(0, -p.z * 3)), 0.12)
    for x in (-0.14, 0, 0.14): m.box((0.045, 0.24, 0.03), (x, 0, 0.135), P['crust2'], 0.012, RZ(22))
    m.done('bread', matte, ao=0.3, shade=0.12)
    m = Mk(); body = lambda p: P['sky'] if -0.06 < p.z < 0.04 else P['milk']
    m.lathe([(0, -0.21), (0.13, -0.21), (0.145, -0.19), (0.145, 0.06), (0.075, 0.15), (0.07, 0.2), (0, 0.2)], body, segs=24); m.lathe([(0, 0.19), (0.08, 0.19), (0.08, 0.235), (0, 0.24)], P['cap'], segs=20)
    m.done('milk', gloss, ao=0.25, shade=0.08)
    m = Mk(); m.lathe([(0, -0.17), (0.07, -0.155), (0.12, -0.1), (0.14, -0.02), (0.125, 0.07), (0.085, 0.14), (0.04, 0.175), (0, 0.18)], P['cream'], segs=28); m.done('egg', gloss, ao=0.15, shade=0.1)
    m = Mk(); wav = lambda p: P['white']
    vs = m.ball(0.27, (0, 0, -0.01), wav, (1, 1, 0.13), 32)
    for v in vs: a = math.atan2(v.co.y, v.co.x); k = 1 + 0.13 * math.sin(a * 3 + 0.6) + 0.07 * math.sin(a * 5); v.co.x *= k; v.co.y *= k
    m.ball(0.1, (0.03, -0.02, 0.02), P['yolk'], (1, 1, 0.62)); m.done('egg_fried', gloss, ao=0.2, shade=0.0)
    m = Mk(); m.lathe([(0, -0.14), (0.2, -0.14), (0.21, -0.12), (0.21, 0.05), (0, 0.05)], P['cake'], segs=30); m.lathe([(0, 0.045), (0.225, 0.04), (0.23, 0.07), (0.2, 0.1), (0, 0.105)], P['pink'], segs=30)
    for i in range(6): a = i / 6 * math.tau; m.ball(0.045, (math.cos(a) * 0.215, math.sin(a) * 0.215, 0.02), P['pink'], (1, 1, 1.3), 12)
    m.ball(0.065, (0, 0, 0.15), P['berry'], (1, 1, 1.15), 16); m.ball(0.03, (0.01, 0, 0.215), P['stem'], (1.6, 1.6, 0.4), 10)
    m.done('cake', matte, ao=0.35, shade=0.1)
    m = Mk(); m.ball(0.17, (0, 0, 0), lambda p: mix(P['lemon'], P['lemon2'], max(0, -p.z * 2.4)), (1.28, 1, 1), 28); m.ball(0.05, (0.225, 0, 0), P['lemon'], (1.2, 0.9, 0.9), 12); m.ball(0.045, (-0.225, 0, 0), P['lemon2'], (1.2, 0.9, 0.9), 12)
    m.done('lemon', gloss, ao=0.2, shade=0.1)
    m = Mk(); vs = m.lathe([(0, -0.27), (0.03, -0.25), (0.06, -0.16), (0.085, -0.02), (0.095, 0.1), (0.08, 0.17), (0.04, 0.2), (0, 0.2)], lambda p: mix(P['red2'], P['red'], min(1, (p.z + 0.27) * 3)), segs=20)
    for v in vs: v.co.x += 0.42 * (v.co.z - 0.2) ** 2 * (1 if v.co.z < 0.2 else 0)                                    # 끝이 살짝 굽는다
    m.lathe([(0, 0.19), (0.07, 0.19), (0.05, 0.225), (0.02, 0.24), (0.018, 0.33), (0, 0.335)], P['stem'], segs=12)
    for v in m.bm.verts: v.co = RY(90) @ v.co                                                                          # 눕힌다
    m.done('pepper', gloss, ao=0.2, shade=0.0)

def export():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    build(); export()

"""햄버거 재료를 블렌더로 빚는다(몬스터 식당 ② 「세상에서 가장 큰 햄버거」). 받아 온 모형 없음.
실행(화면 없이):  blender -b --python english/play/world/tools/make_burger.py   → world/assets/burger.glb
물체: bun_bottom · bun_top · patty · cheese · tomato · lettuce (가운데가 원점 · 눕혀 놓은 둥근 조각 — 반지름 약 0.42) · board(도마 — 윗면이 높이 0).
"""
import bpy, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import make_lab as M
from make_lab import Mk, rgb, mix

OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'burger.glb'))
P = {k: rgb(v) for k, v in dict(bun='#e0a04e', bun2='#f6d9a4', seed='#fff4d6', patty='#7a4326', patty2='#5a2f1a', cheese='#ffc93a', tomato='#e8402f', tomato2='#f7826a', lettuce='#7cc95a', lettuce2='#a9e07f', wood='#d2a468', wood2='#b07d45').items()}

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True); matte, gloss = M.material('burger_matte', 0.8), M.material('burger_gloss', 0.35)
    m = Mk(); m.lathe([(0, -0.09), (0.36, -0.09), (0.42, -0.05), (0.43, 0.03), (0.4, 0.085), (0, 0.09)], lambda p: P['bun2'] if p.z > 0.07 and math.hypot(p.x, p.y) < 0.39 else P['bun'], segs=36); m.done('bun_bottom', matte, ao=0.2, shade=0.1)
    m = Mk(); m.lathe([(0, -0.1), (0.4, -0.1), (0.435, -0.06), (0.42, 0.04), (0.33, 0.15), (0.18, 0.215), (0, 0.235)], lambda p: P['bun2'] if p.z < -0.085 else mix(P['bun'], P['bun2'], max(0, (p.z - 0.1) * 2.2)), segs=36)
    for i in range(11): a = i * 2.4; r = 0.08 + 0.022 * i; z = 0.228 - 0.62 * r * r * 2.1; m.ball(0.022, (math.cos(a) * r, math.sin(a) * r, z + 0.004), P['seed'], (1.5, 0.8, 0.5), 8)
    m.done('bun_top', matte, ao=0.25, shade=0.1)
    m = Mk(); vs = m.lathe([(0, -0.065), (0.37, -0.065), (0.415, -0.03), (0.415, 0.03), (0.37, 0.065), (0, 0.065)], lambda p: mix(P['patty2'], P['patty'], 0.5 + 0.5 * math.sin(p.x * 31) * math.sin(p.y * 27)), segs=40)
    for v in vs: a = math.atan2(v.co.y, v.co.x); k = 1 + 0.03 * math.sin(a * 7); v.co.x *= k; v.co.y *= k
    m.done('patty', matte, ao=0.2, shade=0.05)
    m = Mk(); vs = m.box((0.8, 0.8, 0.035), (0, 0, 0), P['cheese'], 0.012)
    m.done('cheese', gloss, ao=0.1, shade=0.0)
    m = Mk(); m.lathe([(0, -0.04), (0.34, -0.04), (0.385, -0.015), (0.385, 0.015), (0.34, 0.04), (0, 0.04)], lambda p: P['tomato'] if math.hypot(p.x, p.y) > 0.3 else P['tomato2'], segs=36)
    for i in range(5): a = i / 5 * math.tau; m.ball(0.05, (math.cos(a) * 0.19, math.sin(a) * 0.19, 0.03), P['tomato'], (1, 1.6, 0.35), 10)
    m.done('tomato', gloss, ao=0.15, shade=0.0)
    m = Mk(); vs = m.lathe([(0, 0.0), (0.2, -0.012), (0.36, 0.0), (0.46, 0.02), (0.47, 0.03), (0.36, 0.024), (0.2, 0.012), (0, 0.022)], lambda p: mix(P['lettuce'], P['lettuce2'], min(1, math.hypot(p.x, p.y) / 0.47)), segs=44)
    for v in vs: r = math.hypot(v.co.x, v.co.y); a = math.atan2(v.co.y, v.co.x); v.co.z += 0.035 * math.sin(a * 6) * (r / 0.47) ** 2; k = 1 + 0.05 * math.sin(a * 9) * (r / 0.47); v.co.x *= k; v.co.y *= k
    m.done('lettuce', matte, ao=0.1, shade=0.0)
    m = Mk(); m.box((1.5, 1.15, 0.08), (0, 0, -0.04), lambda p: mix(P['wood'], P['wood2'], 0.2 + 0.15 * math.sin(p.x * 11)), 0.03); m.box((0.34, 0.2, 0.07), (0.9, 0, -0.04), P['wood2'], 0.03); m.done('board', matte, ground=None, ao=0.2, shade=0.0)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    build()

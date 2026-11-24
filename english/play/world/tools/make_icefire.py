"""마법 연구소 「얼음과 불의 실험실」의 물건들을 블렌더로 빚는다. 받아 온 모형 없음. 빚는 틀(Mk)과 색(PAL)은 make_lab.py 것을 그대로 쓴다.
실행(화면 없이):  blender -b --python english/play/world/tools/make_icefire.py   → english/play/world/assets/icefire.glb
물체 이름이 약속이다(모두 원점에 — 놀이가 자리를 정한다):
  icewand(얼음 수정의 자루 — 수정 가운데가 원점) · gem(눈꽃 수정 — 가운데가 원점, 코드에서 얼음 재질을 입힌다)
  torch(불꽃 등의 자루와 잔 — 불꽃 가운데가 원점) · flame(눈 달린 동글동글 불꽃 — 가운데가 원점)
  dish(넓고 얕은 물그릇 — 바닥 가운데가 원점 · 안 반지름 0.8 · 물 높이 0.075)
  cone(받침 + 과자 · 과자 윗면 높이 0.5) · scoop(아이스크림 한 덩이 — 밑이 원점) · puddle(녹아 흐른 웅덩이 — 바닥이 원점)
  corn(옥수수 — 바닥 가운데가 원점 · 키 0.7) · popcorn(팝콘 한 알 — 가운데가 원점) · iceblock(고고가 갇히는 얼음 덩어리 — 바닥 가운데가 원점)
"""
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from make_lab import Mk, material, PAL, rgb, mix, RX, RY, RZ

OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'icefire.glb'))
C = {k: rgb(v) for k, v in dict(ice='#cfeeff', ice2='#58b4ee', steel='#7f8fc4', fire1='#ffe680', fire2='#ff9a2e', fire3='#f2603a', eye='#3a2030', waffle='#e3ad62', waffle2='#c98a42',
     pink='#f7a3bd', pink2='#fbc9d8', cherry='#e9483c', corn='#ffd43e', corn2='#f2b02a', husk='#8cc56a', husk2='#5cab58', puff='#fff6e2', puff2='#f3dca8', kernel='#e0a850').items()}
smooth = lambda t: max(0.0, min(1.0, t))

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    matte, gloss = material('if_matte', 0.78), material('if_gloss', 0.28)

    # ── 얼음 수정: 자루(은빛 · 하늘색 띠) + 눈꽃 수정(여섯 가지 · 가지마다 잔가지 둘)
    m = Mk(); stick = lambda p: PAL['sky'] if (-0.24 > p.z > -0.3) or (-0.72 > p.z > -0.78) else C['steel']
    m.lathe([(0, -0.82), (0.03, -0.81), (0.036, -0.76), (0.026, -0.72), (0.022, -0.3), (0.05, -0.27), (0.05, -0.23), (0, -0.21)], stick, segs=14)
    m.done('icewand', gloss, ao=0.25, shade=0.0)
    m = Mk(); icy = lambda p: mix(C['ice2'], C['ice'], smooth(p.length / 0.3))
    m.lathe([(0, -0.14), (0.085, -0.05), (0.1, 0.0), (0.085, 0.05), (0, 0.14)], icy, segs=6, rot=RX(90))                   # 가운데 알(납작한 여섯모)
    for i in range(6):
        R = RY(i * 60); m.lathe([(0, 0.04), (0.048, 0.13), (0.034, 0.25), (0, 0.36)], icy, segs=5, rot=R)
        for sd in (-1, 1): m.lathe([(0, 0), (0.024, 0.04), (0, 0.13)], icy, at=R @ Vector((0, 0, 0.19)), segs=4, rot=RY(i * 60 + sd * 52))
    m.done('gem', gloss, ao=0.15, shade=0.0)

    # ── 불꽃 등: 자루 + 금빛 잔 · 불꽃(아래는 노랗고 끝은 붉다 · 까만 눈 둘)
    m = Mk(); stick = lambda p: PAL['gold'] if (-0.3 > p.z > -0.36) or (-0.72 > p.z > -0.78) else PAL['wood3']
    m.lathe([(0, -0.82), (0.034, -0.81), (0.04, -0.76), (0.03, -0.72), (0.026, -0.32), (0.05, -0.28), (0, -0.27)], stick, segs=14)
    m.lathe([(0, -0.29), (0.05, -0.29), (0.15, -0.15), (0.185, -0.12), (0.185, -0.1), (0.15, -0.1), (0.06, -0.2), (0, -0.2)], PAL['gold'], segs=24)
    m.done('torch', gloss, ao=0.3, shade=0.0)
    m = Mk(); fl = lambda p: mix(mix(C['fire1'], C['fire2'], smooth((p.z + 0.08) / 0.2)), C['fire3'], smooth((p.z - 0.13) / 0.16))
    m.lathe([(0, -0.16), (0.08, -0.14), (0.15, -0.05), (0.155, 0.02), (0.125, 0.1), (0.07, 0.18), (0.028, 0.25), (0, 0.3)], fl, segs=24)
    for sx in (-1, 1): m.ball(0.026, (sx * 0.055, -0.14, 0.0), C['eye'], (1, 0.6, 1.25), 10); m.ball(0.009, (sx * 0.055 - 0.008, -0.158, 0.012), PAL['white'], segs=6)
    m.done('flame', matte, ao=0.0, shade=0.0)

    # ── 물그릇: 넓고 얕다(고고가 걸어 들어간다). 테두리는 크림색, 바깥은 하늘색 띠
    m = Mk(); dish = lambda p: PAL['cream'] if p.z > 0.085 or math.hypot(p.x, p.y) < 0.82 else PAL['sky']
    m.lathe([(0, 0), (0.8, 0), (0.87, 0.03), (0.895, 0.1), (0.875, 0.12), (0.84, 0.11), (0.81, 0.04), (0.76, 0.03), (0, 0.03)], dish, segs=56)
    m.done('dish', gloss, ground=0, ao=0.35)

    # ── 아이스크림: 받침 + 과자(격자 무늬) / 덩이(밑에 주름 · 위에 체리) / 녹아 흐른 웅덩이
    m = Mk(); waf = lambda p: C['waffle2'] if (math.sin(math.atan2(p.y, p.x) * 9 + p.z * 26) > 0.72 or math.sin(math.atan2(p.y, p.x) * 9 - p.z * 26) > 0.72) else C['waffle']
    m.lathe([(0, 0), (0.2, 0), (0.22, 0.03), (0.2, 0.06), (0.09, 0.09), (0.075, 0.2), (0.1, 0.23), (0.1, 0.25), (0.06, 0.25), (0, 0.24)], PAL['purple'], segs=24)
    m.lathe([(0, 0.1), (0.035, 0.1), (0.17, 0.5), (0.185, 0.5), (0.185, 0.53), (0.15, 0.53), (0, 0.5)], waf, segs=28)
    m.done('cone', matte, ground=0)
    m = Mk(); sc = lambda p: mix(C['pink'], C['pink2'], smooth((p.z - 0.1) / 0.3))
    m.ball(0.225, (0, 0, 0.16), sc, (1, 1, 0.9), 28)
    for i in range(9): a = i / 9 * math.tau; m.ball(0.075, (math.cos(a) * 0.185, math.sin(a) * 0.185, 0.03), C['pink2'], (1, 1, 0.8), 12)   # 주름
    m.ball(0.06, (0.02, 0, 0.385), C['cherry'], segs=14); m.lathe([(0, 0), (0.008, 0), (0.008, 0.1), (0, 0.1)], PAL['stem'], (0.02, 0, 0.43), 6, RY(18))
    m.done('scoop', gloss, ao=0.4)
    m = Mk()
    for x, y, r, k in ((0, -0.2, 0.34, 0.85), (0.27, -0.3, 0.17, 1), (-0.25, -0.1, 0.16, 1), (0.08, -0.5, 0.11, 1), (-0.12, -0.46, 0.13, 0.9), (0, 0, 0.22, 1)): m.ball(r, (x, y, 0.004), C['pink'], (1, k, 0.1), 20)
    m.done('puddle', gloss, ao=0.0, shade=0.0)

    # ── 옥수수(알알이 두 빛깔 · 밑은 껍질 잎) · 팝콘 한 알
    m = Mk(); prof = [(0, 0.05), (0.09, 0.06), (0.14, 0.16), (0.155, 0.33), (0.14, 0.5), (0.1, 0.62), (0.045, 0.685), (0, 0.7)]
    m.lathe(prof, C['corn2'], segs=28)
    def rad(z):                                                   # 그 높이에서의 몸통 반지름
        for (r0, z0), (r1, z1) in zip(prof, prof[1:]):
            if z0 <= z <= z1: return r0 + (r1 - r0) * (z - z0) / max(z1 - z0, 1e-6)
        return 0
    for row in range(10):                                          # 알알이 박힌 낟알(줄마다 반 칸 어긋나게)
        z = 0.2 + row * 0.048; r = rad(z); n = 12 if row < 7 else 9 if row < 9 else 6
        for j in range(n):
            a = (j + 0.5 * (row % 2)) / n * math.tau; m.ball(0.036, (math.cos(a) * r, math.sin(a) * r, z), mix(C['corn'], C['corn2'], 0.35 * ((j + row) % 2)), (1, 1, 0.8), 8)
    for i in range(5):
        a = i / 5 * math.tau + 0.3; m.ball(0.1, (math.cos(a) * 0.17, math.sin(a) * 0.17, 0.12), lambda p: mix(C['husk2'], C['husk'], smooth(p.z / 0.26)), (0.8, 0.8, 1.35 if i % 2 else 1.1), 14)
    m.lathe([(0, 0), (0.19, 0), (0.22, 0.03), (0.17, 0.07), (0, 0.07)], C['husk2'], segs=20)
    m.done('corn', gloss, ground=0, ao=0.4)
    m = Mk(); m.ball(0.045, (0, 0, -0.02), C['kernel'], segs=10)
    for x, y, z, r in ((0.05, 0, 0.03, 0.06), (-0.045, 0.02, 0.035, 0.058), (0, -0.05, 0.02, 0.05), (0.0, 0.045, 0.045, 0.052), (0.01, 0, 0.075, 0.05)): m.ball(r, (x, y, z), lambda p: mix(C['puff2'], C['puff'], smooth((p.z + 0.02) / 0.08)), segs=12)
    m.done('popcorn', matte, ao=0.35, shade=0.0)

    # ── 얼음 덩어리(둥근 모서리 — 코드에서 투명한 얼음 재질을 입힌다)
    m = Mk(); m.box((1.0, 0.92, 1.3), (0, 0, 0.65), C['ice'], 0.16); m.done('iceblock', gloss, ao=0.0, shade=0.0)

def export():
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    build(); export()

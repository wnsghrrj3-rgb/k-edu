"""마법 연구소 · 자리 ④ 「얼음과 불」의 가구를 블렌더로 빚는다(연구소 설계 v1 · 묶음 3-3). 받아 온 모형 없음. 빚는 틀(Mk)과 색(PAL)은 make_lab.py 것을 그대로 쓴다.
실행(화면 없이):  blender -b --python english/play/world/tools/make_lab_frost.py   → english/play/world/assets/lab_frost.glb (450KB 아래)
물체 이름이 약속이다(모두 원점에 — 놀이 stations/frost.js 가 자리를 정한다):
  cloud(눈구름 — 가운데가 원점 · 눈 둘과 볼) · lamp(햇살 등의 갓과 고리 — 해 가운데가 원점) · sun(해 — 얼굴과 햇살 여덟. 코드에서 스스로 빛나는 재질을 입힌다)
  hookL · hookR(걸이 — 기둥 밑이 원점. 팔 끝이 안쪽 앞으로 0.55 · 1.1 나와 있고 높이 2.2) · stove(작은 난로 — 바닥 가운데가 원점) · stoveGlow(난로 창 — 코드에서 빛난다)
  bowl(물 대접 — 바닥 가운데가 원점 · 테두리 반지름 0.5 · 물 높이 0.2) · icecube(대접에서 언 얼음덩이 — 바닥이 원점) · hatch(가운데 뚜껑문 — 실험대 윗면에 놓인다)
  plate(옥수수 접시 — 바닥 가운데가 원점) · kernels(접시 위 옥수수 알 무더기) · popcorn(팝콘 한 알 — 가운데가 원점)
  snowpile(눈 더미 — 바닥이 원점 · 반지름 0.45) · snowball(눈 덩이 — 가운데가 원점 · 반지름 1, 코드에서 줄여 쓴다) · snowface(눈사람 얼굴 — 반지름 1 머리에 맞춘 당근 코 · 눈 · 입)
  block(고고가 갇히는 얼음 조각 — 바닥 가운데가 원점. 코드에서 투명한 얼음 재질을 입힌다)
"""
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from make_lab import Mk, material, PAL, rgb, mix, RX, RY, RZ

OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'lab_frost.glb'))
C = {k: rgb(v) for k, v in dict(ice='#dff3ff', ice2='#8fd0ff', snow='#ffffff', snow2='#cfe2f6', cloud2='#b7cdea', iron='#3d384c', iron2='#211e2b', sunY='#ffe680', sunO='#ffab3d', eye='#3a2a40', cheek='#f7a3bd',
     corn='#ffd43e', corn2='#f2b02a', puff='#fff6e2', puff2='#f3dca8', kernel='#e0a850', carrot='#ff8a3a', rope='#c9a271').items()}
smooth = lambda t: max(0.0, min(1.0, t))

def hook(name, sx, matte):
    """걸이: 기둥 + 안쪽 앞으로 뻗은 팔 + 끝의 줄과 고리. sx = 팔이 뻗는 쪽(+1 = 오른쪽으로 — 왼쪽 걸이)."""
    m = Mk(); ax, ay, top = 0.55 * sx, -1.1, 2.2; L = math.hypot(ax, ay); deg = math.degrees(math.atan2(ay, ax))
    m.lathe([(0, 0), (0.16, 0), (0.17, 0.04), (0.07, 0.1), (0.045, 0.16), (0.04, top), (0.055, top + 0.03), (0.055, top + 0.09), (0, top + 0.11)], lambda p: PAL['wood3'] if p.z < 0.12 else PAL['wood2'], segs=14)
    m.box((L + 0.1, 0.07, 0.07), (ax / 2, ay / 2, top + 0.02), PAL['wood2'], 0.02, RZ(deg))
    m.box((0.5, 0.05, 0.05), (ax * 0.2, ay * 0.2, top - 0.17), PAL['wood3'], 0.015, RZ(deg) @ RY(-42 * 1))            # 버팀목
    m.lathe([(0, 0), (0.012, 0), (0.012, 0.2), (0, 0.2)], C['rope'], (ax, ay, top - 0.2), 6)                          # 줄
    m.torus(0.045, 0.014, (ax, ay, top - 0.24), PAL['gold'], rot=RX(0), segs=14, tube=6)
    m.done(name, matte, ground=0, ao=0.35)

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    matte, gloss = material('frost_matte', 0.82), material('frost_gloss', 0.3)

    # ── 눈구름: 몽글몽글한 흰 덩어리(밑은 푸르스름) · 까만 눈 둘과 분홍 볼 — 겁나는 구름이 아니라 졸린 친구
    m = Mk(); cl = lambda p: mix(C['cloud2'], C['snow'], smooth((p.z + 0.22) / 0.3))
    for x, z, r, k in ((0, 0, 0.3, 0.86), (-0.31, -0.04, 0.22, 0.9), (0.31, -0.05, 0.2, 0.9), (-0.14, 0.15, 0.22, 0.95), (0.13, 0.17, 0.21, 0.95), (-0.46, -0.09, 0.13, 1), (0.45, -0.1, 0.12, 1)):
        m.ball(r, (x, 0, z), cl, (1, k, 0.92), 18)
    for sx in (-1, 1):
        m.ball(0.034, (sx * 0.11, -0.262, 0.0), C['eye'], (1, 0.5, 1.25), 10); m.ball(0.011, (sx * 0.11 - 0.01, -0.283, 0.016), PAL['white'], segs=6)
        m.ball(0.04, (sx * 0.2, -0.245, -0.06), C['cheek'], (1.2, 0.35, 0.7), 8)
    m.done('cloud', matte, ao=0.3, shade=0.0)

    # ── 햇살 등: 금빛 갓과 고리 / 해(웃는 얼굴 · 햇살 여덟 — 코드에서 스스로 빛난다)
    m = Mk()
    m.torus(0.05, 0.015, (0, 0, 0.36), PAL['gold'], rot=RX(0), segs=14, tube=6)
    m.lathe([(0, 0.32), (0.04, 0.32), (0.07, 0.27), (0.25, 0.17), (0.27, 0.14), (0.24, 0.14), (0.06, 0.23), (0, 0.24)], lambda p: PAL['gold'] if p.z > 0.16 else PAL['wood3'], segs=24)
    m.done('lamp', gloss, ao=0.3, shade=0.0)
    m = Mk(); sunc = lambda p: mix(C['sunO'], C['sunY'], smooth(1.25 - math.hypot(p.x, p.z) / 0.2))
    m.ball(0.2, (0, 0, 0), sunc, (1, 0.8, 1), 22)
    for i in range(8):
        R = RY(i * 45); m.lathe([(0, 0), (0.05, 0.015), (0.03, 0.07), (0, 0.13)], C['sunO'], at=R @ Vector((0, 0, 0.21)), segs=6, rot=R)
    for sx in (-1, 1): m.ball(0.026, (sx * 0.07, -0.152, 0.03), C['eye'], (1, 0.5, 1.3), 8); m.ball(0.03, (sx * 0.115, -0.135, -0.035), C['cheek'], (1.2, 0.35, 0.7), 8)
    m.torus(0.035, 0.009, (0, -0.158, -0.02), C['eye'], arc=math.pi, rot=RY(180), segs=8, tube=5)                    # 웃는 입
    m.done('sun', matte, ao=0.0, shade=0.0)

    hook('hookL', 1, matte); hook('hookR', -1, matte)

    # ── 작은 난로: 배불뚝이 몸 · 세 발 · 굴뚝 / 창(코드에서 타닥타닥 빛난다)
    m = Mk(); body = lambda p: PAL['gold'] if (0.115 < p.z < 0.14 or 0.5 < p.z < 0.53) else mix(C['iron2'], C['iron'], smooth(p.z / 0.5))
    m.lathe([(0, 0.07), (0.2, 0.07), (0.27, 0.13), (0.3, 0.3), (0.27, 0.46), (0.2, 0.53), (0.09, 0.56), (0.075, 0.6), (0.075, 0.95), (0.1, 0.96), (0.1, 1.0), (0, 1.0)], body, segs=24)
    for i in range(3): a = math.radians(90 + i * 120); m.lathe([(0, 0), (0.03, 0), (0.045, 0.1), (0, 0.11)], C['iron2'], (math.cos(a) * 0.19, math.sin(a) * 0.19, 0), 8)
    m.torus(0.13, 0.022, (0, -0.265, 0.29), PAL['gold'], rot=RX(0), segs=18, tube=6)                                # 창틀
    m.done('stove', matte, ground=0, ao=0.4)
    m = Mk(); m.ball(0.125, (0, -0.262, 0.29), C['sunO'], (1, 0.3, 1), 14); m.done('stoveGlow', matte, ao=0.0, shade=0.0)

    # ── 물 대접(크림색 · 하늘색 띠) / 얼음덩이(모난 덩어리 — 대접에서 꺼낼 수 있다) / 뚜껑문
    m = Mk(); bw = lambda p: PAL['sky'] if 0.1 < p.z < 0.17 and math.hypot(p.x, p.y) > 0.44 else PAL['cream']
    m.lathe([(0, 0), (0.3, 0), (0.42, 0.05), (0.5, 0.2), (0.505, 0.25), (0.48, 0.26), (0.455, 0.23), (0.39, 0.09), (0.28, 0.055), (0, 0.05)], bw, segs=44)
    m.done('bowl', gloss, ground=0, ao=0.35)
    m = Mk(); m.lathe([(0, 0.06), (0.27, 0.06), (0.38, 0.11), (0.43, 0.2), (0.4, 0.3), (0.27, 0.37), (0, 0.39)], lambda p: mix(C['ice2'], C['ice'], smooth(p.z / 0.3)), segs=9)
    m.done('icecube', gloss, ao=0.0, shade=0.0)
    m = Mk(); m.lathe([(0, 0.006), (0.56, 0.006), (0.58, 0.012), (0.63, 0.012), (0.65, 0)], lambda p: PAL['wood3'] if math.hypot(p.x, p.y) > 0.57 else mix(PAL['wood'], PAL['wood2'], 0.5 + 0.2 * math.sin(p.x * 14)), segs=36)
    m.done('hatch', matte, ao=0.0, shade=0.0)

    # ── 옥수수 접시 / 알 무더기 / 팝콘 한 알
    m = Mk(); m.lathe([(0, 0), (0.2, 0), (0.33, 0.035), (0.35, 0.05), (0.33, 0.06), (0.2, 0.035), (0, 0.03)], lambda p: PAL['coral'] if math.hypot(p.x, p.y) > 0.29 else PAL['cream'], segs=30)
    m.done('plate', gloss, ground=0, ao=0.3)
    m = Mk()
    for i, (x, y, z) in enumerate(((0, 0, 0.06), (0.09, 0.02, 0.058), (-0.09, 0.03, 0.058), (0.03, -0.09, 0.058), (-0.05, -0.08, 0.058), (0.05, 0.1, 0.058), (-0.04, 0.1, 0.058), (0.02, 0.02, 0.115), (-0.03, -0.02, 0.112))):
        m.ball(0.052, (x, y, z), mix(C['corn'], C['corn2'], 0.5 * (i % 2)), (1, 0.85, 0.8), 10)
    m.done('kernels', gloss, ao=0.35, shade=0.0)
    m = Mk(); m.ball(0.06, (0, 0, -0.03), C['kernel'], segs=10)
    for x, y, z, r in ((0.07, 0, 0.04, 0.085), (-0.065, 0.03, 0.05, 0.08), (0, -0.07, 0.03, 0.07), (0.0, 0.065, 0.065, 0.075), (0.015, 0, 0.105, 0.07)): m.ball(r, (x, y, z), lambda p: mix(C['puff2'], C['puff'], smooth((p.z + 0.02) / 0.1)), segs=10)
    m.done('popcorn', matte, ao=0.35, shade=0.0)

    # ── 눈 더미 / 눈 덩이(반지름 1) / 눈사람 얼굴(반지름 1 머리에 맞춤 — 앞이 -y)
    m = Mk(); sn = lambda p: mix(C['snow2'], C['snow'], smooth(p.z / 0.2))
    m.lathe([(0, 0.3), (0.16, 0.28), (0.32, 0.18), (0.42, 0.07), (0.46, 0)], sn, segs=22)
    for x, y, r in ((0.3, 0.12, 0.14), (-0.28, -0.14, 0.15), (-0.1, 0.3, 0.12), (0.12, -0.3, 0.13)): m.ball(r, (x, y, 0.03), sn, (1, 1, 0.7), 12)
    m.done('snowpile', matte, ground=0, ao=0.25, shade=0.0)
    m = Mk(); m.ball(1.0, (0, 0, 0), lambda p: mix(C['snow2'], C['snow'], smooth((p.z + 0.9) / 1.2)), segs=22); m.done('snowball', matte, ao=0.0, shade=0.0)
    m = Mk(); m.lathe([(0, 0.9), (0.15, 0.92), (0.09, 1.25), (0, 1.5)], C['carrot'], segs=10, rot=RX(90))
    for sx in (-1, 1): m.ball(0.095, (sx * 0.33, -0.86, 0.33), C['eye'], segs=8)
    for i in range(5): a = math.radians(-36 + i * 18); m.ball(0.05, (math.sin(a) * 0.62, -math.sqrt(max(0.0, 1 - (math.sin(a) * 0.62) ** 2 - 0.36 ** 2)) + 0.02, -0.36 + 0.07 * abs(i - 2)), C['eye'], segs=6)
    m.done('snowface', matte, ao=0.0, shade=0.0)

    # ── 얼음 조각(둥근 모서리 덩어리)
    m = Mk(); m.box((1.0, 0.92, 1.3), (0, 0, 0.65), C['ice'], 0.16); m.done('block', gloss, ao=0.0, shade=0.0)

def export():
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=False, export_animations=False, export_vertex_color='ACTIVE', export_all_vertex_colors=False)
    print('EXPORTED', OUT, os.path.getsize(OUT), 'bytes')

if __name__ == '__main__':
    build(); export()

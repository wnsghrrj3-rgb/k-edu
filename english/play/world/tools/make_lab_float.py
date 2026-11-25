"""마법 연구소 · 자리 ② 「둥둥 띄우기」(Up · Down)가 꺼내 놓는 것들을 블렌더로 빚는다(연구소 설계 v1 · 묶음 3-1). 받아 온 모형 없음.
실행(화면 없이):  blender -b --python english/play/world/tools/make_lab_float.py   → world/assets/lab_float.glb
물체(이름이 약속이다 — 전부 원점에, 놀이 zones/lab/stations/float.js 가 자리를 정한다):
  bottle     방울병(바닥 가운데가 원점 · 병 키 0.46 · 마개에 꽂힌 방울 고리까지 0.78)
  beam       천장 들보(아랫면 가운데가 원점 · 길이 8.8 · 양 끝의 기둥이 위로 6 — 세로 화면에서도 끝이 안 보이게)
  lamp       매달린 등(들보에 거는 고리가 원점 · 아래로 줄 → 갓 → 고고가 붙잡는 손잡이 고리. 고리 가운데까지 LAMP_DROP = 1.02)
  lamp_bulb  등의 불빛 알(lamp 와 같은 원점 — 코드에서 스스로 빛나게 한다)
  shelf      높은 선반과 그 위 물건(로켓 · 책 · 풍선). 벽에 닿는 뒤쪽 가운데 · 선반 윗면이 원점
  win_sky    열린 창 너머의 하늘(창 가운데가 원점 · 반지름 0.87 · 구름 셋)
  win_L · win_R  여닫이 창짝(돌쩌귀 = 바깥쪽 끝이 원점. 닫히면 반달 둘이 둥근 창을 덮는다)
  star       어지러울 때 머리 위를 도는 작은 별(가운데가 원점)
방 · 실험대 · 물건 넷은 lab.glb(make_lab.py)의 것을 그대로 쓴다. 색도 그 PAL 을 쓴다. 둥근 창의 치수(가운데 높이 2.55 · 반지름 0.95)는 make_lab.py 와 맞춘다.
좌표: 블렌더 z 위 · 앞 -y → 내보내면 y 위 · 앞 +z.
"""
import bpy, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import make_lab as M
from make_lab import Mk, PAL, rgb, mix, RX, RY, RZ

OUT = os.path.normpath(os.path.join(HERE, '..', 'assets', 'lab_float.glb'))
P = {k: rgb(v) for k, v in dict(soap='#ff9fc4', soap2='#ffc4dc', iron='#5a4a6a', shade='#f29a83', shade2='#ffd9a0', bulb='#fff3b0', sky1='#6fb8ee', sky2='#cfeaff', cloud='#ffffff', pane='#dcebf2', rocket='#f7ebd5', balloon='#f29a83').items()}
WIN_R = 0.87             # 창짝이 덮는 반지름(방의 창틀 안쪽 — make_lab 의 창틀은 반지름 0.95 · 굵기 0.1)
LAMP_DROP = 1.02         # 등의 고리(원점)에서 손잡이 고리 가운데까지(float.js 의 T.LAMP.DROP 과 맞춘다)

def half_disc(m, side, col, y0=-0.018, y1=0.018, n=20):
    """반달 판(창유리). side = -1 왼쪽 · +1 오른쪽. 창 가운데가 원점인 좌표로 만든다."""
    pts = [Vector((side * WIN_R * 0.97 * math.sin(i / n * math.pi), 0, WIN_R * 0.97 * math.cos(i / n * math.pi))) for i in range(n + 1)]
    f = [m.bm.verts.new(p + Vector((0, y0, 0))) for p in pts]; b = [m.bm.verts.new(p + Vector((0, y1, 0))) for p in pts]
    cf = m.bm.verts.new((0, y0, 0)); cb = m.bm.verts.new((0, y1, 0))
    for i in range(n):
        m.bm.faces.new((cf, f[i], f[i + 1]) if side < 0 else (cf, f[i + 1], f[i])); m.bm.faces.new((cb, b[i + 1], b[i]) if side < 0 else (cb, b[i], b[i + 1]))
    m._paint(f + b + [cf, cb], col)

def shift(m, dx):
    """지금까지 얹은 조각을 통째로 옆으로 옮긴다(돌쩌귀가 원점이 되게)."""
    for v in m.bm.verts: v.co.x += dx

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True); matte, gloss = M.material('labfloat_matte', 0.78), M.material('labfloat_gloss', 0.28)

    # ── 방울병: 통통한 유리병에 분홍 비눗물 · 코르크 마개 · 마개에 꽂힌 방울 고리(하늘빛) · 입가에 묻은 작은 방울
    m = Mk(); glass = lambda p: mix(P['soap'], P['soap2'], max(0.0, p.z / 0.24)) if p.z < 0.245 else PAL['glass']
    m.lathe([(0, 0), (0.13, 0), (0.175, 0.035), (0.195, 0.15), (0.175, 0.265), (0.09, 0.345), (0.07, 0.4), (0.088, 0.415), (0.088, 0.435), (0, 0.435)], glass, segs=24)
    m.lathe([(0, 0), (0.062, 0), (0.07, 0.05), (0, 0.055)], PAL['wood2'], (0, 0, 0.43), 14)                         # 마개
    m.lathe([(0, 0), (0.013, 0), (0.013, 0.15), (0, 0.15)], PAL['sky'], (0, 0, 0.48), 8)                            # 고리 자루
    m.torus(0.085, 0.016, (0, 0, 0.705), PAL['sky'], segs=20, tube=8)                                                # 방울 고리(앞을 본다)
    m.box((0.2, 0.012, 0.085), (0, -0.19, 0.14), PAL['cream'], 0.02)                                                # 딱지
    m.ball(0.022, (0, -0.2, 0.14), P['soap'], (1, 0.4, 1), 10); m.ball(0.014, (0.05, -0.2, 0.155), PAL['sky'], (1, 0.4, 1), 8); m.ball(0.012, (-0.045, -0.2, 0.125), PAL['sun'], (1, 0.4, 1), 8)
    for x, y, z, r in ((0.075, -0.03, 0.455, 0.03), (-0.06, -0.05, 0.47, 0.022), (0.02, 0.07, 0.462, 0.018)): m.ball(r, (x, y, z), PAL['white'], segs=10)
    m.done('bottle', gloss, ground=0, ao=0.35, shade=0.08)

    # ── 천장 들보: 굵은 나무 들보 · 쇠 띠 · 위로 뻗은 기둥 둘
    m = Mk(); grain = lambda p: mix(PAL['wood2'], PAL['wood3'], 0.25 + 0.2 * math.sin(p.x * 5.0) * math.sin(p.x * 1.7 + p.z * 8.0))
    m.box((8.8, 0.36, 0.32), (0, 0, 0.16), grain, 0.05)
    for x in (-3.55, 3.55):
        m.box((0.2, 0.3, 6.0), (x, 0.02, 0.3 + 3.0), PAL['wood3'], 0.04); m.box((0.3, 0.42, 0.12), (x, 0, 0.16), P['iron'], 0.025)
    for x in (-1.6, 0, 1.6): m.box((0.1, 0.4, 0.36), (x, 0, 0.16), P['iron'], 0.02)
    m.done('beam', matte, ao=0.4, shade=0.0)

    # ── 매달린 등: 고리 · 줄 · 꼭지 · 줄무늬 갓 · 손잡이 고리(고고가 붙잡는다)
    m = Mk(); stripes = lambda p: P['shade'] if int((math.atan2(p.y, p.x) / math.tau + 0.5) * 8) % 2 == 0 else P['shade2']
    m.torus(0.05, 0.014, (0, 0, -0.05), P['iron'], segs=14, tube=6)
    m.lathe([(0, 0), (0.012, 0), (0.012, 0.42), (0, 0.42)], P['iron'], (0, 0, -0.52), 6)
    m.lathe([(0, 0), (0.05, 0), (0.075, -0.07), (0, -0.07)][::-1], PAL['gold'], (0, 0, -0.5), 14)
    m.lathe([(0.06, -0.56), (0.13, -0.6), (0.27, -0.76), (0.31, -0.84), (0.325, -0.86), (0.31, -0.875), (0.25, -0.79), (0.11, -0.63), (0.05, -0.6)], stripes, segs=32)
    m.lathe([(0, 0), (0.011, 0), (0.011, 0.1), (0, 0.1)], P['iron'], (0, 0, -1.0), 6)
    m.torus(0.07, 0.017, (0, 0, -LAMP_DROP - 0.05), PAL['gold'], segs=16, tube=8)
    m.done('lamp', gloss, ao=0.3, shade=0.0)
    m = Mk(); m.ball(0.125, (0, 0, -0.8), lambda p: mix(P['bulb'], PAL['white'], 0.4), (1, 1, 1.15), 18); m.done('lamp_bulb', gloss, ao=0.0, shade=0.0)

    # ── 높은 선반(벽 쪽 +y 가 뒤): 판 · 받침 둘 · 로켓 · 책 둘 · 줄에 매인 풍선
    m = Mk(); w = 1.8
    m.box((w, 0.44, 0.09), (0, -0.22, -0.045), PAL['wood2'], 0.03)
    for sx in (-w / 2 + 0.22, w / 2 - 0.22): m.box((0.08, 0.3, 0.26), (sx, -0.14, -0.2), PAL['wood3'], 0.02)
    rk = (-0.52, -0.22, 0.0); body = lambda p: PAL['red'] if p.z > 0.44 else (PAL['sky'] if 0.14 < p.z < 0.19 else P['rocket'])
    m.lathe([(0, 0.06), (0.08, 0.06), (0.125, 0.14), (0.14, 0.28), (0.125, 0.42), (0.07, 0.56), (0.02, 0.63), (0, 0.64)], body, rk, 20)
    m.ball(0.05, (rk[0], rk[1] - 0.125, 0.33), PAL['sky'], (1, 0.5, 1), 12); m.torus(0.052, 0.012, (rk[0], rk[1] - 0.13, 0.33), PAL['gold'], segs=14, tube=6)
    for a in (90, 210, 330): m.box((0.03, 0.13, 0.2), (rk[0] + math.cos(math.radians(a)) * 0.15, rk[1] + math.sin(math.radians(a)) * 0.15, 0.1), PAL['coral'], 0.012, RZ(a - 90))
    for i, (c, bw, h, d) in enumerate(((PAL['book2'], 0.5, 0.1, 6), (PAL['book1'], 0.44, 0.09, -8))):
        z = (0.05, 0.145)[i]; m.box((bw, 0.34, h), (0.12, -0.23, z), c, 0.015, RZ(d)); m.box((bw - 0.04, 0.31, h - 0.03), (0.12, -0.255, z), PAL['page'], 0.0, RZ(d))
    bx = 0.62; m.lathe([(0, 0), (0.05, 0), (0.06, 0.03), (0.04, 0.05), (0, 0.05)], PAL['purple'], (bx, -0.22, 0), 12)   # 풍선 추
    m.lathe([(0, 0), (0.006, 0), (0.006, 0.42), (0, 0.42)], PAL['cream'], (bx, -0.22, 0.04), 5, RY(7))
    m.ball(0.19, (bx + 0.07, -0.22, 0.66), lambda p: mix(P['balloon'], PAL['red2'], max(0.0, (p.z - 0.6) / 0.3)), (1, 0.95, 1.18), 20); m.lathe([(0, 0), (0.03, 0), (0.012, 0.035), (0, 0.035)], P['balloon'], (bx + 0.055, -0.22, 0.42), 8)
    m.done('shelf', matte, ao=0.45, shade=0.0)

    # ── 열린 창 너머: 하늘 원반(위가 짙다) + 구름 셋
    m = Mk(); m.lathe([(0, 0), (WIN_R * 0.5, 0), (WIN_R, 0)], lambda p: mix(P['sky2'], P['sky1'], min(1.0, max(0.0, (p.z + WIN_R) / (2 * WIN_R)))), (0, 0, 0), 40, RX(90))
    for x, z, s in ((-0.3, 0.28, 1.0), (0.32, -0.12, 0.8), (-0.12, -0.42, 0.62)):
        for dx, r in ((-0.15, 0.1), (0, 0.14), (0.16, 0.105)): m.ball(r * s, (x + dx * s, -0.012, z + (0.03 if dx == 0 else 0) * s), P['cloud'], (1, 0.12, 0.8), 12)
    m.done('win_sky', matte, ao=0.0, shade=0.0)

    # ── 여닫이 창짝 둘(반달): 유리 + 나무 테 + 가운데 살 + 가로 살 + 손잡이. 돌쩌귀(바깥쪽 끝)가 원점
    for name, side in (('win_L', -1), ('win_R', 1)):
        m = Mk(); half_disc(m, side, lambda p: mix(P['pane'], PAL['white'], 0.25 + 0.3 * (p.z + WIN_R) / (2 * WIN_R)))
        m.torus(WIN_R, 0.05, (0, 0, 0), PAL['wood2'], arc=math.pi, rot=RY(-90 * -side), segs=20, tube=8)
        m.box((0.06, 0.075, WIN_R * 2), (side * 0.032, -0.005, 0), PAL['wood2'], 0.02); m.box((WIN_R, 0.065, 0.06), (side * WIN_R / 2, -0.005, 0), PAL['wood2'], 0.02)
        m.ball(0.04, (side * 0.11, -0.06, -0.14), PAL['gold'], segs=10)
        shift(m, -side * WIN_R); m.done(name, matte, ao=0.25, shade=0.0)

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

"""케이월드 사람 — 부분별로 만들어 people.glb 로 내보낸다. kit.js people() 이 조립하고 팔다리를 돌린다.
돌림 중심(three 좌표): 다리 (±0.17, 0.62, 0) · 팔 (±0.46, 1.28, 0). 키는 예전 네모 사람과 같다(머리 가운데 1.66).
tint_skin · tint_shirt · tint_pants · tint_hair 는 장면이 색을 정한다."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *

reset()
for n, c in [('tint_skin', 0xffffff), ('tint_shirt', 0xffffff), ('tint_pants', 0xffffff), ('tint_hair', 0xffffff), ('ink', 0x2b2118), ('mouth', 0x8a4a3a), ('white', 0xffffff), ('blush', 0xf0a090), ('trim', 0xf4efe2), ('shoe', 0xc8a868), ('gat', 0x18181c), ('gat_sheer', 0x1c1c22), ('felt', 0x1c1c26), ('red', 0xd8402e), ('straw', 0xd8b76a), ('cloth', 0xf0ece0)]:
    mat(n, c)

# 머리
b = B()
b.box((0.54, 0.5, 0.52), (0, 0, 1.66), 'tint_skin', bevel=0.13, bseg=2, jit=0.0)
for s in (-1, 1):
    b.ball(0.07, (s * 0.268, -0.06, 1.63), 'tint_skin', sub=1, scale=(0.5, 0.9, 1.15), tone=0.94, jit=0)
    b.ball(0.05, (s * 0.115, -0.247, 1.685), 'ink', sub=2, scale=(1, 0.35, 1.3), jit=0)
    b.ball(0.016, (s * 0.115 - 0.018, -0.268, 1.712), 'white', sub=1, jit=0)
    b.ball(0.062, (s * 0.19, -0.238, 1.595), 'blush', sub=1, scale=(1, 0.2, 0.7), jit=0)
b.ball(0.034, (0, -0.262, 1.63), 'tint_skin', sub=1, tone=0.95, jit=0)
b.box((0.085, 0.02, 0.024), (0, -0.252, 1.552), 'mouth', bevel=0.008, jit=0)
b.cone(0.12, 0.13, 0.1, (0, 0, 1.38), 'tint_skin', seg=8, tone=0.9, jit=0)
b.done('head', shade=(0.9, 1.04), under=0.12)

b = B()
for s in (-1, 1):
    b.box((0.14, 0.03, 0.034), (s * 0.115, -0.258, 1.775), 'ink', rot=(0, s * 0.32, 0), jit=0)
b.done('brow_stern', shade=(1, 1), under=0)


def dome(b, m, r=0.3, top=1.975, base=1.74, tone=1.0):
    def lift(v):
        if v.z < base + 0.05:
            v.z += 0.1 * max(0.0, min(1.0, -v.y / r))
        return v
    b.lathe([(r, base), (r + 0.006, base + 0.07), (r * 0.9, base + 0.15), (r * 0.6, top - 0.03), (0.03, top)], (0, 0.012, 0), m, seg=12, f=lift, tone=tone, jit=0.03)


b = B()
dome(b, 'tint_hair')
b.box((0.5, 0.13, 0.3), (0, 0.205, 1.62), 'tint_hair', bevel=0.05, bseg=2, jit=0.03)
for s in (-1, 1):
    b.box((0.06, 0.27, 0.26), (s * 0.268, 0.07, 1.66), 'tint_hair', bevel=0.025, jit=0.03)
b.done('hair_base', shade=(0.85, 1.08))

b = B()
b.cone(0.06, 0.045, 0.09, (0, 0.02, 1.985), 'tint_hair', seg=8, tone=0.9)
b.ball(0.088, (0, 0.02, 2.06), 'tint_hair', sub=2, scale=(1, 1, 0.9))
b.done('hair_knot', shade=(0.9, 1.1))

b = B()
b.box((0.5, 0.13, 0.66), (0, 0.225, 1.4), 'tint_hair', bevel=0.05, bseg=2, jit=0.03, f=lambda v: Vector((v.x * (1 - 0.18 * max(0, -v.z) / 0.33), v.y, v.z)))
for s in (-1, 1):
    b.box((0.075, 0.24, 0.5), (s * 0.275, 0.05, 1.5), 'tint_hair', bevel=0.03, jit=0.03)
b.box((0.46, 0.09, 0.09), (0, -0.215, 1.87), 'tint_hair', bevel=0.035, jit=0.03)
b.done('hair_fall', shade=(0.8, 1.06))

# 댕기 머리(아이·처녀): 뒤로 땋아 내린 한 가닥 + 붉은 댕기
b = B()
for i in range(5):
    b.ball(0.07 - i * 0.006, (0, 0.27, 1.56 - i * 0.11), 'tint_hair', sub=1, scale=(1, 0.8, 1.1), jit=0.03)
b.box((0.05, 0.02, 0.2), (0, 0.285, 1.02), 'red', rot=(0.1, 0, 0), jit=0)
b.done('hair_braid', shade=(0.85, 1.05))

# 쪽머리(혼인한 여자): 뒤통수 아래 쪽 + 비녀
b = B()
b.ball(0.11, (0, 0.3, 1.56), 'tint_hair', sub=2, scale=(1.25, 0.8, 0.9), jit=0.03)
b.box((0.36, 0.022, 0.022), (0, 0.31, 1.57), 'trim', jit=0)
b.done('hair_bun', shade=(0.85, 1.05))

# 갓
b = B()
b.cone(0.66, 0.66, 0.022, (0, 0.01, 1.95), 'gat_sheer', seg=18, jit=0.0)
b.cone(0.245, 0.205, 0.4, (0, 0.01, 2.16), 'gat', seg=12, jit=0.02)
b.cone(0.252, 0.252, 0.05, (0, 0.01, 1.985), 'ink', seg=12, jit=0)
for s in (-1, 1):
    b.box((0.014, 0.014, 0.52), (s * 0.235, -0.13, 1.68), 'gat', rot=(0.1, 0, 0), jit=0)
b.done('hat_gat', shade=(0.9, 1.15), under=0.1)

# 전립(군졸)
b = B()
b.cone(0.6, 0.5, 0.07, (0, 0.01, 1.955), 'felt', seg=14, jit=0.03)
b.lathe([(0.3, 1.98), (0.3, 2.07), (0.25, 2.18), (0.13, 2.26), (0.03, 2.285)], (0, 0.01, 0), 'felt', seg=12, jit=0.03)
b.lathe([(0.308, 1.99), (0.308, 2.04)], (0, 0.01, 0), 'red', seg=12, cap=False, jit=0)
b.ball(0.07, (0, 0.01, 2.33), 'red', sub=1)
b.box((0.05, 0.03, 0.26), (0.1, 0.3, 1.86), 'red', rot=(-0.25, 0, 0), jit=0)
b.done('hat_guard', shade=(0.85, 1.2), under=0.1)

# 삿갓
b = B()
b.lathe([(0.76, 1.84), (0.52, 2.0), (0.22, 2.19), (0.03, 2.3)], (0, 0.01, 0), 'straw', seg=12, jit=0.14)
b.lathe([(0.3, 1.9), (0.3, 1.97)], (0, 0.01, 0), 'straw', seg=10, cap=False, tone=0.7, jit=0.05)
b.done('hat_satgat', smooth=0, shade=(0.8, 1.12), under=0.35)

# 머릿수건(일하는 사람)
b = B()
dome(b, 'cloth', r=0.315, top=1.99, base=1.72)
b.ball(0.07, (0.06, 0.31, 1.76), 'cloth', sub=1, tone=0.92)
b.box((0.05, 0.03, 0.2), (0.1, 0.33, 1.63), 'cloth', rot=(0.2, 0.2, 0), tone=0.92)
b.done('hat_scarf', shade=(0.86, 1.06))

# 패랭이(대나무 갓 — 상인·역졸)
b = B()
b.cone(0.5, 0.42, 0.05, (0, 0.01, 1.955), 'straw', seg=14, jit=0.1)
b.lathe([(0.25, 1.975), (0.25, 2.1), (0.17, 2.2), (0.03, 2.23)], (0, 0.01, 0), 'straw', seg=12, jit=0.1)
b.done('hat_paeraengi', smooth=0, shade=(0.82, 1.1), under=0.3)

# 몸통(저고리) · 깃 · 고름
b = B()
b.box((0.6, 0.37, 0.62), (0, 0, 1.06), 'tint_shirt', bevel=0.085, bseg=2, jit=0.0, f=lambda v: Vector((v.x * (1 + 0.16 * v.z / 0.31), v.y * (1 + 0.06 * v.z / 0.31), v.z)))
b.box((0.075, 0.03, 0.46), (-0.012, -0.196, 1.17), 'trim', rot=(0, -0.56, 0), bevel=0.01, jit=0)
b.box((0.075, 0.03, 0.24), (0.07, -0.2, 1.265), 'trim', rot=(0, 0.56, 0), bevel=0.01, jit=0)
b.box((0.055, 0.03, 0.2), (0.1, -0.2, 0.99), 'tint_shirt', rot=(0, 0.12, 0), tone=0.74, jit=0)
b.box((0.05, 0.03, 0.13), (0.045, -0.2, 1.02), 'tint_shirt', rot=(0, -0.3, 0), tone=0.74, jit=0)
b.done('torso', shade=(0.84, 1.05), under=0.15)

b = B()
b.lathe([(0.47, 0.55), (0.43, 0.66), (0.35, 0.8), (0.3, 0.84)], (0, 0, 0), 'tint_shirt', seg=10, scale=(1, 0.72, 1), tone=0.95, jit=0.04)
b.done('skirt', shade=(0.8, 1.02), under=0.3)

# 긴 치마(여자) — skirt 대신 쓸 수 있다
b = B()
b.lathe([(0.5, 0.06), (0.47, 0.3), (0.38, 0.62), (0.3, 0.86)], (0, 0, 0), 'tint_pants', seg=12, scale=(1, 0.8, 1), jit=0.05)
b.done('chima', shade=(0.74, 1.04), under=0.3)

for nm, s in (('armL', -1), ('armR', 1)):
    b = B()
    b.lathe([(0.105, -0.5), (0.135, -0.42), (0.118, -0.08), (0.1, 0.07)], (s * 0.46, 0, 1.28), 'tint_shirt', seg=8, tone=0.97, jit=0.0)
    b.lathe([(0.108, -0.505), (0.108, -0.47)], (s * 0.46, 0, 1.28), 'trim', seg=8, cap=False, jit=0)
    b.ball(0.088, (s * 0.46, 0, 1.28 - 0.565), 'tint_skin', sub=1, jit=0)
    b.done(nm, origin=(s * 0.46, 0, 1.28), shade=(0.84, 1.04), under=0.2)

for nm, s in (('legL', -1), ('legR', 1)):
    b = B()
    b.lathe([(0.105, -0.52), (0.145, -0.43), (0.155, -0.1), (0.14, 0.03)], (s * 0.17, 0, 0.62), 'tint_pants', seg=8, jit=0.0)
    b.box((0.2, 0.31, 0.11), (s * 0.17, -0.045, 0.62 - 0.565), 'shoe', bevel=0.04, bseg=2, jit=0)
    b.done(nm, origin=(s * 0.17, 0, 0.62), shade=(0.8, 1.04), under=0.2)


# ── 선사 시대(가죽·삼베 옷): 깃 없는 한쪽 어깨 옷 · 너덜한 자락 · 맨팔 · 맨다리와 가죽신 · 헝클어진 머리
mat('fur', 0x5a4030)
b = B()
b.box((0.6, 0.37, 0.62), (0, 0, 1.06), 'tint_shirt', bevel=0.085, bseg=2, jit=0.04, f=lambda v: Vector((v.x * (1 + 0.16 * v.z / 0.31), v.y * (1 + 0.06 * v.z / 0.31), v.z)))
b.box((0.5, 0.42, 0.16), (-0.08, 0, 1.3), 'fur', bevel=0.05, rot=(0, 0.5, 0), jit=0.08)
b.box((0.3, 0.44, 0.2), (0.22, 0, 1.3), 'tint_skin', bevel=0.07, jit=0)
b.box((0.66, 0.42, 0.07), (0, 0, 0.9), 'fur', jit=0.06)
b.done('torso_hide', shade=(0.84, 1.05), under=0.15)
b = B()
for i in range(10):
    a = i * 2 * math.pi / 10
    b.box((0.26, 0.05, 0.3 + (i % 3) * 0.07), (math.cos(a) * 0.36, math.sin(a) * 0.27, 0.72 - (i % 3) * 0.03), 'tint_shirt', rot=(0, 0, a + math.pi / 2), tone=0.92 if i % 2 else 1.0, jit=0.06)
b.done('skirt_hide', smooth=0, shade=(0.8, 1.02), under=0.3)
for nm, s in (('armL_bare', -1), ('armR_bare', 1)):
    b = B()
    b.lathe([(0.085, -0.5), (0.1, -0.3), (0.105, -0.05), (0.1, 0.07)], (s * 0.46, 0, 1.28), 'tint_skin', seg=8, jit=0.0)
    b.ball(0.088, (s * 0.46, 0, 1.28 - 0.565), 'tint_skin', sub=1, jit=0)
    if s < 0:
        b.lathe([(0.115, -0.02), (0.125, 0.08)], (s * 0.46, 0, 1.28), 'fur', seg=8, jit=0.06)
    b.done(nm, origin=(s * 0.46, 0, 1.28), shade=(0.86, 1.04), under=0.2)
for nm, s in (('legL_bare', -1), ('legR_bare', 1)):
    b = B()
    b.lathe([(0.09, -0.46), (0.115, -0.3), (0.125, -0.05), (0.12, 0.03)], (s * 0.17, 0, 0.62), 'tint_skin', seg=8, jit=0.0)
    b.box((0.21, 0.31, 0.2), (s * 0.17, -0.04, 0.62 - 0.52), 'fur', bevel=0.05, bseg=2, jit=0.06)
    b.done(nm, origin=(s * 0.17, 0, 0.62), shade=(0.8, 1.04), under=0.2)
b = B()
dome(b, 'tint_hair', r=0.315, top=1.99, base=1.72)
for i, (x, y, z, r) in enumerate([(0, 0.24, 1.55, 0.2), (-0.24, 0.12, 1.5, 0.15), (0.24, 0.12, 1.5, 0.15), (-0.12, 0.26, 1.34, 0.13), (0.13, 0.26, 1.36, 0.13), (-0.2, -0.16, 1.9, 0.11), (0.16, -0.18, 1.92, 0.12), (0, 0.05, 2.0, 0.14)]):
    b.ball(r, (x, y, z), 'tint_hair', sub=1, jit=0.08)
b.done('hair_wild', smooth=0, shade=(0.8, 1.08))

# ── 근대: 학생모·군모(챙 달린 모자) · 중절모
b = B()
b.lathe([(0.31, 1.86), (0.33, 1.98), (0.35, 2.06), (0.2, 2.1), (0.03, 2.1)], (0, 0.01, 0), 'tint_pants', seg=12, jit=0.02)
b.lathe([(0.315, 1.86), (0.325, 1.92)], (0, 0.01, 0), 'ink', seg=12, cap=False, jit=0)
b.box((0.4, 0.22, 0.03), (0, -0.36, 1.87), 'ink', bevel=0.012, rot=(0.25, 0, 0), jit=0)
b.ball(0.035, (0, -0.325, 1.97), 'trim', sub=1, jit=0)
b.done('hat_cap', shade=(0.85, 1.1), under=0.1)
b = B()
b.cone(0.5, 0.46, 0.03, (0, 0.01, 1.9), 'tint_pants', seg=14, jit=0.02)
b.lathe([(0.3, 1.9), (0.29, 2.12), (0.2, 2.17), (0.03, 2.13)], (0, 0.01, 0), 'tint_pants', seg=12, jit=0.02)
b.lathe([(0.305, 1.92), (0.3, 1.98)], (0, 0.01, 0), 'ink', seg=12, cap=False, jit=0)
b.done('hat_fedora', shade=(0.85, 1.1), under=0.1)


# ── 근대 겉옷(깃 없는 단추 옷 — 제복·교복·양복): style 'coat'
b = B()
b.box((0.6, 0.37, 0.62), (0, 0, 1.06), 'tint_shirt', bevel=0.085, bseg=2, jit=0.0, f=lambda v: Vector((v.x * (1 + 0.16 * v.z / 0.31), v.y * (1 + 0.06 * v.z / 0.31), v.z)))
b.box((0.3, 0.05, 0.07), (0, -0.19, 1.34), 'tint_shirt', tone=0.72, jit=0)
for i in range(4):
    b.ball(0.026, (0, -0.2, 1.24 - i * 0.12), 'trim', sub=1, jit=0)
b.box((0.66, 0.41, 0.07), (0, 0, 0.86), 'ink', jit=0)
b.box((0.09, 0.03, 0.09), (0, -0.21, 0.86), 'trim', jit=0)
b.done('torso_coat', shade=(0.84, 1.05), under=0.15)


# ── 11-18 더한 머리: 복두(신라·고려 벼슬아치 — 검은 각진 관에 양옆 날개) · 머리띠(고조선·삼국 우두머리, pants 색) · 짧은 머리(근현대 아이·젊은이, 머리 덮개만)
b = B()
b.box((0.6, 0.6, 0.2), (0, 0.01, 1.9), 'gat', bevel=0.06, bseg=2, jit=0.0)
b.box((0.46, 0.4, 0.22), (0, 0.06, 2.07), 'gat', bevel=0.09, bseg=2, jit=0.0)
b.lathe([(0.305, 1.83), (0.31, 1.88)], (0, 0.01, 0), 'felt', seg=12, cap=False, jit=0)
for s_ in (-1, 1):
    b.box((0.42, 0.05, 0.035), (s_ * 0.5, 0.16, 2.04), 'gat', bevel=0.012, rot=(0, s_ * -0.08, 0), jit=0)
    b.box((0.06, 0.06, 0.08), (s_ * 0.71, 0.16, 2.035), 'gat', bevel=0.02, jit=0)
b.done('hat_boktu', shade=(0.9, 1.15), under=0.1)
b = B()
b.lathe([(0.322, 1.8), (0.326, 1.865)], (0, 0.01, 0), 'tint_pants', seg=14, cap=False, jit=0)
b.box((0.06, 0.04, 0.2), (0.12, 0.33, 1.73), 'tint_pants', rot=(-0.3, 0, 0.15), jit=0)
b.box((0.06, 0.04, 0.17), (0.04, 0.33, 1.72), 'tint_pants', rot=(-0.25, 0, -0.1), jit=0)
b.ball(0.05, (0, -0.32, 1.84), 'trim', sub=1, scale=(1, 0.5, 1), jit=0)
b.done('hat_band', shade=(0.88, 1.1), under=0.1)

export('people.glb')

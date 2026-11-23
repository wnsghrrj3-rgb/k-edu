"""케이월드 「다섯 해」 사람 — 구워 입힌 모델(준호 11-23 「블렌더로 해서 좀 더 제대로」). ffolk.glb.
네모 사람 대신 둥근 머리와 얼굴(눈·눈썹·코·입·볼·귀), 저고리(깃·흰 동정·고름·넓은 소매)와 통 넓은 바지(대님)·버선·짚신.
조각: 머리(folk_head) · 몸통(folk_body) · 팔 둘 · 다리 둘 — 원점 = 돌림 중심(어깨 0.46,1.28 · 엉덩이 0.17,0.62 — kit 의 사람과 같아 걷기·몸짓 코드가 그대로 돈다).
쓰개는 따로(hat_scarf 머릿수건 · hat_gat 갓 · hat_paeraengi 패랭이 · hat_guard 전립 · hat_knot 맨상투) + 수염(folk_beard): 읽을 때 머리와 한 덩이로 합친다.
옷 색은 굽지 않는다 — 꼭짓점 색(R = 저고리, G = 바지)을 가리개로 내보내 farm/folk.js 가 사람마다 색을 곱한다(무늬·주름·그늘은 구운 그대로). 앞 = -y."""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kw_lib import *
from kw_bake import *
from mathutils import Vector

PREVIEW = '--preview' in sys.argv
reset_bake(samples=24)

m_plain('skin', 0xf0c48e, var=0.03, scale=8, rough=0.7); m_plain('cheek', 0xe89a80, var=0.03); m_plain('lip', 0xb85a4a, var=0.03); m_plain('ink', 0x1a1410, var=0.1, rough=0.5)
m_fur('hair', (0xa8a8a8, 0xdcdcdc, 0xffffff), axis='Z', scale=1.2, rough=0.6); m_plain('eyew', 0xfaf8f2, var=0.01)
m_cloth('shirt', 0xf2efe6, weave=120, var=0.07); m_cloth('pants', 0xf2efe6, weave=120, var=0.07); m_cloth('white', 0xf8f5ee, weave=120, var=0.04)
m_plain('straw', 0xd0b060, var=0.25, scale=40); m_cloth('bamboo', 0xd8b868, weave=60, var=0.2); m_cloth('gat', 0x1a1a1e, weave=160, var=0.3); m_plain('felt', 0x1c1c22, var=0.15, scale=30)
m_plain('red', 0xc0302a, var=0.1); m_plain('bead', 0xd8a030, var=0.1, rough=0.4); m_fur('beard', (0xa8a8a8, 0xdcdcdc, 0xffffff), axis='Z', scale=1.5); m_plain('silver', 0xd8d8e0, var=0.05, rough=0.3)


def egg(b, c, r, m, sub=2, rot=(0, 0, 0), **k):
    return b.ball(1.0, c, m, sub=sub, scale=r, rot=rot, jit=0, **k)


def mask(ob):
    """색 가리개: 꼭짓점 색 R = 저고리(shirt) · G = 바지·치마(pants) · B = 머리칼·수염(hair·beard)."""
    me = ob.data
    for ca in list(me.color_attributes):
        me.color_attributes.remove(ca)
    ca = me.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
    for p in me.polygons:
        nm = me.materials[p.material_index].name
        c = (1, 0, 0, 1) if nm == 'shirt' else (0, 1, 0, 1) if nm == 'pants' else (0, 0, 1, 1) if nm in ('hair', 'beard') else (0, 0, 0, 1)
        for li in p.loop_indices:
            ca.data[li].color = c
    return ob


OBJ = []
# ── 머리: 얼굴(머리통·턱·코·귀를 한 겹으로 빚고, 눈·눈썹·입·볼·머리칼은 또렷하게 덧붙인다) ──
b = B()
egg(b, (0, 0, 1.675), (0.29, 0.275, 0.285), 'skin', sub=3)
egg(b, (0, -0.03, 1.56), (0.235, 0.225, 0.2), 'skin', sub=2)                                             # 볼·턱
egg(b, (0, -0.275, 1.622), (0.04, 0.05, 0.045), 'skin', sub=2); egg(b, (0, -0.25, 1.66), (0.03, 0.04, 0.07), 'skin', sub=2)   # 코끝 · 콧등
for s in (-1, 1):
    egg(b, (s * 0.285, 0.02, 1.64), (0.045, 0.06, 0.08), 'skin', sub=2)                                  # 귀
    egg(b, (s * 0.11, -0.238, 1.765), (0.075, 0.035, 0.03), 'skin', sub=2)                               # 눈두덩
    egg(b, (s * 0.108, -0.246, 1.692), (0.05, 0.02, 0.05), 'eyew', sub=2)                                # 흰자
    egg(b, (s * 0.106, -0.257, 1.69), (0.033, 0.016, 0.042), 'ink', sub=2)                               # 눈동자
    egg(b, (s * 0.096, -0.27, 1.704), (0.011, 0.006, 0.013), 'eyew', sub=1)                              # 눈빛
    b.box((0.09, 0.016, 0.022), (s * 0.112, -0.272, 1.782), 'hair', rot=(0, -s * 0.16, 0), bevel=0.007, jit=0)   # 눈썹
    egg(b, (s * 0.178, -0.212, 1.585), (0.052, 0.014, 0.036), 'cheek', sub=1)                            # 볼
    b.box((0.05, 0.014, 0.018), (s * 0.03, -0.262, 1.535 + 0.006), 'lip', rot=(0, -s * 0.3, 0), bevel=0.006, jit=0)   # 웃는 입
egg(b, (0, 0.035, 1.71), (0.3, 0.29, 0.285), 'hair', sub=2)                                              # 머리칼(뒤·위로 물려 이마선이 생긴다)
for s in (-1, 1):
    egg(b, (s * 0.262, -0.07, 1.69), (0.05, 0.07, 0.11), 'hair', sub=1)                                  # 귀밑머리
b.cone(0.11, 0.1, 0.16, (0, 0, 1.36), 'skin', seg=10, jit=0)                                             # 목
hd = b.done('folk_head', smooth=60, shade=(1, 1), under=0)
skin(hd, voxel=0.011, faces=480, keep=('eyew', 'ink', 'hair', 'cheek', 'lip'), smooth_it=5, smooth_f=0.5)
OBJ.append(mask(hd))

# ── 쓰개 · 수염 ──
b = B()   # 맨상투 + 망건
b.lathe([(0.292, 0), (0.296, 0.03), (0.292, 0.06)], (0, 0.012, 1.775), 'ink', seg=12, cap=False)
seg(b, (0, 0.03, 1.94), (0, 0.03, 2.07), 0.055, 0.07, 'hair', n=8, jit=0); egg(b, (0, 0.03, 2.09), (0.075, 0.075, 0.06), 'hair', sub=2)
OBJ.append(mask(b.done('hat_knot', smooth=60, shade=(1, 1), under=0)))
b = B()   # 머릿수건: 이마를 두르고 뒤에서 묶음
egg(b, (0, 0.03, 1.79), (0.315, 0.305, 0.215), 'white', sub=2)
b.lathe([(0.3, 0), (0.312, 0.05), (0.3, 0.1)], (0, 0.012, 1.74), 'white', seg=12, cap=False)
for s in (-1, 1):
    egg(b, (s * 0.07, 0.31, 1.76), (0.06, 0.045, 0.04), 'white', sub=1); seg(b, (s * 0.05, 0.31, 1.75), (s * 0.12, 0.36, 1.58), 0.03, 0.012, 'white', n=5, jit=0)
OBJ.append(mask(b.done('hat_scarf', smooth=60, shade=(1, 1), under=0)))
b = B()   # 갓: 넓은 양태 + 대우 + 갓끈
b.lathe([(0.292, 0), (0.296, 0.03), (0.292, 0.06)], (0, 0.012, 1.775), 'ink', seg=12, cap=False)
b.lathe([(0.24, 1.93), (0.64, 1.9), (0.65, 1.908), (0.24, 1.95)], (0, 0, 0), 'gat', seg=14)
b.lathe([(0.235, 1.94), (0.205, 2.3), (0.19, 2.33), (0.0, 2.335)], (0, 0, 0), 'gat', seg=12, cap=False)
b.lathe([(0.24, 1.945), (0.245, 1.965), (0.236, 1.985)], (0, 0, 0), 'ink', seg=12, cap=False)
for s in (-1, 1):
    seg(b, (s * 0.25, -0.05, 1.93), (s * 0.2, -0.2, 1.42), 0.008, 0.008, 'ink', n=4, jit=0); egg(b, (s * 0.2, -0.2, 1.42), (0.02, 0.02, 0.02), 'bead', sub=1)
OBJ.append(mask(b.done('hat_gat', smooth=60, shade=(1, 1), under=0)))
b = B()   # 패랭이: 대오리로 엮은 둥근 모자
b.lathe([(0.25, 1.94), (0.56, 1.86), (0.57, 1.87), (0.25, 1.965)], (0, 0, 0), 'bamboo', seg=14)
b.lathe([(0.25, 1.95), (0.235, 2.08), (0.17, 2.19), (0.0, 2.22)], (0, 0, 0), 'bamboo', seg=12, cap=False)
b.lathe([(0.252, 1.955), (0.258, 1.975), (0.25, 1.995)], (0, 0, 0), 'ink', seg=12, cap=False)
for s in (-1, 1):
    seg(b, (s * 0.25, -0.04, 1.94), (s * 0.19, -0.2, 1.44), 0.008, 0.008, 'ink', n=4, jit=0)
OBJ.append(mask(b.done('hat_paeraengi', smooth=60, shade=(1, 1), under=0)))
b = B()   # 전립(포졸): 검은 모전 + 붉은 술 + 깃
b.lathe([(0.25, 1.94), (0.52, 1.9), (0.53, 1.912), (0.25, 1.965)], (0, 0, 0), 'felt', seg=14)
b.lathe([(0.25, 1.95), (0.25, 2.06), (0.2, 2.2), (0.0, 2.25)], (0, 0, 0), 'felt', seg=12, cap=False)
b.lathe([(0.255, 1.955), (0.262, 1.985), (0.255, 2.015)], (0, 0, 0), 'red', seg=12, cap=False)
egg(b, (0, 0, 2.27), (0.05, 0.05, 0.05), 'bead', sub=1); seg(b, (0, 0, 2.27), (0.16, 0.1, 2.12), 0.035, 0.012, 'red', n=5, jit=0)
OBJ.append(mask(b.done('hat_guard', smooth=60, shade=(1, 1), under=0)))
b = B()   # 수염: 콧수염 + 턱수염
for s in (-1, 1):
    seg(b, (s * 0.012, -0.283, 1.575), (s * 0.085, -0.262, 1.535), 0.016, 0.006, 'beard', n=5, jit=0)
seg(b, (0, -0.25, 1.46), (0, -0.275, 1.25), 0.07, 0.012, 'beard', n=7, jit=0)
OBJ.append(mask(b.done('folk_beard', smooth=60, shade=(1, 1), under=0)))

# ── 몸통: 저고리(깃·동정·고름) ──
b = B()
b.lathe([(0.2, 0.56), (0.335, 0.6), (0.37, 0.66), (0.35, 0.86), (0.31, 1.08), (0.3, 1.24), (0.24, 1.36), (0.13, 1.42)], (0, 0, 0), 'shirt', seg=11, scale=(1.0, 0.7, 1.0), jit=0)
for s in (-1, 1):
    egg(b, (s * 0.35, 0, 1.3), (0.14, 0.15, 0.12), 'shirt', sub=2)                                        # 어깨
# 깃: 왼쪽이 오른쪽을 덮으며 가슴에서 여민다 — 흰 동정을 덧댐
b.box((0.075, 0.03, 0.46), (-0.075, -0.212, 1.21), 'shirt', rot=(0.1, 0.42, 0), bevel=0.01, tone=0.86, jit=0)
b.box((0.075, 0.03, 0.4), (0.085, -0.208, 1.24), 'shirt', rot=(0.1, -0.5, 0), bevel=0.01, tone=0.86, jit=0)
b.box((0.036, 0.034, 0.3), (-0.105, -0.218, 1.29), 'white', rot=(0.1, 0.42, 0), jit=0)
b.box((0.036, 0.034, 0.26), (0.115, -0.214, 1.3), 'white', rot=(0.1, -0.5, 0), jit=0)
egg(b, (0.02, -0.236, 1.03), (0.04, 0.03, 0.035), 'shirt', sub=1, tone=0.8)                               # 고름 매듭
b.box((0.05, 0.02, 0.3), (0.05, -0.245, 0.88), 'shirt', rot=(0, -0.1, 0), tone=0.8, jit=0); b.box((0.05, 0.02, 0.24), (-0.01, -0.245, 0.91), 'shirt', rot=(0, 0.14, 0), tone=0.8, jit=0)
OBJ.append(mask(b.done('folk_body', smooth=60, shade=(1, 1), under=0)))

b = B()   # 쪽머리(가르마 탄 머리 · 뒤로 쪽 지고 비녀)
egg(b, (0, 0.05, 1.72), (0.305, 0.3, 0.275), 'hair', sub=2)
egg(b, (0, 0.3, 1.56), (0.1, 0.085, 0.085), 'hair', sub=2)
seg(b, (-0.19, 0.31, 1.56), (0.19, 0.31, 1.57), 0.014, 0.012, 'silver', n=5, jit=0); egg(b, (-0.2, 0.31, 1.56), (0.028, 0.028, 0.028), 'bead', sub=1)
b.box((0.012, 0.22, 0.012), (0, -0.13, 1.985), 'skin', rot=(0.5, 0, 0), jit=0)                           # 가르마
OBJ.append(mask(b.done('hat_bun', smooth=60, shade=(1, 1), under=0)))
b = B()   # 여인 몸통: 짧은 저고리 + 발목까지 오는 주름치마(G = 치마 색)
b.lathe([(0.23, 1.02), (0.3, 1.08), (0.295, 1.24), (0.24, 1.36), (0.13, 1.42)], (0, 0, 0), 'shirt', seg=11, scale=(1.0, 0.72, 1.0), jit=0)
for s in (-1, 1):
    egg(b, (s * 0.33, 0, 1.3), (0.13, 0.14, 0.115), 'shirt', sub=2)
N_ = 16
def chima(u, v):
    a = u * 2 * math.pi; r = 0.27 + (0.5 - 0.27) * (v ** 0.8) + 0.018 * math.sin(a * N_ / 2) * v
    return (math.cos(a) * r, math.sin(a) * r * 0.86, 1.12 - 1.04 * v)
b.grid(N_, 5, chima, 'pants', jit=0)
b.lathe([(0.275, 1.1), (0.285, 1.14), (0.27, 1.17)], (0, 0, 0), 'white', seg=11, scale=(1.0, 0.75, 1.0), cap=False, jit=0)   # 치마 말기
b.box((0.07, 0.03, 0.3), (-0.07, -0.214, 1.25), 'shirt', rot=(0.1, 0.42, 0), bevel=0.01, jit=0); b.box((0.07, 0.03, 0.26), (0.08, -0.21, 1.27), 'shirt', rot=(0.1, -0.5, 0), bevel=0.01, jit=0)
b.box((0.034, 0.034, 0.22), (-0.098, -0.22, 1.3), 'white', rot=(0.1, 0.42, 0), jit=0); b.box((0.034, 0.034, 0.2), (0.108, -0.216, 1.31), 'white', rot=(0.1, -0.5, 0), jit=0)
b.box((0.05, 0.02, 0.36), (0.05, -0.25, 0.98), 'red', rot=(0, -0.08, 0), jit=0); b.box((0.05, 0.02, 0.3), (-0.0, -0.25, 1.0), 'red', rot=(0, 0.12, 0), jit=0)   # 붉은 고름
OBJ.append(mask(b.done('folk_body_f', smooth=60, shade=(1, 1), under=0)))

# ── 팔: 넓은 소매 + 손 ──
for nm, s in (('folk_armL', -1), ('folk_armR', 1)):
    b = B(); x = s * 0.46
    seg(b, (x - s * 0.02, 0, 1.31), (x + s * 0.03, 0, 1.0), 0.115, 0.125, 'shirt', n=7, jit=0)
    b.ball(0.125, (x + s * 0.03, 0, 1.0), 'shirt', sub=2, jit=0)
    seg(b, (x + s * 0.03, 0, 1.0), (x + s * 0.04, -0.03, 0.76), 0.125, 0.105, 'shirt', n=7, jit=0)
    seg(b, (x + s * 0.04, -0.03, 0.77), (x + s * 0.04, -0.035, 0.74), 0.108, 0.1, 'white', n=7, jit=0)     # 끝동
    egg(b, (x + s * 0.04, -0.04, 0.67), (0.07, 0.075, 0.09), 'skin', sub=2)                                # 손
    OBJ.append(mask(b.done(nm, origin=(s * 0.46, 0, 1.28), smooth=60, shade=(1, 1), under=0)))

# ── 다리: 통 넓은 바지 · 대님 · 버선 · 짚신 ──
for nm, s in (('folk_legL', -1), ('folk_legR', 1)):
    b = B(); x = s * 0.17
    b.ball(0.175, (x, 0, 0.6), 'pants', sub=2, jit=0)
    seg(b, (x, 0, 0.62), (x + s * 0.01, 0, 0.3), 0.172, 0.16, 'pants', n=7, jit=0)
    seg(b, (x + s * 0.01, 0, 0.3), (x + s * 0.01, 0, 0.17), 0.16, 0.1, 'pants', n=7, jit=0)
    seg(b, (x + s * 0.01, 0, 0.18), (x + s * 0.01, 0, 0.15), 0.104, 0.1, 'ink', n=7, jit=0)                # 대님
    seg(b, (x + s * 0.01, 0, 0.16), (x + s * 0.01, -0.01, 0.07), 0.09, 0.085, 'white', n=8, jit=0)         # 버선목
    egg(b, (x + s * 0.01, -0.06, 0.07), (0.09, 0.16, 0.065), 'white', sub=2)                               # 버선발
    egg(b, (x + s * 0.01, -0.06, 0.028), (0.1, 0.175, 0.028), 'straw', sub=2)                              # 짚신 바닥
    for k in range(3):
        b.box((0.19, 0.016, 0.016), (x + s * 0.01, -0.13 + k * 0.07, 0.115 - k * 0.012), 'straw', jit=0)   # 신총
    OBJ.append(mask(b.done(nm, origin=(s * 0.17, 0, 0.62), smooth=60, shade=(1, 1), under=0)))

for o in OBJ:
    print('FACES', o.name, len(o.data.polygons))
bake_set(OBJ, 'ffolk', size=1024, normal=False, keep_color=True, ao_lo=0.5, uv_angle=86, uv_weight={'hat_gat': 0.5, 'hat_paeraengi': 0.55, 'hat_guard': 0.55, 'hat_scarf': 0.8, 'folk_head': 1.6, 'folk_body': 1.2, 'folk_body_f': 0.9})
if PREVIEW:
    by = {o.name: o for o in OBJ}
    for i, (hat, beard, yaw) in enumerate((('hat_scarf', False, 0.5), ('hat_gat', True, -0.4), ('hat_knot', False, 0.0), ('hat_bun', False, 0.6))):
        sel = [by[n] for n in ('folk_head', 'folk_body_f' if hat == 'hat_bun' else 'folk_body', 'folk_armL', 'folk_armR', 'folk_legL', 'folk_legR', hat)] + ([by['folk_beard']] if beard else [])
        preview(os.path.join(OUT, '_tex', f'ffolk_preview{i}.png'), sel, samples=24, elev=12, dist=0.62, layout=False, look=(0, 0, 1.1), yaw=yaw, res=(520, 640))

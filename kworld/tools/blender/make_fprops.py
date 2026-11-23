"""케이월드 「다섯 해」 작은 소품·벼·풀 — 예전 민짜 모델을 그대로 가져와 구워 입힌다(준호 11-23 「블렌더를 사용해서 더 멋지게」). fprops.glb.
예전 대본(make_props·make_market·make_night·make_nature·make_farm·make_farmset)을 손대지 않고 그대로 돌리되,
 · mat(이름, 색) → 이름을 보고 절차 재질로 바꿔 만든다(나무는 나뭇결, 돌은 돌 결, 짚·갈대는 가닥, 천은 올, 옹기는 유약, 그 밖은 옅은 얼룩)
 · reset·export 는 건너뛴다 · 면 방향 고친 _take(kw_bake)가 쓰인다
그런 다음 다섯 해가 쓰는 이름만 골라(WANT) 모서리를 다듬고 무늬 한 장(색 × 구석 그늘)에 굽는다. 모양·이름·크기는 예전과 같다."""
import sys, os, math, runpy
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import kw_lib
from kw_bake import *

PREVIEW = '--preview' in sys.argv
reset_bake(samples=20)
WANT = ('barrel bundle cart coins dock drum ferry goods_cloth goods_rice goods_tob gwe handcart hongsal jangdok jangseung jige mo_bundle pk_cloth pk_rice pk_tob '
        'rice_sheaf rice_young rice_grow rice_ripe rice_dead rice_stub tob_plant bean rock_a rock_big sack sack_pile sotdae ssaldok stage stone_pile pul deulkkot reed pine_a pine_b tree_b').split()


def shades(hexv, lo=0.72, hi=1.18):
    r, g, b = (hexv >> 16) & 255, (hexv >> 8) & 255, hexv & 255
    f = lambda k: (min(255, int(r * k)) << 16) | (min(255, int(g * k)) << 8) | min(255, int(b * k))
    return (f(lo), hexv, f(hi))


def mat_baked(name, hexv=0xffffff, rough=0.85, metal=0.0, emit=None):
    """예전 mat() 자리: 이름으로 재질 종류를 고른다."""
    if name in MATS:
        return MATS[name]
    n = name.replace('tint_', '')
    if n.startswith(('wood', 'bark', 'twig', 'plank')):
        return m_wood(name, cols=shades(hexv, 0.62, 1.25), axis='Z')
    if n.startswith(('stone', 'rock')):
        return m_stone(name, cols=shades(hexv, 0.74, 1.16), moss=None)
    if n.startswith(('straw', 'thatch', 'rope', 'reed', 'gold', 'rice', 'grass', 'hay', 'mat')):
        return m_fur(name, shades(hexv, 0.74, 1.14), axis='Z', scale=0.9)
    if n.startswith(('cloth', 'paper', 'white', 'canvas', 'sail', 'flag')):
        return m_cloth(name, hexv)
    if n.startswith(('onggi', 'jar', 'clay')):
        return m_jar(name, cols=shades(hexv, 0.6, 1.3))
    if n.startswith(('leaf', 'pine', 'green', 'bush', 'cabbage', 'radish')):
        return m_plain(name, hexv, var=0.22, scale=14)
    if n.startswith(('iron', 'bronze', 'coin', 'gold_')):
        return m_plain(name, hexv, var=0.1, scale=20, rough=0.45)
    return m_plain(name, hexv, var=0.1, scale=10, rough=rough)


kw_lib.mat = mat_baked; kw_lib.reset = lambda: None; kw_lib.export = lambda f: None
for sc in ('make_props.py', 'make_market.py', 'make_night.py', 'make_nature.py', 'make_farm.py', 'make_farmset.py'):
    try:
        runpy.run_path(os.path.join(HERE, sc))
    except SystemExit:
        pass
    print('RAN', sc, len(bpy.context.scene.objects))

OBJ = []
for nm in WANT:
    o = bpy.data.objects.get(nm)
    if o is None:
        print('MISSING', nm); continue
    smooth_obj(o, 38); OBJ.append(o)
for o in list(bpy.context.scene.objects):   # 안 쓰는 것은 지운다(서로 그늘지지 않게)
    if o not in OBJ:
        bpy.data.objects.remove(o)
for o in OBJ:
    print('FACES', o.name, len(o.data.polygons))
big = {'ferry': 0.6, 'dock': 0.6, 'stage': 0.6, 'hongsal': 0.7, 'pine_a': 0.6, 'pine_b': 0.6, 'tree_b': 0.6, 'cart': 0.8}
bake_set(OBJ, 'fprops', size=1024 if PREVIEW else 2048, normal=False, ao_lo=0.42, uv_angle=70, uv_weight=big)
if PREVIEW:
    preview(os.path.join(OUT, '_tex', 'fprops_preview.png'), OBJ, cols=9, gap=1.0, samples=16, dist=0.7, elev=26)

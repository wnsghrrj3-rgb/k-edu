"""식당의 몬스터 셋(모모 · 보보 · 토토)을 고고와 같은 뼈대로 빚는다 — 동작 클립을 고고와 나눠 쓴다.
실행(화면 없이):  blender -b --python english/play/world/tools/make_monsters.py   → world/assets/momo.glb · bobo.glb · toto.glb
뼈의 자리는 고고와 똑같이 두고(클립이 그대로 맞게) 몸매 · 색 · 더듬이(뿔) · 눈 크기 · 무늬만 바꾼다. 클립은 넣지 않는다(고고의 것을 쓴다).
성격(설계서 §13): Momo 분홍 · 먹보 / Bobo 파랑 · 소심 / Gogo 초록 · 호기심(make_gogo.py) / Toto 노랑 · 장난꾸러기.
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import make_gogo as G

BASE = {k: getattr(G, k) for k in ('TORSO', 'EYE_R', 'ANT', 'ANT_R', 'ANT_TIP', 'SPOTS', 'VOX')}; BASE_C = dict(G.C)
KIND = {
    'momo': dict(   # 통통한 몸 · 짧은 뿔 둘 · 큰 배
        TORSO=[((0, 0, 0.47), (0.41, 0.37, 0.35)), ((0, 0, 0.61), (0.385, 0.35, 0.31)), ((0, -0.01, 0.74), (0.345, 0.32, 0.31))],
        ANT=((0.14, 0.0, 0.99), (0.175, 0.0, 1.08), (0.215, -0.01, 1.13)), ANT_R=(0.07, 0.024), ANT_TIP=0.028,
        SPOTS=[((0.22, 0.2, 0.86), 0.06), ((-0.14, 0.29, 0.68), 0.07), ((0.07, 0.34, 0.5), 0.075), ((-0.3, 0.14, 0.9), 0.05), ((-0.33, 0.2, 0.46), 0.06)],
        C=dict(top='#ffb7d0', mid='#f58fb2', low='#d86b95', belly='#ffe6ee', spot='#e2729c', toe='#c85a86', blush='#ff6f93', stalk='#fff1d6', tip='#fff1d6', tipHi='#ffffff', lip='#a8456b', lidRim='#c85a86', iris='#5a2a4c')),
    'bobo': dict(   # 몸보다 머리가 큰 전구 꼴 · 큰 눈 · 처진 더듬이
        TORSO=[((0, 0, 0.48), (0.32, 0.30, 0.33)), ((0, 0, 0.61), (0.315, 0.295, 0.30)), ((0, -0.01, 0.75), (0.335, 0.315, 0.32))],
        EYE_R=0.134, ANT=((0.10, 0.0, 1.02), (0.21, 0.02, 1.2), (0.35, -0.02, 1.12)), ANT_R=(0.022, 0.016), ANT_TIP=0.046,
        SPOTS=[((0.2, 0.2, 0.9), 0.04), ((-0.12, 0.27, 0.72), 0.045), ((0.05, 0.28, 0.52), 0.05), ((-0.24, 0.12, 0.97), 0.035), ((0.26, 0.1, 0.62), 0.04), ((-0.22, -0.14, 1.0), 0.03)],
        C=dict(top='#aee0f7', mid='#7fc6ec', low='#4f9fce', belly='#f3fbff', spot='#5aa8d8', toe='#3f8fbf', blush='#ff9db0', stalk='#5aa8d8', tip='#ffffff', tipHi='#ffffff', lip='#2f6f9a', lidRim='#4f9fce', iris='#27456e')),
    'toto': dict(   # 아래가 넓은 배 꼴 · 뾰족한 뿔 · 주황 점
        TORSO=[((0, 0, 0.47), (0.375, 0.335, 0.32)), ((0, 0, 0.60), (0.335, 0.31, 0.29)), ((0, -0.01, 0.73), (0.305, 0.30, 0.30))],
        EYE_R=0.114, ANT=((0.12, 0.0, 0.97), (0.2, 0.0, 1.1), (0.31, 0.0, 1.21)), ANT_R=(0.052, 0.012), ANT_TIP=0.018,
        SPOTS=[((0.0, 0.3, 0.86), 0.09), ((0.0, 0.34, 0.62), 0.1), ((0.0, 0.33, 0.4), 0.09), ((0.27, 0.1, 0.8), 0.05), ((-0.27, 0.1, 0.8), 0.05), ((0.3, 0.12, 0.5), 0.055), ((-0.3, 0.12, 0.5), 0.055)],
        C=dict(top='#ffe680', mid='#ffd05c', low='#f0aa3c', belly='#fff8dc', spot='#f08a2a', toe='#e0902a', blush='#ff8a6a', stalk='#f08a2a', tip='#f08a2a', tipHi='#ffb04a', lip='#a8601a', lidRim='#e0902a', iris='#5c3a1a')),
}
if __name__ == '__main__':
    for name, k in KIND.items():
        for key, val in BASE.items(): setattr(G, key, k.get(key, val))
        G.VOX = 0.02; G.C.clear(); G.C.update(BASE_C); G.C.update({c: G.rgb(v) for c, v in k['C'].items()})
        G.build(); G.export(os.path.normpath(os.path.join(HERE, '..', 'assets', name + '.glb')), animations=False)

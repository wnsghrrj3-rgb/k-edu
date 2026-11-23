"""케이원더 · 블랙홀 — 별 하늘 360° 그림(은하수·성운·잔별). numpy + PIL 로 만든다(블렌더 필요 없음).
   python3 sky_pano.py <out.jpg>     2048×1024, 가로로 이어짐. 밝은 별은 셰이더가 따로 찍는다(휠 때 또렷하게)."""
import sys, numpy as np
from PIL import Image
rng = np.random.default_rng(11); W, H = 2048, 1024
def noise(cells_x, cells_y):                      # 가로로 이어지는 부드러운 무늬
    g = rng.random((cells_y + 3, cells_x)).astype(np.float32); g = np.concatenate([g, g[:, :3]], 1)
    im = Image.fromarray((g * 255).astype(np.uint8)).resize((int(W * (cells_x + 3) / cells_x), int(H * (cells_y + 3) / cells_y)), Image.BICUBIC)
    return np.asarray(im, np.float32)[:H, :W] / 255
def fbm(c, oct=5):
    a, s, t = .5, 0, 0
    for i in range(oct): s = s + a * noise(c * 2 ** i, max(2, c * 2 ** i // 2)); t += a; a *= .5
    return s / t
u = (np.arange(W) + .5) / W * 2 * np.pi; v = (.5 - (np.arange(H) + .5) / H) * np.pi
lon, lat = np.meshgrid(u, v); d = np.stack([np.cos(lat) * np.cos(lon), np.sin(lat), np.cos(lat) * np.sin(lon)], -1)
pole = np.array([.42, .82, .39]); pole /= np.linalg.norm(pole)                 # 은하수 띠의 축
b = np.arcsin(np.clip(d @ pole, -1, 1))                                          # 띠에서 벗어난 각
core = np.array([-.75, .2, .63]); core /= np.linalg.norm(core); cdist = np.arccos(np.clip(d @ core, -1, 1))
n1, n2, n3, n4 = fbm(6), fbm(12), fbm(3), fbm(28, 4)
band = np.exp(-(np.abs(b) / (.10 + .13 * n3)) ** 1.5) * (.35 + 1.1 * np.exp(-(cdist / 1.0) ** 2))
dust = np.clip((n2 * .7 + n4 * .3 - .47) * 6.5, 0, 1) * np.exp(-(b / .12) ** 2)                 # 띠 가운데의 어두운 먼지 길
mw = band * (1 - .93 * dust) * (.15 + 1.5 * n1 ** 1.6) * (.55 + .9 * n4 ** 1.3)
img = np.zeros((H, W, 3), np.float32)
img += mw[..., None] * np.array([.115, .105, .135]) * (1 + .5 * np.exp(-(cdist / .5) ** 2)[..., None] * np.array([1.6, 1.15, .6]))
neb = [(np.array([.3, -.35, -.89]), .35, [.30, .06, .12]), (np.array([.86, .3, .4]), .28, [.05, .16, .30]), (np.array([-.2, .6, -.77]), .22, [.20, .08, .28])]
for c, r, col in neb:                                                             # 성운 얼룩 셋
    c = c / np.linalg.norm(c); a = np.arccos(np.clip(d @ c, -1, 1)); img += (np.exp(-(a / r) ** 2) * np.clip(n2 * 1.9 - .55, 0, 1) ** 1.5)[..., None] * np.array(col) * .42
img += np.array([.0010, .0013, .0026])
# 잔별: 띠 쪽에 더 많이
dens = .0022 + .05 * np.clip(mw, 0, 1.2); m = rng.random((H, W)) < dens * np.cos(lat).clip(.15, 1)
br = rng.random((H, W)) ** 6 * .9 + .05; tint = rng.random((H, W, 1)); col = np.where(tint < .25, [1, .8, .6], np.where(tint > .8, [.7, .82, 1], [1, 1, 1]))
img += (m * br)[..., None] * col * .8
img = 1 - np.exp(-img * 2.6)
Image.fromarray((np.clip(img, 0, 1) ** (1 / 2.2) * 255).astype(np.uint8)).save(sys.argv[1], quality=88)
print('sky', sys.argv[1])

"""케이히스토리 표면 텍스처 생성기 — 사진 없이 타일링 PBR(albedo·normal·roughness)을 만든다.
python3 kworld/tools/gen_textures.py  → kworld/tex/<name>_{albedo.jpg,normal.png,rough.jpg}
"""
import numpy as np, os
from PIL import Image
from scipy.ndimage import gaussian_filter, distance_transform_edt

N = 1024
OUT = os.path.join(os.path.dirname(__file__), '..', 'tex')
rng = np.random.default_rng(7)

def tile_noise(n, freq, seed):
    """주기 노이즈: 저해상 난수를 타일 방식으로 부드럽게 키운다(가장자리 이어짐)"""
    r = np.random.default_rng(seed)
    g = r.random((freq, freq))
    y = (np.arange(n) / n * freq); x = y
    y0 = np.floor(y).astype(int) % freq; x0 = y0
    ty = y - np.floor(y); tx = ty
    s = lambda t: t * t * (3 - 2 * t)
    ty = s(ty)[:, None]; tx = s(tx)[None, :]
    a = g[y0][:, x0]; b = g[y0][:, (x0 + 1) % freq]; c = g[(y0 + 1) % freq][:, x0]; d = g[(y0 + 1) % freq][:, (x0 + 1) % freq]
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty

def fbm(n, base=4, octaves=6, seed=1, gain=.5, ridged=False):
    out = np.zeros((n, n)); amp = 1; f = base; tot = 0
    for o in range(octaves):
        v = tile_noise(n, f, seed + o * 31)
        if ridged: v = 1 - abs(v * 2 - 1)
        out += v * amp; tot += amp; amp *= gain; f *= 2
    return out / tot

def worley(n, cells, seed):
    r = np.random.default_rng(seed)
    pts = (r.random((cells, cells, 2)) + np.indices((cells, cells)).transpose(1, 2, 0)) / cells
    pts = pts.reshape(-1, 2)
    ys, xs = np.mgrid[0:n, 0:n] / n
    d1 = np.full((n, n), 9.0); d2 = np.full((n, n), 9.0)
    for p in pts:
        for oy in (-1, 0, 1):
            for ox in (-1, 0, 1):
                d = np.hypot(xs - (p[0] + ox), ys - (p[1] + oy))
                m = d < d1; d2 = np.where(m, d1, np.minimum(d2, d)); d1 = np.where(m, d, d1)
    return d1 * cells, d2 * cells

def normal_from_height(h, strength=2.0):
    gy, gx = np.gradient(h)
    k = strength * 60.0; nx = -gx * k; ny = -gy * k; nz = np.ones_like(h)
    l = np.sqrt(nx * nx + ny * ny + nz * nz)
    return np.stack([nx / l, ny / l, nz / l], -1) * .5 + .5

def save(name, albedo, height, rough, hstrength):
    os.makedirs(OUT, exist_ok=True)
    Image.fromarray((np.clip(albedo, 0, 1) * 255).astype(np.uint8)).save(f'{OUT}/{name}_albedo.jpg', quality=86, optimize=True)
    nm = normal_from_height(height, hstrength)
    Image.fromarray((np.clip(nm, 0, 1) * 255).astype(np.uint8)).resize((N // 2, N // 2), Image.LANCZOS).save(f'{OUT}/{name}_normal.png', optimize=True)
    Image.fromarray((np.clip(rough, 0, 1) * 255).astype(np.uint8)).resize((N // 2, N // 2), Image.LANCZOS).save(f'{OUT}/{name}_rough.jpg', quality=80)
    print(name, 'ok')

def col(hex_):
    return np.array([int(hex_[i:i + 2], 16) / 255 for i in (0, 2, 4)])

def mix(a, b, t):
    a = np.broadcast_to(a, (N, N, 3)); b = np.broadcast_to(b, (N, N, 3))
    return a * (1 - t[..., None]) + b * t[..., None]

# ---------- 바위: 굵은 굴곡 + 잔주름 + 균열(월리 경계) ----------
def rock():
    big = fbm(N, 3, 5, 11); fine = fbm(N, 24, 4, 12, ridged=True); d1, d2 = worley(N, 6, 13)
    crack = np.clip((d2 - d1) * 5.0, 0, 1)  # 0 = 균열
    crack = 1 - (1 - crack) * np.clip((fbm(N, 3, 3, 16) - .42) * 4, 0, 1)  # 일부 구역에만 균열
    h = big * .55 + fine * .25 + crack * .2
    h = gaussian_filter(h, 2.0)
    tone = fbm(N, 5, 3, 14)
    a = mix(col('7d786c'), col('9b9384'), tone)
    a = mix(a, col('5c5a52'), (1 - crack) * .9)  # 균열 어둡게
    a *= (0.75 + fine * .35)[..., None]
    lichen = np.clip(fbm(N, 7, 4, 15) - .58, 0, 1) * 3
    a = mix(a, col('8a9a63'), np.clip(lichen, 0, .3))
    r = .78 + fine * .18 - lichen * .1
    save('rock', a, h, r, 1.0)

# ---------- 흙: 잔알갱이 + 자갈 + 축축한 얼룩 ----------
def dirt():
    grain = fbm(N, 64, 3, 21); patch = fbm(N, 4, 4, 22); d1, _ = worley(N, 28, 23)
    pebble = np.clip(1 - d1 * 1.6, 0, 1) ** 2 * (fbm(N, 14, 2, 24) > .55)
    h = gaussian_filter(grain * .35 + patch * .35 + pebble * .3, 1.5)
    a = mix(col('6f5b44'), col('8d7a5e'), patch)
    a = mix(a, col('4e4033'), np.clip(fbm(N, 6, 3, 25) - .5, 0, .4) * 2.2)  # 축축한 곳
    a = mix(a, col('9a948a'), pebble * .8)
    a *= (0.85 + grain * .3)[..., None]
    r = .93 - pebble * .25 - np.clip(fbm(N, 6, 3, 25) - .5, 0, .4) * .5
    save('dirt', a, h, r, 0.45)

# ---------- 풀밭 바닥: 풀덤불 얼룩 + 흙 드러난 곳 ----------
def grass():
    tuft = fbm(N, 48, 4, 31, ridged=True); patch = fbm(N, 5, 4, 32); bare = np.clip(fbm(N, 6, 3, 33) - .62, 0, 1) * 3
    h = gaussian_filter(tuft * .5 + patch * .3 + bare * .2, 1.2)
    a = mix(col('5c6f3a'), col('7f8c48'), patch)
    a = mix(a, col('a3a052'), np.clip(tuft - .55, 0, 1) * 1.5)   # 마른 끝
    a = mix(a, col('6f5b44'), np.clip(bare, 0, 1))
    a *= (0.8 + tuft * .35)[..., None]
    r = .92 - np.clip(bare, 0, 1) * .05
    save('grass', a, h, r, 0.5)

# ---------- 나무껍질: 세로 능선 + 비틀림 + 깊은 골 ----------
def bark():
    ys, xs = np.mgrid[0:N, 0:N] / N
    warp = fbm(N, 6, 4, 41)
    ridge = 1 - abs(np.sin((xs + warp * .12) * np.pi * 28) )
    ridge = ridge ** 1.6
    fine = fbm(N, 40, 3, 42); knots = np.clip(fbm(N, 4, 3, 43) - .6, 0, 1) * 2.5
    h = gaussian_filter(ridge * .6 + fine * .25 + knots * .15, 1.5)
    a = mix(col('3f3123'), col('6b5540'), ridge)
    a = mix(a, col('2b221a'), (1 - ridge) ** 3 * .9)
    a = mix(a, col('7a6a4c'), knots * .4)
    a *= (0.85 + fine * .3)[..., None]
    r = .9 - ridge * .1
    save('bark', a, h, r, 0.8)

if __name__ == '__main__':
    rock(); dirt(); grass(); bark()

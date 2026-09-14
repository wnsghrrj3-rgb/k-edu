# 원본 preview.png vs 케이메이커 렌더 — 텍스트별 잉크 상자 대조 (1800×600, 0.6 배)
import json, sys
from PIL import Image
S = 0.6
tpl = json.load(open('assets/tplpkg/forest-weekend/template.json'))
texts = [o for o in tpl['objects'] if o['type'] == 'text']
def hexrgb(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def ink(im, box, col, pad=(20, 30, 20, 30)):
    x, y, w, h = box; x0 = max(0, int(x*S - pad[0])); y0 = max(0, int(y*S - pad[1])); x1 = min(im.width, int((x+w)*S + pad[2])); y1 = min(im.height, int((y+h)*S + pad[3]))
    px = im.load(); xs = []; ys = []
    for yy in range(y0, y1):
        for xx in range(x0, x1):
            r, g, b = px[xx, yy][:3]
            if abs(r-col[0]) + abs(g-col[1]) + abs(b-col[2]) < 60: xs.append(xx); ys.append(yy)
    if not xs: return None
    return (min(xs), min(ys), max(xs), max(ys))
def run(path, label):
    im = Image.open(path).convert('RGB'); ref = Image.open('assets/tplpkg/forest-weekend/preview.png').convert('RGB')
    print(f'== {label} ({path})  값 = 케이메이커 − 원본 (px, 1800폭 기준)')
    worst = 0
    for o in texts:
        box = (o['x'], o['y'], o['width'], o['height']); col = hexrgb(o['fill'])
        a = ink(ref, box, col); b = ink(im, box, col)
        if not a or not b: print(f"  {o['id']:18s} 잉크 없음 원본={a} KM={b}"); worst = 999; continue
        d = tuple(b[i]-a[i] for i in range(4)); worst = max(worst, max(abs(v) for v in d))
        print(f"  {o['id']:18s} 원본 L{a[0]} T{a[1]} R{a[2]} B{a[3]} (w{a[2]-a[0]} h{a[3]-a[1]}) | Δ L{d[0]:+d} T{d[1]:+d} R{d[2]:+d} B{d[3]:+d}")
    print(f'  최대 편차 {worst}px')
    return worst
if __name__ == '__main__':
    tag = sys.argv[1] if len(sys.argv) > 1 else 'before'
    run(f'shots/round155-dom-{tag}.png', 'DOM 화면'); run(f'shots/round155-svg-{tag}.png', 'SVG 출력')

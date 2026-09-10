# -*- coding: utf-8 -*-
"""프레임 시퀀스(hero_emblem.py --sec 2.6 산출) → 스프라이트 시트 한 장 + 메타.
   python make-sprite.py <프레임폴더> emblem-in   →  emblem-in.png · emblem-in.json (cols·cell·frames·fps)
   정면 한 장(--still 3.0 산출 still.png)은 그대로 emblem.png 로 복사."""
import sys, os, json, math
from PIL import Image
src, name = sys.argv[1], sys.argv[2]
files = sorted(f for f in os.listdir(src) if f.startswith('emblem_') and f.endswith('.png'))
meta = json.load(open(os.path.join(src, 'emblem.json')))
cell = meta['width']; n = len(files); cols = math.ceil(math.sqrt(n)); rows = math.ceil(n / cols)
sheet = Image.new('RGBA', (cols * cell, rows * cell), (0, 0, 0, 0))
for i, f in enumerate(files):
    sheet.paste(Image.open(os.path.join(src, f)).convert('RGBA'), ((i % cols) * cell, (i // cols) * cell))
here = os.path.dirname(os.path.abspath(__file__))
sheet.save(os.path.join(here, name + '.png'), optimize=True)
json.dump({'cols': cols, 'rows': rows, 'cell': cell, 'frames': n, 'fps': meta['fps']}, open(os.path.join(here, name + '.json'), 'w'))
print(name, cols, rows, cell, n, os.path.getsize(os.path.join(here, name + '.png')) // 1024, 'KB')

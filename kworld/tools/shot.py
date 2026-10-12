#!/usr/bin/env python3
"""헤드리스 크로미움으로 케이월드 한 시대 화면 한 장 찍기.
사용: python3 -m http.server 8787 (k-edu 루트) 를 먼저 띄우고
  python3 kworld/tools/shot.py <era> [out.png] [--mini out_mini.png] [--info]
요령: 20초 기다린 뒤 rAF·setTimeout 을 끊고 찍는다(안 끊으면 스크린샷이 30초 넘겨 죽음).
"""
import sys, json, time
from playwright.sync_api import sync_playwright

era = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else f'/tmp/shot_{era}.png'
mini = sys.argv[sys.argv.index('--mini') + 1] if '--mini' in sys.argv else None
info = '--info' in sys.argv
url = f'http://127.0.0.1:8787/kworld/?era={era}&resume=0&friends=0'

with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 1280, 'height': 720})
    logs = []; pg.on('console', lambda m: logs.append(f'{m.type}: {m.text}')); pg.on('pageerror', lambda e: logs.append(f'pageerror: {e}'))
    pg.goto(url, wait_until='load', timeout=120000)
    for _ in range(10):   # 태어남 카드·넘겨받기·프롤로그의 primary 단추를 눌러 세상으로
        time.sleep(3)
        n = pg.evaluate("() => { const b = document.querySelector('#panel.open .pbtns button.primary'); if (!b) return 0; b.click(); return 1; }")
        if n: time.sleep(1.5)
    time.sleep(14)
    meta = pg.evaluate("""() => { const g = window.kworld; const e = g?.e; const p = g?.p;
      return { hm: !!e?.hm, spawn: e?.spawn && [e.spawn.x, e.spawn.y, e.spawn.z], pos: p?.pos && [p.pos.x, p.pos.y, p.pos.z],
        ground: (e && p) ? e.groundY(p.pos.x, p.pos.z) : null, deep: g?.world?.deepWater ?? null, areas: e?.areas?.size ?? null, fps: g?.fps ?? null }; }""")
    pg.evaluate("() => { window.requestAnimationFrame = () => 0; window.setTimeout = () => 0; }")
    time.sleep(0.5)
    pg.screenshot(path=out, timeout=90000)
    if mini:
        data = pg.evaluate("() => { const c = document.querySelector('#minimap'); return c ? c.toDataURL() : null; }")
        if data:
            import base64; open(mini, 'wb').write(base64.b64decode(data.split(',')[1]))
    b.close()
print(json.dumps({'era': era, 'out': out, **(meta or {})}, ensure_ascii=False))
if info:
    for l in logs[-25:]: print('  ', l)

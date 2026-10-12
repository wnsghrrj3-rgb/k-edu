#!/usr/bin/env python3
"""헤드리스 크로미움으로 케이월드 한 시대 화면 한 장 찍기.
사용: python3 -m http.server 8787 (k-edu 루트) 를 먼저 띄우고
  python3 kworld/tools/shot.py <era> [out.png] [--mini out_mini.png] [--info] [--at <area_id|x,z>] [--yaw <rad>] [--pitch <rad>]
  --at: 세상에 들어간 뒤 플레이어를 그 구역(`area_*` 이름에서 area_ 뺀 id)이나 엔진 좌표(x,z — z = -블렌더 y)로 옮겨 찍는다(마을 밖 자리 확인용).
       --yaw 없으면 가장 가까운 ix_ 소품에서 7m 물러나 그쪽을 본다(소품 속에 서지 않게; 선 자리와 3인칭 카메라 자리가 col_ 상자에서 2m 이상 떨어진 곳 우선). 열린 카드는 닫는다.
요령: 20초 기다린 뒤 rAF·setTimeout 을 끊고 찍는다(안 끊으면 스크린샷이 30초 넘겨 죽음).
"""
import sys, json, time
from playwright.sync_api import sync_playwright

era = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else f'/tmp/shot_{era}.png'
mini = sys.argv[sys.argv.index('--mini') + 1] if '--mini' in sys.argv else None
info = '--info' in sys.argv
at = sys.argv[sys.argv.index('--at') + 1] if '--at' in sys.argv else None
yaw = float(sys.argv[sys.argv.index('--yaw') + 1]) if '--yaw' in sys.argv else None
pitch = float(sys.argv[sys.argv.index('--pitch') + 1]) if '--pitch' in sys.argv else None
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
    time.sleep(6)
    if at:
        pg.evaluate("""([at, yaw, pitch]) => { const g = window.kworld; const e = g.e, p = g.p; if (!e || !p) return;
          let x, z; const m = /^(-?[\\d.]+),(-?[\\d.]+)$/.exec(at);
          if (m) { x = +m[1]; z = +m[2]; } else { const a = e.areas.get(at); if (!a) throw new Error('no area ' + at); x = a.x; z = a.z; }
          if (yaw != null) { p.pos.set(x, e.groundY(x, z) + p.eye, z); p.yaw = yaw; } else {
            // 가장 가까운 ix_ 소품을 찾아 그쪽을 보되, 소품에서 7m 물러난 자리에 선다(3인칭 카메라가 소품·사람 속에 묻히지 않게)
            let best = null, bd = 1e9;
            for (const it of e.interactables.values()) { const v = it.center; const d = Math.hypot(v.x - x, v.z - z); if (d < bd) { bd = d; best = v; } }
            if (best) {
              const dx = best.x - x, dz = best.z - z, L = Math.hypot(dx, dz);
              const a0 = Math.atan2(L > 0.5 ? dz / L : 1, L > 0.5 ? dx / L : 0);
              const deep = g.world?.deepWater ?? -1;
              let found = null;
              // 소품에서 7m 떨어진 자리를 8방향으로 돌며 col_ 상자·깊은 물이 아닌 자리에 선다.
              // 3인칭 카메라(어깨 뒤 3.5m)까지 지붕·담에 안 묻히게 — 선 자리와 카메라 자리 둘 다 col_ 상자에서 2m 이상 떨어진 곳을 먼저 찾고, 없으면 예전처럼 안 겹치는 첫 자리
              const clear = (x, z) => { let m = 1e9; for (const b of e.colliders) { const dx = Math.max(b.min.x - x, 0, x - b.max.x), dz = Math.max(b.min.z - z, 0, z - b.max.z); m = Math.min(m, Math.hypot(dx, dz)); } return m; };
              const cands = [];
              for (const R of [7, 5, 9, 11]) for (let k = 0; k < 8; k++) {
                const a = a0 + Math.PI + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * Math.PI / 4;
                const cx = best.x + Math.cos(a) * R, cz = best.z + Math.sin(a) * R;
                if (e.collides({ x: cx, z: cz }, p.eye)) continue;
                if (e.groundY(cx, cz) < deep) continue;
                const yw = Math.atan2(-(best.x - cx), -(best.z - cz));
                const kx = cx + Math.sin(yw) * 3.5, kz = cz + Math.cos(yw) * 3.5;
                if (e.groundY(kx, kz) < deep) continue;
                cands.push([cx, cz, Math.min(clear(cx, cz), clear(kx, kz))]);
              }
              found = cands.find(c => c[2] >= 2.0) || cands[0] || null;
              if (found) { x = found[0]; z = found[1]; }
              p.yaw = Math.atan2(-(best.x - x), -(best.z - z));
            }
            p.pos.set(x, e.groundY(x, z) + p.eye, z); }
          if (pitch != null) p.pitch = pitch;
          if (p.ground !== undefined) p.ground = true; }""", [at, yaw, pitch])
        time.sleep(1)
        for _ in range(4):   # 옮긴 자리에서 열린 카드는 닫는다(사진은 세상만)
            n = pg.evaluate("() => { const b = document.querySelector('#panel.open .pbtns button'); if (!b) return 0; b.click(); return 1; }")
            if not n: break
            time.sleep(1)
    time.sleep(8)
    if at:
        for _ in range(4):   # 옮긴 자리에서 뒤늦게 열린 상황 카드도 닫는다
            n = pg.evaluate("() => { const b = document.querySelector('#panel.open .pbtns button'); if (!b) return 0; b.click(); return 1; }")
            if not n: break
            time.sleep(1.2)
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

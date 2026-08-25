#!/usr/bin/env python3
"""assemble.py — 활동 조립기 (Phase 3, 설계 §9-1 D1 '빌드 인라인 단일 HTML')

부품(core + genre + gen + src)을 하나의 HTML로 인라인해 산출한다.
호스트는 활동 내부를 모르고, 활동은 파일 하나로 어디서든 열린다.

사용:
    python3 build/assemble.py              # 카탈로그 전체 재조립
    python3 build/assemble.py g1m_u5_balance   # 하나만

입력(관례 — 카탈로그가 단일 원천):
    _CATALOG.json 의 id / title / short / genre / gen / gens(선택, 부품 생성기) / src
    src/{id}.js     활동 정의 (무대·연출)      [필수]
    src/{id}.css    무대 스타일                 [선택]
출력:
    카탈로그의 src 경로 (예: activities/g1m_u5_balance.html → kedu/activities/g1m_u5_balance.html)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # kedu/activities
KEDU = ROOT.parent                                      # kedu

# 장르 → 게임 루프 엔진 (§9-3: 문제 스트림형 / 무대형)
GENRE_ENGINE = {
    'balance': 'stream',
    'duel_quiz': 'stream',
    'relay': 'relay',        # 반 전체 릴레이 — 승패 없는 협력형 (§10-5)
    'sequence': 'sequence',      # 무대형 — 카드를 순서대로 탭 (§10-4)
    # bundle · sort · explore는 활동 자체 루프 — 엔진 없이 core만 쓴다
}

SHELL = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<title>{title} — K✦edu</title>
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Nunito:wght@800&display=swap" rel="stylesheet">
<!-- 이 파일은 build/assemble.py가 조립했습니다. 직접 수정하지 마세요.
     원본: src/{aid}.js (+ src/{aid}.css) · core/activity-core.* · core/ko.js · core/genre/{engine}.js · {gen_path} -->
<style>
{css}
</style>
</head>
<body>
<div id="a-root"></div>

<!-- 케이박스 스택 (assign 제출용 — 없으면 조용히 무시됨) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/kedu_config.js"></script>
<script src="/kedu_kbox_adapter.js"></script>

<script>
{bridge}
</script>
<script>
{core}
</script>
<script>
{ko}
</script>
{engine_block}
{gen_block}
<script>
{src}
</script>
</body>
</html>
"""


def read(p: Path) -> str:
    return p.read_text(encoding='utf-8').strip()


def build(item: dict) -> Path:
    aid = item['id']
    genre = item.get('genre', '')
    engine = GENRE_ENGINE.get(genre)

    src_js = ROOT / 'src' / f'{aid}.js'
    if not src_js.exists():
        raise SystemExit(f'[{aid}] 활동 정의가 없습니다: {src_js}')

    css = read(ROOT / 'core' / 'activity-core.css')
    src_css = ROOT / 'src' / f'{aid}.css'
    if src_css.exists():
        css += '\n\n/* ── 무대 스타일 ── */\n' + read(src_css)

    engine_block = ''
    if engine:
        engine_block = '<script>\n' + read(ROOT / 'core' / 'genre' / f'{engine}.js') + '\n</script>'

    gen_path = ROOT / item['gen'] if item.get('gen') else None
    if gen_path and not gen_path.exists():
        raise SystemExit(f'[{aid}] 생성기가 없습니다: {gen_path}')

    # §5-1 gens [v3.34]: 혼합 생성기가 위임하는 부품 생성기 — gen보다 먼저 인라인한다 (브라우저에서 GENS[이름]으로 찾는다)
    gen_block = ''
    for sub in item.get('gens', []):
        sub_path = ROOT / sub
        if not sub_path.exists():
            raise SystemExit(f'[{aid}] 부품 생성기가 없습니다: {sub_path}')
        gen_block += '<script>\n' + read(sub_path) + '\n</script>\n'
    gen_block += ('<script>\n' + read(gen_path) + '\n</script>') if gen_path else ''

    html = SHELL.format(
        title=item.get('title', aid),
        aid=aid,
        engine=engine or 'none',
        gen_path=item.get('gen', '(생성기 없음)'),
        css=css,
        bridge=read(ROOT / 'core' / 'bridge.js'),
        core=read(ROOT / 'core' / 'activity-core.js'),
        ko=read(ROOT / 'core' / 'ko.js'),
        engine_block=engine_block,
        gen_block=gen_block,
        src=read(src_js),
    )

    out = KEDU / item['src']
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')
    return out


def main():
    catalog = json.loads((ROOT / '_CATALOG.json').read_text(encoding='utf-8'))
    want = sys.argv[1:]
    targets = [a for a in catalog if not want or a['id'] in want]
    if not targets:
        raise SystemExit('대상 없음 — 카탈로그에 없는 id입니다: ' + ', '.join(want))
    for item in targets:
        out = build(item)
        kb = out.stat().st_size / 1024
        warn = '  ⚠️ 400KB 초과 (§16-2)' if kb > 400 else ''
        print(f'✅ {item["id"]:22s} → {out.relative_to(KEDU.parent)}  ({kb:.0f}KB){warn}')


if __name__ == '__main__':
    main()

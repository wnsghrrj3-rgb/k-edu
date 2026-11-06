#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""교과서판 2학기(2026-11-06) — 한 단원의 옛 「비슷하게」 세트를 「응용」으로 돌린다.

  python3 kedu/worksheet/tools/tb_flip.py g6_2_math_u1            # 미리 보기(아무것도 안 씀)
  python3 kedu/worksheet/tools/tb_flip.py g6_2_math_u1 --write    # 세트 kind·연결표를 고침

전제: 같은 단원의 교과서판 세트 tb_<접두>_… 가 data/ 에 먼저 있어야 한다(없으면 멈춤).
하는 일
  1) 옛 세트(이름 = <접두>_…) kind: lesson_basic·lesson_challenge → lesson_apply, unit_review → unit_apply
     이름·qcode 는 그대로(풀이 기록 유지).
  2) _lesson_map.json 그 단원 줄: 옛 basic·challenge·review → apply 칸으로 옮기고,
     basic·challenge·review 는 같은 이름의 tb_ 세트가 있으면 그것으로, 없으면 칸을 비운다(경고).
     교과서판 차시가 옛것과 다르면 이 뒤에 손으로 줄을 맞춘다 — check_sets 가 어긋남을 잡는다.
  3) 원장: sets_to_seed.py <접두> 와 tb_<접두> 를 다시 넣으면 ON CONFLICT 로 source_kind 가 맞춰진다.
     SQL 편집기로 바로 맞추고 싶으면 이 도구가 찍는 UPDATE 한 줄을 쓴다.
"""
import json, os, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
DATA = os.environ.get('KWS_DATA') or os.path.join(ROOT, 'data')
if len(sys.argv) < 2: sys.exit(__doc__)
P = sys.argv[1].rstrip('_')
WRITE = '--write' in sys.argv
FLIP = {'lesson_basic': 'lesson_apply', 'lesson_challenge': 'lesson_apply', 'unit_review': 'unit_apply'}

files = sorted(f for f in os.listdir(DATA) if f.endswith('.json') and not f.startswith('_'))
old = [f[:-5] for f in files if f.startswith(P + '_')]
tb = set(f[:-5] for f in files if f.startswith('tb_' + P + '_'))
if not tb: sys.exit('교과서판 세트(tb_%s_…)가 없다 — 교과서판을 먼저 짓는다' % P)
if not old: sys.exit('옛 세트(%s_…)가 없다' % P)

flipped = []
for nm in old:
    p = os.path.join(DATA, nm + '.json'); d = json.load(open(p, encoding='utf-8'))
    k = d.get('kind')
    if k in FLIP:
        d['kind'] = FLIP[k]; flipped.append(nm)
        if WRITE:
            with open(p, 'w', encoding='utf-8') as fp: json.dump(d, fp, ensure_ascii=False, indent=2); fp.write('\n')
    elif k not in ('lesson_apply', 'unit_apply'):
        print('  · 그대로 둠(%s): %s' % (k, nm))

mp = os.path.join(DATA, '_lesson_map.json'); m = json.load(open(mp, encoding='utf-8'))
warn = []
for key, L in m['lessons'].items():
    if not key.startswith(P + '_'): continue
    apply = list(L.get('apply') or [])
    for slot in ('basic', 'challenge'):
        s = L.get(slot)
        if not s or s.startswith('tb_'): continue
        if s not in apply: apply.append(s)
        if 'tb_' + s in tb: L[slot] = 'tb_' + s
        else: L.pop(slot); warn.append('%s.%s — tb_%s 없음, 칸 비움' % (key, slot, s))
    if L.get('review'):
        rv = []
        for s in L['review']:
            if s.startswith('tb_'): rv.append(s); continue
            if s not in apply: apply.append(s)
            if 'tb_' + s in tb: rv.append('tb_' + s)
            else: warn.append('%s.review — tb_%s 없음' % (key, s))
        L['review'] = rv
        if not rv: L.pop('review')
    if apply: L['apply'] = apply
if WRITE:
    with open(mp, 'w', encoding='utf-8') as fp: json.dump(m, fp, ensure_ascii=False, indent=2); fp.write('\n')

print('%s 응용 전환 %d세트%s' % (P, len(flipped), '' if WRITE else ' (미리 보기 — --write 로 씀)'))
for x in warn: print('  ⚠', x)
if flipped:
    def q(s): return "'" + s.replace("'", "''") + "'"
    for kind in ('lesson_apply', 'unit_apply'):
        ns = [n for n in flipped if json.load(open(os.path.join(DATA, n + '.json'), encoding='utf-8'))['kind'] == kind] if WRITE else \
             [n for n in flipped if (kind == 'unit_apply') == ('_review_' in n)]
        if ns: print("UPDATE question_bank SET source_kind=%s WHERE source_set IN (%s);" % (q(kind), ','.join(q(n) for n in ns)))

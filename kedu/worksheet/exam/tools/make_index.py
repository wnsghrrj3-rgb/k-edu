#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""케이학습지 세트 목록 → 시험지 화면용 색인(exam/sets_index.json)

  python3 kedu/worksheet/exam/tools/make_index.py

세트(data/*.json)를 새로 올리면 한 번 다시 돌린다. 학년·학기·과목 → 단원 → 세트 이름.
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
DATA = os.path.join(ROOT, 'data')
idx = {}
for f in sorted(os.listdir(DATA)):
    if not f.endswith('.json') or f.startswith('_'): continue
    d = json.load(open(os.path.join(DATA, f), encoding='utf-8'))
    key = 'g%d_%d_%s' % (d['grade'], d.get('semester', 1), d['subject'])
    u = idx.setdefault(key, {}).setdefault(d['unit'], {'name': d.get('unitName', d['unit']), 'sets': [], 'n': 0})
    u['sets'].append(f[:-5]); u['n'] += len(d.get('questions', []))
    if f.startswith('tb_') and d.get('unitName'): u['name'] = d['unitName']
out = {k: [dict(unit=u, **v) for u, v in sorted(units.items(), key=lambda x: int(re.sub(r'\D', '', x[0]) or 0))] for k, units in sorted(idx.items())}
json.dump(out, open(os.path.join(ROOT, 'exam', 'sets_index.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'keys', sum(len(v) for v in out.values()), 'units')

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""세트 JSON → 원장 시드 SQL (케이학습지 양산 도구)

  python3 kedu/worksheet/tools/sets_to_seed.py g1_2_math_u1 > sql/seed_worksheet_g1_2_math_u1.sql

정본은 언제나 kedu/worksheet/data/*.json — 이 스크립트는 그 파일을 원장(concepts·misconceptions·
question_bank)에 싣는 적재본을 만든다. qcode UNIQUE 기준 UPSERT 라 재실행해도 안전하다.
8-31 양산 때 쓴 변환기는 스크립트로 남지 않아 재현이 안 됐다 — 이제 남는다.
"""
import json, os, sys, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
DATA = os.path.join(ROOT, 'data')
PREFIX = sys.argv[1] if len(sys.argv) > 1 else ''

def q(s):
    return "'" + str(s).replace("'", "''") + "'"

def arr(xs):
    if not xs: return "'{}'::text[]"
    return "ARRAY[" + ",".join(q(x) for x in xs) + "]::text[]"

sets = sorted(f for f in os.listdir(DATA)
              if f.endswith('.json') and not f.startswith('_') and f.startswith(PREFIX))
if not sets:
    sys.exit('세트가 없다: 접두사 ' + PREFIX)

dic = json.load(open(os.path.join(DATA, '_concepts.json'), encoding='utf-8'))
docs = [json.load(open(os.path.join(DATA, f), encoding='utf-8')) for f in sets]
head = docs[0]
grade, subject, unit = head['grade'], head['subject'], head['unit']
semester = head.get('semester', 1)
unit_name = head.get('unitName', unit)

# 이 단원이 실제로 쓰는 코드만 싣는다
used_c, used_m = set(), set()
for d in docs:
    for x in d['questions']:
        if x.get('concept'): used_c.add(x['concept'])
        for o in (x.get('options') or []) + (x.get('reason_options') or []):
            for k in ('mis', 'mis_target'):
                if o.get(k): used_m.add(o[k])

out = []
w = out.append
w('-- =============================================')
w('-- seed_worksheet_%s.sql' % PREFIX)
w('-- %d학년 %d학기 %s %s 「%s」 — 개념 %d · 오개념 %d · 문항 %d'
  % (grade, semester, {'math': '수학'}.get(subject, subject), unit, unit_name,
     len(used_c), len(used_m), sum(len(d['questions']) for d in docs)))
w('-- 생성: kedu/worksheet/tools/sets_to_seed.py (파일이 정본, 이 파일은 적재본)')
w('-- 의존: setup_worksheet_bank.sql')
w('-- 멱등 — code·qcode UNIQUE 기준 UPSERT. 재실행하면 원장이 파일 상태로 맞춰진다.')
w('-- =============================================')
w('')
w('-- [1] 개념 트리')
for code in sorted(used_c, key=lambda c: dic['concepts'][c].get('order', 0)):
    c = dic['concepts'][code]
    lesson_no = int(re.sub(r'\D', '', c.get('lesson', '0')) or 0)
    w("INSERT INTO concepts (code,subject,grade,semester,unit_code,lesson_no,name,achievement_codes,ord) VALUES "
      "(%s,%s,%d,%d,%s,%d,%s,%s,%d) ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, "
      "lesson_no=EXCLUDED.lesson_no, achievement_codes=EXCLUDED.achievement_codes, ord=EXCLUDED.ord;"
      % (q(code), q(c.get('subject', subject)), c.get('grade', grade), c.get('semester', semester),
         q(c.get('unit', unit)), lesson_no, q(c.get('full') or c['name']),
         arr([c['achievement']] if c.get('achievement') else []), c.get('order', 0)))
w('')
w('-- [2] 오개념 사전')
for code in sorted(used_m):
    m = dic['misconceptions'][code]
    w("INSERT INTO misconceptions (code,subject,grade,unit_code,concept_codes,title,teacher_hint) VALUES "
      "(%s,%s,%d,%s,%s,%s,%s) ON CONFLICT (code) DO UPDATE SET title=EXCLUDED.title, "
      "teacher_hint=EXCLUDED.teacher_hint, concept_codes=EXCLUDED.concept_codes;"
      % (q(code), q(subject), grade, q(unit), arr(m.get('concepts')), q(m['text']), q(m['hint'])))
w('')
w('-- [3] 문항 %d' % sum(len(d['questions']) for d in docs))
for f, d in zip(sets, docs):
    name = f[:-5]
    w('')
    w('-- %s (%s)' % (name, d['title']))
    for x in d['questions']:
        mis = []
        for o in (x.get('options') or []) + (x.get('reason_options') or []):
            for k in ('mis', 'mis_target'):
                if o.get(k) and o[k] not in mis: mis.append(o[k])
        grading = 'teacher' if x['kind'] == 'essay' else 'auto'
        w("INSERT INTO question_bank (qcode,subject,grade,semester,unit_code,lesson_code,source_set,source_kind,"
          "concept_code,difficulty,qkind,grading,stem,misconception_codes,has_variant,payload) VALUES "
          "(%s,%s,%d,%d,%s,%s,%s,%s,%s,%d,%s,%s,%s,%s,%s,%s::jsonb) ON CONFLICT (qcode) DO UPDATE SET "
          "concept_code=EXCLUDED.concept_code, difficulty=EXCLUDED.difficulty, qkind=EXCLUDED.qkind, "
          "grading=EXCLUDED.grading, stem=EXCLUDED.stem, misconception_codes=EXCLUDED.misconception_codes, "
          "has_variant=EXCLUDED.has_variant, payload=EXCLUDED.payload, is_active=true;"
          % (q('%s#%d' % (name, x['seq'])), q(d['subject']), d['grade'], d.get('semester', 1), q(d['unit']),
             q(d.get('lesson') or ''), q(name), q(d['kind']), q(x['concept']), x['difficulty'],
             q(x['kind']), q(grading), q(x['stem']), arr(mis),
             'true' if x.get('variant_rule') else 'false',
             q(json.dumps(x, ensure_ascii=False, separators=(',', ':')))))
w('')
w('-- 검산: SELECT count(*) FROM question_bank WHERE source_set LIKE %s;  -- %d 이어야 한다'
  % (q(PREFIX + '%'), sum(len(d['questions']) for d in docs)))
print('\n'.join(out))

#!/usr/bin/env python3
"""수행과제 카드(MD, 핸드오프 kedu/worksheet/g1_math_u1/수행과제_NN.md) → seed_perf_g1_math_u1.sql
   카드 규격(문항수행 설계 v1 §6): 영역·성취기준·산출물·연결 차시·학생 라벨·과제문·조건 3·루브릭 3×3·anchor 3·관찰 포인트 3(M코드)
   사용: python3 perf_cards_to_seed.py <카드 폴더> > sql/seed_perf_g1_math_u1.sql
"""
import re, sys, json, os, glob

def parse(path):
    s = open(path, encoding='utf-8').read()
    d = {'code': os.path.basename(path).replace('.md', '')}
    m = re.search(r'^# \[수행과제\] (\d)학년 (\S+) (\d+)단원 — 「(.+?)」', s, re.M)
    d['grade'], d['subject_ko'], d['unit_no'], d['title'] = int(m.group(1)), m.group(2), int(m.group(3)), m.group(4)
    d['subject'] = {'수학': 'math', '국어': 'korean', '과학': 'science', '사회': 'social', '영어': 'english'}[d['subject_ko']]
    d['unit_code'] = 'u%d' % d['unit_no']
    def field(name):
        m = re.search(r'^- \*\*' + name + r'[^*]*\*\*: (.+)$', s, re.M); return m.group(1).strip() if m else ''
    d['area'] = field('영역'); d['std_code'] = field('성취기준'); prod = field('산출물'); d['lesson_link'] = field('연결 차시')
    m = re.search(r'^- \*\*학생 화면 라벨\*\*: 「(.+?)」', s, re.M); d['student_label'] = m.group(1)
    m = re.search(r'^- \*\*개념\*\*: (\S+)', s, re.M); d['concept_code'] = m.group(1) if m else None
    # §8-③ v0 제출은 사진·글 둘 — 산출물에 사진/그림/카드/장면 이 있으면 photo, 아니면 text
    head = prod.split('(')[0].strip().lower()
    d['product_kind'] = 'text' if head.startswith('text') else ('photo' if re.search(r'사진|그림|카드|장면|artwork|artifact|photo', prod) else 'text')
    # 과제문 = 인용 블록
    sec = lambda h: (re.search(r'^## ' + h + r'[^\n]*\n([\s\S]*?)(?=^## |\Z)', s, re.M) or [None, ''])[1]
    d['task_text'] = ' '.join(l.strip()[1:].strip() for l in sec('과제문').split('\n') if l.strip().startswith('>'))
    d['conditions'] = [re.sub(r'^\d+\.\s*', '', l.strip()) for l in sec('조건').split('\n') if re.match(r'^\d+\.', l.strip())]
    rows = [l for l in sec('루브릭').split('\n') if l.startswith('|') and not re.match(r'^\|\s*-', l) and l.split('|')[2].strip() != '잘함']
    levels = ['잘함', '보통', '노력 요함']
    d['rubric'] = {'criteria': [{'name': c[1].strip(), 'levels': [{'label': levels[i], 'desc': c[2 + i].strip()} for i in range(3)]}
                                for c in (r.split('|') for r in rows) if len(c) >= 5]}
    d['anchors'] = {}
    for lv in levels:
        m = re.search(r'^- \*\*' + lv + r'\*\*: (.+)$', sec('anchor'), re.M)
        if m: d['anchors'][lv] = m.group(1).strip()
    d['observe_points'] = []
    for l in sec('교사 관찰 포인트').split('\n'):
        m = re.match(r'^\d+\.\s*(.+?)\s*\(([^)]*)\)\s*$', l.strip())
        if m:   # 괄호 안이 M코드면 오개념 신호, 아니면(과정 중심 등) 코드 없는 관찰
            mc = re.match(r'^(M\d+)', m.group(2))
            d['observe_points'].append({'text': m.group(1), 'mis_code': mc.group(1) if mc else None, 'note': None if mc else m.group(2)})
    return d

def q(v): return "'" + str(v).replace('**', '').replace("'", "''") + "'"
def main(folder):
    cards = [parse(p) for p in sorted(glob.glob(os.path.join(folder, '수행과제_*.md')))]
    print('-- seed_perf_g1_math_u1.sql — 수행과제 카드 %d건 적재 (perf_cards_to_seed.py 산출, 재실행 안전: code UNIQUE UPSERT)' % len(cards))
    print('-- 선행: setup_worksheet_v4.sql (performance_tasks)')
    for d in cards:
        cols = ['code','grade','subject','unit_code','area','title','student_label','task_text','conditions','rubric','anchors','observe_points','std_code','lesson_link','concept_code','product_kind','source']
        vals = [q(d['code']), d['grade'], q(d['subject']), q(d['unit_code']), q(d['area']), q(d['title']), q(d['student_label']), q(d['task_text']),
                'ARRAY[' + ','.join(q(c) for c in d['conditions']) + ']::text[]',
                q(json.dumps(d['rubric'], ensure_ascii=False)) + '::jsonb', q(json.dumps(d['anchors'], ensure_ascii=False)) + '::jsonb',
                q(json.dumps(d['observe_points'], ensure_ascii=False)) + '::jsonb', q(d['std_code']), q(d['lesson_link']),
                q(d['concept_code']) if d['concept_code'] else 'NULL', q(d['product_kind']), "'kedu'"]
        print('INSERT INTO performance_tasks (%s) VALUES (%s)\n  ON CONFLICT (code) DO UPDATE SET %s, is_active=true;' % (
            ','.join(cols), ','.join(str(v) for v in vals), ', '.join('%s=EXCLUDED.%s' % (c, c) for c in cols[1:])))
    print('-- 검산: SELECT count(*) FROM performance_tasks;  → %d' % len(cards))
if __name__ == '__main__': main(sys.argv[1])

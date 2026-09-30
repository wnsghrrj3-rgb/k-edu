#!/usr/bin/env python3
"""parse_selfdirected_src.py — 자기주도 차시 HTML → 케이티처 재료 JSON (28~29차, 베프).
   사용: python3 parse_selfdirected_src.py <단원 폴더> <out.json>
   차시마다: 파일·제목(ka-where·pill)·slides[{stage,title,text}]·problems[{q,a|opts+ci,hints,pts}]·summary·next.
   <b>/<strong> → **굵게**, <br> → 줄바꿈."""
import sys, os, re, json, html

def clean(s):
    s = re.sub(r'<br\s*/?>', '\n', s)
    s = re.sub(r'</?(b|strong)>', '**', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    return '\n'.join(x.strip() for x in s.split('\n')).strip()

def first(pat, s, d=''):
    m = re.search(pat, s, re.S)
    return m.group(1) if m else d

def parse(path):
    src = open(path, encoding='utf-8').read()
    body = src.split('<div class="ka-m">', 1)[-1]
    parts = re.split(r'<div class="slide(?: active)?"', body)[1:]
    out = {'file': os.path.basename(path), 'pill': clean(first(r'class="ka-pill">(.*?)<', src)), 'slides': [], 'problems': [], 'summary': '', 'next': '', 'next_q': ''}
    m = re.search(r'LESSON_TITLE\s*=\s*[\'"](.*?)[\'"]', src)
    out['title'] = m.group(1) if m else re.sub(r'^g\d_\w+?_u\d+_l?\d+_', '', os.path.basename(path))[:-5]
    for p in parts:
        stage = first(r'data-stage="(.*?)"', p)
        if 'data-q-id' in p[:200]:
            q = {'stage': stage, 'q': clean(first(r'class="q-prompt">(.*?)</div>', p)),
                 'pts': int(first(r'data-q-points="(\d+)"', p, '0') or 0),
                 'hints': json.loads(html.unescape(first(r"data-hints='(.*?)'", p, '[]')))}
            a = first(r'data-answer="(.*?)"', p[:300], None)
            if a is not None: q['a'] = a
            opts = re.findall(r'<button class="mcq-opt" data-correct="(\d)">(.*?)</button>', p, re.S)
            if opts:
                q['opts'] = [clean(t) for _, t in opts]; q['ci'] = [c for c, _ in opts].index('1')
            if 'a' not in q and 'opts' not in q:  # 57차: 4학년 원문은 수 패드 답을 스크립트 setupPad('qN', 답, …) 에 둔다
                qid = first(r'data-q-id="(.*?)"', p)
                m2 = re.search(r"setupPad\(\s*'" + re.escape(qid) + r"'\s*,\s*([^,]+?)\s*,", src)
                if m2: q['a'] = m2.group(1).strip().strip('\'"')
            out['problems'].append(q); continue
        title = clean(first(r'class="slide-title">(.*?)</h2>', p))
        if 'summary-card' in p: out['summary'] = clean(first(r'class="summary-card">(.*?)</div>', p)); continue
        if 'next-card' in p:
            out['next'] = clean(first(r'class="next-label">(.*?)</div>', p)); out['next_q'] = clean(first(r'class="home-prompt">(.*?)</div>', p)); continue
        if 'self-stage' in p: continue
        text = clean(first(r'class="(?:intro-q|concept-box)">(.*?)</div>', p))
        out['slides'].append({'stage': stage, 'title': title, 'text': text})
    return out

if __name__ == '__main__':
    d, o = sys.argv[1], sys.argv[2]
    # 57차: 4학년 원문은 파일 이름이 g4_math_u1_03_… (l 없음) — 키는 u1_l03 으로 맞춘다
    files = sorted(f for f in os.listdir(d) if f.endswith('.html') and re.match(r'g\d_\w+_u\d+_l?\d+_', f))
    key = lambda f: (lambda m: 'u%d_l%02d' % (int(m.group(1)), int(m.group(2))))(re.search(r'_u(\d+)_l?(\d+)_', f))
    res = {key(f): parse(os.path.join(d, f)) for f in files}
    json.dump(res, open(o, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(o, len(res), '차시', sum(len(v['slides']) for v in res.values()), '개념 장', sum(len(v['problems']) for v in res.values()), '문제')

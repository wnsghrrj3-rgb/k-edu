#!/usr/bin/env python3
"""parse_selfdirected_g1s2.py — 1학년 2학기 자기주도 차시 HTML(ka 틀 · 2026 새 판) → 케이티처 재료 JSON (121차 · 123차 2단원 그림, 베프).
   사용: python3 parse_selfdirected_g1s2.py <단원 폴더> <out.json>
   원문 꼴: slide-title(제목·물음) · stage 안 p.cap/prompt/speech · tao-row(10개씩 묶음 막대·낱개·큰 수) · goods(이모지 묶음·낱개)
            · q-part data-part = mcq(opts·ok) · pad(answer·unit) · two(a·b) · match(칸·카드) · judge(줄 o/x) · sum-card · next-card.
   차시마다: file·title·goal·slides[{stage,kind,title,text,figs}]·problems[{stage,q,pts,hints,part,...}]·summary·cells·next."""
import sys, os, re, json, html

def clean(s):
    s = re.sub(r'<br\s*/?>', '\n', s)
    s = re.sub(r'</?(b|strong)>', '**', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    return '\n'.join(x.strip() for x in s.split('\n') if x.strip()).strip()

def first(pat, s, d=''):
    m = re.search(pat, s, re.S)
    return m.group(1) if m else d

def figs(p):
    out = []
    for m in re.finditer(r'<div class="tao-row[^"]*">(.*?)(?=<div class="tao-row|<p class|<div class="row"|<div class="q-part|<div class="numline|</div>\s*</div>\s*$)', p, re.S):
        r = m.group(1)
        tens = len(re.findall(r'class="bar10', r)); ones_html = first(r'class="tao-ones[^"]*">(.*?)</div>', r)
        ones = len(re.findall(r'<i', ones_html)) + len(re.findall(r'class="cube', r))
        big = first(r'class="bignum[^"]*">([^<]*)<', r, None)
        out.append({'k': 'tao', 'tens': tens, 'ones': ones, 'num': big})
    for m in re.finditer(r'<div class="goods">(.*?)</div>\s*</div>\s*(?:<p|<div class="q-part|</div>)', p, re.S):
        g = m.group(1); bs = re.findall(r'class="gbundle-e">(.*?)</div>', g, re.S)
        em = ''.join(re.findall(r'>([^<\s]+)</span>', bs[0]))[:2] if bs else ''
        loose = first(r'class="gloose[^"]*">(.*?)</div>', g)
        lc = len(re.findall(r'<span', loose))
        if not em and loose: em = first(r'<span[^>]*>([^<]+)</span>', loose)
        out.append({'k': 'goods', 'emoji': em.strip(), 'bundles': len(bs), 'loose': lc})
    nl = first(r'<div class="numline">(.*?)</div>', p, None)
    if nl is not None:
        out.append({'k': 'numline', 'items': [{'v': clean(v), 'on': 'on' in c or 'mark' in c} for c, v in re.findall(r'<b class="([^"]*)">(.*?)</b>', nl)]})
    for m in re.finditer(r'<span class="bignum[^"]*">([^<]*)</span><span class="cmp-sign[^"]*">([^<]*)</span><span class="bignum[^"]*">([^<]*)</span>', p):
        out.append({'k': 'cmp', 'a': m.group(1), 'sign': html.unescape(m.group(2)), 'b': m.group(3)})
    for m in re.finditer(r'<div class="pairgrid">(.*?)</div>(?:<span class="bignum[^"]*">([^<]*)</span>)?', p, re.S):
        sp = re.findall(r'<span([^>]*)>([^<]*)</span>', m.group(1)); real = [t for a, t in sp if 'opacity' not in a]
        out.append({'k': 'pair', 'emoji': real[0] if real else '', 'n': len(real), 'num': m.group(2)})
    rws = re.findall(r'class="rw-(?:han|kor)">([^<]*)<', p)
    if rws: out.append({'k': 'read', 'items': rws})
    out.extend(figs2(p))
    return out

# 123차 — 2단원 「덧셈과 뺄셈(1)」 그림: steps(번호 줄 식) · eqstrip(식 띠: hole=? · res/mark=강조) · chain(색 알 묶음) · cupstack(층 쌓은 컵) · tenframe(십 배열판 a/b 두 색 + tf-lb 꼬리표). 원문 순서대로.
def eqtok(e):
    toks = re.findall(r'<span class="eq-tok([^"]*)">([^<]*)</span>', e)
    return {'toks': [html.unescape(t.strip()) for _, t in toks], 'hi': [i for i, (c, _) in enumerate(toks) if 'res' in c or 'mark' in c], 'q': [i for i, (c, _) in enumerate(toks) if 'hole' in c]}
def figs2(p):
    found = []
    for m in re.finditer(r'<div class="steps">((?:<div class="step-row">.*?</div>\s*</div>\s*)+)</div>', p, re.S):
        rows = [dict(eqtok(e), no=clean(n)) for n, e in re.findall(r'class="step-no">(.*?)</span><div class="eqstrip">(.*?)</div>', m.group(1), re.S)]
        found.append((m.start(), m.end(), {'k': 'steps', 'rows': rows}))
    spans = [(a, b) for a, b, _ in found]
    inside = lambda i: any(a <= i < b for a, b in spans)
    for m in re.finditer(r'<div class="eqstrip">(.*?)</div>', p, re.S):
        if inside(m.start()): continue
        found.append((m.start(), m.end(), dict(eqtok(m.group(1)), k='eqt')))
    for m in re.finditer(r'<div class="chain">(.*?)</div>', p, re.S):
        groups = [len(re.findall(r'<i', seg)) for seg in re.split(r'<i class="gap"></i>', m.group(1))]
        found.append((m.start(), m.end(), {'k': 'cnt', 'groups': [g for g in groups if g]}))
    for m in re.finditer(r'<div class="cupstack">((?:<div class="cup-lv">.*?</div>\s*)+)</div>', p, re.S):
        lv = [len(re.findall(r'<i', x)) for x in re.findall(r'<div class="cup-lv">(.*?)</div>', m.group(1), re.S)]
        found.append((m.start(), m.end(), {'k': 'cups', 'levels': lv}))
    for m in re.finditer(r'<div class="tenframe">((?:<div class="tf-cell[^"]*"[^>]*></div>\s*)+)</div>(?:\s*<span class="tf-lb">(.*?)</span>)?', p, re.S):
        c = m.group(1); a = len(re.findall(r'tf-cell a', c)); b = len(re.findall(r'tf-cell b', c)); g = len(re.findall(r'tf-cell g', c)); plain = len(re.findall(r'tf-cell"', c))
        tf = {'k': 'tf', 'a': a, 'b': b, 'empty': plain, 'label': clean(m.group(2) or '')}
        if g: tf['g'] = g  # 124차: 덜어 낸 칸(tf-cell g · 던진·지운 것) — 없으면 키도 없음(123차 json 과 바이트 같게)
        found.append((m.start(), m.end(), tf))
    return [f for _, _, f in sorted(found, key=lambda x: x[0])]

def parse(path):
    src = open(path, encoding='utf-8').read()
    parts = re.split(r'(?=<div class="slide(?: active)?" data-stage)', src)[1:]
    out = {'file': os.path.basename(path), 'title': '', 'goal': [], 'slides': [], 'problems': [], 'summary': '', 'cells': [], 'next': '', 'next_emoji': ''}
    out['title'] = clean(first(r'<title>(.*?)</title>', src)).split('—')[0].strip()
    for p in parts:
        stage = first(r'data-stage="(.*?)"', p); badge = clean(first(r'class="stage-badge">(.*?)</div>', p))
        title = clean(first(r'class="slide-title">(.*?)</h2>', p))
        if 'data-q-id' in p[:200]:
            q = {'stage': stage, 'q': title, 'pts': int(first(r'data-q-points="(\d+)"', p, '0') or 0),
                 'hints': json.loads(html.unescape(first(r"data-hints='(.*?)'", p, '[]'))), 'figs': figs(p),
                 'prompt': clean(' '.join(re.findall(r'<p class="(?:prompt|cap[^"]*)">(.*?)</p>', p, re.S))),
                 'speech': [clean(x) for x in re.findall(r'class="speech[^"]*">(.*?)</div>', p, re.S)]}
            part = re.search(r'<div class="q-part" data-part="(\w+)"([^>]*)>', p)
            if part:
                kind, attrs = part.group(1), part.group(2); q['part'] = kind; q['ok'] = html.unescape(first(r'data-ok="(.*?)"', attrs))
                if kind == 'mcq':
                    opts = re.findall(r'<button class="mcq-opt" data-ok="(\d)" data-miss="(.*?)">(.*?)</button>', p, re.S)
                    q['opts'] = [clean(t) for _, _, t in opts]; q['ci'] = [c for c, _, _ in opts].index('1'); q['miss'] = [html.unescape(m) for _, m, _ in opts]
                elif kind == 'pad':
                    q['a'] = first(r'data-answer="(.*?)"', attrs); q['unit'] = clean(first(r'class="q-unit">(.*?)</span>', p)); q['miss'] = html.unescape(first(r'data-miss="(.*?)"', attrs))
                elif kind == 'two':
                    q['a'] = [first(r'data-answer-a="(.*?)"', attrs), first(r'data-answer-b="(.*?)"', attrs)]
                    q['labels'] = [clean(x) for x in re.findall(r'class="two-cell"><span class="tao-lb">(.*?)</span>', p)]
                    q['unit'] = clean(first(r'class="q-unit">(.*?)</span>', p)); q['miss'] = html.unescape(first(r'data-miss="(.*?)"', attrs))
                elif kind == 'match':
                    q['slots'] = [(k, clean(l)) for l, k in re.findall(r'class="match-slot-label">(.*?)</span><div class="match-slot[^"]*" data-k="(\w+)"', p)]
                    q['cards'] = [{'k': k, 'ok': o == '1', 't': clean(t)} for k, o, t in re.findall(r'<button class="match-card" data-k="(\w+)" data-ok="(\d)"[^>]*>(.*?)</button>', p, re.S)]
                elif kind == 'judge':
                    q['rows'] = [{'ok': o, 't': clean(t), 'miss': clean(html.unescape(m))} for o, m, t in re.findall(r'<div class="jd-row" data-ok="(\w)" data-miss="(.*?)"><span class="jd-text">(.*?)</span>', p, re.S)]
            out['problems'].append(q)
            continue
        kind = badge.split('·')[-1].strip()
        txt = []
        for pat in [r'class="goal-title">(.*?)</p>', r'<p class="(?:cap[^"]*|prompt|sum-msg|next-msg|wrap-msg)"[^>]*>(.*?)</p>', r'class="speech[^"]*">(.*?)</div>', r'class="(?:warncard|okcard)">(.*?)</div>', r'class="self-label">(.*?)</span>']:
            for m in re.findall(pat, p, re.S):
                v = m[-1] if isinstance(m, tuple) else m
                txt.append(clean(v))
        if 'goal-card' in p:
            out['goal'] = [clean(x) for x in re.findall(r'<li>(.*?)</li>', p, re.S)]; out['goal_title'] = clean(first(r'class="goal-title">(.*?)</p>', p)); out['goal_emoji'] = clean(first(r'class="goal-emojis">(.*?)</div>', p))
        if 'sum-card' in p:
            out['summary'] = clean(first(r'class="sum-msg">(.*?)</p>', p)); out['cells'] = [clean(c) for c in re.findall(r'class="sum-cell">(.*?)</div>', p, re.S)]
        if 'next-card' in p:
            out['next'] = clean(first(r'class="next-msg">(.*?)</p>', p)); out['next_emoji'] = clean(first(r'class="next-emoji">(.*?)</div>', p))
        out['slides'].append({'stage': stage, 'kind': kind, 'title': title, 'text': '\n'.join(t for t in txt if t), 'figs': figs(p)})
    return out

if __name__ == '__main__':
    d, outp = sys.argv[1], sys.argv[2]
    res = {}
    for f in sorted(os.listdir(d)):
        m = re.match(r'g1_math_u(\d+)_l(\d+)_', f) or re.match(r'g1_kor_u(\d+)_l(\d+)', f)
        if not m or not f.endswith('.html'): continue
        res['u%d_l%02d' % (int(m.group(1)), int(m.group(2)))] = parse(os.path.join(d, f))
    json.dump(res, open(outp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(outp, len(res), '차시', sum(len(v['slides']) for v in res.values()), '개념 장', sum(len(v['problems']) for v in res.values()), '문제',
          '· 답 없음', sum(1 for v in res.values() for q in v['problems'] if not any(k in q for k in ('a', 'opts', 'cards', 'rows'))))

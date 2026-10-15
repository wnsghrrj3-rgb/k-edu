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
    out.extend(figs3(p))
    out.extend(figs4(p))
    out.extend(figs5(p))
    out.extend(figs6(p))
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
    spans = [(a, b) for a, b, _ in found] + [(m.start(), m.end()) for m in re.finditer(r'<div class="splitbox".*?<div class="sp-legs">', p, re.S)]  # 127차: 가르기 상자 안 식 띠는 figs4 split 이 가짐
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

# 125차 — 3단원 「모양과 시각」 그림: clock(시계 h·m·hands·hl·tag) · tc(시각 카드 h·m) · shp(모양 줄/낱개 q·t·o + 꼬리표 · → · 물건 이모지)
#          · mosaic(모양 꾸미기 판 cols·cells·센 수 q/t/o) · objs(물건 카드). 원문 순서대로. u1·u2 원문엔 이 꼴이 없어 두 json 은 바이트 같음.
SHN = {'q': '네모', 't': '세모', 'o': '동그라미'}
def figs3(p):
    found = []
    opts = [(m.start(), m.end()) for m in re.finditer(r'<button class="mcq-opt".*?</button>', p, re.S)]
    inopt = lambda i: any(a <= i < b for a, b in opts)
    for m in re.finditer(r'<svg class="clock (\w+)"[^>]*data-h="(\d+)" data-m="(\d+)" data-hands="(\w*)"[^>]*>(.*?)</svg>(?:\s*<span class="cl-tag">(.*?)</span>)?', p, re.S):
        if inopt(m.start()): continue
        hl = re.findall(r'class="cl-hl"[^>]*r="(\d+)"', m.group(5))
        c = {'k': 'clock', 'h': int(m.group(2)), 'm': int(m.group(3)), 'hands': m.group(4), 'size': m.group(1)}
        if 'data-bad="1"' in m.group(0)[:200]:  # 잘못 놓은 시계 — 바늘 각도를 원문 그대로
            c['bad'] = True; c['deg'] = {k: float(v) for k, v in re.findall(r'data-hand="(\w)" data-deg="([\d.]+)"', m.group(5))}
        if hl: c['hl'] = 'h' if int(hl[0]) < 60 else 'm'
        if m.group(6): c['tag'] = clean(m.group(6))
        found.append((m.start(), m.end(), c))
    for m in re.finditer(r'<div class="timecard( amber)?">(.*?)</div>', p, re.S):
        nums = re.findall(r'<b>(\d+)</b>', m.group(2)); c = {'k': 'tc', 'h': int(nums[0])}
        if len(nums) > 1: c['m'] = int(nums[1])
        if m.group(1): c['amber'] = True
        found.append((m.start(), m.end(), c))
    mos = []
    for m in re.finditer(r'<div class="mosaic" data-q="(\d+)" data-t="(\d+)" data-o="(\d+)"[^>]*?(?:repeat\((\d+),auto\))?[^>]*>(.*?)</div>(?:\s*<span class="mo-tag">(.*?)</span>)?', p, re.S):
        cells = ''.join('.' if ' e' in c else c.split()[0] for c in re.findall(r'<span class="shp ([^"]*)"', m.group(5)))
        c = {'k': 'mosaic', 'cols': int(m.group(4) or 5), 'cells': cells, 'q': int(m.group(1)), 't': int(m.group(2)), 'o': int(m.group(3))}
        if m.group(6): c['tag'] = clean(m.group(6))
        found.append((m.start(), m.end(), c)); mos.append((m.start(), m.end()))
    for m in re.finditer(r'<div class="shprow( plain)?">(.*?)</div>', p, re.S):
        its = [{'s': a.split()[0], **({'tag': clean(t)} if t else {})} for a, t in re.findall(r'<span class="shp ([^"]*)"></span>(?:<span class="shp-tag">(.*?)</span>)?', m.group(2))]
        c = {'k': 'shp', 'items': its}
        if m.group(1): c['plain'] = True
        found.append((m.start(), m.end(), c)); mos.append((m.start(), m.end()))
    for m in re.finditer(r'<div class="objs">((?:<div class="obj">.*?</div>)+)</div>', p, re.S): mos.append((m.start(), m.end()))
    inside = lambda i: any(a <= i < b for a, b in mos) or inopt(i)
    loose = []
    for m in re.finditer(r'<span class="shp ([qto]) (sm|md|lg)( dim)?"></span>(?:</?\w+[^>]*>)*?(?:<span class="shp-tag">(.*?)</span>)?|<span class="tao-eq">(.*?)</span>|<span style="font-size:var\(--em-\w+\)">(.*?)</span>', p, re.S):
        if inside(m.start()): continue
        if m.group(1):
            it = {'s': m.group(1)}
            if m.group(3): it['dim'] = True
            if m.group(4): it['tag'] = clean(m.group(4))
        elif m.group(5) is not None: it = {'sym': html.unescape(m.group(5).strip())}
        else: it = {'emo': m.group(6).strip()}
        loose.append((m.start(), m.end(), it))
    # 이웃한 낱개(사이에 그림·글이 아닌 틀만)는 한 줄로 묶는다
    grp = []
    for a, b, it in loose:
        if grp and not re.search(r'<p |class="(?:q-part|clock|timecard|mosaic|objs|shprow|goal|sum)', p[grp[-1][1]:a]): grp[-1][1] = b; grp[-1][2].append(it)
        else: grp.append([a, b, [it]])
    for a, b, its in grp:
        if any('s' in x for x in its): found.append((a, b, {'k': 'shp', 'items': its, 'loose': True}))
    for m in re.finditer(r'<div class="objs">((?:<div class="obj">.*?</div>)+)</div>', p, re.S):
        found.append((m.start(), m.end(), {'k': 'objs', 'items': [dict({'emoji': e.strip(), 'name': clean(n)}, **({'s': sh} if sh else {}), **({'n': int(c)} if c else {})) for e, sh, c, n in re.findall(r'<div class="obj"><em>(.*?)</em>(?:<span class="shp (\w)[^"]*"></span>)?(?:<u>(\d+)</u>)?<b>(.*?)</b></div>', m.group(1), re.S)]}))  # 127차: 4단원 물건 카드 수 <u>n</u>
        mos.append((m.start(), m.end()))
    return [f for _, _, f in sorted(found, key=lambda x: x[0])]

# 127차 — 4단원 「덧셈과 뺄셈(2)」 그림: bead(구슬 틀 두 줄 · 줄마다 켠 알 수 + 꼬리표) · cpath(이어 세기 길 from→steps · down · hole)
#          · split(가르기 상자 — 식 + 두 다리 ten/hole + partner) · eqtab(덧셈표·뺄셈표 h1/h2/pick) · robot(로봇 길 식·합 · now/hole) · bingo(수 빙고판).
#          원문 순서대로. u1~u3 원문엔 이 꼴이 없어 세 json 은 바이트 같음.
def figs4(p):
    found = []
    for m in re.finditer(r'<div class="beadset" data-beads="([\d,]+)">(.*?)</span></div>', p, re.S):
        rows = [{'r': len(re.findall(r'class="r on"', r)), 'w': len(re.findall(r'class="w on"', r))} for r in re.findall(r'<div class="beadrow">(.*?)</div>', m.group(2), re.S)]
        found.append((m.start(), m.end(), {'k': 'bead', 'rows': rows, 'label': clean(first(r'class="bead-lb">(.*?)$', m.group(2)))}))
    for m in re.finditer(r'<div class="countpath" data-count="(\d+)\|([\d,]+)\|(\d)">(.*?)</div>', p, re.S):
        found.append((m.start(), m.end(), {'k': 'cpath', 'from': int(m.group(1)), 'seq': [int(x) for x in m.group(2).split(',')], 'down': m.group(3) == '1', 'hole': 'class="hole"' in m.group(4)}))
    for m in re.finditer(r'<div class="splitbox" data-split="(\d+)\|(\d+)\|(\d+)"(?: data-partner="(\d+)")?>(.*?)</div>\s*(?:<span class="sp-note">(.*?)</span>\s*)?</div>', p, re.S):
        body = m.group(5); e = eqtok(first(r'<div class="eqstrip">(.*?)</div>', body))
        legs = [dict({'v': clean(v)}, **({'ten': True} if 'ten' in c else {}), **({'hole': True} if 'hole' in c else {})) for c, v in re.findall(r'<span class="sp-leg([^"]*)">(.*?)</span>', body)]
        c = {'k': 'split', 'toks': e['toks'], 'n': int(m.group(1)), 'a': int(m.group(2)), 'b': int(m.group(3)), 'legs': legs}
        if m.group(4): c['partner'] = int(m.group(4))
        if m.group(6): c['note'] = clean(m.group(6))
        found.append((m.start(), m.end(), c))
    for m in re.finditer(r'<div class="eqtable">((?:<div class="eqt-row">.*?</div>)+)</div>', p, re.S):
        rows = [[dict({'e': clean(t), 'v': int(v)}, **({'h': c} if c else {})) for c, v, t in re.findall(r'<u(?: class="(\w+)")? data-v="(\d+)">(.*?)</u>', r)] for r in re.findall(r'<div class="eqt-row">(.*?)</div>', m.group(1), re.S)]
        found.append((m.start(), m.end(), {'k': 'eqtab', 'rows': rows}))
    for m in re.finditer(r'<div class="robotpath" data-robot="([^"]*)">(.*?)</div>', p, re.S):
        st = [dict({'e': clean(e), 'v': clean(v)}, **({'now': True} if 'now' in c else {}), **({'hole': True} if 'hole' in c else {})) for c, e, v in re.findall(r'<span class="rp-step([^"]*)">([^<]*)<i>(.*?)</i></span>', m.group(2))]
        found.append((m.start(), m.end(), {'k': 'robot', 'steps': st}))
    for m in re.finditer(r'<div class="bingo">(.*?)</div>', p, re.S):
        found.append((m.start(), m.end(), {'k': 'bingo', 'nums': [int(x) for x in re.findall(r'<b>(\d+)</b>', m.group(1))]}))
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
                    if any('class="pt ' in t for _, _, t in opts):  # 128차 — 규칙 보기(색·모양 토큰): 토큰 줄
                        q['optpt'] = [pttoks(t)[0] for _, _, t in opts]
                    elif any(not clean(t) for _, _, t in opts):  # 125차 — 그림 보기(모양·시계): 글 대신 그림 값
                        of = []
                        for _, _, t in opts:
                            sh = first(r'<span class="shp (\w)', t, None); ck = re.search(r'data-h="(\d+)" data-m="(\d+)"', t)
                            of.append({'s': sh} if sh else {'h': int(ck.group(1)), 'm': int(ck.group(2))} if ck else {})
                        q['optfigs'] = of; q['opts'] = [SHN.get(o.get('s'), '') if 's' in o else '' for o in of]
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

# 128차 — 5단원 「규칙 찾기」 그림: pat(규칙 줄 patrow · 묶음 pu · 토큰 em/shp/tile/num/gl/hole) · seq(수 줄 numseq data-seq·rule · on/hole)
#          · ntab(수 배열표 numtable data-table 시작|칸|줄 · marks c1/c2 · steps · hole) · pgrid(무늬 판 patgrid data-grid·unit) · floor(로봇 바닥 floorwrap). 원문 순서대로.
PTSZ = ('sm', 'md', 'lg')
def ptok(cls, txt):
    c = cls.split(); txt = html.unescape(clean(txt))
    if 'hole' in c: return {'h': 1}
    if 'em' in c:
        d = {'e': txt}; z = [x for x in c if x in PTSZ]
        if z: d['z'] = z[0]
        return d
    if 'shp' in c: return {'s': txt, 'c': [x for x in c if x not in ('pt', 'shp')][0]}
    if 'tile' in c: return {'t': [x for x in c if x not in ('pt', 'tile')][0]}
    if 'num' in c: return {'n': txt}
    if 'gl' in c: return {'g': txt}
    return {'x': txt}

def pttoks(body):
    toks, groups, cur = [], [], None
    for m in re.finditer(r'<span class="(pu[^"]*|pt [^"]*)"[^>]*>|</span>', body):
        if m.group(1) and m.group(1).startswith('pu'):
            cur = 0; continue
        if m.group(1):
            end = body.index('</span>', m.end()); toks.append(ptok(m.group(1), body[m.end():end]))
            if cur is not None: cur += 1
            continue
    # pu 묶음 크기: pu 마다 안의 pt 수
    for g in re.findall(r'<span class="pu[^"]*">((?:<span class="pt [^"]*"[^>]*>[^<]*</span>)+)</span>', body):
        groups.append(len(re.findall(r'class="pt ', g)))
    return toks, groups

def figs5(p):
    found = []
    for m in re.finditer(r'(?:<span class="pat-lb">(.*?)</span>)?<div class="patrow( sm)?" data-pat="([^"]*)">(.*?)</div>', p, re.S):
        toks, groups = pttoks(m.group(4)); c = {'k': 'pat', 'toks': toks, 'unit': m.group(3).split('|')[0].split(',')}
        if m.group(1): c['label'] = clean(m.group(1))
        if groups: c['pu'] = groups
        if m.group(2): c['sm'] = True
        found.append((m.start(), m.end(), c))
    for m in re.finditer(r'(?:<span class="pat-lb">(.*?)</span>)?<div class="numline numseq" data-seq="([^"]*)" data-rule="([^"]*)">(.*?)</div>', p, re.S):
        bs = re.findall(r'<b class="([^"]*)">(.*?)</b>', m.group(4))
        c = {'k': 'seq', 'seq': [int(x) for x in m.group(2).split(',')], 'rule': m.group(3), 'vals': [clean(v) for _, v in bs],
             'on': [i for i, (k, _) in enumerate(bs) if 'on' in k.split()], 'hole': [i for i, (k, _) in enumerate(bs) if 'hole' in k.split()]}
        if m.group(1): c['label'] = clean(m.group(1))
        found.append((m.start(), m.end(), c))
    for m in re.finditer(r'<div class="numtable( sm)?" style="--nc:(\d+)" data-table="(\d+)\|(\d+)\|(\d+)"(?: data-marks="([^"]*)")?(?: data-steps="([^"]*)")?>(.*?)</div>', p, re.S):
        bs = re.findall(r'<b class="([^"]*)">(.*?)</b>', m.group(8))
        c = {'k': 'ntab', 'start': int(m.group(3)), 'nc': int(m.group(4)), 'rows': int(m.group(5)), 'cells': [clean(v) for _, v in bs],
             'cls': [k for k, _ in bs], 'marks': m.group(6) or '', 'steps': m.group(7) or ''}
        if m.group(1): c['sm'] = True
        found.append((m.start(), m.end(), c))
    for m in re.finditer(r'<div class="floorwrap"><div class="floor-side">(.*?)</div><div class="patgrid floor" style="--nc:(\d+)" data-floor="([^"]*)">(.*?)</div><div class="floor-note">(.*?)</div></div>', p, re.S):
        toks, _ = pttoks(m.group(4)); fl = m.group(3).split('|')
        found.append((m.start(), m.end(), {'k': 'floor', 'nc': int(m.group(2)), 'unit': fl[0].split(','), 'toks': toks,
                                           'side': [clean(x) for x in re.findall(r'<i>(.*?)</i>', m.group(1))], 'note': clean(m.group(5)).replace('\n', ' ')}))
    for m in re.finditer(r'<div class="patgrid( sm)?" style="--nc:(\d+)" data-grid="([^"]*)"(?: data-unit="([^"]*)")?>(.*?)</div>', p, re.S):
        toks, _ = pttoks(m.group(5)); c = {'k': 'pgrid', 'nc': int(m.group(2)), 'grid': m.group(3), 'toks': toks}
        if m.group(4): c['unit'] = m.group(4)
        if m.group(1): c['sm'] = True
        found.append((m.start(), m.end(), c))
    return [f for _, _, f in sorted(found, key=lambda x: x[0])]

# 130차 — 6단원 「덧셈과 뺄셈(3)」 그림: nbrow(10개씩 묶음·낱개 블록 식 줄) · vcalc(세로셈 — 칸 글자는 원문 그대로, 일부러 틀린 자리 맞춤(bad) 보존) · pairup(위아래 짝짓기 뺄셈) · board(놀이판 칸) · tops(팽이 식 카드, paint=바른 계산) · cmds(명령어 차례 — hole=지워진 칸). 원문 순서대로.
def figs6(p):
    found = []
    for m in re.finditer(r'<div class="nbrow" data-nbrow="([^"]*)">(.*?)(?=<p class|<div class="q-part|<div class="nbrow|</div>\s*</div>\s*<div class="slide|$)', p, re.S):
        body = m.group(2); items = []
        for c in re.finditer(r'<div class="numblock[^"]*" data-nb="(\d+)\|(\d+)\|[^"]*">.*?<div class="nb-ones">.*?</div></div></div>(?:<span class="nb-lb">(.*?)</span>)?', body, re.S):
            it = {'t': int(c.group(1)), 'o': int(c.group(2))}
            if c.group(3): it['label'] = clean(c.group(3))
            items.append(it)
        ops = re.findall(r'<span class="nb-op">([^<]*)</span>', body)
        found.append((m.start(), m.end(), {'k': 'nbrow', 'nb': m.group(1).split('|'), 'items': items, 'ops': [html.unescape(o) for o in ops]}))
    for m in re.finditer(r'<div class="vcalc( [a-z]+)?" data-vc="([^"]*)">(.*?)<span class="vc-line"></span><span class="vc-res">(.*?)</span></div>(?:<span class="vc-tag">(.*?)</span>)?', p, re.S):
        top = re.findall(r'<span class="vc-c ([to])( hole)? *" data-col="[to]">([^<]*)</span>', m.group(3))
        res = re.findall(r'<span class="vc-c ([to])( hole)? *" data-col="[to]">([^<]*)</span>', m.group(4))
        op = [o for o in re.findall(r'<span class="vc-op">([^<]*)</span>', m.group(3)) if o.strip()]
        rows = [top[i:i + 2] for i in range(0, len(top), 2)] + [res]
        c = {'k': 'vcalc', 'vc': m.group(2).split('|'), 'op': html.unescape(op[0]) if op else '', 'rows': [[x[2] for x in r] for r in rows],
             'hole': [[bool(x[1]) for x in r] for r in rows]}
        if m.group(1): c['mode'] = m.group(1).strip()
        if m.group(5): c['tag'] = clean(m.group(5))
        found.append((m.start(), m.end(), c))
    for m in re.finditer(r'<div class="pairup" data-pair="(\d+)\|(\d+)">(?:<span class="pu-lb">(.*?)</span>)?(.*?)(?=<p class|<div class="q-part|</div>\s*</div>\s*<div class="slide)', p, re.S):
        cols = re.findall(r'<div class="pu-col( solo)?">(.*?)</div>', m.group(4), re.S)
        c = {'k': 'pairup', 'a': int(m.group(1)), 'b': int(m.group(2)), 'cols': len(cols), 'solo': sum(1 for x in cols if x[0])}
        em = re.findall(r'<i(?: class="blank")?>([^<]*)</i>', cols[0][1]) if cols else []
        if len(em) == 2: c['em'] = em
        if m.group(3): c['label'] = clean(m.group(3))
        found.append((m.start(), m.end(), c))
    for m in re.finditer(r'<div class="board" data-board="([^"]*)">(.*?)</div></div>(?=<p|</div>)', p, re.S):
        cells = re.findall(r'<span class="bd-c( [a-z]+)?">([^<]*)</span>', m.group(2))
        rows = [r.split(',') for r in m.group(1).split(';')]
        found.append((m.start(), m.end(), {'k': 'board', 'rows': rows, 'on': [i for i, x in enumerate(cells) if x[0].strip() == 'on'], 'word': [i for i, x in enumerate(cells) if x[0].strip() == 'word']}))
    for m in re.finditer(r'<div class="tops">(.*?)</div>(?=<p|</div>)', p, re.S):
        cs = re.findall(r'<div class="topcard( paint)?" data-top="([^"]*)"><em>([^<]*)</em>', m.group(1))
        found.append((m.start(), m.end(), {'k': 'tops', 'em': cs[0][2] if cs else '', 'cards': [x[1].split('|') for x in cs], 'paint': [i for i, x in enumerate(cs) if x[0]]}))
    for m in re.finditer(r'<div class="cmds" data-cmd="([^"]*)">(.*?)</div>', p, re.S):
        sp = re.findall(r'<span class="cmd( hole)?"><u>\d+</u>([^<]*)</span>', m.group(2))
        found.append((m.start(), m.end(), {'k': 'cmds', 'cmd': m.group(1).split('|'), 'shown': [clean(x[1]) for x in sp], 'hole': [i for i, x in enumerate(sp) if x[0]]}))
    return [f for _, _, f in sorted(found, key=lambda x: x[0])]

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

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
    out.extend(figs7(p))
    out.extend(figs8(p))
    out.extend(figs9(p))
    out.extend(figs10(p))
    out.extend(figs11(p))
    out.extend(figs12(p))
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
    for m in re.finditer(r'<div class="patrow[^"]*" data-pat="[^"]*">(?:(?!</div>).)*?class="pt-c', p, re.S): mos.append((m.start(), p.index('</div>', m.end())))  # 132차: 7단원 모양 규칙 줄(pt-c)은 figs5 patc 로
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
        if 'class="pt-c' in m.group(4):  # 132차 — 7단원 모양 규칙 줄: data-pat="차례|묶음 크기|구할 자리" · 칸 pt-c(grp = 묶음 처음 · ask = 「?」)
            dp = m.group(3).split('|'); cs = re.findall(r'<span class="pt-c([^"]*)">(.*?)</span>(?=<span class="pt-c|$)', m.group(4), re.S)
            toks = [{'h': 1} if 'ask' in k else {'p': first(r'class="shp (\w)', v)} for k, v in cs]
            c = {'k': 'patc', 'seq': dp[0], 'n': int(dp[1]), 'toks': toks}
            if len(dp) > 2 and dp[2] != '': c['ask'] = int(dp[2])
            found.append((m.start(), m.end(), c)); continue
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

# 131차(수학) — 7단원 「수학이랑 안전」 그림: sign(안전 표지판 — sgrow 한 줄 = 한 그림 · 줄 밖 표지판 하나 = 한 그림 · 모양 o 동그라미/t 세모/q 네모 · 색 · 수 · 글 · tag) · tally(약속 고른 사람 점 줄 · lab·n·on · diff) · phases(준비·해 봐요·마무리 단계 띠 · on). 보기(mcq-opt) 안은 뺌.
def sgitem(a, body, tag):
    sh, col, num, txt = (a.split('|') + ['', '', '', ''])[:4]
    it = {'s': sh, 'c': col}
    if num: it['n'] = num
    if txt: it['t'] = clean(txt)
    if tag: it['tag'] = clean(tag)
    return it

SGRE = r'<span class="sg ([a-z]+) ([a-z]+) ([a-z]+)" data-sign="([^"]*)">(.*?)</span></span>(?:<span class="sg-tag">(.*?)</span></span>)?'
def figs7(p):
    found = []
    opts = [(m.start(), m.end()) for m in re.finditer(r'<button class="mcq-opt".*?</button>', p, re.S)]
    rows = []
    for m in re.finditer(r'<div class="sgrow">(.*?)</div>', p, re.S):
        rows.append((m.start(), m.end()))
        its = [sgitem(x.group(4), x.group(5), x.group(6)) for x in re.finditer(SGRE, m.group(1), re.S)]
        found.append((m.start(), m.end(), {'k': 'sign', 'items': its, 'size': 'sm' if 'sm"' in m.group(1) else 'md'}))
    for x in re.finditer(SGRE, p, re.S):
        if any(a <= x.start() < b for a, b in rows + opts): continue
        found.append((x.start(), x.end(), {'k': 'sign', 'items': [sgitem(x.group(4), x.group(5), x.group(6))], 'size': x.group(3)}))
    for m in re.finditer(r'<div class="tally" data-tally="([^"]*)">(.*?)(?=<p class|<div class="q-part|</div>\s*</div>\s*<div class="slide)', p, re.S):
        ons = [bool(r.group(1)) for r in re.finditer(r'<div class="tl-row( on)?" data-tl="\d+">', m.group(2))]
        rs = [{'lab': clean(x.rsplit(':', 1)[0]), 'n': int(x.rsplit(':', 1)[1])} for x in m.group(1).split(';')]
        for r, o in zip(rs, ons): r['on'] = o
        c = {'k': 'tally', 'rows': rs, 'unit': first(r'<span class="tl-n">\d+<em>([^<]*)</em>', m.group(2))}
        dm = re.search(r'data-diff="([^"]*)">\s*$', p[max(0, m.start() - 80):m.start()])
        if dm: c['diff'] = dm.group(1)
        found.append((m.start(), m.end(), c))
    for m in re.finditer(r'<div class="phases" data-phase="(\d+)">(.*?)</div>', p, re.S):
        found.append((m.start(), m.end(), {'k': 'phases', 'on': int(m.group(1)), 'items': [clean(x) for x in re.findall(r'<span class="ph[^"]*">([^<]*)</span>', m.group(2))]}))
    return [f for _, _, f in sorted(found, key=lambda x: x[0])]

# 138차 — 2학년 2학기 수학 그림(네 자리 수): pvb(수 모형 천·백·십·일 개수) · money(돈 pvt money: 천원·백원·십원·일원 개수) · tiles(pvt 자리 타일)
#   · jl(뛰어 세기 줄 data-jump 시작|간격|개수 · hole 칸 · on 칸 · line=수직선) · plt(자리값 표 data-place 수|자리수 · vl 값 줄 / cmpb 비교 표 data-cmp 수들)
#   · vcards(몇천·몇백·몇십·몇 카드 겹치기) · vstack(자리 색 숫자 줄) · story(이야기 조각 차례). 보기(mcq-opt) 안은 뺌. 1학년 원문에는 없는 꼴이라 1-2 재료 무개변.
def figs8(p):
    found = []
    opts = [(m.start(), m.end()) for m in re.finditer(r'<button class="mcq-opt".*?</button>', p, re.S)]
    inopt = lambda a: any(x <= a < y for x, y in opts)
    for m in re.finditer(r'<div class="pvb( sm)?" data-pv="([^"]*)">', p):
        v = (m.group(2).split('|') + ['0'] * 4)[:4]
        found.append((m.start(), m.end(), {'k': 'pvb', 'th': int(v[0] or 0), 'h': int(v[1] or 0), 't': int(v[2] or 0), 'o': int(v[3] or 0)}))
    for m in re.finditer(r'<div class="pvt( money)?" data-tiles="([^"]*)">', p):
        v = [int(x or 0) for x in (m.group(2).split('|') + ['0'] * 4)[:4]]
        found.append((m.start(), m.end(), {'k': 'money' if m.group(1) else 'tiles', 'th': v[0], 'h': v[1], 't': v[2], 'o': v[3]}))
    for m in re.finditer(r'<div class="jl( line)?" data-jump="([^"]*)">(.*?)(?=<p class|<div class="q-part|</div>\s*</div>\s*<div class="slide|</div></div><div)', p, re.S):
        a = (m.group(2).split('|') + ['', '', ''])[:3]
        cls = re.findall(r'<b class="([^"]*)">([^<]*)</b>', m.group(3))
        found.append((m.start(), m.end(), {'k': 'jl', 'start': int(a[0] or 0), 'step': int(a[1] or 0), 'n': int(a[2] or len(cls)), 'line': bool(m.group(1)),
                                            'hole': [i for i, (c, _) in enumerate(cls) if 'hole' in c], 'on': [i for i, (c, _) in enumerate(cls) if 'on' in c]}))
    for m in re.finditer(r'<div class="plt( cmpb)?"(?: style="[^"]*")? data-(place|cmp)="([^"]*)">(.*?)</div>', p, re.S):
        a = m.group(3).split('|')
        hd = re.findall(r'<span class="hd ([a-z]+)">', m.group(4))
        if m.group(2) == 'place':
            c = {'k': 'plt', 'v': a[0], 'cols': len(hd) or len(a[0]), 'vals': bool(re.search(r'class="vl"', m.group(4)))}
            hi = re.findall(r'<span class="dg [a-z]+ hi"', m.group(4))
            if len(a) > 2 and a[2]: c['hi'] = a[2]
        else:
            c = {'k': 'pltcmp', 'vs': a[0].split(','), 'cols': len(hd), 'labels': [clean(x) for x in re.findall(r'<span class="rl">([^<]+)</span>', m.group(4))]}
            if len(a) > 1 and a[1] != '': c['at'] = a[1]
        found.append((m.start(), m.end(), c))
    for m in re.finditer(r'<div class="vcards" data-vcard="([^"]*)">(.*?)</div>', p, re.S):
        found.append((m.start(), m.end(), {'k': 'vcards', 'v': m.group(1).split('|')[0], 'parts': re.findall(r'data-v="(\d+)"', m.group(2))}))
    for m in re.finditer(r'<div class="vstack"(?: data-vcard="[^"]*")?>(.*?)</div>', p, re.S):
        if inopt(m.start()): continue
        found.append((m.start(), m.end(), {'k': 'vstack', 'v': ''.join(re.findall(r'<b class="[a-z]+">([^<]*)</b>', m.group(1)))}))
    for m in re.finditer(r'<div class="story" data-story="([^"]*)">(.*?)</div>\s*(?=<p|</div>)', p, re.S):
        its = [{'no': a, 'y': b, 't': clean(c)} for a, b, c in re.findall(r'<div class="story-pg"><em>(.*?)</em><u>(.*?)</u><span>(.*?)</span></div>', m.group(2), re.S)]
        found.append((m.start(), m.end(), {'k': 'story', 'order': m.group(1).split('|')[-1], 'items': its}))
    return [f for _, _, f in sorted(found, key=lambda x: x[0])]

# 139차 — 2학년 2학기 수학 2단원 「곱셈구구」 그림: grp(묶음 data-grp 한 묶음|묶음 수|새 묶음|누적 · 이모지 ge / 점 gd) · dan(단 줄 data-dan 단|부터|까지|빈칸 · hi 줄)
#   · mj(수직선 뛰기 data-mj 간격|번) · arr(배열 data-arr 줄|칸|줄 나눔|칸 나눔|빈 자리 r.c;… · 이모지) · mt(곱셈표 data-mt 줄들|칸들 · 칸마다 값·blank·lit · 머리 on)
#   · score(점수판 data-score 수들|개수들 · 식 줄) · ring(무늬 data-ring 단|차례). 보기(mcq-opt) 안은 뺌. 앞 단원 원문에는 없는 꼴이라 1-2·2-2 u1 재료 무개변.
def figs9(p):
    found = []
    opts = [(m.start(), m.end()) for m in re.finditer(r'<button class="mcq-opt".*?</button>', p, re.S)]
    inopt = lambda a: any(x <= a < y for x, y in opts)
    ints = lambda xs: [int(x) for x in xs if x.strip() != '']
    for m in re.finditer(r'<div class="grp[^"]*" data-grp="([^"]*)"[^>]*>(.*?)</div>\s*</div>\s*</div>', p, re.S):
        if inopt(m.start()): continue
        a = (m.group(1).split('|') + ['0'] * 4)[:4]
        em = first(r'<span class="ge">([^<]*)</span>', m.group(2), '')
        found.append((m.start(), m.end(), {'k': 'grp', 'per': int(a[0] or 0), 'n': int(a[1] or 0), 'new': a[2] == '1', 'tally': a[3] == '1', 'emoji': html.unescape(em)}))
    for m in re.finditer(r'<div class="dan[^"]*" data-dan="([^"]*)">(.*?)</div>\s*(?=<p|<div class="q-part|</div>)', p, re.S):
        if inopt(m.start()): continue
        a = (m.group(1).split('|') + [''] * 4)[:4]
        rows = re.findall(r'<div class="dn-row( hi)?"><span class="dn-e">\s*\d+\s*×\s*(\d+)\s*=\s*</span><b( class="hole")?>', m.group(2))
        found.append((m.start(), m.end(), {'k': 'dan', 'dan': int(a[0]), 'from': int(a[1] or 1), 'to': int(a[2] or 9), 'q': ints(a[3].split(',')), 'hi': [int(b) for h, b, _ in rows if h]}))
    for m in re.finditer(r'<div class="mj"[^>]* data-mj="([^"]*)">', p):
        if inopt(m.start()): continue
        a = m.group(1).split('|')
        found.append((m.start(), m.end(), {'k': 'mj', 'step': int(a[0]), 'n': int(a[1])}))
    for m in re.finditer(r'<div class="arr([^"]*)"[^>]* data-arr="([^"]*)">(.*?)</div>', p, re.S):
        if inopt(m.start()): continue
        a = (m.group(2).split('|') + [''] * 5)[:5]
        em = first(r'<i class="ad[^"]*"[^>]*>([^<]+)</i>', m.group(3), '')
        miss = [[int(y) for y in x.split('.')] for x in a[4].split(';') if x.strip()]
        found.append((m.start(), m.end(), {'k': 'arr', 'r': int(a[0]), 'c': int(a[1]), 'rs': ints(a[2].split(',')), 'cs': ints(a[3].split(',')), 'miss': miss, 'emoji': html.unescape(em.strip())}))
    for m in re.finditer(r'<div class="mt[^"]*"[^>]* data-mt="([^"]*)">(.*?)</div>', p, re.S):
        if inopt(m.start()): continue
        rs, cs = [x.split(',') for x in m.group(1).split('|')]
        cells = [{'v': clean(v), 'c': c.strip()} for c, v in re.findall(r'<span class="mt-v([^"]*)">([^<]*)</span>', m.group(2))]
        hdr = re.findall(r'<span class="mt-h mt-([cr])( on)?">([^<]*)</span>', m.group(2))
        found.append((m.start(), m.end(), {'k': 'mt', 'rows': rs, 'cols': cs, 'cells': [[x['v'] if not ('blank' in x['c'] or 'hole' in x['c']) else '?' for x in cells[i * len(cs):(i + 1) * len(cs)]] for i in range(len(rs))],
                                            'lit': [[('lit' in x['c']) for x in cells[i * len(cs):(i + 1) * len(cs)]] for i in range(len(rs))],
                                            'on_c': [v for k, o, v in hdr if k == 'c' and o], 'on_r': [v for k, o, v in hdr if k == 'r' and o]}))
        for cls in ('fold', 'mark'):  # 139차: 접는 칸(대각선 점선)·표시 칸(★·♥) — 있을 때만
            mx = [[(cls in x['c'].split()) for x in cells[i * len(cs):(i + 1) * len(cs)]] for i in range(len(rs))]
            if any(any(r) for r in mx): found[-1][2][cls] = mx
    for m in re.finditer(r'<div class="sb"[^>]* data-score="([^"]*)">(.*?)</div>', p, re.S):
        if inopt(m.start()): continue
        ns, cn = [x.split(',') for x in m.group(1).split('|')]
        hd = [clean(x) for x in re.findall(r'<span class="sb-h">(.*?)</span>', m.group(2))]
        found.append((m.start(), m.end(), {'k': 'score', 'heads': hd, 'nums': ns, 'cnt': cn, 'eqs': [clean(x) for x in re.findall(r'<span class="sb-s">(.*?)</span>', m.group(2))]}))
    for m in re.finditer(r'<svg class="ring"[^>]* data-ring="([^"]*)"', p):
        if inopt(m.start()): continue
        a = m.group(1).split('|')
        found.append((m.start(), m.end(), {'k': 'ring', 'dan': int(a[0]), 'seq': ints(a[1].split(','))}))
    return [f for _, _, f in sorted(found, key=lambda x: x[0])]

# 141차 — 2-2 3단원 「길이 재기」 그림: mbar(길이 막대 — 이어 붙이기 join·잘라 낸 칸 cut·100 cm 눈금) · rul(자·줄자 — 끊긴 줄자 눈금·끝 눈금 on)
#   · mc(m·cm 세로셈) · mr(m·cm 식 한 줄) · est(어림·잰 길이 표) · body(몸으로 어림 카드) · uc(단위 카드) · ch(부분으로 나누어 어림) · pw(전체·부분 가지). 빈칸 = '?'.
def figs10(p):
    found = []
    opts = [(m.start(), m.end()) for m in re.finditer(r'<button class="mcq-opt".*?</button>', p, re.S)]
    inopt = lambda a: any(x <= a < y for x, y in opts)
    hv = lambda c, v: '?' if 'hole' in c else clean(v)
    bar = lambda a, c: dict({'cm': int(a[0]), 'col': c.strip()}, **({'cut': int(a[1])} if a[1] else {}), **({'m100': True} if a[2] == '1' else {}))
    joined = []
    for m in re.finditer(r'<div class="col mb-wrap">(.*?)<b class="mb-lb( hole)?">([^<]*)</b></div>', p, re.S):
        if inopt(m.start()): continue
        body = m.group(1); nm = clean(first(r'<span class="mb-nm">(.*?)</span>', body))
        lb = '?' if m.group(2) else clean(m.group(3))
        j = re.search(r'<div class="mb-join" data-join="([^"]*)">', body)
        bars = [bar((a.split('|') + ['', ''])[:3], c) for c, a in re.findall(r'<div class="mbar ?([^"]*)" data-bar="([^"]*)"', body)]
        f = {'k': 'mbar', 'name': nm, 'bars': bars, 'lb': lb}
        if j: f['join'] = True; f['pair'] = [hv(c, v) for c, v in re.findall(r'<b class="mb-lb sm([^"]*)">([^<]*)</b>', body)]
        found.append((m.start(), m.end(), f))
    for m in re.finditer(r'<div class="col rl-wrap" data-rul="([^"]*)">(.*?)</div></div></div>', p, re.S):
        if inopt(m.start()): continue
        a = m.group(1).split('|'); b = m.group(2)
        x0, x1 = [float(v) for v in re.search(r'data-x0="([^"]*)" data-x1="([^"]*)"', b).groups()]
        ts = [(c, v, float(x)) for c, v, x in re.findall(r'<span class="rl-t( on)?" data-v="([^"]*)" data-x="([^"]*)"', b)]
        f = {'k': 'rul', 'name': clean(first(r'<span class="mb-nm">(.*?)</span>', b)), 'len': int(a[0]), 'from': int(a[1]), 'al': a[2] == '1', 'ticks': [int(v) for _, v, _ in ts], 'brk': 'rl-brk' in b}
        on = [int(v) for c, v, _ in ts if c]
        if on: f['on'] = on[0]
        if not f['brk']:  # 곧은자 — 물건 시작·끝 눈금(30 px = 1 cm)
            t0 = ts[0][2]; f['s0'] = round((x0 - t0) / 30, 1); f['s1'] = round((x1 - t0) / 30, 1)
        elif x0 > ts[0][2] + 1: f['shift'] = True
        found.append((m.start(), m.end(), f))
    for m in re.finditer(r'<div class="mcalc[^"]*" data-mc="([^"]*)">(.*?)<div class="mc-bar"></div>(.*?)</div></div>', p, re.S):
        if inopt(m.start()): continue
        a = m.group(1).split('|'); r = dict(re.findall(r'<b class="mc-n (rm|rcm)[^"]*">([^<]*)</b>', m.group(3)))
        rh = dict((k, 'hole' in c) for k, c in re.findall(r'<b class="mc-n (rm|rcm)([^"]*)">', m.group(3)))
        found.append((m.start(), m.end(), {'k': 'mc', 'a': [int(a[0]), int(a[1])], 'op': a[2], 'b': [int(a[3]), int(a[4])], 'r': ['?' if rh.get('rm') else int(a[5]), '?' if rh.get('rcm') else int(a[6])]}))
    for m in re.finditer(r'<div class="mrow" data-mr="([^"]*)">(.*?)</div>', p, re.S):
        if inopt(m.start()): continue
        a = m.group(1).split('|'); hole = 'mr-r hole' in m.group(2)
        found.append((m.start(), m.end(), {'k': 'mr', 'a': [int(a[0]), int(a[1])], 'op': a[2], 'b': [int(a[3]), int(a[4])], 'r': '?' if hole else [int(a[5]), int(a[6])]}))
    for m in re.finditer(r'<div class="ettab" data-est="([^"]*)"[^>]*>(.*?)</div>', p, re.S):
        if inopt(m.start()): continue
        b = m.group(2); hd = [clean(x) for x in re.findall(r'<span class="et-h">(.*?)</span>', b)]
        cells = re.findall(r'<span class="et-(n|v)([^"]*)">(.*?)</span>', b); rows = []
        for k, c, v in cells:
            if k == 'n': rows.append([clean(v)])
            elif rows: rows[-1].append(hv(c, v))
        found.append((m.start(), m.end(), {'k': 'est', 'heads': hd, 'rows': rows}))
    for m in re.finditer(r'<div class="bdset" data-body="([^"]*)">(.*?)</div></div>', p, re.S):
        if inopt(m.start()): continue
        its = [{'emoji': html.unescape(e.strip()), 'name': clean(n), 'v': ('약 ' if '약' in pre else '') + hv(c, v) + clean(post)} for e, n, pre, c, v, post in re.findall(r'<div class="bd-c" data-k="\w+"><em>(.*?)</em><span>(.*?)</span><p>([^<]*)<b class="bd-n([^"]*)">([^<]*)</b>([^<]*)</p></div>', m.group(2), re.S)]
        found.append((m.start(), m.end(), {'k': 'body', 'items': its}))
    for m in re.finditer(r'<div class="ucset" data-unit="([^"]*)">(.*?)</div></div>', p, re.S):
        if inopt(m.start()): continue
        its = [{'emoji': html.unescape(e.strip()), 'name': clean(n), 'v': clean(pre) + ' ' + hv(c, u)} for e, n, pre, c, u in re.findall(r'<div class="uc"><em>(.*?)</em><span>(.*?)</span><p>([^<]*)<b class="uc-u([^"]*)">([^<]*)</b></p></div>', m.group(2), re.S)]
        found.append((m.start(), m.end(), {'k': 'uc', 'items': its}))
    for m in re.finditer(r'<div class="col chwrap" data-ch="([^"]*)">(.*?)<b class="ch-tot( hole)?">([^<]*)</b>', p, re.S):
        if inopt(m.start()): continue
        segs = [{'name': clean(u), 'lab': clean(b)} for u, b in re.findall(r'<div class="ch-seg"[^>]*><u>(.*?)</u><b>(.*?)</b></div>', m.group(2))]
        found.append((m.start(), m.end(), {'k': 'ch', 'cm': [int(x) for x in m.group(1).split('|')[0].split(',')], 'segs': segs, 'tot': '?' if m.group(3) else clean(m.group(4))}))
    for m in re.finditer(r'<div class="pw" data-pw="([^"]*)">(.*?)</div></div>', p, re.S):
        if inopt(m.start()): continue
        a = [int(x) for x in m.group(1).split('|')]; c = dict((k, hv(h, v)) for k, h, v in re.findall(r'<b class="pw-c (t|a|b)([^"]*)"[^>]*>([^<]*)</b>', m.group(2)))
        found.append((m.start(), m.end(), {'k': 'pw', 'cm': a, 't': c.get('t', ''), 'a': c.get('a', ''), 'b': c.get('b', '')}))
    return [f for _, _, f in sorted(found, key=lambda x: x[0])]

# 143차 — 2-2 4단원 「시각과 시간」 그림: clock(data-clock 새 꼴 — figs3 clock 과 같은 키) · dclock(디지털시계 h·m·pre 오전/오후) · tband(시간 띠 from·to·h0·h1·step·켠 칸)
#   · kcal(달력 y·m·first·days·upto·ring·marks 날짜→이모지) · day24(하루 시간 띠 segs·cols·legs) · mdays(월별 날수 표 hide) · upair(단위 짝 카드) · grow(날짜 사이 몇 년·개월·주 후) · plan(시간표). 원문 순서대로.
def figs11(p):
    found = []
    opts = [(m.start(), m.end()) for m in re.finditer(r'<button class="mcq-opt".*?</button>', p, re.S)]
    inopt = lambda a: any(x <= a < y for x, y in opts)
    J = lambda v: json.loads(html.unescape(v))
    for m in re.finditer(r'<svg class="clock (\w+)"[^>]*data-clock="([^"]*)"[^>]*>(.*?)</svg>(?:\s*<span class="cl-tag( amber)?">(.*?)</span>)?', p, re.S):
        if inopt(m.start()): continue
        d = J(m.group(2)); hl = re.findall(r'class="cl-hl"[^>]*r="(\d+)"', m.group(3))
        c = {'k': 'clock', 'h': int(d['h']), 'm': int(d['m']), 'hands': d.get('hands', 'hm'), 'size': m.group(1)}
        if d.get('bad'): c['bad'] = True; c['deg'] = {k: float(v) for k, v in re.findall(r'data-hand="(\w)" data-deg="([\d.]+)"', m.group(3))}
        if hl: c['hl'] = 'h' if int(hl[0]) < 60 else 'm'
        if m.group(5): c['tag'] = clean(m.group(5))
        if m.group(4): c['amber'] = True
        found.append((m.start(), m.end(), c))
    for m in re.finditer(r'<div class="dclock"[^>]*data-dclock="([^"]*)"', p):
        if inopt(m.start()): continue
        d = J(m.group(1)); c = {'k': 'dclock', 'h': int(d['h']), 'm': int(d['m'])}
        if d.get('pre'): c['pre'] = d['pre']
        found.append((m.start(), m.end(), c))
    for m in re.finditer(r'<div class="tband"[^>]*data-band="([^"]*)">(.*?)</div></div>', p, re.S):
        if inopt(m.start()): continue
        d = J(m.group(1))
        found.append((m.start(), m.end(), {'k': 'tband', 'title': clean(first(r'class="tb-title">(.*?)</div>', m.group(2))), 'from': d['from'], 'to': d['to'], 'h0': d['h0'], 'h1': d['h1'], 'step': d['step'],
                                          'on': [int(t) for c2, t in re.findall(r'<i class="tb-c( on)?" data-t="(\d+)"', m.group(2)) if c2]}))
    for m in re.finditer(r'<div class="kcal[^"]*" data-kcal="([^"]*)">(.*?)</div></div>', p, re.S):
        if inopt(m.start()): continue
        d = J(m.group(1)); body = m.group(2)
        marks = {int(dd): html.unescape(e.strip()) for dd, e in re.findall(r'data-day="(\d+)"[^>]*><b>\d+</b><em>(.*?)</em>', body)}
        ring = [int(x) for x in re.findall(r'class="kc-d[^"]*ring[^"]*" data-day="(\d+)"', body)] or d.get('ring', [])
        c = {'k': 'kcal', 'y': d['y'], 'm': d['m'], 'first': d['first'], 'days': d['days'], 'upto': d['upto'], 'ring': ring}
        if marks: c['marks'] = {str(k): v for k, v in sorted(marks.items())}
        found.append((m.start(), m.end(), c))
    for m in re.finditer(r'<div class="day24[^"]*" data-day24="([^"]*)">(.*?)<div class="dy-leg">(.*?)</div>', p, re.S):
        if inopt(m.start()): continue
        d = J(m.group(1)); cols = {int(t): col for t, col in re.findall(r'data-t="(\d+)" data-seg="\d+" style="background:(#\w+)"', m.group(2))}
        legs = [(col, clean(n)) for col, n in re.findall(r'<span class="dy-lg"><i style="background:(#\w+)"></i>(.*?)</span>', m.group(3))]
        found.append((m.start(), m.end(), {'k': 'day24', 'segs': d['segs'], 'cols': [cols.get(a, '') for a, _ in d['segs']], 'legs': [{'col': c2, 'name': n} for c2, n in legs]}))
    for m in re.finditer(r'<div class="mdays" data-mdays="([^"]*)">(.*?)</table>', p, re.S):
        if inopt(m.start()): continue
        found.append((m.start(), m.end(), {'k': 'mdays', 'days': [int(v) for v in re.findall(r'data-v="(\d+)"', m.group(2))], 'hide': J(m.group(1)).get('hide', [])}))
    for m in re.finditer(r'<div class="upair"[^>]*>(.*?)</div></div>', p, re.S):
        if inopt(m.start()): continue
        found.append((m.start(), m.end(), {'k': 'upair', 'items': [[clean(a), clean(b)] for a, b in re.findall(r'<b>(.*?)</b><i>=</i><b>(.*?)</b>', m.group(1))]}))
    for m in re.finditer(r'<div class="grow[^"]*" data-grow="[^"]*">(.*?)</div></div>', p, re.S):
        if inopt(m.start()): continue
        nodes = [{'date': clean(b), 'label': clean(sp)} for b, sp in re.findall(r'<div class="gr-n"[^>]*><b>(.*?)</b><span>(.*?)</span>', m.group(1))]
        legs = [{'n': '?' if e.strip() == '?' else int(e), 'u': u} for u, e in re.findall(r'<div class="gr-a" data-n="\d+" data-u="(\w+)"><em>(.*?)</em>', m.group(1))]
        found.append((m.start(), m.end(), {'k': 'grow', 'nodes': nodes, 'legs': legs}))
    for m in re.finditer(r'<div class="plan"><table>(.*?)</table>', p, re.S):
        if inopt(m.start()): continue
        rows = [[clean(x) for x in re.findall(r'<t[hd]>(.*?)</t[hd]>', r)] for r in re.findall(r'<tr>(.*?)</tr>', m.group(1), re.S)]
        found.append((m.start(), m.end(), {'k': 'plan', 'rows': rows}))
    return [f for _, _, f in sorted(found, key=lambda x: x[0])]

# 144차 — 2-2 5단원 「표와 그래프」 그림: tbl(ftab 표 · 제목 tb-ttl · head·cats·vals·total·total_hole·holes) · graph(cgraph 그래프 · 제목 cg-ttl · sym·vert·cats·vals·max·holes·bad
#          · ax[세로 이름, 가로 이름] · grid 칸마다 기호(아래→위 / 왼→오, 실제 그려진 대로)) · tally(세면서 표시 · cats·counts·name) · dc(자료 낱장 · items[이름,항목] · on)
#          · sort(분류 칸 · groups[[항목,[이름]]]) · ways(조사 방법 카드) · wcal(날씨 달력 · first·days·mark·ring) · note(쪽지 · hd·body·sg). pairbox 안이면 pb 꼬리표. 원문 순서대로.
def figs12(p):
    found = []
    opts = [(m.start(), m.end()) for m in re.finditer(r'<button class="mcq-opt".*?</button>', p, re.S)]
    inopt = lambda a: any(x <= a < y for x, y in opts)
    J = lambda v: json.loads(html.unescape(v))
    pbs = [(m.start(), m.group(1)) for m in re.finditer(r'<span class="pb-n">(.*?)</span>', p)]
    def pb(a, c):
        if 'class="pairbox"' in p[:a]:
            lab = [t for x, t in pbs if x < a]
            if lab and a - max(x for x, _ in pbs if x < a) < 400: c['pb'] = clean(lab[-1])
        return c
    def ttl(a, cls):
        t = re.findall(r'<p class="%s">(.*?)</p>' % cls, p[max(0, a - 300):a], re.S)
        return clean(t[-1]) if t else ''
    for m in re.finditer(r'<div class="ftab[^"]*" data-tbl="([^"]*)"', p):
        if inopt(m.start()): continue
        d = J(m.group(1)); c = {'k': 'tbl', 'title': ttl(m.start(), 'tb-ttl'), 'head': d['head'], 'cats': d['cats'], 'vals': d['vals'], 'total': d['total'], 'total_hole': d['total_hole'], 'holes': d['holes']}
        found.append((m.start(), m.end(), pb(m.start(), c)))
    for m in re.finditer(r'<div class="cgraph[^"]*" data-graph="([^"]*)"[^>]*>(.*?)<div class="cg-corner"><b>(.*?)</b><b>(.*?)</b></div>', p, re.S):
        if inopt(m.start()): continue
        d = J(m.group(1)); n = len(d['cats']); mx = d['max']
        cells = [html.unescape(x) for x in re.findall(r'<div class="cg-c[^"]*">(?:<i>(.*?)</i>)?</div>', m.group(2))]
        grid = [[] for _ in range(n)]
        if d['vert']:  # 줄 = 위(max)→아래(1), 칸 = 항목
            for r in range(mx):
                for i in range(n): grid[i].insert(0, cells[r * n + i] if r * n + i < len(cells) else '')
        else:          # 줄 = 항목, 칸 = 1→max
            for i in range(n): grid[i] = cells[i * mx:(i + 1) * mx]
        c = {'k': 'graph', 'title': ttl(m.start(), 'cg-ttl'), 'sym': d['sym'], 'vert': d['vert'], 'cats': d['cats'], 'vals': d['vals'], 'max': mx, 'holes': d['holes'], 'bad': d['bad'],
             'ax': [clean(m.group(3)), clean(m.group(4))], 'grid': [''.join('1' if x else '0' for x in g) for g in grid]}
        if d['sym'] == 'O' and any(x and x != '◯' for g in grid for x in g): c['odd'] = [[j for j, x in enumerate(g) if x and x != '◯'] for g in grid]
        found.append((m.start(), m.end(), pb(m.start(), c)))
    for m in re.finditer(r'<div class="tally[^"]*" data-tally="([^"]*)"[^>]*>(.*?)<div class="tl-h tl-n">(.*?)</div>', p, re.S):
        if inopt(m.start()): continue
        d = J(m.group(1))
        found.append((m.start(), m.end(), pb(m.start(), {'k': 'tally', 'name': clean(m.group(3)), 'cats': d['cats'], 'counts': d['counts'], 'holes': d.get('holes', [])})))
    for m in re.finditer(r'<div class="dcset[^"]*" data-dc="([^"]*)"[^>]*>(.*?)</div></div>', p, re.S):
        if inopt(m.start()): continue
        on = [i for i, c2 in enumerate(re.findall(r'<div class="dc( on)?">', m.group(2))) if c2]
        found.append((m.start(), m.end(), pb(m.start(), {'k': 'dc', 'items': J(m.group(1)), 'on': on})))
    for m in re.finditer(r'<div class="sorttab[^"]*" data-sort="([^"]*)"', p):
        if inopt(m.start()): continue
        found.append((m.start(), m.end(), pb(m.start(), {'k': 'sort', 'groups': [[clean(g), ns] for g, ns in J(m.group(1))]})))
    for m in re.finditer(r'<div class="wcset" data-way="[^"]*">(.*?)</div></div>', p, re.S):
        if inopt(m.start()): continue
        found.append((m.start(), m.end(), {'k': 'ways', 'items': [{'emoji': html.unescape(e.strip()), 'name': clean(n)} for e, n in re.findall(r'<div class="wc"><em>(.*?)</em><b>(.*?)</b></div>', m.group(1))]}))
    for m in re.finditer(r'<div class="cal[^"]*" data-cal="([^"]*)"', p):
        if inopt(m.start()): continue
        d = J(m.group(1))
        found.append((m.start(), m.end(), pb(m.start(), {'k': 'wcal', 'first': d['first'], 'days': d['days'], 'mark': d.get('mark', []), 'ring': d.get('ring', [])})))
    for m in re.finditer(r'<div class="note"><p class="nt-hd">(.*?)</p><p class="nt-b">(.*?)</p>(?:<p class="nt-sg">(.*?)</p>)?', p, re.S):
        if inopt(m.start()): continue
        found.append((m.start(), m.end(), {'k': 'note', 'hd': clean(m.group(1)), 'body': clean(re.sub(r'<b class="nt-h[^"]*">(.*?)</b>', r'<b>\1</b>', m.group(2))), 'sg': clean(m.group(3) or '')}))
    return [f for _, _, f in sorted(found, key=lambda x: x[0])]

if __name__ == '__main__':
    d, outp = sys.argv[1], sys.argv[2]
    res = {}
    for f in sorted(os.listdir(d)):
        m = re.match(r'g\d_math_u(\d+)_l(\d+)_', f) or re.match(r'g1_kor_u(\d+)_l(\d+)', f)
        if not m or not f.endswith('.html'): continue
        res['u%d_l%02d' % (int(m.group(1)), int(m.group(2)))] = parse(os.path.join(d, f))
    json.dump(res, open(outp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(outp, len(res), '차시', sum(len(v['slides']) for v in res.values()), '개념 장', sum(len(v['problems']) for v in res.values()), '문제',
          '· 답 없음', sum(1 for v in res.values() for q in v['problems'] if not any(k in q for k in ('a', 'opts', 'cards', 'rows'))))

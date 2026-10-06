#!/usr/bin/env python3
"""parse_selfdirected_ko.py — 국어 자기주도 차시(slides=[{tag,t,html,...}] 꼴) → 케이티처 재료 JSON (35차, 베프).
   사용: python3 parse_selfdirected_ko.py <단원 폴더> <out.json>
   수학 추출기(parse_selfdirected_src.py)와 달리 국어 3-2 는 손으로 쓴 slides 배열 — 장마다 kind 로 가른다:
   bub(말풍선 개념) · read(글·시 줄) · scene(인물 말 줄) · recap(정리) · stage(교실에서 할 일) · sentence(학습 문제)
   · pick(보기 하나 고르기) · collect(모두 고르기) · match(짝 잇기). 키 = 파일 첫 차시(l02_03 → u1_l02, covers 2~3)."""
import sys, os, re, json, html

def clean(s):
    s = re.sub(r'<br\s*/?>', '\n', s)
    s = re.sub(r'</?(b|strong)[^>]*>', '**', s)
    s = re.sub(r'<small>.*?</small>', '', s, flags=re.S)
    s = re.sub(r'<button.*?</button>', '', s, flags=re.S)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s).replace('****', '')
    return '\n'.join(x.strip() for x in s.split('\n') if x.strip()).strip()

def field(obj, name):
    m = re.search(name + r"\s*:\s*'((?:[^'\\]|\\.)*)'", obj)
    return m.group(1).replace("\\'", "'") if m else ''

def split_objs(arr):
    out, depth, start, i, q = [], 0, None, 0, None
    while i < len(arr):
        c = arr[i]
        if q:
            if c == '\\': i += 2; continue
            if c == q: q = None
        elif c in "'`\"": q = c
        elif c == '{':
            if depth == 0: start = i
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: out.append(arr[start:i + 1])
        i += 1
    return out

def parse(path):
    src = open(path, encoding='utf-8').read()
    head = re.search(r'학습 목표:\s*(.*)', src)
    goal = head.group(1).strip() if head else ''
    arr = src[src.index('slides=['):]
    res = {'file': os.path.basename(path), 'goal': goal, 'slides': []}
    for o in split_objs(arr[len('slides='):].split('\n];')[0] + '\n]'):
        h = re.search(r'html:`(.*?)`', o, re.S); h = h.group(1) if h else ''
        s = {'tag': field(o, 'tag'), 't': field(o, 't'), 'log': 'log:true' in o.replace(' ', '')}
        for k in ('hint', 'okMsg', 'collectMsg', 'matchMsg'):
            v = field(o, k)
            if v: s[k] = v
        if 'class="wordpick"' in h or 'class="wcard"' in h:
            cards = re.findall(r'data-ok="(\d)"[^>]*>(.*?)</div>\s*</div>', h, re.S)
            s['kind'] = 'pick'; s['opts'] = [clean(re.sub(r'<div class="wc-pic">.*?</div>', '', t)) .replace('\n', ' ') for _, t in cards]
            s['pics'] = re.findall(r'class="wc-pic">(.*?)<', h); s['ci'] = [c for c, _ in cards].index('1')
        elif 'class="collect"' in h:
            ch = re.findall(r'data-hit="(\d)">(.*?)</div>', h, re.S)
            s['kind'] = 'collect'; s['chips'] = [{'t': clean(t), 'hit': c == '1'} for c, t in ch]
        elif 'class="match"' in h:
            L = re.findall(r'data-k="(\w)" data-pair="(\w)">(.*?)</div>', h, re.S)
            heads = [clean(x) for x in re.findall(r'class="match-col-h">(.*?)</div>', h)]
            left = {k: clean(t) for k, p, t in L[:len(L) // 2]}; right = {k: clean(t) for k, p, t in L[len(L) // 2:]}
            s['kind'] = 'match'; s['heads'] = heads; s['pairs'] = [[left[k], right[p]] for k, p, t in L[:len(L) // 2]]
        elif 'read-line' in h:
            # 74차: 글 판 줄 번호가 숫자가 아닌 「제목」 글자여도 뗀다(u5 l07 감상문 제목 줄 — ㉮㉯ 꼴 글자 번호는 3-2 국어가 본문으로 쓰므로 그대로 둠 · u1~u4·3-2 u1~u6 재추출 바이트 동일)
            s['kind'] = 'read'; s['lines'] = [clean(re.sub(r'<span class="rl-num">(?:\d+|제목)</span>', '', t)) for t in re.findall(r'class="read-line">(.*?)</div>', h, re.S)]
        elif 'recap' in h:
            s['kind'] = 'recap'; s['items'] = [clean(re.sub(r'<span class="recap-ic">(.*?)</span>', r'\1 ', t)) for t in re.findall(r'class="recap-item"[^>]*>(.*?)</div>', h, re.S)]
        elif 'class="sentence"' in h:
            s['kind'] = 'sentence'; s['text'] = clean(re.search(r'class="sentence">(.*?)</div>', h, re.S).group(1))
        else:
            s['kind'] = 'stage' if 'stage-box' in h else ('scene' if 'scene-say' in h else 'bub')
            if 'scene-say' in h:
                say = clean(re.search(r'class="scene-say">(.*?)</div>', h, re.S).group(1))
                s['say'] = [x.split(' — ', 1) for x in say.split('\n')]
            if 'scene-pic' in h: s['pic'] = clean(re.search(r'class="scene-pic">(.*?)</div>', h, re.S).group(1))
            b = re.search(r'class="ka-bub">(.*?)</div>', h, re.S)
            if b: s['text'] = clean(b.group(1))
            st = re.search(r'class="stage-box">(.*?)(?:<button|</div>)', h, re.S)
            if st: s['stage'] = clean(st.group(1))
        # 남은 보조 블록(표·칩 줄 등)의 글도 잃지 않게
        extra = [clean(x) for x in re.findall(r'class="(?:sc-box|ex-box|note-box|rule-box)">(.*?)</div>', h, re.S)]
        if extra: s['extra'] = extra
        s['raw'] = clean(h)[:600]
        res['slides'].append(s)
    return res

if __name__ == '__main__':
    d, o = sys.argv[1], sys.argv[2]
    files = sorted(f for f in os.listdir(d) if re.match(r'g\d_kor_u\d+_l\d+', f))
    res = {}
    for f in files:
        m = re.search(r'_(u\d+)_l(\d+)(?:_(\d+))?(?:_(\d+))?\.html', f)
        r = parse(os.path.join(d, f)); ns = [int(x) for x in m.groups()[1:] if x]
        r['covers'] = [ns[0], ns[-1]]
        res['%s_l%02d' % (m.group(1), ns[0])] = r
    json.dump(res, open(o, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(o, len(res), '차시', sum(len(v['slides']) for v in res.values()), '장', sum(1 for v in res.values() for s in v['slides'] if s['log']), '문항')

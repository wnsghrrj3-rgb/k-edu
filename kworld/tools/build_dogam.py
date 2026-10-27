#!/usr/bin/env python3
"""케이히스토리 — 「신분 도감」 데이터 만들기 → eras/dogam.json

열한 시대 life.json 의 신분 규칙(status.rules)·앞 시대 끝 갈림(end.branches)·나라 규칙(nation.rules),
items.json 의 신분 조건(status:<id>)을 읽어 시대별 신분 카드 목록을 한 파일로 굽는다. 코어는 시대 이름을 모른다 — 순서는 chain.json.

카드 한 장 = { id, name, cap, say, mid, ways:[가는 길 한 줄…], only:[이 집에만 열리는 일 제목…], closed:[이 집엔 닫힌 일 제목…] }
  · ways = 규칙의 if 를 사람 말로(앞 대 신분·앞 대 끝 갈림·물려받은 값·나라·태어남). never:1 이면 mid=true(「삶 중간에 — 선택으로」) — 어디서인지는 안 적는다(비밀).
  · only = items.json 에서 status:<id> 가 참이어야 보이는 판·선택지의 제목 / closed = 선택지 if 에 !status:<id> 가 있고 회색 이유(gray)가 있는 것.
실행: python3 kworld/tools/build_dogam.py  (레포 루트 또는 kworld/ 에서)
"""
import json, os, re, sys
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__)); KW = os.path.dirname(HERE); ERAS = os.path.join(KW, 'eras')
J = lambda p: json.load(open(p, encoding='utf-8'))
CHAR = {'eye': '눈이 밝은 사람', 'hand': '손이 좋은 사람', 'foot': '발이 빠른 사람', 'belly': '잘 버티는 사람'}
VAL = {'grain': '🌾 곡식', 'craft': '✋ 솜씨', 'heart': '🤝 인심', 'rank': '🎖 벼슬'}
ORD = {'>=': ' 이상', '>': ' 넘게', '<=': ' 이하', '<': ' 아래', '=': ''}


def branches(life):
    """끝 갈림 id → 제목 (situations[].choices[].then[].end.branches)"""
    out = {}
    for s in life.get('situations', []):
        for c in s.get('choices', []):
            for a in c.get('then', []) or []:
                e = a.get('end') if isinstance(a, dict) else None
                for b in (e or {}).get('branches', []) or []:
                    out.setdefault(b['id'], b.get('title') or b['id'])
    return out


def rule_name(rules, rid):
    for r in rules or []:
        if r['id'] == rid: return r['name']
    return None


def way(cond, prev, prevB, nations, cur=None):
    """규칙 if 한 줄 → 가는 길 한 줄(사람 말). 부정(!)은 뺀다. never:1 은 None(삶 중간)."""
    if not cond: return '다른 길이 아니면 — 기본'
    parts = []
    for t in re.split(r'\s*&&\s*', cond.strip()):
        t = t.strip()
        if t.startswith('!'): continue
        t = t.strip('()')
        alts = [x.strip() for x in t.split('||')]
        ws = []
        for f in alts:
            if f.startswith('!'): continue
            if f == 'never:1': return None
            if f.startswith('fromstatus:'):
                n = rule_name(prev, f[11:]) or rule_name(cur, f[11:])
                if n: ws.append(f'앞 대가 「{n}」')
            elif f.startswith('from:'):
                n = prevB.get(f[5:])
                if n: ws.append(f'앞 대 끝이 「{n}」')
            elif f.startswith('val:'):
                m = re.match(r'(\w+)(>=|<=|>|<|=)(\d+)', f[4:]); ws.append(f'{VAL.get(m[1], m[1])} {m[3]}{ORD[m[2]]}을 물려받으면' if m else f)
            elif f.startswith('nation:'):
                n = rule_name(nations, f[7:]); ws.append(f'🏳️ {n or f[7:]} 사람이면')
            elif f.startswith('char:') or f.startswith('sex:'):
                ws.append('태어남 뽑기에 따라')   # 어느 뽑기인지는 안 적는다 — 출발 조건은 비밀(준호 09-19)
            elif f.startswith('fromrank:'):
                ws.append(f'앞 대 벼슬이 {f[9:]}이면')
            else:
                ws.append(f)
        if ws: parts.append(' 또는 '.join(ws))
    if not parts: return ''   # 풀 수 없는 조건(앞 시대에 없는 갈림)은 길로 안 적는다
    return ' · '.join(parts)


def status_tokens(cond):
    """if 문자열에서 (긍정 status 집합, 부정 status 집합)"""
    pos, neg = set(), set()
    for m in re.finditer(r'(!?)status:(\w+)', cond or ''):
        (neg if m.group(1) else pos).add(m.group(2))
    # 괄호 묶음 앞의 !(…) 는 안의 것을 전부 부정
    for m in re.finditer(r'!\(([^)]*)\)', cond or ''):
        for n in re.findall(r'status:(\w+)', m.group(1)): pos.discard(n); neg.add(n)
    return pos, neg


def gates(items):
    """items.json → {status: {only:[제목…], closed:[제목…]}}"""
    out = {}
    def add(sid, kind, title):
        if not title: return
        d = out.setdefault(sid, {'only': [], 'closed': []})
        if title not in d[kind]: d[kind].append(title)
    def choices_of(board):
        res = []
        for c in board.get('choices', []) or []:
            res.append(c)
        return res
    for tid, tg in (items.get('targets') or {}).items():
        boards = [tg] + list(tg.get('rename', []) or [])
        for b in boards:
            bpos, _ = status_tokens(b.get('if'))
            for c in choices_of(b):
                cpos, cneg = status_tokens(c.get('if')); title = c.get('title') or c.get('label')
                never = 'never:1' in (c.get('if') or '')
                if c.get('gray') and (never or cneg):   # 신분 때문에 닫힌 일 = never:1(이 판을 보는 집엔 늘 회색) 또는 !status: — 곡식·친구 때문에 회색인 건 아님
                    for sid in (bpos if never else set()) | cneg: add(sid, 'closed', title)
                    continue
                if c.get('gray') and not cpos: continue   # 값·흔적·친구 조건 회색은 신분 일이 아니다
                for sid in bpos | cpos: add(sid, 'only', title)
    return out


def build():
    chain = J(os.path.join(ERAS, 'chain.json'))
    eras = []; prev_life = None
    for e in chain['eras']:
        d = os.path.join(ERAS, e['era']); life = J(os.path.join(d, 'life.json')); world = J(os.path.join(d, 'world.json'))
        items = J(os.path.join(d, 'items.json')) if os.path.exists(os.path.join(d, 'items.json')) else {}
        prev = (prev_life or {}).get('status', {}).get('rules'); prevB = branches(prev_life) if prev_life else {}
        nations = life.get('nation', {}).get('rules')
        g = gates(items)
        cards = OrderedDict()
        for r in life.get('status', {}).get('rules', []) or []:
            c = cards.setdefault(r['id'], {'id': r['id'], 'name': r['name'], 'cap': r.get('cap'), 'say': r.get('say') or '', 'mid': False, 'ways': []})
            if r['name'] != c['name'] and r['name'] not in c.setdefault('aka', []): c['aka'].append(r['name'])
            w = way(r.get('if'), prev, prevB, nations, life.get('status', {}).get('rules'))
            if w is None: c['mid'] = True
            elif w and w not in c['ways']: c['ways'].append(w)
        for sid, c in cards.items():
            if len(c['ways']) > 4: c['ways'] = c['ways'][:4] + [f'…그 밖에 {len(c["ways"]) - 4}길']
            gg = g.get(sid, {}); c['only'] = gg.get('only', [])[:12]; c['closed'] = gg.get('closed', [])[:12]
        sitT = {s['id']: s.get('title') or s['id'] for s in life.get('situations', [])}   # 139: 역사의 인물 — 이름·직함·어느 사건에 오는지(그림자용)
        figs = [{'id': f['id'], 'name': f['name'], 'title': f.get('title'), 'event': sitT.get(str(f.get('on', '')).split(':')[1] if ':' in str(f.get('on', '')) else '', '')} for f in world.get('figures', [])]
        eras.append({'era': e['era'], 'short': e['short'], 'years': e.get('years', ''), 'chain': e.get('chain', ''), 'figures': figs, 'none': life.get('status', {}).get('none') or (None if cards else '신분이 없다 — 쌓아 둘 것이 없어 높고 낮음이 없었다.'), 'statuses': list(cards.values())})
        prev_life = life
    out = {'title': '신분 도감', 'people': sum(len(x['figures']) for x in eras), 'note': '시대마다 어떤 집이 있었고, 그 집은 무엇을 할 수 있고 무엇을 못 했나. 살아 본 집만 안이 보인다 — 다른 집이 궁금하면 다시 태어나 보자.', 'eras': eras}
    p = os.path.join(ERAS, 'dogam.json'); json.dump(out, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    n = sum(len(x['statuses']) for x in eras); print(f'dogam.json — 시대 {len(eras)} · 신분 카드 {n}')
    for x in eras: print(' ', x['short'], len(x['statuses']), [s['id'] for s in x['statuses']])
    return out


if __name__ == '__main__':
    build()

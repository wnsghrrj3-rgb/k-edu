#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""금성초 학력경시 양식(.hwpx) → 케이학습지 시험지 틀(tpl/*.hwpx)

  python3 kedu/worksheet/exam/tools/make_tpl.py 문항지.hwpx 목록표.hwpx

원본 양식에서 지난 시험 글을 모두 걷어 내고 자리표({{...}})만 남긴다.
header.xml(글꼴·문단·테두리 정의)은 손대지 않는다 — 내보내기는 이 정의 번호(charPr·paraPr·borderFill)를 그대로 쓴다.
틀 zip 안의 tpl_*.xml 은 내보내기가 읽는 조각이고, 내보낸 파일에는 들어가지 않는다.
"""
import re, sys, zipfile, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tpl')
def _blank_png():
    import struct, zlib
    w, h = 210, 297
    raw = b''.join(b'\x00' + b'\xff' * (w * 3) for _ in range(h))
    def ck(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + ck(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + ck(b'IDAT', zlib.compress(raw, 9)) + ck(b'IEND', b'')
BLANK_PNG = _blank_png()
LSEG = re.compile(r'<hp:linesegarray>.*?</hp:linesegarray>', re.S)

def read(z, n): return z.read(n).decode('utf-8')

def sublist_spans(s, tbl_start):
    """tbl_start 위치의 표에서 셀 subList 안쪽 [시작, 끝) 목록(겹표는 건너뜀)"""
    out, i, depth = [], tbl_start, 0
    pat = re.compile(r'<hp:tbl |</hp:tbl>|<hp:subList [^>]*>|</hp:subList>')
    stack = []
    for m in pat.finditer(s, tbl_start):
        t = m.group(0)
        if t.startswith('<hp:tbl '): depth += 1
        elif t == '</hp:tbl>':
            depth -= 1
            if depth == 0: return out, m.end()
        elif t.startswith('<hp:subList'):
            in_tc = re.search(r'<hp:tc [^>]*>\s*$', s[max(0, m.start() - 400):m.start()]) is not None
            stack.append((depth if in_tc else -1, m.end()))
        else:
            d, st = stack.pop()
            if d == 1: out.append((st, m.start()))
    raise ValueError('표 끝 없음')

def write(dst, src_zip, section, extra):
    with zipfile.ZipFile(src_zip) as z, zipfile.ZipFile(dst, 'w') as o:
        for it in z.infolist():
            n = it.filename
            if n == 'Preview/PrvImage.png': data = BLANK_PNG
            elif n == 'Preview/PrvText.txt': data = '{{PRVTEXT}}'.encode('utf-8')
            elif n == 'Contents/section0.xml': data = section.encode('utf-8')
            else: data = z.read(n)
            o.writestr(it, data, compress_type=zipfile.ZIP_STORED if n == 'mimetype' else zipfile.ZIP_DEFLATED)
        for n, s in extra.items(): o.writestr(n, s.encode('utf-8'), compress_type=zipfile.ZIP_DEFLATED)

def exam(src):
    z = zipfile.ZipFile(src); s = LSEG.sub('', read(z, 'Contents/section0.xml'))
    body_start = s.index('<hp:p ')                       # 첫 문단(secPr 담은)
    p_ends = [m.end() for m in re.finditer(r'</hp:p>(?=<hp:p |</hs:sec>)', s)]
    # 최상위 문단 경계: 깊이 0 에서 닫히는 </hp:p>
    tops, depth, st = [], 0, None
    for m in re.finditer(r'<hp:p [^>]*>|</hp:p>', s):
        if m.group(0).startswith('<hp:p '):
            if depth == 0: st = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == 0: tops.append((st, m.end()))
    head, tail = s[:tops[0][0]], s[tops[-1][1]:]
    p0 = s[tops[0][0]:tops[0][1]]
    t0 = p0.index('<hp:tbl ')
    cells, tend = sublist_spans(p0, t0)
    assert len(cells) == 3, cells
    # 머리 칸 글자 → 자리표
    hc = p0[cells[0][0]:cells[0][1]]
    hc = re.sub(r'<hp:t>\s*\d{4}-\d-\d차</hp:t>', '<hp:t> {{ROUND}}</hp:t>', hc)
    hc = re.sub(r'<hp:t>[^<]*과 학력경시</hp:t>', '<hp:t>{{SUBJ}}과 학력경시</hp:t>', hc)
    hc = re.sub(r'제 \d학년', '제 {{GRADE}}학년', hc)
    assert '{{ROUND}}' in hc and '{{SUBJ}}' in hc and '{{GRADE}}' in hc, hc[:500]
    p0 = p0[:cells[0][0]] + hc + p0[cells[0][1]:cells[1][0]] + '{{COL_L}}' + p0[cells[1][1]:cells[2][0]] + '{{COL_R}}' + p0[cells[2][1]:]
    # 둘째 쪽 표 문단 = 다음 쪽 틀
    nxt = None
    for a, b in tops[1:]:
        p = s[a:b]
        if '<hp:tbl ' in p: nxt = p; break
    c2, _ = sublist_spans(nxt, nxt.index('<hp:tbl '))
    assert len(c2) == 2
    nxt = nxt[:c2[0][0]] + '{{COL_L}}' + nxt[c2[0][1]:c2[1][0]] + '{{COL_R}}' + nxt[c2[1][1]:]
    nxt = re.sub(r'(<hp:p [^>]*?)pageBreak="0"', r'\1pageBreak="1"', nxt, count=1)
    section = head + p0 + tail
    return z, section, {'tpl_next_page.xml': nxt}

def key(src):
    z = zipfile.ZipFile(src); s = LSEG.sub('', read(z, 'Contents/section0.xml'))
    tops, depth, st = [], 0, None
    for m in re.finditer(r'<hp:p [^>]*>|</hp:p>', s):
        if m.group(0).startswith('<hp:p '):
            if depth == 0: st = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == 0: tops.append((st, m.end()))
    head, tail = s[:tops[0][0]], s[tops[-1][1]:]
    P = [s[a:b] for a, b in tops]
    # 머리 줄
    P[2] = re.sub(r'\d{4}-\d-\d차', '{{ROUND}}', P[2])
    P[2] = re.sub(r'학년 : \d', '학년 : {{GRADE}}', P[2])
    P[2] = re.sub(r'교과 : [^<\s]*', '교과 : {{SUBJ}}', P[2])
    P[2] = re.sub(r'작성자:\s*[^<]*', '작성자: {{AUTHOR}}', P[2])
    assert '{{ROUND}}' in P[2] and '{{AUTHOR}}' in P[2], P[2]
    # 본표: 머리 두 줄 + 첫/가운데/끝 줄 틀
    main = P[3]; ti = main.index('<hp:tbl ')
    trs = [(m.start(), m.end()) for m in re.finditer(r'<hp:tr>.*?</hp:tr>', main, re.S)]
    assert len(trs) == 27, len(trs)
    def rowtpl(x):
        r = main[x[0]:x[1]]
        cs = re.findall(r'<hp:t>([^<]*)</hp:t>', r)
        vals = ['{{NO}}', '{{UNIT}}', '{{PAGE}}', '{{TYPE}}', '{{DIFF}}', '{{PRE}}', '{{ANS}}']
        # 칸마다 첫 <hp:t> 만 자리표로, 나머지 글자는 지움
        out, ci = [], 0
        for tc in re.finditer(r'<hp:tc .*?</hp:tc>', r, re.S):
            c = tc.group(0); first = [True]
            def rep(m):
                if first[0]: first[0] = False; return '<hp:t>' + vals[ci] + '</hp:t>'
                return '<hp:t></hp:t>'
            c2 = re.sub(r'<hp:t>[^<]*</hp:t>|<hp:t/>', rep, c)
            if first[0]:  # 글자 없던 칸 — 첫 run 안에 넣는다
                c2 = re.sub(r'(<hp:run [^>]*?)/>', r'\1><hp:t>' + vals[ci] + '</hp:t></hp:run>', c2, count=1)
            out.append(c2); ci += 1
        r = r[:r.index('<hp:tc ')] + ''.join(out) + r[r.rindex('</hp:tc>') + len('</hp:tc>'):]
        r = re.sub(r'rowAddr="\d+"', 'rowAddr="{{ROW}}"', r)
        return r
    tpl_first, tpl_mid, tpl_last = rowtpl(trs[2]), rowtpl(trs[3]), rowtpl(trs[26])
    main_head = main[:trs[2][0]] + '{{ROWS}}' + main[trs[26][1]:]
    main_head = re.sub(r'(<hp:tbl [^>]*?)rowCnt="27"', r'\1rowCnt="{{ROWCNT}}"', main_head, count=1)
    # 서술형 상세표
    ess = next(p for p in P[4:] if '<hp:tbl ' in p)
    ei = P.index(ess)
    rows = re.findall(r'<hp:tr>.*?</hp:tr>', ess, re.S)
    def fill_right(r, mark):
        tcs = list(re.finditer(r'<hp:tc .*?</hp:tc>', r, re.S)); c = tcs[1].group(0)
        sub_a = c.index('>', c.index('<hp:subList')) + 1; sub_b = c.index('</hp:subList>')
        c = c[:sub_a] + mark + c[sub_b:]
        return r[:tcs[1].start()] + c + r[tcs[1].end():]
    ess_t = ess
    ess_t = ess_t.replace(rows[0], re.sub(r'<hp:t>\s*\d+번\s*</hp:t>', '<hp:t>{{ENO}}</hp:t>', rows[0]))
    ess_t = ess_t.replace(rows[1], fill_right(rows[1], '{{EANS}}'))
    ess_t = ess_t.replace(rows[2], fill_right(rows[2], '{{ECRIT}}'))
    assert '{{ENO}}' in ess_t and '{{EANS}}' in ess_t and '{{ECRIT}}' in ess_t
    # 오른쪽 칸 문단 틀(모범 답안 칸 첫 문단)
    r1 = rows[1]; tcs = list(re.finditer(r'<hp:tc .*?</hp:tc>', r1, re.S)); c = tcs[1].group(0)
    para = re.search(r'<hp:p .*?</hp:p>', c, re.S).group(0)
    para = re.sub(r'<hp:t>[^<]*</hp:t>', '', para); para = re.sub(r'(<hp:run [^>]*?)/>', r'\1>{{RUNS}}</hp:run>', para) if '{{' not in para else para
    if '{{RUNS}}' not in para: para = re.sub(r'(<hp:run [^>]*>)(.*?)(</hp:run>)', r'\1{{RUNS}}\3', para, count=1, flags=re.S)
    section = head + P[0] + P[1] + P[2] + main_head + P[4] + '{{ESSAYS}}' + tail
    extra = {'tpl_row_first.xml': tpl_first, 'tpl_row_mid.xml': tpl_mid, 'tpl_row_last.xml': tpl_last,
             'tpl_essay.xml': P[ei - 1] + ess_t, 'tpl_cell_para.xml': para}
    return z, section, extra

if __name__ == '__main__':
    q, k = sys.argv[1], sys.argv[2]
    z, sec, ex = exam(q); write(os.path.join(OUT, 'exam_q.hwpx'), q, sec, ex)
    z, sec, ex = key(k); write(os.path.join(OUT, 'exam_key.hwpx'), k, sec, ex)
    print('ok')

"""핸드오프 자료(kedu/english/world/lab_v1.js)를 world/data/lab.js 로 옮긴다. 끝의 내보내기 줄만 ES 모듈 꼴로 바꾼다.
쓰기:   python3 tools/sync_lab_data.py <handoff 폴더>          → data/lab.js 를 다시 쓴다
견주기: python3 tools/sync_lab_data.py <handoff 폴더> --check  → 다르면 1 로 끝난다(묶음마다 돌린다)"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'data', 'lab.js')
NL = chr(10)
src = open(os.path.join(sys.argv[1], 'kedu', 'english', 'world', 'lab_v1.js'), encoding='utf-8').read().replace(chr(13) + NL, NL)
i = src.rindex('module.exports = '); body = src[i + len('module.exports = '):].strip().rstrip(';')
head = ('/* 이 파일은 핸드오프 자료 kedu/english/world/lab_v1.js 를 그대로 옮긴 것이다(맨 끝 내보내기 줄만 ES 모듈 꼴). 손으로 고치지 않는다 —' + NL
        + ' * 자료를 고치고 tools/sync_lab_data.py 로 다시 옮긴다. 놀이 코드는 낱말 · 부탁 · 수치를 여기서만 읽는다. */' + NL)
out = head + src[:i] + 'export const LAB = ' + body + ';' + NL + 'export default LAB;' + NL
if '--check' in sys.argv:
    same = open(OUT, encoding='utf-8').read().replace(chr(13) + NL, NL) == out
    print('같다' if same else '다르다'); sys.exit(0 if same else 1)
open(OUT, 'w', encoding='utf-8', newline=NL).write(out); print('옮김', os.path.normpath(OUT))

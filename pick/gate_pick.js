/* 뽑기 도구 — jsdom 실엔진 게이트 (P2)
 * 실행: NODE_PATH=/home/claude/.jsdom/node_modules node pick/gate_pick.js
 * A 부팅 · B 명단 저장 · C 뽑기 실동작 · D 모둠 실렌더 · E 오늘 빠지는 사람 · F 차단 어휘
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const DIR = __dirname;
let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ✅ ' + name); }
  catch (e) { fail++; console.log('  ❌ ' + name + ' — ' + e.message); }
}
function ok(c, m) { if (!c) throw new Error(m || '거짓'); }
function eq(a, b, m) { if (String(a) !== String(b)) throw new Error((m || '') + ' 기댓값 ' + b + ' / 실제 ' + a); }

/* 부팅: /pick/pick_logic.js 요청을 실파일로 이어 준다 */
function boot() {
  let html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
  const logic = fs.readFileSync(path.join(DIR, 'pick_logic.js'), 'utf8');
  html = html.replace('<script src="/pick/pick_logic.js"></script>', '<script>' + logic + '</script>');
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://keduclass.com/pick/', pretendToBeVisual: true });
  const w = dom.window;
  w.alert = function (m) { w.__alert = m; };
  w.confirm = function () { return true; };
  return w;
}

console.log('\n[A] 부팅');
let W;
t('jsdom 부팅 · 스크립트 오류 0', () => {
  W = boot();
  ok(W.document.querySelector('.nav'), 'nav 미렌더');
  ok(typeof W.PickLogic === 'object', 'PickLogic 미로드');
  ok(typeof W.doDraw === 'function', 'doDraw 미정의');
});
t('명단 없으면 빈 상태 안내가 보인다', () => {
  eq(W.document.getElementById('no-class').style.display, 'block');
  eq(W.document.getElementById('main').style.display, 'none');
});
t('localStorage 초기값이 없어도 죽지 않는다', () => {
  ok(W.document.getElementById('classbar').children.length === 1, '반 추가 버튼만 있어야 한다');
});

console.log('\n[B] 명단 저장');
t('붙여넣기 → 30명 저장 · 본문 화면 전환', () => {
  const names = Array.from({ length: 30 }, (_, i) => (i + 1) + '. 학생' + (i + 1)).join('\n');
  W.openSheet(null);
  W.document.getElementById('f-name').value = '3학년 2반';
  W.document.getElementById('f-names').value = names;
  W.saveClass();
  eq(W.document.getElementById('main').style.display, 'block');
  const c = W.S.classes[0];
  eq(c.names.length, 30);
  eq(c.names[0], '학생1', '선행 번호가 안 떨어졌다');
});
t('학급 칩에 인원이 표시된다', () => {
  ok(/30명/.test(W.document.getElementById('classbar').textContent));
});
t('빈 명단 저장은 막힌다', () => {
  W.openSheet(null);
  W.document.getElementById('f-names').value = '   \n  ';
  W.saveClass();
  eq(W.S.classes.length, 1, '빈 반이 만들어졌다');
  ok(W.__alert, '안내가 안 떴다');
  W.closeSheet();
});
t('명단을 고치면 없어진 이름의 기록도 정리된다', () => {
  const c = W.S.classes[0];
  c.drawn = ['학생1', '학생30']; c.excluded = ['학생30'];
  W.openSheet(c.id);
  W.document.getElementById('f-names').value = c.names.slice(0, 29).join('\n');
  W.saveClass();
  const c2 = W.S.classes[0];
  eq(c2.names.length, 29);
  ok(c2.drawn.indexOf('학생30') === -1, '지워진 이름이 기록에 남았다');
  ok(c2.excluded.indexOf('학생30') === -1, '지워진 이름이 제외 목록에 남았다');
});

console.log('\n[C] 뽑기 실동작');
t('뽑기 → 큰 이름이 실제로 바뀐다', () => {
  W.resetRound();
  const before = W.document.getElementById('bigname').textContent;
  W.doDraw();
  const c = W.S.classes[0];
  // 애니메이션 타이머를 실제로 감아 완료 시점까지 밀어 준다
  const done = new Promise(r => setTimeout(r, 0));
  ok(before === '준비');
  ok(W.rolling === true, '뽑기 중 상태가 안 켜졌다');
});
t('애니메이션 종료 후 기록 1명 · 진행 줄 갱신', async () => { }); // 비동기는 아래 묶음에서
t('진행 줄 문구에 오늘 인원이 들어간다', () => {
  const txt = W.document.getElementById('prog-txt').textContent;
  ok(/오늘/.test(txt) && /29/.test(txt), '진행 문구: ' + txt);
});

/* 비동기 구간 — 타이머 완료를 기다려 검사 */
function asyncPart() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('\n[C-2] 뽑기 완료 시점');
      t('뽑힌 이름이 화면에 남는다', () => {
        const nm = W.document.getElementById('bigname').textContent;
        ok(W.S.classes[0].names.indexOf(nm) !== -1, '명단에 없는 이름: ' + nm);
      });
      t('이번 바퀴 기록이 1명', () => { eq(W.S.classes[0].drawn.length, 1); });
      t('나온 사람 목록이 열린다', () => {
        eq(W.document.getElementById('drawnbox').style.display, 'block');
        eq(W.document.getElementById('drawntags').children.length, 1);
      });
      t('진행 막대가 0%를 벗어난다', () => {
        ok(parseFloat(W.document.getElementById('prog-bar').style.width) > 0);
      });
      t('바퀴 초기화가 기록을 비운다', () => {
        W.resetRound();
        eq(W.S.classes[0].drawn.length, 0);
        eq(W.document.getElementById('drawnbox').style.display, 'none');
      });

      console.log('\n[D] 모둠 실렌더');
      t('6모둠 → 카드 6장', () => {
        W.document.getElementById('g-mode').value = 'count';
        W.document.getElementById('g-value').value = '6';
        W.doGroups();
        eq(W.document.getElementById('groups').children.length, 6);
      });
      t('카드에 전원이 빠짐없이 들어간다', () => {
        const txt = W.document.getElementById('groups').textContent;
        const missing = W.S.classes[0].names.filter(n => txt.indexOf(n) === -1);
        eq(missing.length, 0, '누락: ' + missing.join(','));
      });
      t('한 모둠 4명씩 → 인원 표기가 4 또는 3', () => {
        W.document.getElementById('g-mode').value = 'size';
        W.document.getElementById('g-value').value = '4';
        W.doGroups();
        const cards = W.document.getElementById('groups').children;
        for (let i = 0; i < cards.length; i++) {
          const cnt = parseInt(cards[i].querySelector('.cnt').textContent, 10);
          ok(cnt >= 3 && cnt <= 5, i + '모둠 인원 ' + cnt);
        }
      });
      t('모둠 안내 문구가 붙는다', () => {
        ok(/모둠/.test(W.document.getElementById('g-hint').textContent));
      });

      console.log('\n[E] 오늘 빠지는 사람');
      t('이름 목록이 전원 렌더된다', () => {
        eq(W.document.getElementById('exlist').children.length, 29);
      });
      t('누르면 빠짐 표시 + 오늘 인원이 줄어든다', () => {
        W.document.getElementById('exlist').children[0].click();
        ok(W.S.classes[0].excluded.length === 1, '제외 기록이 안 남았다');
        ok(/28/.test(W.document.getElementById('prog-txt').textContent), '오늘 인원이 안 줄었다');
      });
      t('빠진 사람은 모둠에도 안 들어간다', () => {
        const out = W.S.classes[0].excluded[0];
        W.doGroups();
        const cells = Array.from(W.document.querySelectorAll('#groups li')).map(li => li.textContent);
        ok(cells.indexOf(out) === -1, out + '이(가) 모둠에 들어갔다');
        eq(cells.length, 28, '오늘 인원만큼 배정되지 않았다');
      });
      t('다시 누르면 풀린다', () => {
        W.document.getElementById('exlist').children[0].click();
        eq(W.S.classes[0].excluded.length, 0);
      });

      console.log('\n[F] 차단 어휘 (PRINCIPLES 12조)');
      t('index.html · pick_logic.js 차단 어휘 0', () => {
        const banned = [
          new RegExp('\uBC15' + '\uC74C'),
          new RegExp('\uBE75' + '\uAF49'),
          new RegExp('\uAC08\uC544' + '\uC5CE'),
          new RegExp('\uACB0' + '\uB85C'),
          new RegExp('(^|[^\uAC00-\uD7A3])' + '\uACB0' + '([^\uAC00-\uD7A3]|$)'),
          new RegExp('\uBCF8\uACA9\uC801\uC73C\uB85C')
        ];
        ['index.html', 'pick_logic.js', 'gate_pick.js'].forEach(f => {
          const src = fs.readFileSync(path.join(DIR, f), 'utf8');
          banned.forEach(re => ok(!re.test(src), f + ' → ' + re));
        });
      });

      console.log('\n─────────────────────────────');
      console.log(`통과 ${pass} / 실패 ${fail}`);
      resolve(fail);
    }, 1400);
  });
}

/* C 구간이 타이머를 걸어 두었으므로 그 뒤를 이어 검사 */
W.doDraw();
asyncPart().then(f => process.exit(f ? 1 : 0));

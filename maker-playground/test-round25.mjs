/* Round 25 — Product Bible & V1 Roadmap 문서 검증 (코드 무변경 라운드) */
import fs from 'fs';

let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) pass++; else { fail++; console.log('  ✗', name, note || ''); } };
const read = (f) => fs.readFileSync('docs/' + f, 'utf8');

/* 1. 산출물 6종 존재 (§20) */
const FILES = ['PRODUCT_BIBLE.md','V1_ROADMAP.md','RELEASE_STRATEGY.md','PRIORITY_MATRIX.md','DEVELOPMENT_GUIDE.md','ARCHITECTURE_SUMMARY.md'];
for (const f of FILES) T('exists ' + f, fs.existsSync('docs/' + f));

const bible = read('PRODUCT_BIBLE.md');

/* 2. Bible §0~§21 전 섹션 존재 */
for (let i = 0; i <= 21; i++) T('bible §' + i, new RegExp('## §' + i + '\\.').test(bible));

/* 3. §0 삭제·보류·필수 3분류 실재 */
T('must-have 표', /반드시 만든다 \(V1\)/.test(bible));
T('defer 목록', /미룬다 \(V1\.1 이후/.test(bible));
T('delete 목록', /삭제하거나 명시적으로 안 만든다/.test(bible));
T('삭제 원칙 명문화', /노출을 미룬다/.test(bible));

/* 4. 원칙 6종 — 전부 강제 엔진 명기 (거부 코드 없는 원칙 금지) */
for (const p of ['Simple First','AI Native','Touch First','Flow First','Creator First','Platform First'])
  T('principle ' + p, bible.includes(p));
T('원칙별 강제 엔진', (bible.match(/(가|이) 강제\)/g) || []).length >= 6);

/* 5. MVP 한 문장 정의 + 노출 화면 6종 */
T('MVP 문장', /템플릿을 고르고.*PPTX로 내려받고.*그대로 있는 것/.test(bible));
T('MVP 화면 6종', /Home·Library·Editor·AI\(Dock\)·Brand·Export/.test(bible));

/* 6. 성능 — 실측/미실측 분리 원칙 */
T('실측 수치 인용', bible.includes('108ms') && bible.includes('16.6ms') && bible.includes('19ms'));
T('미실측 정직 표기', (bible.match(/미실측/g) || []).length >= 3);

/* 7. 로드맵 — 완료 조건 기반 + 이월 부채 대장 */
const rm = read('V1_ROADMAP.md');
T('완료 조건 방식 선언', /날짜가 아니라.*완료 조건/.test(rm));
for (const ph of ['Phase A','Phase B','Phase C','Phase D','Phase E','Phase F']) T('roadmap ' + ph, rm.includes(ph));
for (const debt of ['PDF 한글','터치 재배선','Flow 재배선','playground.css','tree\\(\\) O\\(N×U\\)'])
  T('debt ' + debt, new RegExp(debt).test(rm));

/* 8. 매트릭스 — 판정 코드 5종 전부 사용 + 주요 엔진 판정 존재 */
const pm = read('PRIORITY_MATRIX.md');
for (const c of ['✅','🔵','🟡','🟠','⚫']) T('matrix code ' + c, pm.includes(c));
for (const e of ['MK_RENDER','MK_AGENT','MK_DAM','MK_COLLAB','MK_MARKET','MK_ADMIN','MK_API','MK_DLS','MK_TOUCH','MK_FLOW'])
  T('matrix ' + e, pm.includes(e));
T('STT 삭제 판정', /음성 STT.*⚫/.test(pm.replace(/\n/g, ' ')) || /STT[^\n]*\|[^\n]*⚫/.test(pm));

/* 9. 릴리즈 — 단계별 진입·졸업 조건 표 */
const rs = read('RELEASE_STRATEGY.md');
for (const s of ['Alpha','Closed Beta','Open Beta','V1','V1.1','V2']) T('release ' + s, rs.includes(s));
T('졸업 조건 열', rs.includes('졸업 조건'));
T('실패 프로토콜', rs.includes('실패 프로토콜'));

/* 10. 개발 가이드 — 불변식·매핑 규약 */
const dg = read('DEVELOPMENT_GUIDE.md');
for (const k of ['_tick', 'MK_HIST', 'registerAdapter', 'RLS', '{action,args,explain}', '정직 보고'])
  T('guide ' + k, dg.includes(k));
T('번호 매핑 현행', dg.includes('GPT Round N = 정본 §1.(N+20)'));

/* 11. 아키텍처 — 단일 진입점 표 + 정직 지도 */
const ar = read('ARCHITECTURE_SUMMARY.md');
T('단일 진입점 표', ar.includes('유일한 경로'));
T('정직 지도', ar.includes('실동작 / 시뮬 경계'));
T('전 엔진 14종 등장', ['MK_CAT','MK_AIED','MK_BRAND','MK_TEAM','MK_COLLAB','MK_DAM','MK_RENDER','MK_PLUGIN','MK_MARKET','MK_ADMIN','MK_API','MK_TOUCH','MK_AGENT','MK_FLOW','MK_DLS'].every((e) => ar.includes(e)));

/* 12. 완료 조건(§21) — 네 질문 자기 답변 참조 정합 */
T('네 질문 구조', /① 무엇을 먼저 만드나.*② 어떤 기준으로 판단하나.*③ 무엇을 만들면 안 되나.*④ 지금 어디까지/.test(bible.replace(/\n/g, ' ')));

console.log(`\nRound25 docs: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);

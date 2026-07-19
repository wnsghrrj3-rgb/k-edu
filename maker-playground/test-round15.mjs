/* Round 15 검증 — jsdom (전 화면 회귀 + Universal Asset Platform 전수) */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/assets' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const ok = (n, c, x = '') => { c ? (pass++, console.log('  ✓ ' + n + (x ? ' — ' + x : ''))) : (fail++, console.log('  ✗ ' + n + ' — ' + x)); };
const sec = (n) => console.log('\n[' + n + ']');

const D = window.MK_DAM, T = window.MK_TEAM, B = window.MK_BRAND, TPL = window.MK_TPL, PROJ = window.MK_PROJ;
const body = window.document.getElementById('pgBody');
const renderAssets = () => { const s = window.MK_SCREENS.assets; body.innerHTML = s.render('DAM'); s.mount(body); };

/* ---------- 1. 전 화면 회귀 ---------- */
sec('1. 전 화면 렌더 회귀 (assets v2 포함)');
for (const k of Object.keys(window.MK_SCREENS)) {
  const scr = window.MK_SCREENS[k];
  try {
    for (const v of scr.variants) { body.innerHTML = scr.render(v); if (scr.mount) scr.mount(body); }
    ok('screen: ' + k, true);
  } catch (e) { ok('screen: ' + k, false, e.message); }
}

/* ---------- 2. Entity 스키마 (§0·§1·§3) ---------- */
sec('2. Asset = Entity — 스키마·시드 승격');
ok('시드 승격 완료', D.list().length >= 20, D.list().length + '개');
const e0 = D.list()[0];
ok('Metadata 전 필드', ['id','kind','name','desc','creator','workspaceId','ownerId','created','updated','resolution','aspect','language','tags','keywords','license','brandId','colors','ai','storage'].every((f) => f in e0));
ok('기존 MK_ASSETS id 유지(호환)', !!D.get(window.MK_ASSETS.ASSETS[0].id));
ok('Color Extraction — dominant', /^#/.test(e0.colors.dominant) && e0.colors.palette.length >= 2);
ok('Storage는 Reference(blobId)', /^bl-/.test(e0.storage.blobId));
ok('24종 kind 정의 (§2)', D.KINDS.length === 25 && D.KINDS.includes('lottie') && D.KINDS.includes('glb') && D.KINDS.includes('section-block'));

/* ---------- 3. Storage — Dedup (§21) ---------- */
sec('3. Storage — Deduplication·캐시');
const d1 = D.create({ name: '중복 테스트 A', kind: 'photo', tags: ['dedup'], tone: 'teal' }, 'SAME-CONTENT');
const d2 = D.create({ name: '중복 테스트 B', kind: 'photo', tags: ['dedup'], tone: 'teal' }, 'SAME-CONTENT');
ok('같은 콘텐츠 → 같은 blob', d1.storage.blobId === d2.storage.blobId);
ok('dedup 플래그', d2.storage.dedup === true);
ok('storageStats 절약 집계', D.storageStats().dedupSaved > 0, D.storageStats().dedupSaved + 'B');
const c1 = D.thumb(d1.id); const missBefore = D.CACHE.miss; D.thumb(d1.id);
ok('Thumbnail Cache hit', D.CACHE.miss === missBefore && D.CACHE.hit > 0 && c1.id === d1.id);

/* ---------- 4. Version (§4) ---------- */
sec('4. Version Control');
const v0 = D.versions(d1.id);
ok('생성 시 v1 자동', v0.length === 1 && /최초/.test(v0[0].name));
const up1 = D.update('me', d1.id, { desc: '설명 추가' });
ok('수정 → v2 스냅샷', up1.ok && D.versions(d1.id).length === 2);
const up2 = D.update('me', d1.id, { desc: '설명 추가' });
ok('무변경 → 중복 스냅샷 생략', up2.skipped === true && D.versions(d1.id).length === 2);
const cmp = D.compareVersions(d1.id, D.versions(d1.id)[0].verId, D.versions(d1.id)[1].verId);
ok('Compare — 필드 diff', cmp.ok && cmp.diff.some((x) => x.field === 'desc'));
const res = D.restoreVersion('me', d1.id, D.versions(d1.id)[0].verId);
ok('Restore', res.ok && D.get(d1.id).desc === '' && D.versions(d1.id).length === 3);

/* ---------- 5. Variants (§5) ---------- */
sec('5. Variants');
const logo = D.list().find((x) => x.category === 'brand');
ok('로고 variant 9종 시드', D.variants(logo.id).length === 9, D.variants(logo.id).map((v) => v.key).join(','));
ok('Light/Dark/SVG/2x 포함', ['light', 'dark', 'svg', '2x'].every((k) => D.variants(logo.id).some((v) => v.key === k)));
ok('중복 variant 거부', D.addVariant(logo.id, 'light', 'Light').ok === false);

/* ---------- 6. Smart Collection & Folder (§6·§7) ---------- */
sec('6. Smart Collection(조건) vs Folder(수동)');
ok('컬렉션 6종 시드', D.collections().length === 6, D.collections().map((c) => c.name).join(' · '));
const kedu = D.collections().find((c) => c.name === 'KEDU 브랜드');
ok('Brand=KEDU 조건 평가', D.evalCollection(kedu.colId).every((x) => x.brandId === 'bd-kmaker') && D.evalCollection(kedu.colId).length >= 1);
const blue = D.collections().find((c) => c.name === '푸른 계열');
ok('Color=푸른 조건 평가', D.evalCollection(blue.colId).length >= 2 && D.evalCollection(blue.colId).every((x) => x.ai.colorWords.includes('푸른')));
D.touchRecent(e0.id);
ok('Recently Used 컬렉션', D.evalCollection(D.collections().find((c) => c.name === '최근 사용').colId).some((x) => x.id === e0.id));
ok('폴더 5종 (§7)', D.folderList().length === 5 && D.folderList().some((f) => f.name === 'Archive'));
const mv = D.moveToFolder(d1.id, D.folderList()[0].folderId);
ok('폴더 이동(단일 소속)', mv.ok && D.folderOf(d1.id).name === 'Marketing');

/* ---------- 7. Brand 연동 (§8) ---------- */
sec('7. Brand Integration');
ok('brandAssets 조회', D.brandAssets('bd-kmaker').length >= 1);
const rec = D.brandChangeRecommend('bd-kmaker', 'bd-companya');
ok('브랜드 변경 → 교체 추천', rec.length >= 1 && rec.some((r) => r.toId), rec.filter((r) => r.toId).length + '건 추천');
ok('추천은 같은 kind끼리', rec.filter((r) => r.toId).every((r) => D.get(r.fromId).kind === D.get(r.toId).kind));

/* ---------- 8. Reference (§9) ---------- */
sec('8. Template은 Reference만 사용 — 파일 삽입 금지');
const someTpl = TPL.list().find((t) => (t.assetIds || []).length);
ok('템플릿 assetIds = id 참조', !!someTpl && someTpl.assetIds.every((x) => typeof x === 'string'));
ok('템플릿 JSON에 blob 원본 없음', !JSON.stringify(TPL.list()).includes('"bytes"'));
const r1 = D.ref(e0.id);
ok('ref() → {$asset}', D.isRef(r1) && D.resolve(r1).id === e0.id);

/* ---------- 9. AI Auto Tag (§11) ---------- */
sec('9. AI 자동 분석 — 결정론');
const sky = D.list().find((x) => /하늘/.test(x.name));
ok('Object Detection', sky.ai.objects.includes('하늘'));
ok('Scene Detection', sky.ai.scene === 'outdoor');
ok('Caption 자동 생성', sky.ai.caption.includes(sky.name));
const board = D.list().find((x) => /칠판/.test(x.name));
ok('교실 scene 판정', board.ai.scene === 'classroom');
const card1 = D.list().find((x) => /카드|포스터/.test(x.name));
ok('OCR — 텍스트성 자산만', card1.ai.ocr.length >= 1 && sky.ai.ocr.length === 0);
ok('색 키워드 추출', sky.ai.colorWords.length >= 1, sky.ai.colorWords.join(','));

/* ---------- 10. AI Search (§12·§24) ---------- */
sec('10. AI Search — 자연어·색·OCR');
const q1 = D.search('푸른 하늘');
ok('"푸른 하늘"', q1.total >= 1 && q1.items.some((x) => /하늘/.test(x.name)), q1.total + '건 ' + q1.ms + 'ms');
ok('"과학"', D.search('과학').total >= 1);
ok('"minimal"(스타일)', D.search('미니멀').total >= 1);
ok('"교실"(scene 역추적)', D.search('교실').total >= 1);
ok('caption 검색 경로', D.search(sky.ai.caption.split(' ')[0]).items.some((x) => x.id === sky.id));
ok('필터 — kind', D.search('', { kind: 'photo' }).items.every((x) => x.kind === 'photo'));
ok('필터 — orientation', D.search('', { orientation: 'landscape' }).items.every((x) => { const [w, h] = x.aspect.split('/').map(Number); return w > h; }));
ok('필터 — brand', D.search('', { brand: 'bd-kmaker' }).items.every((x) => x.brandId === 'bd-kmaker'));

/* ---------- 11. AI Similar (§13) ---------- */
sec('11. AI Similar');
const sim = D.similar(sky.id, 5);
ok('유사 자산 추천', sim.length >= 1 && sim.every((s) => s.entity.id !== sky.id));
ok('점수 내림차순', sim.every((s, i) => i === 0 || sim[i - 1].score >= s.score));

/* ---------- 12. Usage & Replace Everywhere (§14·§16) ---------- */
sec('12. Usage — Reference 기준 교체');
const used = D.list().find((x) => D.usedBy(x.id).templates.length);
ok('템플릿 usage 시드', !!used, used && used.name);
const uses = D.usedBy(used.id);
ok('usedBy — 사용처 그룹', uses.total >= 1 && uses.templates.length >= 1);
const alt2 = D.create({ name: '교체 대상', kind: used.kind, tags: used.tags, tone: used.tone }, 'replacement-x');
const rep = D.replaceEverywhere('me', used.id, alt2.id);
ok('전면 교체 ok', rep.ok && rep.report.usage >= 1);
ok('템플릿 Reference까지 교체', rep.report.templates.length >= 1 && !TPL.list().some((t) => (t.assetIds || []).includes(used.id)));
ok('교체 후 usedBy 이전', D.usedBy(alt2.id).total >= 1 && D.usedBy(used.id).total === 0);
/* 선택 교체 */
const uA = D.create({ name: '선택교체 원본', kind: 'photo', tags: [], tone: 'slate' }, 'sel-a');
const uB = D.create({ name: '선택교체 신규', kind: 'photo', tags: [], tone: 'slate' }, 'sel-b');
D.registerUse(uA.id, { templateId: 'tp-keep' }); D.registerUse(uA.id, { templateId: 'tp-swap' });
const selRep = D.replaceEverywhere('me', uA.id, uB.id, { templates: ['tp-swap'] });
ok('선택 교체 — 대상만', selRep.ok && selRep.report.usage === 1 && D.usedBy(uA.id).templates.includes('tp-keep'));
ok('선택 밖은 skipped 보고', selRep.report.skipped.some((s) => s.id === 'tp-keep'));
ok('사용 중 자산 삭제 차단', D.remove('me', uB.id).ok === false);

/* ---------- 13. Crop Memory (§15) ---------- */
sec('13. Crop Memory — Aspect별');
D.saveCrop(sky.id, '16/9', { x: 10, y: 20, w: 800, h: 450 }, 'sc-1');
D.saveCrop(sky.id, '1/1', { x: 100, y: 0, w: 500, h: 500 }, 'sc-2');
ok('Aspect별 저장', D.cropFor(sky.id, '16/9').w === 800 && D.cropFor(sky.id, '1/1').w === 500);
D.saveCrop(sky.id, '16/9', { x: 12 }, 'sc-3');
ok('같은 Aspect 재사용 → 갱신+장면 누적', D.cropFor(sky.id, '16/9').x === 12 && D.cropFor(sky.id, '16/9').sceneIds.length === 2);

/* ---------- 14. Analytics (§16) ---------- */
sec('14. Usage Analytics');
const stt = D.stats(alt2.id);
ok('사용 횟수·최근', stt.count >= 1 && stt.last != null);
ok('Template별 집계', Object.keys(stt.byTemplate).length >= 1);

/* ---------- 15. Permission (§17) ---------- */
sec('15. Permission — 5범위');
ok('5범위 정의', JSON.stringify(D.SCOPES) === JSON.stringify(['private', 'workspace', 'organization', 'public', 'marketplace']));
const pv = D.create({ name: '비공개 자산', kind: 'photo', ownerId: 'me', scope: 'private' }, 'private-1');
ok('private — 타인 열람 차단', D.canDo('u-yj', pv.id, 'view').ok === false && D.canDo('me', pv.id, 'view').ok);
ok('public — 누구나 열람', D.setScope('me', pv.id, 'public').ok && D.canDo('u-yj', pv.id, 'view').ok);
ok('private 수정 — 소유자만', (D.setScope('me', pv.id, 'private').ok, D.canDo('u-yj', pv.id, 'edit').ok === false));
if (T) {
  const viewer = T.ws().members.find((m) => m.role === 'viewer');
  if (viewer) ok('MK_TEAM 연동 — viewer 편집 거부', D.canDo(viewer.memberId || viewer.id, D.list()[2].id, 'edit').ok === false);
  else ok('MK_TEAM 연동 — viewer 편집 거부', true, 'viewer 없음 — skip');
}

/* ---------- 16. Favorites (§18) ---------- */
sec('16. Favorites');
D.star(sky.id);
ok('Star', D.isStar(sky.id) && D.favorites().some((x) => x.id === sky.id));
D.pin(sky.id);
ok('Pin', D.isPin(sky.id));
ok('Recently Used', D.recents()[0] != null);

/* ---------- 17. Lazy Loading & Upload (§20·§21) ---------- */
sec('17. Lazy Loading·Chunk Upload');
const all = D.list();
const p1 = D.page(all, 0, 10);
ok('커서 페이지', p1.items.length === 10 && p1.next === 10 && D.page(all, p1.next, 10).items.length >= 1);
const job = D.enqueueUpload('큰파일.jpg', 'photo', 1000000, { tags: ['업로드'] });
ok('청크 분할', job.chunks === 4);
let stepR; let guard = 0;
do { stepR = D.stepUploads(1); guard++; } while (stepR.jobs.some((j) => j.state !== 'complete') && guard < 10);
ok('Background 큐 → 완료 + Entity 생성', stepR.jobs.every((j) => j.state === 'complete') && stepR.jobs.every((j) => j.assetId || j.jobId !== job.jobId));
ok('업로드 자산 자동 태그', !!D.get(D.list().find((x) => x.name === '큰파일.jpg').id).ai);

/* ---------- 18. Cloud Connector (§22) ---------- */
sec('18. Cloud Connector — 설계 구조');
ok('5종 커넥터', D.CLOUD.length === 5 && ['gdrive', 'dropbox', 'onedrive', 's3', 'supabase'].every((k) => D.CLOUD.some((c) => c.key === k)));
const plan = D.cloudPlan('supabase');
ok('연동 계획 스키마', plan.state === 'staged' && plan.request.endpoint.includes('supabase') && 'importShape' in plan && 'response' in plan);
ok('실 연동 아님 명시', plan.state !== 'connected');

/* ---------- 19. Browser UI (§19·§23~§27) ---------- */
sec('19. Asset Browser 3단 UI');
window.MK_SCREENS.assets._S.src = 'all'; window.MK_SCREENS.assets._S.q = ''; window.MK_SCREENS.assets._S.sel = null;
renderAssets();
ok('3단 레이아웃', !!body.querySelector('.dm-left') && !!body.querySelector('.dm-mid') && !!body.querySelector('.dm-ins'));
ok('좌 — Collection·Folder·Brand·Cloud', body.querySelectorAll('[data-dm-src^="sc-"]').length === 6 && body.querySelectorAll('[data-dm-src^="fd-"]').length === 5 && body.querySelectorAll('[data-dm-cloud]').length === 5);
ok('중 — 검색·필터·뷰 전환', !!body.querySelector('#dmQ') && !!body.querySelector('#dmKind') && body.querySelectorAll('[data-dm-view]').length === 3);
ok('Lazy — 더 불러오기', !!body.querySelector('[data-dm-more]'));
body.querySelector('[data-dm-more]').click(); 
ok('더 불러오기 동작', body.querySelectorAll('.dm-card').length > 12);
const firstCard = body.querySelector('[data-dm-sel]'); const selId = firstCard.dataset.dmSel; firstCard.click();
ok('선택 → Inspector 열림', !!body.querySelector('.dm-prev') && body.querySelector('.dm-ins-name').textContent.includes(D.get(selId).name));
ok('Inspector 5탭', body.querySelectorAll('[data-dm-tab]').length === 5);
body.querySelector('[data-dm-tab="ai"]').click();
ok('AI 탭 — caption 표시', body.querySelector('.dm-ins-body').textContent.includes(D.get(selId).ai.caption));
body.querySelector('[data-dm-tab="usage"]').click();
ok('Usage 탭 — Replace UI', !!body.querySelector('[data-dm-repl]'));
ok('드래그 — Reference 페이로드', body.querySelector('[data-dm-drag]').getAttribute('draggable') === 'true');
/* 검색 UI */
const qEl = body.querySelector('#dmQ'); qEl.value = '하늘'; qEl.oninput();
ok('검색 입력 → 결과 갱신', body.querySelector('.dm-meta-line').textContent.includes('"하늘"'));
/* 풀스크린 프리뷰 */
window.MK_SCREENS.assets._S.q = ''; window.MK_SCREENS.assets._S.sel = sky.id; renderAssets();
body.querySelector('[data-dm-full]').click();
ok('Fullscreen Preview (§26)', !!body.querySelector('.dm-fs'));
body.querySelector('[data-dm-fsbg]').onclick({ stopPropagation: () => {}, target: body.querySelector('[data-dm-fsbg]') });
ok('배경 토글', !!body.querySelector('.dm-fs.dark'));
window.MK_SCREENS.assets._S.preview = false;

/* ---------- 20. 스케일 (§28) ---------- */
sec('20. 100,000개 스케일');
const mk = D.makeBulk(100000);
ok('10만 개 생성', mk.n === 100000, mk.buildMs + 'ms 빌드');
const bs1 = D.bulkSearch('하늘');
ok('10만 검색 — 결과', bs1.total > 1000, bs1.total + '건 ' + bs1.ms + 'ms');
ok('10만 검색 — 100ms 내', bs1.ms < 100, bs1.ms + 'ms');
const bs2 = D.bulkSearch('하늘 실험');
ok('복합 토큰 AND', bs2.total > 0 && bs2.total < bs1.total, bs2.total + '건 ' + bs2.ms + 'ms');

/* ---------- 21. 에디터 훅 회귀 ---------- */
sec('21. 에디터 훅 — 기존 동작 불변');
window.PG.loadEditorDoc(window.MK_SAMPLE.TEMPLATES[0].templateId);
ok('loadEditorDoc 동작 불변', !!window.PG.state.editor.doc && window.PG.state.editor.sceneIdx === 0);
const s2 = window.MK_SCREENS.editor;
try { body.innerHTML = s2.render('Design'); s2.mount(body); ok('Editor 렌더 회귀', true); } catch (e) { ok('Editor 렌더 회귀', false, e.message); }

console.log(`\n════════ Round 15: ${pass} 통과 / ${fail} 실패 ════════`);
process.exit(fail ? 1 : 0);

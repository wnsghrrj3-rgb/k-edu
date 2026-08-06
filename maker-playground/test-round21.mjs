/* Round 21 — Mobile & Tablet Touch First Editor 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/mobile' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) __ld(f);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const TC = window.MK_TOUCH;
let pass = 0, fail = 0;
const T = (name, cond, note) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name, note || ''); } };
const sec = (n) => console.log('—', n);
const t0 = TC._now();

/* ============ 1. 상수·플랫폼(§0·§1) ============ */
sec('1. 상수·플랫폼');
T('장치 프로필 8종(폴더블 포함)', TC.DEVICES.length === 8 && TC.DEVICES.some((d) => d.unfolded));
T('레이아웃 5종', TC.LAYOUTS.length === 5);
T('제스처 카탈로그 10종', TC.GESTURES.length === 10);
T('최소 타깃 44/48pt', TC.T.HIT_MIN === 44 && TC.T.HIT_MIN_ANDROID === 48);
T('장치 조회', TC.device('ipad-pro').pen === 'apple-pencil' && TC.device('없음') === null);

/* ============ 2. Responsive Layout(§2) ============ */
sec('2. Responsive Layout');
T('desktop 분기', TC.classify(1440, 900) === 'desktop');
T('coarse 포인터 1440 → 태블릿', TC.classify(1440, 900, { pointer: 'coarse' }) === 'tablet-landscape');
T('태블릿 가로/세로', TC.classify(1366, 1024, { pointer: 'coarse' }) === 'tablet-landscape' && TC.classify(744, 1133, { pointer: 'coarse' }) === 'tablet-portrait');
T('폰 가로/세로', TC.classify(852, 393, { pointer: 'coarse' }) === 'phone-landscape' && TC.classify(393, 852, { pointer: 'coarse' }) === 'phone-portrait');
T('폴더블 접힘=폰·펼침=태블릿', TC.classify(344, 882, { pointer: 'coarse' }) === 'phone-portrait' && TC.classify(344, 882, { pointer: 'coarse', fold: 'unfolded', deviceId: 'fold' }).startsWith('tablet'));

/* ============ 3. Adaptive UI(§3·§8~§10) ============ */
sec('3. Adaptive UI');
const uiD = TC.uiFor('desktop'), uiTP = TC.uiFor('tablet-portrait'), uiPP = TC.uiFor('phone-portrait', 'android');
T('데스크톱 = 사이드바·플로팅 없음', uiD.inspector === 'sidebar' && !uiD.floatingToolbar);
T('태블릿 세로 = 바텀시트·플로팅 툴바', uiTP.inspector === 'bottomsheet' && uiTP.floatingToolbar && uiTP.toolbar === 'edge-rail');
T('폰 세로 = 하단 바·풀시트·미니맵 없음', uiPP.toolbar === 'bottom-bar' && uiPP.assetBrowser === 'fullsheet' && !uiPP.minimap);
T('Android 48pt 반영', uiPP.hitTarget === 48 && TC.uiFor('phone-portrait', 'ios').hitTarget === 44);
T('5레이아웃 전부 별도 구성', new Set(TC.LAYOUTS.map((l) => JSON.stringify(TC.uiFor(l)))).size === 5);

/* ============ 4. Gesture FSM(§4) ============ */
sec('4. Gesture FSM');
const log = [];
const R = TC.recognizer({ onGesture: (e) => log.push(e) });
R.down(1, 100, 100, t0); R.up(1, 100, 100, t0 + 80);
T('탭 인식', log.at(-1).g === 'tap');
R.down(1, 102, 101, t0 + 200); R.up(1, 102, 101, t0 + 260);
T('더블탭 — 300ms·30px 창', log.at(-1).g === 'double_tap');
R.down(1, 100, 100, t0 + 2000); R.up(1, 100, 100, t0 + 2080);
T('창 지난 뒤엔 다시 탭', log.at(-1).g === 'tap');
R.down(1, 150, 150, t0 + 5000); R.poll(t0 + 5520); 
T('롱프레스 500ms', log.at(-1).g === 'long_press');
R.up(1, 150, 150, t0 + 5560);
T('롱프레스 후 업 = 탭 아님', log.at(-1).g === 'long_press');
R.down(1, 100, 100, t0 + 8000); R.move(1, 106, 103, t0 + 8050);
T('슬롭 10px 이내 = 드래그 미시작', !log.some((e) => e.g === 'drag_start'));
R.move(1, 140, 120, t0 + 8100);
T('슬롭 초과 → drag_start·move', log.some((e) => e.g === 'drag_start') && log.at(-1).g === 'drag_move');
R.up(1, 145, 122, t0 + 8600);
T('저속 종료 → drag_end', log.at(-1).g === 'drag_end' && log.at(-1).dx === 45);
R.down(1, 300, 300, t0 + 10000); R.move(1, 180, 300, t0 + 10090); const swU = R.up(1, 160, 300, t0 + 10120);
T('고속 → swipe left (v≥0.5)', swU.g === 'swipe' && swU.dir === 'left');
/* 핀치·회전·팬 */
const log2 = []; const R2 = TC.recognizer({ onGesture: (e) => log2.push(e) });
R2.down(1, 200, 300, t0); R2.down(2, 300, 300, t0);
R2.moveMulti([{ pid: 1, x: 160, y: 300 }, { pid: 2, x: 340, y: 300 }], t0 + 80);
const pinch = log2.find((e) => e.g === 'pinch');
T('핀치 스케일 1.8', pinch && pinch.scale === 1.8);
R2.up(1, 160, 300, t0 + 160); R2.up(2, 340, 300, t0 + 160);
const log3 = []; const R3 = TC.recognizer({ onGesture: (e) => log3.push(e) });
R3.down(1, 200, 300, t0); R3.down(2, 300, 300, t0); R3.move(2, 296, 322, t0 + 80);
T('회전 인식(>8°)', log3.some((e) => e.g === 'rotate' && Math.abs(e.deg) > 8));
const log4 = []; const R4 = TC.recognizer({ onGesture: (e) => log4.push(e) });
R4.down(1, 200, 300, t0); R4.down(2, 260, 300, t0);
R4.moveMulti([{ pid: 1, x: 200, y: 260 }, { pid: 2, x: 260, y: 260 }], t0 + 80);
T('2지 팬(스케일·회전 불변 시)', log4.some((e) => e.g === 'two_finger_pan' && e.dy === -40));
const log5 = []; const R5 = TC.recognizer({ onGesture: (e) => log5.push(e) });
R5.down(1, 300, 300, t0); R5.down(2, 340, 300, t0); R5.down(3, 380, 300, t0);
const tri = R5.up(1, 200, 300, t0 + 150);
T('3지 스와이프 ← = undo', tri && tri.g === 'three_finger_swipe' && tri.action === 'undo');

/* 바인딩 */
T('기본 바인딩 — 핀치=줌·롱=컨텍스트', TC.commandFor('pinch') === 'zoom_canvas' && TC.commandFor('long_press') === 'context_menu');
T('방향 바인딩 — 3지 좌=undo·swipe 좌=next_scene', TC.commandFor('three_finger_swipe', 'left') === 'undo' && TC.commandFor('swipe', 'left') === 'next_scene');
const bc = TC.bind('tap', 'undo');
T('명령 충돌 검출', !bc.ok && bc.why === 'command_conflict' && bc.conflictWith === 'three_finger_swipe:left');
T('미지 제스처 거부', !TC.bind('quad_tap', 'x').ok);
T('재바인딩 성공', TC.bind('double_tap', 'fit_zoom').ok && TC.commandFor('double_tap') === 'fit_zoom');
TC.resetBindings();
T('바인딩 리셋', TC.commandFor('double_tap') === 'quick_zoom');

/* ============ 5. Pencil(§5) ============ */
sec('5. Pencil');
const RP = TC.recognizer();
T('압력→굵기 곡선', RP.strokeWidth(0) === 1.6 && RP.strokeWidth(1) === 8 && RP.strokeWidth(0.5) === 4.8);
T('기울기→브러시 각', RP.brushAngle(30, 30) === 45);
T('기울기→음영 폭 클램프', RP.tiltShade(90, 90) === 1 && RP.tiltShade(0, 0) === 0);
RP.down(9, 400, 500, t0, 'pen', { pressure: 0.8 });
const palm = RP.down(10, 420, 560, t0 + 100, 'touch', { area: 600 });
T('팜 리젝션 — 펜 창 내 대면적 터치 거부', palm.rejected && RP.rejected[0].why === 'palm');
const smallTouch = RP.down(11, 50, 50, t0 + 100, 'touch', { area: 80 });
T('소면적 터치는 통과', !smallTouch.rejected);
RP.up(9, 400, 500, t0 + 200); RP.up(11, 50, 50, t0 + 210);
const lateTouch = RP.down(12, 420, 560, t0 + 5000, 'touch', { area: 600 });
T('창 밖 대면적은 통과', !lateTouch.rejected);
const hv = RP.hover(300, 300, t0 + 300, { height: 0.5 });
T('호버 미리보기 이벤트', hv.g === 'pen_hover' && hv.h === 0.5);
T('펜 더블탭 도구 토글', RP.penDoubleTap() === 'eraser' && RP.penDoubleTap() === 'brush');

/* ============ 6. Selection(§6) ============ */
sec('6. Touch Selection');
const rect = { x: 100, y: 100, w: 200, h: 120 };
const hds = TC.handlesFor(rect, 1);
T('핸들 9종(회전 포함)·44pt 이상', hds.length === 9 && hds.every((h) => h.size >= 44) && hds.some((h) => h.k === 'rot'));
T('본문 히트·슬롭 확장', TC.hitTest(rect, 200, 160).part === 'body' && TC.hitTest(rect, 315, 160).hit === true);
T('핸들 우선 히트', TC.hitTest(rect, 300, 220).part === 'handle' && TC.hitTest(rect, 300, 220).handle === 'se');
T('영역 밖 미스', TC.hitTest(rect, 500, 500).hit === false);
const sn = TC.snap({ x: 103, y: 250 }, [{ axis: 'x', at: 100 }, { axis: 'y', at: 300 }]);
T('마그넷 스냅 — 임계 내만', sn.x === 100 && sn.snappedX === 100 && sn.snappedY === null);
T('선택 버블 타입별', TC.bubbleFor('image').includes('배경 제거') && TC.bubbleFor('text').includes('AI 다듬기'));

/* ============ 7. Viewport(§7) ============ */
sec('7. Canvas Navigation');
const vp = TC.viewport(1280, 720);
const z1 = vp.pinchZoom(400, 300, 2);
T('핀치 줌 ×2', z1.scale === 2);
T('초점 고정(화면점 불변)', z1.x === -400 && z1.y === -300);
vp.pinchZoom(400, 300, 100);
T('줌 상한 8× 클램프', vp.V.scale === 8);
T('더블탭 fit', vp.quickZoom('fit').scale === Math.round(Math.min(800 / 1280, 600 / 720) * 100) / 100);
T('더블탭 100%', vp.quickZoom('100').scale === 1);
const zs = vp.quickZoom('selection', { x: 600, y: 300, w: 100, h: 100 });
T('선택 줌', zs.scale === 4.8);
T('캔버스 회전 90° 스냅', vp.rotateCanvas(85) === 90 && vp.rotateCanvas(90) === 180);
vp.resetView();
T('뷰 리셋', vp.V.scale === 1 && vp.V.rotation === 0);
const mm = vp.minimap();
T('미니맵 투영', mm.k === 0.13 && mm.viewRect.w > 0);

/* ============ 8. Toolbar·Menu·Sheet(§8~§10) ============ */
sec('8. Toolbar·ContextMenu·BottomSheet');
T('플로팅 툴바 타입별 전환', TC.toolbarFor('text').items.includes('글꼴') && TC.toolbarFor('image').items.includes('배경 제거') && TC.toolbarFor(null).kind === 'canvas');
const cm = TC.contextMenuFor('shape');
T('컨텍스트 메뉴 — 대형 타깃', cm.large && cm.hitTarget >= 44 && cm.items.length === TC.bubbleFor('shape').length);
const sh = TC.sheet();
T('시트 초기 collapsed', sh.S.state === 'collapsed');
T('expand 단계 상승', sh.expand().state === 'peek' && sh.expand().state === 'half' && sh.expand().state === 'full');
T('full 서 expand 고정', sh.expand().state === 'full');
T('드래그 0.47 → half 스냅', sh.dragTo(0.47).state === 'half');
T('드래그 0.05 → collapsed 스냅', sh.dragTo(0.05).state === 'collapsed');
T('미지 상태 거부', !sh.to('hidden').ok);

/* ============ 9. Asset Browser(§11) ============ */
sec('9. Mobile Asset Browser');
const D = window.MK_DAM;
const abAll = TC.assetBrowse('');
T('DAM 브리지 목록', abAll.total > 0);
const anyA = D.list()[0];
TC.assetOpen(anyA.id);
T('최근 항목 기록', TC.assetRecent()[0].id === anyA.id);
T('즐겨찾기 토글', TC.assetFav(anyA.id) === true && TC.assetBrowse('', { favorites: true }).total === 1 && TC.assetFav(anyA.id) === false);
const ai1 = TC.assetAiSearch('따뜻한 사진 찾아줘');
T('AI 검색 의도 추출', ai1.intent.tone === 'warm' && ai1.intent.kind === 'photo');

/* ============ 10. Voice(§12·§13) ============ */
sec('10. Voice');
T('추가 파스 — 색·도형', (() => { const p = TC.voiceParse('빨간 원 추가해줘'); return p.intent === 'add' && p.shape === 'circle' && p.color === '#E5484D'; })());
T('undo/redo 파스', TC.voiceParse('실행 취소').intent === 'undo' && TC.voiceParse('다시 실행해').intent === 'redo');
T('크기 파스', (() => { const p = TC.voiceParse('제목 크게'); return p.intent === 'resize_text' && p.dir === 'up'; })());
T('배경 파스', (() => { const p = TC.voiceParse('배경을 파란색으로 바꿔'); return p.intent === 'background' && p.color === '#3E63DD'; })());
T('내보내기 파스 포맷', TC.voiceParse('PDF로 내보내 줘').format === 'pdf');
T('검색 파스', TC.voiceParse('하늘 검색해줘').q === '하늘');
T('미지 명령', TC.voiceParse('무야호').intent === 'unknown');
const ses = TC.editorSession({ title: 'T', scenes: [{ id: 's1', elements: [{ id: 'tx1', type: 'text', text: '제목', size: 24, x: 0, y: 0, w: 100, h: 40 }] }, { id: 's2', elements: [] }] });
const ve1 = TC.voiceExec(ses, '빨간 원 추가해줘');
T('음성 실행 — 요소 추가', ve1.ok && ses.scene().elements.length === 2 && ve1.el.fill === '#E5484D');
const ve2 = TC.voiceExec(ses, '제목 크게');
T('음성 실행 — 텍스트 32pt', ve2.ok && ve2.size === 32);
T('음성 실행 — 실행 취소', TC.voiceExec(ses, '실행 취소').ok && ses.scene().elements.find((e) => e.id === 'tx1').size === 24);
T('음성 실행 — 장면 이동', TC.voiceExec(ses, '다음 장면').idx === 1 && TC.voiceExec(ses, '이전 장면').idx === 0);
T('AI 프롬프트 3모드', TC.aiPrompt('voice', '실행 취소').parsed.intent === 'undo' && TC.aiPrompt('text', 'x').mode === 'text' && TC.aiPrompt('image', 'a1').actions.length === 3);
T('AI 퀵액션 6종', TC.AI_QUICK.length === 6);

/* ============ 11. 편집 세션 undo 스택 ============ */
sec('11. 편집 세션');
const s2 = TC.editorSession(null);
const el = s2.addElement({ type: 'shape' });
s2.select(el.id);
T('추가·선택', s2.scene().elements.length === 1 && s2.E.sel === el.id);
s2.moveSel(30, 20);
T('이동', s2.scene().elements[0].x === 130);
T('undo 2단', s2.undo() && s2.scene().elements[0].x === 100 && s2.undo() && s2.scene().elements.length === 0);
T('redo', s2.redo() && s2.scene().elements.length === 1);
T('빈 스택 undo 거부', (() => { const s3 = TC.editorSession(null); return s3.undo() === false; })());

/* ============ 12. Offline·Sync(§14·§15) ============ */
sec('12. Offline·Sync');
TC.serverPut('docA', { title: '원본', subtitle: '부제' });
TC.cacheProject('docA', TC.serverGet('docA').doc);
TC.cacheAssets(['a1', 'a2', 'a3']);
T('캐시 상태', TC.syncStatus().cachedProjects >= 1 && TC.cachedAsset('a2') && !TC.cachedAsset('zz'));
const online1 = TC.editField('docA', 'title', '즉시 반영');
T('온라인 편집 즉시 동기화', online1.ok && !online1.queued && TC.serverGet('docA').doc.title === '즉시 반영');
TC.setOnline(false);
const off1 = TC.editField('docA', 'title', '오프라인 제목');
const off2 = TC.editField('docA', 'subtitle', '오프라인 부제');
T('오프라인 → 큐 적재 2건', off1.queued && off2.queueLen === 2 && TC.serverGet('docA').doc.title === '즉시 반영');
T('미캐시 문서 편집 거부', !TC.editField('docX', 'a', 1).ok);
TC.setOnline(true);
T('온라인 복귀 → 큐 배출·서버 반영', TC.syncStatus().queued === 0 && TC.serverGet('docA').doc.title === '오프라인 제목' && TC.serverGet('docA').doc.subtitle === '오프라인 부제');
/* 충돌: 캐시 후 서버 선변경 → 오프라인 편집 → 복귀 */
TC.cacheProject('docA', TC.serverGet('docA').doc);
const sd = TC.serverGet('docA').doc; sd.title = '서버측 변경'; TC.serverPut('docA', sd);
TC.setOnline(false);
TC.editField('docA', 'title', '내 변경');
TC.editField('docA', 'subtitle', '부제만 손댐');
TC.setOnline(true);
const cfs = TC._conflicts().filter((c) => !c.resolved);
T('같은 필드만 충돌 검출(1건)', cfs.length === 1 && cfs[0].field === 'title' && cfs[0].remote === '서버측 변경');
T('다른 필드는 그대로 동기화', TC.serverGet('docA').doc.subtitle === '부제만 손댐');
const mg = TC.resolveConflict(cfs[0].id, 'merge');
T('병합 해결 — 서버/내 값 결합', mg.ok && mg.value === '서버측 변경 / 내 변경');
T('해결 후 미해결 0', TC.syncStatus().conflicts === 0);
T('중복 해결 거부', !TC.resolveConflict(cfs[0].id, 'local').ok);
T('미지 전략 거부', (() => { TC.cacheProject('docB', {}); TC.serverPut('docB', { t: 1 }); TC.cacheProject('docB', { t: 1 }); const s = TC.serverGet('docB').doc; s.t = 2; TC.serverPut('docB', s); TC.setOnline(false); TC.editField('docB', 't', 3); TC.setOnline(true); const c = TC._conflicts().find((x) => !x.resolved); const r = TC.resolveConflict(c.id, 'coin_flip'); TC.resolveConflict(c.id, 'remote'); return !r.ok; })());
const asAt = TC.scheduleAutosave(2000);
const saved0 = TC.syncStatus().saved;
TC._tick(1000);
T('디바운스 — 2초 전 미저장', TC.syncStatus().saved === saved0);
TC._tick(1500);
T('2초 경과 → 자동저장 1회', TC.syncStatus().saved === saved0 + 1);

/* ============ 13. Performance·Battery(§16·§23) ============ */
sec('13. Performance·Battery');
TC.setLowPower(false); TC.adaptiveRefresh(80, true);
T('적응 주사율 — 80%·상호작용 = 120Hz', TC._perf.refresh === 120);
T('45% → 60Hz · 15% → 30Hz', TC.adaptiveRefresh(45, true) === 60 && TC.adaptiveRefresh(15, true) === 30);
TC.adaptiveRefresh(80, true);
const f200 = TC.fpsFor(200), f200o = TC.fpsFor(200, { dirtyRegion: true, gpu: true });
T('더티영역+GPU 최적화로 60fps 달성', !f200.ok60 && f200o.ok60);
TC.lazyEnqueue(['i1', 'i2', 'i3', 'i4', 'i5', 'i6']);
const lz = TC.lazyStep(4);
T('지연 로딩 4개씩', lz.loaded.length === 4 && lz.remain === 2);
T('GPU 레이어 승격', TC.promoteGpu(3) >= 3);
const lp = TC.setLowPower(true);
T('절전 — 30Hz·효과 축소', lp.refresh === 30 && lp.effects === 'reduced');
T('절전 시 적응 주사율 30 상한', TC.adaptiveRefresh(90, true) === 30);
TC.setLowPower(false);
T('백그라운드 일시정지', TC.backgroundPause(true) === true && TC.backgroundPause(false) === false);

/* ============ 14. Export·Share(§17) ============ */
sec('14. Export·Share');
const exDoc = { title: 'E', scenes: [{ id: 's1', width: 1280, height: 720, elements: [] }] };
const j1 = TC.quickExport(exDoc, 'png');
T('빠른 내보내기 — MK_RENDER 브리지', j1.state === 'done' && j1.payload && j1.payload.pages === 1);
const cu = TC.cloudUpload(j1.id);
T('클라우드 업로드', cu.ok && !cu.queued);
TC.setOnline(false);
const j2 = TC.quickExport(exDoc, 'pdf');
T('오프라인 내보내기 → 큐 상태', j2.state === 'queued' && TC.cloudUpload(j2.id).queued);
TC.setOnline(true);
T('공유 시트 OS별', TC.shareSheet('ios').includes('AirDrop') && TC.shareSheet('android').includes('Nearby Share'));

/* ============ 15. Camera·Gallery·DnD(§18~§20) ============ */
sec('15. Camera·Gallery·DnD');
const ph = TC.takePhoto({ name: '실험 사진' });
T('촬영 → DAM 자산·오프라인 캐시', ph.ok && D.get(ph.asset.id) && TC.cachedAsset(ph.asset.id));
const sc = TC.scanDocument();
T('문서 스캔 원근 보정 산출', sc.ok && sc.corrected.w > 500 && sc.corrected.h > 700 && sc.enhanced);
T('배경 제거 변형', TC.removeBackground(ph.asset.id).variant === ph.asset.id + '@nobg' && !TC.removeBackground('없음').ok);
T('QR — url·wifi·프로젝트·텍스트', TC.qrScan('https://a.b').type === 'url' && TC.qrScan('WIFI:S:교실;P:1234;').ssid === '교실' && TC.qrScan('mkproj:prj_9').action === 'open_project' && TC.qrScan('안녕').action === 'insert_text' && !TC.qrScan('').ok);
T('갤러리 제공자 3종(클라우드 2)', TC.galleryProviders().length === 3 && TC.galleryProviders().filter((p) => p.cloud).length === 2);
const gi = TC.galleryImport('google');
T('갤러리 가져오기 → DAM', gi.ok && D.get(gi.asset.id) && !TC.galleryImport('flickr').ok);
const dr = TC.dropFiles([{ name: 'a.png', mime: 'image/png', size: 1e5 }, { name: 'b.mp4', mime: 'video/mp4', size: 2e6 }, { name: 'c.exe', mime: 'application/x-exe', size: 1e5 }, { name: 'big.png', mime: 'image/png', size: 9e7 }]);
T('드롭 — mime 분류·거부 2류', dr.ok.length === 2 && dr.rejected.length === 2 && dr.rejected[0].why === 'unsupported_mime' && dr.rejected[1].why === 'too_large');
T('분할 화면 상태', TC.setSplitScreen(true).windows === 2 && TC.setSplitScreen(false).windows === 1);

/* ============ 16. Widget(§21) ============ */
sec('16. Widget');
T('위젯 4종 데이터', ['recent', 'quickCreate', 'aiGenerate', 'favTemplates'].every((k) => TC.widgetData(k).title));
T('빠른 만들기 3항목·AI 딥링크', TC.widgetData('quickCreate').items.length === 3 && TC.widgetData('aiGenerate').deeplink === '#/ai');
T('템플릿 위젯 실데이터', TC.widgetData('favTemplates').items.length > 0);

/* ============ 17. Accessibility(§22) ============ */
sec('17. Accessibility');
T('큰 글씨 — 클램프 1~2', TC.setTextScale(1.5) === 1.5 && TC.scaledFont(16) === 24 && TC.setTextScale(5) === 2);
TC.setTextScale(1);
const hc = TC.setHighContrast(true);
T('고대비 토큰 스왑', hc.on && hc.tokens['--pg-text'] === '#000000' && TC.setHighContrast(false).tokens === null);
const tree = TC.a11yTree({ scenes: [{ name: '표지', elements: [{ type: 'text', text: '제목입니다' }, { type: 'image', alt: '학교 사진' }, { type: 'shape', shape: 'star' }] }] });
T('낭독 트리 — 역할·라벨', tree.length === 4 && tree[0].role === 'group' && tree[1].label === '제목입니다' && tree[2].role === 'image' && tree[2].label === '학교 사진');
T('키보드 내비 순서', TC.keyboardOrder({ scenes: [{ elements: [{ type: 'text' }, { type: 'shape' }] }] }).map((n) => n.tabIndex).join(',') === '1,2');

/* ============ 18. Testing Matrix(§24) ============ */
sec('18. Testing Matrix');
const mtx = TC.testMatrix();
T('16조합+폴더블 펼침 = 17행', mtx.total === 17);
T('전 조합 유효 레이아웃·44pt', mtx.pass);
T('iPad Pro 가로 = tablet-landscape', mtx.rows.find((r) => r.device === 'iPad Pro 12.9' && r.orient === 'landscape').layout === 'tablet-landscape');
T('iPhone 세로 = phone-portrait·시트 사용', (() => { const r = mtx.rows.find((x) => x.device === 'iPhone 15' && x.orient === 'portrait'); return r.layout === 'phone-portrait' && r.sheetUsed; })());
T('폴더블 펼침 = 태블릿 계열', mtx.rows.find((r) => r.orient === 'unfolded').layout.startsWith('tablet'));

/* ============ 19. 화면 8탭 렌더 + 버튼 실연 ============ */
sec('19. 화면');
const body = window.document.body;
const scr = window.MK_SCREENS.mobile;
try {
  for (const tb of ['over', 'editor', 'gesture', 'pen', 'voice', 'off', 'cap', 'sys']) {
    window.eval(`window.__mbtab='${tb}'`);
    body.innerHTML = scr.render(); scr.mount(body);
    const btn = body.querySelector(`[data-mbtab="${tb}"]`); if (btn) { btn.click(); }
  }
  T('8탭 렌더·마운트', true);
} catch (e) { T('8탭 렌더·마운트', false, e.message); }
try {
  body.innerHTML = scr.render(); scr.mount(body);
  body.querySelector('[data-mbtab="gesture"]').click();
  const before = body.innerHTML.length;
  body.querySelector('[data-mb="gPinch"]').click();
  T('제스처 버튼 → 핀치 로그 반영', document.querySelector('.mb-screen').innerHTML.includes('pinch'));
  document.querySelector('[data-mbtab="editor"]').click();
  document.querySelector('[data-mb="addEl"]').click();
  T('에디터 버튼 — 도형 추가 반영', document.querySelector('.mb-screen').innerHTML.includes('추가'));
} catch (e) { T('버튼 실연', false, e.message); }

/* ============ 20. 회귀 훅 — 기존 에디터 불변 ============ */
sec('20. 기존 화면 회귀');
try {
  window.PG.loadEditorDoc(window.MK_SAMPLE.TEMPLATES[0].templateId);
  T('loadEditorDoc 불변', !!window.PG.state.editor.doc && window.PG.state.editor.sceneIdx === 0);
  body.innerHTML = window.MK_SCREENS.editor.render('Design'); window.MK_SCREENS.editor.mount(body);
  T('Desktop Editor 렌더 회귀', true);
} catch (e) { T('Desktop Editor 렌더 회귀', false, e.message); }

console.log(`\n════════ Round 21: ${pass} 통과 / ${fail} 실패 ════════`);
process.exit(fail ? 1 : 0);

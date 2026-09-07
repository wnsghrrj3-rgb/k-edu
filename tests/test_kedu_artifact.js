/* kedu_artifact.js — 「선생님께 보내기」 어댑터 스모크 (2026-09-07)
   jsdom 실부팅: kedu_back 띠 단추가 바뀌는지 · capture→썸네일→KBox.submit 봉투 모양 · 케이박스 밖 무접촉 */
const { JSDOM } = require('jsdom'); const fs = require('fs'); const path = require('path');
const R = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
function boot(url) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.HTMLCanvasElement.prototype.getContext = () => ({ fillRect(){}, drawImage(){} });
  w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,THUMB';
  const OImg = w.Image; w.Image = function(){ const i = w.document.createElement('img'); Object.defineProperty(i,'width',{value:800}); Object.defineProperty(i,'height',{value:600}); setTimeout(()=>i.onload&&i.onload(),0); return i; };
  w.eval(R('kedu_kbox_adapter.js')); w.eval(R('kedu_back.js')); w.eval(R('kedu_artifact.js'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return w;
}
(async () => {
  const CWB = '11111111-1111-4111-8111-111111111111', CWI = '22222222-2222-4222-8222-222222222222';
  /* 1) 케이박스 밖 */
  { const w = boot('https://keduclass.com/maker/'); ok(w.KeduArtifact.active === false, '밖: active 가 true');
    ok(w.KeduArtifact.register({ tool:'kmake', capture: async()=>null }) === false, '밖: register 가 true');
    ok(!w.document.getElementById('kedu-kbox-bar'), '밖: 띠가 생김'); }
  /* 2) 케이박스 안 — 단추 교체 */
  { const w = boot(`https://keduclass.com/maker/?cwb=${CWB}&cwi=${CWI}`);
    let captured = 0; const submitted = [];
    w.KBox.submit = async (r) => { submitted.push(r); return { status:'ok' }; };
    w.getKeduDb = () => null; w.supabase = {};                                    // 저장소 없음 경로
    w.KeduArtifact.register({ tool:'kmake', capture: async()=>{ captured++; return { pages:[PNG, PNG], title:'포스터' }; } });
    await new Promise(r=>setTimeout(r,300));
    const a = w.document.querySelector('#kedu-kbox-bar .kb-done');
    ok(a && a.textContent.indexOf('선생님께 보내기') >= 0, '안: 단추 문구가 안 바뀜');
    a.click(); await new Promise(r=>setTimeout(r,400));
    ok(captured === 1, 'capture 1회 아님: ' + captured);
    ok(submitted.length === 1, 'submit 1회 아님: ' + submitted.length);
    const s = submitted[0] || {};
    ok(s.kind === 'artifact' && s.tool === 'kmake', '봉투 kind/tool 아님');
    ok(s.detail && s.detail.pages === 2 && s.detail.title === '포스터', '봉투 detail pages/title 아님');
    ok(s.detail && typeof s.detail.thumb === 'string' && s.detail.thumb.indexOf('data:image/jpeg') === 0, '썸네일 미동봉');
    ok(s.detail && s.detail.storage === 'skipped' && Array.isArray(s.detail.artifact_paths) && s.detail.artifact_paths.length === 0, '저장소 없음 정직 표기 아님');
    ok(a.textContent.indexOf('보냈어요') >= 0, '보낸 뒤 단추 문구 아님'); }
  /* 3) 만든 것 없음 → 제출 0 */
  { const w = boot(`https://keduclass.com/maker/?cwb=${CWB}&cwi=${CWI}`);
    const submitted = []; w.KBox.submit = async (r) => { submitted.push(r); return { status:'ok' }; }; w.getKeduDb = () => null; w.supabase = {};
    w.KeduArtifact.register({ tool:'kmake', capture: async()=>null });
    await new Promise(r=>setTimeout(r,300)); w.document.querySelector('#kedu-kbox-bar .kb-done').click(); await new Promise(r=>setTimeout(r,300));
    ok(submitted.length === 0, '빈 캡처인데 제출됨');
    ok((w.document.getElementById('kedu-artifact-note')||{}).textContent && w.document.getElementById('kedu-artifact-note').textContent.indexOf('아직') >= 0, '빈 캡처 안내 없음'); }
  /* 4) 케이메이커 배선 파일 — 정적 계약 */
  { const kb = R('maker-playground/data/kbox.js'), idx = R('maker/index.html');
    ok(/KeduArtifact\.register\(\{ tool: 'kmake'/.test(kb), 'kbox.js 등록 문 없음');
    ok(/MK_TPL\.load\(task\)/.test(kb), 'kbox.js task 딥링크 없음');
    ok(idx.indexOf('/kedu_kbox_adapter.js') >= 0 && idx.indexOf('/kedu_artifact.js') >= 0 && idx.indexOf('data/kbox.js') >= 0, 'maker/index.html 스크립트 3종 미탑재');
    const cw = R('classwork/index.html');
    ok(/function pickKmake/.test(cw) && /task=/.test(cw) && /openArtifact/.test(cw) && /createSignedUrl/.test(cw), 'classwork 교사 문(틀 고르기·원본 열기) 없음'); }
  console.log(`kedu_artifact: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();

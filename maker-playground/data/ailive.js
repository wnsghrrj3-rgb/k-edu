/* ============================================================
   MK_AILIVE — R38 이식 3차(입): 실 AI 연결
   정적 사이트라 서버 키가 없다 — 사용자가 자기 Anthropic API 키를
   연결하면(이 기기 브라우저에만 저장) AI 편집 입력창의 미지 명령이
   진짜 Claude 응답으로 이어진다. 키 없으면 기존 규칙 파서·자연어
   타임라인 경로 그대로(무저하). fetch·storage 주입식 — jsdom 검증.
   ============================================================ */
window.MK_AILIVE = (() => {
  'use strict';
  const KEY = 'mkai:key';
  const MODEL = 'claude-sonnet-4-6';
  let backend = null;                          /* {getItem,setItem,removeItem} */
  const store = () => {
    if (backend) return backend;
    try { if (typeof localStorage !== 'undefined') return localStorage; } catch (_) {}
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  };
  const useBackend = (b) => { backend = b; };
  const setKey = (k) => { const v = String(k || '').trim(); if (!v) return false; store().setItem(KEY, v); return true; };
  const getKey = () => { try { return store().getItem(KEY) || null; } catch (_) { return null; } };
  const clearKey = () => { try { store().removeItem(KEY); } catch (_) {} };
  const hasKey = () => !!getKey();

  /* 캔버스 맥락 → 프롬프트 (순수) */
  function contextPrompt(doc, sceneIdx, selEl) {
    const sc = (doc && doc.scenes && doc.scenes[sceneIdx]) || { elements: [] };
    const texts = sc.elements.filter((e) => e.kind === 'text').map((e) => `- ${String(e.text || '').split('\n').join(' / ').slice(0, 120)}`).join('\n');
    const sel = selEl != null && sc.elements[selEl] && sc.elements[selEl].kind === 'text'
      ? String(sc.elements[selEl].text || '').slice(0, 300) : null;
    return {
      system: '너는 케이메이커(한국어 디자인 도구)의 캔버스 편집 AI다. 짧고 실용적으로 한국어로 답한다. 선택된 텍스트를 고쳐 달라는 요청이면 다른 말 없이 교체할 텍스트만 출력한다.',
      context: `현재 장면 ${sceneIdx + 1}${sc.name ? ` "${sc.name}"` : ''}의 텍스트:\n${texts || '(텍스트 없음)'}` + (sel ? `\n\n선택된 텍스트: "${sel}"` : ''),
      selText: sel,
    };
  }

  /* 실호출 — fetchFn 주입 가능(검증), 기본 window.fetch */
  async function ask(prompt, opts) {
    opts = opts || {};
    const key = opts.key || getKey();
    if (!key) return { ok: false, nokey: true, msg: '실 AI가 아직 연결되지 않았어요' };
    const f = opts.fetchFn || (typeof fetch !== 'undefined' ? fetch.bind(window) : null);
    if (!f) return { ok: false, msg: '이 환경에서는 호출할 수 없어요' };
    try {
      const res = await f('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: opts.model || MODEL,
          max_tokens: 700,
          system: opts.system || '',
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      if (data && data.error) return { ok: false, msg: 'AI 오류: ' + (data.error.message || data.error.type || '알 수 없음') };
      const text = ((data && data.content) || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
      if (!text) return { ok: false, msg: 'AI가 빈 응답을 보냈어요' };
      return { ok: true, text };
    } catch (e) {
      return { ok: false, msg: '연결 실패: ' + ((e && e.message) || '네트워크를 확인해 주세요') };
    }
  }

  /* ---------- 판정 — 요청 규격·키 게이트·응답 파싱 (가짜 fetch) ---------- */
  async function liveAudit() {
    const v = [];
    const mem = (() => { let m = {}; return { getItem: (k) => m[k] || null, setItem: (k, x) => { m[k] = x; }, removeItem: (k) => { delete m[k]; } }; })();
    useBackend(mem);
    clearKey();
    if (hasKey()) v.push('초기 키 상태 오염');
    const gate = await ask('안녕', {});
    if (!gate.nokey) v.push('키 게이트 미작동');
    setKey('sk-test-123');
    if (!hasKey()) v.push('키 저장 실패');
    let captured = null;
    const fake = (url, init) => { captured = { url, init }; return Promise.resolve({ json: () => Promise.resolve({ content: [{ type: 'text', text: '응답' }] }) }); };
    const r = await ask('제목 추천', { fetchFn: fake, system: 'S' });
    if (!r.ok || r.text !== '응답') v.push('응답 파싱 실패');
    if (!captured || captured.url !== 'https://api.anthropic.com/v1/messages') v.push('엔드포인트 위반');
    const h = (captured && captured.init.headers) || {};
    if (h['x-api-key'] !== 'sk-test-123' || h['anthropic-version'] !== '2023-06-01' || h['anthropic-dangerous-direct-browser-access'] !== 'true') v.push('헤더 규격 위반');
    const body = captured ? JSON.parse(captured.init.body) : {};
    if (body.model !== MODEL || !body.messages || body.messages[0].content !== '제목 추천' || body.system !== 'S') v.push('본문 규격 위반');
    const err = await ask('x', { fetchFn: () => Promise.resolve({ json: () => Promise.resolve({ error: { message: '권한 없음' } }) }) });
    if (err.ok || !/권한 없음/.test(err.msg)) v.push('오류 전달 실패');
    const cp = contextPrompt({ scenes: [{ name: 'a', elements: [{ kind: 'text', text: '제목' }, { kind: 'shape' }] }] }, 0, 0);
    if (!/제목/.test(cp.context) || cp.selText !== '제목') v.push('맥락 프롬프트 위반');
    clearKey(); useBackend(null);
    return { ok: v.length === 0, violations: v };
  }

  return { MODEL, useBackend, setKey, getKey, clearKey, hasKey, contextPrompt, ask, liveAudit };
})();

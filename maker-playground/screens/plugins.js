/* ============================================================
   화면: Plugins — Store · 설치 관리 · Developer Console  (Round 17)
   ------------------------------------------------------------
   모든 버튼은 MK_PLUGIN 실함수를 부르고 결과(권한 거부·전이 불가·
   버전 후퇴 등)를 그대로 보여준다 — 가짜 성공 없음.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.plugins = (() => {
  const M = () => window.MK, P = () => window.MK_PLUGIN;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'store', cat: 'all', org: 'geumseong', sel: null, msg: null, testReport: null, devSel: null };
  const say = (ok, text) => { st.msg = { ok, text }; };
  const stars = (r) => r ? '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r)) + ` ${r}` : '평가 없음';
  const STATE_KO = { installed: '설치됨', loaded: '로드됨', initialized: '초기화', ready: '준비', running: '실행 중', suspended: '일시정지', unloaded: '언로드', removed: '제거됨' };

  /* ---------- 스토어 ---------- */
  function Store() {
    const items = P().storeList({ org: st.org }).filter((it) => st.cat === 'all' || it.category === st.cat);
    const cats = ['all', ...new Set(P().storeList({ org: st.org }).map((i) => i.category))];
    const chips = cats.map((c) => M().Chip({ label: c === 'all' ? '전체' : c, on: st.cat === c, attrs: `data-pl="cat:${c}"` })).join('');
    const cards = items.map((it) => `
      <div class="pl-card ${it.visibility !== 'public' ? 'pl-private' : ''}">
        <div class="pl-card-top"><span class="pl-ico">${it.icon || '🔌'}</span>
          <div class="pl-name"><b>${esc(it.name)}</b><small>${esc(it.author)}${it.company ? ' · ' + esc(it.company) : ''} · v${esc(it.version)}</small></div>
          ${it.visibility !== 'public' ? `<span class="mk-badge warn">비공개 · ${esc(it.visibility)}</span>` : ''}
        </div>
        <p class="pl-desc">${esc(it.description)}</p>
        <div class="pl-meta"><span>${esc(it.category)}</span><span>${esc(it.license)}</span><span>⬇ ${it.installs}</span><span class="pl-stars">${stars(it.rating)}</span></div>
        <div class="pl-perms">${(it.permissions || []).map((p) => `<span class="pl-perm">${esc(p)}</span>`).join('')}</div>
        <div class="pl-actions">
          ${it.installed
            ? (it.updatable
              ? M().Button({ label: `업데이트 v${it.version}`, kind: 'accent', size: 'sm', attrs: `data-pl="update:${it.id}"` })
              : M().Button({ label: '설치됨', kind: 'ghost', size: 'sm', disabled: true }))
            : M().Button({ label: '설치', size: 'sm', attrs: `data-pl="install:${it.id}"` })}
          ${M().Button({ label: '리뷰 ★5', kind: 'outline', size: 'sm', attrs: `data-pl="review:${it.id}"` })}
        </div>
      </div>`).join('');
    return `<div class="pl-storehead">
        <div class="pl-chips">${chips}</div>
        <label class="pl-org">조직: <select data-pl="org">
          <option value="geumseong" ${st.org === 'geumseong' ? 'selected' : ''}>금성초 (비공개 플러그인 보임)</option>
          <option value="" ${!st.org ? 'selected' : ''}>미소속 (공개만)</option>
        </select></label>
      </div>
      <div class="pl-grid">${cards || '<p>이 카테고리에는 플러그인이 없어요.</p>'}</div>`;
  }

  /* ---------- 설치됨 ---------- */
  function Installed() {
    const list = P().listInstalled();
    if (!list.length) return '<p style="padding:24px">설치된 플러그인이 없어요 — 스토어에서 설치해 보세요.</p>';
    const rows = list.map((it) => {
      const s = it.state;
      const btns = [
        s === 'ready' || s === 'installed' || s === 'loaded' ? M().Button({ label: '실행', size: 'sm', attrs: `data-pl="run:${it.id}"` }) : '',
        s === 'running' ? M().Button({ label: '일시정지', kind: 'secondary', size: 'sm', attrs: `data-pl="suspend:${it.id}"` }) : '',
        s === 'suspended' ? M().Button({ label: '재개', kind: 'success', size: 'sm', attrs: `data-pl="resume:${it.id}"` }) : '',
        s !== 'unloaded' ? M().Button({ label: '언로드', kind: 'outline', size: 'sm', attrs: `data-pl="unload:${it.id}"` }) : M().Button({ label: '재로드', size: 'sm', attrs: `data-pl="reload:${it.id}"` }),
        it.hasRollback ? M().Button({ label: '롤백', kind: 'outline', size: 'sm', attrs: `data-pl="rollback:${it.id}"` }) : '',
        M().Button({ label: '제거', kind: 'danger', size: 'sm', attrs: `data-pl="remove:${it.id}"` }),
      ].join('');
      const perms = P().PERMS.map((p) => `<label class="pl-permtog ${it.permissions.includes(p) ? 'on' : ''}">
        <input type="checkbox" data-pl="perm:${it.id}:${p}" ${it.permissions.includes(p) ? 'checked' : ''}>${p}</label>`).join('');
      return `<div class="pl-inst ${st.sel === it.id ? 'on' : ''}" data-plsel="${it.id}">
        <div class="pl-inst-head"><span class="pl-ico">${it.icon || '🔌'}</span>
          <b>${esc(it.name)}</b><small>v${esc(it.version)}</small>
          <span class="pl-state pl-state-${s}">${STATE_KO[s] || s}</span>
          ${it.crash ? `<span class="mk-badge danger">크래시 ${it.crash}</span>` : ''}
          <span class="grow"></span>${btns}</div>
        <div class="pl-inst-body">
          <div class="pl-permrow"><small>권한</small>${perms}</div>
          <small class="pl-instmeta">UI 기여 ${it.contribs} · 메모리 ${(it.memoryBytes / 1024).toFixed(1)}KB / ${(P().MEM_LIMIT / 1024)}KB</small>
        </div></div>`;
    }).join('');
    const cmds = P().commandList().map((c) => `<button class="pl-cmd" data-pl="exec:${esc(c.id)}"><b>${esc(c.title)}</b><small>${esc(c.id)} · ${esc(c.plugin)}</small></button>`).join('');
    const keys = P().shortcutList().map((k) => `<span class="pl-key">${esc(k.combo)} → ${esc(k.commandId)}</span>`).join('');
    return `${rows}
      <h3 class="pl-h3">등록된 명령 (누르면 실행 — Editor 문서에 적용)</h3>
      <div class="pl-cmds">${cmds || '없음'}</div>
      <h3 class="pl-h3">단축키</h3><div class="pl-keys">${keys || '없음'}</div>`;
  }

  /* ---------- 개발자 ---------- */
  function Developer() {
    const list = P().listInstalled();
    const sel = st.devSel && list.find((i) => i.id === st.devSel) ? st.devSel : (list[0] && list[0].id);
    let con = null; try { con = sel ? P().console(sel) : null; } catch { con = null; }
    const opts = list.map((i) => `<option value="${esc(i.id)}" ${i.id === sel ? 'selected' : ''}>${esc(i.name)}</option>`).join('');
    const report = st.testReport ? `<div class="pl-report ${st.testReport.ok ? 'ok' : 'no'}">
        <b>Test Harness — ${st.testReport.ok ? '전 단계 통과' : '실패 있음'}</b>
        ${st.testReport.steps.map((s) => `<div class="pl-step ${s.ok ? 'ok' : 'no'}">${s.ok ? '✓' : '✗'} ${esc(s.name)}${s.error ? ' — ' + esc(s.error) : ''}</div>`).join('')}
      </div>` : '';
    return `<div class="pl-dev">
      <section class="pl-devcol">
        <h3 class="pl-h3">Developer SDK</h3>
        <p class="pl-desc">Starter Template — 이 코드가 플러그인의 전부다. Core는 안 만진다.</p>
        <pre class="pl-code">${esc(P().sdk.starterTemplate())}</pre>
        <div class="pl-actions">
          ${M().Button({ label: 'Manifest 생성', size: 'sm', attrs: 'data-pl="genmanifest"' })}
          ${M().Button({ label: 'Starter 플러그인 즉석 테스트', kind: 'accent', size: 'sm', attrs: 'data-pl="runtest"' })}
        </div>
        ${st.genManifest ? `<pre class="pl-code">${esc(JSON.stringify(st.genManifest, null, 2))}</pre>` : ''}
        ${report}
      </section>
      <section class="pl-devcol">
        <h3 class="pl-h3">Developer Console <select data-pl="devsel">${opts}</select></h3>
        ${con ? `
        <div class="pl-constats">
          <span>상태 <b>${STATE_KO[con.state] || con.state}</b></span>
          <span>API 호출 <b>${con.perf.calls}</b></span>
          <span>평균 <b>${con.perf.avgMs}ms</b></span>
          <span>메모리 <b>${(con.memoryBytes / 1024).toFixed(1)}KB</b></span>
          <span>크래시 <b>${con.crash}</b></span>
        </div>
        <small class="ed-zone-cap">API 호출 내역</small>
        <div class="pl-apicalls">${Object.entries(con.apiCalls).map(([k, v]) => `<span>${esc(k)} <b>×${v}</b></span>`).join('') || '<span>아직 없음</span>'}</div>
        <small class="ed-zone-cap">로그</small>
        <div class="pl-log">${con.logs.slice(-14).map((l) => `<div>${new Date(l.at).toLocaleTimeString()} · ${esc(l.msg)}</div>`).join('') || '없음'}</div>
        <small class="ed-zone-cap">오류</small>
        <div class="pl-log pl-err">${con.errors.slice(-8).map((l) => `<div>${esc(l.msg)}</div>`).join('') || '없음'}</div>` : '<p>설치된 플러그인이 없어요.</p>'}
      </section>
    </div>`;
  }

  function render() {
    const tabs = [['store', '🛍 스토어'], ['installed', '🔌 설치됨'], ['dev', '🛠 개발자']]
      .map(([k, n]) => `<button class="mk-tab ${st.tab === k ? 'on' : ''}" data-pl="tab:${k}">${n}</button>`).join('');
    const upd = P().checkUpdates();
    return `<div class="pl-wrap">
      <div class="pl-head">
        <div class="mk-tabs" style="max-width:340px">${tabs}</div>
        ${upd.length ? `<span class="mk-badge warn">업데이트 ${upd.length}건</span>` : ''}
        ${st.msg ? `<span class="pl-msg ${st.msg.ok ? 'ok' : 'no'}">${esc(st.msg.text)}</span>` : ''}
      </div>
      ${st.tab === 'store' ? Store() : st.tab === 'installed' ? Installed() : Developer()}
    </div>`;
  }

  function act(cmd) {
    const [op, id, extra] = cmd.split(':');
    const p = P();
    try {
      if (op === 'tab') { st.tab = id; st.msg = null; }
      else if (op === 'cat') st.cat = id;
      else if (op === 'install') { const r = p.installFromStore(id); say(r.ok, r.ok ? `${id} 설치 + 실행` : r.errors.join(', ')); }
      else if (op === 'update') { const r = p.updateFromStore(id); say(r.ok, r.ok ? `${id} → v${r.version}` : r.errors.join(', ')); }
      else if (op === 'review') { const r = p.addReview(id, 5, '만족'); say(true, `리뷰 등록 — 평점 ${r}`); }
      else if (op === 'run') { p.start(id); say(true, `${id} 실행`); }
      else if (op === 'suspend') { p.suspend(id); say(true, `${id} 일시정지`); }
      else if (op === 'resume') { p.resume(id); say(true, `${id} 재개`); }
      else if (op === 'unload') { p.unload(id); say(true, `${id} 언로드 — 명령·단축키·UI 자동 정리`); }
      else if (op === 'reload') { p.load(id); p.initialize(id); p.run(id); say(true, `${id} 재로드`); }
      else if (op === 'rollback') { const r = p.rollback(id); say(r.ok, r.ok ? `${id} 롤백 → v${r.version}` : r.errors.join(', ')); }
      else if (op === 'remove') { p.remove(id); say(true, `${id} 제거`); }
      else if (op === 'perm') { const has = p.hasPerm(id, extra); (has ? p.revoke : p.grant)(id, extra); say(true, `${id} 권한 ${extra} ${has ? '회수' : '승인'}`); }
      else if (op === 'exec') {
        const cid = cmd.slice(5);
        if (!window.PG.state.editor.doc) window.PG.loadEditorDoc();       /* 문서 없으면 샘플 열기 */
        const out = p.execCommand(cid);
        say(true, `${cid} 실행 완료${out != null && typeof out !== 'object' ? ' → ' + out : ''} — Editor 에서 확인`);
      }
      else if (op === 'genmanifest') st.genManifest = p.sdk.genManifest({ id: 'my-first', name: '나의 첫 플러그인', author: '준호' });
      else if (op === 'runtest') {
        const mf = p.sdk.genManifest({ id: 'starter-test', name: 'Starter', permissions: ['canvas'] });
        st.testReport = p.sdk.runTest(mf, (api) => {
          api.commands.register({ id: 'starter.hello', title: '인사', run: () => api.element.create({ kind: 'text', x: 10, y: 10, w: 60, size: 5, text: '안녕!' }) });
          return {};
        }, JSON.parse(JSON.stringify(window.MK_SAMPLE.TEMPLATES[0])));
      }
    } catch (e) { say(false, e.message); }
    window.PG.render();
  }

  return {
    title: 'Plugins', variants: ['Platform'], flush: true,
    render: () => render(),
    mount(root) {
      root.querySelectorAll('[data-pl]').forEach((el) => {
        const cmd = el.dataset.pl;
        if (el.tagName === 'SELECT') {
          el.onchange = () => {
            if (cmd === 'org') { st.org = el.value; window.PG.render(); }
            else if (cmd === 'devsel') { st.devSel = el.value; window.PG.render(); }
          };
        } else el.onclick = () => act(cmd);
      });
    },
  };
})();

/* ============================================================
   화면: Market — Creator Marketplace  (Round 18)
   ------------------------------------------------------------
   탐색 / 상세 / 크리에이터 / 대시보드 / 운영 5탭.
   모든 버튼은 MK_MARKET 실함수를 부르고 실패 메시지(구매 필요·
   쿠폰 소진·불법 전이 등)를 그대로 보여준다 — 가짜 성공 없음.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.market = (() => {
  const M = () => window.MK, X = () => window.MK_MARKET;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'browse', q: '', type: 'all', price: 'all', sort: 'popularity',
    org: 'geumseong', user: 'u-t1', sel: null, cr: 'cr-junho', msg: null, invoice: null };
  const say = (ok, text) => { st.msg = { ok, text }; };
  const won = (n) => '₩' + Number(n || 0).toLocaleString();
  const stars = (r) => r ? '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r)) + ` ${r}` : '평가 없음';

  const ItemCard = (d) => `
    <div class="pl-card ${d.visibility !== 'public' ? 'pl-private' : ''}" data-mkt="open:${d.id}" style="cursor:pointer">
      <div class="pl-card-top"><span class="pl-ico">${d.icon}</span>
        <div class="pl-name"><b>${esc(d.name)}</b><small>${esc(d.creatorName)} · ${esc(X().TYPE_KO[d.type])}${d.version ? ' · v' + d.version : ''}</small></div>
        ${d.visibility !== 'public' ? '<span class="mk-badge warn">교내 전용</span>' : ''}
      </div>
      <p class="pl-desc">${esc(d.description)}</p>
      <div class="pl-meta"><span>${d.priceModel === 'free' ? '무료' : (d.priceModel === 'subscription' ? won(d.price) + '/월' : won(d.price))}</span>
        <span>⬇ ${d.downloads}</span><span>♥ ${d.likes}</span><span class="pl-stars">${stars(d.rating)}</span></div>
    </div>`;

  /* ---------- 탐색 ---------- */
  function Browse() {
    const org = st.org || undefined;
    const opts = { org, sort: st.sort };
    if (st.type !== 'all') opts.type = st.type;
    if (st.price !== 'all') opts.price = st.price;
    const list = st.q ? X().search(st.q, opts) : X().storeList(opts);
    const types = ['all', ...new Set(X().storeList({ org }).map((d) => d.type))];
    const chips = types.map((t) => M().Chip({ label: t === 'all' ? '전체' : X().TYPE_KO[t], on: st.type === t, attrs: `data-mkt="type:${t}"` })).join('');
    const featured = ["Editor's Choice", 'Trending', 'New'].map((name) => {
      const items = X().collection(name, org);
      if (!items.length) return '';
      return `<div class="mkt-col"><h3>${esc(name)}</h3><div class="mkt-strip">${items.slice(0, 3).map((d) =>
        `<button class="mkt-mini" data-mkt="open:${d.id}">${d.icon} ${esc(d.name)}</button>`).join('')}</div></div>`;
    }).join('');
    return `
      <div class="mkt-head">
        <input class="mkt-search" placeholder="검색 — 예: 수업 자료, 발표, 아이콘" value="${esc(st.q)}" data-mkt="q">
        <select data-mkt="sort">${['popularity', 'downloads', 'updated', 'rating', 'price'].map((s) =>
          `<option value="${s}" ${st.sort === s ? 'selected' : ''}>${{ popularity: '인기순', downloads: '다운로드순', updated: '업데이트순', rating: '평점순', price: '가격순' }[s]}</option>`).join('')}</select>
        <select data-mkt="price">${[['all', '전체'], ['free', '무료'], ['paid', '유료']].map(([v, l]) =>
          `<option value="${v}" ${st.price === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <label class="pl-org">조직: <select data-mkt="org">
          <option value="geumseong" ${st.org === 'geumseong' ? 'selected' : ''}>금성초 (교내 전용 보임)</option>
          <option value="" ${!st.org ? 'selected' : ''}>미소속 (공개만)</option>
        </select></label>
      </div>
      <div class="mkt-featured">${featured}</div>
      <div class="pl-chips" style="margin:10px 0">${chips}</div>
      <div class="pl-grid">${list.map(ItemCard).join('') || '<p>결과가 없어요.</p>'}</div>`;
  }

  /* ---------- 상세 ---------- */
  function Detail() {
    const d = X().detail(st.sel, st.org || undefined);
    if (!d) return '<p style="padding:24px">이 조직에서는 볼 수 없는 상품이에요.</p>';
    const an = X().itemAnalytics(d.id);
    const inst = X().installedOf(st.user).find((i) => i.itemId === d.id);
    const upd = X().checkUpdates(st.user).find((u) => u.itemId === d.id);
    const revs = X().reviewsFor(d.id);
    const sims = X().similar(d.id, 3);
    const co = X().coUsed(d.id, 3);
    const verHist = window.MK_MARKET._items.get(d.id).versions.map((v) =>
      `<li><b>v${v.version}</b> — ${esc(v.changelog)} <small>${v.at.slice(0, 10)}</small></li>`).join('');
    return `
      <button class="mkt-back" data-mkt="back">← 탐색으로</button>
      <div class="mkt-detail">
        <div class="mkt-main">
          <div class="pl-card-top"><span class="pl-ico" style="font-size:34px">${d.icon}</span>
            <div class="pl-name"><b style="font-size:18px">${esc(d.name)}</b>
              <small>${esc(d.creatorName)} · v${d.version} · ${esc(d.license)} 라이선스 · ${esc(d.compatibility)}</small></div></div>
          <p>${esc(d.description)}</p>
          <div class="mkt-shots">${d.screenshots.map((s) => `<div class="mkt-shot">🖼 ${esc(s)}</div>`).join('')}${d.video ? '<div class="mkt-shot">🎬 영상</div>' : ''}</div>
          <div class="mkt-preview">미리보기: ${d.preview ? esc(JSON.stringify(d.preview)) : '없음'}</div>
          <h4>기능</h4><ul>${d.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
          <h4>버전 이력</h4><ul>${verHist}</ul>
          <h4>리뷰 ${revs.length}건 · ${stars(d.rating)}</h4>
          ${revs.map((r) => `<div class="mkt-review"><b>${'★'.repeat(r.stars)}</b> ${esc(r.text)}
            ${r.screenshot ? ' 🖼' : ''} <small>${esc(r.user)} · 도움돼요 ${r.helpful}</small>
            <span class="mkt-rvact"><button data-mkt="helpful:${r.id}">👍</button><button data-mkt="repreview:${r.id}">🚩</button></span>
            ${r.reply ? `<div class="mkt-reply">↳ <b>크리에이터</b> ${esc(r.reply.text)}</div>` : ''}</div>`).join('') || '<p>아직 리뷰가 없어요.</p>'}
          ${M().Button({ label: '리뷰 ★5 남기기', kind: 'outline', size: 'sm', attrs: `data-mkt="review:${d.id}"` })}
        </div>
        <div class="mkt-side">
          <div class="mkt-price">${d.priceModel === 'free' ? '무료' : (d.priceModel === 'subscription' ? won(d.price) + ' /월 구독' : won(d.price))}</div>
          ${d.priceModel !== 'free' ? `<small>교육 ${won(X().priceFor(d, 'education'))} · 조직 ${won(X().priceFor(d, 'enterprise'))}</small>` : ''}
          ${inst
            ? (upd
              ? M().Button({ label: `업데이트 v${upd.to}`, kind: 'accent', attrs: `data-mkt="update:${d.id}"` }) +
                `<div class="mkt-chlog">${upd.changelogs.map(esc).join('<br>')}</div>`
              : M().Button({ label: `설치됨 v${inst.version}`, kind: 'ghost', disabled: true }))
            : (d.priceModel === 'free'
              ? M().Button({ label: '무료 설치', attrs: `data-mkt="install:${d.id}"` })
              : M().Button({ label: '구매 후 설치', kind: 'accent', attrs: `data-mkt="buy:${d.id}"` }))}
          ${inst && inst.prev ? M().Button({ label: `롤백 → v${inst.prev}`, kind: 'outline', size: 'sm', attrs: `data-mkt="rollback:${d.id}"` }) : ''}
          <div class="mkt-couponrow"><input placeholder="쿠폰 코드" value="" data-mkt="coupon"><small>WELCOME30 등</small></div>
          <div class="mkt-social">
            <button data-mkt="like:${d.id}">♥ ${d.likes}</button>
            <button data-mkt="bmk:${d.id}">🔖</button>
            <button data-mkt="share:${d.id}">↗</button>
          </div>
          <div class="mkt-an">조회 ${an.views} · 설치율 ${an.installRate}% · 전환 ${an.conversion}% · 잔존 ${an.retention}%</div>
          <div class="mkt-support">지원: ${esc(d.support)}</div>
          <h4>비슷한 상품</h4>${sims.map((s) => `<button class="mkt-mini" data-mkt="open:${s.id}">${s.icon} ${esc(s.name)}</button>`).join('') || '<small>없음</small>'}
          <h4>함께 사용</h4>${co.map((s) => `<button class="mkt-mini" data-mkt="open:${s.id}">${s.icon} ${esc(s.name)} <small>×${s.coCount}</small></button>`).join('') || '<small>없음</small>'}
        </div>
      </div>`;
  }

  /* ---------- 크리에이터 ---------- */
  function Creator() {
    const c = X().creator(st.cr);
    const items = X().storeList({ creator: st.cr, org: st.org || undefined });
    const rank = X().creatorRanking();
    return `
      <div class="mkt-crhead">
        <span class="pl-ico" style="font-size:40px">${c.avatar}</span>
        <div><b style="font-size:18px">${esc(c.name)}</b> ${c.verified ? '<span class="mk-badge success">✓ 인증</span>' : ''}
          <p>${esc(c.bio)}</p>
          <small>팔로워 ${c.followers} · 팔로잉 ${c.following} · 다운로드 ${c.downloads} · ${stars(c.rating)} · 누적 수익 ${won(c.revenue)}</small></div>
        ${M().Button({ label: '팔로우', size: 'sm', attrs: `data-mkt="follow:${c.id}"` })}
      </div>
      <h4>상품 ${items.length}</h4>
      <div class="pl-grid">${items.map(ItemCard).join('')}</div>
      <h4>크리에이터 랭킹</h4>
      <ol class="mkt-rank">${rank.map((r) => `<li><button data-mkt="cr:${r.id}">${esc(r.name)}</button> ${r.verified ? '✓' : ''} <small>score ${r.score}</small></li>`).join('')}</ol>`;
  }

  /* ---------- 대시보드 ---------- */
  function Dashboard() {
    const d = X().creatorDashboard(st.cr);
    const c = X().creator(st.cr);
    const K = (label, val) => `<div class="mkt-kpi"><small>${label}</small><b>${val}</b></div>`;
    const sets = window.MK_MARKET._settlements.filter((s) => s.creator === st.cr);
    return `
      <div class="mkt-dbhead"><b>${esc(c.name)}</b> 크리에이터 대시보드
        <select data-mkt="crsel">${[...window.MK_MARKET._items.values()].reduce((set, i) => set.add(i.creator), new Set()) &&
          ['cr-junho', 'cr-mint', 'cr-plum', 'cr-dev', 'cr-sol', 'cr-wave'].map((id) =>
          `<option value="${id}" ${st.cr === id ? 'selected' : ''}>${esc((X().creator(id) || {}).name || id)}</option>`).join('')}</select></div>
      <div class="mkt-kpis">
        ${K('업로드', d.uploads)}${K('발행', d.published)}${K('다운로드', d.downloads)}
        ${K('활성 사용자', d.activeUsers)}${K('평점', d.rating)}${K('누적 수익', won(d.revenue))}
        ${K('환불', d.refunds)}${K('댓글', d.comments)}${K('문의', d.inquiries)}
        ${K('업데이트', d.updateStatus.versioned + '/' + d.updateStatus.total)}${K('미정산', won(d.unsettled))}
      </div>
      ${M().Button({ label: '정산 실행', kind: 'accent', size: 'sm', attrs: 'data-mkt="settle"' })}
      ${sets.map((s) => `<div class="mkt-set">정산 ${s.id} — 총 ${won(s.gross)} · 수수료 ${won(s.fee)} · 세금 ${won(s.tax)} · 지급 ${won(s.net)}</div>`).join('')}
      ${st.invoice ? `<pre class="mkt-invoice">${st.invoice.map(esc).join('\n')}</pre>` : ''}`;
  }

  /* ---------- 운영 (Moderation) ---------- */
  function Admin() {
    const mods = window.MK_MARKET._modlog.slice(-6).reverse();
    const reps = window.MK_MARKET._reports;
    const pending = [...window.MK_MARKET._items.values()].filter((i) => i.state === 'review');
    return `
      <h4>심사 대기 ${pending.length}</h4>
      ${pending.map((i) => `<div class="mkt-modrow">${i.icon} ${esc(i.name)}
        ${M().Button({ label: '승인', kind: 'success', size: 'sm', attrs: `data-mkt="approve:${i.id}"` })}
        ${M().Button({ label: '반려', kind: 'outline', size: 'sm', attrs: `data-mkt="reject:${i.id}"` })}</div>`).join('') || '<p>대기 없음</p>'}
      <h4>자동 심사 로그</h4>
      ${mods.map((m) => `<div class="mkt-modrow"><b>${esc(m.itemId)}</b> — 보안 ${m.checks.security.length}건 ·
        정책 ${m.checks.policy.length}건 · AI 점수 ${m.ai.score} <small>${m.ai.notes.map(esc).join(', ')}</small></div>`).join('')}
      <h4>신고 · 저작권</h4>
      ${reps.map((r) => `<div class="mkt-modrow">[${esc(r.kind)}] ${esc(r.targetId)} — ${esc(r.reason)}
        <span class="mk-badge ${r.status === 'open' ? 'warn' : 'success'}">${esc(r.status)}</span>
        ${r.status === 'open' ? M().Button({ label: '내리기', kind: 'outline', size: 'sm', attrs: `data-mkt="takedown:${r.id}"` }) +
          M().Button({ label: '기각', kind: 'ghost', size: 'sm', attrs: `data-mkt="dismiss:${r.id}"` }) : ''}</div>`).join('') || '<p>접수 없음</p>'}`;
  }

  function render() {
    const TABS = [['browse', '탐색'], ['detail', '상세'], ['creator', '크리에이터'], ['dash', '대시보드'], ['admin', '운영']];
    const body = { browse: Browse, detail: Detail, creator: Creator, dash: Dashboard, admin: Admin }[st.tab]();
    return `<div class="mkt-wrap">
      <div class="mkt-tabs">${TABS.map(([k, l]) => `<button class="mkt-tab ${st.tab === k ? 'on' : ''}" data-mkt="tab:${k}">${l}</button>`).join('')}
        <label class="pl-org" style="margin-left:auto">사용자: <select data-mkt="user">
          ${['u-t1', 'u-t2', 'u-biz'].map((u) => `<option ${st.user === u ? 'selected' : ''}>${u}</option>`).join('')}</select></label></div>
      ${st.msg ? `<div class="mk-toast ${st.msg.ok ? 'ok' : 'err'}" style="position:static;margin:8px 0">${esc(st.msg.text)}</div>` : ''}
      ${body}</div>`;
  }

  function act(cmd, root) {
    const [op, arg] = cmd.split(':');
    st.msg = null;
    try {
      if (op === 'tab') st.tab = arg;
      else if (op === 'open') { st.sel = arg; st.tab = 'detail'; X().track('view', arg, st.user); }
      else if (op === 'back') st.tab = 'browse';
      else if (op === 'cr') { st.cr = arg; st.tab = 'creator'; }
      else if (op === 'install') { const r = X().install(st.user, arg); say(true, `설치 완료 v${r.version} (${r.bridge.kind} 브리지)`); }
      else if (op === 'buy') {
        const code = root ? (root.querySelector('[data-mkt="coupon"]') || {}).value : '';
        const ord = X().purchase(st.user, arg, code ? { coupon: code } : {});
        const r = X().install(st.user, arg);
        say(true, `구매 ${won(ord.paid)}${ord.discount ? ` (할인 ${won(ord.discount)})` : ''} → 설치 v${r.version}`);
      }
      else if (op === 'update') { const r = X().updateInstall(st.user, arg); say(r.ok, r.ok ? `업데이트 → v${r.version}` : r.reason); }
      else if (op === 'rollback') { const r = X().rollbackInstall(st.user, arg); say(true, `롤백 ${r.from} → ${r.to}`); }
      else if (op === 'review') { X().addReview(arg, { user: st.user, stars: 5, text: '화면에서 남긴 리뷰' }); say(true, '리뷰 등록'); }
      else if (op === 'helpful') { X().helpful(arg, st.user); say(true, '도움돼요 반영'); }
      else if (op === 'repreview') { X().reportReview(arg, st.user, '부적절'); say(true, '리뷰 신고 접수'); }
      else if (op === 'like') X().like(st.user, arg);
      else if (op === 'bmk') { X().bookmark(st.user, arg); say(true, '북마크 저장'); }
      else if (op === 'share') { X().share(st.user, arg); say(true, '공유 링크 복사(시뮬)'); }
      else if (op === 'follow') { X().follow(st.user, arg); say(true, '팔로우'); }
      else if (op === 'settle') { const r = X().settle(st.cr); if (r.ok) { st.invoice = r.invoice; say(true, `정산 완료 — 지급 ${won(r.settlement.net)}`); } else say(false, r.reason); }
      else if (op === 'approve') { X().adminDecide(arg, true); X().publishItem(arg); say(true, '승인·발행'); }
      else if (op === 'reject') { X().adminDecide(arg, false); say(true, '반려'); }
      else if (op === 'takedown') { X().resolveReport(arg, 'takedown'); say(true, '게시 중단 처리'); }
      else if (op === 'dismiss') { X().resolveReport(arg, 'dismiss'); say(true, '기각'); }
    } catch (e) { say(false, e.message); }
    window.PG.render();
  }

  return {
    title: 'Market', variants: ['Marketplace'], flush: true,
    render: () => render(),
    mount(root) {
      root.querySelectorAll('[data-mkt]').forEach((el) => {
        const cmd = el.dataset.mkt;
        if (el.tagName === 'SELECT') {
          el.onchange = () => {
            const v = el.value;
            if (cmd === 'org') st.org = v;
            else if (cmd === 'user') st.user = v;
            else if (cmd === 'sort') st.sort = v;
            else if (cmd === 'price') st.price = v;
            else if (cmd === 'crsel') st.cr = v;
            window.PG.render();
          };
        } else if (cmd === 'q') {
          el.onkeydown = (e) => { if (e.key === 'Enter') { st.q = el.value; window.PG.render(); } };
        } else if (cmd === 'coupon') { /* buy 에서 읽음 */ }
        else el.onclick = () => act(cmd, root);
      });
      root.querySelectorAll('[data-mkt^="type:"]').forEach((el) => {
        el.onclick = () => { st.type = el.dataset.mkt.split(':')[1]; window.PG.render(); };
      });
    },
  };
})();

/* klab3-ui.js — 토스트 · 예측 카드 헬퍼 (klab3-ui.css 클래스 사용) */

export function makeToast() {
  const el = document.createElement('div');
  el.className = 'k3-toast hide';
  document.body.appendChild(el);
  let timer = null;
  return function toast(msg, warn, ms) {
    el.innerHTML = msg;
    el.classList.toggle('warn', !!warn);
    el.classList.remove('hide');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.add('hide'), ms || 3400);
  };
}

/* 예측 카드: showPredict('질문', [{id,label},...]) → Promise<선택 id>
   결과 카드: showCard(html, [{label,cls,value}]) → Promise<value> */
export function makeCards() {
  const el = document.createElement('div');
  el.className = 'k3-card hide';
  document.body.appendChild(el);

  function showPredict(question, options, bottom) {
    el.style.bottom = bottom || '120px'; el.style.top = '';
    return new Promise(res => {
      el.innerHTML = `<h3>🔮 ${question}</h3><div class="opts"></div>`;
      const box = el.querySelector('.opts');
      options.forEach(o => {
        const b = document.createElement('button');
        b.textContent = o.label;
        b.addEventListener('click', () => { el.classList.add('hide'); res(o.id); });
        box.appendChild(b);
      });
      el.classList.remove('hide');
    });
  }
  function showCard(html, buttons, center) {
    if (center) { el.style.bottom = '50%'; }
    return new Promise(res => {
      el.innerHTML = html + '<div class="opts" style="flex-direction:row;margin-top:12px"></div>';
      const box = el.querySelector('.opts');
      (buttons || [{ label: '확인', cls: 'pri', value: true }]).forEach(o => {
        const b = document.createElement('button');
        b.textContent = o.label;
        if (o.cls) b.className = o.cls;
        b.style.flex = '1';
        b.addEventListener('click', () => { el.classList.add('hide'); res(o.value); });
        box.appendChild(b);
      });
      el.classList.remove('hide');
    });
  }
  return { showPredict, showCard, hide: () => el.classList.add('hide') };
}


/* ── v2↔v3 전환 칩 (2026-07-16) — tools3 페이지 상단바에 "클래식 판" 링크 ── */
(function(){try{
  if(typeof window==='undefined'||typeof document==='undefined') return;
  function put(){try{
    var m=(location.pathname||'').match(/tools3\/([a-z0-9_]+)\.html/); if(!m) return;
    var bar=document.querySelector('.k3-topbar'); if(!bar||bar.querySelector('.k3-verswap')) return;
    var a=document.createElement('a');
    a.className='k3-verswap'; a.textContent='🧭 클래식 판';
    a.href='/kedu/teacher/klab.html?tool='+m[1];
    a.style.cssText='margin-left:auto;font-size:11.5px;padding:4px 11px;border-radius:999px;'
      +'border:1px solid rgba(255,255,255,.25);color:rgba(255,255,255,.78);text-decoration:none;'
      +'background:rgba(255,255,255,.07);white-space:nowrap';
    bar.appendChild(a);
  }catch(e){}}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',put);
  else put();
}catch(e){}})();

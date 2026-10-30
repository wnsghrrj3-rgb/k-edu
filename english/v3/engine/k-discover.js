/* ══════════════════════════════════════════════════════════
   K-edu 영어 v3 — KDiscover (bindDiscover) 발견 장치 엔진
   ★승격 기록: Lv2 #10_2 인라인 구현(2026-08-25) → 두 번째 소비처 Lv3 #10_2 가 서는 시점에 엔진으로(규약 Lv3 §8-⑤).
     소비처 없이 엔진을 먼저 만들어 Lv1 내내 안 불린 k-diagnosis.js 전례를 반복하지 않으려고 기다렸다.

   6단계 최소 계약 — 이 파일의 전부다.
     ①모으기(소비처가 카드 탭으로) ②상자 탭 분류 ③정렬 공개 ④「뭐가 보여?」 ⑤규칙 카드(onFound) ⑥오답 시 되돌림
   ★분류는 규칙 지식을 요구하지 않는다(Lv2 = 첫 단어 · Lv3 = 장면). 다 하고 나서야 규칙이 보인다.
   ★엔진은 답을 말하지 않는다 — 색·문구는 전부 소비처가 준다. 형광(hint)은 되돌림 상한 뒤에만.
   ★발견 질문은 진단에 적립하지 않는다(규칙을 모르는 상태 · 되돌림 구조라 first-try 의미론이 다르다).

   사용:
     const D = KDiscover.bind({
       deck:[keys], back:[keys](오답① 때 한 번 얹는 카드), maxBack:2,
       bins:[{id,html}], binOf:k=>binId, cardHTML:k=>html, wrongMsg:k=>html,
       alignHTML:keys=>html, qKeys:[keys](질문 화면 정렬판),
       el:{cur,bins,align,q,qAlign}, sortSlide, qSlide, fbSort, fbQ,
       choices:[{t,ok}], onFound:i=>{}, onReveal:box=>{}, onQReveal:box=>{},
       msg:{sortOk(k,n,N,bin), sortDone(), back(n), backSort(n), hint()}
     });
     D.deck · D.dIdx · D.placed · D.backCount · D.found — 상태(하네스가 읽는다)
   ══════════════════════════════════════════════════════════ */
(function(){
  function fx(n){return typeof window[n]==='function'?window[n]:function(){};}
  function $(id){return document.getElementById(id);}

  function bind(o){
    const S={deck:o.deck.slice(),dIdx:0,placed:{},backCount:0,found:false};
    const maxBack=o.maxBack==null?2:o.maxBack, rowMs=o.rowMs||260, tailMs=o.tailMs||500;
    function clearPlaced(){S.placed={};o.bins.forEach(b=>S.placed[b.id]=[]);}
    clearPlaced();

    /* ②분류 */
    function renderBins(){
      $(o.el.bins).innerHTML=o.bins.map(b=>
        '<div class="dbin" data-b="'+b.id+'">'+b.html
        +'<span class="cnt" id="cnt-'+b.id+'">'+S.placed[b.id].map(()=>'·').join('')+'</span></div>').join('');
      $(o.el.bins).querySelectorAll('.dbin').forEach(el=>el.addEventListener('click',()=>drop(el)));
    }
    function showCard(){
      const cur=$(o.el.cur);
      if(S.dIdx>=S.deck.length){cur.style.display='none';reveal();return;}
      cur.style.display='block';
      cur.innerHTML=o.cardHTML(S.deck[S.dIdx]);
    }
    function drop(el){
      if(S.dIdx>=S.deck.length)return;
      const b=el.dataset.b,k=S.deck[S.dIdx];
      fx('playClick')();
      if(b===o.binOf(k)){
        S.placed[b].push(k);S.dIdx++;
        el.classList.add('got');
        $('cnt-'+b).textContent=S.placed[b].map(()=>'·').join('');
        fx('setFB')(o.fbSort,o.msg.sortOk(k,S.dIdx,S.deck.length,b),true);
        showCard();
      }else{
        /* 틀린 상자는 받지 않는다 — 소리 0(정답 낭독도 오답 낭독도 하지 않는다) */
        el.classList.add('wrong');fx('playWrong')();
        fx('setFB')(o.fbSort,o.wrongMsg(k),false);
        setTimeout(()=>el.classList.remove('wrong'),450);
      }
    }
    /* ③정렬 공개 — 상자 순서대로 줄을 세운다. 색은 입히지 않는다(소비처 CSS 가 흐리기만) */
    function order(){let r=[];o.bins.forEach(b=>{r=r.concat(S.placed[b.id]);});return r;}
    function reveal(){
      const box=$(o.el.align);
      box.innerHTML=o.alignHTML(o.alignOrder?o.alignOrder(S.placed):order());
      box.style.display='inline-block';
      const rows=[...box.querySelectorAll('.arow')];
      rows.forEach((r,i)=>setTimeout(()=>{r.classList.add('in');fx('playClick')();},i*rowMs));
      setTimeout(()=>{
        box.classList.add('dim');
        if(o.onReveal)o.onReveal(box);
        fx('playCorrect')();
        try{if(!answered[o.sortSlide]){answered[o.sortSlide]=true;fx('addScore')(10);}}catch(e){}
        fx('setFB')(o.fbSort,o.msg.sortDone(),true);
      },rows.length*rowMs+tailMs);
    }

    /* ④발견 질문 — 선택지 순서 고정(펼침 ⓐⓑⓒ). 진단 미적립(data-correct·data-concept 없음) */
    const qa=$(o.el.qAlign);
    qa.innerHTML=o.alignHTML(o.qKeys);
    setTimeout(()=>{qa.querySelectorAll('.arow').forEach(r=>r.classList.add('in'));if(o.onQReveal)o.onQReveal(qa);},50);
    $(o.el.q).innerHTML=o.choices.map((c,i)=>'<button class="dch" data-i="'+i+'">'+c.t+'</button>').join('');
    $(o.el.q).querySelectorAll('.dch').forEach(b=>b.addEventListener('click',()=>pick(b,+b.dataset.i)));

    /* ⑥오답 — 정답을 말하지 않는다. 분류로 되돌려(첫 회 카드 추가) 다시 보게 한다. 상한 뒤에만 형광 */
    function pick(btn,i){
      if(S.found)return;
      fx('playClick')();
      if(o.choices[i].ok){
        S.found=true;
        btn.classList.add('correct');fx('playCorrect')();fx('addScore')(25);
        if(o.onFound)o.onFound(i);
        return;
      }
      btn.classList.add('wrong');fx('playWrong')();
      try{combo=0;}catch(e){}
      setTimeout(()=>btn.classList.remove('wrong'),450);
      if(S.backCount<maxBack){
        S.backCount++;
        if(S.backCount===1)(o.back||[]).forEach(k=>{if(S.deck.indexOf(k)<0)S.deck.push(k);});
        S.dIdx=0;clearPlaced();
        const al=$(o.el.align);al.style.display='none';al.classList.remove('dim');
        try{answered[o.sortSlide]=false;}catch(e){}
        renderBins();showCard();
        fx('setFB')(o.fbQ,o.msg.back(S.backCount),false);
        setTimeout(()=>{fx('goSlide')(o.sortSlide);fx('setFB')(o.fbSort,o.msg.backSort(S.backCount),true);},1100);
      }else{
        qa.classList.add('hint');
        fx('setFB')(o.fbQ,o.msg.hint(),false);
      }
    }

    renderBins();showCard();
    return {
      get deck(){return S.deck;}, get dIdx(){return S.dIdx;}, get placed(){return S.placed;},
      get backCount(){return S.backCount;}, get found(){return S.found;},
      pick:function(i){const b=$(o.el.q).querySelectorAll('.dch')[i];if(b)pick(b,i);}
    };
  }
  window.KDiscover={bind:bind,version:1};
})();

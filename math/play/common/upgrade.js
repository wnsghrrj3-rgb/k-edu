/* 수학 놀이터 「꾸미기」 공통 부품 — 가게 섬(가게 꾸미기)·낚시 섬(배 꾸미기)이 같이 쓴다.
 * 망치 단추(쉬는 동안 점) · 살 수 있는 것 셋이 그림과 값으로 뜨는 판 · 고르는 것이 있는 물건의 고르기 판.
 * 무엇을 팔지(차례·값·한 번에 하나만 새로)는 섬의 rules.js 가 정하고, 여기는 보여 주고 눌린 것을 알려 줄 뿐이다. */
import { art, audio, tone } from './kit.js?v=3';

const CSS = `
.sheet{position:fixed;inset:0;z-index:30;background:rgba(10,20,40,.55);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;pointer-events:none;transition:opacity .25s}
.sheet.on{opacity:1;pointer-events:auto}
.sheet .card{width:min(100%,640px);background:#fff4d6;border:6px solid #b9853b;border-radius:24px;padding:14px 14px 16px;box-shadow:0 12px 0 rgba(0,0,0,.25);transform:translateY(20px) scale(.96);transition:transform .3s cubic-bezier(.2,1.4,.4,1);font-family:inherit}
.sheet.on .card{transform:none}
.sheet h2{display:flex;align-items:center;justify-content:center;gap:8px;font-size:clamp(1.3rem,4vw,1.8rem);font-weight:900;color:#5a3410;margin-bottom:12px}
.items{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.item{display:flex;flex-direction:column;align-items:center;gap:4px;background:#fff;border:4px solid #e2c88e;border-radius:18px;padding:10px 4px 10px;font-family:inherit;color:#4a2c0a;cursor:pointer;box-shadow:0 6px 0 rgba(0,0,0,.12)}
.item:active{transform:translateY(4px);box-shadow:0 2px 0 rgba(0,0,0,.12)}
.item .pic{font-size:clamp(2.6rem,9vw,3.8rem);line-height:1.1}
.item b{font-size:clamp(.95rem,3vw,1.2rem);font-weight:900;line-height:1.2;text-align:center;word-break:keep-all}
.item .price{display:flex;align-items:center;gap:4px;background:#ffd35c;border-radius:999px;padding:2px 12px;font-weight:900;font-size:clamp(1rem,3vw,1.2rem)}
.item.no{filter:grayscale(.75);opacity:.7}.item.no .price{background:#e6e0d2}
.item .more{font-size:.85rem;font-weight:800;color:#9a5b10;min-height:1.2em}.item.no .more{color:#7a4a1e}
.item.pick{border-color:#ff8a3d}
.sheet .close{display:block;margin:14px auto 0;background:#fff;border:4px solid #b9853b;border-radius:999px;padding:6px 26px;font-family:inherit;font-weight:900;font-size:1.05rem;color:#5a3410}
.sheet .empty{text-align:center;font-weight:900;font-size:1.2rem;color:#5a3410;padding:22px 0}
.hammer{position:relative;display:flex;align-items:center;gap:6px;background:#ffd35c;color:#3b2408;border:4px solid #fff;border-radius:999px;padding:4px 14px 4px 10px;font-family:inherit;font-weight:900;font-size:clamp(.95rem,2.5vw,1.15rem);box-shadow:0 5px 0 rgba(0,0,0,.18)}
.hammer span{font-size:1.45em;line-height:1}.hammer b{font-weight:900}
.hammer.glow{animation:up-pop .8s infinite}.hammer:active{transform:translateY(4px);box-shadow:0 1px 0 rgba(0,0,0,.18)}
.hammer.rest{background:#e9dcc0;color:#8a7350;box-shadow:none}
.hammer i{display:flex;gap:3px}.hammer i u{width:9px;height:9px;border-radius:50%;background:#fff;border:2px solid #b99a60}.hammer i u.on{background:#ff8a3d;border-color:#c9731a}
@keyframes up-pop{40%{transform:scale(1.12)}}
[hidden]{display:none!important}`;
let cssIn = false; export function css(){ if (cssIn) return; cssIn = true; const s = document.createElement('style'); s.id = 'upgrade-css'; s.textContent = CSS; document.head.prepend(s); }

/** 망치 단추를 그린다. rest = 남은 쉼(손님·통 수), REST = 쉼 길이, offers = 지금 살 수 있는 것, coins = 가진 동전. */
export function hammer(btn, { rest, REST, offers, coins }){ css(); const resting = rest > 0; btn.classList.toggle('rest', resting); btn.hidden = !offers.length && !resting;
  const pips = btn.querySelector('i'); if (pips) pips.innerHTML = resting ? Array.from({ length: REST }, (_, i) => `<u class="${i < REST - rest ? 'on' : ''}"></u>`).join('') : '';
  btn.classList.toggle('glow', !resting && offers.some(c => c.price <= coins)); }
/** 쉬는 동안 누르면 살짝 흔들리기만 한다. */
export function nudge(btn){ btn.classList.remove('glow'); btn.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], 360); tone(240, .1, 'sine', .06); }
const shake = b => { b.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], 300); tone(220, .12, 'sine', .07); };

/** 꾸미기 판을 연다.
 *  o = { show(html), hide(), card, title, offers, coins: () => n, itemPic(x), choices(x) → [v…], option(x, v) → html, chooseTitle(x), onBuy(id, v) }
 *  show/hide 는 섬이 가진 판을 여닫는다(꾸미는 동안 손님·물고기를 멈추는 것도 섬 몫). */
export function open(o){ css(); audio(); const c = o.coins(), offs = o.offers;
  const items = offs.map(x => `<button class="item${x.price > c ? ' no' : ''}" data-id="${x.id}"><span class="pic">${o.itemPic ? o.itemPic(x) : art(x.art)}</span><b>${x.name}</b><span class="price">${art('coin')} ${x.price}</span><span class="more">${x.price > c ? `${x.price - c}개 더` : ''}</span></button>`).join('');
  o.show(`<h2>${art('shop.hammer')} ${o.title}</h2>` + (offs.length ? `<div class="items">${items}</div>` : `<div class="empty">${o.doneText || '다 꾸몄어!'}</div>`) + '<button class="close" id="sheetClose">닫기</button>');
  o.card.querySelector('#sheetClose').onclick = () => o.hide();
  o.card.querySelectorAll('.item').forEach(b => b.onclick = () => { const x = offs.find(y => y.id === b.dataset.id); if (x.price > o.coins()) { shake(b); return; } x.choose ? choose(o, x) : o.onBuy(x.id); }); }
function choose(o, x){ const ch = o.choices(x);
  o.show(`<h2>${art('shop.hammer')} ${o.chooseTitle(x)}</h2><div class="items">${ch.map(v => `<button class="item pick" data-v="${v}">${o.option(x, v)}<span class="price">${art('coin')} ${x.price}</span></button>`).join('')}</div><button class="close" id="sheetBack">뒤로</button>`);
  o.card.querySelector('#sheetBack').onclick = () => open(o); o.card.querySelectorAll('.item').forEach(b => b.onclick = () => o.onBuy(x.id, b.dataset.v)); }

/* probe75.mjs (R75) — 「느려진다」가 아니라 「사라진다」인지 확인.
   세 층(video·video2·video3)이 각자 자기 this 로 재렌더한다. 그러면
   그 위 층의 render 가 얹은 것까지 통째로 없어지는지 실브라우저에서 본다.
   실행: node probe75.mjs */
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const br = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args, headless: 'shell', protocolTimeout: 900000,
});
const pg = await br.newPage();
pg.setDefaultTimeout(300000);
await pg.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
await pg.goto('http://127.0.0.1:8913/maker-playground/index.html#/video', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 800));

const r = await pg.evaluate(async () => {
  const H = window.MK_VIDHUB, PG = window.PG;
  const root = () => document.querySelector('#pgBody') || document.body;
  const shot = () => {
    const rt = root();
    return {
      역할칩: rt.querySelectorAll('[data-vh-role]').length,
      행: rt.querySelectorAll('[data-vh-mrow]').length,
      자동구성줄: !!rt.querySelector('[data-vh-smart]'),
      씨앗: !!rt.querySelector('#vhSeed'),
    };
  };
  const settle = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  /* 작은 사진 8장 — 여기서 재는 건 시간이 아니라 유무다 */
  const mk = (i) => {
    const c = document.createElement('canvas'); c.width = 80; c.height = 60;
    const g = c.getContext('2d'); g.fillStyle = `hsl(${i * 40},70%,60%)`; g.fillRect(0, 0, 80, 60);
    return { name: `p${i}.jpg`, kind: 'image', src: c.toDataURL('image/jpeg', 0.8), w: 80, h: 60 };
  };
  H.resetStage();
  H.st.comp = 'cx-slideshow';
  H.st.theme = window.MK_COMPOSE.listThemes()[0].id;
  H.st.title = '프로브';
  H.stageMedias([0, 1, 2, 3, 4, 5, 6, 7].map(mk));
  H.st.captions = H.st.medias.map(() => '');
  if (typeof H.ensureThumbs === 'function') await H.ensureThumbs();
  PG.go('video');
  await new Promise((r) => setTimeout(r, 500));

  const out = { 처음: shot() };

  /* ① ▲ 위로 — video2 의 redraw 만 탄다 (video3·4·5 mount 유실) */
  const up = root().querySelector('[data-vh-mup="3"]');
  if (up) { up.click(); await settle(); }
  out['▲누른뒤'] = shot();

  /* 복구 후 ② 드래그 — video3 의 redraw (video4·5 mount 유실) */
  PG.go('video'); await new Promise((r) => setTimeout(r, 400));
  const rt = root();
  const src = rt.querySelector('[data-vh-mrow="0"]');
  const dst = rt.querySelector('[data-vh-mrow="3"]');
  const dt = { effectAllowed: '', setData() {}, getData() { return ''; } };
  if (src && dst) {
    src.dispatchEvent(Object.assign(new Event('dragstart', { bubbles: true }), { dataTransfer: dt }));
    dst.dispatchEvent(Object.assign(new Event('dragover', { bubbles: true, cancelable: true }), { dataTransfer: dt }));
    dst.dispatchEvent(Object.assign(new Event('drop', { bubbles: true, cancelable: true }), { dataTransfer: dt }));
    await settle();
  }
  out['드래그뒤'] = shot();

  /* ③ 캡션 확정(onchange) — 역시 video2 redraw */
  PG.go('video'); await new Promise((r) => setTimeout(r, 400));
  const cap = root().querySelector('[data-vh-cap="2"]');
  if (cap) { cap.value = '한 줄'; cap.dispatchEvent(new Event('change', { bubbles: true })); await settle(); }
  out['캡션확정뒤'] = shot();

  return out;
});

for (const [k, v] of Object.entries(r)) console.log(k.padEnd(12), JSON.stringify(v));
await br.close();

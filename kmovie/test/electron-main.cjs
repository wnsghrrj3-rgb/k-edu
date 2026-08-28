// Electron 테스트 메인 — launch.mjs(playwright-core _electron)가 띄운다.
// localhost(보안 컨텍스트)로 이동해야 WebCodecs 가 보인다. 창은 xvfb 아래에서 실제 표시(rAF 정속).
const { app, BrowserWindow } = require('electron');
const os = require('os'), path = require('path');
app.setPath('userData', path.join(os.tmpdir(), 'kmv-electron-' + Date.now() + '-' + Math.random().toString(36).slice(2)));   // 세션 간 IndexedDB 격리
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('enable-unsafe-swiftshader');
app.disableHardwareAcceleration();
app.whenReady().then(() => {
  const w = new BrowserWindow({
    width: +(process.env.KMV_VW || 1500), height: +(process.env.KMV_VH || 900), show: true,
    webPreferences: { backgroundThrottling: false, contextIsolation: true },
  });
  w.loadURL('http://127.0.0.1:' + (process.env.KMV_PORT || 8765) + '/kmovie/test/blank.html');
});

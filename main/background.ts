import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import fs from 'fs';
import path from 'path';

import { createWindow } from './helpers';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  const window = createWindow('main', {
    title: 'Awy Bot',
    width: 768,
    height: 960,
    center: true,
    darkTheme: true,
    resizable: !isProd,
    maximizable: !isProd,
  });

  window.setMenuBarVisibility(false);

  // window.webContents.on('before-input-event', (e, input) => {
  //   if (input.code == 'F4' && input.alt) e.preventDefault();
  // });

  if (isProd) {
    await window.loadURL('app://./home.html');
  } else {
    window.maximize();
    const port = process.argv[2];
    await window.loadURL(`http://localhost:${port}/home`);
    window.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

// Listen events
const dir = path.join(__dirname, 'events');
fs.readdirSync(dir).forEach((file) => {
  const handler = path.join(dir, file);
  const event = path.basename(file, '.ts');

  ipcMain.on(event, require(handler).default);
});

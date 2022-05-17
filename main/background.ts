import { execSync } from 'child_process';
import { app, globalShortcut, ipcMain } from 'electron';
import serve from 'electron-serve';

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
    frame: false,
    width: 800,
    height: 600,
  });

  const tasks = execSync('tasklist').toString();
  console.log(tasks);

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

ipcMain.on('remap', require('./events/remap').default);
ipcMain.on('windows', require('./events/windows').default);

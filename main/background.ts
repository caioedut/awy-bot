import { app, ipcMain } from 'electron';
import serve from 'electron-serve';

import main from './windows/main';
import overlay from './windows/overlay';
import splash from './windows/splash';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const windows = {
  splash: null,
  main: null,
  overlay: null,
};

(async () => {
  await app.whenReady();

  windows.splash = await splash();

  ipcMain.on('overlay', (e, arg) => {
    require('./events/overlay').default(e, arg, windows);
  });

  ipcMain.on('overlay-resize', (e, arg) => {
    if (windows.overlay) {
      const [width, height] = `${arg ?? ''}`.split('|').map(Number);
      windows.overlay.setContentSize(width, height);
    }

    e.returnValue = 'ok';
  });

  windows.main = await main();
  windows.overlay = await overlay();

  windows.splash.close();
  windows.main.show();
})();

app.on('window-all-closed', () => {
  app.quit();
});

// Listen events
ipcMain.on('main', require('./events/main').default);
ipcMain.on('actions', require('./events/actions').default);
ipcMain.on('lock', require('./events/lock').default);
ipcMain.on('remap', require('./events/remap').default);
ipcMain.on('windows', require('./events/windows').default);

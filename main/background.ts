import { app, ipcMain } from 'electron';
import serve from 'electron-serve';

import tray from './providers/tray';
import { Views } from './types';
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

const views: Views = {
  tray: null,
  splash: null,
  main: null,
  overlay: null,
};

(async () => {
  await app.whenReady();

  views.splash = await splash();

  ipcMain.on('overlay', (e, arg) => {
    require('./events/overlay').default(e, arg, views);
  });

  ipcMain.on('overlay-resize', (e, arg) => {
    if (views.overlay) {
      const [width, height] = `${arg ?? ''}`.split('|').map(Number);
      views.overlay.setContentSize(width, height);
    }

    e.returnValue = 'ok';
  });

  // Launch with windows startup
  if (isProd) {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true,
    });
  }

  views.main = await main();
  views.overlay = await overlay();
  views.tray = await tray(views);

  views.splash.close();
  views.main.show();
})();

app.on('window-all-closed', () => {
  app.quit();
});

// Listen events
ipcMain.on('service', require('./services/_service').default);
ipcMain.on('main', require('./events/main').default);
ipcMain.on('actions', require('./events/actions').default);
ipcMain.on('lock', require('./events/lock').default);
ipcMain.on('remap', require('./events/remap').default);

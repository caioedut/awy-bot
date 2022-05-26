import { app, ipcMain } from 'electron';
import serve from 'electron-serve';

import createWindow from './helpers/create-window';
import overlay from './windows/overlay';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const windows = {
  main: null,
  overlay: null,
};

(async () => {
  await app.whenReady();

  ipcMain.on('overlay', (e, arg) => {
    require('./events/overlay').default(e, arg, windows);
  });

  ipcMain.on('overlay-resize', (e, arg) => {
    const [width, height] = `${arg ?? ''}`.split('|').map(Number);
    windows.overlay.setContentSize(width, height);
    e.returnValue = 'ok';
  });

  windows.main = createWindow('Main', {
    show: false,
    thickFrame: true,
    title: 'Awy Bot',
    width: 1280,
    height: 768,
    minWidth: 1280,
    minHeight: 768,
    center: true,
    darkTheme: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  windows.overlay = await overlay();

  windows.main.webContents.on('before-input-event', (e, input) => {
    if (input.code == 'F4' && input.alt) e.preventDefault();
  });

  windows.main.on('close', app.quit);
  windows.main.setMenuBarVisibility(false);

  if (isProd) {
    await windows.main.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await windows.main.loadURL(`http://localhost:${port}/home`);

    windows.main.maximize();
    windows.main.webContents.openDevTools();
  }

  windows.main.show();
})();

app.on('window-all-closed', () => {
  app.quit();
});

// Listen events
ipcMain.on('main', require('./events/main').default);
ipcMain.on('raw', require('./events/raw').default);
ipcMain.on('lock', require('./events/lock').default);
ipcMain.on('remap', require('./events/remap').default);
ipcMain.on('windows', require('./events/windows').default);

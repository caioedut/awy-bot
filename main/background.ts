import { BrowserWindow, app, ipcMain } from 'electron';
import serve from 'electron-serve';

import createWindow from './helpers/create-window';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

(async () => {
  await app.whenReady();

  const window = createWindow('Main', {
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

  const overlayWindow = new BrowserWindow({
    title: 'Overlay - Awy Bot',
    show: false,
    frame: false,
    modal: true,
    alwaysOnTop: true,
    darkTheme: true,
    autoHideMenuBar: true,
    focusable: false,
    hasShadow: true,
    skipTaskbar: true,
    vibrancy: 'dark',
    x: 16,
    y: 16,
    width: 0,
    height: 0,
    movable: true,
    maximizable: false,
    resizable: false,
    opacity: 0.9,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  ipcMain.on('overlay-resize', (e, arg) => {
    const [width, height] = `${arg ?? ''}`.split('|').map(Number);

    if (width > 16 && height > 16) {
      overlayWindow.setContentSize(width, height);
      overlayWindow.show();
    } else {
      overlayWindow.hide();
    }

    e.returnValue = 'ok';
  });

  // window.webContents.on('before-input-event', (e, input) => {
  //   if (input.code == 'F4' && input.alt) e.preventDefault();
  // });

  window.setMenuBarVisibility(false);

  if (isProd) {
    await window.loadURL('app://./home.html');
    await overlayWindow.loadURL('app://./overlay.html');
  } else {
    const port = process.argv[2];

    await window.loadURL(`http://localhost:${port}/home`);
    await overlayWindow.loadURL(`http://localhost:${port}/overlay`);

    window.maximize();
    window.webContents.openDevTools();

    // overlayWindow.setSize(1280, 768);
    // overlayWindow.webContents.openDevTools();
  }

  window.show();
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
ipcMain.on('overlay', require('./events/overlay').default);

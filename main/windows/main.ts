import { app } from 'electron';

import createWindow from '../helpers/create-window';

const port = process.argv[2];
const isProd: boolean = process.env.NODE_ENV === 'production';

export default async function main() {
  const window = createWindow('Main', {
    show: false,
    thickFrame: true,
    title: 'Awy Bot',
    width: 560,
    height: 560,
    minWidth: 560,
    minHeight: 560,
    center: true,
    roundedCorners: true,
    darkTheme: true,
    backgroundColor: '#333333',
  });

  window.setMenuBarVisibility(false);

  window.webContents.on('before-input-event', (e, input) => {
    if (input.code == 'F4' && input.alt) e.preventDefault();
  });

  window.on('close', () => {
    app.quit();
  });

  window.on('minimize', function (event) {
    event.preventDefault();
    window.hide();
  });

  if (isProd) {
    await window.loadURL('app://./home.html');
  } else {
    await window.loadURL(`http://localhost:${port}/home`);

    window.maximize();
    window.webContents.openDevTools();

    // windows.overlay.setSize(1280, 768);
    // windows.overlay.maximize();
    // windows.overlay.webContents.openDevTools();
  }

  return window;
}

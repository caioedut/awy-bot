import { spawn } from 'child_process';
import { app } from 'electron';
import { existsSync, rmSync } from 'fs';

import createWindow from '../helpers/create-window';

const port = process.argv[2];
const isProd: boolean = process.env.NODE_ENV === 'production';

export default async function main() {
  const window = createWindow('Main', {
    show: false,
    thickFrame: true,
    title: 'Awy Bot',
    width: 620,
    height: 620,
    minWidth: 620,
    minHeight: 620,
    center: true,
    roundedCorners: true,
    darkTheme: true,
    backgroundColor: '#333333',
  });

  window.setMenuBarVisibility(false);

  window.webContents.on('before-input-event', (e, input) => {
    if (input.code == 'F4' && input.alt) e.preventDefault();
  });

  window.webContents.session.on('will-download', (e, item, webContents) => {
    // Set the save path, making Electron not to prompt a save dialog.
    const filePath = `${app.getPath('temp')}\\${item.getFilename()}`;
    if (existsSync(filePath)) rmSync(filePath);

    item.setSavePath(filePath);

    item.on('updated', (e, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`);
        }
      }
    });

    item.once('done', (e, state) => {
      if (state === 'completed') {
        console.log('Download successfully');

        // Open Setup
        spawn('cmd.exe', ['/c', filePath]);
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
  });

  window.on('close', () => {
    app.quit();
  });

  window.on('minimize', function (event) {
    event.preventDefault();
    window.hide();
  });

  if (isProd) {
    await window.loadURL('app://./home.html').then(() => {});
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

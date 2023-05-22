import { Menu, Tray, app } from 'electron';
import path from 'path';

import { resourcesPath } from '../constants';

const isProd: boolean = process.env.NODE_ENV === 'production';

export default function tray(views) {
  const mainWindow = views.main;

  const tray = new Tray(path.join(isProd ? resourcesPath : 'resources', 'icon.ico'));

  tray.setToolTip('Awy Bot');

  tray.on('click', () => {
    mainWindow.show();
  });

  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Show', click: () => mainWindow.show() },
      { label: 'Quit', click: () => app.quit() },
    ]),
  );

  return tray;
}

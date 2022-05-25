import fs from 'fs';
import ini from 'ini';

export default function overlay(e, arg) {
  const body = JSON.parse(arg || '{}');

  const { type, window, overlay } = body;

  if (type === 'get') {
    const config = ini.parse(fs.readFileSync('overlay.ini', 'utf-8'));

    return (e.returnValue = JSON.stringify(config.Default));
  }

  // const overlayWindow = BrowserWindow.getAllWindows()[1];
  // overlayWindow.show();

  e.returnValue = 'ok';
}

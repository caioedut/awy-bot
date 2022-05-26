import fs from 'fs';
import ini from 'ini';

export default function overlay(e, arg, windows) {
  const body = JSON.parse(arg || '{}');

  const { type, overlay } = body;

  if (type === 'get') {
    let response = {};

    try {
      const content = fs.readFileSync('overlay.ini', 'utf-8');
      response = ini.parse(content);
    } catch (err) {}

    return (e.returnValue = JSON.stringify(response));
  }

  if (windows?.overlay) {
    if (overlay) {
      windows.overlay.show();
    } else {
      // TODO: destroy window to free memory
      windows.overlay.hide();
      // windows.overlay.destroy();
      // windows.overlay = null;
    }
  }

  e.returnValue = 'ok';
}

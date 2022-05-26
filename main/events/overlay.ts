import fs from 'fs';
import ini from 'ini';

export default function overlay(e, arg, windows) {
  const body = JSON.parse(arg || '{}');

  const { type, overlay } = body;

  if (type === 'get') {
    let response = { Default: {} };

    try {
      const content = fs.readFileSync('overlay.ini', 'utf-8');
      response = ini.parse(content);
    } catch (err) {}

    return (e.returnValue = JSON.stringify(response.Default));
  }

  if (windows?.overlay) {
    windows.overlay.show();

    // TODO
    // if (overlay) {
    //   windows.overlay.show();
    // } else {
    //   windows.overlay.destroy();
    //   windows.overlay = null;
    // }
  }

  e.returnValue = 'ok';
}

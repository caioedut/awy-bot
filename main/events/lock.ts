import { getHotkey, runScript } from '../utils';

export default function lock(e, arg) {
  const body = JSON.parse(arg || '{}');
  const { window, locks = [] } = body;

  let winKey = false;

  const params: string[] = locks
    .filter(({ lock }) => lock)
    .map(({ key }) => {
      if (key === 'Win') {
        winKey = true;
        key = 'LWin';
      }

      return getHotkey(key);
    });

  if (winKey) {
    params.push(getHotkey('RWin'));
  }

  runScript('lock.ahk', params, window);

  e.returnValue = 'ok';
}

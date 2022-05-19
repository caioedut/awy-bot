import { getHotkey, runScript } from '../utils';

export default function lock(e, arg) {
  const body = JSON.parse(arg || '{}');
  const window = body.window || '';

  let winKey = false;

  const locks: string[] = (body.locks || [])
    .filter(({ lock }) => lock)
    .map(({ key }) => {
      if (key === 'Win') {
        winKey = true;
        key = 'LWin';
      }

      return getHotkey(key);
    });

  if (winKey) {
    locks.push(getHotkey('RWin'));
  }

  runScript('lock.ahk', locks, window);

  e.returnValue = 'ok';
}

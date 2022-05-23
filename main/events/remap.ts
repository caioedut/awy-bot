import { getHotkey, runScript } from '../utils';

export default function remap(e, arg) {
  const body = JSON.parse(arg || '{}');

  const window = body.window || '';
  const bindings = body.bindings || [];

  const params = bindings
    .filter(({ key, sequence }) => key && sequence?.length)
    .map(({ key, sequence, delay, loop }) => {
      const value = sequence.filter(Boolean).map((item) => getHotkey(item));
      return `${getHotkey(key)}|${Number(loop || 0)}|${value.join(':;')}|${delay.join(':;')}`;
    });

  runScript('remap.ahk', params, window);

  e.returnValue = 'ok';
}

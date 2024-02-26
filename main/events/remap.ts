import { getHotkey, runScript } from '../utils';

export default function remap(e, arg) {
  const body = JSON.parse(arg || '{}');
  const { window, bindings = [] } = body;

  const params = bindings
    .filter(({ key, sequence }) => key && sequence?.length)
    .map(({ key, sequence, delay, loop, modifiers }) => {
      const value = sequence.filter(Boolean).map((item) => getHotkey(item));
      return `${getHotkey(key)}|${Number(loop || 0)}|${value.join(':;')}|${delay.join(':;')}|${Number(modifiers || 0)}`;
    });

  runScript('remap.ahk', params, window);

  e.returnValue = 'ok';
}

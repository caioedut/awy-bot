import { runScript } from '../utils';

export default function main(e, arg) {
  const body = JSON.parse(arg || '{}');
  const window = body.window || '';

  runScript('main.ahk', [], window);

  e.returnValue = 'ok';
}

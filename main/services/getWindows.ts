import { runScriptSync } from '../utils';

export default function getWindows() {
  return runScriptSync('getWindows.ahk')
    .stdout.toString()
    .split(/\r?\n/g)
    .filter(Boolean)
    .map((item) => {
      const [ahk_id, ahk_class, ...rest] = item.split('|');

      const title = rest.join('|');
      const more = `${title} ${[ahk_class]}`.length > 120;
      const short = title.substring(0, 120 - ahk_class.length) + (more ? ' [...]' : '');

      return { ahk_id, ahk_class, title, short };
    })
    .sort((a, b) => {
      return a.ahk_class.localeCompare(b.ahk_class);
    });
}

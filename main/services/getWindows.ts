import { runScriptSync } from '../utils';

export default function getWindows() {
  return runScriptSync('getWindows.ahk')
    .stdout.toString()
    .split(/\r?\n/g)
    .filter(Boolean)
    .map((item) => {
      const split = item.split('|');

      const ahk_id = split.shift();
      const ahk_exe = split.shift();
      const title = split.join('|');

      const more = `${[ahk_exe]} : ${title}`.length > 120;
      const short = title.substring(0, 120 - ahk_exe.length) + (more ? ' [...]' : '');

      return { ahk_id, ahk_exe, title, short };
    })
    .sort((a, b) => {
      return a.ahk_exe.localeCompare(b.ahk_exe);
    });
}

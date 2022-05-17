import { execSync } from 'child_process';

export default function remap(e, arg) {
  const body = JSON.parse(arg || {});
  const exe = 'ahk/lib/AutoHotkeyU64.exe';
  const file = 'ahk/Remap.ahk';

  const params = body
    .filter(({ key, sequence, loop }) => key && sequence?.length)
    .map(({ key, sequence, loop }) => {
      const value = sequence.filter(Boolean).map((item) => getHotkey(item));
      return `"${getHotkey(key, false)}|${Number(loop || 0)}|${value.join(':;')}"`;
    });

  const cmd = `start "${exe}" "${file}" ${params.join(' ')}`;

  execSync(cmd, { stdio: 'inherit' });

  e.returnValue = 'ok';
}

const getHotkey = (str, brackets = true) => {
  const parsed = str
    .replace(/\s/g, '')
    .replace(/\+/gi, '')
    .replace(/ALT/gi, '!')
    .replace(/CTRL/gi, '^')
    .replace(/SHIFT/gi, '+')
    .replace(/META/gi, '#')
    .toLowerCase();

  let hotkey = parsed;
  let checked = false;

  if (brackets) {
    hotkey = '';

    for (let char of parsed) {
      if (!checked && !/[!^+#]/g.test(char)) {
        checked = true;
        hotkey += '{';
      }

      hotkey += char;
    }

    hotkey += '}';
  }

  return hotkey;
};

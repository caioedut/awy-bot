const fs = require('fs');
const { execSync } = require('child_process');

export default function handler(req, res) {
  try {
    const exe = 'ahk/lib/AutoHotkeyU64.exe';
    const file = 'ahk/Remap.ahk';

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

    const params = req.body
      .filter(({ key, remap }) => key && remap)
      .map(({ key, remap }) => {
        return `"${getHotkey(key, false)}=${getHotkey(remap)}"`;
      });

    const cmd = `start "${exe}" "${file}" ${params.join(' ')}`;

    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({ status: 'ok' });
}

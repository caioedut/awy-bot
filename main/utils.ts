export const getHotkey = (str, brackets = true) => {
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

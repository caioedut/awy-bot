const nodeahk = require('node-ahk');
const fs = require('fs');
const { execSync } = require('child_process');

export default function handler(req, res) {
  try {
    const exe = 'ahk/lib/AutoHotkeyU64.exe';
    const file = 'ahk/main.ahk';

    const params = 'MouseMiddle=x;Mouse3=y';

    const cmd = `start "${exe}" "${file}" "${params}"`;

    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({ name: 'John Doe' });
}

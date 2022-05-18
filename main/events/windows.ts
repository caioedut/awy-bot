import { execSync } from 'child_process';
import fs from 'fs';

export default function windows(e) {
  const exe = 'ahk/lib/AutoHotkeyU64.exe';
  const file = 'ahk/Windows.ahk';

  execSync(`start "${exe}" "${file}"`, { stdio: 'inherit' });
  execSync('ping 127.0.0.1 -n 2 > nul', { stdio: 'inherit' });

  const windows = fs.readFileSync('ahk/windows.txt').toString().split(/\r?\n/g).filter(Boolean);

  e.returnValue = JSON.stringify(windows);
}

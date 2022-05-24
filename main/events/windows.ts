import { runScriptSync } from '../utils';

export default function windows(e) {
  const buffer = runScriptSync('windows.ahk');
  const windows = buffer.stdout.toString().split(/\r?\n/g).filter(Boolean);

  e.returnValue = JSON.stringify(windows);
}

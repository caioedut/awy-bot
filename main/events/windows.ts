import fs from 'fs';
import path from 'path';

import { AHK_PATH } from '../constants';
import { runScriptSync } from '../utils';

export default function windows(e) {
  runScriptSync('windows.ahk');

  const filePath = path.join(AHK_PATH, 'windows.txt');
  const windows = fs.readFileSync(filePath).toString().split(/\r?\n/g).filter(Boolean);

  e.returnValue = JSON.stringify(windows);
}

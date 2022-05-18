import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { AHK_EXE, AHK_PATH, AHK_SCRIPTS_PATH } from '../constants';

export default function windows(e) {
  const script = path.join(AHK_SCRIPTS_PATH, 'windows.ahk');

  spawnSync(AHK_EXE, [script]);

  const filePath = path.join(AHK_PATH, 'windows.txt');
  const windows = fs.readFileSync(filePath).toString().split(/\r?\n/g).filter(Boolean);

  e.returnValue = JSON.stringify(windows);
}

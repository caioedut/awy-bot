import { runScriptSync } from '../utils';

export default function getActiveWindow() {
  return runScriptSync('getActiveWindow.ahk').stdout.toString();
}

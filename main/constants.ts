import path from 'path';

export const OS_64_BIT = process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');

export const AHK_PATH = path.join(process.resourcesPath, 'ahk');

export const AHK_LIB_PATH = path.join(AHK_PATH, 'lib');

export const AHK_SCRIPTS_PATH = path.join(AHK_PATH, 'script');

export const AHK_EXE = path.join(AHK_LIB_PATH, `AutoHotkeyU${OS_64_BIT ? '64' : '32'}.exe`);

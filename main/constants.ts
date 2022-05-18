import path from 'path';

export const OS_64_BIT = process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');

export const isProduction = process.env.NODE_ENV === 'production';

export const resourcesPath = isProduction ? process.resourcesPath : '';

export const AHK_PATH = path.join(resourcesPath, 'ahk');

export const AHK_LIB_PATH = path.join(AHK_PATH, 'lib');

export const AHK_SCRIPTS_PATH = path.join(AHK_PATH, 'scripts');

export const AHK_EXE = path.join(AHK_LIB_PATH, `AutoHotkeyU${OS_64_BIT ? '64' : '32'}.exe`);

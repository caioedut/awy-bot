import { BrowserWindow } from 'electron';

const port = process.argv[2];
const isProd: boolean = process.env.NODE_ENV === 'production';

export default async function overlay() {
  const window = new BrowserWindow({
    title: 'Overlay - Awy Bot',
    x: 8,
    y: 8,
    width: 0,
    height: 0,
    show: false,
    frame: false,
    modal: true,
    movable: true,
    maximizable: false,
    resizable: false,
    opacity: 0.9,
    alwaysOnTop: true,
    darkTheme: true,
    autoHideMenuBar: true,
    focusable: false,
    hasShadow: true,
    skipTaskbar: true,
    vibrancy: 'dark',
    paintWhenInitiallyHidden: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  await window.loadURL(isProd ? 'app://./overlay.html' : `http://localhost:${port}/overlay`);

  return window;
}

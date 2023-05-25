import { BrowserWindow } from 'electron';

const port = process.argv[2];
const isProd: boolean = process.env.NODE_ENV === 'production';

export default async function splash() {
  const window = new BrowserWindow({
    title: 'Splash - Awy Bot',
    width: 280,
    height: 160,
    frame: false,
    alwaysOnTop: true,
    roundedCorners: true,
    darkTheme: true,
    backgroundColor: '#009688',
    vibrancy: 'dark',
    paintWhenInitiallyHidden: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  await window.loadURL(isProd ? 'app://./splash.html' : `http://localhost:${port}/splash`);

  window.center();

  return window;
}

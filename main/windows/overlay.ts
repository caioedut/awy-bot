import { BrowserWindow, screen } from 'electron';
import Store from 'electron-store';

const port = process.argv[2];
const isProd: boolean = process.env.NODE_ENV === 'production';

function adjustPosition(window: BrowserWindow) {
  let [x, y] = window.getPosition();

  const bounds = window.getBounds();
  const display = screen.getDisplayNearestPoint(bounds);

  const maxPosX = display.bounds.x + display.bounds.width - bounds.width;
  const maxPosY = display.bounds.y + display.bounds.height - bounds.height;

  // Min/max positions
  x = Math.min(maxPosX, Math.max(0, x));
  y = Math.min(maxPosY, Math.max(0, y));

  window.setPosition(x, y);

  return [x, y] as const;
}

export default async function overlay() {
  const store = new Store({ name: 'window-state-overlay' });

  const [x, y]: number[] = store.get('position', [4, 4]) as number[];

  const window = new BrowserWindow({
    x,
    y,
    title: 'Overlay - Awy Bot',
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
    roundedCorners: true,
    darkTheme: true,
    backgroundColor: '#333333',
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

  adjustPosition(window);

  window.on('system-context-menu', (e) => {
    e.preventDefault();
  });

  // https://github.com/electron/electron/issues/26726
  window.hookWindowMessage(0x0116, () => {
    window.setEnabled(false);
    window.setEnabled(true);
  });

  window.on('moved', () => {
    const [x, y] = adjustPosition(window);
    store.set('position', [x, y]);
  });

  await window.loadURL(isProd ? 'app://./overlay.html' : `http://localhost:${port}/overlay`);

  return window;
}

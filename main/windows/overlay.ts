import { BrowserWindow, screen } from 'electron';
import Store from 'electron-store';

const port = process.argv[2];
const isProd: boolean = process.env.NODE_ENV === 'production';

const adjustPosition = (window): number[] => {
  let [x, y] = window.getPosition();

  const size = window.getSize();
  const bounds = window.getBounds();
  const display = screen.getDisplayNearestPoint(bounds);

  const minX = 4;
  const minY = 4;
  const maxX = display.bounds.width - (size?.[0] || 0);
  const maxY = display.bounds.height - (size?.[1] || 0);

  // Min/max positions
  x = Math.min(maxX, Math.max(minX, x));
  y = Math.min(maxY, Math.max(minY, y));

  window.setPosition(x, y);

  return [x, y];
};

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

  window.on('moved', () => {
    const [x, y] = adjustPosition(window);
    store.set('position', [x, y]);
  });

  await window.loadURL(isProd ? 'app://./overlay.html' : `http://localhost:${port}/overlay`);

  return window;
}

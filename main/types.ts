import { BrowserWindow, Tray } from 'electron';

export type Views = {
  tray: Tray;
  splash: BrowserWindow;
  main: BrowserWindow;
  overlay: BrowserWindow;
};

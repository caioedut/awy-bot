import electron from 'electron';

const ipcRenderer = electron.ipcRenderer;

export default function service(serviceName: string, ...args: any[]) {
  return ipcRenderer.sendSync('service', serviceName, ...args);
}

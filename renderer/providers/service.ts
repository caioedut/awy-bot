import electron from 'electron';

const ipcRenderer = electron.ipcRenderer;

export default function service(serviceName: string, data?: any) {
  return ipcRenderer.sendSync('service', serviceName, data ? JSON.stringify(data) : undefined);
}

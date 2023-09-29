import { app } from 'electron';

export default function getAppInfo() {
  return {
    version: app.getVersion(),
  };
}

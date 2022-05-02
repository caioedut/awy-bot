const { app, BrowserWindow } = require('electron');

module.exports = {
  render() {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
    });

    return win.loadFile('index.html');
  },
};

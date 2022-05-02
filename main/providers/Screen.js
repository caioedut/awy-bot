const { screen, getActiveWindow } = require('@nut-tree/nut-js');

const Util = require('./Util');

const Screen = {
  async isTibia() {
    return this.isActive('Tibia - ');
  },
  async isActive(name) {
    const window = await getActiveWindow();
    return (await window.title).toLowerCase().startsWith(name.toLowerCase());
  },
  async waitFor(name, options = { timeout: 0 }) {
    const promises = [];

    if (options.timeout) {
      promises.push(
        new Promise((resolve, reject) => setTimeout(reject, options.timeout)),
      );
    }

    promises.push(
      new Promise(async (resolve) => {
        while (!(await this.isActive(name))) {
          await Util.sleep(150);
        }

        resolve();
      }),
    );

    return Promise.race(promises);
  },
};

module.exports = Screen;

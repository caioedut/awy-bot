const { keyboard, Key } = require('@nut-tree/nut-js');

keyboard.config.autoDelayMs = 0;

const Keyboard = {
  Keys: Key,
  async press(...keys) {
    await keyboard.pressKey(...keys);
    await keyboard.releaseKey(...keys);
  },
  async hold(...keys) {
    await keyboard.pressKey(...keys);
  },
  async release(...keys) {
    await keyboard.releaseKey(...keys);
  },
};

module.exports = Keyboard;

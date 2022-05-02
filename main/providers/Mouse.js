const { mouse, Point } = require('@nut-tree/nut-js');

mouse.config.autoDelayMs = 0;
mouse.config.mouseSpeed = 0;

const Mouse = {
  async move(x, y) {
    if (typeof x !== 'undefined' && typeof y !== 'undefined') {
      await mouse.setPosition(new Point(x, y));
    }
  },
  async leftClick(x = null, y = null) {
    await this.move(x, y);
    await mouse.leftClick();
  },
  async rightClick(x = null, y = null) {
    await this.move(x, y);
    await mouse.rightClick();
  },
};

module.exports = Mouse;

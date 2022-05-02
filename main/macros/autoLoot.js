const Keyboard = require('../providers/Keyboard');
const Mouse = require('../providers/Mouse');

module.exports = async function autoLoot() {
  const { posX, posY, sqmSize } = global;

  // 1
  await Keyboard.hold(Keyboard.Keys.LeftShift);
  await Mouse.rightClick(posX - sqmSize, posY + sqmSize);
  await Keyboard.release(Keyboard.Keys.LeftShift);
  // 4
  await Keyboard.hold(Keyboard.Keys.LeftShift);
  await Mouse.rightClick(posX - sqmSize, posY);
  await Keyboard.release(Keyboard.Keys.LeftShift);
  // 7
  await Keyboard.hold(Keyboard.Keys.LeftShift);
  await Mouse.rightClick(posX - sqmSize, posY - sqmSize);
  await Keyboard.release(Keyboard.Keys.LeftShift);
  // 8
  await Keyboard.hold(Keyboard.Keys.LeftShift);
  await Mouse.rightClick(posX, posY - sqmSize);
  await Keyboard.release(Keyboard.Keys.LeftShift);
  // 9
  await Keyboard.hold(Keyboard.Keys.LeftShift);
  await Mouse.rightClick(posX + sqmSize, posY - sqmSize);
  await Keyboard.release(Keyboard.Keys.LeftShift);
  // 6
  await Keyboard.hold(Keyboard.Keys.LeftShift);
  await Mouse.rightClick(posX + sqmSize, posY);
  await Keyboard.release(Keyboard.Keys.LeftShift);
  // 3
  await Keyboard.hold(Keyboard.Keys.LeftShift);
  await Mouse.rightClick(posX + sqmSize, posY + sqmSize);
  await Keyboard.release(Keyboard.Keys.LeftShift);
  // 2
  await Keyboard.hold(Keyboard.Keys.LeftShift);
  await Mouse.rightClick(posX, posY + sqmSize);
  await Keyboard.release(Keyboard.Keys.LeftShift);
  // 5
  await Keyboard.hold(Keyboard.Keys.LeftShift);
  await Mouse.rightClick(posX, posY);
  await Keyboard.release(Keyboard.Keys.LeftShift);

  await Keyboard.release(Keyboard.Keys.LeftShift);
};

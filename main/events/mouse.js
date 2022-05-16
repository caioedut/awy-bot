const { EventEmitter } = require('events');

const eventEmitter = new EventEmitter();

const MouseEvents = {
  mousedown() {
    console.log('mousedown');
  },
  mouseup() {
    console.log('mouseup');
  },
};

function dispatch(eventName) {
  for (const event in MouseEvents) {
    if (!eventName || eventName === event) {
      const callback = MouseEvents[event];
      eventEmitter.off(event, callback).on(event, callback);
    }
  }
}

export { MouseEvents, dispatch };

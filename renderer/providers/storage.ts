import Store from 'electron-store';

export default class Storage extends Store {
  static with(name: string | number) {
    return new this({ name: `${name || 'default'}` });
  }
}

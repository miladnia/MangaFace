// @ts-nocheck

import { UIComponent, View } from '../ui';

export default class PinBoard extends UIComponent {
  _items = {};

  constructor() {
    super('div', 'pinboard-layout');
  }

  newItem() {
    return new Item();
  }

  pinItem(itemKey, item) {
    this._items[itemKey] = item;
    this._view.appendView(item.getView());
  }

  getItem(itemKey) {
    return this._items.hasOwnProperty(itemKey) ? this._items[itemKey] : null;
  }

  get images(): HTMLImageElement[] {
    const imgs = [];
    for (const key in this._items) {
      imgs.push(this._items[key].getView().getElement());
    }
    return imgs;
  }
}

class Item {
  constructor() {
    this._view = new View('img', 'item');
  }

  setImageUrl(imageUrl) {
    this._view.getElement().setAttribute('src', imageUrl);
    return this;
  }

  setPosition(top, left) {
    this._view.getElement().style.top = top;
    this._view.getElement().style.left = left;
    return this;
  }

  setPriority(priority) {
    this._view.getElement().style.zIndex = priority;
    return this;
  }

  getView() {
    return this._view;
  }
}

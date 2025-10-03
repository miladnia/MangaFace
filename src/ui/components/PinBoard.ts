import { UIComponent, ViewElement, type View } from '../ui';

export default class PinBoard extends UIComponent<'div'> {
  _items: Record<string, Item> = {};

  constructor() {
    super('div', 'pinboard-layout');
  }

  newItem() {
    return new Item();
  }

  pinItem(itemKey: string, item: Item) {
    this._items[itemKey] = item;
    this._view.appendView(item.getView());
  }

  getItem(itemKey: string): Item | null {
    return this._items[itemKey] ?? null;
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
  _view: View<'img'>;

  constructor() {
    this._view = new ViewElement('img', 'item');
  }

  setImageUrl(imageUrl: string) {
    this._view.getElement().setAttribute('src', imageUrl);
    return this;
  }

  setPosition(top: number, left: number) {
    this._view.getElement().style.top = `${top}px`;
    this._view.getElement().style.left = `${left}px`;
    return this;
  }

  setPriority(priority: number) {
    this._view.getElement().style.zIndex = priority.toString();
    return this;
  }

  getView() {
    return this._view;
  }
}

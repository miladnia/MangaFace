import { UIComponent, ViewElement, type View } from '../ui';

export default class PinBoard extends UIComponent<'div'> {
  _items: Record<string, Item> = {};
  #canvasMock: HTMLElement;

  constructor(pxWidth: number, pxHeight: number) {
    super('div', 'pinboard-layout');
    this.element.style.setProperty('--original-width', `${pxWidth}px`);
    this.element.style.setProperty('--original-height', `${pxHeight}px`);
    this.#canvasMock = document.createElement('div');
    this.#canvasMock.classList.add('pinboard-canvas-mock');
    this.element.appendChild(this.#canvasMock);
  }

  newItem() {
    return new Item();
  }

  pinItem(itemKey: string, item: Item) {
    this._items[itemKey] = item;
    this.#canvasMock.appendChild(item.element);
  }

  getItem(itemKey: string): Item | null {
    return this._items[itemKey] ?? null;
  }

  get images(): HTMLImageElement[] {
    const imgs = [];
    for (const key in this._items) {
      imgs.push(this._items[key].element);
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
    if (!imageUrl) {
      console.warn("[PinBoard] The image URL is empty.");
    }
    this._view.getElement().setAttribute('src', encodeURI(imageUrl));
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

  get element() {
    return this._view.getElement();
  }
}

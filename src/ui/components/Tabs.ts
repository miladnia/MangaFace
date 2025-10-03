import { UIComponent, ViewElement } from '../ui';
import type { View } from '../ui';

type Listener = {
  // Called when a tab enters the selected state.
  onTabSelected: (tab: Tab) => void;
  // Called when a tab exits the selected state.
  onTabDeselected: (tab: Tab) => void;
};

export class Tabs extends UIComponent<'ul'> {
  #tabs: Tab[] = [];
  #selectedTab: Tab | null = null;
  #enabled = true;
  #listener: Listener;

  constructor() {
    super('ul', 'tab-layout');
    this.#listener = {
      onTabSelected: () => {},
      onTabDeselected: () => {},
    };
  }

  newTab() {
    return new Tab(this);
  }

  addTab(tab: Tab) {
    const len = this.#tabs.push(tab);
    tab._position = len - 1;
    this._view.appendView(tab.getView());

    if (0 === tab._position) {
      this._selectTab(tab);
    }

    return this;
  }

  getTabAt(index: number): Tab | null {
    return index < 0 || index >= this.#tabs.length ? null : this.#tabs[index];
  }

  getSelectedTabPosition() {
    return null !== this.#selectedTab ? this.#selectedTab.getPosition() : -1;
  }

  setListener(listener: Partial<Listener>) {
    if (listener.onTabSelected)
      this.#listener.onTabSelected = listener.onTabSelected;

    if (listener.onTabDeselected)
      this.#listener.onTabDeselected = listener.onTabDeselected;

    return this;
  }

  disable() {
    if (this.#enabled) {
      this.#enabled = false;
      this._view.hide();
    }

    return this;
  }

  enable() {
    if (!this.#enabled) {
      this.#enabled = true;
      this._view.show();
      if (!this._refresh()) {
        this._init();
      }
    }

    return this;
  }

  _refresh() {
    if (this.#enabled && null !== this.#selectedTab) {
      this.#listener.onTabSelected(this.#selectedTab);
      return true;
    }

    return false;
  }

  _init() {
    const firstTab = this.getTabAt(0);
    if (firstTab) {
      return this._selectTab(firstTab);
    }
  }

  _selectTab(tab: Tab) {
    if (!this.#enabled) return false;

    if (null === tab || tab.isSelected()) return false;

    if (null !== this.#selectedTab) {
      this.#selectedTab.getView().setSelected(false);
      this.#listener.onTabDeselected(this.#selectedTab);

      if (null !== this.#selectedTab._innerTabs)
        this.#selectedTab._innerTabs.disable();
    }

    this.#selectedTab = tab;
    tab.getView().setSelected(true);
    this.#listener.onTabSelected(tab);

    if (null !== tab._innerTabs) tab._innerTabs.enable();

    return true;
  }
}

export class Tab {
  _view: View<'li'>;
  _parent: Tabs;
  _text: string;
  _INVALID_POSITION: number;
  _position: number;
  _innerTabs: Tabs | null;
  _tag: unknown;

  constructor(parent: Tabs) {
    this._view = new ViewElement('li', 'tab');
    this._parent = parent;
    this._text = '';
    this._INVALID_POSITION = -1;
    this._position = this._INVALID_POSITION;
    this._innerTabs = null;
    this._tag = null;

    this._view.getElement().addEventListener('click', () => this.select());
  }

  setText(text: string) {
    this._text = text;
    this._view.setText(text);
    return this;
  }

  setImage(imageUrl: string) {
    this._view
      .getElement()
      .style.setProperty('background-image', 'url("' + imageUrl + '")');
    this._view.getElement().style.setProperty('background-size', '50%');
    return this;
  }

  setInnerTabs(innerTabs: Tabs) {
    this._innerTabs = innerTabs;
    return this;
  }

  setTag(tag: unknown) {
    this._tag = tag;
    return this;
  }

  getTag() {
    return this._tag;
  }

  getPosition() {
    return this._position;
  }

  isSelected() {
    return (
      this._INVALID_POSITION !== this._position &&
      this._parent.getSelectedTabPosition() === this._position
    );
  }

  select() {
    this._parent._selectTab(this);
  }

  getView() {
    return this._view;
  }
}

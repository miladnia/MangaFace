import { UIComponent, ViewElement } from '../ui';
import type { View } from '../ui';

type Listener = {
  // Called when a placeholder enters the selected state.
  onPlaceholderSelected: (placeholderKey: string, pageKey: string) => void;
  // Called when a placeholder exits the selected state.
  onPlaceholderDeselected: (placeholderKey: string, pageKey: string) => void;
  // Called when a placeholder that is already selected is chosen again by the user.
  onPlaceholderReselected: (placeholderKey: string, pageKey: string) => void;
};

export default class Grid extends UIComponent<'ul'> {
  static #instanceCount = 0;
  _viewId: number = 0;
  _cells: Cell[] = [];
  _pages: Record<string, Page> = {};
  #currentPage: Page | null = null;
  _selectedCell: Cell | null = null;
  _ATTR_PAGE_ID = 'data-lid';
  _ATTR_GRID_ID = 'data-gid';
  _columns: number;
  _rows: number;
  _cellCount: number;
  _listener: Listener = {
    onPlaceholderSelected: () => {},
    onPlaceholderDeselected: () => {},
    onPlaceholderReselected: () => {},
  };

  constructor(columns: number, rows: number) {
    super('ul', 'grid-layout');
    this._viewId = Grid.#instanceCount++;
    this._columns = columns > 0 ? columns : 1;
    this._rows = rows > 0 ? rows : 1;
    this._cellCount = this._rows * this._columns;

    // Create cells
    for (let i = 0; i < this._cellCount; i++) {
      const cell = new Cell(this);
      const len = this._cells.push(cell);
      cell._setPosition(len - 1);
      this._view.appendView(cell.getView());
    }
  }

  get page(): Page {
    if (!this.#currentPage) {
      throw new Error(`There is no page in grid #${this._viewId}.`);
    }

    return this.#currentPage;
  }

  setListener(listener: Partial<Listener>) {
    if (listener.onPlaceholderSelected) {
      this._listener.onPlaceholderSelected = listener.onPlaceholderSelected;
    }

    if (listener.onPlaceholderDeselected) {
      this._listener.onPlaceholderDeselected = listener.onPlaceholderDeselected;
    }

    if (listener.onPlaceholderReselected) {
      this._listener.onPlaceholderReselected = listener.onPlaceholderReselected;
    }

    return this;
  }

  newPage(pageKey: string) {
    return new Page(this, pageKey);
  }

  addPage(page: Page) {
    if (this.hasPage(page.getKey())) {
      console.warn(`The page key MUST be unique: ${page.getKey()}`);
      return;
    }

    this._pages[page.getKey()] = page;
  }

  hasPage(pageKey: string): boolean {
    return !!this._pages[pageKey];
  }

  getCurrentPageKey() {
    return this.page.getKey();
  }

  getSelectedPlaceholderKey() {
    return this.page.getSelectedPlaceholderKey();
  }

  switchToPage(pageKey: string) {
    if (!this.hasPage(pageKey)) {
      console.warn("There is not any page with '" + pageKey + "' key.");
      return;
    }

    // If the same page selected again
    if (null !== this.#currentPage && this.page.getKey() === pageKey) {
      return;
    }

    this.#currentPage = this._pages[pageKey];
    this.updateView();
  }

  selectPagePlaceholder(position: number) {
    if (null === this.page) return;

    if (!this.page.isInRangePosition(position)) {
      return;
    }

    const placeholderKey = this.page.getPlaceholderKeyAt(position);

    if (this.page.getSelectedPosition() === position) {
      this._listener.onPlaceholderReselected(
        placeholderKey,
        this.getCurrentPageKey()
      );
      return;
    }

    const prevSelectedPosition = this.page.getSelectedPosition();
    this.page.setPlaceholderSelectedAt(position);
    this.updateView();

    if (prevSelectedPosition >= 0) {
      const prevPlaceholderKey =
        this.page.getPlaceholderKeyAt(prevSelectedPosition);
      this._listener.onPlaceholderDeselected(
        prevPlaceholderKey,
        this.getCurrentPageKey()
      );
    }

    this._listener.onPlaceholderSelected(
      placeholderKey,
      this.getCurrentPageKey()
    );
  }

  setPagePlaceholderSelected(pageKey: string, placeholderKey: string) {
    if (!this.hasPage(pageKey)) {
      console.warn(`Invalid page key: ${pageKey}`);
      return;
    }

    this._pages[pageKey].setPlaceholderSelected(placeholderKey);
  }

  updateView() {
    if (null === this.page) return;

    const currentCell = this._selectedCell;
    const cellPos = this._selectedCell?.getPosition() ?? -1;
    const placeholderPosition = this.page.getSelectedPosition();

    // Update page attribute
    if (
      this.page.getKey() !== this.getElement().getAttribute(this._ATTR_PAGE_ID)
    )
      this.getElement().setAttribute(this._ATTR_PAGE_ID, this.page.getKey());

    // If the page has not any selected item yet
    // or the item has deselected.
    if (placeholderPosition < 0) {
      this._selectedCell = null;
    } else if (placeholderPosition !== cellPos) {
      const cell = this._cells[placeholderPosition];
      cell.getView().setSelected(true);
      this._selectedCell = cell;
    }

    if (null !== currentCell)
      currentCell
        .getView()
        .setSelected(
          placeholderPosition >= 0 && placeholderPosition === cellPos
        );
  }

  render() {
    const cellMargin = 1;
    const cellSize = 100 / this._columns - cellMargin * 2;

    this.getElement().setAttribute(this._ATTR_GRID_ID, this._viewId.toString());
    this._getStyle().addRule(`${this._getStyleSelector()} > *`, {
      width: `${cellSize}%`,
      height: '0',
      'padding-top': `${cellSize}%`,
      margin: `${cellMargin}%`,
    });

    for (const pageKey in this._pages) {
      const placeholders = this._pages[pageKey].getPlaceholders();
      for (const placeholder of Object.values(placeholders)) {
        const cellPosition = placeholder._cellPosition;

        this._getStyle().addRule(
          this._getStyleSelector(pageKey) +
            ' ' +
            this._cells[cellPosition]._getStyleSelector(),
          'color' == placeholder._type
            ? { 'background-color': placeholder._value }
            : { 'background-image': 'url("' + placeholder._value + '");' }
        );
      }
    }

    return this.getElement();
  }

  getCellCount() {
    return this._cellCount;
  }

  _selectCell(cell: Cell) {
    this.selectPagePlaceholder(cell.getPosition());
  }

  _getStyleSelector(pageKey?: string) {
    let selector =
      this._view.getStyleSelector() +
      '[' +
      this._ATTR_GRID_ID +
      '="' +
      this._viewId +
      '"]';

    if (pageKey) {
      selector += '[' + this._ATTR_PAGE_ID + '="' + pageKey + '"]';
    }

    return selector;
  }
}

class Cell {
  _view: View<'li'>;
  _parent: Grid;
  _position: number = -1;
  _ATTR_POSITION: string = 'data-pos';

  constructor(parent: Grid) {
    this._parent = parent;
    this._view = new ViewElement('li', 'cell');

    this._view.getElement().addEventListener('click', () => this.select());
  }

  _setPosition(position: number) {
    this._position = position;
    this._view
      .getElement()
      .setAttribute(this._ATTR_POSITION, position.toString());
  }

  select() {
    this._parent._selectCell(this);
  }

  getView() {
    return this._view;
  }

  getPosition() {
    return this._position;
  }

  _getStyleSelector() {
    return (
      this._view.getStyleSelector() +
      '[' +
      this._ATTR_POSITION +
      '="' +
      this._position +
      '"]'
    );
  }
}

class Page {
  _parent: Grid;
  _key: string;
  _placeholders: CellPlaceholder[] = [];
  _placeholdersKeyMap: Record<string, CellPlaceholder> = {};
  _selectedPosition: number = -1;

  constructor(parent: Grid, key: string) {
    this._parent = parent;
    this._key = key;
  }

  _addPlaceholder(placeholder: CellPlaceholder) {
    const placeholderKey = placeholder.getKey();

    if (undefined === placeholderKey || null === placeholderKey) {
      throw new Error(
        `Illegal Argument Exception: 'placeholderKey' MUST be defined. The placeholder value: ${placeholder._value}`
      );
    }

    if (this.countPlaceholders() >= this._parent.getCellCount()) {
      console.warn(
        "Could not add new placeholder to the page '" + this._key + "'.",
        'The total number of placeholders should be equal or less than ' +
          this._parent.getCellCount() +
          '.'
      );

      return this;
    }

    const len = this._placeholders.push(placeholder);
    placeholder._cellPosition = len - 1;
    this._placeholdersKeyMap[placeholderKey] = placeholder;

    return this;
  }

  isInRangePosition(position: number) {
    return position >= 0 && position < this._placeholders.length;
  }

  addImagePlaceholder(imageUrl: string, placeholderKey: string) {
    return this._addPlaceholder(
      new CellPlaceholder('image', imageUrl, placeholderKey)
    );
  }

  addColorPlaceholder(colorCode: string, placeholderKey: string) {
    return this._addPlaceholder(
      new CellPlaceholder('color', colorCode, placeholderKey)
    );
  }

  setPlaceholderSelectedAt(position: number) {
    this._selectedPosition = position;
  }

  setPlaceholderSelected(placeholderKey: string) {
    const placeholder = this._placeholdersKeyMap[placeholderKey];
    if (!placeholder) {
      console.warn(
        `No placeholder found with key '${placeholderKey}' in page '${this._key}' of grid #${this._parent._viewId}`
      );
      return;
    }
    this._selectedPosition = placeholder._cellPosition;
  }

  getSelectedPosition() {
    return this._selectedPosition;
  }

  getPlaceholderAt(position: number): CellPlaceholder | null {
    if (!this.isInRangePosition(position)) {
      return null;
    }
    return this._placeholders[position];
  }

  getPlaceholderByKey(placeholderKey: string) {
    return this._placeholdersKeyMap[placeholderKey];
  }

  getPlaceholderKeyAt(position: number) {
    const placeholder = this.getPlaceholderAt(position);
    return placeholder ? placeholder.getKey() : '';
  }

  getSelectedPlaceholderKey() {
    return this.getPlaceholderKeyAt(this._selectedPosition);
  }

  getKey() {
    return this._key;
  }

  getPlaceholders() {
    return this._placeholdersKeyMap;
  }

  countPlaceholders() {
    return this._placeholders.length;
  }
}

class CellPlaceholder {
  _cellPosition: number = -1;
  _type: string;
  _value: string;
  _key: string;

  constructor(type: string, value: string, key: string) {
    this._type = type;
    this._value = value;
    this._key = key;
  }

  getKey(): string {
    return this._key;
  }
}

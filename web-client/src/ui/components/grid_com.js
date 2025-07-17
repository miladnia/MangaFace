/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { UIComponent, View } from "../ui.js";
import { getRandInt } from "../../utils/rand.js";

export default function GridCom (columns, rows)
{
    this._columns = columns > 0 ? columns : 1;
    this._rows = rows > 0 ? rows : 1;
    this._cellCount = this._rows * this._columns;
    this._view = new View("ul", "grid-layout");
    this._viewId = getRandInt(1000, 9999);
    this._cells = [];
    this._pages = {};
    this._currentPage = null;
    this._selectedCell = null;
    this._ATTR_PAGE_ID = "data-lid";
    this._ATTR_GRID_ID = "data-gid";
    this._listener = {
        // Called when a placeholder enters the selected state.
        onPlaceholderSelected: function (placeholderKey, page) {},
        // Called when a placeholder exits the selected state.
        onPlaceholderDeselected: function (placeholderKey, page) {},
        // Called when a placeholder that is already selected is chosen again by the user.
        onPlaceholderReselected: function (placeholderKey, page) {}
    };

    // Create cells
    for (var i = 0; i < this._cellCount; i++) {
        var cell = new Cell(this);
        var len = this._cells.push(cell);
        cell._setPosition(len - 1);
        this._view.appendView( cell.getView() );
    }
}

GridCom.prototype.setListener = function (listener) {
    if (listener.hasOwnProperty("onPlaceholderSelected"))
        this._listener.onPlaceholderSelected = listener.onPlaceholderSelected;

    if (listener.hasOwnProperty("onPlaceholderDeselected"))
        this._listener.onPlaceholderDeselected = listener.onPlaceholderDeselected;

    if (listener.hasOwnProperty("onPlaceholderReselected"))
        this._listener.onPlaceholderReselected = listener.onPlaceholderReselected;

    return this;
};

GridCom.prototype.newPage = function (pageKey) {
    return new Page(this, pageKey);
};

GridCom.prototype.addPage = function (page) {
    if (this.hasPage(page.getKey())) {
        console.warn(`The page key MUST be unique: ${page.getKey()}`);
        return;
    }

    this._pages[page.getKey()] = page;
};

GridCom.prototype.hasPage = function (pageKey) {
    return this._pages.hasOwnProperty(pageKey);
};

GridCom.prototype.getCurrentPageKey = function () {
    return this._currentPage.getKey();
};

GridCom.prototype.getSelectedPlaceholderKey = function () {
    return this._currentPage.getSelectedPlaceholderKey();
};

GridCom.prototype.switchToPage = function (pageKey) {
    if (!this.hasPage(pageKey)) {
        console.warn("There is not any page with '" + pageKey + "' key.");
        return;
    }

    // If the same page selected again
    if (null !== this._currentPage && this._currentPage.getKey() === pageKey)
        return;

    this._currentPage = this._pages[pageKey];
    this.updateView();
};

GridCom.prototype.selectPagePlaceholder = function (position) {
    if (null === this._currentPage) return;

    if (position < 0 || position >= this._currentPage.countPlaceholders()) {
        return;
    }

    const placeholderKey = this._currentPage.getPlaceholderKeyAt(position);

    if (this._currentPage.getSelectedPosition() === position) {
        this._listener.onPlaceholderReselected(
            placeholderKey,
            this.getCurrentPageKey());
        return;
    }

    const prevSelectedPosition = this._currentPage.getSelectedPosition();
    this._currentPage.setPlaceholderSelectedAt(position);
    this.updateView();

    if (prevSelectedPosition >= 0) {
        const prevPlaceholderKey = this._currentPage.getPlaceholderKeyAt(prevSelectedPosition);
        this._listener.onPlaceholderDeselected(
            prevPlaceholderKey,
            this.getCurrentPageKey());
    }

    this._listener.onPlaceholderSelected(
        placeholderKey,
        this.getCurrentPageKey());
};

GridCom.prototype.setPagePlaceholderSelected = function (pageKey, placeholderKey) {
    if (!this.hasPage(pageKey)) {
        console.warn(`Invalid page key: ${pageKey}`);
        return;
    }

    this._pages[pageKey].setPlaceholderSelected(placeholderKey);
};

GridCom.prototype.updateView = function () {
    if (null === this._currentPage)
        return;

    const currentCell = this._selectedCell;
    const cellPos = null !== this._selectedCell ? this._selectedCell.getPosition() : -1;
    const placeholderPosition = this._currentPage.getSelectedPosition();

    // Update page attribute
    if (this._currentPage.getKey() !== this.getElement().getAttribute(this._ATTR_PAGE_ID))
        this.getElement().setAttribute(this._ATTR_PAGE_ID, this._currentPage.getKey());

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
        currentCell.getView().setSelected(placeholderPosition >= 0 && placeholderPosition === cellPos);
};

GridCom.prototype.render = function () {
    const cellMargin = 1;
    const cellSize = (100 / this._columns) - (cellMargin * 2);

    this.getElement().setAttribute(this._ATTR_GRID_ID, this._viewId);
    this._getStyle()._addRule(
        this._getStyleSelector() + " > *",
        {
            "width": cellSize + "%",
            "height": "0",
            "padding-top": cellSize + "%",
            "margin": cellMargin + "%"
        });

    for (const pageKey in this._pages) {
        const placeholders = this._pages[pageKey].getPlaceholders();
        for (const placeholder of Object.values(placeholders)) {
            const cellPosition = placeholder._cellPosition;

            this._getStyle()._addRule(
                this._getStyleSelector(pageKey) + ' '
                    + this._cells[cellPosition]._getStyleSelector(),
                "color" == placeholder._type
                    ? { "background-color": placeholder._value }
                    : { "background-image": 'url("' + placeholder._value + '");' }
            );
        }
    }

    return this.getElement();
};

GridCom.prototype.getCellCount = function () {
    return this._cellCount;
};

GridCom.prototype._selectCell = function (cell) {
    this.selectPagePlaceholder( cell.getPosition() );
};

GridCom.prototype._getStyleSelector = function (pageKey) {
    var selector = this._view.getStyleSelector()
        + '[' + this._ATTR_GRID_ID + '="' + this._viewId + '"]';

    if ("undefined" !== typeof pageKey)
        selector += '[' + this._ATTR_PAGE_ID + '="' + pageKey + '"]';

    return selector;
};

function Cell (parent)
{
    this._view = new View("li", "cell");
    this._parent = parent;
    this._position = -1;
    this._ATTR_POSITION = "data-pos";

    this._view.getElement().addEventListener(
        "click", () => this.select());
}

Cell.prototype._setPosition = function (position) {
    this._position = position;
    this._view.getElement().setAttribute(this._ATTR_POSITION, position);
};

Cell.prototype.select = function () {
    this._parent._selectCell(this);
};

Cell.prototype.getView = function () {
    return this._view;
};

Cell.prototype.getPosition = function () {
    return this._position;
};

Cell.prototype._getStyleSelector = function () {
    return this._view.getStyleSelector()
        + '[' + this._ATTR_POSITION + '="' + this._position + '"]';
};

function Page (parent, key)
{
    this._parent = parent;
    this._key = key;
    this._placeholders = [];
    this._placeholdersKeyMap = {};
    this._selectedPosition = -1;
}

Page.prototype._addPlaceholder = function (placeholder) {
    const placeholderKey = placeholder.getKey();

    if (undefined === placeholderKey || null === placeholderKey) {
        throw new Error(`Illegal Argument Exception: 'placeholderKey' MUST be defined. The placeholder value: ${placeholder._value}`);
    }

    if (this.countPlaceholders() >= this._parent.getCellCount()) {
        console.warn(
            "Could not add new placeholder to the page '" + this._key + "'.",
            "The total number of placeholders should be equal or less than "
            + this._parent.getCellCount() + ".");

        return this;
    }

    const len = this._placeholders.push(placeholder);
    placeholder._cellPosition = len - 1;
    this._placeholdersKeyMap[placeholderKey] = placeholder;

    return this;
};

Page.prototype._isInRangePosition = function (position) {
    return position >= 0 && position < this._placeholders.length;
};

Page.prototype.addImagePlaceholder = function (imageUrl, placeholderKey) {
    return this._addPlaceholder(
        new CellPlaceholder("image", imageUrl, placeholderKey)
    );
};

Page.prototype.addColorPlaceholder = function (colorCode, placeholderKey) {
    return this._addPlaceholder(
        new CellPlaceholder("color", colorCode, placeholderKey)
    );
};

Page.prototype.setPlaceholderSelectedAt = function (position) {
    this._selectedPosition = position;
};

Page.prototype.setPlaceholderSelected = function (placeholderKey) {
    const placeholder = this._placeholdersKeyMap[placeholderKey];
    if (!placeholder) {
        console.warn(`No placeholder found with key '${placeholderKey}' in page '${this._key}'`);
        return;
    }
    this._selectedPosition = placeholder._cellPosition;
};

Page.prototype.getSelectedPosition = function () {
    return this._selectedPosition;
};

Page.prototype.getPlaceholderAt = function (position) {
    if (!this._isInRangePosition(position)) {
        return null;
    }
    return this._placeholders[position];
};

Page.prototype.getPlaceholderByKey = function (placeholderKey) {
    return this._placeholdersKeyMap[placeholderKey];
};

Page.prototype.getPlaceholderKeyAt = function (position) {
    const placeholder = this.getPlaceholderAt(position);
    if (!placeholder) {
        return null;
    }
    return placeholder.getKey();
};

Page.prototype.getSelectedPlaceholderKey = function () {
    return this.getPlaceholderKeyAt(this._selectedPosition);
};

Page.prototype.getKey = function () {
    return this._key;
};

Page.prototype.getPlaceholders = function () {
    return this._placeholdersKeyMap;
};

Page.prototype.countPlaceholders = function () {
    return this._placeholders.length;
};

class CellPlaceholder {
    constructor(type, value, key)
    {
        this._cellPosition = -1;
        this._type = type;
        this._value = value;
        this._key = key;
    }

    getKey() {
        return this._key;
    }
}

// GridCom extends UIComponent
Object.setPrototypeOf(GridCom.prototype, UIComponent.prototype);

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

export default function GridCom (columns, rows) {
    this._view = new View("ul", "grid-layout");
    this._columns = columns > 0 ? columns : 1;
    this._rows = rows > 0 ? rows : 1;
    this._gridId = getRandInt(1000, 9999);
    this._ATTR_PAGE = "data-page";
    this._ATTR_GRID_ID = "data-grid-id";
    this._cells = [];
    this._pages = {};
    this._currentPage = null;
    this._listener = {
        // Called when a cell enters the selected state.
        onCellSelected: function (position, PageKey) {},
        // Called when a cell exits the selected state.
        onCellDeselected: function (position, PageKey) {},
        // Called when a cell that is already selected is chosen again by the user.
        onCellReselected: function (position, PageKey) {}
    };

    this._view.getElement().setAttribute(
        this._ATTR_GRID_ID,
        this._gridId);

    this._createCells();
}

GridCom.prototype._createCells = function () {
    var cellCount = this._columns * this._rows;
    var cellSize = 100 / this._columns;

    for (var i = 0; i < cellCount; i++) {
        var cell = new Cell(this, cellSize);
        var len = this._cells.push(cell);            
        cell._position = len - 1;
        this._view.appendView(cell.getView());
    }
};

GridCom.prototype.createPage = function (pageKey, itemList) {
    if (0 == itemList.length) return;

    if (itemList.length > this._cells.length) {
        itemList = itemList.slice(0, this._cells.length);
        console.warn(
            "Could not handle items of the page '" + pageKey + "' properly.",
            "The total number of items should be equal or less than "
            + this._cells.length + ".");
    }

    this._pages[pageKey] = new Page(pageKey, itemList.length);
    var colorItemMode = "#" == itemList[0].charAt(0); // TODO improve color detection.

    if (colorItemMode)
        for (var i = 0; i < itemList.length; i++)
            this._cells[i]._putColorItem(pageKey, itemList[i]);
    else
        for (var i = 0; i < itemList.length; i++)
            this._cells[i]._putItem(pageKey, itemList[i]);
};

GridCom.prototype.gotoPage = function (pageKey) {
    if (! this._pages.hasOwnProperty(pageKey) ) {
        console.warn("The page key '" + pageKey + "' is not valid.");
        return;
    }

    if (this.hasSelectedCell())
        this._currentPage.selectedCell.getView().setSelected(false);

    if (this._pages[pageKey].hasSelectedCell())
        this._pages[pageKey].selectedCell.getView().setSelected(true);

    this._currentPage = this._pages[pageKey];
    this._view.getElement().setAttribute(this._ATTR_PAGE, pageKey);
};

GridCom.prototype._selectCell = function (cell) {
    if (! cell.isSelectable() ) return;

    if (cell.isSelected()) {
        this._listener.onCellReselected(
            cell.getPosition(),
            this._currentPage.key);
        return;
    }

    if (this.hasSelectedCell()) {
        this._currentPage.selectedCell.getView().setSelected(false);
        this._listener.onCellDeselected(
            this._currentPage.selectedCell.getPosition(),
            this._currentPage.key);
    }

    this._currentPage.selectedCell = cell;
    cell.getView().setSelected(true);
    this._listener.onCellSelected(
        cell.getPosition(),
        this._currentPage.key);
};

GridCom.prototype.hasSelectedCell = function () {
    return null !== this._currentPage &&
        null !== this._currentPage.selectedCell;
};

GridCom.prototype.getSelectedCellPosition = function () {
    return this.hasSelectedCell() ?
        this._currentPage.selectedCell.getPosition() : -1;
};

GridCom.prototype.getCurrentItemsCount = function () {
    return null !== this._currentPage ?
        this._currentPage.itemsCount : 0;
};

GridCom.prototype.setListener = function (listener) {
    if (listener.hasOwnProperty("onCellSelected"))
        this._listener.onCellSelected = listener.onCellSelected;

    if (listener.hasOwnProperty("onCellDeselected"))
        this._listener.onCellDeselected = listener.onCellDeselected;

    if (listener.hasOwnProperty("onCellReselected"))
        this._listener.onCellReselected = listener.onCellReselected;

    return this;
};

GridCom.prototype._getFullStyleSelector = function (pageKey) {
    var selector = this._getStyleSelector()
        + '[' + this._ATTR_GRID_ID + '="' + this._gridId + '"]';

    if ("undefined" !== typeof pageKey)
        selector += '[' + this._ATTR_PAGE + '="' + pageKey + '"]';

    return selector;
};

function Cell (parent, size) {
    this._view = new View("li", "cell");
    this._parent = parent;
    this._size = size;
    this._INVALID_POSITION = -1;
    this._position = this._INVALID_POSITION;

    this._view.getElement().addEventListener(
        "click",
        (function () { this.select(); }).bind(this)
    );

    this._setStyle();
}

Cell.prototype._setStyle = function () {
    var selector = this._getStyleSelector();

    if ( this._parent._hasStyleRule(selector) ) return;

    var margin = 1; // percentage
    var newSize = this._size - (margin * 2);
    this._parent._addStyleRule(selector, {
        "width": newSize + "%",
        "height": "0",
        "padding-top": newSize + "%",
        "margin": margin + "%"
    });
};

Cell.prototype.select = function () {
    this._parent._selectCell(this);
};

Cell.prototype.getPosition = function () {
    return this._position;
};

Cell.prototype.isSelected = function () {
    return this._INVALID_POSITION !== this._position &&
        this._parent.getSelectedCellPosition() === this._position;
};

Cell.prototype.isSelectable = function () {
    return this._position !== this._INVALID_POSITION &&
        this._position < this._parent.getCurrentItemsCount();
};

Cell.prototype._putItem = function (pageKey, imageUrl) {
    this._parent._addStyleRule(this._getCellSelector(pageKey), {
        "background-image": 'url("' + imageUrl + '");'
    });
};

Cell.prototype._putColorItem = function (pageKey, color) {
    this._parent._addStyleRule(this._getCellSelector(pageKey), {
        "background-color": color
    });
};

Cell.prototype._getStyleSelector = function () {
    return this._parent._getFullStyleSelector()
        + " ." + this._view.getClass();
};

Cell.prototype._getCellSelector = function (pageKey) {
    var child = 1 + this._position;
    return this._parent._getFullStyleSelector(pageKey)
        + " ." + this._view.getClass()
        + ":nth-child(" + child + ")";
};

Cell.prototype.getView = function () {
    return this._view;
};

function Page (key, itemsCount) {
    this.key = key;
    this.itemsCount = itemsCount;
    this.selectedCell = null;

    this.hasSelectedCell = function () {
        return null !== this.selectedCell;
    };
}

// GridCom extends UIComponent
Object.setPrototypeOf(GridCom.prototype, UIComponent.prototype);

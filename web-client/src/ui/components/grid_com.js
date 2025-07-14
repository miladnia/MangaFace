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
    this._itemsLimit = this._rows * this._columns;
    this._view = new View("ul", "grid-layout");
    this._viewId = getRandInt(1000, 9999);
    this._cells = [];
    this._sections = {};
    this._selectedSection = null;
    this._selectedCell = null;
    this._frozenView = false;
    this._ATTR_SECTION_ID = "data-lid";
    this._ATTR_GRID_ID = "data-gid";
    this._listener = {
        // Called when a item enters the selected state.
        onItemSelected: function (position, section) {},
        // Called when a item exits the selected state.
        onItemDeselected: function (position, section) {},
        // Called when a item that is already selected is chosen again by the user.
        onItemReselected: function (position, section) {}
    };

    // Create cells
    for (var i = 0; i < this._itemsLimit; i++) {
        var cell = new Cell(this);
        var len = this._cells.push(cell);
        cell._setPosition(len - 1);
        this._view.appendView( cell.getView() );
    }
}

GridCom.prototype.setListener = function (listener) {
    if (listener.hasOwnProperty("onItemSelected"))
        this._listener.onItemSelected = listener.onItemSelected;

    if (listener.hasOwnProperty("onItemDeselected"))
        this._listener.onItemDeselected = listener.onItemDeselected;

    if (listener.hasOwnProperty("onItemReselected"))
        this._listener.onItemReselected = listener.onItemReselected;

    return this;
};

GridCom.prototype.newSection = function (sectionId) {
    return new Section(this, sectionId);
};

GridCom.prototype.addSection = function (section) {
    if (this._sections.hasOwnProperty(section.getId())) {
        console.warn("A section with '" + section.getId() + "' ID already exist.");
        return;
    }

    this._sections[section.getId()] = section;
};

GridCom.prototype.switchToSection = function (sectionId) {
    if (! this._sections.hasOwnProperty(sectionId) ) {
        console.warn("There is not any section with '" + sectionId + "' ID.");
        return;
    }

    // If the same section selected again
    if (null !== this._selectedSection && this._selectedSection.getId() === sectionId)
        return;

    this._selectedSection = this._sections[sectionId];
    this.updateView();
};

GridCom.prototype.selectItem = function (position) {
    if (null === this._selectedSection) return;

    if (position < 0 || position >= this._selectedSection.countItems())
        return;

    if (this._selectedSection.getSelectedItemPosition() === position) {
        this._listener.onItemReselected(position, this._selectedSection);
        return;
    }

    var currentItemPosition = this._selectedSection.getSelectedItemPosition();
    this._selectedSection.setItemSelected(position);
    this.updateView();

    if (currentItemPosition >= 0)
        this._listener.onItemDeselected(currentItemPosition, this._selectedSection);

    this._listener.onItemSelected(position, this._selectedSection);
};

GridCom.prototype.updateView = function () {
    if (this._frozenView || null === this._selectedSection)
        return;

    var currentCell = this._selectedCell;
    var cellPos = null !== this._selectedCell ? this._selectedCell.getPosition() : -1;
    var itemPos = this._selectedSection.getSelectedItemPosition();

    // Update section attribute
    if (this._selectedSection.getId() !== this.getElement().getAttribute(this._ATTR_SECTION_ID))
        this.getElement().setAttribute(this._ATTR_SECTION_ID, this._selectedSection.getId());

    // If the section has not any selected item yet
    // or the item has deselected.
    if (itemPos < 0) {
        this._selectedCell = null;
    } else if (itemPos !== cellPos) {
        var cell = this._cells[itemPos];
        cell.getView().setSelected(true);
        this._selectedCell = cell;
    }

    if (null !== currentCell)
        currentCell.getView().setSelected(itemPos >= 0 && itemPos === cellPos);
};

GridCom.prototype.freezeView = function (frozen) {
    this._frozenView = "undefined" === typeof frozen ? true : frozen;

    if (! this._frozenView )
        this.updateView();

    return this;
};

GridCom.prototype.render = function () {
    var cellMargin = 1;
    var cellSize = (100 / this._columns) - (cellMargin * 2);

    this.getElement().setAttribute(this._ATTR_GRID_ID, this._viewId);
    this._getStyle()._addRule(
        this._getStyleSelector() + " > *",
        {
            "width": cellSize + "%",
            "height": "0",
            "padding-top": cellSize + "%",
            "margin": cellMargin + "%"
        });

    for (var sectionId in this._sections) {
        this._sections[sectionId].getItems().forEach((item) => {
            var cellPos = item._position;

            this._getStyle()._addRule(
                this._getStyleSelector(sectionId) + ' '
                    + this._cells[cellPos]._getStyleSelector(),
                "color" == item._type
                    ? { "background-color": item._value }
                    : { "background-image": 'url("' + item._value + '");' }
            );
        });
    }

    return this.getElement();
};

GridCom.prototype.getItemsLimit = function () {
    return this._itemsLimit;
};

GridCom.prototype._selectCell = function (cell) {
    if (this._frozenView) return;

    this.selectItem( cell.getPosition() );
};

GridCom.prototype._getStyleSelector = function (sectionId) {
    var selector = this._view.getStyleSelector()
        + '[' + this._ATTR_GRID_ID + '="' + this._viewId + '"]';

    if ("undefined" !== typeof sectionId)
        selector += '[' + this._ATTR_SECTION_ID + '="' + sectionId + '"]';

    return selector;
};

function Cell (parent)
{
    this._view = new View("li", "cell");
    this._parent = parent;
    this._position = -1;
    this._ATTR_POSITION = "data-pos";

    this._view.getElement().addEventListener(
        "click", (function () { this.select(); }).bind(this));
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

function Section (parent, id)
{
    this._parent = parent;
    this._id = id;
    this._items = [];
    this._selectedItemPosition = -1;
}

Section.prototype._addItem = function (item) {
    if (this.countItems() >= this._parent.getItemsLimit()) {
        console.warn(
            "Could not add new item to section '" + this._id + "'.",
            "The total number of items should be equal or less than "
            + this._parent.getItemsLimit() + ".");

        return;
    }

    var len = this._items.push(item);
    item._position = len - 1;

    return this;
};

Section.prototype.addImageItem = function (imageUrl, tag) {
    return this._addItem( new CellItem("image", imageUrl, tag) );
};

Section.prototype.addColorItem = function (colorCode, tag) {
    return this._addItem( new CellItem("color", colorCode, tag) );
};

Section.prototype.setItemSelected = function (position) {
    this._selectedItemPosition = position;
};

Section.prototype.getSelectedItemPosition = function () {
    return this._selectedItemPosition;
};

Section.prototype.getItemAt = function (position) {
    return this._items[position];
};

Section.prototype.getId = function () {
    return this._id;
};

Section.prototype.getItems = function () {
    return this._items;
};

Section.prototype.countItems = function () {
    return this._items.length;
};

function CellItem (type, value, tag)
{
    this._position = -1;
    this._type = type;
    this._value = value;
    this._tag = tag;
}

CellItem.prototype.getTag = function () {
    return this._tag;
};

// GridCom extends UIComponent
Object.setPrototypeOf(GridCom.prototype, UIComponent.prototype);

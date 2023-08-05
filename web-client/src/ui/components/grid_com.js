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
    this._layers = {};
    this._selectedLayer = null;
    this._selectedCell = null;
    this._ATTR_LAYER_ID = "data-lid";
    this._ATTR_GRID_ID = "data-gid";
    this._listener = {
        // Called when a item enters the selected state.
        onItemSelected: function (position, layer) {},
        // Called when a item exits the selected state.
        onItemDeselected: function (position, layer) {},
        // Called when a item that is already selected is chosen again by the user.
        onItemReselected: function (position, layer) {}
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

GridCom.prototype.newLayer = function (layerId) {
    return new Layer(this, layerId);
};

GridCom.prototype.addLayer = function (layer) {
    if (this._layers.hasOwnProperty(layer.getId())) {
        console.warn("A layer with '" + layer.getId() + "' ID already exist.");
        return;
    }

    this._layers[layer.getId()] = layer;
};

GridCom.prototype.switchToLayer = function (layerId) {
    if (! this._layers.hasOwnProperty(layerId) ) {
        console.warn("There is not any layer with '" + layerId + "' ID.");
        return;
    }

    // If the same layer selected again
    if (null !== this._selectedLayer && this._selectedLayer.getId() === layerId)
        return;

    this._selectedLayer = this._layers[layerId];
    this.updateView();
};

GridCom.prototype.selectItem = function (position) {
    if (null === this._selectedLayer) return;

    if (position < 0 || position >= this._selectedLayer.countItems())
        return;

    if (this._selectedLayer.getSelectedItemPosition() === position) {
        this._listener.onItemReselected(position, this._selectedLayer);
        return;
    }

    var currentItemPosition = this._selectedLayer.getSelectedItemPosition();
    this._selectedLayer.setItemSelected(position);
    this.updateView();

    if (currentItemPosition >= 0)
        this._listener.onItemDeselected(currentItemPosition, this._selectedLayer);

    this._listener.onItemSelected(position, this._selectedLayer);
};

GridCom.prototype.updateView = function () {
    var currentCell = this._selectedCell;
    var cellPos = null !== this._selectedCell ? this._selectedCell.getPosition() : -1;
    var itemPos = this._selectedLayer.getSelectedItemPosition();

    // Update layer attribute
    if (this._selectedLayer.getId() !== this.getElement().getAttribute(this._ATTR_LAYER_ID))
        this.getElement().setAttribute(this._ATTR_LAYER_ID, this._selectedLayer.getId());

    // If the layer has not any selected item yet
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

    for (var layerId in this._layers) {
        this._layers[layerId].getItems().forEach((function (item) {
            var cellPos = item.position;

            this._getStyle()._addRule(
                this._getStyleSelector(layerId) + ' '
                    + this._cells[cellPos]._getStyleSelector(),
                item.colorMode
                    ? { "background-color": item.value }
                    : { "background-image": 'url("' + item.value + '");' }
            );
        }).bind(this));
    }

    return this.getElement();
};

GridCom.prototype.getItemsLimit = function () {
    return this._itemsLimit;
};

GridCom.prototype._selectCell = function (cell) {
    this.selectItem( cell.getPosition() );
};

GridCom.prototype._getStyleSelector = function (layerId) {
    var selector = this._view.getStyleSelector()
        + '[' + this._ATTR_GRID_ID + '="' + this._viewId + '"]';

    if ("undefined" !== typeof layerId)
        selector += '[' + this._ATTR_LAYER_ID + '="' + layerId + '"]';

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

function Layer (parent, id)
{
    this._parent = parent;
    this._id = id;
    this._items = [];
    this._selectedItemPosition = -1;
}

Layer.prototype._addItem = function (item) {
    if (this.countItems() >= this._parent.getItemsLimit()) {
        console.warn(
            "Could not add new item to layer '" + this._id + "'.",
            "The total number of items should be equal or less than "
            + this._parent.getItemsLimit() + ".");

        return;
    }

    var len = this._items.push(item);
    item.position = len - 1;

    return this;
};

Layer.prototype.addImageItem = function (imageUrl) {
    return this._addItem( new CellItem(imageUrl, false) );
};

Layer.prototype.addColorItem = function (color) {
    return this._addItem( new CellItem(color, true) );
};

Layer.prototype.setItemSelected = function (position) {
    this._selectedItemPosition = position;
};

Layer.prototype.getSelectedItemPosition = function () {
    return this._selectedItemPosition;
};

Layer.prototype.getId = function () {
    return this._id;
};

Layer.prototype.getItems = function () {
    return this._items;
};

Layer.prototype.countItems = function () {
    return this._items.length;
};

function CellItem (value, colorMode)
{
    this.position = -1;
    this.value = value;
    this.colorMode = colorMode;
}

// GridCom extends UIComponent
Object.setPrototypeOf(GridCom.prototype, UIComponent.prototype);

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { UIComponent, View } from "../ui.js";

export default function PinboardCom() {
    this._view = new View("div", "pinboard-layout");
    this._items = {};
}

PinboardCom.prototype.newItem = function () {
    return new Item();
};

PinboardCom.prototype.pinItem = function (itemKey, item) {
    this._items[itemKey] = item;
    this._view.appendView(item.getView());
};

PinboardCom.prototype.getItem = function (itemKey) {
    return this._items.hasOwnProperty(itemKey) ? this._items[itemKey] : null;
};

function Item () {
    this._view = new View("img", "item");
};

Item.prototype.setImageUrl = function (imageUrl) {
    this._view.getElement().setAttribute("src", imageUrl);
    return this;
};

Item.prototype.setPosition = function (top, left) {
    this._view.getElement().style.top = top;
    this._view.getElement().style.left = left;
    return this;
};

Item.prototype.setPriority = function (priority) {
    this._view.getElement().style.zIndex = priority;
    return this;
};

Item.prototype.getView = function () {
    return this._view;
};

// PinboardCom extends UIComponent
Object.setPrototypeOf(PinboardCom.prototype, UIComponent.prototype);

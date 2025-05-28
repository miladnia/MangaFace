/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export function UIComponent () {}

UIComponent.prototype._view = null;
UIComponent.prototype._style = null;

UIComponent.prototype.getView = function () {
    return this._view;
};

UIComponent.prototype.getElement = function () {
    return null !== this._view ? this._view.getElement() : null;
};

UIComponent.prototype._getStyle = function () {
    if (null === this._style)
        this._style = new Style();

    return this._style;
};

export function Style () {
    this._element = null;
}

Style.prototype._init = function () {
    // Just add a `<style>` element to the document,
    // `CSSStyleSheet()` constructor
    // and `Document.adoptedStyleSheets`
    // are not compatible with older browsers.
    this._element = document.createElement("style");
    document.head.appendChild(this._element);
};

Style.prototype._addRule = function (selector, properties) {
    if (null === this._element)
        this._init();

    var propStr = "";

    for (var prop in properties)
        propStr += prop + ": " + properties[prop] + ";";

    var rule = selector + "{" + propStr + "}";
    this._element.sheet.insertRule(rule, this._element.sheet.cssRules.length);
};

export function View (tagName, className) {
    this._element = document.createElement(tagName);
    this._element.classList.add(className);
    this._className = className;
}

View.prototype.getElement = function () {
    return this._element;
};

View.prototype.setText = function (text) {
    this._element.textContent = text;
    return this;
};

View.prototype.addText = function (text) {
    var newText = document.createTextNode(text);
    this._element.appendChild(newText);
    return this;
};

View.prototype.hide = function () {
    return this.setVisible(false);
};

View.prototype.show = function () {
    return this.setVisible(true);
};

View.prototype.setVisible = function (visible) {
    if (visible)
        this._element.style.removeProperty("display");
    else
        this._element.style.setProperty("display", "none");

    return this;
};

View.prototype.setSelected = function (selected) {
    if (selected)
        this._element.setAttribute("data-selected", "");
    else
        this._element.removeAttribute("data-selected");

    return this;
};

View.prototype.getStyleSelector = function () {
    return '.' + this._className;
};

View.prototype.append = function (element) {
    this._element.appendChild(element);
};

View.prototype.appendView = function (view) {
    this.append( view.getElement() );
};

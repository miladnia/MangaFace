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
UIComponent.prototype._styleSheet = null;

UIComponent.prototype.getView = function () {
    return this._view;
};

/**
 * Create a <style> element to define CSS rules dynamically.
 */
UIComponent.prototype._createStyleSheet = function () {
    // Just add a `<style>` element to the document,
    // `CSSStyleSheet()` constructor
    // and `Document.adoptedStyleSheets`
    // are not compatible with older browsers.
    var style = document.createElement("style");
    document.head.appendChild(style);
    return style.sheet;
};

UIComponent.prototype._addStyleRule = function (selector, properties) {
    if (null === this._styleSheet) {
        this._styleSheet = this._createStyleSheet();
    }

    var propStr = "";

    for (var prop in properties) {
        propStr += prop + ": " + properties[prop] + ";";
    }

    var rule = selector + "{" + propStr + "}";
    this._styleSheet.insertRule(rule, this._styleSheet.cssRules.length);
};

UIComponent.prototype._hasStyleRule = function (selector) {
    if (null === this._styleSheet) {
        return false;
    }

    for (var i = 0; i < this._styleSheet.cssRules.length; i++) {
        if (selector === this._styleSheet.cssRules[i].selectorText) {
            return true;
        }
    }

    return false;
};

UIComponent.prototype._getStyleSelector = function () {
    if (null === this._view) {
        return null;
    }

    return "." + this._view.getClass();
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

View.prototype.getClass = function () {
    return this._className;
};

View.prototype.appendView = function (view) {
    this._element.appendChild( view.getElement() );
};

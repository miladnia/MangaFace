/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class UIComponent {
    _view = null;
    _style = null;

    constructor(tagName, className) {
        this._view = new View(tagName, className);
    }

    getView() {
        return this._view;
    }

    getElement() {
        return null !== this._view ? this._view.getElement() : null;
    }

    _getStyle() {
        if (null === this._style)
            this._style = new Style();

        return this._style;
    }
}


export class Style {
    _element = null;

    _init() {
        // Just add a `<style>` element to the document,
        // `CSSStyleSheet()` constructor
        // and `Document.adoptedStyleSheets`
        // are not compatible with older browsers.
        this._element = document.createElement("style");
        document.head.appendChild(this._element);
    }

    _addRule(selector, properties) {
        if (null === this._element)
            this._init();

        var propStr = "";

        for (var prop in properties)
            propStr += prop + ": " + properties[prop] + ";";

        var rule = selector + "{" + propStr + "}";
        this._element.sheet.insertRule(rule, this._element.sheet.cssRules.length);
    }
}


export class View {
    constructor(tagName, className) {
        this._element = document.createElement(tagName);
        this._element.classList.add(className);
        this._className = className;
    }

    getElement() {
        return this._element;
    }

    setText(text) {
        this._element.textContent = text;
        return this;
    }

    addText(text) {
        var newText = document.createTextNode(text);
        this._element.appendChild(newText);
        return this;
    }

    hide() {
        return this.setVisible(false);
    }

    show() {
        return this.setVisible(true);
    }

    setVisible(visible) {
        if (visible)
            this._element.style.removeProperty("display");
        else
            this._element.style.setProperty("display", "none");

        return this;
    }

    setSelected(selected) {
        if (selected)
            this._element.setAttribute("data-selected", "");
        else
            this._element.removeAttribute("data-selected");

        return this;
    }

    getStyleSelector() {
        return '.' + this._className;
    }

    append(element) {
        this._element.appendChild(element);
    }

    appendView(view) {
        this.append( view.getElement() );
    }
}

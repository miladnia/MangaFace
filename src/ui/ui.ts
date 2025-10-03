type HtmlTag = keyof HTMLElementTagNameMap;

export class UIComponent<T extends HtmlTag> {
  _view: View<T>;
  _style: Style | null = null;

  constructor(tagName: T, className: string) {
    this._view = new ViewElement(tagName, className);
  }

  getView(): View<T> {
    return this._view;
  }

  getElement(): HTMLElement {
    return this._view.getElement();
  }

  _getStyle() {
    this._style ??= new Style();
    return this._style;
  }
}

export class Style {
  #element: HTMLStyleElement | null = null;

  #createStyleElement(): HTMLStyleElement {
    // Just add a `<style>` element to the document,
    // `CSSStyleSheet()` constructor
    // and `Document.adoptedStyleSheets`
    // are not compatible with older browsers.
    const element = document.createElement('style');
    document.head.appendChild(element);
    return element;
  }

  addRule(selector: string, properties: Record<string, string>) {
    this.#element ??= this.#createStyleElement();

    let propStr = '';

    for (const prop in properties) {
      propStr += `${prop}: ${properties[prop]};`;
    }

    const rule = `${selector} { ${propStr} }`;
    this.#element.sheet?.insertRule(rule, this.#element.sheet.cssRules.length);
  }
}

export interface BaseView<T extends HtmlTag> {
  getElement(): HTMLElementTagNameMap[T];
}

export interface ContainerView<T extends HtmlTag> extends BaseView<T> {
  append(element: HTMLElement): void;
  appendView(view: BaseView<HtmlTag>): void;
}

export type Container = ContainerView<'div'>;

export interface View<T extends HtmlTag> extends ContainerView<T> {
  setText(text: string): void;
  addText(text: string): void;
  hide(): void;
  show(): void;
  setVisible(visible: boolean): void;
  setSelected(selected: boolean): void;
  getStyleSelector(): void;
}

export class ViewElement<T extends HtmlTag> implements View<T> {
  _element: HTMLElementTagNameMap[T];
  _className: string;

  constructor(tagName: T, className: string) {
    this._element = document.createElement(tagName);
    this._element.classList.add(className);
    this._className = className;
  }

  getElement(): HTMLElementTagNameMap[T] {
    return this._element;
  }

  setText(text: string) {
    this._element.textContent = text;
    return this;
  }

  addText(text: string) {
    const newText = document.createTextNode(text);
    this._element.appendChild(newText);
    return this;
  }

  hide() {
    return this.setVisible(false);
  }

  show() {
    return this.setVisible(true);
  }

  setVisible(visible: boolean) {
    if (visible) this._element.style.removeProperty('display');
    else this._element.style.setProperty('display', 'none');

    return this;
  }

  setSelected(selected: boolean) {
    if (selected) this._element.setAttribute('data-selected', '');
    else this._element.removeAttribute('data-selected');

    return this;
  }

  getStyleSelector() {
    return '.' + this._className;
  }

  append(element: HTMLElement) {
    this._element.appendChild(element);
  }

  appendView(view: View<HtmlTag>) {
    this.append(view.getElement());
  }
}

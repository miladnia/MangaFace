import { ViewElement, type Container } from "@ui/ui";

export class DesignerScreenTemplate {
  #tpl: Container;
  #container: Container;
  commandNavigatorContainer: Container;
  navOptionsContainer: Container;
  assetGridFrame: Container;
  canvasFrame: Container;
  colorGridFrame: Container;

  constructor() {
    this.#tpl = new ViewElement("div", "designer-screen");
    this.#container = this._createElement("designer-screen-container", this.#tpl);
    this.canvasFrame = this._createElement("canvas-frame");
    const commandPanel = this._createElement("command-panel");
    this.colorGridFrame = this._createElement("color-grid-frame", commandPanel);
    this.assetGridFrame = this._createElement("asset-grid-frame", commandPanel);
    const navContainer = this._createElement("command-navigator");
    this.navOptionsContainer = this._createElement(
      "options-frame",
      navContainer
    );
    this.commandNavigatorContainer = this._createElement(
      "navigators-frame",
      navContainer
    );
  }

  _createElement(className: string, parent?: Container) {
    const frame = new ViewElement("div", className);

    if (parent) parent.appendView(frame);
    else this.#container.appendView(frame);

    return frame;
  }

  getView() {
    return this.#tpl;
  }
}

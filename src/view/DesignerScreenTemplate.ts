import { ViewElement, type Container } from '@ui/ui';

export class DesignerScreenTemplate {
  #template: Container;
  #container: Container;
  navOptionsContainer: Container;
  commandNavigatorContainer: Container;
  assetGridContainer: Container;
  controlsFrame: Container;
  previewFrame: Container;
  colorGridContainer: Container;

  constructor() {
    this.#template = new ViewElement('div', 'mf-designer-screen-tpl');
    this.#container = new ViewElement('div', 'designer-container');
    this.#template.appendView(this.#container);
    this.controlsFrame = this._createFrame('preview-frame');
    this.previewFrame = this._createFrame('canvas-frame', this.controlsFrame);
    const commandPanel = this._createFrame('command-panel-frame');
    this.colorGridContainer = this._createFrame('color-grid', commandPanel);
    this.assetGridContainer = this._createFrame('asset-grid', commandPanel);
    this.commandNavigatorContainer = this._createFrame('command-navigator');
    this.navOptionsContainer = this._createFrame('navigator-options');
  }

  _createFrame(classPrefix: string, parent?: Container) {
    const frame = new ViewElement('div', classPrefix);

    if (parent) parent.appendView(frame);
    else this.#container.appendView(frame);

    return frame;
  }

  getView() {
    return this.#template;
  }
}

import { ViewElement } from '../ui/ui';
import type { Container } from '../ui/ui';

export class DesignerScreenTemplate {
  #template: Container;
  #container: Container;
  sectionsFrame: Container;
  designersFrame: Container;
  shapesFrame: Container;
  controlsFrame: Container;
  previewFrame: Container;
  colorsFrame: Container;

  constructor() {
    this.#template = new ViewElement('div', 'mf-designer-screen-tpl');
    this.#container = new ViewElement('div', 'designer-container');
    this.#template.appendView(this.#container);
    this.controlsFrame = this._createFrame('preview');
    this.previewFrame = this._createFrame('canvas', this.controlsFrame);
    const commandPanel = this._createFrame('command-panel');
    this.colorsFrame = this._createFrame('colors', commandPanel);
    this.shapesFrame = this._createFrame('shapes', commandPanel);
    this.designersFrame = this._createFrame('res');
    this.sectionsFrame = this._createFrame('cat');
  }

  _createFrame(classPrefix: string, parent?: Container) {
    const frame = new ViewElement('div', classPrefix + '-frame');

    if (parent) parent.appendView(frame);
    else this.#container.appendView(frame);

    return frame;
  }

  getView() {
    return this.#template;
  }
}

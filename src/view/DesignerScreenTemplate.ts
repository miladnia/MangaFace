import { View } from "../ui/ui";

export class DesignerScreenTemplate {
    #template: View;
    #container: View;
    sectionsFrame: View;
    designersFrame: View;
    shapesFrame: View;
    controlsFrame: View;
    previewFrame: View;
    colorsFrame: View;

    constructor() {
        this.#template = new View("div", "mf-designer-screen-tpl");
        this.#container = new View("div", "designer-container");
        this.#template.appendView(this.#container);
        this.controlsFrame = this._createFrame("preview");
        this.previewFrame = this._createFrame("canvas", this.controlsFrame);
        const commandPanel = this._createFrame("command-panel");
        this.colorsFrame = this._createFrame("colors", commandPanel);
        this.shapesFrame = this._createFrame("shapes", commandPanel);
        this.designersFrame = this._createFrame("res");
        this.sectionsFrame = this._createFrame("cat");
    }

    _createFrame(classPrefix: string, parent?: View) {
        var frame = new View("div", classPrefix + "-frame");

        if (parent)
            parent.appendView(frame);
        else
            this.#container.appendView(frame);

        return frame;
    }

    getView() {
        return this.#template;
    }
}

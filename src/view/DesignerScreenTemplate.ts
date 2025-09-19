import { View } from "../ui/ui.js";

export class DesignerScreenTemplate {
    #container: View;
    sectionsFrame: View;
    designersFrame: View;
    shapesFrame: View;
    controlsFrame: View;
    previewFrame: View;
    colorsFrame: View;

    constructor() {
        this.#container = new View("div", "mf-designer-screen-tpl");
        this.sectionsFrame = this._createFrame("cat");
        this.designersFrame = this._createFrame("res");
        this.shapesFrame = this._createFrame("shapes");
        this.controlsFrame = this._createFrame("controls");
        this.previewFrame = this._createFrame("preview", this.controlsFrame);
        this.colorsFrame = this._createFrame("colors", this.controlsFrame);
    }

    _createFrame(classPrefix: string, parent?: View) {
        var frame = new View("div", classPrefix + "-frame");

        if ("undefined" != typeof parent)
            parent.appendView(frame);
        else
            this.#container.appendView(frame);

        return frame;
    }

    getView() {
        return this.#container;
    }
}

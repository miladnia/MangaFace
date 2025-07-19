import { View } from "../ui/ui.js";


export class DesignerScreenTemplate {
    constructor() {
        this._container = new View("div", "mf-designer-screen-tpl");
        this.sectionsFrame = this._createFrame("cat");
        this.designersFrame = this._createFrame("res");
        this.shapesFrame = this._createFrame("shapes");
        this.controlsFrame = this._createFrame("controls");
        this.previewFrame = this._createFrame("preview", this.controlsFrame);
        this.colorsFrame = this._createFrame("colors", this.controlsFrame);
    }

    _createFrame(classPrefix, parent) {
        var frame = new View("div", classPrefix + "-frame");

        if ("undefined" != typeof parent)
            parent.appendView(frame);
        else
            this._container.appendView(frame);

        return frame;
    }

    getView() {
        return this._container;
    }
}

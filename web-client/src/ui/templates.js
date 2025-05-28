/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { View } from "./ui.js";

export function DesignerScreenTemplate() {
    this._container = new View("div", "mf-designer-screen-tpl");
    this.sectionsFrame = this._createFrame("cat");
    this.designersFrame = this._createFrame("res");
    this.shapesFrame = this._createFrame("shapes");
    this.controlsFrame = this._createFrame("controls");
    this.previewFrame = this._createFrame("preview", this.controlsFrame);
    this.colorsFrame = this._createFrame("colors", this.controlsFrame);
}

DesignerScreenTemplate.prototype._createFrame = function (classPrefix, parent) {
    var frame = new View("div", classPrefix + "-frame");

    if ("undefined" != typeof parent)
        parent.appendView(frame);
    else
        this._container.appendView(frame);

    return frame;
};

DesignerScreenTemplate.prototype.getView = function () {
    return this._container;
};

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
    this.catSection = this._createSection("cat");
    this.resSection = this._createSection("res");
    this.shapesSection = this._createSection("shapes");
    this.controlsSection = this._createSection("controls");
    this.previewSection = this._createSection("preview", this.controlsSection);
    this.colorsSection = this._createSection("colors", this.controlsSection);
}

DesignerScreenTemplate.prototype._createSection = function (classPrefix, parent) {
    var section = new View("div", classPrefix + "-section");

    if ("undefined" != typeof parent)
        parent.appendView(section);
    else
        this._container.appendView(section);

    return section;
};

DesignerScreenTemplate.prototype.getView = function () {
    return this._container;
};

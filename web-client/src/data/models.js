/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export function ScreenSection() {
    this.label = null;
    this.coverUrl = null;
    this.designers = [];
}

export function Designer() {
    this.label = null;
    this.commandName = null;
    this.previewUrl = null;
}

export function Command() {
    this.name = null;
    this.limit = null;
    this.colorPalette = [];
}

export function Color() {
    this.colorCode = null;
}

export function Resource(id, label, catLabel) {
    this.id = id;
    this.label = label;
    this.catLabel = catLabel;
    this.shapesRange = null;
    this.colors = [];
    this.movementLimit = 0;
    this.fragments = [];
    this.shapeIconUrl = null;
}

Resource.prototype.getShapeIconUrl = function (shapeName) {
    return this.shapeIconUrl.replace("<shape_name>", shapeName);
};

export function ShapeType(name, iconUrl) {
    this.name = name;
    this.iconUrl = iconUrl;
}

export function Fragment(parentResource, position, colorGroup, priority, url) {
    this.parentResource = parentResource; // TODO It's new! check if required.
    this.position = position;
    this.colorGroup = colorGroup;
    this.priority = priority;
    this.url = url;
}

Fragment.prototype.getUrl = function (shapeName, color) {
    // FIXME
    // color = this.parentResource.colors.length ? this.parentResource.colors[0].dir : '';

    return this.url.replace("<shape_name>", shapeName)
        .replace("<color::dir>", color.dir);
};

export function Rule() {
    this.shape
}

function OldColor(codename, dir, colorCode) {
    this.codename = codename;
    this.dir = dir;
    this.code = colorCode;
}

export function Position(top, left) {
    this.top = top;
    this.left = left;
}

export function Range(min, max) {
    this.min = min;
    this.max = max;
}

export function Layout() {
    this.assets = null;
}

export function Asset() {
    this.fragment = null;
    this.codename = null;
    this.filename = null;
    this.color = null;
    this.distance = 0;
}

Asset.prototype.getUrl = function () {
    return this.fragment.url
        .replace("<shape_name>", this.filename)
        .replace("<color::dir>", this.color.dir);
};

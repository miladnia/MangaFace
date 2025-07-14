/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class ScreenSection {
    constructor({ label, coverUrl }) {
        this.label = label;
        this.coverUrl = coverUrl;
        this.designers = [];
    }
}

export class Designer {
    constructor({ label, commandName, previewUrl }) {
        this.label = label;
        this.commandName = commandName;
        this._previewUrl = previewUrl;
    }

    getPreviewUrl(option) {
        return this._previewUrl.replace("<OPTION>", option);
    }
}

export class Command {
    constructor({ name, items }) {
        this.name = name;
        this.items = items;
        this.colorPalette = [];
    }
}

export class Color {
    constructor({ colorCode }) {
        this.colorCode = colorCode;
    }
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
    // TODO `parentResource`: It's new! check if required.
    this.parentResource = parentResource;
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

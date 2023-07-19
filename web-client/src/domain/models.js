/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

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

Resource.prototype.getShapesIconList = function () {
    var urlList = [];

    for (var name = this.shapesRange.min; name <= this.shapesRange.max; name++)
        urlList.push( this.shapeIconUrl.replace("<shape_name>", name) );

    return urlList;
};

export function ShapeType(name, iconUrl) {
    this.name = name;
    this.iconUrl = iconUrl;
}

export function Fragment(position, colorGroup, priority, url) {
    this.position = position;
    this.colorGroup = colorGroup;
    this.priority = priority;
    this.url = url;
}

Fragment.prototype.getUrl = function (shapeName) {
    return this.url.replace("<shape_name>", shapeName)
        .replace("<color_dir>", "default"); // TODO default to color dir
};

export function Rule() {
    this.shape
}

export function Color(label, colorCode) {
    this.label = label;
    this.colorCode = colorCode;
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
    this.units = null;    
}

export function Unit() {
    this.res = null;
    this.shape = null;
    this.color = null;
    this.distance = 0;
}

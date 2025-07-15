/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class Navigator {
    constructor({ coverUrl, options }) {
        this.coverUrl = coverUrl;
        this.options = options;
    }
}


export class NavigatorOption {
    constructor({ title, commandLabel }) {
        this.title = title;
        this.commandLabel = commandLabel;
    }
}


export class Command {
    constructor({ label, itemsCount, itemPreviewUrl, subscribedLayers, colorPalette = [] }) {
        this.label = label;
        this.itemsCount = itemsCount;
        this._itemPreviewUrl = itemPreviewUrl;
        this.subscribedLayers = subscribedLayers;
        this.colorPalette = colorPalette;
    }

    getItemPreviewUrl(item) {
        return this._itemPreviewUrl.replace('<ITEM>', item);
    }
}


export class Layer {
    constructor({ label, priority, position, assetUrl }) {
        this.label = label;
        this.priority = priority;
        this.position = position;
        this._assetUrl = assetUrl;
    }

    getAssetUrl(itemNumber, color) {
        return this._assetUrl.replace('<ITEM>', itemNumber)
            .replace('<COLOR>', color);
    }
}


export class Position {
    constructor({ top, left }) {
        this.top = top;
        this.left = left;
    }
}


export class Color {
    constructor({ colorCode }) {
        this.colorCode = colorCode;
    }
}


export class Rule {
    constructor({ itemsToMatch, forcedLayers, conditions }) {
        this.itemsToMatch = itemsToMatch;
        this.forcedLayers = forcedLayers;
        this.conditions = conditions;
    }

    matchItem({ item }) {
        return this.itemsToMatch.includes(item);
    }
}

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
    constructor({ title, commandName }) {
        this.title = title;
        this.commandName = commandName;
    }
}


export class Command {
    constructor({ name, itemCount, itemPreviewUrl, subscribedLayers, colors = [] }) {
        this.name = name;
        this.itemCount = itemCount;
        this._itemPreviewUrl = itemPreviewUrl;
        this.subscribedLayers = subscribedLayers;
        this.colors = colors;
    }

    getItemPreviewUrl(item) {
        return this._itemPreviewUrl.replace('<ITEM>', item);
    }
}


export class Layer {
    constructor({ name, priority, position, assetUrl }) {
        this.name = name;
        this.priority = priority;
        this.position = position;
        this._assetUrl = assetUrl;
    }

    getAssetUrl(itemNumber, colorValue) {
        return this._assetUrl.replace('<ITEM>', itemNumber)
            .replace('<COLOR>', colorValue);
    }
}


export class Position {
    constructor({ top, left }) {
        this.top = top;
        this.left = left;
    }
}


export class Color {
    constructor({ color, previewColorCode }) {
        this.color = color;
        this.previewColorCode = previewColorCode;
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

export class Script {
    constructor({ name, description, tasks }) {
        this.name = name;
        this.description = description;
        this.tasks = tasks;
    }
}

export class Task {
    constructor({ commandName, itemIndex, color }) {
        this.commandName = commandName;
        this.itemIndex = itemIndex;
        this.color = color;
    }
}

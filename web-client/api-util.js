/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

function ApiUtil() {
    this.map = {};
    this.manifest = {};
    this.data_format = {};
    this.reversedMap = null;

    /**
     * Initializing.
     */
    this.init = function (callback) {
        console.log("ApiUtil init");
        // Import all configs.
        this.map = require('./config/api_map.json');
        this.manifest = require('./autoconfig/manifest.json');
        this.data_format = require('./autoconfig/data_format.json');
        callback();

        // We can import configs dynamically
        // using `import()` but since it relies on `Promise`
        // which introduced by ES6 (ECMAScript 2015),
        // we should use a polyfill such as
        // `es6-promise` or `promise-polyfill`
        // to support old browsers.
    };
}

/**
 * Returns The Default Data.
 */
ApiUtil.prototype.getDefaultData = function () {
    return this.reverseFormat(this.data_format, "data_format");
};

/**
 * Returns View Config.
 */
ApiUtil.prototype.getViewConfig = function () {
    return this.reverseFormat(this.manifest["view_config"], "view_config");
};

/**
 * Reverse Format of Formatted Data According to The Map.
 * 
 * @param dataType Type of The Data in The Map.
 */
ApiUtil.prototype.reverseFormat = function (formattedData, dataType) {
    this.buildReversedMap();
    var reversedFormat = {};

    for (var i in formattedData) {
        for (var j in formattedData[i]) {
            var path = this.reversedMap[i][j];

            if (typeof reversedFormat[path[0]] === "undefined") {
                reversedFormat[path[0]] = {};
            }

            reversedFormat[path[0]][path[1]] = dataType ?
                this.convertIndexes(formattedData[i][j], dataType) : formattedData[i][j];
        }
    }

    return reversedFormat;
};

/**
 * Convert Index of each Value using Map.
 */
ApiUtil.prototype.convertIndexes = function (data, dataType, prefix, reverse) {
    var indexes = this.map["input"]["indexes"][dataType];
    // Reversed Indexes
    var revIndexes = {};

    if (reverse) {
        for (var i in indexes) {
            revIndexes[indexes[i]] = i;
        }

        indexes = revIndexes;
    }

    var newData = {};

    for (var index in data) {
        var value = data[index];
        var accessKey = prefix ? prefix + '_' + index : index;
        var convertedIndex = indexes[accessKey];

        if (convertedIndex) {
            index = convertedIndex;
        }

        if (Array.isArray(value)) {
            var newValue = [];

            for (var j = 0; j < value.length; j++) {
                newValue.push(this.convertIndexes(value[j], dataType, accessKey));
            }

            value = newValue;
        }

        newData[index] = value;
    }

    return newData;
};

/**
 * Reverse API Map to Provide Reverse Access.
 */
ApiUtil.prototype.buildReversedMap = function () {

    if (this.reversedMap !== null) {
        return;
    }

    this.reversedMap = {};

    for (var cat in this.map["output"]["categories"]) {
        for (var subCat in this.map["output"]["categories"][cat]) {
            var path = this.map["output"]["categories"][cat][subCat];

            if (typeof this.reversedMap[path[0]] === "undefined") {
                this.reversedMap[path[0]] = {};
            }

            this.reversedMap[path[0]][path[1]] = [cat, subCat];
        }
    }
};

/**
 * Item Access Key.
 */
ApiUtil.prototype.getItemAccessKey = function (category, subcategory) {
    return this.map["output"]["categories"][category][subcategory];
};

/**
 * Item Data.
 */
ApiUtil.prototype.getItemData = function (category, subcategory, id, callback) {
    var accessKey = this.getItemAccessKey(category, subcategory);
    var rows = this.manifest["items"][accessKey[0]][accessKey[1]];

    if (typeof id === "undefined") {
        return rows[0];
    }

    if (typeof callback === "undefined") {
        if (typeof id === "function") {
            callback = id;
            id = null;
        } else {
            return rows[id];
        }
    }

    for (var subId = 0; subId < rows.length; subId++) {
        var itemData = rows[subId];
        if ((id !== null)
            && (typeof itemData["rules"] !== "undefined")
            && (typeof itemData["rules"][id] !== "undefined")) {
            // Return Reversed Rules for Given Item Id.
            callback(
                subId,
                itemData,
                this.reverseFormat(itemData["rules"][id],
                "data_format"));
        } else {
            callback(subId, itemData);
        }
    }
};

/**
 * Returns color-set of the item.
 */
ApiUtil.prototype.getItemColorSet = function (category, subcategory) {
    var itemData = this.getItemData(category, subcategory);
    return (itemData["color_set"] === undefined) ? null : itemData["color_set"];
};

/**
 * Returns Finds out whether an item has distance range.
 * 
 * @return {boolean} True if item has distance range, false otherwise.
 */
ApiUtil.prototype.hasDistanceRange = function (category, subcategory) {
    var itemData = this.getItemData(category, subcategory);
    return itemData["distance_range"] !== undefined;
};

/**
 * Translate placeholders of the url to the corresponding values.
 */
ApiUtil.prototype.translateUrlPlaceholder = function (url, callback) {

    for (var placeholder in this.map["url_placeholders"]) {
        // The placeholder not found.
        if (url.indexOf(placeholder) < 0) {
            continue;
        }
        
        var data = this.map["url_placeholders"][placeholder];
        var category = data["reference"][0];
        var subcategory = data["reference"][1];
        var value = callback(category, subcategory);

        if (typeof data["relation"] !== "undefined") {
            value = this.manifest["relations"][data["relation"]][value];
        }

        url = url.replace(placeholder, value);
    }

    return url;
};

/**
 * Generate Graphics URL.
 */
ApiUtil.prototype.generateGraphicsUrl = function (itemData, itemId, colorId, translatorCallback) {
    // Concat the url.
    var url = this.manifest["resource_prefix"]
        + itemData["resource"]
        + this.manifest["resource_postfix"];
    // Bind id of the item.
    url = url.replace("[item]", itemId);

    // If item has color.
    if (typeof itemData["color_set"] !== "undefined") {
        url = url.replace("[color]",
            this.manifest["color_set"][itemData["color_set"]][colorId - 1]);
    }

    return this.translateUrlPlaceholder(url, translatorCallback);
};

/**
 * Change Placeholder in Graphics URL.
 * 
 * @param url The URL which generated before.
 */
ApiUtil.prototype.alterUrlPlaceholder = function (url, graphicsDir, placeholder, value) {
    var pattern = this.manifest["resource_prefix"]
        + graphicsDir
        + this.manifest["resource_postfix"];
    var placeholderIndex = pattern.split('/').indexOf(placeholder);
    var directories = url.split('/');
    directories[placeholderIndex] = value;
    url = '';

    directories.forEach(function (dir) {
        url += dir + '/';
    });

    url = url.substr(0, url.length - 1);

    return url;
};

/**
 * Change Color Directory in Graphics URL.
 * 
 * @param url The URL which generated before.
 */
ApiUtil.prototype.alterUrlColor = function (url, itemData, colorId) {
    // If item has not color.
    if (typeof itemData["color_set"] === "undefined") {
        return url;
    }

    return this.alterUrlPlaceholder(
        url,
        itemData["resource"],
        "[color]",
        this.manifest["color_set"][itemData["color_set"]][colorId - 1]);
};

/**
 * Build Formatted Data.
 */
ApiUtil.prototype.buildData = function (values) {
    for (var cat in values) {
        for (var subCat in values[cat]) {
            var item = values[cat][subCat];
            var accessKey = this.map["output"]["categories"][cat][subCat];
            this.data_format[accessKey[0]][accessKey[1]] = this.convertIndexes(
                item, "data_format", null, true);
        }
    }
};

/**
 * Convert Data Object to JSON String.
 */
ApiUtil.prototype.getStringData = function () {
    return JSON.stringify(this.data_format);
};

/**
 * Send data to the server to create the final image.
 */
ApiUtil.prototype.createImage = function (values, callback) {
    this.buildData(values);
    $.ajax({
        url: "./image.php",
        method: "POST",
        contentType: "application/json",
        data: this.getStringData()
    })
        .complete(function (image) {
            callback(image["responseText"]);
        })
        .error(function () {
            alert("Error: Connection Failed!");
        });
};

export default ApiUtil;

/**
 * FaceAppApi
 * @constructor
 * @description Implement API Connections.
 */
function FaceAppApi() {
    this.scriptBaseDir = "./assets/scripts/";
    this.jsonBaseDir = "./resource/json/";
    this.map = {};
    this.manifest = {};
    this.data_format = {};
    this.reversedMap = null;

    /**
     * Initializing.
     * @param callback
     */
    this.init = function (callback) {
        var fd = this;
        // Fetch required data.
        $.when($.getJSON(fd.scriptBaseDir + "fd_api_map.json"),
            $.getJSON(fd.jsonBaseDir + "fd_data_format.json"),
            $.getJSON(fd.jsonBaseDir + "fd_manifest.json"))
            .then(function (apiMap, dataFormat, manifest) {
                fd.map = apiMap[0];
                fd.data_format = dataFormat[0];
                fd.manifest = manifest[0];
                callback();
            }, function () { alert("Error: Can not access to data files!") });
    };

    /**
     * Running.
     */
    this.run = function () {
        //
    };
}

/**
 * Return The Default Data.
 * @return {{}}
 */
FaceAppApi.prototype.getDefaultData = function () {
    return this.reverseFormat(this.data_format, "data_format");
};

/**
 * Returns View Config.
 * @return {{}}
 */
FaceAppApi.prototype.getViewConfig = function () {
    return this.reverseFormat(this.manifest["view_config"], "view_config");
};

/**
 * Reverse Format of Formatted Data According to The Map.
 * @param formattedData
 * @param dataType Type of The Data in The Map.
 * @return {{}}
 */
FaceAppApi.prototype.reverseFormat = function (formattedData, dataType) {
    var fd = this;
    fd.buildReversedMap();
    var reversedFormat = {};
    $.each(formattedData, function (iKey, iData) {
        $.each(iData, function (jKey, values) {
            var path = fd.reversedMap[iKey][jKey];
            if (typeof reversedFormat[path[0]] === typeof undefined) {
                reversedFormat[path[0]] = {};
            }
            if (dataType) {
                values = fd.convertIndexes(values, dataType);
            }
            reversedFormat[path[0]][path[1]] = values;
        });
    });

    return reversedFormat;
};

/**
 * Convert Index of each Value using Map.
 * @param data Data Object.
 * @param dataType Type of The Data in The Map.
 * @param prefix Prefix of Indexes.
 * @param reverse Enable Reverse Convert.
 */
FaceAppApi.prototype.convertIndexes = function (data, dataType, prefix, reverse) {
    var fd = this;
    var indexes = fd.map["input"]["indexes"][dataType];
    var reversedIndexes = {};
    if (reverse) {
        $.each(indexes, function (i0, i1) {
            reversedIndexes[i1] = i0;
        });
        indexes = reversedIndexes;
    }
    var newData = {};
    $.each(data, function (index, value) {
        var accessKey = prefix ? prefix + "_" + index : index;
        var convertedIndex = indexes[accessKey];
        if (convertedIndex) {
            index = convertedIndex;
        }
        // Value is an array.
        if ((typeof value === "object") && value.length
            && (typeof value[0] === "object")) {
            var newValue = [];
            value.forEach(function (v, i) {
                newValue[i] = fd.convertIndexes(v, dataType, accessKey);
            });
            value = newValue;
        }
        newData[index] = value;
    });

    return newData;
};

/**
 * Reverse API Map to Provide Reverse Access.
 */
FaceAppApi.prototype.buildReversedMap = function () {
    var fd = this;
    if (fd.reversedMap !== null) {
        return;
    }
    fd.reversedMap = {};
    $.each(this.map["output"]["categories"], function (catKey, subCats) {
        $.each(subCats, function (subCatKey, path) {
            if (typeof fd.reversedMap[path[0]]=== typeof undefined) {
                fd.reversedMap[path[0]] = {};
            }
            fd.reversedMap[path[0]][path[1]] = [catKey, subCatKey];
        });
    });
};

/**
 * Item Access Key.
 * @param category
 * @param subcategory
 * @return {*}
 */
FaceAppApi.prototype.getItemAccessKey = function (category, subcategory) {
    return this.map["output"]["categories"][category][subcategory];
};

/**
 * Item Data.
 * @param category
 * @param subcategory
 * @param id
 * @param callback
 * @return {*}
 */
FaceAppApi.prototype.getItemData = function (category, subcategory, id, callback) {
    var  fd = this;
    var accessKey = this.getItemAccessKey(category, subcategory);
    var rows = this.manifest["items"][accessKey[0]][accessKey[1]];
    if (typeof id === typeof undefined) {
        return rows[0];
    }
    if (typeof callback === typeof undefined) {
        if (typeof id === "function") {
            callback = id;
            id = null;
        } else {
            return rows[id];
        }
    }
    rows.forEach(function (itemData, subId) {
        if ((id !== null)
            && (typeof itemData["rules"] !== typeof undefined)
            && (typeof itemData["rules"][id] !== typeof undefined)) {
            // Return Reversed Rules for Given Item Id.
            callback(subId, itemData,
                fd.reverseFormat(itemData["rules"][id], "data_format"));
        } else {
            callback(subId, itemData);
        }
    });
};

/**
 * Return color-set of the item.
 * @param category
 * @param subcategory
 * @return {null}
 */
FaceAppApi.prototype.getItemColorSet = function (category, subcategory) {
    var itemData = this.getItemData(category, subcategory);
    return (itemData["color_set"] === undefined) ? null : itemData["color_set"];
};

/**
 * Return Finds out whether an item has distance range.
 * @param category
 * @param subcategory
 * @return {boolean} True if item has distance range, false otherwise.
 */
FaceAppApi.prototype.hasDistanceRange = function (category, subcategory) {
    var itemData = this.getItemData(category, subcategory);
    return itemData["distance_range"] !== undefined;
};

/**
 * Translate placeholders of the url to the corresponding values.
 * @param url
 * @param callback
 * @return {*}
 */
FaceAppApi.prototype.translateUrlPlaceholder = function (url, callback) {
    var fd = this;
    $.each(this.map["url_placeholders"], function (placeholder, data) {
        // The placeholder not found.
        if (url.indexOf(placeholder) < 0) {
            return;
        }
        var category = data["reference"][0];
        var subcategory = data["reference"][1];
        var value = callback(category, subcategory);
        if (typeof data["relation"] !== typeof undefined) {
            value = fd.manifest["relations"][data["relation"]][value];
        }
        url = url.replace(placeholder, value);
    });

    return url;
};

/**
 * Generate Resource URL.
 * @param itemData
 * @param itemId
 * @param colorId
 * @param translatorCallback
 * @return {*}
 */
FaceAppApi.prototype.generateResourceUrl = function (itemData, itemId, colorId, translatorCallback) {
    // Concat the url.
    var url = this.manifest["resource_prefix"]
        + itemData["resource"]
        + this.manifest["resource_postfix"];
    // Bind id of the item.
    url = url.replace("[item]", itemId);
    // If item has color.
    if (typeof itemData["color_set"] !== typeof undefined) {
        url = url.replace("[color]",
            this.manifest["color_set"][itemData["color_set"]][colorId - 1]);
    }

    return this.translateUrlPlaceholder(url, translatorCallback);
};

/**
 * Change Placeholder in Resource URL.
 * @param url The URL which generated before.
 * @param resourceDir
 * @param placeholder
 * @param value
 * @return {*}
 */
FaceAppApi.prototype.alterUrlPlaceholder = function (url, resourceDir, placeholder, value) {
    var pattern = this.manifest["resource_prefix"]
        + resourceDir
        + this.manifest["resource_postfix"];
    var placeholderIndex = pattern.split('/')
        .indexOf(placeholder);
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
 * Change Color Directory in Resource URL.
 * @param url The URL which generated before.
 * @param itemData
 * @param colorId
 * @return {*}
 */
FaceAppApi.prototype.alterUrlColor = function (url, itemData, colorId) {
    // If item has not color.
    if (typeof itemData["color_set"] === typeof undefined) {
        return;
    }
    return this.alterUrlPlaceholder(url, itemData["resource"], "[color]",
        this.manifest["color_set"][itemData["color_set"]][colorId - 1]);
};

/**
 * Build Formatted Data.
 * @param values
 */
FaceAppApi.prototype.buildData = function (values) {
    var fd = this;
    $.each(values, function (catKey, subCats) {
        $.each(subCats, function (subKey, item) {
            var accessKey = fd.map["output"]["categories"][catKey][subKey];
            fd.data_format[accessKey[0]][accessKey[1]] = fd.convertIndexes(
                item, "data_format", null, true);
        });
    });
};

/**
 * Convert Data Object to JSON String.
 * @return {string}
 */
FaceAppApi.prototype.getStringData = function () {
    return JSON.stringify(this.data_format);
};

/**
 * Send data to the server to create the final image.
 * @param values
 * @param callback
 */
FaceAppApi.prototype.createImage = function (values, callback) {
    var fd = this;
    this.buildData(values);
    $.ajax({
        url: "./image.php",
        method: "POST",
        contentType: "application/json",
        data: fd.getStringData()
    })
        .complete(function (image) {
            callback(image["responseText"]);
        })
        .error(function () {
            alert("Error: Connection Failed!");
        });
};

exports = module.exports = FaceAppApi;
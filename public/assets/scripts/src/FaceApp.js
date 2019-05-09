const Frame = require("FaceAppFrame");
const Api = require("FaceAppApi");

/**
 * FaceApp
 * @constructor
 * @description Build A Dynamic Image Preview and Show The Final Image.
 */
function FaceApp() {
    this.frame = {};
    this.api = {};
    this.facePreview = {};
    this.colorGroups = {};
    this.freezedItems = {};
    this.triggers = {};
    this.RULE_ACTION_HIDE = "hide";
    this.RULE_ACTION_FREEZE = "freeze";

    /**
     * Initializing.
     */
    this.init = function () {
        var fd = this;
        this.frame = new Frame();
        this.frame.init();
        this.api = new Api();
        this.api.init(function () {
            fd.run();
        });
        // TODO We can import CSS codes of icons dynamically using JS.
    };

    /**
     * Running.
     */
    this.run = function () {
        var fd = this;
        this.facePreview = this.frame.getFacePreviewElement();
        // Item Listener.
        this.frame.setItemListener(function (category, subcategory, itemId) {
            return fd.selectItem(category, subcategory, itemId);
        });
        // Color Listener.
        this.frame.setColorListener(function (category, subcategory, colorId) {
            fd.changeColor(category, subcategory, colorId);
        });
        // Distance Listener.
        this.frame.setDistanceListener(function (category, subcategory, isUp) {
            var itemData = fd.api.getItemData(category, subcategory);
            return fd.changeDistance(category, subcategory, isUp, itemData);
        });
        // ColorBox Listener.
        this.frame.setColorBoxListener(function (category, subcategory) {
            return fd.api.getItemColorSet(category, subcategory);
        });
        // PositionBox Listener.
        this.frame.setPositionBoxListener(function (category, subcategory) {
            return fd.api.hasDistanceRange(category, subcategory);
        });
        // Button Listener.
        this.frame.setButtonListener(function () {
            fd.api.createImage(fd.frame.values, function (imageData) {
                fd.frame.showResult(imageData);
            });
        });
        this.frame.run(this.api.getViewConfig());
        this.api.run();
        // Show Preview of The Default Face
        // that Included in Received Data Format.
        this.frame.autoload(this.api.getDefaultData());
    };
}

/**
 * Item Selected.
 * @param category
 * @param subcategory
 * @param itemId
 */
FaceApp.prototype.selectItem = function (category, subcategory, itemId) {
    var fd = this;
    var itemData = this.api.getItemData(category, subcategory);
    if (itemId > itemData["id_max"]) {
        return false;
    }
    var ruleRef = this.ruleRefFormat(category, subcategory);
    // Rollback related rules.
    this.rollbackRules(ruleRef);
    this.api.getItemData(category, subcategory, itemId, function (itemSubId, itemData, rules) {
        var img = fd.findOrDrawImage(category, subcategory,
            itemData, itemSubId);
        // Verify active rules.
        if (fd.ruleVerification(img, category, subcategory, itemId)) {
            // Show preview.
            fd.showPreviewImage(img, category, subcategory, itemId,
                fd.frame.getColorValue(category, subcategory));
            // If item has rules.
            fd.frame.loadValues(rules, function (category, subcategory, value) {
                fd.runRule(ruleRef, category, subcategory,
                    value["item"], value["conditions"]);
            });
        }
        fd.startTriggers(category, subcategory);
        // If item has dependency.
        if (typeof itemData["dependency"] !== typeof undefined) {
            fd.showDependencyPreview(category, subcategory,
                itemId, itemSubId, itemData["dependency"]);
        }
    });

    return true;
};

/**
 * Color Changed.
 * @param category
 * @param subcategory
 * @param colorId
 */
FaceApp.prototype.changeColor = function (category, subcategory, colorId) {
    var fd = this;
    var elements = this.findPreviewImages(category, subcategory);
    if (elements.length === 0) {
        return;
    }
    var colorGroup = elements.attr("data-color-group");
    if (colorGroup !== false && typeof colorGroup !== typeof undefined) {
        elements = this.facePreview.find('[data-color-group="' + colorGroup + '"]');
    }
    // Save value of the color group to restore for
    // the items that have this color group and is not present yet.
    fd.colorGroups[colorGroup] = colorId;
    $.each(elements, function (k, element) {
        var img = $(element);
        var elCategory = img.attr("data-category");
        var elSubcategory = img.attr("data-subcategory");
        var itemData = {};
        // Dependency items have not real category.
        if ((typeof elCategory === typeof undefined)
            || (typeof elSubcategory === typeof undefined)) {
            var baseData = fd.api.getItemData(parseInt(img.attr("data-dep-category")),
                parseInt(img.attr("data-dep-subcategory")),
                parseInt(img.attr("data-sub-id")));
            itemData = baseData["dependency"];
        } else {
            elCategory = parseInt(elCategory);
            elSubcategory = parseInt(elSubcategory);
            fd.frame.setColorValue(colorId, elCategory, elSubcategory);
            itemData = fd.api.getItemData(elCategory, elSubcategory,
                parseInt(img.attr("data-sub-id")));
        }
        var url = fd.api.alterUrlColor(img.attr("src"),
            itemData, colorId);
        img.attr("src", url);
    });
};

/**
 * Position Changed.
 * @param category
 * @param subcategory
 * @param isUp
 * @param itemData
 * @param [isDependency]
 * @return {*}
 */
FaceApp.prototype.changeDistance = function (category, subcategory, isUp, itemData, isDependency) {
    if (typeof itemData["distance_range"] === typeof undefined) {
        return;
    }
    var elements = this.findPreviewImages(category, subcategory, undefined, isDependency);
    var position = itemData["position"]["y"];
    var range = itemData["distance_range"];
    var top = parseInt(elements.css("top"));
    isUp ? top-- : top++;
    var diff = top - position;
    // Top distance or Bottom distance? Is it a valid distance?
    if ((diff > 0 && diff > range["top"])
        || (diff < 0 && Math.abs(diff) > range["bottom"])) {
        return false;
    }
    // Show changes.
    elements.css("top", top);
    if (typeof itemData["dependency"] !== typeof undefined) {
        this.changeDistance(category, subcategory, isUp, itemData["dependency"], true);
    }

    return diff;
};

/**
 * Format of Rule Reference (ruleRef).
 * @param category
 * @param subcategory
 * @return {string}
 */
FaceApp.prototype.ruleRefFormat = function (category, subcategory) {
    return category + ":" + subcategory;
};

/**
 * Run Rule.
 * @param ruleRef
 * @param category
 * @param subcategory
 * @param itemId
 * @param conditions
 */
FaceApp.prototype.runRule = function (ruleRef, category, subcategory, itemId, conditions) {
    var fd = this;
    var operate = true;
    if ((typeof conditions !== typeof undefined)
        && (conditions.indexOf(this.frame.getItemValue(category, subcategory)) < 0)) {
            operate = false;
    }
    this.api.getItemData(category, subcategory, function (itemSubId, itemData) {
        var img = fd.findOrDrawImage(category, subcategory, itemData, itemSubId);
        var depImg = [];
        var attrRuleRef = img.attr("data-rule-ref");
        if ((typeof attrRuleRef === typeof undefined)
            || (attrRuleRef === false)) {
            attrRuleRef = ruleRef;
            img.attr("data-rule-ref", ruleRef);
        } else if (attrRuleRef.indexOf(ruleRef) < 0) {
            attrRuleRef += " " + ruleRef;
        }
        img.attr("data-rule-ref", attrRuleRef);
        // If item has dependency.
        if (typeof itemData["dependency"] !== typeof undefined) {
            // Find the dependency.
            depImg = fd.findOrDrawImage(category, subcategory,
                itemData["dependency"], itemSubId, true)
                .attr("data-rule-ref", attrRuleRef);
        }
        // If item must be hidden.
        if (itemId === 0) {
            img.attr("data-rule-action", fd.RULE_ACTION_HIDE);
            if (depImg.length > 0) {
                depImg.attr("data-rule-action", fd.RULE_ACTION_HIDE);
            }
            if (operate) {
                img.hide();
                // Also hide the dependency.
                if (depImg.length > 0) {
                    depImg.hide();
                }
            }
            return;
        }
        // Freeze the preview.
        img.attr("data-rule-action", fd.RULE_ACTION_FREEZE);
        if (operate) {
            // We want to change an item preview,
            // thus rollback related rules.
            fd.rollbackRules(fd.ruleRefFormat(category, subcategory));
            // Show preview.
            fd.showPreviewImage(img, category, subcategory, itemId,
                fd.frame.getColorValue(category, subcategory));
        }
        if (typeof conditions !== typeof undefined) {
            if (typeof fd.freezedItems[ruleRef] === typeof undefined) {
                fd.freezedItems[ruleRef] = {};
            }
            if (typeof fd.freezedItems[ruleRef][category] === typeof undefined) {
                fd.freezedItems[ruleRef][category] = {};
            }
            fd.freezedItems[ruleRef][category][subcategory] = {
                "list": conditions,
                "preview_id": itemId
            };
        }
    });
};

/**
 * Rollback Rules.
 * @param ruleRef
 */
FaceApp.prototype.rollbackRules = function (ruleRef) {
    var fd = this;
    var activeRules = this.facePreview
        .find('[data-rule-ref~="' + ruleRef + '"]');
    $.each(activeRules, function (k, e) {
        var img = $(e);
        var attr = img.attr("data-rule-ref")
            .replace(ruleRef, "").trim();
        if (attr.length > 0) {
            img.attr("data-rule-ref", attr);
            return;
        }
        img.removeAttr("data-rule-ref");
        if (img.attr("data-rule-action") === fd.RULE_ACTION_HIDE) {
            img.removeAttr("data-rule-action").show();
        } else if (img.attr("data-rule-action") === fd.RULE_ACTION_FREEZE) {
            if (typeof fd.freezedItems[ruleRef] !== typeof undefined) {
                delete fd.freezedItems[ruleRef];
            }
            img.removeAttr("data-rule-action");
            var category = parseInt(img.attr("data-category"));
            var subcategory = parseInt(img.attr("data-subcategory"));
            fd.selectItem(category, subcategory,
                fd.frame.getItemValue(category, subcategory));
        }
    });
};

/**
 * Rule Verification.
 * @param img
 * @param category
 * @param subcategory
 * @param itemId
 * @return {boolean}
 */
FaceApp.prototype.ruleVerification = function (img, category, subcategory, itemId) {
    var fd = this;
    if (img.attr("data-rule-action") !== fd.RULE_ACTION_FREEZE) {
        return true;
    }
    var ref = img.attr("data-rule-ref").split(" ").pop();
    if ((typeof fd.freezedItems[ref] === typeof undefined)
        || (typeof fd.freezedItems[ref][category] === typeof undefined)
        || (typeof fd.freezedItems[ref][category][subcategory] === typeof undefined)
        || (fd.freezedItems[ref][category][subcategory]["list"].indexOf(itemId) < 0)) {
        return true;
    }
    fd.showPreviewImage(img, category, subcategory,
        fd.freezedItems[ref][category][subcategory]["preview_id"],
        fd.frame.getColorValue(category, subcategory));
    return false;
};

/**
 * Find The Preview Image or Create A New One.
 * @param category
 * @param subcategory
 * @param itemData
 * @param itemSubId
 * @param isDependency
 * @return {*[]}
 */
FaceApp.prototype.findOrDrawImage = function (category, subcategory, itemData, itemSubId, isDependency) {
    var img = this.findPreviewImages(category, subcategory, itemSubId, isDependency);
    // The image created already.
    if (img.length > 0) {
        return img;
    }
    img = $(document.createElement("img"))
        .attr("data-sub-id", itemSubId)
        .css("z-index", itemData["priority"])
        .css("top", itemData["position"]["y"])
        .css("left", itemData["position"]["x"]);
    if (isDependency === true) {
        img.attr("data-dep-category", category)
            .attr("data-dep-subcategory", subcategory);
    } else {
        img.attr("data-category", category)
            .attr("data-subcategory", subcategory);
    }
    if (typeof itemData["color_group"] !== typeof undefined) {
        img.attr("data-color-group", itemData["color_group"]);
        if ((isDependency !== true)
            && (typeof this.colorGroups[itemData["color_group"]] !== typeof undefined)) {
            this.frame.setColorValue(this.colorGroups[itemData["color_group"]],
                category, subcategory);
        }
    }
    this.facePreview.append(img);

    return img;
};

/**
 * Load Preview Image.
 * @param img
 * @param category
 * @param subcategory
 * @param itemId
 * @param colorId
 */
FaceApp.prototype.showPreviewImage = function (img, category, subcategory, itemId, colorId) {
    var fd = this;
    var itemSubId = parseInt(img.attr("data-sub-id"));
    var itemData = this.api.getItemData(category, subcategory, itemSubId);
    var url = this.api.generateResourceUrl(itemData, itemId, colorId, function (cat, subCat) {
        fd.addTrigger(cat, subCat, function () {
            fd.showPreviewImage(img, category, subcategory,
                fd.frame.getItemValue(category, subcategory),
                fd.frame.getColorValue(category, subcategory));
        });
        return fd.frame.getItemValue(cat, subCat);
    });
    img.attr("src", url);
};

/**
 * Show Dependency Preview.
 * @param category
 * @param subcategory
 * @param itemId
 * @param subId
 * @param depData
 */
FaceApp.prototype.showDependencyPreview = function (category, subcategory, itemId, subId, depData) {
    var fd = this;
    var img = fd.findOrDrawImage(category, subcategory, depData, subId, true);
    if ((typeof depData["id_min"] !== typeof undefined
            && itemId < depData["id_min"])
        || itemId > depData["id_max"]) {
        // Disable the dependency.
        img.attr("src", "")
            .css("visibility", "hidden");
        return;
    }
    // Enable the dependency.
    img.css("visibility", "visible");
    // Show preview.
    var colorId = fd.colorGroups[depData["color_group"]];
    var url = fd.api.generateResourceUrl(depData, itemId, colorId, function (cat, subCat) {
        fd.addTrigger(cat, subCat, function () {
            fd.showDependencyPreview(category, subcategory,
                fd.frame.getItemValue(category, subcategory), subId, depData);
        });
        return fd.frame.getItemValue(cat, subCat);
    });
    img.attr("src", url);
};

/**
 * Find Elements of The Preview.
 * @param category
 * @param subcategory
 * @param itemSubId
 * @param isDependency
 * @return []
 */
FaceApp.prototype.findPreviewImages = function (category, subcategory, itemSubId, isDependency) {
    var selector = (isDependency === true) ?
        '[data-dep-category="' + category + '"]'
        + '[data-dep-subcategory="' + subcategory + '"]' :
        '[data-category="' + category + '"]'
        + '[data-subcategory="' + subcategory + '"]';
    if (typeof itemSubId !== typeof undefined) {
        selector += '[data-sub-id="' + itemSubId + '"]';
    }
    var elements = this.facePreview.find(selector);

    return (elements.length > 0) ? elements : [];
};

/**
 * Start Triggers.
 * @param category
 * @param subcategory
 * @param callback
 */
FaceApp.prototype.addTrigger = function (category, subcategory, callback) {
    if (typeof this.triggers[category] === typeof undefined) {
        this.triggers[category] = {};
    }
    this.triggers[category][subcategory] = callback;
};

/**
 * Start Triggers.
 * @param category
 * @param subcategory
 */
FaceApp.prototype.startTriggers = function (category, subcategory) {
    if ((typeof this.triggers[category] === typeof undefined)
        || (typeof this.triggers[category][subcategory] !== "function")) {
        return;
    }
    this.triggers[category][subcategory]();
};

// Start.
$(document).ready(function () {
    (new FaceApp()).init();
});
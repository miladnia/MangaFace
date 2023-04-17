/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import View from "./view.js";
import ApiUtil from "./api-util.js"

function App() {
    this.view = {};
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
        console.log("App init");
        this.view = new View();
        this.view.init();
        this.api = new ApiUtil();
        this.api.init((function() {
            this.run();
        }).bind(this));
        // TODO We can import CSS codes of icons dynamically using JS.
    };

    /**
     * Running.
     */
    this.run = function () {
        this.facePreview = this.view.getFacePreviewElement();

        // Item Listener.
        this.view.setItemListener((function (category, subcategory, itemId) {
            return this.selectItem(category, subcategory, itemId);
        }).bind(this));

        // Color Listener.
        this.view.setColorListener((function (category, subcategory, colorId) {
            this.changeColor(category, subcategory, colorId);
        }).bind(this));
        
        // Distance Listener.
        this.view.setDistanceListener((function (category, subcategory, isUp) {
            var itemData = this.api.getItemData(category, subcategory);
            return this.changeDistance(category, subcategory, isUp, itemData);
        }).bind(this));

        // ColorBox Listener.
        this.view.setColorBoxListener((function (category, subcategory) {
            return this.api.getItemColorSet(category, subcategory);
        }).bind(this));

        // PositionBox Listener.
        this.view.setPositionBoxListener((function (category, subcategory) {
            return this.api.hasDistanceRange(category, subcategory);
        }).bind(this));

        // Button Listener.
        this.view.setButtonListener((function () {
            this.api.createImage(this.view.values, (function (imageData) {
                this.view.showResult(imageData);
            }).bind(this));
        }).bind(this));

        this.view.run(this.api.getViewConfig());
        // Show a sample face in the preview box.
        this.view.autoload(this.api.getDefaultData());
    };
}

/**
 * Item Selected.
 */
App.prototype.selectItem = function (category, subcategory, itemId) {
    var itemData = this.api.getItemData(category, subcategory);

    if (itemId > itemData["id_max"]) {
        return false;
    }

    var ruleRef = this.ruleRefFormat(category, subcategory);
    // Rollback related rules.
    this.rollbackRules(ruleRef);

    this.api.getItemData(category, subcategory, itemId, (function (itemSubId, itemData, rules) {
        var img = this.findOrDrawImage(category, subcategory, itemData, itemSubId);

        // Verify active rules.
        if (this.ruleVerification(img, category, subcategory, itemId)) {
            // Show preview.
            this.showPreviewImage(img, category, subcategory, itemId,
                this.view.getColorValue(category, subcategory));
            // If item has rules.
            this.view.loadValues(rules, (function (category, subcategory, value) {
                this.runRule(ruleRef, category, subcategory,
                    value["item"], value["conditions"]);
            }).bind(this));
        }

        this.startTriggers(category, subcategory);

        // If item has dependency.
        if (typeof itemData["dependency"] !== "undefined") {
            this.showDependencyPreview(category, subcategory,
                itemId, itemSubId, itemData["dependency"]);
        }
    }).bind(this));

    return true;
};

/**
 * Color Changed.
 */
App.prototype.changeColor = function (category, subcategory, colorId) {
    var elements = this.findPreviewImages(category, subcategory);

    if (elements.length === 0) {
        return;
    }

    var colorGroup = elements.attr("data-color-group");

    if (colorGroup !== false && typeof colorGroup !== "undefined") {
        elements = this.facePreview.find('[data-color-group="' + colorGroup + '"]');
    }

    // Save value of the color group to restore for
    // the items that have this color group and is not present yet.
    this.colorGroups[colorGroup] = colorId;

    $.each(elements, (function (k, element) {
        var img = $(element);
        var elCategory = img.attr("data-category");
        var elSubcategory = img.attr("data-subcategory");
        var itemData = {};

        // Dependency items have not real category.
        if ((typeof elCategory === "undefined")
            || (typeof elSubcategory === "undefined")) {
            var baseData = this.api.getItemData(
                parseInt(img.attr("data-dep-category")),
                parseInt(img.attr("data-dep-subcategory")),
                parseInt(img.attr("data-sub-id")));
            itemData = baseData["dependency"];
        } else {
            elCategory = parseInt(elCategory);
            elSubcategory = parseInt(elSubcategory);
            this.view.setColorValue(colorId, elCategory, elSubcategory);
            itemData = this.api.getItemData(
                elCategory,
                elSubcategory,
                parseInt(img.attr("data-sub-id")));
        }

        var url = this.api.alterUrlColor(img.attr("src"), itemData, colorId);
        console.log("img", url);
        img.attr("src", url);

    }).bind(this)); // each()
};

/**
 * Position Changed.
 */
App.prototype.changeDistance = function (category, subcategory, isUp, itemData, isDependency) {
    if (typeof itemData["distance_range"] === "undefined") {
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

    if (typeof itemData["dependency"] !== "undefined") {
        this.changeDistance(category, subcategory, isUp, itemData["dependency"], true);
    }

    return diff;
};

/**
 * Returns format of the Rule Reference (ruleRef).
 */
App.prototype.ruleRefFormat = function (category, subcategory) {
    return category + ":" + subcategory;
};

/**
 * Run Rule.
 */
App.prototype.runRule = function (ruleRef, category, subcategory, itemId, conditions) {
    var operate = true;

    if ((typeof conditions !== "undefined")
        && (conditions.indexOf(this.view.getItemValue(category, subcategory)) < 0)) {
            operate = false;
    }

    this.api.getItemData(category, subcategory, (function (itemSubId, itemData) {
        var img = this.findOrDrawImage(category, subcategory, itemData, itemSubId);
        var depImg = [];
        var attrRuleRef = img.attr("data-rule-ref");

        if ((typeof attrRuleRef === "undefined")
            || (attrRuleRef === false)) {
            attrRuleRef = ruleRef;
            img.attr("data-rule-ref", ruleRef);
        } else if (attrRuleRef.indexOf(ruleRef) < 0) {
            attrRuleRef += " " + ruleRef;
        }

        img.attr("data-rule-ref", attrRuleRef);

        // If item has dependency.
        if (typeof itemData["dependency"] !== "undefined") {
            // Find the dependency.
            depImg = this.findOrDrawImage(
                category,
                subcategory,
                itemData["dependency"], itemSubId, true)
                    .attr("data-rule-ref", attrRuleRef);
        }

        // If item must be hidden.
        if (itemId === 0) {
            img.attr("data-rule-action", this.RULE_ACTION_HIDE);

            if (depImg.length > 0) {
                depImg.attr("data-rule-action", this.RULE_ACTION_HIDE);
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
        img.attr("data-rule-action", this.RULE_ACTION_FREEZE);

        if (operate) {
            // We want to change an item preview,
            // thus rollback related rules.
            this.rollbackRules(this.ruleRefFormat(category, subcategory));
            // Show preview.
            this.showPreviewImage(img, category, subcategory, itemId,
                this.view.getColorValue(category, subcategory));
        }

        if (typeof conditions !== "undefined") {
            if (typeof this.freezedItems[ruleRef] === "undefined") {
                this.freezedItems[ruleRef] = {};
            }

            if (typeof this.freezedItems[ruleRef][category] === "undefined") {
                this.freezedItems[ruleRef][category] = {};
            }

            this.freezedItems[ruleRef][category][subcategory] = {
                "list": conditions,
                "preview_id": itemId
            };
        }

    }).bind(this)); // getItemData()
};

/**
 * Rollback Rules.
 */
App.prototype.rollbackRules = function (ruleRef) {
    var activeRules = this.facePreview
        .find('[data-rule-ref~="' + ruleRef + '"]');
    
    $.each(activeRules, (function (k, e) {
        var img = $(e);
        var attr = img.attr("data-rule-ref")
            .replace(ruleRef, "").trim();
        
        if (attr.length > 0) {
            img.attr("data-rule-ref", attr);
            return;
        }

        img.removeAttr("data-rule-ref");

        if (img.attr("data-rule-action") === this.RULE_ACTION_HIDE) {
            img.removeAttr("data-rule-action").show();
        } else if (img.attr("data-rule-action") === this.RULE_ACTION_FREEZE) {
            if (typeof this.freezedItems[ruleRef] !== "undefined") {
                delete this.freezedItems[ruleRef];
            }

            img.removeAttr("data-rule-action");
            var category = parseInt(img.attr("data-category"));
            var subcategory = parseInt(img.attr("data-subcategory"));
            this.selectItem(
                category,
                subcategory,
                this.view.getItemValue(category, subcategory));
        }

    }).bind(this)); // each()
};

/**
 * Rule Verification.
 */
App.prototype.ruleVerification = function (img, category, subcategory, itemId) {

    if (img.attr("data-rule-action") !== this.RULE_ACTION_FREEZE) {
        return true;
    }
    
    var ref = img.attr("data-rule-ref").split(" ").pop();

    if ((typeof this.freezedItems[ref] === "undefined")
        || (typeof this.freezedItems[ref][category] === "undefined")
        || (typeof this.freezedItems[ref][category][subcategory] === "undefined")
        || (this.freezedItems[ref][category][subcategory]["list"].indexOf(itemId) < 0)) {
        return true;
    }

    this.showPreviewImage(
        img,
        category,
        subcategory,
        this.freezedItems[ref][category][subcategory]["preview_id"],
        this.view.getColorValue(category, subcategory));
    
    return false;
};

/**
 * Find The Preview Image or Create A New One.
 */
App.prototype.findOrDrawImage = function (category, subcategory, itemData, itemSubId, isDependency) {
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

    if (typeof itemData["color_group"] !== "undefined") {
        img.attr("data-color-group", itemData["color_group"]);

        if ((isDependency !== true)
            && (typeof this.colorGroups[itemData["color_group"]] !== "undefined")) {
            this.view.setColorValue(this.colorGroups[itemData["color_group"]],
                category, subcategory);
        }
    }

    this.facePreview.append(img);

    return img;
};

/**
 * Load Preview Image.
 */
App.prototype.showPreviewImage = function (img, category, subcategory, itemId, colorId) {
    var itemSubId = parseInt(img.attr("data-sub-id"));
    var itemData = this.api.getItemData(category, subcategory, itemSubId);

    var url = this.api.generateGraphicsUrl(itemData, itemId, colorId, (function (cat, subCat) {
        this.addTrigger(cat, subCat, (function () {
            this.showPreviewImage(
                img,
                category,
                subcategory,
                this.view.getItemValue(category, subcategory),
                this.view.getColorValue(category, subcategory));
        }).bind(this)); // addTrigger()

        return this.view.getItemValue(cat, subCat);

    }).bind(this)); // generateGraphicsUrl()

    console.log("img", url);
    img.attr("src", url);
};

/**
 * Show Dependency Preview.
 */
App.prototype.showDependencyPreview = function (category, subcategory, itemId, subId, depData) {
    var img = this.findOrDrawImage(category, subcategory, depData, subId, true);

    if ((typeof depData["id_min"] !== "undefined"
            && itemId < depData["id_min"])
        || itemId > depData["id_max"]) {
        // Disable the dependency.
        img.attr("src", "").css("visibility", "hidden");
        return;
    }

    // Enable the dependency.
    img.css("visibility", "visible");
    // Show preview.
    var colorId = this.colorGroups[depData["color_group"]];

    var url = this.api.generateGraphicsUrl(depData, itemId, colorId, (function (cat, subCat) {
        this.addTrigger(cat, subCat, (function () {
            this.showDependencyPreview(
                category,
                subcategory,
                this.view.getItemValue(category, subcategory), subId, depData);
        }).bind(this)); // addTrigger()

        return this.view.getItemValue(cat, subCat);

    }).bind(this)); // generateGraphicsUrl()

    console.log("img", url);
    img.attr("src", url);
};

/**
 * Find Elements of The Preview.
 */
App.prototype.findPreviewImages = function (category, subcategory, itemSubId, isDependency) {
    var selector = (isDependency === true) ?
        '[data-dep-category="' + category + '"]'
        + '[data-dep-subcategory="' + subcategory + '"]' :
        '[data-category="' + category + '"]'
        + '[data-subcategory="' + subcategory + '"]';
    
    if (typeof itemSubId !== "undefined") {
        selector += '[data-sub-id="' + itemSubId + '"]';
    }

    var elements = this.facePreview.find(selector);

    return (elements.length > 0) ? elements : [];
};

App.prototype.addTrigger = function (category, subcategory, callback) {

    if (typeof this.triggers[category] === "undefined") {
        this.triggers[category] = {};
    }

    this.triggers[category][subcategory] = callback;
};

App.prototype.startTriggers = function (category, subcategory) {

    if ((typeof this.triggers[category] === "undefined")
        || (typeof this.triggers[category][subcategory] !== "function")) {
        return;
    }

    this.triggers[category][subcategory]();
};

// Start.
$(document).ready(function () {
    (new App()).init();
});

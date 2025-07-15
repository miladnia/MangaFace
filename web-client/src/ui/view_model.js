/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default function ViewModel(
    layout,
    navigatorRepository,
    commandRepository,
    layerRepository,
) {
    this._layout = layout;
    this.navigatorRepository = navigatorRepository;
    this.commandRepository = commandRepository;
    this.layerRepository = layerRepository;
}

/**
 * Item Selected.
 */
ViewModel.prototype.onShapeChange = function (shapeType, resId) {
    if (this._layout.units.hasOwnProperty(resId)) {
        console.warn("The layout has not a defined " + resId + " resource.");
        return null;
    }

    var unit = this._layout.units[resId];

    if (shapeType > unit.res.shapes.max) {
        console.warn("The value " + shapeType + " for shape type, "
                    + "is greater than max value " + unit.res.shapes.max + ".");
        return null;
    }

    var ruleRef = this.ruleRefFormat(category, subcategory);
    // Rollback related rules.
    this.rollbackRules(ruleRef);

    function anon (itemSubId, itemData, rules) {
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
        if (itemData.hasOwnProperty("dependency")) {
            this.showDependencyPreview(category, subcategory,
                itemId, itemSubId, itemData["dependency"]);
        }
    }
};





/**
 * Color Changed.
 */
ViewModel.prototype.changeColor = function (category, subcategory, colorId) {
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
ViewModel.prototype.changeDistance = function (category, subcategory, isUp, itemData, isDependency) {
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
ViewModel.prototype.ruleRefFormat = function (category, subcategory) {
    return category + ":" + subcategory;
};

/**
 * Run Rule.
 */
ViewModel.prototype.runRule = function (ruleRef, category, subcategory, itemId, conditions) {
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
ViewModel.prototype.rollbackRules = function (ruleRef) {
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
ViewModel.prototype.ruleVerification = function (img, category, subcategory, itemId) {

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

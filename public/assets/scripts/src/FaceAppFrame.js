/**
 * FaceAppFrame
 * @constructor
 * @description Implement App UI.
 */
function FaceAppFrame() {
    this.values = {};
    this.pages = {};
    this.category = -1;
    this.subcategory = -1;
    this.page = -1;

    // Set jQuery selectors.
    this.tabs = $("#fdTabs");
    this.subTabs = $("#fdSubTabs");
    this.itemsContainer = $("#fdItems");
    this.colorBox = $("#fdColorBox");
    this.positionBox = $("#fdPositionBox");
    this.buttonSave = $("#fdCreateImage");

    /**
     * Initializing.
     */
    this.init = function () {
        // Items.
        this.addItems();
        // Colors.
        this.addColors();
    };

    /**
     * Run and Enable Events and Buttons.
      */
    this.run = function (config) {
        var fd = this;
        // Configuration.
        this.readConfig(config);
        // Initialize categories.
        var activeCategory = this.tabs.find(".active");
        this.categoryClickEvent(activeCategory);
        // Category Tabs.
        this.tabs.on("click", "li", function () {
            fd.categoryClickEvent($(this));
        });
        // Subcategory Tabs.
        this.subTabs.on("click", "li", function () {
            fd.subcategoryClickEvent($(this));
        });
        // Position Box.
        this.positionBox.on("click", "li", function () {
            fd.positionClickEvent($(this));
        });
        // Button.
        this.buttonSave.on("click", function () {
            fd.buttonClickEvent();
        });
    };

    /**
     * Read and Execute Configs.
     * @param config
     */
    this.readConfig = function(config) {
        var fd = this;
        $.each(config, function (catKey, subCats) {
            $.each(subCats, function (subCatKey, data) {
                if (data["pages"]) {
                    fd.paginate(catKey, subCatKey, data["pages"]);
                }
            });
        });
    };

    /**
     * Set Value.
     * @param key
     * @param value
     * @param [category]
     * @param [subcategory]
     */
    this.setValue = function (key, value, category, subcategory) {
        if (typeof subcategory === typeof undefined) {
            category = this.category;
            subcategory = this.subcategory;
        }
        if (typeof this.values[category] === typeof undefined) {
            this.values[category] = {};
        }
        if (typeof this.values[category][subcategory] === typeof undefined) {
            this.values[category][subcategory] = {};
        }
        this.values[category][subcategory][key] = value;
        console.log(category, subcategory, value);
    };

    /**
     * Set Value of The Color.
     * @param value
     * @param category
     * @param subcategory
     */
    this.setColorValue = function (value, category, subcategory) {
        return this.setValue("color", value, category, subcategory);
    };

    /**
     * Returns Value by Key.
     * @param key
     * @param [category]
     * @param [subcategory]
     * @return {*}
     */
    this.getValue = function (key, category, subcategory) {
        if (typeof subcategory === typeof undefined) {
            category = this.category;
            subcategory = this.subcategory;
        }
        if ((typeof this.values[category] === typeof undefined)
            || (typeof this.values[category][subcategory] === typeof undefined)
            || (typeof this.values[category][subcategory][key] === typeof undefined)) {
            // If there is no value, just return the initial value.
            return (key === "distance") ? 0 : 1;
        }
        return this.values[category][subcategory][key];
    };

    /**
     * Returns Value of The Item.
     * @param category
     * @param subcategory
     * @return {number|*}
     */
    this.getItemValue = function (category, subcategory) {
        return this.getValue("item", category, subcategory);
    };

    /**
     * Returns Value of The Color.
     * @param category
     * @param subcategory
     * @return {number|*}
     */
    this.getColorValue = function (category, subcategory) {
        return this.getValue("color", category, subcategory);
    };

    // Listener: itemListener.
    this.itemListener = function () {
        alert("Item Listener Is Not Configured.");
    };

    // Listener: distanceListener.
    this.distanceListener = function () {
        alert("Distance Listener Is Not Configured.");
    };

    // Listener: colorListener.
    this.colorListener = function () {
        alert("Color Listener Is Not Configured.");
    };

    // Listener: colorBoxListener.
    this.colorBoxListener = function () {
        alert("ColorBox Listener Is Not Configured.");
    };

    // Listener: positionBoxListener.
    this.positionBoxListener = function () {
        alert("PositionBox Listener Is Not Configured.");
    };

    // Listener: buttonListener.
    this.buttonListener = function () {
        alert("Button Listener Is Not Configured.");
    };
}

/**
 * Autoloader.
 * @param values
 */
FaceAppFrame.prototype.autoload = function (values) {
    var fd = this;
    var catTemp = this.category;
    var subCatTemp = this.subcategory;
    $.each(values, function (catKey, subCats) {
        $.each(subCats, function (subCatKey, data) {
            if (data["item"] <= 0) {
                return;
            }
            fd.category = catKey;
            fd.subcategory = subCatKey;
            fd.itemClickEvent(data["item"]);
            if (typeof data["color"] !== typeof undefined) {
                fd.colorClickEvent(data["color"]);
            }
        });
    });
    this.category = catTemp;
    this.subcategory = subCatTemp;
};

/**
 * Load Values.
 * @param values
 * @param callback
 */
FaceAppFrame.prototype.loadValues = function (values, callback) {
    var fd = this;
    if ((typeof values === typeof undefined)
        || (values.length === 0)) {
        return;
    }
    var catTemp = this.category;
    var subCatTemp = this.subcategory;
    $.each(values, function (catKey, subCats) {
        $.each(subCats, function (subCatKey, value) {
            fd.category = catKey;
            fd.subcategory = subCatKey;
            callback(catKey, subCatKey, value);
        });
    });
    this.category = catTemp;
    this.subcategory = subCatTemp;
};

/**
 * Return Face Preview Element.
 * @return {*|jQuery|HTMLElement}
 */
FaceAppFrame.prototype.getFacePreviewElement = function () {
    return $("#fdFacePreview");
};

/**
 * Show The Final Image.
 * @param imageData
 */
FaceAppFrame.prototype.showResult = function (imageData) {
    $("#outputImage").attr("src", imageData);
    $("#monitor").show().on("click", function (e) {
        if ($(e.target).closest("#outputImage").length)
            return;
        $(this).hide();
    });
};

/**
 * Set Distance Listener.
 * @param listener
 */
FaceAppFrame.prototype.setButtonListener = function (listener) {
    this.buttonListener = listener;
    // Enable The Button.
    this.buttonSave.prop("disabled", false);
};

/**
 * Event: Category Click.
 * @param option
 */
FaceAppFrame.prototype.categoryClickEvent = function (option) {
    if (option.attr("data-disabled") === "true") {
        return;
    }
    if (!option.hasClass("active")) {
        // Reset status of the option that selected already.
        this.tabs.find("li.active")
            .removeClass("active");
        // Change status of selected option.
        option.addClass("active");
    }
    // Get category number.
    this.category = option.attr("data-number");
    // Hide visible sub-tabs.
    this.subTabs.find("ul.visible")
        .removeClass("visible");
    // Get options of the sub-tab.
    var subTabOptions = this.subTabs
        .find('ul[data-parent="' + this.category + '"]');
    // Show requested tab.
    subTabOptions.addClass("visible");
    // Set category data of the items.
    this.itemsContainer.find("ul")
        .attr("data-category", this.category);
    // Which subcategory is active now?
    var subcategory = subTabOptions.find("li.active");
    // Auto select the subcategory.
    this.subcategoryClickEvent(subcategory);
};

/**
 * Event: Subcategory Click.
 * @param option
 */
FaceAppFrame.prototype.subcategoryClickEvent = function (option) {
    if (option.attr("data-disabled") === "true") {
        return;
    }
    if (!option.hasClass("active")) {
        // Reset status of the option that selected already.
        option.parent().find("li.active").removeClass("active");
        // Change status of selected option.
        option.addClass("active");
    }
    // Get subcategory number.
    this.subcategory = option.attr("data-number");
    this.page = 0;
    // Set category data of the items.
    this.itemsContainer.find("ul")
        .attr("data-subcategory", this.subcategory);
    // Search for page value.
    var page = option.attr("data-page");
    if ((typeof page !== typeof undefined)
        && (page !== false)) {
        this.itemsContainer.find("ul")
            .attr("data-page", page);
        this.page = parseInt(page);
    }
    // Refresh Colors.
    this.refreshColorBox();
    // Refresh Position Buttons.
    this.refreshPositionBox();
};

/**
 * Event: Item Click.
 * @param itemNumber
 */
FaceAppFrame.prototype.itemClickEvent = function (itemNumber) {
    // Validate app state.
    if (this.category < 0
        || this.subcategory < 0) {
        return;
    }
    var tmp = this.getValue("item");
    this.setValue("item", itemNumber);
    var result = this.itemListener(this.category,
        this.subcategory, itemNumber);
    // If item rejected.
    if (result === false) {
        this.setValue("item", tmp);
    }
};

/**
 * Event: Position Button (Up/Down) Click.
 * @param btn
 */
FaceAppFrame.prototype.positionClickEvent = function (btn) {
    // TODO Also implement this event for up/down keys of keyboard.
    if (btn.attr("data-status") === "off") {
        return;
    }
    var action = btn.attr("data-action");
    var result = this.distanceListener(this.category,
        this.subcategory, action === "up");
    if (result === false) {
        btn.attr("data-status", "off");
        return;
    }
    // Save changes.
    this.setValue("distance", result);
    var oppositeAction = (action === "up") ? "down" : "up";
    // The current action worked,
    // thus the opposite button also must be enable.
    this.positionBox.find('[data-action="' + oppositeAction + '"]')
        .attr("data-status", "on");
};

/**
 * Event: Color Click.
 * @param colorNumber
 */
FaceAppFrame.prototype.colorClickEvent = function (colorNumber) {
    // Validate app state.
    if (this.category < 0
        || this.subcategory < 0) {
        return;
    }
    this.setValue("color", colorNumber);
    this.colorListener(this.category, this.subcategory, colorNumber);
};

/**
 * Event: Button Click.
 */
FaceAppFrame.prototype.buttonClickEvent = function () {
    // TODO Implement loading state.
    this.buttonListener();
};

/**
 * Placeholder Generator.
 * @param number
 * @param clickEvent
 * @return {*|jQuery|HTMLElement}
 */
FaceAppFrame.prototype.generatePlaceholder = function (number, clickEvent) {
    var parent = $("<ul>");
    for (var i=1; i<=number; i++) {
        var item = $("<li>");
        item.attr("data-number", i)
            .on("click", function() {
                clickEvent($(this));
            });
        parent.append(item);
    }

    return parent;
};

/**
 * Generate items.
 */
FaceAppFrame.prototype.addItems = function () {
    var fd = this;
    var limit = this.itemsContainer.attr("data-limit");
    var placeholders = this.generatePlaceholder(limit, function (element) {
        var itemNumber = parseInt($(element).attr("data-number"));
        if (fd.page > 0) {
            var page = fd.pages[fd.category][fd.subcategory][fd.page];
            if (page["max"] > 0
                && itemNumber > page["max"]) {
                return;
            }
            itemNumber += page["min"] - 1;
        }
        fd.itemClickEvent(itemNumber);
    });
    this.itemsContainer.append(placeholders);
};

/**
 * Generate colors.
 */
FaceAppFrame.prototype.addColors = function () {
    var fd = this;
    var limit = this.colorBox.attr("data-limit");
    var placeholders = this.generatePlaceholder(limit, function (element) {
        var colorNumber = parseInt($(element).attr("data-number"));
        fd.colorClickEvent(colorNumber);
    });
    this.colorBox.append(placeholders);
};

/**
 * Update colors of the color box.
 */
FaceAppFrame.prototype.refreshColorBox = function () {
    var set = this.colorBoxListener(this.category, this.subcategory);
    var container = this.colorBox.find("ul");
    if (set === null) {
        container.removeAttr("data-set");
        return;
    }
    container.attr("data-set", set);
};

/**
 * Update buttons of the position box.
 */
FaceAppFrame.prototype.refreshPositionBox = function () {
    this.positionBox.find("li").attr("data-status",
        (this.positionBoxListener(this.category, this.subcategory) === true) ?
            "on" : "off");
};

/**
 * Create An Extra Subcategory and Add It to The Tabs.
 * @param category
 * @param number
 * @param name
 * @return {*|jQuery}
 */
FaceAppFrame.prototype.addSubcategory = function (category, number, name) {
    var option = $(document.createElement("li"))
        .attr("data-number", number);
    if (name) {
        option.html(name);
    }
    if (typeof category !== "object") {
        category = this.subTabs.find(
            '[data-parent="' + category + '"]');
    }
    category.append(option);
    return option;
};

/**
 * Paginate A Subcategory.
 * @param category
 * @param subcategory
 * @param pages
 */
FaceAppFrame.prototype.paginate = function (category, subcategory, pages) {
    if (!this.pages[category])
        this.pages[category] = {};
    if (!this.pages[category][subcategory])
        this.pages[category][subcategory] = {};
    var container = this.subTabs.find(
        '[data-parent="' + category + '"]');
    for (var i = 0; i < pages.length; i++) {
        var option = (i === 0) ?
            container.find('[data-number="' + subcategory + '"]') :
            this.addSubcategory(container, subcategory);
        option.attr("data-page", i + 1)
            .html(pages[i]["title"]);
        this.pages[category][subcategory][i + 1] = {
            min: pages[i]["item_start"],
            max: pages[i + 1] ? pages[i + 1]["item_start"] - 1 : 0
        };
    }
};

/**
 * Set Item Listener. Return: bool.
 * @param listener
 */
FaceAppFrame.prototype.setItemListener = function (listener) {
    this.itemListener = listener;
};

/**
 * Set Color Listener.
 * @param listener
 */
FaceAppFrame.prototype.setColorListener = function (listener) {
    this.colorListener = listener;
};

/**
 * Set Distance Listener.
 * @param listener
 */
FaceAppFrame.prototype.setDistanceListener = function (listener) {
    this.distanceListener = listener;
};

/**
 * Set ColorBox Listener. Return: color-set value.
 * @param listener
 */
FaceAppFrame.prototype.setColorBoxListener = function (listener) {
    this.colorBoxListener = listener;
};

/**
 * Set PositionBox Listener. Return: bool.
 * @param listener
 */
FaceAppFrame.prototype.setPositionBoxListener = function (listener) {
    this.positionBoxListener = listener;
};

exports = module.exports = FaceAppFrame;
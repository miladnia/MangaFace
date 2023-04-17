/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

function View() {
    this.values = {};
    this.pages = {};
    this.category = -1;
    this.subcategory = -1;
    this.page = -1;

    // jQuery selectors.
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
        console.log("View init");
        // Items.
        this.addItems();
        // Colors.
        this.addColors();
    };

    /**
     * Run and Enable Events and Buttons.
     */
    this.run = function (config) {
        var self = this;
        // Configuration.
        this.readConfig(config);
        // Initialize categories.
        var activeCategory = this.tabs.find(".active");
        this.categoryClickEvent(activeCategory);

        // Category Tabs.
        this.tabs.on("click", "li", function () {
            self.categoryClickEvent($(this));
        });

        // Subcategory Tabs.
        this.subTabs.on("click", "li", function () {
            self.subcategoryClickEvent($(this));
        });

        // Position Box.
        this.positionBox.on("click", "li", function () {
            self.positionClickEvent($(this));
        });

        // Button.
        this.buttonSave.on("click", function () {
            self.buttonClickEvent();
        });
    };

    /**
     * Read and Execute Configs.
     */
    this.readConfig = function(config) {
        for (var cat in config) {
            for (var subCat in config[cat]) {
                if (config[cat][subCat]["pages"]) {
                    this.paginate(cat, subCat, config[cat][subCat]["pages"]);
                }
            }
        }
    };

    /**
     * Set Value.
     */
    this.setValue = function (key, value, category, subcategory) {

        if (typeof subcategory === "undefined") {
            category = this.category;
            subcategory = this.subcategory;
        }

        if (typeof this.values[category] === "undefined") {
            this.values[category] = {};
        }

        if (typeof this.values[category][subcategory] === "undefined") {
            this.values[category][subcategory] = {};
        }

        this.values[category][subcategory][key] = value;
        console.log("cat", category, "sub_cat", subcategory, "val", value);
    };

    /**
     * Set Value of The Color.
     */
    this.setColorValue = function (value, category, subcategory) {
        return this.setValue("color", value, category, subcategory);
    };

    /**
     * Returns Value by Key.
     */
    this.getValue = function (key, category, subcategory) {

        if (typeof subcategory === "undefined") {
            category = this.category;
            subcategory = this.subcategory;
        }

        if ((typeof this.values[category] === "undefined")
            || (typeof this.values[category][subcategory] === "undefined")
            || (typeof this.values[category][subcategory][key] === "undefined")) {
            // If there is no value, just return the initial value.
            return (key === "distance") ? 0 : 1;
        }

        return this.values[category][subcategory][key];
    };

    /**
     * Returns Value of The Item.
     */
    this.getItemValue = function (category, subcategory) {
        return this.getValue("item", category, subcategory);
    };

    /**
     * Returns Value of The Color.
     */
    this.getColorValue = function (category, subcategory) {
        return this.getValue("color", category, subcategory);
    };
    
    var listenerAlert = function () {
        alert("The listener is NOT configured.");
    };

    // [Listener] <item>
    this.itemListener = listenerAlert;

    // [Listener] <distance>
    this.distanceListener = listenerAlert;

    // [Listener] <color>
    this.colorListener = listenerAlert;

    // [Listener] <colorBox>
    this.colorBoxListener = listenerAlert;

    // [Listener] <positionBox>
    this.positionBoxListener = listenerAlert;

    // [Listener] <button>
    this.buttonListener = listenerAlert;
}

/**
 * Autoloader.
 */
View.prototype.autoload = function (values) {
    var catTemp = this.category;
    var subCatTemp = this.subcategory;

    for (var cat in values) {
        for (var subCat in values[cat]) {
            if (values[cat][subCat]["item"] <= 0) {
                continue;
            }
            
            this.category = cat;
            this.subcategory = subCat;
            this.itemClickEvent(values[cat][subCat]["item"]);

            if (typeof values[cat][subCat]["color"] !== "undefined") {
                this.colorClickEvent(values[cat][subCat]["color"]);
            }
        }
    }

    this.category = catTemp;
    this.subcategory = subCatTemp;
};

/**
 * Load Values.
 */
View.prototype.loadValues = function (values, callback) {

    if ((typeof values === "undefined")
        || (values.length === 0)) {
        return;
    }

    var catTemp = this.category;
    var subCatTemp = this.subcategory;

    for (var cat in values) {
        for (var subCat in values[cat]) {
            values[cat][subCat]["item"]
            this.category = cat;
            this.subcategory = subCat;
            callback(cat, subCat, values[cat][subCat]);
        }
    }
    
    this.category = catTemp;
    this.subcategory = subCatTemp;
};

/**
 * Returns Face Preview Element.
 */
View.prototype.getFacePreviewElement = function () {
    return $("#fdFacePreview");
};

/**
 * Show The Final Image.
 */
View.prototype.showResult = function (imageData) {
    $("#outputImage").attr("src", imageData);
    $("#monitor").show().on("click", function (e) {
        if ($(e.target).closest("#outputImage").length)
            return;
        $(this).hide();
    });
};

/**
 * Set Distance Listener.
 */
View.prototype.setButtonListener = function (listener) {
    this.buttonListener = listener;
    // Enable The Button.
    this.buttonSave.prop("disabled", false);
};

/**
 * Event: Category Click.
 */
View.prototype.categoryClickEvent = function (option) {

    if (option.attr("data-disabled") === "true") {
        return;
    }

    if (!option.hasClass("active")) {
        // Reset status of the option that selected already.
        this.tabs.find("li.active").removeClass("active");
        // Change status of selected option.
        option.addClass("active");
    }

    // Get category number.
    this.category = option.attr("data-number");
    // Hide visible sub-tabs.
    this.subTabs.find("ul.visible").removeClass("visible");
    // Get options of the sub-tab.
    var subTabOptions = this.subTabs.find('ul[data-parent="' + this.category + '"]');
    // Show requested tab.
    subTabOptions.addClass("visible");
    // Set category data of the items.
    this.itemsContainer.find("ul").attr("data-category", this.category);
    // Which subcategory is active now?
    var subcategory = subTabOptions.find("li.active");
    // Auto select the subcategory.
    this.subcategoryClickEvent(subcategory);
};

/**
 * Event: Subcategory Click.
 */
View.prototype.subcategoryClickEvent = function (option) {

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
    this.itemsContainer.find("ul").attr("data-subcategory", this.subcategory);
    // Search for page value.
    var page = option.attr("data-page");

    if ((typeof page !== "undefined")
        && (page !== false)) {
        this.itemsContainer.find("ul").attr("data-page", page);
        this.page = parseInt(page);
    }

    // Refresh Colors.
    this.refreshColorBox();
    // Refresh Position Buttons.
    this.refreshPositionBox();
};

/**
 * Event: Item Click.
 */
View.prototype.itemClickEvent = function (itemNumber) {
    // Validate app state.
    if (this.category < 0 || this.subcategory < 0) {
        return;
    }

    var tmp = this.getValue("item");
    this.setValue("item", itemNumber);
    var result = this.itemListener(this.category, this.subcategory, itemNumber);

    // If item rejected.
    if (result === false) {
        this.setValue("item", tmp);
    }
};

/**
 * Event: Position Button (Up/Down) Click.
 */
View.prototype.positionClickEvent = function (btn) {
    // TODO Also implement this event for up/down keys of keyboard.
    if (btn.attr("data-status") === "off") {
        return;
    }

    var action = btn.attr("data-action");
    var result = this.distanceListener(
        this.category, this.subcategory, action === "up");
    
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
 */
View.prototype.colorClickEvent = function (colorNumber) {
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
View.prototype.buttonClickEvent = function () {
    // TODO Implement loading state.
    this.buttonListener();
};

/**
 * Placeholder Generator.
 * 
 * @return {*|jQuery|HTMLElement}
 */
View.prototype.generatePlaceholder = function (number, clickEvent) {
    var parent = $("<ul>");

    for (var i=1; i<=number; i++) {
        var item = $("<li>");

        item.attr("data-number", i).on("click", function() {
            clickEvent($(this));
        });

        parent.append(item);
    }

    return parent;
};

/**
 * Generate items.
 */
View.prototype.addItems = function () {
    var limit = this.itemsContainer.attr("data-limit");

    var placeholders = this.generatePlaceholder(limit, (function (element) {
        var itemNumber = parseInt($(element).attr("data-number"));

        if (this.page > 0) {
            var page = this.pages[this.category][this.subcategory][this.page];

            if (page["max"] > 0 && itemNumber > page["max"]) {
                return;
            }

            itemNumber += page["min"] - 1;
        }

        this.itemClickEvent(itemNumber);

    }).bind(this)); // generatePlaceholder()

    this.itemsContainer.append(placeholders);
};

/**
 * Generate colors.
 */
View.prototype.addColors = function () {
    var limit = this.colorBox.attr("data-limit");

    var placeholders = this.generatePlaceholder(limit, (function (element) {
        var colorNumber = parseInt($(element).attr("data-number"));
        this.colorClickEvent(colorNumber);
    }).bind(this));

    this.colorBox.append(placeholders);
};

/**
 * Update colors of the color box.
 */
View.prototype.refreshColorBox = function () {
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
View.prototype.refreshPositionBox = function () {
    this.positionBox.find("li").attr(
        "data-status",
        (this.positionBoxListener(this.category, this.subcategory) === true) ? "on" : "off");
};

/**
 * Create An Extra Subcategory and Add It to The Tabs.
 * 
 * @return {*|jQuery}
 */
View.prototype.addSubcategory = function (category, number, name) {
    var option = $(document.createElement("li"))
        .attr("data-number", number);
    
    if (name) {
        option.html(name);
    }

    if (typeof category !== "object") {
        category = this.subTabs.find('[data-parent="' + category + '"]');
    }

    category.append(option);

    return option;
};

/**
 * Paginate A Subcategory.
 */
View.prototype.paginate = function (category, subcategory, pages) {
    if (!this.pages[category])
        this.pages[category] = {};
    
    if (!this.pages[category][subcategory])
        this.pages[category][subcategory] = {};
    
    var container = this.subTabs.find('[data-parent="' + category + '"]');
    
    for (var i = 0; i < pages.length; i++) {
        var option = (i === 0) ?
            container.find('[data-number="' + subcategory + '"]') :
            this.addSubcategory(container, subcategory);
        option.attr("data-page", i + 1).html(pages[i]["title"]);
        
        this.pages[category][subcategory][i + 1] = {
            min: pages[i]["item_start"],
            max: pages[i + 1] ? pages[i + 1]["item_start"] - 1 : 0
        };
    }
};

/**
 * Set Item Listener. Return: bool.
 */
View.prototype.setItemListener = function (listener) {
    this.itemListener = listener;
};

/**
 * Set Color Listener.
 */
View.prototype.setColorListener = function (listener) {
    this.colorListener = listener;
};

/**
 * Set Distance Listener.
 */
View.prototype.setDistanceListener = function (listener) {
    this.distanceListener = listener;
};

/**
 * Set ColorBox Listener. Return: color-set value.
 */
View.prototype.setColorBoxListener = function (listener) {
    this.colorBoxListener = listener;
};

/**
 * Set PositionBox Listener. Return: bool.
 */
View.prototype.setPositionBoxListener = function (listener) {
    this.positionBoxListener = listener;
};

export default View;

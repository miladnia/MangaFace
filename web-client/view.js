/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DesignerScreenTemplate } from "./src/ui/templates.js";
import TabCom from "./src/ui/components/tab_com.js";
import GridCom from "./src/ui/components/grid_com.js";
import PinboardCom from "./src/ui/components/pinboard_com.js";

export default function DesignerScreen(viewModel)
{
    this._tpl = new DesignerScreenTemplate;
    this._model = viewModel;
    this._pinboard = null; 
    this._shapesGrid = null;
    this._colorsGrid = null;
    this._selectedRes = null;
    this._selectedShape = null;
    this._selectedColor = null;
}

DesignerScreen.prototype.render = function () {
    // var screenSections = this._model.screenSectionRepository.findAll();
    
    // this._pinboard = this._buildPinboard();

    // this._shapesGrid = this._buildShapesGrid(resList, (function (shapeName) {
    //     this._selectedShape = shapeName;
    //     this._pinResource(this._selectedRes, this._selectedShape, this._selectedColor);
    // }).bind(this));

    // this._colorsGrid = this._buildColorsGrid(resList, (function (colorName) {
    //     this._selectedColor = colorName;
    //     this._pinResource(this._selectedRes, this._selectedShape, this._selectedColor);
    // }).bind(this));

    this._buildTabs((function (designer) {
        this._selectedDesigner = designer;
        console.log(designer);
        // this._shapesGrid.switchToLayer(res.id);
        // this._colorsGrid.switchToLayer(res.id);
    }).bind(this));

    return this._tpl.getView();
};

DesignerScreen.prototype._buildTabs = function (onDesignerSelected) {
    let screenSections = this._model.screenSectionRepository.findAll();
    let tabs = new TabCom;

    for (let i = 0; i < screenSections.length; i++) {
        let section = screenSections[i];

        // Create a new tab component for inner tabs.
        let innerTabs = (new TabCom).setListener({
            onTabSelected: function (tab) {
                let designer = tab.getTag();
                onDesignerSelected(designer);
            }
        }).disable();

        // Create an inner tab for each designer in the current section.
        for (let j = 0; j < section.designers.length; j++) {
            let designer = section.designers[j];
            innerTabs.addTab(
                innerTabs.newTab().setText(designer.label).setTag(designer)
            );
        }

        // Create a new tab for the current section and assign the created inner tabs to it.
        tabs.addTab(
            tabs.newTab().setImage(section.coverUrl).setInnerTabs(innerTabs)
        );

        this._tpl.designersFrame.appendView( innerTabs.getView() );
    }

    this._tpl.sectionsFrame.appendView( tabs.getView() );
};

DesignerScreen.prototype._buildShapesGrid = function (resourceList, onShapeSelected) {
    var grid = (new GridCom(6, 6)).setListener({
        onItemSelected: function (position, layer) {
            var item = layer.getItemAt(position);
            onShapeSelected(item.getTag());
        },
        onItemDeselected: function (position, layer) {
            console.log("Shape deselected", position);
        },
        onItemReselected: function (position, layer) {
            console.log("Shape reselected", position);
        }
    });

    resourceList.forEach(function (res) {
        var layer = grid.newSection(res.id);

        for (var name = res.shapesRange.min; name <= res.shapesRange.max; name++)
            layer.addImageItem( res.getShapeIconUrl(name), name );

        grid.addSection(layer);
    });

    this._tpl.shapesFrame.append( grid.render() );

    return grid;
};

DesignerScreen.prototype._buildColorsGrid = function (resourceList, onColorSelected) {
    var grid = new GridCom(5, 3);

    grid.setListener({
        onItemSelected: function (position, layer) {
            var item = layer.getItemAt(position);
            onColorSelected(item.getTag());
        },
        onItemDeselected: function (position, layer) {
            console.log("Color deselected", position);
        },
        onItemReselected: function (position, layer) {
            console.log("Color reselected", position);
        }
    });

    resourceList.forEach(function (res) {
        var layer = grid.newSection(res.id);

        res.colors.forEach(function (color) {
            layer.addColorItem(color.code, color.codename);
        });

        grid.addSection(layer);
    });

    this._tpl.colorsFrame.append( grid.render() );

    return grid;
};

DesignerScreen.prototype._buildPinboard = function () {
    var pinboard = new PinboardCom;
    this._tpl.previewFrame.appendView(pinboard.getView());
    return pinboard;
};

DesignerScreen.prototype._pinResource = function (res, shapeName, colorName) {
    res.fragments.forEach((function (f, i) {
        console.log(f.getUrl(shapeName, colorName));

        var itemKey = res.id + '_' + i;
        var item = this._pinboard.getItem(itemKey);

        if (item) {
            // Update existing item.
            item.setImageUrl(f.getUrl(shapeName, colorName));
            return;
        }

        // Create a new item.
        this._pinboard.pinItem(
            itemKey,
            this._pinboard.newItem()
                .setImageUrl(f.getUrl(shapeName, colorName))
                .setPosition(f.position.top + "px", f.position.left + "px")
                .setPriority(f.priority));
    }).bind(this));
};

DesignerScreen.prototype._pinAsset = function (asset) {
    res.fragments.forEach((function (f, i) {
        console.log(f.getUrl(shapeName, colorName));

        var itemKey = res.id + '_' + i;
        var item = this._pinboard.getItem(itemKey);

        if (item) {
            // Update existing item.
            item.setImageUrl(f.getUrl(shapeName, colorName));
            return;
        }

        // Create a new item.
        this._pinboard.pinItem(
            itemKey,
            this._pinboard.newItem()
                .setImageUrl(f.getUrl(shapeName, colorName))
                .setPosition(f.position.top + "px", f.position.left + "px")
                .setPriority(f.priority));
    }).bind(this));
};

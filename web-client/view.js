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

const DEFAULT_PACK = "manga_male_pack";

export default function DesignerScreen(viewModel)
{
    this._tpl = new DesignerScreenTemplate;
    this._model = viewModel;
    this._pinboard = null; 
    this._grid = null;
    this._colorsGrid = null;
    this._selectedRes = null;
    this._selectedShapeId = null;
    this._selectedColorId = null;
}

DesignerScreen.prototype.render = async function () {
    this._pinboard = this._buildPinboard();

    this._grid = await this._renderGrid((itemId) => {
        this._selectedShapeId = itemId;
        this._execCommand(
            this._selectedDesigner.commandName,
            this._selectedShapeId,
            this._selectedColorId);
    });

    // this._colorsGrid = this._renderColorPalette(resList, (function (colorName) {
    //     this._selectedColor = colorName;
    //     this._pinResource(this._selectedRes, this._selectedShape, this._selectedColor);
    // }).bind(this));

    await this._renderTabs((designer) => {
        this._selectedDesigner = designer;
        console.log(designer);
        this._grid.switchToSection(designer.label);
        // this._colorsGrid.switchToSection(designer.label);
    });

    return this._tpl.getView();
};

DesignerScreen.prototype._renderTabs = async function (onDesignerSelected) {
    const screenSections = await this._model.screenSectionRepository.findAll(DEFAULT_PACK);
    const tabs = new TabCom;

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

DesignerScreen.prototype._renderGrid = async function (onItemSelected) {
    const screenSections = await this._model.screenSectionRepository.findAll(DEFAULT_PACK);

    const grid = (new GridCom(6, 6)).setListener({
        onItemSelected: function (position, section) {
            const item = section.getItemAt(position);
            const itemId = item.getTag();
            onItemSelected(itemId);
        },
        onItemDeselected: function (position, section) {
            console.log("Shape deselected", position);
        },
        onItemReselected: function (position, section) {
            console.log("Shape reselected", position);
        }
    });

    for (const section of screenSections) {
        for (const designer of section.designers) {
            const gridSection = grid.newSection(designer.label);
            const command = await this._model.commandRepository.findByName(DEFAULT_PACK, designer.commandName);

            for (let i = 1; i <= command.items; i++) {
                gridSection.addImageItem(designer.getPreviewUrl(i), i);
            }

            grid.addSection(gridSection);
        }
    }

    this._tpl.shapesFrame.append(grid.render());

    return grid;
};

DesignerScreen.prototype._renderColorPalette = async function (resourceList, onColorSelected) {
    const screenSections = await this._model.screenSectionRepository.findAll(DEFAULT_PACK);
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

DesignerScreen.prototype._execCommand = async function (commandName, shapeName, colorName) {
    const command = await this._model.commandRepository.findByName(DEFAULT_PACK, commandName);
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

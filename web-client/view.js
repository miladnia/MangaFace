/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DesignerScreenTemplate } from './src/ui/templates.js';
import TabCom from './src/ui/components/tab_com.js';
import GridCom from './src/ui/components/grid_com.js';
import PinboardCom from './src/ui/components/pinboard_com.js';


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

    this._selectedColorId = 'light';
    this._grid = await this._renderGrid((itemId) => {
        this._selectedShapeId = itemId;
        this._execCommand(
            this._selectedDesigner.commandLabel,
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
        this._grid.switchToSection(designer.title);
        // this._colorsGrid.switchToSection(designer.title);
    });

    return this._tpl.getView();
};

DesignerScreen.prototype._renderTabs = async function (onDesignerSelected) {
    const navigators = await this._model.navigatorRepository.findAll();
    const tabs = new TabCom;

    for (let i = 0; i < navigators.length; i++) {
        const navigator = navigators[i];

        // Create a new tab component for inner tabs.
        const innerTabs = (new TabCom).setListener({
            onTabSelected: function (tab) {
                let designer = tab.getTag();
                onDesignerSelected(designer);
            }
        }).disable();

        // Create an inner tab for each designer in the current section.
        for (let j = 0; j < navigator.options.length; j++) {
            let designer = navigator.options[j];
            innerTabs.addTab(
                innerTabs.newTab().setText(designer.title).setTag(designer)
            );
        }

        // Create a new tab for the current section and assign the created inner tabs to it.
        tabs.addTab(
            tabs.newTab().setImage(navigator.coverUrl).setInnerTabs(innerTabs)
        );

        this._tpl.designersFrame.appendView( innerTabs.getView() );
    }

    this._tpl.sectionsFrame.appendView( tabs.getView() );
};

DesignerScreen.prototype._renderGrid = async function (onItemSelected) {
    const navigators = await this._model.navigatorRepository.findAll();

    const grid = (new GridCom(6, 6)).setListener({
        onItemSelected: function (position, section) {
            const item = section.getItemAt(position);
            const itemId = item.getTag();
            onItemSelected(itemId);
        },
        onItemDeselected: function (position, section) {
            console.log('Shape deselected', position);
        },
        onItemReselected: function (position, section) {
            console.log('Shape reselected', position);
        }
    });

    for (const navigator of navigators) {
        for (const designer of navigator.options) {
            const gridSection = grid.newSection(designer.title);
            const command = await this._model.commandRepository.findByLabel(designer.commandLabel);

            for (let i = 1; i <= command.itemsCount; i++) {
                gridSection.addImageItem(command.getItemPreviewUrl(i), i);
            }

            grid.addSection(gridSection);
        }
    }

    this._tpl.shapesFrame.append(grid.render());

    return grid;
};

DesignerScreen.prototype._renderColorPalette = async function (resourceList, onColorSelected) {
    const navigators = await this._model.navigatorRepository.findAll();
    const grid = new GridCom(5, 3);

    grid.setListener({
        onItemSelected: function (position, layer) {
            var item = layer.getItemAt(position);
            onColorSelected(item.getTag());
        },
        onItemDeselected: function (position, layer) {
            console.log('Color deselected', position);
        },
        onItemReselected: function (position, layer) {
            console.log('Color reselected', position);
        }
    });

    resourceList.forEach(function (res) {
        const layer = grid.newSection(res.id);

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

DesignerScreen.prototype._execCommand = async function (commandLabel, item, color) {
    const command = await this._model.commandRepository.findByLabel(commandLabel);
    command.subscribedLayers.forEach(async (layerLabel) => {
        const layer = await this._model.layerRepository.findByLabel(layerLabel);
        console.log('layerLabel', layerLabel);
        console.log('layer', layer);
        
        var layerPin = this._pinboard.getItem(layerLabel);

        if (layerPin) {
            // Update existing item.
            layerPin.setImageUrl(layer.getAssetUrl(item, color));
            return;
        }

        this._pinboard.pinItem(
            layerLabel,
            this._pinboard.newItem()
                .setImageUrl(layer.getAssetUrl(item, color))
                .setPosition(layer.position.top + 'px', layer.position.left + 'px')
                .setPriority(layer.priority));
    });
};

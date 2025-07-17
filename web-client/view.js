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
import { Task } from './src/data/models.js';


export default function DesignerScreen(viewModel)
{
    this._tpl = new DesignerScreenTemplate();
    this._model = viewModel;
    this._pinboard = null; 
    this._itemGrid = null;
    this._colorGrid = null;
    
    this._latestTask = null;
    this._taskHistory = [];
}

DesignerScreen.prototype.render = async function () {
    this._pinboard = this._createPinboard();

    this._itemGrid = await this._renderItemGrid(
        (itemIndex, commandName) => {
            const color = this._colorGrid.getSelectedPlaceholderKey();

            const task = new Task({
                commandName: commandName,
                itemIndex: itemIndex,
                color: color,
            });

            this._runTask(task);
        }
    );

    this._colorGrid = await this._renderColorGrid(
        (color, commandName) => {
            const itemIndex = this._itemGrid.getSelectedPlaceholderKey();

            if (!itemIndex) {
                return;
            }

            const task = new Task({
                commandName: commandName,
                itemIndex: itemIndex,
                color: color,
            });

            this._runTask(task);
        }
    );

    await this._renderTabs(commandName => {
        this._itemGrid.switchToPage(commandName);
        this._colorGrid.switchToPage(commandName);
    });

    await this._execInitializerScript();

    return this._tpl.getView();
};

DesignerScreen.prototype._execInitializerScript = async function () {
    // TODO get the name of the initializer script as a metadata
    const script = await this._model.scriptRepository.findByName('initializer_script');
    if (!script) {
        throw new Error('No initializer script found!');
    }

    script.tasks.forEach(task => {
        this._runTask(task);

        if (this._itemGrid.hasPage(task.commandName)) {
            this._itemGrid.setPagePlaceholderSelected(task.commandName, task.itemIndex);
        }

        if (this._colorGrid.hasPage(task.commandName)) {
            this._colorGrid.setPagePlaceholderSelected(task.commandName, task.color);
        }
    });
};

DesignerScreen.prototype._renderTabs = async function (onDesignerSelected) {
    const navigators = await this._model.navigatorRepository.findAll();
    const tabs = new TabCom();

    for (let i = 0; i < navigators.length; i++) {
        const navigator = navigators[i];

        // Create a new tab component for inner tabs.
        const innerTabs = (new TabCom).setListener({
            onTabSelected: function (tab) {
                const commandName = tab.getTag();
                onDesignerSelected(commandName);
            }
        }).disable();

        // Create an inner tab for each designer in the current page.
        for (let j = 0; j < navigator.options.length; j++) {
            const designer = navigator.options[j];
            const tab = innerTabs.newTab()
                .setText(designer.title)
                .setTag(designer.commandName);
            innerTabs.addTab(tab);
        }

        // Create a new tab for the current page and assign the created inner tabs to it.
        tabs.addTab(
            tabs.newTab().setImage(navigator.coverUrl).setInnerTabs(innerTabs)
        );

        this._tpl.designersFrame.appendView( innerTabs.getView() );
    }

    this._tpl.sectionsFrame.appendView( tabs.getView() );
};

DesignerScreen.prototype._renderItemGrid = async function (onItemSelected) {
    const navigators = await this._model.navigatorRepository.findAll();

    const grid = new GridCom(6, 6)
        .setListener({
            onPlaceholderSelected: (placeholderKey, pageKey) => {
                const itemIndex = placeholderKey;
                const commandName = pageKey;
                onItemSelected(itemIndex, commandName);
            }
        });

    for (const navigator of navigators) {
        for (const designerOption of navigator.options) {
            const gridPage = grid.newPage(designerOption.commandName);
            const command = await this._model.commandRepository.findByName(designerOption.commandName);

            for (let i = 1; i <= command.itemCount; i++) {
                gridPage.addImagePlaceholder(command.getItemPreviewUrl(i), i);
            }

            grid.addPage(gridPage);
        }
    }

    this._tpl.shapesFrame.append(grid.render());

    return grid;
};

DesignerScreen.prototype._renderColorGrid = async function (onColorSelected) {
    const navigators = await this._model.navigatorRepository.findAll();

    const grid = new GridCom(5, 2)
        .setListener({
            onPlaceholderSelected: (placeholderKey, pageKey) => {
                const color = placeholderKey;
                const commandName = pageKey;
                onColorSelected(color, commandName);
            }
        });

    for (const navigator of navigators) {
        for (const designerOption of navigator.options) {
            const page = grid.newPage(designerOption.commandName);
            const command = await this._model.commandRepository.findByName(designerOption.commandName);

            command.colors.forEach(color => {
                page.addColorPlaceholder(color.previewColorCode, color.color);
            });

            if (command.colors.length) {
                // The first color is selected by default
                page.setPlaceholderSelected(
                    command.colors[0].color
                );
            }

            grid.addPage(page);
        }
    };

    this._tpl.colorsFrame.append( grid.render() );

    return grid;
};

DesignerScreen.prototype._createPinboard = function () {
    const pinboard = new PinboardCom();
    this._tpl.previewFrame.appendView(pinboard.getView());
    return pinboard;
};

DesignerScreen.prototype._runTask = async function (task) {
    console.log("task", task);
    this._taskHistory[task.commandName] = task;
    const command = await this._model.commandRepository.findByName(task.commandName);
    command.subscribedLayers.forEach(async (layerName) => {
        const layer = await this._model.layerRepository.findByName(layerName);
        const assetUrl = layer.getAssetUrl(task.itemIndex, task.color);
        const layerPin = this._pinboard.getItem(layerName);

        if (layerPin) {
            // Update the existing item
            layerPin.setImageUrl(assetUrl);
            return;
        }

        this._pinboard.pinItem(
            layerName,
            this._pinboard.newItem()
                .setImageUrl(assetUrl)
                .setPosition(layer.position.top + 'px', layer.position.left + 'px')
                .setPriority(layer.priority));
    });
};

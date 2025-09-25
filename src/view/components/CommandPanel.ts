import ItemGrid from './ItemGrid.js';
import ColorGrid from './ColorGrid.js';
import type { Manifest, Action } from '../../domain/models.js';
import type Canvas from '../../domain/Canvas.js';
import type { View } from '../../ui/ui.js';

export default class CommandPanel {
    #itemGrid: ItemGrid;
    #colorGrid: ColorGrid;

    constructor(canvas: Canvas, manifest: Manifest) {
        this.#itemGrid = new ItemGrid(canvas, manifest);
        this.#colorGrid = new ColorGrid(canvas, manifest);
    }

    async render(itemGridViewContainer: View, colorGridViewContainer: View) {
        await this.#itemGrid.render(itemGridViewContainer);
        await this.#colorGrid.render(colorGridViewContainer);
    }

    onNewAction(handleChange: (action: Action) => void) {
        // On item select
        this.#itemGrid.onItemSelect((commandName: string, assetIndex: string) => {
            handleChange({
                commandName: commandName,
                assetIndex: parseInt(assetIndex),
                colorName: this.#colorGrid.getSelectedColor(),
            });
        });

        // On color select
        this.#colorGrid.onColorSelect((commandName, colorName) => {
            // Don't run any Action, if no item is selected
            if (!this.#itemGrid.hasSelectedItem()) {
                return;
            }
            handleChange({
                commandName: commandName,
                assetIndex: this.#itemGrid.getSelectedAssetIndex(),
                colorName: colorName,
            });
        });
    }

    showCommandControllers(commandName: string) {
        this.#itemGrid.showCommandItems(commandName);
        this.#colorGrid.showCommandColors(commandName);
    }

    getElement() {
        return this.#itemGrid.getElement();
    }
}

import ItemGrid from './ItemGrid';
import ColorGrid from './ColorGrid';
import type { Manifest, Action } from '../../domain/models';
import type Composer from '../../domain/Composer';
import type { View } from '../../ui/ui';

export default class CommandPanel {
    #itemGrid: ItemGrid;
    #colorGrid: ColorGrid;

    constructor(composer: Composer, manifest: Manifest) {
        this.#itemGrid = new ItemGrid(composer, manifest);
        this.#colorGrid = new ColorGrid(composer, manifest);
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

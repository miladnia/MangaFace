// @ts-nocheck

import ItemGrid from './ItemGrid.js';
import ColorGrid from './ColorGrid.js';
import type { Task } from '../../domain/models.js';

export default class CommandPanel {
    #itemGrid = null;
    #colorGrid = null;

    constructor(canvas, navigatorRepository, commandRepository) {
        this.#itemGrid = new ItemGrid(canvas, navigatorRepository, commandRepository);
        this.#colorGrid = new ColorGrid(canvas, navigatorRepository, commandRepository);
    }

    async render(itemGridViewContainer, colorGridViewContainer) {
        await this.#itemGrid.render(itemGridViewContainer);
        await this.#colorGrid.render(colorGridViewContainer);
    }

    onNewTask(handleChange: (task: Task) => void) {
        // On item select
        this.#itemGrid.onItemSelect((commandName, itemIndex) => {
            handleChange({
                commandName: commandName,
                itemIndex: itemIndex,
                color: this.#colorGrid.getSelectedColor(),
            });
        });

        // On color select
        this.#colorGrid.onColorSelect((commandName, color) => {
            // Don't run any task, if no item is selected
            if (!this.#itemGrid.hasSelectedItem()) {
                return;
            }
            handleChange({
                commandName: commandName,
                itemIndex: this.#itemGrid.getSelectedItemIndex(),
                color: color,
            });
        });
    }

    showCommandControllers(commandName) {
        this.#itemGrid.showCommandItems(commandName);
        this.#colorGrid.showCommandColors(commandName);
    }

    getElement() {
        return this.#itemGrid.getElement();
    }
}

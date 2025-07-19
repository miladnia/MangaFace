import ItemGrid from './ItemGrid.js';
import ColorGrid from './ColorGrid.js';


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

    onNewTask(handleChange) {
        if (!this.#itemGrid.handleItemSelect) {
            return;
        }
        this.#itemGrid.onItemSelect((commandName) => {
            handleChange(
                this.#createTask(commandName));
        });
        this.#colorGrid.onColorSelect((commandName) => {
            handleChange(
                this.#createTask(commandName));
        });

    }

    #createTask(commandName) {
        return new Task({
            commandName: commandName,
            itemIndex: this.#itemGrid.getSelectedItemIndex(),
            color: this.#colorGrid.getSelectedColor(),
        })
    }

    showCommandControllers(commandName) {
        this.#itemGrid.showCommandItems(commandName);
        this.#colorGrid.showCommandColors(commandName);
    }

    getElement() {
        return this.#itemGrid.getElement();
    }
}

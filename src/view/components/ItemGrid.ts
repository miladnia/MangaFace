// @ts-nocheck

import GridCom from '../../ui/components/grid_com.js';
import type { ScriptObserver } from '../observers.js';

export default class ItemGrid implements ScriptObserver {
    #grid = new GridCom(6, 6);
    #navigatorRepository = null;
    #commandRepository = null;

    constructor(canvas, navigatorRepository, commandRepository) {
        this.#navigatorRepository = navigatorRepository;
        this.#commandRepository = commandRepository;
        canvas.registerScriptObserver(this);
    }

    async render(viewContainer) {
        const navigators = await this.#navigatorRepository.findAll();

        for (const navigator of navigators) {
            for (const navigatorOption of navigator.options) {
                const gridPage = this.#grid.newPage(navigatorOption.commandName);
                const command = await this.#commandRepository.findByName(navigatorOption.commandName);

                for (let i = 1; i <= command.itemCount; i++) {
                    gridPage.addImagePlaceholder(command.getItemPreviewUrl(i), i);
                }

                this.#grid.addPage(gridPage);
            }
        }

        this.#grid.render();
        viewContainer.appendView(this);
    }

    update(task) {
        if (this.#grid.hasPage(task.commandName)) {
            this.#grid.setPagePlaceholderSelected(task.commandName, task.itemIndex);
        }
    }

    onItemSelect(handleItemSelect) {
        this.#grid.setListener({
            onPlaceholderSelected: (placeholderKey, pageKey) => {
                const itemIndex = placeholderKey;
                const commandName = pageKey;
                handleItemSelect(commandName, itemIndex);
            }
        });
    }

    hasSelectedItem() {
        return !!this.#grid.getSelectedPlaceholderKey();
    }

    getSelectedItemIndex() {
        return this.#grid.getSelectedPlaceholderKey();
    }

    showCommandItems(commandName) {
        this.#grid.switchToPage(commandName);
    }

    getElement() {
        return this.#grid.getView().getElement();
    }
}

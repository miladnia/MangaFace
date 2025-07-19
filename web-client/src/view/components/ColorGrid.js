import GridCom from '../../ui/components/grid_com.js';


export default class ColorGrid {
    #grid = new GridCom(5, 2);
    #navigatorRepository = null;
    #commandRepository = null;

    constructor(canvas, navigatorRepository, commandRepository) {
        this.#navigatorRepository = navigatorRepository;
        this.#commandRepository = commandRepository;
        canvas.registerObserver(this);
    }

    async render(viewContainer) {
        const navigators = await this.#navigatorRepository.findAll();

        for (const navigator of navigators) {
            for (const navigatorOption of navigator.options) {
                const page = this.#grid.newPage(navigatorOption.commandName);
                const command = await this.#commandRepository.findByName(navigatorOption.commandName);

                command.colors.forEach(color => {
                    page.addColorPlaceholder(color.previewColorCode, color.color);
                });

                if (command.colors.length) {
                    // The first color is selected by default
                    page.setPlaceholderSelected(
                        command.colors[0].color
                    );
                }

                this.#grid.addPage(page);
            }
        };

        this.#grid.render();
        viewContainer.appendView(this);
    }

    update(layerAssets, task) {
        if (this.#grid.hasPage(task.commandName)) {
            this.#grid.setPagePlaceholderSelected(task.commandName, task.color);
        }
    }

    onColorSelect(handleColorSelect) {
        this.#grid.setListener({
            onPlaceholderSelected: (placeholderKey, pageKey) => {
                const color = placeholderKey;
                const commandName = pageKey;
                handleColorSelect(commandName, color);
            }
        });
    }

    getSelectedColor() {
        return this.#grid.getSelectedPlaceholderKey();
    }

    showCommandColors(commandName) {
        this.#grid.switchToPage(commandName);
    }

    getElement() {
        return this.#grid.getView().getElement();
    }
}

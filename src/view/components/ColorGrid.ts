// @ts-nocheck

import type Canvas from '../../domain/Canvas.js';
import type { Manifest } from '../../domain/models.js';
import GridCom from '../../ui/components/grid_com.js';
import type { ScriptObserver } from '../observers.js';

export default class ColorGrid implements ScriptObserver {
    #grid = new GridCom(5, 2);
    #manifest: Manifest;

    constructor(canvas: Canvas, manifest: Manifest) {
        canvas.registerScriptObserver(this);
        this.#manifest = manifest;
    }

    async render(viewContainer) {
        for (const navigator of this.#manifest.navigators) {
            for (const navOption of navigator.options) {
                const cmd = navOption.command;
                const page = this.#grid.newPage(navOption.command.name);

                cmd.colors.forEach(color => {
                    page.addColorPlaceholder(color.previewColorCode, color.color);
                });

                if (cmd.colors.length) {
                    // The first color is selected by default
                    page.setPlaceholderSelected(
                        cmd.colors[0].color
                    );
                }

                this.#grid.addPage(page);
            }
        };

        this.#grid.render();
        viewContainer.appendView(this);
    }

    update(task) {
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

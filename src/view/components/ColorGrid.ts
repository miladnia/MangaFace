import type Composer from '../../domain/Composer';
import type { Action, Manifest } from '../../domain/models';
import Grid from '../../ui/components/Grid';
import type { View } from '../../ui/ui';
import type { ScriptObserver } from '../observers';

export default class ColorGrid implements ScriptObserver {
    #grid = new Grid(1, 10);
    #manifest: Manifest;

    constructor(composer: Composer, manifest: Manifest) {
        composer.registerScriptObserver(this);
        this.#manifest = manifest;
    }

    async render(viewContainer: View) {
        for (const navigator of this.#manifest.navigators) {
            for (const navOption of navigator.options) {
                const cmd = navOption.command;
                const page = this.#grid.newPage(navOption.command.name);

                cmd.colors.forEach(color => {
                    page.addColorPlaceholder(color.colorCode, color.colorName);
                });

                if (cmd.colors.length) {
                    // The first color is selected by default
                    page.setPlaceholderSelected(
                        cmd.colors[0].colorName
                    );
                }

                this.#grid.addPage(page);
            }
        };

        this.#grid.render();
        viewContainer.appendView(this);
    }

    update(action: Action) {
        if (action.colorName && this.#grid.hasPage(action.commandName)) {
            this.#grid.setPagePlaceholderSelected(action.commandName, action.colorName);
        }
    }

    onColorSelect(handleColorSelect: (commandName: string, colorName: string) => void) {
        this.#grid.setListener({
            onPlaceholderSelected: (placeholderKey: string, pageKey: string) => {
                const colorName = placeholderKey;
                const commandName = pageKey;
                handleColorSelect(commandName, colorName);
            }
        });
    }

    getSelectedColor() {
        return this.#grid.getSelectedPlaceholderKey();
    }

    showCommandColors(commandName: string) {
        this.#grid.switchToPage(commandName);
    }

    getElement() {
        return this.#grid.getView().getElement();
    }
}

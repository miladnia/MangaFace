import { Grid } from '@ui/components';
import type { Container } from '@ui/ui';
import type { ScriptObserver } from '@domain/interfaces';
import type { Composer } from '@domain/services';
import type { Action, Manifest } from '@domain/models';

export default class ColorGrid implements ScriptObserver {
  #grid = new Grid(1, 10);
  #manifest: Manifest;

  constructor(composer: Composer, manifest: Manifest) {
    composer.registerActionObserver(this);
    this.#manifest = manifest;
  }

  async render(container: Container) {
    for (const navigator of this.#manifest.navigators) {
      for (const navOption of navigator.options) {
        const cmd = navOption.command;
        const page = this.#grid.newPage(navOption.command.name);

        cmd.colors.forEach((color) => {
          page.addColorPlaceholder(color.colorCode, color.colorName);
        });

        if (cmd.colors.length) {
          // The first color is selected by default
          page.setPlaceholderSelected(cmd.colors[0].colorName);
        }

        this.#grid.addPage(page);
      }
    }

    this.#grid.render();
    container.appendView(this);
  }

  onActionApply(action: Action) {
    if (action.colorName && this.#grid.hasPage(action.commandName)) {
      this.#grid.setPagePlaceholderSelected(
        action.commandName,
        action.colorName
      );
    }
  }

  onColorSelect(
    handleColorSelect: (commandName: string, colorName: string) => void
  ) {
    this.#grid.setListener({
      onPlaceholderSelected: (placeholderKey: string, pageKey: string) => {
        const colorName = placeholderKey;
        const commandName = pageKey;
        handleColorSelect(commandName, colorName);
      },
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

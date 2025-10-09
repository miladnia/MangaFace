import type { BaseView, Container } from '@ui/ui';
import { Grid } from '@ui/components';
import type { ScriptObserver } from '@domain/interfaces';
import type { Composer } from '@domain/services';
import type { Action, AssetIndex, Manifest } from '@domain/models';

export default class ItemGrid implements BaseView<'ul'>, ScriptObserver {
  #grid: Grid;
  #manifest: Manifest;

  constructor(composer: Composer, manifest: Manifest) {
    this.#grid = new Grid(6, 6);
    this.#manifest = manifest;
    composer.registerActionObserver(this);
  }

  async render(container: Container) {
    for (const navigator of this.#manifest.navigators) {
      for (const navOption of navigator.options) {
        const cmd = navOption.command;
        const gridPage = this.#grid.newPage(navOption.command.name);

        for (let i = 1; i <= cmd.assetsCount; i++) {
          gridPage.addImagePlaceholder(
            cmd.getPreviewUrl(i as AssetIndex),
            i.toString()
          );
        }

        this.#grid.addPage(gridPage);
      }
    }

    this.#grid.render();
    container.appendView(this);
  }

  onActionApply(action: Action) {
    if (this.#grid.hasPage(action.commandName)) {
      this.#grid.setPagePlaceholderSelected(
        action.commandName,
        action.assetIndex.toString()
      );
    }
  }

  onItemSelect(
    handleItemSelect: (commandName: string, assetIndex: string) => void
  ) {
    this.#grid.setListener({
      onPlaceholderSelected: (placeholderKey: string, pageKey: string) => {
        const assetIndex = placeholderKey;
        const commandName = pageKey;
        handleItemSelect(commandName, assetIndex);
      },
    });
  }

  hasSelectedItem() {
    return !!this.#grid.getSelectedPlaceholderKey();
  }

  getSelectedAssetIndex(): number {
    return parseInt(this.#grid.getSelectedPlaceholderKey());
  }

  showCommandItems(commandName: string) {
    this.#grid.switchToPage(commandName);
  }

  getElement() {
    return this.#grid.getView().getElement();
  }
}

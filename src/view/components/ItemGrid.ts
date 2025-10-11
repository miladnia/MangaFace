import type { BaseView, Container } from "@ui/ui";
import { Grid } from "@ui/components";
import type { ScriptObserver } from "@domain/interfaces";
import type { Composer } from "@domain/services";
import type { Action, Manifest } from "@domain/models";

export default class ItemGrid implements BaseView<"ul">, ScriptObserver {
  #grid: Grid;
  #manifest: Manifest;

  constructor(composer: Composer, manifest: Manifest) {
    this.#grid = new Grid(6, 6);
    this.#manifest = manifest;
    composer.registerActionObserver(this);
  }

  async render(container: Container) {
    this.#createGridPages();
    this.#grid.render();
    container.appendView(this);
  }

  #createGridPages() {
    for (const nav of this.#manifest.navigators) {
      for (const option of nav.options) {
        const cmd = option.command;
        const page = this.#grid.newPage(option.command.name);

        for (const index of cmd.assetIndexes()) {
          page.addImagePlaceholder(
            cmd.getPreviewUrl(index),
            index.toString()
          );
        }

        this.#grid.addPage(page);
      }
    }
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

import type Canvas from "../../domain/Canvas.js";
import type { Action, Manifest } from "../../domain/models.js";
import GridCom from "../../ui/components/grid_com.js";
import type { View } from "../../ui/ui.js";
import type { ScriptObserver } from "../observers.js";

export default class ItemGrid implements ScriptObserver {
  #grid: GridCom;
  #manifest: Manifest;

  constructor(canvas: Canvas, manifest: Manifest) {
    this.#grid = new GridCom(6, 6);
    this.#manifest = manifest;
    canvas.registerScriptObserver(this);
  }

  async render(viewContainer: View) {
    for (const navigator of this.#manifest.navigators) {
      for (const navOption of navigator.options) {
        const cmd = navOption.command;
        const gridPage = this.#grid.newPage(navOption.command.name);

        for (let i = 1; i <= cmd.assetsCount; i++) {
          gridPage.addImagePlaceholder(cmd.getPreviewUrl(i), i);
        }

        this.#grid.addPage(gridPage);
      }
    }

    this.#grid.render();
    viewContainer.appendView(this);
  }

  update(action: Action) {
    if (this.#grid.hasPage(action.commandName)) {
      this.#grid.setPagePlaceholderSelected(action.commandName, action.assetIndex);
    }
  }

  onItemSelect(handleItemSelect: (commandName: string, assetIndex: string) => void) {
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

  getSelectedAssetIndex() {
    return this.#grid.getSelectedPlaceholderKey();
  }

  showCommandItems(commandName: string) {
    this.#grid.switchToPage(commandName);
  }

  getElement() {
    return this.#grid.getView().getElement();
  }
}

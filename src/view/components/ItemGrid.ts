// @ts-nocheck

import type Canvas from "../../domain/Canvas.js";
import type { Manifest } from "../../domain/models.js";
import GridCom from "../../ui/components/grid_com.js";
import type { ScriptObserver } from "../observers.js";

export default class ItemGrid implements ScriptObserver {
  #grid: GridCom;
  #manifest: Manifest;

  constructor(canvas: Canvas, manifest: Manifest) {
    this.#grid = new GridCom(6, 6);
    this.#manifest = manifest;
    canvas.registerScriptObserver(this);
  }

  async render(viewContainer) {
    for (const navigator of this.#manifest.navigators) {
      for (const navOption of navigator.options) {
        const cmd = navOption.command;
        const gridPage = this.#grid.newPage(navOption.command.name);

        for (let i = 1; i <= cmd.itemCount; i++) {
          gridPage.addImagePlaceholder(cmd.getItemPreviewUrl(i), i);
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
      },
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

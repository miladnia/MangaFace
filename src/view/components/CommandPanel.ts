import ItemGrid from './ItemGrid';
import ColorGrid from './ColorGrid';
import type { Manifest, Action, AssetIndex, ColorName } from '../../domain/models';
import type Composer from '../../domain/Composer';
import type { Container } from '../../ui/ui';

export default class CommandPanel {
  #itemGrid: ItemGrid;
  #colorGrid: ColorGrid;

  constructor(composer: Composer, manifest: Manifest) {
    this.#itemGrid = new ItemGrid(composer, manifest);
    this.#colorGrid = new ColorGrid(composer, manifest);
  }

  async render(itemGridContainer: Container, colorGridContainer: Container) {
    await this.#itemGrid.render(itemGridContainer);
    await this.#colorGrid.render(colorGridContainer);
  }

  onNewAction(handleNewAction: (action: Action) => void) {
    // On item select
    this.#itemGrid.onItemSelect((commandName: string, assetIndex: string) => {
      handleNewAction({
        commandName: commandName,
        assetIndex: parseInt(assetIndex) as AssetIndex,
        colorName: this.#colorGrid.getSelectedColor() as ColorName,
      });
    });

    // On color select
    this.#colorGrid.onColorSelect((commandName, colorName) => {
      // Don't run any Action, if no item is selected
      if (!this.#itemGrid.hasSelectedItem()) {
        return;
      }
      handleNewAction({
        commandName: commandName,
        assetIndex: this.#itemGrid.getSelectedAssetIndex() as AssetIndex,
        colorName: colorName as ColorName,
      });
    });
  }

  showCommandControllers(commandName: string) {
    this.#itemGrid.showCommandItems(commandName);
    this.#colorGrid.showCommandColors(commandName);
  }

  getElement() {
    return this.#itemGrid.getElement();
  }
}

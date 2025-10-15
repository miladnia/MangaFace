import AssetGrid from "./ItemGrid";
import ColorGrid from "./ColorGrid";
import type { ScriptObserver } from "@domain/interfaces";
import type { Container } from "@ui/ui";
import type { Manifest, Action, Command } from "@domain/models";
import type { Composer } from "@domain/services";

type ActionTriggerHandler = (action: Action) => void;

export default class CommandPanel implements ScriptObserver {
  #itemGrid: AssetGrid;
  #colorGrid: ColorGrid;

  onActionTrigger?: ActionTriggerHandler;

  constructor(composer: Composer, manifest: Manifest) {
    const commands: Record<string, Command> = {};
    manifest.navigators.forEach((nav) => {
      nav.options.forEach((opt) => {
        commands[opt.command.name] = opt.command;
      });
    });
    this.#itemGrid = new AssetGrid(commands);
    this.#colorGrid = new ColorGrid(commands);
    composer.registerActionObserver(this);
  }

  onActionApply(action: Action) {
    this.#itemGrid.setAssetSelected(action.commandName, action.assetIndex);

    if (action.colorName) {
      this.#colorGrid.setColorSelected(action.commandName, action.colorName);
    }
  }

  switchToCommand(cmdName: string) {
    this.#itemGrid.showAssets(cmdName);
    this.#colorGrid.showCommandColors(cmdName);
  }

  render(itemGridContainer: Container, colorGridContainer: Container) {
    this.#itemGrid.onAssetSelect = (cmdName, assetIndex) => {
      // If no color is selected, don't run any Action
      if (!this.#colorGrid.hasSelectedColor()) {
        return;
      }
      this.onActionTrigger?.({
        commandName: cmdName,
        assetIndex: assetIndex,
        colorName: this.#colorGrid.selectedColor,
      });
    };

    this.#colorGrid.onColorSelect = (cmdName, colorName) => {
      // If no item is selected, don't run any Action
      if (!this.#itemGrid.hasSelectedAsset()) {
        return;
      }
      this.onActionTrigger?.({
        commandName: cmdName,
        assetIndex: this.#itemGrid.selectedAssetIndex,
        colorName: colorName,
      });
    };

    this.#itemGrid.render(itemGridContainer);
    this.#colorGrid.render(colorGridContainer);
  }
}

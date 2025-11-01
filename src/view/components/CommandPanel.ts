import AssetGrid from "./AssetGrid";
import ColorGrid from "./ColorGrid";
import type { ScriptObserver } from "@domain/interfaces";
import type { Container } from "@ui/ui";
import type { Manifest, Action, Command } from "@domain/models";
import type { Composer } from "@domain/services";

type ActionTriggerHandler = (action: Action) => void;

export default class CommandPanel implements ScriptObserver {
  #assetGrid: AssetGrid;
  #colorGrid: ColorGrid;

  onActionTrigger?: ActionTriggerHandler;

  constructor(composer: Composer, manifest: Manifest) {
    const commands: Record<string, Command> = {};
    manifest.navigators.forEach((nav) => {
      nav.options.forEach((opt) => {
        commands[opt.command.name] = opt.command;
      });
    });
    this.#assetGrid = new AssetGrid(commands);
    this.#colorGrid = new ColorGrid(commands);
    composer.registerActionObserver(this);
  }

  onActionApply(action: Action) {
    this.#assetGrid.setAssetSelected(action.commandName, action.assetIndex);

    if (action.colorName) {
      this.#colorGrid.setColorSelected(action.commandName, action.colorName);
    }
  }

  switchToCommand(cmdName: string) {
    this.#assetGrid.showAssets(cmdName);
    this.#colorGrid.showCommandColors(cmdName);
  }

  render(assetGridContainer: Container, colorGridContainer: Container) {
    this.#assetGrid.onAssetSelect = (cmdName, assetIndex) => {
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
      if (!this.#assetGrid.hasSelectedAsset()) {
        return;
      }
      this.onActionTrigger?.({
        commandName: cmdName,
        assetIndex: this.#assetGrid.selectedAssetIndex,
        colorName: colorName,
      });
    };

    this.#assetGrid.render(assetGridContainer);
    this.#colorGrid.render(colorGridContainer);
  }
}

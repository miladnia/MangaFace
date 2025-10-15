import { GridSelect } from "@ui/components";
import type { Container } from "@ui/ui";
import type { AssetIndex, Command } from "@domain/models";
import type { CoverType, GridSelectAdapter } from "@ui/components/GridSelect";

type AssetSelectHandler = (commandName: string, assetIndex: AssetIndex) => void;

export default class AssetGrid {
  #grid: GridSelect;
  #commands: Record<string, Command>;

  onAssetSelect?: AssetSelectHandler;

  constructor(commands: Record<string, Command>) {
    this.#commands = commands;
    const adapter = new AssetGridAdapter(commands);
    this.#grid = new GridSelect(36, adapter);
  }

  render(container: Container) {
    Object.values(this.#commands).forEach((cmd) => {
      if (cmd.isOptional) {
        // The first option of an optional command is blank and selected by default
        this.#grid.markOptionSelected(cmd.name, 0);
      }
    });

    this.#grid.onOptionSelect = (sessionName, optionIndex) => {
      const assetIndex = this.#toAssetIndex(sessionName, optionIndex);
      this.onAssetSelect?.(sessionName, assetIndex);
    };

    container.append(this.#grid.render());
  }

  showAssets(cmdName: string) {
    this.#grid.attachSession(cmdName);
  }

  setAssetSelected(cmdName: string, assetIndex: AssetIndex) {
    const optionIndex = this.#toOptionIndex(cmdName, assetIndex);
    const sessionName = cmdName;
    this.#grid.markOptionSelected(sessionName, optionIndex);
  }

  hasSelectedAsset() {
    return this.#grid.selectedOptionIndex >= 0;
  }

  get selectedAssetIndex(): AssetIndex {
    return this.#toAssetIndex(
      this.#grid.sessionName,
      this.#grid.selectedOptionIndex
    );
  }

  #toAssetIndex(sessionName: string, optionIndex: number): AssetIndex {
    const cmdName = sessionName;
    const cmd = this.#commands[cmdName];
    return (optionIndex + cmd.minAssetIndex) as AssetIndex;
  }

  #toOptionIndex(cmdName: string, assetIndex: AssetIndex): number {
    const cmd = this.#commands[cmdName];
    return (assetIndex - cmd.minAssetIndex) as AssetIndex;
  }
}

class AssetGridAdapter implements GridSelectAdapter {
  #commands: Record<string, Command>;

  constructor(commands: Record<string, Command>) {
    this.#commands = commands;
  }

  isValidSession(sessionName: string): boolean {
    return !!this.#commands[sessionName];
  }

  getOptionsCount(sessionName: string): number {
    const cmd = this.#commands[sessionName];
    return cmd.assetsCount;
  }

  getCover(sessionName: string, optionIndex: number): string {
    const cmdName = sessionName;
    const cmd = this.#commands[cmdName];
    if (cmd.isOptional && 0 === optionIndex) {
      return "var(--grid-select-blank-slot-bg-image)";
    }
    const assetIndex = this.#toAssetIndex(sessionName, optionIndex);
    return cmd.getPreviewUrl(assetIndex);
  }

  #toAssetIndex(sessionName: string, optionIndex: number): AssetIndex {
    const cmdName = sessionName;
    const cmd = this.#commands[cmdName];
    return (optionIndex + cmd.minAssetIndex) as AssetIndex;
  }

  getCoverType(): CoverType {
    return "image";
  }
}

import { GridSelect } from "@ui/components";
import type { Container } from "@ui/ui";
import type { ColorName, Command } from "@domain/models";
import type { CoverType, GridSelectAdapter } from "@ui/components/GridSelect";

type OptionSelectHandler = (commandName: string, colorName?: ColorName) => void;

export default class ColorGrid {
  #grid: GridSelect;
  #commands: Record<string, Command>;

  onColorSelect?: OptionSelectHandler;

  constructor(commands: Record<string, Command>) {
    this.#commands = commands;
    const adapter = new ColorGridAdapter(commands);
    this.#grid = new GridSelect(10, adapter);
  }

  render(container: Container) {
    Object.values(this.#commands).forEach((cmd) => {
      if (cmd.colors.length) {
        // The first color is selected by default
        this.#grid.markOptionSelected(cmd.name, 0);
      }
    });

    this.#grid.onOptionSelect = (sessionName, optionIndex) => {
      const colorName = this.#toColorName(sessionName, optionIndex);
      this.onColorSelect?.(sessionName, colorName);
    };

    container.append(this.#grid.render());
  }

  showCommandColors(cmdName: string) {
    this.#grid.attachSession(cmdName);
  }

  setColorSelected(cmdName: string, colorName: ColorName) {
    const optionIndex = this.#toOptionIndex(cmdName, colorName);
    const sessionName = cmdName;
    this.#grid.markOptionSelected(sessionName, optionIndex);
  }

  hasSelectedColor() {
    return !this.cmd.isColorRequired || this.#grid.selectedOptionIndex >= 0;
  }

  get selectedColor(): ColorName | undefined {
    return this.#toColorName(
      this.#grid.sessionName,
      this.#grid.selectedOptionIndex
    );
  }

  get cmd(): Command {
    const cmdName = this.#grid.sessionName;
    return this.#commands[cmdName];
  }

  #toColorName(
    sessionName: string,
    optionIndex: number
  ): ColorName | undefined {
    const cmdName = sessionName;
    const cmd = this.#commands[cmdName];
    if (!cmd.colors.length) {
      return undefined;
    }
    return cmd.colors[optionIndex].colorName;
  }

  #toOptionIndex(cmdName: string, colorName: ColorName) {
    const cmd = this.#commands[cmdName];
    return cmd.colors.findIndex((color) => color.colorName === colorName);
  }
}

class ColorGridAdapter implements GridSelectAdapter {
  #commands: Record<string, Command>;

  constructor(commands: Record<string, Command>) {
    this.#commands = commands;
  }

  isValidSession(sessionName: string): boolean {
    return !!this.#commands[sessionName];
  }

  getOptionsCount(sessionName: string): number {
    const cmd = this.#commands[sessionName];
    return cmd.colors.length;
  }

  getCover(sessionName: string, optionIndex: number): string {
    const cmdName = sessionName;
    const cmd = this.#commands[cmdName];
    return cmd.colors[optionIndex].colorCode;
  }

  getCoverType(): CoverType {
    return "color";
  }
}

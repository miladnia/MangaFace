import type { Command } from "./Command";
import type { AssetIndex, ColorName } from "./types";

export type Manifest = {
  readonly packName: string;
  readonly initializerScript: Script;
  readonly navigators: Navigator[];
  readonly commands: Record<string, Command>;
};

export type Script = {
  readonly name: string;
  readonly description: string;
  readonly actions: Action[];
};

export type Action = {
  readonly commandName: string;
  readonly assetIndex: AssetIndex;
  readonly colorName?: ColorName;
};

export type Navigator = {
  readonly coverUrl: string;
  readonly options: NavigatorOption[];
};

export type NavigatorOption = {
  readonly title: string;
  readonly command: Command;
};

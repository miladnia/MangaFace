export type Manifest = {
  readonly packName: string;
  readonly initializerScript: Script;
  readonly navigators: Navigator[];
  readonly commands: Record<string, Command>;
};

export type Navigator = {
  readonly coverUrl: string;
  readonly options: NavigatorOption[];
};

export type NavigatorOption = {
  readonly title: string;
  readonly command: Command;
};

export type Script = {
  readonly name: string;
  readonly description: string;
  readonly actions: Action[];
};

export type Action = {
  readonly commandName: string;
  readonly assetIndex: number;
  readonly colorName: string;
};

export type Position = {
  readonly top: number;
  readonly left: number;
};

export type Color = {
  readonly colorName: string;
  readonly colorCode: string;
};

export type ColorPalette = {
  readonly name: string;
  readonly colors: Color[];
};

export class Command {
  readonly name: string;
  readonly previewUrl: string;
  readonly layers: Layer[];
  readonly assetsCount: number;
  readonly colors: Color[];

  constructor(name: string, previewUrl: string, layers: Layer[]) {
    if (Command.#areLayersEmpty(layers)) {
      throw new Error(
        `Command '${name}' must have at least one subscribed layer.`
      );
    }

    const refColorPalette = Command.#getFirstColorPalette(layers);

    if (
      refColorPalette &&
      !Command.#doLayersShareSameColorPalette(layers, refColorPalette)
    ) {
      throw new Error(
        `Command '${name}' must have layers that share the same color palette.`
      );
    }

    if (!Command.#doLayersHaveSameAmountOfAssets(layers)) {
      throw new Error(`Command '${name}' must have layers with the same amount of assets.`);
    }

    this.name = name;
    this.previewUrl = previewUrl;
    this.layers = layers;
    this.assetsCount = layers[0].maxAssetIndex;
    this.colors = refColorPalette?.colors ?? [];
  }

  static #areLayersEmpty(layers: Layer[]) {
    return !Array.isArray(layers) || !layers.length;
  }

  static #getFirstColorPalette(layers: Layer[]) {
    return layers.find((lyr) => !!lyr.colorPalette)?.colorPalette;
  }

  static #doLayersShareSameColorPalette(
    layers: Layer[],
    refColorPalette: ColorPalette
  ) {
    // NOTICE: Some layers may not have a color palette, but color source.
    return layers.every(
      (lyr) => !lyr.colorPalette || lyr.colorPalette === refColorPalette
    );
  }

  static #doLayersHaveSameAmountOfAssets(layers: Layer[]) {
    return layers.every((lyr) => lyr.maxAssetIndex === layers[0].maxAssetIndex);
  }

  getPreviewUrl(assetIndex: number) {
    return this.previewUrl.replace('{asset_index}', assetIndex.toString());
  }

  isColorRequired() {
    return this.colors.length > 0;
  }
}

export class Layer {
  readonly name: string;
  readonly priority: number;
  readonly position: Position;
  readonly maxAssetIndex: number;
  readonly assetUrl: string;
  readonly colorPalette?: ColorPalette;
  readonly colorSource?: Layer;
  referencedBy: Layer[] = [];

  constructor(
    name: string,
    priority: number,
    position: Position,
    maxAssetIndex: number,
    assetUrl: string,
    colorPalette?: ColorPalette,
    colorSource?: Layer,
  ) {
    if (maxAssetIndex <= 0) {
      throw new Error(`Layer '${name}' must have at least one asset.`);
    }

    this.name = name;
    this.position = position;
    this.priority = priority;
    this.maxAssetIndex = maxAssetIndex;
    this.assetUrl = assetUrl;
    this.colorPalette = colorPalette;
    this.colorSource = colorSource;
  }

  getAssetUrl(assetIndex: number, color: string) {
    return this.assetUrl
      .replace('{asset_index}', assetIndex.toString())
      .replace('{color_name}', color);
  }

  get defaultColorName() {
    return this.colorPalette?.colors[0].colorName;
  }
}

export class LayerAsset {
  #layer: Layer;
  #assetIndex: number;
  colorName: string;

  constructor(
    layer: Layer,
    assetIndex: number,
    colorName: string,
  ) {
    this.#layer = layer;
    this.#assetIndex = assetIndex;
    this.colorName = colorName;
  }

  get layerName() {
    return this.#layer.name;
  }

  get url() {
    return this.#layer.getAssetUrl(this.#assetIndex, this.colorName);
  }

  get priority(): number {
    return this.#layer.priority;
  }

  get position(): Position {
    return this.#layer.position;
  }
}

// export class Rule {
//   constructor({ itemsToMatch, forcedLayers, conditions }) {
//     this.itemsToMatch = itemsToMatch;
//     this.forcedLayers = forcedLayers;
//     this.conditions = conditions;
//   }

//   matchItem({ item }) {
//     return this.itemsToMatch.includes(item);
//   }
// }

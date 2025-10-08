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
  readonly assetIndex: AssetIndex;
  readonly colorName?: ColorName;
};

export type AssetIndex = number & { readonly __brand: unique symbol };

export type ColorName = string & { readonly __brand: unique symbol };

export type Position = {
  readonly top: number;
  readonly left: number;
};

export type Color = {
  readonly colorName: ColorName;
  readonly colorCode: string;
};

export type ColorPalette = {
  readonly name: string;
  readonly colors: Color[];
};

export type RuleOperator = 'in' | 'not_in';

export class Command {
  readonly name: string;
  readonly previewUrl: string;
  readonly layers: Layer[];
  readonly assetsCount: number;
  readonly colors: Color[];
  readonly rules: Rule[];

  constructor(
    name: string,
    previewUrl: string,
    layers: Layer[],
    rules?: Rule[]
  ) {
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
      throw new Error(
        `Command '${name}' must have layers with the same amount of assets.`
      );
    }

    this.name = name;
    this.previewUrl = previewUrl;
    this.layers = layers;
    this.assetsCount = layers[0].maxAssetIndex;
    this.colors = refColorPalette?.colors ?? [];
    this.rules = rules ?? [];
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

  getPreviewUrl(assetIndex: AssetIndex) {
    return this.previewUrl.replace('{asset_index}', assetIndex.toString());
  }

  isColorRequired() {
    return this.colors.length > 0;
  }

  onMatchRule(assetIndex: AssetIndex, handleRule: (rule: Rule) => void) {
    this.rules.forEach((rule: Rule) => {
      if (rule.matchAssetIndex(assetIndex)) {
        handleRule(rule);
      }
    });
  }
}

export class Layer {
  readonly name: string;
  readonly assetUrl: string;
  readonly maxAssetIndex: AssetIndex;
  readonly priority: number;
  readonly colorPalette?: ColorPalette;
  readonly colorSource?: Layer;
  readonly position: Position;
  referencedBy: Layer[] = [];

  constructor(
    name: string,
    assetUrl: string,
    maxAssetIndex: AssetIndex,
    priority: number,
    colorPalette?: ColorPalette,
    colorSource?: Layer,
    position?: Position
  ) {
    if (maxAssetIndex <= 0) {
      throw new Error(`Layer '${name}' must have at least one asset.`);
    }

    if (colorPalette && !colorPalette.colors.length) {
      throw new Error(`The color palette of layer '${name}' must have colors.`);
    }

    if (colorSource && !colorSource.colorPalette) {
      throw new Error(`The color source of layer '${name}' must have palette.`);
    }

    this.name = name;
    this.assetUrl = assetUrl;
    this.maxAssetIndex = maxAssetIndex;
    this.priority = priority;
    this.colorPalette = colorPalette;
    this.colorSource = colorSource;
    this.position = position ?? { top: 0, left: 0 };
  }

  get defaultColor(): ColorName | undefined {
    return this.colorPalette?.colors[0].colorName;
  }

  getAssetUrl(assetIndex: AssetIndex, colorName?: ColorName): string {
    if (0 === assetIndex) {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABBJREFUeNpi/P//PwNAgAEACQEC/2m8kPAAAAAASUVORK5CYII=';
    }

    let url = this.assetUrl.replace('{asset_index}', assetIndex.toString());

    if (colorName) {
      url = url.replace('{color_name}', colorName);
    }

    return url;
  }
}

export interface Drawable {
  readonly url: string;
  readonly layerName: string;
  readonly priority: number;
  readonly position: Position;
}

export interface AssetObserver {
  onStateUpdate(asset: Asset): void;
}

export class Asset implements Drawable, AssetObserver {
  #layer: Layer;
  #index: AssetIndex;
  #colorName?: ColorName;
  #colorSource?: Asset;
  #observers: AssetObserver[] = [];
  #transformers?: Set<AssetTransformer>;

  constructor(layer: Layer, colorSource?: Asset, observer?: AssetObserver) {
    this.#layer = layer;
    this.#colorSource = colorSource;
    this.#index = 0 as AssetIndex;

    if (colorSource) {
      colorSource.registerObserver(this);
    }

    if (observer) {
      this.#observers.push(observer);
    }
  }

  updateState(index: AssetIndex, colorName?: ColorName) {
    this.#index = index;
    this.#colorName = colorName;
    this.notifyObservers();
  }

  onStateUpdate(): void {
    this.notifyObservers();
  }

  registerObserver(observer: AssetObserver) {
    this.#observers.push(observer);
  }

  notifyObservers() {
    this.#observers.forEach((obs) => obs.onStateUpdate(this));
  }

  applyTransformer(transformer: AssetTransformer) {
    this.#transformers ??= new Set();
    this.#transformers.add(transformer);
    this.notifyObservers();
  }

  revertTransformer(transformer: AssetTransformer) {
    if (!this.#transformers) {
      return;
    }
    this.#transformers.delete(transformer);
    this.notifyObservers();
  }

  get index(): AssetIndex {
    if (this.#transformers?.size) {
      const latestTransformer = Array.from(this.#transformers).at(-1)!;
      return latestTransformer.transform(this.#index);
    }
    return this.#index;
  }

  get colorName(): ColorName | undefined {
    if (this.#colorSource) {
      return this.#colorSource.colorName;
    }
    return this.#colorName ?? this.#layer.defaultColor;
  }

  get url(): string {
    return this.#layer.getAssetUrl(this.index, this.colorName);
  }

  get layerName(): string {
    return this.#layer.name;
  }

  get priority(): number {
    return this.#layer.priority;
  }

  get position(): Position {
    return this.#layer.position;
  }
}

export class Rule {
  #indexesToMatch: AssetIndex[];
  #operator: RuleOperator;
  readonly description?: string;
  readonly transformers: AssetTransformer[];

  constructor(
    indexesToMatch: AssetIndex[],
    operator: RuleOperator,
    transformers: AssetTransformer[],
    description?: string
  ) {
    this.#indexesToMatch = indexesToMatch;
    this.#operator = operator;
    this.transformers = transformers;
    this.description = description;
  }

  matchAssetIndex(index: AssetIndex) {
    const includes = this.#indexesToMatch.includes(index);
    return 'in' === this.#operator ? includes : !includes;
  }
}

export class AssetTransformer {
  layer: Layer;
  #targetIndex: AssetIndex;
  #sourceIndexesToMatch?: AssetIndex[];
  #operator?: RuleOperator;

  constructor(
    layer: Layer,
    targetIndex: AssetIndex,
    eligibleSourceIndexes?: AssetIndex[],
    operator?: RuleOperator
  ) {
    this.layer = layer;
    this.#targetIndex = targetIndex;
    this.#sourceIndexesToMatch = eligibleSourceIndexes;
    this.#operator = operator;
  }

  transform(assetIndex: AssetIndex) {
    return this.#isEligibleSource(assetIndex)
      ? this.#targetIndex
      : assetIndex;
  }

  #isEligibleSource(index: AssetIndex): boolean {
    if (!this.#sourceIndexesToMatch) {
      return true;
    }
    const includes = this.#sourceIndexesToMatch.includes(index);
    return 'in' === this.#operator ? includes : !includes;
  }
}

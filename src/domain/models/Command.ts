import type { Layer } from "./Layer";
import type { AssetIndex, Color, ColorPalette } from "./types";

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
  readonly layer: Layer;
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

export type RuleOperator = 'in' | 'not_in';

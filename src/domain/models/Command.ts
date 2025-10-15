import type { Layer } from "./Layer";
import type { AssetIndex, Color, ColorName, ColorPalette } from "./types";

export class Command {
  readonly name: string;
  readonly layers: Layer[];
  readonly colors: Color[];
  readonly rules: Rule[];
  #maxAssetIndex: AssetIndex;
  #isPermanent: boolean = false;
  #previewUrl: string;

  constructor(
    name: string,
    isPermanent: boolean,
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
    this.#isPermanent = isPermanent;
    this.#previewUrl = previewUrl;
    this.layers = layers;
    this.#maxAssetIndex = layers[0].maxAssetIndex;
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

  get assetsCount() {
    return this.#maxAssetIndex - this.minAssetIndex + 1;
  }

  getPreviewUrl(index: AssetIndex): string {
    if (0 === index) {
      return "";
    }
    return this.#previewUrl.replace("{asset_index}", index.toString());
  }

  onMatchRule(index: AssetIndex, handleRule: (rule: Rule) => void) {
    // No rules for blank assets
    if (0 === index) {
      return;
    }
    this.rules.forEach((rule: Rule) => {
      if (rule.matchAssetIndex(index)) {
        handleRule(rule);
      }
    });
  }

  isValidAsset(index: AssetIndex, colorName?: ColorName): boolean {
    return this.#isValidIndex(index) && this.#isValidColor(colorName);
  }

  #isValidIndex(index: AssetIndex): boolean {
    return index >= this.minAssetIndex && index <= this.#maxAssetIndex;
  }

  #isValidColor(colorName?: ColorName): boolean {
    if (this.isColorRequired) {
      if (!colorName || !this.#hasColor(colorName)) {
        return false;
      }
    }

    return true;
  }

  get isColorRequired() {
    return this.colors.length > 0;
  }

  #hasColor(colorName: ColorName) {
    return this.colors.some((color) => color.colorName === colorName);
  }

  get minAssetIndex(): AssetIndex {
    return (this.#isPermanent ? 1 : 0) as AssetIndex;
  }

  get isOptional() {
    return !this.#isPermanent;
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
    return "in" === this.#operator ? includes : !includes;
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

  transform(index: AssetIndex) {
    return this.#isEligibleSource(index) ? this.#targetIndex : index;
  }

  #isEligibleSource(index: AssetIndex): boolean {
    if (!this.#sourceIndexesToMatch) {
      return true;
    }
    const includes = this.#sourceIndexesToMatch.includes(index);
    return "in" === this.#operator ? includes : !includes;
  }
}

export type RuleOperator = "in" | "not_in";

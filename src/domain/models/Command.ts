import type { Layer } from "./Layer";
import type { Rule } from "./Rule";
import type { AssetIndex, Color, ColorName } from "./types";

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
    if (!Array.isArray(layers) || !layers.length) {
      throw new Error(`Command '${name}' must have at least one layer.`);
    }

    const maxAssetIndex = layers[0].maxAssetIndex;
    // find the first color palette
    const colorPalette = layers.find((lyr) => lyr.hasPalette())?.colorPalette;

    // Do all layers have same amount of assets?
    const layersHaveSameAssets = layers.every(
      (lyr) => lyr.maxAssetIndex === maxAssetIndex
    );
    if (!layersHaveSameAssets) {
      throw new Error(`Layers of '${name}' must have same amount of assets.`);
    }

    if (colorPalette) {
      // Do all layers share same ColorPalette?
      const layersShareSamePalette = layers.every(
        (lyr) => !lyr.hasPalette() || lyr.colorPalette === colorPalette
      );
      if (!layersShareSamePalette) {
        throw new Error(`Layers of '${name}' must share same color palette.`);
      }
    }

    this.name = name;
    this.#isPermanent = isPermanent;
    this.#previewUrl = previewUrl;
    this.layers = layers;
    this.#maxAssetIndex = maxAssetIndex;
    this.colors = colorPalette?.colors ?? [];
    this.rules = rules ?? [];
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

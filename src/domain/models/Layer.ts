import type { AssetIndex, ColorName, ColorPalette, Position } from "./types";

export class Layer {
  readonly name: string;
  readonly assetUrl: string;
  readonly maxAssetIndex: AssetIndex;
  readonly priority: number;
  readonly colorPalette?: ColorPalette;
  readonly colorSource?: Layer;
  readonly variantSource?: Layer;
  readonly position: Position;

  constructor(
    name: string,
    assetUrl: string,
    maxAssetIndex: AssetIndex,
    priority: number,
    colorPalette?: ColorPalette,
    colorSource?: Layer,
    variantSource?: Layer,
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
    this.variantSource = variantSource;
    this.position = position ?? { top: 0, left: 0 };
  }

  getAssetUrl(
    assetIndex: AssetIndex,
    colorName?: ColorName,
    variantIndex?: AssetIndex
  ): string {
    if (0 === assetIndex) {
      return this.#blankAssetUrl;
    }

    let url = this.assetUrl;
    try {
      url = this.#bindAssetIndexInUrl(url, assetIndex);
      url = this.#bindColorNameInUrl(url, colorName);
      url = this.#bindVariantIndexInUrl(url, variantIndex);
    } catch (e) {
      console.debug(e instanceof Error && e.message);
      url = this.#blankAssetUrl;
    }
    return url;
  }

  #bindAssetIndexInUrl(url: string, assetIndex: AssetIndex): string {
    if (!this.isValidIndex(assetIndex)) {
      throw new Error(
        `Invalid asset index '${assetIndex}' for layer '${this.name}'.`
      );
    }
    return url.replace("{asset_index}", assetIndex.toString());
  }

  #bindColorNameInUrl(url: string, colorName?: ColorName): string {
    if (this.colorSource) {
      colorName ??= this.colorSource.defaultColorName;
    }
    if (colorName) {
      url = url.replace("{color_name}", colorName);
    }
    return url;
  }

  #bindVariantIndexInUrl(url: string, variantIndex?: AssetIndex): string {
    if (!this.variantSource) {
      return url;
    }
    if (undefined === variantIndex || 0 === variantIndex) {
      throw new Error(`Empty 'variant index' for layer '${this.name}'.`);
    }
    if (!this.variantSource.isValidIndex(variantIndex)) {
      throw new Error(`Invalid variant index for layer '${this.name}'`);
    }
    return url.replace("{variant}", variantIndex.toString());
  }

  isValidIndex(index: AssetIndex): boolean {
    return index >= 0 && index <= this.maxAssetIndex;
  }

  hasPalette(): boolean {
    return !!this.colorPalette;
  }

  get defaultColorName(): ColorName | undefined {
    return this.colorPalette?.colors[0].colorName;
  }

  get #blankAssetUrl() {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
  }
}

import type { AssetIndex, ColorName, ColorPalette, Position } from "./types";

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
    if (assetIndex < 0 || assetIndex > this.maxAssetIndex) {
      return '';
    }

    if (0 === assetIndex) {
      // Returns a blank image
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
    }

    let url = this.assetUrl.replace("{asset_index}", assetIndex.toString());

    if (colorName) {
      url = url.replace("{color_name}", colorName);
    }

    return url;
  }
}

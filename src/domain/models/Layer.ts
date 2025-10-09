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

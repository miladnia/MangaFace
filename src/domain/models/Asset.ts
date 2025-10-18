import type { AssetTransformer } from "./Command";
import type { Layer } from "./Layer";
import type { AssetIndex, ColorName, Position } from "./types";

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
  #index: AssetIndex = 0 as AssetIndex;
  #colorName?: ColorName;
  #colorSource?: Asset;
  #variantSource?: Asset;
  #observers: AssetObserver[] = [];
  #transformers?: Set<AssetTransformer>;

  constructor(layer: Layer, colorSource?: Asset, variantSource?: Asset) {
    if (layer.colorSource && !colorSource) {
      throw new Error(`Assets of '${layer.name}' must have color source.`);
    }

    if (layer.variantSource && !variantSource) {
      throw new Error(`Assets of '${layer.name}' must have variant source.`);
    }

    this.#layer = layer;
    this.#colorSource = colorSource;
    this.#variantSource = variantSource;
    colorSource?.registerObserver(this);
    variantSource?.registerObserver(this);
  }

  registerObserver(observer: AssetObserver) {
    this.#observers.push(observer);
  }

  updateState(index: AssetIndex, colorName?: ColorName) {
    if (!this.#layer.isValidIndex(index)) {
      console.warn(`Invalid index for an asset of '${this.#layer.name}'.`);
      return;
    }
    this.#index = index;
    this.#colorName = colorName;
    this.#notifyObservers();
  }

  onStateUpdate(): void {
    this.#notifyObservers();
  }

  applyTransformer(transformer: AssetTransformer) {
    this.#transformers ??= new Set();
    this.#transformers.add(transformer);
    this.#notifyObservers();
  }

  revertTransformer(transformer: AssetTransformer) {
    if (!this.#transformers) {
      return;
    }
    this.#transformers.delete(transformer);
    this.#notifyObservers();
  }

  #notifyObservers() {
    this.#observers.forEach((obs) => obs.onStateUpdate(this));
  }

  get _index(): AssetIndex {
    if (this.#transformers?.size) {
      const latestTransformer = Array.from(this.#transformers).at(-1)!;
      return latestTransformer.transform(this.#index);
    }
    return this.#index;
  }

  get _colorName(): ColorName | undefined {
    return this.#colorSource?._colorName ?? this.#colorName;
  }

  get _variantIndex(): AssetIndex | undefined {
    return this.#variantSource?._index;
  }

  get url(): string {
    return this.#layer.getAssetUrl(
      this._index,
      this._colorName,
      this._variantIndex
    );
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

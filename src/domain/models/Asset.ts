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

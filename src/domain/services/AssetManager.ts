import {
  Asset,
  type AssetIndex,
  type AssetObserver,
  type AssetTransformer,
  type ColorName,
  type Layer,
} from "@domain/models";
import type { RenderObserver } from "@domain/interfaces";

export default class AssetManager implements AssetObserver {
  #observers: RenderObserver[] = [];
  #assets: Record<string, Asset> = {};

  updateState(layer: Layer, assetIndex: AssetIndex, colorName?: ColorName) {
    const asset = this.#getAsset(layer);
    asset.updateState(assetIndex, colorName);
  }

  onStateUpdate(asset: Asset): void {
    this.#notify(asset);
  }

  applyTransformer(transformer: AssetTransformer) {
    console.log("[Transformer Applied]", transformer);
    this.#getAsset(transformer.layer).applyTransformer(transformer);
  }

  revertTransformer(transformer: AssetTransformer) {
    console.log("[Transformer Reverted]", transformer);
    this.#getAsset(transformer.layer).revertTransformer(transformer);
  }

  #getAsset(layer: Layer): Asset {
    this.#assets[layer.name] ??= this.#createNewAsset(layer);
    return this.#assets[layer.name];
  }

  #createNewAsset(layer: Layer): Asset {
    let colorSource = layer.colorSource && this.#getAsset(layer.colorSource);
    return new Asset(layer, colorSource, this);
  }

  #notify(asset: Asset) {
    console.log("[Asset Notified]", asset.url, asset);
    this.#observers.forEach((obs) => obs.onAssetUpdate(asset));
  }

  registerObserver(observer: RenderObserver) {
    this.#observers.push(observer);
  }
}

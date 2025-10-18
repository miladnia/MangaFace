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
    console.debug("[Transformer Applied]", transformer);
    this.#getAsset(transformer.layer).applyTransformer(transformer);
  }

  revertTransformer(transformer: AssetTransformer) {
    console.debug("[Transformer Reverted]", transformer);
    this.#getAsset(transformer.layer).revertTransformer(transformer);
  }

  #getAsset(layer: Layer): Asset {
    this.#assets[layer.name] ??= this.#createNewAsset(layer);
    return this.#assets[layer.name];
  }

  #createNewAsset(layer: Layer): Asset {
    const colorSource = layer.colorSource && this.#getAsset(layer.colorSource);
    const variantSource =
      layer.variantSource && this.#getAsset(layer.variantSource);
    const newAsset = new Asset(layer, colorSource, variantSource);
    newAsset.registerObserver(this);
    return newAsset;
  }

  #notify(asset: Asset) {
    console.debug("[Asset Notified]", asset.url, asset);
    this.#observers.forEach((obs) => obs.onAssetUpdate(asset));
  }

  registerObserver(observer: RenderObserver) {
    this.#observers.push(observer);
  }
}

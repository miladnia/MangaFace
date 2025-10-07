import { AssetModel } from './models';
import type {
  Layer,
  Asset,
  AssetIndex,
  ColorName,
  AssetObserver,
  AssetTransformer,
} from './models';
import type { RenderObserver } from '../view/observers';

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
    console.log('[Transformer Applied]', transformer);
    const targetAsset = this.#getAsset(transformer.layer);
    const transformedAsset = transformer.transform(targetAsset);
    this.#submitNewAsset(transformedAsset);
  }

  revertTransformer(transformer: AssetTransformer) {
    console.log('[Transformer Reverted]', transformer);
    const transformedAsset = this.#getAsset(transformer.layer);
    const originalAsset = transformedAsset.reset();
    this.#submitNewAsset(originalAsset);
  }

  #getAsset(layer: Layer): Asset {
    this.#assets[layer.name] ??= this.#createNewAsset(layer);
    return this.#assets[layer.name];
  }

  #submitNewAsset(asset: Asset) {
    this.#assets[asset.layerName] = asset;
    this.#notify(asset);
  }

  #createNewAsset(layer: Layer): Asset {
    let colorSource = layer.colorSource && this.#getAsset(layer.colorSource);
    return new AssetModel(layer, colorSource, this);
  }

  #notify(asset: Asset) {
    console.log('[Asset Notified]', asset.url, asset);
    this.#observers.forEach((obs) => obs.update(asset));
  }

  registerObserver(observer: RenderObserver) {
    this.#observers.push(observer);
  }
}

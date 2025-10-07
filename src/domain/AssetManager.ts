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
    const asset = this.#getAsset(transformer.layer);
    transformer.transform(asset);
    this.#notify(asset);
  }

  revertTransformer(transformer: AssetTransformer) {
    console.log('[Transformer Reverted]', transformer);
    const transformedAsset = this.#getAsset(transformer.layer);
    transformedAsset.reset();
    this.#notify(transformedAsset);
  }

  #getAsset(layer: Layer): Asset {
    this.#assets[layer.name] ??= this.#createNewAsset(layer);
    return this.#assets[layer.name];
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

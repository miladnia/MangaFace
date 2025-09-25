import { LayerAsset } from './models.js';
import type { Manifest, Script, Action, Layer, Command } from './models';
import type { AssetObserver, ScriptObserver } from '../view/observers';

export default class Canvas {
  #assetObservers: AssetObserver[] = [];
  #scriptObserver: ScriptObserver[] = [];
  #manifest: Manifest;
  #addedAssets: Record<string, LayerAsset> = {};

  constructor(manifest: Manifest) {
    this.#manifest = manifest;
  }

  async runScript(script: Script) {
    script.actions.forEach(async (action) => {
      await this.applyAction(action);
      this.#notifyScriptObservers(action);
    });
  }

  async applyAction(action: Action) {
    console.log('Action', action);

    const command = this.#manifest.commands[action.commandName];
    if (!command) {
      console.warn(`The action has invalid command name '${action.commandName}'.`);
      return;
    }

    for (const layer of command.layers) {
      const assetColorName = this.resolveAssetColorName(action, layer, command);
      const newAsset = new LayerAsset(layer, action.assetIndex, assetColorName);
      this.#addedAssets[layer.name] = newAsset;
      this.#notifyAssetObservers(newAsset);
      this.handleDependentAssets(layer, assetColorName);
    }
  }

  resolveAssetColorName(action: Action, layer: Layer, command: Command): string {
    if (layer.colorSource) {
      const sourceLayer = layer.colorSource;
      return this.#addedAssets[sourceLayer.name]?.colorName ??
      sourceLayer.defaultColorName;
    }

    if (!action.colorName && command.isColorRequired()) {
      throw new Error(`The action for command '${action.commandName}' must have a color name.`);
    }

    return action.colorName;
  }

  handleDependentAssets(layer: Layer, assetColorName: string) {
    // If there are layers referenced this layer as color source
    // also update the assets of those layers
    layer.referencedBy.forEach((referencingLayer) => {
      const existingAsset = this.#addedAssets[referencingLayer.name];
      if (existingAsset) {
        existingAsset.colorName = assetColorName;
        this.#notifyAssetObservers(existingAsset);
      }
    });
  }

  registerAssetObserver(observer: AssetObserver) {
    this.#assetObservers.push(observer);
  }

  #notifyAssetObservers(asset: LayerAsset) {
    this.#assetObservers.forEach((observer) => {
      observer.update(asset);
    });
  }

  registerScriptObserver(observer: ScriptObserver) {
    this.#scriptObserver.push(observer);
  }

  #notifyScriptObservers(action: Action) {
    this.#scriptObserver.forEach((observer) => {
      observer.update(action);
    });
  }
}

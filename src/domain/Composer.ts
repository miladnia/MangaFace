import { AssetModel } from './models';
import type {
  Manifest,
  Script,
  Action,
  Layer,
  Asset,
  Rule,
  Transformer,
  Command,
} from './models';
import type { AssetObserver, ActionObserver } from '../view/observers';

/**
 * Generates Assets based on Actions
 */
export default class Composer {
  #appliedActions: Record<string, Action> = {};
  #assetObservers: AssetObserver[] = [];
  #actionObserver: ActionObserver[] = [];
  #manifest: Manifest;
  #appliedAssets: Record<string, Asset> = {};

  constructor(manifest: Manifest) {
    this.#manifest = manifest;
  }

  async runScript(script: Script) {
    script.actions.forEach(async (action) => {
      await this.applyAction(action);
      this.#notifyActionObservers(action);
    });
  }

  async applyAction(action: Action) {
    console.log('Action', action);
    const command = this.#getCommand(action.commandName);

    if (!action.colorName && command.isColorRequired()) {
      throw new Error(`The command '${command.name}' requires color.`);
    }

    command.layers.forEach((layer) => {
      this.#createAsset(layer, action.assetIndex, action.colorName);
    });

    this.#handleCommandRules(command, action.assetIndex);
    this.#appliedActions[command.name] = action;
  }

  #applyAsset(asset: Asset) {
    this.#appliedAssets[asset.layerName] = asset;
    this.#notifyAssetObservers(asset);
  }

  #createAsset(layer: Layer, assetIndex: number, colorName: string) {
    const assetColorName = this.#resolveAssetColor(colorName, layer);
    const asset = new AssetModel(layer, assetIndex, assetColorName);
    this.#applyAsset(asset);
    this.#updateColorDependentAssets(layer, assetColorName);
  }

  #resolveAssetColor(colorName: string, layer: Layer): string {
    if (!layer.colorSource) {
      return colorName;
    }

    const sourceLayer = layer.colorSource;
    const resolvedColor =
      this.#appliedAssets[sourceLayer.name]?.colorName ??
      sourceLayer.defaultColorName;
    return resolvedColor;
  }

  #updateColorDependentAssets(layer: Layer, assetColorName: string) {
    // If there are layers referenced this layer as color source,
    // then update the asset of those layers with new color name.
    layer.referencedBy.forEach((referencingLayer) => {
      const appliedAsset = this.#appliedAssets[referencingLayer.name];
      if (appliedAsset) {
        appliedAsset.colorName = assetColorName;
        this.#applyAsset(appliedAsset);
      }
    });
  }

  #handleCommandRules(command: Command, assetIndex: number) {
    const prevActionOfCommand = this.#appliedActions[command.name];
    if (prevActionOfCommand) {
      command.onMatchRule(prevActionOfCommand.assetIndex, (rule: Rule) => {
        this.#revertRule(rule);
      });
    }

    command.onMatchRule(assetIndex, (rule: Rule) => {
      this.#applyRule(rule);
    });
  }

  #applyRule(rule: Rule) {
    console.log('Rule matched', rule);

    rule.transformers.forEach((transformer: Transformer) => {
      const layerName = transformer.layerName;
      const appliedAsset = this.#appliedAssets[layerName];
      if (appliedAsset) {
        console.log('freeze', appliedAsset, transformer.assetIndex);
        this.#applyAsset(appliedAsset.freeze(transformer.assetIndex));
      }
    });
  }

  #revertRule(rule: Rule) {
    rule.transformers.forEach((transformer: Transformer) => {
      const layerName = transformer.layerName;
      const appliedAsset = this.#appliedAssets[layerName];
      if (appliedAsset) {
        console.log('unfreeze', appliedAsset.unfreeze());
        this.#applyAsset(appliedAsset.unfreeze());
      }
    });
  }

  #getCommand(commandName: string): Command {
    const command = this.#manifest.commands[commandName];

    if (!command) {
      throw new Error(`Invalid command name '${commandName}'.`);
    }

    return command;
  }

  #notifyAssetObservers(asset: Asset) {
    this.#assetObservers.forEach((observer) => {
      observer.update(asset);
    });
  }

  #notifyActionObservers(action: Action) {
    this.#actionObserver.forEach((observer) => {
      observer.update(action);
    });
  }

  registerAssetObserver(observer: AssetObserver) {
    this.#assetObservers.push(observer);
  }

  registerActionObserver(observer: ActionObserver) {
    this.#actionObserver.push(observer);
  }
}

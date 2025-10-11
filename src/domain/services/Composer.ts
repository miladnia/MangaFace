import { AssetManager } from '@domain/services';
import type {
  Manifest,
  Script,
  Action,
  Rule,
  AssetTransformer,
  Command,
  AssetIndex,
} from '@domain/models';
import type { RenderObserver, ScriptObserver } from '@domain/interfaces';

/**
 * Generates Assets based on Actions
 */
export default class Composer {
  #appliedActions: Record<string, Action> = {};
  #actionObserver: ScriptObserver[] = [];
  #manifest: Manifest;
  #assetManager: AssetManager;

  constructor(manifest: Manifest) {
    this.#manifest = manifest;
    this.#assetManager = new AssetManager();
  }

  async runScript(script: Script) {
    console.log(
      '[Script Started Running]',
      script.name,
      `(${script.description})`
    );
    script.actions.forEach(async (action) => {
      await this.applyAction(action);
      this.#notifyActionObservers(action);
    });
  }

  async applyAction(action: Action) {
    console.log('[Action Applied]', action);
    const command = this.#getCommand(action.commandName);

    if (!command.isValidAsset(action.assetIndex, action.colorName)) {
      throw new Error(`Invalid action for command '${command.name}'.`);
    }

    command.layers.forEach((layer) => {
      this.#assetManager.updateState(
        layer,
        action.assetIndex,
        action.colorName
      );
    });

    this.#handleCommandRules(command, action.assetIndex);
    this.#appliedActions[command.name] = action;
  }

  #handleCommandRules(command: Command, assetIndex: AssetIndex) {
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
    console.log('[Rule Matched]', rule.description, rule);
    rule.transformers.forEach((transformer: AssetTransformer) => {
      this.#assetManager.applyTransformer(transformer);
    });
  }

  #revertRule(rule: Rule) {
    rule.transformers.forEach((transformer: AssetTransformer) => {
      this.#assetManager.revertTransformer(transformer);
    });
  }

  #getCommand(commandName: string): Command {
    const command = this.#manifest.commands[commandName];

    if (!command) {
      throw new Error(`Invalid command name '${commandName}'.`);
    }

    return command;
  }

  #notifyActionObservers(action: Action) {
    this.#actionObserver.forEach((observer) => {
      observer.onActionApply(action);
    });
  }

  registerActionObserver(observer: ScriptObserver) {
    this.#actionObserver.push(observer);
  }

  registerAssetObserver(observer: RenderObserver) {
    this.#assetManager.registerObserver(observer);
  }
}

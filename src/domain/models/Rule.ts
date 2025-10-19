import type { Layer } from "./Layer";
import type { AssetIndex } from "./types";

export type RuleOperator = "in" | "not_in";

export class Rule {
  #indexesToMatch: AssetIndex[];
  #operator: RuleOperator;
  readonly description?: string;
  readonly transformers: AssetTransformer[];

  constructor(
    indexesToMatch: AssetIndex[],
    operator: RuleOperator,
    transformers: AssetTransformer[],
    description?: string
  ) {
    this.#indexesToMatch = indexesToMatch;
    this.#operator = operator;
    this.transformers = transformers;
    this.description = description;
  }

  matchAssetIndex(index: AssetIndex): boolean {
    // Blank assets have no rules
    if (0 === index) {
      return false;
    }
    const includes = this.#indexesToMatch.includes(index);
    return "in" === this.#operator ? includes : !includes;
  }
}

export class AssetTransformer {
  readonly layer: Layer;
  #targetIndex: AssetIndex;
  #sourceIndexesToMatch?: AssetIndex[];
  #operator?: RuleOperator;

  constructor(
    layer: Layer,
    targetIndex: AssetIndex,
    eligibleSourceIndexes?: AssetIndex[],
    operator?: RuleOperator
  ) {
    this.layer = layer;
    this.#targetIndex = targetIndex;
    this.#sourceIndexesToMatch = eligibleSourceIndexes;
    this.#operator = operator;
  }

  static transform(
    sourceIndex: AssetIndex,
    transformers: AssetTransformer[]
  ): AssetIndex {
    const transformer = AssetTransformer.#findTheMostEligibleTransformer(
      sourceIndex,
      transformers
    );
    if (!transformer) {
      return sourceIndex;
    }
    return transformer._transform(sourceIndex);
  }

  static #findTheMostEligibleTransformer(
    sourceIndex: AssetIndex,
    transformers: AssetTransformer[]
  ): AssetTransformer | undefined {
    let eligibleTransformer: AssetTransformer | undefined = undefined;
    for (let i = transformers.length - 1; i >= 0; i--) {
      const transformer = transformers[i];
      // the last eligible transformer takes precedence
      if (!eligibleTransformer && transformer._matchSourceIndex(sourceIndex)) {
        eligibleTransformer = transformer;
      }
      // even a single "Blocker Transformer" could neutralize other transformers
      if (
        transformer._isBlocker() &&
        transformer._matchSourceIndex(sourceIndex)
      ) {
        return transformer;
      }
    }
    return eligibleTransformer;
  }

  _transform(sourceIndex: AssetIndex): AssetIndex {
    if (this._isBlocker() || !this._matchSourceIndex(sourceIndex)) {
      return sourceIndex;
    }
    return this.#targetIndex;
  }

  _isBlocker(): boolean {
    // '-1' means this is a "Blocker Transformer"
    return -1 === this.#targetIndex;
  }

  _matchSourceIndex(index: AssetIndex): boolean {
    // Transformers should not be applied on blank assets
    if (0 === index) {
      return false;
    }
    if (!this.#sourceIndexesToMatch) {
      return true;
    }
    const includes = this.#sourceIndexesToMatch.includes(index);
    return "in" === this.#operator ? includes : !includes;
  }
}

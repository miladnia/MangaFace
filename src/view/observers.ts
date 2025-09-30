import type { Action, Asset } from '../domain/models';

export interface ScriptObserver {
    update(action: Action): void;
}

export interface AssetObserver {
    update(layerAsset: Asset): void;
}

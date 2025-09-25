import type { Action, LayerAsset } from '../domain/models';

export interface ScriptObserver {
    update(action: Action): void;
}

export interface AssetObserver {
    update(layerAsset: LayerAsset): void;
}

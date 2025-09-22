import type { Task, LayerAsset } from '../domain/models';

export interface ScriptObserver {
    update(task: Task): void;
}

export interface AssetObserver {
    update(layerAssets: LayerAsset[]): void;
}

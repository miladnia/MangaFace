import type { Task, LayerAsset } from '../domain/models.ts';

export interface ScriptObserver {
    update(task: Task): void;
}

export interface AssetObserver {
    update(layerAssets: LayerAsset[]): void;
}

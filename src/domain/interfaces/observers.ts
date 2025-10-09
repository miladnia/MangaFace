import type { Drawable } from "../models/Asset";
import type { Action } from "../models/Manifest";

export interface ScriptObserver {
  onActionApply(action: Action): void;
}

export interface RenderObserver {
  onAssetUpdate(asset: Drawable): void;
}

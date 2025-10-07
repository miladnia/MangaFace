import type { Action, Asset as Drawable } from '../domain/models';

export interface UIObserver {
    update(action: Action): void;
}

export interface RenderObserver {
    update(drawable: Drawable): void;
}

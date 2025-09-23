// @ts-nocheck

import type Canvas from '../../domain/Canvas.js';
import type { LayerAsset } from '../../domain/models.js';
import PinboardCom from '../../ui/components/pinboard_com.js';
import type { View } from '../../ui/ui.js';
import type { AssetObserver } from '../observers.js';

export default class CanvasPreview implements AssetObserver {
    #pinboard: PinboardCom;

    constructor(canvas: Canvas) {
        this.#pinboard = new PinboardCom();
        canvas.registerAssetObserver(this);
    }

    async render(viewContainer: View) {
        viewContainer.appendView(this);
    }

    update(layerAssets: LayerAsset[]) {
        layerAssets.forEach(layerAsset => {
            const pin = this.#pinboard.getItem(layerAsset.layerName);

            if (pin) {
                // Update the existing item
                pin.setImageUrl(layerAsset.url);
                return;
            }

            this.#pinboard.pinItem(
                layerAsset.layerName,
                this.#pinboard.newItem()
                    .setImageUrl(layerAsset.url)
                    .setPosition(layerAsset.position.top + 'px', layerAsset.position.left + 'px')
                    .setPriority(layerAsset.priority));
        });
    }

    getElement() {
        return this.#pinboard.getView().getElement();
    }
}

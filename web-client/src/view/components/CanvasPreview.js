import PinboardCom from '../../ui/components/pinboard_com.js';


export default class CanvasPreview {
    #pinboard = new PinboardCom();
    #canvas = null;

    constructor(canvas) {
        this.#canvas = canvas;
        canvas.registerObserver(this);
    }

    async render(viewContainer) {
        viewContainer.appendView(this);
    }

    update(layerAssets) {
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

import type Canvas from '../../domain/Canvas.js';
import type { LayerAsset } from '../../domain/models.js';
import PinBoardCom from '../../ui/components/pinboard_com.js';
import type { View } from '../../ui/ui.js';
import type { AssetObserver } from '../observers.js';

export default class CanvasPreview implements AssetObserver {
  #board: PinBoardCom;

  constructor(canvas: Canvas) {
    this.#board = new PinBoardCom();
    canvas.registerAssetObserver(this);
  }

  async render(viewContainer: View) {
    viewContainer.appendView(this);
  }

  update(asset: LayerAsset) {
    const pin = this.#board.getItem(asset.layerName);

    if (pin) {
      // Update the existing item
      pin.setImageUrl(asset.url);
      return;
    }

    this.#board.pinItem(
      asset.layerName,
      this.#board
        .newItem()
        .setImageUrl(asset.url)
        .setPosition(asset.position.top + 'px', asset.position.left + 'px')
        .setPriority(asset.priority)
    );
  }

  getElement() {
    return this.#board.getView().getElement();
  }
}

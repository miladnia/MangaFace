import type Composer from '../../domain/Composer';
import type { Asset } from '../../domain/models';
import PinBoard from '../../ui/components/PinBoard';
import ImageCanvas from '../../ui/components/LayeredImage';
import type { View } from '../../ui/ui';
import type { AssetObserver } from '../observers';

/**
 * Observes Assets, renders them in the UI
 */
export default class Renderer implements AssetObserver {
  #board: PinBoard;
  #canvas: ImageCanvas | null = null;

  constructor(composer: Composer) {
    this.#board = new PinBoard();
    composer.registerAssetObserver(this);
  }

  async renderAsDataURL(): Promise<string> {
    this.#canvas ??= new ImageCanvas(180, 187);
    await this.#canvas.drawImages(this.#board.images);
    return this.#canvas.toDataURL();
  }

  update(asset: Asset) {
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

  async render(viewContainer: View) {
    viewContainer.appendView(this);
  }

  getElement() {
    const container = document.createElement('div');
    container.className = 'renderer-container';
    container.appendChild(this.#board.getElement());
    const dlBtn = document.createElement('button');
    dlBtn.textContent = 'DOWNLOAD';
    dlBtn.onclick = async () => {
      const url = await this.renderAsDataURL();
      const link = document.createElement('a');
      link.download = this.#generateFilename('avatar', 'png');
      link.href = url;
      link.click();
    }
    container.appendChild(dlBtn);
    return container;
  }

  #generateFilename(prefix: string, extension: string) {
    const now = new Date();
  
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const dd = String(now.getDate()).padStart(2, "0");
  
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
  
    return `${prefix}_${yyyy}${mm}${dd}_${hh}${min}${ss}.${extension}`;
  }
}

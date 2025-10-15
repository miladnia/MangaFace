import type { Container } from '@ui/ui';
import { ImageCanvas, PinBoard } from '@ui/components';
import type { RenderObserver } from '@domain/interfaces';
import type { Composer } from '@domain/services';
import type { Drawable } from '@domain/models';

/**
 * Observes Assets, renders them in the UI
 */
export default class Renderer implements RenderObserver {
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

  onAssetUpdate(asset: Drawable) {
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
        .setPosition(asset.position.top, asset.position.left)
        .setPriority(asset.priority)
    );
  }

  render(container: Container) {
    container.appendView(this);
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
    };
    container.appendChild(dlBtn);
    return container;
  }

  #generateFilename(prefix: string, extension: string) {
    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const dd = String(now.getDate()).padStart(2, '0');

    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    return `${prefix}_${yyyy}${mm}${dd}_${hh}${min}${ss}.${extension}`;
  }
}

import PinBoard from '../../ui/components/PinBoard';
import ImageCanvas from '../../ui/components/LayeredImage';
import type Composer from '../../domain/Composer';
import type { Drawable } from '../../domain/models';
import type { Container } from '../../ui/ui';
import type { RenderObserver } from '../observers';

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

  update(drawable: Drawable) {
    const pin = this.#board.getItem(drawable.layerName);

    if (pin) {
      // Update the existing item
      pin.setImageUrl(drawable.url);
      return;
    }

    this.#board.pinItem(
      drawable.layerName,
      this.#board
        .newItem()
        .setImageUrl(drawable.url)
        .setPosition(drawable.position.top, drawable.position.left)
        .setPriority(drawable.priority)
    );
  }

  async render(container: Container) {
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

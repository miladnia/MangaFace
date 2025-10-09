export default class ImageCanvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    // HiDPI scaling
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    const ctx = this.canvas.getContext('2d');
    if (null === ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.context = ctx;
    this.context.scale(dpr, dpr);
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  async drawImages(imgs: HTMLImageElement[]) {
    await this.#ensureImageAreLoaded(imgs);
    this.#sortImgs(imgs);
    this.#clearContext();

    imgs.forEach((img) => {
      this.#drawImage(img);
    });
  }

  #drawImage(img: HTMLImageElement) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const x = parseInt(img.style.left) || 0;
    const y = parseInt(img.style.top) || 0;
    this.context.drawImage(img, x, y, w, h);
  }

  toDataURL(): string {
    return this.canvas.toDataURL("image/png");
  }

  #ensureImageAreLoaded(imgs: HTMLImageElement[]) {
    return Promise.all(imgs.map(img => {
      return img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve; // resolve anyway to not block forever
          });
    }));
  }

  #sortImgs(imgs: HTMLImageElement[]): void {
    // Sort images by z-index (lowest first)
    imgs.sort((a, b) => {
      const za = parseInt(a.style.zIndex) || 0;
      const zb = parseInt(b.style.zIndex) || 0;
      return za - zb;
    });
  }

  #clearContext(): void {
    // Clear and clip
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.beginPath();
    this.context.rect(0, 0, this.width, this.height);
    this.context.clip();
  }
}

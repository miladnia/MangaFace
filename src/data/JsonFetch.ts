class JsonFetch {
  static #cache: { [url: string]: unknown } = {};

  static async getData<T>(url: string): Promise<T> {
    if (!this.#cache[url]) {
      this.#cache[url] = this.#fetchUrl(url);
    }

    return this.#cache[url] as T;
  }

  static async #fetchUrl(url: string) {
    const response = await fetch(`${url}?v=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`[manifest] HTTP status: ${response.status}`);
    }

    return response.json();
  }
}

export default JsonFetch;


/**
 * This registry is used to maintain the various browser data objects from different GTAV multiplayer providers.
 *
 * @remarks
 * Currently, only RageMP is supported
 */
class BrowserRegistry<T> {
  private browserDict: Map<number, T> = new Map<number, T>();
  private idCounter = 0;

  private generateUid(): number {
    return ++this.idCounter;
  }

  /**
   * Registers a browser with an unique id
   * @param browser The browser to register
   *
   * @returns The unique id of the browser
   */
  public register(browser: T): number {
    for (const n of Array.from(this.browserDict.entries())) {
      if (n[1] === browser) {
        return n[0];
      }
    }

    const uid = this.generateUid();
    this.browserDict.set(uid, browser);
    return uid;
  }

  /**
   * Unregisters a browser
   *
   * @param browser The browser to unregister
   */
  public unregister(browser: T): void {
    Array.from(this.browserDict.entries()).forEach(n => {
      if (n[1] === browser) {
        this.browserDict.delete(n[0]);
      }
    });
  }

  /**
   * Returns the unique identifier of a browser object
   *
   * @param browser The browser object to get the uid from
   */
  public getId(browser: T): number | undefined {
    for (const n of Array.from(this.browserDict.entries())) {
      if (n[1] === browser) {
        return n[0];
      }
    }

    return undefined;
  }

  /**
   * Returns the browser attached to the unique id.
   *
   * @param id The unique identifier of a browser.
   */
  public getBrowser(id: number): T | undefined {
    return this.browserDict.get(id);
  }
}

export default BrowserRegistry;

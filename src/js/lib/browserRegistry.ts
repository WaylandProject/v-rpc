
class BrowserRegistry<T> {
  private browserDict: Map<number, T> = new Map<number, T>();

  private generateUid(): number {
    return Math.round(2147483648 - (Math.random() * 4294967296));
  }

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

  public unregister(browser: T): void {
    Array.from(this.browserDict.entries()).forEach(n => {
      if (n[1] === browser) {
        this.browserDict.delete(n[0]);
      }
    });
  }

  public getId(browser: T): number | undefined {
    for (const n of Array.from(this.browserDict.entries())) {
      if (n[1] === browser) {
        return n[0];
      }
    }

    return undefined;
  }

  public getBrowser(id: number): T | undefined {
    return this.browserDict.get(id);
  }
}

export default BrowserRegistry;

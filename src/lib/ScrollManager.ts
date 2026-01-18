class ScrollRestorationManager {
  private scrollPositions = new Map<string, number>();

  savePosition(key: string, position: number) {
    this.scrollPositions.set(key, position);
  }

  getPosition(key: string): number | undefined {
    return this.scrollPositions.get(key);
  }

  clearPosition(key: string) {
    this.scrollPositions.delete(key);
  }

  clearAll() {
    this.scrollPositions.clear();
  }
}

export const scrollManager = new ScrollRestorationManager();
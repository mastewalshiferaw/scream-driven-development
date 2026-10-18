const WINDOW_MS = 1000;
const KPS_FULL = 20; // keystrokes/sec that count as max intensity

export class KeystrokeMonitor {
  constructor({ onKey } = {}) {
    this.onKey = onKey;
    this.stamps = [];
    this.total = 0;
    this.handler = this.handle.bind(this);
  }

  attach() {
    window.addEventListener('keydown', this.handler);
  }

  detach() {
    window.removeEventListener('keydown', this.handler);
  }

  handle(e) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    this.stamps.push(performance.now());
    this.total += 1;
    this.onKey?.();
  }

  /** @returns {{ kps: number, keystrokes: number, intensity: number }} */
  read() {
    const now = performance.now();
    while (this.stamps.length && now - this.stamps[0] > WINDOW_MS) this.stamps.shift();

    const kps = this.stamps.length * (1000 / WINDOW_MS);
    return {
      kps,
      keystrokes: this.total,
      intensity: Math.min(1, kps / KPS_FULL),
    };
  }
}
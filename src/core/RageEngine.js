export const PIPELINE_START = 87;
export const PIPELINE_TARGET = 100;

const SCREAM_GAIN = 5;      // % gained per second at full intensity
const REGRESS_RATE = 6;     // % lost per second when idle
const IDLE_THRESHOLD = 0.08;
const SCREAM_THRESHOLD = 0.3;

/**
 * Input signal contract (any adapter can produce this):
 *   intensity  0..1   normalized rage level
 *   db         number dBFS (mic only)
 *   kps        number keystrokes/sec (keyboard only)
 *   keystrokes number total keystrokes (keyboard only)
 */
export class RageEngine {
  constructor() {
    this.progress = PIPELINE_START;
    this.intensity = 0;
    this.done = false;
    this.elapsed = 0;
    this.stats = {
      peakIntensity: 0,
      peakDb: -Infinity,
      peakKps: 0,
      keystrokes: 0,
      screamSeconds: 0,
      regressions: 0,
    };
    this._wasRegressing = false;
  }

  tick(dt, { intensity = 0, db = -Infinity, kps = 0, keystrokes = 0 } = {}) {
    if (this.done) return;

    this.elapsed += dt;
    this.intensity = intensity;

    const s = this.stats;
    s.peakIntensity = Math.max(s.peakIntensity, intensity);
    s.peakDb = Math.max(s.peakDb, db);
    s.peakKps = Math.max(s.peakKps, kps);
    s.keystrokes = Math.max(s.keystrokes, keystrokes);
    if (intensity >= SCREAM_THRESHOLD) s.screamSeconds += dt;

    const pushing = intensity > IDLE_THRESHOLD;
    if (pushing) {
      this.progress += intensity * SCREAM_GAIN * dt;
    } else {
      this.progress -= REGRESS_RATE * dt;
      if (!this._wasRegressing) s.regressions += 1;
    }
    this._wasRegressing = !pushing;

    this.progress = Math.max(0, Math.min(PIPELINE_TARGET, this.progress));
    if (this.progress >= PIPELINE_TARGET) this.done = true;
  }
}
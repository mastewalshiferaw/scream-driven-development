const DB_FLOOR = -60;  // silence
const DB_CEIL = -10;   // full scream

export class MicrophoneMonitor {
  stream = null;
  ctx = null;
  analyser = null;
  buf = null;

  async start() {
    // Disable processing so raw volume is measured, not a cleaned-up signal.
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.buf = new Float32Array(this.analyser.fftSize);
    this.ctx.createMediaStreamSource(this.stream).connect(this.analyser);
  }

  /** @returns {{ db: number, intensity: number }} */
  read() {
    if (!this.analyser) return { db: -Infinity, intensity: 0 };

    this.analyser.getFloatTimeDomainData(this.buf);
    let sum = 0;
    for (let i = 0; i < this.buf.length; i++) sum += this.buf[i] * this.buf[i];

    const rms = Math.sqrt(sum / this.buf.length);
    const db = 20 * Math.log10(rms || 1e-10);
    const intensity = Math.min(1, Math.max(0, (db - DB_FLOOR) / (DB_CEIL - DB_FLOOR)));
    return { db, intensity };
  }

  stop() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.ctx?.close();
    this.stream = this.ctx = this.analyser = null;
  }
}
let ctx = null;
let noiseBuf = null;
let staticNode = null;

// Static bed volume. Lower this to make the static quieter, or set to 0 to mute.
export const STATIC_VOLUME = 0.01;

// Intensity below this level keeps the static silent.
const STATIC_GATE = 0.3;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function getNoise(c) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

/** Mechanical keyboard: low thud plus a bandpassed noise click. */
export function playThudClack() {
  const c = getCtx();
  const t = c.currentTime;

  // Thud: pitch-dropping sine
  const osc = c.createOscillator();
  const oscGain = c.createGain();
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
  oscGain.gain.setValueAtTime(0.5, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(oscGain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.13);

  // Clack: short bandpassed noise burst
  const src = c.createBufferSource();
  src.buffer = getNoise(c);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2800;
  bp.Q.value = 2;
  const clackGain = c.createGain();
  clackGain.gain.setValueAtTime(0.6, t);
  clackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  src.connect(bp).connect(clackGain).connect(c.destination);
  src.start(t, Math.random() * 1.5);
  src.stop(t + 0.05);
}

/** Looping static bed for screaming. Starts silent; gain is driven by setStaticLevel. */
export function startStatic() {
  if (staticNode) return;
  const c = getCtx();
  const src = c.createBufferSource();
  src.buffer = getNoise(c);
  src.loop = true;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1200;
  const g = c.createGain();
  g.gain.value = 0;
  src.connect(hp).connect(g).connect(c.destination);
  src.start();
  staticNode = { src, g };
}

/** Call every frame. Static stays silent below the gate and flutters above it. */
export function setStaticLevel(level) {
  if (!staticNode) return;
  const gated = level > STATIC_GATE ? level : 0;
  const flutter = 0.7 + Math.random() * 0.3;
  staticNode.g.gain.setTargetAtTime(
    gated * STATIC_VOLUME * flutter,
    getCtx().currentTime,
    0.03
  );
}

/** Fades the static out and stops it. Safe to call when nothing is playing. */
export function stopStatic() {
  if (!staticNode) return;
  const c = getCtx();
  const { src, g } = staticNode;
  g.gain.setTargetAtTime(0, c.currentTime, 0.05);
  src.stop(c.currentTime + 0.2);
  staticNode = null;
}
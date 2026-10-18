import { useCallback, useEffect, useRef, useState } from 'react';
import { RageEngine } from '../core/RageEngine';
import { MicrophoneMonitor } from '../services/microphone';
import { KeystrokeMonitor } from '../services/keyboard';
import { playThudClack, startStatic, setStaticLevel, stopStatic } from '../services/sfx';

const PUBLISH_MS = 50;
const INITIAL = {
  progress: 87,
  done: false,
  stats: null,
  live: { db: -Infinity, kps: 0 },
};

export function useRageSession() {
  const [snapshot, setSnapshot] = useState(INITIAL);
  const [error, setError] = useState(null);
  const intensityRef = useRef(0); // read per-frame by ShakeWrapper, no re-render
  const runRef = useRef(null);

  const teardown = useCallback(() => {
    const run = runRef.current;
    if (!run) return;
    cancelAnimationFrame(run.raf);
    run.mic?.stop();
    run.keys?.detach();
    stopStatic();
    runRef.current = null;
    intensityRef.current = 0;
  }, []);

  const start = useCallback(async (mode) => {
    teardown();
    setError(null);

    const engine = new RageEngine();
    const run = { engine, mic: null, keys: null, raf: 0 };
    runRef.current = run;

    try {
      if (mode === 'scream') {
        run.mic = new MicrophoneMonitor();
        await run.mic.start();
        startStatic();
      } else {
        run.keys = new KeystrokeMonitor({ onKey: playThudClack });
        run.keys.attach();
      }
    } catch {
      teardown();
      setError(
        mode === 'scream'
          ? 'Microphone access denied. Try Rage Mash instead.'
          : 'Keyboard input unavailable.'
      );
      return false;
    }

    let last = performance.now();
    let lastPublish = 0;

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const reading = mode === 'scream' ? run.mic.read() : run.keys.read();
      engine.tick(dt, reading);
      intensityRef.current = engine.intensity;
      if (mode === 'scream') setStaticLevel(engine.intensity);

      if (engine.done || now - lastPublish >= PUBLISH_MS) {
        lastPublish = now;
        setSnapshot({
          progress: engine.progress,
          done: engine.done,
          stats: { ...engine.stats, elapsed: engine.elapsed },
          live: { db: reading.db ?? -Infinity, kps: reading.kps ?? 0 },
        });
      }

      if (engine.done) {
        teardown();
        return;
      }
      run.raf = requestAnimationFrame(frame);
    };

    run.raf = requestAnimationFrame(frame);
    return true;
  }, [teardown]);

  const reset = useCallback(() => {
    teardown();
    setError(null);
    setSnapshot(INITIAL);
  }, [teardown]);

  useEffect(() => teardown, [teardown]);

  return {
    ...snapshot,
    error,
    intensityRef,
    start,
    stop: teardown,
    reset,
  };
}
import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { useRageSession } from './hooks/useRageSession';
import Terminal from './components/Terminal';
import ProgressBar from './components/ProgressBar';
import ShakeWrapper from './components/ShakeWrapper';
import CRTOverlay from './components/CRTOverlay';
import RageReceipt from './components/RageReceipt';

const BOOT_SCRIPT = [
  [0, '$ sdd deploy --env production'],
  [600, 'Building...'],
  [1500, 'Installing dependencies...'],
  [2600, 'added 1,437 packages (one of them is left-pad)'],
  [3300, 'Running tests... 412 passed, 1 failed'],
];

const fmtDb = (v) => (Number.isFinite(v) ? `${v.toFixed(1)} dB` : '--');

export default function App() {
  const session = useRageSession();

  const [phase, setPhase] = useState('idle'); // idle | booting | blocked | live | done
  const [mode, setMode] = useState('scream'); // scream | mash
  const [lines, setLines] = useState([]);
  const [bootProgress, setBootProgress] = useState(0);

  const timers = useRef([]);
  const anim = useRef(null);
  const idRef = useRef(0);

  const push = (text, tone) =>
    setLines((l) => [...l, { id: idRef.current++, text, tone }]);

  const cancelBoot = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    anim.current?.stop();
  };

  useEffect(() => cancelBoot, []);

  useEffect(() => {
    if (session.done) {
      push('Pipeline unblocked. Deploying to production...');
      setPhase('done');
    }
  }, [session.done]);

  const handleDeploy = () => {
    cancelBoot();
    session.reset();
    setLines([]);
    setBootProgress(0);
    setPhase('booting');

    BOOT_SCRIPT.forEach(([ms, text]) =>
      timers.current.push(setTimeout(() => push(text), ms))
    );

    anim.current = animate(0, 92, {
      duration: 4,
      ease: 'easeOut',
      onUpdate: setBootProgress,
      onComplete: () => {
        push('ERROR: Pipeline Blocked', 'error');
        push('Production approval requires a minimum level of frustration.', 'dim');
        setPhase('blocked');
      },
    });
  };

  const handleUnblock = async (chosenMode) => {
    setMode(chosenMode);
    push(
      chosenMode === 'scream'
        ? '> Microphone armed. Scream to unblock.'
        : '> Rage Mash engaged. Type anything, fast.',
      'dim'
    );
    const ok = await session.start(chosenMode);
    if (ok) setPhase('live');
  };

  const handleAbort = () => {
    session.stop();
    setPhase('blocked');
    push('Rage aborted. Pipeline remains blocked.', 'error');
  };
  const progress = phase === 'booting' ? bootProgress : session.progress ?? 50;

  return (
    <ShakeWrapper intensityRef={session.intensityRef}>
      <main className="flex min-h-screen items-center justify-center bg-black p-6 font-mono text-term">
        <Terminal lines={lines}>
          {phase === 'idle' && (
            <button
              onClick={handleDeploy}
              className="mt-4 border border-err bg-err/10 px-6 py-3 font-bold text-err transition hover:bg-err hover:text-black"
            >
              Deploy to Production
            </button>
          )}

          {phase !== 'idle' && phase !== 'done' && (
            <div className="mt-4 space-y-4">
              <ProgressBar value={progress} />

              {phase === 'blocked' && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleUnblock('scream')}
                    className="border border-term px-4 py-2 transition hover:bg-term hover:text-black"
                  >
                    Unblock: SCREAM AT IT!
                  </button>
                  <button
                    onClick={() => handleUnblock('mash')}
                    className="border border-term/60 px-4 py-2 text-term/80 transition hover:bg-term/20"
                  >
                    Unblock: SMASH YOUR KEYBOARDS! (If you can't scream!)
                  </button>
                </div>
              )}

              {phase === 'live' && (
                <div className="space-y-2">
                  <p className="animate-pulse text-center text-sm font-bold">
                    {mode === 'scream' ? 'SCREAM INTO THE MIC' : 'MASH ANY KEY'}
                  </p>
                  <p className="text-xs text-term/70">
                    mic {fmtDb(session.live.db)} · kps {session.live.kps.toFixed(1)}
                  </p>
                  <button
                    onClick={handleAbort}
                    className="text-xs text-err underline underline-offset-4"
                  >
                    abort
                  </button>
                </div>
              )}

              {session.error && <p className="text-sm text-err">{session.error}</p>}
            </div>
          )}
        </Terminal>

        {phase === 'done' && (
          <RageReceipt stats={session.stats} onRestart={handleDeploy} />
        )}
      </main>
      <CRTOverlay />
    </ShakeWrapper>
  );
}
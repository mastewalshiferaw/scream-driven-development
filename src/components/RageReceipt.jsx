import { motion } from 'framer-motion';

const pct = (v) => `${Math.round(v * 100)}%`;
const fmtDb = (v) => (Number.isFinite(v) ? `${v.toFixed(1)} dBFS` : '—');

function verdict(s) {
  if (s.peakIntensity > 0.95) {
    return 'በጣም አሪፍ!! ተረጋጉ? ወይስ መድገም ይፈልጋሉ?';
  }
  if (s.peakIntensity > 0.6) {
    return 'ጥሩ!! መድገም ይፈልጋሉ? እንደገና አስጀምሩት';
  }
  return 'አይይይ። ንዴቶን ተወጡበት እንጂ።';
}

export default function RageReceipt({ stats, onRestart }) {
  if (!stats) return null;

  const rows = [
    ['Peak Rage', pct(stats.peakIntensity)],
    ['Peak Volume', fmtDb(stats.peakDb)],
    ['Peak KPS', stats.peakKps.toFixed(1)],
    ['Keystrokes', stats.keystrokes],
    ['Time Screaming', `${stats.screamSeconds.toFixed(1)}s`],
    ['Times Regressed', stats.regressions],
    ['Total Time', `${stats.elapsed.toFixed(1)}s`],
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-6">
      <motion.div
        initial={{ y: -60, rotate: -4, opacity: 0 }}
        animate={{ y: 0, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        className="w-full max-w-sm border-2 border-dashed border-term bg-black p-6 font-mono text-term"
      >
        <p className="text-center text-lg font-bold tracking-widest">RAGE RECEIPT</p>
        <p className="mb-4 text-center text-xs text-term/60">
          PIPELINE UNBLOCKED · {new Date().toLocaleString()}
        </p>

        <ul className="space-y-2 text-sm">
          {rows.map(([label, value]) => (
            <li key={label} className="flex justify-between border-b border-dotted border-term/30 pb-1">
              <span>{label}</span>
              <span>{value}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-center text-err">{verdict(stats)}</p>

        <button
          onClick={onRestart}
          className="mt-6 w-full border border-term py-2 transition hover:bg-term hover:text-black"
        >
          Deploy Again
        </button>
      </motion.div>
    </div>
  );
}
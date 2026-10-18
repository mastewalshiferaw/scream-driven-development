import { motion } from 'framer-motion';

export default function ProgressBar({ value = 0 }) {
  const safe = Number.isFinite(value) ? value : 0;
  const clamped = Math.min(100, Math.max(0, safe));
  const done = clamped >= 100;

  return (
    <div className="font-mono">
      <div className="mb-1 flex justify-between text-xs">
        <span>{done ? 'deploy: ok' : 'deploy: blocked'}</span>
        <span>{safe.toFixed(1)}%</span>
      </div>
      <div className="h-5 w-full overflow-hidden border border-term/50 bg-term/10">
        <motion.div
          className={`h-full ${done ? 'bg-term' : 'bg-err'}`}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
}
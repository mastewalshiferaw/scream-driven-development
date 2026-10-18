import { motion } from 'framer-motion';

export default function Terminal({ lines, children }) {
  return (
    <div className="w-full max-w-3xl rounded-lg border border-term/40 bg-black/80 shadow-[0_0_40px_rgba(57,255,20,0.15)]">
      <div className="flex items-center gap-2 border-b border-term/30 px-4 py-2 text-xs text-term/70">
        <span className="h-3 w-3 rounded-full bg-err" />
        <span className="h-3 w-3 rounded-full bg-term/60" />
        <span className="h-3 w-3 rounded-full bg-term" />
        <span className="ml-3">sdd-ci — pipeline/production</span>
      </div>

      <div className="min-h-[320px] space-y-1 p-4 font-mono text-sm text-term">
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={
              line.tone === 'error'
                ? 'font-bold text-err'
                : line.tone === 'dim'
                ? 'text-term/50'
                : ''
            }
          >
            {line.text}
          </motion.div>
        ))}
        {children}
      </div>
    </div>
  );
}
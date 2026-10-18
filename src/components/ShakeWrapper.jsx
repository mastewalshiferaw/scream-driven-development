import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';

export default function ShakeWrapper({ intensityRef, children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const flash = useMotionValue(0);

  useAnimationFrame(() => {
    const i = intensityRef.current;

    if (i < 0.05) {
      x.set(0);
      y.set(0);
      flash.set(0);
      return;
    }

    const amp = i * i * 18;
    x.set((Math.random() - 0.5) * amp * 2);
    y.set((Math.random() - 0.5) * amp * 2);
    flash.set(i * 0.18);
  });

  return (
    <motion.div style={{ x, y }} className="min-h-screen w-full">
      {children}
      <motion.div
        style={{ opacity: flash }}
        className="pointer-events-none fixed inset-0 z-30 bg-err mix-blend-screen"
      />
    </motion.div>
  );
}
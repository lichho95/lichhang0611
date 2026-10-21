import { motion, useReducedMotion } from 'motion/react';

/**
 * Ambient hearts, intentionally kept behind the interaction layer.
 * Geometry/delays are deterministic (no random positions on every React render).
 * Only 4 hearts on narrow screens; all motion is disabled for reduced motion.
 */
const HEARTS = [
  { x: 3, size: 11, delay: -3, duration: 19, drift: 29, tilt: -44, fill: false },
  { x: 94, size: 15, delay: -11, duration: 22, drift: -37, tilt: 38, fill: true },
  { x: 16, size: 9, delay: -15, duration: 25, drift: 16, tilt: 35, fill: true },
  { x: 86, size: 12, delay: -7, duration: 23, drift: -26, tilt: -34, fill: false },
  { x: 7, size: 18, delay: -17, duration: 29, drift: 19, tilt: -30, fill: false },
  { x: 98, size: 10, delay: -5, duration: 26, drift: -16, tilt: 40, fill: true },
  { x: 26, size: 9, delay: -9, duration: 30, drift: 11, tilt: -21, fill: false },
  { x: 75, size: 10, delay: -19, duration: 28, drift: -19, tilt: 28, fill: true },
] as const;

export function HeartRain({ visible }: { visible: boolean }) {
  const reduced = useReducedMotion();
  if (!visible || reduced) return null;

  return (
    <div className="ambient-heart-layer" aria-hidden="true">
      {HEARTS.map((heart, index) => (
        <motion.svg
          key={index}
          className={`ambient-heart ambient-heart-${index}`}
          style={{ left: `${heart.x}%`, width: heart.size, height: heart.size }}
          viewBox="0 0 24 24"
          fill={heart.fill ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            y: ['-14vh', '15vh', '76vh', '114vh'],
            x: [0, heart.drift * .3, heart.drift * .8, heart.drift],
            rotate: [heart.tilt * -.7, heart.tilt * -.15, heart.tilt * .35, heart.tilt],
            opacity: [0, .42, .26, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'linear',
            times: [0, .15, .79, 1],
          }}
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
        </motion.svg>
      ))}
    </div>
  );
}

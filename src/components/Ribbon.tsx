import { useId, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

/** Story/wishes — đường lụa đạt highlight ngay khi tiến vào nửa trên viewport. */
export function Ribbon({ variant = 'sweep', className = '' }: { variant?: 'sweep' | 'loop' | 'heart'; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, '');
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: root, offset: ['start 98%', 'start 55%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 28, mass: .5 });
  const draw = useTransform(progress, [0, .75], [0, 1]);
  const paths = {
    sweep: 'M-4 80 C70 25 137 115 212 74 S354 20 424 69',
    loop: 'M-4 80 C80 20 132 132 213 78 S349 29 424 74',
    heart: 'M-4 74 C76 22 144 112 214 73 S341 19 424 66',
  };
  return <div ref={root} className={`ribbon-drawing pointer-events-none ${className}`} aria-hidden="true">
    <svg viewBox="0 0 420 145" preserveAspectRatio="xMidYMid meet" focusable="false">
      <defs><linearGradient id={`ribbon-grad-${id}`} x1="0" x2="1"><stop stopColor="#a95b66"/><stop offset="0.5" stopColor="#6f2d3c"/><stop offset="1" stopColor="#cb9392"/></linearGradient></defs>
      <path d={paths[variant]} fill="none" stroke="#9e6970" strokeWidth="6" strokeOpacity=".12" />
      <motion.path d={paths[variant]} fill="none" stroke={`url(#ribbon-grad-${id})`} strokeWidth="3.3" strokeLinecap="round" style={{ pathLength: reduced ? 1 : draw }} />
    </svg>
  </div>;
}

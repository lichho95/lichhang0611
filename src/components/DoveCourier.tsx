import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type FlightDirection = 'from-left' | 'from-right';

/**
 * Fine Art Dove: vector-only bird (no stock image, PNG or extra dependency).
 * Its wing has its own loop while the bird travels on a staggered arc.
 * The burgundy thread beneath its feet visually links the courier to the
 * Polaroid print. A completed flight unmounts to stop perpetual wing loops.
 *
 * Both directions use the same responsive local coordinate system: no
 * window.innerWidth or absolute page coordinates are needed.
 */
export function DoveCourier({
  direction,
  active,
  delay = 0,
  companion = false,
  photo,
}: {
  direction: FlightDirection;
  active: boolean;
  delay?: number;
  companion?: boolean;
  photo?: string;
}) {
  const gradientId = useId().replaceAll(':', '');
  const reduceMotion = useReducedMotion();
  const [completed, setCompleted] = useState(false);
  if (reduceMotion || completed) return null;

  const fromLeft = direction === 'from-left';
  const sign = fromLeft ? -1 : 1;
  // The second bird flies ~80px behind and 24px above its partner.
  // Both share the same duration, keyframe timing and delay: neither arrives late.
  const formationX = companion ? (fromLeft ? -82 : 82) : 0;
  const formationY = companion ? -24 : 0;
  const rawX = [sign * 360, sign * 260, sign * 118, sign * 30, sign * 8, -sign * 110, -sign * 380];
  const rawY = [-115, -82, -50, -21, -26, -93, -160];
  const journey = {
    x: rawX.map(x => x + formationX),
    y: rawY.map(y => y + formationY),
    rotate: [sign * -8, sign * -4, sign * 2, 0, 0, -sign * 6, -sign * 10],
    scale: [.84, .96, 1, 1, 1, .95, .82],
    opacity: [0, 1, 1, 1, 1, .94, 0],
  };

  return (
    <motion.div
      className={`dove-courier ${direction} ${companion ? 'dove-companion' : ''}`}
      aria-hidden="true"
      initial={{ x: rawX[0] + formationX, y: rawY[0] + formationY, rotate: sign * -8, scale: .84, opacity: 0 }}
      animate={active ? journey : undefined}
      transition={{
        duration: 3.55,
        delay,
        times: [0, .12, .34, .46, .65, .82, 1],
        ease: [0.35, 0.04, 0.24, 1],
      }}
      onAnimationComplete={() => { if (active) setCompleted(true); }}
    >
      <svg className="dove-courier-art" viewBox="0 0 180 150" role="presentation" focusable="false">
        <defs>
          <linearGradient id={`${gradientId}-body`} x1="8%" y1="8%" x2="92%" y2="100%">
            <stop stopColor="#fffefd" />
            <stop offset=".72" stopColor="#f4ede4" />
            <stop offset="1" stopColor="#dfcebf" />
          </linearGradient>
          <linearGradient id={`${gradientId}-wing`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor="#fffefa" />
            <stop offset="1" stopColor="#e8d9cd" />
          </linearGradient>
        </defs>
        <g className={fromLeft ? 'dove-face-right' : 'dove-face-left'}>
          {/* Broad fanned tail, curved chest, slim neck and rounded head
              distinguish this as a wedding dove rather than a generic bird. */}
          <path d="M71 86 C49 73 27 72 11 62 Q21 82 51 92 Q32 99 18 115 Q47 114 75 105 Z"
            fill={`url(#${gradientId}-wing)`} stroke="#bfaa98" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M19 68 Q43 89 67 92 M23 107 Q48 105 67 99"
            fill="none" stroke="#d3c1b4" strokeWidth="1" strokeLinecap="round" />
          {/* The far wing follows a softer, offset flap. */}
          <motion.g style={{transformOrigin:'92px 78px'}}
            animate={{rotate:[-12,15,-12]}}
            transition={{duration:1.05,repeat:Infinity,ease:'easeInOut',delay:.11}}>
            <path d="M86 81 Q73 56 62 34 Q60 26 67 26 Q82 42 89 57 Q84 29 92 25 Q106 47 107 79 Z"
              fill="#e8dace" stroke="#bba595" strokeWidth="1" />
          </motion.g>
          {/* Soft, full dove silhouette. */}
          <path d="M65 83 Q77 64 103 68 Q115 71 122 81 Q130 75 126 61 Q126 43 141 43 Q153 43 156 55 Q158 70 143 75 Q137 78 130 90 Q119 113 95 115 Q75 114 65 101 Q60 94 65 83 Z"
            fill={`url(#${gradientId}-body)`} stroke="#b7a08f" strokeWidth="1.45" strokeLinejoin="round" />
          <path d="M139 45 Q131 51 134 63" stroke="#ffffff" strokeWidth="2.2" opacity=".85" fill="none" />
          {/* Upper wing: overlapping rounded primary feathers, pivoted at shoulder. */}
          <motion.g style={{transformOrigin:'95px 82px'}}
            animate={{rotate:[-21,16,-21],scaleY:[.98,1.025,.98]}}
            transition={{duration:1.05,repeat:Infinity,ease:'easeInOut'}}>
            <path d="M100 84 C84 67 61 42 48 13 Q45 4 52 6 Q71 23 83 46 Q69 26 68 12 Q69 5 75 11 Q93 32 98 52 Q90 32 92 21 Q95 14 101 24 Q116 51 111 73 Q107 81 100 84 Z"
              fill={`url(#${gradientId}-wing)`} stroke="#bca493" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M98 76 Q70 40 53 15 M101 70 Q81 33 74 17 M105 69 Q102 43 98 27"
              fill="none" stroke="#d2bfb0" strokeWidth="1.1" strokeLinecap="round" />
          </motion.g>
          <path d="M77 104 Q102 113 117 96" fill="none" stroke="#ded1c7" strokeWidth="1.15" strokeLinecap="round" />
          <circle cx="147" cy="55" r="2.25" fill="#5d4744" />
          <circle cx="147.6" cy="54.3" r=".7" fill="#fff" />
          {/* Dove's short peach-colored beak and an olive twig. */}
          <path d="M155 61 L166 63 L154 67 Z" fill="#cc9b80" stroke="#b68571" strokeWidth=".8" />
          <path d="M164 63 Q172 70 174 80" stroke="#8a9073" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <ellipse cx="169" cy="71" rx="2.5" ry="5.5" transform="rotate(-50 169 71)" fill="#a6ad85" />
          <ellipse cx="173" cy="76" rx="2.5" ry="5.5" transform="rotate(35 173 76)" fill="#a6ad85" />
          {/* Feet and fine ribbon carrying the actual Polaroid. */}
          <path d="M95 111 L94 121 M108 108 L110 119" stroke="#b99379" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M96 120 Q86 127 92 139 Q96 143 100 149"
            stroke="#995263" strokeWidth="1.9" strokeLinecap="round" fill="none" />
        </g>
      </svg>
      {/* Thumbnail is the SAME photo as the chapter, carried by a silk thread.
          SOURCE PHOTO: 900×1100 px (4:5), WebP <250 KB; replace in wedding.config.ts.
          On the final chapter, only the lead dove carries the photo; the second
          bird accompanies the shared promise instead of duplicating the card. */}
      {photo && !companion && (
        <motion.div className="dove-carried-print"
          initial={{ opacity: 0, y: -2, scale: .74, rotate: fromLeft ? 12 : -12 }}
          animate={active ? {
            opacity: [0, 1, 1, .96, 0],
            y: [-2, 0, 5, 12, 29],
            scale: [.74, .82, .88, .91, .95],
            rotate: [fromLeft ? 12 : -12, -6, 8, -4, 0],
          } : undefined}
          transition={{ duration: 1.8, delay: delay + .12, times: [0, .13, .47, .78, 1], ease: 'easeInOut' }}
        ><img src={photo} alt="" draggable={false} /></motion.div>
      )}
    </motion.div>
  );
}

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { DoveCourier } from './DoveCourier';
import { wedding } from '../wedding.config';

export type Memory = (typeof wedding.story)[number];
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Love Messengers / Chapter delivery:
 *  1. A fine-art dove enters from an alternating side, visually carrying
 *     a photograph suspended on a burgundy thread.
 *  2. The photograph follows and settles as a Polaroid, a paper tape pins it.
 *  3. The dove circles away and unmounts. The final memory gets TWO doves in formation.
 *
 * Each card is triggered by its own IntersectionObserver: on narrow screens
 * the birds do not fly off-screen while the visitor is reading the first card.
 * The original image is always in the DOM with reserved aspect ratio.
 * Suggested photo: 900 x 1100 px (4:5), WebP <= 250 KB; see config.
 */
export function MemoryCard({ chapter, index, total }: { chapter: Memory; index: number; total: number }) {
  const articleRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(articleRef, { once: true, amount: .22, margin: '0px 0px -8% 0px' });
  const active = inView || !!reduceMotion;
  const fromLeft = index % 2 === 0;
  const sign = fromLeft ? -1 : 1;
  const restAngle = index === 1 ? 2 : index === 2 ? -2 : -1;
  const duration = reduceMotion ? .01 : 1.1;
  const photoDelay = reduceMotion ? 0 : .48;
  return (
    <article ref={articleRef} className={`story-chapter story-chapter-${index} memory-card memory-card-${index}`}>
      <div className="memory-delivery-stage">
        {/* Two doves fly LEFT → RIGHT as a pair; no arrival stagger. */}
        {inView && wedding.effects.doveMessengers && (index === 2 ? (
          <>
            <DoveCourier direction="from-left" active={inView} photo={chapter.image} />
            <DoveCourier direction="from-left" active={inView} companion />
          </>
        ) : (
          <DoveCourier direction={fromLeft ? 'from-left' : 'from-right'} active={inView} photo={chapter.image} />
        ))}
        <motion.div className="story-photo-frame memory-print"
          initial={reduceMotion ? false : { opacity: 0, x: sign * 144, y: -83, rotate: sign * 13, scale: .76 }}
          animate={active ? { opacity: 1, x: 0, y: 0, rotate: restAngle, scale: 1 } : undefined}
          transition={{ type: 'spring', stiffness: 78, damping: 18, mass: .92, delay: photoDelay, duration }}
        >
          {/* ẢNH KỶ NIỆM: 900×1100 px (4:5), WebP <250 KB. Thay đường dẫn tại wedding.config.ts. */}
          <img loading="lazy" decoding="async" src={chapter.image} alt={chapter.title} className="story-photo" />
          <motion.span className="story-photo-curtain memory-develop-mask"
            initial={reduceMotion ? false : { scaleY: 1 }} animate={active ? { scaleY: 0 } : undefined}
            transition={{ duration: reduceMotion ? 0 : .85, delay: photoDelay + .32, ease }} aria-hidden="true" />
          <motion.span className="story-attached-tape"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.5, y: -25, rotate: -12 }}
            animate={active ? { opacity: 1, scale: 1, y: 0, rotate: index === 1 ? 8 : -7 } : undefined}
            transition={{ type: 'spring', stiffness: 150, damping: 15, delay: photoDelay + .96 }} aria-hidden="true" />
          {index === 0 && (
            <>
              <motion.span className="memory-film-sleeve" aria-hidden="true"
                initial={reduceMotion ? false : { y: 0, opacity: 1 }} animate={active ? { y: '-110%', opacity: 0 } : undefined}
                transition={{ duration: reduceMotion ? 0 : .87, ease, delay: photoDelay + .32 }} />
              <motion.span className="memory-postmark" aria-hidden="true"
                initial={reduceMotion ? false : { scale: 2.1, rotate: -32, opacity: 0 }}
                animate={active ? { scale: 1, rotate: -13, opacity: 1 } : undefined}
                transition={{ type: 'spring', stiffness: 160, damping: 14, delay: photoDelay + 1.13 }}>FIRST HELLO <span>♡</span></motion.span>
            </>
          )}
          {index === 1 && (
            <div className="memory-orbit" aria-hidden="true">
              {['✧', '♡', '✦'].map((symbol, j) => (
                <motion.span key={j} className={`memory-orbit-piece memory-orbit-piece-${j}`}
                  initial={reduceMotion ? false : { x: (j - 1) * 64, y: -80 - j * 22, opacity: 0, scale: .35, rotate: j * 80 }}
                  animate={active ? { x: 0, y: 0, opacity: 1, scale: 1, rotate: j === 1 ? 12 : -12 } : undefined}
                  transition={{ type: 'spring', stiffness: 150, damping: 12, delay: photoDelay + .75 + j * .14 }}
                >{symbol}</motion.span>
              ))}
            </div>
          )}
          {index === 2 && (
            <>
              <svg className="memory-vow-rings" viewBox="0 0 120 75" aria-hidden="true">
                <motion.ellipse cx="47" cy="38" rx="22" ry="26" fill="none" stroke="currentColor" strokeWidth="2.1"
                  initial={reduceMotion ? false : { pathLength: 0 }} animate={active ? { pathLength: 1 } : undefined}
                  transition={{ duration: reduceMotion ? 0 : 1, delay: photoDelay + .8, ease }} />
                <motion.ellipse cx="74" cy="38" rx="22" ry="26" fill="none" stroke="currentColor" strokeWidth="2.1"
                  initial={reduceMotion ? false : { pathLength: 0 }} animate={active ? { pathLength: 1 } : undefined}
                  transition={{ duration: reduceMotion ? 0 : 1, delay: photoDelay + .98, ease }} />
                <motion.path d="M59 7 L64 2 L69 7 L64 13 Z" fill="currentColor"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0 }} animate={active ? { opacity: 1, scale: 1 } : undefined}
                  transition={{ type: 'spring', stiffness: 190, damping: 14, delay: photoDelay + 1.35 }} />
              </svg>
              <motion.span className="memory-promise-seal" aria-hidden="true"
                initial={reduceMotion ? false : { opacity: 0, scale: 1.65, rotate: -35 }}
                animate={active ? { opacity: 1, scale: 1, rotate: 10 } : undefined}
                transition={{ type: 'spring', stiffness: 170, damping: 15, delay: photoDelay + 1.44 }}>FOREVER</motion.span>
            </>
          )}
          <span className="story-photo-number">0{index + 1} / 0{total}</span>
        </motion.div>
      </div>
      <div className="story-chapter-text">
        <motion.span className="eyebrow" initial={reduceMotion ? false : { opacity: 0, y: 7 }} animate={active ? { opacity: 1, y: 0 } : undefined} transition={{ duration: .5, delay: reduceMotion ? 0 : 1.12 }}>{chapter.date}</motion.span>
        <motion.h3 initial={reduceMotion ? false : { opacity: 0, clipPath: 'inset(0 100% 0 0)', x: -14 }} animate={active ? { opacity: 1, clipPath: 'inset(0 0% 0 0)', x: 0 } : undefined} transition={{ duration: reduceMotion ? .01 : .85, delay: reduceMotion ? 0 : 1.24, ease }}>{chapter.title}</motion.h3>
        <motion.p initial={reduceMotion ? false : { opacity: 0, y: 11 }} animate={active ? { opacity: 1, y: 0 } : undefined} transition={{ duration: .65, delay: reduceMotion ? 0 : 1.35 }}>{chapter.text}</motion.p>
      </div>
    </article>
  );
}

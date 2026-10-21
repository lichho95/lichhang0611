import { useId, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

type Motif = 'heart' | 'loop' | 'rings' | 'letter' | 'bow';

/**
 * Animation V3 — hình học được thiết kế riêng cho desktop/mobile, KHÔNG kéo giãn SVG.
 * Stroke hoàn tất khi tiêu đề đi vào khoảng giữa viewport, không phải khi thoát màn hình.
 * Motif vẽ thành biểu tượng riêng ở tâm; đường lụa phía sau chỉ dùng các đường Bezier mềm,
 * tránh việc ép nhiều nút giao/đường tự cắt thành một path dẫn đến hình méo mó.
 */
export function JourneyTransition({ number, title, motif = 'loop' }: { number: string; title: string; motif?: Motif }) {
  const root = useRef<HTMLDivElement>(null);
  const gradientId = useId().replace(/:/g, '');
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: root, offset: ['start 98%', 'start 54%'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 170, damping: 31, mass: .45 });
  const drawn = useTransform(smooth, [0, .8], [0, 1]);
  const rise = useTransform(smooth, [0, 1], [22, 0]);
  const reveal = useTransform(smooth, [.05, .65], [0, 1]);
  const strokeStyle = { pathLength: reduced ? 1 : drawn };
  const path = 'M-20 115 C90 44 205 177 324 114 S565 43 689 114 S831 161 922 100';
  const mobilePath = 'M-10 108 C55 58 108 147 168 105 S263 73 330 107';
  return <div className="journey-transition" ref={root} aria-label={`Chuyển chương ${number}: ${title}`}>
    <div className="journey-paper-grain" aria-hidden="true" />
    <svg className="journey-silk journey-silk-desktop" viewBox="0 0 900 230" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs><linearGradient id={`chapter-silk-${gradientId}`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#bd888d" stopOpacity=".2"/><stop offset=".3" stopColor="#743545"/><stop offset=".68" stopColor="#aa6875"/><stop offset="1" stopColor="#bc8b8c" stopOpacity=".2"/></linearGradient></defs>
      <path d={path} fill="none" stroke="#b7868c" strokeOpacity=".14" strokeWidth="6"/>
      <motion.path d={path} fill="none" stroke={`url(#chapter-silk-${gradientId})`} strokeWidth="3.2" strokeLinecap="round" style={strokeStyle}/>
    </svg>
    <svg className="journey-silk journey-silk-mobile" viewBox="0 0 320 210" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path d={mobilePath} fill="none" stroke="#b7868c" strokeOpacity=".12" strokeWidth="6"/>
      <motion.path d={mobilePath} fill="none" stroke="#8d4a5a" strokeWidth="2.8" strokeLinecap="round" style={strokeStyle}/>
    </svg>
    <motion.div className="journey-label" style={reduced ? undefined : { opacity: reveal, y: rise }}>
      <div className="journey-motif" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          {motif === 'heart' && <motion.path d="M32 51 C25 44 10 35 10 23 C10 12 24 11 32 23 C40 11 54 12 54 23 C54 35 39 44 32 51 Z" style={strokeStyle}/>}
          {motif === 'rings' && <><circle cx="25" cy="31" r="14"/><circle cx="40" cy="31" r="14"/><path d="M18 16 l7 -7 l7 7"/></>}
          {motif === 'letter' && <><rect x="10" y="18" width="44" height="30" rx="2"/><path d="M11 21 L32 36 L53 21"/><path d="M11 47 L26 34 M53 47 L38 34"/></>}
          {motif === 'bow' && <><path d="M31 32 C7 5 3 26 28 34 C5 47 12 59 32 36 C52 59 59 47 36 34 C61 26 57 5 33 32"/><circle cx="32" cy="34" r="4"/></>}
          {motif === 'loop' && <><path d="M8 39 C18 14 29 14 32 34 C35 54 48 52 56 27"/><circle cx="32" cy="34" r="3"/></>}
        </svg>
      </div>
      <span>✧ &nbsp; CHAPTER {number} &nbsp; ✧</span>
      <strong>{title}</strong>
    </motion.div>
  </div>;
}

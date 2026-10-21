import { motion, useReducedMotion } from 'motion/react';

const letters = Array.from('FRAGMENTS OF FOREVER');
const ease = [0.22, 1, 0.36, 1] as const;

/** Editorial film-title choreography: scattered type resolves into a single headline. */
export function FragmentsHeading() {
  const reduced = useReducedMotion();
  return (
    <div className="section-heading fragments-heading">
      <motion.div className="fragments-overline" aria-label="FRAGMENTS OF FOREVER"
        initial="hidden" whileInView="show" viewport={{ once: true, amount: .6 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : .04, delayChildren: .13 } } }}
      >
        {letters.map((letter, index) => (
          <motion.span key={index} aria-hidden="true" className="fragments-letter"
            variants={{
              hidden: reduced ? { opacity: 0 } : { opacity: 0, y: index % 2 ? 19 : -15, rotate: index % 2 ? 15 : -13, scale: .8 },
              show: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { duration: reduced ? .2 : .7, ease } }
            }}
          >{letter === ' ' ? '\u00a0' : letter}</motion.span>
        ))}
        <motion.span className="fragments-scanner" aria-hidden="true"
          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
          transition={{ duration: reduced ? 0 : 1.1, delay: .9, ease }} />
      </motion.div>
      <motion.h2 className="section-title fragments-main-title"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 25, letterSpacing: '.035em' }}
        whileInView={{ opacity: 1, y: 0, letterSpacing: '-.048em' }}
        viewport={{ once: true, amount: .4 }}
        transition={{ duration: reduced ? .25 : 1, delay: .34, ease }}
      >Những khung hình yêu</motion.h2>
      <motion.svg className="fragments-underline" viewBox="0 0 290 18" aria-hidden="true">
        <motion.path d="M3 9 Q55 1 95 9 T190 9 T287 9" fill="none" stroke="#a66d75" strokeWidth="1.6" strokeLinecap="round"
          initial={{ pathLength: reduced ? 1 : 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
          transition={{ duration: reduced ? 0 : 1.2, delay: .7, ease }} />
      </motion.svg>
      <motion.p className="section-description" initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.65,delay:.42}}>
        Một vài khoảnh khắc mà chúng mình muốn giữ mãi.
      </motion.p>
      <span className="fragments-frame-mark fragments-frame-mark-left" aria-hidden="true">01 — 06</span>
      <span className="fragments-frame-mark fragments-frame-mark-right" aria-hidden="true">LOVE, ON FILM</span>
    </div>
  );
}

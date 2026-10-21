import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Two Halves, One Heart — SVG thuần, không cần tải ảnh minh hoạ.
 * Chú rể/chú dâu là fine-art silhouette; cùng tiến về tim trên hệ toạ độ 760×295.
 * Hai nửa tim có chung đường ghép ở x=380, không bị lệch theo kích thước viewport.
 * Motion giảm tối đa khi prefers-reduced-motion được bật.
 */
export function TwoHalvesHeart() {
  const reduced = useReducedMotion();
  // Mobile Safari can report unstable IntersectionObserver bounds for SVG <g>/<path>.
  // Observe this real HTML wrapper once, and synchronize the ENTIRE illustration.
  // The wrapper stays measurable at every breakpoint (unlike individual SVG shapes).
  const sceneRef = useRef<HTMLDivElement>(null);
  const isSceneVisible = useInView(sceneRef, {
    once: true,
    amount: 0.15,
    margin: '0px 0px -8% 0px',
  });
  const playScene = isSceneVisible || Boolean(reduced);
  const duration = reduced ? 0 : 1.45;
  return (
    <div ref={sceneRef} className="hearts-ceremony" aria-label="Hình minh hoạ cô dâu chú rể mang hai nửa trái tim ghép thành một">
      <svg className="hearts-ceremony-art" viewBox="0 0 760 290" role="img" aria-labelledby="two-hearts-title">
        <title id="two-hearts-title">Chú rể và cô dâu cùng mang hai nửa trái tim thành một</title>
        <defs>
          <linearGradient id="wedding-silhouette-wine" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#9c626b"/><stop offset="1" stopColor="#61333e"/></linearGradient>
          <linearGradient id="wedding-heart" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c78b8e"/><stop offset="1" stopColor="#793e4d"/></linearGradient>
          <linearGradient id="bridal-veil" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffaf2" stopOpacity=".94"/><stop offset="1" stopColor="#e3bfbd" stopOpacity=".50"/></linearGradient>
        </defs>
        <motion.g initial={reduced?false:{x:-125,opacity:0}} animate={playScene ? {x:0,opacity:1} : {x:-125,opacity:0}}
          transition={{duration,ease}}>
          {/* groom head and tailored suit silhouette, hand extended toward the centre */}
          <g transform="translate(206 31)">
            <path d="M36 59 C27 56 24 44 28 31 C31 15 49 11 59 21 C68 30 65 50 59 58 L58 68 L38 68Z" fill="#e7c8b9"/>
            <path d="M26 40 C21 14 35 8 49 8 C65 6 75 25 65 38 L59 31 C46 33 37 25 27 34Z" fill="#58313b"/>
            <path d="M32 65 L19 72 C9 87 8 114 7 155 L12 217 L85 217 L86 115 Q83 76 62 66 L57 64 L47 89Z" fill="url(#wedding-silhouette-wine)"/>
            <path d="M32 64 L47 93 L61 65 L50 144Z" fill="#f5e8d7"/>
            <path d="M46 90 L41 101 L48 116 L54 102Z" fill="#8f5160"/>
            <path d="M83 100 Q98 117 113 117 L146 117 L151 127 L109 130 Q85 133 72 117" stroke="#79424d" strokeWidth="13" strokeLinecap="round" fill="none"/>
            <path d="M145 120 Q151 114 161 120" stroke="#e2c1b3" strokeWidth="8" strokeLinecap="round" fill="none"/>
            <path d="M27 84 L15 107 L29 129 L39 104 M63 86 L75 106 L62 129" fill="none" stroke="#d4ac9b" strokeWidth="2" opacity=".65"/>
          </g>
        </motion.g>
        <motion.g initial={reduced?false:{x:125,opacity:0}} animate={playScene ? {x:0,opacity:1} : {x:125,opacity:0}} transition={{duration,ease}}>
          {/* bride profile, gathered gown and flowing veil */}
          <g transform="translate(470 28)">
            <path d="M45 35 Q41 13 57 8 Q77 5 82 27 Q84 48 70 60 L70 71 L51 72 L54 58 Q43 51 45 35Z" fill="#e7c8b9"/>
            <path d="M46 42 Q34 28 44 13 Q61 -4 82 13 Q96 24 87 45 L77 31 Q56 34 47 28 Z" fill="#67404a"/>
            <path d="M53 65 Q30 91 30 125 Q16 181 -7 235 Q56 257 143 235 Q115 190 97 124 Q98 84 73 67 L67 79 Q61 89 53 65Z" fill="#f6e9df" stroke="#bf9b9a" strokeWidth="2"/>
            <path d="M52 65 Q23 92 20 134 Q-13 182 -35 225 C20 231 34 211 51 180" fill="none" stroke="#ead9d0" strokeWidth="10" opacity=".8"/>
            <path d="M48 22 Q30 5 18 40 Q5 77 29 137 Q48 155 67 145" fill="url(#bridal-veil)" stroke="#e0bcbc" strokeWidth="1.6"/>
            <path d="M64 67 Q81 92 88 115 L77 139 L53 139 L45 112 Q42 91 57 70" fill="#a87076" opacity=".63"/>
            <path d="M38 102 Q24 116 9 117 L-23 117" fill="none" stroke="#e9c9be" strokeWidth="12" strokeLinecap="round"/>
            <path d="M-22 117 L-34 116" stroke="#d3aaa1" strokeWidth="7" strokeLinecap="round"/>
            <path d="M51 156 Q67 179 89 186" stroke="#b78583" fill="none" strokeWidth="2" opacity=".48"/>
          </g>
        </motion.g>
        {/* The matching vertical seam is exactly x=380 (all art shares this viewBox). */}
        <motion.g initial={reduced?false:{x:-50,opacity:0,rotate:-11}} animate={playScene ? {x:0,opacity:1,rotate:0} : {x:-50,opacity:0,rotate:-11}} style={{transformBox:"fill-box",transformOrigin:"center"}} transition={{duration:reduced?0:1.0,delay:reduced?0:1.05,ease}}>
          <path d="M380 124 C360 94 329 92 317 112 C292 150 332 183 380 221 Z" fill="url(#wedding-heart)"/>
        </motion.g>
        <motion.g initial={reduced?false:{x:50,opacity:0,rotate:11}} animate={playScene ? {x:0,opacity:1,rotate:0} : {x:50,opacity:0,rotate:11}} style={{transformBox:"fill-box",transformOrigin:"center"}} transition={{duration:reduced?0:1.0,delay:reduced?0:1.05,ease}}>
          <path d="M380 124 C400 94 431 92 443 112 C468 150 428 183 380 221 Z" fill="url(#wedding-heart)"/>
        </motion.g>
        <motion.circle cx="380" cy="148" r="78" fill="none" stroke="#b9888a" strokeWidth="1.2" strokeDasharray="2 10"
          initial={reduced?false:{opacity:0,scale:.75}} animate={playScene ? {opacity:.46,scale:1} : {opacity:0,scale:.75}} transition={{duration:reduced?0:.9,delay:reduced?0:1.95}} style={{transformBox:'fill-box', transformOrigin:'center'}}/>
        <motion.path d="M8 235 C113 198 190 275 285 244 S405 257 478 244 S645 200 753 239" fill="none" stroke="#b0797e" strokeWidth="2.6" strokeLinecap="round" opacity=".78"
          initial={reduced?false:{pathLength:0}} animate={{pathLength:playScene ? 1 : 0}}
          transition={{duration:reduced?0:1.35,delay:reduced?0:2.0,ease}} />
      </svg>
      <motion.p className="hearts-ceremony-caption" initial={reduced?false:{opacity:0,y:10}} animate={playScene ? {opacity:1,y:0} : {opacity:0,y:10}} transition={{delay:reduced?0:2.3,duration:.7}}>TWO HALVES · ONE HEART</motion.p>
    </div>
  );
}

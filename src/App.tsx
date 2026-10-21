import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, RotateCcw, CalendarDays, Check, Copy, Gift, Heart, Mail, MapPin, Menu, Music2, Pause, Play, Send, Sparkles, X } from 'lucide-react';
import { wedding } from './wedding.config';
import { Ribbon } from './components/Ribbon';
import { JourneyTransition } from './components/JourneyTransition';
import { TurnstileWidget } from './components/TurnstileWidget';
import { HeartRain } from './components/HeartRain';
import { MemoryCard } from './components/MemoryCard';
import { FragmentsHeading } from './components/FragmentsHeading';
import { buildCalendarUrl, clampIndex, countdownParts, getGuestName, withLeadingZero } from './lib/utils';
import { loadWishes, sendRSVP, sendWish, type Wish } from './lib/api';

const ease = [0.22, 1, 0.36, 1] as const;
const SECTION_IDS = ['home', 'couple', 'story', 'details', 'gallery', 'wishes', 'gift'] as const;
const navItems = [
  { id: 'home', label: 'Trang đầu' },
  { id: 'story', label: 'Chuyện chúng mình' },
  { id: 'details', label: 'Ngày cưới' },
  { id: 'gallery', label: 'Album ảnh' },
  { id: 'wishes', label: 'Lời chúc' },
];
function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function ImageFrame({ src, alt, className = '', loading = 'lazy' }: { src: string; alt: string; className?: string; loading?: 'eager' | 'lazy' }) {
  // KÍCH THƯỚC ẢNH: thông số từng ảnh được ghi cạnh path ở src/wedding.config.ts và docs/IMAGE_GUIDE.md.
  return <img src={src} alt={alt} className={className} loading={loading} decoding="async" />;
}
function SectionHeading({ kicker, title, caption, light = false }: { kicker: string; title: string; caption?: string; light?: boolean }) {
  return <div className={`section-heading ${light ? 'section-heading-light' : ''}`}>
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.55 }} transition={{ duration: .65 }} className="eyebrow">{kicker}</motion.div>
    <motion.h2
      initial={title === 'Chuyện chúng mình' || title === 'Những khung hình yêu' ? { opacity:1, clipPath:'inset(0 100% 0 0)', x:-15 } : { opacity:0, y:22 }}
      whileInView={title === 'Chuyện chúng mình' || title === 'Những khung hình yêu' ? { opacity:1, clipPath:'inset(0 0% 0 0)', x:0 } : { opacity:1, y:0 }}
      viewport={{ once:true, amount:.5 }}
      transition={{ duration:1.08, ease }} className="section-title">{title}</motion.h2>
    {caption && <p className="section-description">{caption}</p>}
    {(title === 'Chuyện chúng mình' || title === 'Những khung hình yêu') && <svg className="heading-ink-stroke" viewBox="0 0 240 28" aria-hidden="true"><motion.path d="M7 19 C55 4 83 28 121 15 S193 8 232 15" fill="none" stroke="#ad707a" strokeWidth="2.2" strokeLinecap="round" initial={{pathLength:0}} whileInView={{pathLength:1}} viewport={{once:true,amount:.8}} transition={{duration:1.2,delay:.26,ease}}/></svg>}
  </div>;
}
function Floral({ position = 'right' }: { position?: 'left' | 'right' }) {
  return <svg className={`floral floral-${position}`} viewBox="0 0 230 280" aria-hidden="true">
    <g fill="none" stroke="#a98273" strokeWidth="1.2" opacity=".65"><path d="M183 278 Q159 186 111 122 Q76 74 40 9"/><path d="M159 217 Q194 166 211 117"/><path d="M131 165 Q71 169 28 143"/><path d="M105 111 Q141 74 145 40"/></g>
    {[[40,32,21],[111,123,28],[208,113,23],[42,143,19],[148,55,21]].map(([x,y,r],i) => <g key={i} transform={`translate(${x} ${y})`}><circle r={r*1.05} fill="#e1b2a5" opacity=".22"/>{[0,72,144,216,288].map(deg => <ellipse key={deg} transform={`rotate(${deg}) translate(0 ${-r*.52})`} rx={r*.46} ry={r*.76} fill={i%2?'#e8c8bb':'#f3d6c7'} stroke="#d4a89d" strokeWidth=".6"/>)}<circle r={r*.32} fill="#c5a06e"/></g>)}
    <g fill="#8b9778" opacity=".8"><ellipse cx="172" cy="201" rx="9" ry="21" transform="rotate(46 172 201)"/><ellipse cx="79" cy="90" rx="9" ry="19" transform="rotate(-40 79 90)"/><ellipse cx="200" cy="146" rx="8" ry="18" transform="rotate(48 200 146)"/></g>
  </svg>;
}
function WaxSeal({ large = false }: { large?: boolean }) {
  return <span className={`wax-seal ${large ? 'wax-seal-large' : ''}`} aria-hidden="true"><span>{wedding.couple.initials.replace('&', '·')}</span></span>;
}
function EnvelopeArt({ opened = false }: { opened?: boolean }) {
  return <div className={`envelope-art ${opened ? 'envelope-art-open' : ''}`} aria-hidden="true"><div className="envelope-note"><span className="envelope-note-small">A CELEBRATION OF LOVE</span><span className="envelope-note-script">You're Invited</span><span className="envelope-note-small">{wedding.dateText}</span></div><div className="envelope-back"/><div className="envelope-flap"/><div className="envelope-front"/><div className="envelope-seal"><WaxSeal large /></div></div>;
}
/**
 * Opening choreography:
 * 0ms      → seal lifts (unseal)
 * 650ms    → envelope flap folds back, letter emerges (unfold)
 * 1700ms   → silk line traces outward, paper scene dissolves (journey)
 * 2850ms   → reveal the underlying hero and start its entrance
 * Motion reduction → enter immediately. Timers are cleared on unmount.
 */
function Opening({ onEnter, onReveal, onBegin, guestName }: { onEnter: () => void; onReveal: () => void; onBegin: () => void; guestName: string }) {
  const [phase, setPhase] = useState<'sealed' | 'unseal' | 'unfold' | 'journey'>('sealed');
  const reduced = useReducedMotion();
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);
  const begin = () => {
    if (phase !== 'sealed') return;
    // Play from the original user gesture — delayed play() would be blocked on Safari/iOS.
    onBegin();
    if (reduced) { onReveal(); onEnter(); return; }
    setPhase('unseal');
    timers.current.push(window.setTimeout(() => setPhase('unfold'), 460));
    timers.current.push(window.setTimeout(() => {setPhase('journey'); onReveal();}, 1250));
    timers.current.push(window.setTimeout(onEnter, 2230));
  };
  return <motion.div className={`opening-screen opening-phase-${phase}`} initial={{ opacity: 1 }} exit={{ opacity: 0, pointerEvents: 'none' }} transition={{ duration: .2 }}>
    <div className="opening-background"/><Floral position="left"/><Floral position="right"/>
    <svg className="opening-silk-trail" viewBox="0 0 900 650" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="opening-silk-grad"><stop stopColor="#c98b8d"/><stop offset=".45" stopColor="#6f2d3c"/><stop offset="1" stopColor="#c98b8d"/></linearGradient></defs>
      <motion.path d="M452 360 C400 301 305 438 192 310 S45 152 -30 262 M452 360 C561 271 637 459 740 343 S835 205 940 182" fill="none" stroke="url(#opening-silk-grad)" strokeWidth="5" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: phase === 'sealed' ? 0 : 1, opacity: phase === 'sealed' ? 0 : 1 }} transition={{ pathLength: { duration: 1.3, ease: [.22,1,.36,1], delay: phase === 'unseal' ? .46 : 0 }, opacity: { duration: .3 } }} />
    </svg>
    <motion.div className="opening-content" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
      <div className="eyebrow">TOGETHER WITH OUR FAMILIES</div>
      <div className="opening-monogram">{wedding.couple.initials}</div>
      <EnvelopeArt opened={phase !== 'sealed'} />
      <div className="opening-copy">
        <p className="invitation-script">You're Invited</p>
        <p className="opening-text">{guestName ? `Thân mời ${guestName}` : wedding.greeting}</p>
        <button className="button button-primary opening-button" onClick={begin} disabled={phase !== 'sealed'} aria-label="Chạm để mở phong bì và bắt đầu câu chuyện">
          {phase === 'sealed' ? 'Mở thiệp cưới' : 'Chuyện mình bắt đầu...'} <ArrowRight size={16}/>
        </button>
        <p className="opening-hint">{phase === 'sealed' ? 'CHẠM ĐỂ BẮT ĐẦU CÂU CHUYỆN' : 'FOLLOW THE LIVING RIBBON'}</p>
      </div>
    </motion.div>
    <span className="opening-side-note">A STORY WRITTEN IN LOVE · {wedding.dateText.slice(-4)}</span>
  </motion.div>;
}
function Header({ opened }: { opened: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  if (!opened) return null;
  return <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
    <a className="nav-brand" href="#home" onClick={() => setMenuOpen(false)} aria-label="Về trang đầu">{wedding.couple.initials}</a>
    <nav className="desktop-nav" aria-label="Điều hướng chính">{navItems.map(item => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</nav>
    <a href="#rsvp" className="nav-rsvp">Xác nhận tham dự <ArrowUpRight size={14}/></a>
    <button className="menu-toggle" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>{menuOpen ? <X size={23}/> : <Menu size={23}/>}</button>
    <AnimatePresence>{menuOpen && <motion.nav className="mobile-nav" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} aria-label="Điều hướng trên điện thoại">{navItems.map(item => <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}>{item.label}<ArrowUpRight size={15}/></a>)}<a href="#rsvp" onClick={() => setMenuOpen(false)}>Xác nhận tham dự <Heart size={15}/></a></motion.nav>}</AnimatePresence>
  </header>;
}
function MusicControl({ playing, setPlaying, audioRef }: { playing: boolean; setPlaying: (value: boolean) => void; audioRef: React.RefObject<HTMLAudioElement | null> }) {
  if (!wedding.musicUrl) return null;
  const toggle = async () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { try { await audioRef.current.play(); setPlaying(true); } catch { setPlaying(false); } }
  };
  return <button className={`music-control ${playing ? 'music-playing' : ''}`} onClick={toggle} aria-label={playing ? 'Tắt nhạc nền' : 'Bật nhạc nền'} title={playing ? 'Tắt nhạc' : 'Phát nhạc'}><Music2 size={18}/>{playing ? <Pause size={12}/> : <Play size={12}/>}</button>;
}
function Hero({ guestName, active }: { guestName: string; active: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0,1], ['0%', reduced ? '0%' : '13%']);
  const imageScale = useTransform(scrollYProgress, [0,1], [1, reduced ? 1 : 1.08]);
  return <section id="home" className="hero-section" ref={heroRef}>
    <div className="hero-canvas"><div className="hero-pattern"/><div className="hero-ribbon-back"/>
      <motion.div className="hero-photo-wrap" style={{ y: imageY, scale: imageScale }} initial={false} animate={{ opacity: 1 }} transition={{ duration: .3, ease }}>
        <ImageFrame src={wedding.image.hero} alt="Ảnh cưới của cô dâu và chú rể" className="hero-photo" loading="eager"/>
        <div className="hero-photo-veil"/>
      </motion.div>
      <div className="hero-content">
        <motion.span initial={false} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 26 }} transition={{ duration: .65, ease }} className="eyebrow hero-kicker">THE WEDDING OF</motion.span>
        <motion.h1 initial={false} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 48, scale: active ? 1 : .965 }} transition={{ duration: .82, ease }} className="hero-names"><span>{wedding.couple.groom}</span><em>&</em><span>{wedding.couple.bride}</span></motion.h1>
        <motion.div initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: .65, ease }} className="hero-date">{wedding.dateText}</motion.div>
        <span className="hero-divider"/>
        <p className="hero-subtitle">A NEW CHAPTER, TOGETHER</p>
        {guestName && <p className="guest-personalization">Thật vui vì có bạn, <b>{guestName}</b>, ở đây ♡</p>}
      </div>
      <div className="hero-vertical">LOVE IS A BEAUTIFUL JOURNEY</div>
      <button className="hero-scroll" onClick={() => scrollTo('memory-portal')} aria-label="Khám phá câu chuyện của chúng mình"><ArrowDown size={20}/><span>SCROLL TO DISCOVER</span></button>
      <div className="hero-stamp"><Heart size={18} fill="currentColor"/><span>FOREVER<br/>STARTS HERE</span></div>
    </div>
  </section>;
}
function MemoryPortal() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  // A 2-viewport pinned camera move: portrait grows into a portal, then reveals the next chapter.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 65, damping: 25 });
  const scale = useTransform(smooth, [0, .24, .66, 1], reduced ? [1,1,1,1] : [.72,.97,1.20,1.75]);
  const floatY = useTransform(smooth, [0,1], reduced ? [0,0] : [65,-25]);
  const radius = useTransform(smooth, [0,.5,1], reduced ? ['40%','40%','40%'] : ['48% 48% 4% 4%','26% 26% 4% 4%','4% 4% 4% 4%']);
  const lineScale = useTransform(smooth, [.12,.8], [0,1]);
  const noteOpacity = useTransform(smooth, [.18,.38,.78,.96], [0,1,1,0]);
  return <section id="memory-portal" ref={sectionRef} className="memory-portal-section" aria-label="Chuyển cảnh từ lời mời sang chuyện tình yêu"><div className="memory-portal-sticky">
    <motion.div className="portal-stitch" style={reduced ? undefined : {scaleX: lineScale}} />
    <motion.span className="eyebrow portal-top" style={reduced ? undefined : {opacity: noteOpacity}}>THE LITTLE MOMENTS BECOME FOREVER</motion.span>
    {/* ẢNH MEMORY PORTAL: tái sử dụng image.couple (5:7, 1000×1400px); nên để gương mặt giữa khung. */}<motion.div className="memory-portal-card" style={{scale, y:floatY, borderRadius:radius}}><ImageFrame src={wedding.image.couple} alt="Khoảnh khắc tình yêu của hai người" className="memory-portal-photo"/><div className="memory-portal-overlay"/><motion.div className="memory-portal-caption" style={reduced ? undefined : {opacity:noteOpacity}}>Every moment<br/><em>led us here.</em></motion.div></motion.div>
    <div className="portal-vertical-words">ONE LOVE · ONE JOURNEY · ONE FOREVER</div><span className="portal-bottom">✦ &nbsp; CHAPTER ONE &nbsp; ✦</span>
  </div></section>;
}
function CoupleSection() {
  return <section id="couple" className="couple-section section-pad">
    <div className="couple-linen"/><Floral position="right"/>
    <div className="container couple-layout">
      <div className="couple-image-area"><motion.div className="couple-image-mat" initial={{ opacity: 0, rotate: -4, y: 35 }} whileInView={{ opacity: 1, rotate: -2.5, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .95, ease }}><ImageFrame src={wedding.image.couple} alt="Cô dâu chú rể bên nhau" className="couple-image"/><span className="couple-image-caption">THE BEGINNING OF FOREVER</span></motion.div><span className="couple-image-ornament">✿</span></div>
      <div className="couple-copy"><span className="eyebrow">TWO SOULS · ONE STORY</span><motion.h2 className="section-title couple-story-title" initial={{clipPath:'inset(0 100% 0 0)',x:-18}} whileInView={{clipPath:'inset(0 0% 0 0)',x:0}} viewport={{once:true,amount:.35}} transition={{duration:1.15,ease}}>Mình đã<br/><em>tìm thấy nhau.</em></motion.h2><motion.span className="fine-line" initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} transition={{duration:.85,delay:.45,ease}}/><p>{wedding.intro}</p><div className="couple-families"><div><span>NHÀ TRAI</span><b>{wedding.couple.groomFullName}</b><small>{wedding.couple.groomParents.join(' & ')}</small></div><div><span>NHÀ GÁI</span><b>{wedding.couple.brideFullName}</b><small>{wedding.couple.brideParents.join(' & ')}</small></div></div><div className="script-signature">Together, always.</div></div>
    </div>
  </section>;
}
function StorySection() {
  return <section id="story" className="story-section section-pad">
    <div className="container"><SectionHeading kicker="EVERY LOVE STORY IS BEAUTIFUL" title="Chuyện chúng mình" caption="Những mảnh ký ức nhỏ đã đưa hai người đến một lời hẹn lớn."/>
      <div className="story-timeline"><Ribbon variant="loop" className="story-ribbon"/>
        {wedding.story.map((chapter, i) => <MemoryCard key={chapter.id} chapter={chapter} index={i} total={wedding.story.length}/>)}
      </div>
      <div className="story-closing"><span className="tiny-heart">♥</span><p>Và câu chuyện ấy vẫn đang được viết tiếp...</p></div>
    </div>
  </section>;
}
function Countdown() {
  const [parts, setParts] = useState(() => countdownParts(wedding.date));
  useEffect(() => { const id = window.setInterval(() => setParts(countdownParts(wedding.date)), 1000); return () => window.clearInterval(id); }, []);
  return <div className="countdown" aria-label="Đếm ngược đến ngày cưới">{parts.ended ? <span className="countdown-ended">Today is our forever ♡</span> : [ ['Ngày',parts.days], ['Giờ',parts.hours], ['Phút',parts.minutes], ['Giây',parts.seconds] ].map(([label,n]) => <div className="countdown-unit" key={label}><span>{withLeadingZero(Number(n))}</span><small>{label}</small></div>)}</div>;
}
function EventsSection() {
  const name = `${wedding.couple.groom} & ${wedding.couple.bride}`;
  return <section id="details" className="events-section section-pad"><div className="events-texture"/><Floral position="left"/><div className="container events-container"><SectionHeading kicker="THE BIG DAY" title="Ngày mình chung đôi" caption="Sẽ thật tuyệt nếu có bạn ở đó, cùng chúng mình giữ lại một ngày khó quên."/>
    <Countdown/><div className="calendar-ornament"><span className="calendar-month">{new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Ho_Chi_Minh',month:'long'}).format(new Date(wedding.date)).toUpperCase()}</span><span className="calendar-day-wrap"><motion.svg className="calendar-ribbon-ring" viewBox="0 0 88 88" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><motion.circle cx="44" cy="44" r="33" fill="none" stroke="#a35f69" strokeWidth="2.3" strokeLinecap="round" initial={{pathLength:0,rotate:-90}} whileInView={{pathLength:1,rotate:-90}} viewport={{once:true,amount:.9}} transition={{duration:1.45,ease}} style={{transformOrigin:'center'}}/></motion.svg><strong>{new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Ho_Chi_Minh',day:'numeric'}).format(new Date(wedding.date))}</strong></span><span className="calendar-weekday">{new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',weekday:'long'}).format(new Date(wedding.date)).toUpperCase()}</span></div>
    <div className="event-cards">{wedding.events.map((event,i)=><motion.article key={event.id} className="event-card" initial={{opacity:0,x:i===0?-125:125,rotate:i===0?-2.5:2.5,scale:.96}} whileInView={{opacity:1,x:0,rotate:0,scale:1}} viewport={{once:true,amount:.25}} transition={{type:'spring',stiffness:100,damping:20,mass:.85,delay:0}}><motion.span className="event-corner-seal" aria-hidden="true" initial={{opacity:0,scale:1.7,rotate:45}} whileInView={{opacity:1,scale:1,rotate:0}} viewport={{once:true}} transition={{duration:.65,delay:.56,ease}}>✦</motion.span><div className="event-symbol">{i===0?'✦':'♡'}</div><span className="eyebrow">{i===0 ? 'THE CEREMONY' : 'THE CELEBRATION'}</span><h3>{event.label}</h3><div className="event-detail"><CalendarDays size={18}/><span>{event.time}</span></div><div className="event-detail"><MapPin size={18}/><span><b>{event.venue}</b><small>{event.address}</small></span></div>{event.mapUrl ? <a href={event.mapUrl} target="_blank" rel="noreferrer" className="button button-outline">Xem chỉ đường <ArrowUpRight size={16}/></a> : <span className="event-location-pending">Địa điểm sẽ được cập nhật</span>}</motion.article>)}</div>
    <a className="calendar-add" href={buildCalendarUrl(name,wedding.date)} target="_blank" rel="noreferrer"><CalendarDays size={17}/> Thêm ngày cưới vào lịch của bạn <ArrowUpRight size={15}/></a>
  </div></section>;
}
function GallerySection({ onPhotoOpen, onVideoOpen }: { onPhotoOpen: (index: number) => void; onVideoOpen: () => void }) {
  const reduced = useReducedMotion();
  return <section id="gallery" className="gallery-section section-pad"><div className="container"><FragmentsHeading/>
    <div className="gallery-exhibition" aria-label="Bộ sưu tập ảnh cưới">
      <div className="gallery-film-perforations gallery-film-top" aria-hidden="true" />
      <div className="gallery-grid">{wedding.gallery.map((image,i)=><motion.button
        key={`${image.src}-${i}`} className={`gallery-tile tile-${i%6}`} type="button" onClick={() => onPhotoOpen(i)}
        initial={reduced ? { opacity: 0 } : { opacity: 0, x: [ -66, 34, 65, -37, 42, -48 ][i%6], y: [95,115,70,110,85,95][i%6], rotate: [ -11, 9, 6, -8, 9, -5 ][i%6], scale: .84 }}
        whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
        viewport={{ once:true, amount:.13 }}
        transition={reduced ? { duration:.25 } : { type:'spring',stiffness:94,damping:18,delay:Math.min(i*.115,.65) }}
        aria-label={`Xem ảnh ${i+1}: ${image.alt}`}>
        {/* GALLERY: 900×1200 px (3:4) hoặc 1200×900 px (4:3); WebP 100–300 KB. Đổi đường dẫn tại wedding.config.ts. */}
        <ImageFrame src={image.src} alt={image.alt}/>
        <motion.span className="gallery-exposure-wipe" aria-hidden="true" initial={reduced ? false : {scaleX:1}}
          whileInView={{scaleX:0}} viewport={{once:true,amount:.14}}
          transition={{duration:reduced?0:1.08,ease,delay:.25+Math.min(i*.115,.65)}}/>
        <motion.span className="gallery-light-line" aria-hidden="true" initial={reduced ? false : {scaleX:0,opacity:0}}
          whileInView={{scaleX:1,opacity:0}} viewport={{once:true,amount:.14}}
          transition={{duration:reduced?0:1.0,ease,delay:.27+Math.min(i*.115,.65)}}/>
        <span className="gallery-negative-index">{String(i+1).padStart(2,"0")} / {String(wedding.gallery.length).padStart(2,"0")}</span>
        <span className="gallery-zoom">XEM ẢNH <ArrowUpRight size={14}/></span>
      </motion.button>)}</div>
      <div className="gallery-film-perforations gallery-film-bottom" aria-hidden="true" />
    </div>
    <div className="gallery-actions"><span className="gallery-caption">✦ THE MOST BEAUTIFUL MOMENTS ARE SHARED ✦</span>{wedding.videoEmbedUrl && <button className="button button-outline" onClick={onVideoOpen}><Play size={16}/> Xem video cưới</button>}</div>
  </div></section>;
}
function Lightbox({ index, onClose, setIndex }: { index: number; onClose: () => void; setIndex: (index: number) => void }) {
  const startX = useRef<number | null>(null);
  const total = wedding.gallery.length;
  const previous = useCallback(() => setIndex(clampIndex(index - 1, total)), [index, setIndex, total]);
  const next = useCallback(() => setIndex(clampIndex(index + 1, total)), [index, setIndex, total]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if(e.key==='Escape')onClose(); if(e.key==='ArrowLeft')previous(); if(e.key==='ArrowRight')next(); };
    window.addEventListener('keydown',key);
    document.body.style.overflow='hidden';
    return () => { window.removeEventListener('keydown',key); document.body.style.overflow=''; };
  },[onClose,previous,next]);
  const photo = wedding.gallery[index];
  return <motion.div className="lightbox-backdrop" role="dialog" aria-modal="true" aria-label="Xem album ảnh cưới" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><button className="lightbox-close" aria-label="Đóng album" onClick={onClose}><X size={24}/></button><div className="lightbox-body" onClick={e=>e.stopPropagation()} onTouchStart={e=>{startX.current=e.changedTouches[0].clientX;}} onTouchEnd={e=>{if(startX.current===null)return;const delta=e.changedTouches[0].clientX-startX.current;if(Math.abs(delta)>45){delta>0?previous():next();}startX.current=null;}}><AnimatePresence mode="wait"><motion.img key={photo.src} className="lightbox-image" src={photo.src} alt={photo.alt} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: .23 }}/></AnimatePresence><div className="lightbox-bottom"><button aria-label="Ảnh trước" onClick={previous}><ArrowLeft size={23}/></button><span>{String(index+1).padStart(2,'0')} — {String(total).padStart(2,'0')}</span><button aria-label="Ảnh sau" onClick={next}><ArrowRight size={23}/></button></div></div></motion.div>;
}
function WishesSection({ guestName }: { guestName: string }) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [wishIndex, setWishIndex] = useState(0);
  const [letterOpen, setLetterOpen] = useState(false);
  const [writeOpen, setWriteOpen] = useState(false);
  const [name, setName] = useState(guestName);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const refresh = useCallback(async () => { const result = await loadWishes(); setWishes(result.wishes); setIsDemo(result.demo); }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const active = wishes[wishIndex];
  const go = (step: number) => { setWishIndex(i=>clampIndex(i+step,wishes.length)); setLetterOpen(false); };
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(name.trim().length<2 || message.trim().length<5) { setNotice('Vui lòng điền tên và lời chúc từ 5 ký tự.'); return; }
    setBusy(true); setNotice('');
    const result = await sendWish({guest_name:name.trim(),message:message.trim(),website,turnstile_token:challengeToken});
    setBusy(false);
    if (!result.ok) { setNotice(result.error || 'Có lỗi xảy ra.'); return; }
    setName(guestName);setMessage('');setWriteOpen(false);
    setNotice(result.demo ? 'Đã lưu lời chúc ở chế độ xem thử trên thiết bị này.' : result.pending ? 'Đã nhận lời chúc. Lời chúc sẽ xuất hiện sau khi được duyệt.' : 'Cảm ơn bạn! Lời chúc đã được gửi thành công.');
    await refresh();setWishIndex(0);
  };
  return <section id="wishes" className="wishes-section section-pad"><div className="wishes-grain"/><Floral position="right"/><div className="container wishes-container"><SectionHeading kicker="A LITTLE LOVE FROM EVERYONE" title="Những lời yêu thương" caption="Mỗi lời chúc là một kỷ niệm mà chúng mình sẽ luôn trân trọng."/>
    <Ribbon variant="heart" className="wishes-ribbon"/>
    <div className="wishes-display">
      <div className="wishes-side-note"><Heart size={17} strokeWidth={1.4}/> LOVE LETTERS<br/>FROM OUR PEOPLE</div>
      {active ? <div className="wish-carousel"><AnimatePresence mode="wait"><motion.button layout key={active.id} className={`wish-letter ${letterOpen?'wish-letter-open':''}`} type="button" onClick={()=>setLetterOpen(o=>!o)} initial={{opacity:0,y:70,rotate:-7,scale:.88}} animate={{opacity:1,y:0,rotate:letterOpen?0:-1,scale:1}} exit={{opacity:0,y:-12,rotate:2}} transition={{duration:.55,ease}} aria-label={letterOpen?'Thu nhỏ lời chúc':'Mở rộng lời chúc'}><span className="letter-ribbon-fold" aria-hidden="true"/><span className="letter-corner letter-top-left"/><span className="letter-corner letter-bottom-right"/><span className="wish-number">LETTER NO. {String(wishIndex+1).padStart(3,'0')}</span><Heart className="wish-heart" size={20} strokeWidth={1.3}/><span className="wish-to">Gửi hai bạn thương mến,</span><span className="wish-message">“{active.message}”</span><span className="wish-divider">✽</span><span className="wish-sender">— {active.guest_name} —</span><span className="wish-small">WITH LOVE & BEST WISHES</span><span className="letter-click-hint">{letterOpen?'Chạm để thu nhỏ':'Chạm để mở lá thư'}</span></motion.button></AnimatePresence><div className="wish-switcher"><button onClick={()=>go(-1)} aria-label="Lời chúc trước"><ArrowLeft size={19}/></button><span>{String(wishIndex+1).padStart(2,'0')} / {String(wishes.length).padStart(2,'0')}</span><button onClick={()=>go(1)} aria-label="Lời chúc tiếp theo"><ArrowRight size={19}/></button></div></div> : <div className="wishes-empty"><Mail size={35}/><h3>Lá thư đầu tiên</h3><p>Hãy là người đầu tiên gửi lời chúc đến cô dâu chú rể.</p></div>}
      <div className="wishes-side-note wishes-side-right">LET WORDS BECOME<br/>BEAUTIFUL MEMORIES <Sparkles size={18}/></div>
    </div>
    {isDemo && <p className="demo-caption">Các lời chúc đang hiển thị là dữ liệu minh họa. Khi kết nối Cloudflare D1, lời chúc thật sẽ xuất hiện tại đây.</p>}
    <div className="last-letter"><p className="script-signature">The next letter could be yours...</p><button className="button button-primary" onClick={()=>setWriteOpen(o=>!o)}>{writeOpen?'Đóng lá thư':'Viết một lời yêu thương'} {writeOpen?<X size={16}/>:<ArrowRight size={16}/>}</button></div>
    <AnimatePresence>{writeOpen && <motion.form className="wish-compose" initial={{opacity:0,height:0,y:-15}} animate={{opacity:1,height:'auto',y:0}} exit={{opacity:0,height:0,y:-15}} transition={{duration:.48,ease}} onSubmit={submit}><div className="compose-inner"><div className="eyebrow">A LETTER FROM THE HEART</div><h3>Viết một điều thật đẹp...</h3><label htmlFor="wish-name">Tên của bạn</label><input id="wish-name" maxLength={70} value={name} onChange={e=>setName(e.target.value)} placeholder="Tên người gửi" required/><label htmlFor="wish-message">Lời chúc</label><textarea id="wish-message" maxLength={500} rows={4} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Gửi hai bạn một chút yêu thương..." required/><div className="form-character-count">{message.length}/500</div><div className="honeypot" aria-hidden="true"><label htmlFor="wish-website">Website (để trống)</label><input id="wish-website" value={website} onChange={e=>setWebsite(e.target.value)} tabIndex={-1} autoComplete="off"/></div><TurnstileWidget onToken={setChallengeToken}/><button className="button button-primary" disabled={busy} type="submit">{busy?'Đang gửi...':'Niêm phong & gửi thư'} <Send size={16}/></button></div></motion.form>}</AnimatePresence>
    {notice && <p className="form-notice" role="status">{notice}</p>}
  </div></section>;
}
function RSVPSection({ guestName }: { guestName: string }) {
  const [name,setName]=useState(guestName);
  const [attending,setAttending]=useState(true);
  const [guestCount,setGuestCount]=useState(1);
  const [eventId,setEventId]=useState<string>(wedding.events[0]?.id || 'wedding');
  const [note,setNote]=useState('');
  const [website,setWebsite]=useState('');
  const [challengeToken,setChallengeToken]=useState('');
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState('');
  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();if(name.trim().length<2){setFeedback('Vui lòng nhập tên tối thiểu 2 ký tự.');return;}
    setBusy(true);setFeedback('');
    const response=await sendRSVP({guest_name:name.trim(),attending,guest_count:attending?guestCount:0,event_id:eventId,note,website,turnstile_token:challengeToken});
    setBusy(false);
    setFeedback(!response.ok ? response.error||'Có lỗi xảy ra.' : response.demo ? 'Đã lưu xác nhận ở chế độ xem thử trên thiết bị này. Khi kết nối D1 mới gửi thật được.' : 'Cảm ơn bạn! Chúng mình đã nhận được xác nhận.');
    if(response.ok)setNote('');
  };
  return <section id="rsvp" className="rsvp-section section-pad"><div className="container rsvp-layout"><div className="rsvp-intro"><span className="eyebrow">YOUR PRESENCE MEANS THE WORLD</span><h2 className="section-title">Bạn sẽ đến <em>chứ?</em></h2><p>Một chỗ ngồi nhỏ đã được dành sẵn, và niềm vui sẽ lớn hơn khi có bạn bên cạnh.</p><span className="rsvp-script">We can't wait to see you!</span><div className="rsvp-flower-line">✿ ─────────────── ✿</div></div><motion.form className="rsvp-form" onSubmit={submit} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.7}}><div className="rsvp-form-top"><span className="eyebrow">KINDLY REPLY</span><h3>Xác nhận tham dự</h3></div><fieldset className="attendance-options"><legend>Bạn có tham dự không?</legend><button type="button" aria-pressed={attending} className={attending?'selected':''} onClick={()=>setAttending(true)}><Heart size={15}/> Mình sẽ đến</button><button type="button" aria-pressed={!attending} className={!attending?'selected':''} onClick={()=>setAttending(false)}>Rất tiếc, không thể</button></fieldset><label htmlFor="rsvp-name">Tên của bạn <span>*</span></label><input id="rsvp-name" value={name} onChange={e=>setName(e.target.value)} maxLength={70} placeholder="Nguyễn Văn A" required/>{attending && <><div className="rsvp-inline"><div><label htmlFor="rsvp-count">Số khách</label><select id="rsvp-count" value={guestCount} onChange={e=>setGuestCount(Number(e.target.value))}>{[1,2,3,4,5].map(n=><option value={n} key={n}>{n} người</option>)}</select></div><div><label htmlFor="rsvp-event">Tham dự sự kiện</label><select id="rsvp-event" value={eventId} onChange={e=>setEventId(e.target.value)}>{wedding.events.map(e=><option value={e.id} key={e.id}>{e.label}</option>)}</select></div></div></>}<label htmlFor="rsvp-note">Lời nhắn (không bắt buộc)</label><textarea id="rsvp-note" rows={3} maxLength={500} value={note} onChange={e=>setNote(e.target.value)} placeholder="Nhắn đôi lời tới chúng mình..."/><div className="honeypot" aria-hidden="true"><label htmlFor="rsvp-website">Website (để trống)</label><input id="rsvp-website" value={website} onChange={e=>setWebsite(e.target.value)} tabIndex={-1} autoComplete="off"/></div><TurnstileWidget onToken={setChallengeToken}/><button className="button button-primary rsvp-submit" type="submit" disabled={busy}>{busy?'Đang gửi...':'Gửi xác nhận'} <ArrowRight size={17}/></button>{feedback && <p className="form-notice" role="status">{feedback}</p>}</motion.form></div></section>;
}
function GiftSection() {
  const [open,setOpen]=useState(false);
  const [unwrapping,setUnwrapping]=useState(false);
  const reduced = useReducedMotion();
  const openGift=()=>{
    if(open||unwrapping)return;
    // Mount popup on the same click frame; entry is simply choreographed after the lid lifts.
    // No 1450ms timer / layout stall before React paints the modal.
    if(!reduced)setUnwrapping(true);
    setOpen(true);
  };
  const [copied,setCopied]=useState('');
  const copy=async(text:string)=>{try{await navigator.clipboard.writeText(text);setCopied(text);setTimeout(()=>setCopied(''),2300);}catch{setCopied('Không thể sao chép — vui lòng chọn số tài khoản thủ công.');}};
  return <section id="gift" className="gift-section section-pad"><div className="container gift-layout"><SectionHeading kicker="WITH ALL OUR LOVE" title="Hộp quà yêu thương" caption="Sự hiện diện và những lời chúc của bạn đã là món quà quý giá nhất đối với chúng mình."/><div className="gift-object-wrap"><motion.button initial={false} whileInView={reduced?undefined:{rotate:[0,-5,4,-3,2,0],y:[0,-6,-3,0]}} viewport={{once:true,amount:.6}} whileHover={reduced?undefined:{rotate:-2,y:-9}} transition={{duration:1.1,ease}} className={`gift-object ${unwrapping?'gift-object-unwrapping':''}`} aria-label="Mở hộp quà mừng cưới" onClick={openGift} disabled={unwrapping}><div className="gift-lid"/><div className="gift-box-face"><span className="gift-box-symbol">{wedding.couple.initials}</span><span className="gift-box-caption">WITH LOVE</span></div><div className="gift-ribbon-vertical"/><div className="gift-ribbon-horizontal"/><div className="gift-bow"><span/><span/></div><span className="gift-floating-star gift-star-a">✧</span><span className="gift-floating-star gift-star-b">✧</span></motion.button></div><button className="button button-outline gift-open-btn" onClick={openGift} disabled={unwrapping}>Mở hộp quà <Gift size={16}/></button><p className="gift-bottom-note">Your love is the greatest gift of all.</p></div>
    <AnimatePresence>{open && <Modal delay={reduced?0:.47} onClose={()=>{setOpen(false);setUnwrapping(false);}} label="Thông tin mừng cưới"><div className="gift-modal-content"><span className="eyebrow">A GIFT OF LOVE</span><h3>Một chút yêu thương</h3><p>Những lời chúc và sự hiện diện của bạn là niềm hạnh phúc của chúng mình. Nếu muốn gửi món quà nhỏ, bạn có thể sử dụng thông tin bên dưới.</p>{wedding.bankAccounts.length ? <div className="gift-bank-list">{wedding.bankAccounts.map(account=><div className="bank-card" key={account.accountNumber}><span className="eyebrow">{account.role} · {account.bank}</span><h4>{account.owner}</h4>{account.qrImage && <ImageFrame src={account.qrImage} alt={`Mã QR chuyển khoản của ${account.owner}`} className="bank-qr"/>}<p className="bank-account-number">{account.accountNumber}</p><button className="button button-outline" onClick={()=>copy(account.accountNumber)}>{copied===account.accountNumber?<Check size={15}/>:<Copy size={15}/>} {copied===account.accountNumber?'Đã sao chép':'Sao chép số tài khoản'}</button></div>)}</div> : <div className="gift-empty"><Mail size={28}/><p>Thông tin mừng cưới sẽ được cập nhật.<br/>Bạn có thể thay tài khoản & QR thật tại <code>src/wedding.config.ts</code>.</p></div>}{copied.startsWith('Không thể') && <p role="status">{copied}</p>}</div></Modal>}</AnimatePresence>
  </section>;
}
function Modal({ onClose, label, children, delay=0 }: { onClose: () => void; label: string; children: ReactNode; delay?:number }) {
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',key);document.body.style.overflow='hidden';return()=>{window.removeEventListener('keydown',key);document.body.style.overflow='';};},[onClose]);
  return <motion.div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={label} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,transition:{duration:.22,delay:0}}} transition={{duration:.28,delay}} onClick={onClose}><motion.div className="modal-card" onClick={e=>e.stopPropagation()} initial={{opacity:0,y:35,scale:.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:.98,transition:{duration:.2,delay:0}}} transition={{duration:.35,delay,ease}}><button className="modal-close" onClick={onClose} aria-label="Đóng"><X size={22}/></button>{children}</motion.div></motion.div>;
}
function Footer({ onReplay }: { onReplay: () => void }) {
  const [shared,setShared]=useState(false);
  const share=async()=>{try {if(navigator.share)await navigator.share({title:'Thiệp cưới',text:'Trân trọng kính mời bạn đến chung vui!',url:window.location.href});else {await navigator.clipboard.writeText(window.location.href);setShared(true);setTimeout(()=>setShared(false),2500);}}catch{/* user cancelled share */}};
  return <footer className="footer-section"><Floral position="left"/><div className="container footer-content"><div className="eyebrow">THE BEGINNING OF OUR FOREVER</div><div className="footer-names">{wedding.couple.groom} <em>&</em> {wedding.couple.bride}</div><span className="footer-date">{wedding.dateText}</span><span className="footer-rule"/><p>{wedding.thanks}</p><button className="footer-share" onClick={share}>{shared?<Check size={16}/>:<Mail size={16}/>} {shared?'Đã sao chép liên kết':'Chia sẻ thiệp cưới'}</button><button className="footer-replay" onClick={onReplay}><RotateCcw size={15}/> Xem lại hiệu ứng mở thiệp</button><span className="footer-made">MADE WITH LOVE · THE LIVING RIBBON</span></div><button className="back-to-top" onClick={()=>scrollTo('home')} aria-label="Quay lại đầu trang"><ArrowUp size={19}/></button></footer>;
}
export default function App() {
  const [guestName] = useState(getGuestName);
  const [opened,setOpened]=useState(()=>!wedding.sections.opening);
  const [heroRevealed,setHeroRevealed]=useState(()=>!wedding.sections.opening);
  // Tăng mỗi lần xem lại để tất cả Motion components được mount mới, reset once:true/useInView.
  const [animationCycle, setAnimationCycle] = useState(0);
  const [playing,setPlaying]=useState(false);
  const [lightbox,setLightbox]=useState<number|null>(null);
  const [videoOpen,setVideoOpen]=useState(false);
  const audioRef=useRef<HTMLAudioElement>(null);
  useEffect(()=>{if(!opened){window.scrollTo({top:0,behavior:'auto'});document.body.style.overflow='hidden';return()=>{document.body.style.overflow='';};}},[opened]);
  const enter=()=>{setHeroRevealed(true);setOpened(true);};
  const replayStory = () => {
    // Trở về đầu ngay trước khi render lại, tránh useInView kích hoạt ở scroll cũ.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setHeroRevealed(false);
    setOpened(false);
    // <main key> được tạo lại -> Story / Gallery / Ribbon / RSVP đều có lượt animation mới.
    setAnimationCycle(cycle => cycle + 1);
  };
  // Preload the photo during the opening scene so it is decoded before the overlay dissolves.
  useEffect(()=>{const image=new Image();image.src=wedding.image.hero;void image.decode?.().catch(()=>{});},[]);
  const beginMusic=async()=>{
    if(wedding.musicUrl&&audioRef.current&&!playing){
      try { await audioRef.current.play(); setPlaying(true); }
      catch { setPlaying(false); }
    }
  };
  return <>
    <AnimatePresence>{!opened && <Opening onBegin={()=>{void beginMusic();}} onReveal={()=>setHeroRevealed(true)} onEnter={enter} guestName={guestName}/>}</AnimatePresence>
    {wedding.musicUrl && <audio ref={audioRef} src={wedding.musicUrl} loop preload="none" onEnded={()=>setPlaying(false)} />}
    <Header opened={opened}/>
    <HeartRain visible={opened && wedding.effects.heartRain} />
    {wedding.isDemo && opened && <div className="demo-ribbon">BẢN XEM TRƯỚC — HÃY THAY DỮ LIỆU TẠI <code>wedding.config.ts</code></div>}
    <main key={animationCycle}>
      <Hero guestName={guestName} active={heroRevealed}/>
      {wedding.sections.couple && <><MemoryPortal/><CoupleSection/></>}
      {wedding.sections.story && <><JourneyTransition number="02" title="Những ký ức của mình" motif="heart"/><StorySection/></>}
      {(wedding.sections.countdown || wedding.sections.events) && <><JourneyTransition number="03" title="Ngày chung đôi" motif="rings"/><EventsSection/></>}
      {wedding.sections.gallery && <><JourneyTransition number="04" title="Khung hình yêu thương" motif="loop"/><GallerySection onPhotoOpen={setLightbox} onVideoOpen={()=>setVideoOpen(true)}/></>}
      {wedding.sections.wishes && <><JourneyTransition number="05" title="Những lá thư yêu thương" motif="letter"/><WishesSection guestName={guestName}/></>}
      {wedding.sections.rsvp && <><JourneyTransition number="06" title="Hẹn gặp vào ngày vui" motif="loop"/><RSVPSection guestName={guestName}/></>}
      {wedding.sections.gift && <><JourneyTransition number="07" title="Một chút yêu thương" motif="bow"/><GiftSection/></>}
    </main>
    <Footer onReplay={replayStory}/>
    {opened && <MusicControl playing={playing} setPlaying={setPlaying} audioRef={audioRef}/>}
    <AnimatePresence>{lightbox!==null && <Lightbox index={lightbox} setIndex={setLightbox} onClose={()=>setLightbox(null)}/>}</AnimatePresence>
    <AnimatePresence>{videoOpen && wedding.videoEmbedUrl && <Modal onClose={()=>setVideoOpen(false)} label="Video cưới"><div className="video-shell"><iframe src={`${wedding.videoEmbedUrl}${wedding.videoEmbedUrl.includes('?')?'&':'?'}autoplay=1`} title="Video cưới" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /></div></Modal>}</AnimatePresence>
    <div className="sr-only">Các mục: {SECTION_IDS.join(', ')}</div>
  </>;
}

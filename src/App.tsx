import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, RotateCcw, CalendarDays, Check, Copy, Gift, Heart, Lock, Mail, MapPin, Menu, Music2, Pause, Play, Send, Sparkles, X } from 'lucide-react';
import { wedding } from './wedding.config';
import { Ribbon } from './components/Ribbon';
import { JourneyTransition } from './components/JourneyTransition';
import { TurnstileWidget } from './components/TurnstileWidget';
import { HeartRain } from './components/HeartRain';
import { MemoryCard } from './components/MemoryCard';
import { FragmentsHeading } from './components/FragmentsHeading';
// Admin dashboard moved to /admin route (see src/pages/AdminPage.tsx)
import { TwoHalvesHeart } from './components/TwoHalvesHeart';
import { useGentleAutoScroll } from './components/useGentleAutoScroll';
import { buildCalendarUrl, clampIndex, countdownParts, getGuestName, withLeadingZero } from './lib/utils';
import { loadWishes, sendRSVP, sendWish, type Wish } from './lib/api';
import { getInitialInvitationSide, setInvitationUrlSide, sideLabels, type InvitationSide } from './lib/invitation-side';
import { Toast, type ToastData } from './components/Toast';

const ease = [0.22, 1, 0.36, 1] as const;
const SECTION_IDS = ['home', 'details', 'story', 'gallery', 'wishes', 'gift'] as const;
// Tháng bằng chữ, thống nhất cách ghi trang trọng trên thiệp cưới Việt Nam.
const VIETNAMESE_MONTH_NAMES = ['MỘT', 'HAI', 'BA', 'TƯ', 'NĂM', 'SÁU', 'BẢY', 'TÁM', 'CHÍN', 'MƯỜI', 'MƯỜI MỘT', 'MƯỜI HAI'] as const;
const weddingDateParts = (date: string) => new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit'
}).formatToParts(new Date(date));
function getWeddingDatePart(date: string, part: 'day' | 'month' | 'year') {
  return weddingDateParts(date).find(item => item.type === part)?.value ?? '';
}
function formatWeddingMonth(date: string) {
  const monthIndex = Number(getWeddingDatePart(date, 'month')) - 1;
  return `THÁNG ${VIETNAMESE_MONTH_NAMES[monthIndex] ?? '—'}`;
}
function formatWeddingWeekday(date: string) {
  return new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long' })
    .format(new Date(date)).toLocaleUpperCase('vi-VN');
}
function formatWeddingShortDate(date: string) {
  return [getWeddingDatePart(date, 'day'), getWeddingDatePart(date, 'month'), getWeddingDatePart(date, 'year')].join('.');
}

const navItems = [
  { id: 'home', label: 'Trang đầu' },
  { id: 'details', label: 'Thiệp mời' },
  { id: 'story', label: 'Chuyện chúng mình' },
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
function EnvelopeArt({ opened = false, dateText }: { opened?: boolean; dateText: string }) {
  return <div className={`envelope-art ${opened ? 'envelope-art-open' : ''}`} aria-hidden="true"><div className="envelope-note"><span className="envelope-note-small">Ngày vui của chúng mình</span><span className="envelope-note-script">Trân trọng kính mời</span><span className="envelope-note-small">{dateText}</span></div><div className="envelope-back"/><div className="envelope-flap"/><div className="envelope-front"/><div className="envelope-seal"><WaxSeal large /></div></div>;
}
/**
 * Opening choreography:
 * 0ms      → seal lifts (unseal)
 * 650ms    → envelope flap folds back, letter emerges (unfold)
 * 1700ms   → silk line traces outward, paper scene dissolves (journey)
 * 2850ms   → reveal the underlying hero and start its entrance
 * Motion reduction → enter immediately. Timers are cleared on unmount.
 */
function Opening({ onEnter, onReveal, onBegin, onSelect, side, guestName }: { onEnter: () => void; onReveal: () => void; onBegin: () => void; onSelect: (side: InvitationSide) => void; side: InvitationSide | null; guestName: string }) {
  // Freeze the original entry mode. Updating `side` must NOT unmount the two-envelope stage.
  // V9 jumped immediately to the single envelope before its selection choreography could run.
  const [startsWithChooser] = useState(() => side === null);
  const [phase, setPhase] = useState<'sealed' | 'focus' | 'handoff' | 'unseal' | 'unfold' | 'journey'>('sealed');
  const [chosen, setChosen] = useState<InvitationSide | null>(null);
  const [focusX, setFocusX] = useState(0);
  const [focusY, setFocusY] = useState(-12);
  const [focusScale, setFocusScale] = useState(1.13);
  const choiceRefs = useRef<Record<InvitationSide, HTMLButtonElement | null>>({ groom: null, bride: null });
  const reduced = useReducedMotion();
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);
  const schedule = (callback: () => void, delay: number) => {
    timers.current.push(window.setTimeout(callback, delay));
  };
  const begin = (picked?: InvitationSide) => {
    if (phase !== 'sealed' || (startsWithChooser && !picked)) return;
    if (picked) {
      const button = choiceRefs.current[picked];
      const rect = button?.getBoundingClientRect();
      const smallEnvelope = button?.querySelector<HTMLElement>('.opening-choice-envelope')?.getBoundingClientRect();
      if (rect && smallEnvelope) {
        // Đo riêng phong bì, không dùng cả card có label bên dưới. Khi scale
        // quanh tâm button, bù offset tâm phong bì để khớp với phong bì lớn.
        const destination = document.querySelector<HTMLElement>('.opening-content .envelope-art')?.getBoundingClientRect();
        const factor = destination ? Math.min(2.26, Math.max(1.05, destination.width / smallEnvelope.width * .95)) : 1.15;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const envelopeOffsetX = smallEnvelope.left + smallEnvelope.width / 2 - centerX;
        const envelopeOffsetY = smallEnvelope.top + smallEnvelope.height / 2 - centerY;
        setFocusX((destination ? destination.left + destination.width / 2 : window.innerWidth / 2) - centerX - envelopeOffsetX * factor);
        setFocusY((destination ? destination.top + destination.height / 2 : window.innerHeight / 2) - centerY - envelopeOffsetY * factor);
        setFocusScale(factor);
      }
      setChosen(picked);
      onSelect(picked);
    }
    // User gesture: iOS Safari allows audio only when play is initiated from the real click.
    onBegin();
    if (reduced) { onReveal(); onEnter(); return; }
    if (startsWithChooser) {
      // Both cards STAY mounted while the chosen card moves to the centre.
      setPhase('focus');
      // Một lần mở duy nhất: phong bì NHỎ chỉ di chuyển, không bung dấu sáp.
      // Handoff hòa sang phong bì lớn vẫn đang ĐÓNG; chỉ phong bì LỚN mới mở.
      // Không remount cả trang / không cho 2 animation mở lặp nhau.
      schedule(() => setPhase('handoff'), 780);
      schedule(() => setPhase('unseal'), 1510);
      schedule(() => setPhase('unfold'), 1950);
      schedule(() => { setPhase('journey'); onReveal(); }, 2850);
      schedule(onEnter, 4090);
    } else {
      setPhase('unseal');
      schedule(() => setPhase('unfold'), 460);
      schedule(() => { setPhase('journey'); onReveal(); }, 1250);
      schedule(onEnter, 2230);
    }
  };
  const isChoosing = startsWithChooser && ['sealed', 'focus', 'handoff'].includes(phase);
  const mainVisible = !startsWithChooser || ['handoff', 'unseal', 'unfold', 'journey'].includes(phase);
  const isOpening = ['unseal', 'unfold', 'journey'].includes(phase);
  // Link chung: lời mời chỉ hiện trên LÁ THƯ khi mở; không có heading thứ hai.
  const showLetterCopy = !startsWithChooser;
  return <motion.div className={`opening-screen opening-phase-${phase} ${startsWithChooser ? 'opening-has-chooser' : ''}`}
    initial={{ opacity: 1 }} exit={{ opacity: 0, pointerEvents: 'none' }} transition={{ duration: reduced ? .12 : .76, ease }}>
    <div className="opening-background"/><Floral position="left"/><Floral position="right"/>
    <svg className="opening-silk-trail" viewBox="0 0 900 650" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="opening-silk-grad"><stop stopColor="#c98b8d"/><stop offset=".45" stopColor="#6f2d3c"/><stop offset="1" stopColor="#c98b8d"/></linearGradient></defs>
      <motion.path d="M452 360 C400 301 305 438 192 310 S45 152 -30 262 M452 360 C561 271 637 459 740 343 S835 205 940 182" fill="none" stroke="url(#opening-silk-grad)" strokeWidth="5" strokeLinecap="round"
        initial={{pathLength:0,opacity:0}} animate={{pathLength:phase==='journey'?1:0,opacity:phase==='journey'?1:0}}
        transition={{pathLength:{duration:1.12,ease},opacity:{duration:.3}}} />
    </svg>
    <motion.div className="opening-content"
      initial={startsWithChooser ? false : {opacity:0,y:24}}
      animate={{opacity:mainVisible?1:0,y:mainVisible?0:16}}
      transition={{duration: startsWithChooser ? .68 : .8, ease}}
      style={{pointerEvents:mainVisible?'auto':'none'}} aria-hidden={!mainVisible}>
      <div className="eyebrow">NIỀM VUI CỦA HAI GIA ĐÌNH</div>
      <div className="opening-monogram">{wedding.couple.initials}</div>
      <EnvelopeArt opened={isOpening} dateText={wedding.invitations[side || chosen || 'groom'].dateText} />
      {!startsWithChooser && <motion.div className="opening-copy" initial={false}
        animate={{opacity:showLetterCopy?1:0,y:showLetterCopy?0:16}}
        transition={{duration:startsWithChooser?.72:.45,ease}}
        style={{pointerEvents:showLetterCopy?'auto':'none'}}>
        <p className="invitation-script">Trân trọng kính mời</p>
        <p className="opening-text">{guestName ? `Thân mời ${guestName}` : wedding.greeting}</p>
        <button className="button button-primary opening-button" onClick={()=>begin()} disabled={phase!=='sealed'||startsWithChooser} tabIndex={startsWithChooser?-1:0}
          aria-label="Chạm để mở phong bì và bắt đầu câu chuyện">
          {phase==='sealed'?'Mở thiệp cưới':'Chuyện mình bắt đầu...'} <ArrowRight size={16}/>
        </button>
        <p className="opening-hint">{phase==='sealed'?'CHẠM ĐỂ BẮT ĐẦU CÂU CHUYỆN':'DẢI LỤA DẪN LỐI YÊU THƯƠNG'}</p>
      </motion.div>}
    </motion.div>
    <>
      {isChoosing && <motion.div className="opening-chooser-stage" key="chooser"
        initial={false} animate={{opacity:phase==='handoff'?0:1}}
        exit={{opacity:0}} transition={{duration:.68,ease}} style={{pointerEvents:phase==='sealed'?'auto':'none'}}>
        <div className="opening-chooser-content">
          <motion.div className="opening-chooser-heading"
            animate={{opacity:phase==='sealed'?1:0,y:phase==='sealed'?0:-18}}
            transition={{duration:.38}}>
            <div className="eyebrow">NIỀM VUI CỦA HAI GIA ĐÌNH</div>
            <div className="opening-monogram">{wedding.couple.initials}</div>
            <h1 className="opening-chooser-title">Có một lời mời dành cho bạn…</h1>
            <p className="opening-chooser-caption">Một câu chuyện tình yêu · Hai lời mời trân quý</p>
          </motion.div>
          <div className="opening-envelope-options" role="group" aria-label="Chọn thiệp cưới nhà trai hoặc nhà gái">
            {(['groom','bride'] as const).map((choice,index) => {
              const focused = choice===chosen;
              return <motion.button type="button" key={choice} ref={node=>{choiceRefs.current[choice]=node;}}
                className={`opening-envelope-choice ${focused?'opening-envelope-selected':''}`}
                initial={reduced?false:{opacity:0,x:choice==='groom'?-95:95,y:18,rotate:choice==='groom'?-7:7,scale:.9}}
                animate={chosen ? (focused
                  ? {opacity:1,x:focusX,y:focusY,rotate:0,scale:focusScale,zIndex:4}
                  : {opacity:0,x:choice==='groom'?-82:82,y:25,rotate:choice==='groom'?-8:8,scale:.84,zIndex:0})
                  : {opacity:1,x:0,y:0,rotate:0,scale:1,zIndex:1}}
                whileHover={!chosen&&!reduced?{y:-7,rotate:choice==='groom'?-2:2}:undefined}
                whileTap={!chosen&&!reduced?{scale:.97}:undefined}
                transition={{type:'spring',stiffness:chosen?115:105,damping:chosen?20:16,delay:chosen?0:index*.16+.12}}
                onClick={()=>begin(choice)} disabled={phase!=='sealed'}>
                <span className="opening-choice-envelope" aria-hidden="true">
                  <span className="opening-choice-paper"/>
                  <span className="opening-choice-flap"/>
                  <span className="opening-choice-seal">♥</span>
                </span>
                <span className="opening-choice-label">THIỆP {choice==='groom'?'NHÀ TRAI':'NHÀ GÁI'}</span>
                <span className="opening-choice-sub">{wedding.invitations[choice].ceremonyName}</span>
              </motion.button>;
            })}
          </div>
          <motion.p className="opening-chooser-hint"
            animate={{opacity:phase==='sealed'?1:0}}
            transition={{duration:.25}}>
            Chạm vào một phong bì để mở thiệp · Chỉ một lần chạm
          </motion.p>
        </div>
      </motion.div>}
    </>
    <span className="opening-side-note">MỘT CHUYỆN TÌNH ĐƯỢC VIẾT BẰNG YÊU THƯƠNG · {wedding.invitations[side || chosen || 'groom'].dateText.slice(-4)}</span>
  </motion.div>;
}

function Header({ opened, onRSVP, side, onSwitchSide }: { opened: boolean; onRSVP: () => void; side: InvitationSide | null; onSwitchSide: (side: InvitationSide) => void }) {
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
    <div className="desktop-side-picker" aria-label="Đổi phiên bản thiệp"><span>Thiệp {side==='groom'?'nhà trai':'nhà gái'}</span><select value={side || 'groom'} onChange={e=>onSwitchSide(e.target.value as InvitationSide)} aria-label="Chọn thiệp nhà trai hoặc nhà gái"><option value="groom">Nhà trai</option><option value="bride">Nhà gái</option></select></div>
    {/* Small, discoverable mobile control: switching is one tap, no hidden menu. */}
    <motion.button type="button" className="mobile-side-chip" whileTap={{scale:.96}}
      onClick={()=>{setMenuOpen(false);onSwitchSide(side==='groom'?'bride':'groom');}}
      aria-label={`Đang xem thiệp ${side==='groom'?'nhà trai':'nhà gái'}. Chạm để đổi sang thiệp ${side==='groom'?'nhà gái':'nhà trai'}`}
      title={`Đổi sang thiệp ${side==='groom'?'nhà gái':'nhà trai'}`}>
      <span>Thiệp {side==='groom'?'nhà trai':'nhà gái'}</span><RotateCcw size={13} strokeWidth={1.7}/>
    </motion.button>
    <button type="button" onClick={onRSVP} className="nav-rsvp">Xác nhận tham dự <ArrowUpRight size={14}/></button>
    <button className="menu-toggle" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>{menuOpen ? <X size={23}/> : <Menu size={23}/>}</button>
    <AnimatePresence>{menuOpen && <motion.nav className="mobile-nav" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} aria-label="Điều hướng trên điện thoại">{navItems.map(item => <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}>{item.label}<ArrowUpRight size={15}/></a>)}<div className="mobile-side-switch"><span>Đang xem: {side ? sideLabels[side] : 'Thiệp cưới'}</span><button type="button" onClick={()=>{setMenuOpen(false);onSwitchSide(side==='groom'?'bride':'groom');}}>Đổi sang {side==='groom'?'nhà gái':'nhà trai'}</button></div><button type="button" onClick={() => {setMenuOpen(false);onRSVP();}}>Xác nhận tham dự <Heart size={15}/></button></motion.nav>}</AnimatePresence>
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
function Hero({ guestName, active, side }: { guestName: string; active: boolean; side: InvitationSide }) {
  const invitation = wedding.invitations[side];
  const heroRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  // Hero mobile/tablet hai tầng: ảnh được ưu tiên, khối tên tách xuống phía dưới.
  const [compactHero, setCompactHero] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 920px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 920px)');
    const update = () => setCompactHero(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0,1], ['0%', reduced ? '0%' : '13%']);
  const imageScale = useTransform(scrollYProgress, [0,1], [1, reduced ? 1 : 1.08]);
  return <section id="home" className="hero-section" ref={heroRef}>
    <div className="hero-canvas"><div className="hero-pattern"/><div className="hero-ribbon-back"/>
      <motion.div className="hero-photo-wrap" style={{ y: compactHero ? '0%' : imageY, scale: compactHero ? 1 : imageScale }} initial={false}>
        {/* HERO MOBILE/TABLET: ảnh nguyên bản nên tối thiểu 1200 × 1600px (3:4).
            Chỉnh heroPositionMobile/heroPositionDesktop ở wedding.config.ts để tránh cắt gương mặt. */}
        <img src={wedding.image.hero} alt="Ảnh cưới của cô dâu và chú rể" className="hero-photo"
          style={{objectPosition:compactHero?wedding.image.heroPositionMobile:wedding.image.heroPositionDesktop}}
          loading="eager" decoding="async" fetchPriority="high" />
        <div className="hero-photo-veil"/>
      </motion.div>
      <motion.div className="hero-photo-kicker" aria-hidden="true"
        initial={false} animate={{opacity:active?1:0,y:active?0:12}}
        transition={{duration:.75,ease}}>NGÀY HẠNH PHÚC CỦA <span>♡</span></motion.div>
      <div className="hero-content">
        <motion.span initial={false} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 26 }} transition={{ duration: .65, ease }} className="eyebrow hero-kicker">NGÀY HẠNH PHÚC CỦA</motion.span>
        <motion.h1 initial={false} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 48, scale: active ? 1 : .965 }} transition={{ duration: .82, ease }} className="hero-names"><span>{wedding.couple.groom}</span><em>&</em><span>{wedding.couple.bride}</span></motion.h1>
        <motion.div initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: .65, ease }} className="hero-date">{invitation.dateText}</motion.div>
        <span className="hero-divider"/>
        <p className="hero-subtitle">Từ hôm nay, mình có nhau</p>
        {guestName && <p className="guest-personalization">Thật vui vì có bạn, <b>{guestName}</b>, ở đây ♡</p>}
      </div>
      <div className="hero-vertical">YÊU THƯƠNG LÀ MỘT HÀNH TRÌNH</div>
      <button className="hero-scroll" onClick={() => scrollTo('details')} aria-label="Khám phá câu chuyện của chúng mình"><ArrowDown size={20}/><span>CUỘN ĐỂ KHÁM PHÁ</span></button>
      <div className="hero-stamp"><Heart size={18} fill="currentColor"/><span>MỘT ĐỜI<br/>BÊN NHAU</span></div>
    </div>
  </section>;
}
function StorySection() {
  return <section id="story" className="story-section section-pad">
    <div className="container"><SectionHeading kicker="TỪ NHỮNG ĐIỀU THẬT NHỎ" title="Chuyện chúng mình" caption="Từ những lần gặp gỡ, những điều bé nhỏ đã đưa chúng mình đến một lời hẹn trăm năm."/>
      <div className="story-timeline"><Ribbon variant="loop" className="story-ribbon"/>
        {wedding.story.map((chapter, i) => <MemoryCard key={chapter.id} chapter={chapter} index={i} total={wedding.story.length}/>)}
      </div>
      <div className="story-closing"><span className="tiny-heart">♥</span><p>Và câu chuyện ấy vẫn đang được viết tiếp...</p></div>
    </div>
  </section>;
}
function Countdown({ date }: { date: string }) {
  const [parts, setParts] = useState(() => countdownParts(date));
  useEffect(() => { setParts(countdownParts(date)); const id = window.setInterval(() => setParts(countdownParts(date)), 1000); return () => window.clearInterval(id); }, [date]);
  return <div className="countdown" aria-label="Đếm ngược đến ngày cưới">{parts.ended ? <span className="countdown-ended">Hôm nay là ngày chung đôi ♡</span> : [ ['Ngày',parts.days], ['Giờ',parts.hours], ['Phút',parts.minutes], ['Giây',parts.seconds] ].map(([label,n]) => <div className="countdown-unit" key={label}><span>{withLeadingZero(Number(n))}</span><small>{label}</small></div>)}</div>;
}
/**
 * The ring is local to the date tile, NOT the whole month/day/year row.
 * Trigger the drawing from a normal HTML span rather than observing the SVG
 * circle itself (which proved unreliable after replay / on some browsers).
 * A subtle static guide circle ensures that 14 remains circled even before
 * the animation starts or if the user requests reduced motion.
 */
function WeddingDayCircle({ date }: { date: string }) {
  const dayRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(dayRef, { once: true, amount: .2, margin: '0px 0px -5% 0px' });
  const reduced = useReducedMotion();
  const day = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', day: 'numeric',
  }).format(new Date(date));
  return <span ref={dayRef} className="calendar-day-wrap">
    <svg className="calendar-ribbon-ring" viewBox="0 0 88 88" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <circle className="calendar-ribbon-guide" cx="44" cy="44" r="32" />
      <motion.circle className="calendar-ribbon-animated" cx="44" cy="44" r="32"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: inView || reduced ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }} />
    </svg>
    <strong>{day}</strong>
  </span>;
}
function WeddingInvitation({ guestName, side }: { guestName: string; side: InvitationSide }) {
  const invitation = wedding.invitations[side];
  const name = `${wedding.couple.groom} & ${wedding.couple.bride}`;
  const reduced = useReducedMotion();
  return <section id="details" className="invitation-section section-pad" aria-labelledby="invitation-heading">
    <div className="events-texture"/><Floral position="left"/>
    <div className="container invitation-layout">
      <div className="invitation-header">
        <span className="eyebrow">HAI TRÁI TIM · MỘT LỜI HẸN ƯỚC</span>
        <motion.h2 id="invitation-heading" className="section-title"
          initial={reduced ? false : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }}
          transition={{ duration: reduced ? 0 : .9, ease }}>
          Thiệp mời <em>ngày chung đôi</em>
        </motion.h2>
        <p>Trân trọng kính mời bạn đến chung vui trong ngày hạnh phúc của hai gia đình.</p>
      </div>
      <TwoHalvesHeart/>
      <motion.article className="formal-invitation" initial={{opacity:0,y:reduced?0:60,scale:reduced?1:.96}} whileInView={{opacity:1,y:0,scale:1}} viewport={{once:true,amount:.08}} transition={{duration:reduced?0:.95,ease}}>
        <span className="formal-invitation-kicker">NIỀM VUI CỦA HAI GIA ĐÌNH</span>
        <div className="invitation-parents">
          <motion.div initial={reduced?false:{opacity:0,x:-40}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:.85,ease}}>
            <span>NHÀ TRAI</span><p>{wedding.couple.groomParents.map(parent=><span className="parent-name" key={parent}>{parent}</span>)}</p>
          </motion.div>
          <motion.div initial={reduced?false:{opacity:0,x:40}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:.85,ease}}>
            <span>NHÀ GÁI</span><p>{wedding.couple.brideParents.map(parent=><span className="parent-name" key={parent}>{parent}</span>)}</p>
          </motion.div>
        </div>
        <div className="invitation-solemn-text">{invitation.formalText}</div>
        <div className="invitation-couple-names"><span>{wedding.couple.groomFullName}</span><em>&</em><span>{wedding.couple.brideFullName}</span></div>
        <div className="formal-ornament" aria-hidden="true">✧ ─── ♡ ─── ✧</div>
        <span className="invitation-invite-copy">{guestName ? `Trân trọng kính mời ${guestName} cùng gia đình đến dự ngày vui` : `Thân mời bạn cùng gia đình đến dự ngày vui của chúng mình`}</span>
        <div className="invitation-date-title">NGÀY MÌNH CHUNG ĐÔI</div>
        <Countdown date={invitation.date}/>
        <div className="calendar-ornament"><span className="calendar-month">{formatWeddingMonth(invitation.date)}</span><WeddingDayCircle date={invitation.date}/><span className="calendar-weekday">{`${formatWeddingWeekday(invitation.date)} · ${getWeddingDatePart(invitation.date, 'year')}`}</span></div>
        <div className="event-cards">{invitation.events.map((event,i)=><motion.article key={event.id} className="event-card" initial={reduced?false:{opacity:0,x:i===0?-110:110,rotate:i===0?-2:2}} whileInView={{opacity:1,x:0,rotate:0}} viewport={{once:true,amount:.15}} transition={{type:'spring',stiffness:95,damping:19,delay:0}}>
          <motion.span className="event-corner-seal" aria-hidden="true" initial={reduced?false:{opacity:0,scale:1.7}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{duration:.55,delay:.48}}>✦</motion.span>
          <div className="event-symbol">{i===0?'✦':'♡'}</div><span className="eyebrow">{i===0?'NGHI LỄ':'TIỆC MỪNG'}</span><h3>{event.label}</h3>
          <div className="event-detail"><CalendarDays size={18}/><span>{event.time}</span></div><div className="event-detail"><MapPin size={18}/><span><b>{event.venue}</b><small>{event.address}</small></span></div>
          {event.mapUrl?<a href={event.mapUrl} target="_blank" rel="noreferrer" className="button button-outline">Xem chỉ đường <ArrowUpRight size={16}/></a>:<span className="event-location-pending">Địa điểm sẽ được cập nhật</span>}
        </motion.article>)}</div>
        <p className="formal-invitation-thanks">Sự hiện diện của bạn là niềm vinh hạnh của gia đình chúng mình.</p>
        <a className="calendar-add" href={buildCalendarUrl(name,invitation.date)} target="_blank" rel="noreferrer"><CalendarDays size={17}/> Thêm ngày cưới vào lịch <ArrowUpRight size={15}/></a>
      </motion.article>
    </div>
  </section>;
}
function GallerySection({ onPhotoOpen, onVideoOpen, side }: { onPhotoOpen: (index: number) => void; onVideoOpen: () => void; side: InvitationSide }) {
  const reduced = useReducedMotion();
  const [stackIndex, setStackIndex] = useState(0);
  const swipeStart = useRef<number | null>(null);
  const swipeHandled = useRef(false);
  const length = wedding.gallery.length;
  const showNext = (direction: number) => setStackIndex(i => (i + direction + length) % length);
  // Các tờ giấy bên dưới CHỈ để trang trí; không thể lộ ảnh số 3 khi chuyển 1 → 2.
  // Mỗi lần Next / Previous chỉ có một ảnh chính xuất hiện trong DOM.
  useEffect(() => {
    if (length < 2) return;
    [1, -1].forEach(delta => {
      const image = new Image();
      image.src = wedding.gallery[(stackIndex + delta + length) % length].src;
    });
  }, [stackIndex, length]);
  return <section id="gallery" className="gallery-section section-pad"><div className="container"><FragmentsHeading/>
    {/* DESKTOP: scrapbook collage inspired by overlapping Polaroid prints.
        Ảnh: ưu tiên WebP 1200x1600 px (3:4); vài ảnh ngang 1600x1200 px (4:3).
        Mỗi ảnh đặt trong wedding.config.ts; không phải cắt ảnh cố định theo layout. */}
    <div className="gallery-exhibition" aria-label="Bộ sưu tập ảnh cưới">
      <div className="gallery-scrapbook-decor" aria-hidden="true">Thương nhau, mãi nhé ♡ <span>Những khoảnh khắc của mình</span></div>
      <div className="gallery-grid">{wedding.gallery.map((image,i)=><motion.button
        key={`${image.src}-${i}`} className={`gallery-tile tile-${i%6}`} type="button" onClick={() => onPhotoOpen(i)}
        initial={reduced ? { opacity: 0 } : { opacity: 0, x: [-55, 27, 50, -31, 31, -36][i%6], y: [60,90,70,55,85,65][i%6], scale: .92 }}
        whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        viewport={{ once:true, amount:.1 }}
        transition={reduced ? { duration:.2 } : { type:'spring',stiffness:105,damping:18,delay:Math.min(i*.1,.5) }}
        aria-label={`Xem ảnh ${i+1}: ${image.alt}`}>
        {/* ẢNH COLLAGE: bản gốc khoảng 1200x1600px, WebP chất lượng 80–90;
            CSS object-fit:cover sẽ cắt trong khung, ảnh thật có thể tùy chỉnh object-position. */}
        <ImageFrame src={image.src} alt={image.alt}/>
        <span className="gallery-print-caption" aria-hidden="true">{['Một điều thật đẹp','Mãi là chúng mình ♡','Những điều bé nhỏ','Luôn có nhau','Chương đẹp nhất','Chuyện mình còn tiếp…'][i%6]}</span>
        <span className="gallery-zoom">XEM ẢNH <ArrowUpRight size={14}/></span>
      </motion.button>)}</div>
      <span className="gallery-scrapbook-flower" aria-hidden="true">✿</span>
      <span className="gallery-scrapbook-note" aria-hidden="true">♡ {formatWeddingShortDate(wedding.invitations[side].date)}</span>
    </div>
    {/* MOBILE: một chồng ảnh Polaroid. Vuốt để chuyển ảnh trên cùng; chạm mở lightbox.
        Ảnh tham khảo: 900x1200px hoặc 1200x1600px, tỷ lệ 3:4. */}
    <motion.div className="gallery-mobile-stack" aria-label="Chồng ảnh kỷ niệm"
      initial={reduced?{opacity:0}:{opacity:0,y:46,scale:.95,rotate:-3}}
      whileInView={{opacity:1,y:0,scale:1,rotate:0}}
      viewport={{once:true,amount:.18}}
      transition={reduced?{duration:.12}:{type:'spring',stiffness:105,damping:21,delay:.1}}>
      {length>1 && <div className="gallery-stack-under gallery-stack-under-far" aria-hidden="true"/>}
      {length>1 && <div className="gallery-stack-under gallery-stack-under-near" aria-hidden="true"/>}
      <div className="gallery-stack-active" onTouchStart={e=>{swipeHandled.current=false;swipeStart.current=e.changedTouches[0].clientX;}} onTouchEnd={e=>{if(swipeStart.current===null)return;const dx=e.changedTouches[0].clientX-swipeStart.current;swipeStart.current=null;if(Math.abs(dx)>45){swipeHandled.current=true;showNext(dx<0?1:-1);}}}>
        <motion.button key={stackIndex} type="button" className="gallery-stack-front" onClick={()=>{if(swipeHandled.current){swipeHandled.current=false;return;}onPhotoOpen(stackIndex);}} aria-label={`Xem ảnh ${stackIndex+1}: ${wedding.gallery[stackIndex].alt}`}
          initial={reduced ? false : {opacity:.68,scale:.985}}
          animate={{opacity:1,scale:1}}
          transition={{duration:reduced ? 0 : .22,ease}}>
          <ImageFrame src={wedding.gallery[stackIndex].src} alt={wedding.gallery[stackIndex].alt}/>
          <span>BÊN NHAU TỪ ĐÂY</span>
        </motion.button>
        <span className="gallery-stack-flower" aria-hidden="true">✿</span>
      </div>
      <div className="gallery-stack-switcher"><button type="button" onClick={()=>showNext(-1)} aria-label="Ảnh trước"><ArrowLeft size={20}/></button><span>{String(stackIndex+1).padStart(2,'0')} / {String(length).padStart(2,'0')}</span><button type="button" onClick={()=>showNext(1)} aria-label="Ảnh tiếp theo"><ArrowRight size={20}/></button></div>
      <p className="gallery-stack-hint">Vuốt để xem ảnh · Chạm để phóng to</p>
    </motion.div>
    <div className="gallery-actions"><span className="gallery-caption">✦ GIỮ LẠI NHỮNG NGÀY THẬT ĐẸP ✦</span><button className="button button-primary gallery-view-all" onClick={() => onPhotoOpen(0)}>Xem toàn bộ album ảnh <ArrowUpRight size={16}/></button>{wedding.videoEmbedUrl && <button className="button button-outline" onClick={onVideoOpen}><Play size={16}/> Xem video cưới</button>}</div>
  </div></section>;
}
function Lightbox({ index, onClose, setIndex }: { index: number; onClose: () => void; setIndex: (index: number) => void }) {
  const reduced = useReducedMotion();
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
  return <motion.div className="lightbox-backdrop" role="dialog" aria-modal="true" aria-label="Xem album ảnh cưới" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><button className="lightbox-close" aria-label="Đóng album" onClick={onClose}><X size={24}/></button><div className="lightbox-body" onClick={e=>e.stopPropagation()} onTouchStart={e=>{startX.current=e.changedTouches[0].clientX;}} onTouchEnd={e=>{if(startX.current===null)return;const delta=e.changedTouches[0].clientX-startX.current;if(Math.abs(delta)>45){delta>0?previous():next();}startX.current=null;}}><motion.img key={photo.src} className="lightbox-image" src={photo.src} alt={photo.alt} initial={reduced?{opacity:0}:{opacity:0,scale:.97,y:12}} animate={{opacity:1,scale:1,y:0}} transition={reduced?{duration:0}:{duration:.2,ease}}/><div className="lightbox-bottom"><button aria-label="Ảnh trước" onClick={previous}><ArrowLeft size={23}/></button><span>{String(index+1).padStart(2,'0')} — {String(total).padStart(2,'0')}</span><button aria-label="Ảnh sau" onClick={next}><ArrowRight size={23}/></button></div></div></motion.div>;
}
function WishesSection({ guestName, side, showToast }: { guestName: string; side: InvitationSide; showToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void }) {
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
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const refresh = useCallback(async () => { const result = await loadWishes(); setWishes(result.wishes); setIsDemo(result.demo); }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const active = wishes[wishIndex];
  const go = (step: number) => { setWishIndex(i=>clampIndex(i+step,wishes.length)); setLetterOpen(false); };
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(name.trim().length<2 || message.trim().length<5) { setNotice('Vui lòng điền tên và lời chúc từ 5 ký tự.'); return; }
    setBusy(true); setNotice('');
    const result = await sendWish({guest_name:name.trim(),message:message.trim(),side,website,turnstile_token:challengeToken});
    setBusy(false);
    if (!result.ok) { setNotice(result.error || 'Có lỗi xảy ra. Vui lòng thử lại.'); return; }
    const toastMessage = result.demo
      ? 'Đã lưu lời chúc ở chế độ xem thử trên thiết bị này.'
      : result.pending
        ? 'Đã nhận lời chúc. Lời chúc sẽ xuất hiện sau khi được duyệt.'
        : 'Cảm ơn bạn! Lời chúc đã được gửi thành công.';
    setName(guestName);
    setMessage('');
    setNotice('');
    showToast(toastMessage, 'success', 'Lời chúc từ bạn');
    closeTimerRef.current = window.setTimeout(() => {
      setWriteOpen(false);
    }, 380);
    await refresh();
    setWishIndex(0);
  };
  return <section id="wishes" className="wishes-section section-pad"><div className="wishes-grain"/><Floral position="right"/><div className="container wishes-container"><SectionHeading kicker="TỪ NHỮNG NGƯỜI THƯƠNG" title="Những lời yêu thương" caption="Mỗi lời chúc là một kỷ niệm mà chúng mình sẽ luôn trân trọng."/>
    <Ribbon variant="heart" className="wishes-ribbon"/>
    <div className="wishes-display">
      <div className="wishes-side-note"><Heart size={17} strokeWidth={1.4}/> NHỮNG LÁ THƯ<br/>THƯƠNG MẾN</div>
      {active ? <div className="wish-carousel"><AnimatePresence mode="wait"><motion.button layout key={active.id} className={`wish-letter ${letterOpen?'wish-letter-open':''}`} type="button" onClick={()=>setLetterOpen(o=>!o)} initial={{opacity:0,y:70,rotate:-7,scale:.88}} animate={{opacity:1,y:0,rotate:letterOpen?0:-1,scale:1}} exit={{opacity:0,y:-12,rotate:2}} transition={{duration:.55,ease}} aria-label={letterOpen?'Thu nhỏ lời chúc':'Mở rộng lời chúc'}><span className="letter-ribbon-fold" aria-hidden="true"/><span className="letter-corner letter-top-left"/><span className="letter-corner letter-bottom-right"/><span className="wish-number">LÁ THƯ SỐ {String(wishIndex+1).padStart(3,'0')}</span><Heart className="wish-heart" size={20} strokeWidth={1.3}/><span className="wish-to">Gửi hai bạn thương mến,</span><span className="wish-message">“{active.message}”</span><span className="wish-divider">✽</span><span className="wish-sender">— {active.guest_name} —</span><span className="wish-small">GỬI BẰNG CẢ TẤM LÒNG</span><span className="letter-click-hint">{letterOpen?'Chạm để thu nhỏ':'Chạm để mở lá thư'}</span></motion.button></AnimatePresence><div className="wish-switcher"><button onClick={()=>go(-1)} aria-label="Lời chúc trước"><ArrowLeft size={19}/></button><span>{String(wishIndex+1).padStart(2,'0')} / {String(wishes.length).padStart(2,'0')}</span><button onClick={()=>go(1)} aria-label="Lời chúc tiếp theo"><ArrowRight size={19}/></button></div></div> : <div className="wishes-empty"><Mail size={35}/><h3>Lá thư đầu tiên</h3><p>Hãy là người đầu tiên gửi lời chúc đến cô dâu chú rể.</p></div>}
      <div className="wishes-side-note wishes-side-right">ĐỂ LỜI THƯƠNG<br/>THÀNH KỶ NIỆM <Sparkles size={18}/></div>
    </div>
    {isDemo && <p className="demo-caption">Các lời chúc đang hiển thị là dữ liệu minh họa. Khi kết nối Cloudflare D1, lời chúc thật sẽ xuất hiện tại đây.</p>}
    <div className="last-letter"><p className="script-signature">Lá thư tiếp theo, biết đâu là của bạn…</p><button className="button button-primary" onClick={()=>{setNotice('');setWriteOpen(o=>!o);}}>{writeOpen?'Đóng lá thư':'Viết một lời yêu thương'} {writeOpen?<X size={16}/>:<ArrowRight size={16}/>}</button></div>
<AnimatePresence>{writeOpen && <Modal onClose={()=>{setNotice('');setWriteOpen(false);}} label="Viết một lời yêu thương"><form className="wish-compose wish-compose-modal" onSubmit={submit}><div className="compose-inner"><div className="eyebrow">LÁ THƯ TỪ TRÁI TIM</div><h3>Viết một điều thật đẹp...</h3><label htmlFor="wish-name">Tên của bạn</label><input id="wish-name" maxLength={70} value={name} onChange={e=>setName(e.target.value)} placeholder="Tên người gửi" required/><label htmlFor="wish-message">Lời chúc</label><textarea id="wish-message" maxLength={500} rows={4} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Gửi hai bạn một chút yêu thương..." required/><div className="form-character-count">{message.length}/500</div><div className="honeypot" aria-hidden="true"><label htmlFor="wish-website">Website (để trống)</label><input id="wish-website" value={website} onChange={e=>setWebsite(e.target.value)} tabIndex={-1} autoComplete="off"/></div><TurnstileWidget onToken={setChallengeToken}/><button className="button button-primary" disabled={busy} type="submit">{busy?'Đang gửi...':'Niêm phong & gửi thư'} <Send size={16}/></button></div>{notice && <p role="status" className="form-notice">{notice}</p>}</form></Modal>}</AnimatePresence>
  </div></section>;
}
function RSVPForm({ guestName, side, onConfirmed, onClose, showToast }: { guestName: string; side: InvitationSide; onConfirmed: () => void; onClose: () => void; showToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void }) {
  const [name,setName]=useState(guestName);
  const [attending,setAttending]=useState(true);
  const [note,setNote]=useState('');
  const [website,setWebsite]=useState('');
  const [challengeToken,setChallengeToken]=useState('');
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState('');
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(name.trim().length<2){setFeedback('Vui lòng nhập tên tối thiểu 2 ký tự.');return;}
    setBusy(true);setFeedback('');
    // Giao diện chỉ thu thập tên + lời nhắn/lời chúc. Vẫn giữ API/D1 hiện có:
    // một người nếu đến, 0 nếu vắng, event_id chung để quản trị biết đây là RSVP toàn lễ cưới.
    const response=await sendRSVP({guest_name:name.trim(),attending,guest_count:attending?1:0,event_id:'wedding',side,note:note.trim(),website,turnstile_token:challengeToken});
    setBusy(false);
    if (!response.ok) {
      setFeedback(response.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
      return;
    }
    const toastMsg = response.demo
      ? 'Đã lưu xác nhận ở chế độ xem thử trên thiết bị này.'
      : attending
        ? 'Cảm ơn bạn! Chúng mình đã nhận được lời xác nhận tham dự.'
        : 'Cảm ơn bạn! Chúng mình đã nhận được lời hồi âm.';
    setNote('');
    onConfirmed();
    showToast(toastMsg, 'success', attending ? 'Xác nhận tham dự' : 'Hồi âm tham dự');
    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, 380);
  };
  return <div className="rsvp-modal-body"><p className="rsvp-modal-caption">Một lời hồi âm nhỏ từ bạn sẽ khiến ngày vui thêm trọn vẹn ♡</p>
    <motion.form className="rsvp-form" onSubmit={submit} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.42,ease}}>
      <div className="rsvp-form-top"><span className="eyebrow">MONG NHẬN ĐƯỢC HỒI ÂM</span><h3>Xác nhận tham dự</h3></div>
      <div className="attendance-options" role="tablist" aria-label="Xác nhận tham dự">
        <button id="rsvp-attend" role="tab" type="button" aria-selected={attending} aria-controls="rsvp-fields" className={attending?'selected':''} onClick={()=>{setAttending(true);setFeedback('');}}><Heart size={15}/> Mình sẽ đến</button>
        <button id="rsvp-decline" role="tab" type="button" aria-selected={!attending} aria-controls="rsvp-fields" className={!attending?'selected':''} onClick={()=>{setAttending(false);setFeedback('');}}>Rất tiếc, không thể</button>
      </div>
      <motion.div id="rsvp-fields" role="tabpanel" aria-labelledby={attending?'rsvp-attend':'rsvp-decline'} key={attending?'attend':'decline'} initial={{opacity:0,y:9}} animate={{opacity:1,y:0}} transition={{duration:.29,ease}} className="rsvp-fields">
        <label htmlFor="rsvp-name">Tên của bạn <span>*</span></label>
        <input id="rsvp-name" value={name} onChange={e=>setName(e.target.value)} maxLength={70} placeholder="Tên của bạn" required/>
        <label htmlFor="rsvp-note">{attending?'Lời nhắn':'Lời chúc'} <span className="form-optional">(không bắt buộc)</span></label>
        <textarea id="rsvp-note" rows={3} maxLength={500} value={note} onChange={e=>setNote(e.target.value)} placeholder={attending?'Nhắn đôi lời tới chúng mình...':'Gửi lời chúc từ xa tới hai bạn...'}/>
      </motion.div>
      <div className="honeypot" aria-hidden="true"><label htmlFor="rsvp-website">Website (để trống)</label><input id="rsvp-website" value={website} onChange={e=>setWebsite(e.target.value)} tabIndex={-1} autoComplete="off"/></div>
      <TurnstileWidget onToken={setChallengeToken}/>
      <button className="button button-primary rsvp-submit" type="submit" disabled={busy}>{busy?'Đang gửi...':attending?'Gửi lời xác nhận':'Gửi lời hồi âm'} <ArrowRight size={17}/></button>
      {feedback && <p className="form-notice" role="status">{feedback}</p>}
    </motion.form>
  </div>;
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
  return <section id="gift" className="gift-section section-pad"><div className="container gift-layout"><SectionHeading kicker="THAY LỜI CẢM ƠN" title="Hộp quà yêu thương" caption="Sự hiện diện và những lời chúc của bạn đã là món quà quý giá nhất đối với chúng mình."/><div className="gift-object-wrap"><motion.button initial={false} whileInView={reduced?undefined:{rotate:[0,-5,4,-3,2,0],y:[0,-6,-3,0]}} viewport={{once:true,amount:.6}} whileHover={reduced?undefined:{rotate:-2,y:-9}} transition={{duration:1.1,ease}} className={`gift-object ${unwrapping?'gift-object-unwrapping':''}`} aria-label="Mở hộp quà mừng cưới" onClick={openGift} disabled={unwrapping}><div className="gift-lid"/><div className="gift-box-face"><span className="gift-box-symbol">{wedding.couple.initials}</span><span className="gift-box-caption">GỬI YÊU THƯƠNG</span></div><div className="gift-ribbon-vertical"/><div className="gift-ribbon-horizontal"/><div className="gift-bow"><span/><span/></div><span className="gift-floating-star gift-star-a">✧</span><span className="gift-floating-star gift-star-b">✧</span></motion.button></div><button className="button button-outline gift-open-btn" onClick={openGift} disabled={unwrapping}>Mở hộp quà <Gift size={16}/></button><p className="gift-bottom-note">Tấm lòng của bạn là món quà quý giá nhất.</p></div>
    <AnimatePresence>{open && <Modal delay={reduced?0:.12} onClose={()=>{setOpen(false);setUnwrapping(false);}} label="Thông tin mừng cưới"><div className="gift-modal-content"><span className="eyebrow">MỘT CHÚT TẤM LÒNG</span><h3>Một chút yêu thương</h3><p>Những lời chúc và sự hiện diện của bạn là niềm hạnh phúc của chúng mình. Nếu muốn gửi món quà nhỏ, bạn có thể sử dụng thông tin bên dưới.</p>{wedding.bankAccounts.length ? <div className="gift-bank-list">{wedding.bankAccounts.map(account=><div className="bank-card" key={account.accountNumber}><span className="eyebrow">{account.role} · {account.bank}</span><h4>{account.owner}</h4>{account.qrImage && <ImageFrame src={account.qrImage} alt={`Mã QR chuyển khoản của ${account.owner}`} className="bank-qr"/>}<p className="bank-account-number">{account.accountNumber}</p><button className="button button-outline" onClick={()=>copy(account.accountNumber)}>{copied===account.accountNumber?<Check size={15}/>:<Copy size={15}/>} {copied===account.accountNumber?'Đã sao chép':'Sao chép số tài khoản'}</button></div>)}</div> : <div className="gift-empty"><Mail size={28}/><p>Thông tin mừng cưới sẽ được cập nhật.<br/>Bạn có thể thay tài khoản & QR thật tại <code>src/wedding.config.ts</code>.</p></div>}{copied.startsWith('Không thể') && <p role="status">{copied}</p>}</div></Modal>}</AnimatePresence>
  </section>;
}
function Modal({ onClose, label, children, delay=0, variant }: { onClose: () => void; label: string; children: ReactNode; delay?:number; variant?: "rsvp" }) {
  const dialogRef=useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const closeRef=useRef(onClose);
  useEffect(()=>{closeRef.current=onClose;},[onClose]);
  useEffect(()=>{
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const oldOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    dialogRef.current?.querySelector<HTMLElement>('input:not([type="hidden"]),button,textarea,select')?.focus();
    const key=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();closeRef.current();}
      if(e.key!=='Tab')return;
      const focusable=Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href]')||[]).filter(el=>el.getClientRects().length>0);
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    };
    window.addEventListener('keydown',key);
    return()=>{window.removeEventListener('keydown',key);document.body.style.overflow=oldOverflow;previous?.focus();};
  },[]);
  return createPortal(<motion.div className="modal-backdrop" role="presentation" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,transition:{duration:reduced?.12:.22}}} transition={{duration:reduced?.12:.25}} onClick={onClose}>
    <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-label={label} className={`modal-card modal-card-delicate${variant === "rsvp" ? " modal-card-rsvp" : ""}`} onClick={e=>e.stopPropagation()}
      initial={reduced?{opacity:0}:{opacity:0,y:26,scale:.965,rotateX:3}}
      animate={{opacity:1,y:0,scale:1,rotateX:0}}
      exit={reduced?{opacity:0}:{opacity:0,y:15,scale:.985,rotateX:2}}
      transition={reduced?{duration:.14}:{type:'spring',stiffness:230,damping:26,mass:1,delay:Math.min(delay,.14)}}>
      <button className="modal-close" onClick={onClose} aria-label="Đóng"><X size={22}/></button>{children}
    </motion.div>
  </motion.div>,document.body);
}
function Footer({ onReplay, side }: { onReplay: () => void; side: InvitationSide }) {
  const [shared,setShared]=useState(false);
  const share=async()=>{try {if(navigator.share)await navigator.share({title:'Thiệp cưới',text:'Trân trọng kính mời bạn đến chung vui!',url:window.location.href});else {await navigator.clipboard.writeText(window.location.href);setShared(true);setTimeout(()=>setShared(false),2500);}}catch{/* user cancelled share */}};
  return <footer className="footer-section"><Floral position="left"/><div className="container footer-content"><div className="eyebrow">KHỞI ĐẦU CỦA MỘT ĐỜI BÊN NHAU</div><div className="footer-names">{wedding.couple.groom} <em>&</em> {wedding.couple.bride}</div><span className="footer-date">{wedding.invitations[side].dateText}</span><span className="footer-rule"/><p>{wedding.thanks}</p><button className="footer-share" onClick={share}>{shared?<Check size={16}/>:<Mail size={16}/>} {shared?'Đã sao chép liên kết':'Chia sẻ thiệp cưới'}</button><button className="footer-replay" onClick={onReplay}><RotateCcw size={15}/> Xem lại hiệu ứng mở thiệp</button><a className="footer-replay" href="/admin" style={{ opacity: 0.65, fontSize: '0.8rem', marginTop: '4px', display:'inline-flex', alignItems:'center', gap:'6px' }}><Lock size={13}/> Quản trị thiệp</a><span className="footer-made">ĐƯỢC DỆT NÊN TỪ YÊU THƯƠNG</span></div><button className="back-to-top" onClick={()=>scrollTo('home')} aria-label="Quay lại đầu trang"><ArrowUp size={19}/></button></footer>;
}
export default function App() {
  const [side, setSide] = useState<InvitationSide | null>(getInitialInvitationSide);
  const activeSide = side || 'groom';
  const [guestName] = useState(getGuestName);
  const [opened,setOpened]=useState(()=>!wedding.sections.opening);
  const [heroRevealed,setHeroRevealed]=useState(()=>!wedding.sections.opening);
  const [openingExitDone,setOpeningExitDone]=useState(()=>!wedding.sections.opening);
  // Tăng mỗi lần xem lại để tất cả Motion components được mount mới, reset once:true/useInView.
  const [animationCycle, setAnimationCycle] = useState(0);
  const [playing,setPlaying]=useState(false);
  const [lightbox,setLightbox]=useState<number|null>(null);
  const [videoOpen,setVideoOpen]=useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [rsvpVisible, setRsvpVisible] = useState(false);
  const [rsvpConfirmed, setRsvpConfirmed] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ id: Date.now(), message, type, title });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4800);
  }, []);

  const hideToast = useCallback(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);
  // Nút nhỏ chỉ xuất hiện khi khách đã đọc qua phần thiệp; không tự mở popup.
  useEffect(() => {
    const check = () => {
      const invitation = document.getElementById('details');
      if (!invitation) { setRsvpVisible(false); return; }
      const bounds = invitation.getBoundingClientRect();
      setRsvpVisible(bounds.bottom < window.innerHeight * .35);
    };
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
    return () => { window.removeEventListener('scroll', check);window.removeEventListener('resize',check); };
  }, [animationCycle]);
  // Auto-preview nhẹ khi khách mở thiệp và không thao tác; click/scroll/touch để dừng hẳn.
  // Không chạy trong các popup, lightbox hoặc khi người dùng bật Reduced Motion.
  useGentleAutoScroll({
    enabled: opened && wedding.effects.autoStoryScroll,
    idleDelayMs: wedding.effects.autoScrollIdleMs,
    intervalMs: wedding.effects.autoScrollIntervalMs,
    stepViewport: wedding.effects.autoScrollStepViewport,
  });
  const audioRef=useRef<HTMLAudioElement>(null);
  useEffect(() => {
    // Không thả body scroll cho đến khi lớp Opening tan hẳn; tránh nháy do
    // scrollbar xuất hiện giữa transition trên iOS/Chrome.
    if (!opened || !openingExitDone) {
      window.scrollTo({top:0,left:0,behavior:'instant'});
      document.body.style.overflow='hidden';
      return () => {document.body.style.overflow='';};
    }
    document.body.style.overflow='';
  },[opened,openingExitDone]);
  const chooseSide = (chosen: InvitationSide) => {
    setSide(chosen);
    setInvitationUrlSide(chosen);
  };
  const switchSide = (chosen: InvitationSide) => {
    if (chosen === side) return;
    if (rsvpOpen && !window.confirm('Đổi thiệp sẽ đóng form xác nhận đang nhập. Bạn muốn tiếp tục?')) return;
    // Mỗi bên có ngày, sự kiện và dữ liệu RSVP riêng; không đổi ảnh hay bố cục.
    chooseSide(chosen);
    setRsvpOpen(false);
    setRsvpConfirmed(false);
    setAnimationCycle(c => c + 1);
  };
  const enter=()=>{setHeroRevealed(true);setOpened(true);};
  const replayStory = () => {
    // Trở về đầu ngay trước khi render lại, tránh useInView kích hoạt ở scroll cũ.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setHeroRevealed(false);
    setOpeningExitDone(false);
    setOpened(false);
    setRsvpOpen(false);
    setRsvpVisible(false);
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
    <AnimatePresence onExitComplete={()=>setOpeningExitDone(true)}>{!opened && <Opening side={side} onSelect={chooseSide} onBegin={()=>{void beginMusic();}} onReveal={()=>setHeroRevealed(true)} onEnter={enter} guestName={guestName}/>}</AnimatePresence>
    {wedding.musicUrl && <audio ref={audioRef} src={wedding.musicUrl} loop preload="none" onEnded={()=>setPlaying(false)} />}
    <Header opened={opened} side={side} onSwitchSide={switchSide} onRSVP={()=>setRsvpOpen(true)}/>
    <HeartRain visible={opened && openingExitDone && wedding.effects.heartRain} />
    {wedding.isDemo && opened && <div className="demo-ribbon">BẢN XEM TRƯỚC — HÃY THAY DỮ LIỆU TẠI <code>wedding.config.ts</code></div>}
    <main key={animationCycle}>
      <Hero guestName={guestName} active={heroRevealed} side={activeSide}/>
      {(wedding.sections.couple || wedding.sections.events || wedding.sections.countdown) && <WeddingInvitation guestName={guestName} side={activeSide}/>}
      {wedding.sections.story && <><JourneyTransition number="01" title="Chuyện chúng mình" motif="heart"/><StorySection/></>}
      {wedding.sections.gallery && <><JourneyTransition number="02" title="Những khung hình yêu" motif="loop"/><GallerySection side={activeSide} onPhotoOpen={setLightbox} onVideoOpen={()=>setVideoOpen(true)}/></>}
      {wedding.sections.wishes && <><JourneyTransition number="03" title="Những lá thư yêu thương" motif="letter"/><WishesSection guestName={guestName} side={activeSide} showToast={showToast}/></>}
      {wedding.sections.gift && <><JourneyTransition number="04" title="Một chút yêu thương" motif="bow"/><GiftSection/></>}
    </main>
    <Footer onReplay={replayStory} side={activeSide}/>
    {opened && openingExitDone && <MusicControl playing={playing} setPlaying={setPlaying} audioRef={audioRef}/>}
    <AnimatePresence>
      {opened && wedding.sections.rsvp && rsvpVisible && !rsvpOpen &&
        <motion.div className="floating-rsvp-dock"
          initial={{opacity:0,x:22,scale:.9}} animate={{opacity:1,x:0,scale:1}} exit={{opacity:0,x:20,scale:.92}}
          transition={{duration:.55,ease}}>
          <button type="button"
            className={`floating-rsvp ${rsvpConfirmed?'floating-rsvp-confirmed':wedding.effects.rsvpAttention?'floating-rsvp-attention':''}`}
            onClick={()=>setRsvpOpen(true)} aria-label="Mở xác nhận tham dự">
            <Mail size={17}/><span>{rsvpConfirmed?'Đã xác nhận':'Xác nhận tham dự'}</span><ArrowUpRight size={14}/>
          </button>
        </motion.div>}
    </AnimatePresence>
    <AnimatePresence>
      {rsvpOpen && <Modal onClose={()=>setRsvpOpen(false)} label="Xác nhận tham dự" variant="rsvp"><RSVPForm guestName={guestName} side={activeSide} onConfirmed={()=>setRsvpConfirmed(true)} onClose={()=>setRsvpOpen(false)} showToast={showToast}/></Modal>}
    </AnimatePresence>
    <AnimatePresence>{lightbox!==null && <Lightbox index={lightbox} setIndex={setLightbox} onClose={()=>setLightbox(null)}/>}</AnimatePresence>
    <AnimatePresence>{videoOpen && Boolean(wedding.videoEmbedUrl) && <Modal onClose={()=>setVideoOpen(false)} label="Video cưới"><div className="video-shell"><iframe src={`${wedding.videoEmbedUrl}${String(wedding.videoEmbedUrl).includes('?')?'&':'?'}autoplay=1`} title="Video cưới" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /></div></Modal>}</AnimatePresence>
    <Toast toast={toast} onClose={hideToast} />
    <div className="sr-only">Các mục: {SECTION_IDS.join(', ')}</div>
  </>;
}

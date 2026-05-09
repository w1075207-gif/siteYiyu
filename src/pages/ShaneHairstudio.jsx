import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MESSAGES,
  SHANE_HTML_LANG,
  SHANE_LOCALES,
  detectInitialLocale,
  writeSavedLocale,
} from './shaneHairstudio.i18n.js';

/**
 * Client mockups are visual specifications only. This page is built with real
 * markup/CSS to match that layout; photos are served from /public/shane/site/.
 */

/** Design tokens – match reference (dark + orange) */
const ORANGE = '#ff7f00';
const ORANGE_DIM = '#e86812';
const BLACK = '#0a0a0a';
const BLACK_CARD = '#121212';
const TEXT = '#ffffff';
const TEXT_MUTED = 'rgba(255,255,255,0.72)';
const BORDER = 'rgba(255,255,255,0.08)';

const MAPS_URL =
  'https://www.google.com/maps/place/Shane%E2%80%99s+HairStudio%E3%80%8CAsian%E3%80%8D/@38.7267389,-9.1368754,17z';
const MAPS_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.214!2d-9.136875400000001!3d38.726738899999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd19333796b3ec81%3A0x9e55a011962cd8f8!2sShane\'s%20HairStudio%E3%80%8CAsian%E3%80%8D!5e0!3m2!1sen!2spt!4v1715000000000!5m2!1sen!2spt';

const WHATSAPP_URL = 'https://wa.me/351912345678';
const WHATSAPP_DISPLAY = '+351 912 345 678';
const INSTAGRAM_URL = 'https://www.instagram.com/shanehairstudio/';
const INSTAGRAM_HANDLE = 'shanehairstudio';

/** Local assets under public/shane/site (synced to shanehairstudioSite repo) */
const IMG = (name) => `/shane/site/${name}`;

const HERO_BG = IMG('hero-vw-panorama.png');

const GALLERY_IMGS = [
  IMG('gallery-01.png'),
  IMG('gallery-02.png'),
  IMG('gallery-03.png'),
  IMG('gallery-04.png'),
  IMG('gallery-05.png'),
  IMG('gallery-06.png'),
];

const ABOUT_IMG = IMG('about-salon.png');
const TEAM_IMG = IMG('team-work.png');
const ENV_IMG1 = IMG('env-01.png');
const ENV_IMG2 = IMG('env-02.png');
const ENV_IMG3 = IMG('env-03.png');

const CSS = `
  .shane-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .shane-root { scroll-behavior: smooth; background: ${BLACK}; color: ${TEXT};
    font-family: 'Noto Sans TC', 'Noto Sans SC', system-ui, sans-serif;
    min-height: 100vh;
  }

  /* Honeycomb background */
  .shane-honey {
    background-color: ${BLACK};
    background-image:
      radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0);
    background-size: 48px 84px;
    position: relative;
  }
  .shane-honey::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
    opacity: 0.35;
    background:
      repeating-linear-gradient(30deg, transparent, transparent 36px, rgba(255,122,26,0.03) 36px, rgba(255,122,26,0.03) 37px),
      repeating-linear-gradient(-30deg, transparent, transparent 36px, rgba(255,122,26,0.03) 36px, rgba(255,122,26,0.03) 37px);
  }
  .shane-z1 { position: relative; z-index: 1; }

  /* Nav */
  .shane-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 clamp(16px, 4vw, 48px);
    height: 72px;
    background: rgba(10,10,10,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid ${BORDER};
  }
  .shane-brand { text-decoration: none; color: ${ORANGE}; font-weight: 700; font-size: 1.05rem; letter-spacing: 0.06em; line-height: 1.25; }
  .shane-brand small { display: block; font-size: 0.68rem; font-weight: 500; color: ${TEXT_MUTED}; letter-spacing: 0.2em; text-transform: uppercase; }
  .shane-nav-links { display: flex; gap: clamp(12px, 2vw, 28px); list-style: none; align-items: center; }
  .shane-nav-links a {
    color: ${TEXT_MUTED}; text-decoration: none; font-size: 0.82rem;
    white-space: nowrap; transition: color 0.2s;
  }
  .shane-nav-links a:hover { color: ${ORANGE}; }
  .shane-nav-cta {
    background: ${ORANGE}; color: #fff; padding: 10px 22px; border-radius: 4px;
    font-size: 0.85rem; font-weight: 700; text-decoration: none; transition: filter 0.2s;
  }
  .shane-nav-cta:hover { filter: brightness(1.08); }
  .shane-burger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; background: none; border: none; }
  .shane-burger span { width: 22px; height: 2px; background: #fff; border-radius: 1px; }
  .shane-nav-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .shane-lang { display: flex; align-items: center; gap: 4px; }
  .shane-lang-btn {
    padding: 6px 8px;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    border: 1px solid ${BORDER};
    background: rgba(0,0,0,0.35);
    color: ${TEXT_MUTED};
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    line-height: 1.2;
  }
  .shane-lang-btn:hover { color: ${ORANGE}; border-color: rgba(255,127,0,0.45); }
  .shane-lang-btn[aria-pressed="true"] {
    color: #fff;
    border-color: ${ORANGE};
    background: rgba(255,127,0,0.2);
  }

  /* Hero: left 1/3 copy + right 2/3 photo (gradient blends at the seam) */
  .shane-hero {
    padding-top: 72px;
    min-height: calc(100dvh - 72px);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    align-items: stretch;
    width: 100%;
  }
  .shane-hero-inner {
    position: relative;
    z-index: 2;
    padding: clamp(28px, 5vw, 64px) clamp(18px, 2.8vw, 36px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: #060608;
    background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.055) 1px, transparent 0);
    background-size: 22px 38px;
    border-right: 1px solid ${BORDER};
  }
  .shane-hero-photo {
    position: relative;
    min-height: 280px;
    background-image: url(${HERO_BG});
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 52% center;
  }
  .shane-hero-photoGrad {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      90deg,
      rgba(6, 6, 10, 0.94) 0%,
      rgba(6, 6, 10, 0.55) 18%,
      rgba(6, 6, 10, 0.15) 42%,
      rgba(0, 0, 0, 0) 68%
    );
  }
  .shane-hero-inner .shane-btn-outline {
    border-color: rgba(255, 255, 255, 0.82);
    color: #fff;
  }
  .shane-hero-inner .shane-btn-outline:hover {
    border-color: ${ORANGE};
    color: ${ORANGE};
  }
  .shane-hero-title {
    font-size: clamp(1.65rem, 3.2vw, 2.6rem); font-weight: 700; color: ${ORANGE};
    line-height: 1.2; margin-bottom: 12px; letter-spacing: 0.04em;
  }
  .shane-hero-sub { font-size: clamp(0.95rem, 1.8vw, 1.15rem); color: ${TEXT}; margin-bottom: 14px; font-weight: 600; }
  .shane-hero-lead {
    color: rgba(255,255,255,0.92); font-size: clamp(0.82rem, 1.4vw, 0.95rem); font-weight: 600;
    letter-spacing: 0.04em; margin-bottom: 12px;
  }
  .shane-hero-desc { color: ${TEXT_MUTED}; font-size: clamp(0.82rem, 1.35vw, 0.92rem); line-height: 1.7; margin-bottom: 22px; }
  .shane-hero-btns { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: clamp(22px, 4vh, 40px); }
  .shane-btn-solid {
    background: ${ORANGE}; color: #fff; padding: 14px 28px; border-radius: 4px;
    font-weight: 700; text-decoration: none; font-size: 0.95rem; border: 2px solid ${ORANGE};
  }
  .shane-btn-outline {
    border: 2px solid ${ORANGE}; color: ${ORANGE}; background: transparent;
    padding: 12px 26px; border-radius: 4px; font-weight: 700; text-decoration: none; font-size: 0.95rem;
  }
  .shane-hero-features {
    display: flex; flex-wrap: wrap; gap: clamp(12px, 2.5vw, 24px);
  }
  .shane-hero-feat { display: flex; align-items: center; gap: 10px; color: ${TEXT}; font-size: 0.82rem; }
  .shane-hero-feat-icon {
    width: 38px; height: 38px; border-radius: 50%; border: 1px solid ${ORANGE};
    display: flex; align-items: center; justify-content: center; color: ${ORANGE}; font-size: 1rem;
  }
  .shane-hero-pin {
    position: absolute; right: clamp(12px, 2.5vw, 28px); bottom: clamp(16px, 3vh, 32px); z-index: 3;
    background: rgba(0,0,0,0.78); border: 1px solid ${BORDER}; padding: 10px 14px; border-radius: 6px;
    font-size: 0.78rem; color: ${TEXT}; display: flex; align-items: center; gap: 8px;
  }

  /* Section */
  .shane-sec { padding: clamp(56px, 10vw, 96px) clamp(20px, 4vw, 48px); }
  .shane-sec-head { text-align: center; margin-bottom: clamp(36px, 6vw, 56px); }
  .shane-sec-head h2 { font-size: clamp(1.35rem, 3vw, 2rem); font-weight: 700; color: ${TEXT}; }
  .shane-sec-head .en { color: ${ORANGE}; font-size: 0.75rem; letter-spacing: 0.35em; text-transform: uppercase; margin-top: 10px; }
  .shane-inner { max-width: 1120px; margin: 0 auto; }

  /* Services – hex */
  .shane-svc-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(16px, 3vw, 28px);
  }
  .shane-svc-card {
    background: ${BLACK_CARD}; border: 1px solid ${BORDER}; border-radius: 12px;
    padding: clamp(20px, 3vw, 28px) 16px; text-align: center; transition: border-color 0.2s, transform 0.2s;
  }
  .shane-svc-card:hover { border-color: rgba(255,122,26,0.45); transform: translateY(-3px); }
  .shane-hex {
    width: 88px; height: 88px; margin: 0 auto 18px;
    display: flex; align-items: center; justify-content: center;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    background: linear-gradient(145deg, ${ORANGE_DIM}, ${ORANGE});
    font-size: 2rem;
  }
  .shane-svc-card h3 { font-size: 1.05rem; margin-bottom: 10px; color: ${TEXT}; }
  .shane-svc-card p { font-size: 0.82rem; color: ${TEXT_MUTED}; line-height: 1.6; margin-bottom: 14px; min-height: 3.2em; }
  .shane-svc-more { color: ${ORANGE}; font-size: 0.82rem; font-weight: 600; text-decoration: none; }
  .shane-svc-more:hover { text-decoration: underline; }

  /* About */
  .shane-about-grid {
    display: grid; grid-template-columns: 1fr 1.1fr; gap: clamp(28px, 5vw, 48px); align-items: center;
  }
  .shane-about-img { border-radius: 12px; overflow: hidden; border: 1px solid ${BORDER}; }
  .shane-about-img img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 320px; }
  .shane-about-text h2 { font-size: clamp(1.35rem, 2.8vw, 1.85rem); margin-bottom: 16px; color: ${TEXT}; }
  .shane-about-text p { color: ${TEXT_MUTED}; line-height: 1.85; font-size: 0.92rem; margin-bottom: 28px; }
  .shane-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .shane-stat {
    background: ${BLACK_CARD}; border: 1px solid ${BORDER}; border-radius: 10px;
    padding: 14px 16px; font-size: 0.8rem; color: ${TEXT_MUTED}; text-align: center;
  }
  .shane-stat strong { display: block; color: ${ORANGE}; font-size: 1.05rem; margin-bottom: 4px; }

  /* Gallery – compact row of 6 thumbnails (reference layout) */
  #gallery.shane-sec {
    background: #000000;
  }
  .shane-gal-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: clamp(8px, 1.2vw, 14px);
    max-width: min(920px, 100%);
    margin: 0 auto;
  }
  .shane-gal-grid img {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid ${BORDER};
    display: block;
  }
  .shane-gal-more { text-align: center; margin-top: 32px; }
  .shane-gal-more a {
    display: inline-block;
    border: 2px solid ${ORANGE};
    color: #fff;
    background: transparent;
    padding: 11px 28px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 0.88rem;
    text-decoration: none;
  }
  .shane-gal-more a:hover {
    background: rgba(255, 127, 0, 0.15);
    color: #fff;
  }

  /* Environment */
  .shane-env-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 4vw, 40px); }
  .shane-env-block h3 { font-size: 1.1rem; margin-bottom: 12px; color: ${TEXT}; }
  .shane-env-block p { font-size: 0.88rem; color: ${TEXT_MUTED}; line-height: 1.75; margin-bottom: 16px; }
  .shane-env-block img { width: 100%; border-radius: 10px; border: 1px solid ${BORDER}; }
  .shane-env-imgs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
  .shane-env-imgs img {
    aspect-ratio: 3 / 4;
    object-fit: cover;
    height: auto;
    display: block;
  }

  /* Contact */
  .shane-contact-grid {
    display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: clamp(20px, 3vw, 32px); align-items: start;
  }
  .shane-contact-col h4 { font-size: 0.72rem; color: ${ORANGE}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px; }
  .shane-contact-col p, .shane-contact-col a { font-size: 0.9rem; color: ${TEXT_MUTED}; line-height: 1.7; text-decoration: none; }
  .shane-contact-col a:hover { color: ${ORANGE}; }
  .shane-map { border-radius: 12px; overflow: hidden; border: 1px solid ${BORDER}; min-height: 280px; }
  .shane-map iframe { width: 100%; height: 320px; border: 0; display: block; filter: grayscale(0.2) contrast(1.05); }
  .shane-social { display: flex; gap: 12px; margin-top: 12px; }
  .shane-social a {
    width: 40px; height: 40px; border-radius: 50%; border: 1px solid ${BORDER};
    display: flex; align-items: center; justify-content: center; color: ${TEXT}; font-size: 1.1rem;
  }
  .shane-social a:hover { border-color: ${ORANGE}; color: ${ORANGE}; }

  /* Footer */
  .shane-foot {
    border-top: 1px solid ${BORDER}; padding: 40px clamp(20px, 4vw, 48px) 48px;
    background: #050505;
  }
  .shane-foot-grid {
    max-width: 1120px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 28px; align-items: start;
  }
  .shane-foot-brand { color: ${ORANGE}; font-weight: 700; font-size: 1rem; }
  .shane-foot-mid { font-size: 0.82rem; color: ${TEXT_MUTED}; line-height: 1.9; }
  .shane-foot-copy { text-align: center; margin-top: 32px; font-size: 0.75rem; color: ${TEXT_MUTED}; }

  /* Price list strip */
  .shane-price-strip {
    max-width: 1120px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 48px) 48px;
  }
  .shane-price-strip a { color: ${ORANGE}; font-weight: 600; font-size: 0.9rem; }

  @media (max-width: 1024px) {
    .shane-svc-grid { grid-template-columns: repeat(2, 1fr); }
    .shane-contact-grid { grid-template-columns: 1fr; }
    .shane-map iframe { height: 260px; }
    .shane-foot-grid { grid-template-columns: 1fr; text-align: center; }
    .shane-foot-grid .shane-social { justify-content: center; }
    .shane-gal-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      max-width: min(520px, 100%);
    }
  }
  @media (max-width: 900px) {
    .shane-nav-links { display: none; position: fixed; top: 72px; left: 0; right: 0;
      flex-direction: column; background: rgba(10,10,10,0.98); padding: 16px 0; border-bottom: 1px solid ${BORDER}; gap: 0; }
    .shane-nav-links.open { display: flex; }
    .shane-nav-links li { width: 100%; }
    .shane-nav-links a { display: block; padding: 14px 24px; font-size: 1rem; }
    .shane-nav-cta { display: none; }
    .shane-burger { display: flex; }
    .shane-about-grid { grid-template-columns: 1fr; }
    .shane-env-grid { grid-template-columns: 1fr; }
    .shane-gal-grid {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      gap: 10px;
      max-width: 100%;
      overflow-x: auto;
      padding: 4px 4px 12px;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x proximity;
      justify-content: flex-start;
    }
    .shane-gal-grid img {
      width: 108px;
      min-width: 108px;
      height: 135px;
      aspect-ratio: auto;
      scroll-snap-align: start;
    }
    .shane-hero {
      grid-template-columns: 1fr;
      min-height: auto;
    }
    .shane-hero-inner {
      border-right: none;
      border-bottom: 1px solid ${BORDER};
      padding-bottom: 36px;
    }
    .shane-hero-photo {
      min-height: 46vh;
      background-position: center;
    }
  }
  @media (max-width: 520px) {
    .shane-svc-grid { grid-template-columns: 1fr; }
    .shane-env-imgs { grid-template-columns: 1fr; }
    .shane-gal-grid img {
      width: 100px;
      min-width: 100px;
      height: 125px;
    }
    .shane-hero-pin { right: 12px; bottom: 12px; font-size: 0.72rem; padding: 8px 10px; }
    .shane-hero-photo { min-height: 38vh; }
  }
`;

export default function ShaneHairstudio() {
  const [lang, setLang] = useState(() => detectInitialLocale());
  const t = MESSAGES[lang];
  const colon = lang === 'zh' ? '：' : ': ';
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  const services = useMemo(
    () => [
      { icon: '✂', title: t.svcCut, desc: t.svcCutDesc, href: '#contact' },
      { icon: '◐', title: t.svcColor, desc: t.svcColorDesc, href: '#contact' },
      { icon: '◎', title: t.svcPerm, desc: t.svcPermDesc, href: '#contact' },
      { icon: '☇', title: t.svcStyle, desc: t.svcStyleDesc, href: '#contact' },
    ],
    [t],
  );

  useEffect(() => {
    document.documentElement.lang = SHANE_HTML_LANG[lang] || 'en';
  }, [lang]);

  const pickLang = (next) => {
    writeSavedLocale(next);
    setLang(next);
  };

  useEffect(() => {
    const menu = menuRef.current;
    const burger = burgerRef.current;
    const toggle = (e) => {
      e.stopPropagation();
      menu?.classList.toggle('open');
    };
    const onDoc = (e) => {
      if (!menu?.classList.contains('open')) return;
      if (menu.contains(e.target) || burger?.contains(e.target)) return;
      menu.classList.remove('open');
    };
    burger?.addEventListener('click', toggle);
    document.addEventListener('click', onDoc);
    return () => {
      burger?.removeEventListener('click', toggle);
      document.removeEventListener('click', onDoc);
    };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="shane-root shane-honey">
        <div className="shane-z1">
          <nav className="shane-nav" aria-label={t.navAria}>
            <a className="shane-brand" href="#home">
              藝流造型
              <small>Hair Studio</small>
            </a>
            <ul className="shane-nav-links" ref={menuRef}>
              <li><a href="#home">{t.navHome}</a></li>
              <li><a href="#about">{t.navAbout}</a></li>
              <li><a href="#services">{t.navServices}</a></li>
              <li><a href="#gallery">{t.navGallery}</a></li>
              <li><a href="#environment">{t.navEnvironment}</a></li>
              <li><a href="#contact">{t.navContact}</a></li>
            </ul>
            <div className="shane-nav-actions">
              <div className="shane-lang" role="group" aria-label={t.langGroupAria}>
                {SHANE_LOCALES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    className="shane-lang-btn"
                    aria-pressed={lang === code}
                    aria-label={code === 'zh' ? t.langZhAria : code === 'en' ? t.langEnAria : t.langPtAria}
                    onClick={() => pickLang(code)}
                  >
                    {code === 'zh' ? '中文' : code.toUpperCase()}
                  </button>
                ))}
              </div>
              <a className="shane-nav-cta" href="#contact">{t.navCta}</a>
              <button type="button" className="shane-burger" aria-label={t.burgerOpen} ref={burgerRef}>
                <span /><span /><span />
              </button>
            </div>
          </nav>

          <header className="shane-hero" id="home">
            <div className="shane-hero-inner">
              <h1 className="shane-hero-title">{t.heroTitle}</h1>
              <p className="shane-hero-sub">{t.heroSub}</p>
              <p className="shane-hero-lead">{t.heroLead}</p>
              <p className="shane-hero-desc">{t.heroDesc}</p>
              <div className="shane-hero-btns">
                <a className="shane-btn-solid" href="#contact">{t.heroBook}</a>
                <a className="shane-btn-outline" href="#gallery">{t.heroGallery}</a>
              </div>
              <div className="shane-hero-features">
                <div className="shane-hero-feat">
                  <span className="shane-hero-feat-icon">👥</span>
                  <span>{t.heroFeat1}</span>
                </div>
                <div className="shane-hero-feat">
                  <span className="shane-hero-feat-icon">✦</span>
                  <span>{t.heroFeat2}</span>
                </div>
                <div className="shane-hero-feat">
                  <span className="shane-hero-feat-icon">◇</span>
                  <span>{t.heroFeat3}</span>
                </div>
              </div>
            </div>
            <div className="shane-hero-photo">
              <div className="shane-hero-photoGrad" aria-hidden />
              <div className="shane-hero-pin">
                <span aria-hidden>📍</span>
                <span>{t.heroPin}</span>
              </div>
            </div>
          </header>

          <section className="shane-sec" id="services">
            <div className="shane-inner">
              <div className="shane-sec-head">
                <h2>{t.secServices}</h2>
                <p className="en">{t.secServicesSub}</p>
              </div>
              <div className="shane-svc-grid">
                {services.map((s) => (
                  <div key={s.title} className="shane-svc-card">
                    <div className="shane-hex" aria-hidden>{s.icon}</div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <a className="shane-svc-more" href={s.href}>{t.svcMore} &gt;</a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="shane-sec" id="about" style={{ background: '#0d0d0d' }}>
            <div className="shane-inner">
              <div className="shane-about-grid">
                <div className="shane-about-img">
                  <img src={ABOUT_IMG} alt={t.aboutImgAlt} loading="lazy" />
                </div>
                <div className="shane-about-text">
                  <h2>{t.aboutH2}</h2>
                  <p>{t.aboutP}</p>
                  <div className="shane-stats">
                    <div className="shane-stat"><strong>10+</strong>{t.statTeam}</div>
                    <div className="shane-stat"><strong>1000+</strong>{t.statClients}</div>
                    <div className="shane-stat"><strong>{t.statProductsStrong}</strong>{t.statProducts}</div>
                    <div className="shane-stat"><strong>{t.statComfortStrong}</strong>{t.statComfort}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="shane-sec" id="gallery">
            <div className="shane-inner">
              <div className="shane-sec-head">
                <h2>{t.secGallery}</h2>
                <p className="en">{t.secGallerySub}</p>
              </div>
              <div className="shane-gal-grid">
                {GALLERY_IMGS.map((src, i) => (
                  <img key={src} src={src} alt={`${t.galleryWorkAlt} ${i + 1}`} loading="lazy" />
                ))}
              </div>
              <div className="shane-gal-more">
                <a href="#contact">{t.galleryMore}</a>
              </div>
            </div>
          </section>

          <section className="shane-sec" id="environment" style={{ background: '#0d0d0d' }}>
            <div className="shane-inner">
              <div className="shane-env-grid">
                <div className="shane-env-block">
                  <h3>{t.envTeamH3}</h3>
                  <p>{t.envTeamP}</p>
                  <img src={TEAM_IMG} alt={t.envTeamImgAlt} loading="lazy" />
                </div>
                <div className="shane-env-block">
                  <h3>{t.envSpaceH3}</h3>
                  <p>{t.envSpaceP}</p>
                  <div className="shane-env-imgs">
                    <img src={ENV_IMG1} alt={t.envImg1Alt} loading="lazy" />
                    <img src={ENV_IMG2} alt={t.envImg2Alt} loading="lazy" />
                    <img src={ENV_IMG3} alt={t.envImg3Alt} loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="shane-sec" id="contact">
            <div className="shane-inner">
              <div className="shane-sec-head">
                <h2>{t.secContact}</h2>
                <p className="en">{t.secContactSub}</p>
              </div>
              <div className="shane-contact-grid">
                <div className="shane-contact-col">
                  <h4>{t.addrLabel}</h4>
                  <p>
                    Rua dos Anjos 6A<br />
                    1150-191 Lisboa, Portugal
                  </p>
                  <h4 style={{ marginTop: 20 }}>{t.hoursLabel}</h4>
                  <p>
                    {t.hoursTueSat}<br />
                    {t.hoursSun}<br />
                    <span style={{ color: ORANGE }}>{t.hoursClosed}</span>
                  </p>
                </div>
                <div className="shane-map">
                  <iframe
                    title={t.mapTitle}
                    src={MAPS_EMBED}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <div className="shane-contact-col">
                  <h4>{t.bookH4}</h4>
                  <p>
                    <a className="shane-btn-solid" href={MAPS_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 4 }}>
                      {t.googleMaps}
                    </a>
                  </p>
                  <h4 style={{ marginTop: 20 }}>{t.contactH4}</h4>
                  <p>
                    {t.labelWhatsApp}{colon}
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                      {WHATSAPP_DISPLAY}
                    </a>
                  </p>
                  <p style={{ marginTop: 8 }}>
                    {t.labelInstagram}{colon}
                    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                      @{INSTAGRAM_HANDLE}
                    </a>
                  </p>
                  <div className="shane-social" style={{ marginTop: 16 }}>
                    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={t.ariaInstagram}>
                      IG
                    </a>
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label={`${t.ariaWhatsApp} ${WHATSAPP_DISPLAY}`}>
                      WA
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="shane-price-strip">
            <p style={{ color: TEXT_MUTED, fontSize: '0.88rem', marginBottom: 8 }}>{t.priceIntro}</p>
            <a href="/shane/price-list.png" target="_blank" rel="noopener noreferrer">{t.priceLink}</a>
          </div>

          <footer className="shane-foot">
            <div className="shane-foot-grid">
              <div className="shane-foot-brand">{t.footerBrand}</div>
              <div className="shane-foot-mid">
                {t.labelWhatsApp}{colon}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ color: ORANGE }}>
                  {WHATSAPP_DISPLAY}
                </a>
                <br />
                {t.labelInstagram}{colon}
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ color: ORANGE }}>
                  @{INSTAGRAM_HANDLE}
                </a>
                <br />
                Rua dos Anjos 6A, 1150-191 Lisboa
              </div>
              <div style={{ justifySelf: 'end' }} className="shane-social">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={t.ariaInstagram}>
                  IG
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label={`${t.ariaWhatsApp} ${WHATSAPP_DISPLAY}`}>
                  WA
                </a>
              </div>
            </div>
            <p className="shane-foot-copy">
              {t.footerCopyright.replace('{{year}}', String(new Date().getFullYear()))}
            </p>
          </footer>
      </div>
      </div>
    </>
  );
}

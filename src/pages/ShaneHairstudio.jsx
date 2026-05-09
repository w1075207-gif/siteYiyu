import { useEffect, useRef } from 'react';

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
const ENV_IMG1 = IMG('env-whisky.png');
const ENV_IMG2 = IMG('env-mask.png');

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
  .shane-env-imgs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

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
    .shane-gal-grid img {
      width: 100px;
      min-width: 100px;
      height: 125px;
    }
    .shane-hero-pin { right: 12px; bottom: 12px; font-size: 0.72rem; padding: 8px 10px; }
    .shane-hero-photo { min-height: 38vh; }
  }
`;

const services = [
  {
    icon: '✂',
    title: '剪髮',
    desc: '專業剪裁與層次設計，打造最適合臉型的髮型輪廓。',
    href: '#contact',
  },
  {
    icon: '◐',
    title: '染髮',
    desc: '時尚色系與質感呈現，使用國際品牌產品呵護髮絲。',
    href: '#contact',
  },
  {
    icon: '◎',
    title: '燙髮',
    desc: '數碼燙與造型燙，自然捲度與持久線條一次到位。',
    href: '#contact',
  },
  {
    icon: '☇',
    title: '造型',
    desc: '日常打理到重要場合，完整造型與護理建議。',
    href: '#contact',
  },
];

export default function ShaneHairstudio() {
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

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
          <nav className="shane-nav" aria-label="主選單">
            <a className="shane-brand" href="#home">
              藝流造型
              <small>Hair Studio</small>
            </a>
            <ul className="shane-nav-links" ref={menuRef}>
              <li><a href="#home">首頁</a></li>
              <li><a href="#about">關於我們</a></li>
              <li><a href="#services">服務項目</a></li>
              <li><a href="#gallery">作品展示</a></li>
              <li><a href="#environment">門店環境</a></li>
              <li><a href="#contact">聯絡我們</a></li>
            </ul>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a className="shane-nav-cta" href="#contact">立即預約</a>
              <button type="button" className="shane-burger" aria-label="開啟選單" ref={burgerRef}>
                <span /><span /><span />
              </button>
            </div>
          </nav>

          <header className="shane-hero" id="home">
            <div className="shane-hero-inner">
              <h1 className="shane-hero-title">藝流造型 Hair Studio</h1>
              <p className="shane-hero-sub">專業剪髮 · 染髮 · 燙髮 · 造型</p>
              <p className="shane-hero-lead">專屬設計 × 型格風格 × 頂級服務</p>
              <p className="shane-hero-desc">
                坐落於里斯本 Anjos 區，為您帶來亞洲美髮專業與細緻服務。我們注重每位顧客的風格與日常打理，讓您在異鄉也能擁有熟悉的好髮型。
              </p>
              <div className="shane-hero-btns">
                <a className="shane-btn-solid" href="#contact">立即預約</a>
                <a className="shane-btn-outline" href="#gallery">查看作品</a>
              </div>
              <div className="shane-hero-features">
                <div className="shane-hero-feat">
                  <span className="shane-hero-feat-icon">👥</span>
                  <span>專業團隊</span>
                </div>
                <div className="shane-hero-feat">
                  <span className="shane-hero-feat-icon">✦</span>
                  <span>個性化設計</span>
                </div>
                <div className="shane-hero-feat">
                  <span className="shane-hero-feat-icon">◇</span>
                  <span>高端呵護</span>
                </div>
              </div>
            </div>
            <div className="shane-hero-photo">
              <div className="shane-hero-photoGrad" aria-hidden />
              <div className="shane-hero-pin">
                <span aria-hidden>📍</span>
                <span>Anjos, Lisboa, Portugal</span>
              </div>
            </div>
          </header>

          <section className="shane-sec" id="services">
            <div className="shane-inner">
              <div className="shane-sec-head">
                <h2>服務項目</h2>
                <p className="en">— SERVICES —</p>
              </div>
              <div className="shane-svc-grid">
                {services.map((s) => (
                  <div key={s.title} className="shane-svc-card">
                    <div className="shane-hex" aria-hidden>{s.icon}</div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <a className="shane-svc-more" href={s.href}>了解更多 &gt;</a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="shane-sec" id="about" style={{ background: '#0d0d0d' }}>
            <div className="shane-inner">
              <div className="shane-about-grid">
                <div className="shane-about-img">
                  <img src={ABOUT_IMG} alt="藝流造型 Hair Studio 設計師於門店前合影" loading="lazy" />
                </div>
                <div className="shane-about-text">
                  <h2>關於 藝流造型 Hair Studio</h2>
                  <p>
                    藝流造型專注於亞洲髮質與流行趨勢，由經驗豐富的設計師為您量身打造。我們位於里斯本 Anjos
                    一帶，交通便利，環境舒適，讓您在輕鬆氛圍中享受剪、染、燙、護理與造型的一站式服務。
                  </p>
                  <div className="shane-stats">
                    <div className="shane-stat"><strong>10+</strong>專業造型團隊</div>
                    <div className="shane-stat"><strong>1000+</strong>滿意顧客</div>
                    <div className="shane-stat"><strong>嚴選</strong>產品</div>
                    <div className="shane-stat"><strong>舒適</strong>環境</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="shane-sec" id="gallery">
            <div className="shane-inner">
              <div className="shane-sec-head">
                <h2>作品展示</h2>
                <p className="en">— OUR WORKS —</p>
              </div>
              <div className="shane-gal-grid">
                {GALLERY_IMGS.map((src, i) => (
                  <img key={src} src={src} alt={`作品 ${i + 1}`} loading="lazy" />
                ))}
              </div>
              <div className="shane-gal-more">
                <a href="#contact">查看更多作品</a>
              </div>
            </div>
          </section>

          <section className="shane-sec" id="environment" style={{ background: '#0d0d0d' }}>
            <div className="shane-inner">
              <div className="shane-env-grid">
                <div className="shane-env-block">
                  <h3>專業團隊 · 貼心服務</h3>
                  <p>
                    我們相信溝通是美髮的第一步。設計師會依您的生活型態、整理習慣與喜好，給出最實在的建議，讓髮型好整理、耐看又顯氣質。
                  </p>
                  <img src={TEAM_IMG} alt="專業團隊：設計師專注為顧客服務" loading="lazy" />
                </div>
                <div className="shane-env-block">
                  <h3>精緻環境 · 品味體驗</h3>
                  <p>
                    門店空間以深色基調搭配溫暖燈光，讓您從進店到完成造型都能放鬆享受。每個角落都經過用心佈置，呈現沙龍級質感。
                  </p>
                  <div className="shane-env-imgs">
                    <img src={ENV_IMG1} alt="門店環境一" loading="lazy" />
                    <img src={ENV_IMG2} alt="門店環境二" loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="shane-sec" id="contact">
            <div className="shane-inner">
              <div className="shane-sec-head">
                <h2>聯絡我們</h2>
                <p className="en">— VISIT US —</p>
              </div>
              <div className="shane-contact-grid">
                <div className="shane-contact-col">
                  <h4>地址</h4>
                  <p>
                    Rua dos Anjos 6A<br />
                    1150-191 Lisboa, Portugal
                  </p>
                  <h4 style={{ marginTop: 20 }}>電話</h4>
                  <p>
                    <a href="tel:+351912345678">+351 912 345 678</a>
                  </p>
                  <h4 style={{ marginTop: 20 }}>營業時間</h4>
                  <p>
                    週二至週六 11:00 – 20:00<br />
                    週日 11:00 – 18:00<br />
                    <span style={{ color: ORANGE }}>週一公休</span>
                  </p>
                </div>
                <div className="shane-map">
                  <iframe
                    title="藝流造型地圖"
                    src={MAPS_EMBED}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <div className="shane-contact-col">
                  <h4>立即預約</h4>
                  <p>
                    <a className="shane-btn-solid" href={MAPS_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 4 }}>
                      Google 地圖導航
                    </a>
                  </p>
                  <h4 style={{ marginTop: 20 }}>Line / WhatsApp</h4>
                  <p>
                    <a href="https://wa.me/351912345678" target="_blank" rel="noopener noreferrer">+351 912 345 678</a>
                  </p>
                  <h4 style={{ marginTop: 20 }}>追蹤我們</h4>
                  <div className="shane-social">
                    <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">FB</a>
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a>
                    <a href="https://wa.me/351912345678" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">WA</a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="shane-price-strip">
            <p style={{ color: TEXT_MUTED, fontSize: '0.88rem', marginBottom: 8 }}>官方價目表（含剪髮、數碼燙、染髮）</p>
            <a href="/shane/price-list.png" target="_blank" rel="noopener noreferrer">查看完整價目表圖片 →</a>
          </div>

          <footer className="shane-foot">
            <div className="shane-foot-grid">
              <div className="shane-foot-brand">藝流造型 Hair Studio</div>
              <div className="shane-foot-mid">
                電話：<a href="tel:+351912345678" style={{ color: ORANGE }}>+351 912 345 678</a>
                <br />
                信箱：<a href="mailto:info@hairstudio.pt" style={{ color: ORANGE }}>info@hairstudio.pt</a>
                <br />
                Rua dos Anjos 6A, 1150-191 Lisboa
              </div>
              <div style={{ justifySelf: 'end' }} className="shane-social">
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">FB</a>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a>
                <a href="https://wa.me/351912345678" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">WA</a>
              </div>
            </div>
            <p className="shane-foot-copy">© {new Date().getFullYear()} 藝流造型 Hair Studio. All Rights Reserved.</p>
          </footer>
        </div>
      </div>
    </>
  );
}

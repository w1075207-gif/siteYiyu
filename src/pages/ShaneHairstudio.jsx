import { useEffect, useRef } from 'react';

/**
 * Single full-page design asset (576×1024) from the client – contains the exact
 * image choices (VW hero, stylists, portfolio grid, interior, footer, etc.).
 * Below the poster we keep a small interactive block (map + price list).
 */
const DESIGN_FULL = '/shane/design-reference-full.png';

const ORANGE = '#ff7f00';
const BLACK = '#0a0a0a';
const TEXT = '#ffffff';
const TEXT_MUTED = 'rgba(255,255,255,0.72)';
const BORDER = 'rgba(255,255,255,0.1)';

const MAPS_URL =
  'https://www.google.com/maps/place/Shane%E2%80%99s+HairStudio%E3%80%8CAsian%E3%80%8D/@38.7267389,-9.1368754,17z';
const MAPS_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.214!2d-9.136875400000001!3d38.726738899999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd19333796b3ec81%3A0x9e55a011962cd8f8!2sShane\'s%20HairStudio%E3%80%8CAsian%E3%80%8D!5e0!3m2!1sen!2spt!4v1715000000000!5m2!1sen!2spt';

const CSS = `
  .shane-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .shane-root {
    scroll-behavior: smooth;
    background: ${BLACK};
    color: ${TEXT};
    font-family: 'Noto Sans TC', 'Noto Sans SC', system-ui, sans-serif;
    min-height: 100vh;
  }

  .shane-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 clamp(16px, 4vw, 40px);
    height: 64px;
    background: rgba(10,10,10,0.94);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid ${BORDER};
  }
  .shane-brand {
    text-decoration: none; color: ${ORANGE}; font-weight: 700;
    font-size: 1rem; letter-spacing: 0.06em; line-height: 1.2;
  }
  .shane-brand small {
    display: block; font-size: 0.65rem; font-weight: 500; color: ${TEXT_MUTED};
    letter-spacing: 0.18em; text-transform: uppercase;
  }
  .shane-nav-links {
    display: flex; gap: clamp(10px, 1.8vw, 22px); list-style: none; align-items: center;
  }
  .shane-nav-links a {
    color: ${TEXT_MUTED}; text-decoration: none; font-size: 0.78rem;
    white-space: nowrap; transition: color 0.2s;
  }
  .shane-nav-links a:hover { color: ${ORANGE}; }
  .shane-nav-cta {
    background: ${ORANGE}; color: #fff; padding: 9px 18px; border-radius: 4px;
    font-size: 0.8rem; font-weight: 700; text-decoration: none;
  }
  .shane-nav-cta:hover { filter: brightness(1.06); }
  .shane-burger {
    display: none; flex-direction: column; gap: 5px; cursor: pointer;
    padding: 8px; background: none; border: none;
  }
  .shane-burger span { width: 22px; height: 2px; background: #fff; border-radius: 1px; }

  .shane-poster-wrap {
    padding-top: 64px;
    display: flex; flex-direction: column; align-items: center;
    background: ${BLACK};
  }
  .shane-poster {
    display: block; width: 100%; max-width: 576px; height: auto;
    scroll-margin-top: 72px;
  }
  .shane-skip-note {
    position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;
  }

  .shane-live {
    max-width: 960px; margin: 0 auto;
    padding: 48px clamp(16px, 4vw, 32px) 56px;
    border-top: 1px solid ${BORDER};
  }
  .shane-live h2 {
    font-size: 1.15rem; margin-bottom: 8px; color: ${TEXT};
  }
  .shane-live .sub { color: ${ORANGE}; font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 24px; }
  .shane-contact-grid {
    display: grid; grid-template-columns: 1fr 1.15fr 1fr; gap: 24px; align-items: start;
  }
  .shane-contact-col h4 {
    font-size: 0.68rem; color: ${ORANGE}; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;
  }
  .shane-contact-col p, .shane-contact-col a {
    font-size: 0.88rem; color: ${TEXT_MUTED}; line-height: 1.65; text-decoration: none;
  }
  .shane-contact-col a:hover { color: ${ORANGE}; }
  .shane-map { border-radius: 10px; overflow: hidden; border: 1px solid ${BORDER}; }
  .shane-map iframe { width: 100%; height: 300px; border: 0; display: block; }
  .shane-btn-solid {
    display: inline-block; background: ${ORANGE}; color: #fff; padding: 12px 22px;
    border-radius: 4px; font-weight: 700; font-size: 0.88rem; text-decoration: none; margin-top: 6px;
  }
  .shane-social { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
  .shane-social a {
    width: 38px; height: 38px; border-radius: 50%; border: 1px solid ${BORDER};
    display: flex; align-items: center; justify-content: center; color: ${TEXT}; font-size: 0.75rem; font-weight: 700;
  }
  .shane-social a:hover { border-color: ${ORANGE}; color: ${ORANGE}; }

  .shane-price-strip {
    max-width: 960px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 32px) 40px;
  }
  .shane-price-strip a { color: ${ORANGE}; font-weight: 600; font-size: 0.88rem; }

  .shane-foot-mini {
    text-align: center; padding: 20px 16px 32px; font-size: 0.72rem; color: ${TEXT_MUTED};
    border-top: 1px solid ${BORDER};
  }

  @media (max-width: 900px) {
    .shane-nav-links {
      display: none; position: fixed; top: 64px; left: 0; right: 0;
      flex-direction: column; background: rgba(10,10,10,0.98); padding: 12px 0; border-bottom: 1px solid ${BORDER}; gap: 0;
    }
    .shane-nav-links.open { display: flex; }
    .shane-nav-links a { display: block; padding: 12px 22px; font-size: 0.95rem; }
    .shane-nav-cta { display: none; }
    .shane-burger { display: flex; }
    .shane-contact-grid { grid-template-columns: 1fr; }
    .shane-map iframe { height: 240px; }
  }
`;

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
      <div className="shane-root">
        <p className="shane-skip-note">
          頁面主視覺為完整設計長圖，與提供之設計稿一致；下方為可操作的 Google 地圖與價目表連結。
        </p>

        <nav className="shane-nav" aria-label="主選單">
          <a className="shane-brand" href="#design">
            藝流造型
            <small>Hair Studio</small>
          </a>
          <ul className="shane-nav-links" ref={menuRef}>
            <li><a href="#design">首頁</a></li>
            <li><a href="#design">關於我們</a></li>
            <li><a href="#design">服務項目</a></li>
            <li><a href="#design">作品展示</a></li>
            <li><a href="#design">門店環境</a></li>
            <li><a href="#live-contact">聯絡我們</a></li>
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a className="shane-nav-cta" href="#live-contact">立即預約</a>
            <button type="button" className="shane-burger" aria-label="開啟選單" ref={burgerRef}>
              <span /><span /><span />
            </button>
          </div>
        </nav>

        <div className="shane-poster-wrap">
          <img
            id="design"
            className="shane-poster"
            src={DESIGN_FULL}
            width={576}
            height={1024}
            alt="藝流造型 Hair Studio 官網完整視覺（含首圖、作品與門店照片），與設計稿一致"
            loading="eager"
            decoding="async"
          />
        </div>

        <section className="shane-live" id="live-contact" aria-labelledby="live-contact-heading">
          <h2 id="live-contact-heading">預約與導航</h2>
          <p className="sub">— MAP &amp; BOOKING —</p>
          <div className="shane-contact-grid">
            <div className="shane-contact-col">
              <h4>地址（與設計稿一致）</h4>
              <p>
                Rua dos Anjos 6A<br />
                1150-039 Lisboa, Portugal
              </p>
              <h4 style={{ marginTop: 18 }}>電話（設計稿）</h4>
              <p>
                <a href="tel:+351000000000">+351 000 000 000</a>
                <br />
                <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>正式號碼確定後請替換此占位</span>
              </p>
              <h4 style={{ marginTop: 18 }}>營業時間</h4>
              <p>
                週二至週六 11:00 – 20:00<br />
                週日 11:00 – 18:00<br />
                <span style={{ color: ORANGE }}>週一公休</span>
              </p>
            </div>
            <div className="shane-map">
              <iframe
                title="Google 地圖：Shane's HairStudio「Asian」"
                src={MAPS_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="shane-contact-col">
              <h4>立即預約</h4>
              <p>
                <a className="shane-btn-solid" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                  Google 地圖導航
                </a>
              </p>
              <h4 style={{ marginTop: 18 }}>Line / WhatsApp</h4>
              <p>
                <span style={{ opacity: 0.9 }}>請以設計稿電話或 Google 地圖聯繫店家</span>
              </p>
              <h4 style={{ marginTop: 18 }}>追蹤我們</h4>
              <div className="shane-social">
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">FB</a>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a>
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" aria-label="Google Maps">Map</a>
              </div>
            </div>
          </div>
        </section>

        <div className="shane-price-strip">
          <p style={{ color: TEXT_MUTED, fontSize: '0.85rem', marginBottom: 8 }}>官方價目表（剪髮 / 數碼燙 / 染髮）</p>
          <a href="/shane/price-list.png" target="_blank" rel="noopener noreferrer">查看完整價目表圖片 →</a>
        </div>

        <footer className="shane-foot-mini">
          © {new Date().getFullYear()} 藝流造型 Hair Studio · 視覺稿檔案：<code style={{ fontSize: '0.65rem' }}>public/shane/design-reference-full.png</code>
        </footer>
      </div>
    </>
  );
}

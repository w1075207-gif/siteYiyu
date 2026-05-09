/** Shane Hair Studio page copy — zh (Traditional), en, pt */

export const SHANE_LOCALES = ['zh', 'en', 'pt'];
export const SHANE_DEFAULT_LOCALE = 'zh';

export const SHANE_HTML_LANG = { zh: 'zh-Hant', en: 'en', pt: 'pt' };

const STORAGE_KEY = 'shane-hairstudio-lang';

export function readSavedLocale() {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return SHANE_LOCALES.includes(v) ? v : null;
  } catch {
    return null;
  }
}

export function writeSavedLocale(locale) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function detectInitialLocale() {
  const saved = readSavedLocale();
  if (saved) return saved;
  if (typeof navigator === 'undefined') return SHANE_DEFAULT_LOCALE;
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('pt')) return 'pt';
  if (nav.startsWith('en')) return 'en';
  return SHANE_DEFAULT_LOCALE;
}

/** @type {Record<string, Record<string, string>>} */
export const MESSAGES = {
  zh: {
    navAria: '主選單',
    burgerOpen: '開啟選單',
    navHome: '首頁',
    navAbout: '關於我們',
    navServices: '服務項目',
    navGallery: '作品展示',
    navEnvironment: '門店環境',
    navContact: '聯絡我們',
    navCta: '立即預約',
    heroTitle: '藝流造型 Hair Studio',
    heroSub: '專業剪髮 · 染髮 · 燙髮 · 造型',
    heroLead: '專屬設計 × 型格風格 × 頂級服務',
    heroDesc:
      '坐落於里斯本 Anjos 區，為您帶來亞洲美髮專業與細緻服務。我們注重每位顧客的風格與日常打理，讓您在異鄉也能擁有熟悉的好髮型。',
    heroBook: '立即預約',
    heroGallery: '查看作品',
    heroFeat1: '專業團隊',
    heroFeat2: '個性化設計',
    heroFeat3: '高端呵護',
    heroPin: 'Anjos, Lisboa, Portugal',
    secServices: '服務項目',
    secServicesSub: '— SERVICES —',
    svcCut: '剪髮',
    svcCutDesc: '專業剪裁與層次設計，打造最適合臉型的髮型輪廓。',
    svcColor: '染髮',
    svcColorDesc: '時尚色系與質感呈現，使用國際品牌產品呵護髮絲。',
    svcPerm: '燙髮',
    svcPermDesc: '數碼燙與造型燙，自然捲度與持久線條一次到位。',
    svcStyle: '造型',
    svcStyleDesc: '日常打理到重要場合，完整造型與護理建議。',
    svcMore: '了解更多',
    aboutImgAlt: '藝流造型 Hair Studio 設計師於門店前合影',
    aboutH2: '關於 藝流造型 Hair Studio',
    aboutP:
      '藝流造型專注於亞洲髮質與流行趨勢，由經驗豐富的設計師為您量身打造。我們位於里斯本 Anjos 一帶，交通便利，環境舒適，讓您在輕鬆氛圍中享受剪、染、燙、護理與造型的一站式服務。',
    statTeam: '專業造型團隊',
    statClients: '滿意顧客',
    statProducts: '產品',
    statProductsStrong: '嚴選',
    statComfort: '環境',
    statComfortStrong: '舒適',
    secGallery: '作品展示',
    secGallerySub: '— OUR WORKS —',
    galleryWorkAlt: '作品',
    galleryMore: '查看更多作品',
    envTeamH3: '專業團隊 · 貼心服務',
    envTeamP:
      '我們相信溝通是美髮的第一步。設計師會依您的生活型態、整理習慣與喜好，給出最實在的建議，讓髮型好整理、耐看又顯氣質。',
    envTeamImgAlt: '專業團隊：設計師專注為顧客服務',
    envSpaceH3: '精緻環境 · 品味體驗',
    envSpaceP:
      '門店空間以深色基調搭配溫暖燈光，讓您從進店到完成造型都能放鬆享受。每個角落都經過用心佈置，呈現沙龍級質感。',
    envImg1Alt: '沙龍空間裝飾：精緻面具與暖色燈光下的質感陳列',
    envImg2Alt: '門店牆面展示：華麗面具與羽毛飾品營造藝術氛圍',
    envImg3Alt: '休息區陳列：精選酒款與幾何鏡面裝飾的品味角落',
    secContact: '聯絡我們',
    secContactSub: '— VISIT US —',
    addrLabel: '地址',
    hoursLabel: '營業時間',
    hoursTueSat: '週二至週六 11:00 – 20:00',
    hoursSun: '週日 11:00 – 18:00',
    hoursClosed: '週一公休',
    mapTitle: '藝流造型地圖',
    bookH4: '立即預約',
    googleMaps: 'Google 地圖導航',
    contactH4: '聯絡方式',
    labelWhatsApp: 'WhatsApp',
    labelInstagram: 'Instagram',
    priceIntro: '官方價目表（含剪髮、數碼燙、染髮）',
    priceLink: '查看完整價目表圖片 →',
    footerBrand: '藝流造型 Hair Studio',
    footerCopyright: '© {{year}} 藝流造型 Hair Studio — 保留所有權利。',
    ariaInstagram: 'Instagram @shanehairstudio',
    ariaWhatsApp: 'WhatsApp',
    langGroupAria: '語言',
    langZhAria: '繁體中文',
    langEnAria: 'English',
    langPtAria: 'Português',
  },
  en: {
    navAria: 'Main menu',
    burgerOpen: 'Open menu',
    navHome: 'Home',
    navAbout: 'About',
    navServices: 'Services',
    navGallery: 'Portfolio',
    navEnvironment: 'Salon',
    navContact: 'Contact',
    navCta: 'Book now',
    heroTitle: '藝流造型 Hair Studio',
    heroSub: 'Cuts · Colour · Perms · Styling',
    heroLead: 'Bespoke design · Distinct style · Premium care',
    heroDesc:
      'In Lisbon’s Anjos district, we bring Asian hair expertise and attentive service. We focus on your look and daily routine, so you can feel at home with hair you love.',
    heroBook: 'Book now',
    heroGallery: 'View portfolio',
    heroFeat1: 'Expert team',
    heroFeat2: 'Personalised design',
    heroFeat3: 'Premium care',
    heroPin: 'Anjos, Lisbon, Portugal',
    secServices: 'Services',
    secServicesSub: '— SERVICES —',
    svcCut: 'Haircut',
    svcCutDesc: 'Precision cutting and layers tailored to your face shape.',
    svcColor: 'Colour',
    svcColorDesc: 'On-trend shades and shine, using trusted professional products.',
    svcPerm: 'Perm',
    svcPermDesc: 'Digital and styling perms for natural movement and lasting shape.',
    svcStyle: 'Styling',
    svcStyleDesc: 'From everyday upkeep to special occasions — full styling and care tips.',
    svcMore: 'Learn more',
    aboutImgAlt: 'Hair Studio team in front of the salon',
    aboutH2: 'About 藝流造型 Hair Studio',
    aboutP:
      'We specialise in Asian hair types and current trends, crafted by experienced stylists. Located in Anjos, Lisbon, with easy access and a relaxed atmosphere for cuts, colour, perms, treatments, and styling in one place.',
    statTeam: ' professional stylists',
    statClients: ' happy clients',
    statProducts: ' products',
    statProductsStrong: 'Curated',
    statComfort: ' environment',
    statComfortStrong: 'Comfortable',
    secGallery: 'Portfolio',
    secGallerySub: '— OUR WORKS —',
    galleryWorkAlt: 'Style',
    galleryMore: 'See more work',
    envTeamH3: 'Expert team · Thoughtful service',
    envTeamP:
      'We believe conversation comes first. Your stylist listens to your lifestyle, habits, and taste — honest advice for hair that is easy to maintain and looks refined.',
    envTeamImgAlt: 'Stylist focused on serving a client',
    envSpaceH3: 'Refined space · A tasteful experience',
    envSpaceP:
      'A dark-toned salon with warm lighting, designed so you can unwind from arrival to finish. Every corner is curated for a true salon-grade feel.',
    envImg1Alt: 'Salon decor: ornate mask with warm accent lighting',
    envImg2Alt: 'Wall display: ornate mask and feathers for an artistic mood',
    envImg3Alt: 'Lounge display: premium spirits and geometric mirror decor',
    secContact: 'Contact',
    secContactSub: '— VISIT US —',
    addrLabel: 'Address',
    hoursLabel: 'Opening hours',
    hoursTueSat: 'Tue–Sat 11:00 – 20:00',
    hoursSun: 'Sun 11:00 – 18:00',
    hoursClosed: 'Closed Mondays',
    mapTitle: 'Hair Studio map',
    bookH4: 'Book now',
    googleMaps: 'Open in Google Maps',
    contactH4: 'Get in touch',
    labelWhatsApp: 'WhatsApp',
    labelInstagram: 'Instagram',
    priceIntro: 'Official price list (cuts, digital perm, colour)',
    priceLink: 'View full price list →',
    footerBrand: '藝流造型 Hair Studio',
    footerCopyright: '© {{year}} 藝流造型 Hair Studio. All rights reserved.',
    ariaInstagram: 'Instagram @shanehairstudio',
    ariaWhatsApp: 'WhatsApp',
    langGroupAria: 'Language',
    langZhAria: 'Traditional Chinese',
    langEnAria: 'English',
    langPtAria: 'Portuguese',
  },
  pt: {
    navAria: 'Menu principal',
    burgerOpen: 'Abrir menu',
    navHome: 'Início',
    navAbout: 'Sobre nós',
    navServices: 'Serviços',
    navGallery: 'Portfólio',
    navEnvironment: 'Espaço',
    navContact: 'Contactos',
    navCta: 'Reservar',
    heroTitle: '藝流造型 Hair Studio',
    heroSub: 'Corte · Cor · Permanente · Penteado',
    heroLead: 'Design à medida · Estilo · Cuidado premium',
    heroDesc:
      'No bairro dos Anjos, em Lisboa, trazemos a especialidade asiática em cabeleireiro e um atendimento cuidado. Pensamos no seu estilo e na rotina diária, para se sentir em casa com um cabelo que adora.',
    heroBook: 'Reservar',
    heroGallery: 'Ver portfólio',
    heroFeat1: 'Equipa experiente',
    heroFeat2: 'Design personalizado',
    heroFeat3: 'Cuidado premium',
    heroPin: 'Anjos, Lisboa, Portugal',
    secServices: 'Serviços',
    secServicesSub: '— SERVIÇOS —',
    svcCut: 'Corte',
    svcCutDesc: 'Corte e camadas precisas, adequadas ao formato do rosto.',
    svcColor: 'Cor',
    svcColorDesc: 'Tons atuais e brilho, com produtos profissionais de confiança.',
    svcPerm: 'Permanente',
    svcPermDesc: 'Permanente digital e de styling: movimento natural e forma duradoura.',
    svcStyle: 'Penteado',
    svcStyleDesc: 'Do dia a dia a ocasiões especiais — penteado completo e dicas de cuidado.',
    svcMore: 'Saber mais',
    aboutImgAlt: 'Equipa do salão à entrada',
    aboutH2: 'Sobre 藝流造型 Hair Studio',
    aboutP:
      'Especialistas em tipo de cabelo asiático e tendências atuais, com estilistas experientes. Estamos nos Anjos, Lisboa, com boa acessibilidade e ambiente descontraído para corte, cor, permanente, tratamentos e penteado num só lugar.',
    statTeam: ' estilistas profissionais',
    statClients: ' clientes satisfeitos',
    statProducts: ' produtos',
    statProductsStrong: 'Selecionados',
    statComfort: ' ambiente',
    statComfortStrong: 'Confortável',
    secGallery: 'Portfólio',
    secGallerySub: '— TRABALHOS —',
    galleryWorkAlt: 'Trabalho',
    galleryMore: 'Ver mais trabalhos',
    envTeamH3: 'Equipa profissional · Atendimento atento',
    envTeamP:
      'Acreditamos que a conversa é o primeiro passo. O estilista adapta-se ao seu estilo de vida, hábitos e gostos — conselhos honestos para um cabelo fácil de manter e elegante.',
    envTeamImgAlt: 'Estilista a atender um cliente com dedicação',
    envSpaceH3: 'Espaço requintado · Experiência com bom gosto',
    envSpaceP:
      'Ambiente em tons escuros com luz quente, para relaxar da chegada ao resultado final. Cada detalhe pensado para uma sensação de salão premium.',
    envImg1Alt: 'Decoração: máscara ornamentada com luz de destaque',
    envImg2Alt: 'Parede com máscara e penas para um ambiente artístico',
    envImg3Alt: 'Zona de repouso: seleção de bebidas e espelho geométrico',
    secContact: 'Contactos',
    secContactSub: '— VISITE-NOS —',
    addrLabel: 'Morada',
    hoursLabel: 'Horário',
    hoursTueSat: 'Ter–Sáb 11:00 – 20:00',
    hoursSun: 'Dom 11:00 – 18:00',
    hoursClosed: 'Encerrado às segundas',
    mapTitle: 'Mapa do salão',
    bookH4: 'Reservar',
    googleMaps: 'Abrir no Google Maps',
    contactH4: 'Contacto',
    labelWhatsApp: 'WhatsApp',
    labelInstagram: 'Instagram',
    priceIntro: 'Tabela de preços oficial (corte, permanente digital, cor)',
    priceLink: 'Ver tabela completa →',
    footerBrand: '藝流造型 Hair Studio',
    footerCopyright: '© {{year}} 藝流造型 Hair Studio. Todos os direitos reservados.',
    ariaInstagram: 'Instagram @shanehairstudio',
    ariaWhatsApp: 'WhatsApp',
    langGroupAria: 'Idioma',
    langZhAria: 'Chinês (tradicional)',
    langEnAria: 'Inglês',
    langPtAria: 'Português',
  },
};

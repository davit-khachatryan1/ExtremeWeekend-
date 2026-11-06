/* =============================================================================
 *  WEEKEND EXTREME — SITE CONTENT & SETTINGS
 *  ---------------------------------------------------------------------------
 *  EVERYTHING you may want to change lives in this one file:
 *  prices, contacts, dates, texts in Armenian (hy) / English (en) / Russian (ru).
 *
 *  • Every translatable text is an object: { hy: '…', en: '…', ru: '…' }
 *  • Values that still need YOUR real data are marked with   @placeholder
 *    Find them all with:   grep -n "@placeholder" src/config/content.ts
 *  • Prices are plain numbers in AMD. `null` = "price on request".
 * ============================================================================= */

export type Lang = 'hy' | 'en' | 'ru';
export type L = Record<Lang, string>;

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'hy', label: 'Հայերեն', short: 'ՀՅ' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ru', label: 'Русский', short: 'РУ' },
];
export const DEFAULT_LANG: Lang = 'hy';

/* ----------------------------------------------------------------------------
 * 1. BUSINESS SETTINGS
 * -------------------------------------------------------------------------- */
export const SITE = {
  brand: 'Weekend Extreme',
  /** Public URL of the site, used for SEO / sitemap / social sharing. @placeholder */
  siteUrl: 'https://weekendextreme.am',

  contacts: {
    /** Shown on the site. @placeholder */
    phoneDisplay: '+374 00 00 00 00',
    /** Used for the "Call" button (tel: link), digits only with +. @placeholder */
    phoneHref: '+37400000000',
    /** @placeholder */
    email: 'hello@weekendextreme.am',
    /** Telegram username WITHOUT @ → https://t.me/USERNAME  @placeholder */
    telegram: 'USERNAME',
    /** Leave '' to show "coming soon". @placeholder */
    instagram: '',
    /** Full URL or ''. @placeholder */
    facebook: '',
    /** Full URL or ''. @placeholder */
    tiktok: '',
  },

  /** Real camp location (Google Maps). */
  campMapUrl: 'https://maps.app.goo.gl/EvmTpwDSUhgcVFrd8',

  booking: {
    /**
     * Where the booking form is POSTed (JSON). The included serverless function
     * `/api/booking` forwards it to your Telegram (see README). Set '' to skip
     * the server and only open Telegram with the booking text.
     */
    endpoint: '/api/booking',
    depositPercent: 30,
    freeCancellationDays: 7,
    /** Online deposit payment link (bank vPOS / Idram / TelCell page). '' = we send it manually. @placeholder */
    paymentUrl: '',
    /** Payment methods shown to customers. @placeholder */
    paymentMethods: {
      hy: 'Բանկային քարտ · Idram · TelCell · բանկային փոխանցում',
      en: 'Bank card · Idram · TelCell · bank transfer',
      ru: 'Банковская карта · Idram · TelCell · банковский перевод',
    } as L,
  },

  /** Quest winners' discount on the next tour, in %. @placeholder */
  questDiscountPercent: 10,

  /** Optional fallback video for weak phones (mp4 in /public), e.g. '/media/hero.mp4'. '' = illustrated fallback. */
  heroVideo: '',
  heroVideoPoster: '',

  /**
   * Optional real 3D jeep model (GLB/GLTF in /public, Draco-compressed is fine).
   * '' = use the built-in low-poly UAZ made in code.
   * The model should face +Z, sit on y=0 and be about 2.2 units long.
   */
  jeepModelUrl: '',
};

/* ----------------------------------------------------------------------------
 * Sound credits — shown in small print in the footer.
 * Sounds themselves: drop files into src/assets/sounds/ (see README → "Natural sounds").
 * Add one line for every recording whose licence asks for credit (e.g. CC BY).
 * -------------------------------------------------------------------------- */
export const SOUND_CREDITS: string[] = [
  'Forest birds: “Forest #3” by Pierre Sibanarco (BigSoundBank, CC0)',
];

/* ----------------------------------------------------------------------------
 * 2. NUMBERS (animated counters)
 * -------------------------------------------------------------------------- */
export const NUMBERS: { value: number; prefix?: string; suffix?: string; label: L }[] = [
  // @placeholder — real off-road distance Koti → Camp
  { value: 40, prefix: '~', label: { hy: 'կմ իսկական արտաճանապարհ', en: 'km of real off-road', ru: 'км настоящего бездорожья' } },
  // @placeholder — highest point / camp altitude
  { value: 2200, label: { hy: 'մ բարձրություն', en: 'm altitude', ru: 'м над уровнем моря' } },
  // @placeholder — number of checkpoints (keep in sync with CHECKPOINTS below)
  { value: 6, label: { hy: 'ստուգակետ ճանապարհին', en: 'checkpoints on the way', ru: 'чекпоинтов в пути' } },
  { value: 4, prefix: '3–', label: { hy: 'հոգի մեկ ջիպում', en: 'people per jeep', ru: 'человека в джипе' } },
  { value: 2, label: { hy: 'մարզ՝ Տավուշ և Լոռի', en: 'regions: Tavush & Lori', ru: 'региона: Тавуш и Лори' } },
];

/* ----------------------------------------------------------------------------
 * 3. PACKAGES & PRICES (AMD per person; null = on request)
 * -------------------------------------------------------------------------- */
export type PackageId = '2day' | 'owncar' | 'selfdrive' | '3day' | 'corporate' | 'tbilisi';
export interface Package {
  id: PackageId;
  price: number | null;
  popular?: boolean;
  days: number;
  name: L;
  forWhom: L;
  includes: L[];
}

export const PACKAGES: Package[] = [
  {
    id: '2day',
    price: 30000,
    popular: true,
    days: 2,
    name: { hy: 'Weekend Extreme 2 օր', en: 'Weekend Extreme 2-day', ru: 'Weekend Extreme 2 дня' },
    forWhom: { hy: 'Բոլորի համար', en: 'For everyone', ru: 'Для всех' },
    includes: [
      { hy: 'Միկրոավտոբուս Երևան ↔ Կոթի', en: 'Minivan Yerevan ↔ Koti', ru: 'Минивэн Ереван ↔ Коти' },
      { hy: 'Ջիպեր Կոթի ↔ ճամբար', en: 'Jeeps Koti ↔ Camp', ru: 'Джипы Коти ↔ лагерь' },
      { hy: 'Գիդ, ճամբար, ամբողջ սնունդը', en: 'Guide, camp, all meals', ru: 'Гид, лагерь, всё питание' },
      { hy: 'Քվեստ խաղ և լուսանկարներ', en: 'Quest game & photos', ru: 'Квест и фотографии' },
    ],
  },
  {
    id: 'owncar',
    price: 27000,
    days: 2,
    name: { hy: 'Ձեր մեքենայով մինչև Կոթի', en: 'Own car to Koti', ru: 'На своей машине до Коти' },
    forWhom: { hy: 'Երևանից ինքնուրույն եկողների համար', en: 'For people driving from Yerevan', ru: 'Для тех, кто едет из Еревана сам' },
    includes: [
      { hy: 'Ամեն ինչ նույնը՝ առանց միկրոավտոբուսի', en: 'Everything the same, without the minivan', ru: 'Всё то же самое, без минивэна' },
      { hy: 'Ջիպեր Կոթի ↔ ճամբար', en: 'Jeeps Koti ↔ Camp', ru: 'Джипы Коти ↔ лагерь' },
      { hy: 'Գիդ, ճամբար, ամբողջ սնունդը', en: 'Guide, camp, all meals', ru: 'Гид, лагерь, всё питание' },
      { hy: 'Քվեստ խաղ և լուսանկարներ', en: 'Quest game & photos', ru: 'Квест и фотографии' },
    ],
  },
  {
    id: 'selfdrive',
    price: 15000,
    days: 2,
    name: { hy: 'Self-Drive մինչև ճամբար', en: 'Self-Drive to Camp', ru: 'Self-Drive до лагеря' },
    forWhom: { hy: 'Սեփական 4x4 ունեցողների համար', en: 'For people with their own 4x4', ru: 'Для владельцев своих 4x4' },
    includes: [
      { hy: 'Հետևում եք մեր ուղեկցող ջիպին', en: 'Follow our guide jeep', ru: 'Едете за нашим джипом-проводником' },
      { hy: 'Ճամբար և ամբողջ սնունդը', en: 'Camp & all meals', ru: 'Лагерь и всё питание' },
      { hy: 'Քվեստ խաղ', en: 'Quest game', ru: 'Квест' },
    ],
  },
  {
    id: '3day',
    price: null, // @placeholder — e.g. 45000
    days: 3,
    name: { hy: '3 օրանոց արշավ', en: '3-day Expedition', ru: 'Экспедиция на 3 дня' },
    forWhom: { hy: 'Նրանց համար, ովքեր ուզում են ավելի շատ բնություն', en: 'More time in nature', ru: 'Больше времени на природе' },
    includes: [
      { hy: '2 գիշեր ճամբարում', en: '2 nights at camp', ru: '2 ночи в лагере' },
      { hy: 'Լրացուցիչ օր՝ արշավներ, ձիեր, քվեստի նոր փուլ', en: 'Extra day: hikes, horses, extra Quest stage', ru: 'Доп. день: походы, лошади, новый этап квеста' },
      { hy: 'Տրանսպորտ, գիդ, ամբողջ սնունդը', en: 'Transport, guide, all meals', ru: 'Транспорт, гид, всё питание' },
    ],
  },
  {
    id: 'corporate',
    price: null, // @placeholder
    days: 2,
    name: { hy: 'Կորպորատիվ', en: 'Corporate', ru: 'Корпоратив' },
    forWhom: { hy: 'Ընկերությունների և մեծ խմբերի համար', en: 'Companies & big groups', ru: 'Компании и большие группы' },
    includes: [
      { hy: 'Ֆիքսված գին մեկ անձի համար', en: 'Fixed price per person', ru: 'Фиксированная цена за человека' },
      { hy: 'Ձեր ամսաթվերը, այդ թվում՝ աշխատանքային օրեր', en: 'Custom dates incl. weekdays', ru: 'Ваши даты, включая будни' },
      { hy: 'Թիմային քվեստ', en: 'Team-building Quest', ru: 'Командный квест' },
    ],
  },
  {
    id: 'tbilisi',
    price: null, // @placeholder — price for the Tbilisi edition
    days: 2,
    name: { hy: 'Թբիլիսյան տարբերակ', en: 'Tbilisi Edition', ru: 'Тбилисская версия' },
    forWhom: { hy: 'Վրաստանում գտնվող զբոսաշրջիկների համար', en: 'For travellers in Georgia', ru: 'Для туристов в Грузии' },
    includes: [
      { hy: 'Տրանսֆեր Թբիլիսի → Կոթի', en: 'Transfer Tbilisi → Koti', ru: 'Трансфер Тбилиси → Коти' },
      { hy: 'Նույն ջիպային երթուղին', en: 'Same jeep route', ru: 'Тот же джип-маршрут' },
      { hy: 'Անգլիախոս / ռուսախոս գիդ', en: 'English / Russian speaking guide', ru: 'Англо- / русскоязычный гид' },
    ],
  },
];

export type AddonId = 'tent' | 'horse' | 'drone';
export interface Addon {
  id: AddonId;
  price: number;
  /** 'person' = per person, 'set' = per rented set, 'group' = once per booking */
  unit: 'person' | 'set' | 'group';
  name: L;
}
export const ADDONS: Addon[] = [
  { id: 'tent', price: 5000, unit: 'set', name: { hy: 'Վրան + քնապարկ (վարձույթ)', en: 'Tent + sleeping bag rental', ru: 'Аренда палатки + спальника' } },
  { id: 'horse', price: 5000, unit: 'person', name: { hy: 'Ձիավարություն', en: 'Horse riding', ru: 'Конная прогулка' } },
  // @placeholder — is the drone video price per person or per group? change unit to 'group' if needed
  { id: 'drone', price: 2000, unit: 'person', name: { hy: 'Դրոնով տեսանկարահանում', en: 'Drone video', ru: 'Видео с дрона' } },
];

/* ----------------------------------------------------------------------------
 * 4. SEASON & DEPARTURES
 * -------------------------------------------------------------------------- */
export const SEASON = {
  /** Months are 1–12. */
  startMonth: 5,
  endMonth: 10,
  /** Seats per departure (e.g. 4 jeeps × 4 people). */
  capacity: 16,
  /** How many upcoming weekends to show in the calendar. */
  showCount: 8,
  /** Seats already booked per Saturday date — update this as bookings come in. */
  seatsTaken: {
    // '2027-05-08': 6,
  } as Record<string, number>,
  /** Saturdays without a tour (e.g. holidays), format 'YYYY-MM-DD'. */
  skipDates: [] as string[],
  /** Grand final month of the Season League. @placeholder */
  finalMonth: { hy: 'հոկտեմբեր', en: 'October', ru: 'октябрь' } as L,
};

/* ----------------------------------------------------------------------------
 * 5. ROUTE CHECKPOINTS (position u = 0 … 1 along the route)
 * -------------------------------------------------------------------------- */
export interface Checkpoint {
  u: number;
  /** Altitude in metres. @placeholder — confirm every altitude */
  alt: number;
  /** Optional photo in /public, e.g. '/photos/koti.jpg'. '' = illustrated placeholder. */
  image: string;
  icon: 'flag' | 'trees' | 'waves' | 'mountain' | 'flower' | 'tent';
  name: L;
  text: L;
}
export const CHECKPOINTS: Checkpoint[] = [
  {
    u: 0, alt: 900, image: '', icon: 'flag',
    name: { hy: 'Կոթի գյուղ · մեկնարկ', en: 'Koti village · start', ru: 'Село Коти · старт' },
    text: {
      hy: 'Այստեղից է սկսվում յուրաքանչյուր արշավ։ Ծանոթանում ենք վարորդների հետ, անցկացնում անվտանգության ճեպազրույց, կազմում թիմերը և ստանում քվեստի առաջին քարտերը։',
      en: 'Every expedition starts here. Meet the drivers, safety briefing, teams are formed and the first Quest cards are handed out.',
      ru: 'Здесь начинается каждая экспедиция. Знакомимся с водителями, проходим инструктаж по безопасности, делимся на команды и получаем первые карточки квеста.',
    },
  },
  {
    u: 0.2, alt: 1250, image: '', icon: 'trees',
    name: { hy: 'Անտառային արահետներ', en: 'Forest tracks', ru: 'Лесные дороги' },
    text: {
      hy: 'Հաճարենու և կաղնու անտառներ, ցեխ, արմատներ ու զառիթափ վերելքներ․ ահա թե ինչ է իսկական off-road-ը։',
      en: 'Beech and oak forests, mud, roots and steep climbs — this is what real off-road feels like.',
      ru: 'Буковые и дубовые леса, грязь, корни и крутые подъёмы — вот что такое настоящий off-road.',
    },
  },
  {
    u: 0.4, alt: 1500, image: '', icon: 'waves',
    name: { hy: 'Գետանցում', en: 'River crossing', ru: 'Брод через речку' },
    text: {
      hy: 'Ջիպերն անցնում են լեռնային առվակի միջով, իսկ թիմերը որոնում են առաջին GPS գանձը։',
      en: 'The jeeps ford a mountain stream while the teams hunt for the first GPS treasure.',
      ru: 'Джипы проходят горный ручей вброд, а команды ищут первый GPS-клад.',
    },
  },
  {
    u: 0.62, alt: 2100, image: '', icon: 'mountain',
    name: { hy: 'Լեռնանցք', en: 'Mountain pass', ru: 'Перевал' },
    text: {
      hy: 'Տավուշի և Լոռու միջև լեռնաշղթայի վրա․ տեսարանը բացվում է երկու մարզերի վրա միանգամից։',
      en: 'On the ridge between Tavush and Lori — the view opens over both regions at once.',
      ru: 'На хребте между Тавушем и Лори — вид сразу на оба региона.',
    },
  },
  {
    u: 0.82, alt: 2150, image: '', icon: 'flower',
    name: { hy: 'Ալպյան մարգագետիններ', en: 'Alpine meadows', ru: 'Альпийские луга' },
    text: {
      hy: 'Անտառից վեր՝ անվերջ կանաչ, ծաղիկներ, ձիեր, քամի և լռություն։',
      en: 'Above the forest: endless green, flowers, horses, wind and silence.',
      ru: 'Выше леса — бескрайняя зелень, цветы, лошади, ветер и тишина.',
    },
  },
  {
    u: 1, alt: 2200, image: '', icon: 'tent',
    name: { hy: 'Լեռնային ճամբար', en: 'Mountain camp', ru: 'Горный лагерь' },
    text: {
      hy: 'Մոտ 2 ժամ անց՝ ճամբարը Լոռու ալպյան մարգագետիններում։ Խորոված, խարույկ և աստղեր։',
      en: 'About 2 hours later — our camp in the alpine meadows of Lori. Khorovats, campfire and stars.',
      ru: 'Примерно через 2 часа — наш лагерь на альпийских лугах Лори. Хоровац, костёр и звёзды.',
    },
  },
];

/* ----------------------------------------------------------------------------
 * 6. GALLERY (put files in /public/gallery/ and set image / video)
 * -------------------------------------------------------------------------- */
export interface GalleryItem {
  image: string;
  /** Optional short looping clip (mp4/webm), plays muted. */
  video: string;
  tone: 'mud' | 'river' | 'fire' | 'sunrise' | 'quest' | 'meadow' | 'food' | 'stars';
  caption: L;
}
export const GALLERY: GalleryItem[] = [
  { image: '', video: '', tone: 'mud', caption: { hy: 'Ջիպը ցեխի մեջ', en: 'Jeep in the mud', ru: 'Джип в грязи' } },
  { image: '', video: '', tone: 'river', caption: { hy: 'Գետանցում', en: 'River crossing', ru: 'Брод через реку' } },
  { image: '', video: '', tone: 'quest', caption: { hy: 'Քվեստի պահեր', en: 'Quest moments', ru: 'Моменты квеста' } },
  { image: '', video: '', tone: 'meadow', caption: { hy: 'Ալպյան մարգագետիններ', en: 'Alpine meadows', ru: 'Альпийские луга' } },
  { image: '', video: '', tone: 'food', caption: { hy: 'Խորոված ճամբարում', en: 'Khorovats at camp', ru: 'Хоровац в лагере' } },
  { image: '', video: '', tone: 'fire', caption: { hy: 'Խարույկ', en: 'Campfire', ru: 'Костёр' } },
  { image: '', video: '', tone: 'stars', caption: { hy: 'Աստղեր ճամբարի վրա', en: 'Stars over the camp', ru: 'Звёзды над лагерем' } },
  { image: '', video: '', tone: 'sunrise', caption: { hy: 'Արևածագ լեռներում', en: 'Sunrise in the mountains', ru: 'Рассвет в горах' } },
];

/* ----------------------------------------------------------------------------
 * 7. REVIEWS — add ONLY real reviews here. Empty list = "coming soon" cards.
 * -------------------------------------------------------------------------- */
export const REVIEWS: { name: string; city: L; text: L; date: string }[] = [
  // { name: 'Anna', city: { hy: 'Երևան', en: 'Yerevan', ru: 'Ереван' }, text: { hy: '…', en: '…', ru: '…' }, date: '2027-05' },
];

/* ----------------------------------------------------------------------------
 * 8. TEXTS (all sections)
 * -------------------------------------------------------------------------- */
export const T = {
  meta: {
    title: {
      hy: 'Weekend Extreme — ջիպ-արշավներ Տավուշից Լոռի | Ճամբար, քվեստ, աստղեր',
      en: 'Weekend Extreme — Off-road jeep expeditions in Armenia | Camp, Quest, Stars',
      ru: 'Weekend Extreme — джип-экспедиции по Армении | Лагерь, квест, звёзды',
    },
    description: {
      hy: '2–3 օրանոց off-road արշավ ՈՒԱԶ և Նիվա ջիպերով՝ Կոթի գյուղից (Տավուշ) մինչև Լոռու ալպյան ճամբար։ Քվեստ խաղ, խորոված, խարույկ, աստղեր։ 15 000 դրամից։',
      en: '2–3 day off-road expedition by UAZ & Niva jeeps from Koti village (Tavush) to an alpine camp in Lori. Quest game, khorovats, campfire, stars. From 15 000 AMD.',
      ru: 'Off-road экспедиция на 2–3 дня на УАЗ и Нивах из села Коти (Тавуш) в альпийский лагерь в Лори. Квест, хоровац, костёр, звёзды. От 15 000 драм.',
    },
  },

  nav: {
    route: { hy: 'Երթուղի', en: 'Route', ru: 'Маршрут' },
    program: { hy: 'Ծրագիր', en: 'Program', ru: 'Программа' },
    quest: { hy: 'Քվեստ', en: 'Quest', ru: 'Квест' },
    camp: { hy: 'Ճամբար', en: 'Camp', ru: 'Лагерь' },
    prices: { hy: 'Գներ', en: 'Prices', ru: 'Цены' },
    dates: { hy: 'Ամսաթվեր', en: 'Dates', ru: 'Даты' },
    faq: { hy: 'Հարցեր', en: 'FAQ', ru: 'Вопросы' },
    book: { hy: 'Ամրագրել', en: 'Book now', ru: 'Забронировать' },
    menu: { hy: 'Մենյու', en: 'Menu', ru: 'Меню' },
    close: { hy: 'Փակել', en: 'Close', ru: 'Закрыть' },
    sound: { hy: 'Բնության ձայներ', en: 'Ambient sound', ru: 'Звуки природы' },
    language: { hy: 'Լեզու', en: 'Language', ru: 'Язык' },
  },

  loader: {
    text: { hy: 'Տաքացնում ենք շարժիչները…', en: 'Warming up the engines…', ru: 'Прогреваем моторы…' },
  },

  hero: {
    eyebrow: { hy: 'Ջիպ-արշավներ · Տավուշ → Լոռի', en: 'Off-road jeep expeditions · Tavush → Lori', ru: 'Джип-экспедиции · Тавуш → Лори' },
    tagline: {
      hy: 'Ջիպեր, լեռներ, աստղեր. քո ամենաէքստրիմ շաբաթ-կիրակին',
      en: 'Jeeps. Mountains. Stars. Your most extreme weekend.',
      ru: 'Джипы. Горы. Звёзды. Твои самые экстремальные выходные.',
    },
    book: { hy: 'Ամրագրել տեղ', en: 'Book now', ru: 'Забронировать место' },
    route: { hy: 'Տեսնել երթուղին', en: 'See the route', ru: 'Смотреть маршрут' },
    badges: [
      { hy: '2 կամ 3 օր', en: '2 or 3 days', ru: '2 или 3 дня' },
      { hy: 'Մեկնարկ՝ Կոթի գյուղ', en: 'Start: Koti village', ru: 'Старт: село Коти' },
      { hy: '~2 ժ իսկական off-road՝ ՈՒԱԶ / Նիվա', en: '~2 h real off-road by UAZ / Niva', ru: '~2 ч настоящего off-road на УАЗ / Ниве' },
      { hy: 'Քվեստ խաղ + ճամբար', en: 'Quest game + Camp', ru: 'Квест + лагерь' },
    ],
    from: { hy: 'սկսած', en: 'from', ru: 'от' },
    scroll: { hy: 'Ոլորիր ներքև՝ ճանապարհ ընկնելու համար', en: 'Scroll to start the drive', ru: 'Листай вниз, чтобы поехать' },
    hudTitle: { hy: 'Կոթի → Ճամբար', en: 'Koti → Camp', ru: 'Коти → Лагерь' },
    engineSound: { hy: 'Շարժիչի ձայն', en: 'Engine sound', ru: 'Звук моторов' },
    hudTime: { hy: 'ճանապարհին', en: 'on the road', ru: 'в пути' },
    hudAlt: { hy: 'բարձրություն', en: 'altitude', ru: 'высота' },
    min: { hy: 'ր', en: 'min', ru: 'мин' },
    hour: { hy: 'ժ', en: 'h', ru: 'ч' },
  },

  why: {
    eyebrow: { hy: 'Ինչու մենք', en: 'Why us', ru: 'Почему мы' },
    title: { hy: 'Ինչու Weekend Extreme', en: 'Why Weekend Extreme', ru: 'Почему Weekend Extreme' },
    cards: [
      {
        title: { hy: 'Իսկական off-road արշավ', en: 'Real off-road expedition', ru: 'Настоящая off-road экспедиция' },
        text: {
          hy: 'Յուրաքանչյուր խումբ մեկնարկում է Կոթի գյուղից և ՈՒԱԶ ու Նիվա ջիպերով մոտ 2 ժամ իսկական արտաճանապարհային երթ է անցնում անտառներով ու լեռներով մինչև մեր ճամբար։',
          en: 'Every group starts in Koti village and drives ~2 hours of real off-road by UAZ / Niva jeeps through forests and mountains to our camp.',
          ru: 'Каждая группа стартует из села Коти и около 2 часов едет по настоящему бездорожью на УАЗ и Нивах через леса и горы до нашего лагеря.',
        },
      },
      {
        title: { hy: 'Քվեստ խաղ', en: 'Quest game', ru: 'Квест-игра' },
        text: {
          hy: 'Յուրաքանչյուր ջիպ մեկ թիմ է՝ հանելուկներ, վիկտորինա և GPS գանձի որոնում ճանապարհին։ Հաղթողները ստանում են զեղչային քարտ։',
          en: 'Every jeep is a team — riddles, quiz and a GPS treasure hunt on the way. Winners get a discount card.',
          ru: 'Каждый джип — команда: загадки, викторина и GPS-поиск сокровищ по пути. Победители получают скидочную карту.',
        },
      },
      {
        title: { hy: 'Լեռնային ճամբար', en: 'Mountain camp', ru: 'Горный лагерь' },
        text: {
          hy: 'Գիշեր Լոռու ալպյան մարգագետիններում՝ խարույկ, խորոված և աստղեր։',
          en: 'A night in the alpine meadows of Lori — campfire, khorovats and stars.',
          ru: 'Ночь на альпийских лугах Лори — костёр, хоровац и звёзды.',
        },
      },
      {
        title: { hy: 'Բոլորի համար', en: 'For everyone', ru: 'Для всех' },
        text: {
          hy: 'Խմբի նվազագույն չափ չկա, տարիքային սահմանափակում չկա, գիդերը խոսում են հայերեն, ռուսերեն և անգլերեն։',
          en: 'No minimum group size, no age limit, guides speak Armenian, Russian and English.',
          ru: 'Нет минимального размера группы, нет ограничений по возрасту, гиды говорят на армянском, русском и английском.',
        },
      },
    ],
  },

  numbers: {
    eyebrow: { hy: 'Թվերով', en: 'In numbers', ru: 'В цифрах' },
    title: { hy: 'Արշավը թվերով', en: 'The expedition in numbers', ru: 'Экспедиция в цифрах' },
  },

  route: {
    eyebrow: { hy: 'Երթուղի և քարտեզ', en: 'Route & map', ru: 'Маршрут и карта' },
    title: { hy: 'Կոթիից մինչև ամպեր', en: 'From Koti to the clouds', ru: 'Из Коти — до облаков' },
    lead: {
      hy: 'Ջիպային երթուղին միշտ սկսվում է Կոթի գյուղից (Տավուշ)՝ բոլոր խմբերի համար։ Կոթի → անտառներ և լեռնային ճանապարհներ → ալպյան մարգագետիններ → ճամբար Լոռու ալպյան մարգագետիններում, ~2 ժամ 4x4-ով։',
      en: 'The jeep route always starts in Koti village (Tavush) — for every group. Koti → forests & mountain roads → alpine meadows → our camp in the alpine meadows of Lori, ~2 h by 4x4.',
      ru: 'Джип-маршрут всегда начинается в селе Коти (Тавуш) — для всех групп. Коти → леса и горные дороги → альпийские луга → лагерь на альпийских лугах Лори, ~2 ч на 4x4.',
    },
    why: {
      hy: 'Ճանապարհը երկար է, դրա համար էլ սա 2–3 օրանոց արշավ է՝ գիշերակացով լեռներում, և ոչ թե հոգնեցնող մեկօրյա տուր։',
      en: 'The road is long — that’s why this is a 2–3 day expedition with nights in the mountains, not a tiring day trip.',
      ru: 'Дорога длинная — поэтому это экспедиция на 2–3 дня с ночёвкой в горах, а не утомительная однодневная поездка.',
    },
    mapHint: { hy: 'Սեղմիր ստուգակետերի վրա', en: 'Tap the checkpoints', ru: 'Нажимай на чекпоинты' },
    schematic: { hy: 'Սխեմատիկ քարտեզ', en: 'Schematic map', ru: 'Схематичная карта' },
    openMap: { hy: 'Ճամբարը Google Maps-ում', en: 'Camp on Google Maps', ru: 'Лагерь на Google Maps' },
    altitude: { hy: 'Բարձրություն', en: 'Altitude', ru: 'Высота' },
    m: { hy: 'մ', en: 'm', ru: 'м' },
    getThere: { hy: 'Ինչպես հասնել Կոթի', en: 'How to get to Koti', ru: 'Как добраться до Коти' },
    options: [
      {
        id: 'minivan',
        title: { hy: 'Մեր միկրոավտոբուսով Երևանից', en: 'Our minivan from Yerevan', ru: 'Наш минивэн из Еревана' },
        text: {
          hy: 'Մեկնում՝ ժամը 06:00-ին, ճանապարհը՝ ~3 ժամ։ Հավաքատեղին կուղարկենք ամրագրումից հետո։',
          en: 'Departure at 06:00, ~3 h drive. We send you the meeting point after booking.',
          ru: 'Отправление в 06:00, ~3 ч в пути. Место встречи пришлём после бронирования.',
        },
        price: '2day' as PackageId,
      },
      {
        id: 'car',
        title: { hy: 'Ձեր մեքենայով մինչև Կոթի', en: 'Your own car to Koti', ru: 'На своей машине до Коти' },
        text: {
          hy: 'Գալիս եք ձեր մեքենայով, թողնում այն Կոթիում և նստում մեր ջիպերը։',
          en: 'Drive to Koti yourself, park in the village and switch to our jeeps.',
          ru: 'Доезжаете до Коти сами, оставляете машину в селе и пересаживаетесь в наши джипы.',
        },
        price: 'owncar' as PackageId,
      },
      {
        id: 'selfdrive',
        title: { hy: 'Ձեր 4x4-ով մինչև ճամբար', en: 'Your own 4x4 to the camp', ru: 'На своём 4x4 до лагеря' },
        text: {
          hy: 'Self-Drive․ ամբողջ երթուղին անցնում եք ձեր ամենագնացով՝ հետևելով մեր ուղեկցող ջիպին։',
          en: 'Self-Drive: drive the whole route in your own 4x4, following our guide jeep.',
          ru: 'Self-Drive: весь маршрут на своём внедорожнике за нашим джипом-проводником.',
        },
        price: 'selfdrive' as PackageId,
      },
      {
        id: 'tbilisi',
        title: { hy: 'Թբիլիսիից', en: 'From Tbilisi', ru: 'Из Тбилиси' },
        // @placeholder — transfer time Tbilisi → Koti
        text: {
          hy: 'Տրանսֆեր Թբիլիսի → սահման → Կոթի, ճանապարհը՝ ~2 ժամ։ Անհրաժեշտ է անձնագիր։',
          en: 'Transfer Tbilisi → border → Koti, ~2 h. Passport required.',
          ru: 'Трансфер Тбилиси → граница → Коти, ~2 ч. Нужен паспорт.',
        },
        price: 'tbilisi' as PackageId,
      },
    ],
    // @placeholder — say "the same" or "a different" mountain road if you want to be specific
    returnText: {
      hy: 'Վերադարձ․ վերջին օրը ջիպերը լեռնային ճանապարհով ճամբարից ետ են բերում Կոթի (~2 ժամ)։',
      en: 'Return: on the last day the jeeps drive you back from the camp to Koti over the mountains (~2 h).',
      ru: 'Обратно: в последний день джипы везут вас из лагеря в Коти по горной дороге (~2 ч).',
    },
  },

  itinerary: {
    eyebrow: { hy: 'Ծրագիր', en: 'Itinerary', ru: 'Программа' },
    title: { hy: 'Ժամ առ ժամ', en: 'Hour by hour', ru: 'Час за часом' },
    tab2: { hy: '2 օր', en: '2 days', ru: '2 дня' },
    tab3: { hy: '3 օր', en: '3 days', ru: '3 дня' },
    day: { hy: 'Օր', en: 'Day', ru: 'День' },
    day1: [
      // @placeholder — exact meeting point in Yerevan
      { time: '06:00', icon: 'bus', title: { hy: 'Մեկնում Երևանից', en: 'Departure from Yerevan', ru: 'Отправление из Еревана' }, text: { hy: 'Միկրոավտոբուսով։ Հավաքատեղին կուղարկենք ամրագրումից հետո։', en: 'By minivan. Meeting point is sent after booking.', ru: 'На минивэне. Место встречи пришлём после бронирования.' } },
      { time: '~09:00', icon: 'flag', title: { hy: 'Ժամանում Կոթի', en: 'Arrival in Koti', ru: 'Прибытие в Коти' }, text: { hy: 'Ծանոթություն վարորդների հետ, անվտանգության ճեպազրույց, թիմերի ձևավորում (յուրաքանչյուր ջիպ՝ մեկ թիմ)։', en: 'Meet the drivers, safety briefing, teams formed (each jeep = one team).', ru: 'Знакомство с водителями, инструктаж по безопасности, формирование команд (каждый джип — команда).' } },
      { time: '~09:30', icon: 'jeep', hot: true, title: { hy: 'Off-road երթ Կոթի → Ճամբար (~2 ժ)', en: 'Off-road drive Koti → Camp (~2 h)', ru: 'Off-road заезд Коти → Лагерь (~2 ч)' }, text: { hy: '+ Քվեստի 1-ին մաս՝ հանելուկներ, վիկտորինա, GPS գանձ։', en: '+ Quest part 1: riddles, quiz, GPS treasure.', ru: '+ Квест, часть 1: загадки, викторина, GPS-клад.' } },
      { time: '~11:30', icon: 'tent', title: { hy: 'Ժամանում ճամբար', en: 'Arrival at camp', ru: 'Прибытие в лагерь' }, text: { hy: 'Տեղավորում և ճաշ։', en: 'Settle in and lunch.', ru: 'Заселение и обед.' } },
      { time: { hy: 'Կեսօրից հետո', en: 'Afternoon', ru: 'После обеда' }, icon: 'hike', title: { hy: 'Զբոսանք դիտակետեր', en: 'Walks to viewpoints', ru: 'Прогулки к смотровым точкам' }, text: { hy: 'Ձիավարություն՝ ըստ ցանկության։', en: 'Horse riding (optional).', ru: 'Конная прогулка — по желанию.' } },
      { time: { hy: 'Երեկոյան', en: 'Evening', ru: 'Вечер' }, icon: 'fire', hot: true, title: { hy: 'Խորոված, խարույկ', en: 'Khorovats dinner & campfire', ru: 'Ужин с хоровацем, костёр' }, text: { hy: 'Քվեստի արդյունքներ և պարգևատրում։', en: 'Quest results + awards.', ru: 'Итоги квеста и награждение.' } },
      { time: { hy: 'Գիշերը', en: 'Night', ru: 'Ночь' }, icon: 'star', title: { hy: 'Աստղադիտում', en: 'Stargazing', ru: 'Наблюдение за звёздами' }, text: { hy: 'Լեռներում աստղերն ավելի մոտ են։', en: 'Stars are closer in the mountains.', ru: 'В горах звёзды ближе.' } },
    ],
    // Extra full day at camp — ONLY in the 3-day tour. @placeholder — confirm the program
    dayExtra: [
      { time: { hy: 'Առավոտյան', en: 'Morning', ru: 'Утро' }, icon: 'sunrise', title: { hy: 'Արևածագ և նախաճաշ', en: 'Sunrise & breakfast', ru: 'Рассвет и завтрак' }, text: { hy: 'Դանդաղ առավոտ լեռներում։', en: 'A slow morning in the mountains.', ru: 'Неспешное утро в горах.' } },
      { time: '~10:00', icon: 'hike', title: { hy: 'Երկար արշավ դիտակետեր', en: 'Long hike to viewpoints', ru: 'Длинный поход к смотровым точкам' }, text: { hy: 'Ալպյան մարգագետիններով՝ գիդի հետ։', en: 'Across the alpine meadows with a guide.', ru: 'По альпийским лугам с гидом.' } },
      { time: { hy: 'Կեսօրից հետո', en: 'Afternoon', ru: 'После обеда' }, icon: 'horse', title: { hy: 'Ձիավարություն', en: 'Horse riding', ru: 'Конная прогулка' }, text: { hy: 'Ըստ ցանկության։', en: 'Optional.', ru: 'По желанию.' } },
      { time: '~17:00', icon: 'puzzle', hot: true, title: { hy: 'Քվեստի լրացուցիչ փուլ', en: 'Extra Quest stage', ru: 'Дополнительный этап квеста' }, text: { hy: 'Նոր հանելուկներ և թաքնված արկղեր։', en: 'New riddles and hidden boxes.', ru: 'Новые загадки и спрятанные ящики.' } },
      { time: { hy: 'Երեկոյան', en: 'Evening', ru: 'Вечер' }, icon: 'fire', title: { hy: 'Խարույկ և աստղեր', en: 'Campfire & stars', ru: 'Костёр и звёзды' }, text: { hy: 'Երկրորդ գիշերը ճամբարում։', en: 'Second night at the camp.', ru: 'Вторая ночь в лагере.' } },
    ],
    dayLast: [
      { time: { hy: 'Արևածագ', en: 'Sunrise', ru: 'Рассвет' }, icon: 'sunrise', title: { hy: 'Արևածագ, նախաճաշ', en: 'Sunrise, breakfast', ru: 'Рассвет, завтрак' }, text: { hy: 'Սուրճ ամպերից վեր։', en: 'Coffee above the clouds.', ru: 'Кофе над облаками.' } },
      { time: { hy: 'Առավոտյան', en: 'Morning', ru: 'Утро' }, icon: 'trophy', hot: true, title: { hy: 'Քվեստի եզրափակիչ', en: 'Quest final', ru: 'Финал квеста' }, text: { hy: 'Ո՞ր թիմը կստանա զեղչային քարտը։', en: 'Which team takes the discount card?', ru: 'Какая команда получит скидочную карту?' } },
      { time: '~12:00', icon: 'jeep', title: { hy: 'Ջիպերով ետ՝ Ճամբար → Կոթի (~2 ժ)', en: 'Jeeps back Camp → Koti (~2 h)', ru: 'На джипах обратно: Лагерь → Коти (~2 ч)' }, text: { hy: 'Եվս մեկ անգամ off-road։', en: 'One more round of off-road.', ru: 'Ещё одна порция бездорожья.' } },
      { time: '~14:00', icon: 'food', title: { hy: 'Ճաշ Կոթիում', en: 'Lunch in Koti', ru: 'Обед в Коти' }, text: { hy: 'Գյուղական սեղան։', en: 'Village-style table.', ru: 'Деревенский стол.' } },
      { time: '~14:30', icon: 'bus', title: { hy: 'Միկրոավտոբուսով Երևան', en: 'Minivan to Yerevan', ru: 'Минивэн в Ереван' }, text: { hy: 'Ժամանում՝ ~17:30։', en: 'Arrival ~17:30.', ru: 'Прибытие ~17:30.' } },
    ],
  },

  quest: {
    eyebrow: { hy: 'Խաղ', en: 'The game', ru: 'Игра' },
    title: { hy: 'Քվեստ', en: 'The Quest', ru: 'Квест' },
    lead: {
      hy: 'Ճանապարհը դառնում է խաղ։ Յուրաքանչյուր ջիպ թիմ է, յուրաքանչյուր ստուգակետ՝ նոր առաջադրանք։',
      en: 'The road becomes a game. Every jeep is a team, every checkpoint a new challenge.',
      ru: 'Дорога превращается в игру. Каждый джип — команда, каждый чекпоинт — новое задание.',
    },
    rules: [
      { icon: 'flag', title: { hy: 'Ջիպ = թիմ', en: 'Jeep = team', ru: 'Джип = команда' }, text: { hy: 'Յուրաքանչյուր ջիպ մեկ թիմ է՝ իր անունով և դրոշով։', en: 'Each jeep is one team with its own name and flag.', ru: 'Каждый джип — одна команда со своим названием и флагом.' } },
      { icon: 'gps', title: { hy: 'Հանելուկներ + GPS գանձ', en: 'Riddles + GPS treasure', ru: 'Загадки + GPS-клад' }, text: { hy: 'Հանելուկներ և վիկտորինա, ինչպես նաև կոորդինատներով թաքնված արկղերի որոնում։', en: 'Riddles & quiz plus a GPS treasure hunt — hidden boxes with coordinates.', ru: 'Загадки и викторина плюс GPS-поиск — спрятанные ящики по координатам.' } },
      { icon: 'book', title: { hy: 'Թեմաներ', en: 'Topics', ru: 'Темы' }, text: { hy: 'Զվարճալի ընդհանուր գիտելիքներ · տարածաշրջանի բնությունը, կենդանիներն ու բույսերը · Հրանտ Մաթևոսյան և հայ գրականություն (նա ծնվել է մոտակա Ահնիձոր գյուղում)։', en: 'Fun general knowledge · nature, animals & plants of the region · Hrant Matevosyan & Armenian literature (he was born in nearby Ahnidzor).', ru: 'Весёлая эрудиция · природа, животные и растения края · Грант Матевосян и армянская литература (он родился в соседнем Ахнидзоре).' } },
      { icon: 'trophy', title: { hy: 'Միավորներ և մրցանակ', en: 'Points & prize', ru: 'Очки и приз' }, text: { hy: 'Միավորների աղյուսակ․ հաղթող թիմը ստանում է Weekend Extreme զեղչային քարտ հաջորդ տուրերի համար՝ {discount}% զեղչով։', en: 'A points table — the winning team gets a Weekend Extreme discount card: {discount}% off the next tours.', ru: 'Таблица очков — команда-победитель получает скидочную карту Weekend Extreme: {discount}% на следующие туры.' } },
      { icon: 'medal', title: { hy: 'Սեզոնային լիգա', en: 'Season League', ru: 'Лига сезона' }, text: { hy: 'Առաջին իսկ սեզոնից թիմերի միավորները կուտակվում են բոլոր տուրերում → մեծ եզրափակիչ սեզոնի վերջում ({final})։', en: 'From the very first season, team points add up across all tours → grand final at the end of the season ({final}).', ru: 'С первого же сезона очки команд суммируются по всем турам → гранд-финал в конце сезона ({final}).' } },
    ],
    kidsNote: {
      hy: 'Փոքր երեխաներով ընտանիքները մասնակցում են հանգիստ ռեժիմում՝ առանց ծանր առաջադրանքների։',
      en: 'Families with small kids can take part in a relaxed way — no hard tasks.',
      ru: 'Семьи с маленькими детьми участвуют в спокойном режиме — без сложных заданий.',
    },
    tableTitle: { hy: 'Միավորների աղյուսակ', en: 'Points table', ru: 'Таблица очков' },
    tableExample: { hy: 'օրինակ', en: 'example', ru: 'пример' },
    teamsExample: [
      { flag: '🦅', name: { hy: 'Արծիվներ', en: 'Eagles', ru: 'Орлы' }, pts: 42 },
      { flag: '🐻', name: { hy: 'Արջեր', en: 'Bears', ru: 'Медведи' }, pts: 37 },
      { flag: '🐺', name: { hy: 'Գայլեր', en: 'Wolves', ru: 'Волки' }, pts: 31 },
    ],
    pts: { hy: 'միավոր', en: 'pts', ru: 'очк.' },
    league: { hy: 'Սեզոն', en: 'Season', ru: 'Сезон' },
    final: { hy: 'Եզրափակիչ', en: 'Grand final', ru: 'Гранд-финал' },
    cardsTitle: { hy: 'Փորձիր հիմա', en: 'Try one now', ru: 'Попробуй сейчас' },
    flipHint: { hy: 'Մատնանշիր կամ հպիր քարտին՝ պատասխանը տեսնելու համար', en: 'Hover or tap a card to see the answer', ru: 'Наведи или нажми на карточку, чтобы увидеть ответ' },
    answer: { hy: 'Պատասխան', en: 'Answer', ru: 'Ответ' },
    riddles: [
      {
        topic: { hy: 'Գրականություն', en: 'Literature', ru: 'Литература' },
        q: {
          hy: 'Հրանտ Մաթևոսյանի ո՞ր վիպակը՝ հովիվների և «կորած» ոչխարի մասին, 1969 թվականին դարձավ հայտնի ֆիլմ։',
          en: 'Which novella by Hrant Matevosyan — about shepherds and a “lost” sheep — became a famous film in 1969?',
          ru: 'Какая повесть Гранта Матевосяна — о пастухах и «потерянной» овце — в 1969 году стала знаменитым фильмом?',
        },
        a: { hy: '«Մենք ենք, մեր սարերը»', en: '“We and Our Mountains”', ru: '«Мы и наши горы»' },
      },
      {
        topic: { hy: 'Բնություն', en: 'Nature', ru: 'Природа' },
        q: {
          hy: 'Գլխարկ ունեմ, բայց գլուխ՝ ոչ, մեկ ոտք ունեմ, բայց կոշիկ՝ ոչ։ Անձրևից հետո ինձ կգտնես անտառում։',
          en: 'I have a cap but no head, one leg but no shoe. After the rain you’ll find me in the forest.',
          ru: 'У меня есть шляпка, но нет головы, есть ножка, но нет ботинка. После дождя ищи меня в лесу.',
        },
        a: { hy: 'Սունկ 🍄', en: 'A mushroom 🍄', ru: 'Гриб 🍄' },
      },
      {
        topic: { hy: 'Ընդհանուր գիտելիք', en: 'General knowledge', ru: 'Эрудиция' },
        q: {
          hy: 'Ո՞րն է Հայաստանի ամենաբարձր լեռը և քանի՞ մետր է նրա բարձրությունը։',
          en: 'What is the highest mountain in Armenia, and how high is it?',
          ru: 'Какая гора самая высокая в Армении и какова её высота?',
        },
        a: { hy: 'Արագած՝ 4090 մ', en: 'Aragats — 4,090 m', ru: 'Арагац — 4090 м' },
      },
      {
        topic: { hy: 'GPS գանձ', en: 'GPS treasure', ru: 'GPS-клад' },
        q: {
          hy: 'N 41°0X′ · E 44°4X′ — «Որտեղ հին ճանապարհը թեքվում է, նայիր արջի նման քարի տակ»։',
          en: 'N 41°0X′ · E 44°4X′ — “Where the old road bends, look under the stone shaped like a bear.”',
          ru: 'N 41°0X′ · E 44°4X′ — «Где старая дорога сворачивает, загляни под камень, похожий на медведя».',
        },
        a: {
          hy: 'Իսկական կոորդինատները կստանաք արշավի ժամանակ 😉',
          en: 'You’ll get the real coordinates on the tour 😉',
          ru: 'Настоящие координаты получите в экспедиции 😉',
        },
      },
    ],
  },

  camp: {
    eyebrow: { hy: 'Ճամբար', en: 'The camp', ru: 'Лагерь' },
    title: { hy: 'Գիշերը ամպերից վեր', en: 'A night above the clouds', ru: 'Ночь над облаками' },
    lead: {
      hy: 'Մշտական ճամբար վարձակալած հողատարածքում՝ Լոռու ալպյան մարգագետիններում։',
      en: 'A permanent camp on rented land in the alpine meadows of Lori.',
      ru: 'Постоянный лагерь на арендованной земле среди альпийских лугов Лори.',
    },
    day: { hy: 'Օր', en: 'Day', ru: 'День' },
    night: { hy: 'Գիշեր', en: 'Night', ru: 'Ночь' },
    facilitiesTitle: { hy: 'Հարմարություններ', en: 'Facilities', ru: 'Удобства' },
    facilities: [
      { icon: 'toilet', label: { hy: 'Զուգարան', en: 'Toilet', ru: 'Туалет' } },
      { icon: 'shower', label: { hy: 'Արևային ցնցուղ', en: 'Solar shower', ru: 'Солнечный душ' } },
      { icon: 'canopy', label: { hy: 'Մեծ ճաշասենյակ-վրան', en: 'Large dining tent', ru: 'Большой шатёр-столовая' } },
      { icon: 'fire', label: { hy: 'Խարույկի տարածք', en: 'Campfire area', ru: 'Место для костра' } },
    ],
    sleepTitle: { hy: 'Քուն', en: 'Sleeping', ru: 'Ночлег' },
    sleepText: {
      hy: 'Ստանդարտ զբոսաշրջային վրաններ։ Բերեք ձեր վրանն ու քնապարկը կամ վարձեք տեղում։',
      en: 'Standard tourist tents. Bring your own tent & sleeping bag — or rent one from us.',
      ru: 'Стандартные туристические палатки. Берите свою палатку и спальник — или арендуйте у нас.',
    },
    rentLabel: { hy: 'Վրան + քնապարկ', en: 'Tent + sleeping bag', ru: 'Палатка + спальник' },
    foodTitle: { hy: 'Սնունդ', en: 'Food', ru: 'Еда' },
    foodText: {
      hy: 'Ամբողջ սնունդը ներառված է․ արագ և համեղ ճամբարային սնունդ՝ սենդվիչներ, լավաշով փաթաթաններ, խորոված, մրգեր, թեյ/սուրճ։ Մասամբ պատրաստում են տեղի գյուղացի ընտանիքները։',
      en: 'All meals included — fast, tasty camp food: sandwiches, lavash wraps, khorovats, fruit, tea/coffee. Partly cooked by local village families.',
      ru: 'Всё питание включено — быстрая и вкусная лагерная еда: сэндвичи, роллы в лаваше, хоровац, фрукты, чай/кофе. Частично готовят местные сельские семьи.',
    },
    alcohol: { hy: 'Ճամբարն առանց ալկոհոլի է', en: 'Alcohol-free camp', ru: 'Лагерь без алкоголя' },
    alcoholText: {
      hy: 'Մաքուր օդ, պարզ գլուխ և վաղ արևածագ։',
      en: 'Fresh air, clear heads and an early sunrise.',
      ru: 'Чистый воздух, ясная голова и ранний рассвет.',
    },
    eveningTitle: { hy: 'Երեկոյան ծրագիր', en: 'Evening program', ru: 'Вечерняя программа' },
    evening: [
      { hy: 'Խորոված', en: 'Khorovats', ru: 'Хоровац' },
      { hy: 'Խարույկ', en: 'Campfire', ru: 'Костёр' },
      { hy: 'Աստղադիտում', en: 'Stargazing', ru: 'Звёзды' },
      { hy: 'Քվեստի պարգևատրում', en: 'Quest awards', ru: 'Награждение квеста' },
    ],
  },

  packages: {
    eyebrow: { hy: 'Փաթեթներ և գներ', en: 'Packages & prices', ru: 'Пакеты и цены' },
    title: { hy: 'Ընտրիր քո արշավը', en: 'Pick your expedition', ru: 'Выбери свою экспедицию' },
    popular: { hy: 'Ամենահայտնի', en: 'Most popular', ru: 'Самый популярный' },
    perPerson: { hy: 'մեկ անձի համար', en: 'per person', ru: 'с человека' },
    onRequest: { hy: 'Գինը՝ ըստ հարցման', en: 'Price on request', ru: 'Цена по запросу' },
    choose: { hy: 'Ընտրել', en: 'Choose', ru: 'Выбрать' },
    addonsTitle: { hy: 'Լրացուցիչ', en: 'Add-ons', ru: 'Дополнительно' },
    unit: {
      person: { hy: '/ անձ', en: '/ person', ru: '/ чел.' },
      set: { hy: '/ հավաքածու', en: '/ set', ru: '/ комплект' },
      group: { hy: '/ խումբ', en: '/ group', ru: '/ группа' },
    },
    calcTitle: { hy: 'Գնի հաշվիչ', en: 'Price calculator', ru: 'Калькулятор цены' },
    calcPackage: { hy: 'Փաթեթ', en: 'Package', ru: 'Пакет' },
    calcPeople: { hy: 'Մարդկանց թիվը', en: 'People', ru: 'Количество человек' },
    calcAddons: { hy: 'Լրացուցիչ ծառայություններ', en: 'Add-ons', ru: 'Доп. услуги' },
    total: { hy: 'Ընդամենը', en: 'Total', ru: 'Итого' },
    deposit: { hy: 'Կանխավճար ({p}%)', en: 'Deposit ({p}%)', ru: 'Предоплата ({p}%)' },
    rest: { hy: 'Մնացածը՝ տուրի օրը', en: 'Rest on the tour day', ru: 'Остаток — в день тура' },
    calcOnRequest: {
      hy: 'Այս փաթեթի գինը ճշտում ենք անհատապես․ գրեք մեզ, և կհաշվարկենք։',
      en: 'We quote this package individually — message us and we’ll calculate it.',
      ru: 'Цену этого пакета считаем индивидуально — напишите нам, и мы рассчитаем.',
    },
    bookThis: { hy: 'Ամրագրել այս տարբերակը', en: 'Book these options', ru: 'Забронировать с этими опциями' },
    sets: { hy: 'հավաքածու', en: 'sets', ru: 'компл.' },
    persons: { hy: 'անձ', en: 'people', ru: 'чел.' },
  },

  included: {
    eyebrow: { hy: 'Ինչ է ներառված', en: 'What’s included', ru: 'Что включено' },
    title: { hy: 'Ներառված է / ներառված չէ', en: 'Included / not included', ru: 'Включено / не включено' },
    yesTitle: { hy: 'Ներառված է', en: 'Included', ru: 'Включено' },
    noTitle: { hy: 'Ներառված չէ', en: 'Not included', ru: 'Не включено' },
    yes: [
      { hy: 'Տրանսպորտ (ըստ փաթեթի)', en: 'Transport (by package)', ru: 'Транспорт (по пакету)' },
      { hy: 'ՈՒԱԶ/Նիվա ջիպեր՝ փորձառու տեղացի վարորդներով', en: 'UAZ/Niva jeeps with experienced local drivers', ru: 'Джипы УАЗ/Нива с опытными местными водителями' },
      { hy: 'Գիդ (հայ/ռուս/անգլ)', en: 'Guide (HY/RU/EN)', ru: 'Гид (АРМ/РУС/АНГЛ)' },
      { hy: 'Ամբողջ սնունդը, թեյ և ջուր', en: 'All meals, tea & water', ru: 'Всё питание, чай и вода' },
      { hy: 'Քվեստ խաղ և մրցանակներ', en: 'Quest game & prizes', ru: 'Квест и призы' },
      { hy: 'Ճամբար՝ զուգարան, արևային ցնցուղ, ճաշասենյակ-վրան', en: 'Camp with toilet, solar shower, dining tent', ru: 'Лагерь: туалет, солнечный душ, шатёр-столовая' },
      { hy: 'Հիմնական լուսանկարներ (անվճար)', en: 'Basic photos (free)', ru: 'Базовые фото (бесплатно)' },
      { hy: 'Ապահովագրություն', en: 'Insurance', ru: 'Страховка' },
      { hy: 'Առաջին օգնության դեղատուփ յուրաքանչյուր ջիպում', en: 'First-aid kit in every jeep', ru: 'Аптечка в каждом джипе' },
      { hy: 'Ռադիոկապ ջիպերի միջև', en: 'Radio between jeeps', ru: 'Рация между джипами' },
    ],
    no: [
      { hy: 'Վրան + քնապարկ (բերեք կամ վարձեք՝ 5 000 դր.)', en: 'Tent + sleeping bag (bring or rent for 5 000)', ru: 'Палатка + спальник (свои или аренда за 5 000)' },
      { hy: 'Ձիավարություն', en: 'Horse riding', ru: 'Конная прогулка' },
      { hy: 'Դրոնով տեսանկարահանում', en: 'Drone video', ru: 'Видео с дрона' },
      { hy: 'Անձնական ծախսեր', en: 'Personal expenses', ru: 'Личные расходы' },
    ],
  },

  bring: {
    eyebrow: { hy: 'Ճամպրուկ', en: 'Packing list', ru: 'Список вещей' },
    title: { hy: 'Ինչ վերցնել հետդ', en: 'What to bring', ru: 'Что взять с собой' },
    hint: { hy: 'Նշիր այն, ինչ արդեն պատրաստ է', en: 'Tick what you’ve already packed', ru: 'Отмечай то, что уже собрал' },
    packed: { hy: 'պատրաստ է', en: 'packed', ru: 'собрано' },
    items: [
      { icon: 'jacket', label: { hy: 'Տաք բաճկոն (գիշերները ցուրտ են)', en: 'Warm jacket (cold nights)', ru: 'Тёплая куртка (ночи холодные)' } },
      { icon: 'umbrella', label: { hy: 'Անջրանցիկ բաճկոն', en: 'Rain jacket', ru: 'Дождевик' } },
      { icon: 'shoes', label: { hy: 'Արշավային կոշիկներ', en: 'Hiking shoes', ru: 'Треккинговая обувь' } },
      { icon: 'glasses', label: { hy: 'Գլխարկ և արևային ակնոց', en: 'Hat & sunglasses', ru: 'Головной убор и очки' } },
      { icon: 'sun', label: { hy: 'Արևապաշտպան քսուք', en: 'Sunscreen', ru: 'Солнцезащитный крем' } },
      { icon: 'pill', label: { hy: 'Անձնական դեղորայք', en: 'Personal medicine', ru: 'Личные лекарства' } },
      { icon: 'battery', label: { hy: 'Փաուերբանկ', en: 'Power bank', ru: 'Пауэрбанк' } },
      { icon: 'tent', label: { hy: 'Վրան և քնապարկ (կամ վարձեք)', en: 'Tent & sleeping bag (or rent)', ru: 'Палатка и спальник (или аренда)' } },
      { icon: 'id', label: { hy: 'Անձնագիր / ID (Թբիլիսիի երթուղու համար՝ անձնագիր)', en: 'ID / passport (passport for the Tbilisi route)', ru: 'ID / паспорт (для маршрута из Тбилиси — паспорт)' } },
    ],
  },

  season: {
    eyebrow: { hy: 'Սեզոն և ամսաթվեր', en: 'Season & dates', ru: 'Сезон и даты' },
    title: { hy: 'Ամեն շաբաթ-կիրակի՝ մայիսից հոկտեմբեր', en: 'Every weekend, May to October', ru: 'Каждые выходные — с мая по октябрь' },
    lead: {
      hy: 'Տուրեր՝ ամեն շաբաթ-կիրակի, ինչպես նաև անհատական տուրեր ըստ պահանջի։',
      en: 'Tours every weekend + custom tours on request.',
      ru: 'Туры каждые выходные + индивидуальные туры по запросу.',
    },
    upcoming: { hy: 'Մոտակա մեկնումները', en: 'Upcoming departures', ru: 'Ближайшие выезды' },
    tourDays: { hy: '2 կամ 3 օր', en: '2 or 3 days', ru: '2 или 3 дня' },
    seatsLeft: { hy: 'ազատ տեղ', en: 'seats left', ru: 'мест осталось' },
    full: { hy: 'Տեղեր չկան', en: 'Sold out', ru: 'Мест нет' },
    pick: { hy: 'Ընտրել', en: 'Pick', ru: 'Выбрать' },
    nextSeason: { hy: 'Սեզոնը բացվում է', en: 'Season opens', ru: 'Сезон открывается' },
    noMin: { hy: 'Խմբի նվազագույն չափ չկա', en: 'No minimum group size', ru: 'Нет минимального размера группы' },
    noMinText: { hy: 'Տուրը կայանում է նույնիսկ մեկ ջիպով։', en: 'The tour runs even with one jeep.', ru: 'Тур состоится даже с одним джипом.' },
    weather: { hy: 'Եղանակ', en: 'Weather', ru: 'Погода' },
    weatherText: {
      hy: 'Տուրը չեղարկվում կամ տեղափոխվում է միայն անձրևի դեպքում՝ ամբողջական վերադարձ կամ նոր ամսաթիվ։',
      en: 'A tour is cancelled or moved only in case of rain — full refund or a new date.',
      ru: 'Тур отменяется или переносится только в случае дождя — полный возврат или новая дата.',
    },
    custom: { hy: 'Անհատական տուր', en: 'Custom tour', ru: 'Индивидуальный тур' },
    customText: { hy: 'Ձեր ամսաթվով՝ ընկերների, ընտանիքի կամ թիմի համար։', en: 'On your date — for friends, family or your team.', ru: 'В вашу дату — для друзей, семьи или команды.' },
    weekdays: {
      hy: ['Կիր', 'Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուրբ', 'Շբթ'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    },
    months: {
      hy: ['հունվար', 'փետրվար', 'մարտ', 'ապրիլ', 'մայիս', 'հունիս', 'հուլիս', 'օգոստոս', 'սեպտեմբեր', 'հոկտեմբեր', 'նոյեմբեր', 'դեկտեմբեր'],
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    },
    monthsShort: {
      hy: ['Հնվ', 'Փտր', 'Մրտ', 'Ապր', 'Մյս', 'Հնս', 'Հլս', 'Օգս', 'Սպտ', 'Հկտ', 'Նյմ', 'Դկտ'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    },
  },

  families: {
    eyebrow: { hy: 'Երեխաներ և ընտանիքներ', en: 'Kids & families', ru: 'Дети и семьи' },
    title: { hy: 'Տարիքային սահմանափակում չկա', en: 'No age limit', ru: 'Без ограничений по возрасту' },
    text: {
      hy: 'Նորածիններով և փոքր երեխաներով ընտանիքները սպասված են։ Նրանք մասնակցում են հանգիստ, պասիվ ռեժիմով՝ առանց ծանր ակտիվությունների։',
      en: 'Families with babies and small kids are welcome. They join in a relaxed, passive way — no hard activities.',
      ru: 'Семьи с малышами и маленькими детьми — всегда желанные гости. Они участвуют в спокойном, пассивном режиме — без тяжёлых активностей.',
    },
    points: [
      { hy: 'Մեղմ տեմպ և կանգառներ', en: 'Gentle pace & stops', ru: 'Спокойный темп и остановки' },
      { hy: 'Քվեստ՝ հանգիստ ռեժիմով', en: 'Quest in relaxed mode', ru: 'Квест в спокойном режиме' },
      { hy: 'Մաքուր օդ և աստղեր', en: 'Fresh air & stars', ru: 'Свежий воздух и звёзды' },
    ],
  },

  safety: {
    eyebrow: { hy: 'Անվտանգություն', en: 'Safety', ru: 'Безопасность' },
    title: { hy: 'Էքստրիմ, բայց անվտանգ', en: 'Extreme, but safe', ru: 'Экстрим, но безопасно' },
    items: [
      { icon: 'driver', title: { hy: 'Փորձառու վարորդներ', en: 'Experienced drivers', ru: 'Опытные водители' }, text: { hy: 'Տեղացի off-road վարորդներ, որոնք գիտեն ամեն շրջադարձ։', en: 'Local off-road drivers who know every bend.', ru: 'Местные off-road водители, знающие каждый поворот.' } },
      { icon: 'firstaid', title: { hy: 'Դեղատուփ', en: 'First-aid kit', ru: 'Аптечка' }, text: { hy: 'Առաջին օգնության դեղատուփ յուրաքանչյուր ջիպում։', en: 'A first-aid kit in every jeep.', ru: 'Аптечка в каждом джипе.' } },
      { icon: 'radio', title: { hy: 'Ռադիոկապ', en: 'Radio link', ru: 'Радиосвязь' }, text: { hy: 'Ջիպերը միշտ կապի մեջ են միմյանց հետ։', en: 'The jeeps are always in radio contact.', ru: 'Джипы всегда на связи по рации.' } },
      { icon: 'shield', title: { hy: 'Ապահովագրություն', en: 'Insurance', ru: 'Страховка' }, text: { hy: 'Բոլոր մասնակիցներն ապահովագրված են։', en: 'All participants are insured.', ru: 'Все участники застрахованы.' } },
      { icon: 'briefing', title: { hy: 'Ճեպազրույց', en: 'Safety briefing', ru: 'Инструктаж' }, text: { hy: 'Անվտանգության ճեպազրույց Կոթիում՝ մեկնարկից առաջ։', en: 'Safety briefing in Koti before the start.', ru: 'Инструктаж по безопасности в Коти перед стартом.' } },
    ],
  },

  gallery: {
    eyebrow: { hy: 'Պատկերասրահ', en: 'Gallery', ru: 'Галерея' },
    title: { hy: 'Ինչպես է դա լինում', en: 'What it looks like', ru: 'Как это выглядит' },
    soon: { hy: 'Լուսանկարը շուտով', en: 'Photo coming soon', ru: 'Фото скоро' },
  },

  reviews: {
    eyebrow: { hy: 'Կարծիքներ', en: 'Reviews', ru: 'Отзывы' },
    title: { hy: 'Միայն իրական կարծիքներ', en: 'Real reviews only', ru: 'Только настоящие отзывы' },
    empty: {
      hy: 'Մենք նոր ենք սկսում․ այստեղ կհայտնվեն մեր առաջին ճանապարհորդների իրական կարծիքները։',
      en: 'We are just starting — real reviews from our first travellers will appear here.',
      ru: 'Мы только начинаем — здесь появятся настоящие отзывы наших первых путешественников.',
    },
    slot: { hy: 'Քո կարծիքը կարող է լինել այստեղ', en: 'Your review could be here', ru: 'Здесь может быть твой отзыв' },
    leave: { hy: 'Թողնել կարծիք Telegram-ում', en: 'Leave a review on Telegram', ru: 'Оставить отзыв в Telegram' },
  },

  faq: {
    eyebrow: { hy: 'ՀՏՀ', en: 'FAQ', ru: 'FAQ' },
    title: { hy: 'Հաճախ տրվող հարցեր', en: 'Frequently asked questions', ru: 'Частые вопросы' },
    items: [
      {
        q: { hy: 'Որքա՞ն դժվար է off-road-ը', en: 'How hard is the off-road?', ru: 'Насколько сложный off-road?' },
        a: {
          hy: 'Իսկական է, բայց վախենալու չէ․ ցեխ, քարեր, անտառային վերելքներ։ Ղեկին փորձառու տեղացի վարորդներն են, իսկ դուք պարզապես վայելում եք։ Հատուկ ֆիզիկական պատրաստվածություն պետք չէ։',
          en: 'It’s real, but not scary: mud, rocks, steep forest tracks. Experienced local drivers are at the wheel — you just enjoy the ride. No special fitness needed.',
          ru: 'Настоящий, но не страшный: грязь, камни, крутые лесные подъёмы. За рулём опытные местные водители — вы просто наслаждаетесь. Особая физподготовка не нужна.',
        },
      },
      {
        q: { hy: 'Արդյո՞ք դա անվտանգ է', en: 'Is it safe?', ru: 'Это безопасно?' },
        a: {
          hy: 'Այո․ փորձառու վարորդներ, դեղատուփ յուրաքանչյուր ջիպում, ռադիոկապ ջիպերի միջև, մասնակիցների ապահովագրություն և անվտանգության ճեպազրույց Կոթիում։',
          en: 'Yes: experienced drivers, a first-aid kit in every jeep, radio between jeeps, insurance for participants and a safety briefing in Koti.',
          ru: 'Да: опытные водители, аптечка в каждом джипе, рации между джипами, страховка участников и инструктаж в Коти.',
        },
      },
      {
        q: { hy: 'Կարո՞ղ եմ գալ երեխաների կամ նորածնի հետ', en: 'Can I bring kids or babies?', ru: 'Можно с детьми или малышами?' },
        a: {
          hy: 'Այո, տարիքային սահմանափակում չկա։ Փոքր երեխաներով ընտանիքները մասնակցում են հանգիստ ռեժիմով՝ առանց ծանր ակտիվությունների։',
          en: 'Yes, there is no age limit. Families with small kids join in a relaxed way, without hard activities.',
          ru: 'Да, ограничений по возрасту нет. Семьи с маленькими детьми участвуют в спокойном режиме, без тяжёлых активностей.',
        },
      },
      {
        q: { hy: 'Իսկ եթե անձրև գա՞', en: 'What if it rains?', ru: 'А если пойдёт дождь?' },
        a: {
          hy: 'Տուրը չեղարկվում կամ տեղափոխվում է միայն անձրևի դեպքում։ Դուք ընտրում եք՝ գումարի ամբողջական վերադարձ կամ նոր ամսաթիվ։',
          en: 'Only rain cancels or moves a tour. You choose: a full refund or a new date.',
          ru: 'Тур отменяется или переносится только из-за дождя. Вы выбираете: полный возврат или новая дата.',
        },
      },
      {
        q: { hy: 'Կարո՞ղ եմ գալ իմ մեքենայով', en: 'Can I come with my own car?', ru: 'Можно на своей машине?' },
        a: {
          hy: 'Այո․ ձեր մեքենայով մինչև Կոթի՝ {owncar}, իսկ ձեր 4x4-ով մինչև ճամբար (Self-Drive)՝ {selfdrive} մեկ անձի համար։',
          en: 'Yes: your own car to Koti — {owncar}, or your own 4x4 all the way to the camp (Self-Drive) — {selfdrive} per person.',
          ru: 'Да: на своей машине до Коти — {owncar}, на своём 4x4 до лагеря (Self-Drive) — {selfdrive} с человека.',
        },
      },
      {
        q: { hy: 'Պե՞տք է արդյոք իմ վրանը', en: 'Do I need my own tent?', ru: 'Нужна ли своя палатка?' },
        a: {
          hy: 'Բերեք ձերը կամ վարձեք մեզնից՝ վրան + քնապարկ {tent}։',
          en: 'Bring your own or rent from us: tent + sleeping bag for {tent}.',
          ru: 'Берите свою или арендуйте у нас: палатка + спальник за {tent}.',
        },
      },
      {
        // @placeholder — confirm mobile coverage at the camp
        q: { hy: 'Բջջային կապ կա՞', en: 'Is there mobile signal?', ru: 'Есть ли мобильная связь?' },
        a: {
          hy: 'Լեռներում կապը տեղ-տեղ թույլ է կամ բացակայում է․ հիանալի առիթ՝ անջատվելու համար։ Մեր ջիպերը միմյանց հետ կապված են ռադիոյով։',
          en: 'In the mountains the signal is weak or missing in places — a great excuse to disconnect. Our jeeps stay in touch by radio.',
          ru: 'В горах связь местами слабая или отсутствует — отличный повод отключиться. Наши джипы на связи по рации.',
        },
      },
      {
        q: { hy: 'Զուգարան և ցնցուղ կա՞', en: 'Toilets & shower?', ru: 'Есть туалет и душ?' },
        a: {
          hy: 'Այո, ճամբարում կա զուգարան և արևային ցնցուղ, ինչպես նաև մեծ ճաշասենյակ-վրան։',
          en: 'Yes, the camp has a toilet and a solar shower, plus a large dining tent.',
          ru: 'Да, в лагере есть туалет и солнечный душ, а также большой шатёр-столовая.',
        },
      },
      {
        q: { hy: 'Ալկոհոլ թույլատրվա՞ծ է', en: 'Is alcohol allowed?', ru: 'Можно ли алкоголь?' },
        a: {
          hy: 'Ոչ, մեր ճամբարն առանց ալկոհոլի է։',
          en: 'No, ours is an alcohol-free camp.',
          ru: 'Нет, наш лагерь — без алкоголя.',
        },
      },
      {
        q: { hy: 'Ինչպե՞ս վճարել', en: 'How do I pay?', ru: 'Как оплатить?' },
        a: {
          hy: 'Ամրագրման ժամանակ վճարում եք {deposit}% կանխավճար ({methods}), մնացածը՝ տուրի օրը։',
          en: 'You pay a {deposit}% deposit when booking ({methods}); the rest on the tour day.',
          ru: 'При бронировании вносите предоплату {deposit}% ({methods}), остаток — в день тура.',
        },
      },
      {
        q: { hy: 'Իսկ եթե չկարողանամ գա՞լ', en: 'Cancellation?', ru: 'Отмена?' },
        a: {
          hy: 'Եթե չեղարկում եք տուրից առնվազն {days} օր առաջ՝ կանխավճարը վերադարձվում է։ Ավելի ուշ չեղարկման դեպքում կանխավճարը չի վերադարձվում։',
          en: 'Cancel {days}+ days before the tour — your deposit is refunded. Later cancellations are not refunded.',
          ru: 'Отмена за {days}+ дней до тура — предоплата возвращается. При более поздней отмене предоплата не возвращается.',
        },
      },
      {
        q: { hy: 'Ի՞նչ լեզուներով են խոսում գիդերը', en: 'Which languages do guides speak?', ru: 'На каких языках говорят гиды?' },
        a: {
          hy: 'Հայերեն, ռուսերեն և անգլերեն։',
          en: 'Armenian, Russian and English.',
          ru: 'На армянском, русском и английском.',
        },
      },
    ],
  },

  booking: {
    eyebrow: { hy: 'Ամրագրում', en: 'Booking', ru: 'Бронирование' },
    title: { hy: 'Պահիր քո տեղը ջիպում', en: 'Save your seat in the jeep', ru: 'Займи место в джипе' },
    lead: {
      hy: 'Լրացրու հայտը՝ մենք կկապվենք քեզ հետ, կհաստատենք մանրամասները և կուղարկենք կանխավճարի հղումը։',
      en: 'Fill in the form — we’ll get back to you, confirm the details and send the deposit link.',
      ru: 'Заполни заявку — мы свяжемся, подтвердим детали и пришлём ссылку на предоплату.',
    },
    name: { hy: 'Անուն', en: 'Name', ru: 'Имя' },
    phone: { hy: 'Հեռախոս', en: 'Phone', ru: 'Телефон' },
    people: { hy: 'Մարդկանց թիվը', en: 'Number of people', ru: 'Количество человек' },
    package: { hy: 'Փաթեթ', en: 'Package', ru: 'Пакет' },
    date: { hy: 'Ամսաթիվ', en: 'Date', ru: 'Дата' },
    customDate: { hy: 'Այլ ամսաթիվ (անհատական տուր)', en: 'Other date (custom tour)', ru: 'Другая дата (индивидуальный тур)' },
    customDateLabel: { hy: 'Ցանկալի ամսաթիվ', en: 'Preferred date', ru: 'Желаемая дата' },
    addons: { hy: 'Լրացուցիչ', en: 'Add-ons', ru: 'Дополнительно' },
    language: { hy: 'Գիդի լեզուն', en: 'Guide language', ru: 'Язык гида' },
    comment: { hy: 'Մեկնաբանություն', en: 'Comment', ru: 'Комментарий' },
    commentPh: { hy: 'Երեխաներ, սննդային առանձնահատկություններ, հարցեր…', en: 'Kids, dietary needs, questions…', ru: 'Дети, особенности питания, вопросы…' },
    submit: { hy: 'Ուղարկել հայտը', en: 'Send booking request', ru: 'Отправить заявку' },
    sending: { hy: 'Ուղարկվում է…', en: 'Sending…', ru: 'Отправляем…' },
    rules: [
      { hy: '{deposit}% կանխավճար', en: '{deposit}% deposit', ru: 'Предоплата {deposit}%' },
      { hy: 'Անվճար չեղարկում՝ {days}+ օր առաջ', en: 'Free cancellation {days}+ days before', ru: 'Бесплатная отмена за {days}+ дней' },
      { hy: 'Անձրև = վերադարձ կամ նոր ամսաթիվ', en: 'Rain = refund or new date', ru: 'Дождь = возврат или новая дата' },
    ],
    payTitle: { hy: 'Կանխավճարի առցանց վճարում', en: 'Online deposit payment', ru: 'Онлайн-оплата предоплаты' },
    payNow: { hy: 'Վճարել կանխավճարը', en: 'Pay the deposit', ru: 'Оплатить предоплату' },
    payLater: { hy: 'Վճարման հղումը կուղարկենք հաստատումից հետո։', en: 'We’ll send the payment link after confirming.', ru: 'Ссылку на оплату пришлём после подтверждения.' },
    or: { hy: 'կամ գրիր / զանգիր', en: 'or message / call us', ru: 'или напиши / позвони' },
    telegram: { hy: 'Գրել Telegram-ով', en: 'Message on Telegram', ru: 'Написать в Telegram' },
    call: { hy: 'Զանգել', en: 'Call us', ru: 'Позвонить' },
    successTitle: { hy: 'Հայտն ընդունված է 🎉', en: 'Request received 🎉', ru: 'Заявка принята 🎉' },
    successText: {
      hy: 'Շնորհակալություն, {name}։ Մենք շուտով կկապվենք քեզ հետ։ Կանխավճարը՝ {deposit}։',
      en: 'Thank you, {name}! We’ll contact you soon. Your deposit: {deposit}.',
      ru: 'Спасибо, {name}! Мы скоро свяжемся с вами. Предоплата: {deposit}.',
    },
    fallbackTitle: { hy: 'Մնաց մեկ քայլ', en: 'One more step', ru: 'Остался один шаг' },
    fallbackText: {
      hy: 'Հայտի տեքստը պատճենված է։ Բացիր Telegram-ը և ուղարկիր այն մեզ, կամ պարզապես զանգիր։',
      en: 'Your booking text is copied. Open Telegram and send it to us — or just call.',
      ru: 'Текст заявки скопирован. Открой Telegram и отправь его нам — или просто позвони.',
    },
    newRequest: { hy: 'Նոր հայտ', en: 'New request', ru: 'Новая заявка' },
    required: { hy: 'Պարտադիր դաշտ', en: 'Required', ru: 'Обязательное поле' },
    phoneInvalid: { hy: 'Ստուգիր հեռախոսահամարը', en: 'Check the phone number', ru: 'Проверь номер телефона' },
    summary: { hy: 'Ամփոփում', en: 'Summary', ru: 'Итог' },
    stickyBook: { hy: 'Ամրագրել տեղ', en: 'Book now', ru: 'Забронировать' },
  },

  footer: {
    about: {
      hy: 'Weekend Extreme-ը նոր off-road ջիպ-արշավների ընկերություն է Հյուսիսային Հայաստանում․ Կոթիից (Տավուշ) մինչև Լոռու ալպյան մարգագետիններ։',
      en: 'Weekend Extreme is a new off-road jeep expedition company in northern Armenia — from Koti (Tavush) to the alpine meadows of Lori.',
      ru: 'Weekend Extreme — новая компания джип-экспедиций на севере Армении: от Коти (Тавуш) до альпийских лугов Лори.',
    },
    contacts: { hy: 'Կոնտակտներ', en: 'Contacts', ru: 'Контакты' },
    follow: { hy: 'Հետևիր մեզ', en: 'Follow us', ru: 'Мы в соцсетях' },
    soon: { hy: 'շուտով', en: 'coming soon', ru: 'скоро' },
    partners: { hy: 'Գործընկերներ', en: 'Partners', ru: 'Партнёры' },
    partnersList: [
      { hy: 'Կոթի համայնք', en: 'Koti community', ru: 'Община Коти' },
      { hy: 'Տեղի ընտանիքներ', en: 'Local families', ru: 'Местные семьи' },
    ],
    campMap: { hy: 'Ճամբարը քարտեզում', en: 'Camp on the map', ru: 'Лагерь на карте' },
    rights: { hy: 'Բոլոր իրավունքները պաշտպանված են', en: 'All rights reserved', ru: 'Все права защищены' },
  },

  common: {
    amd: { hy: 'դրամ', en: 'AMD', ru: 'драм' },
    soundOn: { hy: 'Ձայնը միացված է', en: 'Sound on', ru: 'Звук включён' },
    soundOff: { hy: 'Ձայնն անջատված է', en: 'Sound off', ru: 'Звук выключен' },
    skip: { hy: 'Անցնել բովանդակությանը', en: 'Skip to content', ru: 'Перейти к содержанию' },
  },
};

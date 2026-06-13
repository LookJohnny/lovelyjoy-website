// ─── Sourcing Essentials copy — all 14 locales (P8) ─────────
//
// The above-the-fold B2B sourcing band renders on every locale homepage and on
// the OEM landing page. Numbers and certification acronyms are locale-neutral
// (BSCI, ISO 9001, ASTM F963, EN 71, CE, GB 6675, 500/200 pcs, 7–15/30–45). Only
// labels and prose are translated. Any locale not present falls back to English.

export type SourcingCopy = {
  headline: string;
  subheadline: string;
  cards: { label: string; value: string }[];
  ctaSample: string;
  ctaQuote: string;
};

// Certification values are identical across every locale.
const CERTS = "BSCI · ISO 9001 · ASTM F963 · EN 71 · CE · GB 6675";

export const SOURCING_COPY: Record<string, SourcingCopy> = {
  en: {
    headline: "Custom Plush Toy Manufacturer in Yiwu, China",
    subheadline:
      "OEM/ODM plush toys, stuffed animals, mascot dolls and custom soft toys for international wholesalers, importers, gift brands and retailers.",
    cards: [
      { label: "MOQ", value: "From 500 pcs · 200 pcs trial" },
      { label: "Sample Time", value: "7–15 days" },
      { label: "Production Lead Time", value: "30–45 days" },
      { label: "Services", value: "OEM · ODM · Private Label" },
      { label: "Certifications", value: CERTS },
      { label: "Location", value: "Yiwu, Zhejiang, China · Ships to 70+ countries" },
    ],
    ctaSample: "Request a Sample",
    ctaQuote: "Get OEM Quote",
  },
  zh: {
    headline: "义乌毛绒玩具定制工厂",
    subheadline:
      "为全球批发商、进口商、礼品品牌与零售商提供毛绒玩具、公仔、吉祥物及定制软体玩具的 OEM/ODM 一站式制造服务。",
    cards: [
      { label: "起订量 MOQ", value: "500 件起 · 首单可低至 200 件" },
      { label: "打样周期", value: "7–15 天" },
      { label: "大货交期", value: "30–45 天" },
      { label: "服务模式", value: "OEM · ODM · 贴牌定制" },
      { label: "认证资质", value: CERTS },
      { label: "工厂位置", value: "中国浙江义乌 · 出口 70+ 国家" },
    ],
    ctaSample: "申请样品",
    ctaQuote: "获取报价",
  },
  ja: {
    headline: "中国・義烏のぬいぐるみOEM/ODM製造工場",
    subheadline:
      "海外の卸売業者・輸入業者・ギフトブランド・小売業者向けに、OEM/ODMのぬいぐるみ、動物のぬいぐるみ、マスコット人形、オリジナルソフトトイを製造します。",
    cards: [
      { label: "最小ロット (MOQ)", value: "500個から · 試作200個" },
      { label: "サンプル期間", value: "7〜15日" },
      { label: "量産納期", value: "30〜45日" },
      { label: "サービス", value: "OEM · ODM · プライベートブランド" },
      { label: "認証", value: CERTS },
      { label: "所在地", value: "中国浙江省義烏 · 70カ国以上へ出荷" },
    ],
    ctaSample: "サンプルを依頼",
    ctaQuote: "OEM見積もりを取得",
  },
  ko: {
    headline: "중국 이우 봉제인형 OEM/ODM 제조공장",
    subheadline:
      "해외 도매업체·수입업체·기프트 브랜드·소매업체를 위한 OEM/ODM 봉제인형, 동물인형, 마스코트 인형 및 맞춤 소프트토이.",
    cards: [
      { label: "최소주문수량(MOQ)", value: "500개부터 · 시험주문 200개" },
      { label: "샘플 기간", value: "7~15일" },
      { label: "양산 납기", value: "30~45일" },
      { label: "서비스", value: "OEM · ODM · 자체 브랜드(PB)" },
      { label: "인증", value: CERTS },
      { label: "위치", value: "중국 저장성 이우 · 70개국 이상 배송" },
    ],
    ctaSample: "샘플 요청",
    ctaQuote: "OEM 견적 받기",
  },
  es: {
    headline: "Fabricante de peluches personalizados en Yiwu, China",
    subheadline:
      "Peluches OEM/ODM, animales de peluche, mascotas y juguetes blandos personalizados para mayoristas, importadores, marcas de regalos y minoristas internacionales.",
    cards: [
      { label: "MOQ", value: "Desde 500 uds · 200 uds de prueba" },
      { label: "Tiempo de muestra", value: "7–15 días" },
      { label: "Plazo de producción", value: "30–45 días" },
      { label: "Servicios", value: "OEM · ODM · Marca privada" },
      { label: "Certificaciones", value: CERTS },
      { label: "Ubicación", value: "Yiwu, Zhejiang, China · Envíos a más de 70 países" },
    ],
    ctaSample: "Solicitar muestra",
    ctaQuote: "Obtener cotización OEM",
  },
  pt: {
    headline: "Fabricante de pelúcias personalizadas em Yiwu, China",
    subheadline:
      "Pelúcias OEM/ODM, bichos de pelúcia, mascotes e brinquedos de pelúcia personalizados para atacadistas, importadores, marcas de presentes e varejistas internacionais.",
    cards: [
      { label: "MOQ", value: "A partir de 500 pçs · 200 pçs de teste" },
      { label: "Tempo de amostra", value: "7–15 dias" },
      { label: "Prazo de produção", value: "30–45 dias" },
      { label: "Serviços", value: "OEM · ODM · Marca própria" },
      { label: "Certificações", value: CERTS },
      { label: "Localização", value: "Yiwu, Zhejiang, China · Envio para mais de 70 países" },
    ],
    ctaSample: "Solicitar amostra",
    ctaQuote: "Obter cotação OEM",
  },
  ar: {
    headline: "مصنع دمى محشوة مخصصة في يِيوو، الصين",
    subheadline:
      "دمى محشوة OEM/ODM وحيوانات محشوة ودمى تميمة وألعاب ناعمة مخصصة لتجار الجملة والمستوردين وعلامات الهدايا وتجار التجزئة الدوليين.",
    cards: [
      { label: "الحد الأدنى للطلب", value: "من 500 قطعة · 200 قطعة تجريبية" },
      { label: "مدة العينة", value: "7–15 يومًا" },
      { label: "مدة الإنتاج", value: "30–45 يومًا" },
      { label: "الخدمات", value: "OEM · ODM · علامة خاصة" },
      { label: "الشهادات", value: CERTS },
      { label: "الموقع", value: "يِيوو، تشجيانغ، الصين · الشحن إلى أكثر من 70 دولة" },
    ],
    ctaSample: "اطلب عينة",
    ctaQuote: "احصل على عرض سعر OEM",
  },
  ru: {
    headline: "Производитель мягких игрушек на заказ в Иу, Китай",
    subheadline:
      "Мягкие игрушки OEM/ODM, плюшевые животные, куклы-маскоты и мягкие игрушки на заказ для международных оптовиков, импортёров, подарочных брендов и розничных продавцов.",
    cards: [
      { label: "Мин. заказ (MOQ)", value: "От 500 шт · пробный заказ 200 шт" },
      { label: "Срок образца", value: "7–15 дней" },
      { label: "Срок производства", value: "30–45 дней" },
      { label: "Услуги", value: "OEM · ODM · Собственная торговая марка" },
      { label: "Сертификаты", value: CERTS },
      { label: "Расположение", value: "Иу, Чжэцзян, Китай · Доставка в 70+ стран" },
    ],
    ctaSample: "Запросить образец",
    ctaQuote: "Получить расчёт OEM",
  },
  fr: {
    headline: "Fabricant de peluches personnalisées à Yiwu, Chine",
    subheadline:
      "Peluches OEM/ODM, animaux en peluche, mascottes et jouets souples personnalisés pour grossistes, importateurs, marques de cadeaux et détaillants internationaux.",
    cards: [
      { label: "MOQ", value: "À partir de 500 pcs · essai 200 pcs" },
      { label: "Délai d'échantillon", value: "7–15 jours" },
      { label: "Délai de production", value: "30–45 jours" },
      { label: "Services", value: "OEM · ODM · Marque de distributeur" },
      { label: "Certifications", value: CERTS },
      { label: "Emplacement", value: "Yiwu, Zhejiang, Chine · Expédition vers plus de 70 pays" },
    ],
    ctaSample: "Demander un échantillon",
    ctaQuote: "Obtenir un devis OEM",
  },
  de: {
    headline: "Hersteller von kundenspezifischem Plüschspielzeug in Yiwu, China",
    subheadline:
      "OEM/ODM-Plüschtiere, Stofftiere, Maskottchen und kundenspezifisches Plüschspielzeug für internationale Großhändler, Importeure, Geschenkmarken und Einzelhändler.",
    cards: [
      { label: "Mindestbestellmenge", value: "Ab 500 Stk · 200 Stk Testlauf" },
      { label: "Musterzeit", value: "7–15 Tage" },
      { label: "Produktionszeit", value: "30–45 Tage" },
      { label: "Leistungen", value: "OEM · ODM · Eigenmarke" },
      { label: "Zertifizierungen", value: CERTS },
      { label: "Standort", value: "Yiwu, Zhejiang, China · Versand in über 70 Länder" },
    ],
    ctaSample: "Muster anfordern",
    ctaQuote: "OEM-Angebot erhalten",
  },
  it: {
    headline: "Produttore di peluche personalizzati a Yiwu, Cina",
    subheadline:
      "Peluche OEM/ODM, animali di peluche, mascotte e giocattoli morbidi personalizzati per grossisti, importatori, marchi di articoli da regalo e rivenditori internazionali.",
    cards: [
      { label: "MOQ", value: "Da 500 pz · 200 pz di prova" },
      { label: "Tempi campione", value: "7–15 giorni" },
      { label: "Tempi di produzione", value: "30–45 giorni" },
      { label: "Servizi", value: "OEM · ODM · Private Label" },
      { label: "Certificazioni", value: CERTS },
      { label: "Sede", value: "Yiwu, Zhejiang, Cina · Spedizione in oltre 70 paesi" },
    ],
    ctaSample: "Richiedi un campione",
    ctaQuote: "Richiedi preventivo OEM",
  },
  th: {
    headline: "โรงงานผลิตตุ๊กตาผ้าขนนุ่มสั่งทำในเมืองอี้อู ประเทศจีน",
    subheadline:
      "ตุ๊กตาผ้า OEM/ODM ตุ๊กตาสัตว์ ตุ๊กตามาสคอต และของเล่นนุ่มสั่งทำ สำหรับผู้ค้าส่ง ผู้นำเข้า แบรนด์ของขวัญ และผู้ค้าปลีกทั่วโลก",
    cards: [
      { label: "ยอดสั่งขั้นต่ำ (MOQ)", value: "ตั้งแต่ 500 ชิ้น · ทดลอง 200 ชิ้น" },
      { label: "ระยะเวลาทำตัวอย่าง", value: "7–15 วัน" },
      { label: "ระยะเวลาผลิต", value: "30–45 วัน" },
      { label: "บริการ", value: "OEM · ODM · แบรนด์ของคุณเอง" },
      { label: "การรับรอง", value: CERTS },
      { label: "ที่ตั้ง", value: "อี้อู เจ้อเจียง จีน · จัดส่งกว่า 70 ประเทศ" },
    ],
    ctaSample: "ขอตัวอย่าง",
    ctaQuote: "ขอใบเสนอราคา OEM",
  },
  id: {
    headline: "Produsen Boneka Plush Kustom di Yiwu, Tiongkok",
    subheadline:
      "Boneka plush OEM/ODM, boneka hewan, boneka maskot, dan mainan lembut kustom untuk grosir, importir, merek hadiah, dan peritel internasional.",
    cards: [
      { label: "MOQ", value: "Mulai 500 pcs · uji coba 200 pcs" },
      { label: "Waktu Sampel", value: "7–15 hari" },
      { label: "Waktu Produksi", value: "30–45 hari" },
      { label: "Layanan", value: "OEM · ODM · Private Label" },
      { label: "Sertifikasi", value: CERTS },
      { label: "Lokasi", value: "Yiwu, Zhejiang, Tiongkok · Kirim ke 70+ negara" },
    ],
    ctaSample: "Minta Sampel",
    ctaQuote: "Dapatkan Penawaran OEM",
  },
};

export function getSourcingCopy(locale: string): SourcingCopy {
  return SOURCING_COPY[locale] ?? SOURCING_COPY.en;
}

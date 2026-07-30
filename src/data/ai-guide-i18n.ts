// ─── AI Guide ("Joy") static intro — all 14 locales (P8) ────
//
// SSR-visible so AI search engines can read and cite what "Joy" is in every
// market, independent of the client-only kiosk. Missing locales fall back to EN.

export type AiGuideIntro = { h1: string; body: string };

export const AI_GUIDE_INTRO: Record<string, AiGuideIntro> = {
  en: {
    h1: "Joy — LovelyJoy's AI Sourcing Guide for Plush Toys",
    body:
      "Joy is LovelyJoy's AI sourcing guide for international plush toy buyers. It helps wholesalers, importers, gift brands, and retailers understand custom plush toy production, OEM vs ODM options, fabrics and materials, sampling timelines, minimum order quantities (MOQ), certification and compliance, packaging choices, and RFQ preparation before contacting the factory. You can ask Joy questions such as “what is the MOQ for a custom plush”, “how long does sampling take”, “can you produce from my drawings”, or “which export certifications do you hold”. Joy covers plush toys, stuffed animals, mascot dolls, promotional plush, baby plush, festival plush, and licensed IP plush, and can walk you from a design brief through sample approval, mass production, and export shipping. For a formal quote, submit your requirements via the contact page.",
  },
  zh: {
    h1: "Joy — 乐芭迪毛绒玩具 AI 采购助手",
    body:
      "Joy 是爱儿采 LovelyJoy 面向国际买家的 AI 采购助手，帮助批发商、进口商、礼品品牌与零售商在联系工厂前快速了解毛绒玩具定制生产、OEM/ODM 选择、面料与材料、打样周期、起订量（MOQ）、认证合规、包装方案与 RFQ 询价准备。你可以向 Joy 询问诸如「定制公仔的最小起订量是多少」「打样要多久」「能否按图纸生产」「支持哪些出口认证」等问题。Joy 覆盖毛绒玩具、毛绒动物、吉祥物公仔、促销毛绒、婴童毛绒、节庆毛绒与 IP 授权毛绒等品类，并可引导你完成从设计简报到样品确认、大货生产与出口发货的完整流程。如需正式报价，请通过联系页面提交需求。",
  },
  ja: {
    h1: "Joy — ぬいぐるみ調達のためのLovelyJoyのAIガイド",
    body:
      "Joyは、海外のぬいぐるみバイヤー向けのLovelyJoyのAI調達ガイドです。卸売業者・輸入業者・ギフトブランド・小売業者が工場に問い合わせる前に、ぬいぐるみのオリジナル製造、OEMとODMの違い、生地や素材、サンプル期間、最小ロット（MOQ）、認証とコンプライアンス、パッケージの選択肢、RFQ（見積依頼）の準備を理解できるよう支援します。「カスタムぬいぐるみのMOQは？」「サンプルにどれくらいかかる？」「図面から生産できる？」「どの輸出認証を保有している？」といった質問が可能です。Joyはぬいぐるみ、動物のぬいぐるみ、マスコット人形、販促用、ベビー、季節物、ライセンスIPのぬいぐるみを対象に、デザインブリーフからサンプル承認、量産、輸出までご案内します。正式なお見積りはお問い合わせページからご依頼ください。",
  },
  ko: {
    h1: "Joy — 봉제인형 소싱을 위한 LovelyJoy의 AI 가이드",
    body:
      "Joy는 해외 봉제인형 바이어를 위한 LovelyJoy의 AI 소싱 가이드입니다. 도매업체·수입업체·기프트 브랜드·소매업체가 공장에 문의하기 전에 맞춤 봉제인형 제작, OEM과 ODM의 차이, 원단과 소재, 샘플 기간, 최소주문수량(MOQ), 인증 및 규정 준수, 포장 옵션, RFQ(견적 요청) 준비를 이해하도록 돕습니다. “맞춤 인형의 MOQ는?”, “샘플 제작 기간은?”, “도면으로 생산이 가능한가요?”, “보유한 수출 인증은?” 등을 물어볼 수 있습니다. Joy는 봉제인형, 동물인형, 마스코트 인형, 판촉용, 유아용, 시즌, 라이선스 IP 인형을 다루며 디자인 브리프부터 샘플 승인, 양산, 수출까지 안내합니다. 정식 견적은 문의 페이지에서 요청하세요.",
  },
  es: {
    h1: "Joy — La guía de IA de LovelyJoy para el abastecimiento de peluches",
    body:
      "Joy es la guía de abastecimiento con IA de LovelyJoy para compradores internacionales de peluches. Ayuda a mayoristas, importadores, marcas de regalos y minoristas a entender la producción de peluches personalizados, las opciones OEM y ODM, telas y materiales, los plazos de muestras, las cantidades mínimas de pedido (MOQ), la certificación y el cumplimiento, las opciones de embalaje y la preparación de la solicitud de cotización (RFQ) antes de contactar con la fábrica. Puedes preguntar a Joy cosas como «¿cuál es el MOQ de un peluche personalizado?», «¿cuánto tarda el muestreo?», «¿pueden producir a partir de mis dibujos?» o «¿qué certificaciones de exportación tienen?». Joy cubre peluches, animales de peluche, mascotas, peluches promocionales, para bebés, de temporada y de IP con licencia, y te guía desde el brief de diseño hasta la aprobación de la muestra, la producción en serie y la exportación. Para una cotización formal, envía tus requisitos a través de la página de contacto.",
  },
  pt: {
    h1: "Joy — O guia de IA da LovelyJoy para sourcing de pelúcias",
    body:
      "Joy é o guia de sourcing com IA da LovelyJoy para compradores internacionais de pelúcias. Ajuda atacadistas, importadores, marcas de presentes e varejistas a entender a produção de pelúcias personalizadas, as opções OEM e ODM, tecidos e materiais, prazos de amostra, quantidades mínimas de pedido (MOQ), certificação e conformidade, opções de embalagem e a preparação da solicitação de cotação (RFQ) antes de contatar a fábrica. Você pode perguntar à Joy coisas como “qual é o MOQ de uma pelúcia personalizada?”, “quanto tempo leva a amostragem?”, “vocês produzem a partir dos meus desenhos?” ou “quais certificações de exportação vocês têm?”. A Joy cobre pelúcias, bichos de pelúcia, mascotes, pelúcias promocionais, para bebês, sazonais e de IP licenciada, e orienta você do briefing de design até a aprovação da amostra, produção em massa e exportação. Para uma cotação formal, envie seus requisitos pela página de contato.",
  },
  ar: {
    h1: "‏Joy — دليل LovelyJoy بالذكاء الاصطناعي لتوريد الدمى المحشوة",
    body:
      "‏Joy هو دليل التوريد بالذكاء الاصطناعي من LovelyJoy لمشتري الدمى المحشوة الدوليين. يساعد تجار الجملة والمستوردين وعلامات الهدايا وتجار التجزئة على فهم إنتاج الدمى المحشوة المخصصة، والفرق بين OEM وODM، والأقمشة والمواد، ومدد العينات، والحد الأدنى لكمية الطلب (MOQ)، والشهادات والامتثال، وخيارات التغليف، وإعداد طلب عرض السعر (RFQ) قبل التواصل مع المصنع. يمكنك أن تسأل Joy أسئلة مثل «ما هو الحد الأدنى للطلب لدمية مخصصة؟»، «كم تستغرق العينة؟»، «هل يمكنكم الإنتاج من رسوماتي؟»، أو «ما شهادات التصدير التي تمتلكونها؟». يغطي Joy الدمى المحشوة وحيوانات محشوة ودمى التميمة والدمى الترويجية ودمى الأطفال والموسمية ودمى الملكية الفكرية المرخصة، ويرشدك من موجز التصميم إلى اعتماد العينة والإنتاج الضخم والشحن للتصدير. للحصول على عرض سعر رسمي، أرسل متطلباتك عبر صفحة الاتصال.",
  },
  ru: {
    h1: "Joy — ИИ-гид LovelyJoy по закупке мягких игрушек",
    body:
      "Joy — это ИИ-гид LovelyJoy по закупкам для международных покупателей мягких игрушек. Он помогает оптовикам, импортёрам, подарочным брендам и розничным продавцам разобраться в производстве мягких игрушек на заказ, различиях OEM и ODM, тканях и материалах, сроках изготовления образцов, минимальном объёме заказа (MOQ), сертификации и соответствии требованиям, вариантах упаковки и подготовке запроса цены (RFQ) до обращения на фабрику. Вы можете спросить Joy: «какой MOQ для игрушки на заказ?», «сколько занимает изготовление образца?», «можете ли вы производить по моим эскизам?» или «какие у вас экспортные сертификаты?». Joy охватывает мягкие игрушки, плюшевых животных, кукол-маскотов, промо-, детские, сезонные и лицензионные IP-игрушки и проведёт вас от брифа до утверждения образца, массового производства и экспорта. Для официального расчёта отправьте требования через страницу контактов.",
  },
  fr: {
    h1: "Joy — Le guide IA de LovelyJoy pour l'approvisionnement en peluches",
    body:
      "Joy est le guide d'approvisionnement IA de LovelyJoy pour les acheteurs internationaux de peluches. Il aide les grossistes, importateurs, marques de cadeaux et détaillants à comprendre la production de peluches personnalisées, les options OEM et ODM, les tissus et matériaux, les délais d'échantillonnage, les quantités minimales de commande (MOQ), la certification et la conformité, les choix d'emballage et la préparation de la demande de devis (RFQ) avant de contacter l'usine. Vous pouvez poser à Joy des questions comme « quel est le MOQ pour une peluche personnalisée ? », « combien de temps prend l'échantillonnage ? », « pouvez-vous produire d'après mes dessins ? » ou « quelles certifications d'exportation détenez-vous ? ». Joy couvre les peluches, animaux en peluche, mascottes, peluches promotionnelles, pour bébés, saisonnières et sous licence IP, et vous accompagne du brief de conception à l'approbation de l'échantillon, la production en série et l'expédition à l'export. Pour un devis formel, envoyez vos besoins via la page de contact.",
  },
  de: {
    h1: "Joy — LovelyJoys KI-Leitfaden für die Plüsch-Beschaffung",
    body:
      "Joy ist LovelyJoys KI-Beschaffungsleitfaden für internationale Plüsch-Einkäufer. Er hilft Großhändlern, Importeuren, Geschenkmarken und Einzelhändlern, vor der Kontaktaufnahme mit der Fabrik die Produktion von kundenspezifischem Plüsch, die Unterschiede zwischen OEM und ODM, Stoffe und Materialien, Musterzeiten, Mindestbestellmengen (MOQ), Zertifizierung und Compliance, Verpackungsoptionen und die Vorbereitung der Angebotsanfrage (RFQ) zu verstehen. Sie können Joy Fragen stellen wie „Wie hoch ist die MOQ für ein individuelles Plüschtier?“, „Wie lange dauert die Bemusterung?“, „Können Sie nach meinen Zeichnungen produzieren?“ oder „Welche Exportzertifizierungen haben Sie?“. Joy deckt Plüschtiere, Stofftiere, Maskottchen, Werbe-, Baby-, Saison- und lizenzierte IP-Plüschartikel ab und begleitet Sie vom Design-Briefing über die Musterfreigabe bis zur Serienproduktion und zum Export. Für ein verbindliches Angebot senden Sie Ihre Anforderungen über die Kontaktseite.",
  },
  it: {
    h1: "Joy — La guida IA di LovelyJoy per l'approvvigionamento di peluche",
    body:
      "Joy è la guida all'approvvigionamento con IA di LovelyJoy per i buyer internazionali di peluche. Aiuta grossisti, importatori, marchi di articoli da regalo e rivenditori a comprendere la produzione di peluche personalizzati, le opzioni OEM e ODM, tessuti e materiali, i tempi di campionatura, le quantità minime d'ordine (MOQ), la certificazione e la conformità, le opzioni di imballaggio e la preparazione della richiesta di preventivo (RFQ) prima di contattare la fabbrica. Puoi chiedere a Joy cose come «qual è il MOQ per un peluche personalizzato?», «quanto dura la campionatura?», «potete produrre dai miei disegni?» o «quali certificazioni di esportazione possedete?». Joy copre peluche, animali di peluche, mascotte, peluche promozionali, per neonati, stagionali e con IP su licenza, e ti accompagna dal brief di design all'approvazione del campione, alla produzione in serie e alla spedizione per l'export. Per un preventivo formale, invia le tue richieste tramite la pagina dei contatti.",
  },
  th: {
    h1: "Joy — ผู้ช่วย AI ของ LovelyJoy สำหรับการจัดหาตุ๊กตาผ้า",
    body:
      "Joy คือผู้ช่วยจัดหาด้วย AI ของ LovelyJoy สำหรับผู้ซื้อตุ๊กตาผ้าทั่วโลก ช่วยให้ผู้ค้าส่ง ผู้นำเข้า แบรนด์ของขวัญ และผู้ค้าปลีกเข้าใจการผลิตตุ๊กตาผ้าสั่งทำ ความแตกต่างระหว่าง OEM กับ ODM ผ้าและวัสดุ ระยะเวลาทำตัวอย่าง ยอดสั่งซื้อขั้นต่ำ (MOQ) การรับรองและการปฏิบัติตามมาตรฐาน ตัวเลือกบรรจุภัณฑ์ และการเตรียมขอใบเสนอราคา (RFQ) ก่อนติดต่อโรงงาน คุณสามารถถาม Joy ได้ เช่น “MOQ ของตุ๊กตาสั่งทำคือเท่าไร” “ทำตัวอย่างใช้เวลานานแค่ไหน” “ผลิตตามแบบที่ส่งให้ได้ไหม” หรือ “มีการรับรองเพื่อการส่งออกอะไรบ้าง” Joy ครอบคลุมตุ๊กตาผ้า ตุ๊กตาสัตว์ ตุ๊กตามาสคอต ตุ๊กตาส่งเสริมการขาย ตุ๊กตาเด็ก ตุ๊กตาตามเทศกาล และตุ๊กตาลิขสิทธิ์ IP และนำคุณตั้งแต่บรีฟงานออกแบบไปจนถึงการอนุมัติตัวอย่าง การผลิตจำนวนมาก และการจัดส่งเพื่อส่งออก หากต้องการใบเสนอราคาอย่างเป็นทางการ โปรดส่งความต้องการของคุณผ่านหน้าติดต่อ",
  },
  id: {
    h1: "Joy — Panduan AI LovelyJoy untuk Pengadaan Boneka Plush",
    body:
      "Joy adalah panduan pengadaan berbasis AI dari LovelyJoy untuk pembeli boneka plush internasional. Joy membantu grosir, importir, merek hadiah, dan peritel memahami produksi boneka plush kustom, perbedaan OEM dan ODM, kain dan bahan, jadwal pembuatan sampel, kuantitas pesanan minimum (MOQ), sertifikasi dan kepatuhan, pilihan kemasan, serta persiapan permintaan penawaran (RFQ) sebelum menghubungi pabrik. Anda dapat bertanya kepada Joy seperti “berapa MOQ untuk boneka kustom?”, “berapa lama pembuatan sampel?”, “bisakah memproduksi dari gambar saya?”, atau “sertifikasi ekspor apa yang Anda miliki?”. Joy mencakup boneka plush, boneka hewan, boneka maskot, plush promosi, plush bayi, plush musiman, dan plush IP berlisensi, serta memandu Anda dari brief desain hingga persetujuan sampel, produksi massal, dan pengiriman ekspor. Untuk penawaran resmi, kirimkan kebutuhan Anda melalui halaman kontak.",
  },
};

export function getAiGuideIntro(locale: string): AiGuideIntro {
  return AI_GUIDE_INTRO[locale] ?? AI_GUIDE_INTRO.en;
}

// ─── AI Guide SSR sections ("What Joy Can Answer" / "How Joy Works") ────
//
// Server-rendered H2 sections so the page has crawlable depth beyond the intro.
// All numbers mirror src/data/company-facts.ts (500/200 pcs, 7–15 working days,
// 30–45 days, 800,000/month, 70+ markets) — do not fork them here. Certification
// acronyms are locale-neutral. Locales without a translation fall back to EN.

export type AiGuideSections = {
  whatTitle: string;
  whatIntro: string;
  whatItems: string[];
  howTitle: string;
  howBody: string[];
};

export const AI_GUIDE_SECTIONS: Record<string, AiGuideSections> = {
  en: {
    whatTitle: "What Joy Can Answer",
    whatIntro:
      "Joy answers from LovelyJoy's real factory data, so the figures it quotes match what our sales team confirms:",
    whatItems: [
      "MOQ — standard orders start at 500 pieces per design, with trial orders from 200 pieces for first-time buyers.",
      "Sampling — custom samples are completed in 7–15 working days from an approved design brief.",
      "Production — mass production takes 30–45 days after sample approval, backed by a monthly capacity of 800,000 pieces.",
      "Certifications — BSCI and ISO 9001 audited factory; products tested to ASTM F963 (US), EN 71 (EU), and GB 6675 (China).",
      "Shipping — export experience across 70+ markets, with sea, air, and courier options arranged from Yiwu, China.",
    ],
    howTitle: "How Joy Works",
    howBody: [
      "Joy is an AI assistant that answers from LovelyJoy's own factory information — production processes, lead times, MOQ policies, and certification records — rather than generic internet content. Ask a question in the kiosk above and Joy responds in real time, by voice or text.",
      "Joy handles pre-sales research; it does not replace our team. For a formal quotation, sample arrangements, or contract terms, submit your requirements via the contact page and a human sales representative will follow up directly.",
    ],
  },
  zh: {
    whatTitle: "Joy 能回答什么",
    whatIntro:
      "Joy 基于爱儿采工厂的真实数据作答，给出的数字与销售团队确认的口径一致：",
    whatItems: [
      "起订量（MOQ）— 常规订单每款 500 件起订，新客户首单可低至 200 件试单。",
      "打样 — 设计简报确认后，定制样品 7–15 个工作日内完成。",
      "生产 — 样品确认后大货生产周期为 30–45 天，月产能达 800,000 件。",
      "认证 — 工厂通过 BSCI 与 ISO 9001 审核；产品按 ASTM F963（美国）、EN 71（欧盟）、GB 6675（中国）标准检测。",
      "物流 — 出口经验覆盖 70+ 个市场，可从中国义乌安排海运、空运与快递。",
    ],
    howTitle: "Joy 如何工作",
    howBody: [
      "Joy 是一个基于爱儿采自有工厂信息作答的 AI 助手——涵盖生产流程、交期、起订量政策与认证记录，而非泛泛的网络内容。在上方的互动窗口提问，Joy 会以语音或文字实时回复。",
      "Joy 负责售前咨询，并不取代我们的团队。如需正式报价、安排样品或商讨合同条款，请通过联系页面提交需求，销售人员会直接跟进。",
    ],
  },
};

export function getAiGuideSections(locale: string): AiGuideSections {
  return AI_GUIDE_SECTIONS[locale] ?? AI_GUIDE_SECTIONS.en;
}

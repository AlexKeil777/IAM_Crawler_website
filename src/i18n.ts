export const languages = ["de", "en", "it", "ru"] as const;
export type Language = (typeof languages)[number];

const en = {
  skipLink: "Skip to content",
  navMain: "Main navigation",
  navMobile: "Mobile navigation",
  navCrawler: "The crawler",
  navContact: "Contact",
  homeLabel: "IAMAI home",
  languageLabel: "Language",
  motionPause: "Pause animations",
  motionPlay: "Play animations",
  motionOn: "Motion on",
  motionOff: "Motion off",
  menuOpen: "Open navigation",
  menuClose: "Close navigation",
  heroEfficient: "Crawl efficiently",
  heroReliable: "Crawl reliably",
  heroFlexible: "Crawl flexibly",
  heroIntelligent: "Crawl intelligently",
  heroArt: "Particles that scatter around the cursor and transform between a brake disc, brake pads, steering wheel, radiator, V8 engine block, piston, brake caliper, headlight, muffler, bumper and control arm",
  heroLearn: "Learn about the crawler",
  storyQuoteLabel: "An illustrative customer thought",
  storyQuote: "Wow, the original part is far too expensive. I think I'll buy an aftermarket part instead",
  storyContext: "Every day, millions of people, businesses and individuals alike, think this exact thing when considering a repair or an upgrade on their vehicle. Buying original parts almost always guarantees better quality and fitment and usually comes with a warranty from the manufacturer itself, thus not voiding any warranty conditions on a vehicle, but this comes at a price premium: The original parts are almost always significantly more expensive, and if something close enough in function and quality is available in the aftermarket for much less, the customer is likely to gravitate towards IAM. But how much less?",
  storyQuestion: "How much more expensive are we?",
  storyPromise: "That is what we promise to figure out for you. Our state-of-the-art AI crawler promises to find a broad range of IAM offerings in all markets combining market expertise from industry professionals and harnessing the power of AI to guarantee a large selection of truly relevant IAM offers which give a clear, traceable and reproducible view of the market.",
  methodCta: "Check out our method",
  methodTitle: "Our method",
  methodIntro: "A clear route from a part number and a market to comparable offers and their sources.",
  methodBack: "Back to the overview",
  methodDiagramLabel: "Our method: four steps from defining the comparison to a traceable market view",
  methodStep1Title: "Define the part and market",
  methodStep1Summary: "Start with a clear comparison.",
  methodStep1Detail: "Specify the original part number, target country and offer requirements. This establishes which products, quantities and conditions belong in the comparison.",
  methodStep2Title: "Discover relevant shops",
  methodStep2Summary: "Combine market expertise with AI.",
  methodStep2Detail: "Industry knowledge guides AI-assisted discovery of relevant aftermarket shops in the chosen market. The search can adapt as shops and their pages change.",
  methodStep3Title: "Match and verify offers",
  methodStep3Summary: "Check that offers are comparable.",
  methodStep3Detail: "Read product descriptions and check fit, variant, quantity and condition. Compare prices consistently and retain the reason when an offer is excluded.",
  methodStep4Title: "Build the market view",
  methodStep4Summary: "Make every comparison traceable.",
  methodStep4Detail: "Bring verified offers together with prices, currencies, timestamps and source links. Retain the search context so the market view can be reviewed and reproduced.",
  methodOutputLabel: "Result",
  methodOutputTitle: "A traceable market view",
  methodOutputDetail: "Comparable IAM offers, prices and sources, with the context behind each comparison.",
  methodNote: "The breadth of the sample depends on shop access, geography and available offers.",
  methodHint: "Select a step to see how it works.",
  contactTitle: "Contact",
  contactIntro: "For questions about the crawler, your parts or market coverage.",
  nameLabel: "Name",
  emailLabel: "Email",
  companyLabel: "Company",
  optionalLabel: "(optional)",
  messageLabel: "Message",
  submitLabel: "Send message",
  sendingLabel: "Sending…",
  sentStatus: "Message sent.",
  errorStatus: "Message could not be sent. Please try again or email us directly.",
  formService: "Sent using",
  backTop: "Back to top",
  pageTitle: "IAMAI — Intelligent IAM crawling",
  pageDescription: "AI-assisted market research for original and aftermarket automotive parts. Discover relevant IAM offers and compare prices with traceable sources.",
  ogDescription: "Relevant aftermarket offers, comparable prices and traceable sources. Discover the IAMAI method.",
  formSubject: "IAMAI website enquiry",
  validationRequired: "Please complete this field.",
  validationEmail: "Please enter a valid email address.",
} as const;

export type TranslationKey = keyof typeof en;
type Dictionary = Record<TranslationKey, string>;

const de: Dictionary = {
  skipLink: "Zum Inhalt springen",
  navMain: "Hauptnavigation",
  navMobile: "Mobile Navigation",
  navCrawler: "Der Crawler",
  navContact: "Kontakt",
  homeLabel: "IAMAI Startseite",
  languageLabel: "Sprache",
  motionPause: "Animationen pausieren",
  motionPlay: "Animationen abspielen",
  motionOn: "Animationen an",
  motionOff: "Animationen aus",
  menuOpen: "Navigation öffnen",
  menuClose: "Navigation schließen",
  heroEfficient: "Effizient crawlen",
  heroReliable: "Zuverlässig crawlen",
  heroFlexible: "Flexibel crawlen",
  heroIntelligent: "Intelligent crawlen",
  heroArt: "Partikel, die vor dem Mauszeiger auseinanderweichen und sich in Bremsscheibe, Bremsbeläge, Lenkrad, Kühler, V8-Motorblock, Kolben, Bremssattel, Scheinwerfer, Schalldämpfer, Stoßfänger und Querlenker verwandeln",
  heroLearn: "Mehr über den Crawler erfahren",
  storyQuoteLabel: "Ein beispielhafter Kundengedanke",
  storyQuote: "Wow, das Originalteil ist viel zu teuer. Ich glaube, ich kaufe stattdessen ein Teil aus dem freien Ersatzteilmarkt",
  storyContext: "Jeden Tag denken Millionen von Menschen genau das, wenn sie eine Reparatur oder eine Aufrüstung ihres Fahrzeugs erwägen – Unternehmen ebenso wie Privatpersonen. Originalteile garantieren fast immer eine bessere Qualität und Passgenauigkeit und werden in der Regel mit einer Garantie des Herstellers selbst geliefert, sodass keine Garantiebedingungen des Fahrzeugs verletzt werden. Das hat jedoch seinen Preis: Originalteile sind fast immer deutlich teurer. Wenn es im freien Ersatzteilmarkt eine wesentlich günstigere Alternative gibt, die in Funktion und Qualität nahe genug an das Original herankommt, entscheidet sich der Kunde wahrscheinlich für den IAM. Aber wie viel günstiger?",
  storyQuestion: "Wie viel teurer sind wir?",
  storyPromise: "Genau das versprechen wir für Sie herauszufinden. Unser hochmoderner KI-Crawler verspricht, ein breites Spektrum an IAM-Angeboten in allen Märkten zu finden. Er verbindet die Marktkenntnis von Branchenexperten mit der Leistungsfähigkeit von KI, um eine große Auswahl wirklich relevanter IAM-Angebote zu garantieren, die einen klaren, nachvollziehbaren und reproduzierbaren Blick auf den Markt ermöglichen.",
  methodCta: "Entdecken Sie unsere Methode",
  methodTitle: "Unsere Methode",
  methodIntro: "Ein klarer Weg von der Teilenummer und dem Zielmarkt zu vergleichbaren Angeboten und ihren Quellen.",
  methodBack: "Zurück zur Übersicht",
  methodDiagramLabel: "Unsere Methode: in vier Schritten von der Definition des Vergleichs zu einem nachvollziehbaren Marktbild",
  methodStep1Title: "Teil und Markt festlegen",
  methodStep1Summary: "Eine klare Vergleichsbasis schaffen.",
  methodStep1Detail: "Originalteilenummer, Zielland und Anforderungen an die Angebote festlegen. So wird bestimmt, welche Produkte, Mengen und Zustände in den Vergleich gehören.",
  methodStep2Title: "Relevante Shops finden",
  methodStep2Summary: "Marktkenntnis mit KI verbinden.",
  methodStep2Detail: "Branchenwissen unterstützt die KI-gestützte Suche nach relevanten Ersatzteilshops im gewählten Markt. Die Suche kann sich an Veränderungen der Shops und ihrer Seiten anpassen.",
  methodStep3Title: "Angebote abgleichen und prüfen",
  methodStep3Summary: "Die Vergleichbarkeit sicherstellen.",
  methodStep3Detail: "Produktbeschreibungen lesen und Passgenauigkeit, Variante, Menge und Zustand prüfen. Preise einheitlich vergleichen und den Grund festhalten, wenn ein Angebot ausgeschlossen wird.",
  methodStep4Title: "Das Marktbild erstellen",
  methodStep4Summary: "Jeden Vergleich nachvollziehbar machen.",
  methodStep4Detail: "Geprüfte Angebote mit Preisen, Währungen, Zeitstempeln und Quellenlinks zusammenführen. Den Suchkontext festhalten, damit sich das Marktbild überprüfen und reproduzieren lässt.",
  methodOutputLabel: "Ergebnis",
  methodOutputTitle: "Ein nachvollziehbares Marktbild",
  methodOutputDetail: "Vergleichbare IAM-Angebote, Preise und Quellen – mit dem Kontext hinter jedem Vergleich.",
  methodNote: "Die Breite der Stichprobe hängt vom Shopzugang, der Region und den verfügbaren Angeboten ab.",
  methodHint: "Wählen Sie einen Schritt, um mehr darüber zu erfahren.",
  contactTitle: "Kontakt",
  contactIntro: "Für Fragen zum Crawler, zu Ihren Teilen oder zur Marktabdeckung.",
  nameLabel: "Name",
  emailLabel: "E-Mail",
  companyLabel: "Unternehmen",
  optionalLabel: "(optional)",
  messageLabel: "Nachricht",
  submitLabel: "Nachricht senden",
  sendingLabel: "Wird gesendet…",
  sentStatus: "Nachricht gesendet.",
  errorStatus: "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt eine E-Mail.",
  formService: "Versand über",
  backTop: "Nach oben",
  pageTitle: "IAMAI — Intelligentes IAM-Crawling",
  pageDescription: "KI-gestützte Marktrecherche für Originalteile und den freien Kfz-Ersatzteilmarkt. Relevante IAM-Angebote finden und Preise mit nachvollziehbaren Quellen vergleichen.",
  ogDescription: "Relevante Ersatzteilangebote, vergleichbare Preise und nachvollziehbare Quellen. Entdecken Sie die Methode von IAMAI.",
  formSubject: "Anfrage über die IAMAI-Website",
  validationRequired: "Bitte füllen Sie dieses Feld aus.",
  validationEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
};

const it: Dictionary = {
  skipLink: "Vai al contenuto",
  navMain: "Navigazione principale",
  navMobile: "Navigazione mobile",
  navCrawler: "Il crawler",
  navContact: "Contatti",
  homeLabel: "Pagina iniziale IAMAI",
  languageLabel: "Lingua",
  motionPause: "Metti in pausa le animazioni",
  motionPlay: "Avvia le animazioni",
  motionOn: "Animazioni attive",
  motionOff: "Animazioni disattivate",
  menuOpen: "Apri il menu di navigazione",
  menuClose: "Chiudi il menu di navigazione",
  heroEfficient: "Esplora con efficienza",
  heroReliable: "Esplora con affidabilità",
  heroFlexible: "Esplora con flessibilità",
  heroIntelligent: "Esplora con intelligenza",
  heroArt: "Particelle che si disperdono al passaggio del cursore e si trasformano in disco freno, pastiglie freno, volante, radiatore, monoblocco V8, pistone, pinza freno, faro, silenziatore, paraurti e braccio oscillante",
  heroLearn: "Scopri di più sul crawler",
  storyQuoteLabel: "Un esempio di pensiero del cliente",
  storyQuote: "Accidenti, il ricambio originale costa davvero troppo. Credo che comprerò un ricambio aftermarket",
  storyContext: "Ogni giorno milioni di persone, aziende e privati, pensano esattamente questo quando valutano una riparazione o un miglioramento del proprio veicolo. Acquistare ricambi originali garantisce quasi sempre una qualità e una compatibilità migliori e di solito include una garanzia del produttore stesso, senza quindi invalidare le condizioni di garanzia del veicolo. Tutto questo, però, ha un costo: i ricambi originali sono quasi sempre molto più cari. Se nell'aftermarket è disponibile un'alternativa molto più economica, sufficientemente simile per funzione e qualità, il cliente tenderà a orientarsi verso il mercato indipendente dei ricambi, l'IAM. Ma quanto più economica?",
  storyQuestion: "Quanto costiamo in più?",
  storyPromise: "È proprio questo che ci impegniamo a scoprire per voi. Il nostro crawler IA all'avanguardia promette di trovare un'ampia gamma di offerte IAM in tutti i mercati, combinando la conoscenza del mercato dei professionisti del settore con la potenza dell'IA per garantire una vasta selezione di offerte IAM davvero pertinenti, capaci di offrire una visione del mercato chiara, tracciabile e riproducibile.",
  methodCta: "Scopri il nostro metodo",
  methodTitle: "Il nostro metodo",
  methodIntro: "Un percorso chiaro dal codice del ricambio e dal mercato di riferimento alle offerte comparabili e alle loro fonti.",
  methodBack: "Torna alla panoramica",
  methodDiagramLabel: "Il nostro metodo: quattro fasi dalla definizione del confronto a una visione del mercato tracciabile",
  methodStep1Title: "Definire ricambio e mercato",
  methodStep1Summary: "Partire da un confronto ben definito.",
  methodStep1Detail: "Specificare il codice del ricambio originale, il paese di destinazione e i requisiti delle offerte. Si stabilisce così quali prodotti, quantità e condizioni includere nel confronto.",
  methodStep2Title: "Trovare i negozi pertinenti",
  methodStep2Summary: "Unire conoscenza del mercato e IA.",
  methodStep2Detail: "L'esperienza del settore guida la ricerca assistita dall'IA di negozi aftermarket pertinenti nel mercato scelto. La ricerca può adattarsi ai cambiamenti dei negozi e delle loro pagine.",
  methodStep3Title: "Abbinare e verificare le offerte",
  methodStep3Summary: "Verificare che le offerte siano comparabili.",
  methodStep3Detail: "Leggere le descrizioni e verificare compatibilità, variante, quantità e condizioni del prodotto. Confrontare i prezzi in modo coerente e conservare il motivo dell'esclusione di un'offerta.",
  methodStep4Title: "Costruire la visione del mercato",
  methodStep4Summary: "Rendere ogni confronto tracciabile.",
  methodStep4Detail: "Riunire le offerte verificate con prezzi, valute, date e ore di rilevazione e link alle fonti. Conservare il contesto della ricerca per poter verificare e riprodurre la visione del mercato.",
  methodOutputLabel: "Risultato",
  methodOutputTitle: "Una visione del mercato tracciabile",
  methodOutputDetail: "Offerte IAM comparabili, prezzi e fonti, con il contesto di ogni confronto.",
  methodNote: "L'ampiezza del campione dipende dall'accessibilità dei negozi, dall'area geografica e dalle offerte disponibili.",
  methodHint: "Seleziona una fase per scoprire come funziona.",
  contactTitle: "Contatti",
  contactIntro: "Per domande sul crawler, sui vostri ricambi o sulla copertura del mercato.",
  nameLabel: "Nome",
  emailLabel: "Email",
  companyLabel: "Azienda",
  optionalLabel: "(facoltativo)",
  messageLabel: "Messaggio",
  submitLabel: "Invia messaggio",
  sendingLabel: "Invio in corso…",
  sentStatus: "Messaggio inviato.",
  errorStatus: "Impossibile inviare il messaggio. Riprova oppure scrivici direttamente via email.",
  formService: "Invio tramite",
  backTop: "Torna all'inizio",
  pageTitle: "IAMAI — Crawling intelligente per l'IAM",
  pageDescription: "Ricerca di mercato assistita dall'IA per ricambi automobilistici originali e aftermarket. Trova offerte IAM pertinenti e confronta i prezzi con fonti tracciabili.",
  ogDescription: "Offerte aftermarket pertinenti, prezzi comparabili e fonti tracciabili. Scopri il metodo IAMAI.",
  formSubject: "Richiesta dal sito IAMAI",
  validationRequired: "Compila questo campo.",
  validationEmail: "Inserisci un indirizzo email valido.",
};

const ru: Dictionary = {
  skipLink: "Перейти к содержимому",
  navMain: "Основная навигация",
  navMobile: "Мобильная навигация",
  navCrawler: "О краулере",
  navContact: "Контакты",
  homeLabel: "Главная страница IAMAI",
  languageLabel: "Язык",
  motionPause: "Приостановить анимацию",
  motionPlay: "Включить анимацию",
  motionOn: "Анимация включена",
  motionOff: "Анимация выключена",
  menuOpen: "Открыть меню навигации",
  menuClose: "Закрыть меню навигации",
  heroEfficient: "Собирайте эффективно",
  heroReliable: "Собирайте надёжно",
  heroFlexible: "Собирайте гибко",
  heroIntelligent: "Собирайте с умом",
  heroArt: "Частицы, которые разлетаются от курсора и превращаются в тормозной диск, тормозные колодки, руль, радиатор, блок двигателя V8, поршень, тормозной суппорт, фару, глушитель, бампер и рычаг подвески",
  heroLearn: "Узнать больше о краулере",
  storyQuoteLabel: "Пример мысли покупателя",
  storyQuote: "Ого, оригинальная запчасть слишком дорогая. Думаю, лучше куплю неоригинальную",
  storyContext: "Каждый день миллионы людей — как представители компаний, так и частные владельцы — думают именно так, рассматривая ремонт или усовершенствование своего автомобиля. Покупка оригинальных запчастей почти всегда гарантирует более высокое качество и лучшую совместимость; обычно на них также распространяется гарантия самого производителя, поэтому условия гарантии на автомобиль не нарушаются. Но за это приходится доплачивать: оригинальные запчасти почти всегда значительно дороже. Если на независимом рынке есть гораздо более доступная альтернатива, достаточно близкая по функциям и качеству, покупатель, скорее всего, выберет независимый рынок автозапчастей — IAM. Но насколько дешевле?",
  storyQuestion: "Насколько мы дороже?",
  storyPromise: "Именно это мы обещаем выяснить для вас. Наш современный краулер на базе ИИ обещает находить широкий спектр предложений IAM на всех рынках. Он объединяет знания отраслевых специалистов с возможностями ИИ, чтобы гарантировать большой выбор действительно подходящих предложений IAM, которые дают ясное, проверяемое и воспроизводимое представление о рынке.",
  methodCta: "Познакомьтесь с нашим методом",
  methodTitle: "Наш метод",
  methodIntro: "Понятный путь от номера запчасти и выбранного рынка к сопоставимым предложениям и их источникам.",
  methodBack: "Вернуться к обзору",
  methodDiagramLabel: "Наш метод: четыре этапа от определения условий сравнения до проверяемой картины рынка",
  methodStep1Title: "Определить запчасть и рынок",
  methodStep1Summary: "Задать чёткую основу для сравнения.",
  methodStep1Detail: "Указать номер оригинальной запчасти, страну и требования к предложениям. Это определяет, какие товары, количества и состояния включать в сравнение.",
  methodStep2Title: "Найти подходящие магазины",
  methodStep2Summary: "Объединить знание рынка и ИИ.",
  methodStep2Detail: "Отраслевой опыт помогает ИИ находить подходящие магазины автозапчастей на выбранном рынке. Поиск может адаптироваться к изменениям магазинов и их страниц.",
  methodStep3Title: "Сопоставить и проверить предложения",
  methodStep3Summary: "Убедиться в сопоставимости предложений.",
  methodStep3Detail: "Изучить описания и проверить совместимость, вариант, количество и состояние товара. Сравнивать цены по единым правилам и сохранять причину исключения предложения.",
  methodStep4Title: "Сформировать картину рынка",
  methodStep4Summary: "Сделать каждое сравнение проверяемым.",
  methodStep4Detail: "Объединить проверенные предложения с ценами, валютами, временем сбора данных и ссылками на источники. Сохранить условия поиска, чтобы картину рынка можно было проверить и воспроизвести.",
  methodOutputLabel: "Результат",
  methodOutputTitle: "Проверяемая картина рынка",
  methodOutputDetail: "Сопоставимые предложения IAM, цены и источники с условиями каждого сравнения.",
  methodNote: "Охват выборки зависит от доступности магазинов, географии и имеющихся предложений.",
  methodHint: "Выберите этап, чтобы узнать, как он устроен.",
  contactTitle: "Контакты",
  contactIntro: "По вопросам о краулере, ваших запчастях или охвате рынка.",
  nameLabel: "Имя",
  emailLabel: "Электронная почта",
  companyLabel: "Компания",
  optionalLabel: "(необязательно)",
  messageLabel: "Сообщение",
  submitLabel: "Отправить сообщение",
  sendingLabel: "Отправка…",
  sentStatus: "Сообщение отправлено.",
  errorStatus: "Не удалось отправить сообщение. Попробуйте ещё раз или напишите нам напрямую по электронной почте.",
  formService: "Отправка через",
  backTop: "Наверх",
  pageTitle: "IAMAI — Интеллектуальный сбор данных об IAM",
  pageDescription: "Исследование рынка оригинальных и неоригинальных автозапчастей с помощью ИИ. Поиск подходящих предложений IAM и сравнение цен с проверяемыми источниками.",
  ogDescription: "Подходящие предложения независимого рынка, сопоставимые цены и проверяемые источники. Познакомьтесь с методом IAMAI.",
  formSubject: "Обращение с сайта IAMAI",
  validationRequired: "Заполните это поле.",
  validationEmail: "Введите корректный адрес электронной почты.",
};

const dictionaries: Record<Language, Dictionary> = { en, de, it, ru };
const storageKey = "iam-language";
let language: Language = "en";
const boundSelectors = new WeakSet<HTMLSelectElement>();

declare global {
  interface WindowEventMap {
    languagechange: CustomEvent<{ language: Language }>;
  }
}

function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && languages.some((candidate) => candidate === value);
}

export function getLanguage(): Language {
  return language;
}

/** Unknown keys remain visible instead of silently removing interface text. */
export function t(key: string): string {
  if (!Object.prototype.hasOwnProperty.call(en, key)) return key;
  return dictionaries[language][key as TranslationKey];
}

function updateDocument(): void {
  document.documentElement.lang = language;
  document.title = t("pageTitle");

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    element.textContent = t(element.getAttribute("data-i18n")!);
  });
  const attributes = [
    ["data-i18n-aria", "aria-label"],
    ["data-i18n-placeholder", "placeholder"],
    ["data-i18n-content", "content"],
    ["data-i18n-value", "value"],
  ] as const;
  for (const [source, target] of attributes) {
    document.querySelectorAll<HTMLElement>(`[${source}]`).forEach((element) => {
      element.setAttribute(target, t(element.getAttribute(source)!));
    });
  }
  document.querySelectorAll<HTMLSelectElement>("#language-selector").forEach((selector) => {
    selector.value = language;
  });
  window.dispatchEvent(new CustomEvent("languagechange", { detail: { language } }));
}

export function setLanguage(nextLanguage: Language): void {
  if (!isLanguage(nextLanguage)) return;
  language = nextLanguage;
  try {
    localStorage.setItem(storageKey, language);
  } catch {
    // Translation remains available when browser storage is disabled.
  }
  updateDocument();
}

/** English is the first-visit default; a saved explicit choice takes precedence. */
export function initI18n(): void {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(storageKey);
  } catch {
    // Browser language never overrides the site's English default.
  }
  language = isLanguage(stored) ? stored : "en";
  document.querySelectorAll<HTMLSelectElement>("#language-selector").forEach((selector) => {
    if (boundSelectors.has(selector)) return;
    selector.addEventListener("change", () => {
      if (isLanguage(selector.value)) setLanguage(selector.value);
    });
    boundSelectors.add(selector);
  });
  updateDocument();
}

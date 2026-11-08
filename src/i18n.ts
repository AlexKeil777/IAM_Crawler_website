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
  menuOpen: "Open navigation",
  menuClose: "Close navigation",
  heroEfficient: "Crawl efficiently",
  heroReliable: "Crawl reliably",
  heroFlexible: "Crawl flexibly",
  heroIntelligent: "Crawl intelligently",
  heroArt: "Particles that scatter around the cursor and transform between a control arm, steering wheel, alloy wheel, exhaust system, brake caliper, headlight and V8 engine block, surrounded by sample prices in different currencies",
  heroLearn: "Learn about the crawler",
  storyQuoteLabel: "An illustrative customer thought",
  storyQuote: "Wow, the original part is far too expensive. I think I'll buy an aftermarket part instead",
  storyContext: "Every day, millions of people, businesses and individuals alike, think this exact thing when considering a repair or an upgrade on their vehicle. Buying original parts almost always guarantees better quality and fitment and usually comes with a warranty from the manufacturer itself, thus not voiding any warranty conditions on a vehicle, but this comes at a price premium: The original parts are almost always significantly more expensive, and if something close enough in function and quality is available aftermarket for much less, the customer is likely to take up that offer.?",
  storyQuestion: "\"If the aftermarket part is not at least 20% cheaper, i may as well buy the genuine part\"",
  storyPromise: "But is it? That's what we promise to figure out for you. Our state-of-the-art AI crawler promises to find a broad range of IAM offerings in all markets combining market expertise from industry professionals and harnessing the power of AI to guarantee a large selection of truly relevant IAM offers which give a clear, traceable and reproducible view of the market.",
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
  methodStep3Summary: "Use advanced AI to validate quality.",
  methodStep3Detail: "Advanced AI tools read product descriptions and specifications to match part identity, vehicle fitment and quality requirements. They check variants, quantities, included components, condition, currency and price plausibility. Invalid, incompatible or unverifiable offers are excluded from the final comparison, with the reason for exclusion retained.",
  methodStep4Title: "Build the market view",
  methodStep4Summary: "Make every comparison traceable.",
  methodStep4Detail: "Bring verified offers together with prices, currencies, timestamps and source links. Retain the search context so the market view can be reviewed and reproduced.",
  methodOutputLabel: "Result",
  methodOutputTitle: "A traceable market view",
  methodOutputDetail: "Comparable IAM offers, prices and sources, with the context behind each comparison.",
  methodNote: "The breadth of the sample depends on shop access, geography and available offers.",
  methodHint: "Select a step to see how it works.",
  methodQualityTitle: "Advanced AI for offer quality",
  methodQualityDetail: "Finding an offer is only the beginning. We use advanced AI tools to cross-check part numbers, descriptions and technical specifications against the original part and your comparison criteria. These checks help identify misleading matches, unsuitable quality or fitment, and inconsistent prices. Uncertain matches trigger additional page reads and comparisons with evidence from other shops. Only validated offers enter the final comparison; invalid or unresolved offers are excluded, while source links and rejection reasons remain available for review.",
  methodChallengesTitle: "Why is Crawling so difficult",
  methodChallenge1Title: "Access through localized IP addresses",
  methodChallenge1Detail: "Shops can show different products, prices or access rules by country. Reaching the local market requires internet access from IP addresses in that region.",
  methodChallenge2Title: "Incorrect prices on shop websites",
  methodChallenge2Detail: "A displayed price can be wrong, outdated or tied to a different quantity or variant. It needs validation before it belongs in a comparison.",
  methodChallenge3Title: "Parts that do not meet quality or fitment requirements",
  methodChallenge3Detail: "A webshop may list a part as compatible even when its quality or vehicle fitment is unsuitable. Each offer needs to be checked against the requirements.",
  methodChallenge4Title: "Webshop bot protection",
  methodChallenge4Detail: "Automated access can encounter bot checks, request limits and blocked pages, making reliable data collection more difficult.",
  methodChallenge5Title: "Huge amounts of data to scan",
  methodChallenge5Detail: "Large catalogs, duplicate listings and changing pages create a vast amount of data to scan, interpret and validate before relevant offers emerge.",
  contactTitle: "Contact",
  contactIntro: "For questions about the crawler, your parts or market coverage.",
  nameLabel: "Name",
  emailLabel: "Email",
  companyLabel: "Company",
  optionalLabel: "(optional)",
  messageLabel: "Message",
  submitLabel: "Send message",
  sendingLabel: "Sending…",
  sentStatus: "Message sent!",
  errorStatus: "Message could not be sent. Your message is still in the form. Please try again.",
  unavailableStatus: "The contact service is temporarily unavailable. Your message is still in the form. Please try again later.",
  deliveryUnknownStatus: "Delivery could not be confirmed. Your message is still in the form. Please try again.",
  formService: "Sent using",
  formVerification: "Complete the verification on the next page to send your message.",
  emailAlternative: "Or send an email directly",
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
  menuOpen: "Navigation öffnen",
  menuClose: "Navigation schließen",
  heroEfficient: "Effizient crawlen",
  heroReliable: "Zuverlässig crawlen",
  heroFlexible: "Flexibel crawlen",
  heroIntelligent: "Intelligent crawlen",
  heroArt: "Partikel, die vor dem Mauszeiger auseinanderweichen und sich in Querlenker, Lenkrad, Leichtmetallfelge, Abgasanlage, Bremssattel, Scheinwerfer und V8-Motorblock verwandeln, umgeben von Beispielpreisen in verschiedenen Währungen",
  heroLearn: "Mehr über den Crawler erfahren",
  storyQuoteLabel: "Ein beispielhafter Kundengedanke",
  storyQuote: "Wow, das Originalteil ist viel zu teuer. Ich glaube, ich kaufe stattdessen ein Teil aus dem freien Ersatzteilmarkt",
  storyContext: "Jeden Tag denken Millionen von Menschen genau das, wenn sie eine Reparatur oder eine Aufrüstung ihres Fahrzeugs erwägen – Unternehmen ebenso wie Privatpersonen. Originalteile garantieren fast immer eine bessere Qualität und Passgenauigkeit und werden in der Regel mit einer Garantie des Herstellers selbst geliefert, sodass keine Garantiebedingungen des Fahrzeugs verletzt werden. Das hat jedoch seinen Preis: Originalteile sind fast immer deutlich teurer. Wenn es im freien Ersatzteilmarkt eine wesentlich günstigere Alternative gibt, die in Funktion und Qualität nahe genug an das Original herankommt, entscheidet sich der Kunde wahrscheinlich für dieses Angebot.",
  storyQuestion: "\"Wenn das Teil aus dem freien Ersatzteilmarkt nicht mindestens 20 % günstiger ist, kann ich genauso gut das Originalteil kaufen\"",
  storyPromise: "Aber ist das wirklich so? Genau das versprechen wir für Sie herauszufinden. Unser hochmoderner KI-Crawler verspricht, ein breites Spektrum an IAM-Angeboten in allen Märkten zu finden. Er verbindet die Marktkenntnis von Branchenexperten mit der Leistungsfähigkeit von KI, um eine große Auswahl wirklich relevanter IAM-Angebote zu garantieren, die einen klaren, nachvollziehbaren und reproduzierbaren Blick auf den Markt ermöglichen.",
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
  methodStep3Summary: "Qualität mit moderner KI prüfen.",
  methodStep3Detail: "Moderne KI-Werkzeuge lesen Produktbeschreibungen und technische Daten, um Teileidentität, Fahrzeugkompatibilität und Qualitätsanforderungen abzugleichen. Sie prüfen Varianten, Mengen, Lieferumfang, Zustand, Währung und Preisplausibilität. Ungültige, ungeeignete oder nicht verifizierbare Angebote werden aus dem abschließenden Vergleich ausgeschlossen; der Ausschlussgrund bleibt dokumentiert.",
  methodStep4Title: "Das Marktbild erstellen",
  methodStep4Summary: "Jeden Vergleich nachvollziehbar machen.",
  methodStep4Detail: "Geprüfte Angebote mit Preisen, Währungen, Zeitstempeln und Quellenlinks zusammenführen. Den Suchkontext festhalten, damit sich das Marktbild überprüfen und reproduzieren lässt.",
  methodOutputLabel: "Ergebnis",
  methodOutputTitle: "Ein nachvollziehbares Marktbild",
  methodOutputDetail: "Vergleichbare IAM-Angebote, Preise und Quellen – mit dem Kontext hinter jedem Vergleich.",
  methodNote: "Die Breite der Stichprobe hängt vom Shopzugang, der Region und den verfügbaren Angeboten ab.",
  methodHint: "Wählen Sie einen Schritt, um mehr darüber zu erfahren.",
  methodQualityTitle: "Moderne KI für die Angebotsqualität",
  methodQualityDetail: "Ein Angebot zu finden, ist erst der Anfang. Mit modernen KI-Werkzeugen gleichen wir Teilenummern, Beschreibungen und technische Daten mit dem Originalteil und Ihren Vergleichskriterien ab. Diese Prüfungen helfen, irreführende Zuordnungen, ungeeignete Qualität oder Passgenauigkeit und widersprüchliche Preise zu erkennen. Bei unsicheren Zuordnungen werden die Seiten erneut gelesen und Belege aus anderen Shops herangezogen. Nur validierte Angebote fließen in den abschließenden Vergleich ein; ungültige oder ungeklärte Angebote werden ausgeschlossen. Quellenlinks und Ausschlussgründe bleiben zur Überprüfung erhalten.",
  methodChallengesTitle: "Warum ist Crawling so schwierig",
  methodChallenge1Title: "Zugang über lokale IP-Adressen",
  methodChallenge1Detail: "Shops können je nach Land unterschiedliche Produkte, Preise oder Zugangsregeln anzeigen. Der Zugriff auf den lokalen Markt erfordert einen Internetzugang über IP-Adressen aus dieser Region.",
  methodChallenge2Title: "Falsche Preise auf Shop-Websites",
  methodChallenge2Detail: "Ein angezeigter Preis kann falsch, veraltet oder an eine andere Menge oder Variante gebunden sein. Er muss geprüft werden, bevor er in den Vergleich einfließt.",
  methodChallenge3Title: "Teile, die Qualitäts- oder Passgenauigkeitsanforderungen nicht erfüllen",
  methodChallenge3Detail: "Ein Shop kann ein Teil als kompatibel ausweisen, obwohl Qualität oder Fahrzeugzuordnung ungeeignet sind. Jedes Angebot muss anhand der Anforderungen geprüft werden.",
  methodChallenge4Title: "Bot-Schutz der Webshops",
  methodChallenge4Detail: "Automatisierte Zugriffe können auf Bot-Prüfungen, Anfragelimits und gesperrte Seiten stoßen. Das erschwert eine zuverlässige Datenerfassung.",
  methodChallenge5Title: "Riesige Datenmengen durchsuchen",
  methodChallenge5Detail: "Große Kataloge, doppelte Angebote und wechselnde Seiten erzeugen enorme Datenmengen, die durchsucht, interpretiert und geprüft werden müssen, um relevante Angebote zu finden.",
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
  errorStatus: "Die Nachricht konnte nicht gesendet werden. Ihre Nachricht steht weiterhin im Formular. Bitte versuchen Sie es erneut.",
  unavailableStatus: "Der Kontaktdienst ist vorübergehend nicht verfügbar. Ihre Nachricht steht weiterhin im Formular. Bitte versuchen Sie es später erneut.",
  deliveryUnknownStatus: "Die Zustellung konnte nicht bestätigt werden. Ihre Nachricht steht weiterhin im Formular. Bitte versuchen Sie es erneut.",
  formService: "Versand über",
  formVerification: "Schließen Sie die Verifizierung auf der nächsten Seite ab, um Ihre Nachricht zu senden.",
  emailAlternative: "Oder direkt eine E-Mail senden",
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
  menuOpen: "Apri il menu di navigazione",
  menuClose: "Chiudi il menu di navigazione",
  heroEfficient: "Esplora con efficienza",
  heroReliable: "Esplora con affidabilità",
  heroFlexible: "Esplora con flessibilità",
  heroIntelligent: "Esplora con intelligenza",
  heroArt: "Particelle che si disperdono al passaggio del cursore e si trasformano in braccio oscillante, volante, cerchio in lega, impianto di scarico, pinza freno, faro e monoblocco V8, circondati da prezzi di esempio in diverse valute",
  heroLearn: "Scopri di più sul crawler",
  storyQuoteLabel: "Un esempio di pensiero del cliente",
  storyQuote: "Accidenti, il ricambio originale costa davvero troppo. Credo che comprerò un ricambio aftermarket",
  storyContext: "Ogni giorno milioni di persone, aziende e privati, pensano esattamente questo quando valutano una riparazione o un miglioramento del proprio veicolo. Acquistare ricambi originali garantisce quasi sempre una qualità e una compatibilità migliori e di solito include una garanzia del produttore stesso, senza quindi invalidare le condizioni di garanzia del veicolo. Tutto questo, però, ha un costo: i ricambi originali sono quasi sempre molto più cari. Se nell'aftermarket è disponibile un'alternativa molto più economica, sufficientemente simile per funzione e qualità, il cliente tenderà ad accettare quell'offerta.",
  storyQuestion: "\"Se il ricambio aftermarket non costa almeno il 20% in meno, tanto vale comprare quello originale\"",
  storyPromise: "Ma è davvero così? È proprio questo che ci impegniamo a scoprire per voi. Il nostro crawler IA all'avanguardia promette di trovare un'ampia gamma di offerte IAM in tutti i mercati, combinando la conoscenza del mercato dei professionisti del settore con la potenza dell'IA per garantire una vasta selezione di offerte IAM davvero pertinenti, capaci di offrire una visione del mercato chiara, tracciabile e riproducibile.",
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
  methodStep3Summary: "Verificare la qualità con un'IA avanzata.",
  methodStep3Detail: "Strumenti avanzati di IA leggono descrizioni e specifiche per verificare l'identità del ricambio, la compatibilità con il veicolo e i requisiti di qualità. Controllano varianti, quantità, componenti inclusi, condizioni, valuta e plausibilità dei prezzi. Le offerte non valide, incompatibili o non verificabili sono escluse dal confronto finale, conservando il motivo dell'esclusione.",
  methodStep4Title: "Costruire la visione del mercato",
  methodStep4Summary: "Rendere ogni confronto tracciabile.",
  methodStep4Detail: "Riunire le offerte verificate con prezzi, valute, date e ore di rilevazione e link alle fonti. Conservare il contesto della ricerca per poter verificare e riprodurre la visione del mercato.",
  methodOutputLabel: "Risultato",
  methodOutputTitle: "Una visione del mercato tracciabile",
  methodOutputDetail: "Offerte IAM comparabili, prezzi e fonti, con il contesto di ogni confronto.",
  methodNote: "L'ampiezza del campione dipende dall'accessibilità dei negozi, dall'area geografica e dalle offerte disponibili.",
  methodHint: "Seleziona una fase per scoprire come funziona.",
  methodQualityTitle: "IA avanzata per la qualità delle offerte",
  methodQualityDetail: "Trovare un'offerta è solo l'inizio. Utilizziamo strumenti avanzati di IA per confrontare codici, descrizioni e specifiche tecniche con il ricambio originale e i tuoi criteri di confronto. Questi controlli aiutano a individuare abbinamenti fuorvianti, qualità o compatibilità inadeguate e prezzi incoerenti. Gli abbinamenti incerti richiedono ulteriori letture delle pagine e confronti con le informazioni di altri negozi. Solo le offerte validate entrano nel confronto finale; quelle non valide o non chiarite sono escluse. Link alle fonti e motivi di esclusione restano disponibili per la verifica.",
  methodChallengesTitle: "Perché il crawling è così difficile",
  methodChallenge1Title: "Accesso tramite indirizzi IP locali",
  methodChallenge1Detail: "I negozi possono mostrare prodotti, prezzi o regole di accesso diversi in base al paese. Raggiungere il mercato locale richiede un accesso a internet da indirizzi IP di quella regione.",
  methodChallenge2Title: "Prezzi errati sui siti dei negozi",
  methodChallenge2Detail: "Un prezzo visualizzato può essere errato, non aggiornato o riferito a una quantità o variante diversa. Deve essere verificato prima di entrare nel confronto.",
  methodChallenge3Title: "Ricambi che non soddisfano i requisiti di qualità o compatibilità",
  methodChallenge3Detail: "Un negozio può indicare un ricambio come compatibile anche quando la qualità o la compatibilità con il veicolo non sono adeguate. Ogni offerta va verificata rispetto ai requisiti.",
  methodChallenge4Title: "Protezioni anti-bot dei negozi online",
  methodChallenge4Detail: "L'accesso automatizzato può incontrare controlli anti-bot, limiti alle richieste e pagine bloccate, rendendo più difficile una raccolta affidabile dei dati.",
  methodChallenge5Title: "Enormi quantità di dati da analizzare",
  methodChallenge5Detail: "Cataloghi estesi, annunci duplicati e pagine che cambiano generano un'enorme quantità di dati da scandire, interpretare e verificare prima di individuare le offerte pertinenti.",
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
  errorStatus: "Impossibile inviare il messaggio. Il messaggio è ancora nel modulo. Riprova.",
  unavailableStatus: "Il servizio di contatto è temporaneamente non disponibile. Il messaggio è ancora nel modulo. Riprova più tardi.",
  deliveryUnknownStatus: "Impossibile confermare la consegna. Il messaggio è ancora nel modulo. Riprova.",
  formService: "Invio tramite",
  formVerification: "Completa la verifica nella pagina successiva per inviare il messaggio.",
  emailAlternative: "Oppure invia direttamente un'email",
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
  menuOpen: "Открыть меню навигации",
  menuClose: "Закрыть меню навигации",
  heroEfficient: "Собирайте эффективно",
  heroReliable: "Собирайте надёжно",
  heroFlexible: "Собирайте гибко",
  heroIntelligent: "Собирайте с умом",
  heroArt: "Частицы, которые разлетаются от курсора и превращаются в рычаг подвески, руль, легкосплавный диск, выхлопную систему, тормозной суппорт, фару и блок двигателя V8, окружённые примерами цен в разных валютах",
  heroLearn: "Узнать больше о краулере",
  storyQuoteLabel: "Пример мысли покупателя",
  storyQuote: "Ого, оригинальная запчасть слишком дорогая. Думаю, лучше куплю неоригинальную",
  storyContext: "Каждый день миллионы людей — как представители компаний, так и частные владельцы — думают именно так, рассматривая ремонт или усовершенствование своего автомобиля. Покупка оригинальных запчастей почти всегда гарантирует более высокое качество и лучшую совместимость; обычно на них также распространяется гарантия самого производителя, поэтому условия гарантии на автомобиль не нарушаются. Но за это приходится доплачивать: оригинальные запчасти почти всегда значительно дороже. Если на независимом рынке есть гораздо более доступная альтернатива, достаточно близкая по функциям и качеству, покупатель, скорее всего, воспользуется этим предложением.",
  storyQuestion: "\"Если неоригинальная запчасть не дешевле оригинальной хотя бы на 20 %, я могу с тем же успехом купить оригинальную\"",
  storyPromise: "Но так ли это? Именно это мы обещаем выяснить для вас. Наш современный краулер на базе ИИ обещает находить широкий спектр предложений IAM на всех рынках. Он объединяет знания отраслевых специалистов с возможностями ИИ, чтобы гарантировать большой выбор действительно подходящих предложений IAM, которые дают ясное, проверяемое и воспроизводимое представление о рынке.",
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
  methodStep3Summary: "Проверить качество с помощью передового ИИ.",
  methodStep3Detail: "Передовые инструменты ИИ изучают описания и технические характеристики, чтобы проверить идентичность запчасти, совместимость с автомобилем и требования к качеству. Они проверяют варианты, количество, комплектацию, состояние, валюту и правдоподобность цены. Недействительные, несовместимые или непроверяемые предложения исключаются из итогового сравнения с сохранением причины исключения.",
  methodStep4Title: "Сформировать картину рынка",
  methodStep4Summary: "Сделать каждое сравнение проверяемым.",
  methodStep4Detail: "Объединить проверенные предложения с ценами, валютами, временем сбора данных и ссылками на источники. Сохранить условия поиска, чтобы картину рынка можно было проверить и воспроизвести.",
  methodOutputLabel: "Результат",
  methodOutputTitle: "Проверяемая картина рынка",
  methodOutputDetail: "Сопоставимые предложения IAM, цены и источники с условиями каждого сравнения.",
  methodNote: "Охват выборки зависит от доступности магазинов, географии и имеющихся предложений.",
  methodHint: "Выберите этап, чтобы узнать, как он устроен.",
  methodQualityTitle: "Передовой ИИ для проверки качества предложений",
  methodQualityDetail: "Найти предложение — лишь начало. Мы используем передовые инструменты ИИ, чтобы сопоставить номера запчастей, описания и технические характеристики с оригинальной деталью и вашими критериями сравнения. Эти проверки помогают выявить ошибочные соответствия, неподходящее качество или совместимость и противоречивые цены. При сомнениях страницы изучаются повторно, а данные сопоставляются с информацией из других магазинов. В итоговое сравнение входят только проверенные предложения; недействительные или неуточнённые предложения исключаются. Ссылки на источники и причины исключения сохраняются для проверки.",
  methodChallengesTitle: "Почему собирать данные так сложно",
  methodChallenge1Title: "Доступ через местные IP-адреса",
  methodChallenge1Detail: "Магазины могут показывать разные товары, цены и правила доступа в зависимости от страны. Для доступа к местному рынку нужен выход в интернет с IP-адресов этого региона.",
  methodChallenge2Title: "Ошибочные цены на сайтах магазинов",
  methodChallenge2Detail: "Указанная цена может быть неверной, устаревшей или относиться к другому количеству либо варианту товара. Перед включением в сравнение её нужно проверить.",
  methodChallenge3Title: "Запчасти, не соответствующие требованиям к качеству или совместимости",
  methodChallenge3Detail: "Магазин может указать запчасть как совместимую, хотя её качество или совместимость с автомобилем не подходят. Каждое предложение нужно проверить на соответствие требованиям.",
  methodChallenge4Title: "Защита интернет-магазинов от ботов",
  methodChallenge4Detail: "Автоматический доступ может сталкиваться с проверками на ботов, ограничениями запросов и заблокированными страницами, что затрудняет надёжный сбор данных.",
  methodChallenge5Title: "Огромные объёмы данных для анализа",
  methodChallenge5Detail: "Большие каталоги, дублирующиеся предложения и меняющиеся страницы создают огромные объёмы данных, которые нужно просмотреть, интерпретировать и проверить, прежде чем найти подходящие предложения.",
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
  errorStatus: "Не удалось отправить сообщение. Ваше сообщение осталось в форме. Попробуйте ещё раз.",
  unavailableStatus: "Сервис связи временно недоступен. Ваше сообщение осталось в форме. Попробуйте позже.",
  deliveryUnknownStatus: "Не удалось подтвердить доставку. Ваше сообщение осталось в форме. Попробуйте ещё раз.",
  formService: "Отправка через",
  formVerification: "Пройдите проверку на следующей странице, чтобы отправить сообщение.",
  emailAlternative: "Или отправьте письмо напрямую",
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

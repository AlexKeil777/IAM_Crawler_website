# IAMAI crawler website

A presentation of the IAMAI crawler: what it does, how it follows a customer's search journey, and why AI page reading helps it adapt to a changing independent aftermarket.

Built with Vite, TypeScript, CSS and a custom Canvas 2D particle animation. The static site runs independently of the crawler. Its contact form uses Web3Forms with an embedded hCaptcha widget.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local address printed by Vite (usually http://127.0.0.1:5173). On Windows PowerShell, use `npm.cmd` if the execution policy blocks `npm.ps1`.

```sh
npm run build
npm run preview
```

The production build is in `dist/`. Its relative asset URLs work both at the domain root and under `/IAM_Crawler_website/`. No application server or runtime secrets are required; contact service and CAPTCHA settings are configured in Web3Forms.

## GitHub Pages

`.github/workflows/deploy.yml` installs the locked dependencies, builds the site and deploys **only `dist/`** whenever `main` is pushed. Repository Settings → Pages → Source must be **GitHub Actions**. Publishing the repository root directly serves unbuilt TypeScript and misses the CSS that Vite normally imports; it will not look like the local development site.

The live address is https://alexkeil777.github.io/IAM_Crawler_website/. The same source produces the local and hosted versions. Vite's relative base and base-aware font, icon and download URLs keep every asset inside the project URL.

## Three sections

1. A symmetric geometric IAMAI wordmark with a purple central M, the lines “Crawl efficiently”, “Crawl reliably”, “Crawl flexibly” and “Crawl intelligently”, and a cursor-reactive particle sculpture that transforms between seven reference-inspired automotive parts every two seconds, each surrounded by three to six particle-drawn sample prices in mixed currencies. Each headline line assembles from fine particles before fading into real text. Reduced motion shows the finished text immediately and keeps the sculpture still.
2. A large illustrative customer quote, the market context, and the question “How much more expensive are we?”. The “Check out our method” button dissolves into fine particles, which condense into an interactive four-step diagram. Select any step to explore its role. The explanation also covers advanced AI validation, exclusion of invalid offers, and five challenges under “Why is Crawling so difficult”.
3. A contact form addressed to `info@iamaicrawl.com`, a direct-email alternative, and an Impressum beside the form.

The hero uses two columns on desktop and stacks the logo, sculpture and text on smaller screens. The floating background figures have been removed. Purple accents are shared by the wordmark, particles, links, focus indicators and contact button.

The main wordmark opens with I, A and the left half of M, which stay unobstructed as a complete three-dimensional car side mirror descends over 1.8 seconds. Its glass faces exactly left during descent, showing the edge of the curved graphite housing, a stalk and a triangular door mount. After a 0.2-second pause, the mirror rotates over 1.6 seconds as the lettering turns; the reflected half starts appearing inside the glass as soon as rotation begins. The bottom of the glass reads “Objects in mirrors are closer than they appear”. The housing and mounting components are projected from solid 3D geometry, so their depth and shading change throughout the turn. The mirror stays in place after the reveal. Paused or reduced motion shows this final arrangement immediately.

The header language selector offers DE, EN, IT and RU. Page copy, method details, metadata, accessible labels, form validation, verification instructions and the direct-email alternative follow the chosen language, which persists locally. English is the first-visit default. The English customer quote and market paragraphs are supplied marketing copy; the quote is visibly marked as illustrative.

The header stays fixed at the top while scrolling and contains navigation and the language selector. Page spacing and anchor offsets keep content clear of the header on desktop and mobile. There is no bottom footer. Motion follows the device's reduced-motion preference, with offscreen rendering suspension, responsive layouts and accessible focus states. Copy is grounded in the sibling `IAM_Crawler` repository; see [the design and research notes](docs/design-direction.md).

## Contact form setup

With JavaScript, the form submits JSON to `https://api.web3forms.com/submit` and keeps visitors on the page. The public Web3Forms access key is configured in the hidden `access_key` input in `index.html`; it is intended for client-side use and is enabled by JavaScript. The form embeds a compact, dark hCaptcha widget using Web3Forms' shared site key. **Enable and keep hCaptcha protection enforced for this access key in the Web3Forms dashboard**, so the provider verifies tokens and rejects unverified requests. The widget, validation and submission messages follow the selected DE, EN, IT or RU language.

Required fields are name, email and message; company is optional. A solved CAPTCHA token is required before sending. Duplicate submissions are blocked, requests time out after 20 seconds, and single-use tokens reset after each request. Entered fields remain intact after success or failure. Rejections show the provider's actual message; network failures leave delivery unconfirmed. A successful response confirms acceptance, not delivery to the mailbox. Automated checks mock delivery endpoints; inbox delivery has not been verified.

The native FormSubmit action is a fallback only when JavaScript is disabled or `access_key` is blank. Its hosted CAPTCHA can then appear. The disabled public key is excluded from native submissions. Hidden `_url` and `_next` values identify the page and return visitors to its contact section after acceptance; JavaScript updates these URLs for the current origin and path without campaign parameters. FormSubmit recipient activation may be required for this fallback.

The direct-email link opens the visitor's mail app addressed to `info@iamaicrawl.com`, with the translated subject and current name, email, company and message URI-encoded into the draft. Without JavaScript, it still opens a draft addressed to the mailbox.

The visible Impressum contains the supplied name and postal address, with a normal clickable LinkedIn URL. Unique four-character alphanumeric spans separate the name and address characters, including spaces. These spans match the black background, use a 0.001px font, occupy no layout space and are excluded from screen readers. This deters basic text scraping; a crawler that interprets the markup can still recover the address.

## Verification

```sh
npm test
```

This command builds production files, then runs Playwright against the development server, the built site at `/`, and the built site under `/IAM_Crawler_website/`. The production checks use a plain static server with real 404s, so source transforms and fallback HTML cannot hide missing assets.

Playwright uses locally installed Google Chrome. The inline contact suite uses a fake public key, mocked hCaptcha SDK and intercepted Web3Forms requests at all three URL depths. It covers CAPTCHA state, on-page submission, duplicate prevention, retry and preserved text without sending email. Baseline and native fallback fixtures clear the access key. Other checks cover the three-section structure, exact hero copy and sequential reveal, direct-email drafts, reduced motion, mobile navigation, viewport widths from 320px to 1920px, automated WCAG checks, deployment asset loading, identical screenshots across environments, and particle cursor scattering. To use another browser, adjust `playwright.config.ts` and install that Playwright browser. Screenshots and traces are written to ignored `test-results/`.

The experience tests also cover all four languages, language persistence, translated validation and form requests, the descending and rotating side mirror, its retained reflection and solid housing, interactive diagram keyboard controls, the finite particle transition and interruption by a change to the device's reduced-motion preference, and translated desktop/mobile layouts.

For visual review, start the local development server, then run:

```sh
node scripts/review-artwork.mjs
```

This captures desktop and mobile page layouts plus contact sheets of all seven sculptures at a fixed camera pose. The images are saved in `test-results/`, alongside per-part render timings printed to the terminal.

For the story, method and mirror reveal, run `node scripts/review-experience.mjs` against the development server. It captures the new layouts, translated method views and a five-frame logo sequence covering descent, landing, rotation and the final pose in `test-results/`.

## Assets and reference

The visual reference was [N2 Team](https://n2team.com/), interpreted through an independent layout and identity. The IAMAI wordmark uses original vector glyphs with mirrored ivory I/A pairs around a purple central M (`#b69af7`). The favicon uses the purple M framed by mirrored ivory I rails for legibility at small sizes.

The seven sculptures are inspired by the supplied part photos: an asymmetric cast control arm, flat-bottom sport steering wheel, split-spoke alloy rim, complete dual-pipe exhaust, performance brake caliper, elongated single-projector headlight and bare V8 engine block. They use sampled 3D surfaces with realistic depth, open sections and mechanical cutouts. The headlight follows the updated reference, with horizontal light guides and a rounded outer end. Prices vary by part, use realistic decimal amounts and morph between arrangements with the sculptures. Surface normals drive directional lighting, while occlusion keeps hidden surfaces from showing through the models. The sculpture and text animations use Canvas 2D, with native HTML text retained for accessibility and responsive layout. Manrope's Latin and Cyrillic subsets are self-hosted under the SIL Open Font License; see `public/fonts/OFL.txt`. The Cyrillic subset is the unmodified [Google Fonts Manrope v23 webfont](https://fonts.gstatic.com/s/manrope/v23/xn7gYHE41ni1AdIRggOxSuXd.woff2). Fonts and visual assets are served locally. External contact requests load the hCaptcha SDK and challenges and submit to Web3Forms; the native fallback uses FormSubmit.

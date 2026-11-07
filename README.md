# AIAM crawler website

A presentation of the IAM Crawler: what it does, how it follows a customer's search journey, and why AI page reading helps it adapt to a changing independent aftermarket.

Built with Vite, TypeScript, CSS and a custom Canvas 2D particle animation. The static site runs independently of the crawler. Its contact form sends submissions through FormSubmit.

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

The production build is in `dist/`. Its relative asset URLs work both at the domain root and under `/IAM_Crawler_website/`. No server-side configuration or runtime credentials are required.

## GitHub Pages

`.github/workflows/deploy.yml` installs the locked dependencies, builds the site and deploys **only `dist/`** whenever `main` is pushed. Repository Settings → Pages → Source must be **GitHub Actions**. Publishing the repository root directly serves unbuilt TypeScript and misses the CSS that Vite normally imports; it will not look like the local development site.

The live address is https://alexkeil777.github.io/IAM_Crawler_website/. The same source produces the local and hosted versions. Vite's relative base and base-aware font, icon and download URLs keep every asset inside the project URL.

## Three sections

1. A geometric AIAM wordmark with a purple I, the lines “Crawl efficiently”, “Crawl reliably”, “Crawl flexibly” and “Crawl intelligently”, and a cursor-reactive particle sculpture that transforms between eight automotive parts every two seconds. Each headline line assembles from fine particles before fading into real text. Reduced motion shows the finished text immediately and keeps the sculpture still.
2. The goal of a representative IAM market sample, a concise comparison with a fixed-shop crawler, and four workflow steps.
3. A contact form addressed to `iamaicrawler@gmail.com`.

The hero uses two columns on desktop and stacks the logo, sculpture and text on smaller screens. The floating background figures have been removed. Purple accents are shared by the wordmark, particles, links, focus indicators and contact button.

The site retains a persistent motion control, reduced-motion support, offscreen rendering suspension, responsive layouts and accessible focus states. Copy is grounded in the sibling `IAM_Crawler` repository; see [the design and research notes](docs/design-direction.md).

## Contact form setup

The native form posts to `https://formsubmit.co/iamaicrawler@gmail.com`; JavaScript uses FormSubmit's AJAX endpoint to keep visitors on the page. Required fields are name, email and message; company is optional. The form prevents duplicate submissions, uses a honeypot, times out stalled requests, preserves failed messages and allows retries.

FormSubmit requires a one-time recipient confirmation if this email address has not already been activated. The first genuine submission triggers an activation email to `iamaicrawler@gmail.com`; follow its confirmation link. This is a recipient action, not a website deployment step. Automated tests intercept form requests and do not send real emails. See the [FormSubmit setup instructions](https://formsubmit.co/).

## Verification

```sh
npm test
```

This command builds production files, then runs Playwright against the development server, the built site at `/`, and the built site under `/IAM_Crawler_website/`. The production checks use a plain static server with real 404s, so source transforms and fallback HTML cannot hide missing assets.

Playwright uses locally installed Google Chrome. Tests cover the three-section structure, exact hero copy and sequential reveal, mocked contact-form validation/success/retry, reduced motion, mobile navigation, viewport widths from 320px to 1920px, automated WCAG checks, deployment asset loading, identical screenshots across environments, and particle cursor scattering. To use another browser, adjust `playwright.config.ts` and install that Playwright browser. Screenshots and traces are written to ignored `test-results/`.

## Assets and reference

The visual reference was [N2 Team](https://n2team.com/), interpreted through an independent layout and identity. The AIAM wordmark uses original vector glyphs; its I is purple (`#b69af7`) and the other letters are ivory. The favicon adapts the same glyphs into two rows for small sizes. The sculpture and text animations use Canvas 2D, with native HTML text retained for accessibility and responsive layout. Manrope is self-hosted under the SIL Open Font License; see `public/fonts/OFL.txt`. Assets are served locally; only contact submissions use FormSubmit.

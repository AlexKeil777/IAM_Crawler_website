# IAM Crawler website

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

1. An animated IAM/AI monogram, the title “The intelligent IAM crawler”, and “powered by AI”. The same geometry appears in the favicon. Particles disperse gently and scatter away from the cursor before returning to the mark.
2. The goal of a representative IAM market sample, a concise comparison with a fixed-shop crawler, and four workflow steps.
3. A contact form addressed to `iamaicrawler@gmail.com`.

The site retains a persistent motion control, reduced-motion support, offscreen rendering suspension, responsive layouts and accessible focus states. Copy is grounded in the sibling `IAM_Crawler` repository; see [the design and research notes](docs/design-direction.md).

## Contact form setup

The native form posts to `https://formsubmit.co/iamaicrawler@gmail.com`; JavaScript uses FormSubmit's AJAX endpoint to keep visitors on the page. Required fields are name, email and message; company is optional. The form prevents duplicate submissions, uses a honeypot, times out stalled requests, preserves failed messages and allows retries.

FormSubmit requires a one-time recipient confirmation if this email address has not already been activated. The first genuine submission triggers an activation email to `iamaicrawler@gmail.com`; follow its confirmation link. This is a recipient action, not a website deployment step. Automated tests intercept form requests and do not send real emails. See the [FormSubmit setup instructions](https://formsubmit.co/).

## Verification

```sh
npm test
```

This command builds production files, then runs Playwright against the development server, the built site at `/`, and the built site under `/IAM_Crawler_website/`. The production checks use a plain static server with real 404s, so source transforms and fallback HTML cannot hide missing assets.

Playwright uses locally installed Google Chrome. Tests cover the three-section structure, exact hero copy, mocked contact-form validation/success/retry, reduced motion, mobile navigation, responsive overflow, automated WCAG checks, deployment asset loading, identical screenshots across environments, and cursor scattering. To use another browser, adjust `playwright.config.ts` and install that Playwright browser. Screenshots and traces are written to ignored `test-results/`.

## Assets and reference

The visual reference was [N2 Team](https://n2team.com/), interpreted through an independent layout and identity. The monogram is original vector artwork: M's two peaks share A's left peak and crossbar, with a copper I stem. The particle renderer samples `public/logo.svg`, so it uses the same geometry as the browser-tab icon. Manrope is self-hosted under the SIL Open Font License; see `public/fonts/OFL.txt`. Assets are served locally; only contact submissions use FormSubmit.

# IAM Crawler website

A presentation of the IAM Crawler: what it does, how it follows a customer's search journey, and why AI page reading helps it adapt to a changing independent aftermarket.

Built in this repository with Vite, TypeScript, CSS and a custom Canvas 2D particle animation. The site is static and has no runtime API, tracking, account system or dependency on the crawler being online.

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

## Content and interactions

- Four advantages, explained through native expandable disclosures.
- Four-stage walkthrough with keyboard-accessible tabs and soft evaporation transitions.
- Interactive offer validation with comparable/excluded filters and individual explanations.
- Downloadable CSV example using the crawler's combined output fields.
- A custom IAM/AI shared-stroke vector mark in `public/logo.svg`.
- A particle brake rotor that slowly turns, disperses and reforms. Nearby particles scatter away from the cursor, then spring smoothly back to the disc when the cursor moves away.
- A persistent motion control, reduced-motion support, offscreen rendering suspension, responsive layouts and accessible focus states.

Website copy is grounded in the sibling `IAM_Crawler` repository. See [the design and research notes](docs/design-direction.md). Illustrations and sample prices are explicitly illustrative, not live crawl results. The website neither starts crawls nor accepts part numbers.

## Verification

```sh
npm test
```

This command builds production files, then runs Playwright against the development server, the built site at `/`, and the built site under `/IAM_Crawler_website/`. The production checks use a plain static server with real 404s, so source transforms and fallback HTML cannot hide missing assets.

Playwright uses locally installed Google Chrome. Tests cover workflow tabs, keyboard navigation, offer decisions and rapid filter changes, reduced motion, mobile navigation, responsive overflow, the CSV download, automated WCAG checks, deployment asset loading, identical layout across environments, and the rendered cursor-scattering behaviour. To use another browser, adjust `playwright.config.ts` and install that Playwright browser. Screenshots and traces are written to ignored `test-results/`.

## Assets and reference

The visual reference was [N2 Team](https://n2team.com/), interpreted through an independent layout and identity. The rotor and monogram are original code/vector artwork. Manrope is self-hosted under the SIL Open Font License; see `public/fonts/OFL.txt`. No font or asset services are contacted by the running website.

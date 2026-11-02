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

The production build is in `dist/`. It can be served by any static hosting service. No server-side configuration or credentials are required. This work prepares the local repository; it does not push to GitHub or publish the website.

## Content and interactions

- Four advantages, explained through native expandable disclosures.
- Four-stage walkthrough with keyboard-accessible tabs and soft evaporation transitions.
- Interactive offer validation with comparable/excluded filters and individual explanations.
- Downloadable CSV example using the crawler's combined output fields.
- A custom IAM/AI shared-stroke vector mark in `public/logo.svg`.
- A particle brake rotor that slowly turns, disperses and reforms, with subtle pointer response.
- A persistent motion control, reduced-motion support, offscreen rendering suspension, responsive layouts and accessible focus states.

Website copy is grounded in the sibling `IAM_Crawler` repository. See [the design and research notes](docs/design-direction.md). Illustrations and sample prices are explicitly illustrative, not live crawl results. The website neither starts crawls nor accepts part numbers.

## Verification

```sh
npm test
```

Playwright uses locally installed Google Chrome. Tests cover workflow tabs, keyboard navigation, offer decisions and rapid filter changes, reduced motion, mobile navigation, responsive overflow, the CSV download and automated WCAG checks. To use another browser, adjust `playwright.config.ts` and install that Playwright browser. Screenshots and traces are written to ignored `test-results/`.

## Assets and reference

The visual reference was [N2 Team](https://n2team.com/), interpreted through an independent layout and identity. The rotor and monogram are original code/vector artwork. Manrope is self-hosted under the SIL Open Font License; see `public/fonts/OFL.txt`. No font or asset services are contacted by the running website.

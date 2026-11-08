# Design direction

Purpose: explain the IAMAI crawler to a business audience, with enough evidence to make its approach concrete. This is a presentation, not a live crawler interface.

Reference: https://n2team.com/ — inspected its HTML and CSS on 2 November 2026. Retain pitch black, warm ink, quiet rules, generous space and evaporation. Create an independent identity rather than reuse its logo, copy or code.

Palette: black #000000, charcoal #101110, ivory #efede7, stone #a4a39c, purple #b69af7, subdued rule #292a27. Purple is the user's requested accent, shared across the brand, interactive states and particle details.

Type: self-hosted Manrope, using weight and scale rather than a collection of typefaces. Keep descriptions to comfortable reading widths.

Layout, revised 8 November 2026: three main sections. The hero pairs a prominent IAMAI wordmark and four headline lines with a particle sculpture that transforms between seven automotive parts. Desktop uses two columns; tablets and phones stack the wordmark, sculpture and text. The explanation section is now a presentation of the customer's aftermarket choice: an oversized illustrative quote, the supplied market paragraph, an oversized price-premium question, the promise paragraph and a method button. The final section contains the contact form, direct-email alternative and a visible Impressum below the contact introduction. The footer links to the Impressum.

Identity: IAMAI is a palindrome, expressed through a symmetric geometric wordmark. Mirrored ivory I/A pairs frame the purple central M. The black-backed favicon uses the purple M between mirrored ivory I rails for legibility at tab size. The hero retains purple detail particles. Text assembles from fine particles one line at a time, then crossfades into native HTML. All four lines appear immediately with reduced motion or when animations are paused.

Opening logo: show I, A and the left half of M first and keep those letters unobstructed throughout the reveal. A complete car side mirror descends over 1.8 seconds with its glass facing exactly left, edge-on to the viewer. Its curved graphite housing, recessed glass, stalk and triangular door mount are solid 3D geometry projected into SVG, with directional shading that makes the housing depth visible. After a 0.2-second pause, the mirror rotates over 1.6 seconds while the lettering turns to a shared final 28-degree view. An actual flipped copy of the left-hand SVG image is clipped to the projected glass and starts appearing immediately as the turn begins, so half the logo appears inside the mirror itself. The phrase “Objects in mirrors are closer than they appear” follows the glass along its bottom edge. The mirror remains in its landed position and the final pose holds through viewport changes. Reduced motion or pausing shows that same final arrangement immediately; it does not replay when motion resumes.

Method view: clicking the method button turns its sampled silhouette and text into a finite field of fine particles. They travel and condense into sampled title text, connected diagram nodes and their descriptions before yielding to the accessible HTML. Four native tabs support pointer and keyboard exploration; selected details and traversed connections update together. Desktop uses a horizontal flow, mobile a vertical flow. A back button returns to the story and restores focus. Language changes, resize, backgrounding and pausing finish an active transition safely.

Sculptures: replace the previous set with seven assemblies inspired by the supplied reference photos: an asymmetric cast control arm with recessed ribs and rubber mounts, a flat-bottom sport steering wheel, a bare split-spoke alloy rim, a full dual-pipe exhaust with two rear silencers, a performance caliper, the updated long single-projector headlight with a rounded outer end, and a bare V8 casting with four open bores per bank. Keep the existing ivory and purple fine-particle texture, surface lighting, occlusion and cursor scatter. Review desktop and mobile sizes with `scripts/review-artwork.mjs`. Each part is surrounded by three to six sample prices drawn from the same fine particles. Vary amounts realistically by part and use different currencies with decimal prices; the labels morph alongside the models. The header motion button is removed; motion follows the device's reduced-motion preference.

Background: plain black. Remove the floating automotive drawings, as requested in the latest steering.

Copy: the English hero retains the user's four lines. The story uses the supplied customer quote, market context, “How much more expensive are we?” question and promise paragraph, correcting only the spelling of “state-of-the-art”. The customer quote is identified as illustrative. The method explains the AI checks for identity, fitment, quality and plausible prices, with extra page reads and cross-shop evidence for uncertain matches. Invalid or unresolved offers are excluded from the final comparison while sources and rejection reasons remain available. A prominent “Why is Crawling so difficult” heading introduces localized IP access, incorrect website prices, incompatible parts, bot protection and the volume of data to scan. No invented numerical performance claims or attributed testimonials are added.

Languages: a compact header selector offers DE, EN, IT and RU with an explicit English default. Translate the local visible and accessible interface, metadata, method details, form validation, request subject, verification instructions and direct-email alternative. Keep the selected language in local storage. Fit the hero typography to translated line lengths, including Cyrillic, without clipping or replaying a finished particle reveal.

## Source grounding

Reviewed ../IAM_Crawler/README.md, config.py and search_crawler.py, including CopilotServer, ask_model, crawl_part, condition_of, settled, settled_by_votes and the final description checks.

- A stronger discovery model identifies and trials shops for the selected country. Discovery refreshes after seven days by default or on request.
- Luna reads saved, rendered page text through GitHub Copilot CLI; this is not screenshot vision.
- Generic browser navigation discovers lookup paths and additional results. No per-shop extraction selectors.
- Default targets: 40 offers across at least five shops when available; up to five result pages per shop and part. These are targets and limits, not guaranteed results.
- Match checks consider fit, variant, quantity, included components, condition, currency and price plausibility. Cross-shop evidence and additional reads resolve uncertain offers; unresolved offers are left out.
- CSVs keep source URLs, timestamps, prices and VAT context. Combined output includes rejected offers and reasons, normalised names, translations and sourced AI brand-quality ratings.
- Blocks, geographic access and model uncertainty can limit coverage. Do not claim an exhaustive or error-free market census.

The contact form posts natively to https://formsubmit.co/info@iamaicrawl.com with FormSubmit's default CAPTCHA enabled. The provider page shows verification, activation or rejection details; the website does not report success, clear the form or animate the message away. Localized required-field validation and the honeypot remain. A hidden canonical `_url` supports submission without JavaScript, and JavaScript uses the current origin and path without query parameters or fragments. A translated direct-email alternative opens the visitor's mail app with the current fields and translated subject encoded into the draft; its static link still addresses the mailbox without JavaScript.

Recipient activation and inbox delivery require the mailbox owner's verification. Test on the served website and follow activation instructions if FormSubmit requests it. Automated checks intercept submissions, and no genuine diagnostic email has been sent; inbox delivery is unverified. See [FormSubmit's activation help](https://formsubmit.co/help).

The Impressum retains the supplied name and address as readable static HTML, with unique four-character alphanumeric noise between adjacent characters and spaces. Noise is black, 0.001px, clipped to zero dimensions and hidden from screen readers. This discourages basic text scrapers but does not prevent recovery by a crawler that interprets the markup. The LinkedIn URL remains a normal unspaced link.

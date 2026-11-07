# Design direction

Purpose: explain the IAMAI crawler to a business audience, with enough evidence to make its approach concrete. This is a presentation, not a live crawler interface.

Reference: https://n2team.com/ — inspected its HTML and CSS on 2 November 2026. Retain pitch black, warm ink, quiet rules, generous space and evaporation. Create an independent identity rather than reuse its logo, copy or code.

Palette: black #000000, charcoal #101110, ivory #efede7, stone #a4a39c, purple #b69af7, subdued rule #292a27. Purple is the user's requested accent, shared across the brand, interactive states and particle details.

Type: self-hosted Manrope, using weight and scale rather than a collection of typefaces. Keep descriptions to comfortable reading widths.

Layout, revised 7 November 2026: three main sections. The hero pairs a prominent IAMAI wordmark and four headline lines with a particle sculpture that transforms between eleven automotive parts. Desktop uses two columns; tablets and phones stack the wordmark, sculpture and text. The explanation section is now a presentation of the customer's aftermarket choice: an oversized illustrative quote, the supplied market paragraph, an oversized price-premium question, the promise paragraph and a method button. The final section contains the contact form.

Identity: IAMAI is a palindrome, expressed through a symmetric geometric wordmark. Mirrored ivory I/A pairs frame the purple central M. The black-backed favicon uses the purple M between mirrored ivory I rails for legibility at tab size. The hero retains purple detail particles. Text assembles from fine particles one line at a time, then crossfades into native HTML. All four lines appear immediately with reduced motion or when animations are paused.

Opening logo: show I, A and the left half of M first. A small car rear-view mirror drops from above the centre, revealing an actual reflected copy of the left-hand SVG image on the right. The full wordmark is visible at one second. The mirror fades by 1.6 seconds. Reduced motion or pausing finishes the reveal immediately; it does not replay when motion resumes.

Method view: clicking the method button turns its sampled silhouette and text into a finite field of fine particles. They travel and condense into sampled title text, connected diagram nodes and their descriptions before yielding to the accessible HTML. Four native tabs support pointer and keyboard exploration; selected details and traversed connections update together. Desktop uses a horizontal flow, mobile a vertical flow. A back button returns to the story and restores focus. Language changes, resize, backgrounding and pausing finish an active transition safely.

Sculptures: preserve the original cursor-reactive brake disc. Build the other ten parts from actual 3D surfaces with realistic proportions, depth, hollow sections and mechanical cutouts. Directional lighting from surface normals and occlusion reveal their form while retaining the fine particle texture. The parts are a control arm, brake pads, steering wheel, radiator, V8 engine block, piston, brake caliper, headlight, muffler and bumper. The newer assemblies should retain their defining features: projector optics and a swept housing, a formed muffler can with hollow pipe ends, and a curved bumper fascia with open air intakes. Review every part at desktop and mobile sizes with `scripts/review-artwork.mjs`.

Background: plain black. Remove the floating automotive drawings, as requested in the latest steering.

Copy: the English hero retains the user's four lines. The story uses the supplied customer quote, market context, “How much more expensive are we?” question and promise paragraph, correcting only the spelling of “state-of-the-art”. The customer quote is identified as illustrative. The method explanation stays broad: define the comparison, discover shops with AI and industry expertise, verify comparable offers, then provide a traceable market view. No invented numerical performance claims or attributed testimonials are added.

Languages: a compact header selector offers DE, EN, IT and RU with an explicit English default. Translate the full visible and accessible interface, metadata, method details, form validation, request subject and submission states. Keep the selected language in local storage. Fit the hero typography to translated line lengths, including Cyrillic, without clipping or replaying a finished particle reveal.

## Source grounding

Reviewed ../IAM_Crawler/README.md, config.py and search_crawler.py, including CopilotServer, ask_model, crawl_part, condition_of, settled, settled_by_votes and the final description checks.

- A stronger discovery model identifies and trials shops for the selected country. Discovery refreshes after seven days by default or on request.
- Luna reads saved, rendered page text through GitHub Copilot CLI; this is not screenshot vision.
- Generic browser navigation discovers lookup paths and additional results. No per-shop extraction selectors.
- Default targets: 40 offers across at least five shops when available; up to five result pages per shop and part. These are targets and limits, not guaranteed results.
- Match checks consider fit, variant, quantity, included components, condition, currency and price plausibility. Cross-shop evidence and additional reads resolve uncertain offers; unresolved offers are left out.
- CSVs keep source URLs, timestamps, prices and VAT context. Combined output includes rejected offers and reasons, normalised names, translations and sourced AI brand-quality ratings.
- Blocks, geographic access and model uncertainty can limit coverage. Do not claim an exhaustive or error-free market census.

The contact form uses FormSubmit for info@iamaicrawler.com, with localized validation and success/failure states and a native POST fallback. Automated browser checks mock all form submissions. The changed recipient requires confirming FormSubmit's activation email after the first genuine submission; no real emails are sent by automated verification.

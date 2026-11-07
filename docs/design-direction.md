# Design direction

Purpose: explain the IAMAI crawler to a business audience, with enough evidence to make its approach concrete. This is a presentation, not a live crawler interface.

Reference: https://n2team.com/ — inspected its HTML and CSS on 2 November 2026. Retain pitch black, warm ink, quiet rules, generous space and evaporation. Create an independent identity rather than reuse its logo, copy or code.

Palette: black #000000, charcoal #101110, ivory #efede7, stone #a4a39c, purple #b69af7, subdued rule #292a27. Purple is the user's requested accent, shared across the brand, interactive states and particle details.

Type: self-hosted Manrope, using weight and scale rather than a collection of typefaces. Keep descriptions to comfortable reading widths.

Layout, revised 7 November 2026: exactly three main sections. The hero pairs a prominent IAMAI wordmark and four headline lines with a particle sculpture that transforms between eight automotive parts. Desktop uses two columns; tablets and phones stack the wordmark, sculpture and text. One explanation section contains the market-sample goal, a four-row comparison with a fixed-shop crawler, and a compact process. The final section contains the contact form.

Identity: IAMAI is a palindrome, expressed through a symmetric geometric wordmark. Mirrored ivory I/A pairs frame the purple central M. The black-backed favicon uses the purple M between mirrored ivory I rails for legibility at tab size. The hero retains purple detail particles. Text assembles from fine particles one line at a time, then crossfades into native HTML. All four lines appear immediately with reduced motion or when animations are paused.

Sculptures: preserve the original cursor-reactive brake disc. Build the other seven parts from actual 3D surfaces with realistic proportions, depth, hollow sections and mechanical cutouts. Directional lighting from surface normals and occlusion reveal their form while retaining the fine particle texture. The parts are a control arm, brake pads, steering wheel, radiator, V8 engine block, piston and brake caliper. Review every part at desktop and mobile sizes with `scripts/review-artwork.mjs`.

Background: plain black. Remove the floating automotive drawings, as requested in the latest steering.

Copy: the hero uses the user's exact lines: “Crawl efficiently”, “Crawl reliably”, “Crawl flexibly” and, below them, “Crawl intelligently”. The explanation stays concrete. Representativeness is the goal, not a claimed statistical result. The four comparison rows cover flexible reading, offer validation, customer-like browsing and maintenance. No invented accuracy figures, live-price claims or testimonials.

## Source grounding

Reviewed ../IAM_Crawler/README.md, config.py and search_crawler.py, including CopilotServer, ask_model, crawl_part, condition_of, settled, settled_by_votes and the final description checks.

- A stronger discovery model identifies and trials shops for the selected country. Discovery refreshes after seven days by default or on request.
- Luna reads saved, rendered page text through GitHub Copilot CLI; this is not screenshot vision.
- Generic browser navigation discovers lookup paths and additional results. No per-shop extraction selectors.
- Default targets: 40 offers across at least five shops when available; up to five result pages per shop and part. These are targets and limits, not guaranteed results.
- Match checks consider fit, variant, quantity, included components, condition, currency and price plausibility. Cross-shop evidence and additional reads resolve uncertain offers; unresolved offers are left out.
- CSVs keep source URLs, timestamps, prices and VAT context. Combined output includes rejected offers and reasons, normalised names, translations and sourced AI brand-quality ratings.
- Blocks, geographic access and model uncertainty can limit coverage. Do not claim an exhaustive or error-free market census.

The contact form uses FormSubmit for iamaicrawler@gmail.com, with accessible validation, honest success/failure states and a native POST fallback. Automated browser checks mock all form submissions. Recipient activation, if not already completed, requires confirming FormSubmit's email after the first genuine submission.

# Design direction

Purpose: explain the IAM Crawler to a business audience, with enough evidence to make its approach concrete. This is a presentation, not a live crawler interface.

Reference: https://n2team.com/ — inspected its HTML and CSS on 2 November 2026. Retain pitch black, warm ink, quiet rules, generous space and evaporation. Create an independent identity rather than reuse its logo, copy or code.

Palette: black #000000, charcoal #101110, ivory #efede7, stone #a4a39c, copper #dca477, subdued rule #292a27. Copper connects the design to automotive materials rather than generic green AI branding.

Type: self-hosted Manrope, using weight and scale rather than a collection of typefaces. Keep descriptions to comfortable reading widths.

Layout, revised 3 November 2026: exactly three main sections. A centred animated monogram accompanies the requested title and subtitle. One explanation section contains the market-sample goal, a four-row comparison with a fixed-shop crawler, and a compact process. The final section contains the contact form. Remove the old demonstration, export preview, repeated slogans and closing pitch.

Identity: a compact shared-stroke symbol. Two peaks form M, the left peak and crossbar form A, and the central copper stem forms I. The transparent logo and black-backed favicon use identical 160×160 geometry. The hero's canvas samples that actual SVG, with gentle dispersal and cursor repulsion. Motion can be paused and respects the operating system's reduced-motion preference.

Copy: plain descriptions of the goal and behaviour, rather than slogans. Representativeness is the goal, not a claimed statistical result. The four comparison rows cover flexible reading, offer validation, customer-like browsing and maintenance. No invented accuracy figures, live-price claims or testimonials.

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

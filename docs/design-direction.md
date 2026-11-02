# Design direction

Purpose: explain the IAM Crawler to a business audience, with enough evidence to make its approach concrete. This is a presentation, not a live crawler interface.

Reference: https://n2team.com/ — inspected its HTML and CSS on 2 November 2026. Retain pitch black, warm ink, quiet rules, generous space and evaporation. Create an independent identity rather than reuse its logo, copy or code.

Palette: black #000000, charcoal #101110, ivory #efede7, stone #a4a39c, copper #dca477, subdued rule #292a27. Copper connects the design to automotive materials rather than generic green AI branding.

Type: self-hosted Manrope, using weight and scale rather than a collection of typefaces. Keep descriptions to comfortable reading widths.

Layout: an asymmetric opening pairs a clear proposition with a particle brake rotor. A narrow sticky introduction accompanies the four advantages; a full-width interactive sequence explains the method. An offer comparison shows why validation matters. A compact export preview closes the story.

Memorable element: a brake rotor made from individual particles, slowly turning and dispersing into the air. Other movement stays quiet. Motion can be paused and respects the operating system's reduced-motion preference.

Review: a generic AI landing page would use a glowing orb, fabricated metrics and repeated feature cards. Here the main object is a recognisable automotive component, content comes from the crawler, and the interactive example demonstrates its actual comparison rules. No fabricated performance claims or live prices.

## Source grounding

Reviewed ../IAM_Crawler/README.md, config.py and search_crawler.py, including CopilotServer, ask_model, crawl_part, condition_of, settled, settled_by_votes and the final description checks.

- A stronger discovery model identifies and trials shops for the selected country. Discovery refreshes after seven days by default or on request.
- Luna reads saved, rendered page text through GitHub Copilot CLI; this is not screenshot vision.
- Generic browser navigation discovers lookup paths and additional results. No per-shop extraction selectors.
- Default targets: 40 offers across at least five shops when available; up to five result pages per shop and part. These are targets and limits, not guaranteed results.
- Match checks consider fit, variant, quantity, included components, condition, currency and price plausibility. Cross-shop evidence and additional reads resolve uncertain offers; unresolved offers are left out.
- CSVs keep source URLs, timestamps, prices and VAT context. Combined output includes rejected offers and reasons, normalised names, translations and sourced AI brand-quality ratings.
- Blocks, geographic access and model uncertainty can limit coverage. Do not claim an exhaustive or error-free market census.

Examples on the website are explicitly illustrative. They do not reproduce live shop prices or private input lists.

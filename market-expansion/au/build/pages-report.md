# AU Store Pages — Build Report

Date: 2026-08-17
Store: grillklinikken.dk (rebuilt for The BBQ Clinic, Australia)
Source: `/home/user/yognftnfgn/market-expansion/grillkliniken/source-export/pages.bulk.jsonl` (6 pages with real content out of 43 exported; the rest were empty landing-page shells and were ignored)

## Pages created (all published, verified via `pages` query)

| Title | Handle | ID | Source page |
|---|---|---|---|
| About Us | `about-us` | gid://shopify/Page/711224033663 | Om Oss (`om-oss`) |
| Privacy Policy | `privacy-policy` | gid://shopify/Page/711224066431 | Integritetspolicy (`integritetspolicy`) |
| Returns & Refunds Policy | `returns-refunds` | gid://shopify/Page/711224099199 | Retur & återbetalnings policy (`retur-aterbetalnings-policy`) |
| Shipping Policy | `shipping` | gid://shopify/Page/711224131967 | Fraktpolicy (`fraktpolicy`) |
| Terms of Service | `terms-of-service` | gid://shopify/Page/711224164735 | Användarvillkor (`anvandarvillkor`) |
| Warranty & Claims Policy | `warranty` | gid://shopify/Page/711224197503 | Garanti (`garanti`) |

Store was empty of pages before creation (verified), so all six were created with `pageCreate`; no `pageUpdate` needed.

## Legal adaptation (rewritten for Australian law, not translated Swedish law)

- **Australian Consumer Law (ACL)**: mandatory wording "Our goods come with guarantees that cannot be excluded under the Australian Consumer Law…" appears verbatim on Returns & Refunds, Terms of Service and Warranty pages. ACCC (accc.gov.au) referenced as the consumer regulator.
- **30-day change-of-mind returns**: framed explicitly as *in addition to* ACL consumer guarantees, never instead of them. Change-of-mind exclusions (sale items, gift cards, etc.) explicitly do not limit ACL rights for faulty goods. Faulty-goods return postage covered by the store per ACL.
- **Removed Swedish/EU law**: EU 14-day withdrawal right, Konsumentköplagen, ARN and GDPR/EEA/UK-specific sections all stripped.
- **Privacy**: rebuilt around the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs); access/correction rights per APPs; complaints route = store first, then OAIC (oaic.gov.au, 1300 363 992); honest overseas-disclosure section (data processed in Sweden/EEA/US).
- **Warranty**: Swedish "limited lifetime warranty" restructured as a voluntary warranty against defects with the ACL-required particulars (warrantor name/address, claim procedure, cost allocation, "in addition to statutory rights" statement). Clauses that would conflict with ACL (company chooses remedy, evidence burden, inspection fees) are expressly subordinated to ACL rights (e.g. consumer's choice of refund/replacement for major failures). Source placeholders ([Företagsnamn], "Mastern 2 år livslängd") removed.
- **GST**: "All prices include GST (10%)"; prices in AUD. Shipping page notes GST is collected at checkout so no extra charges on delivery for standard orders.
- **Shipping**: "Free shipping Australia-wide" (matches configured shipping zone); honest delivery estimate of 10–20 business days (international fulfilment), 1–2 business days processing, tracked shipping. Removed Swedish PostNord/China-warehouse/import-fee text (contradicted GST-inclusive pricing).
- **Company info**: "The BBQ Clinic is operated by STONEBITE ECOM AB (Sweden)" on About, Privacy, Terms and Warranty. Fixed the source's broken company info (personal ID number as org name, kundsupport@gmail.com).
- **Returns address**: Sjöhed 160, Harestad, 442 74, Sweden — with "always contact support before sending anything back" on every relevant page.
- **Branding/language**: Grillkliniken → The BBQ Clinic throughout; Australian English spelling (realisation, colour/discolouration, organise, authorised, fulfil).

## Flags / follow-ups

- **Contact email**: `kundeservice@grillklinikken.com` used on all pages (the working address). **Replace across all six pages once the AU domain is purchased** — grep for `kundeservice@grillklinikken.com`.
- Terms of Service links to `/pages/shipping`, `/pages/returns-refunds` and `/pages/warranty` — handles must stay stable.
- Privacy Policy "Last updated" date set to 17 August 2026.

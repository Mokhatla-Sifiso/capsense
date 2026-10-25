# Capitec Design Language (evidence)

Owner: `ui-designer` · Captured 2026-10-22 from the live site (computed CSS, built-in browser) and the App Store screenshots · Status: **Draft, needs Muzi approval** · Supersedes the D-01 colour guesses in `brand-sources.md`

## 1. Foundations, measured

| Element | Capitec value | Evidence | Tag |
|---|---|---|---|
| Body / UI font | **Nunito Sans** 400 · 500 · 600 · 700 | `--theme-font-family: NunitoSans` on capitecbank.co.za; 1 000 of the first 4 000 elements | Verified |
| Display font | **Flama** 500 (accent headings, e.g. h1 "Simplified banking" 36 px) | computed style `h1.heading-accented` | Verified (commercial font; not in Figma) |
| Primary / interactive blue | **#2F70EF** · hover **#2259D0** | `--theme-primary-button-background-colour`, `--theme-text-link-colour` | Verified |
| Deep brand blue (headings) | **#0033A0** | `h1.heading-accented` colour | Verified |
| Text | **#3A3A3A** | `--theme-text-colour`; most frequent colour on the page | Verified |
| Page background | **#F7F7F7**; surfaces #FFFFFF; dividers #EDEDED | `--theme-background-colour`, computed borders | Verified |
| Brand red | **#E61414** (sparingly) | computed colour | Verified |
| Buttons | **Pill**: radius 24 px (15 px small), 1 px border; primary = #2F70EF fill + white text; secondary = white fill, #2F70EF text and border; 600 weight | `.button--v2--primary/secondary` | Verified |
| Elevation | `0 30px 30px -15px rgba(58,58,58,.4)` (soft, low) | `--theme-box-shadow` | Verified |

## 2. In-app patterns (App Store screenshots 01 and 03)

| Pattern | Description | Applies to |
|---|---|---|
| App bar | Blue (#2F70EF → lighter gradient) bar, white centred title, white icon buttons (profile left, call right) | C-01 header |
| Section label | Small semibold grey label ("My dashboard") + blue text link right ("Edit ›") | Region headings |
| **Account card** | White card, small radius, soft shadow; **full-height coloured tile on the left** with a white line icon; title in the tile colour (semibold), grey subtitle; **amount bold, right-aligned** | KPI tiles, category rows, goals, transactions |
| Tile colours | Light blue, navy, red, slate (one per product) | Category colours (our 6 categories) |
| Action row | White card, blue circled "+" icon, title + subtitle, blue chevron | "Custom range…", "Show data table" |
| Alert card | Tinted (green) card, round icon, bold title, body, text action right-aligned | Error / status messages |
| Bottom tab bar | 5 icons with labels, blue active | **Not used** (single-screen web dashboard) |

## 3. Implications for CapSense

| # | Change from current tokens/spec | Why |
|---|---|---|
| L-01 | Font → Nunito Sans (Google font, available in Figma and the build); Flama replaced by Nunito Sans 700 for display | Verified brand font; Flama not licensable for us |
| L-02 | Primary → #2F70EF; headings accent → #0033A0; text → #3A3A3A; bg → #F7F7F7 | Verified brand values (all text/UI contrast to be re-checked in tokens.md) |
| L-03 | Buttons and period presets → pill shape | Verified component shape |
| L-04 | Lists/KPIs/goals use the **account-card** pattern with coloured left tile | Core Capitec app pattern |
| L-05 | Header → blue app bar | Core Capitec app pattern |
| L-06 | Design mobile-first like the app; scale up to tablet/desktop as a card grid | Capitec is app-first |
| L-07 | No logo, no card art, no "GlobalOne" name (trademarks) | T-01 |

Sources: https://www.capitecbank.co.za/personal/ (computed CSS, 2026-10-22) · https://apps.apple.com/za/app/capitec-bank/id1217842108 (screenshots 01, 03)

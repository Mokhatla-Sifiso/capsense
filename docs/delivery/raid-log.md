# RAID Log: CapSense

## Risks

| ID | Risk | Impact | Owner | Status | Raised |
|---|---|---|---|---|---|
| R-01 | Schedule: one engineer at 10 h/day; Sprint 1 has two gates a day | Any gate slip eats into Build directly | SM (track) / Muzi | Open | 2026-10-20 |
| R-02 | Security: `customerId` in path, no auth specified (IDOR). `/profile` returns PII (name, email) under POPIA | Weakens MR-01 if not handled; needs ADR/NFR, PII kept out of logs, analytics, URLs | Muzi | Open | 2026-10-20 |
| R-03 | Team agents created mid-session may not be loadable until a new session | Mitigated: agents run as general agents bound to their role files | SM | Closed 2026-10-21 | 2026-10-20 |
| R-05 | Design phase added 2026-10-22 consumes Sprint 2's pulled-forward buffer; Sprint 2 = 59.5 h of 60 h; only 2026-10-29 left as buffer. If design spills past 2026-10-22, cut Should/Could scope first | Deadline | SM / Muzi | Realised 2026-10-23: G5 passed 1 day late (2026-10-23, not 2026-10-22); tracked as R-08 | 2026-10-22 |
| R-06 | Figma Starter plan MCP call limit reached 2026-10-22: remaining design (XL 1920, dark theme, state boards, component library, prototype) cannot be written to Figma until the limit resets or the plan is upgraded | Mitigated 2026-10-22: remaining design delivered on the in-house Design canvas (Muzi chose option 1) | Designer | Mitigated | 2026-10-22 |
| R-04 | Every gate needs Muzi's sign-off; his capacity is limited | Sign-off becomes the bottleneck on the critical path | SM / Muzi | Open | 2026-10-20 |
| R-07 | Scope added 2026-10-22 (FR-37–FR-41, Phosphor swap, self-hosted font) vs ~0.5 h Sprint 2 slack. If late, cut in order: FR-41 rail links → FR-39 refresh → FR-37 greeting | Deadline 2026-10-28; 2026-10-29 buffer at risk | SM / Muzi | Open | 2026-10-22 |
| R-08 | Capacity: Sprint 2 = 59.5 h of 60 h (0.5 h slack); G5/G6 closure and I-01 fix fall on day 1 (2026-10-23). If late, cut per R-07: FR-41 rail links (#301) → FR-39 refresh (#303) → FR-37 greeting (#302) | Deadline 2026-10-28; only buffer 2026-10-29 (time unknown, A-01) | SM (track) / Muzi (cut decision) | Open | 2026-10-23 |

## Assumptions (unconfirmed until Muzi confirms)

| ID | Assumption | Impact | Owner | Status | Raised |
|---|---|---|---|---|---|
| A-01 | Deadline time and timezone on 2026-10-29 are unknown. Plan targets submission-ready by 2026-10-28 EOD | Buffer length unknown; a morning deadline leaves no buffer | Muzi | Open | 2026-10-20 |
| A-02 | Weekend 2026-10-24/25 is available | Confirmed: Muzi works every day | Muzi | Closed 2026-10-20 | 2026-10-20 |
| A-03 | Daily hours available | Confirmed: 10 h/day of focused work. Sprint 1 = ~30 h, Sprint 2 = ~60 h | Muzi | Closed 2026-10-20 | 2026-10-20 |
| A-04 | A public GitHub repo is acceptable for submission (MR-04) | If not, private repo + reviewer invite needed; contact unknown | Muzi | Open | 2026-10-20 |
| A-05 | Target users and devices (problem-definition U-01–U-03) are inferred, not researched | Layout and performance targets may be mis-set | PO | Open | 2026-10-21 |
| A-06 | Goal pacing formula: projected = currentSpent ÷ days elapsed × days in month | B9 AC-3 depends on it | PO / Muzi | Open | 2026-10-21 |
| A-07 | Provisional targets: 320–1920 px widths; 2.5 s load | Closed by nfr.md (NFR-P1, NFR-R1) | Muzi | Closed 2026-10-21 | 2026-10-21 |
| A-09 | Display conventions: ZAR format, unit of `spentChange`/`transactionChange` (%), timezone, what `1y` means, unlisted enum values (goal status, accountType, paymentMethod), icon set mapping (FA field map) | FR and UI rules depend on them | FA / Muzi | Open | 2026-10-21 |
| A-10 | Custom date range rules (start ≤ end, max span, future dates) are not in spec | BR/FR validation rules | BA / Muzi | Open | 2026-10-21 |
| A-11 | Category sort order and filter matching (exact name, case) are not in spec | B6/B8 behaviour | BA / FA | Open | 2026-10-21 |
| A-12 | Mock "today" (the reference date for periods, daysRemaining, pacing) is undefined | Closed by ADR-003: `MOCK_TODAY` env, default 2024-09-16 | Muzi | Closed 2026-10-21 | 2026-10-21 |
| A-13 | Use of `profile.totalSpent` (lifetime?) and `email` (display or not; PII) | B4 header, R-02 | PO / Muzi | Open | 2026-10-21 |
| A-14 | One period selection shared across summary, categories and transactions | Closed by ADR-002: one shared period | Muzi | Closed 2026-10-21 | 2026-10-21 |
| A-15 | `months` lower bound and non-integer handling (spec: default 12, max 24 only) | B2 validation, B7 | FA | Open | 2026-10-21 |
| A-16 | FA PROPOSED defaults with no other RAID ID: error/timeout handling rules, empty presets, no "Other" category grouping, month gaps in trends, page size 20, contradictory `hasMore`, derived colour tints | FR-01–FR-36 | FA / Muzi | Open | 2026-10-21 |
| A-17 | FA PROPOSED (G4 rework): transactions list behaviour if the categories date range is unavailable; one custom-range rule for single-day and long ranges (FR-15); `daysRemaining` counted exclusive of today (seed gives 14 on 2024-09-16); goal status thresholds; 7d/90d/1y window boundaries | FR-15, B2 seed, B9 | FA / Muzi | Open | 2026-10-21 |
| A-18 | FA PROPOSED (G4 rework 2): goal `warning` at ≥ 80% used (DQ-11); 7d/90d/1y start-date rules (DQ-16); `x-mock-scenario: slow` = 12 s delay (exceeds the 10 s timeout, so it triggers the error state); next-page and Retry failure handling; empty-state wording | FR-26, FR-34, B2, B9 | FA / Muzi | Open | 2026-10-21 |
| A-19 | FA PROPOSED (post-G4 errata): amounts formatted with `Intl.NumberFormat("en-ZA")` (N2); `endDate` inclusive; days split at Africa/Johannesburg midnight; seed timestamps in UTC (N20) | FR display and period rules, B2, B3 | FA / Muzi | Open | 2026-10-21 |
| A-20 | FA design PROPOSED (renamed DS-01–DS-16 in `docs/design/screen-spec.md`; Q-09 decided 2026-10-21; DS-16 re-activating the selected category clears the filter is new) Q-05–Q-15 (`docs/design/screen-spec.md`, `tokens.md`): system font stack; derived category shades (API hex never painted); brand red decorative only; derived dark-theme blue; horizontal bar chart; collapsible trends table; grid spec; polite announcements; 44 px touch targets; period select or radio by breakpoint. Q-09 (history push vs scroll restore after refresh) needs Muzi | G5, B4–B10 | FA / Muzi | Open | 2026-10-21 |
| A-21 | Open after the bundle: (a) `1y` preset spans 367 days inclusive, while the custom-range limit is 366. PROPOSED: N-day presets are N days inclusive, so `1y` = MOCK_TODAY − 364 … MOCK_TODAY (365 days) · (b) non-numeric `months`/`limit`/`offset` → spec default (PROPOSED, consistent with Q-01) · (c) SM-05 still expects the same row after refresh → PO amends to match the history decision | Decided by Muzi 2026-10-21: (a) 1y = 365 days inclusive; (b) non-numeric → spec default; (c) SM-05/G-02 amended | FA / PO | Closed 2026-10-21 | 2026-10-21 |
| A-22 | Design questions UXQ-08 (region heights unspecified) and UXQ-09 (320 px KPI tiles too narrow: "Groceries" breaks mid-word) in `docs/design/figma-handoff.md` | D4 hi-fi, FR-03, FR-05 | FA / Muzi | Open | 2026-10-22 |
| A-23 | FR-37 greeting time bands (boundaries for each greeting) | FR-37 copy and tests | FA / Muzi | Open | 2026-10-22 |
| A-24 | Greeting uses the Africa/Johannesburg (SAST) clock, not the device clock | FR-37, A-19 | FA / Muzi | Open | 2026-10-22 |
| A-25 | Greeting first-name rule (first token of `profile.name`); known limitation: wrong for family-name-first names | FR-37, A-13 (PII) | FA / Muzi | Open | 2026-10-22 |
| A-26 | FR-38 "Updated" time changes only when all blocks have loaded; on refresh failure (FR-39) old data stays visible | FR-38, FR-39 | FA / Muzi | Open | 2026-10-22 |
| A-27 | FR-40 About this demo dialog copy | FR-40, README | FA / Muzi | Open | 2026-10-22 |
| A-08 | Build PBIs B1–B11 (ADO #91, #98, #106, #114, #123, #131, #141, #148, #158, #165, #173 under Epic #29; mirrored in docs/product/backlog.md) are provisional until G6 | Refined against FRs at #28 | SM | Closed 2026-10-23: refined against FRs and G5 design; G6 PASSED (Muzi sign-off 2026-10-23) | 2026-10-21 |
| A-28 | G5 defaults D1–D5 (G5.md sign-off section: tooltip-only greeting + tap, DS-19 chart defaults, no Check glyph, one dark state board, over-budget text + ring) accepted as built; Muzi may override any of them | FR-01, FR-17, FR-24, C-04, C-09, C-11; B4–B9 build | Muzi / FA | Open | 2026-10-23 |

## Issues

| ID | Issue | Impact | Owner | Status | Raised |
|---|---|---|---|---|---|
| I-01 | `pennywise` sits inside stray parent repo `~/Documents/Github/.git` (old "test-auto"). Action: move it to Trash, run `git init` in `pennywise` | **Blocks first commit** | Muzi | Open (blocker) | 2026-10-20 |
| I-02 | API is read-only: no `PATCH` for categories, no `POST` for goals. Recategorisation can't be saved | Top user friction (F1) can't be persisted. Decision: build to spec exactly; labelled extensions only after primary scope | Muzi | Decided 2026-10-20 | 2026-10-20 |
| I-03 | No merchant filter or text search on `/transactions` | Merchant view / export (F4) not solvable server-side; extension only per I-02 | FA / Muzi | Open | 2026-10-20 |
| I-04 | No income, balance or upcoming-debits data | "Left to spend" not possible; only spend pacing from `/goals` | PO | Open | 2026-10-20 |
| I-05 | Sample data inconsistent: `profile.totalSpent` R15,420.50 vs 6-month `/trends` sum R24,223.15; date ranges misaligned across endpoints | Mock data must be internally consistent; deviations from spec values must be documented | Muzi | Open | 2026-10-20 |
| I-06 | None of the 6 API category colours meets WCAG 3:1 on white (lowest: Dining `#F7DC6F` 1.36) | Closed by derived palette in `docs/design/tokens.md` (28/28 ≥ 3:1, QA-verified) | FA | Closed 2026-10-21 | 2026-10-20 |
| I-07 | Mock backend approach undecided (research §6.3) | Closed by ADR-003 (route handlers + MSW, one seed) | Muzi | Closed 2026-10-21 | 2026-10-20 |
| I-08 | "1 page" is undefined in the charter (QA-B1) | Resolved: 1 A4 page ≈ 60 table rows for decision docs; reference tables exempt (charter standard 1) | Muzi | Closed 2026-10-21 | 2026-10-21 |
| I-09 | Spec sample: category `transactionCount` sums to 53, but summary `transactionCount` is 47 | Mock data must reconcile (with I-05) | FA / Muzi | Open | 2026-10-21 |
| I-10 | Research GAP-02 and PO NG-02 disagree on the merchant filter | Decided by Muzi 2026-10-21: merchant filter is a **non-goal** for primary scope; `merchant` query param listed as a labelled API extension candidate (with I-02/I-03) | BA + PO | Closed 2026-10-21 | 2026-10-21 |
| I-11 | G1 non-blocking findings: 4 mis-tags (BM-03, F-08, F-12, BM-07), F-07 wrong source, lost context (sample size, Play Store unsampled, `comparedToPrevious`), F-10 should read "yes (derived)" | Fixed; G1 re-check PASS (docs/quality/gate-checks/G1.md). Residual non-blocking N11 (auto-categorisation fact lost in merge), N12 (F-07 unsourced) → BA follow-up | BA | Closed 2026-10-21 | 2026-10-21 |
| I-13 | Shared period vs spec params (QA G3 N3): summary accepts `period` only | Decided by Muzi 2026-10-21: presets map to ranges ending on `MOCK_TODAY`; custom range → categories and transactions; summary shows "Available for preset periods only" (ADR-002) | FA | Closed 2026-10-21 | 2026-10-21 |
| I-14 | Theme storage vs device-only (QA G3 N5) | Decided by Muzi 2026-10-21: device default + persisted manual toggle (ADR-002, FR-25) | FA | Closed 2026-10-21 | 2026-10-21 |
| I-15 | QA test-design questions Q-01–Q-11 (`docs/quality/test-cases.md` §4): malformed-param conflict (FR-34 vs ADR-003), paging replace vs append, history push/replace, scroll restore after refresh, date edges, e2e edge-data injection, CI job placement, UI copy, MR-04/MR-05 traceability, FR header | Decided by Muzi 2026-10-21 (approve bundle): see ADR-002/003/005 rev. 3; FA applying to FRs/design | FA / QA | Closed 2026-10-21 | 2026-10-21 |
| I-16 | Root cause of rejected wireframes (2026-10-22): D-01 brand research never done (site fetch blocked → 2 logo hex values); SM recommended approving the gap; tokens invented for contrast; wireframes produced as annotated spec boxes, not design. Fix: real Capitec research (`docs/design/capitec-design-language.md`), re-derive tokens, redesign hi-fi | Design quality, G5 | Designer / FA / SM | Closed 2026-10-23: resolved. Redesign on canvas v34; G5 PASSED (QA re-run 3 PASS WITH NOTES, Muzi sign-off 2026-10-23) | 2026-10-22 |
| I-17 | New UI controls (greeting, date line, refresh, About dialog, rail links) had no FR/BR | Resolved by FR-37–FR-41 (Muzi approved 2026-10-22) | FA / BA | Closed 2026-10-22 on doc update | 2026-10-22 |
| I-18 | Design language approved 2026-10-22 (logo dark mode on white patch, light rail, white frame, #F7F7F7 content, navy Spent tile, Nunito Sans); tokens must be re-derived | `tokens.md`, G5 | FA | Closed 2026-10-23: tokens re-derived (TK Rev 5.1 = master canvas; G5 review row 19) | 2026-10-22 |
| I-19 | Approved design changes (incl. FR-06 neutral change cues) not yet in `screen-spec.md` | G5 spec coverage | FA | Closed 2026-10-23: approved changes in screen-spec Rev 4 (G5 criterion "Specs" met) | 2026-10-22 |
| I-20 | G5 coverage gap: frames needed at 320/768/1280/1920, light + dark | G5 exit criteria | Designer | Closed 2026-10-23: frames at 320/768/1280/1920 × light/dark (G5 review row 15) | 2026-10-22 |
| I-21 | Confirm landing page renders per request so the greeting is correct at request time (ADR-001) | FR-37; static render would freeze the greeting | Muzi | Open | 2026-10-22 |
| I-22 | Repo still inside stray parent git on 2026-10-23 (I-01 still open, Impediment #37). Muzi to run `mv ~/Documents/Github/.git ~/.Trash/test-auto-stray-git-2026-10-20`, then `git init -b main` in `pennywise` | **Blocks B1 #91 (first commit) on Sprint 2 day 1** | Muzi | Open (blocker) | 2026-10-23 |
| I-23 | Product renamed CapSense, but ADO project (`Capitec - Pennywise`) and repo folder (`pennywise`) keep the old name; charter "Work tracking" row says `Capitec - CapSense` (G6 N14) | Wrong links, confusing submission; rename or record as-is | Muzi (decision) | Open | 2026-10-23 |
| I-23 (closed) | Resolved 2026-10-25 (Muzi 2026-10-23: "capsense (rename all)"): ADO project renamed `Capitec - CapSense` (team `Capitec - CapSense Team`), local folder `~/Documents/Github/capsense`, GitHub repo `Mokhatla-Sifiso/capsense` | SM | Closed |
| I-24 | Test-only server clock override `MOCK_NOW` (TC Q-12) undecided: env, header or route hook; must be off in Docker like `x-mock-scenario` | TC-132 automation, #302 greeting tests (G6 N11); with I-21 | Muzi | Open | 2026-10-23 |
| I-12 | G1 slipped 1 day (planned 2026-10-20, QA PASS 2026-10-21) | Recovered: G1–G6 all passed by 2026-10-22; Sprint 2 starts 1 day early | SM | Closed 2026-10-22 | 2026-10-21 |

## Dependencies

| ID | Dependency | Impact | Owner | Status | Raised |
|---|---|---|---|---|---|
| D-01 | Capitec brand and design-language assets (colours, type, components) gathered from public sources; no official assets | Approved by Muzi 2026-10-21: Reported colours #E63934 / #00486D as accents only; no logo; README notes unofficial source; system font stack | FA / Muzi | Closed 2026-10-21 | 2026-10-20 |

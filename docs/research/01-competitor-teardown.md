# 01 — Competitor Teardown: Spending Insights

**Project:** CapSense (Customer Spending Insights Dashboard)
**Client:** Capitec Bank. Take-home project for the Software Engineer: Front-End role, framed as an independent consultant engagement.
**Submission requirements:** GitHub link · production-grade · runnable Dockerfile · README covering build, run and test.
**Date:** 2026-10-20
**Status:** Research complete. Not yet reviewed.

---

## 1. Purpose

Find out what proven spending-insights products do well, where Capitec's current experience causes friction, and what CapSense can do better **without removing useful functionality**.

Every claim below is tagged:

- **[Verified]**: read directly on an official source or in real user reviews during this research.
- **[Reported]**: from press or third-party articles. Probably true, but not checked first-hand and possibly out of date.
- **[Inference]**: my reasoning, not a sourced fact.

---

## 2. Capitec today

### 2.1 What exists

| Capability | Detail | Confidence |
|---|---|---|
| Track tab | Sign in → choose account → **Track** → **Money out** / **Money in** → choose category → details | [Verified] help-centre page |
| Auto-categorisation | Spend sorted into categories such as food, transport and communication | [Verified] Capitec blog, Jul 2022 |
| Recategorise + "learn" | "If the app allocates something to the wrong category, you can change it. The app will then 'learn'" | [Verified] as Capitec's claim. Contradicted by user reviews (see 2.2) |
| Live Better round-ups | Small automatic savings ("R1 or R2 here and there") | [Verified] user review, Jun 2025 |
| Older Budget Tool (2014) | Monthly budgets per category, daily spend vs budget | [Reported] News24, 2014. Unclear whether it still exists |
| Budget alerts | Not found for Capitec. Third-party guide lists them for FNB/Vault22 but not Capitec | [Reported] gap |

### 2.2 What users complain about

Source: the 500 most recent **South African iOS App Store** reviews (Jun 2024 – Oct 2026). Of these, 53 matched insight-related keywords and 7 are directly about tracking.

**Caveat:** these are signals, not statistics. Most reviews are about login, the lotto tab, and selfie verification. Google Play was not sampled.

| # | Friction | Evidence (date, ★) |
|---|---|---|
| F1 | **Recategorisation is broken or can't be found.** Users ask for a feature Capitec says already exists, or report that it doesn't save. | "Please add a feature to enable users to reallocate expenses that were not categorised properly" (2025-01, 3★). "When updating a category, it doesn't show the change" (2024-12, 4★) |
| F2 | **The category drill-down gets stuck.** It keeps showing the first category the user selected. | "the view gets stuck on the first category I selected" (2026-05, 2★) |
| F3 | **The statement loses the user's place.** It refreshes and jumps to the top while scrolling. | "the page refreshes, jumps to the top of the statement!!" (2026-04, 3★) |
| F4 | **There's no view by merchant and no filtered export.** The user wants to see all spend at one merchant, or only money in or only money out, over 12–36 months (for tax). | 2026-09, 4★ |
| F5 | **No dark mode or system theme.** This is the most-requested feature in the sample: **12 reviews**. | 2024-10 → 2026-08 |
| F6 | **The tracker is hard to discover.** A user asked for "an automatic expense tracker", which already exists. | 2024-08, 5★ |
| F7 | **There's no chart on the Track landing page.** | 2020 review (via search, older than the sample) |
| F8 | **Features disappear after updates**, which hurts trust. | Many lotto/feature-removal reviews in 2026 |

**What users praise (we must keep it):** speed and simplicity. One 5★ review in full: *"Quick, responsive. No AI."* (2026-08).

### 2.3 Friction in the flow itself [Inference]

- Reaching one category takes **4 navigation steps**, and the user has to pick an account before seeing any insight.
- Insights are **backward-looking only**: what you spent, with no pacing ("at this rate you'll go over by the 24th").
- **Money in** and **Money out** are separate modes. There's no single "net" view.

---

## 3. Benchmarks

| Product | What it does well | Lesson for CapSense | Confidence |
|---|---|---|---|
| **FNB nav» Money** | Smart budgets per category. Alerts at 50%, 70% and 90%. About 60 categories | Alerts while spending is happening, not after the month ends | [Reported] 2018–2022 press |
| **Discovery Bank – Vitality Money Analyser** | 166+ categories, category limits, rewards for good money behaviour | Positive reinforcement beats guilt. Very fine-grained categories add cognitive load | [Reported] Discovery's own content, 2021–22 |
| **Monzo Trends** | "Left to spend" = balance − upcoming scheduled payments | Looks forward, not just back | [Verified] Monzo help pages |
| **Copilot Money** | **"To Review" inbox** on the dashboard. Bulk review. Rules with a **preview of affected transactions** before saving. "Inbox zero" habit | Fixing categories becomes a small daily habit instead of a buried chore. Directly answers F1 | [Verified] Copilot help-centre and changelog |
| **Vault22** | Mentioned as the third-party app Capitec users add for better tracking | Capitec is losing insight engagement to third parties | [Reported] Code Cash |

---

## 4. Where CapSense wins (less friction, nothing useful lost)

| Keep (useful) | Remove (friction) | How | API supports it? |
|---|---|---|---|
| Auto categories + drill-down | 4-step navigation, stuck view (F2) | Category breakdown on the landing view. One tap filters the transaction list in place. Filter state lives in the URL, so back/forward and refresh always match what's shown | ✅ categories + transactions `?category=` |
| Recategorisation | Hidden, unreliable fix flow (F1) | A "Needs review" queue with one-tap confirm or change, and a preview of which transactions a rule will affect (Copilot pattern) | ❌ **No write endpoint** (see §5) |
| Long statement | Lost scroll position (F3) | Stable query keys, scroll and offset kept when going back, no full refetch on return | ✅ client-side architecture |
| Budgets / goals | Discovering overspend at month end | Pacing: projected month-end spend from `currentSpent`, days elapsed and `daysRemaining`. Show "on track / at risk" before it's too late | ✅ goals endpoint (derived) |
| Period comparison | Raw totals without context | Plain-language deltas from `comparedToPrevious` ("12.5% more than last 30 days") | ✅ summary |
| Merchant history + export (F4) | Not possible today | Merchant view + CSV export | ⚠️ **No merchant filter** (see §5) |
| Theme | Bright-only UI (F5) | Follow system light/dark | ✅ client-side |
| Simple and fast | "No AI" sentiment | Insights computed deterministically from the API. No chatbot, no LLM, and **no customer financial data sent to any model** | ✅ |

---

## 5. Gaps and issues in the provided API

These need a decision before we commit to an architecture (see §6).

**Functional gaps**

1. **Read-only.** There's no `PATCH` for transaction category and no `POST`/`PUT` for goals. Recategorisation (Capitec's top tracker complaint) can't be persisted.
2. **No `merchant` or text search** on `/transactions`, so F4 can't be solved server-side.
3. **No income, balance or upcoming debit orders.** A Monzo-style "left to spend" isn't possible. Spend pacing is possible.
4. **Only monthly granularity for trends.** Weekly or daily pacing would have to be derived from `/transactions` with date filters, at most 100 per page.
5. **Offset pagination** over about 1,250 rows works for this scope. Cursor pagination would be safer if transactions arrive while the user is scrolling [Inference].

**Inconsistencies in the sample data** (our mock data must not repeat these)

6. `profile.totalSpent` = **R15,420.50**, but the 6 months in `/trends` add up to **R24,223.15**.
7. Dates don't line up: trends end at `2024-06`, categories cover `2024-08-16 → 2024-09-16`, and both report the same R4,250.75.
8. Categories aren't sorted by amount (Utilities R458.70 comes after Shopping R450.80).

**Security / compliance flags (for the consultant write-up)**

9. `customerId` is in the path and no auth is described. The real service must check that the authenticated user owns `customerId`, otherwise any user could fetch another customer's data (IDOR risk).
10. `/profile` returns PII (name, email). Keep it out of logs, analytics and URLs. Relevant under POPIA.

**Design flags**

11. The API sends category colours, so the server controls how they look. **None of the six colours** reaches WCAG's 3:1 minimum for graphics on white [Verified, computed]: Dining `#F7DC6F` 1.36, Entertainment `#4ECDC4` 1.93, Utilities `#85C1E9` 1.94, Transportation `#45B7D1` 2.35, Shopping `#BB8FCE` 2.65, Groceries `#FF6B6B` 2.78. We'll need borders or labels, or a darker tint derived from each colour. Groceries is also red, which will clash with "warning/over budget" states [Inference].

---

## 6. Open decisions (need Muzi's call)

1. ~~**API extensions**~~ **Resolved (2026-10-20):** build against the spec exactly first. Labelled extensions (category `PATCH`, `merchant` filter, export) come only after all primary tasks are done.
2. ~~**Platform**~~ **Resolved:** a responsive web app. This is a front-end role, so front-end quality is what gets judged.
3. **Mock backend:** Should we build a mock server that exactly matches the spec, and if so, which way?
4. ~~**Rest of the brief**~~ **Resolved:** the deadline is **2026-10-29**. The written brief is one line: "Build a responsive financial analytics dashboard to display a customer's spending data (mocked data)". The API spec is the only attachment.
5. ~~**Branding**~~ **Resolved:** use Capitec branding and design language, with targeted improvements (for example a dark/system theme and accessible category colours).

---

## Sources

- Capitec – How to view and track your spending: https://www.capitecbank.co.za/were-here-to-help/how-to/how-to-track-your-spending/
- Capitec – What if there was a simpler way to budget? (27/07/2022): https://www.capitecbank.co.za/blog/articles/best-way-to-bank/what-if-there-was-a-simpler-way-to-budget/
- Capitec App Store reviews (ZA, public RSS feed, 500 most recent): https://apps.apple.com/za/app/capitec-bank/id1217842108
- News24 – Capitec launches money management tool (2014): https://www.news24.com/business/capitec-launches-money-management-tool-20141128
- Code Cash – Track spending on SA banking apps: https://codecash.co.za/track-spending-on-sa-banking-apps-complete-guide/
- BusinessTech – FNB launches new Nav Money tool: https://businesstech.co.za/news/banking/250773/fnb-launches-new-nav-money-tool/
- Sunday World – FNB's smart budgeting: https://sundayworld.co.za/news/fnbs-smart-budgeting-reveals-top-spend-from-customers/
- Discovery – Vitality Money Financial Analyser launch: https://discovery-holdings-ltd.mynewsdesk.com/pressreleases/discovery-bank-launches-vitality-money-financial-analyser-3139761
- Monzo – Spending, Balance and Targets in Trends: https://monzo.com/help/budgeting-overdrafts-savings/trends-spending-and-balance-web
- Monzo – Balance in Trends: https://monzo.com/blog/balance-in-trends
- Copilot – Quick start guide: https://help.copilot.money/en/articles/11157550-quick-start-guide
- Copilot – Copilot Money for web: https://help.copilot.money/en/articles/11780342-copilot-money-for-web
- Copilot – Transaction category rules (changelog): https://changelog.copilot.money/log/transaction-category-rules

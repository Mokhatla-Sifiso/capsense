# G3 Options Briefs (input to ADRs)

Owner: Muzi (decides) · Prepared: 2026-10-21 · Status: **Decided 2026-10-21** (approve recs) → see adr-001…007, nfr.md · Versions are npm latest on 2026-10-21. Exact pins are set at B1 (each ≥ 2 weeks old).

**Constraints in force:** front-end role (MR-05) · production-grade (MR-01) · one runnable Dockerfile (MR-02) · spec is fixed and read-only · ~48 h of build · keep scroll position and filters on navigation (F-02/F-03) · WCAG 2.1 AA · no PII in logs or URLs (R-02).
**Coupling:** ADR-001 drives the options for ADR-003 and ADR-006. Decide 001 first.

## ADR-001 Rendering approach

| Opt | Option                       | For                                                                                                        | Against                                                                 |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| A   | Next.js 16 (App Router)      | Oddity default; server components; route handlers can serve the mock API on the same origin; one container | Heavier runtime; more framework surface to justify to a front-end panel |
| B   | Vite 8 SPA + TanStack Router | Pure front-end; fastest dev loop; static output; type-safe URL search params (fits F-02)                   | Mock API needs MSW or a separate server; no server rendering            |

## ADR-002 Data fetching and state

| Opt | Option                                                                                                   | For                                                                               | Against                                            |
| --- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------- |
| A   | TanStack Query 5 for server state + **URL search params** for period, filters, sort and page, Zod-parsed | Caching (BR), refresh/back/forward restore the exact view (F-02), shareable links | Search-param parsing must be strict                |
| B   | TanStack Query + Zustand 5 for filter state, synced to the URL by hand                                   | Familiar store pattern                                                            | Two sources of truth for the same state; sync bugs |
| —   | Sub-decision A-14: one period shared by summary, categories and transactions?                            | Yes = consistent numbers across sections                                          | No = each section scoped independently             |

## ADR-003 Mock backend (I-07)

| Opt | Option                                                                                                          | For                                                                                   | Against                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| A   | MSW 3 in the browser (service worker)                                                                           | No server; the same handlers run in unit, component and e2e tests; real `fetch` calls | Mocks ship in the production build, so it needs an explicit "demo mode" flag |
| B   | Next.js route handlers implementing the 7 endpoints (only if ADR-001 = A)                                       | Real HTTP and real status codes; contract-testable; one container                     | Server code inside a front-end submission                                    |
| C   | Separate mock server (Node)                                                                                     | Clean split between client and server                                                 | Two processes; the MR-02 single Dockerfile becomes compose; time cost        |
| —   | Sub-decision A-12: mock "today" fixed (e.g. 2024-09-16, matching the spec samples) or relative to the real date | Fixed = deterministic tests and matches the spec                                      | Relative = looks current but makes tests flaky                               |

Seed data in every option: a deterministic generator reconciling I-05 and I-09 (totals, counts, percentages, dates).

## ADR-004 Charting and accessibility

| Opt | Option                            | For                                                             | Against                                           |
| --- | --------------------------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| A   | Recharts 3 (SVG, declarative)     | Fast to build; SVG can be made accessible; responsive container | Limited control over chart semantics              |
| B   | visx 4 (low-level SVG primitives) | Full control over markup and ARIA                               | Slowest to build                                  |
| C   | ECharts 6 (canvas)                | Richest visuals                                                 | Canvas is opaque to screen readers; larger bundle |

Every option still needs: a data-table alternative, non-colour cues (I-06), and reduced-motion support.

## ADR-005 Test tooling

| Opt | Option                                                                                         | For                                                                               | Against                                             |
| --- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------- |
| A   | Vitest 5 + Testing Library 16 (unit/component) + Playwright 1.64 + axe (e2e, a11y, responsive) | Native ESM and Vite speed; Playwright covers breakpoints and a11y; works with MSW | Two runners to configure                            |
| B   | Jest + Testing Library + Cypress                                                               | Widely known                                                                      | Slower; ESM friction; weaker multi-viewport support |
| —   | Optional: Storybook 10 for documenting component states                                        | Visual evidence of every state                                                    | About 3–4 h of the build budget                     |

## ADR-006 Containerisation

| Opt | Option                                                 | For                                          | Against                                        |
| --- | ------------------------------------------------------ | -------------------------------------------- | ---------------------------------------------- |
| A   | Multi-stage → Node runtime (Next standalone), non-root | Required if ADR-001 = A or ADR-003 = B       | Larger image                                   |
| B   | Multi-stage → nginx-unprivileged serving static files  | Small, hardened image; easy security headers | Static files only (fits ADR-001 B + ADR-003 A) |

## ADR-007 Styling and components

| Opt | Option                                    | For                                                                             | Against                                              |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| A   | Tailwind 4 + shadcn/ui (Radix primitives) | Oddity default; accessible primitives; tokens map to CSS variables (light/dark) | Utility-class noise in markup                        |
| B   | CSS Modules + custom components           | Full control over markup                                                        | Re-building accessible primitives by hand costs time |

## NFR proposals (A-07): confirm or change

| ID     | Proposal                                                                                        |
| ------ | ----------------------------------------------------------------------------------------------- |
| NFR-P1 | LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms. Lighthouse mobile profile, median of 3 runs               |
| NFR-P2 | Initial JS ≤ 250 KB gzipped                                                                     |
| NFR-A1 | WCAG 2.1 AA; axe: 0 serious or critical; Lighthouse a11y ≥ 95                                   |
| NFR-R1 | Widths 320–1920 px; no horizontal scroll at 320 px                                              |
| NFR-B1 | Latest 2 versions of Chrome, Edge, Firefox and Safari (incl. iOS Safari)                        |
| NFR-S1 | CSP and security headers; 0 high or critical dependency vulnerabilities; no PII in logs or URLs |

## Industry evidence → recommendation (non-binding; Muzi decides)

npm = weekly downloads 2026-10-12→18 (api.npmjs.org). SoJS = State of JS 2025. SoR = State of React 2025.

| ADR | Evidence                                                                                                                                                                 | Rec.                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 001 | react.dev recommends starting with a framework: Next.js App Router first. Next 41.1M npm; 58.6% usage (SoJS), satisfaction falling. Vite 119M npm, 97% satisfaction      | **A** Next.js 16: the official recommendation and the enterprise default                                                                                                                        |
| 002 | TanStack Query 40.1M npm, top satisfaction (SoR). nuqs 3.3M npm: type-safe URL state for Next. Zod 207M npm. Zustand 37.7M npm, but no shared client state needs it here | **A** TanStack Query + nuqs (URL state) + Zod 4. Period shared (A-14)                                                                                                                           |
| 003 | MSW 12.9M npm, self-described "industry standard API mocking". json-server 0.19M npm                                                                                     | **B + MSW**: route handlers serve the spec over real HTTP at runtime; MSW in tests; both use one deterministic seed module. Fixed "today" via env, default 2024-09-16 to match the spec samples |
| 004 | Recharts 33.3M npm (shadcn/ui charts are built on it), visx 4.1M, Chart.js 7.1M, ECharts 3.6M. Canvas is harder to make accessible                                       | **A** Recharts + data-table alternative                                                                                                                                                         |
| 005 | Vitest 77.5M vs Jest 25.8M npm; Vitest 95%, Playwright 94% satisfaction (SoJS). Playwright 46.6M vs Cypress 3.2M npm                                                     | **A** Vitest + Testing Library + Playwright + axe. Storybook optional (13.6M npm)                                                                                                               |
| 006 | Follows 001A / 003B                                                                                                                                                      | **A** multi-stage → Next standalone, non-root                                                                                                                                                   |
| 007 | Tailwind 84.7M npm; Radix (shadcn/ui base) 45.5M npm                                                                                                                     | **A** Tailwind 4 + shadcn/ui                                                                                                                                                                    |
| NFR | WCAG 2.2 is the current W3C Recommendation, superseding 2.1. Core Web Vitals "good" = LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (web.dev)                                     | Raise NFR-A1 to **WCAG 2.2 AA**; keep NFR-P1                                                                                                                                                    |

**Decide:** 001 · 002 (+A-14) · 003 (+A-12) · 004 · 005 (Storybook?) · 006 · 007 · NFRs. Reply as e.g. `001B 002A shared 003A fixed 004A 005A no-SB 006B 007A NFR ok`.

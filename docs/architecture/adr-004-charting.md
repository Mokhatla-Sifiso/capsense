# ADR-004 Charting and accessibility

| Field        | Value                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status       | **Accepted** · Muzi · 2026-10-21                                                                                                                                                        |
| Context      | Category breakdown and monthly trends must be accessible (WCAG 2.2 AA); none of the API category colours meet 3:1 (I-06)                                                                |
| Options      | A Recharts 3 · B visx 4 · C ECharts 6 (canvas)                                                                                                                                          |
| **Decision** | **A: Recharts 3 (SVG)**, via shadcn/ui chart wrappers (ADR-007)                                                                                                                         |
| Rationale    | 33.3M npm/wk vs visx 4.1M, Chart.js 7.1M, ECharts 3.6M; shadcn/ui charts are built on Recharts. SVG can be made accessible; canvas can't                                                |
| Consequences | Every chart ships with: an accessible data-table alternative, non-colour cues (labels/patterns), derived tints ≥ 3:1, and reduced-motion support. − Chart ARIA must be added by the app |
| Trace        | I-06; NFR-A1, NFR-A2; B6, B7, B10                                                                                                                                                       |

## Amendment 2026-10-29 (Muzi)

| Field        | Value                                                                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status       | **Accepted** · Muzi · 2026-10-29                                                                                                                                                       |
| Change       | Recharts is not used. The share rings and the monthly trends chart are hand-built SVG and HTML in the components that show them (`src/components/categories`, `src/components/trends`) |
| Why          | Page JavaScript had to stay within the 250 kB budget (NFR-P2); with every section built it is about 234 kB, and Recharts and its dependencies would not have fitted                    |
| Kept         | Every consequence above: the trends data table, non-colour cues, derived tints at 3:1 or more, keyboard selection with announcements, and an accessibility scan of every state         |
| Consequences | + Smaller page and full control of the markup and ARIA. − Chart layout code is the app's own to maintain                                                                               |
| Trace        | NFR-P2; FR-11, FR-28                                                                                                                                                                   |

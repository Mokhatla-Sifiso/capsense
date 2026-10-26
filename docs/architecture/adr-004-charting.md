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

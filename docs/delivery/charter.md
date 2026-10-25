# Delivery Charter: CapSense

## Team

| Role | Agent | Owns |
|---|---|---|
| Engineering owner | Muzi (human) | Architecture, ADRs, NFRs, build. **Approves every gate.** |
| Product Owner | `product-owner` | Problem definition, backlog, acceptance |
| Business Analyst | `business-analyst` | Research, BR-xx, business rules |
| Functional Analyst | `functional-analyst` | FR-xx, screen specs, API-to-UI map |
| QA / Tester | `qa-tester` | Test strategy, TC-xx, gate checks |
| Scrum Master | `scrum-master` | Sprint plan, RAID log, gate status |
| UI/UX Designer | `ui-designer` | Figma wireframes, UI, components, states, prototype; `figma-handoff.md` |

## Work tracking

| Item | Value |
|---|---|
| Tool | Azure DevOps (Scrum process) |
| Org / project | `mokhatlamzwakhe` / `Capitec - CapSense` |
| Owner | `scrum-master` |
| Rule | Repo docs hold content; ADO tracks work and links to doc paths |
| Figma | Design file `jvmhOq4HEYaZQvdTHhpdm4`: https://www.figma.com/design/jvmhOq4HEYaZQvdTHhpdm4/Untitled (Designer writes here only) |

## Gates

A gate passes only when its exit criteria are met, QA's check returns PASS, and Muzi signs off. Drafting may start as soon as its inputs are final (brief, API spec, signed-off docs). Gates pass strictly in order.

| Gate | Phase | Owner | Exit criteria | Status |
|---|---|---|---|---|
| G1 | Discovery | BA | Research condensed to 1 page; every claim tagged and sourced | **Passed**: Muzi sign-off 2026-10-21 |
| G2 | Problem Definition | PO | Problem, users, goals (G-xx), non-goals, constraints, success measures (SM-xx) | **Passed**: Muzi sign-off 2026-10-21 |
| G3 | Solution Architecture | Muzi | ADRs for every major decision; NFRs measurable | **Passed**: Muzi sign-off 2026-10-21 |
| G4 | Requirements | BA + FA | BR → FR → acceptance criteria are traceable; QA has confirmed every item is testable | **Passed**: Muzi sign-off 2026-10-21 |
| G5 | Design | FA + Designer | Specs: every screen × state × breakpoint; a11y criteria. **Figma:** variables, component library (all states), wireframes and hi-fi light/dark at 320/768/1280/1920, state boards, prototype; 100% spec coverage in `figma-handoff.md`; QA design review | **Passed**: Muzi sign-off 2026-10-23 (canvas v34; QA design review re-run 3 PASS WITH NOTES) |
| G6 | Build-ready | SM | Definition of Ready met; sprint backlog committed; test cases written | **Passed**: Muzi sign-off 2026-10-23 (re-check PASS WITH NOTES, PBI #295) |

## Document map

| Path | Owner |
|---|---|
| `docs/brief/` | Read-only inputs |
| `docs/research/` | BA |
| `docs/product/problem-definition.md`, `backlog.md` | PO |
| `docs/architecture/adr-NNN-*.md`, `nfr.md` | Muzi |
| `docs/requirements/business-requirements.md` | BA |
| `docs/requirements/functional-requirements.md`, `api-ui-field-map.md`, `data-quality.md` | FA |
| `docs/design/` (except `figma-handoff.md`) | FA |
| `docs/design/figma-handoff.md`, `capitec-design-language.md` + Figma file | Designer |
| `docs/quality/test-strategy.md`, `test-cases.md` | QA |
| `docs/delivery/sprint-plan.md`, `raid-log.md`, `ways-of-working.md` | SM |

## IDs

G goal · SM success measure · BR business requirement · RULE business rule · FR functional requirement · NFR non-functional requirement · ADR decision · TC test case · R risk · A assumption · I issue · D dependency

## Standards (all roles)

1. One page per document at most: 1 rendered A4 page (≈ 60 table rows) for decision documents. Reference tables (field map, FRs, test cases, traceability matrix, design tokens, screen spec) are exempt but must be tables only. Tables, not prose. No narrative. (Approved by Muzi 2026-10-21.)
2. Everything traces: G → BR → FR → TC.
3. No guessing. Unknowns become A-xx in the RAID log until Muzi confirms them.
4. Evidence is tagged Verified, Reported or Inference.
5. Only edit documents you own. Cross-role changes go to the RAID log as I-xx.
6. Dates are absolute (YYYY-MM-DD).
7. No code before G6. (G6 re-opened 2026-10-22: **Build closed** until G5 and G6 re-pass.)

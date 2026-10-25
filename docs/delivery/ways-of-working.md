# Ways of Working: CapSense

Owner: `scrum-master` · Status: **Draft, pending Muzi approval** · Sources: S1–S6 below

## 1. Work item hierarchy (Azure DevOps Scrum)

| Type       | Represents                                         | Mandatory fields                                                                                             | States                                                                          |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Epic       | One gate or phase                                  | Title, Start/Target Date, Tags                                                                               | New → In Progress → Done                                                        |
| PBI        | A deliverable that fits in one sprint              | Description (who/what/why), **numbered AC (AC-1…n)**, Effort (h), Business Value, Iteration, trace (BR/FR/G) | New → Approved (DoR met) → Committed (in sprint) → Done (DoD met + PO accepted) |
| Task       | One step of a PBI, **≤ 1 day, ideally 1–4 h** (S1) | Activity, Remaining Work, AC ref, Output                                                                     | To Do → In Progress → Done                                                      |
| Bug        | A code defect                                      | Repro Steps, System Info, Severity, Priority, AC, links (PBI, FR, TC)                                        | New → Approved → Committed → Done                                               |
| Impediment | A blocker                                          | Description, owner, resolution                                                                               | Open → Closed                                                                   |

## 2. Task standard

| Rule         | Standard                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Title        | `[Activity] <verb> <object> (AC-n)`, e.g. `[Testing] Verify empty state of category chart (AC-3)` |
| Activity     | One of: Requirements · Design · Development · Testing · Documentation · Deployment (S2)           |
| Traceability | Every task covers ≥ 1 AC of its parent PBI. Every AC is covered by ≥ 1 task                       |
| Description  | **Objective** · **AC ref** · **Inputs** · **Output** (doc path / PR) · **Done when** (checklist)  |
| Size         | > 8 h → split. Update Remaining Work daily (S2)                                                   |
| Review       | Every PBI has one `[Testing]` task (QA verify) and one `[Requirements]` task (PO accept)          |

## 3. Definition of Ready (PBI → Approved)

1. Description states who, what and why.
2. AC are numbered, testable and agreed by QA.
3. Traced to G/BR/FR. Dependencies are resolved or logged as D-xx.
4. Estimated (Effort) and fits within one sprint.
5. Tasks created to the §2 standard.

## 4. Definition of Done

| Level          | Done when                                                                                                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task           | Output exists at the stated path or PR. "Done when" checklist complete. Remaining Work = 0                                                                                                                                             |
| PBI (document) | All AC met. One page or less, tables only, IDs traced. QA verify PASS. PO accepted                                                                                                                                                     |
| PBI (code)     | All AC met. PR merged to `main` with `AB#<id>`. CI green. Lint and typecheck: 0 errors. Tests written and passing (thresholds per NFR, G3). Every UI state covered. a11y checks pass. Docs/README updated. QA verify PASS. PO accepted |
| Epic (gate)    | All child PBIs Done. QA gate check PASS. **Muzi sign-off recorded in the Epic discussion**                                                                                                                                             |

DoD per column is configured on the board (S3).

## 5. Bug standard (S4)

| Field       | Content                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------- |
| Title       | `<Component>: <actual behaviour> instead of <expected>`                                         |
| Repro Steps | Preconditions · numbered steps · **Expected** · **Actual** · evidence (screenshot/log)          |
| System Info | Browser + version · OS · viewport · build/commit SHA                                            |
| Severity    | 1 Critical · 2 High · 3 Medium · 4 Low (S4 definitions)                                         |
| Priority    | 1 fix before ship · 2 fix before ship, not urgent · 3 optional                                  |
| Links       | Parent PBI · FR-xx · TC-xx that found it · fixing PR                                            |
| Closure     | Fix verified by QA re-running the TC. Regression → new bug linked as Related, never reopen (S4) |

## 6. GitHub ↔ Azure Boards (S5)

| Artifact       | Convention                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Connection     | Azure Boards app connected to the GitHub repo (one org only)                                              |
| Branch         | `feature/AB<id>-<slug>` · `fix/AB<id>-<slug>`                                                             |
| Commit         | Conventional Commits + footer `AB#<taskId>`                                                               |
| PR description | What · Why · How tested · Checklist (DoD) · `Fixes AB#<pbiOrBugId>` (moves it to Done on merge to `main`) |
| Rule           | `AB#` must be in the commit message or PR **description**, not the PR title (S5)                          |

## 7. Boards (S3, S7, S8)

| Board            | Columns (WIP)                                                                                                       | Rules                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backlog (PBIs)   | New → Ready (DoR) → In Progress (3, split) → In Review (2, split) → QA Verify (2, split) → PO Acceptance (2) → Done | Each column's exit criteria are set as its board DoD. Swimlanes: **Expedite** (Sev 1–2, blockers) and Standard. Cards: Blocked tag = red, unchanged > 2 days = amber |
| Sprint taskboard | To Do → In Progress → In Review → QA → Done                                                                         | Blocked = Yes → red. Sev 1/2 bugs highlighted. Blockers are a flag and style, not a column (S8)                                                                      |

## Sources

S1 [Scrum Guide 2020](https://scrumguides.org/scrum-guide.html): DoD; sprint work decomposed to ≤ 1 day · S2 [Scrum process work items](https://learn.microsoft.com/en-us/azure/devops/boards/work-items/guidance/scrum-process-workflow) · S3 [Board columns: Definition of Done](https://learn.microsoft.com/en-us/azure/devops/boards/boards/add-columns) · S4 [Manage bugs](https://learn.microsoft.com/en-us/azure/devops/boards/backlogs/manage-bugs) · S5 [Link GitHub to work items](https://learn.microsoft.com/en-us/azure/devops/boards/github/link-to-from-github) · S6 [Show bugs on backlogs](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/show-bugs-on-backlog) · S7 [WIP limits](https://learn.microsoft.com/en-us/azure/devops/boards/boards/wip-limits) · S8 [Customize taskboard](https://learn.microsoft.com/en-us/azure/devops/boards/sprints/customize-taskboard)

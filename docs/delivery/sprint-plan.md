# Sprint Plan: CapSense

| As of            | Deadline                                                           | Capacity                                                                    |
| ---------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 2026-10-23 (Thu) | Done by 2026-10-28. 2026-10-29 is buffer only (deadline time A-01) | 1 engineer (Muzi), 10 h/day, every day incl. weekend (A-02, A-03 confirmed) |

## Sprints (Azure DevOps: `Capitec - CapSense`)

| Sprint   | Dates                                       | Hours                         | Scope                                                                                                         |
| -------- | ------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Sprint 1 | 2026-10-20 → 2026-10-22 (closed 2026-10-23) | 28 + 11.75                    | **Goal met 2026-10-23**: G1–G6 passed; D1–D7 + #295 Done (G5, G6 re-passed 2026-10-23, 1 day late: R-05/R-08) |
| Sprint 2 | 2026-10-23 → 2026-10-28                     | 59.5 committed / 60 available | Build, Release, Test, Submit                                                                                  |

## Milestones

| #   | Gate / phase                           | Target                  | Owner   | Exit evidence                                                                |
| --- | -------------------------------------- | ----------------------- | ------- | ---------------------------------------------------------------------------- |
| 0   | Repo hygiene (I-01, I-22): **overdue** | 2026-10-23, before B1   | Muzi    | `pennywise` has its own `.git`; first commit made                            |
| 1   | G1 Discovery                           | 2026-10-20              | BA      | 1-page research; claims tagged and sourced; QA PASS; sign-off                |
| 2   | G2 Problem Definition                  | 2026-10-20              | PO      | `problem-definition.md`; QA PASS; sign-off                                   |
| 3   | G3 Solution Architecture               | 2026-10-21              | Muzi    | ADRs (incl. I-07); `nfr.md` measurable; QA PASS; sign-off                    |
| 4   | G4 Requirements                        | 2026-10-21              | BA + FA | BR → FR → AC traceable; QA confirms testable; sign-off                       |
| 5   | G5 Design: **passed 2026-10-23**       | 2026-10-22              | FA      | Screen × state × breakpoint; a11y (I-06); tokens (D-01); QA PASS; sign-off   |
| 6   | G6 Build-ready: **passed 2026-10-23**  | 2026-10-22              | SM      | DoR met; Sprint 2 backlog committed; TC-xx written; QA PASS; sign-off        |
| 7   | Build (B1–B11)                         | 2026-10-23 → 2026-10-27 | Muzi    | Primary scope to spec; tests pass; no extensions before primary scope (I-02) |
| 8   | Dockerfile + README (MR-02, MR-03)     | 2026-10-27 → 2026-10-28 | Muzi    | Clean-clone build/run works; README covers build, run, test                  |
| 9   | Test / hardening                       | 2026-10-28              | QA      | All TC-xx PASS; a11y + responsive PASS; MR-01–05 PASS                        |
| 10  | Submission (MR-04)                     | 2026-10-28              | Muzi    | Final commit pushed; visibility confirmed (A-04); link sent                  |
| 11  | Buffer                                 | 2026-10-29              | SM      | Unused, or fixes logged in RAID only                                         |

## Sprint 2 day plan (10 h/day; order by dependency)

| Day            | PBIs (ADO) · hours                                                                                 | Σ h  |
| -------------- | -------------------------------------------------------------------------------------------------- | ---- |
| Thu 2026-10-23 | I-01 fix (Muzi, first commit) · B1 #91 4.0 · B2 #98 5.0 · B3 #106 1.0 (start)                      | 10.0 |
| Fri 2026-10-24 | B3 #106 3.0 · B4 #114 7.0 (#299 tokens/font, #300 frame, #301 rail, #302 greeting)                 | 10.0 |
| Sat 2026-10-25 | B4 #114 3.75 (#303 refresh, #304 theme, #305 About, #306/#307 verify) · B5 #123 3.25 · B6 #131 3.0 | 10.0 |
| Sun 2026-10-26 | B6 #131 1.5 · B7 #141 3.25 · B8 #148 5.0 · B9 #158 0.25 (start)                                    | 10.0 |
| Mon 2026-10-27 | B9 #158 2.0 · B10 #165 3.5 · B11 #173 2.0 · Dockerfile #34 2.5                                     | 10.0 |
| Tue 2026-10-28 | Dockerfile #34 0.5 · README #35 2.0 · Test #32 6.0 · Submit #36 1.0                                | 9.5  |
| Wed 2026-10-29 | Buffer only (A-01). Cut order if late: R-07 / R-08                                                 | 0    |

**Critical path:** G1 → … → G6 → Build → Test → Submit, sequential. Two gates per day in Sprint 1, so any gate slip eats into Build directly (R-01).

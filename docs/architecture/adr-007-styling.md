# ADR-007 Styling and components

| Field        | Value                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status       | **Accepted** · Muzi · 2026-10-21                                                                                                                               |
| Context      | Capitec look and feel (D-01), light/dark themes (F-05), accessible primitives, ~48 h build                                                                     |
| Options      | A Tailwind 4 + shadcn/ui · B CSS Modules + custom components                                                                                                   |
| **Decision** | **A: Tailwind CSS 4 + shadcn/ui (Radix primitives)**. Design tokens are CSS variables per theme (G5)                                                           |
| Rationale    | Tailwind 84.7M npm/wk; Radix 45.5M npm/wk; matches Oddity default                                                                                              |
| Consequences | + Accessible dialogs, menus and selects out of the box; tokens drive both themes. − Utility-class density; components are copied into the repo, so we own them |
| Trace        | D-01, F-05, I-06; C-03; NFR-A1, NFR-A2; B4, B10                                                                                                                |

## Amendment 2026-10-22 (Muzi)

| Field        | Value                                                                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status       | **Accepted** · Muzi · 2026-10-22                                                                                                                   |
| Icons        | Phosphor (`@phosphor-icons/react`, MIT), `fill` weight. Server components import from `@phosphor-icons/react/ssr`                                  |
| Removed      | `lucide-react`, including icons inside shadcn/ui components (replace with Phosphor equivalents)                                                    |
| Font         | Nunito Sans only, self-hosted via `next/font/local`, weights 400/600/700. Replaces the system font stack (A-20)                                    |
| Consequences | + One icon set; no runtime font request to a third party. − shadcn components diverge from upstream; font files committed and licence kept in repo |
| Trace        | I-18, R-07; FR-37–FR-41                                                                                                                            |

## Amendment 2026-10-29 (Muzi)

| Field        | Value                                                                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status       | **Accepted** · Muzi · 2026-10-29                                                                                                                                     |
| Change       | shadcn/ui and Radix are not used. Every control is plain HTML (native `select`, `dialog`, buttons and radio groups) styled with Tailwind CSS 4 and the design tokens |
| Removed      | `radix-ui`, `class-variance-authority` and the shadcn/ui setup (`components.json`, `src/components/ui`)                                                              |
| Why          | The native elements already give the keyboard and screen-reader behaviour the screens need, and they keep page JavaScript within the 250 kB budget (NFR-P2)          |
| Consequences | + Fewer dependencies and no copied component code. − Focus, dialog and select styling is the app's own                                                               |
| Trace        | NFR-P2; FR-28                                                                                                                                                        |

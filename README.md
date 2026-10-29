# CapSense

A responsive spending insights dashboard for the Capitec Front-End take-home. It shows a customer's spending summary,
spending by category, monthly trends, spending goals and transactions, read from the API in
[`docs/brief/api-spec.md`](docs/brief/api-spec.md), which this app serves itself from fixed sample data.

## What you need

- Node.js 22 (see `.nvmrc`)
- pnpm 12.6.0: run `corepack enable` once and Node picks the version from `package.json`
- Docker 24 or later, only to run the container

## Run it with Docker

```bash
docker build -t capsense .
docker run --rm -p 3000:3000 capsense
```

Open http://localhost:3000. The container runs as a non-root user and reports its health by requesting `/`.

If port 3000 is already in use, map another one, for example `-p 8080:3000`, and open http://localhost:8080.

## Run it locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. If port 3000 is in use, run `pnpm dev --port 3001` instead.

To run the production build instead of the development server:

```bash
pnpm build
pnpm start:standalone
```

`PORT=3001 pnpm start:standalone` changes its port.

### Settings

Both are optional; `.env.example` shows the defaults.

| Setting          | Default      | What it does                                                                                                                                                                                    |
| ---------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MOCK_TODAY`     | `2024-09-16` | The date the sample data treats as today                                                                                                                                                        |
| `MOCK_SCENARIOS` | `false`      | For tests only. When `true`, a request header `x-mock-scenario` of `error`, `empty`, `slow` or `edge` makes the API fail, return nothing, wait 12 seconds or return very long names and amounts |

## Test it

```bash
pnpm check
```

This checks formatting, lint and types, and runs the unit and component tests.

```bash
pnpm test:coverage
```

This runs the same tests with coverage. The pipeline needs at least 80% of lines covered.

End-to-end and accessibility tests run in Chromium against the production build:

```bash
pnpm build
pnpm test:e2e:install
pnpm test:e2e
```

They start the app on port 3217. If that port is in use, run `E2E_PORT=3300 pnpm test:e2e`. The report is written to
`playwright-report/`.

Other checks the pipeline runs:

```bash
pnpm check:size
```

The page's starting JavaScript must stay within 250 kB gzipped. Run this after a build.

```bash
pnpm check:pin-age
```

Every pinned dependency must have been released at least 14 days earlier. The exceptions, each with its reason, are
in `pin-age-exceptions.json`.

```bash
pnpm check:audit
```

There must be no high or critical security advisories.

## How it's built

- **App:** Next.js 16 with the App Router, React 19 and TypeScript in strict mode. The page shell is rendered on the
  server; each section is a client component that loads its own data, so one slow or failed section never blocks
  the others.
- **Data:** TanStack Query 5 fetches and caches each endpoint. Every response is checked against a Zod schema: a
  response that doesn't match shows as that section's error, and a single bad row in a list is left out. The period, custom dates, months, category, sort and page live in the
  address (nuqs), so Back, Forward and reload keep the customer's place.
- **API:** Next.js route handlers in `src/app/api` serve the 7 endpoints in the spec over real HTTP, from one
  deterministic seed in `src/server/mock`. The unit tests use MSW instead.
- **Screens:** Tailwind CSS 4 with the design tokens as CSS variables for light and dark, Phosphor icons and the
  Nunito Sans font, self-hosted. Controls are native HTML elements (`select`, `dialog`, radio groups), and the share
  rings and trends chart are hand-built SVG, to keep page JavaScript within the 250 kB budget.
- **Accessibility:** WCAG 2.2 AA. There's a skip link, a visible focus ring, keyboard selection in the chart, a data
  table for the chart, and no status shown by colour alone. An automated axe scan of every state runs in the
  pipeline.
- **Tests:** Vitest with Testing Library and MSW for units and components; Playwright with axe for end to end.
- **Delivery:** GitHub Actions runs the quality checks, end-to-end and accessibility tests, a Docker build with a
  health check, and pull request title and work item checks. The container uses Next.js standalone output.

| Folder           | Holds                                                              |
| ---------------- | ------------------------------------------------------------------ |
| `src/app`        | The page, layout, styles and the API route handlers                |
| `src/components` | One folder per section, plus shared states, dialogs and layout     |
| `src/lib`        | Formatting, the API client, queries, address state and chart maths |
| `src/schemas`    | The Zod schemas for every API response                             |
| `src/server`     | The sample data and the mock API behind the route handlers         |
| `e2e`            | Playwright end-to-end and accessibility tests                      |
| `docs`           | The brief, requirements, design, decisions and delivery documents  |

## Decision records

- [ADR-001 Rendering](docs/architecture/adr-001-rendering.md)
- [ADR-002 Data and state](docs/architecture/adr-002-data-and-state.md)
- [ADR-003 Mock backend](docs/architecture/adr-003-mock-backend.md)
- [ADR-004 Charting and accessibility](docs/architecture/adr-004-charting.md)
- [ADR-005 Test tooling](docs/architecture/adr-005-test-tooling.md)
- [ADR-006 Containerisation](docs/architecture/adr-006-containerisation.md)
- [ADR-007 Styling](docs/architecture/adr-007-styling.md)
- [Options considered](docs/architecture/adr-options.md) and [non-functional requirements](docs/architecture/nfr.md)

## Delivery documents

| Area         | Documents                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Brief        | [Brief](docs/brief/brief.md) · [API spec](docs/brief/api-spec.md)                                                                                                                                                                                      |
| Research     | [Competitor teardown](docs/research/01-competitor-teardown.md) · [Discovery summary](docs/research/02-discovery-summary.md)                                                                                                                            |
| Product      | [Problem definition](docs/product/problem-definition.md) · [Backlog](docs/product/backlog.md)                                                                                                                                                          |
| Requirements | [Business](docs/requirements/business-requirements.md) · [Functional](docs/requirements/functional-requirements.md) · [API to screen field map](docs/requirements/api-ui-field-map.md) · [Data quality](docs/requirements/data-quality.md)             |
| Design       | [Screen spec](docs/design/screen-spec.md) · [Design tokens](docs/design/tokens.md) · [Figma handoff](docs/design/figma-handoff.md) · [Capitec design language](docs/design/capitec-design-language.md) · [Brand sources](docs/design/brand-sources.md) |
| Quality      | [Test strategy](docs/quality/test-strategy.md) · [Test cases](docs/quality/test-cases.md) · [Gate checks](docs/quality/gate-checks)                                                                                                                    |
| Delivery     | [Charter](docs/delivery/charter.md) · [Sprint plan](docs/delivery/sprint-plan.md) · [Ways of working](docs/delivery/ways-of-working.md) · [RAID log](docs/delivery/raid-log.md)                                                                        |

Work is tracked in Azure DevOps (project "Capitec - CapSense"), and every pull request names its work item with
`AB#<id>`.

## Limitations

- There's no sign-in: the API's `customerId` is one fixed sample customer, `12345`, in the address of every request.
- The data is sample data, fixed to 16 September 2024 by default.
- The dashboard is read-only, so goals can't be created or edited.

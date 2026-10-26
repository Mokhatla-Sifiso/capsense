# CapSense

Responsive customer spending insights dashboard for the Capitec Front-End take-home: summary, spending by
category, monthly trends, goals and transactions over the fixed (mocked) API in `docs/brief/api-spec.md`.

> Status: foundation (B1). Features land ticket by ticket in Sprint 2. The approved design, requirements and
> architecture decisions are in [`docs/`](docs/).

## Stack (ADR-001 – ADR-007)

Next.js 16 (App Router, React 19, TypeScript strict) · TanStack Query 5 + nuqs + Zod 4 · Next.js route handlers
serving the 7 spec endpoints from one deterministic seed (MSW in tests only) · Recharts 3 · Tailwind CSS 4 +
shadcn/ui (Radix) · Phosphor icons · Vitest + Testing Library + Playwright + axe · Docker (Next standalone, non-root).

## Requirements

- Node.js 22 (`.nvmrc`) and pnpm 12 (`corepack enable`)
- Docker 24+ (only for the container)

## Run locally

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Configuration (optional, see `.env.example`): `MOCK_TODAY` (default `2024-09-16`) and `MOCK_SCENARIOS`
(test-only `x-mock-scenario` header; keep `false`).

## Test

```bash
pnpm check              # format, lint, typecheck, unit + component tests
pnpm test:coverage      # coverage gate: lines ≥ 80% (NFR-Q1)
pnpm build && pnpm test:e2e:install && pnpm test:e2e   # Playwright + axe against the production build
pnpm check:size         # initial JavaScript on / must stay within 250 kB gzipped (run after a build)
pnpm check:pin-age      # every pinned version must be at least 14 days old
pnpm check:audit        # no high or critical advisories
```

## Docker

```bash
docker build -t capsense .
docker run --rm -p 3000:3000 capsense   # http://localhost:3000 (HEALTHCHECK: GET /)
```

## Delivery

- CI (GitHub Actions): quality gates, e2e + accessibility, Docker build and health smoke, Conventional Commit PR
  titles, Azure Boards `AB#` link check. CD publishes `ghcr.io/mokhatla-sifiso/capsense` from `main`.
- Work is tracked in Azure DevOps (`Capitec - CapSense`); every PR references its work item with `Fixes AB#<id>`.
- Dependencies are pinned to exact versions that were at least 14 days old when pinned. Exceptions, each with a
  reason, live in `pin-age-exceptions.json`; today that is Next.js 16.4.3 and React 19.3.1, kept for security fixes.
- Limitation: there is no authentication; the API's `customerId` is a fixed sample customer (`12345`).

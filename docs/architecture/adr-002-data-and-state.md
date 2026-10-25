# ADR-002 Data fetching and state

| Field | Value |
|---|---|
| Status | **Accepted** · Muzi · 2026-10-21 (rev. 3: G6 bundle Q-02, Q-09) |
| Context | Seven read endpoints. Filters, sort and page must survive refresh, back and forward (F-02); scroll position kept (F-03); no redundant refetch; untrusted responses must never crash the UI |
| Options | A TanStack Query + URL search params · B TanStack Query + Zustand synced to the URL |
| **Decision** | **A: TanStack Query 5 (server state, hydrated from RSC prefetch per ADR-001) + nuqs (type-safe URL state) + Zod 4 (response and search-param schemas)**. No global client store |
| Period model | **One shared period** (closes A-14). Presets `7d/30d/90d/1y` map to date ranges ending on `MOCK_TODAY`. A custom range drives categories (`startDate/endDate`) and transactions. Summary (spec: `period` only) shows "Available for preset periods only" while a custom range is active |
| History & paging | Filter, sort and page changes **replace** the history entry; selecting a category (drill-down) **pushes** one. Back restores scroll (F-03); hard refresh starts at the top; nothing extra stored. Pagination **replaces** the page (Previous/Next, "Showing 21–40 of N") |
| Theme | Follows the device setting by default; manual toggle (light/dark/system) persisted in `localStorage` inside try/catch, falling back to system (N5) |
| Rationale | TanStack Query 40.1M npm/wk, top satisfaction (State of React 2025). nuqs 3.3M npm/wk. Zod 207M npm/wk. The URL as single source of truth removes sync bugs |
| Consequences | + Shareable, restorable views; cache keyed by endpoint + params. − Search params must be strictly parsed and clamped (A-10, A-15). `refetchOnWindowFocus: false` (FR-19, N10). **Deviation:** Zod 4 replaces the Oddity default Zod 3 (newer major, approved via recommendation, N12) |
| Trace | F-02, F-03; BR-19; FR-19, FR-25; B3, B4, B5, B6, B8 |

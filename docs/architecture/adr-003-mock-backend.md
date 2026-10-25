# ADR-003 Mock backend (closes I-07)

| Field | Value |
|---|---|
| Status | **Accepted** · Muzi · 2026-10-21 (rev. 3: G6 bundle Q-01, Q-06) |
| Context | The brief requires mocked data; the API spec is fixed. Reviewers run one Dockerfile. Tests need isolation. Spec sample data is internally inconsistent (I-05, I-09) |
| Options | A MSW in the browser · B Next.js route handlers · C separate mock server |
| **Decision** | **B + MSW:** Next.js route handlers implement the 7 endpoints exactly as specified over real HTTP. **One deterministic seed module** feeds the handlers and the RSC prefetch (ADR-001). **MSW 3 runs in tests only** (Vitest, in Node) and reuses the seed |
| Mock "today" | Fixed by env `MOCK_TODAY`; default **2024-09-16** (closes A-12) |
| E2E states | Test-only header `x-mock-scenario: error|empty|slow|edge` (`edge` = long names, amounts ≥ R 1 000 000; `error` = HTTP 500), honoured **only** when env `MOCK_SCENARIOS=true`. Off by default and in Docker. Read by the route handlers **and** by the RSC prefetch (via the incoming page request's `headers()`), so first-render states are testable too. Playwright sets it with `extraHTTPHeaders`. **Non-spec test harness**, labelled as such |
| Non-spec behaviour | Unknown `period`/`sortBy` → **spec default**; out-of-range numbers (`limit` > 100, `months` > 24) → **clamped** (FR-34); **malformed dates** → `400` with a documented error body. Unknown `customerId` returns `404`. All are labelled extensions (spec defines no errors). Health probe = `GET /` (no extra endpoint) (N4) |
| Rationale | MSW is the de facto API mocking standard (12.9M npm/wk vs json-server 0.19M). Route handlers keep the runtime honest (real status codes, curl-able) inside one container |
| Consequences | + Contract tests against the spec; no mocks in client bundles. − Server code in a front-end submission (MR-05; README explains). Seed inconsistencies are resolved in `docs/requirements/data-quality.md` (owner FA, N11) |
| Trace | I-05, I-07, I-09, A-12; C-01; NFR-O1, NFR-S2; B2, B3; MR-02 |

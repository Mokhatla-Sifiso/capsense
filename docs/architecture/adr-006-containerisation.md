# ADR-006 Containerisation

| Field        | Value                                                                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Status       | **Accepted** · Muzi · 2026-10-21                                                                                                                                                                                         |
| Context      | MR-02 requires a runnable Dockerfile. ADR-001 (Next.js) and ADR-003 (route handlers) need a Node runtime                                                                                                                 |
| Options      | A multi-stage → Node runtime (Next standalone) · B multi-stage → nginx static                                                                                                                                            |
| **Decision** | **A: multi-stage build (deps → build → runtime) producing Next.js `standalone` output on a slim Node LTS base, running as a non-root user**, with `HEALTHCHECK` and `.dockerignore`                                      |
| Rationale    | Follows ADR-001 A and ADR-003 B, which both need a Node runtime; `standalone` output is Next's documented container path                                                                                                 |
| Consequences | + Single `docker build` / `docker run`; security headers set in Next config (NFR-S1). `HEALTHCHECK` uses `node -e` fetch of `GET /` (no curl on slim base). − Larger image than nginx; base image pinned by digest at B1 |
| Trace        | MR-02; NFR-S1; #34                                                                                                                                                                                                       |

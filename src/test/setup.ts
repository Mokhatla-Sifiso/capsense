import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

// MSW (ADR-003, tests only) is wired here in B3 (#106) once handlers exist: server.listen/resetHandlers/close.
afterEach(() => {
  cleanup();
});

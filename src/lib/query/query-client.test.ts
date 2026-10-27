import { getQueryClient, makeQueryClient } from "./query-client";

describe("query client", () => {
  it("never refetches on its own and never retries by itself", () => {
    const queries = makeQueryClient().getDefaultOptions().queries;
    expect(queries).toMatchObject({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: Number.POSITIVE_INFINITY,
    });
  });

  it("keeps one client for the whole browser session", () => {
    expect(getQueryClient()).toBe(getQueryClient());
  });
});

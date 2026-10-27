import { dehydrate } from "@tanstack/react-query";
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

  it("hands queries that are still loading from the server to the browser", () => {
    const client = makeQueryClient();
    void client.prefetchQuery({ queryKey: ["slow"], queryFn: () => new Promise(() => undefined) });
    expect(dehydrate(client).queries.map((query) => query.queryKey)).toEqual([["slow"]]);
  });
});

import { QueryObserver } from "@tanstack/react-query";
import { getQueryClient, makeQueryClient } from "./query-client";

describe("query client", () => {
  it("never refetches on its own and never retries by itself", () => {
    const queries = makeQueryClient().getDefaultOptions().queries;
    expect(queries).toMatchObject({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      retryOnMount: false,
      staleTime: Number.POSITIVE_INFINITY,
    });
  });

  it("leaves a failed request failed when another section starts using it, until Retry", async () => {
    const client = makeQueryClient();
    const queryFn = vi.fn().mockRejectedValue(new Error("down"));
    await client.prefetchQuery({ queryKey: ["profile"], queryFn });
    const stop = new QueryObserver(client, { queryKey: ["profile"], queryFn }).subscribe(() => {});
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(queryFn).toHaveBeenCalledTimes(1);
    stop();
  });

  it("keeps one client for the whole browser session", () => {
    expect(getQueryClient()).toBe(getQueryClient());
  });
});

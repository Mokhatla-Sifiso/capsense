import type { z } from "zod";

export const REQUEST_TIMEOUT_MS = 10_000;

export type ApiErrorKind = "network" | "timeout" | "status" | "invalid";

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface FetchOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function fetchJson<T>(path: string, schema: z.ZodType<T>, options: FetchOptions = {}): Promise<T> {
  const { signal, timeoutMs = REQUEST_TIMEOUT_MS } = options;
  const timeout = AbortSignal.timeout(timeoutMs);
  const url = new URL(path, globalThis.location?.origin);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timeout.aborted) throw new ApiError("timeout", "The request took longer than 10 seconds");
    throw new ApiError("network", "The request couldn't reach the server");
  }

  if (!response.ok) throw new ApiError("status", `The server answered ${response.status}`, response.status);

  const parsed = schema.safeParse(await response.json().catch(() => undefined));
  if (!parsed.success) throw new ApiError("invalid", "The response didn't match the API contract");
  return parsed.data;
}

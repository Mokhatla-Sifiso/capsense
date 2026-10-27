import type { z } from "zod/mini";

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

async function send(url: URL, cancelled: AbortSignal | undefined, timedOut: AbortSignal): Promise<Response> {
  const stopWhen = cancelled ? AbortSignal.any([cancelled, timedOut]) : timedOut;
  try {
    return await fetch(url, { headers: { accept: "application/json" }, signal: stopWhen });
  } catch (error) {
    if (cancelled?.aborted) throw error;
    if (timedOut.aborted) throw new ApiError("timeout", "The request took longer than 10 seconds");
    throw new ApiError("network", "The request couldn't reach the server");
  }
}

async function readBody<T>(response: Response, schema: z.ZodMiniType<T>): Promise<T> {
  if (!response.ok) throw new ApiError("status", `The server answered ${response.status}`, response.status);
  const body: unknown = await response.json().catch(() => undefined);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ApiError("invalid", "The response didn't match the API contract");
  return parsed.data;
}

export async function fetchJson<T>(path: string, schema: z.ZodMiniType<T>, options: FetchOptions = {}): Promise<T> {
  const url = new URL(path, globalThis.location?.origin);
  const timedOut = AbortSignal.timeout(options.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const response = await send(url, options.signal, timedOut);
  return readBody(response, schema);
}

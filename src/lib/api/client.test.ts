import { HttpResponse, delay, http } from "msw";
import { profileSchema } from "@/schemas/api";
import { server } from "@/test/msw";
import { specProfile } from "@/test/spec-samples";
import { ApiError, fetchJson } from "./client";

const PROFILE = "/api/customers/12345/profile";

function answerProfileWith(resolver: Parameters<typeof http.get>[1]) {
  server.use(http.get("*/api/customers/:customerId/profile", resolver));
}

async function failure(promise: Promise<unknown>): Promise<ApiError> {
  const error = await promise.then(
    () => null,
    (reason: unknown) => reason,
  );
  if (!(error instanceof ApiError)) throw new Error(`Expected an ApiError, got ${String(error)}`);
  return error;
}

describe("fetchJson", () => {
  it("returns the checked response", async () => {
    await expect(fetchJson(PROFILE, profileSchema)).resolves.toEqual(specProfile);
  });

  it("drops fields the contract doesn't define", async () => {
    answerProfileWith(() => HttpResponse.json({ ...specProfile, internalNote: "x" }));
    await expect(fetchJson(PROFILE, profileSchema)).resolves.toEqual(specProfile);
  });

  it("reports the status when the server answers with an error", async () => {
    answerProfileWith(() => HttpResponse.json({ error: "server_error" }, { status: 500 }));
    const error = await failure(fetchJson(PROFILE, profileSchema));
    expect(error).toMatchObject({ kind: "status", status: 500 });
  });

  it("refuses a response that breaks the contract", async () => {
    const { currency: _currency, ...withoutCurrency } = specProfile;
    answerProfileWith(() => HttpResponse.json(withoutCurrency));
    expect((await failure(fetchJson(PROFILE, profileSchema))).kind).toBe("invalid");
  });

  it("refuses a body that isn't JSON at all", async () => {
    answerProfileWith(() => new HttpResponse("<html>oops</html>", { headers: { "content-type": "text/html" } }));
    expect((await failure(fetchJson(PROFILE, profileSchema))).kind).toBe("invalid");
  });

  it("reports a network failure", async () => {
    answerProfileWith(() => HttpResponse.error());
    expect((await failure(fetchJson(PROFILE, profileSchema))).kind).toBe("network");
  });

  it("gives up when the server is too slow", async () => {
    answerProfileWith(async () => {
      await delay(200);
      return HttpResponse.json(specProfile);
    });
    expect((await failure(fetchJson(PROFILE, profileSchema, { timeoutMs: 20 }))).kind).toBe("timeout");
  });

  it("lets a cancelled request stay a cancellation, not an error to show", async () => {
    answerProfileWith(async () => {
      await delay(200);
      return HttpResponse.json(specProfile);
    });
    const controller = new AbortController();
    const pending = fetchJson(PROFILE, profileSchema, { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.not.toBeInstanceOf(ApiError);
  });
});

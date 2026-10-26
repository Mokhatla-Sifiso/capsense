import { NextRequest } from "next/server";
import { profileSchema } from "@/schemas/api";
import { GET } from "./route";

function getProfile(customerId: string): Promise<Response> {
  const request = new NextRequest(`http://localhost/api/customers/${customerId}/profile`);
  return GET(request, { params: Promise.resolve({ customerId }) });
}

describe("GET /api/customers/{customerId}/profile", () => {
  it("returns the customer's profile in the spec's shape", async () => {
    const response = await getProfile("12345");
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(profileSchema.parse(body)).toEqual(body);
    expect(body).toMatchObject({ customerId: "12345", name: "John Doe" });
  });

  it("returns 404 for a customer that doesn't exist", async () => {
    const response = await getProfile("99999");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not_found", message: "Customer not found" });
  });
});

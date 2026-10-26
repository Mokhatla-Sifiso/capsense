export function notFound(): Response {
  return Response.json({ error: "not_found", message: "Customer not found" }, { status: 404 });
}

export function badRequest(message: string): Response {
  return Response.json({ error: "bad_request", message }, { status: 400 });
}

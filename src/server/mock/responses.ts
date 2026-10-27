export function notFound(): Response {
  return Response.json({ error: "not_found", message: "Customer not found" }, { status: 404 });
}

export function badRequest(message: string): Response {
  return Response.json({ error: "bad_request", message }, { status: 400 });
}

export function serverError(): Response {
  return Response.json({ error: "server_error", message: "Something went wrong" }, { status: 500 });
}

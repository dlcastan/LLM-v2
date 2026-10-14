export class HttpError extends Error {
  constructor(
    public readonly status: 401 | 403 | 404 | 422 | 500,
    message: string,
  ) {
    super(message);
  }
}

export const unauthorized = () => new HttpError(401, "No autenticado");
export const forbidden = () => new HttpError(403, "Sin permiso");
export const notFound = (what = "Recurso") => new HttpError(404, `${what} no encontrado`);
export const invalid = (message: string) => new HttpError(422, message);

export function toResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "Error interno" }, { status: 500 });
}

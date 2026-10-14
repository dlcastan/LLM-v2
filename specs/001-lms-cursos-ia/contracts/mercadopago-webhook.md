# Contrato: webhook de Mercado Pago

**Entrada**: `POST /api/webhooks/mercadopago` con `x-signature`, `x-request-id` y
`{ type: "payment", data: { id } }`.

**Procesamiento**:
1. Validar `x-signature` (HMAC con el secreto del webhook); firma inválida → `401`, sin efectos.
2. Consultar `GET /v1/payments/{id}` a Mercado Pago; ignorar el estado del payload.
3. Insertar en `payment_events` con clave única; si ya existe → responder `200` sin efectos.
4. Según estado: `approved` → compra `approved` + enrollment activo + email (una sola vez);
   `refunded|charged_back|cancelled` → compra `reverted` + enrollment inactivo;
   curso ya habilitado y pago distinto → `duplicate`.
5. Responder `200` en <2 s; errores transitorios → `500` para que Mercado Pago reintente.

**Garantías**: idempotente; reintentos y reordenamientos no producen efectos duplicados.

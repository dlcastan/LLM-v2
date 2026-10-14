# Contrato HTTP

Todas las rutas requieren sesión salvo que se indique. Errores: `401` sin sesión, `403` sin permiso,
`404` inexistente, `422` validación.

| Método y ruta | Rol | Descripción |
|---------------|-----|-------------|
| `POST /api/checkout` `{courseId}` | alumno | Crea la compra `pending` y la preferencia de Mercado Pago; devuelve `{checkoutUrl, alreadyOwned}` (FR-023) |
| `POST /api/webhooks/mercadopago` | público (firmado) | Ver `mercadopago-webhook.md` |
| `GET /api/cron/reconcile` | cron (secreto) | Concilia pagos pendientes (FR-016) |
| `POST /api/lessons/{id}/progress` `{watched}` | alumno | Marca vista/no vista; devuelve porcentaje |
| `GET /api/lessons/{id}/playback` | alumno habilitado | Devuelve `{url, expiresAt, watermark}` con URL firmada ≤10 min |
| `GET /api/certificates/{courseId}` | alumno | PDF si progreso 100% o certificado ya emitido |
| `POST /api/admin/payments/{id}/verify` | admin | Verifica contra Mercado Pago y fuerza habilitación (FR-018) |
| `CRUD /api/admin/courses`, `/api/admin/lessons` | admin | Gestión de catálogo y reordenamiento (FR-019/024) |

Registro, login, recuperación y edición de datos usan Supabase Auth desde el cliente/servidor.

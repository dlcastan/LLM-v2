# Research: LMS de Cursos de IA

## Decisiones

### 1. Plataforma web
- **Decision**: Next.js (App Router) + TypeScript en un único proyecto.
- **Rationale**: lo exige la constitución; SSR para la home y Route Handlers para webhooks.
- **Alternatives**: SPA + backend separado (más piezas, mayor costo operativo).

### 2. Base de datos y autenticación
- **Decision**: Supabase (Postgres, Auth email/contraseña, RLS). Rol Admin en tabla `profiles`.
- **Rationale**: cubre RF-03/04/05 sin construir auth propio; RLS refuerza el Principio III.
- **Alternatives**: Auth propio con hashes (más riesgo y trabajo); Neon + Auth.js (más piezas).

### 3. Pagos
- **Decision**: Checkout Pro de Mercado Pago (preferencia de pago). El webhook solo es una señal:
  se verifica `x-signature` y siempre se consulta el pago a la API antes de actuar.
- **Rationale**: nunca confiar en el payload; el estado verificado es la fuente de verdad.
- **Alternatives**: Checkout API (más PCI/UX); confiar en la URL de retorno (inseguro).

### 4. Idempotencia
- **Decision**: tabla `payment_events` con clave única `(mp_payment_id, mp_status, date_last_updated)`;
  el efecto (habilitar, email) se ejecuta en una transacción solo si el insert es nuevo.
- **Rationale**: reprocesar no duplica habilitaciones ni emails (RF-15).
- **Alternatives**: locks en memoria (no sirven en serverless).

### 5. Conciliación
- **Decision**: cron cada 5 minutos que consulta a la API los pagos en estado pendiente con más de
  2 minutos de antigüedad y compras sin confirmación; tope de 15 min garantizado por la frecuencia.
- **Rationale**: cumple la aclaración de 15 minutos con margen.
- **Alternatives**: pg_cron + Edge Function (válido si se evita el cron de Vercel).

### 6. Reversiones
- **Decision**: eventos `refunded`, `charged_back`, `cancelled` pasan la compra a `revertida` y
  desactivan la habilitación; los certificados emitidos se conservan (aclaración 2).

### 7. Video
- **Decision**: Bunny Stream con Token Authentication (hash SHA-256 de clave + ruta + expiración),
  expiración de 10 minutos, emitido en servidor tras verificar habilitación; descarga MP4 y acceso
  directo deshabilitados en la librería; restricción de referer al dominio.
- **Alternatives**: URLs públicas (incumple RNF-01).

### 7b. Configuración de la librería
- **Decision**: Token Authentication activado, MP4 fallback y conservación del original
  deshabilitados, referer restringido al dominio; verificado por `scripts/verify-bunny-config.ts`.
- **Rationale**: sin esta configuración el archivo fuente podría quedar accesible (Principio II).

### 8. Marca de agua
- **Decision**: capa HTML sobre el reproductor con el email del alumno, con posición variable cada
  pocos segundos y no removible por CSS del usuario en la UI estándar.
- **Rationale**: Bunny no ofrece marca de agua por usuario; la capa disuada y traza (RF-21).
- **Riesgo**: puede evitarse al grabar el video embebido por separado; la protección es disuasiva.

### 9. Certificados
- **Decision**: PDF generado bajo demanda con `pdf-lib` si el progreso es 100%; se registra la
  emisión para conservarlo ante reversiones.

### 10. Email
- **Decision**: Resend (plan gratuito) para restablecimiento y confirmaciones.

### 11. Costos (RNF-02)
| Servicio | Plan | USD/mes |
|----------|------|---------|
| Vercel | Pro (uso comercial) | 20 |
| Supabase | Pro | 25 |
| Bunny Stream | Pago por uso | ~3-5 |
| Resend | Free | 0 |
| **Total** | | **~48-50** |
- **Riesgo**: queda al límite. Mitigación: monitorear tráfico de Bunny; si excede, evaluar bajar
  Vercel a un hosting más barato o reducir calidad/renditions de video.

## Pendientes
- Facturación fiscal: depende del contador; no bloquea el plan.
- Versión exacta de Next.js: confirmar al instalar y leer la documentación incluida.

## Decisión: proxy en lugar de middleware (T014)

Next.js 16.4 renombró `middleware` a `proxy` (`src/proxy.ts`, función `proxy`). Se usa `proxy.ts`.

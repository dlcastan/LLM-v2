# Quickstart: validación end-to-end

## Prerrequisitos
- Node.js 22, proyecto Supabase (o CLI local), cuenta sandbox de Mercado Pago, librería de prueba en
  Bunny Stream. Variables en `.env.local` (nunca versionado): claves Supabase, `MP_ACCESS_TOKEN`,
  `MP_WEBHOOK_SECRET`, `BUNNY_TOKEN_KEY`, `CRON_SECRET`, `RESEND_API_KEY`.

## Escenarios
1. **Compra** (AC-01, AC-07): visitante → registro → pago sandbox aprobado → curso en "Mis cursos".
2. **Idempotencia** (AC-08): reenviar el mismo webhook 3 veces → una habilitación y un email.
3. **Webhook perdido** (AC-09): aprobar el pago sin enviar webhook → ejecutar `/api/cron/reconcile`
   → curso habilitado en ≤15 min.
4. **Reversión** (AC-10): reembolso sandbox → acceso revocado, certificado conservado.
5. **Verificación manual** (AC-11): Admin verifica y fuerza un pago.
6. **Video** (AC-13/14): reproducir clase; la URL vence a los 10 min; se ve la marca de agua.
7. **Progreso y certificado** (AC-05/06): marcar todas las clases y descargar el PDF.
8. **Admin** (AC-12): crear curso y clases; alumno sin rol recibe 403.

## Comandos
- `npm run test` (unidad e integración), `npm run test:e2e` (Playwright).
Resultado esperado: todos los escenarios en verde.

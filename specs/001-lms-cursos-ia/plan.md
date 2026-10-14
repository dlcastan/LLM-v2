# Implementation Plan: LMS de Cursos de IA (plataforma propia B2C)

**Branch**: `001-lms-cursos-ia` | **Date**: 2026-10-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-lms-cursos-ia/spec.md`

## Summary

Aplicación web única en Next.js que vende y dicta cursos de IA. Supabase aporta base de datos
Postgres, autenticación email/contraseña y políticas de acceso por fila; Mercado Pago procesa pagos
con webhook idempotente más conciliación cada 5 minutos (cumple el plazo de 15 minutos); Bunny
Stream aloja los videos con Token Authentication emitido solo en el servidor tras verificar la
habilitación. Los certificados PDF se generan en el servidor. Ver [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js 22 LTS

**Primary Dependencies**: Next.js (App Router; la versión instalada tiene cambios incompatibles, leer
`node_modules/next/dist/docs/` antes de codificar), `@supabase/supabase-js` y `@supabase/ssr`,
SDK oficial `mercadopago`, `pdf-lib`, `zod`, Resend (emails), reproductor embebido de Bunny Stream

**Storage**: PostgreSQL (Supabase) con RLS; videos en Bunny Stream

**Testing**: Vitest (unidad e integración con mocks de Mercado Pago y Bunny), Playwright (E2E de
compra con sandbox y cursado)

**Target Platform**: Web responsive; despliegue en Vercel (Node runtime) + Supabase

**Project Type**: web-application (proyecto único full-stack)

**Performance Goals**: primer frame de video ≤3 s a ≥10 Mbps (RNF-03); 50 reproducciones simultáneas
(RNF-04); webhook responde <2 s

**Constraints**: infraestructura ≤ USD 50/mes hasta 500 alumnos (RNF-02); enlaces de video ≤15 min;
conciliación ≤15 min

**Scale/Scope**: hasta 500 alumnos activos, decenas de cursos, ~15 pantallas y ~10 endpoints

## Constitution Check

*GATE: pasa antes de Phase 0; re-evaluado tras Phase 1.*

| Principio | Cumplimiento en el diseño | Estado |
|-----------|---------------------------|--------|
| I. Integridad de Pagos | Webhook verifica firma, consulta el pago por API, idempotencia por clave única; cron de conciliación; manejo de reversiones; acción Admin de verificación | Pasa |
| II. Protección de Contenido | URL firmada solo desde el servidor, vence en 10 min, sin enlace fuente, marca de agua con email | Pasa |
| III. Autorización en Servidor | RLS + chequeo de rol en cada Route Handler/Server Action; secretos solo en variables de servidor | Pasa |
| IV. Test-First | Tareas de test preceden la implementación en pagos, webhooks, URLs y certificados | Pasa |
| V. Simplicidad | Un solo proyecto, servicios gestionados, sin funcionalidades fuera de alcance | Pasa |
| Costo RNF-02 | Vercel Pro 20 + Supabase Pro 25 + Bunny ~3-5 ≈ USD 48-50 | Pasa con riesgo (ver research) |

## Project Structure

### Documentation (this feature)

```text
specs/001-lms-cursos-ia/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── http-api.md
│   └── mercadopago-webhook.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (public)/               # home, login, registro, recuperar contraseña
│   ├── (student)/              # mi cuenta, cursos, clase, compras
│   ├── admin/                  # panel Admin: cursos, clases, pagos
│   └── api/
│       ├── webhooks/mercadopago/route.ts
│       ├── checkout/route.ts
│       ├── cron/reconcile/route.ts
│       └── certificates/[courseId]/route.ts
├── lib/
│   ├── auth/                   # sesión, rol, guards
│   ├── payments/               # cliente MP, idempotencia, conciliación, reversiones
│   ├── video/                  # firma de URLs Bunny
│   ├── certificates/           # generación PDF
│   └── db/                     # acceso a datos tipado
└── components/                 # UI, reproductor con marca de agua

supabase/migrations/            # migraciones versionadas + políticas RLS
tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: proyecto único Next.js full-stack; la lógica crítica vive en `src/lib/`
separada de las rutas para poder probarla sin HTTP.

## Complexity Tracking

Sin violaciones de la constitución; no se requiere justificación.

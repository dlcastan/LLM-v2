# SSD-MUGv2 — LMS de cursos de IA

Plataforma propia B2C para **vender y dictar cursos sobre inteligencia artificial aplicada a
productos digitales**. Reemplaza a plataformas como Hotmart o Teachable para reducir costos y tener
control total del producto.

> Estado: implementación completa del código de las historias US1–US7; pendiente de configurar
> los servicios externos (Supabase, Mercado Pago sandbox, Bunny Stream) y validar el quickstart.

## Qué hace

**Visitante**
- Ve la propuesta de valor en la home (qué se aprende, para quién, por qué comprar) y llega a la
  compra en 2 clics.

**Alumno**
- Se registra, inicia sesión y recupera su contraseña por email.
- Compra cursos con Mercado Pago; el curso se habilita automáticamente al aprobarse el pago.
- Mira las clases (video, descripción, palabras clave), las marca como vistas y sigue su avance.
- Descarga un certificado PDF al completar el 100% de las clases.
- Consulta su historial de compras y edita sus datos.

**Admin**
- Crea, edita, ordena y elimina cursos y clases desde un panel, sin tocar la base de datos.
- Verifica y fuerza manualmente el estado de un pago.

## Garantías clave

- **Pagos robustos:** webhooks idempotentes, conciliación automática (habilita en ≤15 min aunque el
  webhook se pierda) y revocación de acceso ante reversiones.
- **Contenido protegido:** videos en Bunny Stream con URLs firmadas de corta vida, sin descarga
  directa y con marca de agua dinámica del alumno.
- **Autorización en el servidor:** el rol Admin y la propiedad de cada curso se validan siempre del
  lado del servidor.
- **Costo acotado:** infraestructura ≤ USD 50/mes hasta 500 alumnos activos.

## Stack

Next.js (App Router) + TypeScript · Supabase (Postgres, Auth, RLS) · Mercado Pago · Bunny Stream ·
Resend · Vitest y Playwright. Detalle y alternativas en
[research.md](specs/001-lms-cursos-ia/research.md).

## Instalación y ejecución

Requisitos: Node.js 22 o superior, un proyecto Supabase, una cuenta de Mercado Pago (sandbox) y una
librería de Bunny Stream.

```bash
npm install
cp .env.example .env.local        # completar las variables (ver .env.example)
# aplicar las migraciones de supabase/migrations/ en orden y, opcionalmente, supabase/seed.sql
npm run dev                       # http://localhost:3000
```

| Comando | Qué hace |
|---------|----------|
| `npm run test` | tests unitarios e integración (los que requieren servicios se omiten sin credenciales) |
| `npm run test:e2e` | tests E2E de Playwright |
| `npm run typecheck` | chequeo de tipos |
| `npm run lint` | ESLint |
| `npm run verify:bunny` | verifica la configuración de seguridad de la librería de Bunny |

El webhook de Mercado Pago apunta a `/api/webhooks/mercadopago` y la conciliación corre cada 5
minutos en `/api/cron/reconcile` (ver `vercel.json`, requiere `CRON_SECRET`).

## Estado de validación

- **Verificado:** chequeo de tipos, lint, build y 58 tests unitarios e integración (la lógica de
  pagos se prueba con un almacenamiento en memoria).
- **Sin ejecutar contra servicios reales:** migraciones y políticas RLS de Supabase, sandbox de
  Mercado Pago y la librería de Bunny Stream. Los tests E2E (compra, marca de agua, recuperación de
  contraseña), de RLS y de carga están escritos pero se omiten sin credenciales.
- **Tareas pendientes** (requieren servicios configurados): T079 medir primer frame y carga de 50
  sesiones, T080 documentar el costo real, T081 ejecutar los escenarios del quickstart. Ver
  [tasks.md](specs/001-lms-cursos-ia/tasks.md).

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [PRDv2.md](PRDv2.md) | Requerimientos de producto (PRD-001) |
| [constitución](.specify/memory/constitution.md) | Principios no negociables del proyecto |
| [spec.md](specs/001-lms-cursos-ia/spec.md) | Especificación con historias, requisitos y criterios de éxito |
| [plan.md](specs/001-lms-cursos-ia/plan.md) | Plan de implementación y estructura |
| [data-model.md](specs/001-lms-cursos-ia/data-model.md) | Modelo de datos |
| [contracts/](specs/001-lms-cursos-ia/contracts) | Contratos HTTP y del webhook de Mercado Pago |
| [quickstart.md](specs/001-lms-cursos-ia/quickstart.md) | Escenarios de validación end-to-end |

## Fuera de alcance (v1)

B2B/multi-tenant, comunidad o foro, quizzes con nota, otros medios de pago, buscador de clases,
recordatorios por email y métricas de venta en el panel Admin.

## Flujo de trabajo

El proyecto usa [Spec Kit](https://github.com/github/spec-kit) con Claude Code:
`/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.

Siguiente paso: configurar los servicios externos y ejecutar los escenarios de
[quickstart.md](specs/001-lms-cursos-ia/quickstart.md).

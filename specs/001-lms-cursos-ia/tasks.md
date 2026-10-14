---

description: "Lista de tareas para el LMS de cursos de IA"
---

# Tasks: LMS de Cursos de IA (plataforma propia B2C)

**Input**: Documentos de diseño en `/specs/001-lms-cursos-ia/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: INCLUIDOS. La constitución (Principio IV, Test-First) exige tests escritos antes de la
implementación en pagos, webhooks, conciliación, reversiones, autorización, URLs firmadas y
certificados.

**Organization**: Tareas agrupadas por historia de usuario del spec (US1–US7). Las IDs de historia
siguen el orden del spec, no el orden de ejecución; ver "Dependencies & Execution Order".

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias)
- **[Story]**: historia a la que pertenece (US1–US7)
- Todas las rutas son relativas a la raíz del repositorio (proyecto único, ver plan.md)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: inicialización del proyecto

- [ ] T001 Leer `node_modules/next/dist/docs/` (tras instalar) e inicializar el proyecto Next.js con App Router y TypeScript en la raíz (`package.json`, `tsconfig.json`, `src/app/layout.tsx`)
- [ ] T002 Instalar dependencias en `package.json`: `@supabase/supabase-js`, `@supabase/ssr`, `mercadopago`, `pdf-lib`, `zod`, `resend`; dev: `vitest`, `@playwright/test`
- [ ] T003 [P] Configurar ESLint y Prettier en `eslint.config.mjs` y `.prettierrc`
- [ ] T004 [P] Configurar Vitest en `vitest.config.ts` y scripts `test` en `package.json`
- [ ] T005 [P] Configurar Playwright en `playwright.config.ts` y script `test:e2e` en `package.json`
- [ ] T006 [P] Crear `.env.example` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `BUNNY_TOKEN_KEY`, `BUNNY_LIBRARY_ID`, `CRON_SECRET`, `RESEND_API_KEY` (sin valores reales)
- [ ] T007 Crear la estructura de carpetas de plan.md: `src/lib/{auth,payments,video,certificates,db}`, `src/components`, `supabase/migrations`, `tests/{unit,integration,e2e}`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: base que DEBE estar completa antes de cualquier historia

**⚠️ CRITICAL**: ninguna historia puede empezar hasta terminar esta fase

- [ ] T008 Crear migración `supabase/migrations/0001_core_schema.sql` con `profiles` (`role` en `student` | `admin`, default `student`; `email` requerido y único, espejo de `auth.users.email` mantenido por un trigger de sincronización; `full_name` requerido), `courses` (`title` requerido, `price_ars` numeric ≥ 0, `status` en `draft` | `published` | `archived`) y `lessons` (`bunny_video_id` requerido, `position` int ≥ 1, único por curso con restricción DEFERRABLE INITIALLY DEFERRED, `archived_at` timestamp nulo, `keywords` text[])
- [ ] T009 Crear migración `supabase/migrations/0002_commerce_schema.sql` con `purchases` (`status` en `pending` | `approved` | `reverted` | `duplicate` | `rejected`; `mp_payment_id` único si no nulo), `enrollments` (único `(user_id, course_id)`; `active` bool), `payment_events` (único `(mp_payment_id, mp_status, date_last_updated)`), `lesson_progress` (PK `(user_id, lesson_id)`) y `certificates` (único `(user_id, course_id)`)
- [ ] T010 Crear migración `supabase/migrations/0003_rls_policies.sql` activando RLS en todas las tablas: el alumno solo lee sus filas; catálogo `published` legible; escrituras sensibles solo con rol de servicio; Admin por `profiles.role`
- [ ] T011 [P] Implementar clientes de Supabase (servidor con service role, servidor con sesión, navegador) en `src/lib/db/clients.ts`
- [ ] T012 [P] Implementar validación de variables de entorno con zod en `src/lib/env.ts` (secretos solo accesibles en servidor)
- [ ] T013 Implementar guards `requireUser` y `requireAdmin` (verifican sesión y `profiles.role` en el servidor) en `src/lib/auth/guards.ts`
- [ ] T014 Implementar refresco de sesión de Supabase en `src/middleware.ts`; si la versión instalada de Next.js lo renombra o cambia su ubicación (p. ej. `proxy`), usar el nombre y la ruta que indique `node_modules/next/dist/docs/` y registrar la decisión en `specs/001-lms-cursos-ia/research.md`
- [ ] T015 [P] Implementar tipos de dominio y acceso a datos tipado en `src/lib/db/types.ts` y `src/lib/db/queries.ts`
- [ ] T016 [P] Implementar manejo de errores y logging estructurado en `src/lib/logger.ts` y `src/lib/http-errors.ts` (códigos 401/403/404/422 del contrato)
- [ ] T017 [P] Crear datos de ejemplo (un curso publicado con 3 clases) en `supabase/seed.sql`
- [ ] T018 [P] Crear el layout base con navegación pública/alumno en `src/components/layout/Header.tsx` y `src/app/layout.tsx`

**Checkpoint**: base lista; las historias pueden comenzar

---

## Phase 3: User Story 1 - Descubrir la propuesta y comprar un curso (Priority: P1) 🎯 MVP

**Goal**: un visitante entiende la propuesta, se registra, paga y ve el curso habilitado.

**Independent Test**: home → registro → pago sandbox aprobado → el curso aparece en "Mis cursos" (AC-01, AC-07).

### Tests for User Story 1 ⚠️ (escribir primero y verificar que FALLAN)

- [ ] T019 [P] [US1] Test de integración de `POST /api/checkout` (crea compra `pending` y devuelve `checkoutUrl`) en `tests/integration/checkout.test.ts` (FR-013)
- [ ] T020 [P] [US1] Test de integración del webhook con pago `approved` → compra `approved` y enrollment activo (AC-07) en `tests/integration/webhook-approve.test.ts` (FR-014)
- [ ] T021 [P] [US1] Test de firma inválida del webhook → `401` sin efectos en `tests/integration/webhook-signature.test.ts` (FR-013)
- [ ] T022 [P] [US1] Test E2E del flujo visitante → registro → compra sandbox, verificando que la compra se alcanza en ≤2 clics desde la home (SC-001) en `tests/e2e/purchase.spec.ts` (FR-001, FR-002, FR-003, FR-013)
- [ ] T023 [P] [US1] Test de idempotencia: la misma notificación 3 veces → una habilitación, un registro de compra y un email (AC-08) en `tests/integration/idempotency.test.ts` (FR-015)

### Implementation for User Story 1

- [ ] T024 [P] [US1] Crear la home con propuesta de valor y CTA a registro/compra en `src/app/(public)/page.tsx` (FR-001, FR-002; compra alcanzable en ≤2 clics)
- [ ] T025 [P] [US1] Crear páginas de registro e inicio de sesión con email y contraseña en `src/app/(public)/registro/page.tsx` y `src/app/(public)/login/page.tsx` (FR-003)
- [ ] T026 [P] [US1] Implementar cliente de Mercado Pago (preferencias y consulta de pago) en `src/lib/payments/mercadopago.ts` (FR-013)
- [ ] T027 [US1] Implementar verificación de `x-signature` del webhook en `src/lib/payments/verify-signature.ts` (FR-014)
- [ ] T028 [US1] Implementar la inserción idempotente en `payment_events` (clave única `(mp_payment_id, mp_status, date_last_updated)`; si ya existe, no hay efectos) con los efectos en una sola transacción en `src/lib/payments/idempotency.ts` (FR-015, Principio I)
- [ ] T029 [US1] Implementar el envío de email de confirmación una sola vez por pago con Resend en `src/lib/payments/notify.ts` (FR-015)
- [ ] T030 [US1] Implementar `POST /api/checkout` (requiere sesión, crea compra `pending`, devuelve `{checkoutUrl, alreadyOwned}`) en `src/app/api/checkout/route.ts` (depende de T026) (FR-013, FR-023)
- [ ] T031 [US1] Implementar el procesamiento de un pago aprobado (consulta a la API, nunca confía en el payload; compra `approved` + enrollment activo) en `src/lib/payments/process-payment.ts` sin fallar ni crear un segundo enrollment si ya existe uno activo para `(user_id, course_id)` o si la compra está `reverted` (registra el evento y responde `200`; T054 y T055 completan esa lógica), usando la inserción idempotente de T028 y el email de T029 (depende de T026, T027, T028, T029; NO implementar antes de que T023 exista y falle) (FR-014)
- [ ] T032 [US1] Implementar `POST /api/webhooks/mercadopago` en `src/app/api/webhooks/mercadopago/route.ts` (responde `200` en <2 s; errores transitorios → `500`) (depende de T031) (FR-014)
- [ ] T033 [US1] Crear página de catálogo y detalle del curso con botón de compra en `src/app/(public)/cursos/[id]/page.tsx` (FR-013)
- [ ] T034 [US1] Crear el panel "Mis cursos" con acceso directo a cada curso en `src/app/(student)/mi-cuenta/page.tsx` (FR-006, AC-04)

**Checkpoint**: la compra funciona de punta a punta y el curso aparece habilitado

---

## Phase 4: User Story 2 - Cursar el contenido y seguir el progreso (Priority: P1)

**Goal**: el alumno mira clases, las marca como vistas y ve su avance.

**Independent Test**: con un curso habilitado, marcar una clase como vista y verificar el porcentaje (AC-05).

### Tests for User Story 2 ⚠️

- [ ] T035 [P] [US2] Test unitario del cálculo de porcentaje de avance en `tests/unit/progress.test.ts` (FR-011)
- [ ] T036 [P] [US2] Test de integración de `POST /api/lessons/{id}/progress` (guarda estado, devuelve porcentaje, `403` sin enrollment activo) en `tests/integration/progress.test.ts` (FR-010, FR-011)

### Implementation for User Story 2

- [ ] T037 [P] [US2] Implementar cálculo del porcentaje de avance (excluye clases archivadas, FR-025) en `src/lib/progress.ts` (FR-011)
- [ ] T038 [US2] Implementar `POST /api/lessons/[id]/progress` en `src/app/api/lessons/[id]/progress/route.ts` (depende de T037) (FR-010)
- [ ] T039 [US2] Crear la vista del curso con listado de clases ordenadas y estado visto/no visto en `src/app/(student)/mi-cuenta/cursos/[id]/page.tsx` (FR-008)
- [ ] T040 [US2] Crear la vista de clase (descripción, palabras clave, marcar como vista) en `src/app/(student)/mi-cuenta/cursos/[id]/clases/[lessonId]/page.tsx` (FR-009, FR-010)

**Checkpoint**: US1 y US2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Protección del contenido en video (Priority: P1)

**Goal**: solo alumnos con derecho ven el video, con enlaces temporales y marca de agua.

**Independent Test**: un enlace emitido deja de funcionar a los 15 minutos; un usuario sin compra recibe `403` (AC-13, AC-14).

### Tests for User Story 3 ⚠️

- [ ] T041 [P] [US3] Test unitario de la firma de URLs (expiración ≤ 15 min, hash SHA-256 de clave + ruta + expiración) en `tests/unit/bunny-signing.test.ts` (FR-022)
- [ ] T042 [P] [US3] Test de integración de `GET /api/lessons/{id}/playback` (`403` sin enrollment activo, `401` sin sesión, sin enlace de descarga del fuente) en `tests/integration/playback.test.ts` (FR-020)
- [ ] T043 [P] [US3] Test E2E de que la marca de agua con el email del alumno está visible durante toda la reproducción y que usa el email vigente tras cambiarlo (AC-14) en `tests/e2e/watermark.spec.ts` (FR-021)

### Implementation for User Story 3

- [ ] T044 [P] [US3] Implementar firma de URLs de Bunny Stream con expiración de 10 minutos en `src/lib/video/bunny.ts` (FR-020, FR-022)
- [ ] T045 [US3] Documentar y aplicar la configuración de la librería de Bunny Stream: Token Authentication activado, descarga del MP4 y conservación del archivo original deshabilitadas, referer restringido al dominio del LMS, en `specs/001-lms-cursos-ia/bunny-setup.md` (FR-020, Principio II)
- [ ] T046 [US3] Crear `scripts/verify-bunny-config.ts` que consulta la API de Bunny y falla si Token Authentication está desactivado, el MP4 fallback está habilitado o no hay referer permitido, y agregarlo al script `verify:bunny` de `package.json`
- [ ] T047 [US3] Implementar `GET /api/lessons/[id]/playback` (verifica enrollment activo en el servidor; devuelve `{url, expiresAt, watermark}`) en `src/app/api/lessons/[id]/playback/route.ts` (depende de T044 y de que T046 pase) (FR-020)
- [ ] T048 [US3] Implementar el reproductor con capa de marca de agua (email del alumno, posición variable cada pocos segundos, visible durante toda la reproducción) en `src/components/player/VideoPlayer.tsx` (FR-021)
- [ ] T049 [US3] Integrar el reproductor en la vista de clase en `src/app/(student)/mi-cuenta/cursos/[id]/clases/[lessonId]/page.tsx` (depende de T040, T048) (FR-021)

**Checkpoint**: contenido protegido y verificado

---

## Phase 6: User Story 7 - Pagos robustos: duplicados, pérdidas y reversiones (Priority: P1)

**Goal**: el acceso se mantiene coherente con los pagos ante duplicados, notificaciones perdidas y reversiones.

**Independent Test**: simular notificación duplicada, pago aprobado sin webhook y reversión; verificar el acceso (AC-08 a AC-11).

### Tests for User Story 7 ⚠️

- [ ] T050 [P] [US7] Test de conciliación: pago aprobado sin webhook queda habilitado en ≤15 min (AC-09) en `tests/integration/reconcile.test.ts` (FR-016)
- [ ] T051 [P] [US7] Test de reversión: `refunded`/`charged_back`/`cancelled` revoca acceso y conserva certificado (AC-10), incluida una reversión que llega antes que la aprobación (no debe habilitar el curso) en `tests/integration/reversal.test.ts` (FR-017)
- [ ] T052 [P] [US7] Test de verificación manual por Admin y `403` para no Admin (AC-11) en `tests/integration/admin-verify.test.ts` (FR-018)
- [ ] T053 [P] [US7] Test de compra duplicada: advertencia, segundo pago `duplicate` sin duplicar la habilitación (FR-023) en `tests/integration/duplicate-payment.test.ts`

### Implementation for User Story 7

- [ ] T054 [US7] Implementar manejo de reversiones (compra `reverted`, enrollment `active=false`, certificado conservado; una reversión recibida antes de la aprobación deja la compra `reverted` y la aprobación posterior NO habilita; un enlace de video ya emitido sigue vigente hasta su vencimiento de ≤10 min) en `src/lib/payments/handle-reversal.ts` (FR-017)
- [ ] T055 [US7] Implementar manejo de pago duplicado (compra `duplicate`, sin segundo enrollment) en `src/lib/payments/handle-duplicate.ts` (FR-023)
- [ ] T056 [US7] Implementar la conciliación de pagos pendientes contra la API en `src/lib/payments/reconcile.ts` (FR-016)
- [ ] T057 [US7] Implementar `GET /api/cron/reconcile` protegido por `CRON_SECRET` en `src/app/api/cron/reconcile/route.ts` y programar cada 5 minutos en `vercel.json` (depende de T056) (FR-016)
- [ ] T058 [US7] Implementar `POST /api/admin/payments/[id]/verify` (requiere rol Admin) en `src/app/api/admin/payments/[id]/verify/route.ts` (FR-018)
- [ ] T059 [US7] Mostrar la advertencia de "ya tenés este curso" en el flujo de compra en `src/app/(public)/cursos/[id]/page.tsx` y `src/app/api/checkout/route.ts` (FR-023)
- [ ] T060 [US7] Crear vista Admin de pagos con verificación manual en `src/app/admin/pagos/page.tsx` (FR-018)

**Checkpoint**: pagos coherentes ante duplicados, pérdidas y reversiones

---

## Phase 7: User Story 4 - Gestionar cursos y clases como Admin (Priority: P2)

**Goal**: el Admin administra el catálogo sin tocar la base de datos.

**Independent Test**: el Admin crea un curso con clases y aparece en el catálogo; un no Admin recibe `403` (AC-12).

### Tests for User Story 4 ⚠️

- [ ] T061 [P] [US4] Test de autorización del panel (`403` para alumno, `401` sin sesión) en `tests/integration/admin-authz.test.ts` (FR-019)
- [ ] T062 [P] [US4] Test de eliminación: un curso con compras vigentes se archiva y los alumnos conservan el acceso (FR-024); una clase con progreso se archiva, conserva el progreso y no cuenta para el porcentaje (FR-025) en `tests/integration/course-archive.test.ts`

### Implementation for User Story 4

- [ ] T063 [P] [US4] Implementar `CRUD /api/admin/courses` en `src/app/api/admin/courses/route.ts` y `src/app/api/admin/courses/[id]/route.ts` (eliminar con compras vigentes → `archived`) (FR-019, FR-024)
- [ ] T064 [P] [US4] Implementar `CRUD /api/admin/lessons` con reordenamiento en una sola transacción (`position` ≥ 1, único por curso, restricción DEFERRABLE INITIALLY DEFERRED) y eliminación lógica de clases con progreso mediante `archived_at` (FR-025) en `src/app/api/admin/lessons/route.ts` (FR-019)
- [ ] T065 [US4] Crear UI de gestión de cursos en `src/app/admin/cursos/page.tsx` (depende de T063) (FR-019)
- [ ] T066 [US4] Crear UI de gestión de clases (título, descripción, video de Bunny, palabras clave, orden) en `src/app/admin/cursos/[id]/clases/page.tsx` (depende de T064) (FR-019)

**Checkpoint**: catálogo administrable

---

## Phase 8: User Story 5 - Gestionar la cuenta y ver compras (Priority: P2)

**Goal**: el alumno recupera su contraseña, edita sus datos y consulta compras.

**Independent Test**: completar "olvidé mi contraseña", editar el nombre y ver el historial (AC-02, AC-03, AC-04).

### Tests for User Story 5 ⚠️

- [ ] T067 [P] [US5] Test E2E de recuperación de contraseña con enlace vencido y válido (AC-02) en `tests/e2e/password-reset.spec.ts` (FR-004)
- [ ] T068 [P] [US5] Test de integración de edición de datos personales (incluye que `profiles.email` se sincroniza con el email de autenticación) y del historial de compras (AC-03) en `tests/integration/account.test.ts` (FR-005, FR-007)

### Implementation for User Story 5

- [ ] T069 [P] [US5] Crear flujo "olvidé mi contraseña" y restablecimiento con enlace con vencimiento en `src/app/(public)/recuperar/page.tsx` y `src/app/(public)/restablecer/page.tsx` (FR-004)
- [ ] T070 [P] [US5] Crear edición de nombre, email (se cambia en autenticación y `profiles.email` se sincroniza) y contraseña en `src/app/(student)/mi-cuenta/perfil/page.tsx` (FR-005)
- [ ] T071 [P] [US5] Crear historial de compras (curso, fecha, estado, incluye "pago duplicado") en `src/app/(student)/mi-cuenta/compras/page.tsx` (FR-007)

**Checkpoint**: autogestión de cuenta completa

---

## Phase 9: User Story 6 - Obtener el certificado de completitud (Priority: P3)

**Goal**: al completar el 100% de las clases, el alumno descarga un certificado PDF.

**Independent Test**: marcar todas las clases y descargar el PDF; con clases pendientes no está disponible (AC-06).

### Tests for User Story 6 ⚠️

- [ ] T072 [P] [US6] Test de elegibilidad (100% vistas, certificado conservado ante reversión, clases archivadas excluidas del 100% según FR-025) en `tests/integration/certificate.test.ts` (FR-012)

### Implementation for User Story 6

- [ ] T073 [P] [US6] Implementar la generación del PDF (nombre, curso, fecha) con `pdf-lib` en `src/lib/certificates/generate.ts` (FR-012)
- [ ] T074 [US6] Implementar `GET /api/certificates/[courseId]` (registra la emisión en `certificates`; solo cuentan las clases no archivadas, FR-025) en `src/app/api/certificates/[courseId]/route.ts` (depende de T073) (FR-012)
- [ ] T075 [US6] Agregar el botón de descarga del certificado en `src/app/(student)/mi-cuenta/cursos/[id]/page.tsx` (FR-012)

**Checkpoint**: todas las historias funcionan de forma independiente

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: mejoras transversales

- [ ] T076 [P] Auditar que ningún secreto llegue al bundle del cliente ni al control de versiones (revisar `src/` y `.env.example`)
- [ ] T077 [P] Revisar políticas RLS contra los escenarios de acceso cruzado entre alumnos en `tests/integration/rls.test.ts`
- [ ] T078 [P] Crear prueba de carga de reproducción (50 sesiones simultáneas, primer frame ≤3 s) en `tests/load/playback-load.test.ts` (SC-005, SC-006)
- [ ] T079 Ejecutar T078 y medir el primer frame de video (≤3 s a ≥10 Mbps) y 50 reproducciones simultáneas (RNF-03/04) y registrar en `specs/001-lms-cursos-ia/research.md`
- [ ] T080 Documentar el costo mensual real de infraestructura contra el tope de USD 50 (RNF-02) en `specs/001-lms-cursos-ia/research.md`
- [ ] T081 Ejecutar todos los escenarios de `specs/001-lms-cursos-ia/quickstart.md`
- [ ] T082 [P] Actualizar `README.md` con instrucciones de instalación y ejecución

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup; BLOQUEA todas las historias
- **User Stories (Phase 3+)**: dependen de Foundational
- **Polish (Final)**: depende de las historias deseadas

### User Story Dependencies

- **US1 (P1)**: tras Foundational; sin dependencias de otras historias
- **US2 (P1)**: tras Foundational; necesita un enrollment (usa el seed T017 o el flujo de US1)
- **US3 (P1)**: tras Foundational; la vista de clase integra el reproductor tras T040 (US2)
- **US7 (P1)**: la idempotencia y el email ya viven en US1; US7 agrega conciliación, reversiones, duplicados y verificación Admin. US1 no debe publicarse sin su test de idempotencia (Principio I y IV); US1 y US7 deben salir juntos. Sin US7, una segunda aprobación del mismo curso o una reversión previa solo se registran (T031) sin la lógica de `duplicate` ni de revocación
- **US4 (P2)**: tras Foundational; independiente
- **US5 (P2)**: tras Foundational; el historial muestra estados de US7
- **US6 (P3)**: depende del progreso de US2

### Within Each User Story

- Tests escritos y fallando antes de implementar
- Modelos/librerías → rutas → UI
- Historia completa antes de pasar a la siguiente prioridad

### Parallel Opportunities

- Setup T003–T006 en paralelo; Foundational T011, T012, T015–T018 en paralelo
- Los tests de cada historia marcados [P] en paralelo
- US4 y US5 pueden desarrollarse en paralelo con US2/US3 por distintas personas

---

## Parallel Example: User Story 1

```bash
# Tests de US1 en paralelo:
Task: "Test de integración de POST /api/checkout en tests/integration/checkout.test.ts"
Task: "Test del webhook approved en tests/integration/webhook-approve.test.ts"
Task: "Test de firma inválida en tests/integration/webhook-signature.test.ts"

# Páginas y cliente de pagos en paralelo:
Task: "Home en src/app/(public)/page.tsx"
Task: "Registro y login en src/app/(public)/registro/page.tsx y login/page.tsx"
Task: "Cliente de Mercado Pago en src/lib/payments/mercadopago.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US7)

1. Completar Phase 1 (Setup) y Phase 2 (Foundational)
2. Completar Phase 3 (US1) y Phase 6 (US7): sin pagos robustos no se debe lanzar la venta
3. **DETENERSE y VALIDAR**: escenarios 1–5 de quickstart.md con sandbox de Mercado Pago
4. Agregar US2 y US3 para poder cursar con contenido protegido; entonces lanzar

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 + US7 → compra confiable (demo con seed)
3. US2 + US3 → cursado protegido (**MVP vendible**)
4. US4 → carga de catálogo sin tocar la base
5. US5 → autogestión; US6 → certificado
6. Polish → seguridad, rendimiento, costo

---

## Notes

- [P] = archivos distintos, sin dependencias
- Verificar que los tests fallen antes de implementar
- Commit tras cada tarea o grupo lógico
- Leer la documentación de Next.js instalada antes de escribir código (AGENTS.md)

# Data Model: LMS de Cursos de IA

Todas las tablas con RLS activa; escritura sensible solo vía servidor con rol de servicio.

## profiles
- `id` (uuid, PK, = auth.users.id), `full_name` (text, requerido), `email` (text, requerido, único),
  `role` (`student` | `admin`, default `student`), `created_at`.

## courses
- `id` (uuid, PK), `title` (text, requerido), `description` (text), `price_ars` (numeric ≥ 0),
  `status` (`draft` | `published` | `archived`), `created_at`, `updated_at`.
- Eliminar un curso con compras vigentes lo pasa a `archived` (FR-024); no se borra la fila.

## lessons
- `id` (uuid, PK), `course_id` (FK courses), `title` (requerido), `description` (text),
  `keywords` (text[]), `bunny_video_id` (text, requerido), `position` (int ≥ 1, único por curso).

## purchases
- `id` (uuid, PK), `user_id` (FK), `course_id` (FK), `mp_preference_id`, `mp_payment_id` (único si no
  nulo), `amount`, `status` (`pending` | `approved` | `reverted` | `duplicate` | `rejected`),
  `created_at`, `approved_at`, `reverted_at`.

## enrollments
- `id` (uuid, PK), `user_id`, `course_id`, `purchase_id` (FK), `active` (bool).
- Único `(user_id, course_id)`; `active=false` ante reversión.

## payment_events
- `id`, `mp_payment_id`, `mp_status`, `date_last_updated`, `raw` (jsonb), `processed_at`.
- Único `(mp_payment_id, mp_status, date_last_updated)` → idempotencia (FR-015).

## lesson_progress
- `user_id`, `lesson_id`, `watched` (bool), `updated_at`; PK `(user_id, lesson_id)`.

## certificates
- `id`, `user_id`, `course_id`, `issued_at`; único `(user_id, course_id)`; se conserva ante reversión.

## Transiciones de `purchases.status`
`pending → approved → reverted`; `pending → rejected`; un `approved` adicional para un curso ya
habilitado → `duplicate`.

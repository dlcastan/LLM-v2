# Feature Specification: LMS de Cursos de IA (plataforma propia B2C)

**Feature Branch**: `001-lms-cursos-ia`

**Created**: 2026-10-14

**Status**: Draft

**Input**: User description: "Generá el spec a partir del PRD en PRDv2.md (PRD-001: LMS de Cursos — plataforma propia B2C para vender y dictar cursos)"

## Clarifications

### Session 2026-10-14

- Q: ¿En cuánto tiempo máximo desde la aprobación de un pago debe quedar habilitado el curso si la notificación nunca llegó? → A: 15 minutos
- Q: Si un pago se revierte después de que el alumno completó el curso y obtuvo el certificado, ¿qué pasa con el certificado? → A: Se conserva y sigue descargable; solo se pierde el acceso a las clases
- Q: ¿Qué ve el alumno si intenta comprar un curso que ya posee con acceso vigente? → A: Se muestra una advertencia pero se le permite continuar con el pago
- Q: Si el alumno paga dos veces el mismo curso, ¿cómo se resuelve el pago duplicado? → A: Queda como "pago duplicado" en el historial y soporte lo reembolsa manualmente desde Mercado Pago
- Q: Cuando el Admin elimina un curso o clase ya comprado o con progreso, ¿qué pasa con los alumnos que ya lo tienen? → A: Se retira del catálogo para nuevas ventas, pero quienes ya lo compraron conservan el acceso

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descubrir la propuesta y comprar un curso (Priority: P1)

Un visitante sin cuenta llega a la home, entiende qué va a aprender, para quién es el curso y por qué
conviene comprarlo, se registra y paga. Tras el pago aprobado, el curso queda disponible en su cuenta
sin intervención manual.

**Why this priority**: sin venta no hay negocio; es el flujo que justifica el MVP.

**Independent Test**: un visitante recorre home → registro → pago → ve el curso en "Mis cursos".

**Acceptance Scenarios**:

1. **Given** un visitante sin cuenta en la home, **When** la carga, **Then** ve qué se aprende, para
   quién es y por qué comprar, y llega al flujo de compra en máximo 2 clics.
2. **Given** un pago aprobado, **When** el sistema recibe la confirmación del medio de pago,
   **Then** el curso aparece en "Mis cursos" sin intervención del Admin.
3. **Given** un usuario con email y contraseña válidos, **When** se registra e inicia sesión,
   **Then** accede a su panel de alumno.

---

### User Story 2 - Cursar el contenido y seguir el progreso (Priority: P1)

Un alumno abre un curso comprado, mira las clases en orden (video, descripción, palabras clave),
marca cada una como vista y ve su porcentaje de avance.

**Why this priority**: es el valor entregado al comprador.

**Independent Test**: con un curso habilitado, el alumno reproduce una clase, la marca como vista y
verifica el avance actualizado.

**Acceptance Scenarios**:

1. **Given** un alumno con acceso al curso, **When** abre una clase, **Then** ve video, descripción y
   lista de palabras clave.
2. **Given** un alumno viendo una clase, **When** la marca como vista, **Then** el estado se guarda,
   se refleja en el listado de clases y el porcentaje de avance se recalcula.
3. **Given** un alumno reproduciendo una clase, **When** mira el video, **Then** ve superpuesta durante
   toda la reproducción una marca de agua visible con su email o ID.

---

### User Story 3 - Protección del contenido en video (Priority: P1)

Solo alumnos con derecho al curso pueden reproducir sus videos; los enlaces compartidos fuera de la
sesión dejan de funcionar rápidamente y no existe descarga directa del archivo original.

**Why this priority**: es un objetivo central del producto para reducir descarga y reventa.

**Independent Test**: un enlace de video obtenido por un alumno deja de funcionar pasados 15 minutos y
un usuario sin compra no puede obtener uno.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado con acceso al curso, **When** reproduce una clase, **Then** el
   video solo se accede mediante un enlace temporal con vencimiento de hasta 15 minutos y no se
   ofrece descarga directa del archivo fuente.
2. **Given** un enlace de video emitido hace más de 15 minutos, **When** alguien intenta usarlo,
   **Then** el video no se reproduce.
3. **Given** un usuario sin compra del curso, **When** intenta acceder al video, **Then** se le
   deniega.

---

### User Story 4 - Gestionar cursos y clases como Admin (Priority: P2)

El Admin crea, edita, ordena y elimina cursos y clases (título, descripción, video, palabras clave,
orden) desde un panel, sin tocar la base de datos.

**Why this priority**: necesario para cargar el catálogo; sin él no hay contenido, pero puede
cubrirse inicialmente de forma acotada.

**Independent Test**: el Admin crea un curso con clases y aparecen en el catálogo.

**Acceptance Scenarios**:

1. **Given** un Admin autenticado, **When** crea un curso y le agrega clases con video, descripción y
   palabras clave, **Then** quedan disponibles en el catálogo.
2. **Given** un usuario sin rol Admin, **When** intenta acceder al panel de administración,
   **Then** se le deniega.

---

### User Story 5 - Gestionar la cuenta y ver compras (Priority: P2)

El alumno recupera su contraseña, edita sus datos personales y consulta el historial de compras
(curso, fecha, estado).

**Why this priority**: autonomía del alumno sin soporte manual.

**Independent Test**: el alumno completa "olvidé mi contraseña", edita su nombre y ve su historial.

**Acceptance Scenarios**:

1. **Given** un usuario que olvidó su contraseña, **When** ingresa su email, **Then** recibe un enlace
   con vencimiento, define una nueva contraseña y puede iniciar sesión con ella.
2. **Given** un usuario logueado, **When** edita nombre, email o contraseña, **Then** el cambio se
   refleja de inmediato.
3. **Given** un alumno con compras, **When** entra a "Mi cuenta", **Then** ve sus cursos comprados y
   el historial con curso, fecha y estado.

---

### User Story 6 - Obtener el certificado de completitud (Priority: P3)

Al marcar como vistas todas las clases de un curso, el alumno descarga un certificado en PDF con su
nombre, el curso y la fecha.

**Why this priority**: valor agregado; no bloquea la venta ni el cursado.

**Independent Test**: marcar todas las clases de un curso y descargar el PDF.

**Acceptance Scenarios**:

1. **Given** un curso con todas sus clases marcadas como vistas, **When** el alumno solicita el
   certificado, **Then** puede descargar un PDF con su nombre, el curso y la fecha.
2. **Given** un curso con clases sin marcar, **When** el alumno intenta descargarlo, **Then** no está
   disponible.

---

### User Story 7 - Pagos robustos: duplicados, pérdidas y reversiones (Priority: P1)

El sistema mantiene coherente el acceso respecto de los pagos aunque las notificaciones lleguen
repetidas, no lleguen, o el pago se revierta; soporte puede verificar y forzar un pago puntual.

**Why this priority**: errores aquí significan alumnos que pagan sin acceso o acceden sin pagar.

**Independent Test**: simular notificación duplicada, notificación perdida con pago aprobado, y
reversión; verificar el acceso resultante.

**Acceptance Scenarios**:

1. **Given** un pago ya procesado y curso habilitado, **When** llega la misma notificación una o más
   veces, **Then** no se duplican habilitaciones, registros de compra ni efectos secundarios (ej.
   emails).
2. **Given** un pago aprobado cuya notificación nunca llegó, **When** corre la
   conciliación periódica, **Then** el curso queda habilitado dentro de los 15 minutos posteriores a
   la aprobación, sin intervención manual.
3. **Given** un curso habilitado cuyo pago luego se revierte (contracargo, reembolso, anulación),
   **When** se notifica la reversión, **Then** se revoca el acceso a las clases y el historial refleja el
   nuevo estado; un certificado ya emitido se conserva y sigue descargable.
4. **Given** un alumno que pagó y no ve el curso, **When** soporte/Admin verifica el pago contra el
   proveedor y confirma que está aprobado, **Then** puede forzar la habilitación sin esperar la
   conciliación.

---

### Edge Cases

- Notificación de pago duplicada o fuera de orden (ej. reversión antes que aprobación).
- Pago aprobado cuyo curso fue eliminado o despublicado por el Admin.
- Alumno que ya posee el curso intenta comprarlo de nuevo: se le advierte, pero puede continuar; el
  pago adicional se registra como "pago duplicado" en el historial, sin duplicar la habilitación,
  y soporte lo reembolsa manualmente.
- Acceso revocado por reversión mientras el alumno está reproduciendo un video.
- Reversión de un pago de un curso ya completado: el certificado emitido se conserva.
- Enlace de restablecimiento de contraseña vencido o ya utilizado.
- Admin elimina un curso con compras vigentes: deja de venderse, pero los alumnos conservan el acceso.
- Admin elimina una clase con progreso: se archiva, no cuenta para el avance y el progreso se conserva.
- Reversión que llega antes que la aprobación: no habilita el curso.
- Admin reordena o elimina clases en un curso donde alumnos ya tienen progreso o certificado.
- Alumno marca todas las clases como vistas sin reproducirlas (aceptado en v1, ver Assumptions).
- Cambio de email del alumno y su efecto en la marca de agua y en las notificaciones.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar en la home la propuesta de valor (qué se aprende, para quién,
  por qué comprar) sin requerir login (RF-01).
- **FR-002**: El sistema MUST ofrecer un llamado a la acción claro hacia registro o compra desde la
  home (RF-02).
- **FR-003**: Los usuarios MUST poder registrarse e iniciar sesión con email y contraseña (RF-03).
- **FR-004**: Los usuarios MUST poder recuperar el acceso por email con un enlace de restablecimiento
  con vencimiento (RF-04).
- **FR-005**: Los usuarios MUST poder editar nombre, email y contraseña (RF-05).
- **FR-006**: El sistema MUST listar en el panel del alumno los cursos comprados con acceso directo
  (RF-06).
- **FR-007**: El sistema MUST mostrar el historial de compras con curso, fecha y estado (RF-07).
- **FR-008**: Cada curso MUST componerse de una o más clases ordenadas (RF-08).
- **FR-009**: Cada clase MUST mostrar su video, una descripción de texto y una lista de palabras clave
  (RF-09).
- **FR-010**: El alumno MUST poder marcar cada clase como vista o no vista (RF-10).
- **FR-011**: El sistema MUST calcular el porcentaje de avance según las clases marcadas como vistas
  (RF-11).
- **FR-012**: El sistema MUST habilitar la descarga de un certificado PDF cuando el 100% de las clases
  del curso estén marcadas como vistas, sin validar la reproducción real (RF-12).
- **FR-013**: El sistema MUST permitir comprar cursos mediante Mercado Pago (RF-13).
- **FR-014**: El sistema MUST habilitar el curso automáticamente al confirmarse un pago aprobado
  (RF-14).
- **FR-015**: El sistema MUST procesar cada notificación de pago de forma idempotente, sin duplicar
  habilitaciones, compras, certificados ni efectos secundarios (RF-15).
- **FR-016**: El sistema MUST conciliar periódicamente el estado de los pagos con el proveedor para
  habilitar, dentro de los 15 minutos posteriores a su aprobación, los pagos aprobados cuya
  notificación no llegó (RF-16).
- **FR-017**: El sistema MUST revocar el acceso a las clases y actualizar la compra ante una reversión
  posterior a la aprobación; un certificado ya emitido MUST conservarse y seguir descargable (RF-17).
- **FR-018**: Soporte/Admin MUST poder verificar y forzar el estado de un pago puntual contra el
  proveedor (RF-18).
- **FR-019**: El sistema MUST proveer un panel exclusivo del rol Admin para crear, editar, ordenar y
  eliminar cursos y clases (título, descripción, video, palabras clave, orden) (RF-19).
- **FR-024**: Al eliminar un curso con compras vigentes, el sistema MUST retirarlo del catálogo para
  nuevas ventas y MUST mantener el acceso de los alumnos que ya lo compraron.
- **FR-020**: Los videos MUST servirse solo mediante enlaces firmados con vencimiento y sin enlace de
  descarga directa del archivo fuente (RF-20).
- **FR-021**: El sistema MUST superponer una marca de agua dinámica y visible (email o ID del alumno)
  durante toda la reproducción (RF-21).
- **FR-022**: Los enlaces de video MUST vencer a los 15 minutos o menos desde su emisión (RNF-01).
- **FR-023**: Si el alumno ya posee un curso con acceso vigente, el sistema MUST advertirlo antes de
  la compra y permitirle continuar; un pago aprobado adicional MUST registrarse en el historial sin
  duplicar la habilitación; ese pago adicional MUST figurar como "pago duplicado" en el historial y
  su reembolso lo gestiona soporte manualmente.
- **FR-025**: Al eliminar una clase con progreso registrado, el sistema MUST archivarla en lugar de
  borrarla: deja de mostrarse y de contar para el porcentaje de avance y la elegibilidad del
  certificado, y conserva el progreso y los certificados ya emitidos.

### Key Entities *(include if feature involves data)*

- **Usuario**: persona registrada; atributos: nombre, email, contraseña, rol (alumno o Admin).
- **Curso**: producto vendible; título, descripción, precio (en pesos argentinos, ARS), estado de
  publicación; contiene clases ordenadas.
- **Clase**: unidad de un curso; título, video, descripción, palabras clave, posición.
- **Compra**: relación entre usuario, curso y pago; fecha y estado (aprobada, pendiente, revertida).
- **Habilitación** (en el diseño, `enrollment`): derecho vigente de un usuario a un curso; derivado del
  estado de la compra.
- **Progreso**: marca de clase vista/no vista por usuario y clase; permite el porcentaje de avance.
- **Certificado**: constancia PDF de completitud con nombre, curso y fecha.
- **Pago/Notificación de pago**: evento externo del medio de pago asociado a una compra.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante llega al flujo de compra en 2 clics o menos desde la home.
- **SC-002**: Un pago aprobado habilita el curso sin intervención manual en el 100% de los casos,
  incluyendo notificaciones perdidas, dentro de los 15 minutos posteriores a la aprobación.
- **SC-003**: Reprocesar una notificación ya atendida produce cero habilitaciones, compras o emails
  duplicados.
- **SC-004**: Ningún enlace de video funciona pasados 15 minutos de su emisión.
- **SC-005**: Una clase comienza a reproducirse en 3 segundos o menos con conexión de 10 Mbps o más.
- **SC-006**: Al menos 50 alumnos reproducen video simultáneamente sin superar el tiempo de arranque
  de SC-005.
- **SC-007**: El costo de infraestructura mensual no supera USD 50 con hasta 500 alumnos activos
  (excluye comisiones del medio de pago).
- **SC-008**: Un Admin carga un curso con sus clases sin acceso directo a la base de datos.
- **SC-009**: Tras una reversión de pago, el alumno pierde el acceso y el historial lo refleja.
- **SC-010**: Un alumno gestiona su cuenta (datos, contraseña, compras, certificados) sin ayuda
  manual del Admin.

## Assumptions

- Un solo medio de pago (Mercado Pago) y un solo proveedor de video (Bunny Stream), según el PRD.
- Los certificados se emiten sin validar reproducción real; es una decisión de producto consciente
  para el MVP.
- Fuera de alcance: B2B/multi-tenant, comunidad o foro, quizzes con nota, múltiples medios de pago,
  buscador por palabra clave, recordatorios por email, vista de progreso general y métricas de venta
  en el panel Admin.
- Facturación fiscal automática no está definida; se consulta con un contador antes del lanzamiento.
- El rol Admin es un único tipo de usuario con permisos de administración y soporte.
- Cada curso concede acceso permanente salvo reversión del pago; las compras repetidas se tratan como pagos duplicados.
- Las rutas indicadas (`docs/PRD2.md`) no existen; se usó `PRDv2.md` de la raíz del repositorio como
  fuente.
- Los usuarios cuentan con conexión de banda ancha estándar (≥10 Mbps) para la reproducción.
- Los precios se expresan y cobran en pesos argentinos (ARS).
- Un enlace de video ya emitido sigue siendo válido hasta su vencimiento (≤10 min) aunque el acceso
  se revoque durante la reproducción; no se emiten enlaces nuevos.

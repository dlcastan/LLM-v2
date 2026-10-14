<!--
Sync Impact Report
- Cambio de versión: (plantilla sin completar) → 1.0.0
- Principios modificados: ninguno renombrado (adopción inicial; los cinco principios definidos)
- Secciones agregadas: Core Principles I–V, Restricciones Tecnológicas y de Seguridad,
  Flujo de Desarrollo y Puertas de Calidad, Governance
- Secciones eliminadas: ninguna
- Ítems pendientes:
  - TODO(FACTURACION_FISCAL): PRDv2.md deja sin definir la facturación fiscal automática;
    resolver con un contador antes del lanzamiento y enmendar si agrega una regla obligatoria.
  - TODO(PROVEEDOR_HOSTING): hosting y base de datos aún sin elegir; la sección tecnológica
    solo los limita por el techo de costo RNF-02.
- Plantillas revisadas: ninguna modificada (leen la constitución en tiempo de ejecución).
- Idioma: contenido en español; los encabezados de la plantilla se mantienen en inglés.
-->

# Constitución de SSD-MUGv2 LMS

Fuente de verdad del alcance de producto: `PRDv2.md` (PRD-001, LMS B2C para vender cursos de IA).

## Core Principles

### I. Integridad de Pagos (NO NEGOCIABLE)

El acceso a un curso DEBE derivarse únicamente de un estado de pago verificado en Mercado Pago,
nunca de datos del cliente ni de URLs de redirección. El procesamiento de webhooks DEBE ser
idempotente (RF-15): reprocesar una notificación NO DEBE duplicar habilitaciones, registros de
compra, certificados ni emails. Todo pago aprobado DEBE terminar habilitando el acceso mediante
reconciliación periódica contra la API de Mercado Pago, aunque su webhook nunca llegue (RF-16).
Las reversiones (contracargo, reembolso, anulación) DEBEN revocar el acceso y actualizar el
historial de compras (RF-17). El Admin DEBE poder verificar y forzar manualmente el estado de un
pago (RF-18).
Justificación: los errores de dinero y de habilitación son la falla de mayor impacto del producto.

### II. Protección de Contenido por Defecto

Los videos DEBEN servirse solo mediante URLs firmadas de Bunny Stream (Token Authentication) con
expiración máxima de 15 minutos (RNF-01, RF-20). El archivo fuente NUNCA DEBE exponerse como
enlace de descarga directa. Las URLs firmadas DEBEN emitirse del lado del servidor, solo tras
verificar que el usuario tiene derecho al curso. Una marca de agua dinámica y visible que
identifique al alumno DEBE superponerse durante toda la reproducción (RF-21).
Justificación: la protección disuade la reventa y permite trazar filtraciones; es un objetivo
central del producto.

### III. Autorización en el Servidor

Toda decisión de autorización (propiedad del curso por el alumno, rol Admin para el panel de
administración) DEBE aplicarse en el servidor en cada request, independientemente de lo que
muestre la UI. Las capacidades exclusivas de Admin (RF-19, RF-18) DEBEN exigir el rol Admin. Los
secretos (claves de Mercado Pago y Bunny) NUNCA DEBEN llegar al bundle del cliente ni al control
de versiones.
Justificación: ocultar elementos de la UI no es control de acceso.

### IV. Test-First en Flujos Críticos

Pagos, webhooks, reconciliación, reversiones, verificación de acceso, emisión de URLs firmadas y
elegibilidad del certificado DEBEN tener tests automatizados escritos antes de la implementación,
cubriendo los criterios de aceptación correspondientes (AC-07 a AC-14). Las integraciones con
Mercado Pago y Bunny DEBEN probarse con mocks o sandbox, nunca con cobros reales. Todo cambio
integrado en estos flujos DEBE mantener la suite de tests en verde.
Justificación: estos flujos son sutiles (duplicados, webhooks perdidos, reversiones) y regresan
sin hacer ruido.

### V. Simplicidad y Disciplina de Alcance

Todo trabajo DEBE rastrearse a un requerimiento (RF/RNF/AC) de `PRDv2.md`. Lo listado en "Fuera
de Alcance" (B2B, comunidad, quizzes, otros medios de pago, buscador, recordatorios, métricas de
venta) NO DEBE construirse sin enmendar antes el PRD. Se DEBE preferir servicios gestionados y el
diseño más simple que cumpla el requerimiento; la complejidad adicional DEBE justificarse en el
seguimiento de complejidad del plan.
Justificación: el MVP existe para lanzar barato e iterar; ampliar el alcance contradice el
objetivo de costo.

## Restricciones Tecnológicas y de Seguridad

- Framework: Next.js. Esta versión tiene cambios incompatibles respecto al conocimiento común;
  desarrolladores y agentes DEBEN leer la guía relevante en `node_modules/next/dist/docs/` antes
  de escribir código y respetar los avisos de deprecación (ver `AGENTS.md`).
- Pagos: solo Mercado Pago. Video: solo Bunny Stream.
- Costo: la infraestructura mensual total (sin comisión de Mercado Pago) DEBE mantenerse en
  USD 50 o menos para hasta 500 alumnos activos (RNF-02).
- Rendimiento: una clase DEBE mostrar su primer frame en 3 segundos o menos con conexión
  ≥10 Mbps, y el sistema DEBE soportar al menos 50 reproducciones simultáneas sin degradar ese
  valor (RNF-03/04).
- Credenciales: las contraseñas DEBEN almacenarse solo como hashes con sal de un algoritmo
  reconocido; los enlaces de restablecimiento DEBEN expirar (RF-04).
- Certificados: se emiten con el 100% de las clases marcadas como vistas; sin validar la
  reproducción en v1 (decisión de producto documentada, RF-12).

## Flujo de Desarrollo y Puertas de Calidad

- Las funcionalidades siguen el flujo Spec Kit: specify → plan → tasks → implement; cada plan
  DEBE incluir un Constitution Check contra los principios anteriores.
- Todo pull request DEBE referenciar los IDs de requerimiento que cumple y DEBE pasar lint,
  chequeo de tipos y tests antes de integrarse.
- Los cambios que toquen pagos, autorización o acceso a video DEBEN revisarse explícitamente
  contra los Principios I–III.
- Los cambios de esquema de base de datos DEBEN entregarse como migraciones versionadas.

## Governance

Esta constitución prevalece sobre otras prácticas y convenciones del repositorio. Las enmiendas
DEBEN hacerse editando este archivo en un cambio documentado que indique la justificación y, si
afecta código existente, un plan de migración. El versionado es semántico: MAJOR para eliminar o
redefinir un principio de forma incompatible, MINOR para agregar un principio o sección o ampliar
materialmente la guía, PATCH para aclaraciones y redacción. El cumplimiento DEBE verificarse en
cada plan (Constitution Check) y en cada revisión de pull request; las violaciones sin
justificar bloquean la integración. Usar `AGENTS.md` y `PRDv2.md` como guía de desarrollo y
alcance en tiempo de ejecución.

**Version**: 1.0.0 | **Ratified**: 2026-10-14 | **Last Amended**: 2026-10-14

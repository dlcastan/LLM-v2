# PRD-001: LMS de Cursos — Plataforma propia B2C para vender y dictar cursos

## Contexto y Problema

Se requiere vender cursos propios sobre inteligencia artificial aplicada a productos digitales (cómo implementar IA dentro de un producto y cómo crear productos digitales usando IA) a un público B2C. Hoy las alternativas del mercado (Hotmart, Teachable, etc.) tienen costos de suscripción/comisión altos y limitan la personalización: no se puede modificar el producto a medida que cambian las necesidades del negocio. Construir un LMS propio permite reducir la inversión inicial del MVP y tener control total como owner del producto para iterar sin las limitaciones de una plataforma cerrada.

Personas:

- **Visitante**: quiere entender qué va a aprender y por qué le conviene comprar, para decidir la compra.  
- **Alumno (usuario registrado)**: compró uno o más cursos, necesita acceder a ellos, ver su progreso, gestionar sus datos y obtener certificados.  
- **Admin**: necesita cargar cursos y clases, ver qué se vendió y a quién, y que el contenido esté protegido.

## Objetivos

1. Lanzar un MVP funcional que permita vender y dictar cursos de IA a usuarios B2C con una inversión inicial significativamente menor a una suscripción a Hotmart/Teachable.  
2. Comunicar claramente la propuesta de valor en la home para motivar la compra.  
3. Que el alumno pueda gestionar su propia cuenta (compras, datos, certificados) sin intervención manual del Admin.  
4. Proteger el contenido en video para reducir la descarga/reventa no autorizada.  
5. Emitir certificados de completitud automáticamente al finalizar un curso.

## Requerimientos Funcionales

- RF-01: El sistema debe mostrar en la home la propuesta de valor (qué se aprende, para quién es, por qué comprarlo) sin requerir login.  
- RF-02: El sistema debe presentar un call-to-action claro hacia el registro o la compra desde la home.  
- RF-03: El sistema debe permitir el registro y login de usuarios mediante email y contraseña.  
- RF-04: El sistema debe permitir a un usuario recuperar el acceso a su cuenta mediante un flujo de "olvidé mi contraseña" (solicitud por email, link de restablecimiento con expiración, definición de nueva contraseña).  
- RF-05: El sistema debe permitir editar los datos personales del usuario (nombre, email, contraseña).  
- RF-06: El sistema debe mostrar en el panel del alumno el listado de cursos comprados con acceso directo a cada uno.  
- RF-07: El sistema debe mostrar el historial de compras del alumno (curso, fecha, estado).  
- RF-08: El sistema debe componer cada curso por una o más clases ordenadas.  
- RF-09: El sistema debe mostrar en cada clase su video, una descripción de texto y una lista de palabras clave.  
- RF-10: El sistema debe permitir al alumno marcar cada clase como vista o no vista.  
- RF-11: El sistema debe calcular el porcentaje de avance del curso según las clases marcadas como vistas.  
- RF-12: El sistema debe habilitar la descarga de un certificado de completitud (PDF) cuando el alumno complete el 100% de las clases del curso marcadas como vistas (ver Decisiones de Producto sobre el alcance de esta validación).  
- RF-13: El sistema debe integrar Mercado Pago para procesar la compra de cursos.  
- RF-14: El sistema debe habilitar automáticamente el curso en la cuenta del alumno al recibir, mediante el webhook de notificaciones de Mercado Pago, la confirmación de un pago aprobado.  
- RF-15: El sistema debe procesar cada notificación del webhook de Mercado Pago de forma idempotente, de modo que reprocesar una notificación ya atendida para el mismo pago (por reintento o reenvío de Mercado Pago) no genere habilitaciones, certificados ni efectos secundarios duplicados.  
- RF-16: El sistema debe reconciliar periódicamente el estado de los pagos contra la API de Mercado Pago, de forma que un pago aprobado cuyo webhook nunca llegó al sistema termine habilitando el curso igualmente, sin intervención manual del Admin.  
- RF-17: El sistema debe revocar el acceso al curso y actualizar el estado de la compra cuando Mercado Pago notifique una reversión del pago ocurrida después de la aprobación inicial (contracargo, reembolso o anulación).  
- RF-18: El sistema debe permitir a soporte/Admin verificar y forzar manualmente el estado de un pago puntual contra la API de Mercado Pago, para resolver el caso de un alumno que reporta no tener acceso antes de que corra la reconciliación automática (RF-16).  
- RF-19: El sistema debe proveer un panel de administración, accesible solo para usuarios con rol Admin, donde se puedan crear, editar, ordenar y eliminar cursos y sus clases (título, descripción, video de Bunny Stream, palabras clave, orden), sin necesitar acceso directo a la base de datos.  
- RF-20: El sistema debe alojar y transmitir los videos mediante Bunny Stream, utilizando URLs firmadas/tokenizadas (Token Authentication) con expiración.  
- RF-21: El sistema debe superponer sobre cada video una marca de agua dinámica y visible (ej. email o ID del alumno) durante toda la reproducción, para disuadir y trazar la grabación de pantalla o la redistribución no autorizada.

## Requerimientos No Funcionales

- RNF-01: Los videos deben servirse exclusivamente mediante URLs firmadas de Bunny Stream (Token Authentication) con una expiración máxima de 15 minutos desde su emisión, de forma que un link compartido fuera de la sesión del alumno deje de funcionar pasado ese tiempo.  
- RNF-02: El costo total de infraestructura mensual (hosting, base de datos, almacenamiento y streaming de video en Bunny Stream; no incluye la comisión de Mercado Pago) no debe superar USD 50/mes para una base de hasta 500 alumnos activos.  
- RNF-03: Una clase debe comenzar a reproducirse (primer frame visible, incluyendo buffering) en no más de 3 segundos, en una conexión de banda ancha estándar (≥10 Mbps).  
- RNF-04: El sistema debe soportar al menos 50 alumnos reproduciendo video de forma simultánea sin degradar el tiempo de arranque definido en RNF-03.

## Criterios de Aceptación

- AC-01 (RF-01, RF-02): Dado un visitante sin cuenta que ingresa a la home, cuando la carga, entonces ve explícitamente qué se aprende, para quién es el curso y por qué comprarlo, y puede llegar al flujo de compra en máximo 2 clics desde la home.  
- AC-02 (RF-04): Dado un usuario que olvidó su contraseña, cuando solicita recuperarla ingresando su email, entonces recibe un email con un link de restablecimiento, puede definir una nueva contraseña con ese link y loguearse con ella.  
- AC-03 (RF-05): Dado un usuario logueado en su cuenta, cuando edita sus datos personales, entonces el cambio se refleja inmediatamente.  
- AC-04 (RF-06): Dado un usuario con compras registradas, cuando entra a "Mi cuenta", entonces ve todos los cursos comprados y puede abrir cualquiera.  
- AC-05 (RF-10): Dado un alumno viendo una clase, cuando la marca como "vista", entonces el sistema guarda el estado y lo refleja en el listado de clases del curso.  
- AC-06 (RF-12): Dado un curso con todas sus clases marcadas como vistas, cuando el alumno solicita el certificado, entonces el sistema genera y permite descargar un PDF con su nombre, el curso y la fecha.  
- AC-07 (RF-14): Dado un pago aprobado por Mercado Pago, cuando el sistema recibe el webhook de confirmación, entonces el curso aparece en "Mis cursos" sin intervención manual.  
- AC-08 (RF-15): Dado un pago ya procesado y con el curso habilitado, cuando Mercado Pago reenvía la misma notificación de webhook una o más veces (comportamiento esperado de su servicio), entonces el sistema responde correctamente sin duplicar la habilitación, el registro de compra ni disparar efectos secundarios (ej. emails) más de una vez.  
- AC-09 (RF-16): Dado un pago aprobado en Mercado Pago cuyo webhook nunca llega al sistema (por caída del servicio, timeout, etc.), cuando corre el proceso de reconciliación, entonces el curso queda habilitado en la cuenta del alumno dentro de un plazo acotado y definido, sin que el alumno tenga que reclamar ni el Admin intervenir manualmente.  
- AC-10 (RF-17): Dado un curso habilitado a partir de un pago que luego es revertido (contracargo, reembolso o anulación), cuando Mercado Pago notifica la reversión, entonces el sistema revoca el acceso del alumno al curso y refleja el nuevo estado en su historial de compras (RF-07).  
- AC-11 (RF-18): Dado un alumno que pagó y reclama no ver el curso antes de que corra la reconciliación automática, cuando soporte/Admin verifica manualmente el pago contra la API de Mercado Pago y confirma que está aprobado, entonces puede forzar la habilitación del curso sin esperar al ciclo de reconciliación.  
- AC-12 (RF-19): Dado un Admin logueado con su rol, cuando crea un curso nuevo y le agrega clases con video, descripción y palabras clave desde el panel de administración, entonces el curso y sus clases quedan disponibles en el catálogo sin necesitar acceso a la base de datos.  
- AC-13 (RF-20): Dado un usuario autenticado con acceso a un curso, cuando reproduce una clase, entonces el video solo es accesible desde el dominio del LMS mediante una URL firmada de Bunny Stream, y no se genera un link de descarga directa del archivo fuente.  
- AC-14 (RF-21): Dado un alumno autenticado reproduciendo una clase, cuando visualiza el video, entonces ve superpuesta una marca de agua dinámica con su email o ID visible durante toda la reproducción.

## Fuera de Alcance

- Modelo B2B/multi-tenant (empresas gestionando licencias para sus empleados).  
- Comunidad/foro o mensajería entre alumnos.  
- Quizzes/evaluaciones con nota.  
- Múltiples métodos de pago — solo Mercado Pago en este v1.  
- Buscador/filtro de clases por palabra clave, recordatorios por email, vista de progreso general y panel de administración con métricas de venta — quedan para una siguiente iteración, no son necesarios para el MVP (el panel de administración de RF-19 es solo de carga/edición de cursos y clases, no de métricas).

## Decisiones de Producto

- **Certificado sin validar reproducción real (RF-12):** el certificado se emite cuando el alumno marcó el 100% de las clases como "vista", sin verificar que efectivamente haya reproducido el video completo. Es una decisión consciente para el MVP —se prioriza simplicidad sobre control de fraude—, no un olvido. Un alumno podría marcar todo sin ver nada y obtener el certificado igual. Si se detecta que esto es un problema real (abuso, pérdida de valor percibido del certificado), se revisa en una iteración futura agregando validación de reproducción.

## Riesgos y Dependencias

- Riesgo: los alumnos podrían descargar o redistribuir el contenido pago pese a la protección; la marca de agua (RF-21) y las URLs firmadas (RF-20) no impiden físicamente la grabación de pantalla, solo la dificultan y permiten trazar el origen de una filtración hasta el alumno.  
- Riesgo: no haber definido si se necesita factura/comprobante fiscal automático podría generar incumplimientos impositivos → mitigación: consultar con un contador antes del lanzamiento.  
- Riesgo: el webhook de Mercado Pago puede llegar duplicado, no llegar nunca, o notificar una reversión (contracargo/reembolso) después de haber habilitado el curso; si el sistema no contempla estos casos, un alumno puede pagar y no ver el curso, o mantener acceso a un curso cuyo pago fue revertido → mitigación: procesamiento idempotente del webhook (RF-15), job de reconciliación automática (RF-16), verificación/reintento manual por soporte (RF-18), y manejo del evento de reversión (RF-17).  
- Dependencia: el sistema depende de la disponibilidad y estabilidad de Mercado Pago (webhooks y API) para procesar pagos y habilitar el acceso a los cursos.  
- Dependencia: el sistema depende de la disponibilidad, el pricing y las funcionalidades de Bunny Stream (hosting, streaming, Token Authentication y marca de agua) para el alojamiento y la protección de los videos.
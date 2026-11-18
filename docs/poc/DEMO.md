# Prueba de concepto — Inspección VOSOA digital

**Objetivo:** mostrarle a Holcim El Salvador su formulario "Vosoa — Inspección Diaria de Bandas Transportadoras" de Planta Tepeagua funcionando en el teléfono, y validar si le interesa.

## Qué incluye

- **Datos reales:** las 3 áreas de trituración, los 31 equipos (etiqueta, número de activo, criticidad A/B) y los 389 puntos de revisión, transcritos de los formularios en papel.
- **Asistencia:** llegada y salida con la hora real.
- **Ronda por área:** lista de equipos con avance. Cada punto se marca Bueno, Malo o N/A (N/A solo en los puntos "si aplica"). Un Malo exige descripción y admite foto.
- **Cierre de ronda:** comentarios, firma con el dedo y PDF con el formato del formulario en papel, que se comparte por WhatsApp, correo o Drive. Las fotos van en un anexo.
- **Correctivo:** cada Malo se vuelve una falla abierta y se puede marcar como atendida, con nota.
- **Informes:** cumplimiento del día, puntos revisados, fallas abiertas por criticidad, avance por área y asistencia.

Sin internet. Todo se guarda solo en el teléfono, sin servidor ni cuentas.

## Guion de demo (5 minutos)

1. Escribir el nombre del técnico → **Registrar llegada** (la hora es la real).
2. **Preventivo** → *Trituradora Primaria*: muestra los 10 equipos con su etiqueta y criticidad, igual que en el papel.
3. Abrir *HZA0.311-TY1 Tolva metálica*: marcar el punto 2 "Fugas de material" como **Malo**, describirlo y **tomar foto**. Tocar **Resto Bueno** → **Terminar equipo**.
4. Abrir *HZA0.311-AV1* → **Resto Bueno** → **Terminar equipo**.
5. **Cerrar ronda y firmar** → aceptar los equipos sin revisar → comentario → **Tocar para firmar** → **Firmar y generar hoja VOSOA**. Se abre el menú para compartir el PDF; enviarlo por WhatsApp o correo y abrirlo junto al formulario en papel.
6. **Correctivo:** la falla de la tolva aparece sola, con foto y criticidad. **Marcar como atendida**.
7. **Informes:** cumplimiento del día y fallas abiertas por criticidad.
8. **Salida** → registrar la hora de salida.

Para empezar de cero antes de la reunión: **Informes → Reiniciar demo**.

## Instalación

- **Android:** `MaintenanceApp-PoC-VOSOA.apk` (unos 53 MB). Enviarlo al teléfono, abrirlo y permitir "instalar apps de origen desconocido".
- **iOS:** requiere TestFlight y una cuenta de Apple Developer. Compila y arranca en el simulador.

## Fuera de esta prueba (fase 2, ver PRD/TRD)

Servidor y sincronización entre teléfonos, usuarios y roles, panel web del supervisor, notificaciones reales a los administradores, varias plantas o empresas, y firma de la app para tiendas.

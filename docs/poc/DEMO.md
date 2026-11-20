# Prueba de concepto — Inspección VOSOA digital

**Objetivo:** mostrarle a Holcim El Salvador su formulario "Vosoa — Inspección Diaria de Bandas Transportadoras" de Planta Tepeagua funcionando en el teléfono, y validar si le interesa.

## Qué incluye

- **Datos reales:** las 3 áreas de trituración, los 31 equipos (etiqueta, número de activo, criticidad A/B) y los 417 puntos de revisión, según la versión rectificada del formulario VOSOA (20/11/2026).
- **Asistencia:** llegada y salida con la hora real.
- **QR por equipo:** cada equipo tiene una etiqueta QR (Informes → "Etiquetas QR de equipos"). Al escanearla desde Preventivo se abre directamente su checklist.
- **Ronda por área:** equipos en tarjetas con foto y avance. Cada punto se marca Bueno, Malo o N/A (N/A solo en los puntos "si aplica"). Un Malo exige descripción.
- **Galería por punto:** hasta 6 fotos por punto (Bueno o Malo), desde la cámara o la galería del teléfono.
- **Marca Holcim:** logo y colores oficiales en la app, la hoja VOSOA y las etiquetas QR.
- **Cierre de ronda:** comentarios, firma con el dedo y PDF con el formato del formulario en papel, que se comparte por WhatsApp, correo o Drive. Las fotos van en un anexo.
- **Correctivo:** cada Malo se vuelve una falla abierta y se puede marcar como atendida, con nota.
- **Informes:** cumplimiento del día, puntos revisados, fallas abiertas por criticidad, avance por área y asistencia.

Funciona sin internet. Todo se guarda solo en el teléfono, sin servidor ni cuentas.

## Guion de demo (5 minutos)

1. Escribir el nombre del técnico → **Registrar llegada** (la hora es la real).
2. **Preventivo** → *Trituradora Primaria*: muestra los 10 equipos con su etiqueta y criticidad, igual que en el papel.
3. Abrir *HZA0.311-TY1 Tolva metálica*: marcar el punto 2 "Fugas de material" como **Malo**, describirlo y agregar fotos con **＋ Foto** (cámara o galería, hasta 6). Tocar **Resto Bueno** → **Terminar equipo**.
4. Volver a Preventivo → **Escanear QR del equipo** → apuntar a la etiqueta impresa de *HZA0.311-AV1*: se abre su checklist directamente. **Resto Bueno** → **Terminar equipo**.
5. **Cerrar ronda y firmar** → aceptar los equipos sin revisar → comentario → **Tocar para firmar** → **Firmar y generar hoja VOSOA**. Se abre el menú para compartir el PDF; enviarlo por WhatsApp o correo y abrirlo junto al formulario en papel.
6. **Correctivo:** la falla de la tolva aparece sola, con foto y criticidad. **Marcar como atendida**.
7. **Informes:** cumplimiento del día y fallas abiertas por criticidad.
8. **Salida** → registrar la hora de salida.

Para empezar de cero antes de la reunión: **Informes → Reiniciar demo**.

Llevar impresa la hoja `Etiquetas-QR-Tepeagua.pdf` (o al menos la etiqueta de HZA0.311-AV1) para el paso 4.

## Instalación

- **Android:** `MaintenanceApp-PoC-VOSOA.apk` (unos 67 MB). Enviarlo al teléfono, abrirlo y permitir "instalar apps de origen desconocido".
- **iOS:** requiere TestFlight y una cuenta de Apple Developer. Compila y arranca en el simulador.

Las fotos de equipos y áreas son ilustrativas (Wikimedia Commons, ver `src/assets/photos/CREDITS.md`); se reemplazan por fotos reales de Planta Tepeagua.

## Fuera de esta prueba (fase 2, ver PRD/TRD)

Servidor y sincronización entre teléfonos, usuarios y roles, panel web del supervisor, notificaciones reales a los administradores, varias plantas o empresas, y firma de la app para tiendas.

# MaintenanceApp — Overview (reconstruido)

> **Origen de este documento:** reconstruido en nov-2026 a partir del código del prototipo (último commit: 25-mar-2021) y de capturas de la app corriendo tras su actualización. No existía documentación de producto previa. Todo lo marcado como **[Supuesto]** debe validarse con el dueño del producto.

## Contexto

MaintenanceApp nació como un **proyecto de innovación empresarial** para las operaciones de concreto premezclado de Lafarge Holcim en El Salvador. El prototipo se construyó en el primer trimestre de 2021 y se abandonó con datos de prueba, sin backend ni usuarios reales.

## Problema [Supuesto]

Los técnicos de mantenimiento recorren muchos planteles de concreto (fijos, mini y móviles) repartidos en el país. Hoy no hay una forma confiable de:

- saber quién llegó a qué plantel y a qué hora (control de asistencia);
- registrar qué equipos recibieron mantenimiento preventivo en cada visita;
- dar seguimiento a las fallas reportadas en los equipos (mantenimiento correctivo);
- darle a los administradores visibilidad de todo lo anterior sin depender de llamadas, WhatsApp o papel.

## Usuarios

- **Técnico de mantenimiento de campo:** visita planteles, marca llegada y salida, hace mantenimientos preventivos y atiende fallas. Es el usuario principal de la app móvil.
- **Administrador / supervisor de mantenimiento [Supuesto]:** recibe notificaciones de llegada y salida y consulta informes. La app lo menciona ("Se notificará a los administradores") y el código deja una nota sobre un futuro "panel admin", pero no hay pantallas para este usuario.

## Lo que el prototipo ya muestra

1. **Control de asistencia:** el técnico elige el tipo de plantel (Fijo, Mini o Móvil) y el plantel donde está. Un diálogo muestra la hora de llegada, una casilla de "Primer visita" y el aviso de que se notificará a los administradores. Al tocar "Comenzar" entra a la sesión de trabajo en ese plantel.
2. **Mantenimiento preventivo:** catálogo de equipos dividido en *Independientes* (cargador de ruedas, generador eléctrico, blower) y *de Plantel* (dosificadora, mezcladora, trituradora). Al tocar un equipo se abre la pantalla de **escáner**, que aún está vacía [Supuesto: escanear un código QR o de barras pegado al equipo para iniciar o registrar la inspección].
3. **Mantenimiento correctivo:** lista de equipos con fallas reportadas, con número de fallas, fecha y hora. Tocar un reporte todavía no hace nada [Supuesto: debería abrir el detalle de la falla y su atención].
4. **Salida del plantel:** botón "Salida" en el encabezado mientras dura la sesión. Abre un diálogo con la hora de salida y una casilla de "Última visita" y devuelve al control de asistencia.
5. **Informes:** pestaña de marcador de posición con el texto "Espérala Pronto!". [Supuesto: tableros de cumplimiento de preventivos, fallas abiertas y asistencia].

## Datos que maneja la app

- **Planteles:** 3 fijos (San Andrés, Santa Tecla, San Miguel), 5 mini (Sonsonate, La Paz, Apopa, Santa Ana, Santa Rosa de Lima) y 6 móviles (KM25 a KM29 y KM35).
- **Equipos:** nombre, foto y tipo (Independiente o Plantel).
- **Reportes de falla:** equipo, número de fallas, fecha y hora.
- **Asistencia:** persona, plantel, fecha y hora.

## Brechas conocidas del prototipo

- No hay inicio de sesión: la app no sabe quién es el técnico.
- La hora del reloj es fija (5:00 a.m.); no muestra la hora real.
- Las casillas "Primer visita" y "Última visita" no tienen efecto.
- No hay backend ni persistencia; todos los datos son de prueba.
- El escáner y los informes están vacíos.
- No hay ninguna superficie para administradores.

## Formularios de campo reales (VOSOA)

La carpeta `../../../VOSOA/` contiene tres formularios en blanco de Holcim El Salvador: **"Vosoa — Inspección Diaria de Bandas Transportadoras"**, uno por cada área de trituración de **Planta Tepeagua** (Trituradora Primaria, Secundaria y Terciaria). Hoy se llenan a mano en papel impreso desde Excel.

Estructura de cada formulario:

- **Encabezado:** fecha, hora de revisión, denominación del equipo o área y plantel.
- **Por equipo:** etiqueta (por ejemplo `HZA0.311-TY1`), número de activo (por ejemplo `10103631`), nombre y **criticidad** (A o B).
- **Lista de verificación por equipo:** de 4 a 17 puntos de inspección sensorial, cada uno marcado como **Bueno** o **Malo**. Por ejemplo: temperaturas y vibraciones al tacto, ruidos extraños, fugas de aceite o de material, estado de la banda, rodillos, correas, escaleras y guardas, limpieza. Los puntos se repiten según el tipo de equipo: banda, alimentador vibratorio, criba, trituradora o tolva.
- **Cierre:** comentarios libres, persona que realizó la inspección y firma.

Volumen que implican:

| Área | Equipos | Criticidad A | Criticidad B | Puntos de revisión |
|---|---|---|---|---|
| Trituradora Primaria | 10 | 4 | 6 | ≈126 |
| Trituradora Secundaria | 9 | 9 | 0 | ≈109 |
| Trituradora Terciaria | 12 | 11 | 1 | ≈149 |
| **Total** | **31** | **24** | **7** | **≈384 por día** |

No hay formulario de mantenimiento correctivo: hoy un punto marcado "Malo" se queda en el papel y en los comentarios, sin seguimiento formal.

## Dirección de producto (decidida nov-2026)

- **Producto genérico:** MaintenanceApp debe servir a cualquier empresa con sitios industriales, sean planteles de concreto o plantas de agregados. Holcim El Salvador es el primer caso de referencia.
- **Usuarios de v1:** el técnico de campo y el administrador.
- **Módulos:** Acceso y asistencia, Mantenimiento preventivo, Mantenimiento correctivo, Informes y Administración.
- **Métricas:** no hay datos de partida. Las metas se proponen como hipótesis y se miden contra los formularios VOSOA en papel durante un piloto.

## A futuro (mencionado en el prototipo)

- Panel de administración: el código deja una nota "NO BORRAR — me da una idea para el panel admin".
- Pestaña de informes y tableros ("Espérala Pronto!").

## Diseños

Las capturas en `./design/` (Android y una de iOS) muestran el prototipo tal como corre hoy. Son la referencia de flujo y contenido, no un diseño final.

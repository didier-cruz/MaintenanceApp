/**
 * Catálogo de Planta Tepeagua (Holcim El Salvador), transcrito de los
 * formularios en papel "Vosoa — Inspección Diaria de Bandas Transportadoras".
 * Un área = un formulario; cada equipo trae su lista de verificación.
 */

const na = (text) => ({ text, allowsNA: true });

const TOLVA_PRIMARIA = [
  "Estado físico de la tolva.",
  "Fugas de material.",
  "Elementos sueltos o flojos que puedan indicar roturas en cualquier parte de la tolva.",
  "Buen funcionamiento del sistema de aspersión del material.",
  "Estado físico de la cortina de cadenas.",
  "Estado físico de escalera de acceso a plataforma.",
];

const TOLVA_TERCIARIA = [
  "Estado físico de la tolva.",
  "Fugas de material.",
  "Elementos sueltos o flojos que puedan indicar roturas en cualquier parte de la tolva.",
  "Estado físico de escalera de acceso a plataforma.",
];

const ALIMENTADOR_PRIMARIA = [
  "Buen estado físico de los resortes.",
  "Elementos flojos o sueltos.",
  "Ruidos extraños.",
  "Correcta fijación de motores y conexiones eléctricas.",
  "Verificar que no existan fisuras o roturas en su estructura.",
  "Fugas de material y estado de limpieza externo.",
  "Verificar el nivel de aceite.",
  "Temperaturas y vibraciones anormales al tacto en motor y variador de velocidad.",
  "Verificar que los soportes de concreto y/o madera se encuentren en buen estado.",
];

const ALIMENTADOR_VIBRATORIO = [
  "Buen estado físico de los soportes de resortes / suspensión. Pernos de anclaje.",
  "Elementos flojos o sueltos.",
  "Ruidos extraños.",
  "Correcta fijación de motores, conexiones eléctricas y temperatura.",
  "Verificar que no existan fisuras o roturas en su estructura.",
  "Verificar estado de limpieza.",
];

const TRITURADORA_PRIMARIA = [
  "Temperaturas y vibraciones anormales al tacto en chumaceras de la polea motriz y buen estado de correas.",
  "Temperaturas anormales de las chumaceras laterales y central del eje excéntrico.",
  "Deformaciones y fisuras en anclajes de cada uno de los barrotes.",
  "Deformaciones. Abertura de mandíbulas (calibración adecuada para operación).",
  "Verificar que los soportes de concreto y/o madera se encuentren en buen estado.",
  "Estado de limpieza de la máquina, estructuras y accesos.",
  "Temperatura y vibraciones al tacto de rodamientos y carcasa de motor eléctrico.",
  "En motor verificar estado físico de caja de conexiones, corazas, conectores, cables eléctricos y fijación.",
  "Temperatura al tacto y fijación del arrancador rotórico.",
  "Signos de ruidos extraños en motor.",
  "Estado físico de correas.",
];

const TRITURADORA_SECUNDARIA = [
  "Temperatura y vibraciones al tacto, ruidos extraños en cono.",
  "Deformaciones. Abertura de cono (calibración adecuada para operación).",
  "Tornillería externa en buen estado.",
  "En sistema hidráulico verificar el flujo de aceite (2 GPM mínimo).",
  "Estado de limpieza de carcasa y derrames de material alrededor.",
  "Temperatura y vibraciones al tacto de rodamientos y carcasa de motor eléctrico.",
  "En motor eléctrico verificar estado físico de caja de conexiones, corazas, conectores, cables eléctricos y fijación.",
  "Temperatura al tacto y fijación del arrancador rotórico.",
  "Signos de ruidos extraños en motor eléctrico.",
  "Estado de limpieza externa del motor, carcasa.",
  "Fugas de aceite por válvulas, conectores y tuberías en todo su recorrido.",
  "Verificar nivel adecuado de lubricante en el depósito.",
  "Estado físico de correas.",
];

const TRITURADORA_VSI = [
  "Temperatura y vibraciones fuera de lo normal en VSI.",
  "Fugas de material en compuerta de vista y uniones de carcasa.",
  "Elementos flojos o sueltos y ruidos extraños.",
  "Estado físico de impulsores.",
  "Estado físico ANVIL STAB.",
  "Fugas de aceite por sellos.",
  "Estado de limpieza externa.",
  "Temperatura y vibraciones al tacto de rodamientos y carcasa de motor.",
  "En motor verificar estado físico de caja de conexiones, tuberías, corazas, conectores, cables eléctricos y fijación.",
  "Estado físico y tensión de correas.",
  "Temperatura al tacto del motor.",
  "Signos de ruidos extraños en motor.",
  "Estado de limpieza externa de motor, carcasa.",
  "Buen funcionamiento de la bomba hidráulica.",
  "Fugas de aceite por válvulas, conectores y tuberías en todo su recorrido.",
  "Temperatura normal del motor al tacto y buen estado de conexiones eléctricas.",
  "Verificar nivel adecuado de lubricante en el depósito.",
];

const CRIBA = [
  "Buen estado físico de los resortes.",
  "Elementos flojos o sueltos.",
  "Correas en buen estado.",
  "Ruidos extraños.",
  "Correcta fijación de motores y conexiones eléctricas.",
  "Verificar que no existan fisuras o roturas en su estructura.",
  "Fugas de material y estado de limpieza externo.",
  "Verificar que los soportes de la criba se encuentren en buen estado.",
  "Verificar buen estado de mallas (tensión o roturas en malla).",
  "Buen estado de la tolva de descarga y laterales, verificando que no existan fugas de material.",
  "Verificar vibradores y base de fijación en estructura de tolva en buen estado.",
  "Estado físico de escalera de acceso a plataforma y guardas.",
];

const CRIBA_SECUNDARIA = [
  "Buen estado físico de los resortes.",
  "Elementos flojos o sueltos.",
  "Ruidos extraños.",
  "Correcta fijación de motores y conexiones eléctricas.",
  "Estado físico de correas.",
  "Verificar que no existan fisuras o roturas en su estructura.",
  "Fugas de material y estado de limpieza externo.",
  "Verificar nivel de aceite.",
  "Verificar que los soportes se encuentren en buen estado.",
  "Verificar buen estado de mallas (tensión o roturas en malla).",
  "Estado de limpieza de la máquina, estructuras y accesos.",
];

/**
 * Banda transportadora. Las variantes del papel:
 * - `junta`: "empalme" o "cubrejuntas".
 * - `limpiador`: "Limpiadores de banda" o "rascadores".
 * - `punto11`: correas (si aplica) o detector de metales (Banda Túnel).
 * - `base`: incluye "Verificar base de fijación del conveyor".
 * - `cierre`: texto del último punto de limpieza.
 */
const banda = ({
  junta = "cubrejuntas",
  limpiador = "Estado de limpiadores de banda.",
  punto11 = na("Estado físico de correas (si aplica)."),
  base = true,
  cierre = "Verificar limpieza de la zona.",
} = {}) =>
  [
    "Buen estado de la tolva de descarga y laterales, verificando que no existan fugas de material.",
    limpiador,
    "Temperaturas anormales y vibración al tacto en chumaceras de rodos.",
    `Estado físico de ${junta}, banda y alineamiento en toda su longitud.`,
    "Estado físico de la banda.",
    "Verificar que todos los rodillos giren libremente.",
    "Ruidos extraños y elementos flojos o sueltos.",
    "Temperaturas y vibraciones anormales al tacto en motor y reductor.",
    "Estado de limpieza en motor y reductor; limpiar si es necesario.",
    "Fugas de aceite.",
    punto11,
    "Revisar estado físico y tensión del cable de paros de emergencia.",
    base ? "Verificar base de fijación del conveyor y su estructura." : null,
    "Estado físico de escalera de acceso a plataforma y guardas.",
    cierre,
  ].filter(Boolean);

const eq = (tag, asset, name, criticality, items) => ({
  id: tag,
  tag,
  asset,
  name,
  criticality,
  items: items.map((it, i) => {
    const item = typeof it === "string" ? { text: it, allowsNA: false } : it;
    return { id: `${tag}#${i + 1}`, n: i + 1, ...item };
  }),
});

export const SITE = {
  id: "tepeagua",
  name: "Planta Tepeagua",
  company: "Holcim El Salvador",
};

export const AREAS = [
  {
    id: "HZA0.311",
    name: "Trituradora Primaria",
    equipment: [
      eq("HZA0.311-TY1", "10103631", "Tolva metálica de alimentación", "B", TOLVA_PRIMARIA),
      eq("HZA0.311-AV1", "10103632", "Alimentador vibratorio", "A", ALIMENTADOR_PRIMARIA),
      eq("HZA0.311-TM1", "10103634", "Trituradora primaria", "A", TRITURADORA_PRIMARIA),
      eq("HZA0.311-BT2", "10103639", "Banda descarga trituradora primaria", "A",
        banda({ junta: "empalme", cierre: "Limpieza de la zona." })),
      eq("HZA0.311-BT3", "10103642", "Banda a pila pulmón", "A",
        banda({ junta: "empalme", limpiador: "Estado físico de rascadores.", base: false, cierre: "Limpieza de la zona." })),
      eq("HZA0.311-BT1", "10103636", "Banda descarga barrotes", "B",
        banda({ junta: "empalme", base: false, cierre: "Limpieza de la zona." })),
      eq("HZA0.311-CV1", "10103690", "Criba vibratoria #1 – T. Primaria", "B", CRIBA),
      eq("HZA0.311-BT4", "10103696", "Banda alimentación criba #1", "B", banda()),
      eq("HZA0.311-BT5", "10103699", "Banda de descarga / sobretamaño criba #1", "B", banda()),
      eq("HZA0.311-CV", "10103702", "Banda transportadora – despolve", "B", banda()),
    ],
  },
  {
    id: "HZA0.321",
    name: "Trituradora Secundaria",
    equipment: [
      eq("HZA0.321-BT1", "10103664", "Banda túnel", "A",
        banda({ junta: "empalme", punto11: "Verificar buen estado del detector de metales.", cierre: "Limpieza de la zona." })),
      eq("HZA0.321-AV1", "10103667", "Alimentador vibratorio 1 – banda túnel", "A", ALIMENTADOR_VIBRATORIO),
      eq("HZA0.321-AV2", "10103668", "Alimentador vibratorio 2 – banda túnel", "A", ALIMENTADOR_VIBRATORIO),
      eq("HZA0.321-CV1", "10103650", "Criba vibratoria #2 – T. Secundaria", "A", CRIBA_SECUNDARIA),
      eq("HZA0.321-TI1", "10103649", "Trituradora secundaria", "A", TRITURADORA_SECUNDARIA),
      eq("HZA0.321-BT2", "10103671", "Banda alimentación criba #2", "A", banda()),
      eq("HZA0.321-BT3", "10103673", "Banda descarga trituradora cono", "A", banda()),
      eq("HZA0.321-BT4", "10103675", "Banda descarga criba #2", "A", banda()),
      eq("HZA0.321-BT5", "10103677", "Banda de alimentación a tolva T. impacto", "A", banda()),
    ],
  },
  {
    id: "HZA0.331",
    name: "Trituradora Terciaria",
    equipment: [
      eq("HZA0.331-AV1", "10103656", "Alimentador vibratorio VSI #1", "A", ALIMENTADOR_VIBRATORIO),
      eq("HZA0.331-AV2", "10204101", "Alimentador vibratorio VSI #2", "A", ALIMENTADOR_VIBRATORIO),
      eq("HZA0.331-TY1", "10103655", "Tolva de alimentación – T. impacto", "B", TOLVA_TERCIARIA),
      eq("HZA0.331-TB1", "10103658", "Trituradora impacto eje vertical 1 (VSI-1)", "A", TRITURADORA_VSI),
      eq("HZA0.331-TB2", "10103661", "Trituradora impacto eje vertical 2 (VSI-2)", "A", TRITURADORA_VSI),
      eq("HZA0.331-CV2", "10103652", "Criba vibratoria #3", "A", CRIBA),
      eq("HZA0.331-BT1", "10103680", "Banda descarga trituradora impacto", "A", banda()),
      eq("HZA0.331-BT2", "10103683", "Banda alimentación criba #3", "A", banda()),
      eq("HZA0.331-BT3", "10103687", "Banda retorno trituradora impacto", "A", banda()),
      eq("HZA0.331-BT4", "10103706", "Banda transporte arena triturada", "A", banda()),
      eq("HZA0.331-BT7", "10103714", "Banda transporte grava 3/8", "A", banda()),
      eq("HZA0.331-BTA", "10103710", "Banda transporte grava #1", "A", banda()),
    ],
  },
];

export const findArea = (areaId) => AREAS.find((a) => a.id === areaId);

export const findEquipment = (equipmentId) => {
  for (const area of AREAS) {
    const e = area.equipment.find((x) => x.id === equipmentId);
    if (e) {
      return { area, equipment: e };
    }
  }
  return null;
};

/**
 * Catálogo de Planta Tepeagua (Holcim El Salvador).
 * Textos según la versión rectificada del formulario VOSOA
 * ("VOSOA HZA0 20.11.2026.xlsx"), con ortografía corregida.
 * Un área = un formulario; cada equipo trae su lista de verificación.
 */

const na = (text) => ({ text, allowsNA: true });

const TOLVA_PRIMARIA = [
  "Estado físico de la tolva (deformación en uniones y anclajes).",
  "Fugas de material a los costados.",
  "Elementos sueltos o flojos que puedan indicar roturas en cualquier parte de la tolva.",
  "Buen funcionamiento del sistema de aspersión del material.",
  "Estado físico de la cortina de cadenas.",
  "Estado físico de escalera de acceso a plataforma.",
];

const TOLVA_TERCIARIA = [
  "Estado físico de la tolva (desgastes, grietas, deformación y pintura).",
  "Fugas de material.",
  "Elementos sueltos o flojos que puedan indicar roturas en cualquier parte de la tolva.",
  "Estado físico de escalera y guardas en el acceso a la plataforma.",
];

const ALIMENTADOR_PRIMARIA = [
  "Buen estado físico de los resortes.",
  "Elementos flojos o sueltos.",
  "Ruidos extraños.",
  "En el motor verificar estado físico de caja de conexiones, corazas, conectores, cables eléctricos y fijación (que todo se observe bien).",
  "Verificar que no existan fisuras o roturas en su estructura.",
  "Estado físico de correas.",
  "Verificar el nivel de aceite.",
  "Verificar temperaturas y vibraciones anormales en motor y variador de velocidad.",
];

const ALIMENTADOR_SECUNDARIA = [
  "Buen estado físico de los soportes de resortes / suspensión. Pernos de anclaje.",
  "Elementos flojos o sueltos.",
  "Ruidos extraños.",
  "Correcta fijación de motores, conexiones eléctricas y temperatura.",
  "Verificar que no existan fisuras o roturas en su estructura.",
  "Verificar estado de limpieza.",
];

const ALIMENTADOR_VSI = [
  "Verificar estado físico de los soportes de resortes / suspensión, pernos de anclaje y cables de soporte de seguridad.",
  "Elementos flojos o sueltos.",
  "Ruidos extraños.",
  "Correcta fijación de motores, conexiones eléctricas y temperatura.",
  "Verificar que no existan fisuras o roturas en su estructura.",
  "Verificar estado de limpieza de la salida del alimentador.",
];

const TRITURADORA_PRIMARIA = [
  "Verificar temperaturas y vibraciones anormales en los rodamientos y que las carcasas no presenten daños. Revisión de la polea motriz y buen estado de correas.",
  "Verificar temperaturas anormales de los rodamientos laterales y central del eje excéntrico, y que las carcasas no presenten daños.",
  "Estado de limpieza de grasa de la maquinaria en las estructuras.",
  "Deformaciones y fisuras en anclajes de cada uno de los barrotes (faltantes o tornillería dañada).",
  "Verificar deformaciones, desgastes o abertura de mandíbulas (calibración adecuada para operación).",
  "Verificar que los soportes de concreto y/o madera se encuentren en buen estado.",
  "Verificar temperatura y vibraciones de rodamientos y signos de ruidos extraños en el motor eléctrico.",
  "En el motor verificar estado físico de caja de conexiones, corazas, conectores, cables eléctricos y fijación.",
  "Verificar temperatura y fijación del arrancador rotórico (electricista certificado).",
  "Estado físico de escalera de acceso a plataforma y guardas de seguridad.",
  "Verificar orden y limpieza de la zona.",
];

const TRITURADORA_SECUNDARIA = [
  "Verificar temperatura y vibraciones, ruidos extraños en cono.",
  "Deformaciones. Abertura de cono (calibración adecuada para operación).",
  "Tornillería externa en buen estado.",
  "En sistema hidráulico verificar el flujo de aceite (2 GPM mínimo).",
  "Verificar el estado de limpieza de la carcasa y derrames de material alrededor del cono.",
  "Verificar temperatura y vibraciones al tacto de rodamientos y carcasa, signos de ruidos extraños y limpieza externa del motor eléctrico.",
  "En motor eléctrico verificar estado físico de caja de conexiones, corazas, conectores, cables eléctricos y fijación.",
  "Verificar temperatura y fijación del arrancador rotórico (electricista certificado).",
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
  "Verificación visual del estado físico de los 5 impulsores.",
  "Verificación visual del estado físico de los 16 ANVIL STAB.",
  "Fugas de aceite por sellos.",
  "Verificar orden y limpieza externa de la plataforma.",
  "Verificar temperatura y vibraciones de rodamientos, signos de ruidos extraños y carcasa del motor eléctrico.",
  "En motor verificar estado físico de caja de conexiones, tuberías, corazas, conectores, cables eléctricos y fijación.",
  "Estado físico y tensión de correas.",
  "Temperatura al tacto del motor.",
  "Signos de ruidos extraños en motor.",
  "Estado de limpieza externa de motor, carcasa.",
  "Buen funcionamiento de la bomba hidráulica.",
  "Fugas de aceite por válvulas, conectores y tuberías en todo su recorrido.",
  "Verificar temperatura normal del motor de la bomba hidráulica y buen estado de conexiones eléctricas.",
  "Verificar nivel adecuado de lubricante en el depósito de la bomba hidráulica.",
];

/** Criba vibratoria. La de Secundaria no lleva vibradores de tolva y cierra con limpieza de máquina. */
const criba = ({ secundaria = false } = {}) =>
  [
    "Buen estado físico de los resortes.",
    "Elementos flojos o sueltos.",
    "Verificar buen estado de correas.",
    "Ruidos extraños en caja de engranajes o fugas de aceite.",
    "Verificar nivel de aceite.",
    "Correcta fijación del motor y caja de conexiones eléctricas.",
    "Verificar que no existan fisuras o roturas en su estructura.",
    "Fugas de material y estado de limpieza externo.",
    "Verificar que los soportes de la criba se encuentren en buen estado.",
    "Verificar buen estado de mallas (tensión o roturas en malla).",
    "Buen estado de los niveles de la criba, de las salidas de descarga y de los laterales, verificando que no exista contaminación de material.",
    secundaria ? null : "Verificar vibradores y base de fijación en estructura de tolva en buen estado.",
    "Estado físico de escalera de acceso a plataforma y guardas.",
    secundaria ? "Estado de limpieza de la máquina, estructuras y accesos." : "Verificar orden y limpieza de la zona.",
  ].filter(Boolean);

/** Banda transportadora. La Banda Túnel agrega la revisión de la estructura del túnel. */
const banda = ({ tunel = false } = {}) =>
  [
    "Verificar el buen estado de la tolva de descarga y laterales, verificando que no existan fugas de material.",
    "Verificar estado de limpiadores del rodo motriz de la banda (que no tengan material acumulado o desajustes).",
    "Verificar estado de limpiadores lateral y trasero de la banda (que no tengan material acumulado o desajustes).",
    "Verificar temperaturas y vibración en los rodamientos de los rodos motriz y de cola.",
    "Estado físico del empalme y alineamiento de la banda.",
    "Estado físico de la banda.",
    "Verificar que todos los rodillos giren libremente y no presenten desgaste.",
    "Ruidos extraños y elementos flojos o sueltos.",
    "Verificar temperaturas y vibraciones anormales en motor y reductor.",
    "Verificar el estado de limpieza en motor y reductor, y el estado físico de caja de conexiones, corazas, conectores, cables eléctricos y fijación.",
    "Fugas de aceite en reductor.",
    na("Estado físico de correas (si aplica)."),
    "Revisar estado físico y tensión del cable de paros de emergencia.",
    tunel ? "Estado físico de la estructura del túnel (deformación, corrosión, uniones y anclajes)." : null,
    "Verificar base de fijación del conveyor y su estructura.",
    "Estado físico de escalera de acceso a plataforma y guardas de seguridad.",
    "Verificar orden y limpieza de la zona.",
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
      eq("HZA0.311-BT2", "10103639", "Banda descarga trituradora primaria", "A", banda()),
      eq("HZA0.311-BT3", "10103642", "Banda a pila pulmón", "A", banda()),
      eq("HZA0.311-BT1", "10103636", "Banda descarga barrotes", "B", banda()),
      eq("HZA0.311-CV1", "10103690", "Criba vibratoria #1 – T. Primaria", "B", criba()),
      eq("HZA0.311-BT4", "10103696", "Banda alimentación criba #1", "B", banda()),
      eq("HZA0.311-BT5", "10103699", "Banda de descarga / sobretamaño criba #1", "B", banda()),
      eq("HZA0.311-CV", "10103702", "Banda transportadora – despolve", "B", banda()),
    ],
  },
  {
    id: "HZA0.321",
    name: "Trituradora Secundaria",
    equipment: [
      eq("HZA0.321-BT1", "10103664", "Banda túnel", "A", banda({ tunel: true })),
      eq("HZA0.321-AV1", "10103667", "Alimentador vibratorio 1 – banda túnel", "A", ALIMENTADOR_SECUNDARIA),
      eq("HZA0.321-AV2", "10103668", "Alimentador vibratorio 2 – banda túnel", "A", ALIMENTADOR_SECUNDARIA),
      eq("HZA0.321-CV1", "10103650", "Criba vibratoria #2 – T. Secundaria", "A", criba({ secundaria: true })),
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
      eq("HZA0.331-AV1", "10103656", "Alimentador vibratorio VSI #1", "A", ALIMENTADOR_VSI),
      eq("HZA0.331-AV2", "10204101", "Alimentador vibratorio VSI #2", "A", ALIMENTADOR_VSI),
      eq("HZA0.331-TY1", "10103655", "Tolva de alimentación – T. impacto", "B", TOLVA_TERCIARIA),
      eq("HZA0.331-TB1", "10103658", "Trituradora impacto eje vertical 1 (VSI-1)", "A", TRITURADORA_VSI),
      eq("HZA0.331-TB2", "10103661", "Trituradora impacto eje vertical 2 (VSI-2)", "A", TRITURADORA_VSI),
      eq("HZA0.331-CV2", "10103652", "Criba vibratoria #3", "A", criba()),
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

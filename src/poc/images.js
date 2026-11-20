/*
 * Fotos ilustrativas por tipo de equipo y por área (Wikimedia Commons, ver
 * src/assets/photos/CREDITS.md). Se reemplazan por fotos reales de Planta Tepeagua
 * cuando Holcim las comparta: basta con cambiar los archivos o este mapa.
 */
const P = {
  tolva: require("../assets/photos/tolva.jpg"),
  alimentador: require("../assets/photos/alimentador.jpg"),
  mandibula: require("../assets/photos/trit_mandibula.jpg"),
  cono: require("../assets/photos/trit_cono.jpg"),
  vsi: require("../assets/photos/trit_vsi.jpg"),
  criba: require("../assets/photos/criba.jpg"),
  banda: require("../assets/photos/banda.jpg"),
  primaria: require("../assets/photos/area_primaria.jpg"),
  secundaria: require("../assets/photos/area_secundaria.jpg"),
  terciaria: require("../assets/photos/area_terciaria.jpg"),
};

const AREA_PHOTOS = {
  "HZA0.311": P.primaria,
  "HZA0.321": P.secundaria,
  "HZA0.331": P.terciaria,
};

export const areaPhoto = (areaId) => AREA_PHOTOS[areaId] ?? P.secundaria;

export const equipmentPhoto = (equipment) => {
  const n = equipment.name.toLowerCase();
  if (n.startsWith("banda")) return P.banda;
  if (n.startsWith("criba")) return P.criba;
  if (n.startsWith("tolva")) return P.tolva;
  if (n.startsWith("alimentador")) return P.alimentador;
  if (n.includes("eje vertical") || n.includes("vsi")) return P.vsi;
  if (n.includes("secundaria")) return P.cono;
  if (n.startsWith("trituradora")) return P.mandibula;
  return P.banda;
};

export const HERO = P.secundaria;

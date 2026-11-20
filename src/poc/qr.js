import qrcode from "qrcode-generator";
import { AREAS, SITE, findEquipment } from "../data/tepeagua";
import { LOGO_SVG } from "./HolcimLogo";

const PREFIX = "VOSOA:";

/** Texto que lleva el QR pegado en cada equipo. */
export const qrPayload = (tag) => `${PREFIX}${tag}`;

/** Lee el texto de un QR y devuelve `{ area, equipment }` o `null` si no es un equipo conocido. */
export const parseQr = (text) => {
  const raw = String(text ?? "").trim();
  const tag = raw.toUpperCase().startsWith(PREFIX) ? raw.slice(PREFIX.length).trim() : raw;
  return findEquipment(tag);
};

/** SVG del QR, para la hoja de etiquetas. */
export const qrSvg = (text, cellSize = 4) => {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize, margin: 2, scalable: true });
};

const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** HTML imprimible con una etiqueta QR por equipo, agrupadas por área. */
export function buildQrLabelsHtml() {
  const sections = AREAS.map(
    (area) => `
    <h2>${esc(area.id)} · ${esc(area.name)}</h2>
    <div class="grid">
      ${area.equipment
        .map(
          (e) => `
        <div class="label">
          <div class="qr">${qrSvg(qrPayload(e.tag))}</div>
          <div class="tag">${esc(e.tag)}</div>
          <div class="name">${esc(e.name)}</div>
          <div class="meta">Activo ${esc(e.asset)} · Criticidad ${esc(e.criticality)}</div>
        </div>`,
        )
        .join("")}
    </div>`,
  ).join("");

  return `<!doctype html><html><head><meta charset="utf-8"/>
  <style>
    @page { size: letter; margin: 12mm; }
    body { font-family: Helvetica, Arial, sans-serif; color: #231F20; margin: 0; }
    .logo svg { width: 140px; height: auto; margin-bottom: 6px; }
    h1 { font-size: 18px; margin: 0 0 2px; color: #1D4370; }
    .sub { font-size: 11px; color: #666; margin-bottom: 8px; }
    h2 { font-size: 13px; background: #1D4370; color: #fff; padding: 4px 8px; margin: 14px 0 6px; page-break-after: avoid; }
    .grid { display: flex; flex-wrap: wrap; gap: 6px; }
    .label { width: 58mm; border: 1px dashed #999; padding: 6px; text-align: center; page-break-inside: avoid; box-sizing: border-box; }
    .qr svg { width: 38mm; height: 38mm; }
    .tag { font-family: Menlo, monospace; font-weight: bold; font-size: 13px; margin-top: 2px; }
    .name { font-size: 11px; margin-top: 2px; }
    .meta { font-size: 9px; color: #666; margin-top: 2px; }
  </style></head><body>
    <div class="logo">${LOGO_SVG}</div>
    <h1>Etiquetas QR de equipos — ${esc(SITE.name)}</h1>
    <div class="sub">${esc(SITE.company)} · Recortar y pegar cada etiqueta en su equipo. Escanear desde Preventivo → "Escanear QR".</div>
    ${sections}
  </body></html>`;
}

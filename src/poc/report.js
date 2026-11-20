import { Platform } from "react-native";
import { generatePDF } from "react-native-html-to-pdf";
import Share from "react-native-share";
import { SITE, findArea } from "../data/tepeagua";
import { inspectionKey } from "../store/poc";
import { signatureToSvg } from "./SignaturePad";
import { fmtDate, fmtTime } from "./ui";
import { buildQrLabelsHtml } from "./qr";
import { LOGO_SVG } from "./HolcimLogo";
import { loadPhotos, photosOf } from "./photos";

const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const mark = (on, cls) => (on ? `<span class="${cls}">X</span>` : "");

/** Construye el HTML de la hoja VOSOA con el mismo orden que el formulario en papel. */
export function buildVosoaHtml(state, roundId, photoData = {}) {
  const round = state.rounds[roundId];
  const area = findArea(round.areaId);
  const photos = [];
  let good = 0;
  let bad = 0;
  let na = 0;
  let pending = 0;

  const rows = area.equipment
    .map((e) => {
      const insp = state.inspections[inspectionKey(roundId, e.id)];
      const done = Boolean(insp?.completedAt);
      const head = `<tr class="eq"><td colspan="2"><b>${esc(e.tag)}</b>&nbsp;&nbsp;${esc(e.asset)}&nbsp;&nbsp;${esc(
        e.name.toUpperCase(),
      )}, CRITICIDAD ${e.criticality}${done ? "" : ' <span class="pend">— NO REVISADO</span>'}</td><td class="c">Bueno</td><td class="c">Malo</td><td class="c">N/A</td></tr>`;
      const items = e.items
        .map((it) => {
          const r = done ? insp.results[it.id] : null;
          const o = r?.outcome;
          if (o === "good") good += 1;
          else if (o === "bad") bad += 1;
          else if (o === "na") na += 1;
          else pending += 1;
          const ids = photosOf(r).filter((id) => photoData[id] || id.startsWith("data:"));
          if (ids.length) {
            photos.push({ tag: e.tag, n: it.n, text: it.text, outcome: o, note: r.note, srcs: ids.map((id) => photoData[id] || id) });
          }
          const note = o === "bad" && r.note ? `<div class="note">Observación: ${esc(r.note)}</div>` : "";
          return `<tr class="${o === "bad" ? "badrow" : ""}"><td class="n">${it.n}</td><td>${esc(it.text)}${note}</td><td class="c">${mark(
            o === "good",
            "g",
          )}</td><td class="c">${mark(o === "bad", "b")}</td><td class="c">${mark(o === "na", "a")}</td></tr>`;
        })
        .join("");
      const comment = insp?.comment ? `<tr><td></td><td colspan="4" class="eqc">Comentario: ${esc(insp.comment)}</td></tr>` : "";
      return head + items + comment;
    })
    .join("");

  const LABEL = { good: "Bueno", bad: "Malo", na: "N/A" };
  const photoBlock = photos.length
    ? `<div class="page"><h2>Anexo — Evidencia fotográfica</h2>${photos
        .map(
          (p) =>
            `<div class="ph"><div class="phh"><b>${esc(p.tag)} · punto ${p.n}</b> — ${esc(p.text)} <span class="o ${
              p.outcome
            }">${LABEL[p.outcome] ?? "Sin marcar"}</span>${p.note ? `<br/><i>${esc(p.note)}</i>` : ""}</div><div class="imgs">${p.srcs
              .map((src) => `<img src="${src}"/>`)
              .join("")}</div></div>`,
        )
        .join("")}</div>`
    : "";

  const hora = `${fmtTime(round.startedAt)} – ${fmtTime(round.closedAt ?? Date.now())}`;

  return `<!doctype html><html><head><meta charset="utf-8"/><style>
    *{box-sizing:border-box} body{font-family:Helvetica,Arial,sans-serif;font-size:10.5px;color:#231F20;margin:28px}
    .top{text-align:center} .top h1{font-size:15px;margin:0} .top h2{font-size:13px;margin:4px 0 10px;font-weight:600}
    .meta{width:100%;border-collapse:collapse;margin-bottom:10px} .meta td{padding:4px 6px;border:1px solid #999}
    .meta b{display:inline-block;min-width:60px}
    table.list{width:100%;border-collapse:collapse} .list td{border:1px solid #bbb;padding:3px 5px;vertical-align:top}
    .list .eq td{background:#1D4370;color:#fff;font-size:10px;padding:5px} .pend{color:#FFB4B4}
    .brand{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #04BBF1;padding-bottom:8px;margin-bottom:8px}
    .brand svg{width:150px;height:auto} .brand .t{text-align:right} .brand h1{font-size:15px;margin:0;color:#1D4370} .brand h2{font-size:12px;margin:2px 0 0;font-weight:600}
    .n{width:22px;text-align:right;color:#666} .c{width:38px;text-align:center} .eq .c{font-weight:bold}
    .g{color:#1E8E3E;font-weight:bold} .b{color:#C5221F;font-weight:bold} .a{color:#5F6368;font-weight:bold}
    .badrow td{background:#FCE8E6} .note{color:#C5221F;font-style:italic;margin-top:2px} .eqc{font-style:italic;color:#444}
    .sum{margin:10px 0;padding:6px 8px;background:#F4F2F2;border-radius:4px}
    .foot{margin-top:14px;width:100%;border-collapse:collapse} .foot td{border:1px solid #999;padding:6px;vertical-align:top}
    .page{page-break-before:always} .page h2{font-size:13px}
    .ph{margin-bottom:12px;page-break-inside:avoid} .phh{margin-bottom:4px}
    .imgs{display:flex;flex-wrap:wrap;gap:6px} .imgs img{width:160px;height:120px;object-fit:cover;border:1px solid #ccc;border-radius:3px}
    .o{font-weight:bold;padding:0 5px;border-radius:3px} .o.good{color:#1E8E3E} .o.bad{color:#C5221F} .o.na{color:#5F6368}
    .gen{margin-top:10px;color:#888;font-size:9px;text-align:right}
  </style></head><body>
    <div class="brand">${LOGO_SVG}<div class="t"><h1>${esc(SITE.company)}</h1><h2>Vosoa Inspección Diaria de Bandas Transportadoras</h2></div></div>
    <table class="meta"><tr><td><b>Fecha:</b> ${fmtDate(round.startedAt)}</td><td><b>Hora revisión:</b> ${hora}</td></tr>
    <tr><td><b>Denominación de equipo:</b> ${esc(area.name)}</td><td><b>Plantel:</b> ${esc(SITE.name)}</td></tr></table>
    <div class="sum">Resultado: <b>${good}</b> Bueno · <b class="b">${bad}</b> Malo · <b>${na}</b> No aplica${
      pending ? ` · <b>${pending}</b> sin revisar` : ""
    }</div>
    <table class="list">${rows}</table>
    <table class="foot"><tr><td style="width:60%"><b>Comentarios</b><br/>${esc(round.comments) || "—"}</td>
    <td><b>Persona que realizó VOSOA</b><br/>${esc(round.technician)}<br/><br/><b>Firma</b><br/>${signatureToSvg(round.signature)}</td></tr></table>
    <div class="gen">Generado con MaintenanceApp · ${fmtDate(Date.now())} ${fmtTime(Date.now())}</div>
    ${photoBlock}
  </body></html>`;
}

const roundPhotoIds = (state, roundId) =>
  Object.values(state.inspections)
    .filter((i) => i.roundId === roundId)
    .flatMap((i) => Object.values(i.results).flatMap(photosOf));

export async function generateVosoaPdf(state, roundId) {
  const round = state.rounds[roundId];
  const area = findArea(round.areaId);
  const fileName = `VOSOA_${area.name.replace(/\s+/g, "_")}_${round.date}`;
  const result = await generatePDF({
    html: buildVosoaHtml(state, roundId, await loadPhotos(roundPhotoIds(state, roundId))),
    fileName,
    directory: Platform.OS === "ios" ? "Documents" : undefined,
  });
  return result.filePath;
}

export async function sharePdf(path, title) {
  const url = path.startsWith("file://") ? path : `file://${path}`;
  try {
    await Share.open({ url, type: "application/pdf", title, subject: title, failOnCancel: false });
  } catch (e) {
    if (!String(e?.message).includes("cancel")) {
      throw e;
    }
  }
}

export async function generateQrLabelsPdf() {
  const result = await generatePDF({
    html: buildQrLabelsHtml(),
    fileName: `Etiquetas_QR_${SITE.name.replace(/\s+/g, "_")}`,
    directory: Platform.OS === "ios" ? "Documents" : undefined,
  });
  return result.filePath;
}

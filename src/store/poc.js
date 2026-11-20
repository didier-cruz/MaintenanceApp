import { findEquipment } from "../data/tepeagua";
import { photosOf } from "../poc/photos";

export const todayKey = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const roundIdFor = (areaId, date = todayKey()) => `${date}_${areaId}`;
export const inspectionKey = (roundId, equipmentId) => `${roundId}|${equipmentId}`;

export const initialState = {
  technician: null, // { name }
  onSite: false,
  attendance: [], // { id, type: 'in'|'out', at, flag }
  rounds: {}, // roundId -> { id, areaId, date, startedAt, closedAt, comments, signature, technician, pdfPath }
  inspections: {}, // key -> { roundId, equipmentId, results: { itemId: { outcome, note, photos: [photoId] } }, comment, completedAt }
  faults: {}, // id -> { id, roundId, areaId, equipmentId, itemId, ... status }
};

const ensureRound = (state, areaId, roundId, at) => {
  if (state.rounds[roundId]) {
    return state.rounds;
  }
  return {
    ...state.rounds,
    [roundId]: {
      id: roundId,
      areaId,
      date: roundId.split("_")[0],
      startedAt: at,
      closedAt: null,
      comments: "",
      signature: null,
      technician: state.technician?.name ?? "",
      pdfPath: null,
    },
  };
};

const syncFaults = (faults, inspection, areaId, technician, at) => {
  const { equipment } = findEquipment(inspection.equipmentId);
  const next = { ...faults };
  for (const item of equipment.items) {
    const id = `${inspection.roundId}|${item.id}`;
    const r = inspection.results[item.id];
    if (r?.outcome === "bad") {
      const prev = next[id];
      next[id] = {
        id,
        roundId: inspection.roundId,
        areaId,
        equipmentId: equipment.id,
        itemId: item.id,
        itemText: item.text,
        criticality: equipment.criticality,
        note: r.note,
        photos: photosOf(r),
        openedAt: prev?.openedAt ?? at,
        reportedBy: technician,
        status: prev?.status ?? "open",
        resolvedAt: prev?.resolvedAt ?? null,
        resolution: prev?.resolution ?? "",
      };
    } else if (next[id] && next[id].status === "open") {
      delete next[id];
    }
  }
  return next;
};

export default function pocReducer(state = initialState, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...initialState, ...action.state };
    case "RESET_DEMO":
      return { ...initialState, technician: state.technician };
    case "SET_TECHNICIAN":
      return { ...state, technician: action.name ? { name: action.name } : null };
    case "CHECK_IN":
      return {
        ...state,
        onSite: true,
        attendance: [
          ...state.attendance,
          { id: `${action.at}`, type: "in", at: action.at, flag: action.flag, by: state.technician?.name },
        ],
      };
    case "CHECK_OUT":
      return {
        ...state,
        onSite: false,
        attendance: [
          ...state.attendance,
          { id: `${action.at}`, type: "out", at: action.at, flag: action.flag, by: state.technician?.name },
        ],
      };
    case "SET_RESULT": {
      const { areaId, roundId, equipmentId, itemId, patch, at } = action;
      const key = inspectionKey(roundId, equipmentId);
      const insp = state.inspections[key] ?? { roundId, equipmentId, results: {}, comment: "", completedAt: null };
      const prev = insp.results[itemId] ?? {};
      return {
        ...state,
        rounds: ensureRound(state, areaId, roundId, at),
        inspections: {
          ...state.inspections,
          [key]: { ...insp, results: { ...insp.results, [itemId]: { ...prev, ...patch } } },
        },
      };
    }
    case "SET_ALL_GOOD": {
      const { areaId, roundId, equipmentId, at } = action;
      const key = inspectionKey(roundId, equipmentId);
      const insp = state.inspections[key] ?? { roundId, equipmentId, results: {}, comment: "", completedAt: null };
      const { equipment } = findEquipment(equipmentId);
      const results = { ...insp.results };
      for (const item of equipment.items) {
        if (!results[item.id]?.outcome) {
          results[item.id] = { outcome: "good" };
        }
      }
      return {
        ...state,
        rounds: ensureRound(state, areaId, roundId, at),
        inspections: { ...state.inspections, [key]: { ...insp, results } },
      };
    }
    case "SET_EQUIPMENT_COMMENT": {
      const key = inspectionKey(action.roundId, action.equipmentId);
      const insp = state.inspections[key];
      if (!insp) {
        return state;
      }
      return { ...state, inspections: { ...state.inspections, [key]: { ...insp, comment: action.comment } } };
    }
    case "COMPLETE_EQUIPMENT": {
      const key = inspectionKey(action.roundId, action.equipmentId);
      const insp = { ...state.inspections[key], completedAt: action.at };
      return {
        ...state,
        inspections: { ...state.inspections, [key]: insp },
        faults: syncFaults(state.faults, insp, action.areaId, state.technician?.name, action.at),
      };
    }
    case "CLOSE_ROUND": {
      const round = state.rounds[action.roundId];
      return {
        ...state,
        rounds: {
          ...state.rounds,
          [action.roundId]: {
            ...round,
            closedAt: action.at,
            comments: action.comments,
            signature: action.signature,
            technician: state.technician?.name ?? round.technician,
          },
        },
      };
    }
    case "SET_ROUND_PDF":
      return {
        ...state,
        rounds: { ...state.rounds, [action.roundId]: { ...state.rounds[action.roundId], pdfPath: action.path } },
      };
    case "RESOLVE_FAULT":
      return {
        ...state,
        faults: {
          ...state.faults,
          [action.id]: { ...state.faults[action.id], status: "resolved", resolvedAt: action.at, resolution: action.note },
        },
      };
    default:
      return state;
  }
}

/* ---------- selectors ---------- */

export const equipmentStatus = (state, roundId, equipment) => {
  const insp = state.inspections[inspectionKey(roundId, equipment.id)];
  const results = insp?.results ?? {};
  const answered = equipment.items.filter((i) => results[i.id]?.outcome).length;
  const bad = equipment.items.filter((i) => results[i.id]?.outcome === "bad").length;
  return {
    answered,
    total: equipment.items.length,
    bad,
    done: Boolean(insp?.completedAt),
    started: answered > 0,
  };
};

export const areaProgress = (state, area, roundId) => {
  let done = 0;
  let points = 0;
  let bad = 0;
  let totalPoints = 0;
  for (const e of area.equipment) {
    const s = equipmentStatus(state, roundId, e);
    totalPoints += s.total;
    if (s.done) {
      done += 1;
      points += s.answered;
      bad += s.bad;
    }
  }
  return { done, total: area.equipment.length, points, totalPoints, bad };
};

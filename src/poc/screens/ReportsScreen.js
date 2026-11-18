import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AREAS } from "../../data/tepeagua";
import { areaProgress, roundIdFor, todayKey } from "../../store/poc";
import { Button, C, Card, ProgressBar, SectionTitle, fmtLongDate, fmtTime } from "../ui";
import { sharePdf } from "../report";

export default function ReportsScreen() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s);
  const today = todayKey();

  let eqDone = 0;
  let eqTotal = 0;
  let points = 0;
  let bad = 0;
  const perArea = AREAS.map((area) => {
    const roundId = roundIdFor(area.id);
    const p = areaProgress(state, area, roundId);
    eqDone += p.done;
    eqTotal += p.total;
    points += p.points;
    bad += p.bad;
    return { area, p, round: state.rounds[roundId] };
  });

  const faults = Object.values(state.faults);
  const openA = faults.filter((f) => f.status === "open" && f.criticality === "A").length;
  const openB = faults.filter((f) => f.status === "open" && f.criticality === "B").length;
  const resolvedToday = faults.filter((f) => f.status === "resolved" && todayKey(new Date(f.resolvedAt)) === today).length;
  const attendance = state.attendance.filter((a) => todayKey(new Date(a.at)) === today);
  const compliance = eqTotal ? Math.round((eqDone / eqTotal) * 100) : 0;

  const reset = () =>
    Alert.alert("Reiniciar demo", "Se borran rondas, fallas y asistencia de este teléfono.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Reiniciar", style: "destructive", onPress: () => dispatch({ type: "RESET_DEMO" }) },
    ]);

  return (
    <ScrollView style={st.screen} contentContainerStyle={st.body}>
      <Text style={st.h1}>Resumen del día</Text>
      <Text style={st.sub}>{fmtLongDate(Date.now())} · Planta Tepeagua</Text>

      <View style={st.kpis}>
        <Kpi value={`${compliance}%`} label="cumplimiento de la ronda" sub={`${eqDone} de ${eqTotal} equipos`} />
        <Kpi value={points} label="puntos revisados" sub={`${bad} en Malo`} />
      </View>
      <View style={st.kpis}>
        <Kpi value={openA} label="fallas abiertas crit. A" tone={openA ? C.bad : C.ink} />
        <Kpi value={openB} label="fallas abiertas crit. B" tone={openB ? C.warn : C.ink} sub={`${resolvedToday} atendidas hoy`} />
      </View>

      <SectionTitle>Avance por área</SectionTitle>
      {perArea.map(({ area, p, round }) => (
        <Card key={area.id} style={st.mb10}>
          <View style={st.rowBetween}>
            <Text style={st.areaName}>{area.name}</Text>
            <Text style={st.areaPct}>
              {p.done}/{p.total}
            </Text>
          </View>
          <View style={st.mt8}>
            <ProgressBar value={p.done} total={p.total} tone={round?.closedAt ? C.good : C.warn} />
          </View>
          <Text style={st.areaMeta}>
            {round?.closedAt
              ? `Cerrada ${fmtTime(round.closedAt)} por ${round.technician}`
              : round
              ? `En curso desde ${fmtTime(round.startedAt)}`
              : "Sin iniciar"}
            {p.bad ? ` · ${p.bad} Malo` : ""}
          </Text>
          {round?.pdfPath ? (
            <Button
              small
              variant="outline"
              title="Compartir hoja VOSOA"
              style={st.mt8}
              onPress={() => sharePdf(round.pdfPath, `VOSOA ${area.name}`).catch((e) => Alert.alert("Error", e.message))}
            />
          ) : null}
        </Card>
      ))}

      <SectionTitle>Asistencia de hoy</SectionTitle>
      <Card>
        {attendance.length === 0 ? (
          <Text style={st.areaMeta}>Sin registros.</Text>
        ) : (
          attendance.map((a) => (
            <View key={a.id} style={st.attRow}>
              <Text style={[st.attType, { color: a.type === "in" ? C.good : C.bad }]}>
                {a.type === "in" ? "Llegada" : "Salida"}
              </Text>
              <Text style={st.attWho}>{a.by}</Text>
              <Text style={st.attTime}>{fmtTime(a.at)}</Text>
            </View>
          ))
        )}
      </Card>

      <Button title="Reiniciar demo" variant="ghost" onPress={reset} style={st.mt24} />
    </ScrollView>
  );
}

const Kpi = ({ value, label, sub, tone = C.ink }) => (
  <Card style={st.kpi}>
    <Text style={[st.kpiValue, { color: tone }]}>{value}</Text>
    <Text style={st.kpiLabel}>{label}</Text>
    {sub ? <Text style={st.kpiSub}>{sub}</Text> : null}
  </Card>
);

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 24, fontWeight: "800", color: C.ink },
  sub: { fontSize: 14, color: C.muted, marginTop: 2, marginBottom: 12 },
  kpis: { flexDirection: "row", gap: 10, marginBottom: 10 },
  kpi: { flex: 1, padding: 14 },
  kpiValue: { fontSize: 30, fontWeight: "800" },
  kpiLabel: { color: C.inkSoft, fontSize: 13, fontWeight: "600", marginTop: 2 },
  kpiSub: { color: C.muted, fontSize: 12, marginTop: 4 },
  mb10: { marginBottom: 10 },
  mt8: { marginTop: 8 },
  mt24: { marginTop: 24 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  areaName: { fontSize: 16, fontWeight: "800", color: C.ink },
  areaPct: { fontWeight: "700", color: C.inkSoft },
  areaMeta: { color: C.muted, fontSize: 13, marginTop: 6 },
  attRow: { flexDirection: "row", paddingVertical: 6, alignItems: "center" },
  attType: { width: 70, fontWeight: "800" },
  attWho: { flex: 1, color: C.ink },
  attTime: { color: C.inkSoft, fontWeight: "700" },
});

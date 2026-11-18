import React from "react";
import { Alert, FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { AREAS, findArea } from "../../data/tepeagua";
import { areaProgress, equipmentStatus, roundIdFor } from "../../store/poc";
import { Badge, Button, Card, C, CritBadge, ProgressBar, fmtLongDate, fmtTime } from "../ui";
import { sharePdf } from "../report";

export function PreventiveScreen({ navigation }) {
  const state = useSelector((s) => s);
  return (
    <ScrollView style={st.screen} contentContainerStyle={st.body}>
      <Text style={st.h1}>Ronda del día</Text>
      <Text style={st.sub}>{fmtLongDate(Date.now())} · Inspección diaria de bandas transportadoras</Text>
      {AREAS.map((area) => {
        const roundId = roundIdFor(area.id);
        const round = state.rounds[roundId];
        const p = areaProgress(state, area, roundId);
        const closed = Boolean(round?.closedAt);
        const status = closed
          ? { label: `Cerrada ${fmtTime(round.closedAt)}`, tone: "good" }
          : p.done > 0 || round
          ? { label: "En curso", tone: "warn" }
          : { label: "Pendiente", tone: "na" };
        return (
          <Card key={area.id} style={st.areaCard} onPress={() => navigation.navigate("Area", { areaId: area.id })}>
            <View style={st.rowBetween}>
              <Text style={st.areaName}>{area.name}</Text>
              <Badge label={status.label} tone={status.tone} />
            </View>
            <Text style={st.areaMeta}>
              {area.id} · {area.equipment.length} equipos · {p.totalPoints} puntos
            </Text>
            <View style={st.progressRow}>
              <View style={st.flex}>
                <ProgressBar value={p.done} total={p.total} />
              </View>
              <Text style={st.progressText}>
                {p.done}/{p.total}
              </Text>
            </View>
            {p.bad > 0 ? <Text style={st.badText}>{p.bad} {p.bad === 1 ? "punto" : "puntos"} en Malo</Text> : null}
          </Card>
        );
      })}
    </ScrollView>
  );
}

export function AreaScreen({ route, navigation }) {
  const { areaId } = route.params;
  const area = findArea(areaId);
  const state = useSelector((s) => s);
  const roundId = roundIdFor(areaId);
  const round = state.rounds[roundId];
  const closed = Boolean(round?.closedAt);
  const p = areaProgress(state, area, roundId);

  const close = () => {
    const pending = p.total - p.done;
    if (pending > 0) {
      Alert.alert(
        "Equipos sin revisar",
        `${pending} equipo(s) no se han revisado. Aparecerán como "NO REVISADO" en la hoja VOSOA.`,
        [
          { text: "Seguir revisando", style: "cancel" },
          { text: "Cerrar de todos modos", onPress: () => navigation.navigate("CloseRound", { areaId }) },
        ],
      );
      return;
    }
    navigation.navigate("CloseRound", { areaId });
  };

  return (
    <View style={st.screen}>
      <FlatList
        data={area.equipment}
        keyExtractor={(e) => e.id}
        contentContainerStyle={st.body}
        ListHeaderComponent={
          <View style={st.mb12}>
            <View style={st.progressRow}>
              <View style={st.flex}>
                <ProgressBar value={p.done} total={p.total} />
              </View>
              <Text style={st.progressText}>
                {p.done}/{p.total} equipos
              </Text>
            </View>
            {closed ? (
              <Card style={st.closedCard}>
                <Text style={st.closedTitle}>Ronda cerrada a las {fmtTime(round.closedAt)}</Text>
                <Text style={st.closedSub}>Firmada por {round.technician}</Text>
                {round.pdfPath ? (
                  <Button
                    title="Compartir hoja VOSOA (PDF)"
                    variant="dark"
                    small
                    style={st.mt8}
                    onPress={() => sharePdf(round.pdfPath, `VOSOA ${area.name}`).catch((e) => Alert.alert("Error", e.message))}
                  />
                ) : null}
              </Card>
            ) : null}
          </View>
        }
        renderItem={({ item: e }) => {
          const s = equipmentStatus(state, roundId, e);
          let badge = { label: "Pendiente", tone: "na" };
          if (s.done && s.bad) badge = { label: `${s.bad} Malo`, tone: "bad" };
          else if (s.done) badge = { label: "✓ Bueno", tone: "good" };
          else if (s.started) badge = { label: `${s.answered}/${s.total}`, tone: "warn" };
          return (
            <Card
              style={[st.eqCard, s.done && st.eqDone]}
              onPress={() => navigation.navigate("Checklist", { areaId, equipmentId: e.id })}
            >
              <View style={st.rowBetween}>
                <Text style={st.tag}>{e.tag}</Text>
                <View style={st.badges}>
                  <CritBadge criticality={e.criticality} />
                  <View style={st.w6} />
                  <Badge label={badge.label} tone={badge.tone} />
                </View>
              </View>
              <Text style={st.eqName}>{e.name}</Text>
              <Text style={st.eqMeta}>
                Activo {e.asset} · {e.items.length} puntos
              </Text>
            </Card>
          );
        }}
        ListFooterComponent={
          closed ? null : <Button title="Cerrar ronda y firmar" onPress={close} style={st.mt8} disabled={p.done === 0} />
        }
      />
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { padding: 16, paddingBottom: 40 },
  flex: { flex: 1 },
  h1: { fontSize: 24, fontWeight: "800", color: C.ink },
  sub: { fontSize: 14, color: C.muted, marginTop: 2, marginBottom: 12 },
  areaCard: { marginBottom: 12 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  areaName: { fontSize: 19, fontWeight: "800", color: C.ink, flexShrink: 1, marginRight: 8 },
  areaMeta: { fontSize: 13, color: C.muted, marginTop: 4 },
  progressRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  progressText: { marginLeft: 10, fontWeight: "700", color: C.inkSoft },
  badText: { marginTop: 8, color: C.bad, fontWeight: "700" },
  mb12: { marginBottom: 12 },
  mt8: { marginTop: 8 },
  closedCard: { marginTop: 12, backgroundColor: C.goodBg, borderColor: C.goodBg },
  closedTitle: { fontWeight: "800", color: C.good, fontSize: 16 },
  closedSub: { color: C.inkSoft, marginTop: 2 },
  eqCard: { marginBottom: 10, paddingVertical: 12 },
  eqDone: { opacity: 0.85 },
  tag: { fontFamily: "monospace", fontWeight: "700", color: C.inkSoft, fontSize: 13 },
  badges: { flexDirection: "row" },
  w6: { width: 6 },
  eqName: { fontSize: 16, fontWeight: "700", color: C.ink, marginTop: 6 },
  eqMeta: { fontSize: 13, color: C.muted, marginTop: 2 },
});

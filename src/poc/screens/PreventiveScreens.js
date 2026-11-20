import React from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { AREAS, SITE, findArea } from "../../data/tepeagua";
import { areaProgress, equipmentStatus, roundIdFor } from "../../store/poc";
import { Badge, Button, Card, C, ProgressBar, PhotoCard, fmtLongDate, fmtTime } from "../ui";
import { areaPhoto, equipmentPhoto } from "../images";
import { sharePdf } from "../report";

const areaStatus = (round, p) =>
  round?.closedAt
    ? { label: `✓ Cerrada ${fmtTime(round.closedAt)}`, tone: "good" }
    : p.done > 0 || round
    ? { label: "En curso", tone: "warn" }
    : { label: "Pendiente", tone: "light" };

export function PreventiveScreen({ navigation }) {
  const state = useSelector((s) => s);
  const totals = AREAS.reduce(
    (acc, a) => {
      const p = areaProgress(state, a, roundIdFor(a.id));
      return { done: acc.done + p.done, total: acc.total + p.total };
    },
    { done: 0, total: 0 },
  );
  return (
    <ScrollView style={st.screen} contentContainerStyle={st.body}>
      <View style={st.intro}>
        <View style={st.flex}>
          <Text style={st.kicker}>{SITE.name}</Text>
          <Text style={st.h1}>Mantenimiento preventivo</Text>
          <Text style={st.sub}>{fmtLongDate(Date.now())} · Inspección diaria de bandas</Text>
        </View>
        <View style={st.ring}>
          <Text style={st.ringValue}>{totals.done}</Text>
          <Text style={st.ringLabel}>de {totals.total}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => navigation.navigate("Scanner")}
        style={({ pressed }) => [st.scan, pressed && st.pressed]}
        accessibilityRole="button"
      >
        <View style={st.scanIcon}>
          <Text style={st.scanIconText}>▣</Text>
        </View>
        <View style={st.flex}>
          <Text style={st.scanTitle}>Escanear QR del equipo</Text>
          <Text style={st.scanSub}>Abre directo el checklist del equipo</Text>
        </View>
        <Text style={st.chev}>›</Text>
      </Pressable>

      {AREAS.map((area) => {
        const roundId = roundIdFor(area.id);
        const round = state.rounds[roundId];
        const p = areaProgress(state, area, roundId);
        const status = areaStatus(round, p);
        return (
          <PhotoCard
            key={area.id}
            source={areaPhoto(area.id)}
            height={190}
            style={st.areaCard}
            onPress={() => navigation.navigate("Area", { areaId: area.id })}
            top={
              <>
                <Badge label={area.id} tone="dark" />
                <Badge label={status.label} tone={status.tone} />
              </>
            }
          >
            <Text style={st.areaName}>{area.name}</Text>
            <Text style={st.areaMeta}>
              {area.equipment.length} equipos · {p.totalPoints} puntos
              {p.bad > 0 ? `  ·  ${p.bad} ${p.bad === 1 ? "punto" : "puntos"} en Malo` : ""}
            </Text>
            <View style={st.progressRow}>
              <View style={st.flex}>
                <ProgressBar value={p.done} total={p.total} tone={round?.closedAt ? C.green : C.sky} />
              </View>
              <Text style={st.progressText}>
                {p.done}/{p.total}
              </Text>
            </View>
          </PhotoCard>
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
        numColumns={2}
        columnWrapperStyle={st.gridRow}
        contentContainerStyle={st.gridBody}
        ListHeaderComponent={
          <View>
            <PhotoCard source={areaPhoto(areaId)} height={150} radius={0} style={st.hero}>
              <Text style={st.heroKicker}>
                {area.id} · {area.equipment.length} equipos
              </Text>
              <Text style={st.heroTitle}>{area.name}</Text>
              <View style={st.progressRow}>
                <View style={st.flex}>
                  <ProgressBar value={p.done} total={p.total} tone={closed ? C.green : C.sky} />
                </View>
                <Text style={st.progressText}>
                  {p.done}/{p.total} equipos
                </Text>
              </View>
            </PhotoCard>
            {closed ? (
              <Card style={st.closedCard}>
                <Text style={st.closedTitle}>Ronda cerrada a las {fmtTime(round.closedAt)}</Text>
                <Text style={st.closedSub}>Firmada por {round.technician}</Text>
                {round.pdfPath ? (
                  <Button
                    title="Compartir hoja VOSOA (PDF)"
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
          let badge = { label: "Pendiente", tone: "light" };
          if (s.done && s.bad) badge = { label: `${s.bad} Malo`, tone: "bad" };
          else if (s.done) badge = { label: "✓ Bueno", tone: "good" };
          else if (s.started) badge = { label: `${s.answered}/${s.total}`, tone: "warn" };
          return (
            <View style={st.gridCell}>
              <PhotoCard
                source={equipmentPhoto(e)}
                height={176}
                radius={14}
                onPress={() => navigation.navigate("Checklist", { areaId, equipmentId: e.id })}
                top={
                  <>
                    <Badge label={`Crit. ${e.criticality}`} tone={e.criticality === "A" ? "bad" : "warn"} />
                    <Badge label={badge.label} tone={badge.tone} />
                  </>
                }
              >
                <Text style={st.tag}>{e.tag}</Text>
                <Text style={st.eqName} numberOfLines={2}>
                  {e.name}
                </Text>
                <Text style={st.eqMeta}>{e.items.length} puntos</Text>
              </PhotoCard>
            </View>
          );
        }}
        ListFooterComponent={
          closed ? null : (
            <View style={st.footer}>
              <Button title="Cerrar ronda y firmar" onPress={close} disabled={p.done === 0} />
            </View>
          )
        }
      />
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { padding: 16, paddingBottom: 40 },
  flex: { flex: 1 },
  pressed: { opacity: 0.8 },
  intro: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  kicker: { color: C.accent, fontWeight: "800", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  h1: { fontSize: 24, fontWeight: "800", color: C.navy, marginTop: 2 },
  sub: { fontSize: 13, color: C.muted, marginTop: 2 },
  ring: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 6,
    borderColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    backgroundColor: "#fff",
  },
  ringValue: { fontSize: 22, fontWeight: "800", color: C.navy, lineHeight: 24 },
  ringLabel: { fontSize: 11, color: C.muted, fontWeight: "700" },
  scan: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.navy,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  scanIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: C.sky,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  scanIconText: { color: "#fff", fontSize: 24, fontWeight: "800" },
  scanTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  scanSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 1 },
  chev: { color: C.sky, fontSize: 32, fontWeight: "300", marginLeft: 8 },
  areaCard: { marginBottom: 14 },
  areaName: { fontSize: 24, fontWeight: "800", color: "#fff" },
  areaMeta: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  progressRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  progressText: { marginLeft: 10, fontWeight: "800", color: "#fff" },
  gridBody: { paddingBottom: 40 },
  gridRow: { paddingHorizontal: 12, gap: 10 },
  gridCell: { flex: 1, marginBottom: 10 },
  hero: { marginBottom: 12 },
  heroKicker: { color: "#9BE3FF", fontWeight: "800", fontSize: 12, letterSpacing: 0.6 },
  heroTitle: { color: "#fff", fontSize: 26, fontWeight: "800" },
  mt8: { marginTop: 8 },
  closedCard: { marginHorizontal: 12, marginBottom: 12, backgroundColor: C.goodBg },
  closedTitle: { fontWeight: "800", color: C.good, fontSize: 16 },
  closedSub: { color: C.inkSoft, marginTop: 2 },
  tag: { fontWeight: "800", color: "#9BE3FF", fontSize: 12, letterSpacing: 0.4 },
  eqName: { fontSize: 15, fontWeight: "800", color: "#fff", marginTop: 2, lineHeight: 19 },
  eqMeta: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  footer: { paddingHorizontal: 12, marginTop: 6 },
});

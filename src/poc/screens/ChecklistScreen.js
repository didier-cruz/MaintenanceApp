import React, { useLayoutEffect, useMemo, useRef } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { findEquipment } from "../../data/tepeagua";
import { inspectionKey, roundIdFor } from "../../store/poc";
import { Badge, Button, C, PhotoCard, ProgressBar } from "../ui";
import { equipmentPhoto } from "../images";
import PhotoGallery from "../PhotoGallery";
import { photosOf } from "../photos";

const OUTCOMES = [
  { key: "good", label: "Bueno", color: C.good, bg: C.goodBg },
  { key: "bad", label: "Malo", color: C.bad, bg: C.badBg },
  { key: "na", label: "N/A", color: C.na, bg: C.naBg },
];

export default function ChecklistScreen({ route, navigation }) {
  const { areaId, equipmentId } = route.params;
  const { equipment, area } = findEquipment(equipmentId);
  const roundId = roundIdFor(areaId);
  const dispatch = useDispatch();
  const round = useSelector((s) => s.rounds[roundId]);
  const insp = useSelector((s) => s.inspections[inspectionKey(roundId, equipmentId)]);
  const results = useMemo(() => insp?.results ?? {}, [insp]);
  const locked = Boolean(round?.closedAt);
  const listRef = useRef(null);

  const set = (itemId, patch) =>
    dispatch({ type: "SET_RESULT", areaId, roundId, equipmentId, itemId, patch, at: Date.now() });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: equipment.tag,
      headerRight: locked
        ? undefined
        : () => (
            <Pressable
              hitSlop={10}
              style={st.headerBtn}
              onPress={() => dispatch({ type: "SET_ALL_GOOD", areaId, roundId, equipmentId, at: Date.now() })}
            >
              <Text style={st.headerBtnText}>Resto Bueno</Text>
            </Pressable>
          ),
    });
  }, [navigation, equipment.tag, locked, dispatch, areaId, roundId, equipmentId]);

  const answered = equipment.items.filter((i) => results[i.id]?.outcome).length;
  const missingNotes = equipment.items.filter((i) => results[i.id]?.outcome === "bad" && !results[i.id]?.note?.trim());

  const finish = () => {
    if (answered < equipment.items.length) {
      const idx = equipment.items.findIndex((i) => !results[i.id]?.outcome);
      listRef.current?.scrollToIndex({ index: idx, viewPosition: 0.2 });
      Alert.alert("Faltan puntos", `Faltan ${equipment.items.length - answered} punto(s) por revisar.`);
      return;
    }
    if (missingNotes.length) {
      const idx = equipment.items.indexOf(missingNotes[0]);
      listRef.current?.scrollToIndex({ index: idx, viewPosition: 0.2 });
      Alert.alert("Describa la falla", "Cada punto en Malo necesita una descripción.");
      return;
    }
    dispatch({ type: "COMPLETE_EQUIPMENT", areaId, roundId, equipmentId, at: Date.now() });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={st.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <FlatList
        ref={listRef}
        data={equipment.items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={st.body}
        keyboardShouldPersistTaps="handled"
        onScrollToIndexFailed={() => {}}
        ListHeaderComponent={
          <PhotoCard
            source={equipmentPhoto(equipment)}
            height={200}
            radius={0}
            style={st.hero}
            top={
              <>
                <Badge label={area.name} tone="dark" />
                <Badge
                  label={`Criticidad ${equipment.criticality}`}
                  tone={equipment.criticality === "A" ? "bad" : "warn"}
                />
              </>
            }
          >
            <Text style={st.heroTag}>
              {equipment.tag} · Activo {equipment.asset}
            </Text>
            <Text style={st.eqName}>{equipment.name}</Text>
            <View style={st.progressRow}>
              <View style={st.flex}>
                <ProgressBar value={answered} total={equipment.items.length} tone={C.sky} />
              </View>
              <Text style={st.counter}>
                {answered}/{equipment.items.length} puntos
              </Text>
            </View>
          </PhotoCard>
        }
        renderItem={({ item }) => {
          const r = results[item.id] ?? {};
          return (
            <View style={[st.item, st.itemPad, r.outcome === "bad" && st.itemBad, r.outcome === "good" && st.itemGood]}>
              <View style={st.row}>
                <Text style={st.n}>{item.n}</Text>
                <Text style={st.text}>{item.text}</Text>
              </View>
              <View style={st.choices}>
                {OUTCOMES.filter((o) => o.key !== "na" || item.allowsNA).map((o) => {
                  const on = r.outcome === o.key;
                  return (
                    <Pressable
                      key={o.key}
                      disabled={locked}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      onPress={() => set(item.id, { outcome: o.key })}
                      style={[st.choice, { borderColor: on ? o.color : C.line, backgroundColor: on ? o.bg : "#fff" }]}
                    >
                      <Text style={[st.choiceText, { color: on ? o.color : C.inkSoft }]}>{o.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {r.outcome === "bad" ? (
                <TextInput
                  editable={!locked}
                  value={r.note ?? ""}
                  onChangeText={(note) => set(item.id, { note })}
                  placeholder="Describa la falla (obligatorio)"
                  placeholderTextColor={C.muted}
                  multiline
                  style={[st.note, !r.note?.trim() && st.noteMissing]}
                />
              ) : null}
              <PhotoGallery
                photos={photosOf(r)}
                locked={locked}
                onChange={(photos) => set(item.id, { photos, photo: undefined })}
              />
            </View>
          );
        }}
        ListFooterComponent={
          <View style={st.itemPad}>
            <Text style={st.label}>Comentarios del equipo</Text>
            <TextInput
              editable={!locked}
              value={insp?.comment ?? ""}
              onChangeText={(comment) => dispatch({ type: "SET_EQUIPMENT_COMMENT", roundId, equipmentId, comment })}
              placeholder="Opcional"
              placeholderTextColor={C.muted}
              multiline
              style={st.comment}
            />
            {locked ? null : <Button title="Terminar equipo" onPress={finish} style={st.mt16} />}
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingBottom: 48 },
  flex: { flex: 1 },
  hero: { marginBottom: 14 },
  heroTag: { color: "#9BE3FF", fontWeight: "800", fontSize: 13, letterSpacing: 0.4 },
  eqName: { fontSize: 24, fontWeight: "800", color: "#fff", marginTop: 2 },
  progressRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  counter: { marginLeft: 10, color: "#fff", fontWeight: "800" },
  itemPad: { marginHorizontal: 14 },
  itemGood: { borderLeftColor: C.good },
  item: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderLeftWidth: 5,
    borderLeftColor: C.line,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#0B1E33",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemBad: { borderLeftColor: C.bad },
  n: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.bg,
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "800",
    color: C.navy,
    fontSize: 13,
    marginRight: 8,
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  text: { flex: 1, fontSize: 16, color: C.ink, lineHeight: 22 },
  choices: { flexDirection: "row", marginTop: 12, gap: 8 },
  choice: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceText: { fontSize: 16, fontWeight: "800" },
  note: {
    marginTop: 12,
    minHeight: 64,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    color: C.ink,
    textAlignVertical: "top",
  },
  noteMissing: { borderColor: C.bad },
  label: { fontSize: 14, fontWeight: "700", color: C.inkSoft, marginTop: 8, marginBottom: 6 },
  comment: {
    minHeight: 70,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    color: C.ink,
    textAlignVertical: "top",
  },
  mt16: { marginTop: 16 },
  headerBtn: { paddingHorizontal: 14 },
  headerBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

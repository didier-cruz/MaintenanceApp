import React, { useLayoutEffect, useMemo, useRef } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { launchCamera } from "react-native-image-picker";
import { findEquipment } from "../../data/tepeagua";
import { inspectionKey, roundIdFor } from "../../store/poc";
import { Button, C, CritBadge } from "../ui";

const OUTCOMES = [
  { key: "good", label: "Bueno", color: C.good, bg: C.goodBg },
  { key: "bad", label: "Malo", color: C.bad, bg: C.badBg },
  { key: "na", label: "N/A", color: C.na, bg: C.naBg },
];

export default function ChecklistScreen({ route, navigation }) {
  const { areaId, equipmentId } = route.params;
  const { equipment } = findEquipment(equipmentId);
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

  const takePhoto = async (itemId) => {
    try {
      const res = await launchCamera({
        mediaType: "photo",
        includeBase64: true,
        maxWidth: 900,
        maxHeight: 900,
        quality: 0.6,
        saveToPhotos: false,
      });
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert("Cámara", res.errorMessage || res.errorCode);
        return;
      }
      const a = res.assets?.[0];
      if (a?.base64) {
        set(itemId, { photo: `data:${a.type || "image/jpeg"};base64,${a.base64}` });
      }
    } catch (e) {
      Alert.alert("Cámara", e.message);
    }
  };

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
          <View style={st.header}>
            <Text style={st.eqName}>{equipment.name}</Text>
            <View style={st.row}>
              <CritBadge criticality={equipment.criticality} />
              <Text style={st.meta}>  Activo {equipment.asset}</Text>
            </View>
            <Text style={st.counter}>
              {answered} de {equipment.items.length} puntos
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const r = results[item.id] ?? {};
          return (
            <View style={[st.item, r.outcome === "bad" && st.itemBad]}>
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
                <View style={st.badBox}>
                  <TextInput
                    editable={!locked}
                    value={r.note ?? ""}
                    onChangeText={(note) => set(item.id, { note })}
                    placeholder="Describa la falla (obligatorio)"
                    placeholderTextColor={C.muted}
                    multiline
                    style={[st.note, !r.note?.trim() && st.noteMissing]}
                  />
                  <View style={st.photoRow}>
                    {r.photo ? <Image source={{ uri: r.photo }} style={st.thumb} /> : null}
                    {locked ? null : (
                      <Button
                        small
                        variant="outline"
                        title={r.photo ? "Repetir foto" : "📷  Tomar foto"}
                        onPress={() => takePhoto(item.id)}
                      />
                    )}
                  </View>
                </View>
              ) : null}
            </View>
          );
        }}
        ListFooterComponent={
          <View>
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
  body: { padding: 16, paddingBottom: 48 },
  header: { marginBottom: 12 },
  eqName: { fontSize: 20, fontWeight: "800", color: C.ink, marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  meta: { color: C.muted, fontSize: 14 },
  counter: { marginTop: 8, color: C.inkSoft, fontWeight: "700" },
  item: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
    marginBottom: 10,
  },
  itemBad: { borderColor: C.bad },
  n: { width: 26, fontWeight: "800", color: C.muted, fontSize: 15, alignSelf: "flex-start" },
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
  badBox: { marginTop: 12 },
  note: {
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
  photoRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 10 },
  thumb: { width: 64, height: 64, borderRadius: 8 },
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

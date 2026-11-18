import React, { useState } from "react";
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { findEquipment } from "../../data/tepeagua";
import { Badge, Button, C, Card, CritBadge, fmtDateTime } from "../ui";

export default function CorrectiveScreen() {
  const dispatch = useDispatch();
  const faults = useSelector((s) => s.faults);
  const [tab, setTab] = useState("open");
  const [resolving, setResolving] = useState(null);
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState(null);

  const all = Object.values(faults);
  const open = all.filter((f) => f.status === "open");
  const list = (tab === "open" ? open : all.filter((f) => f.status !== "open")).sort((a, b) =>
    tab === "open"
      ? a.criticality.localeCompare(b.criticality) || b.openedAt - a.openedAt
      : b.resolvedAt - a.resolvedAt,
  );

  const confirm = () => {
    dispatch({ type: "RESOLVE_FAULT", id: resolving.id, note: note.trim(), at: Date.now() });
    setResolving(null);
    setNote("");
  };

  return (
    <View style={st.screen}>
      <View style={st.tabs}>
        <Tab label={`Abiertas (${open.length})`} on={tab === "open"} onPress={() => setTab("open")} />
        <Tab label={`Atendidas (${all.length - open.length})`} on={tab === "done"} onPress={() => setTab("done")} />
      </View>
      <FlatList
        data={list}
        keyExtractor={(f) => f.id}
        contentContainerStyle={st.body}
        ListEmptyComponent={
          <Text style={st.empty}>
            {tab === "open"
              ? "No hay fallas abiertas.\nCada punto marcado en Malo durante la ronda aparece aquí."
              : "Todavía no se ha atendido ninguna falla."}
          </Text>
        }
        renderItem={({ item: f }) => {
          const found = findEquipment(f.equipmentId);
          return (
            <Card style={st.card}>
              <View style={st.rowBetween}>
                <Text style={st.tag}>{f.equipmentId}</Text>
                <View style={st.row}>
                  <CritBadge criticality={f.criticality} />
                  <View style={st.w6} />
                  <Badge label={f.status === "open" ? "Abierta" : "Atendida"} tone={f.status === "open" ? "bad" : "good"} />
                </View>
              </View>
              <Text style={st.eqName}>
                {found?.equipment.name} · {found?.area.name}
              </Text>
              <Text style={st.item}>{f.itemText}</Text>
              <View style={st.row}>
                {f.photo ? (
                  <Pressable onPress={() => setPreview(f.photo)}>
                    <Image source={{ uri: f.photo }} style={st.thumb} />
                  </Pressable>
                ) : null}
                <Text style={st.note}>“{f.note}”</Text>
              </View>
              <Text style={st.meta}>
                Reportada {fmtDateTime(f.openedAt)} por {f.reportedBy}
              </Text>
              {f.status === "open" ? (
                <Button title="Marcar como atendida" variant="dark" small style={st.mt10} onPress={() => {
                    setNote("");
                    setResolving(f);
                  }}
                />
              ) : (
                <Text style={st.resolved}>
                  Atendida {fmtDateTime(f.resolvedAt)}
                  {f.resolution ? ` — ${f.resolution}` : ""}
                </Text>
              )}
            </Card>
          );
        }}
      />

      <Modal visible={Boolean(resolving)} transparent animationType="fade" onRequestClose={() => setResolving(null)}>
        <View style={st.backdrop}>
          <View style={st.dialog}>
            <Text style={st.dialogTitle}>Atender falla</Text>
            <Text style={st.item}>{resolving?.itemText}</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="¿Qué se hizo? (ej. se cambió rodillo)"
              placeholderTextColor={C.muted}
              multiline
              style={st.input}
            />
            <Button title="Confirmar" onPress={confirm} disabled={!note.trim()} style={st.mt10} />
            <Button title="Cancelar" variant="ghost" onPress={() => setResolving(null)} />
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(preview)} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <Pressable style={st.backdrop} onPress={() => setPreview(null)}>
          {preview ? <Image source={{ uri: preview }} style={st.full} resizeMode="contain" /> : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const Tab = ({ label, on, onPress }) => (
  <Pressable onPress={onPress} style={[st.tab, on && st.tabOn]}>
    <Text style={[st.tabText, on && st.tabTextOn]}>{label}</Text>
  </Pressable>
);

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  tabs: { flexDirection: "row", margin: 16, marginBottom: 0, backgroundColor: C.line, borderRadius: 10, padding: 3 },
  tab: { flex: 1, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  tabOn: { backgroundColor: "#fff" },
  tabText: { fontWeight: "700", color: C.muted },
  tabTextOn: { color: C.ink },
  body: { padding: 16, paddingBottom: 40 },
  empty: { textAlign: "center", color: C.muted, marginTop: 48, fontSize: 15, lineHeight: 22 },
  card: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  w6: { width: 6 },
  tag: { fontFamily: "monospace", fontWeight: "700", color: C.inkSoft, fontSize: 13 },
  eqName: { fontSize: 16, fontWeight: "800", color: C.ink, marginTop: 6 },
  item: { fontSize: 15, color: C.inkSoft, marginTop: 4, marginBottom: 8 },
  thumb: { width: 56, height: 56, borderRadius: 8, marginRight: 10 },
  note: { flex: 1, fontStyle: "italic", color: C.bad, fontSize: 15 },
  meta: { color: C.muted, fontSize: 12, marginTop: 8 },
  mt10: { marginTop: 10 },
  resolved: { color: C.good, fontWeight: "700", marginTop: 8 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 20 },
  dialog: { backgroundColor: "#fff", borderRadius: 14, padding: 18 },
  dialogTitle: { fontSize: 20, fontWeight: "800", color: C.ink },
  input: {
    minHeight: 80,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    color: C.ink,
    textAlignVertical: "top",
  },
  full: { width: "100%", height: "80%" },
});

import React, { useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector, useStore } from "react-redux";
import { findArea } from "../../data/tepeagua";
import { areaProgress, roundIdFor } from "../../store/poc";
import { Button, C, Card, fmtTime } from "../ui";
import SignaturePad, { SignaturePreview } from "../SignaturePad";
import { generateVosoaPdf, sharePdf } from "../report";

export default function CloseRoundScreen({ route, navigation }) {
  const { areaId } = route.params;
  const area = findArea(areaId);
  const roundId = roundIdFor(areaId);
  const dispatch = useDispatch();
  const store = useStore();
  const state = useSelector((s) => s);
  const round = state.rounds[roundId];
  const p = areaProgress(state, area, roundId);
  const [comments, setComments] = useState(round?.comments ?? "");
  const [signature, setSignature] = useState(null);
  const [draft, setDraft] = useState(null);
  const [signing, setSigning] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      dispatch({ type: "CLOSE_ROUND", roundId, comments: comments.trim(), signature, at: Date.now() });
      const path = await generateVosoaPdf(store.getState(), roundId);
      dispatch({ type: "SET_ROUND_PDF", roundId, path });
      navigation.goBack();
      await sharePdf(path, `VOSOA ${area.name}`);
    } catch (e) {
      Alert.alert("No se pudo generar el PDF", e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={st.screen} contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={st.area}>{area.name}</Text>
        <Text style={st.meta}>
          Inicio {round ? fmtTime(round.startedAt) : "—"} · Cierre {fmtTime(Date.now())}
        </Text>
        <View style={st.stats}>
          <Stat value={`${p.done}/${p.total}`} label="equipos" />
          <Stat value={p.points} label="puntos" />
          <Stat value={p.bad} label="en Malo" tone={p.bad ? C.bad : C.ink} />
        </View>
      </Card>

      <Text style={st.label}>Comentarios de la ronda</Text>
      <TextInput
        value={comments}
        onChangeText={setComments}
        placeholder="Opcional"
        placeholderTextColor={C.muted}
        multiline
        style={st.input}
      />

      <Text style={st.label}>Persona que realizó VOSOA</Text>
      <Text style={st.tech}>{state.technician?.name}</Text>

      <Text style={st.label}>Firma</Text>
      {signature ? (
        <>
          <SignaturePreview signature={signature} />
          <Button title="Volver a firmar" variant="ghost" small onPress={() => setSigning(true)} style={st.right} />
        </>
      ) : (
        <Button title="✍️  Tocar para firmar" variant="outline" onPress={() => setSigning(true)} style={st.signBtn} />
      )}

      <Modal visible={signing} animationType="slide" onRequestClose={() => setSigning(false)}>
        <SafeAreaView style={st.modal}>
          <Text style={st.modalTitle}>Firma de {state.technician?.name}</Text>
          <Text style={st.modalSub}>Firme dentro del recuadro con el dedo.</Text>
          <SignaturePad onChange={setDraft} height={320} />
          <Button
            title="Usar esta firma"
            disabled={!draft}
            onPress={() => {
              setSignature(draft);
              setSigning(false);
            }}
            style={st.mt16}
          />
          <Button title="Cancelar" variant="ghost" onPress={() => setSigning(false)} />
        </SafeAreaView>
      </Modal>

      <Button
        title="Firmar y generar hoja VOSOA"
        disabled={!signature}
        loading={busy}
        onPress={submit}
        style={st.mt16}
      />
      <Text style={st.hint}>Se genera el PDF con el formato del formulario en papel, listo para compartir.</Text>
    </ScrollView>
  );
}

const Stat = ({ value, label, tone = C.ink }) => (
  <View style={st.stat}>
    <Text style={[st.statValue, { color: tone }]}>{value}</Text>
    <Text style={st.statLabel}>{label}</Text>
  </View>
);

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { padding: 16, paddingBottom: 48 },
  area: { fontSize: 20, fontWeight: "800", color: C.ink },
  meta: { color: C.muted, marginTop: 2 },
  stats: { flexDirection: "row", marginTop: 14 },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: { color: C.muted, fontSize: 13 },
  label: { fontSize: 14, fontWeight: "700", color: C.inkSoft, marginTop: 18, marginBottom: 6 },
  input: {
    minHeight: 80,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    color: C.ink,
    textAlignVertical: "top",
  },
  tech: { fontSize: 18, fontWeight: "700", color: C.ink },
  mt16: { marginTop: 16 },
  right: { alignSelf: "flex-end" },
  signBtn: { minHeight: 90, borderStyle: "dashed" },
  modal: { flex: 1, backgroundColor: C.bg, padding: 20, justifyContent: "center" },
  modalTitle: { fontSize: 22, fontWeight: "800", color: C.ink },
  modalSub: { color: C.muted, marginTop: 4, marginBottom: 16 },
  hint: { color: C.muted, fontSize: 13, textAlign: "center", marginTop: 8 },
});

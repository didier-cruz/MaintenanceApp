import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { SITE, AREAS } from "../../data/tepeagua";
import { Button, Card, C, fmtLongDate, fmtTime, useNow } from "../ui";

export function LoginScreen() {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const ok = name.trim().length >= 3;
  return (
    <SafeAreaView style={st.dark}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={st.flex}>
        <View style={st.loginBody}>
          <Text style={st.brand}>MaintenanceApp</Text>
          <Text style={st.brandSub}>Inspecciones VOSOA sin papel</Text>
          <View style={st.loginCard}>
            <Text style={st.label}>Nombre del técnico</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor={C.muted}
              style={st.input}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={() => ok && dispatch({ type: "SET_TECHNICIAN", name: name.trim() })}
            />
            <Button
              title="Entrar"
              disabled={!ok}
              onPress={() => dispatch({ type: "SET_TECHNICIAN", name: name.trim() })}
              style={st.mt16}
            />
            <Text style={st.footnote}>Prueba de concepto · los datos se guardan solo en este teléfono.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AttendanceScreen() {
  const dispatch = useDispatch();
  const technician = useSelector((s) => s.technician);
  const attendance = useSelector((s) => s.attendance);
  const now = useNow();
  const [firstVisit, setFirstVisit] = useState(false);
  const last = attendance[attendance.length - 1];
  const equipmentCount = AREAS.reduce((n, a) => n + a.equipment.length, 0);

  return (
    <SafeAreaView style={st.dark} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={st.attBody}>
        <View style={st.row}>
          <Text style={st.hello}>Hola, {technician.name.split(" ")[0]}</Text>
          <Pressable onPress={() => dispatch({ type: "SET_TECHNICIAN", name: null })} hitSlop={10}>
            <Text style={st.change}>Cambiar técnico</Text>
          </Pressable>
        </View>
        <Text style={st.date}>{fmtLongDate(now)}</Text>

        <View style={st.clock}>
          <Text style={st.clockText}>{fmtTime(now)}</Text>
          <Text style={st.clockSub}>hora de llegada</Text>
        </View>

        <Card style={st.siteCard}>
          <Text style={st.siteCompany}>{SITE.company}</Text>
          <Text style={st.siteName}>{SITE.name}</Text>
          <Text style={st.siteMeta}>
            {AREAS.length} áreas · {equipmentCount} equipos
          </Text>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: firstVisit }}
            onPress={() => setFirstVisit(!firstVisit)}
            style={st.check}
          >
            <View style={[st.box, firstVisit && st.boxOn]}>{firstVisit ? <Text style={st.tick}>✓</Text> : null}</View>
            <Text style={st.checkText}>Primera visita del día</Text>
          </Pressable>
        </Card>

        <Button
          title="Registrar llegada"
          onPress={() => dispatch({ type: "CHECK_IN", at: Date.now(), flag: firstVisit })}
          style={st.mt16}
        />
        <Text style={st.notify}>Se notificará a los administradores.</Text>
        {last ? (
          <Text style={st.lastAtt}>
            Último registro: {last.type === "in" ? "llegada" : "salida"} a las {fmtTime(last.at)}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1 },
  dark: { flex: 1, backgroundColor: C.ink },
  loginBody: { flex: 1, justifyContent: "center", padding: 24 },
  brand: { color: "#fff", fontSize: 34, fontWeight: "800" },
  brandSub: { color: C.accent, fontSize: 17, fontWeight: "600", marginTop: 4, marginBottom: 32 },
  loginCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  label: { fontSize: 14, fontWeight: "700", color: C.inkSoft, marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 18,
    color: C.ink,
  },
  mt16: { marginTop: 16 },
  footnote: { marginTop: 16, color: C.muted, fontSize: 13, textAlign: "center" },
  attBody: { padding: 24, paddingBottom: 40 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hello: { color: "#fff", fontSize: 26, fontWeight: "800" },
  change: { color: C.accent, fontSize: 14, fontWeight: "600" },
  date: { color: C.muted, fontSize: 16, marginTop: 2 },
  clock: {
    alignSelf: "center",
    marginVertical: 28,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  clockText: { color: "#fff", fontSize: 36, fontWeight: "800" },
  clockSub: { color: C.muted, fontSize: 14, marginTop: 4 },
  siteCard: { padding: 18 },
  siteCompany: { color: C.muted, fontSize: 13, fontWeight: "700", textTransform: "uppercase" },
  siteName: { color: C.ink, fontSize: 22, fontWeight: "800", marginTop: 2 },
  siteMeta: { color: C.inkSoft, fontSize: 15, marginTop: 4 },
  check: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  box: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.ink,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: C.ink },
  tick: { color: "#fff", fontWeight: "800" },
  checkText: { fontSize: 16, color: C.ink, fontWeight: "600" },
  notify: { color: C.muted, textAlign: "center", marginTop: 12, fontSize: 14 },
  lastAtt: { color: C.muted, textAlign: "center", marginTop: 6, fontSize: 13 },
});

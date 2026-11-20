import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { SITE, AREAS } from "../../data/tepeagua";
import { Button, C, PhotoBackground, Shade, fmtLongDate, fmtTime, useNow } from "../ui";
import HolcimLogo from "../HolcimLogo";
import { HERO, areaPhoto } from "../images";

export function LoginScreen() {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const ok = name.trim().length >= 3;
  const enter = () => ok && dispatch({ type: "SET_TECHNICIAN", name: name.trim() });
  return (
    <PhotoBackground source={HERO} style={st.flex}>
      <Shade from={0.35} to={0.95} />
      <SafeAreaView style={st.flex}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={st.flex}>
          <View style={st.loginBody}>
            <Text style={st.heroKicker}>Mantenimiento de plantas</Text>
            <Text style={st.heroTitle}>Inspección VOSOA{"\n"}sin papel</Text>
            <View style={st.loginCard}>
              <View style={st.logoRow}>
                <HolcimLogo width={150} />
              </View>
              <Text style={st.label}>Nombre del técnico</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ej. Juan Pérez"
                placeholderTextColor={C.muted}
                style={st.input}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={enter}
              />
              <Button title="Entrar" disabled={!ok} onPress={enter} style={st.mt16} />
              <Text style={st.footnote}>Prueba de concepto · los datos se guardan solo en este teléfono.</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PhotoBackground>
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
    <View style={st.screen}>
      <ScrollView contentContainerStyle={st.attScroll}>
        <PhotoBackground source={HERO} style={st.attHero}>
          <Shade from={0.45} to={0.95} />
          <SafeAreaView edges={["top"]} style={st.attHeroInner}>
            <View style={st.rowBetween}>
              <HolcimLogo width={120} variant="white" />
              <Pressable onPress={() => dispatch({ type: "SET_TECHNICIAN", name: null })} hitSlop={10}>
                <Text style={st.change}>Cambiar técnico</Text>
              </Pressable>
            </View>
            <Text style={st.hello}>Hola, {technician?.name.split(" ")[0] ?? ""}</Text>
            <Text style={st.date}>{fmtLongDate(now)}</Text>
            <View style={st.clock}>
              <Text style={st.clockText}>{fmtTime(now)}</Text>
              <Text style={st.clockSub}>hora de llegada</Text>
            </View>
          </SafeAreaView>
        </PhotoBackground>

        <View style={st.attBody}>
          <Text style={st.sectionLabel}>Elija el plantel para marcar asistencia</Text>
          <View style={st.siteCard}>
            <View style={st.siteStrip}>
              {AREAS.map((a) => (
                <PhotoBackground key={a.id} source={areaPhoto(a.id)} style={st.stripImg}>
                  <Shade from={0} to={0.75} />
                  <Text style={st.stripText}>{a.name.replace("Trituradora ", "")}</Text>
                </PhotoBackground>
              ))}
            </View>
            <View style={st.sitePad}>
              <Text style={st.siteCompany}>{SITE.company}</Text>
              <Text style={st.siteName}>{SITE.name}</Text>
              <Text style={st.siteMeta}>
                {AREAS.length} trituradoras · {equipmentCount} equipos
              </Text>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: firstVisit }}
                onPress={() => setFirstVisit(!firstVisit)}
                style={st.check}
              >
                <View style={[st.box, firstVisit && st.boxOn]}>
                  {firstVisit ? <Text style={st.tick}>✓</Text> : null}
                </View>
                <Text style={st.checkText}>Primera visita del día</Text>
              </Pressable>
            </View>
          </View>

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
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: C.bg },
  loginBody: { flex: 1, justifyContent: "flex-end", padding: 20, paddingBottom: 28 },
  heroKicker: { color: C.sky, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase", fontSize: 13 },
  heroTitle: { color: "#fff", fontSize: 34, fontWeight: "800", lineHeight: 40, marginTop: 4, marginBottom: 20 },
  loginCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20 },
  logoRow: { alignItems: "center", marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "700", color: C.inkSoft, marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 18,
    color: C.ink,
    backgroundColor: "#F7F9FB",
  },
  mt16: { marginTop: 16 },
  footnote: { marginTop: 14, color: C.muted, fontSize: 12, textAlign: "center" },
  attScroll: { paddingBottom: 40 },
  attHero: { height: 400 },
  attHeroInner: { padding: 20 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  change: { color: "#fff", fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
  hello: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 22 },
  date: { color: "rgba(255,255,255,0.8)", fontSize: 16, marginTop: 2 },
  clock: {
    alignSelf: "center",
    marginTop: 18,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    borderColor: C.sky,
    backgroundColor: "rgba(18,48,79,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  clockText: { color: "#fff", fontSize: 27, fontWeight: "800" },
  clockSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 },
  attBody: { padding: 16 },
  sectionLabel: { color: C.navy, fontWeight: "800", fontSize: 15, marginBottom: 10 },
  siteCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: C.sky,
  },
  siteStrip: { flexDirection: "row", height: 96 },
  stripImg: { flex: 1, justifyContent: "flex-end" },
  stripText: { color: "#fff", fontWeight: "800", fontSize: 12, padding: 6 },
  sitePad: { padding: 16 },
  siteCompany: { color: C.accent, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  siteName: { color: C.navy, fontSize: 22, fontWeight: "800", marginTop: 2 },
  siteMeta: { color: C.inkSoft, fontSize: 15, marginTop: 2 },
  check: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  box: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.navy,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: C.navy },
  tick: { color: "#fff", fontWeight: "800" },
  checkText: { fontSize: 16, color: C.ink, fontWeight: "600" },
  notify: { color: C.muted, textAlign: "center", marginTop: 12, fontSize: 14 },
  lastAtt: { color: C.muted, textAlign: "center", marginTop: 6, fontSize: 13 },
});

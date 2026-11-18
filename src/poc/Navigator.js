import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useDispatch, useSelector } from "react-redux";
import { AREAS, findArea } from "../data/tepeagua";
import { areaProgress, roundIdFor } from "../store/poc";
import { Button, C, fmtTime, useNow } from "./ui";
import { LoginScreen, AttendanceScreen } from "./screens/StartScreens";
import { PreventiveScreen, AreaScreen } from "./screens/PreventiveScreens";
import ChecklistScreen from "./screens/ChecklistScreen";
import CloseRoundScreen from "./screens/CloseRoundScreen";
import CorrectiveScreen from "./screens/CorrectiveScreen";
import ReportsScreen from "./screens/ReportsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const header = {
  headerStyle: { backgroundColor: C.ink },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "800" },
};

function ExitButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={st.exitBtn} hitSlop={8}>
        <Text style={st.exitText}>Salida</Text>
      </Pressable>
      {open ? <ExitDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function ExitDialog({ onClose }) {
  const dispatch = useDispatch();
  const state = useSelector((s) => s);
  const now = useNow();
  const [lastVisit, setLastVisit] = useState(false);
  const pending = AREAS.filter((a) => {
    const round = state.rounds[roundIdFor(a.id)];
    return round && !round.closedAt && areaProgress(state, a, round.id).done > 0;
  });
  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={st.backdrop}>
        <View style={st.dialog}>
          <Text style={st.title}>Registrar salida</Text>
          <Text style={st.time}>{fmtTime(now)}</Text>
          {pending.length ? (
            <Text style={st.warn}>
              Ronda sin cerrar: {pending.map((a) => a.name).join(", ")}. Puede retomarla al volver.
            </Text>
          ) : null}
          <Pressable style={st.check} onPress={() => setLastVisit(!lastVisit)}>
            <View style={[st.box, lastVisit && st.boxOn]}>{lastVisit ? <Text style={st.tick}>✓</Text> : null}</View>
            <Text style={st.checkText}>Última visita del día</Text>
          </Pressable>
          <Text style={st.notify}>Se notificará a los administradores.</Text>
          <Button
            title="Confirmar salida"
            onPress={() => {
              onClose();
              dispatch({ type: "CHECK_OUT", at: Date.now(), flag: lastVisit });
            }}
          />
          <Button title="Cancelar" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const renderExit = () => <ExitButton />;

const tabIcon =
  (name, Lib) =>
  ({ color, size }) =>
    <Lib name={name} color={color} size={size} />;

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...header,
        headerRight: renderExit,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: "#9A9596",
        tabBarStyle: { backgroundColor: C.ink, borderTopColor: C.ink },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
      }}
    >
      <Tab.Screen
        name="Preventive"
        component={PreventiveScreen}
        options={{ title: "Preventivo", tabBarIcon: tabIcon("check-square-o", FontAwesome) }}
      />
      <Tab.Screen
        name="Corrective"
        component={CorrectiveScreen}
        options={{ title: "Correctivo", tabBarIcon: tabIcon("wrench", FontAwesome), tabBarBadge: undefined }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: "Informes", tabBarIcon: tabIcon("pie-chart", MaterialIcons) }}
      />
    </Tab.Navigator>
  );
}

export default function Navigator() {
  const technician = useSelector((s) => s.technician);
  const onSite = useSelector((s) => s.onSite);
  return (
    <Stack.Navigator screenOptions={header}>
      {!technician ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : !onSite ? (
        <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="Area"
            component={AreaScreen}
            options={({ route }) => ({ title: findArea(route.params.areaId).name })}
          />
          <Stack.Screen name="Checklist" component={ChecklistScreen} />
          <Stack.Screen name="CloseRound" component={CloseRoundScreen} options={{ title: "Cerrar ronda" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const st = StyleSheet.create({
  exitBtn: {
    marginRight: 12,
    backgroundColor: C.accent,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  exitText: { color: "#fff", fontWeight: "800" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 20 },
  dialog: { backgroundColor: "#fff", borderRadius: 14, padding: 20 },
  title: { fontSize: 22, fontWeight: "800", color: C.ink },
  time: { fontSize: 40, fontWeight: "800", color: C.accent, textAlign: "center", marginVertical: 16 },
  warn: { backgroundColor: C.warnBg, color: C.warn, padding: 10, borderRadius: 8, marginBottom: 12 },
  check: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
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
  checkText: { fontSize: 16, fontWeight: "600", color: C.ink },
  notify: { color: C.muted, textAlign: "center", marginBottom: 12 },
});

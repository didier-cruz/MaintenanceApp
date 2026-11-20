import React, { useEffect, useRef, useState } from "react";
import { Alert, Linking, PermissionsAndroid, Platform, StyleSheet, Text, View } from "react-native";
import { Camera, CameraType } from "react-native-camera-kit";
import { useIsFocused } from "@react-navigation/native";
import { Button, C } from "../ui";
import { parseQr } from "../qr";

async function ensureCameraPermission() {
  if (Platform.OS !== "android") {
    return true; // iOS pide el permiso al abrir la cámara (NSCameraUsageDescription).
  }
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: "Permiso de cámara",
    message: "La cámara se usa para leer el código QR de cada equipo.",
    buttonPositive: "Permitir",
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export default function ScannerScreen({ navigation }) {
  const focused = useIsFocused();
  const [allowed, setAllowed] = useState(null);
  const handled = useRef(false);

  useEffect(() => {
    ensureCameraPermission().then(setAllowed);
  }, []);

  const onReadCode = (event) => {
    if (handled.current) {
      return;
    }
    handled.current = true;
    const text = event.nativeEvent.codeStringValue;
    const found = parseQr(text);
    if (!found) {
      Alert.alert("Código no reconocido", `"${text}" no corresponde a ningún equipo de la planta.`, [
        { text: "Escanear otro", onPress: () => (handled.current = false) },
      ]);
      return;
    }
    navigation.replace("Checklist", { areaId: found.area.id, equipmentId: found.equipment.id });
  };

  if (allowed === false) {
    return (
      <View style={st.center}>
        <Text style={st.msg}>Sin permiso de cámara no se pueden leer los códigos QR.</Text>
        <Button title="Abrir ajustes" onPress={() => Linking.openSettings()} style={st.mt16} />
      </View>
    );
  }

  return (
    <View style={st.screen}>
      {allowed && focused ? (
        <Camera
          style={StyleSheet.absoluteFill}
          cameraType={CameraType.Back}
          scanBarcode
          onReadCode={onReadCode}
          showFrame
          laserColor={C.accent}
          frameColor="#fff"
        />
      ) : null}
      <View style={st.hint} pointerEvents="none">
        <Text style={st.hintText}>Apunte al código QR pegado en el equipo</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, backgroundColor: C.bg, justifyContent: "center", padding: 24 },
  msg: { fontSize: 16, color: C.ink, textAlign: "center" },
  mt16: { marginTop: 16 },
  hint: { position: "absolute", left: 0, right: 0, bottom: 48, alignItems: "center" },
  hintText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
});

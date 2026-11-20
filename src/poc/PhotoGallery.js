import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { C, Button } from "./ui";
import { MAX_PHOTOS_PER_ITEM, savePhoto, usePhoto } from "./photos";

const PICK = { mediaType: "photo", includeBase64: true, maxWidth: 1280, maxHeight: 1280, quality: 0.6 };

/** Miniatura que carga la foto guardada por id. */
export function PhotoThumb({ id, size = 64, onPress, style }) {
  const uri = usePhoto(id);
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[st.thumb, { width: size, height: size }, style]}>
      {uri ? <Image source={{ uri }} style={st.fill} /> : <ActivityIndicator color={C.accent} />}
    </Pressable>
  );
}

function Viewer({ id, onClose, onDelete }) {
  const uri = usePhoto(id);
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={st.backdrop}>
        <Pressable style={st.flex} onPress={onClose}>
          {uri ? <Image source={{ uri }} style={st.full} resizeMode="contain" /> : null}
        </Pressable>
        <View style={st.viewerBar}>
          {onDelete ? <Button title="Eliminar foto" variant="danger" onPress={onDelete} style={st.viewerBtn} /> : null}
          <Button title="Cerrar" variant="sky" onPress={onClose} style={st.viewerBtn} />
        </View>
      </View>
    </Modal>
  );
}

/**
 * Galería de evidencia de un punto: hasta 6 fotos, desde la cámara o la galería.
 * `photos` es la lista de ids; `onChange(ids)` recibe la lista nueva.
 */
export default function PhotoGallery({ photos = [], onChange, locked }) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);
  const left = MAX_PHOTOS_PER_ITEM - photos.length;

  const add = async (source) => {
    try {
      const res =
        source === "camera"
          ? await launchCamera({ ...PICK, saveToPhotos: false })
          : await launchImageLibrary({ ...PICK, selectionLimit: left });
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert("Fotos", res.errorMessage || res.errorCode);
        return;
      }
      setBusy(true);
      const assets = (res.assets ?? []).filter((a) => a.base64).slice(0, left);
      const ids = [];
      for (const a of assets) {
        ids.push(await savePhoto(`data:${a.type || "image/jpeg"};base64,${a.base64}`));
      }
      if (ids.length) onChange([...photos, ...ids]);
    } catch (e) {
      Alert.alert("Fotos", e.message);
    } finally {
      setBusy(false);
    }
  };

  const ask = () =>
    Alert.alert("Agregar foto", `Puede agregar ${left} foto(s) más a este punto.`, [
      { text: "Cámara", onPress: () => add("camera") },
      { text: "Galería", onPress: () => add("library") },
      { text: "Cancelar", style: "cancel" },
    ]);

  if (locked && photos.length === 0) return null;

  return (
    <View style={st.wrap}>
      <View style={st.row}>
        {photos.map((id) => (
          <PhotoThumb key={id} id={id} onPress={() => setOpen(id)} />
        ))}
        {!locked && left > 0 ? (
          <Pressable onPress={ask} disabled={busy} style={({ pressed }) => [st.add, pressed && st.pressed]}>
            {busy ? (
              <ActivityIndicator color={C.accent} />
            ) : (
              <>
                <Text style={st.addIcon}>＋</Text>
                <Text style={st.addText}>Foto</Text>
              </>
            )}
          </Pressable>
        ) : null}
      </View>
      <Text style={st.count}>
        📷 {photos.length}/{MAX_PHOTOS_PER_ITEM} fotos
      </Text>
      {open ? (
        <Viewer
          id={open}
          onClose={() => setOpen(null)}
          onDelete={
            locked
              ? null
              : () => {
                  onChange(photos.filter((p) => p !== open));
                  setOpen(null);
                }
          }
        />
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  flex: { flex: 1, justifyContent: "center" },
  wrap: { marginTop: 10 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumb: { borderRadius: 10, overflow: "hidden", backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  fill: { width: "100%", height: "100%" },
  add: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: C.accent,
    backgroundColor: "#EAF7FD",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.7 },
  addIcon: { color: C.accent, fontSize: 22, fontWeight: "800", lineHeight: 24 },
  addText: { color: C.accent, fontSize: 12, fontWeight: "700" },
  count: { color: C.muted, fontSize: 12, marginTop: 6 },
  backdrop: { flex: 1, backgroundColor: "rgba(8,20,36,0.95)", padding: 16 },
  full: { width: "100%", height: "100%" },
  viewerBar: { flexDirection: "row", gap: 10, paddingBottom: 24 },
  viewerBtn: { flex: 1 },
});

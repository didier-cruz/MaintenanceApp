import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/*
 * Evidencia fotográfica. Cada foto se guarda en su propia llave (data URI JPEG) y el
 * estado de la app solo guarda su id: así el estado no crece con las imágenes y
 * se puede leer completo aunque haya cientos de fotos.
 */
export const MAX_PHOTOS_PER_ITEM = 6;
const PREFIX = "maintenanceapp.photo.";
const cache = new Map();

const newId = () => `ph_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** Guarda una foto y devuelve su id. */
export async function savePhoto(dataUri) {
  const id = newId();
  cache.set(id, dataUri);
  await AsyncStorage.setItem(PREFIX + id, dataUri);
  return id;
}

/** Devuelve el data URI de una foto (o el valor tal cual si ya es un data URI). */
export async function loadPhoto(id) {
  if (!id) return null;
  if (id.startsWith("data:")) return id;
  if (cache.has(id)) return cache.get(id);
  const v = await AsyncStorage.getItem(PREFIX + id);
  if (v) cache.set(id, v);
  return v;
}

/** Carga varias fotos: { id: dataUri }. */
export async function loadPhotos(ids) {
  const out = {};
  const missing = [];
  for (const id of ids) {
    if (id.startsWith("data:")) out[id] = id;
    else if (cache.has(id)) out[id] = cache.get(id);
    else missing.push(id);
  }
  if (missing.length) {
    const got = await AsyncStorage.getMany(missing.map((id) => PREFIX + id));
    for (const id of missing) {
      const v = got[PREFIX + id];
      if (v) {
        cache.set(id, v);
        out[id] = v;
      }
    }
  }
  return out;
}

export async function removePhoto(id) {
  cache.delete(id);
  await AsyncStorage.removeItem(PREFIX + id);
}

/** Borra todas las fotos (Reiniciar demo). */
export async function clearPhotos() {
  cache.clear();
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
  if (keys.length) await AsyncStorage.removeMany(keys);
}

/** Hook: data URI de una foto para mostrarla en un <Image>. */
export function usePhoto(id) {
  const [uri, setUri] = useState(() => (id?.startsWith("data:") ? id : cache.get(id) ?? null));
  useEffect(() => {
    let alive = true;
    loadPhoto(id).then((v) => alive && setUri(v));
    return () => {
      alive = false;
    };
  }, [id]);
  return uri;
}

/** Ids de fotos de un resultado (acepta el formato anterior con una sola `photo`). */
export const photosOf = (result) => result?.photos ?? (result?.photo ? [result.photo] : []);

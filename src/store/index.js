import { legacy_createStore as createStore } from "redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import pocReducer from "./poc";

const STORAGE_KEY = "maintenanceapp.poc.v1";

export const createAppStore = () => createStore(pocReducer);

const store = createAppStore();

/** Loads the saved state from the device. Resolves even if storage fails. */
export async function hydrateStore() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      store.dispatch({ type: "HYDRATE", state: JSON.parse(raw) });
    }
  } catch (e) {
    console.warn("No se pudo leer el estado guardado", e);
  }
  let timer = null;
  store.subscribe(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState())).catch((e) =>
        console.warn("No se pudo guardar el estado", e),
      );
    }, 300);
  });
}

export default store;

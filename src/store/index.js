import { combineReducers, legacy_createStore as createStore } from "redux";
import accessReducer from "./reducers/access";
import overlayReducer from "./reducers/overlay";

/**
 * Root reducer: one slice per reducer.
 */
const rootReducer = combineReducers({
  access: accessReducer,
  overlay: overlayReducer,
});

export const createAppStore = () => createStore(rootReducer);

export default createAppStore();

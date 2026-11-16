import { TOGGLE_OVERLAY } from "../actions/overlay";

/** Whether the exit-confirmation overlay is visible. */
const initialState = false;

const overlayReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_OVERLAY:
      return !state;
    default:
      return state;
  }
};

export default overlayReducer;

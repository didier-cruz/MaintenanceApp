import { TOGGLE_ACCESS } from "../actions/access";

/** `true` while the user is outside a plantel (must mark attendance first). */
const initialState = true;

const accessReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_ACCESS:
      return !state;
    default:
      return state;
  }
};

export default accessReducer;

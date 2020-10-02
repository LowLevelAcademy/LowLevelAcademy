import { Action, ActionType } from "../actions";
import { combineReducers } from "redux";

import code from "./code";
import output from "./output";
import position from "./position";
import selection from "./selection";

// Create a default reducer for a typical playground.
// Accepts an argument for additional optional reducers.
export const createPlaygroundReducer = (additionalReducers = {}) => {
  return combineReducers(
    Object.assign({}, additionalReducers, {
      code,
      output,
      position,
      selection,
    })
  );
};

// Creates a combined reducer for all playgrounds.
export const createDefaultPlaygroundsReducers = (playgrounds) =>
  playgrounds.reduce(
    (combined, id) =>
      Object.assign(combined, { [id]: createPlaygroundReducer() }),
    {}
  );

export const initDefaultPlaygroundsState = (reducers) => {
  return Object.keys(reducers).reduce(
    (combined, reducerId) =>
      Object.assign(combined, {
        [reducerId]: reducers[reducerId](undefined, "@@APP_INIT"),
      }),
    {}
  );
};

// Reducer to manage all playgrounds within a single lesson page.
export default function playgrounds(playgroundsReducers) {
  return (state = {}, playgroundAction: Action) => {
    if (
      typeof playgroundAction == "object" &&
      playgroundAction.type.startsWith(ActionType.PlaygroundAction)
    ) {
      const { playgroundId, action } = playgroundAction;
      return {
        ...state,
        [playgroundId]: playgroundsReducers[playgroundId](
          state[playgroundId],
          action
        ),
      };
    } else {
      return state;
    }
  };
}

export type State = ReturnType<typeof playgrounds>;

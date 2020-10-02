import { Action, ActionType } from "../actions";

export interface Code {
  default?: string;
  current?: string;
}

const DEFAULT = { default: "", current: "" };
export type State = Code;

export default function code(state = DEFAULT, action: Action): State {
  switch (action.type) {
    case ActionType.EditCode:
      return { default: state.default, current: action.code || state.default };

    default:
      return state;
  }
}

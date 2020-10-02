import { Action, ActionType } from "../actions";

export interface State {
  lessonPage: number;
}

const DEFAULT: State = {
  lessonPage: 1,
};

export default function navigation(state = DEFAULT, action: Action): State {
  switch (action.type) {
    case ActionType.SwitchLessonPage:
      return { ...state, lessonPage: action.page };
  }
  return state;
}

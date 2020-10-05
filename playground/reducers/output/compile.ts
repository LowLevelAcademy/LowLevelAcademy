import { Action, ActionType } from '../../actions';
import { finish, start } from './sharedStateManagement';

const DEFAULT: State = {
  requestsInProgress: 0,
  body: null,
  error: null,
  lineOffset: 0,
  results: {},
};

interface State {
  requestsInProgress: number;
  body?: any;
  error?: string;
  lineOffset?: number;
  results?: any;
}

export default function compile(state = DEFAULT, action: Action) {
  switch (action.type) {
    case ActionType.ExecutionSucceeded:
      const { results = null } = action;
      return { ...state, results };

    case ActionType.ExecutionFailed:
      const { error = null } = action;
      return { ...state, error };

    case ActionType.CompileRequest:
      return start(state, state);

    case ActionType.CompileSucceeded: {
      const { body = null, lineOffset = 0 } = action;
      return finish(state, { body, lineOffset, results: {}, error: null });
    }

    case ActionType.CompileFailed: {
      const { error, lineOffset = 0 } = action;
      return finish(state, { error, lineOffset });
    }

    default:
      return state;
  }
}

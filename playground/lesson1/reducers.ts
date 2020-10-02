import { TestState } from "../../components/Tests";
import { ActionType, FinalTest } from "./actions";
import { ActionType as GeneralAction } from "../actions";

const REGEX_DOMAIN_NAME = /const\s*DOMAIN_NAME_REQUEST:\s*(?<type>.+?)\s*=\s*b"(?<name>.*)";/;

export const wrapFullDemoReducer = (primaryReducer) => (state = {}, action) => {
  if (action.type == ActionType.ApplyDnsRequest) {
    // transform code to set the domain name
    state.code.current = state.code.current.replace(
      REGEX_DOMAIN_NAME,
      `const DOMAIN_NAME_REQUEST: $1 = b"${action.domain}";`
    );
    return state;
  }
  return primaryReducer(state, action);
};

const DEFAULT_TEST_STATE = {
  SentDns: TestState.Default,
  SentMessage: TestState.Default,
  RecvdMessage: TestState.Default,
};

export const finalTestReducer = (state = DEFAULT_TEST_STATE, action) => {
  switch (action.type) {
    case ActionType.MarkTestCompleted:
      return { ...state, [FinalTest[action.test]]: TestState.Completed };

    // Mark all unfinished tests as failed
    case GeneralAction.ExecutionSucceeded:
    case GeneralAction.ExecutionFailed:
      return Object.keys(state).reduce(
        (res, key) => ({
          ...res,
          [key]:
            state[key] == TestState.Default ? TestState.Failed : state[key],
        }),
        {}
      );

    // Reset tests state to default
    case GeneralAction.CompileRequest:
    case ActionType.ResetTestsStatus:
      return Object.keys(state).reduce(
        (state, key) => ({ ...state, [key]: TestState.Default }),
        {}
      );

    default:
      return state;
  }
};

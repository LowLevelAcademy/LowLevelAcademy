export enum ActionType {
  ApplyDnsRequest = "ApplyDnsRequest",
  MarkTestCompleted = "MarkTestCompleted",
  ResetTestsStatus = "ResetTestsStatus",
}

const createAction = <T extends string, P extends unknown>(
  type: T,
  props?: P
) => Object.assign({ type }, props);

export enum FinalTest {
  SentDns = 1,
  SentMessage = 2,
  RecvdMessage = 3,
}

export const applyDnsRequest = (domain: string) =>
  createAction(ActionType.ApplyDnsRequest, { domain });

export const markTestCompleted = (test: FinalTest) =>
  createAction(ActionType.MarkTestCompleted, { test });

export const resetTestsStatus = () => createAction(ActionType.ResetTestsStatus);

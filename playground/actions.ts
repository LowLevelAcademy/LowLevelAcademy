import fetch from 'isomorphic-fetch';
import { ThunkAction as ReduxThunkAction } from 'redux-thunk';
import Url from 'url';

import State from './state';
import {
  Position,
  makePosition,
} from './types';
import { selectPlayground } from './selectors';
import { CodeWrapperFunction } from './Playground';

const routes = {
  compile: { pathname: '/compile' },
};

type ThunkAction<T = void> = ReduxThunkAction<T, State, unknown, any>;
// FIXME: we temporarily use `any` in place of `Action` here    ^^^^^  because there's no
// easy way to define `Action` types across multiple modules.

const createAction = <T extends string, P extends unknown>(type: T, props?: P) => (
  Object.assign({ type }, props)
);

export enum ActionType {
  SetPage = 'SetPage',
  PlaygroundAction = 'Playground',
  CompileRequest = 'CompileRequest',
  CompileSucceeded = 'CompileSucceeded',
  CompileFailed = 'CompileFailed',
  ExecutionSucceeded = 'ExecutionSucceeded',
  ExecutionFailed = 'ExecutionFailed',
  EditCode = 'EditCode',
  AddImport = 'AddImport',
  GotoPosition = 'GotoPosition',
  SelectText = 'SelectText',
  SwitchLessonPage = 'SwitchLessonPage',
  // Virtual network - TODO: move to a separate self-contained component?
  SendNetworkFrame = 'SendNetworkFrame',
}

const requestCompile = () =>
  createAction(ActionType.CompileRequest);

const receiveCompileSuccess = ({ body, lineOffset }) =>
  createAction(ActionType.CompileSucceeded, { body, lineOffset });

export const switchLessonPage = (page) =>
  createAction(ActionType.SwitchLessonPage, { page });

// Used to pass arbitrary results of executing a wasm module.
export const receiveExecutionSuccess = (results) =>
  createAction(ActionType.ExecutionSucceeded, { results });

export const receiveExecutionFailure = (error) =>
  createAction(ActionType.ExecutionFailed, { error });

const receiveCompileFailure = ({ error, lineOffset }) =>
  createAction(ActionType.CompileFailed, { error, lineOffset });

export const createPlaygroundAction = (playgroundId, action) =>
  createAction(`${ActionType.PlaygroundAction}.${action.type}`, { playgroundId, action })

export const sendNetworkFrame = (frame) =>
  createAction(ActionType.SendNetworkFrame, { frame });

async function jsonPost(urlObj, body) {
  const args = {
    method: 'post',
    body: JSON.stringify(body),
  };

  const headers = { 'Content-Type': 'application/json' };

  let response;
  try {
    response = await fetch(Url.format(urlObj), { ...args, headers });
  } catch (networkError) {
    // e.g. server unreachable
    throw ({
      error: `Network error: ${networkError.toString()}`,
    });
  }

  if (response.ok) {
    // HTTP 2xx
    let body;
    try {
      body = await response.arrayBuffer();
      body = await WebAssembly.compile(body)
    } catch (error) {
      throw ({
        error: `Could not get response body: ${error.toString()}`,
      });
    }
    return { body };
  } else if (response.status == 400) {
    // Compilation failed
    let stderr;
    try {
      stderr = await response.text();
    } catch (error) {
      throw ({
        error: `Could not parse stderr: ${error.toString()}`,
      });
    }
    throw { error: stderr };
  } else {
    // HTTP 4xx, 5xx (e.g. malformed JSON request)
    throw response;
  }
}

interface ExecuteRequestBody {
  code: string;
}

export const performExecute = (playgroundId, codeWrapperFn?: CodeWrapperFunction): ThunkAction => (dispatch, getState) => {
  dispatch(createPlaygroundAction(playgroundId, requestCompile()));

  const state = selectPlayground(getState(), playgroundId);
  const { lineOffset, code } =
    (codeWrapperFn !== undefined) ? codeWrapperFn(state.code.current) : { lineOffset: 0, code: state.code.current };

  const body: ExecuteRequestBody = { code };

  return jsonPost(routes.compile, body)
    .then(res => {
      dispatch(createPlaygroundAction(playgroundId, receiveCompileSuccess({ body: res.body, lineOffset })))
    })
    .catch(res => {
      console.error(res);
      dispatch(createPlaygroundAction(playgroundId, receiveCompileFailure({ error: res.error, lineOffset })))
    });
};

export const editCode = (code: string) =>
  createAction(ActionType.EditCode, { code });

export const resetCodeToDefault = () =>
  editCode(null);

export const addImport = (code: string) =>
  createAction(ActionType.AddImport, { code });

export const gotoPosition = (line: string | number, column: string | number) =>
  createAction(ActionType.GotoPosition, makePosition(line, column));

export const selectText = (start: Position, end: Position) =>
  createAction(ActionType.SelectText, { start, end });

export function indexPageLoad({
  code,
}): ThunkAction {
  return function (dispatch) {
    if (code) {
      dispatch(editCode(code));
    }
  };
}

// Action wrapper for a playground.
export type PlaygroundAction = { playgroundId: string, type: string, action: Action };

export type Action =
  | ReturnType<typeof requestCompile>
  | ReturnType<typeof receiveCompileSuccess>
  | ReturnType<typeof receiveCompileFailure>
  | ReturnType<typeof receiveExecutionSuccess>
  | ReturnType<typeof receiveExecutionFailure>
  | ReturnType<typeof editCode>
  | ReturnType<typeof addImport>
  | ReturnType<typeof gotoPosition>
  | ReturnType<typeof selectText>
  | ReturnType<typeof switchLessonPage>
  | ReturnType<typeof sendNetworkFrame>
  ;

import { createSelector } from "reselect";

import { State } from "../reducers";

const getOutput = (state: State) => state.output.compile;

const REGEX_ERR_REF = /input.rs:(?<line>\d+):(?<col>\d+)/g;
const REGEX_ERR_LINE_NUMS = /^(?<line>\d+)(?<spaces>\s*)\|/gm;

export const selectPlayground = (state: State, playgroundId) =>
  state.playgrounds[playgroundId];

export const selectCompileResults = (state: State, playgroundId) =>
  selectPlayground(state, playgroundId).output.compile?.results;

// format Rust errors and translate line numbers for user's code
export const formatError = createSelector(
  getOutput,
  ({ error, lineOffset }) =>
    error != null &&
    error
      .replaceAll(
        REGEX_ERR_REF,
        (_match, line, col) =>
          `src/main.rs:${parseInt(line, 10) - lineOffset}:${col}`
      )
      .replaceAll(REGEX_ERR_LINE_NUMS, (_match, line, spaces) => {
        const newLineNum = (parseInt(line, 10) - lineOffset).toString();
        const lenDiff = line.length - newLineNum.length;
        return `${newLineNum}${" ".repeat(
          Math.max(0, spaces.length + lenDiff)
        )}|`;
      })
);

export const hasProperties = (obj) => Object.values(obj).some((val) => !!val);
export const getSomethingToShow = createSelector(
  getOutput,
  (a) => a.body || a.error
);

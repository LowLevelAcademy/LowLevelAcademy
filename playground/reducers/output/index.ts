import { combineReducers } from 'redux';

import compile from './compile';

const output = combineReducers({
  compile,
});

export type State = ReturnType<typeof output>;

export default output;

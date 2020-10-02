// This is used to store "long-term" values; those which we want to be
// preserved between completely independent sessions of the
// playground.

import State from './state';
import storage from './storage';

const CURRENT_VERSION = 1;

export function serialize(state: State) {
  return JSON.stringify({
    version: CURRENT_VERSION,
    lesson1: {
      playgrounds: Object.keys(state.playgrounds).reduce((res, playgroundId) => {
        res[playgroundId] = { code: { current: state.playgrounds[playgroundId].code.current } };
        return res;
      }, {}),
      navigation: state.navigation,
    }
  });
}

export function deserialize(savedState) {
  if (!savedState) { return undefined; }
  const parsedState = JSON.parse(savedState);
  if (!parsedState) { return undefined; }
  if (parsedState.version !== CURRENT_VERSION) { return undefined; }

  // This assumes that the keys we serialize with match the keys in the
  // live state. If that's no longer true, an additional renaming step
  // needs to be added.
  delete parsedState.version;
  return parsedState.lesson1;
}

export default storage({
  storageFactory: () => localStorage,
  serialize,
  deserialize,
});

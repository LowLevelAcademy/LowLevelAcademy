// This is used to store "short-term" values; those which we want to
// be preserved between the same sessions of the playground, such as
// when we reopen a closed tab.

import { State } from "./reducers";
import storage from "./storage";

const CURRENT_VERSION = 1;

export function serialize(state: any): string {
  return JSON.stringify({
    version: CURRENT_VERSION,
    lesson1: {
      playgrounds: Object.keys(state.playgrounds).reduce(
        (res, playgroundId) => {
          res[playgroundId] = {
            code: { current: state.playgrounds[playgroundId].code.current },
          };
          return res;
        },
        {}
      ),
      navigation: state.navigation,
    },
  });
}

export function deserialize(savedState: string): Partial<State> {
  if (!savedState) {
    return undefined;
  }
  const parsedState = JSON.parse(savedState);
  if (!parsedState) {
    return undefined;
  }
  if (parsedState.version !== CURRENT_VERSION) {
    return undefined;
  }

  // This assumes that the keys we serialize with match the keys in the
  // live state. If that's no longer true, an additional renaming step
  // needs to be added.
  delete parsedState.version;
  return parsedState.lesson1;
}

const makeStorage = (key: string) =>
  storage(key, {
    storageFactory: () => sessionStorage,
    serialize,
    deserialize,
  });

export default makeStorage;

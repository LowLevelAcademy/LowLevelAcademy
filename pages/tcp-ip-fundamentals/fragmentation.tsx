import React from "react";
import { combineReducers } from "redux";

import Fragmentation from "../../components/lesson2/Fragmentation.mdx";
import SplittingPackets from "../../components/lesson2/SplittingPackets.mdx";
import Sequencing from "../../components/lesson2/Sequencing.mdx";

import merge from "lodash/merge";
import { Provider } from "react-redux";
import { applyMiddleware, compose, createStore } from "redux";
import localStorage from "../../playground/local_storage";
import sessionStorage from "../../playground/session_storage";
import thunk, { ThunkDispatch } from "redux-thunk";
import playgrounds, {
  createDefaultPlaygroundsReducers,
  createPlaygroundReducer,
  initDefaultPlaygroundsState,
  State,
} from "../../playground/reducers";
import navigation from "../../playground/reducers/navigation";
import { initDefaultLessonState } from "../../components/lesson2/rust";
import virtualNetworkReducer from "../../playground/reducers/virtualNetwork";
import {
  Action,
  addImport,
  createPlaygroundAction,
  gotoPosition,
  selectText,
} from "../../playground/actions";

import Lesson from "../../components/Lesson";
import Page from "../../components/Page";
import { configureRustErrors } from "../../playground/highlighting";

const initialGlobalState = {
  navigation: {
    lessonPage: 1,
  },
};

const allPlaygroundsReducers = Object.assign(
  {
    sendChunks: createPlaygroundReducer({
      virtualNetwork: virtualNetworkReducer,
    }),
    sendOrderedChunks: createPlaygroundReducer({
      virtualNetwork: virtualNetworkReducer,
    }),
  },
  createDefaultPlaygroundsReducers([
    "colorPlayground",
    "chunks",
    "enumerateChunks",
    "reorderChunks",
  ])
);

const appStateReducer = combineReducers({
  navigation,
  playgrounds: playgrounds(allPlaygroundsReducers),
});

const appState = appStateReducer(undefined, { type: "@@APP_INIT" });
const initialState = merge(merge(appState, initialGlobalState), {
  playgrounds: initDefaultPlaygroundsState(allPlaygroundsReducers),
});
initDefaultLessonState(initialState);

const middlewares = applyMiddleware<
  ThunkDispatch<State, unknown, Action>,
  unknown
>(thunk);
const composeEnhancers: typeof compose =
  (typeof window !== "undefined" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;
const enhancers = composeEnhancers(
  middlewares,
  localStorage("tcpip.fragmentation"),
  sessionStorage("tcpip.fragmentation")
);
const store = createStore(appStateReducer, initialState, enhancers);

configureRustErrors({
  gotoPosition: (playgroundId, line, col) =>
    store.dispatch(
      createPlaygroundAction(playgroundId, gotoPosition(line, col))
    ),
  selectText: (playgroundId, start, end) =>
    store.dispatch(selectText(start, end)),
  addImport: (playgroundId, code) => store.dispatch(addImport(code)),
});

const Lesson2: React.FunctionComponent = () => {
  return (
    <Provider store={store}>
      <Lesson
        module="TCP/IP Fundamentals"
        badges={["Beginner", "Rust"]}
        sponsors={[
          ["Embark", "https://github.com/embark-studios"],
          "Private sponsor",
        ]}
      >
        <Page title="Fragmentation">
          <Fragmentation />
        </Page>
        <Page title="Splitting packets">
          <SplittingPackets />
        </Page>
        <Page title="Sequencing">
          <Sequencing />
        </Page>
      </Lesson>
    </Provider>
  );
};

export default Lesson2;

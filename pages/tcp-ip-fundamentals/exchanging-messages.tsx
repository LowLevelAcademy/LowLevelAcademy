import React from "react";
import { combineReducers } from "redux";

import ExchangingMessagesContent from "../../components/lesson1/ExchangingMessages.mdx";
import SocketsAndDatagramsContent from "../../components/lesson1/SocketsAndDatagrams.mdx";
import SocketsApiContent from "../../components/lesson1/SocketsApi.mdx";

import {
  finalTestReducer,
  wrapFullDemoReducer,
} from "../../playground/lesson1/reducers";
import merge from "lodash/merge";
import { Provider } from "react-redux";
import { applyMiddleware, compose, createStore } from "redux";
import { configureRustErrors } from "../../playground/highlighting";
import localStorage from "../../playground/local_storage";
import sessionStorage from "../../playground/session_storage";
import thunk, { ThunkDispatch } from "redux-thunk";
import playgrounds, {
  createPlaygroundReducer,
  createDefaultPlaygroundsReducers,
  initDefaultPlaygroundsState,
  State,
} from "../../playground/reducers";
import navigation from "../../playground/reducers/navigation";
import { initDefaultLessonState } from "../../playground/lesson1/rust";
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

if (!WebAssembly.instantiateStreaming) {
  // Polyfill for Safari
  WebAssembly.instantiateStreaming = async (resp, importObject) => {
    const source = await (await resp).arrayBuffer();
    return await WebAssembly.instantiate(source, importObject);
  };
}

const initialGlobalState = {
  navigation: {
    lessonPage: 1,
  },
};

const allPlaygroundsReducers = Object.assign(
  {
    fullDemo: wrapFullDemoReducer(
      createPlaygroundReducer({
        virtualNetwork: virtualNetworkReducer,
      })
    ),
    udpApi: wrapFullDemoReducer(
      createPlaygroundReducer({
        virtualNetwork: virtualNetworkReducer,
      })
    ),
    finalTest: createPlaygroundReducer({
      virtualNetwork: virtualNetworkReducer,
      tests: finalTestReducer,
    }),
  },
  createDefaultPlaygroundsReducers(["ipPackets", "udpDatagram"])
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
const enhancers = composeEnhancers(middlewares, localStorage, sessionStorage);
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

const Lesson1: React.FunctionComponent = () => {
  return (
    <Provider store={store}>
      <Lesson module="TCP/IP Fundamentals" badges={["Beginner", "Rust"]}>
        <Page title="Exchanging Messages">
          <ExchangingMessagesContent />
        </Page>
        <Page title="Sockets and Datagrams">
          <SocketsAndDatagramsContent />
        </Page>
        <Page title="Sockets API">
          <SocketsApiContent />
        </Page>
      </Lesson>
    </Provider>
  );
};

export default Lesson1;

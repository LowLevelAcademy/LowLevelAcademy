import React, { useContext } from "react";
import { useSelector } from "react-redux";

import Editor from "./Editor";
import Header from "./Header";
import State from "./state";
import { selectPlayground } from "./selectors";

export const PlaygroundContext = React.createContext(null);

// Wraps user code
export interface WrappedCode {
  // Line offset number (used to determine where the user's code begins when
  // we format errors).
  lineOffset: number;

  // Resulting wrapped code.
  code: string;
}

export type CodeWrapperFunction = (string) => WrappedCode;

// Return the playground state depending on the context (each playground
// has its own state and they're differentiated by the playground ID components).
export const usePlaygroundSelector = (selectorFn) => {
  const { playgroundId } = useContext(PlaygroundContext);
  return useSelector((state: State) =>
    selectorFn(selectPlayground(state, playgroundId))
  );
};

export interface PlaygroundProps {
  // ID of a playground - used for storing state.
  id: string;

  // Code wrapper function
  codeWrapperFn?: CodeWrapperFunction;
}

export const Playground: React.FC<PlaygroundProps> = (props) => {
  // We initialise a context with the given ID.
  // This context is used by all the child components and by created actions.
  const { id, codeWrapperFn } = props;
  const isRequestLoading = useSelector(
    (state) => selectPlayground(state, id).output.compile.requestsInProgress > 0
  );

  return (
    <div>
      <div className="playground">
        <PlaygroundContext.Provider value={{ playgroundId: id, codeWrapperFn }}>
          <div className="playground-header">
            <Header />
          </div>
          <div
            className={
              "playground-editor " +
              (isRequestLoading ? "playground-editor-loading" : "")
            }
          >
            <Editor />
          </div>
          {props.children}
        </PlaygroundContext.Provider>
      </div>
    </div>
  );
};

export default Playground;

import React, { useCallback, useContext } from "react";
import { useDispatch } from "react-redux";

import * as actions from "./actions";
import AdvancedEditor from "./AdvancedEditor";

import { PlaygroundContext, usePlaygroundSelector } from "./Playground";

const Editor: React.FC = () => {
  const { playgroundId, codeWrapperFn } = useContext(PlaygroundContext);
  const code = usePlaygroundSelector((state) => state.code.current);
  const position = usePlaygroundSelector((state) => state.position);
  const selection = usePlaygroundSelector((state) => state.selection);

  const dispatch = useDispatch();
  const execute = useCallback(
    () => dispatch(actions.performExecute(playgroundId, codeWrapperFn)),
    [dispatch]
  );
  const onEditCode = useCallback(
    (c) =>
      dispatch(
        actions.createPlaygroundAction(playgroundId, actions.editCode(c))
      ),
    [dispatch]
  );

  return (
    <div className="editor">
      <AdvancedEditor
        autocompleteOnUse={true}
        code={code}
        position={position}
        selection={selection}
        onEditCode={onEditCode}
        execute={execute}
      />
    </div>
  );
};

export default Editor;

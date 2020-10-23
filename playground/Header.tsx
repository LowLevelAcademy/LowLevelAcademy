import React, { useCallback, useContext } from "react";
import { useDispatch } from "react-redux";

import HeaderButton from "./HeaderButton";
import { SegmentedButton, SegmentedButtonSet } from "./SegmentedButton";

import * as actions from "./actions";
import { PlaygroundContext } from "./Playground";

const BuildIcon = () => (
  <svg
    className="icon"
    height="14"
    viewBox="8 4 10 16"
    width="12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

const Header: React.FC = () => (
  <div className="header">
    <HeaderSet id="build">
      <SegmentedButtonSet>
        <ExecuteButton />
        <ResetButton />
      </SegmentedButtonSet>
    </HeaderSet>
  </div>
);

export interface HeaderSetProps {
  id: string;
}

export const HeaderSet: React.FC<HeaderSetProps> = ({ id, children }) => (
  <div className={`header__set header__set--${id}`}>{children}</div>
);

const ExecuteButton: React.FC = () => {
  const { playgroundId, codeWrapperFn } = useContext(PlaygroundContext);
  const dispatch = useDispatch();
  const execute = useCallback(
    () => dispatch(actions.performExecute(playgroundId, codeWrapperFn)),
    [dispatch]
  );

  return (
    <SegmentedButton isBuild onClick={execute}>
      <HeaderButton rightIcon={<BuildIcon />}>Run</HeaderButton>
    </SegmentedButton>
  );
};

const ResetButton: React.FC = () => {
  const { playgroundId } = useContext(PlaygroundContext);
  const dispatch = useDispatch();
  const resetCode = useCallback(
    () =>
      dispatch(
        actions.createPlaygroundAction(
          playgroundId,
          actions.resetCodeToDefault()
        )
      ),
    [dispatch]
  );

  return (
    <SegmentedButton isBuild onClick={resetCode}>
      <HeaderButton>Reset</HeaderButton>
    </SegmentedButton>
  );
};

export default Header;

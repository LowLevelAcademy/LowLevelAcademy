import React, { useContext } from "react";
import { PrismCode } from "react-prism";
import { PlaygroundContext } from "../Playground";

export interface SimplePaneProps extends ReallySimplePaneProps {
  kind: string;
}

export interface ReallySimplePaneProps {
  requestsInProgress: number;
  error?: string;
}

const SimplePane: React.FunctionComponent<SimplePaneProps> = (props) => {
  const { playgroundId } = useContext(PlaygroundContext);
  return (
    <div className={`output-${props.kind}`}>
      <div className="output-stderr">
        <pre>
          <PrismCode
            className={"language-rust_errors playground-id-" + playgroundId}
          >
            {props.error}
          </PrismCode>
        </pre>
      </div>
      {props.children}
    </div>
  );
};

export default SimplePane;

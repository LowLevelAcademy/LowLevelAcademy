import React, {
  FC,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useDispatch } from "react-redux";

import {
  createPlaygroundAction,
  receiveExecutionFailure,
  receiveExecutionSuccess,
} from "../../playground/actions";
import * as selectors from "../../playground/selectors";

import Playground, {
  PlaygroundContext,
  usePlaygroundSelector,
} from "../../playground/Playground";
import { wrapColorManipulation } from "./rust";
import { evalManipulateColor } from "./wasm";
import SimplePane from "../../playground/Output/SimplePane";

const ModifiedPostcard: FC = (props) => {
  const dispatch = useDispatch();
  const canvasRef: MutableRefObject<HTMLCanvasElement> = useRef();
  const { playgroundId } = useContext(PlaygroundContext);
  const generatedWasm = usePlaygroundSelector(
    (state) => state.output.compile.body
  );

  useEffect(() => {
    if (generatedWasm != null) {
      const scaleFactor = window.devicePixelRatio || 1;
      const postcardElem = window.document.getElementById(
        "postcard"
      ) as HTMLCanvasElement;
      const postcardCanvas: CanvasRenderingContext2D = postcardElem.getContext(
        "2d"
      );

      const onExecSuccess = (result: ImageData) => {
        canvasRef.current.width = 300 * scaleFactor;
        canvasRef.current.height = 300 * scaleFactor;
        canvasRef.current.style.width = "300px";
        canvasRef.current.style.height = "300px";

        const ctx = canvasRef.current.getContext("2d");
        ctx.putImageData(result, 0, 0);
        ctx.scale(scaleFactor, scaleFactor);
      };
      const onExecFailure = (error) => {
        dispatch(
          createPlaygroundAction(playgroundId, receiveExecutionFailure(error))
        );
      };

      // Get user's canvas data
      const imageData = postcardCanvas.getImageData(
        0,
        0,
        300 * scaleFactor,
        300 * scaleFactor
      );

      evalManipulateColor(
        imageData,
        generatedWasm,
        onExecSuccess,
        onExecFailure
      );
    }
  }, [generatedWasm]);

  const formattedError = usePlaygroundSelector(selectors.formatError);
  const details = usePlaygroundSelector((state) => state.output.compile);
  const showErrors = formattedError != null && formattedError.length > 0;

  return (
    <div className="output">
      <div className="output-body">
        {showErrors && (
          <SimplePane {...details} error={formattedError} kind="execute" />
        )}
        {(!showErrors && generatedWasm) && <canvas width={300} height={300} ref={canvasRef} /> }
      </div>
    </div>
  );
};

export const ManipulateColorPlayground = (props) => (
  <Playground id="colorPlayground" codeWrapperFn={wrapColorManipulation}>
    <ModifiedPostcard />
  </Playground>
);

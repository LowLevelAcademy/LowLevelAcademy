import React, {
  FC,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";

import {
  createPlaygroundAction,
  receiveExecutionFailure,
} from "../../playground/actions";
import SimplePane from "../../playground/Output/SimplePane";
import * as selectors from "../../playground/selectors";
import Playground, {
  PlaygroundContext,
  usePlaygroundSelector,
} from "../../playground/Playground";

import styles from "./SplittingPackets.module.scss";
import { wrapChunks } from "./rust";
import { evalChunks, Chunk } from "./wasm";

export const MAX_CHUNKS = 40;

export interface ChunkProps {
  num: number;
  chunk: Chunk;
}

const RenderedChunk: FC<ChunkProps> = (props) => {
  const canvasRef: MutableRefObject<HTMLCanvasElement> = useRef();

  useEffect(() => {
    if (canvasRef.current) {
      const ctx: CanvasRenderingContext2D = canvasRef.current.getContext("2d");

      canvasRef.current.width = 300;
      canvasRef.current.height = 300;

      ctx.putImageData(props.chunk.data, 0, 0);
    }
  }, [canvasRef, props.chunk.data]);

  return (
    <div className={styles.chunk}>
      <div>Chunk #{props.num}</div>
      <div className={styles.chunkCanvas}>
        <canvas width={300} height={300} ref={canvasRef} />
      </div>
    </div>
  );
};

// Component that is rendered if there are more than MAX_CHUNKS
const ChunkRest: FC<{ skippedChunks }> = ({ skippedChunks }) => {
  return (
    <div className={styles.chunk}>
      <div>Skipped chunks</div>
      <div className={styles.skippedChunks}>+{skippedChunks}</div>
    </div>
  );
};

export interface ChunkedPostcardProps {
  chunkComponent?: FC<ChunkProps>;
  onEval?: (
    imageData: ImageData,
    mod: WebAssembly.Instance,
    onExecSuccess: CallableFunction,
    onExecFailure: CallableFunction
  ) => void;
}

export const ChunkedPostcard: FC<ChunkedPostcardProps> = (props) => {
  const [chunks, setChunks] = useState<{
    chunks: Array<Chunk>;
    skipped: number;
  }>({ chunks: [], skipped: 0 });
  const dispatch = useDispatch();
  const { playgroundId } = useContext(PlaygroundContext);
  const generatedWasm = usePlaygroundSelector(
    (state) => state.output.compile.body
  );
  const ChunkComponent = props.chunkComponent || RenderedChunk;
  const evalFn = props.onEval || evalChunks;

  useEffect(() => {
    if (generatedWasm != null) {
      const canvasElem = window.document.getElementById(
        "postcard"
      ) as HTMLCanvasElement;
      const postcardCanvas: CanvasRenderingContext2D = canvasElem.getContext(
        "2d"
      );

      const onExecSuccess = (chunks, skipped) => {
        // Render each chunk as an image
        setChunks({ chunks, skipped });
      };
      const onExecFailure = (error) => {
        dispatch(
          createPlaygroundAction(playgroundId, receiveExecutionFailure(error))
        );
      };

      // Get user's canvas data
      const scaleFactor = window.devicePixelRatio || 1;

      let scaledCtx = postcardCanvas;

      if (scaleFactor != 1) {
        const scaledCanvas = document.createElement("canvas");
        scaledCanvas.width = 300;
        scaledCanvas.height = 300;

        scaledCtx = scaledCanvas.getContext("2d");
        scaledCtx.scale(1 / scaleFactor, 1 / scaleFactor);
        scaledCtx.drawImage(canvasElem, 0, 0);
      }

      const imageData = scaledCtx.getImageData(0, 0, 300, 300);

      evalFn(imageData, generatedWasm, onExecSuccess, onExecFailure);
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
      </div>
      <div className="chunks">
        {chunks.chunks.slice(0, MAX_CHUNKS).map((chunk, chunkId) => (
          <ChunkComponent key={chunkId} num={chunkId} chunk={chunk} />
        ))}
        {chunks.skipped > 0 && <ChunkRest skippedChunks={chunks.skipped} />}
      </div>
    </div>
  );
};

export const ChunksPlayground = () => (
  <Playground id="chunks" codeWrapperFn={wrapChunks}>
    <ChunkedPostcard />
  </Playground>
);

import React, { FC, MutableRefObject, useEffect, useRef } from "react";

import Playground from "../../playground/Playground";

import { wrapEnumerate } from "./rust";
import { ChunkedPostcard, ChunkProps } from "./ChunksPlayground";
import styles from "./SplittingPackets.module.scss";

export const EnumeratedChunk: FC<ChunkProps> = (props) => {
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
      <div className={styles.chunkCanvas}>
        <canvas width={300} height={300} ref={canvasRef} />
        <div className={styles.chunkIndex}>{props.chunk.index + 1}</div>
      </div>
    </div>
  );
};

export const EnumerateChunksPlayground = (props) => (
  <Playground id="enumerateChunks" codeWrapperFn={wrapEnumerate}>
    <ChunkedPostcard chunkComponent={EnumeratedChunk} />
  </Playground>
);

import React, {
  FC,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";

import {
  createPlaygroundAction,
  receiveExecutionFailure,
  sendNetworkFrame,
} from "../../playground/actions";
import SimplePane from "../../playground/Output/SimplePane";
import * as selectors from "../../playground/selectors";
import Playground, {
  PlaygroundContext,
  usePlaygroundSelector,
} from "../../playground/Playground";
import { initializeVirtualNetwork } from "../wasm/virtualNetwork";
import VNetVisualize, { VNetInterface } from "../network/VirtualNetworkVis";
import { GREEN, RED } from "../../playground/lesson1/colours";
import { NetworkPacketsViewer } from "../network/NetworkPacketsViewer";

import { wrapSendChunks } from "./rust";
import { evalSendChunks } from "./wasm";
import styles from "./SplittingPackets.module.scss";

export interface ChunksOutputProps {
  /**
   * Holds a ref to the network packets visualizer.
   */
  visRef: React.RefObject<VNetInterface>;
}

export const ChunksNetworkOutput: FC<ChunksOutputProps> = (props) => {
  const somethingToShow = usePlaygroundSelector(selectors.getSomethingToShow);
  const formattedError = usePlaygroundSelector(selectors.formatError);
  const details = usePlaygroundSelector((state) => state.output.compile);
  const sentPackets = usePlaygroundSelector(
    (state) => state.virtualNetwork.udpSent
  );

  if (!somethingToShow) {
    return null;
  }

  const showErrors = formattedError != null && formattedError.length > 0;

  const nodes = [
    { name: "You", x: -100, y: -80, z: 0, colour: GREEN },
    { name: "Alice\n10.0.0.42:1000", x: 100, y: 80, z: 0, colour: RED },
  ];
  const links = [[0, 1]];

  return (
    <div className="playground-vis row no-gutters">
      <div
        className={
          "vnet-vis-container col-12 col-lg-6" + (showErrors ? " d-none" : "")
        }
      >
        <VNetVisualize nodes={nodes} links={links} ref={props.visRef} />
      </div>
      <div className="playground-output col-12 col-lg-6">
        <div className="output">
          <div className="output-body">
            {showErrors && (
              <SimplePane {...details} error={formattedError} kind="execute" />
            )}
            {!showErrors && <NetworkPacketsViewer packets={sentPackets} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export interface RenderImageProps {
  imageData: ImageData;
}

export const RenderImageData: FC<RenderImageProps> = (props) => {
  const canvasRef: MutableRefObject<HTMLCanvasElement> = useRef();

  useEffect(() => {
    if (canvasRef.current) {
      const ctx: CanvasRenderingContext2D = canvasRef.current.getContext("2d");

      canvasRef.current.width = 300;
      canvasRef.current.height = 300;

      ctx.putImageData(props.imageData, 0, 0);
    }
  }, [canvasRef, props.imageData]);

  return (
    <div className={styles.chunk}>
      <canvas width={300} height={300} ref={canvasRef} />
    </div>
  );
};

export const getPostcardImageData = () => {
  const canvasElem = window.document.getElementById(
    "postcard"
  ) as HTMLCanvasElement;
  const postcardCanvas: CanvasRenderingContext2D = canvasElem.getContext("2d");

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
  return imageData;
};

const SendChunkedPostcard = () => {
  const dispatch = useDispatch();
  const { playgroundId } = useContext(PlaygroundContext);
  const visRef = useRef(null);
  const vnetModule = useRef(null);
  const [scrambledImageData, setScrambledImageData] = useState(null);
  const generatedWasm = usePlaygroundSelector(
    (state) => state.output.compile.body
  );
  const packetsVis: React.Ref<{
    queue: Array<number>;
    count: number;
  }> = useRef({ queue: [], count: 0 });

  useEffect(() => {
    // animate packets sending
    setTimeout(function emitPacketsFromQueue() {
      if (packetsVis.current.queue.length > 0) {
        visRef.current.emitPacket(
          visRef.current.getLink(0),
          false,
          packetsVis.current.queue.shift()
        );
      }
      setTimeout(emitPacketsFromQueue, 300);
    });
  }, []);

  // Initialise the virtual network module
  useEffect(() => {
    // Dispatches each new sent network frame
    const notifyPacket = (res_ptr, len) => {
      const heap = new Uint8Array(vnetModule.current.exports.memory.buffer);
      const frame = heap.slice(res_ptr, res_ptr + len);

      dispatch(createPlaygroundAction(playgroundId, sendNetworkFrame(frame)));

      packetsVis.current.queue.push(packetsVis.current.count);
      packetsVis.current.count += 1;
    };

    initializeVirtualNetwork(
      vnetModule,
      (exports) => {
        exports.setup_fragmentation_network();
      },
      { notify_tx: notifyPacket }
    );
  }, []);

  useEffect(() => {
    if (generatedWasm != null && vnetModule.current != null) {
      const onExecSuccess = (imageData) => {
        setScrambledImageData(imageData);
      };
      const onExecFailure = (error) => {
        dispatch(
          createPlaygroundAction(playgroundId, receiveExecutionFailure(error))
        );
      };
      const imageData = getPostcardImageData();
      evalSendChunks(
        imageData,
        generatedWasm,
        vnetModule,
        onExecSuccess,
        onExecFailure
      );
    }
  }, [generatedWasm, vnetModule]);

  return (
    <>
      <ChunksNetworkOutput visRef={visRef} />
      <p className="mt-3">
        You can try playing with the parameters and variables to see how the
        behavior changes.
      </p>
      {scrambledImageData && (
        <>
          <p>
            As a result, you can see that Alice receives our packets
            successfully, but something unexpected happens. Seems like the
            picture she receives does not look like the one we've sent&mdash;it
            looks scrambled:
          </p>
          <RenderImageData imageData={scrambledImageData} />
          <p>On the following page, we will discuss why this happens.</p>
        </>
      )}
    </>
  );
};

export const SendChunksPlayground = (props) => (
  <Playground id="sendChunks" codeWrapperFn={wrapSendChunks}>
    <SendChunkedPostcard />
  </Playground>
);

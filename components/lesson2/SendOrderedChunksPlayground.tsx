import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import {
  createPlaygroundAction,
  receiveExecutionFailure,
  receiveExecutionSuccess,
  sendNetworkFrame,
} from "../../playground/actions";
import Playground, {
  PlaygroundContext,
  usePlaygroundSelector,
} from "../../playground/Playground";
import { initializeVirtualNetwork } from "../wasm/virtualNetwork";

import { wrapSendOrderedChunks } from "./rust";
import { evalSendOrderedChunks } from "./wasm";
import {
  ChunksNetworkOutput,
  getPostcardImageData,
  RenderImageData,
} from "./SendChunksPlayground";

const SendOrderedPostcard = () => {
  const dispatch = useDispatch();
  const { playgroundId } = useContext(PlaygroundContext);
  const visRef = useRef(null);
  const vnetModule = useRef(null);
  const [orderedImageData, setOrderedImageData] = useState(null);
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
        setOrderedImageData(imageData);
      };
      const onExecFailure = (error) => {
        dispatch(
          createPlaygroundAction(playgroundId, receiveExecutionFailure(error))
        );
      };
      const imageData = getPostcardImageData();
      evalSendOrderedChunks(
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
      {orderedImageData && <RenderImageData imageData={orderedImageData} />}
    </>
  );
};

export const SendOrderedChunksPlayground = () => (
  <Playground id="sendOrderedChunks" codeWrapperFn={wrapSendOrderedChunks}>
    <SendOrderedPostcard />
  </Playground>
);

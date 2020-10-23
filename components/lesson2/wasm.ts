import { RefObject } from "react";
// This module contains WebAssembly evaluators for each code example in the lesson.

import { report_error } from "../wasm/utils";
import { udp_recv_from, udp_send_to } from "../wasm/virtualNetwork";

import { MAX_CHUNKS } from "./ChunksPlayground";

const copyImageToMemory = (imageData: ImageData, mod: WebAssembly.Instance) => {
  // Allocate buffer for the image data
  const imageSize = imageData.width * imageData.height;
  const imagePtr = (mod.exports.__wbindgen_malloc as CallableFunction)(
    imageSize * 4
  );

  // Copy image data into the wasm module memory
  const memBuf = (mod.exports.memory as WebAssembly.Memory).buffer;
  const mem8 = new Uint8Array(memBuf);
  mem8.set(imageData.data, imagePtr);

  return [imageSize, imagePtr];
};

// Example: change colors of an image
export const evalManipulateColor = (
  imageData: ImageData,
  wasm,
  onExecSuccess,
  onExecFailure
) => {
  let userMod = { current: null };

  const env = { report_error: report_error(userMod) };

  WebAssembly.instantiate(wasm, { env }).then((instance) => {
    userMod.current = instance;

    if ((instance as any).exports.main) {
      try {
        const [imageSize, imagePtr] = copyImageToMemory(
          imageData,
          userMod.current
        );

        (userMod.current.exports.main as CallableFunction)(imagePtr, imageSize);

        // Now we can return the new ImageData back
        const mem8 = new Uint8Array(userMod.current.exports.memory.buffer);
        const resImageData = new ImageData(
          new Uint8ClampedArray(mem8.slice(imagePtr, imagePtr + imageSize * 4)),
          imageData.width,
          imageData.height
        );

        onExecSuccess(resImageData);
      } catch (e) {
        console.error(e);
        onExecFailure(e.toString());
      }
    }
  });
};

export interface Chunk {
  data: ImageData;
  index: number;
}

// Example: breaking image into multiple chunk
export const evalChunks = (
  imageData: ImageData,
  wasm,
  onExecSuccess: (chunks: Array<Chunk>, skipped: number) => void,
  onExecFailure
) => {
  let userMod = { current: null };

  const chunksResult: Array<Chunk> = [];
  let skippedChunks = 0;

  const import_chunk = (offset, chunk_ptr, chunk_ptr_len, index) => {
    if (chunksResult.length >= MAX_CHUNKS) {
      skippedChunks += 1;
      return;
    }

    const memBuf = new Uint8Array(userMod.current.exports.memory.buffer);

    const imgChunk = new ImageData(imageData.width, imageData.height);
    imgChunk.data.set(
      memBuf.slice(chunk_ptr, chunk_ptr + chunk_ptr_len),
      offset
    );

    chunksResult.push({ data: imgChunk, index });
  };

  const env = {
    report_error: report_error(userMod),
    import_chunk,
  };

  WebAssembly.instantiate(wasm, { env }).then((instance) => {
    userMod.current = instance;

    if ((instance as any).exports.main) {
      try {
        const [imageSize, imagePtr] = copyImageToMemory(
          imageData,
          userMod.current
        );

        const scrambleSeed = Date.now();
        (userMod.current.exports.main as CallableFunction)(
          imagePtr,
          imageSize,
          scrambleSeed
        );

        // As a result, we should get a list of chunks which contain parts of the image.

        onExecSuccess(chunksResult, skippedChunks);
      } catch (e) {
        console.error(e);
        onExecFailure(e.toString());
      }
    }
  });
};

// Example: sending chunks over the network
export const evalSendChunks = (
  imageData: ImageData,
  wasm,
  vnetModule: RefObject<WebAssembly.Instance>,
  onExecSuccess,
  onExecFailure
) => {
  let userMod = { current: null };

  const imageResult = new ImageData(imageData.width, imageData.height);

  // Store a list of sockets allocated by this example.
  // We do this in JS as opposed to Rust in order to make sure that resources are
  // freed even if the user code has panicked (drop code is not executed on panics).
  const allocatedSockets = [];

  const udp_bind = (ip, port) => {
    const sock = (vnetModule.current.exports.udp_bind as CallableFunction)(
      ip,
      port
    );
    allocatedSockets.push(sock);
    return sock;
  };

  const import_chunk = (offset, chunk_ptr, chunk_ptr_len, _index) => {
    const memBuf = new Uint8Array(userMod.current.exports.memory.buffer);

    imageResult.data.set(
      memBuf.slice(chunk_ptr, chunk_ptr + chunk_ptr_len),
      offset
    );
  };

  const env = {
    udp_bind,
    udp_unbind: vnetModule.current.exports.udp_unbind,
    udp_recv_from: udp_recv_from(vnetModule, userMod),
    udp_send_to: udp_send_to(vnetModule, userMod),
    report_error: report_error(userMod),
    poll_network: vnetModule.current.exports.poll_network,
    import_chunk,
  };

  WebAssembly.instantiate(wasm, { env }).then((instance) => {
    userMod.current = instance;

    if ((instance as any).exports.main) {
      try {
        const [imageSize, imagePtr] = copyImageToMemory(
          imageData,
          userMod.current
        );

        const scrambleSeed = Date.now();
        (userMod.current.exports.main as CallableFunction)(
          imagePtr,
          imageSize,
          scrambleSeed
        );

        // As a result, we should get a list of chunks which contain parts of the image.

        onExecSuccess(imageResult);
      } catch (e) {
        console.error(e);
        onExecFailure(e.toString());
      }
    }
  });
};

// Example: sending ordered chunks over the network
export const evalSendOrderedChunks = (
  imageData: ImageData,
  wasm,
  vnetModule: RefObject<WebAssembly.Instance>,
  onExecSuccess,
  onExecFailure
) => {
  let userMod = { current: null };

  const imageResult = new ImageData(imageData.width, imageData.height);

  // Store a list of sockets allocated by this example.
  // We do this in JS as opposed to Rust in order to make sure that resources are
  // freed even if the user code has panicked (drop code is not executed on panics).
  const allocatedSockets = [];

  const udp_bind = (ip, port) => {
    const sock = (vnetModule.current.exports.udp_bind as CallableFunction)(
      ip,
      port
    );
    allocatedSockets.push(sock);
    return sock;
  };

  const import_chunk = (offset, chunk_ptr, chunk_ptr_len, _index) => {
    const memBuf = new Uint8Array(userMod.current.exports.memory.buffer);

    imageResult.data.set(
      memBuf.slice(chunk_ptr, chunk_ptr + chunk_ptr_len),
      offset
    );
  };

  const env = {
    udp_bind,
    udp_unbind: vnetModule.current.exports.udp_unbind,
    udp_recv_from: udp_recv_from(vnetModule, userMod),
    udp_send_to: udp_send_to(vnetModule, userMod),
    report_error: report_error(userMod),
    poll_network: vnetModule.current.exports.poll_network,
    import_chunk,
  };

  WebAssembly.instantiate(wasm, { env }).then((instance) => {
    userMod.current = instance;

    if ((instance as any).exports.main) {
      try {
        const [imageSize, imagePtr] = copyImageToMemory(
          imageData,
          userMod.current
        );

        (userMod.current.exports.main as CallableFunction)(
          imagePtr,
          imageSize,
          0
        );

        // As a result, we should get a list of chunks which contain parts of the image.
        onExecSuccess(imageResult);
      } catch (e) {
        console.error(e);
        onExecFailure(e.toString());
      }
    }
  });
};

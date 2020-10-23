import { RefObject } from "react";
import { report_error } from "../../components/wasm/utils";
// This module contains WebAssembly evaluators for each code example in the lesson.

import {
  udp_recv_from,
  udp_send_to,
} from "../../components/wasm/virtualNetwork";

export const evalFullDemoWasm = (
  wasm,
  vnetModule: RefObject<WebAssembly.Instance>,
  execMain,
  onExecSuccess,
  onExecFailure
) => {
  let userMod = { current: null };

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

  const env = {
    udp_bind,
    udp_unbind: vnetModule.current.exports.udp_unbind,
    udp_recv_from: udp_recv_from(vnetModule, userMod),
    udp_send_to: udp_send_to(vnetModule, userMod),
    report_error: report_error(userMod),
    poll_network: vnetModule.current.exports.poll_network,
  };

  WebAssembly.instantiate(wasm, { env }).then((instance) => {
    userMod.current = instance;

    if ((instance as any).exports.main) {
      try {
        const res = (userMod.current.exports.main as CallableFunction)();
        onExecSuccess(execMain(res, userMod.current));
      } catch (e) {
        console.error(e);
        onExecFailure(e.toString());
      } finally {
        // close all active sockets
        const socks = allocatedSockets.splice(0, allocatedSockets.length);
        for (const sock of socks) {
          (vnetModule.current.exports.udp_unbind as CallableFunction)(sock);
        }
      }
    }
  });
};

// Evaluates the main function and returns the result array.
const evalMainFn = (module, expectedResultLen) => {
  const ptr = (module.exports.main as CallableFunction)();
  return new Uint8Array(module.exports.memory.buffer).slice(
    ptr,
    ptr + expectedResultLen
  );
};

export const evalIpHeaderWasm = (wasm, onExecSuccess, onExecFailure) => {
  let userMod = { current: null };

  const env = { report_error: report_error(userMod) };

  WebAssembly.instantiate(wasm, { env }).then((instance) => {
    userMod.current = instance; // this is not robust at all, fix this.

    if ((instance as any).exports.main) {
      try {
        onExecSuccess({ packet: evalMainFn(userMod.current, 20) });
      } catch (e) {
        console.error(e);
        onExecFailure(e.toString());
      }
    }
  });
};

export const evalUdpDatagramWasm = (wasm, onExecSuccess, onExecFailure) => {
  let userMod = { current: null };

  const env = { report_error: report_error(userMod) };

  WebAssembly.instantiate(wasm, { env }).then((instance) => {
    userMod.current = instance; // this is not robust at all, fix this.

    if ((instance as any).exports.main) {
      try {
        onExecSuccess({ packet: evalMainFn(userMod.current, 28) });
      } catch (e) {
        console.error(e);
        onExecFailure(e.toString());
      }
    }
  });
};

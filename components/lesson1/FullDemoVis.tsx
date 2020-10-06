import React, { useContext, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  createPlaygroundAction,
  receiveExecutionFailure,
  receiveExecutionSuccess,
  sendNetworkFrame,
} from "../../playground/actions";
import {
  PlaygroundContext,
  usePlaygroundSelector,
} from "../../playground/Playground";
import { evalFullDemoWasm } from "../../playground/lesson1/wasm";
import { GREEN, TEAL } from "../../playground/lesson1/colours";

import SimplePane from "../../playground/Output/SimplePane";
import { NetworkPacketsViewer } from "../network/NetworkPacketsViewer";
import * as selectors from "../../playground/selectors";

import VNetVisualize, { VNetInterface } from "../network/VirtualNetworkVis";

interface OutputProps {
  /**
   * Holds a ref to the network packets visualizer.
   */
  visRef: React.RefObject<VNetInterface>;
}

const Output: React.FC<OutputProps> = (props) => {
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
    { name: "10.0.0.1:1000", x: -100, y: -80, z: 0, colour: GREEN },
    { name: "Name server\n1.2.3.4:53", x: 100, y: 80, z: 0, colour: TEAL },
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

export const FullDemoVis: React.FC = () => {
  const dispatch = useDispatch();
  const { playgroundId } = useContext(PlaygroundContext);
  const sentPackets = usePlaygroundSelector(
    (state) => state.virtualNetwork.udpSent
  );
  const vnetModule = useRef(null);

  const generatedWasm = usePlaygroundSelector(
    (state) => state.output.compile.body
  );

  const visRef = useRef(null);

  useEffect(() => {
    // animate packets sending
    if (sentPackets.length > 0) {
      const lastSentPacket = sentPackets[sentPackets.length - 1];
      setTimeout(
        () => {
          visRef.current.emitPacket(
            lastSentPacket.ip.sourceIp,
            lastSentPacket.ip.destinationIp,
            sentPackets.length
          );
        },
        lastSentPacket.ip.sourceIp === "1.2.3.4" ? 1000 : 0
      );
    }
  }, [sentPackets]);

  // Initialise the virtual network module
  // TODO: move this code to a separate component
  useEffect(() => {
    // Dispatches each new sent network frame
    const notifyPacket = (res_ptr, len) => {
      const heap = new Uint8Array(vnetModule.current.exports.memory.buffer);
      const frame = heap.slice(res_ptr, res_ptr + len);

      dispatch(createPlaygroundAction(playgroundId, sendNetworkFrame(frame)));
    };

    WebAssembly.instantiateStreaming(fetch("/virtualnet.wasm"), {
      env: {
        notify_rx: (_res_ptr, _len) => {
          // ignore rx for now
        },
        notify_tx: notifyPacket,
        test_completed: () => {
          // not applicable
        },
        print_log: (ptr, size) => {
          const heap = new Uint8Array(vnetModule.current.exports.memory.buffer);

          let s = "";
          for (let i = ptr; i < ptr + size; ++i)
            s += String.fromCharCode(heap[i]);

          console.log(s);
        },
      },
    }).then((module) => {
      vnetModule.current = module.instance;
      //(vnetModule.current.exports.setup_network as CallableFunction)(true);
      vnetModule.current.exports.setup_network(true);
    });
  }, []);

  useEffect(() => {
    if (generatedWasm != null && vnetModule.current != null) {
      console.log("Use effect!", vnetModule.current);

      const onExecSuccess = (result) => {
        dispatch(
          createPlaygroundAction(playgroundId, receiveExecutionSuccess(result))
        );
      };
      const onExecFailure = (error) => {
        dispatch(
          createPlaygroundAction(playgroundId, receiveExecutionFailure(error))
        );
      };
      // Parse result of fn main() execution
      const execMain = (ipAddrResult, _mod) => {
        const resolvedIp = `${ipAddrResult & 0xff}.${
          (ipAddrResult >> 8) & 0xff
        }.${(ipAddrResult >> 16) & 0xff}.${(ipAddrResult >> 24) & 0xff}`;
        return { resolvedIp };
      };

      evalFullDemoWasm(
        generatedWasm,
        vnetModule.current,
        execMain,
        onExecSuccess,
        onExecFailure
      );
    }
  }, [generatedWasm, vnetModule]);

  return <Output visRef={visRef} />;
};

export default FullDemoVis;

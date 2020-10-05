import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { evalFullDemoWasm } from "../../playground/lesson1/wasm";
import { RED, GREEN, TEAL } from "../../playground/lesson1/colours";

import SimplePane from "../../playground/Output/SimplePane";
import { NetworkPacketsViewer } from "../network/NetworkPacketsViewer";
import * as selectors from "../../playground/selectors";
import { Test, TestsList, TestState } from "../Tests";
import SuccessAnimation, { SuccessAnimationState } from "../SuccessAnimation";
import { wrapFinalTestCode } from "../../playground/lesson1/rust";
import { FinalTest, markTestCompleted } from "../../playground/lesson1/actions";
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
    { name: "Alice:1000", x: 30, y: -180, z: 0, colour: RED },
  ];
  const links = [
    [0, 1],
    [0, 2],
  ];

  // add_node('Alice', { x: 30, y: -180, z: 0 }, RED); // 2
  // link_nodes([network_nodes[0], network_nodes[2]]);

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

export const FinalTestVis: React.FC = () => {
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
      let delay = 0;
      if (lastSentPacket.ip.sourceIp === "1.2.3.4") {
        delay = 1000;
      } else if (lastSentPacket.ip.destinationIp == "10.0.0.42") {
        delay = 2000;
      } else if (lastSentPacket.ip.sourceIp == "10.0.0.42") {
        delay = 3000;
      }
      setTimeout(() => {
        visRef.current.emitPacket(
          lastSentPacket.ip.sourceIp,
          lastSentPacket.ip.destinationIp,
          sentPackets.length
        );
      }, delay);
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
        notify_tx: notifyPacket,
        notify_rx: () => {
          // ignore notify_rx for now
        },
        test_completed: (testNum) => {
          console.log("Completed test!", testNum);
          dispatch(
            createPlaygroundAction(playgroundId, markTestCompleted(testNum))
          );
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
      (vnetModule.current.exports.setup_network as CallableFunction)(false); // mockDns = false
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
      const execMain = (resPtr, mod) => {
        // (vec_ptr, vec_len): (u32, u32)
        console.log(resPtr);
        const expectedStr = "Hello from Alice!";
        const vptr = new Uint32Array(mod.exports.memory.buffer).slice(
          resPtr / 4,
          resPtr / 4 + 2
        );
        console.log(vptr[0], vptr[1]);

        const bytes = new Uint8Array(mod.exports.memory.buffer).slice(
          vptr[0],
          vptr[0] + vptr[1]
        );
        const str = new TextDecoder("utf-8").decode(
          bytes.slice(0, expectedStr.length)
        );
        console.log(bytes, str);

        if (str == expectedStr) {
          // passed final test
          dispatch(
            createPlaygroundAction(
              playgroundId,
              markTestCompleted(FinalTest.RecvdMessage)
            )
          );
        }

        return {};
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

const FinalTestPlayground = () => {
  const testsState = useSelector(
    (state) => selectors.selectPlayground(state, "finalTest").tests
  );
  const [animState, setAnimState] = useState(SuccessAnimationState.Idle);

  const dismiss = () => {
    setAnimState(SuccessAnimationState.Dismiss);
    setTimeout(() => setAnimState(SuccessAnimationState.Idle), 500);
  };

  const allTestsPassed = Object.keys(testsState).every(
    (key) => testsState[key] == TestState.Completed
  );
  useEffect(() => {
    if (allTestsPassed) {
      setAnimState(SuccessAnimationState.Playing);
    }
  }, [allTestsPassed]);

  return (
    <>
      <TestsList>
        <Test state={testsState.SentDns}>
          Send a DNS request to <code>1.2.3.4:53</code>
        </Test>
        <Test state={testsState.SentMessage}>
          Send a message to Alice (port number <code>1000</code>)
        </Test>
        <Test state={testsState.RecvdMessage}>Return a message from Alice</Test>
      </TestsList>
      <Playground id="finalTest" codeWrapperFn={wrapFinalTestCode}>
        <SuccessAnimation state={animState} onClick={() => dismiss()} />
        <FinalTestVis />
      </Playground>
    </>
  );
};

export default FinalTestPlayground;

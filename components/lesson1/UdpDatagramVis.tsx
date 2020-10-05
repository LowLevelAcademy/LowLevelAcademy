import React, { useRef, useContext, useEffect, MutableRefObject } from "react";
import { useDispatch, useSelector } from "react-redux";
import HexEditor from "react-hex-editor";

import {
  createPlaygroundAction,
  receiveExecutionFailure,
  receiveExecutionSuccess,
} from "../../playground/actions";
import {
  PlaygroundContext,
  usePlaygroundSelector,
} from "../../playground/Playground";
import {
  decodeIpPacket,
  decodeUdp,
  getIpOffsetRange,
  getUdpOffsetRange,
} from "../../playground/reducers/virtualNetwork";
import * as selectors from "../../playground/selectors";

import {
  VisPacketHeader,
  VisIpPacketHeader,
  PacketTableVisProps,
} from "./IpPacketsVis";
import SimplePane from "../../playground/Output/SimplePane";
import { LOW_LVL_THEME } from "../network/ThemedHexViewer";
import { evalUdpDatagramWasm } from "../../playground/lesson1/wasm";
import { HexEditorHandle } from "react-hex-editor/dist/types";

export const VisUdpPacketHeader: React.FunctionComponent<PacketTableVisProps> = (
  props
) => {
  const highlight = props.highlight;
  const packet = props.packet;
  return (
    <>
      <tr>
        <td
          className="udp active"
          colSpan={4}
          onMouseOver={highlight("udp.sourcePort")}
        >
          Source port: {packet.udp.sourcePort}
        </td>
        <td
          className="udp active"
          colSpan={4}
          onMouseOver={highlight("udp.destinationPort")}
        >
          Destination port: {packet.udp.destinationPort}
        </td>
      </tr>
      <tr>
        <td
          className="udp active"
          colSpan={4}
          onMouseOver={highlight("udp.length")}
        >
          UDP length: {packet.udp.length}
        </td>
        <td
          className="udp active"
          colSpan={4}
          onMouseOver={highlight("udp.checksum")}
        >
          UDP checksum: 0x{packet.udp.checksum.toString(16).toUpperCase()}
        </td>
      </tr>
    </>
  );
};

export const UdpDatagramVis: React.FunctionComponent = (props) => {
  const hexEditorRef: MutableRefObject<HexEditorHandle> = useRef();
  const dispatch = useDispatch();
  const { playgroundId } = useContext(PlaygroundContext);

  const generatedWasm = usePlaygroundSelector(
    (state) => state.output.compile.body
  );

  useEffect(() => {
    if (generatedWasm != null) {
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

      evalUdpDatagramWasm(generatedWasm, onExecSuccess, onExecFailure);
    }
  }, [generatedWasm]);

  const somethingToShow = usePlaygroundSelector(selectors.getSomethingToShow);
  const formattedError = usePlaygroundSelector(selectors.formatError);
  const details = usePlaygroundSelector((state) => state.output.compile);
  let ipPacket = useSelector(
    (state) => selectors.selectCompileResults(state, playgroundId)?.packet
  );

  if (!somethingToShow) {
    return null;
  }

  const showErrors = formattedError != null && formattedError.length > 0;

  if (ipPacket) {
    const raw = Buffer.from(ipPacket);
    console.log(raw);
    const ip = decodeIpPacket(raw, 0);
    ipPacket = { ip, udp: decodeUdp(ip.data), raw };
  }

  const highlightSection = (section) => {
    let selRange;

    if (section && section.startsWith("udp.")) {
      section = section.slice(4);
      selRange = getUdpOffsetRange(section);

      if (selRange !== undefined) {
        // add IP data offset
        selRange[0] += 20;
        selRange[1] += 20;
      }
    } else {
      selRange = getIpOffsetRange(section);
    }

    if (hexEditorRef.current && selRange !== undefined) {
      hexEditorRef.current.setSelectionRange(selRange[0], selRange[1]);
    } else {
      hexEditorRef.current.setSelectionRange(0, 0);
    }
  };

  return (
    <div className="playground-packet-vis">
      <div
        className={
          "packet-vis-table-container " + (showErrors ? " d-none" : "")
        }
      >
        {ipPacket && (
          <VisPacketHeader
            packet={ipPacket}
            onHighlightSection={highlightSection}
          >
            <VisIpPacketHeader />
            <VisUdpPacketHeader />
          </VisPacketHeader>
        )}
      </div>
      <div className="playground-output-hex-view">
        <div className="output">
          <div className="output-body">
            {showErrors && (
              <SimplePane {...details} error={formattedError} kind="execute" />
            )}
            {!showErrors && ipPacket && (
              <div className="packet-vis-hex-view-container">
                <HexEditor
                  className="vnet-hex-editor"
                  showRowLabels={true}
                  readOnly={true}
                  showAscii={false}
                  theme={{ hexEditor: LOW_LVL_THEME }}
                  data={ipPacket.raw}
                  ref={hexEditorRef}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UdpDatagramVis;

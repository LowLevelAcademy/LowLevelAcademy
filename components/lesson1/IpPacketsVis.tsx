import React, {
  useContext,
  useCallback,
  useEffect,
  useRef,
  MutableRefObject,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import HexEditor from "react-hex-editor";

import { evalIpHeaderWasm } from "../../playground/lesson1/wasm";
import { LOW_LVL_THEME } from "../network/ThemedHexViewer";

import {
  createPlaygroundAction,
  receiveExecutionFailure,
  receiveExecutionSuccess,
} from "../../playground/actions";
import * as selectors from "../../playground/selectors";
import {
  decodeIpPacket,
  getIpOffsetRange,
  Packet,
  Protocol,
} from "../../playground/reducers/virtualNetwork";
import {
  PlaygroundContext,
  usePlaygroundSelector,
} from "../../playground/Playground";
import SimplePane from "../../playground/Output/SimplePane";
import { HexEditorHandle } from "react-hex-editor/dist/types";

export interface PacketTableVisProps {
  /**
   * A packet to be visualized.
   */
  packet?: Packet;
  /**
   * A callback that's invoked with a section that a user highlights on mouse over.
   */
  highlight?: (section: string) => any;
}

export const VisIpPacketHeader: React.FC<PacketTableVisProps> = (props) => {
  const highlight = props.highlight;
  const packet = props.packet;
  return (
    <>
      <tr>
        <td className="active" onMouseOver={highlight("version")}>
          Version: {packet.ip.version}
        </td>
        <td className="active" onMouseOver={highlight("ihl")}>
          Header length: {packet.ip.ihl}
        </td>
        <td colSpan={2} onMouseOver={highlight("typeOfService")}>
          Type of Service
        </td>
        <td
          colSpan={4}
          onMouseOver={highlight("totalLength")}
          className="active"
        >
          Total length: {packet.ip.length}
        </td>
      </tr>
      <tr>
        <td colSpan={4} onMouseOver={highlight("identification")}>
          Identification: 0x
          {packet.ip.identification.toString(16).toUpperCase()}
        </td>
        <td onMouseOver={highlight("flags")}>
          Flags: 0x{packet.ip.flags.toString(16)}
        </td>
        <td colSpan={3} onMouseOver={highlight("fragmentOffset")}>
          Fragment offset: {packet.ip.fragmentOffset}
        </td>
      </tr>
      <tr>
        <td colSpan={2} onMouseOver={highlight("ttl")}>
          Time to live (TTL): {packet.ip.ttl}
        </td>
        <td colSpan={2} onMouseOver={highlight("protocol")} className="active">
          Protocol: {packet.ip.protocol} ({Protocol[packet.ip.protocol]})
        </td>
        <td colSpan={4} onMouseOver={highlight("checksum")} className="active">
          Header checksum: 0x{packet.ip.checksum.toString(16).toUpperCase()}
        </td>
      </tr>
      <tr>
        <td colSpan={8} onMouseOver={highlight("sourceIp")} className="active">
          Source IP address: {packet.ip.sourceIp}
        </td>
      </tr>
      <tr>
        <td
          colSpan={8}
          onMouseOver={highlight("destinationIp")}
          className="active"
        >
          Destination IP address: {packet.ip.destinationIp}
        </td>
      </tr>
    </>
  );
};

export interface VisPacketHeaderProps {
  /**
   * Network packet to be visualized.
   */
  packet: Packet;
  /**
   * Callback that's invoked when a user highlights a section of the table.
   */
  onHighlightSection: (section: string) => void;
}

export const VisPacketHeader: React.FC<VisPacketHeaderProps> = (props) => {
  const packet = props.packet;

  const highlight = useCallback(
    (section) => () => props.onHighlightSection(section),
    [props.onHighlightSection]
  );

  // each table cell is 4 bytes, colSpan is multiple of 4
  return (
    <table className="ip-packet-vis" onMouseLeave={highlight(null)}>
      <thead>
        <tr>
          <td colSpan={2}>
            <a title="column size in bits">0</a>
          </td>
          <td colSpan={2} className="text-right">
            <a title="column size in bits">15</a>
          </td>
          <td colSpan={2}>
            <a title="column size in bits">16</a>
          </td>
          <td colSpan={2} className="text-right">
            <a title="column size in bits">31</a>
          </td>
        </tr>
      </thead>
      <tbody>
        {React.Children.map(props.children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { highlight, packet });
          }
          return child;
        })}
      </tbody>
    </table>
  );
};

export const IpPacketsVis: React.FC = () => {
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

      evalIpHeaderWasm(generatedWasm, onExecSuccess, onExecFailure);
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
    ipPacket = { ip: decodeIpPacket(raw, 0), raw };
  }

  const highlightSection = (section) => {
    const selRange = getIpOffsetRange(section);
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

export default IpPacketsVis;

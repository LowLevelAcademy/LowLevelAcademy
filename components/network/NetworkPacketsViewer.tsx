// Component to visualize a list of network packets with a contents viewer.

import React, { Fragment, MutableRefObject } from "react";
import HexEditor from "react-hex-editor";
import { HexEditorHandle } from "react-hex-editor/dist/types";

import { LOW_LVL_THEME } from "../../components/network/ThemedHexViewer";
import { NetworkPackets } from "./NetworkPacketsTree";

export const NetworkPacketsViewer: React.FC<any> = (props) => {
  const [selectedPacket, setSelectedPacket] = React.useState(0);
  const hexEditorRef: MutableRefObject<HexEditorHandle> = React.useRef();

  let sentPackets = props.packets;

  const handleSelect = (_event, nodeId) => {
    console.log(nodeId);
    if (hexEditorRef.current != null) {
      // highlight the selected packet data
      const packetId = nodeId.toString().split(".")[0];
      const packetType = nodeId.toString().split(".")[1];

      // FIXME: add this function to the packet prototype
      let selRange = null;
      switch (packetType) {
        case "ip":
          selRange = [14, 34];
          break;
        case "ip_src":
          selRange = [26, 26 + 4];
          break;
        case "ip_dst":
          selRange = [30, 30 + 4];
          break;
        case "udp":
          selRange = [34, 34 + sentPackets[packetId].udp.length];
          break;
        case "udp_src_port":
          selRange = [34, 34 + 2];
          break;
        case "udp_dst_port":
          selRange = [36, 36 + 2];
          break;
        case "udp_len":
          selRange = [38, 38 + 2];
          break;
        case "udp_payload":
          selRange = [42, 42 + sentPackets[packetId].udp.length];
          break;
        case "icmp":
          selRange = [34, 34 + sentPackets[packetId].ip.length];
          break;
        case "icmp_type":
          selRange = [34, 34 + 1];
          break;
        case "icmp_code":
          selRange = [35, 35 + 1];
          break;
      }
      if (selRange != null) {
        hexEditorRef.current.setSelectionRange(selRange[0], selRange[1]);
      }
    }
    setSelectedPacket(nodeId);
  };

  let visualizePacket;
  if (selectedPacket !== null && sentPackets.length > 0) {
    const packetId = selectedPacket.toString().split(".")[0];
    const packetData = sentPackets[packetId];

    visualizePacket = (
      <HexEditor
        className="vnet-hex-editor"
        showRowLabels={true}
        readOnly={true}
        showAscii={true}
        theme={{ hexEditor: LOW_LVL_THEME }}
        data={packetData.raw}
        ref={hexEditorRef}
      />
    );
  } else {
    visualizePacket = <div>No packet selected</div>;
  }

  return (
    <Fragment>
      <div className="vnet-packet-tree">
        <NetworkPackets packets={sentPackets} onPacketSelect={handleSelect} />
      </div>
      <div className="vnet-hex-editor-container">{visualizePacket}</div>
    </Fragment>
  );
};

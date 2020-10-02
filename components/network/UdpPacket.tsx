import React from "react";
import { NetworkPacketProps } from "./NetworkPacket";
import { StyledTreeItem } from "./StyledTreeItem";

export const UdpPacket: React.FunctionComponent<NetworkPacketProps> = (
  props
) => {
  const packet = props.packet;
  const num = props.num;

  const payload = Array.from(packet.udp.data);
  const payloadStr =
    payload.length > 10
      ? [...payload.slice(0, 10), "..."].toString()
      : payload.toString();

  return (
    <StyledTreeItem
      nodeId={num + ".udp"}
      label={`User Datagram Protocol, Src Port: ${packet.udp.sourcePort}, Dst Port: ${packet.udp.destinationPort}`}
    >
      <StyledTreeItem
        nodeId={num + ".udp_src_port"}
        label={`Source Port: ${packet.udp.sourcePort}`}
      />
      <StyledTreeItem
        nodeId={num + ".udp_dst_port"}
        label={`Destination Port: ${packet.udp.destinationPort}`}
      />
      <StyledTreeItem
        nodeId={num + ".udp_len"}
        label={`Length: ${packet.udp.length}`}
      />
      <StyledTreeItem
        nodeId={num + ".udp_payload"}
        label={`Payload: [${payloadStr}]`}
      />
    </StyledTreeItem>
  );
};

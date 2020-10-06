//! Component to visualize a single network packet.

import React from "react";
import { Packet } from "../../playground/reducers/virtualNetwork";
import { IcmpPacket } from "./IcmpPacket";
import { StyledTreeItem } from "./StyledTreeItem";
import { UdpPacket } from "./UdpPacket";

export interface NetworkPacketProps {
  /**
   * Packet representation
   */
  packet: Packet;
  /**
   * Packet number
   */
  num: number;
}

export const NetworkPacket: React.FC<NetworkPacketProps> = (props) => {
  const packet = props.packet;
  const num = props.num;

  const srcAddr = `${packet.ip.sourceIp}${
    packet.udp ? ":" + packet.udp.sourcePort : ""
  }`;
  const dstAddr = `${packet.ip.destinationIp}${
    packet.udp ? ":" + packet.udp.destinationPort : ""
  }`;

  return (
    <StyledTreeItem
      nodeId={num.toString()}
      label={`Frame #${num + 1}, ${srcAddr} -> ${dstAddr}, ${
        packet.raw.length
      } bytes`}
    >
      <StyledTreeItem
        nodeId={num + ".ip"}
        label={`Internet Protocol v4, Src: ${packet.ip.sourceIp}, Dst: ${packet.ip.destinationIp}`}
      >
        <StyledTreeItem
          nodeId={num + ".ip_src"}
          label={`Source: ${packet.ip.sourceIp}`}
        />
        <StyledTreeItem
          nodeId={num + ".ip_dst"}
          label={`Destination: ${packet.ip.destinationIp}`}
        />
      </StyledTreeItem>
      {packet.type == "udp" && <UdpPacket {...props} />}
      {packet.type == "icmp" && <IcmpPacket {...props} />}
    </StyledTreeItem>
  );
};

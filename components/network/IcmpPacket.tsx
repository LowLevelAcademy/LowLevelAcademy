import React from "react";

import { convertIcmpTypeToStr } from "../../playground/reducers/virtualNetwork";
import { NetworkPacketProps } from "./NetworkPacket";
import { StyledTreeItem } from "./StyledTreeItem";

export const IcmpPacket: React.FC<NetworkPacketProps> = (props) => {
  const packet = props.packet;
  const num = props.num;

  const [typeStr, codeStr] = convertIcmpTypeToStr(
    packet.icmp.type,
    packet.icmp.code
  );

  return (
    <StyledTreeItem
      nodeId={num + ".icmp"}
      label={`Internet Control Message Protocol (${packet.icmp.type} = ${typeStr})`}
    >
      <StyledTreeItem
        nodeId={num + ".icmp_type"}
        label={`Type: ${packet.icmp.type} (${typeStr})`}
      />
      <StyledTreeItem
        nodeId={num + ".icmp_code"}
        label={`Code: ${packet.icmp.code} (${codeStr})`}
      />
    </StyledTreeItem>
  );
};

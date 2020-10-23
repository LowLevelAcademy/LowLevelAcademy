// TODO: move this module to a separate self-contained component

import { Action, ActionType } from "../actions";
import { Buffer } from "buffer";

export enum Protocol {
  UDP = 17, // UDP proto number in the IP header
  ICMP = 1, // ICMP proto number in the IP header
  IGMP = 2,
  TCP = 6,
  HopByHop = 0,
}

export const convertIcmpTypeToStr = (type, code) => {
  switch (type) {
    case 3:
      const ty = "destination unreachable";
      switch (code) {
        case 0:
          return [ty, "network unreachable"];
        case 1:
          return [ty, "host unreachable"];
        case 2:
          return [ty, "protocol unreachable"];
        case 3:
          return [ty, "port unreachable"];
        default:
          return [ty, null];
      }
    case 0:
      return ["echo reply", null];
    case 8:
      return ["echo request", null];
    case 11:
      return ["time exceeded", null];
    case 12:
      return ["parameter problem", null];
    default:
      return null;
  }
};

const DEFAULT = {
  udpSent: [],
};

function decodeIp(buf, offset) {
  return (
    buf[offset] +
    "." +
    buf[offset + 1] +
    "." +
    buf[offset + 2] +
    "." +
    buf[offset + 3]
  );
}

export const getIpOffsetRange = (field: string) => {
  switch (field) {
    case "version":
      return [0, 1];
    case "ihl":
      return [0, 1];
    case "typeOfService":
      return [1, 2];
    case "totalLength":
      return [2, 4];
    case "identification":
      return [4, 6];
    case "flags":
      return [6, 7];
    case "fragmentOffset":
      return [6, 8];
    case "ttl":
      return [8, 9];
    case "protocol":
      return [9, 10];
    case "checksum":
      return [10, 12];
    case "sourceIp":
      return [12, 16];
    case "destinationIp":
      return [16, 20];
    default:
      return undefined;
  }
};

export const getUdpOffsetRange = (field: string) => {
  switch (field) {
    case "sourcePort":
      return [0, 2];
    case "destinationPort":
      return [2, 4];
    case "length":
      return [4, 6];
    case "checksum":
      return [6, 8];
    default:
      return undefined;
  }
};

export interface IpPacket {
  version: number;
  ihl: number;
  dscp: number;
  ecn: number;
  length: number;
  identification: number;
  flags: number;
  fragmentOffset: number;
  ttl: number;
  protocol: number;
  checksum: number;
  sourceIp: string;
  destinationIp: string;
  data: any;
}

// Decode IP packet header
export const decodeIpPacket = function (buf, offset): IpPacket {
  if (!offset) offset = 0;

  var version = buf[offset] >> 4;
  if (version !== 4) throw new Error("Currently only IPv4 is supported");
  var ihl = buf[offset] & 15;
  if (ihl > 5) throw new Error("Currently only IHL <= 5 is supported");
  var length = buf.readUInt16BE(offset + 2);
  var decodedChecksum = buf.readUInt16BE(offset + 10);

  // decodeIpPacket.bytes = length;
  return {
    version: version,
    ihl: ihl,
    dscp: buf[offset + 1] >> 2,
    ecn: buf[offset + 1] & 3,
    length: length,
    identification: buf.readUInt16BE(offset + 4),
    flags: buf[offset + 6] >> 5,
    fragmentOffset: buf.readUInt16BE(offset + 6) & 8191,
    ttl: buf[offset + 8],
    protocol: buf[offset + 9],
    checksum: decodedChecksum,
    sourceIp: decodeIp(buf, offset + 12),
    destinationIp: decodeIp(buf, offset + 16),
    data: buf.slice(offset + 20, offset + length),
  };
};

export const decodeUdp = function (buf) {
  const len = buf.readUInt16BE(4);
  return {
    sourcePort: buf.readUInt16BE(0),
    destinationPort: buf.readUInt16BE(2),
    length: len,
    checksum: buf.readUInt16BE(6),
    data: buf.slice(8, len),
  };
};

const decodeIcmp = function (buf) {
  const type = buf.readUInt8(0);
  const code = buf.readUInt8(1);
  const checksum = buf.readUInt16BE(2);

  return {
    type,
    code,
    checksum,
  };
};

// FIXME: use proper types here.
export interface Packet {
  type?: string; // TODO: use ip.protocol instead?
  raw?: any;
  ip?: IpPacket;
  udp?: any;
  icmp?: any;
}

export const decodePacket = (rawPacket) => {
  const rawPacketBuf = Buffer.from(rawPacket);
  const ethernetType = rawPacketBuf.readUInt16BE(12);

  if (ethernetType != 0x0800) {
    // not an IPv4 packet, ignore
    return undefined;
  }

  const ipPacket = decodeIpPacket(rawPacketBuf, 14);

  // Decode packet into components
  const packet: Packet = {
    ip: ipPacket,
    raw: rawPacket,
  };

  switch (ipPacket.protocol) {
    case Protocol.UDP:
      {
        const udp = decodeUdp(Buffer.from(ipPacket.data));
        // console.log("Raw:", rawPacket, "IP: ", ipPacket, "UDP: ", udp);

        packet.type = "udp";
        packet.udp = udp;
      }
      break;

    case Protocol.ICMP:
      {
        const icmp = decodeIcmp(Buffer.from(ipPacket.data));
        console.log("Raw:", rawPacket, "IP: ", ipPacket, "ICMP: ", icmp);

        packet.type = "icmp";
        packet.icmp = icmp;
      }
      break;

    default:
      console.error("unknown protocol ", ipPacket.protocol);
      break;
  }

  return packet;
};

export default function virtualNetworkReducer(state = DEFAULT, action: Action) {
  switch (action.type) {
    case ActionType.SendNetworkFrame: {
      const packet = decodePacket(action.frame);
      if (typeof packet === "undefined") {
        return state;
      }
      return { ...state, udpSent: [...state.udpSent, packet] };
    }

    default:
      return state;
  }
}

import React from "react";
import styles from "./Fragmentation.module.scss";

export const SplitIpPacket = (props) => {
  return (
    <div className={styles.splitIpPacket}>
      <div>Packet ({props.size * 1024} bytes)</div>
      <div className={styles.tableIdentification}>
        Identification: {props.identification}
      </div>
      <div className={styles.tableFragmentOffset}>Offset: {props.offset}</div>
      <div className={styles.tableFlags}>Flags: {props.flags}</div>
    </div>
  );
};

export default SplitIpPacket;

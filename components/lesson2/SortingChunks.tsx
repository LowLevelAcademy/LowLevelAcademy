import { motion, useCycle } from "framer-motion";
import React from "react";

import HeaderButton from "../../playground/HeaderButton";
import {
  SegmentedButton,
  SegmentedButtonSet,
} from "../../playground/SegmentedButton";
import { HeaderSet } from "../../playground/Header";
import {
  BLUE,
  DARK_GREY,
  GREEN,
  RED,
  TEAL,
} from "../../playground/lesson1/colours";

import styles from "./Sequencing.module.scss";

const SHUFFLED_PACKETS = [3, 1, 2, 5, 4];

const SORTED_PACKETS = Array.from(SHUFFLED_PACKETS);
SORTED_PACKETS.sort();

export const SortingChunks = () => {
  const [receivedPackets, reorderPackets] = useCycle(
    SHUFFLED_PACKETS,
    SORTED_PACKETS
  );
  const colours = [DARK_GREY, BLUE, RED, GREEN, TEAL];

  return (
    <div className={styles.orderedPackets}>
      <div className={"header " + styles.orderedPacketsHeader}>
        <HeaderSet id="build">
          <SegmentedButtonSet>
            <SegmentedButton isBuild onClick={() => reorderPackets()}>
              <HeaderButton>
                {receivedPackets == SHUFFLED_PACKETS
                  ? "Reorder Packets"
                  : "Reset"}
              </HeaderButton>
            </SegmentedButton>
          </SegmentedButtonSet>
        </HeaderSet>
      </div>
      <div>
        {receivedPackets.map((packet) => (
          <motion.div
            className={styles.packet}
            style={{
              backgroundColor: colours[(packet - 1) % 5],
            }}
            key={packet}
            layout={true}
          >
            {packet}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

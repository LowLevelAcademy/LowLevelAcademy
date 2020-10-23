import React, { useState } from "react";
import Slider from "@material-ui/core/Slider";
import { withStyles } from "@material-ui/core/styles";
import styles from "./Fragmentation.module.scss";

import SplitIpPacket from "./SplitIpPacket";

const SIZE_MARKS = [
  {
    value: 0.5,
    label: "0.5 KB",
  },
  {
    value: 8,
    label: "8 KB",
  },
  {
    value: 16,
    label: "16 KB",
  },
];

const GreenSlider = withStyles({
  root: {
    color: "#39be78",
    height: 8,
  },
  thumb: {
    height: 16,
    width: 16,
    backgroundColor: "#fff",
    border: "2px solid currentColor",
    marginTop: -6,
    marginLeft: -8,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit",
    },
  },
  active: {},
  track: {
    height: 4,
    borderRadius: 4,
  },
  rail: {
    height: 4,
    borderRadius: 4,
  },
})(Slider);

export const MtuSlider = (props) => {
  const [mtu, setMtu] = useState(1.5);

  const handleChange = (_event, newValue) => {
    setMtu(newValue);
  };

  let remainingSize = 16;
  const splitPackets = [];

  while (remainingSize > 0) {
    splitPackets.push(Math.min(mtu, remainingSize));
    remainingSize -= mtu;
  }

  return (
    <>
      <div className={styles.mtu_block}>
        <div suppressHydrationWarning={true}>
          {process.browser && (
            <GreenSlider
              defaultValue={1.5}
              getAriaValueText={(value) => value + " KB"}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="auto"
              step={0.5}
              onChange={handleChange}
              min={0.5}
              max={16}
              marks={SIZE_MARKS}
            />
          )}
        </div>
        {splitPackets.map((packet, ident) => (
          <SplitIpPacket
            key={ident}
            size={packet}
            identification={ident}
            offset={ident * mtu * 1024}
            flags={ident == splitPackets.length - 1 ? "none" : "fragmented"}
          />
        ))}
      </div>
    </>
  );
};

export default MtuSlider;

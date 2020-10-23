import React, { useCallback, useRef } from "react";
import shuffle from "lodash/shuffle";
import { GREEN, RED, TEAL, DARK_GREY } from "../../playground/lesson1/colours";
import VNetVisualize from "../network/VirtualNetworkVis";

import HeaderButton from "../../playground/HeaderButton";
import {
  SegmentedButton,
  SegmentedButtonSet,
} from "../../playground/SegmentedButton";
import { HeaderSet } from "../../playground/Header";

export const OutOfOrderDeliveryPlayground = () => {
  const visRef = useRef(null);

  const nodes = [
    { name: "You", x: -200, y: 80, z: 0, colour: GREEN },
    {
      name: "Your\nInternet provider",
      x: -100,
      y: -80,
      z: 0,
      colour: DARK_GREY,
    },
    {
      name: "Alice's\nInternet provider",
      x: 50,
      y: -80,
      z: 0,
      colour: DARK_GREY,
    },
    { name: "Alice", x: 150, y: 80, z: 0, colour: GREEN },
  ];
  const links = [
    [0, 1],
    [1, 2],
    [2, 3],
  ];

  const sendPackets = useCallback(() => {
    const speed = 1.25;
    const packetGroup = [
      [0, DARK_GREY],
      [200, TEAL],
      [400, RED],
    ];
    const microDelays = [0, 600, 1200];
    const randomDelays = shuffle(microDelays);
    const size = 12;

    const randomMicroDelay = (idx) => {
      const delay = randomDelays[idx];
      if (delay == 0) {
        return Promise.resolve();
      } else {
        return new Promise((resolve) => setTimeout(resolve, delay));
      }
    };

    packetGroup.forEach(([delay, colour], idx) => {
      setTimeout(() => {
        visRef.current
          .emitPacket(
            visRef.current.getLink(0),
            false,
            idx + 1,
            speed,
            colour,
            size
          )
          .then(() => randomMicroDelay(idx))
          .then(() =>
            visRef.current.emitPacket(
              visRef.current.getLink(1),
              false,
              idx + 1,
              speed,
              colour,
              size
            )
          )
          .then(() => randomMicroDelay(idx))
          .then(() =>
            visRef.current.emitPacket(
              visRef.current.getLink(2),
              false,
              idx + 1,
              speed,
              colour,
              size
            )
          );
      }, delay);
    });
  }, []);

  return (
    <>
      <div className="header" style={{ textAlign: "center", margin: "0 auto" }}>
        <HeaderSet id="build">
          <SegmentedButtonSet>
            <SegmentedButton isBuild onClick={sendPackets}>
              <HeaderButton>Send Packets</HeaderButton>
            </SegmentedButton>
          </SegmentedButtonSet>
        </HeaderSet>
      </div>
      <VNetVisualize nodes={nodes} links={links} ref={visRef} />
    </>
  );
};

import React, { useState } from "react";

import styles from "./SplittingPackets.module.scss";

const valueToColor = (type, value) => {
  switch (type) {
    case "A":
      return `rgba(0, 0, 0, ${value / 255})`;

    case "R":
      return `rgb(${value}, 0, 0)`;

    case "G":
      return `rgb(0, ${value}, 0)`;

    case "B":
      return `rgb(0, 0, ${value})`;
  }
};

const ColorComponent = (props) => {
  return (
    <div className={styles.colorComponent}>
      <input
        type="text"
        className={styles.colorInput}
        value={props.value}
        onChange={props.onChange}
      />
      <div
        className={styles.colorBlock}
        style={{ background: valueToColor(props.type, props.value) }}
      >
        {props.type}
      </div>
    </div>
  );
};

const CombinedColorComponent = (props) => {
  const rgba = [props.red, props.green, props.blue, props.alpha / 255];

  return (
    <div
      className={styles.colorComponent + " " + styles.colorComponentCombined}
    >
      <div
        className={styles.colorBlock}
        style={{
          background: `rgba(${rgba.join(",")})`,
        }}
      />
    </div>
  );
};

export const ColorCoding = () => {
  const [red, setRed] = useState(200);
  const [green, setGreen] = useState(100);
  const [blue, setBlue] = useState(150);
  const [alpha, setAlpha] = useState(255);

  const changeColor = (changeFn) => {
    return (ev) => {
      const color = parseInt(ev.target.value, 10);
      if (!Number.isNaN(color)) {
        changeFn(Math.min(Math.max(color, 0), 255));
      }
    };
  };

  return (
    <div className={styles.colorCoding}>
      <div className={styles.colorComponents}>
        <ColorComponent type="R" value={red} onChange={changeColor(setRed)} />
        <ColorComponent
          type="G"
          value={green}
          onChange={changeColor(setGreen)}
        />
        <ColorComponent type="B" value={blue} onChange={changeColor(setBlue)} />
        <ColorComponent
          type="A"
          value={alpha}
          onChange={changeColor(setAlpha)}
        />
      </div>
      <CombinedColorComponent
        red={red}
        green={green}
        blue={blue}
        alpha={alpha}
      />
    </div>
  );
};

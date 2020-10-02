import React, { useEffect, useRef } from "react";
import Zdog from "zdog";

const TAU = Zdog.TAU;

const size = 40;
const bokeh_steps = 24;

// ------------------

let animation = false;

const createCheck = (addTo) =>
  new Zdog.Shape({
    addTo,
    path: [
      { x: -size * 1, y: -size * 0.125 }, // start left
      { x: -size * 0.125, y: size * 0.625 },
      { x: size * 1, y: -size * 0.875 }, // start right
    ],
    stroke: 0.75 * size,
    closed: false,
    fill: false,
    color: "rgba(57, 190, 120, 0)",
  });

const createBokeh = (addTo) =>
  new Zdog.Ellipse({
    addTo,
    diameter: size * 0.2,
    fill: true,
    color: "rgba(57,190,120,0)",
  });

function createBokehSet(illo) {
  const bokeh_set = [];

  for (let i = 0; i < bokeh_steps; i++) {
    const b = createBokeh(illo);
    b.opacity = 0;
    b.explosion_progress = 0;
    b.step = i;
    b.translate.x = 0 + size * Math.cos((TAU * i) / bokeh_steps);
    b.translate.y = 0 + size * Math.sin((TAU * i) / bokeh_steps);

    bokeh_set.push(b);
  }

  return bokeh_set;
}

function explodeBokeh(bokehSet) {
  bokehSet.forEach((b) => {
    b.opacity += (2 - b.opacity) / 30;
    let even_factor = 0;
    if (b.step % 2) {
      even_factor = size * 0.4;
    }
    b.explosion_progress += (1 - b.explosion_progress) / 20;
    b.translate.x =
      0 +
      (size * 2 * (even_factor / 16) + b.explosion_progress * (size * 3.5)) *
        Math.cos((TAU * b.step) / bokeh_steps);
    b.translate.y =
      0 +
      (size * 2 * (even_factor / 16) + b.explosion_progress * (size * 3.5)) *
        Math.sin((TAU * b.step) / bokeh_steps);
    b.color =
      "rgba(57,190,120," + Math.sin(b.opacity * 2 + even_factor / 8) + ")";
  });
}

function checkBeatIn(frame, illo, check, bokehSet) {
  const progress = frame / 50;
  const rot = Zdog.easeInOut(progress, 3);
  check.opacity = Zdog.easeInOut(frame / 40, 3);
  check.color = "rgba(57,190,120," + check.opacity + ")";
  check.rotate.y = rot * TAU;
  illo.zoom = check.opacity;
  if (check.opacity > 0.5) {
    explodeBokeh(bokehSet);
  }
}

const triggerAnimation = (canvasElement) => {
  const illo = new Zdog.Illustration({
    element: canvasElement,
    resize: true,
    zoom: 1,
  });

  const bokehSet = createBokehSet(illo);

  const check = createCheck(illo);
  check.color = "rgba(57, 190, 120, 0)";
  check.opacity = 0;
  animation = true;

  animate(0, illo, bokehSet, check);

  illo.updateRenderGraph();
};

function animate(frame, illo, bokehSet, check) {
  if (frame < 1000 && animation == true) {
    checkBeatIn(frame, illo, check, bokehSet);
  }

  illo.updateRenderGraph();

  if (frame < 1500) {
    requestAnimationFrame(animate.bind(this, frame + 1, illo, bokehSet, check));
  }
}

export enum SuccessAnimationState {
  Idle = "idle",
  Dismiss = "dismiss",
  Playing = "playing",
}

export const SuccessAnimation = (props) => {
  const canvasRef = useRef();
  const containerRef = useRef();

  const animState = props.state;

  useEffect(() => {
    if (animState == SuccessAnimationState.Playing && canvasRef.current) {
      containerRef.current.style.opacity = 1.0;
      triggerAnimation(canvasRef.current);
    } else if (
      animState == SuccessAnimationState.Dismiss &&
      containerRef.current
    ) {
      containerRef.current.style.opacity = 0.0;
    }
  }, [canvasRef, animState]);

  return animState == SuccessAnimationState.Idle ? null : (
    <div
      className="playground-success-animation"
      ref={containerRef}
      onClick={props.onClick}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default SuccessAnimation;

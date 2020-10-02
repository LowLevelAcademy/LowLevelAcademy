import React, { useEffect, useRef, useState } from "react";
import Zdog from "zdog";

const TAU = Zdog.TAU;

const particles = [];
const lines = 4;
const particle_gap = 42; // Particle gap in pixels
const normalization_window = -50; // Alignment area X relatively to the canvas center

const DARK_GREY = "rgba(55,66,70,1)"; // #374246
const GREEN = "rgba(57,190,120,1)"; // #39be78

let zooming = true;
const to_zoom = false;
const max_zoom = 2;

const primitives = [];
let pid = 0;
let frame = 0;
let animation_speed_factor = 12;

const rect = new Zdog.Rect({
  width: 17,
  height: 17,
  stroke: 6,
  fill: true,
  color: DARK_GREY,
});
rect.type = "rect";
primitives.push(rect);

const ellipse = new Zdog.Ellipse({
  diameter: 17,
  stroke: 6,
  fill: true,
  color: DARK_GREY,
});
ellipse.type = "ellipse";
primitives.push(ellipse);

const box = new Zdog.Box({
  width: 20,
  height: 20,
  depth: 20,
  stroke: 0,
  fill: true,
  leftFace: DARK_GREY,
  rightFace: DARK_GREY,
  topFace: GREEN,
  bottomFace: GREEN,
});
box.type = "box";
primitives.push(box);

const cylinder = new Zdog.Cylinder({
  diameter: 20,
  length: 20,
  stroke: false,
  color: DARK_GREY,
  frontFace: GREEN,
  backface: GREEN,
});
cylinder.type = "cylinder";
primitives.push(cylinder);

function getRandomPrimitive() {
  pid++;
  const proto = primitives[Math.floor(Math.random() * primitives.length)];
  const np = proto.copy();
  np.type = proto.type;
  np.rotate.x = Math.random() * TAU;
  np.rotate.y = Math.random() * TAU;
  np.rotate.z = Math.random() * TAU;
  np.id = pid;
  np.speed = 1;
  return np;
}

function randomInterval(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function getLeftBorder(illo) {
  return -(illo.width / 2);
}

function getRightBorder(illo) {
  return illo.width / 2;
}

function getLineTopBorder(lineno, canvasheight) {
  const lineheight = canvasheight / lines;
  const canvastop = -(canvasheight / 2);
  return canvastop + lineno * lineheight;
}

function getLineBottomBorder(lineno, canvasheight) {
  const lineheight = canvasheight / lines;
  const canvastop = -(canvasheight / 2);
  return canvastop + lineno * lineheight + lineheight;
}

function getLineCenter(lineno, canvasheight) {
  const lineheight = canvasheight / lines;
  const canvastop = -(canvasheight / 2);
  return canvastop + lineno * lineheight + lineheight / 2;
}

function rotateToNearestAngle(pos, speed) {
  pos = pos % TAU;
  if (pos > TAU / 2) {
    const distance = pos - TAU / 2;
    pos -= (speed + distance / 12) * animation_speed_factor;
  }
  if (pos < TAU / 2) {
    const distance = TAU / 2 - pos;
    pos += (speed + distance / 12) * animation_speed_factor;
  }
  return pos;
}

function emitNewParticles(illo, left) {
  for (let line = 0; line < lines; line++) {
    const new_particle = getRandomPrimitive();
    const xoffset = randomInterval(-28, 28);
    const linetop = getLineTopBorder(line, illo.height);
    const linebottom = getLineBottomBorder(line, illo.height);
    new_particle.xoffset = xoffset;
    new_particle.line = line;
    new_particle.translate.x = left - (35 + xoffset);
    new_particle.translate.y = randomInterval(linetop + 16, linebottom - 16);
    illo.addChild(new_particle);
    particles.push(new_particle);
  }
}

interface State {
  illo?: any;
  pausing: boolean;
}

function animate(state: State) {
  const { illo, pausing } = state;
  frame++;

  if (frame < 90 || (!pausing && animation_speed_factor > 1.01)) {
    animation_speed_factor -= Math.log(frame) / 28;
  } else if (frame < 90 || (!pausing && animation_speed_factor <= 1.01)) {
    animation_speed_factor += 0.02;
  }

  if (frame > 90 && pausing) {
    animation_speed_factor -= 0.02;
    if (animation_speed_factor < 0) {
      animation_speed_factor = 0;
    }
  }

  const left = getLeftBorder(illo);
  const right = getRightBorder(illo);

  if (!particles.length) {
    emitNewParticles(illo, left);
  } else {
    const last_particle = particles[particles.length - 1];
    const last_particle_x = last_particle.translate.x + last_particle.xoffset;
    if (last_particle_x > left + particle_gap) {
      emitNewParticles(illo, left);
    }
  }

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    if (particle.translate.x > right + 200) {
      particles.splice(i, 1);
      illo.removeChild(particle);
      continue;
    }
    // ↓ If the particle is in the alignment area, then providing “right momentum” to the trajectory
    if (particle.translate.x > normalization_window) {
      const line_center = getLineCenter(particle.line, illo.height);
      if (particle.translate.y > line_center) {
        particle.translate.y -= 0.1 * animation_speed_factor;
      }
      if (particle.translate.y < line_center) {
        particle.translate.y += 0.1 * animation_speed_factor;
      }

      particle.rotate.x = rotateToNearestAngle(particle.rotate.x, 0.02);
      particle.rotate.y = rotateToNearestAngle(particle.rotate.y, 0.02);
      particle.rotate.z = rotateToNearestAngle(particle.rotate.z, 0.02);

      if (particle.xoffset > 0) {
        particle.translate.x +=
          (0.08 + particle.xoffset / 40) * animation_speed_factor;
        particle.xoffset -=
          (0.08 + particle.xoffset / 40) * animation_speed_factor;
      }
      if (particle.xoffset < 0) {
        particle.translate.x -=
          (0.08 - particle.xoffset / 40) * animation_speed_factor;
        particle.xoffset +=
          (0.08 - particle.xoffset / 40) * animation_speed_factor;
      }
    } else {
      particle.rotate.y += 0.004 * animation_speed_factor;
      particle.rotate.x += 0.004 * animation_speed_factor;
      particle.rotate.z += 0.004 * animation_speed_factor;
    }
    particle.translate.x += animation_speed_factor;
  }

  if (to_zoom) {
    if (zooming) {
      illo.zoom += 0.0005;
      if (illo.zoom > max_zoom) {
        zooming = false;
      }
    } else {
      illo.zoom -= 0.0005;
      if (illo.zoom <= 1) {
        zooming = true;
      }
    }
    if (illo.zoom.toFixed(2) % 0.5 == 0) {
      console.log("Zoom: " + illo.zoom.toFixed(2));
    }
  }

  illo.updateRenderGraph();

  requestAnimationFrame(animate.bind(this, state));
}

const ModuleHeaderAnimation: React.FunctionComponent = () => {
  const state: React.MutableRefObject<State> = useRef({
    illo: null,
    pausing: false,
  });
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      state.current.illo = new Zdog.Illustration({
        element: ".zdog-canvas",
        resize: true,
      });

      animate(state.current);
    }
  }, [canvasRef]);

  const setAnimationPaused = (val) => {
    state.current.pausing = val;
  };

  return (
    <canvas
      id="zdog-canvas"
      onMouseOver={() => setAnimationPaused(true)}
      onMouseOut={() => setAnimationPaused(false)}
      className="zdog-canvas"
      ref={canvasRef}
    />
  );
};

export default ModuleHeaderAnimation;

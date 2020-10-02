import React, { useEffect, useImperativeHandle, useRef } from "react";

import { DARK_GREY, GREEN } from "../../playground/lesson1/colours";

import Zdog from "zdog";
import Zfont from "zfont";

Zfont.init(Zdog);
const DOSIS = new Zdog.Font({ src: "/open-sans-lat_cyr-600.ttf" });

const TAU = Zdog.TAU;

const viewRotation = new Zdog.Vector();
viewRotation.add({ x: TAU / 6 });
viewRotation.add({ z: TAU / 16 });

let dragStartRX, dragStartRZ;

const animation_speed_factor = 1;

const createNodeLabel = (addTo) =>
  new Zdog.Text({
    addTo,
    font: DOSIS,
    value: ":)",
    fill: true,
    fontSize: 16,
    stroke: false,
    textAlign: "center",
    textBaseline: "bottom",
    color: DARK_GREY.string(),
  });

const createPacketLabel = (addTo) =>
  new Zdog.Text({
    addTo,
    font: DOSIS,
    value: ":)",
    fill: true,
    fontSize: 12,
    stroke: false,
    textAlign: "center",
    textBaseline: "middle",
    color: DARK_GREY.string(),
  });

function randomInterval(min, max) {
  return Math.random() * (max - min + 1) + min;
}

const linkNodes = (state, nodes) => {
  function get_connection_point(node, node_b) {
    let point = {
      x: node.translate.x,
      y: node.translate.y,
    };
    // if (node.translate.x > node_b.translate.x) {
    //     point.x -= node.width/2;
    // } else {
    //     point.x += node.width/2;
    // }
    if (node.translate.y > node_b.translate.y) {
      point.y -= node.height / 2;
    } else {
      point.y += node.height / 2;
    }
    return point;
  }
  let link1 = link.copy();
  let a = get_connection_point(nodes[0], nodes[1]);
  let b = get_connection_point(nodes[1], nodes[0]);
  link1.path = [
    a, // First node
    {
      bezier: [
        { x: a.x, y: b.y }, // First control point
        { x: b.x, y: a.y }, // Second control point
        b, // Second node
      ],
    },
  ];
  link1.updatePath();

  state.links.push(link1);
  state.illo.addChild(link1);
};

const addNode = (state, name, coords = { x: 0, y: 0, z: 0 }, color = GREEN) => {
  let node = network_node.copy();

  let label = createNodeLabel(state.illo);
  label.value = name;
  label.rotate.x = -TAU / 4;
  label.translate = {
    x: coords.x,
    y: coords.y,
    z: coords.z + node.height * 1.9,
  };
  node.leftFace = color.darken(0.3).alpha(0.8).string();
  node.rightFace = color.alpha(0.8).string();
  node.topFace = color.alpha(0.8).string();
  node.bottomFace = color.darken(0.3).alpha(0.8).string();
  node.color = color.darken(0.1).alpha(0.8).string();
  node.name = name;
  node.translate = coords;
  node.translate.z += node.height / 1.5;
  node.label = label;

  state.illo.addChild(node);

  state.networkNodes.push(node);
  state.textElements.push(label);
};

// Cubic bezier pct — 0..1
function getCubicBezierXY(pct, startPt, controlPt1, controlPt2, endPt) {
  var x = CubicN(pct, startPt.x, controlPt1.x, controlPt2.x, endPt.x);
  var y = CubicN(pct, startPt.y, controlPt1.y, controlPt2.y, endPt.y);
  return {
    x: x,
    y: y,
  };
}

function CubicN(pct, a, b, c, d) {
  var t2 = pct * pct;
  var t3 = t2 * pct;
  return (
    a +
    (-a * 3 + pct * (3 * a - a * pct)) * pct +
    (3 * b + pct * (-6 * b + b * 3 * pct)) * pct +
    (c * 3 - c * 3 * pct) * t2 +
    d * t3
  );
}

// Packet format: packet = {progress: 0..1, coords: {x:0, y:0}, speed_factor: 1, link: link object, reverse: true}
// increment = amount in percents (0..1) of the full packet's path
const transferPacket = (packet, increment) => {
  let path = packet.link.path;
  increment = increment * packet.speed_factor * animation_speed_factor;
  if (!packet.reverse && packet.progress + increment > 1) {
    return false;
  }
  if (packet.reverse && packet.progress - increment < 0) {
    return false;
  }

  if (packet.reverse) {
    if (packet.progress > 0) {
      packet.progress -= increment;
    }
  } else {
    if (packet.progress < 1) {
      packet.progress += increment;
    }
  }

  let coords = getCubicBezierXY(
    // Refreshing coords
    packet.progress,
    path[0], // start
    path[1].bezier[0], // cp1
    path[1].bezier[1], // cp2
    path[1].bezier[2] // end
  );
  packet.label.translate = { x: coords.x, y: coords.y, z: packet.height * 2.3 };
  packet.translate = coords;
  return true;
};

const emitPacket = (
  state: State,
  link,
  name: string,
  speed_factor = 1,
  color = DARK_GREY,
  reverse = false
) => {
  const packet = network_packet.copy();

  const label = createPacketLabel(state.illo);
  label.value = name;
  label.rotate.x = -TAU / 4;
  label.translate = { x: 0, y: 0, z: 0 };
  packet.progress = reverse ? 1 : 0;
  packet.speed_factor = speed_factor;
  packet.link = link;
  packet.leftFace = color.alpha(0.5).string();
  packet.rightFace = color.alpha(0.5).string();
  packet.topFace = color.darken(0.1).alpha(0.5).string();
  packet.bottomFace = color.darken(0.2).alpha(0.5).string();
  packet.color = color.darken(0.2).alpha(0.5).string();
  packet.reverse = reverse;
  packet.name = name;
  packet.label = label;

  state.illo.addChild(packet);

  state.packets.push(packet);
  state.textElements.push(label);
};

const link = new Zdog.Shape({
  stroke: 2,
  color: DARK_GREY.string(),
  closed: false,
});

const network_packet = new Zdog.Box({
  width: 8,
  height: 8,
  depth: 8,
  stroke: 1,
  fill: true,
});

const network_node = new Zdog.Box({
  width: 40,
  height: 40,
  depth: 60,
  stroke: 1,
  fill: true,
});

const animate = (state) => {
  state.illo.rotate.set(viewRotation);

  // viewRotation.add({ z: 0.00005 });
  // illo.zoom += 0.0005;

  for (let i = 0; i < state.packets.length; i++) {
    const packet = state.packets[i];

    if (transferPacket(packet, 0.01) == false) {
      state.packets.splice(i, 1);
      state.textElements.splice(state.textElements.indexOf(packet.label), 1);
      state.illo.removeChild(packet);
      state.illo.removeChild(packet.label);
    }
  }

  state.illo.updateRenderGraph();

  if (!state.stopAnimation) {
    requestAnimationFrame(animate.bind(this, state));
  }
};

function initZdog(element) {
  const illo = new Zdog.Illustration({
    element,
    resize: true,
    dragRotate: true,
  });

  new Zdog.Dragger({
    startElement: illo.element,
    onDragStart: function () {
      dragStartRX = viewRotation.x;
      dragStartRZ = viewRotation.z;
    },
    onDragMove: function (pointer, moveX, moveY) {
      const moveRX = (moveY / illo.width) * Zdog.TAU * -1;
      const moveRY = (moveX / illo.width) * Zdog.TAU * -1;
      viewRotation.x = dragStartRX;
      viewRotation.z = dragStartRZ + moveRY / 2;
      // viewRotation.y = dragStartRY + moveRY;
    },
  });

  return illo;
}

const visRender = (domElement, props: VNetVisualizeProps, vnetState: State) => {
  vnetState.illo = initZdog(domElement);

  for (const node of props.nodes) {
    addNode(
      vnetState,
      node.name,
      { x: node.x, y: node.y, z: node.z },
      node.colour
    );
  }

  for (const link of props.links) {
    linkNodes(vnetState, [
      vnetState.networkNodes[link[0]],
      vnetState.networkNodes[link[1]],
    ]);
  }

  animate(vnetState);

  vnetState.illo.updateRenderGraph();
};

interface NodeProps {
  name: string;
  x: number;
  y: number;
  z: number;
  colour: string;
}

interface VNetVisualizeProps {
  nodes: Array<NodeProps>;
  links?: Array<any>;
}

export interface VNetInterface {
  emitPacket: CallableFunction;
}

// Internal state
interface State {
  illo?: any;
  stopAnimation: boolean;
  networkNodes: Array<any>;
  packets: Array<any>;
  links: Array<any>;
  textElements: Array<any>;
  nodes: Array<any>;
}

const VNetVisualize: React.ForwardRefRenderFunction<
  VNetInterface,
  VNetVisualizeProps
> = (props, ref) => {
  const canvasRef = useRef(null);
  const vnetState: React.MutableRefObject<State> = useRef({
    illo: null,
    networkNodes: [],
    packets: [],
    links: [],
    textElements: [],
    nodes: [],
    stopAnimation: false,
  });

  useImperativeHandle(ref, () => ({
    emitPacket: (src, dst, packetNum) => {
      let rev = false;
      let link = vnetState.current.links[0];
      // FIXME: hardcode
      if (src == "1.2.3.4" || src == "10.0.0.42") {
        rev = true;
      } else {
        rev = false;
      }
      if (src == "10.0.0.42" || dst == "10.0.0.42") {
        link = vnetState.current.links[1];
      }
      emitPacket(
        vnetState.current,
        link,
        packetNum.toString(),
        2,
        DARK_GREY,
        rev
      );
    },
    stopAnimation: () => {
      vnetState.current.stopAnimation = true;
    },
  }));

  useEffect(() => {
    if (canvasRef.current && canvasRef.current.offsetParent != null) {
      // make sure the canvas element is visible before we start rendering it.
      visRender(canvasRef.current, props, vnetState.current);
    }
  }, [canvasRef, canvasRef.current && canvasRef.current.offsetParent != null]);

  return <canvas ref={canvasRef} id="zdog-canvas" className="vnet-vis" />;
};

export default React.forwardRef(VNetVisualize);

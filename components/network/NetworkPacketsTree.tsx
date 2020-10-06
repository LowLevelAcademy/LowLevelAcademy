// Component to render a list of network packets.

import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { NetworkPacket } from "./NetworkPacket";
import { Packet } from "../../playground/reducers/virtualNetwork";

export const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  content: {
    transition: "all 0.1s",
    "&$focused, &$selected, &$selected$focused": {
      backgroundColor: `#39be78 !important`,
      color: "white",
    },
  },
  expanded: {},
  selected: {},
  focused: {},
}));

export interface NetworkPacketsProps {
  /**
   * Callback that's triggered when a packet is selected in the tree.
   */
  onPacketSelect?: (event: React.ChangeEvent<{}>, nodeIds: string) => void;
  /**
   * A list of packets to display.
   */
  packets: Array<Packet>;
}

export const NetworkPackets: React.FC<NetworkPacketsProps> = (props) => {
  const classes = useStyles();

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      onNodeSelect={props.onPacketSelect}
    >
      {props.packets.map((packet, num) => (
        <NetworkPacket packet={packet} num={num} key={num.toString()} />
      ))}
    </TreeView>
  );
};

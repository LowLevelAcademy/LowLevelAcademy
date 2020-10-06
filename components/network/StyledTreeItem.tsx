import React from "react";
import TreeItem, { TreeItemProps } from "@material-ui/lab/TreeItem";

import { useStyles } from "./NetworkPacketsTree";

export const StyledTreeItem: React.FC<TreeItemProps> = (props) => {
  const classes = useStyles();
  return (
    <TreeItem
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
      }}
      {...props}
    />
  );
};

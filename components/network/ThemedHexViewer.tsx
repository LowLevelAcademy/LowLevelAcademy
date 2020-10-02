import React from "react";

import HexEditor from "react-hex-editor";
import { HexEditorHandle, HexEditorProps } from "react-hex-editor/dist/types";
import hexEditorTheme from "react-hex-editor/themes";

const COLOUR_ACCENT = "#374246";

export const LOW_LVL_THEME = {
  ...hexEditorTheme,
  colorBackgroundInactiveCursor: COLOUR_ACCENT,
  colorBackgroundInactiveCursorHighlight: COLOUR_ACCENT,
  colorBackgroundInactiveSelection: COLOUR_ACCENT,
  colorBackgroundInactiveSelectionCursor: COLOUR_ACCENT,
  colorBackgroundSelection: COLOUR_ACCENT,
  colorBackgroundSelectionCursor: COLOUR_ACCENT,
  colorTextInactiveCursor: "white",
  colorTextInactiveCursorHighlight: "white",
  colorTextInactiveSelection: "white",
  colorTextInactiveSelectionCursor: "white",
  colorTextSelection: "white",
  colorTextSelectionCursor: "white",
};

// FIXME: this doesn't work properly with forwardRef? Figure out and fix this.
const ThemedHexViewer: React.ForwardRefRenderFunction<
  HexEditorHandle,
  HexEditorProps
> = (props, ref) => {
  return (
    <HexEditor
      ref={ref}
      className="vnet-hex-editor"
      showRowLabels={true}
      readOnly={true}
      showAscii={true}
      theme={{ hexEditor: LOW_LVL_THEME }}
      {...props}
    />
  );
};

ThemedHexViewer.displayName = "ThemedHexViewer";

export default React.memo(React.forwardRef(ThemedHexViewer));

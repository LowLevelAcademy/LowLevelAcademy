import React from "react";

import Playground from "../../playground/Playground";

import { wrapReorderChunks } from "./rust";
import { ChunkedPostcard } from "./ChunksPlayground";
import { EnumeratedChunk } from "./EnumerateChunksPlayground";

export const ReorderChunksPlayground = () => (
  <Playground id="reorderChunks" codeWrapperFn={wrapReorderChunks}>
    <ChunkedPostcard chunkComponent={EnumeratedChunk} />
  </Playground>
);

import dynamic from "next/dynamic";

export const Playground = dynamic(
  () => import("../../playground/Playground").then((mod) => mod.Playground),
  { ssr: false }
);

export const PostcardSketch = dynamic(
  () => import("./PostcardSketch").then((mod) => mod.PostcardSketch),
  { ssr: false }
);

export const ManipulateColorPlayground = dynamic(
  () =>
    import("./ManipulateColorPlayground").then(
      (mod) => mod.ManipulateColorPlayground
    ),
  { ssr: false }
);

export const ChunksPlayground = dynamic(
  () => import("./ChunksPlayground").then((mod) => mod.ChunksPlayground),
  { ssr: false }
);

export const SendChunksPlayground = dynamic(
  () =>
    import("./SendChunksPlayground").then((mod) => mod.SendChunksPlayground),
  { ssr: false }
);

export const OutOfOrderDeliveryPlayground = dynamic(
  () =>
    import("./OutOfOrderDeliveryPlayground").then(
      (mod) => mod.OutOfOrderDeliveryPlayground
    ),
  { ssr: false }
);

export const SortingChunks = dynamic(
  () => import("./SortingChunks").then((mod) => mod.SortingChunks),
  { ssr: false }
);

export const EnumerateChunksPlayground = dynamic(
  () =>
    import("./EnumerateChunksPlayground").then(
      (mod) => mod.EnumerateChunksPlayground
    ),
  { ssr: false }
);

export const ReorderChunksPlayground = dynamic(
  () =>
    import("./ReorderChunksPlayground").then(
      (mod) => mod.ReorderChunksPlayground
    ),
  { ssr: false }
);

export const SendOrderedChunksPlayground = dynamic(
  () =>
    import("./SendOrderedChunksPlayground").then(
      (mod) => mod.SendOrderedChunksPlayground
    ),
  { ssr: false }
);

export const ColorCoding = dynamic(
  () => import("./ColorCoding").then((mod) => mod.ColorCoding),
  { ssr: false }
);

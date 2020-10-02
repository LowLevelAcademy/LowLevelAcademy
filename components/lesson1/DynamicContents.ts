import dynamic from "next/dynamic";

export const Playground = dynamic(
  () => import("../../playground/Playground").then((mod) => mod.Playground),
  { ssr: false }
);
export const FullDemoVis = dynamic(
  () => import("./FullDemoVis").then((mod) => mod.FullDemoVis),
  { ssr: false }
);
export const IpPacketsVis = dynamic(
  () => import("./IpPacketsVis").then((mod) => mod.IpPacketsVis),
  { ssr: false }
);
export const UdpDatagramVis = dynamic(
  () => import("./UdpDatagramVis").then((mod) => mod.UdpDatagramVis),
  { ssr: false }
);
export const DnsRequestForm = dynamic(() => import("./DnsRequestForm"), {
  ssr: false,
});
export const FinalTestPlayground = dynamic(
  () => import("./FinalTestPlayground"),
  { ssr: false }
);

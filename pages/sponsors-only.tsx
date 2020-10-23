import React from "react";
import LessonHeader from "../components/LessonHeader";
import NoScriptBar from "../components/NoScriptBar";
import SponsorsOnly from "../components/SponsorsOnly";

const DATE_AVAILABLE = new Date(2020, 9, 23, 0, 0, 0);

const daysDiff = (a: Date, b: Date) => {
  const d1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const d2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor(Math.abs(d1 - d2) / (24 * 60 * 60 * 1000));
};

export default function PaywallPage() {
  return (
    <>
      <LessonHeader module="TCP/IP Fundamentals" title="Fragmentation" />
      <NoScriptBar />
      <SponsorsOnly
        days={daysDiff(DATE_AVAILABLE, new Date())}
        videoPreview="/previews/fragmentation.mp4"
      />
    </>
  );
}

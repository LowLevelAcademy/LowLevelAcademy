import React from "react";

interface SectionProps {
  kind: string;
}

const Section: React.FC<SectionProps> = ({ kind, children }) =>
  children && (
    <div className={`output-${kind}`}>
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );

export default Section;
